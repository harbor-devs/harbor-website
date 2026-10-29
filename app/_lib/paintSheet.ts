// paintSheet: draws a phone diary page (paper, text, small SVGs, dotted lines) into a
// canvas, reading positions straight from the live page, so the picture matches it exactly.
// The WebGL curl uses this picture as the front of the turning page.
// Draws each letter where the browser put it, so letter spacing and line breaks match.
// No foreignObject trick: Safari blocks that for WebGL.

const imageCache = new Map<string, Promise<HTMLImageElement>>();

// Load an image once, then reuse it
export function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src);
  if (cached) return cached;
  const loading = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
  imageCache.set(src, loading);
  return loading;
}

// The address inside a CSS url(...)
function cssUrl(bg: string): string | null {
  const m = /url\(["']?([^"')]+)["']?\)/.exec(bg);
  return m ? m[1] : null;
}

// Hidden for screen readers only (Tailwind sr-only): tiny box, skip it
function isSrOnly(el: Element): boolean {
  for (let e: Element | null = el; e; e = e.parentElement) {
    const r = e.getBoundingClientRect();
    if (r.width <= 2 && r.height <= 2) return true;
  }
  return false;
}

// sheet: the page element (its background is the paper). texW: picture width in pixels.
export async function paintSheet(sheet: HTMLElement, texW: number): Promise<HTMLCanvasElement> {
  const box = sheet.getBoundingClientRect();
  const k = texW / box.width;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(box.width * k);
  canvas.height = Math.round(box.height * k);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No 2D canvas on this device");
  ctx.scale(k, k);
  ctx.translate(-box.left, -box.top);

  // Paper
  const paper = cssUrl(getComputedStyle(sheet).backgroundImage);
  if (paper) ctx.drawImage(await loadImage(paper), box.left, box.top, box.width, box.height);

  const walker = document.createTreeWalker(sheet, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  const svgs: SVGSVGElement[] = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node instanceof Element) {
      // Small inline SVGs are drawn last, as images
      if (node instanceof SVGSVGElement) {
        svgs.push(node);
        continue;
      }
      if (node instanceof HTMLImageElement && node.complete) {
        const r = node.getBoundingClientRect();
        ctx.drawImage(node, r.left, r.top, r.width, r.height);
      }
      // Dotted / solid bottom border (the contents list dots)
      const cs = getComputedStyle(node);
      const bw = parseFloat(cs.borderBottomWidth);
      if (bw > 0 && cs.borderBottomStyle !== "none") {
        const r = node.getBoundingClientRect();
        ctx.fillStyle = cs.borderBottomColor;
        const y = r.bottom - bw / 2;
        if (cs.borderBottomStyle === "dotted") {
          // Round dots, one dot width apart, like the browser draws them
          const step = bw * 2;
          const count = Math.floor(r.width / step);
          const start = r.left + (r.width - count * step + bw) / 2;
          for (let i = 0; i < count; i++) {
            ctx.beginPath();
            ctx.arc(start + i * step, y, bw / 2, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          ctx.fillRect(r.left, r.bottom - bw, r.width, bw);
        }
      }
    } else if (node instanceof Text) {
      const el = node.parentElement;
      if (!el || el.closest("svg") || isSrOnly(el)) continue;
      const text = node.data;
      if (!text.trim()) continue;
      const cs = getComputedStyle(el);
      ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      ctx.fillStyle = cs.color;
      ctx.textBaseline = "alphabetic";
      const upper = cs.textTransform === "uppercase";
      const range = document.createRange();
      for (let i = 0; i < text.length; i++) {
        let ch = text[i];
        if (ch === " " || ch === "\n") continue;
        // Keep surrogate pairs (emoji and such) together
        let len = 1;
        if (/[\uD800-\uDBFF]/.test(ch) && i + 1 < text.length) {
          ch += text[i + 1];
          len = 2;
        }
        range.setStart(node, i);
        range.setEnd(node, i + len);
        const r = range.getClientRects()[0];
        i += len - 1;
        if (!r || r.width === 0) continue;
        const glyph = upper ? ch.toUpperCase() : ch;
        const m = ctx.measureText(glyph);
        const a = m.fontBoundingBoxAscent;
        const d = m.fontBoundingBoxDescent;
        const baseline = r.top + (r.height - (a + d)) / 2 + a;
        ctx.fillText(glyph, r.left, baseline);
      }
    }
  }

  // Small inline SVGs (the flourish): draw them as images, in their ink color
  for (const svg of svgs) {
    const r = svg.getBoundingClientRect();
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", String(r.width));
    clone.setAttribute("height", String(r.height));
    clone.setAttribute("color", getComputedStyle(svg).color);
    const src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(clone));
    const img = await loadImage(src);
    ctx.drawImage(img, r.left, r.top, r.width, r.height);
  }

  return canvas;
}
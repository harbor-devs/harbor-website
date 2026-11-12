// paintSheet: draws a phone diary page (paper, text, small SVGs, dotted lines) into a
// canvas, reading positions straight from the live page, so the picture matches it exactly.
// The WebGL curl uses this picture as the front of the turning page.
// Draws each letter where the browser put it, so letter spacing and line breaks match.
// No foreignObject trick: Safari blocks that for WebGL.

import { FIBERS, NOISE, STAIN } from "./paperTextures";

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

// A CSS angle like "-2.5deg" in radians (0 for "none")
function radians(v: string): number {
  const n = parseFloat(v);
  return Number.isFinite(n) ? (n * Math.PI) / 180 : 0;
}

// A length from a clip-path ("12%" or "0px") in px of a box side
function toPx(v: string, size: number): number {
  return v.endsWith("%") ? (parseFloat(v) / 100) * size : parseFloat(v);
}

// Corner points of a CSS polygon() clip-path for a w x h box
function polygonPoints(clip: string, w: number, h: number): [number, number][] {
  const m = /polygon\((.*)\)/.exec(clip);
  if (!m) return [[0, 0], [w, 0], [w, h], [0, h]];
  return m[1].split(",").map((pair) => {
    const [x, y] = pair.trim().split(/\s+/);
    return [toPx(x, w), toPx(y, h)];
  });
}

function tracePath(ctx: CanvasRenderingContext2D, pts: [number, number][]) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
  ctx.closePath();
}

// A taped note from DeskNotes (Now chapter). The canvas can't read CSS backgrounds,
// so its paper, textures, dark edges, shadow and tape are drawn here by hand.
// k: canvas pixels per screen pixel (shadows ignore the canvas scale, so they need it).
async function paintNote(ctx: CanvasRenderingContext2D, slot: HTMLElement, k: number) {
  const paper = slot.querySelector<HTMLElement>("[data-paint-paper]");
  if (!paper) return;
  const [noise, stain, fibers] = await Promise.all([loadImage(NOISE), loadImage(STAIN), loadImage(FIBERS)]);

  const box = slot.getBoundingClientRect(); // its centre is the note's centre, even tilted
  const tilt = radians(getComputedStyle(slot).rotate);
  const w = paper.offsetWidth;
  const h = paper.offsetHeight;
  const ps = getComputedStyle(paper);
  const torn = polygonPoints(ps.clipPath, w, h);

  // ---- Paper ----
  ctx.save();
  ctx.translate(box.left + box.width / 2, box.top + box.height / 2);
  ctx.rotate(tilt);
  ctx.translate(-w / 2, -h / 2);

  // Paper colour, with the same soft shadow as the CSS drop-shadow
  const shadow = /drop-shadow\((rgba?\([^)]*\))\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+([\d.]+)px/.exec(
    getComputedStyle(slot).filter,
  );
  if (shadow) {
    ctx.shadowColor = shadow[1];
    ctx.shadowOffsetX = parseFloat(shadow[2]) * k;
    ctx.shadowOffsetY = parseFloat(shadow[3]) * k;
    ctx.shadowBlur = parseFloat(shadow[4]) * k;
  }
  tracePath(ctx, torn);
  ctx.fillStyle = ps.backgroundColor;
  ctx.fill();
  ctx.shadowColor = "transparent";

  // Everything else stays inside the torn shape
  ctx.clip();

  // Light middle, dark edges (the CSS radial-gradient)
  ctx.save();
  ctx.translate(w / 2, h / 2);
  ctx.scale(1, h / w);
  const reach = (w / 2) * Math.SQRT2;
  const edges = ctx.createRadialGradient(0, 0, 0, 0, 0, reach);
  edges.addColorStop(0, "rgba(255, 240, 205, 0.18)");
  edges.addColorStop(0.55, "rgba(255, 240, 205, 0)");
  edges.addColorStop(0.55, "rgba(70, 38, 10, 0)");
  edges.addColorStop(1, "rgba(70, 38, 10, 0.5)");
  ctx.fillStyle = edges;
  ctx.fillRect(-reach, -reach, reach * 2, reach * 2);
  ctx.restore();

  // Grain, fibres, stains (bottom to top, same order as the CSS)
  for (const img of [noise, fibers, stain]) {
    const pattern = ctx.createPattern(img, "repeat");
    if (!pattern) continue;
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.restore();

  // ---- Tape, on top of the paper ----
  const tape = slot.querySelector<HTMLElement>("[data-paint-tape]");
  if (!tape) return;
  const ts = getComputedStyle(tape);
  const tw = tape.offsetWidth;
  const th = tape.offsetHeight;

  ctx.save();
  ctx.translate(box.left + box.width / 2, box.top + box.height / 2);
  ctx.rotate(tilt);
  // From the note's centre to the tape's centre, then the tape's own tilt
  ctx.translate(tape.offsetLeft + tw / 2 - slot.offsetWidth / 2, tape.offsetTop + th / 2 - slot.offsetHeight / 2);
  ctx.rotate(radians(ts.rotate));
  ctx.translate(-tw / 2, -th / 2);
  tracePath(ctx, polygonPoints(ts.clipPath, tw, th));
  ctx.fillStyle = ts.backgroundColor;
  ctx.fill();
  ctx.clip();
  const grain = ctx.createPattern(noise, "repeat");
  if (grain) {
    ctx.fillStyle = grain;
    ctx.fillRect(0, 0, tw, th);
  }
  ctx.restore();
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
      // Desk notes: paper and tape first, their text gets drawn on top as usual
      if (node instanceof HTMLElement && node.dataset.paintSlot !== undefined) {
        await paintNote(ctx, node, k);
      }
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
      // Links on the page (category and contents names) have a soft underline: draw it too
      const underline = cs.textDecorationLine.includes("underline");
      const ulOffset = parseFloat(cs.textUnderlineOffset) || 2;
      const ulThick = parseFloat(cs.textDecorationThickness) || 1;
      const ulColor = cs.textDecorationColor;
      // Text on a tilted desk note leans with it
      const noteSlot = el.closest<HTMLElement>("[data-paint-slot]");
      const lean = noteSlot ? radians(getComputedStyle(noteSlot).rotate) : 0;
      const range = document.createRange();
      for (let i = 0; i < text.length; i++) {
        let ch = text[i];
        if (ch === "\n") continue;
        // Spaces are skipped, unless the text is underlined (the line runs under them too)
        if (ch === " " && !underline) continue;
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
        if (lean) {
          if (ch === " ") continue;
          // Spin the letter around its own centre
          ctx.save();
          ctx.translate(r.left + r.width / 2, r.top + r.height / 2);
          ctx.rotate(lean);
          ctx.fillText(glyph, -m.width / 2, (a - d) / 2);
          ctx.restore();
          continue;
        }
        const baseline = r.top + (r.height - (a + d)) / 2 + a;
        if (underline) {
          ctx.fillStyle = ulColor;
          ctx.fillRect(r.left, baseline + ulOffset, r.width, ulThick);
          ctx.fillStyle = cs.color;
        }
        if (ch !== " ") ctx.fillText(glyph, r.left, baseline);
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
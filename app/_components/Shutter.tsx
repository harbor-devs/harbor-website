"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { createShutterGL } from "../_lib/shutterGL";
import styles from "./Shutter.module.css";

// A camera shutter with real lens blades that covers the whole screen.
// 1. The site starts shut while the pictures you will see load, then the blades open.
// 2. Going between the book and a category page: the blades snap shut, the page swaps, they open.
// Page flips inside the book never trigger it. Reduced motion = a plain fade.
// The first paint is a still drawing (below), then WebGL takes over and does the moving.

const N = 8;
const LAST = N - 1;
const SHUT = 0; // blade angle when fully shut: all edges meet exactly in the middle

// The hole grows at an even pace from shut until the whole screen is clear
const FIRST_OPEN_MS = 1500;
const CLOSE_MS = 600;
const HOLD_MS = 250;
const PAGE_OPEN_MS = 1200;
const FADE_MS = 250;
const MAX_WAIT_MS = 4000; // never stay shut longer than this, even if a picture hangs

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeIn = (t: number) => t * t;

// Still drawing for the very first paint (before JavaScript runs). Same blades as the WebGL one.
const R = 150; // pin circle in drawing units; "slice" below makes it 0.75 x the longer screen side
const BODY = `M ${-R} 0 L ${2 * R} 0 L ${2 * R} ${2 * R} L ${-R} ${2 * R} Z`;
const EDGE = `M ${-R} 0 L ${2 * R} 0`;
function place(i: number) {
  const th = (i * 2 * Math.PI) / N;
  const deg = ((th + Math.PI + SHUT) * 180) / Math.PI;
  return `translate(${(R * Math.cos(th)).toFixed(3)} ${(R * Math.sin(th)).toFixed(3)}) rotate(${deg.toFixed(3)})`;
}
function StillBlade({ i }: { i: number }) {
  return (
    <g transform={place(i)}>
      <path d={BODY} fill="url(#shutter-metal)" />
      <path d={EDGE} className={styles.brass} />
    </g>
  );
}

// Category pages live at /portfolio/<category>; everything else is the book
const isBoard = (path: string) => /^\/portfolio\/[^/]+/.test(path);
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

// Where the hole should open: the middle of the book, not just the middle of the screen.
// Cover page: the cover's paper face (marked data-shutter-center in ClosedBook.tsx).
// Book pages on laptop: the open book's board. Anything else: the screen center.
function aimPoint(path: string, w: number, h: number) {
  const box = (selector: string) =>
    Array.from(document.querySelectorAll<HTMLElement>(selector))
      .map((el) => el.getBoundingClientRect())
      .find((r) => r.width > 0 && r.height > 0);
  const r = (path === "/" ? box("[data-shutter-center]") : undefined) ?? box('[data-part="board"]');
  if (!r) return { x: 0, y: 0 };
  const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));
  return { x: clamp(r.left + r.width / 2 - w / 2, w * 0.25), y: clamp(r.top + r.height / 2 - h / 2, h * 0.25) };
}

// The pictures the visitor sees first on this page, so nothing pops in after the blades open
function picturesFor(path: string) {
  const laptop = window.matchMedia("(min-width: 900px)").matches;
  const list = [laptop ? "/textures/desk-laptop.webp" : "/textures/desk-phone.webp"];
  if (isBoard(path)) return [...list, "/textures/wood-wall.webp"];
  list.push("/textures/cover.webp");
  if (laptop) {
    list.push("/textures/paper-spread.webp");
  } else {
    const chapter = path.split("/")[1];
    const name = chapter === "introduction" ? "intro" : chapter;
    if (["intro", "portfolio", "services", "now", "sketchbook"].includes(name)) {
      list.push(`/textures/page-phone-${name}.webp`);
    }
  }
  return list;
}

// Waits for the fonts and those pictures, but never longer than MAX_WAIT_MS
function ready(path: string) {
  const pictures = picturesFor(path).map((src) => {
    const img = new Image();
    img.src = src;
    return img.decode().catch(() => {});
  });
  const fonts = document.fonts ? document.fonts.ready.then(() => {}) : Promise.resolve();
  return Promise.race([Promise.all([...pictures, fonts]).then(() => {}), wait(MAX_WAIT_MS)]);
}

export default function Shutter() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const gl = createShutterGL(canvas);
    let alive = true;
    let busy = true; // true while the shutter is moving or shut
    let onBoard = isBoard(location.pathname);

    // aim = where the hole should end up (the book), how big the blades are, how wide the hole must get.
    // pos = where the hole is centered right now. It starts at the screen center (same as the
    // still drawing) and glides over to the book while opening, so nothing jumps.
    let aim = { x: 0, y: 0, r: 1, reach: 1 };
    let pos = { x: 0, y: 0 };
    const measure = () => {
      const w = canvas.clientWidth || window.innerWidth;
      const h = canvas.clientHeight || window.innerHeight;
      const c = aimPoint(location.pathname, w, h);
      const corners = [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([sx, sy]) => Math.hypot((sx * w) / 2 - c.x, (sy * h) / 2 - c.y));
      const shift = Math.max(Math.hypot(c.x, c.y), Math.hypot(pos.x, pos.y));
      aim = { x: c.x, y: c.y, r: Math.max(w, h) * 0.75 + shift, reach: Math.max(...corners) + 4 };
    };

    // size = how far each blade edge is from the hole center (px). 0 = shut.
    let size = 0;
    const shutSize = () => aim.r * Math.sin(SHUT);
    const draw = (s: number) => {
      size = s;
      const angle = Math.asin(Math.max(-1, Math.min(1, s / aim.r)));
      gl?.draw(angle, pos.x, pos.y, aim.r);
    };
    if (gl) {
      measure();
      draw(shutSize());
      root.dataset.gl = "on"; // WebGL has drawn, the still drawing can go
    }

    // glide: move the hole center from where it is to the book during the first 60% of the move
    const swing = (from: number, to: number, ms: number, ease: (t: number) => number, glide = false) =>
      new Promise<void>((done) => {
        const start = performance.now();
        const p0 = { ...pos };
        const step = (now: number) => {
          if (!alive) return done();
          const t = Math.min(1, (now - start) / ms);
          if (glide) {
            const g = easeInOut(Math.min(1, t / 0.6));
            pos = { x: p0.x + (aim.x - p0.x) * g, y: p0.y + (aim.y - p0.y) * g };
          }
          draw(from + (to - from) * ease(t));
          if (t < 1) requestAnimationFrame(step);
          else done();
        };
        requestAnimationFrame(step);
      });

    const fade = async (from: number, to: number) => {
      const a = root.animate([{ opacity: from }, { opacity: to }], { duration: FADE_MS, easing: "ease", fill: "forwards" });
      await a.finished.catch(() => {});
      root.style.opacity = String(to);
      a.cancel();
    };

    const show = () => {
      root.dataset.open = "false";
    };
    const hide = () => {
      root.dataset.open = "true";
      root.style.opacity = "";
    };
    const plain = () => reduced.matches || !gl; // no blades moving: just fade

    const open = async (ms: number) => {
      if (plain()) {
        await fade(1, 0);
      } else {
        measure(); // the page has settled now, so aim at where the book really is
        await swing(shutSize(), aim.reach, ms, easeInOut, true);
      }
      hide();
    };

    const close = async () => {
      if (plain()) {
        root.style.opacity = "0";
        show();
        await fade(0, 1);
      } else {
        show();
        measure();
        pos = { x: aim.x, y: aim.y }; // close onto this page's book
        draw(aim.reach);
        await swing(aim.reach, shutSize(), CLOSE_MS, easeIn);
      }
    };

     // Lets the page finish setting itself up, so the opening is not fighting it for the first frames.
    // Waits until the browser is free (up to 1 second), then two more frames.
    const settle = async () => {
      await new Promise<void>((r) =>
        "requestIdleCallback" in window ? requestIdleCallback(() => r(), { timeout: 1000 }) : setTimeout(r, 300),
      );
      await frame();
      await frame();
    };
    // 1. First opening of the site. When done, tell PreloadTextures it can start downloading.
    ready(location.pathname).then(async () => {
      if (!alive) return;
      await settle();
      if (!alive) return;
      await open(FIRST_OPEN_MS);
      busy = false;
      document.documentElement.dataset.shutterOpen = "true";
      window.dispatchEvent(new Event("harbor:shutter-open"));
    });

    // Redraw at the new size if the window or phone is turned while shut
    const onResize = () => {
      if (root.dataset.open === "true" || !gl) return;
      measure();
      draw(size);
    };

    // 2. Clicking a link that goes between the book and a category page
    const goTo = async (href: string, target: string) => {
      busy = true;
      const pictures = ready(target); // start loading the next page's pictures while closing
      await close();
      if (!alive) return;
      router.push(href);
      onBoard = isBoard(target);
      const start = performance.now();
      while (location.pathname !== target && performance.now() - start < MAX_WAIT_MS) await frame();
      await Promise.all([pictures, wait(HOLD_MS)]);
      await settle();
      if (!alive) return;
      await open(PAGE_OPEN_MS);
      busy = false;
    };

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      if (isBoard(url.pathname) === isBoard(location.pathname)) return; // same side: normal behavior
      e.preventDefault(); // Next.js links skip their own navigation when this is set
      if (busy) return;
      void goTo(url.pathname + url.search + url.hash, url.pathname);
    };

    // 3. Browser back/forward between the book and a category page:
    // the page has already changed, so shut at once and open
    const onPop = async () => {
      const nowBoard = isBoard(location.pathname);
      if (nowBoard === onBoard) return;
      onBoard = nowBoard;
      if (busy) return;
      busy = true;
      show();
      if (gl) {
        measure();
        draw(shutSize());
      }
      await Promise.all([ready(location.pathname), wait(HOLD_MS)]);
      await settle();
      if (!alive) return;
      await open(PAGE_OPEN_MS);
      busy = false;
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPop);
    window.addEventListener("resize", onResize);
    return () => {
      alive = false;
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("resize", onResize);
      gl?.destroy();
    };
  }, [router]);

  return (
    <div id="harbor-shutter" ref={rootRef} className={styles.shutter} data-open="false" aria-hidden="true">
      {/* Without JavaScript the shutter could never open, so it is not shown at all */}
      <noscript>
        <style>{"#harbor-shutter{display:none}"}</style>
      </noscript>

      {/* Still drawing for the first paint. "slice" makes it cover any screen shape. */}
      <svg viewBox="-100 -100 200 200" preserveAspectRatio="xMidYMid slice" className={styles.still}>
        <defs>
          <linearGradient id="shutter-metal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4a3727" />
            <stop offset="0.08" stopColor="#3a2a1d" />
            <stop offset="0.5" stopColor="#2a1f14" />
            <stop offset="1" stopColor="#1e160e" />
          </linearGradient>
          <clipPath id="shutter-last">
            <path d={BODY} transform={place(LAST)} />
          </clipPath>
        </defs>
        {Array.from({ length: N }, (_, i) => (
          <StillBlade key={i} i={i} />
        ))}
        {/* Real blades overlap in a circle, so the last blade sits under the first ones */}
        <g clipPath="url(#shutter-last)">
          {Array.from({ length: N / 2 - 1 }, (_, i) => (
            <StillBlade key={i} i={i} />
          ))}
        </g>
      </svg>

      {/* The moving shutter, drawn by WebGL */}
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
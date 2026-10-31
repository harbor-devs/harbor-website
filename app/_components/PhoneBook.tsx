"use client";

import { useEffect, useEffectEvent, useRef, useState, type ReactNode } from "react";
import { CHAPTERS, type ChapterSlug } from "../_lib/chapters";
import { PAGE_H, PAGE_W, PageCurl, REGION, endX, type Point } from "../_lib/pageCurl";
import { loadImage, paintSheet } from "../_lib/paintSheet";
import PhoneCoverLeaf, { type CoverSwing } from "./PhoneCoverLeaf";
import styles from "./PhoneBook.module.css";

// Each chapter has its own stain pattern baked into its paper image.
const PAPER: Record<ChapterSlug, string> = {
  introduction: "/textures/page-phone-intro.webp",
  portfolio: "/textures/page-phone-portfolio.webp",
  services: "/textures/page-phone-services.webp",
  now: "/textures/page-phone-now.webp",
  sketchbook: "/textures/page-phone-sketchbook.webp",
  contact: "/textures/page-phone-contact.webp",
};

type PhoneBookProps = {
  pages: ReactNode[]; // every chapter's phone page, in reading order
  index: number; // the chapter the URL wants
  onUserTurn: (index: number) => void; // the visitor turned a page by hand
  onArrive?: (index: number) => void; // the page that's showing now (on mount and after each turn)
  header?: ReactNode;
  footer?: ReactNode;
  cover?: CoverSwing | null; // the front cover on top (only while it moves or is held)
  // First page, swiping right: the finger grabs the front cover to close it.
  // Null when closing isn't allowed right now.
  onGrabCover?: ((e: PointerEvent, startX: number) => void) | null;
    // Last page, swiping left: the finger grabs the back cover to close it.
  // Null when closing isn't allowed right now.
  onGrabBack?: ((e: PointerEvent, startX: number) => void) | null;
};

const BOTTOM: Point = { x: PAGE_W, y: PAGE_H };
const TOP: Point = { x: PAGE_W, y: 0 };
const END_X = endX();
const TURN_MS = 900; // one normal turn
const RIFFLE_MS = 350; // each turn while skipping through several chapters
const HINT_FIRST_MS = 900; // first corner peek after the page is ready
const HINT_EVERY_MS = 4000; // then again every 4s

// The corner peek stops for the whole visit after the first touch or turn
let hintDone = false;

const linear = (t: number) => t;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

type Anim = {
  points: Point[];
  lens: number[];
  total: number;
  ms: number;
  ease: (t: number) => number;
  start: number;
  onEnd: () => void;
};

type Turn = {
  dir: 1 | -1; // 1 = next, -1 = previous
  C: Point; // the corner being pulled
  T: Point; // where the corner is now
  anim: Anim | null;
  peek: boolean; // just the hint, not a real turn
  byHand: boolean; // the visitor is dragging it
};

type Drag = {
  id: number;
  start: Point;
  sx: number; // where the finger went down (screen px)
  last: Point;
  lastT: number;
  vx: number;
  dir: 0 | 1 | -1;
  C: Point;
  plain: boolean; // no WebGL: just swap pages on release
};

// The phone diary: one page at a time, turned with the WebGL curl.
// Same rule as the laptop: the URL is the boss. Turning by hand changes the URL,
// and a URL change (bottom bar, menu, Back) turns the page to match.
export default function PhoneBook({
  pages,
  index,
  onUserTurn,
  onArrive,
  header,
  footer,
  cover,
  onGrabCover,
  onGrabBack,
}: PhoneBookProps) {
  const pageRef = useRef<HTMLElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<HTMLDivElement>(null);
  const curlRef = useRef<HTMLDivElement>(null);
  const sheetRefs = useRef<(HTMLDivElement | null)[]>([]);
  // The page showing when this first appears. After that our code swaps pages itself.
  const [startIndex] = useState(index);
  // The turn engine's "go to the URL's page" command, set up below
  const api = useRef<{ goTo: () => void } | null>(null);

  const getTarget = useEffectEvent(() => index);
  const userTurned = useEffectEvent((i: number) => onUserTurn(i));
  const arrived = useEffectEvent((i: number) => onArrive?.(i));
  // The cover is swinging: hold heavy work so the swing stays smooth
  const coverMoving = useEffectEvent(() => !!cover);
  // Hand the finger to the front cover. False if closing isn't allowed right now.
  const grabFront = useEffectEvent((e: PointerEvent, startX: number) => {
    if (!onGrabCover) return false;
    onGrabCover(e, startX);
    return true;
  });
  // Same for the back cover
  const grabBack = useEffectEvent((e: PointerEvent, startX: number) => {
    if (!onGrabBack) return false;
    onGrabBack(e, startX);
    return true;
  });
  useEffect(() => {
    const page = pageRef.current;
    const box = boxRef.current;
    const host = glRef.current;
    if (!page || !box || !host) return;
    const sheets = sheetRefs.current.filter((s): s is HTMLDivElement => s !== null);
    const last = sheets.length - 1;

    // Made here (not by React) so each visit gets a fresh WebGL canvas
    const canvas = document.createElement("canvas");
    canvas.className = styles.gl;
    host.appendChild(canvas);

    let engine: PageCurl | null = null;
    let noWebGL = false;
    let u = 1; // 1 canvas px in screen px
    let shown = getTarget(); // the page showing right now
    const tex: HTMLCanvasElement[] = [];
    const paper: HTMLImageElement[] = [];
    let ready = false;
    let turn: Turn | null = null;
    let drag: Drag | null = null;
    let raf = 0;
    let hintTimer = 0;
    let paintTimer = 0;
    let hintStarted = false;
    let alive = true;
    let suppressClick = false;

    // Tell the book where we start
    arrived(shown);

    const now = () => performance.now();
    const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const show = (i: number) => sheets.forEach((s, j) => s.toggleAttribute("data-on", j === i));
    const canAnimate = () => !!engine && ready && !reduced();

    // ---- size ----
    function layout(): boolean {
      const w = page!.getBoundingClientRect().width;
      if (w === 0) return false; // hidden (laptop width)
      u = w / PAGE_W;
      if (!engine && !noWebGL) {
        try {
          engine = new PageCurl(canvas);
        } catch {
          noWebGL = true; // old phone: pages just swap
        }
      }
      const R = REGION;
      Object.assign(canvas.style, {
        left: `${R.x0 * u}px`,
        top: `${R.y0 * u}px`,
        width: `${(R.x1 - R.x0) * u}px`,
        height: `${(R.y1 - R.y0) * u}px`,
      });
      engine?.resize((R.x1 - R.x0) * u, (R.y1 - R.y0) * u, Math.min(devicePixelRatio, 2.5));
      return true;
    }

    // Take a picture of every page for the curl (again after a size change)
    async function paint() {
      if (!layout() || noWebGL) return;
      await document.fonts.ready;
      await Promise.all(Array.from(document.fonts, (f) => f.load().catch(() => {})));
      const texW = Math.min(Math.round(PAGE_W * u * Math.min(devicePixelRatio, 2.5)), 1100);
      for (let i = 0; i < sheets.length; i++) {
        const t = await paintSheet(sheets[i], texW);
        const p = await loadImage(PAPER[CHAPTERS[i].slug]);
        if (!alive) return;
        tex[i] = t;
        paper[i] = p;
      }
      ready = true;
      if (!hintStarted && !hintDone) {
        hintStarted = true;
        hintTimer = window.setTimeout(hintLoop, HINT_FIRST_MS);
      }
    }

    // Paint soon, but never while the cover is swinging (it's heavy work)
    function schedulePaint(ms: number) {
      window.clearTimeout(paintTimer);
      paintTimer = window.setTimeout(() => {
        if (!alive) return;
        if (coverMoving()) schedulePaint(250);
        else paint();
      }, ms);
    }

    const resizer = new ResizeObserver(() => {
      layout();
      schedulePaint(150);
    });
    resizer.observe(page);

    // ---- drawing loop (only runs while something moves) ----
    function frame() {
      raf = 0;
      const t0 = turn;
      if (!t0 || !t0.anim || !engine) return;
      const a = t0.anim;
      const t = Math.min((now() - a.start) / a.ms, 1);
      t0.T = at(a, t);
      engine.draw(t0.C, t0.T);
      if (t >= 1) {
        t0.anim = null;
        a.onEnd();
      }
      if (turn?.anim && !raf) raf = requestAnimationFrame(frame);
    }

    // Move the corner along a list of points, at a steady speed (like the laptop)
    function animate(points: Point[], ms: number, ease: (t: number) => number, onEnd: () => void) {
      if (!turn) return;
      const lens = [0];
      for (let i = 1; i < points.length; i++) {
        lens.push(lens[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y));
      }
      turn.anim = { points, lens, total: lens[lens.length - 1], ms, ease, start: now(), onEnd };
      if (!raf) raf = requestAnimationFrame(frame);
    }

    function at(a: Anim, t: number): Point {
      const s = a.ease(t) * a.total;
      let i = 1;
      while (i < a.lens.length - 1 && a.lens[i] < s) i++;
      const seg = a.lens[i] - a.lens[i - 1] || 1;
      const k = Math.min(Math.max((s - a.lens[i - 1]) / seg, 0), 1);
      const p = a.points[i - 1];
      const q = a.points[i];
      return { x: p.x + (q.x - p.x) * k, y: p.y + (q.y - p.y) * k };
    }

    // ---- the turn ----
    function begin(dir: 1 | -1, C: Point, byHand: boolean) {
      if (!engine) return;
      const i = dir > 0 ? shown : shown - 1;
      engine.setPage(tex[i], paper[i]);
      turn = { dir, C, T: dir > 0 ? { ...C } : { x: END_X, y: C.y }, anim: null, peek: false, byHand };
      engine.draw(turn.C, turn.T);
      canvas.toggleAttribute("data-on", true);
      // Same frame: the page under the turning one
      if (dir > 0) show(shown + 1);
    }

    // Stop the curl and show the flat page again
    function reset() {
      turn = null;
      show(shown);
      canvas.toggleAttribute("data-on", false);
      engine?.clear();
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    }

    function finish(done: boolean) {
      const t = turn;
      if (!t) return;
      if (done) shown += t.dir;
      reset();
      if (done) arrived(shown);
      // Turned by hand: the URL catches up. Otherwise keep going toward the URL.
      if (t.byHand && done) userTurned(shown);
      else goTo();
    }

    function turnNext(ms: number) {
      begin(1, BOTTOM, false);
      const m = PAGE_H / 10;
      animate([BOTTOM, { x: PAGE_W - m, y: PAGE_H - m }, { x: END_X, y: PAGE_H }], ms, linear, () => finish(true));
    }

    function turnPrev(ms: number) {
      begin(-1, BOTTOM, false);
      const m = PAGE_H / 10;
      animate([{ x: END_X, y: PAGE_H }, { x: PAGE_W - m, y: PAGE_H - m }, BOTTOM], ms, linear, () => finish(true));
    }

    // The waiting rule (same as laptop): one turn at a time toward the URL's page.
    // When it ends, this runs again, so big jumps become a riffle.
    function goTo() {
      const target = getTarget();
      if (target === shown) return;
      stopHint();
      if (turn || drag?.dir) return; // busy: runs again when the turn ends
      if (!canAnimate()) {
        shown = target;
        show(shown);
        arrived(shown);
        return;
      }
      const ms = Math.abs(target - shown) > 1 ? RIFFLE_MS : TURN_MS;
      if (target > shown) turnNext(ms);
      else turnPrev(ms);
    }
    api.current = { goTo };

    // ---- the corner peek hint ----
    function stopHint() {
      hintDone = true;
      window.clearTimeout(hintTimer);
      if (turn?.peek) reset();
    }

    function hintLoop() {
      if (hintDone || !alive) return;
      peek();
      hintTimer = window.setTimeout(hintLoop, HINT_EVERY_MS);
    }

    // The corner lifts a little and settles: shows the page can be folded
    function peek() {
      if (turn || drag || !canAnimate() || shown >= last) return;
      begin(1, BOTTOM, false);
      // begin() just set the turn, but TypeScript can't see that, so look again
      const started = turn as Turn | null;
      if (!started) return;
      started.peek = true;
      const up = { x: PAGE_W - 30, y: PAGE_H - 22 };
      animate([BOTTOM, up], 520, easeOut, () => {
        animate([up, up], 260, linear, () => {
          animate([up, BOTTOM], 520, easeInOut, () => finish(false));
        });
      });
    }

    // ---- dragging ----
    function toPage(e: PointerEvent): Point {
      const r = page!.getBoundingClientRect();
      return { x: (e.clientX - r.left) / u, y: (e.clientY - r.top) / u };
    }

    function onDown(e: PointerEvent) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      suppressClick = false;
      stopHint();
      if (turn) return;
      const p = toPage(e);
      drag = {
        id: e.pointerId,
        start: p,
        sx: e.clientX,
        last: p,
        lastT: now(),
        vx: 0,
        dir: 0,
        C: BOTTOM,
        plain: false,
      };
    }

    function onMove(e: PointerEvent) {
      const d = drag;
      if (!d || e.pointerId !== d.id) return;
      const p = toPage(e);
      const dx = p.x - d.start.x;
      const dy = p.y - d.start.y;
      const t = now();
      const dt = Math.max(t - d.lastT, 1);
      d.vx = d.vx * 0.6 + ((p.x - d.last.x) / dt) * 0.4;
      d.last = p;
      d.lastT = t;

      if (!d.dir) {
        if (Math.abs(dx) < 6) return; // a tap, not a drag (yet)
        const dir = dx < 0 ? 1 : -1;
        if ((dir > 0 && shown >= last) || (dir < 0 && shown <= 0)) {
          drag = null;
          // First page, swiping right: no page to turn back, so the front cover
          // comes over instead (it follows the finger from here, on window)
          if (dir < 0 && shown === 0 && getTarget() === 0 && grabFront(e, d.sx)) suppressClick = true;
                    // Last page, swiping left: the back cover comes over instead
          if (dir > 0 && shown === last && getTarget() === last && grabBack(e, d.sx)) suppressClick = true;
          return;
        }
        d.dir = dir;
        // Now it's a drag: keep the finger, and don't let it click a link on release
        box!.setPointerCapture(e.pointerId);
        suppressClick = true;
        if (!canAnimate()) {
          d.plain = true;
          return;
        }
        d.C = d.start.y > PAGE_H / 2 ? BOTTOM : TOP;
        begin(dir, d.C, true);
      }
      if (d.plain || !turn || !engine) return;

      const C = d.C;
      const sign = C.y > 0 ? -1 : 1; // which way "up into the page" is
      if (d.dir > 0) {
        // Grabbing near the corner: it follows the finger. Further in: it moves a bit faster.
        const k = 1 + 0.7 * ((PAGE_W - d.start.x) / PAGE_W);
        const lift = Math.min(Math.max(dy * sign, -6), PAGE_H * 0.32);
        turn.T = { x: Math.min(C.x + dx * k, C.x - 0.5), y: C.y + lift * sign };
      } else {
        const s = Math.min(Math.max((dx * 1.4) / PAGE_W, 0), 1);
        const lift = Math.sin(s * Math.PI) * PAGE_H * 0.08;
        turn.T = { x: END_X + (C.x - END_X) * s, y: C.y + lift * sign };
      }
      engine.draw(C, turn.T);
    }

    function onUp(e: PointerEvent) {
      const d = drag;
      if (!d || e.pointerId !== d.id) return;
      drag = null;
      if (!d.dir) return;

      // No WebGL: a long enough swipe just goes to the next/previous page
      if (d.plain) {
        if (Math.abs(d.last.x - d.start.x) > 40) userTurned(shown + d.dir);
        return;
      }
      if (!turn) return;

      const C = turn.C;
      const T = turn.T;
      const far = { x: END_X, y: C.y };
      const done = d.dir > 0 ? T.x < PAGE_W * 0.5 || d.vx < -0.35 : T.x > (END_X + C.x) * 0.45 || d.vx > 0.35;
      const target = d.dir > 0 ? (done ? far : C) : done ? C : far;
      const dist = Math.hypot(target.x - T.x, target.y - T.y);
      const ms = Math.max(220, (dist / (C.x - END_X)) * TURN_MS * 1.1);
      animate([T, target], ms, easeOut, () => finish(done));
    }

    // After a drag, the release must not count as a tap on a link
    function onClick(e: MouseEvent) {
      if (!suppressClick) return;
      suppressClick = false;
      e.preventDefault();
      e.stopPropagation();
    }

    box.addEventListener("pointerdown", onDown);
    box.addEventListener("pointermove", onMove);
    box.addEventListener("pointerup", onUp);
    box.addEventListener("pointercancel", onUp);
    box.addEventListener("click", onClick, true);

    return () => {
      alive = false;
      api.current = null;
      if (raf) cancelAnimationFrame(raf);
      window.clearTimeout(hintTimer);
      window.clearTimeout(paintTimer);
      resizer.disconnect();
      box.removeEventListener("pointerdown", onDown);
      box.removeEventListener("pointermove", onMove);
      box.removeEventListener("pointerup", onUp);
      box.removeEventListener("pointercancel", onUp);
      box.removeEventListener("click", onClick, true);
      engine?.destroy();
      canvas.remove();
    };
  }, []);

  // The URL's chapter changed: turn toward it (or wait, if a turn is running)
  useEffect(() => {
    api.current?.goTo();
  }, [index]);

  return (
    <div className={styles.stage}>
      {header && <header className={styles.header}>{header}</header>}
      <main ref={pageRef} className={styles.page}>
        <div aria-hidden="true" className={styles.edgeRight} />
        <div aria-hidden="true" className={styles.edgeBottom} />
        <div aria-hidden="true" className={styles.shadow} />
        <div ref={boxRef} className={styles.box}>
          {pages.map((content, i) => (
            <div
              key={CHAPTERS[i].slug}
              ref={(el) => {
                sheetRefs.current[i] = el;
              }}
              className={styles.sheet}
              data-on={i === startIndex || undefined}
              style={{ backgroundImage: `url(${PAPER[CHAPTERS[i].slug]})` }}
            >
              <section aria-label="Page" className={styles.content}>
                {content}
              </section>
            </div>
          ))}
        </div>
        <div ref={curlRef} aria-hidden="true" className={styles.curl} />
        <div ref={glRef} aria-hidden="true" className={styles.glHost} />
        {cover && <PhoneCoverLeaf key={cover.side ?? "front"} {...cover} pageRef={pageRef} curlRef={curlRef} />}
        {footer && <div className={styles.footer}>{footer}</div>}
      </main>
    </div>
  );
}
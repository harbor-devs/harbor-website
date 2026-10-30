"use client";

import { useEffect, useEffectEvent, useLayoutEffect, useRef, type ReactNode, type RefObject } from "react";
import ClosedBook from "./ClosedBook";
import styles from "./PhoneCoverLeaf.module.css";

const SWING_MS = 1300; // one full swing, shut to open
const FLICK = 0.4; // px per ms: a quick swipe counts even if it's short
const STRIPS = 3; // the cover is cut into strips that fold a little against each other
const BEND = 16; // extra degrees each fold line adds at mid-swing (0 = stiff board)

// Gentle at both ends (no sudden start or stop)
const ease = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t);
// Fast start, soft landing (after the finger lets go, it's already moving)
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
// 0 before a, 1 after b, smooth in between
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

type Parts = {
  board: HTMLDivElement;
  folds: HTMLDivElement[]; // the fold lines between strips
  fronts: HTMLDivElement[]; // each strip's outside (the cover art)
  shades: HTMLDivElement[]; // each strip's darkening
  backs: HTMLDivElement[]; // each strip's inside (the endpaper)
  cast: HTMLDivElement;
  page: HTMLElement;
  curl: HTMLDivElement;
};

// Puts everything where it belongs for swing amount v (0 = shut, 1 = open).
// Only transform, opacity and visibility, written straight on each part:
// the cheapest things a browser can animate, so it stays smooth.
function draw(x: Parts, v: number) {
  const lift = Math.sin(v * Math.PI) * 6; // rises off the page a little mid-swing
  const bend = BEND * Math.sin(v * Math.PI); // flat when shut or open, curved in between
  x.board.style.transform = `rotateY(${-180 * v}deg) translateZ(calc(${lift} * var(--u)))`;
  x.folds.forEach((f) => (f.style.transform = `rotateY(${-bend}deg)`));

  const inside = String(1 - smooth(0.7, 1, v)); // inside of the cover melts away...
  for (let i = 0; i < STRIPS; i++) {
    const angle = 180 * v + bend * i; // how far this strip has turned
    const facingUs = angle < 90;
    // Show the side that faces us (not trusting backface-visibility: Chrome
    // leaks the cover art through mirrored)
    x.fronts[i].style.visibility = facingUs ? "" : "hidden";
    x.backs[i].style.visibility = facingUs ? "hidden" : "";
    x.shades[i].style.opacity = String(Math.min(angle / 90, 1) * 0.45); // darker as it turns from the light
    x.backs[i].style.opacity = inside;
  }

  x.curl.style.opacity = String(smooth(0.55, 1, v)); // ...into the folded pages on the left
  x.cast.style.opacity = String(Math.sin(v * Math.PI) * 0.5); // its shadow on the page
  x.page.style.translate = `${5 * v}% 0`; // shut = centered, open = room for the curl
}

// ---- The finger on the shut cover ----
// Cover starts it, the leaf picks it up once it's on screen. It listens on the
// whole window, so it keeps working while Cover is swapped for the diary.
export type CoverGrab = {
  startX: number; // where the finger went down (screen px)
  x: number; // where it is now
  vx: number; // its speed in px per ms (minus = moving left)
  up: boolean; // let go
  cancelled: boolean; // the browser took the touch over (e.g. it started scrolling)
  onChange: (() => void) | null; // the leaf listens here
};

export function grabCover(e: PointerEvent, startX: number): CoverGrab {
  const g: CoverGrab = { startX, x: e.clientX, vx: 0, up: false, cancelled: false, onChange: null };
  const id = e.pointerId;
  let t = performance.now();

  const move = (ev: PointerEvent) => {
    if (ev.pointerId !== id) return;
    const now = performance.now();
    g.vx = g.vx * 0.6 + ((ev.clientX - g.x) / Math.max(now - t, 1)) * 0.4;
    g.x = ev.clientX;
    t = now;
    g.onChange?.();
  };
  const end = (ev: PointerEvent) => {
    if (ev.pointerId !== id) return;
    g.up = true;
    g.cancelled = ev.type === "pointercancel";
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", end);
    window.removeEventListener("pointercancel", end);
    g.onChange?.();
  };

  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", end);
  window.addEventListener("pointercancel", end);
  return g;
}

// ---- One swing at a time ----
type Swing = {
  parts: Parts | null;
  v: number; // where the cover is now (0 = shut, 1 = open)
  raf: number;
  aim: { to: number; done: () => void } | null; // the swing that's running
  held: boolean; // a finger is moving it
};

// A new swing starts from wherever the cover is, so nothing jumps
function swing(s: Swing, to: number, curve: (t: number) => number, done: () => void) {
  cancelAnimationFrame(s.raf);
  s.aim = null;
  const parts = s.parts;
  if (!parts) return;
  const from = s.v;
  const ms = SWING_MS * Math.abs(to - from);
  if (ms === 0) {
    done();
    return;
  }

  const aim = { to, done };
  s.aim = aim;
  // The clock starts on the first real frame, so a slow first frame can't skip ahead
  let start = 0;
  const tick = (now: number) => {
    if (!start) start = now;
    const t = Math.min((now - start) / ms, 1);
    s.v = from + (to - from) * curve(t);
    draw(parts, s.v);
    if (t < 1) {
      s.raf = requestAnimationFrame(tick);
      return;
    }
    s.aim = null;
    aim.done(); // read at the end: it can be swapped while running
  };
  s.raf = requestAnimationFrame(tick);
}

// What Book passes in (through PhoneBook)
export type CoverSwing = {
  open: boolean; // where the cover should end up (the URL)
  onSettle: (open: boolean) => void; // it got there
  grab?: CoverGrab | null; // a finger grabbed the shut cover
  onLetGo?: (open: boolean) => void; // the finger let go: true = it's going open
};

type PhoneCoverLeafProps = CoverSwing & {
  pageRef: RefObject<HTMLElement | null>; // the diary page (slides over)
  curlRef: RefObject<HTMLDivElement | null>; // the folded pages on the left (fade in)
};

// Phone: the front cover swinging on its spine, on top of the diary's first page.
// Only on screen while it moves or a finger holds it.
export default function PhoneCoverLeaf({ open, onSettle, grab, onLetGo, pageRef, curlRef }: PhoneCoverLeafProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const castRef = useRef<HTMLDivElement>(null);
  const foldRefs = useRef<(HTMLDivElement | null)[]>([]);
  const frontRefs = useRef<(HTMLDivElement | null)[]>([]);
  const shadeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const backRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Grabbed: starts shut, under the finger. Otherwise: opposite side of where it's going.
  const s = useRef<Swing>({ parts: null, v: grab || open ? 0 : 1, raf: 0, aim: null, held: !!grab });
  const settle = useEffectEvent((o: boolean) => onSettle(o));
  const letGo = useEffectEvent((o: boolean) => onLetGo?.(o));

  // Before the first paint: everything in the starting spot, so nothing jumps.
  // When the cover leaves, the page and curl go back to their normal CSS.
  // The page is this leaf's parent. React fills in a parent's ref AFTER the
  // child's setup runs, so pageRef can still be empty here: use the parent element.
  useLayoutEffect(() => {
    const page = pageRef.current ?? rootRef.current?.parentElement;
    const curl = curlRef.current;
    const board = boardRef.current;
    const cast = castRef.current;
    const all = (list: (HTMLDivElement | null)[]) => list.filter((el): el is HTMLDivElement => !!el);
    const folds = all(foldRefs.current);
    const fronts = all(frontRefs.current);
    const shades = all(shadeRefs.current);
    const backs = all(backRefs.current);
    if (!page || !curl || !board || !cast) return;
    if (fronts.length !== STRIPS || shades.length !== STRIPS || backs.length !== STRIPS) return;
    const st = s.current;
    st.parts = { board, folds, fronts, shades, backs, cast, page, curl };
    draw(st.parts, st.v);
    return () => {
      cancelAnimationFrame(st.raf);
      st.aim = null;
      st.parts = null;
      page.style.translate = "";
      curl.style.opacity = "";
    };
  }, [pageRef, curlRef]);

  // The finger: the cover's edge stays under it, so the spine is halfway.
  // Let go past the spine (or flick left) and it opens, otherwise it falls shut.
  useEffect(() => {
    const st = s.current;
    const page = st.parts?.page;
    if (!grab || !page) return;
    const r = page.getBoundingClientRect(); // shut and centered right now
    const reach = Math.max(grab.startX - r.left, r.width * 0.5); // grab point to spine

    const update = () => {
      if (!st.held || !st.parts) return;
      if (!grab.up) {
        const k = 1 - (grab.startX - grab.x) / reach; // 1 = where it was grabbed, 0 = the spine
        st.v = Math.acos(Math.min(Math.max(k, -1), 1)) / Math.PI;
        draw(st.parts, st.v);
        return;
      }
      st.held = false;
      const opened =
        !grab.cancelled && (grab.vx < -FLICK ? st.v > 0.02 : grab.vx > FLICK ? false : st.v > 0.5);
      if (opened) {
        swing(st, 1, easeOut, () => {}); // settles once the URL catches up (below)
        letGo(true);
      } else {
        swing(st, 0, easeOut, () => settle(false));
      }
    };

    grab.onChange = update;
    update(); // catch up: the finger moved (or let go) before this was on screen
    return () => {
      grab.onChange = null;
    };
  }, [grab]);

  // Swing toward "open". If it flips mid-swing, it turns back from where it is.
  useEffect(() => {
    const st = s.current;
    if (st.held) return; // the finger is in charge
    const to = open ? 1 : 0;
    const done = () => settle(open);
    if (st.aim?.to === to) st.aim.done = done; // already on its way there: just finish the job
    else swing(st, to, ease, done);
  }, [open]);

  // One strip of the cover: its outside and inside, cut out of the full cover
  // with clip-path, plus the fold line holding the next strip (nested, so
  // each fold turns everything after it).
  const strip = (i: number): ReactNode => {
    const left = (100 * i) / STRIPS; // where this strip starts (% of the cover)
    const right = 100 - (100 * (i + 1)) / STRIPS; // how much is cut off on the right
    const hair = 0.2; // tiny overlap so no seam shows between strips
    const cutL = Math.max(left - hair, 0);
    const cutR = Math.max(right - hair, 0);
    return (
      <>
        <div
          ref={(el) => {
            frontRefs.current[i] = el;
          }}
          className={styles.front}
          style={{ clipPath: `inset(0 ${cutR}% 0 ${cutL}%)` }}
        >
          <ClosedBook phone bare />
          <div
            ref={(el) => {
              shadeRefs.current[i] = el;
            }}
            aria-hidden="true"
            className={styles.shade}
          />
        </div>
        {/* The inside is turned around, so its left and right cuts swap */}
        <div
          ref={(el) => {
            backRefs.current[i] = el;
          }}
          aria-hidden="true"
          className={styles.back}
          style={{ clipPath: `inset(0 ${cutL}% 0 ${cutR}%)` }}
        />
        {i < STRIPS - 1 && (
          <div
            ref={(el) => {
              foldRefs.current[i] = el;
            }}
            className={styles.fold}
            style={{ transformOrigin: `${(100 * (i + 1)) / STRIPS}% 50%` }}
          >
            {strip(i + 1)}
          </div>
        )}
      </>
    );
  };

  return (
    <div ref={rootRef} className={styles.root}>
      <div ref={castRef} aria-hidden="true" className={styles.cast} />
      <div ref={boardRef} className={styles.board}>
        {strip(0)}
      </div>
    </div>
  );
}
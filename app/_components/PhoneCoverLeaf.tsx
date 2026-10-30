"use client";

import { useEffect, useEffectEvent, useLayoutEffect, useRef, type RefObject } from "react";
import ClosedBook from "./ClosedBook";
import styles from "./PhoneCoverLeaf.module.css";

const SWING_MS = 1300; // one full swing, shut to open

// Gentle at both ends (no sudden start or stop)
const ease = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t);
// 0 before a, 1 after b, smooth in between
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

type Parts = {
  board: HTMLDivElement;
  shade: HTMLDivElement;
  back: HTMLDivElement;
  cast: HTMLDivElement;
  page: HTMLElement;
  curl: HTMLDivElement;
};

// Puts everything where it belongs for swing amount v (0 = shut, 1 = open).
// Only transform and opacity, written straight on each part: the cheapest
// things a browser can animate, so it stays smooth.
function draw(x: Parts, v: number) {
  const lift = Math.sin(v * Math.PI) * 6; // rises off the page a little mid-swing
  x.board.style.transform = `rotateY(${-180 * v}deg) translateZ(calc(${lift} * var(--u)))`;
  x.shade.style.opacity = String(Math.min(v * 2, 1) * 0.45); // darker as it turns from the light
  x.back.style.opacity = String(1 - smooth(0.7, 1, v)); // inside of the cover melts away...
  x.curl.style.opacity = String(smooth(0.55, 1, v)); // ...into the folded pages on the left
  x.cast.style.opacity = String(Math.sin(v * Math.PI) * 0.5); // its shadow on the page
  x.page.style.translate = `${5 * v}% 0`; // shut = centered, open = room for the curl
}

type PhoneCoverLeafProps = {
  open: boolean; // where the cover should end up
  onSettle: (open: boolean) => void; // it got there
  pageRef: RefObject<HTMLElement | null>; // the diary page (slides over)
  curlRef: RefObject<HTMLDivElement | null>; // the folded pages on the left (fade in)
};

// Phone: the front cover swinging on its spine, on top of the diary's first page.
// Only on screen while it moves; it starts on the opposite side of where it's going.
export default function PhoneCoverLeaf({ open, onSettle, pageRef, curlRef }: PhoneCoverLeafProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const shadeRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const castRef = useRef<HTMLDivElement>(null);
  const p = useRef(open ? 0 : 1);
  const settle = useEffectEvent((o: boolean) => onSettle(o));

  // Before the first paint: everything in the starting spot, so nothing jumps.
  // When the cover leaves, the page and curl go back to their normal CSS.
  useLayoutEffect(() => {
    const page = pageRef.current;
    const curl = curlRef.current;
    const board = boardRef.current;
    const shade = shadeRef.current;
    const back = backRef.current;
    const cast = castRef.current;
    if (!page || !curl || !board || !shade || !back || !cast) return;
    draw({ board, shade, back, cast, page, curl }, p.current);
    return () => {
      page.style.translate = "";
      curl.style.opacity = "";
    };
  }, [pageRef, curlRef]);

  // Swing toward "open". If it flips mid-swing, it turns back from where it is.
  useEffect(() => {
    const page = pageRef.current;
    const curl = curlRef.current;
    const board = boardRef.current;
    const shade = shadeRef.current;
    const back = backRef.current;
    const cast = castRef.current;
    if (!page || !curl || !board || !shade || !back || !cast) return;
    const parts = { board, shade, back, cast, page, curl };

    const from = p.current;
    const to = open ? 1 : 0;
    const ms = SWING_MS * Math.abs(to - from);
    if (ms === 0) {
      settle(open);
      return;
    }

    // The clock starts on the first real frame, so a slow first frame can't skip ahead
    let start = 0;
    let raf = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const t = Math.min((now - start) / ms, 1);
      p.current = from + (to - from) * ease(t);
      draw(parts, p.current);
      if (t < 1) raf = requestAnimationFrame(tick);
      else settle(open);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [open, pageRef, curlRef]);

  return (
    <div className={styles.root}>
      <div ref={castRef} aria-hidden="true" className={styles.cast} />
      <div ref={boardRef} className={styles.board}>
        <div className={styles.front}>
          <ClosedBook phone bare />
          <div ref={shadeRef} aria-hidden="true" className={styles.shade} />
        </div>
        <div ref={backRef} aria-hidden="true" className={styles.back} />
      </div>
    </div>
  );
}
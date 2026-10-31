"use client";

import { useEffect, useEffectEvent, useLayoutEffect, useRef, type ReactNode } from "react";
import { ramp, runSwing, type Swing } from "../_lib/coverSwing";
import ClosedBook from "./ClosedBook";
import flip from "./FlipBook.module.css";
import styles from "./CoverLeaf.module.css";

type CoverLeafProps = {
  open: boolean; // swung open (or swinging open)
  done: boolean; // fully open and landed: hide it, the real left page takes over
  hideGround?: boolean; // the back cover is shut on the left half and brings its own shadow
  instant: boolean; // no swing to show (reduced motion, or phone width): jump straight there
  inside: ReactNode; // what's printed on the inside: the first chapter's left page
  onSettle: (open: boolean) => void; // the swing finished
};

// Everything that moves while the cover swings
type Parts = {
  book: HTMLElement; // the whole book: slides to the middle and shrinks a little when shut
  board: HTMLElement;
  shadowRight: HTMLElement;
  stackLeft: HTMLElement;
  stackRight: HTMLElement;
  base: HTMLElement;
  ground: HTMLElement;
  cast: HTMLElement;
  leaf: HTMLElement;
  front: HTMLElement;
  back: HTMLElement;
  shades: HTMLElement[];
};

// Finds the moving parts. This cover's own parts are inside the slot.
// The book's parts live in BookSpread (the slot's parent), marked with data-part.
function findParts(slot: HTMLElement | null): Parts | null {
  const book = slot?.parentElement;
  if (!slot || !book) return null;
  const mine = (name: string) => slot.querySelector<HTMLElement>(`[data-part="${name}"]`);
  const spread = (name: string) => book.querySelector<HTMLElement>(`:scope > [data-part="${name}"]`);
  const x = {
    book,
    board: spread("board"),
    shadowRight: spread("shadow-right"),
    stackLeft: spread("stack-left"),
    stackRight: spread("stack-right"),
    base: mine("base"),
    ground: mine("ground"),
    cast: mine("cast"),
    leaf: mine("leaf"),
    front: mine("front"),
    back: mine("back"),
  };
  if (Object.values(x).some((el) => !el)) return null;
  const shades = [...slot.querySelectorAll<HTMLElement>('[data-part="shade"]')];
  return { ...(x as Omit<Parts, "shades">), shades };
}

// Written straight on the element, with its CSS transition off so it can't lag behind
function set(el: HTMLElement, prop: string, value: string | number) {
  el.style.setProperty("transition", "none");
  el.style.setProperty(prop, String(value));
}

// Puts everything where it belongs for swing amount v (0 = shut, 1 = open).
// At 0 and 1 every value matches the CSS resting state, so handing back to CSS can't be seen.
function draw(x: Parts, v: number) {
  // The open book's own edges and shadow: there as soon as the cover lifts
  const lifted = ramp(0, 0.1, v);

  set(x.book, "transform", v === 1 ? "none" : `scale(${0.85 + 0.15 * v}) translateX(${-25 * (1 - v)}%)`);
  set(x.board, "opacity", lifted);
  set(x.board, "clip-path", v < 1 ? "inset(0 0 0 50%)" : "inset(0)"); // left half only once it has landed
  set(x.shadowRight, "opacity", lifted);
  set(x.stackRight, "opacity", lifted);
  set(x.stackLeft, "opacity", v < 1 ? 0 : 1);

  set(x.base, "opacity", 1 - lifted);
  set(x.ground, "opacity", ramp(0.65, 1, v)); // its shadow arrives as it comes down on the left
  set(x.cast, "opacity", v > 0 ? 1 - ramp(0, 0.25, v) : 0); // on the right page while it's just above it

  set(x.leaf, "transform", v === 0 ? "none" : `rotateY(${-180 * v}deg)`);
  // The outside until it's edge-on, then the inside
  set(x.front, "opacity", v <= 0.5 ? 1 : 0);
  set(x.back, "opacity", v <= 0.5 ? 0 : 1);
  // Darkest when edge-on
  x.shades.forEach((el) => set(el, "opacity", 1 - Math.abs(2 * v - 1)));
}

// Resting: hand everything back to the CSS
function clear(x: Parts) {
  const all = [
    x.book, x.board, x.shadowRight, x.stackLeft, x.stackRight,
    x.base, x.ground, x.cast, x.leaf, x.front, x.back, ...x.shades,
  ];
  for (const el of all) {
    for (const prop of ["transition", "transform", "opacity", "clip-path"]) el.style.removeProperty(prop);
  }
}

// The front cover of the laptop book. It hinges on the spine (its left edge)
// and swings over to the left, like a real book.
// No 3D layering tricks (browsers flatten them differently): the cover turns,
// and at the halfway point, when it's edge-on, its picture swaps from the
// outside to the inside. The inside is a copy of the open book's left half
// (board, page stack edges, first left page), so when it lands, the swap to
// the real book can't be seen.
// The CSS holds the two resting states. While it swings, JavaScript moves it.
export default function CoverLeaf({ open, done, hideGround = false, instant, inside, onSettle }: CoverLeafProps) {
  const slotRef = useRef<HTMLDivElement>(null);
  // Where the cover is, and the swing that's running
  const swing = useRef<Swing>({ v: open ? 1 : 0, raf: 0, aim: null });
  const settle = useEffectEvent((o: boolean) => onSettle(o));

  // Swing toward "open". If it flips mid-swing, it turns back from where it is.
  // Runs before the browser paints, so the new CSS resting state never shows early.
  useLayoutEffect(() => {
    const s = swing.current;
    const to = open ? 1 : 0;
    if (!s.aim && s.v === to) return; // already resting there (first load)
    const x = findParts(slotRef.current);
    if (!x) return;
    const finish = () => {
      clear(x);
      settle(open);
    };

    if (instant) {
      cancelAnimationFrame(s.raf);
      s.aim = null;
      s.v = to;
      finish();
    } else if (s.aim?.to === to) {
      s.aim.done = finish; // already on its way there: just finish the job
    } else {
      runSwing(s, to, (v) => draw(x, v), finish);
    }
  }, [open, instant]);

  // Leaving the screen mid-swing: stop the clock
  useEffect(() => {
    const s = swing.current;
    return () => cancelAnimationFrame(s.raf);
  }, []);

  return (
    <div
      ref={slotRef}
      className={styles.slot}
      data-open={open || undefined}
      data-done={done || undefined}
      data-hide-ground={hideGround || undefined}
    >
      {/* What stays with the pages when the cover lifts: page edges, ribbon, shadow.
          Same baked image as the cover, with the cover board cut out. */}
      <div aria-hidden="true" data-part="base" className={styles.base} />

      {/* The cover's shadow, lying flat on the desk where the cover lands.
          Kept OFF the cover so it doesn't swing through the air with it. */}
      <div aria-hidden="true" data-part="ground" className={styles.ground} />

      {/* Shadow the lifting cover throws on the right page */}
      <div aria-hidden="true" data-part="cast" className={styles.cast} />

      <div data-part="leaf" className={styles.leaf} inert={open}>
        {/* Outside: the locked cover design, board only */}
        <div data-part="front" className={styles.front}>
          <ClosedBook bare />
          <div aria-hidden="true" data-part="shade" className={styles.shade} />
        </div>

        {/* Inside: board, page stack edges and the first left page,
            exactly like the open book's left half.
            A visual copy only: hidden from screen readers and not clickable. */}
        <div aria-hidden="true" inert data-part="back" className={styles.back}>
          <div className={styles.stack} />
          <div className={styles.page}>
            <div className={flip.pageLeft}>{inside}</div>
          </div>
          <div data-part="shade" className={styles.shade} />
        </div>
      </div>
    </div>
  );
}
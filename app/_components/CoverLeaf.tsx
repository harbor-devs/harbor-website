"use client";

import { useEffect, useEffectEvent, useLayoutEffect, useRef, type ReactNode } from "react";
import { easeOut, ramp, runSwing, type Swing } from "../_lib/coverSwing";
import { useSwipe } from "../_lib/useSwipe";
import ClosedBook from "./ClosedBook";
import flip from "./FlipBook.module.css";
import type { CoverGrab } from "./PhoneCoverLeaf";
import styles from "./CoverLeaf.module.css";

const FLICK = 0.4; // px per ms: a quick drag counts even if it's short

type CoverLeafProps = {
  open: boolean; // swung open (or swinging open)
  done: boolean; // fully open and landed: hide it, the real left page takes over
  hideGround?: boolean; // the back cover is shut on the left half and brings its own shadow
  instant: boolean; // no swing to show (reduced motion, or phone width): jump straight there
  inside: ReactNode; // what's printed on the inside: the first chapter's left page
  onSettle: (open: boolean) => void; // the swing finished
  grab?: CoverGrab | null; // the mouse is swinging it by hand (until it lands)
  onGrab?: ((e: PointerEvent, startX: number) => void) | null; // the mouse started dragging the shut cover left
  onLetGo?: (open: boolean) => void; // let go and it's changing sides: true = going open, false = going shut
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
export default function CoverLeaf({
  open,
  done,
  hideGround = false,
  instant,
  inside,
  onSettle,
  grab = null,
  onGrab = null,
  onLetGo,
}: CoverLeafProps) {
  const slotRef = useRef<HTMLDivElement>(null);
  // Where the cover is, and the swing that's running
  const swing = useRef<Swing>({ v: open ? 1 : 0, raf: 0, aim: null });
  // The mouse is holding it
  const held = useRef(false);
  // Let go on the other side: it can only settle once the URL catches up
  const waiting = useRef(false);
  const settle = useEffectEvent((o: boolean) => onSettle(o));
  const letGo = useEffectEvent((o: boolean) => onLetGo?.(o));
  // Dragging the shut cover to the left hands it to the mouse
  const swipe = useSwipe(-1, onGrab);

  // Swing toward "open". If it flips mid-swing, it turns back from where it is.
  // Runs before the browser paints, so the new CSS resting state never shows early.
  useLayoutEffect(() => {
    if (held.current) return; // the mouse is in charge
    const s = swing.current;
    const to = open ? 1 : 0;
    const waited = waiting.current;
    waiting.current = false;
    if (!s.aim && s.v === to && !waited) return; // already resting there (first load)
    const x = findParts(slotRef.current);
    if (!x) return;
    const finish = () => {
      clear(x);
      settle(open);
    };

    if (instant || (!s.aim && s.v === to)) {
      // Nothing to show, or it already got there while the URL caught up
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

  // The mouse.
  // Opening (grabbed on the shut cover): its free edge stays under the mouse,
  // so at the spine it's standing straight up. Closing (grabbed on the first
  // left page): the same, mirrored. Let go past halfway (or flick that way)
  // and it finishes, otherwise it falls back.
  useLayoutEffect(() => {
    if (!grab) return;
    const s = swing.current;
    const x = findParts(slotRef.current);
    if (!x) return;
    cancelAnimationFrame(s.raf);
    s.aim = null;
    held.current = true;

    const r = x.book.getBoundingClientRect();
    const spine = r.left + r.width / 2;
    const closing = grab.closing;
    const sx = grab.startX;
    const reach = Math.max(Math.abs(spine - sx), r.width / 4); // grab point to spine
    const draw_ = (v: number) => draw(x, v);

    const update = () => {
      if (!held.current) return;
      if (!grab.up) {
        // k = where the free edge is, from -1 (open, flat on the left) to 1 (shut)
        const k = closing ? -1 + (grab.x - sx) / reach : 1 - (sx - grab.x) / reach;
        s.v = Math.acos(Math.min(Math.max(k, -1), 1)) / Math.PI;
        draw(x, s.v);
        return;
      }
      held.current = false;

      // Where it ends up: a flick decides, otherwise past halfway or not.
      // Cancelled: back where it started.
      const toOpen = grab.cancelled ? closing : grab.vx < -FLICK ? true : grab.vx > FLICK ? false : s.v > 0.5;
      if (toOpen !== closing) {
        // Changing sides: the URL catches up, then it lands (the swing effect above)
        waiting.current = true;
        runSwing(s, toOpen ? 1 : 0, draw_, () => {}, easeOut);
        letGo(toOpen);
      } else {
        // Falling back where it started: the URL is already right
        runSwing(s, toOpen ? 1 : 0, draw_, () => {
          clear(x);
          settle(toOpen);
        }, easeOut);
      }
    };

    grab.listen(update);
    update(); // catch up: the mouse moved (or let go) before this ran
    return () => grab.listen(null);
  }, [grab]);

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

      <div data-part="leaf" className={styles.leaf} inert={open} {...swipe}>
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
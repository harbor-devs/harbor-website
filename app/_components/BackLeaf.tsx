"use client";

import Image from "next/image";
import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
  FLICK,
  clearStyles,
  easeOut,
  edgeToSwing,
  findSpread,
  part,
  ramp,
  runSwing,
  setStyle,
  type SpreadParts,
  type Swing,
} from "../_lib/coverSwing";
import { useSwipe } from "../_lib/useSwipe";
import flip from "./FlipBook.module.css";
import type { CoverGrab } from "./PhoneCoverLeaf";
import styles from "./BackLeaf.module.css";

type BackLeafProps = {
  shut: boolean; // swung over to the left (or swinging there)
  done: boolean; // fully open and resting: hide it, the real last page takes over
  rested: boolean; // shut and resting: show the thank-you note and the flower
  instant: boolean; // no swing to show (reduced motion, or phone width): jump straight there
  inside: ReactNode; // what's printed on it while open: the last chapter's right page
  onSettle: (shut: boolean) => void; // the swing finished
  grab?: CoverGrab | null; // the mouse is swinging it by hand (until it lands)
  onGrab?: ((e: PointerEvent, startX: number) => void) | null; // the mouse started dragging the shut back cover right
  onLetGo?: (shut: boolean) => void; // let go and it's changing sides: true = going shut, false = going open
};

// Everything that moves while the cover swings
type Parts = SpreadParts & {
  base: HTMLElement;
  ground: HTMLElement;
  cast: HTMLElement;
  leaf: HTMLElement;
  inside: HTMLElement;
  outside: HTMLElement;
  shades: HTMLElement[];
};

function findParts(slot: HTMLElement | null): Parts | null {
  const spread = findSpread(slot);
  if (!slot || !spread) return null;
  const own = {
    base: part(slot, "base"),
    ground: part(slot, "ground"),
    cast: part(slot, "cast"),
    leaf: part(slot, "leaf"),
    inside: part(slot, "inside"),
    outside: part(slot, "outside"),
  };
  if (Object.values(own).some((el) => !el)) return null;
  const shades = [...slot.querySelectorAll<HTMLElement>('[data-part="shade"]')];
  return { ...spread, ...(own as Omit<Parts, keyof SpreadParts | "shades">), shades };
}

const all = (x: Parts) => [
  x.book, x.board, x.shadowRight, x.stackLeft, x.stackRight,
  x.base, x.ground, x.cast, x.leaf, x.inside, x.outside, ...x.shades,
];

// Puts everything where it belongs for swing amount w (0 = open on the right, 1 = shut on the left).
// At 0 and 1 every value matches the CSS resting state, so handing back to CSS can't be seen.
function draw(x: Parts, w: number) {
  // The last bit before it lands shut
  const landing = ramp(0.9, 1, w);

  setStyle(x.book, "transform", w === 0 ? "none" : `scale(${1 - 0.15 * w}) translateX(${25 * w}%)`);
  setStyle(x.board, "opacity", 1 - landing);
  setStyle(x.board, "clip-path", w > 0 ? "inset(0 50% 0 0)" : "inset(0)"); // the right half travels with the cover
  setStyle(x.stackLeft, "opacity", 1 - landing);
  // The cover carries its own copy of these (and .ground is its shadow)
  setStyle(x.shadowRight, "opacity", 0);
  setStyle(x.stackRight, "opacity", 0);

  setStyle(x.base, "opacity", landing); // page edges and ribbon around the shut back cover
  setStyle(x.ground, "opacity", 1 - ramp(0, 0.35, w)); // its shadow on the desk, gone as it lifts
  setStyle(x.cast, "opacity", w < 1 ? ramp(0.75, 1, w) : 0); // on the left page while it's just above it

  setStyle(x.leaf, "transform", w === 0 ? "none" : `rotateY(${-180 * w}deg)`);
  // The inside until it's edge-on, then the outside
  setStyle(x.inside, "opacity", w <= 0.5 ? 1 : 0);
  setStyle(x.outside, "opacity", w <= 0.5 ? 0 : 1);
  // Darkest when edge-on
  x.shades.forEach((el) => setStyle(el, "opacity", 1 - Math.abs(2 * w - 1)));
}

// The back cover of the laptop book. Mirror of CoverLeaf: it hinges on the
// spine and swings from the right half over to the left, like closing a real
// book from the back.
// Open, it's a copy of the book's right half (board, page edges, last right page).
// At the halfway point (edge-on) it swaps to the outside of the back cover.
// The CSS holds the two resting states. While it swings, JavaScript moves it.
export default function BackLeaf({
  shut,
  done,
  rested,
  instant,
  inside,
  onSettle,
  grab = null,
  onGrab = null,
  onLetGo,
}: BackLeafProps) {
  const slotRef = useRef<HTMLDivElement>(null);
  // How far it has swung shut (0 = open, 1 = shut), and the swing that's running
  const swing = useRef<Swing>({ v: shut ? 1 : 0, raf: 0, aim: null });
  // The mouse is holding it
  const held = useRef(false);
  // Let go on the other side: it can only settle once the URL catches up
  const waiting = useRef(false);
  // True only if the cover just swung shut in front of the visitor: then the
  // note and flower animate in. On a direct visit to /the-end, or after a drag
  // that fell back shut, they're simply there.
  const [played, setPlayed] = useState(false);
  const settle = useEffectEvent((s: boolean) => onSettle(s));
  const letGo = useEffectEvent((s: boolean) => onLetGo?.(s));
  // Dragging the shut back cover to the right hands it to the mouse
  const swipe = useSwipe(1, onGrab);

  // Swing toward "shut". If it flips mid-swing, it turns back from where it is.
  // Runs before the browser paints, so the new CSS resting state never shows early.
  useLayoutEffect(() => {
    if (held.current) return; // the mouse is in charge
    const s = swing.current;
    const to = shut ? 1 : 0;
    const waited = waiting.current;
    waiting.current = false;
    if (!s.aim && s.v === to && !waited) return; // already resting there (first load)
    const x = findParts(slotRef.current);
    if (!x) return;

    if (instant) {
      cancelAnimationFrame(s.raf);
      s.aim = null;
      s.v = to;
      clearStyles(all(x));
      settle(shut);
      return;
    }

    const finish = () => {
      clearStyles(all(x));
      setPlayed(shut);
      settle(shut);
    };
    if (s.aim?.to === to) s.aim.done = finish; // already on its way there: just finish the job
    else runSwing(s, to, (w) => draw(x, w), finish); // (zero length if it already got there)
  }, [shut, instant]);

  // The mouse.
  // Shutting (grabbed on the last right page, dragged left): its free edge
  // stays under the mouse, so at the spine it's standing straight up.
  // Opening (grabbed on the shut back cover, dragged right): the same, mirrored.
  // Let go past halfway (or flick that way) and it finishes, otherwise it falls back.
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
    const shutting = grab.closing; // grabbed on the open page
    const sx = grab.startX;
    const reach = Math.max(Math.abs(spine - sx), r.width / 4); // grab point to spine
    const drawAt = (w: number) => draw(x, w);

    const update = () => {
      if (!held.current) return;
      if (!grab.up) {
        // The free edge, from 1 (open, flat on the right) to -1 (shut, flat on the left)
        const edge = shutting ? 1 - (sx - grab.x) / reach : -1 + (grab.x - sx) / reach;
        s.v = edgeToSwing(edge);
        drawAt(s.v);
        return;
      }
      held.current = false;

      // Where it ends up: a flick decides, otherwise past halfway or not.
      // Cancelled: back where it started.
      const toShut = grab.cancelled ? !shutting : grab.vx < -FLICK ? true : grab.vx > FLICK ? false : s.v > 0.5;
      if (toShut === shutting) {
        // Changing sides: the URL catches up, then it lands (the swing effect above)
        waiting.current = true;
        runSwing(s, toShut ? 1 : 0, drawAt, () => {}, easeOut);
        letGo(toShut);
      } else {
        // Falling back where it started: the URL is already right.
        // The note was already there, so it just stays (no second inking).
        runSwing(
          s,
          toShut ? 1 : 0,
          drawAt,
          () => {
            clearStyles(all(x));
            setPlayed(false);
            settle(toShut);
          },
          easeOut,
        );
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
      aria-hidden="true"
      className={styles.slot}
      data-shut={shut || undefined}
      data-done={done || undefined}
      data-rested={rested || undefined}
    >
      {/* Shut, on the desk around the back cover: page edges, ribbon, shadow.
          The front cover's baked image, flipped, with the board cut out. */}
      <div data-part="base" className={styles.base} />

      {/* The right half's shadow on the desk while this cover is open.
          Kept OFF the cover so it doesn't swing through the air with it. */}
      <div data-part="ground" className={styles.ground} />

      {/* Shadow the swinging cover throws on the left page */}
      <div data-part="cast" className={styles.cast} />

      {/* Only grabbable while it rests shut */}
      <div data-part="leaf" className={styles.leaf} inert={!rested} {...swipe}>
        {/* Inside: exactly like the open book's right half */}
        <div data-part="inside" className={styles.inside}>
          <div className={styles.board} />
          <div className={styles.stack} />
          <div className={styles.page}>
            <div className={flip.pageRight}>{inside}</div>
          </div>
          <div data-part="shade" className={styles.shade} />
        </div>

        {/* Outside: the back of the book. Not pre-flipped, so once it swings
            over, the spine ends up on the right like a real back cover. */}
        <div data-part="outside" className={styles.outside}>
          <div className={styles.texture} />
          <div className={styles.mark}>
            <Image src="/cover-logo.svg" alt="" width={210} height={231} unoptimized className={styles.logo} />
          </div>

          {/* The thank-you: a note in ink, then a pressed flower placed on it.
              Pre-flipped like the logo so it reads the right way. */}
          <div className={styles.gift} data-show={rested || undefined} data-play={played || undefined}>
            <p className={styles.note}>
              You stayed till the very end.
              <br />
              Thank you for being here,
              <br />
              I truly appreciate it.
              <br />
              Keep the flower, it&rsquo;s yours.
              <span className={styles.sig}>~ Abdullah</span>
            </p>
            <Image src="/flower-sprig.svg" alt="" width={240} height={320} unoptimized className={styles.flower} />
          </div>

          <div data-part="shade" className={styles.shade} />
        </div>
      </div>
    </div>
  );
}
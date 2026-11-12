"use client";

import { useEffect, useEffectEvent, useRef, type ReactNode } from "react";
import type { PageFlip } from "page-flip";
import styles from "./FlipBook.module.css";

// The ONLY file that talks to the page-flip library (see docs/book-engine.md).
// If the library ever breaks, this is the one file to replace.

type FlipBookProps = {
  pages: ReactNode[]; // every page in reading order: chapter 1 left, chapter 1 right, chapter 2 left...
  spread: number; // the two-page spread the book should turn to (0 = first chapter)
  onUserTurn: (spread: number) => void; // the visitor dragged a page over by hand
  onArrive: (spread: number) => void; // a turn finished, the book now shows this spread
};

const PAGE_W = 520; // one page, canvas px (shape only, the book scales)
const PAGE_H = 640;
const TURN_MS = 700; // a normal turn (same as --duration-page)
const RIFFLE_MS = 300; // each turn while skipping through several chapters

export default function FlipBook({ pages, spread, onUserTurn, onArrive }: FlipBookProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<PageFlip | null>(null);
  // True while a turn WE started is running, so we can tell it apart from the visitor's
  const engineTurning = useRef(false);

  // The waiting rule: never start a turn while one is running.
  // Turn ONE page toward the wanted spread. When that turn ends, this runs again,
  // until the book is there. Big jumps become a riffle.
  const turnTowardUrl = useEffectEvent((instant: boolean) => {
    const flip = flipRef.current;
    const host = hostRef.current;
    if (!flip || !host || flip.getState() !== "read") return; // busy: wait for the turn to end

    const at = flip.getCurrentPageIndex() / 2;
    if (at === spread) {
      engineTurning.current = false;
      onArrive(at);
      return;
    }

    // No animation: first load, reduced motion, or the laptop book is hidden (phone)
    const noMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (instant || noMotion || host.offsetWidth === 0) {
      flip.turnToPage(spread * 2);
      onArrive(spread);
      return;
    }

    engineTurning.current = true;
    flip.getSettings().flippingTime = Math.abs(spread - at) > 1 ? RIFFLE_MS : TURN_MS;
    if (spread > at) flip.flipNext();
    else flip.flipPrev();
  });

  // A turn just finished
  const onTurnEnd = useEffectEvent(() => {
    const flip = flipRef.current;
    if (!flip) return;

    const at = flip.getCurrentPageIndex() / 2;
    onArrive(at);
    if (!engineTurning.current && at !== spread) {
      onUserTurn(at); // the visitor turned it: move the URL to match
      return;
    }
    turnTowardUrl(false);
  });

  // Start the library once. The book never unmounts between chapters.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let flip: PageFlip | null = null;
    let cancelled = false;

    // Loaded in the browser only, so it never runs on the server
    import("page-flip").then(({ PageFlip }) => {
      if (cancelled) return;
      const leaves = Array.from(host.children) as HTMLElement[];

      flip = new PageFlip(host, {
        width: PAGE_W,
        height: PAGE_H,
        size: "stretch", // fill our box, keep the page shape
        usePortrait: false, // laptop always shows two pages (phone gets its own turn later)
        showCover: false, // our covers are separate components
        drawShadow: true,
        maxShadowOpacity: 0.5,
        flippingTime: TURN_MS,
        useMouseEvents: true, // drag a page over by hand
        disableFlipByClick: true, // a click is just a click, so links on pages work
        showPageCorners: true, // corner lifts a little on hover (see below)
      });
      flip.loadFromHTML(leaves);

      // Hover: lift the corner a little and hold still. By default the library
      // keeps bending the page after the mouse, which looks like it moves on its own.
      // Holding and dragging still bends it freely.
      const corner = flip.getFlipController();
      const showCorner = corner.showCorner.bind(corner);
      corner.showCorner = (pos) => {
        if (corner.getState() === "fold_corner" && corner.isPointOnCorners(pos)) return;
        showCorner(pos);
      };

      // It says "read" a moment before its own state updates, so wait one tick
      flip.on("changeState", (e) => {
        if (e.data === "read") queueMicrotask(() => onTurnEnd());
      });

      flipRef.current = flip;
      turnTowardUrl(true); // direct link or refresh: open straight on the right spread
    });

    return () => {
      cancelled = true;
      flipRef.current = null;
      if (!flip) return;
      // The library has no proper "stop". Remove our listener, silence its
      // drawing loop, put our pages back where React left them, drop its wrapper.
      flip.off("changeState");
      flip.getRender().render = () => {};
      flip.clear();
      flip.getUI().destroy();
    };
  }, []);

  // The wanted spread changed: turn toward it (or wait, if a turn is running)
  useEffect(() => {
    turnTowardUrl(false);
  }, [spread]);

  return (
    <div ref={hostRef} className={styles.host}>
      {pages.map((page, i) => {
        const isLeft = i % 2 === 0;
        // Before the library starts, only the wanted two pages show
        const shown = Math.floor(i / 2) === spread;
        return (
          <div key={i} className={styles.leaf} data-side={isLeft ? "left" : "right"} data-shown={shown || undefined}>
            <section aria-label={isLeft ? "Left page" : "Right page"} className={isLeft ? styles.pageLeft : styles.pageRight}>
              {page}
            </section>
          </div>
        );
      })}
    </div>
  );
}
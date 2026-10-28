"use client";

import { useState, type ReactNode } from "react";
import ClosedBook from "./ClosedBook";
import flip from "./FlipBook.module.css";
import styles from "./CoverLeaf.module.css";

type CoverLeafProps = {
  open: boolean; // swung open (or swinging open)
  done: boolean; // fully open and landed: hide it, the real left page takes over
  inside: ReactNode; // what's printed on the inside: the first chapter's left page
  onSettle: (open: boolean) => void; // the swing finished
};

// The front cover of the laptop book. It hinges on the spine (its left edge)
// and swings over to the left, like a real book.
// No 3D layering tricks (browsers flatten them differently): the cover turns,
// and at the halfway point, when it's edge-on, its picture swaps from the
// outside to the inside. The inside is a copy of the open book's left half
// (board, page stack edges, first left page), so when it lands, the swap to
// the real book can't be seen.
export default function CoverLeaf({ open, done, inside, onSettle }: CoverLeafProps) {
  // Where the swing last came to rest, so we know when it's moving
  const [rest, setRest] = useState(open);
  const moving = open !== rest;

  return (
    <div
      className={styles.slot}
      data-open={open || undefined}
      data-done={done || undefined}
      data-moving={moving || undefined}
    >
      {/* What stays with the pages when the cover lifts: page edges, ribbon, shadow.
          Same baked image as the cover, with the cover board cut out. */}
      <div aria-hidden="true" className={styles.base} />

      {/* The cover's shadow, lying flat on the desk where the cover lands.
          Kept OFF the cover so it doesn't swing through the air with it. */}
      <div aria-hidden="true" className={styles.ground} />

      {/* Shadow the lifting cover throws on the right page */}
      <div aria-hidden="true" className={styles.cast} />

      <div
        className={styles.leaf}
        inert={open}
        onTransitionEnd={(e) => {
          // Only the swing itself, not the hover lift inside or the fade
          if (e.target !== e.currentTarget || e.propertyName !== "transform") return;
          setRest(open);
          onSettle(open);
        }}
      >
        {/* Outside: the locked cover design, board only */}
        <div className={styles.front}>
          <ClosedBook bare />
          <div aria-hidden="true" className={styles.shade} />
        </div>

        {/* Inside: board, page stack edges and the first left page,
            exactly like the open book's left half.
            A visual copy only: hidden from screen readers and not clickable. */}
        <div aria-hidden="true" inert className={styles.back}>
          <div className={styles.stack} />
          <div className={styles.page}>
            <div className={flip.pageLeft}>{inside}</div>
          </div>
          <div className={styles.shade} />
        </div>
      </div>
    </div>
  );
}
"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import flip from "./FlipBook.module.css";
import styles from "./BackLeaf.module.css";

type BackLeafProps = {
  shut: boolean; // swung over to the left (or swinging there)
  done: boolean; // fully open and resting: hide it, the real last page takes over
  inside: ReactNode; // what's printed on it while open: the last chapter's right page
  onSettle: (shut: boolean) => void; // the swing finished
};

// The back cover of the laptop book. Mirror of CoverLeaf: it hinges on the
// spine and swings from the right half over to the left, like closing a real
// book from the back.
// Open, it's a copy of the book's right half (board, page edges, last right page).
// At the halfway point (edge-on) it swaps to the outside of the back cover.
// Purely a picture: hidden from screen readers and not clickable.
export default function BackLeaf({ shut, done, inside, onSettle }: BackLeafProps) {
  // Where the swing last came to rest, so we know when it's moving
  const [rest, setRest] = useState(shut);
  const moving = shut !== rest;

  return (
    <div
      aria-hidden="true"
      className={styles.slot}
      data-shut={shut || undefined}
      data-done={done || undefined}
      data-moving={moving || undefined}
    >
      {/* Shut, on the desk around the back cover: page edges, ribbon, shadow.
          The front cover's baked image, flipped, with the board cut out. */}
      <div className={styles.base} />

      {/* The right half's shadow on the desk while this cover is open.
          Kept OFF the cover so it doesn't swing through the air with it. */}
      <div className={styles.ground} />

      {/* Shadow the swinging cover throws on the left page */}
      <div className={styles.cast} />

      <div
        className={styles.leaf}
        inert
        onTransitionEnd={(e) => {
          // Only the swing itself, not the fade
          if (e.target !== e.currentTarget || e.propertyName !== "transform") return;
          setRest(shut);
          onSettle(shut);
        }}
      >
        {/* Inside: exactly like the open book's right half */}
        <div className={styles.inside}>
          <div className={styles.board} />
          <div className={styles.stack} />
          <div className={styles.page}>
            <div className={flip.pageRight}>{inside}</div>
          </div>
          <div className={styles.shade} />
        </div>

        {/* Outside: the back of the book. Not pre-flipped, so once it swings
            over, the spine ends up on the right like a real back cover. */}
        <div className={styles.outside}>
          <div className={styles.texture} />
          <div className={styles.mark}>
            <Image src="/cover-logo.svg" alt="" width={210} height={231} unoptimized className={styles.logo} />
          </div>
          <div className={styles.shade} />
        </div>
      </div>
    </div>
  );
}
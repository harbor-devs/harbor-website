"use client";

import Image from "next/image";
import { useState, type ReactNode } from "react";
import flip from "./FlipBook.module.css";
import styles from "./BackLeaf.module.css";

type BackLeafProps = {
  shut: boolean; // swung over to the left (or swinging there)
  done: boolean; // fully open and resting: hide it, the real last page takes over
  rested: boolean; // shut and resting: show the thank-you note and the flower
  inside: ReactNode; // what's printed on it while open: the last chapter's right page
  onSettle: (shut: boolean) => void; // the swing finished
};

// The back cover of the laptop book. Mirror of CoverLeaf: it hinges on the
// spine and swings from the right half over to the left, like closing a real
// book from the back.
// Open, it's a copy of the book's right half (board, page edges, last right page).
// At the halfway point (edge-on) it swaps to the outside of the back cover.
// Purely a picture: hidden from screen readers and not clickable.
export default function BackLeaf({ shut, done, rested, inside, onSettle }: BackLeafProps) {
  // Where the swing last came to rest, so we know when it's moving
  const [rest, setRest] = useState(shut);
  const moving = shut !== rest;

  // True only if the cover just swung shut in front of the visitor.
  // Then the note and flower animate in. On a direct visit to /the-end
  // (or with reduced motion) they're simply already there.
  const [played, setPlayed] = useState(false);

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
          setPlayed(shut);
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

          <div className={styles.shade} />
        </div>
      </div>
    </div>
  );
}
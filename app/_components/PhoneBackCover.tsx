"use client";

import Image from "next/image";
import { useRef, type PointerEvent } from "react";
import { BackCoverBar } from "./BookNav";
import { PhoneHeader } from "./PhoneNav";
import { grabCover, type CoverGrab } from "./PhoneCoverLeaf";
import cover from "./Cover.module.css";
import phone from "./PhoneBook.module.css";
import styles from "./PhoneBackCover.module.css";

type BackBoardProps = {
  bare?: boolean; // only the board: no page edges, ribbon or shadow (the swinging cover)
  gift?: boolean; // the thank-you note and flower
  still?: boolean; // no ink-in or flower animation (they're already there)
};

// The back cover board, drawn spine-left like the front cover. Whoever shows it
// flips it, so the spine ends up on the right like a real back cover.
// Same shape as the phone diary page (330 x 467), so it sits exactly on the last page.
export function BackBoard({ bare = false, gift = true, still = false }: BackBoardProps) {
  return (
    <div className={styles.board} data-bare={bare || undefined} data-still={still || undefined}>
      <div aria-hidden="true" className={styles.texture} />

      <div aria-hidden="true" className={styles.mark}>
        <Image src="/cover-logo.svg" alt="" width={210} height={231} unoptimized className={styles.logo} />
      </div>

      {/* Flipped back so it reads the right way */}
      {gift && (
        <div className={styles.gift}>
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
          <Image
            src="/flower-sprig.svg"
            alt=""
            aria-hidden="true"
            width={240}
            height={320}
            unoptimized
            className={styles.flower}
          />
        </div>
      )}
    </div>
  );
}

type PhoneBackCoverProps = {
  onGrab?: (grab: CoverGrab) => void; // a finger started swiping the back cover open
};

// Phone: the closed diary seen from the back, at /the-end.
// Uses the phone diary's own layout (like Cover), so it's the same size as the
// last page and the swinging back cover lands exactly on it.
// The note inks in, then the pressed flower lands.
// Swiping it right swings it open by hand (the mirror of the front cover).
// Under it: back to the last chapter, or read again.
export default function PhoneBackCover({ onGrab }: PhoneBackCoverProps) {
  // Where the finger went down, until we know if it's a tap or a swipe
  const down = useRef<{ id: number; x: number; y: number } | null>(null);

  function onPointerDown(e: PointerEvent) {
    if (!onGrab || (e.pointerType === "mouse" && e.button !== 0)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    down.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
  }

  function onPointerMove(e: PointerEvent) {
    const d = down.current;
    if (!d || e.pointerId !== d.id) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.hypot(dx, dy) < 8) return; // still a tap
    down.current = null;
    // Mostly sideways and to the right: grab the back cover. Anything else: let it be.
    if (dx > 0 && Math.abs(dx) > Math.abs(dy)) onGrab?.(grabCover(e.nativeEvent, d.x));
  }

  const forget = () => {
    down.current = null;
  };

  return (
    <div className={phone.stage}>
      <header className={phone.header}>
        <PhoneHeader />
      </header>

      <main
        className={`${phone.page} ${cover.centered}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={forget}
        onPointerCancel={forget}
        onDragStart={(e) => e.preventDefault()} // a mouse drag shouldn't pick up a link
      >
        {/* Mirrored, so the spine is on the right */}
        <div className={styles.flip}>
          <BackBoard />
        </div>

        <div className={phone.footer}>
          <div className={styles.bar}>
            <BackCoverBar />
          </div>
        </div>
      </main>
    </div>
  );
}
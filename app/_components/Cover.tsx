"use client";

import Link from "next/link";
import { useRef, type PointerEvent } from "react";
import ClosedBook from "./ClosedBook";
import { ArrowRight } from "./icons";
import { PhoneHeader } from "./PhoneNav";
import { grabCover, type CoverGrab } from "./PhoneCoverLeaf";
import { CHAPTERS } from "../_lib/chapters";
import phone from "./PhoneBook.module.css";
import styles from "./Cover.module.css";

type CoverProps = {
  onGrab?: (grab: CoverGrab) => void; // a finger started swiping the cover open
};

// Phone: the closed diary. Tapping it (or the hint under it) opens chapter one,
// and swiping it left swings it open by hand.
// It uses the phone diary's own layout, so the cover is the same size as the
// first page. Shut, it sits centered; the open diary sits a little right
// (room for the curl), so the book slides over as the cover swings open.
// (Laptop uses the swinging CoverLeaf inside the book instead.)
export default function Cover({ onGrab }: CoverProps) {
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
    // Mostly sideways and to the left: grab the cover. Anything else: let it be.
    if (dx < 0 && Math.abs(dx) > Math.abs(dy)) onGrab?.(grabCover(e.nativeEvent, d.x));
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
        className={`${phone.page} ${styles.centered}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={forget}
        onPointerCancel={forget}
        onDragStart={(e) => e.preventDefault()} // a mouse drag shouldn't pick up the link
      >
        <ClosedBook phone />

        {/* Same link as the book, for touch only.
            Hidden from keyboard and screen readers: the book is the real link. */}
        <div className={phone.footer}>
          <div className={styles.phoneHintSlot}>
            <Link href={CHAPTERS[0].href} className={styles.hint} aria-hidden="true" tabIndex={-1}>
              Tap to open
              <ArrowRight />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

// Laptop: "Click to open" under the closed cover (sits in the book's bottom bar slot)
export function CoverHint() {
  return (
    <div className={styles.hintSlot}>
      <Link href={CHAPTERS[0].href} className={styles.hint} aria-hidden="true" tabIndex={-1}>
        Click to open
        <ArrowRight />
      </Link>
    </div>
  );
}
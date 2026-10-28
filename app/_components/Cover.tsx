import Link from "next/link";
import ClosedBook from "./ClosedBook";
import { ArrowRight } from "./icons";
import { PhoneHeader } from "./PhoneNav";
import { CHAPTERS } from "../_lib/chapters";
import styles from "./Cover.module.css";

// Phone: the closed diary. Tapping it (or the hint under it) opens chapter one.
// (Laptop uses the swinging CoverLeaf inside the book instead.)
export default function Cover() {
  return (
    <div className={styles.stage}>
      <header className={styles.header}>
        <PhoneHeader />
      </header>

      <main className={styles.main}>
        <div className={styles.bookWrap}>
          <ClosedBook />
        </div>

        {/* Same link as the book, for touch only.
            Hidden from keyboard and screen readers: the book is the real link. */}
        <Link href={CHAPTERS[0].href} className={styles.hint} aria-hidden="true" tabIndex={-1}>
          Tap to open
          <ArrowRight />
        </Link>
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
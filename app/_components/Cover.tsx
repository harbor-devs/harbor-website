import Link from "next/link";
import ClosedBook from "./ClosedBook";
import { ArrowRight } from "./icons";
import { PhoneHeader } from "./PhoneNav";
import { CHAPTERS } from "../_lib/chapters";
import phone from "./PhoneBook.module.css";
import styles from "./Cover.module.css";

// Phone: the closed diary. Tapping it (or the hint under it) opens chapter one.
// It uses the phone diary's own layout, so the cover is the same size as the
// first page. Shut, it sits centered; the open diary sits a little right
// (room for the curl), so the book slides over as the cover swings open.
// (Laptop uses the swinging CoverLeaf inside the book instead.)
export default function Cover() {
  return (
    <div className={phone.stage}>
      <header className={phone.header}>
        <PhoneHeader />
      </header>

      <main className={`${phone.page} ${styles.centered}`}>
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
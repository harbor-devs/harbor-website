import Link from "next/link";
import { BookTopNav } from "./BookNav";
import ClosedBook from "./ClosedBook";
import { ArrowRight } from "./icons";
import { PhoneHeader } from "./PhoneNav";
import { CHAPTERS } from "../_lib/chapters";
import styles from "./Cover.module.css";

// The closed diary. Shown by the book when the URL is "/".
// Clicking it (or the hint under it) opens chapter one.
export default function Cover() {
  return (
    <div className={styles.stage}>
      <header className={styles.header}>
        <div className="hidden book:block">
          <BookTopNav />
        </div>
        <div className="book:hidden">
          <PhoneHeader />
        </div>
      </header>

      <main className={styles.main}>
        <h1 className="sr-only">Harbor, the working notebook of Abdullah Saghir</h1>

        <div className={styles.bookWrap}>
          <ClosedBook />
        </div>

        {/* Same link as the book, for mouse and touch only.
            Hidden from keyboard and screen readers: the book is the real link. */}
        <Link href={CHAPTERS[0].href} className={styles.hint} aria-hidden="true" tabIndex={-1}>
          <span className="hidden book:inline">Click to open</span>
          <span className="book:hidden">Tap to open</span>
          <ArrowRight />
        </Link>
      </main>
    </div>
  );
}
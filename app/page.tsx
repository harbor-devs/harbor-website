import Link from "next/link";
import { BookTopNav } from "./_components/BookNav";
import ClosedBook from "./_components/ClosedBook";
import { ArrowRight } from "./_components/icons";
import { PhoneHeader } from "./_components/PhoneNav";
import { CHAPTERS } from "./_lib/chapters";
import styles from "./page.module.css";

// The cover: the closed diary. Clicking it (or the hint under it) opens chapter one.
export default function CoverPage() {
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
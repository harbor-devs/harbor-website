import { BookTopNav } from "./_components/BookNav";
import ClosedBook from "./_components/ClosedBook";
import { ArrowRight } from "./_components/icons";
import { PhoneHeader } from "./_components/PhoneNav";
import styles from "./page.module.css";

// The cover: the closed diary. Clicking it opens chapter one.
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

        <p className={styles.hint} aria-hidden="true">
          <span className="hidden book:inline">Click to open</span>
          <span className="book:hidden">Tap to open</span>
          <ArrowRight />
        </p>
      </main>
    </div>
  );
}
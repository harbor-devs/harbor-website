import type { ReactNode } from "react";
import styles from "./BookSpread.module.css";

type BookSpreadProps = {
  left: ReactNode;
  right: ReactNode;
  header?: ReactNode; // goes in the free space above the book
  footer?: ReactNode; // goes in the free space under the book, same width as the book
};

// The open book on laptop: board, page stacks, paper, two pages.
// Decoration is aria-hidden so screen readers only hear the content.
export default function BookSpread({ left, right, header, footer }: BookSpreadProps) {
  return (
    <div className={styles.stage}>
      {header && <header className={styles.header}>{header}</header>}
      <main className={styles.book}>
        <div aria-hidden="true" className={styles.board} />
        <div aria-hidden="true" className={styles.stackLeft} />
        <div aria-hidden="true" className={styles.stackRight} />
        <div aria-hidden="true" className={styles.paper} />
        <section aria-label="Left page" className={styles.pageLeft}>
          {left}
        </section>
        <section aria-label="Right page" className={styles.pageRight}>
          {right}
        </section>
        {footer && <div className={styles.footer}>{footer}</div>}
      </main>
    </div>
  );
}
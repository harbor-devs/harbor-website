import type { ReactNode } from "react";
import styles from "./BookSpread.module.css";

type BookSpreadProps = {
  children: ReactNode; // the pages (FlipBook)
  header?: ReactNode; // goes in the free space above the book
  footer?: ReactNode; // goes in the free space under the book, same width as the book
};

// The open book on laptop: board, page stack edges, then the pages on top.
// Decoration is aria-hidden so screen readers only hear the content.
export default function BookSpread({ children, header, footer }: BookSpreadProps) {
  return (
    <div className={styles.stage}>
      {header && <header className={styles.header}>{header}</header>}
      <main className={styles.book}>
        <div aria-hidden="true" className={styles.board} />
        <div aria-hidden="true" className={styles.stackLeft} />
        <div aria-hidden="true" className={styles.stackRight} />

        <div className={styles.pages}>{children}</div>

        {footer && <div className={styles.footer}>{footer}</div>}
      </main>
    </div>
  );
}
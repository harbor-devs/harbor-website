import type { ReactNode } from "react";
import styles from "./BookSpread.module.css";

type BookSpreadProps = {
  children: ReactNode; // the pages (FlipBook)
  header?: ReactNode; // goes in the free space above the book
  footer?: ReactNode; // goes in the free space under the book, same width as the book
  cover?: ReactNode; // the swinging front cover (CoverLeaf)
  closed?: boolean; // book is closed: slid over so the cover is centered, board hidden
  clipLeft?: boolean; // hide the left page (the cover is covering it, or swinging)
};

// The open book on laptop: shadow, board, page stack edges, then the pages on top.
// Decoration is aria-hidden so screen readers only hear the content.
export default function BookSpread({ children, header, footer, cover, closed, clipLeft }: BookSpreadProps) {
  return (
    <div className={styles.stage} data-closed={closed || undefined} data-clip={clipLeft || undefined}>
      {header && <header className={styles.header}>{header}</header>}
      <main className={styles.book}>
        {/* Right half's shadow on the desk. The left half's shadow belongs to
            the cover (CoverLeaf), since it lands there with the cover. */}
        <div aria-hidden="true" className={styles.shadowRight} />
        <div aria-hidden="true" className={styles.board} />
        <div aria-hidden="true" className={styles.stackLeft} />
        <div aria-hidden="true" className={styles.stackRight} />

        <div className={styles.pages} inert={closed}>
          {children}
        </div>

        {cover}

        {footer && <div className={styles.footer}>{footer}</div>}
      </main>
    </div>
  );
}
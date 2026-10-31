import type { ReactNode } from "react";
import styles from "./BookSpread.module.css";

type BookSpreadProps = {
  children: ReactNode; // the pages (FlipBook)
  header?: ReactNode; // goes in the free space above the book
  footer?: ReactNode; // goes in the free space under the book, same width as the book
  cover?: ReactNode; // the swinging front cover (CoverLeaf)
  back?: ReactNode; // the swinging back cover (BackLeaf)
  closed?: boolean; // front cover shut: slid over so the cover is centered
  backClosed?: boolean; // back cover shut: slid the other way so the back is centered
  clipLeft?: boolean; // hide the left page (the front cover is covering it, or swinging)
  clipRight?: boolean; // hide the right half (the back cover is covering it, or swinging)
};

// The open book on laptop: shadow, board, page stack edges, then the pages on top.
// Decoration is aria-hidden so screen readers only hear the content.
export default function BookSpread({
  children,
  header,
  footer,
  cover,
  back,
  closed,
  backClosed,
  clipLeft,
  clipRight,
}: BookSpreadProps) {
  return (
    <div
      className={styles.stage}
      data-closed={closed || undefined}
      data-back-closed={backClosed || undefined}
      data-clip={clipLeft || undefined}
      data-clip-right={clipRight || undefined}
    >
      {header && <header className={styles.header}>{header}</header>}
      <main className={styles.book}>
        {/* Right half's shadow on the desk. The left half's shadow belongs to
            the cover (CoverLeaf), since it lands there with the cover. */}
            <div aria-hidden="true" data-part="shadow-right" className={styles.shadowRight} />
        <div aria-hidden="true" data-part="board" className={styles.board} />
        <div aria-hidden="true" data-part="stack-left" className={styles.stackLeft} />
        <div aria-hidden="true" data-part="stack-right" className={styles.stackRight} />

        <div className={styles.pages} inert={closed || backClosed}>
          {children}
        </div>

        {cover}
        {back}

        {footer && <div className={styles.footer}>{footer}</div>}
      </main>
    </div>
  );
}
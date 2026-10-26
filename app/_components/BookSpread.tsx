import { ViewTransition, type ReactNode } from "react";
import styles from "./BookSpread.module.css";

type BookSpreadProps = {
  left: ReactNode;
  right: ReactNode;
  header?: ReactNode; // goes in the free space above the book
  footer?: ReactNode; // goes in the free space under the book, same width as the book
};

// Page turn: each chapter's pages have the same names, so React pairs the
// old page with the new one. The turn type on the link picks the CSS class
// (see "Page turn" in globals.css). Any other navigation swaps instantly.
const LEFT_TURN = {
  "turn-forward": "fwd-left",
  "turn-back": "back-left",
  "open-book": "open-left", // pairs with the invisible marker in ClosedBook
  "close-book": "close-left",
  default: "none",
};
const RIGHT_TURN = {
  "turn-forward": "fwd-right",
  "turn-back": "back-right",
  "open-book": "cover-open", // pairs with the closed book itself
  "close-book": "cover-close",
  default: "none",
};

// The open book on laptop: board, then two sheets (page stack edges + page).
// Each sheet moves as one piece in the page turn, so nothing appears early.
// Decoration is aria-hidden so screen readers only hear the content.
export default function BookSpread({ left, right, header, footer }: BookSpreadProps) {
  return (
    <div className={styles.stage}>
      {header && <header className={styles.header}>{header}</header>}
      <main className={styles.book}>
        <div aria-hidden="true" className={styles.board} />

        <ViewTransition name="page-left" share={LEFT_TURN} default="none">
          <div className={styles.sheetLeft}>
            <div aria-hidden="true" className={styles.stackLeft} />
            <section aria-label="Left page" className={styles.pageLeft}>
              {left}
            </section>
          </div>
        </ViewTransition>

        <ViewTransition name="page-right" share={RIGHT_TURN} default="none">
          <div className={styles.sheetRight}>
            <div aria-hidden="true" className={styles.stackRight} />
            <section aria-label="Right page" className={styles.pageRight}>
              {right}
            </section>
          </div>
        </ViewTransition>

        {footer && <div className={styles.footer}>{footer}</div>}
      </main>
    </div>
  );
}
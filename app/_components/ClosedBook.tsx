import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { CHAPTERS, turnTypes } from "../_lib/chapters";
import Flourish from "./Flourish";
import styles from "./ClosedBook.module.css";

// The closed diary on the cover page. The whole book is one link to chapter one.
// The look (spine, paper, frame, ribbon) is one baked image; the text is real HTML on top.
// Cover text is aria-hidden: the page has its own hidden <h1>, and the link says what it does.
//
// Page turn: the book borrows the right page's name and a tiny marker borrows the
// left page's name. React pairs them with the open book's pages, so opening slides
// the book into place, folds the cover onto the spine and unfolds the first page.
// Closing plays it backwards (see "Page turn" in globals.css).
export default function ClosedBook() {
  return (
    <ViewTransition
      name="page-right"
      share={{ "open-book": "cover-open", "close-book": "cover-close", default: "none" }}
      default="none"
    >
      <Link
        href={CHAPTERS[0].href}
        className={styles.book}
        aria-label="Open the book"
        transitionTypes={turnTypes("cover", CHAPTERS[0].slug)}
      >
        <ViewTransition
          name="page-left"
          share={{ "open-book": "open-left", "close-book": "close-left", default: "none" }}
          default="none"
        >
          <span aria-hidden="true" className={styles.marker} />
        </ViewTransition>

        <span aria-hidden="true" className={styles.texture} />

        <span aria-hidden="true" className={styles.spine}>
          <span className={styles.spineText}>Harbor &middot; Vol. I</span>
        </span>

        <span aria-hidden="true" className={styles.face}>
          <span className={styles.kicker}>Vol. I &middot; MMXXVI</span>

          {/* Arrow ornament with a knot in the middle */}
          <svg className={styles.ornament} viewBox="0 0 230 34" fill="none" stroke="currentColor" strokeWidth="1.3">
            <path d="M6 17H86M144 17H224" />
            <path d="M2 17L18 10L14 17L18 24Z" fill="currentColor" />
            <path d="M228 17L212 10L216 17L212 24Z" fill="currentColor" />
            <path d="M115 17C108 4 94 5 95 13C96 19 104 18 103 13" />
            <path d="M115 17C108 30 94 29 95 21C96 15 104 16 103 21" />
            <path d="M115 17C122 4 136 5 135 13C134 19 126 18 127 13" />
            <path d="M115 17C122 30 136 29 135 21C134 15 126 16 127 21" />
            <path d="M115 6V28" strokeWidth="2.2" />
            <circle cx="115" cy="4" r="3" fill="currentColor" />
            <circle cx="115" cy="30" r="3" fill="currentColor" />
            <circle cx="89" cy="17" r="1.8" fill="currentColor" />
            <circle cx="141" cy="17" r="1.8" fill="currentColor" />
          </svg>

          <Image src="/cover-logo.svg" alt="" width={210} height={231} unoptimized priority className={styles.logo} />

          <span className={styles.title}>Harbor</span>
          <Flourish className={styles.flourish} />
          <span className={styles.subtitle}>The working notebook of Abdullah Saghir</span>
        </span>
      </Link>
    </ViewTransition>
  );
}

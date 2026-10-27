import Image from "next/image";
import Link from "next/link";
import {
  BACK_COVER_HREF,
  CHAPTERS,
  COVER_HREF,
  type ChapterNav,
  type ChapterSlug,
} from "../_lib/chapters";
import { ArrowLeft, ArrowRight, Diamond } from "./icons";
import styles from "./BookNav.module.css";

// Laptop top nav: logo (to the cover) + the six chapters.
// On the cover there's no current chapter, and no logo (you're already home).
export function BookTopNav({ current }: { current?: ChapterSlug }) {
  return (
    <nav aria-label="Main" className={styles.topNav}>
      {current && (
        <Link href={COVER_HREF} className={styles.logo}>
          <Image src="/logo-mark.svg" alt="Harbor, back to the cover" width={44} height={48} unoptimized />
        </Link>
      )}
      <ul className={styles.links}>
        {CHAPTERS.map((c) => (
          <li key={c.slug}>
            <Link
              href={c.href}
              className={styles.link}
              aria-current={c.slug === current ? "page" : undefined}
            >
              {c.navLabel}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// Laptop bottom bar: previous / current chapter / next.
// At the ends, "Close the book" takes you to the cover (front or back).
export function BookBottomBar({ nav }: { nav: ChapterNav }) {
  const { chapter, prev, next } = nav;

  return (
    <nav aria-label="Chapter" className={styles.bar}>
      <Link href={prev ? prev.href : COVER_HREF} className={styles.barLink}>
        <ArrowLeft />
        {prev ? prev.title : "Close the book"}
      </Link>

      <p className={styles.current}>
        <Diamond />
        <span className="sr-only">Current chapter: </span>
        {chapter.title}
      </p>

      <Link href={next ? next.href : BACK_COVER_HREF} className={styles.barLink}>
        {next ? next.title : "Close the book"}
        <ArrowRight />
      </Link>
    </nav>
  );
}
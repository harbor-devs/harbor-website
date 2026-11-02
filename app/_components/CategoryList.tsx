import Link from "next/link";
import { CATEGORIES, categoryHref } from "../_lib/portfolio";
import styles from "./ChapterContents.module.css";

// The dotted category list on the Portfolio page. Same look as the Intro contents list.
export default function CategoryList({ variant }: { variant: "book" | "phone" }) {
  return (
    <nav aria-label="Portfolio categories" className={variant === "book" ? styles.book : styles.phone}>
      <ol className={styles.list}>
        {CATEGORIES.map((c) => (
          <li key={c.slug}>
            <Link href={categoryHref(c.slug)} className={styles.item}>
              <span className={styles.itemTitle}>{c.title}</span>
              <span aria-hidden="true" className={styles.dots} />
              <span className={styles.numeral}>{c.numeral}</span>
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
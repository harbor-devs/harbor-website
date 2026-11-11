import Link from "next/link";
import { CATEGORIES, categoryHref } from "../_lib/portfolio";
import styles from "./ChapterContents.module.css";

// The dotted category list on the Portfolio page. Same look as the Intro contents list.
// On the laptop page: an optional heading above it and an optional hint line under it.
export default function CategoryList({
  variant,
  heading,
  hint,
}: {
  variant: "book" | "phone";
  heading?: string;
  hint?: string;
}) {
  const isBook = variant === "book";

  return (
    <nav aria-label="Portfolio categories" className={isBook ? styles.book : styles.phone}>
      {isBook && heading && <h3 className={styles.heading}>{heading}</h3>}
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
      {isBook && hint && <p className={styles.hint}>{hint}</p>}
    </nav>
  );
}
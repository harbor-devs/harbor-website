import Link from "next/link";
import { CHAPTERS } from "../_lib/chapters";
import styles from "./ChapterContents.module.css";

// The dotted contents list on the Intro page.
// "book" = laptop right page, "phone" = sits on the phone page's ruled lines.
export default function ChapterContents({ variant }: { variant: "book" | "phone" }) {
  return (
    <nav aria-label="Contents" className={variant === "book" ? styles.book : styles.phone}>
      {variant === "book" && <h3 className={styles.heading}>Contents</h3>}
      <ol className={styles.list}>
        {CHAPTERS.map((c) => (
          <li key={c.slug}>
            <Link href={c.href} className={styles.item}>
              <span className={styles.itemTitle}>{c.title}</span>
              <span aria-hidden="true" className={styles.dots} />
              <span className={styles.numeral}>
                <span className="sr-only">chapter </span>
                {c.numeral}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

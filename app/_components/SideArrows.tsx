import Link from "next/link";
import { ArrowLeft, ArrowRight } from "./icons";
import styles from "./SideArrows.module.css";

// One arrow: where it goes, and what it does (read out by screen readers, shown on hover)
type Side = { href: string; label: string } | null;

type SideArrowsProps = {
  prev: Side; // left arrow
  next: Side; // right arrow
};

// Laptop: round arrow buttons beside the book, halfway down.
// They sit in the bar under the book (so they only show once the book has
// stopped moving) and are lifted up beside it from there.
export default function SideArrows({ prev, next }: SideArrowsProps) {
  return (
    <div className={styles.arrows}>
      {prev && (
        <Link
          href={prev.href}
          scroll={false}
          className={`${styles.arrow} ${styles.left}`}
          aria-label={prev.label}
          title={prev.label}
        >
          <ArrowLeft />
        </Link>
      )}
      {next && (
        <Link
          href={next.href}
          scroll={false}
          className={`${styles.arrow} ${styles.right}`}
          aria-label={next.label}
          title={next.label}
        >
          <ArrowRight />
        </Link>
      )}
    </div>
  );
}
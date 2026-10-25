import Image from "next/image";
import Link from "next/link";
import {
  BACK_COVER_HREF,
  COVER_HREF,
  type ChapterNav,
  type ChapterSlug,
} from "../_lib/chapters";
import { ArrowLeft, ArrowRight } from "./icons";
import PhoneMenu from "./PhoneMenu";
import styles from "./PhoneNav.module.css";

// Phone header: logo (to the cover) + Menu button.
export function PhoneHeader({ current }: { current: ChapterSlug }) {
  return (
    <div className={styles.header}>
      <Link href={COVER_HREF} className={styles.logo}>
        <Image src="/logo-mark.svg" alt="Harbor, back to the cover" width={40} height={44} unoptimized />
      </Link>
      <PhoneMenu current={current} />
    </div>
  );
}

// Phone bottom bar: previous / "2 of 6" / next.
export function PhoneTurnBar({ nav }: { nav: ChapterNav }) {
  const { number, total, prev, next } = nav;

  return (
    <nav aria-label="Turn the page" className={styles.bar}>
      <Link href={prev ? prev.href : COVER_HREF} className={styles.link}>
        <ArrowLeft />
        {prev ? prev.shortLabel : "Cover"}
      </Link>

      <p className={styles.count}>
        {number} of {total}
      </p>

      <Link href={next ? next.href : BACK_COVER_HREF} className={styles.link}>
        {next ? next.shortLabel : "Close"}
        <ArrowRight />
      </Link>
    </nav>
  );
}
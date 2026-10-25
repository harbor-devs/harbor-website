import type { ReactNode } from "react";
import type { ChapterSlug } from "../_lib/chapters";
import styles from "./PhonePage.module.css";

// Each chapter has its own stain pattern baked into its paper image.
// Record<ChapterSlug, ...> makes TypeScript complain if a chapter is missing here.
const PAPER: Record<ChapterSlug, string> = {
  introduction: "/textures/page-phone-intro.webp",
  portfolio: "/textures/page-phone-portfolio.webp",
  services: "/textures/page-phone-services.webp",
  now: "/textures/page-phone-now.webp",
  sketchbook: "/textures/page-phone-sketchbook.webp",
  contact: "/textures/page-phone-contact.webp",
};

type PhonePageProps = {
  slug: ChapterSlug;
  header?: ReactNode; // goes in the free space above the page
  footer?: ReactNode; // goes under the page, same width as the page
  children: ReactNode;
};

// The single A5 page on phones: stack edges, paper, curl, content.
export default function PhonePage({ slug, header, footer, children }: PhonePageProps) {
  return (
    <div className={styles.stage}>
      {header && <header className={styles.header}>{header}</header>}
      <main className={styles.page}>
        <div aria-hidden="true" className={styles.edgeRight} />
        <div aria-hidden="true" className={styles.edgeBottom} />
        <div
          aria-hidden="true"
          className={styles.paper}
          style={{ backgroundImage: `url(${PAPER[slug]})` }}
        />
        <div aria-hidden="true" className={styles.curl} />
        <section aria-label="Page" className={styles.content}>
          {children}
        </section>
        {footer && <div className={styles.footer}>{footer}</div>}
      </main>
    </div>
  );
}
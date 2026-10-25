import type { ReactNode } from "react";
import styles from "./PhonePage.module.css";

// Each chapter has its own stain pattern baked into its paper image
export type Chapter =
  | "intro"
  | "portfolio"
  | "services"
  | "now"
  | "sketchbook"
  | "contact";

type PhonePageProps = {
  chapter: Chapter;
  children: ReactNode;
};

// The single A5 page on phones: stack edges, paper, curl, content.
export default function PhonePage({ chapter, children }: PhonePageProps) {
  return (
    <div className={styles.stage}>
      <div className={styles.page}>
        <div aria-hidden="true" className={styles.edgeRight} />
        <div aria-hidden="true" className={styles.edgeBottom} />
        <div
          aria-hidden="true"
          className={styles.paper}
          style={{ backgroundImage: `url(/textures/page-phone-${chapter}.webp)` }}
        />
        <div aria-hidden="true" className={styles.curl} />
        <section aria-label="Page" className={styles.content}>
          {children}
        </section>
      </div>
    </div>
  );
}
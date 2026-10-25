"use client";

import Link from "next/link";
import { useId, useRef } from "react";
import { CHAPTERS, COVER_HREF, type ChapterSlug } from "../_lib/chapters";
import { CloseIcon, MenuLines } from "./icons";
import styles from "./PhoneMenu.module.css";

// The phone menu: a native <dialog> styled as a Contents page.
// showModal() gives us for free: focus moves inside, Tab stays inside,
// Escape closes it, and focus returns to the Menu button after.
export default function PhoneMenu({ current }: { current: ChapterSlug }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button type="button" className={styles.trigger} onClick={open} aria-haspopup="dialog">
        Menu <MenuLines />
      </button>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-labelledby={titleId}
        // A tap on the dark area around the page (the dialog itself) closes it
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className={styles.sheet}>
          <p className={styles.label}>Harbor</p>
          <h2 id={titleId} className={styles.title}>
            Contents
          </h2>

          <button type="button" className={styles.close} onClick={close} aria-label="Close menu">
            <CloseIcon />
          </button>

          <nav aria-label="Chapters" className={styles.toc}>
            <ol className={styles.list}>
              {CHAPTERS.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={c.href}
                    className={styles.item}
                    aria-current={c.slug === current ? "page" : undefined}
                    onClick={close}
                  >
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

          <Link href={COVER_HREF} className={styles.cover} onClick={close}>
            Close the book
          </Link>
        </div>
      </dialog>
    </>
  );
}
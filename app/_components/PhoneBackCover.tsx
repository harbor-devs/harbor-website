import Image from "next/image";
import { BackCoverBar } from "./BookNav";
import { PhoneHeader } from "./PhoneNav";
import cover from "./Cover.module.css";
import phone from "./PhoneBook.module.css";
import styles from "./PhoneBackCover.module.css";

type BackBoardProps = {
  bare?: boolean; // only the board: no page edges, ribbon or shadow (the swinging cover)
  gift?: boolean; // the thank-you note and flower
  still?: boolean; // no ink-in or flower animation (they're already there)
};

// The back cover board, drawn spine-left like the front cover. Whoever shows it
// flips it, so the spine ends up on the right like a real back cover.
// Same shape as the phone diary page (330 x 467), so it sits exactly on the last page.
export function BackBoard({ bare = false, gift = true, still = false }: BackBoardProps) {
  return (
    <div className={styles.board} data-bare={bare || undefined} data-still={still || undefined}>
      <div aria-hidden="true" className={styles.texture} />

      <div aria-hidden="true" className={styles.mark}>
        <Image src="/cover-logo.svg" alt="" width={210} height={231} unoptimized className={styles.logo} />
      </div>

      {/* Flipped back so it reads the right way */}
      {gift && (
        <div className={styles.gift}>
          <p className={styles.note}>
            You stayed till the very end.
            <br />
            Thank you for being here,
            <br />
            I truly appreciate it.
            <br />
            Keep the flower, it&rsquo;s yours.
            <span className={styles.sig}>~ Abdullah</span>
          </p>
          <Image
            src="/flower-sprig.svg"
            alt=""
            aria-hidden="true"
            width={240}
            height={320}
            unoptimized
            className={styles.flower}
          />
        </div>
      )}
    </div>
  );
}

// Phone: the closed diary seen from the back, at /the-end.
// Uses the phone diary's own layout (like Cover), so it's the same size as the
// last page and the swinging back cover lands exactly on it.
// The note inks in, then the pressed flower lands.
// Under it: back to the last chapter, or read again.
export default function PhoneBackCover() {
  return (
    <div className={phone.stage}>
      <header className={phone.header}>
        <PhoneHeader />
      </header>

      <main className={`${phone.page} ${cover.centered}`}>
        {/* Mirrored, so the spine is on the right */}
        <div className={styles.flip}>
          <BackBoard />
        </div>

        <div className={phone.footer}>
          <div className={styles.bar}>
            <BackCoverBar />
          </div>
        </div>
      </main>
    </div>
  );
}
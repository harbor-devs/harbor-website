import Image from "next/image";
import { BackCoverBar } from "./BookNav";
import { PhoneHeader } from "./PhoneNav";
import cover from "./Cover.module.css";
import styles from "./PhoneBackCover.module.css";

// Phone: the closed diary seen from the back, at /the-end.
// Same layout as the phone front cover. The look is the laptop's back cover
// (BackLeaf's outside): the note inks in, then the pressed flower lands.
// Under it: back to the last chapter, or read again.
export default function PhoneBackCover() {
  return (
    <div className={cover.stage}>
      <header className={cover.header}>
        <PhoneHeader />
      </header>

      <main className={cover.main}>
        <div className={cover.bookWrap}>
          <div className={styles.size}>
            {/* Mirrored, so the spine ends up on the right like a real back cover */}
            <div className={styles.book}>
              <div aria-hidden="true" className={styles.texture} />

              <div aria-hidden="true" className={styles.mark}>
                <Image src="/cover-logo.svg" alt="" width={210} height={231} unoptimized className={styles.logo} />
              </div>

              {/* Flipped back so it reads the right way */}
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
            </div>
          </div>
        </div>

        <div className={styles.bar}>
          <BackCoverBar />
        </div>
      </main>
    </div>
  );
}
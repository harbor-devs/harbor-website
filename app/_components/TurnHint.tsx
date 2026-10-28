import styles from "./TurnHint.module.css";

// A quiet hint shown only on the first chapter, until the first turn.
export default function TurnHint() {
  return (
    <p className={styles.hint}>
      Scroll, use the arrow keys, or drag a page corner to turn the pages
    </p>
  );
}
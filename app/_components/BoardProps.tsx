import b from "./Board.module.css";
import p from "./BoardProps.module.css";

// Small touches on the Portfolio board: red marker and desk bits.
// Pure decoration: hidden from screen readers, no clicks.

// Shared "ink" filter: makes red marker lines wobble like a real pen. Render once per page.
export function MarkerInk() {
  return (
    <svg className={p.defs} aria-hidden="true">
      <filter id="markerInk">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="4" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="2.5" />
      </filter>
    </svg>
  );
}

// Hand-drawn red circle around a stamp (open at the end, like a quick pen loop)
export function MarkerCircle() {
  return (
    <svg className={p.circle} viewBox="0 0 120 50" preserveAspectRatio="none" aria-hidden="true">
      <path filter="url(#markerInk)" d="M 20 11 C 44 1, 100 3, 113 19 C 121 33, 93 46, 57 45 C 21 44, 3 35, 8 23 C 12 13, 33 6, 55 6" />
    </svg>
  );
}

// "start here" scribble with an arrow pointing at the first case
export function StartHere() {
  return (
    <span className={p.startHere} aria-hidden="true">
           <span className={p.startTag}>start here</span>
      <svg viewBox="0 0 70 40">
        <path filter="url(#markerInk)" d="M 10 4 C 22 22, 40 30, 62 34" />
        <path filter="url(#markerInk)" d="M 50 26 L 63 34 L 51 39" />
      </svg>
    </span>
  );
}

// Bent wire paper clip hanging over a paper's top edge
export function PaperClip() {
  return (
    <svg className={p.clip} viewBox="0 0 16 50" aria-hidden="true">
      <path d="M 5 15 V 40 a 3 3 0 0 0 6 0 V 6 a 5 5 0 0 0 -10 0 V 42 a 7 7 0 0 0 14 0 V 12" />
    </svg>
  );
}

// Yellowed sticky tape across a paper's top-left corner
export function Tape() {
  return <span className={p.tape} aria-hidden="true" />;
}
// Second sheet peeking out from behind a clipped paper, like a small stack
export function UnderSheet() {
  return <span className={`${b.aged} ${b.tornC} ${p.under}`} aria-hidden="true" />;
}
import type { CSSProperties } from "react";
import { boardFonts } from "../_lib/boardFonts";
import { FIBERS, NOISE, STAIN } from "../_lib/paperTextures";
import s from "./DeskNotes.module.css";

// One note on the desk: a small typed label and one plain line
export type DeskNote = { tag: string; text: string };

// How each note looks, in order: paper tone, torn edge, tilt, where the tape sits
const LOOKS = [
  { tone: s.toneA, torn: s.tornA, red: true, tilt: -2.5, tapeX: "30%", tapeTilt: 4 },
  { tone: s.toneB, torn: s.tornB, red: false, tilt: 2, tapeX: "8%", tapeTilt: -16 },
  { tone: s.toneC, torn: s.tornC, red: true, tilt: 1.5, tapeX: "62%", tapeTilt: 14 },
  { tone: s.toneD, torn: s.tornA, red: false, tilt: -1.8, tapeX: "36%", tapeTilt: -3 },
  { tone: s.toneE, torn: s.tornB, red: true, tilt: 1, tapeX: "40%", tapeTilt: 2 },
];

// Paper textures as CSS variables (same pictures paintSheet uses for the phone page turn)
const TEXTURES = {
  "--noise": `url("${NOISE}")`,
  "--stain": `url("${STAIN}")`,
  "--fibers": `url("${FIBERS}")`,
} as CSSProperties;

// Rough vintage notes taped onto the page (Now chapter).
// The data-paint-* markers let paintSheet draw them while a phone page turns.
export default function DeskNotes({
  notes,
  variant,
}: {
  notes: readonly DeskNote[];
  variant: "book" | "phone";
}) {
  return (
    <ul className={`${boardFonts} ${s.notes} ${variant === "book" ? s.book : s.phone}`} style={TEXTURES}>
      {notes.map((note, i) => {
        const look = LOOKS[i % LOOKS.length];
        const style = {
          "--tilt": `${look.tilt}deg`,
          "--tape-x": look.tapeX,
          "--tape-tilt": `${look.tapeTilt}deg`,
        } as CSSProperties;

        return (
          <li key={note.text} className={s.slot} style={style} data-paint-slot="">
            <span className={s.tape} aria-hidden="true" data-paint-tape="" />
            <div className={`${s.note} ${look.tone} ${look.torn}`} data-paint-paper="">
              <p className={`${s.tag} ${look.red ? s.tagRed : ""}`}>{note.tag}</p>
              <p className={s.text}>{note.text}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

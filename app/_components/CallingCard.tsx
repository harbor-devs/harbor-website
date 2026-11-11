import type { CSSProperties } from "react";
import { boardFonts } from "../_lib/boardFonts";
import { FIBERS, NOISE, STAIN } from "../_lib/paperTextures";
import s from "./CallingCard.module.css";

// The one way to hire Harbor: his Upwork profile
export const UPWORK_URL = "https://www.upwork.com/freelancers/~012a87c7112f64d814";

// Paper textures as CSS variables (same pictures paintSheet uses for the phone page turn)
const TEXTURES = {
  "--noise": `url("${NOISE}")`,
  "--stain": `url("${STAIN}")`,
  "--fibers": `url("${FIBERS}")`,
} as CSSProperties;

// An old calling card held by photo corners (Services chapter).
// data-paint-slot / data-paint-paper let paintSheet draw it while a phone page turns.
export default function CallingCard({ variant }: { variant: "book" | "phone" }) {
  return (
    <div
      className={`${boardFonts} ${s.slot} ${variant === "book" ? s.book : s.phone}`}
      style={TEXTURES}
      data-paint-slot=""
    >
      {/* Photo corners: laptop only, the phone page turn can't draw them */}
      {variant === "book" && (
        <>
          <span className={`${s.corner} ${s.tl}`} aria-hidden="true" />
          <span className={`${s.corner} ${s.tr}`} aria-hidden="true" />
          <span className={`${s.corner} ${s.bl}`} aria-hidden="true" />
          <span className={`${s.corner} ${s.br}`} aria-hidden="true" />
        </>
      )}

      <div className={s.card} data-paint-paper="">
        <p className={s.name}>Abdullah Saghir</p>
        <span className={s.rule} aria-hidden="true" />
        <p className={s.what}>Websites, web apps and small tools</p>
        <a className={s.link} href={UPWORK_URL} target="_blank" rel="noopener noreferrer">
          Hire me on Upwork
        </a>
      </div>
    </div>
  );
}
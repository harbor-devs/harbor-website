import { Homemade_Apple, IM_Fell_English_SC, Rye, Special_Elite } from "next/font/google";

// Fonts only the portfolio boards use.
// preload: false = don't fetch them on first visit (the cover doesn't need them),
// so the shutter can open sooner. PreloadTextures fetches them in the background
// after the shutter opens, so the boards are ready before anyone gets there.

// Poster lettering for titles
const rye = Rye({ weight: "400", subsets: ["latin"], variable: "--font-rye", display: "swap", preload: false });

// Small caps for labels like "CASE No. 001"
const fellSC = IM_Fell_English_SC({ weight: "400", subsets: ["latin"], variable: "--font-fell-sc", display: "swap", preload: false });

// Typewriter for stamps and "made with"
const elite = Special_Elite({ weight: "400", subsets: ["latin"], variable: "--font-elite", display: "swap", preload: false });

// Handwriting, only for small notes
const apple = Homemade_Apple({ weight: "400", subsets: ["latin"], variable: "--font-hand", display: "swap", preload: false });

export const boardFonts = [rye, fellSC, elite, apple].map((f) => f.variable).join(" ");

// The real font names, so PreloadTextures can fetch them in the background
export const boardFontFamilies = [rye, fellSC, elite, apple].map((f) => f.style.fontFamily);
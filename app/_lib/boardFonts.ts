import { Homemade_Apple, IM_Fell_English_SC, Rye, Special_Elite } from "next/font/google";

// Fonts only the portfolio boards use

// Poster lettering for titles
const rye = Rye({ weight: "400", subsets: ["latin"], variable: "--font-rye", display: "swap" });

// Small caps for labels like "CASE No. 001"
const fellSC = IM_Fell_English_SC({ weight: "400", subsets: ["latin"], variable: "--font-fell-sc", display: "swap" });

// Typewriter for stamps and "made with"
const elite = Special_Elite({ weight: "400", subsets: ["latin"], variable: "--font-elite", display: "swap" });

// Handwriting, only for small notes
const apple = Homemade_Apple({ weight: "400", subsets: ["latin"], variable: "--font-hand", display: "swap" });

export const boardFonts = [rye, fellSC, elite, apple].map((f) => f.variable).join(" ");
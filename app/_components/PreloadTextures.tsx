"use client";

import { useEffect } from "react";

// Downloads the paper pictures in the background once the site has opened,
// so a page already has its paper when it turns (no brown flash, no text-first pop in).
// Same 900px split as the book: phones get the phone pages, laptops the big spread.

const PHONE = [
  "/textures/page-phone-intro.webp",
  "/textures/page-phone-portfolio.webp",
  "/textures/page-phone-services.webp",
  "/textures/page-phone-now.webp",
  "/textures/page-phone-sketchbook.webp",
];
const LAPTOP = ["/textures/paper-spread.webp"];
const BOTH = ["/textures/cover.webp", "/textures/wood-wall.webp"];

// Keeps the pictures alive until they finish downloading
const kept: HTMLImageElement[] = [];

export default function PreloadTextures() {
  useEffect(() => {
    const isLaptop = window.matchMedia("(min-width: 900px)").matches;
    const list = [...(isLaptop ? LAPTOP : PHONE), ...BOTH];

    const start = () => {
      for (const src of list) {
        const img = new Image();
        img.decoding = "async";
        img.src = src;
        kept.push(img);
      }
    };

    // Wait until the first screen is done, so the cover loads first
    if (document.readyState === "complete") {
      start();
      return;
    }
    window.addEventListener("load", start, { once: true });
    return () => window.removeEventListener("load", start);
  }, []);

  return null;
}
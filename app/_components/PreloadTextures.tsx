"use client";

import { useEffect } from "react";

// Downloads the paper pictures in the background once the site has opened,
// so a page already has its paper when it turns (no brown flash, no text-first pop in).
// Same 900px split as the book: phones get the phone pages, laptops the big spread.
// It waits until the camera shutter has finished opening, so the download
// doesn't make the opening stutter on a first visit.

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
    let started = false;

    const start = () => {
      if (started) return;
      started = true;
      for (const src of list) {
        const img = new Image();
        img.decoding = "async";
        img.src = src;
        kept.push(img);
      }
    };

    // The shutter already opened (or there is none): start now
    if (document.documentElement.dataset.shutterOpen === "true") {
      start();
      return;
    }
    // Otherwise wait for the shutter to say it is open, but never more than 8 seconds
    window.addEventListener("harbor:shutter-open", start, { once: true });
    const fallback = window.setTimeout(start, 8000);
    return () => {
      window.removeEventListener("harbor:shutter-open", start);
      window.clearTimeout(fallback);
    };
  }, []);

  return null;
}
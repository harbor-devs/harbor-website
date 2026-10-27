"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { CHAPTERS, type ChapterSlug } from "../_lib/chapters";

type BookProps = {
  spreads: Record<ChapterSlug, ReactNode>;
};

// The one book that stays on screen. It reads the URL and shows that chapter.
export default function Book({ spreads }: BookProps) {
  const pathname = usePathname();
  const chapter = CHAPTERS.find((c) => c.href === pathname) ?? CHAPTERS[0];
  return spreads[chapter.slug];
}
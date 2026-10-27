import type { ReactNode } from "react";
import Book from "../_components/Book";
import ChapterShell from "../_components/ChapterShell";
import { introduction } from "../_chapters/Introduction";
import { placeholder } from "../_chapters/Placeholder";
import { CHAPTERS, type ChapterSlug } from "../_lib/chapters";

// Each chapter's content, by slug
const CONTENT = {
  introduction,
  portfolio: placeholder("portfolio"),
  services: placeholder("services"),
  now: placeholder("now"),
  sketchbook: placeholder("sketchbook"),
  contact: placeholder("contact"),
};

// Stays on screen across all chapters, so the book never reloads.
export default function BookLayout({ children }: { children: ReactNode }) {
  const spreads = Object.fromEntries(
    CHAPTERS.map((c) => [c.slug, <ChapterShell key={c.slug} slug={c.slug} {...CONTENT[c.slug]} />]),
  ) as Record<ChapterSlug, ReactNode>;

  return (
    <>
      <Book spreads={spreads} />
      {children}
    </>
  );
}
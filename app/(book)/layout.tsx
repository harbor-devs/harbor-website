import type { ReactNode } from "react";
import Book, { type ChapterContent } from "../_components/Book";
import { introduction } from "../_chapters/Introduction";
import { now } from "../_chapters/Now";
import { portfolio } from "../_chapters/Portfolio";
import { placeholder } from "../_chapters/Placeholder";
import type { ChapterSlug } from "../_lib/chapters";

// Each chapter's content, by slug
const CONTENT: Record<ChapterSlug, ChapterContent> = {
  introduction,
  portfolio,
  now,
  services: placeholder("services"),
  sketchbook: placeholder("sketchbook"),
};

// Stays on screen across all chapters, so the book never reloads.
export default function BookLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Book content={CONTENT} />
      {children}
    </>
  );
}

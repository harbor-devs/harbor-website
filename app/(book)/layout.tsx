import type { ReactNode } from "react";
import Book, { type ChapterContent } from "../_components/Book";
import { introduction } from "../_chapters/Introduction";
import { placeholder } from "../_chapters/Placeholder";
import type { ChapterSlug } from "../_lib/chapters";

// Each chapter's content, by slug
const CONTENT: Record<ChapterSlug, ChapterContent> = {
  introduction,
  portfolio: placeholder("portfolio"),
  services: placeholder("services"),
  now: placeholder("now"),
  sketchbook: placeholder("sketchbook"),
  contact: placeholder("contact"),
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
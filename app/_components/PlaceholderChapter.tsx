import type { ChapterSlug } from "../_lib/chapters";
import { placeholder } from "../_chapters/Placeholder";
import ChapterShell from "./ChapterShell";

export default function PlaceholderChapter({ slug }: { slug: ChapterSlug }) {
  return <ChapterShell slug={slug} {...placeholder(slug)} />;
}
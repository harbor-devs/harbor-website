// The diary's chapters, in reading order.
// Every navigation (top nav, bottom bar, phone menu, prev/next) reads from here,
// so changing the order or a title only happens in this one file.

export type ChapterSlug =
  | "introduction"
  | "portfolio"
  | "services"
  | "now"
  | "sketchbook"
  | "contact";

export type Chapter = {
  slug: ChapterSlug;
  href: `/${ChapterSlug}`;
  title: string; // full name: bottom bar, phone menu
  navLabel: string; // laptop top nav
  shortLabel: string; // phone prev/next links (tight space)
  numeral: string; // roman numeral for the contents list
};

export const CHAPTERS: readonly Chapter[] = [
  { slug: "introduction", href: "/introduction", title: "Introduction", navLabel: "Home", shortLabel: "Intro", numeral: "i" },
  { slug: "portfolio", href: "/portfolio", title: "Portfolio", navLabel: "Portfolio", shortLabel: "Portfolio", numeral: "ii" },
  { slug: "services", href: "/services", title: "Services", navLabel: "Services", shortLabel: "Services", numeral: "iii" },
  { slug: "now", href: "/now", title: "Now", navLabel: "Now", shortLabel: "Now", numeral: "iv" },
  { slug: "sketchbook", href: "/sketchbook", title: "Sketchbook", navLabel: "Sketchbook", shortLabel: "Sketchbook", numeral: "v" },
  { slug: "contact", href: "/contact", title: "Contact", navLabel: "Contact", shortLabel: "Contact", numeral: "vi" },
];

// Before the first chapter: the closed front cover.
export const COVER_HREF = "/";

// After the last chapter: the closed back cover (the flower thank-you comes here too).
export const BACK_COVER_HREF = "/the-end";

// Everything a page needs to draw its navigation.
export function getChapterNav(slug: ChapterSlug) {
  const index = CHAPTERS.findIndex((c) => c.slug === slug);
  if (index === -1) {
    throw new Error(`Unknown chapter: ${slug}`);
  }

  return {
    chapter: CHAPTERS[index],
    number: index + 1, // 1-based, for "2 of 6"
    total: CHAPTERS.length,
    prev: index > 0 ? CHAPTERS[index - 1] : null, // null = go to the cover
    next: index < CHAPTERS.length - 1 ? CHAPTERS[index + 1] : null, // null = close the book
  };
}

// The object getChapterNav returns, so components can type their props.
export type ChapterNav = ReturnType<typeof getChapterNav>;
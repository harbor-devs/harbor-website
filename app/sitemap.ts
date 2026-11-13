import type { MetadataRoute } from "next";
import { CATEGORIES } from "./_lib/portfolio";
import { ITEMS } from "./_lib/portfolioItems";

// Makes /sitemap.xml: the list of every real page, so search engines can find them all.
// force-static so it works with the static export (Cloudflare Pages).
export const dynamic = "force-static";

const SITE = "https://harbordevs.com";

// The book's chapters
const BOOK_PAGES = ["", "/introduction", "/portfolio", "/now", "/services", "/sketchbook", "/the-end"];

export default function sitemap(): MetadataRoute.Sitemap {
  const built = new Date();

  const book = BOOK_PAGES.map((path) => ({
    url: `${SITE}${path}`,
    lastModified: built,
  }));

  // Only boards that actually have items (hidden empty boards stay out)
  const boards = CATEGORIES.filter((c) => (ITEMS[c.slug]?.length ?? 0) > 0).map((c) => ({
    url: `${SITE}/portfolio/${c.slug}`,
    lastModified: built,
  }));

  return [...book, ...boards];
}
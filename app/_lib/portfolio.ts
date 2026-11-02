// Portfolio categories, in the order the book lists them.
// The book's Portfolio page and the /portfolio/<slug> board pages both read from here.

export type CategorySlug = "software" | "games" | "articles" | "research" | "certifications";

export type Category = {
  slug: CategorySlug;
  title: string;
  numeral: string; // roman numeral shown at the end of the dotted line
};

export const CATEGORIES: readonly Category[] = [
  { slug: "software", title: "Software & Websites", numeral: "i" },
  { slug: "games", title: "Games", numeral: "ii" },
  { slug: "articles", title: "Articles", numeral: "iii" },
  { slug: "research", title: "Research Papers", numeral: "iv" },
  { slug: "certifications", title: "Certifications", numeral: "v" },
];

// Where each category's board lives, e.g. /portfolio/software
export const categoryHref = (slug: CategorySlug) => `/portfolio/${slug}`;
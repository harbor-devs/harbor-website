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
  // Games is hidden for now (the game is a file, not playable in the browser yet).
  // To bring it back: uncomment this line and renumber the ones below.
  // { slug: "games", title: "Games", numeral: "ii" },
  { slug: "articles", title: "Articles", numeral: "ii" },
  { slug: "research", title: "Research Papers", numeral: "iii" },
  { slug: "certifications", title: "Certifications", numeral: "iv" },
];

// Where each category's board lives, e.g. /portfolio/software
export const categoryHref = (slug: CategorySlug) => `/portfolio/${slug}`;
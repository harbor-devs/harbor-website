import type { CategorySlug } from "./portfolio";

// What each paper on a board shows. Case numbers come from the order here.

export type Status = "live" | "prototype" | "in-progress";

export type CaseLink = { label: string; href: string };

export type PortfolioItem = {
  title: string;
  line: string; // one plain line: what it does
  status: Status;
  madeWith?: string;
  image?: string; // optional screenshot in /public, e.g. "/projects/ghatcpt.webp"
  links: CaseLink[];
};

export const ITEMS: Record<CategorySlug, PortfolioItem[]> = {
  software: [
    {
      title: "GHATCPT",
      line: "An AI that makes you try first, and only then helps.",
      status: "live",
      madeWith: "Next.js, Gemini API",
      links: [
        { label: "Visit", href: "https://ghatcpt.vercel.app" },
        { label: "Source", href: "https://github.com/abdullah-saghir/ghatcpt" },
      ],
    },
  ],
  games: [],
  articles: [],
  research: [],
  certifications: [],
};
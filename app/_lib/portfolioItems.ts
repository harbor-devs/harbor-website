import type { CategorySlug } from "./portfolio";

// What each paper on a board shows. Case numbers come from the order here.

export type Status = "live" | "prototype" | "in-progress" | "published";

export type CaseLink = { label: string; href: string };

export type PortfolioItem = {
  title: string;
  kind: string; // what it is, in a few words, e.g. "Medical record keeping app"
  line: string; // one plain line: what it does
  status: Status;
  madeWith?: string;
  image?: string; // optional screenshot in /public, e.g. "/projects/ghatcpt.webp"
  links: CaseLink[]; // the first link is what clicking the paper opens
};

export const ITEMS: Record<CategorySlug, PortfolioItem[]> = {
  software: [
    {
      title: "GHATCPT",
      kind: "AI chat app",
      line: "An AI that makes you try first, and only then helps.",
      status: "live",
      madeWith: "Next.js, Gemini API",
      links: [
        { label: "Visit", href: "https://ghatcpt.vercel.app" },
        { label: "Source", href: "https://github.com/abdullah-saghir/ghatcpt" },
      ],
    },
    {
      title: "VERDICT",
      kind: "Personal finance app",
      line: "Tracks your money and gives you an honest verdict before you spend it.",
      status: "live",
      madeWith: "React, Express, PostgreSQL",
      links: [
        { label: "Visit", href: "https://verdict-finance.netlify.app" },
        { label: "Source", href: "https://github.com/harbor-devs/verdict" },
      ],
    },
    {
      title: "MediTrace",
      kind: "Medical record keeping app",
      line: "Keeps a patient's medical history in one place they control, ready to share with a doctor.",
      status: "prototype",
      madeWith: "HTML, CSS, JavaScript",
      links: [{ label: "Visit", href: "https://meditrace-passport.netlify.app" }],
    },
    {
      title: "QueueLess",
      kind: "Virtual queue app",
      line: "See how long the wait is and join the line from your phone, instead of standing in it.",
      status: "prototype",
      links: [{ label: "Visit", href: "https://queueless-queue-management.netlify.app" }],
    },
    {
      title: "KLINAVO",
      kind: "Hospital front desk app",
      line: "Handles registration, the queue and visit status for doctors, reception and admin.",
      status: "prototype",
      links: [{ label: "Visit", href: "https://klinavo.netlify.app" }],
    },
    {
      title: "Driftnotes",
      kind: "AI note-taking app",
      line: "Write down whatever is on your mind, and it sorts related thoughts into notebooks for you.",
      status: "prototype",
      links: [{ label: "Visit", href: "https://driftnotes-pro.netlify.app" }],
    },
  ],
  games: [],
  articles: [
    {
      title: "Things We Inherited and Never Questioned",
      kind: "Essay on culture and habits",
      line: "Everyday habits we never chose, like log kya kahenge (what will people say), and how they get passed down.",
      status: "published",
      links: [{ label: "Read", href: "/writing/things-we-inherited.pdf" }],
    },
    {
      title: "We're Not Being Taken Over, We're Handing It Over",
      kind: "Article on AI and how we think",
      line: "Nobody is forcing us to hand our thinking to AI. We are doing it ourselves, one small question at a time.",
      status: "published",
      links: [{ label: "Read", href: "/writing/handing-it-over.pdf" }],
    },
    {
      title: "The Illusion of Digital Consent",
      kind: "Article on privacy",
      line: "We click \"I agree\" without reading, and in Pakistan a lot of our data is public before anyone even asks.",
      status: "published",
      links: [{ label: "Read", href: "/writing/digital-consent.pdf" }],
    },
    {
      title: "Connected but Lonelier",
      kind: "Article on loneliness",
      line: "We have more ways to reach people than any generation before us, and yet more of us feel lonely.",
      status: "published",
      links: [{ label: "Read", href: "/writing/connected-but-lonelier.pdf" }],
    },
  ],
  research: [],
  certifications: [],
};

// A typed "coming next" scrap at the end of a board. Only real plans, never shown as finished work.
export const UPCOMING: Partial<Record<CategorySlug, string>> = {
  articles:
    "Coming next: research papers on Lahore's smog and the real energy and water cost of AI, plus more articles, starting with the business of being sick.",
};

// A typed note pinned right after the board's title paper, read before any item.
export const NOTES: Partial<Record<CategorySlug, string>> = {
  articles:
    "A note before you read: I write about things I cannot stop questioning. For each one I research properly, check every claim against real sources, and use AI to help me put it into words. The questions and the experiences in them are my own.",
};
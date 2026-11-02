import type { CategorySlug } from "./portfolio";

// What each paper on a board shows. Case numbers come from the order here.

export type Status = "live" | "prototype" | "in-progress";

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
      title: "VERDICT",
      kind: "Personal finance app",
      line: "Tracks your money and gives you an honest opinion before you spend it.",
      status: "prototype",
      links: [{ label: "Visit", href: "https://verdict-finance-app.netlify.app" }],
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
  articles: [],
  research: [],
  certifications: [],
};
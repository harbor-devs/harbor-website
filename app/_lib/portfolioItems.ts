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
  articles: [
    {
      title: "Things We Inherited Without Choosing",
      kind: "Essay on culture and habits",
      line: "Everyday habits we never chose, like log kya kahenge (what will people say), and how they get passed down.",
      status: "published",
      links: [{ label: "Read", href: "/writing/things-we-inherited.pdf" }],
    },
    {
      title: "How Modern Life Disrupts Our Sleep Chemistry",
      kind: "Review article on sleep science",
      line: "How screens, light and messy routines throw off the hormones that put us to sleep, and how to fix it.",
      status: "published",
      links: [{ label: "Read", href: "/writing/sleep-chemistry.pdf" }],
    },
    {
      title: "The Healing Power of Positive People",
      kind: "Article on mental health",
      line: "Why kind, steady people around you can change how someone gets through depression and anxiety.",
      status: "published",
      links: [{ label: "Read", href: "/writing/positive-people.pdf" }],
    },
    {
      title: "Tourism in Pakistan",
      kind: "Blog on travel",
      line: "Pakistan has views that rival Switzerland, so why do so many Pakistanis still holiday abroad?",
      status: "published",
      links: [{ label: "Read", href: "/writing/tourism-in-pakistan.pdf" }],
    },
    {
      title: "Becoming Your Own Reason to Try Again",
      kind: "Blog on motivation",
      line: "Rest isn't laziness. How to start again without the guilt.",
      status: "published",
      links: [{ label: "Read", href: "/writing/your-own-reason-to-try-again.pdf" }],
    },
  ],
  research: [],
  certifications: [],
};

// A typed "coming next" scrap at the end of a board. Only real plans, never shown as finished work.
export const UPCOMING: Partial<Record<CategorySlug, string>> = {
  articles:
    "Coming next: research papers on Lahore's smog and the real energy and water cost of AI, plus articles on how we're handing our thinking over to AI and the business of being sick.",
};
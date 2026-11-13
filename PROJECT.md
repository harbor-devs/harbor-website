# Harbor website: project notes

This is the source of truth for how the site is built and where it is going.
Anyone working on the repo (people or AI tools) should read this first.

## What this is

Harbor is the working notebook of Abdullah Saghir: the home for his software,
websites and writing, and the place to hire him for websites, web apps and
small tools (hiring goes through his Upwork profile, the site has no contact
page). The site is designed as a vintage diary: a closed book that opens and
is read chapter by chapter.

## Current status

- Branch `main`: the live site (book engine, phone version, all five chapters,
  polish). Every push to `main` deploys.
- Hosting: Cloudflare Pages, built from GitHub (harbordevs.pages.dev).
  Domain harbordevs.com to be pointed at it.

## Stack

- Next.js 16.4 (App Router, static export to `out`), React 19.3, TypeScript
- Tailwind CSS v4 through PostCSS (`@tailwindcss/postcss`), plus CSS Modules
- page-flip library for the laptop page turn, our own WebGL curl for phones
- ESLint (Next.js config)
- No backend, database or auth. Not needed yet.
- Hosting: Cloudflare Pages (free), deployed from the GitHub repo.
  Build `npm run build`, output folder `out`, Node 22 (`.nvmrc`)

## Run it locally (Windows PowerShell)

```powershell
npm install      # first time, or after package.json changes
npm run dev      # dev server at http://localhost:3000
npm run lint     # check code style
npm run build    # production build, run before merging
npm run start    # run the production build locally
```

Testing on a phone: connect the laptop and phone to the same network (or the
phone's hotspot), open the "Network" address `npm run dev` prints, and add that
IP to `allowedDevOrigins` in `next.config.ts` if the page loads without animations.

## Folder map

```
app/
  layout.tsx              root layout: fonts, tab title, description, link previews
  not-found.tsx           diary-style 404 page
  robots.ts, sitemap.ts   robots.txt and sitemap.xml
  icon.png, apple-icon.png, favicon.ico, opengraph-image.png
                          tab icon, home-screen icon, link preview picture
  (book)/layout.tsx       the one shared book every chapter lives in
  (book)/page.tsx         the cover ( / )
  (book)/<chapter>/       one route per chapter (only sets the tab title)
  (book)/the-end/         the closed back cover with the flower note
  portfolio/[category]/   one cork-board page per portfolio category
  _chapters/              chapter content: Introduction, Portfolio, Now,
                          Services, Sketchbook (left page, right page, phone page)
  _components/            Book (the engine), BookSpread, FlipBook, CoverLeaf,
                          BackLeaf, ClosedBook, Cover, SideArrows (laptop);
                          PhoneBook, PhoneCoverLeaf, PhoneBackCover, PhoneNav,
                          PhoneMenu (phone); Board, BoardProps, DeskNotes,
                          CallingCard, ChapterContents, CategoryList, icons
  _lib/                   chapters.ts (the single chapter list), portfolio.ts,
                          portfolioItems.ts, pageCurl.ts (phone WebGL curl),
                          paintSheet.ts (draws a phone page for the curl),
                          coverSwing.ts, useSwipe.ts, paperTextures.ts
  globals.css             design tokens and global styles
public/
  _headers                Cloudflare Pages security and cache headers
  textures/               baked paper, desk, cover and wood-wall images
  writing/                article PDFs
  logo-mark.svg           logo
  cover-logo.svg          logo version used on the cover
  flower-sprig.svg        the thank-you flower on the back cover
  sketches/               margin sketches
docs/
  book-engine.md          how the book engine works
  textures.md             how the textures were made
```

## URLs

| URL | Page |
| --- | --- |
| `/` | Closed front cover |
| `/introduction` | Chapter I: introduction and contents |
| `/portfolio` | Chapter II: portfolio categories |
| `/portfolio/software` | Board: software and websites |
| `/portfolio/articles` | Board: articles |
| `/now` | Chapter III: what I'm working on now |
| `/services` | Chapter IV: services (hire through Upwork) |
| `/sketchbook` | Chapter V: ideas, clearly marked as not built |
| `/the-end` | Closed back cover with the thank-you flower |

Every URL must work when opened directly or refreshed. Games, Research Papers
and Certifications boards are hidden until they have real items.

## Design (locked)

- One look only. No dark mode.
- Colors: paper `#F2E8D5`, ink `#3B2A1E`, accent `#8B2E23`, haze `#2A1F14`,
  gold `#A8823C` (thin decoration only, never text).
- Fonts: IM Fell English for headings, EB Garamond for body text (kept, decided 2026-11-12).
- Laptop (900px and up, Tailwind `book:` prefix): two-page spread on a
  1060 x 664 book that scales to fit.
- Phone: one A5-shaped page (330 x 467) with the folded-back pages curling
  around the left edge.
- Textures are baked images, not live filters (see `docs/textures.md`).
- Design reference: the Claude Design canvas "Harbor diary, final".

## Site rules

- Very user friendly. The style never gets in the way of finding or reading things.
- Menu always visible, page marker always shown, Services (the way to hire) reachable from every page.
- Respect reduced motion: page turns become a plain swap.
- No photo of the owner. No fake team, stats or testimonials. Plain language.
- Honest status labels on every project. Nothing unbuilt is shown as built.
- No backend until there is a real need for one.

## Engineering standards

- `main` stays stable. New work goes on a branch and is merged only after testing.
- Commits follow Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`).
- Line endings are LF everywhere (enforced by `.gitattributes`).
- Secrets: none right now. If ever needed, they go in `.env.local` (gitignored),
  with a committed `.env.example`, and are never used in client code.
- Commits use the GitHub noreply email. No personal email in the repo.
- Run `npm audit` after dependency changes. Never run `npm audit fix --force`.
- Every step: discuss, build, run, test, commit.

## Master plan

Follow in order. Each step is discussed, built, tested and committed.

### Phase 0: clean start (done 2026-10-26)
- [x] Discard the uncommitted closing-fade experiment
- [x] Create the `book-engine` branch
- [x] Write PROJECT.md, CLAUDE.md, README.md
- [x] Leftovers: no stray `console.log`, tab title already Harbor, default
      Next.js files removed, `docs/textures.md` tidied, telemetry turned off,
      `experimental.agentFeedback` removed
- Moved to Phase 4: review the `unrs-resolver` install script

### Phase 1: book engine, laptop (done)
- [x] One book stays on screen, real pages turn, the URL updates per chapter
- [x] Page turn with the page-flip library, click lock, riffle for big jumps
- [x] Every way to turn: side arrows, top nav, keyboard arrows, scroll, drag
- [x] Menu, page marker, turn hint on page 1, reduced motion = plain swap
- [x] Cover opening and closing, back cover, flower thank-you

### Phase 2: phone (done)
- [x] One A5 page with the folded-back curl, WebGL page curl, swipe to turn
- [x] Corner peek hint, phone covers swing and can be dragged
- [x] Tested on a real phone (Redmi Note 12)

### Phase 3: chapters (done)
- [x] Introduction, Portfolio (+ software and articles boards), Now,
      Services (calling card, hire through Upwork), Sketchbook
- [x] Contact chapter removed (hiring goes through Upwork)

### Phase 4: polish
- [x] Darker ruled lines (textures re-baked)
- [x] Body font: kept EB Garamond
- [x] Three-line cover title, side arrows, clearer open hints
- [x] Smooth cover shadows (laptop and phone), no flicker in the phone corner peek
- [x] Favicon from the small logo mark, link previews, description
- [x] Removed the blurry glow above the closed cover (cover.webp)
- [x] Docs and license
- [ ] Accessibility and speed check
- [ ] Review the `unrs-resolver` install script before allowing it
- [ ] Update the design canvas to match the code (after launch)
- [ ] Only the open page's headings visible to search and screen readers (after launch)
- [ ] Split Book.tsx into smaller parts (after launch)

### Phase 5: launch
- [ ] Test on Firefox, Chrome, Edge and phone
- [x] Merge `book-engine` into `main`
- [x] Choose a host: Cloudflare Pages (moved from Netlify)
- [x] Make the repo public
- [x] License: all rights reserved (LICENSE)
- [x] 404 page, robots.txt, sitemap.xml, security headers
- [ ] Domain harbordevs.com pointed at Cloudflare Pages
- [ ] Later: professional email, Games, Research Papers and Certifications boards

## Decisions log

- 2026-10-25: Tailwind runs through PostCSS. The default Turbopack CSS rule
  broke CSS Modules (empty styles).
- 2026-10-25: Textures are baked images instead of live SVG filters, so the
  browser doesn't redraw them every frame (smoother on phones and page flips).
- 2026-10-26: Replaced the route-level View Transitions with a custom book
  engine. The whole page moved, and the cover and closing animations felt
  glitchy. One book that stays on screen allows real page turns.
- 2026-10-26: Turned off Next.js telemetry and removed `experimental.agentFeedback`
  (privacy first; CLAUDE.md already gives AI tools their instructions).
- 2026-11-03: Hosting on Netlify. Vercel Hobby is for non-commercial use only,
  and Harbor offers paid services.
- 2026-11-11: Removed the Contact chapter. Hiring goes through Upwork, so the
  site has five chapters.
- 2026-11-12: Kept EB Garamond as the body font. Laptop gets round side arrows
  beside the book; phone keeps its bottom bar and swiping.
- 2026-11-12: License is "all rights reserved": the repo is public to show the
  work, not to be reused.
- 2026-11-13: Moved hosting from Netlify to Cloudflare Pages (static export),
  because the Netlify free plan credits ran low.

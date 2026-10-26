# Harbor website: project notes

This is the source of truth for how the site is built and where it is going.
Anyone working on the repo (people or AI tools) should read this first.

## What this is

Harbor is the home for Abdullah Saghir's independent work (software, games,
articles, research) and the place to hire him for services. The site is
designed as a vintage diary: a closed book that opens and is read chapter by
chapter.

## Current status

- Branch `book-engine`: building a custom book engine to replace the
  route-level View Transitions page turn.
- Branch `main`: last stable version (View Transitions page turn). Not deployed.
- Cover and Introduction have real designs. Every other chapter is a placeholder.

## Stack

- Next.js 16.4 (App Router, Cache Components), React 19.3, TypeScript
- Tailwind CSS v4 through PostCSS (`@tailwindcss/postcss`), plus CSS Modules
- ESLint (Next.js config)
- No backend, database or auth. Not needed yet.
- Hosting: not chosen yet (see Phase 5)

## Run it locally (Windows PowerShell)

```powershell
npm install      # first time, or after package.json changes
npm run dev      # dev server at http://localhost:3000
npm run lint     # check code style
npm run build    # production build, run before merging
```

## Folder map

```
app/
  layout.tsx            root layout shared by every page
  page.tsx              the cover ( / )
  <chapter>/page.tsx    one route per chapter
  globals.css           design tokens and global styles
  _lib/chapters.ts      the single chapter list; all navigation reads it
  _components/          ClosedBook, BookSpread (laptop), PhonePage (phone),
                        BookNav, PhoneNav, PhoneMenu, ChapterShell,
                        ChapterContents, PlaceholderChapter, Flourish, icons
public/
  textures/             baked paper, desk and cover images
  logo-mark.svg         logo
  cover-logo.svg        logo version used on the cover
  sketches/             margin sketches
docs/
  textures.md           how the textures were made
```

## URLs

| URL | Page |
| --- | --- |
| `/` | Closed cover |
| `/introduction` | Introduction and contents |
| `/portfolio` | Portfolio categories |
| `/services` | Services |
| `/now` | What I'm working on now |
| `/sketchbook` | Ideas (clearly marked as not built) |
| `/contact` | Contact |

Every chapter URL must work when opened directly or refreshed.

## Design (locked)

- One look only. No dark mode.
- Colors: paper `#F2E8D5`, ink `#3B2A1E`, accent `#8B2E23`, haze `#2A1F14`,
  gold `#A8823C` (thin decoration only, never text).
- Fonts: IM Fell English for headings. The body font is being replaced in Phase 4.
- Laptop (900px and up, Tailwind `book:` prefix): two-page spread on a
  1060 x 664 book that scales to fit.
- Phone: one A5-shaped page (330 x 467) with the folded-back pages curling
  around the left edge.
- Textures are baked images, not live filters (see `docs/textures.md`).
- Design reference: the Claude Design canvas "Harbor diary, final".

## Site rules

- Very user friendly. The style never gets in the way of finding or reading things.
- Menu always visible, page marker always shown, contact reachable from every page.
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

### Phase 1: book engine (laptop)
- [ ] Plan the engine: one book stays on screen, real pages turn, the URL
      updates per chapter, direct URLs still work
- [ ] 3D page turn (back of the page, shadows)
- [ ] Click lock while a page is turning
- [ ] Every way to turn: on-screen arrows, top nav jumps, keyboard arrows,
      scroll to turn, dragging the page, browser back and forward
- [ ] Always-visible menu, page marker, "scroll or swipe to turn" hint on page 1
- [ ] Reduced motion: plain swap
- [ ] Cover opening (designed together first; also fix the `cover-logo.svg` width/height warning)
- [ ] Closing and back cover
- [ ] Animated flower thank-you at the end

### Phase 2: phone (the most important version)
- [ ] One A5 page with the folded-back curl
- [ ] Swipe to turn
- [ ] Phone menu and bottom bar inside the engine
- [ ] Test on a real phone

### Phase 3: chapters, in reading order
- [ ] Introduction (text sits on the ruled lines; says both: the work and hiring)
- [ ] Portfolio opening: Software/Websites, Games, Articles, Research Papers, Certifications
- [ ] Each category as its own designed, scrollable page
- [ ] Project pages: problem, research, build, result; screenshots, status, tech, links
- [ ] "Old camera" transition only when entering these pages
- [ ] Hover states that come alive
- [ ] Services
- [ ] Now
- [ ] Sketchbook
- [ ] Contact
- [ ] Testimonials only once real ones exist

### Phase 4: polish
- [ ] Replace the body font
- [ ] Darker, more solid lines
- [ ] Final visual pass (vintage textures, nothing flat)
- [ ] Accessibility check
- [ ] Speed check
- [ ] Review the `unrs-resolver` install script before allowing it
- [ ] SEO, favicon from the small logo mark, link previews
- [ ] Update the design canvas to match the code
- [ ] QA review (report only)

### Phase 5: launch
- [ ] Test on Firefox, Chrome, Edge and phone
- [ ] Merge `book-engine` into `main`
- [ ] Choose a host (check current terms first) and make the repo public
- [ ] Add a license (default plan: all rights reserved)
- [ ] Later: domain, professional email

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
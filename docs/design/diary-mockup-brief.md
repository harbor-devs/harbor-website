# Harbor diary mockup brief

Status: updated Oct 24 2026
Scope: the closed cover, Opening 1 (Introduction), Opening 2 (Portfolio), then phone versions
Mockup canvas: "Harbor diary mockups" (Claude Design)
Design System: "Harbor Design System" (Claude Design). Use its tokens for every color, font, space, shadow and timing.

---

## 1. What this mockup is for

To see the real look of the diary before styling the code. It answers: does the open-book layout read well, does it feel vintage, is everything easy to find and read.

It is a picture of the site, not the site. Motion is described here and built later in code.

## 2. Ground rules

- One look only: ink on old paper. No dark mode.
- User friendly beats pretty. If a creative detail makes anything harder to read or find, it goes.
- Headings: IM Fell English. Reading text: EB Garamond (18px minimum).
- Madder red #8B2E23 is rare: one or two things per screen.
- Brass #A8823C is decoration only, never text.
- All placeholder content is clearly marked as placeholder.
- No photo or portrait of Abdullah anywhere on the site.
- Code-drawn textures are stand-ins. Real public domain or CC0 artwork can replace them later.

## 3. The frame

- Desk: warm mid-brown behind the book, not too dark.
- Laptop and desktop: two-page spread with a gutter shadow down the middle.
- Phones: one page at a time.
- Each opening keeps its own URL: Opening 1 = `/`, Opening 2 = `/portfolio`.
- Nav: cream version of the logo top left (not the word "Harbor"), then Home, Portfolio, Services, Contact.

## 4. The closed cover (LOCKED Oct 24 2026)

- Vintage parchment cover (not dark leather) with stains, grit and engraving hatching near the edges.
- Thin hand-printed double frame with scroll corners.
- Dark leather spine reading "HARBOR · VOL. I", ribbon bookmark, visible page block, worn corners.
- Cover text, top to bottom: VOL. I · MMXXVI, scroll divider, logo, "Harbor" (IM Fell English), divider, "The working notebook of Abdullah Saghir".
- Not used: burnt edges, clasp, heavy carved frame, medallion or holy-book style ornaments.
- The cover is a real button for keyboard and screen readers. Shown once per visit; deep links skip it.

## 5. Pages (LOCKED Oct 24 2026)

- Warm aged lined paper, rough grain, soft stains, ink splatter in two corners, faint coffee rings, faint fold line across the middle.
- Golden ruled lines, faded red margin line, gutter shadow.
- No postcards, stamps or collage items on the pages.
- Text-to-line alignment gets fine-tuned in the real code with real fonts.

## 6. Opening 1: Introduction (LOCKED Oct 24 2026)

Left page
- `PAGE I`, title "Hello, I'm Abdullah", scroll divider
- Pen sketch of a river valley, labelled "fig. i"
- Short placeholder paragraphs about him

Right page
- `PAGE II`, title "What Harbor is", one placeholder paragraph
- Table of contents: each section with its page number, each line clickable (to update in the mockup)
- Small hint: "Scroll or swipe to turn the page" (only on this opening)

Bottom bar: "Close the book", page marker, next section.

## 7. Opening 2: Portfolio (next)

- Left page: `PAGE III`, big title "Portfolio", one placeholder line.
- Right page: clickable project headings only (placeholders). Each one opens its own project page.
- Hover: heading turns madder, a thin underline draws in.

After that, each section (Services, Contact and so on) gets its own opening in the same style.

## 8. Always visible, every opening

- Menu always reachable, never hidden behind a gesture only.
- Page marker and Previous / Next at the bottom of the book.
- Contact reachable from every opening.
- Keyboard: left and right arrows turn pages. Visible focus ring.

## 9. Motion (built later in code)

- Cover opening: cover swings open to Opening 1.
- Page turn: page flips with a soft shadow.
- Page change effect: "old camera" (brass shutter or photo developing), only when moving to a new page (portfolio, a project page), not on every click. Under 1 second.
- Reduced motion setting: everything becomes a short fade.
- Nothing bouncy.

## 10. Order

1. Cover, laptop. LOCKED
2. Opening 1, laptop. LOCKED (table of contents still to add)
3. Opening 2, laptop
4. Phone versions of cover and openings
5. Add brass to the Design System
6. Style the real code to match

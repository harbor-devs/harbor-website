# Harbor diary mockup brief

Status: draft for review, Oct 15 2026
Scope: the closed cover, Opening 1 (Introduction), Opening 2 (Portfolio)
Design System: "Harbor Design System" (Claude Design). Use its tokens for every color, font, space, shadow and timing. No new values unless this brief says so.

---

## 1. What this mockup is for

To see the real look of the diary before styling the code. It answers: does the open-book layout read well, does the cover feel right, is everything easy to find and read.

It is a picture of the site, not the site. Motion is described here but only shown as before/after frames.

## 2. Ground rules

- One look only: ink on paper. No dark mode.
- User friendly beats pretty. If a creative detail makes anything harder to read or find, it goes.
- Headings: IM Fell English (26px and up). Reading text: EB Garamond (18px minimum).
- Madder red is rare: one or two things per screen.
- Brass gold is decoration only, never text.
- All placeholder content is clearly marked as placeholder.

### New color for this mockup (to add to the Design System if approved)

| Token | Hex | Use |
| --- | --- | --- |
| `brass` | #A8823C | Thin lines, corner pieces, the cover clasp, page edge details. Never text, never icons that carry meaning. |

## 3. The frame

- **Desk:** the whole screen behind the book is `umber` with the soft haze. The book sits in the middle.
- **Laptop and desktop:** the book opens as a two-page spread. Left page and right page side by side, a soft fold shadow down the middle (the gutter).
- **Phones:** one page at a time. Left page first, swipe or tap next to see the right page. Same diary, just narrower.
- Each opening keeps its own URL: Opening 1 = `/`, Opening 2 = `/portfolio`.
- Pages are `paper` with `haze-page` at the edges. Faint ruled lines in `hairline`, like a notebook.

## 4. The closed cover

Shown once per visit, sits over Opening 1 on the main URL. Deep links skip it.

- Book cover in `umber`, cloth-like texture, slightly lighter than the desk so it stands out.
- A paper label plate in the middle (`paper-shade`, thin `brass` border), like old notebooks had. On it:
  - Full logo (the geometric astrolabe), 200px or bigger
  - **Harbor** in `display-cover` (72px, 48px on phones)
  - Tagline in `body-lead`: "Independent projects across technology, science and culture." (working tagline, not final)
- Small `brass` corner pieces on the four cover corners.
- A `brass` clasp on the right edge (the thing that "unlocks" when the book opens).
- Hint under the book in `ink-soft` on umber (must pass contrast, check it): "Click, tap, scroll or swipe to open"
- Open by: click, tap, scroll, swipe, Enter or Space key. The cover is a real button for keyboard and screen readers.

## 5. Opening 1: Introduction

**Left page**
- Small label at top: `PAGE I` (label style, `ink-soft`)
- Title in `display-page`: "Hello, I'm Abdullah" (placeholder)
- 2 to 3 short paragraphs in `body` about him: placeholder text, marked as placeholder
- Portrait spot: an empty oval frame drawn in ink lines with a thin `brass` inner line, label "Portrait (later)". Not a real portrait yet.

**Right page**
- Label: `PAGE II`
- Title in `display-section`: "What Harbor is"
- 1 short paragraph, placeholder
- A short list of what lives in Harbor (projects, writing, research, services) as plain text lines, not cards
- One madder link at the bottom: "Turn to the portfolio"
- Bottom corner: small hint in `ink-soft`, "Scroll or swipe to turn the page" (only on this opening)

## 6. Opening 2: Portfolio

**Left page**
- Label: `PAGE III`
- Big title in `display-page`: "Portfolio"
- One line under it in `body-lead`: "Things I've built, finished and published." (placeholder)
- A margin sketch below (see creative touches)

**Right page**
- Label: `PAGE IV`
- A list of 4 placeholder items, written like notebook entries, not app cards:
  - Item title in `display-sub` (for example "Project title one")
  - One line description in `body`
  - Status tag in `label` style: `PLACEHOLDER`
  - The whole entry is clickable and opens its own page later. Hover: title turns madder, a thin underline draws in.
- Thin `hairline` rule between entries.

## 7. Always visible, every opening

- **Menu:** Harbor (home), Home, Portfolio, Services, Contact. Always reachable, never hidden behind a gesture only.
- **Page marker:** "Opening 1 of 4" or the page numbers, in `ink-soft`.
- **Previous / Next buttons** at the bottom of the book, not mid-page.
- **Contact** reachable from every opening.
- Keyboard: left and right arrows turn pages. Visible focus ring in madder.

## 8. Creative touches

All drawn in faded ink, like Leonardo's margins. None of them carry information, so the site still works without them.

**Keeping (decided Oct 15 2026):**

1. **Margin sketches per opening:** Introduction gets a half-finished drawing of the astrolabe with construction lines and compass arcs. Portfolio gets small study drawings (gears, a leaf, a circuit line) in the left page margin.
2. **Star "you are here":** very faint dotted constellation lines in the page corners, with the one madder star from the logo sitting next to the page number.
3. **Brass page edges:** the stacked page edges visible on the right side of the book get a thin brass line, like gilded book edges.

**Dropped for now:**

- Ribbon bookmark: a ribbon looks clickable, so people would try to use it as a menu. Confusing, and it competes with the real menu.
- Handwritten-style margin notes: extra images to draw for little value. Can come back later.

## 9. Motion (described now, built later)

- Cover opening: `duration-cover` 1100ms, `ease-turn`. Clasp unlatches, cover swings left, Opening 1 is revealed.
- Page turn: `duration-page` 700ms, `ease-turn`, shadow under the turning page.
- Reduced motion: everything becomes a 150ms fade.
- Nothing bouncy.

## 10. Not in this mockup

Services, Contact, single project pages, real text, real portrait, real projects, the flip animation itself.

## 11. Order

1. Cover only. Review.
2. Opening 1 (laptop and phone). Review.
3. Opening 2 (laptop and phone). Review.
4. Add `brass` to the Design System once approved.

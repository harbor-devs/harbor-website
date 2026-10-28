# Book engine

How the Harbor diary turns pages. Read this before changing anything in the book.

## The idea

- One book stays on screen the whole time. It never reloads between chapters.
- Each chapter has its own URL (/introduction, /portfolio, ...). Direct links and refresh open the right page.
- The URL is the boss. Every way of turning (arrows, top nav, keyboard, Back/Forward, dragging the page) just changes the URL, and the book turns to match.

## Page turn library

- We use `page-flip` (StPageFlip, MIT license) for the curl, shadows and drag-to-turn.
- Tested on a throwaway branch on Oct 27 2026: the curl looks right, URL + refresh work.
- It is old and not maintained, so it lives inside ONE file of ours. If it breaks, we swap that file only.

## Library gotchas (found in testing)

- It wipes inline styles on pages. Style pages with a CSS class, never `element.style`.
- Calling a turn while a page is still turning force-finishes the first turn and glitches. This made the Back button sometimes go forward.
- Its "go to page X" jumps to the page next to X and animates only one turn.
- On phone (portrait mode) it copies page elements.
- It moves our page elements into its own wrapper. On unmount we call clear() to put them back, or React crashes.
- Its drawing loop never stops. On unmount we replace its render function with an empty one.
- It ships no TypeScript types. Ours are in types/page-flip.d.ts (only what we use).
- It fires "read" a moment before its own state updates, so we wait one tick (queueMicrotask).
- Its hover fold follows the mouse. We patch showCorner so it lifts once and holds still.
- Its fold shadow leaks a 1px line past the pages. .host has overflow: hidden.
- All of this lives in app/_components/FlipBook.tsx only.

## Our rules to avoid those bugs

- Never start a turn while one is running. Wait for it to finish.
- After each turn, if the book is not on the URL's page yet, turn one more page. Repeat until it is. This also gives the riffle for big jumps.
- Back/Forward never add new history entries. Only turns the visitor starts do.
- Reduced motion: swap pages with no animation.

## Build order (Phase 1, laptop)

1. One shared book, every URL shows the right spread. No animation. DONE (Oct 27 2026)
2. Page turn with the library + the waiting rule above. DONE (Oct 27 2026)
3. All the ways to turn: arrows, top nav (riffle), keyboard, Back/Forward, scroll, drag. DONE (Oct 28 2026)
   Working: bottom bar arrows, top nav riffle, drag, corner click, keyboard arrows, scroll to turn, Back/Forward.
   At the first and last chapter the keys and scroll do nothing on purpose (cover and closing come in step 5).
   Keyboard and scroll live in app/_components/Book.tsx. They only change the URL, the engine does the turning.
4. Menu, page marker, "scroll or swipe" hint. DONE (Oct 28 2026)
   Menu: top nav + bottom bar always visible. Marker: "2 of 6" under the chapter name in the bottom bar.
   Hint: shows on the first chapter in the top bar until the first turn (hidden under 1200px wide).
5. Cover opening, closing, flower thank-you (design each together first).
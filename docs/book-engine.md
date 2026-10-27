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

## Our rules to avoid those bugs

- Never start a turn while one is running. Wait for it to finish.
- After each turn, if the book is not on the URL's page yet, turn one more page. Repeat until it is. This also gives the riffle for big jumps.
- Back/Forward never add new history entries. Only turns the visitor starts do.
- Reduced motion: swap pages with no animation.

## Build order (Phase 1, laptop)

1. One shared book, every URL shows the right spread. No animation.
2. Page turn with the library + the waiting rule above.
3. All the ways to turn: arrows, top nav (riffle), keyboard, Back/Forward, scroll, drag.
4. Menu, page marker, "scroll or swipe" hint.
5. Cover opening, closing, flower thank-you (design each together first).
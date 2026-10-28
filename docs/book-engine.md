# Book engine

How the Harbor diary turns pages. Read this before changing anything in the book.

## The idea

- One book stays on screen the whole time. It never reloads between chapters.
- Each chapter has its own URL (/introduction, /portfolio, ...). Direct links and refresh open the right page.
- The URL is the boss. Every way of turning (arrows, top nav, keyboard, Back/Forward, dragging the page) just changes the URL, and the book turns to match.
- "/" is the closed book (the cover). It lives inside the same shared book, in app/(book)/page.tsx.
- "/the-end" is the book closed from the back (app/(book)/the-end/page.tsx).

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

## The cover (how it swings)

- The cover is NOT part of the page-flip library. It is our own piece: app/_components/CoverLeaf.tsx + CoverLeaf.module.css.
- Book.tsx treats "/" as "closed". Closed, the book sits at scale 0.85. Opening, the cover swings on its spine while the book slides to center and grows.
- No 3D layering tricks (browsers flatten them differently). The cover turns, and at the halfway point (edge-on) it swaps from the outside (ClosedBook bare) to the inside (a copy of the open book's left half: board, page stack edges, Introduction left page). When it lands, the copy hands over to the real book, so the swap can't be seen.
- The swap and the shading run as CSS animations on the same timing as the swing, so they can't drift.
- The swinging cover is ONLY the board. Page edges, ribbon and the baked shadow stay behind on the desk as a "base" layer (the cover image with exactly the board cut out).
- FlipBook.tsx reports onArrive, so the cover knows when a riffle is finished.
- Opening to a later chapter: the cover opens first, then the pages riffle. Closing from a later chapter: riffle back first, then the cover closes.
- The bottom bar, "Click to open" and the top-left logo wait until the book finishes, then fade in.
- Cover.tsx is phone only now, plus it exports CoverHint ("Click to open" on laptop).

## The back cover (mirror of the front)

- app/_components/BackLeaf.tsx + BackLeaf.module.css. Same tricks as CoverLeaf, from the right side.
- At Contact, → / scroll down / "Close the book" go to "/the-end". The last page swings over to the left and becomes the back cover. The book slides the other way (scale 0.85, translateX 25%).
- The back cover outside is the front cover's baked image, mirrored by the swing (spine on the right), no text, small faded logo low down (pre-flipped so it reads right).
- Open, BackLeaf is a copy of the right half (board, right page stack, Contact right page). It only shows while swinging or shut; otherwise the real right page shows.
- Order of moves: going to "/the-end" from any chapter riffles to Contact first, then the back shuts. Leaving "/the-end" opens the back first, then riffles (and closes the front if going to "/").
- The back only shuts once the front is fully open and the pages are on the last chapter.
- Shadows: BackLeaf has its own right-half .ground (identical to .shadowRight, swaps at rest). When the back lands on the left, CoverLeaf's left .ground fades out (hideGround) while the mirrored baked base fades in.
- Under the closed back: BackCoverBar in BookNav.tsx (← Contact ◆ The end · Read again →). Half the book wide, nudged left by 8 canvas px to sit under the logo, pushed down to clear the ribbon.
- Phone shows the front cover on "/the-end" until Phase 2.

## Shadow rules (learned the hard way, Oct 28 2026)

- Never put a desk shadow ON something that swings. It swings through the air with it and looks like a dark slab.
- Never cut a shadow with clip-path at the spine. It leaves a hard line under the book.
- So the open book's shadow is two halves: .shadowRight (BookSpread) and .ground (CoverLeaf, arrives with the cover). The board itself has no shadow.
- The laptop cover has no hover lift: lifting the board alone opened a gap above its shadow (a line).

## Build order (Phase 1, laptop)

1. One shared book, every URL shows the right spread. No animation. DONE (Oct 27 2026)
2. Page turn with the library + the waiting rule above. DONE (Oct 27 2026)
3. All the ways to turn: arrows, top nav (riffle), keyboard, Back/Forward, scroll, drag. DONE (Oct 28 2026)
   Working: bottom bar arrows, top nav riffle, drag, corner click, keyboard arrows, scroll to turn, Back/Forward.
   Keyboard and scroll live in app/_components/Book.tsx. They only change the URL, the engine does the turning.
4. Menu, page marker, "scroll or swipe" hint. DONE (Oct 28 2026)
   Menu: top nav + bottom bar always visible. Marker: "2 of 6" under the chapter name in the bottom bar.
   Hint: shows on the first chapter in the top bar until the first turn (hidden under 1200px wide).
5. Cover opening, closing, flower thank-you (design each together first).
   5a. Cover moved inside the shared book. DONE (Oct 28 2026)
       On the cover: → or scroll down opens. On Introduction: ← or scroll up closes.
   5b. Cover swings open and shut like a real book. DONE (Oct 28 2026), shadows fixed same day.
   5c. Back cover: at Contact, → and "Close the book" close the back cover. DONE (Oct 28 2026)
   5d. Flower thank-you after the back cover closes. TODO (agreed idea: a pressed jasmine slides out of the pages onto the desk, then "Thank you for reading")

## Open items

- Light blurry blob above the top-right corner of the closed cover. It is baked into cover.webp, re-bake in polish.
- The turn hint hides after the first turn on purpose. May revisit.
- The small logo on the back cover reads a bit blurry at that size. Tune in polish.
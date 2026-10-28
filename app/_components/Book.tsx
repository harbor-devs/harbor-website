"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { CHAPTERS, COVER_HREF, getChapterNav, type ChapterSlug } from "../_lib/chapters";
import { BookBottomBar, BookTopNav } from "./BookNav";
import BookSpread from "./BookSpread";
import Cover, { CoverHint } from "./Cover";
import CoverLeaf from "./CoverLeaf";
import FlipBook from "./FlipBook";
import PhonePage from "./PhonePage";
import { PhoneHeader, PhoneTurnBar } from "./PhoneNav";
import TurnHint from "./TurnHint";

// What each chapter supplies: two laptop pages and one phone page
export type ChapterContent = {
  left: ReactNode;
  right: ReactNode;
  phone: ReactNode;
};

type BookProps = {
  content: Record<ChapterSlug, ChapterContent>;
};

// Live true/false for a media query (server guesses false)
function media(query: string) {
  return {
    subscribe(onChange: () => void) {
      const m = window.matchMedia(query);
      m.addEventListener("change", onChange);
      return () => m.removeEventListener("change", onChange);
    },
    get: () => window.matchMedia(query).matches,
  };
}
const reducedMotion = media("(prefers-reduced-motion: reduce)");
const laptopWidth = media("(min-width: 900px)");
const serverFalse = () => false;

// The one book that stays on screen. The URL is the boss: "/" means closed,
// a chapter URL means open on that chapter, and the book changes to match.
export default function Book({ content }: BookProps) {
  const pathname = usePathname();
  const router = useRouter();

  const closed = pathname === COVER_HREF;
  const index = Math.max(0, CHAPTERS.findIndex((c) => c.href === pathname));
  const chapter = CHAPTERS[index];
  const nav = getChapterNav(chapter.slug);

  // --- The cover ---
  // No swing to wait for: reduced motion, or the laptop book isn't showing (phone)
  const reduced = useSyncExternalStore(reducedMotion.subscribe, reducedMotion.get, serverFalse);
  const laptop = useSyncExternalStore(laptopWidth.subscribe, laptopWidth.get, serverFalse);
  const instant = reduced || !laptop;

  // Which spread the pages are actually on (the flip library tells us after each turn)
  const [flipAt, setFlipAt] = useState(closed ? 0 : index);
  // Where the cover last finished swinging: true = open, false = shut
  const [settledOpen, setSettledOpen] = useState(!closed);

  // Closing from a later chapter: pages riffle back to the first chapter first,
  // and the cover stays open until they get there.
  const coverOpen = !closed || flipAt !== 0;
  // Fully open and landed: the cover hides and the real pages take over
  const coverDone = coverOpen && (instant || settledOpen);
  // Fully shut and resting
  const shutDone = !coverOpen && (instant || !settledOpen);
  // Opening straight to a later chapter: the cover opens first, then the pages riffle.
  const flipTarget = closed ? 0 : coverDone ? index : 0;

  // Where "next" and "previous" go from here.
  // Closed: next opens the book. First chapter: previous closes it.
  // Last chapter: next does nothing until the back cover is built.
  const nextHref = closed ? CHAPTERS[0].href : (nav.next?.href ?? null);
  const prevHref = closed ? null : (nav.prev?.href ?? COVER_HREF);

  // The "scroll or use the arrow keys" hint: shown on the first chapter
  // until the visitor turns a page for the first time, then gone for good.
  const [startIndex] = useState(index);
  const [turned, setTurned] = useState(false);
  if (!turned && index !== startIndex) setTurned(true);
  const showHint = coverDone && index === 0 && !turned;

  // Under the book: "Click to open" once fully shut, the bottom bar once fully open,
  // nothing while the cover is moving.
  const footer = shutDone ? <CoverHint /> : coverDone ? <BookBottomBar nav={nav} /> : null;

  // Keyboard: Left and Right arrows turn the page (or open/close the book).
  // They only change the URL, and the book changes to match.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;

      // Not while typing in a field
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;

      // Only on laptop (900px and up)
      if (!window.matchMedia("(min-width: 900px)").matches) return;

      const target = e.key === "ArrowRight" ? nextHref : prevHref;
      if (!target) return;
      e.preventDefault();
      router.push(target, { scroll: false });
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [nextHref, prevHref, router]);

  // Scroll: one scroll gesture turns one page. Scroll down = next, up = previous.
  // A trackpad keeps sending events after your fingers stop, so we stay locked
  // until the events go quiet.
  const lockUntil = useRef(0);
  const lastWheel = useRef(0);
  const pushed = useRef(0);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) return; // pinch zoom, not a turn
      if (!window.matchMedia("(min-width: 900px)").matches) return; // laptop only

      const now = performance.now();
      const gap = now - lastWheel.current;
      lastWheel.current = now;

      // Locked: a turn just happened. Keep the lock until the events go quiet.
      if (now < lockUntil.current) {
        lockUntil.current = Math.max(lockUntil.current, now + 150);
        return;
      }

      // New gesture: forget the old movement. Then add up this scroll.
      if (gap > 200) pushed.current = 0;
      pushed.current += e.deltaY;
      if (Math.abs(pushed.current) < 40) return; // too small to count as a turn

      const target = pushed.current > 0 ? nextHref : prevHref;
      pushed.current = 0;
      lockUntil.current = now + 800;
      if (!target) return;
      router.push(target, { scroll: false });
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
  }, [nextHref, prevHref, router]);

  // Laptop: every chapter's two pages, in reading order
  const pages = CHAPTERS.flatMap((c) => [content[c.slug].left, content[c.slug].right]);

  return (
    <>
      {closed && <h1 className="sr-only">Harbor, the working notebook of Abdullah Saghir</h1>}

      {/* 900px and up: two-page spread that turns, with the swinging cover */}
      <div className="hidden flex-1 flex-col book:flex">
        <BookSpread
          closed={!coverOpen}
          clipLeft={!coverDone}
          header={
            <>
              {/* Logo top-left only once the book is open */}
              <BookTopNav current={coverDone ? chapter.slug : undefined} />
              {showHint && <TurnHint />}
            </>
          }
          footer={footer}
          cover={
            <CoverLeaf
              open={coverOpen}
              done={coverDone}
              inside={content[CHAPTERS[0].slug].left}
              onSettle={setSettledOpen}
            />
          }
        >
          <FlipBook
            pages={pages}
            spread={flipTarget}
            onUserTurn={(i) => router.push(CHAPTERS[i].href, { scroll: false })}
            onArrive={setFlipAt}
          />
        </BookSpread>
      </div>

      {/* Below 900px: the closed cover, or one phone page (its own turn comes in Phase 2) */}
      <div className="flex flex-1 flex-col book:hidden">
        {closed ? (
          <Cover />
        ) : (
          <PhonePage
            slug={chapter.slug}
            header={<PhoneHeader current={chapter.slug} />}
            footer={<PhoneTurnBar nav={nav} />}
          >
            {content[chapter.slug].phone}
          </PhonePage>
        )}
      </div>
    </>
  );
}
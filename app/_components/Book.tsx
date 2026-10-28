"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { CHAPTERS, COVER_HREF, getChapterNav, type ChapterSlug } from "../_lib/chapters";
import { BookBottomBar, BookTopNav } from "./BookNav";
import BookSpread from "./BookSpread";
import Cover from "./Cover";
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

// The one book that stays on screen. The URL is the boss: "/" means closed,
// a chapter URL means open on that chapter, and the book changes to match.
export default function Book({ content }: BookProps) {
  const pathname = usePathname();
  const router = useRouter();

  const closed = pathname === COVER_HREF;
  const index = Math.max(0, CHAPTERS.findIndex((c) => c.href === pathname));
  const chapter = CHAPTERS[index];
  const nav = getChapterNav(chapter.slug);

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
  const showHint = !closed && index === 0 && !turned;

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

  // Closed: just the cover (the swing open comes in the next step)
  if (closed) return <Cover />;

  // Laptop: every chapter's two pages, in reading order
  const pages = CHAPTERS.flatMap((c) => [content[c.slug].left, content[c.slug].right]);

  return (
    <>
      {/* 900px and up: two-page spread that turns */}
      <div className="hidden flex-1 flex-col book:flex">
        <BookSpread
          header={
            <>
              <BookTopNav current={chapter.slug} />
              {showHint && <TurnHint />}
            </>
          }
          footer={<BookBottomBar nav={nav} />}
        >
          <FlipBook
            pages={pages}
            spread={index}
            onUserTurn={(i) => router.push(CHAPTERS[i].href, { scroll: false })}
          />
        </BookSpread>
      </div>

      {/* Below 900px: one phone page (its own turn comes in Phase 2) */}
      <div className="flex flex-1 flex-col book:hidden">
        <PhonePage
          slug={chapter.slug}
          header={<PhoneHeader current={chapter.slug} />}
          footer={<PhoneTurnBar nav={nav} />}
        >
          {content[chapter.slug].phone}
        </PhonePage>
      </div>
    </>
  );
}
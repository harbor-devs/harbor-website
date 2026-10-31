"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { BACK_COVER_HREF, CHAPTERS, COVER_HREF, getChapterNav, type ChapterSlug } from "../_lib/chapters";
import BackLeaf from "./BackLeaf";
import { BackCoverBar, BookBottomBar, BookTopNav } from "./BookNav";
import BookSpread from "./BookSpread";
import Cover, { CoverHint } from "./Cover";
import CoverLeaf from "./CoverLeaf";
import FlipBook from "./FlipBook";
import PhoneBackCover from "./PhoneBackCover";
import PhoneBook from "./PhoneBook";
import { grabCover, type CoverGrab } from "./PhoneCoverLeaf";
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

// The last chapter's spread (where the back cover closes)
const LAST = CHAPTERS.length - 1;

// The one book that stays on screen. The URL is the boss: "/" means the front
// cover is shut, "/the-end" means the back cover is shut, a chapter URL means
// open on that chapter, and the book changes to match.
export default function Book({ content }: BookProps) {
  const pathname = usePathname();
  const router = useRouter();

  const closed = pathname === COVER_HREF;
  const backClosed = pathname === BACK_COVER_HREF;
  const index = backClosed ? LAST : Math.max(0, CHAPTERS.findIndex((c) => c.href === pathname));
  const chapter = CHAPTERS[index];
  const nav = getChapterNav(chapter.slug);

  // No swing to wait for: reduced motion, or the laptop book isn't showing (phone)
  const reduced = useSyncExternalStore(reducedMotion.subscribe, reducedMotion.get, serverFalse);
  const laptop = useSyncExternalStore(laptopWidth.subscribe, laptopWidth.get, serverFalse);
  const instant = reduced || !laptop;

  // Which spread the pages are actually on (the flip library tells us after each turn)
  const [flipAt, setFlipAt] = useState(closed ? 0 : index);
  // Where the front cover last finished swinging: true = open, false = shut
  const [settledOpen, setSettledOpen] = useState(!closed);
  // Where the back cover last finished swinging: true = shut, false = open
  const [backSettledShut, setBackSettledShut] = useState(backClosed);

  // --- The front cover ---
  // Closing from a later chapter: pages riffle back to the first chapter first,
  // and the cover stays open until they get there.
  const coverOpen = !closed || flipAt !== 0;
  // Fully open and landed: the cover hides and the real pages take over
  const coverDone = coverOpen && (instant || settledOpen);
  // Fully shut and resting
  const shutDone = !coverOpen && (instant || !settledOpen);

  // --- The back cover ---
  // Only shuts once the front is open and the pages are on the last chapter
  const backShut = backClosed && coverDone && flipAt === LAST;
  // Open and resting: the real last page shows
  const backDone = !backShut && (instant || !backSettledShut);
  // Shut and resting
  const backShutDone = backShut && (instant || backSettledShut);

  // Where the pages go. They wait for the back cover to be fully open,
  // and for the front cover to be fully open before leaving the first chapter.
  const flipTarget = !backDone ? LAST : closed ? 0 : coverDone ? index : 0;

  // --- The phone front cover (same idea as the laptop one above) ---
  // Which page the phone diary is actually on (it tells us after each turn)
  const [phoneAt, setPhoneAt] = useState(closed ? 0 : index);
  // Where the phone cover last finished swinging: true = open, false = shut
  const [phoneSettledOpen, setPhoneSettledOpen] = useState(!closed);
  // Where the phone back cover last finished swinging: true = shut, false = open
  const [phoneBackSettledShut, setPhoneBackSettledShut] = useState(backClosed);
  // A finger swinging the phone front cover by hand, open or shut (until it lands)
  const [grab, setGrab] = useState<CoverGrab | null>(null);
  // Same, for the phone back cover
  const [backGrab, setBackGrab] = useState<CoverGrab | null>(null);

  // From the back cover straight to the front cover ("Read again"):
  // no diary in between, so both covers just rest, no swing.
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    if (closed && prevPath === BACK_COVER_HREF) {
      setPhoneAt(0);
      setPhoneSettledOpen(false);
      setPhoneBackSettledShut(false);
    }
  }

  // Closing from a later chapter: pages riffle back to chapter one first
  const phoneCoverOpen = !closed || phoneAt !== 0;
  const phoneCoverDone = phoneCoverOpen && (reduced || phoneSettledOpen);
  const phoneShutDone = !phoneCoverOpen && (reduced || !phoneSettledOpen);

  // --- The phone back cover (same idea as the laptop one above) ---
  // Only shuts once the front is open and the diary is on the last chapter
  const phoneBackShut = backClosed && phoneCoverDone && phoneAt === LAST;
  // Open and resting: the real last page shows
  const phoneBackDone = !phoneBackShut && (reduced || !phoneBackSettledShut);
  // Shut and resting
  const phoneBackShutDone = phoneBackShut && (reduced || phoneBackSettledShut);

  // Where the diary goes. It stays on the last chapter until the back cover is
  // fully open, and on chapter one until the front cover is fully open.
  const phoneIndex = !phoneBackDone ? LAST : closed ? 0 : phoneCoverDone ? index : 0;
  // Fully open on a chapter: neither cover in the way or moving
  const phoneOpen = phoneCoverDone && phoneBackDone;
  // Resting open on the first chapter: a right swipe there pulls the front cover shut
  const canGrabShut = phoneOpen && !grab && !backGrab && index === 0;
  // Resting open on the last chapter: a left swipe there pulls the back cover shut
  const canGrabBack = phoneOpen && !grab && !backGrab && index === LAST;

  // Where "next" and "previous" go from here.
  // Front shut: next opens. First chapter: previous closes the front.
  // Last chapter: next closes the back. Back shut: previous opens it again.
  const nextHref = closed ? CHAPTERS[0].href : backClosed ? null : (nav.next?.href ?? BACK_COVER_HREF);
  const prevHref = closed ? null : backClosed ? CHAPTERS[LAST].href : (nav.prev?.href ?? COVER_HREF);

  // The book is fully open on a chapter (neither cover in the way or moving)
  const open = coverDone && backDone;

  // The "scroll or use the arrow keys" hint: shown on the first chapter
  // until the visitor turns a page for the first time, then gone for good.
  const [startIndex] = useState(index);
  const [turned, setTurned] = useState(false);
  if (!turned && index !== startIndex) setTurned(true);
  const showHint = open && index === 0 && !turned;

  // Under the book, once it stops moving: "Click to open" (front shut),
  // the bottom bar (open), or "Contact / The end / Read again" (back shut).
  const footer = shutDone ? (
    <CoverHint />
  ) : open ? (
    <BookBottomBar nav={nav} />
  ) : backShutDone ? (
    <BackCoverBar />
  ) : null;

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
  // Phone: every chapter's one page, in reading order
  const phonePages = CHAPTERS.map((c) => content[c.slug].phone);

  return (
    <>
      {closed && <h1 className="sr-only">Harbor, the working notebook of Abdullah Saghir</h1>}
      {backClosed && <h1 className="sr-only">The end. Thank you for reading Harbor.</h1>}

      {/* 900px and up: two-page spread that turns, with both swinging covers */}
      <div className="hidden flex-1 flex-col book:flex">
        <BookSpread
          closed={!coverOpen}
          backClosed={backShut}
          clipLeft={!coverDone}
          clipRight={!backDone}
          header={
            <>
              {/* Logo top-left once the book is open, or resting on its back cover */}
              <BookTopNav current={open ? chapter.slug : undefined} logo={open || backShutDone} />
              {showHint && <TurnHint />}
            </>
          }
          footer={footer}
          cover={
            <CoverLeaf
              open={coverOpen}
              done={coverDone}
              hideGround={backShut}
              inside={content[CHAPTERS[0].slug].left}
              onSettle={setSettledOpen}
            />
          }
          back={
            <BackLeaf
              shut={backShut}
              done={backDone}
              rested={backShutDone}
              inside={content[CHAPTERS[LAST].slug].right}
              onSettle={setBackSettledShut}
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

      {/* Below 900px: the resting front cover, the resting back cover, or the
          phone diary that curls page to page (with a cover swinging on top of it
          while it opens, closes, or a finger holds it). The diary only mounts
          on phone width, so the laptop never holds a WebGL canvas for it. */}
      <div className="flex flex-1 flex-col book:hidden">
        {phoneBackShutDone && !backGrab ? (
          <PhoneBackCover onGrab={setBackGrab} />
        ) : phoneShutDone && !grab ? (
          <Cover onGrab={setGrab} />
        ) : (
          !laptop && (
            <PhoneBook
              pages={phonePages}
              index={phoneIndex}
              onUserTurn={(i) => router.push(CHAPTERS[i].href, { scroll: false })}
              onArrive={setPhoneAt}
              header={<PhoneHeader current={phoneOpen ? chapter.slug : undefined} />}
              footer={phoneOpen && !grab && !backGrab ? <PhoneTurnBar nav={nav} /> : null}
              onGrabCover={canGrabShut ? (e, startX) => setGrab(grabCover(e, startX, true)) : null}
              onGrabBack={canGrabBack ? (e, startX) => setBackGrab(grabCover(e, startX, true)) : null}
              cover={
                !phoneCoverDone || grab
                  ? {
                      open: phoneCoverOpen,
                      grab,
                      // Landed (open or shut): the hand is done
                      onSettle: (o) => {
                        setPhoneSettledOpen(o);
                        setGrab(null);
                      },
                      // Let go past halfway: the URL catches up while it finishes
                      onLetGo: (o) => {
                        router.push(o ? CHAPTERS[0].href : COVER_HREF, { scroll: false });
                      },
                    }
                  : !phoneBackDone || backGrab
                    ? {
                        side: "back",
                        // "open" means the book is open, so the back cover is off the page
                        open: !phoneBackShut,
                        grab: backGrab,
                        // Landed (open or shut): the hand is done
                        onSettle: (o) => {
                          setPhoneBackSettledShut(!o);
                          setBackGrab(null);
                        },
                        // Let go past halfway: the URL catches up while it finishes
                        onLetGo: (o) => {
                          router.push(o ? CHAPTERS[LAST].href : BACK_COVER_HREF, { scroll: false });
                        },
                      }
                    : null
              }
            />
          )
        )}
      </div>
    </>
  );
}
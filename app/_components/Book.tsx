"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { CHAPTERS, getChapterNav, type ChapterSlug } from "../_lib/chapters";
import { BookBottomBar, BookTopNav } from "./BookNav";
import BookSpread from "./BookSpread";
import FlipBook from "./FlipBook";
import PhonePage from "./PhonePage";
import { PhoneHeader, PhoneTurnBar } from "./PhoneNav";

// What each chapter supplies: two laptop pages and one phone page
export type ChapterContent = {
  left: ReactNode;
  right: ReactNode;
  phone: ReactNode;
};

type BookProps = {
  content: Record<ChapterSlug, ChapterContent>;
};

// The one book that stays on screen. The URL is the boss: it decides the chapter,
// and the pages turn to match it.
export default function Book({ content }: BookProps) {
  const pathname = usePathname();
  const router = useRouter();

  const index = Math.max(0, CHAPTERS.findIndex((c) => c.href === pathname));
  const chapter = CHAPTERS[index];
  const nav = getChapterNav(chapter.slug);

  // Laptop: every chapter's two pages, in reading order
  const pages = CHAPTERS.flatMap((c) => [content[c.slug].left, content[c.slug].right]);

  return (
    <>
      {/* 900px and up: two-page spread that turns */}
      <div className="hidden flex-1 flex-col book:flex">
        <BookSpread
          header={<BookTopNav current={chapter.slug} />}
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
import type { ReactNode } from "react";
import { getChapterNav, type ChapterSlug } from "../_lib/chapters";
import BookSpread from "./BookSpread";
import { BookBottomBar, BookTopNav } from "./BookNav";
import PhonePage from "./PhonePage";
import { PhoneHeader, PhoneTurnBar } from "./PhoneNav";

type ChapterShellProps = {
  slug: ChapterSlug;
  left: ReactNode; // laptop, left page
  right: ReactNode; // laptop, right page
  phone: ReactNode; // phone, the single page
};

// Every chapter uses this. It picks laptop or phone layout at 900px
// and adds the right navigation to each, so chapters only supply content.
export default function ChapterShell({ slug, left, right, phone }: ChapterShellProps) {
  const nav = getChapterNav(slug);

  return (
    <>
      {/* 900px and up: two-page spread */}
      <div className="hidden flex-1 flex-col book:flex">
        <BookSpread
          header={<BookTopNav current={slug} />}
          footer={<BookBottomBar nav={nav} />}
          left={left}
          right={right}
        />
      </div>

      {/* Below 900px: one phone page */}
      <div className="flex flex-1 flex-col book:hidden">
        <PhonePage
          slug={slug}
          header={<PhoneHeader current={slug} />}
          footer={<PhoneTurnBar nav={nav} />}
        >
          {phone}
        </PhonePage>
      </div>
    </>
  );
}
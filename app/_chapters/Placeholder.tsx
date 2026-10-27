import type { CSSProperties } from "react";
import { getChapterNav, type ChapterSlug } from "../_lib/chapters";
import d from "../_components/Diary.module.css";
import Flourish from "../_components/Flourish";

// Which ruled line a .ruled block starts on (0 = first line)
const row = (n: number) => ({ "--row": n }) as CSSProperties;

// Content for a chapter that isn't written yet: a real book page with an honest label.
export function placeholder(slug: ChapterSlug) {
  const { chapter } = getChapterNav(slug);
  const kicker = `Chapter ${chapter.numeral.toUpperCase()}`;

  return {
    left: (
      <>
        <p className={d.kicker}>{kicker}</p>
        <h1 className={d.title}>{chapter.title}</h1>
        <Flourish className={d.flourish} />
      </>
    ),
    right: (
      <>
        <p className={d.kicker}>
          {kicker}
          <span className={d.sep} aria-hidden="true">&middot;</span>
          {chapter.title}
        </p>
        <h2 className={d.subtitle}>Still being written</h2>

        <div className={d.ruled} style={row(0)}>
          <p>This chapter isn&apos;t finished yet. The pages are here, the ink is coming soon.</p>
        </div>
      </>
    ),
    phone: (
      <>
        <p className={d.kickerPhone}>{kicker}</p>
        <h1 className={d.titlePhone}>{chapter.title}</h1>
        <Flourish className={d.flourishPhone} />
        <p className={d.linePhone}>Still being written. The ink is coming soon.</p>
      </>
    ),
  };
}
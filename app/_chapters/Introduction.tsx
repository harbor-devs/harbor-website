import Image from "next/image";
import type { CSSProperties } from "react";
import ChapterContents from "../_components/ChapterContents";
import d from "../_components/Diary.module.css";
import Flourish from "../_components/Flourish";

// Which ruled line a .ruled block starts on (0 = first line)
const row = (n: number) => ({ "--row": n }) as CSSProperties;

// Introduction content: left page, right page, phone page
export const introduction = {
  left: (
    <>
      <p className={d.kicker}>Chapter I</p>
      <h1 className={d.title}>Hello, I&apos;m Abdullah</h1>
      <Flourish className={d.flourish} />

      {/* Decorative ink sketch, hidden from screen readers */}
      <div className={d.figure} aria-hidden="true">
        <Image src="/sketches/intro-harbor.svg" alt="" width={396} height={184} unoptimized className={d.sketch} />
        <span className={d.figLabel}>fig. i</span>
      </div>

      {/* Lines 9 to 13: the last five ruled lines */}
      <div className={d.ruled} style={row(8)}>
        <p>
          I&apos;m a computer science student in Lahore. I build websites, apps and
          small tools, and I&apos;m curious about AI, healthcare, research and how
          people think.
        </p>
        <p className={d.indent}>Harbor is where I build, publish and take on work.</p>
      </div>

      <p className={d.folio} aria-hidden="true">i</p>
    </>
  ),
  right: (
    <>
      <p className={d.kicker}>
        Chapter I<span className={d.sep} aria-hidden="true">&middot;</span>Introduction
      </p>
      <h2 className={d.subtitle}>What Harbor is</h2>

      {/* Starts on the first ruled line: 3 lines of text, 1 empty, contents */}
      <div className={d.ruled} style={row(0)}>
        <p>
          Harbor is two things: the home for my work, and a place to hire me.
          Here you&apos;ll find what I&apos;ve built and written, and the services I offer.
        </p>
        <ChapterContents variant="book" />
      </div>

      <p className={d.folio} aria-hidden="true">ii</p>
    </>
  ),
  phone: (
    <>
      <p className={d.kickerPhone}>Chapter I</p>
      <h1 className={d.titlePhone}>Hello, I&apos;m Abdullah</h1>
      <Flourish className={d.flourishPhone} />
      <p className={d.linePhone}>I build, publish and take on work.</p>

      <ChapterContents variant="phone" />
    </>
  ),
};
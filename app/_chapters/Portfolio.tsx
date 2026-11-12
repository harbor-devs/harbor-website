import type { CSSProperties } from "react";
import CategoryList from "../_components/CategoryList";
import d from "../_components/Diary.module.css";
import Flourish from "../_components/Flourish";

// Which ruled line a .ruled block starts on (0 = first line)
const row = (n: number) => ({ "--row": n }) as CSSProperties;

// Portfolio content: left page, right page, phone page.
// Kept general on purpose (no project names or counts) so it stays true as work is added.
export const portfolio = {
  left: (
    <>
      <p className={d.kicker}>Chapter II</p>
      <h1 className={d.title}>Portfolio</h1>
      <Flourish className={d.flourish} />

      {/* Starts on the second ruled line, one line of air under the flourish */}
      <div className={d.ruled} style={row(1)}>
        <p>
          In today&apos;s world, almost every problem can have a solution if someone
          takes the time to make one. So whenever something in my own life felt
          harder than it needed to be, I did not wait for someone else to fix it. I
          sat down and made something for that exact problem. Everything here
          started that way. If something in your work feels harder than it should,
          I can make something just for you too, and the Services chapter is where
          we can begin.
        </p>
      </div>

      <p className={d.folio} aria-hidden="true">iii</p>
    </>
  ),
  right: (
    <>
      <p className={d.kicker}>
        Chapter II<span className={d.sep} aria-hidden="true">&middot;</span>Portfolio
      </p>
      <h2 className={d.subtitle}>What you will find</h2>

      {/* Starts on the second ruled line: the note, one empty line, "The boards", then the list */}
      <div className={d.ruled} style={row(1)}>
        <p>
          Some of these boards hold the things I have built. A few are live and
          working, and the rest are prototypes, early versions I made to see whether
          an idea could stand on its own. Others hold what I have written, questions
          I could not leave alone until I had read enough to answer them properly.
          New work is added as it is finished.
        </p>
           <CategoryList variant="book" heading="The boards" hint="Click a name to open its board." />
      </div>

      <p className={d.folio} aria-hidden="true">iv</p>
    </>
  ),
  phone: (
    <>
      <p className={d.kickerPhone}>Chapter II</p>
      <h1 className={d.titlePhone}>Portfolio</h1>
      <Flourish className={d.flourishPhone} />
      <p className={d.linePhone}>
        Whenever something in my life felt harder than it needed to be, I made
        something for it. I can do the same for you.
      </p>

      <CategoryList variant="phone" />
    </>
  ),
};
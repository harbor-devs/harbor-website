import type { CSSProperties } from "react";
import DeskNotes, { type DeskNote } from "../_components/DeskNotes";
import d from "../_components/Diary.module.css";
import Flourish from "../_components/Flourish";

// Which ruled line a .ruled block starts on (0 = first line)
const row = (n: number) => ({ "--row": n }) as CSSProperties;

// What is on the desk right now. When one is finished, it moves to the Portfolio and leaves here.
const NOTES: readonly DeskNote[] = [
  { tag: "Building", text: "Turning my prototypes into real, working apps, one at a time." },
  { tag: "Writing", text: "My next article, The Business of Being Sick." },
  { tag: "Researching", text: "Why Lahore disappears under smog every winter." },
  { tag: "Researching", text: "How much energy and water AI really uses." },
  { tag: "Building", text: "Getting CLACKLAB, my keyboard sound app for Windows, onto the Microsoft Store." },
];

// Now content: left page, right page, phone page
export const now = {
  left: (
    <>
      <p className={d.kicker}>Chapter III</p>
      <h1 className={d.title}>Now</h1>
      <Flourish className={d.flourish} />

      {/* Starts on the second ruled line, like Portfolio */}
      <div className={d.ruled} style={row(1)}>
        <p>
          Every book has one page where the ink is still wet. This is that page. It
          holds what I am working on right now, things that are not finished yet.
          When one of them is done, it moves into the Portfolio and leaves this page.
        </p>
      </div>

      <p className={d.folio} aria-hidden="true">v</p>
    </>
  ),
  right: (
    <>
      <p className={d.kicker}>
        Chapter III<span className={d.sep} aria-hidden="true">&middot;</span>Now
      </p>
      <h2 className={d.subtitle}>On the desk</h2>

      <DeskNotes variant="book" notes={NOTES} />

      <p className={d.folio} aria-hidden="true">vi</p>
    </>
  ),
  phone: (
    <>
      <p className={d.kickerPhone}>Chapter III</p>
      <h1 className={d.titlePhone}>Now</h1>
      <Flourish className={d.flourishPhone} />

      <DeskNotes variant="phone" notes={NOTES} />
    </>
  ),
};

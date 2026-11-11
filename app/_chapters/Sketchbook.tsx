import type { CSSProperties } from "react";
import d from "../_components/Diary.module.css";
import Flourish from "../_components/Flourish";
import s from "./Sketchbook.module.css";

// Which ruled line a .ruled block starts on (0 = first line)
const row = (n: number) => ({ "--row": n }) as CSSProperties;

// Ideas that are NOT built. Say so honestly, never move one here from the Portfolio.
// line: the sentence on the laptop page. what: the short label on the phone page.
const IDEAS = [
  { name: "Traceback", line: "which follows a claim back to where it began.", what: "source tracing app" },
  { name: "QuietMap", line: "a map of the quiet, shaded corners of a city.", what: "city map app" },
  { name: "A tone changer", line: "for turning rough messages into proper ones.", what: "message rewriting tool" },
  { name: "A robot vacuum", line: "designed on screen first, then built.", what: "hardware project" },
  { name: "A football game", line: "played with phones as controllers.", what: "multiplayer game" },
];

// Sketchbook content: left page, right page, phone page
export const sketchbook = {
  left: (
    <>
      <p className={d.kicker}>Chapter V</p>
      <h1 className={d.title}>Sketchbook</h1>
      <Flourish className={d.flourish} />

      {/* Starts on the second ruled line, like the other chapters */}
      <div className={d.ruled} style={row(1)}>
        <p>
          Nothing here is built yet. These are ideas I keep coming back to, drawn
          in pencil so they can still change. Some will become something one day,
          and some will stay on this page. Either way, I would rather keep them
          than forget them.
        </p>
      </div>

      <p className={d.folio} aria-hidden="true">ix</p>
    </>
  ),
  right: (
    <>
      <p className={d.kicker}>
        Chapter V<span className={d.sep} aria-hidden="true">&middot;</span>Sketchbook
      </p>
      <h2 className={d.subtitle}>In pencil</h2>

      {/* Starts on the first ruled line, one empty line between ideas */}
      <div className={d.ruled} style={row(0)}>
        <div className={s.list}>
          {IDEAS.map((idea) => (
            <p key={idea.name} className={s.idea}>
              <em>{idea.name}</em>, {idea.line}
            </p>
          ))}
        </div>
      </div>

      <p className={d.folio} aria-hidden="true">x</p>
    </>
  ),
  phone: (
    <>
      <p className={d.kickerPhone}>Chapter V</p>
      <h1 className={d.titlePhone}>Sketchbook</h1>
      <Flourish className={d.flourishPhone} />
      <p className={d.linePhone}>Ideas I keep coming back to. None are built yet.</p>

      {/* One idea per ruled line of the phone paper */}
      <div className={s.listPhone}>
        {IDEAS.map((idea) => (
          <p key={idea.name} className={s.idea}>
            <em>{idea.name}</em> <span className={s.what}>&middot; {idea.what}</span>
          </p>
        ))}
      </div>
    </>
  ),
};
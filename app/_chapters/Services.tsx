import type { CSSProperties } from "react";
import CallingCard from "../_components/CallingCard";
import d from "../_components/Diary.module.css";
import Flourish from "../_components/Flourish";

// Which ruled line a .ruled block starts on (0 = first line)
const row = (n: number) => ({ "--row": n }) as CSSProperties;

// Services content: left page, right page, phone page.
// Hiring goes through Upwork only (the calling card), no direct contact on the site.
export const services = {
  left: (
    <>
      <p className={d.kicker}>Chapter IV</p>
      <h1 className={d.title}>Services</h1>
      <Flourish className={d.flourish} />

      {/* Starts on the second ruled line, like Portfolio and Now */}
      <div className={d.ruled} style={row(1)}>
        <p>
          Most things on the internet now are made quickly, from the same few
          templates, and you can feel it. They work, but they forget the people
          behind them. Every business I have seen began with someone and a reason:
          a small shop, a long night, an idea that would not go away. Bring me
          yours, and I will build something that feels like something, not like a
          template.
        </p>
      </div>

      <p className={d.folio} aria-hidden="true">vii</p>
    </>
  ),
  right: (
    <>
      <p className={d.kicker}>
        Chapter IV<span className={d.sep} aria-hidden="true">&middot;</span>Services
      </p>
      <h2 className={d.subtitle}>What I can make</h2>

      {/* Starts on the first ruled line, the calling card sits below it */}
      <div className={d.ruled} style={row(0)}>
        <p>
          Websites for businesses and people who want theirs to feel like their
          own. Web apps and small tools for a problem that keeps getting in the
          way. Each one is built properly, from the first sketch to the day it
          goes live.
        </p>
      </div>

      <CallingCard variant="book" />

      <p className={d.folio} aria-hidden="true">viii</p>
    </>
  ),
  phone: (
    <>
      <p className={d.kickerPhone}>Chapter IV</p>
      <h1 className={d.titlePhone}>Services</h1>
      <Flourish className={d.flourishPhone} />
      <p className={d.linePhone}>Bring me your story, and I will build it a home.</p>

      <CallingCard variant="phone" />
    </>
  ),
};

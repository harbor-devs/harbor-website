import type { CSSProperties } from "react";
import CategoryList from "../_components/CategoryList";
import d from "../_components/Diary.module.css";
import Flourish from "../_components/Flourish";

// Which ruled line a .ruled block starts on (0 = first line)
const row = (n: number) => ({ "--row": n }) as CSSProperties;

// Portfolio content: left page, right page, phone page
export const portfolio = {
  left: (
    <>
      <p className={d.kicker}>Chapter II</p>
      <h1 className={d.title}>Portfolio</h1>
      <Flourish className={d.flourish} />

      <div className={d.ruled} style={row(0)}>
        <p>
          These are the things I have built, written and learned. Look through
          them as slowly as you like.
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
      <div className={d.ruled} style={row(0)}>
        <CategoryList variant="book" />
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
        These are the things I have built, written and learned. Look through them
        as slowly as you like.
      </p>

      <CategoryList variant="phone" />
    </>
  ),
};
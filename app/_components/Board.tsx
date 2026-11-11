import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { boardFonts } from "../_lib/boardFonts";
import type { Category } from "../_lib/portfolio";
import { NOTES, UPCOMING, type PortfolioItem, type Status } from "../_lib/portfolioItems";
import { MarkerCircle, MarkerInk, PaperClip, StartHere, Tape, UnderSheet } from "./BoardProps";
import d from "./BoardProps.module.css";
import s from "./Board.module.css";

// Slight repeating tilt and offset so papers look pinned by hand. Index 0 = heading paper.
const TILT = [-1.8, 3.4, -4.6, -1.2, 2.8, -3.8, 1.6, -5, 4.2];
const DX = [0, 10, -8, 14, -12, 6, -6, 12, -10];
const DY = [0, 18, 40, -6, 22, 4, 30, -10, 16];

function pinned(i: number) {
  const k = i % TILT.length;
  return { "--tilt": `${TILT[k]}deg`, "--dx": `${DX[k]}px`, "--dy": `${DY[k]}px` } as CSSProperties;
}

const STAMP: Record<Status, { label: string; className: string }> = {
  live: { label: "LIVE", className: s.live },
  prototype: { label: "PROTOTYPE", className: s.proto },
  "in-progress": { label: "IN PROGRESS", className: s.progress },
  published: { label: "PUBLISHED", className: s.live },
};

export default function Board({ category, items }: { category: Category; items: readonly PortfolioItem[] }) {
  // "Software & Websites" shows as "Software and Websites" with a small italic "and"
  const [first, second] = category.title.split(" & ");
  const count = `${items.length} ${items.length === 1 ? "CASE" : "CASES"} POSTED`;
  const note = NOTES[category.slug];

  return (
    <main className={`${s.wall} ${boardFonts}`}>
      <MarkerInk />

      <Link href="/portfolio" className={`${s.aged} ${s.tornC} ${s.back}`}>
        <span className={s.nail} aria-hidden="true" />
        &larr; back to the book
      </Link>

      <div className={s.frame}>
        <div className={s.cork}>
          <header className={`${s.aged} ${s.tornA} ${s.pin} ${s.head}`} style={pinned(0)}>
            <span className={s.nail} aria-hidden="true" />
            <p className={s.office}>HARBOR RECORDS OFFICE</p>
            <hr className={s.rule} />
            <h1 className={s.title}>
              {second ? (
                <>
                  {first} <span className={s.and}>and</span> {second}
                </>
              ) : (
                first
              )}
            </h1>
            <hr className={s.rule} />
            <p className={s.count}>
              DRAWER {category.numeral.toUpperCase()} &middot; {count}
            </p>
            <p className={s.orn} aria-hidden="true">&#10087; &#10087; &#10087;</p>
          </header>

          {/* A typed note read before any item, e.g. how the articles are written */}
          {note && (
            <p className={`${s.aged} ${s.tornC} ${s.pin} ${s.scrap}`} style={pinned(items.length + 2)}>
              <span className={s.nail} aria-hidden="true" />
              {note}
            </p>
          )}

          {items.map((item, i) => {
            const stamp = (
              <span className={`${s.stamp} ${STAMP[item.status].className}`}>{STAMP[item.status].label}</span>
            );

            return (
              // The slot tilts and lifts; clips and tape sit on it so the torn paper edge doesn't cut them off
              <div key={item.title} className={`${s.pin} ${s.slot}`} style={pinned(i + 1)}>
                <article className={`${s.aged} ${i % 2 ? s.tornA : s.tornB} ${s.paper}`}>
                  <span className={s.nail} aria-hidden="true" />
                  <p className={s.kicker}>CASE No. {String(i + 1).padStart(3, "0")}</p>

                  {/* The title link stretches over the whole paper, so clicking anywhere opens it */}
                  <h2 className={s.name}>
                    <a className={s.cover} href={item.links[0].href} target="_blank" rel="noopener noreferrer">
                      {item.title}
                    </a>
                  </h2>
                  <p className={s.kind}>{item.kind}</p>

                  {item.image && (
                    <div className={s.photo}>
                      <Image src={item.image} alt={`Screenshot of ${item.title}`} fill sizes="200px" className={s.photoImg} />
                    </div>
                  )}

                  <p className={s.line}>{item.line}</p>
                  {item.madeWith && <p className={s.made}>MADE WITH {item.madeWith.toUpperCase()}</p>}

                  <div className={s.links}>
                    {item.links.map((l) => (
                      <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
                        {l.label}
                      </a>
                    ))}
                  </div>

                  {/* LIVE stamps get circled in red marker */}
                  {item.status === "live" ? (
                    <span className={d.stampWrap}>
                      {stamp}
                      <MarkerCircle />
                    </span>
                  ) : (
                    stamp
                  )}
                </article>

                {i === 0 && <StartHere />}
                {i % 4 === 1 && (
                  <>
                    <UnderSheet />
                    <PaperClip />
                  </>
                )}
                {i % 4 === 3 && <Tape />}
              </div>
            );
          })}

          {items.length === 0 && (
            <p className={`${s.aged} ${s.tornC} ${s.pin} ${s.scrap}`} style={pinned(1)}>
              <span className={s.nail} aria-hidden="true" />
              Nothing is pinned here yet.
            </p>
          )}

          {UPCOMING[category.slug] && (
            <p className={`${s.aged} ${s.tornC} ${s.pin} ${s.scrap}`} style={pinned(items.length + 1)}>
              <span className={s.nail} aria-hidden="true" />
              {UPCOMING[category.slug]}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
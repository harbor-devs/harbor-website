import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { boardFonts } from "../_lib/boardFonts";
import type { Category } from "../_lib/portfolio";
import type { PortfolioItem, Status } from "../_lib/portfolioItems";
import s from "./Board.module.css";

// Slight repeating tilt and offset so papers look pinned by hand. Index 0 = heading paper.
const TILT = [-1.8, 2.2, -3, -1.6, 1.4, -2.4, 1.8, -1.2, 2.6];
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
};

export default function Board({ category, items }: { category: Category; items: readonly PortfolioItem[] }) {
  // "Software & Websites" shows as "Software and Websites" with a small italic "and"
  const [first, second] = category.title.split(" & ");
  const count = `${items.length} ${items.length === 1 ? "CASE" : "CASES"} POSTED`;

  return (
    <main className={`${s.wall} ${boardFonts}`}>
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

          {items.map((item, i) => (
            <article
              key={item.title}
              className={`${s.aged} ${i % 2 ? s.tornA : s.tornB} ${s.pin} ${s.paper}`}
              style={pinned(i + 1)}
            >
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

              <span className={`${s.stamp} ${STAMP[item.status].className}`}>{STAMP[item.status].label}</span>
            </article>
          ))}

          {items.length === 0 && (
            <p className={`${s.aged} ${s.tornC} ${s.pin} ${s.scrap}`} style={pinned(1)}>
              <span className={s.nail} aria-hidden="true" />
              Nothing is pinned here yet.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
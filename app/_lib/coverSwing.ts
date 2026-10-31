// The laptop covers' swing, run by JavaScript instead of CSS, so a mouse
// can hold a cover anywhere along the way and let it finish from there.
// Shared by CoverLeaf (front cover) and BackLeaf (back cover).

// One full swing. Keep the same as --duration-cover in globals.css.
export const COVER_MS = 1100;
// px per ms: a quick drag counts even if it's short
export const FLICK = 0.4;

// Same as CSS cubic-bezier(): returns a curve that takes time (0 to 1) and gives progress (0 to 1)
export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const at = (t: number, p1: number, p2: number) =>
    ((1 - 3 * p2 + 3 * p1) * t + (3 * p2 - 6 * p1)) * t * t + 3 * p1 * t;
  const slope = (t: number, p1: number, p2: number) =>
    3 * (1 - 3 * p2 + 3 * p1) * t * t + 2 * (3 * p2 - 6 * p1) * t + 3 * p1;

  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    // Find the t where the curve is at x (Newton's method, fast)...
    let t = x;
    for (let i = 0; i < 8; i++) {
      const dx = at(t, x1, x2) - x;
      if (Math.abs(dx) < 1e-5) return at(t, y1, y2);
      const d = slope(t, x1, x2);
      if (Math.abs(d) < 1e-6) break;
      t -= dx / d;
    }
    // ...or by halving the range if that didn't settle
    let lo = 0;
    let hi = 1;
    t = x;
    while (hi - lo > 1e-5) {
      if (at(t, x1, x2) < x) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return at(t, y1, y2);
  };
}

// --ease-turn in globals.css
export const easeTurn = cubicBezier(0.65, 0, 0.35, 1);
// Fast start, soft landing (after the mouse lets go, it's already moving)
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

// 0 before a, 1 after b, a straight line in between
export const ramp = (a: number, b: number, x: number) => Math.min(Math.max((x - a) / (b - a), 0), 1);

// Where a cover's free edge is (1 = flat on one side, 0 = standing on the spine,
// -1 = flat on the other side) turned into how far it has swung (0 to 1)
export const edgeToSwing = (edge: number) => Math.acos(Math.min(Math.max(edge, -1), 1)) / Math.PI;

// ---- One swing at a time ----
export type Swing = {
  v: number; // how far it has swung (0 to 1)
  raf: number;
  aim: { to: number; done: () => void } | null; // the swing that's running
};

// A new swing starts from wherever the cover is, so nothing jumps
export function runSwing(
  s: Swing,
  to: number,
  draw: (v: number) => void,
  done: () => void,
  curve: (t: number) => number = easeTurn,
) {
  cancelAnimationFrame(s.raf);
  const from = s.v;
  const ms = COVER_MS * Math.abs(to - from);
  const aim = { to, done };
  s.aim = aim;
  draw(from); // right away, before the browser paints, so nothing flashes

  // The clock starts on the first real frame, so a slow first frame can't skip ahead
  let start = 0;
  const tick = (now: number) => {
    if (!start) start = now;
    const t = ms ? Math.min((now - start) / ms, 1) : 1;
    s.v = t < 1 ? from + (to - from) * curve(t) : to;
    draw(s.v);
    if (t < 1) {
      s.raf = requestAnimationFrame(tick);
      return;
    }
    s.aim = null;
    aim.done(); // read at the end: it can be swapped while running
  };
  s.raf = requestAnimationFrame(tick);
}

// ---- Writing straight on the elements ----

// With its CSS transition off, so it can't lag behind
export function setStyle(el: HTMLElement, prop: string, value: string | number) {
  el.style.setProperty("transition", "none");
  el.style.setProperty(prop, String(value));
}

// Resting: hand everything back to the CSS
export function clearStyles(els: HTMLElement[]) {
  for (const el of els) {
    for (const prop of ["transition", "transform", "opacity", "clip-path"]) el.style.removeProperty(prop);
  }
}

// One marked piece inside an element
export const part = (root: ParentNode, name: string) => root.querySelector<HTMLElement>(`[data-part="${name}"]`);

// The open book's own pieces. They live in BookSpread (a cover slot's parent)
// and both covers move them while they swing.
export type SpreadParts = {
  book: HTMLElement; // the whole book: slides to the middle and shrinks a little when a cover is shut
  board: HTMLElement;
  shadowRight: HTMLElement;
  stackLeft: HTMLElement;
  stackRight: HTMLElement;
};

export function findSpread(slot: HTMLElement | null): SpreadParts | null {
  const book = slot?.parentElement;
  if (!book) return null;
  const mine = (name: string) => book.querySelector<HTMLElement>(`:scope > [data-part="${name}"]`);
  const board = mine("board");
  const shadowRight = mine("shadow-right");
  const stackLeft = mine("stack-left");
  const stackRight = mine("stack-right");
  if (!board || !shadowRight || !stackLeft || !stackRight) return null;
  return { book, board, shadowRight, stackLeft, stackRight };
}
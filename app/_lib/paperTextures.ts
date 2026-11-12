// Old-paper textures as small SVG pictures (grain, stains, fibres).
// DeskNotes puts them on the page as CSS variables, and paintSheet draws the same ones
// while a phone page turns, so the folding page matches the real one.

export const NOISE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.32 0 0 0 0 0.2 0 0 0 0 0.07 0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>";

export const STAIN = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='420' height='420'><filter id='s'><feTurbulence type='fractalNoise' baseFrequency='0.011' numOctaves='3' seed='7' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.27 0 0 0 0 0.08 1.5 0 0 0 -0.62'/></filter><rect width='100%' height='100%' filter='url(%23s)'/></svg>";

export const FIBERS = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='f'><feTurbulence type='turbulence' baseFrequency='0.02 0.6' numOctaves='2' seed='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.35 0 0 0 0 0.22 0 0 0 0 0.1 0 0 0 0.18 0'/></filter><rect width='100%' height='100%' filter='url(%23f)'/></svg>";

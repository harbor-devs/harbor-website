# Diary textures

The paper and desk textures in `public/textures/` are baked from the locked
Claude Design canvas "Harbor diary, final". In the mockups they were live SVG
noise filters. Here they are plain images, so the browser does not recompute
them on every frame (smoother on phones and during page flips).

## How they were made

1. The exact texture markup was taken from each canvas board.
2. Rendered in headless Chromium at 2x pixel density.
3. Checked against the original board render: mean pixel difference under 0.1 out of 255.
4. Saved as WebP, quality 75 (no visible change, checked zoomed in).

## Files

All sizes below are CSS pixels. The image files are 2x that.

| File | CSS size | Used for | Placement |
| --- | --- | --- | --- |
| `desk-laptop.webp` | 1280 x 800 | Desk behind the book, laptop | Full screen, `background-size: cover` |
| `desk-phone.webp` | 390 x 844 | Desk behind the book, phone | Full screen, `background-size: cover` |
| `paper-spread.webp` | 1040 x 640 | Both pages of every laptop spread (all six are identical) | Inside the 1060 x 664 book board at left 10, top 8. Left page = left half, right page = right half |
| `page-phone-intro.webp` | 330 x 467 | Phone page, Introduction | Phone page box, top left |
| `page-phone-portfolio.webp` | 330 x 467 | Phone page, Portfolio | Same |
| `page-phone-services.webp` | 330 x 467 | Phone page, Services | Same |
| `page-phone-now.webp` | 330 x 467 | Phone page, Now | Same |
| `page-phone-sketchbook.webp` | 330 x 467 | Phone page, Sketchbook | Same |
| `page-phone-contact.webp` | 330 x 467 | Phone page, Contact | Same |
| `curl-phone.webp` | 96 x 539 | Pages folded back around the left edge, phone | Offset left -70, top -26 from the phone page box (includes its own shadow) |

Each phone page has its own stain pattern, which is why there are six files.
The paper images already include the ruled lines, margin lines, stains and
(on phone) the gutter shading.

## Still plain CSS (not baked)

These have no filters in the mockup, so they stay as CSS:

- Laptop book board (leather gradient + shadow) and the page stack edges
- Phone page stack edges (right and bottom stripes) and the page's small shadow

## Not baked yet

Closed cover, back cover and the thank-you flower. Bake them when those parts get built.

## Changes

- Oct 25, 2026: re-baked `paper-spread.webp` and all six `page-phone-*.webp`
  with darker ruled lines (laptop rule opacity 0.5 to 0.9, phone 0.6 to 1.0).
  Same method and settings as above, nothing else changed.
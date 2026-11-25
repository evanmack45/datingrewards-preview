# datingrewards.com STATUS

- Preview: https://evanmack45.github.io/datingrewards-preview/
- Repo: https://github.com/evanmack45/datingrewards-preview (Pages from main /docs, cname null)
- State: noindex GitHub Pages preview. Not on the custom domain. No DNS, Afternic or registrar change.

## Round-2 art, 2026-11-25 8:13 AM CT

Wired Dash r2 art from art/incoming/r2 (manifest caveats honored; Fal not used).

- Hero: 1600×900 carnival prize booth (fish, tiger, summit flag, sunglasses; blank wooden sign, no letters) sits above the bingo card in a `.stage` stack. `<picture>` with a 4:3 center phone crop (200,0,1400,900) and 16:9 desktop sources. LCP at 390 is `hero-phone-800.webp` (101.5 KB), well under ~120 KB. width/height and CSS aspect-ratio 4/3 phone, 16/9 desktop. `fetchpriority="high"` on the hero only.
- Badges: matching Bronze/Silver/Gold Swiper medal appears next to the yellow SWIPE stamp on reveal, and is drawn at 360px on the share-card poster. The tier name stays in HTML (`#stamp`, `#r-title`, save button). Blackout stays text-only (no badge art shipped). Cream edges keyed to transparency so medals composite on yellow and on the blue poster.
- Ticket: low-opacity stub behind the FREE square (opacity 0.42, multiply). “Free” label contrast on the live fold is ~7:1 vs the pink daub (darkest-pink 5th percentile 4.74:1), above 4.5:1.

Visual review of every piece: no baked-in text or letters, no real likenesses, not the generic boxed stickers of r1. Nothing cut in this round.

Gate (390+1280, qa/art-r2 and qa/art-r2-1280): PASS, no P0/P1. Lighthouse mobile performance 99 / accessibility 100 / best-practices 100, CLS 0, LCP 2.0 s, SEO 66 (intended noindex). Impeccable 0 at 390 and 1280, empty card and gold reveal. Live e2e: Bronze, Silver and Gold reveals plus share PNGs.

Folds (opened): qa/art-folds/fold-390.png, fold-1280.png. Reveal: qa/art-folds/reveal-390.png (also reveal-bronze/silver/gold-390.png, reveal-gold-1280.png). Share cards: share-bronze.png, share-silver.png, share-gold.png.

## Wow pass, 2026-11-25 7:42 AM CT

D1 was the weakest of ATL, T1, D1, B1 and Y1 after the art wiring. ATL and B1 already have distinctive in-page art (Dash accepted both). T1 has the diner still-life masthead. Y1 has the fold-and-dial hero. D1 only kept an OG card — the sticker pile and trophy shelf were correctly cut as generic boxed stickers — so a finished game still ended on a caption under a picture of the grid. A stranger had no reason to post it.

The shareable thing on this site is the joke badge (Bronze / Silver / Gold Swiper, Blackout), not decoration. Two changes:

1. Reveal: when a line lands, the yellow SWIPE stamp and the save button name the badge you just unlocked (“Bronze Swiper”, “Save your Bronze Swiper”), instead of a generic “Bingo!” / “Save card image”.
2. Share card: a bingo result is a badge poster — “Bingo!” plus the title and the prize line, with the marked card as proof — not a grid with a caption underneath.

Gate (390+1280, /workspace/sites/datingrewards.com/qa/wow-v1/): PASS, no P0/P1. Lighthouse mobile performance 100 / accessibility 100 / best-practices 100, CLS 0, LCP 0.8 s, SEO 63 (intended noindex). Impeccable 0 findings at both viewports.

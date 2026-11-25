# datingrewards-preview

Noindex preview of "Dating App Bingo" for datingrewards.com. Every visit deals a 5x5 card from 60 generic dating-app clichés. Tap what has happened to you; five in a row earns a joke badge, never a real prize. Save the filled card as a PNG or copy a link that rebuilds the same card and marks.

- `node build.mjs` turns `data/squares.json` into `docs/` (served by GitHub Pages). The build fails on duplicate, empty or too-long squares.
- `src/logic.js` holds the pure card logic (seeded deal, marks bitmask, lines, link format `#c=<seed>.<marks>` in base 36), shared by the page, the build and the tests.
- Fonts: Bagel Fat One and Figtree, SIL Open Font License, self-hosted (licenses in `src/fonts/`).
- No accounts, cookies, storage, analytics or third-party requests. Squares are made-up tropes, never real people. 18+.

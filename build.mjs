// Builds docs/ from data/squares.json and src/. Plain node, no dependencies.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, rmSync, readdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { deal, FREE, CELLS, withFree } from './src/logic.js';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, 'docs');
const SITE = 'https://evanmack45.github.io/datingrewards-preview/';
const AFTERNIC = 'https://www.afternic.com/domain/datingrewards.com';
const DEFAULT_SEED = 20261125;
const data = JSON.parse(readFileSync(join(here, 'data/squares.json'), 'utf8'));

// Boundary checks: fail the build on bad data.
const fail = (m) => { throw new Error(`squares.json: ${m}`); };
if (!Array.isArray(data.pool) || data.pool.length < CELLS - 1) fail('pool needs at least 24 squares');
if (new Set(data.pool.map((s) => s.toLowerCase())).size !== data.pool.length) fail('duplicate squares');
for (const s of [...data.pool, data.free]) { if (typeof s !== 'string' || !s.trim()) fail('empty square'); if (s.length > 30) fail(`square too long: ${s}`); if (/[—<>]/.test(s)) fail(`bad character in: ${s}`); }
if (!data.rewards?.length || data.rewards.some((r, i) => i && r.lines <= data.rewards[i - 1].lines)) fail('rewards must be sorted by lines');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const order = deal(DEFAULT_SEED, data.pool.length);
const cellText = (p) => (p === FREE ? data.free : data.pool[order[p < FREE ? p : p - 1]]);
const cells = [...Array(CELLS).keys()].map((p) => p === FREE
  ? `<button type="button" class="cell free is-on" data-i="${p}" aria-pressed="true" disabled><span class="ft">Free</span><span class="tx">${esc(cellText(p))}</span></button>`
  : `<button type="button" class="cell" data-i="${p}" aria-pressed="false"><span class="tx">${esc(cellText(p))}</span></button>`).join('\n      ');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Dating App Bingo</title>
<meta name="description" content="A fresh bingo card of dating-app clichés. Tap what has happened to you, get five in a row, save the card.">
<meta property="og:title" content="Dating App Bingo">
<meta property="og:description" content="Tap what has happened to you. Five in a row earns a joke badge, not a real prize.">
<meta property="og:image" content="${SITE}og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="A five-by-five grid of empty rounded squares in pink, lime and yellow with some daubed, a big star in the centre square and a bingo dauber.">
<meta property="og:type" content="website">
<meta name="theme-color" content="#1f3fd0">
<link rel="preload" href="fonts/bagel.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fonts/figtree.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="style.css">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='14' fill='%23ff3d7f'/%3E%3C/svg%3E">
</head>
<body>
<header class="top">
  <a class="brand" href="./">Dating Rewards</a>
  <a class="toplink" href="#about">How it works</a>
</header>
<main class="play" id="play" data-seed="${DEFAULT_SEED}">
  <div class="intro">
    <h1>Dating App Bingo</h1>
    <p class="lede">Tap every square that has happened to you on the apps. Five in a row earns a joke badge for your card. It is never a real prize.</p>
  </div>
  <div class="card" id="card" data-impeccable-ignore="hard-offset-shadow">
    <div class="letters" aria-hidden="true"><span>S</span><span>W</span><span>I</span><span>P</span><span>E</span><p class="stamp" id="stamp">Bingo!</p></div>
    <div class="cells" id="cells" role="group" aria-label="Bingo card, 25 squares">
      ${cells}
    </div>
  </div>
  <div class="side">
    <p class="status" id="status" aria-live="polite">Nothing marked yet. The free square is on the house.</p>
    <div class="reward" id="reward" data-impeccable-ignore="hard-offset-shadow" hidden>
      <p class="r-kicker">Bingo! Joke badge unlocked</p>
      <p class="r-title" id="r-title"></p>
      <p class="r-prize" id="r-prize"></p>
      <p class="r-small">Badges are jokes for your card image. There are no real prizes, payments or giveaways.</p>
    </div>
    <div class="actions">
      <button type="button" class="btn hot" id="save">Save card image</button>
      <button type="button" class="btn" id="copy">Copy link</button>
      <button type="button" class="btn ghost" id="new">New card</button>
    </div>
    <p class="msg" id="msg" aria-live="polite"></p>
    <noscript><p class="msg">Marking squares needs JavaScript. Here is today's card to read.</p></noscript>
  </div>
</main>
<section class="about" id="about" aria-labelledby="about-h">
  <h2 id="about-h">How it works</h2>
  <p>Every card is 24 squares picked at random from ${data.pool.length} generic dating-app clichés, plus a free square in the middle. Mark a full row, column or diagonal for bingo. Mark all 25 for a blackout.</p>
  <p>Nothing you tap leaves your browser. There are no accounts, cookies or trackers. Your marks live in this page and in the link, but only if you copy it and send it yourself. The link holds the card number and which squares are marked, nothing else.</p>
  <p>The squares are made-up tropes, not real people or real profiles. This is a joke game for adults who use dating apps, so it is 18+.</p>
  <details class="all">
    <summary>See all ${data.pool.length} squares</summary>
    <ul>${data.pool.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
  </details>
</section>
<footer class="foot">
  <p>Dating Rewards is a joke game for adults, 18+. Not linked to any dating app.</p>
  <p><a href="${AFTERNIC}">This domain is for sale.</a></p>
</footer>
<script type="application/json" id="squares">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
<script type="module" src="app.js"></script>
</body>
</html>
`;

rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, 'fonts'), { recursive: true });
writeFileSync(join(out, 'index.html'), html);
for (const f of ['style.css', 'app.js', 'logic.js']) copyFileSync(join(here, 'src', f), join(out, f));
mkdirSync(join(out, 'img'), { recursive: true });
for (const f of readdirSync(join(here, 'src/img'))) copyFileSync(join(here, 'src/img', f), join(out, 'img', f));
copyFileSync(join(here, 'src/img/og.jpg'), join(out, 'og.jpg'));
for (const f of readdirSync(join(here, 'src/fonts'))) copyFileSync(join(here, 'src/fonts', f), join(out, 'fonts', f));
writeFileSync(join(out, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
writeFileSync(join(out, '.nojekyll'), '');
console.log(`built ${out}: ${data.pool.length} squares, default seed ${DEFAULT_SEED}, free square marked ${withFree(0) === 1 << FREE}`);

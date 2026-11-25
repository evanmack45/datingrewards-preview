// Pure card logic shared by the page, the build and the tests. No DOM.
export const SIZE = 5, CELLS = 25, FREE = 12;
export const LINES = [
  ...[0, 1, 2, 3, 4].map((r) => [0, 1, 2, 3, 4].map((c) => r * 5 + c)),
  ...[0, 1, 2, 3, 4].map((c) => [0, 1, 2, 3, 4].map((r) => r * 5 + c)),
  [0, 6, 12, 18, 24], [4, 8, 12, 16, 20],
];
export const MAX_SEED = 2 ** 32 - 1;

function mulberry32(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// 24 pool indexes in card order (the free square sits in the middle).
export function deal(seed, poolSize) {
  const rnd = mulberry32(seed), idx = [...Array(poolSize).keys()];
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return idx.slice(0, CELLS - 1);
}

export const withFree = (marks) => (marks | (1 << FREE)) >>> 0;
export const isMarked = (marks, i) => ((marks >>> i) & 1) === 1;
export const toggle = (marks, i) => (i === FREE ? withFree(marks) : withFree((marks ^ (1 << i)) >>> 0));
export const countMarked = (marks) => { let n = 0; for (let i = 0; i < CELLS; i++) n += (marks >>> i) & 1; return n; };
export const doneLines = (marks) => LINES.filter((l) => l.every((i) => isMarked(marks, i)));

// The line closest to done that is not done yet: { line, need }.
export function closest(marks) {
  let best = null;
  for (const l of LINES) { const need = l.filter((i) => !isMarked(marks, i)).length; if (need > 0 && (!best || need < best.need)) best = { line: l, need }; }
  return best;
}

export function lineName(line) {
  const k = LINES.indexOf(line);
  const ord = ['top', 'second', 'middle', 'fourth', 'bottom'], col = ['first', 'second', 'middle', 'fourth', 'last'];
  if (k < 5) return `${ord[k]} row`;
  if (k < 10) return `${col[k - 5]} column`;
  return k === 10 ? 'diagonal from top left' : 'diagonal from top right';
}

export function reward(rewards, lines) {
  let r = null; for (const x of rewards) if (lines >= x.lines) r = x; return r;
}

// Link state: #c=<seed base36>.<marks base36>. Returns null for anything invalid.
export const encode = (seed, marks) => `c=${seed.toString(36)}.${withFree(marks).toString(36)}`;
export function decode(hash) {
  const m = /^#?c=([0-9a-z]{1,7})\.([0-9a-z]{1,6})$/.exec(hash || '');
  if (!m) return null;
  const seed = parseInt(m[1], 36), marks = parseInt(m[2], 36);
  if (!(seed >= 1 && seed <= MAX_SEED) || !(marks >= 0 && marks < 2 ** CELLS)) return null;
  return { seed, marks: withFree(marks) };
}

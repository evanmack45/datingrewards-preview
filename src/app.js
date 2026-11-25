import { deal, FREE, CELLS, MAX_SEED, withFree, isMarked, toggle, countMarked, doneLines, closest, lineName, reward, encode, decode } from './logic.js';

const data = JSON.parse(document.getElementById('squares').textContent);
const $ = (s) => document.querySelector(s);
const cellsEl = [...document.querySelectorAll('.cell')];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let seed = Number($('#play').dataset.seed), marks = withFree(0), lastLines = 0;

const randomSeed = () => { const a = new Uint32Array(1); do crypto.getRandomValues(a); while (a[0] < 1 || a[0] > MAX_SEED); return a[0]; };
const textAt = (order, p) => (p === FREE ? data.free : data.pool[order[p < FREE ? p : p - 1]]);
const linkFor = () => `${location.origin}${location.pathname}#${encode(seed, marks)}`;
const say = (t) => { $('#msg').textContent = t; };

function render({ celebrate = false } = {}) {
  const order = deal(seed, data.pool.length);
  const lines = doneLines(marks), win = new Set(lines.flat());
  cellsEl.forEach((el, p) => {
    if (p !== FREE) el.querySelector('.tx').textContent = textAt(order, p);
    const on = isMarked(marks, p);
    el.classList.toggle('is-on', on);
    el.classList.toggle('is-win', win.has(p));
    if (p !== FREE) el.setAttribute('aria-pressed', String(on));
    // A little wobble per square so the daubs look hand-stamped.
    const h = (seed ^ (p * 2654435761)) >>> 0;
    el.style.setProperty('--rot', `${(h % 41) - 20}deg`);
    el.style.setProperty('--dx', `${((h >>> 8) % 9) - 4}%`);
    el.style.setProperty('--dy', `${((h >>> 16) % 9) - 4}%`);
  });
  const n = countMarked(marks) - 1, k = lines.length;
  const status = $('#status');
  if (k === 0) {
    const c = closest(marks);
    status.textContent = n === 0 ? 'Nothing marked yet. The free square is on the house.' : `${n} marked. ${c.need} more in the ${lineName(c.line)} for bingo.`;
  } else if (n === CELLS - 1) status.textContent = 'Blackout. You have seen it all.';
  else status.textContent = `Bingo! ${k} ${k === 1 ? 'line' : 'lines'} so far.`;
  const r = reward(data.rewards, n === CELLS - 1 ? 12 : k);
  $('#reward').hidden = !r;
  if (r) { $('#r-title').textContent = r.title; $('#r-prize').textContent = r.prize; }
  $('#card').classList.toggle('has-bingo', k > 0);
  if (celebrate && k > lastLines) confetti();
  lastLines = k;
  history.replaceState(null, '', `#${encode(seed, marks)}`);
}

function load() {
  const h = location.hash;
  const st = decode(h);
  if (st) { seed = st.seed; marks = st.marks; }
  else { seed = randomSeed(); marks = withFree(0); if (h && h !== '#') say('That link was broken, so here is a fresh card.'); }
  lastLines = doneLines(marks).length;
  render();
}

$('#cells').addEventListener('click', (e) => {
  const el = e.target.closest('.cell'); if (!el || el.disabled) return;
  marks = toggle(marks, Number(el.dataset.i)); say('');
  render({ celebrate: true });
});
$('#new').addEventListener('click', () => { seed = randomSeed(); marks = withFree(0); lastLines = 0; say('Fresh card dealt.'); render(); });
addEventListener('hashchange', () => { const st = decode(location.hash); if (st && (st.seed !== seed || st.marks !== marks)) { seed = st.seed; marks = st.marks; lastLines = doneLines(marks).length; render(); } });

$('#copy').addEventListener('click', async () => {
  const url = linkFor();
  try { await navigator.clipboard.writeText(url); say('Link copied. It opens this exact card with your marks.'); }
  catch { const t = document.createElement('textarea'); t.value = url; document.body.append(t); t.select(); const ok = document.execCommand('copy'); t.remove(); say(ok ? 'Link copied.' : url); }
});

// ---------- confetti ----------
function confetti() {
  if (reduce) return;
  const c = document.createElement('canvas'); c.className = 'confetti'; c.setAttribute('aria-hidden', 'true');
  const W = (c.width = innerWidth), H = (c.height = innerHeight); document.body.append(c);
  const g = c.getContext('2d'), cols = ['#ff3d7f', '#ffd23f', '#fff6e6', '#18c29c'];
  const bits = Array.from({ length: 110 }, () => ({ x: W / 2 + (Math.random() - 0.5) * W * 0.3, y: H * 0.45, vx: (Math.random() - 0.5) * 16, vy: -Math.random() * 16 - 6, r: Math.random() * 6, s: 6 + Math.random() * 7, c: cols[Math.floor(Math.random() * cols.length)], heart: Math.random() < 0.25 }));
  const t0 = performance.now();
  (function frame(t) {
    const dt = t - t0; g.clearRect(0, 0, W, H);
    for (const b of bits) {
      b.vy += 0.5; b.x += b.vx; b.y += b.vy; b.r += 0.15; g.save(); g.translate(b.x, b.y); g.rotate(b.r); g.fillStyle = b.c;
      if (b.heart) { g.font = `${b.s * 2}px Figtree, sans-serif`; g.fillText('\u2665', -b.s / 2, b.s / 2); } else g.fillRect(-b.s / 2, -b.s / 4, b.s, b.s / 2);
      g.restore();
    }
    if (dt < 1500) requestAnimationFrame(frame); else c.remove();
  })(t0);
}

// ---------- card image ----------
const C = { blue: '#1f3fd0', paper: '#fff6e6', ink: '#1b1035', pink: '#ff3d7f', yellow: '#ffd23f', mute: '#5b4d6b' };
function wrap(g, text, maxW) {
  const words = text.split(' '), lines = []; let cur = '';
  for (const w of words) { const t = cur ? `${cur} ${w}` : w; if (g.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines;
}
async function drawCard() {
  await Promise.all([document.fonts.load('80px "Bagel Fat One"'), document.fonts.load('600 24px Figtree')]);
  const W = 1080, H = 1350, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d'), order = deal(seed, data.pool.length), lines = doneLines(marks), win = new Set(lines.flat());
  const n = countMarked(marks) - 1, r = reward(data.rewards, n === CELLS - 1 ? 12 : lines.length);
  g.fillStyle = C.blue; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(255,255,255,.07)'; for (let y = 12; y < H; y += 28) for (let x = (y / 28) % 2 ? 26 : 12; x < W; x += 28) { g.beginPath(); g.arc(x, y, 3, 0, 7); g.fill(); }
  g.textBaseline = 'alphabetic';
  g.font = '92px "Bagel Fat One"'; g.fillStyle = C.pink; g.fillText('Dating App Bingo', 64, 150); g.fillStyle = C.paper; g.fillText('Dating App Bingo', 58, 144);
  const top = 190, x0 = 60, cw = 192, ch = 170, hd = 96, cardW = cw * 5, cardH = hd + ch * 5;
  g.fillStyle = C.ink; g.beginPath(); g.roundRect(x0 + 12, top + 12, cardW, cardH, 28); g.fill();
  g.fillStyle = C.paper; g.beginPath(); g.roundRect(x0, top, cardW, cardH, 28); g.fill();
  g.save(); g.beginPath(); g.roundRect(x0, top, cardW, cardH, 28); g.clip();
  g.fillStyle = '#d4145a'; g.fillRect(x0, top, cardW, hd);
  g.font = '64px "Bagel Fat One"'; g.fillStyle = C.paper; g.textAlign = 'center';
  'SWIPE'.split('').forEach((l, i) => g.fillText(l, x0 + cw * i + cw / 2, top + 72));
  for (let p = 0; p < CELLS; p++) {
    const cx = x0 + (p % 5) * cw, cy = top + hd + Math.floor(p / 5) * ch;
    if (win.has(p)) { g.fillStyle = C.yellow; g.fillRect(cx, cy, cw, ch); }
    if (isMarked(marks, p)) {
      const h = (seed ^ (p * 2654435761)) >>> 0;
      g.fillStyle = 'rgba(255,61,127,.55)'; g.beginPath(); g.arc(cx + cw / 2 + (((h >>> 8) % 9) - 4) * 1.6, cy + ch / 2 + (((h >>> 16) % 9) - 4) * 1.4, 70, 0, 7); g.fill();
    }
    g.fillStyle = C.ink; g.font = p === FREE ? '600 24px Figtree' : '600 25px Figtree';
    const t = textAt(order, p), ls = wrap(g, t, cw - 26).slice(0, 4), lh = 30;
    const startY = cy + ch / 2 - ((ls.length - 1) * lh) / 2 + 9 + (p === FREE ? 14 : 0);
    if (p === FREE) { g.font = '34px "Bagel Fat One"'; g.fillText('FREE', cx + cw / 2, startY - lh - 4); g.font = '600 24px Figtree'; }
    ls.forEach((l, i) => g.fillText(l, cx + cw / 2, startY + i * lh));
  }
  g.restore();
  g.strokeStyle = C.ink; g.lineWidth = 3;
  for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(x0 + cw * i, top + hd); g.lineTo(x0 + cw * i, top + cardH); g.stroke(); }
  for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(x0, top + hd + ch * i); g.lineTo(x0 + cardW, top + hd + ch * i); g.stroke(); }
  g.lineWidth = 6; g.beginPath(); g.roundRect(x0, top, cardW, cardH, 28); g.stroke();
  g.textAlign = 'left'; const by = top + cardH + 78;
  if (r) {
    g.font = '52px "Bagel Fat One"'; g.fillStyle = C.yellow; g.fillText(`BINGO! ${r.title}`, 60, by);
    g.font = '500 30px Figtree'; g.fillStyle = C.paper; wrap(g, r.prize, 960).slice(0, 2).forEach((l, i) => g.fillText(l, 60, by + 46 + i * 38));
  } else {
    g.font = '44px "Bagel Fat One"'; g.fillStyle = C.paper; g.fillText(`${n} of 24 marked`, 60, by);
    g.font = '500 30px Figtree'; const c = closest(marks); g.fillText(`${c.need} more in the ${lineName(c.line)} for bingo.`, 60, by + 46);
  }
  g.font = '500 24px Figtree'; g.fillStyle = 'rgba(255,246,230,.85)';
  g.fillText(`Joke game, generic tropes, no real people. ${location.host}${location.pathname}#${encode(seed, marks)}`, 60, H - 40);
  return new Promise((res) => cv.toBlob(res, 'image/png'));
}
$('#save').addEventListener('click', async () => {
  const blob = await drawCard(); const file = new File([blob], 'dating-app-bingo.png', { type: 'image/png' });
  if (matchMedia('(pointer: coarse)').matches && navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'Dating App Bingo' }); return; } catch (e) { if (e.name === 'AbortError') return; }
  }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = file.name; document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000); say('Card image saved.');
});

load();

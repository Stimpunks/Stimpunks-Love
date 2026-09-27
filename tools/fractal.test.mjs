/* The fractal window never flashes, counted rather than argued.

   fractal.js promises that no part of the window changes brightness fast
   enough to flash, at any speed, in any room, and it keeps the promise with a
   per-pixel limit on how fast luminance and red may change. This file does not
   trust that limit. It plays every room's recipe at the quickest speed, takes
   the bytes the window would paint, and counts flashes in them with its OWN
   arithmetic -- WCAG's linearisation constant rather than fractal.js's, its
   own luminance, its own transition finder -- so a mistake in the limit and a
   mistake in the check cannot be the same mistake (the Playhouse's sed lesson:
   a verification that shares an assumption with the fix is not one).

   WCAG 2.3.1: no more than three flashes in any one second, where a flash is a
   pair of opposing changes in relative luminance of 0.1 or more (the general
   flash), or of 20 or more in (R - G - B) x 320 (the red flash). This counts
   stricter than WCAG in two ways and says so: it counts every pixel on its own,
   so area never excuses anything, and it ignores the "darker state below 0.80"
   and "saturated red" conditions, so a change counts wherever it happens.

   AND IT WAS BROKEN ON PURPOSE FIRST. The strobe test below feeds the window a
   picture that swaps between ground and white on every frame; with the limit
   on it must pass, and with the limit off it must fail. If the counter ever
   stops failing the unlimited strobe, it has stopped counting.

   Run by tools/check-all.sh, first, with the CB test: it needs nothing but Node.
*/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const FX = require('../fractal.js');
const ROOT = new URL('..', import.meta.url);

const css = readFileSync(new URL('love.css', ROOT), 'utf8');
const vars = {};
for (const m of css.matchAll(/(--[\w-]+)\s*:\s*(#[0-9A-Fa-f]{3,6})\b/g)) if (!(m[1] in vars)) vars[m[1]] = m[2];
const rooms = JSON.parse(readFileSync(new URL('data/fractals.json', ROOT), 'utf8')).rooms;

/* WCAG's own sRGB linearisation, with its own constant. */
const wlin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };

/* Transitions for one channel of one pixel: a swing of at least `step` from
   the last extreme, in the opposite direction to the swing before it. */
class Track {
  constructor(step) { this.step = step; this.lo = null; this.hi = null; this.dir = 0; this.ref = 0; this.at = []; }
  feed(v, t) {
    if (this.dir === 0) {
      if (this.lo === null) { this.lo = this.hi = v; return; }
      this.lo = Math.min(this.lo, v); this.hi = Math.max(this.hi, v);
      if (this.hi - this.lo >= this.step) { this.dir = v === this.hi ? 1 : -1; this.ref = v; this.at.push(t); }
      return;
    }
    if (this.dir === 1) {
      if (v > this.ref) this.ref = v;
      else if (this.ref - v >= this.step) { this.dir = -1; this.ref = v; this.at.push(t); }
    } else {
      if (v < this.ref) this.ref = v;
      else if (v - this.ref >= this.step) { this.dir = 1; this.ref = v; this.at.push(t); }
    }
  }
  /* The most transitions inside any one second. */
  worst() {
    let best = 0;
    for (let i = 0, j = 0; i < this.at.length; i++) {
      while (this.at[i] - this.at[j] >= 1) j++;
      best = Math.max(best, i - j + 1);
    }
    return best;
  }
}

/* Plays a picture for `secs` of wall time at `fps` and returns the worst
   number of transitions any pixel made in any one second, general and red. */
function play(pic, speed, secs, fps, t0 = 0) {
  const n = pic.W * pic.H, L = [], E = [];
  for (let k = 0; k < n; k++) { L.push(new Track(0.1)); E.push(new Track(20)); }
  let t = t0;
  for (let f = 0; f <= secs * fps; f++) {
    const dt = f ? 1 / fps : 0, now = f / fps;
    t += dt * speed;
    pic.frame(t, dt, pic.limit);
    const B = pic.bytes;
    for (let k = 0; k < n; k++) {
      const r = wlin(B[k * 4]), g = wlin(B[k * 4 + 1]), b = wlin(B[k * 4 + 2]);
      L[k].feed(0.2126 * r + 0.7152 * g + 0.0722 * b, now);
      E[k].feed(Math.max(0, r - g - b) * 320, now);
    }
  }
  let general = 0, red = 0;
  for (let k = 0; k < n; k++) { general = Math.max(general, L[k].worst()); red = Math.max(red, E[k].worst()); }
  return { general, red };
}

const QUICK = 2.2;          // fractal.js's quickest speed; kept in step by the test below
const ALLOWED = 6;          // three flashes a second is six transitions

test('the quickest speed here is the quickest speed in the window', () => {
  const src = readFileSync(new URL('fractal.js', ROOT), 'utf8');
  const m = src.match(/quick:\s*([\d.]+)/);
  assert.ok(m, 'fractal.js has no quick speed for this test to match');
  assert.equal(Number(m[1]), QUICK, 'fractal.js changed its quickest speed; change QUICK here to match');
});

test('the counter catches a strobe when the limit is off', () => {
  let frame = 0;
  FX.ENGINES.__strobe = (out, glow) => { frame++; out.fill(frame % 2 ? -1 : 0); glow.fill(1); };
  const pic = new FX.Picture({ kind: '__strobe' }, [0, 0, 0], [[255, 0, 0], [255, 255, 255]], 8, 4);
  pic.limit = false;
  const got = play(pic, 1, 3, 30);
  assert.ok(got.general > ALLOWED, `an unlimited strobe counted only ${got.general} transitions in a second`);
  assert.ok(got.red > ALLOWED, `an unlimited red strobe counted only ${got.red} red transitions in a second`);
});

test('the limit holds a strobe under the line', () => {
  let frame = 0;
  FX.ENGINES.__strobe = (out, glow) => { frame++; out.fill(frame % 2 ? -1 : 0); glow.fill(1); };
  for (const fps of [30, 60, 144]) {
    const pic = new FX.Picture({ kind: '__strobe' }, [0, 0, 0], [[255, 0, 0], [255, 255, 255]], 8, 4);
    const got = play(pic, 1, 4, fps);
    assert.ok(got.general <= ALLOWED && got.red <= ALLOWED,
      `at ${fps} frames a second the limited strobe made ${got.general} general and ${got.red} red transitions in a second`);
  }
});

for (const [page, r] of Object.entries(rooms)) {
  if (r.off) continue;
  test(`${page} never flashes at the quickest speed`, () => {
    const ground = FX.hex(vars[r.ground]), inks = r.inks.map((v) => FX.hex(vars[v]));
    assert.ok(ground && inks.every(Boolean), `${page} names a colour love.css does not declare as a hex`);
    for (const t0 of [0, 77]) {
      const pic = new FX.Picture(r, ground, inks, 48, 27);
      const got = play(pic, QUICK, 8, 30, t0);
      assert.ok(got.general <= ALLOWED && got.red <= ALLOWED,
        `${page} from t=${t0}: ${got.general} general and ${got.red} red transitions in one second`);
    }
  });
}

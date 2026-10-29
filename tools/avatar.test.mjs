/* Every avatar choice is drawn, in every pose, and the page's checker and the
   server's agree about what a look may hold.

   Run it with:  node --test tools/avatar.test.mjs

   WHY IT EXISTS. avatar.js draws a bodymind and everything put on it from a
   list of keys that tools/make-bodymind.py writes out of data/bodymind.json
   and data/dressup.json. A garment hung on the Dress-Up Den's rails, or a
   choice added to the booth, that avatar.js cannot draw is not an error
   anywhere: it is a pick that changes nothing, which reads as broken, or a
   NaN in a path, which draws nothing at all. So every garment is put on a
   body on its feet, in a wheelchair and in a power chair, and must change the
   picture; every choice in every group must change it too; and no picture may
   carry NaN or undefined. It also races the two checkers -- clean() in
   avatar.js and cleanLook() in netlify/cb/lib.mjs -- over looks made at
   random, good and bad, because a look the page keeps and the server refuses,
   or the other way round, is a Keep button that lies. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { cleanLook } from '../netlify/cb/lib.mjs';

const here = new URL('..', import.meta.url).pathname;
const ctx = { console, btoa, atob };
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(here + 'avatar.js', 'utf8'), ctx);
const A = ctx.loveAvatar;
const D = A.data;
const plain = (x) => JSON.parse(JSON.stringify(x));

// A plain bodymind to vary one thing at a time. The first choice of every
// group: a fixture for a test, not a body the booth starts from.
const body = {};
for (const g of D.body.groups) body[g.key] = g.multi ? [] : g.options[0][0];
// A chimera onesie needs the chimera it is made after; every other piece needs none.
const OTTER = Object.fromEntries(D.chimera.slots.map((k) => [k, k === 'back' ? 'none' : 'otter']));
const look = (over = {}, wear = {}, chimera) => ({ base: 'bodymind', body: { ...body, ...over }, wear,
  ...(chimera || (wear.suit && wear.suit[0] === 'chimera-onesie') ? { chimera: chimera || OTTER } : {}) });
// Each picture has its own prefix on its patterns; take it out to compare two.
const norm = (svg) => svg.replace(/lav\d+/g, 'lav');
// A choice that only shows when another is made: hair colour on no hair.
const NEEDS = { hairColour: { hair: 'short' } };
const POSES = D.body.groups.find((g) => g.key === 'pose').options.map((o) => o[0]);

function drawn(lk) {
  const s = A.svg(lk);
  assert.ok(s, 'drew nothing for ' + JSON.stringify(lk));
  assert.doesNotMatch(s, /NaN|undefined|Infinity/, 'a broken number in ' + JSON.stringify(lk));
  return s;
}

test('every garment on the rails is drawn on a body in every pose, and on the stand', () => {
  for (const [slot, garments] of Object.entries(D.garments)) {
    for (const g of garments) {
      assert.ok(A._bodyWear.includes(g), `${g} is on the Den's rails and avatar.js cannot put it on a body`);
      // Fantasy Fancy Dress's pieces need a body: no cut, and refused on the stand.
      const bodyOnly = (D.bodyOnly || []).includes(slot);
      if (bodyOnly) {
        const onStand = { base: 'stand', wear: { [slot]: [g, 'solid', 'black'] } };
        assert.equal(A.clean(onStand), null, `${g} is let onto the stand by avatar.js`);
        assert.equal(cleanLook(onStand), null, `${g} is let onto the stand by the server`);
      } else assert.ok(D.stand.cuts[g], `${g} has no cut on the stand`);
      for (const pose of POSES) {
        const without = norm(drawn(look({ pose })));
        const withIt = norm(drawn(look({ pose }, { [slot]: [g, 'solid', 'black'] })));
        assert.notEqual(withIt, without, `${g} changes nothing ${pose}`);
      }
      if (!bodyOnly) drawn({ base: 'stand', wear: { [slot]: [g, 'stripes', 'rainbow'] } });
    }
  }
});

test('a chimera onesie draws every animal on the shelf in every part, in every pose', () => {
  const animals = Object.keys(D.chimera.animals);
  const backs = animals.filter((a) => D.chimera.animals[a].back);
  const K = D.chimera.animals;
  // Each part is held against an animal that has none of it, so a kind of
  // ears, tail or marking that draws nothing is caught: a raven has no ears
  // and no markings, a bat no tail.
  const MARKS = ['belly', 'tux', 'disc', 'chest', 'stripes', 'chevrons', 'bands', 'folds', 'coils', 'spots', 'patches',
    'blotches', 'darkPaws', 'darkLimbs'];
  const none = { ears: 'raven', tail: 'bat', markings: 'raven' };
  for (const pose of POSES) {
    const onesie = (parts) => norm(drawn(look({ pose }, { suit: ['chimera-onesie', 'solid', 'black'] }, { ...OTTER, ...parts })));
    const base = { ears: onesie(none), tail: onesie(none), markings: onesie(none) };
    const otter = onesie({});
    for (const an of animals) {
      const a = K[an];
      if (an !== 'otter') assert.notEqual(onesie({ colours: an }), otter, `${an}'s colours draw an otter's ${pose}`);
      if (a.ears !== 'none') assert.notEqual(onesie({ ...none, ears: an }), base.ears, `${an}'s ears (${a.ears}) draw nothing ${pose}`);
      if (a.tail) assert.notEqual(onesie({ ...none, tail: an }), base.tail, `${an}'s tail (${a.tail.kind}) draws nothing ${pose}`);
      if (a.marks.some((m) => MARKS.includes(m))) assert.notEqual(onesie({ ...none, markings: an }), base.markings, `${an}'s markings draw nothing ${pose}`);
      for (const part of ['colours', 'ears', 'tail', 'markings']) {
        const lk = look({ pose }, { suit: ['chimera-onesie', 'solid', 'black'] }, { ...OTTER, [part]: an });
        assert.ok(A.wearWords(lk).includes(a.word), `${an}'s ${part} is not in the onesie's words`);
      }
    }
    for (const an of backs) {
      const without = norm(drawn(look({ pose }, { suit: ['chimera-onesie', 'solid', 'black'] })));
      const withIt = norm(drawn(look({ pose }, { suit: ['chimera-onesie', 'solid', 'black'] }, { ...OTTER, back: an })));
      assert.notEqual(withIt, without, `${an}'s back changes nothing on a chimera onesie ${pose}`);
    }
  }
  // Without its chimera it is nothing, on the page or on the server.
  const bare = { base: 'bodymind', body, wear: { suit: ['chimera-onesie', 'solid', 'black'] } };
  assert.equal(A.clean(bare), null);
  assert.equal(cleanLook(bare), null);
  // A chimera on anything else is dropped by both.
  const stray = { base: 'bodymind', body, wear: { suit: ['onesie', 'solid', 'black'] }, chimera: OTTER };
  assert.deepEqual(plain(A.clean(stray)), cleanLook(stray));
  assert.equal(A.clean(stray).chimera, undefined);
  // And an address from Chimera Obscura reads the way chimera.js reads it.
  assert.deepEqual(plain(A.chimera.uncode('otter.otter.raccoon.otter.raccoon.none.otter.raccoon')),
    { ...OTTER, ears: 'raccoon', tail: 'raccoon', markings: 'raccoon' });
});

test('every choice in every group changes the picture, in every pose', () => {
  const standingOnly = D.body.standingOnly;
  for (const g of D.body.groups) {
    for (const pose of POSES) {
      const seen = new Map();
      for (const [k] of g.options) {
        if (pose !== 'standing' && (standingOnly[g.key] || []).includes(k)) continue;
        if (g.key === 'pose' && k !== pose) continue;
        const lk = look({ pose, ...(NEEDS[g.key] || {}), [g.key]: g.multi ? [k] : k });
        const s = norm(drawn(lk));
        if (g.key === 'pose') continue;
        for (const [other, t] of seen) assert.notEqual(s, t, `${g.key}: ${k} and ${other} draw the same ${pose}`);
        seen.set(k, s);
      }
    }
  }
});

test('every print and colourway is drawn', () => {
  for (const p of Object.keys(D.prints)) for (const c of Object.keys(D.colourways)) drawn(look({}, { top: ['tee', p, c] }));
});

test('the page and the server agree about what a look may hold', () => {
  let seed = 7;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  for (let i = 0; i < 4000; i++) {
    const lk = plain(A.random(rnd));
    for (const g of D.body.groups) {
      const keys = g.options.map((o) => o[0]);
      if (g.multi) lk.body[g.key] = keys.filter(() => rnd() < .3);
      else if (rnd() < .5) lk.body[g.key] = pick(keys);
    }
    for (const slot of D.slots) if (rnd() < .5) lk.wear[slot] = [pick(D.garments[slot]), pick(Object.keys(D.prints)), pick(Object.keys(D.colourways))];
    if (lk.wear.suit && lk.wear.suit[0] === 'chimera-onesie' || rnd() < .05) {
      const animals = Object.keys(D.chimera.animals);
      lk.chimera = Object.fromEntries(D.chimera.slots.map((k) => [k, k === 'back' ? (rnd() < .5 ? 'none' : pick(animals)) : pick(animals)]));
      const w = rnd();
      if (w < .05) lk.chimera.ears = 'griffin';
      else if (w < .08) lk.chimera.wings = 'bat';
      else if (w < .12) { delete lk.chimera.arms; delete lk.chimera.feet; }
      else if (w < .14) lk.chimera = 'otter';
    }
    if (rnd() < .2) lk.base = 'stand';
    // And some that are wrong.
    const r = rnd();
    if (r < .05) lk.body.skin = 'peach';
    else if (r < .1) lk.wear.head = ['haori', 'solid', 'black'];
    else if (r < .13) lk.wear = JSON.parse('{"__proto__":["a","b","c"]}');
    else if (r < .16) lk.wear.top = ['tee', 'constructor', 'black'];
    else if (r < .19) lk.body.marks = ['freckles', 'tattoo'];
    else if (r < .22) lk.base = 'doll';
    else if (r < .25) lk.wear.cape = ['cape', 'solid', 'black'];
    const page = A.clean(lk), server = cleanLook(lk);
    assert.deepEqual(plain(page), server, 'disagree about ' + JSON.stringify(lk));
    if (page) {
      drawn(page);
      assert.deepEqual(plain(A.uncode(A.code(page))), plain(page), 'a look does not survive the address');
    }
  }
});

test('a cane, crutches or a walker are refused in a chair, by both checkers', () => {
  for (const pose of POSES.filter((p) => p !== 'standing')) {
    for (const h of D.body.standingOnly.hands) {
      const lk = look({ pose, hands: h });
      assert.equal(A.clean(lk), null);
      assert.equal(cleanLook(lk), null);
    }
  }
});

test('the drawing says nothing: no text, no title, aria-hidden', () => {
  const s = drawn(look({}, { head: ['wig', 'solid', 'black'] }));
  assert.match(s, /aria-hidden="true"/);
  assert.doesNotMatch(s, /<text|<title|<desc/);
});

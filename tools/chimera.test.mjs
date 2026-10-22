/* Every chimera the shelf can make, drawn, and the checker holding.

   WHY IT EXISTS. chimera.js fits every part to whatever body it lands on, so an
   animal added to data/chimera-obscura.json whose ears, tail or markings cannot
   be fitted to some other animal's body is not an error anywhere: it is a
   drawing with NaN in it, or a clip pointing at nothing, on a table somebody is
   looking at. tools/make-chimera-obscura.py checks the data's shape; this draws
   it. Every pair of animals, with every part from either of the two, and then
   random chimeras out of the whole shelf.

   It also holds clean(): what a chimera may hold is exactly its parts, each an
   animal on the shelf, and nothing else, because a chimera travels in an
   address and to the server, and the page's checker and the server's
   (cleanChimera in netlify/cb/lib.mjs) have to agree about every one.

   Node and nothing else: node --test tools/chimera.test.mjs */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { cleanChimera, CHIMERA } from '../netlify/cb/lib.mjs';

const here = new URL('..', import.meta.url).pathname;
const ctx = {};
ctx.globalThis = ctx;
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(here + 'chimera.js', 'utf8'), ctx);
const C = ctx.loveChimera;
const SLOTS = Array.from(C.slots, (s) => s.key);  // an array of this realm, not the vm's
const DEFAULTS = Object.fromEntries(Array.from(C.slots, (s) => [s.key, s.defaults_to]).filter((e) => e[1]));

function drawnWell(c, where) {
  const s = C.svg(c, { prefix: 'tst' });
  assert.ok(s.startsWith('<svg') && s.endsWith('</svg>'), `${where}: no drawing came back`);
  assert.ok(!/NaN|undefined|Infinity/.test(s), `${where}: the drawing has NaN, undefined or Infinity in it`);
  const ids = [...s.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length, `${where}: two things in one drawing share an id`);
  for (const id of ids) assert.ok(id.startsWith('tst-'), `${where}: an id without the drawing's prefix: ${id}`);
  for (const m of s.matchAll(/url\(#([^)]+)\)/g)) assert.ok(ids.includes(m[1]), `${where}: a clip pointing at nothing: ${m[1]}`);
  assert.ok(C.words(c).length > 10, `${where}: no words for it`);
  const name = C.suggest(c);
  assert.ok(name && name.length <= 24, `${where}: its suggested name is missing or too long: ${name}`);
}

test('the shelf has animals and parts', () => {
  assert.ok(C.animals.length >= 2, 'fewer than two animals on the shelf');
  assert.deepEqual(SLOTS, ['body', 'head', 'ears', 'mouth', 'arms', 'feet', 'tail', 'back', 'colours', 'markings']);
});

test('every pair of animals, with every part from either of the two', () => {
  // Parts that never shape each other travel in pairs, so the test stays
  // every pair of animals as the shelf grows: arms and feet are each fitted
  // to the body and to nothing else, a mouth and the ears each hang off the
  // head and never touch, and colours change no shape at all, only what it
  // is filled with, so they come with the markings. The random chimeras
  // below take every pair apart.
  const others = ['head', 'ears', 'arms', 'tail', 'markings'];
  const partner = { ears: 'mouth', arms: 'feet', markings: 'colours' };
  let drawn = 0;
  for (const a of C.animals) for (const b of C.animals) {
    if (a === b) continue;
    const backs = ['none', ...[a, b].filter((x) => C.hasBack(x))];
    for (let mask = 0; mask < (1 << others.length); mask++) {
      for (const back of backs) {
        const c = { body: a, back };
        others.forEach((k, i) => { c[k] = (mask >> i) & 1 ? b : a; if (partner[k]) c[partner[k]] = c[k]; });
        drawnWell(c, `${a} with ${b} (${mask}, ${back})`);
        drawn++;
      }
    }
  }
  assert.ok(drawn > 0);
});

test('random chimeras out of the whole shelf', () => {
  let seed = 7;
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const backs = ['none', ...C.animals.filter((x) => C.hasBack(x))];
  for (let i = 0; i < 4000; i++) {
    const c = {};
    for (const k of SLOTS) c[k] = k === 'back' ? pick(backs) : pick(C.animals);
    drawnWell(c, `random ${i}`);
  }
});

test('every starting chimera is on the shelf, and the room opens on one', () => {
  assert.ok(C.presets.length > 0);
  for (const p of C.presets) assert.ok(C.clean(p.parts), `the starting chimera ${p.id} uses a part the shelf does not have`);
  assert.ok(C.presets.some((p) => p.id === C.opensOn), 'the room opens on a chimera that is not one of the starting ones');
});

test('clean() takes exactly a chimera and nothing else', () => {
  const good = Object.fromEntries(SLOTS.map((k) => [k, k === 'back' ? 'none' : C.animals[0]]));
  assert.ok(C.clean(good));
  assert.equal(C.clean(null), null);
  assert.equal(C.clean([]), null);
  assert.equal(C.clean('bear'), null);
  assert.equal(C.clean({ ...good, extra: 'x' }), null, 'a key that is not a part');
  for (const k of SLOTS) {
    const less = { ...good }; delete less[k];
    if (DEFAULTS[k]) assert.deepEqual({ ...C.clean(less) }, good, `a chimera with no ${k} takes the ${DEFAULTS[k]}'s`);
    else assert.equal(C.clean(less), null, `a chimera with no ${k}`);
    assert.equal(C.clean({ ...good, [k]: 'unicorn' }), null, `a ${k} from an animal not on the shelf`);
    assert.equal(C.clean({ ...good, [k]: 7 }), null, `a ${k} that is not a word`);
  }
  const noBack = C.animals.find((x) => !C.hasBack(x));
  if (noBack) assert.equal(C.clean({ ...good, back: noBack }), null, 'a back from an animal that has none');
  assert.equal(C.clean({ ...good, body: 'none' }), null, 'none is only ever a back');
  assert.equal(C.clean(JSON.parse('{"__proto__": {"body": "bear"}}')), null);
  assert.equal(C.clean({ ...good, constructor: 'bear' }), null);
  const inherits = Object.create(good);
  assert.equal(C.clean(inherits), null, 'parts that are inherited rather than its own');
});

test('a chimera goes into an address and comes back the same', () => {
  for (const p of C.presets) {
    const code = C.code(p.parts);
    assert.match(code, /^[a-z.]+$/);
    assert.deepEqual({ ...C.uncode(code) }, { ...C.clean(p.parts) });
  }
  // Kept and linked before arms and feet were parts of their own: every part
  // but those, in the same order, and they take the body's.
  const old = { body: 'otter', head: 'raccoon', ears: 'raccoon', mouth: 'otter', tail: 'raccoon', back: 'none', colours: 'raccoon', markings: 'raccoon' };
  const now = C.clean(old);
  assert.ok(now, 'a chimera kept before arms and feet were parts no longer opens');
  assert.equal(now.arms, 'otter'); assert.equal(now.feet, 'otter');
  assert.deepEqual({ ...cleanChimera(old) }, { ...now }, 'the CB opens an older chimera differently');
  const oldCode = 'otter.raccoon.raccoon.otter.raccoon.none.raccoon.raccoon';
  assert.deepEqual({ ...C.uncode(oldCode) }, { ...now }, 'an older address no longer opens the same chimera');
  assert.equal(C.code(now), oldCode, `a chimera with its body's arms and feet has a different address from before`);
  const webbed = { ...now, feet: 'raccoon' };
  assert.equal(C.code(webbed).split('.').length, SLOTS.length, 'arms or feet off the body need every part in the address');
  assert.deepEqual({ ...C.uncode(C.code(webbed)) }, webbed);
  assert.equal(C.uncode(''), null);
  assert.equal(C.uncode('bear.bear'), null);
  assert.equal(C.uncode('<script>'), null);
  assert.equal(C.uncode(SLOTS.map(() => 'unicorn').join('.')), null);
});

test('the page and the CB agree about what a chimera may hold', () => {
  assert.deepEqual([...CHIMERA.slots], SLOTS, 'lib.mjs has different parts from chimera.js');
  assert.deepEqual([...CHIMERA.animals].sort(), Array.from(C.animals).sort(), 'lib.mjs has a different shelf');
  let seed = 11;
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const words = [...C.animals, 'none', 'unicorn', '', '__proto__', 'constructor', 7, null];
  for (let i = 0; i < 4000; i++) {
    const c = {};
    for (const k of SLOTS) if (rnd() > 0.04) c[k] = rnd() < 0.85 ? (k === 'back' ? pick(['none', ...C.animals]) : pick(C.animals)) : pick(words);
    if (rnd() < 0.05) c[pick(['extra', '__proto__', 'constructor', 'name'])] = pick(C.animals);
    const page = C.clean(c), server = cleanChimera(c);
    assert.equal(!!page, !!server, `the page and the CB disagree about ${JSON.stringify(c)}`);
    if (page) assert.deepEqual({ ...page }, server);
  }
});

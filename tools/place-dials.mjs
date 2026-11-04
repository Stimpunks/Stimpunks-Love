#!/usr/bin/env node
// Where each room's dial stands, measured rather than guessed.
//
// tools/make-dials.py stands the dial in a dock that floats at the right on a
// wide screen. Where it stands decides whether the room's words run beside it
// or it leaves a tall empty band (Ryan, 2026-11-04: "The glitter dial pushes
// things down pretty far and creates a chunk of vertical whitespace"). So this
// renders every page whose dial make-dials places, at 1280px, and tries the
// dock at each place it could stand, and keeps the one that costs least: empty
// space beside it, distance down the page, and never anything with a ground
// running under it. It
// writes data/dials.json, which make-dials reads; a page it never measured
// gets the dock straight after its header.
//
// A place is a SLOT, counted the same way here and in make-dials.py: walking
// <main>'s top-level nodes, each element not inside a generator's
// name:begin/name:end markers, and each begin marker, is a slot, and a run of
// plain comments just before one belongs to it; straight after a top-level
// <section>, <div> or <article> slot come the slots inside it, counted the same
// way one level down. The dial's own markers are skipped. One more slot is the
// end of <main>.
//
// It needs Chrome and is not in check-all.sh: run it after adding a room or
// changing one's layout, then run check-all.
//   node tools/place-dials.mjs [page.html ...]
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'data', 'dials.json');
const W = 1280;
// What a place costs: every pixel left empty beside the dock, and DOWN of a
// pixel for every pixel it stands down the page, so a little empty space near
// the top beats none at the foot (Ryan: it should not end up at the end).
const DOWN = 0.2;
// The pages that are a stage first: their dial stands somewhere below the
// stage, so a visitor sent from a room's dial sees that room above the fold
// (Ryan, 2026-11-04).
const BELOW = { 'cel-street.html': '[data-cel-full]', 'paper-street.html': '[data-ps-full]' };
// The paperwork that is an app drawn by its script once you are signed on: the
// app comes first and the dial stands after it, at the end, because a dial
// above it would push the whole app down a screen.
const APPS = ['forum.html', 'tasks.html', 'office.html', 'profile.html', 'directory.html', 'you.html'];
for (const f of APPS) BELOW[f] = 'END';

const all = fs.readdirSync(ROOT).filter(f => f.endsWith('.html')).sort();
const placed = f => {
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  return s.includes('<!-- dial:begin -->') || s.includes('<div style="max-width:400px;margin-top:34px;">\n    <div class="dial">');
};
const pages = (process.argv.slice(2).length ? process.argv.slice(2) : all).filter(placed);

const probe = (below) => `(() => {
  const DOWN = ${DOWN};
  const main = document.querySelector('main'); const dial = main && main.querySelector('.dial');
  if (!dial) return { skip: 'no dial' };
  let dock = dial.closest('.dial-dock');
  if (dock) dock.className = 'dial-dock';
  if (!dock) {
    const foot = dial.parentElement;
    dock = document.createElement('div'); dock.className = 'dial-dock';
    foot.replaceWith(dock); dock.appendChild(dial);
  }
  const slots = window.__slots;
  // how the dial draws where it stands now, at the top level of the room: a
  // place where the room's own rules reach into it and change that is no place
  const look = () => [...dial.querySelectorAll('p, button')].map(e => { const cs = getComputedStyle(e); return [cs.color, cs.backgroundColor, cs.fontFamily, cs.fontSize, cs.textTransform].join('|'); }).join(';');
  main.appendChild(dock); const own = look();
  const after = (node) => { let x = node; while (x && x.nodeType !== 1) x = x.nextSibling; return x; };
  // the first slot allowed: after whatever holds the h1, or below the stage
  const pin = ${JSON.stringify(below)} === 'END' ? null : ${JSON.stringify(below)} ? main.querySelector(${JSON.stringify(below)}) : main.querySelector('h1');
  let first = ${JSON.stringify(below)} === 'END' ? slots.length : 0;
  if (pin) first = slots.findIndex(sl => { const el = after(sl) || sl; return (pin.compareDocumentPosition(sl) & 4) && !pin.contains(sl) && !el.contains(pin); });
  if (first < 0) first = slots.length;
  const ground = el => { const cs = getComputedStyle(el); return cs.backgroundColor !== 'rgba(0, 0, 0, 0)' || cs.backgroundImage !== 'none' || parseFloat(cs.borderTopWidth) > 0 || /^(IMG|SVG|CANVAS|IFRAME|VIDEO)$/i.test(el.tagName); };
  const score = () => {
    const r = dock.getBoundingClientRect(); if (getComputedStyle(dock).float === 'none') return null;
    // never inside a column too narrow for the dial and a column of words beside it
    if (dock.parentElement.getBoundingClientRect().width < 760) return null;
    const left = main.getBoundingClientRect().left;
    const rects = []; let over = 0;
    const tw = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
    for (let n; (n = tw.nextNode());) { if (!n.data.trim() || dock.contains(n)) continue; const rg = document.createRange(); rg.selectNodeContents(n); for (const b of rg.getClientRects()) rects.push(b); }
    for (const el of main.querySelectorAll('*')) {
      if (dock.contains(el) || el.contains(dock)) continue;
      const b = el.getBoundingClientRect(); if (!b.width || !b.height || !ground(el) || getComputedStyle(el).visibility === 'hidden') continue;
      rects.push(b);
      if (b.right > r.left + 1 && b.left < r.right - 1 && b.bottom > r.top + 1 && b.top < r.bottom - 1) over++;
    }
    let empty = 0;
    for (let y = r.top + 4; y < r.bottom; y += 8)
      if (!rects.some(b => b.top <= y && b.bottom >= y && b.left < r.left - 4 && b.right > left + 4)) empty += 8;
    return { empty, over, top: r.top + scrollY };
  };
  let best = null, firstEmpty = null;
  for (let i = first; i <= slots.length; i++) {
    if (i < slots.length && !slots[i].isConnected) continue;   // a script took it away
    if (i < slots.length) slots[i].parentNode.insertBefore(dock, slots[i]); else main.appendChild(dock);
    if (look() !== own) continue;   // the room's rules would restyle the dial here
    const s = score(); if (!s) continue;
    const cost = s.empty + (s.over ? 100000 : 0) + s.top * DOWN;
    const here = { slot: i, cost, empty: s.empty, over: s.over, top: Math.round(s.top) };
    if (i === first) firstEmpty = s.empty;
    if (!best || cost < best.cost) best = here;
  }
  if (!best) return { skip: 'nowhere it floats' };
  return { ...best, slots: slots.length, first, firstEmpty, height: document.documentElement.scrollHeight };
})()`;

const port = 13100 + Math.floor(Math.random() * 400);
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'place-dials-'));
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${port}`, `--user-data-dir=${prof}`, `--window-size=${W},1000`, 'about:blank']);
let list;
for (let t = 0; t < 40 && !list; t++) { await new Promise(r => setTimeout(r, 250)); try { list = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); } catch (e) {} }
const ws = new WebSocket(list.find(t => t.type === 'page').webSocketDebuggerUrl);
let id = 0; const wait = {};
ws.onmessage = e => { const m = JSON.parse(e.data); if (wait[m.id]) { wait[m.id](m); delete wait[m.id]; } };
await new Promise(r => ws.onopen = r);
const send = (method, params) => new Promise(r => { const i = ++id; wait[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
await send('Page.enable');
// The slots are counted when parsing ends and before any of the page's own
// scripts run, so what a script adds or takes away never shifts the count
// (make-dials.py reads the markup, which has none of it).
await send('Page.addScriptToEvaluateOnNewDocument', { source: String.raw`
document.addEventListener('readystatechange', () => {
  if (document.readyState !== 'interactive') return;
  const main = document.querySelector('main'); if (!main) return;
  const MARK = /^\s*([\w.-]+(?::[\w.-]+)*):(begin|end)\s*$/;
  const CONT = /^(SECTION|DIV|ARTICLE)$/;
  // the dial's own dock and the old foot box are what moves, so never a slot
  const own = n => n.classList.contains('dial-dock') || (n.getAttribute('style') === 'max-width:400px;margin-top:34px;' && n.querySelector(':scope > .dial'));
  const walk = (parent, out, deeper) => {
    let open = 0, run = null;
    for (const n of [...parent.childNodes]) {
      if (n.nodeType === 8) {
        const m = n.data.match(MARK);
        if (m && m[1] === 'dial') continue;
        if (m && m[2] === 'begin') { if (!open) out.push(run || n); run = null; open++; continue; }
        if (m && m[2] === 'end') { open = Math.max(0, open - 1); run = null; continue; }
        if (!open && !run) run = n; continue;
      }
      if (n.nodeType !== 1 || own(n)) continue;
      if (!open) { out.push(run || n); if (deeper && CONT.test(n.tagName)) walk(n, out, false); }
      run = null;
    }
  };
  window.__slots = []; walk(main, window.__slots, true);
});` });

const data = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf8')) : {};
data._what = 'Where each dial dock stands: a slot in <main>, counted as tools/make-dials.py counts them. Written by tools/place-dials.mjs, which measures every place and keeps the one with the room\'s words beside the dial. Do not hand-edit; run it again instead.';
data.at = data.at || {};
const report = [];
for (const f of pages) {
  await send('Page.navigate', { url: 'file://' + path.join(ROOT, f) });
  await new Promise(r => setTimeout(r, 900));
  const r = await send('Runtime.evaluate', { expression: probe(BELOW[f] || ''), returnByValue: true });
  const v = r.result.result && r.result.result.value;
  if (!v || v.skip || v.slot === undefined) { report.push(`${f}: ${v ? v.skip : 'no answer'}`); continue; }
  data.at[f] = v.slot;
  report.push(`${f}: slot ${v.slot} of ${v.slots} (from ${v.first}), ${v.empty}px empty (${v.firstEmpty} at the first), ${v.top}px down of ${v.height}${v.over ? ', OVERLAPS' : ''}`);
}
const sorted = Object.fromEntries(Object.keys(data.at).sort().map(k => [k, data.at[k]]));
fs.writeFileSync(OUT, JSON.stringify({ _what: data._what, at: sorted }, null, 1) + '\n');
ws.close(); chrome.kill();
await new Promise(r => setTimeout(r, 500));
try { fs.rmSync(prof, { recursive: true, force: true, maxRetries: 5 }); } catch (e) {}
console.log(report.join('\n'));

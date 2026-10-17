/* The CB radio's drawings, for the themes that have one (Ryan, 2026-10-17: "I
   want to use the CB as a way for folks to get a really personal and fun
   experience, with lots of theme options"). cb.js loads this only when a theme
   with a drawing is on, and asks it to draw into the radio's strips: the trim
   under the bar and the one at its foot, one down each side outside the box,
   and one along every divider between the radio's parts (Ryan, the same day).

   EVERY DRAWING IS ARIA-HIDDEN AND CARRIES NO WORD, and none stands behind a
   word: the trims and sides are outside the text, and a divider's strip sits on
   the groove between two parts, in the space round it. What a theme is after is
   said in words on the radio's own line when it is chosen (call.js's SCHEMES),
   and in the CB guide; the drawing is decoration on top of that.

   EVERY COLOUR IS A TOKEN, never a hex: the theme's own seven parts (--cb-case,
   --cb-steel-2 and the rest, which on this host are already that theme's) or
   its drawing inks, --cb-<theme>-<ink> in love.css §2, which check-contrast.py
   measures on the theme's case. Max Glitter draws in the street's own palette.

   NOTHING HERE MOVES ANYTHING. The drawing only carries class names and its own
   --d (how long before it starts) and --t (how long it takes); cb.css runs them
   only where the host says data-motion="on", which call.js decides: at MAX
   GLITTER, or after Let my theme move. Otherwise every drawing stands as it is
   when it has finished growing.

   EACH MOTIF IS ONE BAND, DRAWN AT WHATEVER HEIGHT ITS STRIP HAS, from a fixed
   seed, so a theme draws the same picture every time and drawing it again at a
   new width gives the same picture at that width. A side is the same band drawn
   long and turned to run down the side, its top edge outward on both sides. A
   side is drawn once, longer than the radio can be, and the radio shows as much
   of it as it is tall: so a radio growing when a message arrives never draws it
   again, and nothing restarts when somebody talks. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var SIDE = 18;                 // how wide a side strip is

  function seeded(s) {           // mulberry32, as the yurt's garden uses
    return function () {
      s |= 0; s = s + 0x6D2B79F5 | 0;
      var t = Math.imul(s ^ s >>> 15, 1 | s);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /* One element: attributes, then o.fill and o.stroke as token names, o.sw for
     the stroke's width, o.cls for a motion and o.d / o.t / o.run for its timing. */
  function add(parent, tag, at, o) {
    var e = document.createElementNS(NS, tag);
    var k;
    for (k in at) e.setAttribute(k, at[k]);
    o = o || {};
    e.style.setProperty('fill', o.fill ? 'var(' + o.fill + ')' : 'none');
    if (o.stroke) {
      e.style.setProperty('stroke', 'var(' + o.stroke + ')');
      e.style.setProperty('stroke-width', (o.sw || 1.5).toFixed(2));
      e.style.setProperty('stroke-linecap', 'round');
      e.style.setProperty('stroke-linejoin', 'round');
    }
    timing(e, o);
    parent.appendChild(e);
    return e;
  }
  function group(parent, at, o) {
    var g = document.createElementNS(NS, 'g');
    var k;
    for (k in (at || {})) g.setAttribute(k, at[k]);
    timing(g, o || {});
    parent.appendChild(g);
    return g;
  }
  function timing(e, o) {
    if (o.cls) e.setAttribute('class', o.cls);
    if (o.d != null) e.style.setProperty('--d', o.d.toFixed(2) + 's');
    if (o.t != null) e.style.setProperty('--t', o.t.toFixed(2) + 's');
    if (o.run != null) e.style.setProperty('--run', o.run + 'px');
  }

  /* A strip to draw one band into: kind is top, foot, divider, left or right.
     c.w is the band's length, c.h its height, c.s its scale against the trim's
     thirty pixels, and c.svg where to draw, already turned for a side. */
  function sideLength() { return Math.max(900, Math.ceil(window.innerHeight / 100) * 100); }
  function strip(box, kind) {
    box.textContent = '';
    var side = kind === 'left' || kind === 'right';
    var h = side ? SIDE : Math.max(10, Math.round(box.clientHeight || 30));
    var w = side ? sideLength() : Math.max(80, Math.round(box.clientWidth || 340));
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    if (side) {
      svg.setAttribute('viewBox', '0 0 ' + h + ' ' + w);
      svg.setAttribute('width', h);
      svg.setAttribute('height', w);
    } else {
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      svg.setAttribute('preserveAspectRatio', 'none');
    }
    box.appendChild(svg);
    var root = side ? group(svg, { transform: kind === 'left' ? 'matrix(0 1 1 0 0 0)' : 'matrix(0 1 -1 0 ' + h + ' 0)' }) : svg;
    return { w: w, h: h, s: h / 30, svg: root, kind: kind };
  }

  function f(n) { return n.toFixed(1); }
  function at(s, min) { return Math.max(s, min || 0); }
  // A four-pointed sparkle centred on x, y.
  function sparkle(x, y, r) {
    var q = r * 0.28;
    return 'M' + f(x) + ' ' + f(y - r) + 'Q' + f(x + q) + ' ' + f(y - q) + ' ' + f(x + r) + ' ' + f(y) +
      'Q' + f(x + q) + ' ' + f(y + q) + ' ' + f(x) + ' ' + f(y + r) + 'Q' + f(x - q) + ' ' + f(y + q) + ' ' +
      f(x - r) + ' ' + f(y) + 'Q' + f(x - q) + ' ' + f(y - q) + ' ' + f(x) + ' ' + f(y - r) + 'Z';
  }
  // A wavy line along the whole length.
  function wave(w, y, amp, len, phase) {
    var d = '', x;
    for (x = -10; x <= w + 10; x += 5) d += (d ? 'L' : 'M') + f(x) + ' ' + f(y + amp * Math.sin(x / len + phase));
    return d;
  }
  // How long a growing line takes: longer for a longer strip, within reason.
  function growFor(c) { return Math.min(14, Math.max(4, c.w / 45)); }

  /* Each theme is a band, drawn along any strip, and a foot if the foot has its
     own picture (foot: null for none, and absent to use the band). */
  var T = {};

  /* SOLARIZED: its eight accents in a stripe, as the palette lays them out,
     the eight again for every three hundred and sixty pixels of a long strip. */
  var SOL = ['yellow', 'orange', 'red', 'magenta', 'violet', 'blue', 'cyan', 'green'];
  function solBand(c) {
    var runs = Math.max(1, Math.round(c.w / 360)), n = runs * 8, gap = 4;
    var seg = (c.w - 16 - gap * (n - 1)) / n, th = at(6 * c.s, 3);
    for (var i = 0; i < n; i++) {
      add(c.svg, 'rect', { x: f(8 + i * (seg + gap)), y: f(c.h / 2 - th / 2), width: f(seg), height: f(th), rx: f(th / 2) },
        { fill: '--cb-sol-' + SOL[i % 8] });
    }
  }
  T.soldark = { band: solBand, foot: null };
  T.sollight = { band: solBand, foot: null };

  /* BIOPHILIC: ivy, growing in from one end, and mushrooms coming up out of
     lichen along the foot. After queering.earth and the garden that grows round
     Helen Edgar's Faery Yurt; drawn here, in queering.earth's inks. */
  T.biophilic = {
    band: function (c, r) {
      var s = c.s, y0 = c.h * 0.42, amp = 3.5 * s, per = 22 * at(s, 0.6), grow = growFor(c), i = 0, x;
      add(c.svg, 'path', { d: wave(c.w, y0, amp, per, 0.6), pathLength: 1 }, { stroke: '--cb-steel-2', sw: 1.6 * at(s, 0.6), cls: 'art-grow', t: grow });
      var leaves = ['--cb-steel-2', '--cb-biophilic-verdigris', '--cb-biophilic-lichen'];
      for (x = 8 * s; x < c.w - 4; x += (15 + r() * 9) * at(s, 0.55), i++) {
        var y = y0 + amp * Math.sin(x / per + 0.6), up = i % 2 ? 1 : -1;
        var g = group(c.svg, { transform: 'translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(up * (35 + r() * 30)) + ') scale(' + f((0.75 + r() * 0.45) * at(s, 0.5)) + ')' });
        add(g, 'path', { d: 'M0 0C-4-1-6-5-4-8C-3-9-1-9 0-7C1-9 3-9 4-8C6-5 4-1 0 0Z' },
          { fill: leaves[i % 3], cls: 'art-pop', d: 0.4 + (x / c.w) * grow * 0.9, t: 1.6 });
        if (r() < 0.22) add(c.svg, 'circle', { cx: f(x + 4 * s), cy: f(y + up * 5 * s), r: f(1.8 * at(s, 0.6)) },
          { fill: '--cb-biophilic-marigold', cls: 'art-pop', d: 1 + (x / c.w) * grow * 0.9 });
      }
    },
    foot: function (c, r) {
      var x;
      add(c.svg, 'path', { d: wave(c.w, 26, 1.6, 30, 0) + 'L' + (c.w + 10) + ' 32L-10 32Z' }, { fill: '--cb-biophilic-lichen' });
      for (x = 12 + r() * 20; x < c.w - 10; x += 34 + r() * 40) {
        var h = 7 + r() * 7, cw = 6 + r() * 5, cap = r() < 0.5 ? '--cb-biophilic-coral' : '--cb-biophilic-marigold';
        var m = group(c.svg, {}, { cls: 'art-rise', d: 1 + r() * 6, t: 2.6 });
        add(m, 'rect', { x: f(x - 1.6), y: f(26 - h), width: 3.2, height: f(h), rx: 1.4 }, { fill: '--cb-bar', stroke: '--cb-steel-2', sw: 0.8 });
        add(m, 'path', { d: 'M' + f(x - cw) + ' ' + f(26 - h + 1) + 'Q' + f(x) + ' ' + f(26 - h - cw * 1.1) + ' ' + f(x + cw) + ' ' + f(26 - h + 1) + 'Z' },
          { fill: cap, stroke: '--cb-steel-2', sw: 0.6 });
        add(m, 'circle', { cx: f(x - cw * 0.35), cy: f(26 - h - cw * 0.25), r: 0.9 }, { fill: '--cb-lcd' });
        add(m, 'circle', { cx: f(x + cw * 0.3), cy: f(26 - h - cw * 0.4), r: 0.8 }, { fill: '--cb-lcd' });
      }
      for (x = 6; x < c.w; x += 18 + r() * 26) {
        add(c.svg, 'path', { d: 'M' + f(x) + ' 27Q' + f(x - 2) + ' 21 ' + f(x - 4) + ' 18M' + f(x + 1) + ' 27Q' + f(x + 2) + ' 22 ' + f(x + 4) + ' 19' },
          { stroke: '--cb-steel-2', sw: 1, cls: 'art-sway', d: r() * 4, t: 5 + r() * 3 });
      }
    }
  };

  /* STAR STUFF: its night, stars in its own colours, and one ringed planet
     under the bar. */
  T.starstuff = {
    band: function (c, r) {
      var inks = ['--cb-steel', '--cb-amber', '--cb-starstuff-gold', '--cb-starstuff-pink', '--cb-starstuff-cyan', '--cb-starstuff-green'];
      var n = Math.round(c.w * c.h / 420), k;
      for (k = 0; k < n; k++) {
        var x = r() * c.w, y = 2 + r() * (c.h - 4), big = r() < 0.25;
        var o = { fill: inks[Math.floor(r() * inks.length)], cls: 'art-twinkle', d: r() * 5, t: 3 + r() * 3 };
        if (big) add(c.svg, 'path', { d: sparkle(x, y, (2.8 + r() * 1.6) * at(c.s, 0.6)) }, o);
        else add(c.svg, 'circle', { cx: f(x), cy: f(y), r: f(0.6 + r() * 0.8) }, o);
      }
      if (c.kind === 'top') {
        var px = c.w - 34;
        add(c.svg, 'circle', { cx: px, cy: 15, r: 7 }, { fill: '--cb-amber' });
        add(c.svg, 'ellipse', { cx: px, cy: 15, rx: 13, ry: 3.4, transform: 'rotate(-14 ' + px + ' 15)' }, { stroke: '--cb-starstuff-gold', sw: 1.4 });
      }
    }
  };

  /* LCARS: a row of pill segments in its colours, glowing in turn, slowly,
     like a panel at work. Down the sides they are LCARS' own columns. */
  T.lcars = {
    band: function (c, r) {
      var inks = ['--cb-amber', '--cb-lcars-peach', '--cb-steel-2', '--cb-amber-2', '--cb-lcars-gold', '--cb-lcars-red'];
      var ph = c.kind === 'foot' ? 8 : at(12 * c.s, 6), y = (c.h - ph) / 2, x = 6, i = 0;
      while (x < c.w - 14) {
        var w = Math.min(c.w - 6 - x, 16 + r() * 56);
        add(c.svg, 'rect', { x: f(x), y: f(y), width: f(w), height: f(ph), rx: f(ph / 2) },
          { fill: inks[Math.floor(r() * inks.length)], cls: 'art-glow', d: (i % 14) * 0.45, t: 5.5 });
        x += w + 5; i++;
      }
    }
  };

  /* MAX GLITTER: sparkles and confetti in every colour on the street. */
  T.glitter = {
    band: function (c, r) {
      var inks = ['--pink', '--orange', '--yellow', '--green', '--cyan', '--violet'];
      var n = Math.round(c.w * c.h / 270), k;
      for (k = 0; k < n; k++) {
        var x = r() * c.w, y = 2 + r() * (c.h - 4), ink = inks[Math.floor(r() * inks.length)];
        if (r() < 0.45) add(c.svg, 'path', { d: sparkle(x, y, (2.4 + r() * 3.6) * at(c.s, 0.55)) }, { fill: ink, cls: 'art-twinkle', d: r() * 4, t: 2.4 + r() * 2.4 });
        else add(c.svg, 'rect', { x: f(x), y: f(y), width: 3, height: 1.6, rx: 0.8, transform: 'rotate(' + f(r() * 180) + ' ' + f(x) + ' ' + f(y) + ')' },
          { fill: ink, cls: 'art-twinkle', d: r() * 4, t: 3 + r() * 3 });
      }
    }
  };

  /* SOLARPUNK: art nouveau's whiplash vine in copper with sunflowers on it,
     a solar panel at the end of the trim under the bar, and water along the
     foot. */
  T.solarpunk = {
    band: function (c, r) {
      var s = c.s, mid = c.h / 2, amp = 8 * s, x, vine = '', grow = growFor(c);
      function yAt(x) { return mid + amp * Math.sin(x / 38) * Math.cos(x / 97); }
      for (x = -10; x <= c.w + 10; x += 4) vine += (vine ? 'L' : 'M') + f(x) + ' ' + f(yAt(x));
      add(c.svg, 'path', { d: vine, pathLength: 1 }, { stroke: '--cb-solarpunk-copper', sw: 1.6 * at(s, 0.6), cls: 'art-grow', t: grow });
      var end = c.kind === 'top' ? c.w - 50 : c.w - 8;
      for (x = 10; x < end; x += (13 + r() * 8) * at(s, 0.6)) {
        var up = r() < 0.5 ? -1 : 1;
        var g = group(c.svg, { transform: 'translate(' + f(x) + ' ' + f(yAt(x)) + ') rotate(' + f(up * (50 + r() * 40)) + ') scale(' + f(at(s, 0.5)) + ')' });
        add(g, 'path', { d: 'M0 0Q3-3 0-9Q-3-3 0 0Z' }, { fill: '--cb-solarpunk-leaf', cls: 'art-pop', d: 0.5 + (x / c.w) * grow });
      }
      for (x = 40 + r() * 30; x < end - 10; x += 90 + r() * 50) {
        var sy = yAt(x), pr = 5.4 * at(s, 0.55), fl = group(c.svg, {}, { cls: 'art-turn', d: r() * 4, t: 9 + r() * 4 });
        for (var p = 0; p < 12; p++) {
          var a = p * Math.PI / 6, px = x + Math.cos(a) * pr, py = sy + Math.sin(a) * pr;
          add(fl, 'ellipse', { cx: f(px), cy: f(py), rx: f(pr * 0.6), ry: f(pr * 0.28), transform: 'rotate(' + f(p * 30) + ' ' + f(px) + ' ' + f(py) + ')' },
            { fill: '--cb-solarpunk-sunflower' });
        }
        add(fl, 'circle', { cx: f(x), cy: f(sy), r: f(pr * 0.66) }, { fill: '--cb-solarpunk-copper' });
      }
      if (c.kind === 'top') {
        var px0 = c.w - 40;
        add(c.svg, 'path', { d: 'M' + px0 + ' 22L' + (px0 + 30) + ' 22L' + (px0 + 26) + ' 6L' + (px0 + 4) + ' 6Z' }, { fill: '--cb-solarpunk-panel', stroke: '--cb-steel-2', sw: 0.8 });
        add(c.svg, 'path', { d: 'M' + (px0 + 2) + ' 14L' + (px0 + 28) + ' 14M' + (px0 + 11) + ' 6L' + (px0 + 10) + ' 22M' + (px0 + 19) + ' 6L' + (px0 + 20) + ' 22' }, { stroke: '--cb-lcd', sw: 0.7 });
      }
    },
    foot: function (c, r) {
      var x;
      add(c.svg, 'path', { d: wave(c.w, 22, 2.2, 14, 0) }, { stroke: '--cb-solarpunk-water', sw: 1.6 });
      add(c.svg, 'path', { d: wave(c.w, 26, 1.6, 11, 1.4) }, { stroke: '--cb-solarpunk-water', sw: 1.1 });
      for (x = 16 + r() * 20; x < c.w - 8; x += 30 + r() * 34) {
        var sp = group(c.svg, {}, { cls: 'art-sway', d: r() * 4, t: 6 + r() * 3 });
        add(sp, 'path', { d: 'M' + f(x) + ' 21Q' + f(x + 1) + ' 13 ' + f(x + 3) + ' 6' }, { stroke: '--cb-solarpunk-leaf', sw: 1.2 });
        add(sp, 'path', { d: 'M' + f(x + 1) + ' 14Q' + f(x + 6) + ' 11 ' + f(x + 8) + ' 13Q' + f(x + 5) + ' 15 ' + f(x + 1) + ' 14Z' }, { fill: '--cb-solarpunk-leaf' });
      }
    }
  };

  /* BIOMECHANICAL: a spine, bone grown round tube, breathing in a slow wave,
     and ribbed piping along the foot. After H. R. Giger's biomechanics; drawn
     here, and copied from nothing of his. */
  T.biomech = {
    band: function (c, r) {
      var s = c.s, mid = c.h / 2, step = 15 * at(s, 0.55), x, i = 0;
      add(c.svg, 'path', { d: 'M-10 ' + f(mid) + 'L' + (c.w + 10) + ' ' + f(mid) }, { stroke: '--cb-biomech-rib', sw: 9 * s });
      for (x = 6 * s; x < c.w; x += step, i++) {
        var v = group(c.svg, {}, { cls: 'art-breathe', d: (i % 24) * 0.22, t: 5.5 });
        add(v, 'path', { d: 'M' + f(x - 2 * s) + ' ' + f(mid - 9 * s) + 'Q' + f(x + 6 * s) + ' ' + f(mid - 12 * s) + ' ' + f(x + 9 * s) + ' ' + f(mid - 14 * s) +
          'M' + f(x - 2 * s) + ' ' + f(mid + 9 * s) + 'Q' + f(x + 6 * s) + ' ' + f(mid + 12 * s) + ' ' + f(x + 9 * s) + ' ' + f(mid + 14 * s) },
          { stroke: '--cb-biomech-bone', sw: 1.4 * at(s, 0.6) });
        add(v, 'ellipse', { cx: f(x), cy: f(mid), rx: f(4.6 * s), ry: f(8.4 * s) }, { fill: '--cb-biomech-bone', stroke: '--cb-biomech-rib', sw: at(s, 0.6) });
        add(v, 'path', { d: 'M' + f(x - 1.5 * s) + ' ' + f(mid - 6 * s) + 'Q' + f(x - 3 * s) + ' ' + f(mid) + ' ' + f(x - 1.5 * s) + ' ' + f(mid + 6 * s) },
          { stroke: '--cb-biomech-sheen', sw: at(s, 0.6) });
      }
    },
    foot: function (c) {
      var x, i;
      add(c.svg, 'path', { d: 'M-10 16C' + f(c.w * 0.3) + ' 6 ' + f(c.w * 0.6) + ' 26 ' + (c.w + 10) + ' 14' }, { stroke: '--cb-biomech-rib', sw: 7 });
      for (x = 4, i = 0; x < c.w; x += 7, i++) {
        var y = 16 + (x < c.w * 0.45 ? -6 * Math.sin(Math.PI * x / (c.w * 0.9)) : 6 * Math.sin(Math.PI * (x - c.w * 0.45) / (c.w * 1.1)));
        add(c.svg, 'rect', { x: f(x - 2), y: f(y - 6), width: 4, height: 12, rx: 2 },
          { fill: '--cb-biomech-bone', cls: 'art-breathe', d: (i % 40) * 0.12, t: 5.5 });
      }
    }
  };

  /* GREEBLE: a plate covered in small machined parts, vents, pipes, a hazard
     stripe and a few lamps that brighten and dim, slowly. */
  T.greeble = {
    band: function (c, r) {
      var s = c.s, top = 3 * s, h = c.h - 6 * s, x;
      add(c.svg, 'rect', { x: 0, y: f(top), width: c.w, height: f(h) }, { fill: '--cb-greeble-plate' });
      add(c.svg, 'path', { d: 'M0 ' + f(top + 0.5) + 'L' + c.w + ' ' + f(top + 0.5) }, { stroke: '--cb-greeble-light', sw: 1 });
      add(c.svg, 'path', { d: 'M0 ' + f(top + h - 0.5) + 'L' + c.w + ' ' + f(top + h - 0.5) }, { stroke: '--cb-greeble-shadow', sw: 1 });
      for (x = 4; x < c.w - 8;) {
        var kind = r(), w;
        if (kind < 0.45) {
          w = (6 + r() * 20) * at(s, 0.6);
          var gh = (5 + r() * 12) * s, y = top + 3 * s + r() * Math.max(0, h - 6 * s - gh);
          add(c.svg, 'rect', { x: f(x), y: f(y), width: f(w), height: f(gh) }, { fill: r() < 0.5 ? '--cb-greeble-light' : '--cb-case', stroke: '--cb-greeble-shadow', sw: 0.8 });
        } else if (kind < 0.65) {
          w = (10 + r() * 8) * at(s, 0.6);
          for (var v = 0; v < w; v += 3) add(c.svg, 'path', { d: 'M' + f(x + v) + ' ' + f(top + 6 * s) + 'L' + f(x + v) + ' ' + f(top + h - 6 * s) }, { stroke: '--cb-greeble-shadow', sw: 1.2 });
        } else if (kind < 0.8) {
          w = 18 + r() * 24;
          add(c.svg, 'path', { d: 'M' + f(x) + ' ' + f(top + h * (0.3 + r() * 0.4)) + 'l' + f(w) + ' 0' }, { stroke: '--cb-greeble-shadow', sw: 2.6 * at(s, 0.6) });
        } else if (kind < 0.88) {
          w = 18;
          var y0 = top + h - 6 * s, y1 = top + 6 * s, k = 4 * s;
          for (var q = 0; q < 18; q += 6) {
            add(c.svg, 'path', { d: 'M' + f(x + q) + ' ' + f(y0) + 'l3 0l' + f(k) + ' ' + f(y1 - y0) + 'l-3 0Z' }, { fill: '--cb-greeble-stripe' });
            add(c.svg, 'path', { d: 'M' + f(x + q + 3) + ' ' + f(y0) + 'l3 0l' + f(k) + ' ' + f(y1 - y0) + 'l-3 0Z' }, { fill: '--cb-greeble-shadow' });
          }
        } else {
          w = 6;
          add(c.svg, 'circle', { cx: f(x + 3), cy: f(top + h * (0.3 + r() * 0.4)), r: f(at(1.9 * s, 1.2)) },
            { fill: r() < 0.5 ? '--cb-greeble-lamp' : '--cb-greeble-go', cls: 'art-glow', d: r() * 4, t: 3.5 + r() * 2.5 });
        }
        x += w + 3 + r() * 5;
      }
    }
  };

  /* CRIP CYBORG: a CPAP hose, breathing, with an oxygen line beside it and
     bubbles going along it; along the foot, oxygen on a rack, a PEG tube with
     its clamp and port, and a prosthetic leg. The kit some of us live with,
     drawn as ours. */
  T.cyborg = {
    band: function (c, r) {
      var s = c.s, y0 = c.h * 0.37, x;
      add(c.svg, 'path', { d: wave(c.w, y0, 3 * s, 40, 0.3) }, { stroke: '--cb-cyborg-tube', sw: 8 * s });
      var ribs = group(c.svg, {}, { cls: 'art-breathe', t: 4.5 });
      for (x = -6; x < c.w + 6; x += 4 * at(s, 0.7)) {
        var y = y0 + 3 * s * Math.sin(x / 40 + 0.3);
        add(ribs, 'path', { d: 'M' + f(x) + ' ' + f(y - 3.6 * s) + 'L' + f(x) + ' ' + f(y + 3.6 * s) }, { stroke: '--cb-case', sw: 0.9 * at(s, 0.7) });
      }
      var y1 = c.h * 0.77;
      add(c.svg, 'path', { d: wave(c.w, y1, 2 * s, 30, 1.6) }, { stroke: '--cb-cyborg-tube', sw: at(2.4 * s, 1.3) });
      for (x = 10; x < c.w; x += 28 + r() * 18) {
        add(c.svg, 'circle', { cx: f(x), cy: f(y1 + 2 * s * Math.sin(x / 30 + 1.6)), r: f(at(s, 0.7)) }, { fill: '--cb-steel', cls: 'art-flow', d: r() * 5, t: 5, run: 26 });
      }
    },
    foot: function (c) {
      add(c.svg, 'path', { d: 'M4 28L' + Math.min(70, c.w * 0.25) + ' 28' }, { stroke: '--cb-cyborg-metal', sw: 2 });
      [8, 22, 36].forEach(function (cx) {
        add(c.svg, 'rect', { x: cx, y: 9, width: 10, height: 19, rx: 4 }, { fill: '--cb-cyborg-oxygen' });
        add(c.svg, 'rect', { x: cx + 3, y: 5, width: 4, height: 5, rx: 1 }, { fill: '--cb-cyborg-metal' });
      });
      var mid = c.w * 0.5;
      add(c.svg, 'path', { d: 'M' + f(mid - 40) + ' 6Q' + f(mid - 18) + ' 30 ' + f(mid + 8) + ' 16' }, { stroke: '--cb-cyborg-tube', sw: 2.4 });
      add(c.svg, 'rect', { x: f(mid - 30), y: 13, width: 6, height: 7, rx: 1.5 }, { fill: '--cb-cyborg-clamp' });
      add(c.svg, 'circle', { cx: f(mid + 11), cy: 15, r: 4.4 }, { fill: '--cb-cyborg-port', stroke: '--cb-steel', sw: 1 });
      add(c.svg, 'circle', { cx: f(mid - 52), cy: 17, r: 1.1 }, { fill: '--cb-steel', cls: 'art-flow', t: 4, run: 30 });
      var lx = c.w - 30;
      add(c.svg, 'path', { d: 'M' + (lx - 5) + ' 2L' + (lx + 5) + ' 2L' + (lx + 3) + ' 10L' + (lx - 3) + ' 10Z' }, { fill: '--cb-steel-2' });
      add(c.svg, 'path', { d: 'M' + lx + ' 10L' + lx + ' 25' }, { stroke: '--cb-cyborg-metal', sw: 2.6 });
      add(c.svg, 'path', { d: 'M' + (lx - 3) + ' 25L' + (lx + 9) + ' 25Q' + (lx + 11) + ' 28 ' + (lx + 8) + ' 28L' + (lx - 3) + ' 28Z' }, { fill: '--cb-cyborg-metal' });
    }
  };

  /* UNICORN POOP: a rainbow, every pastel, sparkles, and along the foot the
     swirls the theme is named after. More gradients are in cb.css, on the trims
     and the border, for no reason at all. */
  var PASTEL = ['--cb-unicorn-pink', '--cb-unicorn-peach', '--cb-unicorn-lemon', '--cb-unicorn-mint', '--cb-unicorn-sky', '--cb-unicorn-lilac'];
  T.unicorn = {
    band: function (c, r) {
      var s = c.s, x, lane = (c.h - 6 * s) / 6;
      PASTEL.forEach(function (k, i) { add(c.svg, 'path', { d: wave(c.w, 3 * s + lane * (i + 0.5), 2.4 * s, 26, 0) }, { stroke: k, sw: lane * 1.05 }); });
      for (x = 8; x < c.w; x += 26 + r() * 30) {
        add(c.svg, 'path', { d: sparkle(x, 2 + r() * (c.h - 4), (2.4 + r() * 2.4) * at(s, 0.55)) },
          { fill: '--cb-lcd', stroke: '--cb-steel-2', sw: 0.6, cls: 'art-twinkle', d: r() * 4, t: 3 + r() * 2 });
      }
    },
    foot: function (c, r) {
      var x;
      for (x = 18 + r() * 20; x < c.w - 14; x += 44 + r() * 40) {
        var sw = group(c.svg, {}, { cls: 'art-rise', d: r() * 4, t: 1.6 });
        add(sw, 'ellipse', { cx: f(x), cy: 25, rx: 11, ry: 4 }, { fill: PASTEL[Math.floor(r() * 6)], stroke: '--cb-steel-2', sw: 0.6 });
        add(sw, 'ellipse', { cx: f(x), cy: 19.5, rx: 8, ry: 3.6 }, { fill: PASTEL[Math.floor(r() * 6)], stroke: '--cb-steel-2', sw: 0.6 });
        add(sw, 'ellipse', { cx: f(x), cy: 14.5, rx: 5, ry: 3 }, { fill: PASTEL[Math.floor(r() * 6)], stroke: '--cb-steel-2', sw: 0.6 });
        add(sw, 'path', { d: 'M' + f(x) + ' 11.6Q' + f(x + 1) + ' 8 ' + f(x + 4) + ' 7' }, { stroke: '--cb-steel-2', sw: 0.9 });
        add(c.svg, 'path', { d: sparkle(x + 13, 9, 2.6) }, { fill: '--cb-unicorn-lemon', stroke: '--cb-steel-2', sw: 0.5, cls: 'art-twinkle', d: r() * 3, t: 3 });
      }
    }
  };

  /* WABI-SABI: one uneven brush stroke, a tea ring left by a cup under the bar,
     and a crack along the foot mended in gold. Nothing in it moves, at any
     setting. */
  T.wabi = {
    band: function (c, r) {
      var s = c.s, mid = c.h * 0.47, x0 = c.w * (0.08 + r() * 0.1), x1 = c.w * (0.62 + r() * 0.2), up = '', down = '', x;
      for (x = x0; x <= x1; x += 6) {
        var t = (x - x0) / (x1 - x0), thick = (5.5 * Math.sin(Math.PI * Math.pow(t, 0.7)) + r() * 1.2) * at(s, 0.5);
        up += (up ? 'L' : 'M') + f(x) + ' ' + f(mid - thick / 2 + Math.sin(x / 31) * 2 * s);
        down = 'L' + f(x) + ' ' + f(mid + thick / 2 + Math.sin(x / 31) * 2 * s) + down;
      }
      add(c.svg, 'path', { d: up + down + 'Z' }, { fill: '--cb-steel' });
      for (var k = 0; k < 3; k++) {
        var gx = x0 + (x1 - x0) * (0.55 + r() * 0.4);
        add(c.svg, 'path', { d: 'M' + f(gx) + ' ' + f(mid - s + r() * 2 * s) + 'l' + f(10 + r() * 14) + ' ' + f((r() - 0.5) * s) }, { stroke: '--cb-case', sw: 0.8 * at(s, 0.6) });
      }
      if (c.kind === 'top') add(c.svg, 'circle', { cx: f(c.w - 30), cy: 19, r: 11, 'stroke-dasharray': '58 6 6 4' }, { stroke: '--cb-wabi-stain', sw: 2.2 });
    },
    foot: function (c, r) {
      var crack = 'M-4 ' + f(12 + r() * 6), branch = null, x;
      for (x = 0; x < c.w + 8; x += 8 + r() * 14) {
        var y = 9 + r() * 12;
        crack += 'L' + f(x) + ' ' + f(y);
        if (!branch && x > c.w * 0.4) branch = 'M' + f(x) + ' ' + f(y) + 'L' + f(x + 9) + ' ' + f(y + 7) + 'L' + f(x + 16) + ' ' + f(y + 6);
      }
      add(c.svg, 'path', { d: crack }, { stroke: '--cb-wabi-gold', sw: 1.6 });
      if (branch) add(c.svg, 'path', { d: branch }, { stroke: '--cb-wabi-gold', sw: 1.1 });
      for (x = c.w - 26; x < c.w - 4; x += 3 + r() * 3) add(c.svg, 'circle', { cx: f(x), cy: f(24 + r() * 4), r: f(1 + r() * 1.4) }, { fill: '--cb-wabi-moss' });
    }
  };

  // Every strip has its own seed, so the two sides and every divider differ.
  var SEED = { top: 1966, foot: 2026, left: 1987, right: 1701, divider: 1588 };
  function one(theme, box, kind, n) {
    if (!box) return false;
    var t = T[theme];
    box.textContent = '';
    if (!t) return false;
    var paint = kind === 'foot' ? (t.foot === undefined ? t.band : t.foot) : t.band;
    if (!paint) return false;
    var c = strip(box, kind);
    paint(c, seeded(SEED[kind] + (n || 0) * 97));
    return true;
  }

  /* Draws a theme into the strips it is given: { top, foot, left, right,
     dividers }, any of which may be left out, so a strip can be drawn again on
     its own. Says which it drew; a theme with none empties them all. */
  function draw(theme, strips) {
    var used = {};
    ['top', 'foot', 'left', 'right'].forEach(function (k) { if (k in strips) used[k] = one(theme, strips[k], k); });
    if (strips.dividers) used.dividers = strips.dividers.map(function (box, i) { return one(theme, box, 'divider', i); });
    return used;
  }
  window.loveCbArt = { draw: draw, has: function (t) { return !!T[t]; }, sideLength: sideLength };
})();

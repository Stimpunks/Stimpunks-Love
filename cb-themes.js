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

  /* ── THE WINAMP SKINS (Ryan, 2026-10-17) ─────────────────────────────────
     After skins in the Winamp Skin Museum. Each band is drawn here from
     shapes anybody could draw, in the skin's spirit and its theme's inks: no
     bitmap of a skin's is used, no character from a game is drawn, and no mark
     of a company's. Who made each skin is in call.js's SCHEMES. */

  // Pixel art: a picture given as rows of '#' and '.', drawn as one rect per run.
  function pixels(parent, x, y, u, rows, o) {
    var g = group(parent, {}, o);
    rows.forEach(function (row, j) {
      var i = 0;
      while (i < row.length) {
        if (row.charAt(i) !== '#') { i++; continue; }
        var k = i;
        while (k < row.length && row.charAt(k) === '#') k++;
        add(g, 'rect', { x: f(x + i * u), y: f(y + j * u), width: f((k - i) * u + 0.2), height: f(u + 0.2) }, { fill: o.fill });
        i = k;
      }
    });
    return g;
  }
  function txt(parent, x, y, str, size, o) {
    var e = add(parent, 'text', { x: f(x), y: f(y), 'font-size': f(size), 'font-family': "'Courier Prime', ui-monospace, monospace", 'font-weight': '700' }, o);
    e.textContent = str;
    return e;
  }
  var HEART = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'];
  var COIN = ['.##.', '#..#', '#..#', '#..#', '.##.'];

  /* ZELDA AMP: a row of hearts, hedges and stone, in its forest green and gold. */
  T.zelda = {
    band: function (c, r) {
      var s = c.s, u = at(1.6 * s, 1), x = 6, i = 0;
      if (c.kind === 'top') {
        for (; i < 6; i++, x += 8 * u + 2) pixels(c.svg, x, (c.h - 6 * u) / 2, u, HEART, { fill: '--cb-zelda-heart', cls: 'art-glow', d: i * 0.5, t: 5 });
        x += 8;
      }
      while (x < c.w - 10) {
        var pick = r();
        if (pick < 0.25) {
          pixels(c.svg, x, (c.h - 6 * u) / 2, u, HEART, { fill: '--cb-zelda-heart', cls: 'art-glow', d: r() * 4, t: 5 });
          x += 8 * u + 6;
        } else if (pick < 0.75) {
          var w = (16 + r() * 14) * at(s, 0.6), base = c.h * 0.78, hg = group(c.svg, {}, { cls: 'art-sway', d: r() * 4, t: 7 });
          add(hg, 'rect', { x: f(x), y: f(base - c.h * 0.42), width: f(w), height: f(c.h * 0.42), rx: f(c.h * 0.18) }, { fill: '--cb-zelda-leaf' });
          for (var b = 0; b < 3; b++) add(hg, 'circle', { cx: f(x + w * (0.22 + b * 0.28)), cy: f(base - c.h * 0.36), r: f(c.h * 0.16) }, { fill: '--cb-zelda-hedge' });
          x += w + 6;
        } else {
          var sz = at(9 * s, 5);
          add(c.svg, 'rect', { x: f(x), y: f(c.h / 2 - sz / 2), width: f(sz), height: f(sz) }, { fill: '--cb-zelda-stone', stroke: '--cb-case', sw: 1 });
          add(c.svg, 'path', { d: 'M' + f(x + sz * 0.25) + ' ' + f(c.h / 2 - sz * 0.15) + 'l' + f(sz * 0.5) + ' 0' }, { stroke: '--cb-zelda-leaf', sw: 1 });
          x += sz + 6;
        }
      }
    }
  };

  /* MICROCHIP: a circuit board, gold traces with signals going along them,
     chips with their pins, resistors and LEDs. */
  T.microchip = {
    band: function (c, r) {
      var s = c.s, x, lanes = [0.22, 0.5, 0.8];
      lanes.forEach(function (fy, i) {
        var y = c.h * fy, d = 'M-4 ' + f(y), px = -4;
        for (x = 20 + r() * 40; x < c.w + 20; x += 40 + r() * 60) {
          var ny = c.h * lanes[(i + (r() < 0.5 ? 1 : 2)) % 3];
          d += 'L' + f(x) + ' ' + f(y) + 'L' + f(x + Math.abs(ny - y)) + ' ' + f(ny);
          y = ny; px = x;
        }
        d += 'L' + f(c.w + 4) + ' ' + f(y);
        add(c.svg, 'path', { d: d }, { stroke: '--cb-microchip-trace', sw: at(1.4 * s, 0.9) });
      });
      for (x = 14 + r() * 30; x < c.w - 40; x += 70 + r() * 70) {
        var pick = r(), h = c.h * 0.5, y0 = c.h / 2 - h / 2;
        if (pick < 0.5) {
          var w = (22 + r() * 22) * at(s, 0.6);
          for (var p = 3; p < w - 2; p += 4 * at(s, 0.6)) {
            add(c.svg, 'rect', { x: f(x + p), y: f(y0 - 2 * s), width: f(1.6 * at(s, 0.6)), height: f(h + 4 * s) }, { fill: '--cb-microchip-pin' });
          }
          add(c.svg, 'rect', { x: f(x), y: f(y0), width: f(w), height: f(h), rx: 1 }, { fill: '--cb-microchip-chip' });
          add(c.svg, 'circle', { cx: f(x + 3 * s), cy: f(y0 + 3 * s), r: f(at(s, 0.6)) }, { fill: '--cb-microchip-pin' });
        } else if (pick < 0.8) {
          var rw = 14 * at(s, 0.6), ry = c.h / 2;
          add(c.svg, 'path', { d: 'M' + f(x - 5) + ' ' + f(ry) + 'L' + f(x + rw + 5) + ' ' + f(ry) }, { stroke: '--cb-microchip-pin', sw: 1 });
          add(c.svg, 'rect', { x: f(x), y: f(ry - 3 * s), width: f(rw), height: f(6 * s), rx: f(3 * s) }, { fill: '--cb-microchip-resistor' });
          ['--cb-microchip-led', '--cb-microchip-chip', '--cb-microchip-trace'].forEach(function (k, i) {
            add(c.svg, 'rect', { x: f(x + rw * (0.25 + i * 0.2)), y: f(ry - 3 * s), width: f(1.6 * at(s, 0.6)), height: f(6 * s) }, { fill: k });
          });
        } else {
          add(c.svg, 'circle', { cx: f(x), cy: f(c.h / 2), r: f(at(2.6 * s, 1.6)) }, { fill: '--cb-microchip-led', cls: 'art-glow', d: r() * 4, t: 4 });
        }
      }
      for (x = 30; x < c.w; x += 90 + r() * 60) {
        add(c.svg, 'circle', { cx: f(x), cy: f(c.h * lanes[Math.floor(r() * 3)]), r: f(at(1.3 * s, 0.9)) }, { fill: '--cb-amber-2', cls: 'art-flow', d: r() * 5, t: 4, run: 40 });
      }
    }
  };

  /* ASCII-AMP: rows of typed characters in its five inks. They are marks, not
     words, and they twinkle. */
  var ASCII = ['-=-=-=-', '<-->', ':: [] ::', '/\\/\\', '*', '#', '. o .', '+--+', '~', '||', '>>', '_-_', '(_)'];
  T.ascii = {
    band: function (c, r) {
      var size = at(13 * c.s, 9), inks = ['--cb-steel', '--cb-steel-2', '--cb-amber', '--cb-amber-2', '--cb-ascii-magenta'], x = 4;
      while (x < c.w - 8) {
        var str = ASCII[Math.floor(r() * ASCII.length)];
        txt(c.svg, x, c.h / 2 + size * 0.34, str, size, { fill: inks[Math.floor(r() * inks.length)], cls: r() < 0.45 ? 'art-twinkle' : '', d: r() * 4, t: 3 + r() * 3 });
        x += str.length * size * 0.62 + size * 0.6;
      }
    }
  };

  /* SUPER MARIO LAND AMP: pyramids in the desert under its lavender sky, a row
     of bricks, pipes, and clouds going over. */
  T.sml = {
    band: function (c, r) {
      var s = c.s, x;
      add(c.svg, 'rect', { x: 0, y: 0, width: c.w, height: c.h }, { fill: '--cb-sml-sky' });
      for (x = 10 + r() * 30; x < c.w; x += 60 + r() * 70) {
        var ph = c.h * (0.5 + r() * 0.35), pw = ph * 1.6;
        add(c.svg, 'path', { d: 'M' + f(x) + ' ' + c.h + 'L' + f(x + pw / 2) + ' ' + f(c.h - ph) + 'L' + f(x + pw) + ' ' + c.h + 'Z' }, { fill: '--cb-bar' });
        add(c.svg, 'path', { d: 'M' + f(x + pw / 2) + ' ' + f(c.h - ph) + 'L' + f(x + pw) + ' ' + c.h + 'L' + f(x + pw * 0.62) + ' ' + c.h + 'Z' }, { fill: '--cb-sml-pyramid' });
      }
      for (x = 40 + r() * 40; x < c.w - 20; x += 90 + r() * 80) {
        if (r() < 0.5) {
          var bs = at(7 * s, 4), n = 2 + Math.floor(r() * 3), by = c.h * 0.22;
          for (var b = 0; b < n; b++) {
            add(c.svg, 'rect', { x: f(x + b * bs), y: f(by), width: f(bs), height: f(bs) }, { fill: '--cb-sml-brick', stroke: '--cb-steel-2', sw: 0.8 });
          }
        } else {
          var pw2 = at(9 * s, 6), pt = c.h * 0.45;
          add(c.svg, 'rect', { x: f(x + 1.5), y: f(pt + 3 * s), width: f(pw2 - 3), height: f(c.h - pt - 3 * s) }, { fill: '--cb-sml-pipe' });
          add(c.svg, 'rect', { x: f(x), y: f(pt), width: f(pw2), height: f(4 * s) }, { fill: '--cb-sml-pipe', stroke: '--cb-steel-2', sw: 0.6 });
        }
      }
      for (x = r() * 60; x < c.w; x += 110 + r() * 90) {
        var cl = group(c.svg, {}, { cls: 'art-flow', d: r() * 6, t: 16 + r() * 8, run: 50 });
        [0, 1, 2].forEach(function (k) { add(cl, 'circle', { cx: f(x + k * 5 * s), cy: f(c.h * 0.22 - (k === 1 ? 2 * s : 0)), r: f(at(4 * s, 2.4)) }, { fill: '--cb-lcd' }); });
      }
    }
  };

  /* DIG DUG AMP: the layers of earth, a tunnel dug through them with something
     going along it, and rocks that rock. */
  T.digdug = {
    band: function (c, r) {
      var s = c.s, layers = ['--cb-digdug-yellow', '--cb-digdug-orange', '--cb-digdug-red', '--cb-digdug-deep'], x;
      var top = c.kind === 'top' ? c.h * 0.16 : 0, lh = (c.h - top) / 4;
      if (top) add(c.svg, 'rect', { x: 0, y: 0, width: c.w, height: f(top) }, { fill: '--cb-digdug-sky' });
      layers.forEach(function (k, i) { add(c.svg, 'rect', { x: 0, y: f(top + i * lh), width: c.w, height: f(lh + 0.5) }, { fill: k }); });
      for (x = 3; x < c.w; x += 5 + r() * 7) add(c.svg, 'rect', { x: f(x), y: f(top + r() * (c.h - top)), width: 1.4, height: 1.4 }, { fill: '--cb-digdug-deep' });
      var ty = top + lh * (1.5 + Math.floor(r() * 2)), tun = 'M-4 ' + f(ty), cx = -4;
      for (x = 30 + r() * 30; x < c.w; x += 50 + r() * 60) {
        var ny = top + lh * (0.5 + Math.floor(r() * 4));
        tun += 'L' + f(x) + ' ' + f(ty) + 'L' + f(x) + ' ' + f(ny);
        ty = ny;
      }
      tun += 'L' + f(c.w + 4) + ' ' + f(ty);
      add(c.svg, 'path', { d: tun }, { stroke: '--cb-lcd', sw: at(lh * 0.9, 3) });
      add(c.svg, 'circle', { cx: 20, cy: f(top + lh * 1.5), r: f(at(lh * 0.32, 1.2)) }, { fill: '--cb-steel', cls: 'art-flow', t: 6, run: 60 });
      for (x = 50 + r() * 40; x < c.w - 10; x += 80 + r() * 90) {
        add(c.svg, 'ellipse', { cx: f(x), cy: f(top + lh * (0.5 + Math.floor(r() * 4))), rx: f(at(5 * s, 3)), ry: f(at(4 * s, 2.4)) },
          { fill: '--cb-digdug-rock', stroke: '--cb-case', sw: 0.8, cls: 'art-sway', d: r() * 3, t: 2.6 });
      }
    }
  };

  /* DEVIANTAMP: rails, sliders, round buttons and one lit lamp, in its
     grey-greens, the way sites looked in 2001. It stands still. */
  T.deviant = {
    band: function (c, r) {
      var s = c.s, y1 = c.h * 0.36, y2 = c.h * 0.66, x;
      [y1, y2].forEach(function (y) {
        add(c.svg, 'path', { d: 'M4 ' + f(y) + 'L' + (c.w - 4) + ' ' + f(y) }, { stroke: '--cb-deviant-rail', sw: at(2 * s, 1) });
        add(c.svg, 'path', { d: 'M4 ' + f(y + 1.2) + 'L' + (c.w - 4) + ' ' + f(y + 1.2) }, { stroke: '--cb-lcd', sw: 0.6 });
      });
      for (x = 20 + r() * 30; x < c.w - 20; x += 50 + r() * 70) {
        var pick = r(), y = r() < 0.5 ? y1 : y2;
        if (pick < 0.5) add(c.svg, 'rect', { x: f(x), y: f(y - 3.5 * s), width: f(at(12 * s, 7)), height: f(7 * s), rx: f(2 * s) }, { fill: '--cb-lcd', stroke: '--cb-steel-2', sw: 0.8 });
        else add(c.svg, 'circle', { cx: f(x), cy: f(c.h / 2), r: f(at(5 * s, 3)) }, { fill: '--cb-bar', stroke: '--cb-steel-2', sw: 0.8 });
      }
      add(c.svg, 'circle', { cx: f(c.w - 14), cy: f(c.h / 2), r: f(at(2.6 * s, 1.6)) }, { fill: '--cb-deviant-green' });
    }
  };

  /* HP 49G: a row of its keys, the shifted, red and white ones among the dark,
     and a little screen with its cursor waiting. */
  T.hp49g = {
    band: function (c, r) {
      var s = c.s, x = 6, kh = c.h * 0.56, ky = (c.h - kh) / 2;
      var inks = ['--cb-hp49g-dark', '--cb-hp49g-dark', '--cb-hp49g-white', '--cb-hp49g-blue', '--cb-hp49g-red'];
      if (c.kind === 'top') {
        var sw = 70;
        add(c.svg, 'rect', { x: f(x), y: f(c.h * 0.12), width: sw, height: f(c.h * 0.76), rx: 3 }, { fill: '--cb-lcd', stroke: '--cb-hp49g-dark', sw: 2 });
        for (var l = 0; l < 3; l++) add(c.svg, 'path', { d: 'M' + (x + 6) + ' ' + f(c.h * (0.3 + l * 0.18)) + 'l' + f(30 + r() * 26) + ' 0' }, { stroke: '--cb-amber-2', sw: 1.4 });
        add(c.svg, 'rect', { x: x + sw - 12, y: f(c.h * 0.62), width: 5, height: 7 }, { fill: '--cb-amber', cls: 'art-glow', t: 3 });
        x += sw + 8;
      }
      while (x < c.w - 10) {
        var kw = (14 + r() * 10) * at(s, 0.6);
        add(c.svg, 'rect', { x: f(x), y: f(ky), width: f(kw), height: f(kh), rx: f(at(3 * s, 1.5)) }, { fill: inks[Math.floor(r() * inks.length)], stroke: '--cb-hp49g-dark', sw: 0.8 });
        x += kw + 4 * at(s, 0.6);
      }
    }
  };

  /* WINAMP MARIO: its blue sky, bricks, coins that glint, green hills and
     clouds going over. */
  T.mario = {
    band: function (c, r) {
      var s = c.s, x;
      for (x = r() * 40; x < c.w; x += 90 + r() * 90) {
        var hr = c.h * (0.5 + r() * 0.3);
        add(c.svg, 'path', { d: 'M' + f(x) + ' ' + c.h + 'Q' + f(x + hr) + ' ' + f(c.h - hr * 1.4) + ' ' + f(x + hr * 2) + ' ' + c.h + 'Z' }, { fill: '--cb-mario-hill', stroke: '--cb-steel', sw: 0.8 });
        add(c.svg, 'path', { d: 'M' + f(x + hr * 0.6) + ' ' + f(c.h - hr * 0.3) + 'q' + f(hr * 0.3) + ' ' + f(-hr * 0.4) + ' ' + f(hr * 0.6) + ' 0' }, { stroke: '--cb-mario-bush', sw: at(1.4 * s, 1) });
      }
      for (x = 30 + r() * 40; x < c.w - 20; x += 70 + r() * 70) {
        if (r() < 0.55) {
          var bs = at(7 * s, 4), n = 2 + Math.floor(r() * 3), by = c.h * 0.2;
          for (var b = 0; b < n; b++) {
            add(c.svg, 'rect', { x: f(x + b * bs), y: f(by), width: f(bs), height: f(bs) }, { fill: '--cb-mario-brick', stroke: '--cb-steel', sw: 0.8 });
            add(c.svg, 'path', { d: 'M' + f(x + b * bs) + ' ' + f(by + bs / 2) + 'l' + f(bs) + ' 0M' + f(x + b * bs + bs / 2) + ' ' + f(by) + 'l0 ' + f(bs / 2) }, { stroke: '--cb-steel', sw: 0.6 });
          }
        } else {
          pixels(c.svg, x, c.h * 0.22, at(1.4 * s, 1), COIN, { fill: '--cb-mario-coin', cls: 'art-twinkle', d: r() * 3, t: 2.8 });
        }
      }
      for (x = r() * 60; x < c.w; x += 120 + r() * 90) {
        var cl = group(c.svg, {}, { cls: 'art-flow', d: r() * 6, t: 18 + r() * 8, run: 50 });
        [0, 1, 2].forEach(function (k) { add(cl, 'circle', { cx: f(x + k * 5 * s), cy: f(c.h * 0.32 - (k === 1 ? 2 * s : 0)), r: f(at(4 * s, 2.4)) }, { fill: '--cb-lcd', stroke: '--cb-steel', sw: 0.6 }); });
      }
    }
  };

  /* THE CUBE: green cubes, stacked one or two high on grey slabs, rising into
     place. Drawn for the radio; nothing of Kuki's skin is copied. */
  T.cube = {
    band: function (c, r) {
      var s = c.s, a = at(6 * s, 3.4), x, i = 0;
      add(c.svg, 'rect', { x: 0, y: f(c.h - 3 * s), width: c.w, height: f(3 * s) }, { fill: '--cb-cube-metal' });
      function cube(cx, by, d) {
        var g = group(c.svg, {}, { cls: 'art-rise', d: d, t: 1.4 }), h = a * 0.58;
        add(g, 'path', { d: 'M' + f(cx) + ' ' + f(by - a - h) + 'l' + f(a) + ' ' + f(-h / 2) + 'l' + f(a) + ' ' + f(h / 2) + 'l' + f(-a) + ' ' + f(h / 2) + 'Z' }, { fill: '--cb-cube-top' });
        add(g, 'path', { d: 'M' + f(cx) + ' ' + f(by - a - h) + 'l' + f(a) + ' ' + f(h / 2) + 'l0 ' + f(a) + 'l' + f(-a) + ' ' + f(-h / 2) + 'Z' }, { fill: '--cb-cube-side' });
        add(g, 'path', { d: 'M' + f(cx + a) + ' ' + f(by - a - h / 2) + 'l' + f(a) + ' ' + f(-h / 2) + 'l0 ' + f(a) + 'l' + f(-a) + ' ' + f(h / 2) + 'Z' }, { fill: '--cb-cube-shade' });
      }
      for (x = 4; x < c.w - 2 * a; x += 2 * a + 1, i++) {
        var by = c.h - 3 * s;
        if (r() < 0.75) cube(x, by, (i % 30) * 0.12);
        if (c.h >= 24 && r() < 0.3) cube(x, by - a, (i % 30) * 0.12 + 0.6);
      }
    }
  };

  /* PIP-BOY 3000: green on black, a gauge whose needle drifts, bars like a
     level meter, and the lines of a phosphor screen, which never flicker. */
  T.pipboy = {
    band: function (c, r) {
      var s = c.s, x;
      for (var y = 2; y < c.h; y += 3) add(c.svg, 'path', { d: 'M0 ' + y + 'L' + c.w + ' ' + y }, { stroke: '--cb-pipboy-dim', sw: 0.5 });
      for (x = 16 + r() * 30; x < c.w - 16; x += 70 + r() * 60) {
        if (r() < 0.45) {
          var gr = at(c.h * 0.4, 5), gy = c.h * 0.85;
          add(c.svg, 'path', { d: 'M' + f(x - gr) + ' ' + f(gy) + 'A' + f(gr) + ' ' + f(gr) + ' 0 0 1 ' + f(x + gr) + ' ' + f(gy) }, { stroke: '--cb-pipboy-dim', sw: at(1.4 * s, 1) });
          for (var t = 0; t <= 6; t++) {
            var ang = Math.PI * (1 - t / 6), cx = Math.cos(ang), sy = Math.sin(ang);
            add(c.svg, 'path', { d: 'M' + f(x + cx * gr * 0.8) + ' ' + f(gy - sy * gr * 0.8) + 'L' + f(x + cx * gr) + ' ' + f(gy - sy * gr) }, { stroke: '--cb-steel-2', sw: 0.8 });
          }
          var nd = group(c.svg, {}, { cls: 'art-sway', d: r() * 3, t: 6 });
          add(nd, 'path', { d: 'M' + f(x) + ' ' + f(gy) + 'L' + f(x + gr * 0.3) + ' ' + f(gy - gr * 0.85) }, { stroke: '--cb-pipboy-glow', sw: at(1.4 * s, 1) });
        } else {
          for (var b = 0; b < 6; b++) {
            var bh = c.h * (0.25 + r() * 0.6);
            add(c.svg, 'rect', { x: f(x + b * 5 * at(s, 0.6)), y: f(c.h - 2 - bh), width: f(3.6 * at(s, 0.6)), height: f(bh) }, { fill: '--cb-steel-2' });
          }
        }
      }
      add(c.svg, 'circle', { cx: f(c.w - 10), cy: f(c.h / 2), r: f(at(2.4 * s, 1.5)) }, { fill: '--cb-pipboy-glow', cls: 'art-glow', t: 4 });
    }
  };

  /* GAME BOY: a little screen in its four greens, the cross pad, the A and B
     buttons, the speaker's slanted grille, and the power lamp. */
  T.gameboy = {
    band: function (c, r) {
      var s = c.s, x = 8, step = 0;
      while (x < c.w - 30) {
        var kind = step % 4;
        if (kind === 0) {
          var sw = at(34 * s, 22), sh = c.h * 0.7, sy = (c.h - sh) / 2;
          add(c.svg, 'rect', { x: f(x), y: f(sy), width: f(sw), height: f(sh), rx: 2 }, { fill: '--cb-gameboy-screen', stroke: '--cb-gameboy-dark', sw: 1 });
          for (var p = 0; p < 6; p++) add(c.svg, 'rect', { x: f(x + 3 + r() * (sw - 8)), y: f(sy + 2 + r() * (sh - 5)), width: f(at(2 * s, 1.4)), height: f(at(2 * s, 1.4)) }, { fill: '--cb-gameboy-dark' });
          x += sw + 10;
        } else if (kind === 1) {
          var d = at(5 * s, 3), cy = c.h / 2;
          add(c.svg, 'path', { d: 'M' + f(x + d) + ' ' + f(cy - 1.5 * d) + 'h' + f(d) + 'v' + f(d) + 'h' + f(d) + 'v' + f(d) + 'h' + f(-d) + 'v' + f(d) + 'h' + f(-d) + 'v' + f(-d) + 'h' + f(-d) + 'v' + f(-d) + 'h' + f(d) + 'Z' }, { fill: '--cb-gameboy-pad' });
          x += 3 * d + 10;
        } else if (kind === 2) {
          var br = at(4 * s, 2.4);
          add(c.svg, 'circle', { cx: f(x + br), cy: f(c.h / 2 + br * 0.6), r: f(br) }, { fill: '--cb-gameboy-berry' });
          add(c.svg, 'circle', { cx: f(x + br * 3.4), cy: f(c.h / 2 - br * 0.6), r: f(br) }, { fill: '--cb-gameboy-berry' });
          x += br * 4.4 + 12;
        } else {
          for (var g = 0; g < 6; g++) add(c.svg, 'path', { d: 'M' + f(x + g * 4) + ' ' + f(c.h * 0.78) + 'l' + f(c.h * 0.3) + ' ' + f(-c.h * 0.56) }, { stroke: '--cb-steel-2', sw: at(1.6 * s, 1.1), });
          x += 24 + c.h * 0.3 + 12;
        }
        step++;
      }
      add(c.svg, 'circle', { cx: f(c.w - 12), cy: f(c.h / 2), r: f(at(2.2 * s, 1.4)) }, { fill: '--cb-gameboy-led', cls: 'art-glow', t: 4 });
    }
  };

  /* TI-82: a graph drawing itself across its screen, and along the foot a row
     of its keys on the calculator's dark body. */
  T.ti82 = {
    band: function (c, r) {
      var s = c.s, mid = c.h / 2, x, d = '';
      add(c.svg, 'path', { d: 'M0 ' + f(mid) + 'L' + c.w + ' ' + f(mid) }, { stroke: '--cb-amber-2', sw: 0.6 });
      for (x = 20; x < c.w; x += 40) add(c.svg, 'path', { d: 'M' + x + ' ' + f(mid - 2) + 'l0 4' }, { stroke: '--cb-amber-2', sw: 0.6 });
      var per = 26 + r() * 20;
      for (x = 0; x <= c.w; x += 3) d += (d ? 'L' : 'M') + f(x) + ' ' + f(mid - c.h * 0.32 * Math.sin(x / per) * Math.cos(x / (per * 3.1)));
      add(c.svg, 'path', { d: d, pathLength: 1 }, { stroke: '--cb-amber', sw: at(1.6 * s, 1), cls: 'art-grow', t: growFor(c) });
    },
    foot: function (c, r) {
      var x = 4;
      add(c.svg, 'rect', { x: 0, y: 0, width: c.w, height: c.h }, { fill: '--cb-ti82-body' });
      while (x < c.w - 10) {
        var kw = 16 + r() * 8, pick = r();
        add(c.svg, 'rect', { x: f(x), y: 8, width: f(kw), height: 14, rx: 3 }, { fill: pick < 0.15 ? '--cb-ti82-blue' : pick < 0.4 ? '--cb-ti82-grey' : '--cb-ti82-key', stroke: '--cb-case', sw: 0.6 });
        x += kw + 5;
      }
    }
  };

  /* ── THE GEOCITIES PAGES (Ryan, 2026-10-17) ──────────────────────────────
     After pages in Restorativland's GeoCities archive. Each band is drawn
     here in the page's spirit and its theme's inks: no picture, clip art or
     photograph from any of them is used, and nobody on them is drawn. */

  // A five-pointed star centred on x, y.
  function star5(x, y, r) {
    var d = '';
    for (var i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
      d += (i ? 'L' : 'M') + f(x + rr * Math.cos(a)) + ' ' + f(y + rr * Math.sin(a));
    }
    return d + 'Z';
  }

  /* DIVINE LOUISE BROOKS: the page's blocks of red, mustard, orange and rose,
     a few with pinstripes, and the black swoosh over them. Still, like a page
     made in Publisher. */
  T.louise = {
    band: function (c, r) {
      var s = c.s, x = 0, inks = ['--cb-louise-mustard', '--cb-louise-orange', '--cb-louise-rose', '--cb-bar'];
      var top = c.h * 0.18, bh = c.h * 0.64;
      while (x < c.w) {
        var w = (24 + r() * 46) * at(s, 0.6), ink = inks[Math.floor(r() * inks.length)];
        add(c.svg, 'rect', { x: f(x), y: f(top), width: f(w), height: f(bh) }, { fill: ink });
        if (r() < 0.3) for (var k = 1; k < 4; k++) add(c.svg, 'path', { d: 'M' + f(x + 2) + ' ' + f(top + bh * k / 4) + 'l' + f(w - 4) + ' 0' }, { stroke: '--cb-steel', sw: 0.8 });
        x += w;
      }
      for (x = 20 + r() * 40; x < c.w; x += 110 + r() * 90) {
        add(c.svg, 'path', { d: 'M' + f(x) + ' ' + f(c.h * 0.95) + 'C' + f(x + 10 * s) + ' ' + f(c.h * 0.2) + ' ' + f(x + 30 * s) + ' ' + f(c.h * 0.05) + ' ' + f(x + 46 * s) + ' ' + f(c.h * 0.4) },
          { stroke: '--cb-louise-swoosh', sw: at(4.5 * s, 2.4) });
      }
    }
  };

  /* PAULA'S PAGE: a bamboo pole with ferns growing off it, jungle flowers,
     and now and then a lizard sunning itself. */
  T.paula = {
    band: function (c, r) {
      var s = c.s, y = c.h * 0.62, x;
      add(c.svg, 'rect', { x: 0, y: f(y - 2 * s), width: c.w, height: f(at(4 * s, 2)), rx: 1 }, { fill: '--cb-paula-bamboo' });
      for (x = 12; x < c.w; x += 28 + r() * 20) add(c.svg, 'rect', { x: f(x), y: f(y - 2.6 * s), width: f(at(1.6 * s, 1)), height: f(at(5.2 * s, 2.6)) }, { fill: '--cb-paula-leaf' });
      for (x = 20 + r() * 30; x < c.w - 10; x += 46 + r() * 50) {
        var fern = group(c.svg, {}, { cls: 'art-sway', d: r() * 4, t: 6 + r() * 3 }), len = c.h * 0.55, dir = r() < 0.5 ? -1 : 1;
        add(fern, 'path', { d: 'M' + f(x) + ' ' + f(y) + 'q' + f(dir * len * 0.3) + ' ' + f(-len * 0.6) + ' ' + f(dir * len * 0.7) + ' ' + f(-len * 0.9) }, { stroke: '--cb-paula-fern', sw: at(s, 0.7) });
        for (var k = 1; k < 6; k++) {
          var t = k / 6, fx = x + dir * len * 0.7 * t, fy = y - len * 0.9 * t;
          add(fern, 'path', { d: 'M' + f(fx) + ' ' + f(fy) + 'l' + f(-3 * s) + ' ' + f(-2 * s) + 'M' + f(fx) + ' ' + f(fy) + 'l' + f(3 * s) + ' ' + f(-1 * s) }, { stroke: '--cb-paula-fern', sw: at(1.2 * s, 0.8) });
        }
      }
      for (x = 34 + r() * 40; x < c.w - 10; x += 70 + r() * 70) {
        var fy2 = c.h * (0.22 + r() * 0.2), pr = at(2.4 * s, 1.5), fl = group(c.svg, {}, { cls: 'art-pop', d: r() * 4, t: 1.4 });
        for (var p = 0; p < 5; p++) {
          var a = p * Math.PI * 2 / 5;
          add(fl, 'circle', { cx: f(x + Math.cos(a) * pr), cy: f(fy2 + Math.sin(a) * pr), r: f(pr * 0.8) }, { fill: '--cb-paula-flower' });
        }
        add(fl, 'circle', { cx: f(x), cy: f(fy2), r: f(pr * 0.6) }, { fill: '--cb-paula-bamboo' });
      }
      if (c.w > 200) {
        var lx = c.w * (0.3 + r() * 0.4), ly = y - 2.5 * s, ls = at(s, 0.6);
        add(c.svg, 'path', { d: 'M' + f(lx) + ' ' + f(ly) + 'q' + f(10 * ls) + ' ' + f(-6 * ls) + ' ' + f(20 * ls) + ' 0q' + f(4 * ls) + ' ' + f(3 * ls) + ' ' + f(8 * ls) + ' ' + f(-1 * ls) },
          { stroke: '--cb-paula-lizard', sw: at(3 * ls, 1.6) });
        add(c.svg, 'path', { d: 'M' + f(lx) + ' ' + f(ly) + 'q' + f(-6 * ls) + ' ' + f(2 * ls) + ' ' + f(-5 * ls) + ' ' + f(-4 * ls) + 'q' + f(1 * ls) + ' ' + f(-3 * ls) + ' ' + f(3 * ls) + ' ' + f(-1 * ls) }, { stroke: '--cb-paula-lizard', sw: at(1.4 * ls, 0.9) });
        add(c.svg, 'circle', { cx: f(lx + 27 * ls), cy: f(ly - 2 * ls), r: f(at(0.8 * ls, 0.6)) }, { fill: '--cb-steel' });
      }
    }
  };

  /* SHOP TIL U DROP!: checkerboard, zebra stripes, neon blocks, shopping bags,
     and a pink arrow pointing down at the bargains. */
  T.shop = {
    band: function (c, r) {
      var s = c.s, x = 4, kind = 0;
      while (x < c.w - 10) {
        var w, y0 = c.h * 0.2, h = c.h * 0.6;
        if (kind % 5 === 0) {
          var sq = h / 3;
          w = sq * (4 + Math.floor(r() * 4));
          for (var i = 0; i * sq < w; i++) for (var j = 0; j < 3; j++) {
            add(c.svg, 'rect', { x: f(x + i * sq), y: f(y0 + j * sq), width: f(sq), height: f(sq) }, { fill: (i + j) % 2 ? '--cb-steel' : '--cb-case' });
          }
          add(c.svg, 'rect', { x: f(x), y: f(y0), width: f(w), height: f(h), rx: f(h / 2) }, { stroke: '--cb-steel', sw: 1 });
        } else if (kind % 5 === 1) {
          w = (34 + r() * 20) * at(s, 0.6);
          add(c.svg, 'rect', { x: f(x), y: f(y0), width: f(w), height: f(h), rx: f(h / 2) }, { fill: '--cb-steel' });
          for (var z = 0; z < w; z += 6 * at(s, 0.6)) add(c.svg, 'path', { d: 'M' + f(x + z) + ' ' + f(y0 + h) + 'q' + f(3 * s) + ' ' + f(-h / 2) + ' ' + f(1 * s) + ' ' + f(-h) }, { stroke: '--cb-case', sw: at(2 * s, 1.2) });
        } else if (kind % 5 === 2) {
          w = (20 + r() * 20) * at(s, 0.6);
          add(c.svg, 'rect', { x: f(x), y: f(y0), width: f(w), height: f(h) }, { fill: r() < 0.5 ? '--cb-shop-orange' : '--cb-amber' });
          var zz = 'M' + f(x + 2) + ' ' + f(y0 + h / 2);
          for (var q = 4; q < w - 2; q += 4) zz += 'L' + f(x + q) + ' ' + f(y0 + h * (q % 8 ? 0.3 : 0.7));
          add(c.svg, 'path', { d: zz }, { stroke: '--cb-shop-lime', sw: at(1.4 * s, 1), cls: 'art-glow', d: r() * 3, t: 3.5 });
        } else if (kind % 5 === 3) {
          w = at(16 * s, 10);
          var bh = h * 0.9, by = c.h - 2 - bh;
          add(c.svg, 'path', { d: 'M' + f(x) + ' ' + f(by) + 'h' + f(w) + 'l' + f(-2 * s) + ' ' + f(bh) + 'h' + f(-w + 4 * s) + 'Z' }, { fill: '--cb-shop-gold' });
          add(c.svg, 'path', { d: 'M' + f(x + w * 0.3) + ' ' + f(by) + 'q' + f(w * 0.2) + ' ' + f(-6 * s) + ' ' + f(w * 0.4) + ' 0' }, { stroke: '--cb-shop-gold', sw: at(1.4 * s, 1) });
        } else {
          w = at(8 * s, 5);
          var ar = group(c.svg, {}, { cls: 'art-breathe', d: r() * 2, t: 2.6 });
          add(ar, 'path', { d: 'M' + f(x + w / 2) + ' ' + f(c.h * 0.08) + 'L' + f(x + w / 2) + ' ' + f(c.h * 0.7) }, { stroke: '--cb-amber', sw: at(1.4 * s, 1) });
          add(ar, 'path', { d: 'M' + f(x) + ' ' + f(c.h * 0.62) + 'L' + f(x + w) + ' ' + f(c.h * 0.62) + 'L' + f(x + w / 2) + ' ' + f(c.h * 0.92) + 'Z' }, { fill: '--cb-amber' });
        }
        x += w + 8;
        kind++;
      }
    }
  };

  /* MANSNHOMEPAGE: pastel checks, sunflowers among them, and a crayon
     scribble. The child's drawings on the page are not copied. */
  T.mansn = {
    band: function (c, r) {
      var s = c.s, sq = c.h * 0.5, y0 = c.h * 0.08, x, inks = ['--cb-mansn-pink', '--cb-mansn-yellow', '--cb-mansn-mint', '--cb-mansn-lavender'], i = 0;
      for (x = 0; x < c.w; x += sq, i++) add(c.svg, 'rect', { x: f(x), y: f(y0), width: f(sq + 0.3), height: f(sq) }, { fill: inks[i % 4] });
      var sc = '';
      for (x = 0; x < c.w; x += 7 * at(s, 0.6)) sc += (sc ? 'L' : 'M') + f(x) + ' ' + f(c.h * (0.78 + (r() - 0.5) * 0.16));
      add(c.svg, 'path', { d: sc }, { stroke: '--cb-mansn-crayon', sw: at(1.8 * s, 1.1) });
      for (x = 16 + r() * 30; x < c.w - 10; x += 60 + r() * 60) {
        var cy = y0 + sq / 2, pr = sq * 0.32, fl = group(c.svg, {}, { cls: 'art-sway', d: r() * 4, t: 7 + r() * 3 });
        add(fl, 'path', { d: 'M' + f(x) + ' ' + f(cy) + 'L' + f(x) + ' ' + f(c.h * 0.8) }, { stroke: '--cb-mansn-leaf', sw: at(1.4 * s, 1) });
        add(fl, 'ellipse', { cx: f(x + 3 * s), cy: f(c.h * 0.66), rx: f(3 * s), ry: f(1.6 * s) }, { fill: '--cb-mansn-leaf' });
        for (var p = 0; p < 10; p++) {
          var a = p * Math.PI / 5;
          add(fl, 'circle', { cx: f(x + Math.cos(a) * pr), cy: f(cy + Math.sin(a) * pr), r: f(pr * 0.42) }, { fill: '--cb-mansn-sunflower' });
        }
        add(fl, 'circle', { cx: f(x), cy: f(cy), r: f(pr * 0.55) }, { fill: '--cb-mansn-crayon' });
      }
    }
  };

  /* DOUBLE U FOR W: chalk scribbles on navy, a star or two, an empty speech
     balloon, and a stick figure waving, drawing themselves. */
  T.w = {
    band: function (c, r) {
      var s = c.s, x = 6, grow = growFor(c);
      while (x < c.w - 12) {
        var pick = r(), w = (26 + r() * 40) * at(s, 0.6);
        if (pick < 0.45) {
          var d = 'M' + f(x) + ' ' + f(c.h / 2), cx = x;
          while (cx < x + w) { cx += 3 + r() * 5; d += 'L' + f(cx) + ' ' + f(c.h * (0.2 + r() * 0.6)); }
          add(c.svg, 'path', { d: d, pathLength: 1 }, { stroke: r() < 0.6 ? '--cb-w-chalk' : '--cb-w-dim', sw: at(1.2 * s, 0.8), cls: 'art-grow', d: (x / c.w) * grow, t: 2 });
        } else if (pick < 0.65) {
          add(c.svg, 'path', { d: star5(x + 6 * s, c.h / 2, at(5 * s, 3)), pathLength: 1 }, { stroke: '--cb-w-chalk', sw: at(s, 0.8), cls: 'art-grow', d: (x / c.w) * grow, t: 1.6 });
          w = 14 * at(s, 0.6);
        } else if (pick < 0.82) {
          var bw = 20 * at(s, 0.6), bh = c.h * 0.4;
          add(c.svg, 'path', { d: 'M' + f(x) + ' ' + f(c.h * 0.15) + 'h' + f(bw) + 'v' + f(bh) + 'h' + f(-bw * 0.6) + 'l' + f(-4 * s) + ' ' + f(5 * s) + 'l' + f(1 * s) + ' ' + f(-5 * s) + 'h' + f(-bw * 0.4 + 3 * s) + 'Z', pathLength: 1 },
            { stroke: '--cb-w-chalk', sw: at(s, 0.8), cls: 'art-grow', d: (x / c.w) * grow, t: 1.8 });
          w = bw + 6;
        } else {
          var hy = c.h * 0.24, hr = at(3 * s, 2), fig = group(c.svg, {}, { cls: 'art-sway', d: r() * 3, t: 4 });
          add(fig, 'circle', { cx: f(x + 6 * s), cy: f(hy), r: f(hr) }, { stroke: '--cb-w-chalk', sw: at(s, 0.8) });
          add(fig, 'path', { d: 'M' + f(x + 6 * s) + ' ' + f(hy + hr) + 'L' + f(x + 6 * s) + ' ' + f(c.h * 0.66) +
            'L' + f(x + 2 * s) + ' ' + f(c.h * 0.92) + 'M' + f(x + 6 * s) + ' ' + f(c.h * 0.66) + 'L' + f(x + 10 * s) + ' ' + f(c.h * 0.92) +
            'M' + f(x) + ' ' + f(c.h * 0.42) + 'L' + f(x + 6 * s) + ' ' + f(c.h * 0.5) + 'L' + f(x + 13 * s) + ' ' + f(c.h * 0.3) }, { stroke: '--cb-w-chalk', sw: at(s, 0.8) });
          w = 16 * at(s, 0.6);
        }
        x += w + 6;
      }
    }
  };

  /* BEATNIK TERMITES: a chain of links, as on the page's menu, with guitars,
     drums and notes doodled in red between them. The band is not drawn. */
  T.termites = {
    band: function (c, r) {
      var s = c.s, cy = c.h / 2, lw = at(9 * s, 5), lh = at(5 * s, 3), x = 4, i = 0;
      while (x < c.w - lw) {
        if (c.kind !== 'divider' && i > 0 && r() < 0.12) {
          var pick = r(), d = group(c.svg, {}, { cls: 'art-sway', d: r() * 3, t: 5 });
          if (pick < 0.4) {
            add(d, 'circle', { cx: f(x + 4 * s), cy: f(cy + 3 * s), r: f(at(4 * s, 2.4)) }, { fill: '--cb-termites-red' });
            add(d, 'circle', { cx: f(x + 9 * s), cy: f(cy + 1 * s), r: f(at(3 * s, 1.8)) }, { fill: '--cb-termites-red' });
            add(d, 'path', { d: 'M' + f(x + 10 * s) + ' ' + f(cy) + 'L' + f(x + 22 * s) + ' ' + f(cy - 6 * s) }, { stroke: '--cb-termites-red', sw: at(1.6 * s, 1) });
            x += 26 * s;
          } else if (pick < 0.7) {
            add(d, 'ellipse', { cx: f(x + 7 * s), cy: f(cy + 2 * s), rx: f(at(7 * s, 4)), ry: f(at(5 * s, 3)) }, { fill: '--cb-termites-red' });
            add(d, 'path', { d: 'M' + f(x + 2 * s) + ' ' + f(cy - 7 * s) + 'l' + f(4 * s) + ' ' + f(5 * s) + 'M' + f(x + 13 * s) + ' ' + f(cy - 7 * s) + 'l' + f(-4 * s) + ' ' + f(5 * s) }, { stroke: '--cb-steel', sw: at(s, 0.8) });
            x += 18 * s;
          } else {
            add(d, 'ellipse', { cx: f(x + 3 * s), cy: f(cy + 4 * s), rx: f(at(3 * s, 1.8)), ry: f(at(2.2 * s, 1.4)) }, { fill: '--cb-termites-red' });
            add(d, 'path', { d: 'M' + f(x + 6 * s) + ' ' + f(cy + 4 * s) + 'L' + f(x + 6 * s) + ' ' + f(cy - 8 * s) + 'q' + f(4 * s) + ' ' + f(2 * s) + ' ' + f(5 * s) + ' ' + f(6 * s) }, { stroke: '--cb-termites-red', sw: at(1.2 * s, 0.9) });
            x += 14 * s;
          }
          continue;
        }
        var flat = i % 2 === 0;
        add(c.svg, 'rect', { x: f(x), y: f(flat ? cy - lh / 2 : cy - lh * 0.35), width: f(flat ? lw : lw * 0.55), height: f(flat ? lh : lh * 0.7), rx: f(lh / 2) },
          { stroke: '--cb-termites-chain', sw: at(1.6 * s, 1.1) });
        if (flat) add(c.svg, 'path', { d: 'M' + f(x + lw * 0.3) + ' ' + f(cy - lh / 2 + 0.8) + 'l' + f(lw * 0.3) + ' 0' }, { stroke: '--cb-termites-shine', sw: 0.8 });
        x += (flat ? lw : lw * 0.55) - 1.5;
        i++;
      }
    }
  };

  /* THE GREEN ROOM: table columns with olive borders, as the page has been
     since 1995, and the odd framed square. It stands still. */
  T.greenroom = {
    band: function (c, r) {
      var x = 2, i = 0;
      while (x < c.w - 4) {
        var w = 24 + r() * 50;
        add(c.svg, 'rect', { x: f(x), y: 2, width: f(Math.min(w, c.w - 2 - x)), height: f(c.h - 4) }, { fill: i % 2 ? '--cb-greenroom-green' : '--cb-lcd', stroke: '--cb-greenroom-olive', sw: 1.6 });
        if (r() < 0.35 && w > 30) {
          var sq = c.h * 0.56, sx = x + w / 2 - sq / 2, sy = c.h / 2 - sq / 2;
          add(c.svg, 'rect', { x: f(sx), y: f(sy), width: f(sq), height: f(sq) }, { stroke: '--cb-greenroom-frame', sw: 2 });
          add(c.svg, 'rect', { x: f(sx + 3), y: f(sy + 3), width: f(sq - 6), height: f(sq - 6) }, { stroke: '--cb-amber', sw: 0.8 });
        }
        x += w + 3; i++;
      }
    }
  };

  /* SARAH'S ROOM: a starry blue sky with rainbow stars in it, which down the
     sides is the page's own column of stars. */
  T.sarah = {
    band: function (c, r) {
      var s = c.s, x, inks = ['--cb-sarah-pink', '--cb-sarah-orange', '--cb-amber', '--cb-sarah-green', '--cb-amber-2', '--cb-sarah-violet'];
      for (x = 0; x < c.w; x += 4 + r() * 8) {
        add(c.svg, 'circle', { cx: f(x), cy: f(r() * c.h), r: f(0.5 + r() * 0.6) }, { fill: '--cb-sarah-dot', cls: 'art-twinkle', d: r() * 5, t: 3 + r() * 3 });
      }
      var i = 0;
      for (x = 8 + r() * 10; x < c.w - 6; x += (c.kind === 'left' || c.kind === 'right' ? 16 : 34 + r() * 30), i++) {
        add(c.svg, 'path', { d: star5(x, c.h / 2 + (r() - 0.5) * c.h * 0.2, at(c.h * 0.38, 4)) },
          { fill: inks[i % inks.length], stroke: '--cb-steel', sw: 0.5, cls: 'art-twinkle', d: r() * 4, t: 4 + r() * 2 });
      }
    }
  };

  /* ── RYAN'S FAVOURITE GAMES (2026-10-17) ─────────────────────────────────
     Each band is the game's palette and the shapes of its world, drawn here:
     no character, logo, emblem or symbol of any game's is drawn. */

  /* CASTLE CRASHERS: cartoon castles on a grassy hill, every edge in a thick
     black outline, and pennants flying. */
  T.crashers = {
    band: function (c, r) {
      var s = c.s, x, inks = ['--cb-crashers-red', '--cb-crashers-blue', '--cb-crashers-green', '--cb-crashers-orange'], ow = at(1.6 * s, 1);
      add(c.svg, 'path', { d: wave(c.w, c.h * 0.86, 1.6 * s, 34, 0) + 'L' + (c.w + 10) + ' ' + (c.h + 2) + 'L-10 ' + (c.h + 2) + 'Z' }, { fill: '--cb-crashers-grass', stroke: '--cb-steel', sw: ow });
      for (x = 16 + r() * 30; x < c.w - 16; x += 80 + r() * 70) {
        var tw = at(10 * s, 6), th = c.h * (0.45 + r() * 0.2), ty = c.h * 0.86 - th, ink = inks[Math.floor(r() * 4)];
        add(c.svg, 'rect', { x: f(x), y: f(ty), width: f(tw), height: f(th) }, { fill: '--cb-crashers-stone', stroke: '--cb-steel', sw: ow });
        add(c.svg, 'path', { d: 'M' + f(x - 2 * s) + ' ' + f(ty) + 'L' + f(x + tw / 2) + ' ' + f(ty - th * 0.45) + 'L' + f(x + tw + 2 * s) + ' ' + f(ty) + 'Z' }, { fill: ink, stroke: '--cb-steel', sw: ow });
        add(c.svg, 'rect', { x: f(x + tw * 0.35), y: f(ty + th * 0.35), width: f(tw * 0.3), height: f(th * 0.35), rx: f(tw * 0.15) }, { fill: '--cb-steel' });
        var py = ty - th * 0.45, pf = group(c.svg, {}, { cls: 'art-sway', d: r() * 3, t: 3.5 });
        add(pf, 'path', { d: 'M' + f(x + tw / 2) + ' ' + f(py) + 'l0 ' + f(-6 * s) }, { stroke: '--cb-steel', sw: at(s, 0.8) });
        add(pf, 'path', { d: 'M' + f(x + tw / 2) + ' ' + f(py - 6 * s) + 'l' + f(7 * s) + ' ' + f(2 * s) + 'l' + f(-7 * s) + ' ' + f(2 * s) + 'Z' }, { fill: inks[Math.floor(r() * 4)], stroke: '--cb-steel', sw: at(0.8 * s, 0.6) });
      }
    }
  };

  /* DRAGON AGE: INQUISITION: gold filigree, and green rifts torn in the air,
     glowing slowly. */
  T.inquisition = {
    band: function (c, r) {
      var s = c.s, mid = c.h / 2, x, d = 'M-4 ' + f(mid);
      for (x = 0; x < c.w + 20; x += 20) d += 'C' + f(x + 5) + ' ' + f(mid - 6 * s) + ' ' + f(x + 15) + ' ' + f(mid + 6 * s) + ' ' + f(x + 20) + ' ' + f(mid);
      add(c.svg, 'path', { d: d }, { stroke: '--cb-amber', sw: at(s, 0.7) });
      for (x = 10; x < c.w; x += 20) add(c.svg, 'circle', { cx: f(x), cy: f(mid), r: f(at(1.2 * s, 0.8)) }, { fill: '--cb-amber' });
      for (x = 40 + r() * 50; x < c.w - 10; x += 90 + r() * 80) {
        var h = c.h * 0.86, top = (c.h - h) / 2, rw = at(6 * s, 3.5), pts = [];
        for (var k = 0; k <= 6; k++) pts.push([x + (k % 2 ? rw : -rw) * (0.3 + r() * 0.7) * Math.sin(Math.PI * k / 6), top + h * k / 6]);
        var tear = 'M' + pts.map(function (p) { return f(p[0]) + ' ' + f(p[1]); }).join('L') + 'Z';
        add(c.svg, 'path', { d: tear }, { fill: '--cb-inquisition-rift', cls: 'art-glow', d: r() * 3, t: 4.5 });
        add(c.svg, 'path', { d: 'M' + f(x) + ' ' + f(top + h * 0.15) + 'L' + f(x + rw * 0.2) + ' ' + f(mid) + 'L' + f(x - rw * 0.1) + ' ' + f(top + h * 0.85) }, { stroke: '--cb-inquisition-riftglow', sw: at(s, 0.8) });
      }
    }
  };

  /* METROID: blue cavern rock, round doors, energy squares and a seam of lava. */
  T.metroid = {
    band: function (c, r) {
      var s = c.s, b = at(7 * s, 6), x, y;
      for (x = 0; x < c.w; x += b) {
        for (y = c.h - b; y > c.h * 0.3; y -= b) {
          if (r() < 0.25 && y < c.h - b) continue;
          add(c.svg, 'rect', { x: f(x), y: f(y), width: f(b - 0.6), height: f(b - 0.6), rx: f(b * 0.3) }, { fill: r() < 0.7 ? '--cb-metroid-rock' : '--cb-metroid-teal' });
          add(c.svg, 'circle', { cx: f(x + b * 0.35), cy: f(y + b * 0.35), r: f(b * 0.12) }, { fill: '--cb-case' });
        }
      }
      add(c.svg, 'rect', { x: 0, y: f(c.h - 1.6 * s), width: c.w, height: f(1.6 * s) }, { fill: '--cb-metroid-lava', cls: 'art-glow', t: 5 });
      for (x = 40 + r() * 40; x < c.w - 10; x += 110 + r() * 80) {
        add(c.svg, 'ellipse', { cx: f(x), cy: f(c.h * 0.5), rx: f(at(3 * s, 2)), ry: f(c.h * 0.36) }, { fill: '--cb-amber-2', stroke: '--cb-steel', sw: at(s, 0.8) });
      }
      for (x = 20 + r() * 30; x < c.w; x += 60 + r() * 60) {
        add(c.svg, 'rect', { x: f(x), y: f(c.h * 0.15), width: f(at(3 * s, 2)), height: f(at(3 * s, 2)) }, { fill: '--cb-metroid-pink', cls: 'art-twinkle', d: r() * 3, t: 3 });
      }
    }
  };

  /* MEGA MAN: riveted panels, ladders, pipes, and an energy meter filling in
     turn. */
  T.megaman = {
    band: function (c, r) {
      var s = c.s, x = 4, kind = 0;
      if (c.kind === 'top' || c.kind === 'left' || c.kind === 'right') {
        for (var m = 0; m < 14; m++) add(c.svg, 'rect', { x: f(x + m * 4 * at(s, 0.6)), y: f(c.h * 0.25), width: f(2.6 * at(s, 0.6)), height: f(c.h * 0.5) }, { fill: '--cb-megaman-meter', cls: 'art-glow', d: m * 0.2, t: 3 });
        x += 14 * 4 * at(s, 0.6) + 10;
      }
      while (x < c.w - 10) {
        var w;
        if (kind % 3 === 0) {
          w = (26 + r() * 30) * at(s, 0.6);
          add(c.svg, 'rect', { x: f(x), y: f(c.h * 0.15), width: f(w), height: f(c.h * 0.7) }, { fill: '--cb-megaman-blue', stroke: '--cb-megaman-metal', sw: at(s, 0.8) });
          [[0.12, 0.25], [0.88, 0.25], [0.12, 0.75], [0.88, 0.75]].forEach(function (p) {
            add(c.svg, 'circle', { cx: f(x + w * p[0]), cy: f(c.h * (0.15 + 0.7 * p[1])), r: f(at(s, 0.8)) }, { fill: '--cb-megaman-metal' });
          });
        } else if (kind % 3 === 1) {
          w = at(9 * s, 6);
          add(c.svg, 'path', { d: 'M' + f(x) + ' 0L' + f(x) + ' ' + c.h + 'M' + f(x + w) + ' 0L' + f(x + w) + ' ' + c.h }, { stroke: '--cb-megaman-metal', sw: at(1.4 * s, 1) });
          for (var g = 3; g < c.h; g += 5 * at(s, 0.6)) add(c.svg, 'path', { d: 'M' + f(x) + ' ' + f(g) + 'L' + f(x + w) + ' ' + f(g) }, { stroke: '--cb-megaman-metal', sw: at(s, 0.8) });
        } else {
          w = (30 + r() * 30) * at(s, 0.6);
          add(c.svg, 'rect', { x: f(x), y: f(c.h * 0.38), width: f(w), height: f(c.h * 0.24), rx: f(c.h * 0.12) }, { fill: '--cb-megaman-green' });
          add(c.svg, 'rect', { x: f(x + w * 0.4), y: f(c.h * 0.32), width: f(4 * s), height: f(c.h * 0.36) }, { fill: '--cb-megaman-metal' });
        }
        x += w + 8; kind++;
      }
    }
  };

  /* FABLE III: a golden trail glowing its way over cobbles, beside ironwork. */
  T.fable = {
    band: function (c, r) {
      var s = c.s, x;
      for (x = 0; x < c.w; x += (9 + r() * 6) * at(s, 0.6)) {
        add(c.svg, 'rect', { x: f(x), y: f(c.h * 0.74), width: f((7 + r() * 4) * at(s, 0.6)), height: f(c.h * 0.2), rx: f(c.h * 0.08) }, { fill: '--cb-fable-cobble' });
      }
      for (x = 30 + r() * 30; x < c.w - 20; x += 120 + r() * 80) {
        var iw = 30 * at(s, 0.6);
        add(c.svg, 'path', { d: 'M' + f(x) + ' ' + f(c.h * 0.7) + 'L' + f(x) + ' ' + f(c.h * 0.15) + 'M' + f(x + iw) + ' ' + f(c.h * 0.7) + 'L' + f(x + iw) + ' ' + f(c.h * 0.15) +
          'M' + f(x) + ' ' + f(c.h * 0.25) + 'q' + f(iw / 2) + ' ' + f(-c.h * 0.2) + ' ' + f(iw) + ' 0M' + f(x + iw / 2) + ' ' + f(c.h * 0.7) + 'L' + f(x + iw / 2) + ' ' + f(c.h * 0.22) }, { stroke: '--cb-fable-iron', sw: at(1.4 * s, 1) });
      }
      var ty = c.h * 0.5;
      for (x = 2; x < c.w; x += 4 * at(s, 0.7)) {
        var y = ty + Math.sin(x / 26) * c.h * 0.16;
        add(c.svg, 'circle', { cx: f(x), cy: f(y), r: f(at(1.1 * s, 0.7)) }, { fill: r() < 0.15 ? '--cb-fable-glow' : '--cb-fable-trail', cls: 'art-twinkle', d: (x / c.w) * 4, t: 2.6 });
      }
    }
  };

  /* SKYRIM: snowy peaks, an aurora over them, knotwork along the dividers,
     and snow falling. */
  T.skyrim = {
    band: function (c, r) {
      var s = c.s, x;
      if (c.kind === 'divider') {
        for (x = 4; x < c.w - 6; x += 9 * at(s, 0.6)) add(c.svg, 'circle', { cx: f(x), cy: f(c.h / 2), r: f(5 * at(s, 0.6)) }, { stroke: '--cb-skyrim-knot', sw: at(s, 0.8) });
        return;
      }
      add(c.svg, 'path', { d: wave(c.w, c.h * 0.22, c.h * 0.08, 30, 0) }, { stroke: '--cb-skyrim-aurora', sw: at(3 * s, 1.6), cls: 'art-glow', t: 7 });
      var d = 'M-4 ' + c.h, sx = -4;
      while (sx < c.w + 10) {
        var pw = (24 + r() * 30) * at(s, 0.6), ph = c.h * (0.35 + r() * 0.4);
        add(c.svg, 'path', { d: 'M' + f(sx) + ' ' + c.h + 'L' + f(sx + pw / 2) + ' ' + f(c.h - ph) + 'L' + f(sx + pw) + ' ' + c.h + 'Z' }, { fill: '--cb-skyrim-peak' });
        add(c.svg, 'path', { d: 'M' + f(sx + pw * 0.34) + ' ' + f(c.h - ph * 0.68) + 'L' + f(sx + pw / 2) + ' ' + f(c.h - ph) + 'L' + f(sx + pw * 0.66) + ' ' + f(c.h - ph * 0.68) + 'L' + f(sx + pw * 0.56) + ' ' + f(c.h - ph * 0.6) + 'L' + f(sx + pw * 0.46) + ' ' + f(c.h - ph * 0.72) + 'Z' }, { fill: '--cb-skyrim-snow' });
        sx += pw * 0.7;
      }
      for (x = r() * 10; x < c.w; x += 10 + r() * 14) {
        add(c.svg, 'circle', { cx: f(x), cy: f(r() * c.h * 0.4), r: f(at(0.8 * s, 0.6)) }, { fill: '--cb-skyrim-snow', cls: 'art-fall', d: r() * 6, t: 6 + r() * 4, run: Math.round(c.h * 0.7) });
      }
    }
  };

  /* DOOM: riveted metal plate, toxic slime, and fire that glows and never
     flickers. */
  T.doom = {
    band: function (c, r) {
      var s = c.s, x;
      add(c.svg, 'rect', { x: 0, y: f(c.h * 0.12), width: c.w, height: f(c.h * 0.5) }, { fill: '--cb-doom-metal' });
      for (x = 0; x < c.w; x += 40 * at(s, 0.6)) {
        add(c.svg, 'path', { d: 'M' + f(x) + ' ' + f(c.h * 0.12) + 'l0 ' + f(c.h * 0.5) }, { stroke: '--cb-case', sw: 1 });
        add(c.svg, 'circle', { cx: f(x + 5 * s), cy: f(c.h * 0.22), r: f(at(s, 0.7)) }, { fill: '--cb-doom-rivet' });
        add(c.svg, 'circle', { cx: f(x + 5 * s), cy: f(c.h * 0.52), r: f(at(s, 0.7)) }, { fill: '--cb-doom-rivet' });
      }
      add(c.svg, 'path', { d: wave(c.w, c.h * 0.84, 1.4 * s, 12, 0) + 'L' + (c.w + 10) + ' ' + (c.h + 2) + 'L-10 ' + (c.h + 2) + 'Z' }, { fill: '--cb-doom-slime', cls: 'art-glow', t: 6 });
      for (x = 30 + r() * 40; x < c.w - 10; x += 70 + r() * 70) {
        var fh = c.h * (0.5 + r() * 0.3), fw = at(5 * s, 3), fy = c.h * 0.84, fl = group(c.svg, {}, { cls: 'art-glow', d: r() * 3, t: 3 });
        add(fl, 'path', { d: 'M' + f(x - fw) + ' ' + f(fy) + 'Q' + f(x - fw) + ' ' + f(fy - fh * 0.5) + ' ' + f(x) + ' ' + f(fy - fh) + 'Q' + f(x + fw) + ' ' + f(fy - fh * 0.5) + ' ' + f(x + fw) + ' ' + f(fy) + 'Z' }, { fill: '--cb-doom-fire' });
        add(fl, 'path', { d: 'M' + f(x - fw * 0.4) + ' ' + f(fy) + 'Q' + f(x - fw * 0.4) + ' ' + f(fy - fh * 0.3) + ' ' + f(x) + ' ' + f(fy - fh * 0.55) + 'Q' + f(x + fw * 0.4) + ' ' + f(fy - fh * 0.3) + ' ' + f(x + fw * 0.4) + ' ' + f(fy) + 'Z' }, { fill: '--cb-doom-flame' });
      }
    }
  };

  /* PORTAL: white test-chamber panels, and a blue portal and an orange one
     glowing in them. */
  T.portal = {
    band: function (c, r) {
      var s = c.s, pw = at(22 * s, 12), x, i = 0;
      for (x = 0; x < c.w; x += pw) add(c.svg, 'rect', { x: f(x + 0.6), y: f(c.h * 0.08), width: f(pw - 1.2), height: f(c.h * 0.84) }, { fill: '--cb-portal-panel', stroke: '--cb-portal-seam', sw: 0.8 });
      for (x = 30 + r() * 40; x < c.w - 10; x += 90 + r() * 80, i++) {
        var k = i % 2 ? '--cb-portal-orange' : '--cb-portal-blue';
        add(c.svg, 'ellipse', { cx: f(x), cy: f(c.h / 2), rx: f(at(5 * s, 3)), ry: f(c.h * 0.38) }, { fill: '--cb-lcd', stroke: k, sw: at(2.4 * s, 1.4), cls: 'art-glow', d: r() * 3, t: 4 });
      }
    }
  };

  /* THE WITCHER 3: dark pines against the night, a moon, and mist drifting. */
  T.witcher = {
    band: function (c, r) {
      var s = c.s, x;
      if (c.kind === 'top') add(c.svg, 'circle', { cx: f(c.w - 30), cy: f(c.h * 0.32), r: f(c.h * 0.2) }, { fill: r() < 0.2 ? '--cb-witcher-blood' : '--cb-witcher-moon' });
      for (x = -4; x < c.w + 4; x += (7 + r() * 9) * at(s, 0.6)) {
        var th = c.h * (0.45 + r() * 0.5), tw = th * 0.42, base = c.h;
        add(c.svg, 'path', { d: 'M' + f(x) + ' ' + f(base - th) + 'L' + f(x + tw / 2) + ' ' + f(base - th * 0.55) + 'L' + f(x + tw * 0.3) + ' ' + f(base - th * 0.55) + 'L' + f(x + tw * 0.62) + ' ' + f(base - th * 0.12) + 'L' + f(x - tw * 0.62) + ' ' + f(base - th * 0.12) + 'L' + f(x - tw * 0.3) + ' ' + f(base - th * 0.55) + 'L' + f(x - tw / 2) + ' ' + f(base - th * 0.55) + 'Z' },
          { fill: '--cb-witcher-pine', stroke: '--cb-steel-2', sw: 0.5 });
      }
      for (x = r() * 60; x < c.w; x += 120 + r() * 80) {
        add(c.svg, 'path', { d: 'M' + f(x) + ' ' + f(c.h * 0.7) + 'q' + f(20 * s) + ' ' + f(-4 * s) + ' ' + f(40 * s) + ' 0q' + f(20 * s) + ' ' + f(4 * s) + ' ' + f(40 * s) + ' 0' },
          { stroke: '--cb-witcher-mist', sw: at(2.4 * s, 1.4), cls: 'art-flow', d: r() * 6, t: 14, run: 40 });
      }
    }
  };

  /* GRAND THEFT AUTO V: a sunset in four bands, the sun going down into it, a
     city skyline, and palm trees swaying. */
  T.gta = {
    band: function (c, r) {
      var s = c.s, x, bands = ['--cb-gta-sun4', '--cb-gta-sun3', '--cb-gta-sun2', '--cb-gta-sun1'];
      bands.forEach(function (k, i) { add(c.svg, 'rect', { x: 0, y: f(c.h * i / 4), width: c.w, height: f(c.h / 4 + 0.5) }, { fill: k }); });
      if (c.kind !== 'divider') add(c.svg, 'circle', { cx: f(c.w * 0.62), cy: f(c.h * 0.86), r: f(c.h * 0.3) }, { fill: '--cb-gta-sun1' });
      for (x = 0; x < c.w; x += (6 + r() * 10) * at(s, 0.6)) {
        var bh = c.h * (0.15 + r() * 0.35);
        add(c.svg, 'rect', { x: f(x), y: f(c.h - bh), width: f((5 + r() * 7) * at(s, 0.6)), height: f(bh) }, { fill: '--cb-gta-city' });
      }
      for (x = 20 + r() * 30; x < c.w - 10; x += 60 + r() * 60) {
        var p = group(c.svg, {}, { cls: 'art-sway', d: r() * 3, t: 5 + r() * 2 }), top = c.h * 0.18;
        add(p, 'path', { d: 'M' + f(x) + ' ' + c.h + 'Q' + f(x + 3 * s) + ' ' + f(c.h * 0.6) + ' ' + f(x + 2 * s) + ' ' + f(top) }, { stroke: '--cb-gta-palm', sw: at(1.6 * s, 1) });
        [-1, 1].forEach(function (dir) {
          add(p, 'path', { d: 'M' + f(x + 2 * s) + ' ' + f(top) + 'q' + f(dir * 6 * s) + ' ' + f(-3 * s) + ' ' + f(dir * 10 * s) + ' ' + f(3 * s) + 'M' + f(x + 2 * s) + ' ' + f(top) + 'q' + f(dir * 4 * s) + ' ' + f(-6 * s) + ' ' + f(dir * 6 * s) + ' ' + f(-3 * s) }, { stroke: '--cb-gta-palm', sw: at(1.4 * s, 1) });
        });
      }
    }
  };

  /* THE LEGEND OF ZELDA: the overworld, round trees, rocks and a stretch of
     water glinting. */
  T.loz = {
    band: function (c, r) {
      var s = c.s, x = 4, kind;
      while (x < c.w - 8) {
        kind = r();
        var w;
        if (kind < 0.5) {
          w = at(12 * s, 7);
          add(c.svg, 'rect', { x: f(x + w * 0.4), y: f(c.h * 0.62), width: f(w * 0.2), height: f(c.h * 0.26) }, { fill: '--cb-loz-trunk' });
          add(c.svg, 'circle', { cx: f(x + w / 2), cy: f(c.h * 0.44), r: f(w * 0.48) }, { fill: '--cb-loz-tree' });
          add(c.svg, 'circle', { cx: f(x + w * 0.35), cy: f(c.h * 0.36), r: f(w * 0.12) }, { fill: '--cb-case' });
        } else if (kind < 0.8) {
          w = at(10 * s, 6);
          add(c.svg, 'path', { d: 'M' + f(x) + ' ' + f(c.h * 0.88) + 'L' + f(x + w * 0.15) + ' ' + f(c.h * 0.45) + 'L' + f(x + w * 0.6) + ' ' + f(c.h * 0.35) + 'L' + f(x + w) + ' ' + f(c.h * 0.6) + 'L' + f(x + w) + ' ' + f(c.h * 0.88) + 'Z' }, { fill: '--cb-loz-rock' });
        } else {
          w = (24 + r() * 26) * at(s, 0.6);
          add(c.svg, 'rect', { x: f(x), y: f(c.h * 0.55), width: f(w), height: f(c.h * 0.33) }, { fill: '--cb-loz-water' });
          add(c.svg, 'path', { d: 'M' + f(x + w * 0.2) + ' ' + f(c.h * 0.68) + 'l' + f(w * 0.2) + ' 0M' + f(x + w * 0.55) + ' ' + f(c.h * 0.78) + 'l' + f(w * 0.2) + ' 0' }, { stroke: '--cb-lcd', sw: at(s, 0.8), cls: 'art-glow', d: r() * 3, t: 3.5 });
        }
        x += w + 5;
      }
    }
  };

  /* KELP FOREST (2026-10-18), to pair with the otter profile effect: kelp
     rising through green water to the light, with its floats, bubbles going
     up, and now and then a sea otter floating on its back at the surface, a
     strand of kelp across it, because the kelp does the holding (the Arcade's
     Otterly Adorbs says why). Nothing about the otters is scored or earned:
     floating fills nothing. */
  function kelpOtter(svg, x, y, k) {
    var o = group(svg, {}, { cls: 'art-sway', d: (x % 7) * 0.4, t: 6 });
    add(o, 'ellipse', { cx: f(x - 13.5 * k), cy: f(y - 0.4 * k), rx: f(3.4 * k), ry: f(1.2 * k) }, { fill: '--cb-kelp-fur-2', stroke: '--cb-kelp-nose', sw: at(0.4 * k, 0.3) });
    add(o, 'ellipse', { cx: f(x), cy: f(y), rx: f(11 * k), ry: f(3.8 * k) }, { fill: '--cb-kelp-fur', stroke: '--cb-kelp-nose', sw: at(0.5 * k, 0.35) });
    [[-9.4, -16], [-7.4, 10]].forEach(function (ft) {
      add(o, 'ellipse', { cx: f(x + ft[0] * k), cy: f(y - 3.8 * k), rx: f(1.2 * k), ry: f(2.3 * k), transform: 'rotate(' + ft[1] + ' ' + f(x + ft[0] * k) + ' ' + f(y - 3.8 * k) + ')' }, { fill: '--cb-kelp-fur-2', stroke: '--cb-kelp-nose', sw: at(0.4 * k, 0.3) });
    });
    add(o, 'circle', { cx: f(x + 11 * k), cy: f(y - 1.4 * k), r: f(3.9 * k) }, { fill: '--cb-kelp-face', stroke: '--cb-kelp-nose', sw: at(0.5 * k, 0.35) });
    add(o, 'circle', { cx: f(x + 9.2 * k), cy: f(y - 4.6 * k), r: f(0.9 * k) }, { fill: '--cb-kelp-fur', stroke: '--cb-kelp-nose', sw: at(0.3 * k, 0.25) });
    add(o, 'path', { d: 'M' + f(x + 10.2 * k) + ' ' + f(y - 2.6 * k) + 'q' + f(0.7 * k) + ' ' + f(-0.7 * k) + ' ' + f(1.4 * k) + ' 0' }, { stroke: '--cb-kelp-nose', sw: at(0.45 * k, 0.3) });
    add(o, 'ellipse', { cx: f(x + 14.5 * k), cy: f(y - 1.8 * k), rx: f(0.9 * k), ry: f(0.7 * k) }, { fill: '--cb-kelp-nose' });
    [[4.4, -3.6], [6.6, -3.4]].forEach(function (pw) {
      add(o, 'ellipse', { cx: f(x + pw[0] * k), cy: f(y + pw[1] * k), rx: f(1.3 * k), ry: f(1 * k) }, { fill: '--cb-kelp-fur-2', stroke: '--cb-kelp-nose', sw: at(0.35 * k, 0.25) });
    });
    add(o, 'path', { d: 'M' + f(x - 7 * k) + ' ' + f(y + 3 * k) + 'Q' + f(x) + ' ' + f(y - 4.8 * k) + ' ' + f(x + 7 * k) + ' ' + f(y + 3.2 * k) }, { stroke: '--cb-kelp-blade', sw: at(1.2 * k, 0.8) });
  }
  T.kelp = {
    band: function (c, r) {
      var s = c.s, x, surf = c.kind === 'top' || c.h >= 40;
      // light falling slant-wise through the water, breathing slowly
      for (x = r() * 60; x < c.w; x += 90 + r() * 90) {
        add(c.svg, 'path', { d: 'M' + f(x) + ' 0L' + f(x + 12 * s) + ' 0L' + f(x + 30 * s) + ' ' + f(c.h) + 'L' + f(x + 16 * s) + ' ' + f(c.h) + 'Z', 'fill-opacity': '.1' }, { fill: '--cb-kelp-light', cls: 'art-glow', d: r() * 4, t: 10 });
      }
      if (surf) add(c.svg, 'path', { d: wave(c.w, c.h * 0.16, 0.6 * s, 14, 0) }, { stroke: '--cb-kelp-light', sw: at(0.8 * s, 0.6) });
      // the kelp, each stalk swaying, with its blades and floats
      for (x = r() * 16; x < c.w; x += (22 + r() * 34) * at(s, 0.6)) {
        var top = c.h * (surf ? 0.16 : 0.06), kelp = group(c.svg, {}, { cls: 'art-sway', d: r() * 4, t: 6 + r() * 2 }), lean = (r() - 0.5) * 6 * s;
        add(kelp, 'path', { d: 'M' + f(x) + ' ' + f(c.h) + 'Q' + f(x + lean) + ' ' + f((c.h + top) / 2) + ' ' + f(x + lean * 0.4) + ' ' + f(top) }, { stroke: '--cb-kelp-stipe', sw: at(1.1 * s, 0.8) });
        for (var y = c.h - 6 * s, i = 0; y > top + 3 * s; y -= at(7 * s, 4), i++) {
          var bx = x + lean * (1 - (y - top) / (c.h - top)) * 1.2, dir = i % 2 ? 1 : -1;
          add(kelp, 'path', { d: 'M' + f(bx) + ' ' + f(y) + 'q' + f(dir * 5 * s) + ' ' + f(-2.4 * s) + ' ' + f(dir * 7 * s) + ' ' + f(-5.6 * s) + 'q' + f(-dir * 4 * s) + ' ' + f(1.2 * s) + ' ' + f(-dir * 7 * s) + ' ' + f(5.6 * s) + 'Z' }, { fill: '--cb-kelp-blade' });
          if (i % 2 === 0) add(kelp, 'circle', { cx: f(bx + dir * 1.4 * s), cy: f(y - 0.6 * s), r: f(at(1.1 * s, 0.7)) }, { fill: '--cb-kelp-float' });
        }
      }
      // bubbles
      for (x = r() * 30; x < c.w; x += 26 + r() * 40) {
        add(c.svg, 'circle', { cx: f(x), cy: f(c.h * (0.3 + r() * 0.6)), r: f(at((0.6 + r() * 0.9) * s, 0.6)) }, { stroke: '--cb-kelp-bubble', sw: at(0.4 * s, 0.35), cls: 'art-twinkle', d: r() * 4, t: 4 + r() * 2 });
      }
      // an otter floating at the surface now and then, where there is a surface
      if (surf) {
        for (x = 70 + r() * 80; x < c.w - 30; x += 230 + r() * 200) kelpOtter(c.svg, x, c.h * 0.17, at(c.h / 30 * 0.62, 0.5));
      }
    }
  };

  /* FAIRY LIGHTS (2026-10-19), from the Fairy lights frame for profiles
     (profile.js's F.lights), to pair with the profile effect Flying Fairy:
     the frame's string of lights, a wire swagged between hooks with a socket
     and a bulb hanging at a quarter and three quarters of every swag, drawn at
     whatever height its strip has, so it is the radio's trims, a profile's
     banner and the nameplate under a name on Who's online. A strip tall enough
     takes more than one string, and stars between them. The bulbs come in the
     theme's gold and rose and four more, each with a little glow, and twinkle
     slowly where the radio's drawings move; nothing flashes. */
  var FAIRY_BULBS = ['--cb-amber', '--cb-amber-2', '--cb-fairy-mint', '--cb-fairy-lilac', '--cb-fairy-sky', '--cb-fairy-peach'];
  function fairyString(svg, w, y0, sag, k, r, from) {
    var P = 36 * k, x, n = from;
    for (x = -P * r(); x < w + P; x += P) {
      add(svg, 'path', { d: 'M' + f(x) + ' ' + f(y0) + 'Q' + f(x + P / 2) + ' ' + f(y0 + sag) + ' ' + f(x + P) + ' ' + f(y0) }, { stroke: '--cb-fairy-wire', sw: at(1.2 * k, 0.7) });
      [0.25, 0.75].forEach(function (t) {
        var bx = x + P * t, by = y0 + 2 * t * (1 - t) * sag, ink = FAIRY_BULBS[n++ % FAIRY_BULBS.length];
        if (bx < -6 * k || bx > w + 6 * k) return;
        add(svg, 'circle', { cx: f(bx), cy: f(by + 7.6 * k), r: f(6.2 * k), 'fill-opacity': '.2' }, { fill: ink, cls: 'art-glow', d: r() * 4, t: 4 + r() * 2 });
        add(svg, 'rect', { x: f(bx - 1.3 * k), y: f(by), width: f(2.6 * k), height: f(2.2 * k), rx: f(0.4 * k) }, { fill: '--cb-fairy-socket' });
        add(svg, 'ellipse', { cx: f(bx), cy: f(by + 5.6 * k), rx: f(2.6 * k), ry: f(3.4 * k) }, { fill: ink, cls: 'art-twinkle', d: r() * 4, t: 3.6 + r() * 1.6 });
        add(svg, 'ellipse', { cx: f(bx - 0.8 * k), cy: f(by + 4.4 * k), rx: f(0.7 * k), ry: f(1.1 * k), 'fill-opacity': '.7' }, { fill: '--cb-steel' });
      });
    }
  }
  T.fairy = {
    band: function (c, r) {
      var rows = c.h >= 44 ? Math.max(2, Math.floor(c.h / 34)) : 1, gap = c.h / rows, i;
      var k = rows > 1 ? Math.min(1.5, gap / 22) : Math.max(0.55, Math.min(1.5, c.h / 20));
      // stars between the strings, where there is room for them
      if (rows > 1) {
        for (var x = r() * 20; x < c.w; x += 14 + r() * 26) {
          var sy = r() * c.h, big = r() < 0.18;
          if (big) add(c.svg, 'path', { d: sparkle(x, sy, at(2.2 * k, 1.2)) }, { fill: r() < 0.5 ? '--cb-steel-2' : '--cb-amber', cls: 'art-twinkle', d: r() * 4, t: 4 + r() * 2 });
          else add(c.svg, 'circle', { cx: f(x), cy: f(sy), r: f(at((0.4 + r() * 0.5) * k, 0.4)) }, { fill: '--cb-steel-2', cls: r() < 0.4 ? 'art-twinkle' : '', d: r() * 4, t: 5 });
        }
      }
      for (i = 0; i < rows; i++) {
        var y0 = (rows > 1 ? gap * i + gap * 0.12 : c.h * 0.08), sag = 10 * k * (rows > 1 ? 0.8 + r() * 0.5 : 1);
        fairyString(c.svg, c.w, y0, sag, k, r, i * 2);
      }
    }
  };

  /* CLOUD CITY (2026-10-23), after the city in the clouds of Bespin in The
     Empire Strikes Back (1980), to pair with the profile effect of the same
     name, in randocloud.cloud's navy, cream, gold, peach and rose: dusk over a
     sea of cloud with the afterglow lying along it, now and then a striped sun
     going down behind it, the city standing out of the cloud on its stalk with
     its windows lit, and cloud cars holding station. Star Wars is a trade mark
     of Lucasfilm, and the drawing is ours: nobody from the films is drawn and
     no emblem of theirs. Where drawings move, the sun's glow breathes, some
     windows come and go and the cars drift a little forward and back, never
     round a loop; nothing flashes. */
  // A striped sun: bars of the circle, thinning and parting towards its foot,
  // [from, to] in radii down from its top, and the ink of each.
  var CC_CUTS = [[0, .62], [.7, .98], [1.08, 1.3], [1.42, 1.58], [1.72, 1.84]];
  var CC_SUN = ['--cb-amber', '--cb-amber', '--cb-amber-2', '--cb-amber-2', '--cb-cloud-rose'];
  var CC_FEW = [[0, .9], [1.08, 1.38], [1.56, 1.8]];
  var CC_SUN_FEW = ['--cb-amber', '--cb-amber-2', '--cb-cloud-rose'];
  // the afterglow's lines, from the cloud upwards
  var CC_GLOW = ['--cb-amber', '--cb-amber-2', '--cb-cloud-rose', '--cb-cloud-dusk', '--cb-cloud-dusk'];
  // A slice of a circle between two heights, traced round its edge, so a
  // striped sun needs no clipping.
  function ccSlice(cx, cy, R, y0, y1) {
    var n = Math.max(3, Math.ceil((y1 - y0) / R * 12)), L = [], Rt = [], i, y, dx;
    for (i = 0; i <= n; i++) {
      y = y0 + (y1 - y0) * i / n;
      dx = Math.sqrt(Math.max(0, R * R - (y - cy) * (y - cy)));
      L.push(f(cx - dx) + ' ' + f(y));
      Rt.unshift(f(cx + dx) + ' ' + f(y));
    }
    return 'M' + L.concat(Rt).join('L') + 'Z';
  }
  function ccSun(svg, cx, cy, R, r) {
    var glow = group(svg, {}, { cls: 'art-glow', d: r() * 4, t: 9 });
    add(glow, 'circle', { cx: f(cx), cy: f(cy), r: f(R * 1.6), 'fill-opacity': '.12' }, { fill: '--cb-amber' });
    add(glow, 'circle', { cx: f(cx), cy: f(cy), r: f(R * 1.25), 'fill-opacity': '.16' }, { fill: '--cb-amber-2' });
    var few = R < 9, cuts = few ? CC_FEW : CC_CUTS, inks = few ? CC_SUN_FEW : CC_SUN;
    cuts.forEach(function (b, i) {
      add(svg, 'path', { d: ccSlice(cx, cy, R, cy - R + b[0] * R, cy - R + b[1] * R) }, { fill: inks[i] });
    });
  }
  // [across from the middle, how tall, how wide] in sixteenths of the city's
  // half-width: towers crowded on the deck, the highest near its middle.
  var CC_TOWERS = [[-12, 2.6, 2.6], [-9.4, 4.6, 2.4], [-6.8, 7, 2.6], [-4.2, 9.6, 2.4], [-1.6, 12.2, 2.4], [.8, 15, 2],
    [3.2, 11, 2.6], [5.8, 8.4, 2.4], [8.4, 6, 2.6], [11, 3.6, 2.4], [13.2, 2, 2.2]];
  // THE CITY ON ITS STALK, its deck's middle at cx y and R from there to its
  // rim: the underside narrowing into a stalk that goes down to base, the
  // towers, the deck, the rim catching the sunset under it, and its windows.
  function ccCity(svg, cx, y, R, base, r) {
    var s = R / 16, lw = at(.18 * s, .4);
    add(svg, 'rect', { x: f(cx - 1.3 * s), y: f(y + 4 * s), width: f(2.6 * s), height: f(Math.max(0, base - y - 4 * s)) }, { fill: '--cb-cloud-stalk' });
    add(svg, 'path', { d: 'M' + f(cx - R) + ' ' + f(y) + 'C' + f(cx - R * .7) + ' ' + f(y + 3 * s) + ' ' + f(cx - 3 * s) + ' ' + f(y + 3.4 * s) + ' ' + f(cx - 1.8 * s) + ' ' + f(y + 7 * s) +
      'L' + f(cx + 1.8 * s) + ' ' + f(y + 7 * s) + 'C' + f(cx + 3 * s) + ' ' + f(y + 3.4 * s) + ' ' + f(cx + R * .7) + ' ' + f(y + 3 * s) + ' ' + f(cx + R) + ' ' + f(y) + 'Z' },
      { fill: '--cb-cloud-tower-2' });
    CC_TOWERS.forEach(function (t) {
      var tx = cx + t[0] * s, tw = t[2] * s, th = t[1] * s;
      add(svg, 'rect', { x: f(tx - tw / 2), y: f(y - th), width: f(tw), height: f(th + s), rx: f(Math.min(tw / 2, .8 * s)) }, { fill: '--cb-cloud-tower', stroke: '--cb-cloud-line', sw: lw });
      add(svg, 'rect', { x: f(tx + tw * .1), y: f(y - th + .6 * s), width: f(tw * .34), height: f(th - .6 * s), 'fill-opacity': '.75' }, { fill: '--cb-cloud-tower-2' });
      // a tower big enough to see into has windows up it, some lit
      if (s > 1.2) {
        for (var wy = y - th + 1.4 * s; wy < y - s; wy += 1.8 * s) {
          if (r() < .55) add(svg, 'rect', { x: f(tx - tw * .3), y: f(wy), width: f(tw * .34), height: f(.7 * s) }, { fill: '--cb-cloud-window', cls: r() < .3 ? 'art-twinkle' : '', d: r() * 6, t: 7 + r() * 3 });
        }
      }
    });
    add(svg, 'ellipse', { cx: f(cx), cy: f(y), rx: f(R), ry: f(1.7 * s) }, { fill: '--cb-cloud-tower', stroke: '--cb-cloud-line', sw: lw });
    add(svg, 'path', { d: 'M' + f(cx - R) + ' ' + f(y) + 'A' + f(R) + ' ' + f(1.7 * s) + ' 0 0 0 ' + f(cx + R) + ' ' + f(y) }, { stroke: '--cb-amber-2', sw: at(.5 * s, .6) });
    for (var wx = cx - R + 2 * s, i = 0; wx < cx + R - 1.6 * s; wx += 2.4 * s, i++) {
      add(svg, 'circle', { cx: f(wx), cy: f(y + .2 * s), r: f(at(.42 * s, .45)) }, { fill: '--cb-cloud-window', cls: i % 3 ? '' : 'art-twinkle', d: r() * 6, t: 7 + r() * 3 });
    }
    // a light on the highest tower
    add(svg, 'circle', { cx: f(cx + .8 * s), cy: f(y - 15.9 * s), r: f(at(.55 * s, .5)) }, { fill: '--cb-amber', cls: 'art-glow', t: 5 });
  }
  // A CLOUD CAR, two pods side by side joined amidships, seen from a little
  // above, facing right at dir 1, about twenty long at k 1: the pod behind in
  // shade, glass forward and the engines aft. o is how it holds station.
  function ccCar(parent, x, y, k, dir, o) {
    var hold = group(parent, {}, o);
    var g = group(hold, { transform: 'translate(' + f(x) + ' ' + f(y) + ') scale(' + (dir * k).toFixed(2) + ' ' + k.toFixed(2) + ')' });
    function pod(py, ink) {
      add(g, 'rect', { x: -9, y: f(py - 2.1), width: 18, height: 4.2, rx: 2.1 }, { fill: ink });
      add(g, 'ellipse', { cx: 5.6, cy: f(py - .4), rx: 2.6, ry: 1.5 }, { fill: '--cb-cloud-glass' });
      add(g, 'circle', { cx: -9.2, cy: f(py), r: 1.1 }, { fill: '--cb-amber' });
    }
    pod(-2, '--cb-cloud-car-2');
    add(g, 'rect', { x: -3.4, y: -1.6, width: 5.4, height: 3.2, rx: .8 }, { fill: '--cb-cloud-car-2' });
    pod(1.8, '--cb-cloud-car');
    return hold;
  }
  T.cloud = {
    band: function (c, r) {
      var s = c.s, h = c.h, w = c.w, x, i, divider = c.kind === 'divider';
      var sea = h * (divider ? .62 : .7);
      // stars still out at the top of a tall strip
      if (h >= 60) {
        for (x = r() * 16; x < w; x += 10 + r() * 22) {
          add(c.svg, 'circle', { cx: f(x), cy: f(r() * h * .3), r: f(.4 + r() * .7) }, { fill: '--cb-steel', cls: r() < .35 ? 'art-twinkle' : '', d: r() * 4, t: 5 });
        }
      }
      // the afterglow, lying along the sky over the cloud
      var lines = h >= 60 ? 5 : 2, gap = at(h * .045, 1.6);
      for (i = 0; i < lines; i++) {
        var ly = sea - gap * (i + .6);
        add(c.svg, 'path', { d: 'M0 ' + f(ly) + 'L' + w + ' ' + f(ly), 'stroke-opacity': (.8 - i * .1).toFixed(2) }, { stroke: CC_GLOW[i], sw: at((1 - i * .14) * s, .5) });
      }
      // the sun going down and the city on its stalk, turn and turn about;
      // where each city stands is kept, so no cloud car is drawn across one
      var cities = [];
      if (!divider) {
        for (x = 40 + r() * 60, i = 0; x < w - 20; i++) {
          if (i % 2) {
            var R = h * .3;
            ccSun(c.svg, x, sea - R * .62, R, r);
            x += R * 2 + 140 + r() * 140;
          } else {
            ccCity(c.svg, x, h * .45, h * .395, h, r);
            cities.push([x - h * .5, x + h * .5]);
            x += h * .6 + 70 + r() * 90;
          }
        }
      }
      // the sea of cloud, puffs in shade underneath, then their bodies, then
      // the sun on their tops
      var k = Math.min(at(s, .4), 2.2), puffs = [];
      for (x = -6 * k; x < w + 8 * k;) {
        var rr = (4.5 + r() * 4.5) * k;
        puffs.push([x, sea + rr * (.55 + r() * .4), rr]);
        x += rr * (1.05 + r() * .5);
      }
      if (!divider) add(c.svg, 'rect', { x: -2, y: f(sea + 6 * k), width: w + 4, height: f(h) }, { fill: '--cb-cloud-shade' });
      puffs.forEach(function (p) { add(c.svg, 'circle', { cx: f(p[0]), cy: f(p[1] + p[2] * .35), r: f(p[2]) }, { fill: '--cb-cloud-shade' }); });
      puffs.forEach(function (p) { add(c.svg, 'circle', { cx: f(p[0]), cy: f(p[1]), r: f(p[2] * .9) }, { fill: '--cb-cloud-puff' }); });
      puffs.forEach(function (p, j) {
        add(c.svg, 'ellipse', { cx: f(p[0] - p[2] * .1), cy: f(p[1] - p[2] * .44), rx: f(p[2] * .7), ry: f(p[2] * .34) }, { fill: '--cb-cloud-glow', cls: j % 5 ? '' : 'art-glow', d: r() * 6, t: 9 });
      });
      // cloud cars holding station over it
      var ck = Math.max(.32, Math.min(1.5, h / 48));
      for (x = 90 + r() * 120; x < w - 20; x += 170 + r() * 190) {
        var cy = h * (.12 + r() * .22), dir = r() < .5 ? 1 : -1, d = r() * 4, t = 6 + r() * 4;
        if (cities.some(function (q) { return x + 14 * ck > q[0] && x - 14 * ck < q[1]; })) continue;
        ccCar(c.svg, x, cy, ck, dir, { cls: 'art-hover', d: d, t: t });
      }
    }
  };

  /* HALLOWEEN AND AUTUMN (Ryan, 2026-10-30, for the street's Halloween party
     the next day: "more Halloween themes and profile customizations ... While
     at it, create some autumn themes"). Each drawing is its own world: a
     pumpkin patch under a harvest moon, friendly ghosts in a misty churchyard
     with no church, a maple grove dropping its leaves, and a sweater knitted
     for the cold. Nothing in any of them jumps out at anybody, nothing
     flashes, and every glow breathes over four seconds or more. */

  /* PUMPKIN PATCH: a vine running along the foot with its leaves and curling
     tendrils, pumpkins sitting on it, some carved and lit from inside, and on a
     tall strip a harvest moon with bats going over it. The carved faces glow
     and dim slowly; they never flicker. */
  function pkPumpkin(svg, x, base, R, carved, r) {
    var ry = R * .74, cy = base - ry, lw = at(R * .07, .4);
    if (carved) add(svg, 'circle', { cx: f(x), cy: f(cy), r: f(R * 1.3), 'fill-opacity': '.12' }, { fill: '--cb-pumpkin-glow', cls: 'art-glow', d: r() * 4, t: 5 + r() * 3 });
    add(svg, 'ellipse', { cx: f(x - R * .42), cy: f(cy), rx: f(R * .58), ry: f(ry) }, { fill: '--cb-pumpkin-rib', stroke: '--cb-pumpkin-line', sw: lw });
    add(svg, 'ellipse', { cx: f(x + R * .42), cy: f(cy), rx: f(R * .58), ry: f(ry) }, { fill: '--cb-pumpkin-rib', stroke: '--cb-pumpkin-line', sw: lw });
    add(svg, 'ellipse', { cx: f(x), cy: f(cy), rx: f(R * .56), ry: f(ry * 1.03) }, { fill: '--cb-pumpkin-orange', stroke: '--cb-pumpkin-line', sw: lw });
    add(svg, 'path', { d: 'M' + f(x - R * .06) + ' ' + f(cy - ry * .92) + 'Q' + f(x - R * .1) + ' ' + f(cy - ry * 1.3) + ' ' + f(x + R * .18) + ' ' + f(cy - ry * 1.42) },
      { stroke: '--cb-pumpkin-stem', sw: at(R * .16, .8) });
    if (!carved) return;
    var g = group(svg, {}, { cls: 'art-glow', d: r() * 4, t: 5 + r() * 3 });
    var e = R * .16;
    add(g, 'path', { d: 'M' + f(x - R * .34) + ' ' + f(cy - ry * .08) + 'l' + f(e) + ' ' + f(-e * 1.5) + 'l' + f(e) + ' ' + f(e * 1.5) + 'Z' + 'M' + f(x + R * .02) + ' ' + f(cy - ry * .08) + 'l' + f(e) + ' ' + f(-e * 1.5) + 'l' + f(e) + ' ' + f(e * 1.5) + 'Z' }, { fill: '--cb-pumpkin-glow' });
    add(g, 'path', { d: 'M' + f(x - R * .4) + ' ' + f(cy + ry * .2) + 'Q' + f(x) + ' ' + f(cy + ry * .78) + ' ' + f(x + R * .4) + ' ' + f(cy + ry * .2) +
      'L' + f(x + R * .22) + ' ' + f(cy + ry * .34) + 'L' + f(x + R * .1) + ' ' + f(cy + ry * .22) + 'L' + f(x - R * .04) + ' ' + f(cy + ry * .38) + 'L' + f(x - R * .18) + ' ' + f(cy + ry * .24) + 'Z' }, { fill: '--cb-pumpkin-glow' });
  }
  function pkBat(svg, x, y, k, o) {
    var hold = group(svg, {}, o);
    var g = group(hold, { transform: 'translate(' + f(x) + ' ' + f(y) + ') scale(' + k.toFixed(2) + ')' });
    add(g, 'path', { d: 'M0 -1C-3 -4 -6 -5 -11 -3C-9 -1 -9 1 -10 3C-7 2 -4 3 0 2C4 3 7 2 10 3C9 1 9 -1 11 -3C6 -5 3 -4 0 -1Z' }, { fill: '--cb-pumpkin-bat', stroke: '--cb-steel-2', sw: .8 });
    add(g, 'circle', { cx: -1, cy: -.4, r: .6 }, { fill: '--cb-pumpkin-glow' });
    add(g, 'circle', { cx: 1, cy: -.4, r: .6 }, { fill: '--cb-pumpkin-glow' });
  }
  T.pumpkin = {
    band: function (c, r) {
      var s = c.s, h = c.h, w = c.w, x, i, tall = h >= 60;
      if (tall) {
        for (x = r() * 14; x < w; x += 12 + r() * 26) add(c.svg, 'circle', { cx: f(x), cy: f(r() * h * .4), r: f(.4 + r() * .7) }, { fill: '--cb-steel', cls: r() < .4 ? 'art-twinkle' : '', d: r() * 4, t: 5 });
        for (x = 60 + r() * 80; x < w; x += 260 + r() * 200) {
          var mr = h * .2, my = h * .3;
          add(c.svg, 'circle', { cx: f(x), cy: f(my), r: f(mr * 1.6), 'fill-opacity': '.12' }, { fill: '--cb-pumpkin-moon', cls: 'art-glow', d: r() * 3, t: 8 });
          add(c.svg, 'circle', { cx: f(x), cy: f(my), r: f(mr) }, { fill: '--cb-pumpkin-moon' });
          add(c.svg, 'circle', { cx: f(x + mr * .3), cy: f(my - mr * .2), r: f(mr * .18), 'fill-opacity': '.35' }, { fill: '--cb-pumpkin-crater' });
          add(c.svg, 'circle', { cx: f(x - mr * .35), cy: f(my + mr * .3), r: f(mr * .12), 'fill-opacity': '.35' }, { fill: '--cb-pumpkin-crater' });
          pkBat(c.svg, x - mr * .8, my - mr * .2, h / 90, { cls: 'art-hover', d: r() * 3, t: 6 });
          pkBat(c.svg, x + mr * 1.5, my + mr * .6, h / 120, { cls: 'art-hover', d: r() * 3, t: 7 });
        }
      } else if (h >= 24) {
        for (x = 90 + r() * 120; x < w; x += 200 + r() * 160) pkBat(c.svg, x, h * .24, at(h / 70, .28), { cls: 'art-hover', d: r() * 3, t: 6 + r() * 3 });
      }
      var vy = h * .86, amp = h * .05, len = 26 * at(s, .5);
      add(c.svg, 'path', { d: wave(w, vy, amp, len, 0), pathLength: 1 }, { stroke: '--cb-pumpkin-vine', sw: at(1.5 * s, .7), cls: 'art-grow', t: growFor(c) });
      // leaves and curling tendrils along the vine
      var lk = Math.min(at(s, .5), 1.6);
      for (x = 8 + r() * 10; x < w; x += (14 + r() * 14) * lk) {
        var ly = vy + amp * Math.sin(x / len), up = r() < .5 ? -1 : 1;
        if (r() < .5) {
          var lg = group(c.svg, { transform: 'translate(' + f(x) + ' ' + f(ly) + ') scale(' + (lk * Math.min(1.4, h / 24)).toFixed(2) + ')' }, { cls: 'art-sway', d: r() * 4, t: 6 + r() * 2 });
          add(lg, 'circle', { cx: -2.6, cy: -3.4, r: 2.8 }, { fill: '--cb-pumpkin-leaf' });
          add(lg, 'circle', { cx: 2.6, cy: -3.4, r: 2.8 }, { fill: '--cb-pumpkin-leaf' });
          add(lg, 'circle', { cx: 0, cy: -6, r: 3 }, { fill: '--cb-pumpkin-leaf' });
          add(lg, 'path', { d: 'M0 0L0 -6M0 -2.6L-2.6 -3.6M0 -2.6L2.6 -3.6' }, { stroke: '--cb-pumpkin-vine', sw: .6 });
        } else {
          var tk = lk * 2.4;
          add(c.svg, 'path', { d: 'M' + f(x) + ' ' + f(ly) + 'q' + f(tk) + ' ' + f(up * -tk * 1.4) + ' ' + f(tk * 2) + ' ' + f(up * -tk * .6) + 'q' + f(tk * .8) + ' ' + f(up * tk * .8) + ' ' + f(0) + ' ' + f(up * tk * .9) + 'q' + f(-tk * .6) + ' ' + f(up * -tk * .3) + ' ' + f(-tk * .2) + ' ' + f(up * -tk * .7) },
            { stroke: '--cb-pumpkin-vine', sw: at(.8 * s, .5) });
        }
      }
      // the pumpkins, sitting on the vine, a carved one now and then
      var R0 = Math.min(h * .36, 22), gapK = c.kind === 'divider' ? 4 : 2.6;
      for (x = 24 + r() * 40, i = 0; x < w - 8; i++) {
        var R = R0 * (.7 + r() * .45), carved = r() < .45;
        pkPumpkin(c.svg, x, vy + amp * Math.sin(x / len) + R * .08, R, carved, r);
        x += R * gapK + 30 + r() * 60;
      }
    }
  };

  /* FRIENDLY GHOSTS: little sheet ghosts floating over a misty field with a
     few plain stones in it, every ghost with pink cheeks, and on a tall strip a
     moon. They hover a little up and down and never come at you: a friendly
     ghost is one that keeps its distance and waves. The stones carry no word,
     no cross and nobody's name. */
  function ghGhost(svg, x, y, k, o, wave) {
    var hold = group(svg, {}, o);
    var g = group(hold, { transform: 'translate(' + f(x) + ' ' + f(y) + ') scale(' + k.toFixed(2) + ')' });
    add(g, 'path', { d: 'M-8 -4C-8 -14 8 -14 8 -4L8 9Q6 12 4 9Q2 6 0 9Q-2 12 -4 9Q-6 6 -8 9Z' }, { fill: '--cb-ghosts-sheet', stroke: '--cb-ghosts-shade', sw: .8 });
    add(g, 'path', { d: 'M4 -10C8 -7 8 -3 8 2L8 9Q6 12 4 9C6 4 6 -4 4 -10Z', 'fill-opacity': '.6' }, { fill: '--cb-ghosts-shade' });
    if (wave) add(g, 'path', { d: 'M-7.6 0Q-12 -2 -12 -6Q-10 -6.6 -9 -3.6' }, { fill: '--cb-ghosts-sheet', stroke: '--cb-ghosts-shade', sw: .8 });
    add(g, 'ellipse', { cx: -2.8, cy: -4.6, rx: 1.2, ry: 1.8 }, { fill: '--cb-ghosts-eye' });
    add(g, 'ellipse', { cx: 2.8, cy: -4.6, rx: 1.2, ry: 1.8 }, { fill: '--cb-ghosts-eye' });
    add(g, 'circle', { cx: -5, cy: -1.6, r: 1.3, 'fill-opacity': '.8' }, { fill: '--cb-ghosts-cheek' });
    add(g, 'circle', { cx: 5, cy: -1.6, r: 1.3, 'fill-opacity': '.8' }, { fill: '--cb-ghosts-cheek' });
    add(g, 'path', { d: 'M-1.6 -1.4Q0 .4 1.6 -1.4' }, { stroke: '--cb-ghosts-eye', sw: .8 });
  }
  function ghStone(svg, x, base, k) {
    add(svg, 'path', { d: 'M' + f(x - 5 * k) + ' ' + f(base) + 'V' + f(base - 8 * k) + 'Q' + f(x - 5 * k) + ' ' + f(base - 13 * k) + ' ' + f(x) + ' ' + f(base - 13 * k) +
      'Q' + f(x + 5 * k) + ' ' + f(base - 13 * k) + ' ' + f(x + 5 * k) + ' ' + f(base - 8 * k) + 'V' + f(base) + 'Z' }, { fill: '--cb-ghosts-stone', stroke: '--cb-steel-2', sw: at(.6 * k, .4) });
    add(svg, 'path', { d: 'M' + f(x + 1.4 * k) + ' ' + f(base - 11 * k) + 'l' + f(-1.2 * k) + ' ' + f(2.6 * k) + 'l' + f(1.4 * k) + ' ' + f(1.6 * k) }, { stroke: '--cb-ghosts-crack', sw: at(.5 * k, .35) });
  }
  T.ghosts = {
    band: function (c, r) {
      var s = c.s, h = c.h, w = c.w, x, tall = h >= 60, ground = h * .92;
      if (tall) {
        for (x = r() * 14; x < w; x += 10 + r() * 24) add(c.svg, 'circle', { cx: f(x), cy: f(r() * h * .45), r: f(.4 + r() * .7) }, { fill: '--cb-steel', cls: r() < .4 ? 'art-twinkle' : '', d: r() * 4, t: 5 });
        for (x = 100 + r() * 100; x < w; x += 300 + r() * 220) {
          var mr = h * .17;
          add(c.svg, 'circle', { cx: f(x), cy: f(h * .28), r: f(mr * 1.8), 'fill-opacity': '.1' }, { fill: '--cb-ghosts-moon', cls: 'art-glow', d: r() * 3, t: 8 });
          add(c.svg, 'path', { d: 'M' + f(x) + ' ' + f(h * .28 - mr) + 'A' + f(mr) + ' ' + f(mr) + ' 0 1 1 ' + f(x) + ' ' + f(h * .28 + mr) + 'A' + f(mr * .72) + ' ' + f(mr) + ' 0 1 0 ' + f(x) + ' ' + f(h * .28 - mr) + 'Z' }, { fill: '--cb-ghosts-moon' });
        }
      }
      // stones along the ground, now and then
      var k = Math.min(at(h / 30, .4), 2.4);
      if (c.kind !== 'divider') {
        for (x = 30 + r() * 50; x < w; x += 70 + r() * 110) ghStone(c.svg, x, ground + 1, k * (.75 + r() * .3));
      }
      // the mist, lying along the ground and drifting a little to and fro
      for (x = -20; x < w + 20; x += 26 * k + r() * 20 * k) {
        add(c.svg, 'ellipse', { cx: f(x), cy: f(ground - h * .03 - r() * 2 * k), rx: f((18 + r() * 14) * k), ry: f((1.6 + r() * 1.4) * k), 'fill-opacity': '.22' }, { fill: '--cb-ghosts-mist', cls: 'art-hover', d: r() * 4, t: 8 + r() * 4 });
      }
      // the ghosts, hovering at different heights, one in four waving
      var gk = Math.min(at(h / 34, .36), 2.2);
      for (x = 20 + r() * 30; x < w - 6; x += (60 + r() * 70) * Math.max(gk, .6)) {
        var gy = c.kind === 'divider' ? h * .5 : h * (tall ? .4 + r() * .3 : .42 + r() * .12);
        ghGhost(c.svg, x, gy, gk * (.8 + r() * .35), { cls: 'art-hover', d: r() * 4, t: 5 + r() * 3 }, r() < .25);
      }
    }
  };

  /* MAPLE GROVE: a maple branch along the top with its leaves turning red,
     orange and gold, leaves falling from it, and the fallen leaves lying in
     drifts along the foot with acorns among them. The leaves fall slowly and
     the branch's leaves sway; nothing flashes. */
  var MP_INKS = ['--cb-maple-red', '--cb-maple-orange', '--cb-maple-gold', '--cb-maple-yellow'];
  var MP_LEAF = 'M0 -10L2 -6L5 -7.4L4.2 -3L9 -4.4L7.4 -.6L9.4 .8L4.2 3L5.2 5.4L1 4.2L.6 8L-.6 8L-1 4.2L-5.2 5.4L-4.2 3L-9.4 .8L-7.4 -.6L-9 -4.4L-4.2 -3L-5 -7.4L-2 -6Z';
  function mpLeaf(svg, x, y, k, rot, ink, o) {
    var g = group(svg, { transform: 'translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(rot) + ') scale(' + k.toFixed(2) + ')' }, o);
    add(g, 'path', { d: MP_LEAF }, { fill: ink });
    add(g, 'path', { d: 'M0 8L0 -6M0 1L-5 -2M0 1L5 -2' }, { stroke: '--cb-maple-vein', sw: .7 });
    return g;
  }
  function mpAcorn(svg, x, y, k) {
    add(svg, 'ellipse', { cx: f(x), cy: f(y + 1.4 * k), rx: f(2.6 * k), ry: f(3.2 * k) }, { fill: '--cb-maple-acorn' });
    add(svg, 'path', { d: 'M' + f(x - 3 * k) + ' ' + f(y) + 'Q' + f(x) + ' ' + f(y - 3.4 * k) + ' ' + f(x + 3 * k) + ' ' + f(y) + 'Z' }, { fill: '--cb-maple-cap' });
    add(svg, 'path', { d: 'M' + f(x) + ' ' + f(y - 2 * k) + 'l' + f(.6 * k) + ' ' + f(-1.6 * k) }, { stroke: '--cb-maple-cap', sw: at(.8 * k, .4) });
  }
  T.maple = {
    band: function (c, r) {
      var s = c.s, h = c.h, w = c.w, x, k = Math.min(at(h / 34, .36), 2.2), top = c.kind === 'top' || h >= 60;
      // the branch along the top, its twigs and its leaves
      if (top && c.kind !== 'divider') {
        var by = h * .12;
        add(c.svg, 'path', { d: wave(w, by, h * .04, 40, 1), pathLength: 1 }, { stroke: '--cb-maple-branch', sw: at(2 * s, .9), cls: 'art-grow', t: growFor(c) });
        for (x = 10 + r() * 14; x < w; x += (16 + r() * 18) * k) {
          var ty = by + h * .04 * Math.sin(x / 40 + 1), dl = (6 + r() * 6) * k;
          add(c.svg, 'path', { d: 'M' + f(x) + ' ' + f(ty) + 'l' + f(r() * 4 - 2) + ' ' + f(dl) }, { stroke: '--cb-maple-branch', sw: at(.8 * s, .5) });
          mpLeaf(c.svg, x, ty + dl + 6 * k, k * (.6 + r() * .3), 180 + r() * 40 - 20, MP_INKS[Math.floor(r() * 4)], { cls: 'art-sway', d: r() * 4, t: 6 + r() * 2 });
        }
      }
      // leaves falling
      if (c.kind !== 'divider') {
        for (x = 30 + r() * 40; x < w; x += (40 + r() * 70) * Math.max(k, .6)) {
          var fy = h * (top ? .38 : .2) + r() * h * .2;
          mpLeaf(c.svg, x, fy, k * (.5 + r() * .3), r() * 360, MP_INKS[Math.floor(r() * 4)], { cls: 'art-fall', d: r() * 6, t: 8 + r() * 5, run: Math.round(h * .22) });
        }
      }
      // the drifts along the foot, and acorns in them
      var ground = h * (c.kind === 'divider' ? .74 : .9);
      for (x = -6; x < w + 6; x += (4 + r() * 5) * k) {
        mpLeaf(c.svg, x, ground - r() * 4 * k * (1 + Math.sin(x / 60)), k * (.42 + r() * .22), r() * 360, MP_INKS[Math.floor(r() * 4)]);
        if (r() < .08) mpAcorn(c.svg, x + 2 * k, ground - 2 * k, k * .9);
      }
    }
  };

  /* SWEATER WEATHER: a sweater knitted for the cold, its stitches row on row,
     a cable twisting along it and a band of the old knitted pattern of
     diamonds and hearts in cranberry and pine, and on a tall strip a mug of
     cocoa whose steam rises and fades. */
  // A cable: a rope of twists, each a slanted lozenge, one strand in shade
  // and the next lit, along y and r high either side of it.
  function swCable(svg, w, y, r) {
    var step = r * 1.2, x, i;
    add(svg, 'rect', { x: -2, y: f(y - r * 1.25), width: w + 4, height: f(r * 2.5) }, { fill: '--cb-sweater-shade' });
    for (x = -step, i = 0; x < w + step; x += step, i++) {
      add(svg, 'ellipse', { cx: f(x), cy: f(y), rx: f(r * .62), ry: f(r * 1.18), transform: 'rotate(35 ' + f(x) + ' ' + f(y) + ')' },
        { fill: i % 2 ? '--cb-sweater-cable' : '--cb-sweater-knit', stroke: '--cb-sweater-cable', sw: at(r * .1, .4) });
    }
  }
  T.sweater = {
    band: function (c, r) {
      var s = c.s, h = c.h, w = c.w, x, y, k = at(s, .5), d = '';
      add(c.svg, 'rect', { x: -2, y: 0, width: w + 4, height: f(h) }, { fill: '--cb-sweater-knit' });
      // the stitches, a V for each, row on row
      var sx = 4.4 * k, sy = 4 * k;
      for (y = sy * .6; y < h; y += sy) {
        for (x = (Math.round(y / sy) % 2) * sx / 2; x < w + sx; x += sx) d += 'M' + f(x - sx * .42) + ' ' + f(y - sy * .38) + 'L' + f(x) + ' ' + f(y + sy * .38) + 'L' + f(x + sx * .42) + ' ' + f(y - sy * .38);
      }
      add(c.svg, 'path', { d: d }, { stroke: '--cb-sweater-shade', sw: at(.7 * k, .35) });
      if (c.kind === 'divider') { swCable(c.svg, w, h / 2, h * .34); return; }
      var tall = h >= 60;
      // the cable, near the top
      swCable(c.svg, w, h * (tall ? .15 : .2), Math.min(h * (tall ? .1 : .14), 7 * k));
      // the patterned band: a cranberry ground, pine diamonds, cream hearts
      var py = h * (tall ? .3 : .42), ph = h * (tall ? .26 : .4);
      add(c.svg, 'rect', { x: -2, y: f(py), width: w + 4, height: f(ph) }, { fill: '--cb-sweater-berry' });
      add(c.svg, 'path', { d: 'M-2 ' + f(py + ph * .08) + 'H' + (w + 2) + 'M-2 ' + f(py + ph * .92) + 'H' + (w + 2) }, { stroke: '--cb-sweater-knit', sw: at(.9 * k, .5) });
      var dw = ph * .7, i = 0;
      for (x = dw / 2; x < w + dw; x += dw, i++) {
        var mid = py + ph / 2, rr = ph * .3;
        if (i % 2) {
          add(c.svg, 'path', { d: 'M' + f(x) + ' ' + f(mid - rr) + 'L' + f(x + rr) + ' ' + f(mid) + 'L' + f(x) + ' ' + f(mid + rr) + 'L' + f(x - rr) + ' ' + f(mid) + 'Z' }, { fill: '--cb-sweater-pine' });
          add(c.svg, 'circle', { cx: f(x), cy: f(mid), r: f(rr * .26) }, { fill: '--cb-sweater-knit' });
        } else {
          var q = rr * .5;
          add(c.svg, 'path', { d: 'M' + f(x) + ' ' + f(mid + q * 1.4) + 'C' + f(x - q * 2.4) + ' ' + f(mid) + ' ' + f(x - q * 1.2) + ' ' + f(mid - q * 1.8) + ' ' + f(x) + ' ' + f(mid - q * .7) +
            'C' + f(x + q * 1.2) + ' ' + f(mid - q * 1.8) + ' ' + f(x + q * 2.4) + ' ' + f(mid) + ' ' + f(x) + ' ' + f(mid + q * 1.4) + 'Z' }, { fill: '--cb-sweater-knit', cls: i % 6 ? '' : 'art-breathe', d: r() * 3, t: 5 });
        }
      }
      // a mug of cocoa now and then, on a tall strip, its steam rising
      if (h >= 60) {
        for (x = 80 + r() * 80; x < w - 40; x += 260 + r() * 180) {
          var mk = h / 58, mb = h * .97;
          add(c.svg, 'path', { d: 'M' + f(x + 7 * mk) + ' ' + f(mb - 13 * mk) + 'q' + f(5 * mk) + ' ' + f(0) + ' ' + f(5 * mk) + ' ' + f(4 * mk) + 'q0 ' + f(4 * mk) + ' ' + f(-5 * mk) + ' ' + f(4 * mk) }, { stroke: '--cb-sweater-mug', sw: at(1.6 * mk, .8) });
          add(c.svg, 'rect', { x: f(x - 8 * mk), y: f(mb - 16 * mk), width: f(16 * mk), height: f(16 * mk), rx: f(2.4 * mk) }, { fill: '--cb-sweater-mug', stroke: '--cb-steel', sw: at(.6 * mk, .4) });
          add(c.svg, 'ellipse', { cx: f(x), cy: f(mb - 16 * mk), rx: f(7.4 * mk), ry: f(1.8 * mk) }, { fill: '--cb-sweater-cocoa' });
          for (var j = -1; j <= 1; j++) {
            add(c.svg, 'path', { d: 'M' + f(x + j * 3.4 * mk) + ' ' + f(mb - 19 * mk) + 'q' + f(-2 * mk) + ' ' + f(-3 * mk) + ' 0 ' + f(-6 * mk) + 'q' + f(2 * mk) + ' ' + f(-3 * mk) + ' 0 ' + f(-6 * mk) }, { stroke: '--cb-steel-2', sw: at(.9 * mk, .5), cls: 'art-twinkle', d: j + 1.4, t: 5 });
          }
        }
      }
    }
  };

  /* BLACK LEATHER LAGOON (2026-10-18), after the street's room and The Cramps,
     to pair with the profile effect of the same name: black water with the
     screen's acid light lying along its edge, reeds with cattails, bats, and now
     and then a drive-in screen standing in the water on its legs, its glow
     breathing slowly. Like the room, nothing in it flickers, and nobody real is
     drawn: their world, not them. */
  function lagBat(x, y, k) {
    return 'M' + f(x) + ' ' + f(y - 1 * k) +
      'C' + f(x - 3 * k) + ' ' + f(y - 4 * k) + ' ' + f(x - 6 * k) + ' ' + f(y - 5 * k) + ' ' + f(x - 11 * k) + ' ' + f(y - 3 * k) +
      'C' + f(x - 9 * k) + ' ' + f(y - 1 * k) + ' ' + f(x - 9 * k) + ' ' + f(y + 1 * k) + ' ' + f(x - 10 * k) + ' ' + f(y + 3 * k) +
      'C' + f(x - 7 * k) + ' ' + f(y + 2 * k) + ' ' + f(x - 4 * k) + ' ' + f(y + 3 * k) + ' ' + f(x) + ' ' + f(y + 2 * k) +
      'C' + f(x + 4 * k) + ' ' + f(y + 3 * k) + ' ' + f(x + 7 * k) + ' ' + f(y + 2 * k) + ' ' + f(x + 10 * k) + ' ' + f(y + 3 * k) +
      'C' + f(x + 9 * k) + ' ' + f(y + 1 * k) + ' ' + f(x + 9 * k) + ' ' + f(y - 1 * k) + ' ' + f(x + 11 * k) + ' ' + f(y - 3 * k) +
      'C' + f(x + 6 * k) + ' ' + f(y - 5 * k) + ' ' + f(x + 3 * k) + ' ' + f(y - 4 * k) + ' ' + f(x) + ' ' + f(y - 1 * k) + 'Z';
  }
  T.lagoon = {
    band: function (c, r) {
      var s = c.s, x, wl = c.h * 0.74;
      // now and then a drive-in screen, glowing, out in the water
      if (c.kind !== 'divider') {
        for (x = 50 + r() * 70; x < c.w - 30; x += 240 + r() * 220) {
          var sw = Math.max(c.h * 1.15, 14), sh = c.h * 0.4, sy = c.h * 0.1;
          var glow = group(c.svg, {}, { cls: 'art-glow', d: r() * 4, t: 9 });
          add(glow, 'rect', { x: f(x - sw / 2 - 7 * s), y: f(Math.max(0, sy - 5 * s)), width: f(sw + 14 * s), height: f(sh + 10 * s), rx: f(6 * s), 'fill-opacity': '.07' }, { fill: '--cb-amber' });
          add(glow, 'rect', { x: f(x - sw / 2 - 3 * s), y: f(Math.max(0, sy - 2.4 * s)), width: f(sw + 6 * s), height: f(sh + 4.8 * s), rx: f(3 * s), 'fill-opacity': '.1' }, { fill: '--cb-amber' });
          add(c.svg, 'rect', { x: f(x - sw * 0.36), y: f(sy + sh), width: f(at(1.4 * s, 1)), height: f(wl - sy - sh), 'fill-opacity': '.6' }, { fill: '--cb-steel' });
          add(c.svg, 'rect', { x: f(x + sw * 0.36 - at(1.4 * s, 1)), y: f(sy + sh), width: f(at(1.4 * s, 1)), height: f(wl - sy - sh), 'fill-opacity': '.6' }, { fill: '--cb-steel' });
          add(c.svg, 'rect', { x: f(x - sw / 2), y: f(sy), width: f(sw), height: f(sh), rx: f(0.6 * s) }, { fill: '--cb-steel', stroke: '--cb-steel-2', sw: at(0.5 * s, 0.4) });
          add(c.svg, 'rect', { x: f(x - sw * 0.42), y: f(wl + (c.h - wl) * 0.2), width: f(sw * 0.84), height: f(at((c.h - wl) * 0.35, 0.8)), rx: f(1 * s), 'fill-opacity': '.2' }, { fill: '--cb-steel' });
        }
      }
      // the water's edge, catching the screen's light, and ripples on the black
      add(c.svg, 'path', { d: wave(c.w, wl, 0.6 * s, 16, 0) }, { stroke: '--cb-amber', sw: at(0.9 * s, 0.7) });
      for (x = r() * 20; x < c.w; x += (12 + r() * 20) * at(s, 0.6)) {
        add(c.svg, 'path', { d: 'M' + f(x) + ' ' + f(wl + (c.h - wl) * (0.3 + r() * 0.6)) + 'h' + f((4 + r() * 6) * at(s, 0.6)) }, { stroke: '--cb-steel-2', sw: at(0.6 * s, 0.5) });
      }
      // reeds, each with its cattail, swaying a little
      for (x = r() * 14; x < c.w; x += (16 + r() * 34) * at(s, 0.6)) {
        var top = c.h * (0.18 + r() * 0.3), lean = (r() - 0.5) * 4 * s;
        var reed = group(c.svg, {}, { cls: 'art-sway', d: r() * 4, t: 5 + r() * 2 });
        add(reed, 'path', { d: 'M' + f(x) + ' ' + f(c.h) + 'Q' + f(x + lean * 0.3) + ' ' + f((c.h + top) / 2) + ' ' + f(x + lean) + ' ' + f(top) }, { stroke: '--cb-steel-2', sw: at(0.9 * s, 0.7) });
        add(reed, 'rect', { x: f(x + lean - at(1.2 * s, 0.9)), y: f(top), width: f(at(2.4 * s, 1.8)), height: f(c.h * 0.16), rx: f(at(1.2 * s, 0.9)) }, { fill: '--cb-lagoon-blood' });
      }
      // bats, against the dark above the water
      for (x = 30 + r() * 80; x < c.w; x += 120 + r() * 140) {
        var bat = group(c.svg, {}, { cls: 'art-breathe', d: r() * 3, t: 3 + r() });
        add(bat, 'path', { d: lagBat(x, c.h * (0.16 + r() * 0.16), at(0.55 * s, 0.4)) }, { fill: '--cb-bar', stroke: '--cb-steel-2', sw: at(0.5 * s, 0.4) });
      }
    }
  };

  /* SHADOW OF MORDOR: rune medallions after the game's runes, as Ryan asked,
     each a gold ring with a mark glowing in it, a few in wraith-blue, over a
     seam of lava; and along the foot black mountains over lava with ash
     drifting. Every mark is made up here out of a stave, branches, a crescent,
     prongs and dots, mirrored, so none is a rune of the game's and none is a
     letter of Tolkien's. */
  function rune(parent, cx, cy, R, ink, r, d, kind) {
    /* Down a side the band is turned to run vertically, which would turn every
       mark on its side: each medallion is turned back about its own centre. */
    var turn = kind === 'left' ? 'matrix(0 1 1 0 0 0)' : kind === 'right' ? 'matrix(0 -1 1 0 0 0)' : '';
    var holder = turn ? group(parent, { transform: 'translate(' + f(cx) + ' ' + f(cy) + ') ' + turn + ' translate(' + f(-cx) + ' ' + f(-cy) + ')' }) : parent;
    var g = group(holder, {}, { cls: 'art-glow', d: d, t: 4.5 + r() * 2 }), w = at(R * 0.13, 0.8), o = { stroke: ink, sw: w };
    add(g, 'circle', { cx: f(cx), cy: f(cy), r: f(R) }, { stroke: ink, sw: w * 0.9 });
    var top = cy - R * 0.62, bot = cy + R * 0.62, parts = 0;
    if (r() < 0.75) { add(g, 'path', { d: 'M' + f(cx) + ' ' + f(top) + 'L' + f(cx) + ' ' + f(bot) }, o); parts++; }
    if (r() < 0.6) {
      var by = cy + (r() - 0.5) * R * 0.6, bw = R * (0.35 + r() * 0.2), up = r() < 0.5 ? -1 : 1;
      add(g, 'path', { d: 'M' + f(cx - bw) + ' ' + f(by + up * bw * 0.8) + 'L' + f(cx) + ' ' + f(by) + 'L' + f(cx + bw) + ' ' + f(by + up * bw * 0.8) }, o); parts++;
    }
    if (r() < 0.45) {
      var cr = R * (0.32 + r() * 0.12), cyy = cy + (r() < 0.5 ? -1 : 1) * R * 0.18, flip = r() < 0.5 ? 0 : 1;
      add(g, 'path', { d: 'M' + f(cx - cr) + ' ' + f(cyy) + 'A' + f(cr) + ' ' + f(cr) + ' 0 0 ' + flip + ' ' + f(cx + cr) + ' ' + f(cyy) }, o); parts++;
    }
    if (r() < 0.35) {
      var pw = R * 0.32;
      add(g, 'path', { d: 'M' + f(cx - pw) + ' ' + f(top + R * 0.12) + 'L' + f(cx - pw) + ' ' + f(top + R * 0.4) + 'M' + f(cx + pw) + ' ' + f(top + R * 0.12) + 'L' + f(cx + pw) + ' ' + f(top + R * 0.4) +
        'M' + f(cx - pw) + ' ' + f(top + R * 0.4) + 'L' + f(cx + pw) + ' ' + f(top + R * 0.4) }, o); parts++;
    }
    if (r() < 0.4 || !parts) {
      var dx = R * (0.3 + r() * 0.2), dy = cy + (r() - 0.3) * R * 0.5;
      add(g, 'circle', { cx: f(cx - dx), cy: f(dy), r: f(w * 0.9) }, { fill: ink });
      add(g, 'circle', { cx: f(cx + dx), cy: f(dy), r: f(w * 0.9) }, { fill: ink });
    }
  }
  T.mordor = {
    band: function (c, r) {
      var s = c.s, R = c.h * 0.34, x, i = 0;
      add(c.svg, 'path', { d: 'M0 ' + f(c.h - 1) + 'L' + c.w + ' ' + f(c.h - 1) }, { stroke: '--cb-mordor-lava', sw: at(1.4 * s, 1), cls: 'art-glow', t: 5 });
      for (x = R + 6; x < c.w - R; x += R * 2.6 + 4, i++) {
        var pick = r(), ink = pick < 0.16 ? '--cb-mordor-blue' : pick < 0.24 ? '--cb-mordor-wraith' : '--cb-mordor-rune';
        rune(c.svg, x, c.h / 2 - 0.5, R, ink, r, (i % 16) * 0.35, c.kind);
      }
      for (x = r() * 30; x < c.w; x += 40 + r() * 40) {
        add(c.svg, 'circle', { cx: f(x), cy: f(r() * c.h * 0.8), r: f(at(0.7 * s, 0.5)) }, { fill: '--cb-mordor-ash', cls: 'art-flow', d: r() * 6, t: 10 + r() * 5, run: 30 });
      }
    },
    foot: function (c, r) {
      var s = c.s, x;
      add(c.svg, 'rect', { x: 0, y: f(c.h * 0.86), width: c.w, height: f(c.h * 0.14) }, { fill: '--cb-mordor-lava', cls: 'art-glow', t: 5 });
      var d = 'M-4 ' + f(c.h * 0.88);
      for (x = 0; x < c.w + 10; x += (6 + r() * 8) * at(s, 0.6)) d += 'L' + f(x) + ' ' + f(c.h * (0.2 + r() * 0.5));
      d += 'L' + (c.w + 10) + ' ' + f(c.h * 0.88) + 'Z';
      add(c.svg, 'path', { d: d }, { fill: '--cb-mordor-rock', stroke: '--cb-mordor-glow', sw: at(0.8 * s, 0.6) });
      for (x = r() * 20; x < c.w; x += 14 + r() * 20) {
        add(c.svg, 'circle', { cx: f(x), cy: f(r() * c.h * 0.8), r: f(at(0.8 * s, 0.6)) }, { fill: '--cb-mordor-ash', cls: 'art-flow', d: r() * 6, t: 9 + r() * 5, run: 30 });
      }
      for (x = 40 + r() * 40; x < c.w; x += 100 + r() * 80) {
        add(c.svg, 'path', { d: sparkle(x, c.h * 0.3, at(2.4 * s, 1.6)) }, { fill: '--cb-mordor-wraith', cls: 'art-twinkle', d: r() * 4, t: 4 });
      }
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

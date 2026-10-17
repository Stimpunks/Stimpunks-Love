/* The CB radio's drawings, for the themes that have one (Ryan, 2026-10-17: "I
   want to use the CB as a way for folks to get a really personal and fun
   experience, with lots of theme options"). cb.js loads this only when a theme
   with a drawing is on, and asks it to draw into the radio's two trims, the band
   under the bar and the one at its foot.

   EVERY DRAWING IS ARIA-HIDDEN AND CARRIES NO WORD. What a theme is after is
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

   EACH DRAWING IS WORKED OUT FOR THE WIDTH IT HAS, from a fixed seed, so a
   theme draws the same picture every time, and drawing it again when the radio
   changes size gives the same picture at the new width. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var H = 30;

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
      e.style.setProperty('stroke-width', String(o.sw || 1.5));
      e.style.setProperty('stroke-linecap', 'round');
      e.style.setProperty('stroke-linejoin', 'round');
    }
    if (o.cls) e.setAttribute('class', o.cls);
    if (o.d != null) e.style.setProperty('--d', o.d.toFixed(2) + 's');
    if (o.t != null) e.style.setProperty('--t', o.t.toFixed(2) + 's');
    if (o.run != null) e.style.setProperty('--run', o.run + 'px');
    parent.appendChild(e);
    return e;
  }
  function group(parent, at, o) {
    var g = document.createElementNS(NS, 'g');
    var k;
    for (k in (at || {})) g.setAttribute(k, at[k]);
    o = o || {};
    if (o.cls) g.setAttribute('class', o.cls);
    if (o.d != null) g.style.setProperty('--d', o.d.toFixed(2) + 's');
    if (o.t != null) g.style.setProperty('--t', o.t.toFixed(2) + 's');
    parent.appendChild(g);
    return g;
  }
  function canvas(box) {
    box.textContent = '';
    var w = Math.max(160, Math.round(box.clientWidth || 340));
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + H);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    box.appendChild(svg);
    return { w: w, svg: svg };
  }
  function f(n) { return n.toFixed(1); }
  // A four-pointed sparkle centred on x, y.
  function sparkle(x, y, r) {
    var q = r * 0.28;
    return 'M' + f(x) + ' ' + f(y - r) + 'Q' + f(x + q) + ' ' + f(y - q) + ' ' + f(x + r) + ' ' + f(y) +
      'Q' + f(x + q) + ' ' + f(y + q) + ' ' + f(x) + ' ' + f(y + r) + 'Q' + f(x - q) + ' ' + f(y + q) + ' ' +
      f(x - r) + ' ' + f(y) + 'Q' + f(x - q) + ' ' + f(y - q) + ' ' + f(x) + ' ' + f(y - r) + 'Z';
  }
  // A wavy line across the whole width.
  function wave(w, y, amp, len, phase) {
    var d = '', x;
    for (x = -10; x <= w + 10; x += 5) d += (d ? 'L' : 'M') + f(x) + ' ' + f(y + amp * Math.sin(x / len + phase));
    return d;
  }

  var DRAW = {};

  /* SOLARIZED: its eight accents in a stripe, as the palette lays them out. */
  function solarized(top) {
    var c = canvas(top), inks = ['yellow', 'orange', 'red', 'magenta', 'violet', 'blue', 'cyan', 'green'];
    var gap = 4, seg = (c.w - 16 - gap * 7) / 8;
    inks.forEach(function (k, i) {
      add(c.svg, 'rect', { x: f(8 + i * (seg + gap)), y: 12, width: f(seg), height: 6, rx: 3 }, { fill: '--cb-sol-' + k });
    });
    return { top: true, foot: false };
  }
  DRAW.soldark = solarized;
  DRAW.sollight = solarized;

  /* BIOPHILIC: ivy along the top, growing in from the left, and mushrooms coming
     up out of lichen along the foot. After queering.earth and the garden that
     grows round Helen Edgar's Faery Yurt; drawn here, in queering.earth's inks. */
  DRAW.biophilic = function (top, foot) {
    var r = seeded(1966), c = canvas(top), x, i = 0;
    add(c.svg, 'path', { d: wave(c.w, 11, 3.5, 22, 0.6), pathLength: 1 }, { stroke: '--cb-steel-2', sw: 1.6, cls: 'art-grow', t: 8 });
    var leaves = ['--cb-steel-2', '--cb-biophilic-verdigris', '--cb-biophilic-lichen'];
    for (x = 8; x < c.w - 4; x += 15 + r() * 9, i++) {
      var y = 11 + 3.5 * Math.sin(x / 22 + 0.6), up = i % 2 ? 1 : -1;
      var g = group(c.svg, { transform: 'translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(up * (35 + r() * 30)) + ') scale(' + f(0.75 + r() * 0.45) + ')' });
      add(g, 'path', { d: 'M0 0C-4-1-6-5-4-8C-3-9-1-9 0-7C1-9 3-9 4-8C6-5 4-1 0 0Z' },
        { fill: leaves[i % 3], cls: 'art-pop', d: 0.4 + (x / c.w) * 7, t: 1.6 });
      if (r() < 0.22) add(c.svg, 'circle', { cx: f(x + 4), cy: f(y + up * 5), r: 1.8 }, { fill: '--cb-biophilic-marigold', cls: 'art-pop', d: 1 + (x / c.w) * 7 });
    }
    var b = canvas(foot);
    add(b.svg, 'path', { d: wave(b.w, 26, 1.6, 30, 0) + 'L' + (b.w + 10) + ' 32L-10 32Z' }, { fill: '--cb-biophilic-lichen' });
    for (x = 12 + r() * 20; x < b.w - 10; x += 34 + r() * 40) {
      var h = 7 + r() * 7, cw = 6 + r() * 5, cap = r() < 0.5 ? '--cb-biophilic-coral' : '--cb-biophilic-marigold';
      var m = group(b.svg, {}, { cls: 'art-rise', d: 1 + r() * 6, t: 2.6 });
      add(m, 'rect', { x: f(x - 1.6), y: f(26 - h), width: 3.2, height: f(h), rx: 1.4 }, { fill: '--cb-bar', stroke: '--cb-steel-2', sw: 0.8 });
      add(m, 'path', { d: 'M' + f(x - cw) + ' ' + f(26 - h + 1) + 'Q' + f(x) + ' ' + f(26 - h - cw * 1.1) + ' ' + f(x + cw) + ' ' + f(26 - h + 1) + 'Z' },
        { fill: cap, stroke: '--cb-steel-2', sw: 0.6 });
      add(m, 'circle', { cx: f(x - cw * 0.35), cy: f(26 - h - cw * 0.25), r: 0.9 }, { fill: '--cb-lcd' });
      add(m, 'circle', { cx: f(x + cw * 0.3), cy: f(26 - h - cw * 0.4), r: 0.8 }, { fill: '--cb-lcd' });
    }
    for (x = 6; x < b.w; x += 18 + r() * 26) {
      add(b.svg, 'path', { d: 'M' + f(x) + ' 27Q' + f(x - 2) + ' 21 ' + f(x - 4) + ' 18M' + f(x + 1) + ' 27Q' + f(x + 2) + ' 22 ' + f(x + 4) + ' 19' },
        { stroke: '--cb-steel-2', sw: 1, cls: 'art-sway', d: r() * 4, t: 5 + r() * 3 });
    }
    return { top: true, foot: true };
  };

  /* STAR STUFF: its night, stars in its own colours, and one ringed planet. */
  DRAW.starstuff = function (top, foot) {
    var r = seeded(1987), inks = ['--cb-steel', '--cb-amber', '--cb-starstuff-gold', '--cb-starstuff-pink', '--cb-starstuff-cyan', '--cb-starstuff-green'];
    [top, foot].forEach(function (box, which) {
      var c = canvas(box), n = Math.round(c.w / 14), k;
      for (k = 0; k < n; k++) {
        var x = r() * c.w, y = 3 + r() * (H - 6), big = r() < 0.25;
        var o = { fill: inks[Math.floor(r() * inks.length)], cls: 'art-twinkle', d: r() * 5, t: 3 + r() * 3 };
        if (big) add(c.svg, 'path', { d: sparkle(x, y, 2.8 + r() * 1.6) }, o);
        else add(c.svg, 'circle', { cx: f(x), cy: f(y), r: f(0.6 + r() * 0.8) }, o);
      }
      if (which === 0) {
        var px = c.w - 34;
        add(c.svg, 'circle', { cx: px, cy: 15, r: 7 }, { fill: '--cb-amber' });
        add(c.svg, 'ellipse', { cx: px, cy: 15, rx: 13, ry: 3.4, transform: 'rotate(-14 ' + px + ' 15)' }, { stroke: '--cb-starstuff-gold', sw: 1.4 });
      }
    });
    return { top: true, foot: true };
  };

  /* LCARS: a row of pill segments in its colours under the bar and at the
     foot, glowing in turn, slowly, like a panel at work. */
  DRAW.lcars = function (top, foot) {
    var r = seeded(1701), inks = ['--cb-amber', '--cb-lcars-peach', '--cb-steel-2', '--cb-amber-2', '--cb-lcars-gold', '--cb-lcars-red'];
    [[top, 12, 9], [foot, 8, 11]].forEach(function (spec) {
      var c = canvas(spec[0]), x = 6, i = 0;
      while (x < c.w - 14) {
        var w = Math.min(c.w - 6 - x, 16 + r() * 56);
        add(c.svg, 'rect', { x: f(x), y: spec[2], width: f(w), height: spec[1], rx: spec[1] / 2 },
          { fill: inks[Math.floor(r() * inks.length)], cls: 'art-glow', d: i * 0.45, t: 5.5 });
        x += w + 5; i++;
      }
    });
    return { top: true, foot: true };
  };

  /* MAX GLITTER: sparkles and confetti in every colour on the street. */
  DRAW.glitter = function (top, foot) {
    var r = seeded(2026), inks = ['--pink', '--orange', '--yellow', '--green', '--cyan', '--violet'];
    [top, foot].forEach(function (box) {
      var c = canvas(box), n = Math.round(c.w / 9), k;
      for (k = 0; k < n; k++) {
        var x = r() * c.w, y = 3 + r() * (H - 6), ink = inks[Math.floor(r() * inks.length)];
        if (r() < 0.45) add(c.svg, 'path', { d: sparkle(x, y, 2.4 + r() * 3.6) }, { fill: ink, cls: 'art-twinkle', d: r() * 4, t: 2.4 + r() * 2.4 });
        else add(c.svg, 'rect', { x: f(x), y: f(y), width: 3, height: 1.6, rx: 0.8, transform: 'rotate(' + f(r() * 180) + ' ' + f(x) + ' ' + f(y) + ')' },
          { fill: ink, cls: 'art-twinkle', d: r() * 4, t: 3 + r() * 3 });
      }
    });
    return { top: true, foot: true };
  };

  /* SOLARPUNK: art nouveau's whiplash vine in copper with sunflowers on it and
     a solar panel at the end, and water along the foot. */
  DRAW.solarpunk = function (top, foot) {
    var r = seeded(2072), c = canvas(top), x;
    var vine = '';
    for (x = -10; x <= c.w + 10; x += 4) vine += (vine ? 'L' : 'M') + f(x) + ' ' + f(15 + 8 * Math.sin(x / 38) * Math.cos(x / 97));
    add(c.svg, 'path', { d: vine, pathLength: 1 }, { stroke: '--cb-solarpunk-copper', sw: 1.6, cls: 'art-grow', t: 9 });
    for (x = 10; x < c.w - 50; x += 13 + r() * 8) {
      var y = 15 + 8 * Math.sin(x / 38) * Math.cos(x / 97), up = r() < 0.5 ? -1 : 1;
      var g = group(c.svg, { transform: 'translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(up * (50 + r() * 40)) + ')' });
      add(g, 'path', { d: 'M0 0Q3-3 0-9Q-3-3 0 0Z' }, { fill: '--cb-solarpunk-leaf', cls: 'art-pop', d: 0.5 + (x / c.w) * 8 });
    }
    for (x = 40 + r() * 30; x < c.w - 60; x += 90 + r() * 50) {
      var sy = 15 + 8 * Math.sin(x / 38) * Math.cos(x / 97), s = group(c.svg, {}, { cls: 'art-turn', d: r() * 4, t: 9 + r() * 4 });
      for (var p = 0; p < 12; p++) {
        var a = p * Math.PI / 6;
        add(s, 'ellipse', { cx: f(x + Math.cos(a) * 5.4), cy: f(sy + Math.sin(a) * 5.4), rx: 3.2, ry: 1.5, transform: 'rotate(' + f(p * 30) + ' ' + f(x + Math.cos(a) * 5.4) + ' ' + f(sy + Math.sin(a) * 5.4) + ')' },
          { fill: '--cb-solarpunk-sunflower' });
      }
      add(s, 'circle', { cx: f(x), cy: f(sy), r: 3.6 }, { fill: '--cb-solarpunk-copper' });
    }
    var px = c.w - 40;
    add(c.svg, 'path', { d: 'M' + px + ' 22L' + (px + 30) + ' 22L' + (px + 26) + ' 6L' + (px + 4) + ' 6Z' }, { fill: '--cb-solarpunk-panel', stroke: '--cb-steel-2', sw: 0.8 });
    add(c.svg, 'path', { d: 'M' + (px + 2) + ' 14L' + (px + 28) + ' 14M' + (px + 11) + ' 6L' + (px + 10) + ' 22M' + (px + 19) + ' 6L' + (px + 20) + ' 22' }, { stroke: '--cb-lcd', sw: 0.7 });
    var b = canvas(foot);
    add(b.svg, 'path', { d: wave(b.w, 22, 2.2, 14, 0) }, { stroke: '--cb-solarpunk-water', sw: 1.6 });
    add(b.svg, 'path', { d: wave(b.w, 26, 1.6, 11, 1.4) }, { stroke: '--cb-solarpunk-water', sw: 1.1 });
    for (x = 16 + r() * 20; x < b.w - 8; x += 30 + r() * 34) {
      var sp = group(b.svg, {}, { cls: 'art-sway', d: r() * 4, t: 6 + r() * 3 });
      add(sp, 'path', { d: 'M' + f(x) + ' 21Q' + f(x + 1) + ' 13 ' + f(x + 3) + ' 6' }, { stroke: '--cb-solarpunk-leaf', sw: 1.2 });
      add(sp, 'path', { d: 'M' + f(x + 1) + ' 14Q' + f(x + 6) + ' 11 ' + f(x + 8) + ' 13Q' + f(x + 5) + ' 15 ' + f(x + 1) + ' 14Z' }, { fill: '--cb-solarpunk-leaf' });
    }
    return { top: true, foot: true };
  };

  /* BIOMECHANICAL: a spine along the top, bone grown round tube, breathing in a
     slow wave, and ribbed piping along the foot. After H. R. Giger's
     biomechanics; drawn here, and copied from nothing of his. */
  DRAW.biomech = function (top, foot) {
    var c = canvas(top), x, i = 0;
    add(c.svg, 'path', { d: 'M-10 15L' + (c.w + 10) + ' 15' }, { stroke: '--cb-biomech-rib', sw: 9 });
    for (x = 6; x < c.w; x += 15, i++) {
      var v = group(c.svg, {}, { cls: 'art-breathe', d: i * 0.22, t: 5.5 });
      add(v, 'path', { d: 'M' + (x - 2) + ' 6Q' + (x + 6) + ' 3 ' + (x + 9) + ' 1M' + (x - 2) + ' 24Q' + (x + 6) + ' 27 ' + (x + 9) + ' 29' },
        { stroke: '--cb-biomech-bone', sw: 1.4 });
      add(v, 'ellipse', { cx: x, cy: 15, rx: 4.6, ry: 8.4 }, { fill: '--cb-biomech-bone', stroke: '--cb-biomech-rib', sw: 1 });
      add(v, 'path', { d: 'M' + (x - 1.5) + ' 9Q' + (x - 3) + ' 15 ' + (x - 1.5) + ' 21' }, { stroke: '--cb-biomech-sheen', sw: 1 });
    }
    var b = canvas(foot);
    add(b.svg, 'path', { d: 'M-10 16C' + f(b.w * 0.3) + ' 6 ' + f(b.w * 0.6) + ' 26 ' + (b.w + 10) + ' 14' }, { stroke: '--cb-biomech-rib', sw: 7 });
    for (x = 4, i = 0; x < b.w; x += 7, i++) {
      var y = 16 + (x < b.w * 0.45 ? -6 * Math.sin(Math.PI * x / (b.w * 0.9)) : 6 * Math.sin(Math.PI * (x - b.w * 0.45) / (b.w * 1.1)));
      add(b.svg, 'rect', { x: f(x - 2), y: f(y - 6), width: 4, height: 12, rx: 2 },
        { fill: '--cb-biomech-bone', cls: 'art-breathe', d: i * 0.12, t: 5.5 });
    }
    return { top: true, foot: true };
  };

  /* GREEBLE: a plate along each edge covered in small machined parts, vents,
     pipes, a hazard stripe and a few lamps that brighten and dim, slowly. */
  DRAW.greeble = function (top, foot) {
    var r = seeded(1977);
    [top, foot].forEach(function (box) {
      var c = canvas(box), x;
      add(c.svg, 'rect', { x: 0, y: 3, width: c.w, height: 24 }, { fill: '--cb-greeble-plate' });
      add(c.svg, 'path', { d: 'M0 3.5L' + c.w + ' 3.5' }, { stroke: '--cb-greeble-light', sw: 1 });
      add(c.svg, 'path', { d: 'M0 26.5L' + c.w + ' 26.5' }, { stroke: '--cb-greeble-shadow', sw: 1 });
      for (x = 4; x < c.w - 8;) {
        var kind = r(), w;
        if (kind < 0.45) {
          w = 6 + r() * 20;
          var h = 5 + r() * 12, y = 6 + r() * (18 - h);
          add(c.svg, 'rect', { x: f(x), y: f(y), width: f(w), height: f(h) }, { fill: r() < 0.5 ? '--cb-greeble-light' : '--cb-case', stroke: '--cb-greeble-shadow', sw: 0.8 });
        } else if (kind < 0.65) {
          w = 10 + r() * 8;
          for (var v = 0; v < w; v += 3) add(c.svg, 'path', { d: 'M' + f(x + v) + ' 9L' + f(x + v) + ' 21' }, { stroke: '--cb-greeble-shadow', sw: 1.2 });
        } else if (kind < 0.8) {
          w = 18 + r() * 24;
          add(c.svg, 'path', { d: 'M' + f(x) + ' ' + f(10 + r() * 10) + 'l' + f(w) + ' 0' }, { stroke: '--cb-greeble-shadow', sw: 2.6 });
        } else if (kind < 0.88) {
          w = 18;
          for (var s = 0; s < 18; s += 6) {
            add(c.svg, 'path', { d: 'M' + f(x + s) + ' 21l3 0l4-12l-3 0Z' }, { fill: '--cb-greeble-stripe' });
            add(c.svg, 'path', { d: 'M' + f(x + s + 3) + ' 21l3 0l4-12l-3 0Z' }, { fill: '--cb-greeble-shadow' });
          }
        } else {
          w = 6;
          add(c.svg, 'circle', { cx: f(x + 3), cy: f(10 + r() * 10), r: 1.9 },
            { fill: r() < 0.5 ? '--cb-greeble-lamp' : '--cb-greeble-go', cls: 'art-glow', d: r() * 4, t: 3.5 + r() * 2.5 });
        }
        x += w + 3 + r() * 5;
      }
    });
    return { top: true, foot: true };
  };

  /* CRIP CYBORG: a CPAP hose across the top, breathing, with an oxygen line
     under it and bubbles going along it; along the foot, oxygen on a rack, a
     PEG tube with its clamp and port, and a prosthetic leg. The kit some of us
     live with, drawn as ours. */
  DRAW.cyborg = function (top, foot) {
    var r = seeded(1973), c = canvas(top), x, i = 0;
    var hose = wave(c.w, 11, 3, 40, 0.3);
    add(c.svg, 'path', { d: hose }, { stroke: '--cb-cyborg-tube', sw: 8 });
    var ribs = group(c.svg, {}, { cls: 'art-breathe', t: 4.5 });
    for (x = -6; x < c.w + 6; x += 4) {
      var y = 11 + 3 * Math.sin(x / 40 + 0.3);
      add(ribs, 'path', { d: 'M' + f(x) + ' ' + f(y - 3.6) + 'L' + f(x) + ' ' + f(y + 3.6) }, { stroke: '--cb-case', sw: 0.9 });
    }
    add(c.svg, 'path', { d: wave(c.w, 23, 2, 30, 1.6) }, { stroke: '--cb-cyborg-tube', sw: 2.4 });
    for (x = 10; x < c.w; x += 28 + r() * 18, i++) {
      add(c.svg, 'circle', { cx: f(x), cy: f(23 + 2 * Math.sin(x / 30 + 1.6)), r: 1 }, { fill: '--cb-steel', cls: 'art-flow', d: r() * 5, t: 5, run: 26 });
    }
    var b = canvas(foot);
    add(b.svg, 'path', { d: 'M4 28L' + Math.min(70, b.w * 0.25) + ' 28' }, { stroke: '--cb-cyborg-metal', sw: 2 });
    [8, 22, 36].forEach(function (cx) {
      add(b.svg, 'rect', { x: cx, y: 9, width: 10, height: 19, rx: 4 }, { fill: '--cb-cyborg-oxygen' });
      add(b.svg, 'rect', { x: cx + 3, y: 5, width: 4, height: 5, rx: 1 }, { fill: '--cb-cyborg-metal' });
    });
    var mid = b.w * 0.5;
    add(b.svg, 'path', { d: 'M' + f(mid - 40) + ' 6Q' + f(mid - 18) + ' 30 ' + f(mid + 8) + ' 16' }, { stroke: '--cb-cyborg-tube', sw: 2.4 });
    add(b.svg, 'rect', { x: f(mid - 30), y: 13, width: 6, height: 7, rx: 1.5 }, { fill: '--cb-cyborg-clamp' });
    add(b.svg, 'circle', { cx: f(mid + 11), cy: 15, r: 4.4 }, { fill: '--cb-cyborg-port', stroke: '--cb-steel', sw: 1 });
    add(b.svg, 'circle', { cx: f(mid - 52), cy: 17, r: 1.1 }, { fill: '--cb-steel', cls: 'art-flow', t: 4, run: 30 });
    var lx = b.w - 30;
    add(b.svg, 'path', { d: 'M' + (lx - 5) + ' 2L' + (lx + 5) + ' 2L' + (lx + 3) + ' 10L' + (lx - 3) + ' 10Z' }, { fill: '--cb-steel-2' });
    add(b.svg, 'path', { d: 'M' + lx + ' 10L' + lx + ' 25' }, { stroke: '--cb-cyborg-metal', sw: 2.6 });
    add(b.svg, 'path', { d: 'M' + (lx - 3) + ' 25L' + (lx + 9) + ' 25Q' + (lx + 11) + ' 28 ' + (lx + 8) + ' 28L' + (lx - 3) + ' 28Z' }, { fill: '--cb-cyborg-metal' });
    return { top: true, foot: true };
  };

  /* UNICORN POOP: a rainbow, every pastel, sparkles, and along the foot the
     swirls the theme is named after. The gradients are in cb.css, on the
     trims and the border, for no reason at all. */
  DRAW.unicorn = function (top, foot) {
    var r = seeded(1999), bands = ['--cb-unicorn-pink', '--cb-unicorn-peach', '--cb-unicorn-lemon', '--cb-unicorn-mint', '--cb-unicorn-sky', '--cb-unicorn-lilac'];
    var c = canvas(top), x;
    bands.forEach(function (k, i) { add(c.svg, 'path', { d: wave(c.w, 8 + i * 3, 2.4, 26, 0) }, { stroke: k, sw: 3.2 }); });
    for (x = 8; x < c.w; x += 26 + r() * 30) {
      add(c.svg, 'path', { d: sparkle(x, 4 + r() * 22, 2.4 + r() * 2.4) }, { fill: '--cb-lcd', stroke: '--cb-steel-2', sw: 0.6, cls: 'art-twinkle', d: r() * 4, t: 3 + r() * 2 });
    }
    var b = canvas(foot);
    for (x = 18 + r() * 20; x < b.w - 14; x += 44 + r() * 40) {
      var s = group(b.svg, {}, { cls: 'art-rise', d: r() * 4, t: 1.6 });
      add(s, 'ellipse', { cx: f(x), cy: 25, rx: 11, ry: 4 }, { fill: bands[Math.floor(r() * 6)], stroke: '--cb-steel-2', sw: 0.6 });
      add(s, 'ellipse', { cx: f(x), cy: 19.5, rx: 8, ry: 3.6 }, { fill: bands[Math.floor(r() * 6)], stroke: '--cb-steel-2', sw: 0.6 });
      add(s, 'ellipse', { cx: f(x), cy: 14.5, rx: 5, ry: 3 }, { fill: bands[Math.floor(r() * 6)], stroke: '--cb-steel-2', sw: 0.6 });
      add(s, 'path', { d: 'M' + f(x) + ' 11.6Q' + f(x + 1) + ' 8 ' + f(x + 4) + ' 7' }, { stroke: '--cb-steel-2', sw: 0.9 });
      add(b.svg, 'path', { d: sparkle(x + 13, 9, 2.6) }, { fill: '--cb-unicorn-lemon', stroke: '--cb-steel-2', sw: 0.5, cls: 'art-twinkle', d: r() * 3, t: 3 });
    }
    return { top: true, foot: true };
  };

  /* WABI-SABI: one uneven brush stroke, a tea ring left by a cup, and a crack
     along the foot mended in gold. Nothing in it moves, at any setting. */
  DRAW.wabi = function (top, foot) {
    var r = seeded(1588), c = canvas(top);
    var x0 = c.w * (0.08 + r() * 0.1), x1 = c.w * (0.62 + r() * 0.2), up = '', down = '', x;
    for (x = x0; x <= x1; x += 6) {
      var t = (x - x0) / (x1 - x0), thick = 5.5 * Math.sin(Math.PI * Math.pow(t, 0.7)) + r() * 1.2;
      up += (up ? 'L' : 'M') + f(x) + ' ' + f(14 - thick / 2 + Math.sin(x / 31) * 2);
      down = 'L' + f(x) + ' ' + f(14 + thick / 2 + Math.sin(x / 31) * 2) + down;
    }
    add(c.svg, 'path', { d: up + down + 'Z' }, { fill: '--cb-steel' });
    for (var k = 0; k < 3; k++) {
      var gx = x0 + (x1 - x0) * (0.55 + r() * 0.4);
      add(c.svg, 'path', { d: 'M' + f(gx) + ' ' + f(12 + r() * 2) + 'l' + f(10 + r() * 14) + ' ' + f(r() - 0.5) }, { stroke: '--cb-case', sw: 0.8 });
    }
    add(c.svg, 'circle', { cx: f(c.w - 30), cy: 19, r: 11, 'stroke-dasharray': '58 6 6 4' }, { stroke: '--cb-wabi-stain', sw: 2.2 });
    var b = canvas(foot), crack = 'M-4 ' + f(12 + r() * 6), branch = null;
    for (x = 0; x < b.w + 8; x += 8 + r() * 14) {
      var y = 9 + r() * 12;
      crack += 'L' + f(x) + ' ' + f(y);
      if (!branch && x > b.w * 0.4) branch = 'M' + f(x) + ' ' + f(y) + 'L' + f(x + 9) + ' ' + f(y + 7) + 'L' + f(x + 16) + ' ' + f(y + 6);
    }
    add(b.svg, 'path', { d: crack }, { stroke: '--cb-wabi-gold', sw: 1.6 });
    if (branch) add(b.svg, 'path', { d: branch }, { stroke: '--cb-wabi-gold', sw: 1.1 });
    for (x = b.w - 26; x < b.w - 4; x += 3 + r() * 3) add(b.svg, 'circle', { cx: f(x), cy: f(24 + r() * 4), r: f(1 + r() * 1.4) }, { fill: '--cb-wabi-moss' });
    return { top: true, foot: true };
  };

  /* Draws theme's drawing into the two trims, or empties them for a theme with
     none. Says which trims it used. */
  function draw(theme, top, foot) {
    top.textContent = '';
    foot.textContent = '';
    var go = DRAW[theme];
    return go ? go(top, foot) : { top: false, foot: false };
  }
  window.loveCbArt = { draw: draw, has: function (t) { return !!DRAW[t]; } };
})();

/* =============================================================================
   Glow Wild Hollow, walked into on Paper Street. Ryan's ask, 2026-11-04: round
   1 of the rooms left on Paper Street.

   IT IS HELEN EDGAR'S ROOM AND HER WORLD (§129), and this is OURS: a drawing of
   her hollow in card for Paper Street, in the colours her room declares and
   nothing else, which changes nothing on her page and is hers to keep or send
   back. Her spaces, Air, Earth and Water, and Fire at the end, lie one after
   another down to the sea: fireflies over the grass, glow-worms on the bank
   and foxfire in a fallen log, the sea sparkling at its edge with a jellyfish's
   rim over the water. EVERY LIGHT DOWN HERE BELONGS TO SOMETHING ALIVE: no
   moon, no star, no lamp, no flame, and every light is a point where something
   living is, lighting nothing round it. The one exception is hers: the bonfire
   on the shore under Fire, the only light that is not alive, and the only
   thing that lights the ground round it. Her page stands on the shore beside
   it, on the deep water's dark, and no living light falls on it.

   ROUND 2 (Ryan, 2026-11-04) put in more of what her page says is down there,
   in the order her page has it: moths circling a knot of fireflies, pale only
   where the glow catches them; her whirlpool of light on the ground at the end
   of the grass, down into the earth; the old log on the slope with foxfire
   through its bark and glowing toadstools at its foot, and on the other slope
   glow-worms waiting at the tops of their grass stems; the rhizome's glowing
   threads wandering over the ground to her second whirlpool, down to the sea;
   a wave breaking with sparkle along its crest, plankton out on the water,
   and sparks over the bonfire in its ring of stones. Hills stand dark round
   all of it, under a sky with nothing in it. New places to stand among the
   moths, at both whirlpools, at the toadstools and at the water's edge.

   NOTHING MOVES: the sea sparkles and the jellyfish lights on her page when
   touched, and here they are drawn and still. Every colour is one her room
   declares, by name. It keeps nothing, sends nothing and fetches nothing; her
   page arrives through Paper Street's screen(). tools/make-paper-street.py
   holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }
  function seeded(n) {
    return function () {
      n = (n + 0x6D2B79F5) | 0;
      var t = Math.imul(n ^ (n >>> 15), 1 | n);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // A living light: a point, with the faintest halo, lighting nothing round it.
  function point(s, x, y, r, ink) {
    s.appendChild(el('circle', { cx: x, cy: y, r: r * 3, fill: ink, 'fill-opacity': '0.14' }));
    s.appendChild(el('circle', { cx: x, cy: y, r: r, fill: ink }));
  }
  // A blade of grass from the ground up, bending a little.
  function blade(s, x, base, top, lean, wdt) {
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--gwh-hill)', 'stroke-width': wdt || 4, 'stroke-linecap': 'round',
      d: 'M' + x + ' ' + base + ' Q' + (x + lean * 0.3) + ' ' + (base + top) / 2 + ' ' + (x + lean) + ' ' + top }));
  }

  // The hills all round, dark against a sky with nothing in it.
  function hills(w, h, r) {
    var s = svg(w, h), d = 'M0 ' + h, x = 0;
    while (x < w) {
      var nx = x + 260 + r() * 420, peak = h * (0.15 + r() * 0.45);
      d += ' Q' + (x + (nx - x) / 2) + ' ' + peak + ' ' + nx + ' ' + (h * (0.45 + r() * 0.3));
      x = nx;
    }
    s.appendChild(el('path', { fill: 'var(--gwh-hill)', d: d + ' L' + w + ' ' + h + ' Z' }));
    return s;
  }

  // Fireflies over the grass: points in the air, most of them low, rising out
  // of the grass, and the grass under them dark.
  function fireflies(w, h, r) {
    var s = svg(w, h);
    for (var x = 0; x < w; x += 9) blade(s, x + r() * 6, h, h - 40 - r() * 110, (r() - 0.5) * 30, 3 + r() * 3);
    for (var i = 0; i < 40; i++) {
      var y = h * (0.15 + Math.sqrt(r()) * 0.75);
      point(s, r() * w, y, 2.5 + r() * 3, 'var(--gwh-worm)');
    }
    return s;
  }

  // Moths, which make no light of their own, circling a knot of fireflies in
  // a spiral: two pale wings each, seen only by the glow beside them.
  function moths(w, h, r) {
    var s = svg(w, h), cx = w / 2, cy = h * 0.48;
    for (var i = 0; i < 18; i++) point(s, cx + (r() - 0.5) * 120, cy + (r() - 0.5) * 90, 3 + r() * 2.5, 'var(--gwh-worm)');
    for (var k = 0; k < 13; k++) {
      var a = k * 2.4, rad = 70 + k * 11, mx = cx + Math.cos(a) * rad, my = cy + Math.sin(a) * rad * 0.62;
      var dx = -Math.sin(a), dy = Math.cos(a) * 0.62, n = Math.sqrt(dx * dx + dy * dy); dx /= n; dy /= n;
      var px = -dy, py = dx, sz = 9 + r() * 5;
      [-1, 1].forEach(function (sd) {
        var wx = mx + px * sd * sz, wy = my + py * sd * sz;
        s.appendChild(el('path', { fill: 'var(--gwh-ink-2)', 'fill-opacity': '0.8',
          d: 'M' + (mx + dx * 3) + ' ' + (my + dy * 3) + ' L' + (wx + dx * sz * 0.7) + ' ' + (wy + dy * sz * 0.7) + ' L' + (wx - dx * sz * 0.5) + ' ' + (wy - dy * sz * 0.5) + ' L' + (mx - dx * 4) + ' ' + (my - dy * 4) + ' Z' }));
      });
    }
    return s;
  }

  // The other slope: a dark bank, grass all over it, and here and there a
  // glow-worm sitting at the very top of a stem, not moving. It is waiting.
  function bank(w, h, r) {
    var s = svg(w, h);
    var top = function (x) { var u = x / w; return h * (0.9 - Math.sin(u * Math.PI * 0.95) * 0.72); };
    var d = 'M0 ' + h;
    for (var x = 0; x <= w; x += 20) d += ' L' + x + ' ' + top(x);
    s.appendChild(el('path', { fill: 'var(--gwh-hill)', d: d + ' L' + w + ' ' + h + ' Z' }));
    for (var i = 0; i < 26; i++) {
      var sx = w * (0.06 + r() * 0.88), base = top(sx) + 14 + r() * (h - top(sx) - 30), sh = 50 + r() * 70, lean = (r() - 0.5) * 24;
      blade(s, sx, base, base - sh, lean, 3);
      point(s, sx + lean, base - sh - 3, 4, 'var(--gwh-worm)');
    }
    for (var g = 0; g < 80; g++) {
      var gx = r() * w, gb = top(gx) + 6;
      blade(s, gx, gb, gb - 18 - r() * 30, (r() - 0.5) * 16, 3);
    }
    return s;
  }

  // The old log on the slope, foxfire green where fungi grow through its bark:
  // little shelves of light along it, and its cracks lit from inside.
  function log(w, h, r) {
    var s = svg(w, h), y0 = h * 0.25, lh = h * 0.75, rad = lh / 2;
    s.appendChild(el('rect', { x: 0, y: y0, width: w, height: lh, rx: rad, fill: 'var(--gwh-fire-log)' }));
    s.appendChild(el('ellipse', { cx: w - rad, cy: y0 + rad, rx: rad * 0.6, ry: rad * 0.86, fill: 'var(--gwh-hill)' }));
    s.appendChild(el('ellipse', { cx: w - rad, cy: y0 + rad, rx: rad * 0.32, ry: rad * 0.48, fill: 'none', stroke: 'var(--gwh-deep)', 'stroke-width': 3 }));
    for (var i = 0; i < 9; i++) {
      var x = w * (0.06 + i * 0.09);
      s.appendChild(el('path', { fill: 'none', stroke: 'var(--gwh-fox)', 'stroke-width': 4, 'stroke-linecap': 'round',
        d: 'M' + x + ' ' + (y0 + lh * 0.2) + ' q' + (10 + r() * 20) + ' ' + lh * 0.2 + ' ' + (r() * 30) + ' ' + lh * 0.5 }));
    }
    for (var k = 0; k < 34; k++) {
      var bx = w * (0.05 + r() * 0.78), by = y0 + lh * (0.1 + r() * 0.75), bw = 6 + r() * 10;
      s.appendChild(el('path', { fill: 'var(--gwh-fox)', d: 'M' + (bx - bw) + ' ' + by + ' Q' + bx + ' ' + (by - bw * 0.9) + ' ' + (bx + bw) + ' ' + by + ' Z' }));
    }
    return s;
  }

  // Glowing toadstools at the foot of the log: stems and caps alight, the
  // gills a line of brighter green under each cap.
  function toadstools(w, h, r) {
    var s = svg(w, h);
    for (var i = 0; i < 9; i++) {
      var x = w * (0.08 + r() * 0.84), sh = h * (0.25 + r() * 0.55), cw = 14 + r() * 18, base = h - 4 - r() * 14;
      s.appendChild(el('path', { fill: 'none', stroke: 'var(--gwh-fox)', 'stroke-width': 4 + r() * 3, 'stroke-linecap': 'round',
        d: 'M' + x + ' ' + base + ' q' + (r() - 0.5) * 14 + ' ' + -sh / 2 + ' ' + (r() - 0.5) * 8 + ' ' + -sh }));
      var cy = base - sh;
      s.appendChild(el('path', { fill: 'var(--gwh-fox)', 'fill-opacity': '0.75', d: 'M' + (x - cw) + ' ' + cy + ' Q' + x + ' ' + (cy - cw * 1.1) + ' ' + (x + cw) + ' ' + cy + ' Z' }));
      s.appendChild(el('line', { x1: x - cw, y1: cy, x2: x + cw, y2: cy, stroke: 'var(--gwh-fox)', 'stroke-width': 3 }));
    }
    for (var g = 0; g < 30; g++) blade(s, r() * w, h, h - 10 - r() * 26, (r() - 0.5) * 12, 3);
    return s;
  }

  // A wave coming in and breaking at the edge, lit along its crest where it
  // moves, as sea sparkle is.
  function wave(w, h, r) {
    var s = svg(w, h), crest = h * 0.4;
    var d = 'M0 ' + h + ' L0 ' + (crest + 20);
    for (var x = 0; x <= w; x += 40) d += ' Q' + (x + 20) + ' ' + (crest - 10 + r() * 14) + ' ' + (x + 40) + ' ' + (crest + 6 + r() * 12);
    s.appendChild(el('path', { fill: 'var(--gwh-wave)', d: d + ' L' + w + ' ' + h + ' Z' }));
    for (var i = 0; i < 70; i++) point(s, r() * w, crest + (r() - 0.3) * 22, 2 + r() * 2.5, 'var(--gwh-sea)');
    for (var k = 0; k < 24; k++) point(s, r() * w, crest + 30 + r() * (h - crest - 40), 1.6, 'var(--gwh-sea)');
    return s;
  }

  // The jellyfish over the water: its bell a rim of light, its trailing arms.
  function jellyfish(w, h) {
    var s = svg(w, h), bw = w * 0.7, bx = (w - bw) / 2, by = h * 0.36;
    s.appendChild(el('path', { fill: 'var(--gwh-wave)', 'fill-opacity': '0.5', stroke: 'var(--gwh-sea)', 'stroke-width': 6,
      d: 'M' + bx + ' ' + by + ' A' + bw / 2 + ' ' + by * 0.9 + ' 0 0 1 ' + (bx + bw) + ' ' + by + ' Z' }));
    // The canals running out to the rim, seen only at their edges.
    for (var c = 1; c < 8; c++) {
      var cx = bx + bw * c / 8;
      s.appendChild(el('line', { x1: w / 2, y1: by * 0.25, x2: cx, y2: by - 4, stroke: 'var(--gwh-fox)', 'stroke-width': 1.5, 'stroke-opacity': '0.6' }));
    }
    for (var i = 0; i < 6; i++) {
      var x = bx + 20 + i * (bw - 40) / 5;
      s.appendChild(el('path', { fill: 'none', stroke: 'var(--gwh-sea)', 'stroke-width': 3, 'stroke-opacity': '0.7',
        d: 'M' + x + ' ' + by + ' q' + (i % 2 ? 18 : -18) + ' ' + h * 0.18 + ' 0 ' + h * 0.32 + ' t0 ' + h * 0.28 }));
    }
    return s;
  }

  // Her bonfire on the shore, in its ring of stones: logs, embers, flames and
  // sparks going up, and the only thing down here that lights anything round it.
  function bonfire(w, h, r) {
    var s = svg(w, h), cx = w / 2, base = h - 40;
    s.appendChild(el('ellipse', { cx: cx, cy: base - h * 0.25, rx: w * 0.48, ry: h * 0.38, fill: 'var(--gwh-flame)', 'fill-opacity': '0.12' }));
    for (var k = 0; k < 22; k++) {
      var sy = base - h * 0.45 - r() * h * 0.45, sx = cx + (r() - 0.5) * w * 0.5 * (1 - (sy / h));
      s.appendChild(el('circle', { cx: sx, cy: sy, r: 2 + r() * 2.5, fill: k % 3 ? 'var(--gwh-flame-2)' : 'var(--gwh-ember)' }));
    }
    s.appendChild(el('path', { fill: 'var(--gwh-ember)', d: 'M' + (cx - w * 0.3) + ' ' + base + ' Q' + (cx - w * 0.1) + ' ' + h * 0.4 + ' ' + cx + ' ' + h * 0.26 +
      ' Q' + (cx + w * 0.12) + ' ' + h * 0.45 + ' ' + (cx + w * 0.3) + ' ' + base + ' Z' }));
    s.appendChild(el('path', { fill: 'var(--gwh-flame)', d: 'M' + (cx - w * 0.2) + ' ' + base + ' Q' + (cx - w * 0.04) + ' ' + h * 0.5 + ' ' + cx + ' ' + h * 0.36 +
      ' Q' + (cx + w * 0.08) + ' ' + h * 0.55 + ' ' + (cx + w * 0.2) + ' ' + base + ' Z' }));
    s.appendChild(el('path', { fill: 'var(--gwh-flame-2)', d: 'M' + (cx - w * 0.1) + ' ' + base + ' Q' + cx + ' ' + h * 0.64 + ' ' + (cx + w * 0.1) + ' ' + base + ' Z' }));
    s.appendChild(el('rect', { x: cx - w * 0.36, y: base - 6, width: w * 0.72, height: 22, rx: 11, fill: 'var(--gwh-fire-log)' }));
    s.appendChild(el('rect', { x: cx - w * 0.28, y: base + 6, width: w * 0.56, height: 20, rx: 10, fill: 'var(--gwh-fire-log)' }));
    for (var st = 0; st < 9; st++) {
      var stx = w * (0.08 + st * 0.105);
      s.appendChild(el('ellipse', { cx: stx, cy: base + 26, rx: 20 + r() * 6, ry: 13, fill: 'var(--gwh-hill)', stroke: 'var(--gwh-fire-log)', 'stroke-width': 2 }));
    }
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['glow-wild-hollow.html'] = {
    prefix: 'hollow-walk',
    from: 'faery-yurt.html',
    build: function (kit) {
      var r = seeded(129);
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 940), sh = kit.H - 24;
      var WHIRL1 = 1500, WHIRL2 = 3200;           // the two whirlpools down
      var END = 3900 + F;                          // the shore
      var eye = sh / 2;
      var decor = [];

      // The hills all round, far off, and nothing in the sky over them.
      decor.push(kit.item(hills(9000, 1100, r), { x: 0, z: END + 4200, w: 9000, h: 1100 }));
      [-1, 1].forEach(function (side) {
        decor.push(kit.item(hills(5000, 700, r), { x: side * 3200, z: END - 600, w: 5000, h: 700, turn: side * 1.2 }));
      });

      // AIR: fireflies over the grass, either side of where you stand, and a
      // knot of them on the right with moths circling it.
      [-1, 1].forEach(function (side) {
        decor.push(kit.item(fireflies(900, 520, r), { x: side * 560, z: 900, w: 900, h: 520, turn: side * 0.2 }));
      });
      var mo = kit.item(moths(420, 360, r), { x: 520, z: 1250, y: 70, w: 420, h: 360, turn: -0.35 });
      decor.push(mo);
      // EARTH: the bank with its glow-worms on the left, the log full of
      // foxfire on the right, and the glowing toadstools at its foot.
      var b = kit.item(bank(1100, 460, r), { x: -760, z: 2100, w: 1100, h: 460, turn: 0.35 });
      var l = kit.item(log(700, 180, r), { x: 560, z: 2200, w: 700, h: 180, turn: -0.4 });
      var ts = kit.item(toadstools(380, 150, r), { x: 380, z: 2560, w: 380, h: 150, turn: -0.3 });
      decor.push(b, l, ts);
      // WATER: a wave breaking at the edge, and the jellyfish out past it.
      var wv = kit.item(wave(900, 160, r), { x: -1100, z: END + 220, w: 900, h: 160 });
      decor.push(wv);
      decor.push(kit.item(jellyfish(300, 420), { x: -900, z: END + 700, w: 300, h: 420, y: 60 }));
      // FIRE: her bonfire on the shore, to the right of her page.
      var fire = kit.item(bonfire(380, 460, r), { x: sw / 2 + 360, z: END - 60, w: 380, h: 460 });
      decor.push(fire);

      var page = kit.screen(kit.page, 'Helen’s Glow Wild Hollow’s own page, standing on the shore');
      var leaf = kit.item(page, { x: -120, z: END, w: sw, h: sh, cls: 'hollow-walk-page' });

      var stops = [
        kit.stop({ name: 'under the mushroom you came down through, in Air, fireflies over the grass', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'among the moths, circling the fireflies’ glow', spot: kit.front(mo, F * 1.4) }, mo),
        kit.stop({ name: 'at the whirlpool of light on the ground, down into the earth', spot: { x: 0, z: WHIRL1 - 520 } }),
        kit.stop({ name: 'in Earth, at the bank, its glow-worms waiting at the tops of the grass stems', spot: kit.front(b, F * 1.1) }, b),
        kit.stop({ name: 'at the fallen log, foxfire in its cracks', spot: kit.front(l, F * 0.8) }, l),
        kit.stop({ name: 'at the foot of the log, by the glowing toadstools', spot: kit.front(ts, F * 0.6) }, ts),
        kit.stop({ name: 'at the watery whirlpool, down through the rhizome to the sea', spot: { x: 0, z: WHIRL2 - 520 } }),
        kit.stop({ name: 'at the water’s edge, a wave sparkling as it breaks, the jellyfish out past it', spot: kit.front(wv, F * 1.0) }, wv),
        kit.stop({ name: 'on the shore under Fire, by her bonfire, the sea sparkling at its edge', spot: kit.front(fire, F * 1.25) }, fire),
        kit.stop({ name: 'on the shore, with her own page standing there', spot: { x: -120, z: END - F }, link: page }, leaf)
      ];

      // Her whirl, laid on the ground: three arms of light winding in to a
      // dark middle, in the inks she drew each one in.
      function whirl(g, cx, cz, R, inks) {
        kit.oval(g, cx, cz, R * 1.15, R * 1.15, kit.ink('--gwh-deep'), 0.9);
        kit.oval(g, cx, cz, R * 0.75, R * 0.75, kit.ink('--gwh-wave'), 0.6);
        for (var arm = 0; arm < 3; arm++) {
          for (var i = 0; i < 70; i++) {
            var u = i / 70, rad = R * Math.pow(1 - u, 1.4) + 6, a = arm * 2.094 + u * 9.5;
            var sz = 4 + u * 9;
            kit.oval(g, cx + Math.cos(a) * rad, cz + Math.sin(a) * rad, sz * 2.2, sz * 2.2, kit.ink(inks[(i + arm) % inks.length]), 0.18);
            kit.oval(g, cx + Math.cos(a) * rad, cz + Math.sin(a) * rad, sz, sz, kit.ink(inks[(i + arm) % inks.length]), 0.9);
          }
        }
        kit.oval(g, cx, cz, R * 0.14, R * 0.14, kit.ink('--gwh-night'), 1);
      }

      return {
        cls: 'hollow-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Her own page stands on the shore at the far end, by the bonfire under Fire.',
        bounds: function () { return { x: [-1300, 1300], z: [0, END - F * 0.6] }; },
        ground: function (g, from, to) {
          var night = kit.ink('--gwh-night'), hill = kit.ink('--gwh-hill');
          var rr = seeded(7);                      // the same ground every time it is drawn
          kit.quad(g, -4000, 4000, from, to, night);
          // The grass, darker tufts of it, down to the shore.
          for (var i = 0; i < 220; i++) kit.oval(g, -1800 + rr() * 3600, rr() * (END - 200), 60 + rr() * 120, 30 + rr() * 50, hill, 0.8);
          // The two whirlpools down: into the earth, and through the rhizome.
          whirl(g, 0, WHIRL1, 260, ['--gwh-worm', '--gwh-fox', '--gwh-fox', '--gwh-ink']);
          whirl(g, 0, WHIRL2, 230, ['--gwh-fox', '--gwh-sea', '--gwh-sea', '--gwh-ink']);
          // The rhizome's threads, glowing, wandering over the ground from
          // under the log down to the second whirlpool.
          var fox = kit.ink('--gwh-fox'), sea = kit.ink('--gwh-sea');
          for (var t = 0; t < 8; t++) {
            var x = -500 + rr() * 1100, z = 2250 + rr() * 300, a = 0;
            for (var s2 = 0; s2 < 60; s2++) {
              a += (rr() - 0.5) * 0.6;
              a += (Math.atan2(-x, WHIRL2 - z) - a) * 0.08;
              x += Math.sin(a) * 14; z += Math.cos(a) * 14;
              kit.oval(g, x, z, 4, 4, s2 > 44 ? sea : fox, 0.55);
              if (z > WHIRL2 - 120) break;
            }
          }
          // The shore, and the sea past it.
          kit.quad(g, -4000, 4000, END + 120, END + 6000, kit.ink('--gwh-wave'));
          kit.quad(g, -4000, 4000, END + 120, END + 180, kit.ink('--gwh-deep'));
          // The sea sparkling at its edge: points, where something living is,
          // and further out a few of its own lights, plankton where it moves.
          for (var k = 0; k < 120; k++) kit.oval(g, -2000 + rr() * 4000, END + 140 + rr() * 260, 10, 6, sea, 0.9);
          for (k = 0; k < 90; k++) kit.oval(g, -3000 + rr() * 6000, END + 600 + rr() * 4000, 9, 5, sea, 0.6);
          // The bonfire's light on the shore round it, and nowhere else.
          kit.oval(g, sw / 2 + 360, END - 60, 520, 380, kit.ink('--gwh-flame'), 0.14);
        }
      };
    }
  };
})();

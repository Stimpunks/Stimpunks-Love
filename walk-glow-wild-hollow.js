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

  // Fireflies over the grass: points in the air, and the grass under them dark.
  function fireflies(w, h, r) {
    var s = svg(w, h);
    for (var i = 0; i < 26; i++) point(s, r() * w, r() * h * 0.7, 3 + r() * 3, 'var(--gwh-worm)');
    for (var x = 0; x < w; x += 18) {
      var t = h - 30 - r() * 60;
      s.appendChild(el('path', { fill: 'none', stroke: 'var(--gwh-hill)', 'stroke-width': 5, d: 'M' + x + ' ' + h + ' Q' + (x + 6) + ' ' + (t + 30) + ' ' + (x + 12) + ' ' + t }));
    }
    return s;
  }

  // The bank: a dark mound of earth with glow-worms in its grass.
  function bank(w, h, r) {
    var s = svg(w, h);
    s.appendChild(el('path', { fill: 'var(--gwh-hill)', d: 'M0 ' + h + ' Q' + w * 0.2 + ' ' + h * 0.1 + ' ' + w * 0.55 + ' ' + h * 0.2 + ' Q' + w * 0.9 + ' ' + h * 0.3 + ' ' + w + ' ' + h + ' Z' }));
    for (var i = 0; i < 18; i++) point(s, w * (0.1 + r() * 0.8), h * (0.35 + r() * 0.55), 4, 'var(--gwh-worm)');
    return s;
  }

  // A fallen log with foxfire along it, green, in its cracks.
  function log(w, h, r) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: h * 0.25, width: w, height: h * 0.75, rx: h * 0.37, fill: 'var(--gwh-fire-log)' }));
    s.appendChild(el('ellipse', { cx: w - h * 0.37, cy: h * 0.62, rx: h * 0.22, ry: h * 0.32, fill: 'var(--gwh-hill)' }));
    for (var i = 0; i < 7; i++) {
      var x = w * (0.08 + i * 0.11);
      s.appendChild(el('path', { fill: 'none', stroke: 'var(--gwh-fox)', 'stroke-width': 5, 'stroke-linecap': 'round',
        d: 'M' + x + ' ' + h * 0.4 + ' q' + (10 + r() * 20) + ' ' + h * 0.15 + ' ' + (r() * 30) + ' ' + h * 0.38 }));
    }
    return s;
  }

  // The jellyfish over the water: its bell a rim of light, its trailing arms.
  function jellyfish(w, h) {
    var s = svg(w, h), bw = w * 0.7, bx = (w - bw) / 2, by = h * 0.36;
    s.appendChild(el('path', { fill: 'var(--gwh-wave)', 'fill-opacity': '0.5', stroke: 'var(--gwh-sea)', 'stroke-width': 6,
      d: 'M' + bx + ' ' + by + ' A' + bw / 2 + ' ' + by * 0.9 + ' 0 0 1 ' + (bx + bw) + ' ' + by + ' Z' }));
    for (var i = 0; i < 6; i++) {
      var x = bx + 20 + i * (bw - 40) / 5;
      s.appendChild(el('path', { fill: 'none', stroke: 'var(--gwh-sea)', 'stroke-width': 3, 'stroke-opacity': '0.7',
        d: 'M' + x + ' ' + by + ' q' + (i % 2 ? 18 : -18) + ' ' + h * 0.18 + ' 0 ' + h * 0.32 + ' t0 ' + h * 0.28 }));
    }
    return s;
  }

  // Her bonfire on the shore: logs, embers and flames, and the only thing
  // down here that lights anything round it.
  function bonfire(w, h) {
    var s = svg(w, h), cx = w / 2, base = h - 30;
    s.appendChild(el('ellipse', { cx: cx, cy: base - h * 0.3, rx: w * 0.48, ry: h * 0.42, fill: 'var(--gwh-flame)', 'fill-opacity': '0.12' }));
    s.appendChild(el('path', { fill: 'var(--gwh-ember)', d: 'M' + (cx - w * 0.3) + ' ' + base + ' Q' + (cx - w * 0.1) + ' ' + h * 0.35 + ' ' + cx + ' ' + h * 0.18 +
      ' Q' + (cx + w * 0.12) + ' ' + h * 0.4 + ' ' + (cx + w * 0.3) + ' ' + base + ' Z' }));
    s.appendChild(el('path', { fill: 'var(--gwh-flame)', d: 'M' + (cx - w * 0.2) + ' ' + base + ' Q' + (cx - w * 0.04) + ' ' + h * 0.45 + ' ' + cx + ' ' + h * 0.3 +
      ' Q' + (cx + w * 0.08) + ' ' + h * 0.5 + ' ' + (cx + w * 0.2) + ' ' + base + ' Z' }));
    s.appendChild(el('path', { fill: 'var(--gwh-flame-2)', d: 'M' + (cx - w * 0.1) + ' ' + base + ' Q' + cx + ' ' + h * 0.6 + ' ' + (cx + w * 0.1) + ' ' + base + ' Z' }));
    s.appendChild(el('rect', { x: cx - w * 0.36, y: base - 6, width: w * 0.72, height: 26, rx: 13, fill: 'var(--gwh-fire-log)' }));
    s.appendChild(el('rect', { x: cx - w * 0.28, y: base + 8, width: w * 0.56, height: 22, rx: 11, fill: 'var(--gwh-fire-log)' }));
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
      var END = 3200 + F;                          // the shore
      var eye = sh / 2;
      var decor = [];

      // AIR: fireflies over the grass, either side of where you stand.
      [-1, 1].forEach(function (side) {
        decor.push(kit.item(fireflies(900, 520, r), { x: side * 520, z: 1000, w: 900, h: 520, turn: side * 0.2 }));
      });
      // EARTH: the bank with its glow-worms, and a fallen log full of foxfire.
      var b = kit.item(bank(1100, 420, r), { x: -760, z: 1700, w: 1100, h: 420, turn: 0.35 });
      var l = kit.item(log(700, 180, r), { x: 520, z: 1900, w: 700, h: 180, turn: -0.4 });
      decor.push(b, l);
      // WATER: the jellyfish over the sea past the shore.
      decor.push(kit.item(jellyfish(300, 420), { x: -900, z: END + 700, w: 300, h: 420, y: 60 }));
      // FIRE: her bonfire on the shore, to the right of her page.
      var fire = kit.item(bonfire(380, 420), { x: sw / 2 + 360, z: END - 60, w: 380, h: 420 });
      decor.push(fire);

      var page = kit.screen(kit.page, 'Helen’s Glow Wild Hollow’s own page, standing on the shore');
      var leaf = kit.item(page, { x: -120, z: END, w: sw, h: sh, cls: 'hollow-walk-page' });

      var stops = [
        kit.stop({ name: 'under the mushroom you came down through, in Air, fireflies over the grass', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'in Earth, at the bank, its glow-worms in the grass', spot: kit.front(b, F * 1.1) }, b),
        kit.stop({ name: 'at the fallen log, foxfire in its cracks', spot: kit.front(l, F * 0.8) }, l),
        kit.stop({ name: 'on the shore under Fire, by her bonfire, the sea sparkling at its edge', spot: kit.front(fire, F * 0.9) }, fire),
        kit.stop({ name: 'on the shore, with her own page standing there', spot: { x: -120, z: END - F }, link: page }, leaf)
      ];

      return {
        cls: 'hollow-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Her own page stands on the shore at the far end, by the bonfire under Fire.',
        bounds: function () { return { x: [-900, 900], z: [0, END - F * 0.6] }; },
        ground: function (g, from, to) {
          var night = kit.ink('--gwh-night'), hill = kit.ink('--gwh-hill');
          var r = seeded(7);                       // the same ground every time it is drawn
          kit.quad(g, -4000, 4000, from, to, night);
          // The grass, darker tufts of it, down to the shore.
          for (var i = 0; i < 160; i++) kit.oval(g, -1800 + r() * 3600, r() * (END - 200), 60 + r() * 120, 30 + r() * 50, hill, 0.8);
          // The shore, and the sea past it.
          kit.quad(g, -4000, 4000, END + 120, END + 6000, kit.ink('--gwh-wave'));
          kit.quad(g, -4000, 4000, END + 120, END + 180, kit.ink('--gwh-deep'));
          // The sea sparkling at its edge: points, where something living is.
          var sea = kit.ink('--gwh-sea');
          for (var k = 0; k < 90; k++) kit.oval(g, -2000 + r() * 4000, END + 140 + r() * 260, 10, 6, sea, 0.9);
          // The bonfire's light on the shore round it, and nowhere else.
          kit.oval(g, sw / 2 + 360, END - 60, 520, 380, kit.ink('--gwh-flame'), 0.14);
        }
      };
    }
  };
})();

/* =============================================================================
   Hear Queer Here, walked into on Paper Street. Ryan's ask, 2026-11-04: round
   one of the rest of the rooms, each its own world in card.

   IT IS THIS ROOM'S WORLD AND NOBODY ELSE'S (§8): deep space and interference
   fringes, the street's own neon on the dark. So the room is the experiment
   its page argues from, cut out of card and stood in the dark with nothing
   round it but stars: a source on a pedestal, a barrier across the way with
   two slits in it, and at the far end the detector, striped cyan and pink
   where the pattern lands, with the room's own page in the middle of it. You
   see the page first through the two slits, which is the point. There are no
   walls, because space has none.

   THE LIGHT IS THE SOURCE'S AND NOTHING ELSE'S: a violet beam drawn on the
   dark from the pedestal to the slits, and the fringes beyond them, cyan and
   pink and still unmeasured. The beam and the fringes are drawn and stay where
   they are; nothing moves at any setting, and nothing makes a sound until a
   player on the page is pressed. Every colour is one love.css declares, by
   name: §8's four neons and the street's own three inks for the dark. It keeps
   nothing, sends nothing and fetches nothing; its page arrives through Paper
   Street's screen(). tools/make-paper-street.py holds each of those.
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
  // A fixed number for a place in the dark, so the stars never shift.
  function hash(i, j, k) {
    var n = Math.imul(i + 3, 374761393) ^ Math.imul(j + 11, 668265263) ^ Math.imul(k + 5, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  // The source on its pedestal: a dark column and a lamp head, its aperture
  // the one bright point, violet.
  function source(w, h) {
    var s = svg(w, h), m = w / 2;
    s.appendChild(el('rect', { x: m - 30, y: h * 0.42, width: 60, height: h * 0.58, fill: 'var(--ink-2)', stroke: 'var(--ink-3)', 'stroke-width': 4 }));
    s.appendChild(el('rect', { x: m - 90, y: h - 22, width: 180, height: 22, fill: 'var(--ink-3)' }));
    s.appendChild(el('rect', { x: m - 80, y: h * 0.18, width: 160, height: h * 0.26, rx: 14, fill: 'var(--ink-2)', stroke: 'var(--violet)', 'stroke-width': 5 }));
    s.appendChild(el('circle', { cx: m, cy: h * 0.31, r: 26, fill: 'var(--violet)', 'fill-opacity': '0.25' }));
    s.appendChild(el('circle', { cx: m, cy: h * 0.31, r: 11, fill: 'var(--violet)' }));
    return s;
  }

  // One piece of the barrier: dark card edged in violet on the side that
  // faces a slit, so each slit reads as a gap with light at its lips.
  function barrier(w, h, lip) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--ink-3)' }));
    if (lip < 0 || lip === 0) s.appendChild(el('rect', { x: 0, y: 0, width: 8, height: h, fill: 'var(--violet)' }));
    if (lip > 0 || lip === 0) s.appendChild(el('rect', { x: w - 8, y: 0, width: 8, height: h, fill: 'var(--violet)' }));
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: 8, fill: 'var(--violet)' }));
    return s;
  }

  // The detector the page is set in: the pattern where it lands, the room's
  // two fringes laid over one another as on the page, cyan at one spacing and
  // pink at another, and a few stars beyond its edges.
  function detector(w, h, gap) {
    var s = svg(w, h), m = w / 2;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--ink)' }));
    for (var x = 0; x < w; x += 52) {
      var near = 1 - Math.min(1, Math.abs(x - m) / (w / 2));
      s.appendChild(el('rect', { x: x, y: 0, width: 8, height: h, fill: 'var(--cyan)', 'fill-opacity': (0.12 + near * 0.4).toFixed(2) }));
    }
    for (x = 0; x < w; x += 58) {
      var nr = 1 - Math.min(1, Math.abs(x - m) / (w / 2));
      s.appendChild(el('rect', { x: x + 20, y: 0, width: 8, height: h, fill: 'var(--pink)', 'fill-opacity': (0.1 + nr * 0.35).toFixed(2) }));
    }
    // The frame round the page: the measuring edge.
    s.appendChild(el('rect', { x: m - gap / 2 - 18, y: 30, width: gap + 36, height: h - 60, fill: 'var(--ink)', stroke: 'var(--green)', 'stroke-width': 4 }));
    return s;
  }

  // Stars, far off in every direction: a flat of the dark, dotted.
  function stars(w, h, seed) {
    var s = svg(w, h), inks = ['var(--cyan)', 'var(--pink)', 'var(--green)', 'var(--violet)'];
    for (var i = 0; i < 70; i++) {
      var x = hash(i, seed, 1) * w, y = hash(i, seed, 2) * h, r = 1.5 + hash(i, seed, 3) * 3.5;
      s.appendChild(el('circle', { cx: x, cy: y, r: r, fill: hash(i, seed, 4) < 0.6 ? 'var(--ink-3)' : inks[Math.floor(hash(i, seed, 5) * 4)] }));
    }
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['hear-queer-here.html'] = {
    prefix: 'quantum-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 3200 + F;                       // where the detector stands
      var BAR = 1700;                           // where the barrier crosses
      var eye = sh / 2;
      var SLIT = 320, PILLAR = 70;              // each slit's width, the pillar between
      var decor = [];

      decor.push(kit.item(stars(4200, 1600), { x: 0, z: END + 900, w: 4200, h: 1600 }));
      [-1, 1].forEach(function (side) {
        decor.push(kit.item(stars(2400, 1400, side + 3), { x: side * 2100, z: END - 600, w: 2400, h: 1400,
          turn: side < 0 ? kit.LEFT : kit.RIGHT }));
      });
      decor.push(kit.item(source(170, 200), { x: -240, z: 520, w: 170, h: 200 }));

      // THE BARRIER: a wall of card either side, a narrow pillar between two
      // slits, so from the source you see the far end only through them.
      var wing = 1500, bh = sh + 160;
      decor.push(kit.item(barrier(PILLAR, bh, 0), { x: 0, z: BAR, w: PILLAR, h: bh }));
      [-1, 1].forEach(function (side) {
        decor.push(kit.item(barrier(wing, bh, side < 0 ? 1 : -1), {
          x: side * (PILLAR / 2 + SLIT + wing / 2), z: BAR, w: wing, h: bh }));
      });

      var dw = 3400, dh = sh + 360;
      decor.push(kit.item(detector(dw, dh, sw), { x: 0, z: END + 30, w: dw, h: dh }));
      var page = kit.screen(kit.page, 'Hear Queer Here’s own page, set in the detector where the pattern lands');
      var screen = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'quantum-walk-detector' });

      var stops = [
        kit.stop({ name: 'beside the source, its light thrown at the barrier', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the barrier, in front of its two slits', spot: { x: 0, z: BAR - 520 } }),
        kit.stop({ name: 'through the left-hand slit, where the light goes one way', spot: { x: -(PILLAR / 2 + SLIT / 2), z: BAR + 160 } }),
        kit.stop({ name: 'at the detector, with the room’s own page where the pattern lands', spot: { x: 0, z: END - F }, link: page }, screen)
      ];

      return {
        cls: 'quantum-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'You see its own page through the two slits, set in the detector at the far end.',
        bounds: function () { return { x: [-700, 700], z: [0, END - F] }; },
        ground: function (g, near, far) {
          kit.quad(g, -5000, 5000, near, far, kit.ink('--ink'));
          // The beam, from the source to the slits, and on past them in two.
          kit.quad(g, -280, -200, 520, BAR, kit.ink('--violet'), 0.3);
          [-1, 1].forEach(function (side) {
            var c = side * (PILLAR / 2 + SLIT / 2);
            kit.quad(g, c - SLIT / 2, c + SLIT / 2, BAR, END, kit.ink('--violet'), 0.08);
          });
          // The fringes on the floor in front of the detector, still unmeasured.
          var cyan = kit.ink('--cyan'), pink = kit.ink('--pink');
          for (var x = -1600; x < 1600; x += 104) {
            kit.quad(g, x, x + 16, END - 900, END, cyan, 0.22);
            kit.quad(g, x + 40, x + 56, END - 700, END, pink, 0.18);
          }
          // Stars underfoot as well, because there is no floor out here.
          var dim = kit.ink('--ink-3');
          for (var i = 0; i < 260; i++) {
            var sx = -3000 + hash(i, 9, 1) * 6000, sz = hash(i, 9, 2) * (END + 1200);
            if (sz < near || sz > far) continue;
            kit.oval(g, sx, sz, 6 + hash(i, 9, 3) * 8, 3 + hash(i, 9, 4) * 4, dim, 0.8);
          }
        }
      };
    }
  };
})();

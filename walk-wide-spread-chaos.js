/* =============================================================================
   Wide-Spread Chaos Gardens, walked into on Paper Street, east of the stile in
   Nature's Contribution. Ryan's ask, 2026-11-04: round 1 of the rooms you can
   walk into, down the rest of the street.

   IT IS THE GARDEN'S OWN WORLD (§111): A CLEAR, WINDY DAY. Not a cloud in the
   sky, plain daylight from it, nothing lit through anything, and a wind
   blowing across the garden from the left: every stem, every flower on top of
   it and every bit of seed still in the air leans the same way, to the right.
   The lean is in the geometry, each stem drawn at its angle once, and nothing
   ever moves. Nothing is in a row and nothing is on a path: the clumps are
   thrown out of a fixed seed, the same garden every visit, flowers of every
   colour the page declares on stems of every height, with a bench in the
   middle for anybody who comes to sit. One of the page's own plant labels
   stands on its stake among them, lifted off the page as it is, and the
   room's own page stands on a big label at the far side of the garden.

   THE COLLISIONS ARE §111's: Swaying Sweetgrass is the other meadow and it is
   LIGHT, a low sun behind the grass; here it is plain daylight and the wind
   makes the picture. The Garden is the other garden and it is ORDER, beds in
   rows under leaves. The land this garden stands on is under broken cloud;
   there is no cloud here, and if one ever drifts in it has become the land
   with flowers on it. NO PLANT IS NAMED HERE BUT BY ITS PAGE: this file names
   none, Latin or otherwise.

   NOTHING MOVES, at any setting. Every colour is one §111 declares, by name. It
   keeps nothing, sends nothing and fetches nothing; its page arrives through
   Paper Street's screen(). tools/make-paper-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var BLOOMS = ['--wsc-red', '--wsc-orange', '--wsc-yellow', '--wsc-pink', '--wsc-blue', '--wsc-violet', '--wsc-white'];
  var WIND = 0.34;                              // how far right a stem leans for every unit it rises

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }
  function sized(s, w, h) { s.setAttribute('width', w); s.setAttribute('height', h); return s; }
  function seeded(n) {
    return function () {
      n = (n + 0x6D2B79F5) | 0;
      var t = Math.imul(n ^ (n >>> 15), 1 | n);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // One flower head at (x, y), its shape and colour chosen by the seed; a head
  // leans with its stem, so every part is drawn already blown to the right.
  function head(s, r, x, y) {
    var ink = 'var(' + BLOOMS[Math.floor(r() * BLOOMS.length)] + ')', kind = Math.floor(r() * 4);
    if (kind === 0) {
      // A daisy: petals round a dark eye, flattened down the wind.
      for (var i = 0; i < 9; i++) {
        var a = i / 9 * Math.PI * 2;
        s.appendChild(el('ellipse', { cx: x + Math.cos(a) * 22 + 6, cy: y + Math.sin(a) * 16, rx: 14, ry: 9, fill: ink }));
      }
      s.appendChild(el('circle', { cx: x + 6, cy: y, r: 11, fill: 'var(--wsc-eye)' }));
    } else if (kind === 1) {
      // A cup, open to the sky and tipped with the wind.
      s.appendChild(el('path', { d: 'M' + (x - 18) + ' ' + (y - 24) + ' Q' + (x - 10) + ' ' + (y + 18) + ' ' + (x + 6) + ' ' + (y + 14) + ' Q' + (x + 30) + ' ' + (y + 6) + ' ' + (x + 34) + ' ' + (y - 30) + ' L' + (x + 14) + ' ' + (y - 8) + ' Z', fill: ink }));
    } else if (kind === 2) {
      // A spike of small flowers up the top of the stem.
      for (var j = 0; j < 6; j++) s.appendChild(el('circle', { cx: x + j * 14 * WIND * 2.4, cy: y - j * 14, r: 9 - j, fill: ink }));
    } else {
      // A round head.
      s.appendChild(el('circle', { cx: x + 4, cy: y - 4, r: 22, fill: ink }));
    }
  }

  // A clump: stems of every height from one patch of ground, all leaning the
  // same way, leaves on the way up, a head on every one, and grass at the foot.
  function clump(r, w, h) {
    var s = svg(w, h), n = 6 + Math.floor(r() * 6);
    for (var g = 0; g < 18; g++) {
      var gx = w * 0.1 + r() * w * 0.55, gl = 60 + r() * 90;
      s.appendChild(el('path', { d: 'M' + gx + ' ' + h + ' L' + (gx + gl * WIND * 1.4) + ' ' + (h - gl) + ' L' + (gx + 8) + ' ' + h + ' Z', fill: 'var(--wsc-grass)' }));
    }
    for (var i = 0; i < n; i++) {
      var bx = w * 0.12 + r() * w * 0.5, len = h * (0.35 + r() * 0.55), tx = bx + len * WIND, ty = h - len;
      s.appendChild(el('path', { d: 'M' + bx + ' ' + h + ' Q' + (bx + len * WIND * 0.3) + ' ' + (h - len * 0.6) + ' ' + tx + ' ' + ty, fill: 'none', stroke: 'var(--wsc-stem)', 'stroke-width': 7 }));
      var lx = bx + len * WIND * 0.35, ly = h - len * 0.45;
      s.appendChild(el('path', { d: 'M' + lx + ' ' + ly + ' Q' + (lx + 40) + ' ' + (ly - 26) + ' ' + (lx + 74) + ' ' + (ly - 4) + ' Q' + (lx + 36) + ' ' + (ly + 10) + ' ' + lx + ' ' + ly + ' Z', fill: 'var(--wsc-leaf)' }));
      head(s, r, tx, ty);
    }
    // Seed still in the air, blown off the heads and going right.
    for (var k = 0; k < 5; k++) {
      var sx = w * 0.4 + r() * w * 0.55, sy = h * 0.1 + r() * h * 0.4;
      s.appendChild(el('path', { d: 'M' + sx + ' ' + sy + ' L' + (sx + 16) + ' ' + (sy - 5), stroke: 'var(--wsc-eye)', 'stroke-width': 2 }));
      s.appendChild(el('ellipse', { cx: sx + 20, cy: sy - 7, rx: 9, ry: 6, fill: 'var(--wsc-fluff)' }));
    }
    return s;
  }

  // The bench in the middle, for anybody who comes to sit: painted slats,
  // outlined in the page's rim.
  function bench(w, h) {
    var s = svg(w, h), stroke = { stroke: 'var(--wsc-rim)', 'stroke-width': 6 };
    function slat(x, y, ww, hh) {
      var a = { x: x, y: y, width: ww, height: hh, rx: 6, fill: 'var(--wsc-label)' };
      for (var k in stroke) a[k] = stroke[k];
      s.appendChild(el('rect', a));
    }
    slat(30, 10, w - 60, 46);
    slat(30, 70, w - 60, 46);
    slat(10, h * 0.55, w - 20, 50);
    slat(50, h * 0.55 + 50, 36, h * 0.45 - 50);
    slat(w - 86, h * 0.55 + 50, 36, h * 0.45 - 50);
    return s;
  }

  // A stake for the label, driven in at its own height.
  function stake(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: w / 2 - 8, y: 0, width: 16, height: h, fill: 'var(--wsc-label)', stroke: 'var(--wsc-rim)', 'stroke-width': 4 }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['wide-spread-chaos.html'] = {
    prefix: 'wsc-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 980), sh = kit.H - 24;
      var END = 3000 + F;                       // the far side of the garden
      var eye = sh / 2, k = eye / 520;
      var BENCH = 1500;
      var r = seeded(111);
      var decor = [];
      var put = function (s, w, h, o) {
        o.w = w * k; o.h = h * k; o.y = (o.y || 0) * k;
        return kit.item(sized(s, o.w, o.h), o);
      };

      // The garden, thrown: clumps everywhere but the places kept to stand in.
      var keep = [[0, 0, 500], [0, BENCH - F * 0.5, 420], [-700, BENCH + 200, 420], [0, END - F * 0.6, 900]];
      for (var i = 0; i < 70; i++) {
        var x = -2200 + r() * 4400, z = 300 + r() * (END - 200);
        if (keep.some(function (q) { return Math.abs(x - q[0]) < q[2] && Math.abs(z - q[1]) < q[2]; })) continue;
        var cw = 520 + r() * 360, ch = 560 + r() * 520;
        decor.push(put(clump(r, cw, ch), cw, ch, { x: x, z: z }));
      }
      var benchIt = put(bench(620, 300), 620, 300, { x: 0, z: BENCH });
      decor.push(benchIt);

      var page = kit.screen(kit.page, 'Wide-Spread Chaos Gardens’ own page, on a big label at the far side');
      var big = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'wsc-walk-label' });
      // A label off the page on its stake, standing among the flowers.
      var post = 420;
      decor.push(put(stake(40, post), 40, post, { x: -700, z: BENCH + 200 }));
      var label = kit.lift(page, '.wsc-label', { n: 0, x: -700, z: BENCH + 190, y: post * k, w: 380, cls: 'wsc-walk-tag' });

      var stops = [
        kit.stop({ name: 'where you come in from the stile, the whole garden leaning away from you on the wind', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the bench in the middle, the wind from your left and the flowers leaning off to your right', spot: { x: 0, z: BENCH - F * 0.5 } }, benchIt),
        kit.stop({ name: 'at a label on its stake, in the page’s own words', spot: kit.front(label, 900) }, label),
        kit.stop({ name: 'at the far side, with the room’s own page on a big label', spot: { x: 0, z: END - F }, link: page }, big)
      ];

      return {
        cls: 'wsc-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The flowers all lean the same way on the wind; its own page is on a big label at the far side of the garden.',
        bounds: function () { return { x: [-1600, 1600], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--wsc-ground'));
          // Grass in patches, thrown like everything else here.
          var grass = kit.ink('--wsc-grass');
          for (var j = Math.max(0, Math.floor(from / 300)); j < Math.ceil(to / 300); j++) {
            for (var i = -10; i < 10; i++) {
              var h = Math.abs(Math.sin(i * 12.9898 + j * 78.233) * 43758.5453) % 1;
              if (h < 0.5) kit.oval(g, i * 300 + h * 200, j * 300 + h * 140, 120 + h * 80, 60 + h * 40, grass, 0.8);
            }
          }
        }
      };
    }
  };
})();

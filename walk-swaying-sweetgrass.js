/* =============================================================================
   Swaying Sweetgrass, walked into on Paper Street: pitch 02 on the campgrounds.
   Ryan's ask, 2026-11-04: round 1 of the rooms you can walk into.

   IT IS THE MEADOW'S WORLD AND NOBODY ELSE'S (§25): a meadow left alone, one
   accessible path cut through it, and a clearing at the end with a ring of
   stones and a fire pit. THE SUN IS LOW, A HUNDRED FEET OFF AND BEHIND
   EVERYTHING, so nothing has a lit face: the blades glow because the light is
   coming through them, the greens go yellow at the top and the ground stays
   dark, and the pale band is at the foot of the stems, where it is on the
   plant. There is no furniture in a meadow: the path and the fire ring are
   the only built things, and you go a long way through nothing to reach them.
   Green-gold, never brown. The fire in the pit is painted in the room's own
   two golds, a small thing you walk to and never the light. The room's own page
   is on the plate beyond the ring, soil and seed, and the real fire is on it,
   only ever burning in a frame somebody pressed for.

   NOTHING MOVES: the grass sways on the page at MAX, and here it stands still at
   every setting. Nothing here teaches sweetgrass. Every colour is one §25
   declares, by name. It keeps nothing, sends nothing and fetches nothing; its
   page arrives through Paper Street's screen(). tools/make-paper-street.py
   holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';

  function seeded(n) {
    return function () {
      n = (n + 0x6D2B79F5) | 0;
      var t = Math.imul(n ^ (n >>> 15), 1 | n);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }

  // A stand of grass with the sun through it: each blade a dark stem going
  // yellow at the top, the pale band low on it, seed heads in the room's gold.
  function grass(r, w, h) {
    var s = svg(w, h);
    for (var i = 0; i < Math.round(w / 9); i++) {
      var x = r() * w, top = h * (0.05 + r() * 0.45), lean = (r() - 0.5) * 60;
      var mid = top + (h - top) * 0.5;
      s.appendChild(el('path', { d: 'M' + x + ' ' + h + ' Q' + (x + lean * 0.3) + ' ' + mid + ' ' + (x + lean) + ' ' + top,
        fill: 'none', stroke: r() < 0.5 ? 'var(--stem)' : 'var(--sedge)', 'stroke-width': 3 + r() * 3, 'stroke-linecap': 'round' }));
      s.appendChild(el('path', { d: 'M' + (x + lean * 0.75) + ' ' + (top + (h - top) * 0.25) + ' Q' + (x + lean * 0.9) + ' ' + (top + (h - top) * 0.1) + ' ' + (x + lean) + ' ' + top,
        fill: 'none', stroke: 'var(--glow)', 'stroke-width': 3, 'stroke-linecap': 'round' }));
      if (r() < 0.3) s.appendChild(el('ellipse', { cx: x + lean, cy: top - 10, rx: 5, ry: 16, fill: 'var(--seed)' }));
      if (r() < 0.25) s.appendChild(el('ellipse', { cx: x + lean, cy: top - 6, rx: 3, ry: 12, fill: 'var(--awn)' }));
    }
    s.appendChild(el('rect', { x: 0, y: h - 40, width: w, height: 14, fill: 'var(--straw)', opacity: '0.18' }));
    return s;
  }

  // The fire ring: stones round a pit, and the fire in it painted in the
  // room's two golds, small and still.
  function fireRing(w, h) {
    var s = svg(w, h), cx = w / 2, base = h - 20;
    s.appendChild(el('path', { fill: 'var(--seed)', d: 'M' + (cx - 70) + ' ' + base + ' Q' + (cx - 60) + ' ' + (base - 90) + ' ' + (cx - 10) + ' ' + (base - 150) + ' Q' + (cx + 10) + ' ' + (base - 80) + ' ' + (cx + 40) + ' ' + (base - 110) + ' Q' + (cx + 70) + ' ' + (base - 50) + ' ' + (cx + 70) + ' ' + base + ' Z' }));
    s.appendChild(el('path', { fill: 'var(--glow)', d: 'M' + (cx - 34) + ' ' + base + ' Q' + (cx - 30) + ' ' + (base - 50) + ' ' + cx + ' ' + (base - 90) + ' Q' + (cx + 30) + ' ' + (base - 50) + ' ' + (cx + 34) + ' ' + base + ' Z' }));
    for (var i = 0; i < 9; i++) {
      var x = 30 + i * (w - 60) / 8;
      s.appendChild(el('ellipse', { cx: x, cy: base - 6 + (i % 2) * 8, rx: (w - 60) / 16 + 6, ry: 26, fill: 'var(--sedge)', stroke: 'var(--shade)', 'stroke-width': 4 }));
    }
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['swaying-sweetgrass.html'] = {
    prefix: 'swg-walk',
    from: 'campgrounds.html',
    build: function (kit) {
      var r = seeded(25);
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 3600 + F;                       // the plate beyond the ring
      var RING = END - 700;                     // the fire ring in the clearing
      var eye = sh / 2, decor = [];
      var PATH = 220;                           // half the path's width

      // The meadow either side of the path, stand after stand, taller than you;
      // it stops at the clearing.
      for (var z = 200; z < RING - 500; z += 260) {
        [-1, 1].forEach(function (side) {
          var w = 700 + r() * 300, h = Math.max(sh + 120, 640) + r() * 160;
          decor.push(kit.item(grass(r, w, h), { x: side * (PATH + w / 2 + r() * 120), z: z + r() * 120, w: w, h: h }));
        });
      }
      // And round the clearing, behind the plate.
      for (var i = 0; i < 6; i++) {
        var gw = 900;
        decor.push(kit.item(grass(r, gw, Math.max(sh + 120, 640)), { x: -2250 + i * 900, z: END + 260 + (i % 2) * 120, w: gw, h: Math.max(sh + 120, 640) }));
      }
      var ring = kit.item(fireRing(620, 200), { x: 0, z: RING, w: 620, h: 200 });
      decor.push(ring);

      var page = kit.screen(kit.page, 'Swaying Sweetgrass’s own page, on the plate beyond the fire ring');
      var plate = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'swg-walk-plate' });

      var stops = [
        kit.stop({ name: 'where the path starts into the meadow, the sun low behind the grass', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'halfway along the path, the grass over your head', spot: { x: 0, z: RING * 0.5 } }),
        kit.stop({ name: 'in the clearing, at the ring of stones round the fire pit', spot: kit.front(ring, 900) }, ring),
        kit.stop({ name: 'beyond the ring, at the plate with the room’s own page on it', spot: { x: 0, z: END - F }, link: page }, plate)
      ];

      return {
        cls: 'swg-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is on the plate beyond the fire ring, at the end of the path.',
        bounds: function (cam) {
          var x = cam && cam.z > RING - 600 && cam.z < 1e8 ? 700 : PATH - 40;
          return { x: [-x, x], z: [0, END - F] };
        },
        ground: function (g, near, far) {
          kit.quad(g, -4000, 4000, near, far, kit.ink('--soil'));
          // The path cut through it, and the clearing it opens into.
          kit.quad(g, -PATH, PATH, 0, RING, kit.ink('--shade'));
          kit.oval(g, 0, RING + 100, 820, 760, kit.ink('--shade'));
          // The sun behind the grass, lying low across the clearing.
          kit.oval(g, 0, END + 80, 760, 260, kit.ink('--glow'), 0.12);
          var lit = seeded(52), straw = kit.ink('--straw'), stem = kit.ink('--stem');
          for (var q = 0; q < 600; q++) {
            var qx = -2000 + lit() * 4000, qz = lit() * (END + 400);
            if (qz < near || qz > far || Math.abs(qx) < PATH) continue;
            kit.oval(g, qx, qz, 10 + lit() * 18, 4 + lit() * 6, lit() < 0.3 ? straw : stem, 0.4);
          }
        }
      };
    }
  };
})();

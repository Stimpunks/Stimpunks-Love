/* =============================================================================
   The Green, walked into on Paper Street. Ryan's ask, 2026-11-04: round 1 of
   the rooms still to be walked into.

   IT IS THE GREEN'S WORLD AND NOBODY ELSE'S (§98): a wood round a pond, a
   wooden boardwalk going round the water, raised beds of things you can eat
   along it, and a porch roof you come in under, where you waited out the rain.
   It has just stopped raining, and that is the light: THERE IS NO SUN, SO
   NOTHING ON THIS FLOOR OR IN THESE DRAWINGS CASTS A SHADOW, and every built
   thing that is wet holds a line of the pale sky along its top edge: the porch
   roof, the rims of the beds, the top of the sign. The sky lies only in the
   pond, with the last of the rain's rings on it. The room's own page is on the
   trailhead sign at the far side of the water.

   THE GARDEN IS THE ONE TO WATCH: midday, the sun through leaves, small hard
   shadows straight under things. If a shadow is ever drawn here, the sun has
   come out and this has become the Garden with a pond in it.

   NOTHING MOVES AT ANY SETTING: the rings are drawn as they lie. Every colour is
   one the room declares, by name. It keeps nothing, sends nothing and fetches
   nothing; its page arrives through Paper Street's screen().
   tools/make-paper-street.py holds each of those.
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
  // The same wood every visit.
  function seeded(n) {
    return function () {
      n = (n + 0x6D2B79F5) | 0;
      var t = Math.imul(n ^ (n >>> 15), 1 | n);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var LEAVES = ['var(--grn-wood)', 'var(--grn-wood-2)', 'var(--grn-leaf)', 'var(--grn-fern)'];

  // A tree of the wood: a dark trunk and a heap of wet greens. No shadow under it.
  function tree(r, w, h) {
    var s = svg(w, h), m = w / 2;
    s.appendChild(el('rect', { x: m - w * 0.05, y: h * 0.45, width: w * 0.1, height: h * 0.55, fill: 'var(--grn-dim)' }));
    for (var i = 0; i < 9; i++) {
      var cx = m + (r() - 0.5) * w * 0.7, cy = h * 0.12 + r() * h * 0.45, rr = w * (0.18 + r() * 0.16);
      s.appendChild(el('circle', { cx: cx, cy: cy, r: rr, fill: LEAVES[Math.floor(r() * LEAVES.length)] }));
    }
    return s;
  }

  // The porch roof over where you came in: two posts, a beam, the roof's edge,
  // and the line of pale sky along the wet edge with drops hanging from it.
  function porch(w, h, gap) {
    var s = svg(w, h), m = w / 2;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: 90, fill: 'var(--grn-roof)' }));
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: 6, fill: 'var(--grn-sheen)' }));
    s.appendChild(el('rect', { x: 0, y: 90, width: w, height: 26, fill: 'var(--grn-timber)' }));
    s.appendChild(el('rect', { x: 0, y: 90, width: w, height: 3, fill: 'var(--grn-sheen)' }));
    [-1, 1].forEach(function (side) {
      s.appendChild(el('rect', { x: m + side * gap / 2 - 18, y: 116, width: 36, height: h - 116, fill: 'var(--grn-timber)' }));
      s.appendChild(el('rect', { x: m + side * gap / 2 - 18, y: 116, width: 36, height: 3, fill: 'var(--grn-sheen)' }));
    });
    for (var x = 30; x < w; x += 70) s.appendChild(el('ellipse', { cx: x, cy: 124, rx: 4, ry: 7, fill: 'var(--grn-pond-sky)' }));
    return s;
  }

  // A raised bed at a seat's height, along the boardwalk: a timber box, its wet
  // rim holding the sky, and what grows in it.
  function bed(w, h) {
    var s = svg(w, h), top = h * 0.5;
    var plants = ['--grn-tomato', '--grn-lavender', '--grn-gold', '--grn-cone', '--grn-aster', '--grn-tomato'];
    for (var i = 0; i < plants.length; i++) {
      var x = 60 + i * (w - 120) / (plants.length - 1);
      s.appendChild(el('rect', { x: x - 3, y: top - 120, width: 6, height: 120, fill: 'var(--grn-reed)' }));
      s.appendChild(el('ellipse', { cx: x - 26, cy: top - 60, rx: 26, ry: 11, fill: 'var(--grn-leaf)' }));
      s.appendChild(el('ellipse', { cx: x + 26, cy: top - 86, rx: 26, ry: 11, fill: 'var(--grn-sage)' }));
      s.appendChild(el('circle', { cx: x, cy: top - 128, r: 20, fill: 'var(' + plants[i] + ')' }));
    }
    s.appendChild(el('rect', { x: 0, y: top, width: w, height: h - top, fill: 'var(--grn-timber)' }));
    s.appendChild(el('rect', { x: 0, y: top, width: w, height: 5, fill: 'var(--grn-sheen)' }));
    for (var y = top + 40; y < h; y += 44) s.appendChild(el('rect', { x: 0, y: y, width: w, height: 4, fill: 'var(--grn-board)' }));
    return s;
  }

  // The trailhead sign at the far side of the water: two posts and a board,
  // the room's own page on it.
  function sign(w, h, sw, sh) {
    var s = svg(w, h), m = w / 2;
    [-1, 1].forEach(function (side) {
      s.appendChild(el('rect', { x: m + side * (sw / 2 + 30) - 22, y: 0, width: 44, height: h, fill: 'var(--grn-timber)' }));
    });
    s.appendChild(el('rect', { x: m - sw / 2 - 40, y: 40, width: sw + 80, height: sh + 60, fill: 'var(--grn-board)' }));
    s.appendChild(el('rect', { x: m - sw / 2 - 40, y: 40, width: sw + 80, height: 6, fill: 'var(--grn-sheen)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['the-green.html'] = {
    prefix: 'grn-stroll',
    build: function (kit) {
      var F = kit.F, r = seeded(98);
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 3300 + F;                      // where the trailhead sign stands
      var eye = sh / 2 + 170;
      var POND = 1850, PX = 640, PZ = 520;     // the pond's middle and its half-widths
      var decor = [];

      decor.push(kit.item(porch(2600, eye + 140, 1200), { x: 0, z: 450, w: 2600, h: eye + 140 }));
      // The wood, all the way round and past the sign.
      for (var z = 500; z < END + 1600; z += 380) {
        [-1, 1].forEach(function (side) {
          var tw = 520 + r() * 420, th = 1100 + r() * 700;
          decor.push(kit.item(tree(r, tw, th), { x: side * (1250 + r() * 900), z: z + r() * 200, w: tw, h: th }));
        });
      }
      for (var k = 0; k < 7; k++) {
        var bw = 600 + r() * 300, bh = 1300 + r() * 600;
        decor.push(kit.item(tree(r, bw, bh), { x: -1800 + k * 600, z: END + 900 + r() * 500, w: bw, h: bh }));
      }
      var beds = [];
      [[-1, POND - 260], [1, POND + 120]].forEach(function (b) {
        var it = kit.item(bed(820, 420), { x: b[0] * (PX + 330), z: b[1], w: 820, h: 420, turn: b[0] < 0 ? kit.LEFT : kit.RIGHT });
        decor.push(it); beds.push(it);
      });
      decor.push(kit.item(sign(sw + 240, sh + 260, sw, sh), { x: 0, z: END + 20, w: sw + 240, h: sh + 260 }));

      var page = kit.screen(kit.page, 'The Green’s own page, on the trailhead sign past the pond');
      var board = kit.item(page, { x: 0, z: END, w: sw, h: sh, y: 170, cls: 'grn-stroll-board' });

      var stops = [
        kit.stop({ name: 'under the porch roof by the gate, where you waited out the rain', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'on the boardwalk, beside a raised bed of tomatoes, lavender and asters', spot: kit.front(beds[0], 900) }, beds[0]),
        kit.stop({ name: 'at the edge of the pond, the sky lying in it', spot: { x: 0, z: POND - PZ - F * 0.6 } }),
        kit.stop({ name: 'at the trailhead sign past the pond, with the room’s own page on it', spot: { x: 0, z: END - F }, link: page }, board)
      ];

      return {
        cls: 'grn-stroll',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'It has just stopped raining. The pond is ahead, and the room’s own page is on the sign past it.',
        bounds: function () { return { x: [-PX - 120, PX + 120], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--grn-lawn'));
          // The boardwalk round the pond, the pond inside it, and the sky lying
          // in the water. Nothing on this ground is a shadow.
          kit.oval(g, 0, POND, PX + 260, PZ + 260, kit.ink('--grn-timber'), 1);
          kit.oval(g, 0, POND, PX + 120, PZ + 120, kit.ink('--grn-lawn'), 1);
          kit.oval(g, 0, POND, PX, PZ, kit.ink('--grn-pond'), 1);
          kit.oval(g, -80, POND + 60, PX * 0.7, PZ * 0.6, kit.ink('--grn-pond-sky'), 0.7);
          var sheen = kit.ink('--grn-sheen');
          [[-220, POND - 120, 90], [180, POND + 140, 60], [40, POND - 260, 40]].forEach(function (ring) {
            kit.oval(g, ring[0], ring[1], ring[2], ring[2] * 0.6, sheen, 0.35);
            kit.oval(g, ring[0], ring[1], ring[2] - 8, ring[2] * 0.6 - 6, kit.ink('--grn-pond-sky'), 1);
          });
          // The path from the porch to the boardwalk, and on from it to the sign.
          kit.quad(g, -140, 140, Math.max(from, 0), POND - PZ - 200, kit.ink('--grn-timber'));
          kit.quad(g, -140, 140, POND + PZ + 200, Math.min(to, END + 40), kit.ink('--grn-timber'));
          var seam = kit.ink('--grn-board');
          for (var z = 60; z < END; z += 80) {
            if (z > POND - PZ - 200 && z < POND + PZ + 200) continue;
            kit.quad(g, -140, 140, z, z + 4, seam);
          }
        }
      };
    }
  };
})();

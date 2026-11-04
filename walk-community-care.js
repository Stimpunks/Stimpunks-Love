/* =============================================================================
   Community Care, walked into on Paper Street. Ryan's ask, 2026-11-04: round 1
   of the rooms that could not yet be walked into.

   IT IS THE STREET UNDER EVERYBODY'S UMBRELLAS, IN THE RAIN (§122): open
   umbrellas tied to one another and to the shopfronts either side, and between
   them one roof. Here the roof is strings of umbrellas hung across the street
   one behind another, each string's umbrellas on a loose cord with a loop at
   every shaft, the end ones tied to the shopfronts' walls. It is overcast, so
   there is no sun anywhere and nothing casts a hard shadow; the paving under
   the roof is dry and dim, and past the roof's far end the rain is drawn
   still, over the open street. The room's own page hangs on the shopfront at
   the end of the roof, dry, to read and press as itself.

   THE TIES ARE THE ROOM: nothing else holds the roof up, and no umbrella hangs
   untied. No two alike touch on a string, and no four run in a rainbow's
   order, the room's own rules for its roof. The Truck Stop is coloured canvas
   over a sunny lot with its stripes laid on the counters; here there is no sun
   and no colour is laid on the ground at all.

   NOTHING MOVES AT ANY SETTING: the rain is drawn still. Every colour is one
   §122 declares, by name. It keeps nothing, sends nothing and fetches nothing;
   its page arrives through Paper Street's screen(). tools/make-paper-street.py
   holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  // The umbrellas' own colours, in an order where no two alike touch and no
  // four run in a rainbow's order, however a string starts in it.
  var CANOPY = ['--cmc-teal', '--cmc-tomato', '--cmc-plum', '--cmc-marigold', '--cmc-cobalt', '--cmc-fuchsia', '--cmc-leaf'];

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }

  // One string of umbrellas across the street: the cord sagging loose from
  // wall to wall, and at each shaft a loop round it; each umbrella open, its
  // ribs drawn in the canopy, its shaft coming down to the cord.
  function string(w, h, n, start) {
    var s = svg(w, h), cord = h - 40, uw = w / n;
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--cmc-tie)', 'stroke-width': 5,
      d: 'M0 ' + (cord - 40) + ' Q' + (w / 2) + ' ' + (cord + 40) + ' ' + w + ' ' + (cord - 40) }));
    for (var i = 0; i < n; i++) {
      var cx = uw * (i + 0.5), r = uw * 0.48, top = 30;
      var sag = cord + 40 * (1 - Math.pow((cx - w / 2) / (w / 2), 2)) - 40;
      var ink = CANOPY[(start + i) % CANOPY.length];
      s.appendChild(el('path', { fill: 'var(' + ink + ')', d: 'M' + (cx - r) + ' ' + (top + r * 0.5) + ' Q' + cx + ' ' + (top - r * 0.3) + ' ' + (cx + r) + ' ' + (top + r * 0.5) +
        ' Q' + (cx + r * 0.5) + ' ' + (top + r * 0.38) + ' ' + cx + ' ' + (top + r * 0.5) + ' Q' + (cx - r * 0.5) + ' ' + (top + r * 0.38) + ' ' + (cx - r) + ' ' + (top + r * 0.5) + ' Z' }));
      [-0.5, 0, 0.5].forEach(function (k) {
        s.appendChild(el('path', { fill: 'none', stroke: 'var(--cmc-rib)', 'stroke-width': 3, d: 'M' + cx + ' ' + (top + 2) + ' L' + (cx + r * k) + ' ' + (top + r * 0.42) }));
      });
      s.appendChild(el('rect', { x: cx - 3, y: top + r * 0.4, width: 6, height: sag - top - r * 0.4, fill: 'var(--cmc-rib)' }));
      s.appendChild(el('ellipse', { cx: cx, cy: sag, rx: 12, ry: 8, fill: 'none', stroke: 'var(--cmc-tie)', 'stroke-width': 4 }));
    }
    return s;
  }

  // A shopfront wall along the street: dark slab, its windows dim in the rain.
  function shopfronts(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--cmc-slab)' }));
    for (var x = 120; x < w - 300; x += 640) {
      s.appendChild(el('rect', { x: x, y: h - 520, width: 380, height: 300, fill: 'var(--cmc-under)', stroke: 'var(--cmc-rib)', 'stroke-width': 10 }));
      s.appendChild(el('rect', { x: x + 420, y: h - 560, width: 140, height: 560, fill: 'var(--cmc-rib)' }));
    }
    return s;
  }

  // The rain past the roof's far end, drawn still over the grey sky and the
  // open street.
  function rain(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--cmc-sky)' }));
    for (var y = 0, k = 0; y < h; y += 40, k++) {
      for (var x = (k % 3) * 30; x < w; x += 90) s.appendChild(el('rect', { x: x, y: y, width: 3, height: 26, fill: 'var(--cmc-rain)' }));
    }
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['community-care.html'] = {
    prefix: 'cmc-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 940), sh = kit.H - 24;
      var END = 2600 + F;                       // where the roof ends, and the page hangs
      var eye = sh / 2, WIDE = 900;
      var WH = Math.max(1100, sh + 560), decor = [];

      decor.push(kit.item(rain(6000, WH + 600), { x: 0, z: END + 2400, w: 6000, h: WH + 600 }));
      [-1, 1].forEach(function (side) {
        decor.push(kit.item(shopfronts(END + 3000, WH), { x: side * WIDE, z: (END + 3000) / 2 - 200, w: END + 3000, h: WH,
          turn: side < 0 ? kit.LEFT : kit.RIGHT }));
      });
      // Strings of umbrellas across the street, one behind another, high
      // enough to walk under; each back string starts its colours where the
      // one in front left off, so the roof never repeats along the street.
      var SH = 300, YS = Math.max(eye * 2 + 40, 560);
      for (var z = 300, k = 0; z < END + 100; z += 360, k++) {
        decor.push(kit.item(string(2 * WIDE, SH, 6, k * 3), { x: 0, z: z, w: 2 * WIDE, h: SH, y: YS + (k % 2) * 60 }));
      }

      var page = kit.screen(kit.page, 'Community Care’s own page, on the shopfront at the end of the roof');
      var hung = kit.item(page, { x: WIDE - 6, z: END - 300, w: sw, h: sh, turn: kit.RIGHT, cls: 'cmc-walk-sign' });

      var stops = [
        kit.stop({ name: 'under the first umbrellas, out of the rain', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'in the middle of the street, under everybody’s umbrellas tied together', spot: { x: 0, z: END * 0.45 } }),
        kit.stop({ name: 'at the shopfront at the end of the roof, with the room’s own page on it', spot: kit.front(hung), link: page }, hung),
        kit.stop({ name: 'at the roof’s far edge, the rain falling past it', spot: { x: 0, z: END } })
      ];

      return {
        cls: 'cmc-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is on the shopfront on the right, at the end of the roof.',
        bounds: function () { return { x: [-WIDE + 220, WIDE - 220], z: [0, END] }; },
        ground: function (g, from, to) {
          // The paving: dry and dim under the roof, wet past its end.
          kit.quad(g, -4000, 4000, from, to, kit.ink('--cmc-under'));
          var seam = kit.ink('--cmc-slab');
          for (var x = -WIDE; x <= WIDE; x += 180) kit.quad(g, x - 3, x + 3, Math.max(from, 0), Math.min(to, END + 3000), seam);
          if (to > END + 200) kit.quad(g, -4000, 4000, Math.max(from, END + 200), to, kit.ink('--cmc-sky'), 0.35);
        }
      };
    }
  };
})();

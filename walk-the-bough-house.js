/* =============================================================================
   The Bough House, walked into on Paper Street: pitch 05 on the campgrounds,
   Jess's. Ryan's ask, 2026-11-04: round 1 of the rooms you can walk into.

   IT IS THE BOUGH HOUSE'S WORLD AND NOBODY ELSE'S (§117): the only room on the
   street up off the ground. You come up through a hatch in the floor into a
   room of silvered planks, square and daylit, with the tree coming up through
   the middle of it and out through the roof, and an autumn grove all round the
   windows, gold, amber, crimson and a few leaves still green, against the
   late-afternoon sky. The sun is low in the west, so it comes in at the west
   window and lies across the boards. Ben, the tiny black dog, is on his cushion
   by the door. THE PLANKS ARE GREY ON PURPOSE: weathered timber goes silver,
   and a tree house in honey-coloured wood would be one more brown room. That
   is what keeps it off the Faery Yurt next door: no candle, no canvas, no
   round wall; boards and daylight and a tree. The room's own page hangs on the
   north wall, framed in planks.

   NOTHING MOVES, and the leaves fall only on the page, when somebody presses
   for them. Every colour is one §117 declares, by name. It keeps nothing,
   sends nothing and fetches nothing; its page arrives through Paper Street's
   screen(). tools/make-paper-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var LEAVES = ['var(--bgh-gold)', 'var(--bgh-rust)', 'var(--bgh-crimson)', 'var(--bgh-gold)', 'var(--bgh-rust)'];

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

  // A wall of silvered planks with a window in it, the grove's turned leaves
  // and the late sky through the glass.
  function wall(r, w, h, win) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--bgh-plank)' }));
    for (var x = 0; x < w; x += 70) s.appendChild(el('rect', { x: x, y: 0, width: 4, height: h, fill: 'var(--bgh-grain)' }));
    win.forEach(function (o) {
      var wx = o[0], wy = o[1], ww = o[2], wh = o[3];
      s.appendChild(el('rect', { x: wx, y: wy, width: ww, height: wh, fill: 'var(--bgh-sky)' }));
      for (var i = 0; i < ww * wh / 900; i++) {
        s.appendChild(el('ellipse', { cx: wx + r() * ww, cy: wy + r() * wh * 0.85, rx: 14 + r() * 12, ry: 8 + r() * 6, fill: LEAVES[Math.floor(r() * LEAVES.length)] }));
      }
      s.appendChild(el('rect', { x: wx, y: wy, width: ww, height: wh, fill: 'none', stroke: 'var(--bgh-bark-2)', 'stroke-width': 18 }));
      s.appendChild(el('rect', { x: wx + ww / 2 - 5, y: wy, width: 10, height: wh, fill: 'var(--bgh-bark-2)' }));
    });
    return s;
  }

  // The trunk coming up through the floor and out through the roof, the low
  // sun on its west side.
  function trunk(w, h) {
    var s = svg(w, h);
    s.appendChild(el('path', { fill: 'var(--bgh-trunk)', d: 'M' + (w * 0.18) + ' 0 H' + (w * 0.82) + ' V' + (h - 60) + ' Q' + (w * 0.9) + ' ' + (h - 10) + ' ' + w + ' ' + h + ' H0 Q' + (w * 0.1) + ' ' + (h - 10) + ' ' + (w * 0.18) + ' ' + (h - 60) + ' Z' }));
    s.appendChild(el('rect', { x: w * 0.18, y: 0, width: w * 0.12, height: h - 60, fill: 'var(--bgh-gold)', opacity: '0.55' }));
    for (var y = 80; y < h - 80; y += 140) s.appendChild(el('path', { d: 'M' + (w * 0.4) + ' ' + y + ' q' + (w * 0.1) + ' 40 0 90', fill: 'none', stroke: 'var(--bgh-bark)', 'stroke-width': 5 }));
    return s;
  }

  // Ben on his cushion by the door: the tiny black dog, curled up.
  function ben(w, h) {
    var s = svg(w, h);
    s.appendChild(el('ellipse', { cx: w / 2, cy: h - 24, rx: w / 2 - 4, ry: 24, fill: 'var(--bgh-crimson)' }));
    s.appendChild(el('ellipse', { cx: w / 2, cy: h - 50, rx: w * 0.3, ry: 26, fill: 'var(--bgh-bark)' }));
    s.appendChild(el('circle', { cx: w * 0.72, cy: h - 66, r: 18, fill: 'var(--bgh-bark)' }));
    s.appendChild(el('path', { d: 'M' + (w * 0.74) + ' ' + (h - 82) + ' l10 -16 l6 18 Z', fill: 'var(--bgh-bark)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['the-bough-house.html'] = {
    prefix: 'bgh-walk',
    from: 'campgrounds.html',
    build: function (kit) {
      var r = seeded(117);
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 1700 + F;                       // the north wall
      var HALF = 820, eye = sh / 2, decor = [];
      var WH = Math.max(sh + 200, 760);

      decor.push(kit.item(wall(r, HALF * 2 + 200, WH, [[60, 140, 440, 360], [HALF * 2 - 300, 140, 440, 360]]), { x: 0, z: END + 20, w: HALF * 2 + 200, h: WH }));
      decor.push(kit.item(wall(r, END + 200, WH, [[END * 0.3, 120, 700, 420]]), { x: -HALF, z: (END + 200) / 2, w: END + 200, h: WH, turn: kit.LEFT }));
      decor.push(kit.item(wall(r, END + 200, WH, [[END * 0.35, 120, 600, 420]]), { x: HALF, z: (END + 200) / 2, w: END + 200, h: WH, turn: kit.RIGHT }));
      var tree = kit.item(trunk(260, WH + 200), { x: -340, z: END * 0.48, w: 260, h: WH + 200 });
      decor.push(tree);
      var dog = kit.item(ben(220, 120), { x: 560, z: 700, w: 220, h: 120, turn: kit.RIGHT });
      decor.push(dog);

      var page = kit.screen(kit.page, 'The Bough House’s own page, on the north wall');
      var frame = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'bgh-walk-frame' });

      var stops = [
        kit.stop({ name: 'up through the hatch in the floor, in the room in the boughs', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the trunk coming up through the middle of the room', spot: kit.front(tree, 700) }, tree),
        kit.stop({ name: 'by Ben, the tiny black dog, asleep on his cushion by the door', spot: kit.front(dog, 600) }, dog),
        kit.stop({ name: 'at the north wall, with the room’s own page on it', spot: { x: 0, z: END - F }, link: page }, frame)
      ];

      return {
        cls: 'bgh-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page hangs on the north wall, past the trunk.',
        bounds: function () { return { x: [-HALF + 160, HALF - 160], z: [0, END - F] }; },
        ground: function (g, near, far) {
          kit.quad(g, -4000, 4000, near, far, kit.ink('--bgh-bark'));
          kit.quad(g, -HALF, HALF, -200, END + 20, kit.ink('--bgh-plank'));
          var grain = kit.ink('--bgh-grain');
          for (var x = -HALF; x <= HALF; x += 90) kit.quad(g, x - 2, x + 2, -200, END + 20, grain);
          // The hatch you came up through.
          kit.quad(g, -150, 150, 40, 300, kit.ink('--bgh-bark-2'));
          kit.quad(g, -130, 130, 60, 280, kit.ink('--bgh-bark'));
          // The low sun in at the west window, lying across the boards.
          kit.quad(g, -HALF, 300, END * 0.3, END * 0.3 + 700, kit.ink('--bgh-gold'), 0.22);
          kit.oval(g, -340, END * 0.48, 200, 160, kit.ink('--bgh-trunk'));
        }
      };
    }
  };
})();

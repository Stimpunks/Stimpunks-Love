/* =============================================================================
   The Dairy, walked into on Paper Street: the café in the farm's old dairy.
   Ryan's ask, 2026-11-04: round 1 of the rooms you can walk into.

   IT IS THE CAFÉ'S OWN WORLD (§109), and a subroom shares nothing with its
   parent. Outside, the farm is lit by two lights from two sides; in here THE
   LIGHT IS BOUNCED OFF GLAZE: white tile to the ceiling, small windows set
   high, and the daylight going round and round the walls until it is
   everywhere at once and CASTS NOTHING, so nothing in this scene has a shadow
   or a lit side. The only colour is the band of green tile at hand height,
   all the way round. The steel counter stands down the left with its churns,
   two tables stand on the right, and the room's own page is the menu, on a
   card on the back wall. Every drop of milk here is pasteurised, and the page
   says why; nothing here says what a dish does for a body.

   THE COLLISIONS ARE §109's: the Guild is the other room lit from nowhere, and
   it is paper with no depth; Samefood Cafe is the other even-lit café, seen
   from straight above; Hey, Good Cookin' is lit through steamed windows, and
   nothing in a dairy is steamed. NOTHING MOVES, at any setting. Every colour
   is one §109 declares, by name. It keeps nothing, sends nothing and fetches
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

  // Glazed tile in a grid to the ceiling, the green band at hand height, and
  // small windows set high.
  function tiles(w, h, windows) {
    var s = svg(w, h), T = 60;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--dry-tile)' }));
    for (var x = 0; x <= w; x += T) s.appendChild(el('rect', { x: x - 1.5, y: 0, width: 3, height: h, fill: 'var(--dry-grout)' }));
    for (var y = h; y >= 0; y -= T) s.appendChild(el('rect', { x: 0, y: y - 1.5, width: w, height: 3, fill: 'var(--dry-grout)' }));
    s.appendChild(el('rect', { x: 0, y: h - 3 * T, width: w, height: T, fill: 'var(--dry-band)' }));
    for (var i = 0; i < windows; i++) {
      var wx = (i + 0.5) * w / windows - 120;
      s.appendChild(el('rect', { x: wx, y: T, width: 240, height: 2 * T, fill: 'var(--dry-card)', stroke: 'var(--dry-dim)', 'stroke-width': 8 }));
      s.appendChild(el('rect', { x: wx + 116, y: T, width: 8, height: 2 * T, fill: 'var(--dry-dim)' }));
    }
    return s;
  }

  // The steel counter, with two churns and a round cheese on it.
  function counter(w, h) {
    var s = svg(w, h), top = h - 260;
    s.appendChild(el('rect', { x: 0, y: top, width: w, height: h - top, fill: 'var(--dry-grout)', stroke: 'var(--dry-dim)', 'stroke-width': 6 }));
    for (var x = 60; x < w; x += 220) s.appendChild(el('rect', { x: x, y: top + 40, width: 6, height: h - top - 60, fill: 'var(--dry-dim)' }));
    [[80, 1], [220, 0.85]].forEach(function (c) {
      var cw = 90 * c[1], ch = 170 * c[1], cx = c[0];
      s.appendChild(el('path', { fill: 'var(--dry-card)', stroke: 'var(--dry-dim)', 'stroke-width': 5,
        d: 'M' + (cx - cw / 2) + ' ' + top + ' V' + (top - ch * 0.6) + ' L' + (cx - cw * 0.3) + ' ' + (top - ch * 0.8) + ' V' + (top - ch) + ' H' + (cx + cw * 0.3) + ' V' + (top - ch * 0.8) + ' L' + (cx + cw / 2) + ' ' + (top - ch * 0.6) + ' V' + top + ' Z' }));
    });
    s.appendChild(el('ellipse', { cx: w - 160, cy: top - 40, rx: 110, ry: 40, fill: 'var(--dry-tile)', stroke: 'var(--dry-dim)', 'stroke-width': 5 }));
    return s;
  }

  // A café table with two chairs, plain, the glaze's white and the steel.
  function table(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: w * 0.2, y: h * 0.42, width: w * 0.6, height: 16, fill: 'var(--dry-card)', stroke: 'var(--dry-dim)', 'stroke-width': 4 }));
    s.appendChild(el('rect', { x: w / 2 - 6, y: h * 0.42 + 16, width: 12, height: h * 0.58 - 16, fill: 'var(--dry-dim)' }));
    [w * 0.06, w * 0.82].forEach(function (x) {
      s.appendChild(el('rect', { x: x, y: h * 0.2, width: w * 0.12, height: h * 0.8, fill: 'none', stroke: 'var(--dry-dim)', 'stroke-width': 8 }));
      s.appendChild(el('rect', { x: x - 4, y: h * 0.56, width: w * 0.12 + 8, height: 12, fill: 'var(--dry-band)' }));
    });
    s.appendChild(el('rect', { x: w * 0.44, y: h * 0.3, width: 26, height: h * 0.12, fill: 'var(--dry-card)', stroke: 'var(--dry-dim)', 'stroke-width': 3 }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['the-dairy.html'] = {
    prefix: 'dry-walk',
    from: 'all-together-now.html',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 2000 + F;                       // the back wall, with the menu
      var HALF = 820, eye = sh / 2, decor = [];
      var WALL = Math.max(sh + 260, 760);

      decor.push(kit.item(tiles(HALF * 2 + 120, WALL, 2), { x: 0, z: END + 20, w: HALF * 2 + 120, h: WALL }));
      [-1, 1].forEach(function (side) {
        decor.push(kit.item(tiles(END + 200, WALL, 3), { x: side * HALF, z: (END + 200) / 2 - 100, w: END + 200, h: WALL, turn: side < 0 ? kit.LEFT : kit.RIGHT }));
      });
      var bar = kit.item(counter(1400, 420), { x: -HALF + 220, z: END * 0.48, w: 1400, h: 420, turn: kit.LEFT });
      decor.push(bar);
      var t1 = kit.item(table(360, 300), { x: 520, z: END * 0.36, w: 360, h: 300 });
      decor.push(t1);
      decor.push(kit.item(table(360, 300), { x: 520, z: END * 0.66, w: 360, h: 300 }));

      var page = kit.screen(kit.page, 'The Dairy’s own page, the menu on the back wall');
      var menu = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'dry-walk-menu' });

      var stops = [
        kit.stop({ name: 'in the doorway, the glazed tile all round you', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the steel counter, with the churns on it', spot: kit.front(bar, 900) }, bar),
        kit.stop({ name: 'at the back wall, with the room’s own page as the menu', spot: { x: 0, z: END - F }, link: page }, menu)
      ];

      return {
        cls: 'dry-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is the menu, on a card on the back wall.',
        bounds: function () { return { x: [-HALF + 520, 300], z: [0, END - F] }; },
        ground: function (g, near, far) {
          kit.quad(g, -4000, 4000, near, far, kit.ink('--dry-grout'));
          // Small square floor tiles, the same glaze underfoot.
          var line = kit.ink('--dry-tile');
          for (var x = -HALF; x <= HALF; x += 120) kit.quad(g, x - 3, x + 3, Math.max(0, near), Math.min(far, END + 20), line);
          for (var z = Math.max(0, Math.ceil(near / 120) * 120); z < Math.min(far, END + 20); z += 120) kit.quad(g, -HALF, HALF, z, z + 6, line);
        }
      };
    }
  };
})();

/* =============================================================================
   Brew and Stew, walked into on Paper Street. Ryan's call, 2026-11-04: round
   one of the rooms you can walk into, the tea room among them.

   IT IS THE TEA ROOM'S WORLD AND NOBODY ELSE'S (§95): a woodland tea room in a
   log cabin at the edge of the trees, pitch 04 on the Campgrounds. THE LIGHT
   GROWS IN THE WOOD: nobody lit this cabin. It is foxfire, a pale cool glow in
   the joints between the logs, in the moss on the sill and in the caps of the
   little mushrooms at the foot of the walls, enough to read by and never
   enough to throw a shadow, so nothing in here has one. THERE IS NO FLAME
   ANYWHERE: no candle on the tables, no lantern, no lamp. The stove is shut
   iron and gives warmth and none of the light. The dark is heather, never
   brown, which is what keeps this off the Faery Yurt on the same field.

   You come in at the door, past the shut stove and a table with things to
   take to it (lavender, grasses and a rose in a jar), to the board on the back
   wall, which holds the tea room's own page, full size once you stand at it.
   Nothing moves. Every colour is one §95 declares, by name. It keeps nothing,
   sends nothing and fetches nothing; its page arrives through Paper Street's
   screen(). tools/make-paper-street.py holds each of those.
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

  // A wall of logs laid one on another, the foxfire glowing in the joints
  // between them, moss along the sill and little glowing mushrooms at the foot.
  function logWall(w, h, hole) {
    var s = svg(w, h), log = 92;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--bns-deep)' }));
    for (var y = h - log; y > -log; y -= log) {
      s.appendChild(el('rect', { x: 0, y: y + 4, width: w, height: log - 8, rx: 40, fill: 'var(--bns-log)' }));
      s.appendChild(el('rect', { x: 0, y: y - 2, width: w, height: 5, fill: 'var(--bns-glow)', 'fill-opacity': '0.55' }));
    }
    if (hole) s.appendChild(el('rect', { x: hole[0], y: hole[1], width: hole[2], height: hole[3], fill: 'var(--bns-deep)' }));
    // Moss and mushrooms along the foot.
    for (var x = 30, k = 0; x < w; x += 70 + (k * 37) % 90, k++) {
      s.appendChild(el('ellipse', { cx: x, cy: h - 6, rx: 40 + (k * 13) % 30, ry: 12, fill: 'var(--bns-moss)' }));
      if (k % 2 === 0) {
        s.appendChild(el('rect', { x: x + 18, y: h - 40, width: 8, height: 32, fill: 'var(--bns-birch)' }));
        s.appendChild(el('ellipse', { cx: x + 22, cy: h - 40, rx: 20, ry: 11, fill: 'var(--bns-glow)' }));
      }
    }
    return s;
  }

  // The stove: shut iron on its legs, a flue up, and nothing showing through
  // its door, because its fire gives warmth and none of the light.
  function stove(w, h) {
    var s = svg(w, h), m = w / 2;
    s.appendChild(el('rect', { x: m - 22, y: 0, width: 44, height: h * 0.5, fill: 'var(--bns-iron)' }));
    s.appendChild(el('rect', { x: 20, y: h * 0.45, width: w - 40, height: h * 0.45, rx: 18, fill: 'var(--bns-iron)' }));
    s.appendChild(el('rect', { x: m - 70, y: h * 0.55, width: 140, height: h * 0.24, rx: 10, fill: 'none', stroke: 'var(--bns-log)', 'stroke-width': 8 }));
    s.appendChild(el('rect', { x: 40, y: h * 0.9, width: 20, height: h * 0.1, fill: 'var(--bns-iron)' }));
    s.appendChild(el('rect', { x: w - 60, y: h * 0.9, width: 20, height: h * 0.1, fill: 'var(--bns-iron)' }));
    return s;
  }

  // A table of birch, a slice of log for its top, and a glass jar on it with
  // lavender, grasses and a rose: things to take to your table.
  function table(w, h) {
    var s = svg(w, h), m = w / 2, top = h * 0.55;
    s.appendChild(el('rect', { x: m - 26, y: top, width: 52, height: h - top, fill: 'var(--bns-birch)' }));
    s.appendChild(el('ellipse', { cx: m, cy: top, rx: w / 2 - 10, ry: 30, fill: 'var(--bns-slice)' }));
    s.appendChild(el('ellipse', { cx: m, cy: top, rx: w / 2 - 50, ry: 18, fill: 'none', stroke: 'var(--bns-ring)', 'stroke-width': 4 }));
    s.appendChild(el('rect', { x: m - 40, y: top - 130, width: 80, height: 120, rx: 14, fill: 'var(--bns-glass)', 'fill-opacity': '0.6' }));
    [-30, -10, 14, 34].forEach(function (d, i) {
      s.appendChild(el('rect', { x: m + d, y: top - 260 + i * 12, width: 5, height: 150, fill: 'var(--bns-straw)' }));
    });
    [[-50, 'var(--bns-lavender)'], [44, 'var(--bns-lavender)']].forEach(function (q) {
      for (var y = 0; y < 5; y++) s.appendChild(el('ellipse', { cx: m + q[0], cy: top - 250 + y * 16, rx: 7, ry: 9, fill: q[1] }));
    });
    s.appendChild(el('circle', { cx: m + 4, cy: top - 200, r: 20, fill: 'var(--bns-rose)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['brew-and-stew.html'] = {
    prefix: 'bns-walk',
    from: 'campgrounds.html',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 960), sh = kit.H - 24;
      var END = 2600 + F;                       // where the board hangs
      var eye = sh / 2, SIDE = 620;
      var decor = [];
      var WH = sh + 560;

      decor.push(kit.item(logWall(3400, WH, [1700 - sw / 2 - 30, WH - sh - 30, sw + 60, sh + 30]), { x: 0, z: END + 30, w: 3400, h: WH }));
      var page = kit.screen(kit.page, 'Brew and Stew’s own page, on the board on the back wall');
      var board = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'bns-walk-board' });
      var len = END + 30;
      [-1, 1].forEach(function (k) {
        decor.push(kit.item(logWall(len, WH), { x: k * SIDE, z: len / 2, w: len, h: WH, turn: k < 0 ? kit.LEFT : kit.RIGHT }));
      });
      var heat = kit.item(stove(300, 720), { x: -SIDE + 220, z: 1300, w: 300, h: 720 });
      decor.push(heat);
      var spot = kit.item(table(420, 520), { x: 360, z: 1900, w: 420, h: 520 });
      decor.push(spot);

      var stops = [
        kit.stop({ name: 'inside the cabin door, the foxfire glowing between the logs', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'by the stove, shut, warm and giving no light', spot: kit.front(heat, 900) }, heat),
        kit.stop({ name: 'at a table with lavender, grasses and a rose in a jar', spot: kit.front(spot, 900) }, spot),
        kit.stop({ name: 'at the board on the back wall, with the tea room’s own page on it', spot: { x: 0, z: END - F }, link: page }, board)
      ];

      return {
        cls: 'bns-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Nobody lit this cabin; the light is growing in the logs. The tea room’s own page is on the board on the back wall.',
        bounds: function () { return { x: [-SIDE + 240, SIDE - 240], z: [0, END - F] }; },
        // Floorboards in the heather dark, the foxfire along the foot of each
        // wall, and no shadow anywhere.
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--bns-night'));
          var z0 = Math.max(from, 0), z1 = Math.min(to, END + 30), seam = kit.ink('--bns-deep');
          for (var x = -1700; x <= 1700; x += 100) kit.quad(g, x - 3, x + 3, z0, z1, seam);
          var glow = kit.ink('--bns-glow');
          kit.quad(g, -SIDE, -SIDE + 40, z0, z1, glow, 0.12);
          kit.quad(g, SIDE - 40, SIDE, z0, z1, glow, 0.12);
        }
      };
    }
  };
})();

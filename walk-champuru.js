/* =============================================================================
   Champuru, walked into on Paper Street. Ryan's ask, 2026-11-04: round 1 of
   the rooms that could not yet be walked into.

   IT IS THE LANE'S WORLD AND NOBODY ELSE'S (§136): Ryan's own table, in the
   shade of a narrow lane at noon, the kind both shores have, Mediterranean and
   Okinawan. On the left a wall of coral stone under a red-tiled eave, in
   shade, with the restaurant's open door in it and the room's own page hung in
   the doorway; on the right a whitewashed wall in full sun with teal shutters;
   bougainvillea over both; the table laid in the shade between them; and at
   the far end a strip of sea under a strip of sky.

   THE LIGHT IS THE SUN OFF THE WALL ACROSS THE LANE. No sun lands on the table
   or the paving: the whitewash is the brightest thing in the lane, and what it
   throws back is the only light with a side, a warm band down the paving
   along its foot and nothing hard anywhere. If sun ever lands on the table
   this has become the Hermitage with a menu; if the light ever comes from
   nowhere, the Dairy. The food on the table is drawn, never named, and nothing
   here says what food does for a body.

   NOTHING MOVES AT ANY SETTING. Every colour is one §136 declares, by name. It
   keeps nothing, sends nothing and fetches nothing; its page arrives through
   Paper Street's screen(). tools/make-paper-street.py holds each of those.
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
  function hash(i, j) {
    var n = Math.imul(i, 374761393) ^ Math.imul(j, 668265263);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  // Bougainvillea along a wall's top: leaves and the bracts in two magentas.
  function bougain(s, w, y) {
    for (var x = 0, k = 0; x < w; x += 46, k++) {
      s.appendChild(el('circle', { cx: x, cy: y + hash(k, 1) * 60, r: 34, fill: 'var(--chp-leaf)' }));
      if (hash(k, 2) < 0.7) s.appendChild(el('circle', { cx: x + 10, cy: y + 30 + hash(k, 3) * 70, r: 16,
        fill: hash(k, 4) < 0.5 ? 'var(--chp-flower)' : 'var(--chp-bougain)' }));
    }
  }

  // The coral wall in shade, under its red-tiled eave, with the restaurant's
  // doorway open in it where the page hangs.
  function coralWall(w, h, door, dw, dh) {
    var s = svg(w, h), eave = 120;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--chp-coral)' }));
    for (var y = eave + 40, r = 0; y < h; y += 70, r++) {
      for (var x = (r % 2) * 60; x < w; x += 120) s.appendChild(el('rect', { x: x, y: y, width: 116, height: 66, fill: 'none', stroke: 'var(--chp-coral-dark)', 'stroke-width': 3 }));
    }
    s.appendChild(el('rect', { x: door - dw / 2 - 26, y: h - dh - 26, width: dw + 52, height: dh + 26, fill: 'var(--chp-door)' }));
    s.appendChild(el('rect', { x: 0, y: eave - 30, width: w, height: 50, fill: 'var(--chp-tile-dark)' }));
    for (x = 0; x < w; x += 40) s.appendChild(el('rect', { x: x, y: 0, width: 34, height: eave - 10, rx: 14, fill: 'var(--chp-tile)' }));
    bougain(s, w, eave + 10);
    return s;
  }

  // The whitewash across the lane, in full sun, with its teal shutters.
  function whiteWall(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--chp-sun)' }));
    for (var x = 260; x < w - 300; x += 700) {
      var y = h * 0.34;
      s.appendChild(el('rect', { x: x, y: y, width: 260, height: 320, fill: 'var(--chp-shadow)' }));
      [0, 140].forEach(function (dx) {
        s.appendChild(el('rect', { x: x + dx - (dx ? -10 : 10), y: y, width: 120, height: 320, fill: 'var(--chp-water)' }));
        for (var sy = y + 20; sy < y + 300; sy += 28) s.appendChild(el('rect', { x: x + dx + (dx ? 20 : 0) - 4, y: sy, width: 100, height: 6, fill: 'var(--chp-door)' }));
      });
    }
    bougain(s, w, 20);
    return s;
  }

  // The far end of the lane: a strip of sky over a strip of sea.
  function seaEnd(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h * 0.62, fill: 'var(--chp-sky)' }));
    s.appendChild(el('rect', { x: 0, y: h * 0.62, width: w, height: h * 0.38, fill: 'var(--chp-sea)' }));
    s.appendChild(el('rect', { x: 0, y: h * 0.62, width: w, height: 6, fill: 'var(--chp-water)' }));
    return s;
  }

  // The table laid in the shade: a cloth, plates, and food in its own colours,
  // never named.
  function table(w, h) {
    var s = svg(w, h), top = h * 0.3;
    s.appendChild(el('path', { fill: 'var(--chp-cloth)', d: 'M20 ' + top + ' L60 0 H' + (w - 60) + ' L' + (w - 20) + ' ' + top + ' Z' }));
    s.appendChild(el('rect', { x: 0, y: top, width: w, height: h * 0.26, fill: 'var(--chp-cloth)' }));
    s.appendChild(el('rect', { x: 0, y: top + h * 0.22, width: w, height: 8, fill: 'var(--chp-bougain)' }));
    [[0.24, '--chp-imo', '--chp-leaf'], [0.5, '--chp-bounce', '--chp-tile'], [0.76, '--chp-leaf', '--chp-sea']].forEach(function (p) {
      var cx = w * p[0], cy = top * 0.55;
      s.appendChild(el('ellipse', { cx: cx, cy: cy, rx: 70, ry: 24, fill: 'var(--chp-plate)', stroke: 'var(--chp-line)', 'stroke-width': 2 }));
      s.appendChild(el('ellipse', { cx: cx - 12, cy: cy - 4, rx: 30, ry: 10, fill: 'var(' + p[1] + ')' }));
      s.appendChild(el('ellipse', { cx: cx + 22, cy: cy - 2, rx: 18, ry: 8, fill: 'var(' + p[2] + ')' }));
    });
    [0.08, 0.92].forEach(function (k) { s.appendChild(el('rect', { x: w * k - 12, y: top + h * 0.26, width: 24, height: h * 0.74 - top, fill: 'var(--chp-ink-2)' })); });
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['champuru.html'] = {
    prefix: 'chp-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 940), sh = kit.H - 24;
      var LANE = 760, LEN = 4200, DOOR = 2100, TABLE = 1300;
      var eye = sh / 2, WH = Math.max(1200, sh + 600), decor = [];

      decor.push(kit.item(coralWall(LEN, WH, DOOR, sw, sh), { x: -LANE, z: LEN / 2 - 200, w: LEN, h: WH, turn: kit.LEFT }));
      decor.push(kit.item(whiteWall(LEN, WH), { x: LANE, z: LEN / 2 - 200, w: LEN, h: WH, turn: kit.RIGHT }));
      decor.push(kit.item(seaEnd(6000, WH), { x: 0, z: LEN + 2600, w: 6000, h: WH }));
      var tbl = kit.item(table(680, 300), { x: 120, z: TABLE, w: 680, h: 300 });
      decor.push(tbl);

      // The page hangs in the restaurant's open doorway on the coral wall. The
      // wall runs from z = -200, so the doorway's middle is DOOR along it.
      var page = kit.screen(kit.page, 'Champuru’s own page, in the restaurant’s doorway');
      var hung = kit.item(page, { x: -LANE + 6, z: DOOR - 200, w: sw, h: sh, turn: kit.LEFT, cls: 'chp-walk-door' });

      var stops = [
        kit.stop({ name: 'at the mouth of the lane, in its shade at noon', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at Ryan’s table, the whitewash bright across from it', spot: kit.front(tbl) }, tbl),
        kit.stop({ name: 'at the restaurant’s doorway, with the room’s own page in it', spot: kit.front(hung), link: page }, hung),
        kit.stop({ name: 'at the end of the lane, the sea under the sky', spot: { x: 0, z: LEN - 600 } })
      ];

      return {
        cls: 'chp-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page hangs in the restaurant’s doorway on the left, past the table.',
        bounds: function () { return { x: [-LANE + 120, LANE - 120], z: [0, LEN - 600] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--chp-shade'));
          // Paving stones, and the warm band the whitewash throws down along its
          // own foot: the only light in the lane with a side.
          var seam = kit.ink('--chp-shadow');
          for (var x = -LANE; x <= LANE; x += 190) kit.quad(g, x - 3, x + 3, Math.max(from, -200), Math.min(to, LEN), seam);
          for (var z = Math.max(0, Math.ceil(from / 190) * 190); z < Math.min(to, LEN); z += 190) kit.quad(g, -LANE, LANE, z - 3, z + 3, seam);
          kit.quad(g, LANE - 260, LANE, Math.max(from, -200), Math.min(to, LEN), kit.ink('--chp-bounce'), 0.35);
        }
      };
    }
  };
})();

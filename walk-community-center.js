/* =============================================================================
   The Community Center, walked into on Paper Street. Ryan's ask, 2026-11-04:
   round 1 of the rooms that could not yet be walked into.

   IT IS THE COMMUNITY CENTER'S WORLD AND NOBODY ELSE'S (§51): a window seat in
   north light. Cool sage lime plaster on every wall, and one big window in the
   back wall facing north onto a living hillside, with a deep seat built into
   the bay under it, a cushion of the room's wool on it and the plant on the
   sill. The pale ash of the window's frame, the seat, the front desk and the
   pigeonholes is carried against the plaster by its darker grain. The room's
   own page hangs on the left-hand wall by the window, on the flat plaster it
   was written for, to read and press as itself: the front desk's forms and
   the map stay on it there.

   NORTH LIGHT: the day comes in soft and even from the window and lands
   nowhere in a patch or a bar, so nothing in here casts a hard shadow and no
   warm plaster appears anywhere. A patch of sun on warm plaster is Covenstead,
   and if one ever lands here it is this room that moves.

   NOTHING MOVES: the hillside does not sway and the plant stands still. Every
   colour is one §51 declares, by name. It keeps nothing, sends nothing and
   fetches nothing; its page arrives through Paper Street's screen().
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

  // The back wall: sage plaster, the big window onto the hill in an ash frame
  // with its rounded plaster reveal, the deep seat in the bay under it with
  // its wool cushion, and the plant on the sill.
  function backWall(w, h, ww, wh, sill) {
    var s = svg(w, h), cx = w / 2, top = h - sill - wh;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--ctr-plaster)' }));
    s.appendChild(el('rect', { x: cx - ww / 2 - 60, y: top - 60, width: ww + 120, height: wh + 60 + sill, rx: 60, fill: 'var(--ctr-hollow)' }));
    // The view: sky, the far ridge, the hill and its trees.
    s.appendChild(el('rect', { x: cx - ww / 2, y: top, width: ww, height: wh, fill: 'var(--ctr-sky)' }));
    s.appendChild(el('path', { fill: 'var(--ctr-ridge)', d: 'M' + (cx - ww / 2) + ' ' + (top + wh * 0.5) + ' Q' + (cx - ww * 0.1) + ' ' + (top + wh * 0.3) + ' ' + (cx + ww / 2) + ' ' + (top + wh * 0.46) + ' V' + (top + wh) + ' H' + (cx - ww / 2) + ' Z' }));
    s.appendChild(el('path', { fill: 'var(--ctr-hill)', d: 'M' + (cx - ww / 2) + ' ' + (top + wh * 0.7) + ' Q' + (cx + ww * 0.1) + ' ' + (top + wh * 0.46) + ' ' + (cx + ww / 2) + ' ' + (top + wh * 0.66) + ' V' + (top + wh) + ' H' + (cx - ww / 2) + ' Z' }));
    s.appendChild(el('path', { fill: 'var(--ctr-hill-2)', d: 'M' + (cx - ww / 2) + ' ' + (top + wh * 0.88) + ' Q' + (cx - ww * 0.2) + ' ' + (top + wh * 0.7) + ' ' + (cx + ww / 2) + ' ' + (top + wh * 0.86) + ' V' + (top + wh) + ' H' + (cx - ww / 2) + ' Z' }));
    [[-0.3, 0.6], [-0.18, 0.56], [0.22, 0.5], [0.34, 0.55]].forEach(function (t) {
      var tx = cx + ww * t[0], ty = top + wh * t[1];
      s.appendChild(el('rect', { x: tx - 4, y: ty, width: 8, height: 40, fill: 'var(--ctr-grain)' }));
      s.appendChild(el('ellipse', { cx: tx, cy: ty - 10, rx: 30, ry: 44, fill: 'var(--ctr-tree)' }));
    });
    // The window's ash frame and glazing bars.
    s.appendChild(el('rect', { x: cx - ww / 2, y: top, width: ww, height: wh, fill: 'none', stroke: 'var(--ctr-ash)', 'stroke-width': 26 }));
    s.appendChild(el('rect', { x: cx - ww / 2, y: top, width: ww, height: wh, fill: 'none', stroke: 'var(--ctr-grain)', 'stroke-width': 3 }));
    [1, 2].forEach(function (k) { s.appendChild(el('rect', { x: cx - ww / 2 + k * ww / 3 - 6, y: top, width: 12, height: wh, fill: 'var(--ctr-ash)' })); });
    // The deep seat in the bay, its wool cushion, and the plant on the sill.
    s.appendChild(el('rect', { x: cx - ww / 2 - 60, y: h - sill, width: ww + 120, height: 40, fill: 'var(--ctr-ash)', stroke: 'var(--ctr-grain)', 'stroke-width': 3 }));
    s.appendChild(el('rect', { x: cx - ww / 2 - 40, y: h - sill - 46, width: ww + 80, height: 50, rx: 22, fill: 'var(--ctr-wool)' }));
    s.appendChild(el('rect', { x: cx - ww / 2 - 60, y: h - sill + 40, width: ww + 120, height: sill - 40, fill: 'var(--ctr-ash)', stroke: 'var(--ctr-grain)', 'stroke-width': 3 }));
    var px = cx + ww / 2 - 70, py = h - sill - 46;
    s.appendChild(el('path', { fill: 'var(--ctr-pot)', d: 'M' + (px - 34) + ' ' + (py - 70) + ' H' + (px + 34) + ' L' + (px + 24) + ' ' + py + ' H' + (px - 24) + ' Z' }));
    [-1, 0, 1].forEach(function (k) {
      s.appendChild(el('ellipse', { cx: px + k * 30, cy: py - 110 - (k ? 0 : 30), rx: 18, ry: 44, fill: 'var(--ctr-leaf)' }));
    });
    return s;
  }

  // A plain wall of the same plaster, the left one with the page on it.
  function sideWall(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--ctr-plaster)' }));
    s.appendChild(el('rect', { x: 0, y: h - 40, width: w, height: 40, fill: 'var(--ctr-hollow)' }));
    return s;
  }

  // The front desk, pale ash carried by its grain, with the pigeonholes behind.
  function desk(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: w * 0.1, y: 0, width: w * 0.8, height: h * 0.5, fill: 'var(--ctr-ash)', stroke: 'var(--ctr-grain)', 'stroke-width': 4 }));
    for (var r = 0; r < 3; r++) for (var c = 0; c < 6; c++) {
      s.appendChild(el('rect', { x: w * 0.1 + 16 + c * (w * 0.8 - 32) / 6, y: 14 + r * (h * 0.5 - 28) / 3, width: (w * 0.8 - 32) / 6 - 10, height: (h * 0.5 - 28) / 3 - 10,
        fill: 'var(--ctr-hollow)', stroke: 'var(--ctr-grain)', 'stroke-width': 2 }));
    }
    s.appendChild(el('rect', { x: 0, y: h * 0.56, width: w, height: 24, fill: 'var(--ctr-ash)', stroke: 'var(--ctr-grain)', 'stroke-width': 3 }));
    s.appendChild(el('rect', { x: 20, y: h * 0.56 + 24, width: w - 40, height: h * 0.44 - 24, fill: 'var(--ctr-ash)', stroke: 'var(--ctr-grain)', 'stroke-width': 3 }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['community-center.html'] = {
    prefix: 'ctr-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 940), sh = kit.H - 24;
      var BACK = 2800 + F, WIDE = 1150;
      var eye = sh / 2, WH = Math.max(1100, sh + 560), decor = [];

      decor.push(kit.item(backWall(2 * WIDE + 40, WH, 1200, Math.min(WH - 420, 700), 260), { x: 0, z: BACK, w: 2 * WIDE + 40, h: WH }));
      [-1, 1].forEach(function (side) {
        decor.push(kit.item(sideWall(BACK + 300, WH), { x: side * WIDE, z: (BACK + 300) / 2 - 300, w: BACK + 300, h: WH,
          turn: side < 0 ? kit.LEFT : kit.RIGHT }));
      });
      var front = kit.item(desk(900, 360), { x: 560, z: 1200, w: 900, h: 360, turn: -0.3 });
      decor.push(front);

      var page = kit.screen(kit.page, 'The Community Center’s own page, on the left-hand wall by the window');
      var hung = kit.item(page, { x: -WIDE + 6, z: BACK - 900, w: sw, h: sh, y: 60, turn: kit.LEFT, cls: 'ctr-walk-wall' });

      var stops = [
        kit.stop({ name: 'inside the door, the window on the hill across the room', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the front desk, the pigeonholes behind it', spot: kit.front(front, 900) }, front),
        kit.stop({ name: 'at the window seat, the hill in north light', spot: { x: 0, z: BACK - F } }),
        kit.stop({ name: 'at the left-hand wall by the window, with the room’s own page on it', spot: kit.front(hung), link: page }, hung)
      ];

      return {
        cls: 'ctr-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is on the left-hand wall by the window seat.',
        bounds: function () { return { x: [-WIDE + 240, WIDE - 240], z: [0, BACK - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--ctr-ash'));
          // Pale ash boards, carried by their grain, and a wool rug by the seat.
          var grain = kit.ink('--ctr-ridge');
          for (var x = -WIDE; x < WIDE; x += 110) kit.quad(g, x, x + 3, Math.max(from, -300), Math.min(to, BACK), grain);
          kit.oval(g, 0, BACK - 500, 700, 300, kit.ink('--ctr-wool'), 0.85);
          kit.oval(g, 0, BACK - 500, 600, 240, kit.ink('--ctr-hill'), 0.5);
        }
      };
    }
  };
})();

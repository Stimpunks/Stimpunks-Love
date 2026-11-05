/* =============================================================================
   The Clacks Tower, walked into on Paper Street. Ryan's ask, 2026-11-04:
   subrooms of Widdershins inspired by places in the Discworld novels, in the
   city over the bridge, each walked into on both streets.

   THE SHUTTER CABIN AT THE TOP OF A CLACKS TOWER, AT NOON (§143), cut out of
   card. You come up the ladder into the cabin and the far wall is one flat: a
   grid of shutters, some tarred shut and some turned edge-on, with pale sky
   through the open ones, the next hill, and the next tower on it through the
   one in the middle. The sun comes in only where a shutter is open, so the
   only light on the stage lies on the floorboards in hard white squares, in
   the pattern the shutters hold, projected with the same RISE and DRIFT as the
   page's own drawing: the message going out. The side walls are planked
   flats in shade, and the room's own page hangs on the left one.

   NOBODY IS UP HERE, and nobody from the book is drawn. NOTHING MOVES: the
   shutters are held mid-word. Every colour is one §143 declares, by name. It
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
  function sized(s, w, h) { s.setAttribute('width', w); s.setAttribute('height', h); return s; }

  // The cabin, in metres, as the page's drawing has it: three columns of
  // shutters, three rows from the bottom, the pattern top row first, and the
  // sun's slope and drift through them.
  var COLS = [[-2.1, -0.9], [-0.6, 0.6], [0.9, 2.1]];
  var ROWS = [[0.95, 1.55], [1.7, 2.3], [2.45, 3.05]];
  var PATTERN = ['101', '010', '110'];
  var RISE = 1.6, DRIFT = 0.32, HALF = 3, TALL = 3.2;
  function open(c, r) { return PATTERN[ROWS.length - 1 - r].charAt(c) === '1'; }

  // The shutter wall, 100 to the metre: planks, the day through the open
  // shutters, the tar of the shut ones, and the lever bank under them.
  function wall() {
    var w = HALF * 200, h = TALL * 100, s = svg(w, h);
    function X(x) { return (x + HALF) * 100; }
    function Y(y) { return (TALL - y) * 100; }
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--clk-board)' }));
    for (var px = 50; px < w; px += 50) s.appendChild(el('rect', { x: px, y: 0, width: 1.5, height: h, fill: 'var(--clk-grain)' }));
    COLS.forEach(function (cx, c) {
      ROWS.forEach(function (ry, r) {
        var x = X(cx[0]), y = Y(ry[1]), ww = (cx[1] - cx[0]) * 100, hh = (ry[1] - ry[0]) * 100;
        if (open(c, r)) {
          s.appendChild(el('rect', { x: x, y: y, width: ww, height: hh, fill: 'var(--clk-sky)' }));
          // The next hill, and in the middle one the next tower on it.
          var top = r === 0 ? y : r === 1 ? y + hh * 0.72 : y + hh;
          if (top < y + hh) s.appendChild(el('rect', { x: x, y: top, width: ww, height: y + hh - top, fill: 'var(--clk-hill)' }));
          if (c === 1 && r === 1) {
            s.appendChild(el('rect', { x: x + ww / 2 - 1.5, y: y + hh * 0.3, width: 3, height: hh * 0.42, fill: 'var(--clk-far)' }));
            s.appendChild(el('rect', { x: x + ww / 2 - 7, y: y + hh * 0.18, width: 14, height: 8, fill: 'var(--clk-far)' }));
          }
          s.appendChild(el('rect', { x: x, y: y + hh / 2 - 2.5, width: ww, height: 5, fill: 'var(--clk-tar)' }));
        } else {
          s.appendChild(el('rect', { x: x, y: y, width: ww, height: hh, fill: 'var(--clk-tar)' }));
          for (var k = 1; k < 4; k++) s.appendChild(el('rect', { x: x + 4, y: y + hh * k / 4, width: ww - 8, height: 1.5, fill: 'var(--clk-grain)' }));
        }
        s.appendChild(el('rect', { x: x - 3, y: y - 3, width: ww + 6, height: hh + 6, fill: 'none', stroke: 'var(--clk-frame)', 'stroke-width': 6 }));
      });
    });
    // The lever bank, one lever for each shutter.
    s.appendChild(el('rect', { x: X(-2.4), y: Y(0.35), width: 480, height: 35, fill: 'var(--clk-frame)' }));
    for (var i = 0; i < 9; i++) {
      var c = Math.floor(i / 3), r = i % 3, lx = X(-2.1 + i * 0.525), lean = open(c, r) ? 8 : -5;
      s.appendChild(el('path', { d: 'M' + lx + ' ' + Y(0.35) + ' L' + (lx + lean) + ' ' + Y(0.8), stroke: 'var(--clk-timber-2)', 'stroke-width': 3, 'stroke-linecap': 'round' }));
      s.appendChild(el('circle', { cx: lx + lean, cy: Y(0.8), r: 4, fill: 'var(--clk-timber-2)' }));
    }
    return s;
  }

  // A side wall: planks in shade, nothing on them.
  function planks(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--clk-shade)' }));
    for (var y = 80; y < h; y += 80) s.appendChild(el('rect', { x: 0, y: y, width: w, height: 2, fill: 'var(--clk-grain)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['clacks-tower.html'] = {
    prefix: 'clk-walk',
    from: 'widdershins.html',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 860), sh = kit.H - 24;
      var eye = sh / 2, k = eye / 520;
      var M = 325 * k;                      // a metre on this stage
      var WALLZ = 1100, DEEP = 1300;        // the shutter wall, and how far back the cabin goes
      var decor = [];

      var shutters = kit.item(sized(wall(), HALF * 2 * M, TALL * M), { x: 0, z: WALLZ, w: HALF * 2 * M, h: TALL * M });
      decor.push(shutters);
      [-1, 1].forEach(function (side) {
        var p = sized(planks(DEEP + 400, TALL * 100), DEEP + 400, TALL * M);
        p.setAttribute('preserveAspectRatio', 'none');
        decor.push(kit.item(p, { x: side * HALF * M, z: WALLZ - DEEP / 2, w: DEEP + 400, h: TALL * M, turn: side < 0 ? kit.LEFT : kit.RIGHT }));
      });

      var page = kit.screen(kit.page, 'The Clacks Tower’s own page, on the left wall of the cabin, in the shade');
      var board = kit.item(page, { x: -HALF * M + 4, z: WALLZ - DEEP * 0.45, w: sw, h: sh, turn: kit.LEFT, cls: 'clk-walk-board' });

      var stops = [
        kit.stop({ name: 'at the top of the ladder, the shutters in front of you and the sun on the floor', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'standing in a square of sun, the shutters right above you', spot: { x: 0.2 * M, z: WALLZ - 1.1 * M } }),
        kit.stop({ name: 'at the shutters, the next tower on the next hill through the middle one', spot: kit.front(shutters, 1600) }, shutters),
        kit.stop({ name: 'at the left wall, with the room’s own page on it, in the shade', spot: kit.front(board), link: page }, board)
      ];

      return {
        cls: 'clk-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The shutters are on the far wall and the sun lies on the floor in front of them; the room’s own page hangs on the left wall.',
        bounds: function () { return { x: [-HALF * M + F * 0.4, HALF * M - F * 0.4], z: [0, WALLZ - 0.6 * M] }; },
        ground: function (g, from, to) {
          // The floorboards, in shade, and their joins.
          kit.quad(g, -HALF * M, HALF * M, from, Math.min(to, WALLZ), kit.ink('--clk-board'));
          var line = kit.ink('--clk-grain');
          for (var x = -HALF * M + M / 2; x < HALF * M; x += M / 2) kit.quad(g, x, x + 2, from, Math.min(to, WALLZ), line, 0.8);
          // The light: each open shutter's square of sun, projected along the
          // sun from the wall onto the boards, as the page's drawing projects it.
          var day = kit.ink('--clk-day');
          COLS.forEach(function (cx, c) {
            ROWS.forEach(function (ry, r) {
              if (!open(c, r)) return;
              var near = WALLZ - ry[1] / RISE * M, far = WALLZ - ry[0] / RISE * M;
              var shift = DRIFT * (ry[0] + ry[1]) / 2 / RISE * M;
              if (far < from || near > to) return;
              kit.quad(g, cx[0] * M + shift, cx[1] * M + shift, Math.max(from, near), Math.min(to, far), day);
            });
          });
        }
      };
    }
  };
})();

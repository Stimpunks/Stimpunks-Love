/* =============================================================================
   Covenstead, walked into on Paper Street. Ryan's ask, 2026-11-04: round 1 of
   the rooms that could not yet be walked into.

   IT IS COVENSTEAD'S WORLD AND NOBODY ELSE'S (§37): somebody's kitchen in the
   afternoon, one window in the left-hand wall, and the good china out. The
   light comes in at that one window, low from the left, and lands in ONE
   PATCH, on the table and the boards under the sill; the rest of the room is
   soft shade on warm limewash, slightly pink, never cooling toward green (that
   is the Garden with furniture in it). Indoors, sitting down, somebody's
   house. The kettle is on the range by the dresser and does not steam, and the
   room's own page hangs on the far wall beside the dresser, to read and press
   as itself.

   NOBODY'S CUP IS ANYBODY ELSE'S CUP. That is the room's subject: a group that
   does not match, meeting anyway. So every place at the table has its own cup,
   no two alike in shape or in colour; the teapot and the jug are two more
   strangers; the chairs do not match either; and the plates on the dresser are
   odd ones. Never make the crockery match. Nobody is drawn: the chairs are
   pulled out for whoever comes.

   NOTHING MOVES. Every colour is one §37 declares, by name. It keeps nothing,
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

  // Each cup its own shape and its own colour: a tall mug, a wide teacup on a
  // saucer, a beaker, a bowl of a cup, a little handleless one.
  var CUPS = [
    function (s, x, y) { s.appendChild(el('rect', { x: x - 18, y: y - 52, width: 36, height: 52, rx: 4, fill: 'var(--cov-delft)' }));
      s.appendChild(el('path', { fill: 'none', stroke: 'var(--cov-delft)', 'stroke-width': 6, d: 'M' + (x + 18) + ' ' + (y - 40) + ' q16 4 0 24' })); },
    function (s, x, y) { s.appendChild(el('ellipse', { cx: x, cy: y - 2, rx: 38, ry: 6, fill: 'var(--cov-sage)' }));
      s.appendChild(el('path', { fill: 'var(--cov-rose)', d: 'M' + (x - 30) + ' ' + (y - 34) + ' H' + (x + 30) + ' Q' + (x + 24) + ' ' + (y - 4) + ' ' + x + ' ' + (y - 4) + ' Q' + (x - 24) + ' ' + (y - 4) + ' ' + (x - 30) + ' ' + (y - 34) + ' Z' })); },
    function (s, x, y) { s.appendChild(el('path', { fill: 'var(--cov-sage)', d: 'M' + (x - 14) + ' ' + y + ' L' + (x - 20) + ' ' + (y - 46) + ' H' + (x + 20) + ' L' + (x + 14) + ' ' + y + ' Z' })); },
    function (s, x, y) { s.appendChild(el('path', { fill: 'var(--cov-ink-2)', d: 'M' + (x - 30) + ' ' + (y - 30) + ' H' + (x + 30) + ' Q' + x + ' ' + (y + 14) + ' ' + (x - 30) + ' ' + (y - 30) + ' Z' })); },
    function (s, x, y) { s.appendChild(el('rect', { x: x - 12, y: y - 26, width: 24, height: 26, rx: 8, fill: 'var(--cov-sun)' }));
      s.appendChild(el('rect', { x: x - 12, y: y - 26, width: 24, height: 6, fill: 'var(--cov-rose)' })); }
  ];

  // The table, the patch of sun across its left end, every place with its own
  // cup, and the teapot and the jug among them.
  function table(w, h) {
    var s = svg(w, h), top = h * 0.42;
    s.appendChild(el('rect', { x: 0, y: top, width: w, height: 24, fill: 'var(--cov-ink-2)' }));
    s.appendChild(el('rect', { x: 0, y: top, width: w * 0.42, height: 24, fill: 'var(--cov-sun)', 'fill-opacity': '0.5' }));
    [0.05, 0.95].forEach(function (k) { s.appendChild(el('rect', { x: w * k - 12, y: top + 24, width: 24, height: h - top - 24, fill: 'var(--cov-ink-2)' })); });
    CUPS.forEach(function (cup, i) { cup(s, w * (0.12 + i * 0.19), top); });
    // The teapot (round, delft) and the milk jug (sage), two more strangers.
    s.appendChild(el('ellipse', { cx: w * 0.36, cy: top - 44, rx: 52, ry: 44, fill: 'var(--cov-delft)' }));
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--cov-delft)', 'stroke-width': 10, d: 'M' + (w * 0.36 + 48) + ' ' + (top - 50) + ' l40 -26' }));
    s.appendChild(el('rect', { x: w * 0.36 - 14, y: top - 98, width: 28, height: 14, rx: 6, fill: 'var(--cov-rose)' }));
    s.appendChild(el('path', { fill: 'var(--cov-sage)', d: 'M' + (w * 0.6 - 20) + ' ' + top + ' L' + (w * 0.6 - 26) + ' ' + (top - 60) + ' L' + (w * 0.6 + 30) + ' ' + (top - 66) + ' L' + (w * 0.6 + 20) + ' ' + top + ' Z' }));
    return s;
  }

  // A chair, each one different: its back's shape and its colour.
  function chair(w, h, kind) {
    var s = svg(w, h), ink = ['var(--cov-sage)', 'var(--cov-rose)', 'var(--cov-ink-2)', 'var(--cov-delft)', 'var(--cov-rose)', 'var(--cov-sage)'][kind];
    var arched = kind < 4 ? kind % 2 : 1 - kind % 2;
    if (arched) s.appendChild(el('path', { fill: ink, d: 'M' + (w * 0.1) + ' ' + (h * 0.55) + ' V' + (w * 0.4) + ' A' + (w * 0.4) + ' ' + (w * 0.4) + ' 0 0 1 ' + (w * 0.9) + ' ' + (w * 0.4) + ' V' + (h * 0.55) + ' Z' }));
    else for (var x = w * 0.12; x < w * 0.9; x += w * 0.18) s.appendChild(el('rect', { x: x, y: 0, width: w * 0.08, height: h * 0.55, fill: ink }));
    s.appendChild(el('rect', { x: 0, y: h * 0.55, width: w, height: 18, fill: ink }));
    [0.06, 0.86].forEach(function (k) { s.appendChild(el('rect', { x: w * k, y: h * 0.55 + 18, width: w * 0.08, height: h * 0.45 - 18, fill: ink })); });
    return s;
  }

  // The left-hand wall: warm limewash, and the one window with the afternoon
  // in it.
  function windowWall(w, h, at) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--cov-wash)' }));
    s.appendChild(el('rect', { x: at - 230, y: h - 860, width: 460, height: 440, fill: 'var(--cov-sun)', stroke: 'var(--cov-ink-2)', 'stroke-width': 14 }));
    s.appendChild(el('rect', { x: at - 4, y: h - 860, width: 8, height: 440, fill: 'var(--cov-ink-2)' }));
    s.appendChild(el('rect', { x: at - 230, y: h - 650, width: 460, height: 8, fill: 'var(--cov-ink-2)' }));
    s.appendChild(el('rect', { x: at - 260, y: h - 420, width: 520, height: 20, fill: 'var(--cov-ink-2)' }));
    [-140, 140].forEach(function (dx) { s.appendChild(el('ellipse', { cx: at + dx, cy: h - 450, rx: 34, ry: 30, fill: 'var(--cov-sage)' })); });
    return s;
  }

  // The far wall: limewash, the dresser with its odd plates, and the range
  // with the kettle on it.
  function farWall(w, h, fw, fh) {
    var s = svg(w, h), dx = 160, dw = 560;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--cov-wash)' }));
    s.appendChild(el('rect', { x: dx, y: h - 760, width: dw, height: 760, fill: 'var(--cov-ink-2)' }));
    var plates = ['--cov-delft', '--cov-rose', '--cov-sage', '--cov-sun', '--cov-delft', '--cov-ink', '--cov-rose', '--cov-sage'];
    for (var r = 0; r < 2; r++) {
      s.appendChild(el('rect', { x: dx + 20, y: h - 740 + r * 170 + 140, width: dw - 40, height: 12, fill: 'var(--cov-ink)' }));
      for (var c = 0; c < 4; c++) {
        var rad = 44 + ((r * 4 + c) % 3) * 10;
        s.appendChild(el('circle', { cx: dx + 80 + c * 130, cy: h - 740 + r * 170 + 140 - rad, r: rad, fill: 'var(' + plates[r * 4 + c] + ')', stroke: 'var(--cov-ink)', 'stroke-width': 3 }));
      }
    }
    s.appendChild(el('rect', { x: dx, y: h - 360, width: dw, height: 30, fill: 'var(--cov-ink)' }));
    var rx = w - 680;
    s.appendChild(el('rect', { x: rx, y: h - 300, width: 460, height: 300, fill: 'var(--cov-ink)' }));
    s.appendChild(el('rect', { x: rx + 30, y: h - 260, width: 180, height: 140, fill: 'var(--cov-ink-2)' }));
    s.appendChild(el('ellipse', { cx: rx + 340, cy: h - 340, rx: 70, ry: 46, fill: 'var(--cov-rose)' }));
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--cov-ink)', 'stroke-width': 8, d: 'M' + (rx + 290) + ' ' + (h - 380) + ' Q' + (rx + 340) + ' ' + (h - 440) + ' ' + (rx + 390) + ' ' + (h - 380) }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['covenstead.html'] = {
    prefix: 'cov-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 900), sh = kit.H - 24;
      var END = 2000 + F, WIDE = 1150, TABLE = 1400;
      var eye = sh / 2, WH = Math.max(1100, sh + 560), decor = [];

      decor.push(kit.item(farWall(2 * WIDE + 40, WH, sw, sh), { x: 0, z: END + 30, w: 2 * WIDE + 40, h: WH }));
      decor.push(kit.item(windowWall(END + 300, WH, TABLE + 300), { x: -WIDE, z: (END + 300) / 2 - 300, w: END + 300, h: WH, turn: kit.LEFT }));
      var right = svg(END + 300, WH);
      right.appendChild(el('rect', { x: 0, y: 0, width: END + 300, height: WH, fill: 'var(--cov-wash)' }));
      decor.push(kit.item(right, { x: WIDE, z: (END + 300) / 2 - 300, w: END + 300, h: WH, turn: kit.RIGHT }));
      [[-560, 0], [-180, 1], [200, 2], [560, 3]].forEach(function (c) {
        decor.push(kit.item(chair(170, 300, c[1]), { x: c[0], z: TABLE + 260, w: 170, h: 300 }));
      });
      var tbl = kit.item(table(1300, 300), { x: 0, z: TABLE, w: 1300, h: 300 });
      decor.push(tbl);
      [[-500, 4], [480, 5]].forEach(function (c) {
        decor.push(kit.item(chair(170, 300, c[1]), { x: c[0], z: TABLE - 220, w: 170, h: 300 }));
      });

      var page = kit.screen(kit.page, 'Covenstead’s own page, on the far wall beside the dresser');
      var hung = kit.item(page, { x: 180, z: END, w: sw, h: sh, y: 330, cls: 'cov-walk-leaf' });

      var stops = [
        kit.stop({ name: 'inside the kitchen door, the window on your left', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the table, nobody’s cup the same as anybody else’s', spot: kit.front(tbl, 900) }, tbl),
        kit.stop({ name: 'by the window, the afternoon coming in low', spot: { x: -500, z: TABLE - 400, yaw: -kit.LEFT * 0.7 } }),
        kit.stop({ name: 'at the far wall by the dresser, with the room’s own page on it', spot: kit.front(hung), link: page }, hung)
      ];

      return {
        cls: 'cov-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is on the far wall beside the dresser, past the table.',
        bounds: function () { return { x: [-WIDE + 300, WIDE - 300], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--cov-ink-2'));
          var seam = kit.ink('--cov-ink');
          for (var x = -WIDE; x < WIDE; x += 120) kit.quad(g, x, x + 4, Math.max(from, -300), Math.min(to, END + 30), seam);
          // The one patch of sun, on the boards under the sill.
          kit.quad(g, -WIDE, -WIDE + 700, TABLE - 300, TABLE + 300, kit.ink('--cov-sun'), 0.4);
        }
      };
    }
  };
})();

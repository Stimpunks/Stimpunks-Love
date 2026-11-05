/* =============================================================================
   The Golem Trust, walked into on Paper Street, over the bridge from
   Widdershins. Ryan's ask, 2026-11-04: subrooms of Widdershins in the city.

   A LONG HALL KEPT BY GOLEMS WHO OWN THEMSELVES (§144), and no lamp in it.
   The far wall is one long flat of card: dark, with three tall windows in it
   whose panes are clay pressed thin enough for the day to come through, pale
   where the clay is thinnest and darker in the whorl of a thumb. Those panes
   are the only light. In front of them, each a flat of its own, stand the
   golems in their outlines, blocks of clay with no face and no eyes,
   anybody's; the long table with its slates; and, on a board by the middle
   window, the room's own page, full size once you stand at it.

   The Cave is the collision to watch: there the ice itself glows all round
   you; here only the windows give light. It shares nothing with Widdershins,
   a crooked city at night. NOTHING MOVES. Every colour is one §144 declares,
   by name. It keeps nothing, sends nothing and fetches nothing; its page
   arrives through Paper Street's screen(). tools/make-paper-street.py holds
   each of those.
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

  // The far wall: dark, three windows of clay panes, a whorl in each pane.
  function wall(w, h, wins, ww, hole) {
    var s = svg(w, h), sill = h * 0.22, top = h * 0.82;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--gtr-deep)' }));
    wins.forEach(function (cx, i) {
      var x0 = cx - ww / 2, r = ww / 2, wy = h - top;
      s.appendChild(el('path', { fill: 'var(--gtr-frame)', d: 'M' + (x0 - 24) + ' ' + (h - sill + 24) + ' V' + (wy + r) + ' A' + (r + 24) + ' ' + (r + 24) + ' 0 0 1 ' + (x0 + ww + 24) + ' ' + (wy + r) + ' V' + (h - sill + 24) + ' Z' }));
      var cols = 3, rows = 5, gap = 16, pw = (ww - gap * (cols - 1)) / cols, ph = (h - sill - wy - r - gap * rows) / rows;
      s.appendChild(el('path', { fill: 'var(--gtr-pane)', d: 'M' + x0 + ' ' + (wy + r) + ' A' + r + ' ' + r + ' 0 0 1 ' + (x0 + ww) + ' ' + (wy + r) + ' Z' }));
      for (var c = 0; c < cols; c++) for (var k = 0; k < rows; k++) {
        var px = x0 + c * (pw + gap), py = wy + r + gap + k * (ph + gap);
        s.appendChild(el('rect', { x: px, y: py, width: pw, height: ph, fill: 'var(--gtr-pane)' }));
        var tx = px + pw * (0.3 + ((i * 7 + c * 3 + k) % 5) * 0.1), ty = py + ph * 0.45;
        for (var q = 0; q < 3; q++) s.appendChild(el('ellipse', { cx: tx, cy: ty, rx: 14 + q * 12, ry: 18 + q * 14, fill: 'none', stroke: 'var(--gtr-thick)', 'stroke-width': 6 }));
        s.appendChild(el('path', { d: 'M' + (px + 16) + ' ' + (py + ph - 22) + ' h' + (pw * 0.55), stroke: 'var(--gtr-thick)', 'stroke-width': 7, 'stroke-linecap': 'round' }));
      }
    });
    if (hole) s.appendChild(el('rect', { x: hole[0], y: hole[1], width: hole[2], height: hole[3], fill: 'var(--gtr-clay)' }));
    return s;
  }

  // A golem in outline against the light: no face, no eyes, nobody's.
  function golem(w, h, holding) {
    var s = svg(w, h), cx = w / 2, ink = 'var(--gtr-clay-2)';
    var leg = h * 0.32, body = h * 0.48, head = h * 0.2;
    s.appendChild(el('rect', { x: cx - w * 0.17, y: 0, width: w * 0.34, height: head, rx: w * 0.1, fill: ink }));
    s.appendChild(el('path', { fill: ink, d: 'M' + (cx - w * 0.46) + ' ' + head + ' H' + (cx + w * 0.46) + ' L' + (cx + w * 0.36) + ' ' + (head + body) + ' H' + (cx - w * 0.36) + ' Z' }));
    [-1, 1].forEach(function (sd) {
      s.appendChild(el('rect', { x: cx + sd * w * 0.21 - w * 0.14, y: head + body - 4, width: w * 0.28, height: leg + 4, rx: 10, fill: ink }));
      if (!holding) s.appendChild(el('rect', { x: cx + sd * w * 0.4 - w * 0.1, y: head + 8, width: w * 0.2, height: body * 0.95, rx: 14, fill: ink }));
    });
    if (holding) {
      s.appendChild(el('rect', { x: cx - w * 0.42, y: head + body * 0.18, width: w * 0.84, height: body * 0.56, rx: 8, fill: 'var(--gtr-clay)' }));
      s.appendChild(el('rect', { x: cx - w * 0.38, y: head + body * 0.18 + 12, width: w * 0.76, height: body * 0.56 - 24, rx: 4, fill: 'var(--gtr-slate)' }));
      for (var k = 0; k < 3; k++) s.appendChild(el('path', { d: 'M' + (cx - w * 0.3) + ' ' + (head + body * (0.3 + k * 0.13)) + ' h' + (w * (0.4 + (k % 2) * 0.15)), stroke: 'var(--gtr-chalk-2)', 'stroke-width': 5, 'stroke-linecap': 'round' }));
    }
    return s;
  }

  // The long table, its slates lying on it.
  function table(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: 40, fill: 'var(--gtr-frame)' }));
    [30, w - 70].forEach(function (x) { s.appendChild(el('rect', { x: x, y: 40, width: 40, height: h - 40, fill: 'var(--gtr-frame)' })); });
    [0.1, 0.32, 0.6, 0.8].forEach(function (f, i) {
      var x = w * f;
      s.appendChild(el('rect', { x: x, y: -2, width: 180, height: 22, rx: 4, fill: 'var(--gtr-clay)' }));
      s.appendChild(el('rect', { x: x + 8, y: 2, width: 164, height: 14, rx: 2, fill: 'var(--gtr-slate)' }));
    });
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['golem-trust.html'] = {
    prefix: 'gtr-walk',
    from: 'widdershins.html',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 960), sh = kit.H - 24;
      var eye = sh / 2, END = 2600 + F, SIDE = 2000;
      var WH = sh + 900, WWALL = 4200, WIN = 640;
      var decor = [];
      var page = kit.screen(kit.page, 'The Golem Trust’s own page, on a board in the hall');

      decor.push(kit.item(wall(WWALL, WH, [WWALL / 2 - 1300, WWALL / 2, WWALL / 2 + 1300], WIN), { x: 0, z: END + 30, w: WWALL, h: WH }));
      var board = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'gtr-walk-board' });
      [-1, 1].forEach(function (k) {
        decor.push(kit.item(wall(END + 30, WH, [], 0), { x: k * SIDE, z: (END + 30) / 2, w: END + 30, h: WH, turn: k < 0 ? kit.LEFT : kit.RIGHT }));
      });
      var g1 = kit.item(golem(340, 900), { x: -1300, z: END - 260, w: 340, h: 900 });
      var g2 = kit.item(golem(340, 880, true), { x: 1300, z: END - 300, w: 340, h: 880 });
      decor.push(g1, g2);
      decor.push(kit.item(table(1300, 260), { x: 0, z: END - 900, w: 1300, h: 260 }));

      var stops = [
        kit.stop({ name: 'inside the door, the windows of clay at the far end of the hall', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the long table, its slates lying on it', spot: { x: 0, z: END - 900 - F * 0.9 } }),
        kit.stop({ name: 'before the golem holding up its slate, written on in chalk', spot: kit.front(g2, 900) }, g2),
        kit.stop({ name: 'at the board by the middle window, with the room’s own page', spot: { x: 0, z: END - F }, link: page }, board)
      ];
      return {
        cls: 'gtr-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'There is no lamp; the light comes in through windows of clay at the far end, and the room’s own page is on a board between them.',
        bounds: function () { return { x: [-SIDE + 200, SIDE - 200], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--gtr-slate'));
          var seam = kit.ink('--gtr-frame'), z0 = Math.max(from, 0), z1 = Math.min(to, END + 30);
          for (var z = Math.ceil(z0 / 260) * 260; z < z1; z += 260) kit.quad(g, -SIDE, SIDE, z, z + 6, seam);
          // The day off the windows, lying on the slate towards you.
          [-1300, 0, 1300].forEach(function (x) { kit.quad(g, x - WIN / 2, x + WIN / 2, Math.max(from, END - 1400), Math.min(to, END + 30), kit.ink('--gtr-pane'), 0.18); });
        }
      };
    }
  };
})();

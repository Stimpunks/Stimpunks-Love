/* =============================================================================
   Loo With a View, walked into on Paper Street. Ryan's ask, 2026-11-04: round
   one of the rest of the rooms, each its own world in card.

   IT IS THE REST STOP'S WORLD AND NOBODY ELSE'S (§137): a public restroom at
   the top of a mountain road, for everybody and free, half dug into the
   hillside and half out over a fjord. Board-marked concrete down the left with
   the stall doors in larch, every one of them for everybody; rusted steel down
   the right with a larch bench and the wash trough; and at the far end one
   glass wall onto the fjord, with the room's own page hung on the concrete
   beside it.

   THE LIGHT IS THE MIDNIGHT SUN, ON THE HORIZON STRAIGHT OUT THROUGH THE
   GLASS. So everything you face is backlit: a line of gold along its far edge,
   its face toward you in cool shadow, and its long shadow lying back across
   the floor to your feet. Nothing has a warm face you can see (that would be
   the Hermitage), and there is no lamp and no strip in the room (that would be
   the mountain cabin). The sun sits on the horizon and stays there: nothing
   moves at any setting. Every colour is one §137 declares, by name. It keeps
   nothing, sends nothing and fetches nothing; its page arrives through Paper
   Street's screen(). tools/make-paper-street.py holds each of those.
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

  // The far end: concrete on the left where the page hangs, then the glass,
  // and through it the fjord between its ridges, the sky going low and gold
  // to the sun sat on the water's edge.
  function farEnd(w, h, conc, horizon) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--lwv-sky)' }));
    s.appendChild(el('rect', { x: 0, y: horizon - 160, width: w, height: 160, fill: 'var(--lwv-low)' }));
    s.appendChild(el('rect', { x: 0, y: horizon - 50, width: w, height: 50, fill: 'var(--lwv-glare)' }));
    var sx = conc + (w - conc) * 0.55;
    s.appendChild(el('circle', { cx: sx, cy: horizon - 10, r: 70, fill: 'var(--lwv-sun)' }));
    s.appendChild(el('path', { fill: 'var(--lwv-ridge)', d: 'M' + conc + ' ' + (horizon - 220) + ' L' + (conc + 150) + ' ' + (horizon - 100) + ' L' + (conc + 300) + ' ' + horizon + ' L' + conc + ' ' + horizon + ' Z' }));
    s.appendChild(el('path', { fill: 'var(--lwv-ridge)', d: 'M' + w + ' ' + (horizon - 240) + ' L' + (w - 170) + ' ' + (horizon - 110) + ' L' + (w - 340) + ' ' + horizon + ' L' + w + ' ' + horizon + ' Z' }));
    s.appendChild(el('rect', { x: 0, y: horizon, width: w, height: h - horizon, fill: 'var(--lwv-fjord)' }));
    s.appendChild(el('rect', { x: sx - 40, y: horizon + 6, width: 80, height: h - horizon - 6, fill: 'var(--lwv-glare)', 'fill-opacity': '0.5' }));
    for (var x = conc; x <= w; x += 340) s.appendChild(el('rect', { x: x, y: 0, width: 14, height: h, fill: 'var(--lwv-line)' }));
    s.appendChild(el('rect', { x: conc, y: h - 40, width: w - conc, height: 40, fill: 'var(--lwv-line)' }));
    // The concrete, board-marked, its far edge caught gold.
    s.appendChild(el('rect', { x: 0, y: 0, width: conc, height: h, fill: 'var(--lwv-concrete)' }));
    for (var y = 30; y < h; y += 46) s.appendChild(el('rect', { x: 0, y: y, width: conc, height: 3, fill: 'var(--lwv-shade)' }));
    s.appendChild(el('rect', { x: conc - 8, y: 0, width: 8, height: h, fill: 'var(--lwv-rim)' }));
    return s;
  }

  // The concrete wall down the left with the stall doors in it: larch, a
  // corten frame round each, and the gold catching along the top.
  function stalls(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--lwv-concrete)' }));
    for (var y = 30; y < h; y += 46) s.appendChild(el('rect', { x: 0, y: y, width: w, height: 3, fill: 'var(--lwv-shade)' }));
    var dw = 230, dh = Math.min(h - 60, 520);
    for (var x = 120; x + dw < w - 60; x += dw + 160) {
      s.appendChild(el('rect', { x: x - 12, y: h - dh - 12, width: dw + 24, height: dh + 12, fill: 'var(--lwv-corten)' }));
      s.appendChild(el('rect', { x: x, y: h - dh, width: dw, height: dh, fill: 'var(--lwv-larch)' }));
      for (var k = 1; k < 6; k++) s.appendChild(el('rect', { x: x + k * dw / 6, y: h - dh, width: 3, height: dh, fill: 'var(--lwv-shade)', 'fill-opacity': '0.35' }));
      s.appendChild(el('rect', { x: x + dw - 40, y: h - dh / 2 - 4, width: 26, height: 8, fill: 'var(--lwv-line)' }));
      s.appendChild(el('rect', { x: x - 12, y: h - dh - 12, width: dw + 24, height: 5, fill: 'var(--lwv-rim)' }));
    }
    return s;
  }

  // The rusted steel wall down the right, a long larch bench along it and the
  // wash trough, everything with its gold edge on the side away from you.
  function steel(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--lwv-corten)' }));
    for (var x = 0; x < w; x += 180) s.appendChild(el('rect', { x: x, y: 0, width: 4, height: h, fill: 'var(--lwv-line)', 'fill-opacity': '0.5' }));
    var by = h - 150;
    s.appendChild(el('rect', { x: 60, y: by, width: w * 0.45, height: 34, fill: 'var(--lwv-larch)' }));
    s.appendChild(el('rect', { x: 60, y: by, width: w * 0.45, height: 4, fill: 'var(--lwv-rim)' }));
    for (x = 90; x < 60 + w * 0.45; x += 260) s.appendChild(el('rect', { x: x, y: by + 34, width: 16, height: 116, fill: 'var(--lwv-line)' }));
    var tx = w * 0.6, ty = h - 230;
    s.appendChild(el('rect', { x: tx, y: ty, width: w * 0.3, height: 70, fill: 'var(--lwv-concrete)' }));
    s.appendChild(el('rect', { x: tx, y: ty, width: w * 0.3, height: 5, fill: 'var(--lwv-rim)' }));
    s.appendChild(el('rect', { x: tx + 20, y: ty + 70, width: 30, height: 160, fill: 'var(--lwv-concrete)' }));
    for (x = tx + 60; x < tx + w * 0.3 - 30; x += 120) s.appendChild(el('rect', { x: x, y: ty - 70, width: 8, height: 70, fill: 'var(--lwv-ink-2)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['loo-with-a-view.html'] = {
    prefix: 'lwv-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 900), sh = kit.H - 24;
      var END = 2600 + F;                       // the glass
      var SIDE = 1100, eye = sh / 2, WH = sh + 360;
      var CONC = sw + 300;                      // the concrete at the end, where the page hangs
      var decor = [];

      decor.push(kit.item(farEnd(SIDE * 2, WH, CONC, WH - eye), { x: 0, z: END + 30, w: SIDE * 2, h: WH }));
      decor.push(kit.item(stalls(END + 200, WH), { x: -SIDE, z: (END + 200) / 2, w: END + 200, h: WH, turn: kit.LEFT }));
      decor.push(kit.item(steel(END + 200, WH), { x: SIDE, z: (END + 200) / 2, w: END + 200, h: WH, turn: kit.RIGHT }));

      var px = -SIDE + CONC / 2;
      var page = kit.screen(kit.page, 'Loo With a View’s own page, on the concrete beside the glass');
      var board = kit.item(page, { x: px, z: END, w: sw, h: sh, cls: 'lwv-walk-board' });

      var stops = [
        kit.stop({ name: 'inside the door, the sun straight ahead through the glass', spot: { x: 300, z: 0 } }),
        kit.stop({ name: 'at the stall doors, larch in rusted steel frames, every one of them for everybody', spot: { x: -SIDE + 460, z: 1100, yaw: -kit.LEFT } }),
        kit.stop({ name: 'at the bench and the wash trough, along the rusted steel', spot: { x: SIDE - 460, z: 1400, yaw: -kit.RIGHT } }),
        kit.stop({ name: 'at the glass, the midnight sun sat on the horizon over the fjord', spot: { x: 600, z: END - 900 } }),
        kit.stop({ name: 'at the concrete beside the glass, with the room’s own page on it', spot: { x: px, z: END - F }, link: page }, board)
      ];

      return {
        cls: 'lwv-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 300, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The glass is straight ahead with the sun in it; its own page hangs on the concrete beside it.',
        bounds: function () { return { x: [-SIDE + 380, SIDE - 380], z: [0, END - F] }; },
        ground: function (g, near, far) {
          kit.quad(g, -4000, 4000, near, far, kit.ink('--lwv-shade'));
          // The sun's line along the floor, straight in from the glass, and the
          // long shadows lying back toward the door.
          kit.quad(g, 520, 680, Math.max(0, near), Math.min(far, END), kit.ink('--lwv-rim'), 0.18);
          var line = kit.ink('--lwv-line');
          for (var z = 400; z < END; z += 390) kit.quad(g, -SIDE + 40, -SIDE + 280, z - 300, z, line, 0.35);
          kit.quad(g, SIDE - 300, SIDE - 40, 900, 2100, line, 0.35);
          for (var x = -SIDE; x <= SIDE; x += 300) kit.quad(g, x - 2, x + 2, Math.max(0, near), Math.min(far, END), kit.ink('--lwv-card'));
        }
      };
    }
  };
})();

/* =============================================================================
   The Comfort Station, walked into on Paper Street: one of the street's public
   restrooms, down the steps under the park. Ryan's ask, 2026-11-04: round 1 of
   the rooms that could not yet be walked into.

   IT IS THE COMFORT STATION'S WORLD AND NOBODY ELSE'S (§138): a long hall one
   flight down, white glazed tile with a green band at the height of a hand, a
   terrazzo floor, brass and oak. THE LIGHT COMES THROUGH THE PAVEMENT: the
   ceiling is the underside of the path, iron frames of glass prisms gone
   faintly violet with age, drawn here as the frames that cross the hall
   overhead, and the daylight lies on the floor in a grid of dots. There is no
   lamp and no rainbow: these prisms make dots, never spectra.

   Along the left wall, the basins under one long mirror and the long bench;
   along the right, the row of oak doors to the ceiling, each with its brass
   plate saying FREE in words, every stall the same and every one of them
   accessible, none set apart. At the far end, on an enamel board on the tile,
   the room's own page, to read and press as itself.

   NOTHING MOVES, at any setting. Every colour is one §138 declares, by name.
   It keeps nothing, sends nothing and fetches nothing; its page arrives
   through Paper Street's screen(). tools/make-paper-street.py holds each of
   those.
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

  // A tiled wall: white glaze in a grid of grout, the green band at hand
  // height, and a dark skirting.
  function tiles(s, w, h) {
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--cst-tile)' }));
    for (var y = 0; y < h; y += 60) s.appendChild(el('rect', { x: 0, y: y, width: w, height: 2, fill: 'var(--cst-grout)' }));
    for (var x = 0; x < w; x += 120) s.appendChild(el('rect', { x: x, y: 0, width: 2, height: h, fill: 'var(--cst-grout)' }));
    s.appendChild(el('rect', { x: 0, y: h - 360, width: w, height: 30, fill: 'var(--cst-trim)' }));
    s.appendChild(el('rect', { x: 0, y: h - 40, width: w, height: 40, fill: 'var(--cst-trim)' }));
  }

  // The left wall: the long mirror over the basins, brass taps, and the long
  // oak bench further along.
  function leftWall(w, h) {
    var s = svg(w, h);
    tiles(s, w, h);
    var mx = w * 0.12, mw = w * 0.42;
    s.appendChild(el('rect', { x: mx, y: h - 760, width: mw, height: 300, fill: 'var(--cst-panel)', stroke: 'var(--cst-brass)', 'stroke-width': 8 }));
    for (var x = mx + 120; x < mx + mw - 60; x += 260) {
      s.appendChild(el('path', { fill: 'var(--cst-tile)', stroke: 'var(--cst-grout)', 'stroke-width': 4, d: 'M' + (x - 90) + ' ' + (h - 420) + ' H' + (x + 90) + ' L' + (x + 70) + ' ' + (h - 360) + ' H' + (x - 70) + ' Z' }));
      s.appendChild(el('rect', { x: x - 6, y: h - 456, width: 12, height: 36, fill: 'var(--cst-brass)' }));
    }
    var bx = w * 0.62, bw = w * 0.3;
    s.appendChild(el('rect', { x: bx, y: h - 230, width: bw, height: 34, rx: 6, fill: 'var(--cst-oak)' }));
    for (x = bx + 30; x < bx + bw; x += bw / 3) s.appendChild(el('rect', { x: x, y: h - 196, width: 18, height: 156, fill: 'var(--cst-iron)' }));
    return s;
  }

  // The right wall: the row of oak doors, each to the ceiling, each with its
  // brass plate saying FREE.
  function rightWall(w, h, n) {
    var s = svg(w, h);
    tiles(s, w, h);
    var dw = 260, gap = (w - n * dw) / (n + 1);
    for (var i = 0; i < n; i++) {
      var x = gap + i * (dw + gap);
      s.appendChild(el('rect', { x: x, y: 0, width: dw, height: h - 40, fill: 'var(--cst-oak)' }));
      s.appendChild(el('rect', { x: x + 20, y: 60, width: dw - 40, height: h * 0.34, fill: 'none', stroke: 'var(--cst-iron)', 'stroke-width': 4 }));
      s.appendChild(el('rect', { x: x + dw / 2 - 60, y: h - 520, width: 120, height: 46, rx: 6, fill: 'var(--cst-brass)' }));
      var t = el('text', { x: x + dw / 2, y: h - 488, 'text-anchor': 'middle', 'font-size': 26, 'font-weight': 700, fill: 'var(--cst-ink)' });
      t.textContent = 'FREE';
      s.appendChild(t);
      s.appendChild(el('rect', { x: x + dw - 40, y: h - 400, width: 14, height: 60, rx: 6, fill: 'var(--cst-brass)' }));
    }
    return s;
  }

  // A frame of the vault lights overhead: iron, set with glass prisms, each a
  // small lit point of the day above.
  function vault(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--cst-iron)' }));
    for (var y = 14; y < h - 10; y += 26) for (var x = 16; x < w - 10; x += 30) s.appendChild(el('circle', { cx: x, cy: y, r: 8, fill: 'var(--cst-prism)' }));
    return s;
  }

  // The far wall, tiled, with the enamel board the page is on.
  function farWall(w, h, fw, fh) {
    var s = svg(w, h);
    tiles(s, w, h);
    s.appendChild(el('rect', { x: w / 2 - fw / 2 - 26, y: h - fh - 96, width: fw + 52, height: fh + 52, rx: 10, fill: 'var(--cst-trim)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['comfort-station.html'] = {
    prefix: 'cst-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 940), sh = kit.H - 24;
      var END = 3200 + F;                       // where the page hangs
      var eye = sh / 2, WIDE = 820, LEN = END + 300;
      var WH = Math.max(1100, sh + 560), decor = [];

      decor.push(kit.item(leftWall(LEN, WH), { x: -WIDE, z: LEN / 2 - 300, w: LEN, h: WH, turn: kit.LEFT }));
      decor.push(kit.item(rightWall(LEN, WH, 9), { x: WIDE, z: LEN / 2 - 300, w: LEN, h: WH, turn: kit.RIGHT }));
      decor.push(kit.item(farWall(2 * WIDE + 40, WH, sw, sh), { x: 0, z: END + 30, w: 2 * WIDE + 40, h: WH }));
      for (var z = 700; z < END; z += 900) decor.push(kit.item(vault(2 * WIDE, 120), { x: 0, z: z, w: 2 * WIDE, h: 120, y: WH - 160 }));

      var page = kit.screen(kit.page, 'The Comfort Station’s own page, on an enamel board at the far end');
      var hung = kit.item(page, { x: 0, z: END, w: sw, h: sh, y: 70, cls: 'cst-walk-board' });

      var stops = [
        kit.stop({ name: 'at the foot of the steps, the lift beside them', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'by the basins under the long mirror', spot: { x: -300, z: 1100, yaw: -kit.LEFT } }),
        kit.stop({ name: 'by the row of oak doors, every plate saying free', spot: { x: 300, z: 1800, yaw: -kit.RIGHT } }),
        kit.stop({ name: 'at the far end, with the room’s own page on an enamel board', spot: kit.front(hung), link: page }, hung)
      ];

      return {
        cls: 'cst-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is on an enamel board at the far end of the hall.',
        bounds: function () { return { x: [-WIDE + 260, WIDE - 260], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--cst-terrazzo'));
          // Terrazzo chips, the same every visit, and the day through the
          // pavement lying in a grid of dots.
          var chips = ['--cst-chip-1', '--cst-chip-2', '--cst-chip-3'];
          var z0 = Math.max(-200, Math.floor(from / 80) * 80), z1 = Math.min(to, END);
          for (var zz = z0; zz < z1; zz += 80) {
            for (var x = -WIDE; x < WIDE; x += 80) {
              var n = Math.abs((x * 7 + zz * 13) % 97);
              if (n < 20) kit.quad(g, x + n, x + n + 12, zz + (n % 40), zz + (n % 40) + 10, kit.ink(chips[n % 3]), 0.9);
            }
          }
          var day = kit.ink('--cst-daylight');
          for (zz = Math.max(300, Math.ceil(from / 150) * 150); zz < z1; zz += 150) {
            for (x = -WIDE + 150; x < WIDE; x += 150) kit.oval(g, x, zz, 26, 16, day, 0.9);
          }
        }
      };
    }
  };
})();

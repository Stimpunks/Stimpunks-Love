/* =============================================================================
   Brighter Days Solar Farm, walked into on Paper Street. Ryan's call,
   2026-11-04: round one of the rooms you can walk into, the solar farm among
   them.

   IT IS THE SOLAR FARM'S WORLD AND NOBODY ELSE'S (§106): agrivoltaics, panels
   up on posts with peppers growing under them, after Star Stuff's Two
   Peppers. THE LIGHT IS NOON, SHARED: the sun is straight overhead and the
   panels take the top of it, so every panel has a hard white line along its
   top edge and straight under every row lies the shade the peppers live in.
   Shadows fall straight down and nowhere else. The sky is noon blue, and the
   panels' glass is deep and cool; if the glass ever warms or pales, this has
   become the Hermitage with a field.

   You walk down the lane between two rows, jalapeños and chiltepines in the
   shade under them and the sheep grazing between, to the battery shed at the
   end, whose screen holds the farm's own page, full size once you stand at it.
   Nothing moves. Every colour is one §106 declares, by name. It keeps nothing,
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

  // A row of panels seen from the lane: posts, the panels' glass with the
  // cells' grid in it, the hard white line along the top, and the peppers in
  // the shade under them.
  function row(w, h, seed) {
    var s = svg(w, h), ph = h * 0.34, py = h * 0.12, foot = h;
    for (var x = 0, k = seed; x < w; x += 600, k++) {
      s.appendChild(el('rect', { x: x + 20, y: py, width: 560, height: ph, fill: 'var(--bds-pv)' }));
      for (var cx = x + 20; cx <= x + 580; cx += 70) s.appendChild(el('rect', { x: cx, y: py, width: 3, height: ph, fill: 'var(--bds-cell)' }));
      for (var cy = py; cy <= py + ph; cy += ph / 4) s.appendChild(el('rect', { x: x + 20, y: cy, width: 560, height: 3, fill: 'var(--bds-cell)' }));
      s.appendChild(el('rect', { x: x + 20, y: py, width: 560, height: ph, fill: 'none', stroke: 'var(--bds-frame)', 'stroke-width': 6 }));
      s.appendChild(el('rect', { x: x + 20, y: py - 4, width: 560, height: 8, fill: 'var(--bds-glint)' }));
      [x + 80, x + 520].forEach(function (px) { s.appendChild(el('rect', { x: px, y: py + ph, width: 14, height: foot - py - ph, fill: 'var(--bds-post)' })); });
      // The peppers under the panel.
      for (var p = x + 60; p < x + 560; p += 110) {
        var base = foot, top = foot - 150 - (p * 7 + k * 31) % 50;
        s.appendChild(el('rect', { x: p - 4, y: top + 30, width: 8, height: base - top - 30, fill: 'var(--bds-leaf-dark)' }));
        s.appendChild(el('ellipse', { cx: p, cy: top + 40, rx: 46, ry: 34, fill: 'var(--bds-leaf)' }));
        if ((p + k) % 3) s.appendChild(el('ellipse', { cx: p + 18, cy: top + 70, rx: 8, ry: 20, fill: 'var(--bds-jalapeno)' }));
        else s.appendChild(el('ellipse', { cx: p - 16, cy: top + 62, rx: 7, ry: 10, fill: 'var(--bds-chiltepin)' }));
      }
    }
    return s;
  }

  // The battery shed at the end of the lane, its screen for the page.
  function shed(w, h, gap, ph) {
    var s = svg(w, h), m = w / 2;
    s.appendChild(el('path', { fill: 'var(--bds-frame)', d: 'M0 140 L' + m + ' 0 L' + w + ' 140 Z' }));
    s.appendChild(el('rect', { x: 0, y: 130, width: w, height: 16, fill: 'var(--bds-glint)' }));
    s.appendChild(el('rect', { x: 30, y: 146, width: w - 60, height: h - 146, fill: 'var(--bds-battery)' }));
    s.appendChild(el('rect', { x: m - gap / 2 - 24, y: h - ph - 24, width: gap + 48, height: ph + 24, fill: 'var(--bds-wire)' }));
    return s;
  }

  // A sheep grazing in the lane, between the rows.
  function sheep(w, h) {
    var s = svg(w, h);
    [40, 140].forEach(function (x) { s.appendChild(el('rect', { x: x, y: h - 70, width: 14, height: 70, fill: 'var(--bds-face)' })); });
    [70, 170].forEach(function (x) { s.appendChild(el('rect', { x: x, y: h - 70, width: 14, height: 70, fill: 'var(--bds-face)' })); });
    s.appendChild(el('ellipse', { cx: w / 2 - 20, cy: h - 110, rx: w / 2 - 30, ry: 60, fill: 'var(--bds-fleece)' }));
    s.appendChild(el('ellipse', { cx: w - 40, cy: h - 70, rx: 30, ry: 22, fill: 'var(--bds-face)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['brighter-days.html'] = {
    prefix: 'bds-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 980), sh = kit.H - 24;
      var END = 3400 + F;                       // where the battery shed is
      var eye = sh / 2, SIDE = 560, RH = 760;
      var decor = [];

      var SW = sw + 900, SH = sh + 300;
      decor.push(kit.item(shed(SW, SH, sw, sh), { x: 0, z: END + 30, w: SW, h: SH }));
      var page = kit.screen(kit.page, 'The solar farm’s own page, on the screen in the battery shed');
      var screen = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'bds-walk-screen' });

      var len = END - F * 1.4;
      var rows = [];
      [-1, 1].forEach(function (k, i) {
        var r = kit.item(row(len, RH, i * 3), { x: k * SIDE, z: len / 2, w: len, h: RH, turn: k < 0 ? kit.LEFT : kit.RIGHT });
        decor.push(r); rows.push(r);
      });
      // Rows beyond them, further out on both sides.
      [-1, 1].forEach(function (k) {
        decor.push(kit.item(row(len, RH, 5), { x: k * (SIDE + 900), z: len / 2 + 200, w: len, h: RH, turn: k < 0 ? kit.LEFT : kit.RIGHT }));
      });
      var flock = kit.item(sheep(260, 200), { x: -320, z: 1800, w: 260, h: 200 });
      decor.push(flock);

      var stops = [
        kit.stop({ name: 'at the head of the lane, the sun straight overhead', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'by the peppers in the shade under the panels', spot: kit.front(rows[1], 380) }, rows[1]),
        kit.stop({ name: 'at the battery shed, with the farm’s own page on its screen', spot: { x: 0, z: END - F }, link: page }, screen)
      ];

      return {
        cls: 'bds-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The sun is straight overhead, and the peppers grow in the shade straight under the panels. The farm’s own page is on the screen in the battery shed.',
        bounds: function () { return { x: [-SIDE + 180, SIDE - 180], z: [0, END - F] }; },
        // The soil, and the shade lying straight under every row and under
        // nothing else, because the sun is straight overhead.
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--bds-soil'));
          var shade = kit.ink('--bds-shade'), z1 = Math.min(to, len + 200);
          [-SIDE - 900, -SIDE, SIDE, SIDE + 900].forEach(function (x) {
            kit.quad(g, x - 120, x + 120, Math.max(from, 0), z1, shade, 0.85);
          });
          kit.oval(g, -320, 1800, 120, 40, shade, 0.85);
        }
      };
    }
  };
})();

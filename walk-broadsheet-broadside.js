/* =============================================================================
   The Broadsheet Broadside, walked into on Paper Street. Ryan's call,
   2026-11-04: round one of the rooms you can walk into, the press among them.

   IT IS THE PRESS'S WORLD AND NOBODY ELSE'S (§60): the side of a ship, seen
   from a boat at the waterline, and the sheet is what comes out of it. A
   tarred hull in the Nelson chequer, a yellow band broken by the black squares
   of the gunports, the red inside of every open lid, and out of every port a
   sheet of paper where a gun would be. NO GUN IS DRAWN ANYWHERE ON THIS SHIP
   and nothing is aimed at anybody: a shot across the bow is the one that is
   meant to miss. The biggest port, in the middle of the band, holds the
   press's own page, full size once you row up to it.

   THE LIGHT IS THE SEA'S: the sun is somewhere above and out of the picture,
   and what reaches the hull is the glare thrown back up off the water, which
   is why the only lit marks on that black side are short broken dashes low by
   the waterline, and why the band and the lids are flat colour. No press is
   drawn: it is inside the hull, and the subject is what comes out of a port,
   which is what holds this off the Foundry. Nothing moves. Every colour is one
   §60 declares, by name. It keeps nothing, sends nothing and fetches nothing;
   its page arrives through Paper Street's screen(). tools/make-paper-street.py
   holds each of those.
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

  // The hull: black, the ochre band at the height of the page, gunports along
  // it with their red lids up and a sheet of paper in each, the big port in
  // the middle left open for the page, the masts above and the sea's glare in
  // broken dashes low on the side.
  function hull(w, h, gap, ph, up) {
    var s = svg(w, h), m = w / 2, deck = h - up - ph - 120, band0 = h - up - ph - 40, band1 = h - up + 40;
    // Masts and yards, black on the haze.
    [-0.3, 0, 0.3].forEach(function (k, i) {
      var x = m + k * w * 0.7;
      s.appendChild(el('rect', { x: x - 14, y: 0, width: 28, height: deck, fill: 'var(--bb-hull)' }));
      for (var y = 80 + i * 30; y < deck - 120; y += 240) s.appendChild(el('rect', { x: x - 260 + y * 0.2, y: y, width: 520 - y * 0.4, height: 12, fill: 'var(--bb-hull)' }));
    });
    s.appendChild(el('path', { fill: 'var(--bb-hull)', d: 'M0 ' + deck + ' Q' + m + ' ' + (deck - 60) + ' ' + w + ' ' + deck + ' V' + h + ' H0 Z' }));
    s.appendChild(el('rect', { x: 0, y: band0, width: w, height: band1 - band0, fill: 'var(--bb-ochre)' }));
    var port = 210, gapX = m - gap / 2 - 60, gapR = m + gap / 2 + 60;
    for (var x = 80; x + port < w; x += port * 1.8) {
      if (x + port > gapX && x < gapR) continue;
      var py = band0 + (band1 - band0 - port) / 2;
      s.appendChild(el('rect', { x: x, y: py - port + 10, width: port, height: port - 10, fill: 'var(--bb-lid)' }));
      s.appendChild(el('rect', { x: x, y: py, width: port, height: port, fill: 'var(--bb-hull)' }));
      s.appendChild(el('rect', { x: x + 40, y: py + 30, width: port - 80, height: port - 30, fill: 'var(--bb-paper)' }));
      for (var ly = py + 56; ly < py + port - 20; ly += 22) s.appendChild(el('rect', { x: x + 56, y: ly, width: port - 112, height: 6, fill: 'var(--bb-dim)' }));
    }
    // The big port's lid, hinged up over the page.
    s.appendChild(el('rect', { x: gapX + 20, y: band0 - 200, width: gapR - gapX - 40, height: 160, fill: 'var(--bb-lid)' }));
    // The sea's glare thrown up on the hull, low by the waterline.
    for (var k = 0; k < 90; k++) {
      var gx = (k * 211) % w, gy = h - 20 - (k * 37) % 120;
      s.appendChild(el('rect', { x: gx, y: gy, width: 30 + (k * 13) % 60, height: 5, fill: 'var(--bb-glint)' }));
    }
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['broadsheet-broadside.html'] = {
    prefix: 'bb-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 980), sh = kit.H - 24;
      var END = 3200 + F;                       // where the hull is
      var eye = sh / 2, UP = 160;
      var decor = [];
      var HW = 6000, HH = sh + UP + 1400;

      decor.push(kit.item(hull(HW, HH, sw, sh, UP), { x: 0, z: END + 20, w: HW, h: HH }));
      var page = kit.screen(kit.page, 'The Broadsheet Broadside’s own page, coming out of the biggest port in the hull');
      var sheet = kit.item(page, { x: 0, z: END, y: UP, w: sw, h: sh, cls: 'bb-walk-sheet' });

      var stops = [
        kit.stop({ name: 'in a boat on the water, the ship’s side ahead of you', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'rowing in under the gunports, a sheet of paper in every one', spot: { x: 0, z: (END - F) * 0.55 } }),
        kit.stop({ name: 'under the biggest port, with the press’s own page coming out of it', spot: kit.front(sheet), link: page }, sheet)
      ];

      return {
        cls: 'bb-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Out of every gunport comes a sheet of paper, and no gun anywhere. The press’s own page comes out of the biggest port.',
        bounds: function () { return { x: [-1600, 1600], z: [0, END - F] }; },
        // The sea, and the sun's glare on it in short broken dashes.
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--bb-sea'));
          var glint = kit.ink('--bb-glint');
          for (var z = Math.max(0, Math.ceil(from / 90) * 90); z < Math.min(to, END + 20); z += 90) {
            for (var i = -12; i < 12; i++) {
              var k = Math.round(z / 90) * 31 + i * 17;
              if ((k * 7) % 5) continue;
              var x = i * 300 + (k * 53) % 240;
              kit.quad(g, x, x + 60 + (k % 4) * 30, z, z + 12, glint, 0.5);
            }
          }
        }
      };
    }
  };
})();

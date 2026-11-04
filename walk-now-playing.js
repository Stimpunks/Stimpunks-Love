/* =============================================================================
   Now Playing, walked into on Paper Street. Ryan's ask, 2026-11-04: round one
   of the rest of the rooms, each its own world in card.

   IT IS THE BILL'S WORLD AND NOBODY ELSE'S (§53): one sheet, screenprinted in
   two inks, pasted round a poster column out on the pavement at night, and
   you walk round it. The column is cut as card in panels round its drum, the
   dark painted green, and the bill is pasted round it a panel to a face: the
   face toward the shop windows carries the room's own page, and the faces
   turning away carry the sheet's ornament, the two screens printed over one
   another.

   TWO INKS AND NO BLACK. The red and the cobalt carry no word, and where one
   crosses the other the third colour comes up that nobody mixed; it is drawn
   here as that overprint and not as a third ink. It is ONE sheet, nothing
   pasted over it (that would be Club Chronic) and no photocopy (that would be
   the zine table). The light is the shop windows' from across the pavement,
   so the faces turning away from it go darker. Nothing on it plays here;
   nothing moves at any setting. Every colour is one §53 declares, by name. It
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

  // One screen's band and the other's crossing it: each ink alone where it
  // is alone, and the overprint where they meet.
  function cross(s, a, b) {
    s.appendChild(el('rect', { x: a.x, y: a.y, width: a.w, height: a.h, fill: 'var(--np-red)' }));
    s.appendChild(el('rect', { x: b.x, y: b.y, width: b.w, height: b.h, fill: 'var(--np-cobalt)' }));
    var x0 = Math.max(a.x, b.x), x1 = Math.min(a.x + a.w, b.x + b.w), y0 = Math.max(a.y, b.y), y1 = Math.min(a.y + a.h, b.y + b.h);
    if (x1 > x0 && y1 > y0) s.appendChild(el('rect', { x: x0, y: y0, width: x1 - x0, height: y1 - y0, fill: 'var(--np-both)' }));
  }

  // A face of the column away from the windows: the drum, the sheet pasted on
  // it as stock, and on the sheet the two screens' ornament. `dark` is how far
  // it has turned out of the light.
  function face(w, h, n, dark) {
    var s = svg(w, h), m = 40;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: dark ? 'var(--np-drum)' : 'var(--np-drum-2)' }));
    s.appendChild(el('rect', { x: m, y: m, width: w - 2 * m, height: h - 2 * m, fill: 'var(--np-stock)' }));
    var bands = n % 2 ?
      [[{ x: m + 40, y: m + 60, w: w - 2 * m - 80, h: 40 }, { x: w / 2 - 30, y: m + 30, w: 60, h: h - 2 * m - 60 }],
       [{ x: m + 40, y: h - m - 160, w: w - 2 * m - 80, h: 30 }, { x: m + 60, y: h - m - 200, w: 120, h: 120 }]] :
      [[{ x: m + 30, y: m + 40, w: (w - 2 * m) * 0.6, h: 70 }, { x: m + (w - 2 * m) * 0.4, y: m + 70, w: (w - 2 * m) * 0.5, h: 70 }],
       [{ x: m + 60, y: h / 2, w: w - 2 * m - 120, h: 14 }, { x: m + 60, y: h / 2 + 40, w: w - 2 * m - 120, h: 14 }]];
    bands.forEach(function (b) { cross(s, b[0], b[1]); });
    for (var y = h * 0.66; y < h - m - 30; y += 30) s.appendChild(el('rect', { x: m + 60, y: y, width: (w - 2 * m - 120) * (0.5 + ((y | 0) % 7) / 14), height: 8, fill: 'var(--np-both)' }));
    if (dark) s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--np-night)', 'fill-opacity': '0.35' }));
    return s;
  }

  // The column's cap and its foot: bands of the drum's green.
  function band(w, h, top) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--np-drum)' }));
    s.appendChild(el('rect', { x: 0, y: top ? h - 16 : 0, width: w, height: 16, fill: 'var(--np-drum-2)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['now-playing.html'] = {
    prefix: 'np-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var R = sw / 2 / Math.tan(Math.PI / 8);   // the drum's radius, a face as wide as the page
      var C = 1400 + F + R;                     // the middle of the column
      var eye = sh / 2, FW = sw + 4;
      var decor = [];

      // The faces turning away from the windows, round both sides.
      [-1, 1].forEach(function (side) {
        [1, 2, 3].forEach(function (k) {
          var t = side * k * Math.PI / 4;
          decor.push(kit.item(face(FW, sh, k, k > 1), { x: Math.sin(t) * R, z: C - Math.cos(t) * R, w: FW, h: sh, turn: t }));
          decor.push(kit.item(band(FW, 160, true), { x: Math.sin(t) * R, z: C - Math.cos(t) * R, y: sh, w: FW, h: 160, turn: t }));
        });
      });
      decor.push(kit.item(band(FW, 160, true), { x: 0, z: C - R, y: sh, w: FW, h: 160 }));

      var page = kit.screen(kit.page, 'Now Playing’s own page, the bill on the face toward the windows');
      var bill = kit.item(page, { x: 0, z: C - R, w: sw, h: sh, cls: 'np-walk-bill' });
      var side = decor[2];

      var stops = [
        kit.stop({ name: 'across the pavement, the poster column in front of you in the shop windows’ light', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the column, with the bill on the face toward the windows: the room’s own page', spot: { x: 0, z: C - R - F }, link: page }, bill),
        kit.stop({ name: 'round the side of the column, where the sheet turns away from the light, the two inks crossing', spot: kit.front(side, 1400) })
      ];

      return {
        cls: 'np-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The bill is pasted round the column in front of you; its own page is on the face toward the windows.',
        bounds: function () { return { x: [-R - 1400, R + 1400], z: [0, C + R] }; },
        ground: function (g, near, far) {
          kit.quad(g, -6000, 6000, near, far, kit.ink('--np-night'));
          // The pavement's slabs, and the shop windows' light lying across it
          // from behind you, onto the column's foot.
          var seam = kit.ink('--np-drum');
          for (var x = -3000; x <= 3000; x += 300) kit.quad(g, x - 3, x + 3, Math.max(0, near), far, seam);
          for (var z = Math.max(0, Math.ceil(near / 300) * 300); z < far; z += 300) kit.quad(g, -3000, 3000, z, z + 4, seam);
          var stock = kit.ink('--np-stock');
          [-1800, -600, 600, 1800].forEach(function (wx) { kit.quad(g, wx - 420, wx + 420, Math.max(0, near), C - R, stock, 0.07); });
        }
      };
    }
  };
})();

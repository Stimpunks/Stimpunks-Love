/* =============================================================================
   The Brass Tacks Board, walked into on Paper Street. Ryan's call, 2026-11-04:
   round one of the rooms you can walk into, the board among them.

   IT IS THE BOARD'S WORLD AND NOBODY ELSE'S (§90): for things meant to
   persist, so the wall is old copper gone green and every post is a polished
   brass plate fixed to it with brass tacks. THE LIGHT IS WHAT THE METAL DOES
   WITH IT: the verdigris is matte and reflects nothing, so the walls stay
   dark, and every plate throws back one hard bright line along its top edge,
   its lower edge in shade, so the plates stand off the wall. You walk into an
   alcove lined with plates, and the biggest plate, at the end, holds the
   board's own page, engraved dark on the brass as every word on a plate is,
   full size once you stand at it.

   No glass, no paper, no cork and no lamp: those are the Pebble Board's, its
   neighbour, and this is metal fixed to metal, there for good. Nothing moves.
   Every colour is one §90 declares, by name. It keeps nothing, sends nothing
   and fetches nothing; its page arrives through Paper Street's screen().
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

  // One brass plate: its face, the hard line of light along its top edge, its
  // lower edge in shade, engraved lines, and a tack at each corner.
  function plate(s, x, y, w, h) {
    s.appendChild(el('rect', { x: x, y: y, width: w, height: h, rx: 4, fill: 'var(--btb-brass)' }));
    s.appendChild(el('rect', { x: x, y: y, width: w, height: 7, rx: 3, fill: 'var(--btb-shine)' }));
    s.appendChild(el('rect', { x: x, y: y + h - 12, width: w, height: 12, rx: 3, fill: 'var(--btb-brass2)' }));
    for (var ly = y + 40; ly < y + h - 40; ly += 34) {
      s.appendChild(el('rect', { x: x + 30, y: ly, width: (w - 60) * (ly % 3 ? 0.9 : 0.6), height: 8, fill: 'var(--btb-ink2)' }));
    }
    [[x + 14, y + 20], [x + w - 14, y + 20], [x + 14, y + h - 22], [x + w - 14, y + h - 22]].forEach(function (p) {
      s.appendChild(el('circle', { cx: p[0], cy: p[1], r: 7, fill: 'var(--btb-tack)' }));
    });
  }

  // A wall of verdigris, mottled, with plates fixed to it the same every visit.
  function wall(w, h, plates) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--btb-wall)' }));
    for (var k = 0; k < w / 40; k++) {
      s.appendChild(el('ellipse', { cx: (k * 173) % w, cy: (k * 97) % h, rx: 60 + (k * 31) % 80, ry: 30 + (k * 17) % 50, fill: 'var(--btb-patina)', 'fill-opacity': '0.25' }));
    }
    plates.forEach(function (p) { plate(s, p[0], p[1], p[2], p[3]); });
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['brass-tacks-board.html'] = {
    prefix: 'btb-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 960), sh = kit.H - 24;
      var END = 2400 + F;                       // where the biggest plate is
      var eye = sh / 2, SIDE = 560;
      var decor = [];
      var WH = sh + 520;

      decor.push(kit.item(wall(3400, WH, [[1700 - sw / 2 - 36, WH - sh - 36, sw + 72, sh + 48]]), { x: 0, z: END + 30, w: 3400, h: WH }));
      var page = kit.screen(kit.page, 'The Brass Tacks Board’s own page, on the biggest brass plate');
      var big = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'btb-walk-plate' });
      // The plates down both sides of the alcove, none of them the same size.
      var len = END + 30;
      [-1, 1].forEach(function (k) {
        var ps = [], x = 140, j = k < 0 ? 0 : 3;
        while (x < len - 400) {
          var pw = 300 + (j * 83) % 220, ph = 240 + (j * 61) % 200, py = WH - 140 - ph - (j * 47) % 200;
          ps.push([x, py, pw, ph]);
          x += pw + 90 + (j * 29) % 80; j++;
        }
        decor.push(kit.item(wall(len, WH, ps), { x: k * SIDE, z: len / 2, w: len, h: WH, turn: k < 0 ? kit.LEFT : kit.RIGHT }));
      });

      var stops = [
        kit.stop({ name: 'at the mouth of the alcove, the plates catching the light along their tops', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'between the walls of plates', spot: { x: 0, z: (END - F) * 0.5 } }),
        kit.stop({ name: 'at the biggest plate, with the board’s own page on it', spot: { x: 0, z: END - F }, link: page }, big)
      ];

      return {
        cls: 'btb-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Every post here is a brass plate on green copper. The board’s own page is on the biggest plate, at the end.',
        bounds: function () { return { x: [-SIDE + 220, SIDE - 220], z: [0, END - F] }; },
        // The pavement in front of the board: the wall's own green, matte, with
        // the joints between its flags a shade lighter, and nothing reflected.
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--btb-wall'));
          var joint = kit.ink('--btb-patina'), z0 = Math.max(from, 0), z1 = Math.min(to, END + 30);
          for (var x = -1700; x <= 1700; x += 240) kit.quad(g, x - 3, x + 3, z0, z1, joint);
          for (var z = Math.ceil(z0 / 240) * 240; z < z1; z += 240) kit.quad(g, -1700, 1700, z - 3, z + 3, joint);
        }
      };
    }
  };
})();

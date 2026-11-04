/* =============================================================================
   The Doom Scoop, walked into on Paper Street. Ryan's ask, 2026-11-04: round 1
   of the rooms you can walk into.

   IT IS THE DOOM SCOOP'S WORLD AND NOBODY ELSE'S (§61): an ice cream parlour
   after closing, the shop's own lights off, lit only by the dipping cabinet
   along the back. Its light is ONE COLD TUBE under the lid, whose job is to
   show the flavours without warming them, so it falls straight down into the
   tubs and stops at the glass, and the front of the counter stays dark. A tub
   for every morning of the week, each in its weekday's flavour, and frost
   where the cold meets the room, round the edge of the glass. The chairs are
   up on the tables, because it is after closing. The room's own page stands
   in the middle of the cabinet, in the tube's light, with the week on it.

   THERE IS NO PAPER IN HERE: no newsprint, no masthead, no column rule and no
   blackletter, because newsprint is the Doomscroll's, one door-name away. No
   pink (Pink Pony Club), no amber and no split-flap (The Feed). NOTHING MOVES.
   Every colour is one §61 declares, by name. It keeps nothing, sends nothing
   and fetches nothing; its page arrives through Paper Street's screen().
   tools/make-paper-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  // The week's flavours, Monday first, as the room's own tubs are.
  var WEEK = ['var(--ds-pistachio)', 'var(--ds-lemon)', 'var(--ds-mango)', 'var(--ds-mint)',
              'var(--ds-blueberry)', 'var(--ds-taro)', 'var(--ds-vanilla)'];

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }

  // One half of the dipping cabinet: the tube under the lid, the glass with
  // frost round its edge, and tubs in a row in the well, each scraped further
  // down the older it is.
  function cabinet(w, h, first, n) {
    var s = svg(w, h), well = h * 0.35;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--ds-front)' }));
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: 22, fill: 'var(--ds-steel)' }));
    s.appendChild(el('rect', { x: 10, y: 22, width: w - 20, height: 10, rx: 5, fill: 'var(--ds-tube)' }));
    s.appendChild(el('rect', { x: 10, y: 34, width: w - 20, height: well - 34, fill: 'var(--ds-well)' }));
    var tw = (w - 40) / n;
    for (var i = 0; i < n; i++) {
      var day = first + i, x = 20 + i * tw, full = 1 - day / 7;
      s.appendChild(el('rect', { x: x + 6, y: 60, width: tw - 12, height: well - 70, rx: 10, fill: 'var(--ds-steel)' }));
      s.appendChild(el('rect', { x: x + 12, y: 66 + (well - 82) * (1 - full * 0.85), width: tw - 24, height: (well - 82) * full * 0.85 + 4, rx: 8, fill: WEEK[day % 7] }));
    }
    s.appendChild(el('rect', { x: 10, y: 34, width: w - 20, height: well - 34, fill: 'none', stroke: 'var(--ds-frost)', 'stroke-width': 8 }));
    s.appendChild(el('rect', { x: 18, y: 42, width: w - 36, height: well - 50, fill: 'none', stroke: 'var(--ds-rime)', 'stroke-width': 3 }));
    s.appendChild(el('rect', { x: 0, y: well, width: w, height: 16, fill: 'var(--ds-steel)' }));
    return s;
  }

  // A table with its chairs up on it, because it is after closing.
  function tableUp(w, h) {
    var s = svg(w, h), cx = w / 2, top = h * 0.55;
    s.appendChild(el('ellipse', { cx: cx, cy: top, rx: w * 0.42, ry: 18, fill: 'var(--ds-steel)' }));
    s.appendChild(el('rect', { x: cx - 8, y: top, width: 16, height: h - top - 14, fill: 'var(--ds-steel)' }));
    s.appendChild(el('ellipse', { cx: cx, cy: h - 10, rx: w * 0.2, ry: 10, fill: 'var(--ds-steel)' }));
    [-1, 1].forEach(function (k) {
      var x = cx + k * w * 0.2;
      s.appendChild(el('rect', { x: x - w * 0.12, y: top - 50, width: w * 0.24, height: 14, fill: 'var(--ds-ink-2)' }));
      s.appendChild(el('path', { d: 'M' + (x - w * 0.1) + ' ' + (top - 36) + ' V8 M' + (x + w * 0.1) + ' ' + (top - 36) + ' V8', stroke: 'var(--ds-ink-2)', 'stroke-width': 6 }));
      s.appendChild(el('path', { d: 'M' + (x - w * 0.12) + ' ' + (top - 50) + ' V' + (top - 150) + ' H' + (x + w * 0.12) + ' V' + (top - 50), fill: 'none', stroke: 'var(--ds-ink-2)', 'stroke-width': 8 }));
    });
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['the-doom-scoop.html'] = {
    prefix: 'ds-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 2000 + F;                       // the cabinet along the back
      var eye = sh / 2, decor = [];
      var CW = 820, CH = Math.max(sh + 120, 700);

      decor.push(kit.item(cabinet(CW, CH, 0, 4), { x: -sw / 2 - CW / 2 - 20, z: END + 10, w: CW, h: CH }));
      decor.push(kit.item(cabinet(CW, CH, 4, 3), { x: sw / 2 + CW / 2 + 20, z: END + 10, w: CW, h: CH }));
      var tables = [];
      [[-560, 900], [560, 1200], [-500, 1500]].forEach(function (t) {
        var it = kit.item(tableUp(360, 360), { x: t[0], z: t[1], w: 360, h: 360 });
        decor.push(it); tables.push(it);
      });

      var page = kit.screen(kit.page, 'The Doom Scoop’s own page, in the middle of the dipping cabinet');
      var glass = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'ds-walk-glass' });

      var stops = [
        kit.stop({ name: 'inside the door, the shop’s own lights off', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'among the tables, the chairs up on them for the night', spot: { x: 0, z: 1200 - F * 0.5 } }),
        kit.stop({ name: 'at the dipping cabinet, with the room’s own page in the tube’s light', spot: { x: 0, z: END - F }, link: page }, glass)
      ];

      return {
        cls: 'ds-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is in the middle of the dipping cabinet at the back, in the only light there is.',
        bounds: function () { return { x: [-320, 320], z: [0, END - F] }; },
        ground: function (g, near, far) {
          kit.quad(g, -4000, 4000, near, far, kit.ink('--ds-shop'));
          var line = kit.ink('--ds-well');
          for (var x = -1800; x <= 1800; x += 200) kit.quad(g, x - 3, x + 3, Math.max(0, near), Math.min(far, END + 10), line);
          for (var z = Math.max(0, Math.ceil(near / 200) * 200); z < Math.min(far, END + 10); z += 200) kit.quad(g, -1800, 1800, z, z + 6, line);
          // The tube's light stops at the glass: no pool on the shop floor,
          // only a cold line where the cabinet meets it.
          kit.quad(g, -sw / 2 - CW - 40, sw / 2 + CW + 40, END - 30, END + 10, kit.ink('--ds-rime'), 0.35);
        }
      };
    }
  };
})();

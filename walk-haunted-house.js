/* =============================================================================
   The Haunted House, walked into on Paper Street. Ryan's ask, 2026-11-04:
   round 1 of the rooms left on Paper Street.

   AN EMPTY WAREHOUSE AT THE END OF THE ROAD WITH A HOUSE BUILT INSIDE IT OUT
   OF PLYWOOD FLATS (§132), and on Paper Street the flats are card, which suits
   them. The work lights are left on BEHIND the set, so the only light there is
   comes through it: a hairline in every seam where two flats do not quite
   meet, round the open door and under it, between the boards over the windows
   and in the cracks of the round window in the gable. You never see a lamp.
   Black Leather Lagoon, one bright screen in front of you over black water, is
   the room to watch: there is no lit window and no glowing shape in here, only
   seams, and a seam is never behind a word.

   You stand on the warehouse's concrete in front of the house, its steel
   columns dark round you, the porch steps up to the open door and a pumpkin
   nobody lit. The house's own page stands on a painted board on timber jacks
   by the way in, on the painted dark. Nothing jumps out, nobody is drawn, and
   nobody is the monster.

   NOTHING MOVES, no bulb flickers and nothing makes a sound. Every colour is one
   §132 declares, by name. It keeps nothing, sends nothing and fetches nothing;
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
  function seam(s, x1, y1, x2, y2) {
    s.appendChild(el('line', { x1: x1, y1: y1, x2: x2, y2: y2, stroke: 'var(--hh-seam)', 'stroke-width': 3 }));
  }

  // The house's front, flats of plywood painted dark, the light from behind
  // only in their seams.
  function house(w, h, dw, dh) {
    var s = svg(w, h), eave = h * 0.42, cx = w / 2;
    // The gable and the front, flat by flat.
    s.appendChild(el('path', { fill: 'var(--hh-wall)', d: 'M0 ' + h + ' V' + eave + ' L' + cx + ' ' + (h * 0.04) + ' L' + w + ' ' + eave + ' V' + h + ' Z' }));
    for (var x = 240; x < w; x += 240) {
      var top = x < cx ? eave - (eave - h * 0.04) * x / cx : eave - (eave - h * 0.04) * (w - x) / cx;
      seam(s, x, top + 6, x, h);
    }
    seam(s, 0, eave, w, eave);
    // The trim, painted, and the round window in the gable with its cracks.
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--hh-paint)', 'stroke-width': 18, d: 'M0 ' + eave + ' L' + cx + ' ' + (h * 0.04) + ' L' + w + ' ' + eave }));
    s.appendChild(el('circle', { cx: cx, cy: h * 0.25, r: 70, fill: 'var(--hh-dark)', stroke: 'var(--hh-paint)', 'stroke-width': 12 }));
    seam(s, cx - 40, h * 0.25 - 40, cx + 10, h * 0.25 + 5);
    seam(s, cx + 10, h * 0.25 + 5, cx + 50, h * 0.25 - 20);
    seam(s, cx + 10, h * 0.25 + 5, cx - 6, h * 0.25 + 60);
    // Windows boarded over, light between the boards.
    [w * 0.2, w * 0.8].forEach(function (wx) {
      var ww = 220, wh = 260, wy = eave + 60;
      s.appendChild(el('rect', { x: wx - ww / 2, y: wy, width: ww, height: wh, fill: 'var(--hh-seam)' }));
      for (var b = 0; b < 5; b++) s.appendChild(el('rect', { x: wx - ww / 2 - 20, y: wy + b * 52 + 4, width: ww + 40, height: 46, fill: 'var(--hh-board)' }));
      s.appendChild(el('rect', { x: wx - ww / 2 - 14, y: wy - 14, width: ww + 28, height: wh + 28, fill: 'none', stroke: 'var(--hh-paint)', 'stroke-width': 12 }));
    });
    // The open door: dark inside, the light round its frame and under it.
    var dx = cx - dw / 2, dy = h - dh;
    s.appendChild(el('rect', { x: dx - 6, y: dy - 6, width: dw + 12, height: dh + 6, fill: 'var(--hh-seam)' }));
    s.appendChild(el('rect', { x: dx, y: dy, width: dw, height: dh, fill: 'var(--hh-dark)' }));
    s.appendChild(el('path', { fill: 'var(--hh-door)', d: 'M' + dx + ' ' + dy + ' L' + (dx - dw * 0.4) + ' ' + (dy + 30) + ' V' + (h - 10) + ' L' + dx + ' ' + h + ' Z' }));
    s.appendChild(el('rect', { x: dx - 30, y: dy - 30, width: dw + 60, height: 22, fill: 'var(--hh-paint)' }));
    return s;
  }

  // The porch steps up to the door.
  function steps(w, h) {
    var s = svg(w, h);
    for (var i = 0; i < 3; i++) {
      s.appendChild(el('rect', { x: i * 30, y: h - (3 - i) * (h / 3), width: w - i * 60, height: h / 3, fill: 'var(--hh-step)' }));
      s.appendChild(el('rect', { x: i * 30, y: h - (3 - i) * (h / 3), width: w - i * 60, height: 4, fill: 'var(--hh-paint)' }));
    }
    return s;
  }

  // A pumpkin nobody lit: its face cut, nothing inside it.
  function pumpkin(w, h) {
    var s = svg(w, h), cx = w / 2;
    s.appendChild(el('rect', { x: cx - 8, y: 0, width: 16, height: 26, fill: 'var(--hh-timber)' }));
    s.appendChild(el('ellipse', { cx: cx, cy: h * 0.6, rx: w * 0.48, ry: h * 0.4, fill: 'var(--hh-pumpkin)' }));
    s.appendChild(el('ellipse', { cx: cx, cy: h * 0.6, rx: w * 0.16, ry: h * 0.4, fill: 'none', stroke: 'var(--hh-board)', 'stroke-width': 3 }));
    [cx - w * 0.2, cx + w * 0.2].forEach(function (x) { s.appendChild(el('path', { fill: 'var(--hh-dark)', d: 'M' + (x - 14) + ' ' + h * 0.55 + ' L' + x + ' ' + h * 0.4 + ' L' + (x + 14) + ' ' + h * 0.55 + ' Z' })); });
    s.appendChild(el('path', { fill: 'var(--hh-dark)', d: 'M' + (cx - 40) + ' ' + h * 0.7 + ' Q' + cx + ' ' + h * 0.86 + ' ' + (cx + 40) + ' ' + h * 0.7 + ' Q' + cx + ' ' + h * 0.78 + ' ' + (cx - 40) + ' ' + h * 0.7 + ' Z' }));
    return s;
  }

  // A steel column of the warehouse, dark.
  function column(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--hh-steel)' }));
    s.appendChild(el('rect', { x: w * 0.4, y: 0, width: w * 0.2, height: h, fill: 'var(--hh-dark)' }));
    return s;
  }

  // The painted board on its timber jacks the page stands on.
  function jacks(w, h) {
    var s = svg(w, h);
    [0.12, 0.88].forEach(function (k) {
      s.appendChild(el('path', { fill: 'var(--hh-timber)', d: 'M' + (w * k - 12) + ' 0 H' + (w * k + 12) + ' L' + (w * k + 40) + ' ' + h + ' H' + (w * k - 40) + ' Z' }));
    });
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['haunted-house.html'] = {
    prefix: 'hh-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 900), sh = kit.H - 24;
      var END = 3000;                              // the house's front
      var eye = sh / 2 + 40;
      var HW = 2000, HH = 1150, DW = 280, DH = 480, LIFT = 110;
      var decor = [];

      decor.push(kit.item(house(HW, HH, DW, DH), { x: 0, z: END, y: LIFT, w: HW, h: HH }));
      var porch = kit.item(steps(520, LIFT), { x: 0, z: END - 90, w: 520, h: LIFT });
      decor.push(porch);
      var pump = kit.item(pumpkin(150, 130), { x: 380, z: END - 200, w: 150, h: 130 });
      decor.push(pump);
      [[-1300, 600], [1300, 600], [-1300, 1900], [1300, 1900]].forEach(function (c) {
        decor.push(kit.item(column(70, 2200), { x: c[0], z: c[1], w: 70, h: 2200 }));
      });

      var bz = 1700, bx = -950, bt = 0.75;
      decor.push(kit.item(jacks(sw, 260), { x: bx, z: bz + 30, w: sw, h: 260, turn: bt }));
      var page = kit.screen(kit.page, 'The Haunted House’s own page, on a painted board by the way in');
      var board = kit.item(page, { x: bx, z: bz, y: 140, w: sw, h: sh, turn: bt, cls: 'hh-walk-board' });

      var stops = [
        kit.stop({ name: 'on the warehouse’s concrete, the house built in front of you', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the painted board by the way in, with the house’s own page on it', spot: kit.front(board), link: page }, board),
        kit.stop({ name: 'by a pumpkin nobody lit', spot: kit.front(pump, F * 0.7) }, pump),
        kit.stop({ name: 'at the foot of the porch steps, the door open and the light round it', spot: { x: 0, z: END - F * 0.9 } }, porch)
      ];

      return {
        cls: 'hh-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page stands on a painted board by the way in, on your left.',
        bounds: function () { return { x: [-1100, 1100], z: [0, END - 300] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--hh-floor'));
          // The warehouse slab, in poured squares.
          var joint = kit.ink('--hh-dark');
          for (var x = -2400; x <= 2400; x += 600) kit.quad(g, x - 3, x + 3, Math.max(from, -600), Math.min(to, END + 200), joint);
          for (var z = Math.max(-600, Math.ceil(from / 600) * 600); z < Math.min(to, END + 200); z += 600) kit.quad(g, -2400, 2400, z, z + 6, joint);
          // The light under the door, a hairline on the slab and no more.
          kit.quad(g, -DW / 2, DW / 2, END - 100, END - 94, kit.ink('--hh-seam'), 0.6);
        }
      };
    }
  };
})();

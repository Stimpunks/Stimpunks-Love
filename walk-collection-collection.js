/* =============================================================================
   The Collection Collection, walked into on Paper Street. Ryan's ask,
   2026-11-04: round 1 of the rooms that could not yet be walked into.

   IT IS THE COLLECTION COLLECTION'S WORLD AND NOBODY ELSE'S (§48): a dark
   gallery with NO HOUSE LIGHTS. The cabinets stand apart on the bare floor,
   drawn in the same dim line, and every cabinet brings its own lamp, which its
   owner chose for the thing it lights. Ryan's writing box stands open on a
   little table under a daylight desk lamp on an arm, lit; his perfume
   cupboard stands against the wall with its door ajar and the strip light
   inside the door switched off, because there is nothing in it yet; and three
   cabinets stand with no lamp at all, because the lamp is their owners' to
   choose: a pegboard over a bench, a plant stand in three steps, and a chest
   of shallow drawers with one drawer pulled out. Nothing is drawn in any of
   them: what goes in is their owners' to send, and the photographs are the
   page's. The room's own page stands at the end of the gallery, to read and
   press as itself.

   NO TWO LAMPS ARE ALIKE, and a lamp nobody has chosen is not drawn. If two
   lamps in here are ever alike, this has become the Feed with shelves. There
   is no flame anywhere, and nobody sits in here: the ground between the
   cabinets stays dark.

   NOTHING MOVES AT ANY SETTING. Every colour is one §48 declares, by name. It
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
  function line(s, d) { s.appendChild(el('path', { fill: 'none', stroke: 'var(--cc-line)', 'stroke-width': 5, d: d })); }

  // Ryan's writing box, open on a little table, under the daylight lamp on its
  // arm: the only lit thing in the room, lit from the upper left.
  function writingBox(w, h) {
    var s = svg(w, h), top = h * 0.5;
    s.appendChild(el('circle', { cx: w * 0.5, cy: top - 30, r: w * 0.42, fill: 'var(--cc-daylight)', 'fill-opacity': '0.14' }));
    s.appendChild(el('rect', { x: w * 0.2, y: top, width: w * 0.6, height: 18, fill: 'var(--cc-body)', stroke: 'var(--cc-line)', 'stroke-width': 4 }));
    [0.24, 0.74].forEach(function (k) { s.appendChild(el('rect', { x: w * k, y: top + 18, width: 10, height: h - top - 18, fill: 'var(--cc-line)' })); });
    s.appendChild(el('rect', { x: w * 0.28, y: top - 60, width: w * 0.44, height: 60, fill: 'var(--cc-body)', stroke: 'var(--cc-daylight)', 'stroke-width': 4 }));
    s.appendChild(el('path', { fill: 'var(--cc-body)', stroke: 'var(--cc-daylight)', 'stroke-width': 4,
      d: 'M' + (w * 0.28) + ' ' + (top - 60) + ' L' + (w * 0.32) + ' ' + (top - 150) + ' H' + (w * 0.68) + ' L' + (w * 0.72) + ' ' + (top - 60) + ' Z' }));
    for (var k = 0; k < 5; k++) s.appendChild(el('rect', { x: w * 0.32 + k * w * 0.075, y: top - 50, width: 10, height: 40, rx: 4, fill: 'var(--cc-daylight)' }));
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--cc-line)', 'stroke-width': 8,
      d: 'M' + (w * 0.08) + ' ' + top + ' V' + (top - 60) + ' L' + (w * 0.14) + ' ' + (top - 250) + ' L' + (w * 0.38) + ' ' + (top - 300) }));
    s.appendChild(el('path', { fill: 'var(--cc-body)', stroke: 'var(--cc-line)', 'stroke-width': 4,
      d: 'M' + (w * 0.32) + ' ' + (top - 330) + ' L' + (w * 0.5) + ' ' + (top - 300) + ' L' + (w * 0.42) + ' ' + (top - 262) + ' Z' }));
    s.appendChild(el('path', { fill: 'var(--cc-daylight)', d: 'M' + (w * 0.5) + ' ' + (top - 300) + ' L' + (w * 0.42) + ' ' + (top - 262) + ' L' + (w * 0.46) + ' ' + (top - 270) + ' Z' }));
    return s;
  }

  // The perfume cupboard, door ajar, the strip inside the door switched off.
  function cupboard(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w * 0.7, height: h, fill: 'var(--cc-body)', stroke: 'var(--cc-line)', 'stroke-width': 5 }));
    for (var y = h * 0.2; y < h - 20; y += h * 0.2) line(s, 'M6 ' + y + ' H' + (w * 0.7 - 6));
    s.appendChild(el('path', { fill: 'var(--cc-body)', stroke: 'var(--cc-line)', 'stroke-width': 5,
      d: 'M' + (w * 0.7) + ' 0 L' + w + ' ' + (h * 0.06) + ' V' + (h * 0.94) + ' L' + (w * 0.7) + ' ' + h + ' Z' }));
    s.appendChild(el('rect', { x: w * 0.74, y: h * 0.12, width: 8, height: h * 0.76, fill: 'var(--cc-line)' }));
    return s;
  }

  // Norah and her husband's pegboard over a bench, with no lamp.
  function pegboard(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: w * 0.05, y: 0, width: w * 0.9, height: h * 0.6, fill: 'var(--cc-body)', stroke: 'var(--cc-line)', 'stroke-width': 5 }));
    for (var y = 30; y < h * 0.6 - 10; y += 40) for (var x = w * 0.05 + 30; x < w * 0.95 - 10; x += 40) s.appendChild(el('circle', { cx: x, cy: y, r: 4, fill: 'var(--cc-dark)' }));
    s.appendChild(el('rect', { x: 0, y: h * 0.66, width: w, height: 20, fill: 'var(--cc-body)', stroke: 'var(--cc-line)', 'stroke-width': 4 }));
    [0.06, 0.94].forEach(function (k) { s.appendChild(el('rect', { x: w * k - 6, y: h * 0.66 + 20, width: 12, height: h * 0.34 - 20, fill: 'var(--cc-line)' })); });
    return s;
  }

  // Chelsea's plant stand, three steps, with no lamp.
  function plantStand(w, h) {
    var s = svg(w, h);
    [[0, 0.7], [0.18, 0.4], [0.36, 0.1]].forEach(function (st) {
      s.appendChild(el('rect', { x: w * st[0], y: h * st[1], width: w * (1 - 2 * st[0]), height: 16, fill: 'var(--cc-body)', stroke: 'var(--cc-line)', 'stroke-width': 4 }));
    });
    line(s, 'M10 ' + h + ' L' + (w * 0.4) + ' ' + (h * 0.1) + ' M' + (w - 10) + ' ' + h + ' L' + (w * 0.6) + ' ' + (h * 0.1));
    return s;
  }

  // Helen's chest of shallow drawers, one pulled out, with no lamp.
  function chest(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h - 30, fill: 'var(--cc-body)', stroke: 'var(--cc-line)', 'stroke-width': 5 }));
    for (var y = 40, k = 0; y < h - 40; y += 44, k++) {
      if (k === 2) s.appendChild(el('rect', { x: -20, y: y - 8, width: w + 40, height: 40, fill: 'var(--cc-body)', stroke: 'var(--cc-line)', 'stroke-width': 4 }));
      else line(s, 'M10 ' + (y + 30) + ' H' + (w - 10));
      s.appendChild(el('rect', { x: w / 2 - 24, y: y + 8, width: 48, height: 8, rx: 4, fill: 'var(--cc-brass)' }));
    }
    [0.06, 0.94].forEach(function (k) { s.appendChild(el('rect', { x: w * k - 8, y: h - 30, width: 16, height: 30, fill: 'var(--cc-line)' })); });
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['collection-collection.html'] = {
    prefix: 'cc-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 960), sh = kit.H - 24;
      var END = 3000 + F;                       // where the page stands
      var eye = sh / 2, decor = [];

      var box = kit.item(writingBox(520, 640), { x: -600, z: 1450, w: 520, h: 640, turn: 0.35 });
      decor.push(box);
      var cup = kit.item(cupboard(420, 760), { x: 700, z: 1300, w: 420, h: 760, turn: -0.35 });
      decor.push(cup);
      decor.push(kit.item(pegboard(560, 640), { x: -760, z: 2300, w: 560, h: 640, turn: 0.4 }));
      decor.push(kit.item(plantStand(380, 520), { x: 120, z: 2200, w: 380, h: 520 }));
      decor.push(kit.item(chest(460, 520), { x: 780, z: 2500, w: 460, h: 520, turn: -0.4 }));

      var page = kit.screen(kit.page, 'The Collection Collection’s own page, at the end of the gallery');
      var hung = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'cc-walk-card' });

      var stops = [
        kit.stop({ name: 'inside the door, the gallery dark between the cabinets', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at Ryan’s writing box, under its daylight lamp', spot: kit.front(box, 1100) }, box),
        kit.stop({ name: 'at the perfume cupboard, its strip light off', spot: kit.front(cup, 1100) }, cup),
        kit.stop({ name: 'among the cabinets waiting for their owners’ lamps', spot: { x: 0, z: 1500 } }),
        kit.stop({ name: 'at the end of the gallery, with the room’s own page', spot: { x: 0, z: END - F }, link: page }, hung)
      ];

      return {
        cls: 'cc-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is at the end of the gallery, past the cabinets.',
        bounds: function () { return { x: [-900, 900], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--cc-dark'));
          // The daylight lamp's pool on the floor at the writing box's feet: the
          // only light on the ground, and no other lamp's anywhere.
          kit.oval(g, -600, 1470, 300, 140, kit.ink('--cc-daylight'), 0.12);
        }
      };
    }
  };
})();

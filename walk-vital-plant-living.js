/* =============================================================================
   Vital Plant Living, walked into on Paper Street. Ryan's ask, 2026-11-04:
   round 1 of the rooms you can walk into, down the rest of the street.

   IT IS THE KITCHEN'S WORLD AND NOBODY ELSE'S (§50): a plant-based kitchen
   DRAWN CUT STRAIGHT THROUGH THE MIDDLE, the way a cook sketches a dish to
   show what is in it. So every thing standing in it is a section: the pots on
   the shelf over the counter are cut open, the soil and what grows under it
   showing; the bowl on the island is cut in half, every layer sitting on the
   one under it and the sauce running down into the rice; the wraps beside it
   show their rings. EVERYTHING TOUCHES, AND THAT IS THE ROOM: nothing here
   sits in a well of its own with room round it, which would be Samefood Cafe
   with the lid off. The room's own page is on the back wall, on a panel of
   rice paper with a thick ink edge that sits on what is under it, its shadow
   flat and straight down.

   A SECTION HAS NO LIGHT IN IT: the wall is turmeric, which is a spice and not
   a light, every cut face is at its own colour, and nothing here has a lit
   side or a glow. NO RED IN THE ROOM'S OWN CLOTHES, and nothing here is drawn
   in the one food red: a turmeric wall with green on it and a red accent would
   be wearing the Rastafari colours, on the page that decided not to wear the
   name. Nothing moves and nothing is cooking. Every colour is one §50
   declares, by name. It keeps nothing, sends nothing and fetches nothing; its
   page arrives through Paper Street's screen(). tools/make-paper-street.py
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
  // A drawing made at its own size, stood up at the scene's.
  function sized(s, w, h) { s.setAttribute('width', w); s.setAttribute('height', h); return s; }
  function shape(s, d, fill) {
    s.appendChild(el('path', { d: d, fill: 'var(' + fill + ')', stroke: 'var(--vpl-ink)', 'stroke-width': 5, 'stroke-linejoin': 'round' }));
  }

  // One pot on the shelf, cut open: terracotta walls, the soil inside, and
  // what grows under it showing in the cut. g is what the pot is growing.
  function pot(s, x, base, w, h, g) {
    var top = base - h, lip = 18, inset = w * 0.14;
    shape(s, 'M' + x + ' ' + top + ' H' + (x + w) + ' L' + (x + w - inset) + ' ' + base + ' H' + (x + inset) + ' Z', '--vpl-pot');
    shape(s, 'M' + (x + 16) + ' ' + (top + lip) + ' H' + (x + w - 16) + ' L' + (x + w - inset - 6) + ' ' + (base - 14) + ' H' + (x + inset + 6) + ' Z', '--vpl-soil');
    var cx = x + w / 2;
    if (g === 'carrot') {
      shape(s, 'M' + (cx - 26) + ' ' + (top + lip + 4) + ' H' + (cx + 26) + ' L' + cx + ' ' + (base - 30) + ' Z', '--vpl-f-orange');
      [-30, 0, 30].forEach(function (k) {
        shape(s, 'M' + (cx + k / 3) + ' ' + (top + lip) + ' Q' + (cx + k) + ' ' + (top - 120) + ' ' + (cx + k * 1.6) + ' ' + (top - 190) + ' Q' + (cx + k * 0.6) + ' ' + (top - 90) + ' ' + (cx + k / 3 + 8) + ' ' + (top + lip) + ' Z', '--vpl-f-green');
      });
    } else if (g === 'garlic') {
      [-34, 0, 34].forEach(function (k) {
        s.appendChild(el('ellipse', { cx: cx + k, cy: top + lip + 62, rx: 28, ry: 44, fill: 'var(--vpl-f-paper)', stroke: 'var(--vpl-ink)', 'stroke-width': 5 }));
      });
      shape(s, 'M' + (cx - 8) + ' ' + (top + lip + 20) + ' L' + (cx - 14) + ' ' + (top - 200) + ' L' + (cx + 4) + ' ' + (top - 200) + ' L' + (cx + 8) + ' ' + (top + lip + 20) + ' Z', '--vpl-leaf');
    } else {
      // Scallions: white bulbs in the soil, green tubes straight up out of it.
      [-36, -12, 12, 36].forEach(function (k, i) {
        s.appendChild(el('ellipse', { cx: cx + k, cy: top + lip + 40, rx: 12, ry: 22, fill: 'var(--vpl-f-rice)', stroke: 'var(--vpl-ink)', 'stroke-width': 4 }));
        shape(s, 'M' + (cx + k - 7) + ' ' + (top + lip + 20) + ' V' + (top - 150 - i * 22) + ' H' + (cx + k + 7) + ' V' + (top + lip + 20) + ' Z', i % 2 ? '--vpl-f-green' : '--vpl-leaf');
      });
    }
    // Roots, fine, running down through the soil to the foot of the cut.
    for (var r = -2; r <= 2; r++) {
      s.appendChild(el('path', { d: 'M' + (cx + r * 10) + ' ' + (top + lip + 80) + ' Q' + (cx + r * 26) + ' ' + (base - 60) + ' ' + (cx + r * 18) + ' ' + (base - 22),
        fill: 'none', stroke: 'var(--vpl-f-tan)', 'stroke-width': 4 }));
    }
  }

  // The shelf of pots over the counter, every pot cut open, and the counter
  // under it with its rice-paper top.
  function shelf(w, h) {
    var s = svg(w, h), counter = 380, board = h - counter - 120;
    shape(s, 'M0 ' + (h - counter) + ' H' + w + ' V' + h + ' H0 Z', '--vpl-chip');
    shape(s, 'M-10 ' + (h - counter) + ' H' + (w + 10) + ' V' + (h - counter + 40) + ' H-10 Z', '--vpl-panel');
    shape(s, 'M0 ' + board + ' H' + w + ' V' + (board + 26) + ' H0 Z', '--vpl-panel');
    var kinds = ['scallion', 'garlic', 'carrot', 'garlic', 'scallion', 'carrot'];
    var pw = 210, gap = (w - kinds.length * pw) / (kinds.length + 1);
    kinds.forEach(function (g, i) { pot(s, gap + i * (pw + gap), board, pw, 230, g); });
    return s;
  }

  // The island, and on it the bowl cut in half and the wraps cut through:
  // every layer sitting on the one under it, the sauce running down into the
  // rice, and nothing in a well of its own.
  function island(w, h) {
    var s = svg(w, h), top = h - 380, cx = w * 0.38, r = 280;
    shape(s, 'M0 ' + top + ' H' + w + ' V' + h + ' H0 Z', '--vpl-chip');
    shape(s, 'M-12 ' + top + ' H' + (w + 12) + ' V' + (top + 44) + ' H-12 Z', '--vpl-panel');
    // The bowl, its cut face a half circle standing on the counter.
    var rim = top - r;
    shape(s, 'M' + (cx - r) + ' ' + rim + ' A' + r + ' ' + r + ' 0 0 0 ' + (cx + r) + ' ' + rim + ' Z', '--vpl-bowl');
    var layer = function (y0, y1, fill) {
      // A layer of the bowl between two heights, clipped to the bowl's curve.
      var w0 = Math.sqrt(Math.max(0, r * r - Math.pow(y0 - rim, 2))) - 22;
      var w1 = Math.sqrt(Math.max(0, r * r - Math.pow(y1 - rim, 2))) - 22;
      shape(s, 'M' + (cx - w0) + ' ' + y0 + ' H' + (cx + w0) + ' L' + (cx + w1) + ' ' + y1 + ' H' + (cx - w1) + ' Z', fill);
    };
    layer(rim + 150, rim + 248, '--vpl-f-rice');
    layer(rim + 96, rim + 150, '--vpl-f-bean');
    layer(rim + 44, rim + 96, '--vpl-f-green');
    // The heap on top, over the rim: sweet potato, sprouts, and the sauce.
    shape(s, 'M' + (cx - 230) + ' ' + (rim + 44) + ' Q' + (cx - 120) + ' ' + (rim - 120) + ' ' + cx + ' ' + (rim - 110) + ' Q' + (cx + 150) + ' ' + (rim - 110) + ' ' + (cx + 236) + ' ' + (rim + 44) + ' Z', '--vpl-f-orange');
    shape(s, 'M' + (cx - 150) + ' ' + (rim - 30) + ' Q' + (cx - 40) + ' ' + (rim - 170) + ' ' + (cx + 90) + ' ' + (rim - 60) + ' Q' + (cx + 20) + ' ' + (rim - 90) + ' ' + (cx - 150) + ' ' + (rim - 30) + ' Z', '--vpl-f-sprout');
    // The sauce, running down through the layers and into the rice.
    [-120, 10, 140].forEach(function (k, i) {
      shape(s, 'M' + (cx + k - 14) + ' ' + (rim - 80 + i * 20) + ' H' + (cx + k + 14) + ' V' + (rim + 170 + i * 12) +
        ' Q' + (cx + k) + ' ' + (rim + 200 + i * 12) + ' ' + (cx + k - 14) + ' ' + (rim + 170 + i * 12) + ' Z', '--vpl-f-gold');
    });
    // Two wraps, cut through, lying against the bowl so they touch it.
    [[cx + r + 60, top - 90], [cx + r + 170, top - 80]].forEach(function (p, i) {
      [['--vpl-f-paper', 92], ['--vpl-f-green', 72], ['--vpl-f-tan', 52], ['--vpl-f-orange', 32], ['--vpl-f-rice', 14]].forEach(function (ring) {
        s.appendChild(el('circle', { cx: p[0], cy: p[1] - i * 10, r: ring[1] - i * 6, fill: 'var(' + ring[0] + ')', stroke: 'var(--vpl-ink)', 'stroke-width': 5 }));
      });
    });
    return s;
  }

  // The combo board: every combo a small bowl cut in half, what goes into it
  // piled layer on layer, each touching the one under it, beside its name.
  function board(w, h) {
    var s = svg(w, h);
    shape(s, 'M6 6 H' + (w - 6) + ' V' + (h - 6) + ' H6 Z', '--vpl-panel');
    var rows = [['--vpl-f-rice', '--vpl-f-bean', '--vpl-f-green', '--vpl-f-gold'],
                ['--vpl-f-brown', '--vpl-f-tan', '--vpl-f-orange', '--vpl-f-sprout'],
                ['--vpl-f-rice', '--vpl-f-nori', '--vpl-f-green', '--vpl-f-oil'],
                ['--vpl-f-tan', '--vpl-f-plum', '--vpl-f-green', '--vpl-f-gold']];
    var rh = (h - 60) / 2, cw = (w - 60) / 2;
    rows.forEach(function (row, j) {
      var x0 = 30 + (j % 2) * cw, y0 = 30 + Math.floor(j / 2) * rh;
      var cx = x0 + cw / 2, r = Math.min(cw, rh) * 0.46, rim = y0 + rh * 0.3;
      s.appendChild(el('rect', { x: cx - cw * 0.3, y: y0 + rh * 0.82, width: cw * 0.6, height: 18, rx: 9, fill: 'var(--vpl-ink-2)' }));
      shape(s, 'M' + (cx - r) + ' ' + rim + ' A' + r + ' ' + r + ' 0 0 0 ' + (cx + r) + ' ' + rim + ' Z', '--vpl-bowl');
      var band = r / 4;
      row.forEach(function (f, i) {
        var yb = rim + r - 12 - i * band, yt = yb - band;
        var wb = Math.sqrt(Math.max(0, r * r - Math.pow(yb - rim, 2))) - 12, wt = Math.sqrt(Math.max(0, r * r - Math.pow(Math.max(yt, rim) - rim, 2))) - 12;
        if (i === row.length - 1) {
          shape(s, 'M' + (cx - wb) + ' ' + yb + ' Q' + cx + ' ' + (rim - r * 0.7) + ' ' + (cx + wb) + ' ' + yb + ' Z', f);
        } else {
          shape(s, 'M' + (cx - wb) + ' ' + yb + ' H' + (cx + wb) + ' L' + (cx + wt) + ' ' + yt + ' H' + (cx - wt) + ' Z', f);
        }
      });
    });
    return s;
  }

  // The back wall: turmeric to the ceiling, and the line of ink along its foot.
  function backWall(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--vpl-wall)' }));
    s.appendChild(el('rect', { x: 0, y: h - 8, width: w, height: 8, fill: 'var(--vpl-ink)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['vital-plant-living.html'] = {
    prefix: 'vpl-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 2800 + F;                       // the back wall, where the page is
      var eye = sh / 2, SIDE = 760;
      var decor = [];

      // The drawings are made for an eye at 520 and stood up at this one's.
      var k = eye / 520;
      var put = function (s, w, h, o) {
        o.w = w * k; o.h = h * k; o.y = (o.y || 0) * k;
        return kit.item(sized(s, o.w, o.h), o);
      };
      var wallH = Math.max(1400, sh + 700);
      decor.push(kit.item(backWall(3600, wallH), { x: 0, z: END + 30, w: 3600, h: wallH }));

      var shelfIt = put(shelf(1500, 1100), 1500, 1100, { x: -SIDE, z: 1500, turn: kit.LEFT });
      var islandIt = put(island(900, 820), 900, 820, { x: 300, z: END - F * 1.6 });
      var boardIt = put(board(1000, 760), 1000, 760, { x: SIDE, z: 1300, y: 300, turn: kit.RIGHT });
      decor.push(shelfIt, islandIt, boardIt);

      var page = kit.screen(kit.page, 'Vital Plant Living’s own page, on a panel on the back wall');
      var panel = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'vpl-walk-panel' });

      var stops = [
        kit.stop({ name: 'inside the door, the kitchen drawn cut through the middle in front of you', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the shelf of pots over the counter, every pot cut open to the roots', spot: kit.front(shelfIt, 1400) }, shelfIt),
        kit.stop({ name: 'at the combo board, every combo a small bowl cut in half', spot: kit.front(boardIt, 1400) }, boardIt),
        kit.stop({ name: 'at the island, the bowl cut in half and the sauce running into the rice', spot: kit.front(islandIt) }, islandIt),
        kit.stop({ name: 'at the back wall, with the room’s own page on its rice-paper panel', spot: { x: 0, z: END - F }, link: page }, panel)
      ];

      return {
        cls: 'vpl-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is on the back wall, past the island with the bowl cut in half.',
        bounds: function () { return { x: [-SIDE + 120, SIDE - 120], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--vpl-chip'));
          // Big pale tiles with ink lines between them, as the page outlines
          // everything; and the line of ink where the walls meet the floor.
          var line = kit.ink('--vpl-ink');
          for (var x = -SIDE; x <= SIDE; x += 380) kit.quad(g, x - 2, x + 2, Math.max(from, 0), Math.min(to, END + 30), line, 0.35);
          for (var z = Math.max(0, Math.ceil(from / 380) * 380); z < Math.min(to, END + 30); z += 380) kit.quad(g, -SIDE, SIDE, z - 2, z + 2, line, 0.35);
          kit.quad(g, -SIDE - 6, -SIDE, Math.max(from, 0), Math.min(to, END + 30), line);
          kit.quad(g, SIDE, SIDE + 6, Math.max(from, 0), Math.min(to, END + 30), line);
          // A beetroot runner from the door to the island, the room's link ink.
          kit.quad(g, -110, 110, Math.max(from, 120), Math.min(to, END - F * 1.8), kit.ink('--vpl-beet'), 0.85);
        }
      };
    }
  };
})();

/* =============================================================================
   The Sunshine Sanctuary for Sick Dragons, walked into on Paper Street. Ryan's
   ask, 2026-11-04: subrooms of Widdershins after places in the Discworld
   novels, in the city over the bridge. On both streets it opens off
   Widdershins.

   A WALLED YARD AT NOON UNDER A SUN YOU CAN LOOK AT (§145), cut out of card.
   You come in through the gate, the room's own page on a board of sand just
   inside it, and the yard goes on in front of you: sand underfoot, the brick
   back wall with its low round-topped pens, a bucket of sand and a bucket of
   water at every doorway, chimneys over the wall breathing smoke, and up in
   the smoke the sun, turned down to a pale disc. Small dark green dragons
   stand about on the sand, the ones awake each breathing a little flame, the
   brightest thing in the yard; the ones asleep are curled with a wisp of smoke
   going up.

   THE LIGHT IS THE WHOLE SMOKY SKY, so nothing in the card has a lit side and
   the only shadows are soft ovals round each thing's feet. NOBODY FROM THE
   BOOK IS DRAWN: the dragons are the yard's, small and unnamed, and the lady
   whose sanctuary it is is not here. Nothing moves at any setting. Terry
   Pratchett's world, credited on the room's page; Discworld is a trade mark
   and the page's credits say so. Every colour is one §2 declares for this
   room, by name. It keeps nothing, sends nothing and fetches nothing; its page
   arrives through Paper Street's screen(). tools/make-paper-street.py holds
   each of those.
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
  function hash(i, j, k) {
    var n = Math.imul(i + 57, 374761393) ^ Math.imul(j + 8, 668265263) ^ Math.imul(k + 3, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }
  var SOOT = 'var(--ssd-soot)';

  // A small dragon standing on the sand, side on, its feet at (x, y), facing
  // right (face 1) or left (-1): a round body, four short legs, a folded wing,
  // a curled tail, a long head, and, awake, a little flame. Every point is
  // worked out where it lands, so nothing in it is transformed.
  function drawer(s, x, y, k, face) {
    var kx = k * face;
    function px(v) { return x + kx * v; }
    function py(v) { return y + k * v; }
    return {
      path: function (d, attrs) {
        var out = d.replace(/(-?[\d.]+)\s+(-?[\d.]+)/g, function (m, a, b) { return px(+a).toFixed(1) + ' ' + py(+b).toFixed(1); });
        attrs.d = out; s.appendChild(el('path', attrs));
      },
      oval: function (cx, cy, rx, ry, attrs) {
        attrs.cx = px(cx); attrs.cy = py(cy); attrs.rx = Math.abs(kx * rx); attrs.ry = k * ry;
        s.appendChild(el('ellipse', attrs));
      },
      leg: function (lx, ly, w, h, attrs) {
        attrs.x = Math.min(px(lx), px(lx + w)); attrs.y = py(ly); attrs.width = Math.abs(kx * w); attrs.height = k * h; attrs.rx = 2 * k;
        s.appendChild(el('rect', attrs));
      }
    };
  }
  function dragon(s, x, y, k, face, breathe) {
    var d = drawer(s, x, y, k, face);
    d.oval(0, 4, 46, 8, { fill: 'var(--ssd-shade)' });
    d.path('M-24 -12 C-40 -10 -48 -2 -44 6 C-41 12 -33 11 -33 5', { fill: 'none', stroke: 'var(--ssd-scale)', 'stroke-width': 6 * k, 'stroke-linecap': 'round' });
    [-17, -7, 7, 15].forEach(function (lx) { d.leg(lx, -8, 6, 9, { fill: 'var(--ssd-scale)', stroke: SOOT, 'stroke-width': 1.3 }); });
    d.oval(0, -16, 26, 14, { fill: 'var(--ssd-scale)', stroke: SOOT, 'stroke-width': 1.6 });
    d.path('M-18 -9 C-8 -4 10 -4 20 -10', { fill: 'none', stroke: 'var(--ssd-scale-2)', 'stroke-width': 4 * k, 'stroke-linecap': 'round' });
    d.path('M-10 -26 C-6 -44 12 -46 16 -30 C8 -34 2 -31 -10 -26 Z', { fill: 'var(--ssd-scale-2)', stroke: SOOT, 'stroke-width': 1.4 });
    d.path('M18 -22 C24 -30 28 -34 32 -36', { fill: 'none', stroke: 'var(--ssd-scale)', 'stroke-width': 9 * k, 'stroke-linecap': 'round' });
    d.path('M26 -42 C34 -46 44 -42 48 -36 C46 -32 38 -31 30 -32 C25 -33 23 -39 26 -42 Z', { fill: 'var(--ssd-scale)', stroke: SOOT, 'stroke-width': 1.5 });
    d.oval(34, -39, 1.8, 1.8, { fill: SOOT });
    if (breathe) {
      d.path('M48 -36 C55 -44 65 -41 70 -37 C64 -32 55 -30 48 -36 Z', { fill: 'var(--ssd-flame)', stroke: SOOT, 'stroke-width': 1.1 });
      d.path('M50 -36 C54 -39 58 -38 60 -36 C57 -34 53 -34 50 -36 Z', { fill: 'var(--ssd-flame-2)' });
    }
  }
  function sleeper(s, x, y, k, face) {
    var d = drawer(s, x, y, k, face);
    d.oval(0, 4, 40, 8, { fill: 'var(--ssd-shade)' });
    d.oval(0, -12, 25, 13, { fill: 'var(--ssd-scale)', stroke: SOOT, 'stroke-width': 1.6 });
    d.path('M-14 -22 C-8 -34 8 -34 12 -22 C6 -25 -4 -25 -14 -22 Z', { fill: 'var(--ssd-scale-2)', stroke: SOOT, 'stroke-width': 1.3 });
    d.path('M-24 -8 C-30 2 -10 6 6 4 C14 3 20 0 22 -4', { fill: 'none', stroke: 'var(--ssd-scale)', 'stroke-width': 6 * k, 'stroke-linecap': 'round' });
    d.path('M18 -14 C26 -16 34 -12 34 -7 C32 -3 24 -3 18 -6 Z', { fill: 'var(--ssd-scale)', stroke: SOOT, 'stroke-width': 1.4 });
    d.path('M34 -10 C30 -18 40 -22 36 -30 C32 -38 42 -42 38 -50', { fill: 'none', stroke: 'var(--ssd-murk)', 'stroke-width': 3 * k, 'stroke-linecap': 'round' });
  }

  // The back of the yard: the smoky sky with the sun in it, chimneys over the
  // wall breathing smoke, the brick wall, the pens with their doorways, and
  // the buckets at each doorway.
  function backWall(w, h) {
    var s = svg(w, h), wallTop = h * 0.42, foot = h * 0.86;
    s.appendChild(el('rect', { width: w, height: h, fill: 'var(--ssd-smog)' }));
    s.appendChild(el('rect', { y: h * 0.25, width: w, height: wallTop - h * 0.25, fill: 'var(--ssd-haze)', 'fill-opacity': 0.55 }));
    s.appendChild(el('circle', { cx: w * 0.72, cy: h * 0.14, r: 46, fill: 'var(--ssd-sun)', stroke: 'var(--ssd-flame-2)', 'stroke-width': 2, 'stroke-opacity': 0.7 }));
    [0.08, 0.2, 0.36, 0.52, 0.62, 0.86, 0.95].forEach(function (cx, i) {
      var ch = 60 + hash(i, 1, 1) * 70, cw = 26;
      s.appendChild(el('rect', { x: w * cx - cw / 2, y: wallTop - ch, width: cw, height: ch, fill: 'var(--ssd-murk)' }));
      for (var k = 0; k < 4; k++) s.appendChild(el('circle', { cx: w * cx + 14 * k, cy: wallTop - ch - 14 - 17 * k, r: 9 + 5 * k, fill: 'var(--ssd-murk)', 'fill-opacity': 0.5 }));
    });
    s.appendChild(el('rect', { y: wallTop, width: w, height: foot - wallTop, fill: 'var(--ssd-brick)', stroke: SOOT, 'stroke-width': 2 }));
    s.appendChild(el('rect', { y: wallTop - 9, width: w, height: 11, fill: 'var(--ssd-soot-2)' }));
    for (var yy = wallTop + 14; yy < foot; yy += 14) s.appendChild(el('path', { d: 'M0 ' + yy + ' H' + w, stroke: SOOT, 'stroke-width': 1, 'stroke-opacity': 0.3 }));
    s.appendChild(el('rect', { y: foot, width: w, height: h - foot, fill: 'var(--ssd-sand)' }));
    [0.16, 0.38, 0.6, 0.84].forEach(function (px) {
      var cx = w * px, pw = 170, ph = 96, base = h - 16;
      s.appendChild(el('ellipse', { cx: cx, cy: base + 4, rx: pw * 0.62, ry: 12, fill: 'var(--ssd-shade)' }));
      s.appendChild(el('path', { d: 'M' + (cx - pw / 2) + ' ' + base + ' V' + (base - ph + pw * 0.28) + ' A' + pw / 2 + ' ' + pw * 0.28 + ' 0 0 1 ' + (cx + pw / 2) + ' ' + (base - ph + pw * 0.28) + ' V' + base + ' Z', fill: 'var(--ssd-brick)', stroke: SOOT, 'stroke-width': 2 }));
      s.appendChild(el('path', { d: 'M' + (cx - 30) + ' ' + base + ' V' + (base - 40) + ' A30 30 0 0 1 ' + (cx + 30) + ' ' + (base - 40) + ' V' + base + ' Z', fill: SOOT }));
      s.appendChild(el('path', { d: 'M' + (cx - 36) + ' ' + base + ' q20 -9 40 -3 q24 -7 36 3 Z', fill: 'var(--ssd-straw)', stroke: SOOT, 'stroke-width': 1.2 }));
      [['--ssd-sand', 106], ['--ssd-haze', 140]].forEach(function (b) {
        var bx = cx + b[1] - 20;
        s.appendChild(el('path', { d: 'M' + (bx - 14) + ' ' + (base - 30) + ' L' + (bx - 10) + ' ' + base + ' H' + (bx + 10) + ' L' + (bx + 14) + ' ' + (base - 30) + ' Z', fill: 'var(--ssd-iron)', stroke: SOOT, 'stroke-width': 1.4 }));
        s.appendChild(el('ellipse', { cx: bx, cy: base - 30, rx: 14, ry: 4.5, fill: 'var(' + b[0] + ')', stroke: SOOT, 'stroke-width': 1.2 }));
      });
    });
    dragon(s, w * 0.38, h - 16 - 96 + 6, 1.2, -1, true);
    return s;
  }

  // One dragon, or one asleep, cut out of card to stand on the sand.
  function one(asleep, face) {
    var s = svg(220, 130);
    if (asleep) sleeper(s, 100, 110, 2.2, face); else dragon(s, 90, 110, 1.7, face, true);
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['sunshine-sanctuary.html'] = {
    prefix: 'ssd-walk',
    from: 'widdershins.html',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 820), sh = kit.H - 24;
      var YARD = 3600, eye = sh / 2;
      var decor = [];

      decor.push(kit.item(backWall(4200, 1200), { x: 0, z: YARD, w: 4200, h: 1200 }));
      [[-700, 1400, false, 1], [600, 1900, false, -1], [-300, 2500, true, 1], [900, 2800, true, -1], [150, 1100, false, 1]].forEach(function (d) {
        decor.push(kit.item(one(d[2], d[3]), { x: d[0], z: d[1], w: 440, h: 260 }));
      });

      var page = kit.screen(kit.page, 'The Sunshine Sanctuary’s own page, on a board just inside the gate');
      var board = kit.item(page, { x: -sw / 2 - 360, z: 900, w: sw, h: sh, cls: 'ssd-walk-board' });

      var stops = [
        kit.stop({ name: 'just inside the gate, the yard of sand in front of you and the sun up in the smoke', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the board inside the gate, with the room’s own page on it', spot: { x: board.x, z: 900 - F }, link: page }, board),
        kit.stop({ name: 'among the dragons on the sand, the ones awake each breathing a little flame', spot: { x: 0, z: 1600 } }),
        kit.stop({ name: 'at the pens along the back wall, their doorways open and a bucket of sand and a bucket of water by each', spot: { x: 0, z: YARD - 1300 } })
      ];

      return {
        cls: 'ssd-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The yard is in front of you, the pens along its back wall; its own page is on a board just inside the gate.',
        bounds: function () { return { x: [-1700, 1700], z: [0, YARD - 1200] }; },
        ground: function (g, near, far) {
          kit.quad(g, -8000, 8000, near, far, kit.ink('--ssd-sand'));
          // Ripples in the sand, in the soft colour of its shadows.
          var shade = kit.ink('--ssd-shade');
          for (var i = 0; i < 160; i++) {
            var sx = -2400 + hash(i, 3, 1) * 4800, sz = hash(i, 3, 2) * YARD;
            if (sz < near || sz > far) continue;
            kit.oval(g, sx, sz, 30 + hash(i, 3, 3) * 40, 4 + hash(i, 3, 4) * 3, shade, 0.7);
          }
        }
      };
    }
  };
})();

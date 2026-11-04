/* =============================================================================
   All Together Now Farms, walked into on Paper Street. Ryan's call, 2026-11-04:
   round one of the rooms you can walk into, the farm among them.

   IT IS THE FARM'S WORLD AND NOBODY ELSE'S (§108): mixed farming and
   agroforestry, the Three Sisters, sheep, goats and hens, seen from the gate.
   THE LIGHT IS TWO LIGHTS AT ONCE: the sun going down on the left and the full
   moon coming up on the right, both on the horizon together, so the sky behind
   the stage runs from the sun's apricot to the moon's periwinkle, and every
   thing standing in the field carries a warm edge on its west side and a
   silver one on its east. No other room is lit from two sides by two
   different lights; if the east end of the sky is ever lost, this has become
   Covenstead's window.

   You walk up the lane from the gate, past a Three Sisters mound (corn, beans
   and squash on one hill, the planting only: the story is the Onondaga
   and Oneida nations', whose own pages the farm's page credits), the trees the animals shelter
   under, the sheep, a goat and the hens, to the barn, whose open doorway holds
   the farm's own page, full size once you stand at it.

   Nothing moves. Every colour is one §108 declares, by name. It keeps
   nothing, sends nothing and fetches nothing; its page arrives through Paper
   Street's screen(). tools/make-paper-street.py holds each of those.
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
  // The two lights on a shape: the sun's warm edge down its west side and the
  // moon's silver down its east.
  function lit(s, x, y, w, h) {
    s.appendChild(el('rect', { x: x, y: y, width: 10, height: h, fill: 'var(--atn-rim-warm)' }));
    s.appendChild(el('rect', { x: x + w - 10, y: y, width: 10, height: h, fill: 'var(--atn-rim-cool)' }));
  }

  // The barn at the head of the lane, its doorway open for the page.
  function barn(w, h, dw, dh) {
    var s = svg(w, h), m = w / 2, eave = h * 0.34;
    s.appendChild(el('path', { fill: 'var(--atn-roof)', d: 'M0 ' + eave + ' L' + (m - w * 0.18) + ' 20 H' + (m + w * 0.18) + ' L' + w + ' ' + eave + ' Z' }));
    s.appendChild(el('rect', { x: 40, y: eave, width: w - 80, height: h - eave, fill: 'var(--atn-barn)' }));
    for (var x = 80; x < w - 60; x += 70) s.appendChild(el('rect', { x: x, y: eave, width: 4, height: h - eave, fill: 'var(--atn-barn-door)' }));
    s.appendChild(el('rect', { x: m - dw / 2 - 30, y: h - dh - 30, width: dw + 60, height: dh + 30, fill: 'var(--atn-barn-door)' }));
    lit(s, 40, eave, w - 80, h - eave);
    return s;
  }

  // A Three Sisters hill: corn standing up, beans climbing it, squash
  // sprawling at its foot.
  function sisters(w, h) {
    var s = svg(w, h);
    s.appendChild(el('path', { fill: 'var(--atn-soil)', d: 'M0 ' + h + ' Q' + (w / 2) + ' ' + (h - 120) + ' ' + w + ' ' + h + ' Z' }));
    [0.3, 0.5, 0.7].forEach(function (k, i) {
      var x = w * k, top = 60 + i * 30;
      s.appendChild(el('rect', { x: x - 8, y: top, width: 16, height: h - 80 - top, fill: 'var(--atn-corn-stalk)' }));
      s.appendChild(el('path', { fill: 'var(--atn-corn-stalk)', d: 'M' + x + ' ' + (top + 160) + ' q-110 -10 -150 50 q90 -20 150 -30 z' }));
      s.appendChild(el('path', { fill: 'var(--atn-corn-stalk)', d: 'M' + x + ' ' + (top + 260) + ' q110 -20 150 40 q-90 -20 -150 -20 z' }));
      s.appendChild(el('ellipse', { cx: x + 22, cy: top + 200, rx: 16, ry: 44, fill: 'var(--atn-corn)' }));
      for (var y = top + 90; y < h - 120; y += 70) {
        s.appendChild(el('ellipse', { cx: x + (y % 140 ? 14 : -14), cy: y, rx: 22, ry: 12, fill: 'var(--atn-bean)' }));
      }
    });
    [[0.18, 0], [0.84, 1]].forEach(function (q) {
      var x = w * q[0];
      s.appendChild(el('ellipse', { cx: x, cy: h - 70, rx: 90, ry: 50, fill: 'var(--atn-squash-leaf)' }));
      s.appendChild(el('ellipse', { cx: x + (q[1] ? -30 : 30), cy: h - 40, rx: 44, ry: 30, fill: 'var(--atn-squash)' }));
    });

    return s;
  }

  // A tree of the agroforestry rows, with the two lights on its crown.
  function tree(w, h) {
    var s = svg(w, h), m = w / 2;
    s.appendChild(el('rect', { x: m - 22, y: h * 0.45, width: 44, height: h * 0.55, fill: 'var(--atn-trunk)' }));
    s.appendChild(el('circle', { cx: m, cy: h * 0.32, r: w * 0.42, fill: 'var(--atn-leaf)' }));
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--atn-rim-warm)', 'stroke-width': 12, d: 'M' + (m - w * 0.42) + ' ' + (h * 0.32) + ' A' + (w * 0.42) + ' ' + (w * 0.42) + ' 0 0 1 ' + m + ' ' + (h * 0.32 - w * 0.42) }));
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--atn-rim-cool)', 'stroke-width': 12, d: 'M' + m + ' ' + (h * 0.32 - w * 0.42) + ' A' + (w * 0.42) + ' ' + (w * 0.42) + ' 0 0 1 ' + (m + w * 0.42) + ' ' + (h * 0.32) }));
    return s;
  }

  // The animals by the lane: two sheep, a goat and the hens.
  function animals(w, h) {
    var s = svg(w, h), base = h - 20;
    function legs(x, n, len, fill) { for (var i = 0; i < n; i++) s.appendChild(el('rect', { x: x + i * 34, y: base - len, width: 12, height: len, fill: fill })); }
    [[40, 'var(--atn-fleece)'], [300, 'var(--atn-fleece)']].forEach(function (q) {
      legs(q[0] + 30, 4, 70, 'var(--atn-face)');
      s.appendChild(el('ellipse', { cx: q[0] + 90, cy: base - 120, rx: 100, ry: 64, fill: q[1] }));
      s.appendChild(el('ellipse', { cx: q[0] + 196, cy: base - 150, rx: 32, ry: 24, fill: 'var(--atn-face)' }));
      lit(s, q[0] - 10, base - 180, 220, 120);
    });
    var gx = 600;
    legs(gx + 20, 4, 110, 'var(--atn-goat)');
    s.appendChild(el('rect', { x: gx, y: base - 200, width: 180, height: 96, rx: 40, fill: 'var(--atn-goat)' }));
    s.appendChild(el('path', { fill: 'var(--atn-goat)', d: 'M' + (gx + 160) + ' ' + (base - 190) + ' l40 -80 l40 10 l-20 70 z' }));
    lit(s, gx, base - 200, 180, 96);
    [[880, 'var(--atn-hen)'], [980, 'var(--atn-hen-brown)'], [1070, 'var(--atn-hen)']].forEach(function (q) {
      s.appendChild(el('ellipse', { cx: q[0], cy: base - 40, rx: 40, ry: 30, fill: q[1] }));
      s.appendChild(el('circle', { cx: q[0] + 34, cy: base - 74, r: 16, fill: q[1] }));
      s.appendChild(el('rect', { x: q[0] + 28, y: base - 98, width: 14, height: 10, fill: 'var(--atn-comb)' }));
    });
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['all-together-now.html'] = {
    prefix: 'atn-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 980), sh = kit.H - 24;
      var END = 3400 + F;                       // where the barn's doorway is
      var eye = sh / 2;
      var decor = [];

      var BW = 2600, BH = Math.max(sh + 560, 1100);
      decor.push(kit.item(barn(BW, BH, sw, sh), { x: 0, z: END + 30, w: BW, h: BH }));
      var page = kit.screen(kit.page, 'The farm’s own page, in the barn’s open doorway');
      var door = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'atn-walk-door' });

      var hill = kit.item(sisters(900, 820), { x: -720, z: 1700, w: 900, h: 820 });
      decor.push(hill);
      [[700, 900], [-900, 2300], [820, 2700], [-1500, 1500], [1500, 1800]].forEach(function (t) {
        decor.push(kit.item(tree(520, 900), { x: t[0], z: t[1], w: 520, h: 900 }));
      });
      var flock = kit.item(animals(1180, 300), { x: 980, z: 2100, w: 1180, h: 300 });
      decor.push(flock);

      var stops = [
        kit.stop({ name: 'at the farm gate, the sun going down on your left and the moon coming up on your right', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the Three Sisters: corn, beans and squash on one hill', spot: kit.front(hill, 1300) }, hill),
        kit.stop({ name: 'by the sheep, the goat and the hens', spot: kit.front(flock, 1600) }, flock),
        kit.stop({ name: 'at the barn, with the farm’s own page in its open doorway', spot: { x: 0, z: END - F }, link: page }, door)
      ];

      return {
        cls: 'atn-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The sun is going down on your left and the moon coming up on your right. The farm’s own page is in the barn’s doorway at the head of the lane.',
        bounds: function () { return { x: [-700, 700], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--atn-pasture'));
          // The lane up to the barn, with the two lights along its two edges.
          var z0 = Math.max(from, 0), z1 = Math.min(to, END);
          kit.quad(g, -180, 180, z0, z1, kit.ink('--atn-soil'));
          kit.quad(g, -180, -168, z0, z1, kit.ink('--atn-rim-warm'));
          kit.quad(g, 168, 180, z0, z1, kit.ink('--atn-rim-cool'));
          // Furrows on the far side of the hedge-line, in rows.
          var soil = kit.ink('--atn-soil');
          for (var x = 1100; x < 3000; x += 120) kit.quad(g, x, x + 40, z0, z1, soil, 0.5);
        }
      };
    }
  };
})();

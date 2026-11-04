/* =============================================================================
   The Pile, walked into on Paper Street through its gate in the fence. Ryan's
   ask, 2026-11-04: round 1 of the rooms still to be walked into.

   IT IS THE PILE'S WORLD AND NOBODY ELSE'S (§99): a junk playground on sand in
   plain sun. Pallets and plywood splashed with tempera, an old piano, tyres
   and stumps, rope, buckets and spades, and a den in the middle roofed with
   bubble wrap, every bubble throwing a ring of light on the sand under it.
   THE LIGHT HAS NO COLOUR IN IT, AND ALL THE COLOUR IS PAINT: chalky, matte,
   a little pale and a little dusty, never a glossy primary. Every piece of
   junk is outlined in the ink, and a thing that leans is drawn leaning inside
   its own drawing; nothing here is turned or tilted.

   THE PLAYHOUSE IS THE ONE TO WATCH: indoors, saturated blue under bunting, and
   every toy finished. Nothing on the Pile is finished, nothing is a toy until
   somebody says so, and no bunting goes up. The room's own page is pinned to
   a sheet of plywood at the back of the Pile.

   NOTHING MOVES, at any setting. Every colour is one the room declares, by
   name. It keeps nothing, sends nothing and fetches nothing; its page arrives
   through Paper Street's screen(). tools/make-paper-street.py holds each of
   those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var PAINT = ['--pil-red', '--pil-yellow', '--pil-blue', '--pil-green', '--pil-orange', '--pil-purple', '--pil-pink'];

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }
  var LINE = { stroke: 'var(--pil-ink)', 'stroke-width': 5, 'stroke-linejoin': 'round' };
  function inked(name, attrs) {
    for (var k in LINE) attrs[k] = LINE[k];
    return el(name, attrs);
  }

  // The den: pallets for walls, a plywood board splashed with paint, and a roof
  // of bubble wrap on poles, its bubbles drawn as the rings they are.
  function den(w, h) {
    var s = svg(w, h), roof = 80;
    [40, w - 64].forEach(function (x) { s.appendChild(inked('rect', { x: x, y: roof, width: 24, height: h - roof, fill: 'var(--pil-wood)' })); });
    s.appendChild(inked('path', { d: 'M10 ' + roof + ' Q' + (w / 2) + ' 10 ' + (w - 10) + ' ' + roof + ' Z', fill: 'var(--pil-wrap)' }));
    for (var x = 50; x < w - 40; x += 44) {
      for (var y = roof - 34; y < roof - 4; y += 26) s.appendChild(el('circle', { cx: x + (y % 2) * 22, cy: y, r: 9, fill: 'none', stroke: 'var(--pil-tape)', 'stroke-width': 3 }));
    }
    // Pallet walls: slats on bearers.
    [[64, w * 0.4], [w * 0.6, w - 64]].forEach(function (span) {
      for (var py = h - 240; py < h - 20; py += 44) s.appendChild(inked('rect', { x: span[0], y: py, width: span[1] - span[0], height: 30, fill: 'var(--pil-pallet)' }));
    });
    // A sheet of plywood leaning on one pallet, drawn leaning, splashed.
    s.appendChild(inked('path', { d: 'M' + (w * 0.62) + ' ' + (h - 10) + ' L' + (w * 0.7) + ' ' + (h - 330) + ' L' + (w * 0.92) + ' ' + (h - 330) + ' L' + (w * 0.88) + ' ' + (h - 10) + ' Z', fill: 'var(--pil-ply)' }));
    [['--pil-red', 0.74, 180], ['--pil-blue', 0.82, 260], ['--pil-yellow', 0.77, 90]].forEach(function (p) {
      s.appendChild(el('ellipse', { cx: w * p[1], cy: h - p[2], rx: 34, ry: 22, fill: 'var(' + p[0] + ')' }));
    });
    return s;
  }

  // The old piano, its lid up, a painted stripe across it.
  function piano(w, h) {
    var s = svg(w, h);
    s.appendChild(inked('rect', { x: 10, y: 10, width: w - 20, height: h * 0.55, fill: 'var(--pil-piano)' }));
    s.appendChild(inked('rect', { x: 10, y: h * 0.55, width: w - 20, height: 44, fill: 'var(--pil-keys)' }));
    for (var x = 40; x < w - 30; x += 34) s.appendChild(el('rect', { x: x, y: h * 0.55, width: 16, height: 26, fill: 'var(--pil-ink)' }));
    s.appendChild(inked('rect', { x: 30, y: h * 0.55 + 44, width: w - 60, height: h * 0.45 - 44, fill: 'var(--pil-piano)' }));
    s.appendChild(el('rect', { x: 10, y: h * 0.25, width: w - 20, height: 26, fill: 'var(--pil-pink)' }));
    return s;
  }

  // A stump, a tyre on it, a bucket and spade beside, a coil of rope.
  function heap(w, h) {
    var s = svg(w, h);
    s.appendChild(inked('rect', { x: 30, y: h - 150, width: 160, height: 150, fill: 'var(--pil-bark)' }));
    s.appendChild(inked('ellipse', { cx: 110, cy: h - 150, rx: 80, ry: 22, fill: 'var(--pil-cut)' }));
    s.appendChild(inked('ellipse', { cx: 110, cy: h - 190, rx: 90, ry: 40, fill: 'var(--pil-screen)' }));
    s.appendChild(el('ellipse', { cx: 110, cy: h - 190, rx: 40, ry: 16, fill: 'var(--pil-sand)' }));
    s.appendChild(inked('path', { d: 'M230 ' + (h - 110) + ' h80 l-10 110 h-60 Z', fill: 'var(--pil-orange)' }));
    s.appendChild(inked('rect', { x: 330, y: h - 200, width: 10, height: 190, fill: 'var(--pil-wood)' }));
    s.appendChild(inked('path', { d: 'M318 ' + (h - 20) + ' h34 v20 h-34 Z', fill: 'var(--pil-tin)' }));
    [60, 46, 32].forEach(function (r) { s.appendChild(el('ellipse', { cx: w - 100, cy: h - 40, rx: r, ry: r * 0.45, fill: 'none', stroke: 'var(--pil-rope)', 'stroke-width': 12 })); });
    return s;
  }

  // The sheet of plywood at the back the page is pinned to, splashed round
  // its edges, with a strip of tape on each corner.
  function sheet(w, h, sw, sh) {
    var s = svg(w, h), m = w / 2;
    s.appendChild(inked('rect', { x: 0, y: 0, width: w, height: h - 60, fill: 'var(--pil-ply)' }));
    PAINT.forEach(function (c, i) {
      s.appendChild(el('ellipse', { cx: 40 + (i * 137) % (w - 80), cy: i % 2 ? 40 : h - 110, rx: 46, ry: 26, fill: 'var(' + c + ')' }));
    });
    [m - 180, m + 180].forEach(function (x) { s.appendChild(inked('rect', { x: x - 14, y: h - 70, width: 28, height: 70, fill: 'var(--pil-pallet)' })); });
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['the-pile.html'] = {
    prefix: 'pil-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 940), sh = kit.H - 24;
      var DEN = 1500;                          // the den in the middle of the Pile
      var END = 2900 + F;                      // the plywood the page is pinned to
      var eye = sh / 2 + 140;
      var decor = [];

      var shelter = kit.item(den(900, 620), { x: 0, z: DEN, w: 900, h: 620 });
      decor.push(shelter);
      var keys = kit.item(piano(520, 440), { x: -900, z: 1000, w: 520, h: 440, turn: kit.LEFT / 2 });
      decor.push(keys);
      decor.push(kit.item(heap(560, 320), { x: 860, z: 900, w: 560, h: 320, turn: kit.RIGHT / 2 }));
      decor.push(kit.item(heap(560, 320), { x: -760, z: 2400, w: 560, h: 320 }));
      var SW = sw + 200, SH = sh + 220;
      decor.push(kit.item(sheet(SW, SH, sw, sh), { x: 0, z: END + 20, w: SW, h: SH }));

      var page = kit.screen(kit.page, 'The Pile’s own page, pinned to a sheet of plywood at the back');
      var pinned = kit.item(page, { x: 0, z: END, w: sw, h: sh, y: 140, cls: 'pil-walk-sheet' });

      var stops = [
        kit.stop({ name: 'just inside the gate, on the sand', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the old piano, its lid up', spot: kit.front(keys, 800) }, keys),
        kit.stop({ name: 'under the den’s bubble-wrap roof, its rings of light on the sand', spot: { x: 0, z: DEN - F * 0.9 } }, shelter),
        kit.stop({ name: 'at the back of the Pile, with the room’s own page pinned to the plywood', spot: { x: 0, z: END - F }, link: page }, pinned)
      ];

      return {
        cls: 'pil-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The den is in the middle of the Pile; the room’s own page is pinned to the plywood past it.',
        bounds: function () { return { x: [-900, 900], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--pil-sand'));
          // Dug and raked patches, and paint spilt on the sand.
          kit.oval(g, -500, 700, 300, 160, kit.ink('--pil-sand-2'), 1);
          kit.oval(g, 600, 2200, 360, 200, kit.ink('--pil-sand-2'), 1);
          [['--pil-blue', -200, 900], ['--pil-red', 420, 1200], ['--pil-yellow', -380, 2000], ['--pil-green', 200, 2600]].forEach(function (p) {
            kit.oval(g, p[1], p[2], 70, 40, kit.ink(p[0]), 0.7);
          });
          // The bubble wrap's rings on the sand under the den: plain sun
          // everywhere else.
          var ring = kit.ink('--pil-ring'), sand = kit.ink('--pil-sand');
          for (var i = -4; i <= 4; i++) {
            for (var j = 0; j < 3; j++) {
              var x = i * 90 + (j % 2) * 45, z = DEN - 260 + j * 110;
              kit.oval(g, x, z, 30, 16, ring, 1);
              kit.oval(g, x, z, 20, 10, sand, 1);
            }
          }
        }
      };
    }
  };
})();

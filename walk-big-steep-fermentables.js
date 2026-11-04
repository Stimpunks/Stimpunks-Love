/* =============================================================================
   Big Steep Fermentables, walked into on Paper Street. Ryan's call,
   2026-11-04: round one of the rooms you can walk into, the cellar among them.

   IT IS THE CELLAR'S WORLD AND NOBODY ELSE'S (§66): a brewery and cellar in
   bare rock, level B1 of Arlesglad Caverns, for wine, beer and kombucha.
   THE LIGHT COMES THROUGH THE DRINKS: lamps stand behind the racks against the
   rock, so every vessel on them is lit from behind and the room gets its
   colour from what is in the glass, which throws its own colour on the floor
   in front of the rack. The vessels are glass and steel and there is NO WOOD
   anywhere, and no brick: a row of oak barrels is what would turn this into
   one of the brown rooms. At the far end is the screen in the rock, which
   holds the cellar's own page, full size once you stand at it, and beside
   it a ledge with a house style's two pours standing on it, the
   alcohol-free one first and the same size, because that is the room's rule.

   Nothing moves; no glass fills up. Every colour is one §66 declares, by name.
   It keeps nothing, sends nothing and fetches nothing; its page arrives
   through Paper Street's screen(). tools/make-paper-street.py holds each of
   those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var DRINKS = ['--bs-straw', '--bs-amber', '--bs-garnet', '--bs-hibiscus', '--bs-haze', '--bs-stout'];

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }

  // A rack of steel shelves against the rock, a lamp's glow behind each shelf
  // and the vessels standing in it, coloured by what is in them.
  function rack(w, h, k0) {
    var s = svg(w, h), shelf = 210, k = k0;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--bs-rock)' }));
    for (var y = 60; y + shelf <= h; y += shelf) {
      s.appendChild(el('rect', { x: 20, y: y + 20, width: w - 40, height: shelf - 40, fill: 'var(--bs-cream)', 'fill-opacity': '0.10' }));
      for (var x = 50; x < w - 80; x += 92, k++) {
        var drink = DRINKS[k % DRINKS.length], bottle = k % 3 !== 0;
        if (bottle) {
          s.appendChild(el('rect', { x: x + 14, y: y + 50, width: 50, height: shelf - 72, rx: 10, fill: 'var(' + drink + ')' }));
          s.appendChild(el('rect', { x: x + 30, y: y + 18, width: 18, height: 40, fill: 'var(' + drink + ')' }));
        } else {
          s.appendChild(el('ellipse', { cx: x + 39, cy: y + shelf - 70, rx: 38, ry: 48, fill: 'var(' + drink + ')' }));
          s.appendChild(el('rect', { x: x + 28, y: y + 40, width: 22, height: 50, fill: 'var(' + drink + ')' }));
        }
      }
      s.appendChild(el('rect', { x: 10, y: y + shelf - 20, width: w - 20, height: 12, fill: 'var(--bs-rack)' }));
    }
    s.appendChild(el('rect', { x: 10, y: 50, width: 12, height: h - 50, fill: 'var(--bs-rack)' }));
    s.appendChild(el('rect', { x: w - 22, y: 50, width: 12, height: h - 50, fill: 'var(--bs-rack)' }));
    return s;
  }

  // A steel fermenter on its legs, a sight glass down its side lit by what is
  // in it.
  function tank(w, h, drink) {
    var s = svg(w, h), m = w / 2;
    s.appendChild(el('path', { fill: 'var(--bs-rack)', d: 'M' + (m - w * 0.4) + ' 80 Q' + m + ' 0 ' + (m + w * 0.4) + ' 80 V' + (h - 200) + ' L' + m + ' ' + (h - 120) + ' L' + (m - w * 0.4) + ' ' + (h - 200) + ' Z' }));
    s.appendChild(el('rect', { x: m + w * 0.18, y: 140, width: 18, height: h - 420, fill: 'var(' + drink + ')' }));
    [-0.32, 0.32].forEach(function (k) { s.appendChild(el('rect', { x: m + k * w - 8, y: h - 200, width: 16, height: 200, fill: 'var(--bs-rack)' })); });
    return s;
  }

  // The rock round the screen, and the ledge in front of it with a house
  // style's two pours: the alcohol-free one first, the same glass, the same
  // size.
  function endRock(w, h, gap, ph) {
    var s = svg(w, h), m = w / 2;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--bs-rock)' }));
    s.appendChild(el('rect', { x: m - gap / 2 - 40, y: h - ph - 40, width: gap + 80, height: ph + 40, rx: 30, fill: 'var(--bs-niche)' }));
    return s;
  }
  function ledge(w, h) {
    var s = svg(w, h), m = w / 2;
    s.appendChild(el('rect', { x: 0, y: h - 40, width: w, height: 40, fill: 'var(--bs-rack)' }));
    [m - 70, m + 70].forEach(function (x, k) {
      s.appendChild(el('path', { fill: k ? 'var(--bs-amber)' : 'var(--bs-straw)', d: 'M' + (x - 34) + ' ' + (h - 170) + ' L' + (x + 34) + ' ' + (h - 170) + ' L' + (x + 26) + ' ' + (h - 40) + ' L' + (x - 26) + ' ' + (h - 40) + ' Z' }));
      s.appendChild(el('rect', { x: x - 35, y: h - 186, width: 70, height: 16, rx: 6, fill: 'var(--bs-cream)' }));
    });
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['big-steep-fermentables.html'] = {
    prefix: 'bs-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 980), sh = kit.H - 24;
      var END = 3200 + F;                       // where the screen in the rock is
      var eye = sh / 2, SIDE = 640;
      var decor = [], racks = [];

      decor.push(kit.item(endRock(3600, sh + 600, sw, sh), { x: 0, z: END + 30, w: 3600, h: sh + 600 }));
      var page = kit.screen(kit.page, 'Big Steep’s own page, on the screen in the rock');
      var screen = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'bs-walk-screen' });

      // THE RACKS STAND ALONG BOTH WALLS, FACING ACROSS THE CELLAR, each with
      // its lamps behind it.
      var k = 0;
      for (var z = 500; z < END - F * 1.4; z += 760, k += 5) {
        [-1, 1].forEach(function (side) {
          var r = kit.item(rack(700, 920, k + (side > 0 ? 2 : 0)), { x: side * SIDE, z: z + 350, w: 700, h: 920, turn: side < 0 ? kit.LEFT : kit.RIGHT });
          decor.push(r); racks.push(r);
        });
      }
      decor.push(kit.item(tank(320, 980, '--bs-straw'), { x: -sw / 2 - 260, z: END - 260, w: 320, h: 980 }));
      var pours = kit.item(ledge(440, 240), { x: sw / 2 + 300, z: END - 200, w: 440, h: 240 });
      decor.push(pours);

      var stops = [
        kit.stop({ name: 'at the foot of the steps, in the rock', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'between the racks, every vessel lit from behind by what is in it', spot: { x: 0, z: (END - F) * 0.45 } }),
        kit.stop({ name: 'at the screen in the rock, with the cellar’s own page on it and two pours on the ledge beside it', spot: { x: 0, z: END - F }, link: page }, screen)
      ];

      return {
        cls: 'bs-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Every vessel on the racks is lit from behind by what is in it. Big Steep’s own page is on the screen in the rock at the far end.',
        bounds: function () { return { x: [-SIDE + 260, SIDE - 260], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--bs-rock'));
          // The rock floor, and the drinks' own colours thrown onto it in
          // front of the racks by the lamps behind them.
          racks.forEach(function (r, i) {
            var x = r.x - Math.sign(r.x) * 160;
            for (var j = 0; j < 3; j++) kit.oval(g, x, r.z - 220 + j * 220, 90, 70, kit.ink(DRINKS[(i + j) % DRINKS.length]), 0.12);
          });
          kit.quad(g, -sw / 2 - 40, sw / 2 + 40, END - 400, END, kit.ink('--bs-niche'));
        }
      };
    }
  };
})();

/* =============================================================================
   Gentle Help Cannabis Farm, walked into on Paper Street. Ryan's ask,
   2026-11-04: round 1 of the rooms left on Paper Street.

   IT IS THE ROOM'S OWN WORLD (§107): down the middle path of a hoop house in
   the afternoon, cut out of card. THE LIGHT COMES THROUGH THE HOUSE'S OWN SKIN:
   the whole arch of milky plastic glows at once, so the skin is the backdrop
   itself, unlit by anything because it is what gives the light, and everything
   under it is lit evenly from above and both sides, with only a soft shadow
   on the floor under each plant and no hard one anywhere. Hoops arch over the
   path, closer together towards the lit doorway at the far end, where the
   room's own page stands. In the beds both sides, cannabis in flower, its
   colas with their orange hairs and their frost, some of them purple, and
   along the beds' edges the companions the page names: basil, dill and
   marigolds.

   THE COLLISIONS ARE §107's: Learning Large is this room turned inside out,
   night and red and blue lamps and no green; here it is day, no lamp, and
   nothing but green and flowers. If a lamp is ever hung in here, the two have
   met. Every word is the page's; this file says nothing about what the plant
   does for anybody, and nothing here is for sale.

   NOTHING MOVES, at any setting. Every colour is one §107 declares, by name. It
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

  // One hoop over the path: a rib of the frame, and nothing else, so the skin
  // shows through it.
  function hoop(w, h) {
    var s = svg(w, h);
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--ghc-rib)', 'stroke-width': 14,
      d: 'M7 ' + h + ' V' + (h - w * 0.5 + 40) + ' A' + (w / 2 - 7) + ' ' + (w / 2 - 7) + ' 0 0 1 ' + (w - 7) + ' ' + (h - w * 0.5 + 40) + ' V' + h }));
    return s;
  }

  // A cannabis plant in flower: a stem, fan leaves, and colas with their
  // orange hairs and frost. Some flower purple.
  function plant(s, x, base, tall, purple) {
    var bud = purple ? 'var(--ghc-bud-purple)' : 'var(--ghc-bud)';
    s.appendChild(el('rect', { x: x - 4, y: base - tall, width: 8, height: tall, fill: 'var(--ghc-stem)' }));
    for (var k = 0; k < 3; k++) {
      var y = base - tall * (0.3 + k * 0.22), spread = 60 - k * 12;
      [-1, 1].forEach(function (side) {
        for (var f = -2; f <= 2; f++) {
          var ang = side * (0.7 + f * 0.28), lx = x + Math.sin(ang) * spread, ly = y - Math.cos(ang) * spread * 0.7;
          s.appendChild(el('path', { fill: f % 2 ? 'var(--ghc-leaf-light)' : 'var(--ghc-leaf)',
            d: 'M' + x + ' ' + y + ' Q' + ((x + lx) / 2 + 8) + ' ' + ((y + ly) / 2 - 8) + ' ' + lx + ' ' + ly + ' Q' + ((x + lx) / 2 - 8) + ' ' + ((y + ly) / 2 + 8) + ' ' + x + ' ' + y + ' Z' }));
        }
      });
    }
    [0, 0.25, 0.5].forEach(function (k) {
      var cy = base - tall * (1 - k * 0.6), cx = x + (k ? (k > 0.3 ? 30 : -30) : 0);
      s.appendChild(el('ellipse', { cx: cx, cy: cy, rx: 13, ry: 30, fill: bud }));
      for (var i = 0; i < 4; i++) s.appendChild(el('path', { fill: 'none', stroke: 'var(--ghc-pistil)', 'stroke-width': 2, d: 'M' + (cx - 8 + i * 5) + ' ' + (cy - 10 + i * 6) + ' q6 -4 10 -12' }));
      s.appendChild(el('circle', { cx: cx + 4, cy: cy - 12, r: 2.5, fill: 'var(--ghc-trichome)' }));
      s.appendChild(el('circle', { cx: cx - 5, cy: cy + 6, r: 2.5, fill: 'var(--ghc-trichome)' }));
    });
  }

  // A run of a bed: plants in flower, and the companions along its edge.
  function bed(w, h, seed) {
    var s = svg(w, h), base = h - 60;
    for (var x = 70, n = seed; x < w - 40; x += 150, n++) plant(s, x, base, h * 0.62 + (n * 37) % 60, n % 4 === 2);
    for (var c = 30, m = seed; c < w; c += 70, m++) {
      var kind = m % 3, y = h - 40;
      if (kind === 0) {               // basil
        s.appendChild(el('ellipse', { cx: c, cy: y, rx: 22, ry: 16, fill: 'var(--ghc-basil)' }));
      } else if (kind === 1) {        // dill: fine stalks and a flat yellow head
        s.appendChild(el('rect', { x: c - 2, y: y - 60, width: 4, height: 60, fill: 'var(--ghc-stem)' }));
        s.appendChild(el('ellipse', { cx: c, cy: y - 64, rx: 22, ry: 6, fill: 'var(--ghc-dill)' }));
      } else {                        // marigold
        s.appendChild(el('rect', { x: c - 3, y: y - 24, width: 6, height: 24, fill: 'var(--ghc-stem)' }));
        s.appendChild(el('circle', { cx: c, cy: y - 28, r: 13, fill: 'var(--ghc-marigold)' }));
      }
    }
    return s;
  }

  // The far end: the house's skin, and the lit doorway to the potting shed.
  function doorway(w, h, dw, dh) {
    var s = svg(w, h), dx = (w - dw) / 2;
    s.appendChild(el('path', { fill: 'var(--ghc-skin)', stroke: 'var(--ghc-rib)', 'stroke-width': 14,
      d: 'M7 ' + h + ' V' + (h - w * 0.5 + 40) + ' A' + (w / 2 - 7) + ' ' + (w / 2 - 7) + ' 0 0 1 ' + (w - 7) + ' ' + (h - w * 0.5 + 40) + ' V' + h + ' Z' }));
    s.appendChild(el('rect', { x: dx - 24, y: h - dh - 24, width: dw + 48, height: dh + 24, fill: 'var(--ghc-door)', stroke: 'var(--ghc-rib)', 'stroke-width': 8 }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['gentle-help.html'] = {
    prefix: 'ghc-walk',
    from: 'natures-contribution.html',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 900), sh = kit.H - 24;
      var END = 3000 + F;                          // the doorway at the far end
      var eye = sh / 2;
      var HW = 1500;                               // the hoop house's width
      var decor = [];

      // The hoops, closer together towards the far end.
      for (var z = 400, step = 520; z < END - 100; z += step, step = Math.max(240, step * 0.86)) {
        decor.push(kit.item(hoop(HW * 2, HW * 1.15), { x: 0, z: z, w: HW * 2, h: HW * 1.15, near: 0.3 }));
      }
      decor.push(kit.item(doorway(HW * 2, HW * 1.15, sw, sh), { x: 0, z: END + 20, w: HW * 2, h: HW * 1.15 }));
      // The beds either side of the path, run after run, facing you.
      var beds = [];
      for (var bz = 600, i = 0; bz < END - 400; bz += 480, i++) {
        [-1, 1].forEach(function (side) {
          var b = kit.item(bed(820, 520, i * 3 + (side < 0 ? 0 : 1)), { x: side * 640, z: bz, w: 820, h: 520 });
          decor.push(b); beds.push(b);
        });
      }

      var page = kit.screen(kit.page, 'Gentle Help Cannabis Farm’s own page, in the lit doorway at the far end');
      var leaf = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'ghc-walk-door' });

      var stops = [
        kit.stop({ name: 'at the near end of the hoop house, the whole skin glowing over you', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'among the beds, cannabis in flower with basil, dill and marigolds along the edge', spot: kit.front(beds[2], F * 0.9) }, beds[2]),
        kit.stop({ name: 'halfway down the middle path, under the hoops', spot: { x: 0, z: (END - F) * 0.55 } }),
        kit.stop({ name: 'at the lit doorway at the far end, with the farm’s own page in it', spot: { x: 0, z: END - F }, link: page }, leaf)
      ];

      return {
        cls: 'ghc-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page stands in the lit doorway at the far end of the path.',
        bounds: function () { return { x: [-160, 160], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--ghc-skin'));
          kit.quad(g, -HW, HW, Math.max(from, -200), Math.min(to, END + 20), kit.ink('--ghc-floor'));
          kit.quad(g, -200, 200, Math.max(from, -200), Math.min(to, END + 20), kit.ink('--ghc-path'));
          // A soft shadow under every run of plants, and no hard one anywhere.
          beds.forEach(function (b) { kit.oval(g, b.x, b.z - 10, 420, 70, kit.ink('--ghc-shadow'), 0.9); });
        }
      };
    }
  };
})();

/* =============================================================================
   The Lightbulb Picture House, walked into on Paper Street. Ryan's ask,
   2026-11-04: round one of the rest of the rooms, each its own world in card.

   IT IS THE PICTURE HOUSE'S WORLD AND NOBODY ELSE'S (§42): a picture house
   where every screening is a relaxed screening, so THE HOUSE LIGHTS STAY UP.
   Bare bulbs in brass sconces light both velvet walls all the way down, the
   seats are a colour rather than a silhouette, and there is no beam, because a
   beam only shows in the dark. Rows of velvet seats either side of the aisle
   face the screen, the palest thing in the room and not the only lit one, and
   on the screen is the room's own page, under the gold infinity.

   NOTHING IN HERE IS BLUE, not a bulb, not a shadow; the ornament is the gold
   infinity and never the rainbow one. No bulb flickers, dims or chases, at any
   setting, and nothing moves. Every colour is one §42 declares, by name. It
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

  // A velvet wall with its folds, and a brass sconce every so often, each with
  // its bare bulbs lit and the wall lit warm round them. Nothing chases.
  function wall(w, h, every) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--lph-velvet)' }));
    for (var x = 30; x < w; x += 90) s.appendChild(el('rect', { x: x, y: 0, width: 26, height: h, fill: 'var(--lph-fold)', 'fill-opacity': '0.55' }));
    s.appendChild(el('rect', { x: 0, y: h - 90, width: w, height: 90, fill: 'var(--lph-deep)' }));
    s.appendChild(el('rect', { x: 0, y: h - 96, width: w, height: 8, fill: 'var(--lph-brass)' }));
    for (x = every / 2; x < w; x += every) {
      var cy = h * 0.42;
      s.appendChild(el('circle', { cx: x, cy: cy, r: 120, fill: 'var(--lph-bulb)', 'fill-opacity': '0.16' }));
      s.appendChild(el('path', { d: 'M' + (x - 50) + ' ' + (cy + 40) + ' Q' + x + ' ' + (cy + 90) + ' ' + (x + 50) + ' ' + (cy + 40) + ' Z', fill: 'var(--lph-brass)' }));
      s.appendChild(el('rect', { x: x - 6, y: cy + 40, width: 12, height: 60, fill: 'var(--lph-brass)' }));
      [-30, 0, 30].forEach(function (dx) {
        s.appendChild(el('rect', { x: x + dx - 3, y: cy + 4, width: 6, height: 34, fill: 'var(--lph-brass)' }));
        s.appendChild(el('circle', { cx: x + dx, cy: cy - 6, r: 13, fill: 'var(--lph-bulb)' }));
      });
    }
    return s;
  }

  // A row of seats from behind: velvet backs with a crease down each, brass
  // numbers' plates along the end, arms between.
  function seats(w, h) {
    var s = svg(w, h), sw = 110;
    for (var x = 4; x + sw <= w; x += sw + 10) {
      s.appendChild(el('rect', { x: x, y: 0, width: sw, height: h * 0.78, rx: 22, fill: 'var(--lph-velvet)', stroke: 'var(--lph-deep)', 'stroke-width': 4 }));
      s.appendChild(el('rect', { x: x + sw / 2 - 4, y: 14, width: 8, height: h * 0.6, fill: 'var(--lph-fold)' }));
      s.appendChild(el('rect', { x: x + sw / 2 - 16, y: h * 0.78 - 18, width: 32, height: 10, fill: 'var(--lph-brass)' }));
    }
    s.appendChild(el('rect', { x: 0, y: h * 0.78, width: w, height: h * 0.22, fill: 'var(--lph-deep)' }));
    return s;
  }

  // The wall the screen hangs on: velvet, the proscenium in brass, and over it
  // the gold infinity.
  function screenWall(w, h, gap, gh) {
    var s = svg(w, h), m = w / 2;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--lph-deep)' }));
    for (var x = 20; x < w; x += 90) s.appendChild(el('rect', { x: x, y: 0, width: 26, height: h, fill: 'var(--lph-velvet)' }));
    var top = h - gh - 70;
    s.appendChild(el('rect', { x: m - gap / 2 - 40, y: top - 30, width: gap + 80, height: gh + 60, fill: 'none', stroke: 'var(--lph-brass)', 'stroke-width': 14 }));
    var iy = top - 110, r = 34;
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--lph-gold)', 'stroke-width': 12, 'stroke-linecap': 'round',
      d: 'M' + m + ' ' + iy + ' C' + (m + r) + ' ' + (iy - r * 1.4) + ' ' + (m + r * 3) + ' ' + (iy - r * 1.4) + ' ' + (m + r * 3) + ' ' + iy +
         ' S' + (m + r) + ' ' + (iy + r * 1.4) + ' ' + m + ' ' + iy +
         ' C' + (m - r) + ' ' + (iy - r * 1.4) + ' ' + (m - r * 3) + ' ' + (iy - r * 1.4) + ' ' + (m - r * 3) + ' ' + iy +
         ' S' + (m - r) + ' ' + (iy + r * 1.4) + ' ' + m + ' ' + iy }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['lightbulb-picture-house.html'] = {
    prefix: 'lph-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 3000 + F;                       // the screen
      var SIDE = 920, AISLE = 170, eye = sh / 2, WH = sh + 420;
      var decor = [];

      [-1, 1].forEach(function (side) {
        decor.push(kit.item(wall(END + 300, WH, 520), { x: side * SIDE, z: (END + 300) / 2, w: END + 300, h: WH,
          turn: side < 0 ? kit.LEFT : kit.RIGHT }));
      });
      decor.push(kit.item(screenWall(SIDE * 2 + 200, WH, sw, sh), { x: 0, z: END + 40, w: SIDE * 2 + 200, h: WH }));
      // The rows, either side of the aisle, all the way to the front.
      for (var z = 900; z < END - F - 100; z += 300) {
        [-1, 1].forEach(function (side) {
          var rw = SIDE - AISLE - 40;
          decor.push(kit.item(seats(rw, 170), { x: side * (AISLE + rw / 2), z: z, w: rw, h: 170 }));
        });
      }

      var page = kit.screen(kit.page, 'The Lightbulb Picture House’s own page, on the screen');
      var screen = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'lph-walk-screen' });

      var stops = [
        kit.stop({ name: 'at the back of the house, with the house lights up', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'halfway down the aisle, between the rows', spot: { x: 0, z: 1600 } }),
        kit.stop({ name: 'at the wall, under a sconce of bare bulbs, lit and still', spot: { x: -SIDE + 380, z: 1300, yaw: -kit.LEFT } }),
        kit.stop({ name: 'at the screen, with the room’s own page on it under the gold infinity', spot: { x: 0, z: END - F }, link: page }, screen)
      ];

      return {
        cls: 'lph-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The house lights stay up; its own page is on the screen at the front.',
        bounds: function () { return { x: [-SIDE + 300, SIDE - 300], z: [0, END - F] }; },
        ground: function (g, near, far) {
          kit.quad(g, -4000, 4000, near, far, kit.ink('--lph-deep'));
          // The aisle's runner, and the light from the walls lying on the
          // carpet the whole way down, warm and even.
          kit.quad(g, -AISLE + 20, AISLE - 20, 0, END - 200, kit.ink('--lph-velvet'));
          kit.quad(g, -AISLE + 20, -AISLE + 30, 0, END - 200, kit.ink('--lph-gold'), 0.6);
          kit.quad(g, AISLE - 30, AISLE - 20, 0, END - 200, kit.ink('--lph-gold'), 0.6);
          var bulb = kit.ink('--lph-bulb');
          for (var z = 260; z < END; z += 520) {
            kit.oval(g, -SIDE + 80, z, 160, 240, bulb, 0.1);
            kit.oval(g, SIDE - 80, z, 160, 240, bulb, 0.1);
          }
        }
      };
    }
  };
})();

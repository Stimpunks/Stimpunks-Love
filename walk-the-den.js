/* =============================================================================
   The Den, walked into on Paper Street, the room behind the Jungle Room.
   Ryan's ask, 2026-11-04: round 1 of the rooms you can walk into.

   IT IS THE DEN'S WORLD AND SHARES NOTHING WITH THE ROOM UPSTAIRS BUT THE NAME
   AND THE GREEN (§18). Up there the green is the darkness, a forest under a
   roof of leaves with the light coming down through it. Down here the room is
   BROWN: panelled walls with their grooves, a low ceiling, no daylight
   anywhere, jade lamps standing at knee height, and the green laid on the
   floor, a shag carpet that is the brightest thing in the room. It is low,
   closed and rectangular, full of carved furniture with the corners notched
   out of it: the sofa with fur thrown over it, and the frame round the room's
   own page. On the north wall is the waterfall of cut fieldstone with a jade
   lamp either side of it. Nobody is drawn.

   NOTHING MOVES: the waterfall's water stands still here, at every setting,
   and nothing plays: every cut on the page says how long it runs before the
   press. Every colour is one §18 declares, by name. It keeps nothing, sends
   nothing and fetches nothing; its page arrives through Paper Street's
   screen(). tools/make-paper-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';

  function seeded(n) {
    return function () {
      n = (n + 0x6D2B79F5) | 0;
      var t = Math.imul(n ^ (n >>> 15), 1 | n);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }
  // A carved frame with its corners notched out, the Den's one shape.
  function notched(x, y, w, h, n) {
    return 'M' + (x + n) + ' ' + y + ' H' + (x + w - n) + ' V' + (y + n) + ' H' + (x + w) + ' V' + (y + h - n) + ' H' + (x + w - n) +
      ' V' + (y + h) + ' H' + (x + n) + ' V' + (y + h - n) + ' H' + x + ' V' + (y + n) + ' H' + (x + n) + ' Z';
  }

  // Panelling: dark boards with their grooves, a carved rail, a low ceiling.
  function panelling(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--panel)' }));
    for (var x = 0; x < w; x += 110) s.appendChild(el('rect', { x: x, y: 0, width: 6, height: h, fill: 'var(--cocoa)' }));
    s.appendChild(el('rect', { x: 0, y: h * 0.62, width: w, height: 18, fill: 'var(--teak)' }));
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: 40, fill: 'var(--cocoa-2)' }));
    return s;
  }

  // The fieldstone waterfall on the north wall, water still down its face.
  function waterfall(r, w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--cocoa-2)' }));
    for (var y = 0; y < h; y += 50) {
      for (var x = (y / 50) % 2 ? -40 : 0; x < w; x += 90 + r() * 30) {
        s.appendChild(el('rect', { x: x + 4, y: y + 4, width: 82 + r() * 20, height: 42, rx: 14, fill: 'var(--stone)' }));
      }
    }
    s.appendChild(el('path', { d: 'M' + (w * 0.4) + ' 0 H' + (w * 0.6) + ' L' + (w * 0.66) + ' ' + h + ' H' + (w * 0.34) + ' Z', fill: 'var(--coconut)', opacity: '0.45' }));
    for (x = w * 0.42; x < w * 0.6; x += 16) s.appendChild(el('rect', { x: x, y: 0, width: 3, height: h, fill: 'var(--coconut)', opacity: '0.6' }));
    return s;
  }

  // A jade lamp at knee height, on a carved base.
  function lamp(w, h) {
    var s = svg(w, h), cx = w / 2;
    s.appendChild(el('ellipse', { cx: cx, cy: h * 0.32, rx: w * 0.42, ry: h * 0.28, fill: 'var(--jade)' }));
    s.appendChild(el('rect', { x: cx - 10, y: h * 0.58, width: 20, height: h * 0.2, fill: 'var(--tiki)' }));
    s.appendChild(el('path', { d: notched(cx - w * 0.3, h * 0.78, w * 0.6, h * 0.22, 10), fill: 'var(--teak)' }));
    return s;
  }

  // The carved sofa with the fur thrown over it.
  function sofa(w, h) {
    var s = svg(w, h);
    s.appendChild(el('path', { d: notched(0, 0, w, h * 0.7, 26), fill: 'var(--teak)' }));
    s.appendChild(el('rect', { x: 30, y: h * 0.18, width: w - 60, height: h * 0.4, fill: 'var(--rattan)' }));
    s.appendChild(el('path', { d: notched(10, h * 0.5, w - 20, h * 0.3, 16), fill: 'var(--rattan)' }));
    s.appendChild(el('path', { d: 'M' + (w * 0.25) + ' ' + (h * 0.14) + ' Q' + (w * 0.45) + ' ' + (h * 0.05) + ' ' + (w * 0.62) + ' ' + (h * 0.2) + ' L' + (w * 0.6) + ' ' + (h * 0.8) + ' Q' + (w * 0.42) + ' ' + (h * 0.9) + ' ' + (w * 0.26) + ' ' + (h * 0.78) + ' Z', fill: 'var(--coconut)' }));
    s.appendChild(el('rect', { x: 20, y: h * 0.8, width: 30, height: h * 0.2, fill: 'var(--cocoa)' }));
    s.appendChild(el('rect', { x: w - 50, y: h * 0.8, width: 30, height: h * 0.2, fill: 'var(--cocoa)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['the-den.html'] = {
    prefix: 'den-walk',
    build: function (kit) {
      var r = seeded(18);
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 1900 + F;                       // the north wall
      var HALF = 860, eye = sh / 2, decor = [];
      var WALL = Math.max(sh + 120, 680);       // a low ceiling

      [-1, 1].forEach(function (side) {
        decor.push(kit.item(panelling(END + 200, WALL), { x: side * HALF, z: (END + 200) / 2 - 100, w: END + 200, h: WALL, turn: side < 0 ? kit.LEFT : kit.RIGHT }));
      });
      decor.push(kit.item(panelling(HALF * 2 + 100, WALL), { x: 0, z: END + 40, w: HALF * 2 + 100, h: WALL }));
      var falls = kit.item(waterfall(r, 600, WALL - 40), { x: -HALF + 20, z: END * 0.55, w: 600, h: WALL - 40, turn: kit.LEFT });
      decor.push(falls);
      [-1, 1].forEach(function (k) {
        decor.push(kit.item(lamp(130, 240), { x: -HALF + 120, z: END * 0.55 + k * 420, w: 130, h: 240, turn: kit.LEFT }));
      });
      decor.push(kit.item(lamp(130, 240), { x: sw / 2 + 150, z: END - 60, w: 130, h: 240 }));
      decor.push(kit.item(lamp(130, 240), { x: -sw / 2 - 150, z: END - 60, w: 130, h: 240 }));
      var settee = kit.item(sofa(700, 320), { x: HALF - 200, z: END * 0.45, w: 700, h: 320, turn: kit.RIGHT });
      decor.push(settee);

      var page = kit.screen(kit.page, 'The Den’s own page, in a carved frame on the north wall');
      var frame = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'den-walk-frame' });

      var stops = [
        kit.stop({ name: 'at the foot of the stairs down from the Jungle Room, on the green shag', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the waterfall of cut fieldstone, a jade lamp either side', spot: kit.front(falls, 900) }, falls),
        kit.stop({ name: 'by the carved sofa with the fur thrown over it', spot: kit.front(settee, 900) }, settee),
        kit.stop({ name: 'at the north wall, with the room’s own page in its carved frame', spot: { x: 0, z: END - F }, link: page }, frame)
      ];

      return {
        cls: 'den-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is in a carved frame on the north wall, across the shag.',
        bounds: function () { return { x: [-HALF + 260, HALF - 300], z: [0, END - F] }; },
        ground: function (g, near, far) {
          kit.quad(g, -4000, 4000, near, far, kit.ink('--cocoa'));
          kit.quad(g, -HALF, HALF, -200, END + 40, kit.ink('--shag'));
          // The shag's pile, two greens, the same every visit.
          var lit = seeded(81), deep = kit.ink('--shag-2');
          for (var q = 0; q < 1400; q++) {
            var qx = -HALF + lit() * HALF * 2, qz = -200 + lit() * (END + 240);
            if (qz < near || qz > far) continue;
            kit.oval(g, qx, qz, 6 + lit() * 8, 4 + lit() * 6, deep, 0.8);
          }
          // The jade lamps' light, at knee height, close to the floor round them.
          kit.oval(g, -HALF + 160, END * 0.55 - 420, 220, 140, kit.ink('--jade'), 0.18);
          kit.oval(g, -HALF + 160, END * 0.55 + 420, 220, 140, kit.ink('--jade'), 0.18);
        }
      };
    }
  };
})();

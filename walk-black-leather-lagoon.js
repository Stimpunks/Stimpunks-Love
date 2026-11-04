/* =============================================================================
   Black Leather Lagoon, walked into on Paper Street. Ryan's call, 2026-11-04:
   round one of the rooms you can walk into, the lagoon among them.

   IT IS THE LAGOON'S WORLD AND NOBODY ELSE'S (§35): a drive-in screen
   standing in black water, showing to reeds, turning 01 off The Outskirts.
   The screen is the one light, and here the screen IS the lagoon's own page,
   up on its legs at the far end of the water, full size once you stand at
   it; everything else is lit off it, so the reeds catch it in acid green on
   the side facing it, and its long reflection lies on the water towards you,
   broken by the ripples. The lobby cards out in the shallows stand on posts
   with their faces turned to the screen and their dark backs to you.

   THIS ROOM HAS A HORIZON, which is what holds it off Club Chronic, a flat wall
   of paper with no light in it: if the water ever goes flat, or the screen
   stops being the only light, they have become one room. THE SCREEN DOES NOT
   FLICKER, at any setting: a drive-in is a flickering object, and building one
   without the flicker is the room's door policy. Nothing moves. Every colour is
   one §35 declares, by name. It keeps nothing, sends nothing and fetches
   nothing; its page arrives through Paper Street's screen().
   tools/make-paper-street.py holds each of those.
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

  // The screen's frame and legs, standing in the water.
  function frame(w, h, gap, ph) {
    var s = svg(w, h), m = w / 2, top = h - ph - 260;
    s.appendChild(el('rect', { x: m - gap / 2 - 30, y: top - 30, width: gap + 60, height: ph + 60, fill: 'var(--lag-card)' }));
    [m - gap / 2 + 60, m + gap / 2 - 90].forEach(function (x) {
      s.appendChild(el('rect', { x: x, y: top + ph, width: 30, height: h - top - ph, fill: 'var(--lag-card)' }));
    });
    s.appendChild(el('rect', { x: m - gap / 2 + 60, y: top + ph + 110, width: gap - 120, height: 18, fill: 'var(--lag-card)' }));
    return s;
  }

  // A stand of reeds, each lit acid green on the side facing the screen.
  function reeds(w, h, seed) {
    var s = svg(w, h);
    for (var x = 10, k = seed; x < w; x += 22 + (k * 13) % 18, k++) {
      var top = 20 + (k * 47) % (h * 0.5);
      s.appendChild(el('rect', { x: x, y: top, width: 9, height: h - top, fill: 'var(--lag-card)' }));
      s.appendChild(el('rect', { x: x + 6, y: top, width: 3, height: h - top, fill: 'var(--lag-acid)' }));
      if (k % 3 === 0) s.appendChild(el('ellipse', { cx: x + 4, cy: top + 26, rx: 9, ry: 28, fill: 'var(--lag-card)' }));
    }
    return s;
  }

  // A lobby card on a post in the shallows, its back to you, its edges lit
  // by the screen it faces.
  function lobbyCard(w, h) {
    var s = svg(w, h), ch = w * 0.75;
    s.appendChild(el('rect', { x: w / 2 - 8, y: ch, width: 16, height: h - ch, fill: 'var(--lag-card)' }));
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: ch, fill: 'var(--lag-card)' }));
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: 5, fill: 'var(--lag-acid)' }));
    s.appendChild(el('rect', { x: 0, y: 0, width: 5, height: ch, fill: 'var(--lag-acid)' }));
    s.appendChild(el('rect', { x: w - 5, y: 0, width: 5, height: ch, fill: 'var(--lag-acid)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['black-leather-lagoon.html'] = {
    prefix: 'lag-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 3600 + F;                       // where the screen stands in the water
      var eye = sh / 2, UP = 260;
      var decor = [];

      decor.push(kit.item(frame(sw + 400, sh + UP + 60, sw, sh), { x: 0, z: END + 20, w: sw + 400, h: sh + UP + 60 }));
      var page = kit.screen(kit.page, 'Black Leather Lagoon’s own page, on the drive-in screen standing in the water');
      var screen = kit.item(page, { x: 0, z: END, y: UP, w: sw, h: sh, cls: 'lag-walk-screen' });

      [[-1200, END - 400, 1300, 3], [1150, END - 700, 1200, 7], [-800, 1600, 900, 11], [900, 1200, 800, 17], [-2000, 2600, 1400, 23], [2100, 2300, 1500, 29]].forEach(function (r) {
        decor.push(kit.item(reeds(r[2], 420, r[3]), { x: r[0], z: r[1], w: r[2], h: 420 }));
      });
      [[-560, 1900], [520, 2500], [-420, 3000]].forEach(function (c) {
        decor.push(kit.item(lobbyCard(220, 480), { x: c[0], z: c[1], w: 220, h: 480 }));
      });

      var stops = [
        kit.stop({ name: 'at the water’s edge, with the screen lit far out in the dark', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'out among the lobby cards, their faces turned to the screen', spot: { x: 0, z: 2200 } }),
        kit.stop({ name: 'in front of the drive-in screen, with the lagoon’s own page on it', spot: kit.front(screen), link: page }, screen)
      ];

      return {
        cls: 'lag-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The screen out in the water is the only light, and the lagoon’s own page is on it.',
        bounds: function () { return { x: [-700, 700], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--lag-water'));
          // The screen's reflection lying on the water towards you, broken by
          // the ripples, wider the nearer it comes.
          var lit = kit.ink('--lag-screen');
          for (var z = Math.max(0, Math.ceil(from / 70) * 70); z < Math.min(to, END); z += 70) {
            var half = sw / 2 * (0.55 + 0.45 * (1 - z / END)), k = Math.round(z / 70);
            var off = ((k * 37) % 7 - 3) * 18;
            kit.quad(g, -half + off, half + off, z, z + 18, lit, 0.16);
            if (k % 2) kit.quad(g, -half * 0.5 + off * 2, half * 0.3 + off, z + 30, z + 40, lit, 0.1);
          }
        }
      };
    }
  };
})();

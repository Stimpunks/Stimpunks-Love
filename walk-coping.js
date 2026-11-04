/* =============================================================================
   Coping, walked into on Paper Street. Ryan's ask, 2026-11-04: round 1 of the
   rooms that could not yet be walked into.

   IT IS THE EYE OF THE STORM AND NOTHING ELSE (§126). A round floor of still
   air, dry and in the sun, and a wall of cloud all the way round it, standing
   in card: slate at its foot, billowing up, lit full on at its tops, so the
   brightest thing in the room is not the floor but the wall's crown. The storm
   stays in plain sight, because that is the difference between coping and
   denial. Straight up, clear sky. NO RAIN FALLS INSIDE THE WALL (Community
   Care, next door, is the rain room), and nothing in it is green.

   THE SUN IS OVERHEAD, SO IT LANDS ON THE TOP EDGE OF EVERYTHING: a gold line
   along the top of the slip the room's own page stands on, in the middle of
   the floor of the eye, to read and press as itself, and its shadow small and
   straight under it. The floor goes into the wall's shade at the rim. Nothing
   is set on the sky, the cloud or the storm. The doors the page draws stand on
   the page, where they open onto their rooms; none is drawn here.

   NOTHING MOVES AT ANY SETTING, MAX GLITTER included: no cloud drifts. Every
   colour is one §126 declares, by name. It keeps nothing, sends nothing and
   fetches nothing; its page arrives through Paper Street's screen().
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
  function hash(i, j) {
    var n = Math.imul(i, 374761393) ^ Math.imul(j, 668265263);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  // One stretch of the wall of cloud: slate storm at its foot, the cloud
  // billowing up in towers, and its crowns lit full on by the sun overhead.
  function cloudWall(w, h, seed) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: h * 0.62, width: w, height: h * 0.38, fill: 'var(--cop-storm)' }));
    for (var k = 0; k < 7; k++) {
      var x = (k + 0.5) * w / 7 + (hash(seed, k) - 0.5) * 60, r = w * (0.1 + hash(k, seed) * 0.05);
      var top = h * (0.12 + hash(seed + 1, k) * 0.2);
      s.appendChild(el('rect', { x: x - r, y: top + r, width: 2 * r, height: h * 0.62 - top - r + 2, fill: 'var(--cop-tower)' }));
      s.appendChild(el('circle', { cx: x, cy: top + r, r: r, fill: 'var(--cop-billow)' }));
      s.appendChild(el('circle', { cx: x - r * 0.5, cy: top + r * 0.9, r: r * 0.6, fill: 'var(--cop-cloud)' }));
    }
    s.appendChild(el('rect', { x: 0, y: h * 0.56, width: w, height: h * 0.1, fill: 'var(--cop-foot)' }));
    for (var y = h * 0.7; y < h; y += 46) s.appendChild(el('rect', { x: 0, y: y, width: w, height: 3, fill: 'var(--cop-rain)' }));
    return s;
  }

  // The slip the page stands on: the floor's own colour, the sun's gold line
  // along its top.
  function slip(w, h, fh) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--cop-floor)', stroke: 'var(--cop-shade)', 'stroke-width': 4 }));
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: 10, fill: 'var(--cop-sun)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['coping.html'] = {
    prefix: 'cop-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 940), sh = kit.H - 24;
      var eye = sh / 2, R = 3400, C = 2200;          // the eye's radius, and its middle
      var WALL = Math.max(1800, sh + 1200), decor = [];

      // The wall of cloud, all the way round, every stretch turned to the middle.
      var N = 16, PW = 2 * R * Math.tan(Math.PI / N) + 10;
      for (var i = 0; i < N; i++) {
        var a = Math.PI * 2 * i / N;
        decor.push(kit.item(cloudWall(PW, WALL, i), { x: R * Math.sin(a), z: C - R * Math.cos(a), w: PW, h: WALL, turn: a + Math.PI }));
      }
      decor.push(kit.item(slip(sw + 60, sh + 60, sh), { x: 0, z: C + 10, w: sw + 60, h: sh + 60, y: 30 }));

      var page = kit.screen(kit.page, 'Coping’s own page, standing on a slip in the middle of the eye');
      var hung = kit.item(page, { x: 0, z: C, w: sw, h: sh, y: 60, cls: 'cop-walk-slip' });

      var stops = [
        kit.stop({ name: 'on the floor of the eye, the wall of cloud all the way round', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'in the middle of the eye, with the room’s own page on its slip', spot: kit.front(hung), link: page }, hung),
        kit.stop({ name: 'near the rim, in the wall’s shade, the storm in plain sight', spot: { x: 0, z: C + 1600 } })
      ];

      return {
        cls: 'cop-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page stands on a slip in the middle of the eye.',
        bounds: function (cam) {
          return { x: [-2400, 2400], z: [-600, C + 1800] };
        },
        ground: function (g, from, to) {
          // The floor of the eye: in the sun in the middle, in the wall's shade
          // at the rim.
          kit.quad(g, -9000, 9000, from, to, kit.ink('--cop-shade'));
          kit.oval(g, 0, C, R * 0.82, R * 0.82, kit.ink('--cop-floor'), 1);
          // The slip's shadow, small and straight under it.
          kit.oval(g, 0, C + 10, sw * 0.5, 40, kit.ink('--cop-shade'), 1);
        }
      };
    }
  };
})();

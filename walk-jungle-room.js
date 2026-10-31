/* =============================================================================
   The Jungle Room, walked into on Paper Street. Ryan's call, 2026-10-31: the
   first room you can walk into, with its own page inside it.

   IT IS THE JUNGLE ROOM'S WORLD AND NOBODY ELSE'S (§17): night-green under a
   closed roof, light arriving only where the leaves let it and landing on the
   floor in patches, nothing standing alone because everything overlaps
   something. You walk in under the leaves along a path between buttressed
   trunks, and at the far end, in a gap in the canopy, is a screen in the
   room's own shape, a leaf: two corners rounded and two nearly pointed. On it
   is the Jungle Room's page itself, every gallery and every cam, which you
   read and press as the page, full size once you stand in front of it.

   EVERY LEAF IS THE ROOM'S OWN LEAF, the path in the canopy over its page
   (jr-leaf), and every colour is one of §17's declared inks, by name. A leaf
   that hangs at an angle hangs that way because its points are worked out
   turned, here, before they are drawn: nothing is rotated, so check-gentle.py
   sees only Paper Street's translate and scale. NOTHING MOVES: the shafts of
   light that shift at MAX on the page stand still in here, because the page is
   on the screen with its own dial, and a second light moving round it would
   be the room moving unasked. It keeps nothing, sends nothing and fetches
   nothing; the page on the screen is Paper Street's screen(), the one way a
   room's page arrives. tools/make-paper-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var LEAF = [[0, 0], [18, -7], [36, 9], [31, 36], [10, 36], [-5, 19], [0, 0]];

  // The same leaves every visit: a small fixed-seed generator.
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

  // One leaf, its stem at (x, y), turned by `a` radians and k times the size.
  function leaf(x, y, a, k, fill) {
    var c = Math.cos(a), s = Math.sin(a);
    var p = LEAF.map(function (q) { return [x + (q[0] * c - q[1] * s) * k, y + (q[0] * s + q[1] * c) * k]; });
    var f = function (q) { return q[0].toFixed(1) + ' ' + q[1].toFixed(1); };
    return el('path', { d: 'M' + f(p[0]) + 'C' + f(p[1]) + ' ' + f(p[2]) + ' ' + f(p[3]) + 'C' + f(p[4]) + ' ' + f(p[5]) + ' ' + f(p[6]) + 'Z', fill: fill });
  }

  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }

  var INKS = ['var(--buttress)', 'var(--understory)', 'var(--palm)'];

  // Leaves hanging off the roof: stems along the top, falling down.
  function canopy(r, w, h) {
    var s = svg(w, h);
    for (var i = 0; i < 16; i++) {
      var x = r() * w, k = 1.6 + r() * 2.6;
      s.appendChild(leaf(x, r() * h * 0.25, Math.PI * (0.15 + r() * 0.7), k, INKS[Math.floor(r() * 3)]));
    }
    if (r() < 0.25) s.appendChild(leaf(w * (0.2 + r() * 0.6), h * 0.35, Math.PI * 0.5, 0.9, r() < 0.5 ? 'var(--heliconia)' : 'var(--orchid)'));
    return s;
  }

  // Fronds rising off the floor: stems along the foot, reaching up.
  function fronds(r, w, h) {
    var s = svg(w, h);
    for (var i = 0; i < 10; i++) {
      var k = 1.4 + r() * 2.2;
      s.appendChild(leaf(w * (0.2 + r() * 0.6), h, -Math.PI * (0.15 + r() * 0.7), k, INKS[Math.floor(r() * 3)]));
    }
    return s;
  }

  // A buttressed trunk, its roots flaring into the floor, a vine down it.
  function trunk(w, h) {
    var s = svg(w, h), m = w / 2;
    s.appendChild(el('path', { fill: 'var(--buttress)',
      d: 'M' + (m - 14) + ' 0 H' + (m + 14) + ' V' + (h - 90) + ' Q' + (m + 20) + ' ' + (h - 20) + ' ' + w + ' ' + h +
         ' H0 Q' + (m - 20) + ' ' + (h - 20) + ' ' + (m - 14) + ' ' + (h - 90) + ' Z' }));
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--palm)', 'stroke-width': 3,
      d: 'M' + (m - 6) + ' 0 Q' + (m + 16) + ' ' + h * 0.25 + ' ' + (m - 8) + ' ' + h * 0.5 + ' T' + (m + 4) + ' ' + (h - 60) }));
    return s;
  }

  // A shaft of light through a gap in the roof, slanting the way the page's do.
  function shaft(w, h) {
    var s = svg(w, h);
    s.appendChild(el('polygon', { points: (w * 0.55) + ',0 ' + w + ',0 ' + (w * 0.45) + ',' + h + ' 0,' + h,
      fill: 'var(--sun)', 'fill-opacity': '0.08' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['jungle-room.html'] = {
    prefix: 'jr-walk',
    build: function (kit) {
      var r = seeded(17);
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1100), sh = kit.H - 24;
      var END = 3600 + F;                       // where the screen stands
      var clear = function (x, z) { return z < END - F * 1.1 || Math.abs(x) > sw / 2 + 40; };
      var decor = [], pools = [];

      for (var z = 500; z < END + 400; z += 520) {
        [-1, 1].forEach(function (side) {
          var x = side * (430 + r() * 160);
          if (clear(x, z)) decor.push(kit.item(trunk(130, 980), { x: x, z: z + r() * 200, w: 130, h: 980 }));
        });
      }
      for (z = 260; z < END + 300; z += 150) {
        var cw = 260 + r() * 200, ch = 200 + r() * 120, cx = -760 + r() * 1520;
        if (clear(cx, z)) decor.push(kit.item(canopy(r, cw, ch), { x: cx, z: z, w: cw, h: ch, y: sh * 0.62 + r() * 160 }));
      }
      for (z = 300; z < END; z += 130) {
        var side = r() < 0.5 ? -1 : 1, fw = 170 + r() * 120, fh = 120 + r() * 110;
        var fx = side * (300 + r() * 380);
        if (clear(fx, z)) decor.push(kit.item(fronds(r, fw, fh), { x: fx, z: z, w: fw, h: fh }));
      }
      for (var i = 0; i < 6; i++) {
        var sz = 700 + i * 480 + r() * 200, sx = -260 + r() * 520;
        if (!clear(sx, sz)) continue;
        decor.push(kit.item(shaft(220, sh * 0.62 + 200), { x: sx, z: sz, w: 220, h: sh * 0.62 + 200 }));
        pools.push([sx - 40, sz]);
      }
      // Leaves round the gap the screen hangs in, standing just behind it.
      for (i = 0; i < 8; i++) {
        var gx = (i % 2 ? 1 : -1) * (sw / 2 + 60 + r() * 160);
        decor.push(kit.item(canopy(r, 320, 300), { x: gx, z: END + 30, w: 320, h: 300, y: r() * (sh - 200) }));
      }

      // The screen: the room's page, in a leaf, in the gap.
      var page = kit.screen(kit.page, 'The Jungle Room’s own page, on the screen');
      var screen = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'jr-walk-screen' });

      var stops = [
        kit.stop({ name: 'under the first leaves, at the way in', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'under the canopy, halfway along', spot: { x: 0, z: (END - F) * 0.5 } }),
        kit.stop({ name: 'at the screen, with the room’s own page on it', spot: { x: 0, z: END - F }, link: page }, screen)
      ];

      return {
        cls: 'jr-walk',
        eye: sh / 2,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is on the screen at the far end, under the leaves.',
        bounds: function () { return { x: [-320, 320], z: [0, END - F] }; },
        ground: function (g, near, far) {
          kit.quad(g, -3000, 3000, near, far, kit.ink('--litter'));
          kit.quad(g, -150, 150, near, Math.min(far, END), kit.ink('--understory'));
          pools.forEach(function (p) { kit.oval(g, p[0], p[1], 150, 90, kit.ink('--sun'), 0.1); });
        }
      };
    }
  };
})();

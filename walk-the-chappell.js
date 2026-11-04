/* =============================================================================
   The Chappell, walked into on Paper Street. Ryan's ask, 2026-11-04: round 1
   of the rooms you can walk into.

   IT IS A SUBROOM AND IT STILL SHARES NOTHING WITH ITS PARENT (§12). The
   dancefloor is flat hot pink, cream and one big tray; this is votive indigo,
   gold leaf and free-standing pointed arches on the bare stone of a tall nave,
   the floor showing between them. Being reached through Pink Pony Club is a
   fact about the doors, not a licence to inherit its face, so not one of the
   dancefloor's colours is used in here, its cream included.

   THE GLASS is in every bay down both walls, tall lancets of the Chappell's own
   four glass colours in lead, and a rose window high over the chancel at the
   east end. THE LIGHT is what that glass does: each window lays its colours
   down on the stone in front of it, and lies where it lands. The arches stand
   down the nave either side of the aisle, gold leaf round a dark niche, and
   the chancel is the east end, the same ground and gold, where the room's own
   page stands in the great arch under the rose.

   NOTHING MOVES. Every colour is one §12 declares, by name. It keeps nothing,
   sends nothing and fetches nothing; its page arrives through Paper Street's
   screen(). tools/make-paper-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var GLASS = ['var(--ruby)', 'var(--sapphire)', 'var(--emerald)', 'var(--amethyst)'];
  var GLASS_INK = ['--ruby', '--sapphire', '--emerald', '--amethyst'];

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }
  // A pointed arch's outline, its feet on the bottom edge.
  function pointed(cx, base, ow, oh) {
    var l = cx - ow / 2, r = cx + ow / 2, spring = base - oh + ow * 0.75;
    return 'M' + l + ' ' + base + ' V' + spring + ' Q' + l + ' ' + (base - oh + ow * 0.2) + ' ' + cx + ' ' + (base - oh) +
      ' Q' + r + ' ' + (base - oh + ow * 0.2) + ' ' + r + ' ' + spring + ' V' + base + ' Z';
  }

  // A bay of the nave wall: indigo stone, a pier each side with gold at its
  // foot and head, and a pair of lancets of leaded glass between them.
  function bay(n, w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--nave)' }));
    [0, w - 40].forEach(function (x) {
      s.appendChild(el('rect', { x: x, y: 0, width: 40, height: h, fill: 'var(--niche)' }));
      s.appendChild(el('rect', { x: x - 6, y: h - 60, width: 52, height: 60, fill: 'var(--leaf)' }));
      s.appendChild(el('rect', { x: x - 6, y: h * 0.32, width: 52, height: 22, fill: 'var(--leaf)' }));
    });
    s.appendChild(el('rect', { x: 0, y: h * 0.32 + 8, width: w, height: 6, fill: 'var(--leaf)' }));
    [w * 0.34, w * 0.66].forEach(function (cx, j) {
      var ow = w * 0.22, base = h * 0.3, oh = h * 0.24;
      s.appendChild(el('path', { d: pointed(cx, base, ow, oh), fill: 'var(--glass)' }));
      for (var y = base - oh + ow * 0.4, k = 0; y < base - 10; y += 40, k++) {
        s.appendChild(el('rect', { x: cx - ow / 2 + 6, y: y, width: ow - 12, height: 34, fill: GLASS[(n + j + k) % 4] }));
      }
      s.appendChild(el('path', { d: pointed(cx, base, ow, oh), fill: 'none', stroke: 'var(--leaf)', 'stroke-width': 5 }));
    });
    return s;
  }

  // A free-standing arch on its plinth: gold leaf round a dark niche.
  function arch(w, h) {
    var s = svg(w, h), cx = w / 2;
    s.appendChild(el('rect', { x: 0, y: h - 50, width: w, height: 50, fill: 'var(--niche)', stroke: 'var(--leaf)', 'stroke-width': 4 }));
    s.appendChild(el('path', { d: pointed(cx, h - 50, w - 30, h - 70), fill: 'var(--niche)', stroke: 'var(--leaf)', 'stroke-width': 14 }));
    s.appendChild(el('path', { d: pointed(cx, h - 70, w - 90, h - 130), fill: 'var(--glass)' }));
    s.appendChild(el('circle', { cx: cx, cy: h * 0.42, r: 8, fill: 'var(--leaf)' }));
    return s;
  }

  // The chancel's east wall: the great arch round the page's place, and the
  // rose window over it, petals round roundels round a gold eye.
  function eastWall(w, h, pw, ph) {
    var s = svg(w, h), cx = w / 2;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--nave)' }));
    s.appendChild(el('path', { d: pointed(cx, h, pw + 160, ph + 320), fill: 'var(--niche)', stroke: 'var(--leaf)', 'stroke-width': 20 }));
    var ry = Math.max(160, h - ph - 360), rr = Math.min(150, ry - 10);
    s.appendChild(el('circle', { cx: cx, cy: ry, r: rr + 14, fill: 'var(--leaf)' }));
    s.appendChild(el('circle', { cx: cx, cy: ry, r: rr, fill: 'var(--glass)' }));
    for (var i = 0; i < 12; i++) {
      var a = i / 12 * Math.PI * 2;
      s.appendChild(el('ellipse', { cx: cx + Math.cos(a) * rr * 0.66, cy: ry + Math.sin(a) * rr * 0.66, rx: rr * 0.24, ry: rr * 0.24, fill: GLASS[i % 4] }));
      s.appendChild(el('circle', { cx: cx + Math.cos(a + 0.26) * rr * 0.36, cy: ry + Math.sin(a + 0.26) * rr * 0.36, r: rr * 0.1, fill: GLASS[(i + 2) % 4] }));
    }
    s.appendChild(el('circle', { cx: cx, cy: ry, r: rr * 0.16, fill: 'var(--leaf)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['the-chappell.html'] = {
    prefix: 'chappell-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 3200 + F;                       // the chancel, at the east end
      var HALF = 900, BAY = 560, eye = sh / 2, decor = [];
      var WALL = Math.max(sh + 700, 1300);

      var n = 0, bays = [];
      for (var z = 0; z < END + 200; z += BAY, n++) {
        [-1, 1].forEach(function (side) {
          decor.push(kit.item(bay(n + (side > 0 ? 1 : 0), BAY, WALL), { x: side * HALF, z: z + BAY / 2, w: BAY, h: WALL, turn: side < 0 ? kit.LEFT : kit.RIGHT }));
        });
        bays.push(z + BAY / 2);
      }
      decor.push(kit.item(eastWall(HALF * 2 + 200, WALL, sw, sh), { x: 0, z: END + 120, w: HALF * 2 + 200, h: WALL }));
      // The arches, down both sides of the aisle, one to a bay.
      var arches = [];
      for (z = 500; z < END - F * 1.3; z += BAY) {
        [-1, 1].forEach(function (side) {
          var a = kit.item(arch(260, 560), { x: side * 520, z: z, w: 260, h: 560, turn: side < 0 ? kit.LEFT : kit.RIGHT });
          decor.push(a); arches.push(a);
        });
      }

      var page = kit.screen(kit.page, 'The Chappell’s own page, in the great arch of the chancel');
      var leaf = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'chappell-walk-chancel' });

      var stops = [
        kit.stop({ name: 'inside the west door, at the foot of the nave', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'in the nave between the arches, the glass’s colours on the stone', spot: { x: 0, z: (END - F) * 0.5 } }),
        kit.stop({ name: 'at the chancel, with the room’s own page in its great arch under the rose', spot: { x: 0, z: END - F }, link: page }, leaf)
      ];

      return {
        cls: 'chappell-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page stands in the great arch of the chancel, at the east end of the nave.',
        bounds: function () { return { x: [-360, 360], z: [0, END - F] }; },
        ground: function (g, near, far) {
          kit.quad(g, -4000, 4000, near, far, kit.ink('--nave'));
          // Flagstones, a gold seam down the aisle.
          var line = kit.ink('--niche');
          for (var x = -HALF; x <= HALF; x += 180) kit.quad(g, x - 3, x + 3, Math.max(0, near), Math.min(far, END + 120), line);
          for (var zz = Math.max(0, Math.ceil(near / 180) * 180); zz < Math.min(far, END + 120); zz += 180) kit.quad(g, -HALF, HALF, zz, zz + 5, line);
          kit.quad(g, -4, 4, 0, END, kit.ink('--leaf'), 0.7);
          // Each window's colours lying on the stone in front of it.
          bays.forEach(function (bz, i) {
            [-1, 1].forEach(function (side) {
              for (var k = 0; k < 4; k++) {
                var x0 = side * (HALF - 90 - k * 70);
                kit.quad(g, Math.min(x0, x0 - side * 60), Math.max(x0, x0 - side * 60), bz - 120 + (k % 2) * 40, bz + 40 + (k % 2) * 40,
                  kit.ink(GLASS_INK[(i + k + (side > 0 ? 1 : 0)) % 4]), 0.22);
              }
            });
          });
          // The rose's light before the chancel step.
          for (var p = 0; p < 12; p++) {
            var t = p / 12 * Math.PI * 2;
            kit.oval(g, Math.cos(t) * 260, END - 520 + Math.sin(t) * 140, 70, 40, kit.ink(GLASS_INK[p % 4]), 0.24);
          }
          kit.quad(g, -HALF, HALF, END - 200, END + 120, kit.ink('--niche'));
          kit.quad(g, -HALF, HALF, END - 206, END - 196, kit.ink('--leaf'), 0.8);
        }
      };
    }
  };
})();

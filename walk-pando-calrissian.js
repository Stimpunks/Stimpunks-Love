/* =============================================================================
   Pando Calrissian, walked into on Paper Street. Ryan's ask, 2026-11-04: round
   one of the rooms still to be walked into.

   IT IS THE TREE'S WORLD AND NOBODY ELSE'S (§84): a hillside of aspen through a
   gap between the shopfronts, after the sun has gone. THE LIGHT IS WHAT IS LEFT
   OF THE DAY, ON THE SKY: the backcloth is the earth's shadow lying along the
   horizon in blue with the pink belt above it, and every stem cut out of card
   here is pale bark at its crown and cold at its foot, because only what stands
   highest catches the pink. The root, which is the tree, is one pale thread on
   the dark hillside, and nothing is cut away to show it. Nothing glows from
   inside and nothing is lit from behind, which keeps it off Swaying Sweetgrass;
   it is not green, which keeps it off the campgrounds; and no word is gold,
   which keeps it off the Chappell: the gold is the leaves.

   THE GROVE HERE IS OURS AND SAYS NO NUMBER. The tree's own grove is drawn by
   pando.js from how many times it has been watered, on the room's own page,
   which stands at the fence at the top of the path: that is where it is
   watered, and nothing here talks to the CB or claims to be the count. These
   stems are a modest grove in the afterglow, nobody's tally.

   NOTHING MOVES: aspen quake in the slightest air, and these hold still. Every
   colour is one §84 declares, by name. It keeps nothing, sends nothing and
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
  // The same hill every visit: a small fixed-seed generator.
  function seeded(n) {
    return function () {
      n = (n + 0x6D2B79F5) | 0;
      var t = Math.imul(n ^ (n >>> 15), 1 | n);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // An aspen stem: pale bark at the crown, the valley's cold at the foot, the
  // dark eyes aspen bark carries, and a crown of gold leaves catching the pink.
  function stem(r, w, h) {
    var s = svg(w, h), cx = w / 2, sw = Math.max(14, w * 0.12);
    s.appendChild(el('rect', { x: cx - sw / 2, y: h * 0.18, width: sw, height: h * 0.82, fill: 'var(--pdo-foot)' }));
    s.appendChild(el('rect', { x: cx - sw / 2, y: h * 0.18, width: sw, height: h * 0.5, fill: 'var(--pdo-bark)' }));
    for (var y = h * 0.24; y < h * 0.86; y += 70 + r() * 60) {
      s.appendChild(el('ellipse', { cx: cx + (r() - 0.5) * sw * 0.4, cy: y, rx: sw * 0.32, ry: 5, fill: 'var(--pdo-eye)' }));
    }
    for (var k = 0; k < 26; k++) {
      var lx = cx + (r() - 0.5) * w * 0.9, ly = h * 0.02 + r() * h * 0.26;
      s.appendChild(el('ellipse', { cx: lx, cy: ly, rx: 14 + r() * 10, ry: 10 + r() * 6, fill: r() < 0.6 ? 'var(--pdo-gold)' : 'var(--pdo-gold2)' }));
    }
    return s;
  }

  // The split-rail fence at the top of the path, in the board's blue.
  function fence(w, h) {
    var s = svg(w, h);
    for (var x = 20; x < w; x += 300) s.appendChild(el('rect', { x: x, y: 10, width: 22, height: h - 10, fill: 'var(--pdo-board)' }));
    [0.22, 0.58].forEach(function (k) {
      s.appendChild(el('rect', { x: 0, y: h * k, width: w, height: 16, fill: 'var(--pdo-board)' }));
    });
    return s;
  }

  // The hillside the grove stands on, rising behind it into the dusk: the
  // soil's dark against the earth's shadow.
  function hill(w, h) {
    var s = svg(w, h);
    s.appendChild(el('path', { fill: 'var(--pdo-shade)',
      d: 'M0 ' + h + ' L0 ' + h * 0.55 + ' Q' + w * 0.3 + ' ' + h * 0.1 + ' ' + w * 0.55 + ' ' + h * 0.3 + ' T' + w + ' ' + h * 0.4 + ' L' + w + ' ' + h + ' Z' }));
    s.appendChild(el('path', { fill: 'var(--pdo-soil)',
      d: 'M0 ' + h + ' L0 ' + h * 0.8 + ' Q' + w * 0.45 + ' ' + h * 0.55 + ' ' + w + ' ' + h * 0.75 + ' L' + w + ' ' + h + ' Z' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['pando-calrissian.html'] = {
    prefix: 'pdo-walk',
    build: function (kit) {
      var r = seeded(84);
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 1000), sh = kit.H - 24;
      var END = 3000 + F;                       // the fence at the top of the path
      var eye = sh / 2;
      var decor = [];

      decor.push(kit.item(hill(9000, 1400), { x: 0, z: END + 2600, w: 9000, h: 1400, y: -200 }));

      // THE GROVE STANDS ON BOTH SIDES OF THE PATH, never on it, stem by stem,
      // each a different height, the same hill every visit.
      for (var z = 300; z < END - 200; z += 260 + r() * 200) {
        [-1, 1].forEach(function (side) {
          if (r() < 0.25) return;
          var h = 900 + r() * 900, w = 180 + r() * 120;
          var x = side * (360 + r() * 1100);
          decor.push(kit.item(stem(r, w, h), { x: x, z: z + r() * 120, w: w, h: h }));
        });
      }
      var fw = 2400;
      decor.push(kit.item(fence(fw, 220), { x: -sw / 2 - fw / 2 - 40, z: END + 10, w: fw, h: 220 }));
      decor.push(kit.item(fence(fw, 220), { x: sw / 2 + fw / 2 + 40, z: END + 10, w: fw, h: 220 }));

      // The page, at the fence, in the board's blue.
      var page = kit.screen(kit.page, 'Pando Calrissian’s own page, at the fence');
      var board = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'pdo-walk-board' });

      var stops = [
        kit.stop({ name: 'at the foot of the path, in the valley’s shade', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'among the stems, halfway up, their crowns in the last of the pink', spot: { x: 0, z: END * 0.5 } }),
        kit.stop({ name: 'at the fence, with the tree’s own page, where it is watered', spot: { x: 0, z: END - F }, link: page }, board)
      ];

      return {
        cls: 'pdo-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is at the fence at the top of the path, where the tree is watered.',
        bounds: function () { return { x: [-300, 300], z: [0, END - F] }; },
        ground: function (g, near, far) {
          kit.quad(g, -6000, 6000, near, far, kit.ink('--pdo-soil'));
          // The path up the hill, worn pale grey-blue.
          kit.quad(g, -170, 170, Math.max(near, -200), Math.min(far, END), kit.ink('--pdo-shade'));
          // THE ROOT, one pale thread across the whole hillside, never cut
          // away to show it: it wanders from stem to stem and back.
          var root = kit.ink('--pdo-root');
          for (var zz = Math.max(0, Math.floor(near / 12) * 12); zz < Math.min(far, END + 2000); zz += 12) {
            var x = Math.sin(zz / 520) * 700 + Math.sin(zz / 170) * 160;
            kit.quad(g, x - 6, x + 6, zz, zz + 14, root, 0.5);
            var x2 = -Math.sin(zz / 610 + 1) * 900 + Math.sin(zz / 230) * 120;
            kit.quad(g, x2 - 4, x2 + 4, zz, zz + 14, root, 0.35);
          }
        }
      };
    }
  };
})();

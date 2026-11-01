/* =============================================================================
   Pando Calrissian, walked into on Cel Street. Ryan's ask, 2026-10-31: back on
   the street, working down it a room at a time.

   IT IS THE TREE'S WORLD AND NOBODY ELSE'S (§84): a hillside of aspen up through
   a gap between the shopfronts, after the sun has gone. THE LIGHT IS WHAT IS
   LEFT OF THE DAY, ON THE SKY: the earth's own shadow lies along the horizon as
   a band of blue, the pink belt above it, and only what stands highest catches
   the pink while everything below is in the valley's shade. So every stem here
   is pale bark at its crown and cold at its foot, and the root, which is the
   tree, is one pale thread in the dark along the hill, with nothing cut away to
   show it. Nothing is lit from behind and nothing glows from inside, which is
   what holds it off Swaying Sweetgrass; it is a gradient from lit tops to dark
   foot and not green, which holds it off the campgrounds; no word is ever gold,
   the gold is the leaves, which holds it off the Chappell.

   THE GROVE HERE IS OURS AND SAYS NO NUMBER. The tree's own grove is drawn by
   pando.js out of how many times it has been watered, on the room's own page,
   which stands at the fence on its screen: that is where it is watered, read
   and written on, and nothing here talks to the CB or claims to be the count.
   The stems on this hill are a modest grove standing in the afterglow, nobody's
   tally. The signboard at the foot of the path and the three boards beside it
   are the page's own words, lifted off it.

   NOTHING MOVES: aspen quake in the slightest air, and these hold still. Every
   colour is one §84 declares, by name. It keeps nothing and sends nothing; its
   page arrives through Cel Street's screen(). tools/make-cel-street.py holds
   each of those.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 7, 374761393) ^ Math.imul(j + 29, 668265263) ^ Math.imul(k + 31, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['pando-calrissian.html'] = {
    name: 'Pando Calrissian',
    faces: ['"Averia Serif Libre"', '"Averia Sans Libre"'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2;

      // AFTER SUNSET. The sun went down behind you, past the street; you look
      // away from it, at the earth's shadow and the pink above it. The sky is
      // the evening's blue, the valley's shade closes in on the far hills, and
      // the only light is the sky's own, falling on the faces turned to it.
      kit.scene.background = kit.col('--pdo-sky');
      kit.scene.fog = new T.Fog(kit.col('--pdo-shade'), 30, 200);
      kit.scene.add(new T.HemisphereLight(kit.col('--pdo-belt'), kit.col('--pdo-soil'), 2.6));
      var top = new T.DirectionalLight(kit.col('--pdo-bark'), 1.3);
      top.position.set(0, 40, 45);
      kit.scene.add(top, top.target);

      // THE PINK BELT low over the earth's shadow, on the side of the sky away
      // from where the sun went down, too far to be reached by the valley's
      // shade; behind you, down the gap, the sky is only blue.
      var belt = kit.flat(new T.CylinderGeometry(300, 300, 34, 48, 1, true, Math.PI * 0.32, Math.PI * 1.36), at(0, 36, -30), '--pdo-belt');
      belt.material.side = T.BackSide; belt.material.fog = false;

      // THE GROUND you stand on, dark soil, and the hill rising off it.
      var FOOT = -13, TILT = 0.32, RISE = Math.tan(TILT);
      var hill = function (z) { return z < FOOT ? (FOOT - z) * RISE : 0; };
      box(70, 0.1, 40, at(0, -0.05, -6), '--pdo-soil', false, false);
      box(70, 0.3, 54, at(0, 27 * Math.sin(TILT) - 0.15, FOOT - 27 * Math.cos(TILT), 0, TILT), '--pdo-shade', false, false);
      // The far hills, in the valley's shade.
      [[-70, -150, 46], [10, -175, 58], [85, -140, 40]].forEach(function (h, i) {
        var g = new T.SphereGeometry(h[2], 18, 10); g.scale(1.6, 0.6, 1);
        kit.piece(g, at(h[0], 2, h[1], i), '--pdo-shade', 0.4);
      });

      // THE GAP between the shopfronts behind you: the backs of two buildings,
      // their roofs dark against the sky.
      [-1, 1].forEach(function (e) {
        box(10, 6.5, 7, at(e * 6.5, 3.25, 4.6), '--pdo-board');
        box(10.6, 0.3, 7.6, at(e * 6.5, 6.6, 4.6), '--pdo-soil');
        [1.5, 3.4].forEach(function (y) { box(1.1, 1.3, 0.06, at(e * 3.4, y + 0.6, 1.07), '--pdo-soil', false); });
      });

      // A STEM: cold at its foot, pale bark above, the dark eyes aspen bark has
      // where branches fell, and its leaves gold at the top, the lowest in the
      // shade.
      function stem(x, z, h, r) {
        var y0 = hill(z);
        cyl(r, r * 1.15, h * 0.45, at(x, y0 + h * 0.225, z), '--pdo-foot', 0.015, 8);
        cyl(r * 0.8, r, h * 0.55, at(x, y0 + h * 0.725, z), '--pdo-bark', 0.015, 8);
        [0.56, 0.74].forEach(function (f, i) {
          var eye = new T.SphereGeometry(r * 0.7, 8, 6); eye.scale(1.3, 0.55, 0.45);
          kit.piece(eye, at(x, y0 + h * f, z + r * 0.82, 0.3 * i), '--pdo-eye', false);
        });
        var c = Math.max(0.35, h * 0.11);
        kit.piece(new T.IcosahedronGeometry(c * 0.9, 0), at(x - c * 0.7, y0 + h * 0.97, z, x), '--pdo-gold2', 0.03);
        kit.piece(new T.IcosahedronGeometry(c * 0.85, 0), at(x + c * 0.65, y0 + h * 0.95, z + 0.1, z), '--pdo-gold2', 0.03);
        kit.piece(new T.IcosahedronGeometry(c * 1.1, 0), at(x, y0 + h + c * 0.4, z, x + z), '--pdo-gold', 0.03);
        return { x: x, z: z, y: y0 };
      }

      // THE GROVE on the hill, all of it one tree.
      var feet = [];
      for (var k = 0; k < 18; k++) {
        var sx = -11 + k * 1.3 + (hash(k, 1, 1) - 0.5) * 1.1;
        var sz = FOOT - 2 - hash(k, 1, 2) * 15;
        var sh = 5 + hash(k, 1, 3) * 6 * (1 - Math.abs(k - 9) / 14);
        feet.push(stem(sx, sz, sh, 0.12 + hash(k, 1, 4) * 0.08));
      }
      // The root runs along the hill under them all, and every stem comes up
      // off it: on a hill this even, a line between two points on it lies on it.
      var RZ = FOOT - 9, rootAt = function (x) { return new T.Vector3(x, hill(RZ) + 0.05, RZ); };
      var thread = function (a0, a1) {
        var span = a1.clone().sub(a0), mid = a0.clone().add(a1).multiplyScalar(0.5);
        var g = new T.CylinderGeometry(0.035, 0.035, span.length(), 5);
        g.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), span.clone().normalize()));
        kit.piece(g, at(mid.x, mid.y, mid.z), '--pdo-root', false);
      };
      feet.sort(function (a, b) { return a.x - b.x; });
      thread(rootAt(feet[0].x - 1), rootAt(feet[feet.length - 1].x + 1));
      feet.forEach(function (f) { thread(rootAt(f.x), new T.Vector3(f.x, f.y + 0.05, f.z)); });

      // THE FENCE ROUND THE NEW GROWTH, at the foot of the hill on the right:
      // posts and wire round a few young suckers, which is what has helped the
      // real one. A board on its front holds the room's own page, where the
      // tree is watered and notes are pinned to the fence.
      var FX0 = 2.5, FX1 = 7.5, FZ0 = -8.6, FZ1 = -12.2;
      [[FX0, FZ0], [FX1, FZ0], [FX1, FZ1], [FX0, FZ1], [(FX0 + FX1) / 2, FZ1], [FX1, (FZ0 + FZ1) / 2], [FX0, (FZ0 + FZ1) / 2]].forEach(function (p) {
        box(0.12, 1.3, 0.12, at(p[0], 0.65, p[1]), '--pdo-foot', 0.012);
      });
      [0.45, 0.9, 1.2].forEach(function (y) {
        box(FX1 - FX0, 0.025, 0.025, at((FX0 + FX1) / 2, y, FZ1), '--pdo-root', false);
        box(0.025, 0.025, FZ0 - FZ1, at(FX0, y, (FZ0 + FZ1) / 2), '--pdo-root', false);
        box(0.025, 0.025, FZ0 - FZ1, at(FX1, y, (FZ0 + FZ1) / 2), '--pdo-root', false);
      });
      for (k = 0; k < 6; k++) {
        var yx = FX0 + 0.6 + hash(k, 2, 1) * (FX1 - FX0 - 1.2), yz = FZ1 + 0.5 + hash(k, 2, 2) * (FZ0 - FZ1 - 1.2);
        stem(yx, yz, 0.7 + hash(k, 2, 3) * 0.9, 0.035);
      }
      var pw = 3.0, ph = pw * 800 / 1180, py = 0.65 + ph / 2, px = (FX0 + FX1) / 2;
      [-1, 1].forEach(function (e) { box(0.12, py + ph / 2 + 0.2, 0.12, at(px + e * (pw / 2 + 0.14), (py + ph / 2 + 0.2) / 2, FZ0 + 0.05), '--pdo-foot', 0.012); });
      box(pw + 0.2, ph + 0.2, 0.06, at(px, py, FZ0 + 0.1), '--pdo-board', 0.012);
      var page = kit.screen(1180, 800, pw, at(px, py, FZ0 + 0.15), 'Pando Calrissian’s own page, on the board at the fence, where the tree is watered');

      // THE SIGNBOARD at the foot of the path, on its two posts, carrying the
      // tree's name and its drawing off the page.
      var SX = -3.2, SZ = -4.2;
      [-1, 1].forEach(function (e) { box(0.12, 1.1, 0.12, at(SX + e * 1.15, 0.55, SZ - 0.04), '--pdo-foot', 0.012); });
      var sign = kit.lift(page, '.pdo-head', { w: 900, ww: 2.4, m: at(SX, 1.0, SZ) });

      // THREE BOARDS along the left of the path, each with a part of the page:
      // how the tree grows, the real one, and the name.
      var BOARDS = [
        { n: 0, z: -6.2, h: 760, words: 'at the board on how the tree grows' },
        { n: 2, z: -8.6, h: 700, words: 'at the board on the real one, in Utah' },
        { n: 3, z: -11.0, h: 700, words: 'at the board on the name' }
      ];
      var stops = [
        { name: 'at the top of the gap between the shopfronts, the hill in front of you', x: 0, z: -0.6, yaw: 0, pitch: 0.12 },
        { name: 'at the signboard at the foot of the path', x: SX, z: SZ + 2.0, yaw: 0, pitch: 0.06, frame: sign.el }
      ];
      BOARDS.forEach(function (b) {
        var g = at(-7.2, 0, b.z, LEFT);
        [-1, 1].forEach(function (e) { box(0.12, 0.9, 0.12, M(g, at(e * 0.85, 0.45, -0.04)), '--pdo-foot', 0.012); });
        var it = kit.lift(page, '.pdo-part', { n: b.n, w: 640, h: b.h, ww: 1.5, m: M(g, at(0, 0.85, 0.02)) });
        stops.push({ name: b.words, x: -7.2 + 2.4, z: b.z, yaw: LEFT, pitch: 0.18, frame: it.el });
      });
      stops.push(
        { name: 'at the foot of the grove, the tops still catching the pink', x: -1.0, z: -9.5, yaw: 0, pitch: 0.24 },
        { name: 'at the fence round the new growth, with the room’s own page on its board, where the tree is watered', x: px, z: FZ0 + 2.6, yaw: 0, pitch: 0.06, page: kit.page, frame: page },
        { name: 'looking back down through the gap to the street', x: 0, z: -5.0, yaw: Math.PI, pitch: 0.05 });

      return {
        start: { x: 0, z: -0.6, yaw: 0 },
        bounds: { x: [-6.4, 8.6], z: [FOOT + 0.8, 0.4] },
        stops: stops
      };
    }
  };
})();

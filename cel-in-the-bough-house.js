/* =============================================================================
   The Bough House, walked into on Cel Street. Ryan's ask, 2026-10-31: pitch 05
   on the campgrounds, Jess's, through its post in the field.

   IT IS THE BOUGH HOUSE'S WORLD AND NOBODY ELSE'S (§117): the only room on the
   street up off the ground. You come up the ladder through a hatch in the
   floor into a room of silvered planks, square and daylit, with the tree
   coming up through the middle of it and out through the roof, and an autumn
   grove all round the windows: gold, amber, crimson and a few leaves still
   green, against the late-afternoon sky. The sun is low in the west, so it
   comes in at the west window and lies across the boards and on the trunk's
   west side, the last sun on the top of the tree. Ben, the tiny black dog, is
   on his cushion by the door to the platform. That is what keeps it off the
   Faery Yurt next door: no candle, no canvas, no round wall; boards and
   daylight and a tree.

   THE ONE SONG IS THE ROOM'S OWN, lifted off its page with its card and
   pinned on the east wall, where it plays as it does on the page: nothing
   until it is pressed, then round from the top until it is stopped. The
   room's own page hangs on the north wall.

   NOTHING MOVES, and the leaves fall only on the page, when somebody presses
   for them. Every colour is one the room declares, by name. It keeps nothing,
   sends nothing and fetches nothing; its page arrives through Cel Street's
   screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 17, 374761393) ^ Math.imul(j + 53, 668265263) ^ Math.imul(k + 59, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['the-bough-house.html'] = {
    name: 'The Bough House',
    from: 'campgrounds.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var X = 3.2, Z = 3.0, H = 2.4, RIDGE = 3.4, TX = 0.3, TZ = 0.2;

      // LATE AFTERNOON IN AUTUMN: the sky through the boughs, and the sun low
      // in the west.
      kit.scene.background = kit.col('--bgh-sky');
      kit.scene.add(new T.HemisphereLight(kit.col('--bgh-sky'), kit.col('--bgh-grain'), 1.7));
      var sun = new T.DirectionalLight(kit.col('--bgh-gold'), 1.9);
      sun.position.set(-14, 4.2, -2); sun.target.position.set(0, 0.6, 0);
      sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024);
      sun.shadow.camera.left = -8; sun.shadow.camera.right = 8; sun.shadow.camera.top = 8; sun.shadow.camera.bottom = -8;
      sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.03;
      kit.scene.add(sun, sun.target);

      // THE FLOOR, boards with the grain between them, and the hatch you came
      // up through in the south-west corner, the ladder's rails standing out of it.
      var hx = -1.9, hz = 1.7, hw = 0.85;
      box(X * 2, 0.12, hz - hw / 2 + Z, at(0, -0.06, (hz - hw / 2 - Z) / 2), '--bgh-plank', false);
      box(X * 2, 0.12, Z - (hz + hw / 2), at(0, -0.06, (hz + hw / 2 + Z) / 2), '--bgh-plank', false);
      box(hx - hw / 2 + X, 0.12, hw, at((hx - hw / 2 - X) / 2, -0.06, hz), '--bgh-plank', false);
      box(X - (hx + hw / 2), 0.12, hw, at((hx + hw / 2 + X) / 2, -0.06, hz), '--bgh-plank', false);
      for (var b = -X + 0.4; b < X; b += 0.4) box(0.02, 0.01, Z * 2, at(b, 0.005, 0), '--bgh-grain', false);
      [-1, 1].forEach(function (s) {
        box(0.06, 1.6, 0.06, at(hx + s * 0.32, -0.3, hz - 0.3), '--bgh-trunk', 0.01);
      });
      for (var r = 0; r < 4; r++) box(0.64, 0.05, 0.05, at(hx, -0.7 + r * 0.35, hz - 0.3), '--bgh-trunk', false);

      // THE WALLS, planks with gaps for the windows and the door: a window on
      // the north wall, the big one to the west where the sun comes in, a small
      // one east, and the door south onto the platform.
      function plank(w, h, m) { box(w, h, 0.1, m, '--bgh-plank'); }
      // North (z = -Z): window from x -2.7 to -0.9, y 0.9 to 1.9.
      plank(0.5, H, at(-2.95, H / 2, -Z));
      plank(X + 0.9, H, at((X - 0.9) / 2, H / 2, -Z));
      plank(1.8, 0.9, at(-1.8, 0.45, -Z));
      plank(1.8, H - 1.9, at(-1.8, (H + 1.9) / 2, -Z));
      // West (x = -X): window from z -1.6 to 0.9, y 0.7 to 2.0.
      var west = at(-X, 0, 0, Math.PI / 2);
      plank(Z - 1.6, H, M(west, at((Z + 1.6) / 2, H / 2, 0)));
      plank(Z - 0.9, H, M(west, at(-(Z + 0.9) / 2, H / 2, 0)));
      plank(2.5, 0.7, M(west, at(0.35, 0.35, 0)));
      plank(2.5, H - 2.0, M(west, at(0.35, (H + 2.0) / 2, 0)));
      // East (x = X): a small window from z -2.2 to -1.2, y 1.1 to 1.9.
      var east = at(X, 0, 0, -Math.PI / 2);
      plank(0.8, H, M(east, at(-2.6, H / 2, 0)));
      plank(4.2, H, M(east, at(0.9, H / 2, 0)));
      plank(1.0, 1.1, M(east, at(-1.7, 0.55, 0)));
      plank(1.0, H - 1.9, M(east, at(-1.7, (H + 1.9) / 2, 0)));
      // South (z = Z): the door from x 0.4 to 1.4.
      plank(X + 0.4, H, at((-X + 0.4) / 2, H / 2, Z));
      plank(X - 1.4, H, at((X + 1.4) / 2, H / 2, Z));
      plank(1.0, H - 2.05, at(0.9, (H + 2.05) / 2, Z));
      // The frames round every opening, in the trunk's brown.
      [[-1.8, 1.4, -Z + 0.06, 0, 1.9, 1.1], [0.9, 1.03, Z - 0.06, 0, 1.06, 2.1]].forEach(function (f) {
        box(f[4], 0.06, 0.06, at(f[0], f[1] - f[5] / 2, f[2]), '--bgh-trunk', false);
        box(f[4], 0.06, 0.06, at(f[0], f[1] + f[5] / 2, f[2]), '--bgh-trunk', false);
      });
      box(0.08, 0.06, 2.6, at(-X + 0.08, 0.7, -0.35), '--bgh-trunk', false);
      box(0.08, 0.06, 2.6, at(-X + 0.08, 2.0, -0.35), '--bgh-trunk', false);
      box(0.3, 0.05, 2.5, at(-X + 0.2, 0.7, -0.35), '--bgh-plank');
      // THE ROOF, pitched, its rust underside over the room.
      var slope = Math.atan2(RIDGE - H, Z), run = Math.hypot(RIDGE - H, Z) + 0.3;
      [-1, 1].forEach(function (s) {
        box(X * 2 + 0.6, 0.1, run, at(0, (RIDGE + H) / 2, s * Z / 2, 0, s * slope), '--bgh-rust');
      });
      [-1, 1].forEach(function (s) {
        var gable = new T.Shape();
        gable.moveTo(-Z, 0); gable.lineTo(Z, 0); gable.lineTo(0, RIDGE - H); gable.lineTo(-Z, 0);
        var g = new T.ExtrudeGeometry(gable, { depth: 0.1, bevelEnabled: false });
        kit.piece(g, at(s * X - (s > 0 ? 0 : 0.1), H, 0, Math.PI / 2), '--bgh-plank', false);
      });

      // THE TREE, up through the floor and out through the roof, its west side
      // catching the sun, and one limb across under the roof.
      kit.cyl(0.42, 0.55, 14, at(TX, 0.5, TZ), '--bgh-trunk', 0.04, 14);
      var limbPts = [new T.Vector3(TX, 1.9, TZ), new T.Vector3(TX - 1.2, 2.25, TZ - 0.8), new T.Vector3(TX - 2.4, 2.35, TZ - 1.6), new T.Vector3(-X - 0.4, 2.2, -Z + 0.3)];
      kit.piece(new T.TubeGeometry(new T.CatmullRomCurve3(limbPts), 20, 0.13, 8, false), new T.Matrix4(), '--bgh-trunk', 0.03);
      // A ring of boards round the trunk where it comes through the floor.
      kit.cyl(0.62, 0.62, 0.05, at(TX, 0.025, TZ), '--bgh-grain', false, 18);

      // THE GROVE outside every window: leaves in every colour autumn has,
      // trunks going down out of sight, and the sky between.
      var LEAVES = ['--bgh-gold', '--bgh-amber', '--bgh-crimson', '--bgh-gold', '--bgh-amber', '--bgh-moss'];
      var blob = new T.IcosahedronGeometry(1, 1);
      for (var k = 0; k < 90; k++) {
        var a = hash(k, 1, 1) * Math.PI * 2, d = 6.8 + hash(k, 1, 2) * 9, y = -2 + hash(k, 1, 3) * 8;
        var g2 = blob.clone(), s2 = 0.8 + hash(k, 1, 4) * 1.1; g2.scale(s2, s2 * 0.8, s2);
        kit.piece(g2, at(Math.cos(a) * d, y, Math.sin(a) * d, k), LEAVES[k % LEAVES.length], 0.05);
      }
      // The tree's own crown over the roof.
      for (k = 0; k < 14; k++) {
        var ca = hash(k, 2, 1) * Math.PI * 2, cd = hash(k, 2, 2) * 2.8;
        var g3 = blob.clone(), s3 = 1.2 + hash(k, 2, 3) * 0.9; g3.scale(s3, s3 * 0.75, s3);
        kit.piece(g3, at(TX + Math.cos(ca) * cd, RIDGE + 2.2 + hash(k, 2, 4) * 2.2, TZ + Math.sin(ca) * cd, k), LEAVES[(k + 2) % LEAVES.length], 0.05);
      }
      for (k = 0; k < 12; k++) {
        var ta = hash(k, 3, 1) * Math.PI * 2, td = 6 + hash(k, 3, 2) * 8;
        kit.cyl(0.18, 0.28, 18, at(Math.cos(ta) * td, -2, Math.sin(ta) * td), '--bgh-grain', 0.03, 8);
      }
      // The grove floor far down, deep in fallen leaves, seen through the hatch.
      box(60, 0.1, 60, at(0, -6.5, 0), '--bgh-amber', false, false);

      // THE PLATFORM outside the door, its rail, and the leaves right up to it.
      box(X * 2, 0.12, 1.6, at(0, -0.06, Z + 0.8), '--bgh-plank');
      box(X * 2, 0.06, 0.06, at(0, 1.0, Z + 1.55), '--bgh-trunk', false);
      for (var p = -X + 0.2; p <= X; p += 0.6) box(0.06, 1.0, 0.06, at(p, 0.5, Z + 1.55), '--bgh-trunk', false);

      // BEN, the tiny black dog, on his cushion by the door.
      var bx = 1.95, bz = Z - 0.55;
      kit.cyl(0.42, 0.42, 0.1, at(bx, 0.05, bz), '--bgh-amber', 0.02, 18);
      var body = new T.SphereGeometry(0.16, 12, 8); body.scale(1.5, 0.85, 0.9);
      kit.piece(body, at(bx, 0.24, bz, 0.4), '--bgh-ben', 0.015);
      kit.piece(new T.SphereGeometry(0.1, 10, 8), at(bx - 0.2, 0.33, bz + 0.1, 0.4), '--bgh-ben', 0.015);
      [-1, 1].forEach(function (s) {
        var ear = new T.ConeGeometry(0.035, 0.08, 6);
        kit.piece(ear, at(bx - 0.21 + s * 0.04, 0.43, bz + 0.1 + s * 0.04, 0, 0, s * 0.3), '--bgh-ben', false);
      });
      var tail = new T.CylinderGeometry(0.02, 0.012, 0.16, 6);
      kit.piece(tail, at(bx + 0.24, 0.32, bz - 0.06, 0, 0, -0.7), '--bgh-ben', false);

      // A cushion by the west window, in the sun.
      box(1.2, 0.18, 0.7, at(-X + 0.55, 0.09, -0.35), '--bgh-crimson');

      // THE SHELF ON THE EAST WALL, and the song's own card on it, lifted off
      // the page: it plays here as it does there.
      var page = kit.screen(1180, 800, 2.0, at(2.0, 1.3, -Z + 0.07), 'The Bough House’s own page, on the north wall', [-X, X, -Z, Z]);
      box(1.6, 0.05, 0.3, at(X - 0.2, 0.85, 1.6, -Math.PI / 2), '--bgh-trunk');
      var song = kit.lift(page, '.bgh-part', { n: 2, drop: '.hlink', w: 760, ww: 1.5, m: at(X - 0.08, 0.9, 1.6, -Math.PI / 2), zone: [-X, X, -Z, Z] });

      return {
        start: { x: hx, z: hz - 0.9, yaw: 0 },
        bounds: { x: [-X + 0.4, X - 0.4], z: [-Z + 0.4, Z + 1.3] },
        stops: [
          { name: 'at the top of the ladder, up through the hatch', x: hx, z: hz - 0.9, yaw: 0 },
          { name: 'by the trunk, where the tree comes up through the floor', x: TX - 1.2, z: TZ - 1.2, yaw: -Math.PI * 0.75 },
          { name: 'at the west window, where the last sun comes in', x: -X + 1.6, z: -0.35, yaw: Math.PI / 2 },
          { name: 'at the north wall, with the room’s own page on it', x: 2.0, z: -Z + 2.0, yaw: 0, page: kit.page, frame: page },
          { name: 'at the shelf, with the one song on repeat', x: X - 1.55, z: 1.6, yaw: -Math.PI / 2, frame: song.el },
          { name: 'by Ben, on his cushion at the door', x: 1.2, z: Z - 1.4, yaw: Math.PI * 0.85 },
          { name: 'out on the platform, up among the leaves', x: 0.9, z: Z + 0.9, yaw: Math.PI }
        ]
      };
    }
  };
})();

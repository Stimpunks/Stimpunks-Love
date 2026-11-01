/* =============================================================================
   The Honesty Box, walked up to on Cel Street. Ryan's ask, 2026-10-31: back on
   the street, working down it a room at a time.

   IT IS THE HONESTY BOX'S WORLD AND NOBODY ELSE'S (§110): a farm stand at the
   kerb at night, a counter with a little roof and a panel on it, and ONE WHITE
   LAMP under the eave throwing a cone of light over the shelves. Everything in
   the cone keeps its own colour, the pepper red and the marigold orange; the
   street round it is a dark olive night and goes black a step past the kerb.
   That one white lamp is what keeps it off Danny the Street, whose sodium leaves
   nothing a colour of its own, and off Nothing For Sale, the other table by a
   road at night, lit by everybody's headlights at once and every shadow
   multiplied: here there is one cone and one shadow under each thing. There is
   no window and no room, only a counter you walk up to, which keeps it off The
   Small Hours.

   THE PRICES ARE THE PAGE'S, lifted off it by the kit: the painted board
   leaning on its post is the page's own board, every item and every price as
   the page has them, and nothing on the stand is labelled or priced here. How
   the box works and what is not in it are pinned to the stand's two ends, and
   the page itself is on a post by the kerb. What is drawn on the shelves is
   what the board sells, in the inks the room declares for it: corn, squash,
   peppers, tomatoes, herbs, marigolds, eggs, wool, nuts, rope, cloth and seed.
   Nothing from the sanctuary, no cannabis and no raw milk, because none is on
   the board; the fridge and the freezer stay shut.

   NOTHING MOVES. Every colour is one the room declares, by name. It keeps
   nothing, sends nothing and fetches nothing; its page arrives through Cel
   Street's screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['the-honesty-box.html'] = {
    name: 'The Honesty Box',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var ball = function (r, m, ink, line) { kit.piece(new T.SphereGeometry(r, 12, 8), m, ink, line === undefined ? 0.004 : line); };

      // THE STAND: a counter at the kerb, its front facing the road, posts at
      // its corners and a little pitched roof.
      var SZ = -4.15, FZ = -3.55, BZ = -4.75, SX = 1.42, TOP = 0.95;

      // THE NIGHT, and the one lamp. A little of the dark sky on everything,
      // and the cone straight down from under the eave over the shelves.
      kit.scene.background = kit.col('--hbx-night');
      kit.scene.add(new T.HemisphereLight(kit.col('--hbx-fog'), kit.col('--hbx-night'), 0.42));
      var lamp = new T.SpotLight(kit.col('--hbx-lamp'), 22, 7.5, 0.95, 0.55, 1.25);
      lamp.position.set(0, 2.12, FZ - 0.12);
      lamp.target.position.set(0, 0.6, SZ - 0.25);
      lamp.castShadow = true;
      lamp.shadow.mapSize.set(1024, 1024);
      lamp.shadow.bias = -0.0008; lamp.shadow.normalBias = 0.02;
      kit.scene.add(lamp, lamp.target);

      // THE STREET: the pavement the stand is on, the pale kerb, and the road
      // behind you going black. A hedge behind the stand, out of the light.
      box(16, 0.1, 6.4, at(0, -0.05, -4.2), '--hbx-kerb', false, false);
      box(16, 0.14, 0.22, at(0, -0.03, -1.0), '--hbx-kerb-edge', 0.01);
      box(16, 0.1, 9, at(0, -0.17, 3.6), '--hbx-night', false, false);
      box(16, 1.3, 0.8, at(0, 0.65, -7.2), '--hbx-leaf', 0.02);
      box(16, 0.1, 4, at(0, -0.05, -9.2), '--hbx-night', false, false);

      // The counter, its legs, and the end walls between it and the roof.
      box(2.9, 0.06, 1.25, at(0, TOP, SZ), '--hbx-wood', 0.015);
      [[-1, FZ + 0.05], [1, FZ + 0.05], [-1, BZ - 0.05], [1, BZ - 0.05]].forEach(function (c) {
        box(0.08, 2.22, 0.08, at(c[0] * SX, 1.11, c[1]), '--hbx-wood', 0.012);
      });
      [-1, 1].forEach(function (s) { box(0.04, 1.2, 1.18, at(s * SX, TOP + 0.62, SZ), '--hbx-wood', 0.012); });
      // The back of the stand, and the shelf over the counter.
      box(2.8, 1.25, 0.04, at(0, TOP + 0.62, BZ), '--hbx-wood', 0.012);
      var SH = 1.36;
      box(2.76, 0.04, 0.42, at(0, SH - 0.02, BZ + 0.24), '--hbx-wood', 0.01);

      // THE ROOF, two slopes on the posts, and the panel on the slope that
      // faces the road, so you can see it from the kerb.
      var a = 0.45, ridge = 2.6;
      box(3.1, 0.05, 0.86, at(0, ridge - 0.18, SZ + 0.38, 0, a), '--hbx-roof', 0.015);
      box(3.1, 0.05, 0.86, at(0, ridge - 0.18, SZ - 0.38, 0, -a), '--hbx-roof', 0.015);
      box(3.12, 0.07, 0.07, at(0, ridge, SZ), '--hbx-roof', 0.01);
      var nY = Math.cos(a) * 0.04, nZ = Math.sin(a) * 0.04;
      box(2.1, 0.025, 0.6, at(0, ridge - 0.18 + nY, SZ + 0.38 + nZ, 0, a), '--hbx-pv', 0.008);
      for (var c = -3; c <= 3; c++) box(0.012, 0.03, 0.6, at(c * 0.3, ridge - 0.17 + nY, SZ + 0.38 + nZ, 0, a), '--hbx-post', false);
      // The fascia under the front eave, and the lamp under it.
      box(2.95, 0.12, 0.04, at(0, 2.18, FZ + 0.02), '--hbx-wood', 0.01);
      box(0.22, 0.06, 0.14, at(0, 2.12, FZ - 0.12), '--hbx-post', 0.008);
      kit.flat(new T.CircleGeometry(0.06, 16), at(0, 2.088, FZ - 0.12, 0, Math.PI / 2), '--hbx-lamp');
      // The cone itself, faint in the night air, as the page draws it.
      var coneGeo = new T.CylinderGeometry(0.06, 1.55, 1.12, 28, 1, true);
      var cone = new T.Mesh(coneGeo, new T.MeshBasicMaterial({ color: kit.col('--hbx-lamp'), transparent: true, opacity: 0.06, depthWrite: false, side: T.DoubleSide }));
      cone.position.set(0, 1.52, FZ - 0.35);
      cone.updateMatrix(); cone.matrixAutoUpdate = false;
      kit.scene.add(cone);

      // UNDER THE COUNTER: the fridge and the freezer, shut, and the battery the
      // panel charges, with its cable up the back post.
      box(0.7, 0.78, 0.6, at(-0.7, 0.43, SZ - 0.05), '--hbx-fridge', 0.012);
      box(0.012, 0.6, 0.012, at(-0.42, 0.48, SZ + 0.26), '--hbx-post', false);
      box(1.0, 0.62, 0.6, at(0.3, 0.35, SZ - 0.05), '--hbx-fridge', 0.012);
      box(1.0, 0.02, 0.02, at(0.3, 0.6, SZ + 0.26), '--hbx-post', false);
      box(0.32, 0.28, 0.28, at(1.12, 0.18, SZ - 0.1), '--hbx-battery', 0.01);
      [-0.08, 0.08].forEach(function (x) { cyl(0.02, 0.02, 0.04, at(1.12 + x, 0.34, SZ - 0.1), '--hbx-post', false, 8); });
      cyl(0.008, 0.008, 2.0, at(SX - 0.05, 1.3, BZ - 0.02), '--hbx-ink', false, 6);

      // ON THE TOP SHELF: what came in from the fields.
      var y1 = SH, z1 = BZ + 0.24;
      // Corn, four ears, and their husks.
      [0, 1, 2, 3].forEach(function (i) {
        var m = at(-1.12 + (i % 2) * 0.05, y1 + 0.04 + Math.floor(i / 2) * 0.06, z1 - 0.1 + i * 0.06, 0, 0, Math.PI / 2);
        cyl(0.034, 0.03, 0.22, m, '--hbx-corn', 0.005, 12);
        kit.piece(new T.ConeGeometry(0.03, 0.09, 8), M(m, at(0, -0.15, 0, 0, Math.PI)), '--hbx-leaf', 0.004);
      });
      // A squash or two.
      [[-0.78, -0.06, 0.085], [-0.66, 0.08, 0.07]].forEach(function (q) {
        kit.piece(new T.SphereGeometry(q[2], 14, 10).scale(1.25, 0.85, 1), at(q[0], y1 + q[2] * 0.85, z1 + q[1]), '--hbx-squash', 0.005);
        cyl(0.012, 0.016, 0.05, at(q[0], y1 + q[2] * 1.65, z1 + q[1]), '--hbx-wood', false, 6);
      });
      // A shallow basket of beans, one of jalapeños, a cup of chiltepins, a pint
      // of cherry tomatoes.
      function basket(x, z, r, fill, n, br) {
        cyl(r, r * 0.86, 0.07, at(x, y1 + 0.035, z), '--hbx-wood', 0.006, 14);
        for (var k = 0; k < n; k++) {
          var t = k * 2.39996, rr = r * 0.7 * Math.sqrt((k + 0.5) / n);
          ball(br, at(x + Math.cos(t) * rr, y1 + 0.08, z + Math.sin(t) * rr), fill, false);
        }
      }
      basket(-0.4, z1, 0.11, '--hbx-leaf', 14, 0.024);
      basket(-0.1, z1, 0.11, '--hbx-leaf', 9, 0.03);
      cyl(0.055, 0.045, 0.06, at(0.15, y1 + 0.03, z1 + 0.06), '--hbx-post', 0.005, 12);
      for (var p = 0; p < 7; p++) ball(0.012, at(0.15 + Math.cos(p * 2.4) * 0.025 * Math.sqrt(p), y1 + 0.065, z1 + 0.06 + Math.sin(p * 2.4) * 0.025 * Math.sqrt(p)), '--hbx-pepper', false);
      basket(0.38, z1, 0.1, '--hbx-pepper', 12, 0.026);
      // Bunches of basil and dill, laid down, and a bag of salad leaves.
      [[0.66, -0.06], [0.7, 0.08]].forEach(function (b, i) {
        cyl(0.006, 0.006, 0.16, at(b[0] + 0.04, y1 + 0.02, z1 + b[1], 0, 0, Math.PI / 2), '--hbx-leaf', false, 5);
        for (var k = 0; k < 6; k++) ball(0.028 - i * 0.006, at(b[0] - 0.06 + (k % 3) * 0.025, y1 + 0.035 + Math.floor(k / 3) * 0.02, z1 + b[1] + ((k % 2) - 0.5) * 0.03), '--hbx-leaf', 0.003);
      });
      box(0.14, 0.12, 0.08, at(0.9, y1 + 0.06, z1 - 0.06), '--hbx-cloth', 0.005);
      for (var s = 0; s < 4; s++) ball(0.03, at(0.86 + (s % 2) * 0.06, y1 + 0.13, z1 - 0.06 + (s > 1 ? 0.02 : -0.02)), '--hbx-leaf', 0.003);
      // Marigolds in a tin, and a bunch of whatever came up in the gardens.
      cyl(0.07, 0.06, 0.14, at(1.12, y1 + 0.07, z1 - 0.02), '--hbx-post', 0.006, 14);
      for (var f = 0; f < 7; f++) {
        var fx = 1.12 + Math.cos(f * 2.4) * 0.04, fz = z1 - 0.02 + Math.sin(f * 2.4) * 0.04, fy = y1 + 0.24 + (f % 3) * 0.03;
        cyl(0.004, 0.004, 0.14, at(fx, fy - 0.07, fz), '--hbx-leaf', false, 5);
        ball(0.026, at(fx, fy, fz), '--hbx-marigold', 0.003);
      }
      ['--hbx-corn', '--hbx-pepper', '--hbx-squash', '--hbx-egg', '--hbx-marigold'].forEach(function (ink, i) {
        var x = 0.98 + (i % 3) * 0.03, z = z1 + 0.12 + Math.floor(i / 3) * 0.03;
        cyl(0.004, 0.004, 0.12, at(x, y1 + 0.04, z + 0.04, 0, -1.2), '--hbx-leaf', false, 5);
        ball(0.018, at(x, y1 + 0.03, z - 0.02), ink, 0.003);
      });

      // ON THE COUNTER: the eggs, the wool, the rope, the cloth, the nuts and the
      // seed; and at the right-hand end the box itself, the tin and the book.
      var y0 = TOP + 0.03, zc = SZ + 0.15;
      // Two boxes of eggs, lids up.
      [-1.18, -0.98].forEach(function (x) {
        box(0.16, 0.05, 0.3, at(x, y0 + 0.025, zc), '--hbx-carton', 0.005);
        box(0.16, 0.12, 0.02, at(x, y0 + 0.1, zc - 0.16, 0, -0.3), '--hbx-carton', 0.005);
        for (var e = 0; e < 6; e++) kit.piece(new T.SphereGeometry(0.024, 10, 8).scale(1, 1.25, 1), at(x + (e % 2 - 0.5) * 0.06, y0 + 0.06, zc - 0.11 + Math.floor(e / 2) * 0.1), '--hbx-egg', 0.003);
      });
      // Skeins of wool, and a hat.
      [[-0.7, 0], [-0.58, 0.12], [-0.72, 0.14]].forEach(function (w) {
        kit.piece(new T.TorusGeometry(0.06, 0.028, 8, 16).scale(1.3, 1, 1), at(-0.05 + w[0], y0 + 0.03, zc + w[1] - 0.1, 0, Math.PI / 2), '--hbx-wool', 0.004);
      });
      kit.piece(new T.SphereGeometry(0.08, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), at(-0.55, y0, zc - 0.18), '--hbx-wool', 0.004);
      // A coil of hemp cordage, and cloth folded.
      [0, 1, 2].forEach(function (k) { kit.piece(new T.TorusGeometry(0.075 - k * 0.006, 0.012, 6, 20), at(-0.3, y0 + 0.012 + k * 0.022, zc, 0, Math.PI / 2), '--hbx-rope', 0.003); });
      [0, 1, 2].forEach(function (k) { box(0.2, 0.03, 0.16, at(-0.04, y0 + 0.015 + k * 0.032, zc + 0.02, k * 0.08), '--hbx-cloth', 0.004); });
      // Bags of walnuts and hazelnuts.
      [[0.22, -0.04], [0.32, 0.08]].forEach(function (n) {
        cyl(0.06, 0.07, 0.13, at(n[0], y0 + 0.065, zc + n[1]), '--hbx-bag', 0.005, 10);
        kit.piece(new T.ConeGeometry(0.035, 0.05, 8), at(n[0], y0 + 0.155, zc + n[1]), '--hbx-bag', 0.004);
      });
      // Packets of chaos garden seed, standing in a little tray.
      box(0.2, 0.03, 0.08, at(0.55, y0 + 0.015, zc - 0.12), '--hbx-wood', 0.004);
      [0, 1, 2].forEach(function (k) { box(0.055, 0.09, 0.008, at(0.49 + k * 0.06, y0 + 0.07, zc - 0.12 + (k - 1) * 0.01), '--hbx-packet', 0.003); });

      // THE BOX, its slot and padlock; the tin of change; the book.
      var bx = 0.92, bz = zc - 0.02;
      box(0.26, 0.2, 0.2, at(bx, y0 + 0.1, bz), '--hbx-wood', 0.008);
      box(0.13, 0.008, 0.022, at(bx, y0 + 0.201, bz - 0.03), '--hbx-ink', false);
      box(0.05, 0.05, 0.02, at(bx, y0 + 0.11, bz + 0.105), '--hbx-post', 0.004);
      kit.piece(new T.TorusGeometry(0.016, 0.004, 6, 12, Math.PI), at(bx, y0 + 0.135, bz + 0.105), '--hbx-post', false);
      cyl(0.06, 0.06, 0.07, at(bx + 0.24, y0 + 0.035, bz - 0.05), '--hbx-post', 0.005, 16);
      box(0.18, 0.03, 0.24, at(bx + 0.26, y0 + 0.015, bz + 0.17, -0.3), '--hbx-paint', 0.004);
      box(0.17, 0.008, 0.23, at(bx + 0.26, y0 + 0.034, bz + 0.17, -0.3), '--hbx-board', false);

      // THE PAGE'S OWN WORDS. Its page on a post by the kerb; its board of
      // prices leaning on a post on the other side; its rules on the stand's two
      // ends; its name on a sign along the ridge.
      var pw = 1.6, ph = pw * 800 / 1180, py = 0.8 + ph / 2, PX = -2.75, PZ = -2.4;
      box(0.08, py + ph / 2, 0.08, at(PX, (py + ph / 2) / 2, PZ - 0.08), '--hbx-post', 0.01);
      box(pw + 0.12, ph + 0.12, 0.05, at(PX, py, PZ - 0.04), '--hbx-wood', 0.01);
      var frame = kit.screen(1180, 800, pw, at(PX, py, PZ), 'The Honesty Box’s own page, on a post by the kerb');

      var BX = 2.75, BZd = -2.35, lean = -0.08;
      box(0.08, 2.05, 0.08, at(BX + 0.62, 1.02, BZd - 0.25), '--hbx-post', 0.01);
      box(1.22, 1.72, 0.04, at(BX, 1.08, BZd - 0.06, 0, lean), '--hbx-wood', 0.01);
      var board = kit.lift(frame, '.hbx-part', { n: 1, w: 640, h: 760, ww: 1.1, m: at(BX, 0.4, BZd, 0, lean) });

      // The two ends' cards show only from beside their end, so neither is seen
      // backwards through the stand from the counter.
      var how = kit.lift(frame, '.hbx-how', { w: 560, h: 520, ww: 1.05, m: at(SX + 0.03, TOP + 0.12, SZ, LEFT), zone: [1.6, 6, -6, -2.9] });
      var not = kit.lift(frame, '.hbx-not', { w: 560, h: 560, ww: 1.05, m: at(-SX - 0.03, TOP + 0.08, SZ, RIGHT), zone: [-6, -1.6, -6, -2.9] });
      kit.lift(frame, '.hbx-head', { w: 900, ww: 1.9, m: at(0, ridge + 0.06, SZ + 0.02), zone: [-6, 6, -2.2, 2] });

      return {
        start: { x: -0.9, z: -0.3, yaw: 0.18 },
        bounds: { areas: [
          { x: [-5, 5], z: [-3.2, 1.4] },
          { x: [-5, -1.75], z: [-5.4, -3.0] },
          { x: [1.75, 5], z: [-5.4, -3.0] }
        ] },
        stops: [
          { name: 'on the pavement by the kerb, the stand’s lamp the only light on the street', x: -0.9, z: -0.3, yaw: 0.18 },
          { name: 'at the counter, under the lamp, everything in its cone keeping its own colour', x: 0, z: -2.55, yaw: 0, pitch: -0.32 },
          { name: 'at the box with its slot, the tin of change and the book beside it', x: 0.92, z: -2.3, yaw: 0, pitch: -0.45 },
          { name: 'under the eave, looking up at the lamp', x: 0, z: -2.95, yaw: 0, pitch: 0.6 },
          { name: 'at the painted board leaning on its post, with every price on it', x: BX, z: -1.05, yaw: 0, pitch: -0.18, frame: board.el },
          { name: 'at the right-hand end of the stand, with how the box works', x: 2.6, z: SZ, yaw: LEFT, pitch: -0.05, frame: how.el },
          { name: 'at the left-hand end of the stand, with what is not in the box', x: -2.6, z: SZ, yaw: RIGHT, pitch: -0.05, frame: not.el },
          { name: 'at the post by the kerb, with the stand’s own page on it', x: PX, z: -0.45, yaw: 0, pitch: 0.05, page: kit.page, frame: frame },
          { name: 'standing back in the road, the whole stand in its cone and its name along the ridge', x: 0, z: 1.3, yaw: 0, pitch: 0.12 },
          { name: 'looking back across the dark road', x: 0, z: -1.3, yaw: Math.PI, pitch: 0 }
        ]
      };
    }
  };
})();

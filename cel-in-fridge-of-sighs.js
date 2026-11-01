/* =============================================================================
   The Fridge of Sighs, walked into on Cel Street. Ryan's ask, 2026-10-31: back
   on the street, working down it a room at a time.

   IT IS THE FRIDGE OF SIGHS' WORLD AND NOBODY ELSE'S (§85): a kitchen, and the
   door of its fridge, in turquoise enamel. THE LIGHT IS THE WINDOW BEHIND YOU,
   SEEN IN THE ENAMEL: the kitchen window is in the wall at your back, and what
   you see of it is one soft, pale, upright band lying down the fridge's glossy
   doors, drawn flat because a reflection is not lit by anything. Nothing in
   the room is cut open and nothing in it is yellow (Vital Plant Living, the
   street's other kitchen, is a section on a turmeric wall); there is no type,
   no metal and no workshop (the Foundry); and nothing lines the magnets up (the
   Adventurer's Guild).

   THE MAGNETS ON THE DOOR CARRY NO WORDS. The words are the community's,
   put up one at a time on the room's own page, which hangs on the left-hand
   wall and is the real door: putting a word up works there, because fridge.js
   talks to the CB and is never wired here, and no sentence is copied into the
   scene. What is lifted is only what never changes: the fridge's own name,
   spelt in magnets on the freezer door, and how the door works, on the wall.
   The magnets sit straight and land at uneven heights, the way a hand leaves
   them, because nothing in §85 is rotated.

   NOTHING MOVES. Every colour is one the Fridge of Sighs declares, by name. It
   keeps nothing, sends nothing and fetches nothing; its page arrives through
   Cel Street's screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['fridge-of-sighs.html'] = {
    name: 'The Fridge of Sighs',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var W = 10, D = 9, H = 3.0, back = -D;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;

      // THE KITCHEN'S DAYLIGHT, from the window at your back: soft and from
      // behind, so the fridge's front takes it full and casts its shadow back
      // against the wall.
      kit.scene.background = kit.col('--fos-dim');
      kit.scene.add(new T.HemisphereLight(kit.col('--fos-tile'), kit.col('--fos-dim'), 1.4));
      var day = new T.DirectionalLight(kit.col('--fos-tile'), 1.3);
      day.position.set(0.5, 2.5, -0.4);
      day.target.position.set(0, 0.8, back);
      day.castShadow = true;
      day.shadow.mapSize.set(1024, 1024);
      day.shadow.camera.left = -6; day.shadow.camera.right = 6;
      day.shadow.camera.top = 4; day.shadow.camera.bottom = -2;
      day.shadow.bias = -0.002; day.shadow.normalBias = 0.08;
      kit.scene.add(day, day.target);

      // THE ROOM: a dark linoleum floor, pale tiled walls, a cream ceiling.
      box(W, 0.1, D + 0.4, at(0, -0.05, -D / 2), '--fos-dim', false, false);
      box(0.3, H, D, at(-W / 2 - 0.15, H / 2, -D / 2), '--fos-chrome');
      box(0.3, H, D, at(W / 2 + 0.15, H / 2, -D / 2), '--fos-chrome');
      box(W + 0.6, H, 0.3, at(0, H / 2, back - 0.15), '--fos-chrome');
      box(W + 0.6, 0.2, D + 0.6, at(0, H + 0.1, -D / 2), '--fos-tile', false, false);
      [[-W / 2 + 0.02, -D / 2, LEFT, D], [W / 2 - 0.02, -D / 2, RIGHT, D], [0, back + 0.02, 0, W]].forEach(function (w) {
        box(w[3], 0.14, 0.04, at(w[0], 0.07, w[1], w[2]), '--fos-edge', false);
      });

      // THE WALL AT YOUR BACK, with the kitchen window in it: the window the
      // fridge's enamel shows you, the one light in here.
      var ww = 2.0, wh = 1.3, wy = 1.0;
      box((W - ww) / 2 + 0.3, H, 0.3, at(-(W + ww) / 4 - 0.075, H / 2, 0.15), '--fos-chrome');
      box((W - ww) / 2 + 0.3, H, 0.3, at((W + ww) / 4 + 0.075, H / 2, 0.15), '--fos-chrome');
      box(ww, wy, 0.3, at(0, wy / 2, 0.15), '--fos-chrome');
      box(ww, H - wy - wh, 0.3, at(0, (wy + wh + H) / 2, 0.15), '--fos-chrome');
      kit.flat(new T.PlaneGeometry(ww, wh), at(0, wy + wh / 2, 0.28, 0, Math.PI), '--fos-sheen');
      box(ww + 0.12, 0.06, 0.12, at(0, wy, 0.04), '--fos-tile', 0.01);
      box(ww + 0.12, 0.06, 0.12, at(0, wy + wh, 0.04), '--fos-tile', 0.01);
      [-1, 0, 1].forEach(function (s) { box(0.06, wh, 0.1, at(s * ww / 2, wy + wh / 2, 0.06), '--fos-tile', 0.01); });

      // THE FRIDGE, on the back wall: one closed door seen straight on, the
      // freezer over it with the seam between, chrome handles, a kickplate.
      var FW = 1.25, FH = 2.3, FD = 0.75, FZ = back + 0.4, front = FZ + FD / 2;
      box(FW, FH, FD, at(0, FH / 2, FZ), '--fos-door', 0.02);
      box(FW - 0.04, 0.1, 0.04, at(0, 0.05, front + 0.01), '--fos-edge', false);
      box(FW + 0.01, 0.05, 0.03, at(0, 1.62, front + 0.005), '--fos-edge', false);
      cyl(0.022, 0.022, 0.7, at(FW / 2 - 0.12, 1.05, front + 0.06), '--fos-chrome', 0.006, 10);
      cyl(0.022, 0.022, 0.38, at(FW / 2 - 0.12, 1.86, front + 0.06), '--fos-chrome', 0.006, 10);
      [0.72, 1.38, 1.7, 2.02].forEach(function (y) {
        box(0.03, 0.03, 0.06, at(FW / 2 - 0.12, y, front + 0.03), '--fos-chrome', false);
      });

      // THE WINDOW AT YOUR BACK, lying down the enamel: one soft, pale,
      // upright band on each door, a little right of the middle, flat because
      // it is a reflection and nothing lights it.
      kit.flat(new T.PlaneGeometry(0.16, 1.36), at(0.16, 0.86, front + 0.004), '--fos-sheen');
      kit.flat(new T.PlaneGeometry(0.16, 0.6), at(0.16, 1.96, front + 0.004), '--fos-sheen');

      // THE MAGNETS, with no words on them: straight, at uneven heights, where
      // a hand left them. Their words are on the room's own page.
      [
        [-0.44, 1.38, 0.13], [-0.27, 1.36, 0.1], [-0.12, 1.39, 0.15], [0.05, 1.37, 0.09], [0.2, 1.4, 0.12],
        [-0.46, 1.22, 0.1], [-0.31, 1.24, 0.16], [-0.12, 1.21, 0.08], [0.0, 1.23, 0.12], [0.18, 1.2, 0.14],
        [-0.42, 1.05, 0.16], [-0.22, 1.07, 0.09], [-0.08, 1.04, 0.12], [0.09, 1.06, 0.1],
        [-0.45, 0.88, 0.09], [-0.31, 0.9, 0.13], [-0.13, 0.87, 0.1], [0.03, 0.91, 0.15], [0.21, 0.89, 0.08],
        [-0.38, 0.7, 0.14], [-0.19, 0.72, 0.1], [-0.03, 0.69, 0.12],
        [-0.44, 0.5, 0.1], [-0.28, 0.53, 0.12], [-0.1, 0.51, 0.09]
      ].forEach(function (g) {
        box(g[2], 0.05, 0.012, at(g[0], g[1], front + 0.008), '--fos-tile', 0.004);
      });

      // THE FRIDGE'S NAME, spelt in magnets on the freezer door, lifted off
      // the page: the one run of words in the scene, and nobody's sentence.
      var page;
      var pw = 2.8, ph = pw * 800 / 1180, py = 0.85 + ph / 2;
      var pg = at(-W / 2 + 0.02, 0, -4.8, LEFT);
      box(pw + 0.16, ph + 0.16, 0.05, M(pg, at(0, py, 0)), '--fos-edge', 0.012);
      page = kit.screen(1180, 800, pw, M(pg, at(0, py, 0.04)), 'The Fridge of Sighs’ own page, the real door, on the left-hand wall');
      var name = kit.lift(page, '.fos-name', { w: 560, ww: 0.95, m: at(-0.06, 1.7, front + 0.012) });

      // COUNTERS either side of the fridge, cupboards under them, and the
      // kitchen's sink on the right.
      [-1, 1].forEach(function (s) {
        var cx = s * (FW / 2 + 1.25);
        box(2.3, 0.86, 0.62, at(cx, 0.43, back + 0.33), '--fos-edge', 0.015);
        box(2.36, 0.05, 0.68, at(cx, 0.885, back + 0.35), '--fos-tile', 0.01);
        [-0.57, 0.57].forEach(function (d) {
          box(0.02, 0.6, 0.02, at(cx + d, 0.45, back + 0.65), '--fos-dim', false);
          box(0.08, 0.02, 0.03, at(cx + d + (d < 0 ? 0.08 : -0.08), 0.7, back + 0.66), '--fos-chrome', false);
        });
      });
      box(0.7, 0.04, 0.42, at(FW / 2 + 1.4, 0.89, back + 0.36), '--fos-chrome', 0.008);
      cyl(0.015, 0.015, 0.3, at(FW / 2 + 1.4, 1.06, back + 0.14), '--fos-chrome', 0.004, 8);
      box(0.03, 0.03, 0.18, at(FW / 2 + 1.4, 1.2, back + 0.22), '--fos-chrome', false);

      // HOW THE DOOR WORKS, on the right-hand wall: words that never change.
      var rules = kit.lift(page, '.fos-rules', { w: 620, h: 600, ww: 1.6, m: at(W / 2 - 0.02, 0.85, -4.8, RIGHT) });

      // A SMALL KITCHEN TABLE and two chairs, in the room's dark teal.
      var tz = -4.2;
      cyl(0.05, 0.05, 0.72, at(1.2, 0.36, tz), '--fos-edge', 0.008, 10);
      cyl(0.3, 0.34, 0.03, at(1.2, 0.015, tz), '--fos-edge', false, 16);
      cyl(0.48, 0.48, 0.04, at(1.2, 0.74, tz), '--fos-tile', 0.01, 28);
      [[0.55, 0.4], [1.85, -0.4]].forEach(function (c) {
        var cg = at(c[0], 0, tz + c[1], c[0] < 1.2 ? Math.PI / 2 : -Math.PI / 2);
        box(0.42, 0.04, 0.42, M(cg, at(0, 0.45, 0)), '--fos-edge', 0.01);
        box(0.42, 0.45, 0.04, M(cg, at(0, 0.7, -0.19)), '--fos-edge', 0.01);
        [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].forEach(function (l) {
          cyl(0.015, 0.015, 0.45, M(cg, at(l[0], 0.22, l[1])), '--fos-dim', false, 6);
        });
      });

      var stops = [
        { where: 'Just inside the kitchen', name: 'just inside the kitchen, the fridge straight ahead and the window at your back lying down its door', x: 0, z: -1.2, yaw: 0, pitch: 0.06 },
        { where: 'At the fridge door', name: 'at the fridge door, its magnets with no words on them and the window at your back in the enamel', x: 0, z: front + 1.9, yaw: 0, pitch: 0.04 },
        { where: 'At the freezer door', name: 'at the freezer door, with the fridge’s own name in magnets', x: -0.06, z: front + 1.3, yaw: 0, pitch: 0.42, frame: name.el },
        { where: 'At the real door, the room’s own page', name: 'at the left-hand wall, with the room’s own page on it, where the words go up', x: -W / 2 + 2.6, z: -4.8, yaw: LEFT, pitch: 0.1, page: kit.page, frame: page },
        { where: 'At how the door works', name: 'at the right-hand wall, with how the door works', x: W / 2 - 1.9, z: -4.8, yaw: RIGHT, pitch: 0.12, frame: rules.el },
        { where: 'At the kitchen table', name: 'at the kitchen table, looking at the fridge across the room', x: 2.4, z: -2.2, yaw: Math.atan2(2.4, -(FZ + 2.2)), pitch: 0.04 }
      ];

      return {
        start: { x: 0, z: -1.2, yaw: 0 },
        bounds: { x: [-W / 2 + 1.0, W / 2 - 1.0], z: [back + 1.6, -0.6] },
        stops: stops
      };
    }
  };
})();

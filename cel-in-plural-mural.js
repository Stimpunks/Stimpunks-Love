/* =============================================================================
   Plural Mural, walked into on Cel Street. Ryan's ask, 2026-10-31: back on the
   street, working down it a room at a time.

   IT IS PLURAL MURAL'S WORLD AND NOBODY ELSE'S (§54): an end wall on the street
   seen from across the road at golden hour, OUTDOORS, the sun low and BEHIND
   you and square on, so every mural is at its full colour and the lamppost's
   shadow lies across the road and up the wall over whatever is painted. Sky
   above the coping, sunlit render round the paint, tarmac under your feet.

   THE WALL IS THE PAGE'S OWN, lifted off it by the kit: the house's paint,
   drawn in its <svg>s, with the lamppost's shadow painted over it as the page
   paints it, and mural.js, which the page loads, run against the copy. So the
   wall turns over by itself at MAX GLITTER and nowhere else, read off the dial
   on every tick, and at every other setting only on a press of Back or Turn it
   over. Nobody real is painted on it.

   EVERY WORD IS ON THE ROAD, NEVER ON THE WALL: what is on the wall now, the
   buttons that turn it over, the murals in words, a mural of your own and how
   the wall works all lie on the tarmac in front of you, on the road's own
   ground. The chalkboard leans on the far pavement as a bare board: its notes
   are read and written on the room's own page, on its board beside the wall,
   because chalk.js reads and writes the CB and is not run here.

   NOTHING MOVES BY ITSELF: the lamppost stands, the sun does not set. Every
   colour is one the room declares, by name. It keeps nothing, sends nothing
   and fetches nothing; its page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['plural-mural.html'] = {
    name: 'Plural Mural',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var WALL = -8.0, WW = 8.0;          // the end wall's face, and its width
      var KERB_FAR = -6.2, KERB_NEAR = 2.0;
      var POST = 1.3;                      // the lamppost, where its painted shadow falls

      // GOLDEN HOUR, the sun low and behind you, square on to the wall, so the
      // lamppost's shadow runs straight across the road and up the paint.
      kit.scene.background = kit.col('--pm-sky');
      kit.scene.add(new T.HemisphereLight(kit.col('--pm-sky'), kit.col('--pm-road'), 1.5));
      var sun = new T.DirectionalLight(kit.col('--pm-render'), 2.2);
      sun.position.set(POST, 7, 46);
      sun.target.position.set(POST, 0, WALL);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      sun.shadow.camera.left = -16; sun.shadow.camera.right = 16;
      sun.shadow.camera.top = 16; sun.shadow.camera.bottom = -16;
      sun.shadow.camera.far = 120;
      sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.04;
      kit.scene.add(sun, sun.target);

      // THE ROAD you are standing across, the pavements either side of it, the
      // double yellow lines along the far kerb and the white line down the middle.
      box(60, 0.1, KERB_NEAR - KERB_FAR, at(0, -0.05, (KERB_NEAR + KERB_FAR) / 2), '--pm-road', false, false);
      box(60, 0.16, 5, at(0, 0.03, KERB_NEAR + 2.5), '--pm-coping', 0.01, false);
      box(60, 0.16, 6, at(0, 0.03, KERB_FAR - 3), '--pm-coping', 0.01, false);
      [0.18, 0.34].forEach(function (d) { box(60, 0.012, 0.08, at(0, 0.003, KERB_FAR + d), '--pm-yellow', false, false); });
      for (var m = -14; m <= 14; m++) box(1.4, 0.012, 0.12, at(m * 2.2, 0.003, (KERB_NEAR + KERB_FAR) / 2), '--pm-line', false, false);

      // THE END WALL of the building: render, the coping along its top, its
      // drainpipe down the right-hand corner, and the building going away
      // behind it. The paint is the page's own, laid on its face below.
      var WH = 4.95;
      box(WW, WH, 14, at(0, WH / 2, WALL - 7), '--pm-render');
      box(WW + 0.3, 0.16, 14.3, at(0, WH + 0.08, WALL - 7), '--pm-coping', 0.015);
      cyl(0.07, 0.07, WH, at(WW / 2 - 0.1, WH / 2, WALL + 0.1), '--pm-coping', 0.01, 10);
      // The street's other roofs, low and far off either side, against the sky.
      [[-14, 3.2, 9], [-24, 4.1, 8], [15, 3.6, 10], [26, 2.8, 9]].forEach(function (b) {
        box(b[2], b[1], 8, at(b[0], b[1] / 2, WALL - 6), '--pm-coping');
      });

      // THE ROOM'S OWN PAGE, on a board on the far pavement beside the wall.
      var pw = 2.6, ph = pw * 800 / 1180, py = 0.6 + ph / 2, bx = WW / 2 + 2.0, bz = WALL + 1.2;
      [-1, 1].forEach(function (s) { box(0.08, py + ph / 2 + 0.1, 0.08, at(bx + s * (pw / 2 + 0.12), (py + ph / 2 + 0.1) / 2, bz - 0.05), '--pm-frame', 0.01); });
      box(pw + 0.2, ph + 0.2, 0.06, at(bx, py, bz - 0.04), '--pm-frame', 0.012);
      var frame = kit.screen(1180, 800, pw, at(bx, py, bz), 'Plural Mural’s own page, on a board on the pavement beside the wall');

      // THE PAINT: the page's own wall, mural and painted shadow and all, laid
      // on the end wall's face, and run by the page's own mural.js.
      var wall = kit.lift(frame, '.pm-wall', { bare: true, w: 1100, ww: WW, m: at(0, 0.32, WALL + 0.02) });

      // EVERY WORD ON THE ROAD: what is on the wall now and the buttons that turn
      // it over at your feet, the murals in words to the left, a mural of your
      // own and how the wall works to the right, each lying back on the tarmac.
      var LIE = -0.8;
      var controls = kit.lift(frame, '.pm-controls', { w: 900, ww: 2.8, m: at(0, 0.02, 1.4, 0, LIE) });
      kit.lift(frame, '.pm-now', { w: 900, ww: 2.8, m: at(0, 0.02, 0.9, 0, LIE) });
      kit.lift(frame, '.sr', { bare: true, w: 200, ww: 0.2, m: at(0, 0.01, 1.4, 0, -Math.PI / 2) });
      var list = kit.lift(frame, '.pm-part', { n: 1, drop: '.pm-item__go', w: 820, h: 900, ww: 2.2, m: at(-6.0, 0.02, -1.0, 0.5, -0.95) });
      var yours = kit.lift(frame, '.pm-part', { n: 2, w: 760, h: 760, ww: 2.0, m: at(6.0, 0.02, -1.0, -0.5, -0.95) });
      var how = kit.lift(frame, '.pm-part', { n: 3, w: 760, h: 760, ww: 2.0, m: at(8.6, 0.02, 0.6, -0.8, -0.95) });
      kit.wire(frame, 'mural.js');

      // THE CHALKBOARD, leaning against nothing on the far pavement left of the
      // wall: a bare slate in its wooden frame, its notes on the page.
      var cb = at(-WW / 2 - 1.6, 0, KERB_FAR - 0.6, 0.15);
      [-1, 1].forEach(function (s) {
        box(0.06, 1.25, 0.06, M(cb, at(s * 0.42, 0.6, 0.12, 0, -0.18)), '--pm-frame', 0.01);
        box(0.06, 1.25, 0.06, M(cb, at(s * 0.42, 0.6, -0.12, 0, 0.18)), '--pm-frame', 0.01);
      });
      box(0.84, 1.0, 0.04, M(cb, at(0, 0.66, 0.13, 0, -0.18)), '--pm-frame', 0.012);
      box(0.72, 0.88, 0.02, M(cb, at(0, 0.66, 0.16, 0, -0.18)), '--pm-slate', false);

      // THE LAMPPOST behind you on the near pavement, between the sun and the
      // wall, and the bench beside it: their shadows go across the road.
      var lz = KERB_NEAR + 2.6;
      cyl(0.07, 0.1, 5.2, at(POST, 2.6, lz), '--pm-slate', 0.012, 10);
      box(1.0, 0.08, 0.1, at(POST - 0.45, 5.15, lz, 0, 0, -0.1), '--pm-slate', 0.01);
      box(0.4, 0.16, 0.24, at(POST - 0.9, 5.05, lz), '--pm-slate', 0.012);
      box(0.32, 0.04, 0.18, at(POST - 0.9, 4.96, lz), '--pm-line', false);
      var bench = at(-1.5, 0, lz + 0.6);
      box(1.8, 0.06, 0.42, M(bench, at(0, 0.46, 0)), '--pm-frame', 0.012);
      box(1.8, 0.36, 0.05, M(bench, at(0, 0.72, 0.2, 0, 0.12)), '--pm-frame', 0.012);
      [-0.8, 0.8].forEach(function (x) { box(0.06, 0.46, 0.4, M(bench, at(x, 0.23, 0)), '--pm-slate', 0.01); });

      return {
        start: { x: 0, z: 3.4, yaw: 0 },
        bounds: { x: [-10, 11], z: [KERB_FAR - 1.0, 5.6] },
        stops: [
          { name: 'across the road from the end wall, the sun low behind you', x: 0, z: 3.4, yaw: 0, pitch: 0.14 },
          { name: 'at the kerb, the mural square on across the road', x: 0, z: KERB_NEAR - 0.6, yaw: 0, pitch: 0.2, frame: wall.el },
          { name: 'over the words on the road, saying what is on the wall now and turning it over', x: 0, z: 3.0, yaw: 0, pitch: -0.45, frame: controls.el },
          { name: 'over the murals in words, laid on the road', x: -5.0, z: 1.1, yaw: 0.45, pitch: -0.45, frame: list.el },
          { name: 'over a mural of your own, on the road', x: 5.0, z: 1.1, yaw: -0.45, pitch: -0.45, frame: yours.el },
          { name: 'over how the wall works, on the road', x: 7.3, z: 2.6, yaw: -0.6, pitch: -0.45, frame: how.el },
          { name: 'at the chalkboard on the far pavement, its notes on the room’s own page', x: -WW / 2 - 1.2, z: KERB_FAR + 2.4, yaw: 0.1, pitch: -0.08 },
          { name: 'at the board beside the wall, with the room’s own page on it', x: bx, z: bz + 2.6, yaw: 0, page: kit.page, frame: frame },
          { name: 'by the lamppost, its shadow running across the road and up the wall', x: POST + 0.7, z: lz - 0.6, yaw: 0, pitch: 0.1 },
          { name: 'on the bench behind you, looking across at the wall', x: -1.5, z: lz + 0.2, yaw: 0, pitch: 0.12 }
        ]
      };
    }
  };
})();

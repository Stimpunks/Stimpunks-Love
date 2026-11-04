/* =============================================================================
   Loo With a View, walked into on Cel Street: a public restroom on the street
   (Ryan's brief, 2026-11-03), at the top of a mountain road over a fjord.

   THE LIGHT IS THE MIDNIGHT SUN, ON THE NORTHERN HORIZON STRAIGHT OUT THROUGH
   THE GLASS WALL AT THE FAR END (§137). It is the room's one light, low and
   level from in front of you, so everything you face from the door is
   backlit: lit along its far edge, its face toward you in the cool of the
   sky's fill, and its long shadow lying back across the concrete floor to your
   feet. Outside the glass, far below, the fjord with the sun's road across it,
   and the mountains either side against a sky that does not get dark.

   THE ROOM IS THE PAGE'S LIST, BUILT. The larch wall on the left is the stalls,
   each a small room with its door down to the floor and up to the ceiling and
   a light over it saying FREE or IN USE in words; one stands open so you can
   see the toilet with its grab bars, the shelf and the hooks, the sharps box
   and the box of pads and tampons. The basins run along the glass with the
   step folded out under one; the bench faces the water; the changing tables
   stand at the far end by the glass, the big one under its hoist; the
   naloxone cabinet is the first thing inside the door, and the bowl of condoms
   is on the deep sill beside it. Every sign is words, in rusted steel.

   NOTHING MOVES, AT ANY SETTING: the sun sits on the horizon and stays there.
   Every colour is one §137 declares, by name. It keeps nothing, sends nothing
   and fetches nothing; the page arrives through Cel Street's screen().
   ========================================================================== */
(function () {
  'use strict';
  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['loo-with-a-view.html'] = {
    name: 'Loo With a View',
    faces: ['"Instrument Sans"', '"Atkinson Hyperlegible Next"'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var W = 8.4, D = 14, H = 3.6, GLASS = -D;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var XL = -W / 2, XR = W / 2;

      // THE SKY THAT DOES NOT GET DARK, and the cool of it filling every face
      // turned toward you.
      kit.scene.background = kit.col('--lwv-sky');
      kit.scene.add(new T.HemisphereLight(kit.col('--lwv-sky'), kit.col('--lwv-concrete'), 1.25));
      // THE MIDNIGHT SUN, low and level straight out through the glass: the one
      // light in the room, and every shadow it throws lies back toward the door.
      var sun = new T.DirectionalLight(kit.col('--lwv-glare'), 2.9);
      sun.position.set(0.6, 2.6, GLASS - 40);
      sun.target.position.set(0, 0, -2);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      var sc = sun.shadow.camera;
      sc.left = -8; sc.right = 8; sc.top = 6; sc.bottom = -6; sc.near = 1; sc.far = 90;
      sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
      kit.scene.add(sun, sun.target);

      // OUTSIDE: the fjord far below, the sun's road across it, the sun on the
      // horizon, and the mountains either side with their ridges against the
      // light. Nothing out there moves.
      // Everything out there stands inside the distance the street draws, so
      // the fjord is a little nearer and lower than a real one and the sun sits
      // on its far edge, a little under your eye.
      var FAR = 290, SEA = -20;
      kit.flat(new T.PlaneGeometry(700, FAR), at(0, SEA, GLASS - FAR / 2 - 4, 0, -Math.PI / 2), '--lwv-fjord');
      for (var k = 0; k < 30; k++) {
        var rz = GLASS - 12 - k * 9.2, half = 0.6 + k * 0.32;
        kit.flat(new T.PlaneGeometry(half * 2, 0.6 + k * 0.05), at(1.4 * k / 30, SEA + 0.05, rz, 0, -Math.PI / 2), '--lwv-glare');
      }
      kit.flat(new T.CircleGeometry(70, 48).scale(2.6, 0.42, 1), at(1.4, SEA + 2, GLASS - FAR - 8), '--lwv-low');
      kit.flat(new T.CircleGeometry(8, 40), at(1.4, SEA + 3, GLASS - FAR - 6), '--lwv-sun');
      // The mountains either side, standing back from the sun so it stays in
      // the middle of the glass, each lit only along its ridge.
      [-1, 1].forEach(function (s) {
        for (var m = 0; m < 5; m++) {
          var mx = s * (46 + m * 22), mz = GLASS - 40 - m * 48, mh = 44 + (m % 2) * 22 + m * 8;
          kit.piece(new T.ConeGeometry(30 + m * 8, mh, 5), at(mx, SEA + mh / 2, mz, m * 0.7), '--lwv-ridge', false);
        }
      });

      // THE ROOM: concrete underfoot and overhead, board-marked, with the door
      // you came in by behind you.
      // The stalls stand behind the larch wall on the left, so the floor, the
      // ceiling and the wall you came in by run back over them too.
      var CL = XL - 2.2, CR = XR + 0.3, CX = (CL + CR) / 2, CW = CR - CL;
      box(CW, 0.12, D, at(CX, -0.06, -D / 2), '--lwv-concrete', false, false);
      box(CW, 0.3, D + 0.6, at(CX, H + 0.15, -D / 2), '--lwv-concrete', false, false);
      box(CW, H, 0.3, at(CX, H / 2, 0.15), '--lwv-concrete');
      box(1.4, 2.4, 0.08, at(0, 1.2, -0.03), '--lwv-corten', 0.01);
      for (var b = 1; b < 14; b++) {
        box(0.01, 0.012, D, at(XL + b * W / 14, 0.004, -D / 2), '--lwv-line', false, false);
      }
      // The right-hand wall, its board marks running the length of the room.
      box(0.3, H, D, at(XR + 0.15, H / 2, -D / 2), '--lwv-concrete');
      for (var y = 0.3; y < H; y += 0.3) box(0.01, 0.012, D, at(XR - 0.005, y, -D / 2), '--lwv-line', false, false);

      // THE GLASS WALL: rusted steel between the panes, the frame round them,
      // and nothing in the panes but the sky and the water.
      var MULL = [XL, -2.8, -1.4, 1.4, 2.8, XR];
      MULL.forEach(function (x) { box(0.14, H, 0.2, at(x, H / 2, GLASS), '--lwv-corten', 0.01); });
      box(W + 0.2, 0.2, 0.24, at(0, H - 0.1, GLASS), '--lwv-corten', 0.01);
      box(W + 0.2, 0.16, 0.24, at(0, 0.08, GLASS), '--lwv-corten', 0.01);

      // THE STALLS, the larch wall on the left: every one a small room of its
      // own with a door to the floor and the ceiling, a light over it, and the
      // word under the light. One stands open.
      var STALLS = 6, SW = 1.5, SD = 1.9, S0 = -1.4;
      box(0.2, H, D, at(XL - 0.1 - SD, H / 2, -D / 2), '--lwv-larch');
      // The larch wall itself, either side of the row of doors, to the ceiling.
      var ZE = S0 - STALLS * SW;
      box(0.12, H, -S0, at(XL, H / 2, S0 / 2), '--lwv-larch', 0.01);
      box(0.12, H, ZE - GLASS, at(XL, H / 2, (ZE + GLASS) / 2), '--lwv-larch', 0.01);
      function word(text, ground, ink) {
        return kit.paper(512, 160, function (c, w, h) {
          c.fillStyle = kit.ink(ground); c.fillRect(0, 0, w, h);
          c.fillStyle = kit.ink(ink); c.textAlign = 'center'; c.textBaseline = 'middle';
          var size = 92;
          do { c.font = '700 ' + size + 'px "Instrument Sans"'; size -= 4; } while (c.measureText(text).width > w - 40 && size > 24);
          c.fillText(text, w / 2, h / 2 + 4);
        });
      }
      var FREE = word('FREE', '--lwv-corten', '--lwv-rim'), BUSY = word('IN USE', '--lwv-corten', '--lwv-ink-2');
      var OPEN = 2;
      var stops = [];
      for (var i = 0; i < STALLS; i++) {
        var z0 = S0 - i * SW, zc = z0 - SW / 2, inUse = (i === 1 || i === 4);
        // The partitions between stalls, larch to the ceiling.
        box(SD, H, 0.08, at(XL - SD / 2, H / 2, z0), '--lwv-larch', 0.01);
        if (i === STALLS - 1) box(SD, H, 0.08, at(XL - SD / 2, H / 2, z0 - SW), '--lwv-larch', 0.01);
        // The door: shut, or the open one swung back into its stall.
        if (i === OPEN) {
          box(0.06, H - 0.1, SW - 0.12, at(XL - 0.75, H / 2, zc - 0.58, 1.2), '--lwv-larch', 0.01);
        } else {
          box(0.08, H - 0.1, SW - 0.12, at(XL, H / 2, zc), '--lwv-larch', 0.012);
          box(0.05, 0.03, 0.18, at(XL + 0.06, 1.05, zc + 0.5), '--lwv-corten', false);
        }
        // Over the door, the light, gold when free and dark when in use, and the
        // word under it on a plate of rusted steel.
        kit.flat(new T.CircleGeometry(0.07, 18), at(XL + 0.05, H - 0.32, zc, LEFT * -1 + Math.PI), inUse ? '--lwv-line' : '--lwv-rim');
        kit.sheet(inUse ? BUSY : FREE, 0.5, 0.16, at(XL + 0.05, H - 0.55, zc, -LEFT + Math.PI));
        // Inside every stall: the toilet with grab bars beside and behind it, a
        // shelf the width of the room with hooks at two heights, the sharps box
        // and the box of pads and tampons, and the window high in the back wall.
        var bx = XL - SD + 0.45;
        if (i === 3) {
          // This one is a urinal, in its own room like every other.
          box(0.28, 0.6, 0.42, at(XL - SD + 0.18, 0.95, zc), '--lwv-ink', 0.01);
        } else {
          box(0.5, 0.42, 0.38, at(bx, 0.21, zc), '--lwv-ink', 0.01);
          box(0.5, 0.06, 0.42, at(bx + 0.02, 0.44, zc), '--lwv-ink', 0.008);
          box(0.18, 0.5, 0.42, at(XL - SD + 0.1, 0.7, zc), '--lwv-ink', 0.008);
        }
        cyl(0.02, 0.02, 0.8, at(XL - SD + 0.12, 0.85, zc - 0.4, 0, 0, Math.PI / 2), '--lwv-concrete', false, 8);
        cyl(0.02, 0.02, 0.9, at(XL - SD + 0.65, 0.85, zc - SW / 2 + 0.06, 0, 0, Math.PI / 2), '--lwv-concrete', false, 8);
        box(SD - 0.2, 0.04, 0.24, at(XL - SD / 2, 1.45, z0 - 0.14), '--lwv-larch', 0.006);
        [1.2, 1.75].forEach(function (hy, n) { box(0.05, 0.05, 0.08, at(XL - SD + 0.4 + n * 0.6, hy, z0 - 0.1), '--lwv-corten', false); });
        box(0.22, 0.3, 0.12, at(XL - SD + 1.2, 1.05, z0 - SW + 0.1), '--lwv-rim', 0.008);
        box(0.24, 0.16, 0.12, at(XL - SD + 0.9, 1.58, z0 - 0.16), '--lwv-ink', 0.006);
        kit.flat(new T.PlaneGeometry(0.7, 0.3), at(XL - SD + 0.11, H - 0.5, zc, Math.PI / 2), '--lwv-low');
      }
      var oz = S0 - OPEN * SW - SW / 2;
      stops.push({ name: 'at the stalls, each with its light and its word over the door', where: 'at the stalls along the larch wall',
                   x: XL + 2.3, z: S0 - 1.8 * SW, yaw: LEFT + 0.25, pitch: 0.08 });
      stops.push({ name: 'in the open stall: the toilet, the grab bars, the shelf and hooks, the sharps box and the pads',
                   where: 'in the open stall', x: XL + 0.3, z: oz + 0.2, yaw: LEFT, pitch: -0.18 });

      // THE BASINS along the glass on the left, a larch counter with the step
      // folded out under one of them, and the paper towels in drawers below.
      var CZ = GLASS + 0.55;
      box(3.6, 0.1, 0.62, at(-2.3, 0.88, CZ), '--lwv-larch', 0.01);
      box(3.6, 0.78, 0.1, at(-2.3, 0.44, CZ - 0.26), '--lwv-larch', 0.01);
      [-3.7, -2.9, -2.1, -1.3].forEach(function (x, n) {
        kit.piece(new T.CylinderGeometry(0.2, 0.15, 0.1, 18), at(x + 0.4, 0.9, CZ), '--lwv-ink', 0.006);
        cyl(0.015, 0.015, 0.22, at(x + 0.4, 1.02, CZ - 0.2), '--lwv-concrete', false, 8);
        box(0.36, 0.1, 0.42, at(x + 0.4, 0.62, CZ + 0.05), '--lwv-larch', 0.006);
        if (n === 1) box(0.5, 0.06, 0.34, at(x + 0.4, 0.2, CZ + 0.2), '--lwv-concrete', 0.008);
      });
      stops.push({ name: 'at the basins along the glass, the step folded out under one', where: 'at the basins under the glass',
                   x: -2.3, z: CZ + 1.6, yaw: 0, pitch: -0.12 });

      // THE BENCH facing the water on the right, so the wait is the view.
      box(3.2, 0.08, 0.5, at(2.2, 0.46, GLASS + 1.1), '--lwv-larch', 0.01);
      [0.9, 2.2, 3.5].forEach(function (x) { box(0.08, 0.42, 0.42, at(x, 0.21, GLASS + 1.1), '--lwv-line', false); });
      stops.push({ name: 'on the bench, facing the water and the sun on the horizon', where: 'on the bench under the glass',
                   x: 2.2, z: GLASS + 2.3, yaw: 0, pitch: 0.02 });
      stops.push({ name: 'at the glass, the fjord far below and the sun sitting on the horizon', where: 'at the glass wall',
                   x: 0, z: GLASS + 2.6, yaw: 0, pitch: -0.04 });

      // THE CHANGING TABLES at the far end on the right, by the glass: one for
      // a baby on the wall, and the big one, height-adjustable, under its hoist.
      var TZ = GLASS + 3.6;
      box(0.7, 0.06, 0.5, at(XR - 0.35, 1.0, TZ + 1.4), '--lwv-ink', 0.008);
      box(0.9, 0.08, 1.9, at(XR - 0.7, 0.8, TZ), '--lwv-ink', 0.01);
      [-0.8, 0.8].forEach(function (o) { box(0.08, 0.8, 0.08, at(XR - 0.7, 0.4, TZ + o), '--lwv-concrete', false); });
      box(0.06, 0.06, 2.4, at(XR - 0.7, H - 0.2, TZ), '--lwv-corten', false);
      cyl(0.012, 0.012, 1.2, at(XR - 0.7, H - 0.85, TZ), '--lwv-line', false, 6);
      box(0.24, 0.16, 0.24, at(XR - 0.7, H - 1.5, TZ), '--lwv-corten', 0.006);
      stops.push({ name: 'at the changing tables, the big one under its hoist', where: 'at the changing tables by the glass',
                   x: XR - 2.5, z: TZ + 0.4, yaw: RIGHT + 0.2, pitch: -0.1 });

      // BY THE DOOR: the naloxone cabinet, rusted outside and white inside with
      // its door open, and the bowl of condoms on the deep sill beside it.
      box(0.16, 0.7, 0.5, at(XR - 0.08, 1.4, -0.8), '--lwv-corten', 0.01);
      box(0.02, 0.6, 0.42, at(XR - 0.17, 1.4, -0.8), '--lwv-ink', false);
      box(0.4, 0.6, 0.02, at(XR - 0.4, 1.4, -0.56, -0.9), '--lwv-ink', 0.006);
      box(0.4, 0.06, 0.7, at(XR - 0.2, 1.0, -1.6), '--lwv-concrete', 0.01);
      kit.piece(new T.SphereGeometry(0.16, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), at(XR - 0.22, 1.18, -1.6, 0, Math.PI), '--lwv-rim', 0.006);
      stops.push({ name: 'at the naloxone cabinet just inside the door, and the bowl on the sill', where: 'by the door, at the naloxone cabinet',
                   x: XR - 2.0, z: -1.2, yaw: RIGHT, pitch: -0.06 });

      // THE SIGNS, cut into plates of rusted steel: the words, raised beside
      // them for a hand, at a height you can read sitting down.
      function sign(text, w, m) {
        var tex = kit.paper(1024, 200, function (c, cw, ch) {
          c.fillStyle = kit.ink('--lwv-corten'); c.fillRect(0, 0, cw, ch);
          c.fillStyle = kit.ink('--lwv-rim'); c.textAlign = 'center'; c.textBaseline = 'middle';
          var size = 110;
          do { c.font = '700 ' + size + 'px "Instrument Sans"'; size -= 4; } while (c.measureText(text).width > cw - 60 && size > 24);
          c.fillText(text, cw / 2, ch / 2 + 6);
        });
        box(w + 0.06, w * 200 / 1024 + 0.06, 0.04, M(m, at(0, 0, -0.03)), '--lwv-line', false);
        kit.sheet(tex, w, w * 200 / 1024, m);
      }
      sign('TOILETS · FOR EVERYBODY', 2.4, at(0, 2.8, -0.1, Math.PI));
      sign('TOILETS · FOR EVERYBODY', 1.2, at(XL + 0.06, 1.4, -0.75, Math.PI / 2));
      sign('BASINS · TOWELS · STEP', 1.8, at(-2.3, 1.55, GLASS + 0.12));

      // THE ROOM'S OWN PAGE on the right-hand wall, between the cabinet and the
      // tables, and its words beside it on panels of larch.
      var pw = 2.4, ph = pw * 800 / 1180, py = 0.85 + ph / 2;
      var pg = at(XR - 0.02, 0, -3.6, RIGHT);
      box(pw + 0.12, ph + 0.12, 0.05, M(pg, at(0, py, 0)), '--lwv-larch', 0.01);
      var page = kit.screen(1180, 800, pw, M(pg, at(0, py, 0.04)), 'Loo With a View’s own page, on the right-hand wall');
      stops.push({ name: 'at the right-hand wall, with the room’s own page', where: 'at the room’s own page',
                   x: XR - 2.3, z: -3.6, yaw: RIGHT, pitch: 0.06, page: kit.page, frame: page });

      var WORDS = [
        { sel: '.lwv-lede', z: -6.0, side: 1, words: 'at the right-hand wall, with what this rest stop is' },
        { sel: '.lwv-has', z: -7.9, side: 1, words: 'at the right-hand wall, with everything in here and how this one does it' },
        { sel: '.lwv-rules', z: -11.7, side: -1, words: 'at the larch wall past the stalls, with how things are in here' }
      ];
      WORDS.forEach(function (w) {
        // On the right-hand wall, or on the larch past the last stall, out of
        // the way of the changing tables.
        var wx = w.side > 0 ? XR - 0.02 : XL + 0.08, face = w.side > 0 ? RIGHT : LEFT;
        var m = at(wx, 0.8, w.z, face);
        box(1.5, 0.04, 0.06, M(m, at(0, -0.03, 0.02)), '--lwv-larch', 0.006);
        var it = kit.lift(page, w.sel, { w: 640, h: 640, ww: 1.4, m: m });
        stops.push({ name: w.words, x: wx - w.side * 2.1, z: w.z, yaw: face, pitch: 0.1, frame: it.el });
      });
      var head = kit.lift(page, '.lwv-head', { w: 900, ww: 1.8, m: at(-1.6, 0.9, -0.08, Math.PI) });
      var why = kit.lift(page, '.lwv-part', { n: 1, w: 640, h: 640, ww: 1.3, m: at(1.7, 0.85, -0.08, Math.PI) });
      stops.push({ name: 'turned round to the door, with the room’s name', where: 'at the door, with the room’s name',
                   x: -1.6, z: -2.2, yaw: Math.PI, pitch: 0.08, frame: head.el });
      stops.push({ name: 'turned round to the door, with why it is built like this', where: 'at the door, with why it is built like this',
                   x: 1.7, z: -2.1, yaw: Math.PI, pitch: 0.1, frame: why.el });

      stops.unshift({ name: 'just inside the door, the glass at the far end and the sun on the horizon in it',
                      where: 'just inside the door', x: 0, z: -1.0, yaw: 0, pitch: 0.02 });

      return {
        start: { x: 0, z: -1.0, yaw: 0 },
        bounds: {
          x: [XL + 0.5, XR - 0.6], z: [GLASS + 0.9, -0.6],
          areas: [
            { x: [XL + 0.5, XR - 0.6], z: [GLASS + 0.9, -0.6] },
            { x: [XL - SD + 0.5, XL + 0.5], z: [oz - 0.5, oz + 0.5] }
          ]
        },
        stops: stops
      };
    }
  };
})();

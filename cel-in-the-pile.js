/* =============================================================================
   The Pile, walked into on Cel Street, through its gate in the fence past the
   last building. Ryan's ask, 2026-11-01: the street's gates.

   IT IS THE ROOM'S OWN WORLD (§99). A lot of sand in plain sun with a heap of
   everything on it: a big tree with a rope swing at the far end, a den of
   pallets in the middle roofed in bubble wrap, an old upright piano, a metal
   slide off a playground that closed, plywood leaning on tree stumps, old
   chairs, buckets, shovels, rope, duct tape, a flag of fabric, pots of tempera,
   and the old telly on a stump.

   THE LIGHT HAS NO COLOUR IN IT, AND ALL THE COLOUR IS PAINT. The sun is the
   page's paper white, the sky its pale sky, and every colour in the scene is
   tempera splashed on wood and tin: chalky, a little dusty, never a glossy
   primary. Under the den's roof every bubble throws a ring of light on the
   sand, and those rings are the one thing drawn unlit, because they are the
   light. The Playhouse is the collision: indoors, saturated blue, bunting and a
   checkerboard floor. None of that is here, and nothing on the Pile is a
   finished toy.

   THE WORDS ARE THE PAGE'S OWN, lifted off it and never retyped, each on a
   sheet of plywood stood on two stakes in the sand: its name and its line by
   the gate, Make something at a pallet bench in front of the den with what is
   on the Pile beside it, Play is learning and where junk playgrounds come from
   along the left, to read and the house rules along the right, whose it is by
   the tree. pile.js, which the page itself runs and which keeps nothing and
   sends nothing, is wired to the lifted bench, so a part taken off the Pile
   goes down on the sand in its drawing there, as on the page. The old telly's
   screen and its rack are lifted and play through rack.js and love-embed.js.
   The page itself stands by the gate.

   Nothing here sells play by what it leads to, scores it, tells anybody what
   to do with it, or says what is too high. Every colour is one §99 declares,
   by name. Nothing moves at any setting. It keeps nothing, sends nothing and
   fetches nothing; its page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['the-pile.html'] = {
    name: 'The Pile',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var GZ = 8.4;                     // the gate, at the near edge of the lot
      var PAINT = ['--pil-red', '--pil-yellow', '--pil-blue', '--pil-green', '--pil-orange', '--pil-purple', '--pil-pink'];
      function seeded(n) { var s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
      function paint(n) { return PAINT[Math.floor(seeded(n) * PAINT.length) % PAINT.length]; }

      // THE SUN, with no colour in it, and the pale sky.
      kit.scene.background = kit.col('--pil-sky');
      kit.scene.add(new T.HemisphereLight(kit.col('--pil-paper'), kit.col('--pil-sand'), 1.5));
      var sun = new T.DirectionalLight(kit.col('--pil-paper'), 2.3);
      sun.position.set(-9, 22, 10);
      sun.target.position.set(0, 0, -2);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      sun.shadow.camera.left = -20; sun.shadow.camera.right = 20;
      sun.shadow.camera.top = 20; sun.shadow.camera.bottom = -20;
      sun.shadow.camera.near = 1; sun.shadow.camera.far = 60;
      sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
      kit.scene.add(sun, sun.target);

      // THE LOT: sand, with a heap of more sand on it, and past it more sand
      // to the horizon so nothing ends in a wall.
      kit.piece(new T.PlaneGeometry(80, 80), at(0, 0, -4, 0, -Math.PI / 2), '--pil-sand', false, false);
      kit.piece(new T.ConeGeometry(2.0, 1.2, 20), at(5.4, 0.58, -10.4), '--pil-sand-2', 0.012);

      // THE FENCE you came through: plywood boards on posts, the gate open.
      for (var f = -10; f <= 10; f += 1.25) {
        if (Math.abs(f) < 1.6) continue;
        box(1.18, 1.9 + seeded(f + 3) * 0.3, 0.06, at(f, 0.98, GZ + 0.6), seeded(f) < 0.3 ? paint(f + 7) : '--pil-ply', 0.012);
      }
      [-1.7, 1.7].forEach(function (x) { cyl(0.08, 0.09, 2.4, at(x, 1.2, GZ + 0.6), '--pil-wood', 0.012, 8); });
      box(1.5, 1.7, 0.06, at(-2.35, 0.9, GZ - 0.2, -1.2), '--pil-ply', 0.012);

      // A PLYWOOD BOARD on two stakes, for a part of the page to stand on.
      function board(x, z, ry, wide, high, ink) {
        box(wide, high, 0.05, at(x - Math.sin(ry) * 0.05, 0.3 + high / 2, z - Math.cos(ry) * 0.05, ry), ink || '--pil-ply', 0.012);
        [-1, 1].forEach(function (k) {
          cyl(0.04, 0.05, 0.5, at(x + Math.cos(ry) * (wide / 2 - 0.12) * k - Math.sin(ry) * 0.1, 0.22, z - Math.sin(ry) * (wide / 2 - 0.12) * k - Math.cos(ry) * 0.1), '--pil-wood', 0.01, 6);
        });
      }

      // A TREE STUMP, cut flat on top.
      function stump(x, z, r, h) {
        cyl(r, r * 1.12, h, at(x, h / 2, z), '--pil-bark', 0.012, 14);
        kit.piece(new T.CircleGeometry(r * 0.98, 18), at(x, h + 0.004, z, 0, -Math.PI / 2), '--pil-cut', false, false);
      }

      // THE BIG TREE at the far end, with the rope swing.
      var TX = -6.4, TZ = -9.6;
      cyl(0.42, 0.62, 5.2, at(TX, 2.6, TZ), '--pil-bark', 0.018, 12);
      cyl(0.16, 0.24, 3.4, at(TX - 1.5, 4.6, TZ + 0.2, 0, 0, 1.1), '--pil-bark', 0.014, 10);
      [[0, 6.4, 0, 2.6], [1.8, 5.7, 0.5, 2.0], [-1.6, 5.9, -0.4, 2.1], [0.6, 7.2, -0.8, 1.8], [-0.4, 5.4, 1.4, 1.7]].forEach(function (c, i) {
        kit.facets(new T.IcosahedronGeometry(c[3], 1), at(TX + c[0], c[1], TZ + c[2], i), '--pil-leaf');
      });
      [-0.24, 0.24].forEach(function (d) { cyl(0.025, 0.025, 4.0, at(TX - 2.6, 3.0, TZ + 0.2 + d), '--pil-rope', 0.006, 6); });
      box(0.5, 0.06, 0.62, at(TX - 2.6, 1.0, TZ + 0.2), '--pil-ply', 0.01);

      // THE DEN in the middle: pallets stood on end for three walls, a pallet
      // floor's worth of shade under a roof of bubble wrap, and the rings of
      // light every bubble throws on the sand inside.
      var DX = 1.4, DZ = -5.6, DW = 3.6, DD = 2.8, DH = 1.9;
      kit.piece(new T.PlaneGeometry(DW, DD), at(DX, 0.006, DZ, 0, -Math.PI / 2), '--pil-sand-2', false, false);
      function pallet(x, z, ry, n) {
        var ink = seeded(n) < 0.45 ? paint(n + 11) : '--pil-pallet';
        for (var s = 0; s < 5; s++) box(0.16, DH, 0.03, at(x + Math.cos(ry) * (-0.48 + s * 0.24), DH / 2, z - Math.sin(ry) * (-0.48 + s * 0.24), ry), ink, 0.008);
        [0.25, DH / 2, DH - 0.25].forEach(function (y) { box(1.18, 0.12, 0.1, at(x - Math.sin(ry) * 0.06, y, z - Math.cos(ry) * 0.06, ry), ink, 0.008); });
      }
      for (var p = 0; p < 3; p++) pallet(DX - DW / 2 + 0.6 + p * 1.2, DZ - DD / 2, 0, p);
      for (p = 0; p < 2; p++) pallet(DX - DW / 2, DZ - DD / 2 + 0.7 + p * 1.2, Math.PI / 2, p + 5);
      for (p = 0; p < 2; p++) pallet(DX + DW / 2, DZ - DD / 2 + 0.7 + p * 1.2, -Math.PI / 2, p + 9);
      var wrap = new T.Mesh(new T.PlaneGeometry(DW + 0.4, DD + 0.4), new T.MeshToonMaterial({ color: kit.col('--pil-wrap'), transparent: true, opacity: 0.55, side: T.DoubleSide, depthWrite: false }));
      wrap.matrixAutoUpdate = false;
      wrap.matrix.copy(at(DX, DH + 0.04, DZ, 0, -Math.PI / 2));
      wrap.matrixWorldNeedsUpdate = true;
      kit.scene.add(wrap);
      for (var bx = 0; bx < 9; bx++) {
        for (var bz = 0; bz < 7; bz++) {
          var x = DX - DW / 2 + 0.2 + bx * (DW / 8.6), z = DZ - DD / 2 + 0.2 + bz * (DD / 6.6);
          var bub = new T.SphereGeometry(0.1, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2); bub.scale(1, 0.5, 1);
          kit.piece(bub, at(x, DH + 0.05, z), '--pil-wrap', false, false);
          // Each ring lands where the sun through that bubble meets the sand,
          // down and away from the sun; only the ones inside the den are drawn.
          var rx = x + DH * 9 / 22, rz = z - DH * 10 / 22;
          if (Math.abs(rx - DX) < DW / 2 - 0.15 && Math.abs(rz - DZ) < DD / 2 - 0.15) {
            kit.flat(new T.RingGeometry(0.09, 0.13, 18), at(rx, 0.012, rz, 0, -Math.PI / 2), '--pil-ring');
          }
        }
      }
      // Duct tape round the roof's edge, and a flag of fabric on a pole.
      [[0, -DD / 2, DW + 0.4, 0.08], [0, DD / 2, DW + 0.4, 0.08]].forEach(function (t) { box(t[2], 0.03, t[3], at(DX + t[0], DH + 0.06, DZ + t[1]), '--pil-tape', 0.006); });
      cyl(0.035, 0.04, 1.4, at(DX + DW / 2 - 0.1, DH + 0.7, DZ - DD / 2 + 0.1), '--pil-pallet', 0.008, 6);
      box(0.62, 0.38, 0.02, at(DX + DW / 2 + 0.22, DH + 1.18, DZ - DD / 2 + 0.1), '--pil-cloth', 0.008);

      // THE OLD PIANO, with paint on it.
      var PX = 6.2, PZ = -6.4;
      box(1.5, 1.3, 0.62, at(PX, 0.7, PZ, -0.4), '--pil-piano', 0.015);
      box(1.56, 0.08, 0.36, at(PX + Math.sin(-0.4) * 0.42, 0.78, PZ + Math.cos(-0.4) * 0.42, -0.4), '--pil-keys', 0.01);
      box(0.5, 0.42, 0.02, at(PX - 0.3 + Math.sin(-0.4) * 0.32, 1.05, PZ + Math.cos(-0.4) * 0.32, -0.4), '--pil-yellow', 0.006);
      box(0.32, 0.3, 0.02, at(PX + 0.42 + Math.sin(-0.4) * 0.32, 0.4, PZ + Math.cos(-0.4) * 0.32, -0.4), '--pil-red', 0.006);
      [[-0.65, -0.2], [0.65, -0.2]].forEach(function (l) { box(0.1, 0.1, 0.1, at(PX + l[0], 0.05, PZ + l[1], -0.4), '--pil-piano', 0.006); });

      // THE SLIDE off a playground that closed: a ladder and a chute, a stripe
      // of blue paint down it.
      var SX = 6.6, SZ = -1.0;
      [-0.28, 0.28].forEach(function (d) { cyl(0.04, 0.04, 2.3, at(SX + d, 1.15, SZ - 1.0), '--pil-steel', 0.008, 8); });
      for (var r = 0; r < 5; r++) cyl(0.025, 0.025, 0.56, at(SX, 0.35 + r * 0.42, SZ - 1.0, 0, 0, Math.PI / 2), '--pil-steel', 0.006, 6);
      box(0.62, 0.06, 2.7, at(SX, 1.15, SZ + 0.15, 0, 0.72), '--pil-steel', 0.012);
      box(0.16, 0.02, 2.62, at(SX, 1.19, SZ + 0.15, 0, 0.72), '--pil-blue', false);

      // PLYWOOD LEANING ON STUMPS, painted, and more stumps to sit on.
      stump(-2.6, -1.4, 0.34, 0.55);
      box(1.4, 1.1, 0.04, at(-2.6, 0.62, -1.02, 0.2, -0.45), '--pil-orange', 0.012);
      stump(4.0, -3.2, 0.3, 0.5);
      box(1.2, 1.0, 0.04, at(4.25, 0.55, -2.85, -0.5, -0.5), '--pil-ply', 0.012);
      box(0.6, 0.5, 0.02, at(4.25, 0.6, -2.82, -0.5, -0.5), '--pil-green', false);
      stump(-1.2, 2.2, 0.3, 0.42);
      stump(0.6, 2.8, 0.26, 0.38);
      stump(2.6, 0.9, 0.32, 0.46);

      // OLD CHAIRS, one painted pink.
      function chair(x, z, ry, ink) {
        box(0.46, 0.06, 0.44, at(x, 0.46, z, ry), ink, 0.008);
        box(0.46, 0.5, 0.05, at(x - Math.sin(ry) * 0.2, 0.74, z - Math.cos(ry) * 0.2, ry), ink, 0.008);
        [[-0.19, -0.18], [0.19, -0.18], [-0.19, 0.18], [0.19, 0.18]].forEach(function (l) {
          cyl(0.025, 0.025, 0.46, at(x + Math.cos(ry) * l[0] + Math.sin(ry) * l[1], 0.23, z - Math.sin(ry) * l[0] + Math.cos(ry) * l[1]), ink, 0.005, 6);
        });
      }
      chair(-3.8, -5.4, 0.6, '--pil-wood');
      chair(3.4, -8.6, -0.3, '--pil-pink');

      // BUCKETS, SHOVELS, ROPE, TAPE AND POTS OF TEMPERA, about the sand.
      [[-0.8, -2.6, '--pil-blue'], [-0.3, -2.9, '--pil-yellow'], [5.2, -4.4, '--pil-red']].forEach(function (b) {
        cyl(0.2, 0.15, 0.32, at(b[0], 0.16, b[1]), b[2], 0.008, 14);
      });
      [[-4.6, -2.2, 0.5], [2.2, -9.4, -1.0]].forEach(function (s) {
        cyl(0.025, 0.025, 1.0, at(s[0], 0.06, s[1], s[2], 0, Math.PI / 2), '--pil-wood', 0.006, 6);
        box(0.22, 0.02, 0.28, at(s[0] + Math.cos(s[2]) * 0.6, 0.03, s[1] - Math.sin(s[2]) * 0.6, s[2]), '--pil-tin', 0.006);
      });
      kit.piece(new T.TorusGeometry(0.42, 0.06, 8, 24), at(-3.4, 0.06, -7.2, 0, Math.PI / 2), '--pil-rope', 0.008);
      kit.piece(new T.TorusGeometry(0.28, 0.06, 8, 24), at(-3.4, 0.14, -7.2, 0, Math.PI / 2), '--pil-rope', 0.008);
      kit.piece(new T.TorusGeometry(0.14, 0.06, 8, 20), at(0.2, 0.06, -2.4, 0, Math.PI / 2), '--pil-tape', 0.006);
      for (var k = 0; k < 4; k++) {
        cyl(0.13, 0.12, 0.22, at(-0.6 + k * 0.32, 0.11, 0.6), '--pil-tin', 0.006, 12);
        kit.piece(new T.CircleGeometry(0.12, 14), at(-0.6 + k * 0.32, 0.225, 0.6, 0, -Math.PI / 2), PAINT[k * 2 % PAINT.length], false, false);
      }

      // THE OLD TELLY on a stump, and the rack of films beside it.
      var VX = -4.0, VZ = -9.6;
      stump(VX, VZ, 0.5, 0.5);
      box(1.8, 1.2, 0.8, at(VX, 1.1, VZ), '--pil-piano', 0.014);

      // THE ROOM'S OWN PAGE, by the gate, on a plywood board.
      var page = kit.screen(1180, 800, 2.4, at(-5.0, 1.42, GZ - 3.2, 0.55), 'The Pile’s own page, by the gate');
      board(-5.0, GZ - 3.2, 0.55, 2.55, 2.1);

      // THE PAGE'S WORDS on boards in the sand.
      var NX = 4.6, NZ = GZ - 2.6, NR = -0.55;
      board(NX, NZ, NR, 1.9, 1.7, '--pil-paper');
      var head = kit.lift(page, '.pil-head', { w: 760, ww: 1.75, m: at(NX, 1.25, NZ + 0.02, NR) });
      kit.lift(page, '.pil-lede', { w: 760, ww: 1.75, m: at(NX, 0.42, NZ + 0.02, NR) });

      // Make something at a pallet bench in front of the den, and what is on
      // the Pile on a board beside it: pile.js finds both and works them.
      var MX = 0.6, MZ = -2.0;
      box(2.4, 0.1, 0.7, at(MX, 0.62, MZ - 0.1), '--pil-pallet', 0.01);
      [-1, 1].forEach(function (s) { box(0.1, 0.62, 0.6, at(MX + s * 1.1, 0.31, MZ - 0.1), '--pil-pallet', 0.008); });
      var make = kit.lift(page, '.pil-part', { n: 1, w: 900, ww: 2.2, m: at(MX, 0.72, MZ - 0.3, 0) });
      var TX2 = 3.4, TZ2 = -2.3, TR = -0.5;
      board(TX2, TZ2, TR, 2.1, 1.9);
      var things = kit.lift(page, '.pil-things', { w: 900, h: 760, ww: 1.95, m: at(TX2, 0.4, TZ2 + 0.02, TR) });

      // Along the left: play is learning, and where junk playgrounds come from.
      var LX = -7.2;
      board(LX, -1.0, Math.PI / 2, 2.0, 2.0);
      var learn = kit.lift(page, '.pil-part', { n: 3, w: 820, h: 820, ww: 1.85, m: at(LX + 0.02, 0.4, -1.0, Math.PI / 2) });
      board(LX, -4.6, Math.PI / 2, 2.0, 2.0);
      var history = kit.lift(page, '.pil-part', { n: 4, w: 820, h: 820, ww: 1.85, m: at(LX + 0.02, 0.4, -4.6, Math.PI / 2) });

      // Along the right: to read, and the house rules.
      var RX = 8.6;
      board(RX, 2.6, -Math.PI / 2, 1.8, 1.6);
      var read = kit.lift(page, '.pil-part', { n: 5, w: 760, ww: 1.65, m: at(RX - 0.02, 0.4, 2.6, -Math.PI / 2) });
      board(RX, -3.2, -Math.PI / 2, 1.9, 1.8);
      var rules = kit.lift(page, '.pil-part', { n: 8, w: 780, h: 760, ww: 1.75, m: at(RX - 0.02, 0.4, -3.2, -Math.PI / 2) });

      // The telly's screen over the set, what is on it and the way back, and
      // the rack on a board beside it; whose it is by the tree.
      var screen = kit.lift(page, '.pil-screen', { w: 820, ww: 1.5, bare: true, m: at(VX, 0.62, VZ + 0.42, 0) });
      kit.lift(page, '.pil-screen__now', { w: 760, ww: 1.4, m: at(VX, 1.85, VZ + 0.42, 0) });
      kit.lift(page, '.pil-screen__back', { w: 640, ww: 1.2, m: at(VX, 2.15, VZ + 0.42, 0) });
      board(-1.4, -10.2, 0.15, 2.1, 1.9);
      var rack = kit.lift(page, '.pil-rack', { w: 900, h: 820, ww: 1.95, m: at(-1.4, 0.4, -10.18, 0.15) });
      board(-8.4, -7.6, 1.0, 1.7, 1.5);
      var whose = kit.lift(page, '.pil-part', { n: 10, w: 760, ww: 1.55, m: at(-8.4 + Math.sin(1.0) * 0.02, 0.4, -7.6 + Math.cos(1.0) * 0.02, 1.0) });

      kit.wire(page, 'rack.js');
      kit.wire(page, 'pile.js');

      return {
        start: { x: 0, z: GZ - 0.6, yaw: 0 },
        bounds: { x: [-8.6, 8.0], z: [-11.2, GZ - 0.3] },
        stops: [
          { name: 'just through the gate, the whole Pile in front of you in plain sun', x: 0, z: GZ - 0.6, yaw: 0, pitch: 0.04 },
          { name: 'at the board by the gate: the Pile’s name and its line', x: NX + Math.sin(NR) * 2.3, z: NZ + Math.cos(NR) * 2.3, yaw: NR, pitch: 0.0, frame: head.el },
          { name: 'at the pallet bench in front of the den: make something', x: MX, z: MZ + 2.2, yaw: 0, pitch: -0.1, frame: make.el },
          { name: 'at the board beside the bench: what is on the Pile', x: TX2 + Math.sin(TR) * 2.4, z: TZ2 + Math.cos(TR) * 2.4, yaw: TR, pitch: 0.0, frame: things.el },
          { name: 'inside the den, under the bubble wrap, the rings of light on the sand', x: DX, z: DZ + 0.4, yaw: 0.3, pitch: -0.55 },
          { name: 'on the left: play is learning', x: LX + 2.4, z: -1.0, yaw: Math.PI / 2, pitch: 0.0, frame: learn.el },
          { name: 'further along the left: where junk playgrounds come from', x: LX + 2.4, z: -4.6, yaw: Math.PI / 2, pitch: 0.0, frame: history.el },
          { name: 'at the old telly on a stump, nothing on it until somebody puts a film up', x: VX, z: VZ + 2.6, yaw: 0, pitch: -0.05, frame: screen.el },
          { name: 'at the rack of films beside the telly: adventure playgrounds, here and there', x: -1.4 + Math.sin(0.15) * 2.4, z: -10.2 + Math.cos(0.15) * 2.4, yaw: 0.15, pitch: 0.0, frame: rack.el },
          { name: 'by the old piano and the slide', x: 4.4, z: -2.4, yaw: -0.9, pitch: 0.05 },
          { name: 'on the right: to read', x: RX - 2.3, z: 2.6, yaw: -Math.PI / 2, pitch: 0.0, frame: read.el },
          { name: 'further along the right: the house rules', x: RX - 2.4, z: -3.2, yaw: -Math.PI / 2, pitch: 0.0, frame: rules.el },
          { name: 'under the big tree by the rope swing: whose it is', x: -6.4, z: -6.4, yaw: 1.0, pitch: 0.0, frame: whose.el },
          { name: 'back at the board by the gate, with the Pile’s own page on it', x: -5.0 + Math.sin(0.55) * 2.7, z: GZ - 3.2 + Math.cos(0.55) * 2.7, yaw: 0.55, pitch: 0.02, page: kit.page, frame: page }
        ]
      };
    }
  };
})();

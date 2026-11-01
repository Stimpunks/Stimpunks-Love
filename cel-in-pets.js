/* =============================================================================
   Pets, walked into on Cel Street. Ryan's ask, 2026-10-31: down the street a
   room at a time.

   IT IS PETS' WORLD AND NOBODY ELSE'S (§127): down on the floor with the
   animals at the end of the day. The dog is asleep on the rug, the cat has
   curled up beside the dog, a rabbit is loafing in what is left of the light,
   and the light in the window is going. NOBODY HAS SWITCHED THE LAMP ON,
   because getting up would mean moving somebody: the lamp stands in the corner
   off, in the room's dark inks and never the light's or the words', and its
   switch lies on the floor on its cord where nobody reached for it.

   YOU ARE DOWN ON THE FLOOR. Cel Street's eye is at one height in every room,
   so this room is built three times its size round it: the eye sits where
   yours would sitting on the boards, the rug and the animals are close and
   big, and the skirting board is at your shoulder.

   THE LIGHT IS THE SKY'S, GOING, THROUGH ONE LOW WINDOW in the far wall on the
   left. No sun is in it: the sky outside is blue above and pale at the foot
   where the last of the day is, behind the trees and a roof. What comes in
   lies level across the floor from the window side, and the rest of the room
   is the dusk. No lamp, no flame and nothing lit in the room, which is what
   keeps it off every lamplit room on the street; one soft wash and nobody's
   corridor, which keeps it off Dead Tired Society.

   THE DOORS ARE PET FLAPS, THIS ROOM'S DRAWINGS: the same forms as the page's
   (tools/make-pets.py's DOORS), one for every Pets room in data/pets.json, in
   its groups, each set into the skirting and sized for whoever uses it, and
   each with its own card off the page over it. A flap whose room can be walked
   into here opens onto it; the others go to their page.

   THE ANIMALS ARE THE PAGE'S OWN DRAWING'S, stood up: nobody's pets and not
   the shelters'. NOTHING MOVES, AT ANY SETTING: everybody is asleep, no tail
   wags and nobody breathes up and down. Every colour is one Pets declares, by
   name. It keeps nothing, sends nothing and fetches nothing; its page arrives
   through Cel Street's screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['pets.html'] = {
    name: 'Pets',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var PI = Math.PI;
      var W = 7.5, D = 15, H = 7.8, back = -D;

      // A sphere stretched to an ellipsoid, outlined, for the animals.
      var blob = function (rx, ry, rz, m, ink, edge) {
        var g = new T.SphereGeometry(1, 20, 14); g.scale(rx, ry, rz);
        kit.piece(g, m, ink, edge == null ? 0.03 : edge);
      };
      // A tail is a tube along a curve, outlined like the fur.
      var tube = function (pts, r, ink) {
        var c = new T.CatmullRomCurve3(pts.map(function (p) { return new T.Vector3(p[0], p[1], p[2]); }));
        kit.piece(new T.TubeGeometry(c, 24, r, 8, false), new T.Matrix4(), ink, 0.03);
      };
      // A flat shape laid on a wall, unlit: the dark of a hole.
      var shape = function (draw, m, ink) {
        var s = new T.Shape(); draw(s);
        kit.flat(new T.ShapeGeometry(s, 24), m, ink);
      };

      // THE DUSK. The room is lit by the sky and nothing else.
      kit.scene.background = kit.col('--pts-night');
      kit.scene.add(new T.HemisphereLight(kit.col('--pts-sky'), kit.col('--pts-floor'), 1.25));

      // THE ROOM: boards, walls, a skirting board all round, and the ceiling,
      // which is the dusk and nobody looks at.
      box(W * 2 + 1, 0.1, D + 1, at(0, -0.05, -D / 2), '--pts-floor', false, false);
      for (var k = -6; k <= 6; k++) box(0.04, 0.012, D, at(k * 1.15, 0.006, -D / 2), '--pts-skirting', false, false);
      box(0.3, H, D, at(-W - 0.15, H / 2, -D / 2), '--pts-wall');
      box(0.3, H, D, at(W + 0.15, H / 2, -D / 2), '--pts-wall');
      box(W * 2 + 0.6, H, 0.3, at(0, H / 2, 0.15), '--pts-wall');
      box(W * 2 + 0.6, 0.2, D + 0.6, at(0, H + 0.1, -D / 2), '--pts-skirting', false, false);
      var SK = 0.36;
      box(0.06, SK, D, at(-W + 0.03, SK / 2, -D / 2), '--pts-skirting', 0.01);
      box(0.06, SK, D, at(W - 0.03, SK / 2, -D / 2), '--pts-skirting', 0.01);
      box(W * 2, SK, 0.06, at(0, SK / 2, -0.03), '--pts-skirting', 0.01);

      // THE FAR WALL AND ITS ONE LOW WINDOW, on the left: the wall in pieces
      // round the opening, the sill, the bars, and the sky behind it.
      var GX0 = -5.7, GX1 = -0.6, SILL = 1.05, TOP = 6.0;
      box(GX0 + W, H, 0.3, at((-W + GX0) / 2, H / 2, back - 0.15), '--pts-wall');
      box(W - GX1, H, 0.3, at((GX1 + W) / 2, H / 2, back - 0.15), '--pts-wall');
      box(GX1 - GX0, SILL, 0.3, at((GX0 + GX1) / 2, SILL / 2, back - 0.15), '--pts-wall');
      box(GX1 - GX0, H - TOP, 0.3, at((GX0 + GX1) / 2, (TOP + H) / 2, back - 0.15), '--pts-wall');
      box(W * 2, SK, 0.06, at(0, SK / 2, back + 0.03), '--pts-skirting', 0.01);
      box(GX1 - GX0 + 0.8, 0.14, 0.55, at((GX0 + GX1) / 2, SILL + 0.07, back + 0.15), '--pts-skirting');
      box(0.16, TOP - SILL, 0.18, at((GX0 + GX1) / 2, (SILL + TOP) / 2, back - 0.1), '--pts-skirting', false);
      box(GX1 - GX0, 0.16, 0.18, at((GX0 + GX1) / 2, 3.7, back - 0.1), '--pts-skirting', false);
      [GX0, GX1].forEach(function (x) { box(0.2, TOP - SILL + 0.2, 0.34, at(x, (SILL + TOP) / 2, back - 0.12), '--pts-skirting'); });
      box(GX1 - GX0 + 0.2, 0.2, 0.34, at((GX0 + GX1) / 2, TOP, back - 0.12), '--pts-skirting');
      // The sky: blue above, paler lower, and the last of the day at its foot.
      var sky = function (y0, y1, ink) {
        kit.flat(new T.PlaneGeometry(GX1 - GX0 + 3, y1 - y0), at((GX0 + GX1) / 2, (y0 + y1) / 2, back - 2.4), ink);
      };
      sky(4.6, 9, '--pts-zenith'); sky(2.7, 4.6, '--pts-sky'); sky(-1, 2.7, '--pts-glow');
      // The trees and a neighbour's roof, against it.
      var tx = GX0 - 1.2, n = 0;
      while (tx < GX1 + 1.2) {
        var r = 0.4 + ((n * 37) % 10) / 10 * 0.5;
        kit.flat(new T.CircleGeometry(r, 22), at(tx, 1.15 + r * 0.3, back - 2.3), '--pts-night');
        tx += r * (1.1 + ((n * 53) % 7) / 14); n++;
      }
      kit.flat(new T.PlaneGeometry(GX1 - GX0 + 3, 2.6), at((GX0 + GX1) / 2, -0.1, back - 2.29), '--pts-night');
      shape(function (s) { s.moveTo(-1, 0); s.lineTo(-1, 1.1); s.lineTo(0, 1.9); s.lineTo(1, 1.1); s.lineTo(1, 0); s.lineTo(-1, 0); },
        at(-2.0, 1.1, back - 2.28), '--pts-night');

      // THE LAST OF THE LIGHT, coming in level through the window from the
      // sky outside and lying across the floor from that side.
      var lt = new T.Vector3(1.5, 0, -6);
      var dusk = new T.DirectionalLight(kit.col('--pts-sky'), 2.4);
      dusk.position.set(-9, 5.7, -30);
      dusk.target.position.copy(lt);
      dusk.castShadow = true;
      dusk.shadow.mapSize.set(2048, 2048);
      var sc = dusk.shadow.camera;
      sc.left = -14; sc.right = 14; sc.top = 14; sc.bottom = -14; sc.near = 1; sc.far = 70;
      dusk.shadow.bias = -0.0005; dusk.shadow.normalBias = 0.04;
      kit.scene.add(dusk, dusk.target);
      // What the window lets in fills the room softly from that side, too, so
      // everything has its window side lit and the rest in the dusk.
      var fill = new T.DirectionalLight(kit.col('--pts-sky'), 0.9);
      fill.position.set(-9, 5.7, -30);
      fill.target.position.copy(lt);
      kit.scene.add(fill, fill.target);

      // THE RUG, in front of you, and the animals asleep on it.
      var rug = new T.CylinderGeometry(1, 1, 0.05, 48); rug.scale(4.75, 1, 2.75);
      kit.piece(rug, at(1.2, 0.025, -7.6), '--pts-flap', false, false);
      rug = new T.CylinderGeometry(1, 1, 0.05, 48); rug.scale(4.55, 1, 2.6);
      kit.piece(rug, at(1.2, 0.05, -7.6), '--pts-rug', false, false);
      var ring = new T.TorusGeometry(1, 0.016, 4, 64); ring.rotateX(-PI / 2); ring.scale(4.2, 1, 2.32);
      kit.piece(ring, at(1.2, 0.08, -7.6), '--pts-flap', false, false);

      // The dog, curled, chin on its paws, facing the window.
      blob(1.05, 0.5, 0.62, at(0.6, 0.5, -7.45, 0.12), '--pts-dog');
      blob(0.62, 0.52, 0.56, at(1.4, 0.52, -7.35), '--pts-dog');
      tube([[1.95, 0.3, -7.3], [2.05, 0.18, -6.85], [1.6, 0.14, -6.62], [0.95, 0.13, -6.68]], 0.12, '--pts-dog');
      blob(0.46, 0.12, 0.14, at(-0.6, 0.13, -6.98, 0.1), '--pts-dog');
      blob(0.44, 0.12, 0.14, at(-0.5, 0.13, -7.3, 0.1), '--pts-dog');
      blob(0.42, 0.34, 0.38, at(-0.42, 0.42, -7.2), '--pts-dog');
      blob(0.27, 0.18, 0.21, at(-0.84, 0.33, -7.1), '--pts-dog');
      blob(0.075, 0.06, 0.07, at(-1.1, 0.37, -7.06), '--pts-night', false);
      blob(0.24, 0.06, 0.3, at(-0.25, 0.66, -6.98, 0.3, 0, -0.5), '--pts-dog');
      box(0.16, 0.025, 0.02, at(-0.62, 0.5, -6.84, 0.1), '--pts-night', false);

      // The cat, curled up beside the dog, its head tucked and its tail round
      // its feet, its stripes faint.
      blob(0.58, 0.32, 0.44, at(3.40, 0.32, -7.90, -0.2), '--pts-cat');
      blob(0.27, 0.25, 0.26, at(2.80, 0.34, -7.55), '--pts-cat');
      [-1, 1].forEach(function (s) {
        var ear = new T.ConeGeometry(0.1, 0.22, 4);
        kit.piece(ear, at(2.77 + s * 0.13, 0.62, -7.57, 0, 0, -s * 0.25), '--pts-cat', 0.02);
      });
      tube([[3.95, 0.2, -7.75], [3.85, 0.12, -7.4], [3.35, 0.1, -7.33], [2.8, 0.1, -7.37]], 0.09, '--pts-cat');
      [3.2, 3.45, 3.7].forEach(function (x) { box(0.05, 0.03, 0.5, at(x, 0.62, -7.9, -0.2), '--pts-skirting', false); });
      box(0.12, 0.022, 0.02, at(2.71, 0.36, -7.30), '--pts-night', false);

      // The rabbit, loafing in what is left of the light, ears laid back.
      blob(0.46, 0.3, 0.34, at(-3.2, 0.3, -11.0, 0.3), '--pts-sheen');
      blob(0.22, 0.2, 0.2, at(-3.62, 0.32, -10.78), '--pts-sheen');
      blob(0.3, 0.06, 0.1, at(-3.36, 0.5, -10.86, 0.35, 0, -0.18), '--pts-sheen');
      blob(0.28, 0.06, 0.1, at(-3.33, 0.47, -10.66, 0.3, 0, -0.12), '--pts-sheen');
      box(0.08, 0.02, 0.02, at(-3.72, 0.36, -10.6, 0.3), '--pts-night', false);

      // THE LAMP, OFF, in the far corner on the right: its shade and its dark
      // bulb in the room's dark inks, and its switch lying on the floor on its
      // cord where nobody reached for it. Nothing about it is lit.
      var LX = 6.2, LZ = back + 1.0;
      cyl(0.55, 0.62, 0.1, at(LX, 0.05, LZ), '--pts-flap', 0.02, 24);
      cyl(0.06, 0.06, 4.6, at(LX, 2.35, LZ), '--pts-flap', 0.015, 10);
      var shade = new T.CylinderGeometry(0.55, 0.95, 1.05, 28, 1, true);
      kit.piece(shade, at(LX, 5.0, LZ), '--pts-flap', 0.02);
      kit.piece(new T.SphereGeometry(0.14, 14, 10), at(LX, 4.6, LZ), '--pts-skirting', 0.015);
      tube([[LX - 0.4, 0.04, LZ + 0.35], [LX - 0.6, 0.04, LZ + 1.1], [4.9, 0.05, back + 2.4], [4.6, 0.05, back + 2.55]], 0.03, '--pts-skirting');
      box(0.42, 0.13, 0.22, at(4.4, 0.065, back + 2.65, 0.4), '--pts-skirting', 0.015);
      cyl(0.05, 0.05, 0.03, at(4.4, 0.14, back + 2.65), '--pts-flap', false, 12);
      tube([[4.2, 0.05, back + 2.75], [5.6, 0.05, back + 3.1], [W - 0.4, 0.06, back + 3.2], [W - 0.06, 0.28, back + 3.2]], 0.03, '--pts-skirting');
      box(0.06, 0.22, 0.32, at(W - 0.03, 0.3, back + 3.2), '--pts-flap', 0.01);

      // THE PET FLAPS, the page's own forms, one for every Pets room, each in
      // its piece of skirting and sized for whoever uses it. The light's ink
      // lies down the window side of each.
      var glow = function (g, x, y, h) { box(0.06, h, 0.03, M(g, at(x, y, 0.13)), '--pts-glow', false, false); };
      var disc = function (g, r, x, y, z, ink, edge) { cyl(r, r, 0.06, M(g, at(x, y, z, 0, PI / 2)), ink, edge == null ? 0.015 : edge, 32); };
      var FORMS = {
        catflap: function (g) {
          box(0.84, 0.84, 0.08, M(g, at(0, 0.62, 0.04)), '--pts-skirting', 0.015);
          box(0.6, 0.6, 0.06, M(g, at(0, 0.62, 0.1)), '--pts-flap', 0.012);
          box(0.66, 0.1, 0.05, M(g, at(0, 0.96, 0.13)), '--pts-sheen', false);
          box(0.18, 0.07, 0.04, M(g, at(0, 0.38, 0.15)), '--pts-night', false);
          glow(g, -0.44, 0.62, 0.6);
          return 1.04;
        },
        dogdoor: function (g) {
          box(1.22, 1.42, 0.08, M(g, at(0, 0.79, 0.04)), '--pts-skirting', 0.015);
          for (var s = 0; s < 4; s++) box(0.25, 1.15, 0.05, M(g, at(-0.42 + s * 0.28, 0.68, 0.1)), '--pts-flap', 0.01);
          box(1.08, 0.12, 0.05, M(g, at(0, 1.33, 0.12)), '--pts-sheen', false);
          glow(g, -0.63, 0.75, 1.2);
          return 1.5;
        },
        mousehole: function (g) {
          shape(function (s) { s.moveTo(-0.45, 0); s.lineTo(-0.45, 0.3); s.absarc(0, 0.3, 0.45, PI, 0, true); s.lineTo(0.45, 0); s.lineTo(-0.45, 0); },
            M(g, at(0, 0, 0.01)), '--pts-night');
          box(0.6, 0.025, 0.01, M(g, at(0, 0.12, 0.02)), '--pts-sheen', false, false);
          box(0.5, 0.025, 0.01, M(g, at(0, 0.26, 0.02)), '--pts-sheen', false, false);
          glow(g, -0.48, 0.3, 0.55);
          return 0.75;
        },
        porthole: function (g) {
          disc(g, 0.5, 0, 0.72, 0.04, '--pts-skirting');
          disc(g, 0.38, 0, 0.72, 0.09, '--pts-flap');
          disc(g, 0.15, 0, 0.7, 0.13, '--pts-sky');
          box(0.6, 0.08, 0.03, M(g, at(0, 1.0, 0.13)), '--pts-sheen', false);
          glow(g, -0.52, 0.72, 0.5);
          return 1.22;
        },
        propped: function (g) {
          kit.flat(new T.PlaneGeometry(1.0, 1.15), M(g, at(0, 0.62, 0.01)), '--pts-night');
          kit.flat(new T.PlaneGeometry(0.86, 0.55), M(g, at(0, 0.88, 0.02)), '--pts-sky');
          kit.flat(new T.PlaneGeometry(0.86, 0.42), M(g, at(0, 0.36, 0.02)), '--pts-skirting');
          kit.flat(new T.CircleGeometry(0.11, 20), M(g, at(0.24, 0.36, 0.03)), '--pts-zenith');
          [-1, 1].forEach(function (s) { box(0.1, 1.2, 0.1, M(g, at(s * 0.52, 0.62, 0.05)), '--pts-skirting', 0.012); });
          box(1.14, 0.1, 0.1, M(g, at(0, 1.22, 0.05)), '--pts-skirting', 0.012);
          box(1.1, 0.05, 0.6, M(g, at(0, 1.4, 0.3, 0, -0.55)), '--pts-flap', 0.012);
          glow(g, -0.58, 0.62, 1.1);
          return 1.62;
        },
        hatch: function (g) {
          kit.flat(new T.PlaneGeometry(1.6, 0.8), M(g, at(0, 1.1, 0.01)), '--pts-night');
          box(1.72, 0.3, 0.12, M(g, at(0, 1.62, 0.06)), '--pts-flap', 0.012);
          [1.56, 1.66].forEach(function (y) { box(1.72, 0.02, 0.01, M(g, at(0, y, 0.13)), '--pts-night', false, false); });
          box(1.86, 0.12, 0.42, M(g, at(0, 0.66, 0.2)), '--pts-skirting', 0.012);
          box(0.36, 0.1, 0.1, M(g, at(0, 0.77, 0.26)), '--pts-ink', 0.01);
          [-1, 1].forEach(function (s) { [-1, 1].forEach(function (u) { kit.piece(new T.SphereGeometry(0.06, 10, 8), M(g, at(s * 0.2, 0.77, 0.26 + u * 0.05)), '--pts-ink', 0.01); }); });
          glow(g, -0.82, 1.1, 0.75);
          return 1.82;
        },
        barn: function (g) {
          box(1.32, 1.32, 0.06, M(g, at(0, 0.72, 0.03)), '--pts-skirting', 0.015);
          box(1.1, 1.1, 0.07, M(g, at(0, 0.72, 0.08)), '--pts-flap', 0.012);
          [-0.18, 0.18].forEach(function (x) { box(0.02, 1.05, 0.01, M(g, at(x, 0.72, 0.12)), '--pts-night', false, false); });
          [0.38, 1.06].forEach(function (y) { box(1.1, 0.15, 0.03, M(g, at(0, y, 0.13)), '--pts-sheen', 0.008); });
          box(1.08, 0.12, 0.03, M(g, at(0, 0.72, 0.15, 0, 0, Math.atan2(0.6, 0.9))), '--pts-sheen', 0.008);
          glow(g, -0.68, 0.72, 1.1);
          return 1.38;
        },
        lens: function (g) {
          disc(g, 0.6, 0, 0.8, 0.04, '--pts-skirting');
          disc(g, 0.47, 0, 0.8, 0.08, '--pts-night', false);
          disc(g, 0.28, 0, 0.8, 0.12, '--pts-sky');
          var rim = new T.TorusGeometry(0.29, 0.03, 6, 32);
          kit.piece(rim, M(g, at(0, 0.8, 0.15)), '--pts-zenith', false);
          kit.piece(new T.SphereGeometry(0.06, 10, 8), M(g, at(-0.1, 0.9, 0.17)), '--pts-ink', false);
          glow(g, -0.62, 0.8, 0.6);
          return 1.4;
        }
      };
      // In the page's groups and order: the shelters along the right-hand
      // wall, somewhere to go with them along the left, and the animals of
      // another kind in the far wall between the window and the lamp. Each
      // has its card off the page over it, its drawing left out because the
      // flap is here.
      var FLAPS = [
        { page: 'rescue-a-cat.html', name: 'Rescue A Cat', form: 'catflap', wall: 'right', at: -4.4, what: 'the cat flap' },
        { page: 'rescue-a-dog.html', name: 'Rescue A Dog', form: 'dogdoor', wall: 'right', at: -7.7, what: 'the dog door hung in strips' },
        { page: 'rescue-small-animals.html', name: 'Rescue Small Animals', form: 'mousehole', wall: 'right', at: -11.0, what: 'the hole in the skirting' },
        { page: 'pekoe-and-purrs.html', name: 'Pekoe and Purrs', form: 'porthole', wall: 'left', at: -3.6, what: 'the round flap with a window in it' },
        { page: 'the-run.html', name: 'the Run', form: 'propped', wall: 'left', at: -6.6, what: 'the dog door propped open on the field' },
        { page: 'truckin-food-court.html', name: 'Truckin’ Food Court', form: 'hatch', wall: 'left', at: -9.8, what: 'the hatch with a treat on its ledge' },
        { page: 'all-needs-met.html', name: 'All Needs Met Wildlife Sanctuary', form: 'barn', wall: 'far', at: 1.4, what: 'the little barn door' },
        { page: 'chimera-obscura.html', name: 'Chimera Obscura', form: 'lens', wall: 'far', at: 3.9, what: 'the flap with a lens in it' }
      ];
      var walls = {
        right: function (a) { return { g: at(W, 0, a, -PI / 2), x: W - 3.6, z: a, yaw: -PI / 2 }; },
        left: function (a) { return { g: at(-W, 0, a, PI / 2), x: -W + 3.6, z: a, yaw: PI / 2 }; },
        far: function (a) { return { g: at(a, 0, back, 0), x: a, z: back + 3.6, yaw: 0 }; }
      };

      // THE ROOM'S OWN PAGE, on the wall behind you, low enough to read from
      // the floor, and how co-regulation is not only people beside it.
      var pw = 1180, ph = 800, ww = 4.4;
      box(ww + 0.24, ww * ph / pw + 0.24, 0.08, at(-3.0, 2.75, -0.08, PI), '--pts-skirting', 0.015);
      var frame = kit.screen(pw, ph, ww, at(-3.0, 2.75, -0.13, PI), 'Pets’ own page, on the wall behind you');
      var coreg = kit.lift(frame, '.pts-part', { n: 0, w: 640, h: 760, ww: 3.4, m: at(3.2, 0.9, -0.1, PI) });

      var stops = [
        { where: 'down on the floor by the rug, the light in the window going and nobody getting up to switch the lamp on', name: 'down on the floor', x: 0.2, z: -2.6, yaw: 0, pitch: 0.02 },
        { where: 'beside the dog and the cat, asleep on the rug', name: 'beside the dog and the cat', x: 2.6, z: -4.2, yaw: 0.12, pitch: -0.3 },
        { where: 'by the rabbit, loafing in what is left of the light', name: 'by the rabbit', x: -2.4, z: -8.0, yaw: 0.28, pitch: -0.25 },
        { where: 'at the window, the last of the day at the foot of the sky', name: 'at the window', x: -3.1, z: -10.6, yaw: 0, pitch: 0.18 },
        { where: 'at the lamp in the corner, off, its switch lying on the floor where nobody reached for it', name: 'at the lamp', x: 2.3, z: -9.4, yaw: Math.atan2(-(LX - 2.3), -(LZ - (-9.4))), pitch: 0.16 }
      ];
      FLAPS.forEach(function (f, i) {
        var w = walls[f.wall](f.at), top = FORMS[f.form](w.g);
        kit.lift(frame, '.pts-door', { n: i, w: 300, ww: 1.9, drop: '.pts-door__art', m: M(w.g, at(0, top + 0.35, 0.06)) });
        stops.push({ where: 'at ' + f.what + ', the way through to ' + f.name, name: f.name, page: f.page, x: w.x, z: w.z, yaw: w.yaw, pitch: 0.1 });
      });
      stops.push(
        { where: 'at the wall behind you, with the room’s own page on it', name: 'at the room’s own page', x: -3.0, z: -4.4, yaw: PI, pitch: 0.18, page: kit.page, frame: frame },
        { where: 'at the wall behind you, with how co-regulation is not only people', name: 'at co-regulation', x: 3.2, z: -4.6, yaw: PI, pitch: 0.2, frame: coreg.el }
      );

      return {
        start: { x: 0.2, z: -2.6, yaw: 0 },
        bounds: { x: [-W + 1.0, W - 1.0], z: [back + 1.4, -1.2] },
        stops: stops
      };
    }
  };
})();

/* =============================================================================
   The Watering Hole, walked into on Cel Street, through its door upstairs at
   Cavendish Coworking. Ryan's ask, 2026-11-01: the rooms behind the doors.

   IT IS THE ROOM'S OWN WORLD AND SHARES NOTHING WITH THE HOUSE IT OPENS OFF
   (§74). The house is green daylight through canvas blinds, every door shut;
   this is a pan of water in the Namib at noon, with the door you came through
   standing shut on its own in the sand behind you. The sun is straight
   overhead and out of sight, so the sand is bleached nearly white, nothing
   stands between it and the sky, and every shadow is a dark pool directly
   under the thing that casts it and nowhere else. One pool of water in the
   whole view, the dunes far off, and the animals people have seen at those
   waterholes set down round it, each drawn once. Nobody is drawn.

   THE NEIGHBOURS ARE NOT ECHOED. The Campfire next door is a fire in a
   clearing at night, every shadow pointing away from the middle; the Cave is a
   tunnel in glacier ice lit by nothing in it. So there is no night here, no
   flame, no blue but the water, and if a shadow ever falls to one side the sun
   has gone down and the room has gone with it.

   NOTHING MOVES AT ANY SETTING, the heat shimmer included: it is drawn, and it
   stays drawn. The screen by the water plays only what somebody presses.

   THE WORDS ARE THE PAGE'S OWN, lifted off it and never retyped, each on a
   board left out in the sun: the room's name and its line, how it goes here,
   the screen by the water and its rack, played as on the page through
   love-embed.js and rack.js, why a pan at noon, and whose words, David
   Thornburg's name on them as the page has it. The room's call and its radio
   stay on its page, which stands by the door, because they talk to the CB.

   Every colour is one §74 declares, by name. It keeps nothing, sends nothing
   and fetches nothing; its page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['cavendish-watering-hole.html'] = {
    name: 'The Watering Hole',
    from: 'cavendish-coworking.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var PX = 0, PZ = -6.5, PRX = 3.2, PRZ = 2.2;   // the pool: its middle and its two radii

      // THE LIGHT IS THE MIDDAY SUN, straight down. The sky gives a little light
      // to every side, so nothing is black; the sun gives the tops of things
      // their light and throws each shadow directly under its thing.
      kit.scene.background = kit.col('--wh-board');
      kit.scene.add(new T.HemisphereLight(kit.col('--wh-board'), kit.col('--wh-dune'), 1.6));
      var sun = new T.DirectionalLight(kit.col('--wh-board'), 2.4);
      sun.position.set(0.001, 40, 0.001);
      sun.target.position.set(0, 0, 0);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      sun.shadow.camera.left = -22; sun.shadow.camera.right = 22;
      sun.shadow.camera.top = 22; sun.shadow.camera.bottom = -22;
      sun.shadow.camera.near = 1; sun.shadow.camera.far = 60;
      sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
      kit.scene.add(sun, sun.target);

      // A round thing squashed to a shape: a body, a head, a dune.
      function blob(x, y, z, sx, sy, sz, ink, ry, line) {
        var g = new T.SphereGeometry(1, 18, 12); g.scale(sx, sy, sz);
        kit.piece(g, at(x, y, z, ry || 0), ink, line === undefined ? 0.012 : line);
      }
      function leg(x, z, h, r, ink) { cyl(r, r * 0.8, h, at(x, h / 2, z), ink, 0.008, 8); }
      // THE SHADOW straight under a thing: a dark pool on the sand the shape of
      // what is overhead it, and nowhere else.
      function shade(x, z, rx, rz, ry) {
        var g = new T.CircleGeometry(1, 28); g.scale(rx, rz, 1);
        kit.flat(g, M(at(x, 0.012, z, ry || 0), at(0, 0, 0, 0, -Math.PI / 2)), '--wh-shade');
      }
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };

      // THE SAND, bleached, out to the dunes on every side.
      kit.piece(new T.PlaneGeometry(220, 220), at(0, 0, 0, 0, -Math.PI / 2), '--wh-sand', false, false);

      // THE DUNES, far off and low, so the horizon is the farthest on the street.
      [[-38, -48, 16, 4.2, 9], [-12, -56, 20, 5.5, 10], [16, -52, 18, 4.8, 9], [42, -44, 15, 3.8, 8],
       [-52, -14, 12, 3.2, 14], [54, -10, 13, 3.4, 15], [-46, 22, 14, 3.0, 12], [48, 26, 12, 2.8, 12],
       [0, 52, 22, 3.6, 10]].forEach(function (d) {
        blob(d[0], 0, d[1], d[2], d[3], d[4], '--wh-dune', 0, false);
      });

      // THE POOL, the one water in the view, with a band of wet sand round it.
      var rim = new T.CircleGeometry(1, 48); rim.scale(PRX + 0.55, PRZ + 0.55, 1);
      kit.piece(rim, at(PX, 0.01, PZ, 0, -Math.PI / 2), '--wh-panel', false, false);
      var water = new T.CircleGeometry(1, 48); water.scale(PRX, PRZ, 1);
      kit.piece(water, at(PX, 0.02, PZ, 0, -Math.PI / 2), '--wh-pool', false, false);

      // THE DOOR you came through, standing shut on its own in the sand behind
      // you, its shadow a strip at its foot.
      var DZ = 8.6;
      box(0.12, 2.3, 0.18, at(-0.58, 1.15, DZ), '--wh-ink', 0.01);
      box(0.12, 2.3, 0.18, at(0.58, 1.15, DZ), '--wh-ink', 0.01);
      box(1.28, 0.12, 0.18, at(0, 2.3, DZ), '--wh-ink', 0.01);
      box(1.04, 2.2, 0.07, at(0, 1.1, DZ), '--wh-dim', 0.01);
      cyl(0.04, 0.04, 0.05, at(0.34, 1.05, DZ - 0.07, 0, Math.PI / 2), '--wh-water', false, 10);
      shade(0, DZ, 0.68, 0.12);

      // THE ANIMALS round the water, each drawn once, standing still, each with
      // its shadow straight under it.
      // An elephant at the rim, its trunk down to the water.
      (function (x, z) {
        blob(x, 1.55, z, 1.05, 0.8, 0.7, '--wh-hide');
        blob(x + 0.95, 1.75, z, 0.45, 0.45, 0.42, '--wh-hide');
        box(0.06, 0.62, 0.55, at(x + 0.7, 1.8, z - 0.38, 0.3), '--wh-hide', 0.008);
        box(0.06, 0.62, 0.55, at(x + 0.7, 1.8, z + 0.38, -0.3), '--wh-hide', 0.008);
        cyl(0.12, 0.07, 1.4, at(x + 1.35, 1.05, z, 0, 0, 0.35), '--wh-hide', 0.008, 8);
        [[-0.55, -0.35], [-0.55, 0.35], [0.5, -0.35], [0.5, 0.35]].forEach(function (l) { leg(x + l[0], z + l[1], 1.0, 0.17, '--wh-hide'); });
        shade(x + 0.15, z, 1.2, 0.7);
      })(PX - PRX - 1.1, PZ - 0.6);
      // A giraffe across the pool, neck up.
      (function (x, z) {
        blob(x, 2.05, z, 0.75, 0.42, 0.36, '--wh-rust');
        cyl(0.12, 0.17, 1.7, at(x - 0.55, 2.85, z, 0, 0, 0.42), '--wh-rust', 0.008, 8);
        blob(x - 0.95, 3.65, z, 0.3, 0.14, 0.13, '--wh-rust');
        [[-0.45, -0.18], [-0.45, 0.18], [0.45, -0.18], [0.45, 0.18]].forEach(function (l) { leg(x + l[0], z + l[1], 1.75, 0.06, '--wh-rust'); });
        shade(x - 0.2, z, 0.85, 0.32);
      })(PX + 1.4, PZ - PRZ - 1.6);
      // A rhino at the far edge, low and heavy.
      (function (x, z) {
        blob(x, 0.95, z, 0.95, 0.55, 0.5, '--wh-hide');
        blob(x - 0.9, 0.85, z, 0.4, 0.3, 0.3, '--wh-hide');
        cyl(0.01, 0.08, 0.32, at(x - 1.2, 1.1, z, 0, 0, 0.3), '--wh-panel', 0.006, 8);
        [[-0.5, -0.28], [-0.5, 0.28], [0.5, -0.28], [0.5, 0.28]].forEach(function (l) { leg(x + l[0], z + l[1], 0.6, 0.13, '--wh-hide'); });
        shade(x - 0.2, z, 1.15, 0.5);
      })(PX - 2.4, PZ - PRZ - 3.0);
      // A gemsbok on the near left, its long straight horns back.
      (function (x, z) {
        blob(x, 1.05, z, 0.62, 0.32, 0.28, '--wh-fawn', 0.6);
        blob(x + Math.cos(0.6) * 0.72, 1.32, z - Math.sin(0.6) * 0.72, 0.2, 0.17, 0.15, '--wh-fawn', 0.6);
        var hx = x + Math.cos(0.6) * 0.62, hz = z - Math.sin(0.6) * 0.62;
        cyl(0.02, 0.012, 0.9, at(hx, 1.75, hz - 0.05, 0.6, 0, 0.45), '--wh-ink', false, 6);
        cyl(0.02, 0.012, 0.9, at(hx, 1.75, hz + 0.05, 0.6, 0, 0.45), '--wh-ink', false, 6);
        [[-0.35, -0.12], [-0.35, 0.12], [0.35, -0.12], [0.35, 0.12]].forEach(function (l) {
          leg(x + l[0] * Math.cos(0.6) + l[1] * Math.sin(0.6), z - l[0] * Math.sin(0.6) + l[1] * Math.cos(0.6), 0.8, 0.045, '--wh-fawn');
        });
        shade(x, z, 0.62, 0.28, 0.6);
      })(PX - 2.4, PZ + PRZ + 0.8);
      // Two springbok on the right, rust flank and pale belly.
      [[PX + PRX + 0.8, PZ + 0.6], [PX + PRX + 1.6, PZ - 0.5]].forEach(function (s) {
        var x = s[0], z = s[1];
        blob(x, 0.85, z, 0.45, 0.22, 0.2, '--wh-rust', Math.PI);
        blob(x, 0.76, z, 0.4, 0.12, 0.16, '--wh-board', Math.PI, false);
        blob(x - 0.48, 1.05, z, 0.14, 0.12, 0.1, '--wh-rust', Math.PI);
        [[-0.25, -0.08], [-0.25, 0.08], [0.25, -0.08], [0.25, 0.08]].forEach(function (l) { leg(x + l[0], z + l[1], 0.66, 0.03, '--wh-fawn'); });
        shade(x - 0.1, z, 0.5, 0.2);
      });
      // An ostrich past the giraffe, its neck and legs dust-grey.
      (function (x, z) {
        blob(x, 1.35, z, 0.42, 0.3, 0.3, '--wh-ink');
        cyl(0.05, 0.06, 1.0, at(x + 0.22, 2.0, z, 0, 0, -0.15), '--wh-hide', 0.006, 8);
        blob(x + 0.3, 2.5, z, 0.1, 0.08, 0.08, '--wh-hide');
        leg(x - 0.08, z - 0.1, 1.1, 0.035, '--wh-hide');
        leg(x - 0.08, z + 0.1, 1.1, 0.035, '--wh-hide');
        shade(x, z, 0.42, 0.3);
      })(PX + 4.2, PZ - PRZ - 2.4);

      // THE BOARDS, left out in the sun: a low pale plinth for each of the
      // page's parts to stand on, its shadow under it.
      function spot(x, z, ry) { return { x: x, z: z, ry: ry }; }
      function plinth(s, w) {
        box(w, 0.4, 0.34, at(s.x, 0.2, s.z, s.ry), '--wh-board', 0.012);
        shade(s.x, s.z, w / 2 + 0.04, 0.21, s.ry);
      }
      function foot(s, y, back) {
        var b = back || 0;
        return at(s.x - Math.sin(s.ry) * b, y, s.z - Math.cos(s.ry) * b, s.ry);
      }
      // Where to stand to read a board: d in front of it, looking at it.
      function front(name, s, d, pitch, more) {
        var o = { name: name, x: s.x + Math.sin(s.ry) * d, z: s.z + Math.cos(s.ry) * d, yaw: s.ry, pitch: pitch || 0.05 };
        for (var k in more) o[k] = more[k];
        return o;
      }

      // THE ROOM'S OWN PAGE, standing by the door on two posts, with its call
      // and its radio on it.
      var PG = spot(3.4, 6.6, -1.2), pgw = 2.4, pgh = pgw * 800 / 1180, pgy = 0.55 + pgh / 2;
      box(pgw + 0.14, pgh + 0.14, 0.06, foot(PG, pgy, 0.05), '--wh-ink', 0.01);
      [-1, 1].forEach(function (side) {
        box(0.1, pgy - pgh / 2, 0.1, at(PG.x + Math.cos(PG.ry) * side * (pgw / 2 - 0.2) - Math.sin(PG.ry) * 0.08, (pgy - pgh / 2) / 2, PG.z - Math.sin(PG.ry) * side * (pgw / 2 - 0.2) - Math.cos(PG.ry) * 0.08, PG.ry), '--wh-ink', 0.008);
      });
      shade(PG.x - Math.sin(PG.ry) * 0.05, PG.z - Math.cos(PG.ry) * 0.05, pgw / 2 + 0.08, 0.1, PG.ry);
      var page = kit.screen(1180, 800, pgw, foot(PG, pgy, -0.01), 'The Watering Hole’s own page, by the door, with its call');

      // THE ROOM'S NAME AND ITS LINE, on the left as you come in.
      var HD = spot(-4.4, 1.6, 0.75), LD = spot(-6.4, -0.6, 0.95);
      plinth(HD, 1.9); plinth(LD, 1.9);
      var head = kit.lift(page, '.wh-head', { drop: '.wh-head__art', w: 760, ww: 1.7, m: foot(HD, 0.4) });
      var lede = kit.lift(page, '.lede', { w: 760, ww: 1.7, m: foot(LD, 0.4) });

      // HOW IT GOES HERE, further round on the left.
      var NM = spot(-7.2, -4.6, 1.1);
      plinth(NM, 1.9);
      var norms = kit.lift(page, '.wh-part', { n: 0, w: 760, ww: 1.7, m: foot(NM, 0.4) });

      // THE SCREEN BY THE WATER, on a board on the right: giving off nothing
      // until somebody presses it, what is on it under it, the way back to the
      // desert under that; and the rack along the board beside it.
      var SC = spot(5.6, -2.4, -0.8);
      box(2.6, 2.3, 0.08, foot(SC, 1.55, 0.1), '--wh-dune', 0.012);
      [-1, 1].forEach(function (side) {
        box(0.1, 0.42, 0.1, at(SC.x + Math.cos(SC.ry) * side * 1.1 - Math.sin(SC.ry) * 0.1, 0.21, SC.z - Math.sin(SC.ry) * side * 1.1 - Math.cos(SC.ry) * 0.1, SC.ry), '--wh-ink', 0.008);
      });
      shade(SC.x - Math.sin(SC.ry) * 0.1, SC.z - Math.cos(SC.ry) * 0.1, 1.32, 0.12, SC.ry);
      var screen = kit.lift(page, '.wh-screen', { w: 860, ww: 2.2, m: foot(SC, 1.25) });
      kit.lift(page, '.wh-screen__now', { w: 760, ww: 2.0, m: foot(SC, 0.92) });
      kit.lift(page, '.wh-screen__back', { w: 640, ww: 1.6, m: foot(SC, 0.5) });
      var RK = spot(6.8, 1.4, -1.15);
      plinth(RK, 2.1);
      var rack = kit.lift(page, '.wh-rack', { w: 860, h: 900, ww: 1.9, m: foot(RK, 0.4) });

      // WHY A PAN AT NOON, past the water on the left; WHOSE WORDS past it on
      // the right, David Thornburg's name on them as the page has it.
      var WY = spot(-5.4, -10.4, 0.85), WH = spot(5.6, -10.2, -0.75);
      plinth(WY, 1.8); plinth(WH, 1.7);
      var why = kit.lift(page, '.wh-part', { n: 3, w: 760, ww: 1.6, m: foot(WY, 0.4) });
      var whose = kit.lift(page, '.wh-part', { n: 4, w: 760, ww: 1.5, m: foot(WH, 0.4) });

      kit.wire(page, 'rack.js');

      return {
        start: { x: 0, z: 6.6, yaw: 0 },
        bounds: { x: [-8.4, 8.4], z: [-13, 7.6] },
        stops: [
          { name: 'just through the door, standing shut in the sand behind you: the pool, the animals round it, the dunes far off', x: 0, z: 6.6, yaw: 0, pitch: 0.06 },
          { name: 'at the water’s edge, every shadow a dark pool straight under its thing', x: PX + 0.4, z: PZ + PRZ + 1.4, yaw: 0, pitch: -0.12 },
          front('at the first board: the room’s name and its line', HD, 2.6, 0.08, { frame: head.el }),
          front('at the next board: what the Watering Hole is for', LD, 2.6, 0.08, { frame: lede.el }),
          front('at the board on the left: how it goes here', NM, 2.6, 0.08, { frame: norms.el }),
          front('at the screen by the water, giving off nothing until somebody presses it', SC, 2.6, 0.08, { frame: screen.el }),
          front('at the rack beside the screen: the waterholes, otters and jellies', RK, 2.6, 0.04, { frame: rack.el }),
          front('past the water on the left: why a pan at noon', WY, 2.5, 0.08, { frame: why.el }),
          front('past the water on the right: whose words these are', WH, 2.5, 0.08, { frame: whose.el }),
          front('by the door, with the room’s own page standing in the sand, its call and its radio', PG, 2.4, 0.05, { page: kit.page, frame: page })
        ]
      };
    }
  };
})();

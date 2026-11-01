/* =============================================================================
   Rescue Small Animals, walked into on Cel Street. Ryan's ask, 2026-10-31:
   back on the street, working down it a room at a time.

   IT IS RESCUE SMALL ANIMALS' WORLD AND NOBODY ELSE'S (§89): under the
   floorboards of the shop. THE LIGHT IS THE DAY THROUGH THE CRACKS BETWEEN THE
   BOARDS, AND IT ONLY SHOWS WHERE IT LANDS: overhead the boards are dark, the
   cracks are thin straight lines of day, and below, the light lies on the dust
   as long pale strips, parallel, from above, and never seen in the air. Nobody
   holds it, which keeps it off Rescue A Cat's torch next door; it is many lines
   rather than one wedge, which keeps it off Dead Tired Society; there is no
   lamp and no brown, which keeps it off the Latibulum; it is lines rather than
   points, which keeps it off Stay Frosty; and it is nothing like Rescue A
   Dog's sun on snow.

   THE PLACES ARE THE PAGE'S OWN: the hatch you came down through, the strips
   on the dust, the hutches along the wall with their doors open and straw in
   them, and a handful of hay lying in a strip, which is the room's job marker.
   THERE IS NO ANIMAL IN THE SCENE. The animals are the shelter's, read when the
   page opens, and the page is on a board standing in a strip, where rescuing
   and adopting work as they do on the page (shelter.js talks to the CB, so it
   is never wired here, and no card of the shelter's is lifted). Nothing is
   written on the hutches: no name, no number, nothing about who rescued
   anybody. Only the sign, the page's own picture, is lifted whole.

   NOTHING MOVES. Every colour is one Rescue Small Animals declares, by name.
   It keeps nothing, sends nothing and fetches nothing; its page arrives
   through Cel Street's screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['rescue-small-animals.html'] = {
    name: 'Rescue Small Animals',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var PI = Math.PI;
      var front = function (x, z, ry, d) { return { x: x + Math.sin(ry) * d, z: z + Math.cos(ry) * d, yaw: ry }; };

      var W = 12, D = 17, H = 2.5, BACK = -D;
      // The day comes down through the cracks a little aslant, so a strip on
      // the dust lies to one side of the crack it came through.
      var SLANT = 0.16, toDay = new T.Vector3(SLANT, 1, 0.05).normalize();
      var land = function (x) { return x - H * SLANT; };

      // UNDER THE FLOOR: dark, and only the day through the cracks.
      kit.scene.background = kit.col('--rsa-dust');
      kit.scene.add(new T.HemisphereLight(kit.col('--rsa-board'), kit.col('--rsa-dust'), 1.1));
      var mid = new T.Vector3(0, 0, -D / 2);
      var day = new T.DirectionalLight(kit.col('--rsa-crack'), 2.4);
      day.position.copy(mid).addScaledVector(toDay, 30);
      day.target.position.copy(mid);
      day.castShadow = true;
      day.shadow.mapSize.set(4096, 4096);
      var sc = day.shadow.camera;
      sc.left = -10.5; sc.right = 10.5; sc.top = 10.5; sc.bottom = -10.5; sc.near = 1; sc.far = 60;
      day.shadow.bias = -0.0004; day.shadow.normalBias = 0.02;
      kit.scene.add(day, day.target);

      // THE DUST, and the walls of the space under the shop.
      box(W, 0.1, D + 1, at(0, -0.05, -D / 2), '--rsa-dust', false, false);
      box(0.3, H, D, at(-W / 2 - 0.15, H / 2, -D / 2), '--rsa-board', false, false);
      box(0.3, H, D, at(W / 2 + 0.15, H / 2, -D / 2), '--rsa-board', false, false);
      box(W + 0.6, H, 0.3, at(0, H / 2, BACK - 0.15), '--rsa-board', false, false);
      box(W + 0.6, H, 0.3, at(0, H / 2, 0.65), '--rsa-board', false, false);

      // THE BOARDS OVERHEAD, running the length of the shop, and between some
      // of them a crack of day where they have shrunk apart, never the whole
      // way: each crack opens for a length, closes, and opens again. The
      // boards are what throws the dark; each crack is a line of day on their
      // underside, and a strip on the dust below.
      var BW = 0.42, CRACK = 0.07;
      var CRACKS = {
        2: [[-0.6, -3.4], [-5.2, -9.8], [-12.4, -14.6]],
        6: [[-1.8, -6.9], [-8.4, -11.0], [-13.0, -16.4]],
        9: [[-0.4, -2.6], [-4.0, -8.6], [-10.6, -15.2]],
        13: [[-2.2, -5.0], [-6.6, -12.8], [-14.4, -16.2]],
        17: [[-0.6, -4.4], [-7.0, -9.2], [-11.0, -15.6]],
        21: [[-3.0, -7.6], [-9.6, -13.6]],
        25: [[-1.0, -2.8], [-4.6, -10.4], [-12.2, -16.6]]
      };
      var HATCH = { x: 0.2, z: -1.0, w: 1.1, d: 1.1 };
      var x0 = -W / 2, lines = [];
      for (var b = 0; x0 < W / 2 - 0.01; b++) {
        var w = Math.min(BW, W / 2 - x0);
        var cx = x0 + w / 2;
        var acrossHatch = cx + w / 2 > HATCH.x - HATCH.w / 2 && cx - w / 2 < HATCH.x + HATCH.w / 2;
        if (acrossHatch) {
          // The hatch you came down through: the boards stop round it.
          var zA = HATCH.z + HATCH.d / 2, zB = HATCH.z - HATCH.d / 2;
          box(w - 0.006, 0.05, 0.65 - zA, at(cx, H + 0.025, (0.65 + zA) / 2), '--rsa-board', false, true);
          box(w - 0.006, 0.05, zB - BACK, at(cx, H + 0.025, (zB + BACK) / 2), '--rsa-board', false, true);
        } else {
          box(w - 0.006, 0.05, D + 1, at(cx, H + 0.025, -D / 2), '--rsa-board', false, true);
        }
        x0 += w;
        if (CRACKS[b]) {
          var lx = x0 + CRACK / 2, open = CRACKS[b], z = 0.65;
          lines.push({ x: lx, open: open });
          // Where the crack is shut, the boards meet: fill it.
          open.concat([[BACK, BACK]]).forEach(function (o) {
            if (z > o[0]) box(CRACK, 0.05, z - o[0], at(lx, H + 0.025, (z + o[0]) / 2), '--rsa-board', false, true);
            z = o[1];
          });
          x0 += CRACK;
        }
      }
      // Something solid over the boards, so the day only comes in at the cracks.
      box(W + 1, 0.04, D + 2, at(0, H + 0.11, -D / 2), '--rsa-board', false, true);
      // Joists across under the boards, every couple of paces, and the piers
      // they stand on. Each joist throws its bar of dark across the strips.
      var JOISTS = [];
      for (var jz = -1.9; jz > BACK; jz -= 2.4) {
        if (Math.abs(jz - HATCH.z) > 0.7) { JOISTS.push(jz); box(W, 0.2, 0.12, at(0, H - 0.1, jz), '--rsa-board', 0.012, true); }
      }
      [-3.6, 3.6].forEach(function (px) {
        for (var pz = -3.0; pz > BACK + 1; pz -= 4.8) box(0.42, H - 0.2, 0.42, at(px, (H - 0.2) / 2, pz), '--rsa-board', 0.015);
      });

      // Each crack's lines of day on the boards' underside, and its strips
      // lying on the dust a little to one side, cut where a joist's dark falls.
      var DZ = (H - 0.1) * toDay.z / toDay.y;
      lines.forEach(function (ln) {
        ln.open.forEach(function (o) {
          kit.flat(new T.PlaneGeometry(CRACK, o[0] - o[1]), at(ln.x, H - 0.004, (o[0] + o[1]) / 2, 0, PI / 2), '--rsa-crack');
          var cuts = [o[0]];
          JOISTS.forEach(function (jz) { var sz = jz - DZ; if (sz < o[0] && sz > o[1]) cuts.push(sz + 0.09, sz - 0.09); });
          cuts.push(o[1]);
          for (var c = 0; c < cuts.length; c += 2) {
            if (cuts[c] - cuts[c + 1] < 0.05) continue;
            kit.flat(new T.PlaneGeometry(0.2, cuts[c] - cuts[c + 1]), at(land(ln.x), 0.006, (cuts[c] + cuts[c + 1]) / 2, 0, -PI / 2), '--rsa-lit');
          }
        });
      });
      // The open hatch: the day through it, and its square of light on the dust.
      kit.flat(new T.PlaneGeometry(HATCH.w, HATCH.d), at(HATCH.x, H + 0.08, HATCH.z, 0, PI / 2), '--rsa-crack');
      kit.flat(new T.PlaneGeometry(HATCH.w, HATCH.d), at(land(HATCH.x), 0.007, HATCH.z, 0, -PI / 2), '--rsa-lit');
      // The steps down from it.
      var steps = at(HATCH.x, 0, HATCH.z + 0.1);
      [-0.45, 0.45].forEach(function (s) {
        box(0.07, 2.75, 0.09, M(steps, at(s, 1.3, -0.22, 0, -0.28)), '--rsa-dim', 0.012);
      });
      for (var r = 0; r < 7; r++) box(0.84, 0.05, 0.08, M(steps, at(0, 0.3 + r * 0.34, -0.06 - r * 0.098)), '--rsa-dim', false);

      // THE HAY, lying in a strip by the hatch: the room's job marker.
      var hayX = land(lines[3].x);
      for (var h = 0; h < 22; h++) {
        var hx = hayX - 0.15 + ((h * 37) % 30) / 100, hz = -3.2 - ((h * 53) % 70) / 100;
        cyl(0.008, 0.008, 0.34 + (h % 4) * 0.05, at(hx, 0.02, hz, (h * 1.3) % PI, 0, PI / 2), '--rsa-link', false, 4);
      }

      // THE HUTCHES along the right-hand wall, facing into the space, their
      // doors open, straw inside, and nothing written on them anywhere.
      var HUTCH = [-4.0, -6.4, -8.8, -11.2, -13.6];
      HUTCH.forEach(function (z, k) {
        var u = at(5.1, 0, z, -PI / 2);
        box(1.9, 0.08, 0.95, M(u, at(0, 0.5, 0)), '--rsa-dim', 0.012);
        box(1.9, 0.08, 0.95, M(u, at(0, 1.3, 0)), '--rsa-dim', 0.012);
        box(1.9, 0.86, 0.06, M(u, at(0, 0.9, -0.45)), '--rsa-board', false);
        [-0.92, 0, 0.92].forEach(function (x) { box(0.08, 1.3, 0.08, M(u, at(x, 0.65, 0.44)), '--rsa-dim', 0.012); });
        box(0.06, 0.8, 0.9, M(u, at(0, 0.9, 0)), '--rsa-board', false);
        // Straw in each half, catching the day where a strip crosses it.
        [-0.46, 0.46].forEach(function (x) { box(0.8, 0.06, 0.8, M(u, at(x, 0.57, -0.02)), '--rsa-link', false); });
        // The doors, wire on a frame, swung open.
        [-0.46, 0.46].forEach(function (x, s) {
          var hinge = M(u, at(x - 0.42, 0.9, 0.47, s ? -1.1 : -1.3));
          box(0.84, 0.04, 0.03, M(hinge, at(0.42, 0.36, 0)), '--rsa-dim', false);
          box(0.84, 0.04, 0.03, M(hinge, at(0.42, -0.36, 0)), '--rsa-dim', false);
          box(0.04, 0.76, 0.03, M(hinge, at(0.82, 0, 0)), '--rsa-dim', false);
          for (var g = 0.12; g < 0.8; g += 0.14) box(0.012, 0.72, 0.012, M(hinge, at(g, 0, 0)), '--rsa-dim', false);
        });
        if (k % 2) box(0.7, 0.04, 0.5, M(u, at(-0.3, 0.02, 0.9)), '--rsa-link', false, false);
      });

      // A water bowl, in a strip out on the dust.
      cyl(0.17, 0.13, 0.08, at(land(lines[4].x), 0.04, -8.0), '--rsa-dim', 0.01, 16);
      kit.flat(new T.CircleGeometry(0.13, 16), at(land(lines[4].x), 0.081, -8.0, 0, -PI / 2), '--rsa-crack');

      // THE BOARD standing in a strip on the left, with the room's own page on
      // it: where the animals are, and where rescuing and adopting work.
      var NB = { x: -3.9, z: -6.6, ry: PI / 2 - 0.35 };
      var nb = at(NB.x, 0, NB.z, NB.ry);
      [-1, 1].forEach(function (s) { box(0.12, H - 0.05, 0.12, M(nb, at(s * 1.42, (H - 0.05) / 2, -0.08)), '--rsa-board'); });
      box(2.95, 1.98, 0.08, M(nb, at(0, 1.38, -0.08)), '--rsa-board', 0.015);
      var page = kit.screen(1180, 800, 2.66, M(nb, at(0, 1.38, -0.02)), 'Rescue Small Animals’ own page, on the board in the strip of day');

      // THE SIGN, the page's own picture, on the back wall; and HOW RESCUING AND
      // ADOPTING WORK and THE GAME on the left wall. All the page's own words;
      // nothing the shelter reads is lifted.
      var sign = kit.lift(page, '.rsa-head', { w: 720, ww: 2.0, m: at(-0.6, 0.5, BACK + 0.04) });
      var how = kit.lift(page, '.rsa-part', { n: 4, w: 640, h: 700, ww: 1.7, m: at(-W / 2 + 0.04, 0.45, -11.2, PI / 2) });
      var game = kit.lift(page, '.rsa-part', { n: 5, w: 640, ww: 1.6, m: at(-W / 2 + 0.04, 0.9, -14.4, PI / 2) });

      var stops = [
        { where: 'at the foot of the steps from the hatch, the day lying in strips on the dust', name: 'at the foot of the steps', x: 0.2, z: -2.2, yaw: 0, pitch: -0.12 },
        { where: 'at the hay lying in a strip of day', name: 'at the hay', x: hayX + 0.2, z: -2.0, yaw: 0.1, pitch: -0.75 },
        { where: 'looking up at the cracks between the boards', name: 'looking up at the cracks', x: -1.0, z: -5.0, yaw: 0.3, pitch: 0.75 }
      ];
      var at1 = front(NB.x, NB.z, NB.ry, 2.8);
      stops.push({ where: 'at the board in the strip of day, with the room’s own page on it, where the animals are', name: 'at the board', x: at1.x, z: at1.z, yaw: at1.yaw, pitch: 0.02, page: kit.page, frame: page });
      stops.push({ where: 'at the hutches along the wall, their doors open and straw in them', name: 'at the hutches', x: 1.6, z: -7.6, yaw: -PI / 2 + 0.25, pitch: -0.18 });
      stops.push({ where: 'at the water bowl, out in a strip of day', name: 'at the water bowl', x: 1.0, z: -6.0, yaw: -0.2, pitch: -0.5 });
      stops.push({ where: 'at the far wall, with the room’s sign on it', name: 'at the sign', x: -0.6, z: BACK + 3.0, yaw: 0, pitch: 0.05, frame: sign.el });
      stops.push({ where: 'at how rescuing and adopting work, on the left-hand wall', name: 'at how it works', x: -W / 2 + 2.6, z: -11.2, yaw: PI / 2, pitch: 0.06, frame: how.el });
      stops.push({ where: 'at where the game came from, on the left-hand wall', name: 'at the game', x: -W / 2 + 2.4, z: -14.4, yaw: PI / 2, pitch: 0.1, frame: game.el });

      return {
        start: { x: 0.2, z: -2.2, yaw: 0 },
        bounds: { x: [-W / 2 + 0.8, W / 2 - 1.8], z: [BACK + 1.2, -0.4] },
        stops: stops
      };
    }
  };
})();

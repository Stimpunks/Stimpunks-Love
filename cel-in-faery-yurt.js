/* =============================================================================
   The Faery Yurt, walked into on Cel Street. Ryan's ask, 2026-10-31: pitch 01
   on the campgrounds, through its post in the field.

   IT IS HELEN EDGAR'S ROOM AND HER WORLD (§14), and this is OURS: a drawing of
   her yurt for Cel Street, in her own declared colours and nothing else, which
   changes nothing on her page and is hers to keep or send back, as the field's
   sign for her pitch is. Warm on purpose where the field it is pitched on is
   cold: you walk in out of the night air. A round tent of canvas over a timber
   lattice, roof poles up to the crown with the night in it, fairy lights
   strung low under the canvas, one candle's light filling it, and round the
   wall the things in her room, each a way through to where it goes on her
   page: the bookcase to the Reading Room, the phonograph to the Music Room,
   the curtain to the Cinema, the Alchemist's Arch to Myths and Legends, the
   glowing mushroom under the Glimmer Window to Glow Wild Hollow, the round
   door to the Play Pod. Her stove with the fly agarics round it, the hollow
   stump, the egg chair in the nook, the pebble bowl by the door. Her own page
   hangs on the far wall, facing the door.

   NOTHING MOVES. Her lights twinkle on her page at MAX; here they are lit and
   still at every setting, as the field's drawing of her tent is. Every colour
   is one her room declares, by name. It keeps nothing, sends nothing and
   fetches nothing; her page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 11, 374761393) ^ Math.imul(j + 37, 668265263) ^ Math.imul(k + 41, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['faery-yurt.html'] = {
    name: 'The Faery Yurt',
    from: 'campgrounds.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, R = 6, H = 2.1, CROWN = 3.9, N = 28;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var DEG = Math.PI / 180;
      // A place round the wall, turned to face the middle: θ = 0 is the far
      // wall, facing the door, and θ grows to the right.
      function round(theta, r, y) { return at(r * Math.sin(theta), y || 0, -r * Math.cos(theta), -theta); }

      // CANDLELIGHT, warm, from the middle, and the night through the crown.
      kit.scene.background = kit.col('--hearth');
      kit.scene.add(new T.HemisphereLight(kit.col('--tallow-2'), kit.col('--hearth'), 1.3));
      var candle = new T.PointLight(kit.col('--candle'), 26, 16, 1.3);
      candle.position.set(0, 2.4, -0.5);
      kit.scene.add(candle);
      var stove = new T.PointLight(kit.col('--ember'), 6, 5, 1.6);
      stove.position.set(-4.2, 0.6, -1.4);
      kit.scene.add(stove);
      // And the night through the crown: a little of her moon stone's purple
      // coming down on everything the candle does not reach, so the shade is
      // cool where the light is warm.
      var moon = new T.DirectionalLight(kit.col('--moonstone-2'), 0.45);
      moon.position.set(0.6, 10, 0.4);
      kit.scene.add(moon);
      // The fairy lights strung round the wall throw a little of their own
      // warmth onto the canvas just under them, so the lower walls and the
      // lattice catch the light rather than going to the dark of the night
      // outside: a soft wash between the things round the wall, never on
      // them, in her candle colour.
      [-160, -128, -84, -52, 8, 52, 88, 126, 160].forEach(function (deg) {
        var wash = new T.PointLight(kit.col('--candle'), 5.5, 4.2, 1.3);
        var wa = deg * Math.PI / 180;
        wash.position.set((R - 1.3) * Math.sin(wa), 1.25, -(R - 1.3) * Math.cos(wa));
        kit.scene.add(wash);
      });

      // THE FLOOR: boards laid across, each joint a dark line, and a round
      // rug woven in rings: an ember edge, a band of little diamonds, ivy and
      // a pale middle.
      kit.cyl(R + 0.3, R + 0.3, 0.1, at(0, -0.05, 0), '--timber', false, 36);
      for (var bz = -R; bz <= R; bz += 0.34) {
        var half = Math.sqrt(Math.max(0, R * R - bz * bz));
        if (half > 0.2) box(half * 2, 0.004, 0.018, at(0, 0.002, bz), '--hearth', false, false);
      }
      kit.cyl(3.2, 3.2, 0.03, at(0, 0.02, 0), '--ember', false, 36);
      kit.cyl(2.95, 2.95, 0.03, at(0, 0.035, 0), '--canvas-2', false, 36);
      kit.cyl(2.7, 2.7, 0.03, at(0, 0.04, 0), '--ember-2', false, 36);
      kit.cyl(2.6, 2.6, 0.03, at(0, 0.045, 0), '--canvas-2', false, 36);
      var diamond = new T.PlaneGeometry(0.14, 0.14);
      for (var dm = 0; dm < 44; dm++) {
        var da = dm / 44 * Math.PI * 2;
        kit.flat(diamond.clone(), at(2.32 * Math.sin(da), 0.064, -2.32 * Math.cos(da), 0, -Math.PI / 2, Math.PI / 4 + da), dm % 2 ? '--tallow-3' : '--moonstone-2');
      }
      kit.cyl(2.05, 2.05, 0.03, at(0, 0.05, 0), '--ivy-2', false, 36);
      kit.cyl(1.75, 1.75, 0.03, at(0, 0.055, 0), '--tent', false, 36);

      // THE LOW TABLE in the middle, set for whoever comes in: a teapot and
      // cups, a little stack of books and three candles, lit and still.
      kit.cyl(0.62, 0.62, 0.06, at(0, 0.36, 0), '--timber', 0.02, 24);
      [0, 1, 2].forEach(function (l) { var la = l / 3 * Math.PI * 2 + 0.4; kit.cyl(0.04, 0.05, 0.34, at(0.42 * Math.sin(la), 0.17, 0.42 * Math.cos(la)), '--timber', false, 6); });
      var pot = new T.SphereGeometry(0.14, 14, 10); pot.scale(1, 0.85, 1);
      kit.piece(pot, at(-0.18, 0.5, 0.05), '--tallow-2', 0.012);
      kit.piece(new T.TorusGeometry(0.08, 0.018, 6, 12, Math.PI), at(-0.33, 0.52, 0.05, 0, 0, Math.PI / 2), '--tallow-2', false);
      kit.cyl(0.02, 0.03, 0.14, at(-0.02, 0.53, 0.05, 0, 0, -0.9), '--tallow-2', false, 6);
      kit.cyl(0.07, 0.07, 0.03, at(-0.18, 0.62, 0.05), '--tallow-2', false, 12);
      [[0.22, 0.25], [0.3, -0.15]].forEach(function (c) { kit.cyl(0.05, 0.04, 0.08, at(c[0], 0.43, c[1]), c[0] > 0.25 ? '--moonstone-2' : '--ember-2', 0.008, 10); });
      [['--ember', 0.05], ['--ivy', 0.09], ['--moonstone', 0.13]].forEach(function (bk, n) {
        box(0.3 - n * 0.03, 0.04, 0.22 - n * 0.02, at(0.05, 0.41 + n * 0.045, -0.32, 0.2 + n * 0.25), bk[0], 0.006);
      });
      function candleAt(m, h) {
        kit.cyl(0.035, 0.035, h, M(m, at(0, h / 2, 0)), '--tallow', 0.006, 10);
        var flame = new T.ConeGeometry(0.022, 0.07, 8); flame.translate(0, 0.035, 0);
        kit.flat(flame, M(m, at(0, h + 0.005, 0)), '--candle');
      }
      [[0.3, 0.12, 0.16], [0.38, 0.0, 0.11], [0.24, -0.02, 0.21]].forEach(function (c) { candleAt(at(c[0], 0.39, c[1]), c[2]); });
      // Floor cushions round it, plump and a little squashed.
      [['--ember-2', 0.3], ['--ivy', 1.9], ['--moonstone-2', 3.4], ['--ember', 4.7]].forEach(function (c, n) {
        var cush = new T.SphereGeometry(0.42, 16, 10); cush.scale(1, 0.32, 1);
        var ca = c[1];
        kit.piece(cush, at(1.15 * Math.sin(ca), 0.15, 1.15 * Math.cos(ca), ca), c[0], 0.02);
        kit.piece(new T.SphereGeometry(0.045, 6, 4), at(1.15 * Math.sin(ca), 0.29, 1.15 * Math.cos(ca)), '--tallow-3', false);
      });

      // THE WALL: canvas panels round, a timber lattice inside them, and a
      // gap at the door.
      var pw = 2 * Math.PI * R / N * 1.04;
      for (var i = 0; i < N; i++) {
        var th = i / N * Math.PI * 2;
        if (Math.abs(th - Math.PI) < 9 * DEG) continue;
        box(pw, H, 0.1, round(th, R, H / 2), i % 2 ? '--canvas' : '--canvas-2', false);
        [-1, 1].forEach(function (s) {
          box(0.04, Math.hypot(pw, H) * 0.98, 0.04, M(round(th, R - 0.08, H / 2), at(0, 0, 0, 0, 0, s * Math.atan2(pw, H))), '--timber', false);
        });
      }
      // The door frame, and the night past it.
      var dg = round(Math.PI, R, 0);
      [-1, 1].forEach(function (s) { box(0.16, 1.95, 0.2, M(dg, at(s * 0.85, 0.975, 0)), '--timber'); });
      box(1.86, 0.16, 0.2, M(dg, at(0, 1.95, 0)), '--timber');
      // A mat inside it, and a basket of blankets to one side for anybody
      // coming in cold.
      box(1.2, 0.02, 0.7, M(dg, at(0, 0.02, -0.6)), '--canvas-2', false, false);
      for (var mt = 0; mt < 6; mt++) box(1.1, 0.005, 0.03, M(dg, at(0, 0.035, -0.35 - mt * 0.1)), '--tallow-3', false, false);
      var bk2 = M(dg, at(1.5, 0, -0.55));
      kit.cyl(0.3, 0.26, 0.4, M(bk2, at(0, 0.2, 0)), '--tallow-3', 0.015, 14);
      [['--ember-2', 0.44], ['--ivy', 0.52], ['--moonstone-2', 0.58]].forEach(function (b, n) {
        var roll = new T.CylinderGeometry(0.11, 0.11, 0.48, 10); roll.rotateZ(Math.PI / 2);
        kit.piece(roll, M(bk2, at(0, b[1], -0.08 + n * 0.08, (n - 1) * 0.4)), b[0], 0.01);
      });
      // Ivy, grown up the lattice and along its top in places.
      [[-30, 10], [-130, -100], [45, 60], [150, 170]].forEach(function (run, rn) {
        for (var lv = 0; lv < 22; lv++) {
          var la2 = (run[0] + (run[1] - run[0]) * hash(lv, rn, 21)) * DEG, ly2 = H - 0.08 - hash(lv, rn, 22) * (lv % 4 === 0 ? 1.4 : 0.35);
          var lf = new T.SphereGeometry(0.075, 6, 4); lf.scale(1, 0.55, 0.3);
          kit.piece(lf, M(round(la2, R - 0.2, ly2), at(0, 0, 0.02, 0, 0, hash(lv, rn, 23) * 3)), lv % 3 ? '--ivy' : '--ivy-2', false);
        }
      });

      // THE ROOF: canvas up to the crown, the poles under it, the crown ring
      // open to the night.
      var roof = new T.CylinderGeometry(0.75, R + 0.02, CROWN - H, N, 1, true);
      roof.scale(-1, 1, 1); roof.computeVertexNormals();
      kit.piece(roof, at(0, (CROWN + H) / 2, 0), '--canvas', false);
      for (i = 0; i < N; i++) {
        var a = i / N * Math.PI * 2;
        var p0 = new T.Vector3((R - 0.1) * Math.sin(a), H, -(R - 0.1) * Math.cos(a));
        var p1 = new T.Vector3(0.8 * Math.sin(a), CROWN - 0.05, -0.8 * Math.cos(a));
        var dir = p1.clone().sub(p0), mid = p0.clone().add(p1).multiplyScalar(0.5);
        var pole = new T.CylinderGeometry(0.035, 0.035, dir.length(), 5);
        pole.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), dir.normalize()));
        kit.piece(pole, at(mid.x, mid.y, mid.z), '--timber', false);
      }
      kit.piece(new T.TorusGeometry(0.78, 0.07, 6, 28), at(0, CROWN, 0, 0, Math.PI / 2), '--timber', 0.02);

      // FAIRY LIGHTS strung low under the canvas, in swags from pole to pole.
      var bulb = new T.SphereGeometry(0.035, 6, 4);
      for (i = 0; i < N; i++) {
        var a0 = i / N * Math.PI * 2, a1 = (i + 1) / N * Math.PI * 2;
        for (var t = 0; t < 7; t++) {
          var u = t / 7, aa = a0 + (a1 - a0) * u, sag = Math.sin(u * Math.PI) * 0.28, rr = R - 0.35;
          kit.piece(bulb.clone(), at(rr * Math.sin(aa), H - 0.05 - sag, -rr * Math.cos(aa)), '--candle', false);
        }
      }
      var small = new T.SphereGeometry(0.026, 6, 4);
      // And swags hung from pole to pole under the roof, over everybody's
      // heads, each on its own thin wire.
      [[-70, 20], [35, 125], [-125, -60], [70, 135]].forEach(function (sw, j) {
        var A = new T.Vector3((R - 1.4) * Math.sin(sw[0] * DEG), H + 0.55, -(R - 1.4) * Math.cos(sw[0] * DEG));
        var B = new T.Vector3((R - 1.4) * Math.sin(sw[1] * DEG), H + 0.55, -(R - 1.4) * Math.cos(sw[1] * DEG));
        var prev = A;
        for (var k = 1; k <= 30; k++) {
          var v = k / 30, P = A.clone().lerp(B, v);
          P.y -= Math.sin(v * Math.PI) * (0.38 + (j % 2) * 0.08);
          var seg = P.clone().sub(prev), wire = new T.CylinderGeometry(0.006, 0.006, seg.length(), 3);
          wire.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), seg.clone().normalize()));
          var mid2 = prev.clone().add(P).multiplyScalar(0.5);
          kit.piece(wire, at(mid2.x, mid2.y, mid2.z), '--timber', false);
          if (k < 30) kit.piece(small.clone(), at(P.x, P.y - 0.03, P.z), '--candle', false);
          prev = P;
        }
      });
      // The lantern the candlelight comes from, hung under the crown on a
      // chain: a timber cage and the candle in it.
      kit.cyl(0.01, 0.01, CROWN - 2.65, at(0, (CROWN + 2.65) / 2, -0.5), '--timber', false, 4);
      box(0.3, 0.04, 0.3, at(0, 2.64, -0.5), '--timber', 0.01);
      box(0.3, 0.04, 0.3, at(0, 2.26, -0.5), '--timber', 0.01);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { box(0.025, 0.4, 0.025, at(c[0] * 0.13, 2.45, -0.5 + c[1] * 0.13), '--timber', false); });
      kit.flat(new T.SphereGeometry(0.1, 12, 8), at(0, 2.42, -0.5), '--candle');
      // The night in the crown: stars, in her tallow.
      for (var sr = 0; sr < 40; sr++) {
        var sa = hash(sr, 7, 1) * Math.PI * 2, sd = Math.sqrt(hash(sr, 7, 2)) * 0.66;
        kit.flat(new T.CircleGeometry(0.008 + hash(sr, 7, 3) * 0.012, 5), at(Math.cos(sa) * sd, CROWN + 0.5, Math.sin(sa) * sd, 0, Math.PI / 2), sr % 5 ? '--tallow-3' : '--tallow');
      }
      kit.flat(new T.CircleGeometry(0.8, 28), at(0, CROWN + 0.52, 0, 0, Math.PI / 2), '--hearth');

      var stops = [{ name: 'just inside the door, out of the night air', x: 0, z: R - 1.2, yaw: 0 }];
      function stop(theta, name, page, room) { stops.push({ name: name, room: room, page: page, x: (R - 3.3) * Math.sin(theta), z: -(R - 3.3) * Math.cos(theta), yaw: -theta, pitch: -0.08 }); }

      // HER OWN PAGE on the far wall, facing the door, in a timber frame.
      var sw0 = 2.4, sh0 = sw0 * 800 / 1180, sy0 = 0.28 + sh0 / 2;
      var pg = round(0, R - 0.14, 0);
      box(sw0 + 0.2, sh0 + 0.2, 0.06, M(pg, at(0, sy0, 0)), '--timber');
      var frame = kit.screen(1180, 800, sw0, M(pg, at(0, sy0, 0.04)), 'Helen Edgar’s Faery Yurt’s own page, on the far wall facing the door');
      stops.push({ name: 'at the far wall, with her room’s own page on it', x: 0, z: -(R - 2.3), yaw: 0, page: kit.page, frame: frame });

      // THE BOOKCASE, to the Reading Room: a timber case and her spines.
      var bc = round(35 * DEG, R - 0.45, 0);
      box(1.4, 1.9, 0.4, M(bc, at(0, 0.95, -0.05)), '--timber');
      var SPINES = ['--ember', '--ivy', '--candle', '--moonstone-2', '--toadstool', '--tallow-2', '--ember-2', '--ivy-2', '--moonstone', '--tallow-3', '--ember', '--ivy'];
      [0.42, 0.98, 1.54].forEach(function (y, row) {
        box(1.3, 0.04, 0.34, M(bc, at(0, y - 0.24, 0.0)), '--canvas-2', false);
        for (var b = 0, x = -0.58; b < 9 && x < 0.55; b++) {
          var bw = 0.07 + hash(row, b, 1) * 0.06, bh = 0.3 + hash(row, b, 2) * 0.14;
          box(bw, bh, 0.26, M(bc, at(x + bw / 2, y - 0.22 + bh / 2, 0.04)), SPINES[(row * 4 + b) % SPINES.length], 0.01);
          x += bw + 0.012;
        }
      });
      // Books that did not fit, stacked on the floor beside it.
      [[0.95, 0], [1.25, 0.35]].forEach(function (pile, pn) {
        for (var bb = 0; bb < 4 + pn; bb++) {
          box(0.32 - bb * 0.02, 0.06, 0.24, M(bc, at(pile[0], 0.03 + bb * 0.062, 0.2 + pile[1], (hash(bb, pn, 5) - 0.5) * 0.5)), SPINES[(bb * 3 + pn) % SPINES.length], 0.006);
        }
      });
      stop(35 * DEG, 'at the bookcase, the way through to the Reading Room', 'faery-reading-room.html', 'The Reading Room');

      // THE PHONOGRAPH on its little table, to the Music Room.
      var ph = round(70 * DEG, R - 0.8, 0);
      box(0.8, 0.7, 0.6, M(ph, at(0, 0.35, 0)), '--timber');
      box(0.5, 0.18, 0.44, M(ph, at(0, 0.79, 0)), '--canvas-2');
      kit.cyl(0.2, 0.2, 0.02, M(ph, at(0, 0.89, 0)), '--hearth', false, 20);
      // The horn: a real flared bell, turned out to the room and a little
      // up, as a phonograph's is, its narrow throat down to the box on a
      // short arm. Drawn twice, outside and in, so the inside of the bell is
      // there when you look into it, and darker the deeper it goes.
      var flare = [];
      for (var hp = 0; hp <= 14; hp++) {
        var hv = hp / 14;
        flare.push(new T.Vector2(0.025 + 0.31 * Math.pow(hv, 3.2), hv * 0.62));
      }
      var hornDir = new T.Vector3(-0.5, 0.42, 0.5).normalize();
      var hornTurn = new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), hornDir);
      var outer = new T.LatheGeometry(flare, 26);
      outer.applyQuaternion(hornTurn); outer.translate(0, 0.98, -0.16);
      kit.piece(outer, ph, '--ember-2', 0.01);
      var innerHorn = new T.LatheGeometry(flare.map(function (v) { return new T.Vector2(v.x * 0.94, v.y); }), 26);
      innerHorn.scale(-1, 1, 1);
      innerHorn.applyQuaternion(hornTurn); innerHorn.translate(0, 0.98, -0.16);
      kit.piece(innerHorn, ph, '--ember', false);
      var bellAt = hornDir.clone().multiplyScalar(0.62).add(new T.Vector3(0, 0.98, -0.16));
      var rim = new T.TorusGeometry(0.335, 0.016, 6, 26);
      rim.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 0, 1), hornDir));
      rim.translate(bellAt.x, bellAt.y, bellAt.z);
      kit.piece(rim, ph, '--ember-2', 0.008);
      kit.cyl(0.03, 0.03, 0.14, M(ph, at(0, 0.92, -0.16)), '--hearth', false, 8);
      stop(70 * DEG, 'at the phonograph, the way through to the Music Room', 'faery-music-room.html', 'The Music Room');

      // THE CURTAIN, to the Cinema: canvas drawn back from a doorway.
      var cu = round(108 * DEG, R - 0.12, 0);
      box(1.3, 1.95, 0.05, M(cu, at(0, 0.975, -0.02)), '--hearth', false);
      [-1, 1].forEach(function (s) {
        for (var f = 0; f < 4; f++) kit.cyl(0.07, 0.11, 1.9, M(cu, at(s * (0.5 + f * 0.09), 0.97, 0.06)), f % 2 ? '--toadstool' : '--ember', false, 8);
      });
      stop(108 * DEG, 'at the curtain, the way through to the Cinema', 'faery-cinema-room.html', 'The Cinema');

      // THE EGG CHAIR in the regulation nook.
      var eg = round(145 * DEG, R - 1.2, 0);
      var egg = new T.SphereGeometry(0.75, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.82);
      egg.scale(1, 1.25, 1);
      kit.piece(egg, M(eg, at(0, 1.0, 0, 0, -1.25)), '--ivy-2', 0.03);
      kit.cyl(0.5, 0.5, 0.18, M(eg, at(0, 0.52, 0.08)), '--ivy', false, 16);
      kit.cyl(0.03, 0.03, 0.5, M(eg, at(0, 0.2, -0.1)), '--timber', false, 6);
      // A cushion in the egg, a blanket over its lip, and a little table at
      // its side with a candle and a mug.
      var inner = new T.SphereGeometry(0.42, 14, 10); inner.scale(1, 0.35, 0.9);
      kit.piece(inner, M(eg, at(0, 0.72, 0.12)), '--ember-2', 0.015);
      // The blanket hangs over the egg's lip and down its front in folds.
      for (var fo = 0; fo < 5; fo++) {
        var fold = new T.CylinderGeometry(0.05, 0.07, 0.3, 8); fold.scale(1, 1, 0.45);
        kit.piece(fold, M(eg, at(-0.2 + fo * 0.1, 0.56, 0.68 - Math.abs(fo - 2) * 0.03, 0, 0.35)), '--moonstone-2', fo === 2 ? 0.01 : false);
      }
      [-0.2, -0.1, 0, 0.1, 0.2].forEach(function (x) { kit.cyl(0.007, 0.007, 0.08, M(eg, at(x, 0.38, 0.75)), '--tallow-3', false, 3); });
      var sdt = M(eg, at(0.95, 0, 0.25));
      kit.cyl(0.22, 0.22, 0.04, M(sdt, at(0, 0.55, 0)), '--timber', 0.01, 16);
      kit.cyl(0.03, 0.04, 0.53, M(sdt, at(0, 0.27, 0)), '--timber', false, 6);
      candleAt(M(sdt, at(-0.07, 0.57, 0)), 0.12);
      kit.cyl(0.045, 0.04, 0.09, M(sdt, at(0.08, 0.615, 0.04)), '--ivy', 0.008, 10);
      // A sheepskin on the floor in front of it.
      var fleece = new T.CircleGeometry(0.55, 14); fleece.scale(1, 0.7, 1);
      kit.flat(fleece, M(eg, at(0, 0.03, 1.0, 0, -Math.PI / 2)), '--tallow-2');
      for (var fl = 0; fl < 18; fl++) kit.piece(new T.SphereGeometry(0.05, 5, 3), M(eg, at((hash(fl, 12, 1) - 0.5) * 0.85, 0.04, 1.0 + (hash(fl, 12, 2) - 0.5) * 0.6)), '--tallow', false);
      stops.push({ name: 'in the regulation nook, by the egg chair', x: (R - 3.7) * Math.sin(145 * DEG), z: -(R - 3.7) * Math.cos(145 * DEG), yaw: -145 * DEG, pitch: -0.1 });

      // THE PEBBLE BOWL on a stool, by the door.
      var pb = round(168 * DEG, R - 0.6, 0);
      kit.cyl(0.22, 0.22, 0.5, M(pb, at(0, 0.25, 0)), '--timber', 0.02, 12);
      var bowl = new T.SphereGeometry(0.22, 14, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
      kit.piece(bowl, M(pb, at(0, 0.62, 0)), '--canvas-2', 0.02);
      for (var q = 0; q < 5; q++) kit.piece(new T.SphereGeometry(0.05, 6, 4), M(pb, at((hash(q, 9, 1) - 0.5) * 0.2, 0.6, (hash(q, 9, 2) - 0.5) * 0.2)), q % 2 ? '--tallow-3' : '--tallow-2', false);

      // THE STOVE, with its flue up through the canvas and the fly agarics
      // round its feet, red, spotted in tallow.
      var st = round(-72 * DEG, R - 1.0, 0);
      box(0.8, 0.8, 0.6, M(st, at(0, 0.5, 0)), '--hearth');
      kit.flat(new T.PlaneGeometry(0.42, 0.3), M(st, at(0, 0.5, 0.31)), '--ember-2');
      [-0.3, 0.3].forEach(function (x) { box(0.08, 0.1, 0.08, M(st, at(x, 0.05, 0)), '--hearth', false); });
      kit.cyl(0.08, 0.08, CROWN - 0.9, M(st, at(0, 0.9 + (CROWN - 0.9) / 2 - 0.4, -0.05)), '--hearth', 0.02, 10);
      function toadstool(m, s) {
        kit.cyl(0.04 * s, 0.05 * s, 0.18 * s, M(m, at(0, 0.09 * s, 0)), '--tallow', false, 8);
        var cap = new T.SphereGeometry(0.12 * s, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2);
        kit.piece(cap, M(m, at(0, 0.17 * s, 0)), '--toadstool', 0.015);
        for (var d = 0; d < 5; d++) {
          var a2 = d / 5 * Math.PI * 2, rr2 = 0.07 * s;
          kit.piece(new T.SphereGeometry(0.017 * s, 5, 3), M(m, at(Math.cos(a2) * rr2, 0.24 * s, Math.sin(a2) * rr2)), '--tallow', false);
        }
      }
      [[0.6, 0.3, 1], [0.75, -0.1, 0.7], [-0.6, 0.35, 0.9], [-0.7, 0, 0.6]].forEach(function (f) { toadstool(M(st, at(f[0], 0, f[1])), f[2]); });
      // A kettle on the stove top, the grate's glow round its door, a
      // basket of logs beside it, and a hearth stone under it all.
      box(1.5, 0.04, 1.2, M(st, at(0, 0.02, 0.15)), '--tallow-3', false, false);
      box(0.5, 0.38, 0.02, M(st, at(0, 0.5, 0.305)), '--timber', false);
      kit.flat(new T.PlaneGeometry(0.42, 0.3), M(st, at(0, 0.5, 0.318)), '--ember-2');
      var ket = new T.SphereGeometry(0.15, 14, 10); ket.scale(1, 0.75, 1);
      kit.piece(ket, M(st, at(0.18, 1.0, 0.05)), '--hearth', 0.012);
      kit.piece(new T.TorusGeometry(0.1, 0.014, 6, 12, Math.PI), M(st, at(0.18, 1.08, 0.05)), '--timber', false);
      kit.cyl(0.015, 0.025, 0.14, M(st, at(0.34, 1.02, 0.05, 0, 0, -1.0)), '--hearth', false, 6);
      var lb = M(st, at(-1.35, 0, -0.05));
      kit.cyl(0.32, 0.28, 0.36, M(lb, at(0, 0.18, 0)), '--tallow-3', 0.015, 14);
      for (var lg = 0; lg < 6; lg++) kit.cyl(0.07, 0.07, 0.62, M(lb, at(-0.15 + (lg % 3) * 0.15, 0.36 + Math.floor(lg / 3) * 0.11, 0, 0, 0, Math.PI / 2 + (hash(lg, 13, 1) - 0.5) * 0.3)), '--timber', 0.01, 8);
      // A shelf on the lattice above, with her jars on it, and bundles of
      // herbs hung to dry from the roof poles.
      var sh = M(st, at(0, 1.55, -0.35));
      box(1.2, 0.04, 0.22, sh, '--timber', 0.01);
      [['--moonstone-2', 0.13], ['--ember', 0.1], ['--ivy', 0.15], ['--tallow-2', 0.09], ['--moonstone', 0.12]].forEach(function (j, n) {
        var jx = -0.45 + n * 0.22;
        kit.cyl(0.055, 0.055, j[1], M(sh, at(jx, 0.02 + j[1] / 2, 0)), j[0], 0.008, 12);
        kit.cyl(0.058, 0.058, 0.025, M(sh, at(jx, 0.035 + j[1], 0)), '--timber', false, 12);
      });
      [-0.5, -0.15, 0.25, 0.55].forEach(function (x, n) {
        var hm = M(st, at(x, 2.0 - (n % 2) * 0.08, 0.2));
        kit.cyl(0.006, 0.006, 0.18, M(hm, at(0, 0.09, 0)), '--tallow-3', false, 3);
        var bunch = new T.ConeGeometry(0.08, 0.32, 7); bunch.rotateX(Math.PI);
        kit.piece(bunch, M(hm, at(0, -0.14, 0)), n % 2 ? '--ivy-2' : '--ivy', 0.01);
      });
      stops.push({ name: 'by the stove, with the fly agarics round it', x: (R - 3.4) * Math.sin(-72 * DEG), z: -(R - 3.4) * Math.cos(-72 * DEG), yaw: 72 * DEG, pitch: -0.1 });

      // THE HOLLOW STUMP, near the stove, with toadstools on it too.
      var sp = round(-95 * DEG, R - 2.2, 0);
      kit.cyl(0.38, 0.46, 0.55, M(sp, at(0, 0.275, 0)), '--timber', 0.03, 12);
      kit.cyl(0.26, 0.26, 0.02, M(sp, at(0, 0.56, 0)), '--hearth', false, 12);
      toadstool(M(sp, at(0.3, 0.2, 0.3)), 0.8);

      // THE ALCHEMIST'S ARCH, to Myths and Legends: an arch of ivy.
      var ARCH = -112 * DEG;
      var ar = round(ARCH, R - 0.15, 0);
      box(1.2, 1.9, 0.05, M(ar, at(0, 0.95, -0.02)), '--hearth', false);
      [-1, 1].forEach(function (s) { box(0.18, 1.6, 0.18, M(ar, at(s * 0.68, 0.8, 0.05)), '--ivy-2'); });
      kit.piece(new T.TorusGeometry(0.68, 0.1, 8, 16, Math.PI), M(ar, at(0, 1.6, 0.05)), '--ivy-2', 0.02);
      for (q = 0; q < 26; q++) {
        var la = hash(q, 3, 1) * Math.PI, lr = 0.68 + (hash(q, 3, 2) - 0.5) * 0.18;
        var lx = Math.cos(la) * lr, ly = 1.6 + Math.sin(la) * lr;
        if (q > 16) { lx = (q % 2 ? 1 : -1) * 0.7; ly = 0.2 + hash(q, 3, 3) * 1.3; }
        var leaf = new T.SphereGeometry(0.07, 6, 4); leaf.scale(1, 0.5, 0.3);
        kit.piece(leaf, M(ar, at(lx, ly, 0.16, 0, 0, hash(q, 3, 4) * 3)), '--ivy', false);
      }
      // A candle's warmth just in front of the arch, so its ivy is seen.
      var archLight = new T.PointLight(kit.col('--candle'), 3.4, 3.4, 1.3);
      archLight.position.set((R - 1.3) * Math.sin(ARCH), 1.4, -(R - 1.3) * Math.cos(ARCH));
      kit.scene.add(archLight);
      // Stood back from it, turned a touch away from the round door beside
      // it, so the arch is what is in front of you.
      stops.push({ name: 'at the Alchemist’s Arch, the way through to Myths and Legends', room: 'Myths & Legends', page: 'faery-myths-room.html',
                   x: (R - 3.5) * Math.sin(ARCH + 4 * DEG), z: -(R - 3.5) * Math.cos(ARCH + 4 * DEG), yaw: -ARCH - 9 * DEG, pitch: -0.06 });

      // THE ROUND DOOR, to the Play Pod.
      var DOOR = -154 * DEG;
      var rd = round(DOOR, R - 0.12, 0);
      kit.cyl(0.8, 0.8, 0.08, M(rd, at(0, 0.82, 0, 0, Math.PI / 2)), '--timber', 0.02, 28);
      kit.cyl(0.68, 0.68, 0.1, M(rd, at(0, 0.82, 0.01, 0, Math.PI / 2)), '--ember', false, 28);
      kit.piece(new T.SphereGeometry(0.05, 8, 6), M(rd, at(0.4, 0.82, 0.08)), '--candle', false);
      stop(DOOR, 'at the round door, the way through to the Play Pod', 'play-pod.html', 'The Play Pod');

      // THE GLIMMER WINDOW, arched, its sash dark and glimmering, and her
      // moon stone on the ledge; the glowing mushroom under it on the floor.
      var gw = round(-38 * DEG, R - 0.12, 0);
      box(1.1, 1.1, 0.06, M(gw, at(0, 1.3, 0)), '--timber');
      kit.cyl(0.55, 0.55, 0.06, M(gw, at(0, 1.85, 0, 0, Math.PI / 2)), '--timber', false, 24);
      box(0.92, 0.95, 0.07, M(gw, at(0, 1.3, 0.01)), '--moonstone', false);
      kit.cyl(0.46, 0.46, 0.07, M(gw, at(0, 1.82, 0.01, 0, Math.PI / 2)), '--moonstone', false, 24);
      box(0.04, 1.4, 0.08, M(gw, at(0, 1.45, 0.04)), '--timber', false);
      for (q = 0; q < 9; q++) kit.piece(new T.SphereGeometry(0.018, 5, 3), M(gw, at((hash(q, 4, 1) - 0.5) * 0.8, 1.0 + hash(q, 4, 2) * 1.1, 0.05)), '--moonstone-2', false);
      box(1.3, 0.06, 0.24, M(gw, at(0, 0.72, 0.1)), '--timber');
      var stone = new T.DodecahedronGeometry(0.1, 0); stone.scale(1.3, 0.8, 1);
      kit.piece(stone, M(gw, at(0.35, 0.82, 0.14, 0.4)), '--moonstone-2', 0.015);
      // The moon through her window lies on its sill and her stone.
      var glim = new T.PointLight(kit.col('--moonstone-2'), 3.2, 3.2, 1.3);
      glim.position.set((R - 1.0) * Math.sin(-38 * DEG), 1.35, -(R - 1.0) * Math.cos(-38 * DEG));
      kit.scene.add(glim);
      stops.push({ name: 'at the Glimmer Window, with her moon stone on the ledge', x: (R - 3.7) * Math.sin(-38 * DEG), z: -(R - 3.7) * Math.cos(-38 * DEG), yaw: 38 * DEG, pitch: -0.04 });
      // The glowing mushroom, the way down to Glow Wild Hollow.
      var ms = round(-22 * DEG, R - 0.9, 0);
      kit.cyl(0.08, 0.11, 0.5, M(ms, at(0, 0.25, 0)), '--tallow-2', false, 10);
      var big = new T.SphereGeometry(0.34, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2); big.scale(1, 0.7, 1);
      kit.flat(big, M(ms, at(0, 0.48, 0)), '--candle');
      kit.flat(new T.CircleGeometry(0.5, 20), M(ms, at(0, 0.04, 0, 0, -Math.PI / 2)), '--ivy-2');
      stop(-22 * DEG, 'by the glowing mushroom, the way down to Glow Wild Hollow', 'glow-wild-hollow.html', 'Glow Wild Hollow');

      return {
        start: { x: 0, z: R - 1.2, yaw: 0 },
        bounds: { x: [-(R - 1.6), R - 1.6], z: [-(R - 1.6), R - 1.0] },
        stops: stops
      };
    }
  };
})();

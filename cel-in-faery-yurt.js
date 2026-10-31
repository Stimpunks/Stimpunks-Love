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

      // THE FLOOR: boards, and a round rug with an ember edge.
      kit.cyl(R + 0.3, R + 0.3, 0.1, at(0, -0.05, 0), '--timber', false, 36);
      kit.cyl(3.2, 3.2, 0.03, at(0, 0.02, 0), '--ember', false, 36);
      kit.cyl(2.95, 2.95, 0.03, at(0, 0.035, 0), '--canvas-2', false, 36);

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
      // And three long swags across under the roof, over everybody's heads.
      [[-50, 70], [-125, 125], [-15, 160]].forEach(function (sw, j) {
        var A = new T.Vector3((R - 2) * Math.sin(sw[0] * DEG), H + 0.6, -(R - 2) * Math.cos(sw[0] * DEG));
        var B = new T.Vector3((R - 2) * Math.sin(sw[1] * DEG), H + 0.6, -(R - 2) * Math.cos(sw[1] * DEG));
        for (var k = 1; k < 40; k++) {
          var v = k / 40, P = A.clone().lerp(B, v);
          P.y -= Math.sin(v * Math.PI) * (0.25 + j * 0.05);
          kit.piece(bulb.clone(), at(P.x, P.y, P.z), '--candle', false);
        }
      });

      var stops = [{ name: 'just inside the door, out of the night air', x: 0, z: R - 1.2, yaw: 0 }];
      function stop(theta, name, page, room) { stops.push({ name: name, room: room, page: page, x: (R - 2.5) * Math.sin(theta), z: -(R - 2.5) * Math.cos(theta), yaw: -theta }); }

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
      stop(35 * DEG, 'at the bookcase, the way through to the Reading Room', 'faery-reading-room.html', 'The Reading Room');

      // THE PHONOGRAPH on its little table, to the Music Room.
      var ph = round(70 * DEG, R - 0.8, 0);
      box(0.8, 0.7, 0.6, M(ph, at(0, 0.35, 0)), '--timber');
      box(0.5, 0.18, 0.44, M(ph, at(0, 0.79, 0)), '--canvas-2');
      kit.cyl(0.2, 0.2, 0.02, M(ph, at(0, 0.89, 0)), '--hearth', false, 20);
      var horn = new T.ConeGeometry(0.32, 0.6, 18, 1, true);
      kit.piece(horn, M(ph, at(0.05, 1.2, -0.1, 0, -0.9)), '--ember-2', 0.02);
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
      stops.push({ name: 'in the regulation nook, by the egg chair', x: (R - 3) * Math.sin(145 * DEG), z: -(R - 3) * Math.cos(145 * DEG), yaw: -145 * DEG });

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
      stops.push({ name: 'by the stove, with the fly agarics round it', x: (R - 3) * Math.sin(-72 * DEG), z: -(R - 3) * Math.cos(-72 * DEG), yaw: 72 * DEG });

      // THE HOLLOW STUMP, near the stove, with toadstools on it too.
      var sp = round(-95 * DEG, R - 2.2, 0);
      kit.cyl(0.38, 0.46, 0.55, M(sp, at(0, 0.275, 0)), '--timber', 0.03, 12);
      kit.cyl(0.26, 0.26, 0.02, M(sp, at(0, 0.56, 0)), '--hearth', false, 12);
      toadstool(M(sp, at(0.3, 0.2, 0.3)), 0.8);

      // THE ALCHEMIST'S ARCH, to Myths and Legends: an arch of ivy.
      var ar = round(-118 * DEG, R - 0.15, 0);
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
      stop(-118 * DEG, 'at the Alchemist’s Arch, the way through to Myths and Legends', 'faery-myths-room.html', 'Myths & Legends');

      // THE ROUND DOOR, to the Play Pod.
      var rd = round(-148 * DEG, R - 0.12, 0);
      kit.cyl(0.8, 0.8, 0.08, M(rd, at(0, 0.82, 0, 0, Math.PI / 2)), '--timber', 0.02, 28);
      kit.cyl(0.68, 0.68, 0.1, M(rd, at(0, 0.82, 0.01, 0, Math.PI / 2)), '--ember', false, 28);
      kit.piece(new T.SphereGeometry(0.05, 8, 6), M(rd, at(0.4, 0.82, 0.08)), '--candle', false);
      stop(-148 * DEG, 'at the round door, the way through to the Play Pod', 'play-pod.html', 'The Play Pod');

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
      stops.push({ name: 'at the Glimmer Window, with her moon stone on the ledge', x: (R - 2.5) * Math.sin(-38 * DEG), z: -(R - 2.5) * Math.cos(-38 * DEG), yaw: 38 * DEG });
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

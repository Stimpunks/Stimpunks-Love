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

   WHAT MOVES IS WHAT MOVES ON HER PAGE, AND WHAT YOU ASK FOR (Ryan,
   2026-11-04). Her page says MAX lights the fairy lights and turns the record
   and nothing else in the yurt moves unless you ask it to, so here too: at
   MAX the fairy lights twinkle, slowly, each in its own time, and the record
   on the phonograph goes round once in six seconds, as hers does; the candles
   flicker only once somebody presses Let the candles flicker, under the flash
   line the kit holds. The fairy lights have switches of their own (out, low
   or lit, and in which of her colours), the tea can be poured, the curtain
   to the Cinema drawn across and the crown's cover pulled over the night,
   each a press that says what it did. Every colour is one her room declares,
   by name. It keeps nothing, sends nothing and
   fetches nothing; her page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.

   HER THREE ANIMALS ARE ASLEEP IN IT (Helen Edgar's ask, 2026-11-09). Until
   then the scene never drew them, because they are her real pets and that
   was hers to decide; she decided. A cat curled on the egg chair's cushion
   (one cat standing for the clowder), the dog asleep on the sheepskin at its
   foot and the hamster asleep in a bowl on the little table beside it, each
   a generic figure of its kind in the yurt's own inks by name, never drawn
   from her photographs, still at every setting, and hers to keep or send
   back. They are WebGL, so they are seen in the headset too.

   THE BELL AT THE DOOR IS HER PAGE'S BELL, lifted (Helen's ask, the same
   day): the bell string's markup off faery-yurt.html stands small on the wall
   inside the door, and yurt-bell.js is wired to it, so a press here rings the
   same chime under the same ceiling, and never rings by itself.

   THE BASKET OF WINGS BY HER DOOR LENDS A PAIR HERE (the same day): the room
   names its pairs (wings, below), Cel Street puts Borrow a pair of wings under
   the room's switches, the pair goes with your place to the radio and is
   worn by your figure for whoever sees it, and it is back in the basket when
   you leave; nothing about who borrowed which is kept anywhere.
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
      var washes = [];
      [-160, -128, -84, -52, 8, 52, 88, 126, 160].forEach(function (deg) {
        var wash = new T.PointLight(kit.col('--candle'), 5.5, 4.2, 1.3);
        washes.push(wash);
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
      [['--ember', 0.05], ['--ivy', 0.09], ['--moonstone', 0.13]].forEach(function (bk, n) {
        box(0.3 - n * 0.03, 0.04, 0.22 - n * 0.02, at(0.05, 0.41 + n * 0.045, -0.32, 0.2 + n * 0.25), bk[0], 0.006);
      });
      // Every candle's flame is kept, so the candles can flicker when asked.
      var flames = [];
      function candleAt(m, h, light) {
        kit.cyl(0.035, 0.035, h, M(m, at(0, h / 2, 0)), '--tallow', 0.006, 10);
        // A drip of wax down its side, and the wick.
        kit.cyl(0.008, 0.012, h * 0.4, M(m, at(0.03, h * 0.78, 0.01)), '--tallow', false, 5);
        kit.cyl(0.003, 0.003, 0.02, M(m, at(0, h + 0.01, 0)), '--hearth', false, 3);
        var flame = new T.ConeGeometry(0.022, 0.07, 8); flame.translate(0, 0.035, 0);
        var f = kit.flat(flame, M(m, at(0, h + 0.012, 0)), '--candle');
        flames.push({ mesh: f, light: light || null });
        return f;
      }
      // The three on the table give the table its own small warmth.
      var tableLight = new T.PointLight(kit.col('--candle'), 2.2, 2.6, 1.4);
      tableLight.position.set(0.3, 0.75, 0.05);
      kit.scene.add(tableLight);
      [[0.3, 0.12, 0.16], [0.38, 0.0, 0.11], [0.24, -0.02, 0.21]].forEach(function (c, n) { candleAt(at(c[0], 0.39, c[1]), c[2], n ? null : tableLight); });
      // The cups, empty until somebody pours, and the tea in them.
      var tea = [];
      [[0.22, 0.25], [0.3, -0.15], [-0.32, -0.28]].forEach(function (c, n) {
        kit.cyl(0.05, 0.04, 0.08, at(c[0], 0.43, c[1]), ['--ember-2', '--moonstone-2', '--ivy'][n], 0.008, 10);
        kit.cyl(0.042, 0.042, 0.004, at(c[0], 0.468, c[1]), '--hearth', false, 10);
        var t = kit.flat(new T.CircleGeometry(0.04, 12), at(c[0], 0.462, c[1], 0, -Math.PI / 2), '--ember');
        kit.hide(t, true);
        tea.push(t);
      });
      // Her notebook, open on the table, and a quill laid across it.
      box(0.24, 0.012, 0.17, at(0.02, 0.4, 0.3, -0.3), '--tallow', false, false);
      box(0.004, 0.014, 0.17, at(0.02, 0.402, 0.3, -0.3), '--tallow-3', false, false);
      for (var nl = 0; nl < 5; nl++) box(0.08, 0.002, 0.004, at(-0.05 + (nl % 2) * 0.13 * Math.cos(0.3), 0.408, 0.25 + Math.floor(nl / 2) * 0.03), '--tallow-3', false, false);
      kit.cyl(0.004, 0.006, 0.22, at(0.06, 0.415, 0.33, 0, Math.PI / 2 - 0.2, 0.9), '--tallow-2', false, 4);
      var plume = new T.SphereGeometry(0.03, 6, 4); plume.scale(0.5, 2.2, 0.2);
      kit.piece(plume, at(0.12, 0.42, 0.37, 0.9, 0.3), '--moonstone-2', false);
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
        // The seam where one panel is stitched to the next, and a band of
        // her ember worked along the canvas at knee height.
        box(0.025, H, 0.02, M(round(th, R - 0.06, H / 2), at(pw / 2, 0, 0)), '--tent', false, false);
        box(pw, 0.05, 0.02, round(th, R - 0.06, 0.55), i % 3 ? '--ember' : '--toadstool', false, false);
        for (var st3 = 0; st3 < 6; st3++) box(0.04, 0.012, 0.022, M(round(th, R - 0.065, 0.55), at(-pw / 2 + (st3 + 0.5) * pw / 6, 0, 0)), '--candle', false, false);
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
      // Each bulb is kept, so the lights can be switched and can twinkle.
      var low = [], high = [];
      for (i = 0; i < N; i++) {
        var a0 = i / N * Math.PI * 2, a1 = (i + 1) / N * Math.PI * 2;
        for (var t = 0; t < 7; t++) {
          var u = t / 7, aa = a0 + (a1 - a0) * u, sag = Math.sin(u * Math.PI) * 0.28, rr = R - 0.35;
          low.push([rr * Math.sin(aa), H - 0.05 - sag, -rr * Math.cos(aa)]);
          // The wire they hang on, between each bulb and the next.
          var u2 = (t + 1) / 7, ab = a0 + (a1 - a0) * u2, sag2 = Math.sin(u2 * Math.PI) * 0.28;
          var wa0 = new T.Vector3(rr * Math.sin(aa), H - 0.02 - sag, -rr * Math.cos(aa)), wa1 = new T.Vector3(rr * Math.sin(ab), H - 0.02 - sag2, -rr * Math.cos(ab));
          var wseg = wa1.clone().sub(wa0), wg = new T.CylinderGeometry(0.004, 0.004, wseg.length(), 3);
          wg.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), wseg.clone().normalize()));
          var wm = wa0.clone().add(wa1).multiplyScalar(0.5);
          kit.piece(wg, at(wm.x, wm.y, wm.z), '--timber', false);
        }
      }
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
          if (k < 30) high.push([P.x, P.y - 0.03, P.z]);
          prev = P;
        }
      });
      // The lantern the candlelight comes from, hung under the crown on a
      // chain: a timber cage and the candle in it.
      kit.cyl(0.01, 0.01, CROWN - 2.65, at(0, (CROWN + 2.65) / 2, -0.5), '--timber', false, 4);
      box(0.3, 0.04, 0.3, at(0, 2.64, -0.5), '--timber', 0.01);
      box(0.3, 0.04, 0.3, at(0, 2.26, -0.5), '--timber', 0.01);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { box(0.025, 0.4, 0.025, at(c[0] * 0.13, 2.45, -0.5 + c[1] * 0.13), '--timber', false); });
      var lanternFlame = new T.SphereGeometry(0.1, 12, 8); lanternFlame.scale(0.75, 1.2, 0.75); lanternFlame.translate(0, 0.1, 0);
      flames.push({ mesh: kit.flat(lanternFlame, at(0, 2.3, -0.5), '--candle'), light: candle });
      kit.cyl(0.06, 0.06, 0.06, at(0, 2.3, -0.5), '--tallow', false, 10);
      // The night in the crown: stars, in her tallow.
      for (var sr = 0; sr < 40; sr++) {
        var sa = hash(sr, 7, 1) * Math.PI * 2, sd = Math.sqrt(hash(sr, 7, 2)) * 0.66;
        kit.flat(new T.CircleGeometry(0.008 + hash(sr, 7, 3) * 0.012, 5), at(Math.cos(sa) * sd, CROWN + 0.5, Math.sin(sa) * sd, 0, Math.PI / 2), sr % 5 ? '--tallow-3' : '--tallow');
      }
      kit.flat(new T.CircleGeometry(0.8, 28), at(0, CROWN + 0.52, 0, 0, Math.PI / 2), '--hearth');
      // The crown's cover, a round of canvas on a cord, pulled over the night
      // when somebody asks, and back again.
      var cover = kit.facets(new T.CylinderGeometry(0.86, 0.86, 0.04, 28), at(0, CROWN + 0.06, 0), '--canvas-2');
      kit.hide(cover, true);
      kit.cyl(0.006, 0.006, CROWN - 2.0, at(0.82, (CROWN + 2.0) / 2, 0.2), '--tallow-3', false, 3);
      kit.piece(new T.SphereGeometry(0.03, 6, 4), at(0.82, 2.0, 0.2), '--timber', false);

      var stops = [{ name: 'just inside the door, out of the night air', x: 0, z: R - 1.2, yaw: 0 }];
      function stop(theta, name, page, room) { stops.push({ name: name, room: room, page: page, x: (R - 3.3) * Math.sin(theta), z: -(R - 3.3) * Math.cos(theta), yaw: -theta, pitch: -0.08 }); }

      // HER OWN PAGE on the far wall, facing the door, in a timber frame.
      var sw0 = 2.4, sh0 = sw0 * 800 / 1180, sy0 = 0.28 + sh0 / 2;
      var pg = round(0, R - 0.14, 0);
      box(sw0 + 0.2, sh0 + 0.2, 0.06, M(pg, at(0, sy0, 0)), '--timber');
      var frame = kit.screen(1180, 800, sw0, M(pg, at(0, sy0, 0.04)), 'Helen Edgar’s Faery Yurt’s own page, on the far wall facing the door');
      // THE BELL STRING ON THE DOOR (Helen's ask, 2026-11-09): her page's own
      // bell, lifted off it and stood small on the wall inside the door frame,
      // on the side away from the blanket basket, with only its drawing, its
      // button and its said line; yurt-bell.js is wired to it, so the press
      // here rings her chime under its own ceiling, and nothing rings by itself.
      kit.lift(frame, '.yurt-bell', { w: 240, ww: 0.5, m: M(round(Math.PI, R - 0.14, 0), at(-1.45, 1.05, 0)), drop: 'h3, :scope > p:not([data-yurt-bell-said])' });
      kit.wire(frame, 'yurt-bell.js');
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
      // Candles lit along the top of the case, as her page has them along
      // the shelves, and a little dish of wax under each.
      [[-0.48, 0.14], [-0.1, 0.1], [0.36, 0.17]].forEach(function (c) {
        kit.cyl(0.06, 0.06, 0.012, M(bc, at(c[0], 1.906, 0)), '--tallow-3', false, 12);
        candleAt(M(bc, at(c[0], 1.91, 0)), c[1]);
      });
      stop(35 * DEG, 'at the bookcase, the way through to the Reading Room', 'faery-reading-room.html', 'The Reading Room');

      // THE PHONOGRAPH on its little table, to the Music Room.
      var ph = round(70 * DEG, R - 0.8, 0);
      box(0.8, 0.7, 0.6, M(ph, at(0, 0.35, 0)), '--timber');
      box(0.5, 0.18, 0.44, M(ph, at(0, 0.79, 0)), '--canvas-2');
      // HER RECORD on the phonograph, black with its grooves, a red label and
      // her moon and star on it in candle gold, off the middle so you can see
      // it go round; the tone arm lies on it and does not turn.
      var recordAt = M(ph, at(0, 0.895, 0.05)), record = [];
      record.push(kit.facets(new T.CylinderGeometry(0.15, 0.15, 0.012, 32), recordAt, '--hearth'));
      [0.14, 0.125, 0.11, 0.095, 0.08].forEach(function (r) { kit.flat(new T.RingGeometry(r - 0.002, r, 32), M(recordAt, at(0, 0.0065, 0, 0, -Math.PI / 2)), '--canvas-2'); });
      record.push(kit.flat(new T.CircleGeometry(0.052, 20), M(recordAt, at(0, 0.0072, 0, 0, -Math.PI / 2)), '--toadstool'));
      var starShape = new T.Shape();
      for (var sp5 = 0; sp5 < 10; sp5++) { var sr5 = sp5 % 2 ? 0.006 : 0.015, sa5 = sp5 / 10 * Math.PI * 2; sp5 ? starShape.lineTo(sr5 * Math.sin(sa5), sr5 * Math.cos(sa5)) : starShape.moveTo(0, sr5); }
      record.push(kit.flat(new T.ShapeGeometry(starShape), M(recordAt, at(0.026, 0.0078, 0.012, 0, -Math.PI / 2)), '--candle'));
      var moonShape = new T.Shape(); moonShape.absarc(0, 0, 0.016, 0.5, Math.PI * 2 - 0.5, false); moonShape.absarc(0.008, 0, 0.012, Math.PI * 2 - 0.9, 0.9, true);
      record.push(kit.flat(new T.ShapeGeometry(moonShape), M(recordAt, at(-0.022, 0.0078, -0.012, 0, -Math.PI / 2)), '--candle'));
      kit.cyl(0.005, 0.005, 0.03, M(recordAt, at(0, 0.015, 0)), '--tallow-2', false, 6);
      kit.cyl(0.006, 0.004, 0.2, M(recordAt, at(0.13, 0.03, -0.02, 0, 0, Math.PI / 2 - 0.08)), '--tallow-2', false, 5);
      box(0.03, 0.02, 0.04, M(recordAt, at(0.035, 0.02, -0.02)), '--tallow-2', false, false);
      kit.cyl(0.02, 0.02, 0.04, M(recordAt, at(0.23, 0.02, -0.02)), '--timber', false, 8);
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
      // Drawn back, in folds at either side; or drawn across, when asked.
      var drawnBack = [], drawnAcross = [];
      [-1, 1].forEach(function (s) {
        for (var f = 0; f < 4; f++) drawnBack.push(kit.facets(new T.CylinderGeometry(0.07, 0.11, 1.9, 8), M(cu, at(s * (0.5 + f * 0.09), 0.97, 0.06)), f % 2 ? '--toadstool' : '--ember'));
      });
      for (var fa = 0; fa < 13; fa++) {
        var fold = kit.facets(new T.CylinderGeometry(0.06, 0.06, 1.9, 8), M(cu, at(-0.62 + fa * 0.103, 0.97, 0.06 + (fa % 2) * 0.03)), fa % 2 ? '--toadstool' : '--ember');
        kit.hide(fold, true); drawnAcross.push(fold);
      }
      kit.cyl(0.02, 0.02, 1.5, M(cu, at(0, 1.96, 0.06, 0, 0, Math.PI / 2)), '--timber', false, 6);
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
      // Ivy in pots on the floor beside it, trailing.
      [[-0.95, 0.1, 0.55], [-1.1, 0.5, 0.4]].forEach(function (pt, pn) {
        var pm = M(eg, at(pt[0], 0, pt[1]));
        kit.cyl(0.16 * (pt[2] / 0.5), 0.12 * (pt[2] / 0.5), pt[2] * 0.6, M(pm, at(0, pt[2] * 0.3, 0)), pn ? '--ember' : '--tallow-3', 0.012, 12);
        for (var pl = 0; pl < 14; pl++) {
          var pa = hash(pl, pn, 31) * Math.PI * 2, pr = hash(pl, pn, 32) * 0.18;
          var pleaf = new T.SphereGeometry(0.06, 6, 4); pleaf.scale(1, 0.5, 0.35);
          kit.piece(pleaf, M(pm, at(Math.cos(pa) * pr, pt[2] * 0.6 + hash(pl, pn, 33) * 0.3 - (pl > 10 ? 0.35 : 0), Math.sin(pa) * pr, pa, 0, hash(pl, pn, 34) * 2)), pl % 3 ? '--ivy' : '--ivy-2', false);
        }
      });
      // A sheepskin on the floor in front of it.
      var fleece = new T.CircleGeometry(0.55, 14); fleece.scale(1, 0.7, 1);
      kit.flat(fleece, M(eg, at(0, 0.03, 1.0, 0, -Math.PI / 2)), '--tallow-2');
      for (var fl = 0; fl < 18; fl++) kit.piece(new T.SphereGeometry(0.05, 5, 3), M(eg, at((hash(fl, 12, 1) - 0.5) * 0.85, 0.04, 1.0 + (hash(fl, 12, 2) - 0.5) * 0.6)), '--tallow', false);

      // HER THREE ANIMALS, ASLEEP (Helen's ask, 2026-11-09; see the header).
      // A cat curled on the cushion in the egg: a body, a head tucked in, two
      // ears, a tail round itself, in --timber with --tallow-2 markings.
      var catM = M(eg, at(0.04, 0.9, 0.1, 0.6));
      var catBody = new T.SphereGeometry(0.21, 14, 10); catBody.scale(1.15, 0.55, 0.85);
      kit.piece(catBody, M(catM, at(0, 0, 0)), '--timber', 0.012);
      var catHead = new T.SphereGeometry(0.095, 12, 9); catHead.scale(1, 0.85, 1);
      kit.piece(catHead, M(catM, at(-0.17, 0.02, 0.12, 0.5)), '--timber', 0.01);
      [-1, 1].forEach(function (e) { kit.piece(new T.ConeGeometry(0.03, 0.06, 6), M(catM, at(-0.17 + e * 0.05, 0.1, 0.1, 0, -0.3, e * 0.4)), '--timber', false); });
      var catTail = new T.TorusGeometry(0.2, 0.025, 6, 14, Math.PI * 1.2);
      kit.piece(catTail, M(catM, at(0.02, -0.06, 0.02, 0, -Math.PI / 2, 0.4)), '--timber', false);
      [[0.04, 0.09, 0.0], [-0.06, 0.07, -0.08], [0.12, 0.04, 0.06]].forEach(function (mk) {
        var patch = new T.SphereGeometry(0.045, 7, 5); patch.scale(1.4, 0.4, 1);
        kit.piece(patch, M(catM, at(mk[0], mk[1], mk[2])), '--tallow-2', false);
      });
      // The dog asleep on the sheepskin at the egg's foot, head on its paws,
      // in --tallow-3 with --tallow-2 ears and a --timber nose.
      var dogM = M(eg, at(0.08, 0.04, 1.02, 0.35));
      var dogBody = new T.SphereGeometry(0.24, 14, 10); dogBody.scale(1.5, 0.5, 0.75);
      kit.piece(dogBody, M(dogM, at(0, 0.12, 0)), '--tallow-3', 0.012);
      var dogHead = new T.SphereGeometry(0.11, 12, 9); dogHead.scale(1.25, 0.8, 0.95);
      kit.piece(dogHead, M(dogM, at(-0.38, 0.1, 0.04)), '--tallow-3', 0.01);
      kit.piece(new T.SphereGeometry(0.03, 6, 5), M(dogM, at(-0.51, 0.1, 0.05)), '--timber', false);
      [-1, 1].forEach(function (e) { var ear = new T.SphereGeometry(0.05, 7, 5); ear.scale(0.8, 0.5, 1.4); kit.piece(ear, M(dogM, at(-0.33, 0.14, 0.04 + e * 0.1, 0, 0, e * 0.4)), '--tallow-2', false); });
      [-1, 1].forEach(function (e) { kit.piece(new T.BoxGeometry(0.2, 0.05, 0.07), M(dogM, at(-0.42, 0.03, 0.04 + e * 0.07)), '--tallow-3', false); });
      var dogTail = new T.CylinderGeometry(0.02, 0.03, 0.26, 6);
      kit.piece(dogTail, M(dogM, at(0.4, 0.06, 0.05, 0, 0, Math.PI / 2 + 0.3)), '--tallow-3', false);
      // The hamster asleep in a bowl on the little table, a small round shape
      // in --tallow-2 with two ears, the bowl in --canvas-2.
      var bowlM = M(sdt, at(0.0, 0.57, -0.12));
      kit.cyl(0.085, 0.06, 0.055, M(bowlM, at(0, 0.027, 0)), '--canvas-2', 0.008, 12);
      var ham = new T.SphereGeometry(0.05, 10, 8); ham.scale(1.25, 0.8, 1);
      kit.piece(ham, M(bowlM, at(0, 0.075, 0, 1.1)), '--tallow-2', false);
      [-1, 1].forEach(function (e) { kit.piece(new T.SphereGeometry(0.012, 5, 4), M(bowlM, at(-0.03 + e * 0.012, 0.11, e * 0.02)), '--tallow-2', false); });
      stops.push({ name: 'in the regulation nook, by the egg chair, with the cat, the dog and the hamster asleep in it', x: (R - 3.7) * Math.sin(145 * DEG), z: -(R - 3.7) * Math.cos(145 * DEG), yaw: -145 * DEG, pitch: -0.1 });

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
      candleAt(M(sh, at(0.56, 0.02, 0)), 0.1);
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
      candleAt(M(gw, at(-0.4, 0.75, 0.12)), 0.14);
      candleAt(M(gw, at(-0.25, 0.75, 0.16)), 0.09);
      // Little crystals along the ledge beside her moon stone.
      [[0.08, 0.06, '--moonstone-2'], [0.18, 0.045, '--tallow'], [0.52, 0.05, '--moonstone']].forEach(function (c) {
        var cr = new T.ConeGeometry(0.025, c[1] * 2, 6); cr.translate(0, c[1], 0);
        kit.piece(cr, M(gw, at(c[0], 0.75, 0.13, c[0] * 3, 0, (c[0] - 0.3) * 0.5)), c[2], 0.004);
      });
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

      // HER SWITCHES. The fairy lights: out, low or lit, in which of her
      // colours, and twinkling by themselves at MAX as hers do.
      var lights = kit.lights({ label: 'The fairy lights', max: true, washes: washes,
        strings: [kit.bulbs(low, 0.035, ['--candle', '--ember-2']), kit.bulbs(high, 0.026, ['--candle', '--ember-2'])],
        sets: [{ say: 'Gold and amber, as on her page', inks: ['--candle', '--ember-2'] },
               { say: 'All candle gold', inks: ['--candle'] },
               { say: 'Ember', inks: ['--ember', '--ember-2'] },
               { say: 'Moonstone', inks: ['--moonstone-2', '--tallow'] },
               { say: 'Ivy and toadstool', inks: ['--ivy', '--toadstool', '--candle'] }] });
      // The candles, which move only when somebody asks.
      var candles = kit.flames(flames, { say: 'Let the candles flicker',
        said: function (on) { return on ? 'Every candle in the yurt flickers, each in its own time.' : 'The candles burn still again.'; } });
      // The record, which goes round at MAX as hers does, or when asked.
      var turning = kit.turn(record, recordAt, { say: 'Turn the record', max: true, period: 6,
        said: function (on) { return on ? 'Her record goes round, once in six seconds.' : 'The record stops where it is.'; } });
      var pour = kit.press({ say: function () { return kit.hidden(tea[0]) ? 'Pour the tea' : 'Drink up'; },
        at: [kit.touch(0.4, 0.35, 0.4, at(-0.18, 0.55, 0.05))],
        press: function () {
          var full = kit.hidden(tea[0]);
          tea.forEach(function (t) { kit.hide(t, !full); });
          return full ? 'Tea is poured into all three cups, one each for whoever comes in.' : 'The cups are empty again; the pot is still warm.';
        } });
      var curtain = kit.press({ say: function () { return kit.hidden(drawnAcross[0]) ? 'Draw the curtain across' : 'Draw the curtain back'; },
        at: [kit.touch(1.4, 2, 0.4, M(cu, at(0, 1, 0.1)))],
        press: function () {
          var across = kit.hidden(drawnAcross[0]);
          drawnAcross.forEach(function (f) { kit.hide(f, !across); });
          drawnBack.forEach(function (f) { kit.hide(f, across); });
          return across ? 'The curtain is drawn across the way to the Cinema; the way is still there behind it.' : 'The curtain is drawn back from the way to the Cinema.';
        } });
      var crown = kit.press({ say: function () { return kit.hidden(cover) ? 'Pull the cover over the crown' : 'Pull the cover back off the crown'; },
        press: function () {
          kit.hide(cover, !kit.hidden(cover));
          return !kit.hidden(cover) ? 'The cover is over the crown, and the night is shut out.' : 'The cover is back, and the night and its stars are in the crown again.';
        } });
      stops.forEach(function (st2) {
        if (st2.page === 'faery-music-room.html') st2.acts = [turning];
        if (st2.page === 'faery-cinema-room.html') st2.acts = [curtain];
      });
      stops.splice(1, 0, { name: 'at the low table in the middle, set for tea', x: 0.2, z: 1.5, yaw: 0, pitch: -0.42, acts: [pour, candles] });
      stops.push({ name: 'under the crown, looking up at the fairy lights and the night', x: 0, z: 0.9, yaw: 0, pitch: 0.95, acts: [crown, lights] });

      return {
        start: { x: 0, z: R - 1.2, yaw: 0 },
        bounds: { x: [-(R - 1.6), R - 1.6], z: [-(R - 1.6), R - 1.0] },
        stops: stops,
        // Helen's ask, 2026-11-07: her yurt is the first room offered in a VR
        // headset. On a screen this changes nothing.
        vr: true,
        // The basket of wings by her door, 2026-11-09: the pairs it lends,
        // named as her page names them, and as lib.mjs's CEL_WINGS has them.
        wings: ['moth', 'monarch', 'lady', 'fritillary']
      };
    }
  };
})();

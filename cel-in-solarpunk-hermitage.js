/* =============================================================================
   The Solarpunk Hermitage, walked into on Cel Street. Ryan's ask, 2026-10-31:
   pitch 03 on the campgrounds, through its post in the field.

   IT IS THE HERMITAGE'S WORLD AND NOBODY ELSE'S (§19), and the first DAYLIT
   room on the street: you walk out of the field's cold dusk into full morning
   sun, which is the campground's promise working in the other direction. A
   lit ground with things standing in it: a meadow under a morning sky, the sun
   low in the east so every shadow falls long and sideways off it, and the
   cabin on its wheels with its roof full of panels catching it, its aerial up,
   the three sunflowers at the door, a rain butt and a bed of seedlings. The
   room's own page is in the cabin's big window, which is how you see in.

   NOTHING MOVES. Every colour is one the room declares, by name: lime plaster
   in the sun, the furrow's green-black for the ink of things, cedar, the
   panels' deep cell. It keeps nothing, sends nothing and fetches nothing; its
   page arrives through Cel Street's screen(). tools/make-cel-street.py holds
   each of those.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 13, 374761393) ^ Math.imul(j + 43, 668265263) ^ Math.imul(k + 47, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['solarpunk-hermitage.html'] = {
    from: 'campgrounds.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };

      // MORNING: the sky, and the sun low in the east casting long shadows.
      kit.scene.background = kit.col('--daysky');
      kit.scene.fog = new T.Fog(kit.col('--daysky-2'), 40, 160);
      kit.scene.add(new T.HemisphereLight(kit.col('--daysky-2'), kit.col('--sprout-2'), 1.5));
      var sun = new T.DirectionalLight(kit.col('--noon'), 2.4);
      sun.position.set(22, 9, -4); sun.target.position.set(0, 0, -10);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      sun.shadow.camera.left = -22; sun.shadow.camera.right = 22; sun.shadow.camera.top = 22; sun.shadow.camera.bottom = -22;
      sun.shadow.camera.far = 80;
      sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
      kit.scene.add(sun, sun.target);

      // THE MEADOW, the path up to the cabin, and the hedge round it all.
      box(160, 0.1, 160, at(0, -0.05, -30), '--sprout', false, false);
      box(1.6, 0.04, 12, at(0, 0.02, -4.5), '--noon-2', false, false);
      var tuft = new T.ConeGeometry(0.03, 0.3, 3);
      for (var k = 0; k < 340; k++) {
        var tx = (hash(k, 1, 1) - 0.5) * 50, tz = 2 - hash(k, 1, 2) * 34;
        if (Math.abs(tx) < 1.2 && tz > -11) continue;
        if (Math.abs(tx) < 5 && tz < -9 && tz > -15) continue;
        kit.piece(tuft.clone(), at(tx, 0.13, tz, 0, (hash(k, 1, 3) - 0.5) * 0.4, (hash(k, 1, 4) - 0.5) * 0.4), '--sprout-2', false);
      }
      var bush = new T.IcosahedronGeometry(1, 1);
      for (k = 0; k < 46; k++) {
        var a = k / 46 * Math.PI * 2, d = 26 + hash(k, 2, 1) * 6;
        var bx = Math.sin(a) * d, bz = -12 - Math.cos(a) * d;
        if (bz > -2 && Math.abs(bx) < 4) continue;
        var g = bush.clone(), s = 1.6 + hash(k, 2, 2) * 1.6; g.scale(s, s * 0.8, s);
        kit.piece(g, at(bx, s * 0.6, bz, k), k % 2 ? '--sprout-2' : '--sprout', 0.06);
      }

      // THE CABIN ON ITS WHEELS, long side to the path: plaster in the sun,
      // cedar at the corners, a pitched roof with the panels on it.
      var cab = at(0, 0, -13);
      var L = 7.2, Wd = 2.8, Hh = 2.7, base = 0.75;
      box(L + 0.2, 0.18, Wd + 0.1, M(cab, at(0, base - 0.09, 0)), '--furrow');
      [-1, 1].forEach(function (s) {
        [-L / 2 + 1.6, -L / 2 + 2.6].forEach(function (x) {
          kit.cyl(0.42, 0.42, 0.24, M(cab, at(x, 0.42, s * (Wd / 2 - 0.05), 0, Math.PI / 2)), '--furrow', 0.03, 20);
          kit.cyl(0.16, 0.16, 0.26, M(cab, at(x, 0.42, s * (Wd / 2 - 0.05), 0, Math.PI / 2)), '--noon-2', false, 12);
        });
      });
      box(1.4, 0.08, 0.08, M(cab, at(L / 2 + 0.75, base - 0.2, 0)), '--furrow', 0.02);
      box(L, Hh, Wd, M(cab, at(0, base + Hh / 2, 0)), '--noon');
      [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(function (c) {
        box(0.14, Hh + 0.02, 0.14, M(cab, at(c[0] * (L / 2 - 0.02), base + Hh / 2, c[1] * (Wd / 2 - 0.02))), '--cedar', false);
      });
      box(L + 0.06, 0.12, Wd + 0.06, M(cab, at(0, base + 0.06, 0)), '--cedar', false);
      // The roof, two slopes, the panels on the one facing the path and the sun.
      var rise = 1.0, slope = Math.atan2(rise, Wd / 2), run = Math.hypot(rise, Wd / 2) + 0.3;
      [-1, 1].forEach(function (s) {
        box(L + 0.6, 0.12, run, M(cab, at(0, base + Hh + rise / 2, s * Wd / 4, 0, s * slope)), '--furrow-2');
      });
      var panel = kit.paper(256, 160, function (c, w, h) {
        c.fillStyle = kit.ink('--noon-2'); c.fillRect(0, 0, w, h);
        c.fillStyle = kit.ink('--cell'); c.fillRect(6, 6, w - 12, h - 12);
        c.strokeStyle = kit.ink('--noon-2'); c.lineWidth = 2;
        for (var x = 6; x < w; x += (w - 12) / 6) { c.beginPath(); c.moveTo(x, 6); c.lineTo(x, h - 6); c.stroke(); }
        for (var y = 6; y < h; y += (h - 12) / 3) { c.beginPath(); c.moveTo(6, y); c.lineTo(w - 6, y); c.stroke(); }
      });
      for (var px = -L / 2 + 0.85; px < L / 2 - 0.5; px += 1.3) {
        kit.sheet(panel, 1.2, run - 0.5, M(cab, at(px, base + Hh + rise / 2 + 0.08, Wd / 4 + 0.04, 0, slope - Math.PI / 2)));
      }
      // The aerial, up off the far gable.
      kit.cyl(0.03, 0.03, 1.6, M(cab, at(-L / 2 + 0.3, base + Hh + rise + 0.8, 0)), '--furrow', false, 6);
      [0.5, 0.8, 1.1].forEach(function (y, i) { box(0.9 - i * 0.2, 0.03, 0.03, M(cab, at(-L / 2 + 0.3, base + Hh + rise + y, 0)), '--furrow', false); });

      // The door, at the right of the long side, and its steps.
      var front = Wd / 2 + 0.01;
      box(0.95, 2.0, 0.06, M(cab, at(L / 2 - 1.1, base + 1.0, front)), '--cedar');
      kit.piece(new T.SphereGeometry(0.04, 6, 4), M(cab, at(L / 2 - 1.45, base + 1.0, front + 0.06)), '--furrow', false);
      [0, 1].forEach(function (i) { box(1.3, 0.2, 0.42, M(cab, at(L / 2 - 1.1, 0.1 + i * 0.25, front + 0.6 - i * 0.36)), '--cedar'); });
      // The small window by the door.
      box(0.7, 0.7, 0.05, M(cab, at(L / 2 - 2.3, base + 1.6, front)), '--cedar', false);
      box(0.58, 0.58, 0.06, M(cab, at(L / 2 - 2.3, base + 1.6, front + 0.005)), '--daysky-2', false);

      // THE BIG WINDOW, with the room's own page in it.
      var ww = 3.0, wh = ww * 800 / 1180, wy = base + 0.35 + wh / 2, wx = -L / 2 + 0.3 + ww / 2 + 0.2;
      box(ww + 0.22, wh + 0.22, 0.06, M(cab, at(wx, wy, front)), '--cedar');
      var frame = kit.screen(1180, 800, ww, M(cab, at(wx, wy, front + 0.04)), 'The Solarpunk Hermitage’s own page, in the cabin’s big window');

      // THE THREE SUNFLOWERS at the door, facing the sun.
      [-0.9, 0.9, 1.5].forEach(function (o, i) {
        var fx = L / 2 - 1.1 + o, fz = -13 + front + 0.7 + (i === 2 ? 0.5 : 0), fh = 2.1 + i * 0.25;
        kit.cyl(0.035, 0.045, fh, at(fx, fh / 2, fz), '--sprout', false, 6);
        for (var lf = 0; lf < 3; lf++) {
          var leaf = new T.SphereGeometry(0.16, 8, 4); leaf.scale(1.4, 0.2, 0.7);
          kit.piece(leaf, at(fx + (lf % 2 ? 0.15 : -0.15), 0.6 + lf * 0.45, fz, lf * 2.1, 0, lf % 2 ? -0.4 : 0.4), '--sprout-2', false);
        }
        var head = at(fx, fh, fz, 0.7, 0.1);
        for (var p = 0; p < 16; p++) {
          var pa = p / 16 * Math.PI * 2, petal = new T.SphereGeometry(0.12, 6, 4); petal.scale(1.8, 0.6, 0.3);
          kit.piece(petal, M(head, at(Math.cos(pa) * 0.32, Math.sin(pa) * 0.32, 0, 0, 0, pa)), '--bloom', false);
        }
        kit.cyl(0.2, 0.2, 0.08, M(head, at(0, 0, 0.02, 0, Math.PI / 2)), '--cedar', 0.015, 16);
      });

      // THE RAIN BUTT at the far corner, under the gutter's spout, and a bed
      // of seedlings in front.
      kit.cyl(0.42, 0.42, 1.1, at(-L / 2 - 0.4, 0.55, -13 + 0.7), '--cedar', 0.03, 16);
      [0.25, 0.75].forEach(function (y) { kit.cyl(0.44, 0.44, 0.06, at(-L / 2 - 0.4, y, -13 + 0.7), '--furrow', false, 16); });
      box(3.2, 0.3, 1.2, at(-2.2, 0.15, -8.4), '--cedar');
      box(3.0, 0.06, 1.0, at(-2.2, 0.31, -8.4), '--furrow-2', false);
      for (k = 0; k < 24; k++) {
        var sx = -3.5 + (k % 8) * 0.37, sz = -8.75 + Math.floor(k / 8) * 0.35;
        kit.cyl(0.012, 0.012, 0.18, at(sx, 0.42, sz), '--sprout', false, 4);
        var lv = new T.SphereGeometry(0.05, 6, 4); lv.scale(1.4, 0.3, 0.8);
        kit.piece(lv, at(sx, 0.52, sz, k), '--sprout', false);
      }
      // A bench across the path, cedar, to sit in the sun on.
      box(1.8, 0.08, 0.45, at(3.4, 0.46, -7.6, -0.3), '--cedar');
      [-0.7, 0.7].forEach(function (o) { box(0.1, 0.44, 0.4, M(at(3.4, 0, -7.6, -0.3), at(o, 0.22, 0)), '--cedar'); });

      return {
        start: { x: 0, z: 1.5, yaw: 0 },
        bounds: { x: [-12, 12], z: [-10.5, 2.5] },
        stops: [
          { name: 'on the path, out of the dusk and into the morning', x: 0, z: 1.5, yaw: 0 },
          { name: 'at the big window, with the room’s own page in it', x: wx, z: -13 + front + 2.9, yaw: 0, page: kit.page, frame: frame },
          { name: 'by the bed of seedlings', x: -2.2, z: -6.4, yaw: 0.1 },
          { name: 'at the door, between the three sunflowers', x: L / 2 - 1.1, z: -13 + front + 3.2, yaw: 0 },
          { name: 'on the bench, in the sun', x: 2.6, z: -6.0, yaw: -0.5 }
        ]
      };
    }
  };
})();

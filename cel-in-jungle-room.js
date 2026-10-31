/* =============================================================================
   The Jungle Room, walked into on Cel Street. Ryan's ask, 2026-10-31: the third
   room you can walk into, after Pink Pony Club and Club Chronic.

   IT IS THE JUNGLE ROOM'S WORLD AND NOBODY ELSE'S (§17): night-green under a
   ROOF of leaves, warm and wet, and you are inside it. Light arrives only where
   the leaves let it, falling in shafts onto the litter, and nothing stands
   alone because everything overlaps something: buttressed trunks, fronds,
   vines, heliconia and orchids, a log across the path. At the end of the path,
   in a clearing where a shaft comes down, the room's own page hangs between
   two trunks in a leaf, two pointed corners and two round ones, because every
   screen in that room is a leaf.

   NOTHING MOVES. The light through the canopy moves on the room's own page at
   MAX; here the scene is drawn when you move and then left alone, at every
   setting. Every colour is one the room declares, by name. It keeps nothing,
   sends nothing and fetches nothing; its page arrives through Cel Street's
   screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 5, 374761393) ^ Math.imul(j + 13, 668265263) ^ Math.imul(k + 17, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['jungle-room.html'] = {
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, D = 28, W = 16, back = -D, ROOF = 8.5;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };

      kit.scene.background = kit.col('--canopy');
      kit.scene.add(new T.HemisphereLight(kit.col('--sap'), kit.col('--canopy'), 0.9));

      // THE SHAFTS: light only where the leaves part, falling straight down
      // onto the litter, each a gap in the roof with a spot of sun under it.
      var gaps = [[2.2, -7], [-3.2, -14.5], [1.0, -20], [0, back + 4.2]];
      gaps.forEach(function (g, i) {
        var sun = new T.SpotLight(kit.col('--sun'), i === 3 ? 260 : 170, 0, 0.42, 0.35, 1.2);
        sun.position.set(g[0] + 1.2, ROOF + 4, g[1] + 1);
        sun.target.position.set(g[0], 0, g[1]);
        sun.castShadow = i < 3;
        sun.shadow.mapSize.set(1024, 1024);
        sun.shadow.bias = -0.0008;
        kit.scene.add(sun, sun.target);
        // The shaft itself, seen in the wet air, faint.
        var cone = new T.Mesh(new T.CylinderGeometry(0.5, 2.0, ROOF + 1, 20, 1, true),
          new T.MeshBasicMaterial({ color: kit.col('--sun'), transparent: true, opacity: 0.08, depthWrite: false, side: T.DoubleSide }));
        cone.position.set(g[0] + 0.6, (ROOF + 1) / 2, g[1] + 0.5);
        cone.rotation.z = 0.08;
        cone.updateMatrix();
        kit.scene.add(cone);
      });

      // THE FLOOR: litter, and darker patches of the understory in it.
      box(W + 30, 0.1, D + 30, at(0, -0.05, -D / 2), '--litter', false, false);
      for (var k = 0; k < 60; k++) {
        kit.flat(new T.CircleGeometry(0.2 + hash(k, 1, 1) * 0.5, 10), at(-W / 2 + hash(k, 1, 2) * W, 0.004, 1 - hash(k, 1, 3) * (D + 2), 0, -Math.PI / 2), '--understory');
      }
      for (k = 0; k < 120; k++) {
        var lx = -W / 2 + hash(k, 2, 2) * W, lz = 1 - hash(k, 2, 3) * (D + 2);
        kit.flat(new T.CircleGeometry(0.07 + hash(k, 2, 1) * 0.06, 6), at(lx, 0.006, lz, hash(k, 2, 4) * 6, -Math.PI / 2), k % 3 ? '--buttress' : '--palm');
      }

      // A TRUNK with its buttress roots, an orchid or two on it, and a vine
      // coming down out of the roof beside it.
      function trunk(x, z, r, n) {
        kit.cyl(r * 0.8, r, ROOF + 1, at(x, (ROOF + 1) / 2, z), '--buttress', 0.05, 12);
        for (var f = 0; f < 5; f++) {
          var a = f / 5 * Math.PI * 2 + hash(n, f, 1);
          box(0.09, 0.5 + hash(n, f, 2) * 0.6, 0.55 + r, M(at(x, 0, z, a), at(0, 0.3, r + 0.2)), '--buttress', 0.025);
        }
        if (hash(n, 9, 1) < 0.6) {
          var oy = 1.6 + hash(n, 9, 2) * 2.4, oa = hash(n, 9, 3) * Math.PI * 2;
          for (var p = 0; p < 4; p++) {
            kit.piece(new T.SphereGeometry(0.1, 8, 6), at(x + Math.sin(oa) * (r + 0.05) + (p - 1.5) * 0.09, oy + (p % 2) * 0.1, z + Math.cos(oa) * (r + 0.05)), '--orchid', 0.015);
          }
        }
        if (hash(n, 8, 1) < 0.7) {
          var vx = x + (hash(n, 8, 2) - 0.5) * 1.4, vz = z + (hash(n, 8, 3) - 0.5) * 1.4, vy = 1.2 + hash(n, 8, 4) * 2.5;
          var pts = [];
          for (var q = 0; q <= 8; q++) pts.push(new T.Vector3(vx + Math.sin(q * 1.3 + n) * 0.15, ROOF - q / 8 * (ROOF - vy), vz + Math.cos(q * 0.9) * 0.12));
          kit.piece(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 24, 0.04, 5, false), new T.Matrix4(), '--palm', false);
        }
      }
      var n = 0;
      [-1, 1].forEach(function (s) {
        for (var z = -1.5; z > back + 2.5; z -= 2.6 + hash(s + 3, n, 1) * 1.6) {
          trunk(s * (3.2 + hash(n, 3, 1) * 3.6), z, 0.32 + hash(n, 3, 2) * 0.28, n++);
          if (hash(n, 4, 1) < 0.5) trunk(s * (6.5 + hash(n, 4, 2) * 1.5), z - 1.2, 0.5 + hash(n, 4, 3) * 0.3, n++);
        }
      });
      // The two trunks the screen hangs between.
      trunk(-3.4, back + 1.4, 0.55, 90);
      trunk(3.4, back + 1.4, 0.55, 91);

      // THE ROOF: leaves all the way over, overlapping, with the gaps the
      // light comes through.
      var leaf = new T.IcosahedronGeometry(1, 1);
      for (k = 0; k < 140; k++) {
        var cx = -W / 2 - 2 + hash(k, 5, 1) * (W + 4), cz = 2 - hash(k, 5, 2) * (D + 4);
        if (gaps.some(function (g) { return Math.hypot(cx - g[0], cz - g[1]) < 2.4; })) continue;
        var cs = 1.6 + hash(k, 5, 3) * 1.6, g = leaf.clone();
        g.scale(cs, cs * 0.45, cs);
        kit.piece(g, at(cx, ROOF + hash(k, 5, 4) * 1.4, cz, k), k % 4 ? '--buttress' : '--palm', 0.06);
      }

      // FRONDS low down, and heliconia with their bracts, overlapping the
      // path's edges and the trunks' feet.
      for (k = 0; k < 70; k++) {
        var side = k % 2 ? 1 : -1, fx = side * (2.0 + hash(k, 6, 1) * 5.5), fz = -0.5 - hash(k, 6, 2) * (D - 3);
        var fg = new T.SphereGeometry(1, 10, 6);
        fg.scale(0.22, 0.04, 0.9 + hash(k, 6, 3) * 0.5);
        kit.piece(fg, at(fx, 0.5 + hash(k, 6, 4) * 0.6, fz, hash(k, 6, 5) * 6, -0.5 - hash(k, 6, 6) * 0.4), '--palm', 0.025);
      }
      for (k = 0; k < 14; k++) {
        var hx = (k % 2 ? 1 : -1) * (2.2 + hash(k, 7, 1) * 2), hz = -2 - hash(k, 7, 2) * (D - 6);
        kit.cyl(0.03, 0.03, 1.4, at(hx, 0.7, hz), '--palm', 0.01, 6);
        for (var b = 0; b < 5; b++) {
          kit.piece(new T.ConeGeometry(0.08, 0.3, 6), at(hx + (b % 2 ? 0.1 : -0.1), 1.45 - b * 0.16, hz, 0, 0, b % 2 ? -1.2 : 1.2), '--heliconia', 0.015);
        }
      }

      // A LOG across the edge of the path, to sit on.
      kit.cyl(0.35, 0.38, 3.6, at(-2.6, 0.35, -11, 0.4, 0, Math.PI / 2), '--buttress', 0.04, 14);
      kit.flat(new T.CircleGeometry(0.33, 14), at(-2.6 - 1.65, 0.35, -11 + 0.7, 0.4 - Math.PI / 2), '--sap');

      // THE ROOM'S OWN PAGE, in a leaf between the two trunks: two pointed
      // corners and two round ones, the room's own screen shape.
      var sw = 4.6, sh = sw * 800 / 1180, sy = 0.7 + sh / 2, lw = sw + 0.6, lh = sh + 0.6, rr = 0.9;
      var shape = new T.Shape();
      shape.moveTo(-lw / 2, lh / 2);
      shape.lineTo(lw / 2 - rr, lh / 2); shape.quadraticCurveTo(lw / 2, lh / 2, lw / 2, lh / 2 - rr);
      shape.lineTo(lw / 2, -lh / 2);
      shape.lineTo(-lw / 2 + rr, -lh / 2); shape.quadraticCurveTo(-lw / 2, -lh / 2, -lw / 2, -lh / 2 + rr);
      shape.lineTo(-lw / 2, lh / 2);
      var lg = new T.ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: false });
      kit.piece(lg, at(0, sy, back + 1.1), '--palm', 0.04);
      kit.cyl(0.02, 0.02, ROOF - sy - lh / 2, at(-lw / 2 + 0.3, sy + lh / 2 + (ROOF - sy - lh / 2) / 2, back + 1.15), '--palm', false, 5);
      kit.cyl(0.02, 0.02, ROOF - sy - lh / 2, at(lw / 2 - 0.3, sy + lh / 2 + (ROOF - sy - lh / 2) / 2, back + 1.15), '--palm', false, 5);
      var frame = kit.screen(1180, 800, sw, at(0, sy, back + 1.22), 'The Jungle Room’s own page, in a leaf between two trunks');
      frame.style.borderRadius = '0 150px 0 150px';

      return {
        start: { x: 0, z: 0.5, yaw: 0 },
        bounds: { x: [-2.4, 2.4], z: [back + 4.3, 0.8] },
        stops: [
          { name: 'at the edge of the forest, under the roof of leaves', x: 0, z: 0.5, yaw: 0 },
          { name: 'in a shaft of light, where the leaves part', x: 1.6, z: -7, yaw: 0.4 },
          { name: 'by the log across the path', x: -0.6, z: -11, yaw: Math.PI / 2 },
          { name: 'in the clearing, with the room’s own page in a leaf between two trunks', x: 0, z: back + 4.6, yaw: 0, page: kit.page, frame: frame }
        ]
      };
    }
  };
})();

/* =============================================================================
   The Garden, walked into on Cel Street, through its gate halfway down the
   street. Ryan's ask, 2026-11-01: the street's gates, after its doors.

   IT IS THE ROOM'S OWN WORLD AND SHARES NOTHING WITH THE STREET (§28). The
   street is night, shopfronts and signs; this is midday, the sun straight
   overhead and come down through leaves, so every pale surface is tinted
   green and every shadow is small, hard and directly under the thing that
   made it. The leaf shadow on the path is painted, --gd-dapple, the way §28
   paints it, and the palest thing here is not the ground: a limewashed board
   is brighter than the path it lies on, carried by its edge and by the hard
   shadow under it.

   THE BEDS ARE THE PAGE'S. One bed per site we publish is a claim, and how
   many sites there are is the page's to say (tools/make-garden.py writes them
   from data/arrivals.json), so the border here is one long raised bed with
   plants in it and no count, and the page's own beds stand beside it, lifted
   whole. NOTHING GREEN GOES BELOW THE SOIL LINE: every leaf and stem in the
   border starts at the top of the soil, the page's own rule.

   HELEN'S BOUNDARY IS IVY AND STARS, NEVER A FENCE. Her call, 2026-09-22: a
   fence says kept out and ivy says this is as far as we can see. So the right
   of the path runs out in winding ivy on the ground, with no post, rail or
   panel anywhere in it, and glimmers in it that light nothing. Past it is
   the garden next door, which is Helen's and not ours: none of it is drawn as
   a bed, nothing over there stands in soil we drew, and NOTHING PAST THE IVY
   CASTS A SHADOW, because the sun has not moved and the floor is past the ivy.
   Her plots' own words stand on our side of the ivy, as the page has them.

   THE GARDEN SPIDER IS AN ORB WEAVER IN ITS WEB AT THE FAR END, and its panel
   is lifted whole, caveats and all: the friendly edit is to trim them. Past
   its web is the way to the World room, which the page points at past this
   bed.

   NOTHING MOVES AT ANY SETTING, the leaf shadow included: §28 lets the page's
   dapple drift, and here it is drawn and stays drawn.

   AND OUR SIDE OF IT IS A GARDEN TO SIT IN (Ryan, 2026-11-04: a showcase, with
   vegetation, benches, a water feature, gazebos, and the glare taken down).
   Past the border on the left the garden opens onto a lawn, mown in stripes,
   reached by a gravel path round the end of the bed: a round pond with a
   stone fountain in it, its water as still as everything else; a gazebo by
   the gate and another at the far end, roses climbing their posts; benches
   facing the water and one by the ivy; shrubs and flowers along the hedges,
   which are leaves on leaves rather than a wall. The light is the same sun,
   straight overhead through leaves, only gentler: the sky is a paler green
   than the page's, the path is gravel a shade darker than the limewashed
   boards, so the boards are still the palest thing here, and the lawn and
   the water take the rest of the light down. The pond is ours and on our side;
   nothing new is drawn past the ivy.

   Every colour is one §28 declares, by name. It keeps nothing, sends nothing
   and fetches nothing; its page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['the-garden.html'] = {
    name: 'The Garden',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var RIGHT = -Math.PI / 2, LEFT = Math.PI / 2;
      // The same garden every time it is built: a seeded number, never chance.
      function rnd(n) { var x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); }

      // THE LIGHT IS MIDDAY THROUGH LEAVES. The sky is pale and green from the
      // leaves, the light thrown back off the path is green too, and the sun
      // is straight overhead, so each shadow lies directly under its thing.
      kit.scene.background = kit.col('--gd-sky');
      kit.scene.add(new T.HemisphereLight(kit.col('--gd-board'), kit.col('--gd-lawn-2'), 1.05));
      var sun = new T.DirectionalLight(kit.col('--gd-day'), 1.55);
      sun.position.set(0.001, 40, 0.001);
      sun.target.position.set(0, 0, -5);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      sun.shadow.camera.left = -30; sun.shadow.camera.right = 30;
      sun.shadow.camera.top = 30; sun.shadow.camera.bottom = -30;
      sun.shadow.camera.near = 1; sun.shadow.camera.far = 60;
      sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
      kit.scene.add(sun, sun.target);

      function blob(x, y, z, sx, sy, sz, ink, line) {
        var g = new T.SphereGeometry(1, 14, 10); g.scale(sx, sy, sz);
        kit.piece(g, at(x, y, z), ink, line === undefined ? 0.01 : line);
      }
      // Something laid flat on the ground at a height, merged, no outline.
      function onGround(geo, x, y, z, ink, ry) { kit.piece(geo, at(x, y, z, ry || 0, -Math.PI / 2), ink, false, false); }
      function flatOn(geo, x, z) { onGround(geo, x, 0.012, z, '--gd-gravel-2'); }

      // THE GROUND: lawn out to the hedges, and the gravel path down the
      // middle, the ground you are standing on.
      kit.piece(new T.PlaneGeometry(90, 90), at(0, 0, -5, 0, -Math.PI / 2), '--gd-lawn-2', false, false);
      onGround(new T.PlaneGeometry(9.4, 31), 0.6, 0.004, -6, '--gd-gravel');
      // THE LEAF SHADOW ON IT, painted and not layered, and still, and the
      // pebbles in the gravel.
      for (var d = 0; d < 46; d++) {
        var e = new T.CircleGeometry(1, 20); e.scale(0.35 + rnd(d) * 0.6, 0.22 + rnd(d + 50) * 0.4, 1);
        flatOn(e, -3.4 + rnd(d + 100) * 8.6, 8 - rnd(d + 200) * 27);
      }
      for (var pb = 0; pb < 420; pb++) {
        var pe = new T.CircleGeometry(0.035 + rnd(pb + 900) * 0.05, 6);
        onGround(pe, -4 + rnd(pb + 1000) * 9.3, 0.01, 9 - rnd(pb + 1100) * 30.5, rnd(pb + 1200) > 0.5 ? '--gd-stone-2' : '--gd-stone');
      }
      // The path's edging, a line of half-sunk stones down both sides.
      for (var ez = 9; ez > -21; ez -= 0.42) {
        [-4.15, 5.25].forEach(function (ex, i) { blob(ex, 0.03, ez + i * 0.2, 0.2, 0.08, 0.17, i ? '--gd-stone' : '--gd-stone-2', false); });
      }

      // THE HEDGE AT THE BOTTOM, with the gate in it you came in by, and the
      // hedge down the left. Leaves, kept, never a wall.
      var GZ = 9.6;
      // A hedge is a core of leaves with leaves on leaves over it, so it has
      // a surface the light can catch and never reads as a wall.
      function hedge(x0, x1, z0, z1, h) {
        var cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, w = Math.abs(x1 - x0), dd = Math.abs(z1 - z0);
        box(w, h, dd, at(cx, h / 2, cz), '--gd-leaf', 0.02);
        var along = w > dd, n = Math.ceil((along ? w : dd) / 0.62);
        for (var i = 0; i <= n; i++) {
          var t = i / n, hx = along ? x0 + (x1 - x0) * t : cx, hz = along ? cz : z0 + (z1 - z0) * t, k = i * 7 + Math.round(cx * 13 + cz * 3);
          blob(hx, h - 0.05 + rnd(k) * 0.12, hz, 0.42 + rnd(k + 1) * 0.16, 0.26, 0.42 + rnd(k + 2) * 0.16, rnd(k + 3) > 0.55 ? '--gd-leaf-2' : '--gd-leaf', false);
          [-1, 1].forEach(function (sd) {
            var fx = along ? hx : cx + sd * w / 2, fz = along ? cz + sd * dd / 2 : hz;
            blob(fx, h * (0.35 + rnd(k + 5 + sd) * 0.45), fz, along ? 0.36 : 0.16, 0.34, along ? 0.16 : 0.36, rnd(k + 8 + sd) > 0.6 ? '--gd-leaf-2' : '--gd-leaf', false);
          });
        }
      }
      hedge(-18.4, -1.1, GZ - 0.55, GZ + 0.55, 2.3);
      hedge(1.1, 13.1, GZ - 0.55, GZ + 0.55, 2.3);
      box(0.16, 2.6, 0.2, at(-1.1, 1.3, GZ), '--gd-loam-2', 0.01);
      box(0.16, 2.6, 0.2, at(1.1, 1.3, GZ), '--gd-loam-2', 0.01);
      var arch = new T.TorusGeometry(1.1, 0.08, 8, 24, Math.PI);
      kit.piece(arch, at(0, 2.6, GZ), '--gd-loam-2', 0.01);
      hedge(-18.9, -17.8, -21.2, 9.6, 2.3);
      // And a low one across the far end, with a gap past the spider's web.
      hedge(-18.4, -2.4, -21.7, -20.7, 1.3);
      hedge(3.4, 6.6, -21.7, -20.7, 1.3);

      // TREES behind the left hedge and in the lawn's corners, the leaves the
      // light came through, their shadows straight under them.
      function tree(x, z, s, k) {
        cyl(0.3 * s, 0.42 * s, 5.2 * s, at(x, 2.6 * s, z), '--gd-loam-2', 0.012, 10);
        cyl(0.08 * s, 0.12 * s, 1.6 * s, at(x + 0.5 * s, 4.6 * s, z, 0, 0, -0.7), '--gd-loam-2', 0.01, 6);
        for (var c = 0; c < 7; c++) {
          var a = c * 0.9 + k, rr = c ? 1.5 * s : 0;
          blob(x + Math.cos(a) * rr, (5.8 + rnd(k + c) * 1.3) * s, z + Math.sin(a) * rr, (1.5 + rnd(k + c + 9) * 0.6) * s, (1.0 + rnd(k + c + 19) * 0.3) * s, (1.4 + rnd(k + c + 29) * 0.6) * s, c % 3 ? '--gd-leaf' : '--gd-leaf-2');
        }
      }
      tree(-20.6, 3.0, 1, 1); tree(-21.0, -12.0, 1.1, 5); tree(-15.6, 6.6, 0.8, 9); tree(-16.0, -18.4, 0.85, 13);

      // THE BORDER, one long raised bed down the left: boards, soil, and
      // everything green starting at the top of the soil and never under it.
      var BX = -5.4, BW = 2.4, BZ0 = 1.4, BZ1 = -15.6, SOIL = 0.5;
      box(BW, SOIL - 0.04, BZ0 - BZ1, at(BX, (SOIL - 0.04) / 2, (BZ0 + BZ1) / 2), '--gd-loam-2', 0.012);
      box(BW - 0.16, 0.04, BZ0 - BZ1 - 0.16, at(BX, SOIL - 0.02, (BZ0 + BZ1) / 2), '--gd-loam', false);
      for (var p = 0, z = BZ0 - 0.6; z > BZ1 + 0.5; z -= 0.75, p++) {
        var x = BX - 0.6 + rnd(p + 300) * 1.2, kind = Math.floor(rnd(p + 400) * 4);
        if (kind === 0) {
          // a clump
          blob(x, SOIL + 0.28, z, 0.36, 0.28, 0.34, '--gd-leaf-2');
        } else if (kind === 1) {
          // an umbel on its stem, a flower head of the one bloom colour
          cyl(0.025, 0.03, 0.9, at(x, SOIL + 0.45, z), '--gd-leaf', false, 6);
          for (var u = 0; u < 5; u++) blob(x + Math.cos(u * 1.26) * 0.12, SOIL + 0.94, z + Math.sin(u * 1.26) * 0.12, 0.07, 0.06, 0.07, '--gd-bloom', false);
        } else if (kind === 2) {
          // a tendril up a cane, holding on
          cyl(0.02, 0.02, 1.3, at(x, SOIL + 0.65, z), '--gd-loam-2', false, 6);
          for (var k = 0; k < 6; k++) blob(x + Math.cos(k * 1.4) * 0.12, SOIL + 0.2 + k * 0.19, z + Math.sin(k * 1.4) * 0.12, 0.09, 0.06, 0.09, '--gd-leaf', false);
        } else {
          // a low spread of leaves
          blob(x, SOIL + 0.12, z, 0.5, 0.12, 0.4, '--gd-leaf');
          blob(x + 0.1, SOIL + 0.24, z - 0.1, 0.25, 0.1, 0.22, '--gd-leaf-2', false);
        }
      }

      // THE LAWN past the border, mown in stripes, with grass in it, and the
      // gravel round the end of the bed that takes you onto it.
      var LX0 = -17.4, LX1 = -6.9, LZ0 = 9.0, LZ1 = -20.6;
      var PX = -12.2, PZ = -5.6, PR = 2.5;
      for (var st = 0, sz = LZ0; sz > LZ1; sz -= 1.4, st++) {
        if (st % 2) onGround(new T.PlaneGeometry(LX1 - LX0, Math.min(1.4, sz - LZ1)), (LX0 + LX1) / 2, 0.003, sz - Math.min(1.4, sz - LZ1) / 2, '--gd-lawn');
      }
      onGround(new T.PlaneGeometry(3.6, 1.6), -5.6, 0.005, 3.1, '--gd-gravel');
      for (var gt = 0; gt < 520; gt++) {
        var gx = LX0 + rnd(gt + 1300) * (LX1 - LX0), gz = LZ0 - rnd(gt + 1400) * (LZ0 - LZ1);
        if (Math.hypot(gx - PX, gz - PZ) < PR + 1.0) continue;
        for (var bl = 0; bl < 3; bl++) {
          var blade = new T.ConeGeometry(0.025, 0.16 + rnd(gt * 3 + bl) * 0.1, 3);
          kit.piece(blade, at(gx + (bl - 1) * 0.04, 0.08, gz, 0, 0, (bl - 1) * 0.25), rnd(gt + 1500) > 0.5 ? '--gd-leaf-2' : '--gd-lawn-2', false, false);
        }
      }
      // Gravel walks across the lawn: from the bed's end to the near gazebo,
      // round the pond, and on to the far one.
      function walk(x0, z0, x1, z1, w) {
        var len = Math.hypot(x1 - x0, z1 - z0), ry = Math.atan2(x1 - x0, z1 - z0);
        kit.piece(new T.PlaneGeometry(w, len), at((x0 + x1) / 2, 0.006, (z0 + z1) / 2, ry, -Math.PI / 2), '--gd-gravel', false, false);
      }

      // THE POND, round, its rim of stones, the water still and the sky lying
      // on it, lily pads, and a stone fountain standing in the middle.
      walk(-7.4, 3.1, -13.4, 1.4, 1.1);
      walk(-12.2, -1.8, -12.2, -9.4, 1.1);
      kit.piece(new T.RingGeometry(PR + 0.2, PR + 1.1, 48), at(PX, 0.007, PZ, 0, -Math.PI / 2), '--gd-gravel', false, false);
      walk(-12.2, -9.4, -13.6, -13.0, 1.1);
      for (var rs = 0; rs < 40; rs++) {
        var ra = rs / 40 * Math.PI * 2;
        blob(PX + Math.cos(ra) * PR, 0.12, PZ + Math.sin(ra) * PR, 0.26, 0.15 + rnd(rs + 1600) * 0.06, 0.24, rs % 3 ? '--gd-stone' : '--gd-stone-2', 0.008);
      }
      onGround(new T.CircleGeometry(PR - 0.05, 48), PX, 0.07, PZ, '--gd-water');
      [[-0.9, 0.7, 0.9, 0.3], [0.8, -0.9, 0.6, 0.22], [0.3, 1.2, 0.4, 0.14]].forEach(function (rf) {
        var g = new T.CircleGeometry(1, 24); g.scale(rf[2], rf[3], 1);
        onGround(g, PX + rf[0], 0.075, PZ + rf[1], '--gd-water-2', 0.4);
      });
      [[1.3, 0.6], [-1.4, -0.6], [0.6, -1.5], [-0.5, 1.6], [1.6, -0.5]].forEach(function (lp, i) {
        onGround(new T.CircleGeometry(0.28 + i * 0.03, 16, 0.4, Math.PI * 2 - 0.5), PX + lp[0], 0.08, PZ + lp[1], i % 2 ? '--gd-leaf-2' : '--gd-leaf', i);
        if (i % 2 === 0) for (var pt = 0; pt < 5; pt++) blob(PX + lp[0] + Math.cos(pt * 1.26) * 0.07, 0.13, PZ + lp[1] + Math.sin(pt * 1.26) * 0.07, 0.06, 0.04, 0.03, '--gd-petal', false);
      });
      // The fountain: a pedestal, a wide basin, a small one over it, a finial,
      // and still water standing in both basins.
      cyl(0.32, 0.46, 0.6, at(PX, 0.3, PZ), '--gd-stone', 0.01, 12);
      cyl(1.05, 0.7, 0.26, at(PX, 0.72, PZ), '--gd-stone', 0.012, 20);
      onGround(new T.CircleGeometry(0.95, 24), PX, 0.86, PZ, '--gd-water');
      cyl(0.14, 0.2, 0.7, at(PX, 1.2, PZ), '--gd-stone-2', 0.008, 10);
      cyl(0.5, 0.32, 0.18, at(PX, 1.6, PZ), '--gd-stone', 0.01, 16);
      onGround(new T.CircleGeometry(0.43, 20), PX, 1.7, PZ, '--gd-water');
      blob(PX, 1.86, PZ, 0.13, 0.17, 0.13, '--gd-stone', 0.008);

      // A BENCH: slatted seat and back in the loam's wood on iron ends.
      function bench(x, z, ry) {
        var B = at(x, 0, z, ry);
        [-1, 1].forEach(function (sd) {
          box(0.07, 0.45, 0.46, at(sd * 0.74, 0.225, 0, 0, 0, 0, B), '--gd-stone-2', 0.008);
          box(0.07, 0.5, 0.06, at(sd * 0.74, 0.7, -0.22, 0, -0.18, 0, B), '--gd-stone-2', 0.006);
        });
        for (var sl = 0; sl < 4; sl++) box(1.6, 0.04, 0.1, at(0, 0.46, -0.17 + sl * 0.12, 0, 0, 0, B), '--gd-loam-2', 0.006);
        for (var bk = 0; bk < 3; bk++) box(1.6, 0.1, 0.035, at(0, 0.62 + bk * 0.14, -0.23 - bk * 0.025, 0, -0.18, 0, B), '--gd-loam-2', 0.006);
      }
      bench(PX + PR + 1.6, PZ, -Math.PI / 2);        // facing the pond, from the walk
      bench(PX, PZ + PR + 1.6, Math.PI);             // facing it from the near side
      bench(6.1, -5.8, -Math.PI / 2);                // by the ivy, facing the path

      // A GAZEBO: a stone floor, white posts, a rail but at its way in, a
      // roof of shingles, a seat round the inside, and a rose up two posts.
      function gazebo(x, z, r, door) {
        cyl(r + 0.3, r + 0.35, 0.22, at(x, 0.11, z), '--gd-stone', 0.01, 8);
        var top = 2.5;
        for (var i = 0; i < 8; i++) {
          var a = i * Math.PI / 4 + Math.PI / 8, px = x + Math.cos(a) * r, pz = z + Math.sin(a) * r;
          cyl(0.07, 0.08, top, at(px, 0.22 + top / 2, pz), '--gd-board', 0.008, 8);
          var b = (i + 1) * Math.PI / 4 + Math.PI / 8, qx = x + Math.cos(b) * r, qz = z + Math.sin(b) * r;
          var len = Math.hypot(qx - px, qz - pz), ang = Math.atan2(qx - px, qz - pz) - Math.PI / 2;
          box(len, 0.14, 0.12, at((px + qx) / 2, top + 0.15, (pz + qz) / 2, ang), '--gd-board', 0.008);
          if (i !== door) {
            box(len, 0.07, 0.07, at((px + qx) / 2, 0.95, (pz + qz) / 2, ang), '--gd-board', 0.006);
            for (var sp = 1; sp < 5; sp++) cyl(0.02, 0.02, 0.7, at(px + (qx - px) * sp / 5, 0.6, pz + (qz - pz) * sp / 5), '--gd-board', false, 5);
            box(len * 0.9, 0.06, 0.34, at((px + qx) / 2 - Math.cos((a + b) / 2) * 0.24, 0.48, (pz + qz) / 2 - Math.sin((a + b) / 2) * 0.24, ang), '--gd-loam-2', 0.006);
          }
        }
        var roof = new T.ConeGeometry(r + 0.55, 1.4, 8); roof.rotateY(Math.PI / 8);
        kit.piece(roof, at(x, top + 0.95, z), '--gd-loam-2', 0.014);
        for (var ri = 1; ri < 4; ri++) {
          var band = new T.ConeGeometry((r + 0.55) * (1 - ri / 4) + 0.04, 0.06, 8, 1, true); band.rotateY(Math.PI / 8);
          kit.piece(band, at(x, top + 0.25 + ri * 0.35, z), '--gd-loam', false, false);
        }
        blob(x, top + 1.74, z, 0.11, 0.16, 0.11, '--gd-board', 0.008);
        [door, door + 1].forEach(function (pi, n) {
          var a = (pi % 8) * Math.PI / 4 + Math.PI / 8, px = x + Math.cos(a) * (r + 0.05), pz = z + Math.sin(a) * (r + 0.05);
          for (var k = 0; k < 22; k++) {
            var ka = k * 2.4 + rnd(k + pi * 40) * 1.5, kr = 0.08 + rnd(k + pi * 50) * 0.08;
            blob(px + Math.cos(ka) * kr, 0.35 + k * 0.11 + rnd(k + pi * 60) * 0.06, pz + Math.sin(ka) * kr, 0.08, 0.06, 0.075, rnd(k + pi * 70) > 0.5 ? '--gd-leaf-2' : '--gd-leaf', false);
            if (k % 3 === 1) blob(px + Math.cos(ka + 1) * (kr + 0.06), 0.4 + k * 0.11, pz + Math.sin(ka + 1) * (kr + 0.06), 0.06, 0.05, 0.06, n ? '--gd-bloom' : '--gd-petal', false);
          }
        });
      }
      gazebo(-14.4, 1.6, 1.6, 7);        // the near one, its way in towards the walk
      gazebo(-14.4, -14.8, 1.8, 1);      // the far one

      // SHRUBS AND FLOWERS along the hedges' feet and round the lawn: clumps
      // of leaves, and the garden's flowers on stems over them.
      var FLOWERS = ['--gd-bloom', '--gd-petal', '--gd-sun'];
      function clump(x, z, k) {
        var s = 0.7 + rnd(k) * 0.6;
        blob(x, 0.32 * s, z, 0.5 * s, 0.36 * s, 0.45 * s, rnd(k + 1) > 0.5 ? '--gd-leaf' : '--gd-leaf-2', false);
        blob(x + 0.28 * s, 0.24 * s, z - 0.2 * s, 0.34 * s, 0.26 * s, 0.3 * s, '--gd-leaf-2', false);
        if (rnd(k + 2) > 0.35) {
          var fl = FLOWERS[Math.floor(rnd(k + 3) * 3)];
          for (var f = 0; f < 6; f++) blob(x + (rnd(k + f + 4) - 0.5) * 0.7 * s, 0.6 * s + rnd(k + f + 14) * 0.25, z + (rnd(k + f + 24) - 0.5) * 0.6 * s, 0.07, 0.06, 0.07, fl, false);
        }
      }
      for (var cz = 8.4, ck = 0; cz > -20; cz -= 1.15, ck++) clump(-17.0 + rnd(ck + 2000) * 0.4, cz, ck * 31 + 7);
      for (var cx = -16.6, cj = 0; cx < -7.4; cx += 1.2, cj++) { clump(cx, 8.6 - rnd(cj + 2100) * 0.3, cj * 17 + 3); clump(cx + 0.5, -20.0 + rnd(cj + 2200) * 0.3, cj * 13 + 5); }
      // Round the pond's walk, low and flowering, never on the stones.
      for (var pc = 0; pc < 14; pc++) {
        var pa = pc / 14 * Math.PI * 2 + 0.2;
        if (Math.abs(Math.sin(pa)) > 0.92 || Math.abs(Math.cos(pa)) > 0.95) continue;
        clump(PX + Math.cos(pa) * (PR + 1.6), PZ + Math.sin(pa) * (PR + 1.6), pc * 11 + 400);
      }
      // On our side of the ivy, between it and the path: flowers, kept clear of
      // the boards and the bench, and nothing past the ivy's line.
      [7.2, 5.6, 3.9, 2.2, 0.5, -1.0, -17.2, -18.6, -19.8].forEach(function (rz, i) { clump(6.25 + rnd(i + 2300) * 0.3, rz, i * 23 + 600); });

      // Two clipped bays in stone pots inside the gate.
      [-1.7, 1.7].forEach(function (gx2) {
        cyl(0.32, 0.24, 0.5, at(gx2, 0.25, GZ - 1.0), '--gd-stone', 0.01, 12);
        cyl(0.04, 0.05, 0.5, at(gx2, 0.7, GZ - 1.0), '--gd-loam-2', false, 6);
        blob(gx2, 1.22, GZ - 1.0, 0.42, 0.42, 0.42, '--gd-leaf', 0.012);
      });
      // And a rose up the gate's arch.
      for (var ar = 0; ar < 16; ar++) {
        var aa = ar / 15 * Math.PI;
        blob(Math.cos(aa) * 1.1, 2.6 + Math.sin(aa) * 1.1, GZ - 0.08, 0.16, 0.12, 0.1, ar % 2 ? '--gd-leaf-2' : '--gd-leaf', false);
        if (ar % 3 === 1) blob(Math.cos(aa) * 1.2, 2.6 + Math.sin(aa) * 1.2, GZ - 0.14, 0.07, 0.06, 0.05, '--gd-petal', false);
      }

      // HELEN'S IVY, winding along the ground down the right, with no post,
      // rail or panel in it, and glimmers in it that light nothing.
      var IX = 7.2, IZ0 = -1.5, IZ1 = -17;
      [0, 1, 2].forEach(function (s) {
        var pts = [];
        for (var i = 0; i <= 24; i++) {
          var zz = IZ0 + (IZ1 - IZ0) * i / 24;
          pts.push(new T.Vector3(IX + Math.sin(i * 0.9 + s * 2.1) * 0.35, 0.12 + 0.18 * (1 + Math.sin(i * 1.7 + s)), zz));
        }
        kit.piece(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 90, 0.035, 5), at(0, 0, 0), '--gd-loam-2', false);
        pts.forEach(function (v, j) {
          if (j % 2) return;
          blob(v.x + 0.08, v.y + 0.06, v.z, 0.16, 0.05, 0.13, s === 1 ? '--gd-leaf-2' : '--gd-leaf', false);
        });
      });
      // The glimmers: small stars in the ivy, still, lighting nothing.
      function star(x, y, z, r) {
        var sh = new T.Shape();
        for (var i = 0; i < 8; i++) {
          var a = i * Math.PI / 4, rr = i % 2 ? r * 0.35 : r;
          if (i === 0) sh.moveTo(Math.sin(a) * rr, Math.cos(a) * rr); else sh.lineTo(Math.sin(a) * rr, Math.cos(a) * rr);
        }
        sh.closePath();
        kit.flat(new T.ShapeGeometry(sh), at(x, y, z, RIGHT), '--gd-board');
      }
      for (var g = 0; g < 14; g++) star(IX - 0.25 + rnd(g + 500) * 0.5, 0.45 + rnd(g + 600) * 0.6, IZ0 - 0.6 - rnd(g + 700) * (IZ0 - IZ1 - 1.2), 0.07 + rnd(g + 800) * 0.05);

      // PAST THE IVY, the garden next door: Helen's, drawn as far as we can see
      // and no further. No bed, no soil of ours, and nothing over there casts a
      // shadow. The grounded one keeps a nurse tree over something growing in
      // its shelter; the wilder ground past it keeps a fern's crozier, still
      // coiled.
      kit.flat(new T.CylinderGeometry(0.28, 0.36, 4.4, 10), at(11.4, 2.2, -6.5), '--gd-loam-2');
      var crown = new T.SphereGeometry(1, 16, 12); crown.scale(2.4, 1.6, 2.2);
      kit.flat(crown, at(11.4, 4.9, -6.5), '--gd-leaf');
      var young = new T.SphereGeometry(1, 12, 8); young.scale(0.4, 0.5, 0.4);
      kit.flat(young, at(10.3, 0.45, -6.0), '--gd-leaf-2');
      kit.flat(new T.CylinderGeometry(0.03, 0.04, 1.4, 6), at(11.0, 0.7, -12.0), '--gd-leaf');
      kit.flat(new T.TorusGeometry(0.28, 0.05, 8, 20, Math.PI * 1.6), at(11.0, 1.55, -12.0, RIGHT), '--gd-leaf-2');

      // THE GARDEN SPIDER IN ITS WEB AT THE FAR END: two stems, the spokes and
      // the spiral in the loam's ink, and the spider at the hub, still.
      var WZ = -17.4, WY = 1.7;
      cyl(0.05, 0.07, 3.0, at(-1.9, 1.5, WZ), '--gd-leaf', 0.008, 8);
      cyl(0.05, 0.07, 3.0, at(1.9, 1.5, WZ), '--gd-leaf', 0.008, 8);
      for (var r = 0; r < 12; r++) {
        var a = r * Math.PI / 6, len = 1.55;
        box(0.012, len, 0.012, at(Math.sin(a) * len / 2, WY + Math.cos(a) * len / 2, WZ, 0, 0, -a), '--gd-loam', false, false);
      }
      [0.35, 0.65, 0.95, 1.25].forEach(function (rad) {
        kit.piece(new T.TorusGeometry(rad, 0.006, 4, 40), at(0, WY, WZ), '--gd-loam', false, false);
      });
      blob(0, WY - 0.06, WZ + 0.03, 0.13, 0.17, 0.09, '--gd-loam-2');
      blob(0, WY + 0.13, WZ + 0.03, 0.07, 0.07, 0.06, '--gd-loam');

      // THE BOARDS: limewashed planks laid on the path, brighter than it,
      // carried by their edge and the shadow under them, for each of the
      // page's parts to stand on.
      function spot(x, z, ry) { return { x: x, z: z, ry: ry }; }
      function plank(s, w) { box(w, 0.12, 0.5, at(s.x, 0.06, s.z, s.ry), '--gd-board', 0.012); }
      function front(name, s, dd, pitch, more) {
        var o = { name: name, x: s.x + Math.sin(s.ry) * dd, z: s.z + Math.cos(s.ry) * dd, yaw: s.ry, pitch: pitch || 0.05 };
        for (var key in more) o[key] = more[key];
        return o;
      }
      function foot(s, y) { return at(s.x, y, s.z, s.ry); }

      // THE ROOM'S OWN PAGE, by the gate you came in by, facing into the garden.
      var PG = spot(-3.3, 8.2, Math.PI), pgw = 2.4, pgh = pgw * 800 / 1180, pgy = 0.4 + pgh / 2;
      box(pgw + 0.14, pgh + 0.14, 0.06, at(PG.x, pgy, PG.z + 0.05, PG.ry), '--gd-loam-2', 0.01);
      [-1, 1].forEach(function (side) { box(0.1, pgy - pgh / 2, 0.1, at(PG.x + side * (pgw / 2 - 0.2), (pgy - pgh / 2) / 2, PG.z + 0.08), '--gd-loam-2', 0.008); });
      var page = kit.screen(1180, 800, pgw, at(PG.x, pgy, PG.z - 0.01, PG.ry), 'The Garden’s own page, by the gate, with the street through it');
      // and the page's own word about the gate, on the other side of it
      var GT = spot(3.3, 8.2, Math.PI);
      plank(GT, 1.8);
      var gateNote = kit.lift(page, '.gd-note', { n: 10, w: 640, ww: 1.6, m: foot(GT, 0.12) });

      // ON THE RIGHT AS YOU COME IN: what this is, and what a knowledge garden is.
      var LD = spot(3.0, 5.2, RIGHT), PK = spot(3.0, 1.6, RIGHT);
      plank(LD, 1.7); plank(PK, 2.4);
      var lede = kit.lift(page, '.lede', { w: 680, ww: 1.6, m: foot(LD, 0.12) });
      var plankWords = kit.lift(page, '.gd-plank', { w: 900, h: 980, ww: 2.3, m: foot(PK, 0.12) });

      // ON THE LEFT, AGAINST THE BORDER: the beds, as the page has them.
      var BN = spot(-3.0, 0.4, LEFT), BD = spot(-3.0, -3.6, LEFT);
      plank(BN, 1.7); plank(BD, 2.6);
      var bedsNote = kit.lift(page, '.gd-note', { n: 1, w: 680, ww: 1.6, m: foot(BN, 0.12) });
      var beds = kit.lift(page, '.gd-beds', { w: 1000, h: 1050, ww: 2.5, m: foot(BD, 0.12) });

      // ON THE RIGHT, AT THE IVY: the garden next door, its own words on our
      // side of the line, and the line's own story.
      var NA = spot(5.4, -3.6, RIGHT), NB = spot(5.4, -8.0, RIGHT), NC = spot(5.4, -12.0, RIGHT);
      plank(NA, 1.8); plank(NB, 1.9); plank(NC, 1.9);
      var nextNote = kit.lift(page, '.gd-note', { n: 2, w: 680, ww: 1.6, m: foot(NA, 0.12) });
      kit.lift(page, '.gd-note', { n: 3, w: 680, ww: 1.6, m: at(NA.x, 0.12, NA.z - 1.7, NA.ry) });
      var plotA = kit.lift(page, '.gd-plot', { n: 0, w: 720, h: 900, ww: 1.75, m: foot(NB, 0.12) });
      var plotB = kit.lift(page, '.gd-plot', { n: 1, w: 720, h: 900, ww: 1.75, m: foot(NC, 0.12) });

      // ON THE LEFT, FURTHER DOWN: starting a garden of your own.
      var DN = spot(-3.0, -8.6, LEFT), DR = spot(-3.0, -12.4, LEFT);
      plank(DN, 1.7); plank(DR, 2.4);
      var drillNote = kit.lift(page, '.gd-note', { n: 8, w: 680, ww: 1.6, m: foot(DN, 0.12) });
      var drills = kit.lift(page, '.gd-drills', { w: 900, h: 950, ww: 2.2, m: foot(DR, 0.12) });

      // BESIDE THE WEB: the spider's panel, whole, its caveats with it.
      var SP = spot(3.2, -15.6, RIGHT);
      plank(SP, 2.4);
      var spider = kit.lift(page, '.gd-spider', { w: 1000, h: 1000, ww: 2.4, m: foot(SP, 0.12) });

      return {
        start: { x: 0, z: 7.4, yaw: 0 },
        // The path, the gravel round the end of the bed, and the lawn.
        bounds: { areas: [{ x: [-3.6, 5.0], z: [-20.4, 8.6] }, { x: [-7.6, -3.4], z: [2.5, 3.7] }, { x: [-16.8, -7.3], z: [-19.8, 8.2] }] },
        stops: [
          { name: 'just through the gate, midday, the border down the left and the ivy down the right', x: 0, z: 7.4, yaw: 0, pitch: 0.04 },
          front('at the first board on the right: what this garden is', LD, 2.4, 0.08, { frame: lede.el }),
          front('at the long board on the right: what a knowledge garden is', PK, 2.8, 0.06, { frame: plankWords.el }),
          front('at the border: one bed per site we publish, and whose order they are in', BN, 2.4, 0.08, { frame: bedsNote.el }),
          front('at the beds, every one linking out to its site', BD, 2.9, 0.06, { frame: beds.el }),
          { name: 'in the middle of the path, every shadow small and straight under its thing', x: 0, z: -5.5, yaw: 0, pitch: -0.1 },
          front('at the ivy: the garden next door, which is Helen Edgar’s and not ours', NA, 2.4, 0.08, { frame: nextNote.el }),
          front('at the ivy, before Autistic Realms', NB, 2.4, 0.06, { frame: plotA.el }),
          front('at the ivy, before More Realms', NC, 2.4, 0.06, { frame: plotB.el }),
          front('on the left: starting a garden of your own', DN, 2.4, 0.08, { frame: drillNote.el }),
          front('at the steps for a garden of your own', DR, 2.8, 0.06, { frame: drills.el }),
          front('beside the garden spider’s web, and what it can and cannot do', SP, 2.8, 0.06, { frame: spider.el }),
          { name: 'on the gravel round the end of the border, the lawn opening out on the left', x: -5.6, z: 3.1, yaw: Math.PI / 2 + 0.25, pitch: 0.02 },
          { name: 'on the bench facing the pond, the fountain standing still in it', x: PX + PR + 1.9, z: PZ, yaw: Math.PI / 2, pitch: -0.08 },
          { name: 'on the lawn by the near gazebo, a rose climbing its posts', x: -9.0, z: 2.2, yaw: Math.PI / 2 - 0.1, pitch: 0.08 },
          { name: 'at the far gazebo, at the far corner of the lawn', x: -10.2, z: -11.2, yaw: 0.87, pitch: 0.08 },
          { name: 'on the bench by the ivy, the path in front of you', x: 4.6, z: -5.8, yaw: Math.PI / 2, pitch: -0.02 },
          { name: 'the World room, past the spider’s web', x: 1.6, z: -19.6, yaw: 0, pitch: 0.04, where: 'at the gap in the far hedge past the web, where the spider’s own web runs on between every room', room: 'the World room', page: 'world.html' },
          front('back at the gate you came in by, with the room’s own page beside it', PG, 2.4, 0.05, { page: kit.page, frame: page }),
          front('at the gate’s own word about the street through it', GT, 2.2, 0.08, { frame: gateNote.el })
        ]
      };
    }
  };
})();

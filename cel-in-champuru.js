/* =============================================================================
   Champuru, walked into on Cel Street. Ryan's ask, 2026-11-04: its room, and
   a second pass on it.

   IT IS THE LANE'S WORLD AND NOBODY ELSE'S (§136): Ryan's own table, in the
   shade of a narrow lane at noon, the kind both shores have, Mediterranean
   and Okinawan. On the left a wall of coral stone under a red-tiled eave, in
   shade, with the restaurant's door in it; on the right a whitewashed wall in
   full sun, with teal shutters; bougainvillea over both; and at the far end
   a strip of sea under a strip of sky.

   THE LIGHT IS THE SUN OFF THE WALL ACROSS THE LANE. No sun lands on the
   table or on anything you sit by. The whitewash is the brightest thing in
   the lane, drawn in the sun's own colour and lit by nothing, and what it
   throws back is the only light with a side: every face that looks towards it
   is warm, every face that looks away is in the sky's cool shade, and nothing
   casts a hard shadow. If sun ever lands on the table this has become the
   Hermitage with a menu; if the light ever comes from nowhere, the Dairy.
   VITAL PLANT LIVING, next door, is a kitchen cut open with no light in it;
   this is outdoors, whole, at eye level, and nothing in it is drawn cut.

   THE PAGE'S OWN WORDS stand on the walls as the page has them: the menu on
   boards under the eave, a board for each of its sections, Ryan's own words
   on the whitewash, and the screen in the restaurant's doorway with the
   channels' month on a rack beside it, played through rack.js, whose titles
   are the channels' own. Nothing here says what food does for a body, and no
   word is the room's: every one is lifted off the page. The food on the
   tables is drawn, never named.

   NOTHING MOVES, at any setting: no steam, no petal falling, no shadow
   sliding round. Every colour is one §136 declares, by name. It keeps
   nothing, sends nothing and fetches nothing; its page arrives through Cel
   Street's screen().
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 7, 374761393) ^ Math.imul(j + 29, 668265263) ^ Math.imul(k + 31, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['champuru.html'] = {
    name: 'Champuru',
    faces: ['"Klee One"'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var XL = -2.8, XR = 2.8;          // the coral wall and the whitewash
      var NEAR = 4, FAR = -30;          // the street end and the sea end
      var EAVE = 3.3, WALLH = 5.2;

      // THE SKY, and the shade, which is the colour of the sky; and the one
      // light with a side, thrown back off the whitewash on the right.
      kit.scene.background = kit.col('--chp-sky');
      kit.scene.fog = new T.Fog(kit.col('--chp-shade'), 60, 260);
      kit.scene.add(new T.HemisphereLight(kit.col('--chp-shade'), kit.col('--chp-coral-dark'), 1.9));
      var bounce = new T.DirectionalLight(kit.col('--chp-bounce'), 1.35);
      bounce.position.set(30, 4, -4);
      kit.scene.add(bounce);

      // THE LANE: stone paving in shade, its joints, and a gutter of cobbles
      // down the middle.
      box(XR - XL + 0.4, 0.1, NEAR - FAR + 4, at(0, -0.05, (NEAR + FAR) / 2 + 1.7), '--chp-coral', false, false);
      for (var z = NEAR; z > FAR; z -= 0.62) {
        box(XR - XL, 0.012, 0.03, at(0, 0.004, z), '--chp-coral-dark', false, false);
        var off = hash(Math.round(z * 10), 1, 1) * 0.9;
        for (var x = XL + off; x < XR; x += 0.9 + hash(Math.round(z * 10), 2, Math.round(x * 10)) * 0.5) {
          box(0.03, 0.012, 0.6, at(x, 0.004, z - 0.31), '--chp-coral-dark', false, false);
        }
      }
      // The gutter down the middle: a shallow channel of darker stones set on
      // edge, the way a lane on either shore carries the rain away.
      box(0.34, 0.02, NEAR - FAR, at(0, 0.005, (NEAR + FAR) / 2), '--chp-coral-dark', false, false);
      for (var c = NEAR - 0.1; c > FAR; c -= 0.16) {
        box(0.3, 0.025, 0.12, at((hash(Math.round(c * 50), 3, 1) - 0.5) * 0.03, 0.012, c), (Math.round(c * 50) % 3) ? '--chp-coral' : '--chp-shadow', false, false);
      }

      // THE WHITEWASH ON THE RIGHT, in full sun: drawn in the sun's own colour
      // and lit by nothing, the brightest thing here. Teal shutters and doors
      // in it, a step up to each door, and pots at its foot.
      kit.flat(new T.PlaneGeometry(NEAR - FAR, WALLH), at(XR, WALLH / 2, (NEAR + FAR) / 2, RIGHT), '--chp-sun');
      box(0.3, WALLH, NEAR - FAR, at(XR + 0.16, WALLH / 2, (NEAR + FAR) / 2), '--chp-sun', false, false);
      [-2.2, -11.5, -20.5].forEach(function (dz, i) {
        // A door, shut, with its step.
        box(0.08, 2.15, 1.05, at(XR - 0.04, 1.075, dz), '--chp-door', 0.012);
        box(0.06, 2.25, 0.06, at(XR - 0.05, 1.12, dz - 0.56), '--chp-sea', false);
        box(0.06, 2.25, 0.06, at(XR - 0.05, 1.12, dz + 0.56), '--chp-sea', false);
        box(0.06, 0.06, 1.18, at(XR - 0.05, 2.24, dz), '--chp-sea', false);
        box(0.4, 0.12, 1.3, at(XR - 0.2, 0.06, dz), '--chp-coral', 0.01);
        cyl(0.03, 0.03, 0.05, at(XR - 0.1, 1.05, dz + 0.36, 0, 0, Math.PI / 2), '--chp-ink', false, 6);
      });
      for (var w = 0; w < 9; w++) {
        var wz = 1.2 - w * 3.6;
        if ([-2.2, -11.5, -20.5].some(function (d) { return Math.abs(d - wz) < 1.1; })) continue;
        [2.9, 4.2].forEach(function (wy, j) {
          if (j && hash(w, 4, 1) < 0.35) return;
          box(0.05, 0.9, 0.62, at(XR - 0.03, wy, wz), '--chp-ink-2', false);
          [-1, 1].forEach(function (s) {
            var open = hash(w, 5 + j, s + 2) < 0.5;
            box(0.05, 0.94, 0.3, at(XR - 0.05 - (open ? 0.12 : 0), wy, wz + s * (open ? 0.5 : 0.155), open ? s * 0.5 : 0), '--chp-door', 0.008);
          });
          box(0.16, 0.05, 0.78, at(XR - 0.08, wy - 0.5, wz), '--chp-coral', false);
        });
      }

      // THE CORAL STONE ON THE LEFT, in shade, coursed, under its red-tiled
      // eave, with the restaurant's door in it.
      var DOORZ = -9, DW = 1.5, DH = 2.5;
      box(0.4, WALLH - 1.2, NEAR - DOORZ - DW / 2, at(XL - 0.2, (WALLH - 1.2) / 2, (NEAR + DOORZ + DW / 2) / 2), '--chp-coral', 0.02);
      box(0.4, WALLH - 1.2, DOORZ - DW / 2 - FAR, at(XL - 0.2, (WALLH - 1.2) / 2, (DOORZ - DW / 2 + FAR) / 2), '--chp-coral', 0.02);
      box(0.4, WALLH - 1.2 - DH, DW, at(XL - 0.2, DH + (WALLH - 1.2 - DH) / 2, DOORZ), '--chp-coral', false);
      // Coral stone laid in courses of its own uneven heights, each stone its
      // own length, and here and there one darker than its neighbours.
      var courses = [], cy = 0;
      for (var q = 0; cy < WALLH - 1.3; q++) { var ch = 0.24 + hash(q, 6, 9) * 0.14; courses.push([cy, ch]); cy += ch; }
      courses.forEach(function (co, qi) {
        var y0 = co[0], ch2 = co[1];
        box(0.02, 0.02, NEAR - FAR, at(XL + 0.005, y0 + ch2, (NEAR + FAR) / 2), '--chp-coral-dark', false, false);
        for (var bz = NEAR - hash(qi, 6, 1) * 0.6; bz > FAR; ) {
          var len = 0.38 + hash(qi, 7, Math.round(bz * 10)) * 0.5;
          var inDoor = Math.abs(bz - DOORZ) < DW / 2 + 0.05 && y0 < DH;
          if (!inDoor) {
            box(0.02, ch2, 0.02, at(XL + 0.005, y0 + ch2 / 2, bz), '--chp-coral-dark', false, false);
            if (hash(qi, 8, Math.round(bz * 10)) < 0.12) box(0.012, ch2 - 0.03, len - 0.04, at(XL + 0.004, y0 + ch2 / 2, bz - len / 2), '--chp-coral-dark', false, false);
          }
          bz -= len;
        }
      });
      // The eave: rafters, the boards, and the round tiles in rows, red.
      box(1.1, 0.08, NEAR - FAR, at(XL + 0.45, EAVE + 0.15, (NEAR + FAR) / 2, 0, 0, -0.32), '--chp-tile-dark', 0.01);
      for (var tz = NEAR - 0.1; tz > FAR; tz -= 0.24) {
        var tile = new T.CylinderGeometry(0.11, 0.11, 1.15, 8, 1, false, 0, Math.PI);
        kit.piece(tile, at(XL + 0.45, EAVE + 0.26, tz, 0, 0, Math.PI / 2 - 0.32), (Math.round(tz / 0.24) % 2) ? '--chp-tile' : '--chp-tile-dark', 0.008);
      }
      for (var rz = NEAR - 0.5; rz > FAR; rz -= 1.2) box(0.42, 0.08, 0.08, at(XL + 0.2, EAVE + 0.05, rz), '--chp-tile-dark', 0.006);
      // The upper storey, set back over the eave: coral too, a small window
      // with its shutter, and the flat roof's parapet against the sky.
      box(0.4, 2.3, NEAR - FAR, at(XL - 0.6, WALLH - 1.2 + 1.15, (NEAR + FAR) / 2), '--chp-coral', 0.02);
      box(0.6, 0.18, NEAR - FAR, at(XL - 0.5, WALLH + 1.2, (NEAR + FAR) / 2), '--chp-coral-dark', 0.01);
      [-1.5, -8.5, -17.5, -24.5].forEach(function (wz2, i) {
        box(0.05, 0.7, 0.55, at(XL - 0.38, WALLH + 0.15, wz2), '--chp-ink-2', false);
        box(0.05, 0.74, 0.28, at(XL - 0.35, WALLH + 0.15, wz2 + (i % 2 ? 0.42 : -0.42), i % 2 ? 0.5 : -0.5), '--chp-door', 0.006);
      });

      // The restaurant's doorway, and inside it, the room in shade with the
      // screen standing in the doorway.
      box(0.06, DH + 0.1, 0.12, at(XL + 0.03, DH / 2, DOORZ - DW / 2 - 0.06), '--chp-sea', false);
      box(0.06, DH + 0.1, 0.12, at(XL + 0.03, DH / 2, DOORZ + DW / 2 + 0.06), '--chp-sea', false);
      box(0.06, 0.12, DW + 0.24, at(XL + 0.03, DH + 0.05, DOORZ), '--chp-sea', false);
      // Inside, the room in deep shade: its floor, its back wall, a counter
      // and the shelves behind it with their jars, and a noren hung half way
      // down the doorway, split in two, the way a kitchen door is on the
      // eastern shore.
      box(2.0, 0.04, DW, at(XL - 1.1, 0.0, DOORZ), '--chp-coral-dark', false, false);
      box(0.1, DH, DW + 0.4, at(XL - 2.0, DH / 2, DOORZ), '--chp-ink-2', false, false);
      box(2.0, 0.1, DW + 0.4, at(XL - 1.1, DH, DOORZ), '--chp-ink', false, false);
      [-1, 1].forEach(function (sd) { box(2.0, DH, 0.1, at(XL - 1.1, DH / 2, DOORZ + sd * (DW / 2 + 0.1)), '--chp-ink-2', false, false); });
      box(0.5, 0.95, DW - 0.2, at(XL - 1.6, 0.475, DOORZ), '--chp-sea', 0.01);
      [1.35, 1.75].forEach(function (sy) {
        box(0.2, 0.04, DW - 0.1, at(XL - 1.85, sy, DOORZ), '--chp-coral', false);
        for (var j = 0; j < 5; j++) cyl(0.05, 0.05, 0.16, at(XL - 1.85, sy + 0.1, DOORZ - DW / 2 + 0.2 + j * 0.27), j % 2 ? '--chp-water' : '--chp-tile', 0.004, 8);
      });
      [-1, 1].forEach(function (sd) {
        box(0.02, 0.85, DW / 2 - 0.04, at(XL + 0.02, DH - 0.45, DOORZ + sd * (DW / 4)), '--chp-sea', 0.006);
        box(0.022, 0.05, DW / 2 - 0.04, at(XL + 0.025, DH - 0.12, DOORZ + sd * (DW / 4)), '--chp-cloth', false);
      });
      var sign = kit.paper(900, 200, function (g, cw, ch) {
        g.fillStyle = kit.ink('--chp-cloth'); g.fillRect(0, 0, cw, ch);
        g.strokeStyle = kit.ink('--chp-sea'); g.lineWidth = 10; g.strokeRect(8, 8, cw - 16, ch - 16);
        g.fillStyle = kit.ink('--chp-sea'); g.textAlign = 'center'; g.textBaseline = 'middle';
        g.font = '600 120px "Klee One"'; g.fillText('Champuru', cw / 2, ch / 2 + 6);
      });
      kit.sheet(sign, 1.6, 0.36, at(XL + 0.08, DH + 0.42, DOORZ, LEFT));

      // BOUGAINVILLEA over both walls: leaves in clusters and the bracts in
      // their own magenta, spilling down from the tops.
      var LEAF = new T.IcosahedronGeometry(1, 1);
      function bougain(x, y, z, spread, seed, drop) {
        // The leaves first, in clumps along a stem that falls away from the
        // top, and the bracts in small bunches out on the clumps.
        for (var q = 0; q < 34; q++) {
          var t = hash(q, seed, 2), lx = x + (hash(q, seed, 1) - 0.5) * 0.4, ly = y - t * drop, lz = z + (hash(q, seed, 3) - 0.5) * spread * (1 - t * 0.5);
          var l = LEAF.clone(); var r = 0.1 + hash(q, seed, 4) * 0.1; l.scale(r * 0.6, r * 0.9, r);
          kit.piece(l, at(lx, ly, lz, q), '--chp-leaf', 0.008);
          if (q % 2) {
            for (var b2 = 0; b2 < 3; b2++) {
              var br = new T.IcosahedronGeometry(0.055, 0);
              kit.piece(br, at(lx + 0.05 * (b2 - 1), ly + 0.06 + (b2 % 2) * 0.04, lz + 0.05 * (1 - b2), q + b2), '--chp-flower', false);
            }
          }
        }
      }
      bougain(XR - 0.25, WALLH - 0.1, -6.2, 3.2, 11, 2.2);
      bougain(XR - 0.25, WALLH - 0.1, -16, 2.6, 12, 1.6);
      bougain(XR - 0.25, WALLH - 0.1, -25, 3.0, 13, 2.6);
      bougain(XL + 0.5, EAVE + 0.5, -4.5, 2.2, 14, 1.3);
      bougain(XL + 0.5, EAVE + 0.5, -18.5, 2.6, 15, 1.1);

      // POTS at the foot of the whitewash and by the restaurant's door.
      function pot(px, pz, s, seed) {
        cyl(0.2 * s, 0.14 * s, 0.34 * s, at(px, 0.17 * s, pz), '--chp-tile', 0.01, 12);
        cyl(0.22 * s, 0.22 * s, 0.05 * s, at(px, 0.34 * s, pz), '--chp-tile-dark', false, 12);
        var p = LEAF.clone(); p.scale(0.26 * s, 0.32 * s, 0.26 * s);
        kit.piece(p, at(px, 0.6 * s, pz, seed), '--chp-leaf', 0.01);
        if (seed % 2) kit.piece(new T.SphereGeometry(0.06 * s, 6, 5), at(px + 0.08 * s, 0.82 * s, pz), '--chp-flower', false);
      }
      [[XR - 0.35, -0.6, 1.1], [XR - 0.35, -4.4, 0.8], [XR - 0.35, -9.5, 1.2], [XR - 0.35, -14.0, 0.9],
       [XR - 0.35, -18.2, 1.0], [XR - 0.35, -24.0, 1.3], [XL + 0.35, DOORZ + 1.15, 1.0], [XL + 0.35, DOORZ - 1.15, 1.0]].forEach(function (p, i) {
        pot(p[0], p[1], p[2], i);
      });

      // THE TABLES, in the shade along the coral wall, each under its cloth,
      // and Ryan's first, nearest the street, with his lunch laid on it: a
      // plate of something green and pale stirred together, a dish of purple
      // potato, a salad with a white slab on it, olives, bread, a teapot and a
      // glass of water. The food is drawn, never named: the menu is the page's.
      function table(tz, laid, seed) {
        var tx = XL + 1.0;
        cyl(0.42, 0.42, 0.04, at(tx, 0.74, tz), '--chp-cloth', 0.01, 22);
        cyl(0.44, 0.44, 0.16, at(tx, 0.66, tz), '--chp-cloth', false, 22);
        cyl(0.035, 0.035, 0.6, at(tx, 0.3, tz), '--chp-ink-2', false, 8);
        cyl(0.2, 0.2, 0.02, at(tx, 0.01, tz), '--chp-ink-2', false, 14);
        [[0.62, 0, -Math.PI / 2], [0, 0.62, Math.PI]].forEach(function (o, k) {
          var g = at(tx + o[0], 0, tz + o[1], o[2]);
          box(0.42, 0.04, 0.42, M(g, at(0, 0.45, 0)), '--chp-door', 0.008);
          box(0.42, 0.42, 0.04, M(g, at(0, 0.68, -0.2)), '--chp-door', 0.008);
          [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].forEach(function (l) { box(0.03, 0.45, 0.03, M(g, at(l[0], 0.22, l[1])), '--chp-sea', false); });
          if (k === 0 && seed % 2) box(0.38, 0.06, 0.38, M(g, at(0, 0.49, 0)), '--chp-flower', false);
        });
        if (!laid) {
          cyl(0.05, 0.04, 0.12, at(tx, 0.82, tz), '--chp-water', 0.004, 10);
          kit.piece(new T.SphereGeometry(0.04, 6, 5), at(tx, 0.92, tz), '--chp-flower', false);
          return;
        }
        // The plates.
        function plate(px, pz) { cyl(0.13, 0.11, 0.02, at(px, 0.77, pz), '--chp-plate', 0.004, 18); }
        plate(tx + 0.12, tz + 0.12);
        for (var g2 = 0; g2 < 9; g2++) {
          var bit = new T.BoxGeometry(0.04, 0.025, 0.04);
          kit.piece(bit, at(tx + 0.12 + (hash(g2, 8, 1) - 0.5) * 0.14, 0.795, tz + 0.12 + (hash(g2, 8, 2) - 0.5) * 0.14, g2), g2 % 3 ? '--chp-leaf' : '--chp-plate', false);
        }
        plate(tx - 0.16, tz - 0.06);
        [0, 1, 2].forEach(function (k) {
          var imo = new T.SphereGeometry(0.035, 8, 6); imo.scale(1.4, 0.8, 1);
          kit.piece(imo, at(tx - 0.2 + k * 0.05, 0.8, tz - 0.06 + (k % 2) * 0.03, k), '--chp-imo', 0.004);
        });
        plate(tx + 0.06, tz - 0.22);
        box(0.08, 0.035, 0.06, at(tx + 0.06, 0.8, tz - 0.22), '--chp-plate', 0.004);
        [0, 1, 2, 3].forEach(function (k) { kit.piece(new T.SphereGeometry(0.02, 6, 5), at(tx + 0.02 + k * 0.025, 0.79, tz - 0.18 - (k % 2) * 0.03), k % 2 ? '--chp-tile' : '--chp-leaf', false); });
        [0, 1, 2].forEach(function (k) { kit.piece(new T.SphereGeometry(0.014, 6, 5), at(tx - 0.24 + k * 0.022, 0.77, tz + 0.2), '--chp-ink', false); });
        box(0.16, 0.05, 0.08, at(tx - 0.08, 0.785, tz + 0.26, 0.3), '--chp-bounce', 0.004);
        cyl(0.07, 0.08, 0.1, at(tx + 0.28, 0.81, tz - 0.12), '--chp-sea', 0.004, 12);
        cyl(0.012, 0.012, 0.09, at(tx + 0.36, 0.83, tz - 0.12, 0, 0, -0.9), '--chp-sea', false, 6);
        cyl(0.035, 0.03, 0.1, at(tx + 0.26, 0.81, tz + 0.1), '--chp-water', 0.004, 10);
      }
      table(-5.4, true, 1);
      table(-13.4, false, 2);
      table(-22.6, false, 3);

      // A WASHING LINE strung across the lane between the walls, high up, and
      // what is pegged on it hanging still: there is no wind in here.
      [[-7.2, 4.5], [-20.0, 4.3]].forEach(function (wl, i) {
        var lz2 = wl[0], ly2 = wl[1];
        cyl(0.008, 0.008, XR - XL, at(0, ly2, lz2, 0, 0, Math.PI / 2), '--chp-ink-2', false, 4);
        var CLOTHS = ['--chp-cloth', '--chp-sea', '--chp-flower', '--chp-bounce', '--chp-door', '--chp-plate'];
        for (var k2 = 0; k2 < 5; k2++) {
          var cw2 = 0.35 + hash(k2, 9 + i, 1) * 0.35, ch3 = 0.4 + hash(k2, 9 + i, 2) * 0.45;
          var cx2 = XL + 0.7 + k2 * 0.95 + hash(k2, 9 + i, 3) * 0.2;
          box(cw2, ch3, 0.02, at(cx2, ly2 - ch3 / 2 - 0.02, lz2), CLOTHS[(k2 + i * 2) % CLOTHS.length], 0.004);
        }
      });

      // AN OUTSIDE STAIR up the whitewash to a door on the floor above, in
      // the sun, with a teal rail and a pot on every few steps.
      var SZ0 = -13.2, STEPS = 12, RISE = 0.24, RUN = 0.32;
      for (var st = 0; st < STEPS; st++) {
        box(0.75, RISE * (st + 1), RUN, at(XR - 0.38, RISE * (st + 1) / 2, SZ0 - st * RUN), '--chp-coral', 0.008);
        if (st % 4 === 1) pot(XR - 0.62, SZ0 - st * RUN, 0.6, st);
      }
      box(0.75, 0.12, 1.1, at(XR - 0.38, RISE * STEPS, SZ0 - STEPS * RUN - 0.45), '--chp-coral', 0.008);
      box(0.06, 2.0, 0.9, at(XR - 0.03, RISE * STEPS + 1.0, SZ0 - STEPS * RUN - 0.45), '--chp-door', 0.01);
      var railLen = Math.hypot(STEPS * RUN, STEPS * RISE);
      cyl(0.025, 0.025, railLen, at(XR - 0.76, 0.9 + STEPS * RISE / 2, SZ0 - STEPS * RUN / 2, 0, Math.atan2(STEPS * RUN, STEPS * RISE)), '--chp-sea', false, 6);
      for (st = 0; st <= STEPS; st += 3) cyl(0.02, 0.02, 0.9, at(XR - 0.76, RISE * st + 0.45, SZ0 - st * RUN), '--chp-sea', false, 6);

      // A BENCH against the whitewash, and a lantern on the coral wall by the
      // door, both unlit: it is noon.
      box(1.5, 0.06, 0.4, at(XR - 0.3, 0.46, -26.6), '--chp-sea', 0.008);
      [-0.6, 0.6].forEach(function (o) { box(0.06, 0.44, 0.36, at(XR - 0.3, 0.22, -26.6 + o), '--chp-sea', false); });
      box(0.16, 0.26, 0.16, at(XL + 0.14, DH + 0.1, DOORZ + 1.3), '--chp-ink-2', 0.006);
      box(0.12, 0.18, 0.12, at(XL + 0.14, DH + 0.1, DOORZ + 1.3), '--chp-cloth', false);
      box(0.2, 0.04, 0.04, at(XL + 0.07, DH + 0.27, DOORZ + 1.3), '--chp-ink-2', false);

      // THE SEA, at the far end of the lane: a strip of water under a strip
      // of sky, with nothing on it.
      // The lane ends at a parapet over a drop, with a teal rail along it,
      // and the sea lies flat below all the way out to the sky, with the sun's
      // own road across it far out, where the sun is.
      box(XR - XL, 0.7, 0.5, at(0, 0.35, FAR - 0.25), '--chp-coral', 0.02);
      box(XR - XL, 0.06, 0.6, at(0, 0.73, FAR - 0.25), '--chp-coral-dark', false);
      cyl(0.03, 0.03, XR - XL, at(0, 1.05, FAR - 0.25, 0, 0, Math.PI / 2), '--chp-sea', false, 6);
      for (var rx = XL + 0.3; rx < XR; rx += 0.9) cyl(0.02, 0.02, 0.32, at(rx, 0.9, FAR - 0.25), '--chp-sea', false, 6);
      box(XR - XL + 0.8, 6, 0.4, at(0, -3, FAR - 0.7), '--chp-coral-dark', false, false);
      box(600, 0.1, 400, at(0, -5, FAR - 201), '--chp-water', false, false);
      for (var g3 = 0; g3 < 40; g3++) {
        kit.flat(new T.PlaneGeometry(1.2 + hash(g3, 20, 1) * 3, 0.12), at((hash(g3, 20, 2) - 0.5) * 24, -4.94, FAR - 60 - hash(g3, 20, 3) * 140, 0, -Math.PI / 2), '--chp-sun');
      }

      // THE PAGE ITSELF, on the coral wall nearest the street, where you come
      // in, in a teal frame.
      var pw = 2.3, ph = pw * 800 / 1180, py = 0.95 + ph / 2;
      box(0.05, ph + 0.16, pw + 0.16, at(XL + 0.03, py, 1.0), '--chp-sea', false);
      var page = kit.screen(1180, 800, pw, at(XL + 0.07, py, 1.0, LEFT), 'Champuru’s own page, on the coral wall where you come into the lane');

      // THE PAGE'S OWN WORDS, where they would be: the lede, the name and
      // Ryan's own words on the whitewash; the menu under the eave, a board
      // for each section; the screen in the doorway and the month's rack
      // beside it; how the kitchen cooks and what holds at the table further
      // down.
      function onLeft(z, y) { return at(XL + 0.06, y, z, LEFT); }
      function onRight(z, y) { return at(XR - 0.06, y, z, RIGHT); }
      var lede = kit.lift(page, '.chp-lede', { w: 700, h: 560, ww: 1.9, m: onRight(1.2, 0.85) });
      var named = kit.lift(page, '.chp-part', { n: 1, w: 700, h: 560, ww: 1.9, m: onRight(-6.2, 0.85) });
      var whose = kit.lift(page, '.chp-part', { n: 2, w: 700, h: 600, ww: 1.9, m: onRight(-16.2, 0.85) });
      var BOARDS = [['the Mediterranean', -15.8], ['Okinawa', -18.6], ['both shores at once', -25.4], ['what there is to drink', -28.2]];
      var boards = BOARDS.map(function (b, i) {
        box(0.05, 1.98, 1.98, at(XL + 0.03, 0.75 + 0.95, b[1]), '--chp-sea', false);
        return { said: b[0], z: b[1], it: kit.lift(page, '.chp-board', { n: i, w: 620, h: 600, ww: 1.8, m: onLeft(b[1], 0.82) }) };
      });
      var screenAt = onLeft(DOORZ, 0.75);
      kit.lift(page, '.chp-screen', { w: 760, ww: 1.4, m: M(screenAt, at(0, 0, -0.03)) });
      kit.lift(page, '.chp-screen__now', { w: 760, ww: 1.4, m: onLeft(DOORZ, 0.38) });
      kit.lift(page, '.chp-screen__back', { w: 760, ww: 1.4, m: onLeft(DOORZ, 0.18) });
      var rack = kit.lift(page, '.chp-rack', { w: 760, h: 760, ww: 2.0, m: onLeft(-11.8, 0.6) });
      kit.lift(page, '.chp-rack__set', { w: 760, ww: 2.0, m: onLeft(-11.8, 0.32) });
      var kitchen = kit.lift(page, '.chp-part', { n: 5, w: 700, h: 560, ww: 1.8, m: onRight(-26.8, 0.85) });
      var rules = kit.lift(page, '.chp-part', { n: 6, w: 700, h: 560, ww: 1.8, m: onRight(-29.2, 0.85) });
      kit.wire(page, 'rack.js');

      var stops = [
        { name: 'in from the street, the lane going away to the sea, the whitewash in the sun on your right', where: 'at the street end of the lane', x: 0, z: 3.2, yaw: 0, pitch: 0.04 },
        { name: 'at the coral wall where you came in, with the room’s own page on it', where: 'at the room’s own page', x: XL + 2.2, z: 1.0, yaw: LEFT, pitch: 0.06, page: kit.page, frame: page },
        { name: 'at the whitewash by the street end: the lane', where: 'at the whitewash, at the lane in words', x: XR - 2.3, z: 1.2, yaw: RIGHT, pitch: 0.1, frame: lede.el },
        { name: 'at Ryan’s table in the shade, his lunch laid on it', where: 'at Ryan’s table', x: XL + 2.5, z: -4.3, yaw: 0.95, pitch: -0.42 },
        { name: 'on the whitewash: the name', where: 'at the whitewash, at the name', x: XR - 2.3, z: -6.2, yaw: RIGHT, pitch: 0.1, frame: named.el },
        { name: 'at the restaurant’s door, the screen standing in it', where: 'at the screen in the doorway', x: XL + 3.0, z: DOORZ, yaw: LEFT, pitch: 0.1 },
        { name: 'beside the door: the channels’ month, on the rack', where: 'at the rack beside the door', x: XL + 2.3, z: -11.8, yaw: LEFT, pitch: 0.12, frame: rack.el }
      ];
      boards.forEach(function (b) {
        stops.push({ name: 'at the menu under the eave: ' + b.said, where: 'at the menu, ' + b.said, x: XL + 2.2, z: b.z, yaw: LEFT, pitch: 0.12, frame: b.it.el });
      });
      stops.push(
        { name: 'on the whitewash: whose table this is', where: 'at the whitewash, at whose table this is', x: XR - 2.3, z: -16.2, yaw: RIGHT, pitch: 0.1, frame: whose.el },
        { name: 'on the whitewash near the sea: how this kitchen cooks', where: 'at how this kitchen cooks', x: XR - 2.2, z: -26.8, yaw: RIGHT, pitch: 0.12, frame: kitchen.el },
        { name: 'on the whitewash at the end: at the table', where: 'at what holds at the table', x: XR - 2.2, z: -29.2, yaw: RIGHT, pitch: 0.12, frame: rules.el },
        { name: 'at the end of the lane, the sea under the sky', where: 'at the end of the lane, looking at the sea', x: 0, z: FAR + 1.3, yaw: 0, pitch: -0.06 }
      );
      stops.sort(function (a, b) { return b.z - a.z; });

      return {
        start: { x: 0, z: 3.2, yaw: 0 },
        bounds: { x: [XL + 0.7, XR - 0.5], z: [FAR + 1.2, NEAR - 0.4] },
        stops: stops
      };
    }
  };
})();

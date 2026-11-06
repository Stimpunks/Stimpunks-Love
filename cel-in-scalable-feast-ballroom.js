/* =============================================================================
   The Scalable Feast Ballroom, walked into on Cel Street. Ryan's brief,
   2026-11-06: build it for Cel Street and Paper Street, and give Cel Street a
   couple of rounds of time and attention.

   IT IS THE BALLROOM'S WORLD AND NOBODY ELSE'S (§150): a big comfortable
   ballroom, both cozy and grand. A hall fifty-odd metres long and fourteen
   high, ivory and gilt, a coffered ceiling with a sky painted in an oval in
   the middle of it, chandeliers hanging down the length of it on long chains,
   tall arched mirrors between the pilasters and herringbone parquet
   underfoot; at each end three canopies, every one its own kind in its own
   cloth and every one a living room, with more living rooms out in the hall
   between them; and the long table down the middle of the floor.

   THE LIGHT IS FROM VERY HIGH UP AND THE ONLY SHADE IS THE SHADE YOU GO INTO.
   The chandeliers hang so far above you that their light lands on everything
   evenly: a broad light from above, the crystal and the gilt catching it, and
   nothing standing in a patch. Under each canopy the hall's light comes in
   THROUGH THE CLOTH, so the inside of every canopy is drawn in the pale of its
   cloth with a little of that colour lit in it. If the hall is ever dimmed to
   make it cozy it has lost the grand; the cozy is under the cloth.

   THE HEIGHT IS THE ROOM. The page shows the size by scrolling down it; here
   you look up. The plaques that go down the page's height hang here at their
   own heights on the wall, the ceiling's plaque near the ceiling and the
   canopies' at the tops of the canopies, and a stop under the painted sky
   looks straight up at it.

   THE PAGE'S OWN WORDS stand where they belong: every canopy's card inside
   its canopy, every living room's card in that living room, the floor's and
   the feast's at the head of the long table, the reasons for tents at the
   near end and the house's ways by the door. Each is lifted off the page,
   never retyped, and shows only while you are near it.

   NOTHING MOVES BY ITSELF BELOW MAX GLITTER. At MAX the crystal glints,
   slowly, each drop in its own time, as the page's glints do; at any setting
   it glints if somebody asks, and the chandeliers can be turned low or out,
   which is the visitor's to choose. The four-poster's curtains draw shut and
   open again on a press. Every colour is one §150 declares, by name. It
   keeps nothing, sends nothing and fetches nothing; its page arrives through
   Cel Street's screen().
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 7, 374761393) ^ Math.imul(j + 29, 668265263) ^ Math.imul(k + 31, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['scalable-feast-ballroom.html'] = {
    name: 'Scalable Feast Ballroom',
    faces: ['"Prata"'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2, BACK = Math.PI;
      var W2 = 10, NEAR = 4, FAR = -48, H = 14;   // the hall: half its width, its two ends, its height
      var MID = (NEAR + FAR) / 2;

      // THE LIGHT: broad and even from very high up, the colour of the
      // crystal, with the parquet's warmth coming back up off the floor; and a
      // light straight down from the ceiling, so every top is lit and nothing
      // stands in a patch.
      kit.scene.background = kit.col('--sfb-hall');
      kit.scene.fog = new T.Fog(kit.col('--sfb-hall'), 70, 180);
      kit.scene.add(new T.HemisphereLight(kit.col('--sfb-crystal'), kit.col('--sfb-oak'), 1.7));
      var high = new T.DirectionalLight(kit.col('--sfb-crystal'), 1.0);
      high.position.set(3, 60, MID + 6);
      high.target.position.set(0, 0, MID);
      kit.scene.add(high); kit.scene.add(high.target);

      // ── THE FLOOR: herringbone parquet, polished, the whole length ────────
      // Laid as the page's floor is: blocks cut to meet in a seam down each
      // column, pale and dark in turn, every block's joint drawn in the dark.
      var parquet = kit.paper(256, 256, function (g, cw, ch) {
        var c = 64, t = 32, sl = c / 4;
        g.fillStyle = kit.ink('--sfb-oak'); g.fillRect(0, 0, cw, ch);
        g.strokeStyle = kit.ink('--sfb-oak-2'); g.lineWidth = 1.5;
        for (var x = 0, col = 0; x < cw; x += c, col++) {
          for (var y = -t * 2, row = 0; y < ch + t; y += t, row++) {
            var xm = x + c / 2;
            var left = [[x, y], [xm, y + sl], [xm, y + sl + t], [x, y + t]];
            var right = [[xm, y + sl], [x + c, y], [x + c, y + t], [xm, y + sl + t]];
            [[left, (row + col) % 2], [right, (row + col + 1) % 2]].forEach(function (pl) {
              g.fillStyle = kit.ink(pl[1] ? '--sfb-oak-3' : '--sfb-oak');
              g.beginPath(); g.moveTo(pl[0][0][0], pl[0][0][1]);
              for (var q = 1; q < 4; q++) g.lineTo(pl[0][q][0], pl[0][q][1]);
              g.closePath(); g.fill(); g.stroke();
            });
          }
        }
      });
      for (var px = -W2; px < W2; px += 2) {
        for (var pz = NEAR; pz > FAR; pz -= 2) kit.sheet(parquet, 2, 2, at(px + 1, 0.004, pz - 1, 0, -Math.PI / 2));
      }
      box(2 * W2 + 0.6, 0.2, NEAR - FAR + 0.6, at(0, -0.1, MID), '--sfb-oak-2', false, false);

      // ── THE WALLS: ivory panelling, a gilt rail, pilasters with gilt
      // capitals, and tall arched mirrors between them ─────────────────────
      box(0.3, H, NEAR - FAR, at(-W2 - 0.15, H / 2, MID), '--sfb-wall', false, false);
      box(0.3, H, NEAR - FAR, at(W2 + 0.15, H / 2, MID), '--sfb-wall', false, false);
      box(2 * W2, H, 0.3, at(0, H / 2, NEAR + 0.15), '--sfb-wall', false, false);
      box(2 * W2, H, 0.3, at(0, H / 2, FAR - 0.15), '--sfb-wall', false, false);
      // The wainscot all round, and its gilt rail.
      [[-W2 + 0.05, LEFT], [W2 - 0.05, RIGHT]].forEach(function (s) {
        box(0.1, 1.1, NEAR - FAR, at(s[0], 0.55, MID), '--sfb-panel', 0.006, false);
        box(0.14, 0.06, NEAR - FAR, at(s[0], 1.12, MID), '--sfb-gilt', false, false);
        box(0.14, 0.12, NEAR - FAR, at(s[0], 0.06, MID), '--sfb-gilt-dark', false, false);
      });
      [NEAR - 0.05, FAR + 0.05].forEach(function (wz) {
        box(2 * W2, 1.1, 0.1, at(0, 0.55, wz), '--sfb-panel', 0.006, false);
        box(2 * W2, 0.06, 0.14, at(0, 1.12, wz), '--sfb-gilt', false, false);
      });
      // A mirror, arched, in a gilt frame, standing against the wall at x
      // facing the hall (ry), centred on z.
      var HALF = new T.CircleGeometry(1, 28, 0, Math.PI);
      function mirror(x, z, ry, w, top) {
        var mw = w, mh = top - 1.6;
        var g = at(x, 0, z, ry);
        kit.flat(new T.PlaneGeometry(mw, mh), M(g, at(0, 1.6 + mh / 2, 0.03)), '--sfb-glass');
        var arch = HALF.clone(); arch.scale(mw / 2, mw / 2 * 0.8, 1);
        kit.flat(arch, M(g, at(0, top, 0.03)), '--sfb-glass');
        // A pale streak down it where it catches the hall.
        box(0.08, mh * 0.8, 0.01, M(g, at(-mw * 0.22, 1.6 + mh * 0.5, 0.05, 0, 0, 0.0)), '--sfb-crystal', false, false);
        box(0.16, mh, 0.12, M(g, at(-mw / 2 - 0.08, 1.6 + mh / 2, 0.04)), '--sfb-gilt', 0.008);
        box(0.16, mh, 0.12, M(g, at(mw / 2 + 0.08, 1.6 + mh / 2, 0.04)), '--sfb-gilt', 0.008);
        box(mw + 0.32, 0.16, 0.12, M(g, at(0, 1.52, 0.04)), '--sfb-gilt', 0.008);
        kit.piece(new T.TorusGeometry(1, 0.06, 6, 28, Math.PI).scale(mw / 2 + 0.08, (mw / 2) * 0.8 + 0.08, 1), M(g, at(0, top, 0.05)), '--sfb-gilt', false);
        kit.piece(new T.SphereGeometry(0.16, 10, 8), M(g, at(0, top + mw / 2 * 0.8 + 0.2, 0.06)), '--sfb-gilt', 0.006);
      }
      // A pilaster: a flat column in the panel's ivory with gilt edges, a gilt
      // capital at the top and a gilt base.
      function pilaster(x, z, ry) {
        var g = at(x, 0, z, ry);
        box(0.8, H - 1.6, 0.22, M(g, at(0, (H - 1.6) / 2, 0.11)), '--sfb-panel', 0.006);
        box(0.06, H - 2.4, 0.04, M(g, at(-0.28, (H - 1.6) / 2, 0.24)), '--sfb-gilt', false, false);
        box(0.06, H - 2.4, 0.04, M(g, at(0.28, (H - 1.6) / 2, 0.24)), '--sfb-gilt', false, false);
        box(1.0, 0.5, 0.34, M(g, at(0, H - 1.85, 0.17)), '--sfb-gilt', 0.008);
        box(1.1, 0.12, 0.38, M(g, at(0, H - 1.55, 0.19)), '--sfb-gilt-dark', false);
        [-0.32, 0.32].forEach(function (vx) { kit.piece(new T.TorusGeometry(0.12, 0.04, 6, 14), M(g, at(vx, H - 1.95, 0.36)), '--sfb-gilt-hi', false); });
        box(1.0, 0.3, 0.32, M(g, at(0, 0.15, 0.16)), '--sfb-gilt-dark', false);
      }
      for (var bz = NEAR - 2; bz > FAR; bz -= 4) {
        pilaster(-W2, bz, LEFT); pilaster(W2, bz, RIGHT);
        if (bz - 2 > FAR + 1) {
          var bay = Math.round((NEAR - 2 - bz) / 4);
          if (bay % 2 === 0 && bz - 2 < -1 && bz - 2 > FAR + 6) {
            mirror(-W2 + 0.05, bz - 2, LEFT, 2.3, 9.2);
            mirror(W2 - 0.05, bz - 2, RIGHT, 2.3, 9.2);
          }
        }
      }
      // The two end walls have the same pilasters, either side of the doors
      // at the near end and evenly across the far end.
      [-8.7, -5, 5, 8.7].forEach(function (px2) { pilaster(px2, NEAR, BACK); });
      [-8.4, -3, 3, 8.4].forEach(function (px2) { pilaster(px2, FAR, 0); });
      // The doors in the near wall, shut behind you, gilt-edged.
      var dg = at(0, 0, NEAR - 0.06, BACK);
      [-0.8, 0.8].forEach(function (dx) {
        box(1.5, 4.2, 0.1, M(dg, at(dx, 2.1, 0)), '--sfb-panel', 0.01);
        box(1.1, 1.6, 0.04, M(dg, at(dx, 2.9, 0.06)), '--sfb-glass', false);
        box(1.1, 1.3, 0.04, M(dg, at(dx, 1.0, 0.06)), '--sfb-ceiling', 0.004);
        cyl(0.04, 0.04, 0.5, M(dg, at(dx * 0.08 + (dx < 0 ? -0.08 : 0.08), 2.0, 0.12)), '--sfb-gilt', false, 6);
      });
      box(3.5, 0.3, 0.2, M(dg, at(0, 4.35, 0.02)), '--sfb-gilt', 0.008);
      box(3.3, 0.6, 0.12, M(dg, at(0, 4.75, 0.02)), '--sfb-panel', 0.006);

      // ── THE CORNICE AND THE CEILING ───────────────────────────────────────
      [[-W2 + 0.3, NEAR - FAR, 0.6, MID, 0], [W2 - 0.3, NEAR - FAR, 0.6, MID, 0]].forEach(function (c) {
        box(0.6, 0.7, c[1], at(c[0], H - 0.75, c[3]), '--sfb-gilt', 0.01, false);
        box(0.8, 0.14, c[1], at(c[0] + (c[0] < 0 ? 0.1 : -0.1), H - 0.33, c[3]), '--sfb-gilt-dark', false, false);
      });
      [NEAR - 0.3, FAR + 0.3].forEach(function (cz) {
        box(2 * W2, 0.7, 0.6, at(0, H - 0.75, cz), '--sfb-gilt', 0.01, false);
      });
      // The egg along the cornice: small gilt eggs in a row, catching the light.
      var EGG = new T.SphereGeometry(0.09, 8, 6); EGG.scale(1, 1.3, 0.6);
      for (var ez = NEAR - 0.4; ez > FAR + 0.4; ez -= 0.36) {
        kit.piece(EGG, at(-W2 + 0.62, H - 0.78, ez), '--sfb-gilt-hi', false);
        kit.piece(EGG, at(W2 - 0.62, H - 0.78, ez), '--sfb-gilt-hi', false);
      }
      // The ceiling itself, and its coffers in a grid of gilt beams, a gilt
      // rosette in every coffer that the painted sky does not cover.
      box(2 * W2, 0.2, NEAR - FAR, at(0, H + 0.1, MID), '--sfb-ceiling', false, false);
      var SKYZ = -22, SKYA = 6.4, SKYB = 13;
      function underSky(x, z) { return (x * x) / ((SKYA + 0.6) * (SKYA + 0.6)) + ((z - SKYZ) * (z - SKYZ)) / ((SKYB + 0.6) * (SKYB + 0.6)) < 1; }
      for (var cx = -W2 + 2; cx < W2; cx += 2) box(0.16, 0.24, NEAR - FAR, at(cx, H - 0.12, MID), '--sfb-gilt', false, false);
      for (var cz = NEAR - 2; cz > FAR; cz -= 2) box(2 * W2, 0.24, 0.16, at(0, H - 0.12, cz), '--sfb-gilt', false, false);
      for (var rx = -W2 + 1; rx < W2; rx += 2) {
        for (var rz = NEAR - 1; rz > FAR; rz -= 2) {
          if (underSky(rx, rz)) continue;
          cyl(0.24, 0.3, 0.08, at(rx, H - 0.04, rz), '--sfb-gilt', false, 10);
          cyl(0.1, 0.12, 0.1, at(rx, H - 0.1, rz), '--sfb-gilt-hi', false, 8);
        }
      }
      // THE PAINTED SKY in the middle of the ceiling: an oval of blue with
      // clouds on it, in a deep gilt frame. A picture, lit by the room; nothing
      // comes through it.
      var DOWN = Math.PI / 2;
      var oval = new T.CircleGeometry(1, 64); oval.scale(SKYA, SKYB, 1);
      box(2 * SKYA + 1.6, 0.3, 2 * SKYB + 1.6, at(0, H - 0.05, SKYZ), '--sfb-ceiling', false, false);
      kit.flat(oval, at(0, H - 0.26, SKYZ, 0, DOWN), '--sfb-sky');
      [[-2.6, -6, 2.4], [-1.6, -4.4, 1.6], [2.4, 3.6, 3.0], [3.4, 2.2, 1.7], [0.4, -10.4, 1.5], [-3.2, 6.8, 1.9], [1.6, 9.8, 1.4], [-0.8, 0.4, 1.2]].forEach(function (c, i) {
        var cl = new T.CircleGeometry(1, 24); cl.scale(c[2], c[2] * 0.42, 1);
        kit.flat(cl, at(c[0], H - 0.28 - i * 0.002, SKYZ + c[1], 0, DOWN), '--sfb-cloud');
        var cl2 = new T.CircleGeometry(1, 20); cl2.scale(c[2] * 0.55, c[2] * 0.32, 1);
        kit.flat(cl2, at(c[0] + c[2] * 0.3, H - 0.29 - i * 0.002, SKYZ + c[1] - c[2] * 0.18, 0, DOWN), '--sfb-cloud');
      });
      var frame = new T.TorusGeometry(1, 0.035, 6, 72); frame.scale(SKYA + 0.25, SKYB + 0.25, 4);
      kit.piece(frame, at(0, H - 0.3, SKYZ, 0, DOWN), '--sfb-gilt', false);
      var frame2 = new T.TorusGeometry(1, 0.012, 4, 72); frame2.scale(SKYA + 0.62, SKYB + 0.62, 4);
      kit.piece(frame2, at(0, H - 0.3, SKYZ, 0, DOWN), '--sfb-gilt-dark', false);

      // ── THE CHANDELIERS, down the length of the hall on long chains ───────
      // Crystal globes, steady, no flame; strings of beads swagged between the
      // arms and drops under each globe; a gilt stem and knops. Their globes
      // and beads are the kit's bulbs, so they can be turned low or out and
      // can glint, slowly, at MAX, as the page's glints do.
      var globes = [], beads = [], washes = [];
      function chandelier(cz, s, cxx) {
        var x0 = cxx || 0, top = H - 0.3, low = 7.6 + (s < 1 ? 1.4 : 0);
        cyl(0.24, 0.32, 0.12, at(x0, H - 0.04, cz), '--sfb-gilt', 0.006, 14);
        // The chain: links alternately turned, gilt, all the way down.
        var LINK = new T.TorusGeometry(0.06 * s, 0.014 * s, 4, 10);
        for (var ly = top, li = 0; ly > low + 2.1 * s; ly -= 0.11 * s, li++) {
          kit.piece(LINK, at(x0, ly, cz, li % 2 ? Math.PI / 2 : 0, 0, Math.PI / 2), li % 2 ? '--sfb-gilt-dark' : '--sfb-gilt', false);
        }
        var cy = low;
        // The stem, its knops, the bowl at the bottom and the drop under it.
        cyl(0.05 * s, 0.05 * s, 2.1 * s, at(x0, cy + 1.05 * s, cz), '--sfb-gilt', 0.004, 8);
        [[1.9, 0.14], [1.4, 0.2], [0.9, 0.16], [0.35, 0.26], [0.1, 0.18]].forEach(function (k) {
          var kn = new T.SphereGeometry(k[1] * s, 14, 10); kn.scale(1, 0.55, 1);
          kit.piece(kn, at(x0, cy + k[0] * s, cz), '--sfb-gilt', 0.004);
        });
        // Two tiers: a ring of arms, each ending in a gilt cup and a globe.
        [[1.35, 0.9, 8], [0.45, 1.45, 12]].forEach(function (tr) {
          var ty = cy + tr[0] * s, r = tr[1] * s, n = tr[2];
          kit.piece(new T.TorusGeometry(r * 0.55, 0.025 * s, 6, 32), at(x0, ty - 0.08 * s, cz, 0, Math.PI / 2), '--sfb-gilt', false);
          for (var i = 0; i < n; i++) {
            var a = i / n * Math.PI * 2, ex = x0 + Math.cos(a) * r, ez2 = cz + Math.sin(a) * r;
            var len = r, mx = x0 + Math.cos(a) * r / 2, mz = cz + Math.sin(a) * r / 2;
            cyl(0.02 * s, 0.02 * s, len, at(mx, ty, mz, -a, 0, Math.PI / 2), '--sfb-gilt', false, 5);
            cyl(0.02 * s, 0.02 * s, 0.22 * s, at(ex, ty + 0.11 * s, ez2), '--sfb-gilt', false, 5);
            cyl(0.07 * s, 0.04 * s, 0.06 * s, at(ex, ty + 0.24 * s, ez2), '--sfb-gilt', false, 10);
            globes.push([ex, ty + 0.36 * s, ez2]);
            // Drops under each globe's cup, and a swag of beads to the next.
            beads.push([ex, ty - 0.08 * s, ez2], [ex, ty - 0.18 * s, ez2], [ex, ty - 0.3 * s, ez2]);
            var b2 = (i + 1) / n * Math.PI * 2, nx = x0 + Math.cos(b2) * r, nz = cz + Math.sin(b2) * r;
            for (var q = 1; q < 6; q++) {
              var u = q / 6, sag = 0.22 * s * (1 - (2 * u - 1) * (2 * u - 1));
              beads.push([ex + (nx - ex) * u, ty + 0.06 * s - sag, ez2 + (nz - ez2) * u]);
            }
          }
        });
        // A crown of drops under the bowl, and one long drop at the very bottom.
        for (var j = 0; j < 10; j++) {
          var a3 = j / 10 * Math.PI * 2;
          for (var dd = 0; dd < 4; dd++) beads.push([x0 + Math.cos(a3) * 0.2 * s, cy - 0.08 * s - dd * 0.12 * s, cz + Math.sin(a3) * 0.2 * s]);
        }
        for (var d2 = 0; d2 < 5; d2++) beads.push([x0, cy - 0.1 * s - d2 * 0.14 * s, cz]);
        var wash = new T.PointLight(kit.col('--sfb-crystal'), 9 * s, 26, 1.1);
        wash.position.set(x0, cy + 0.6 * s, cz);
        kit.scene.add(wash);
        washes.push(wash);
      }
      [-6, -15, -24, -33, -42].forEach(function (cz) { chandelier(cz, 1.0); });
      [-10.5, -19.5, -28.5, -37.5].forEach(function (cz) { chandelier(cz, 0.62, -6.2); chandelier(cz, 0.62, 6.2); });
      // A crystal sconce on every pilaster, at the height of a hand: a gilt
      // plate, a curled arm and a globe, part of the same light as the
      // chandeliers, so the light is up high and also beside you.
      for (var sz2 = NEAR - 6; sz2 > FAR + 1; sz2 -= 4) {
        [[-W2 + 0.24, 1], [W2 - 0.24, -1]].forEach(function (w) {
          var sx = w[0], d = w[1];
          box(0.04, 0.5, 0.26, at(sx, 2.8, sz2), '--sfb-gilt', 0.004);
          cyl(0.018, 0.018, 0.36, at(sx + d * 0.18, 2.84, sz2, 0, 0, Math.PI / 2), '--sfb-gilt', false, 5);
          cyl(0.06, 0.035, 0.06, at(sx + d * 0.36, 2.92, sz2), '--sfb-gilt', false, 10);
          globes.push([sx + d * 0.36, 3.04, sz2]);
          beads.push([sx + d * 0.36, 2.86, sz2], [sx + d * 0.36, 2.76, sz2]);
        });
      }
      var lights = kit.lights({ label: 'The chandeliers', max: true, washes: washes, twinkle: 'Let the crystal glint',
        strings: [kit.bulbs(globes, 0.1, ['--sfb-crystal', '--sfb-glint']), kit.bulbs(beads, 0.032, ['--sfb-glint', '--sfb-crystal'])],
        sets: [{ say: 'Crystal, as on the page', inks: ['--sfb-crystal', '--sfb-glint'] },
               { say: 'Gilt gold', inks: ['--sfb-gilt-hi', '--sfb-crystal'] }] });

      // ── THE FURNITURE, plush and soft ─────────────────────────────────────
      function rug(x, z, w, d, ry, round, inner) {
        var g = at(x, 0, z, ry || 0);
        if (round) {
          cyl(w / 2, w / 2, 0.03, M(g, at(0, 0.016, 0)), '--sfb-rug-2', false, 32);
          cyl(w / 2 - 0.14, w / 2 - 0.14, 0.035, M(g, at(0, 0.02, 0)), inner || '--sfb-rug', false, 32);
        } else {
          box(w, 0.03, d, M(g, at(0, 0.016, 0)), '--sfb-rug-2', false, false);
          box(w - 0.24, 0.035, d - 0.24, M(g, at(0, 0.02, 0)), inner || '--sfb-rug', false, false);
          box(w - 0.5, 0.037, d - 0.5, M(g, at(0, 0.022, 0)), '--sfb-velvet', false, false);
          box(w - 0.7, 0.04, d - 0.7, M(g, at(0, 0.024, 0)), inner || '--sfb-rug', false, false);
        }
      }
      var PILLOW = new T.SphereGeometry(0.2, 12, 8); PILLOW.scale(1, 0.75, 0.42);
      function sofa(x, z, ry, len, ink) {
        var g = at(x, 0, z, ry || 0), v = ink || '--sfb-velvet';
        box(len, 0.32, 0.86, M(g, at(0, 0.3, 0)), v, 0.012);
        box(len - 0.3, 0.14, 0.7, M(g, at(0, 0.52, 0.04)), '--sfb-plush', 0.008);
        box(len, 0.56, 0.24, M(g, at(0, 0.66, -0.34)), v, 0.012);
        box(0.22, 0.32, 0.86, M(g, at(-len / 2 + 0.11, 0.62, 0)), v, 0.01);
        box(0.22, 0.32, 0.86, M(g, at(len / 2 - 0.11, 0.62, 0)), v, 0.01);
        [-1, 1].forEach(function (sd) {
          cyl(0.03, 0.02, 0.14, M(g, at(sd * (len / 2 - 0.12), 0.07, 0.32)), '--sfb-gilt', false, 6);
          cyl(0.03, 0.02, 0.14, M(g, at(sd * (len / 2 - 0.12), 0.07, -0.32)), '--sfb-gilt', false, 6);
          kit.piece(PILLOW, M(g, at(sd * (len / 2 - 0.42), 0.78, -0.16, sd * 0.2)), '--sfb-cream', 0.006);
        });
      }
      function chair(x, z, ry, wing) {
        var g = at(x, 0, z, ry || 0);
        box(0.8, 0.34, 0.8, M(g, at(0, 0.3, 0)), '--sfb-velvet', 0.01);
        box(0.62, 0.14, 0.62, M(g, at(0, 0.52, 0.04)), '--sfb-plush', 0.008);
        box(0.8, wing ? 0.9 : 0.62, 0.2, M(g, at(0, wing ? 0.92 : 0.76, -0.3)), '--sfb-velvet', 0.01);
        box(0.18, 0.3, 0.76, M(g, at(-0.31, 0.62, 0)), '--sfb-velvet', 0.008);
        box(0.18, 0.3, 0.76, M(g, at(0.31, 0.62, 0)), '--sfb-velvet', 0.008);
        if (wing) [-1, 1].forEach(function (sd) { box(0.12, 0.5, 0.36, M(g, at(sd * 0.36, 1.1, -0.2)), '--sfb-velvet', 0.008); });
      }
      function stool(x, z, w, d) {
        box(w, 0.26, d, at(x, 0.22, z), '--sfb-plush', 0.01);
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { cyl(0.025, 0.02, 0.1, at(x + c[0] * (w / 2 - 0.06), 0.05, z + c[1] * (d / 2 - 0.06)), '--sfb-gilt', false, 6); });
      }
      function cushion(x, z, r, ink, h) {
        var c = new T.SphereGeometry(r, 14, 8); c.scale(1, (h || 0.36), 1);
        kit.piece(c, at(x, r * (h || 0.36) * 0.9, z), ink || '--sfb-plush', 0.008);
      }
      function throwOver(x, y, z, w, ry, ink) { box(w, 0.04, 0.5, at(x, y, z, ry || 0, 0.25), ink, 0.006); }
      function lowTable(x, z, w, d) {
        box(w, 0.05, d, at(x, 0.44, z), '--sfb-gilt', 0.006);
        box(w - 0.06, 0.02, d - 0.06, at(x, 0.475, z), '--sfb-glass', false);
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { cyl(0.025, 0.025, 0.42, at(x + c[0] * (w / 2 - 0.05), 0.21, z + c[1] * (d / 2 - 0.05)), '--sfb-gilt', false, 6); });
      }
      function lamp(x, z, y) {
        cyl(0.07, 0.1, 0.32, at(x, y + 0.16, z), '--sfb-gilt', 0.004, 10);
        cyl(0.14, 0.22, 0.26, at(x, y + 0.45, z), '--sfb-cream', 0.006, 14);
      }

      // ── THE CANOPIES, three at each end, each a living room ───────────────
      // Every one is its own kind in its own cloth, and its inside is drawn in
      // the pale of that cloth, with a little of the colour lit in it: the
      // hall's light come in through the cloth.
      var tents = [];
      // Each canopy's cloth, and the pale of it, which is the light under it.
      var CLOTH = {
        rose: ['--sfb-rose', '--sfb-rose-pale'], teal: ['--sfb-teal', '--sfb-teal-pale'],
        plum: ['--sfb-plum', '--sfb-plum-pale'], saffron: ['--sfb-saffron', '--sfb-saffron-pale'],
        sage: ['--sfb-sage', '--sfb-sage-pale'], blue: ['--sfb-blue', '--sfb-blue-pale']
      };
      function glowIn(x, y, z, cloth) {
        var l = new T.PointLight(kit.col(CLOTH[cloth][1]), 2.2, 4.5, 1.6);
        l.position.set(x, y, z); kit.scene.add(l);
      }
      function valance(x, z, w, d, y, cloth, ry) {
        var g = at(x, 0, z, ry || 0);
        box(w, 0.36, d, M(g, at(0, y, 0)), CLOTH[cloth][0], 0.01);
        box(w + 0.04, 0.06, d + 0.04, M(g, at(0, y + 0.2, 0)), '--sfb-gilt', false);
        var SC = new T.CylinderGeometry(0.13, 0.13, 0.04, 12, 1, false, 0, Math.PI);
        [[0, d / 2, w, 0], [0, -d / 2, w, Math.PI], [w / 2, 0, d, -Math.PI / 2], [-w / 2, 0, d, Math.PI / 2]].forEach(function (e) {
          for (var t = -e[2] / 2 + 0.13; t < e[2] / 2; t += 0.26) {
            var lx = e[3] === 0 || e[3] === Math.PI ? t : e[0], lz = e[3] === 0 || e[3] === Math.PI ? e[1] : t;
            kit.piece(SC, M(g, at(lx, y - 0.18, lz, e[3], Math.PI / 2)), CLOTH[cloth][0], false);
          }
        });
      }
      // THE STRIPED CABANA: square, a flat taut roof, striped canvas in rose
      // and cream, its front tied back, a daybed with bolsters inside on a
      // sheepskin, two big floor cushions and a knitted throw.
      function cabana(x, z, ry) {
        var g = at(x, 0, z, ry), w = 3.2, d = 3.0, h = 3.0;
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { cyl(0.05, 0.05, h, M(g, at(c[0] * w / 2, h / 2, c[1] * d / 2)), '--sfb-gilt', 0.004, 8); });
        for (var sx = -w / 2, i = 0; sx < w / 2 - 0.01; sx += w / 12, i++) {
          box(w / 12, 0.08, d, M(g, at(sx + w / 24, h, 0)), i % 2 ? '--sfb-cream' : '--sfb-rose', false);
          box(w / 12, h, 0.04, M(g, at(sx + w / 24, h / 2, -d / 2)), i % 2 ? '--sfb-cream' : '--sfb-rose', false);
        }
        for (var sz = -d / 2, j = 0; sz < d / 2 - 0.01; sz += d / 11, j++) {
          [-1, 1].forEach(function (sd) { box(0.04, h, d / 11, M(g, at(sd * w / 2, h / 2, sz + d / 22)), j % 2 ? '--sfb-cream' : '--sfb-rose', false); });
        }
        box(w - 0.1, h - 0.1, 0.02, M(g, at(0, h / 2, -d / 2 + 0.04)), '--sfb-rose-pale', false, false);
        [-1, 1].forEach(function (sd) { box(0.02, h - 0.1, d - 0.1, M(g, at(sd * (w / 2 - 0.04), h / 2, 0)), '--sfb-rose-pale', false, false); });
        valance(x, z, w + 0.1, d + 0.1, h - 0.15, 'rose', ry);
        // The front, tied back on both sides.
        [-1, 1].forEach(function (sd) {
          var drape = new T.CylinderGeometry(0.08, 0.32, h - 0.4, 10, 1); drape.scale(1, 1, 0.5);
          kit.piece(drape, M(g, at(sd * (w / 2 - 0.2), (h - 0.4) / 2, d / 2 - 0.05)), '--sfb-rose', 0.006);
          kit.piece(new T.TorusGeometry(0.12, 0.02, 4, 12), M(g, at(sd * (w / 2 - 0.2), 1.1, d / 2 - 0.05, 0, Math.PI / 2)), '--sfb-gilt', false);
        });
        rug(x, z, 2.4, 2.0, ry, false, '--sfb-cream');
        var db = M(g, at(0, 0, -0.7));
        box(2.1, 0.4, 0.9, M(db, at(0, 0.24, 0)), '--sfb-velvet', 0.01);
        box(2.0, 0.12, 0.84, M(db, at(0, 0.48, 0)), '--sfb-plush', 0.008);
        [-1, 1].forEach(function (sd) { cyl(0.16, 0.16, 0.8, M(db, at(sd * 0.92, 0.62, 0, 0, Math.PI / 2)), '--sfb-cream', 0.006, 14); });
        throwOver(x + Math.cos(ry) * 0.7, 0.56, z - 0.7 + Math.sin(ry) * 0.7, 0.8, ry, '--sfb-cream');
        cushion(x + Math.sin(ry + 0.6) * 0.9, z + Math.cos(ry + 0.6) * 0.9, 0.42, '--sfb-rose');
        cushion(x + Math.sin(ry - 0.6) * 0.9, z + Math.cos(ry - 0.6) * 0.9, 0.42, '--sfb-teal');
        glowIn(x, 1.8, z, 'rose');
        tents.push({ id: 'cabana', x: x, z: z, ry: ry, w: w, d: d });
      }
      // THE ROUND PAVILION: teal silk on a centre pole, a conical roof under a
      // gilt finial, a scalloped valance round the rim, panels tied back
      // between gilt posts, and a round sofa all the way round the pole.
      function pavilion(x, z) {
        var r = 2.0, h = 3.0;
        cyl(0.07, 0.07, h + 1.6, at(x, (h + 1.6) / 2, z), '--sfb-gilt', 0.004, 10);
        var roof = new T.ConeGeometry(r + 0.15, 1.5, 32, 1, true);
        kit.piece(roof, at(x, h + 0.75, z), '--sfb-teal', 0.012);
        kit.piece(inward(roof, 0.97), at(x, h + 0.72, z), '--sfb-teal-pale', false);
        kit.piece(new T.SphereGeometry(0.16, 12, 10), at(x, h + 1.64, z), '--sfb-gilt', 0.006);
        cyl(0.03, 0.06, 0.4, at(x, h + 1.9, z), '--sfb-gilt', false, 6);
        kit.piece(new T.TorusGeometry(r + 0.15, 0.045, 6, 40), at(x, h, z, 0, Math.PI / 2), '--sfb-gilt', false);
        var SC = new T.CylinderGeometry(0.14, 0.14, 0.04, 12, 1, false, 0, Math.PI);
        for (var k = 0; k < 44; k++) {
          var a = k / 44 * Math.PI * 2;
          kit.piece(SC, at(x + Math.cos(a) * (r + 0.15), h - 0.02, z + Math.sin(a) * (r + 0.15), -a + Math.PI / 2, Math.PI / 2), '--sfb-teal', false);
        }
        for (var p = 0; p < 8; p++) {
          var b = p / 8 * Math.PI * 2 + Math.PI / 8, qx = x + Math.cos(b) * r, qz = z + Math.sin(b) * r;
          cyl(0.04, 0.04, h, at(qx, h / 2, qz), '--sfb-gilt', 0.004, 8);
          if (p !== 1 && p !== 2) {
            var panel = new T.CylinderGeometry(0.06, 0.26, h - 0.3, 8, 1); panel.scale(1, 1, 0.45);
            kit.piece(panel, at(qx, (h - 0.3) / 2, qz, -b), '--sfb-teal', 0.006);
          }
        }
        rug(x, z, 4.0, 4.0, 0, true, '--sfb-teal-pale');
        var ring = new T.TorusGeometry(0.8, 0.34, 10, 40); ring.scale(1, 1, 0.75);
        kit.piece(ring, at(x, 0.32, z, 0, Math.PI / 2), '--sfb-velvet', 0.012);
        cyl(0.5, 0.5, 0.75, at(x, 0.62, z), '--sfb-velvet', 0.01, 24);
        for (var c2 = 0; c2 < 9; c2++) {
          var e = c2 / 9 * Math.PI * 2, inks = ['--sfb-rose', '--sfb-saffron', '--sfb-sage', '--sfb-plum', '--sfb-blue', '--sfb-cream'];
          kit.piece(PILLOW, at(x + Math.cos(e) * 0.66, 0.92, z + Math.sin(e) * 0.66, -e - Math.PI / 2), inks[c2 % inks.length], 0.006);
        }
        glowIn(x, 2.0, z, 'teal');
        tents.push({ id: 'pavilion', x: x, z: z, ry: 0, w: 2 * r, d: 2 * r });
      }
      // THE FOUR-POSTER: four gilt posts, a canopy of plum velvet, curtains
      // on all four sides that draw shut, a deep armchair, a footstool as wide
      // as the chair, a fringed wool rug and a weighted blanket.
      var drawn = [], tied = [];
      function fourPoster(x, z, ry) {
        var g = at(x, 0, z, ry), w = 3.0, d = 3.0, h = 3.4;
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) {
          cyl(0.07, 0.08, h, M(g, at(c[0] * w / 2, h / 2, c[1] * d / 2)), '--sfb-gilt', 0.006, 10);
          kit.piece(new T.SphereGeometry(0.13, 10, 8), M(g, at(c[0] * w / 2, h + 0.5, c[1] * d / 2)), '--sfb-gilt', 0.006);
        });
        box(w + 0.2, 0.08, d + 0.2, M(g, at(0, h + 0.2, 0)), '--sfb-plum', 0.01);
        box(w, 0.02, d, M(g, at(0, h + 0.15, 0)), '--sfb-plum-pale', false, false);
        valance(x, z, w + 0.2, d + 0.2, h, 'plum', ry);
        // Tied back at the posts, which is how they stand at first...
        [[-1, -1, 0], [1, -1, 0], [-1, 1, 0], [1, 1, 0]].forEach(function (c) {
          var tie = new T.CylinderGeometry(0.1, 0.3, h - 0.3, 10, 1); tie.scale(1, 1, 0.55);
          tied.push(kit.facets(tie, M(g, at(c[0] * (w / 2 - 0.12), (h - 0.3) / 2, c[1] * (d / 2 - 0.12))), '--sfb-plum'));
        });
        // ...and drawn shut, all round, when somebody asks: velvet falling in
        // folds from the canopy to the floor, the inside the pale of it.
        [[0, d / 2, 0, w], [0, -d / 2, Math.PI, w], [w / 2, 0, -Math.PI / 2, d], [-w / 2, 0, Math.PI / 2, d]].forEach(function (s) {
          var folds = new T.CylinderGeometry(1, 1, h - 0.25, 24, 1, true, -Math.PI / 2, Math.PI);
          folds.scale(s[3] / 2, 1, 0.08);
          var mesh = kit.facets(folds, M(g, at(s[0], (h - 0.25) / 2, s[1], s[2])), '--sfb-plum');
          kit.hide(mesh, true);
          drawn.push(mesh);
        });
        rug(x, z, 2.6, 2.4, ry, false);
        chair(x + Math.sin(ry) * -0.3, z + Math.cos(ry) * -0.3, ry + 0.4);
        stool(x + Math.sin(ry) * 0.6 + Math.cos(ry) * 0.3, z + Math.cos(ry) * 0.6, 0.9, 0.6);
        throwOver(x + Math.sin(ry) * -0.3 + 0.3, 0.72, z + Math.cos(ry) * -0.3, 0.6, ry + 0.4, '--sfb-blue');
        glowIn(x, 2.0, z, 'plum');
        tents.push({ id: 'four-poster', x: x, z: z, ry: ry, w: w, d: d });
      }
      // THE BELL TENT: saffron canvas on one pole, its walls all the way to
      // the floor, its door rolled up and tied; inside, two wingback chairs
      // facing each other, a beanbag, a braided rag rug in every cloth's
      // colour and a pile of cushions against the canvas.
      // The same surface seen from inside: its faces turned the other way,
      // so a cloth can be one colour outside and the pale of it within.
      function inward(geo, k) {
        var g = geo.index ? geo.toNonIndexed() : geo.clone();
        g.scale(k, k > 0.99 ? 1 : 0.99, k);
        var p = g.attributes.position;
        for (var i = 0; i < p.count; i += 3) {
          var x1 = p.getX(i + 1), y1 = p.getY(i + 1), z1 = p.getZ(i + 1);
          p.setXYZ(i + 1, p.getX(i + 2), p.getY(i + 2), p.getZ(i + 2));
          p.setXYZ(i + 2, x1, y1, z1);
        }
        g.computeVertexNormals();
        return g;
      }
      function bell(x, z, ry) {
        // A short wall all round, and then the canvas pitched up to the pole.
        var pts = [new T.Vector2(2.3, 0), new T.Vector2(2.3, 0.75), new T.Vector2(2.0, 1.3), new T.Vector2(1.45, 2.1),
                   new T.Vector2(0.8, 2.9), new T.Vector2(0.14, 3.6)];
        // The door is rolled up where the tent faces the hall, a gap a fifth
        // of the way round.
        var canvas = new T.LatheGeometry(pts, 40, ry + Math.PI * 0.2, Math.PI * 1.6);
        kit.piece(canvas, at(x, 0, z), '--sfb-saffron', 0.01);
        kit.piece(inward(canvas, 0.97), at(x, 0, z), '--sfb-saffron-pale', false);
        cyl(0.05, 0.05, 3.9, at(x, 1.95, z), '--sfb-gilt', 0.004, 8);
        cyl(0.0, 0.12, 0.3, at(x, 4.0, z), '--sfb-saffron', 0.006, 10);
        // The door, rolled up over the opening and tied.
        cyl(0.13, 0.13, 1.7, at(x + Math.sin(ry) * 1.5, 2.15, z + Math.cos(ry) * 1.5, ry, 0, Math.PI / 2), '--sfb-saffron', 0.008, 10);
        [-1, 1].forEach(function (sd) { cyl(0.012, 0.012, 0.5, at(x + Math.sin(ry) * 1.55 + Math.cos(ry) * sd * 0.5, 2.0, z + Math.cos(ry) * 1.55 - Math.sin(ry) * sd * 0.5), '--sfb-gilt-dark', false, 4); });
        // The rag rug: rings of every cloth's colour.
        ['--sfb-rose', '--sfb-teal', '--sfb-plum', '--sfb-saffron', '--sfb-sage', '--sfb-blue'].forEach(function (ink, k) {
          cyl(1.6 - k * 0.24, 1.6 - k * 0.24, 0.03, at(x, 0.015 + k * 0.002, z), ink, false, 36);
        });
        chair(x - 0.7, z, Math.PI / 2, true);
        chair(x + 0.7, z, -Math.PI / 2, true);
        var bb = new T.SphereGeometry(0.45, 14, 10); bb.scale(1, 0.7, 1);
        kit.piece(bb, at(x + 0.2, 0.3, z - 1.1), '--sfb-sage', 0.01);
        cushion(x - 1.1, z - 0.9, 0.36, '--sfb-cream');
        cushion(x - 1.3, z - 0.5, 0.32, '--sfb-rose', 0.5);
        glowIn(x, 2.0, z, 'saffron');
        tents.push({ id: 'bell', x: x, z: z, ry: ry, w: 4.4, d: 4.4 });
      }
      // THE SAIL: sage linen stretched between two gilt poles and a hook in
      // the wall, low over a corner, open on two sides; a chaise longue under
      // it, a velvet ottoman, a long-pile rug and a quilt.
      function sail(x, z) {
        var hook = new T.Vector3(x + 1.6, 4.0, FAR + 0.05), p1 = new T.Vector3(x - 2.2, 3.0, z + 1.2), p2 = new T.Vector3(x + 2.2, 2.6, z + 1.8);
        cyl(0.05, 0.05, p1.y, at(p1.x, p1.y / 2, p1.z), '--sfb-gilt', 0.004, 8);
        cyl(0.05, 0.05, p2.y, at(p2.x, p2.y / 2, p2.z), '--sfb-gilt', 0.004, 8);
        kit.piece(new T.SphereGeometry(0.1, 8, 6), at(p1.x, p1.y + 0.1, p1.z), '--sfb-gilt', false);
        kit.piece(new T.SphereGeometry(0.1, 8, 6), at(p2.x, p2.y + 0.1, p2.z), '--sfb-gilt', false);
        var tri = new T.BufferGeometry();
        var mid = new T.Vector3().addVectors(p1, p2).multiplyScalar(0.5).add(hook).multiplyScalar(0.5); mid.y -= 0.35;
        var v = [hook, p1, mid, p1, p2, mid, p2, hook, mid];
        var pos = new Float32Array(27);
        v.forEach(function (q, i) { pos[i * 3] = q.x; pos[i * 3 + 1] = q.y; pos[i * 3 + 2] = q.z; });
        tri.setAttribute('position', new T.BufferAttribute(pos, 3));
        tri.computeVertexNormals();
        kit.piece(tri, new T.Matrix4(), '--sfb-sage', false);
        var under = tri.clone(); var up = under.attributes.position;
        for (var u = 0; u < up.count; u++) up.setY(u, up.getY(u) - 0.02);
        var idx = []; for (var w = 0; w < 9; w += 3) idx.push(w, w + 2, w + 1);
        under = under.toNonIndexed(); under.setIndex(idx); under.computeVertexNormals();
        kit.piece(under, new T.Matrix4(), '--sfb-sage-pale', false);
        cyl(0.012, 0.012, hook.distanceTo(p1), at((hook.x + p1.x) / 2, (hook.y + p1.y) / 2 + 0.01, (hook.z + p1.z) / 2), '--sfb-gilt-dark', false, 4);
        rug(x, z - 0.4, 3.4, 2.4, 0, false, '--sfb-sage-pale');
        // The chaise: a long seat that rises at one end.
        box(1.9, 0.34, 0.75, at(x, 0.3, z - 0.5), '--sfb-velvet', 0.01);
        box(0.5, 0.5, 0.75, at(x - 0.75, 0.6, z - 0.5, 0, 0, -0.5), '--sfb-velvet', 0.01);
        box(1.8, 0.12, 0.66, at(x + 0.1, 0.52, z - 0.5), '--sfb-plush', 0.008);
        throwOver(x + 0.3, 0.6, z - 0.5, 1.2, 0, '--sfb-cream');
        cyl(0.42, 0.42, 0.42, at(x + 1.4, 0.21, z + 0.5), '--sfb-plum', 0.01, 20);
        glowIn(x, 1.7, z - 0.3, 'sage');
        tents.push({ id: 'sail', x: x, z: z - 0.4, ry: 0, w: 4.4, d: 3.0 });
      }
      // THE CROWN: cornflower hangings falling from a gilt crown high on the
      // far wall, swagged back on both sides; a loveseat with deep arms, a
      // heap of floor cushions in front of it, the softest rug in the room.
      function crown(x) {
        var wz = FAR + 0.06, cy = 6.2;
        var CROWN = new T.CylinderGeometry(0.9, 0.7, 0.6, 20, 1, true, -Math.PI / 2, Math.PI);
        kit.piece(CROWN, at(x, cy, wz + 0.02, Math.PI), '--sfb-gilt', 0.01);
        for (var k = 0; k < 7; k++) {
          var a = -Math.PI / 2 + k / 6 * Math.PI;
          cyl(0.03, 0.06, 0.3, at(x + Math.sin(a) * 0.9, cy + 0.42, wz + Math.cos(a) * 0.9), '--sfb-gilt', false, 6);
          kit.piece(new T.SphereGeometry(0.06, 8, 6), at(x + Math.sin(a) * 0.9, cy + 0.6, wz + Math.cos(a) * 0.9), '--sfb-gilt-hi', false);
        }
        // The hangings: from the crown out and down to the floor on both sides,
        // swagged back where a gilt tie holds them.
        box(2.6, cy - 0.3, 0.04, at(x, (cy - 0.3) / 2, wz + 0.04), '--sfb-blue-pale', false, false);
        [-1, 1].forEach(function (sd) {
          var fall = new T.CylinderGeometry(0.25, 0.5, cy - 0.2, 12, 1); fall.scale(1, 1, 0.5);
          kit.piece(fall, at(x + sd * 1.45, (cy - 0.2) / 2, wz + 0.45, 0, sd * 0.12), '--sfb-blue', 0.01);
          var swag = new T.CylinderGeometry(0.2, 0.2, 1.6, 10, 1); swag.scale(1, 1, 0.5);
          kit.piece(swag, at(x + sd * 0.95, cy - 0.5, wz + 0.4, 0, 0, sd * 1.1), '--sfb-blue', 0.008);
          kit.piece(new T.TorusGeometry(0.16, 0.03, 4, 12), at(x + sd * 1.52, 1.5, wz + 0.6, 0, Math.PI / 2), '--sfb-gilt', false);
        });
        rug(x, wz + 1.8, 3.0, 2.4, 0, false, '--sfb-blue-pale');
        sofa(x, wz + 1.1, 0, 1.7, '--sfb-velvet');
        [-0.6, 0, 0.6].forEach(function (cx2, k) { cushion(x + cx2, wz + 2.3 + (k % 2) * 0.2, 0.34, ['--sfb-cream', '--sfb-plush', '--sfb-blue'][k], 0.45); });
        glowIn(x, 2.0, wz + 1.2, 'blue');
        tents.push({ id: 'crown', x: x, z: wz + 1.4, ry: 0, w: 3.2, d: 2.8 });
      }

      var NZ = -1.4, FZ = FAR + 3.6;
      cabana(-6.6, NZ, Math.PI);
      pavilion(-1.6, NZ - 0.4);
      fourPoster(6.6, NZ, Math.PI);
      bell(-6.4, FZ, 0);
      sail(-0.6, FZ - 0.3);
      crown(6.4);

      // ── THE LIVING ROOMS out in the hall between the canopies ─────────────
      // Round the low table (a sofa, two armchairs, a low table with an unlit
      // lamp, a big rug), the tête-à-tête (an S-shaped sofa, two sitting side
      // by side facing opposite ways), the long settee under a mirror, and the
      // borne (a round settee with a back in the middle).
      var rooms = [
        { id: 'conversation', x: -4.2, z: NZ - 4.2 },
        { id: 'tete', x: 2.6, z: NZ - 4.0 },
        { id: 'settee', x: -3.6, z: FZ + 3.8 },
        { id: 'borne', x: 3.0, z: FZ + 3.6 }
      ];
      rug(rooms[0].x, rooms[0].z, 3.4, 2.8, 0, false);
      sofa(rooms[0].x, rooms[0].z - 0.9, 0, 2.2);
      chair(rooms[0].x - 1.3, rooms[0].z + 0.6, Math.PI * 0.75);
      chair(rooms[0].x + 1.3, rooms[0].z + 0.6, -Math.PI * 0.75);
      lowTable(rooms[0].x, rooms[0].z + 0.1, 1.1, 0.6);
      lamp(rooms[0].x + 0.35, rooms[0].z + 0.1, 0.48);
      // The tête-à-tête: two seats joined in an S, facing opposite ways.
      rug(rooms[1].x, rooms[1].z, 2.8, 2.0, 0.3, false);
      (function (r) {
        var g = at(r.x, 0, r.z, 0.3);
        box(1.6, 0.34, 0.6, M(g, at(0, 0.3, 0)), '--sfb-velvet', 0.01);
        box(0.7, 0.12, 0.5, M(g, at(-0.42, 0.52, 0.04)), '--sfb-plush', 0.008);
        box(0.7, 0.12, 0.5, M(g, at(0.42, 0.52, -0.04)), '--sfb-plush', 0.008);
        var S = new T.TorusGeometry(0.3, 0.07, 8, 16, Math.PI);
        kit.piece(S, M(g, at(-0.3, 0.72, 0)), '--sfb-velvet', 0.006);
        kit.piece(S, M(g, at(0.3, 0.72, 0, Math.PI)), '--sfb-velvet', 0.006);
      })(rooms[1]);
      // The long settee, against the left wall under a mirror, footstools in
      // a row in front of it, a runner rug the length of it.
      rug(-W2 + 1.2, rooms[2].z, 1.6, 4.4, 0, false);
      sofa(-W2 + 0.75, rooms[2].z, Math.PI / 2, 3.6);
      [-1.2, 0, 1.2].forEach(function (o) { stool(-W2 + 1.75, rooms[2].z + o, 0.6, 0.6); });
      // The borne: a round settee with a back in the middle, facing out.
      rug(rooms[3].x, rooms[3].z, 3.2, 3.2, 0, true);
      cyl(1.1, 1.15, 0.42, at(rooms[3].x, 0.24, rooms[3].z), '--sfb-velvet', 0.012, 28);
      cyl(1.0, 1.0, 0.12, at(rooms[3].x, 0.5, rooms[3].z), '--sfb-plush', 0.008, 28);
      cyl(0.18, 0.55, 1.1, at(rooms[3].x, 0.95, rooms[3].z), '--sfb-velvet', 0.01, 20);
      cyl(0.0, 0.2, 0.3, at(rooms[3].x, 1.65, rooms[3].z), '--sfb-gilt', 0.006, 12);

      // ── THE LONG TABLE down the middle of the floor ───────────────────────
      // As long as the people at it: a white cloth to the floor, velvet chairs
      // drawn up both sides, gilt plates, crystal glasses and covered dishes.
      // No candles: the light is the chandeliers'. The food is never named.
      var TZ0 = -10, TZ1 = -36, TW = 1.6;
      box(TW + 0.1, 0.76, TZ0 - TZ1, at(0, 0.38, (TZ0 + TZ1) / 2), '--sfb-cream', 0.012);
      box(TW + 0.14, 0.04, TZ0 - TZ1 + 0.04, at(0, 0.78, (TZ0 + TZ1) / 2), '--sfb-cream', false);
      for (var tz = TZ0 - 0.6; tz > TZ1 + 0.3; tz -= 1.0) {
        [-1, 1].forEach(function (sd) {
          var g = at(sd * (TW / 2 + 0.42), 0, tz, sd < 0 ? -Math.PI / 2 : Math.PI / 2);
          box(0.48, 0.08, 0.48, M(g, at(0, 0.46, 0)), '--sfb-velvet', 0.006);
          box(0.46, 0.66, 0.06, M(g, at(0, 0.82, -0.22)), '--sfb-velvet', 0.006);
          box(0.5, 0.05, 0.08, M(g, at(0, 1.16, -0.22)), '--sfb-gilt', false);
          [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].forEach(function (l) { cyl(0.018, 0.018, 0.44, M(g, at(l[0], 0.22, l[1])), '--sfb-gilt', false, 5); });
          cyl(0.14, 0.12, 0.02, at(sd * 0.5, 0.8, tz), '--sfb-gilt', false, 18);
          cyl(0.11, 0.1, 0.01, at(sd * 0.5, 0.815, tz), '--sfb-cream', false, 18);
          cyl(0.03, 0.025, 0.16, at(sd * 0.5 + (sd < 0 ? 0.18 : -0.18), 0.88, tz - 0.16), '--sfb-glass', 0.003, 8);
        });
        if (Math.round(tz) % 3 === 0) {
          var dome = new T.SphereGeometry(0.18, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2);
          cyl(0.24, 0.22, 0.02, at(0, 0.8, tz + 0.5), '--sfb-gilt', false, 18);
          kit.piece(dome, at(0, 0.81, tz + 0.5), '--sfb-gilt', 0.004);
          kit.piece(new T.SphereGeometry(0.03, 6, 5), at(0, 1.0, tz + 0.5), '--sfb-gilt-hi', false);
        } else {
          cyl(0.04, 0.05, 0.06, at(0, 0.83, tz + 0.5), '--sfb-gilt', false, 10);
          cyl(0.17, 0.09, 0.1, at(0, 0.91, tz + 0.5), '--sfb-glass', 0.003, 16);
          [0, 1, 2, 3].forEach(function (k) { kit.piece(new T.SphereGeometry(0.05, 8, 6), at(-0.07 + k * 0.045, 0.97 + (k % 2) * 0.03, tz + 0.5 + (k % 2 ? 0.03 : -0.03)), ['--sfb-rose', '--sfb-saffron', '--sfb-sage', '--sfb-plum'][k], false); });
        }
      }

      // ── THE PAGE, AND ITS OWN WORDS WHERE THEY BELONG ──────────────────────
      // The page itself on the left wall just inside the doors, in a gilt frame.
      var pw = 2.8, ph = pw * 800 / 1180, py = 1.5 + ph / 2;
      box(0.06, ph + 0.2, pw + 0.2, at(-W2 + 0.04, py, 1.6), '--sfb-gilt', 0.008);
      var page = kit.screen(1180, 800, pw, at(-W2 + 0.09, py, 1.6, LEFT), 'The Scalable Feast Ballroom’s own page, on the wall inside the doors');
      function onWall(side, z, y) { return side < 0 ? at(-W2 + 0.12, y, z, LEFT) : at(W2 - 0.12, y, z, RIGHT); }
      // The near wall, either side of the doors, facing down the hall: behind
      // you as you come in, and in front of you when you turn round.
      function onNear(x, y) { return at(x, y, NEAR - 0.14, BACK); }
      var NEARZ = [-W2, W2, NZ - 7, NEAR];
      // A gilt frame on the wall behind each of the four, between the
      // pilasters, the page's words on the hall's ivory inside it.
      [-6.8, -3.2, 3.2, 6.8].forEach(function (fx) {
        box(2.7, 2.4, 0.06, at(fx, 2.55, NEAR - 0.08), '--sfb-gilt', 0.008, false);
        box(2.56, 2.26, 0.04, at(fx, 2.55, NEAR - 0.1), '--sfb-panel', false, false);
      });
      var lede = kit.lift(page, '.sfb-lede', { w: 780, ww: 2.4, m: onNear(-3.2, 2.1), zone: NEARZ });
      var big = kit.lift(page, '.sfb-part', { n: 0, w: 780, h: 560, ww: 2.4, m: onNear(-6.8, 1.4), zone: NEARZ });
      var ways = kit.lift(page, '.sfb-part', { n: 2, w: 780, h: 680, ww: 2.4, m: onNear(3.2, 1.4), zone: NEARZ });
      var whose = kit.lift(page, '.sfb-part', { n: 3, w: 780, h: 680, ww: 2.4, m: onNear(6.8, 1.4), zone: NEARZ });
      // Why there are tents, on an easel between the near canopies.
      var why = kit.lift(page, '.sfb-part', { n: 1, w: 780, h: 720, ww: 2.0, m: at(1.8, 0.7, NZ - 1.8, 0), zone: NEARZ });
      box(0.05, 0.7, 0.05, at(1.0, 0.35, NZ - 1.85), '--sfb-gilt', false); box(0.05, 0.7, 0.05, at(2.6, 0.35, NZ - 1.85), '--sfb-gilt', false);
      // Every canopy's card inside it, and every living room's in that room.
      var cards = tents.map(function (t, i) {
        var zone = [t.x - t.w / 2 - 1.6, t.x + t.w / 2 + 1.6, t.z - t.d / 2 - 1.8, t.z + t.d / 2 + 2.6];
        var face = t.z > MID ? Math.PI : 0;
        var cxp = t.x, czp = t.z + (face ? -t.d / 2 + 0.4 : t.d / 2 - 0.2);
        if (t.id === 'crown') czp = t.z + 1.2;
        if (t.id === 'pavilion') czp = t.z - 0.05;
        var it = kit.lift(page, '.sfb-tent', { n: i, w: 560, h: 640, ww: 1.5, m: at(cxp, 1.2, czp, face), zone: zone });
        return { t: t, it: it, face: face };
      });
      var roomCards = rooms.map(function (r, i) {
        var face = r.z > MID ? Math.PI : 0;
        var it = kit.lift(page, '.sfb-room', { n: i, w: 520, ww: 1.3, m: at(r.x + (r.id === 'settee' ? 2.6 : 0), 0.9, r.z + (face ? -1.6 : 1.6), face), zone: [r.x - 3.5, r.x + 6, r.z - 4.5, r.z + 4.5] });
        box(0.04, 0.9, 0.04, at(r.x + (r.id === 'settee' ? 2.6 : 0), 0.45, r.z + (face ? -1.62 : 1.62)), '--sfb-gilt', false);
        return { r: r, it: it, face: face };
      });
      var middle = kit.lift(page, '.sfb-middle', { w: 780, h: 700, ww: 2.2, m: at(0, 0.9, TZ0 + 1.4, BACK), zone: [-W2, W2, TZ0 - 2, TZ0 + 5] });
      // The height's plaques on the right-hand wall, each at its own height:
      // the ceiling's near the ceiling, the canopies' at the tops of the
      // canopies. Look up at them from across the hall.
      var LEVELS = [11.6, 9.9, 8.2, 6.4, 3.3];
      var plaques = LEVELS.map(function (y, i) {
        // A board in a gilt frame for each, the words on the hall's own ivory.
        box(0.06, 2.0, 4.9, at(W2 - 0.05, y + 0.8, -21), '--sfb-gilt', 0.01, false);
        box(0.04, 1.8, 4.7, at(W2 - 0.09, y + 0.8, -21), '--sfb-gilt-dark', false, false);
        return kit.lift(page, '.sfb-level__said', { n: i, w: 380, ww: 4.4, m: onWall(1, -21, y), zone: [-6, W2, -30, -12] });
      });

      // ── THE ROOM'S OWN SWITCH: the four-poster's curtains ─────────────────
      var shut = false;
      var four = tents.filter(function (t) { return t.id === 'four-poster'; })[0];
      var curtains = kit.press({
        say: function () { return shut ? 'Open the four-poster’s curtains' : 'Draw the four-poster’s curtains'; },
        press: function () {
          shut = !shut;
          drawn.forEach(function (m) { kit.hide(m, !shut); });
          tied.forEach(function (m) { kit.hide(m, shut); });
          return shut ? 'The four-poster’s curtains are drawn: plum velvet all round, and the light inside very soft.' : 'The curtains are tied back at the posts again.';
        },
        at: [kit.touch(3.2, 3.4, 3.2, at(four.x, 1.7, four.z))]
      });

      // ── WHERE TO STAND ─────────────────────────────────────────────────────
      var stops = [
        { name: 'just inside the doors, the hall going away from you under the chandeliers', where: 'inside the doors', x: 2.6, z: 2.6, yaw: 0, pitch: 0.12 },
        { name: 'at the room’s own page, on the wall inside the doors', where: 'at the room’s own page', x: -W2 + 3.0, z: 1.6, yaw: LEFT, pitch: 0.08, page: kit.page, frame: page },
        { name: 'at the lede, on the wall beside the doors', where: 'at the lede', x: -3.2, z: NEAR - 2.9, yaw: BACK, pitch: 0.04, frame: lede.el },
        { name: 'at how big it is, on the wall beside the doors', where: 'at how big it is', x: -6.8, z: NEAR - 2.9, yaw: BACK, pitch: 0.06, frame: big.el },
        { name: 'at the ways of the house, on the wall beside the doors', where: 'at the ways of the house', x: 3.2, z: NEAR - 3.0, yaw: BACK, pitch: 0.06, frame: ways.el },
        { name: 'at whose this is, on the wall beside the doors', where: 'at whose this is', x: 6.8, z: NEAR - 3.0, yaw: BACK, pitch: 0.06, frame: whose.el },
        { name: 'at why there are tents in a ballroom, on an easel between the canopies', where: 'at why there are tents', x: 1.8, z: NZ - 4.4, yaw: BACK, pitch: -0.05, frame: why.el }
      ];
      var SAID = { cabana: 'the Striped Cabana', pavilion: 'the Round Pavilion', 'four-poster': 'the Four-Poster', bell: 'the Bell Tent', sail: 'the Sail', crown: 'the Crown' };
      cards.forEach(function (c) {
        var t = c.t, back = c.face ? -1 : 1;
        var sx = t.x, sz = t.z + back * (t.d / 2 + 1.6);
        if (t.id === 'pavilion') sz = t.z - 2.6;
        stops.push({ name: 'under ' + SAID[t.id] + ', at its card', where: 'under ' + SAID[t.id], x: sx, z: sz, yaw: c.face ? BACK : 0, pitch: -0.02, frame: c.it.el, acts: t.id === 'four-poster' ? [curtains] : undefined });
      });
      var RNAME = { conversation: 'round the low table', tete: 'at the tête-à-tête', settee: 'at the long settee', borne: 'at the borne' };
      roomCards.forEach(function (c) {
        var r = c.r, cx2 = r.x + (r.id === 'settee' ? 2.6 : 0);
        stops.push({ name: RNAME[r.id] + ', out in the hall between the canopies', where: RNAME[r.id], x: cx2, z: r.z + (c.face ? -3.6 : 3.6), yaw: c.face ? BACK : 0, pitch: -0.1, frame: c.it.el });
      });
      stops.push(
        { name: 'at the head of the long table, the floor and the feast', where: 'at the head of the long table', x: 0, z: TZ0 + 3.4, yaw: 0, pitch: -0.04, frame: middle.el },
        { name: 'beside the long table, looking down the length of it', where: 'beside the long table', x: 2.2, z: -20, yaw: 0, pitch: 0.02 },
        { name: 'under the painted sky, looking up', where: 'under the painted sky', x: 0.5, z: SKYZ + 9, yaw: 0, pitch: 0.75 },
        { name: 'across the hall from the height’s plaques, looking up the wall', where: 'looking up the wall', x: -1.6, z: -21, yaw: RIGHT, pitch: 0.6, frame: plaques[0].el },
        { name: 'at the far end, looking back down the hall', where: 'at the far end', x: 1.6, z: FZ + 7.4, yaw: BACK, pitch: 0.14 }
      );
      stops.sort(function (a, b) { return b.z - a.z; });

      return {
        start: { x: 2.6, z: 2.6, yaw: 0 },
        bounds: { x: [-W2 + 0.6, W2 - 0.6], z: [FAR + 0.8, NEAR - 0.6] },
        stops: stops
      };
    }
  };
})();

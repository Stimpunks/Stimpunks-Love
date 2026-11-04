/* =============================================================================
   Widdershins, walked into on Cel Street. Ryan's ask, 2026-11-02: the room's
   own world on Cel Street, like every other door in the row.

   A CROOKED CITY WITH THE MORNING HALFWAY ACROSS IT (§135). You come out on a
   cobbled quay on the night side of a river too thick to drown in, and across
   it the city stands on its far bank: crooked houses built on top of each
   other, a thin tower far off, a clacks tower with its shutters, and a brass
   bridge over the water. The morning is slow on the Disc, so it is caught
   halfway: everything past the morning's edge, to the right, is lit, plaster
   pale and tiles red, and everything this side of it is still night. The sky
   behind is split the same way, with the edge between, and a compass hangs in
   the night half with its widdershins arm pointing into the morning.

   EVERY WORD IS ON THE NIGHT SIDE. The page's words are lifted onto boards
   along the back of the quay, with your back to the river, and you walk them
   right to left: widdershins. None of them stands in the morning.

   OOOK IS THE ONE TO WATCH, through L-space: the Disc seen from out in the
   dark. This is on the ground, in a city, and the scene never draws the Disc,
   a turtle or an elephant: Great A'Tuin is only on the page's last board, in
   Star Stuff's own drawing. NOBODY IS IN THE CITY, the windows are dark because
   nobody has lit a lamp, and there is no cover, map, crest or character of
   anybody's: the houses are crooked roofs anybody might draw. NOTHING MOVES:
   the morning stays halfway. Every colour is one §135 declares, by name. It
   keeps nothing, sends nothing and fetches nothing; the page arrives through
   Cel Street's screen(), and tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['widdershins.html'] = {
    name: 'Widdershins',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var FLAT = -Math.PI / 2;
      var FAR = -17;          // the far bank, where the city stands
      var EDGE = 3.5;         // the morning's edge, where it crosses the far bank
      var SLANT = 0.32;       // and how far it leans across the city with height

      function lit(x, y) { return x > EDGE - SLANT * y; }

      // THE NIGHT, AND NO LAMP. One cool fill from the night sky and nothing
      // else: a light that reached across the edge would warm the night side
      // of the city, so the morning is carried by the lit houses' own colours.
      kit.scene.background = kit.col('--wds-night');
      kit.scene.add(new T.HemisphereLight(kit.col('--wds-ink'), kit.col('--wds-sky-night'), 2.0));
      // And the night sky itself, from up and over to the left, cool and
      // faint: enough to give every roof a side the sky catches and a side it
      // does not, never enough to warm anything.
      var nightSky = new T.DirectionalLight(kit.col('--wds-ink-3'), 0.55);
      nightSky.position.set(-30, 40, 12);
      kit.scene.add(nightSky);

      // THE SKY behind the city, split at the morning's edge: night on the
      // left, the morning sky on the right, and the edge itself between.
      var SKYZ = -46, SKYW = 220, SKYH = 120, LEAN = SLANT;
      function quad(pts, z, ink) {
        var s = new T.Shape();
        s.moveTo(pts[0][0], pts[0][1]);
        for (var i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
        kit.flat(new T.ShapeGeometry(s), at(0, 0, z), ink);
      }
      // Where the edge on the far bank falls on the sky, seen from the quay.
      var ex = 2.6;
      quad([[-SKYW / 2, 0], [ex, 0], [ex - LEAN * SKYH, SKYH], [-SKYW / 2, SKYH]], SKYZ, '--wds-sky-night');
      quad([[ex, 0], [SKYW / 2, 0], [SKYW / 2, SKYH], [ex - LEAN * SKYH, SKYH]], SKYZ, '--wds-sky-day');
      quad([[ex - 0.5, 0], [ex + 0.5, 0], [ex + 0.5 - LEAN * SKYH, SKYH], [ex - 0.5 - LEAN * SKYH, SKYH]], SKYZ + 0.05, '--wds-edge');

      // THE COMPASS in the night sky, on a sheet of paper drawn in the room's
      // own inks: the Disc's four directions, widdershins pointing right.
      var compass = kit.paper(720, 360, function (g, w, h) {
        var ox = w / 2 - 40, oy = h / 2, r = 92;
        g.clearRect(0, 0, w, h);
        g.strokeStyle = kit.ink('--wds-ink-3'); g.lineWidth = 4;
        g.beginPath(); g.arc(ox, oy, r - 24, 0, 2 * Math.PI); g.stroke();
        g.beginPath(); g.moveTo(ox, oy - r + 8); g.lineTo(ox, oy + r - 8); g.moveTo(ox - r + 8, oy); g.lineTo(ox, oy); g.stroke();
        g.strokeStyle = kit.ink('--wds-dawn'); g.lineWidth = 7;
        g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox + r + 10, oy); g.stroke();
        g.fillStyle = kit.ink('--wds-dawn');
        g.beginPath(); g.moveTo(ox + r + 2, oy - 13); g.lineTo(ox + r + 26, oy); g.lineTo(ox + r + 2, oy + 13); g.closePath(); g.fill();
        g.font = '700 26px Grenze, Georgia, serif'; g.textAlign = 'center';
        g.fillStyle = kit.ink('--wds-ink-2');
        g.fillText('HUBWARD', ox, oy - r - 10); g.fillText('RIMWARD', ox, oy + r + 30);
        g.textAlign = 'right'; g.fillText('TURNWISE', ox - r - 8, oy + 9);
        g.textAlign = 'left'; g.fillStyle = kit.ink('--wds-dawn'); g.fillText('WIDDERSHINS', ox + r + 32, oy + 9);
      });
      // Unlit and see-through, so it is the sky's own night round it.
      var cm = new T.Mesh(new T.PlaneGeometry(36, 18), new T.MeshBasicMaterial({ map: compass, transparent: true, depthWrite: false }));
      cm.matrixAutoUpdate = false;
      cm.matrix.copy(at(-24, 35, SKYZ + 0.4));
      cm.matrixWorldNeedsUpdate = true;
      kit.scene.add(cm);

      // THE RIVER, thick enough to stand on, with its crust, and the quay's
      // wall on this side of it. The morning lies on the water too, past an
      // edge that runs from the far bank towards you on a slant, so it is
      // creeping across the river and has not reached the quay: the water
      // past it is the river in the morning, and this side of it the river at
      // night.
      function onWater(z) { return EDGE + (FAR - z) * -0.62; }
      function lies(pts, y, ink) {
        var sh = new T.Shape(); sh.moveTo(pts[0][0], -pts[0][1]);
        for (var i = 1; i < pts.length; i++) sh.lineTo(pts[i][0], -pts[i][1]);
        kit.flat(new T.ShapeGeometry(sh), at(0, y, 0, 0, FLAT), ink);
      }
      box(140, 0.2, 15.75, at(0, -0.62, -11.125), '--wds-ankh', false, false);
      lies([[onWater(-19), -19], [70, -19], [70, -3.3], [onWater(-3.3), -3.3]], -0.515, '--wds-ankh-day');
      // The far bank under the city, lit past the edge and night this side of it.
      box(70, 0.4, 16, at(EDGE - 35, -0.5, FAR - 7), '--wds-roof-night', false, false);
      box(70, 0.4, 16, at(EDGE + 35, -0.5, FAR - 7), '--wds-wall-day', false, false);
      function hash(n) { var v = Math.sin(n * 12.9898) * 43758.5453; return v - Math.floor(v); }
      for (var c = 0; c < 70; c++) {
        var cx = hash(c * 2.3 + 1) * 56 - 28, cz = -4 - hash(c * 5.1 + 2) * 12.4;
        var g = new T.SphereGeometry(0.5 + hash(c * 7.7) * 0.6, 10, 6); g.scale(1.6, 0.12, 1);
        kit.piece(g, at(cx, -0.5, cz, hash(c) * 3), cx > onWater(cz) ? '--wds-ankh-crust-day' : '--wds-ankh-crust', false, false);
      }
      box(140, 0.9, 0.5, at(0, -0.15, -3.25), '--wds-wall-night', 0.02, false);
      box(140, 0.12, 0.62, at(0, 0.32, -3.25), '--wds-line', false, false);

      // THE QUAY you stand on: cobbles, all of them a little different, in the
      // night's own colours.
      box(140, 0.3, 9, at(0, -0.17, 1.4), '--wds-roof-night', false, false);
      for (var q = 0; q < 160; q++) {
        var qx = (q % 20) * 1.1 - 10.5 + (Math.floor(q / 20) % 2) * 0.55, qz = -2.6 + Math.floor(q / 20) * 0.66;
        var cb = new T.SphereGeometry(0.26, 8, 5); cb.scale(1.6, 0.35, 1);
        kit.piece(cb, at(qx, -0.02, qz, hash(q * 3.3)), '--wds-wall-night', false, false);
      }

      // THE CITY on the far bank: two rows of crooked houses, each a box with a
      // roof, leaning a little, taller ones behind. A house is lit if it stands
      // past the morning's edge. Each upper storey juts out over the one under
      // it on its beam, as a city that built up rather than out does; every
      // house has its door, some their shutters, chimneys with their pots, and
      // a gable window in the roof. A house is drawn in a frame G, so the row
      // along the back of the quay is the same build turned to face the river.
      function house(G, x, z, w, d, h, lean, roof, day) {
        var wall = day ? '--wds-wall-day' : '--wds-wall-night', top = day ? '--wds-roof-day' : '--wds-roof-night';
        var beam = day ? '--wds-roof-day' : '--wds-roof-night';
        var off = function (y) { return -Math.sin(lean) * y; };
        // The storeys, each a little wider than the one under it.
        var floors = Math.max(2, Math.round(h / 2.4)), fh = h / floors;
        for (var f = 0; f < floors; f++) {
          var jut = f * 0.12, y0 = f * fh;
          box(w + jut, fh, d + jut, M(G, at(x + off(y0 + fh / 2), y0 + fh / 2 - 0.5, z, 0, 0, lean)), wall, 0.04);
          if (f) box(w + jut + 0.1, 0.14, d + jut + 0.1, M(G, at(x + off(y0), y0 - 0.5, z, 0, 0, lean)), beam, false, false);
        }
        var topW = w + (floors - 1) * 0.12, topD = d + (floors - 1) * 0.12, ox = off(h);
        if (roof) {
          var sh = new T.Shape(); sh.moveTo(-topW / 2 - 0.15, 0); sh.lineTo(topW / 2 + 0.15, 0); sh.lineTo(0, topW * 0.5); sh.closePath();
          var rg = new T.ExtrudeGeometry(sh, { depth: topD + 0.3, bevelEnabled: false }); rg.translate(0, 0, -(topD + 0.3) / 2);
          kit.piece(rg, M(G, at(x + ox, h - 0.5, z, 0, 0, lean)), top, 0.04);
          // A gable window under the ridge, dark.
          box(0.3, 0.42, 0.05, M(G, at(x + ox, h - 0.5 + topW * 0.18, z + topD / 2 + 0.17, 0, 0, lean)), '--wds-window', false, false);
        } else {
          box(topW + 0.25, 0.25, topD + 0.25, M(G, at(x + ox, h - 0.4, z, 0, 0, lean)), top, 0.03);
        }
        // Chimneys, one or two, each with a pot.
        var stacks = hash(x * 3.1 + z) > 0.55 ? 2 : 1;
        for (var k = 0; k < stacks; k++) {
          var cx = x + ox + (k ? -1 : 1) * topW * 0.28, ch = 0.9 + hash(x + k * 9) * 0.8;
          box(0.36, ch, 0.36, M(G, at(cx, h - 0.5 + (roof ? topW * 0.2 : 0.1) + ch / 2, z - topD * 0.15, 0, 0, lean)), top, 0.03);
          cyl(0.1, 0.12, 0.3, M(G, at(cx, h - 0.5 + (roof ? topW * 0.2 : 0.1) + ch + 0.15, z - topD * 0.15)), beam, 0.02, 6);
        }
        // The door, at the foot, with a step.
        var dx = (hash(x * 5.5 + z) - 0.5) * (w - 0.9);
        box(0.6, 1.15, 0.06, M(G, at(x + dx, 0.08, z + d / 2 + 0.03)), beam, false, false);
        box(0.9, 0.16, 0.35, M(G, at(x + dx, -0.42, z + d / 2 + 0.16)), wall, 0.02, false);
        // Windows, dark on both sides of the edge, because nobody has lit a lamp.
        for (var wy = 1.1; wy < h - 0.9; wy += 1.3) {
          var jutAt = Math.floor(wy / fh) * 0.12;
          for (var wx = -w / 2 + 0.55; wx < w / 2 - 0.35; wx += 0.95) {
            if (hash(x * 13 + wy * 7 + wx) < 0.4) continue;
            if (wy < 1.4 && Math.abs(wx - dx) < 0.7) continue;
            var zf = z + d / 2 + jutAt / 2 + 0.03, wxx = x + wx + off(wy);
            box(0.38, 0.55, 0.05, M(G, at(wxx, wy - 0.5, zf, 0, 0, lean)), '--wds-window', false, false);
            // Some windows keep their shutters open, one either side.
            if (hash(wx * 7.7 + wy + x) > 0.62) {
              [-1, 1].forEach(function (sd) {
                box(0.2, 0.6, 0.04, M(G, at(wxx + sd * 0.31, wy - 0.5, zf + 0.02, 0, 0, lean)), beam, false, false);
              });
            }
            // and a sill under it.
            box(0.5, 0.06, 0.12, M(G, at(wxx, wy - 0.82, zf + 0.04, 0, 0, lean)), beam, false, false);
          }
        }
      }
      var ID = at(0, 0, 0);
      [[FAR - 4.5, 3.2, 7.5, 11], [FAR, 2.6, 3.5, 7]].forEach(function (row, ri) {
        var x = -30, n = 0;
        while (x < 30) {
          var w = 1.6 + hash(ri * 100 + n * 1.3) * 1.7;
          var h = row[2] + hash(ri * 50 + n * 2.9) * (row[3] - row[2]);
          house(ID, x + w / 2, row[0], w, row[1], h, (hash(n * 4.4 + ri) - 0.5) * 0.08, hash(n * 6.1 + ri * 3) > 0.3, lit(x + w / 2, h * 0.6));
          x += w - 0.12; n++;
        }
      });
      // AND THE CITY GOING ON BEHIND, row after row, too far off to have any
      // more than an outline, and each row further into the air than the one
      // in front: the houses' own colours laid thinner and thinner over the
      // sky, night on this side of the edge and morning past it.
      function farEdge(z, y) { var t = (z - FAR) / (SKYZ - FAR); return (EDGE + (2.6 - EDGE) * t) - SLANT * y; }
      function haze(shapes, z, ink, strength) {
        if (!shapes.length) return;
        var mesh = new T.Mesh(new T.ShapeGeometry(shapes), new T.MeshBasicMaterial({ color: kit.col(ink), transparent: true, opacity: strength }));
        mesh.matrixAutoUpdate = false; mesh.matrix.copy(at(0, -0.5, z)); mesh.matrixWorldNeedsUpdate = true;
        mesh.renderOrder = -1;
        kit.scene.add(mesh);
      }
      [[FAR - 12, 9, 16, 0.62], [FAR - 20, 13, 22, 0.36]].forEach(function (band, bi) {
        var x = -64, n = 0, night = [], day = [];
        while (x < 64) {
          var w = 2.2 + hash(bi * 300 + n * 1.7) * 3, h = band[1] + hash(bi * 200 + n * 3.3) * (band[2] - band[1]);
          var cx = x + w / 2, sh = new T.Shape();
          sh.moveTo(cx - w / 2, 0); sh.lineTo(cx + w / 2, 0); sh.lineTo(cx + w / 2, h);
          var peak = hash(n * 7.1 + bi);
          if (peak > 0.86) { sh.lineTo(cx + w * 0.12, h); sh.lineTo(cx, h + w * 1.8); sh.lineTo(cx - w * 0.12, h); }
          else if (peak > 0.35) sh.lineTo(cx, h + w * 0.45);
          sh.lineTo(cx - w / 2, h); sh.closePath();
          (cx > farEdge(band[0], h * 0.5) ? day : night).push(sh);
          x += w - 0.2; n++;
        }
        haze(night, band[0], '--wds-wall-night', band[3]);
        haze(day, band[0], '--wds-wall-day', band[3]);
      });

      // THE THIN TOWER, far off on the night side, taller than everything.
      cyl(0.45, 0.9, 20, at(-9, 9.5, FAR - 11), '--wds-roof-night', 0.05, 8);
      cyl(0.02, 0.6, 3, at(-9, 21, FAR - 11), '--wds-roof-night', 0.04, 8);
      // THE CLACKS TOWER, past the edge: a lattice, and a board of shutters
      // with every other one open.
      var KX = 11, KZ = FAR - 8;
      [-1, 1].forEach(function (s) {
        box(0.22, 14, 0.22, at(KX + s * 0.9, 6.5, KZ, 0, 0, -s * 0.05), '--wds-roof-day', 0.03);
      });
      for (var ky = 1; ky < 13; ky += 2.4) box(1.9, 0.14, 0.16, at(KX, ky, KZ), '--wds-roof-day', 0.02, false);
      box(3, 2.2, 0.3, at(KX, 14.4, KZ), '--wds-roof-day', 0.04);
      for (var si = 0; si < 4; si++) {
        for (var sj = 0; sj < 3; sj++) {
          if ((si + sj) % 2) continue;
          box(0.5, 0.42, 0.05, at(KX - 1.05 + si * 0.7, 13.75 + sj * 0.65, KZ + 0.17), '--wds-wall-day', false, false);
        }
      }

      // THE BRASS BRIDGE, over the water from this bank to the far one, on the
      // night side: one long low arch on stone piers, its deck laid in
      // lengths that follow the curve, a brass parapet each side on posts,
      // and lamps on it that nobody has lit.
      var BX = -6, BZ0 = -3.3, BZ1 = FAR + 0.6, RISE = 1.7, BW = 2.6, LENGTHS = 22;
      function arch(t) { return { z: BZ0 + (BZ1 - BZ0) * t, y: 0.3 + RISE * Math.sin(Math.PI * t) }; }
      for (var bi = 0; bi < LENGTHS; bi++) {
        var p0 = arch(bi / LENGTHS), p1 = arch((bi + 1) / LENGTHS);
        var len = Math.hypot(p1.z - p0.z, p1.y - p0.y), tilt = Math.atan2(p1.y - p0.y, p0.z - p1.z);
        var mz = (p0.z + p1.z) / 2, my = (p0.y + p1.y) / 2;
        box(BW, 0.28, len + 0.02, at(BX, my, mz, 0, tilt), '--wds-brass', 0.02);
        // The parapet's rail, and a post at every other length.
        [-1, 1].forEach(function (sd) {
          box(0.1, 0.1, len + 0.02, at(BX + sd * (BW / 2 - 0.05), my + 0.95, mz, 0, tilt), '--wds-brass', false, false);
          box(0.06, 0.06, len + 0.02, at(BX + sd * (BW / 2 - 0.05), my + 0.5, mz, 0, tilt), '--wds-brass', false, false);
          if (bi % 2 === 0) box(0.14, 1.0, 0.14, at(BX + sd * (BW / 2 - 0.05), p0.y + 0.5, p0.z), '--wds-brass', 0.015, false);
        });
      }
      // The piers, standing in the crust under the arch.
      [0.3, 0.7].forEach(function (t) {
        var pp = arch(t);
        box(BW + 0.4, pp.y + 0.7, 1.1, at(BX, (pp.y - 0.7) / 2 - 0.05, pp.z), '--wds-wall-night', 0.03);
        box(BW + 0.7, 0.3, 1.5, at(BX, -0.45, pp.z), '--wds-roof-night', 0.02, false);
      });
      // Its lamps, on the parapet posts at either end and the crown, unlit.
      [0.06, 0.5, 0.94].forEach(function (t) {
        var lp = arch(t);
        [-1, 1].forEach(function (sd) {
          cyl(0.05, 0.07, 1.8, at(BX + sd * (BW / 2 - 0.05), lp.y + 1.2, lp.z), '--wds-brass', 0.015, 6);
          box(0.3, 0.38, 0.3, at(BX + sd * (BW / 2 - 0.05), lp.y + 2.25, lp.z), '--wds-window', 0.02);
          kit.piece(new T.ConeGeometry(0.26, 0.26, 4), at(BX + sd * (BW / 2 - 0.05), lp.y + 2.56, lp.z, Math.PI / 4), '--wds-brass', 0.015);
        });
      });

      // THE QUAY'S EDGE: iron bollards with a rope round some, a ladder down
      // the wall into the crust, a rowboat sat on the crust where it was tied,
      // and lamp posts along the edge that nobody has lit either.
      for (var bo = -20; bo <= 9; bo += 3.2) {
        if (Math.abs(bo - BX) < 2.2) continue;
        cyl(0.1, 0.13, 0.42, at(bo, 0.07, -2.95), '--wds-roof-night', 0.015, 8);
        kit.piece(new T.SphereGeometry(0.12, 8, 6), at(bo, 0.3, -2.95), '--wds-roof-night', 0.015);
        if (hash(bo * 3.7) > 0.5) kit.piece(new T.TorusGeometry(0.16, 0.035, 5, 14), at(bo, 0.12, -2.95, 0, FLAT), '--wds-line', false, false);
      }
      [-0.25, 0.25].forEach(function (o) { box(0.05, 1.2, 0.05, at(-13.5 + o, -0.15, -3.55), '--wds-line', false, false); });
      for (var rg2 = 0; rg2 < 4; rg2++) box(0.55, 0.04, 0.04, at(-13.5, -0.55 + rg2 * 0.28, -3.55), '--wds-line', false, false);
      (function () {
        var hull = new T.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        hull.scale(0.7, 0.42, 1.8); hull.rotateX(Math.PI);
        kit.piece(hull, at(-15.5, -0.05, -5.2, 0.35), '--wds-roof-night', 0.03);
        box(1.15, 0.06, 0.24, at(-15.5, -0.1, -5.0, 0.35), '--wds-wall-night', false, false);
        box(0.04, 0.04, 2.2, at(-14.9, 0.1, -4.0, 0.9, -0.2), '--wds-ink-3', false, false);
      })();
      [-18.5, -1.5, 9.4].forEach(function (lx) {
        cyl(0.07, 0.1, 3.0, at(lx, 1.5, -2.6), '--wds-roof-night', 0.02, 6);
        box(0.06, 0.06, 0.6, at(lx, 2.9, -2.35), '--wds-roof-night', false, false);
        box(0.32, 0.42, 0.32, at(lx, 2.7, -2.05), '--wds-window', 0.02);
        kit.piece(new T.ConeGeometry(0.27, 0.24, 4), at(lx, 3.03, -2.05, Math.PI / 4), '--wds-roof-night', 0.015);
      });

      // THE HOUSES ALONG THE BACK OF THE QUAY, behind the boards, on the night
      // side of everything: the same crooked build turned to face the river,
      // doors onto the cobbles, and the quay's clutter at their feet, crates,
      // barrels, a handcart and a bench, where people would be if anybody were
      // up yet.
      var BACK = at(0, 0, 9.2, Math.PI);
      (function () {
        var x = -24, n = 0;
        while (x < 12) {
          var w = 2.0 + hash(500 + n * 1.9) * 1.8, h = 5.5 + hash(600 + n * 2.3) * 4.5;
          house(BACK, -(x + w / 2), 0, w, 3.6, h, (hash(n * 3.1 + 9) - 0.5) * 0.07, hash(n * 5.3 + 7) > 0.35, false);
          x += w - 0.1; n++;
        }
      })();
      box(40, 0.3, 4, at(-6, -0.17, 7.4), '--wds-roof-night', false, false);
      function crate(x, z, sz, r) { box(sz, sz, sz, at(x, sz / 2 - 0.3, z, r), '--wds-wall-night', 0.025); }
      function barrel(x, z) {
        cyl(0.32, 0.32, 0.8, at(x, 0.1, z), '--wds-roof-night', 0.025, 12);
        [-0.22, 0.22].forEach(function (y) { cyl(0.335, 0.335, 0.05, at(x, 0.1 + y, z), '--wds-brass', false, 12); });
      }
      crate(6.9, 5.4, 0.7, 0.2); crate(7.4, 5.9, 0.55, -0.3); crate(7.0, 5.6, 0.45, 0.6);
      barrel(-3.2, 5.3); barrel(-2.6, 5.7);
      barrel(-14.3, 5.5); crate(-15.1, 5.8, 0.6, 0.1);
      // The handcart, its shafts down on the cobbles.
      (function () {
        var cx = -8.6, cz = 5.6;
        box(1.4, 0.12, 0.9, at(cx, 0.35, cz), '--wds-wall-night', 0.02);
        [-0.48, 0.48].forEach(function (o) { box(1.4, 0.3, 0.06, at(cx, 0.55, cz + o), '--wds-wall-night', 0.015, false); });
        [-0.52, 0.52].forEach(function (o) { kit.piece(new T.TorusGeometry(0.4, 0.06, 6, 16), at(cx + 0.15, 0.1, cz + o), '--wds-roof-night', 0.02); });
        [-0.32, 0.32].forEach(function (o) { box(1.3, 0.06, 0.06, at(cx - 1.25, 0.05, cz + o, 0, 0, 0.25), '--wds-wall-night', false, false); });
      })();
      // A bench against the houses, between the boards and the page's end.
      (function () {
        var x = 10.4, z = 6.4;
        box(1.8, 0.08, 0.45, at(x, 0.15, z), '--wds-wall-night', 0.02);
        box(1.8, 0.45, 0.06, at(x, 0.45, z + 0.22), '--wds-wall-night', 0.015);
        [-0.8, 0.8].forEach(function (o) { box(0.08, 0.45, 0.4, at(x + o, -0.07, z), '--wds-roof-night', false, false); });
      })();

      // THE ROOM'S OWN PAGE, on a board at the right-hand end of the quay
      // where you come in, facing the river with its back to the street.
      var pw = 2.4, ph = pw * 800 / 1180;
      box(pw + 0.14, ph + 0.14, 0.08, at(8.6, 0.75 + ph / 2, 4.1, Math.PI), '--wds-line', 0.01);
      var page = kit.screen(1180, 800, pw, at(8.6, 0.75 + ph / 2, 4.05, Math.PI), 'Widdershins’ own page, on a board at the end of the quay');

      // THE PAGE'S WORDS on boards along the back of the quay, read with your
      // back to the river, walked right to left: widdershins.
      var BACKZ = 4.2, STAND = 2.4;
      function board(sel, n, x, w, ww, h) {
        var it = kit.lift(page, sel, { n: n, w: w, ww: ww, h: h, m: at(x, 0.5, BACKZ, Math.PI) });
        box(ww + 0.12, 0.1, 0.12, at(x, 0.45, BACKZ + 0.05, Math.PI), '--wds-line', 0.01);
        // Two posts and a little roof over it, so the words stand on a board
        // that was put up on the quay rather than hanging in the night.
        [-1, 1].forEach(function (sd) { box(0.08, 1.5, 0.08, at(x + sd * (ww / 2 + 0.08), 0.45, BACKZ + 0.08), '--wds-line', 0.01); });
        return { x: x, z: BACKZ - STAND, yaw: Math.PI, pitch: 0.06, frame: it.el };
      }
      var stops = [
        { name: 'on the quay, the city across the river and the morning halfway across it', x: 4, z: 0.6, yaw: 0, pitch: 0.12 },
        { name: 'at the river wall, looking at the morning’s edge on the far bank', x: EDGE, z: -2.2, yaw: 0, pitch: 0.18 },
        { name: 'by the bridge, the night side of the city in front of you', x: -6, z: -2.2, yaw: 0, pitch: 0.16 },
        { name: 'looking up at the compass, widdershins pointing into the morning', x: -12, z: -1.6, yaw: 0.28, pitch: 0.5 }
      ];
      function named(s, name) { s.name = name; stops.push(s); return s; }
      named(board('.wds-head', 0, 5.6, 900, 1.7), 'at the board with the room’s name');
      named(board('.wds-view__words', 0, 3.4, 640, 1.3), 'at the board saying what the city is');
      named(board('.wds-lede', 0, 1.2, 640, 1.4, 640), 'at the board with what widdershins means');
      var PARTS = [
        'at the board with a city that never matched',
        'at the board with the Watch, a competency network',
        'at the board with First Sight, and recognising ourselves',
        'at the board with Miss Level, who stores it in other people',
        'at the board with what Star Stuff wrote and drew',
        'at the board with what is not in this city',
        'at the board with next door',
        'at the board with The Turtle Moves, Star Stuff’s drawing of Great A’Tuin and its passage',
        'at the board with whose this is'
      ];
      PARTS.forEach(function (words, i) {
        named(board('.wds-part', i, -1.2 - i * 2.4, 640, 1.5, 760), words);
      });
      stops.push({ name: 'at the end of the quay where you came in, with the room’s own page', x: 8.6, z: BACKZ - STAND, yaw: Math.PI, pitch: 0.04, page: kit.page, frame: page });

      return {
        start: { x: 4, z: 0.6, yaw: 0 },
        bounds: { x: [-22, 10], z: [-2.4, 2.8] },
        stops: stops
      };
    }
  };
})();

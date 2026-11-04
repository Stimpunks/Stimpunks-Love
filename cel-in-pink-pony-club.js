/* =============================================================================
   Pink Pony Club, walked into on Cel Street. Ryan's ask, 2026-10-31: walk into
   a room from Cel Street, and this one first because it is the first door on
   the street. Its second pass, 2026-11-03, one of the street's showcases:
   rough edges, detail, furniture, somewhere you could spend an evening.

   IT IS THE DANCEFLOOR'S WORLD AND NOBODY ELSE'S (§6), drawn the way Cel
   Street draws: flat colour inside an inked line, light in two steps. A
   dancefloor of hot pink tiles with cream ones lit here and there, a plum
   carpet round its edge where the banquettes stand, hot pink walls with
   nothing hung on them (a pink dado, cream rails, a cream cornice: the room's
   own joinery, not pictures), a plum ceiling with a lighting truss, the
   mirrorball over the middle, banquettes down both sides with little cocktail
   tables, a balloon or two caught up under the ceiling, the DJ's riser with the
   decks, the room's name on the front of their table, a crate of records and
   the room's own decks lifted off its page, and at the far end, between two
   speaker stacks, the jukebox's cream tray with the room's own page in it, to
   read and press as the page itself.

   IT SHARES NOTHING WITH THE CHAPPELL behind the doorway in the left-hand
   wall: no arch anywhere in here, no gold, no indigo, nothing standing free on
   bare ground. Everything is square-cornered joinery or round like a record.

   THE BALL DOES NOT TURN, AND ITS GLINTS FOLLOW THE DIAL: the room hides its
   own glow at Gentle, so at Gentle no glint lies on this floor either. The
   truss's lamps throw still pools; nothing flashes. Every colour is one the
   room declares, by name. It keeps nothing, sends nothing and fetches
   nothing; its page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i, 374761393) ^ Math.imul(j, 668265263) ^ Math.imul(k, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['pink-pony-club.html'] = {
    faces: ['"Shrikhand"'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl, D = 22, W = 14, H = 5, TILE = 1.35;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var back = -D, EDGE = 1.6;           // the carpet strip along each side wall
      var FLOOR_W = W - 2 * EDGE;          // the dancefloor between the strips

      kit.scene.background = kit.col('--pony-ink');
      kit.scene.add(new T.HemisphereLight(kit.col('--cream'), kit.col('--pony-ink'), 1.15));
      var ball = new T.PointLight(kit.col('--cream'), 5, 30, 1.4);
      ball.position.set(0, 1.9, -9.5);
      kit.scene.add(ball);
      var key = new T.DirectionalLight(kit.col('--cream'), 1.35);
      key.position.set(4, 9, 4); key.target.position.set(0, 0, -12);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.left = -12; key.shadow.camera.right = 12; key.shadow.camera.top = 16; key.shadow.camera.bottom = -16;
      key.shadow.bias = -0.0006; key.shadow.normalBias = 0.03;
      kit.scene.add(key, key.target);
      // The truss's lamps, still: each throws a soft pink pool on the floor.
      [[-3.2, -6], [3.2, -6], [-3.2, -15], [3.2, -15]].forEach(function (p) {
        var s = new T.SpotLight(kit.col('--pink'), 26, 9, 0.5, 0.7, 1.2);
        s.position.set(p[0], 4.3, p[1]); s.target.position.set(p[0] * 0.6, 0, p[1] - 0.6);
        kit.scene.add(s, s.target);
      });

      // THE FLOOR: plum under everything; a plum carpet along each side wall,
      // a cream inlay where it meets the dancefloor; and the dancefloor's
      // tiles, hot pink and pink with a cream one lit here and there, each a
      // bevelled slab standing a little proud of the grout, the same every
      // visit.
      box(W, 0.1, D + 2, at(0, -0.05, -D / 2 + 1), '--pony-ink', false, false);
      [-1, 1].forEach(function (s) {
        box(EDGE, 0.05, D + 0.6, at(s * (W / 2 - EDGE / 2), 0.025, -D / 2 + 0.6), '--pony-ink', false, false);
        box(0.08, 0.07, D + 0.6, at(s * (FLOOR_W / 2 + 0.04), 0.035, -D / 2 + 0.6), '--cream', false, false);
      });
      var cols = Math.round(FLOOR_W / TILE), rows = Math.floor((D + 0.6) / TILE);
      var tw = FLOOR_W / cols;
      for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
          var lit = hash(i + 3, j + 5, 1) < 0.16, x = -FLOOR_W / 2 + (i + 0.5) * tw, z = 0.9 - (j + 0.5) * TILE;
          var ink = lit ? '--cream' : (i + j) % 2 ? '--hot' : '--pink';
          box(tw - 0.08, 0.05, TILE - 0.08, at(x, 0.025, z), ink, false, false);
          box(tw - 0.26, 0.03, TILE - 0.26, at(x, 0.065, z), ink, false, false);
          // A lit tile has its light in a smaller square at its heart.
          if (lit) box(tw * 0.3, 0.02, TILE * 0.3, at(x, 0.085, z), '--pink', false, false);
        }
      }

      // THE WALLS: hot pink, and the room's joinery on them. A cream skirting,
      // a pink dado in panels below a cream rail at hip height, a cream
      // cornice where they meet the ceiling, and pilasters dividing each wall
      // into bays. Nothing is hung on them.
      // gap: [where along the wall, half its width, true if it is a doorway],
      // where no bay, pilaster, skirting or rail is drawn.
      function wall(len, m, gap) {
        box(len, H, 0.4, M(m, at(0, H / 2, -0.2)), '--hot');
        var runs = gap && gap[2] ? [[-len / 2, gap[0] - gap[1]], [gap[0] + gap[1], len / 2]] : [[-len / 2, len / 2]];
        runs.forEach(function (r) {
          var rl = r[1] - r[0], rc = (r[0] + r[1]) / 2;
          if (rl <= 0) return;
          box(rl, 0.16, 0.1, M(m, at(rc, 0.08, 0.04)), '--cream', 0.02);
          box(rl, 0.1, 0.12, M(m, at(rc, 1.18, 0.05)), '--cream', 0.02);
        });
        box(len, 0.24, 0.16, M(m, at(0, H - 0.12, 0.06)), '--cream', 0.02);
        var bays = Math.max(1, Math.round(len / 2.2)), bw = len / bays;
        for (var b = 0; b < bays; b++) {
          var bx = -len / 2 + (b + 0.5) * bw;
          if (gap && Math.abs(bx - gap[0]) < gap[1]) continue;
          box(bw - 0.4, 0.78, 0.05, M(m, at(bx, 0.66, 0.02)), '--pink', 0.015);
        }
        for (b = 1; b < bays; b++) {
          var px = -len / 2 + b * bw;
          if (gap && Math.abs(px - gap[0]) < gap[1] + 0.3) continue;
          box(0.34, H - 0.4, 0.12, M(m, at(px, H / 2 - 0.05, 0.06)), '--pink', 0.02);
          box(0.44, 0.14, 0.18, M(m, at(px, H - 0.38, 0.08)), '--cream', 0.02);
        }
      }
      // The left wall runs from the far end to the door, with the doorway
      // through to the Chappell in it, at z -9.25 (x along the wall is -z).
      wall(D + 2, at(-W / 2, 0, -D / 2 + 1, Math.PI / 2), [-(-9.25) - (D / 2 - 1), 0.98, true]);
      // The right wall leaves its bays clear where the decks' board stands.
      wall(D + 2, at(W / 2, 0, -D / 2 + 1, -Math.PI / 2), [-8.5 + (D / 2 - 1), 2.1]);
      wall(W, at(0, 0, back, 0), [0, 3.8]);
      // The plum ceiling, with a cream rose where the ball's line comes down.
      box(W + 0.8, 0.3, D + 2, at(0, H + 0.15, -D / 2 + 1), '--pony-ink', false, false);
      cyl(0.5, 0.5, 0.06, at(0, H - 0.03, -11), '--cream', 0.02, 24);
      cyl(0.3, 0.36, 0.08, at(0, H - 0.08, -11), '--pony-ball', 0.02, 20);

      // The wall you came in by, with its doorway in cream, and two hooks
      // either side of it with a coat on one.
      box((W - 2.4) / 2, H, 0.4, at(-(W + 2.4) / 4, H / 2, 1.2), '--hot');
      box((W - 2.4) / 2, H, 0.4, at((W + 2.4) / 4, H / 2, 1.2), '--hot');
      box(2.4, H - 2.6, 0.4, at(0, 2.6 + (H - 2.6) / 2, 1.2), '--hot');
      box(0.15, 2.6, 0.5, at(-1.2, 1.3, 1.2), '--cream', 0.03);
      box(0.15, 2.6, 0.5, at(1.2, 1.3, 1.2), '--cream', 0.03);
      box(2.55, 0.15, 0.5, at(0, 2.6, 1.2), '--cream', 0.03);
      box((W - 2.4) / 2, 0.16, 0.1, at(-(W + 2.4) / 4, 0.08, 0.96), '--cream', 0.02);
      box((W - 2.4) / 2, 0.16, 0.1, at((W + 2.4) / 4, 0.08, 0.96), '--cream', 0.02);
      [-2.2, -2.8, 2.2, 2.8].forEach(function (x) { cyl(0.03, 0.03, 0.18, at(x, 1.75, 0.92, 0, Math.PI / 2), '--cream', false, 8); });
      box(0.5, 0.9, 0.14, at(2.5, 1.32, 0.86), '--pony-ink', 0.02);
      box(0.56, 0.12, 0.16, at(2.5, 1.74, 0.86), '--pink', 0.015);

      // THE LIGHTING TRUSS: two cream rails across the room on drop rods,
      // and plum cans hanging from them with cream lenses, aimed at the floor.
      [-6, -15].forEach(function (z) {
        [-0.18, 0.18].forEach(function (o) { box(W - 1.2, 0.08, 0.08, at(0, 4.5 + o * 0, z + o), '--cream', 0.015); });
        for (var r = -W / 2 + 1.4; r <= W / 2 - 1.3; r += 0.9) box(0.04, 0.04, 0.4, at(r, 4.5, z, 0, 0.6), '--cream', false);
        [-4.8, 4.8].forEach(function (x) { box(0.05, H - 4.5, 0.05, at(x, 4.5 + (H - 4.5) / 2, z), '--cream', false); });
        [-3.2, -1.1, 1.1, 3.2].forEach(function (x) {
          cyl(0.13, 0.18, 0.42, at(x, 4.16, z + 0.15, 0, -0.35), '--pony-ink', 0.02, 14);
          kit.flat(new T.CircleGeometry(0.15, 16), at(x, 3.96, z + 0.22, 0, -Math.PI / 2 - 0.35), '--cream');
          box(0.04, 0.2, 0.04, at(x, 4.38, z), '--cream', false);
        });
      });

      // THE MIRRORBALL on its line, finely faceted, a cream cap and ring,
      // still at every setting.
      cyl(0.02, 0.02, H - 3.4, at(0, 3.4 + (H - 3.4) / 2, -11), '--cream', false, 6);
      kit.facets(new T.IcosahedronGeometry(0.85, 2), at(0, 3.4, -11), '--pony-ball');
      cyl(0.16, 0.2, 0.14, at(0, 4.28, -11), '--cream', 0.02, 14);
      // Its glints on the floor and the walls, above Gentle only.
      if (!kit.gentle) {
        for (var k = 0; k < 60; k++) {
          var gx = -FLOOR_W / 2 + 0.4 + hash(k, 7, 2) * (FLOOR_W - 0.8), gz = -3 - hash(k, 7, 3) * (D - 5);
          kit.flat(new T.CircleGeometry(0.08 + hash(k, 7, 4) * 0.08, 10), at(gx, 0.095, gz, 0, -Math.PI / 2), '--cream');
        }
        for (k = 0; k < 40; k++) {
          var s = k % 2 ? 1 : -1, wz = -2 - hash(k, 9, 3) * (D - 4), wy = 1.4 + hash(k, 9, 4) * 3.2;
          if (s < 0 && Math.abs(wz + 9.25) < 1.2) continue;
          kit.flat(new T.CircleGeometry(0.08 + hash(k, 9, 5) * 0.06, 10), at(s * (W / 2 - 0.01), wy, wz, s > 0 ? -Math.PI / 2 : Math.PI / 2), '--cream');
        }
      }

      // BALLOONS, a few caught up under the ceiling in the corners, left
      // over from somebody's night, their strings hanging still.
      [[-5.8, -1.6], [5.6, -20.6], [-5.6, -20.2], [5.9, -2.2]].forEach(function (c, n) {
        for (var q = 0; q < 3; q++) {
          var bx = c[0] + (hash(n, q, 1) - 0.5) * 0.9, bz = c[1] + (hash(n, q, 2) - 0.5) * 0.9, by = 4.45 - hash(n, q, 3) * 0.35;
          var bl = new T.SphereGeometry(0.3, 14, 12); bl.scale(1, 1.18, 1);
          kit.piece(bl, at(bx, by, bz), q % 2 ? '--cream' : '--pink', 0.02);
          kit.piece(new T.ConeGeometry(0.05, 0.08, 8), at(bx, by - 0.38, bz, 0, Math.PI), q % 2 ? '--cream' : '--pink', false);
          cyl(0.006, 0.006, 1.6, at(bx, by - 1.2, bz), '--cream', false, 4);
        }
      });

      // BANQUETTES down both sides on the carpet: a tufted plum back in
      // cushions with a pink bolster along its top, a cream seat in cushions,
      // and little cocktail tables in front with a glass and a coaster on each.
      [-1, 1].forEach(function (s) {
        // On the right, the banquettes leave room for the DJ's riser.
        (s > 0 ? [[-3.5, 3.2], [-15, 5.2]] : [[-4.5, 5], [-14, 6]]).forEach(function (b, bi) {
          var x = s * (W / 2 - 0.62);
          box(0.3, 0.34, b[1], at(s * (W / 2 - 0.55), 0.17, b[0]), '--pony-ink', 0.02);
          var n = Math.round(b[1] / 0.9), cw = b[1] / n;
          for (var c = 0; c < n; c++) {
            var cz = b[0] - b[1] / 2 + (c + 0.5) * cw;
            box(0.22, 0.95, cw - 0.06, at(s * (W / 2 - 0.3), 0.92, cz, 0, 0, s * 0.08), '--pony-ink', 0.02);
            [0.72, 1.12].forEach(function (y) { kit.piece(new T.SphereGeometry(0.035, 6, 4), at(s * (W / 2 - 0.42), y, cz), '--pony-ball', false); });
            box(0.8, 0.18, cw - 0.06, at(x, 0.43, cz), '--cream', 0.02);
          }
          cyl(0.11, 0.11, b[1], at(s * (W / 2 - 0.32), 1.44, b[0], 0, Math.PI / 2), '--pink', 0.02, 12);
          [-b[1] / 2 + 0.05, b[1] / 2 - 0.05].forEach(function (o) { box(0.9, 0.7, 0.1, at(x, 0.55, b[0] + o), '--pony-ink', 0.02); });
          // The tables, on the carpet in front of the seats.
          [-b[1] / 4, b[1] / 4].forEach(function (o, ti) {
            var tx2 = s * (W / 2 - 1.42), tz2 = b[0] + o;
            cyl(0.32, 0.32, 0.04, at(tx2, 0.62, tz2), '--cream', 0.02, 22);
            cyl(0.04, 0.04, 0.58, at(tx2, 0.32, tz2), '--pony-ink', false, 8);
            cyl(0.18, 0.2, 0.03, at(tx2, 0.015, tz2), '--pony-ink', 0.01, 16);
            cyl(0.07, 0.07, 0.006, at(tx2 + 0.08, 0.645, tz2 - 0.06), '--pink', false, 14);
            if (hash(bi, ti, s + 3) < 0.75) {
              cyl(0.045, 0.035, 0.14, at(tx2 + 0.08, 0.72, tz2 - 0.06), '--pony-ball', 0.01, 10);
              cyl(0.007, 0.007, 0.2, at(tx2 + 0.1, 0.78, tz2 - 0.05, 0, 0.2), '--pink', false, 4);
            }
          });
        });
      });

      // THE DJ'S RISER against the right wall: a plum platform with a cream
      // edge, the decks' table on it (plum, a cream top), two turntables with
      // pink slipmats and cream tonearms, the mixer between them, a pair of
      // headphones, and a crate of records at its foot.
      var tx = W / 2 - 1.2, tz = -8.5;
      box(2.6, 0.24, 4.6, at(W / 2 - 1.3, 0.12, tz), '--pony-ink', 0.02);
      box(0.08, 0.06, 4.6, at(W / 2 - 2.6, 0.24, tz), '--cream', false);
      box(1.2, 1.0, 3.2, at(tx, 0.74, tz), '--pony-ink');
      box(1.24, 0.08, 3.24, at(tx, 1.28, tz), '--cream');
      [-0.95, 0.95].forEach(function (o) {
        cyl(0.42, 0.42, 0.06, at(tx, 1.36, tz + o), '--pony-ink', 0.02, 28);
        cyl(0.37, 0.37, 0.02, at(tx, 1.4, tz + o), '--pink', false, 28);
        cyl(0.13, 0.13, 0.022, at(tx, 1.412, tz + o), '--cream', false, 18);
        cyl(0.02, 0.02, 0.06, at(tx, 1.43, tz + o), '--pony-ball', false, 8);
        cyl(0.05, 0.05, 0.08, at(tx + 0.36, 1.42, tz + o + 0.34), '--cream', false, 10);
        box(0.03, 0.03, 0.46, at(tx + 0.2, 1.45, tz + o + 0.15, 0.6), '--cream', false);
      });
      box(0.62, 0.1, 0.66, at(tx, 1.37, tz), '--pony-ink', 0.015);
      for (var kn = 0; kn < 3; kn++) {
        [-0.18, 0, 0.18].forEach(function (o) { cyl(0.028, 0.028, 0.04, at(tx - 0.18 + kn * 0.14, 1.44, tz + o), '--cream', false, 8); });
      }
      [-0.12, 0.12].forEach(function (o) { box(0.04, 0.03, 0.1, at(tx + 0.2, 1.43, tz + o), '--pink', false); });
      kit.piece(new T.TorusGeometry(0.15, 0.025, 6, 18, Math.PI), at(tx - 0.3, 1.33, tz + 1.55, 0, -Math.PI / 2), '--pony-ink', false);
      [-1, 1].forEach(function (e) { cyl(0.07, 0.07, 0.05, at(tx - 0.3 + e * 0.15, 1.34, tz + 1.55, 0, 0, Math.PI / 2), '--pony-ink', false, 12); });
      // The crate, and the records in it, spines up.
      var cx = W / 2 - 2.2, cz = tz - 2.0;
      box(0.62, 0.38, 0.62, at(cx, 0.43, cz), '--pony-ink', 0.02);
      var SLEEVES = ['--cream', '--pink', '--hot', '--pony-ball'];
      for (var r2 = 0; r2 < 9; r2++) {
        box(0.5, 0.5, 0.025, at(cx, 0.58 + hash(r2, 4, 1) * 0.03, cz - 0.24 + r2 * 0.06, 0, -0.08 + hash(r2, 4, 2) * 0.16), SLEEVES[r2 % 4], 0.008);
      }

      // THE DECKS THEMSELVES, lifted off the room's page onto a cream board
      // behind the table, in the jukebox's own tray: press one to put it on.
      // Nothing stands between it and the floor, so it shows from anywhere.
      var deckBoard = at(W / 2 - 0.06, 0, tz, -Math.PI / 2);
      box(3.9, 2.9, 0.06, M(deckBoard, at(0, 3.0, -0.02)), '--cream', 0.02);

      // THE JUKEBOX on the far wall: a plum plinth, the cream tray with a
      // pink band inside its edge and pony-grey trim posts either side, and
      // the room's own page in it.
      var sw = 5, sh = sw * 800 / 1180, sy = 0.4 + sh / 2 + 0.25;
      box(sw + 1.0, 0.4, 0.8, at(0, 0.2, back + 0.4), '--pony-ink', 0.02);
      box(sw + 0.7, sh + 0.7, 0.14, at(0, sy, back + 0.07), '--pink', 0.02);
      box(sw + 0.5, sh + 0.5, 0.18, at(0, sy, back + 0.09), '--cream');
      [-1, 1].forEach(function (s) {
        cyl(0.1, 0.1, sh + 0.7, at(s * (sw / 2 + 0.42), sy, back + 0.22), '--pony-ball', 0.02, 14);
        [sy - sh / 2 - 0.3, sy + sh / 2 + 0.3].forEach(function (y) { kit.piece(new T.SphereGeometry(0.14, 12, 10), at(s * (sw / 2 + 0.42), y, back + 0.22), '--cream', 0.02); });
      });
      var frame = kit.screen(1180, 800, sw, at(0, sy, back + 0.2), 'Pink Pony Club’s own page, in the jukebox’s tray');
      var decks = kit.lift(frame, '.decks', { w: 820, h: 620, ww: 3.6, m: M(deckBoard, at(0, 1.62, 0.03)) });
      var name = kit.paper(1200, 260, function (c, w, h) {
        c.fillStyle = kit.ink('--pony-ink'); c.fillRect(0, 0, w, h);
        c.strokeStyle = kit.ink('--pink'); c.lineWidth = 12; c.strokeRect(14, 14, w - 28, h - 28);
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.font = '150px "Shrikhand"';
        c.fillStyle = kit.ink('--pink'); c.fillText('Pink Pony Club', w / 2 + 7, h / 2 + 15);
        c.fillStyle = kit.ink('--cream'); c.fillText('Pink Pony Club', w / 2, h / 2 + 8);
      });
      // The room's name goes on the front of the decks' table, facing the
      // floor, as a club's booth wears it.
      kit.sheet(name, 2.9, 0.63, at(tx - 0.615, 0.8, tz, -Math.PI / 2));
      // A speaker stack either side: a sub on the floor, the cabinet on it,
      // two cones and a horn on each, cream edges.
      [-1, 1].forEach(function (s) {
        var x = s * (sw / 2 + 1.35);
        box(1.3, 0.9, 1.0, at(x, 0.45, back + 0.55), '--pony-ink', 0.03);
        kit.flat(new T.CircleGeometry(0.36, 24), at(x, 0.45, back + 1.06), '--cream');
        kit.flat(new T.CircleGeometry(0.28, 24), at(x, 0.45, back + 1.07), '--pony-ink');
        box(1.2, 2.2, 0.9, at(x, 2.0, back + 0.5), '--pony-ink');
        box(1.24, 0.06, 0.94, at(x, 3.12, back + 0.5), '--cream', false);
        [1.45, 2.4].forEach(function (y) {
          kit.flat(new T.CircleGeometry(0.4, 24), at(x, y, back + 0.96), '--cream');
          kit.flat(new T.CircleGeometry(0.31, 24), at(x, y, back + 0.97), '--pony-ink');
          kit.flat(new T.CircleGeometry(0.11, 16), at(x, y, back + 0.98), '--pony-ball');
        });
        box(0.6, 0.22, 0.05, at(x, 2.92, back + 0.97), '--cream', 0.01);
        box(0.48, 0.12, 0.02, at(x, 2.92, back + 1.0), '--pony-ink', false);
      });

      // THE DOORWAY THROUGH TO THE CHAPPELL, in the left-hand wall between the
      // banquettes: the room's own cream frame round a plum opening, as the
      // way you came in is drawn, with a little cream plate beside it. What is
      // through it is the Chappell's own.
      box(0.06, 2.6, 1.6, at(-W / 2 + 0.03, 1.3, -9.25), '--pony-ink', false);
      box(0.5, 2.6, 0.15, at(-W / 2 + 0.05, 1.3, -10.1), '--cream', 0.03);
      box(0.5, 2.6, 0.15, at(-W / 2 + 0.05, 1.3, -8.4), '--cream', 0.03);
      box(0.5, 0.15, 1.85, at(-W / 2 + 0.05, 2.6, -9.25), '--cream', 0.03);
      box(0.4, 0.06, 0.5, at(-W / 2 + 0.25, 0.03, -9.25), '--cream', false);

      return {
        start: { x: 0, z: -0.6, yaw: 0 },
        bounds: { x: [-W / 2 + 1.9, W / 2 - 2.8], z: [back + 1.6, -0.4] },
        stops: [
          { name: 'at the edge of the dancefloor', x: 0, z: -0.6, yaw: 0 },
          { name: 'at the decks’ table', where: 'up by the DJ’s riser, the decks on their board behind the table', x: 2.4, z: tz, yaw: -Math.PI / 2, pitch: 0.16, frame: decks.el },
          { name: 'under the mirrorball', x: 0, z: -8, yaw: 0 },
          { name: 'The Chappell', room: 'the Chappell', where: 'at the doorway in the left-hand wall, through to the Chappell', x: -W / 2 + 3.6, z: -9.25, yaw: Math.PI / 2, page: 'the-chappell.html' },
          { name: 'at the jukebox, with the room’s own page in its tray', x: 0, z: back + 2.9, yaw: 0, page: kit.page, frame: frame }
        ]
      };
    }
  };
})();

/* =============================================================================
   Myths & Legends, walked into on Cel Street, through the Alchemist's Arch in
   the Faery Yurt. Ryan's ask, 2026-10-31: every doorway in the yurt opening
   onto its own room.

   IT IS HELEN EDGAR'S ROOM AND HER WORLD (§128), and this is OURS: a drawing of
   her room for Cel Street, in the colours her rooms declare and nothing else,
   which changes nothing on her page and is hers to keep or send back. It is
   the Reading Room's house (§114's claret, timber, leather and brass), and
   what keeps it off its neighbours is the LIGHT: it comes THROUGH STONE, amber
   set in the left-hand wall and amethyst in the right, so every panel has a
   warm edge on one side and a violet one on the other, and nothing in the room
   is a flame. The arch you came through is grey stone set with both. A model
   of the Stones stands on a plinth, a cauldron on its three legs, the Crystal
   Wheel on the right-hand wall, the old books on the left, and her own page on
   the far wall between two cases.

   ROUND 2 (Ryan's ask, 2026-11-04) drew more of what her page holds: the arch
   as her own drawing of it has it, amethyst crystals up both sides, amber
   stones round the curve and the four elements carved in its keystone; the
   Heel Stone and the bank round the model of the Stones; her Herbery's herbs
   drying over the cauldron; the Wheel of the Year carved on the left-hand wall
   with her festivals beside it, and her Story or Fact cards on the right; and
   flagstones, a bordered rug and stones set on the cases. You arrive a step
   further back, so the room is in front of you rather than a table.

   THREE THINGS ARE HER PAGE'S OWN, lifted off it by Cel Street's kit.lift():
   the Stones turning to the sun at a press, the pouch to fill under the
   Crystal Wheel, and the cauldron. crystal-pouch.js and herb-basket.js, which
   her page loads, are run against the copies, so the pouch and the cauldron
   work here as they do there, sending and keeping nothing. Round 2 lifted two
   more, her Wheel of the Year and her Story or Fact cards, which need no
   script: each card turns over as it does on her page.

   ROUND 3 (Ryan's ask, 2026-11-04: more texture and detail, things that move
   when asked, things to press) drew worn flags among the flagstones, timber
   panels under the dado rail, corbels under the beams, rivets round the
   cauldron, a ladle on its rim and a basket of herbs at its foot; and three
   things to press, each saying what it did and each pressable where it is:
   the cauldron's lid, put on and lifted off; an old book on a reading stand
   by the shelf, opened and shut; and a coat on a peg by the arch, turned
   inside out, as her page says to do if the pixies lead you round in circles.

   WHAT MOVES IS WHAT MOVES ON HER PAGE. Her page says MAX makes the amber
   glow and the amethyst glint and nothing else moves. So the light through
   the stones has switches of its own, one for the amber in the left-hand wall
   and the arch and one for the amethyst in the right-hand wall and the arch,
   each out, low or lit, and at MAX they glow and glint by themselves, slowly,
   each stone in its own time, under the flash line the kit holds, or at any
   setting once somebody asks. Nothing in here is a flame, so nothing
   flickers. Every colour is one her rooms declare, by name. It keeps nothing,
   sends nothing and fetches nothing; her page arrives through Cel Street's
   screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 17, 374761393) ^ Math.imul(j + 53, 668265263) ^ Math.imul(k + 59, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['faery-myths-room.html'] = {
    name: 'Myths & Legends',
    from: 'faery-yurt.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, W = 10, D = 12, H = 3.6, back = -D;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      // Many small lit things as one mesh, so a wall of stones is one draw.
      function merged(parts) {
        var arrs = [], n = 0;
        parts.forEach(function (p) {
          var g = p[0].index ? p[0].toNonIndexed() : p[0].clone();
          g.applyMatrix4(p[1]); arrs.push(g.attributes.position.array); n += g.attributes.position.array.length;
        });
        var pos = new Float32Array(n), o = 0;
        arrs.forEach(function (a) { pos.set(a, o); o += a.length; });
        var out = new T.BufferGeometry(); out.setAttribute('position', new T.BufferAttribute(pos, 3));
        out.computeVertexNormals();
        return out;
      }
      // Where the light comes through each stone: a glint in each, amber or
      // amethyst, switched and glowing together.
      var glintAmber = [], glintAmethyst = [], washAmber = [], washAmethyst = [];
      function glint(m, warm, dx, dy, dz) {
        var p = new T.Vector3(dx || 0, dy || 0, dz || 0).applyMatrix4(m);
        (warm ? glintAmber : glintAmethyst).push([p.x, p.y, p.z]);
      }
      var ID = new T.Matrix4();
      var crystal = new T.OctahedronGeometry(1, 0); crystal.scale(0.5, 1.3, 0.5);
      var lit = { '--myth-amber': [], '--myth-amber-2': [], '--myth-amethyst': [], '--myth-amethyst-2': [] };
      // A little cluster of stones standing on a top: three to five crystals.
      function cluster(m, warm, seed, size) {
        var a = warm ? '--myth-amber' : '--myth-amethyst', b = warm ? '--myth-amber-2' : '--myth-amethyst-2';
        glint(m, warm, 0, size * 1.6, 0);
        for (var k = 0; k < 4; k++) {
          var s = size * (0.6 + hash(seed, k, 31) * 0.6);
          lit[k % 2 ? a : b].push([crystal, M(m, at((hash(seed, k, 33) - 0.5) * size * 3, s * 1.1, (hash(seed, k, 35) - 0.5) * size * 2,
            hash(seed, k, 37) * 3, 0, (hash(seed, k, 39) - 0.5) * 0.7)).scale(new T.Vector3(s, s, s))]);
        }
      }

      // THE LIGHT, through stone: amber from the left wall, amethyst from the right.
      kit.scene.background = kit.col('--rdr-stone');
      kit.scene.add(new T.HemisphereLight(kit.col('--rdr-ink-2'), kit.col('--rdr-stone'), 0.9));
      [[-W / 2 + 0.5, '--myth-amber'], [W / 2 - 0.5, '--myth-amethyst']].forEach(function (l) {
        // On the left the light is set clear of the case of old books, which it
        // used to sit inside, washing every spine one colour.
        (l[0] < 0 ? [[-0.8, 3.1], [-6.6, 3.1]] : [[-3, 2.5], [-8, 2.5]]).forEach(function (q) {
          var p = new T.PointLight(kit.col(l[1]), 14, 11, 1.2);
          p.position.set(l[0], q[1], q[0]);
          kit.scene.add(p);
          (l[0] < 0 ? washAmber : washAmethyst).push(p);
        });
      });

      // THE ROOM: a flagstone floor, claret walls, a panelled ceiling, a velvet
      // rug with a brass border.
      box(W, 0.1, D + 2, at(0, -0.05, -D / 2 + 1), '--rdr-stone', false, false);
      for (var fz = 1.4; fz > back; fz -= 1.2) box(W, 0.004, 0.03, at(0, 0.002, fz), '--rdr-panel', false, false);
      for (var fx = -W / 2 + 1.25; fx < W / 2; fx += 1.25) {
        for (var fr = 0; fr < 12; fr++) box(0.03, 0.004, 1.17, at(fx + (fr % 2 ? 0.6 : 0), 0.002, 0.8 - fr * 1.2), '--rdr-panel', false, false);
      }
      box(0.3, H, D + 2, at(-W / 2 - 0.15, H / 2, -D / 2 + 1), '--rdr-wall');
      box(0.3, H, D + 2, at(W / 2 + 0.15, H / 2, -D / 2 + 1), '--rdr-wall');
      box(W + 0.6, H, 0.3, at(0, H / 2, back - 0.15), '--rdr-wall');
      box(W + 0.6, 0.2, D + 2, at(0, H + 0.1, -D / 2 + 1), '--rdr-panel', false, false);
      for (var b = 0; b < 6; b++) box(W, 0.14, 0.18, at(0, H - 0.05, -0.5 - b * 2.2), '--rdr-timber', 0.02);
      [-1, 1].forEach(function (s) {
        box(0.08, 0.18, D + 1, at(s * (W / 2 - 0.04), 1.0, -D / 2 + 0.5), '--rdr-timber', false);
        box(0.08, 0.14, D + 1, at(s * (W / 2 - 0.04), 0.07, -D / 2 + 0.5), '--rdr-timber', false);
      });
      box(5.6, 0.03, 6.4, at(0, 0.015, -6.2), '--rdr-velvet', false, false);
      box(5.1, 0.036, 5.9, at(0, 0.018, -6.2), '--rdr-brass', false, false);
      box(4.9, 0.042, 5.7, at(0, 0.021, -6.2), '--rdr-panel', false, false);
      // Worn flags here and there, a shade off their neighbours, a crack or
      // two, and the rug's fringe at its two ends.
      for (var wf = 0; wf < 30; wf++) {
        var wx = Math.floor(hash(wf, 2, 1) * 8), wz = Math.floor(hash(wf, 2, 2) * 12);
        var wfx = -W / 2 + 0.625 + wx * 1.25 + (wz % 2 ? 0.6 : 0) - 0.6, wfz = 0.2 - wz * 1.2;
        if (Math.abs(wfx) < 2.9 && wfz < -3.0 && wfz > -9.4) continue;
        box(1.13, 0.006, 1.1, at(wfx, 0.003, wfz), wf % 3 ? '--rdr-panel' : '--rdr-wall', false, false);
      }
      for (var ck = 0; ck < 14; ck++) {
        box(0.012, 0.007, 0.3 + hash(ck, 4, 1) * 0.4, at(-W / 2 + 0.5 + hash(ck, 4, 2) * (W - 1), 0.004, 0.4 - hash(ck, 4, 3) * (D - 1), hash(ck, 4, 4) * 3), '--rdr-stone', false, false);
      }
      [-1, 1].forEach(function (s) {
        for (var fg = 0; fg < 26; fg++) box(0.014, 0.008, 0.12, at(-2.6 + fg * 0.208, 0.004, -6.2 + s * 3.26, (hash(fg, s + 3, 1) - 0.5) * 0.3), '--rdr-brass', false, false);
      });
      // Timber panels under the dado rail down both side walls, and a corbel
      // under each beam where it meets the wall.
      [-1, 1].forEach(function (s) {
        for (var pz = -0.6; pz > back + 0.6; pz -= 1.1) {
          box(0.02, 0.03, 0.92, at(s * (W / 2 - 0.02), 0.28, pz), '--rdr-timber', false, false);
          box(0.02, 0.03, 0.92, at(s * (W / 2 - 0.02), 0.84, pz), '--rdr-timber', false, false);
          [-0.46, 0.46].forEach(function (e) { box(0.02, 0.59, 0.03, at(s * (W / 2 - 0.02), 0.56, pz + e), '--rdr-timber', false, false); });
        }
        for (var cb = 0; cb < 6; cb++) {
          box(0.28, 0.32, 0.2, at(s * (W / 2 - 0.14), H - 0.3, -0.5 - cb * 2.2), '--rdr-timber', 0.01);
          box(0.18, 0.16, 0.2, at(s * (W / 2 - 0.09), H - 0.52, -0.5 - cb * 2.2), '--rdr-timber', false);
        }
      });

      // THE STONES IN THE WALLS: amber clusters set in the left, amethyst in
      // the right, each a few crystals catching their own light. None is set
      // where a case or a board stands against the wall.
      var covered = [[[-4.7, -1.3], [-10.5, -8.3]], [[-10.5, -8.3]]];
      [[-1, '--myth-amber', '--myth-amber-2'], [1, '--myth-amethyst', '--myth-amethyst-2']].forEach(function (side, si) {
        for (var c = 0; c < 9; c++) {
          var cz = -1.2 - c * 1.25, cy = 0.6 + hash(c, si, 1) * 2.4;
          if (covered[si].some(function (r) { return cz > r[0] && cz < r[1]; })) continue;
          glint(at(side[0] * (W / 2 - 0.08), cy, cz), si === 0, 0, 0.05, 0.04);
          glint(at(side[0] * (W / 2 - 0.06), cy, cz), si === 0, 0, -0.08, -0.06);
          for (var k = 0; k < 5; k++) {
            var s = 0.05 + hash(c, k, si + 3) * 0.08;
            var m = at(side[0] * (W / 2 - 0.02), cy + (hash(c, k, 2) - 0.5) * 0.3, cz + (hash(c, k, 4) - 0.5) * 0.35, 0, 0, side[0] * (0.6 + (hash(c, k, 5) - 0.5) * 1.4));
            lit[k % 3 ? side[1] : side[2]].push([crystal, m.scale(new T.Vector3(s, s, s))]);
          }
        }
      });

      // THE ARCH you came through, as her own drawing of it has it: old grey
      // stone, amethyst crystals up both sides, amber stones round the curve,
      // a brass line round its edge and the four elements carved in the
      // keystone (fire and water, and air and earth with their bars).
      var ag = at(0, 0, 0.9), face = -0.31;
      [-1, 1].forEach(function (s) {
        box(0.5, 2.2, 0.6, M(ag, at(s * 1.1, 1.1, 0)), '--myth-chalk', 0.03);
        box(0.025, 2.2, 0.025, M(ag, at(s * 1.36, 1.1, face)), '--rdr-brass', false);
        for (var j = 0; j < 5; j++) {
          var cs = 0.07 + hash(j, s + 2, 41) * 0.03;
          if (j % 2 === 0) glint(M(ag, at(s * 1.1, 0.35 + j * 0.38, face - 0.06)), false);
          lit[j % 2 ? '--myth-amethyst-2' : '--myth-amethyst'].push([crystal,
            M(ag, at(s * (1.1 + (hash(j, s + 2, 43) - 0.5) * 0.18), 0.35 + j * 0.38, face, 0, 0, (hash(j, s + 2, 45) - 0.5) * 0.5)).scale(new T.Vector3(cs, cs, cs))]);
        }
      });
      kit.piece(new T.TorusGeometry(1.1, 0.26, 8, 18, Math.PI), M(ag, at(0, 2.2, 0)), '--myth-chalk', 0.03);
      kit.piece(new T.TorusGeometry(1.37, 0.012, 4, 24, Math.PI), M(ag, at(0, 2.2, face)), '--rdr-brass', false);
      box(0.42, 0.42, 0.66, M(ag, at(0, 3.3, 0)), '--myth-chalk', 0.02);
      var tri = new T.CircleGeometry(0.055, 3);
      // Facing back into the room, your left is +x: fire and air on the left
      // of the keystone, water and earth on the right, as she drew them.
      [[0.09, 3.39, 1, false], [-0.09, 3.39, -1, false], [0.09, 3.21, 1, true], [-0.09, 3.21, -1, true]].forEach(function (g) {
        kit.flat(tri, M(ag, at(g[0], g[1], -0.335, Math.PI, 0, g[2] * Math.PI / 2)), '--rdr-wall');
        if (g[3]) box(0.1, 0.018, 0.004, M(ag, at(g[0], g[1] - g[2] * 0.004, -0.338)), '--rdr-wall', false, false);
      });
      var amberStone = new T.SphereGeometry(1, 10, 8);
      [20, 45, 70, 110, 135, 160].forEach(function (deg) {
        var a = deg / 180 * Math.PI;
        lit['--myth-amber'].push([amberStone, M(ag, at(Math.cos(a) * 1.1, 2.2 + Math.sin(a) * 1.1, face)).scale(new T.Vector3(0.09, 0.075, 0.05))]);
        glint(M(ag, at(Math.cos(a) * 1.1, 2.2 + Math.sin(a) * 1.1, face - 0.05)), true);
        lit['--myth-amber-2'].push([amberStone, M(ag, at(Math.cos(a) * 1.1 - 0.02, 2.22 + Math.sin(a) * 1.1, face - 0.03)).scale(new T.Vector3(0.035, 0.03, 0.03))]);
      });
      box(W, H - 3.0, 0.3, at(0, 3.0 + (H - 3.0) / 2, 1.1), '--rdr-wall');
      [-1, 1].forEach(function (s) { box((W - 2.7) / 2, 3.0, 0.3, at(s * (W + 2.7) / 4, 1.5, 1.1), '--rdr-wall'); });

      // THE STONES, a model on a plinth, with the bank round it and the Heel
      // Stone outside the circle, turned towards the sun on the lectern.
      var sx = -2.7, sz = -6.6, mx = sx - 1.0; // the model stands beside the lectern, not in front of it
      kit.cyl(1.0, 1.1, 0.8, at(mx, 0.4, sz), '--rdr-timber', 0.03, 24);
      kit.cyl(1.02, 1.02, 0.04, at(mx, 0.82, sz), '--rdr-panel', false, 24);
      kit.piece(new T.TorusGeometry(0.8, 0.028, 4, 36), at(mx, 0.85, sz, 0, Math.PI / 2), '--myth-chalk', false);
      for (var u = 0; u < 12; u++) {
        var ua = u / 12 * Math.PI * 2;
        box(0.09, 0.3, 0.06, at(mx + Math.cos(ua) * 0.62, 0.99, sz + Math.sin(ua) * 0.62, -ua), '--myth-chalk', 0.012);
        if (u % 2 === 0) {
          var ub = (u + 1) / 12 * Math.PI * 2, mid = (ua + ub) / 2;
          box(0.36, 0.05, 0.07, at(mx + Math.cos(mid) * 0.62, 1.165, sz + Math.sin(mid) * 0.62, -mid + Math.PI / 2), '--myth-chalk', 0.01);
        }
      }
      [0, 1.3, 2.6, 3.9, 5.2].forEach(function (ua, i) {
        box(0.12, 0.4 + (i % 2) * 0.06, 0.08, at(mx + Math.cos(ua) * 0.32, 1.04, sz + Math.sin(ua) * 0.32, -ua), '--myth-chalk', 0.012);
      });
      var heel = Math.atan2(-1.4, 1.6);
      box(0.11, 0.32, 0.09, at(mx + Math.cos(heel) * 0.93, 1.0, sz + Math.sin(heel) * 0.93, -heel, 0, 0.12), '--myth-chalk', 0.012);
      // A lectern behind the model, and the turning sun standing on it.
      box(1.7, 1.05, 0.5, at(sx + 0.6, 0.525, sz - 1.4), '--rdr-timber', 0.03);
      box(1.76, 0.04, 0.56, at(sx + 0.6, 1.07, sz - 1.4), '--rdr-brass', false);

      // HER PAGE on the far wall between two cases of old books, with stones
      // set on the cases' tops.
      var sw = 3.0, sh = sw * 800 / 1180, sy = 0.45 + sh / 2;
      var pg = at(0, 0, back + 0.02);
      [-1, 1].forEach(function (s) {
        var cx = s * (sw / 2 + 1.5);
        box(2.0, 2.9, 0.45, M(pg, at(cx, 1.45, 0.22)), '--rdr-timber');
        box(2.12, 0.1, 0.52, M(pg, at(cx, 2.95, 0.24)), '--rdr-timber', 0.015);
        cluster(M(pg, at(cx + s * 0.5, 3.0, 0.24)), s < 0, s + 50, 0.07);
        var SP = ['--rdr-leather', '--rdr-velvet', '--rdr-brass', '--rdr-ember', '--myth-chalk', '--rdr-panel'];
        [0.55, 1.25, 1.95, 2.6].forEach(function (y, row) {
          box(1.84, 0.04, 0.38, M(pg, at(cx, y - 0.3, 0.28)), '--rdr-panel', false);
          for (var bk = 0, x = -0.82; bk < 14 && x < 0.78; bk++) {
            var bw = 0.07 + hash(row, bk, s + 9) * 0.06, bh = 0.32 + hash(row, bk, s + 11) * 0.18;
            box(bw, bh, 0.28, M(pg, at(cx + x + bw / 2, y - 0.28 + bh / 2, 0.3)), SP[(row * 3 + bk + (s > 0 ? 2 : 0)) % SP.length], 0.008);
            x += bw + 0.01;
          }
        });
      });
      box(sw + 0.24, sh + 0.24, 0.06, M(pg, at(0, sy, 0)), '--rdr-brass');
      var frame = kit.screen(1180, 800, sw, M(pg, at(0, sy, 0.04)), 'Myths & Legends’ own page, on the far wall between two cases of old books');

      var sun = kit.lift(frame, '.myth-sun', { w: 560, ww: 1.6, m: at(sx + 0.6, 1.09, sz - 1.4) });

      // THE CAULDRON on its three legs, the herbs to tip in on a lectern, and
      // her Herbery's herbs drying over it from a rail: lavender, rosemary,
      // rose, bay, elder and thyme, tied in brass.
      var cx2 = 2.7, cz2 = -6.6, px = cx2 + 1.1; // the pot beside the lectern
      var pot = new T.SphereGeometry(0.55, 18, 12, 0, Math.PI * 2, Math.PI * 0.32, Math.PI * 0.68);
      kit.piece(pot, at(px, 0.72, cz2), '--rdr-stone', 0.03);
      kit.piece(new T.TorusGeometry(0.47, 0.05, 6, 20), at(px, 1.14, cz2, 0, Math.PI / 2), '--rdr-stone', 0.015);
      for (var lg = 0; lg < 3; lg++) {
        var la = lg / 3 * Math.PI * 2;
        box(0.06, 0.4, 0.06, at(px + Math.cos(la) * 0.35, 0.2, cz2 + Math.sin(la) * 0.35), '--rdr-stone', 0.01);
      }
      kit.cyl(0.42, 0.42, 0.02, at(px, 1.08, cz2), '--rdr-velvet', false, 20);
      box(1.6, 0.06, 0.06, at(px, 3.12, cz2), '--rdr-timber', 0.01);
      [-0.7, 0.7].forEach(function (o) { box(0.02, H - 3.12, 0.02, at(px + o, (H + 3.12) / 2, cz2), '--rdr-brass', false); });
      var bundle = new T.ConeGeometry(0.075, 0.4, 7);
      ['--myth-amethyst-2', '--rdr-leather', '--rdr-velvet', '--rdr-leather', '--myth-chalk', '--rdr-brass'].forEach(function (ink, i) {
        var bx = px - 0.6 + i * 0.24, drop = hash(i, 3, 61) * 0.08;
        box(0.008, 0.08 + drop, 0.008, at(bx, 3.05 - drop / 2, cz2), '--rdr-brass', false, false);
        kit.cyl(0.03, 0.03, 0.04, at(bx, 2.99 - drop, cz2), '--rdr-brass', false, 8);
        kit.piece(bundle, at(bx, 2.77 - drop, cz2, hash(i, 5, 63) * 3), ink, 0.01);
      });
      // Rivets round the pot under its rim, a ladle hung on the rim, and a
      // basket of herbs at its foot, wicker in bands with a handle over.
      for (var rv = 0; rv < 16; rv++) {
        var ra = rv / 16 * Math.PI * 2;
        kit.piece(new T.SphereGeometry(0.018, 5, 3), at(px + Math.cos(ra) * 0.5, 0.95, cz2 + Math.sin(ra) * 0.5), '--rdr-panel', false);
      }
      kit.cyl(0.014, 0.014, 0.62, at(px + 0.36, 1.17, cz2 + 0.28, 0.6, 0, 0.55), '--rdr-timber', false, 6);
      kit.piece(new T.SphereGeometry(0.07, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), at(px + 0.55, 0.92, cz2 + 0.4), '--rdr-timber', false);
      var bsk = at(px + 0.2, 0, cz2 + 0.85, 0.4);
      kit.cyl(0.26, 0.21, 0.28, M(bsk, at(0, 0.14, 0)), '--rdr-leather', 0.012, 16);
      [0.06, 0.13, 0.2, 0.27].forEach(function (y) { kit.piece(new T.TorusGeometry(0.21 + y * 0.18, 0.008, 4, 20), M(bsk, at(0, y, 0, 0, Math.PI / 2)), '--rdr-timber', false); });
      kit.piece(new T.TorusGeometry(0.24, 0.016, 5, 16, Math.PI), M(bsk, at(0, 0.28, 0)), '--rdr-leather', false);
      ['--myth-amethyst-2', '--rdr-velvet', '--myth-chalk', '--rdr-leather'].forEach(function (ink, i) {
        kit.piece(bundle, M(bsk, at(-0.12 + i * 0.08, 0.3, (i % 2 - 0.5) * 0.08, 0, Math.PI / 2 - 0.3, 0.4 - i * 0.25)), ink, 0.008);
      });
      // The cauldron's lid, off on the floor beside it until somebody puts
      // it on.
      var lidOn = [], lidOff = [];
      var dome = new T.SphereGeometry(0.5, 20, 6, 0, Math.PI * 2, 0, Math.PI * 0.32);
      lidOn.push(kit.facets(dome.clone().scale(1, 0.55, 1), at(px, 0.95, cz2), '--rdr-stone'));
      lidOn.push(kit.facets(new T.TorusGeometry(0.05, 0.014, 6, 12), at(px, 1.27, cz2), '--rdr-brass'));
      lidOff.push(kit.facets(dome.clone().scale(1, 0.55, 1).rotateX(1.4), at(px - 0.85, 0.43, cz2 + 0.15, 1.2), '--rdr-stone'));
      lidOff.push(kit.facets(new T.TorusGeometry(0.05, 0.014, 6, 12), M(at(px - 0.85, 0.43, cz2 + 0.15, 1.2), at(0, 0.047, 0.29, 0, 1.4)), '--rdr-brass'));
      lidOn.forEach(function (m) { kit.hide(m, true); });
      box(1.7, 1.05, 0.5, at(cx2 - 0.6, 0.525, cz2 - 1.4), '--rdr-timber', 0.03);
      box(1.76, 0.04, 0.56, at(cx2 - 0.6, 1.07, cz2 - 1.4), '--rdr-brass', false);
      var cauldron = kit.lift(frame, '.myth-mix.myth-panel', { n: 1, w: 600, ww: 1.6, m: at(cx2 - 0.6, 1.09, cz2 - 1.4) });

      // THE CRYSTAL WHEEL on the right-hand wall, and the pouch to fill under it.
      var wg = at(W / 2 - 0.05, 0, -2.6, -Math.PI / 2);
      kit.cyl(0.85, 0.85, 0.08, M(wg, at(0, 2.75, 0.04, 0, Math.PI / 2)), '--rdr-timber', 0.02, 28);
      kit.cyl(0.7, 0.7, 0.09, M(wg, at(0, 2.75, 0.05, 0, Math.PI / 2)), '--rdr-panel', false, 28);
      kit.cyl(0.2, 0.2, 0.1, M(wg, at(0, 2.75, 0.06, 0, Math.PI / 2)), '--rdr-brass', false, 20);
      var STONES = ['--myth-amethyst', '--myth-amber', '--myth-chalk', '--myth-amethyst-2', '--myth-amber-2', '--rdr-brass'];
      for (var cw = 0; cw < 12; cw++) {
        var ca = cw / 12 * Math.PI * 2, st = new T.OctahedronGeometry(0.07, 0); st.scale(1, 1.4, 0.8);
        kit.piece(st, M(wg, at(Math.cos(ca) * 0.55, 2.75 + Math.sin(ca) * 0.55, 0.12, 0, 0, ca)), STONES[cw % STONES.length], 0.01);
      }
      var pouch = kit.lift(frame, '.myth-mix.myth-panel', { n: 0, w: 600, ww: 1.3, m: M(wg, at(0, 0.35, 0.06)) });
      // Her page's own scripts, run against the pouch and the cauldron here.
      kit.wire(frame, 'crystal-pouch.js');
      kit.wire(frame, 'herb-basket.js');

      // THE OLD BOOKS along the left-hand wall, a cornice over them and a
      // cluster of amber on top.
      var lb = at(-W / 2 + 0.25, 0, -3.0, Math.PI / 2);
      box(3.0, 2.6, 0.45, M(lb, at(0, 1.3, 0)), '--rdr-timber');
      box(3.12, 0.1, 0.52, M(lb, at(0, 2.65, 0.02)), '--rdr-timber', 0.015);
      cluster(M(lb, at(-0.9, 2.7, 0.02)), true, 70, 0.08);
      cluster(M(lb, at(1.0, 2.7, 0.02)), true, 71, 0.06);
      [0.5, 1.15, 1.8, 2.4].forEach(function (y, row) {
        box(2.84, 0.04, 0.38, M(lb, at(0, y - 0.28, 0.06)), '--rdr-panel', false);
        for (var bk = 0, x = -1.32; bk < 22 && x < 1.3; bk++) {
          var bw = 0.07 + hash(row, bk, 21) * 0.07, bh = 0.3 + hash(row, bk, 23) * 0.18;
          // Now and then a few lie flat, as old books do on a full shelf.
          if (row === 2 && bk === 9) {
            for (var lf = 0; lf < 3; lf++) box(0.42, 0.06, 0.26, M(lb, at(x + 0.21, y - 0.25 + lf * 0.065, 0.08)), ['--rdr-velvet', '--rdr-leather', '--myth-chalk'][lf], 0.006);
            x += 0.44; continue;
          }
          box(bw, bh, 0.28, M(lb, at(x + bw / 2, y - 0.26 + bh / 2, 0.08)), ['--rdr-leather', '--rdr-velvet', '--rdr-ember', '--rdr-brass', '--myth-chalk'][(row + bk) % 5], 0.008);
          x += bw + 0.01;
        }
      });

      // THE WHEEL OF THE YEAR, carved in timber high on the left-hand wall as
      // her drawing has it, its eight festivals as stones, amber and amethyst
      // in turn, and under it her wheel and the festivals in her own words.
      var yw = at(-W / 2 + 0.05, 0, -9.6, Math.PI / 2);
      kit.cyl(0.47, 0.47, 0.06, M(yw, at(0, 2.95, 0.03, 0, Math.PI / 2)), '--rdr-timber', 0.015, 28);
      kit.cyl(0.42, 0.42, 0.07, M(yw, at(0, 2.95, 0.04, 0, Math.PI / 2)), '--rdr-panel', false, 28);
      for (var sp = 0; sp < 4; sp++) box(0.022, 0.8, 0.02, M(yw, at(0, 2.95, 0.085, 0, 0, sp * Math.PI / 4)), '--rdr-brass', false, false);
      kit.cyl(0.07, 0.07, 0.1, M(yw, at(0, 2.95, 0.07, 0, Math.PI / 2)), '--rdr-brass', false, 14);
      for (var fe = 0; fe < 8; fe++) {
        var fa = fe / 8 * Math.PI * 2;
        lit[fe % 2 ? '--myth-amethyst' : '--myth-amber'].push([amberStone, M(yw, at(Math.sin(fa) * 0.36, 2.95 + Math.cos(fa) * 0.36, 0.1)).scale(new T.Vector3(0.045, 0.045, 0.03))]);
      }
      box(1.85, 1.45, 0.05, M(yw, at(0, 1.5, 0)), '--rdr-timber', 0.015);
      box(1.93, 0.04, 0.09, M(yw, at(0, 2.24, 0.02)), '--rdr-brass', false);
      var year = kit.lift(frame, '.myth-wheel', { w: 640, ww: 1.7, h: 500, m: M(yw, at(0, 0.85, 0.06)) });

      // STORY OR FACT? on the right-hand wall: her cards on a board, each
      // turning over as it does on her page.
      var fw = at(W / 2 - 0.05, 0, -9.6, -Math.PI / 2);
      box(2.05, 1.55, 0.05, M(fw, at(0, 1.52, 0)), '--rdr-timber', 0.015);
      box(2.13, 0.04, 0.09, M(fw, at(0, 2.31, 0.02)), '--rdr-brass', false);
      cluster(M(fw, at(-0.7, 2.33, 0.04)), false, 80, 0.06);
      cluster(M(fw, at(0.75, 2.33, 0.04)), false, 81, 0.05);
      var cards = kit.lift(frame, '.myth-cards', { w: 680, ww: 1.9, h: 520, m: M(fw, at(0, 0.8, 0.06)) });

      // AN OLD BOOK ON A READING STAND at the end of the shelf, turned to the
      // room: shut, its leather boards cornered in brass and clasped, until
      // somebody opens it, and then two pages of close black letter with a red
      // capital, the kind of book the stories on her page were first written
      // down in.
      var BOOK = 1.22, bs = at(-4.05, 0, -4.95, BOOK);
      kit.cyl(0.05, 0.07, 0.95, M(bs, at(0, 0.475, 0)), '--rdr-timber', 0.012, 8);
      [0, 1, 2].forEach(function (k) { box(0.42, 0.05, 0.07, M(bs, at(0, 0.03, 0, k * Math.PI / 3)), '--rdr-timber', 0.01); });
      var desk = M(bs, at(0, 1.0, 0, 0, 0.45));
      box(0.66, 0.035, 0.5, desk, '--rdr-timber', 0.012);
      box(0.66, 0.06, 0.03, M(desk, at(0, 0.035, 0.25)), '--rdr-timber', false);
      var bookShut = [], bookOpen = [];
      bookShut.push(kit.facets(new T.BoxGeometry(0.34, 0.09, 0.44), M(desk, at(0, 0.065, 0.0)), '--rdr-leather'));
      bookShut.push(kit.facets(new T.BoxGeometry(0.33, 0.07, 0.43), M(desk, at(0.012, 0.065, 0.0)), '--myth-chalk'));
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { bookShut.push(kit.facets(new T.BoxGeometry(0.05, 0.095, 0.05), M(desk, at(c[0] * 0.15, 0.065, c[1] * 0.2)), '--rdr-brass')); });
      bookShut.push(kit.facets(new T.BoxGeometry(0.06, 0.1, 0.03), M(desk, at(0.17, 0.065, 0)), '--rdr-brass'));
      bookShut.push(kit.facets(new T.CircleGeometry(0.06, 5), M(desk, at(0, 0.112, 0, 0, -Math.PI / 2)), '--myth-amber'));
      var leaves = [], letters = [];
      bookOpen.push(kit.facets(new T.BoxGeometry(0.62, 0.02, 0.46), M(desk, at(0, 0.03, 0)), '--rdr-leather'));
      [-1, 1].forEach(function (s) {
        var lm = M(desk, at(s * 0.15, 0.055, 0, 0, 0, s * 0.1));
        leaves.push([new T.BoxGeometry(0.28, 0.03, 0.42), lm]);
        for (var ln = 0; ln < 16; ln++) {
          if (s < 0 && ln < 3) continue;
          letters.push([new T.PlaneGeometry(0.22, 0.008), M(lm, at(0, 0.0155, -0.17 + ln * 0.022, 0, -Math.PI / 2))]);
        }
      });
      bookOpen.push(kit.facets(merged(leaves), ID, '--myth-chalk'));
      bookOpen.push(kit.flat(merged(letters), ID, '--rdr-stone'));
      bookOpen.push(kit.flat(new T.PlaneGeometry(0.05, 0.05), M(desk, at(-0.24, 0.0725, -0.16, 0, -Math.PI / 2, 0.1)), '--rdr-ember'));
      bookOpen.push(kit.facets(new T.BoxGeometry(0.012, 0.004, 0.2), M(desk, at(0.02, 0.07, 0.3)), '--rdr-velvet'));
      bookOpen.forEach(function (m) { kit.hide(m, true); });

      // A COAT ON A PEG by the arch, the leather side out, until somebody
      // turns it inside out to its velvet lining with its seams showing, as
      // her page says to do if the pixies lead you round in circles.
      box(1.4, 0.08, 0.05, at(2.4, 1.92, 0.93), '--rdr-timber', 0.01);
      [1.9, 2.4, 2.9].forEach(function (x) { kit.cyl(0.018, 0.022, 0.12, at(x, 1.9, 0.86, 0, Math.PI / 2), '--rdr-brass', false, 6); });
      var coatAt = at(2.4, 0, 0.82, Math.PI), coatOut = [], coatIn = [];
      function coat(ink, list, inside) {
        list.push(kit.facets(new T.CylinderGeometry(0.17, 0.33, 1.1, 14).scale(1, 1, 0.42), M(coatAt, at(0, 1.3, 0)), ink));
        [-1, 1].forEach(function (s) { list.push(kit.facets(new T.CylinderGeometry(0.06, 0.075, 0.7, 8), M(coatAt, at(s * 0.21, 1.38, 0.01, 0, 0, s * 0.12)), ink)); });
        list.push(kit.facets(new T.SphereGeometry(0.16, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.6).scale(1, 1.1, 0.8), M(coatAt, at(0, 1.78, -0.05, 0, 0.5)), ink));
        if (inside) {
          list.push(kit.facets(new T.BoxGeometry(0.012, 1.0, 0.02), M(coatAt, at(0, 1.3, 0.145)), '--rdr-ink-2'));
          [-1, 1].forEach(function (s) { list.push(kit.facets(new T.BoxGeometry(0.15, 0.012, 0.02), M(coatAt, at(s * 0.16, 1.82, 0.1, 0, 0, -s * 0.5)), '--rdr-ink-2')); });
          list.push(kit.facets(new T.BoxGeometry(0.08, 0.04, 0.01), M(coatAt, at(0, 1.74, 0.11)), '--myth-chalk'));
        } else {
          for (var tg = 0; tg < 4; tg++) list.push(kit.facets(new T.CylinderGeometry(0.012, 0.012, 0.07, 6).rotateZ(Math.PI / 2), M(coatAt, at(0.03, 1.66 - tg * 0.2, 0.15)), '--rdr-brass'));
          list.push(kit.facets(new T.BoxGeometry(0.1, 0.012, 0.02), M(coatAt, at(-0.16, 1.18, 0.14)), '--rdr-timber'));
          list.push(kit.facets(new T.BoxGeometry(0.1, 0.012, 0.02), M(coatAt, at(0.16, 1.18, 0.14)), '--rdr-timber'));
        }
      }
      // The amber round the arch throws a little of its own light on the peg.
      var archAmber = new T.PointLight(kit.col('--myth-amber'), 3.2, 3.6, 1.4);
      archAmber.position.set(1.7, 2.5, 0.2);
      kit.scene.add(archAmber);
      washAmber.push(archAmber);
      coat('--rdr-leather', coatOut, false);
      coat('--rdr-velvet', coatIn, true);
      coatIn.forEach(function (m) { kit.hide(m, true); });

      Object.keys(lit).forEach(function (ink) { if (lit[ink].length) kit.flat(merged(lit[ink]), ID, ink); });

      // THE LIGHT THROUGH THE STONES, switched: out, low or lit, and at MAX
      // the amber glows and the amethyst glints by themselves, as on her page.
      var amber = kit.lights({ label: 'The amber stones', max: true, twinkle: 'Let the amber glow', washes: washAmber,
        strings: [kit.bulbs(glintAmber, 0.028, ['--myth-amber-2', '--myth-amber'])],
        sets: [{ say: 'Amber', inks: ['--myth-amber', '--myth-amber-2'] }] });
      var amethyst = kit.lights({ label: 'The amethyst stones', max: true, twinkle: 'Let the amethyst glint', washes: washAmethyst,
        strings: [kit.bulbs(glintAmethyst, 0.026, ['--myth-amethyst-2', '--myth-amethyst'])],
        sets: [{ say: 'Amethyst', inks: ['--myth-amethyst', '--myth-amethyst-2'] }] });
      var lid = kit.press({ say: function () { return kit.hidden(lidOn[0]) ? 'Put the lid on the cauldron' : 'Lift the lid off the cauldron'; },
        at: [kit.touch(1.2, 1.3, 1.2, at(px, 0.65, cz2))],
        press: function () {
          var on = kit.hidden(lidOn[0]);
          lidOn.forEach(function (m) { kit.hide(m, !on); });
          lidOff.forEach(function (m) { kit.hide(m, on); });
          return on ? 'The lid is on the cauldron, its brass ring on top.' : 'The lid is off the cauldron and stood on the floor beside it.';
        } });
      var oldBook = kit.press({ say: function () { return kit.hidden(bookOpen[0]) ? 'Open the old book on its stand' : 'Shut the old book'; },
        at: [kit.touch(0.7, 0.4, 0.6, M(bs, at(0, 1.05, 0)))],
        press: function () {
          var open = kit.hidden(bookOpen[0]);
          bookOpen.forEach(function (m) { kit.hide(m, !open); });
          bookShut.forEach(function (m) { kit.hide(m, open); });
          return open ? 'The old book lies open on its stand: two pages of close black letter, a red capital at the top.' : 'The old book is shut and clasped again.';
        } });
      var turnCoat = kit.press({ say: function () { return kit.hidden(coatIn[0]) ? 'Turn the coat inside out' : 'Turn the coat right side out'; },
        at: [kit.touch(0.8, 1.2, 0.5, M(coatAt, at(0, 1.35, 0)))],
        press: function () {
          var inside = kit.hidden(coatIn[0]);
          coatIn.forEach(function (m) { kit.hide(m, !inside); });
          coatOut.forEach(function (m) { kit.hide(m, inside); });
          return inside ? 'The coat on the peg is inside out, its velvet lining and seams showing: the old answer, her page says, if the pixies lead you round in circles.' : 'The coat is right side out again, leather and brass toggles.';
        } });

      var stops = [
        { name: 'just through the Alchemist’s Arch', x: 0, z: 0.2, yaw: 0, acts: [amber, amethyst] },
        { name: 'at the Stones, with the sun to turn over them', x: sx + 0.3, z: sz + 2.1, yaw: -0.12, frame: sun.el },
        { name: 'at the cauldron, with the herbs to tip in and her herbs drying over it', x: cx2 - 0.3, z: cz2 + 1.3, yaw: 0, frame: cauldron.el, acts: [lid] },
        { name: 'at the Crystal Wheel, with a pouch to fill under it', x: W / 2 - 2.6, z: -2.6, yaw: -Math.PI / 2, frame: pouch.el, acts: [amethyst] },
        { name: 'at the old books along the wall', x: -W / 2 + 2.6, z: -3.0, yaw: Math.PI / 2, acts: [amber] },
        { name: 'at the old book on its reading stand, at the end of the shelf', x: -4.05 + Math.sin(BOOK) * 1.55, z: -4.95 + Math.cos(BOOK) * 1.55, yaw: BOOK, pitch: -0.38, acts: [oldBook] },
        { name: 'at the Wheel of the Year, carved on the left-hand wall, with her festivals under it', x: -2.1, z: -9.4, yaw: Math.PI / 2, frame: year.el },
        { name: 'at her Story or Fact cards, on the right-hand wall', x: 2.1, z: -9.4, yaw: -Math.PI / 2, frame: cards.el },
        { name: 'at the far wall, with her room’s own page on it', x: 0, z: back + 3.0, yaw: 0, page: kit.page, frame: frame },
        { name: 'looking back at the Alchemist’s Arch, amethyst up its sides and the four elements in its keystone', x: 0, z: -3.6, yaw: Math.PI, acts: [amber, amethyst] },
        { name: 'at the coat on its peg by the arch', x: 2.0, z: -1.5, yaw: Math.PI + 0.12, pitch: 0.02, acts: [turnCoat] }
      ];

      return {
        start: { x: 0, z: 0.2, yaw: 0 },
        bounds: { x: [-W / 2 + 0.9, W / 2 - 0.9], z: [back + 2.6, 0.2] },
        stops: stops,
        // Offered in a VR headset, as the yurt it opens off is (Ryan's ask,
        // 2026-11-07), so you walk in from the yurt without leaving the
        // headset. On a screen this changes nothing. What is lifted off her
        // page is not in the headset, which shows only the picture.
        vr: true
      };
    }
  };
})();

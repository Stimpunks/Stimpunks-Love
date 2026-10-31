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

   THREE THINGS ARE HER PAGE'S OWN, lifted off it by Cel Street's kit.lift():
   the Stones turning to the sun at a press, the pouch to fill under the
   Crystal Wheel, and the cauldron. crystal-pouch.js and herb-basket.js, which
   her page loads, are run against the copies, so the pouch and the cauldron
   work here as they do there, sending and keeping nothing.

   NOTHING MOVES. Every colour is one her rooms declare, by name. It keeps
   nothing, sends nothing and fetches nothing; her page arrives through Cel
   Street's screen(). tools/make-cel-street.py holds each of those.
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
        return out;
      }
      var ID = new T.Matrix4();

      // THE LIGHT, through stone: amber from the left wall, amethyst from the right.
      kit.scene.background = kit.col('--rdr-stone');
      kit.scene.add(new T.HemisphereLight(kit.col('--rdr-ink-2'), kit.col('--rdr-stone'), 0.9));
      [[-W / 2 + 0.5, '--myth-amber'], [W / 2 - 0.5, '--myth-amethyst']].forEach(function (l) {
        [-3, -8].forEach(function (z) {
          var p = new T.PointLight(kit.col(l[1]), 14, 11, 1.2);
          p.position.set(l[0], 2.5, z);
          kit.scene.add(p);
        });
      });

      // THE ROOM: stone floor, claret walls, a panelled ceiling, a velvet rug.
      box(W, 0.1, D + 2, at(0, -0.05, -D / 2 + 1), '--rdr-stone', false, false);
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
      box(5.2, 0.035, 6.0, at(0, 0.02, -6.2), '--rdr-panel', false, false);

      // THE STONES IN THE WALLS: amber clusters set in the left, amethyst in
      // the right, each a few crystals catching their own light.
      var crystal = new T.OctahedronGeometry(1, 0); crystal.scale(0.5, 1.3, 0.5);
      var lit = { '--myth-amber': [], '--myth-amber-2': [], '--myth-amethyst': [], '--myth-amethyst-2': [] };
      [[-1, '--myth-amber', '--myth-amber-2'], [1, '--myth-amethyst', '--myth-amethyst-2']].forEach(function (side, si) {
        for (var c = 0; c < 9; c++) {
          var cz = -1.2 - c * 1.25, cy = 0.6 + hash(c, si, 1) * 2.4;
          for (var k = 0; k < 5; k++) {
            var s = 0.05 + hash(c, k, si + 3) * 0.08;
            var m = at(side[0] * (W / 2 - 0.02), cy + (hash(c, k, 2) - 0.5) * 0.3, cz + (hash(c, k, 4) - 0.5) * 0.35, 0, 0, side[0] * (0.6 + (hash(c, k, 5) - 0.5) * 1.4));
            lit[k % 3 ? side[1] : side[2]].push([crystal, M(m, at(0, 0, 0, 0, 0, 0)).scale(new T.Vector3(s, s, s))]);
          }
        }
      });
      Object.keys(lit).forEach(function (ink) { if (lit[ink].length) kit.flat(merged(lit[ink]), ID, ink); });

      // THE ARCH you came through, grey stone set with amber and amethyst.
      var ag = at(0, 0, 0.9);
      [-1, 1].forEach(function (s) { box(0.55, 2.5, 0.6, M(ag, at(s * 1.25, 1.25, 0)), '--myth-chalk', 0.03); });
      kit.piece(new T.TorusGeometry(1.25, 0.28, 8, 18, Math.PI), M(ag, at(0, 2.5, 0)), '--myth-chalk', 0.03);
      box(W, H - 3.0, 0.3, at(0, 3.0 + (H - 3.0) / 2, 1.1), '--rdr-wall');
      [-1, 1].forEach(function (s) { box((W - 3.1) / 2, 3.0, 0.3, at(s * (W + 3.1) / 4, 1.5, 1.1), '--rdr-wall'); });
      var nug = [];
      for (var q = 0; q < 14; q++) {
        var a = q / 13 * Math.PI, r = 1.25;
        nug.push([new T.DodecahedronGeometry(0.07 + hash(q, 7, 1) * 0.04, 0), M(ag, at(Math.cos(a) * r, 2.5 + Math.sin(a) * r, -0.3))]);
      }
      kit.flat(merged(nug.filter(function (x, i) { return i % 2; })), ID, '--myth-amber-2');
      kit.flat(merged(nug.filter(function (x, i) { return !(i % 2); })), ID, '--myth-amethyst-2');

      var stops = [{ name: 'just through the Alchemist’s Arch', x: 0, z: -0.4, yaw: 0 }];

      // THE STONES, a model on a plinth, and the sun turning over them: her
      // page's own, at a press.
      var sx = -2.7, sz = -6.6, mx = sx - 1.0; // the model stands beside the lectern, not in front of it
      kit.cyl(1.0, 1.1, 0.8, at(mx, 0.4, sz), '--rdr-timber', 0.03, 24);
      kit.cyl(1.02, 1.02, 0.04, at(mx, 0.82, sz), '--rdr-panel', false, 24);
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
      // A lectern behind the model, and the turning sun standing on it.
      box(1.7, 1.05, 0.5, at(sx + 0.6, 0.525, sz - 1.4), '--rdr-timber', 0.03);
      var frame = null;
      var sw = 3.0, sh = sw * 800 / 1180, sy = 0.45 + sh / 2;
      var pg = at(0, 0, back + 0.02);
      [-1, 1].forEach(function (s) {
        var cx = s * (sw / 2 + 1.5);
        box(2.0, 2.9, 0.45, M(pg, at(cx, 1.45, 0.22)), '--rdr-timber');
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
      frame = kit.screen(1180, 800, sw, M(pg, at(0, sy, 0.04)), 'Myths & Legends’ own page, on the far wall between two cases of old books');
      stops.push({ name: 'at the far wall, with her room’s own page on it', x: 0, z: back + 3.0, yaw: 0, page: kit.page, frame: frame });

      var sun = kit.lift(frame, '.myth-sun', { w: 560, ww: 1.6, m: at(sx + 0.6, 1.07, sz - 1.4) });
      stops.splice(1, 0, { name: 'at the Stones, with the sun to turn over them', x: sx + 0.3, z: sz + 1.3, yaw: 0, frame: sun.el });

      // THE CAULDRON on its three legs, and the herbs to tip in, on a lectern.
      var cx2 = 2.7, cz2 = -6.6, px = cx2 + 1.1; // the pot beside the lectern
      var pot = new T.SphereGeometry(0.55, 18, 12, 0, Math.PI * 2, Math.PI * 0.32, Math.PI * 0.68);
      kit.piece(pot, at(px, 0.72, cz2), '--rdr-stone', 0.03);
      kit.piece(new T.TorusGeometry(0.47, 0.05, 6, 20), at(px, 1.14, cz2, 0, Math.PI / 2), '--rdr-stone', 0.015);
      for (var lg = 0; lg < 3; lg++) {
        var la = lg / 3 * Math.PI * 2;
        box(0.06, 0.4, 0.06, at(px + Math.cos(la) * 0.35, 0.2, cz2 + Math.sin(la) * 0.35), '--rdr-stone', 0.01);
      }
      kit.cyl(0.42, 0.42, 0.02, at(px, 1.08, cz2), '--rdr-velvet', false, 20);
      box(1.7, 1.05, 0.5, at(cx2 - 0.6, 0.525, cz2 - 1.4), '--rdr-timber', 0.03);
      var cauldron = kit.lift(frame, '.myth-mix.myth-panel', { n: 1, w: 600, ww: 1.6, m: at(cx2 - 0.6, 1.07, cz2 - 1.4) });
      stops.splice(2, 0, { name: 'at the cauldron, with the herbs to tip in', x: cx2 - 0.3, z: cz2 + 1.3, yaw: 0, frame: cauldron.el });

      // THE CRYSTAL WHEEL on the right-hand wall, and the pouch to fill under it.
      var wg = at(W / 2 - 0.05, 0, -2.6, -Math.PI / 2);
      kit.cyl(0.85, 0.85, 0.08, M(wg, at(0, 2.75, 0.04, 0, Math.PI / 2)), '--rdr-timber', 0.02, 28);
      kit.cyl(0.7, 0.7, 0.09, M(wg, at(0, 2.75, 0.05, 0, Math.PI / 2)), '--rdr-panel', false, 28);
      var STONES = ['--myth-amethyst', '--myth-amber', '--myth-chalk', '--myth-amethyst-2', '--myth-amber-2', '--rdr-brass'];
      for (var cw = 0; cw < 12; cw++) {
        var ca = cw / 12 * Math.PI * 2, st = new T.OctahedronGeometry(0.07, 0); st.scale(1, 1.4, 0.8);
        kit.piece(st, M(wg, at(Math.cos(ca) * 0.55, 2.75 + Math.sin(ca) * 0.55, 0.12, 0, 0, ca)), STONES[cw % STONES.length], 0.01);
      }
      var pouch = kit.lift(frame, '.myth-mix.myth-panel', { n: 0, w: 600, ww: 1.3, m: M(wg, at(0, 0.35, 0.06)) });
      stops.splice(3, 0, { name: 'at the Crystal Wheel, with a pouch to fill under it', x: W / 2 - 2.6, z: -2.6, yaw: -Math.PI / 2, frame: pouch.el });
      // Her page's own scripts, run against the pouch and the cauldron here.
      kit.wire(frame, 'crystal-pouch.js');
      kit.wire(frame, 'herb-basket.js');

      // THE OLD BOOKS along the left-hand wall.
      var lb = at(-W / 2 + 0.25, 0, -3.0, Math.PI / 2);
      box(3.0, 2.6, 0.45, M(lb, at(0, 1.3, 0)), '--rdr-timber');
      [0.5, 1.15, 1.8, 2.4].forEach(function (y, row) {
        box(2.84, 0.04, 0.38, M(lb, at(0, y - 0.28, 0.06)), '--rdr-panel', false);
        for (var bk = 0, x = -1.32; bk < 22 && x < 1.3; bk++) {
          var bw = 0.07 + hash(row, bk, 21) * 0.07, bh = 0.3 + hash(row, bk, 23) * 0.18;
          box(bw, bh, 0.28, M(lb, at(x + bw / 2, y - 0.26 + bh / 2, 0.08)), ['--rdr-leather', '--rdr-velvet', '--rdr-ember', '--rdr-brass', '--myth-chalk'][(row + bk) % 5], 0.008);
          x += bw + 0.01;
        }
      });
      stops.splice(4, 0, { name: 'at the old books along the wall', x: -W / 2 + 2.6, z: -3.0, yaw: Math.PI / 2 });

      return {
        start: { x: 0, z: -0.4, yaw: 0 },
        bounds: { x: [-W / 2 + 0.9, W / 2 - 0.9], z: [back + 2.6, 0.2] },
        stops: stops
      };
    }
  };
})();

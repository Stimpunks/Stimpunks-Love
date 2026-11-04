/* =============================================================================
   Wide-Spread Chaos Gardens, walked into on Cel Street, east of the stile in
   Nature's Contribution. Ryan's ask, 2026-11-03: the land's places.

   IT IS THE GARDEN'S OWN WORLD (§111): A CLEAR, WINDY DAY. Not a cloud in the
   sky, plain daylight from it, nothing lit through anything, and a wind
   blowing across the garden from the left as you come in: every stem, every
   flower on top of it, every blade of grass and every bit of seed still in
   the air leans the same way. The lean is in the geometry, each stem set at
   its angle once and drawn there, and nothing in it ever moves. Nothing is in
   a row and nothing is on a path: the garden is thrown out of a fixed seed,
   the same garden every build, flowers of every colour the page declares on
   stems of every height, daisies, cups, spikes and round heads, salad and
   peas among them, with a bench in the middle for anybody who comes to sit.
   The page's plant labels stand on stakes at different heights, because
   nothing here is in a row.

   THE COLLISIONS ARE §111's: Swaying Sweetgrass is the other meadow and it is
   LIGHT, a low sun behind the grass and every blade lit through; here it is
   plain daylight and the wind makes the picture. The Garden is the other
   garden and it is ORDER, beds in rows under leaves. The land this garden
   stands on is under broken cloud; there is no cloud here, and if one ever
   drifts in it has become the land with flowers on it, and this room moves.

   NO PLANT IS NAMED BY ANYTHING BUT ITS PAGE: this file names no plant at
   all, Latin or otherwise; every name in the room is the page's own, lifted
   onto its labels. NOTHING MOVES, at any setting. The rack's films play
   through rack.js, which the page loads itself, and nothing loads until
   somebody presses. Every colour is one §111 declares, by name. It keeps
   nothing, sends nothing and fetches nothing; its page arrives through Cel
   Street's screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  // The seed the garden is thrown from: the same garden every build.
  function hash(i, j, k) {
    var n = Math.imul(i + 7, 374761393) ^ Math.imul(j + 29, 668265263) ^ Math.imul(k + 31, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['wide-spread-chaos.html'] = {
    name: 'Wide-Spread Chaos Gardens',
    from: 'natures-contribution.html',
    faces: ['"Gluten"'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var WIND = new T.Vector3(1, 0, 0);    // the way everything leans
      var BENCH = { x: 0.8, z: -9.5 };
      var head = new T.SphereGeometry(1, 10, 8);
      var SHED = { x: -6.5, z: -18.5 };

      // A CLEAR SKY, and plain daylight out of it, high and from behind you on
      // the left, so the shadows are short.
      kit.scene.background = kit.col('--wsc-sky');
      kit.scene.add(new T.HemisphereLight(kit.col('--wsc-sky'), kit.col('--wsc-ground'), 1.6));
      var sun = new T.DirectionalLight(kit.col('--wsc-fluff'), 1.9);
      sun.position.set(-14, 40, 12);
      sun.target.position.set(0, 0, -8);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      sun.shadow.camera.left = -24; sun.shadow.camera.right = 24;
      sun.shadow.camera.top = 24; sun.shadow.camera.bottom = -24;
      sun.shadow.camera.near = 1; sun.shadow.camera.far = 90;
      sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
      kit.scene.add(sun, sun.target);

      // THE GROUND, running on past the garden.
      box(100, 0.1, 100, at(0, -0.05, -10), '--wsc-ground', false, false);

      // Places kept clear of plants: where you stand to read, the bench, the
      // shed, and where you come in.
      var clear = [[0, 3, 2.2], [-2.4, -3.8, 1.8], [BENCH.x, BENCH.z, 2.0], [SHED.x, SHED.z + 1.4, 3.6]];
      function free(x, z) {
        for (var i = 0; i < clear.length; i++) if (Math.hypot(x - clear[i][0], z - clear[i][1]) < clear[i][2]) return false;
        return true;
      }

      // THE SEED STILL IN THE AIR: little tufts at every height, each with a
      // short wisp trailing upwind behind it, where the wind has them.
      for (var s = 0; s < 110; s++) {
        var sx = -15 + hash(s, 9, 1) * 30, sy = 0.9 + hash(s, 9, 2) * 4.2, sz = 3 - hash(s, 9, 3) * 26;
        var puff = head.clone(); puff.scale(0.035, 0.03, 0.03);
        kit.piece(puff, at(sx, sy, sz), '--wsc-fluff', false);
        kit.piece(new T.CylinderGeometry(0.004, 0.004, 0.14, 3), at(sx - 0.08, sy - 0.01, sz, 0, 0, Math.PI / 2 - 0.12), '--wsc-fluff', false);
      }

      // THE BENCH in the middle, for anybody who comes to sit.
      var bg = at(BENCH.x, 0, BENCH.z, 0.35);
      box(1.8, 0.08, 0.42, M(bg, at(0, 0.46, 0)), '--wsc-label', 0.01);
      box(1.8, 0.36, 0.06, M(bg, at(0, 0.72, -0.2)), '--wsc-label', 0.01);
      [-0.78, 0.78].forEach(function (lx) { [-0.16, 0.16].forEach(function (lz) { box(0.06, 0.46, 0.06, M(bg, at(lx, 0.23, lz)), '--wsc-rim', false); }); });

      // THE SEED SHED at the back, white with a blue roof: its screen on the
      // front, dark until somebody presses something.
      box(4.6, 2.5, 3.2, at(SHED.x, 1.25, SHED.z), '--wsc-label', 0.014);
      [-1, 1].forEach(function (e) { box(2.7, 0.12, 3.6, at(SHED.x + e * 1.15, 2.85, SHED.z, 0, 0, -e * 0.42), '--wsc-rim', 0.01); });

      // THE NAME, on a white board on two stakes where you come in, in the
      // garden's own bouncy letters.
      var nameMap = kit.paper(1100, 240, function (c, w, h) {
        c.fillStyle = kit.ink('--wsc-label'); c.fillRect(0, 0, w, h);
        c.fillStyle = kit.ink('--wsc-link'); c.textAlign = 'center'; c.textBaseline = 'middle';
        var size = 110;
        c.font = '700 ' + size + 'px "Gluten"';
        while (c.measureText('Wide-Spread Chaos Gardens').width > w - 70 && size > 40) { size -= 4; c.font = '700 ' + size + 'px "Gluten"'; }
        c.fillText('Wide-Spread Chaos Gardens', w / 2, h / 2 + 6);
      });
      var ng = at(-2.4, 0, -3.8, 0.33);
      [-1.4, 1.4].forEach(function (e) { box(0.08, 1.7, 0.08, M(ng, at(e, 0.85, -0.05)), '--wsc-rim', false); });
      kit.sheet(nameMap, 3.1, 0.68, M(ng, at(0, 1.45, 0)));

      // BOARDS for the page's words: white boards on blue stakes, each
      // standing where it landed and at its own height, never in a row. A
      // board shows its words only while you stand at it.
      function zone(x, z) { return [x - 2.6, x + 2.6, z - 2.4, z + 2.4]; }
      function board(x, z, ry, wide, tall, low) {
        var bm = at(x, 0, z, ry);
        clear.push([x, z, 1.3]);
        [-1, 1].forEach(function (e) { box(0.07, low + tall, 0.07, M(bm, at(e * (wide / 2 + 0.04), (low + tall) / 2, -0.05)), '--wsc-rim', false); });
        box(wide + 0.14, tall + 0.08, 0.04, M(bm, at(0, low + tall / 2, -0.04)), '--wsc-rim', 0.008);
        return M(bm, at(0, low, 0.01));
      }
      function stake(x, z, ry, low) {
        var sm = at(x, 0, z, ry);
        clear.push([x, z, 1.0]);
        box(0.08, low, 0.03, M(sm, at(0, low / 2, -0.03)), '--wsc-label', 0.006);
        return M(sm, at(0, low, 0.01));
      }
      // Each stop stands two metres off its board, facing it.
      function off(x, z, ry, d) { return { x: x + Math.sin(ry) * d, z: z + Math.cos(ry) * d, yaw: ry }; }

      // THE ROOM'S OWN PAGE, on a board on the right where you come in.
      var pw = 2.6, ph = pw * 800 / 1180, py = 0.75 + ph / 2;
      var pg = at(5.4, 0, -0.4, -0.8);
      clear.push([5.4, -0.4, 1.6]);
      box(pw + 0.16, ph + 0.16, 0.05, M(pg, at(0, py, -0.04)), '--wsc-label', 0.01);
      [-1, 1].forEach(function (e) { box(0.08, py + ph / 2, 0.08, M(pg, at(e * (pw / 2 + 0.05), (py + ph / 2) / 2, -0.09)), '--wsc-rim', false); });
      var ps = off(5.4, -0.4, -0.8, 2.2);
      var page = kit.screen(1180, 800, pw, M(pg, at(0, py, 0)), 'Wide-Spread Chaos Gardens’ own page, on a board where you come in', zone(ps.x, ps.z));

      // The words, each on its own board where it landed.
      var spots = [
        { sel: '.wsc-lede', x: -4.2, z: -2.6, ry: 0.9, wide: 1.9, tall: 1.5, low: 0.6, w: 720, ww: 1.8, name: 'at the board on the left: a clear, windy day, and everything leaning' },
        { sel: '.wsc-part', n: 1, x: 4.6, z: -5.4, ry: -0.7, wide: 2.0, tall: 1.95, low: 0.45, w: 760, h: 800, ww: 1.9, name: 'at the board on the right: what chaos gardening is, and what it is not' },
        { sel: '.wsc-quote', n: 2, x: -5.4, z: -8.8, ry: 1.2, wide: 1.6, tall: 1.0, low: 0.8, w: 640, ww: 1.5, name: 'at the board on the left: what a cheap mix can carry' },
        { sel: '.wsc-gives', x: 5.6, z: -12.6, ry: -1.0, wide: 1.9, tall: 1.6, low: 0.55, w: 720, ww: 1.8, name: 'at the board on the right: what the garden gives' },
        { sel: '.wsc-rules', x: 2.2, z: -15.4, ry: -0.25, wide: 1.7, tall: 1.2, low: 0.7, w: 680, ww: 1.6, name: 'at the board near the back: in the garden' }
      ];
      var lifts = spots.map(function (sp) {
        var o = { w: sp.w, ww: sp.ww, m: board(sp.x, sp.z, sp.ry, sp.wide, sp.tall, sp.low) };
        if (sp.n) o.n = sp.n;
        if (sp.h) o.h = sp.h;
        sp.stand = off(sp.x, sp.z, sp.ry, 2.0);
        o.zone = zone(sp.stand.x, sp.stand.z);
        return kit.lift(page, sp.sel, o);
      });

      // THE PAGE'S PLANT LABELS, each on its own stake at its own height, round
      // the bench: what is eaten, what flowers, and what is never in the mix.
      var labels = [
        { n: 0, x: -1.4, z: -8.2, ry: 0.7, low: 0.55, name: 'by the bench, at the label for what is grown to eat' },
        { n: 1, x: 2.9, z: -8.3, ry: -0.6, low: 0.85, name: 'by the bench, at the label for what is grown to flower' },
        { n: 2, x: 0.9, z: -11.9, ry: 0.15, low: 0.4, name: 'behind the bench, at the label for what is never in the mix' }
      ].map(function (l) {
        var it = kit.lift(page, '.wsc-label', { n: l.n, w: 440, ww: 1.2, m: stake(l.x, l.z, l.ry, l.low), zone: zone(off(l.x, l.z, l.ry, 1.7).x, off(l.x, l.z, l.ry, 1.7).z) });
        l.stand = off(l.x, l.z, l.ry, 1.7);
        l.el = it.el;
        return l;
      });

      // THE SHED'S SCREEN on its front wall, what is on it and the way back
      // under it, and the rack on a board beside the shed.
      var SF = SHED.z + 1.62;
      var Z_SHED = [SHED.x - 4.6, SHED.x + 6.0, SF - 0.2, SF + 4.6];
      var screen = kit.lift(page, '.wsc-screen', { w: 820, ww: 2.6, m: at(SHED.x, 0.95, SF), zone: Z_SHED });
      var now = kit.lift(page, '.wsc-screen__now', { w: 760, ww: 2.4, m: at(SHED.x, 0.55, SF), zone: Z_SHED });
      kit.lift(page, '.wsc-screen__back', { w: 640, ww: 1.9, m: at(SHED.x, 0.15, SF), zone: Z_SHED });
      var rack = kit.lift(page, '.wsc-rack', { w: 820, h: 860, ww: 2.3, m: board(SHED.x + 4.0, SHED.z + 1.3, -0.2, 2.4, 2.45, 0.3), zone: Z_SHED });
      kit.wire(page, 'rack.js');

      // Keep the ground clear where you stand to read each board.
      clear.push([ps.x, ps.z, 0.9]);
      spots.forEach(function (sp) { clear.push([sp.stand.x, sp.stand.z, 0.9]); });
      labels.forEach(function (l) { clear.push([l.stand.x, l.stand.z, 0.8]); });

      // A STEM, set at its lean once: the wind leans it towards +x, a little
      // more the taller it is. Returns where its top is.
      function stem(x, z, h, lean, ink, r) {
        var top = new T.Vector3(x, 0, z).add(new T.Vector3(0, h, 0).applyAxisAngle(new T.Vector3(0, 0, 1), -lean));
        var mid = new T.Vector3(x, 0, z).add(top).multiplyScalar(0.5);
        cyl(r || 0.012, (r || 0.012) * 1.4, h, at(mid.x, mid.y, mid.z, 0, 0, -lean), ink || '--wsc-stem', false, 5);
        return top;
      }
      var INKS = ['--wsc-red', '--wsc-orange', '--wsc-yellow', '--wsc-pink', '--wsc-blue', '--wsc-violet', '--wsc-white'];

      // THE FLOWERS: thrown, not planted. Every kind turned the way the wind
      // turns it.
      function flower(i, x, z) {
        var kind = Math.floor(hash(i, 1, 1) * 5), ink = INKS[Math.floor(hash(i, 2, 1) * INKS.length)];
        var h = 0.35 + hash(i, 3, 1) * 1.05, lean = 0.22 + hash(i, 4, 1) * 0.2 + h * 0.08;
        var top = stem(x, z, h, lean);
        // A leaf or two partway up, pointing downwind.
        for (var l = 0; l < 2; l++) {
          var f = 0.25 + l * 0.3, lx = x + (top.x - x) * f, ly = top.y * f;
          var leaf = head.clone(); leaf.scale(0.09, 0.02, 0.035);
          kit.piece(leaf, at(lx + 0.06, ly, z + (l ? 0.02 : -0.02), (l ? 0.3 : -0.3), 0, -0.5 - lean), '--wsc-leaf', false);
        }
        if (kind === 0) {
          // A daisy: a ring of petals tipped to face downwind, and its eye.
          var dg = at(top.x, top.y, top.z, 0, 0, -lean - 0.6);
          var petals = new T.CylinderGeometry(0.15 + hash(i, 5, 1) * 0.06, 0.15, 0.018, 12);
          kit.piece(petals, dg, ink, false);
          kit.piece(new T.CylinderGeometry(0.055, 0.055, 0.034, 10), M(dg, at(0, 0.016, 0)), '--wsc-eye', false);
        } else if (kind === 1) {
          // A cup, open to the sky and tipped with its stem.
          kit.piece(new T.CylinderGeometry(0.13, 0.04, 0.16, 10, 1, true), at(top.x, top.y + 0.06, top.z, 0, 0, -lean), ink, 0.006);
        } else if (kind === 2) {
          // A spike: buds climbing the top of the stem, the line of them bent
          // with it.
          for (var b = 0; b < 6; b++) {
            var t = b / 6, bud = head.clone(); bud.scale(0.055 - t * 0.02, 0.045, 0.055 - t * 0.02);
            var bp = new T.Vector3(0, 0.085 * b, 0).applyAxisAngle(new T.Vector3(0, 0, 1), -lean - 0.15).add(top);
            kit.piece(bud, at(bp.x, bp.y, bp.z), ink, false);
          }
        } else if (kind === 3) {
          // A round head.
          var rg = head.clone(); var rr = 0.08 + hash(i, 6, 1) * 0.06; rg.scale(rr, rr, rr);
          kit.piece(rg, at(top.x, top.y + rr * 0.6, top.z), ink, 0.006);
        } else {
          // Something to eat among them: a leafy rosette low on the ground.
          for (var q = 0; q < 5; q++) {
            var lg = head.clone(); lg.scale(0.13, 0.03, 0.06);
            kit.piece(lg, at(x + Math.cos(q * 1.26) * 0.08 + 0.04, 0.06 + (q % 2) * 0.03, z + Math.sin(q * 1.26) * 0.08, q * 1.26, 0, -0.4), '--wsc-leaf', 0.004);
          }
        }
      }
      var placed = 0;
      for (var i = 0; placed < 900 && i < 3600; i++) {
        var fx = -15 + hash(i, 7, 1) * 30, fz = 3.6 - hash(i, 7, 2) * 27;
        if (!free(fx, fz)) continue;
        flower(i, fx, fz); placed++;
      }

      // THE GRASS, every blade leaning the same way.
      var blade = new T.ConeGeometry(0.02, 0.36, 3);
      for (var g = 0; g < 520; g++) {
        var gx = -16 + hash(g, 8, 1) * 32, gz = 4 - hash(g, 8, 2) * 30;
        if (!free(gx, gz)) continue;
        for (var bl = 0; bl < 3; bl++) {
          var gl = 0.3 + hash(g, 8, bl + 3) * 0.3;
          kit.piece(blade.clone(), at(gx + (bl - 1) * 0.05 + 0.05, 0.17, gz + (bl % 2) * 0.04, 0, 0, -gl), '--wsc-grass', false);
        }
      }

      var stops = [
        { name: 'where you come in from the stile, the whole garden leaning away from you on the wind', x: 0, z: 3.0, yaw: 0, pitch: 0.12 },
        { name: 'at the board on the right, with the garden’s own page on it', x: ps.x, z: ps.z, yaw: ps.yaw, pitch: 0.04, page: kit.page, frame: page }
      ];
      spots.forEach(function (sp, k) { stops.push({ name: sp.name, x: sp.stand.x, z: sp.stand.z, yaw: sp.stand.yaw, pitch: 0.04, frame: lifts[k].el }); });
      stops.push({ name: 'on the bench in the middle, the wind from your left and the flowers leaning off to your right', x: BENCH.x - 0.2, z: BENCH.z + 0.9, yaw: 0.35, pitch: 0.05 });
      labels.forEach(function (l) { stops.push({ name: l.name, x: l.stand.x, z: l.stand.z, yaw: l.stand.yaw, pitch: -0.12, frame: l.el }); });
      stops.push(
        { name: 'down among the flowers, looking along them the way the wind is going', x: -6, z: -4, yaw: RIGHT, pitch: -0.25 },
        { name: 'looking up at the seed blowing across the clear sky', x: 3, z: -3, yaw: -0.4, pitch: 0.75 },
        { name: 'at the seed shed, before its screen, dark until somebody presses something', x: SHED.x, z: SF + 3.2, yaw: 0, pitch: -0.04, frame: screen.el },
        { name: 'under the shed’s screen: what is on it, and the way back', x: SHED.x, z: SF + 2.4, yaw: 0, pitch: -0.3, frame: now.el },
        { name: 'at the rack beside the seed shed: films about chaos gardening', x: SHED.x + 4.0 + Math.sin(-0.2) * 2.4, z: SHED.z + 1.3 + Math.cos(-0.2) * 2.4, yaw: -0.2, pitch: 0.02, frame: rack.el }
      );

      return {
        start: { x: 0, z: 3.0, yaw: 0 },
        bounds: { x: [-14, 14], z: [SF + 1.6, 3.6] },
        stops: stops
      };
    }
  };
})();

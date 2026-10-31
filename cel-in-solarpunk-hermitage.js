/* =============================================================================
   The Solarpunk Hermitage, walked into on Cel Street. Ryan's ask, 2026-10-31:
   pitch 03 on the campgrounds, through its post in the field, and then inside:
   the cave, the campfire and the watering hole, and the television you can
   sit down in front of and watch.

   IT IS THE HERMITAGE'S WORLD AND NOBODY ELSE'S (§19), and the first DAYLIT
   room on the street: you walk out of the field's cold dusk into full morning
   sun, the sun low in the east so every shadow falls long and sideways off it.
   The cabin stands on its wheels with its roof full of panels catching it, its
   aerial up, three sunflowers at the door, a rain butt and a bed of seedlings,
   and the room's own page in its big window, which is how you see in.

   INSIDE ARE DAVID THORNBURG'S THREE, as the page names them. THE CAVE at the
   far end is velvet curtain on every side, no wood, no corners, evenly lit at
   reading brightness by what the panels pay for, candles as ornaments only;
   its shelves and its speaker are the page's own, lifted off it. THE CAMPFIRE
   in the middle is green shag, three bean bags, a coffee table with the remote
   on it and one television the chairs are all pointed at, and the television,
   the remote, the channel listing and the long stereo behind the chairs are
   the page's own too, wired to hermitage.js, so the set keeps its promise
   here: tuning while it is off is silent, and nothing plays until you press.
   THE WATERING HOLE at the other end is three benches in the daylight from the
   windows: the herbarium, the solar bench with its films lifted off the page,
   and the Star Stuff table.

   NOTHING MOVES by itself. Every colour is one the room declares, by name. It
   keeps nothing, sends nothing and fetches nothing; its page and what is
   lifted off it arrive through Cel Street's screen() and lift().
   tools/make-cel-street.py holds each of those.
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
    name: 'The Solarpunk Hermitage',
    from: 'campgrounds.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };

      // The cabin: its long front to the path, a cave at the left end, the
      // campfire in the middle, the watering hole at the right.
      var X0 = -9, X1 = 9, ZF = -13, ZB = -21, FL = 0.25, H = 3.2, TH = 0.16;
      var CAVE = -3.6, HOLE = 3.6;
      // Where each lifted thing shows: inside the campfire and the workshop,
      // inside the cave, or out on the path. Walls cannot hide what is laid
      // over the picture, so each shows only where you can see it from.
      var MAIN = [CAVE + 0.1, X1, ZB, ZF], DEN = [X0, CAVE - 0.1, ZB, ZF], OUT = [-40, 40, ZF + 0.1, 10];

      // MORNING: the sky, and the sun low in the east casting long shadows.
      kit.scene.background = kit.col('--daysky');
      kit.scene.fog = new T.Fog(kit.col('--daysky-2'), 40, 160);
      kit.scene.add(new T.HemisphereLight(kit.col('--daysky-2'), kit.col('--sprout-2'), 1.5));
      var sun = new T.DirectionalLight(kit.col('--noon'), 2.4);
      sun.position.set(24, 10, -6); sun.target.position.set(0, 0, -14);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      sun.shadow.camera.left = -26; sun.shadow.camera.right = 26; sun.shadow.camera.top = 26; sun.shadow.camera.bottom = -26;
      sun.shadow.camera.far = 90;
      sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
      kit.scene.add(sun, sun.target);
      // Inside, the even light the panels pay for: warmer in the cave, the
      // daylight's own in the workshop.
      [[CAVE - 2.6, ZB + 3.6, '--wick', 9], [0, -16.6, '--noon', 10], [HOLE + 2.6, -16.8, '--noon', 10]].forEach(function (l) {
        var lamp = new T.PointLight(kit.col(l[2]), l[3], 11, 1.2);
        lamp.position.set(l[0], FL + H - 0.5, l[1]);
        kit.scene.add(lamp);
      });

      // THE MEADOW, the path up to the door, and the hedge round it all.
      box(160, 0.1, 160, at(0, -0.05, -30), '--sprout', false, false);
      box(1.6, 0.04, 11, at(2.6, 0.02, -7.3), '--noon-2', false, false);
      var tuft = new T.ConeGeometry(0.03, 0.3, 3);
      for (var k = 0; k < 340; k++) {
        var tx = (hash(k, 1, 1) - 0.5) * 56, tz = 3 - hash(k, 1, 2) * 40;
        if (tx > X0 - 1 && tx < X1 + 1 && tz < ZF + 1 && tz > ZB - 1) continue;
        if (Math.abs(tx - 2.6) < 1.2 && tz > ZF) continue;
        kit.piece(tuft.clone(), at(tx, 0.13, tz, 0, (hash(k, 1, 3) - 0.5) * 0.4, (hash(k, 1, 4) - 0.5) * 0.4), '--sprout-2', false);
      }
      var bush = new T.IcosahedronGeometry(1, 1);
      for (k = 0; k < 50; k++) {
        var a = k / 50 * Math.PI * 2, d = 30 + hash(k, 2, 1) * 6;
        var bx = Math.sin(a) * d, bz = -14 - Math.cos(a) * d;
        if (bz > -2 && Math.abs(bx - 2) < 5) continue;
        var bg = bush.clone(), s = 1.6 + hash(k, 2, 2) * 1.6; bg.scale(s, s * 0.8, s);
        kit.piece(bg, at(bx, s * 0.6, bz, k), k % 2 ? '--sprout-2' : '--sprout', 0.06);
      }

      // THE CABIN ON ITS WHEELS.
      var L = X1 - X0, D = ZF - ZB, CX = (X0 + X1) / 2, CZ = (ZF + ZB) / 2;
      box(L + 0.3, 0.22, D + 0.2, at(CX, FL - 0.11, CZ), '--furrow');
      for (var wx = X0 + 1.6; wx < X1 - 1; wx += 2.9) {
        [ZF + 0.12, ZB - 0.12].forEach(function (wz) {
          kit.cyl(0.46, 0.46, 0.26, at(wx, 0.4, wz, 0, Math.PI / 2), '--furrow', 0.03, 20);
          kit.cyl(0.18, 0.18, 0.28, at(wx, 0.4, wz, 0, Math.PI / 2), '--noon-2', false, 12);
        });
      }
      box(1.6, 0.1, 0.1, at(X1 + 0.9, 0.3, CZ), '--furrow', 0.02);
      // The floor inside: boards, with the cave's velvet and the shag on them.
      box(L, 0.04, D, at(CX, FL + 0.02, CZ), '--cedar', false, false);

      // A wall along x at z, with holes in it {x0, x1, y0, y1}, plaster both sides.
      function wallX(z, holes) {
        var xs = [X0];
        holes.forEach(function (h) { xs.push(h.x0, h.x1); });
        xs.push(X1);
        for (var i = 0; i < xs.length; i += 2) if (xs[i + 1] > xs[i] + 0.01) box(xs[i + 1] - xs[i], H, TH, at((xs[i] + xs[i + 1]) / 2, FL + H / 2, z), '--noon');
        holes.forEach(function (h) {
          if (h.y0 > 0) box(h.x1 - h.x0, h.y0, TH, at((h.x0 + h.x1) / 2, FL + h.y0 / 2, z), '--noon');
          box(h.x1 - h.x0, H - h.y1, TH, at((h.x0 + h.x1) / 2, FL + (h.y1 + H) / 2, z), '--noon');
        });
      }
      var DOOR = { x0: 2.0, x1: 3.2, y0: 0, y1: 2.2 };
      var WW = 3.0, WIN = { x0: 4.6, x1: 4.6 + WW, y0: 0.9, y1: 0.9 + WW * 800 / 1180 };
      var LOW = { x0: -2.9, x1: -1.7, y0: 1.2, y1: 2.2 };
      var BACK = [{ x0: 5.0, x1: 6.2, y0: 1.2, y1: 2.3 }, { x0: 6.9, x1: 8.1, y0: 1.2, y1: 2.3 }];
      wallX(ZF, [LOW, DOOR, WIN]);
      wallX(ZB, BACK);
      [X0, X1].forEach(function (x) { box(TH, H, D + TH, at(x, FL + H / 2, CZ), '--noon'); });
      [[X0, ZF], [X0, ZB], [X1, ZF], [X1, ZB]].forEach(function (c) { box(0.2, H + 0.02, 0.2, at(c[0], FL + H / 2, c[1]), '--cedar', false); });
      box(L + 0.1, 0.14, TH + 0.06, at(CX, FL + 0.07, ZF), '--cedar', false);
      // The frames of the small windows, and their glass.
      [[LOW, ZF], [BACK[0], ZB], [BACK[1], ZB]].forEach(function (pair) {
        var w = pair[0], z = pair[1];
        box(w.x1 - w.x0 + 0.16, w.y1 - w.y0 + 0.16, TH + 0.04, at((w.x0 + w.x1) / 2, FL + (w.y0 + w.y1) / 2, z), '--cedar', false);
        box(w.x1 - w.x0, w.y1 - w.y0, TH + 0.06, at((w.x0 + w.x1) / 2, FL + (w.y0 + w.y1) / 2, z), '--daysky-2', false);
      });
      // The ceiling inside, and the roof over it: two slopes, panels on the
      // one facing the path.
      box(L, 0.1, D, at(CX, FL + H + 0.05, CZ), '--noon-2', false);
      var rise = 1.3, slope = Math.atan2(rise, D / 2), run = Math.hypot(rise, D / 2) + 0.4;
      [-1, 1].forEach(function (s2) {
        box(L + 0.7, 0.14, run, at(CX, FL + H + rise / 2 + 0.05, CZ + s2 * D / 4, 0, s2 * slope), '--furrow-2');
      });
      [X0, X1].forEach(function (x) {
        var gable = new T.Shape(); gable.moveTo(-D / 2, 0); gable.lineTo(D / 2, 0); gable.lineTo(0, rise); gable.lineTo(-D / 2, 0);
        kit.piece(new T.ExtrudeGeometry(gable, { depth: TH, bevelEnabled: false }), at(x - TH / 2, FL + H, CZ, Math.PI / 2), '--noon', 0.03);
      });
      var panel = kit.paper(256, 160, function (c, w, h) {
        c.fillStyle = kit.ink('--noon-2'); c.fillRect(0, 0, w, h);
        c.fillStyle = kit.ink('--cell'); c.fillRect(6, 6, w - 12, h - 12);
        c.strokeStyle = kit.ink('--noon-2'); c.lineWidth = 2;
        for (var x = 6; x < w; x += (w - 12) / 6) { c.beginPath(); c.moveTo(x, 6); c.lineTo(x, h - 6); c.stroke(); }
        for (var y = 6; y < h; y += (h - 12) / 3) { c.beginPath(); c.moveTo(6, y); c.lineTo(w - 6, y); c.stroke(); }
      });
      for (var px = X0 + 1.0; px < X1 - 0.6; px += 1.5) {
        kit.sheet(panel, 1.4, run - 0.7, at(px, FL + H + rise / 2 + 0.14, CZ + D / 4 + 0.02, 0, slope - Math.PI / 2));
      }
      // The aerial, up off the cave's gable.
      kit.cyl(0.03, 0.03, 2.0, at(X0 + 0.4, FL + H + rise + 0.9, CZ), '--furrow', false, 6);
      [0.6, 0.95, 1.3].forEach(function (y, i) { box(1.0 - i * 0.22, 0.03, 0.03, at(X0 + 0.4, FL + H + rise + y, CZ), '--furrow', false); });

      // The door, open into the campfire, and its step.
      box(0.06, 2.2, 1.2, at(DOOR.x1 + 0.03, FL + 1.1, ZF + 0.6), '--cedar');
      box(1.6, 0.18, 0.6, at(2.6, 0.09, ZF + 0.5), '--cedar');

      // THE BIG WINDOW, with the room's own page in it, read from the path;
      // from inside it is the glass.
      var wx0 = (WIN.x0 + WIN.x1) / 2, wy0 = FL + (WIN.y0 + WIN.y1) / 2, wh = WIN.y1 - WIN.y0;
      box(WW + 0.22, wh + 0.22, TH + 0.04, at(wx0, wy0, ZF), '--cedar', false);
      box(WW, wh, 0.04, at(wx0, wy0, ZF - 0.02), '--daysky-2', false);
      var frame = kit.screen(1180, 800, WW, at(wx0, wy0, ZF + TH / 2 + 0.03), 'The Solarpunk Hermitage’s own page, in the cabin’s big window', OUT);
      frame.style.backfaceVisibility = 'hidden';

      // THE THREE SUNFLOWERS at the door, the rain butt, the seed bed, the bench.
      [-0.9, 1.1, 1.7].forEach(function (o, i) {
        var fx = 2.6 + o, fz = ZF + 0.8 + (i === 2 ? 0.5 : 0), fh = 2.1 + i * 0.25;
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
      kit.cyl(0.42, 0.42, 1.1, at(X0 - 0.5, 0.55, ZF + 0.6), '--cedar', 0.03, 16);
      [0.25, 0.75].forEach(function (y) { kit.cyl(0.44, 0.44, 0.06, at(X0 - 0.5, y, ZF + 0.6), '--furrow', false, 16); });
      box(3.2, 0.3, 1.2, at(-4.4, 0.15, -9.6), '--cedar');
      box(3.0, 0.06, 1.0, at(-4.4, 0.31, -9.6), '--furrow-2', false);
      for (k = 0; k < 24; k++) {
        var sx = -5.7 + (k % 8) * 0.37, sz = -9.95 + Math.floor(k / 8) * 0.35;
        kit.cyl(0.012, 0.012, 0.18, at(sx, 0.42, sz), '--sprout', false, 4);
        var lv = new T.SphereGeometry(0.05, 6, 4); lv.scale(1.4, 0.3, 0.8);
        kit.piece(lv, at(sx, 0.52, sz, k), '--sprout', false);
      }
      box(1.8, 0.08, 0.45, at(6.6, 0.46, -8.6, -0.3), '--cedar');
      [-0.7, 0.7].forEach(function (o) { box(0.1, 0.44, 0.4, M(at(6.6, 0, -8.6, -0.3), at(o, 0.22, 0)), '--cedar'); });

      /* ── THE CAVE: velvet on every side, the shelves and the speaker ───── */
      box(CAVE - X0, 0.03, D, at((X0 + CAVE) / 2, FL + 0.05, CZ), '--velvet-3', false, false);
      function curtain(x0, z0, x1, z1, gap) {
        var len = Math.hypot(x1 - x0, z1 - z0), n = Math.round(len / 0.32), ang = Math.atan2(x1 - x0, z1 - z0);
        for (var i = 0; i <= n; i++) {
          var u = i / n, cx = x0 + (x1 - x0) * u, cz = z0 + (z1 - z0) * u;
          if (gap && Math.abs(cz - gap[0]) < gap[1]) continue;
          kit.cyl(0.14, 0.17, H - 0.1, at(cx, FL + H / 2, cz, ang), i % 3 === 0 ? '--velvet-2' : i % 3 === 1 ? '--velvet' : '--velvet-3', false, 8);
        }
      }
      curtain(X0 + 0.25, ZF - 0.25, X0 + 0.25, ZB + 0.25);
      curtain(X0 + 0.25, ZB + 0.25, CAVE, ZB + 0.25);
      curtain(X0 + 0.25, ZF - 0.25, CAVE, ZF - 0.25);
      curtain(CAVE, ZF - 0.25, CAVE, ZB + 0.25, [-16.2, 0.9]);
      // The reading chair, the lamp, and the candles as ornaments.
      var chair = at(-6.2, FL, -15.4, 0.5);
      box(1.1, 0.45, 0.95, M(chair, at(0, 0.32, 0)), '--velvet-2');
      box(1.1, 0.9, 0.25, M(chair, at(0, 0.75, -0.4)), '--velvet-2');
      [-1, 1].forEach(function (s2) { box(0.22, 0.6, 0.95, M(chair, at(s2 * 0.55, 0.45, 0)), '--velvet'); });
      kit.cyl(0.03, 0.03, 1.5, at(-7.2, FL + 0.75, -16.3), '--gilt', false, 6);
      kit.cyl(0.18, 0.3, 0.28, at(-7.2, FL + 1.6, -16.3), '--wick-2', 0.02, 14);
      [[-8.4, -19.9], [-8.2, -14.0], [-4.3, -20.2]].forEach(function (c, i) {
        kit.cyl(0.18, 0.18, 0.5, at(c[0], FL + 0.25, c[1]), '--velvet-3', false, 10);
        for (var n = 0; n < 3; n++) {
          var ch = 0.16 + hash(i, n, 1) * 0.16;
          kit.cyl(0.035, 0.035, ch, at(c[0] + (n - 1) * 0.1, FL + 0.5 + ch / 2, c[1]), '--wick', false, 8);
          kit.piece(new T.ConeGeometry(0.02, 0.06, 6), at(c[0] + (n - 1) * 0.1, FL + 0.53 + ch, c[1]), '--gilt', false);
        }
      });
      // The shelves, off the page, on the cave's back curtain; the speaker,
      // tucked into the curtain beside the chair.
      var shelves = kit.lift(frame, '.shelves', { bare: true, w: 560, ww: 1.9, m: at(-6.3, FL + 0.35, ZB + 0.45), zone: DEN });
      var speaker = kit.lift(frame, '.facade', { w: 420, ww: 0.8, m: at(X0 + 0.45, FL + 1.0, -15.2, Math.PI / 2), n: 0, zone: DEN });

      /* ── THE CAMPFIRE: the shag, three bean bags, the table and the set ─ */
      kit.cyl(2.7, 2.7, 0.05, at(0, FL + 0.05, -17.3), '--turf', false, 28);
      var bean = new T.SphereGeometry(0.55, 14, 10);
      [[-1.9, -16.4, '--bloom'], [0, -15.8, '--cedar'], [1.9, -16.4, '--sprout']].forEach(function (b) {
        var g2 = bean.clone(); g2.scale(1, 0.62, 1);
        kit.piece(g2, at(b[0], FL + 0.36, b[1]), b[2], 0.04);
      });
      // The television, the remote on the coffee table, the listing beside
      // the set and the long stereo along the wall behind the chairs, all the
      // page's own, and hermitage.js run against them.
      var tv = kit.lift(frame, '.bigscreen', { bare: true, w: 720, ww: 3.4, m: at(0, FL + 0.05, ZB + 0.35), zone: MAIN });
      // The coffee table, its top the page's own with the remote on it.
      box(1.5, 0.3, 0.7, at(0, FL + 0.15, -16.9), '--cedar');
      var remote = kit.lift(frame, '.coffee', { bare: true, w: 560, ww: 1.3, m: at(0, FL + 0.31, -16.7, 0, -0.5), drop: '.coffee__legs', zone: MAIN });
      var guide = kit.lift(frame, '.guide', { w: 560, h: 760, ww: 1.4, m: at(2.9, FL + 0.5, ZB + 0.25), zone: MAIN });
      var hifi = kit.lift(frame, '.hifi', { bare: true, w: 1100, ww: 3.0, m: at(-0.6, FL + 0.05, ZF - 0.2, Math.PI), zone: MAIN });
      kit.wire(frame, 'hermitage.js');

      /* ── THE WATERING HOLE: three benches in the daylight ─────────────── */
      function bench(x, z, w, ry) {
        var g3 = at(x, FL, z, ry || 0);
        box(w, 0.08, 0.9, M(g3, at(0, 0.9, 0)), '--cedar');
        [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(function (c) { box(0.08, 0.86, 0.08, M(g3, at(c[0] * (w / 2 - 0.1), 0.43, c[1] * 0.35)), '--cedar', false); });
        return g3;
      }
      // The herbarium: pressed sheets laid out on the bench.
      var herb = bench(HOLE + 1.2, -14.4, 2.2);
      var sheetTex = kit.paper(140, 190, function (c, w, h) {
        c.fillStyle = kit.ink('--noon-2'); c.fillRect(0, 0, w, h);
        c.strokeStyle = kit.ink('--sprout'); c.lineWidth = 4;
        c.beginPath(); c.moveTo(w / 2, h - 20); c.bezierCurveTo(w / 2 - 10, h / 2, w / 2 + 14, h / 3, w / 2, 24); c.stroke();
        c.fillStyle = kit.ink('--sprout');
        for (var i = 0; i < 5; i++) { c.beginPath(); c.ellipse(w / 2 + (i % 2 ? 18 : -18), 50 + i * 24, 16, 7, i % 2 ? 0.5 : -0.5, 0, Math.PI * 2); c.fill(); }
        c.fillStyle = kit.ink('--furrow-2'); c.fillRect(w - 56, h - 26, 44, 10);
      });
      for (k = 0; k < 5; k++) kit.sheet(sheetTex, 0.32, 0.44, M(herb, at(-0.8 + k * 0.4, 0.95 + k * 0.002, (hash(k, 6, 1) - 0.5) * 0.2, (hash(k, 6, 2) - 0.5) * 0.3, -Math.PI / 2)));
      // The solar bench along the back wall, its films stood on it.
      var solar = bench(6.4, ZB + 0.75, 3.4);
      var lays = [0, 1, 2].map(function (n) {
        return kit.lift(frame, '.lay.lay--watch', { w: 380, ww: 0.95, m: M(solar, at(-1.1 + n * 1.1, 0.95, -0.1)), n: n, zone: MAIN });
      });
      // The Star Stuff table: zines in a stack and fanned out.
      var star = bench(X1 - 1.0, -16.6, 2.0, -Math.PI / 2);
      var zineTex = kit.paper(120, 160, function (c, w, h) {
        c.fillStyle = kit.ink('--noon'); c.fillRect(0, 0, w, h);
        c.fillStyle = kit.ink('--cell'); c.fillRect(0, 0, w, 52);
        c.fillStyle = kit.ink('--bloom'); c.beginPath(); c.arc(w - 26, 26, 12, 0, Math.PI * 2); c.fill();
        c.fillStyle = kit.ink('--furrow-2'); for (var i = 0; i < 6; i++) c.fillRect(12, 66 + i * 14, w - 30 - (i % 2) * 18, 5);
      });
      for (k = 0; k < 6; k++) kit.sheet(zineTex, 0.22, 0.3, M(star, at(-0.6 + (k % 3) * 0.32, 0.95 + k * 0.003, (k < 3 ? -0.15 : 0.18), (hash(k, 7, 1) - 0.5) * 0.6, -Math.PI / 2)));

      return {
        start: { x: 2.6, z: 1.5, yaw: 0 },
        bounds: { x: [X0 + 0.6, X1 - 0.6], z: [ZB + 0.9, 3] },
        stops: [
          { name: 'on the path, out of the dusk and into the morning', x: 2.6, z: 1.5, yaw: 0 },
          { name: 'at the big window, with the room’s own page in it', x: wx0, z: ZF + 2.9, yaw: 0, page: kit.page, frame: frame },
          { name: 'at the door, between the sunflowers', x: 2.6, z: ZF + 2.6, yaw: 0 },
          { name: 'at the campfire, with the chairs all pointed at the television', x: 0, z: -14.0, yaw: 0, frame: tv.el },
          { name: 'at the coffee table, with the remote', x: 0, z: -15.1, yaw: 0, pitch: -0.5, frame: remote.el },
          { name: 'at the channel listing beside the television', x: 2.9, z: -18.6, yaw: 0, frame: guide.el },
          { name: 'at the stereo along the wall behind the chairs', x: -0.6, z: -16.4, yaw: Math.PI, frame: hifi.el },
          { name: 'in the cave, at the shelves', x: -6.3, z: -18.2, yaw: 0, frame: shelves.el },
          { name: 'in the cave, by the speaker in the curtain', x: -6.4, z: -15.2, yaw: Math.PI / 2, frame: speaker.el },
          { name: 'at the herbarium', x: HOLE + 1.2, z: -13.4, yaw: 0 },
          { name: 'at the solar bench, with its films', x: 6.4, z: -18.0, yaw: 0, frame: lays[0].el },
          { name: 'at the Star Stuff table', x: X1 - 2.8, z: -16.6, yaw: -Math.PI / 2 }
        ]
      };
    }
  };
})();

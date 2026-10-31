/* =============================================================================
   The Emergent Future Worlds Meets Mountain Man, walked into on Cel Street.
   Ryan's ask, 2026-10-31: David's cabin at the summit over the campgrounds,
   through its post in the field.

   IT IS DAVID'S WORLD AND NOBODY ELSE'S (§118): a log cabin at the top of the
   mountain, at night, warm and cosy meets smart-home modern. THE LIGHT IS THE
   VISITOR'S TO CHOOSE: strips along the top of the walls and under the big
   screen, in the cabin's teal to start with, and the fire behind the stove's
   glass is not what lights the room. The ground is the blue-charcoal of a
   smart home at night, never brown. The whole back wall is a window, and it is
   the cold half: a lake under a full moon far below, the mountain's shoulder,
   the hot spring steaming on the warm ground just outside and the pack lying
   round it. One wolf is asleep on the rug by the stove. Coffee on the stove,
   cups on the shelf, crisps and sweets on the low table, the diffuser on its
   side table, bright cushions and bean bags.

   HABITABLE, off its own page: the cabin's smart panel by the door, with the
   one switch, the colour of the strips, the scent and the words saying what
   moved (mountain-man.js); the big screen with David's playlist on it and the
   songs one press each beside it (rack.js); the howl and the recording of real
   wolves by the window; and the way to David's photographs through it. The
   room's own page hangs on the wall by the door.

   NOTHING MOVES BEFORE THE SWITCH, and nothing in this file moves at all; what
   the panel's own drawing does after a press is mountain-man.js's, under its
   page's rules. Nobody counts, feeds or names the wolves. Every colour is one
   the room declares, by name. It keeps nothing, sends nothing and fetches
   nothing; its page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 19, 374761393) ^ Math.imul(j + 61, 668265263) ^ Math.imul(k + 67, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['the-mountain-cabin.html'] = {
    name: 'The Emergent Future Worlds Meets Mountain Man',
    from: 'campgrounds.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var W = 10, D = 8, H = 3.0, LOG = 0.32;
      var L = -W / 2, R = W / 2, BACK = -D;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var WIN = { y0: 0.6, y1: 2.6 };

      // NIGHT, and the strips' light: the room is lit by the colour on the
      // strips, the moon comes in at the window, and the fire lights nothing.
      kit.scene.background = kit.col('--efw-sky');
      kit.scene.add(new T.HemisphereLight(kit.col('--efw-dim'), kit.col('--efw-night'), 1.7));
      [[L + 1, -1], [R - 1, -1], [L + 1, BACK + 1], [R - 1, BACK + 1], [0, -D / 2]].forEach(function (p) {
        var led = new T.PointLight(kit.col('--efw-led-1'), 3, 8, 1.5);
        led.position.set(p[0], H - 0.25, p[1]);
        kit.scene.add(led);
      });
      var moon = new T.DirectionalLight(kit.col('--efw-moon'), 0.7);
      moon.position.set(6, 14, -30); moon.target.position.set(0, 0, -4);
      kit.scene.add(moon, moon.target);

      // THE FLOOR and the ceiling.
      box(W + 0.4, 0.1, D + 0.4, at(0, -0.05, -D / 2), '--efw-floor', false, false);
      for (var b = 0; b < 14; b++) box(W, 0.012, 0.02, at(0, 0.002, -0.3 - b * 0.56), '--efw-log-2', false, false);
      box(W + 0.4, 0.14, D + 0.4, at(0, H + 0.07, -D / 2), '--efw-log-2', false, false);
      [-2.5, 0, 2.5].forEach(function (x) { box(0.28, 0.3, D, at(x, H - 0.15, -D / 2), '--efw-log', 0.02); });

      // THE WALLS: logs, with the dark between them, a door on the left of the
      // front wall.
      function logWall(m, len, gaps) {
        for (var r = 0; r * LOG < H; r++) {
          var y = LOG / 2 + r * LOG, spans = [[-len / 2, len / 2]];
          (gaps || []).forEach(function (g) {
            if (y > g[2] && y < g[3]) {
              spans = spans.reduce(function (out, sp) {
                if (g[1] <= sp[0] || g[0] >= sp[1]) { out.push(sp); return out; }
                if (g[0] > sp[0]) out.push([sp[0], g[0]]);
                if (g[1] < sp[1]) out.push([g[1], sp[1]]);
                return out;
              }, []);
            }
          });
          spans.forEach(function (sp) {
            var w = sp[1] - sp[0];
            if (w < 0.05) return;
            kit.cyl(LOG / 2, LOG / 2, w, M(m, at((sp[0] + sp[1]) / 2, y, 0, 0, 0, Math.PI / 2)), r % 2 ? '--efw-log' : '--efw-wood', 0.02, 10);
          });
        }
      }
      logWall(at(L, 0, -D / 2, LEFT), D, []);
      logWall(at(R, 0, -D / 2, RIGHT), D, []);
      logWall(at(0, 0, 0, Math.PI), W, [[2.4, 3.6, 0, 2.2]]);       // the door, on the left as you face in
      // Below and above the window, the back wall is logs too.
      logWall(at(0, 0, BACK), W, [[-W / 2, W / 2, WIN.y0, WIN.y1]]);
      box(1.1, 2.15, 0.08, at(-3.0, 1.08, -0.06), '--efw-wood', 0.02);
      box(0.06, 0.24, 0.06, at(-2.6, 1.05, -0.14), '--efw-iron-2', false);

      // THE LED STRIPS along the top of every wall, in the cabin's teal.
      [[0, -0.18, W, 0], [0, BACK + 0.18, W, 0], [L + 0.18, -D / 2, D, LEFT], [R - 0.18, -D / 2, D, LEFT]].forEach(function (s) {
        kit.flat(new T.BoxGeometry(s[2], 0.05, 0.05), at(s[0], H - 0.42, s[1], s[3]), '--efw-led-1');
      });

      // THE WINDOW: the width of the back wall, glazing bars and a sill, and
      // the night outside it.
      for (var bx = L; bx <= R + 0.01; bx += W / 5) box(0.1, WIN.y1 - WIN.y0, 0.14, at(bx, (WIN.y0 + WIN.y1) / 2, BACK), '--efw-iron', 0.015);
      box(W, 0.12, 0.16, at(0, WIN.y1, BACK), '--efw-iron', 0.015);
      box(W, 0.1, 0.4, at(0, WIN.y0 - 0.05, BACK + 0.12), '--efw-wood', 0.015);
      // Outside: the warm ground at the summit, the ring of stones round the hot
      // spring, its steam, and the pack lying on the warm ground.
      box(30, 0.2, 12, at(0, -0.4, BACK - 6.2), '--efw-ridge', false, false);
      var sx = 1.5, sz = BACK - 4.2;
      kit.flat(new T.CircleGeometry(1.9, 24), at(sx, -0.28, sz, 0, -Math.PI / 2), '--efw-lake');
      for (b = 0; b < 18; b++) {
        var a = b / 18 * Math.PI * 2, st = new T.DodecahedronGeometry(0.2 + hash(b, 1, 1) * 0.12, 0); st.scale(1, 0.6, 1);
        kit.piece(st, at(sx + Math.cos(a) * 2.05, -0.22, sz + Math.sin(a) * 2.05, b), '--efw-iron-2', 0.02);
      }
      // The steam, in thin wisps going up off the water, drawn still.
      for (b = 0; b < 5; b++) {
        var spts = [], bx0 = sx + (hash(b, 2, 2) - 0.5) * 2.4, bz0 = sz + (hash(b, 2, 4) - 0.5) * 1.8;
        for (var q0 = 0; q0 < 6; q0++) spts.push(new T.Vector3(bx0 + Math.sin(q0 * 1.1 + b) * 0.12, -0.2 + q0 * 0.2, bz0 + Math.cos(q0 * 0.8 + b) * 0.08));
        kit.piece(new T.TubeGeometry(new T.CatmullRomCurve3(spts), 16, 0.012 + hash(b, 2, 1) * 0.01, 4, false), new T.Matrix4(), '--efw-moon', false);
      }
      function wolf(x, y, z, turn, s, lying) {
        var g = at(x, y, z, turn);
        var body = new T.SphereGeometry(0.3 * s, 10, 8); body.scale(1.7, lying ? 0.7 : 0.95, 0.85);
        kit.piece(body, M(g, at(0, (lying ? 0.2 : 0.55) * s, 0)), '--efw-wolf', 0.02);
        var head = new T.SphereGeometry(0.17 * s, 10, 8); head.scale(1.2, 1, 1);
        kit.piece(head, M(g, at(0.55 * s, (lying ? 0.32 : 0.82) * s, 0)), '--efw-wolf', 0.02);
        kit.piece(new T.ConeGeometry(0.09 * s, 0.25 * s, 6), M(g, at(0.76 * s, (lying ? 0.27 : 0.77) * s, 0, 0, 0, -Math.PI / 2)), '--efw-wolf', 0.015);
        [-1, 1].forEach(function (e) { kit.piece(new T.ConeGeometry(0.05 * s, 0.14 * s, 4), M(g, at(0.5 * s, (lying ? 0.5 : 1.0) * s, e * 0.08 * s)), '--efw-wolf', 0.01); });
        var tail = new T.SphereGeometry(0.11 * s, 8, 6); tail.scale(2.6, 0.8, 0.9);
        kit.piece(tail, M(g, at(-0.55 * s, (lying ? 0.14 : 0.45) * s, lying ? 0.22 * s : 0, lying ? 0.9 : 0, 0, lying ? 0 : 0.5)), '--efw-wolf', 0.015);
        if (!lying) [[-0.3, -0.12], [-0.3, 0.12], [0.3, -0.12], [0.3, 0.12]].forEach(function (l) { kit.cyl(0.05 * s, 0.05 * s, 0.4 * s, M(g, at(l[0] * s, 0.2 * s, l[1] * s)), '--efw-wolf', 0.01, 6); });
      }
      wolf(sx - 2.9, -0.3, sz + 0.6, 0.4, 1.1, true);
      wolf(sx + 3.0, -0.3, sz - 0.4, 2.8, 1.0, true);
      wolf(sx - 1.4, -0.3, sz - 2.6, 1.2, 1.15, false);
      wolf(sx + 1.6, -0.3, sz - 2.9, 2.2, 1.0, true);
      wolf(sx - 4.2, -0.3, sz - 1.9, 0.9, 0.95, false);
      // Far below: the lake under the full moon, the moon's path across it,
      // the mountain's shoulders, and the stars.
      kit.flat(new T.PlaneGeometry(600, 400), at(0, -60, -320, 0, -Math.PI / 2), '--efw-lake');
      kit.flat(new T.PlaneGeometry(9, 380), at(40, -59.8, -330, 0.12, -Math.PI / 2), '--efw-moon');
      [[-140, -230, 70], [-40, -300, 50], [150, -260, 80], [-260, -120, 60], [250, -150, 70], [80, -90, 40], [-90, -80, 35]].forEach(function (h, i) {
        kit.piece(new T.ConeGeometry(h[2], h[2] * 1.3, 7), at(h[0], -60 + h[2] * 0.6, h[1], i), '--efw-ridge', false);
      });
      kit.flat(new T.CircleGeometry(16, 40), at(60, 70, -420), '--efw-moon');
      for (b = 0; b < 80; b++) {
        var ra = (hash(b, 3, 1) - 0.5) * 2.2, re = 0.15 + hash(b, 3, 2) * 0.7;
        kit.flat(new T.CircleGeometry(0.6 + hash(b, 3, 3) * 0.6, 5), at(Math.sin(ra) * 400 * Math.cos(re), 400 * Math.sin(re) - 20, -Math.cos(ra) * 400 * Math.cos(re), -ra, 0), '--efw-moon');
      }

      // THE STOVE, glass-fronted, on the left wall: the fire behind the glass,
      // the coffee pot on top, the cups on the shelf above.
      var sv = at(L + 0.7, 0, -5.9, LEFT);
      box(1.0, 1.0, 0.75, M(sv, at(0, 0.55, 0)), '--efw-iron');
      box(0.72, 0.56, 0.02, M(sv, at(0, 0.58, 0.38)), '--efw-sky', false);
      [[-0.15, 0.62, 0.26, 0.42], [0.08, 0.6, 0.22, 0.36], [0.22, 0.58, 0.16, 0.26]].forEach(function (f) {
        var fl = new T.ConeGeometry(f[2] / 2, f[3], 8); fl.scale(1, 1, 0.3);
        kit.flat(fl, M(sv, at(f[0], f[1] - 0.1 + f[3] / 2 - 0.12, 0.395)), '--efw-flame');
      });
      kit.flat(new T.PlaneGeometry(0.5, 0.1), M(sv, at(0, 0.36, 0.396)), '--efw-ember');
      kit.flat(new T.CircleGeometry(0.07, 10), M(sv, at(-0.05, 0.5, 0.397)), '--efw-heart');
      box(0.8, 0.04, 0.04, M(sv, at(0, 0.88, 0.39)), '--efw-iron-2', false);
      kit.cyl(0.1, 0.1, H - 1.05, M(sv, at(0, 1.05 + (H - 1.05) / 2, -0.15)), '--efw-iron', 0.02, 10);
      kit.cyl(0.13, 0.11, 0.24, M(sv, at(0.25, 1.17, 0.05)), '--efw-cup', 0.015, 12);
      kit.cyl(0.03, 0.025, 0.14, M(sv, at(0.38, 1.22, 0.05, 0, 0, -0.9)), '--efw-cup', false, 5);
      box(1.2, 0.05, 0.26, M(sv, at(0, 1.75, -0.1)), '--efw-wood', 0.015);
      for (b = 0; b < 5; b++) kit.cyl(0.05, 0.045, 0.1, M(sv, at(-0.44 + b * 0.22, 1.83, -0.1)), '--efw-cup', 0.01, 10);

      // THE RUG, and the one wolf asleep on it by the stove, tail over nose.
      kit.cyl(1.7, 1.7, 0.02, at(-1.6, 0.01, -4.6), '--efw-rug', false, 32);
      wolf(-3.3, 0.02, -5.3, 2.6, 1.05, true);

      // THE LOUNGE, facing the big screen on the right wall: a high-back sofa
      // under the window, a sofa and two high-back armchairs, the low table with
      // the crisps and the sweets, bright cushions on everything, and bean bags.
      function seat(m, len, back) {
        box(len, 0.42, 0.85, M(m, at(0, 0.21, 0)), '--efw-velvet-2');
        box(len, back, 0.22, M(m, at(0, 0.42 + back / 2 - 0.05, -0.33)), '--efw-velvet');
        [-1, 1].forEach(function (e) { box(0.18, 0.62, 0.85, M(m, at(e * (len / 2 - 0.09), 0.31, 0)), '--efw-velvet'); });
      }
      var CUSH = ['--efw-led-1', '--efw-led-2', '--efw-led-3', '--efw-led-4', '--efw-cushion'];
      function cushions(m, len, n, k0) {
        for (var c = 0; c < n; c++) {
          var cu = new T.BoxGeometry(0.42, 0.38, 0.14); cu.translate(0, 0, 0);
          kit.piece(cu, M(m, at(-len / 2 + 0.4 + c * (len - 0.8) / Math.max(n - 1, 1), 0.68, -0.18, 0, -0.2, (c % 2 ? 0.12 : -0.1))), CUSH[(k0 + c) % CUSH.length], 0.015);
        }
      }
      var sofaW = at(1.0, 0, BACK + 0.85);
      seat(sofaW, 2.6, 0.95); cushions(sofaW, 2.6, 3, 0);
      var sofaL = at(0.4, 0, -3.8, RIGHT);
      seat(sofaL, 2.2, 0.75); cushions(sofaL, 2.2, 2, 2);
      [[1.4, -1.9, RIGHT - 0.5], [1.4, -6.0, RIGHT + 0.5]].forEach(function (p, i) {
        var ch = at(p[0], 0, p[1], p[2]);
        seat(ch, 1.0, 1.1); cushions(ch, 1.0, 1, 3 + i);
      });
      var tbl = at(2.6, 0, -3.9);
      box(1.3, 0.06, 0.8, M(tbl, at(0, 0.42, 0)), '--efw-wood', 0.02);
      [[-0.55, -0.32], [0.55, -0.32], [-0.55, 0.32], [0.55, 0.32]].forEach(function (l) { box(0.06, 0.4, 0.06, M(tbl, at(l[0], 0.2, l[1])), '--efw-wood', false); });
      var bowl = new T.SphereGeometry(0.17, 14, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
      [[-0.35, 0], [0.05, 0.12], [0.4, -0.08]].forEach(function (p, i) {
        kit.piece(bowl.clone(), M(tbl, at(p[0], 0.62, p[1], 0, Math.PI)), '--efw-cup', 0.01);
      });
      // Crisps in one bowl, sweets in the next, and the rainbow ones in the third.
      for (b = 0; b < 8; b++) {
        var cr = new T.CircleGeometry(0.05, 6);
        kit.piece(cr, M(tbl, at(-0.35 + (hash(b, 4, 1) - 0.5) * 0.18, 0.6, (hash(b, 4, 2) - 0.5) * 0.18, b, -1.2)), '--efw-cushion', false);
      }
      var RB = ['--efw-rb-red', '--efw-rb-orange', '--efw-rb-yellow', '--efw-rb-green', '--efw-rb-violet'];
      for (b = 0; b < 14; b++) {
        var sw = new T.SphereGeometry(0.025, 6, 4); sw.scale(1, 0.6, 1);
        kit.piece(sw, M(tbl, at((b < 6 ? 0.05 : 0.4) + (hash(b, 5, 1) - 0.5) * 0.18, 0.6, (b < 6 ? 0.12 : -0.08) + (hash(b, 5, 2) - 0.5) * 0.16)), b < 6 ? CUSH[b % 4] : RB[b % RB.length], false);
      }
      kit.cyl(0.05, 0.045, 0.1, M(tbl, at(-0.5, 0.5, 0.25)), '--efw-cup', 0.01, 10);
      // Bean bags on the floor.
      [[-1.2, -2.6, '--efw-led-2'], [-0.6, BACK + 1.3, '--efw-led-3'], [3.1, -2.4, '--efw-led-4'], [3.2, -5.4, '--efw-cushion']].forEach(function (p, i) {
        var bb = new T.SphereGeometry(0.42, 12, 9); bb.scale(1, 0.6, 1);
        kit.piece(bb, at(p[0], 0.24, p[1], i), p[2], 0.02);
      });

      // THE DIFFUSER on its side table in the corner by the window, its wisps
      // drawn still.
      box(0.5, 0.6, 0.5, at(R - 0.6, 0.3, BACK + 0.7), '--efw-wood', 0.02);
      kit.cyl(0.1, 0.13, 0.22, at(R - 0.6, 0.71, BACK + 0.7), '--efw-cup', 0.015, 12);
      for (b = 0; b < 3; b++) {
        var pts = [];
        for (var q = 0; q < 6; q++) pts.push(new T.Vector3(R - 0.6 + Math.sin(q * 1.3 + b) * 0.05, 0.85 + q * 0.09, BACK + 0.7 + Math.cos(q + b) * 0.04));
        kit.piece(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 12, 0.008, 4, false), new T.Matrix4(), '--efw-moon', false);
      }

      // THE CABIN'S OWN PAGE on the left wall, between the panel and the stove.
      var pw = 2.0, ph = pw * 800 / 1180, pgm = at(L + 0.24, 0, -3.2, LEFT);
      box(pw + 0.16, ph + 0.16, 0.05, M(pgm, at(0, 1.5, 0)), '--efw-iron', 0.015);
      var pageFrame = kit.screen(1180, 800, pw, M(pgm, at(0, 1.5, 0.04)), 'The cabin\u2019s own page, on the wall by the door');

      // THE BIG SCREEN on the right wall, off the page, a speaker standing
      // either side and the strip under it; the songs on it, one press each,
      // on the wall nearer the door.
      var sw0 = 2.4, sy0 = 1.0;
      [-1, 1].forEach(function (e) {
        var sp = at(R - 0.4, 0, -4.0 + e * (sw0 / 2 + 0.45), RIGHT);
        box(0.42, 1.25, 0.36, M(sp, at(0, 0.63, 0)), '--efw-iron');
        [0.4, 0.85].forEach(function (y) { kit.cyl(0.13, 0.13, 0.02, M(sp, at(0, y, 0.19, 0, Math.PI / 2)), '--efw-iron-2', false, 18); });
      });
      kit.flat(new T.BoxGeometry(0.04, 0.04, sw0 + 0.2), at(R - 0.2, sy0 - 0.12, -4.0), '--efw-led-1');
      var screen = kit.lift(pageFrame, '.efw-plate', { w: 900, ww: sw0, m: at(R - 0.22, sy0, -4.0, RIGHT) });
      var songs = kit.lift(pageFrame, '.efw-rack', { w: 900, ww: 1.6, m: at(R - 0.22, 0.35, -1.25, RIGHT) });

      // THE SMART PANEL by the door: the cabin's own control drawing, the one
      // switch and the words that say what moved. The page's own script has
      // already built its buttons in the copy these are lifted from; those are
      // dead here, so they are left out and built afresh by the wire below.
      var panel = kit.lift(pageFrame, '.efw-scene', { w: 900, ww: 1.3, m: at(L + 0.24, 1.36, -1.15, LEFT), cls: 'cel-efw-panel' });
      var row = kit.lift(pageFrame, '.efw-controls', { w: 900, ww: 1.3, m: at(L + 0.24, 1.2, -1.15, LEFT), drop: 'button' });
      kit.lift(pageFrame, '.efw-says', { w: 900, ww: 1.3, m: at(L + 0.24, 1.0, -1.15, LEFT) });

      // BY THE WINDOW: the way to David's photographs, the howl, and the
      // recording of real wolves.
      var go = kit.lift(pageFrame, '.efw-window-go', { w: 420, ww: 0.8, m: at(-3.6, WIN.y0 + 0.02, BACK + 0.34) });
      kit.lift(pageFrame, '.efw-gallery', { w: 1100, ww: 2.2, m: at(-3.4, 1.6, BACK + 0.6) });
      var howl = kit.lift(pageFrame, '.efw-howl', { w: 420, ww: 0.8, m: at(-2.7, WIN.y0 + 0.1, BACK + 0.34), drop: 'button' });
      kit.lift(pageFrame, '.efw-record', { w: 420, ww: 0.8, m: at(-1.8, WIN.y0 + 0.02, BACK + 0.34) });
      kit.wire(pageFrame, 'rack.js');
      kit.wire(pageFrame, 'mountain-man.js');

      return {
        start: { x: -3.0, z: -0.9, yaw: 0 },
        bounds: { x: [L + 0.9, R - 0.9], z: [BACK + 1.0, -0.6] },
        stops: [
          { name: 'just inside the door, with the whole back wall a window', x: -3.0, z: -0.9, yaw: 0 },
          { name: 'at the cabin’s panel by the door, with the one switch', x: L + 1.55, z: -1.15, yaw: LEFT, frame: row.el },
          { name: 'at the wall by the door, with the cabin’s own page on it', x: L + 2.4, z: -3.2, yaw: LEFT, page: kit.page, frame: pageFrame },
          { name: 'by the stove, with the wolf asleep on the rug', x: -1.9, z: -4.9, yaw: 1.9 },
          { name: 'at the big screen, with David’s playlist on it', x: R - 3.0, z: -4.0, yaw: RIGHT, frame: screen.el },
          { name: 'at the songs on the big screen, one press each', x: R - 2.4, z: -1.3, yaw: RIGHT, frame: songs.el },
          { name: 'at the window, the lake under the full moon and the pack outside', x: -3.0, z: BACK + 1.9, yaw: 0, frame: go.el },
          { name: 'at the window, where the pack can be heard howling', x: -2.4, z: BACK + 1.9, yaw: 0.15, frame: howl.el }
        ]
      };
    }
  };
})();

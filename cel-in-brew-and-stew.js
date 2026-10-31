/* =============================================================================
   Brew and Stew, walked into on Cel Street. Ryan's ask, 2026-10-31: pitch 04
   on the campgrounds, through its post in the field.

   IT IS THE TEA ROOM'S WORLD AND NOBODY ELSE'S (§95): a cabin at the edge of
   the trees, and NOBODY LIT IT. The light is foxfire, growing in the wood: a
   pale cool glow along the joints between the logs, in the moss on the sill
   and in the caps of the little mushrooms at the foot of the walls, enough to
   read by and never enough to throw a shadow. There is no flame anywhere: no
   candle, no lantern, no lamp, and the stove is shut iron, warmth and no
   light. Herbs dry on the beam, tea jars stand on the shelves, the window
   looks onto the night wood, and the tables are slices of log on stumps.

   HABITABLE, off its own page: the board of teas hangs on the wall, and what
   you ask for comes to your table, which you look down at on the slice of log
   in front of you (table.js); the arrangements stand on the shelf by the door
   to take to your table; and the looking-glass by the window, with the rack
   of other woodland tea rooms beside it, plays as it does on the page
   (rack.js). The room's own page hangs on the wall by the stove.

   NOTHING MOVES. Every colour is one the room declares, by name. It keeps
   nothing, sends nothing and fetches nothing; its page arrives through Cel
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
  window.loveCelRooms['brew-and-stew.html'] = {
    name: 'Brew and Stew',
    from: 'campgrounds.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var W = 9, D = 8, H = 2.7, LOG = 0.3;
      var L = -W / 2, R = W / 2, BACK = -D;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;   // facing in, off the left and right walls

      // FOXFIRE: cool, even, from everywhere at once, and nothing casts a shadow.
      kit.scene.background = kit.col('--bns-deep');
      kit.scene.add(new T.HemisphereLight(kit.col('--bns-glow'), kit.col('--bns-night'), 1.9));
      kit.scene.add(new T.AmbientLight(kit.col('--bns-dim'), 0.35));

      // THE FLOOR, and the beam overhead with the herbs drying on it.
      box(W + 0.4, 0.1, D + 0.4, at(0, -0.05, -D / 2), '--bns-deep', false, false);
      for (var b = 0; b < 12; b++) box(W, 0.012, 0.02, at(0, 0.002, -0.35 - b * 0.66), '--bns-iron', false, false);
      box(W + 0.4, 0.14, D + 0.4, at(0, H + 0.07, -D / 2), '--bns-log', false, false);
      box(W, 0.26, 0.3, at(0, H - 0.2, -D / 2), '--bns-log', 0.02);
      var HERBS = ['--bns-moss', '--bns-lavender', '--bns-straw', '--bns-moss', '--bns-heather'];
      for (b = 0; b < 9; b++) {
        var hx = L + 0.8 + b * 0.95;
        // A bunch hung head down to dry: stems tied at the top, splaying out.
        kit.cyl(0.006, 0.006, 0.22, at(hx, H - 0.44, -D / 2), '--bns-straw', false, 4);
        for (var st0 = 0; st0 < 6; st0++) {
          var sa = st0 / 6 * Math.PI * 2 + b, tilt = 0.18 + hash(b, st0, 1) * 0.2;
          var stem = new T.ConeGeometry(0.035, 0.42 + hash(b, st0, 2) * 0.12, 4);
          kit.piece(stem, M(at(hx, H - 0.56, -D / 2, sa), at(0, -0.2, 0, 0, tilt)), HERBS[(b + st0) % HERBS.length], false);
        }
      }

      // THE WALLS: logs laid on each other, round side in, and the foxfire in
      // some of the joints between them, lighting nothing round it.
      function logWall(m, len, gaps) {
        for (var r = 0; r * LOG < H; r++) {
          var y = LOG / 2 + r * LOG;
          var spans = [[-len / 2, len / 2]];
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
          spans.forEach(function (sp, si) {
            var w = sp[1] - sp[0];
            if (w < 0.05) return;
            kit.cyl(LOG / 2, LOG / 2, w, M(m, at((sp[0] + sp[1]) / 2, y, 0, 0, 0, Math.PI / 2)), '--bns-log', 0.02, 10);
            if (r > 0 && hash(r, si, len * 10) < 0.55) {
              var gl = w * (0.3 + hash(r, si, 3) * 0.5), gx = sp[0] + hash(r, si, 4) * (w - gl) + gl / 2;
              kit.flat(new T.PlaneGeometry(gl, 0.026), M(m, at(gx, y - LOG / 2, LOG / 2 + 0.005)), '--bns-glow');
            }
          });
        }
      }
      var WIN = [-2.6, -0.4, 0.95, 2.05];                      // the window in the back wall: x from, x to, y from, y to
      logWall(at(0, 0, BACK), W, [WIN]);
      logWall(at(L, 0, -D / 2, LEFT), D, []);
      logWall(at(R, 0, -D / 2, RIGHT), D, []);
      logWall(at(0, 0, 0, Math.PI), W, [[-3.6, -2.4, 0, 2.1]]);  // the door, at the left of the front wall

      // The plank door, shut behind you, and its latch.
      box(1.1, 2.05, 0.08, at(3.0, 1.03, -0.04), '--bns-log', 0.02);
      for (b = 0; b < 5; b++) box(0.012, 2.0, 0.09, at(2.53 + b * 0.22, 1.03, -0.05), '--bns-iron', false);
      box(0.18, 0.05, 0.05, at(2.62, 1.05, -0.12), '--bns-iron', false);

      // THE WINDOW onto the night wood: a birch frame, a mossy sill with
      // foxfire in the moss, and the trees outside, dark against the dark.
      var wc = (WIN[0] + WIN[1]) / 2, ww0 = WIN[1] - WIN[0], wh0 = WIN[3] - WIN[2], wy = (WIN[2] + WIN[3]) / 2;
      [[0, wh0 / 2 + 0.05, ww0 + 0.2, 0.1], [0, -wh0 / 2 - 0.05, ww0 + 0.2, 0.1]].forEach(function (f) { box(f[2], f[3], 0.22, at(wc + f[0], wy + f[1], BACK + 0.05), '--bns-birch', 0.02); });
      [-1, 0, 1].forEach(function (s) { box(0.08, wh0, 0.2, at(wc + s * ww0 / 2, wy, BACK + 0.05), '--bns-birch', s ? 0.02 : false); });
      box(ww0 + 0.4, 0.06, 0.4, at(wc, WIN[2] - 0.1, BACK + 0.2), '--bns-birch', 0.02);
      for (b = 0; b < 16; b++) {
        var mo = new T.SphereGeometry(0.06 + hash(b, 2, 1) * 0.05, 7, 5); mo.scale(1, 0.45, 1);
        kit.piece(mo, at(wc - ww0 / 2 + 0.1 + hash(b, 2, 2) * (ww0 - 0.2), WIN[2] - 0.05, BACK + 0.15 + hash(b, 2, 3) * 0.25), '--bns-moss', false);
        if (b % 3 === 0) kit.flat(new T.CircleGeometry(0.025, 6), at(wc - ww0 / 2 + 0.2 + hash(b, 2, 4) * (ww0 - 0.4), WIN[2] - 0.03, BACK + 0.2 + hash(b, 2, 5) * 0.2, 0, -Math.PI / 2), '--bns-glow');
      }
      for (b = 0; b < 14; b++) {
        var tx = wc - 6 + hash(b, 3, 1) * 12, tz = BACK - 3 - hash(b, 3, 2) * 10, th = 4 + hash(b, 3, 3) * 3;
        kit.cyl(0.12, 0.18, th, at(tx, th / 2 - 0.3, tz), '--bns-log', false, 6);
        kit.piece(new T.ConeGeometry(0.9 + hash(b, 3, 4) * 0.5, th * 0.7, 7), at(tx, th * 0.75, tz, b), '--bns-night', false);
      }

      // MUSHROOMS at the foot of the walls, their caps the foxfire.
      function shroom(x, z, s, r) {
        kit.cyl(0.02 * s, 0.03 * s, 0.12 * s, at(x, 0.06 * s, z), '--bns-birch', false, 6);
        var cap = new T.SphereGeometry(0.07 * s, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2); cap.scale(1, 0.6, 1);
        kit.flat(cap, at(x, 0.12 * s, z, r || 0), '--bns-glow');
      }
      [[L + 0.25, -1.2], [L + 0.22, -1.35], [L + 0.3, -6.7], [R - 0.25, -6.9], [R - 0.3, -7.1], [R - 0.22, -2.4], [-1.2, BACK + 0.25], [1.9, BACK + 0.22], [2.05, BACK + 0.3]].forEach(function (p, i) {
        shroom(p[0], p[1], 0.8 + hash(i, 4, 1) * 0.9, i);
      });

      // THE STOVE: shut iron, against the left wall, the kettle and the stew pot
      // on top, and its pipe up through the roof. It gives no light.
      var st = at(L + 0.65, 0, -5.6, LEFT);
      box(0.9, 0.85, 0.7, M(st, at(0, 0.43, 0)), '--bns-iron');
      box(0.5, 0.36, 0.04, M(st, at(0, 0.45, 0.37)), '--bns-iron', 0.015);
      [-0.32, 0.32].forEach(function (x) { box(0.08, 0.1, 0.08, M(st, at(x, 0.05, 0.25)), '--bns-iron', false); });
      kit.cyl(0.08, 0.08, H - 0.85, M(st, at(0, 0.85 + (H - 0.85) / 2, -0.15)), '--bns-iron', 0.02, 10);
      kit.cyl(0.14, 0.16, 0.2, M(st, at(-0.2, 0.96, 0.05)), '--bns-stone', 0.02, 14);
      kit.cyl(0.03, 0.03, 0.14, M(st, at(-0.05, 1.0, 0.05, 0, 0, -0.9)), '--bns-stone', false, 5);
      kit.cyl(0.19, 0.17, 0.24, M(st, at(0.22, 0.98, 0.0)), '--bns-stone', 0.02, 16);
      kit.cyl(0.17, 0.17, 0.01, M(st, at(0.22, 1.105, 0.0)), '--bns-stew', false, 16);

      // THE SHELVES OF TEA JARS, on the left wall.
      var sh = at(L + 0.18, 0, -3.3, LEFT);
      var FILL = ['--bns-gold', '--bns-mintea', '--bns-ruby', '--bns-amber', '--bns-rose', '--bns-lavender', '--bns-straw', '--bns-moss'];
      [1.1, 1.55, 2.0].forEach(function (y, row) {
        box(1.8, 0.05, 0.3, M(sh, at(0, y, 0.15)), '--bns-birch', 0.015);
        for (var j = 0; j < 6; j++) {
          var jx = -0.72 + j * 0.29, jh = 0.2 + hash(row, j, 5) * 0.1;
          kit.cyl(0.08, 0.08, jh * 0.7, M(sh, at(jx, y + 0.025 + jh * 0.35, 0.15)), FILL[(row * 3 + j) % FILL.length], false, 10);
          kit.cyl(0.09, 0.09, jh, M(sh, at(jx, y + 0.025 + jh / 2, 0.15)), '--bns-glass', 0.01, 10);
          kit.cyl(0.07, 0.07, 0.04, M(sh, at(jx, y + 0.045 + jh, 0.15)), '--bns-ring', false, 10);
        }
      });

      // THE ROOM'S OWN PAGE, between the shelves and the door on the left wall.
      var pw = 2.0, ph = pw * 800 / 1180;
      var pg = at(L + 0.22, 0, -1.4, LEFT);
      box(pw + 0.16, ph + 0.16, 0.05, M(pg, at(0, 1.45, 0)), '--bns-birch', 0.015);
      var frame = kit.screen(1180, 800, pw, M(pg, at(0, 1.45, 0.04)), 'Brew and Stew’s own page, on the wall by the door');

      // THE TABLES: slices of log on stumps, a stool or two each, and the slice
      // in front of you is your table, which you look down at.
      function table(x, z, r) {
        kit.cyl(0.24, 0.3, 0.68, at(x, 0.34, z), '--bns-log', 0.03, 12);
        kit.cyl(r, r, 0.1, at(x, 0.73, z), '--bns-slice', 0.03, 24);
        [0.3, 0.55, 0.8].forEach(function (f) {
          kit.piece(new T.TorusGeometry(r * f, 0.006, 3, 28), at(x, 0.785, z, 0, Math.PI / 2), '--bns-ring', false);
        });
      }
      function stool(x, z) {
        kit.cyl(0.16, 0.2, 0.42, at(x, 0.21, z), '--bns-log', 0.02, 10);
        kit.cyl(0.19, 0.19, 0.04, at(x, 0.44, z), '--bns-slice', false, 14);
      }
      table(0.6, -3.4, 0.62); stool(0.6, -2.55); stool(1.45, -3.6);
      table(2.6, -6.1, 0.55); stool(2.6, -5.3); stool(1.75, -6.3);
      // A pot of tea already on the far table, and a bowl.
      kit.cyl(0.11, 0.13, 0.17, at(2.45, 0.87, -6.2), '--bns-stone', 0.015, 12);
      kit.cyl(0.13, 0.08, 0.07, at(2.8, 0.82, -5.95), '--bns-stone', 0.015, 12);

      // YOUR TABLE, off the page: what you have asked for, laid on the slice,
      // turned up to you so you can look down at it.
      var mine = kit.lift(frame, '.bns-view', { bare: true, w: 900, ww: 1.05, m: at(0.6, 1.02, -3.55, 0, -1.05), drop: '.bns-room', cls: 'cel-bns-table' });
      var controls = kit.lift(frame, '.bns-controls', { w: 520, ww: 0.62, m: at(1.32, 0.86, -3.3, -0.55, -1.05) });
      kit.lift(frame, '.bns-words', { w: 700, ww: 0.95, m: at(0.6, 1.5, -4.25) });

      // THE BOARD of teas on the right wall, to ask from.
      var teas = kit.lift(frame, '.bns-board', { w: 1100, ww: 1.55, m: at(R - 0.2, 0.5, -3.3, RIGHT) });

      // THE SHELF BY THE DOOR, with the arrangements to take to your table.
      box(2.0, 0.05, 0.36, at(1.15, 0.9, -0.36), '--bns-birch', 0.015);
      [0.25, 2.05].forEach(function (x) { box(0.05, 0.9, 0.3, at(x, 0.45, -0.36), '--bns-birch', false); });
      var arr = kit.lift(frame, '.bns-items.bns-items--arr', { w: 1000, ww: 1.75, m: at(1.15, 0.94, -0.2, Math.PI) });

      // THE LOOKING-GLASS by the window, in a birch frame, and the rack of other
      // woodland tea rooms beside it.
      var gx = 1.45, gy = 1.55, gw = 1.5;
      box(gw + 0.14, gw * 9 / 16 + 0.14, 0.05, at(gx, gy, BACK + 0.18), '--bns-birch', 0.015);
      var glass = kit.lift(frame, '.bns-glass', { w: 820, ww: gw, m: at(gx, gy, BACK + 0.22), cls: 'cel-bns-glass' });
      kit.lift(frame, '.bns-glass__now', { w: 820, ww: gw, m: at(gx, gy + gw * 9 / 32 + 0.14, BACK + 0.22) });
      kit.lift(frame, '.bns-glass__back', { w: 820, ww: gw, m: at(gx, gy - gw * 9 / 32 - 0.2, BACK + 0.22) });
      var rack = kit.lift(frame, '.bns-rack', { w: 1500, ww: 2.9, m: at(R - 0.2, 0.3, -6.2, RIGHT) });
      kit.wire(frame, 'table.js');
      kit.wire(frame, 'rack.js');

      return {
        start: { x: 3.0, z: -0.9, yaw: 0.25 },
        bounds: { x: [L + 0.9, R - 0.9], z: [BACK + 1.0, -0.6] },
        stops: [
          { name: 'just inside the door, out of the dark field', x: 3.0, z: -0.9, yaw: 0.25 },
          { name: 'at your table, the slice of log, looking down at it', x: 0.6, z: -2.3, yaw: 0, pitch: -0.6, frame: controls.el },
          { name: 'at the board of teas, soups and breads on the wall', x: R - 2.4, z: -3.4, yaw: RIGHT, frame: teas.el },
          { name: 'at the shelf by the door, with the arrangements to take to your table', x: 1.15, z: -1.8, yaw: Math.PI, frame: arr.el },
          { name: 'at the looking-glass by the window', x: gx, z: BACK + 2.3, yaw: 0, frame: glass.el },
          { name: 'at the rack of other woodland tea rooms', x: R - 2.6, z: -6.3, yaw: RIGHT, frame: rack.el },
          { name: 'by the shut stove and the shelves of tea jars', x: L + 2.2, z: -4.6, yaw: LEFT },
          { name: 'at the wall by the door, with the tea room’s own page on it', x: L + 2.3, z: -1.4, yaw: LEFT, page: kit.page, frame: frame }
        ]
      };
    }
  };
})();

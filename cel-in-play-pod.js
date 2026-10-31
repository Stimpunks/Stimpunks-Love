/* =============================================================================
   The Play Pod, walked into on Cel Street, through the round door in the
   Faery Yurt. Ryan's ask, 2026-10-31: every doorway in the yurt opening onto
   its own room.

   IT IS HELEN EDGAR'S ROOM AND HER WORLD (§131), and this is OURS: a drawing of
   her pod for Cel Street, in the colours her room declares and nothing else,
   which changes nothing on her page and is hers to keep or send back. THE LAMP
   IS THE ROOM: one UV tube on the wall over one big round tuff tray, and
   everything in the tray FLUORESCES, so it glows only while the lamp is on.
   The scene here is drawn with the lamp on: the room dark violet, the tube
   lit, and in the tray swirls of foam paint, finger marks, a jar of tonic
   water, a galaxy jar and two glow sticks; a shelf of paints and jars on the
   wall, and a sheet on a low table for mark making. Nobody is drawn, and never
   a child. Her own page hangs on the left-hand wall.

   HER LAMP SWITCH IS HER PAGE'S OWN, lifted off it with the drawing above it by
   Cel Street's kit.lift(), standing on an easel by the tray, and play-pod.js,
   which her page loads, is run against the copy: press it and that drawing
   goes to daylight, the ordinary black tray of pale paint, and back.

   NOTHING MOVES. Every colour is one her room declares, by name. It keeps
   nothing, sends nothing and fetches nothing; her page arrives through Cel
   Street's screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 23, 374761393) ^ Math.imul(j + 71, 668265263) ^ Math.imul(k + 73, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['play-pod.html'] = {
    name: 'The Play Pod',
    from: 'faery-yurt.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, W = 8, D = 9, H = 3.0, back = -D;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      // A line of paint as a tube through a few points, glowing.
      function swirl(pts, r, ink) {
        var curve = new T.CatmullRomCurve3(pts.map(function (p) { return new T.Vector3(p[0], p[1], p[2]); }));
        kit.flat(new T.TubeGeometry(curve, 40, r, 6, false), new T.Matrix4(), ink);
      }

      // THE LAMP ON: the room dark, violet from the tube, and nothing else lit.
      kit.scene.background = kit.col('--ppd-night');
      kit.scene.add(new T.HemisphereLight(kit.col('--ppd-uv'), kit.col('--ppd-night'), 1.1));
      var uv = new T.PointLight(kit.col('--ppd-uv'), 18, 10, 1.2);
      uv.position.set(0, 2.3, back + 1.0);
      kit.scene.add(uv);

      // THE ROOM.
      box(W, 0.1, D + 2, at(0, -0.05, -D / 2 + 1), '--ppd-line', false, false);
      box(0.3, H, D + 2, at(-W / 2 - 0.15, H / 2, -D / 2 + 1), '--ppd-tray');
      box(0.3, H, D + 2, at(W / 2 + 0.15, H / 2, -D / 2 + 1), '--ppd-tray');
      box(W + 0.6, H, 0.3, at(0, H / 2, back - 0.15), '--ppd-tray');
      box(W + 0.6, 0.2, D + 2, at(0, H + 0.1, -D / 2 + 1), '--ppd-night', false, false);
      // The round door you came through, behind you.
      [-1, 1].forEach(function (s) { box((W - 1.8) / 2, H, 0.3, at(s * (W + 1.8) / 4, H / 2, 1.15), '--ppd-tray'); });
      box(1.8, H - 1.9, 0.3, at(0, 1.9 + (H - 1.9) / 2, 1.15), '--ppd-tray');
      kit.piece(new T.TorusGeometry(0.9, 0.08, 8, 28, Math.PI), at(0, 1.0, 1.0), '--ppd-line', 0.02);

      // THE UV TUBE on the far wall, lit.
      box(3.4, 0.16, 0.16, at(0, 2.35, back + 0.12), '--ppd-line', 0.02);
      kit.flat(new T.CylinderGeometry(0.05, 0.05, 3.2, 10), at(0, 2.35, back + 0.24, 0, 0, Math.PI / 2), '--ppd-uv');

      // THE TUFF TRAY on its low stand, and what is in it.
      var tz = -4.6, TR = 1.15, TY = 0.62;
      kit.cyl(TR, TR - 0.08, 0.14, at(0, TY, tz), '--ppd-tray', 0.03, 36);
      kit.cyl(TR - 0.1, TR - 0.1, 0.02, at(0, TY + 0.075, tz), '--ppd-night', false, 36);
      [[-0.8, -0.3], [0.8, -0.3], [-0.5, 0.6], [0.5, 0.6]].forEach(function (l) {
        box(0.06, TY, 0.06, at(l[0], TY / 2, tz + l[1]), '--ppd-line', 0.01);
      });
      var y0 = TY + 0.1;
      swirl([[-0.6, y0, tz + 0.1], [-0.35, y0, tz - 0.25], [-0.05, y0, tz + 0.05], [0.15, y0, tz - 0.2], [0.05, y0, tz - 0.4]], 0.035, '--ppd-pink');
      swirl([[0.1, y0, tz + 0.25], [0.35, y0, tz + 0.1], [0.5, y0, tz + 0.3], [0.35, y0, tz + 0.5]], 0.03, '--ppd-green');
      swirl([[-0.75, y0, tz + 0.45], [-0.55, y0, tz + 0.3], [-0.35, y0, tz + 0.45], [-0.15, y0, tz + 0.35]], 0.015, '--ppd-green');
      swirl([[0.45, y0, tz - 0.45], [0.65, y0, tz - 0.3], [0.8, y0, tz - 0.05]], 0.015, '--ppd-orange');
      // A jar of tonic water, glowing blue, and a galaxy jar.
      kit.flat(new T.CylinderGeometry(0.1, 0.1, 0.3, 14), at(0.55, y0 + 0.15, tz - 0.05), '--ppd-blue');
      kit.cyl(0.11, 0.11, 0.04, at(0.55, y0 + 0.32, tz - 0.05), '--ppd-line', false, 14);
      kit.piece(new T.CylinderGeometry(0.09, 0.09, 0.26, 14), at(-0.5, y0 + 0.13, tz - 0.45), '--ppd-tray', 0.01);
      for (var g = 0; g < 7; g++) kit.flat(new T.SphereGeometry(0.012, 5, 3), at(-0.5 + (hash(g, 1, 1) - 0.5) * 0.12, y0 + 0.04 + hash(g, 1, 2) * 0.2, tz - 0.45 + 0.092), '--ppd-yellow');
      // Two glow sticks.
      kit.flat(new T.CylinderGeometry(0.018, 0.018, 0.4, 8), at(0.75, y0 + 0.02, tz + 0.35, 0.5, 0, Math.PI / 2), '--ppd-yellow');
      kit.flat(new T.CylinderGeometry(0.018, 0.018, 0.34, 8), at(-0.8, y0 + 0.02, tz - 0.1, -0.4, 0, Math.PI / 2), '--ppd-orange');

      var stops = [{ name: 'just through the round door', x: 0, z: -0.3, yaw: 0 },
                   { name: 'at the tuff tray, under the lamp', x: 0, z: tz + 2.1, yaw: 0 }];

      // A SHELF of paints and jars on the right-hand wall.
      var sh = at(W / 2 - 0.2, 0, -5.0, -Math.PI / 2);
      [1.0, 1.6].forEach(function (y, row) {
        box(2.6, 0.06, 0.32, M(sh, at(0, y, 0)), '--ppd-line', 0.01);
        for (var j = 0; j < 7; j++) {
          var inks = ['--ppd-pink', '--ppd-green', '--ppd-blue', '--ppd-orange', '--ppd-yellow'];
          kit.flat(new T.CylinderGeometry(0.07, 0.07, 0.16 + (j % 3) * 0.05, 12), M(sh, at(-1.1 + j * 0.36, y + 0.12 + (j % 3) * 0.025, 0.02)), inks[(row * 2 + j) % inks.length]);
        }
      });
      stops.push({ name: 'at the shelf of paints and jars', x: W / 2 - 2.4, z: -5.0, yaw: -Math.PI / 2 });

      // A LOW TABLE with a sheet on it, for mark making, the marks glowing.
      var mt = at(-2.0, 0, -2.2, 0.3);
      box(1.4, 0.5, 0.9, M(mt, at(0, 0.25, 0)), '--ppd-line', 0.02);
      box(1.1, 0.01, 0.7, M(mt, at(0, 0.51, 0)), '--ppd-tray', false);
      var mtv = function (x, z) { return new T.Vector3(x, 0.53, z).applyMatrix4(mt); };
      [[[-0.4, -0.2], [-0.2, 0.1], [0.05, -0.15], [0.3, 0.15]], [[-0.35, 0.22], [0, 0.2], [0.35, -0.2]]].forEach(function (line, i) {
        var pts = line.map(function (p) { var v = mtv(p[0], p[1]); return [v.x, v.y, v.z]; });
        swirl(pts, 0.012, i ? '--ppd-pink' : '--ppd-yellow');
      });
      stops.push({ name: 'at the low table, for mark making', x: -1.4, z: -0.4, yaw: 0.6 });

      // HER OWN PAGE on the left-hand wall.
      var pw = 3.0, ph = pw * 800 / 1180, py = 0.5 + ph / 2;
      var pg = at(-W / 2 + 0.02, 0, -5.6, Math.PI / 2);
      box(pw + 0.2, ph + 0.2, 0.06, M(pg, at(0, py, 0)), '--ppd-line');
      var frame = kit.screen(1180, 800, pw, M(pg, at(0, py, 0.04)), 'The Play Pod’s own page, on the left-hand wall');
      stops.push({ name: 'at the wall, with her room’s own page on it', x: -W / 2 + 2.8, z: -5.6, yaw: Math.PI / 2, page: kit.page, frame: frame });

      // HER LAMP SWITCH, with its drawing, on an easel at the back of the tray.
      var ex = 2.1, ez = back + 1.6;
      [-1, 1].forEach(function (s) { box(0.05, 1.7, 0.05, at(ex + s * 0.6, 0.85, ez, 0, -0.08), '--ppd-line', 0.01); });
      box(1.6, 0.05, 0.14, at(ex, 0.82, ez + 0.06), '--ppd-line', 0.01);
      var lamp = kit.lift(frame, '.ppd-lamp', { w: 600, ww: 1.4, m: at(ex, 0.86, ez + 0.1) });
      stops.push({ name: 'at the easel, with the lamp switch', x: ex - 0.3, z: ez + 2.2, yaw: 0.12, frame: lamp.el });
      kit.wire(frame, 'play-pod.js');

      return {
        start: { x: 0, z: -0.3, yaw: 0 },
        bounds: { x: [-W / 2 + 0.8, W / 2 - 0.8], z: [back + 1.6, 0.4] },
        stops: stops
      };
    }
  };
})();

/* =============================================================================
   The Play Pod, walked into on Cel Street, through the round door in the
   Faery Yurt. Ryan's ask, 2026-10-31: every doorway in the yurt opening onto
   its own room.

   IT IS HELEN EDGAR'S ROOM AND HER WORLD (§131), and this is OURS: a drawing of
   her pod for Cel Street, in the colours her room declares and nothing else,
   which changes nothing on her page and is hers to keep or send back. THE LAMP
   IS THE ROOM: one UV tube on the wall over one big round tuff tray, and
   everything in the tray FLUORESCES, so it glows only while the lamp is on.
   The scene opens with the lamp on: the room dark violet, the tube
   lit, and in the tray swirls of foam paint, finger marks, a jar of tonic
   water, a galaxy jar and two glow sticks; a shelf of paints and jars on the
   wall, and a sheet on a low table for mark making. Nobody is drawn, and never
   a child. Her own page hangs on the left-hand wall.

   ROUND TWO (Ryan's ask, 2026-11-04) drew more of what her page has in it, and
   nothing it does not: puffs of foam paint and trails of finger marks in the
   tray, its rim lit; a stool beside it with tonic water poured full, half and
   a quarter, the glow fading jar by jar, and glow sticks in a warm glass and a
   cold one; a lava lamp, oil and water, galaxy jars, glow nail varnish and a
   UV torch on the shelf; plain white paper, highlighters and shaving-cream
   sensory bags on the table; a big sheet taped to the wall with giant brushes
   and a spray bottle under it; a messy play mat in the back corner with
   oobleck, sponges in a tub of water, pom-poms and pegs and cups of oats; and
   her film for the pod, lifted off her page onto a shelf on the back wall,
   where it plays as it does there. Four more places to stand. Every glowing
   thing still goes to its pale daylight when her lamp goes off, the haze of
   the tube with it.

   HER LAMP SWITCH IS HER PAGE'S OWN, lifted off it with the drawing above it by
   Cel Street's kit.lift(), standing on an easel by the tray, and play-pod.js,
   which her page loads, is run against the copy: press it and that drawing
   goes to daylight, the ordinary black tray of pale paint, and back, and the
   room follows it, in the daylight colours her room declares for that.

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
      var FLAT = -Math.PI / 2;
      var INKS = ['--ppd-pink', '--ppd-green', '--ppd-blue', '--ppd-orange', '--ppd-yellow'];
      // Everything that glows under the lamp is kept with its daylight colour,
      // so her lamp switch can take it back to pale paint. The glass and the
      // white paper are kept with theirs too, so nothing keeps the night's
      // colour in the day.
      var DAY = { '--ppd-pink': '--ppd-day-pink', '--ppd-green': '--ppd-day-green', '--ppd-yellow': '--ppd-day-yellow',
                  '--ppd-blue': '--ppd-day-blue', '--ppd-orange': '--ppd-day-yellow', '--ppd-uv': '--ppd-day-tube',
                  '--ppd-ink': '--ppd-day', '--ppd-line': '--ppd-day-stand', '--ppd-night': '--ppd-day-tray' };
      var glows = [], hazes = [];
      function glow(geo, m, ink) { var mesh = kit.flat(geo, m, ink); glows.push([mesh, ink]); return mesh; }
      // A glow seen through water, or poured thinner: the same ink, fainter.
      function faint(mesh, a) {
        mesh.material.transparent = true; mesh.material.opacity = a; mesh.material.depthWrite = false;
        return mesh;
      }
      // The lamp's own light on the wall and the floor, which is there only
      // while the lamp is on.
      function haze(geo, m, a) { var mesh = faint(kit.flat(geo, m, '--ppd-uv'), a); hazes.push(mesh); return mesh; }
      // A line of paint as a tube through a few points, glowing.
      function swirl(pts, r, ink) {
        var curve = new T.CatmullRomCurve3(pts.map(function (p) { return new T.Vector3(p[0], p[1], p[2]); }));
        return glow(new T.TubeGeometry(curve, 40, r, 6, false), new T.Matrix4(), ink);
      }
      // A dab, squashed flat: a puff of foam paint, a finger mark, a drip.
      function dab(x, y, z, r, ink, tall) {
        var g = new T.SphereGeometry(r, 10, 6); g.scale(1, tall || 0.45, 1);
        return glow(g, at(x, y, z), ink);
      }

      // THE LAMP ON: the room dark, violet from the tube, and nothing else lit.
      kit.scene.background = kit.col('--ppd-night');
      var sky = new T.HemisphereLight(kit.col('--ppd-uv'), kit.col('--ppd-night'), 1.1);
      kit.scene.add(sky);
      var uv = new T.PointLight(kit.col('--ppd-uv'), 18, 10, 1.2);
      uv.position.set(0, 2.3, back + 1.0);
      kit.scene.add(uv);

      // THE ROOM.
      box(W, 0.1, D + 2, at(0, -0.05, -D / 2 + 1), '--ppd-line', false, false);
      box(0.3, H, D + 2, at(-W / 2 - 0.15, H / 2, -D / 2 + 1), '--ppd-tray');
      box(0.3, H, D + 2, at(W / 2 + 0.15, H / 2, -D / 2 + 1), '--ppd-tray');
      box(W + 0.6, H, 0.3, at(0, H / 2, back - 0.15), '--ppd-tray');
      box(W + 0.6, 0.2, D + 2, at(0, H + 0.1, -D / 2 + 1), '--ppd-tray', false, false);
      // A skirting round the floor, where it meets the walls.
      [-1, 1].forEach(function (s) { box(0.04, 0.12, D + 2, at(s * (W / 2 - 0.02), 0.06, -D / 2 + 1), '--ppd-line', false, false); });
      box(W, 0.12, 0.04, at(0, 0.06, back + 0.02), '--ppd-line', false, false);
      // The round door you came through, behind you.
      [-1, 1].forEach(function (s) { box((W - 1.8) / 2, H, 0.3, at(s * (W + 1.8) / 4, H / 2, 1.15), '--ppd-tray'); });
      box(1.8, H - 1.9, 0.3, at(0, 1.9 + (H - 1.9) / 2, 1.15), '--ppd-tray');
      kit.piece(new T.TorusGeometry(0.9, 0.08, 8, 28, Math.PI), at(0, 1.0, 1.0), '--ppd-line', 0.02);

      // THE UV TUBE on the far wall, lit, and its haze on the wall round it.
      box(3.4, 0.16, 0.16, at(0, 2.35, back + 0.12), '--ppd-line', 0.02);
      glow(new T.CylinderGeometry(0.05, 0.05, 3.2, 10), at(0, 2.35, back + 0.24, 0, 0, Math.PI / 2), '--ppd-uv');
      // Rings of it, each a little smaller and on the one before, so the haze
      // is brightest at the tube and has no edge you could point at.
      [[2.9, 0.9, 0.05], [2.4, 0.66, 0.06], [2.0, 0.42, 0.08], [1.8, 0.22, 0.1]].forEach(function (r, i) {
        var hg = new T.CircleGeometry(1, 40); hg.scale(r[0], r[1], 1);
        haze(hg, at(0, 2.35, back + 0.02 + i * 0.004), r[2]);
      });

      // THE TUFF TRAY on its low stand, on a wipe-clean mat, and what is in it.
      var tz = -4.6, TR = 1.15, TY = 0.62;
      box(3.2, 0.012, 2.8, at(0, 0.006, tz), '--ppd-tray', false, false);
      [[2.0, 0.05], [1.5, 0.06], [1.1, 0.07]].forEach(function (r, i) {
        haze(new T.CircleGeometry(r[0], 40), at(0, 0.014 + i * 0.002, tz, 0, FLAT), r[1]);
      });
      kit.cyl(TR, TR - 0.08, 0.14, at(0, TY, tz), '--ppd-tray', 0.03, 36);
      kit.cyl(TR - 0.1, TR - 0.1, 0.02, at(0, TY + 0.075, tz), '--ppd-night', false, 36);
      // Its rim, catching the lamp.
      glow(new T.TorusGeometry(TR - 0.05, 0.016, 6, 48), at(0, TY + 0.072, tz, 0, FLAT), '--ppd-uv');
      [[-0.8, -0.3], [0.8, -0.3], [-0.5, 0.6], [0.5, 0.6]].forEach(function (l) {
        box(0.06, TY, 0.06, at(l[0], TY / 2, tz + l[1]), '--ppd-line', 0.01);
      });
      var y0 = TY + 0.1;
      swirl([[-0.6, y0, tz + 0.1], [-0.35, y0, tz - 0.25], [-0.05, y0, tz + 0.05], [0.15, y0, tz - 0.2], [0.05, y0, tz - 0.4]], 0.035, '--ppd-pink');
      swirl([[0.1, y0, tz + 0.25], [0.35, y0, tz + 0.1], [0.5, y0, tz + 0.3], [0.35, y0, tz + 0.5]], 0.03, '--ppd-green');
      swirl([[-0.75, y0, tz + 0.45], [-0.55, y0, tz + 0.3], [-0.35, y0, tz + 0.45], [-0.15, y0, tz + 0.35]], 0.015, '--ppd-green');
      swirl([[0.45, y0, tz - 0.45], [0.65, y0, tz - 0.3], [0.8, y0, tz - 0.05]], 0.015, '--ppd-orange');
      swirl([[-0.2, y0, tz + 0.75], [0.05, y0, tz + 0.62], [0.3, y0, tz + 0.78]], 0.022, '--ppd-yellow');
      // Puffs of foam paint, heaped where a hand let go of them.
      [[-0.32, tz - 0.05, '--ppd-pink'], [0.42, tz + 0.32, '--ppd-green'], [-0.05, tz + 0.48, '--ppd-pink'], [0.7, tz + 0.12, '--ppd-yellow']].forEach(function (p, i) {
        for (var k = 0; k < 4; k++) {
          dab(p[0] + (hash(i, k, 3) - 0.5) * 0.16, y0 + 0.01, p[1] + (hash(i, k, 4) - 0.5) * 0.12, 0.04 + hash(i, k, 5) * 0.03, p[2], 0.6);
        }
      });
      // Trails of finger marks, dot after dot, across the tray's floor.
      [[-0.85, tz - 0.2, 0.3, -0.18, '--ppd-yellow'], [0.2, tz - 0.75, 0.28, 0.1, '--ppd-blue'], [-0.65, tz + 0.65, 0.3, 0.06, '--ppd-orange']].forEach(function (t) {
        for (var f = 0; f < 5; f++) dab(t[0] + f * t[2] / 2.2, y0 - 0.005, t[1] + f * t[3] / 2.2 + Math.sin(f * 1.3) * 0.03, 0.022, t[4], 0.3);
      });
      // A jar of tonic water, glowing blue, and a galaxy jar.
      glow(new T.CylinderGeometry(0.1, 0.1, 0.3, 14), at(0.55, y0 + 0.15, tz - 0.05), '--ppd-blue');
      kit.cyl(0.11, 0.11, 0.04, at(0.55, y0 + 0.32, tz - 0.05), '--ppd-line', false, 14);
      kit.piece(new T.CylinderGeometry(0.09, 0.09, 0.26, 14), at(-0.5, y0 + 0.13, tz - 0.45), '--ppd-tray', 0.01);
      for (var g = 0; g < 7; g++) glow(new T.SphereGeometry(0.012, 5, 3), at(-0.5 + (hash(g, 1, 1) - 0.5) * 0.12, y0 + 0.04 + hash(g, 1, 2) * 0.2, tz - 0.45 + 0.092), '--ppd-yellow');
      // Two glow sticks.
      glow(new T.CylinderGeometry(0.018, 0.018, 0.4, 8), at(0.75, y0 + 0.02, tz + 0.35, 0.5, 0, Math.PI / 2), '--ppd-yellow');
      glow(new T.CylinderGeometry(0.018, 0.018, 0.34, 8), at(-0.8, y0 + 0.02, tz - 0.1, -0.4, 0, Math.PI / 2), '--ppd-orange');

      var stops = [{ name: 'just through the round door', x: 0, z: -0.3, yaw: 0 },
                   { name: 'at the tuff tray, under the lamp', x: 0, z: tz + 2.1, yaw: 0, pitch: -0.22 }];

      // A STOOL BY THE TRAY: tonic water poured full, half with water and a
      // quarter, the glow fading jar by jar, and glow sticks in a glass of warm
      // water and a glass of cold.
      var sx = 1.78, sz = tz + 0.45, SY = 0.42;
      box(0.95, 0.05, 0.46, at(sx, SY - 0.025, sz), '--ppd-line', 0.015);
      [[-0.4, -0.18], [0.4, -0.18], [-0.4, 0.18], [0.4, 0.18]].forEach(function (l) {
        box(0.04, SY - 0.05, 0.04, at(sx + l[0], (SY - 0.05) / 2, sz + l[1]), '--ppd-line', 0.01);
      });
      [1, 0.55, 0.28].forEach(function (a, i) {
        var gx = sx - 0.34 + i * 0.15;
        faint(glow(new T.CylinderGeometry(0.048, 0.044, 0.15, 14), at(gx, SY + 0.075, sz), '--ppd-blue'), a);
        faint(glow(new T.CylinderGeometry(0.052, 0.052, 0.17, 14, 1, true), at(gx, SY + 0.085, sz), '--ppd-line'), 0.35);
      });
      [[0.18, 1], [0.34, 0.42]].forEach(function (w, i) {
        var gx = sx + w[0];
        faint(glow(new T.CylinderGeometry(0.06, 0.055, 0.15, 14), at(gx, SY + 0.075, sz + 0.02), '--ppd-line'), 0.4);
        faint(glow(new T.CylinderGeometry(0.012, 0.012, 0.19, 8), at(gx + 0.01, SY + 0.1, sz + 0.02, 0, 0, i ? -0.25 : 0.25), '--ppd-green'), w[1]);
      });
      stops.push({ name: 'at the stool by the tray: tonic water fading jar by jar, and glow sticks in warm water and in cold', x: sx - 0.1, z: sz + 1.9, yaw: 0.05, pitch: -0.45 });

      // A SHELF of paints and jars on the right-hand wall: paint pots, glow nail
      // varnish and a UV torch below; galaxy jars, a lava lamp and a jar of
      // oil and water above.
      var sh = at(W / 2 - 0.2, 0, -5.0, -Math.PI / 2);
      var on = function (x, y, z) { return M(sh, at(x, y, z || 0.02)); };
      [1.0, 1.6].forEach(function (y) { box(2.6, 0.06, 0.32, M(sh, at(0, y, 0)), '--ppd-line', 0.01); });
      [-1.1, -0.78, -0.46].forEach(function (x, j) {
        var tall = 0.16 + (j % 3) * 0.05;
        glow(new T.CylinderGeometry(0.07, 0.07, tall, 12), on(x, 1.03 + tall / 2), INKS[j]);
        kit.cyl(0.072, 0.072, 0.03, on(x, 1.045 + tall), '--ppd-line', false, 12);
      });
      for (var nv = 0; nv < 5; nv++) {
        glow(new T.CylinderGeometry(0.024, 0.026, 0.06, 10), on(-0.18 + nv * 0.11, 1.06), INKS[(nv + 2) % 5]);
        kit.cyl(0.011, 0.011, 0.05, on(-0.18 + nv * 0.11, 1.115), '--ppd-line', false, 8);
      }
      // A UV torch, the kind marked 365 nm, lying on its side, its lens lit.
      kit.piece(new T.CylinderGeometry(0.032, 0.03, 0.24, 12), on(0.78, 1.065, 0.04).multiply(at(0, 0, 0, 0, 0, Math.PI / 2)), '--ppd-line', 0.008);
      glow(new T.CircleGeometry(0.026, 14), on(0.9, 1.065, 0.04).multiply(at(0, 0, 0, Math.PI / 2)), '--ppd-uv');
      // Galaxy jars, cotton wool and water and glowing paint in layers.
      [-1.02, -0.72].forEach(function (x, j) {
        [['--ppd-blue', 0.07], ['--ppd-uv', 0.07], ['--ppd-pink', 0.06]].forEach(function (l, k) {
          faint(glow(new T.CylinderGeometry(0.075, 0.075, l[1], 14), on(x, 1.66 + k * 0.07), j ? INKS[(k + 2) % 5] : l[0]), 0.7);
        });
        kit.cyl(0.08, 0.08, 0.03, on(x, 1.86), '--ppd-line', false, 14);
        for (var s = 0; s < 6; s++) glow(new T.SphereGeometry(0.008, 4, 3), on(x + (hash(j, s, 7) - 0.5) * 0.11, 1.66 + hash(j, s, 8) * 0.17, 0.095), '--ppd-yellow');
      });
      // A glowing lava lamp in a jar: oil and water, and blobs rising through it.
      kit.cyl(0.075, 0.09, 0.06, on(-0.25, 1.66), '--ppd-line', 0.008, 14);
      faint(glow(new T.CylinderGeometry(0.065, 0.065, 0.3, 14), on(-0.25, 1.84), '--ppd-orange'), 0.4);
      [[0, 1.72, 0.035], [0.02, 1.83, 0.025], [-0.02, 1.93, 0.03], [0.015, 1.97, 0.018]].forEach(function (b) {
        glow(new T.SphereGeometry(b[2], 10, 8), on(-0.25 + b[0], b[1], 0.03), '--ppd-pink');
      });
      kit.cyl(0.07, 0.07, 0.03, on(-0.25, 2.005), '--ppd-line', false, 14);
      // Oil that glows, floating on water, and never mixing.
      faint(glow(new T.CylinderGeometry(0.08, 0.08, 0.13, 14), on(0.2, 1.695), '--ppd-blue'), 0.75);
      glow(new T.CylinderGeometry(0.08, 0.08, 0.08, 14), on(0.2, 1.8), '--ppd-yellow');
      kit.cyl(0.085, 0.085, 0.03, on(0.2, 1.855), '--ppd-line', false, 14);
      [0.62, 0.95].forEach(function (x, j) {
        var tall = 0.18 + j * 0.06;
        glow(new T.CylinderGeometry(0.07, 0.07, tall, 12), on(x, 1.63 + tall / 2), INKS[j + 3]);
        kit.cyl(0.072, 0.072, 0.03, on(x, 1.645 + tall), '--ppd-line', false, 12);
      });
      stops.push({ name: 'at the shelf of paints and jars', x: W / 2 - 2.4, z: -5.0, yaw: -Math.PI / 2 });

      // A LOW TABLE for mark making: plain white paper, which glows too, with
      // marks on it, a pot of highlighters, and shaving-cream sensory bags with
      // a finger's line drawn through each.
      var mt = at(-2.0, 0, -2.2, 0.3);
      box(1.8, 0.5, 0.9, M(mt, at(0, 0.25, 0)), '--ppd-line', 0.02);
      glow(new T.PlaneGeometry(1.0, 0.7), M(mt, at(-0.32, 0.505, 0, 0, FLAT)), '--ppd-ink');
      var mtv = function (x, z) { return new T.Vector3(x, 0.52, z).applyMatrix4(mt); };
      [[[-0.72, -0.2], [-0.52, 0.1], [-0.27, -0.15], [-0.02, 0.15]], [[-0.67, 0.22], [-0.32, 0.2], [0.03, -0.2]]].forEach(function (line, i) {
        var pts = line.map(function (p) { var v = mtv(p[0], p[1]); return [v.x, v.y, v.z]; });
        swirl(pts, 0.012, i ? '--ppd-pink' : '--ppd-blue');
      });
      kit.cyl(0.06, 0.055, 0.12, M(mt, at(0.6, 0.56, -0.25)), '--ppd-line', 0.008, 12);
      for (var hp = 0; hp < 4; hp++) {
        glow(new T.CylinderGeometry(0.012, 0.012, 0.15, 6), M(mt, at(0.6 + (hp - 1.5) * 0.022, 0.64, -0.25, 0, (hp - 1.5) * 0.12, (hp - 1.5) * 0.15)), INKS[hp]);
      }
      [[0.42, 0.18, '--ppd-pink'], [0.68, 0.12, '--ppd-green']].forEach(function (b, i) {
        faint(glow(new T.BoxGeometry(0.26, 0.018, 0.2), M(mt, at(b[0], 0.51, b[1], i * 0.2)), b[2]), 0.85);
        var a = mtv(b[0] - 0.08, b[1] - 0.05), c = mtv(b[0] + 0.02, b[1] + 0.06), d = mtv(b[0] + 0.09, b[1] - 0.02);
        swirl([[a.x, a.y + 0.01, a.z], [c.x, c.y + 0.01, c.z], [d.x, d.y + 0.01, d.z]], 0.006, '--ppd-night');
      });
      stops.push({ name: 'at the low table, for mark making', x: -1.4, z: -0.4, yaw: 0.6, pitch: -0.35 });

      // A BIG SHEET taped to the right-hand wall, for marks made big with giant
      // brushes, and the brushes in their pot under it, with a spray bottle.
      var bz = -2.2;
      glow(new T.PlaneGeometry(1.7, 1.15), at(W / 2 - 0.01, 1.35, bz, -Math.PI / 2), '--ppd-ink');
      [[-0.8, 0.54], [0.8, 0.54], [-0.8, -0.54], [0.8, -0.54]].forEach(function (t) {
        box(0.01, 0.06, 0.14, at(W / 2 - 0.02, 1.35 + t[1], bz + t[0]), '--ppd-ink-2', false, false);
      });
      var wx = W / 2 - 0.03;
      swirl([[wx, 1.7, bz + 0.65], [wx, 1.45, bz + 0.3], [wx, 1.62, bz - 0.05], [wx, 1.35, bz - 0.4], [wx, 1.55, bz - 0.7]], 0.03, '--ppd-pink');
      swirl([[wx, 1.05, bz + 0.6], [wx, 1.2, bz + 0.2], [wx, 1.0, bz - 0.15], [wx, 1.18, bz - 0.55]], 0.026, '--ppd-green');
      swirl([[wx, 1.82, bz - 0.2], [wx, 1.25, bz - 0.05]], 0.02, '--ppd-orange');
      [[1.12, bz + 0.45], [0.95, bz - 0.5], [1.62, bz - 0.5]].forEach(function (p, i) {
        var sg = new T.SphereGeometry(0.05, 10, 6); sg.scale(0.3, 1, 1);
        glow(sg, at(wx, p[0], p[1]), INKS[(i + 2) % 5]);
      });
      kit.cyl(0.16, 0.14, 0.32, at(W / 2 - 0.3, 0.16, bz + 0.35), '--ppd-line', 0.012, 14);
      [[-0.06, 0.2, '--ppd-yellow'], [0.05, -0.15, '--ppd-blue'], [0, 0.02, '--ppd-pink']].forEach(function (b) {
        var bm = at(W / 2 - 0.3 + b[0], 0.52, bz + 0.35, 0, 0, b[1]);
        kit.piece(new T.CylinderGeometry(0.014, 0.014, 0.5, 6), bm, '--ppd-line', false);
        glow(new T.BoxGeometry(0.09, 0.08, 0.04), M(bm, at(0, 0.27, 0)), b[2]);
      });
      faint(glow(new T.CylinderGeometry(0.05, 0.055, 0.2, 12), at(W / 2 - 0.32, 0.1, bz - 0.25), '--ppd-blue'), 0.6);
      box(0.05, 0.08, 0.05, at(W / 2 - 0.32, 0.24, bz - 0.25), '--ppd-line', 0.008);
      box(0.08, 0.025, 0.025, at(W / 2 - 0.36, 0.27, bz - 0.25), '--ppd-line', 0.008);
      stops.push({ name: 'at the big sheet on the wall, with the giant brushes', x: 1.4, z: bz, yaw: -Math.PI / 2 });

      // A MESSY PLAY MAT in the back corner: oobleck in a bowl, sponges in a tub
      // of water, a basket of pom-poms with pegs on its rim, and cups of oats.
      var mm = at(-2.55, 0, back + 1.25, 0.15);
      var onMat = function (x, y, z) { return M(mm, at(x, y, z)); };
      box(2.2, 0.012, 1.4, onMat(0, 0.006, 0), '--ppd-tray', false, false);
      kit.cyl(0.26, 0.18, 0.13, onMat(-0.6, 0.075, 0.1), '--ppd-line', 0.01, 20);
      kit.cyl(0.24, 0.24, 0.01, onMat(-0.6, 0.145, 0.1), '--ppd-ink-2', false, 20);
      kit.piece(new T.CylinderGeometry(0.014, 0.014, 0.42, 6), M(onMat(-0.48, 0.2, 0.06), at(0, 0, 0, 0.4, 0, -1.1)), '--ppd-line', false);
      kit.cyl(0.36, 0.32, 0.16, onMat(0.15, 0.09, -0.2), '--ppd-line', 0.01, 22);
      faint(glow(new T.CircleGeometry(0.33, 22), M(onMat(0.15, 0.172, -0.2), at(0, 0, 0, 0, FLAT)), '--ppd-blue'), 0.45);
      [[0.03, -0.27, '--ppd-yellow'], [0.27, -0.12, '--ppd-pink'], [0.1, -0.06, '--ppd-green'], [0.25, -0.33, '--ppd-orange']].forEach(function (sp, i) {
        glow(new T.BoxGeometry(0.13, 0.05, 0.09), onMat(sp[0], 0.18, sp[1]).multiply(at(0, 0, 0, i * 0.7)), sp[2]);
      });
      kit.cyl(0.2, 0.17, 0.16, onMat(0.75, 0.08, 0.25), '--ppd-line', 0.01, 18);
      for (var pp = 0; pp < 12; pp++) {
        var pa = hash(pp, 2, 9) * Math.PI * 2, pr = hash(pp, 3, 9) * 0.13;
        glow(new T.SphereGeometry(0.035, 8, 6), onMat(0.75 + Math.cos(pa) * pr, 0.17 + hash(pp, 4, 9) * 0.04, 0.25 + Math.sin(pa) * pr), INKS[pp % 5]);
      }
      [0, 1.4, 2.6, 4.1].forEach(function (a, i) {
        glow(new T.BoxGeometry(0.018, 0.07, 0.03), onMat(0.75 + Math.cos(a) * 0.19, 0.17, 0.25 + Math.sin(a) * 0.19).multiply(at(0, 0, 0, -a)), INKS[(i + 3) % 5]);
      });
      [[-0.15, 0.4, 0.07], [0.02, 0.45, 0.055], [0.15, 0.48, 0.045]].forEach(function (c) {
        kit.cyl(c[2], c[2] * 0.85, c[2] * 0.9, onMat(c[0], c[2] * 0.45, c[1]), '--ppd-line', 0.006, 12);
        kit.cyl(c[2] * 0.95, c[2] * 0.95, 0.006, onMat(c[0], c[2] * 0.9 + 0.004, c[1]), '--ppd-ink-2', false, 12);
      });
      stops.push({ name: 'at the messy play mat, in the back corner', x: -1.3, z: back + 3.0, yaw: 0.55, pitch: -0.45 });

      // A few drips that missed the tray, glowing where they fell.
      [['--ppd-pink', -1.25, tz + 1.35, 0.05], ['--ppd-green', 1.2, tz + 1.2, 0.04], ['--ppd-yellow', 0.35, tz + 1.55, 0.035], ['--ppd-orange', -0.6, tz - 1.4, 0.03]].forEach(function (d) {
        glow(new T.CircleGeometry(d[3], 12), at(d[1], 0.016, d[2], 0, FLAT), d[0]);
      });

      // HER OWN PAGE on the left-hand wall.
      var pw = 3.0, ph = pw * 800 / 1180, py = 0.5 + ph / 2;
      var pg = at(-W / 2 + 0.02, 0, -5.6, Math.PI / 2);
      box(pw + 0.2, ph + 0.2, 0.06, M(pg, at(0, py, 0)), '--ppd-line');
      var frame = kit.screen(1180, 800, pw, M(pg, at(0, py, 0.04)), 'The Play Pod’s own page, on the left-hand wall');
      stops.push({ name: 'at the wall, with her room’s own page on it', x: -W / 2 + 2.8, z: -5.6, yaw: Math.PI / 2, page: kit.page, frame: frame });

      // HER FILM FOR THE POD, lifted off her page onto a shelf on the back
      // wall: it plays here as it does there, and nothing of YouTube's arrives
      // until it is pressed. The button that puts it on her page's own screen
      // works only there, so it is left behind.
      var fx = -2.5;
      box(1.2, 0.05, 0.24, at(fx, 1.0, back + 0.12), '--ppd-line', 0.01);
      [-0.45, 0.45].forEach(function (s) { box(0.04, 0.16, 0.18, at(fx + s, 0.92, back + 0.1), '--ppd-line', 0.008); });
      var film = kit.lift(frame, '.ppd-vid', { w: 340, ww: 0.98, m: at(fx, 1.03, back + 0.14), drop: '.ppd-vid__up' });
      stops.push({ name: 'at the film for the pod, on the back wall', x: fx + 0.15, z: back + 2.2, yaw: 0.05, frame: film.el });

      // HER LAMP SWITCH, with its drawing, on an easel at the back of the tray.
      var ex = 2.1, ez = back + 1.6;
      [-1, 1].forEach(function (s) { box(0.05, 1.7, 0.05, at(ex + s * 0.6, 0.85, ez, 0, -0.08), '--ppd-line', 0.01); });
      box(1.6, 0.05, 0.14, at(ex, 0.82, ez + 0.06), '--ppd-line', 0.01);
      var lamp = kit.lift(frame, '.ppd-lamp', { w: 600, ww: 1.4, m: at(ex, 0.86, ez + 0.1) });
      stops.push({ name: 'at the easel, with the lamp switch', x: ex - 0.3, z: ez + 2.2, yaw: 0.12, frame: lamp.el });
      kit.wire(frame, 'play-pod.js');
      // The room follows her lamp: off is data-lamp="off" on the drawing, as on
      // her page, and the pod goes to daylight, the walls and floor pale, the
      // tray black, every mark the pale paint it is without the lamp, and the
      // lamp's haze gone from the wall and the floor.
      kit.follow(lamp, '.ppd-lamp', function (read, node) {
        var day = node.getAttribute('data-lamp') === 'off';
        kit.scene.background = kit.col(day ? '--ppd-day' : '--ppd-night');
        sky.color.copy(kit.col(day ? '--ppd-day' : '--ppd-uv'));
        sky.groundColor.copy(kit.col(day ? '--ppd-day-floor' : '--ppd-night'));
        sky.intensity = day ? 2.6 : 1.1;
        uv.intensity = day ? 0 : 18;
        kit.tint('--ppd-tray', day ? '--ppd-day' : '--ppd-tray');
        kit.tint('--ppd-line', day ? '--ppd-day-stand' : '--ppd-line');
        kit.tint('--ppd-night', day ? '--ppd-day-tray' : '--ppd-night');
        glows.forEach(function (g) { g[0].material.color.copy(kit.col(day ? DAY[g[1]] : g[1])); });
        // (By its material: the street sets every mesh's own visible by distance.)
        hazes.forEach(function (h) { h.material.visible = !day; });
      });

      return {
        start: { x: 0, z: -0.3, yaw: 0 },
        bounds: { x: [-W / 2 + 0.8, W / 2 - 0.8], z: [back + 1.6, 0.4] },
        stops: stops
      };
    }
  };
})();

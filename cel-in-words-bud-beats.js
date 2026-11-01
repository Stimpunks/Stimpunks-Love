/* =============================================================================
   Words, Bud, Beats, walked into on Cel Street. Ryan's ask, 2026-10-31: back
   on the street, working down it a room at a time.

   IT IS KRISTINA BROOKE'S ROOM AND HER WORLD (§103), and this is OURS: a
   drawing of her room for Cel Street, in the colours her room declares and
   nothing else, which changes nothing on her page and is hers to keep or send
   back. Everything in it comes out of her page's own words and drawings: an
   intimate salon, "low desert dusk through one west window, falling across the
   far wall and throwing every shadow east"; the window with the mesa, the
   saguaro and the sun going down in it, and on its sill the monstera in its
   clay pot, the stacked books, the glass jar, the small brass bell, the fern
   and the succulent; the corner with the microphone on its stand ("decorative
   and that's OK"), the plant in its fabric grow pot in the window light, the
   chair with its wood frame and cotton cushions, and table two with its books
   and its succulent. "It's not cluttered, but it comes close": where her page
   says nothing, the room is plain.

   HER WORDS ARE LIFTED, NEVER RETYPED: what's here, on the patch of far wall
   the window lights, which on her page is that patch; the shelf of records in
   the shadow side of the room, each Tidal player waiting on its sleeve and
   built by love-embed.js on the press, as on her page; the house notes by the
   door; and the open mic, its pairing slip working as it does on her page
   through her own words-bud-beats.js. No line of any song is anywhere here.

   NOTHING MOVES BY ITSELF, and no smoke rises. Every colour is one her room
   declares, by name. It keeps nothing, sends nothing and fetches nothing; her
   page arrives through Cel Street's screen(). tools/make-cel-street.py holds
   each of those.
   ========================================================================== */
(function () {
  'use strict';
  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['words-bud-beats.html'] = {
    name: 'Words, Bud, Beats',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var W = 8, D = 10, H = 3.2, back = -D, L = -W / 2, R = W / 2;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var WIN = { z0: -3.7, z1: -1.4, y0: 0.9, y1: 2.6 };
      var wz = (WIN.z0 + WIN.z1) / 2, wl = WIN.z1 - WIN.z0, wy = (WIN.y0 + WIN.y1) / 2, wh = WIN.y1 - WIN.y0;

      // LOW DESERT DUSK THROUGH ONE WEST WINDOW. The room is in its own shade,
      // dusk over the ground; the sun comes in low and level through the
      // window on the left, which the walls stop everywhere else, and runs on
      // across the room to the far wall, every shadow thrown east of its thing.
      kit.scene.background = kit.col('--wbb-ground');
      kit.scene.add(new T.HemisphereLight(kit.col('--wbb-dusk'), kit.col('--wbb-rail'), 2.0));
      var dir = new T.Vector3(0.85, -0.06, -1.05).normalize();
      var through = new T.Vector3(L, wy, wz);
      var sun = new T.DirectionalLight(kit.col('--wbb-sun'), 3.2);
      sun.position.copy(through).addScaledVector(dir, -22);
      sun.target.position.copy(through).addScaledVector(dir, 6);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      sun.shadow.camera.left = -11; sun.shadow.camera.right = 11;
      sun.shadow.camera.top = 11; sun.shadow.camera.bottom = -11;
      sun.shadow.camera.near = 1; sun.shadow.camera.far = 45;
      sun.shadow.bias = -0.001; sun.shadow.normalBias = 0.05;
      kit.scene.add(sun, sun.target);

      // THE ROOM: boards underfoot, the walls and ceiling in the room's shade.
      box(W + 0.4, 0.1, D + 0.4, at(0, -0.05, back / 2), '--wbb-rail', false);
      for (var b = 0; b < 16; b++) box(0.012, 0.004, D, at(L + 0.25 + b * 0.5, 0.002, back / 2), '--wbb-ground', false, false);
      box(W + 0.4, 0.14, D + 0.4, at(0, H + 0.07, back / 2), '--wbb-ground', false);
      box(0.3, H, D, at(R + 0.15, H / 2, back / 2), '--wbb-ground');
      box(W + 0.6, H, 0.3, at(0, H / 2, back - 0.15), '--wbb-ground');
      box(W + 0.6, H, 0.3, at(0, H / 2, 0.15), '--wbb-ground');
      // The door you came in by, shut behind you.
      box(0.96, 2.1, 0.06, at(0.6, 1.05, -0.02), '--wbb-frame', 0.015);
      cyl(0.035, 0.035, 0.06, at(0.24, 1.0, -0.07, 0, Math.PI / 2), '--wbb-brass', false, 10);

      // THE WEST WALL, with the one window in it.
      var ws = new T.Shape();
      ws.moveTo(0, 0); ws.lineTo(D, 0); ws.lineTo(D, H); ws.lineTo(0, H); ws.closePath();
      var hole = new T.Path();
      hole.moveTo(-WIN.z1, WIN.y0); hole.lineTo(-WIN.z0, WIN.y0); hole.lineTo(-WIN.z0, WIN.y1); hole.lineTo(-WIN.z1, WIN.y1); hole.closePath();
      ws.holes.push(hole);
      var wg = new T.ExtrudeGeometry(ws, { depth: 0.3, bevelEnabled: false });
      wg.translate(0, 0, -0.3);
      kit.piece(wg, at(L, 0, 0, LEFT), '--wbb-ground', 0.02);
      // Its frame, the mullion and the transom, as her drawing has them.
      box(0.1, 0.1, wl + 0.2, at(L - 0.05, WIN.y1 + 0.05, wz), '--wbb-frame', 0.012);
      box(0.1, 0.1, wl + 0.2, at(L - 0.05, WIN.y0 - 0.05, wz), '--wbb-frame', 0.012);
      [WIN.z0 - 0.05, WIN.z1 + 0.05].forEach(function (z) { box(0.1, wh + 0.2, 0.1, at(L - 0.05, wy, z), '--wbb-frame', 0.012); });
      box(0.06, wh, 0.06, at(L - 0.08, wy, wz), '--wbb-frame', false);
      box(0.06, 0.06, wl, at(L - 0.08, wy + 0.2, wz), '--wbb-frame', false);
      // The sill, and the rail under it.
      box(0.42, 0.07, wl + 0.5, at(L + 0.06, WIN.y0 - 0.035, wz), '--wbb-sill', 0.012);
      box(0.08, 0.06, wl + 0.4, at(L + 0.24, WIN.y0 - 0.1, wz), '--wbb-rail', false);

      // OUTSIDE: the dusk sky in its three bands, the sun going down behind the
      // mesa, the saguaro standing in front of it.
      var SKY = -15;
      kit.flat(new T.PlaneGeometry(60, 12), at(SKY, 10, wz, LEFT), '--wbb-sky-high');
      kit.flat(new T.PlaneGeometry(60, 2.4), at(SKY + 0.05, 3.2, wz, LEFT), '--wbb-sky-mid');
      kit.flat(new T.PlaneGeometry(60, 2.2), at(SKY + 0.1, 1.0, wz, LEFT), '--wbb-sky-low');
      kit.flat(new T.CircleGeometry(1.3, 32), at(SKY + 0.4, 2.1, wz - 1.3, LEFT), '--wbb-sun');
      var mesa = new T.Shape();
      [[-30, -1], [-30, 1.4], [-11, 1.6], [-8, 2.6], [-4.5, 2.7], [-3.6, 2.0], [-0.6, 2.05], [0.4, 2.9], [3.6, 3.0], [4.4, 2.1], [9, 2.2], [30, 1.6], [30, -1]].forEach(function (p, i) {
        if (i === 0) mesa.moveTo(p[0], p[1]); else mesa.lineTo(p[0], p[1]);
      });
      kit.flat(new T.ShapeGeometry(mesa), at(SKY + 2.5, 0, wz, LEFT), '--wbb-mesa');
      kit.flat(new T.PlaneGeometry(30, 12), at(-9, 0.02, wz, 0, -Math.PI / 2), '--wbb-mesa');
      // The saguaro: a trunk and two arms, the way her window has it.
      var sg = at(-9.5, 0, wz + 0.9, LEFT);
      [[0, 1.55, 0.36, 3.1], [-0.55, 1.6, 0.26, 0.24], [-0.68, 2.0, 0.24, 0.9], [0.5, 1.3, 0.26, 0.24], [0.62, 1.65, 0.24, 0.8]].forEach(function (p) {
        box(p[2] + (p[3] < 0.3 ? 0.4 : 0), p[3], 0.3, M(sg, at(p[0], p[1], 0)), '--wbb-saguaro', false, false);
      });

      // ON THE SILL: the monstera in its clay pot, the stacked books, the glass
      // jar, the small brass bell, the fern and the succulent, left to right.
      var SX = L + 0.12, SY = WIN.y0;
      function leaf(m, r, ink) {
        var g = new T.SphereGeometry(r, 10, 6); g.scale(1, 0.18, 0.72);
        kit.piece(g, m, ink, 0.006);
      }
      cyl(0.13, 0.1, 0.2, at(SX, SY + 0.1, WIN.z1 - 0.2), '--wbb-clay', 0.008, 14);
      [[0, 0.5, 0.05, 0.4, 0.3], [0.9, 0.42, -0.1, -0.5, 0.25], [2.1, 0.55, 0.08, 0.35, -0.4], [3.3, 0.38, 0, -0.3, -0.2]].forEach(function (l, i) {
        var st = at(SX, SY + 0.2, WIN.z1 - 0.2, l[0]);
        box(0.015, l[1], 0.015, M(st, at(0, l[1] / 2, l[2], 0, l[3])), '--wbb-leaf-dark', false);
        leaf(M(st, at(0, l[1], l[2] + 0.14, 0, l[4])), 0.2, i % 2 ? '--wbb-leaf-dark' : '--wbb-leaf');
      });
      box(0.24, 0.06, 0.32, at(SX + 0.02, SY + 0.03, wz + 0.42), '--wbb-clay-dark', 0.006);
      box(0.22, 0.05, 0.28, at(SX + 0.02, SY + 0.085, wz + 0.42, 0.12), '--wbb-leaf-dark', 0.006);
      cyl(0.08, 0.08, 0.2, at(SX + 0.02, SY + 0.1, wz - 0.05), '--wbb-glass', 0.006, 16);
      cyl(0.085, 0.085, 0.03, at(SX + 0.02, SY + 0.215, wz - 0.05), '--wbb-brass', false, 16);
      kit.piece(new T.ConeGeometry(0.06, 0.1, 14, 1, true), at(SX + 0.02, SY + 0.06, wz - 0.42), '--wbb-brass', 0.006);
      cyl(0.012, 0.012, 0.05, at(SX + 0.02, SY + 0.13, wz - 0.42), '--wbb-brass', false, 6);
      cyl(0.09, 0.07, 0.14, at(SX, SY + 0.07, wz - 0.82), '--wbb-clay', 0.006, 12);
      for (var f = 0; f < 9; f++) {
        var fa = f / 9 * Math.PI * 2;
        box(0.03, 0.34, 0.012, at(SX + Math.cos(fa) * 0.08, SY + 0.27, wz - 0.82 + Math.sin(fa) * 0.08, fa, 0, 0.55), '--wbb-leaf', false);
      }
      cyl(0.07, 0.06, 0.1, at(SX, SY + 0.05, WIN.z0 + 0.18), '--wbb-clay', 0.006, 12);
      [[0, 0.3], [0.5, -0.4], [-0.6, -0.2], [1.8, 0.2]].forEach(function (s) {
        var g = new T.SphereGeometry(0.035, 8, 6); g.scale(0.6, 1.3, 0.6);
        kit.piece(g, at(SX + Math.cos(s[0]) * 0.03, SY + 0.13, WIN.z0 + 0.18 + Math.sin(s[0]) * 0.03, 0, s[1], s[1]), '--wbb-succ', 0.004);
      });

      // THE CORNER, in the window light: the plant in its fabric grow pot by
      // the window, and the microphone on its stand, waiting.
      var gp = at(L + 0.7, 0, wz - 1.2);
      cyl(0.3, 0.28, 0.38, M(gp, at(0, 0.19, 0)), '--wbb-felt', 0.012, 18);
      box(0.03, 1.15, 0.03, M(gp, at(0, 0.95, 0)), '--wbb-leaf-dark', false);
      [[0.6, 0, 0.3], [0.9, 2.1, 0.26], [1.2, 4.2, 0.22], [1.45, 1.0, 0.17], [1.25, 3.2, 0.2]].forEach(function (fan, i) {
        var hub = M(gp, at(0, fan[0], 0, fan[1]));
        var stalk = M(hub, at(0, 0, 0, 0, 0, 0));
        box(fan[2] * 0.9, 0.015, 0.015, M(stalk, at(fan[2] * 0.45, 0.02, 0)), '--wbb-leaf-dark', false);
        var tip = M(hub, at(fan[2] * 0.9, 0.04, 0));
        for (var k = -3; k <= 3; k++) {
          var len = fan[2] * (1 - Math.abs(k) * 0.18);
          var lg = new T.SphereGeometry(0.5, 8, 5); lg.scale(len, 0.012, 0.055);
          kit.piece(lg, M(tip, at(len / 2 * Math.cos(k * 0.38), 0.02 + len * 0.25, -len / 2 * Math.sin(k * 0.38), k * 0.38, 0, 0.5)), i % 2 ? '--wbb-leaf' : '--wbb-leaf-dark', false);
        }
      });
      var mc = at(-1.3, 0, wz - 2.2);
      cyl(0.26, 0.28, 0.03, M(mc, at(0, 0.015, 0)), '--wbb-vinyl', 0.008, 20);
      cyl(0.02, 0.02, 1.36, M(mc, at(0, 0.7, 0)), '--wbb-vinyl', false, 8);
      cyl(0.04, 0.04, 0.1, M(mc, at(0, 0.95, 0)), '--wbb-brass', false, 10);
      var head = M(mc, at(0, 1.5, 0, 0, 0.3));
      kit.piece(new T.CapsuleGeometry(0.075, 0.2, 6, 14), M(head, at(0, 0.06, 0)), '--wbb-brass', 0.008);
      [0, 0.06, 0.12].forEach(function (y) { kit.piece(new T.TorusGeometry(0.078, 0.008, 6, 18), M(head, at(0, y, 0, 0, Math.PI / 2)), '--wbb-vinyl', false); });

      // THE CHAIR and TABLE TWO, in the shadow side by the door, facing the
      // window: a wood frame and cotton cushions, sage behind; a square table
      // with books and a succulent on it.
      var ch = at(2.7, 0, -2.6, LEFT);
      box(1.0, 0.1, 0.8, M(ch, at(0, 0.36, 0)), '--wbb-rail', 0.01);
      [[-0.44, -0.34], [0.44, -0.34], [-0.44, 0.34], [0.44, 0.34]].forEach(function (c) { box(0.06, 0.32, 0.06, M(ch, at(c[0], 0.16, c[1])), '--wbb-rail', false); });
      box(0.96, 0.16, 0.74, M(ch, at(0, 0.49, 0.02)), '--wbb-cotton', 0.01);
      box(0.92, 0.62, 0.18, M(ch, at(0, 0.85, 0.36, 0, -0.12)), '--wbb-sage', 0.01);
      [-1, 1].forEach(function (s) { box(0.14, 0.34, 0.8, M(ch, at(s * 0.53, 0.58, 0.02)), '--wbb-frame', 0.01); });
      var tb = at(2.7, 0, -1.2);
      box(0.66, 0.05, 0.66, M(tb, at(0, 0.6, 0)), '--wbb-frame', 0.01);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { box(0.05, 0.58, 0.05, M(tb, at(c[0] * 0.27, 0.29, c[1] * 0.27)), '--wbb-rail', false); });
      box(0.5, 0.04, 0.5, M(tb, at(0, 0.24, 0)), '--wbb-rail', false);
      box(0.3, 0.05, 0.22, M(tb, at(-0.1, 0.65, 0.08)), '--wbb-clay-dark', 0.005);
      box(0.26, 0.045, 0.2, M(tb, at(-0.1, 0.7, 0.08, 0.2)), '--wbb-leaf-dark', 0.005);
      cyl(0.07, 0.05, 0.1, M(tb, at(0.17, 0.675, -0.14)), '--wbb-clay', 0.005, 12);
      [[0, 0.3], [0.6, -0.4], [-0.5, -0.3]].forEach(function (s) {
        var g = new T.SphereGeometry(0.035, 8, 6); g.scale(0.6, 1.3, 0.6);
        kit.piece(g, M(tb, at(0.17 + Math.cos(s[0]) * 0.025, 0.75, -0.14 + Math.sin(s[0]) * 0.025, 0, s[1], s[1])), '--wbb-succ', 0.004);
      });
      // And one more monstera, on the floor in the far corner of the shade.
      cyl(0.24, 0.19, 0.4, at(R - 0.5, 0.2, back + 0.55), '--wbb-clay', 0.01, 16);
      for (var mL = 0; mL < 6; mL++) {
        var ang = mL * 1.05, ht = 0.7 + (mL % 3) * 0.25;
        var stem = at(R - 0.5, 0.4, back + 0.55, ang);
        box(0.02, ht, 0.02, M(stem, at(0, ht / 2, 0.12, 0, 0.35)), '--wbb-leaf-dark', false);
        leaf(M(stem, at(0, ht, 0.32, 0, 0.3)), 0.28, mL % 2 ? '--wbb-leaf' : '--wbb-leaf-dark');
      }

      // HER PAGE on the far wall, in the shade to the left of the patch.
      var pw = 2.3, ph = pw * 800 / 1180, py = 0.95 + ph / 2;
      box(pw + 0.2, ph + 0.2, 0.06, at(-1.9, py, back + 0.03), '--wbb-frame');
      var frame = kit.screen(1180, 800, pw, at(-1.9, py, back + 0.08), 'Kristina Brooke’s Words, Bud, Beats, its own page, on the far wall');

      // WHAT'S HERE, on the patch of far wall the window lights: on her page
      // that section is the patch, amber and slanted, and it hangs where the
      // sun lands.
      var lit = kit.lift(frame, '.wbb-lit', { w: 720, h: 760, ww: 2.4, m: at(1.85, 0.75, back + 0.04), bare: true });
      // THE RECORDS, on a long shelf in the shadow side of the room, every
      // Tidal player waiting on its sleeve.
      box(0.36, 0.06, 3.6, at(R - 0.2, 0.78, -6.3), '--wbb-rail', 0.01);
      [-7.9, -4.7].forEach(function (z) { box(0.32, 0.75, 0.06, at(R - 0.2, 0.375, z), '--wbb-rail', false); });
      var shelf = kit.lift(frame, '.wbb-shadow', { w: 960, h: 620, ww: 3.2, m: at(R - 0.03, 0.84, -6.3, RIGHT) });
      // THE OPEN MIC, on the west wall past the window: the slip, which her own
      // script works here as it does on her page. The corner it draws is the
      // one standing in this room, so it stays on her page.
      var mic = kit.lift(frame, '.wbb-mic', { w: 720, h: 760, ww: 1.9, m: at(L + 0.03, 0.75, -6.6, LEFT), drop: '.wbb-corner' });
      kit.wire(frame, 'words-bud-beats.js');
      // THE HOUSE NOTES, by the door, facing in.
      var notes = kit.lift(frame, '.wbb-house', { w: 640, ww: 1.5, m: at(-1.9, 1.0, -0.02, Math.PI) });

      var stops = [
        { name: 'just inside the door, the dusk coming in at the window on the left', x: 0.6, z: -1.0, yaw: 0.25 },
        { name: 'at the window, the sun going down behind the mesa', x: -2.4, z: wz, yaw: LEFT },
        { name: 'at the sill, with the monstera, the books, the jar, the bell, the fern and the succulent', x: -3.1, z: wz, yaw: LEFT, pitch: -0.45 },
        { name: 'by the microphone on its stand, waiting, and the plant in the window light', x: 0.8, z: wz + 0.6, yaw: 0.94, pitch: -0.12 },
        { name: 'at the patch of far wall the window lights, with what’s here', x: 1.85, z: back + 2.6, yaw: 0, pitch: 0.12, frame: lit.el },
        { name: 'at the shelf of records, in the shadow side of the room', x: 1.2, z: -6.3, yaw: RIGHT, pitch: 0.05, frame: shelf.el },
        { name: 'at the open mic, with the pairing slip', x: -1.6, z: -6.6, yaw: LEFT, pitch: 0.05, frame: mic.el },
        { name: 'at the chair by the door, its wood frame and cotton cushions, and table two beside it', x: 0.6, z: -1.6, yaw: -1.34, pitch: -0.28 },
        { name: 'at the far wall, with her room’s own page', x: -1.9, z: back + 2.3, yaw: 0, page: kit.page, frame: frame },
        { name: 'looking back at the door, with the house notes beside it', x: -0.6, z: -3.4, yaw: Math.PI, pitch: 0.05, frame: notes.el }
      ];

      return {
        start: { x: 0.6, z: -1.0, yaw: 0.25 },
        bounds: { x: [L + 0.7, R - 0.7], z: [back + 0.8, -0.6] },
        stops: stops
      };
    }
  };
})();

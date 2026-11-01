/* =============================================================================
   Covenstead, walked into on Cel Street. Ryan's ask, 2026-10-31: back on the
   street, working down it a room at a time.

   IT IS COVENSTEAD'S WORLD AND NOBODY ELSE'S (§37): somebody's kitchen in the
   afternoon, one window in the side of it, and the good china out. The light
   comes in at that one window, low from the left, and lands in ONE PATCH, on
   the table and the boards under the sill; the rest of the room is soft shade
   on warm limewash, slightly pink, never cooling toward green (that is the
   Garden with furniture in it). Indoors, sitting down, somebody's house: not
   the Hermitage's landscape, not the Guild's photocopy, not the Latibulum's
   burrow with no daylight in it.

   NOBODY'S CUP IS ANYBODY ELSE'S CUP. That is the room's subject, moved here
   with it from the road out of town: a group that does not match, meeting
   anyway. So every place at the table has its own cup, no two alike in shape
   or in colour, and its own saucer or none; the teapot, the jug and the sugar
   bowl are three more strangers; the chairs do not match either; and the
   plates on the dresser are odd ones. Never make the crockery match.

   WHAT IS ON THE TABLE IS THE PAGE'S OWN, lifted off it by the kit: each of
   the six tenets lies at its own place, propped toward whoever stands behind
   that chair, with whose it is and when beside it, so Pratchett's lines keep
   his name and his books with them. The page's notes hang on the right-hand
   wall and its sign by the door. Nobody is drawn: the chairs are pulled out
   for whoever comes.

   NOTHING MOVES: the kettle is on and does not steam. Every colour is one the
   room declares, by name. It keeps nothing, sends nothing and fetches
   nothing; its page arrives through Cel Street's screen(), on the back wall.
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['covenstead.html'] = {
    name: 'Covenstead',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var W = 7, D = 8, H = 2.7, back = -D;
      var L = -W / 2, R = W / 2;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var WIN = { z0: -5.2, z1: -3.6, y0: 0.85, y1: 2.15 };

      // ONE WINDOW, MID-AFTERNOON: a soft fill of the limewash everywhere, and
      // the sun low through the window on the left, which the walls stop
      // everywhere but the window, so it lands in one patch.
      kit.scene.background = kit.col('--cov-sun');
      kit.scene.add(new T.HemisphereLight(kit.col('--cov-sun'), kit.col('--cov-wash'), 2.1));
      var sun = new T.DirectionalLight(kit.col('--cov-sun'), 2.4);
      sun.position.set(-10, 5.5, -3.4);
      sun.target.position.set(0, 0.5, -4.4);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      sun.shadow.camera.left = -9; sun.shadow.camera.right = 9;
      sun.shadow.camera.top = 9; sun.shadow.camera.bottom = -9;
      sun.shadow.camera.near = 1; sun.shadow.camera.far = 30;
      sun.shadow.bias = -0.001; sun.shadow.normalBias = 0.05;
      kit.scene.add(sun, sun.target);

      // THE ROOM: scrubbed boards, limewash walls, a pale ceiling under beams.
      box(W + 0.4, 0.1, D + 0.4, at(0, -0.05, back / 2), '--cov-sun', false);
      for (var b = 0; b < 14; b++) box(0.012, 0.004, D, at(L + 0.25 + b * 0.5, 0.002, back / 2), '--cov-ink-2', false, false);
      box(W + 0.4, 0.14, D + 0.4, at(0, H + 0.07, back / 2), '--cov-sun', false, false);
      [-2.2, -4.4, -6.6].forEach(function (z) { box(W, 0.16, 0.18, at(0, H - 0.08, z), '--cov-ink-2', 0.012); });
      box(0.3, H, D, at(R + 0.15, H / 2, back / 2), '--cov-wash');
      box(W + 0.6, H, 0.3, at(0, H / 2, back - 0.15), '--cov-wash');
      // The front wall, with the door you came in by, shut behind you.
      box(W + 0.6, H, 0.3, at(0, H / 2, 0.15), '--cov-wash');
      box(0.96, 2.06, 0.06, at(2.3, 1.03, -0.02), '--cov-delft', 0.015);
      cyl(0.035, 0.035, 0.06, at(1.98, 1.0, -0.07, 0, Math.PI / 2), '--cov-ink-2', false, 10);

      // THE LEFT WALL, with the one window in it.
      var ww = new T.Shape();
      ww.moveTo(0, 0); ww.lineTo(D, 0); ww.lineTo(D, H); ww.lineTo(0, H); ww.closePath();
      var hole = new T.Path();
      hole.moveTo(-WIN.z1, WIN.y0); hole.lineTo(-WIN.z0, WIN.y0); hole.lineTo(-WIN.z0, WIN.y1); hole.lineTo(-WIN.z1, WIN.y1); hole.closePath();
      ww.holes.push(hole);
      var wg = new T.ExtrudeGeometry(ww, { depth: 0.3, bevelEnabled: false });
      wg.translate(0, 0, -0.3);
      kit.piece(wg, at(L, 0, 0, LEFT), '--cov-wash', 0.02);
      // Its frame, sill and glazing bars, and the day outside it.
      var wz = (WIN.z0 + WIN.z1) / 2, wl = WIN.z1 - WIN.z0, wy = (WIN.y0 + WIN.y1) / 2, wh = WIN.y1 - WIN.y0;
      box(0.34, 0.06, wl + 0.2, at(L + 0.05, WIN.y0 - 0.03, wz), '--cov-ink-2', 0.012);
      box(0.06, wh, 0.05, at(L - 0.05, wy, wz), '--cov-ink-2', false);
      box(0.06, 0.05, wl, at(L - 0.05, wy, wz), '--cov-ink-2', false);
      kit.flat(new T.PlaneGeometry(40, 30), at(L - 9, 4, wz, LEFT), '--cov-sun');
      [[-2.6, 1.6], [0, 2.4], [2.4, 1.4]].forEach(function (h) {
        kit.flat(new T.CircleGeometry(h[1], 20), at(L - 8, 0.4 + h[1] * 0.5, wz + h[0], LEFT), '--cov-sage');
      });
      // Curtains drawn back either side, and a pot of herbs on the sill.
      [WIN.z1 + 0.22, WIN.z0 - 0.22].forEach(function (z) { box(0.08, wh + 0.5, 0.36, at(L + 0.18, wy + 0.1, z), '--cov-rose', 0.012); });
      box(0.06, 0.06, wl + 1.3, at(L + 0.22, WIN.y1 + 0.22, wz), '--cov-ink-2', false);
      cyl(0.09, 0.07, 0.16, at(L + 0.12, WIN.y0 + 0.08, wz - 0.4), '--cov-rose', 0.01, 14);
      [[0, 0.1], [0.05, -0.06], [-0.06, -0.03]].forEach(function (l) {
        kit.piece(new T.SphereGeometry(0.07, 8, 6), at(L + 0.12 + l[0], WIN.y0 + 0.24, wz - 0.4 + l[1]), '--cov-sage', 0.008);
      });

      // THE TABLE, near the window, so the patch lands on it: a cloth over it,
      // a border of the room's rose.
      var TX = -1.4, TZ = -4.4, TW = 1.4, TL = 2.4, TY = 0.76;
      box(TW, 0.05, TL, at(TX, TY - 0.025, TZ), '--cov-ink-2', 0.015);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) {
        box(0.07, TY - 0.05, 0.07, at(TX + c[0] * (TW / 2 - 0.08), (TY - 0.05) / 2, TZ + c[1] * (TL / 2 - 0.08)), '--cov-ink-2', 0.01);
      });
      box(TW + 0.08, 0.006, TL + 0.08, at(TX, TY + 0.003, TZ), '--cov-sun', false);
      [-1, 1].forEach(function (s) {
        box(0.05, 0.004, TL + 0.08, at(TX + s * (TW / 2 - 0.02), TY + 0.007, TZ), '--cov-rose', false, false);
        box(TW + 0.08, 0.004, 0.05, at(TX, TY + 0.007, TZ + s * (TL / 2 - 0.02)), '--cov-rose', false, false);
      });
      var top = TY + 0.01;

      // THE CHINA. Every cup its own shape and colour, and no two alike.
      function handle(m, r, ink) { kit.piece(new T.TorusGeometry(r, 0.012, 6, 14, Math.PI), m, ink, false); }
      var CUPS = {
        mug: function (m, ink) { cyl(0.045, 0.045, 0.1, M(m, at(0, 0.05, 0)), ink, 0.006, 16); handle(M(m, at(0.045, 0.05, 0, 0, 0, -Math.PI / 2)), 0.026, ink); },
        teacup: function (m, ink, plate) {
          cyl(0.085, 0.07, 0.012, M(m, at(0, 0.006, 0)), plate, 0.005, 20);
          cyl(0.052, 0.034, 0.055, M(m, at(0, 0.04, 0)), ink, 0.005, 18);
          handle(M(m, at(0.048, 0.042, 0, 0, 0, -Math.PI / 2)), 0.018, ink);
        },
        bowl: function (m, ink) { kit.piece(new T.SphereGeometry(0.055, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M(m, at(0, 0.055, 0)), ink, 0.006); },
        tumbler: function (m, ink) { cyl(0.04, 0.032, 0.11, M(m, at(0, 0.055, 0)), ink, 0.006, 8); },
        beaker: function (m, ink, plate) {
          cyl(0.07, 0.07, 0.01, M(m, at(0, 0.005, 0)), plate, 0.005, 6);
          cyl(0.042, 0.038, 0.085, M(m, at(0, 0.052, 0)), ink, 0.006, 14);
          kit.piece(new T.TorusGeometry(0.042, 0.007, 6, 18), M(m, at(0, 0.094, 0, 0, Math.PI / 2)), ink, false);
        },
        tall: function (m, ink) {
          cyl(0.036, 0.04, 0.14, M(m, at(0, 0.07, 0)), ink, 0.006, 16);
          box(0.012, 0.08, 0.012, M(m, at(0.06, 0.07, 0)), ink, false);
          box(0.03, 0.012, 0.012, M(m, at(0.048, 0.11, 0)), ink, false);
          box(0.03, 0.012, 0.012, M(m, at(0.048, 0.03, 0)), ink, false);
        }
      };
      // In the middle, three more strangers: a round teapot, a jug and a bowl.
      var tp = at(TX, top, TZ);
      kit.piece(new T.SphereGeometry(0.12, 18, 12), M(tp, at(0, 0.11, 0)), '--cov-rose', 0.008);
      cyl(0.05, 0.06, 0.03, M(tp, at(0, 0.22, 0)), '--cov-rose', 0.006, 16);
      kit.piece(new T.SphereGeometry(0.018, 8, 6), M(tp, at(0, 0.245, 0)), '--cov-ink-2', false);
      cyl(0.012, 0.026, 0.16, M(tp, at(0, 0.15, 0.15, 0, 0.9)), '--cov-rose', 0.006, 8);
      handle(M(tp, at(0, 0.12, -0.12, Math.PI / 2, 0, -Math.PI / 2)), 0.05, '--cov-rose');
      cyl(0.035, 0.05, 0.1, at(TX - 0.24, top + 0.05, TZ + 0.18), '--cov-delft', 0.006, 6);
      handle(at(TX - 0.24, top + 0.06, TZ + 0.13, Math.PI / 2, 0, -Math.PI / 2), 0.022, '--cov-delft');
      cyl(0.055, 0.04, 0.05, at(TX + 0.22, top + 0.025, TZ - 0.2), '--cov-sage', 0.006, 12);

      // THE CHAIRS, pulled out, none matching: ladderback, spindle, a plain
      // stool with a back, each in a colour of its own.
      function chair(m, ink, kind) {
        box(0.42, 0.04, 0.42, M(m, at(0, 0.45, 0)), ink, 0.01);
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { box(0.035, 0.45, 0.035, M(m, at(c[0] * 0.18, 0.225, c[1] * 0.18)), ink, false); });
        [-1, 1].forEach(function (s) { box(0.035, 0.5, 0.035, M(m, at(s * 0.18, 0.72, 0.19)), ink, false); });
        if (kind === 0) [0.6, 0.75, 0.9].forEach(function (y) { box(0.36, 0.05, 0.02, M(m, at(0, y, 0.19)), ink, false); });
        if (kind === 1) [-0.1, 0, 0.1].forEach(function (x) { box(0.018, 0.42, 0.018, M(m, at(x, 0.68, 0.19)), ink, false); });
        if (kind === 2) box(0.36, 0.2, 0.025, M(m, at(0, 0.86, 0.19)), ink, 0.008);
      }

      // THE SIX PLACES, each with its tenet off the page lying at it and its
      // own cup beside it. A place is where you stand behind its chair.
      var frame = null;
      var pw = 2.3, ph = pw * 800 / 1180, py = 0.95 + ph / 2;
      box(pw + 0.2, ph + 0.2, 0.06, at(1.8, py, back + 0.03), '--cov-ink-2');
      frame = kit.screen(1180, 800, pw, at(1.8, py, back + 0.08), 'Covenstead’s own page, on the back wall of the kitchen');

      var EDGE = { left: TX - TW / 2 + 0.04, right: TX + TW / 2 - 0.04, near: TZ + TL / 2 - 0.04, far: TZ - TL / 2 + 0.04 };
      var PLACES = [
        // n, where the chair is, which way its card faces, its cup, ink, saucer
        { n: 0, side: 'right', z: -3.9, cup: 'mug', ink: '--cov-delft', words: '“Merry meet, and merry part, and merry meet again”' },
        { n: 1, side: 'right', z: -4.9, cup: 'teacup', ink: '--cov-sage', plate: '--cov-rose', words: '“An it harm none, do what ye will”' },
        { n: 2, side: 'far', cup: 'bowl', ink: '--cov-ink-2', words: 'the Rule of Three and the argument about it' },
        { n: 3, side: 'left', z: -4.9, cup: 'tumbler', ink: '--cov-rose', words: 'First Sight, in Terry Pratchett’s words' },
        { n: 4, side: 'left', z: -3.9, cup: 'beaker', ink: '--cov-ink', plate: '--cov-delft', words: 'Second Thoughts, in Terry Pratchett’s words' },
        { n: 5, side: 'near', cup: 'tall', ink: '--cov-sage', words: '“If I don’t help them, who will?”' }
      ];
      var stops = [{ name: 'just inside the door, the kettle already on', x: 2.3, z: -0.8, yaw: 0.8 }];
      PLACES.forEach(function (p, i) {
        var face, x, z, cx, cz, sx, sz, cupAt;
        if (p.side === 'right') { face = LEFT; x = EDGE.right; z = p.z; cx = x + 0.5; cz = z; sx = x + 0.95; sz = z; cupAt = [x - 0.08, z + 0.32]; }
        if (p.side === 'left') { face = RIGHT; x = EDGE.left; z = p.z; cx = x - 0.5; cz = z; sx = -1.55; sz = z; cupAt = [x + 0.08, z - 0.32]; }
        if (p.side === 'near') { face = 0; x = TX; z = EDGE.near; cx = x; cz = z + 0.5; sx = x; sz = z + 0.95; cupAt = [x - 0.32, z - 0.08]; }
        if (p.side === 'far') { face = Math.PI; x = TX; z = EDGE.far; cx = x; cz = z - 0.5; sx = x; sz = z - 0.95; cupAt = [x + 0.32, z + 0.08]; }
        // face is the way the card looks; the chair sits on that side, facing in.
        var card = kit.lift(frame, '.seat', { n: p.n, w: 600, h: 520, ww: 0.5, m: at(x, top + 0.01, z, face === LEFT ? Math.PI / 2 : face === RIGHT ? -Math.PI / 2 : face, -1.15) });
        chair(at(cx, 0, cz, face === LEFT ? Math.PI / 2 : face === RIGHT ? -Math.PI / 2 : face), [p.ink, '--cov-delft', '--cov-ink-2', '--cov-sage', '--cov-rose', '--cov-ink'][i], i % 3);
        CUPS[p.cup](at(cupAt[0], top, cupAt[1], i * 0.7), p.ink, p.plate);
        var yaw = p.side === 'right' ? LEFT : p.side === 'left' ? RIGHT : p.side === 'near' ? 0 : Math.PI;
        if (p.side === 'left') { sx = L + 0.6; }
        stops.push({ name: 'at the place set with ' + p.words + ', its own cup beside it', x: sx, z: sz, yaw: yaw, pitch: -0.55, frame: card.el });
      });

      // THE DRESSER on the back wall, its shelves of odd plates standing up.
      var dx = -2.1, dz = back + 0.3;
      box(1.5, 0.9, 0.5, at(dx, 0.45, dz), '--cov-ink-2', 0.015);
      box(1.5, 1.2, 0.08, at(dx, 1.5, dz - 0.2), '--cov-ink-2', 0.012);
      [1.2, 1.62, 2.04].forEach(function (y, row) {
        box(1.5, 0.04, 0.26, at(dx, y, dz - 0.07), '--cov-ink-2', 0.01);
        ['--cov-delft', '--cov-rose', '--cov-sage', '--cov-sun', '--cov-ink'].forEach(function (ink, j) {
          var r = 0.1 + ((row + j) % 3) * 0.025;
          cyl(r, r, 0.015, at(dx - 0.56 + j * 0.28, y + 0.02 + r, dz - 0.1, 0, Math.PI / 2 - 0.15), ink, 0.006, 6 + ((row * 2 + j) % 4) * 6);
        });
      });

      // THE KETTLE, already on, on a little hob by the page; it does not steam.
      box(0.7, 0.85, 0.55, at(0.05, 0.425, back + 0.3), '--cov-ink', 0.015);
      [-0.15, 0.17].forEach(function (x) { cyl(0.1, 0.1, 0.01, at(0.05 + x, 0.855, back + 0.3), '--cov-ink-2', false, 18); });
      kit.piece(new T.SphereGeometry(0.11, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.62), at(-0.1, 0.87, back + 0.3), '--cov-delft', 0.008);
      cyl(0.02, 0.03, 0.12, at(-0.22, 0.95, back + 0.3, 0, 0, 0.9), '--cov-delft', 0.006, 8);
      handle(at(-0.1, 0.98, back + 0.3, 0, 0, 0), 0.07, '--cov-ink-2');

      // THE PAGE'S OWN WORDS on the walls: its sign by the door, its notes on
      // the right-hand wall, and what is on the table by the window.
      var sign = kit.lift(frame, '.meet', { w: 900, ww: 1.5, m: at(R - 0.05, 1.25, -1.7, RIGHT) });
      var NOTES = [
        { n: 0, z: -3.35, words: 'the note on merry meet and merry part' },
        { n: 1, z: -4.95, words: 'the note on why only the second half can be automated' },
        { n: 2, z: -6.55, words: 'the note on what is not in this room' }
      ];
      NOTES.forEach(function (o) {
        var it = kit.lift(frame, '.scrub', { n: o.n, w: 620, h: 700, ww: 1.4, m: at(R - 0.05, 0.6, o.z, RIGHT) });
        stops.push({ name: 'at ' + o.words + ', on the right-hand wall', x: R - 1.9, z: o.z, yaw: RIGHT, frame: it.el });
      });
      var intro = kit.lift(frame, '.seats__intro', { w: 620, ww: 1.2, m: at(L + 0.05, 1.0, -1.6, LEFT) });
      var thanks = kit.lift(frame, '.thanks', { w: 620, h: 700, ww: 1.2, m: at(L + 0.05, 0.6, -6.9, LEFT) });

      stops.splice(1, 0,
        { name: 'at the sign by the door, the kettle already on', x: R - 1.7, z: -1.7, yaw: RIGHT, frame: sign.el },
        { name: 'at the word on what is on the table, by the door', x: L + 1.6, z: -1.6, yaw: LEFT, frame: intro.el },
        { name: 'at the window, in the patch of afternoon', x: -2.2, z: -6.9, yaw: 2.64, pitch: -0.1 });
      stops.push(
        { name: 'at the dresser, with the odd plates on it', x: dx, z: back + 1.6, yaw: 0, pitch: -0.05 },
        { name: 'at the hob, where the kettle is on', x: 0.05, z: back + 1.5, yaw: 0, pitch: -0.3 },
        { name: 'at the back wall, with Covenstead’s own page on it', x: 1.8, z: back + 2.6, yaw: 0, pitch: 0.05, page: kit.page, frame: frame },
        { name: 'at the word on whose these are, on the left-hand wall', x: L + 1.6, z: -6.9, yaw: LEFT, frame: thanks.el });

      return {
        start: { x: 2.3, z: -0.8, yaw: 0.8 },
        bounds: { x: [L + 0.5, R - 0.5], z: [back + 0.8, -0.5] },
        stops: stops
      };
    }
  };
})();

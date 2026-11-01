/* =============================================================================
   The Playhouse, walked into on Cel Street. Ryan's ask, 2026-10-31: back to the
   street, working down it, room by room.

   IT IS THE PLAYHOUSE'S WORLD AND NOBODY ELSE'S (§10): saturated primary blue,
   bunting along the top of every wall, a checkerboard floor, and the toys, each
   in its own fill and none repeated. It is not the Arcade's coin-op at
   midnight: here it is broad day, every object is a lump of bright colour with
   a hard ink edge, and the light is even, the way a television studio's is.

   THE TOYS ARE DRAWN, NOT LIFTED. Every toy and every key of the sound board is
   worked by love.js, which binds once, when a page loads, so a copy lifted
   into the scene would be a button that does nothing. So each one stands here
   as an object on its own plinth, in its own colour (the stim box, Chairy, the
   word clock, the yell button, the echo, the double empathy telephone, the safe
   food tin, the spoon drawer, the off switch, the infodump), the sound board's
   nine keys stand on their stand, and the room's own page hangs on the back
   wall, where every one of them works as itself.

   NOTHING MOVES AND NOTHING MAKES A SOUND here: the noises are the page's, on
   the press. Every colour is one love.css declares, by name; the floor's
   checks are the room's ink and cream. It keeps nothing, sends nothing and
   fetches nothing; its page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['playhouse.html'] = {
    name: 'The Playhouse',
    faces: ['Titan One'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var W = 12, D = 14, H = 3.6, back = -D;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };

      // EVEN STUDIO LIGHT: bright, from everywhere, one sun for the shadows.
      kit.scene.background = kit.col('--blue');
      kit.scene.add(new T.HemisphereLight(kit.col('--cream'), kit.col('--blue'), 2.0));
      var sun = new T.DirectionalLight(kit.col('--cream'), 1.5);
      sun.position.set(3, 10, 2); sun.target.position.set(0, 0, -7);
      sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024);
      sun.shadow.camera.left = -9; sun.shadow.camera.right = 9; sun.shadow.camera.top = 10; sun.shadow.camera.bottom = -10;
      sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.02;
      kit.scene.add(sun, sun.target);

      // THE ROOM: blue walls, a cream ceiling, and the checkerboard floor.
      var checks = kit.paper(64, 64, function (c, w, h) {
        c.fillStyle = kit.ink('--cream'); c.fillRect(0, 0, w, h);
        c.fillStyle = kit.ink('--ink'); c.fillRect(0, 0, w / 2, h / 2); c.fillRect(w / 2, h / 2, w / 2, h / 2);
      });
      checks.wrapS = checks.wrapT = T.RepeatWrapping;
      checks.repeat.set(W / 1.2, (D + 2) / 1.2);
      checks.magFilter = T.NearestFilter;
      kit.sheet(checks, W, D + 2, at(0, 0.002, -D / 2 + 1, 0, -Math.PI / 2));
      box(W, 0.1, D + 2, at(0, -0.05, -D / 2 + 1), '--ink', false, false);
      box(0.3, H, D + 2, at(-W / 2 - 0.15, H / 2, -D / 2 + 1), '--blue');
      box(0.3, H, D + 2, at(W / 2 + 0.15, H / 2, -D / 2 + 1), '--blue');
      box(W + 0.6, H, 0.3, at(0, H / 2, back - 0.15), '--blue');
      box(W + 0.6, 0.2, D + 2, at(0, H + 0.1, -D / 2 + 1), '--cream', false, false);
      // The doorway you came in by, behind you.
      box((W - 2.2) / 2, H, 0.3, at(-(W + 2.2) / 4, H / 2, 1.15), '--blue');
      box((W - 2.2) / 2, H, 0.3, at((W + 2.2) / 4, H / 2, 1.15), '--blue');
      box(2.2, H - 2.5, 0.3, at(0, 2.5 + (H - 2.5) / 2, 1.15), '--blue');
      // An ink line where every wall meets the floor, as the page's floor has.
      box(W, 0.12, 0.04, at(0, 0.06, back + 0.02), '--ink', false, false);
      box(0.04, 0.12, D, at(-W / 2 + 0.02, 0.06, -D / 2), '--ink', false, false);
      box(0.04, 0.12, D, at(W / 2 - 0.02, 0.06, -D / 2), '--ink', false, false);

      // THE BUNTING, red, yellow, green and violet, round the top of the walls.
      var FLAGS = ['--red', '--yellow', '--green', '--violet'];
      var flag = new T.ConeGeometry(0.16, 0.34, 3); flag.rotateX(Math.PI); flag.scale(1, 1, 0.25);
      function bunting(from, to) {
        var span = to.clone().sub(from), n = Math.floor(span.length() / 0.42), ry = Math.atan2(-span.z, span.x);
        box(span.length(), 0.015, 0.015, at((from.x + to.x) / 2, from.y + 0.02, (from.z + to.z) / 2, ry), '--ink', false, false);
        for (var i = 0; i < n; i++) {
          var p = from.clone().add(span.clone().multiplyScalar((i + 0.5) / n));
          kit.piece(flag, at(p.x, p.y - 0.17, p.z, ry), FLAGS[i % 4], 0.012);
        }
      }
      var BY = H - 0.25;
      bunting(new T.Vector3(-W / 2 + 0.05, BY, 0.9), new T.Vector3(-W / 2 + 0.05, BY, back + 0.05));
      bunting(new T.Vector3(W / 2 - 0.05, BY, 0.9), new T.Vector3(W / 2 - 0.05, BY, back + 0.05));
      bunting(new T.Vector3(-W / 2 + 0.05, BY, back + 0.05), new T.Vector3(W / 2 - 0.05, BY, back + 0.05));
      [-4.5, -9.5].forEach(function (z) {
        bunting(new T.Vector3(-W / 2 + 0.05, BY - 0.1, z), new T.Vector3(W / 2 - 0.05, BY - 0.1, z));
      });

      // A SIGN lettered in the room's own face, on a card.
      function sign(words, ground, ink, w, h) {
        return kit.paper(Math.round(w * 200), Math.round(h * 200), function (c, cw, ch) {
          c.fillStyle = kit.ink(ground); c.fillRect(0, 0, cw, ch);
          c.fillStyle = kit.ink(ink);
          c.textAlign = 'center'; c.textBaseline = 'middle';
          var lines = words.split('\n'), size = Math.min(ch / (lines.length * 1.25), 64);
          c.font = size + "px 'Titan One'";
          while (size > 8 && lines.some(function (l) { return c.measureText(l).width > cw * 0.9; })) { size -= 2; c.font = size + "px 'Titan One'"; }
          lines.forEach(function (l, i) { c.fillText(l, cw / 2, ch / 2 + (i - (lines.length - 1) / 2) * size * 1.15); });
        });
      }

      // THE TOYS, each on a cream plinth along the side walls, each in its own
      // fill, as on the page; nothing on them moves and none of them sounds.
      var stops = [{ name: 'in the doorway', x: 0, z: 0.4, yaw: 0 }];
      var ZS = [-2.6, -4.6, -6.6, -8.6, -10.6];
      function plinth(side, z) {
        var x = side * (W / 2 - 0.8), g = at(x, 0, z, side < 0 ? LEFT : RIGHT);
        box(1.0, 0.7, 1.0, M(g, at(0, 0.35, 0)), '--cream', 0.02);
        return g;
      }
      function stopAt(side, z, words) {
        stops.push({ name: words, x: side * (W / 2 - 2.7), z: z, yaw: side < 0 ? LEFT : RIGHT, pitch: -0.28 });
      }
      var TOP = 0.7;

      // The stim box: a yellow box of drawers with knobs.
      var g = plinth(-1, ZS[0]);
      box(0.7, 0.42, 0.55, M(g, at(0, TOP + 0.21, 0)), '--yellow', 0.02);
      [0.09, -0.09].forEach(function (y) {
        box(0.6, 0.004, 0.01, M(g, at(0, TOP + 0.21 + y, 0.28)), '--ink', false);
        kit.cyl(0.035, 0.035, 0.05, M(g, at(0, TOP + 0.21 + y + 0.05, 0.29, 0, Math.PI / 2)), '--ink', false, 10);
      });
      stopAt(-1, ZS[0], 'at the stim box, a drawer of things that make a satisfying noise');

      // Chairy, the green armchair that talks back.
      g = plinth(-1, ZS[1]);
      box(0.66, 0.16, 0.56, M(g, at(0, TOP + 0.24, 0)), '--green', 0.02);
      box(0.66, 0.5, 0.14, M(g, at(0, TOP + 0.49, -0.21)), '--green', 0.02);
      [-1, 1].forEach(function (s) { box(0.12, 0.3, 0.56, M(g, at(s * 0.33, TOP + 0.35, 0)), '--green', 0.02); });
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { box(0.05, 0.16, 0.05, M(g, at(c[0] * 0.28, TOP + 0.08, c[1] * 0.22)), '--ink', false); });
      stopAt(-1, ZS[1], 'at Chairy, the furniture that talks back');

      // The word clock: a violet case round a cream face, two ink hands.
      g = plinth(-1, ZS[2]);
      box(0.62, 0.62, 0.16, M(g, at(0, TOP + 0.36, 0)), '--violet-deep', 0.02);
      kit.cyl(0.25, 0.25, 0.03, M(g, at(0, TOP + 0.36, 0.09, 0, Math.PI / 2)), '--cream', false, 28);
      box(0.025, 0.2, 0.01, M(g, at(0.05, TOP + 0.43, 0.11, 0, 0, -0.5)), '--ink', false);
      box(0.025, 0.14, 0.01, M(g, at(-0.05, TOP + 0.32, 0.11, 0, 0, -2.2)), '--ink', false);
      kit.cyl(0.03, 0.03, 0.02, M(g, at(0, TOP + 0.36, 0.115, 0, Math.PI / 2)), '--ink', false, 10);
      stopAt(-1, ZS[2], 'at the word clock, a glossary term every hour');

      // The yell button: one big orange button on an ink base.
      g = plinth(-1, ZS[3]);
      kit.cyl(0.32, 0.36, 0.14, M(g, at(0, TOP + 0.07, 0)), '--ink', 0.02, 28);
      kit.cyl(0.25, 0.27, 0.12, M(g, at(0, TOP + 0.2, 0)), '--orange', 0.02, 28);
      stopAt(-1, ZS[3], 'at the yell button, which does exactly one thing');

      // The echo: a cyan horn on a stand.
      g = plinth(-1, ZS[4]);
      kit.cyl(0.04, 0.04, 0.3, M(g, at(0, TOP + 0.15, 0)), '--ink', false, 8);
      kit.piece(new T.ConeGeometry(0.24, 0.5, 18, 1, true), M(g, at(0, TOP + 0.42, 0.06, 0, -Math.PI / 2 + 0.2)), '--cyan', 0.015);
      stopAt(-1, ZS[4], 'at the echo, which says the last thing again');

      // The double empathy telephone: a pink base, two handsets.
      g = plinth(1, ZS[0]);
      box(0.66, 0.16, 0.42, M(g, at(0, TOP + 0.08, 0)), '--pink', 0.02);
      [-1, 1].forEach(function (s) {
        var h = M(g, at(s * 0.18, TOP + 0.22, 0, s * 0.3));
        box(0.1, 0.06, 0.34, h, '--pink', 0.015);
        [-1, 1].forEach(function (e) { kit.cyl(0.06, 0.06, 0.06, M(h, at(0, -0.02, e * 0.17)), '--pink', 0.012, 12); });
      });
      stopAt(1, ZS[0], 'at the double empathy telephone, two handsets and one conversation');

      // The safe food tin: the same tin, cream, with an ink band.
      g = plinth(1, ZS[1]);
      cyl(0.2, 0.2, 0.42, M(g, at(0, TOP + 0.21, 0)), '--cream', 0.02, 24);
      cyl(0.205, 0.205, 0.05, M(g, at(0, TOP + 0.4, 0)), '--ink', false, 24);
      stopAt(1, ZS[1], 'at the safe food tin, the same thing every time');

      // The spoon drawer: a red drawer with an ink handle, which hands out
      // sentences rather than spoons.
      g = plinth(1, ZS[2]);
      box(0.72, 0.34, 0.56, M(g, at(0, TOP + 0.17, 0)), '--red', 0.02);
      box(0.3, 0.05, 0.05, M(g, at(0, TOP + 0.18, 0.3)), '--ink', false);
      stopAt(1, ZS[2], 'at the spoon drawer, which hands you the sentences');

      // The off switch: an ink box with a cream edge and a yellow lever.
      g = plinth(1, ZS[3]);
      box(0.5, 0.5, 0.3, M(g, at(0, TOP + 0.25, 0)), '--ink', false);
      box(0.54, 0.54, 0.26, M(g, at(0, TOP + 0.25, -0.03)), '--cream', false);
      box(0.08, 0.26, 0.08, M(g, at(0, TOP + 0.22, 0.18, 0, 0.5)), '--yellow', 0.012);
      stopAt(1, ZS[3], 'at the off switch, which stops every sound at once');

      // The infodump: a lilac stack of books, a little askew.
      g = plinth(1, ZS[4]);
      for (var b = 0; b < 4; b++) box(0.56 - b * 0.04, 0.1, 0.42, M(g, at((b % 2 ? 0.03 : -0.02), TOP + 0.05 + b * 0.105, 0, b * 0.12)), b % 2 ? '--violet' : '--violet-deep', 0.012);
      stopAt(1, ZS[4], 'at the infodump, which tells you more about a thing');

      // THE SOUND BOARD on its stand in the middle: nine keys, three by three,
      // in the page's colours, the bottom row the moods.
      var KEYS = ['--yellow', '--green', '--cyan', '--orange', '--pink', '--violet', '--ink', '--ink', '--ink'];
      var bz = -7.6, bt = at(0, 0, bz, 0, 0);
      box(2.0, 0.9, 1.3, M(bt, at(0, 0.45, 0)), '--cream', 0.02);
      var deck = M(bt, at(0, 0.98, 0, 0, 0.3));
      box(1.9, 0.08, 1.25, deck, '--ink', false);
      KEYS.forEach(function (k, i) {
        var kx = (i % 3 - 1) * 0.58, kz = (Math.floor(i / 3) - 1) * 0.38;
        box(0.5, 0.06, 0.32, M(deck, at(kx, 0.07, kz)), k, false);
        if (k === '--ink') box(0.52, 0.05, 0.34, M(deck, at(kx, 0.05, kz)), '--cream', false);
      });
      kit.sheet(sign('THE SOUND BOARD', '--yellow', '--ink', 1.6, 0.3), 1.6, 0.3, M(bt, at(0, 0.62, 0.66)));
      stops.push({ name: 'at the sound board, nine keys on a stand in the middle', x: 0, z: bz + 2.2, yaw: 0, pitch: -0.42 });

      // ON THE BACK WALL: today's secret word on its sign, the house rules,
      // and between them the room's own page, where every toy works.
      var sw = 4.4, sh = sw * 800 / 1180, sy = 0.55 + sh / 2;
      box(sw + 0.24, sh + 0.24, 0.06, at(0, sy, back + 0.03), '--ink');
      var frame = kit.screen(1180, 800, sw, at(0, sy, back + 0.08), 'The Playhouse’s own page, on the back wall, where every toy works');
      kit.sheet(sign('TODAY’S\nSECRET\nWORD', '--yellow', '--ink', 1.3, 1.1), 1.3, 1.1, at(-3.9, 1.9, back + 0.05));
      box(1.42, 1.22, 0.04, at(-3.9, 1.9, back + 0.02), '--ink', false, false);
      kit.sheet(sign('HOUSE\nRULES', '--cream', '--blue', 1.3, 1.1), 1.3, 1.1, at(3.9, 1.9, back + 0.05));
      box(1.42, 1.22, 0.04, at(3.9, 1.9, back + 0.02), '--ink', false, false);
      stops.push({ name: 'at the back wall, with the room’s own page on it, where every toy works', x: 0, z: back + 3.0, yaw: 0, page: kit.page, frame: frame });
      stops.push({ name: 'at today’s secret word, on its sign', x: -3.9, z: back + 2.4, yaw: 0, page: kit.page, frame: frame });
      stops.push({ name: 'at the house rules', x: 3.9, z: back + 2.4, yaw: 0, page: kit.page, frame: frame });

      return {
        start: { x: 0, z: 0.4, yaw: 0 },
        bounds: { x: [-W / 2 + 1.6, W / 2 - 1.6], z: [back + 1.8, 0.6] },
        stops: stops
      };
    }
  };
})();

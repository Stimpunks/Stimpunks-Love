/* =============================================================================
   Otterly Adorbs, walked into on Cel Street, through its cabinet in the
   Arcade. Ryan's ask, 2026-11-01: the rooms behind the doors.

   IT IS THE ARCADE'S BODY AND THIS MACHINE'S SCREEN (§15). The foyer's grape
   carpet and purple walls, the marquee bulbs and the cabinet build are the
   same here as out front, because an arcade is machines with one body and
   different things behind the glass. The world is the screen: a kelp bay,
   a different dark from the room round it.

   THE CABINET IS THE PAGE'S OWN, lifted off it by Cel Street's kit.lift(): its
   marquee, the bay with the otter in it, the pad and the knobs, on the front
   of a cabinet drawn here round it. The otter is drawn once in the page's own
   defs, which are lifted too, so every pose and the three otters who are not
   you are the page's drawing. The page's own otterly.js is wired against the
   copy, so the bay is played where it stands, exactly as on the page: nothing
   in it moves until START is pressed, floating on your back fills nothing up,
   no otter is ranked against another, the stone is kept only through one bout
   of feeding, and the cabinet never makes a sound. What just happened is
   written on the plate on the left-hand wall, and Helen Edgar's reading is
   credited by the page's own words, lifted as they are, on the right.

   NOTHING ELSE MOVES: the bulbs are lit and still. Every colour is one the
   Arcade declares, by name. It keeps nothing, sends nothing and fetches
   nothing; its page arrives through Cel Street's screen(). tools/
   make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 31, 374761393) ^ Math.imul(j + 7, 668265263) ^ Math.imul(k + 59, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['otterly-adorbs.html'] = {
    name: 'Otterly Adorbs',
    from: 'arcade.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, W = 8, D = 7, H = 3.4, back = -D;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;

      // MIDNIGHT, and the screen is the light, as in the foyer.
      kit.scene.background = kit.col('--carpet');
      kit.scene.add(new T.HemisphereLight(kit.col('--tube-2'), kit.col('--carpet'), 1.0));

      // THE CARPET, the foyer's: grape with its confetti, in tiles.
      var SHAPES = ['--zap', '--mint', '--coin', '--tube-2'];
      var carpet = kit.paper(256, 256, function (c, w, h) {
        c.fillStyle = kit.ink('--carpet'); c.fillRect(0, 0, w, h);
        for (var i = 0; i < 26; i++) {
          var x = hash(i, 1, 1) * w, y = hash(i, 1, 2) * h, r = 5 + hash(i, 1, 3) * 7, kind = i % 4;
          c.fillStyle = kit.ink(SHAPES[i % SHAPES.length]);
          c.strokeStyle = c.fillStyle; c.lineWidth = 3;
          c.beginPath();
          if (kind === 0) { c.arc(x, y, r, 0, Math.PI * 2); c.fill(); }
          else if (kind === 1) { c.moveTo(x, y - r); c.lineTo(x + r, y + r); c.lineTo(x - r, y + r); c.closePath(); c.fill(); }
          else if (kind === 2) { c.moveTo(x - r, y); c.quadraticCurveTo(x, y - r * 1.4, x + r, y); c.stroke(); }
          else { c.fillRect(x - r * 0.6, y - r * 0.6, r * 1.2, r * 1.2); }
        }
      });
      box(W, 0.1, D + 2, at(0, -0.06, -D / 2 + 1), '--carpet', false, false);
      for (var tx = -W / 2 + 1; tx < W / 2; tx += 2) {
        for (var tz = 0; tz > back - 1; tz -= 2) kit.sheet(carpet, 2, 2, at(tx, 0.002, tz, 0, -Math.PI / 2));
      }

      // THE BAY: the cabinet's purple walls, the carpet's dark overhead, and
      // the way back to the foyer behind you.
      box(0.3, H, D + 2, at(-W / 2 - 0.15, H / 2, -D / 2 + 1), '--cab');
      box(0.3, H, D + 2, at(W / 2 + 0.15, H / 2, -D / 2 + 1), '--cab');
      box(W + 0.6, H, 0.3, at(0, H / 2, back - 0.15), '--cab');
      box(W + 0.6, 0.2, D + 2, at(0, H + 0.1, -D / 2 + 1), '--carpet', false, false);
      box((W - 2.2) / 2, H, 0.3, at(-(W + 2.2) / 4, H / 2, 1.15), '--cab');
      box((W - 2.2) / 2, H, 0.3, at((W + 2.2) / 4, H / 2, 1.15), '--cab');
      box(2.2, H - 2.5, 0.3, at(0, 2.5 + (H - 2.5) / 2, 1.15), '--cab');
      box(W, 0.06, 0.04, at(0, 0.03, back + 0.02), '--coin', false, false);

      // Marquee bulbs, lit and still, coin and zap by turns.
      function bulbs(m, len, n) {
        for (var b = 0; b < n; b++) {
          kit.flat(new T.SphereGeometry(0.045, 8, 6), M(m, at(-len / 2 + (b + 0.5) * len / n, 0, 0)), b % 2 ? '--zap' : '--coin');
        }
      }
      bulbs(at(0, H - 0.25, back + 0.08), W - 0.6, 30);

      // THE PAGE, on the back wall to the right of the cabinet, in a coin edge.
      var pw = 2.2, ph = pw * 800 / 1180, py = 0.75 + ph / 2, PX = 2.45;
      var pg = at(PX, 0, back + 0.02);
      box(pw + 0.2, ph + 0.2, 0.06, M(pg, at(0, py, 0)), '--coin', 0.02);
      var frame = kit.screen(1180, 800, pw, M(pg, at(0, py, 0.04)), 'Otterly Adorbs’ own page, on the back wall');
      bulbs(M(pg, at(0, py + ph / 2 + 0.22, 0.06)), pw, 11);

      // THE CABINET, the foyer's build come up close: hard blocks of the
      // purple, coin-yellow edges, bulbs along the top, and on its front the
      // page's own cabinet, marquee, screen, pad and knobs, lifted.
      var CZ = back + 1.0, FRONT = CZ + 0.46;
      var g = at(0, 0, CZ);
      box(1.5, 0.5, 0.92, M(g, at(0, 0.25, 0)), '--cab');
      box(1.5, 1.95, 0.6, M(g, at(0, 1.47, -0.16)), '--cab');
      box(1.56, 0.36, 0.84, M(g, at(0, 2.62, -0.04)), '--cab');
      [-1, 1].forEach(function (s) {
        box(0.08, 2.44, 0.94, M(g, at(s * 0.79, 1.22, 0)), '--cab');
        box(0.04, 2.44, 0.04, M(g, at(s * 0.81, 1.22, 0.47)), '--coin', false);
      });
      box(1.62, 0.04, 0.04, M(g, at(0, 2.44, 0.47)), '--coin', false);
      bulbs(M(g, at(0, 2.62, 0.39)), 1.44, 11);
      // The bay is the light, a kelp green off the water.
      var light = new T.PointLight(kit.col('--kelp-2'), 2.0, 4.5, 1.6);
      light.position.set(0, 1.6, FRONT + 1.0);
      kit.scene.add(light);
      // The otter is drawn once in the page's own defs: they come too, unseen,
      // so every pose on the screen finds its drawing.
      kit.lift(frame, '.arc-defs', { w: 10, ww: 0.01, m: at(0, 0.5, FRONT - 0.3), bare: true });
      var cab = kit.lift(frame, '.cabinet', { w: 600, ww: 1.36, m: at(0, 0.5, FRONT) });

      // WHAT JUST HAPPENED on the left-hand wall: otterly.js writes it as you
      // swim, so it comes with the cabinet. Then what the cabinet will not do.
      // Why otters is on the other wall, so it is left off this one.
      var side = kit.lift(frame, '.arc-side', { w: 560, h: 760, ww: 1.6, m: at(-W / 2 + 0.02, 0.6, -3.6, LEFT), drop: ':scope > .plate:nth-of-type(3)' });
      // WHY OTTERS, with Helen Edgar's reading credited as the page has it, on the right.
      var foot = kit.lift(frame, '.plate', { n: 2, w: 640, h: 760, ww: 1.7, m: at(W / 2 - 0.02, 0.6, -3.6, RIGHT) });
      // THE DIAL AND THE SPEED KNOBS, on the back wall to the left.
      var tail = kit.lift(frame, '.plate', { n: 3, w: 560, h: 640, ww: 1.5, m: at(-2.45, 0.75, back + 0.02) });

      // The page's own script, against the copy: START, the pad, the moves,
      // the knobs, the log. It binds once, by id, so it runs after its parts arrive.
      kit.wire(frame, 'otterly.js');

      var stops = [
        { name: 'in front of the Otterly Adorbs cabinet, its bay still until you start it', where: 'in front of the Otterly Adorbs cabinet, its bay still until you start it',
          x: 0, z: FRONT + 2.2, yaw: 0, pitch: 0.02, frame: cab.el },
        { name: 'up at the bay, close enough to swim', where: 'up at the bay, close enough to swim', x: 0, z: FRONT + 1.55, yaw: 0, pitch: 0.16, frame: cab.el },
        { name: 'at the pad and the knobs', where: 'at the pad, the moves and the knobs under the bay', x: 0, z: FRONT + 1.0, yaw: 0, pitch: -0.32, frame: cab.el },
        { name: 'at the left-hand wall, with what just happened', where: 'at the left-hand wall, with what just happened and what the cabinet will not do', x: -W / 2 + 2.3, z: -3.6, yaw: LEFT, frame: side.el },
        { name: 'at the right-hand wall, with why otters', where: 'at the right-hand wall, with why otters and whose reading it is', x: W / 2 - 2.4, z: -3.6, yaw: RIGHT, frame: foot.el },
        { name: 'at the back wall, with the dial and the speed knobs', where: 'at the back wall, with the dial and the speed knobs', x: -2.45, z: back + 2.2, yaw: 0, frame: tail.el },
        { name: 'at the back wall, with Otterly Adorbs’ own page on it', where: 'at the back wall, with Otterly Adorbs’ own page on it', x: PX, z: back + 2.2, yaw: 0, page: kit.page, frame: frame },
        { name: 'looking back at the way out to the foyer', where: 'looking back at the way out to the foyer', x: 0, z: -2.0, yaw: Math.PI }
      ];

      return {
        start: { x: 0, z: FRONT + 2.2, yaw: 0 },
        bounds: { x: [-W / 2 + 0.8, W / 2 - 0.8], z: [FRONT + 0.7, 0.6] },
        stops: stops
      };
    }
  };
})();

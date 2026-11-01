/* =============================================================================
   Penguin Pebbling, walked into on Cel Street, through its cabinet in the
   Arcade. Ryan's ask, 2026-11-01: the rooms behind the doors.

   IT IS THE ARCADE'S BODY AND THIS MACHINE'S SCREEN (§15). The Arcade is the
   one room whose pages are supposed to look alike: the carpet, the marquee
   bulbs, the cabinet build and the pixel face are the foyer's, because an
   arcade is machines with one body and different things behind the glass. So
   this is the foyer's grape carpet and purple walls come up close to one
   cabinet, and the world is the screen: an overcast shore.

   THE CABINET IS THE PAGE'S OWN, lifted off it by Cel Street's kit.lift(): its
   marquee, its shore, its pad and its knobs, on the front of a cabinet drawn
   here round it, with the page's own drawing of the penguin lifted beside it
   (the sprite on the shore is made of that drawing by <use>, so it has to be
   in this document too). The page's own pebbling.js is wired against the
   copy: nothing on the shore moves until START, the penguin walks by left and
   top, and the cabinet never makes a sound. Its strip of what just happened,
   which forgets all but the last few, is lifted with it.

   IT IS BUILT ON THE LOCUTION AND TAKES NOTHING FROM THE DECK. Amythest
   Schaber's locution, and the page's own words on where it comes from and
   what the Penguin Pebbling card game is (Helen Edgar's and Ryan Boren's, a
   separate and better thing under a different licence), lifted as they are.
   No card, no prompt, no artwork of the deck's is drawn here. Nothing is
   counted: the pebbles at the cabinet's foot are a few stones, not a tally.

   NOTHING ELSE MOVES: the bulbs are lit and still. Every colour is one the
   Arcade or the shore declares, by name. It keeps nothing, sends nothing and
   fetches nothing; its page arrives through Cel Street's screen(). tools/
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
  window.loveCelRooms['penguin-pebbling.html'] = {
    name: 'Penguin Pebbling',
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
          var x = hash(i, 2, 1) * w, y = hash(i, 2, 2) * h, r = 5 + hash(i, 2, 3) * 7, kind = i % 4;
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
      var frame = kit.screen(1180, 800, pw, M(pg, at(0, py, 0.04)), 'Penguin Pebbling’s own page, on the back wall');
      bulbs(M(pg, at(0, py + ph / 2 + 0.22, 0.06)), pw, 11);

      // THE PENGUIN'S DRAWING, which the sprite on the shore and every
      // neighbour is made of by <use>. It draws nothing itself.
      kit.lift(frame, '.pen-defs', { w: 10, ww: 0.01, bare: true, m: at(0, 0.01, back + 0.1) });

      // THE CABINET, the foyer's build come up close: hard blocks of the
      // purple, coin-yellow edges, bulbs along the top, and on its front the
      // page's own cabinet, marquee, shore, pad and knobs, lifted.
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
      // The shore's overcast is what this screen throws out over the carpet.
      var light = new T.PointLight(kit.col('--sky'), 2.4, 4.5, 1.6);
      light.position.set(0, 1.6, FRONT + 1.0);
      kit.scene.add(light);
      var cab = kit.lift(frame, '.cabinet', { w: 600, ww: 1.36, m: at(0, 0.5, FRONT) });

      // A few stones on the carpet at the cabinet's foot, in the shore's own
      // shingle, sea and dark: somebody carried them over. Not a tally.
      var STONES = ['--shingle', '--sea', '--pen-dark', '--shingle', '--sea'];
      for (var p = 0; p < STONES.length; p++) {
        var sx = -1.15 + p * 0.55 + (hash(p, 5, 1) - 0.5) * 0.2, sz = FRONT + 0.25 + hash(p, 5, 2) * 0.25;
        var stone = new T.SphereGeometry(0.07 + hash(p, 5, 3) * 0.04, 12, 8);
        stone.scale(1.3, 0.55, 1);
        kit.piece(stone, at(sx, 0.035, sz), STONES[p]);
      }

      // WHAT JUST HAPPENED, which pebbling.js writes and which forgets, and WHAT
      // PENGUIN PEBBLING WILL NOT DO, on the left-hand wall.
      var log = kit.lift(frame, '.plate', { n: 0, w: 520, h: 520, ww: 1.35, m: at(-W / 2 + 0.02, 0.8, -1.9, LEFT) });
      var wont = kit.lift(frame, '.plate', { n: 1, w: 560, h: 760, ww: 1.6, m: at(-W / 2 + 0.02, 0.6, -4.4, LEFT) });
      // WHERE THIS COMES FROM, AND WHAT IT IS NOT, on the right: the locution's
      // credit and the deck's, as the page has them.
      var from = kit.lift(frame, '.plate', { n: 2, w: 640, h: 760, ww: 1.7, m: at(W / 2 - 0.02, 0.6, -3.6, RIGHT) });
      // THE DIAL AND THE SPEED KNOB, on the back wall to the left.
      var tail = kit.lift(frame, '.plate', { n: 3, w: 560, h: 520, ww: 1.5, m: at(-2.45, 0.85, back + 0.02) });

      // The page's own script, against the copy: START, the pad, the knobs,
      // the strip. It binds once, by id, so it runs after its parts arrive.
      kit.wire(frame, 'pebbling.js');

      var stops = [
        { name: 'in front of the Penguin Pebbling cabinet, its shore still until you start it', where: 'in front of the Penguin Pebbling cabinet, its shore still until you start it',
          x: 0, z: FRONT + 2.2, yaw: 0, pitch: 0.02, frame: cab.el },
        { name: 'up at the screen, close enough to play', where: 'up at the screen, close enough to play', x: 0, z: FRONT + 1.55, yaw: 0, pitch: 0.16, frame: cab.el },
        { name: 'at the pad and the knobs', where: 'at the pad and the knobs under the screen', x: 0, z: FRONT + 1.0, yaw: 0, pitch: -0.32, frame: cab.el },
        { name: 'at the left-hand wall, with what just happened', where: 'at the left-hand wall, with what just happened on the shore', x: -W / 2 + 2.1, z: -1.9, yaw: LEFT, frame: log.el },
        { name: 'at the left-hand wall, with what it will not do', where: 'at the left-hand wall, with what Penguin Pebbling will not do', x: -W / 2 + 2.3, z: -4.4, yaw: LEFT, frame: wont.el },
        { name: 'at the right-hand wall, with where this comes from', where: 'at the right-hand wall, with where this comes from and what it is not', x: W / 2 - 2.4, z: -3.6, yaw: RIGHT, frame: from.el },
        { name: 'at the back wall, with the dial and the speed knob', where: 'at the back wall, with the dial and the speed knob', x: -2.45, z: back + 2.2, yaw: 0, frame: tail.el },
        { name: 'at the back wall, with Penguin Pebbling’s own page on it', where: 'at the back wall, with Penguin Pebbling’s own page on it', x: PX, z: back + 2.2, yaw: 0, page: kit.page, frame: frame },
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

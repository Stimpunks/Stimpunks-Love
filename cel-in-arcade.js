/* =============================================================================
   The Arcade, walked into on Cel Street. Ryan's ask, 2026-10-31: back to the
   street, working down it, room by room.

   IT IS THE ARCADE'S WORLD AND NOBODY ELSE'S (§15): a coin-op at midnight. A
   grape carpet with the confetti every arcade carpet has, cabinets built out
   of hard blocks with coin-yellow edges, a marquee of bulbs lit and STEADY,
   and the only light in the room the screens. The pixel face letters the sign
   over the cabinets and nothing else.

   THE CABINETS' FRONTS ARE THE PAGE'S OWN, lifted off it by Cel Street's
   kit.lift(): each machine's marquee, its attract screen standing still and
   its words, a link to that machine's own page, on the front of a cabinet
   drawn here round it. The screens' drawings come with them (the otter and the
   penguin are drawn once in the page's own defs, which are lifted too), so
   nothing of Esmx, the otter or the penguin is drawn again here. The games are
   on their pages; a cabinet here is the door to one.

   NOTHING MOVES AND NOTHING MAKES A SOUND, the cabinets included, at any
   setting: the page's marquee chases at MAX, and this one does not, because a
   room on Cel Street moves only when you do. Every colour is one the Arcade
   declares, by name. It keeps nothing, sends nothing and fetches nothing; its
   page arrives through Cel Street's screen(). tools/make-cel-street.py holds
   each of those.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 31, 374761393) ^ Math.imul(j + 7, 668265263) ^ Math.imul(k + 59, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['arcade.html'] = {
    name: 'The Arcade',
    faces: ['Press Start 2P'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, W = 10, D = 11, H = 3.6, back = -D;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var RIGHT = -Math.PI / 2;

      // MIDNIGHT, and the screens are the light: the room dark grape, a little
      // of the screens' pale bounced round it, and a light in front of every
      // machine.
      kit.scene.background = kit.col('--carpet');
      kit.scene.add(new T.HemisphereLight(kit.col('--tube-2'), kit.col('--carpet'), 1.0));

      // THE CARPET: grape, with the confetti of shapes every arcade carpet has,
      // drawn once and laid in tiles.
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

      // THE ROOM: the cabinet's own purple for the walls, the carpet's dark
      // overhead, a door behind you.
      box(0.3, H, D + 2, at(-W / 2 - 0.15, H / 2, -D / 2 + 1), '--cab');
      box(0.3, H, D + 2, at(W / 2 + 0.15, H / 2, -D / 2 + 1), '--cab');
      box(W + 0.6, H, 0.3, at(0, H / 2, back - 0.15), '--cab');
      box(W + 0.6, 0.2, D + 2, at(0, H + 0.1, -D / 2 + 1), '--carpet', false, false);
      box((W - 2.2) / 2, H, 0.3, at(-(W + 2.2) / 4, H / 2, 1.15), '--cab');
      box((W - 2.2) / 2, H, 0.3, at((W + 2.2) / 4, H / 2, 1.15), '--cab');
      box(2.2, H - 2.5, 0.3, at(0, 2.5 + (H - 2.5) / 2, 1.15), '--cab');
      box(W, 0.06, 0.04, at(0, 0.03, back + 0.02), '--coin', false, false);

      // A row of marquee bulbs, lit and still, coin and zap by turns.
      function bulbs(m, len, n) {
        for (var b = 0; b < n; b++) {
          kit.flat(new T.SphereGeometry(0.045, 8, 6), M(m, at(-len / 2 + (b + 0.5) * len / n, 0, 0)), b % 2 ? '--zap' : '--coin');
        }
      }

      // THE SIGN over the cabinets, in the pixel face, with bulbs round it.
      var sign = kit.paper(1024, 180, function (c, w, h) {
        c.fillStyle = kit.ink('--cab'); c.fillRect(0, 0, w, h);
        c.fillStyle = kit.ink('--coin'); c.font = '72px "Press Start 2P"';
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText('THE ARCADE', w / 2, h / 2 + 4);
      });
      var sy = H - 0.62, sw2 = 4.2;
      kit.sheet(sign, sw2, sw2 * 180 / 1024, at(0, sy, back + 0.04));
      bulbs(at(0, sy + 0.5, back + 0.08), sw2 + 0.4, 18);
      bulbs(at(0, sy - 0.5, back + 0.08), sw2 + 0.4, 18);

      // THE ARCADE'S OWN PAGE on the right-hand wall, in a cabinet-yellow edge.
      var pw = 3.2, ph = pw * 800 / 1180, py = 0.5 + ph / 2;
      var pg = at(W / 2 - 0.02, 0, -3.2, RIGHT);
      box(pw + 0.2, ph + 0.2, 0.06, M(pg, at(0, py, 0)), '--coin', 0.02);
      var frame = kit.screen(1180, 800, pw, M(pg, at(0, py, 0.04)), 'The Arcade’s own page, on the right-hand wall');
      bulbs(M(pg, at(0, py + ph / 2 + 0.24, 0.06)), pw, 14);

      // The page's own drawings of the otter and the penguin, which the
      // cabinets' screens draw from, lifted out of sight.
      kit.lift(frame, '.arc-defs', { n: 0, w: 10, ww: 0.01, m: at(0, 0.5, 0.5), bare: true });
      kit.lift(frame, '.arc-defs', { n: 1, w: 10, ww: 0.01, m: at(0, 0.5, 0.5), bare: true });

      // THE CABINETS, in a row facing the door: hard blocks of the cabinet's
      // purple, coin-yellow edges, a control panel with a stick and three
      // buttons, bulbs along the top, and on the front the page's own card for
      // that machine. A light stands in front of each, the screen's.
      var CABS = [
        { sel: '.cabfront.cabfront--quill', name: 'Quill Drift', page: 'quill-drift.html', x: -2.8 },
        { sel: '.cabfront.cabfront--otter', name: 'Otterly Adorbs', page: 'otterly-adorbs.html', x: 0 },
        { sel: '.cabfront.cabfront--pebble', name: 'Penguin Pebbling', page: 'penguin-pebbling.html', x: 2.8 }
      ];
      var CZ = back + 2.6;
      var stops = [{ name: 'just inside the door, on the grape carpet', x: 0, z: 0.4, yaw: 0 }];
      CABS.forEach(function (c, i) {
        var g = at(c.x, 0, CZ);
        box(1.2, 0.95, 0.8, M(g, at(0, 0.475, 0)), '--cab');
        box(1.2, 0.12, 0.42, M(g, at(0, 1.0, 0.32, 0, -0.28)), '--cab');
        box(1.2, 1.42, 0.6, M(g, at(0, 1.76, -0.1)), '--cab');
        box(1.26, 0.34, 0.74, M(g, at(0, 2.64, -0.06)), '--cab');
        [-1, 1].forEach(function (s) {
          box(0.04, 2.47, 0.04, M(g, at(s * 0.61, 1.235, 0.21)), '--coin', false);
          box(0.04, 0.95, 0.04, M(g, at(s * 0.61, 0.475, 0.41)), '--coin', false);
        });
        box(1.24, 0.04, 0.04, M(g, at(0, 2.47, 0.21)), '--coin', false);
        bulbs(M(g, at(0, 2.64, 0.31)), 1.1, 9);
        // The stick and the buttons.
        kit.cyl(0.015, 0.015, 0.14, M(g, at(-0.3, 1.13, 0.36)), '--tube-2', false, 6);
        kit.flat(new T.SphereGeometry(0.04, 10, 8), M(g, at(-0.3, 1.21, 0.36)), '--zap');
        ['--coin', '--mint', '--zap'].forEach(function (ink, b) {
          kit.cyl(0.035, 0.035, 0.03, M(g, at(0.05 + b * 0.16, 1.08, 0.34 - b * 0.01, 0, -0.28)), ink, false, 12);
        });
        var light = new T.PointLight(kit.col('--tube'), 2.2, 4.5, 1.6);
        light.position.set(c.x, 1.7, CZ + 1.0);
        kit.scene.add(light);
        var card = kit.lift(frame, c.sel, { w: 360, ww: 1.08, m: M(g, at(0, 1.13, 0.205)) });
        stops.push({ name: c.name, where: 'at the ' + c.name + ' cabinet, its attract screen standing still', page: c.page,
                     x: c.x, z: CZ + 2.3, yaw: 0, pitch: 0.12, frame: card.el });
      });

      // A BENCH along the left-hand wall, for whoever is waiting or watching.
      box(0.5, 0.45, 3.4, at(-W / 2 + 0.4, 0.225, -4.2), '--cab');
      box(0.5, 0.06, 3.5, at(-W / 2 + 0.4, 0.48, -4.2), '--coin', false);
      stops.push({ name: 'on the bench along the left-hand wall, looking at the cabinets', x: -W / 2 + 1.0, z: -3.4, yaw: -0.67 });
      stops.push({ name: 'at the right-hand wall, with the Arcade’s own page on it', x: W / 2 - 2.6, z: -3.2, yaw: RIGHT, page: kit.page, frame: frame });

      return {
        start: { x: 0, z: 0.4, yaw: 0 },
        bounds: { x: [-W / 2 + 0.8, W / 2 - 0.8], z: [CZ + 1.1, 0.6] },
        stops: stops
      };
    }
  };
})();

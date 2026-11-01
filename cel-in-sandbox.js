/* =============================================================================
   The Sandbox, walked into on Cel Street. Ryan's ask, 2026-10-31: the street's
   rooms opened one by one, down the street in order.

   IT IS SOMEBODY'S OWN ROOM (§112), brought in by tools/import-room.py, and
   this scene is OURS: a drawing of The Sandbox for Cel Street, in the colours
   the room declares (its --sb- colours, by name) and nothing else, changing
   nothing on its page, and its maker's to keep or send back. Its light is the
   room's own words: a laptop left open in the sand at dusk, its screen the only
   light in the playground. So the sandpit is dusk all round, a playground's
   frames stand dark behind it, and the one light is the laptop's screen.

   THE SCREEN, THE CASTLE AND THE STEPS ARE THE PAGE'S OWN, lifted off it. The
   laptop's screen is the page's, on the lid of a laptop drawn in the sand; the
   castle and its buttons stand in the sand, and the room's own sandbox.js,
   which talks to nothing, plays them here as it does there. The suggestion box
   talks to the CB, so it stays on the room's own page, on a sign by the pit,
   with everything else the room says. How to build the street with us is
   lifted onto a board as it is.

   NOTHING MOVES by itself. It keeps nothing, sends nothing and fetches nothing;
   the page arrives through Cel Street's screen(). tools/make-cel-street.py
   holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['sandbox.html'] = {
    name: 'The Sandbox',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var face = function (x, z, tx, tz) { return Math.atan2(-(tx - x), -(tz - z)); };

      // DUSK, and the screen the only light.
      kit.scene.background = kit.col('--sb-dusk');
      kit.scene.add(new T.HemisphereLight(kit.col('--sb-muted'), kit.col('--sb-dusk'), 0.75));

      // THE PLAYGROUND'S GROUND, and the sandpit in it with a timber edge.
      box(40, 0.1, 40, at(0, -0.06, -10), '--sb-sanddeep', false, false);
      var PW = 13, PD = 13, PZ = -8.5;
      box(PW, 0.08, PD, at(0, 0.0, PZ), '--sb-sand', false, false);
      [[0, PZ - PD / 2, 0, PW + 0.4], [0, PZ + PD / 2, 0, PW + 0.4], [-PW / 2, PZ, Math.PI / 2, PD], [PW / 2, PZ, Math.PI / 2, PD]].forEach(function (e) {
        box(e[3], 0.22, 0.2, at(e[0], 0.11, e[1], e[2]), '--sb-sanddeep');
      });
      // A few heaps in the sand, nobody's.
      [[2.6, -4.6, 0.5], [-1.4, -11.6, 0.65], [4.4, -11.2, 0.4]].forEach(function (h) {
        kit.piece(new T.SphereGeometry(h[2], 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), at(h[0], 0.03, h[1]), '--sb-sand', 0.015);
      });

      // THE LAPTOP, left open in the sand: the base half sunk, the lid leaning
      // back, and the page's own screen on the lid.
      var LZ = -9.4, TILT = -0.3, LW = 1.8;
      var hinge = at(0, 0.06, LZ, 0, TILT);
      box(LW, 0.08, 1.2, at(0, 0.03, LZ + 0.6), '--sb-metal');
      box(LW - 0.2, 0.01, 0.62, at(0, 0.075, LZ + 0.42), '--sb-ink', false);
      box(0.5, 0.01, 0.28, at(0, 0.075, LZ + 0.96), '--sb-muted', false);
      box(LW, 1.06, 0.07, M(hinge, at(0, 0.53, -0.04)), '--sb-ink');
      var glow = new T.PointLight(kit.col('--sb-glow'), 14, 15, 1.4);
      glow.position.set(0, 0.85, LZ + 0.9);
      kit.scene.add(glow);
      // The screen's light lying on the sand in front of it.
      kit.flat(new T.CircleGeometry(1.6, 32), at(0, 0.045, LZ + 1.6, 0, -Math.PI / 2), '--sb-sandlit');

      // THE PAGE, on a playground sign by the pit; the castle and its buttons in
      // the sand, and how to build the street with us on a board.
      var pgX = 4.9, pgZ = -6.4, pgY = -0.5;
      var pw = 2.3, ph = pw * 800 / 1180, py = 0.95 + ph / 2;
      var pgm = at(pgX, 0, pgZ, pgY);
      [-1, 1].forEach(function (s) { box(0.1, py + ph / 2 + 0.1, 0.1, M(pgm, at(s * (pw / 2 + 0.12), (py + ph / 2 + 0.1) / 2, -0.06)), '--sb-metal'); });
      box(pw + 0.2, ph + 0.2, 0.06, M(pgm, at(0, py, -0.04)), '--sb-ink');
      var frame = kit.screen(1180, 800, pw, M(pgm, at(0, py, 0.0)), 'The Sandbox’s own page, on the sign by the sandpit, where the suggestion box is');

      var lid = kit.lift(frame, '.sb-screen', { w: 640, ww: LW - 0.22, m: M(hinge, at(0, 0.09, 0.0)) });
      var cX = -4.0, cZ = -6.9, cY = 0.4, cm = at(cX, 0, cZ, cY);
      var castle = kit.lift(frame, '.sb-castle', { bare: true, w: 640, ww: 2.6, m: M(cm, at(0, 0.04, 0)) });
      // Its buttons on a low board beside it, never in front of it.
      box(1.7, 0.78, 0.06, M(cm, at(2.3, 0.39, -0.04)), '--sb-sanddeep');
      kit.lift(frame, '.sb-controls', { w: 560, ww: 1.5, m: M(cm, at(2.3, 0.14, 0.0)) });
      kit.lift(frame, '.sb-status', { w: 560, ww: 1.5, m: M(cm, at(2.3, 0.84, 0.0)) });
      kit.wire(frame, 'sandbox.js');

      var bX = -7.6, bZ = -10.6, bY = 1.15;
      var bm = at(bX, 0, bZ, bY);
      [-1, 1].forEach(function (s) { box(0.1, 2.9, 0.1, M(bm, at(s * 0.82, 1.45, -0.06)), '--sb-metal'); });
      box(1.75, 2.35, 0.06, M(bm, at(0, 1.6, -0.04)), '--sb-ink');
      kit.lift(frame, '.sbs-dig-h', { w: 700, ww: 1.5, m: M(bm, at(0, 2.45, 0.0)) });
      var steps = kit.lift(frame, '.sbs-steps', { w: 700, h: 760, ww: 1.5, m: M(bm, at(0, 0.5, 0.0)) });

      // THE PLAYGROUND past the pit, dark against the dusk: a swing frame and a
      // slide, nobody on either, nothing swinging.
      var sw = at(4.2, 0, -16.5);
      [-1, 1].forEach(function (s) {
        [-1, 1].forEach(function (f) {
          box(0.08, 2.6, 0.08, M(sw, at(s * 1.6, 1.25, f * 0.55, 0, f * 0.2)), '--sb-metal', false);
        });
      });
      box(3.4, 0.09, 0.09, M(sw, at(0, 2.48, 0)), '--sb-metal', false);
      [-0.7, 0.7].forEach(function (x) {
        [-0.22, 0.22].forEach(function (d) { box(0.02, 1.9, 0.02, M(sw, at(x + d, 1.5, 0)), '--sb-muted', false); });
        box(0.6, 0.05, 0.22, M(sw, at(x, 0.55, 0)), '--sb-ink');
      });
      var sl = at(-4.4, 0, -17, 0.5);
      [-0.3, 0.3].forEach(function (x) { box(0.07, 2.2, 0.07, M(sl, at(x, 1.1, -1.4)), '--sb-metal', false); });
      for (var r = 0; r < 6; r++) box(0.6, 0.05, 0.05, M(sl, at(0, 0.3 + r * 0.33, -1.4)), '--sb-metal', false);
      box(0.66, 0.08, 1.0, M(sl, at(0, 2.05, -1.0)), '--sb-metal');
      box(0.6, 0.06, 3.2, M(sl, at(0, 1.15, 0.9, 0, 0.62)), '--sb-muted');

      var stops = [
        { name: 'at the edge of the sandpit, the laptop’s screen the only light in the playground', x: 0, z: -1.2, yaw: 0 },
        { name: 'at the laptop, its screen in front of you', x: 0, z: -6.4, yaw: 0, pitch: -0.22, frame: lid.el },
        { name: 'at the castle in the sand, with what to play beside it', x: -2.2, z: -4.6, yaw: face(-2.2, -4.6, cX + 1.1, cZ - 0.4), pitch: -0.3, frame: castle.el },
        { name: 'at the sign by the sandpit, with the room’s own page and the suggestion box on it', x: pgX - 1.4, z: pgZ + 2.9, yaw: face(pgX - 1.4, pgZ + 2.9, pgX, pgZ), page: kit.page, frame: frame },
        { name: 'at the board on building the street with us', x: bX + 2.7, z: bZ + 1.2, yaw: face(bX + 2.7, bZ + 1.2, bX, bZ), frame: steps.el },
        { name: 'by the swings, looking back at the glow', x: 2.6, z: -14.6, yaw: face(2.6, -14.6, 0, LZ) }
      ];

      return {
        start: { x: 0, z: -1.2, yaw: 0 },
        bounds: { x: [-8.2, 8.2], z: [-15.4, -0.6] },
        stops: stops
      };
    }
  };
})();

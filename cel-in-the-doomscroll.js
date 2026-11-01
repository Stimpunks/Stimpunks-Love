/* =============================================================================
   The Doomscroll, walked into on Cel Street, through a door in the Mopery's
   reading room. Ryan's ask, 2026-11-01: the rooms behind the doors.

   IT IS THE SCROLL'S WORLD AND SHARES NOTHING WITH THE LIBRARY IT IS OFF (§24):
   you come up out of the dark and somebody hands you a paper. A small dark room
   and a dark reading desk you can see the edges of, its top sloped like a
   clerk's, and on it one unbroken roll of foxed newsprint, warm and grey, never
   white: still rolled at the head of the slope, unrolled down it towards you,
   and curled over the front edge at its foot. Nothing is cut, nothing lies at an
   angle on it, and the paper is the brightest thing in the room. The light is
   plain and from above, and no flame: candles are the library's.

   THE ROLL ON THE DESK IS THE PAGE'S OWN, lifted off it, masthead and all: the
   blackletter sets the masthead and nothing else, as on the page, and every
   headline, provenance line and poem is the page's words, never retyped. It
   scrolls where it lies, because a doomscroll is a scroll. "Read the whole
   thing" opens the poem whole, as the page's own doomscroll.js opens it there:
   its reading window is lifted with it and opens over everything until it is
   put down. THE ZINE TABLE IS THE COLLISION: that is a photocopy cut up and
   scattered; this is one roll, uncut, on a desk.

   NOTHING MOVES. Every colour is one §24 declares, by name. It keeps nothing,
   sends nothing and fetches nothing; its page arrives through Cel Street's
   screen().
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j) {
    var n = Math.imul(i + 13, 374761393) ^ Math.imul(j + 29, 668265263);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['the-doomscroll.html'] = {
    name: 'The Doomscroll',
    from: 'the-mopery.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var W = 7, D = 6, H = 3.0;

      // A PLAIN LIGHT FROM ABOVE, the room dark round the desk, the paper the
      // brightest thing in it.
      kit.scene.background = kit.col('--dsc-ink');
      kit.scene.add(new T.HemisphereLight(kit.col('--dsc-paper-2'), kit.col('--dsc-ink'), 0.7));
      var over = new T.DirectionalLight(kit.col('--dsc-bone'), 1.6);
      over.position.set(0.6, 6, -0.4); over.target.position.set(0, 1, -2.4);
      over.castShadow = true;
      kit.scene.add(over, over.target);

      // THE ROOM: small and dark, its edges just there.
      box(W, 0.1, D, at(0, -0.05, -D / 2), '--dsc-desk', false, false);
      box(0.2, H, D, at(-W / 2 - 0.1, H / 2, -D / 2), '--dsc-desk');
      box(0.2, H, D, at(W / 2 + 0.1, H / 2, -D / 2), '--dsc-desk');
      box(W + 0.4, H, 0.2, at(0, H / 2, -D - 0.1), '--dsc-desk');
      // The front wall, and the door you came up through from the library.
      var DW = 1.2, DH = 2.3;
      [-1, 1].forEach(function (s) { box((W - DW) / 2, H, 0.2, at(s * (W + DW) / 4, H / 2, 0.1), '--dsc-desk'); });
      box(DW, H - DH, 0.2, at(0, DH + (H - DH) / 2, 0.1), '--dsc-desk');
      kit.flat(new T.PlaneGeometry(DW, DH), at(0, DH / 2, 0.18, Math.PI), '--dsc-ink');
      [-1, 1].forEach(function (s) { box(0.08, DH + 0.04, 0.24, at(s * (DW / 2 + 0.04), (DH + 0.04) / 2, 0.08), '--dsc-rule', 0.01); });

      // THE DESK: dark wood, its edges lipped so you can see them, the top a
      // slope like a clerk's, rising away from you.
      var DX = 0, DZ = -2.4, DWD = 1.7, SLOPE = 0.3, LEN = 1.5, FRONT = 0.82;
      var rise = LEN * Math.sin(SLOPE), run = LEN * Math.cos(SLOPE);
      var z0 = DZ + run / 2, z1 = DZ - run / 2, top = FRONT + rise;
      var slope = at(DX, FRONT + rise / 2, DZ, 0, -(Math.PI / 2 - SLOPE));
      box(DWD, LEN, 0.06, slope, '--dsc-desk', 0.012);
      // Its carcass under the slope, and the lip along its foot.
      box(DWD, FRONT - 0.03, run, at(DX, (FRONT - 0.03) / 2, DZ), '--dsc-desk', 0.012);
      box(DWD, (top - FRONT), 0.06, at(DX, FRONT + (top - FRONT) / 2, z1), '--dsc-desk', 0.012);
      box(DWD + 0.04, 0.05, 0.08, at(DX, FRONT + 0.02, z0 + 0.03), '--dsc-rule', 0.008);
      [-1, 1].forEach(function (s) {
        box(0.04, 0.05, LEN, M(slope, at(s * (DWD / 2 + 0.01), 0, 0.03, 0, Math.PI / 2)), '--dsc-rule', false);
      });

      // THE ROLL: one unbroken length of foxed newsprint up the slope, still
      // rolled at the head of it and curled over the front edge at its foot.
      var PW = 1.16;
      var lie = M(slope, at(0, 0, 0.04));
      box(PW, LEN - 0.04, 0.004, lie, '--dsc-paper', false, false);
      kit.cyl(0.07, 0.07, PW, at(DX, top + 0.06, z1 + 0.04, 0, 0, Math.PI / 2), '--dsc-paper-2', 0.008, 20);
      kit.cyl(0.045, 0.045, PW, at(DX, FRONT - 0.02, z0 + 0.05, 0, 0, Math.PI / 2), '--dsc-paper-2', 0.008, 20);
      // The foxing, brown spots in its margins, where the lifted sheet is not.
      for (var k = 0; k < 26; k++) {
        var side = k % 2 ? 1 : -1, fy = -LEN / 2 + 0.08 + hash(k, 1) * (LEN - 0.16);
        var fx = side * (PW / 2 - 0.02 - hash(k, 2) * 0.045), fr = 0.004 + hash(k, 3) * 0.008;
        kit.flat(new T.CircleGeometry(fr, 8), M(slope, at(fx, fy, 0.046)), '--dsc-rule');
      }

      // THE ROOM'S OWN PAGE, on the left-hand wall in a rule of its own.
      var pw = 2.2, ph = pw * 800 / 1180, py = 0.7 + ph / 2, pz = -2.8;
      box(0.04, ph + 0.08, pw + 0.08, at(-W / 2 + 0.02, py, pz), '--dsc-rule', false);
      var frame = kit.screen(1180, 800, pw, at(-W / 2 + 0.05, py, pz, LEFT), 'The Doomscroll’s own page, on the wall');

      // THE PAGE'S OWN ROLL, lifted off it and lying on the slope, masthead at
      // the head; it scrolls where it lies.
      var roll = kit.lift(frame, '.dsc-roll', { w: 1000, h: 1250, ww: PW - 0.12, m: M(slope, at(0, -LEN / 2 + 0.06, 0.05)) });
      // Its reading window, lifted with it, shut until a poem is asked for; the
      // page's own doomscroll.js opens it whole over everything.
      kit.lift(frame, '.dsc-full', { w: 680, ww: 0.5, bare: true, m: at(DX, 0.05, DZ + 0.3) });
      kit.wire(frame, 'doomscroll.js');


      return {
        start: { x: 0, z: -0.4, yaw: 0 },
        bounds: { x: [-W / 2 + 0.6, W / 2 - 0.6], z: [-D + 0.6, -0.3] },
        stops: [
          { name: 'just through the door from the library, the paper on the desk the brightest thing in the dark', x: 0, z: -0.4, yaw: 0, pitch: -0.1 },
          { name: 'at the desk, the roll lying up its slope in front of you, the masthead at the head of it', x: DX, z: z0 + 0.7, yaw: 0, pitch: -0.62, frame: roll.el },
          { name: 'beside the desk, the roll still rolled at the head of the slope and curled over its foot', x: DX + 1.6, z: DZ + 0.6, yaw: 0.8, pitch: -0.35 },
          { name: 'at the left-hand wall, with the room’s own page on it', x: -W / 2 + 2.3, z: pz, yaw: LEFT, page: kit.page, frame: frame }
        ]
      };
    }
  };
})();

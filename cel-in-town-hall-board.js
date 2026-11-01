/* =============================================================================
   The Board room, walked into on Cel Street, through its door off the Town
   Hall's rotunda. Ryan's ask, 2026-11-01: the rooms behind the doors.

   IT IS THE BOARD ROOM'S WORLD AND SHARES NOTHING WITH THE HALL IT OPENS OFF
   (§80). The hall is a rotunda at noon, lit by one disc of sun through the
   dome; this is a long dark room with no light overhead and none at the head
   of the table: ONE LONG TABLE WITH THE SAME LAMP AT EVERY SEAT. Every lamp is
   drawn by one function, lamp(), in one colour, the same shade on the same
   stem throwing the same pool on the table, down both sides, and the room is
   dark round them. Nobody's lamp is bigger, and nobody sits at the table: the
   chairs stand empty, and the head of the table has no chair and no lamp.

   THE COLLECTION COLLECTION'S RULE INVERTED ON PURPOSE: there no two lamps may
   be alike; here none may differ. Do not let one lamp grow a colour, a size or
   a place of its own.

   WHAT IS ON THE WALLS IS THE PAGE'S OWN, lifted off it by the kit: the board,
   as our Board & Governance page lists them, on the left wall; the Governance
   & Ethics section, word for word, on the right; the outline of the meeting's
   agenda propped on the table, as the page puts it on the table. Nothing is
   retyped. The room's radio and call are the base's and stay on its page,
   which hangs by the door.

   NOTHING MOVES AT ANY SETTING. Every colour is one §80 declares, by name. It
   keeps nothing, sends nothing and fetches nothing; its page arrives through
   Cel Street's screen().
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['town-hall-board.html'] = {
    name: 'The Board room',
    from: 'town-hall.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var W = 8, NEAR = 0.8, FAR = -14.5, H = 3.2;        // the room
      var TW = 2.0, TH = 0.76, TZ0 = -2.2, TZ1 = -11.8;    // the table
      var SEATS = 5;                                       // a side, as the page draws it
      var RIGHT = -Math.PI / 2, LEFT = Math.PI / 2;

      // THE DARK: no light overhead. Only enough of the dark's own colour that
      // the walls and the chairs can be told from it.
      kit.scene.background = kit.col('--bd-room');
      kit.scene.add(new T.HemisphereLight(kit.col('--bd-edge'), kit.col('--bd-room'), 0.9));

      // THE ROOM: floor, walls and a ceiling, all the room's own dark.
      box(W, 0.1, NEAR - FAR, at(0, -0.05, (NEAR + FAR) / 2), '--bd-room', false, false);
      box(W, 0.1, NEAR - FAR, at(0, H + 0.05, (NEAR + FAR) / 2), '--bd-room', false, false);
      [-1, 1].forEach(function (s) { box(0.2, H, NEAR - FAR, at(s * (W / 2 + 0.1), H / 2, (NEAR + FAR) / 2), '--bd-room', 0.01); });
      box(W, H, 0.2, at(0, H / 2, FAR - 0.1), '--bd-room', 0.01);
      // The far wall's one dim panel, as the page draws it at the end of the
      // table: the room's edge, not a light.
      box(3.2, 1.1, 0.04, at(0, 1.9, FAR + 0.02), '--bd-edge', false, false);
      // The wall behind you, with the door from the Town Hall in it.
      var DW = 1.3, DH = 2.4;
      [-1, 1].forEach(function (s) { box((W - DW) / 2, H, 0.2, at(s * (DW / 2 + (W - DW) / 4), H / 2, NEAR + 0.1), '--bd-room', 0.01); });
      box(DW, H - DH, 0.2, at(0, DH + (H - DH) / 2, NEAR + 0.1), '--bd-room', 0.01);
      kit.flat(new T.PlaneGeometry(DW, DH), at(0, DH / 2, NEAR + 0.2, Math.PI), '--bd-edge');
      [-1, 1].forEach(function (e) { box(0.08, DH + 0.04, 0.24, at(e * (DW / 2 + 0.04), (DH + 0.04) / 2, NEAR + 0.1), '--bd-brass', 0.01); });

      // THE TABLE: one long table, the same width all the way down, and
      // nothing at its head.
      var TL = TZ0 - TZ1, TC = (TZ0 + TZ1) / 2;
      box(TW, 0.07, TL, at(0, TH - 0.035, TC), '--bd-table', 0.012);
      [[-1, TZ0 - 0.25], [1, TZ0 - 0.25], [-1, TZ1 + 0.25], [1, TZ1 + 0.25]].forEach(function (l) {
        box(0.1, TH - 0.07, 0.1, at(l[0] * (TW / 2 - 0.2), (TH - 0.07) / 2, l[1]), '--bd-edge', false);
      });
      box(0.06, 0.12, TL - 0.4, at(-(TW / 2 - 0.03), TH - 0.13, TC), '--bd-edge', false);
      box(0.06, 0.12, TL - 0.4, at(TW / 2 - 0.03, TH - 0.13, TC), '--bd-edge', false);

      // THE SAME LAMP AT EVERY SEAT. One function draws every one of them, in
      // one colour, at one size, with one light of one strength: a brass foot
      // and stem, a pale shade, its glow under it, and the pool it throws on
      // the table in front of the seat.
      function lamp(x, z) {
        cyl(0.07, 0.08, 0.025, at(x, TH + 0.012, z), '--bd-brass', false, 16);
        cyl(0.008, 0.008, 0.3, at(x, TH + 0.16, z), '--bd-brass', false, 6);
        cyl(0.06, 0.12, 0.11, at(x, TH + 0.35, z), '--bd-shade', 0.006, 20);
        kit.flat(new T.CircleGeometry(0.115, 20), at(x, TH + 0.293, z, 0, Math.PI / 2), '--bd-pool');
        kit.flat(new T.CircleGeometry(0.3, 28), at(x, TH + 0.003, z, 0, -Math.PI / 2), '--bd-pool');
        var glow = new T.PointLight(kit.col('--bd-pool'), 1.4, 2.2, 2);
        glow.position.set(x, TH + 0.28, z);
        kit.scene.add(glow);
      }
      // AND THE SAME CHAIR AT EVERY SEAT, empty, facing the table.
      function chair(x, z, face) {
        var g = at(x, 0, z, face);
        box(0.5, 0.06, 0.48, M(g, at(0, 0.46, 0)), '--bd-edge', 0.01);
        box(0.5, 0.6, 0.06, M(g, at(0, 0.76, 0.24)), '--bd-edge', 0.01);
        [[-0.21, -0.2], [0.21, -0.2], [-0.21, 0.2], [0.21, 0.2]].forEach(function (l) {
          box(0.04, 0.44, 0.04, M(g, at(l[0], 0.22, l[1])), '--bd-edge', false);
        });
      }
      var seatZ = [];
      for (var i = 0; i < SEATS; i++) seatZ.push(TZ0 - 1.0 - i * (TL - 2.0) / (SEATS - 1));
      seatZ.forEach(function (z) {
        lamp(-(TW / 2 - 0.42), z); lamp(TW / 2 - 0.42, z);
        chair(-(TW / 2 + 0.45), z, RIGHT); chair(TW / 2 + 0.45, z, LEFT);
      });

      // THE ROOM'S OWN PAGE, on the wall by the door, its radio and call on it.
      var pw = 2.3, ph = pw * 800 / 1180;
      var frame = kit.screen(1180, 800, pw, at(-2.45, 0.55 + ph / 2, NEAR - 0.02, Math.PI), 'The Board room’s own page, on the wall by the door');

      // THE PAGE'S OWN WORDS, lifted off it: the board on the left wall, the
      // Governance & Ethics section on the right, and the agenda's outline
      // propped on the table between the seats.
      var who = kit.lift(frame, '.bd-part', { n: 0, w: 760, h: 640, ww: 2.2, m: at(-(W / 2 - 0.04), 0.75, -4.6, LEFT) });
      var gov = kit.lift(frame, '.bd-part', { n: 2, w: 760, h: 640, ww: 2.2, m: at(W / 2 - 0.04, 0.65, -6.8, RIGHT) });
      var plan = kit.lift(frame, '.bd-part', { n: 1, w: 760, h: 700, ww: 1.05, m: at(0, TH + 0.02, (seatZ[1] + seatZ[2]) / 2, Math.PI, -0.5) });

      var mid = seatZ[2];
      var stops = [
        { name: 'just inside the door, the one long table running away from you with the same lamp at every seat', x: 0, z: 0.0, yaw: 0, pitch: -0.05 },
        { name: 'at the board, on the left-hand wall, as our Board & Governance page lists them', x: -2.0, z: -4.6, yaw: LEFT, pitch: 0.08, frame: who.el },
        { name: 'at Governance & Ethics, on the right-hand wall, word for word', x: 1.9, z: -6.8, yaw: RIGHT, pitch: 0.08, frame: gov.el },
        { name: 'at the outline of the meeting’s agenda, propped on the table between the seats', x: 0, z: (seatZ[2] + seatZ[3]) / 2, yaw: Math.PI, pitch: -0.1, frame: plan.el },
        { name: 'at an empty chair halfway down, the lamp in front of it the same as every other', x: TW / 2 + 1.1, z: mid, yaw: LEFT, pitch: -0.25 },
        { name: 'at the far end of the table, no chair and no lamp at its head, looking back down every lamp', x: 0, z: TZ1 - 1.4, yaw: Math.PI, pitch: -0.08 },
        { name: 'back at the door, with the room’s own page on the wall beside it, its radio and call on it', x: -2.45, z: -2.0, yaw: Math.PI, pitch: 0.05, page: kit.page, frame: frame }
      ];

      return {
        start: { x: 0, z: 0.0, yaw: 0 },
        bounds: { x: [-(W / 2 - 0.5), W / 2 - 0.5], z: [FAR + 0.6, NEAR - 0.5] },
        stops: stops
      };
    }
  };
})();

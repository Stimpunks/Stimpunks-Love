/* =============================================================================
   The Community Center, walked into on Cel Street. Ryan's ask, 2026-10-31:
   back on the street, working down it a room at a time.

   IT IS THE COMMUNITY CENTER'S WORLD AND NOBODY ELSE'S (§51): a window seat in
   north light. Cool sage lime plaster on every wall, and one big window in the
   back wall facing north onto a living hillside, with a deep seat built into
   the bay under it, a cushion of the room's wool on it and the plant on the
   sill. NORTH LIGHT: the day comes in soft and even from the window and lands
   nowhere in a patch or a bar, so nothing in here casts a hard shadow and no
   warm plaster appears anywhere (a patch of sun on warm plaster is Covenstead,
   and if one ever lands here it is this room that moves). The pale ash of the
   window's frame, the seat, the front desk and the pigeonholes is carried
   against the plaster by its darker grain.

   WHAT IS ON THE WALLS IS THE PAGE'S OWN, lifted off it by the kit, each on
   the flat plaster it was written for, with nothing laid over the words:
   Getting started and how the radio works on the left-hand wall, the house
   norms, the community service board's sorter and the covenant on the right,
   and whose this is on the front desk. The front desk's forms and the map of
   where we are stay on the page, which hangs on the left-hand wall by the
   window: they need the radio, which is the page's to load.

   NOTHING MOVES: the hillside does not sway and the plant stands still. Every
   colour is one the room declares, by name. It keeps nothing, sends nothing
   and fetches nothing; its page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['community-center.html'] = {
    name: 'The Community Center',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var W = 8, D = 9, H = 3.0, back = -D;
      var L = -W / 2, R = W / 2;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var WIN = { x0: -2.5, x1: 2.5, y0: 0.95, y1: 2.65 };

      // NORTH LIGHT: the sky in at the window from in front of you, even, with
      // no sun in it and nothing casting a hard shadow.
      kit.scene.background = kit.col('--ctr-sky');
      kit.scene.add(new T.HemisphereLight(kit.col('--ctr-sky'), kit.col('--ctr-plaster'), 2.4));
      var day = new T.DirectionalLight(kit.col('--ctr-sky'), 0.9);
      day.position.set(0, 6, back - 12);
      day.target.position.set(0, 0, -3);
      kit.scene.add(day, day.target);

      // THE ROOM: plaster walls, a plaster ceiling, pale ash boards.
      box(W + 0.4, 0.1, D + 0.4, at(0, -0.05, back / 2), '--ctr-ash', false, false);
      for (var b = 0; b < 16; b++) box(0.01, 0.004, D, at(L + 0.25 + b * 0.5, 0.002, back / 2), '--ctr-hollow', false, false);
      box(W + 0.4, 0.14, D + 0.4, at(0, H + 0.07, back / 2), '--ctr-plate', false, false);
      box(0.3, H, D, at(L - 0.15, H / 2, back / 2), '--ctr-plaster', 0.015);
      box(0.3, H, D, at(R + 0.15, H / 2, back / 2), '--ctr-plaster', 0.015);
      // The front wall, with the door you came in by, shut behind you.
      box(W + 0.6, H, 0.3, at(0, H / 2, 0.15), '--ctr-plaster', 0.015);
      box(0.96, 2.06, 0.06, at(2.6, 1.03, -0.02), '--ctr-ash', 0.015);
      cyl(0.035, 0.035, 0.06, at(2.28, 1.0, -0.07, 0, Math.PI / 2), '--ctr-grain', false, 10);
      // The plaster's rounded edge along the top of the walls, where the
      // window's light catches it.
      [[0, back + 0.02, W, 0], [L + 0.02, back / 2, D, LEFT], [R - 0.02, back / 2, D, LEFT]].forEach(function (e) {
        kit.piece(new T.CylinderGeometry(0.06, 0.06, e[2], 10), at(e[0], H - 0.06, e[1], e[3], 0, Math.PI / 2), '--ctr-plate', false);
      });

      // THE BACK WALL, with the one big window in it.
      var ww = new T.Shape();
      ww.moveTo(-W / 2, 0); ww.lineTo(W / 2, 0); ww.lineTo(W / 2, H); ww.lineTo(-W / 2, H); ww.closePath();
      var hole = new T.Path();
      hole.moveTo(WIN.x0, WIN.y0); hole.lineTo(WIN.x1, WIN.y0); hole.lineTo(WIN.x1, WIN.y1); hole.lineTo(WIN.x0, WIN.y1); hole.closePath();
      ww.holes.push(hole);
      var wg = new T.ExtrudeGeometry(ww, { depth: 0.5, bevelEnabled: false });
      wg.translate(0, 0, -0.5);
      kit.piece(wg, at(0, 0, back), '--ctr-plaster', 0.02);
      // Its ash frame and glazing bars.
      var wx = (WIN.x0 + WIN.x1) / 2, wl = WIN.x1 - WIN.x0, wy = (WIN.y0 + WIN.y1) / 2, wh = WIN.y1 - WIN.y0;
      box(wl + 0.16, 0.08, 0.1, at(wx, WIN.y1 + 0.04, back - 0.3), '--ctr-ash', 0.012);
      [WIN.x0 - 0.04, WIN.x1 + 0.04].forEach(function (x) { box(0.08, wh, 0.1, at(x, wy, back - 0.3), '--ctr-ash', 0.012); });
      [-1, 0, 1].forEach(function (k) { box(0.05, wh, 0.05, at(wx + k * wl / 4, wy, back - 0.36), '--ctr-ash', 0.008); });
      box(wl, 0.05, 0.05, at(wx, wy + 0.2, back - 0.36), '--ctr-ash', 0.008);

      // THE HILLSIDE through it, under the north sky: ridges behind ridges and
      // trees on them, still.
      kit.flat(new T.PlaneGeometry(200, 80), at(0, 30, back - 60), '--ctr-sky');
      [[-14, 22, 9, '--ctr-ridge', -48], [10, 26, 11, '--ctr-ridge', -50], [-6, 18, 7, '--ctr-hill', -38], [14, 16, 6, '--ctr-hill', -36], [0, 12, 4, '--ctr-hill-2', -28]].forEach(function (h) {
        kit.flat(new T.CircleGeometry(h[1], 40, 0, Math.PI), at(h[0], -h[1] + h[2], back + h[4]), h[3]);
      });
      kit.flat(new T.PlaneGeometry(200, 6), at(0, -2.6, back - 26), '--ctr-hill-2');
      for (var t = 0; t < 14; t++) {
        var tx = -16 + t * 2.4 + (t % 3) * 0.7, tz = back - 30 + (t % 4) * 1.5, th = 1.6 + (t % 5) * 0.4;
        kit.piece(new T.ConeGeometry(0.5 + (t % 3) * 0.15, th, 7), at(tx, 2.8 + (t % 4) * 0.5 + th / 2, tz), '--ctr-tree', false);
      }

      // THE DEEP SEAT built into the bay under the window, with its cushion of
      // the room's wool, and the plant on the sill.
      box(wl + 0.6, 0.48, 0.85, at(wx, 0.24, back + 0.42), '--ctr-ash', 0.015);
      box(wl + 0.6, 0.06, 0.06, at(wx, 0.48, back + 0.84), '--ctr-grain', false);
      box(wl + 0.2, 0.14, 0.7, at(wx, 0.55, back + 0.42), '--ctr-wool', 0.012);
      [-1.6, 0, 1.6].forEach(function (x) { box(0.7, 0.4, 0.14, at(wx + x, 0.82, back + 0.12, 0, -0.18), '--ctr-wool', 0.012); });
      box(wl + 0.1, 0.06, 0.32, at(wx, WIN.y0 - 0.03, back - 0.18), '--ctr-ash', 0.012);
      var px = WIN.x1 - 0.45, pz = back - 0.18;
      cyl(0.11, 0.08, 0.2, at(px, WIN.y0 + 0.1, pz), '--ctr-pot', 0.01, 14);
      [[0, 0.16, 0], [0.08, 0.1, 0.05], [-0.07, 0.12, -0.04], [0.03, 0.22, -0.06], [-0.05, 0.2, 0.06]].forEach(function (l) {
        kit.piece(new T.SphereGeometry(0.09, 8, 6), at(px + l[0], WIN.y0 + 0.2 + l[1], pz + l[2]), '--ctr-leaf', 0.008);
      });

      // THE ROOM'S OWN PAGE on the left-hand wall by the window.
      var pw = 2.4, ph = pw * 800 / 1180, py = 0.55 + ph / 2;
      box(0.06, ph + 0.16, pw + 0.16, at(L + 0.03, py, -6.9), '--ctr-ash', 0.012);
      var frame = kit.screen(1180, 800, pw, at(L + 0.07, py, -6.9, LEFT), 'The Community Center’s own page, on the left-hand wall by the window');

      // ON THE LEFT-HAND WALL: Getting started, and how the radio works.
      var start = kit.lift(frame, '.ctr-part', { n: 0, w: 760, h: 900, ww: 1.6, m: at(L + 0.05, 0.5, -2.0, LEFT) });
      var radio = kit.lift(frame, '.ctr-part', { n: 2, w: 760, h: 900, ww: 1.6, m: at(L + 0.05, 0.5, -4.3, LEFT) });

      // ON THE RIGHT-HAND WALL: the house norms, the community service board
      // (the sorter of slots, every one a room that takes something in), the
      // pigeonholes beside it, and the covenant.
      var norms = kit.lift(frame, '.ctr-part', { n: 3, w: 760, h: 900, ww: 1.6, m: at(R - 0.05, 0.5, -1.9, RIGHT) });
      var board = kit.lift(frame, '.ctr-part', { n: 5, w: 1000, h: 1000, ww: 2.4, m: at(R - 0.05, 0.4, -4.5, RIGHT) });
      // The pigeonholes: an ash frame of hollows, a form in some of them.
      var ph0 = at(R - 0.2, 0, -6.7, RIGHT);
      box(1.3, 1.2, 0.36, M(ph0, at(0, 1.3, 0)), '--ctr-ash', 0.015);
      for (var r = 0; r < 3; r++) {
        for (var c = 0; c < 4; c++) {
          box(0.26, 0.3, 0.06, M(ph0, at(-0.47 + c * 0.31, 1.0 + r * 0.36, 0.16)), '--ctr-hollow', false);
          if ((r + c) % 2 === 0) box(0.2, 0.22, 0.01, M(ph0, at(-0.47 + c * 0.31, 0.98 + r * 0.36, 0.2)), '--ctr-form', false);
        }
      }
      box(1.3, 0.04, 0.4, M(ph0, at(0, 0.68, 0.02)), '--ctr-grain', false);
      var covenant = kit.lift(frame, '.ctr-part', { n: 4, w: 700, h: 600, ww: 1.1, m: at(R - 0.05, 0.6, -7.95, RIGHT) });

      // THE FRONT DESK of pale ash by the door, with nobody behind it, and
      // whose this is standing on it.
      var dk = at(-1.6, 0, -1.4, 0.35);
      box(1.6, 0.04, 0.7, M(dk, at(0, 0.76, 0)), '--ctr-ash', 0.015);
      box(1.6, 0.74, 0.05, M(dk, at(0, 0.37, -0.32)), '--ctr-ash', 0.012);
      [-1, 1].forEach(function (s) { box(0.05, 0.74, 0.7, M(dk, at(s * 0.78, 0.37, 0)), '--ctr-ash', 0.012); });
      box(1.6, 0.03, 0.05, M(dk, at(0, 0.79, 0.33)), '--ctr-grain', false);
      var whose = kit.lift(frame, '.ctr-part', { n: 7, w: 700, h: 640, ww: 0.95, m: M(dk, at(0, 0.8, -0.2)) });

      return {
        start: { x: 2.4, z: -0.8, yaw: 0.35 },
        bounds: { x: [L + 0.6, R - 0.6], z: [back + 1.35, -0.5] },
        stops: [
          { name: 'just inside the door, the window across the room', x: 2.4, z: -0.8, yaw: 0.35 },
          { name: 'at the window seat, looking out at the hillside in north light', x: 0, z: back + 1.6, yaw: 0, pitch: 0.05 },
          { name: 'at the plant on the sill', x: WIN.x1 - 0.6, z: back + 1.45, yaw: 0, pitch: -0.15 },
          { name: 'at Getting started, on the left-hand wall', x: L + 2.0, z: -2.0, yaw: LEFT, frame: start.el },
          { name: 'at how the radio works, on the left-hand wall', x: L + 2.0, z: -4.3, yaw: LEFT, frame: radio.el },
          { name: 'at the left-hand wall by the window, with the room’s own page on it', x: L + 2.6, z: -6.9, yaw: LEFT, page: kit.page, frame: frame },
          { name: 'at the house norms, on the right-hand wall', x: R - 2.0, z: -1.9, yaw: RIGHT, frame: norms.el },
          { name: 'at the community service board, a slot for every room that takes something in', x: R - 2.6, z: -4.5, yaw: RIGHT, frame: board.el },
          { name: 'at the pigeonholes beside the board', x: R - 1.7, z: -6.7, yaw: RIGHT, pitch: -0.05 },
          { name: 'at the covenant, by the window', x: R - 1.6, z: -7.7, yaw: RIGHT, frame: covenant.el },
          { name: 'at the front desk by the door, with nobody behind it', x: -1.2, z: -0.6, yaw: 0.35, pitch: -0.3, frame: whose.el }
        ]
      };
    }
  };
})();

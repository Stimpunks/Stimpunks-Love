/* =============================================================================
   NeuroHome, walked into on Cel Street. Ryan's ask, 2026-10-31: down the
   street, a room at a time.

   IT IS ISHA SNOW'S ROOM AND THEIR WORLD, and this scene is OURS: a drawing of
   their room for Cel Street, in the colours their room declares (the
   import:neurohome block in love.css's :root) and nothing else, which changes
   nothing on their page and is theirs to keep or send back. A change to how it
   looks is theirs to ask for.

   It is drawn from their own words and nothing more: "Come in. The light is
   coming through the firs and bouncing off the river, and there are candles
   going in every room." So the light comes in level through the front window,
   pale off the river, and candles stand lit on the sill, the desk, the
   bookshelf and by the door, steady. Their front window, their desk with the
   old wooden radio and the instruments, their bookshelf, their creativity
   corner, the map by the door and the garden outside it are their page's own
   drawings and words, lifted off it as they are and never retyped. The floor
   is wood, because their house is built with no carpet; where their page says
   nothing, the room is left plain.

   THEIR PHOTOGRAPHS ARE NOT IN THE SCENE. The collages on their walls are
   photographs under consent records that name the pages they are on, so
   nothing of them is lifted or drawn here: they are seen only on the room's
   own page, which hangs where the art hangs.

   NOTHING MOVES: the candles do not flicker. It keeps nothing, sends nothing
   and fetches nothing; their page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['neurohome.html'] = {
    name: 'NeuroHome',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var W = 6.4, D = 8.4, H = 2.7, back = -D;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;

      // THE LIGHT THROUGH THE FIRS, OFF THE RIVER: level and pale through the
      // front window, the room's walls taking it, and the candles going.
      kit.scene.background = kit.col('--nh-sky');
      kit.scene.add(new T.HemisphereLight(kit.col('--nh-sun'), kit.col('--nh-wood'), 1.7));
      var day = new T.DirectionalLight(kit.col('--nh-glint'), 1.1);
      day.position.set(-1.5, 2.2, back - 6);
      day.target.position.set(0.5, 0.4, -2);
      kit.scene.add(day, day.target);

      // THE ROOM: pale walls, a wood floor with no carpet, a darker skirting.
      box(W, 0.1, D + 0.4, at(0, -0.05, -D / 2), '--nh-wood', false, false);
      box(0.3, H, D, at(-W / 2 - 0.15, H / 2, -D / 2), '--nh-hall');
      box(0.3, H, D, at(W / 2 + 0.15, H / 2, -D / 2), '--nh-hall');
      box(W + 0.6, 0.2, D + 0.6, at(0, H + 0.1, -D / 2), '--nh-paper', false, false);
      [[-W / 2 + 0.02, -D / 2, LEFT, D], [W / 2 - 0.02, -D / 2, RIGHT, D]].forEach(function (s) {
        box(s[3], 0.12, 0.03, at(s[0], 0.06, s[1], s[2]), '--nh-darkwood', false);
      });

      // THE FRONT WINDOW in the far wall, the wall built round its opening.
      var WW = 3.0, WH = 1.86, SILL = 0.72;
      var side = (W - WW) / 2;
      [-1, 1].forEach(function (s) { box(side + 0.3, H, 0.3, at(s * (WW / 2 + side / 2 + 0.15), H / 2, back - 0.15), '--nh-hall'); });
      box(WW, SILL, 0.3, at(0, SILL / 2, back - 0.15), '--nh-hall');
      box(WW, H - SILL - WH, 0.3, at(0, SILL + WH + (H - SILL - WH) / 2, back - 0.15), '--nh-hall');
      // Its frame and sill, in wood.
      box(WW + 0.2, 0.08, 0.3, at(0, SILL - 0.04, back + 0.05), '--nh-wood');
      box(WW + 0.2, 0.08, 0.12, at(0, SILL + WH + 0.04, back - 0.02), '--nh-wood');
      [-1, 1].forEach(function (s) { box(0.08, WH, 0.12, at(s * (WW / 2 + 0.04), SILL + WH / 2, back - 0.02), '--nh-wood'); });

      // THE FRONT WALL behind you, with the door you came in by, shut.
      var DW = 1.0, DH = 2.1, DX = 0;
      var fs = (W - DW) / 2;
      [-1, 1].forEach(function (s) { box(fs + 0.3, H, 0.3, at(s * (DW / 2 + fs / 2 + 0.15), H / 2, 0.15), '--nh-hall'); });
      box(DW, H - DH, 0.3, at(DX, DH + (H - DH) / 2, 0.15), '--nh-hall');
      box(DW - 0.04, DH - 0.02, 0.06, at(DX, DH / 2, 0.03), '--nh-wood');
      cyl(0.03, 0.03, 0.06, at(DX + 0.36, 1.0, -0.02, 0, Math.PI / 2), '--nh-steel', false, 8);

      // CANDLES GOING IN EVERY ROOM: wax, a flame, and their light, steady.
      function candle(x, y, z, tall) {
        cyl(0.035, 0.035, tall, at(x, y + tall / 2, z), '--nh-wax', false, 10);
        kit.flat(new T.ConeGeometry(0.018, 0.06, 8), at(x, y + tall + 0.035, z), '--nh-flame');
      }
      function glow(x, y, z, power) {
        var l = new T.PointLight(kit.col('--nh-flame'), power, 5, 1.6);
        l.position.set(x, y, z);
        kit.scene.add(l);
      }

      /* ── Their page's own drawings and words, lifted off it as they are ── */
      var pw = 2.3, ph = pw * 800 / 1180, py = 0.8 + ph / 2;
      var pz = -5.8;
      var pg = at(W / 2 - 0.02, 0, pz, RIGHT);
      box(pw + 0.16, ph + 0.16, 0.05, M(pg, at(0, py, 0)), '--nh-darkwood', 0.012);
      var frame = kit.screen(1180, 800, pw, M(pg, at(0, py, 0.035)), 'Isha Snow’s NeuroHome, the room’s own page, hanging where their art hangs');

      // The front window: the firs, the river, the bridge, the ferry and the hall.
      var view = kit.lift(frame, '.nh-frame', { n: 0, w: 900, ww: WW, m: at(0, SILL, back + 0.01) });
      // Three candles on the sill.
      [-1.0, -0.82, 1.05].forEach(function (x, i) { candle(x, SILL, back + 0.18, 0.12 + i * 0.04); });
      glow(0, SILL + 0.35, back + 0.4, 2.2);

      // The desk, along the left-hand wall: their radio and the instruments in reach.
      var dz = -2.6;
      box(0.7, 0.05, 1.5, at(-W / 2 + 0.35, 0.74, dz), '--nh-darkwood', 0.012);
      [[-0.65, -0.3], [0.65, -0.3], [-0.65, 0.3], [0.65, 0.3]].forEach(function (p) {
        box(0.05, 0.72, 0.05, at(-W / 2 + 0.35 + p[1], 0.36, dz + p[0]), '--nh-darkwood', false);
      });
      var desk = kit.lift(frame, '.nh-desk', { w: 1000, ww: 1.6, m: at(-W / 2 + 0.02, 0.86, dz, LEFT) });
      candle(-W / 2 + 0.45, 0.765, dz + 0.6, 0.14);
      glow(-W / 2 + 0.8, 1.3, dz + 0.5, 1.3);

      // The bookshelf, further along the same wall: their favourites, on its
      // own dark wood, in a case of the same wood.
      var bz = -5.8;
      box(0.32, 1.78, 1.76, at(-W / 2 + 0.16, 0.89, bz), '--nh-darkwood', 0.012);
      var shelf = kit.lift(frame, '.nh-shelf', { w: 1000, ww: 1.56, m: at(-W / 2 + 0.33, 0.78, bz, LEFT) });
      candle(-W / 2 + 0.2, 1.78, bz - 0.6, 0.12);
      candle(-W / 2 + 0.2, 1.78, bz + 0.6, 0.16);

      // The creativity corner on the right-hand wall: everything made, or
      // still being made.
      var corner = kit.lift(frame, '.nh-corner', { w: 1000, ww: 2.0, m: at(W / 2 - 0.02, 0.55, -2.6, RIGHT) });

      // By the door, on the wall behind you: the map of the village to the
      // left, and to the right a window onto the garden and the bee yard, the
      // porch's good morning under it, and their welcome over the door.
      var map = kit.lift(frame, '.nh-mapwrap', { w: 640, ww: 1.2, m: at(-1.7, 0.95, -0.01, Math.PI) });
      var gx = 1.75, gw = 1.5;
      var garden = kit.lift(frame, '.nh-frame', { n: 1, w: 640, ww: gw, m: at(gx, 1.2, -0.01, Math.PI) });
      box(gw + 0.16, 0.06, 0.16, at(gx, 1.17, -0.06), '--nh-wood');
      var hello = kit.lift(frame, '.nh-exchange', { w: 640, ww: gw, m: at(gx, 0.82, -0.01, Math.PI) });
      var welcome = kit.lift(frame, '.nh-door', { w: 640, ww: 1.2, m: at(DX, DH + 0.04, -0.01, Math.PI) });
      candle(gx - 0.55, 1.2, -0.12, 0.13);
      glow(0.2, 1.6, -0.8, 1.2);

      return {
        start: { x: 0, z: -1.2, yaw: 0 },
        bounds: { x: [-W / 2 + 0.7, W / 2 - 0.7], z: [back + 0.9, -0.6] },
        stops: [
          { name: 'just inside the door, the candles going and the light coming in off the river', x: 0, z: -1.2, yaw: 0 },
          { name: 'at the front window, the firs either side and the river beyond', x: 0, z: back + 2.4, yaw: 0, frame: view.el },
          { name: 'at the desk, with the old wooden radio and the instruments in reach', x: -W / 2 + 2.1, z: dz, yaw: LEFT, pitch: -0.2, frame: desk.el },
          { name: 'at the bookshelf', x: -W / 2 + 2.2, z: bz, yaw: LEFT, pitch: -0.15, frame: shelf.el },
          { name: 'at the creativity corner', x: W / 2 - 2.1, z: -2.6, yaw: RIGHT, pitch: -0.12, frame: corner.el },
          { name: 'at the room’s own page, where the art on the walls is', x: W / 2 - 2.0, z: pz, yaw: RIGHT, page: kit.page, frame: frame },
          { name: 'at the map by the door', x: -1.7, z: -1.6, yaw: Math.PI, frame: map.el },
          { name: 'at the window by the door, the garden and the bee yard outside', x: gx, z: -1.7, yaw: Math.PI, frame: garden.el },
          { name: 'looking back at the door, with the welcome over it', x: 0, z: -2.4, yaw: Math.PI, pitch: 0.15, frame: welcome.el }
        ]
      };
    }
  };
})();

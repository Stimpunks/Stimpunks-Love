/* =============================================================================
   The Polaroid Wall, walked into on Cel Street, through the door at the back
   of Enid's Room. Ryan's ask, 2026-11-01: the rooms behind the doors.

   THE ROOM IS PHOTOGRAPHS, AND NOT ONE OF THEM IS HERE. Every photograph on
   the wall has a consent record (data/polaroids.json) naming the pages it is
   published on, so the photographs are seen only on the room's own pages,
   one of which hangs on the left-hand wall here. What the scene draws is the
   wall they hang on, as the page itself puts it: "grey rectangles",
   placeholders that stay grey until somebody sends one. Every frame on the far
   wall is empty, a pale card with a grey plate and no caption, held up by a
   drawing pin. No picture, no face and no figure standing in for a person is
   drawn anywhere, because a drawing of somebody is a description of them in
   our words, which the wall promises not to make.

   It is a plain room (§11), in the plain rooms' own colours by name: the ink
   walls, the paper of the frames, the chalk light, the yellow pins. The
   frames tilt a little either way, as the polaroids on the page do, and hang
   straight at Gentle, as they do there.

   THE PAGE'S OWN WORDS ARE LIFTED AS IT HAS THEM: its opening, what it asks
   for, and how to send one and how to take it back. None of them has a
   photograph in it. Its promises are on the page itself, on the left-hand
   wall.

   NOTHING MOVES, nothing is fetched but the page through Cel Street's
   screen(), and nothing is kept. tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['polaroids.html'] = {
    name: 'The Polaroid Wall',
    from: 'enids-room.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var W = 6.4, D = 7, H = 3.0, back = -D;

      // THE LIGHT: the plain rooms' chalk, a little on everything, and one lamp
      // overhead behind you thrown on the wall of empty frames.
      kit.scene.background = kit.col('--ink');
      kit.scene.add(new T.HemisphereLight(kit.col('--chalk'), kit.col('--ink'), 1.0));
      var lamp = new T.SpotLight(kit.col('--chalk'), 38, 14, 0.75, 0.6, 1.2);
      lamp.position.set(0, H - 0.15, -1.6);
      lamp.target.position.set(0, 1.5, back);
      lamp.castShadow = true;
      lamp.shadow.mapSize.set(1024, 1024);
      lamp.shadow.bias = -0.0008; lamp.shadow.normalBias = 0.03;
      kit.scene.add(lamp, lamp.target);

      // THE ROOM: a dark floor, the plain rooms' walls, a skirting, a ceiling,
      // and the door back to Enid's Room shut behind you.
      box(W, 0.1, D + 0.4, at(0, -0.05, -D / 2), '--ink-2', false, false);
      box(0.2, H, D, at(-W / 2 - 0.1, H / 2, -D / 2), '--ink-3');
      box(0.2, H, D, at(W / 2 + 0.1, H / 2, -D / 2), '--ink-3');
      box(W + 0.4, H, 0.2, at(0, H / 2, back - 0.1), '--ink-3');
      box(W + 0.4, H, 0.2, at(0, H / 2, 0.1), '--ink-3');
      box(W + 0.4, 0.2, D + 0.4, at(0, H + 0.1, -D / 2), '--ink', false, false);
      [[-W / 2 + 0.02, -D / 2, LEFT, D], [W / 2 - 0.02, -D / 2, RIGHT, D], [0, back + 0.02, 0, W], [0, -0.02, Math.PI, W]].forEach(function (s) {
        box(s[3], 0.14, 0.04, at(s[0], 0.07, s[1], s[2]), '--ink-2', false);
      });
      box(1.0, 2.2, 0.06, at(1.6, 1.1, -0.03), '--ink-2');
      kit.cyl(0.03, 0.03, 0.08, at(1.22, 1.05, -0.1, 0, Math.PI / 2), '--chalk', false, 8);

      // THE WALL OF EMPTY FRAMES across the far wall: a pale card, a grey plate
      // with nothing on it, an empty chin where a caption would go, and a
      // drawing pin through the top. Tilted a little either way, straight at
      // Gentle.
      var COLS = 7, ROWS = 3, FW = 0.46, FH = 0.56, GX = 0.78, GY = 0.72;
      for (var r = 0; r < ROWS; r++) {
        for (var c = 0; c < COLS; c++) {
          var i = r * COLS + c;
          var fx = (c - (COLS - 1) / 2) * GX + (r % 2 ? 0.12 : -0.08);
          var fy = 0.95 + r * GY;
          var tilt = kit.gentle ? 0 : (i % 2 ? 0.026 : -0.035) * (1 + (i % 3) * 0.3);
          var f = at(fx, fy, back + 0.03, 0, 0, tilt);
          box(FW, FH, 0.01, M(f, at(0, 0, 0)), '--paper', false, false);
          box(FW - 0.08, FW - 0.08, 0.004, M(f, at(0, 0.05, 0.007)), '--chalk', false, false);
          kit.piece(new T.SphereGeometry(0.022, 10, 8), M(f, at(0, FH / 2 - 0.035, 0.02)), '--yellow', false);
        }
      }

      // THE PAGE'S OWN WORDS. The page itself on the left-hand wall, where its
      // promises are and where the photographs are seen; its opening, what it
      // asks for and how to send one or take it back on the right-hand wall.
      var pw = 2.4, ph = pw * 800 / 1180, py = 0.95 + ph / 2, PZ = -3.9;
      box(pw + 0.12, ph + 0.12, 0.05, at(-W / 2 + 0.03, py, PZ, LEFT), '--chalk');
      var frame = kit.screen(1180, 800, pw, at(-W / 2 + 0.06, py, PZ, LEFT), 'The Polaroid Wall’s own page, on the left-hand wall');
      var lede = kit.lift(frame, '.lede', { w: 640, ww: 1.3, drop: 'img', m: at(W / 2 - 0.03, 1.35, -1.9, RIGHT) });
      var ask = kit.lift(frame, '.card.card--call', { w: 700, ww: 1.5, drop: 'img', m: at(W / 2 - 0.03, 0.85, -3.8, RIGHT) });
      var send = kit.lift(frame, '.card', { n: 1, w: 700, ww: 1.5, drop: 'img', m: at(W / 2 - 0.03, 0.85, -5.6, RIGHT) });

      return {
        start: { x: -0.4, z: -1.0, yaw: 0 },
        bounds: { x: [-W / 2 + 0.7, W / 2 - 0.7], z: [back + 1.2, -0.7] },
        stops: [
          { name: 'just inside the door from Enid’s Room, the wall of empty frames ahead', x: -0.4, z: -1.0, yaw: 0 },
          { name: 'at the wall, its frames empty here, because the photographs hang only on the room’s own page', x: 0, z: back + 3.2, yaw: 0, pitch: 0.12 },
          { name: 'close to the frames, each a grey plate and a drawing pin', x: 0.4, z: back + 2.0, yaw: 0, pitch: 0.12 },
          { name: 'at the left-hand wall, with the room’s own page, its promises and its photographs on it', x: -W / 2 + 2.3, z: PZ, yaw: LEFT, pitch: 0.02, page: kit.page, frame: frame },
          { name: 'at the right-hand wall, with what the wall is', x: W / 2 - 1.35, z: -1.9, yaw: RIGHT, pitch: 0.04, frame: lede.el },
          { name: 'at the right-hand wall, with what it asks for', x: W / 2 - 1.45, z: -3.8, yaw: RIGHT, pitch: -0.18, frame: ask.el },
          { name: 'at the right-hand wall, with how to send one and how to take it back', x: W / 2 - 1.45, z: -5.6, yaw: RIGHT, pitch: -0.18, frame: send.el },
          { name: 'looking back at the door to Enid’s Room', x: 0, z: -3.6, yaw: Math.PI }
        ]
      };
    }
  };
})();

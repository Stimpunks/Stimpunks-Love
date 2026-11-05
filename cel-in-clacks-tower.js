/* =============================================================================
   The Clacks Tower, walked into on Cel Street. Ryan's ask, 2026-11-04:
   subrooms of Widdershins inspired by places in the Discworld novels, in the
   city over the bridge, each its own world on Cel Street.

   THE SHUTTER CABIN AT THE TOP OF A CLACKS TOWER, AT NOON (§143). You come up
   the ladder through the hatch into a timber cabin. The far wall is a grid of
   shutters, some tarred shut and some turned edge-on, and the day is outside
   behind them: pale sky, the next hill, and the next tower on it, seen through
   the open shutter in the middle. The sun comes in only where a shutter is
   open, so the only light in the cabin lies on the floorboards in hard white
   squares, in the pattern the shutters hold: the message going out. Everything
   else is cool shade, lit a little by what bounces up off the squares.

   THE SQUARES ARE WORKED OUT, NEVER PLACED BY EYE: each opening is projected
   along the sun onto the floor with the same RISE and DRIFT that
   tools/make-clacks-tower.py uses for the page's drawing, so the scene and
   the drawing cannot show two different messages. There is no beam in the
   air, because the air is clear: only where the light lands.

   EVERY WORD IS ON THE CABIN'S WALLS, in the shade. The page's words are lifted
   onto boards along both side walls, and its own page hangs on the wall by
   the hatch. NOBODY IS UP HERE, and nobody from the book is drawn: no crew, no
   character, no crest. NOTHING MOVES: the shutters are held mid-word at every
   setting. Every colour is one §143 declares, by name. It keeps nothing, sends
   nothing and fetches nothing; the page arrives through Cel Street's screen(),
   and tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['clacks-tower.html'] = {
    name: 'The Clacks Tower',
    from: 'widdershins.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var FLAT = -Math.PI / 2;
      var HW = 3, BACK = -2.6, FRONT = 3.4, TOP = 3.2;   // the cabin
      // The shutters, as the page's drawing has them: three columns, three rows
      // from the bottom, and the pattern top row first. Ours, no letter of the
      // book's code. And the sun, as the page's drawing has it.
      var COLS = [[-2.1, -0.9], [-0.6, 0.6], [0.9, 2.1]];
      var ROWS = [[0.95, 1.55], [1.7, 2.3], [2.45, 3.05]];
      var PATTERN = ['101', '010', '110'];
      var RISE = 1.6, DRIFT = 0.32;
      function open(c, r) { return PATTERN[ROWS.length - 1 - r].charAt(c) === '1'; }

      // THE SHADE, AND NO LAMP. A dim fill from the squares of sun bouncing up,
      // nothing else: the cabin is tarred against the weather and nobody has
      // lit anything, because it is noon.
      kit.scene.background = kit.col('--clk-shade');
      kit.scene.add(new T.HemisphereLight(kit.col('--clk-timber-2'), kit.col('--clk-shade'), 1.3));
      var bounce = new T.PointLight(kit.col('--clk-day'), 6, 9, 1.6);
      bounce.position.set(0.3, 0.2, BACK + 1.2);
      kit.scene.add(bounce);

      // THE DAY OUTSIDE, seen only through the shutters: sky, the next hill and
      // the next tower on it, all flat, because nothing out there is lit by
      // anything in here.
      kit.flat(new T.PlaneGeometry(90, 40), at(0, 6, -30), '--clk-sky');
      var hill = new T.Shape();
      hill.moveTo(-45, -6); hill.lineTo(-45, 0.6);
      hill.bezierCurveTo(-14, 1.4, -6, 3.0, 0, 3.0);
      hill.bezierCurveTo(6, 3.0, 16, 1.2, 45, 0.4); hill.lineTo(45, -6); hill.lineTo(-45, -6);
      kit.flat(new T.ShapeGeometry(hill), at(0, 0, -29.5), '--clk-hill');
      box(0.18, 2.6, 0.18, at(0.4, 4.2, -29), '--clk-far', false, false);
      box(1.1, 0.75, 0.3, at(0.4, 5.8, -29), '--clk-far', false, false);

      // THE SHUTTER WALL, built round its openings: posts between the columns,
      // rails between the rows, and the planks round the edge.
      var WALL = '--clk-board', T0 = 0.12;
      box(0.9, TOP, T0, at(-HW + 0.45, TOP / 2, BACK), WALL, 0.02);
      box(0.9, TOP, T0, at(HW - 0.45, TOP / 2, BACK), WALL, 0.02);
      [[-0.9, -0.6], [0.6, 0.9]].forEach(function (g) {
        box(g[1] - g[0], TOP, T0, at((g[0] + g[1]) / 2, TOP / 2, BACK), WALL, 0.02);
      });
      [[0, 0.95], [1.55, 1.7], [2.3, 2.45], [3.05, TOP]].forEach(function (g) {
        box(4.2, g[1] - g[0], T0, at(0, (g[0] + g[1]) / 2, BACK), WALL, 0.02);
      });
      COLS.forEach(function (cx, c) {
        ROWS.forEach(function (ry, r) {
          var w = cx[1] - cx[0], h = ry[1] - ry[0], x = (cx[0] + cx[1]) / 2, y = (ry[0] + ry[1]) / 2;
          // The frame round each opening.
          box(w + 0.1, 0.06, 0.16, at(x, ry[1] + 0.03, BACK + 0.02), '--clk-frame', false);
          box(w + 0.1, 0.06, 0.16, at(x, ry[0] - 0.03, BACK + 0.02), '--clk-frame', false);
          box(0.06, h, 0.16, at(cx[0] - 0.03, y, BACK + 0.02), '--clk-frame', false);
          box(0.06, h, 0.16, at(cx[1] + 0.03, y, BACK + 0.02), '--clk-frame', false);
          if (open(c, r)) {
            // Turned edge-on about its middle, so the day comes through.
            box(w - 0.04, 0.05, 0.36, at(x, y, BACK - 0.08), '--clk-tar', 0.01);
          } else {
            box(w - 0.04, h - 0.04, 0.06, at(x, y, BACK - 0.02), '--clk-tar', 0.01);
            [1, 2, 3].forEach(function (k) {
              box(w - 0.1, 0.02, 0.02, at(x, ry[0] + h * k / 4, BACK + 0.02), '--clk-grain', false, false);
            });
          }
        });
      });

      // THE OTHER WALLS, THE CEILING AND ITS BEAMS, AND THE FLOOR.
      box(T0, TOP, FRONT - BACK, at(-HW, TOP / 2, 0), '--clk-shade', 0.02);
      box(T0, TOP, FRONT - BACK, at(HW, TOP / 2, 0), '--clk-shade', 0.02);
      box(2 * HW, TOP, T0, at(0, TOP / 2, FRONT), '--clk-shade', 0.02);
      box(2 * HW, T0, FRONT - BACK, at(0, TOP, 0), '--clk-tar', false, false);
      [-1.2, 0.4, 2.0].forEach(function (z) { box(2 * HW, 0.22, 0.2, at(0, TOP - 0.15, z), '--clk-frame', 0.015); });
      box(2 * HW, 0.1, FRONT - BACK, at(0, -0.05, 0), '--clk-board', false, false);
      for (var px = -HW + 0.5; px < HW; px += 0.5) {
        box(0.02, 0.012, FRONT - BACK, at(px, 0.006, 0), '--clk-grain', false, false);
      }

      // THE LIGHT: each open shutter's square of sun on the boards, projected
      // along the sun as the page's drawing projects it. Flat and unlit,
      // because it is the light itself.
      function floor(x, y) { var z = y / RISE; return [x + DRIFT * z, BACK + z]; }
      COLS.forEach(function (cx, c) {
        ROWS.forEach(function (ry, r) {
          if (!open(c, r)) return;
          var p = [floor(cx[0], ry[0]), floor(cx[1], ry[0]), floor(cx[1], ry[1]), floor(cx[0], ry[1])];
          var sh = new T.Shape();
          sh.moveTo(p[0][0], -p[0][1]);
          for (var i = 1; i < 4; i++) sh.lineTo(p[i][0], -p[i][1]);
          kit.flat(new T.ShapeGeometry(sh), at(0, 0.014, 0, 0, FLAT), '--clk-day');
        });
      });

      // THE LEVER BANK under the shutters, one lever for each, leaning towards
      // you for an open one and away for a shut one.
      box(4.8, 0.35, 0.25, at(0, 0.175, BACK + 0.19), '--clk-frame', 0.02);
      var k = 0;
      COLS.forEach(function (cx, c) {
        ROWS.forEach(function (ry, r) {
          var x = -2.1 + k * 0.525, lean = open(c, r) ? 0.35 : -0.25;
          cyl(0.02, 0.02, 0.5, at(x, 0.58, BACK + 0.19, 0, lean), '--clk-timber-2', false, 8);
          kit.piece(new T.SphereGeometry(0.045, 10, 8), at(x, 0.58 + 0.25 * Math.cos(lean), BACK + 0.19 + 0.25 * Math.sin(lean)), '--clk-timber-2', false, false);
          k++;
        });
      });

      // THE HATCH you came up through, in the floor by the back wall, and the
      // top of the ladder standing out of it.
      box(1.1, 0.02, 0.9, at(-1.9, 0.01, FRONT - 0.8), '--clk-tar', false, false);
      [-2.2, -1.6].forEach(function (x) { box(0.07, 0.9, 0.07, at(x, 0.45, FRONT - 0.95), '--clk-frame', 0.01); });
      box(0.66, 0.05, 0.05, at(-1.9, 0.7, FRONT - 0.95), '--clk-frame', false);

      // THE ROOM'S OWN PAGE, on the wall by the hatch, facing the shutters.
      var pw = 2.0, ph = pw * 800 / 1180;
      box(pw + 0.12, ph + 0.12, 0.05, at(0.9, 0.7 + ph / 2, FRONT - 0.09, Math.PI), '--clk-tar', 0.01);
      var page = kit.screen(1180, 800, pw, at(0.9, 0.7 + ph / 2, FRONT - 0.12, Math.PI), 'The Clacks Tower’s own page, on the wall by the hatch');

      // THE PAGE'S WORDS on boards along both side walls, in the shade.
      var STAND = 1.5;
      function board(sel, n, side, z, w, ww, h) {
        var ry = side < 0 ? Math.PI / 2 : -Math.PI / 2, x = side * (HW - 0.08);
        var it = kit.lift(page, sel, { n: n, w: w, ww: ww, h: h, m: at(x, 0.55, z, ry) });
        box(0.05, 0.06, ww + 0.1, at(x, 0.52, z), '--clk-frame', false);
        return { x: x - side * STAND, z: z, yaw: ry, pitch: 0.02, frame: it.el };
      }
      var stops = [
        { name: 'at the top of the ladder, the shutters in front of you and the sun on the floor', x: -0.6, z: 1.6, yaw: 0, pitch: -0.12 },
        { name: 'standing in a square of sun, the shutters right above you', x: 0.2, z: -0.4, yaw: 0, pitch: -0.32 },
        { name: 'at the open shutter in the middle, the next tower on the next hill', x: 0, z: -1.8, yaw: 0, pitch: 0.22 }
      ];
      function named(s, name) { s.name = name; stops.push(s); return s; }
      named(board('.clk-head', 0, -1, 2.6, 900, 1.1), 'at the board with the room’s name');
      named(board('.clk-lede', 0, -1, 1.4, 640, 1.05, 760), 'at the board with how you came up and what lights the cabin');
      var PARTS = [
        'at the board with up the tower',
        'at the board with the Overhead and GNU John Dearheart',
        'at the board with the header this street sends',
        'at the board with who lives up here',
        'at the board with what the light says',
        'at the board with what is not up here',
        'at the board with the way down the ladder',
        'at the board with whose this is'
      ];
      // Down the left wall to the shutters, then back up the right wall.
      var SPOTS = [[-1, 0.2], [-1, -1.0], [-1, -2.2], [1, -2.2], [1, -1.0], [1, 0.2], [1, 1.4], [1, 2.6]];
      PARTS.forEach(function (words, i) {
        var sp = SPOTS[i];
        named(board('.clk-part', i, sp[0], sp[1], 640, 1.05, 760), words);
      });
      stops.push({ name: 'by the hatch, with the room’s own page on the wall', x: 0.9, z: FRONT - 1.6, yaw: Math.PI, pitch: 0.02, page: kit.page, frame: page });

      return {
        start: { x: -0.6, z: 1.6, yaw: 0 },
        bounds: { x: [-HW + 0.45, HW - 0.45], z: [BACK + 0.55, FRONT - 0.5] },
        stops: stops
      };
    }
  };
})();

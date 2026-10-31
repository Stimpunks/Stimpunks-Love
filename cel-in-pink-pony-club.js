/* =============================================================================
   Pink Pony Club, walked into on Cel Street. Ryan's ask, 2026-10-31: walk into
   a room from Cel Street, and this one first because it is the first door on
   the street.

   IT IS THE DANCEFLOOR'S WORLD AND NOBODY ELSE'S (§6), drawn the way Cel
   Street draws: flat colour inside an inked line, light in two steps. A floor
   of hot pink tiles with cream ones lit here and there and plum between them,
   hot pink walls with nothing on them, a plum ceiling, the mirrorball over the
   middle, banquettes down both sides, the decks on their table, and at the
   far end, between two speakers, the jukebox's cream tray with the room's own
   page in it, to read and press as the page itself.

   THE BALL DOES NOT TURN, AND ITS GLINTS FOLLOW THE DIAL: the room hides its
   own glow at Gentle, so at Gentle no glint lies on this floor either. Every
   colour is one the room declares, by name. It keeps nothing, sends nothing
   and fetches nothing; its page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i, 374761393) ^ Math.imul(j, 668265263) ^ Math.imul(k, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['pink-pony-club.html'] = {
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, D = 22, W = 14, H = 5, TILE = 1.4;
      var back = -D;

      kit.scene.background = kit.col('--pony-ink');
      kit.scene.add(new T.HemisphereLight(kit.col('--cream'), kit.col('--pony-ink'), 1.2));
      var ball = new T.PointLight(kit.col('--cream'), 5, 30, 1.4);
      ball.position.set(0, 1.9, -9.5);
      kit.scene.add(ball);
      var key = new T.DirectionalLight(kit.col('--cream'), 1.4);
      key.position.set(4, 9, 4); key.target.position.set(0, 0, -12);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.left = -12; key.shadow.camera.right = 12; key.shadow.camera.top = 16; key.shadow.camera.bottom = -16;
      key.shadow.bias = -0.0006; key.shadow.normalBias = 0.03;
      kit.scene.add(key, key.target);

      // THE FLOOR: plum under everything, and the tiles on it, hot pink with
      // a cream one lit here and there, the same every visit.
      box(W, 0.1, D + 2, at(0, -0.05, -D / 2 + 1), '--pony-ink', false, false);
      for (var i = 0; i < W / TILE; i++) {
        for (var j = 0; j < (D + 1) / TILE; j++) {
          var lit = hash(i, j, 1) < 0.16;
          box(TILE - 0.08, 0.06, TILE - 0.08, at(-W / 2 + (i + 0.5) * TILE, 0.03, 1 - (j + 0.5) * TILE), lit ? '--cream' : (i + j) % 2 ? '--hot' : '--pink', false, false);
        }
      }
      // The walls, hot pink with nothing on them, and the plum ceiling.
      box(0.4, H, D + 2, at(-W / 2 - 0.2, H / 2, -D / 2 + 1), '--hot');
      box(0.4, H, D + 2, at(W / 2 + 0.2, H / 2, -D / 2 + 1), '--hot');
      box(W + 0.8, H, 0.4, at(0, H / 2, back - 0.2), '--hot');
      box(W + 0.8, 0.3, D + 2, at(0, H + 0.15, -D / 2 + 1), '--pony-ink', false, false);
      // The wall you came in by, with its doorway in cream.
      box((W - 2.4) / 2, H, 0.4, at(-(W + 2.4) / 4, H / 2, 1.2), '--hot');
      box((W - 2.4) / 2, H, 0.4, at((W + 2.4) / 4, H / 2, 1.2), '--hot');
      box(2.4, H - 2.6, 0.4, at(0, 2.6 + (H - 2.6) / 2, 1.2), '--hot');
      box(0.15, 2.6, 0.5, at(-1.2, 1.3, 1.2), '--cream', 0.03);
      box(0.15, 2.6, 0.5, at(1.2, 1.3, 1.2), '--cream', 0.03);
      box(2.55, 0.15, 0.5, at(0, 2.6, 1.2), '--cream', 0.03);

      // THE MIRRORBALL on its line, faceted, still at every setting.
      kit.cyl(0.02, 0.02, H - 3.4, at(0, 3.4 + (H - 3.4) / 2, -11), '--cream', false, 6);
      kit.facets(new T.IcosahedronGeometry(0.85, 1), at(0, 3.4, -11), '--pony-ball');
      // Its glints on the floor and the walls, above Gentle only.
      if (!kit.gentle) {
        for (var k = 0; k < 46; k++) {
          var gx = -W / 2 + 0.6 + hash(k, 7, 2) * (W - 1.2), gz = -3 - hash(k, 7, 3) * (D - 5);
          kit.flat(new T.CircleGeometry(0.09 + hash(k, 7, 4) * 0.08, 10), at(gx, 0.075, gz, 0, -Math.PI / 2), '--cream');
        }
        for (k = 0; k < 30; k++) {
          var s = k % 2 ? 1 : -1, wz = -2 - hash(k, 9, 3) * (D - 4), wy = 1 + hash(k, 9, 4) * 3.4;
          kit.flat(new T.CircleGeometry(0.08 + hash(k, 9, 5) * 0.06, 10), at(s * (W / 2 - 0.01), wy, wz, s > 0 ? -Math.PI / 2 : Math.PI / 2), '--cream');
        }
      }

      // BANQUETTES down both sides: a plum back, a cream seat.
      [-1, 1].forEach(function (s) {
        [[-4.5, 5], [-14, 6]].forEach(function (b) {
          var x = s * (W / 2 - 0.55);
          box(0.4, 1.3, b[1], at(s * (W / 2 - 0.2), 0.65, b[0]), '--pony-ink');
          box(0.8, 0.22, b[1], at(x, 0.5, b[0]), '--cream');
          box(0.7, 0.4, b[1] - 0.1, at(x, 0.2, b[0]), '--pony-ink');
        });
      });

      // THE DECKS' TABLE, against the right wall: plum, a cream edge, two
      // turntables on it. The decks themselves are on the room's page.
      var tx = W / 2 - 1.2, tz = -8.5;
      box(1.2, 1.0, 3.2, at(tx, 0.5, tz), '--pony-ink');
      box(1.24, 0.08, 3.24, at(tx, 1.04, tz), '--cream');
      [-0.8, 0.8].forEach(function (o) {
        kit.cyl(0.42, 0.42, 0.06, at(tx, 1.12, tz + o), '--pony-ink', 0.02, 24);
        kit.cyl(0.36, 0.36, 0.02, at(tx, 1.16, tz + o), '--pony-ball', false, 24);
        kit.cyl(0.04, 0.04, 0.06, at(tx, 1.19, tz + o), '--cream', false, 8);
      });

      // THE JUKEBOX'S TRAY on the far wall, cream, with the room's own page
      // in it, and a speaker stack either side.
      var sw = 5, sh = sw * 800 / 1180, sy = 0.4 + sh / 2 + 0.25;
      box(sw + 0.5, sh + 0.5, 0.18, at(0, sy, back + 0.09), '--cream');
      var frame = kit.screen(1180, 800, sw, at(0, sy, back + 0.2), 'Pink Pony Club’s own page, in the jukebox’s tray');
      [-1, 1].forEach(function (s) {
        var x = s * (sw / 2 + 1.1);
        box(1.2, 2.8, 0.9, at(x, 1.4, back + 0.5), '--pony-ink');
        [0.75, 2.0].forEach(function (y) {
          kit.flat(new T.CircleGeometry(0.42, 24), at(x, y, back + 0.96), '--cream');
          kit.flat(new T.CircleGeometry(0.32, 24), at(x, y, back + 0.97), '--pony-ink');
          kit.flat(new T.CircleGeometry(0.11, 16), at(x, y, back + 0.98), '--cream');
        });
        kit.flat(new T.CircleGeometry(0.07, 12), at(x, 0.3, back + 0.96), '--hot');
      });

      return {
        start: { x: 0, z: -0.6, yaw: 0 },
        bounds: { x: [-W / 2 + 1.2, W / 2 - 1.2], z: [back + 1.4, -0.4] },
        stops: [
          { name: 'at the edge of the dancefloor', x: 0, z: -0.6, yaw: 0 },
          { name: 'at the decks’ table', x: tx - 2.4, z: tz, yaw: -Math.PI / 2 },
          { name: 'under the mirrorball', x: 0, z: -8, yaw: 0 },
          { name: 'at the jukebox, with the room’s own page in its tray', x: 0, z: back + 2.7, yaw: 0, page: kit.page, frame: frame }
        ]
      };
    }
  };
})();

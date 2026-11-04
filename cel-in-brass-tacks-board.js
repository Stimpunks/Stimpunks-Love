/* =============================================================================
   The Brass Tacks Board, walked into on Cel Street: off the pavement by the
   front door, beside the Pebble Board.

   IT IS THE BOARD'S WORLD AND NOBODY ELSE'S (§90): AN ALCOVE OF OLD COPPER
   GONE GREEN, and every post a polished brass plate tacked to it. The light is
   what the metal does with it: the verdigris is matte and gives nothing back,
   so the walls stay dark with their streaks in them, and each plate throws
   back one hard bright line along its top edge, its lower edge in shade, so
   the plates stand off the wall. No glass, no paper, no cork and no lamp,
   which is what keeps it off the Pebble Board next door, and nothing glints by
   itself.

   THE PLATES HERE CARRY NO WORDS. Every post on the board is a moderator's,
   fetched from the CB by the page's own script, and none of it is copied into
   this room: the posts are on the page, which is tacked up on the back wall as
   itself, where they arrive and read as they do there. What is lifted is the
   page's own words about the board: what it is for, how it works, and whose
   wall it is.

   NOTHING MOVES, at any setting. Every colour is one the board declares, by
   name. It keeps nothing, sends nothing and fetches nothing; its page arrives
   through Cel Street's screen().
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 7, 374761393) ^ Math.imul(j + 29, 668265263) ^ Math.imul(k + 31, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['brass-tacks-board.html'] = {
    name: 'The Brass Tacks Board',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var W = 4.2, D = 9, H = 4.4;   // half the alcove's width, its depth, its height

      // THE DARK, and only a little light, from above and in front, which the
      // copper takes in and the brass sends back.
      kit.scene.background = kit.col('--btb-wall');
      kit.scene.add(new T.HemisphereLight(kit.col('--btb-dim'), kit.col('--btb-wall'), 0.5));
      var sky = new T.DirectionalLight(kit.col('--btb-shine'), 0.9);
      sky.position.set(0, 12, 6);
      kit.scene.add(sky);

      // THE ALCOVE: copper gone green on three sides, the floor the same.
      box(W * 2, 0.1, D + 4, at(0, -0.05, -D / 2 + 1), '--btb-wall', false, false);
      box(W * 2, H, 0.2, at(0, H / 2, -D), '--btb-wall', false);
      [-1, 1].forEach(function (s) { box(0.2, H, D + 2, at(s * W, H / 2, -D / 2 + 1), '--btb-wall', false); });
      // The streaks in the green, running down each wall where the rain did.
      function streaks(g, len, seed) {
        for (var k = 0; k < 16; k++) {
          var sx = (hash(k, seed, 1) - 0.5) * len, sw = 0.02 + hash(k, seed, 2) * 0.07, sh = 0.6 + hash(k, seed, 3) * (H - 1.6);
          kit.flat(new T.PlaneGeometry(sw, sh), M(g, at(sx, H - sh / 2 - hash(k, seed, 4) * 0.3, 0.02)), k % 5 ? '--btb-patina' : '--btb-patina2');
        }
      }
      streaks(at(0, 0, -D + 0.1), W * 2 - 0.4, 1);
      streaks(at(-W + 0.1, 0, -D / 2 + 1, LEFT), D + 1.6, 2);
      streaks(at(W - 0.1, 0, -D / 2 + 1, RIGHT), D + 1.6, 3);

      // A PLATE: polished brass tacked to the wall, the hard bright line along
      // its top edge, its lower edge in shade, a tack at each corner.
      function plate(g, w, h) {
        box(w, h, 0.05, M(g, at(0, 0, 0.03)), '--btb-brass', false);
        box(w, 0.035, 0.06, M(g, at(0, h / 2 - 0.018, 0.035)), '--btb-shine', false, false);
        box(w, 0.05, 0.06, M(g, at(0, -h / 2 + 0.025, 0.035)), '--btb-brass2', false, false);
        [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(function (c) {
          kit.cyl(0.035, 0.035, 0.03, M(g, at(c[0] * (w / 2 - 0.09), c[1] * (h / 2 - 0.09), 0.07, 0, Math.PI / 2)), '--btb-tack', false, 10);
        });
      }

      // THE PAGE, tacked up on the back wall on the biggest plate of all, with
      // every post on it as it is on the page.
      var pw = 3.4, ph = pw * 800 / 1180, py = 1.0 + ph / 2;
      plate(at(0, py, -D + 0.1), pw + 0.4, ph + 0.4);
      var page = kit.screen(1180, 800, pw, at(0, py, -D + 0.2), 'The Brass Tacks Board’s own page, every post on it, on the back wall');

      // THE OTHER PLATES on the side walls, blank brass: the board's own words
      // are lifted onto three of them, and the rest wait.
      var lede = kit.lift(page, '.btb-lede', { w: 640, ww: 2.0, m: at(-W + 0.22, 1.0, -2.2, LEFT) });
      var how = kit.lift(page, '.btb-part', { n: 2, w: 700, h: 620, ww: 2.2, m: at(W - 0.22, 0.9, -3.4, RIGHT) });
      var made = kit.lift(page, '.btb-part', { n: 3, w: 640, ww: 2.0, m: at(-W + 0.22, 1.0, -5.6, LEFT) });
      [[-1, -2.2, 2.3, 1.6, 1.8], [1, -3.4, 2.5, 2.4, 2.0], [-1, -5.6, 2.3, 1.6, 1.8]].forEach(function (p) {
        plate(at(p[0] * (W - 0.1), p[4], p[1], p[0] < 0 ? LEFT : RIGHT), p[2], p[3]);
      });
      [[-1, -7.6, 1.2, 0.8, 1.7], [1, -6.6, 1.0, 0.7, 2.9], [1, -7.9, 1.4, 1.0, 1.4], [-1, -3.9, 0.9, 0.6, 3.3],
       [1, -1.4, 1.1, 0.7, 3.2], [-1, -0.8, 1.2, 0.9, 1.6]].forEach(function (p) {
        plate(at(p[0] * (W - 0.1), p[4], p[1], p[0] < 0 ? LEFT : RIGHT), p[2], p[3]);
      });

      var stops = [
        { name: 'in the mouth of the alcove, off the pavement', where: 'in the mouth of the alcove', x: 0, z: 0.4, yaw: 0, pitch: 0.06 },
        { name: 'at the plate on the left: what this board is for', where: 'at the plate on what the board is for', x: -W + 2.5, z: -2.2, yaw: LEFT, pitch: 0.1, frame: lede.el },
        { name: 'at the plate on the right: how the board works', where: 'at the plate on how the board works', x: W - 2.6, z: -3.4, yaw: RIGHT, pitch: 0.1, frame: how.el },
        { name: 'at the plate on the left: the board', where: 'at the plate on whose board it is', x: -W + 2.5, z: -5.6, yaw: LEFT, pitch: 0.1, frame: made.el },
        { name: 'at the big plate on the back wall, every post on it', where: 'at the board’s own page and its posts', x: 0, z: -D + 3.3, yaw: 0, pitch: 0.08, page: kit.page, frame: page }
      ];

      return {
        start: { x: 0, z: 0.4, yaw: 0 },
        bounds: { x: [-W + 0.8, W - 0.8], z: [-D + 1.4, 2] },
        stops: stops
      };
    }
  };
})();

/* =============================================================================
   The Zine Table, walked into on Cel Street. Ryan's ask, 2026-10-31: the fourth
   room you can walk into, after Pink Pony Club, Club Chronic and the Jungle Room.

   IT IS THE ZINE TABLE'S WORLD AND NOBODY ELSE'S (§7): photocopier black on
   white paper, and the ransom note's yellow, red and cyan. The zine is ONE
   SHEET you hold, cut with scissors and scattered at angles, which is what
   keeps it apart from Club Chronic's flyers, pasted down flat in layers on a
   black wall. So here the paper is on a table, every sheet at its own angle,
   with the cut-out letters, the scissors, the stapler and the glue among them,
   a photocopier and its reams against the wall, and the room's own page taped
   up as one big sheet: the page is the paper.

   THE TILT FOLLOWS THE DIAL, as the page's own ransom letters do: the taped-up
   page leans above Gentle and hangs straight at Gentle. Nothing moves. Every
   colour is one the room declares, by name. It keeps nothing, sends nothing
   and fetches nothing; its page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 3, 374761393) ^ Math.imul(j + 19, 668265263) ^ Math.imul(k + 23, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['zine-table.html'] = {
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, D = 10, W = 9, H = 3.4, back = -D;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };

      // LIGHT LIKE A PHOTOCOPY: even, hard, black and white.
      kit.scene.background = kit.col('--paper');
      kit.scene.add(new T.HemisphereLight(kit.col('--paper'), kit.col('--paper'), 1.8));
      var top = new T.DirectionalLight(kit.col('--paper'), 1.6);
      top.position.set(-3, 9, 2); top.target.position.set(0, 0, -5);
      top.castShadow = true;
      top.shadow.mapSize.set(1024, 1024);
      top.shadow.camera.left = -8; top.shadow.camera.right = 8; top.shadow.camera.top = 9; top.shadow.camera.bottom = -9;
      top.shadow.bias = -0.0006; top.shadow.normalBias = 0.02;
      kit.scene.add(top, top.target);

      // THE ROOM: paper walls, a paper floor flecked with toner, a black skirting.
      box(W, 0.1, D + 2, at(0, -0.05, -D / 2 + 1), '--paper', false, false);
      for (var k = 0; k < 160; k++) {
        kit.flat(new T.CircleGeometry(0.01 + hash(k, 1, 1) * 0.025, 5), at(-W / 2 + hash(k, 1, 2) * W, 0.003, 1 - hash(k, 1, 3) * (D + 1), 0, -Math.PI / 2), '--ink');
      }
      box(0.3, H, D + 2, at(-W / 2 - 0.15, H / 2, -D / 2 + 1), '--paper');
      box(0.3, H, D + 2, at(W / 2 + 0.15, H / 2, -D / 2 + 1), '--paper');
      box(W + 0.6, H, 0.3, at(0, H / 2, back - 0.15), '--paper');
      box(W + 0.6, 0.2, D + 2, at(0, H + 0.1, -D / 2 + 1), '--paper', false, false);
      box(W, 0.14, 0.04, at(0, 0.07, back + 0.02), '--ink', false, false);
      box(0.04, 0.14, D, at(-W / 2 + 0.02, 0.07, -D / 2), '--ink', false, false);
      box(0.04, 0.14, D, at(W / 2 - 0.02, 0.07, -D / 2), '--ink', false, false);
      box((W - 2.2) / 2, H, 0.3, at(-(W + 2.2) / 4, H / 2, 1.15), '--paper');
      box((W - 2.2) / 2, H, 0.3, at((W + 2.2) / 4, H / 2, 1.15), '--paper');
      box(2.2, H - 2.5, 0.3, at(0, 2.5 + (H - 2.5) / 2, 1.15), '--paper');
      box(0.1, 2.5, 0.34, at(-1.1, 1.25, 1.15), '--ink', 0.02);
      box(0.1, 2.5, 0.34, at(1.1, 1.25, 1.15), '--ink', 0.02);

      // THE SHEETS: photocopied zines, black on white, a ransom block or two
      // on some, and the cut-out letters on their own.
      var BLOCKS = ['--yellow', '--red', '--cyan', '--ink'];
      var zines = [0, 1, 2, 3, 4, 5].map(function (n) {
        return kit.paper(170, 220, function (c, w, h) {
          c.fillStyle = kit.ink('--paper'); c.fillRect(0, 0, w, h);
          var y = 14, x = 12;
          // A ransom headline, cut out of other paper.
          for (var r = 0; r < 4; r++) {
            var bw = 22 + hash(n, r, 1) * 18;
            c.fillStyle = kit.ink(BLOCKS[(n + r) % 4]);
            c.fillRect(x, y + (r % 2) * 4, bw, 30);
            x += bw + 4;
          }
          y += 46;
          c.fillStyle = kit.ink('--ink');
          // Two columns of typewriter.
          for (var col = 0; col < 2; col++) {
            for (var l = 0; l < 13; l++) c.fillRect(12 + col * 80, y + l * 11, 64 * (0.55 + 0.45 * hash(n, col, l)), 5);
          }
          // The black box in the foot row.
          if (n % 2) c.fillRect(12, h - 34, w - 24, 22);
        });
      });
      var letters = BLOCKS.map(function (b) {
        return kit.paper(32, 40, function (c, w, h) { c.fillStyle = kit.ink(b); c.fillRect(0, 0, w, h); });
      });

      // THE TABLE, black, with every sheet on it at its own angle.
      var tx = 0, tz = -4.6, TW = 3.0, TD = 3.4, TH = 0.9;
      box(TW, 0.08, TD, at(tx, TH, tz), '--ink');
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) {
        box(0.08, TH, 0.08, at(tx + c[0] * (TW / 2 - 0.12), TH / 2, tz + c[1] * (TD / 2 - 0.12)), '--ink', 0.02);
      });
      for (k = 0; k < 44; k++) {
        var zx = tx + (hash(k, 2, 1) - 0.5) * (TW - 0.5), zz = tz + (hash(k, 2, 2) - 0.5) * (TD - 0.5);
        kit.sheet(zines[k % zines.length], 0.34, 0.44, at(zx, TH + 0.045 + k * 0.0012, zz, hash(k, 2, 3) * Math.PI * 2, -Math.PI / 2));
      }
      for (k = 0; k < 70; k++) {
        var cx = tx + (hash(k, 3, 1) - 0.5) * (TW - 0.3), cz = tz + (hash(k, 3, 2) - 0.5) * (TD - 0.3);
        kit.sheet(letters[k % 4], 0.05, 0.065, at(cx, TH + 0.09 + k * 0.0006, cz, hash(k, 3, 3) * Math.PI * 2, -Math.PI / 2));
      }
      // Scissors, open; a stapler; a glue stick.
      var sx = tx + 0.6, sz = tz + 1.2, sm = at(sx, TH + 0.1, sz, 0.6);
      [-1, 1].forEach(function (s) {
        box(0.02, 0.012, 0.22, M(sm, at(s * 0.03, 0, -0.12, s * 0.22)), '--ink', 0.006);
        kit.piece(new T.TorusGeometry(0.035, 0.009, 6, 14), M(sm, at(s * 0.04, 0, 0.05, 0, Math.PI / 2)), '--red', 0.006);
      });
      box(0.06, 0.05, 0.2, at(tx - 0.9, TH + 0.08, tz - 1.2, 0.4), '--ink', 0.01);
      kit.cyl(0.025, 0.025, 0.12, at(tx - 0.9, TH + 0.1, tz + 1.3), '--cyan', 0.008, 10);
      kit.cyl(0.027, 0.027, 0.03, at(tx - 0.9, TH + 0.17, tz + 1.3), '--paper', 0.006, 10);

      // THE PHOTOCOPIER against the left wall, and its reams.
      var px = -W / 2 + 0.7, pz = -2.4;
      box(1.0, 1.0, 0.8, at(px, 0.5, pz), '--paper');
      box(1.04, 0.08, 0.84, at(px, 1.04, pz), '--ink');
      box(0.3, 0.06, 0.5, at(px + 0.55, 0.8, pz), '--paper', 0.015);
      box(0.18, 0.12, 0.04, at(px + 0.3, 0.92, pz + 0.42), '--ink', 0.01);
      for (var rr = 0; rr < 4; rr++) box(0.45, 0.1, 0.32, at(px + 0.05, 0.05 + rr * 0.1, pz - 1.0, rr * 0.08), rr % 2 ? '--paper' : '--yellow', 0.015);

      // STRINGS ACROSS THE ROOM, wall to wall, with a zine pegged over each
      // one, folded once, hanging how it hangs: the way a zine fair shows them.
      [-1.3, -3.0, -6.6, -8.2].forEach(function (z, li) {
        var y = H - 0.55 - (li % 2) * 0.25;
        box(W, 0.012, 0.012, at(0, y, z), '--ink', false, false);
        for (var q = 0, x = -W / 2 + 0.5; x < W / 2 - 0.5; q++, x += 0.55 + hash(li, q, 4) * 0.35) {
          if (li > 1 && Math.abs(x) < 2.6) continue;
          var tilt = (hash(li, q, 5) - 0.5) * 0.36;
          kit.sheet(zines[(li * 3 + q) % zines.length], 0.32, 0.42, at(x, y - 0.22, z + 0.01, 0, 0, tilt));
          kit.sheet(zines[(li * 3 + q + 1) % zines.length], 0.32, 0.42, at(x, y - 0.22, z - 0.01, Math.PI, 0, -tilt));
          box(0.03, 0.07, 0.03, at(x, y - 0.02, z), (li + q) % 3 ? '--ink' : '--red', 0.006);
        }
      });
      // CUTTINGS ON THE FLOOR round the table, where the scissors dropped them.
      for (k = 0; k < 60; k++) {
        var fa = hash(k, 4, 1) * Math.PI * 2, fr = 1.6 + hash(k, 4, 2) * 1.6;
        kit.sheet(k % 3 ? zines[k % zines.length] : letters[k % 4], k % 3 ? 0.16 : 0.07, k % 3 ? 0.2 : 0.09,
          at(tx + Math.cos(fa) * fr, 0.006 + k * 0.0002, tz + Math.sin(fa) * fr * 0.9, hash(k, 4, 3) * Math.PI * 2, -Math.PI / 2));
      }

      // THE ROOM'S OWN PAGE, taped up on the back wall as one big sheet,
      // leaning above Gentle and straight at Gentle.
      var sw = 4.4, sh = sw * 800 / 1180, sy = 0.5 + sh / 2, lean = kit.gentle ? 0 : -0.026;
      var wall = at(0, sy, back + 0.02, 0, 0, lean);
      box(sw + 0.16, sh + 0.16, 0.01, M(wall, at(0, 0, 0)), '--ink', false, false);
      [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(function (c) {
        box(0.42, 0.13, 0.012, M(wall, at(c[0] * (sw / 2 - 0.05), c[1] * (sh / 2 - 0.02), 0.03, 0, 0, c[0] * c[1] * 0.5)), '--paper', 0.005);
      });
      var frame = kit.screen(1180, 800, sw, M(wall, at(0, 0, 0.02)), 'The Zine Table’s own page, taped up on the wall as one big sheet');

      return {
        start: { x: 0, z: 0.4, yaw: 0 },
        bounds: { x: [-W / 2 + 0.8, W / 2 - 0.8], z: [back + 2.4, 0.6] },
        stops: [
          { name: 'in the doorway', x: 0, z: 0.4, yaw: 0 },
          { name: 'at the photocopier', x: px + 2.2, z: pz, yaw: Math.PI / 2 },
          { name: 'at the table, every sheet at its own angle', x: tx + TW / 2 + 0.9, z: tz + 0.6, yaw: Math.PI / 2 },
          { name: 'at the wall, with the room’s own page taped up on it', x: 0, z: back + 2.9, yaw: 0, page: kit.page, frame: frame }
        ]
      };
    }
  };
})();

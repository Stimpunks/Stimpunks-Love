/* =============================================================================
   The Spaceholder Saloon, walked into on Cel Street. Ryan's ask, 2026-11-05:
   every new room onto Cel Street and Paper Street.

   IT IS NORAH'S ROOM AND HER WORLD (§146), brought in from Your Room by
   tools/import-room.py, and this scene is OURS: a drawing of her saloon for
   Cel Street, in the colours her room declares (the import:spaceholder-saloon
   block in love.css's :root) and nothing else. It changes nothing on her page
   and is hers to keep or send back; a change to how it looks is hers to ask
   for.

   It is drawn from her page's own words and drawing and nothing more: plank
   walls, a stone fireplace with a low fire, two old oil lamps burning on the
   wooden mantle above it ("the old oil lamps on the mantle above the
   fireplace" is how she described the light), a wooden rocking chair closest
   to the fire with a red quilted cushion, a green pillow and a quilt over its
   back, a table for one, the big table with room for everybody, a porch swing
   hung from the rafters by the hearth piled with a cushion, two pillows and a
   blanket, and a row of hooks by the swinging doors. Her menu board is lifted
   off her page onto the wall by the door, so what it serves is in her words;
   her page itself hangs on the left wall.

   WHAT MOVES IS WHAT MOVES ON HER PAGE. At MAX her fire breathes and the
   lamps' flames breathe, so here the fire and the two lamp flames flicker at
   MAX, slowly, under the flash line the kit holds, and at any setting once
   somebody asks. Her chair rocks and her swing sways at MAX on her page; the
   kit has no way to rock a thing by itself, so here they are presses: rock
   the chair, push the swing. And a tall glass of ice water poured on the
   table for one, something hung on a hook by the doors, the lamps' wicks
   turned low or up: each a press that says what it did. It counts nothing.
   It keeps nothing, sends nothing and fetches nothing; her page arrives
   through Cel Street's screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j) {
    var n = Math.imul(i + 13, 374761393) ^ Math.imul(j + 29, 668265263);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['spaceholder-saloon.html'] = {
    name: 'Spaceholder Saloon',
    faces: ['Rye'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var W = 9, BACK = -9, FRONT = 1.6, H = 3.4, D = FRONT - BACK;

      // THE LIGHT: the two old oil lamps on the mantle and the low fire under
      // them, warm, and nothing else. The far corners stay her walnut dark.
      kit.scene.background = kit.col('--ss-ground');
      kit.scene.add(new T.HemisphereLight(kit.col('--ss-flame'), kit.col('--ss-ground'), 0.85));
      var fireLight = new T.PointLight(kit.col('--ss-flame'), 16, 11, 1.3);
      fireLight.position.set(0, 0.7, BACK + 1.0);
      kit.scene.add(fireLight);
      var lamps = [-0.95, 0.95].map(function (x) {
        var l = new T.PointLight(kit.col('--ss-flame-core'), 5, 9, 1.4);
        l.position.set(x, 3.0, BACK + 1.5);
        kit.scene.add(l);
        return l;
      });
      var LAMP_UP = lamps[0].intensity;
      // A little of the firelight thrown out across the room, so the far
      // furniture is warm on the side turned to the hearth.
      var throwLight = new T.PointLight(kit.col('--ss-ember'), 6, 14, 1.0);
      throwLight.position.set(0, 1.4, BACK + 4.5);
      kit.scene.add(throwLight);

      // PLANKS, as her drawing has them: upright boards in her wall brown, a
      // dark seam between each, the grain run down them and two nails a board
      // top and bottom. Each wall drawn for its own width, so a plank is a
      // plank wide on every wall.
      function planks(w, h, seed) {
        var n = Math.max(4, Math.round(w / 0.24));
        return kit.paper(Math.min(2048, n * 48), 512, function (g, pw, ph) {
          var bw = pw / n;
          g.fillStyle = kit.ink('--ss-wall'); g.fillRect(0, 0, pw, ph);
          for (var i = 0; i < n; i++) {
            var x = i * bw;
            g.fillStyle = kit.ink(hash(i, seed) < 0.35 ? '--ss-plank' : '--ss-wall');
            g.fillRect(x, 0, bw, ph);
            g.strokeStyle = kit.ink('--ss-plank'); g.lineWidth = 1.5;
            for (var k = 0; k < 3; k++) {
              var gx = x + bw * (0.2 + 0.3 * k + 0.1 * hash(i, seed + k));
              g.beginPath(); g.moveTo(gx, 0);
              g.bezierCurveTo(gx + 4, ph * 0.3, gx - 4, ph * 0.6, gx + 2, ph); g.stroke();
            }
            g.fillStyle = kit.ink('--ss-seam');
            g.fillRect(x, 0, 4, ph);
            [ph * 0.06, ph * 0.94].forEach(function (y) {
              g.beginPath(); g.arc(x + bw / 2 - 8, y, 3, 0, Math.PI * 2); g.arc(x + bw / 2 + 8, y, 3, 0, Math.PI * 2); g.fill();
            });
          }
        });
      }
      function wall(w, h, m, seed) { kit.sheet(planks(w, h, seed), w, h, m); }
      wall(W, H, at(0, H / 2, BACK), 1);
      wall(D, H, at(-W / 2, H / 2, (FRONT + BACK) / 2, LEFT), 2);
      wall(D, H, at(W / 2, H / 2, (FRONT + BACK) / 2, RIGHT), 3);
      // The front wall, round the swinging doors.
      var DOORW = 1.7;
      var side = (W - DOORW) / 2;
      wall(side, H, at(-W / 2 + side / 2, H / 2, FRONT, Math.PI), 4);
      wall(side, H, at(W / 2 - side / 2, H / 2, FRONT, Math.PI), 5);
      wall(DOORW, H - 2.3, at(0, 2.3 + (H - 2.3) / 2, FRONT, Math.PI), 6);
      // The night past the doors, her ground.
      kit.flat(new T.PlaneGeometry(DOORW + 0.4, 2.4), at(0, 1.15, FRONT + 0.6, Math.PI), '--ss-soot');

      // THE FLOOR: boards laid from the door to the hearth, end joints
      // staggered, and the ceiling of plain boards under the rafters.
      var floorTex = kit.paper(1024, 1024, function (g, pw, ph) {
        var rows = 36, rh = ph / rows;
        g.fillStyle = kit.ink('--ss-floor'); g.fillRect(0, 0, pw, ph);
        for (var r = 0; r < rows; r++) {
          g.fillStyle = kit.ink(hash(r, 9) < 0.3 ? '--ss-plank' : '--ss-floor');
          g.fillRect(0, r * rh, pw, rh);
          g.fillStyle = kit.ink('--ss-seam');
          g.fillRect(0, r * rh, pw, 3);
          var off = hash(r, 4) * pw;
          for (var x = off % 300; x < pw; x += 300) g.fillRect(x, r * rh, 3, rh);
        }
      });
      kit.sheet(floorTex, D, W, at(0, 0, (FRONT + BACK) / 2, Math.PI / 2, -Math.PI / 2));
      box(W, 0.12, D, at(0, H + 0.06, (FRONT + BACK) / 2), '--ss-plank', false, false);
      for (var rz = BACK + 1.2; rz < FRONT; rz += 2.1) box(W, 0.2, 0.18, at(0, H - 0.1, rz), '--ss-oak-dark', 0.015);
      // A skirting along every wall, where the planks meet the boards.
      box(W, 0.14, 0.05, at(0, 0.07, BACK + 0.03), '--ss-rootbeer', false, false);
      [-1, 1].forEach(function (s) { box(0.05, 0.14, D, at(s * (W / 2 - 0.03), 0.07, (FRONT + BACK) / 2), '--ss-rootbeer', false, false); });

      // THE FIREPLACE: a breast of stone up to the rafters, darker stones set
      // in it here and there, a soot-black firebox, and a hearthstone.
      var FZ = BACK + 0.35, OPEN = 1.25;
      [-1, 1].forEach(function (s) { box(0.55, OPEN, 0.7, at(s * 1.025, OPEN / 2, FZ), '--ss-stone', 0.02); });
      box(2.6, H - OPEN, 0.7, at(0, OPEN + (H - OPEN) / 2, FZ), '--ss-stone', 0.02);
      for (var sx = 0; sx < 7; sx++) for (var sy = 0; sy < 10; sy++) {
        if (hash(sx, sy) < 0.6) continue;
        var px = -1.15 + sx * 0.38 + (sy % 2) * 0.12, py = 0.2 + sy * 0.33;
        if (Math.abs(px) < 0.9 && py < OPEN + 0.1) continue;
        if (py > 2.15 && py < 2.55) continue;
        box(0.3 + 0.08 * hash(sx + 3, sy), 0.2, 0.03, at(px, py, FZ + 0.36), '--ss-stone-dark', false, false);
      }
      // The firebox: soot-black inside, back, sides and roof.
      box(1.5, OPEN, 0.06, at(0, OPEN / 2, FZ - 0.32), '--ss-soot', false, false);
      [-1, 1].forEach(function (s) { box(0.04, OPEN, 0.7, at(s * 0.73, OPEN / 2, FZ), '--ss-soot', false, false); });
      box(1.5, 0.04, 0.7, at(0, OPEN - 0.02, FZ), '--ss-soot', false, false);
      box(1.5, 0.02, 0.7, at(0, 0.01, FZ), '--ss-soot', false, false);
      box(3.0, 0.08, 1.0, at(0, 0.04, FZ + 0.85), '--ss-stone-dark', 0.01);
      // The logs, and the low fire on them.
      [[0, 0.16, 0.05, 1.05], [0.05, 0.28, -0.12, 0.85]].forEach(function (lg) {
        var log = new T.CylinderGeometry(0.1, 0.11, lg[3], 10); log.rotateZ(Math.PI / 2);
        kit.piece(log, at(lg[0], lg[1] - 0.04, FZ + 0.05 + lg[2], 0.15), '--ss-rootbeer', 0.012);
      });
      var flames = [];
      function flame(r, h, m, ink, light) {
        var g = new T.ConeGeometry(r, h, 10); g.translate(0, h / 2, 0);
        var f = kit.flat(g, m, ink);
        flames.push({ mesh: f, light: light || null });
        return f;
      }
      [[-0.32, 0.17, 0.5], [-0.1, 0.24, 0.7], [0.14, 0.2, 0.62], [0.36, 0.15, 0.45]].forEach(function (fl, n) {
        flame(fl[1], fl[2], at(fl[0], 0.26, FZ + 0.02), '--ss-ember', n === 1 ? fireLight : null);
      });
      [[-0.18, 0.12, 0.42], [0.06, 0.15, 0.5], [0.26, 0.11, 0.36]].forEach(function (fl) { flame(fl[1], fl[2], at(fl[0], 0.29, FZ + 0.08), '--ss-flame'); });
      [[-0.04, 0.07, 0.26], [0.14, 0.06, 0.2]].forEach(function (fl) { flame(fl[1], fl[2], at(fl[0], 0.32, FZ + 0.13), '--ss-flame-core'); });

      // THE MANTLE, and the two old oil lamps burning on it: a brass foot, a
      // brass font, a glass chimney and a flame inside it.
      box(3.2, 0.14, 0.5, at(0, 2.35, FZ + 0.5), '--ss-rootbeer', 0.02);
      [-1.2, 1.2].forEach(function (x) { box(0.14, 0.3, 0.4, at(x, 2.15, FZ + 0.48), '--ss-rootbeer', 0.012); });
      [-0.95, 0.95].forEach(function (x) {
        var L = at(x, 2.42, FZ + 0.5);
        cyl(0.14, 0.16, 0.05, M(L, at(0, 0.025, 0)), '--ss-brass', 0.008, 16);
        cyl(0.05, 0.07, 0.16, M(L, at(0, 0.13, 0)), '--ss-brass', 0.008, 12);
        var font = new T.SphereGeometry(0.13, 16, 10); font.scale(1, 0.62, 1);
        kit.piece(font, M(L, at(0, 0.27, 0)), '--ss-brass', 0.008);
        cyl(0.06, 0.06, 0.04, M(L, at(0, 0.36, 0)), '--ss-brass', false, 12);
        var glass = new T.LatheGeometry([new T.Vector2(0.05, 0), new T.Vector2(0.075, 0.08), new T.Vector2(0.06, 0.2), new T.Vector2(0.045, 0.32)], 16);
        var gm = kit.flat(glass, M(L, at(0, 0.38, 0)), '--ss-flame-core');
        gm.material.transparent = true; gm.material.opacity = 0.22; gm.material.depthWrite = false; gm.material.side = T.DoubleSide;
        flame(0.026, 0.11, M(L, at(0, 0.42, 0)), '--ss-flame');
      });
      // A brown bottle of sarsaparilla at one end of the mantle, and a mug of
      // cocoa at the other.
      cyl(0.045, 0.045, 0.2, at(1.42, 2.52, FZ + 0.5), '--ss-rootbeer', 0.006, 10);
      cyl(0.016, 0.03, 0.08, at(1.42, 2.66, FZ + 0.5), '--ss-rootbeer', 0.004, 8);

      // THE ROCKING CHAIR, closest to the fire, side on as her drawing has it:
      // rockers, a seat with a red quilted cushion, a green pillow against the
      // spindles and a quilt draped over its back. Two of it, still and rocked
      // back, one shown at a time.
      var RCK = 1.2;
      function chair(P, list) {
        function part(geo, m, ink) { list.push(kit.facets(geo, M(P, m), ink)); }
        [-1, 1].forEach(function (s) {
          var rk = new T.TorusGeometry(RCK, 0.035, 6, 24, 0.95);
          rk.rotateZ(-Math.PI / 2 - 0.475); rk.rotateY(Math.PI / 2); rk.translate(0, RCK + 0.035, 0);
          part(rk, at(s * 0.26, 0, 0), '--ss-oak-dark');
          [-0.22, 0.22].forEach(function (z) { part(new T.CylinderGeometry(0.025, 0.025, 0.42, 8), at(s * 0.26, 0.24, z), z > 0 ? '--ss-oak' : '--ss-oak-dark'); });
          part(new T.CylinderGeometry(0.028, 0.028, 0.95, 8), at(s * 0.26, 0.9, -0.27, 0, -0.12), '--ss-oak-dark');
          part(new T.BoxGeometry(0.06, 0.05, 0.5), at(s * 0.3, 0.74, 0.0), '--ss-oak');
          part(new T.CylinderGeometry(0.02, 0.02, 0.26, 8), at(s * 0.3, 0.6, 0.2), '--ss-oak');
        });
        part(new T.BoxGeometry(0.6, 0.06, 0.56), at(0, 0.45, 0), '--ss-oak');
        part(new T.BoxGeometry(0.62, 0.07, 0.07), at(0, 1.36, -0.32, 0, -0.12), '--ss-oak');
        for (var k = 0; k < 5; k++) part(new T.CylinderGeometry(0.014, 0.014, 0.84, 6), at(-0.2 + k * 0.1, 0.9, -0.27, 0, -0.12), '--ss-oak-dark');
        // The red quilted cushion, its stitches in her wool.
        part(new T.BoxGeometry(0.54, 0.09, 0.5), at(0, 0.52, 0.02), '--ss-quilt');
        for (k = 0; k < 4; k++) part(new T.BoxGeometry(0.008, 0.095, 0.48), at(-0.18 + k * 0.12, 0.52, 0.02), '--ss-wool');
        // The green pillow against the spindles.
        var pil = new T.SphereGeometry(0.22, 14, 10); pil.scale(1.1, 0.9, 0.42);
        part(pil, at(0, 0.82, -0.18, 0, -0.12), '--ss-quilt-alt');
        // The quilt over its back, falling behind it.
        part(new T.BoxGeometry(0.66, 0.66, 0.035), at(0, 1.08, -0.36, 0, -0.12), '--ss-quilt');
        for (k = 0; k < 3; k++) part(new T.BoxGeometry(0.64, 0.012, 0.04), at(0, 0.88 + k * 0.18, -0.355, 0, -0.12), '--ss-wool');
        part(new T.BoxGeometry(0.67, 0.05, 0.05), at(0, 1.4, -0.33), '--ss-quilt');
      }
      var CH = at(-2.5, 0, BACK + 2.6, 1.9);
      var still = [], rocked = [];
      chair(CH, still);
      chair(M(CH, M(at(0, RCK, 0), M(new T.Matrix4().makeRotationX(-0.16), at(0, -RCK, 0)))), rocked);
      rocked.forEach(function (m) { kit.hide(m, true); });
      var rock = kit.press({
        say: function () { return kit.hidden(rocked[0]) ? 'Rock the chair' : 'Let the chair come to rest'; },
        at: [kit.touch(0.9, 1.5, 0.9, M(CH, at(0, 0.75, 0)))],
        press: function () {
          var back = kit.hidden(rocked[0]);
          rocked.forEach(function (m) { kit.hide(m, !back); });
          still.forEach(function (m) { kit.hide(m, back); });
          return back ? 'The rocking chair tips back on its rockers by the fire. Rock as much or as little as you want; the chair keeps time so you don’t have to.'
                      : 'The rocking chair comes to rest, its quilt over its back.';
        } });

      // THE TABLE FOR ONE beside it: a round top on one turned leg, and a tall
      // glass of ice water once somebody asks for one.
      var T1 = at(-1.45, 0, BACK + 3.1);
      cyl(0.36, 0.36, 0.05, M(T1, at(0, 0.7, 0)), '--ss-rootbeer', 0.01, 20);
      cyl(0.05, 0.07, 0.66, M(T1, at(0, 0.36, 0)), '--ss-rootbeer', 0.008, 10);
      cyl(0.24, 0.26, 0.05, M(T1, at(0, 0.03, 0)), '--ss-rootbeer', 0.008, 16);
      var water = [];
      var glassG = new T.CylinderGeometry(0.055, 0.045, 0.22, 14, 1, true);
      var gl = kit.flat(glassG, M(T1, at(0.08, 0.84, 0.05)), '--ss-flame-core');
      gl.material.transparent = true; gl.material.opacity = 0.3; gl.material.depthWrite = false; gl.material.side = T.DoubleSide;
      water.push(gl);
      var wet = kit.flat(new T.CylinderGeometry(0.05, 0.045, 0.17, 14), M(T1, at(0.08, 0.815, 0.05)), '--ss-chalk');
      wet.material.transparent = true; wet.material.opacity = 0.4; wet.material.depthWrite = false;
      water.push(wet);
      [[0.06, 0.88, 0.04], [0.1, 0.86, 0.07], [0.08, 0.9, 0.03]].forEach(function (c) {
        water.push(kit.facets(new T.BoxGeometry(0.035, 0.035, 0.035), M(T1, at(c[0], c[1], c[2], c[0] * 9, c[1] * 7)), '--ss-chalk'));
      });
      water.forEach(function (m) { kit.hide(m, true); });
      var pour = kit.press({
        say: function () { return kit.hidden(water[0]) ? 'Ask for a tall glass of ice water' : 'Push the glass away'; },
        at: [kit.touch(0.8, 1.0, 0.8, M(T1, at(0, 0.5, 0)))],
        press: function () {
          var show = kit.hidden(water[0]);
          water.forEach(function (m) { kit.hide(m, !show); });
          return show ? 'A tall glass of ice water on the table for one. Free, and refilled before you notice it’s low.'
                      : 'The glass is taken away. Nobody will sit down here unless you wave them over.';
        } });

      // THE BIG TABLE, room for everybody who turns up, and chairs that do
      // not match because there is always another to drag over. On it the
      // covered bowl of pretzels with its scoop beside it.
      var BT = at(2.3, 0, BACK + 5.6, Math.PI / 2);
      box(2.6, 0.1, 1.1, M(BT, at(0, 0.78, 0)), '--ss-rootbeer', 0.015);
      [[-1.15, -0.45], [-1.15, 0.45], [1.15, -0.45], [1.15, 0.45]].forEach(function (p) { box(0.1, 0.74, 0.1, M(BT, at(p[0], 0.37, p[1])), '--ss-rootbeer', 0.01); });
      function seat(m, tall, ink) {
        box(0.44, 0.05, 0.42, M(m, at(0, 0.46, 0)), ink, 0.01);
        [[-0.18, -0.17], [-0.18, 0.17], [0.18, -0.17], [0.18, 0.17]].forEach(function (p) { box(0.04, 0.46, 0.04, M(m, at(p[0], 0.23, p[1])), ink, 0.006); });
        if (tall) {
          [-0.18, 0.18].forEach(function (x) { box(0.04, 0.5, 0.04, M(m, at(x, 0.72, -0.19)), ink, 0.006); });
          for (var k = 0; k < 3; k++) box(0.38, 0.05, 0.03, M(m, at(0, 0.6 + k * 0.14, -0.19)), ink, 0.006);
        }
      }
      [[-0.8, 0.8, 0, true, '--ss-oak'], [0.1, 0.85, 0.15, false, '--ss-oak-dark'], [0.85, 0.8, -0.1, true, '--ss-oak-dark'],
       [-0.6, -0.85, Math.PI, true, '--ss-oak-dark'], [0.55, -0.82, Math.PI + 0.2, true, '--ss-oak'], [1.6, 0, -Math.PI / 2, false, '--ss-oak']].forEach(function (c) {
        seat(M(BT, at(c[0], 0, c[1], c[2])), c[3], c[4]);
      });
      var bowl = new T.SphereGeometry(0.2, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
      kit.piece(bowl, M(BT, at(-0.3, 1.03, 0)), '--ss-oak', 0.008);
      var lid = new T.SphereGeometry(0.2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2); lid.scale(1, 0.55, 1);
      kit.piece(lid, M(BT, at(-0.3, 1.03, 0)), '--ss-brass', 0.008);
      kit.piece(new T.SphereGeometry(0.03, 8, 6), M(BT, at(-0.3, 1.15, 0)), '--ss-brass', false);
      box(0.05, 0.015, 0.22, M(BT, at(-0.02, 0.84, 0.05, 0.4)), '--ss-brass', 0.004);
      // A brown bottle of sarsaparilla, and a Shirley Temple with its cherries.
      cyl(0.045, 0.045, 0.22, M(BT, at(0.5, 0.94, -0.2)), '--ss-rootbeer', 0.006, 10);
      cyl(0.016, 0.03, 0.08, M(BT, at(0.5, 1.09, -0.2)), '--ss-rootbeer', 0.004, 8);
      var stem = M(BT, at(0.7, 0.83, 0.25));
      cyl(0.05, 0.05, 0.01, stem, '--ss-flame-core', false, 12);
      cyl(0.008, 0.008, 0.1, M(stem, at(0, 0.05, 0)), '--ss-flame-core', false, 6);
      var cone = new T.ConeGeometry(0.075, 0.12, 14); cone.rotateX(Math.PI);
      kit.piece(cone, M(stem, at(0, 0.16, 0)), '--ss-quilt', 0.004);
      [[0.02, 0.24, 0.01], [-0.03, 0.235, -0.02]].forEach(function (c) { kit.piece(new T.SphereGeometry(0.018, 8, 6), M(stem, at(c[0], c[1], c[2])), '--ss-quilt', false); });

      // THE PORCH SWING, hung from the rafters by the hearth on two ropes,
      // with a cushion, two pillows and a blanket over its front. Still, or
      // given a push and caught at the top of its swing.
      var SWL = H - 0.15 - 0.55;
      box(0.18, 0.2, 2.0, at(W / 2 - 1.1, H - 0.28, BACK + 2.6), '--ss-oak-dark', 0.015);
      function swing(P, list) {
        function part(geo, m, ink) { list.push(kit.facets(geo, M(P, m), ink)); }
        [-0.66, 0.66].forEach(function (x) {
          part(new T.CylinderGeometry(0.014, 0.014, SWL, 6), at(x, -SWL / 2, 0), '--ss-brass');
          part(new T.BoxGeometry(0.1, 0.05, 0.56), at(x * 1.04, -SWL + 0.28, 0), '--ss-oak');
          part(new T.BoxGeometry(0.06, 0.26, 0.06), at(x * 1.04, -SWL + 0.14, 0.22), '--ss-oak-dark');
        });
        part(new T.BoxGeometry(1.4, 0.07, 0.56), at(0, -SWL, 0), '--ss-oak');
        part(new T.BoxGeometry(1.36, 0.5, 0.05), at(0, -SWL + 0.3, -0.26), '--ss-oak-dark');
        for (var k = 0; k < 7; k++) part(new T.BoxGeometry(0.05, 0.46, 0.06), at(-0.54 + k * 0.18, -SWL + 0.3, -0.24), '--ss-oak');
        part(new T.BoxGeometry(1.42, 0.06, 0.08), at(0, -SWL + 0.56, -0.26), '--ss-oak');
        part(new T.BoxGeometry(1.26, 0.09, 0.5), at(0, -SWL + 0.08, 0.01), '--ss-quilt');
        [[-0.38, '--ss-quilt-alt'], [0.4, '--ss-quilt']].forEach(function (p) {
          var pl = new T.SphereGeometry(0.2, 14, 10); pl.scale(1.1, 0.9, 0.42);
          part(pl, at(p[0], -SWL + 0.3, -0.16, 0, -0.1), p[1]);
        });
        part(new T.BoxGeometry(0.36, 0.42, 0.03), at(0.05, -SWL - 0.12, 0.29, 0, 0.08), '--ss-quilt-alt');
        for (k = 0; k < 2; k++) part(new T.BoxGeometry(0.34, 0.012, 0.035), at(0.05, -SWL - 0.04 - k * 0.14, 0.3, 0, 0.08), '--ss-wool');
      }
      var SW = at(W / 2 - 1.1, H - 0.28, BACK + 2.6, LEFT + Math.PI);
      var hang = [], pushed = [];
      swing(SW, hang);
      swing(M(SW, new T.Matrix4().makeRotationX(0.24)), pushed);
      pushed.forEach(function (m) { kit.hide(m, true); });
      var push = kit.press({
        say: function () { return kit.hidden(pushed[0]) ? 'Give the swing a push' : 'Let the swing hang still'; },
        at: [kit.touch(1.6, 1.4, 1.0, M(SW, at(0, -SWL + 0.3, 0)))],
        press: function () {
          var go = kit.hidden(pushed[0]);
          pushed.forEach(function (m) { kit.hide(m, !go); });
          hang.forEach(function (m) { kit.hide(m, go); });
          return go ? 'The swing goes back on its ropes from the rafters. Feet up or feet down, still or swinging.'
                    : 'The swing hangs still by the hearth.';
        } });

      // THE SWINGING DOORS, half doors on their hinges, and the sign over
      // them on the inside, lettered in her Rye and her amber.
      [-1, 1].forEach(function (s) {
        var dm = at(s * DOORW / 4, 1.15, FRONT - 0.03, Math.PI);
        box(DOORW / 2 - 0.04, 1.0, 0.05, dm, '--ss-oak', 0.012);
        for (var k = 0; k < 5; k++) box(DOORW / 2 - 0.2, 0.05, 0.03, M(dm, at(0, -0.34 + k * 0.17, 0.03)), '--ss-oak-dark', false, false);
        var top = new T.CircleGeometry(DOORW / 4 - 0.02, 16, 0, Math.PI);
        kit.facets(top, M(dm, at(0, 0.5, 0)), '--ss-oak');
      });
      [-1, 1].forEach(function (s) { box(0.12, 2.3, 0.14, at(s * (DOORW / 2 + 0.06), 1.15, FRONT - 0.04), '--ss-rootbeer', 0.012); });
      var sign = kit.paper(1024, 256, function (g, w, h) {
        g.fillStyle = kit.ink('--ss-rootbeer'); g.fillRect(0, 0, w, h);
        g.strokeStyle = kit.ink('--ss-brass'); g.lineWidth = 8; g.strokeRect(12, 12, w - 24, h - 24);
        g.fillStyle = kit.ink('--ss-amber'); g.textAlign = 'center'; g.textBaseline = 'middle';
        var size = 120;
        do { g.font = size + 'px Rye'; size -= 4; } while (g.measureText('Spaceholder Saloon').width > w - 80);
        g.fillText('Spaceholder Saloon', w / 2, h / 2 + 6);
      });
      kit.sheet(sign, 2.4, 0.6, at(0, 2.75, FRONT - 0.06, Math.PI));

      // THE ROW OF HOOKS by the swinging doors, where whatever you walked in
      // carrying hangs as long as you like. One is filled when you hang it.
      var HK = at(-2.7, 1.75, FRONT - 0.04, Math.PI);
      box(1.8, 0.14, 0.05, HK, '--ss-rootbeer', 0.01);
      var hookX = [-0.66, -0.22, 0.22, 0.66];
      hookX.forEach(function (x) {
        cyl(0.018, 0.018, 0.16, M(HK, at(x, -0.06, 0.1, 0, Math.PI / 2)), '--ss-brass', false, 6);
        cyl(0.018, 0.018, 0.08, M(HK, at(x, -0.02, 0.17)), '--ss-brass', false, 6);
      });
      var hung = [];
      var shawl = new T.BoxGeometry(0.42, 0.7, 0.05);
      hung.push(kit.facets(shawl, M(HK, at(hookX[1], -0.42, 0.16, 0, 0.06)), '--ss-wool'));
      for (var hk = 0; hk < 3; hk++) hung.push(kit.facets(new T.BoxGeometry(0.4, 0.014, 0.056), M(HK, at(hookX[1], -0.62 + hk * 0.16, 0.165, 0, 0.06)), '--ss-quilt'));
      hung.push(kit.facets(new T.BoxGeometry(0.3, 0.26, 0.1), M(HK, at(hookX[2], -0.32, 0.17)), '--ss-oak-dark'));
      hung.push(kit.facets(new T.TorusGeometry(0.1, 0.012, 6, 16, Math.PI), M(HK, at(hookX[2], -0.18, 0.17)), '--ss-oak-dark'));
      hung.forEach(function (m) { kit.hide(m, true); });
      var hangUp = kit.press({
        say: function () { return kit.hidden(hung[0]) ? 'Hang up what you walked in carrying' : 'Take it back down'; },
        at: [kit.touch(1.8, 1.2, 0.5, M(HK, at(0, -0.4, 0.15)))],
        press: function () {
          var put = kit.hidden(hung[0]);
          hung.forEach(function (m) { kit.hide(m, !put); });
          return put ? 'You hang it up on the hooks by the swinging doors. Leave it there as long as you like; nothing you bring here is written down.'
                     : 'You take it back down off the hook. It was yours to take whenever you wanted.';
        } });

      // THE LAMPS' WICKS, low or turned up, and the fire, which breathes at
      // MAX as hers does and at any setting once somebody asks.
      var wicks = kit.choose({
        label: 'The oil lamps on the mantle',
        choices: ['Wicks turned low', 'Wicks turned up'],
        start: 1,
        pick: function (i) {
          lamps.forEach(function (l) { l.intensity = i ? LAMP_UP : LAMP_UP * 0.35; });
          return i ? 'The lamps on the mantle are turned up, and the walls warm round them.' : 'The lamps on the mantle are turned low, and the firelight does most of the work.';
        } });
      var breathe = kit.flames(flames, {
        say: 'Let the fire breathe', max: true,
        at: [kit.touch(1.5, 1.1, 0.9, at(0, 0.55, FZ + 0.1))],
        said: function (on) { return on ? 'The fire and the two lamp flames breathe, slowly.' : 'The fire and the lamps burn still.'; } });

      // HER OWN PAGE on the left wall, framed in her root beer wood, and her
      // menu board lifted off it onto the right wall by the door, chalk on
      // green-black in her own words.
      var pw = 2.5, ph = pw * 800 / 1180;
      var frame = kit.screen(1180, 800, pw, at(-W / 2 + 0.06, 1.75, BACK + 6.2, LEFT), 'The Spaceholder Saloon’s own page, on the wall');
      box(0.05, ph + 0.24, pw + 0.24, at(-W / 2 + 0.02, 1.75, BACK + 6.2), '--ss-rootbeer', false, false);
      var board = kit.lift(frame, '.ss-board', { w: 640, ww: 1.55, m: at(W / 2 - 0.08, 0.7, FRONT - 1.6, RIGHT) });

      var stops = [
        { name: 'inside the swinging doors, the fire at the far end', x: 0, z: 0.6, yaw: 0, pitch: 0.06 },
        { name: 'by the fire, the two oil lamps burning on the mantle', x: 0, z: BACK + 4.6, yaw: 0, pitch: 0.06, acts: [breathe, wicks] },
        { name: 'at the rocking chair, closest to the fire', x: -0.6, z: BACK + 5.4, yaw: 0.6, pitch: -0.14, acts: [rock] },
        { name: 'at the table for one', x: 0.3, z: BACK + 5.2, yaw: 0.69, pitch: -0.2, acts: [pour] },
        { name: 'at the swing hung from the rafters by the hearth', x: 0.6, z: BACK + 3.6, yaw: -1.23, pitch: -0.04, acts: [push] },
        { name: 'at the big table, room for everybody', x: -0.2, z: BACK + 7.4, yaw: -0.95, pitch: -0.2 },
        { name: 'at the hooks by the swinging doors', x: -2.7, z: -0.3, yaw: Math.PI, pitch: -0.04, acts: [hangUp] },
        { name: 'at the menu board by the door', x: W / 2 - 1.5, z: FRONT - 1.6, yaw: RIGHT, pitch: -0.08, frame: board.el },
        { name: 'at the wall with the saloon’s own page', x: -W / 2 + 2.5, z: BACK + 6.2, yaw: LEFT, pitch: 0.02, page: kit.page, frame: frame }
      ];

      return {
        start: { x: 0, z: 0.6, yaw: 0 },
        bounds: { x: [-W / 2 + 0.7, W / 2 - 0.7], z: [BACK + 2.1, FRONT - 0.6] },
        stops: stops
      };
    }
  };
})();

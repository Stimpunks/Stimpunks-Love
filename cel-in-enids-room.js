/* =============================================================================
   Enid's Room, walked into on Cel Street. Ryan's ask, 2026-10-31: down the
   street from the Zine Table, a room at a time.

   IT IS ENID'S ROOM'S WORLD AND NOBODY ELSE'S (§9): black walls, technicolour
   everything else. Somewhere to sit when you are not feeling any joy, dark,
   quiet and funny about it, so the room is lit only by the two glows the page
   has in its corners, violet high up on the far right and green low down by
   the door, with glow-in-the-dark stars stuck on the ceiling. The sticker wall
   runs down the left-hand wall, every sticker one of the page's own words in
   its own colour and face, stuck on at an angle (straight at Gentle, as on
   the page). The boombox stands on a low chest on the right, silent, and its
   panel off the page walks you to the jukebox. A bed against the far wall, a
   beanbag, a rug. The door you came in by stays shut behind you.

   THE POLAROID WALL IS NOT IN THE SCENE. Its photographs are people's, under
   consent records that name the pages they appear on, so nothing of it is
   lifted or drawn here and nobody is drawn at all: the photographs are seen
   only on the room's own page, which hangs on the far wall. Three of the
   page's panels are lifted off it, none with a photograph in it.

   NOTHING MOVES AND NOTHING MAKES A SOUND. Every colour is one love.css
   declares, by name. It keeps nothing, sends nothing and fetches nothing; its
   page arrives through Cel Street's screen(). tools/make-cel-street.py holds
   each of those.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 31, 374761393) ^ Math.imul(j + 7, 668265263) ^ Math.imul(k + 13, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['enids-room.html'] = {
    faces: ['"Bungee"', '"Special Elite"', '"Rock Salt"'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, W = 8, D = 9, H = 3.0, back = -D;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;

      // THE TWO GLOWS AND NOTHING ELSE: violet high on the far right, green low
      // by the door, the black walls taking almost none of it.
      kit.scene.background = kit.col('--ink');
      kit.scene.add(new T.HemisphereLight(kit.col('--ink-3'), kit.col('--ink'), 1.5));
      var violet = new T.PointLight(kit.col('--violet'), 7, 10, 1.4);
      violet.position.set(W / 2 - 0.8, H - 0.3, back + 0.8);
      var green = new T.PointLight(kit.col('--green'), 4, 8, 1.4);
      green.position.set(-W / 2 + 0.8, 0.5, -1.0);
      kit.scene.add(violet, green);

      // THE ROOM: black walls, a dark floor, the door shut behind you.
      box(W, 0.1, D + 0.4, at(0, -0.05, -D / 2), '--ink-2', false, false);
      box(0.3, H, D, at(-W / 2 - 0.15, H / 2, -D / 2), '--ink');
      box(0.3, H, D, at(W / 2 + 0.15, H / 2, -D / 2), '--ink');
      box(W + 0.6, H, 0.3, at(0, H / 2, back - 0.15), '--ink');
      box(W + 0.6, H, 0.3, at(0, H / 2, 0.15), '--ink');
      box(W + 0.6, 0.2, D + 0.6, at(0, H + 0.1, -D / 2), '--ink', false, false);
      box(1.1, 2.2, 0.08, at(-2.2, 1.1, -0.04), '--ink-2');
      kit.cyl(0.04, 0.04, 0.06, at(-1.8, 1.05, -0.12, 0, Math.PI / 2), '--ink-3', false, 8);

      // GLOW-IN-THE-DARK STARS stuck on the ceiling, in the room's yellow.
      for (var k = 0; k < 34; k++) {
        var st = new T.Shape();
        for (var p = 0; p < 10; p++) {
          var r = p % 2 ? 0.025 : 0.065, a = p * Math.PI / 5;
          if (p) st.lineTo(Math.cos(a) * r, Math.sin(a) * r); else st.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        kit.flat(new T.ShapeGeometry(st), at(-W / 2 + 0.4 + hash(k, 1, 1) * (W - 0.8), H - 0.005, -0.6 - hash(k, 1, 2) * (D - 1.2), 0, Math.PI / 2, hash(k, 1, 3) * 6), '--yellow');
      }

      // A ROUND RUG and a stripe of technicolour round its edge.
      kit.cyl(1.7, 1.7, 0.02, at(0, 0.01, -4.8), '--violet', false, 36);
      kit.cyl(1.45, 1.45, 0.022, at(0, 0.012, -4.8), '--ink-2', false, 36);

      // THE STICKER WALL down the left-hand wall: every sticker one of the
      // page's own words, in its own colour and its own face.
      var STICK = [
        { w: 'AUTISTIC', g: '--pink', f: '"Bungee"', round: true },
        { w: 'DISABLED', g: '--green', f: '"Bungee"' },
        { w: 'monotropic', g: '--yellow', f: '"Special Elite"', round: true },
        { w: 'QUEER', g: '--cyan', f: '"Bungee"' },
        { w: 'neuroqueer', g: '--violet', f: '"Rock Salt"', round: true },
        { w: 'STIMMING', g: '--orange', f: '"Bungee"' },
        { w: 'not a phase', g: '--red', f: '"Special Elite"', round: true, ink: '--cream' }
      ];
      var papers = STICK.map(function (s) {
        return kit.paper(320, 110, function (c, w, h) {
          c.fillStyle = kit.ink(s.g);
          var rr = s.round ? 46 : 12;
          c.beginPath();
          c.moveTo(rr, 0); c.lineTo(w - rr, 0); c.quadraticCurveTo(w, 0, w, rr); c.lineTo(w, h - rr);
          c.quadraticCurveTo(w, h, w - rr, h); c.lineTo(rr, h); c.quadraticCurveTo(0, h, 0, h - rr);
          c.lineTo(0, rr); c.quadraticCurveTo(0, 0, rr, 0); c.fill();
          c.fillStyle = kit.ink(s.ink || '--ink');
          c.textAlign = 'center'; c.textBaseline = 'middle';
          var size = s.f === '"Rock Salt"' ? 34 : 50;
          c.font = size + 'px ' + s.f;
          while (c.measureText(s.w).width > w - 40 && size > 20) { size -= 2; c.font = size + 'px ' + s.f; }
          c.fillText(s.w, w / 2, h / 2 + 2);
        });
      });
      var wallL = function (z, y, tilt) { return at(-W / 2 + 0.012, y, z, LEFT, 0, kit.gentle ? 0 : tilt); };
      // They keep clear of the page's own panel in the middle of them.
      for (k = 0; k < 60; k++) {
        var z = -1.6 - hash(k, 2, 1) * 5.6, y = 0.45 + hash(k, 2, 2) * 2.2;
        if (Math.abs(z + 4.4) < 1.35 && y > 0.6 && y < 2.1) continue;
        var sc = 0.75 + hash(k, 2, 3) * 0.5;
        kit.sheet(papers[k % papers.length], 0.6 * sc, 0.2 * sc, M(wallL(z, y, (hash(k, 2, 4) - 0.5) * 0.5), at(0, 0, k * 0.0004)));
      }

      // THE BOOMBOX on a low chest against the right-hand wall, its two cones,
      // its handle, and the page's own boombox panel on the wall over it.
      var bx = W / 2 - 0.45, bz = -3.0;
      box(0.8, 0.7, 1.5, at(bx, 0.35, bz), '--ink-2');
      box(0.02, 0.02, 1.3, at(bx - 0.41, 0.6, bz), '--ink-3', false);
      var bb = at(bx - 0.05, 0.7, bz, RIGHT);
      box(1.1, 0.5, 0.32, M(bb, at(0, 0.25, 0)), '--ink-3');
      [-0.3, 0.3].forEach(function (cx) {
        kit.cyl(0.17, 0.17, 0.03, M(bb, at(cx, 0.24, 0.17, 0, Math.PI / 2)), '--ink', 0.01, 22);
        kit.cyl(0.07, 0.07, 0.035, M(bb, at(cx, 0.24, 0.18, 0, Math.PI / 2)), '--ink-2', false, 16);
      });
      box(0.24, 0.12, 0.02, M(bb, at(0, 0.32, 0.17)), '--green', false);
      kit.cyl(0.025, 0.025, 0.8, M(bb, at(0, 0.62, 0, 0, 0, Math.PI / 2)), '--ink-3', 0.01, 8);
      [-0.4, 0.4].forEach(function (hx) { box(0.04, 0.14, 0.04, M(bb, at(hx, 0.55, 0)), '--ink-3', false); });

      // BED against the far wall on the left, a dark duvet and a violet pillow,
      // and a beanbag on the right in the room's pink.
      var bdx = -W / 2 + 0.85, bdz = back + 1.2;
      box(1.4, 0.36, 2.2, at(bdx, 0.18, bdz), '--ink-3');
      box(1.42, 0.14, 1.7, at(bdx, 0.43, bdz + 0.24), '--ink-2', 0.015);
      box(0.95, 0.16, 0.4, at(bdx, 0.46, bdz - 0.82), '--violet', 0.015);
      box(1.4, 0.8, 0.08, at(bdx, 0.4, back + 0.06), '--ink-2');
      kit.piece(new T.SphereGeometry(0.55, 16, 10), at(2.4, 0.34, back + 2.2, 0, 0, 0).multiply(new T.Matrix4().makeScale(1, 0.62, 1)), '--pink', 0.02);

      // THE ROOM'S OWN PAGE on the far wall, between the bed and the beanbag:
      // the polaroid wall is on it, and nowhere else in here.
      var pw = 3.0, ph = pw * 800 / 1180, py = 0.55 + ph / 2;
      box(pw + 0.14, ph + 0.14, 0.05, at(0.3, py, back + 0.02), '--green');
      var frame = kit.screen(1180, 800, pw, at(0.3, py, back + 0.06), 'Enid’s Room’s own page, on the far wall, with the polaroid wall on it');

      // The page's panels, lifted off it now that it is up: the sticker panel
      // in the middle of the stickers on the left (every sticker in it opens
      // its glossary entry, as on the page), the boombox, and why the room
      // exists. None has a photograph in it.
      var stickers = kit.lift(frame, '.panel', { n: 0, w: 520, ww: 1.9, m: wallL(-4.4, 0.75, 0) });
      var boombox = kit.lift(frame, '.panel.panel--pink', { w: 360, ww: 1.25, m: at(W / 2 - 0.012, 1.45, bz, RIGHT) });
      var why = kit.lift(frame, '.panel', { n: 1, w: 460, ww: 1.6, m: at(W / 2 - 0.012, 0.95, -6.3, RIGHT) });

      // THE DOOR TO THE POLAROID WALL, in the right-hand wall at the far end:
      // black like the walls, in a violet frame, and through it the wall the
      // page's own polaroids hang on, every frame empty in the scene.
      var PDZ = -7.75;
      box(0.06, 2.1, 0.9, at(W / 2 - 0.03, 1.05, PDZ), '--ink-2');
      box(0.08, 2.2, 0.06, at(W / 2 - 0.04, 1.1, PDZ - 0.48), '--violet', false);
      box(0.08, 2.2, 0.06, at(W / 2 - 0.04, 1.1, PDZ + 0.48), '--violet', false);
      box(0.08, 0.06, 1.02, at(W / 2 - 0.04, 2.21, PDZ), '--violet', false);
      kit.cyl(0.03, 0.03, 0.08, at(W / 2 - 0.09, 1.0, PDZ + 0.3, 0, 0, Math.PI / 2), '--ink-3', false, 8);

      return {
        start: { x: -0.6, z: -0.9, yaw: 0 },
        bounds: { x: [-W / 2 + 0.9, W / 2 - 0.9], z: [back + 1.4, -0.6] },
        stops: [
          { name: 'just inside the door, which stays shut if you want it shut', x: -0.6, z: -0.9, yaw: 0 },
          { name: 'at the sticker wall, every sticker a word from the glossary', x: -W / 2 + 2.5, z: -4.4, yaw: LEFT, frame: stickers.el },
          { name: 'at the boombox, silent until pressed', x: W / 2 - 2.4, z: bz, yaw: RIGHT, pitch: 0.02, frame: boombox.el },
          { name: 'at the wall that says why this room exists', x: W / 2 - 2.4, z: -6.3, yaw: RIGHT, frame: why.el },
          { name: 'on the rug in the middle, under the stars on the ceiling', x: 0, z: -4.8, yaw: 0, pitch: 0.5 },
          { name: 'at the far wall, with the room’s own page and its polaroid wall on it', x: 0.3, z: back + 3.4, yaw: 0, page: kit.page, frame: frame },
          { name: 'The Polaroid Wall', where: 'at the door in the right-hand wall, through to the Polaroid Wall', room: 'the Polaroid Wall', page: 'polaroids.html', x: W / 2 - 2.3, z: -7.5, yaw: RIGHT, pitch: 0.05 }
        ]
      };
    }
  };
})();

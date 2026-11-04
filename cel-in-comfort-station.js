/* =============================================================================
   The Comfort Station, walked into on Cel Street: one of the street's public
   restrooms, down the steps under the park (Ryan's brief, 2026-11-03).

   IT IS THE COMFORT STATION'S WORLD AND NOBODY ELSE'S (§138): a long hall one
   flight down, white glazed tile with a green band at the height of a hand, a
   terrazzo floor, brass and oak. THE LIGHT COMES THROUGH THE PAVEMENT: the
   ceiling is the underside of the path, an iron grid of glass prisms gone
   faintly violet with age, each a lit point, and the daylight lies on the
   floor in a grid of dots. There is no lamp and no rainbow: these prisms make
   dots, never spectra (the Dopamine Dress-Up Den's rainbows are on its wall).

   You come in at the foot of the steps, the lift beside them and the day at
   the top. Along the left wall: the naloxone cabinet, the basins under one
   long mirror with the step folded away under the lowest, the words on the
   wall, and the long bench with its cushions under the brightest dots. Along
   the right: the row of oak doors, each to the ceiling, each with its brass
   plate saying FREE or IN USE in words. At the far end, the room with the
   changing tables. The page's own words stand on enamel boards on the tile.

   NOTHING MOVES, at any setting. Every colour is one the room declares, by
   name. It keeps nothing, sends nothing and fetches nothing; its page arrives
   through Cel Street's screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['comfort-station.html'] = {
    name: 'The Comfort Station',
    faces: ['"Newsreader"', '"Atkinson Hyperlegible Next"'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var X = 4, Y = 3.4, Z0 = 1.2, Z1 = -24;         // the hall: half its width, its height, its two ends
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;

      // THE DAY, coming down through the pavement: an even light from above in
      // the glass's own white, and the floor's warmth back from below. Nothing
      // in the hall makes light of its own.
      kit.scene.background = kit.col('--cst-iron');
      kit.scene.add(new T.HemisphereLight(kit.col('--cst-glow'), kit.col('--cst-terrazzo'), 2.2));
      var day = new T.DirectionalLight(kit.col('--cst-glow'), 1.1);
      day.position.set(0.6, 20, -6);
      day.target.position.set(0, 0, -10);
      kit.scene.add(day, day.target);

      // THE FLOOR: terrazzo with its chips, and the daylight on it in a grid of
      // dots, brightest under the bench.
      box(2 * X, 0.1, Z0 - Z1, at(0, -0.05, (Z0 + Z1) / 2), '--cst-terrazzo', false, false);
      var CHIPS = ['--cst-chip-1', '--cst-chip-2', '--cst-chip-3'];
      for (var k = 0; k < 420; k++) {
        var cx = -X + 0.1 + ((k * 0.6180339) % 1) * (2 * X - 0.2), cz = Z0 - 0.1 - ((k * 0.3819660 * 7) % 1) * (Z0 - Z1 - 0.2);
        kit.flat(new T.CircleGeometry(0.018 + (k % 3) * 0.008, 5), at(cx, 0.004, cz, 0, -Math.PI / 2), CHIPS[k % 3]);
      }
      var DOT = 0.62;
      for (var dz = Z0 - 0.8; dz > Z1 + 0.4; dz -= DOT) {
        for (var dx = -X + 0.5; dx < X - 0.3; dx += DOT) {
          var bright = dx < -1.2 && dz < -13 && dz > -20;
          kit.flat(new T.CircleGeometry(bright ? 0.13 : 0.09, 10), at(dx, 0.008, dz, 0, -Math.PI / 2), '--cst-glow');
        }
      }

      // THE CEILING: the underside of the path, the iron grid and its prisms,
      // each a lit point.
      box(2 * X, 0.12, Z0 - Z1, at(0, Y + 0.06, (Z0 + Z1) / 2), '--cst-iron', false, false);
      for (var pz = Z0 - 0.5; pz > Z1 + 0.2; pz -= DOT) {
        for (var px = -X + 0.5; px < X - 0.3; px += DOT) {
          kit.flat(new T.CircleGeometry(0.11, 12), at(px, Y - 0.002, pz, 0, Math.PI / 2), '--cst-prism');
          kit.flat(new T.CircleGeometry(0.05, 10), at(px, Y - 0.004, pz, 0, Math.PI / 2), '--cst-glow');
        }
      }

      // THE WALLS: white glazed tile, its grout, the green band at the height
      // of a hand and the green cove under the ceiling.
      function wall(m, len) {
        box(len, Y, 0.12, M(m, at(0, Y / 2, -0.06)), '--cst-tile', false, false);
        for (var gy = 0.16; gy < Y; gy += 0.16) box(len, 0.012, 0.004, M(m, at(0, gy, 0.001)), '--cst-grout', false, false);
        box(len, 0.14, 0.03, M(m, at(0, 1.1, 0.01)), '--cst-trim', false, false);
        box(len, 0.1, 0.03, M(m, at(0, Y - 0.06, 0.01)), '--cst-trim', false, false);
        box(len, 0.12, 0.04, M(m, at(0, 0.06, 0.01)), '--cst-trim', false, false);
      }
      var L = Z0 - Z1, MID = (Z0 + Z1) / 2;
      wall(at(-X, 0, MID, LEFT), L);
      wall(at(X, 0, MID, RIGHT), L);
      wall(at(0, 0, Z1, 0), 2 * X);

      // THE STEPS behind you, going up to the day, with their brass rail, and
      // the lift beside them with its brass doors.
      for (var s = 0; s < 10; s++) {
        box(2.6, 0.18, 0.32, at(-1.2, 0.09 + s * 0.18, Z0 + 0.16 + s * 0.32), '--cst-terrazzo', 0.012);
      }
      box(2.6, 0.04, 4, at(-1.2, Y + 0.3, Z0 + 2.4), '--cst-daylight', false, false);
      kit.flat(new T.PlaneGeometry(2.6, 3), at(-1.2, Y + 1.2, Z0 + 3.6, Math.PI), '--cst-daylight');
      kit.cyl(0.03, 0.03, 4.0, at(-2.6, 1.95, Z0 + 1.7, 0, -1.02), '--cst-brass', false, 8);
      var lift = at(1.9, 0, Z0 - 0.02, Math.PI);
      box(1.5, 2.3, 0.08, M(lift, at(0, 1.15, 0)), '--cst-brass', 0.02);
      box(0.02, 2.3, 0.1, M(lift, at(0, 1.15, 0)), '--cst-ink', false);
      box(1.7, 0.3, 0.1, M(lift, at(0, 2.5, 0)), '--cst-trim', 0.015);
      kit.cyl(0.07, 0.07, 0.04, M(lift, at(-1.05, 1.0, 0.02, 0, Math.PI / 2)), '--cst-brass', 0.01, 16);

      // An enamel plate, white letters on the tile's own green.
      function plate(words, w, h, m, ground) {
        var tex = kit.paper(Math.round(512 * w / h), 512, function (c, pw, ph) {
          c.fillStyle = kit.ink(ground || '--cst-trim'); c.fillRect(0, 0, pw, ph);
          c.strokeStyle = kit.ink('--cst-brass'); c.lineWidth = ph * 0.05; c.strokeRect(ph * 0.04, ph * 0.04, pw - ph * 0.08, ph * 0.08 * 0 + ph - ph * 0.08);
          c.fillStyle = kit.ink('--cst-glow'); c.textAlign = 'center'; c.textBaseline = 'middle';
          var size = ph * 0.52;
          do { c.font = '700 ' + size + 'px "Atkinson Hyperlegible Next"'; size -= 4; } while (c.measureText(words).width > pw * 0.86 && size > 12);
          c.fillText(words, pw / 2, ph / 2 + ph * 0.03);
        });
        kit.sheet(tex, w, h, m);
      }
      plate('COMFORT STATION', 2.4, 0.42, at(-1.2, Y - 0.2, Z0 - 0.02, Math.PI));
      plate('LIFT', 1.0, 0.24, M(lift, at(0, 2.5, 0.06)));

      // ALONG THE LEFT WALL. The naloxone cabinet first, glass-fronted and never
      // locked, its plate over it.
      var lw = function (z, y) { return at(-X + 0.02, y || 0, z, LEFT); };
      box(0.6, 0.75, 0.18, M(lw(-1.6), at(0, 1.55, 0.09)), '--cst-brass', 0.015);
      box(0.5, 0.65, 0.02, M(lw(-1.6), at(0, 1.55, 0.19)), '--cst-glow', false);
      box(0.32, 0.26, 0.08, M(lw(-1.6), at(0, 1.45, 0.14)), '--cst-panel', 0.01);
      plate('NALOXONE', 0.8, 0.18, M(lw(-1.6), at(0, 2.08, 0.04)));

      // The basins under one long mirror, a brass tap each, the towel box, the
      // glass bowl of condoms on the shelf, and the step under the lowest.
      box(4.6, 1.3, 0.04, M(lw(-6.4), at(0, 1.95, 0.02)), '--cst-brass', 0.015);
      box(4.4, 1.15, 0.02, M(lw(-6.4), at(0, 1.95, 0.05)), '--cst-glow', false);
      box(4.4, 0.06, 0.22, M(lw(-6.4), at(0, 1.25, 0.11)), '--cst-tile', 0.012);
      [-1.6, 0, 1.6].forEach(function (o, i) {
        var top = i === 0 ? 0.72 : 0.86;
        var bowl = new T.CylinderGeometry(0.3, 0.22, 0.2, 16, 1);
        bowl.scale(1, 1, 0.7);
        kit.piece(bowl, M(lw(-6.4 + o), at(0, top, 0.32)), '--cst-glow', 0.012);
        kit.cyl(0.07, 0.07, top - 0.1, M(lw(-6.4 + o), at(0, (top - 0.1) / 2, 0.32)), '--cst-glow', 0.01, 10);
        kit.cyl(0.02, 0.02, 0.25, M(lw(-6.4 + o), at(0, top + 0.2, 0.12)), '--cst-brass', false, 8);
        box(0.16, 0.03, 0.03, M(lw(-6.4 + o), at(0, top + 0.32, 0.2)), '--cst-brass', false);
      });
      // The Step 'n Wash, folded away under the lowest basin.
      box(0.42, 0.34, 0.03, M(lw(-8.0), at(0, 0.2, 0.36)), '--cst-brass', 0.01);
      box(0.3, 0.42, 0.18, M(lw(-3.6), at(0, 1.65, 0.1)), '--cst-oak', 0.012);
      kit.cyl(0.11, 0.09, 0.1, M(lw(-4.4), at(0, 1.33, 0.12)), '--cst-prism', 0.008, 14);
      plate('SOAP · WATER · TOWELS', 2.0, 0.2, M(lw(-6.4), at(0, 2.82, 0.04)));

      // The words on the wall, past the basins, on an enamel board.
      function board(m, w, h) {
        box(w + 0.14, h + 0.14, 0.04, M(m, at(0, h / 2, -0.01)), '--cst-trim', 0.012);
        box(w, h, 0.02, M(m, at(0, h / 2, 0.012)), '--cst-tile', false);
      }

      // The long bench with its cushions, under the brightest dots.
      var bench = lw(-16.5);
      box(5.2, 0.08, 0.55, M(bench, at(0, 0.46, 0.3)), '--cst-oak', 0.015);
      [-2.3, 0, 2.3].forEach(function (o) { box(0.1, 0.44, 0.48, M(bench, at(o, 0.22, 0.3)), '--cst-oak', 0.012); });
      [-1.8, -0.6, 0.6, 1.8].forEach(function (o) {
        var cush = new T.BoxGeometry(1.05, 0.16, 0.5, 2, 1, 2);
        kit.piece(cush, M(bench, at(o, 0.58, 0.3)), '--cst-prism', 0.012);
      });
      plate('SIT AS LONG AS YOU LIKE', 2.4, 0.22, M(bench, at(0, 2.85, 0.04)));

      // ALONG THE RIGHT WALL: the row of oak doors, each from the floor to the
      // ceiling, each with its brass plate saying FREE or IN USE in words, a
      // shelf and a hook just inside it, and a brass handle.
      var DOORW = 1.32, first = -1.8;
      var stalls = [];
      for (var d = 0; d < 11; d++) {
        var zc = first - d * (DOORW + 0.08);
        if (zc < Z1 + 1.2) break;
        var used = d === 1 || d === 4 || d === 8;
        var g = at(X - 0.02, 0, zc, RIGHT);
        box(DOORW, Y - 0.25, 0.08, M(g, at(0, (Y - 0.25) / 2 + 0.05, 0.04)), '--cst-oak', 0.015);
        box(DOORW - 0.3, 1.0, 0.02, M(g, at(0, 2.0, 0.09)), '--cst-oak', 0.008);
        box(DOORW - 0.3, 1.0, 0.02, M(g, at(0, 0.8, 0.09)), '--cst-oak', 0.008);
        kit.cyl(0.04, 0.04, 0.05, M(g, at(DOORW / 2 - 0.16, 1.25, 0.11, 0, Math.PI / 2)), '--cst-brass', false, 10);
        box(0.06, Y, 0.1, M(g, at(DOORW / 2 + 0.04, Y / 2, 0.05)), '--cst-brass', false);
        plate(used ? 'IN USE' : 'FREE', 0.92, 0.22, M(g, at(0, Y - 0.42, 0.1)), used ? '--cst-inuse' : '--cst-trim');
        stalls.push(zc);
      }

      // AT THE FAR END: the room with the changing tables, its door open, and
      // the table that folds down for a baby folded up on the tile inside.
      var end = at(0, 0, Z1 + 0.02, 0);
      box(1.6, 2.6, 0.06, M(end, at(-2.2, 1.3, 0.03)), '--cst-oak', 0.015);
      box(1.3, 2.3, 0.02, M(end, at(-2.2, 1.15, 0.07)), '--cst-iron', false);
      plate('CHANGING TABLES · HOIST', 1.9, 0.22, M(end, at(-2.2, 2.9, 0.05)));

      // THE PAGE'S OWN WORDS on enamel boards: the opening by the steps, the
      // light by the cabinet, the words on the wall by the basins, the list at
      // the far end, and the house rules opposite the bench.
      var pw = 2.8, ph = pw * 800 / 1180;
      board(M(end, at(1.6, 0.6, 0.02)), pw, ph);
      var page = kit.screen(1180, 800, pw, M(end, at(1.6, 0.6 + ph / 2, 0.04)), 'The Comfort Station’s own page, on an enamel board at the far end of the hall');

      board(lw(-1.6 + 1.6, 0.4), 1.8, 2.4);
      var lede = kit.lift(page, '.cst-lede', { w: 640, ww: 1.75, h: 820, bare: true, m: lw(0.02, 0.45) });
      board(lw(-11.0, 0.4), 2.6, 2.6);
      var words = kit.lift(page, '.cst-part', { n: 3, w: 720, h: 760, ww: 2.5, bare: true, m: lw(-11.0, 0.45) });
      board(lw(-20.6, 0.4), 2.4, 2.6);
      var light = kit.lift(page, '.cst-part', { n: 1, w: 680, h: 760, ww: 2.3, bare: true, m: lw(-20.6, 0.45) });
      var rw = function (z, y) { return at(X - 0.02, y || 0, z, RIGHT); };
      board(rw(-18.9, 0.4), 2.7, 2.6);
      var has = kit.lift(page, '.cst-part', { n: 2, w: 900, h: 800, ww: 2.6, bare: true, m: rw(-18.9, 0.45) });
      board(rw(-22.2, 0.4), 2.2, 2.4);
      var rules = kit.lift(page, '.cst-part', { n: 4, w: 640, h: 760, ww: 2.1, bare: true, m: rw(-22.2, 0.45) });

      var stops = [
        { name: 'at the foot of the steps', where: 'at the foot of the steps, the hall going away from you under the prisms', x: 0, z: -0.4, yaw: 0, pitch: 0.06 },
        { name: 'at the lift beside the steps', where: 'at the lift beside the steps, its brass doors shut', x: 1.9, z: -1.6, yaw: Math.PI, pitch: 0.08 },
        { name: 'at the opening by the steps', where: 'at the enamel board by the steps, where the room says what it is', x: -X + 2.2, z: 0.0, yaw: LEFT, pitch: 0.12, frame: lede.el },
        { name: 'at the naloxone cabinet', where: 'at the naloxone cabinet at the foot of the steps, never locked', x: -X + 1.6, z: -1.6, yaw: LEFT, pitch: 0.08 },
        { name: 'at the basins', where: 'at the basins under the long mirror, the step folded away under the lowest', x: -X + 2.4, z: -6.4, yaw: LEFT, pitch: 0.02 },
        { name: 'at the words on the wall', where: 'at the words on the wall past the basins', x: -X + 2.4, z: -11.0, yaw: LEFT, pitch: 0.12, frame: words.el },
        { name: 'on the bench', where: 'at the long bench with its cushions, under the brightest dots', x: -X + 2.6, z: -16.5, yaw: LEFT, pitch: -0.05 },
        { name: 'at the board on the light', where: 'at the enamel board saying where the light comes from', x: -X + 2.4, z: -20.6, yaw: LEFT, pitch: 0.12, frame: light.el },
        { name: 'at the row of doors', where: 'at the row of oak doors, each saying FREE or IN USE over it', x: -0.4, z: stalls[Math.floor(stalls.length / 2)], yaw: RIGHT, pitch: 0.1 },
        { name: 'at what every stall down here has', where: 'past the last door, at what every restroom on the street has', x: X - 2.4, z: -18.9, yaw: RIGHT, pitch: 0.12, frame: has.el },
        { name: 'at the house rules', where: 'at the house rules on the wall past the last door', x: X - 2.3, z: -22.2, yaw: RIGHT, pitch: 0.12, frame: rules.el },
        { name: 'at the room with the changing tables', where: 'at the open door of the room with the changing tables', x: -2.2, z: Z1 + 3.4, yaw: 0, pitch: 0.06 },
        { name: 'at the room’s own page', where: 'at the room’s own page, on an enamel board at the far end of the hall', x: 1.6, z: Z1 + 3.0, yaw: 0, pitch: 0.06, page: kit.page, frame: page },
        { name: 'looking up at the prisms', where: 'looking up at the ceiling, a grid of glass prisms in the path, each a lit point', x: 0, z: -9, yaw: 0, pitch: 0.75 }
      ];

      return {
        start: { x: 0, z: -0.4, yaw: 0 },
        bounds: { x: [-X + 0.9, X - 0.9], z: [Z1 + 1.6, 0.4] },
        stops: stops
      };
    }
  };
})();

/* =============================================================================
   Brighter Days Solar Farm, walked into on Cel Street, north of the stile in
   Nature's Contribution. Ryan's ask, 2026-11-03: the land's places.

   IT IS THE FARM'S OWN WORLD (§106): NOON, SHARED. The sun is straight
   overhead, so every shadow lies straight under the thing that makes it, and
   the panels take the top of the light: a hard white line along the top edge
   of every row (--bds-glint, drawn unlit so it is the brightest thing in the
   field), and straight under every row the shade the peppers live in
   (--bds-shade, laid exactly on the row's footprint and nowhere else). The
   panels are on posts high enough to walk under, tilted to the south, cool
   deep glass with the cells' hairline grid in it. Under the first row the
   chiltepin, under the second the jalapeños, under the third the cherry
   tomatoes in their cages and the basil; the farm's sheep graze in the sun
   between the rows, and the battery shed stands at the far end with its
   screen. The rows are the page's drawing, walked into.

   THE COLLISIONS ARE §106's: the Solarpunk Hermitage is the other solar place,
   a pale landscape under a low morning sun with the shadows falling sideways;
   here it is noon from straight above and the glass is cool and deep. If the
   shadows ever fall sideways in here it has become the Hermitage with a field.

   NOTHING SAYS HOW MUCH SHADE. No number about the shade or the peppers is
   written in this file: every word about them is the page's own, lifted off
   it onto a board at the end of its row, so the shade the drawing shows is a
   shape and never a percentage.

   NOTHING MOVES, at any setting. The rack's films play through rack.js, which
   the page loads itself, and nothing loads until somebody presses. Every
   colour is one §106 declares, by name. It keeps nothing, sends nothing and
   fetches nothing; its page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  // A fixed scatter, the same every build.
  function hash(i, j, k) {
    var n = Math.imul(i + 7, 374761393) ^ Math.imul(j + 29, 668265263) ^ Math.imul(k + 31, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['brighter-days.html'] = {
    name: 'Brighter Days Solar Farm',
    from: 'natures-contribution.html',
    faces: ['"Anybody"'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var HALF = 13;                         // half the length of a row
      var TILT = 0.44, DEPTH = 3.0, YC = 3.3; // the panels' tilt, depth and height
      var ROWS = [{ z: -5, crop: 'chiltepin' }, { z: -11, crop: 'jalapeno' }, { z: -17, crop: 'tomato' }];
      var FOOT = DEPTH * Math.cos(TILT);     // the row's footprint, which is its shade
      var SHED = { x: 4.2, z: -24.6 };

      // NOON. The clear sky, a fill from the sky and the soil, and the sun
      // straight overhead throwing every shadow straight down.
      kit.scene.background = kit.col('--bds-sky');
      kit.scene.add(new T.HemisphereLight(kit.col('--bds-sky-high'), kit.col('--bds-soil'), 1.5));
      var sun = new T.DirectionalLight(kit.col('--bds-glint'), 2.2);
      sun.position.set(0.001, 50, -10.001);
      sun.target.position.set(0, 0, -10);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      sun.shadow.camera.left = -22; sun.shadow.camera.right = 22;
      sun.shadow.camera.top = 22; sun.shadow.camera.bottom = -22;
      sun.shadow.camera.near = 1; sun.shadow.camera.far = 80;
      sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
      kit.scene.add(sun, sun.target);
      // The sun itself, small and white, straight up.
      kit.flat(new T.CircleGeometry(5, 32), at(0, 160, -12, 0, Math.PI / 2), '--bds-glint');

      // THE SOIL, and the field running on past the rows.
      box(90, 0.1, 90, at(0, -0.05, -14), '--bds-soil', false, false);

      // THE ROWS. Each is one long table of panels on a line of posts, tilted
      // to the south: deep glass in a pale frame, the cells' hairlines in it,
      // the sun along its top edge, and the shade laid straight under it.
      ROWS.forEach(function (r) {
        var g = at(0, YC, r.z, 0, TILT);
        box(HALF * 2, 0.08, DEPTH, g, '--bds-pv', 0.012);
        box(HALF * 2 + 0.1, 0.1, 0.08, M(g, at(0, 0, DEPTH / 2)), '--bds-frame', false);
        [-1, 1].forEach(function (e) { box(0.08, 0.1, DEPTH, M(g, at(e * HALF, 0, 0)), '--bds-frame', false); });
        for (var x = -HALF + 1.3; x < HALF; x += 1.3) kit.piece(new T.BoxGeometry(0.03, 0.01, DEPTH - 0.1), M(g, at(x, 0.046, 0)), '--bds-cell', false);
        kit.piece(new T.BoxGeometry(HALF * 2 - 0.1, 0.01, 0.03), M(g, at(0, 0.046, 0)), '--bds-cell', false);
        // The hard white line of sun along the top edge.
        kit.flat(new T.BoxGeometry(HALF * 2 + 0.1, 0.1, 0.07), M(g, at(0, 0.01, -DEPTH / 2 - 0.035)), '--bds-glint');
        // The posts, high enough to walk under; none in the middle of the walk.
        [-12, -7.6, -3.2, 3.2, 7.6, 12].forEach(function (px) {
          cyl(0.08, 0.1, YC, at(px, YC / 2, r.z), '--bds-post', 0.01, 8);
        });
        box(HALF * 2, 0.08, 0.08, at(0, YC - 0.12, r.z), '--bds-post', false);
        // The shade, straight under the row and exactly its footprint.
        kit.flat(new T.PlaneGeometry(HALF * 2, FOOT), at(0, 0.006, r.z, 0, -Math.PI / 2), '--bds-shade');
      });

      // WHAT GROWS IN THE SHADE, two lines of it under every row, the walk
      // down the middle left clear.
      var bush = new T.SphereGeometry(1, 10, 8);
      function plants(r, i) {
        for (var line = 0; line < 2; line++) {
          var lz = r.z + (line ? 0.55 : -0.55);
          for (var x = -12.4; x <= 12.4; x += 1.15) {
            if (Math.abs(x) < 1.3) continue;
            var px = x + (hash(i * 3 + line, Math.round(x * 10), 1) - 0.5) * 0.3;
            var s = 0.85 + hash(i, Math.round(x * 10), line + 2) * 0.3, k;
            if (r.crop === 'chiltepin') {
              var g1 = bush.clone(); g1.scale(0.34 * s, 0.3 * s, 0.32 * s);
              kit.piece(g1, at(px, 0.32 * s, lz), '--bds-leaf', 0.01);
              for (k = 0; k < 7; k++) {
                kit.piece(new T.ConeGeometry(0.025, 0.09, 5), at(px + (hash(k, i, x * 10) - 0.5) * 0.5 * s, 0.2 + hash(k, line, x * 7) * 0.32 * s, lz + (hash(k, x * 3, 4) - 0.5) * 0.46 * s, 0, Math.PI), '--bds-chiltepin', false);
              }
            } else if (r.crop === 'jalapeno') {
              cyl(0.02, 0.025, 0.3, at(px, 0.15, lz), '--bds-leaf-dark', false, 5);
              var g2 = bush.clone(); g2.scale(0.36 * s, 0.34 * s, 0.34 * s);
              kit.piece(g2, at(px, 0.48 * s, lz), '--bds-leaf', 0.01);
              for (k = 0; k < 5; k++) {
                cyl(0.035, 0.022, 0.16, at(px + (hash(k, i, x * 10) - 0.5) * 0.5 * s, 0.22 + hash(k, line, x * 7) * 0.22, lz + (hash(k, x * 3, 4) - 0.5) * 0.5 * s), '--bds-jalapeno', false, 6);
              }
            } else if (line === 0) {
              // Cherry tomatoes in their cages, on the south line.
              [-0.18, 0.18].forEach(function (cx) { [-0.18, 0.18].forEach(function (cz) { box(0.02, 1.2, 0.02, at(px + cx, 0.6, lz + cz), '--bds-post', false); }); });
              [0.45, 0.85].forEach(function (cy) { box(0.4, 0.02, 0.4, at(px, cy, lz), '--bds-post', false); });
              var g3 = bush.clone(); g3.scale(0.22, 0.5, 0.22);
              kit.piece(g3, at(px, 0.62, lz), '--bds-leaf', 0.01);
              for (k = 0; k < 8; k++) {
                kit.piece(new T.SphereGeometry(0.045, 8, 6), at(px + (hash(k, i, x * 10) - 0.5) * 0.36, 0.25 + hash(k, line, x * 7) * 0.8, lz + (hash(k, x * 3, 4) - 0.5) * 0.36), '--bds-tomato', false);
              }
            } else {
              // Basil, low and leafy, on the north line.
              for (k = 0; k < 3; k++) {
                var g4 = bush.clone(); g4.scale(0.16, 0.12, 0.16);
                kit.piece(g4, at(px + (k - 1) * 0.16, 0.12 + (k % 2) * 0.06, lz + (k % 2 ? 0.08 : -0.06)), '--bds-basil', 0.008);
              }
            }
          }
        }
      }
      ROWS.forEach(plants);

      // THE SHEEP, in the sun between the rows, grazing, heads down.
      function sheep(x, z, ry) {
        var g = at(x, 0, z, ry);
        var body = bush.clone(); body.scale(0.58, 0.4, 0.38);
        kit.piece(body, M(g, at(0, 0.66, 0)), '--bds-fleece', 0.014);
        var head = bush.clone(); head.scale(0.16, 0.14, 0.13);
        kit.piece(head, M(g, at(0.62, 0.38, 0, 0, 0, 0.5)), '--bds-face', 0.01);
        [-0.32, 0.3].forEach(function (lx) { [-0.18, 0.18].forEach(function (lz) { cyl(0.035, 0.035, 0.42, M(g, at(lx, 0.21, lz)), '--bds-face', false, 6); }); });
        [-0.08, 0.08].forEach(function (ez) { box(0.08, 0.03, 0.12, M(g, at(0.6, 0.48, ez * 1.6, ez > 0 ? 0.6 : -0.6)), '--bds-face', false); });
      }
      sheep(-5.2, -8.0, 0.3);
      sheep(5.6, -8.3, 2.6);
      sheep(8.2, -14.1, -0.4);
      sheep(-9.0, -14.4, 3.4);

      // THE BATTERY SHED at the far end, pale with a pale roof, the line from
      // the last row's post running in to it.
      box(4.4, 2.6, 3.0, at(SHED.x, 1.3, SHED.z), '--bds-battery', 0.014);
      [-1, 1].forEach(function (e) { box(2.6, 0.12, 3.4, at(SHED.x + e * 1.1, 2.95, SHED.z, 0, 0, -e * 0.42), '--bds-frame', 0.01); });
      box(0.06, 0.4, 3.0, at(SHED.x, 3.4, SHED.z), '--bds-frame', false);
      var wire = new T.CylinderGeometry(0.02, 0.02, 1, 5);
      var from = new T.Vector3(7.6, YC - 0.2, ROWS[2].z), to = new T.Vector3(SHED.x + 2.2, 2.3, SHED.z + 0.4);
      var span = to.clone().sub(from), mid = from.clone().add(to).multiplyScalar(0.5);
      wire.scale(1, span.length(), 1);
      wire.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), span.clone().normalize()));
      kit.piece(wire, at(mid.x, mid.y, mid.z), '--bds-wire', false);

      // THE NAME, hung under the first row's low edge over the walk: the wide
      // sign letter in the sun's own yellow on the glass.
      var nameMap = kit.paper(1200, 220, function (c, w, h) {
        c.fillStyle = kit.ink('--bds-glass'); c.fillRect(0, 0, w, h);
        c.strokeStyle = kit.ink('--bds-frame'); c.lineWidth = 8; c.strokeRect(6, 6, w - 12, h - 12);
        c.fillStyle = kit.ink('--bds-sun'); c.textAlign = 'center'; c.textBaseline = 'middle';
        var size = 120;
        c.font = '800 ' + size + 'px "Anybody"';
        while (c.measureText('Brighter Days Solar Farm').width > w - 80 && size > 40) { size -= 4; c.font = '800 ' + size + 'px "Anybody"'; }
        c.fillText('Brighter Days Solar Farm', w / 2, h / 2 + 6);
      });
      var lowEdge = { y: YC - DEPTH / 2 * Math.sin(TILT), z: ROWS[0].z + DEPTH / 2 * Math.cos(TILT) };
      kit.sheet(nameMap, 3.4, 0.62, at(0, lowEdge.y - 0.55, lowEdge.z - 0.02));
      [-1.5, 1.5].forEach(function (wx) { box(0.015, 0.25, 0.015, at(wx, lowEdge.y - 0.12, lowEdge.z - 0.02), '--bds-post', false); });

      // BOARDS for the page's words: a pale frame on two posts, the words
      // standing on its ledge. A board shows its words only while you stand
      // at it, so the rows are clear from everywhere else.
      function zone(x, z) { return [x - 2.6, x + 2.6, z - 2.4, z + 2.4]; }
      function board(x, z, ry, wide, tall, low) {
        var g = at(x, 0, z, ry);
        [-1, 1].forEach(function (e) { box(0.1, low + tall, 0.1, M(g, at(e * (wide / 2 + 0.06), (low + tall) / 2, -0.06)), '--bds-post', 0.008); });
        box(wide + 0.2, tall + 0.1, 0.05, M(g, at(0, low + tall / 2, -0.05)), '--bds-frame', 0.008);
        return M(g, at(0, low, 0.01));
      }

      // THE ROOM'S OWN PAGE, on a board on the right where you come in.
      var pw = 2.6, ph = pw * 800 / 1180, py = 0.8 + ph / 2;
      var pg = at(5.2, 0, -0.4, RIGHT);
      box(pw + 0.2, ph + 0.2, 0.06, M(pg, at(0, py, -0.05)), '--bds-frame', 0.01);
      [-1, 1].forEach(function (e) { box(0.1, py + ph / 2, 0.1, M(pg, at(e * (pw / 2 + 0.06), (py + ph / 2) / 2, -0.1)), '--bds-post', 0.008); });
      var page = kit.screen(1180, 800, pw, M(pg, at(0, py, 0)), 'Brighter Days Solar Farm’s own page, on a board where you come in', zone(3.2, -0.4));

      // WHERE YOU COME IN, on the left: what this is, and the zine's line.
      var lede = kit.lift(page, '.bds-lede', { w: 760, h: 760, ww: 1.9, m: board(-5.2, -0.4, LEFT, 2.0, 1.9, 0.6), zone: zone(-3.2, -0.4) });
      var host = kit.lift(page, '.bds-quote', { n: 0, w: 640, ww: 1.5, m: board(-5.2, 2.2, LEFT, 1.6, 1.0, 0.8), zone: zone(-3.2, 2.2) });

      // AT THE END OF EVERY ROW, by the walk and in its shade: the page's own
      // card for what grows there, low enough to read under the panels.
      var crops = [
        { n: 0, x: -1.75, z: ROWS[0].z + 0.2, ry: LEFT },
        { n: 1, x: -1.75, z: ROWS[1].z + 0.2, ry: LEFT },
        { n: 2, x: -1.75, z: ROWS[2].z + 0.2, ry: LEFT },
        { n: 3, x: 1.75, z: ROWS[2].z + 0.2, ry: RIGHT }
      ].map(function (c) {
        var it = kit.lift(page, '.bds-crop', { n: c.n, w: 560, ww: 1.15, m: board(c.x, c.z, c.ry, 1.2, 1.15, 0.45), zone: zone(0, c.z) });
        it.at = c;
        return it;
      });

      // IN THE SUN BETWEEN THE ROWS, either side of the walk: why the peppers
      // like it, who else is under the panels, the power, and the farm's
      // rules.
      var GAP1 = (ROWS[0].z + ROWS[1].z) / 2, GAP2 = (ROWS[1].z + ROWS[2].z) / 2;
      var why = kit.lift(page, '.bds-part', { n: 1, w: 760, h: 780, ww: 1.9, m: board(-2.6, GAP1, LEFT, 2.0, 1.95, 0.5), zone: zone(-0.6, GAP1) });
      var share = kit.lift(page, '.bds-part', { n: 3, w: 760, h: 780, ww: 1.9, m: board(2.6, GAP1, RIGHT, 2.0, 1.95, 0.5), zone: zone(0.6, GAP1) });
      var power = kit.lift(page, '.bds-part', { n: 4, w: 760, h: 780, ww: 1.9, m: board(-2.6, GAP2, LEFT, 2.0, 1.95, 0.5), zone: zone(-0.6, GAP2) });
      var rules = kit.lift(page, '.bds-rules', { w: 720, ww: 1.8, m: board(2.6, GAP2, RIGHT, 1.9, 1.4, 0.6), zone: zone(0.6, GAP2) });

      // THE BATTERY SHED'S SCREEN, on its front wall, dark until somebody
      // presses something; what is on it and the way back under it; and the
      // rack on a board beside the shed.
      var SF = SHED.z + 1.52;
      var Z_SHED = [-3.6, 7.4, SF - 0.2, SF + 4.4];
      var screen = kit.lift(page, '.bds-screen', { w: 820, ww: 2.6, m: at(SHED.x, 0.95, SF), zone: Z_SHED });
      var now = kit.lift(page, '.bds-screen__now', { w: 760, ww: 2.4, m: at(SHED.x, 0.55, SF), zone: Z_SHED });
      kit.lift(page, '.bds-screen__back', { w: 640, ww: 1.9, m: at(SHED.x, 0.15, SF), zone: Z_SHED });
      var rack = kit.lift(page, '.bds-rack', { w: 820, h: 860, ww: 2.3, m: board(-1.6, SHED.z + 1.2, 0, 2.4, 2.45, 0.3), zone: Z_SHED });
      kit.wire(page, 'rack.js');

      var stops = [
        { name: 'at the south end of the rows, where you come in from the stile, the sun along the top of every row', x: 0, z: 3.0, yaw: 0, pitch: 0.1 },
        { name: 'at the board on the right, with the farm’s own page on it', x: 3.2, z: -0.4, yaw: RIGHT, pitch: 0.04, page: kit.page, frame: page },
        { name: 'at the board on the left: noon, and what the panels take', x: -3.2, z: -0.4, yaw: LEFT, pitch: 0.02, frame: lede.el },
        { name: 'at the small board on the left: neither one is the host', x: -3.2, z: 2.2, yaw: LEFT, pitch: 0.04, frame: host.el },
        { name: 'under the first row, in its shade, at the card for the chiltepin', x: -0.2, z: ROWS[0].z + 0.2, yaw: LEFT, pitch: -0.1, frame: crops[0].el },
        { name: 'at the edge of the second row’s shade, looking back up at the first row’s top edge and the sun along it', x: 0, z: ROWS[1].z + 0.9, yaw: Math.PI, pitch: 0.36 },
        { name: 'in the sun between the first two rows: why the peppers like it', x: -0.6, z: GAP1, yaw: LEFT, pitch: 0.02, frame: why.el },
        { name: 'in the sun between the first two rows: who else is under the panels', x: 0.6, z: GAP1, yaw: RIGHT, pitch: 0.02, frame: share.el },
        { name: 'with the sheep, grazing in the sun between the rows', x: 3.4, z: GAP1 + 0.6, yaw: -1.9, pitch: 0.2 },
        { name: 'under the second row, in its shade, at the card for the jalapeños', x: -0.2, z: ROWS[1].z + 0.2, yaw: LEFT, pitch: -0.1, frame: crops[1].el },
        { name: 'under the second row, looking straight up at the panels from underneath', x: 0, z: ROWS[1].z, yaw: 0, pitch: 1.1 },
        { name: 'in the sun between the second and third rows: the power', x: -0.6, z: GAP2, yaw: LEFT, pitch: 0.02, frame: power.el },
        { name: 'in the sun between the second and third rows: on the farm', x: 0.6, z: GAP2, yaw: RIGHT, pitch: 0.04, frame: rules.el },
        { name: 'under the third row, in its shade, at the card for the cherry tomatoes', x: -0.2, z: ROWS[2].z + 0.2, yaw: LEFT, pitch: -0.1, frame: crops[2].el },
        { name: 'under the third row, in its shade, at the card for the basil', x: 0.2, z: ROWS[2].z + 0.2, yaw: RIGHT, pitch: -0.1, frame: crops[3].el },
        { name: 'at the battery shed, before its screen, dark until somebody presses something', x: SHED.x, z: SF + 3.2, yaw: 0, pitch: -0.04, frame: screen.el },
        { name: 'under the shed’s screen: what is on it, and the way back', x: SHED.x, z: SF + 2.4, yaw: 0, pitch: -0.3, frame: now.el },
        { name: 'at the rack beside the battery shed: crops, sheep and bees under solar panels', x: -1.6, z: SF + 2.4, yaw: 0, pitch: 0.02, frame: rack.el }
      ];

      return {
        start: { x: 0, z: 3.0, yaw: 0 },
        bounds: { x: [-12, 12], z: [SHED.z + 3.2, 3.6] },
        stops: stops
      };
    }
  };
})();

/* =============================================================================
   Cavendish Coworking, walked into on Cel Street. Ryan's ask, 2026-10-31: back
   on the street, working down it a room at a time; and another round on
   2026-11-05, for more texture, detail and things to press.

   IT IS CAVENDISH COWORKING'S WORLD AND NOBODY ELSE'S (§58): Henry Cavendish's
   house after his library in Bedford Square, GREEN THROUGHOUT. The hall's walls
   are the painted green of the page, never near-black; the WOOD IS ONLY IN THE
   DOORS; and the light is daylight through the front windows, where the blinds
   are down and lined with green transparent canvas, so it comes in soft, even
   and faintly green, with no hard edge anywhere and no lamp.

   EVERY DOOR IS SHUT AND NONE IS LOCKED. Each is a Georgian six-panel door in
   mahogany, its grain drawn on the leaf and every panel, in a Coade stone case
   with a fanlight, a brass plate with the room's name and a brass knob, and the
   note off the page pinned beside it saying what is behind it and when. Three
   open off the hall (Events, Operations, Editorial); the Hang Suites are
   upstairs, on a landing across the back of the hall, with their notes on the
   wall under the landing. Each is a place whose link goes into that room's own
   page. NO DOOR IS EVER DRAWN OPEN, and nothing pressed here opens one: there
   is no open plan, and an open door here would lose the argument. Nothing of
   the radio, the calls or the visitor's clock is wired here.

   WHAT THE PAGE SAYS THE HOUSE HELD IS IN THE HALL, and nothing else is. It was
   green throughout, with green moreen curtains, green fire screens and green
   chair covers, so the windows have curtains of it tied back under a pelmet,
   the cold fireplace on the left-hand wall has a green fire screen in a brass
   frame before its empty grate (no fire is lit: there is no lamp and no flame
   in this house), and the chairs at the library table wear green covers to the
   floor. The table is under a green cloth, because the wood is only in the
   doors; on it are the register, an inkstand and a quill. Cavendish kept his
   library here and opened it for borrowing, so under the landing the books
   stand on shelves built into the wall in stone. The walls are panelled below
   a stone dado rail, the ceiling has plaster roses and no lamp hanging from
   either, a green runner goes down the hall and up the stairs, held at every
   step by a brass rod.

   THREE THINGS TO PRESS, each a button and a place in the scene, and each
   saying what it did: drawing the green curtains across the three windows or
   back (the hall goes dimmer and greener, and still nobody lights a lamp);
   opening the register on the table at its ruled pages or shutting it (the
   page's own line: he signed it for every book he took out to Clapham, like
   anybody else; nothing here writes your name in it); and taking a book down
   from the shelves under the landing to lie open on the table, leaving its gap,
   or putting it back. None of them opens a door.

   WHAT IS ON THE WALLS IS THE PAGE'S OWN, lifted off it by the kit: the doors'
   notes, and its words on the house in Bedford Square, why Cavendish, what is
   on the other side of a door, what is not in here, communication access and
   whose these are. The page itself hangs on the right-hand wall.

   NOTHING MOVES, before a press or after one: a press changes what is drawn,
   all at once. Every colour is one the room declares, by name, and its one
   letter is Caslon. It keeps nothing, sends nothing and fetches nothing; its
   page arrives through Cel Street's screen(). tools/make-cel-street.py holds
   each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['cavendish-coworking.html'] = {
    name: 'Cavendish Coworking',
    faces: ['"Libre Caslon Text"', '"Libre Caslon Display"'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var W = 11, D = 18, H = 7, X0 = -W / 2, X1 = W / 2, BACK = -D;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var LAND = 3.2, LZ = BACK + 2.4;                    // the landing across the back
      var SX0 = 4.05, SX1 = 5.45, SZ0 = -8.9;             // the stair up the right-hand wall

      // DAYLIGHT THROUGH GREEN CANVAS: even, from the front, casting nothing.
      kit.scene.background = kit.col('--cw-wall');
      var sky = new T.HemisphereLight(kit.col('--cw-canvas'), kit.col('--cw-wall'), 2.4);
      kit.scene.add(sky);
      var day = new T.DirectionalLight(kit.col('--cw-light'), 0.9);
      day.position.set(0, 4, 12); day.target.position.set(0, 1, -9);
      kit.scene.add(day, day.target);
      // A steady number out of two, so the books and folds are the same every
      // visit; nothing random, nothing on a clock.
      function hash(a, b) { var v = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return v - Math.floor(v); }
      // Cloth hung in folds: a plane w by h whose surface waves every `per`,
      // `deep` deep, one mesh of its own so a press can put it away.
      function cloth(w, h, per, deep, m, ink) {
        var g = new T.PlaneGeometry(w, h, Math.max(4, Math.round(w / per * 6)), 1), pos = g.attributes.position;
        for (var v = 0; v < pos.count; v++) pos.setZ(v, deep * Math.sin(pos.getX(v) / per * Math.PI * 2));
        g.computeVertexNormals();
        return kit.facets(g, m, ink);
      }

      // THE HALL: a stone floor, green walls, a pale ceiling with a stone cornice.
      box(W + 0.4, 0.1, D + 0.4, at(0, -0.05, -D / 2), '--cw-stone', false);
      for (var j = 1; j < 9; j++) box(W, 0.004, 0.02, at(0, 0.002, -j * 2), '--cw-dim', false);
      for (j = -2; j <= 2; j++) box(0.02, 0.004, D, at(j * 2.2, 0.002, -D / 2), '--cw-dim', false);
      box(0.3, H, D, at(X0 - 0.15, H / 2, -D / 2), '--cw-wall');
      box(0.3, H, D, at(X1 + 0.15, H / 2, -D / 2), '--cw-wall');
      box(W + 0.6, H, 0.3, at(0, H / 2, BACK - 0.15), '--cw-wall');
      box(W + 0.6, 0.2, D + 0.6, at(0, H + 0.1, -D / 2), '--cw-dim', false);
      [[0, X0 + 0.08, -D / 2, LEFT, D], [0, X1 - 0.08, -D / 2, RIGHT, D], [1, 0, BACK + 0.08, 0, W], [1, 0, -0.08, Math.PI, W]].forEach(function (c) {
        box(c[4], 0.22, 0.1, at(c[1], H - 0.11, c[2], c[3]), '--cw-stone', false);
        box(c[4], 0.18, 0.06, at(c[1], 0.09, c[2], c[3]), '--cw-stone', false);
      });

      // THE FRONT WALL, behind you as you come in: three tall windows, their
      // blinds down, the daylight coming through the green canvas.
      var WIN = [-3.6, 0, 3.6], WW = 1.4, WY0 = 0.9, WY1 = 4.6;
      var edges = [X0 - 0.3];
      WIN.forEach(function (x) { edges.push(x - WW / 2, x + WW / 2); });
      edges.push(X1 + 0.3);
      for (var e = 0; e < edges.length; e += 2) {
        var a = edges[e], b = edges[e + 1];
        box(b - a, H, 0.3, at((a + b) / 2, H / 2, 0.15), '--cw-wall');
      }
      WIN.forEach(function (x) {
        box(WW, WY0, 0.3, at(x, WY0 / 2, 0.15), '--cw-wall');
        box(WW, H - WY1, 0.3, at(x, (H + WY1) / 2, 0.15), '--cw-wall');
        kit.flat(new T.PlaneGeometry(WW, WY1 - WY0), at(x, (WY0 + WY1) / 2, 0.02, Math.PI), '--cw-canvas');
        box(WW + 0.16, 0.1, 0.12, at(x, WY0 - 0.05, -0.04), '--cw-stone', 0.01);   // the sill
        box(WW + 0.16, 0.1, 0.08, at(x, WY1 + 0.05, -0.02), '--cw-stone', false);
        [-1, 1].forEach(function (s) { box(0.08, WY1 - WY0, 0.08, at(x + s * (WW / 2 + 0.04), (WY0 + WY1) / 2, -0.02), '--cw-stone', false); });
        box(0.04, WY1 - WY0, 0.02, at(x, (WY0 + WY1) / 2, -0.01), '--cw-stone', false);        // the canvas's seam
      });

      // THE GREEN MOREEN CURTAINS, the page's own: a pelmet over every window
      // and the curtains tied back either side under it, or, when somebody
      // asks, drawn across. Moreen is a heavy wool and hangs in deep folds.
      var drawnBack = [], drawnAcross = [], CY = (WY1 + 0.3) / 2 + 0.02, CH = WY1 + 0.26;
      WIN.forEach(function (x) {
        box(WW + 0.72, 0.34, 0.2, at(x, WY1 + 0.43, -0.15), '--cw-link', 0.01);
        box(WW + 0.74, 0.03, 0.21, at(x, WY1 + 0.27, -0.15), '--cw-brass', false);
        for (var sc = 0; sc < 7; sc++) box(0.08, 0.08, 0.02, at(x - (WW + 0.5) / 2 + sc * (WW + 0.5) / 6, WY1 + 0.43, -0.255, 0, 0, Math.PI / 4), '--cw-brass', false);
        [-1, 1].forEach(function (s) {
          var cx = x + s * (WW / 2 + 0.13);
          drawnBack.push(cloth(0.26, CH, 0.085, 0.035, at(cx, CY, -0.2, Math.PI), '--cw-link'));
          drawnBack.push(kit.facets(new T.CylinderGeometry(0.1, 0.1, 0.05, 10), at(cx, 1.35, -0.2), '--cw-brass'));
          cyl(0.03, 0.03, 0.1, at(x + s * (WW / 2 + 0.3), 1.35, -0.08, 0, Math.PI / 2), '--cw-brass', 0.006, 8);   // the holdback
        });
        var across = cloth(WW + 0.5, CH, 0.17, 0.05, at(x, CY, -0.2, Math.PI), '--cw-link');
        kit.hide(across, true);
        drawnAcross.push(across);
      });

      // THE WALLS ARE PANELLED BELOW A STONE DADO RAIL, painted the hall's
      // green, each panel's moulding carried by its edge. Where a door, the
      // fireplace or the page stands, the rail stops.
      function wainscot(x, ry, inward, from, to) {
        var len = from - to, zc = (from + to) / 2;
        box(len, 0.07, 0.06, at(x + inward * 0.03, 0.92, zc, ry), '--cw-stone', 0.006);
        box(len, 0.025, 0.035, at(x + inward * 0.018, 0.86, zc, ry), '--cw-stone', false);
        var n = Math.max(1, Math.round(len / 1.1)), pw = len / n;
        for (var k = 0; k < n; k++) {
          var pz = from - pw * (k + 0.5);
          box(pw - 0.16, 0.5, 0.024, at(x + inward * 0.012, 0.5, pz, ry), '--cw-wall', 0.005);
          box(pw - 0.3, 0.36, 0.01, at(x + inward * 0.028, 0.5, pz, ry), '--cw-wall', 0.003);
        }
      }
      [[-0.35, -1.95], [-4.05, -5.36], [-8.66, -11.14], [-13.26, -17.8]].forEach(function (r) { wainscot(X0, LEFT, 1, r[0], r[1]); });
      [[-0.35, -2.12], [-5.08, -8.82]].forEach(function (r) { wainscot(X1, RIGHT, -1, r[0], r[1]); });

      // PLASTER ROSES ON THE CEILING, and nothing hanging from them: no lamp.
      [-4.6, -10.4].forEach(function (z) {
        cyl(0.42, 0.42, 0.03, at(0, H - 0.015, z), '--cw-stone', 0.006, 32);
        kit.piece(new T.TorusGeometry(0.34, 0.035, 6, 32), at(0, H - 0.04, z, 0, Math.PI / 2), '--cw-stone', false);
        for (var lf = 0; lf < 12; lf++) {
          var la = lf / 12 * Math.PI * 2;
          kit.piece(new T.SphereGeometry(0.07, 6, 4), at(Math.cos(la) * 0.2, H - 0.035, z + Math.sin(la) * 0.2, -la, 0, 0), '--cw-stone', false);
        }
        cyl(0.09, 0.06, 0.06, at(0, H - 0.06, z), '--cw-stone', false, 16);
      });

      // A GREEN RUNNER down the middle of the hall, from the front door to the
      // library table: a field of the curtains' green, a border of the
      // blinds', and a brass line between, with a lozenge every so often.
      var runner = kit.paper(128, 768, function (c, w, h) {
        c.fillStyle = kit.ink('--cw-canvas'); c.fillRect(0, 0, w, h);
        c.fillStyle = kit.ink('--cw-link'); c.fillRect(14, 14, w - 28, h - 28);
        c.strokeStyle = kit.ink('--cw-brass'); c.lineWidth = 2; c.strokeRect(20, 20, w - 40, h - 40);
        c.strokeStyle = kit.ink('--cw-canvas'); c.lineWidth = 2;
        for (var ry = 70; ry < h - 40; ry += 96) {
          c.beginPath(); c.moveTo(w / 2, ry - 30); c.lineTo(w / 2 + 26, ry); c.lineTo(w / 2, ry + 30); c.lineTo(w / 2 - 26, ry); c.closePath(); c.stroke();
          c.fillStyle = kit.ink('--cw-brass'); c.fillRect(w / 2 - 3, ry - 3, 6, 6);
        }
        c.globalAlpha = 0.18; c.strokeStyle = kit.ink('--cw-wall'); c.lineWidth = 1;
        for (var wy = 0; wy < h; wy += 3) { c.beginPath(); c.moveTo(0, wy); c.lineTo(w, wy); c.stroke(); }
        c.globalAlpha = 1;
      });
      kit.sheet(runner, 1.4, 8.4, at(0, 0.008, -5.2, 0, -Math.PI / 2));

      // THE COLD FIREPLACE on the left-hand wall, between the Events note and
      // the Operations door: a stone chimneypiece, an iron grate swept and
      // empty, and a green fire screen in a brass frame standing before it.
      var FZ = -6.03, FX = X0;
      [-1, 1].forEach(function (s) { box(0.16, 1.08, 0.16, at(FX + 0.08, 0.54, FZ + s * 0.47), '--cw-stone', 0.008); });
      box(0.16, 0.2, 1.1, at(FX + 0.08, 1.18, FZ), '--cw-stone', 0.008);
      box(0.26, 0.05, 1.22, at(FX + 0.13, 1.305, FZ), '--cw-stone', 0.008);              // the mantel shelf
      box(0.04, 0.12, 0.3, at(FX + 0.17, 1.18, FZ), '--cw-stone', false);                 // its tablet
      kit.flat(new T.PlaneGeometry(0.78, 1.0), at(FX + 0.02, 0.58, FZ, LEFT), '--cw-plate-ink');
      box(0.5, 0.03, 1.24, at(FX + 0.25, 0.015, FZ), '--cw-stone', 0.006);               // the hearth stone
      for (var gb = 0; gb < 6; gb++) box(0.02, 0.22, 0.02, at(FX + 0.24, 0.3, FZ - 0.25 + gb * 0.1), '--cw-plate-ink', false);
      box(0.24, 0.03, 0.56, at(FX + 0.16, 0.2, FZ), '--cw-plate-ink', false);
      box(0.03, 0.03, 0.56, at(FX + 0.27, 0.41, FZ), '--cw-plate-ink', false);
      [-1, 1].forEach(function (s) {
        cyl(0.012, 0.012, 0.9, at(FX + 0.56, 0.48, FZ + s * 0.3), '--cw-brass', 0.004, 6);
        box(0.22, 0.02, 0.03, at(FX + 0.56, 0.02, FZ + s * 0.3), '--cw-brass', false);
        kit.piece(new T.SphereGeometry(0.025, 8, 6), at(FX + 0.56, 0.95, FZ + s * 0.3), '--cw-brass', false);
      });
      box(0.02, 0.6, 0.56, at(FX + 0.56, 0.52, FZ), '--cw-brass', 0.004);
      box(0.026, 0.54, 0.5, at(FX + 0.56, 0.52, FZ), '--cw-link', false);
      box(0.03, 0.18, 0.06, at(FX + 0.56, 0.52, FZ), '--cw-brass', false);               // a small boss on the silk
      // On the mantel, a few of his books lying flat.
      [[0.05, '--cw-mahogany'], [0.04, '--cw-link'], [0.035, '--cw-ink-2']].forEach(function (b, n) {
        box(0.2, b[0], 0.28 - n * 0.03, at(FX + 0.14, 1.33 + 0.045 * n + b[0] / 2, FZ + 0.32, 0.1 * n), b[1], 0.004);
      });

      // THE LIBRARY TABLE, under a green cloth to the floor, because the wood
      // is only in the doors; chairs in green covers either side of it.
      var TX = 0.4, TZ = -10.8, TY = 0.765;
      box(2.3, 0.03, 1.1, at(TX, TY, TZ), '--cw-link', 0.01);
      [-1, 1].forEach(function (s) {
        box(2.3, 0.72, 0.02, at(TX, 0.39, TZ + s * 0.55), '--cw-link', 0.006);
        box(0.02, 0.72, 1.1, at(TX + s * 1.15, 0.39, TZ), '--cw-link', 0.006);
        box(2.32, 0.03, 0.025, at(TX, 0.05, TZ + s * 0.555), '--cw-brass', false);        // the fringe along its hem
        box(0.025, 0.03, 1.12, at(TX + s * 1.155, 0.05, TZ), '--cw-brass', false);
        for (var fd = 0; fd < 9; fd++) cyl(0.03, 0.045, 0.7, at(TX - 1.0 + fd * 0.25, 0.4, TZ + s * 0.55), '--cw-link', false, 8);
        for (fd = 0; fd < 4; fd++) cyl(0.03, 0.045, 0.7, at(TX + s * 1.15, 0.4, TZ - 0.38 + fd * 0.25), '--cw-link', false, 8);
      });
      function chair(x, z, ry) {
        var m = at(x, 0, z, ry);
        box(0.5, 0.46, 0.5, M(m, at(0, 0.23, 0)), '--cw-canvas', 0.008);
        box(0.52, 0.06, 0.52, M(m, at(0, 0.46, 0)), '--cw-canvas', 0.006);              // the cushion under its cover
        box(0.5, 0.58, 0.09, M(m, at(0, 0.75, 0.21)), '--cw-canvas', 0.008);
        kit.piece(new T.CylinderGeometry(0.045, 0.045, 0.5, 10), M(m, at(0, 1.04, 0.21, 0, 0, Math.PI / 2)), '--cw-canvas', 0.006);
        [-0.18, 0, 0.18].forEach(function (fx) { cyl(0.015, 0.03, 0.4, M(m, at(fx, 0.2, -0.25)), '--cw-canvas', false, 6); });
        [-1, 1].forEach(function (s) { cyl(0.015, 0.03, 0.4, M(m, at(s * 0.25, 0.2, 0)), '--cw-canvas', false, 6); });
      }
      chair(TX - 0.55, TZ + 0.95, 0); chair(TX + 0.55, TZ + 0.95, 0);
      chair(TX - 0.55, TZ - 0.95, Math.PI); chair(TX + 0.55, TZ - 0.95, Math.PI);
      // The inkstand and a quill, in brass, on the cloth.
      box(0.34, 0.025, 0.18, at(TX + 0.15, TY + 0.028, TZ - 0.2), '--cw-brass', 0.004);
      [-0.08, 0.08].forEach(function (ix) { cyl(0.035, 0.04, 0.06, at(TX + 0.15 + ix, TY + 0.07, TZ - 0.2), '--cw-plate-ink', 0.004, 10); });
      cyl(0.004, 0.01, 0.3, at(TX + 0.22, TY + 0.12, TZ - 0.24, 0, 0.5, -0.5), '--cw-card', false, 5);
      // THE REGISTER, shut on the cloth until somebody opens it.
      var RX = TX - 0.6, RZ = TZ + 0.2, RY = TY + 0.015;
      var regShut = [kit.facets(new T.BoxGeometry(0.36, 0.07, 0.48), at(RX + 0.18, RY + 0.035, RZ), '--cw-mahogany'),
                     kit.facets(new T.BoxGeometry(0.32, 0.06, 0.465), at(RX + 0.2, RY + 0.035, RZ), '--cw-card'),
                     kit.facets(new T.BoxGeometry(0.16, 0.004, 0.06), at(RX + 0.18, RY + 0.072, RZ), '--cw-plate')];
      var regOpen = [kit.facets(new T.BoxGeometry(0.74, 0.012, 0.5), at(RX, RY + 0.006, RZ), '--cw-mahogany')];
      [-1, 1].forEach(function (s) {
        regOpen.push(kit.facets(new T.BoxGeometry(0.34, 0.03, 0.46), at(RX + s * 0.175, RY + 0.027, RZ), '--cw-card'));
        for (var rl = 0; rl < 9; rl++) regOpen.push(kit.flat(new T.PlaneGeometry(0.3, 0.004), at(RX + s * 0.175, RY + 0.043, RZ - 0.18 + rl * 0.045, 0, -Math.PI / 2), '--cw-ink-2'));
        [-0.06, 0.08].forEach(function (cx) { regOpen.push(kit.flat(new T.PlaneGeometry(0.004, 0.42), at(RX + s * 0.175 + cx, RY + 0.043, RZ, 0, -Math.PI / 2), '--cw-ink-2')); });
        for (rl = 0; rl < 6; rl++) {
          var lw = 0.05 + hash(rl, s + 3) * 0.06;
          regOpen.push(kit.flat(new T.PlaneGeometry(lw, 0.012), at(RX + s * 0.175 - 0.12 + lw / 2, RY + 0.044, RZ - 0.2 + rl * 0.045 + 0.022, 0, -Math.PI / 2), '--cw-ink'));
        }
      });
      regOpen.push(kit.flat(new T.PlaneGeometry(0.006, 0.46), at(RX, RY + 0.044, RZ, 0, -Math.PI / 2), '--cw-ink-2'));
      regOpen.forEach(function (r) { kit.hide(r, true); });
      // The borrowed book, lying open on the cloth while it is off its shelf.
      var lent = [kit.facets(new T.BoxGeometry(0.4, 0.01, 0.27), at(TX + 0.75, TY + 0.02, TZ + 0.05, 0.3), '--cw-canvas')];
      [-1, 1].forEach(function (s) {
        var bm = at(TX + 0.75, TY + 0.033, TZ + 0.05, 0.3);
        lent.push(kit.facets(new T.BoxGeometry(0.18, 0.02, 0.25), M(bm, at(s * 0.095, 0, 0)), '--cw-card'));
        for (var bl = 0; bl < 6; bl++) lent.push(kit.flat(new T.PlaneGeometry(0.14, 0.004), M(bm, at(s * 0.095, 0.0115, -0.09 + bl * 0.036, 0, -Math.PI / 2)), '--cw-ink-2'));
      });
      lent.forEach(function (b) { kit.hide(b, true); });

      // A NAME ON A BRASS PLATE, in Caslon.
      function plate(words) {
        return kit.paper(512, 96, function (c, w, h) {
          c.fillStyle = kit.ink('--cw-plate'); c.fillRect(0, 0, w, h);
          c.strokeStyle = kit.ink('--cw-plate-ink'); c.lineWidth = 3; c.strokeRect(6, 6, w - 12, h - 12);
          c.fillStyle = kit.ink('--cw-plate-ink');
          var size = 54;
          c.font = '700 ' + size + 'px "Libre Caslon Text"';
          while (c.measureText(words.toUpperCase()).width > w - 50 && size > 22) { size -= 2; c.font = '700 ' + size + 'px "Libre Caslon Text"'; }
          c.textAlign = 'center'; c.textBaseline = 'middle';
          c.fillText(words.toUpperCase(), w / 2, h / 2 + 3);
        });
      }
      // MAHOGANY'S GRAIN, drawn once in the room's own inks and laid on every
      // leaf and every panel, so the doors read as wood and nothing else does.
      var grain = kit.paper(128, 512, function (c, w, h) {
        c.fillStyle = kit.ink('--cw-mahogany'); c.fillRect(0, 0, w, h);
        c.strokeStyle = kit.ink('--cw-plate-ink'); c.lineWidth = 1.2;
        for (var g = 0; g < 26; g++) {
          var gx = hash(g, 1) * w, wob = 2 + hash(g, 2) * 5, per = 60 + hash(g, 3) * 120;
          c.globalAlpha = 0.12 + hash(g, 4) * 0.22;
          c.beginPath();
          for (var gy = 0; gy <= h; gy += 8) { var px = gx + Math.sin(gy / per * Math.PI * 2 + g) * wob; if (gy) c.lineTo(px, gy); else c.moveTo(px, gy); }
          c.stroke();
        }
        c.globalAlpha = 1;
      });
      // A GEORGIAN DOOR, SHUT: a mahogany leaf of six panels in a Coade stone
      // case, a fanlight over it, a brass plate and knob. m is its foot, on the
      // wall, facing into the hall.
      function door(m, words) {
        [-1, 1].forEach(function (s) { box(0.22, 2.95, 0.14, M(m, at(s * 0.86, 1.475, 0.07)), '--cw-stone', 0.012); });
        box(1.94, 0.16, 0.16, M(m, at(0, 3.03, 0.08)), '--cw-stone', 0.012);
        kit.flat(new T.CircleGeometry(0.78, 28, 0, Math.PI), M(m, at(0, 3.11, 0.02)), '--cw-light');
        kit.piece(new T.TorusGeometry(0.86, 0.08, 6, 28, Math.PI), M(m, at(0, 3.11, 0.08)), '--cw-stone', 0.012);
        for (var f = 1; f < 6; f++) {
          var t = f / 6 * Math.PI;
          box(0.03, 0.74, 0.03, M(m, at(Math.cos(t) * 0.38, 3.11 + Math.sin(t) * 0.38, 0.05, 0, 0, t - Math.PI / 2)), '--cw-stone', false);
        }
        box(1.5, 2.95, 0.07, M(m, at(0, 1.475, 0.05)), '--cw-mahogany', 0.012);
        kit.sheet(grain, 1.46, 2.9, M(m, at(0, 1.475, 0.0865)));
        [[2.45, 0.6], [1.62, 0.84], [0.62, 0.72]].forEach(function (r) {
          [-0.34, 0.34].forEach(function (x) {
            box(0.52, r[1], 0.03, M(m, at(x, r[0], 0.1)), '--cw-mahogany', 0.008);
            kit.sheet(grain, 0.46, r[1] - 0.06, M(m, at(x, r[0], 0.1165)));
          });
        });
        kit.sheet(plate(words), 0.86, 0.86 * 96 / 512, M(m, at(0, 1.08, 0.095)));
        cyl(0.05, 0.05, 0.06, M(m, at(0.58, 1.08, 0.12, 0, Math.PI / 2)), '--cw-brass', 0.008, 12);
        box(1.94, 0.06, 0.3, M(m, at(0, 0.03, 0.15)), '--cw-stone', 0.01);           // the step
      }

      var stops = [
        { name: 'just inside the front door, the blinds down behind you and every door shut', x: 0, z: -1.6, yaw: 0, pitch: 0.1 },
        { name: 'in the middle of the hall, green throughout, every door in it shut and none of them locked', x: -0.6, z: -7.4, yaw: 0, pitch: 0.18 },
        { name: 'at the front windows, the blinds down and the daylight coming through the green canvas', x: 0, z: -3.4, yaw: Math.PI, pitch: 0.15 }
      ];

      // THE ROOM'S OWN PAGE, on the right-hand wall nearest the door.
      var pw = 2.6, ph = pw * 800 / 1180, py = 0.75 + ph / 2;
      box(pw + 0.16, ph + 0.16, 0.06, at(X1 - 0.03, py, -3.6, RIGHT), '--cw-stone', 0.012);
      var frame = kit.screen(1180, 800, pw, at(X1 - 0.07, py, -3.6, RIGHT), 'Cavendish Coworking’s own page, on the right-hand wall of the hall');

      // THE DOORS OFF THE HALL, down the left-hand wall, each with its note
      // pinned beside it.
      var HALL = [
        { z: -3.0, words: 'Events', page: 'cavendish-events.html', room: 'the Events Room' },
        { z: -7.6, words: 'Operations', page: 'cavendish-operations.html', room: 'the Operations Room' },
        { z: -12.2, words: 'Editorial', page: 'cavendish-editorial.html', room: 'the Editorial Room' }
      ];
      HALL.forEach(function (d, n) {
        door(at(X0 + 0.01, 0, d.z, LEFT), d.words);
        var note = kit.lift(frame, '.cw-door__note', { n: n, w: 520, h: 900, ww: 1.35, m: at(X0 + 0.06, 0.5, d.z - 1.75, LEFT) });
        stops.push({ name: d.room, where: 'at the ' + d.words + ' door, shut and unlocked, its note pinned beside it',
                     x: X0 + 3.6, z: d.z - 0.9, yaw: LEFT, pitch: 0.06, page: d.page, frame: note.el });
      });

      // THE STAIR up the right-hand wall to the landing across the back, all
      // stone, the landing with a stone balustrade along its edge.
      var STEPS = 17, rise = LAND / STEPS, run = (SZ0 - LZ) / STEPS;
      for (var i = 0; i < STEPS; i++) {
        box(SX1 - SX0, rise * (i + 1), run + 0.01, at((SX0 + SX1) / 2, rise * (i + 1) / 2, SZ0 - run * (i + 0.5)), '--cw-stone', 0.008);
      }
      // A green runner up the middle of every step, held by a brass rod.
      for (i = 0; i < STEPS; i++) {
        var fz = SZ0 - run * i;
        box(0.9, 0.012, run, at((SX0 + SX1) / 2, rise * (i + 1) + 0.006, fz - run / 2), '--cw-link', false);
        box(0.9, rise, 0.012, at((SX0 + SX1) / 2, rise * (i + 0.5), fz + 0.006), '--cw-link', false);
        cyl(0.012, 0.012, 1.0, at((SX0 + SX1) / 2, rise * i + 0.02, fz + 0.022, 0, 0, Math.PI / 2), '--cw-brass', false, 6);
      }
      var lo = new T.Vector3(SX0 + 0.02, 1.0, SZ0), hi = new T.Vector3(SX0 + 0.02, LAND + 1.0, LZ);
      var span = hi.clone().sub(lo), mid = lo.clone().add(hi).multiplyScalar(0.5);
      var railGeo = new T.CylinderGeometry(0.04, 0.04, span.length(), 8);
      railGeo.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), span.clone().normalize()));
      kit.piece(railGeo, at(mid.x, mid.y, mid.z), '--cw-stone', 0.008);
      for (i = 1; i < STEPS; i += 2) cyl(0.025, 0.025, 1.0, at(SX0 + 0.02, rise * (i + 1) + 0.5, SZ0 - run * (i + 0.5)), '--cw-stone', false, 6);
      box(W, 0.3, LZ - BACK, at(0, LAND - 0.15, (LZ + BACK) / 2), '--cw-stone', 0.012);
      box(SX0 - X0, 0.08, 0.1, at((X0 + SX0) / 2, LAND + 0.95, LZ + 0.02), '--cw-stone', 0.008);
      for (var bx = X0 + 0.2; bx < SX0 - 0.05; bx += 0.32) cyl(0.03, 0.03, 0.9, at(bx, LAND + 0.45, LZ + 0.02), '--cw-stone', false, 6);
      stops.push({ name: 'at the foot of the stairs, going up to the Hang Suites on the landing', x: 3.2, z: SZ0 + 0.6, yaw: 0.12, pitch: 0.32 });

      // HIS LIBRARY, ON SHELVES BUILT INTO THE WALL IN STONE under the
      // landing, between the suites' notes. The books are bound in the room's
      // own inks, a brass band on some, and one of them can be taken down.
      var shelfBook = null, shelfAt = null;
      [[-4.83, 1.15], [-1.7, 1.7], [1.5, 1.3]].forEach(function (bc, ci) {
        var cx = bc[0], cw = bc[1], cz = BACK + 0.17, top = LAND - 0.38;
        [-1, 1].forEach(function (s) { box(0.07, top, 0.34, at(cx + s * (cw / 2 - 0.035), top / 2, cz), '--cw-stone', 0.008); });
        box(cw, 0.08, 0.36, at(cx, top + 0.04, cz + 0.01), '--cw-stone', 0.008);
        box(cw, 0.1, 0.34, at(cx, 0.05, cz), '--cw-stone', 0.008);
        box(cw - 0.14, top, 0.02, at(cx, top / 2, BACK + 0.011), '--cw-stone', false);      // its back, so a gap shows
        var rows = [0.1, 0.66, 1.22, 1.78, 2.34];
        rows.forEach(function (ry, ri) {
          if (ri) box(cw - 0.14, 0.035, 0.32, at(cx, ry - 0.0175, cz), '--cw-stone', 0.004);
          var bx = cx - cw / 2 + 0.08, k = 0, INKS = ['--cw-mahogany', '--cw-link', '--cw-ink-2', '--cw-plate-ink', '--cw-card', '--cw-mahogany', '--cw-canvas'];
          while (bx < cx + cw / 2 - 0.12) {
            var bw = 0.035 + hash(ci * 31 + ri, k) * 0.045, bh = 0.3 + hash(k, ci * 7 + ri) * 0.12, ink = INKS[Math.floor(hash(ri + ci, k * 3) * INKS.length)];
            if (hash(k, ri * 5 + ci) < 0.08) { bx += 0.05; k++; continue; }      // a gap where a book is out already
            var bm = at(bx + bw / 2, ry + bh / 2, cz + 0.02);
            if (ci === 1 && ri === 2 && k >= 7 && !shelfBook) {
              bw = 0.08; bh = 0.4; bm = at(bx + bw / 2, ry + bh / 2, cz + 0.02);
              shelfAt = bm;
              shelfBook = [kit.facets(new T.BoxGeometry(bw, bh, 0.24), bm, '--cw-canvas'),
                           kit.facets(new T.BoxGeometry(bw + 0.004, 0.02, 0.242), M(bm, at(0, bh * 0.3, 0)), '--cw-brass')];
            } else {
              box(bw, bh, 0.24, bm, ink, 0.003);
              if (hash(k, ri + ci * 13) < 0.45) box(bw + 0.003, 0.014, 0.242, M(bm, at(0, bh * 0.32, 0)), '--cw-brass', false);
            }
            bx += bw + 0.004; k++;
          }
        });
      });

      // THE HANG SUITES upstairs, on the landing across the back, each door
      // shut, its note on the wall under the landing below it.
      var SUITES = [
        { x: -3.4, words: 'The Cave', page: 'cavendish-cave.html', room: 'the Cave' },
        { x: 0, words: 'The Campfire', page: 'cavendish-campfire.html', room: 'the Campfire' },
        { x: 3.0, words: 'The Watering Hole', page: 'cavendish-watering-hole.html', room: 'the Watering Hole' }
      ];
      SUITES.forEach(function (d, n) {
        door(at(d.x, LAND, BACK + 0.01, 0), d.words);
        var note = kit.lift(frame, '.cw-door__note', { n: 3 + n, w: 520, h: 900, ww: 1.5, m: at(d.x, 0.9, BACK + 0.06) });
        stops.push({ name: d.room, where: 'below the landing, at the note for ' + d.room + ', its door shut on the landing above',
                     x: d.x, z: BACK + 6.2, yaw: 0, pitch: 0.3, page: d.page, frame: note.el });
      });

      // THE PAGE'S OWN WORDS on the walls: the house and why Cavendish on the
      // right-hand wall, and between the front windows and at the corners
      // communication access, whose these are, what is on the other side of a
      // door and what is not in here.
      var WORDS = [
        { n: 1, w: 760, ww: 1.4, m: at(X1 - 0.06, 0.7, -6.0, RIGHT), stand: { x: X1 - 2.9, z: -6.0, yaw: RIGHT },
          name: 'at the word on the house in Bedford Square, on the right-hand wall' },
        { n: 2, w: 760, ww: 1.4, m: at(X1 - 0.06, 0.7, -7.9, RIGHT), stand: { x: X1 - 2.9, z: -7.9, yaw: RIGHT },
          name: 'at why Cavendish, on the right-hand wall by the stairs' },
        { n: 0, w: 760, ww: 1.6, m: at(-1.8, 1.0, -0.06, Math.PI), stand: { x: -1.8, z: -2.2, yaw: Math.PI },
          name: 'at communication access, between the front windows' },
        { n: 5, w: 760, ww: 1.6, m: at(1.8, 1.0, -0.06, Math.PI), stand: { x: 1.8, z: -2.2, yaw: Math.PI },
          name: 'at the word on whose these are, between the front windows' },
        { n: 3, w: 620, ww: 1.0, m: at(-4.9, 1.0, -0.06, Math.PI), stand: { x: -4.2, z: -2.0, yaw: Math.PI - 0.3 },
          name: 'at what is on the other side of a door, in the corner by the window' },
        { n: 4, w: 620, ww: 1.0, m: at(4.9, 1.0, -0.06, Math.PI), stand: { x: 3.6, z: -2.0, yaw: Math.PI + 0.3 },
          name: 'at what is not in here, in the corner by the window' }
      ];
      WORDS.forEach(function (w) {
        var it = kit.lift(frame, '.cw-part', { n: w.n, w: w.w, h: 900, ww: w.ww, m: w.m });
        stops.push({ name: w.name, x: w.stand.x, z: w.stand.z, yaw: w.stand.yaw, pitch: 0.1, frame: it.el });
      });
      stops.push({ name: 'at the right-hand wall, with the house’s own page on it', x: X1 - 2.8, z: -3.6, yaw: RIGHT, pitch: 0.05, page: kit.page, frame: frame });

      // THREE THINGS TO PRESS. None opens a door, and none keeps anything.
      var curtains = kit.press({
        say: function () { return kit.hidden(drawnAcross[0]) ? 'Draw the green curtains across' : 'Draw the curtains back'; },
        at: WIN.map(function (x) { return kit.touch(WW + 0.6, CH, 0.4, at(x, CY, -0.3)); }),
        press: function () {
          var across = kit.hidden(drawnAcross[0]);
          drawnAcross.forEach(function (c) { kit.hide(c, !across); });
          drawnBack.forEach(function (c) { kit.hide(c, across); });
          sky.intensity = across ? 1.9 : 2.4;
          day.intensity = across ? 0.45 : 0.9;
          return across ? 'The green moreen curtains are drawn across all three windows. The hall goes dimmer and greener, and still nobody lights a lamp.'
                        : 'The curtains are tied back again, and the daylight comes through the green canvas of the blinds.';
        } });
      var register = kit.press({
        say: function () { return kit.hidden(regOpen[0]) ? 'Open the register' : 'Shut the register'; },
        at: [kit.touch(0.8, 0.3, 0.6, at(RX, TY + 0.1, RZ))],
        press: function () {
          var open = kit.hidden(regOpen[0]);
          regOpen.forEach(function (r) { kit.hide(r, !open); });
          regShut.forEach(function (r) { kit.hide(r, open); });
          return open ? 'The register lies open on the table at its ruled pages. Cavendish signed it for every book he took out to Clapham, like anybody else. Nothing here writes your name in it.'
                      : 'The register is shut on the cloth again.';
        } });
      var borrow = kit.press({
        say: function () { return kit.hidden(lent[0]) ? 'Take a book down from the shelves' : 'Put the book back on its shelf'; },
        at: [kit.touch(0.3, 0.5, 0.4, M(shelfAt, at(0, 0, 0.1))), kit.touch(0.5, 0.2, 0.4, at(TX + 0.75, TY + 0.05, TZ + 0.05))],
        press: function () {
          var take = kit.hidden(lent[0]);
          lent.forEach(function (b) { kit.hide(b, !take); });
          shelfBook.forEach(function (b) { kit.hide(b, take); });
          return take ? 'A pale green book comes down from the shelves under the landing and lies open on the library table, leaving its gap on the shelf.'
                      : 'The book goes back into its gap on the shelf under the landing.';
        } });
      stops[1].acts = [register];
      stops[2].acts = [curtains];
      stops.splice(2, 0,
        { name: 'at the library table, under its green cloth, with the register on it', x: TX - 0.3, z: TZ + 1.85, yaw: 0, pitch: -0.42, acts: [register, borrow] },
        { name: 'at the cold fireplace, its green fire screen before the empty grate', x: X0 + 2.6, z: FZ, yaw: LEFT, pitch: -0.12 },
        { name: 'under the landing, at the shelves of his library', x: -1.0, z: BACK + 2.6, yaw: 0, pitch: 0.05, acts: [borrow] });

      return {
        start: { x: 0, z: -1.6, yaw: 0 },
        bounds: { x: [X0 + 0.9, SX0 - 0.4], z: [BACK + 1.0, -0.9] },
        stops: stops
      };
    }
  };
})();

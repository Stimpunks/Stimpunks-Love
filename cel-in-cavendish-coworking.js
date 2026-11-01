/* =============================================================================
   Cavendish Coworking, walked into on Cel Street. Ryan's ask, 2026-10-31: back
   on the street, working down it a room at a time.

   IT IS CAVENDISH COWORKING'S WORLD AND NOBODY ELSE'S (§58): Henry Cavendish's
   house after his library in Bedford Square, GREEN THROUGHOUT. The hall's walls
   are the painted green of the page, never near-black; the WOOD IS ONLY IN THE
   DOORS; and the light is daylight through the front windows, where the blinds
   are down and lined with green transparent canvas, so it comes in soft, even
   and faintly green, with no hard edge anywhere and no lamp.

   EVERY DOOR IS SHUT AND NONE IS LOCKED. Each is a Georgian six-panel door in
   mahogany, in a Coade stone case with a fanlight, a brass plate with the
   room's name and a brass knob, and the note off the page pinned beside it
   saying what is behind it and when. Three open off the hall (Events,
   Operations, Editorial); the Hang Suites are upstairs, on a landing across
   the back of the hall, with their notes on the wall under the landing. Each
   is a place whose link goes into that room's own page. NO DOOR IS EVER DRAWN
   OPEN, and there is no open plan: an open door here would lose the argument.
   Nothing of the radio, the calls or the visitor's clock is wired here.

   WHAT IS ON THE WALLS IS THE PAGE'S OWN, lifted off it by the kit: the doors'
   notes, and its words on the house in Bedford Square, why Cavendish, what is
   on the other side of a door, what is not in here, communication access and
   whose these are. The page itself hangs on the right-hand wall.

   NOTHING MOVES. Every colour is one the room declares, by name, and its one
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
      kit.scene.add(new T.HemisphereLight(kit.col('--cw-canvas'), kit.col('--cw-wall'), 2.4));
      var day = new T.DirectionalLight(kit.col('--cw-light'), 0.9);
      day.position.set(0, 4, 12); day.target.position.set(0, 1, -9);
      kit.scene.add(day, day.target);

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
        [[2.45, 0.6], [1.62, 0.84], [0.62, 0.72]].forEach(function (r) {
          [-0.34, 0.34].forEach(function (x) { box(0.52, r[1], 0.03, M(m, at(x, r[0], 0.1)), '--cw-mahogany', 0.008); });
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

      return {
        start: { x: 0, z: -1.6, yaw: 0 },
        bounds: { x: [X0 + 0.9, SX0 - 0.4], z: [BACK + 1.0, -0.9] },
        stops: stops
      };
    }
  };
})();

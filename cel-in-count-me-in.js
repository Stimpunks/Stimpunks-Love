/* =============================================================================
   Count Me In, walked into on Cel Street. Ryan's ask, 2026-10-31: back on the
   street, working down it a room at a time.

   IT IS COUNT ME IN'S WORLD AND NOBODY ELSE'S (§86): through a fire door, the
   stairwell of a public building, going up and never stopping. Concrete
   treads with white paint on every nosing, eau de nil walls over a dark gloss
   dado with a painted line between, and A LAMP ON EVERY LANDING, so it never
   gets darker however far up you look: every landing is lit the same as the
   first, and the stair runs on up into the paint. That is what keeps it off
   the Rabbit Hole (a shaft going down, wet slate, darker the further in) and
   off Arlesglad Caverns (a way down into rock, lit only by a handrail, its
   lift a car with buttons).

   THE CHAIRLIFT IS PART OF THE STAIR. Its rail runs up the wall of every
   flight and round every landing, in the stair's own dark green, and its
   chair is drawn as fully as the stair is: carriage, seat, back, arms and
   footplate, the seat and the top of the rail in the nosing's white. The chair is parked at the
   landing, which is where the page draws it too, and its call button stands
   at the foot of the stairs, the same size as anything else on the wall. A
   lift drawn smaller, paler or as an afterthought would be saying the stair
   is the real way up.

   NOTHING MOVES: the chair does not ride by itself, and no landing carries a
   number, because the step the stair is on is the page's to say and nobody
   is counted here. Climbing is on the room's own page, on the wall under the
   stair, where stair.js climbs by number or by the lift; nothing here talks
   to the CB. Every colour is one Count Me In declares, by name. It keeps
   nothing, sends nothing and fetches nothing; its page arrives through Cel
   Street's screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['count-me-in.html'] = {
    name: 'Count Me In',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;

      // THE WELL: walls at x = ±3.5, the back wall at z = -9.6, the fire door
      // in the front wall at z = 0. Two flights a storey: the first up the
      // right going away from you, the second up the left coming back, a
      // half-landing across the back between them and a landing across the
      // front at every storey, with a gap of a well between the flights.
      var HW = 3.5, back = -9.6, FZ = -2.4, BZ = -7.2;
      var R = 0.2, G = 0.32, N = 15, RISE = N * R, RUN = N * G;
      var STOREY = 2 * RISE, STOREYS = 6, TOP = STOREY * STOREYS + 3;
      var IN = 0.6, FW = HW - IN, CX = IN + FW / 2;
      var SLOPE = Math.atan2(RISE, RUN), LEN = Math.hypot(RISE, RUN);

      // LAMPLIGHT, the same everywhere: the walls throw it about, and the
      // stair goes on up into its own paint rather than into the dark.
      kit.scene.background = kit.col('--cmi-wall');
      kit.scene.fog = new T.Fog(kit.col('--cmi-wall'), 16, 48);
      kit.scene.add(new T.HemisphereLight(kit.col('--cmi-lamp'), kit.col('--cmi-tread'), 1.7));

      // THE WALLS, up past the last landing drawn.
      box(0.3, TOP, -back, at(HW + 0.15, TOP / 2, back / 2), '--cmi-wall', false);
      box(0.3, TOP, -back, at(-HW - 0.15, TOP / 2, back / 2), '--cmi-wall', false);
      box(2 * HW + 0.6, TOP, 0.3, at(0, TOP / 2, back - 0.15), '--cmi-wall', false);
      box(HW - 0.6, TOP, 0.3, at(-(HW + 0.6) / 2, TOP / 2, 0.15), '--cmi-wall', false);
      box(HW - 0.6, TOP, 0.3, at((HW + 0.6) / 2, TOP / 2, 0.15), '--cmi-wall', false);
      box(1.2, TOP - 2.2, 0.3, at(0, 2.2 + (TOP - 2.2) / 2, 0.15), '--cmi-wall', false);
      box(2 * HW, 0.1, -back, at(0, -0.05, back / 2), '--cmi-tread', false, false);

      // THE DADO: dark gloss from the floor or the stair up to hand height,
      // the painted line over it, following the treads up every flight and
      // round every landing. Each stretch is a band laid on a wall, its foot
      // on the walking surface.
      var I4 = new T.Matrix4();
      function band(wall, a0, y0, a1, y1, lo, hi, name) {
        var c = wall === 'right' ? HW - 0.01 : wall === 'left' ? -HW + 0.01 : wall === 'back' ? back + 0.01 : -0.01;
        var n = wall === 'right' ? [-1, 0, 0] : wall === 'left' ? [1, 0, 0] : wall === 'back' ? [0, 0, 1] : [0, 0, -1];
        var along = wall === 'right' || wall === 'left';
        function p(a, y) { return along ? [c, y, a] : [a, y, c]; }
        var A = p(a0, y0 + lo), B = p(a1, y1 + lo), C = p(a1, y1 + hi), D = p(a0, y0 + hi);
        var u = new T.Vector3(B[0] - A[0], B[1] - A[1], B[2] - A[2]);
        var v = new T.Vector3(C[0] - A[0], C[1] - A[1], C[2] - A[2]);
        var tri = u.cross(v).dot(new T.Vector3(n[0], n[1], n[2])) > 0 ? [A, B, C, A, C, D] : [A, C, B, A, D, C];
        var pos = [], nor = [];
        tri.forEach(function (q) { pos.push(q[0], q[1], q[2]); nor.push(n[0], n[1], n[2]); });
        var g = new T.BufferGeometry();
        g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
        g.setAttribute('normal', new T.Float32BufferAttribute(nor, 3));
        kit.piece(g, I4, name, false, false);
      }
      function dado(wall, a0, y0, a1, y1) {
        band(wall, a0, y0, a1, y1, 0, 1.1, '--cmi-dado');
        band(wall, a0, y0, a1, y1, 1.1, 1.18, '--cmi-line');
      }
      // The ground storey runs flat under the second flight and the landing.
      dado('left', 0, 0, back, 0);
      dado('back', -HW, 0, HW, 0);
      dado('right', 0, 0, FZ, 0);
      dado('right', BZ, 0, back, 0);
      dado('front', -HW, 0, HW, 0);
      for (var k = 0; k < STOREYS; k++) {
        var y0 = k * STOREY;
        dado('right', FZ, y0, BZ, y0 + RISE);
        dado('right', BZ, y0 + RISE, back, y0 + RISE);
        dado('back', -HW, y0 + RISE, HW, y0 + RISE);
        dado('left', back, y0 + RISE, BZ, y0 + RISE);
        dado('left', BZ, y0 + RISE, FZ, y0 + STOREY);
        dado('left', FZ, y0 + STOREY, 0, y0 + STOREY);
        dado('front', -HW, y0 + STOREY, HW, y0 + STOREY);
        dado('right', 0, y0 + STOREY, FZ, y0 + STOREY);
      }

      // THE FLIGHTS. A flight's step i has its top at base + (i+1) rises; the
      // first flight of the ground storey is solid to the floor, every other
      // stands on a concrete slab along its pitch. White paint on every nosing.
      function flight(side, base) {
        var right = side > 0, cx = side * CX;
        for (var i = 0; i < N; i++) {
          var top = base + (i + 1) * R;
          var z0 = right ? FZ - i * G : BZ + i * G;       // the nosing's edge
          var zc = right ? z0 - G / 2 : z0 + G / 2;
          if (right && base === 0) box(FW, top, G, at(cx, top / 2, zc), '--cmi-tread', 0.012);
          else box(FW, R + 0.02, G, at(cx, top - R / 2 - 0.01, zc), '--cmi-tread', 0.012);
          box(FW, 0.025, 0.06, at(cx, top + 0.012, right ? z0 - 0.03 : z0 + 0.03), '--cmi-nosing', false, false);
          // A baluster at the well's edge of every tread.
          box(0.035, 0.9, 0.035, at(side * (IN + 0.05), top + 0.45, zc), '--cmi-line', false);
        }
        var mid = (FZ + BZ) / 2, ym = base + RISE / 2;
        if (!(right && base === 0)) {
          box(FW, 0.26, LEN, at(cx, ym - 0.15, mid, 0, right ? SLOPE : -SLOPE), '--cmi-tread', 0.012);
        }
        // The handrail over the balusters, along the pitch, in the gloss.
        box(0.08, 0.07, LEN, at(side * (IN + 0.05), ym + 0.95, mid, 0, right ? SLOPE : -SLOPE), '--cmi-dado', 0.01);
        // THE LIFT'S RAIL up the wall side of the flight, on its posts.
        var rm = at(side * (HW - 0.22), ym + 0.38, mid, 0, right ? SLOPE : -SLOPE);
        box(0.1, 0.14, LEN, rm, '--cmi-dado', 0.012);
        box(0.11, 0.025, LEN, M(rm, at(0, 0.08, 0)), '--cmi-nosing', false, false);
        for (var p = 0; p < 4; p++) {
          var f = (p + 0.5) / 4, pz = right ? FZ - f * RUN : BZ + f * RUN, py = base + f * RISE;
          box(0.06, 0.32, 0.06, at(side * (HW - 0.22), py + 0.16, pz), '--cmi-dado', false);
        }
      }
      function landing(y, z0, z1, edge) {
        box(2 * HW, 0.26, Math.abs(z1 - z0), at(0, y - 0.13, (z0 + z1) / 2), '--cmi-tread', 0.012);
        box(2 * HW, 0.025, 0.06, at(0, y + 0.012, edge), '--cmi-nosing', false, false);
        // The guard across the end of the well.
        box(2 * IN + 0.1, 0.07, 0.08, at(0, y + 0.95, edge), '--cmi-dado', 0.01);
        [-0.25, 0, 0.25].forEach(function (x) { box(0.035, 0.9, 0.035, at(x, y + 0.45, edge), '--cmi-line', false); });
        // The rail round the landing, along both walls and across.
        var far = Math.abs(z0) > Math.abs(z1) ? z0 : z1, wz = far < -5 ? far + 0.22 : far - 0.22;
        box(2 * HW - 0.44, 0.14, 0.1, at(0, y + 0.38, wz), '--cmi-dado', 0.012);
        box(2 * HW - 0.44, 0.025, 0.11, at(0, y + 0.46, wz), '--cmi-nosing', false, false);
        [-1, 1].forEach(function (s) {
          box(0.1, 0.14, Math.abs(wz - edge), at(s * (HW - 0.22), y + 0.38, (wz + edge) / 2), '--cmi-dado', 0.012);
          box(0.11, 0.025, Math.abs(wz - edge), at(s * (HW - 0.22), y + 0.46, (wz + edge) / 2), '--cmi-nosing', false, false);
        });
      }
      // The ground storey's rail starts at the foot of the first flight.
      box(0.1, 0.14, 1.4, at(HW - 0.22, 0.38, FZ + 0.7), '--cmi-dado', 0.012);
      box(0.11, 0.025, 1.4, at(HW - 0.22, 0.46, FZ + 0.7), '--cmi-nosing', false, false);
      box(0.06, 0.32, 0.06, at(HW - 0.22, 0.16, FZ + 1.1), '--cmi-dado', false);
      for (var s = 0; s < STOREYS; s++) {
        flight(1, s * STOREY);
        landing(s * STOREY + RISE, BZ, back, BZ);
        flight(-1, s * STOREY + RISE);
        landing((s + 1) * STOREY, 0, FZ, FZ);
      }

      // THE FIRE DOORS, the one you came in by and one onto every floor over
      // it, each with its push bar and its wired window.
      for (var d = 0; d <= STOREYS; d++) {
        var dy = d * STOREY;
        box(1.1, 2.15, 0.08, at(0, dy + 1.08, -0.06), '--cmi-dado', 0.012);
        box(0.9, 0.06, 0.05, at(0, dy + 1.0, -0.12), '--cmi-nosing', false);
        box(0.36, 0.5, 0.02, at(0.2, dy + 1.6, -0.11), '--cmi-tread', false, false);
      }

      // A LAMP ON EVERY LANDING: a bulkhead on the wall, lit the same at the
      // top as at the bottom.
      var lamps = [[-2.3, 2.5, -0.02, Math.PI]];
      for (var l = 0; l < STOREYS; l++) {
        lamps.push([0, l * STOREY + RISE + 2.3, back + 0.02, 0]);
        lamps.push([2.3, (l + 1) * STOREY + 2.3, -0.02, Math.PI]);
      }
      lamps.forEach(function (q, i) {
        var lm = at(q[0], q[1], q[2], q[3]);
        box(0.5, 0.32, 0.06, M(lm, at(0, 0, 0.03)), '--cmi-dado', 0.01);
        kit.flat(new T.CircleGeometry(0.13, 20).scale(1.4, 1, 1), M(lm, at(0, 0, 0.065)), '--cmi-lamp');
        if (i < 7) {
          var light = new T.PointLight(kit.col('--cmi-lamp'), 6, 10, 1.4);
          var lp = new T.Vector3(q[0], q[1] - 0.2, q[2] + (q[3] ? -0.6 : 0.6));
          light.position.copy(lp);
          kit.scene.add(light);
        }
      });

      // THE CHAIRLIFT, parked on the first landing against the right-hand
      // wall, facing out over the landing: its carriage on the rail, the
      // column, the seat and back in the nosing's white on the gloss, the
      // arms, and the footplate folded down.
      var cg = at(HW - 0.62, RISE, BZ - 0.6, RIGHT);
      box(0.56, 0.44, 0.3, M(cg, at(0, 0.38, -0.38)), '--cmi-dado', 0.012);
      box(0.12, 0.3, 0.12, M(cg, at(0, 0.62, -0.2)), '--cmi-dado', false);
      box(0.6, 0.1, 0.52, M(cg, at(0, 0.56, 0.02)), '--cmi-dado', 0.012);
      box(0.54, 0.07, 0.46, M(cg, at(0, 0.645, 0.03)), '--cmi-nosing', 0.01);
      box(0.6, 0.78, 0.1, M(cg, at(0, 1.0, -0.24)), '--cmi-dado', 0.012);
      box(0.5, 0.6, 0.04, M(cg, at(0, 1.01, -0.18)), '--cmi-nosing', false);
      [-1, 1].forEach(function (e) {
        box(0.07, 0.07, 0.44, M(cg, at(e * 0.31, 0.86, 0.04)), '--cmi-dado', 0.01);
        box(0.05, 0.22, 0.05, M(cg, at(e * 0.31, 0.72, 0.2)), '--cmi-dado', false);
      });
      cyl(0.03, 0.03, 0.03, M(cg, at(0.31, 0.905, 0.18)), '--cmi-nosing', false, 10);
      box(0.48, 0.04, 0.34, M(cg, at(0, 0.1, 0.26)), '--cmi-dado', 0.01);
      box(0.48, 0.025, 0.04, M(cg, at(0, 0.125, 0.41)), '--cmi-nosing', false, false);
      box(0.08, 0.5, 0.08, M(cg, at(0, 0.32, 0.12)), '--cmi-dado', false);

      // ITS CALL BUTTONS: at the foot of the stairs, and on the landing.
      [[FZ + 0.5, 1.34], [back + 0.6, RISE + 1.34]].forEach(function (c) {
        var bm = at(HW - 0.02, c[1], c[0], RIGHT);
        box(0.18, 0.26, 0.06, M(bm, at(0, 0, 0.03)), '--cmi-dado', 0.01);
        cyl(0.05, 0.05, 0.02, M(bm, at(0, 0.03, 0.07, 0, LEFT)), '--cmi-nosing', false, 16);
      });

      // THE ROOM'S OWN PAGE, on the left-hand wall under the second flight,
      // where climbing by number or by the lift is done.
      var pw = 2.6, ph = pw * 800 / 1180, py = 0.8 + ph / 2;
      var pg = at(-HW + 0.02, 0, -5.0, LEFT);
      box(pw + 0.16, ph + 0.16, 0.05, M(pg, at(0, py, 0)), '--cmi-dado', 0.012);
      // Seen from the left of the well only: from the right, the first
      // flight's balusters stand between you and it.
      var LEFTSIDE = [-HW, 0.2, back, 0];
      var page = kit.screen(1180, 800, pw, M(pg, at(0, py, 0.04)), 'Count Me In’s own page, on the left-hand wall under the stair', LEFTSIDE);

      // How the stair works, on the back wall under the landing, and the
      // room's name over the fire door, facing in.
      var rules = kit.lift(page, '.cmi-part', { n: 0, w: 700, h: 560, ww: 2.2, m: at(-1.6, 0.6, back + 0.03), zone: LEFTSIDE });
      var head = kit.lift(page, '.cmi-head', { w: 760, ww: 2.4, m: at(0, 2.35, -0.04, Math.PI) });

      var CHAIR = new T.Vector3(HW - 0.62, RISE + 0.8, BZ - 0.6);
      function look(x, z) { return Math.atan2(-(CHAIR.x - x), -(CHAIR.z - z)); }
      var stops = [
        { name: 'just through the fire door, at the foot of the stairwell', x: -0.4, z: -0.7, yaw: -0.4, pitch: 0.15 },
        { name: 'at the foot of the first flight, looking up it', x: CX, z: -1.1, yaw: 0, pitch: 0.32 },
        { name: 'at the foot of the lift’s rail, its chair parked on the landing above', x: 2.3, z: -1.2, yaw: look(2.3, -1.2), pitch: 0.28 },
        { name: 'at the lift’s call button, on the wall at the foot of the stairs', x: 2.2, z: FZ + 0.6, yaw: RIGHT, pitch: -0.12 },
        { name: 'under the stair, looking up the well at the landings over it, each lit the same', x: 0, z: FZ - 0.3, yaw: 0, pitch: 0.75 },
        { name: 'at the left-hand wall, with the room’s own page on it', x: -0.6, z: -5.0, yaw: LEFT, pitch: 0.05, page: kit.page, frame: page },
        { name: 'at the back wall under the landing, with how the stair works', x: -1.6, z: -7.0, yaw: 0, pitch: 0.1, frame: rules.el },
        { name: 'looking back at the fire door, with the room’s name over it', x: 0.3, z: -2.0, yaw: Math.PI, pitch: 0.3, frame: head.el }
      ];

      return {
        start: { x: -0.4, z: -0.7, yaw: -0.4 },
        // The hall at the foot, and the floor under the second flight and the
        // landing; the first flight's concrete is solid to the floor.
        bounds: { x: [-HW + 0.6, HW - 0.6], z: [-9.0, -0.5], areas: [
          { x: [-HW + 0.6, HW - 0.6], z: [FZ + 0.4, -0.5] },
          { x: [-HW + 0.6, 0.1], z: [-9.0, -0.5] },
          { x: [-HW + 0.6, HW - 0.6], z: [-9.0, BZ - 0.6] }
        ] },
        stops: stops
      };
    }
  };
})();

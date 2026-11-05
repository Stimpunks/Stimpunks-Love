/* =============================================================================
   The Sunshine Sanctuary for Sick Dragons, walked into on Cel Street, over the
   bridge behind Widdershins. Ryan's ask, 2026-11-04: subrooms of Widdershins
   after places in the Discworld novels, in the city over the bridge.

   A WALLED YARD AT NOON UNDER A SUN YOU CAN LOOK AT (§145). You come in by the
   gate in the near wall, and the yard is in front of you: sand from wall to
   wall, low brick pens along the back with doorways and no doors, a bucket of
   sand and a bucket of water at every doorway, chimney stacks over the far
   wall breathing their smoke, and up in the smoke the sun, turned down to a
   pale disc. Small dark green dragons are about the yard, on the sand and on a
   pen's roof; the ones awake each breathe a little flame, and the ones asleep
   are curled with a wisp of smoke going up.

   THE LIGHT IS THE WHOLE SMOKY SKY, so nothing here casts a shadow of its own:
   every piece is drawn with its shadow switched off, and a soft disc of
   --ssd-shade lies round the foot of each thing instead. The flames are drawn
   unlit, in --ssd-flame, so they are the brightest things in the yard, and
   the sun, --ssd-sun, is not; they light nothing. NOBODY FROM THE BOOK IS
   DRAWN: the dragons are small and nobody's in particular, and the lady whose
   sanctuary it is is not here. NOTHING MOVES, not a flame and not the smoke;
   the one thing to press, the buckets, only says what is in them. Every colour
   is one §2 declares for this room, by name. It keeps nothing, sends nothing
   and fetches nothing; its page arrives through Cel Street's screen().
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['sunshine-sanctuary.html'] = {
    name: 'The Sunshine Sanctuary for Sick Dragons',
    from: 'widdershins.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at;
      var ONE = new T.Matrix4();
      var FLAT = -Math.PI / 2;

      // THE SKY IS SMOKE, AND IT LIGHTS EVERYTHING AT ONCE.
      kit.scene.background = kit.col('--ssd-smog');
      kit.scene.add(new T.HemisphereLight(kit.col('--ssd-haze'), kit.col('--ssd-sand'), 2.3));
      var high = new T.DirectionalLight(kit.col('--ssd-sun'), 0.7);
      high.position.set(2, 20, -6); high.target.position.set(0, 0, -6);
      kit.scene.add(high, high.target);

      function ball(r, sx, sy, sz, m, ink, outline) {
        var g = new T.SphereGeometry(r, 16, 12); g.scale(sx, sy, sz);
        kit.piece(g, m, ink, outline === undefined ? 0.02 : outline, false);
      }
      function tube(pts, r, ink, outline) {
        kit.piece(new T.TubeGeometry(new T.CatmullRomCurve3(pts), Math.max(20, pts.length * 6), r, 8, false), ONE, ink,
          outline === undefined ? false : outline, false);
      }
      // A SOFT SHADOW round a thing's own feet, never to one side.
      function shade(x, z, rx, rz) {
        var g = new T.CircleGeometry(1, 28); g.scale(rx, rz || rx, 1);
        kit.flat(g, at(x, 0.012, z, 0, FLAT), '--ssd-shade');
      }

      // THE SAND, the whole floor, and the walls round it.
      var X = 8, BACK = -14, NEAR = 2.6, WALL_H = 2.4;
      kit.box(2 * X + 1, 0.1, NEAR - BACK + 1, at(0, -0.05, (NEAR + BACK) / 2), '--ssd-sand', false, false);
      function wall(w, d, m) {
        kit.box(w, WALL_H, d, m, '--ssd-brick', 0.03, false);
      }
      wall(2 * X, 0.4, at(0, WALL_H / 2, BACK));
      wall(0.4, NEAR - BACK, at(-X, WALL_H / 2, (NEAR + BACK) / 2));
      wall(0.4, NEAR - BACK, at(X, WALL_H / 2, (NEAR + BACK) / 2));
      // The near wall, with the gate you came in by standing open in it.
      var GATE = 0.9;
      wall(X - GATE, 0.4, at(-(X + GATE) / 2, WALL_H / 2, NEAR));
      wall(X - GATE, 0.4, at((X + GATE) / 2, WALL_H / 2, NEAR));
      [[0, BACK, 2 * X + 0.5, 0.6], [-X, (NEAR + BACK) / 2, 0.6, NEAR - BACK], [X, (NEAR + BACK) / 2, 0.6, NEAR - BACK]].forEach(function (c) {
        kit.box(c[2], 0.12, c[3], at(c[0], WALL_H + 0.06, c[1]), '--ssd-soot-2', false, false);
      });
      // Brick courses on the inside of the back wall, a line every so often.
      for (var y = 0.3; y < WALL_H; y += 0.3) {
        kit.box(2 * X - 0.1, 0.02, 0.02, at(0, y, BACK + 0.21), '--ssd-soot-2', false, false);
      }
      // The gate's iron, swung open against the wall.
      for (var g = 0; g < 5; g++) {
        kit.cyl(0.025, 0.025, 2.0, at(GATE + 0.12 + g * 0.16, 1.0, NEAR - 0.3 - g * 0.12), '--ssd-iron', 0.01);
      }
      kit.box(0.04, 0.05, 0.9, at(GATE + 0.45, 1.9, NEAR - 0.55, -0.62), '--ssd-iron', 0.01, false);

      // THE CITY OVER THE WALL is only its chimneys, breathing smoke.
      [[-6.2, 4.4], [-3.4, 5.6], [-0.6, 3.8], [2.6, 5.0], [5.6, 4.2]].forEach(function (c, i) {
        var z = BACK - 2.5 - (i % 2) * 1.6;
        kit.box(0.9, c[1], 0.9, at(c[0], c[1] / 2, z), '--ssd-murk', 0.03, false);
        kit.box(1.1, 0.2, 1.1, at(c[0], c[1] + 0.1, z), '--ssd-murk', 0.02, false);
        for (var k = 0; k < 4; k++) {
          ball(0.45 + 0.22 * k, 1, 0.8, 1, at(c[0] + 0.5 * k, c[1] + 0.6 + 0.75 * k, z - 0.2 * k), '--ssd-murk', false);
        }
      });

      // THE SUN, high in the smoke ahead, a pale disc you could look straight
      // at, rimmed; no rays, and it is not the brightest thing here.
      var SUN = at(-13, 19, -46);
      kit.flat(new T.CircleGeometry(2.4, 40), SUN, '--ssd-sun');
      kit.flat(new T.RingGeometry(2.4, 2.55, 40), at(-13, 19, -45.98), '--ssd-flame-2');

      // THE PENS along the back wall: brick, round-topped, a doorway and no
      // door, straw spilling out onto the sand, and a bucket of sand and a
      // bucket of water by every doorway.
      var PEN_Z = BACK + 1.2, PW = 2.0, PH = 1.0, PD = 1.6;
      var pens = [-5.2, -1.8, 1.6, 5.0];
      var touches = [];
      pens.forEach(function (px) {
        shade(px, PEN_Z + 0.2, PW * 0.75, 1.1);
        kit.box(PW, PH, PD, at(px, PH / 2, PEN_Z), '--ssd-brick', 0.03, false);
        var roof = new T.CylinderGeometry(PW / 2, PW / 2, PD, 24, 1, false, Math.PI / 2, Math.PI);
        kit.piece(roof, at(px, PH, PEN_Z, 0, Math.PI / 2, 0), '--ssd-brick', 0.03, false);
        var door = new T.Shape();
        door.moveTo(-0.38, 0); door.lineTo(-0.38, 0.62); door.absarc(0, 0.62, 0.38, Math.PI, 0, true); door.lineTo(0.38, 0); door.lineTo(-0.38, 0);
        kit.flat(new T.ShapeGeometry(door, 16), at(px, 0.01, PEN_Z + PD / 2 + 0.01), '--ssd-soot');
        ball(0.5, 1.2, 0.18, 0.6, at(px, 0.04, PEN_Z + PD / 2 + 0.25), '--ssd-straw', 0.01);
        [['--ssd-sand', 0.55], ['--ssd-haze', 0.95]].forEach(function (b) {
          var bx = px + PW / 2 + b[1] - 0.3, bz = PEN_Z + PD / 2 + 0.35;
          shade(bx, bz, 0.3, 0.3);
          kit.cyl(0.2, 0.16, 0.42, at(bx, 0.21, bz), '--ssd-iron', 0.015, 16);
          kit.flat(new T.CircleGeometry(0.19, 20), at(bx, 0.425, bz, 0, FLAT), b[0]);
          tube([new T.Vector3(bx - 0.2, 0.42, bz), new T.Vector3(bx, 0.66, bz), new T.Vector3(bx + 0.2, 0.42, bz)], 0.012, '--ssd-soot');
        });
        touches.push(kit.touch(1.4, 0.8, 0.8, at(px + PW / 2 + 0.45, 0.4, PEN_Z + PD / 2 + 0.35)));
      });

      // THE DRAGONS: small, dark green, nobody's in particular. (x, z) is where
      // its feet are and yaw which way it faces; s its size. The ones awake
      // breathe a little flame, drawn unlit, the brightest thing in the yard.
      function dragon(x, y0, z, yaw, s, breathe) {
        var D = at(x, y0, z, yaw);
        function d(px, py, pz, ry, rx, rz) { return at(px * s, py * s, pz * s, ry, rx, rz, D); }
        if (!y0) shade(x, z, 0.55 * s, 0.4 * s);
        ball(0.38, 1, 0.58, 0.62, d(0, 0.42, 0), '--ssd-scale');
        ball(0.3, 1, 0.3, 0.5, d(0.02, 0.32, 0), '--ssd-scale-2', false);
        [[0.2, 0.14], [0.2, -0.14], [-0.2, 0.14], [-0.2, -0.14]].forEach(function (l) {
          kit.cyl(0.055 * s, 0.06 * s, 0.26 * s, d(l[0], 0.13, l[1]), '--ssd-scale', 0.01);
        });
        // the neck and the long head, a little up
        tube([new T.Vector3(0.3, 0.5, 0), new T.Vector3(0.44, 0.66, 0), new T.Vector3(0.52, 0.78, 0)].map(function (p) {
          return p.multiplyScalar(s).applyMatrix4(D);
        }), 0.09 * s, '--ssd-scale', 0.01);
        ball(0.17, 1.5, 0.75, 0.8, d(0.62, 0.8, 0), '--ssd-scale');
        [-1, 1].forEach(function (sd) {
          ball(0.025, 1, 1, 1, d(0.66, 0.86, sd * 0.1), '--ssd-soot', false);
          kit.cyl(0.0, 0.035 * s, 0.14 * s, d(0.52, 0.94, sd * 0.07, 0, 0, -0.5), '--ssd-scale-2', 0.008);
        });
        // a small folded wing either side
        var wing = new T.Shape();
        wing.moveTo(0, 0); wing.quadraticCurveTo(0.16, 0.34, 0.36, 0.3); wing.quadraticCurveTo(0.2, 0.12, 0.3, 0); wing.lineTo(0, 0);
        [-1, 1].forEach(function (sd) {
          var wg = new T.ShapeGeometry(wing, 10); wg.scale(s, s, s);
          kit.piece(wg, d(-0.2, 0.6, sd * 0.2, 0, sd * 0.5, 0), '--ssd-scale-2', 0.012, false);
        });
        // the tail, curling up behind
        tube([new T.Vector3(-0.34, 0.42, 0), new T.Vector3(-0.6, 0.34, 0.06), new T.Vector3(-0.74, 0.46, 0.1), new T.Vector3(-0.66, 0.6, 0.06)].map(function (p) {
          return p.multiplyScalar(s).applyMatrix4(D);
        }), 0.05 * s, '--ssd-scale', 0.01);
        if (breathe) {
          var cone = new T.ConeGeometry(0.1 * s, 0.46 * s, 14);
          kit.flat(cone, d(1.06, 0.8, 0, 0, 0, -Math.PI / 2), '--ssd-flame');
          kit.flat(new T.SphereGeometry(0.07 * s, 10, 8), d(0.86, 0.8, 0), '--ssd-flame-2');
        }
      }
      // A dragon asleep on the sand, curled with its tail round its nose and a
      // wisp of smoke going up. No flame: asleep, it lights nothing at all.
      function sleeper(x, z, yaw, s) {
        var D = at(x, 0, z, yaw);
        function d(px, py, pz, ry, rx, rz) { return at(px * s, py * s, pz * s, ry, rx, rz, D); }
        shade(x, z, 0.55 * s, 0.5 * s);
        ball(0.36, 1, 0.48, 0.85, d(0, 0.2, 0), '--ssd-scale');
        ball(0.15, 1.4, 0.6, 0.8, d(0.32, 0.12, 0.26, -0.8), '--ssd-scale');
        tube([new T.Vector3(-0.3, 0.12, -0.1), new T.Vector3(-0.2, 0.08, 0.32), new T.Vector3(0.12, 0.07, 0.42)].map(function (p) {
          return p.multiplyScalar(s).applyMatrix4(D);
        }), 0.05 * s, '--ssd-scale', 0.01);
        var wing = new T.SphereGeometry(0.2, 12, 8); wing.scale(1.2 * s, 0.3 * s, 0.8 * s);
        kit.piece(wing, d(-0.04, 0.36, 0), '--ssd-scale-2', 0.01, false);
        tube([new T.Vector3(0.46, 0.2, 0.3), new T.Vector3(0.5, 0.5, 0.36), new T.Vector3(0.44, 0.8, 0.32), new T.Vector3(0.52, 1.1, 0.4)].map(function (p) {
          return p.multiplyScalar(s).applyMatrix4(D);
        }), 0.025 * s, '--ssd-murk');
      }
      dragon(-1.8, PH + PW / 2 - 0.05, PEN_Z, 0.6, 0.85, true);   // up on a pen's roof
      dragon(1.6, 0, PEN_Z + PD / 2 + 0.55, -1.3, 0.8, true);    // coming out of a doorway
      dragon(-2.3, 0, -6.4, -0.4, 1.0, true);
      dragon(2.6, 0, -7.6, 2.6, 1.05, true);
      dragon(0.6, 0, -4.2, 0.9, 0.7, true);
      sleeper(-2.2, -9.2, 0.4, 1.0);
      sleeper(2.4, -3.4, 2.2, 0.9);

      // THE BUCKETS, the one thing here to press: it only says what is in them.
      var buckets = kit.press({
        say: 'Look in the buckets',
        press: function () { return 'Sand in one and water in the other, at every doorway, already there. The water has the smoky sky lying on it.'; },
        at: touches
      });

      // THE ROOM'S OWN PAGE, on a board just inside the gate you came in by,
      // facing into the yard.
      var pw = 2.2, ph = pw * 800 / 1180;
      var frame = kit.screen(1180, 800, pw, at(-2.3, 0.45 + ph / 2, NEAR - 0.35, Math.PI), 'The Sunshine Sanctuary’s own page, on a board just inside the gate');

      // THE PAGE'S WORDS, lifted off it, standing on the sand on either side of
      // the way up the yard and each turned towards it.
      var SIDE = 4.4, BACKOFF = 2.2;
      function plate(sel, n, w, ww, side, z, h) {
        var ry = side < 0 ? 0.5 : -0.5, px = side * SIDE;
        var it = kit.lift(frame, sel, { n: n, w: w, ww: ww, h: h, m: at(px, 0.3, z, ry) });
        it.stand = { x: px + Math.sin(ry) * BACKOFF, z: z + Math.cos(ry) * BACKOFF, yaw: ry };
        shade(px, z, ww * 0.4, 0.25);
        return it;
      }
      var head = plate('.ssd-head', 0, 760, 1.6, 1, -0.6);
      var lede = plate('.ssd-lede', 0, 700, 1.5, -1, -1.8, 720);
      var part = [];
      [[1, -3.4, 760], [-1, -5.0, 760], [1, -6.6, 760], [-1, -8.2, 760], [1, -9.8, 700], [-1, -10.6, 640]].forEach(function (q, i) {
        part.push(plate('.ssd-part', i, 720, 1.5, q[0], q[1], q[2]));
      });

      function by(name, it, pitch) {
        return { name: name, x: it.stand.x, z: it.stand.z, yaw: it.stand.yaw, pitch: pitch, frame: it.el };
      }
      var stops = [
        { name: 'just inside the gate, the yard of sand in front of you, the pens along the far wall and the sun up in the smoke', x: 0, z: 1.4, yaw: 0, pitch: 0.06 },
        by('at the name, The Sunshine Sanctuary for Sick Dragons', head, -0.1),
        by('at what this yard is, and whose', lede, -0.12),
        by('at a home, not a waiting room', part[0], -0.12),
        by('at sick, and staying here', part[1], -0.12),
        by('at what is in the yard', part[2], -0.12),
        by('at kept by everybody in it', part[3], -0.12),
        by('at what is not in this yard', part[4], -0.1),
        by('at next door, and over the bridge', part[5], -0.08),
        { name: 'among the dragons on the sand, the ones awake each breathing a little flame', x: -0.4, z: -1.6, yaw: 0.05, pitch: -0.2 },
        { name: 'at the pens, their doorways open, a bucket of sand and a bucket of water by each', x: 0, z: PEN_Z + 4.0, yaw: 0, pitch: -0.1, acts: [buckets] },
        { name: 'looking up at the sun, turned down by the smoke to a pale disc you can look straight at', x: -0.4, z: -9.5, yaw: -0.12, pitch: 0.42 },
        { name: 'back at the gate you came in by, with the room’s own page on its board', x: -2.3, z: 0.3, yaw: Math.PI, pitch: -0.02, page: kit.page, frame: frame }
      ];

      return {
        start: { x: 0, z: 1.4, yaw: 0 },
        bounds: { x: [-X + 0.8, X - 0.8], z: [PEN_Z + 2.6, NEAR - 0.6] },
        stops: stops
      };
    }
  };
})();

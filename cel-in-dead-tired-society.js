/* =============================================================================
   Dead Tired Society, walked into on Cel Street. Ryan's ask, 2026-10-31: back
   on the street, working down it a room at a time.

   IT IS THE SOCIETY'S WORLD AND NOBODY ELSE'S (§40): a room somebody has
   borrowed after hours, with the big lights switched off and the door left
   ajar. THE ONLY LIGHT IS THE CORRIDOR'S, through the gap, and it lies on the
   floor as one hard wedge that NOBODY IS SITTING IN. Every word in here stays
   in the shade: the page, the standing orders, the pegs and the talking piece
   all stand away from the wedge, because masking is performing under a light
   and this is the room where nothing has to. Nothing is lit to make it pop.
   The tubes out in the corridor are steady; they do not flicker.

   It is not the Mopery, which the name invites: no candle, no book, no stone,
   no tweed, and nothing old. It is a modern room with its ceiling panels dark,
   stacking chairs in a loose circle, folding tables stacked against a wall, and
   coats and bags on the pegs by the door. Nobody is drawn.

   THE PEGS, THE STANDING ORDERS AND THE TALKING PIECE ARE THE ROOM'S OWN,
   lifted off its page by the kit, and dead-tired.js, which the page loads, is
   run against the copy: passing is first and the same size, and what you say
   goes nowhere. No advice, nothing counted.

   NOTHING MOVES. Every colour is one the room declares, by name. It keeps
   nothing, sends nothing and fetches nothing; its page arrives through Cel
   Street's screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['dead-tired-society.html'] = {
    name: 'Dead Tired Society',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var W = 9, D = 8, H = 3.0, back = -D;
      var L = -W / 2, R = W / 2;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var DOOR = { x0: 2.2, x1: 3.2, h: 2.1, open: 1.1 };   // hinged at x0, swung into the room

      // THE BIG LIGHTS ARE OFF: only a little of the dark, and the corridor.
      kit.scene.background = kit.col('--dts-deep');
      kit.scene.add(new T.HemisphereLight(kit.col('--dts-dim'), kit.col('--dts-deep'), 1.4));

      // THE ROOM: floor, ceiling and four walls, the front wall with the door
      // in it, on the right as you come in.
      box(W + 0.4, 0.1, D + 0.4, at(0, -0.05, back / 2), '--dts-deep', false, false);
      box(W + 0.4, 0.12, D + 0.4, at(0, H + 0.06, back / 2), '--dts-deep', false, false);
      box(0.2, H, D, at(L - 0.1, H / 2, back / 2), '--dts-room');
      box(0.2, H, D, at(R + 0.1, H / 2, back / 2), '--dts-room');
      box(W + 0.4, H, 0.2, at(0, H / 2, back - 0.1), '--dts-room');
      // The front wall, with the doorway cut out of it.
      // It and the door cast shadows, so the corridor's light comes in only
      // through the gap.
      box(DOOR.x0 - L, H, 0.2, at((L + DOOR.x0) / 2, H / 2, 0.1), '--dts-room', 0.02, true);
      box(R - DOOR.x1, H, 0.2, at((R + DOOR.x1) / 2, H / 2, 0.1), '--dts-room', 0.02, true);
      box(DOOR.x1 - DOOR.x0, H - DOOR.h, 0.2, at((DOOR.x0 + DOOR.x1) / 2, DOOR.h + (H - DOOR.h) / 2, 0.1), '--dts-room', 0.02, true);
      // A skirting and the door's frame, standing in the shade.
      [[L + 0.02, back / 2, D, LEFT], [R - 0.02, back / 2, D, LEFT], [0, back + 0.02, W, 0]].forEach(function (s) {
        box(s[2], 0.08, 0.02, at(s[0], 0.04, s[1], s[3]), '--dts-edge', false);
      });
      [DOOR.x0 - 0.04, DOOR.x1 + 0.04].forEach(function (x) { box(0.08, DOOR.h, 0.24, at(x, DOOR.h / 2, 0.1), '--dts-edge', 0.01); });
      box(DOOR.x1 - DOOR.x0 + 0.16, 0.08, 0.24, at((DOOR.x0 + DOOR.x1) / 2, DOOR.h + 0.04, 0.1), '--dts-edge', 0.01);
      // The door, hinged on the left and left ajar into the room.
      var hinge = at(DOOR.x0, 0, 0, DOOR.open);
      var dw = DOOR.x1 - DOOR.x0;
      box(dw, DOOR.h - 0.02, 0.05, M(hinge, at(dw / 2, (DOOR.h - 0.02) / 2, -0.03)), '--dts-room', 0.02, true);
      kit.cyl(0.02, 0.02, 0.12, M(hinge, at(dw - 0.1, 1.0, -0.08, 0, Math.PI / 2)), '--dts-edge', false, 8);

      // THE CORRIDOR beyond the door, its strip lights on and steady: the one
      // lit place, seen only through the gap.
      var CZ = 2.6;
      kit.flat(new T.PlaneGeometry(4, CZ), at(DOOR.x1, 0.002, CZ / 2, 0, -Math.PI / 2), '--dts-pale');
      kit.flat(new T.PlaneGeometry(4, H), at(DOOR.x1, H / 2, CZ), '--dts-hall');
      kit.flat(new T.PlaneGeometry(4, CZ), at(DOOR.x1, H, CZ / 2, 0, Math.PI / 2), '--dts-pale');
      [0.8, 1.9].forEach(function (z) { kit.flat(new T.BoxGeometry(1.6, 0.05, 0.12), at(DOOR.x1, H - 0.05, z), '--dts-hall'); });
      // Its light through the gap, falling as a hard wedge across the floor.
      var spot = new T.SpotLight(kit.col('--dts-hall'), 28, 16, 0.75, 0, 1.2);
      spot.position.set(3.7, 2.5, 2.3);
      spot.target.position.set(1.4, 0, -6.0);
      spot.castShadow = true;
      spot.shadow.mapSize.set(1024, 1024);
      spot.shadow.bias = -0.0008;
      kit.scene.add(spot, spot.target);
      // The wedge itself, where the gap throws it: from the jamb and from the
      // edge of the open door, out along the floor, away from where anybody sits.
      var src = new T.Vector2(3.7, 2.3);
      var jamb = new T.Vector2(DOOR.x1, 0);
      var latch = new T.Vector2(DOOR.x0 + dw * Math.cos(DOOR.open), -dw * Math.sin(DOOR.open));
      function reach(p, toZ) {
        var d = p.clone().sub(src), k = (toZ - p.y) / d.y;
        return new T.Vector2(p.x + d.x * k, toZ);
      }
      var far = -6.6;
      var wedge = new T.Shape();
      [jamb, latch, reach(latch, far), reach(jamb, far)].forEach(function (p, i) {
        if (i) wedge.lineTo(p.x, -p.y); else wedge.moveTo(p.x, -p.y);
      });
      var lit = kit.flat(new T.ShapeGeometry(wedge), at(0, 0.006, 0, 0, -Math.PI / 2), '--dts-hall');
      lit.material.transparent = true; lit.material.opacity = 0.42;

      // THE CEILING'S PANELS, the big lights, switched off.
      for (var px = -3; px <= 3; px += 3) {
        for (var pz = -2; pz >= -6; pz -= 2.6) {
          box(1.2, 0.04, 0.6, at(px, H - 0.03, pz), '--dts-deep', 0.01, false);
        }
      }

      // FOLDING TABLES stacked on their sides against the right-hand wall,
      // borrowed with the room and put away.
      for (var t = 0; t < 4; t++) {
        box(1.8, 0.75, 0.04, at(R - 0.12 - t * 0.06, 0.4, -6.9, RIGHT), '--dts-edge', 0.012);
      }

      // THE CIRCLE: stacking chairs, loosely, in the shade on the left.
      var C = { x: -1.4, z: -4.3 }, RAD = 1.75, N = 7;
      function chair(m) {
        box(0.46, 0.04, 0.42, M(m, at(0, 0.45, 0)), '--dts-edge', 0.012);
        box(0.46, 0.34, 0.03, M(m, at(0, 0.66, -0.2, 0, -0.08)), '--dts-edge', 0.012);
        [[-0.2, -0.18], [0.2, -0.18], [-0.2, 0.18], [0.2, 0.18]].forEach(function (l) {
          kit.cyl(0.012, 0.012, 0.45, M(m, at(l[0], 0.225, l[1])), '--dts-dim', false, 6);
        });
      }
      var seats = [];
      for (var i = 0; i < N; i++) {
        var a = (i / N) * Math.PI * 2 + 0.35 + (i % 3 - 1) * 0.07;
        var r = RAD + (i % 2 ? 0.12 : -0.06);
        var x = C.x + Math.sin(a) * r, z = C.z + Math.cos(a) * r;
        var face = Math.atan2(C.x - x, C.z - z);
        chair(at(x, 0, z, face));
        seats.push({ x: x, z: z, face: face });
      }
      // The chair with the talking piece on it: the one at the back left.
      var held = seats.reduce(function (b, s) { return (s.x + s.z) < (b.x + b.z) ? s : b; });
      var piece = new T.SphereGeometry(0.09, 16, 10); piece.scale(1.3, 0.55, 1);
      kit.piece(piece, at(held.x, 0.52, held.z), '--dts-dim', 0.01);

      // THE ROOM'S OWN PAGE on the left-hand wall, in the shade.
      var pw = 2.6, ph = pw * 800 / 1180, py = 0.9 + ph / 2;
      box(pw + 0.16, ph + 0.16, 0.06, at(L + 0.04, py, -2.6, LEFT), '--dts-edge');
      var frame = kit.screen(1180, 800, pw, at(L + 0.08, py, -2.6, LEFT), 'Dead Tired Society’s own page, on the left-hand wall');

      // THE TALKING PIECE, the page's own, on a low stand just outside the
      // circle behind the chair it is on, facing in. Passing is first.
      var outward = Math.atan2(held.x - C.x, held.z - C.z);
      var tx = held.x + Math.sin(outward) * 0.7, tz = held.z + Math.cos(outward) * 0.7;
      var turnFace = Math.atan2(C.x - tx, C.z - tz);
      box(0.05, 0.6, 0.05, at(tx, 0.3, tz), '--dts-edge', 0.01);
      var turn = kit.lift(frame, '.dts-part.dts-turn', { w: 820, ww: 1.3, m: M(at(tx, 0.62, tz, turnFace), at(0, 0, 0.04)) });
      kit.wire(frame, 'dead-tired.js');

      // THE STANDING ORDERS and what we mean by dead tired, on the back wall.
      var orders = kit.lift(frame, '.dts-part', { n: 0, w: 900, h: 760, ww: 1.9, m: at(-2.1, 0.55, back + 0.04) });
      var means = kit.lift(frame, '.dts-part', { n: 1, w: 900, h: 760, ww: 1.9, m: at(1.4, 0.55, back + 0.04) });

      // BY THE DOOR, ON THE PEGS: a rail of pegs on the front wall, and the
      // page's own pegs under it, every coat and bag somebody took off.
      box(2.6, 0.06, 0.06, at(-1.6, 2.05, -0.06), '--dts-edge', 0.01);
      for (var k = 0; k < 6; k++) kit.cyl(0.02, 0.02, 0.12, at(-2.75 + k * 0.46, 2.0, -0.12, 0, Math.PI / 2), '--dts-dim', false, 6);
      var pegs = kit.lift(frame, '.dts-part', { n: 2, w: 900, h: 760, ww: 2.0, m: at(-1.6, 0.4, -0.08, Math.PI) });
      var worse = kit.lift(frame, '.dts-worse', { w: 600, ww: 0.95, m: at(0.75, 0.95, -0.08, Math.PI) });

      // WHAT IS NOT IN THIS ROOM, and where the society actually meets, on the
      // right-hand wall at the back, out of the wedge.
      var notHere = kit.lift(frame, '.dts-part', { n: 4, w: 900, h: 700, ww: 1.6, m: at(R - 0.04, 0.55, -5.2, RIGHT) });
      var meets = kit.lift(frame, '.dts-part', { n: 5, w: 900, h: 700, ww: 1.6, m: at(R - 0.04, 0.55, -3.2, RIGHT) });

      return {
        start: { x: 1.5, z: -1.2, yaw: 0.35 },
        bounds: { x: [L + 0.6, R - 0.6], z: [back + 0.7, -0.6] },
        stops: [
          { name: 'just inside the door, beside the light from the corridor, not in it', x: 1.5, z: -1.2, yaw: 0.35 },
          { name: 'at the edge of the wedge of light, looking back out through the gap', x: 1.45, z: -3.6, yaw: Math.atan2(-1.65, -3.5), pitch: 0.12 },
          { name: 'by the circle of chairs, in the dark', x: C.x + 0.6, z: C.z + 2.6, yaw: Math.atan2(-0.6, 2.6), pitch: -0.2 },
          { name: 'at the chair with the talking piece on it, where it has come round to you', x: tx + Math.sin(turnFace) * 1.6, z: tz + Math.cos(turnFace) * 1.6, yaw: turnFace, pitch: -0.12, frame: turn.el },
          { name: 'at the standing orders on the back wall', x: -2.1, z: back + 1.7, yaw: 0, pitch: -0.08, frame: orders.el },
          { name: 'at what we mean by dead tired, on the back wall', x: 1.4, z: back + 1.7, yaw: 0, pitch: -0.08, frame: means.el },
          { name: 'by the door, at the pegs with the coats and bags on them', x: -1.6, z: -2.4, yaw: Math.PI, pitch: 0.02, frame: pegs.el },
          { name: 'by the door, where it says what to do if tonight is worse than tired', x: 0.75, z: -1.8, yaw: Math.PI, pitch: 0.05, frame: worse.el },
          { name: 'at what is not in this room, on the right-hand wall', x: R - 1.6, z: -5.2, yaw: RIGHT, pitch: -0.12, frame: notHere.el },
          { name: 'at where the society actually meets, on the right-hand wall', x: R - 1.6, z: -3.2, yaw: RIGHT, pitch: -0.12, frame: meets.el },
          { name: 'at the left-hand wall, with the room’s own page on it', x: L + 2.6, z: -2.6, yaw: LEFT, page: kit.page, frame: frame }
        ]
      };
    }
  };
})();

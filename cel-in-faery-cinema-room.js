/* =============================================================================
   The Cinema, walked into on Cel Street, through the curtain in the Faery
   Yurt. Ryan's ask, 2026-10-31: the yurt's doorways opening onto their rooms.

   IT IS HELEN EDGAR'S ROOM AND HER WORLD (§121), and this is OURS: a drawing
   of her picture palace for Cel Street, in the colours her room wears (the
   Reading Room's, §114, at her ask) and nothing else, which changes nothing on
   her page and is hers to keep or send back. The house lights are down and the
   light comes over your head from the projection box at the back, one still
   wedge onto the silver screen in its gilt arch, with the velvet curtains
   drawn back from it. That beam is what keeps it off her other two rooms (a
   fire from the floor, candles at a window) and off the Lightbulb Picture
   House, where the house lights stay up and there is no beam. Rows of velvet
   seats, and along both walls her reels on their rails, in rows and never in
   a bookcase, as she asked.

   THE SCREEN AND THE REELS ARE HER PAGE'S OWN, lifted off it by the kit, and
   rack.js, the page's own script, puts a reel up on the screen here as it
   does there; nothing reaches YouTube until a press. Every rail holds all its
   reels, and scrolls when there are more than fit; her page is by the door.

   NOTHING MOVES: the projector does not flicker and its reels do not turn
   here. Every colour is one her room declares, by name. It keeps nothing,
   sends nothing and fetches nothing; her page arrives through Cel Street's
   screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['faery-cinema-room.html'] = {
    name: 'The Cinema',
    from: 'faery-yurt.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, W = 13, D = 21, H = 7.5, back = -D;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;

      // THE HOUSE LIGHTS DOWN: almost nothing but the beam.
      kit.scene.background = kit.col('--rdr-stone');
      kit.scene.add(new T.HemisphereLight(kit.col('--rdr-wall'), kit.col('--rdr-stone'), 1.0));

      // THE ROOM.
      box(W, 0.1, D + 0.4, at(0, -0.05, -D / 2), '--rdr-timber', false, false);
      box(W - 0.6, 0.02, D - 1, at(0, 0.01, -D / 2), '--rdr-velvet', false, false);
      box(0.3, H, D, at(-W / 2 - 0.15, H / 2, -D / 2), '--rdr-wall');
      box(0.3, H, D, at(W / 2 + 0.15, H / 2, -D / 2), '--rdr-wall');
      box(W + 0.6, H, 0.3, at(0, H / 2, back - 0.15), '--rdr-wall');
      box(W + 0.6, H, 0.3, at(0, H / 2, 0.15), '--rdr-wall');
      box(W + 0.6, 0.2, D + 0.6, at(0, H + 0.1, -D / 2), '--rdr-stone', false, false);
      // The cinema door you came in by, behind you.
      box(1.8, 2.5, 0.1, at(0, 1.25, -0.05), '--rdr-timber');
      box(0.04, 2.3, 0.12, at(0, 1.25, -0.08), '--rdr-brass', false);

      // THE SCREEN'S GILT ARCH, the stage under it, the velvet curtains drawn
      // back either side.
      var sx = 6.2, sy = 3.7, half = 3.6;
      box(sx + 1.6, 0.9, 1.6, at(0, 0.45, back + 0.8), '--rdr-timber');
      [-1, 1].forEach(function (s) { box(0.36, 6.0, 0.4, at(s * half, 3.0, back + 0.25), '--rdr-brass'); });
      kit.piece(new T.TorusGeometry(half, 0.2, 8, 30, Math.PI), at(0, 6.0, back + 0.25), '--rdr-brass', 0.03);
      box(sx + 0.3, 4.1, 0.05, at(0, sy, back + 0.08), '--rdr-stone', false);
      [-1, 1].forEach(function (s) {
        for (var f = 0; f < 6; f++) kit.cyl(0.11, 0.17, 6.2, at(s * (half + 0.45 + f * 0.17), 3.1, back + 0.55 + (f % 2) * 0.08), '--rdr-velvet', false, 10);
        box(0.12, 0.12, 0.3, at(s * (half + 0.6), 2.4, back + 0.75), '--rdr-brass', false);
      });

      // HER PAGE by the door at the back, and the screen and the reels off it.
      var pw = 2.6, ph = pw * 800 / 1180, py = 0.9 + ph / 2;
      var pg = at(3.9, 0, -0.02, Math.PI);
      box(pw + 0.24, ph + 0.24, 0.08, M(pg, at(0, py, 0)), '--rdr-timber');
      var frame = kit.screen(1180, 800, pw, M(pg, at(0, py, 0.06)), 'Helen Edgar’s Cinema’s own page, by the door at the back');
      // The reels draw themselves out of a symbol on her page, so it comes too.
      kit.lift(frame, '.cin-defs', { bare: true, w: 10, ww: 0.01, m: at(0, 0.5, -0.2, Math.PI) });
      // The screen ships hidden until the page's script finds it, so it is
      // stood by its middle: it has no height to stand on when it is copied.
      var screen = kit.lift(frame, '.cin-screen', { w: 860, ww: sx, m: at(0, sy, back + 0.12) });
      var now = kit.lift(frame, '.cin-screen__now', { w: 760, ww: 4.4, m: at(0, 1.3, back + 1.62) });
      var off = kit.lift(frame, '.cin-screen__back', { w: 420, ww: 1.6, m: at(0, 1.02, back + 1.62) });
      var stops = [
        { name: 'just inside the door, with the house lights down', x: 0, z: -2.2, yaw: 0 },
        { name: 'in a seat in the middle of the house', x: 0, z: -11.2, yaw: 0 },
        { name: 'at the front, under the screen', x: 0, z: back + 5.6, yaw: 0, frame: screen.el }
      ];
      var RAIL = [-4.0, -7.2, -10.4, -13.6, -16.8];
      for (var n = 0; n < 10; n++) {
        var s = n < 5 ? -1 : 1, z = RAIL[n % 5];
        var g = at(s * (W / 2 - 0.06), 0, z, s < 0 ? LEFT : RIGHT);
        box(2.8, 0.08, 0.12, M(g, at(0, 0.62, 0.06)), '--rdr-brass', false);
        var it = kit.lift(frame, '.cin-shelf', { n: n, w: 860, h: 700, ww: 2.6, m: M(g, at(0, 0.7, 0.04)) });
        stops.push({ name: 'at the ' + (s < 0 ? 'left' : 'right') + '-hand rail, the reels in row ' + (n % 5 + 1), x: s * (W / 2 - 2.5), z: z, yaw: s < 0 ? LEFT : RIGHT, frame: it.el });
      }
      kit.wire(frame, 'rack.js');
      stops.push({ name: 'by the door at the back, with her room’s own page on the wall', x: 3.9, z: -2.9, yaw: Math.PI, page: kit.page, frame: frame });

      // ROWS OF VELVET SEATS with timber arms, facing the screen, an aisle
      // down either side.
      for (var row = 0; row < 7; row++) {
        var rz = -6 - row * 1.35;
        box(5.6, 0.32, 0.5, at(0, 0.16, rz + 0.1), '--rdr-timber', false);
        for (var c = 0; c < 8; c++) {
          var cx = -2.45 + c * 0.7, sg = at(cx, 0, rz);
          box(0.58, 0.14, 0.5, M(sg, at(0, 0.46, 0)), '--rdr-velvet');
          box(0.58, 0.68, 0.12, M(sg, at(0, 0.84, 0.26, 0, -0.12)), '--rdr-velvet');
          box(0.08, 0.32, 0.5, M(sg, at(0.33, 0.62, 0)), '--rdr-timber', false);
        }
      }

      // THE PROJECTION BOX at the back, high up, and its one still beam.
      box(2.6, 1.3, 1.3, at(0, 6.2, -0.75), '--rdr-stone');
      kit.flat(new T.PlaneGeometry(0.7, 0.45), at(0, 6.1, -1.42, Math.PI), '--rdr-ink-2');
      [-0.5, 0.5].forEach(function (x) { kit.cyl(0.32, 0.32, 0.08, at(x, 7.05, -0.75, 0, 0, Math.PI / 2), '--rdr-ink-2', 0.02, 20); });
      var from = new T.Vector3(0, 6.1, -1.45), to = new T.Vector3(0, sy, back + 0.15);
      var dir = to.clone().sub(from), len = dir.length();
      var beamGeo = new T.CylinderGeometry(0.18, 3.3, len, 24, 1, true);
      beamGeo.translate(0, -len / 2, 0);
      var beam = new T.Mesh(beamGeo, new T.MeshBasicMaterial({ color: kit.col('--rdr-ink'), transparent: true, opacity: 0.06, depthWrite: false, side: T.DoubleSide }));
      beam.position.copy(from);
      beam.quaternion.setFromUnitVectors(new T.Vector3(0, -1, 0), dir.clone().normalize());
      beam.updateMatrix();
      kit.scene.add(beam);
      var spot = new T.SpotLight(kit.col('--rdr-ink'), 260, 30, 0.2, 0.4, 1.2);
      spot.position.copy(from); spot.target.position.copy(to);
      kit.scene.add(spot, spot.target);
      // Step lights low along the aisles, so the floor can be found.
      [-1, 1].forEach(function (s) {
        for (var k = 0; k < 4; k++) {
          kit.flat(new T.CircleGeometry(0.05, 10), at(s * 3.3, 0.12, -6.3 - k * 2.7, s < 0 ? LEFT : RIGHT), '--rdr-flame-2');
          var l = new T.PointLight(kit.col('--rdr-flame-2'), 0.6, 3, 1.6);
          l.position.set(s * 3.3, 0.25, -6.3 - k * 2.7);
          kit.scene.add(l);
        }
      });

      return {
        start: { x: 0, z: -2.2, yaw: 0 },
        bounds: { x: [-W / 2 + 1.0, W / 2 - 1.0], z: [back + 2.2, -1.0] },
        stops: stops
      };
    }
  };
})();

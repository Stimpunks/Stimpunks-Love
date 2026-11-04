/* =============================================================================
   The Cinema, walked into on Cel Street, through the curtain in the Faery
   Yurt. Ryan's ask, 2026-10-31: the yurt's doorways opening onto their rooms;
   round 2, 2026-11-04.

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

   ROUND 2 DREW MORE OF WHAT HER DRAWING HAS: a candle in a brass sconce
   between every two rails on both walls, standing still, which is what lets
   the room be seen at all with the house lights down; the gilt arch brought
   down under the ceiling with a finer line inside it, the fringed velvet
   pelmet across it and the curtains held back with tasselled brass tie-backs;
   the stage's step with its brass nosing; her film strip running along the
   top of every wall and across the old-style cinema door you came in by, with
   portholes in its two leaves; the projector in its box with a lens and two
   reels; brass along the tops of the seats as in her drawing; and a timber
   dado under the rails. Two more places to stand: in the side aisle under a
   candle, and on the stage's step turned round to the box and its beam.

   THE SCREEN AND THE REELS ARE HER PAGE'S OWN, lifted off it by the kit, and
   rack.js, the page's own script, puts a reel up on the screen here as it
   does there; nothing reaches YouTube until a press. Every rail holds all its
   reels, and scrolls when there are more than fit; her page is by the door.

   NOTHING MOVES: the projector does not flicker, its reels do not turn here
   and the candles stand still. Every colour is one her room declares, by
   name. It keeps nothing, sends nothing and fetches nothing; her page arrives
   through Cel Street's screen(). tools/make-cel-street.py holds each of those.
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

      // THE HOUSE LIGHTS DOWN: almost nothing but the beam and the candles.
      kit.scene.background = kit.col('--rdr-stone');
      kit.scene.add(new T.HemisphereLight(kit.col('--rdr-wall'), kit.col('--rdr-stone'), 1.2));

      // HER FILM STRIP, as it runs across the top of her page: sprocket holes
      // along both edges, the frames between them edged in brass. Drawn for a
      // length of wall, so its frames keep their shape however long that is.
      function filmStrip(len, tall) {
        var ph = 64, pw = Math.round(ph * len / tall);
        return kit.paper(pw, ph, function (c, w, h) {
          c.fillStyle = kit.ink('--rdr-stone'); c.fillRect(0, 0, w, h);
          c.globalAlpha = 0.55; c.fillStyle = kit.ink('--rdr-ink-2');
          for (var x = 6; x < w - 8; x += 20) { c.fillRect(x, 5, 8, 6); c.fillRect(x, h - 11, 8, 6); }
          c.globalAlpha = 1;
          for (var fx = 4; fx + 54 < w; fx += 60) {
            c.fillStyle = kit.ink('--rdr-panel'); c.fillRect(fx, 15, 54, 34);
            c.globalAlpha = 0.35; c.strokeStyle = kit.ink('--rdr-brass'); c.lineWidth = 2; c.strokeRect(fx + 1, 16, 52, 32); c.globalAlpha = 1;
          }
        });
      }

      // THE ROOM.
      box(W, 0.1, D + 0.4, at(0, -0.05, -D / 2), '--rdr-timber', false, false);
      box(W - 0.6, 0.02, D - 1, at(0, 0.01, -D / 2), '--rdr-velvet', false, false);
      box(0.3, H, D, at(-W / 2 - 0.15, H / 2, -D / 2), '--rdr-wall');
      box(0.3, H, D, at(W / 2 + 0.15, H / 2, -D / 2), '--rdr-wall');
      box(W + 0.6, H, 0.3, at(0, H / 2, back - 0.15), '--rdr-wall');
      box(W + 0.6, H, 0.3, at(0, H / 2, 0.15), '--rdr-wall');
      box(W + 0.6, 0.2, D + 0.6, at(0, H + 0.1, -D / 2), '--rdr-stone', false, false);
      // A timber dado along both side walls, under the rails, with a brass rail
      // capping it, and her strip along the top of every wall.
      var wallStrip = filmStrip(D, 0.42), endStrip = filmStrip(W, 0.42);
      [-1, 1].forEach(function (s) {
        box(0.06, 0.6, D - 0.2, at(s * (W / 2 - 0.03), 0.3, -D / 2), '--rdr-timber', false, false);
        box(0.08, 0.05, D - 0.2, at(s * (W / 2 - 0.05), 0.62, -D / 2), '--rdr-brass', false, false);
        kit.sheet(wallStrip, D, 0.42, at(s * (W / 2 - 0.02), H - 0.55, -D / 2, s < 0 ? LEFT : RIGHT));
      });
      kit.sheet(endStrip, W, 0.42, at(0, H - 0.55, back + 0.02));
      kit.sheet(endStrip, W, 0.42, at(0, H - 0.55, -0.02, Math.PI));

      // The old-style cinema door you came in by, behind you: two leaves of
      // timber in a brass frame, a porthole in each, brass push plates, and
      // her film strip across the pair of them.
      box(2.1, 2.7, 0.08, at(0, 1.35, -0.04), '--rdr-brass', false);
      box(1.9, 2.55, 0.1, at(0, 1.28, -0.06), '--rdr-timber');
      box(0.03, 2.5, 0.12, at(0, 1.28, -0.1), '--rdr-stone', false);
      [-1, 1].forEach(function (s) {
        kit.piece(new T.TorusGeometry(0.17, 0.035, 6, 20), at(s * 0.47, 2.0, -0.12), '--rdr-brass', false);
        kit.flat(new T.CircleGeometry(0.15, 18), at(s * 0.47, 2.0, -0.115, Math.PI), '--rdr-panel');
        box(0.07, 0.42, 0.03, at(s * 0.12, 1.15, -0.13), '--rdr-brass', false);
      });
      kit.sheet(filmStrip(1.86, 0.24), 1.86, 0.24, at(0, 1.6, -0.125, Math.PI));

      // THE SCREEN'S GILT ARCH, brought down under the ceiling, with a finer
      // line inside it; the stage under it with its brass nosing and its step;
      // the fringed velvet pelmet across the top; the velvet curtains drawn
      // back either side and held with tasselled brass tie-backs.
      var sx = 6.2, sy = 3.3, foot = 1.5, half = 3.6, post = 4.8;
      box(sx + 1.6, 0.9, 1.6, at(0, 0.45, back + 0.8), '--rdr-timber');
      box(sx + 1.62, 0.05, 0.06, at(0, 0.9, back + 1.6), '--rdr-brass', false);
      box(sx + 0.6, 0.4, 0.6, at(0, 0.2, back + 1.9), '--rdr-timber');
      box(sx + 0.62, 0.04, 0.05, at(0, 0.4, back + 2.18), '--rdr-brass', false);
      [-1, 1].forEach(function (s) {
        box(0.36, post, 0.4, at(s * half, post / 2, back + 0.25), '--rdr-brass');
        box(0.08, post - 0.9, 0.06, at(s * (half - 0.32), 0.9 + (post - 0.9) / 2, back + 0.4), '--rdr-brass', false);
      });
      var arch = new T.TorusGeometry(half, 0.2, 8, 30, Math.PI); arch.scale(1, 0.6, 1);
      kit.piece(arch, at(0, post, back + 0.25), '--rdr-brass', 0.03);
      var inner = new T.TorusGeometry(half - 0.32, 0.05, 6, 30, Math.PI); inner.scale(1, 0.55, 1);
      kit.piece(inner, at(0, post, back + 0.4), '--rdr-brass', false);
      box(sx + 0.3, 4.1, 0.05, at(0, sy, back + 0.08), '--rdr-stone', false);
      // The pelmet, with its fringe of brass along the foot.
      var pel = 2 * half + 1.6, pelY = post + 1.5;
      box(pel, 0.6, 0.3, at(0, pelY, back + 0.62), '--rdr-velvet');
      for (var fr = -pel / 2 + 0.06; fr < pel / 2; fr += 0.11) kit.cyl(0.018, 0.03, 0.14, at(fr, pelY - 0.37, back + 0.78), '--rdr-brass', false, 6);
      [-1, 1].forEach(function (s) {
        for (var f = 0; f < 6; f++) kit.cyl(0.11, 0.17, pelY, at(s * (half + 0.45 + f * 0.17), pelY / 2, back + 0.55 + (f % 2) * 0.08), '--rdr-velvet', false, 10);
        var tx = s * (half + 0.88), ty = 2.4, tz = back + 0.82;
        kit.piece(new T.TorusGeometry(0.55, 0.045, 6, 16), at(tx, ty, tz, 0, Math.PI / 2), '--rdr-brass', false);
        kit.piece(new T.SphereGeometry(0.09, 10, 8), at(tx + s * 0.5, ty, tz + 0.2), '--rdr-brass', false);
        kit.cyl(0.02, 0.1, 0.36, at(tx + s * 0.5, ty - 0.27, tz + 0.2), '--rdr-brass', false, 10);
      });

      // HER PAGE by the door at the back, and the screen and the reels off it.
      var pw = 2.6, ph = pw * 800 / 1180, py = 0.9 + ph / 2;
      var pg = at(3.9, 0, -0.02, Math.PI);
      box(pw + 0.24, ph + 0.24, 0.08, M(pg, at(0, py, 0)), '--rdr-timber');
      var frame = kit.screen(1180, 800, pw, M(pg, at(0, py, 0.06)), 'Helen Edgar’s Cinema’s own page, by the door at the back');
      // The reels draw themselves out of a symbol on her page, so it comes too.
      kit.lift(frame, '.cin-defs', { bare: true, w: 10, ww: 0.01, m: at(0, 0.5, -0.2, Math.PI) });
      // The screen stands on the stage under the arch, its foot just above
      // the boards, and grows up from there once the page's script shows it.
      var screen = kit.lift(frame, '.cin-screen', { w: 860, ww: sx, m: at(0, foot, back + 0.12) });
      var now = kit.lift(frame, '.cin-screen__now', { w: 760, ww: 4.4, m: at(0, 1.05, back + 2.26) });
      var off = kit.lift(frame, '.cin-screen__back', { w: 420, ww: 1.6, m: at(0, 0.76, back + 2.26) });
      var stops = [
        { name: 'just inside the door, with the house lights down', x: 0, z: -2.2, yaw: 0 },
        { name: 'in a seat in the middle of the house', x: 0, z: -11.2, yaw: 0 },
        { name: 'in the side aisle, under a candle standing still in its brass sconce', x: -3.9, z: -8.6, yaw: 0.95 },
        { name: 'at the front, under the screen', x: 0, z: back + 5.6, yaw: 0, frame: screen.el },
        { name: 'on the stage’s step, turned round to the projection box and its beam', x: 0, z: back + 2.6, yaw: Math.PI }
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

      // A CANDLE IN A BRASS SCONCE between every two rails, on both walls,
      // as on each side wall of her drawing: a curled brass arm, a dish, the
      // candle and its flame, and its light falling round it, all still.
      [-1, 1].forEach(function (s) {
        [-2.4, -5.6, -8.8, -12.0, -15.2, -18.4].forEach(function (cz) {
          var w0 = at(s * (W / 2 - 0.02), 0, cz, s < 0 ? LEFT : RIGHT);
          box(0.14, 0.34, 0.04, M(w0, at(0, 3.55, 0.02)), '--rdr-brass', false);
          kit.piece(new T.TorusGeometry(0.11, 0.025, 6, 12, Math.PI), M(w0, at(0, 3.62, 0.13, Math.PI / 2, 0, Math.PI / 2)), '--rdr-brass', false);
          kit.cyl(0.13, 0.05, 0.04, M(w0, at(0, 3.75, 0.25)), '--rdr-brass', false, 14);
          kit.cyl(0.04, 0.04, 0.26, M(w0, at(0, 3.9, 0.25)), '--rdr-ink', false, 10);
          var flame = new T.ConeGeometry(0.03, 0.1, 8); flame.translate(0, 0.05, 0);
          kit.flat(flame, M(w0, at(0, 4.04, 0.25)), '--rdr-flame-2');
          kit.flat(new T.SphereGeometry(0.012, 6, 4), M(w0, at(0, 4.06, 0.25)), '--rdr-flame');
          var l = new T.PointLight(kit.col('--rdr-flame-2'), 3.0, 4.6, 1.5);
          l.position.set(s * (W / 2 - 0.5), 4.1, cz);
          kit.scene.add(l);
        });
      });

      // ROWS OF VELVET SEATS with timber arms, facing the screen, an aisle
      // down either side; brass along the top of every back, as in her drawing.
      for (var row = 0; row < 7; row++) {
        var rz = -6 - row * 1.35;
        box(5.6, 0.32, 0.5, at(0, 0.16, rz + 0.1), '--rdr-timber', false);
        for (var c = 0; c < 8; c++) {
          var cx = -2.45 + c * 0.7, sg = at(cx, 0, rz);
          box(0.58, 0.14, 0.5, M(sg, at(0, 0.46, 0)), '--rdr-velvet');
          box(0.58, 0.68, 0.12, M(sg, at(0, 0.84, 0.26, 0, -0.12)), '--rdr-velvet');
          box(0.52, 0.03, 0.05, M(sg, at(0, 1.18, 0.31, 0, -0.12)), '--rdr-brass', false);
          box(0.1, 0.05, 0.015, M(sg, at(0, 1.02, 0.34, 0, -0.12)), '--rdr-brass', false, false);
          box(0.08, 0.32, 0.5, M(sg, at(0.33, 0.62, 0)), '--rdr-timber', false);
        }
      }

      // THE PROJECTION BOX at the back, high up: its window onto the house,
      // the projector's lens in it, its two reels standing still on top, and
      // its one still beam.
      box(2.6, 1.3, 1.3, at(0, 6.2, -0.75), '--rdr-stone');
      box(2.64, 0.08, 1.34, at(0, 5.56, -0.75), '--rdr-timber', false);
      kit.flat(new T.PlaneGeometry(0.9, 0.55), at(0, 6.1, -1.41, Math.PI), '--rdr-panel');
      box(0.5, 0.26, 0.4, at(0, 6.0, -1.25), '--rdr-timber', false);
      kit.cyl(0.11, 0.13, 0.22, at(0, 6.1, -1.45, 0, Math.PI / 2), '--rdr-brass', false, 14);
      kit.flat(new T.CircleGeometry(0.09, 14), at(0, 6.1, -1.565, Math.PI), '--rdr-flame-2');
      [-0.5, 0.5].forEach(function (x) {
        kit.cyl(0.32, 0.32, 0.08, at(x, 7.05, -0.75, 0, 0, Math.PI / 2), '--rdr-ink-2', 0.02, 20);
        kit.cyl(0.07, 0.07, 0.1, at(x, 7.05, -0.75, 0, 0, Math.PI / 2), '--rdr-stone', false, 10);
      });
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
      // The projector's own light in the box's window, so the box can be
      // seen when you turn round to it.
      var lamp = new T.PointLight(kit.col('--rdr-flame-2'), 1.6, 2.6, 1.6);
      lamp.position.set(0, 6.1, -1.75);
      kit.scene.add(lamp);
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

/* =============================================================================
   The Live Room, walked into on Cel Street. Ryan's ask, 2026-10-31: back on the
   street, working down it a room at a time.

   IT IS THE STUDIO'S WORLD AND NOBODY ELSE'S (§59): you are in the control
   room, dim so you can see through the glass, standing over the desk, and the
   live room beyond is lit for the cameras with nobody in it: a mic on its
   stand, a stool, an amp, a guitar on its stand, a kit and a keyboard, and the
   acoustic panels on its walls. THE GLASS IS TWO PANES SET OUT OF PARALLEL, so
   everything lit in there is seen twice, the second time faint and lower: that
   is the one light on the street that arrives doubled. ONE RED LAMP over the
   window, lit and steady; it never flashes, at any setting. THERE IS NO WOOD
   AND NO CARPET ANYWHERE in it: that is The Den, the street's other studio,
   where you are in the room with the band.

   THE DESK IS THE PAGE'S OWN. Each studio's channel strips lie on the desk in
   front of you, lifted off the page by the kit, tape and runtime on every
   strip; the studios' own month stands on the walls, the screen the page calls
   the glass is up in the left of the window, and rack.js, which the page
   loads, puts a session up there or plays it where it lies, as it does on the
   page. Nothing reaches YouTube until somebody presses, and every strip says
   how long it runs first.

   NOTHING MOVES: the meters are lit and still, the faders stay where they are.
   Every colour is one the room declares, by name. It keeps nothing, sends
   nothing and fetches nothing; its page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['live-room.html'] = {
    name: 'The Live Room',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var W = 10, H = 3.4, GZ = -7;              // the control room; the glass wall at GZ
      var LW = 12, LD = 8, LH = 3.8;             // the live room beyond it
      var WIN = { x0: -4.2, x1: 4.2, y0: 1.05, y1: 3.0 };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;

      // DIM IN HERE, LIT OUT THERE. A little of the room's own dark, and the
      // live room's lights hanging over it, reaching no further than the glass.
      kit.scene.background = kit.col('--lvr-well');
      kit.scene.add(new T.HemisphereLight(kit.col('--lvr-dim'), kit.col('--lvr-well'), 0.9));
      [-3, 3].forEach(function (x) {
        var l = new T.PointLight(kit.col('--lvr-glass'), 9, 7, 1.2);
        l.position.set(x, LH - 0.4, GZ - LD / 2 - 0.5);
        kit.scene.add(l);
      });

      // THE CONTROL ROOM: a dark floor of plain tiles, the walls with their
      // acoustic panels, the door behind you. No wood, no carpet.
      box(W, 0.1, -GZ + 1.4, at(0, -0.05, GZ / 2 + 0.6), '--lvr-well', false, false);
      for (var t = 1; t < 8; t++) box(W, 0.004, 0.02, at(0, 0.002, -t), '--lvr-face', false, false);
      box(W + 0.6, 0.2, -GZ + 1.4, at(0, H + 0.1, GZ / 2 + 0.6), '--lvr-well', false, false);
      box(0.3, H, -GZ + 1.4, at(-W / 2 - 0.15, H / 2, GZ / 2 + 0.6), '--lvr-room');
      box(0.3, H, -GZ + 1.4, at(W / 2 + 0.15, H / 2, GZ / 2 + 0.6), '--lvr-room');
      box((W - 1.4) / 2, H, 0.3, at(-(W + 1.4) / 4, H / 2, 1.3), '--lvr-room');
      box((W - 1.4) / 2, H, 0.3, at((W + 1.4) / 4, H / 2, 1.3), '--lvr-room');
      box(1.4, H - 2.2, 0.3, at(0, 2.2 + (H - 2.2) / 2, 1.3), '--lvr-room');
      box(1.2, 2.15, 0.06, at(0.2, 1.08, 1.2, 0.5), '--lvr-face', 0.012);
      // The acoustic panels round the control room, high on the walls.
      [-1.2, -3.6].forEach(function (z) {
        [-1, 1].forEach(function (s) { box(0.08, 0.9, 1.6, at(s * (W / 2 - 0.04), 2.75, z), '--lvr-face', 0.012); });
      });

      // THE GLASS WALL: solid above, below and to either side of one wide
      // window, its frame the dark of the well.
      box(W, WIN.y0, 0.4, at(0, WIN.y0 / 2, GZ), '--lvr-room');
      box(W, H - WIN.y1, 0.4, at(0, WIN.y1 + (H - WIN.y1) / 2, GZ), '--lvr-room');
      [[-W / 2, WIN.x0], [WIN.x1, W / 2]].forEach(function (s) {
        box(s[1] - s[0], WIN.y1 - WIN.y0, 0.4, at((s[0] + s[1]) / 2, (WIN.y0 + WIN.y1) / 2, GZ), '--lvr-room');
      });
      box(WIN.x1 - WIN.x0 + 0.2, 0.08, 0.5, at(0, WIN.y0, GZ), '--lvr-well', 0.01);
      box(WIN.x1 - WIN.x0 + 0.2, 0.08, 0.5, at(0, WIN.y1, GZ), '--lvr-well', 0.01);
      [WIN.x0, WIN.x1].forEach(function (x) { box(0.08, WIN.y1 - WIN.y0, 0.5, at(x, (WIN.y0 + WIN.y1) / 2, GZ), '--lvr-well', 0.01); });
      // The two panes, out of parallel: the near one square to the wall, the far
      // one turned a little, each only just there.
      function pane(m, op) {
        var g = kit.flat(new T.PlaneGeometry(WIN.x1 - WIN.x0, WIN.y1 - WIN.y0), m, '--lvr-glass');
        g.material.transparent = true; g.material.opacity = op; g.material.depthWrite = false;
      }
      pane(at(0, (WIN.y0 + WIN.y1) / 2, GZ + 0.12), 0.05);
      pane(at(0, (WIN.y0 + WIN.y1) / 2 - 0.02, GZ - 0.14, 0.04, 0.03), 0.07);

      // THE RED LAMP over the window, lit and steady.
      box(1.1, 0.34, 0.16, at(0, WIN.y1 + 0.28, GZ + 0.26), '--lvr-well', 0.01);
      kit.flat(new T.PlaneGeometry(0.9, 0.18), at(0, WIN.y1 + 0.28, GZ + 0.345), '--lvr-lamp');
      var red = new T.PointLight(kit.col('--lvr-lamp'), 1.2, 2.6, 1.6);
      red.position.set(0, WIN.y1 + 0.2, GZ + 0.8);
      kit.scene.add(red);

      // THE LIVE ROOM, lit for the cameras: pale walls with their panels, a
      // plain floor, and in it the things a session needs and nobody to play
      // them. Everything lit in here is drawn a second time, faint and lower,
      // the way the second pane shows it.
      var LZ = GZ - 0.2 - LD / 2;
      box(LW, 0.1, LD, at(0, -0.05, LZ), '--lvr-panel', false, false);
      box(LW, 0.1, LD, at(0, LH + 0.05, LZ), '--lvr-panel', false, false);
      box(LW, LH, 0.3, at(0, LH / 2, GZ - 0.2 - LD - 0.15), '--lvr-glass', false);
      box(0.3, LH, LD, at(-LW / 2 - 0.15, LH / 2, LZ), '--lvr-glass', false);
      box(0.3, LH, LD, at(LW / 2 + 0.15, LH / 2, LZ), '--lvr-glass', false);
      for (var px = -4.5; px <= 4.5; px += 1.5) {
        box(1.2, 1.2, 0.1, at(px, 2.4, GZ - 0.2 - LD + 0.05), '--lvr-panel', 0.01, false);
        box(1.2, 0.9, 0.1, at(px, 0.9, GZ - 0.2 - LD + 0.05), '--lvr-panel', 0.01, false);
      }
      function ghost(geo, m, ink) {
        var g = kit.flat(geo, M(at(0.16, -0.36, 0.04), m), ink);
        g.material.transparent = true; g.material.opacity = 0.3; g.material.depthWrite = false;
      }
      function thing(geo, m, ink) {
        kit.piece(geo, m, ink, 0.012);
        ghost(geo.clone(), m, ink);
      }
      var B = function (w, h, d) { return new T.BoxGeometry(w, h, d); };
      var C = function (r0, r1, h, s) { return new T.CylinderGeometry(r0, r1, h, s || 12); };
      // The mic on its stand in the middle, and the stool beside it.
      var mz = GZ - 2.5;
      thing(C(0.16, 0.2, 0.03, 18), at(0, 0.015, mz), '--lvr-live');
      thing(C(0.018, 0.018, 1.45, 8), at(0, 0.74, mz), '--lvr-live');
      thing(C(0.04, 0.035, 0.16), at(0, 1.5, mz + 0.03, 0, 0.3), '--lvr-live');
      thing(C(0.2, 0.2, 0.05, 18), at(0.8, 0.7, mz - 0.2), '--lvr-live');
      [0, 1, 2, 3].forEach(function (k) {
        var a = k * Math.PI / 2 + Math.PI / 4;
        thing(C(0.016, 0.016, 0.7, 6), at(0.8 + Math.cos(a) * 0.14, 0.35, mz - 0.2 + Math.sin(a) * 0.14), '--lvr-live');
      });
      // The amp, off to the left, and the guitar on its stand beside it.
      thing(B(0.8, 0.7, 0.4), at(-2.6, 0.35, mz - 1.4, 0.3), '--lvr-live');
      thing(B(0.66, 0.5, 0.02), at(-2.6 + 0.06, 0.38, mz - 1.17, 0.3), '--lvr-panel');
      thing(C(0.24, 0.24, 0.08, 16), at(-1.6, 0.5, mz - 1.0, 0, Math.PI / 2), '--lvr-live');
      thing(C(0.19, 0.19, 0.08, 16), at(-1.6, 0.82, mz - 1.0, 0, Math.PI / 2), '--lvr-live');
      thing(B(0.06, 0.9, 0.04), at(-1.6, 1.35, mz - 1.0), '--lvr-live');
      thing(B(0.32, 0.03, 0.3), at(-1.6, 0.2, mz - 0.95, 0, 0.2), '--lvr-live');
      // The kit, at the back on the right: the bass drum on its side, a snare,
      // a tom, a cymbal on its stand, and the stool behind it.
      var kx = 2.4, kz = mz - 1.9;
      thing(C(0.32, 0.32, 0.4, 20), at(kx, 0.32, kz, 0, Math.PI / 2), '--lvr-live');
      thing(C(0.2, 0.2, 0.14, 18), at(kx - 0.55, 0.62, kz + 0.25), '--lvr-live');
      thing(C(0.16, 0.16, 0.16, 18), at(kx - 0.1, 0.84, kz + 0.05), '--lvr-live');
      thing(C(0.018, 0.018, 1.2, 6), at(kx + 0.6, 0.6, kz + 0.3), '--lvr-live');
      thing(C(0.3, 0.3, 0.01, 22), at(kx + 0.6, 1.22, kz + 0.3, 0, 0.12), '--lvr-panel');
      thing(C(0.17, 0.17, 0.06, 16), at(kx, 0.5, kz - 0.65), '--lvr-live');
      // The keyboard on its stand, on the left at the back.
      thing(B(1.2, 0.08, 0.32), at(-3.0, 0.82, kz + 0.2, 0.2), '--lvr-live');
      thing(B(1.1, 0.02, 0.14), at(-3.0, 0.87, kz + 0.28, 0.2), '--lvr-glass');
      [-1, 1].forEach(function (e) { thing(B(0.04, 0.8, 0.04), at(-3.0 + e * 0.45, 0.4, kz + 0.2, 0.2, 0, e * 0.4), '--lvr-live'); });

      // THE DESK in front of the window: a long console, its sloped face carrying
      // the studios' channel strips, a bridge of green meters along its back.
      var DZ0 = -5.1, DZ1 = -6.4, DY0 = 0.86, DY1 = 1.02;
      box(8.2, DY0, -(DZ1 - DZ0), at(0, DY0 / 2, (DZ0 + DZ1) / 2), '--lvr-face');
      var slope = Math.atan2(DY1 - DY0, DZ0 - DZ1);
      box(8.2, 0.06, -(DZ1 - DZ0) + 0.08, at(0, (DY0 + DY1) / 2, (DZ0 + DZ1) / 2, 0, slope), '--lvr-well', 0.012);
      box(8.2, 0.14, 0.2, at(0, DY1 + 0.06, DZ1 - 0.06), '--lvr-face', 0.012);
      for (var mx = -3.8; mx <= 3.8; mx += 0.32) {
        kit.flat(new T.PlaneGeometry(0.08, 0.05), at(mx, DY1 + 0.09, DZ1 + 0.045), '--lvr-meter');
        kit.flat(new T.PlaneGeometry(0.08, 0.025), at(mx, DY1 + 0.03, DZ1 + 0.045), '--lvr-meter');
      }
      // Knob caps along the desk's front lip, either side of the strips.
      [-4.0, 4.0].forEach(function (x) {
        for (var k = 0; k < 4; k++) cyl(0.04, 0.04, 0.05, at(x, DY0 + 0.03, DZ0 - 0.2 - k * 0.25), '--lvr-cap', 0.006, 12);
      });
      // The chair at the desk, with nobody in it.
      cyl(0.26, 0.26, 0.08, at(-0.9, 0.5, -4.3), '--lvr-face', 0.01, 18);
      box(0.5, 0.5, 0.08, at(-0.9, 0.8, -4.05), '--lvr-face', 0.01);
      cyl(0.04, 0.04, 0.46, at(-0.9, 0.24, -4.3), '--lvr-cap', false, 8);
      cyl(0.28, 0.28, 0.03, at(-0.9, 0.02, -4.3), '--lvr-cap', false, 5);

      // THE ROOM'S OWN PAGE on the right-hand wall by the door.
      var pw = 2.6, ph = pw * 800 / 1180, py = 0.6 + ph / 2;
      box(pw + 0.2, ph + 0.2, 0.08, at(W / 2 - 0.04, py, -1.6, RIGHT), '--lvr-cap');
      var frame = kit.screen(1180, 800, pw, at(W / 2 - 0.09, py, -1.6, RIGHT), 'The Live Room’s own page, on the right-hand wall by the door');

      // OFF THE PAGE: each studio's strips lying on the desk's face, the glass
      // up in the left of the window, what is on it and the way to take it off
      // on the wall beside it, the studios' month on the walls, and the house
      // rules and whose this is on the wall by the door.
      var tilt = -1.35;
      var strips = [-2.75, 0, 2.75].map(function (x, n) {
        return kit.lift(frame, '.lvr-studio', { n: n, w: 900, h: 420, ww: 2.6, m: at(x, DY0 + 0.05, DZ0 - 0.06, 0, tilt) });
      });
      var glass = kit.lift(frame, '.lvr-glass', { w: 860, ww: 1.8, m: at(-3.1, WIN.y0 + 0.08, GZ + 0.2) });
      var now = kit.lift(frame, '.lvr-glass__now', { w: 600, ww: 1.2, m: at(-W / 2 + 0.05, 1.75, -4.6, LEFT) });
      var off = kit.lift(frame, '.lvr-glass__back', { w: 600, ww: 1.2, m: at(-W / 2 + 0.05, 1.3, -4.6, LEFT) });
      var month = [
        kit.lift(frame, '.lvr-chan', { n: 0, w: 900, h: 900, ww: 1.9, m: at(-W / 2 + 0.05, 0.55, -1.5, LEFT) }),
        kit.lift(frame, '.lvr-chan', { n: 1, w: 900, h: 900, ww: 1.9, m: at(-W / 2 + 0.05, 0.55, -3.6, LEFT) }),
        kit.lift(frame, '.lvr-chan', { n: 2, w: 900, h: 900, ww: 1.9, m: at(W / 2 - 0.05, 0.55, -4.35, RIGHT) })
      ];
      var rules = kit.lift(frame, '.lvr-part', { n: 0, w: 760, h: 760, ww: 1.7, m: at(-3.0, 0.7, 1.12, Math.PI) });
      var whose = kit.lift(frame, '.lvr-part', { n: 1, w: 760, h: 760, ww: 1.7, m: at(3.0, 0.7, 1.12, Math.PI) });
      kit.wire(frame, 'rack.js');

      var names = ['Austin City Limits', 'KEXP', 'KCRW'];
      var stops = [
        { name: 'just inside the door, the red lamp lit over the glass', x: 0, z: -0.6, yaw: 0, pitch: 0.12 },
        { name: 'at the desk, looking through both panes into the live room, everything in it seen twice', x: 0.6, z: -4.4, yaw: 0, pitch: 0.16 },
        { name: 'at the glass, where any session on the desk goes up', x: -3.1, z: -3.6, yaw: 0, pitch: 0.22, frame: glass.el }
      ];
      strips.forEach(function (s, n) {
        stops.push({ name: 'over the ' + names[n] + ' strips on the desk, each patched in by hand and saying how long it runs', x: [-2.75, 0, 2.75][n], z: -4.25, yaw: 0, pitch: -0.48, frame: s.el });
      });
      stops.push(
        { name: 'at the wall beside the glass, with what is on it and the way to take it off', x: -W / 2 + 2.4, z: -4.6, yaw: LEFT, pitch: 0.12, frame: now.el },
        { name: 'at Austin City Limits’ own month, on the left-hand wall', x: -W / 2 + 2.6, z: -1.5, yaw: LEFT, pitch: 0.12, frame: month[0].el },
        { name: 'at KEXP’s own month, on the left-hand wall', x: -W / 2 + 2.6, z: -3.6, yaw: LEFT, pitch: 0.12, frame: month[1].el },
        { name: 'at KCRW’s own month, on the right-hand wall', x: W / 2 - 2.6, z: -4.35, yaw: RIGHT, pitch: 0.12, frame: month[2].el },
        { name: 'at the right-hand wall by the door, with the Live Room’s own page on it', x: W / 2 - 2.8, z: -1.6, yaw: RIGHT, page: kit.page, frame: frame },
        { name: 'at the house rules, while the red light is on, by the door', x: -3.0, z: -0.3, yaw: Math.PI, pitch: 0.1, frame: rules.el },
        { name: 'at whose this all is, by the door', x: 3.0, z: -0.3, yaw: Math.PI, pitch: 0.1, frame: whose.el }
      );
      void off;

      return {
        start: { x: 0, z: -0.6, yaw: 0 },
        bounds: { x: [-W / 2 + 0.9, W / 2 - 0.9], z: [-4.6, 0.6] },
        stops: stops
      };
    }
  };
})();

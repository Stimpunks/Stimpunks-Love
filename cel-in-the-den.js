/* =============================================================================
   The Den, walked into on Cel Street, through the low door at the foot of the
   Jungle Room. Ryan's ask, 2026-11-01: the rooms behind the doors.

   IT IS THE DEN'S WORLD AND SHARES NOTHING WITH THE ROOM UPSTAIRS BUT THE NAME
   AND THE GREEN (§18). Up there the green is the darkness, a forest under a
   roof of leaves with the light coming down through it. Down here the room is
   BROWN: panelled walls with their grooves, a low ceiling, no daylight anywhere,
   lamps standing at knee height, and the green laid on the floor, a shag carpet
   that is the brightest thing in the room. It is low, closed and rectangular,
   full of carved furniture with the corners notched out of it: the sofa with
   the fur thrown over it, the table, the frame round the room's own page. On
   the north wall is the waterfall of cut fieldstone with a jade lamp either
   side of it, and in front of it the studio that came into the den in 1976: a
   microphone on its stand, its cable across the carpet, two monitors and the
   desk. Nobody is drawn.

   THE CUTS ARE THE PAGE'S OWN, lifted off it with their carpets: every cut says
   how long it runs and who wrote it, as the page prints them, and plays where
   it stands, built by love-embed.js as it is on the page; nothing reaches
   YouTube until a press. The room's words are the page's own, lifted, never
   retyped.

   NOTHING MOVES: the waterfall's water stands still here, at every setting.
   Every colour is one §18 declares, by name. It keeps nothing, sends nothing
   and fetches nothing; its page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 7, 374761393) ^ Math.imul(j + 11, 668265263) ^ Math.imul(k + 19, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['the-den.html'] = {
    name: 'The Den',
    from: 'jungle-room.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, W = 10, D = 11, H = 2.6, back = -D;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;

      // NO DAYLIGHT: the warm brown of the panelling everywhere, faint, and the
      // lamps at knee height doing the rest.
      kit.scene.background = kit.col('--cocoa');
      kit.scene.add(new T.HemisphereLight(kit.col('--rattan'), kit.col('--teak'), 1.7));
      function lamp(x, z, name, power) {
        var l = new T.PointLight(kit.col(name), power, 9, 1.3);
        l.position.set(x, 0.62, z);
        kit.scene.add(l);
      }

      // THE ROOM: low, closed and rectangular.
      box(W, 0.06, D + 0.4, at(0, -0.03, -D / 2), '--shag', false, false);
      // The shag has a nap: flecks of its darker green all over it.
      for (var k = 0; k < 160; k++) {
        var fx = -W / 2 + 0.2 + hash(k, 1, 1) * (W - 0.4), fz = -0.2 - hash(k, 1, 2) * (D - 0.4);
        box(0.05 + hash(k, 1, 3) * 0.06, 0.012, 0.05 + hash(k, 1, 4) * 0.06, at(fx, 0.006, fz, hash(k, 1, 5) * 3), '--shag-2', false, false);
      }
      box(0.3, H, D, at(-W / 2 - 0.15, H / 2, -D / 2), '--panel');
      box(0.3, H, D, at(W / 2 + 0.15, H / 2, -D / 2), '--panel');
      box(W + 0.6, H, 0.3, at(0, H / 2, back - 0.15), '--panel');
      box(W + 0.6, 0.2, D + 0.6, at(0, H + 0.1, -D / 2), '--teak', false, false);
      // The panelling's grooves, a hand's width apart, and the teak at its foot
      // and along its top.
      for (var gz = -0.4; gz > back + 0.2; gz -= 0.42) {
        box(0.02, H - 0.3, 0.025, at(-W / 2 + 0.005, H / 2, gz), '--cocoa-2', false, false);
        box(0.02, H - 0.3, 0.025, at(W / 2 - 0.005, H / 2, gz), '--cocoa-2', false, false);
      }
      for (var gx = -W / 2 + 0.4; gx < W / 2 - 0.2; gx += 0.42) {
        if (Math.abs(gx) < 2.2) continue; // the waterfall stands across the middle
        box(0.025, H - 0.3, 0.02, at(gx, H / 2, back + 0.005), '--cocoa-2', false, false);
      }
      [[-W / 2 + 0.02, -D / 2, LEFT, D], [W / 2 - 0.02, -D / 2, RIGHT, D], [0, back + 0.02, 0, W]].forEach(function (w) {
        box(w[3], 0.16, 0.05, at(w[0], 0.08, w[1], w[2]), '--teak', false);
        box(w[3], 0.12, 0.06, at(w[0], H - 0.06, w[1], w[2]), '--teak', false);
      });

      // THE FRONT WALL AND THE DOOR you came down by, from the forest, dark
      // beyond it.
      box(3.9, H, 0.3, at(-3.05, H / 2, 0.15), '--panel');
      box(3.9, H, 0.3, at(3.05, H / 2, 0.15), '--panel');
      box(2.2, H - 2.15, 0.3, at(0, (H + 2.15) / 2, 0.15), '--panel');
      kit.flat(new T.PlaneGeometry(2.2, 2.15), at(0, 1.075, 0.25, Math.PI), '--cocoa');
      [-1, 1].forEach(function (s) { box(0.14, 2.2, 0.36, at(s * 1.13, 1.1, 0.12), '--teak'); });
      box(2.4, 0.16, 0.36, at(0, 2.2, 0.12), '--teak');
      [-1, 1].forEach(function (s) {
        for (var gx2 = 1.5; gx2 < W / 2 - 0.1; gx2 += 0.42) box(0.025, H - 0.3, 0.02, at(s * gx2, H / 2, -0.005), '--cocoa-2', false, false);
      });
      box(W, 0.16, 0.05, at(0, 0.08, -0.02), '--teak', false);
      box(W, 0.12, 0.06, at(0, H - 0.06, -0.02), '--teak', false);

      // THE WATERFALL OF CUT FIELDSTONE on the north wall: stones laid round a
      // channel, the water standing still in it, and a pool at its foot.
      for (var r = 0; r < 7; r++) {
        var y0 = 0.08 + r * 0.33;
        for (var x = -2.0; x < 2.0;) {
          var sw = 0.36 + hash(r, Math.round(x * 10), 1) * 0.42;
          if (x + sw > 2.0) sw = 2.0 - x;
          var mid = x + sw / 2;
          if (!(mid > -0.42 && mid < 0.42 && r > 0)) {
            box(sw - 0.04, 0.29, 0.16 + hash(r, Math.round(x * 10), 2) * 0.08, at(mid, y0 + 0.145, back + 0.12), '--stone', 0.012);
          }
          x += sw;
        }
      }
      kit.flat(new T.PlaneGeometry(0.62, 2.2), at(0, 1.25, back + 0.08), '--jade');
      kit.flat(new T.PlaneGeometry(0.16, 2.1), at(0.04, 1.25, back + 0.09), '--coconut');
      var pool = new T.CylinderGeometry(1.0, 1.05, 0.12, 28);
      pool.scale(1, 1, 0.55);
      kit.piece(pool, at(0, 0.06, back + 0.7), '--stone', 0.012);
      var water = new T.CircleGeometry(0.9, 28); water.scale(1, 0.5, 1);
      kit.flat(water, at(0, 0.125, back + 0.7, 0, -Math.PI / 2), '--jade');
      var shine = new T.CircleGeometry(0.5, 20); shine.scale(1, 0.4, 1);
      kit.flat(shine, at(0.05, 0.128, back + 0.72, 0, -Math.PI / 2), '--coconut');

      // A JADE LAMP either side of it, standing low, its glass the jade and its
      // light the warm of the room.
      [-1, 1].forEach(function (s) {
        var lx = s * 1.75, lz = back + 0.75;
        kit.cyl(0.14, 0.18, 0.22, at(lx, 0.11, lz), '--teak', 0.012, 12);
        kit.cyl(0.03, 0.03, 0.22, at(lx, 0.33, lz), '--teak', false, 6);
        var glass = new T.CylinderGeometry(0.16, 0.24, 0.26, 14, 1, true);
        kit.flat(glass, at(lx, 0.55, lz), '--jade');
        lamp(lx, lz + 0.4, '--tiki', 8);
      });

      // THE RED LAMP in the far corner, and a lamp by the door, both at the
      // height of your knee.
      kit.cyl(0.12, 0.16, 0.3, at(4.35, 0.15, back + 0.6), '--teak', 0.012, 12);
      kit.flat(new T.CylinderGeometry(0.17, 0.25, 0.28, 14, 1, true), at(4.35, 0.45, back + 0.6), '--rum');
      lamp(4.1, back + 0.9, '--rum', 6);
      kit.cyl(0.12, 0.16, 0.3, at(-4.4, 0.15, -0.7), '--teak', 0.012, 12);
      kit.flat(new T.CylinderGeometry(0.17, 0.25, 0.28, 14, 1, true), at(-4.4, 0.45, -0.7), '--tiki');
      lamp(-4.1, -1.0, '--tiki', 8);

      // THE STUDIO THAT CAME INTO THE DEN: a microphone on its stand by the
      // stones, its cable across the carpet, two monitors and the desk.
      var mic = at(-2.9, 0, back + 1.6);
      kit.cyl(0.22, 0.24, 0.04, M(mic, at(0, 0.02, 0)), '--cocoa', 0.01, 14);
      kit.cyl(0.018, 0.018, 1.45, M(mic, at(0, 0.74, 0)), '--rattan', false, 6);
      kit.cyl(0.012, 0.012, 0.7, M(mic, at(0.2, 1.45, -0.1, 0, 0, -1.1)), '--rattan', false, 6);
      kit.piece(new T.SphereGeometry(0.06, 12, 10), M(mic, at(0.5, 1.6, -0.18)), '--rattan', 0.01);
      var cable = [];
      for (var q = 0; q <= 10; q++) cable.push(new T.Vector3(-2.9 + q * 0.42, 0.02, back + 1.6 + Math.sin(q * 0.9) * 0.35 + q * 0.12));
      kit.piece(new T.TubeGeometry(new T.CatmullRomCurve3(cable), 40, 0.015, 5, false), new T.Matrix4(), '--cocoa', false);
      [-1, 1].forEach(function (s) {
        var mx = s * 3.2, mz = back + 0.6;
        box(0.5, 0.8, 0.42, at(mx, 0.4, mz), '--cocoa-2', 0.012);
        kit.flat(new T.CircleGeometry(0.15, 16), at(mx, 0.32, mz + 0.215), '--cocoa');
        kit.flat(new T.CircleGeometry(0.06, 12), at(mx, 0.62, mz + 0.215), '--rattan');
      });
      var desk = at(1.4, 0, back + 1.9, -0.25);
      box(1.3, 0.06, 0.6, M(desk, at(0, 0.72, 0)), '--teak');
      [[-0.58, -0.25], [0.58, -0.25], [-0.58, 0.25], [0.58, 0.25]].forEach(function (p) { box(0.06, 0.72, 0.06, M(desk, at(p[0], 0.36, p[1])), '--teak', false); });
      box(1.1, 0.12, 0.42, M(desk, at(0, 0.81, -0.02, 0, -0.2)), '--cocoa-2', 0.01);
      for (var kn = 0; kn < 12; kn++) {
        kit.cyl(0.018, 0.018, 0.03, M(desk, at(-0.44 + (kn % 6) * 0.18, 0.88 - Math.floor(kn / 6) * 0.03, -0.1 + Math.floor(kn / 6) * 0.14)), '--rattan', false, 8);
      }

      // THE CARVED SOFA on the left of the room, turned to the falls, the fur
      // thrown over it, its back framed with the corners notched out.
      var sofa = at(-2.1, 0, -6.4, 0.35);
      box(3.0, 0.42, 0.9, M(sofa, at(0, 0.21, 0)), '--teak');
      box(2.8, 0.14, 0.76, M(sofa, at(0, 0.49, -0.04)), '--cocoa-2');
      box(2.9, 0.1, 0.14, M(sofa, at(0, 1.08, 0.38)), '--teak');
      box(2.9, 0.1, 0.14, M(sofa, at(0, 0.6, 0.38)), '--teak');
      [-1, 1].forEach(function (s) { box(0.12, 0.38, 0.14, M(sofa, at(s * 1.39, 0.84, 0.38)), '--teak'); });
      box(2.62, 0.38, 0.06, M(sofa, at(0, 0.84, 0.4)), '--cocoa-2');
      [-1, 1].forEach(function (s) { box(0.16, 0.66, 0.9, M(sofa, at(s * 1.5, 0.33, 0)), '--teak'); });
      // The notches along its front, the shape the carving keeps making.
      for (var nt = 0; nt < 7; nt++) box(0.12, 0.12, 0.03, M(sofa, at(-1.2 + nt * 0.4, 0.22, -0.46)), '--stone', false);
      box(1.1, 0.06, 0.8, M(sofa, at(0.6, 0.58, -0.02, 0.15)), '--rattan', 0.01);
      box(0.06, 0.4, 0.8, M(sofa, at(1.14, 0.38, -0.02, 0.15)), '--rattan', 0.01);
      // The table, its top a cross so its corners are notched.
      var table = at(-1.6, 0, -7.9, 0.35);
      box(1.4, 0.08, 0.5, M(table, at(0, 0.42, 0)), '--teak');
      box(1.1, 0.08, 0.76, M(table, at(0, 0.42, 0)), '--teak');
      [[-0.5, -0.3], [0.5, -0.3], [-0.5, 0.3], [0.5, 0.3]].forEach(function (p) { box(0.1, 0.38, 0.1, M(table, at(p[0], 0.19, p[1])), '--teak', false); });

      // THE ROOM'S OWN PAGE on the front wall beside the door, in a carved
      // frame with its corners notched out.
      var pw = 2.2, ph = pw * 800 / 1180, py = 0.55 + ph / 2, px = 2.75;
      box(pw + 0.24, ph + 0.08, 0.06, at(px, py, -0.03), '--teak', 0.012);
      box(pw + 0.08, ph + 0.24, 0.06, at(px, py, -0.03), '--teak', 0.012);
      var frame = kit.screen(1180, 800, pw, at(px, py, -0.07, Math.PI), 'The Den’s own page, on the wall beside the door');

      // THE CARPETS WITH THE CUTS ON THEM, off the page: February on the
      // left-hand wall and October on the right, each standing on a teak rail,
      // every cut playing where it stands.
      box(0.12, 0.08, 3.0, at(-W / 2 + 0.06, 0.24, -3.8), '--teak');
      box(0.12, 0.08, 3.0, at(W / 2 - 0.06, 0.24, -3.8), '--teak');
      var feb = kit.lift(frame, '.carpet', { n: 0, w: 900, h: 660, ww: 2.8, m: at(-W / 2 + 0.04, 0.3, -3.8, LEFT) });
      var oct = kit.lift(frame, '.carpet', { n: 1, w: 900, h: 660, ww: 2.8, m: at(W / 2 - 0.04, 0.3, -3.8, RIGHT) });
      // The stone panels with the room's words: the room and then the records
      // on the left, the house rules on the right.
      var room = kit.lift(frame, '.stonewall', { n: 0, w: 760, h: 760, ww: 2.0, m: at(-W / 2 + 0.04, 0.4, -8.1, LEFT) });
      var rules = kit.lift(frame, '.stonewall', { n: 1, w: 760, h: 760, ww: 2.0, m: at(W / 2 - 0.04, 0.4, -8.1, RIGHT) });
      // Its name on the front wall the other side of the door; the waterfall is
      // standing in the room, so its drawing stays on the page.
      var head = kit.lift(frame, '.den-head', { drop: '.falls', w: 760, ww: 2.2, m: at(-2.75, 0.5, -0.04, Math.PI) });

      return {
        start: { x: 0, z: -0.9, yaw: 0 },
        bounds: { x: [-W / 2 + 1.2, W / 2 - 1.2], z: [back + 1.4, -0.6] },
        stops: [
          { name: 'just through the door from the forest, the room brown and low, the carpet green, the waterfall at the far end', x: 0, z: -0.9, yaw: 0 },
          { name: 'by the carved sofa, the fur thrown over it, facing the falls', x: -2.0, z: -5.2, yaw: 0.25, pitch: -0.1 },
          { name: 'at the waterfall of cut fieldstone on the north wall, a jade lamp either side of it', x: 0.6, z: back + 4.3, yaw: 0, pitch: -0.12 },
          { name: 'at the microphone, where the studio came into the den', x: -1.7, z: back + 2.7, yaw: 0.9, pitch: -0.15 },
          { name: 'at the February carpet, every cut on it saying how long it runs and who wrote it', x: -2.1, z: -3.8, yaw: LEFT, pitch: -0.05, frame: feb.el },
          { name: 'at the October carpet, three nights eight months later', x: 2.1, z: -3.8, yaw: RIGHT, pitch: -0.05, frame: oct.el },
          { name: 'at the stone panel on the room, and then the records', x: -2.6, z: -8.1, yaw: LEFT, frame: room.el },
          { name: 'at the house rules, in here', x: 2.6, z: -8.1, yaw: RIGHT, frame: rules.el },
          { name: 'back at the door, with the room’s name beside it', x: -2.75, z: -3.0, yaw: Math.PI, frame: head.el },
          { name: 'back at the door, with the room’s own page beside it', x: 2.75, z: -2.6, yaw: Math.PI, page: kit.page, frame: frame }
        ]
      };
    }
  };
})();

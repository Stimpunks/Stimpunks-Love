/* =============================================================================
   Hey, Good Cookin', walked into on Cel Street. Ryan's ask, 2026-10-31: back
   on the street, working down it a room at a time.

   IT IS THE COMMUNITY KITCHEN'S WORLD AND NOBODY ELSE'S (§93): a hall with
   every pot on, on a cold day. The steam off the line has fogged the windows
   along the left-hand wall from end to end, so the daylight comes in soft
   along that whole wall and lands on nothing in particular, and THE ONLY SHARP
   LIGHT IS WHERE A DROP HAS RUN DOWN THE GLASS and cleared a line you can see
   the day through: the runs, drawn flat in the day's own blue on the fog.
   There is no lamp over the food, because the line is heated from underneath
   in hot water; every shadow is soft, so the window's light casts none.

   THE PLACARDS ARE THE ONLY GREEN, YELLOW AND RED IN THE ROOM, and they are
   drawn only where a placard is: a tent on a table, each with its shape on
   both faces (the circle, the triangle, the square) as the page has them, and
   the station by the door where they are picked up. A red placard is only ever
   on a 2-top, and the 2-tops are filled first; a table with no placard is a
   table nobody is at yet. Every table is the same height with room under it,
   so there is no wheelchair table, because every table is one.

   THE COLLISIONS, held off as §93 holds them: the windows are fogged, never
   clear (the Community Center's view), and they have runs in them (the
   Directors' frosted pane); the trays are plain, one well, NO DIVIDED TRAY
   anywhere (Samefood Cafe's plate); nothing over the food is lit (Mycelium
   Munchies' heat lamps); there is no wood (the warm brown rooms).

   THE WORDS ARE THE PAGE'S OWN, lifted off it and never retyped: the welcome
   in Ryan's words, the placards and their rules, every dish card with its
   allergen line, the line from a chair, the classes, what the kitchen keeps,
   and the rack, which rack.js, the page's own script, plays where it hangs or
   puts up on the teaching screen; nothing reaches YouTube until a press.
   Nobody is drawn and no food is: it is under the lids. Nothing owed: no jar,
   no rota, no prices.

   NOTHING MOVES, at any setting: no steam rises. Every colour is one the room
   declares, by name. It keeps nothing, sends nothing and fetches nothing; its
   page arrives through Cel Street's screen(), on the right-hand wall.
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['hey-good-cookin.html'] = {
    name: 'Hey, Good Cookin’',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var W = 16, D = 18, H = 4.2, back = -D;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;

      // THE LIGHT: the fogged day along the left-hand wall, soft, casting
      // nothing, and the warm white of the walls giving it back.
      kit.scene.background = kit.col('--hgc-wall');
      kit.scene.add(new T.HemisphereLight(kit.col('--hgc-fog'), kit.col('--hgc-floor'), 1.7));
      var day = new T.DirectionalLight(kit.col('--hgc-fog'), 1.1);
      day.position.set(-20, 6, -8);
      day.target.position.set(0, 0, -9);
      kit.scene.add(day, day.target);

      // THE HALL: the floor, the walls, the ceiling, the door behind you.
      box(W, 0.1, D + 0.4, at(0, -0.05, -D / 2), '--hgc-floor', false, false);
      box(0.3, H, D, at(W / 2 + 0.15, H / 2, -D / 2), '--hgc-wall', false, false);
      box(W + 0.6, H, 0.3, at(0, H / 2, back - 0.15), '--hgc-wall', false, false);
      box(W + 0.6, 0.2, D + 0.6, at(0, H + 0.1, -D / 2), '--hgc-wall', false, false);
      box((W - 1.6) / 2, H, 0.3, at(-(W + 1.6) / 4, H / 2, 0.15), '--hgc-wall', false, false);
      box((W - 1.6) / 2, H, 0.3, at((W + 1.6) / 4, H / 2, 0.15), '--hgc-wall', false, false);
      box(1.6, H - 2.3, 0.3, at(0, 2.3 + (H - 2.3) / 2, 0.15), '--hgc-wall', false, false);
      box(1.5, 2.25, 0.08, at(0, 1.13, 0.02), '--hgc-frame');
      box(0.06, 0.3, 0.06, at(0.55, 1.05, -0.04), '--hgc-steel', false);
      // A skirting line round the room, in the frames' grey.
      [[W / 2 - 0.02, -D / 2, RIGHT, D], [0, back + 0.02, 0, W]].forEach(function (s) {
        box(s[3], 0.12, 0.03, at(s[0], 0.06, s[1], s[2]), '--hgc-frame', false, false);
      });

      // THE WINDOWS, the whole of the left-hand wall: the wall in pieces round
      // them, the glass fogged from end to end, and the runs down it where a
      // drop has cleared a line of the day, each ending in its drop. A fixed
      // seed, so it is the same glass every visit.
      var seed = 93;
      var rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
      var WX = -W / 2, wy0 = 0.9, wh = 2.6, ww = 1.7, gap = 0.55, n = 7;
      var span = n * ww + (n - 1) * gap, z0 = -(D - span) / 2;
      box(0.3, wy0, D, at(WX - 0.15, wy0 / 2, -D / 2), '--hgc-wall', false, false);
      box(0.3, H - wy0 - wh, D, at(WX - 0.15, wy0 + wh + (H - wy0 - wh) / 2, -D / 2), '--hgc-wall', false, false);
      box(0.3, wh, -z0, at(WX - 0.15, wy0 + wh / 2, z0 / 2), '--hgc-wall', false, false);
      box(0.3, wh, D + z0 - span, at(WX - 0.15, wy0 + wh / 2, (z0 - span + back) / 2), '--hgc-wall', false, false);
      for (var w = 0; w < n; w++) {
        var wz = z0 - w * (ww + gap) - ww / 2;
        if (w < n - 1) box(0.3, wh, gap, at(WX - 0.15, wy0 + wh / 2, wz - ww / 2 - gap / 2), '--hgc-wall', false, false);
        kit.flat(new T.PlaneGeometry(ww, wh), at(WX + 0.01, wy0 + wh / 2, wz, LEFT), '--hgc-fog');
        box(0.08, wh + 0.12, 0.08, at(WX + 0.04, wy0 + wh / 2, wz - ww / 2), '--hgc-frame', false);
        box(0.08, wh + 0.12, 0.08, at(WX + 0.04, wy0 + wh / 2, wz + ww / 2), '--hgc-frame', false);
        box(0.08, 0.08, ww, at(WX + 0.04, wy0 + wh, wz), '--hgc-frame', false);
        box(0.06, 0.06, ww, at(WX + 0.04, wy0 + wh * 0.55, wz), '--hgc-frame', false);
        box(0.22, 0.06, ww + 0.16, at(WX + 0.1, wy0 - 0.03, wz), '--hgc-steel');
        var runs = 2 + Math.floor(rnd() * 2);
        for (var r = 0; r < runs; r++) {
          var rz = wz - ww / 2 + 0.2 + rnd() * (ww - 0.4);
          var top = wy0 + 0.25 + rnd() * (wh * 0.55);
          var len = 0.4 + rnd() * (wh - (top - wy0) - 0.35);
          kit.flat(new T.PlaneGeometry(0.035, len), at(WX + 0.02, top + len / 2, rz, LEFT), '--hgc-day');
          kit.flat(new T.CircleGeometry(0.035, 10), at(WX + 0.021, top, rz, LEFT), '--hgc-day');
        }
      }

      // THE LINE along the back wall: a steel counter with the pans sunk in it
      // under their lids, the soup kettle in enamel at the start, the tray
      // slide along the front at a seat's reach, and the sneeze shelf on its
      // posts. No lamp over any of it, and no food to see.
      var LZ = back + 0.9, LH = 0.86, LL = 10.4;
      box(LL, LH, 0.9, at(0, LH / 2, LZ), '--hgc-steel', 0.012);
      box(LL + 0.1, 0.04, 1.0, at(0, LH + 0.02, LZ), '--hgc-steel', 0.012);
      box(LL, 0.04, 0.32, at(0, 0.8, LZ + 0.62), '--hgc-frame', false);
      [-1, 1].forEach(function (e) { box(0.05, 0.8, 0.05, at(e * (LL / 2 - 0.1), 0.4, LZ + 0.74), '--hgc-frame', false); });
      for (var p = 0; p < 6; p++) box(0.05, 0.5, 0.05, at(-LL / 2 + 0.3 + p * (LL - 0.6) / 5, LH + 0.27, LZ + 0.32), '--hgc-frame', false);
      box(LL - 0.4, 0.04, 0.42, at(0, LH + 0.52, LZ + 0.12), '--hgc-steel', 0.012);
      for (var q = 0; q < 8; q++) {
        var px = -3.6 + q * 1.15;
        box(0.95, 0.03, 0.6, at(px, LH + 0.05, LZ - 0.05), '--hgc-frame', false, false);
        var lid = new T.SphereGeometry(0.4, 16, 6, 0, Math.PI * 2, 0, Math.PI / 2);
        lid.scale(1.12, 0.32, 0.7);
        kit.piece(lid, at(px, LH + 0.06, LZ - 0.05), '--hgc-steel', 0.012);
        box(0.18, 0.04, 0.05, at(px, LH + 0.2, LZ - 0.05), '--hgc-frame', false);
      }
      // The soup kettle, speckled enamel, the room's own colour.
      var kx = -LL / 2 + 0.55, kz = LZ - 0.05;
      cyl(0.34, 0.3, 0.52, at(kx, LH + 0.3, kz), '--hgc-enamel', 0.012, 24);
      cyl(0.37, 0.37, 0.05, at(kx, LH + 0.58, kz), '--hgc-enamel', 0.012, 24);
      cyl(0.05, 0.05, 0.06, at(kx, LH + 0.64, kz), '--hgc-enamel-deep', false, 10);
      for (var f = 0; f < 9; f++) {
        var fa = f * 0.7 - 1.1, fy = LH + 0.12 + (f % 3) * 0.13;
        kit.flat(new T.CircleGeometry(0.018, 8), at(kx + Math.sin(fa) * 0.335, fy, kz + Math.cos(fa) * 0.335, fa), '--hgc-fleck');
      }
      // THE SHELF AT THE START, at the height of a seat as well as a standing
      // hand: plain trays, one well each, never divided.
      var sx = -LL / 2 - 0.85;
      box(1.1, 0.04, 0.6, at(sx, 0.5, LZ + 0.1), '--hgc-steel', 0.012);
      box(1.1, 0.04, 0.6, at(sx, 0.84, LZ + 0.1), '--hgc-steel', 0.012);
      [-1, 1].forEach(function (e) { box(0.04, 0.86, 0.04, at(sx + e * 0.52, 0.43, LZ + 0.36), '--hgc-frame', false); box(0.04, 0.86, 0.04, at(sx + e * 0.52, 0.43, LZ - 0.16), '--hgc-frame', false); });
      [0.52, 0.86].forEach(function (y) {
        for (var t = 0; t < 4; t++) box(0.9, 0.025, 0.44, at(sx, y + 0.03 + t * 0.03, LZ + 0.1), '--hgc-card', 0.008);
      });

      // THE PLACARDS. A tent, its colour on both faces and its shape on each,
      // drawn as the page draws them; only ever here.
      var MARK = {
        go: function (m) { kit.flat(new T.CircleGeometry(0.05, 16), m, '--hgc-card'); },
        ask: function (m) {
          var s = new T.Shape(); s.moveTo(0, 0.055); s.lineTo(0.055, -0.04); s.lineTo(-0.055, -0.04); s.lineTo(0, 0.055);
          kit.flat(new T.ShapeGeometry(s), m, '--hgc-ink');
        },
        alone: function (m) { kit.flat(new T.PlaneGeometry(0.085, 0.085), m, '--hgc-card'); }
      };
      var INK = { go: '--hgc-go', ask: '--hgc-ask', alone: '--hgc-alone' };
      function placard(g, kind) {
        [-1, 1].forEach(function (e) {
          var face = M(g, at(0, 0.1, e * 0.03, e < 0 ? Math.PI : 0, -0.28));
          box(0.28, 0.2, 0.008, face, INK[kind], 0.006);
          MARK[kind](M(face, at(0, 0, 0.006)));
        });
      }

      // THE TABLES: white tops on steel legs, every one the same height with
      // room under it, the chairs pulled up. The 2-tops along the windows are
      // filled first; the red placard is on one of them and never on the long
      // table; a table with no placard is a table nobody is at yet.
      function chair(m) {
        box(0.44, 0.05, 0.44, M(m, at(0, 0.46, 0)), '--hgc-enamel', 0.01);
        box(0.44, 0.42, 0.04, M(m, at(0, 0.7, -0.2)), '--hgc-enamel', 0.01);
        [[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]].forEach(function (l) {
          cyl(0.015, 0.015, 0.46, M(m, at(l[0], 0.23, l[1])), '--hgc-frame', false, 6);
        });
      }
      function table(x, z, tw, td, seats, kind) {
        var g = at(x, 0, z);
        box(tw, 0.04, td, M(g, at(0, 0.76, 0)), '--hgc-card', 0.012);
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) {
          box(0.05, 0.74, 0.05, M(g, at(c[0] * (tw / 2 - 0.08), 0.37, c[1] * (td / 2 - 0.08))), '--hgc-frame', false);
        });
        seats.forEach(function (s) { chair(M(g, at(s[0], 0, s[1], s[2]))); });
        if (kind) placard(M(g, at(0, 0.78, 0, 0.7)), kind);
      }
      var two = [[0, -0.62, 0], [0, 0.62, Math.PI]];
      var four = [[-0.4, -0.72, 0], [0.4, -0.72, 0], [-0.4, 0.72, Math.PI], [0.4, 0.72, Math.PI]];
      var long = [];
      [-1.2, -0.4, 0.4, 1.2].forEach(function (cx) { long.push([cx, -0.82, 0], [cx, 0.82, Math.PI]); });
      var WINX = -W / 2 + 1.7;
      table(WINX, -4.4, 0.8, 0.8, two, 'alone');
      table(WINX, -7.6, 0.8, 0.8, two, 'ask');
      table(WINX, -10.8, 0.8, 0.8, two, null);
      table(-1.0, -6.0, 3.4, 1.0, long, 'go');
      table(-1.0, -10.4, 1.6, 1.0, four, 'go');
      table(3.4, -5.2, 1.6, 1.0, four, null);
      table(3.4, -9.0, 1.6, 1.0, four, 'ask');

      // THE PLACARD STATION by the door: a stand with a shelf of each.
      var st = at(4.3, 0, -0.75, Math.PI);
      box(1.3, 0.04, 0.45, M(st, at(0, 0.84, 0)), '--hgc-steel', 0.012);
      box(1.3, 0.04, 0.45, M(st, at(0, 0.45, 0)), '--hgc-steel', 0.012);
      [-0.6, 0.6].forEach(function (lx) { box(0.04, 0.86, 0.4, M(st, at(lx, 0.43, 0)), '--hgc-frame', false); });
      ['go', 'ask', 'alone'].forEach(function (k, i) {
        placard(M(st, at(-0.4 + i * 0.4, 0.86, 0)), k);
        placard(M(st, at(-0.4 + i * 0.4, 0.47, 0)), k);
      });

      // THE TEACHING COUNTER on the right-hand wall: a counter at a seat's
      // height with room under it, the mirror over it, and the teaching
      // screen beside the mirror.
      var TZ = -13.0;
      var tc = at(W / 2 - 0.45, 0, TZ, RIGHT);
      box(3.4, 0.04, 0.8, M(tc, at(0, 0.82, 0)), '--hgc-steel', 0.012);
      [-1.6, 1.6].forEach(function (lx) { box(0.05, 0.8, 0.7, M(tc, at(lx, 0.4, 0)), '--hgc-frame', false); });
      cyl(0.18, 0.18, 0.14, M(tc, at(-0.9, 0.91, 0)), '--hgc-enamel', 0.01, 20);
      cyl(0.13, 0.13, 0.04, M(tc, at(0.6, 0.86, 0)), '--hgc-frame', false, 20);
      var mg = at(W / 2 - 0.02, 0, TZ + 1.05, RIGHT);
      box(1.1, 1.3, 0.04, M(mg, at(0, 1.75, 0)), '--hgc-frame', false);
      kit.flat(new T.PlaneGeometry(1.0, 1.2), M(mg, at(0, 1.75, 0.025)), '--hgc-fog');

      // THE ROOM'S OWN PAGE, on the right-hand wall near the door.
      var pw = 3.0, ph = pw * 800 / 1180, py = 0.85 + ph / 2;
      var pg = at(W / 2 - 0.02, 0, -5.8, RIGHT);
      box(pw + 0.16, ph + 0.16, 0.05, M(pg, at(0, py, 0)), '--hgc-frame', 0.012);
      var page = kit.screen(1180, 800, pw, M(pg, at(0, py, 0.04)), 'Hey, Good Cookin’’s own page, on the right-hand wall');

      // WHAT IS LIFTED OFF THE PAGE. Its parts, in the page's order: the
      // welcome, no strings, seat yourself, the line, the line from a chair,
      // the teaching kitchen, the teaching screen, the rack, what the kitchen
      // keeps.
      var part = function (n, w, h, ww, m) { return kit.lift(page, '.hgc-part', { n: n, w: w, h: h, ww: ww, m: m }); };
      var line = part(3, 760, 560, 3.4, at(0, LH + 0.62, back + 0.03));
      var welcome = part(0, 720, 560, 1.9, at(W / 2 - 0.02, 0.95, -2.6, RIGHT));
      var seat = part(2, 760, 600, 2.0, at(4.3, 1.0, -0.03, Math.PI));
      var access = part(4, 760, 620, 2.0, at(-3.2, 0.95, -0.03, Math.PI));
      var keeps = part(8, 700, 560, 1.8, at(-6.2, 0.95, -0.03, Math.PI));
      var classes = part(5, 800, 680, 2.0, at(W / 2 - 0.02, 0.95, -9.3, RIGHT));
      var scr = at(W / 2 - 0.02, 0, TZ - 0.55, RIGHT);
      var screen = kit.lift(page, '.hgc-screen', { w: 860, ww: 1.9, m: M(scr, at(0, 1.6, 0)) });
      kit.lift(page, '.hgc-screen__now', { w: 760, ww: 1.7, m: M(scr, at(0, 1.3, 0)) });
      kit.lift(page, '.hgc-screen__back', { w: 420, ww: 0.9, m: M(scr, at(0, 1.02, 0)) });
      var rack = part(7, 900, 760, 2.4, at(W / 2 - 0.02, 0.92, -16.0, RIGHT));
      kit.wire(page, 'rack.js');

      var stops = [
        { name: 'just inside the door, the windows fogged all down the left and the line along the back', x: 0, z: -1.2, yaw: 0, pitch: 0.04 },
        { name: 'at the placard station by the door, with the placards and the rules for them', where: 'at the placard station by the door', x: 4.3, z: -3.4, yaw: Math.PI, pitch: 0.12, frame: seat.el },
        { name: 'at the windows, where a drop has run down the fog and the day shows through', where: 'at the fogged windows', x: -W / 2 + 2.6, z: -6.0, yaw: LEFT, pitch: 0.18 },
        { name: 'at the 2-top by the window with a red placard on it: please don’t sit here', where: 'at the 2-top with the red placard', x: WINX + 1.3, z: -4.4, yaw: LEFT, pitch: -0.42 },
        { name: 'at the long table with a green placard on it: sit wherever there’s a space', where: 'at the long table with the green placard', x: -1.0, z: -3.6, yaw: 0, pitch: -0.36 },
        { name: 'at the shelf at the start of the line, the plain trays at a seat’s height and a standing hand’s', where: 'at the shelf at the start of the line', x: sx + 0.4, z: LZ + 2.4, yaw: 0, pitch: -0.12 },
        { name: 'at the line, the pans under their lids in hot water and every dish card on the wall above', where: 'at the line, with every dish card', x: 0, z: LZ + 2.9, yaw: 0, pitch: 0.26, frame: line.el },
        { name: 'at the soup kettle, speckled enamel, at the start of the line', where: 'at the soup kettle', x: kx + 0.3, z: LZ + 1.7, yaw: 0, pitch: -0.2 },
        { name: 'at the welcome, in Ryan’s words, on the right-hand wall by the door', where: 'at the welcome', x: W / 2 - 2.4, z: -2.6, yaw: RIGHT, pitch: 0.06, frame: welcome.el },
        { name: 'at the right-hand wall, with the room’s own page on it', x: W / 2 - 2.6, z: -5.8, yaw: RIGHT, pitch: 0.1, page: kit.page, frame: page },
        { name: 'at the classes you can follow sitting down, on the right-hand wall', where: 'at the classes', x: W / 2 - 2.5, z: -9.3, yaw: RIGHT, pitch: 0.06, frame: classes.el },
        { name: 'at the teaching counter, the mirror over it and the teaching screen beside it', where: 'at the teaching counter and its screen', x: W / 2 - 2.6, z: TZ - 0.2, yaw: RIGHT, pitch: 0.1, frame: screen.el },
        { name: 'at the rack, the last month from cooking channels, for the teaching screen', where: 'at the rack', x: W / 2 - 2.4, z: -16.0, yaw: RIGHT, pitch: 0.04, frame: rack.el },
        { name: 'looking back at the line from a chair, by the door', where: 'at the line from a chair, by the door', x: -3.2, z: -3.1, yaw: Math.PI, pitch: 0.06, frame: access.el },
        { name: 'looking back at what the kitchen keeps, by the door', where: 'at what the kitchen keeps', x: -6.0, z: -2.9, yaw: Math.PI, pitch: 0.06, frame: keeps.el }
      ];

      return {
        start: { x: 0, z: -1.2, yaw: 0 },
        bounds: { x: [-W / 2 + 0.8, W / 2 - 0.8], z: [LZ + 1.0, -0.6] },
        stops: stops
      };
    }
  };
})();

/* =============================================================================
   The Emergent Future Worlds Meets Mountain Man, walked into on Cel Street.
   Ryan's ask, 2026-10-31: David's cabin at the summit over the campgrounds,
   through its post in the field.

   IT IS DAVID'S WORLD AND NOBODY ELSE'S (§118): a log cabin at the top of the
   mountain, at night, warm and cosy meets smart-home modern. THE LIGHT IS THE
   VISITOR'S TO CHOOSE: strips along the top of the walls and under the big
   screen, in the cabin's teal to start with, and the fire behind the stove's
   glass is not what lights the room. The ground is the blue-charcoal of a
   smart home at night, never brown. The whole back wall is a window, and it is
   the cold half: a lake under a full moon far below, the mountain's shoulder
   with snow on its tops, the hot spring steaming on the warm ground just
   outside with its shelf of rock to sit on and the step beside it at seat
   height, the pipes running from it to the cabin, the hut where the ground's
   heat makes the electricity, the cable car's top station and its wire going
   down towards the field, snow lying everywhere but the warm strip, and the
   pack lying round the spring. One wolf is asleep on the rug by the stove.

   Inside, as the page has it: knots in the logs, boards with their joints and
   nails, joists across the ceiling, a plank door, a coat and a scarf on the
   pegs by it. The stove stands on its hearth on legs, its glass framed, the
   logs behind it, a basket of split logs beside it, the coffee pot on top and
   the cups on the shelf above with more hanging under it. The diffuser is on
   its side table by the stove, with the shelf of oils beside it. The cushions
   wear whichever colour the strips are and change when they do, as on the
   page; the bean bags keep their own. A throw on the sofa under the window,
   rings on the rug, three cups on the low table, a low console under the big
   screen, and a lamp on each speaker.

   HABITABLE, off its own page: the cabin's smart panel by the door, with the
   one switch, the colour of the strips, the scent and the words saying what
   moved (mountain-man.js); the big screen with David's playlist on it and the
   songs one press each beside it (rack.js); the howl and the recording of real
   wolves by the window; and the way to David's photographs through it. The
   room's own page hangs on the wall by the door. The one switch reaches the
   scene too: off puts out the fire, the strips, their light, the lamps on the
   speakers and the diffuser, the diffuser's wisps and the coffee's steam, as
   the page's own drawing does.

   TO PRESS, here: Let the fire flicker (at the stove; the fire behind the
   glass sways under the flash line, and only after that press, never before;
   it is still again on the next press). Pour the coffee (at the low table; the
   three cups there fill, and empty on Drink up). Send the cable car down (at
   the window; the car leaves its station at the top for a place down the
   wire, and Call it up brings it back). Each says what it did, in words.

   NOTHING MOVES BEFORE A PRESS: the fire is the one thing in this file that
   moves, and only after Let the fire flicker; what the panel's own drawing
   does after a press is mountain-man.js's, under its page's rules. Nobody
   counts, feeds or names the wolves. Every colour is one the room declares,
   by name. It keeps nothing, sends nothing and fetches nothing; its page
   arrives through Cel Street's screen(). tools/make-cel-street.py holds each
   of those. The scene is ours, drawn from David's page, and his to keep or
   send back.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 19, 374761393) ^ Math.imul(j + 61, 668265263) ^ Math.imul(k + 67, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['the-mountain-cabin.html'] = {
    name: 'The Emergent Future Worlds Meets Mountain Man',
    from: 'campgrounds.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var W = 10, D = 8, H = 3.0, LOG = 0.32;
      var L = -W / 2, R = W / 2, BACK = -D;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var WIN = { y0: 0.6, y1: 2.6 };
      var b, q;

      // NIGHT, and the strips' light: the room is lit by the colour on the
      // strips, the moon comes in at the window, and the fire lights nothing.
      kit.scene.background = kit.col('--efw-sky');
      kit.scene.add(new T.HemisphereLight(kit.col('--efw-dim'), kit.col('--efw-night'), 1.7));
      // The strips, their light, the lamps, the cushions, the fire and the
      // wisps are kept, so the cabin's own switch and colour (on the panel by
      // the door) can change them.
      var strips = [], glows = [], fire = [], flames = [], cushionsOf = [], wisps = [];
      [[L + 1, -1], [R - 1, -1], [L + 1, BACK + 1], [R - 1, BACK + 1], [0, -D / 2]].forEach(function (p) {
        var led = new T.PointLight(kit.col('--efw-led-1'), 3, 8, 1.5);
        led.position.set(p[0], H - 0.25, p[1]);
        kit.scene.add(led);
        glows.push(led);
      });
      var moon = new T.DirectionalLight(kit.col('--efw-moon'), 0.7);
      moon.position.set(6, 14, -30); moon.target.position.set(0, 0, -4);
      kit.scene.add(moon, moon.target);

      // THE FLOOR: boards with their joints, staggered, and the nails at each
      // end; and the ceiling, its beams and the joists across them.
      box(W + 0.4, 0.1, D + 0.4, at(0, -0.05, -D / 2), '--efw-floor', false, false);
      for (b = 0; b < 14; b++) {
        var bz = -0.3 - b * 0.56;
        box(W, 0.012, 0.02, at(0, 0.002, bz), '--efw-log-2', false, false);
        for (var j0 = 0; j0 < 3; j0++) {
          var jx = L + 1.2 + j0 * 3.1 + hash(b, j0, 7) * 1.6;
          box(0.02, 0.012, 0.54, at(jx, 0.002, bz - 0.28), '--efw-log-2', false, false);
          [-0.12, 0.12].forEach(function (e) {
            [-0.06, 0.06].forEach(function (s) { kit.piece(new T.CircleGeometry(0.012, 5), at(jx + s, 0.004, bz - 0.28 + e, 0, -Math.PI / 2), '--efw-iron-2', false, false); });
          });
        }
      }
      box(W + 0.4, 0.14, D + 0.4, at(0, H + 0.07, -D / 2), '--efw-log-2', false, false);
      [-2.5, 0, 2.5].forEach(function (x) { box(0.28, 0.3, D, at(x, H - 0.15, -D / 2), '--efw-log', 0.02); });
      for (b = 0; b < 5; b++) box(W, 0.12, 0.14, at(0, H - 0.06, -0.9 - b * 1.55), '--efw-log-2', 0.012);

      // THE WALLS: logs, with the dark between them, a door on the left of the
      // front wall.
      function logWall(m, len, gaps) {
        for (var r = 0; r * LOG < H; r++) {
          var y = LOG / 2 + r * LOG, spans = [[-len / 2, len / 2]];
          (gaps || []).forEach(function (g) {
            if (y > g[2] && y < g[3]) {
              spans = spans.reduce(function (out, sp) {
                if (g[1] <= sp[0] || g[0] >= sp[1]) { out.push(sp); return out; }
                if (g[0] > sp[0]) out.push([sp[0], g[0]]);
                if (g[1] < sp[1]) out.push([g[1], sp[1]]);
                return out;
              }, []);
            }
          });
          spans.forEach(function (sp) {
            var w = sp[1] - sp[0];
            if (w < 0.05) return;
            kit.cyl(LOG / 2, LOG / 2, w, M(m, at((sp[0] + sp[1]) / 2, y, 0, 0, 0, Math.PI / 2)), r % 2 ? '--efw-log' : '--efw-wood', 0.02, 10);
          });
        }
      }
      logWall(at(L, 0, -D / 2, LEFT), D, []);
      logWall(at(R, 0, -D / 2, RIGHT), D, []);
      logWall(at(0, 0, 0, Math.PI), W, [[2.4, 3.6, 0, 2.2]]);       // the door, on the left as you face in
      // Below and above the window, the back wall is logs too.
      logWall(at(0, 0, BACK), W, [[-W / 2, W / 2, WIN.y0, WIN.y1]]);
      // Knots in the logs, an oval of the dark wherever a branch was, on the
      // inside face of the walls.
      function knots(m, len, n, k, top) {
        for (var i = 0; i < n; i++) {
          var kn = new T.CircleGeometry(0.035 + hash(i, k, 1) * 0.03, 8); kn.scale(1.7, 0.8, 1);
          var row = Math.floor(hash(i, k, 2) * top / LOG);
          kit.piece(kn, M(m, at((hash(i, k, 3) - 0.5) * (len - 0.4), LOG / 2 + row * LOG, LOG / 2 + 0.006)), '--efw-log-2', false, false);
        }
      }
      knots(at(L, 0, -D / 2, LEFT), D, 26, 1, H);
      knots(at(R, 0, -D / 2, RIGHT), D, 26, 2, H);
      knots(at(0, 0, BACK), W, 14, 3, WIN.y0);
      // The door: planks, a brace across them, hinges and the latch.
      var dr = at(-3.0, 0, -0.06);
      box(1.1, 2.15, 0.08, M(dr, at(0, 1.08, 0)), '--efw-wood', 0.02);
      for (b = 0; b < 4; b++) box(0.012, 2.1, 0.02, M(dr, at(-0.41 + b * 0.275, 1.08, -0.045)), '--efw-log-2', false, false);
      [0.45, 1.75].forEach(function (y) { box(1.0, 0.12, 0.03, M(dr, at(0, y, -0.055)), '--efw-log', 0.01); });
      box(0.1, 1.5, 0.03, M(dr, at(0, 1.1, -0.055, 0, 0, -0.95)), '--efw-log', 0.01);
      [0.45, 1.75].forEach(function (y) { box(0.32, 0.05, 0.02, M(dr, at(-0.4, y, -0.08)), '--efw-iron-2', false); });
      box(0.06, 0.24, 0.06, M(dr, at(0.4, 1.05, -0.08)), '--efw-iron-2', false);
      // The pegs by the door, a coat on one and a scarf on the next.
      box(0.9, 0.1, 0.03, at(-1.75, 1.8, -0.18), '--efw-wood', 0.01);
      [-2.05, -1.75, -1.45].forEach(function (x) { kit.cyl(0.018, 0.018, 0.1, at(x, 1.8, -0.22, 0, Math.PI / 2), '--efw-iron-2', false, 6); });
      var coat = new T.CylinderGeometry(0.16, 0.27, 1.0, 10, 1, false, 0, Math.PI); coat.scale(1, 1, 0.4);
      kit.piece(coat, at(-2.05, 1.25, -0.24, Math.PI), '--efw-velvet-2', 0.015);
      kit.piece(new T.SphereGeometry(0.15, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), at(-2.05, 1.72, -0.24), '--efw-velvet-2', 0.012);
      [-0.05, 0.05].forEach(function (s, i) { box(0.08, 0.7 - i * 0.12, 0.02, at(-1.75 + s, 1.45 + i * 0.06, -0.22, 0, 0, s), '--efw-cushion', 0.01); });

      // THE LED STRIPS along the top of every wall, in the cabin's teal.
      [[0, -0.18, W, 0], [0, BACK + 0.18, W, 0], [L + 0.18, -D / 2, D, LEFT], [R - 0.18, -D / 2, D, LEFT]].forEach(function (s) {
        strips.push(kit.flat(new T.BoxGeometry(s[2], 0.05, 0.05), at(s[0], H - 0.42, s[1], s[3]), '--efw-led-1'));
      });

      // THE WINDOW: the width of the back wall, glazing bars and a sill, the
      // snow lying along the outside of it, and the night outside.
      for (var bx = L; bx <= R + 0.01; bx += W / 5) box(0.1, WIN.y1 - WIN.y0, 0.14, at(bx, (WIN.y0 + WIN.y1) / 2, BACK), '--efw-iron', 0.015);
      box(W, 0.12, 0.16, at(0, WIN.y1, BACK), '--efw-iron', 0.015);
      box(W, 0.1, 0.4, at(0, WIN.y0 - 0.05, BACK + 0.12), '--efw-wood', 0.015);
      for (b = 0; b < 10; b++) {
        var sn = new T.SphereGeometry(0.5, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2); sn.scale(1.1 + hash(b, 9, 1) * 0.6, 0.12 + hash(b, 9, 2) * 0.08, 0.16);
        kit.piece(sn, at(L + 0.5 + b, WIN.y0 - 0.02, BACK - 0.2), '--efw-moon', false);
      }
      // Outside: the warm ground at the summit, the ring of stones round the
      // hot spring, the shelf of rock along one side of it to sit on and the
      // step beside it at seat height, the pipes from it to the cabin, its
      // steam, and the pack lying on the warm ground.
      box(30, 0.2, 12, at(0, -0.4, BACK - 6.2), '--efw-ridge', false, false);
      var sx = 1.5, sz = BACK - 4.2;
      kit.flat(new T.CircleGeometry(1.9, 24), at(sx, -0.28, sz, 0, -Math.PI / 2), '--efw-lake');
      for (b = 0; b < 18; b++) {
        var a = b / 18 * Math.PI * 2, st = new T.DodecahedronGeometry(0.2 + hash(b, 1, 1) * 0.12, 0); st.scale(1, 0.6, 1);
        kit.piece(st, at(sx + Math.cos(a) * 2.05, -0.22, sz + Math.sin(a) * 2.05, b), '--efw-iron-2', 0.02);
      }
      var shelfRock = new T.BoxGeometry(0.55, 0.36, 1.7); shelfRock.translate(0, 0, 0);
      kit.piece(shelfRock, at(sx - 1.45, -0.12, sz), '--efw-iron-2', 0.02);
      kit.piece(new T.BoxGeometry(0.62, 0.36, 0.62), at(sx - 2.55, -0.12, sz - 0.7), '--efw-iron-2', 0.02);
      [-0.3, 0.3].forEach(function (e) { kit.cyl(0.07, 0.07, sz + 2.0 - BACK, at(sx + e, -0.2, (sz + 2.0 + BACK) / 2, 0, Math.PI / 2), '--efw-iron', 0.01, 8); });
      // The steam, in thin wisps going up off the water, drawn still.
      for (b = 0; b < 5; b++) {
        var spts = [], bx0 = sx + (hash(b, 2, 2) - 0.5) * 2.4, bz0 = sz + (hash(b, 2, 4) - 0.5) * 1.8;
        for (var q0 = 0; q0 < 6; q0++) spts.push(new T.Vector3(bx0 + Math.sin(q0 * 1.1 + b) * 0.12, -0.2 + q0 * 0.2, bz0 + Math.cos(q0 * 0.8 + b) * 0.08));
        kit.piece(new T.TubeGeometry(new T.CatmullRomCurve3(spts), 16, 0.012 + hash(b, 2, 1) * 0.01, 4, false), new T.Matrix4(), '--efw-moon', false);
      }
      // The snow, lying everywhere outside but the ring and the warm strip
      // where the pipes run.
      for (b = 0; b < 46; b++) {
        var dx = (hash(b, 8, 1) - 0.5) * 28, dz = BACK - 0.6 - hash(b, 8, 2) * 11.2;
        if (Math.hypot(dx - sx, dz - sz) < 2.9) continue;
        if (Math.abs(dx - sx) < 1.0 && dz > sz) continue;
        var dr0 = new T.SphereGeometry(0.6 + hash(b, 8, 3) * 0.9, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2); dr0.scale(1.4, 0.18 + hash(b, 8, 4) * 0.14, 1);
        kit.piece(dr0, at(dx, -0.3, dz, hash(b, 8, 5) * 3), '--efw-moon', false, false);
      }
      function wolf(x, y, z, turn, s, lying) {
        var g = at(x, y, z, turn);
        var body = new T.SphereGeometry(0.3 * s, 10, 8); body.scale(1.7, lying ? 0.7 : 0.95, 0.85);
        kit.piece(body, M(g, at(0, (lying ? 0.2 : 0.55) * s, 0)), '--efw-wolf', 0.02);
        var head = new T.SphereGeometry(0.17 * s, 10, 8); head.scale(1.2, 1, 1);
        kit.piece(head, M(g, at(0.55 * s, (lying ? 0.32 : 0.82) * s, 0)), '--efw-wolf', 0.02);
        kit.piece(new T.ConeGeometry(0.09 * s, 0.25 * s, 6), M(g, at(0.76 * s, (lying ? 0.27 : 0.77) * s, 0, 0, 0, -Math.PI / 2)), '--efw-wolf', 0.015);
        [-1, 1].forEach(function (e) { kit.piece(new T.ConeGeometry(0.05 * s, 0.14 * s, 4), M(g, at(0.5 * s, (lying ? 0.5 : 1.0) * s, e * 0.08 * s)), '--efw-wolf', 0.01); });
        var tail = new T.SphereGeometry(0.11 * s, 8, 6); tail.scale(2.6, 0.8, 0.9);
        kit.piece(tail, M(g, at(-0.55 * s, (lying ? 0.14 : 0.45) * s, lying ? 0.22 * s : 0, lying ? 0.9 : 0, 0, lying ? 0 : 0.5)), '--efw-wolf', 0.015);
        if (!lying) [[-0.3, -0.12], [-0.3, 0.12], [0.3, -0.12], [0.3, 0.12]].forEach(function (l) { kit.cyl(0.05 * s, 0.05 * s, 0.4 * s, M(g, at(l[0] * s, 0.2 * s, l[1] * s)), '--efw-wolf', 0.01, 6); });
      }
      wolf(sx - 2.9, -0.3, sz + 0.6, 0.4, 1.1, true);
      wolf(sx + 3.0, -0.3, sz - 0.4, 2.8, 1.0, true);
      wolf(sx - 1.4, -0.3, sz - 2.6, 1.2, 1.15, false);
      wolf(sx + 1.6, -0.3, sz - 2.9, 2.2, 1.0, true);
      wolf(sx - 4.2, -0.3, sz - 1.9, 0.9, 0.95, false);
      // The hut behind the cabin, where the ground's heat makes the
      // electricity, with its pipe going into the ground and a thread of steam.
      var hut = at(-8.2, -0.3, BACK - 7.0, 0.35);
      box(2.4, 1.9, 1.8, M(hut, at(0, 0.95, 0)), '--efw-wood', 0.02);
      for (b = 0; b < 5; b++) box(2.42, 0.03, 1.82, M(hut, at(0, 0.3 + b * 0.34, 0)), '--efw-log-2', false, false);
      var roof = new T.CylinderGeometry(0.01, 1.7, 0.7, 4, 1); roof.rotateY(Math.PI / 4); roof.scale(1.0, 1, 0.78);
      kit.piece(roof, M(hut, at(0, 2.25, 0)), '--efw-iron', 0.02);
      var cap = new T.CylinderGeometry(0.01, 1.25, 0.5, 4, 1); cap.rotateY(Math.PI / 4); cap.scale(1.04, 1, 0.81);
      kit.piece(cap, M(hut, at(0, 2.37, 0)), '--efw-moon', false);
      box(0.6, 1.2, 0.04, M(hut, at(0.5, 0.6, 0.91)), '--efw-iron-2', 0.01);
      kit.cyl(0.09, 0.09, 1.2, M(hut, at(-0.8, 2.3, -0.3)), '--efw-iron', 0.01, 8);
      var hpts = [];
      for (q = 0; q < 6; q++) hpts.push(new T.Vector3(Math.sin(q * 0.9) * 0.1, 2.95 + q * 0.22, Math.cos(q * 0.7) * 0.06));
      kit.piece(new T.TubeGeometry(new T.CatmullRomCurve3(hpts), 14, 0.016, 4, false), M(hut, at(-0.8, 0, -0.3)), '--efw-moon', false);
      // THE CABLE CAR'S TOP STATION, to the right of the spring: two posts, the
      // wheel the wire goes round, a roof over the platform, and the wire going
      // down off the summit towards the field.
      var CA = new T.Vector3(5.2, 2.75, BACK - 3.2), CB = new T.Vector3(-19, -10, -200);
      kit.piece(new T.BoxGeometry(2.6, 0.3, 2.2), at(5.0, -0.15, BACK - 3.4), '--efw-iron-2', 0.02);
      [[4.3, BACK - 3.0], [6.0, BACK - 3.0], [4.3, BACK - 4.0], [6.0, BACK - 4.0]].forEach(function (p) { kit.cyl(0.08, 0.08, 3.1, at(p[0], 1.55, p[1]), '--efw-iron', 0.015, 8); });
      box(2.2, 0.16, 1.4, at(5.15, 3.12, BACK - 3.5), '--efw-iron', 0.015);
      kit.piece(new T.BoxGeometry(2.3, 0.08, 1.5), at(5.15, 3.24, BACK - 3.5), '--efw-moon', false);
      kit.cyl(0.62, 0.62, 0.1, at(CA.x, CA.y + 0.12, CA.z), '--efw-iron-2', 0.015, 20);
      var down = new T.Vector3().subVectors(CB, CA).normalize(), across = new T.Vector3(-down.z, 0, down.x).normalize();
      [-0.5, 0.5].forEach(function (e) {
        var o = across.clone().multiplyScalar(e);
        kit.piece(new T.TubeGeometry(new T.LineCurve3(CA.clone().add(o), CB.clone().add(o)), 1, 0.025, 4, false), new T.Matrix4(), '--efw-iron-2', false);
      });
      // The car, at the station and down the wire; only one is ever shown.
      var carYaw = Math.atan2(-down.x, -down.z);
      function car(p) {
        var g = at(p.x, p.y, p.z, carYaw).multiply(new T.Matrix4().makeScale(1.5, 1.5, 1.5)), parts = [];
        var hang = new T.CylinderGeometry(0.03, 0.03, 0.75, 6); hang.translate(0, -0.375, 0);
        parts.push(kit.facets(hang, g, '--efw-iron-2'));
        parts.push(kit.facets(new T.BoxGeometry(0.5, 0.08, 0.3), M(g, at(0, 0.02, 0)), '--efw-iron-2'));
        parts.push(kit.facets(new T.BoxGeometry(1.25, 1.25, 1.05), M(g, at(0, -1.35, 0)), '--efw-iron'));
        parts.push(kit.facets(new T.BoxGeometry(1.29, 0.45, 0.95), M(g, at(0, -1.15, 0)), '--efw-sky'));
        parts.push(kit.facets(new T.BoxGeometry(1.15, 0.45, 1.09), M(g, at(0, -1.15, 0)), '--efw-sky'));
        parts.push(kit.facets(new T.BoxGeometry(1.29, 0.08, 1.09), M(g, at(0, -1.6, 0)), '--efw-led-1'));
        parts.push(kit.facets(new T.BoxGeometry(1.35, 0.1, 1.15), M(g, at(0, -0.72, 0)), '--efw-iron-2'));
        return parts;
      }
      var carUp = car(CA.clone().add(down.clone().multiplyScalar(0.4)));
      var carDownAt = CA.clone().lerp(CB, 0.17);
      var carDown = car(carDownAt);
      carDown.forEach(function (m) { kit.hide(m, true); });
      // Far below: the lake under the full moon, the moon's path across it,
      // the mountain's shoulders with snow on their tops, and the stars.
      kit.flat(new T.PlaneGeometry(600, 400), at(0, -60, -320, 0, -Math.PI / 2), '--efw-lake');
      kit.flat(new T.PlaneGeometry(9, 380), at(40, -59.8, -330, 0.12, -Math.PI / 2), '--efw-moon');
      [[-140, -230, 70], [-40, -300, 50], [150, -260, 80], [-260, -120, 60], [250, -150, 70], [80, -90, 40], [-90, -80, 35]].forEach(function (h, i) {
        kit.piece(new T.ConeGeometry(h[2], h[2] * 1.3, 7), at(h[0], -60 + h[2] * 0.6, h[1], i), '--efw-ridge', false);
        kit.piece(new T.ConeGeometry(h[2] * 0.3, h[2] * 0.39, 7), at(h[0], -60 + h[2] * 0.6 + h[2] * 0.455, h[1], i), '--efw-moon', false);
      });
      kit.flat(new T.CircleGeometry(16, 40), at(60, 70, -420), '--efw-moon');
      for (b = 0; b < 80; b++) {
        var ra = (hash(b, 3, 1) - 0.5) * 2.2, re = 0.15 + hash(b, 3, 2) * 0.7;
        kit.flat(new T.CircleGeometry(0.6 + hash(b, 3, 3) * 0.6, 5), at(Math.sin(ra) * 400 * Math.cos(re), 400 * Math.sin(re) - 20, -Math.cos(ra) * 400 * Math.cos(re), -ra, 0), '--efw-moon');
      }

      // THE STOVE, glass-fronted, on its hearth on the left wall: the fire
      // behind the framed glass, the logs under it, the coffee pot on top, the
      // cups on the shelf above with more hanging under it, and a basket of
      // split logs beside it.
      var sv = at(L + 0.7, 0, -5.9, LEFT);
      box(1.5, 0.04, 1.25, M(sv, at(0, 0.02, 0.2)), '--efw-iron-2', 0.01, false);
      [[-0.42, -0.28], [0.42, -0.28], [-0.42, 0.28], [0.42, 0.28]].forEach(function (l) { kit.cyl(0.04, 0.03, 0.12, M(sv, at(l[0], 0.1, l[1])), '--efw-iron-2', false, 6); });
      box(1.0, 0.92, 0.75, M(sv, at(0, 0.62, 0)), '--efw-iron');
      box(0.72, 0.56, 0.02, M(sv, at(0, 0.6, 0.38)), '--efw-sky', false);
      [[0, 0.9], [0, 0.31]].forEach(function (f) { box(0.82, 0.05, 0.04, M(sv, at(f[0], f[1], 0.39)), '--efw-iron-2', false); });
      [-0.39, 0.39].forEach(function (x) { box(0.05, 0.62, 0.04, M(sv, at(x, 0.6, 0.39)), '--efw-iron-2', false); });
      kit.cyl(0.02, 0.02, 0.16, M(sv, at(0.33, 0.62, 0.43)), '--efw-iron-2', false, 6);
      // The logs in the firebox, behind the glass.
      kit.flat(new T.PlaneGeometry(0.56, 0.06), M(sv, at(0, 0.37, 0.393)), '--efw-log-2');
      kit.flat(new T.PlaneGeometry(0.42, 0.055, 1, 1), M(sv, at(0.04, 0.43, 0.393, 0, 0, 0.12)), '--efw-log-2');
      // The fire, each flame with its foot at its own origin, so it can sway.
      [[-0.15, 0.39, 0.26, 0.42], [0.08, 0.39, 0.22, 0.36], [0.22, 0.39, 0.16, 0.26]].forEach(function (f) {
        var fl = new T.ConeGeometry(f[2] / 2, f[3], 8); fl.scale(1, 1, 0.3); fl.translate(0, f[3] / 2, 0);
        var mesh = kit.flat(fl, M(sv, at(f[0], f[1], 0.395)), '--efw-flame');
        fire.push(mesh); flames.push(mesh);
      });
      fire.push(kit.flat(new T.PlaneGeometry(0.5, 0.06), M(sv, at(0, 0.36, 0.396)), '--efw-ember'));
      var heart = kit.flat(new T.CircleGeometry(0.07, 10), M(sv, at(-0.05, 0.5, 0.397)), '--efw-heart');
      fire.push(heart); flames.push(heart);
      kit.cyl(0.1, 0.1, H - 1.08, M(sv, at(0, 1.08 + (H - 1.08) / 2, -0.15)), '--efw-iron', 0.02, 10);
      kit.cyl(0.13, 0.13, 0.04, M(sv, at(0, 1.6, -0.15)), '--efw-iron-2', false, 10);
      // The coffee pot on the hot plate, its lid, knob, spout and handle, and
      // the coffee's steam, which the one switch puts out with the fire.
      kit.cyl(0.11, 0.13, 0.24, M(sv, at(0.25, 1.2, 0.05)), '--efw-cup', 0.015, 12);
      kit.cyl(0.09, 0.11, 0.04, M(sv, at(0.25, 1.34, 0.05)), '--efw-cup', 0.01, 12);
      kit.piece(new T.SphereGeometry(0.025, 6, 4), M(sv, at(0.25, 1.38, 0.05)), '--efw-iron-2', false);
      kit.cyl(0.03, 0.022, 0.16, M(sv, at(0.38, 1.24, 0.05, 0, 0, -0.9)), '--efw-cup', false, 5);
      kit.piece(new T.TorusGeometry(0.07, 0.014, 5, 10, Math.PI), M(sv, at(0.12, 1.2, 0.05, 0, 0, Math.PI / 2)), '--efw-cup', false);
      for (b = 0; b < 2; b++) {
        var cpts = [];
        for (q = 0; q < 5; q++) cpts.push(new T.Vector3(Math.sin(q * 1.2 + b * 2) * 0.03, q * 0.07, Math.cos(q + b) * 0.02));
        wisps.push(kit.facets(new T.TubeGeometry(new T.CatmullRomCurve3(cpts), 10, 0.007, 4, false), M(sv, at(0.4 + b * 0.04, 1.3, 0.05)), '--efw-moon'));
      }
      box(1.2, 0.05, 0.26, M(sv, at(0, 1.75, -0.1)), '--efw-wood', 0.015);
      [-0.5, 0.5].forEach(function (x) { box(0.04, 0.14, 0.2, M(sv, at(x, 1.66, -0.12)), '--efw-wood', false); });
      for (b = 0; b < 5; b++) {
        kit.cyl(0.05, 0.045, 0.1, M(sv, at(-0.44 + b * 0.22, 1.83, -0.1)), '--efw-cup', 0.01, 10);
        kit.piece(new T.TorusGeometry(0.03, 0.008, 4, 8, Math.PI), M(sv, at(-0.39 + b * 0.22, 1.83, -0.1, 0, 0, -Math.PI / 2)), '--efw-cup', false);
      }
      // More cups, hanging from hooks under the shelf by their handles.
      for (b = 0; b < 4; b++) {
        var hx = -0.42 + b * 0.28;
        kit.cyl(0.012, 0.012, 0.09, M(sv, at(hx, 1.68, -0.02)), '--efw-iron-2', false, 5);
        kit.cyl(0.05, 0.045, 0.1, M(sv, at(hx + 0.05, 1.56, -0.02, 0, 0, 0.25)), '--efw-cup', 0.01, 10);
      }
      // The basket of split logs, on the floor nearer the door.
      var bk = M(sv, at(-0.95, 0, 0.1));
      kit.cyl(0.32, 0.28, 0.34, M(bk, at(0, 0.17, 0)), '--efw-wood', 0.015, 14);
      for (b = 0; b < 8; b++) box(0.02, 0.34, 0.02, M(bk, at(Math.cos(b / 8 * Math.PI * 2) * 0.31, 0.17, Math.sin(b / 8 * Math.PI * 2) * 0.31)), '--efw-log-2', false, false);
      for (b = 0; b < 5; b++) {
        var lg = new T.CylinderGeometry(0.07, 0.07, 0.6, 3); lg.rotateZ(Math.PI / 2);
        kit.piece(lg, M(bk, at((hash(b, 6, 1) - 0.5) * 0.12, 0.3 + (b % 3) * 0.08, -0.16 + b * 0.08, (hash(b, 6, 2) - 0.5) * 0.4, b)), b % 2 ? '--efw-log' : '--efw-wood', 0.012);
      }

      // THE RUG, its rings and its fringe, and the one wolf asleep on it by
      // the stove, tail over nose.
      kit.cyl(1.7, 1.7, 0.02, at(-1.6, 0.01, -4.6), '--efw-rug', false, 32);
      [[1.45, '--efw-velvet-2'], [1.1, '--efw-iron-2'], [0.55, '--efw-velvet-2']].forEach(function (rg) {
        var ring = new T.TorusGeometry(rg[0], 0.035, 3, 40); ring.rotateX(Math.PI / 2); ring.scale(1, 0.25, 1);
        kit.piece(ring, at(-1.6, 0.022, -4.6), rg[1], false, false);
      });
      for (b = 0; b < 48; b++) {
        var fa = b / 48 * Math.PI * 2;
        box(0.12, 0.008, 0.018, at(-1.6 + Math.cos(fa) * 1.76, 0.005, -4.6 + Math.sin(fa) * 1.76, -fa), '--efw-rug', false, false);
      }
      wolf(-3.3, 0.02, -5.3, 2.6, 1.05, true);

      // THE LOUNGE, facing the big screen on the right wall: a high-back sofa
      // under the window, a sofa and two high-back armchairs, the low table with
      // the crisps, the sweets and the cups, cushions on everything in the
      // strips' colour, a throw over the window sofa, and bean bags.
      function seat(m, len, back) {
        box(len, 0.42, 0.85, M(m, at(0, 0.21, 0)), '--efw-velvet-2');
        box(len, back, 0.22, M(m, at(0, 0.42 + back / 2 - 0.05, -0.33)), '--efw-velvet');
        [-1, 1].forEach(function (e) { box(0.18, 0.62, 0.85, M(m, at(e * (len / 2 - 0.09), 0.31, 0)), '--efw-velvet'); });
        // The seat's own cushion seams, and its feet.
        var n = Math.max(1, Math.round((len - 0.36) / 0.75));
        for (var s = 1; s < n; s++) box(0.015, 0.02, 0.8, M(m, at(-len / 2 + 0.18 + s * (len - 0.36) / n, 0.425, 0.02)), '--efw-velvet', false, false);
        [-1, 1].forEach(function (e) { [-1, 1].forEach(function (f) { kit.cyl(0.035, 0.025, 0.06, M(m, at(e * (len / 2 - 0.1), -0.0, f * 0.34)), '--efw-wood', false, 6); }); });
      }
      function cushions(m, len, n) {
        for (var c = 0; c < n; c++) {
          var cu = new T.BoxGeometry(0.42, 0.38, 0.14, 2, 2, 1);
          var p = cu.attributes.position;
          for (var v = 0; v < p.count; v++) {
            // Plumped: the middle of each face pushed out, the corners in.
            var px = p.getX(v), py = p.getY(v), pz = p.getZ(v);
            if (Math.abs(px) < 0.01 && Math.abs(py) < 0.01) p.setZ(v, pz * 1.6);
            else if (Math.abs(px) > 0.2 && Math.abs(py) > 0.18) p.setZ(v, pz * 0.4);
          }
          cu.computeVertexNormals();
          cushionsOf.push(kit.facets(cu, M(m, at(-len / 2 + 0.4 + c * (len - 0.8) / Math.max(n - 1, 1), 0.68, -0.18, 0, -0.2, (c % 2 ? 0.12 : -0.1))), '--efw-led-1'));
        }
      }
      var sofaW = at(1.0, 0, BACK + 0.85);
      seat(sofaW, 2.6, 0.95); cushions(sofaW, 2.6, 3);
      // The throw over the window sofa's arm, a knitted thing with its rows.
      var thr = M(sofaW, at(-1.21, 0, 0.05));
      box(0.2, 0.05, 0.6, M(thr, at(0, 0.64, 0)), '--efw-cushion', 0.01);
      box(0.04, 0.5, 0.6, M(thr, at(0.11, 0.42, 0)), '--efw-cushion', 0.01);
      box(0.04, 0.5, 0.6, M(thr, at(-0.11, 0.42, 0)), '--efw-cushion', 0.01);
      for (b = 0; b < 4; b++) box(0.045, 0.02, 0.61, M(thr, at(0.115, 0.25 + b * 0.1, 0)), '--efw-velvet-2', false, false);
      var sofaL = at(0.4, 0, -3.8, RIGHT);
      seat(sofaL, 2.2, 0.75); cushions(sofaL, 2.2, 2);
      [[1.4, -1.9, RIGHT - 0.5], [1.4, -6.0, RIGHT + 0.5]].forEach(function (p) {
        var ch = at(p[0], 0, p[1], p[2]);
        seat(ch, 1.0, 1.1); cushions(ch, 1.0, 1);
      });
      var tbl = at(2.6, 0, -3.9);
      box(1.3, 0.06, 0.8, M(tbl, at(0, 0.42, 0)), '--efw-wood', 0.02);
      for (b = 0; b < 4; b++) box(1.3, 0.004, 0.006, M(tbl, at(0, 0.452, -0.3 + b * 0.2)), '--efw-log', false, false);
      box(1.15, 0.03, 0.65, M(tbl, at(0, 0.12, 0)), '--efw-wood', false);
      [[-0.55, -0.32], [0.55, -0.32], [-0.55, 0.32], [0.55, 0.32]].forEach(function (l) { box(0.06, 0.4, 0.06, M(tbl, at(l[0], 0.2, l[1])), '--efw-wood', false); });
      [[-0.35, 0], [0.05, 0.12], [0.4, -0.08]].forEach(function (p) {
        kit.cyl(0.16, 0.09, 0.11, M(tbl, at(p[0], 0.505, p[1])), '--efw-cup', 0.01, 16);
      });
      // Crisps in one bowl, sweets in the next, and the rainbow ones in the third.
      for (b = 0; b < 16; b++) {
        var cr = new T.CircleGeometry(0.032 + hash(b, 4, 3) * 0.012, 6); cr.scale(1, 0.75, 1);
        var ca = hash(b, 4, 1) * Math.PI * 2, cd = Math.sqrt(hash(b, 4, 2)) * 0.11;
        kit.piece(cr, M(tbl, at(-0.35 + Math.cos(ca) * cd, 0.572 + (0.11 - cd) * 0.25 + hash(b, 4, 4) * 0.01, Math.sin(ca) * cd, b * 1.7, -1.1 - hash(b, 4, 5) * 0.9, hash(b, 4, 6) - 0.5)), '--efw-cushion', false);
      }
      var CUSH = ['--efw-led-1', '--efw-led-2', '--efw-led-3', '--efw-led-4'];
      var RB = ['--efw-rb-red', '--efw-rb-orange', '--efw-rb-yellow', '--efw-rb-green', '--efw-rb-violet'];
      for (b = 0; b < 14; b++) {
        var sw = new T.SphereGeometry(0.025, 6, 4); sw.scale(1, 0.6, 1);
        kit.piece(sw, M(tbl, at((b < 6 ? 0.05 : 0.4) + (hash(b, 5, 1) - 0.5) * 0.18, 0.578, (b < 6 ? 0.12 : -0.08) + (hash(b, 5, 2) - 0.5) * 0.16)), b < 6 ? CUSH[b % 4] : RB[b % RB.length], false);
      }
      // The cups on the low table, with their handles, and the coffee in them,
      // which is there once somebody pours it.
      var coffee = [];
      [[-0.5, 0.25], [-0.15, -0.27], [0.5, 0.26]].forEach(function (p, i) {
        kit.cyl(0.05, 0.045, 0.1, M(tbl, at(p[0], 0.5, p[1])), '--efw-cup', 0.01, 10);
        kit.piece(new T.TorusGeometry(0.03, 0.008, 4, 8, Math.PI), M(tbl, at(p[0] + 0.05, 0.5, p[1], i * 1.3, 0, -Math.PI / 2)), '--efw-cup', false);
        var cf = kit.flat(new T.CircleGeometry(0.043, 12), M(tbl, at(p[0], 0.553, p[1], 0, -Math.PI / 2)), '--efw-log-2');
        kit.hide(cf, true);
        coffee.push(cf);
      });
      // Bean bags on the floor, each in its own bright colour.
      [[-1.2, -2.6, '--efw-led-2'], [-0.6, BACK + 1.3, '--efw-led-3'], [3.1, -2.4, '--efw-led-4'], [3.2, -5.4, '--efw-cushion']].forEach(function (p, i) {
        var bb = new T.SphereGeometry(0.42, 12, 9); bb.scale(1, 0.6, 1);
        var bp = bb.attributes.position;
        for (var v = 0; v < bp.count; v++) if (bp.getY(v) > 0.15) bp.setY(v, bp.getY(v) - 0.06 * (1 - Math.abs(bp.getX(v)) / 0.42));
        bb.computeVertexNormals();
        kit.piece(bb, at(p[0], 0.24, p[1], i), p[2], 0.02);
      });

      // THE DIFFUSER on its side table by the stove, its lamp in the strips'
      // colour and its wisps, and the shelf of oils beside it on the wall.
      var df = at(L + 0.55, 0, -7.15);
      box(0.5, 0.6, 0.5, M(df, at(0, 0.3, 0)), '--efw-wood', 0.02);
      box(0.44, 0.02, 0.44, M(df, at(0, 0.32, 0)), '--efw-log-2', false, false);
      kit.cyl(0.1, 0.13, 0.22, M(df, at(0, 0.71, 0)), '--efw-cup', 0.015, 12);
      kit.cyl(0.04, 0.06, 0.04, M(df, at(0, 0.84, 0)), '--efw-cup', false, 10);
      var dlamp = new T.TorusGeometry(0.125, 0.012, 4, 20); dlamp.rotateX(Math.PI / 2);
      strips.push(kit.flat(dlamp, M(df, at(0, 0.64, 0)), '--efw-led-1'));
      for (b = 0; b < 3; b++) {
        var pts = [];
        for (q = 0; q < 6; q++) pts.push(new T.Vector3(Math.sin(q * 1.3 + b) * 0.05, q * 0.09, Math.cos(q + b) * 0.04));
        wisps.push(kit.facets(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 12, 0.008, 4, false), M(df, at(0, 0.86, 0)), '--efw-moon'));
      }
      var oils = at(L + 0.26, 1.25, -7.15, LEFT);
      box(0.8, 0.04, 0.16, M(oils, at(0, 0, 0)), '--efw-wood', 0.01);
      box(0.8, 0.04, 0.16, M(oils, at(0, 0.24, 0)), '--efw-wood', 0.01);
      [-0.38, 0.38].forEach(function (x) { box(0.03, 0.28, 0.16, M(oils, at(x, 0.12, 0)), '--efw-wood', false); });
      for (b = 0; b < 7; b++) {
        var ox = -0.3 + b * 0.1, oy = b < 4 ? 0.02 : 0.26, oh = 0.1 + hash(b, 7, 1) * 0.03;
        if (b >= 4) ox = -0.25 + (b - 4) * 0.12;
        kit.cyl(0.028, 0.028, oh, M(oils, at(ox, oy + oh / 2, 0)), '--efw-cushion', 0.008, 8);
        kit.cyl(0.012, 0.016, 0.04, M(oils, at(ox, oy + oh + 0.02, 0)), '--efw-cup', false, 6);
      }

      // THE CABIN'S OWN PAGE on the left wall, between the panel and the stove.
      var pw = 2.0, ph = pw * 800 / 1180, pgm = at(L + 0.24, 0, -3.2, LEFT);
      box(pw + 0.16, ph + 0.16, 0.05, M(pgm, at(0, 1.5, 0)), '--efw-iron', 0.015);
      var pageFrame = kit.screen(1180, 800, pw, M(pgm, at(0, 1.5, 0.04)), 'The cabin’s own page, on the wall by the door');

      // THE BIG SCREEN on the right wall, off the page, a speaker standing
      // either side with its lamp in the strips' colour, the strip under it,
      // and a low console under that; the songs on it, one press each, on the
      // wall nearer the door.
      var sw0 = 2.4, sy0 = 1.0;
      [-1, 1].forEach(function (e) {
        var sp = at(R - 0.4, 0, -4.0 + e * (sw0 / 2 + 0.45), RIGHT);
        box(0.42, 1.25, 0.36, M(sp, at(0, 0.63, 0)), '--efw-iron');
        [0.4, 0.85].forEach(function (y) {
          kit.cyl(0.13, 0.13, 0.02, M(sp, at(0, y, 0.19, 0, Math.PI / 2)), '--efw-iron-2', false, 18);
          kit.cyl(0.05, 0.05, 0.022, M(sp, at(0, y, 0.192, 0, Math.PI / 2)), '--efw-iron', false, 12);
        });
        kit.cyl(0.05, 0.05, 0.02, M(sp, at(0, 1.1, 0.19, 0, Math.PI / 2)), '--efw-iron-2', false, 12);
        strips.push(kit.flat(new T.CircleGeometry(0.018, 8), M(sp, at(0, 0.18, 0.185)), '--efw-led-1'));
      });
      box(0.45, 0.42, sw0 - 0.1, at(R - 0.4, 0.21, -4.0), '--efw-wood', 0.015);
      box(0.02, 0.36, 0.005, at(R - 0.62, 0.21, -4.0), '--efw-log-2', false, false);
      strips.push(kit.flat(new T.BoxGeometry(0.04, 0.04, sw0 + 0.2), at(R - 0.2, sy0 - 0.12, -4.0), '--efw-led-1'));
      var screen = kit.lift(pageFrame, '.efw-plate', { w: 900, ww: sw0, m: at(R - 0.22, sy0, -4.0, RIGHT) });
      var songs = kit.lift(pageFrame, '.efw-rack', { w: 900, ww: 1.6, m: at(R - 0.22, 0.35, -1.25, RIGHT) });

      // THE SMART PANEL by the door: the cabin's own control drawing, the one
      // switch and the words that say what moved. The page's own script has
      // already built its buttons in the copy these are lifted from; those are
      // dead here, so they are left out and built afresh by the wire below.
      var panel = kit.lift(pageFrame, '.efw-scene', { w: 900, ww: 1.3, m: at(L + 0.24, 1.36, -1.15, LEFT), cls: 'cel-efw-panel' });
      var row = kit.lift(pageFrame, '.efw-controls', { w: 900, ww: 1.3, m: at(L + 0.24, 1.2, -1.15, LEFT), drop: 'button' });
      kit.lift(pageFrame, '.efw-says', { w: 900, ww: 1.3, m: at(L + 0.24, 1.0, -1.15, LEFT) });
      // The one switch and the strips' colour are the panel drawing's: off is
      // .is-off on it, and the colour is --efw-led on it, which the cabin's
      // script sets when somebody picks one. The room follows the drawing, so
      // the strips, their light, the lamps, the fire and the wisps do what the
      // panel says, and the cushions wear the colour whether it is on or off,
      // as on the page.
      var dark = kit.col('--efw-iron-2');
      kit.follow(panel, '.efw-scene__draw', function (read) {
        var off = /\bis-off\b/.test(read()), c = read('--efw-led');
        strips.forEach(function (m) { m.material.color.copy(off ? dark : c); });
        cushionsOf.forEach(function (m) { m.material.color.copy(c); });
        glows.forEach(function (g) { g.color.copy(c); g.intensity = off ? 0 : 3; });
        fire.concat(wisps).forEach(function (m) { kit.hide(m, off); });
      });

      // BY THE WINDOW: the way to David's photographs, the howl, and the
      // recording of real wolves.
      var go = kit.lift(pageFrame, '.efw-window-go', { w: 420, ww: 0.8, m: at(-3.6, WIN.y0 + 0.02, BACK + 0.34) });
      kit.lift(pageFrame, '.efw-gallery', { w: 1100, ww: 2.2, m: at(-3.4, 1.6, BACK + 0.6) });
      var howl = kit.lift(pageFrame, '.efw-howl', { w: 420, ww: 0.8, m: at(-2.7, WIN.y0 + 0.1, BACK + 0.34), drop: 'button' });
      kit.lift(pageFrame, '.efw-record', { w: 420, ww: 0.8, m: at(-1.8, WIN.y0 + 0.02, BACK + 0.34) });
      kit.wire(pageFrame, 'rack.js');
      kit.wire(pageFrame, 'mountain-man.js');

      // TO PRESS. The fire, which sways only once somebody asks it to.
      var flicker = kit.flames(flames, { say: 'Let the fire flicker', at: [kit.touch(1.0, 0.9, 0.5, M(sv, at(0, 0.62, 0.3)))],
        said: function (on) {
          if (on && kit.hidden(flames[0])) return 'The fire will flicker once the cabin’s switch is on again; it is out for now.';
          return on ? 'The fire behind the stove’s glass sways, each flame in its own time. It lights nothing; the strips do that.' : 'The fire burns still behind the glass.';
        } });
      // Pressed at the stove itself, it is that same switch, pressed.

      // The coffee, poured from the pot into the cups on the low table.
      var pour = kit.press({ say: function () { return kit.hidden(coffee[0]) ? 'Pour the coffee' : 'Drink up'; },
        at: [kit.touch(1.3, 0.5, 0.8, M(tbl, at(0, 0.6, 0)))],
        press: function () {
          var empty = kit.hidden(coffee[0]);
          coffee.forEach(function (c) { kit.hide(c, !empty); });
          return empty ? 'Coffee from the pot on the stove, in the cups on the low table.' : 'The cups on the low table are empty again, and the pot is still on the stove.';
        } });
      // The cable car, sent down the wire towards the field and called back up.
      var cable = kit.press({ say: function () { return kit.hidden(carDown[0]) ? 'Send the cable car down' : 'Call the cable car up'; },
        at: [kit.touch(3.2, 3.8, 2.4, at(5.1, 1.6, BACK - 3.5)), kit.touch(3, 3.4, 3, at(carDownAt.x, carDownAt.y - 2.0, carDownAt.z))],
        press: function () {
          var goDown = kit.hidden(carDown[0]);
          carDown.forEach(function (m) { kit.hide(m, !goDown); });
          carUp.forEach(function (m) { kit.hide(m, goDown); });
          return goDown ? 'The cable car leaves its station by the spring and goes down the wire towards the field, and waits there.' : 'The cable car comes back up the wire to its station at the top.';
        } });

      return {
        start: { x: -3.0, z: -0.9, yaw: 0 },
        bounds: { x: [L + 0.9, R - 0.9], z: [BACK + 1.0, -0.6] },
        stops: [
          { name: 'just inside the door, with the whole back wall a window', x: -3.0, z: -0.9, yaw: 0 },
          { name: 'at the cabin’s panel by the door, with the one switch', x: L + 1.55, z: -1.15, yaw: LEFT, frame: row.el },
          { name: 'at the wall by the door, with the cabin’s own page on it', x: L + 2.4, z: -3.2, yaw: LEFT, page: kit.page, frame: pageFrame },
          { name: 'by the stove, with the wolf asleep on the rug', x: -1.8, z: -4.7, yaw: 1.2, pitch: -0.08, acts: [flicker] },
          { name: 'at the low table, with the crisps, the sweets and the cups', x: 2.5, z: -2.2, yaw: 0.05, pitch: -0.42, acts: [pour] },
          { name: 'at the big screen, with David’s playlist on it', x: R - 3.0, z: -4.0, yaw: RIGHT, frame: screen.el },
          { name: 'at the songs on the big screen, one press each', x: R - 2.4, z: -1.3, yaw: RIGHT, frame: songs.el },
          { name: 'at the window, the lake under the full moon and the pack outside', x: -3.0, z: BACK + 1.9, yaw: 0, frame: go.el, acts: [cable] },
          { name: 'at the window, where the pack can be heard howling', x: -2.4, z: BACK + 1.9, yaw: 0.15, frame: howl.el, acts: [cable] }
        ]
      };
    }
  };
})();

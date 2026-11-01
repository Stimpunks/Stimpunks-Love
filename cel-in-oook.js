/* =============================================================================
   Oook, walked into on Cel Street, at the far end of L-Space's string, round
   the corner that is not there. Ryan's ask, 2026-11-01: the rooms behind the
   doors.

   IT IS NOT A LIBRARY AND IT IS NOT INDOORS (§57). The obvious build of a
   Discworld room reached through L-space is the Library of Unseen University,
   which is the Mopery with an ape in it, so this is the world the Librarian
   looks after the books of instead: a disc on the backs of four elephants, who
   stand on the shell of a turtle swimming through the dark, with the mountain
   at its Hub and the sea running off its Rim. You come out of the gap in the
   dark with the string still in your hand, and the Disc hangs out ahead of
   you, a long way off, a little below and tilted so you see its face.

   IN HIS COLOURS. The dark is the rust of his coat, --ook-coat; the stars are
   banana; the Disc, its elephants and its turtle are --ook-ginger, --ook-dim
   and --ook-shell with --ook-cream for the land and the falling sea; and the
   only light is the Disc's own small sun, --ook-sun, off to the upper left,
   so everything here has one lit side and one in its shadow. There is no
   flame anywhere: if the rust ever dulls to brown or a candle appears, this
   has joined the brown rooms. NOTHING IS STRAIGHT that does not have to be:
   the string wanders, the Disc is round, the elephants and the turtle are
   made of round things, and the only flat edges are the page's own words.

   THE STRING comes out of the gap you came in by, cream, and goes loose on
   ahead of you until it ends tied round a banana: the banana L-Space says is
   past the gap and not drawn there. THE LIBRARIAN IS NOT DRAWN, here or
   anywhere; he is up in the shelves somewhere and would rather you did not
   stare. NOTHING MOVES: the Disc does not turn and the sun does not go round.
   Every colour is one §57 declares, by name. It keeps nothing, sends nothing
   and fetches nothing; its page arrives through Cel Street's screen().
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['oook.html'] = {
    name: 'Oook',
    from: 'l-space.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at;
      var ONE = new T.Matrix4();

      // THE DARK IS HIS COAT, AND THE DISC'S SMALL SUN IS THE ONE LIGHT.
      kit.scene.background = kit.col('--ook-coat');
      kit.scene.add(new T.AmbientLight(kit.col('--ook-cream'), 1.1));
      var SUN = new T.Vector3(-20, 13, -40);
      var light = new T.DirectionalLight(kit.col('--ook-sun'), 2.4);
      light.position.copy(SUN); light.target.position.set(0, 2, -27);
      kit.scene.add(light, light.target);

      function ball(r, sx, sy, sz, m, ink, outline) {
        var g = new T.SphereGeometry(r, 18, 12); g.scale(sx, sy, sz);
        kit.piece(g, m, ink, outline === undefined ? 0.03 : outline, false);
      }
      function tube(pts, r, ink, outline) {
        kit.piece(new T.TubeGeometry(new T.CatmullRomCurve3(pts), Math.max(24, pts.length * 6), r, 8, false), ONE, ink, outline === undefined ? false : outline, false);
      }
      function cone(r0, r1, h, m, ink, outline) {
        kit.piece(new T.CylinderGeometry(r0, r1, h, 28), m, ink, outline === undefined ? 0.03 : outline, false);
      }

      function hash(n) { var h = Math.sin(n * 12.9898) * 43758.5453; return h - Math.floor(h); }
      // THE STARS, banana, scattered on a shell a long way off. Worked out,
      // never drawn at random, so it is the same sky every time.
      for (var i = 0; i < 260; i++) {
        var a = hash(i * 1.7 + 0.3) * 2 * Math.PI, u = hash(i * 3.1 + 7.7) * 1.5 - 0.5;
        var s = Math.sqrt(1 - u * u), R = 70 + (i * 37) % 30;
        var x = R * s * Math.cos(a), y = R * u * 0.8 + 6, z = R * s * Math.sin(a) - 20;
        if (Math.abs(x) < 3 && z > -16 && z < 4) continue;
        kit.piece(new T.SphereGeometry(0.12 + 0.07 * ((i * 7) % 3), 6, 4), at(x, y, z), '--ook-banana', false, false);
      }
      // The Disc's small sun, off to the upper left.
      kit.flat(new T.SphereGeometry(1.1, 28, 18), at(SUN.x * 0.55, SUN.y * 0.55 + 2, SUN.z * 0.85), '--ook-sun');

      // THE DISC'S FRAME: a long way out ahead, a little above the eye and
      // tipped towards you, so you see its face and everything under it.
      var D = at(0, 4.6, -27, 0, 0.24);
      function on(x, y, z, ry, rx, rz) { return at(x, y, z, ry, rx, rz, D); }

      // THE DISC: its rim, the sea round its edge, the land, the Hub.
      var RIM = 8;
      cone(RIM, RIM, 0.6, on(0, 0.3, 0), '--ook-ginger', 0.05);
      kit.piece(new T.CylinderGeometry(RIM - 0.15, RIM - 0.15, 0.04, 72), on(0, 0.62, 0), '--ook-dim', false, false);
      kit.piece(new T.CylinderGeometry(6.3, 6.3, 0.04, 72), on(0, 0.64, 0), '--ook-cream', false, false);
      [[-3.2, -1.4, 2.1, 1.0, 0.5], [3.0, 1.2, 1.9, 0.8, -0.4], [0.6, 3.6, 1.4, 0.7, 1.1], [-1.4, -4.1, 1.6, 0.6, 0.2]].forEach(function (c) {
        var g = new T.CylinderGeometry(1, 1, 0.04, 30); g.scale(c[2], 1, c[3]);
        kit.piece(g, on(c[0], 0.66, c[1], c[4]), '--ook-ginger', false, false);
      });
      cone(0.08, 1.15, 2.2, on(0, 0.64 + 1.1, 0), '--ook-cream');
      cone(0.02, 0.3, 0.7, on(0, 0.64 + 1.85, 0), '--ook-sun', false);
      // THE SEA running off the Rim, in threads all the way round.
      for (var k = 0; k < 72; k++) {
        var t = k / 72 * 2 * Math.PI, len = 1.4 + 0.5 * ((k * 5) % 4) / 3;
        kit.piece(new T.CylinderGeometry(0.035, 0.015, len, 5), on((RIM + 0.02) * Math.cos(t), -len / 2 + 0.1, (RIM + 0.02) * Math.sin(t)), '--ook-cream', false, false);
      }

      // THE FOUR ELEPHANTS, round things all of them, standing outward on the
      // turtle's shell with the Disc on their backs. Two in one colour, two in
      // another, as the page's drawing has them.
      function elephant(ang, ink) {
        var E = at(3.4 * Math.cos(ang), 0, 3.4 * Math.sin(ang), -ang, 0, 0, D);
        function e(x, y, z, ry, rx, rz) { return at(x, y, z, ry, rx, rz, E); }
        ball(1, 1.35, 0.9, 0.95, e(0, -1.0, 0), ink);
        ball(0.62, 1, 1, 1, e(1.3, -0.8, 0), ink);
        [-1, 1].forEach(function (sd) {
          ball(0.5, 0.25, 1.05, 1, e(1.05, -0.7, sd * 0.55, sd * 0.3), ink);
          kit.piece(new T.CylinderGeometry(0.04, 0.09, 0.55, 8), e(1.75, -1.15, sd * 0.25, 0, 0, 1.0), '--ook-cream', 0.02, false);
          ball(0.07, 1, 1, 1, e(1.72, -0.62, sd * 0.3), '--ook-coat', false);
        });
        [[0.75, 0.5], [0.75, -0.5], [-0.7, 0.5], [-0.7, -0.5]].forEach(function (l) {
          cone(0.24, 0.22, 1.5, e(l[0], -2.2, l[1]), ink);
        });
        var trunk = [[1.82, -0.85, 0], [2.08, -1.3, 0], [2.1, -1.85, 0.05], [1.92, -2.25, 0.1]].map(function (p) {
          return new T.Vector3(p[0], p[1], p[2]).applyMatrix4(E);
        });
        tube(trunk, 0.15, ink, 0.03);
        tube([[-1.3, -0.9, 0], [-1.55, -1.3, 0.05], [-1.5, -1.7, 0.1]].map(function (p) {
          return new T.Vector3(p[0], p[1], p[2]).applyMatrix4(E);
        }), 0.05, ink, 0.02);
      }
      elephant(Math.PI * 0.25, '--ook-dim');
      elephant(Math.PI * 0.75, '--ook-ginger');
      elephant(Math.PI * 1.25, '--ook-dim');
      elephant(Math.PI * 1.75, '--ook-ginger');

      // THE TURTLE, swimming through the dark with the world on its back:
      // a low round shell with its plates, a head, four flippers and a tail.
      var SH = 5.4, FL = 0.42, top = -2.95;
      ball(SH, 1.15, FL, 1, on(0, top - SH * FL, 0), '--ook-ginger', 0.06);
      ball(1.1, 1, 0.22, 1, on(0, top + 0.02, 0), '--ook-shell', false);
      for (var p = 0; p < 7; p++) {
        var th = p / 7 * 2 * Math.PI, ph = 0.62;
        var px = 1.15 * SH * Math.sin(ph) * Math.cos(th), pz = SH * Math.sin(ph) * Math.sin(th);
        var py = top - SH * FL + FL * SH * Math.cos(ph);
        ball(0.95, 1, 0.22, 1, on(px, py, pz, -th), '--ook-shell', false);
      }
      ball(1.3, 1.4, 1, 1, on(7.3, top - SH * FL - 0.1, 0), '--ook-ginger', 0.05);
      cone(0.9, 1.1, 1.6, on(6.2, top - SH * FL - 0.2, 0, 0, 0, Math.PI / 2), '--ook-ginger');
      [-1, 1].forEach(function (sd) {
        ball(0.16, 1, 1, 1, on(8.0, top - SH * FL + 0.25, sd * 0.6), '--ook-coat', false);
        ball(1.8, 1.4, 0.18, 0.55, on(4.0, top - SH * FL - 0.8, sd * 4.4, sd * 0.6), '--ook-ginger', 0.04);
        ball(1.4, 1.3, 0.18, 0.5, on(-4.4, top - SH * FL - 0.8, sd * 3.9, -sd * 0.7), '--ook-ginger', 0.04);
      });
      cone(0.02, 0.5, 1.3, on(-6.6, top - SH * FL - 0.2, 0, 0, 0, Math.PI / 2), '--ook-ginger');

      // THE GAP YOU CAME IN BY, behind you: a round hole in the dark, rimmed.
      var GAP_Z = 1.6;
      kit.flat(new T.CircleGeometry(1.15, 40), at(-0.7, 1.35, GAP_Z + 0.02, Math.PI), '--ook-coat');
      kit.piece(new T.TorusGeometry(1.2, 0.07, 8, 48), at(-0.7, 1.35, GAP_Z, Math.PI), '--ook-shell', 0.02, false);

      // THE STRING, out of the gap and loose on ahead, to the banana.
      var END = { x: 0.3, y: 1.05, z: -11.9 };
      tube([new T.Vector3(-0.7, 1.1, GAP_Z - 0.05), new T.Vector3(-0.3, 0.95, 0.4), new T.Vector3(0.4, 1.05, -1.8),
        new T.Vector3(-0.35, 0.9, -4.0), new T.Vector3(0.45, 1.1, -6.3), new T.Vector3(-0.3, 0.95, -8.4),
        new T.Vector3(0.35, 1.05, -10.4), new T.Vector3(END.x - 0.2, END.y, END.z + 0.25)], 0.012, '--ook-cream');
      // The banana it is tied round, and the knot.
      var curve = [];
      for (var b = 0; b <= 8; b++) {
        var bt = b / 8 - 0.5;
        curve.push(new T.Vector3(END.x + bt * 0.55, END.y + 0.05 - 0.18 * (1 - 4 * bt * bt), END.z));
      }
      tube(curve, 0.06, '--ook-banana', 0.015);
      kit.piece(new T.CylinderGeometry(0.02, 0.025, 0.1, 6), at(END.x + 0.3, END.y + 0.08, END.z, 0, 0, -0.9), '--ook-shell', false, false);
      kit.piece(new T.TorusGeometry(0.075, 0.016, 6, 16), at(END.x - 0.2, END.y - 0.02, END.z + 0.05, Math.PI / 2), '--ook-cream', false, false);

      // THE ROOM'S OWN PAGE, standing beside the gap you came in by, facing
      // on out into the dark.
      var pw = 2.2, ph = pw * 800 / 1180;
      var frame = kit.screen(1180, 800, pw, at(1.35, 0.45 + ph / 2, GAP_Z - 0.1, Math.PI), 'Oook’s own page, standing beside the gap you came in by');

      // THE PAGE'S WORDS, lifted off it, standing out in the dark on either
      // side of the string and each turned towards it.
      var R = -0.5, L = 0.5, SIDE = 2.2, BACK = 1.9;
      function plate(sel, n, w, ww, side, z, h) {
        var ry = side < 0 ? L : R;
        var it = kit.lift(frame, sel, { n: n, w: w, ww: ww, h: h, m: at(side * SIDE, 0.35, z, ry) });
        it.stand = { x: side * SIDE + Math.sin(ry) * BACK, z: z + Math.cos(ry) * BACK, yaw: ry };
        return it;
      }
      var head = plate('.ook-head', 0, 760, 1.5, 1, -1.5);
      var lede = plate('.ook-lede', 0, 640, 1.3, -1, -3.1);
      var ape = plate('.ook-quote', 0, 560, 1.15, 1, -4.6);
      var part = [];
      [[-1, -6.1], [1, -7.6, 760], [-1, -9.1], [1, -10.6, 820]].forEach(function (q, i) {
        part.push(plate('.ook-part', i, 640, 1.3, q[0], q[1], q[2]));
      });

      function at2(name, it, pitch) {
        return { name: name, x: it.stand.x, z: it.stand.z, yaw: it.stand.yaw, pitch: pitch, frame: it.el };
      }
      var stops = [
        { name: 'just out of the gap, the string going on ahead of you and the Disc hanging out in the dark beyond it', x: 0, z: 0.2, yaw: 0, pitch: 0.1 },
        at2('at the name, Oook., the Librarian of Unseen University', head, -0.08),
        at2('at why this room is here, a thank-you note to Terry Pratchett', lede, -0.14),
        at2('at Pratchett’s line about the ape', ape, -0.16),
        at2('at why we find him relatable', part[0], -0.14),
        at2('at the rules of L-space', part[1], -0.06),
        at2('at the Disc, the world he looks after the books of', part[2], -0.12),
        at2('at what is not in here, the Librarian least of all', part[3], -0.04),
        { name: 'at the end of the string, tied round a banana, looking out at the Disc on its four elephants and its turtle', x: 0, z: -11.2, yaw: 0, pitch: 0.12 },
        { name: 'back at the gap you came in by, with the room’s own page beside it', x: 0.6, z: -0.7, yaw: Math.PI, pitch: -0.02, page: kit.page, frame: frame }
      ];

      return {
        start: { x: 0, z: 0.2, yaw: 0 },
        bounds: { x: [-2.0, 2.0], z: [-11.6, 0.9] },
        stops: stops
      };
    }
  };
})();

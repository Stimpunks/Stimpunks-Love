/* =============================================================================
   The Latibulum, walked into on Cel Street. Ryan's ask, 2026-10-31: back on
   the street, working down it a room at a time.

   IT IS THE BURROW'S WORLD AND NOBODY ELSE'S (§16): dug into a hill, a round
   green door, thick walls, arches of planed wood round lit plaster, one low
   lamp at knee height, and no sky in it anywhere. You come in at the round
   door and go down a passage through arch after arch, coats on pegs along one
   wall, to the hollow at the end: the room's own page on the plaster wall in a
   frame of beam, the low lamp on its table beside a deep armchair, a braided
   rug, and the wireless and the television either side of the page. Its words
   sit dark on lit plaster here as in the room, which is what keeps this off
   the Faery Yurt, cream on dark all the way down: the earth is what is left
   over round them.

   THE WIRELESS, THE TELEVISION AND THE SHELF ARE THE ROOM'S OWN, lifted off its
   page by the kit. The sets are the page's own markup, so they say how long
   they run before the press, and nothing reaches YouTube until somebody
   presses one. The shelf is the page's own plaster panel of things to do with
   a bodymind, and nothing on it is a button: no ticks, nothing that notices.

   NOTHING MOVES: the lamp does not breathe here, which on the page is MAX's
   only motion and is the page's to keep. Every colour is one the room
   declares, by name. It keeps nothing, sends nothing and fetches nothing; its
   page arrives through Cel Street's screen(). tools/make-cel-street.py holds
   each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['latibulum.html'] = {
    name: 'The Latibulum',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var PW = 2.6, PH = 2.5;                  // the passage
      var HZ = -8, HW = 7.2, HD = 5.2, HH = 2.9; // the hollow, from HZ back
      var back = HZ - HD;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;

      // A wall across the burrow with a hole in it, thick as a hill's wall:
      // w wide, h high, the hole drawn by hole(path), t thick, standing at m.
      function holed(w, h, t, hole, m, ink, edge) {
        var s = new T.Shape();
        s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h); s.lineTo(-w / 2, h); s.closePath();
        var p = new T.Path(); hole(p); s.holes.push(p);
        var g = new T.ExtrudeGeometry(s, { depth: t, bevelEnabled: false, curveSegments: 28 });
        g.translate(0, 0, -t / 2);
        kit.piece(g, m, ink, edge === undefined ? 0.02 : edge);
      }
      function archHole(ow, oh) {
        var r = ow / 2, spring = oh - r;
        return function (p) {
          p.moveTo(-r, 0); p.lineTo(-r, spring); p.absarc(0, spring, r, Math.PI, 0, true); p.lineTo(r, 0); p.closePath();
        };
      }

      // NO SKY: the dark of the hill beyond, and one low lamp. A little warmth
      // from the plaster everywhere, so the far arches are not lost; there is
      // no second light.
      kit.scene.background = kit.col('--recess');
      kit.scene.add(new T.HemisphereLight(kit.col('--plaster-2'), kit.col('--loam'), 1.0));
      var LX = 3.0, LZ = -10.4;
      var lampLight = new T.PointLight(kit.col('--lamp'), 7, 16, 1.1);
      lampLight.position.set(LX, 0.78, LZ);
      kit.scene.add(lampLight);

      // THE FLOOR: boards the long way, a rust runner down the passage.
      box(HW + 0.4, 0.1, -back + 1.6, at(0, -0.05, back / 2 + 0.5), '--umber', false, false);
      for (var bx = -HW / 2 + 0.25; bx < HW / 2; bx += 0.25) box(0.012, 0.004, -back + 1.4, at(bx, 0.002, back / 2 + 0.5), '--umber-2', false, false);
      box(0.9, 0.006, -HZ - 0.4, at(0, 0.006, HZ / 2), '--rust', false, false);

      // THE ROUND DOOR you came in by, in the hill's earth, standing open: the
      // green door swung back against the passage wall, its brass knob.
      holed(PW + 0.6, PH, 0.5, function (p) { p.absarc(0, 1.05, 0.98, 0, Math.PI * 2, false); }, at(0, 0, 0.3), '--loam');
      kit.piece(new T.TorusGeometry(0.98, 0.07, 10, 40), at(0, 1.05, 0.05), '--beam', 0.015);
      kit.cyl(0.92, 0.92, 0.07, at(-PW / 2 + 0.06, 1.05, -1.0, 0, 0, Math.PI / 2), '--door', 0.015, 32);
      kit.cyl(0.06, 0.06, 0.06, at(-PW / 2 + 0.12, 1.05, -1.0, 0, 0, Math.PI / 2), '--brass', false, 12);
      // Outside it, only the earth of the hill: there is no sky to see.
      box(PW + 4, PH + 2, 0.2, at(0, (PH + 2) / 2, 2.6), '--recess', false, false);

      // THE PASSAGE: plaster above a beam rail, umber below it, an earth
      // ceiling with beams across, and coats on pegs along the left wall.
      [-1, 1].forEach(function (s) {
        var x = s * (PW / 2 + 0.15), len = -HZ + 0.3, mid = HZ / 2;
        box(0.3, PH - 0.95, len, at(x, 0.95 + (PH - 0.95) / 2, mid), '--plaster-2', false);
        box(0.3, 0.95, len, at(x, 0.475, mid), '--umber-2', false);
        box(0.06, 0.07, len, at(x - s * 0.17, 0.95, mid), '--beam', false);
      });
      box(PW + 0.6, 0.3, -HZ + 0.3, at(0, PH + 0.15, HZ / 2), '--burrow', false, false);
      var lx = -PW / 2 + 0.03;
      box(0.05, 0.06, 5.4, at(lx, 1.85, -3.6), '--beam', false);
      // A peg in each bay between the arches, a coat on most of them.
      [-2.4, -3.0, -4.2, -4.9, -6.1, -6.9].forEach(function (pz, k) {
        kit.cyl(0.025, 0.025, 0.1, at(lx + 0.05, 1.85, pz, 0, 0, Math.PI / 2), '--brass', false, 8);
        if (k !== 3) {
          var coat = new T.CylinderGeometry(0.07, 0.24, 0.9, 10, 1, true);
          kit.piece(coat, at(lx + 0.14, 1.36, pz), k % 2 ? '--door' : '--rust', 0.012);
        }
      });

      // ARCH AFTER ARCH: a lit plaster panel the width of the passage with an
      // arched opening in it, framed in planed beam.
      var OW = 1.7, OH = 2.15;
      [-1.8, -3.6, -5.4].forEach(function (z) {
        holed(PW, PH, 0.32, archHole(OW, OH), at(0, 0, z), '--plaster');
        var g = new T.TorusGeometry(OW / 2, 0.06, 8, 24, Math.PI);
        kit.piece(g, at(0, OH - OW / 2, z + 0.17), '--beam', 0.012);
        [-1, 1].forEach(function (s) { box(0.12, OH - OW / 2, 0.12, at(s * OW / 2, (OH - OW / 2) / 2, z + 0.17), '--beam', 0.012); });
      });

      // THE HOLLOW, through the last arch: wider, a little higher, plaster
      // walls on a rail, beams across the earth ceiling.
      holed(HW, HH, 0.4, archHole(OW + 0.2, OH + 0.1), at(0, 0, HZ), '--plaster-2');
      kit.piece(new T.TorusGeometry((OW + 0.2) / 2, 0.07, 8, 24, Math.PI), at(0, OH + 0.1 - (OW + 0.2) / 2, HZ + 0.21), '--beam', 0.012);
      [-1, 1].forEach(function (s) {
        box(0.14, OH + 0.1 - (OW + 0.2) / 2, 0.14, at(s * (OW + 0.2) / 2, (OH + 0.1 - (OW + 0.2) / 2) / 2, HZ + 0.21), '--beam', 0.012);
        var x = s * (HW / 2 + 0.15);
        box(0.3, HH - 0.95, HD, at(x, 0.95 + (HH - 0.95) / 2, HZ - HD / 2), '--plaster', false);
        box(0.3, 0.95, HD, at(x, 0.475, HZ - HD / 2), '--umber-2', false);
        box(0.06, 0.07, HD, at(x - s * 0.17, 0.95, HZ - HD / 2), '--beam', false);
      });
      box(HW + 0.6, HH - 0.95, 0.3, at(0, 0.95 + (HH - 0.95) / 2, back - 0.15), '--plaster', false);
      box(HW + 0.6, 0.95, 0.3, at(0, 0.475, back - 0.15), '--umber-2', false);
      box(HW + 0.6, 0.3, HD + 0.4, at(0, HH + 0.15, HZ - HD / 2), '--burrow', false, false);
      [-9.4, -11.0, -12.4].forEach(function (z) { box(HW, 0.18, 0.2, at(0, HH - 0.09, z), '--beam', 0.015); });

      // A BRAIDED RUG, rings of the room's rust, oat and door green.
      [['--rust', 1.9], ['--oat-2', 1.6], ['--door', 1.3], ['--rust', 0.95], ['--oat-2', 0.55]].forEach(function (r, i) {
        kit.cyl(r[1], r[1], 0.012, at(0, 0.006 + i * 0.002, back + 2.4), r[0], false, 40);
      });

      // THE ROOM'S OWN PAGE on the back wall, in a frame of beam.
      var pw = 2.6, ph = pw * 800 / 1180, py = 0.95 + ph / 2;
      box(pw + 0.24, ph + 0.24, 0.08, at(0, py, back + 0.04), '--beam');
      var frame = kit.screen(1180, 800, pw, at(0, py, back + 0.1), 'The Latibulum’s own page, on the plaster wall of the hollow');

      // THE LOW LAMP on its table at knee height, its pool on the boards, and
      // a deep armchair beside it in the room's oat.
      box(0.6, 0.05, 0.5, at(LX, 0.45, LZ), '--beam', 0.012);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { box(0.04, 0.43, 0.04, at(LX + c[0] * 0.25, 0.215, LZ + c[1] * 0.2), '--beam', false); });
      kit.cyl(0.02, 0.02, 0.24, at(LX, 0.6, LZ), '--brass', false, 8);
      kit.cyl(0.09, 0.15, 0.17, at(LX, 0.79, LZ), '--lamp', 0.01, 18);
      var pool = kit.flat(new T.CircleGeometry(1.1, 36), at(LX, 0.012, LZ + 0.2, 0, -Math.PI / 2), '--lamp');
      pool.material.transparent = true; pool.material.opacity = 0.16;
      var ch = at(2.3, 0, -9.2, -2.3);
      box(0.9, 0.42, 0.8, M(ch, at(0, 0.32, 0)), '--oat-2', 0.02);
      box(0.9, 0.7, 0.2, M(ch, at(0, 0.75, -0.32)), '--oat-2', 0.02);
      [-1, 1].forEach(function (s) { box(0.18, 0.55, 0.8, M(ch, at(s * 0.45, 0.42, 0)), '--plaster-2', 0.02); });
      box(0.66, 0.1, 0.62, M(ch, at(0, 0.58, 0.04)), '--oat', 0.015);

      // THE WIRELESS AND THE TELEVISION, off the page, each on a low cabinet
      // either side of it, to walk up to and switch on.
      var SX = 2.9;
      [-1, 1].forEach(function (s) { box(1.2, 0.5, 0.55, at(s * SX, 0.25, back + 0.5), '--beam', 0.015); });
      var wireless = kit.lift(frame, '.thing.wireless', { bare: true, w: 560, ww: 1.1, m: at(-SX, 0.5, back + 0.55) });
      var telly = kit.lift(frame, '.thing.telly', { bare: true, w: 560, ww: 1.1, m: at(SX, 0.5, back + 0.55) });

      // THE SHELF on the hollow's left wall: the page's own plaster panel of
      // things to do with a bodymind, with a shelf of beam under it. Nothing
      // on it is a button.
      box(0.24, 0.05, 1.9, at(-HW / 2 + 0.12, 0.62, -10.2), '--beam', 0.012);
      // It is round the corner from the passage, so it shows only from the hollow.
      var shelf = kit.lift(frame, '.wall', { n: 3, w: 760, h: 900, ww: 1.75, m: at(-HW / 2 + 0.03, 0.66, -10.2, LEFT), zone: [-HW / 2, HW / 2, back, HZ - 0.2] });

      return {
        start: { x: 0, z: -0.6, yaw: 0 },
        // The passage is narrow and the walls are thick; the hollow opens out
        // past the last arch, so you can walk up to the things in it.
        bounds: { x: [-1.0, 1.0], z: [back + 2.2, -0.3],
                  areas: [{ x: [-1.0, 1.0], z: [HZ - 0.6, -0.3] }, { x: [-HW / 2 + 0.9, HW / 2 - 0.9], z: [back + 1.2, HZ - 0.2] }] },
        stops: [
          { name: 'just inside the round door, under the hill', x: 0, z: -0.6, yaw: 0 },
          { name: 'along the passage, under the arches, with the coats on their pegs', x: 0, z: -4.4, yaw: 0 },
          { name: 'in the hollow, with the room’s own page on the plaster wall', x: 0, z: back + 3.4, yaw: 0, pitch: 0.08, page: kit.page, frame: frame },
          { name: 'at the wireless in the corner of the hollow', x: -1.0, z: back + 2.6, yaw: 0.62, pitch: -0.05, frame: wireless.el },
          { name: 'at the television, dragged down here from another decade', x: 1.0, z: back + 2.6, yaw: -0.62, pitch: -0.05, frame: telly.el },
          { name: 'by the low lamp and the armchair', x: 0.6, z: -11.0, yaw: -2.11, pitch: -0.22 },
          { name: 'at the shelf of things to do with a bodymind', x: -1.0, z: -10.2, yaw: LEFT, frame: shelf.el }
        ]
      };
    }
  };
})();

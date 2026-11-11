/* =============================================================================
   Cavendish Primary Classroom, walked into on Cel Street, and in a VR headset.
   Helen Edgar's brief, 2026-11-11: an example mainstream primary classroom for
   a class of thirty, for trainee teachers, set up the Cavendish Space way,
   and the same day, "we will need this in cel street too and as Virtual
   reality accessible". So the room says vr: true, and everything you can do
   in it is a switch the headset's panel shows: the lamps, the blinds, the fan,
   the cave's lights, sitting down, and seeing it from a child's height.

   IT IS THE CLASSROOM'S WORLD AND NOBODY ELSE'S (§152). A putty-walled room
   with a cork floor and birch furniture, garden doors glazed to the floor down
   the left side standing open onto a fenced garden, a felt pinboard with
   three calm sheets on it and a picture timetable on the back wall, the
   interactive panel on a stand that goes up and down, the room's own page on
   the wall beside it, a low library shelf, the campfire rug in the middle
   with floor cushions round it, round tables with chairs and wobble stools,
   standing desks, beanbags, a tray of loose parts by the doors, and in the
   far right corner the sensory cave, a plum cloth over a frame, dim inside.
   More places to be than children, and NOBODY IS DRAWN.

   THE LIGHT IS THE CLASS'S TO TURN DOWN. Daylight comes in level through the
   garden doors; the lamps overhead start off and go to low, middle or full on
   a press; the blinds come halfway or all the way down; the cave has its own
   string of small lights, warm and steady, that never twinkle. NOTHING MOVES,
   at any setting: the fan's air is drawn as still ribbons while it is on.
   Every colour is one §152 declares, by name. It keeps nothing, sends nothing
   and fetches nothing; its page arrives through Cel Street's screen().
   The look is 'real', as Helen's rooms are.
   ========================================================================== */
(function () {
  'use strict';
  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['cavendish-primary-classroom.html'] = {
    name: 'Cavendish Primary Classroom',
    faces: ['"Sniglet"', '"Andika"'],
    look: 'real',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2, BACKWARD = Math.PI;
      var XL = -6, XR = 6, FRONT = 3, BACK = -6, H = 3.0;

      // THE LIGHT: a soft sky from everywhere, the day coming level through
      // the garden doors on the left, and four lamps overhead on the dimmer.
      kit.scene.background = kit.col('--cpc-sky');
      kit.scene.add(new T.HemisphereLight(kit.col('--cpc-sky'), kit.col('--cpc-cork'), 1.1));
      var day = new T.DirectionalLight(kit.col('--cpc-sky'), 1.2);
      day.position.set(-30, 6, -2);
      kit.scene.add(day);
      var LAMPS = [[-2.4, -0.4], [2.0, -0.4], [-2.4, -3.8], [2.0, -3.8]];
      var lampLights = LAMPS.map(function (l) {
        var p = new T.PointLight(kit.col('--cpc-lamp'), 0, 9, 1.6);
        p.position.set(l[0], H - 0.15, l[1]);
        kit.scene.add(p);
        return p;
      });

      // THE ROOM: cork floor, putty walls, a pale ceiling with the lamps in
      // it, and the doorway in from the street behind you.
      box(XR - XL, 0.1, FRONT - BACK, at(0, -0.05, (FRONT + BACK) / 2), '--cpc-cork', false, false);
      for (var fz = FRONT; fz > BACK; fz -= 0.6) box(XR - XL, 0.006, 0.02, at(0, 0.003, fz), '--cpc-cork-2', false, false);
      box(XR - XL, 0.1, FRONT - BACK, at(0, H + 0.05, (FRONT + BACK) / 2), '--cpc-ceiling', false, false);
      box(XR - XL, H, 0.2, at(0, H / 2, BACK - 0.1), '--cpc-plaster', false, false);
      box(0.2, H, FRONT - BACK, at(XR + 0.1, H / 2, (FRONT + BACK) / 2), '--cpc-plaster', false, false);
      box(4.6, H, 0.2, at(XL + 2.3, H / 2, FRONT + 0.1), '--cpc-plaster', false, false);
      box(4.6, H, 0.2, at(XR - 2.3, H / 2, FRONT + 0.1), '--cpc-plaster', false, false);
      box(2.8, H - 2.2, 0.2, at(0, 2.2 + (H - 2.2) / 2, FRONT + 0.1), '--cpc-plaster', false, false);
      // The lamps, unlit and lit: the lit ones shown only while the dimmer is up.
      var lampsOff = [], lampsOn = [];
      LAMPS.forEach(function (l) {
        lampsOff.push(kit.flat(new T.PlaneGeometry(1.2, 0.6), at(l[0], H - 0.01, l[1], 0, Math.PI / 2, 0), '--cpc-ceiling'));
        var on = kit.flat(new T.PlaneGeometry(1.2, 0.6), at(l[0], H - 0.012, l[1], 0, Math.PI / 2, 0), '--cpc-lamp');
        kit.hide(on, true);
        lampsOn.push(on);
        box(1.26, 0.03, 0.66, at(l[0], H - 0.005, l[1]), '--cpc-steel', false, false);
      });

      // THE GARDEN DOORS down the left wall, glazed to the floor, standing open,
      // with the fenced garden outside: grass, a tree, a sail over an outdoor
      // space, a bench, and the fence.
      var DOORS = [[1.0, -1.6], [-2.6, -5.2]];
      [[FRONT, DOORS[0][0]], [DOORS[0][1], DOORS[1][0]], [DOORS[1][1], BACK]].forEach(function (seg) {
        if (seg[0] - seg[1] > 0.05) box(0.2, H, seg[0] - seg[1], at(XL - 0.1, H / 2, (seg[0] + seg[1]) / 2), '--cpc-plaster', false, false);
      });
      var blinds = { half: [], down: [] };
      DOORS.forEach(function (d) {
        var w = d[0] - d[1], mid = (d[0] + d[1]) / 2;
        box(0.24, H - 2.6, w, at(XL - 0.1, 2.6 + (H - 2.6) / 2, mid), '--cpc-plaster', false, false);
        box(0.16, 0.08, w, at(XL - 0.1, 2.56, mid), '--cpc-birch-2', false);
        box(0.16, 2.6, 0.08, at(XL - 0.1, 1.3, d[0]), '--cpc-birch', 0.006);
        box(0.16, 2.6, 0.08, at(XL - 0.1, 1.3, d[1]), '--cpc-birch', 0.006);
        // The two leaves, open outward into the garden.
        [[d[0], -1], [d[1], 1]].forEach(function (h) {
          var leaf = at(XL - 0.1 - 0.62, 1.28, h[0] + h[1] * 0.08, h[1] * 1.2);
          box(0.05, 2.5, w / 2 - 0.1, leaf, '--cpc-birch', 0.006);
        });
        var hb = kit.flat(new T.PlaneGeometry(w - 0.1, 1.25), at(XL + 0.02, 2.55 - 0.625, mid, LEFT), '--cpc-felt');
        var dn = kit.flat(new T.PlaneGeometry(w - 0.1, 2.45), at(XL + 0.03, 2.55 - 1.225, mid, LEFT), '--cpc-felt');
        kit.hide(hb, true); kit.hide(dn, true);
        blinds.half.push(hb); blinds.down.push(dn);
      });
      // The garden.
      box(14, 0.08, FRONT - BACK + 6, at(XL - 7, -0.04, (FRONT + BACK) / 2), '--cpc-grass', false, false);
      box(4.2, 0.03, 1.2, at(XL - 2.2, 0.01, -0.3), '--cpc-plaster', false, false);
      for (var fx = BACK - 2; fx < FRONT + 3; fx += 0.4) box(0.06, 1.0, 0.06, at(XL - 9, 0.5, fx), '--cpc-birch-2', false);
      box(0.06, 0.06, FRONT - BACK + 5, at(XL - 9, 0.9, (FRONT + BACK) / 2), '--cpc-birch-2', false);
      cyl(0.16, 0.2, 2.4, at(XL - 6.4, 1.2, -4.2), '--cpc-birch-2', 0.01, 10);
      [[0, 3.0, 0, 1.3], [-0.6, 2.6, 0.4, 0.9], [0.6, 2.7, -0.3, 0.95]].forEach(function (c) {
        var g = new T.IcosahedronGeometry(c[3], 1);
        kit.piece(g, at(XL - 6.4 + c[0], c[1], -4.2 + c[2]), '--cpc-leaf', 0.01);
      });
      // The sail over the outdoor space, on four posts, with a bench under it.
      [[-3, 1.6], [-3, -2.2], [-6.2, 1.6], [-6.2, -2.2]].forEach(function (pp) { cyl(0.05, 0.05, 2.6, at(XL + pp[0], 1.3, pp[1]), '--cpc-birch-2', false, 6); });
      box(3.4, 0.03, 4.0, at(XL - 4.6, 2.55, -0.3, 0, 0, 0.08), '--cpc-clay', 0.008);
      box(1.8, 0.06, 0.45, at(XL - 4.6, 0.45, -0.3), '--cpc-birch', 0.006);
      [-0.8, 0.8].forEach(function (o) { box(0.06, 0.42, 0.4, at(XL - 4.6 + o, 0.21, -0.3), '--cpc-birch-2', false); });

      // THE BACK WALL: the felt pinboard with three calm sheets, the picture
      // timetable, the interactive panel on its stand, the control plate at a
      // child's height, and the rail of headphones by the cave.
      box(2.4, 1.3, 0.04, at(-3.4, 1.85, BACK + 0.02), '--cpc-felt', 0.006);
      [[-4.1, 1.95, 0.6, 0.78], [-3.3, 2.05, 0.6, 0.5], [-2.55, 1.85, 0.55, 0.95]].forEach(function (s) { box(s[2], s[3], 0.012, at(s[0], s[1], BACK + 0.05), '--cpc-ceiling', false, false); });
      box(2.6, 0.26, 0.03, at(0.1, 2.62, BACK + 0.02), '--cpc-ceiling', 0.006);
      ['--cpc-clay', '--cpc-ochre', '--cpc-felt', '--cpc-leaf', '--cpc-plum', '--cpc-teal'].forEach(function (ink, i) {
        var sx = -0.95 + i * 0.42;
        if (i % 3 === 0) cyl(0.07, 0.07, 0.02, at(sx, 2.62, BACK + 0.05, 0, Math.PI / 2, 0), ink, false, 14);
        else if (i % 3 === 1) box(0.13, 0.13, 0.02, at(sx, 2.62, BACK + 0.05), ink, false);
        else cyl(0.0, 0.09, 0.02, at(sx, 2.6, BACK + 0.05, 0, Math.PI / 2, 0), ink, false, 3);
      });
      // The panel on its stand, which winds down to the rug's height.
      box(1.9, 1.1, 0.08, at(0.1, 1.6, BACK + 0.35), '--cpc-screen', 0.008);
      box(1.72, 0.94, 0.01, at(0.1, 1.62, BACK + 0.4), '--cpc-teal', false, false);
      box(1.3, 0.07, 0.012, at(0.1, 1.2, BACK + 0.405), '--cpc-steel', false, false);
      [-0.35, 0.55].forEach(function (o) { box(0.08, 1.05, 0.08, at(0.1 + o, 0.55, BACK + 0.35), '--cpc-steel', false); });
      box(1.3, 0.06, 0.5, at(0.1, 0.03, BACK + 0.35), '--cpc-steel', false);
      // The control plate: a dimmer and the thermostat, a metre off the floor.
      box(0.24, 0.36, 0.03, at(2.0, 1.0, BACK + 0.02), '--cpc-ceiling', 0.006);
      cyl(0.06, 0.06, 0.03, at(2.0, 1.08, BACK + 0.05, 0, Math.PI / 2, 0), '--cpc-teal', false, 14);
      box(0.15, 0.08, 0.01, at(2.0, 0.92, BACK + 0.04), '--cpc-felt', false, false);
      // The rail of headphones and ear defenders, any child's to take.
      box(1.0, 0.05, 0.08, at(3.0, 1.3, BACK + 0.04), '--cpc-birch-2', false);
      ['--cpc-screen', '--cpc-plum', '--cpc-screen', '--cpc-teal'].forEach(function (ink, i) {
        var hx = 2.65 + i * 0.24;
        var arc = new T.TorusGeometry(0.09, 0.016, 6, 14, Math.PI);
        kit.piece(arc, at(hx, 1.18, BACK + 0.1), ink, false);
        [-1, 1].forEach(function (s) { box(0.05, 0.08, 0.05, at(hx + s * 0.09, 1.14, BACK + 0.1), ink, false); });
      });

      // THE LIBRARY: a low shelf of books under the pinboard, a box of
      // instructions on top that everybody adds to, and blocks under it.
      box(2.6, 0.9, 0.36, at(-3.4, 0.45, BACK + 0.2), '--cpc-birch', 0.008);
      box(2.5, 0.03, 0.34, at(-3.4, 0.45, BACK + 0.22), '--cpc-birch-2', false);
      var SPINES = ['--cpc-clay', '--cpc-felt', '--cpc-leaf', '--cpc-ochre', '--cpc-plum', '--cpc-teal'];
      for (var bk = 0; bk < 26; bk++) {
        var bh = 0.2 + (bk * 37 % 11) / 100;
        box(0.06, bh, 0.22, at(-4.6 + bk * 0.075, 0.48 + bh / 2, BACK + 0.24), SPINES[bk % SPINES.length], false);
      }
      box(0.5, 0.2, 0.3, at(-2.5, 1.0, BACK + 0.22), '--cpc-clay', 0.006);
      box(0.24, 0.012, 0.04, at(-2.5, 1.106, BACK + 0.22), '--cpc-birch-2', false, false);
      [['--cpc-ochre', -4.4], ['--cpc-felt', -4.05], ['--cpc-leaf', -3.75], ['--cpc-clay', -3.4]].forEach(function (b) { box(0.24, 0.2, 0.24, at(b[1], 0.1, BACK + 0.7), b[0], 0.006); });
      kit.plaque({ title: 'The library', lines: ['The low shelf of books, the picture timetable and the box of instructions everybody adds to: what we have worked out, kept where anybody can reach it.'],
        face: '"Andika"', ink: '--cpc-ink', ground: '--cpc-card', edge: '--cpc-clay', w: 1.3, m: at(-1.55, 1.75, BACK + 0.03) });

      // THE CAMPFIRE: the rug in the middle of the floor, with floor cushions
      // round it.
      cyl(1.9, 1.9, 0.02, at(-0.2, 0.012, -2.0), '--cpc-ochre', false, 40);
      cyl(1.6, 1.6, 0.022, at(-0.2, 0.013, -2.0), '--cpc-birch', false, 40);
      cyl(1.55, 1.55, 0.024, at(-0.2, 0.014, -2.0), '--cpc-ochre', false, 40);
      var CUSH = ['--cpc-clay', '--cpc-felt', '--cpc-leaf', '--cpc-plum'];
      var cushions = [];
      for (var c = 0; c < 8; c++) {
        var a = c / 8 * Math.PI * 2, cxx = -0.2 + Math.cos(a) * 1.3, czz = -2.0 + Math.sin(a) * 1.3;
        var cg = new T.SphereGeometry(0.28, 18, 10); cg.scale(1, 0.32, 1);
        cushions.push({ x: cxx, z: czz, a: a, m: kit.facets(cg, at(cxx, 0.09, czz), CUSH[c % CUSH.length]) });
      }

      // THE WATERING HOLE: round tables with chairs and wobble stools, at
      // more than one height, the way a class works alongside each other.
      function chair(x, z, yaw, seatH) {
        var g = at(x, 0, z, yaw), M = function (m) { return new T.Matrix4().multiplyMatrices(g, m); };
        box(0.36, 0.03, 0.36, M(at(0, seatH, 0)), '--cpc-birch', 0.006);
        box(0.36, 0.3, 0.03, M(at(0, seatH + 0.2, 0.17)), '--cpc-birch', 0.006);
        [[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]].forEach(function (l) { box(0.025, seatH, 0.025, M(at(l[0], seatH / 2, l[1])), '--cpc-steel', false); });
      }
      function wobble(x, z, ink) {
        cyl(0.17, 0.17, 0.05, at(x, 0.44, z), ink, 0.006, 18);
        cyl(0.1, 0.16, 0.4, at(x, 0.22, z), '--cpc-teal', false, 18);
        var dome = new T.SphereGeometry(0.16, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
        kit.piece(dome, at(x, 0.16, z), '--cpc-teal', false);
      }
      var TABLES = [[-3.6, 0.8, 0.58], [1.6, 0.6, 0.58], [-3.8, -2.6, 0.46], [3.0, -1.8, 0.58]];
      TABLES.forEach(function (t, ti) {
        cyl(0.62, 0.62, 0.04, at(t[0], t[2], t[1]), '--cpc-birch', 0.008, 24);
        cyl(0.04, 0.04, t[2], at(t[0], t[2] / 2, t[1]), '--cpc-birch-2', false, 8);
        cyl(0.3, 0.3, 0.02, at(t[0], 0.01, t[1]), '--cpc-birch-2', false, 14);
        for (var s = 0; s < 4; s++) {
          var a2 = s / 4 * Math.PI * 2 + 0.4, sx2 = t[0] + Math.cos(a2) * 0.92, sz2 = t[1] + Math.sin(a2) * 0.92;
          if ((s + ti) % 2) wobble(sx2, sz2, CUSH[(s + ti) % CUSH.length]);
          else chair(sx2, sz2, -a2 - Math.PI / 2, t[2] - 0.22);
        }
      });

      // THE SECOND CAVE: a den under the round table nearest the shelf, a
      // clay cloth hung over the table to the floor with a way in at the
      // front, and a cushion inside. And a task lamp on that table, and on
      // each standing desk, for a child who needs more light than the room.
      var DEN = TABLES[2];
      var denCloth = new T.CylinderGeometry(0.66, 0.7, DEN[2], 28, 1, true, 0.5, Math.PI * 2 - 1.0);
      kit.piece(denCloth, at(DEN[0], DEN[2] / 2, DEN[1], -Math.PI / 2), '--cpc-clay', 0.008);
      var denSeatGeo = new T.SphereGeometry(0.26, 16, 10); denSeatGeo.scale(1, 0.3, 1);
      var denSeat = kit.facets(denSeatGeo, at(DEN[0], 0.08, DEN[1]), '--cpc-plum');
      function taskLamp(x, y, z) {
        cyl(0.08, 0.09, 0.02, at(x, y + 0.01, z), '--cpc-steel', false, 12);
        box(0.02, 0.36, 0.02, at(x, y + 0.18, z, 0, 0, 0.25), '--cpc-steel', false);
        cyl(0.03, 0.08, 0.1, at(x - 0.08, y + 0.36, z, 0, 0, 0.6), '--cpc-lamp', false, 12);
      }
      taskLamp(DEN[0] + 0.3, DEN[2] + 0.02, DEN[1] - 0.2);
      taskLamp(TABLES[0][0] + 0.3, TABLES[0][2] + 0.02, TABLES[0][1] - 0.2);

      // STANDING DESKS, on legs that wind up and down, each with a footrest
      // bar to push against, room for two at each.
      [[3.0, 1.6], [0.1, 2.0]].forEach(function (d) {
        box(1.3, 0.04, 0.62, at(d[0], 1.0, d[1]), '--cpc-birch', 0.008);
        [-0.55, 0.55].forEach(function (o) {
          box(0.07, 0.98, 0.07, at(d[0] + o, 0.49, d[1]), '--cpc-steel', false);
          box(0.06, 0.04, 0.6, at(d[0] + o, 0.02, d[1]), '--cpc-steel', false);
        });
        cyl(0.025, 0.025, 1.1, at(d[0], 0.22, d[1] + 0.18, 0, 0, Math.PI / 2), '--cpc-screen', false, 8);
        taskLamp(d[0] + 0.45, 1.02, d[1] - 0.15);
      });

      // THE MOVEMENT CORNER, for children who need more: a crash mat on the
      // floor, a balance board on it, and a rocking chair beside it.
      var MX = 4.9, MZ = 2.2;
      box(1.8, 0.16, 1.3, at(MX, 0.08, MZ), '--cpc-felt', 0.01);
      box(1.82, 0.01, 0.03, at(MX, 0.162, MZ), '--cpc-glass', false, false);
      var board = new T.CylinderGeometry(0.5, 0.5, 0.5, 20, 1, false, Math.PI - 0.5, 1.0);
      kit.piece(board, at(MX - 0.2, 0.62, MZ, 0, Math.PI / 2, 0), '--cpc-birch-2', false);
      box(0.9, 0.04, 0.4, at(MX - 0.2, 0.3, MZ), '--cpc-birch', 0.006);
      var rocker = new T.TorusGeometry(0.45, 0.025, 6, 20, 1.2);
      [-0.2, 0.2].forEach(function (o) { kit.piece(rocker.clone(), at(MX - 0.2, 0.47, MZ - 1.3 + o, 0, 0, Math.PI * 1.5 - 0.6), '--cpc-birch-2', false); });
      box(0.44, 0.04, 0.42, at(MX - 0.2, 0.4, MZ - 1.3), '--cpc-birch', 0.006);
      box(0.04, 0.5, 0.42, at(MX - 0.02, 0.65, MZ - 1.3, 0, 0, -0.15), '--cpc-birch', 0.006);

      // THE TENT IN THE GARDEN, a cave outside, under the tree.
      var tent = new T.ConeGeometry(0.85, 1.3, 4, 1, true);
      kit.piece(tent, at(XL - 5.2, 0.65, -3.2, Math.PI / 4), '--cpc-plum', 0.01);
      box(0.4, 0.7, 0.02, at(XL - 5.2 + 0.0, 0.35, -3.2 + 0.6), '--cpc-cave', false, false);

      // BEANBAGS, and the tray of loose parts by the garden doors.
      var bagMeshes = [[4.0, -0.2, '--cpc-felt'], [-1.9, 1.6, '--cpc-clay'], [2.2, -4.6, '--cpc-leaf']].map(function (b) {
        var g = new T.SphereGeometry(0.45, 20, 12); g.scale(1, 0.6, 1);
        return { x: b[0], z: b[1], m: kit.facets(g, at(b[0], 0.26, b[1]), b[2]) };
      });
      box(1.3, 0.12, 0.85, at(XL + 1.2, 0.06, 1.9), '--cpc-screen', 0.006);
      box(1.18, 0.02, 0.73, at(XL + 1.2, 0.121, 1.9), '--cpc-teal', false, false);
      [['--cpc-ochre', -0.4, -0.2], ['--cpc-clay', -0.1, 0.15], ['--cpc-felt', 0.25, -0.1], ['--cpc-leaf', 0.4, 0.2], ['--cpc-birch', 0.05, -0.25]].forEach(function (p, i) {
        if (i % 2) box(0.1, 0.06, 0.1, at(XL + 1.2 + p[1], 0.16, 1.9 + p[2]), p[0], false);
        else kit.piece(new T.SphereGeometry(0.05, 10, 8), at(XL + 1.2 + p[1], 0.17, 1.9 + p[2]), p[0], false);
      });

      // THE FAN, over the end of the room away from the cave, and its air,
      // drawn as still ribbons while it is on.
      cyl(0.02, 0.02, 0.4, at(-0.2, H - 0.2, 0.9), '--cpc-steel', false, 6);
      cyl(0.08, 0.08, 0.08, at(-0.2, H - 0.42, 0.9), '--cpc-steel', false, 12);
      [0, 1, 2].forEach(function (k) { box(0.9, 0.012, 0.14, at(-0.2, H - 0.44, 0.9, k * Math.PI * 2 / 3, 0, 0), '--cpc-birch-2', false); });
      var air = [];
      for (var ar = 0; ar < 6; ar++) {
        var ag = new T.TorusGeometry(0.55 + ar * 0.06, 0.006, 4, 32, Math.PI * 0.7);
        var am = kit.flat(ag, at(-0.2, H - 0.7 - ar * 0.18, 0.9, ar * 0.9, Math.PI / 2, 0), '--cpc-felt');
        kit.hide(am, true);
        air.push(am);
      }

      // THE SENSORY CAVE, in the far right corner: a frame with a plum cloth
      // over it, an opening facing the room, dim inside, with cushions, a
      // beanbag, a blanket and a string of small lights switched from inside.
      var CX = 4.3, CZ = -4.4, CW = 2.6, CD = 2.4, CH = 1.7;
      box(CW, 0.04, CD, at(CX, CH, CZ), '--cpc-plum', 0.01);
      box(0.04, CH, CD, at(CX + CW / 2, CH / 2, CZ), '--cpc-plum', 0.01);
      box(CW, CH, 0.04, at(CX, CH / 2, CZ - CD / 2), '--cpc-plum', 0.01);
      box(0.04, CH, CD, at(CX - CW / 2, CH / 2, CZ), '--cpc-plum', 0.01);
      box(CW * 0.28, CH, 0.04, at(CX - CW / 2 + CW * 0.14, CH / 2, CZ + CD / 2), '--cpc-plum', 0.01);
      box(CW * 0.28, CH, 0.04, at(CX + CW / 2 - CW * 0.14, CH / 2, CZ + CD / 2), '--cpc-plum', 0.01);
      box(CW * 0.44, CH - 1.25, 0.04, at(CX, 1.25 + (CH - 1.25) / 2, CZ + CD / 2), '--cpc-plum', 0.01);
      box(CW - 0.1, 0.02, CD - 0.1, at(CX, 0.012, CZ), '--cpc-cave', false, false);
      var caveCush = new T.SphereGeometry(0.34, 18, 10); caveCush.scale(1.1, 0.35, 1);
      var caveSeat = kit.facets(caveCush, at(CX - 0.5, 0.1, CZ - 0.5), '--cpc-clay');
      var caveBag = new T.SphereGeometry(0.42, 20, 12); caveBag.scale(1, 0.6, 1);
      kit.facets(caveBag, at(CX + 0.6, 0.24, CZ - 0.4), '--cpc-felt');
      box(0.9, 0.04, 0.6, at(CX - 0.1, 0.06, CZ + 0.4, 0, 0.3, 0), '--cpc-ochre', 0.006);
      var caveLight = new T.PointLight(kit.col('--cpc-lamp'), 0, 3.2, 1.8);
      caveLight.position.set(CX, CH - 0.25, CZ);
      kit.scene.add(caveLight);
      var STRING = [];
      for (var q = 0; q < 9; q++) {
        var u = q / 8;
        STRING.push([CX - CW / 2 + 0.25 + u * (CW - 0.5), CH - 0.12 - Math.sin(u * Math.PI) * 0.18, CZ - CD / 2 + 0.12]);
      }
      var lit = kit.bulbs(STRING, 0.035, ['--cpc-lamp']);
      var unlit = kit.bulbs(STRING.map(function (p) { return [p[0], p[1], p[2] + 0.001]; }), 0.034, ['--cpc-plum']);
      kit.hide(lit.mesh, true);
      kit.plaque({ title: 'The sensory cave', lines: ['Anybody can go in, at any time, and come out when they are ready. Nobody is sent there and nobody is fetched out.', 'A retreat, never a time-out.'],
        face: '"Andika"', ink: '--cpc-cave-ink', ground: '--cpc-cave', edge: '--cpc-plum', w: 1.2, m: at(CX - CW / 2 - 0.6, 1.5, BACK + 0.03) });

      // THE ROOM'S OWN PAGE, on the right-hand wall, in a birch frame.
      var pw = 2.6, ph = pw * 820 / 1180, py = 0.85 + ph / 2;
      box(0.05, ph + 0.14, pw + 0.14, at(XR - 0.03, py, 0.6), '--cpc-birch-2', false);
      var page = kit.screen(1180, 820, pw, at(XR - 0.07, py, 0.6, RIGHT), 'Cavendish Primary Classroom’s own page, on the wall of the room');
      kit.plaque({ title: 'Cavendish Primary Classroom', lines: ['An example classroom for a class of thirty, set up the Cavendish Space way: the room changes, never the child.', 'cavendish.space'],
        face: '"Andika"', ink: '--cpc-ink', ground: '--cpc-card', edge: '--cpc-teal', w: 2.2, m: at(XR - 0.04, 2.55, -2.4, RIGHT) });

      // THE SWITCHES, the class's own: lamps, blinds, fan, the cave's lights,
      // and seeing the room from a child's height.
      var LEVELS = [0, 0.7, 1.4, 2.4];
      var lamps = kit.choose({ label: 'Lamps', choices: ['Daylight only', 'Low', 'Middle', 'Full'], start: 0,
        pick: function (i) {
          lampLights.forEach(function (l) { l.intensity = LEVELS[i]; });
          lampsOn.forEach(function (m) { kit.hide(m, i === 0); });
          lampsOff.forEach(function (m) { kit.hide(m, i !== 0); });
          return ['The lamps are off: the room is lit by the daylight through the garden doors.',
                  'The lamps are on low, enough to read by at the tables; the cave end stays soft.',
                  'The lamps are halfway up, for close work on a dark afternoon.',
                  'The lamps are all the way up. Anybody can ask for them down again.'][i];
        } });
      var blind = kit.choose({ label: 'Blinds', choices: ['Up', 'Halfway', 'Down'], start: 0,
        pick: function (i) {
          blinds.half.forEach(function (m) { kit.hide(m, i !== 1); });
          blinds.down.forEach(function (m) { kit.hide(m, i !== 2); });
          return ['The blinds are up, and the garden is in full view.',
                  'The blinds are halfway down, against low sun in somebody’s eyes.',
                  'The blinds are down. The doors still open; the blinds only take the glare.'][i];
        } });
      var fanOn = false;
      var fan = kit.press({ say: function () { return fanOn ? 'Switch the fan off' : 'Switch the fan on'; },
        at: [kit.touch(1.0, 0.3, 1.0, at(-0.2, H - 0.4, 0.9))],
        press: function () {
          fanOn = !fanOn;
          air.forEach(function (m) { kit.hide(m, !fanOn); });
          return fanOn ? 'The ceiling fan is on, slow and quiet.' : 'The ceiling fan is off.';
        } });
      var caveOn = false;
      var caveLights = kit.press({ say: function () { return caveOn ? 'Switch the cave’s lights off' : 'Switch the cave’s lights on'; },
        at: [kit.touch(CW - 0.4, 0.3, 0.3, at(CX, CH - 0.15, CZ - CD / 2 + 0.15))],
        press: function () {
          caveOn = !caveOn;
          kit.hide(lit.mesh, !caveOn); kit.hide(unlit.mesh, caveOn);
          caveLight.intensity = caveOn ? 0.9 : 0;
          return caveOn ? 'The string of small lights in the cave is on, warm and steady. They never flash.' : 'The cave’s lights are off. The cave is dim.';
        } });
      var child = kit.stature({ small: 0.5, say: 'See it from a child’s height', back: 'Back to your own height',
        done: 'Your eyes are at the height of a child of seven now, about a metre off the floor: the tables and the shelf are at your eyes.',
        undone: 'You are back at your own height.' });
      var sitRug = kit.sit({ x: cushions[2].x, z: cushions[2].z, yaw: Math.PI / 2 - cushions[2].a + Math.PI, squash: cushions[2].m,
        say: 'Sit on a cushion on the rug', up: 'Get up off the cushion', sat: 'You sit on a floor cushion at the campfire rug.', stood: 'You get up off the cushion.',
        at: [kit.touch(0.6, 0.3, 0.6, at(cushions[2].x, 0.1, cushions[2].z))] });
      var sitBag = kit.sit({ x: bagMeshes[0].x, z: bagMeshes[0].z, yaw: LEFT, squash: bagMeshes[0].m,
        say: 'Sit on the beanbag by the tables', up: 'Get up off the beanbag', sat: 'You sink into the beanbag, low, with the tables beside you.', stood: 'You get up off the beanbag.',
        at: [kit.touch(1.0, 0.6, 1.0, at(bagMeshes[0].x, 0.26, bagMeshes[0].z))] });
      var sitCave = kit.sit({ x: CX - 0.5, z: CZ - 0.5, yaw: 0.6, squash: caveSeat,
        say: 'Sit in the cave', up: 'Come out of the cave', sat: 'You sit in the cave, in the dim, with the cloth all round you. Nobody will come and take you out.', stood: 'You come out of the cave when you are ready.',
        at: [kit.touch(0.8, 0.3, 0.8, at(CX - 0.5, 0.1, CZ - 0.5))] });

      var sitDen = kit.sit({ x: DEN[0], z: DEN[1], yaw: 0, squash: denSeat,
        say: 'Crawl into the den under the table', up: 'Come out of the den', sat: 'You are in the den under the table, the cloth all round you, a cave of your own.', stood: 'You come out of the den.',
        at: [kit.touch(0.8, 0.4, 0.8, at(DEN[0], 0.2, DEN[1]))] });
      var sitMat = kit.sit({ x: MX, z: MZ, yaw: LEFT,
        say: 'Flop on the crash mat', up: 'Get up off the crash mat', sat: 'You flop onto the crash mat, the balance board beside you.', stood: 'You get up off the crash mat.',
        at: [kit.touch(1.8, 0.3, 1.3, at(MX, 0.1, MZ))] });

      var stops = [
        { name: 'in from the street, the whole classroom in front of you', where: 'at the door in from the street', x: 0, z: 2.4, yaw: 0, pitch: -0.08, acts: [child, lamps, blind] },
        { name: 'at the garden doors, standing open', where: 'at the garden doors', x: XL + 1.2, z: -0.3, yaw: LEFT, pitch: 0, acts: [blind] },
        { name: 'outside in the garden, under the sail', where: 'in the garden, under the sail', x: XL - 3.8, z: -0.3, yaw: RIGHT, pitch: 0 },
        { name: 'at the tray of loose parts by the doors', where: 'at the tray of loose parts', x: XL + 2.2, z: 2.0, yaw: LEFT + 0.3, pitch: -0.55 },
        { name: 'at the campfire rug, the cushions round it', where: 'at the campfire rug', x: -0.2, z: -0.2, yaw: 0, pitch: -0.4, acts: [sitRug] },
        { name: 'at the tables and the wobble stools', where: 'at the tables', x: 0.2, z: 1.0, yaw: -0.6, pitch: -0.3, acts: [sitBag] },
        { name: 'at the standing desks', where: 'at a standing desk', x: 3.0, z: 2.5, yaw: 0, pitch: -0.3 },
        { name: 'at the movement corner, for children who need more', where: 'at the movement corner', x: MX - 1.6, z: MZ, yaw: RIGHT, pitch: -0.35, acts: [sitMat] },
        { name: 'at the den under the round table, the second cave', where: 'at the den', x: DEN[0] + 1.4, z: DEN[1] + 0.6, yaw: LEFT + 0.4, pitch: -0.3, acts: [sitDen] },
        { name: 'in the garden at the tent under the tree, a cave outside', where: 'at the tent in the garden', x: XL - 4.6, z: -1.8, yaw: Math.PI - 0.5, pitch: -0.2 },
        { name: 'at the library shelf and the pinboard', where: 'at the library', x: -3.2, z: BACK + 2.0, yaw: 0, pitch: 0 },
        { name: 'at the interactive panel and the timetable', where: 'at the panel', x: 0.1, z: BACK + 2.4, yaw: 0, pitch: 0.05, acts: [lamps] },
        { name: 'at the rail of headphones, by the cave', where: 'at the headphones', x: 2.9, z: BACK + 1.6, yaw: 0, pitch: -0.05 },
        { name: 'at the sensory cave', where: 'at the cave', x: CX, z: CZ + CD / 2 + 1.0, yaw: 0, pitch: -0.12, acts: [caveLights, sitCave] },
        { name: 'under the fan', where: 'under the fan', x: -0.2, z: 1.6, yaw: 0, pitch: 0.5, acts: [fan] },
        { name: 'at the wall, with the room’s own page', where: 'at the room’s own page', x: XR - 2.4, z: 0.6, yaw: RIGHT, pitch: 0.04, page: kit.page, frame: page },
        { name: 'back at the door to the street', where: 'at the door to the street', x: 0, z: 2.6, yaw: BACKWARD, pitch: 0 }
      ];

      return {
        start: { x: 0, z: 2.4, yaw: 0 },
        bounds: { areas: [{ x: [XL + 0.4, XR - 0.4], z: [BACK + 0.6, FRONT - 0.3] }, { x: [XL - 8.4, XL + 0.4], z: [BACK + 0.6, FRONT - 0.6] }] },
        stops: stops,
        // A VR headset can open this room as it can the street (Helen's ask,
        // 2026-11-11). Every switch is on the headset's panel; the page on the
        // wall is not in the headset, which shows only the picture, so the
        // plaques say in WebGL what the page says about the cave and the shelf.
        vr: true
      };
    }
  };
})();

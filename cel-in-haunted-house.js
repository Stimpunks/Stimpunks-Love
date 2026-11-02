/* ==========================================================================
   cel-in-haunted-house.js — The Haunted House, walked into on Cel Street, down
   turning 09 off the Outskirts. Ryan's ask, 2026-11-01: the Outskirts'
   turnings, each its own world.

   AN EMPTY WAREHOUSE AT THE END OF THE ROAD WITH A HOUSE BUILT INSIDE IT OUT
   OF PLYWOOD FLATS, and the work lights left on BEHIND the set (§132). So the
   only light there is comes through the set: a hairline in every seam where
   two flats do not quite meet, round the open door, between the boards over
   the windows and in the cracks of the round window in the gable. You never
   see a lamp. Black Leather Lagoon, one bright screen in front of you over
   black water, is the room to watch: there is no lit window and no glowing
   shape in here, only seams, and a seam is never behind a word.

   You stand on the warehouse's concrete in front of the house, its steel
   columns and its roof trusses dark round you, the porch steps up to the open
   door and a pumpkin nobody lit. Through the door is the hall, a corridor of
   flats with the light coming through their seams, and at the far end of it
   the way out, as every room of the house ends with one. The page's own words
   stand on painted boards on timber jacks round the warehouse floor; the
   house's rooms and everything in the house hang on the walls of the hall,
   with the lights up. The hunt itself, places to look and all, is on the
   page on its board by the way in, where haunted-house.js works it: that
   script asks for the page's own main, so it is not wired here, and its
   buttons are left out of the copy rather than left dead. No photograph is
   lifted: the house's public-domain pictures stay on the page.

   NOTHING JUMPS OUT, NOTHING DRIFTS, NOTHING FLICKERS AND NOTHING MOVES, at
   any setting; nothing makes a sound, and nothing is counted. Every colour is
   one the house declares, by name. It keeps nothing, sends nothing and
   fetches nothing; its page arrives through Cel Street's screen(), and the
   soundtrack's pieces lifted off it wait to be pressed here as they do there.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['haunted-house.html'] = {
    name: 'The Haunted House',
    from: 'the-outskirts.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var FZ = -6, HW = 6, EAVE = 4.4, RIDGE = 7;       // the house front: where, half its width, eave, ridge
      var DW = 1.5, DH = 2.35;                          // the door
      var CW = 1.6, CEND = -24, CH = 3.2;               // the hall: half its width, its far end, its height

      // THE WAREHOUSE, dark, and only just enough of it to tell the steel from
      // the dark: nothing in here is lit by anything you can see.
      kit.scene.background = kit.col('--hh-dark');
      kit.scene.fog = new T.Fog(kit.col('--hh-dark'), 16, 44);
      kit.scene.add(new T.HemisphereLight(kit.col('--hh-paint'), kit.col('--hh-dark'), 0.7));

      box(40, 0.1, 44, at(0, -0.06, -8), '--hh-floor', false, false);
      box(40, 12, 0.4, at(0, 6, -30), '--hh-dark', false, false);
      [-14, 14].forEach(function (x) { box(0.4, 12, 44, at(x, 6, -8), '--hh-dark', false, false); });
      box(40, 0.4, 0.4, at(0, 11.6, 10), '--hh-dark', false, false);
      // Its steel: columns down both sides, and trusses across overhead.
      [-11, 11].forEach(function (x) {
        for (var z = 6; z > -28; z -= 8) box(0.42, 9.4, 0.42, at(x, 4.7, z), '--hh-steel', 0.02);
      });
      for (var tz = 6; tz > -28; tz -= 8) {
        box(22.4, 0.36, 0.3, at(0, 9.4, tz), '--hh-steel', 0.02);
        box(22.4, 0.2, 0.2, at(0, 8.2, tz), '--hh-steel', 0.02);
        for (var tx = -10; tx <= 10; tx += 2.5) box(0.12, 1.3, 0.12, at(tx, 8.8, tz, 0, 0, (tx / 2.5) % 2 ? 0.6 : -0.6), '--hh-steel', false);
      }
      for (var pz = 6; pz > -28; pz -= 2.4) box(22.4, 0.1, 0.12, at(0, 9.65, pz), '--hh-steel', false, false);

      // A SEAM, where two flats do not quite meet and the work lights behind
      // the set come through: a hairline drawn flat in the light's own colour,
      // lighting nothing round it. g is the flat's face; x0,y0 to x1,y1 along it.
      function seam(g, x0, y0, x1, y1, w) {
        var dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
        kit.flat(new T.PlaneGeometry(len, w || 0.03), M(g, at((x0 + x1) / 2, (y0 + y1) / 2, 0.012, 0, 0, Math.atan2(dy, dx))), '--hh-seam');
      }
      // Gaffer tape over a seam, here and there.
      function tape(g, x, y, h) { box(0.16, h || 0.3, 0.012, M(g, at(x, y, 0.02)), '--hh-tape', false, false); }

      // THE HOUSE FRONT: painted flats either side of the door, the lintel
      // over it, and the gable over the eaves.
      var front = at(0, 0, FZ);
      var side = HW - DW / 2;
      box(side, EAVE, 0.12, M(front, at(-(DW / 2 + side / 2), EAVE / 2, -0.06)), '--hh-wall');
      box(side, EAVE, 0.12, M(front, at(DW / 2 + side / 2, EAVE / 2, -0.06)), '--hh-wall');
      box(DW, EAVE - DH, 0.12, M(front, at(0, DH + (EAVE - DH) / 2, -0.06)), '--hh-wall');
      var gable = new T.Shape();
      gable.moveTo(-HW, 0); gable.lineTo(HW, 0); gable.lineTo(0, RIDGE - EAVE); gable.lineTo(-HW, 0);
      kit.piece(new T.ExtrudeGeometry(gable, { depth: 0.12, bevelEnabled: false }), M(front, at(0, EAVE, -0.12)), '--hh-wall');
      // The painted trim along the roofline, the jacks holding it all up from
      // behind, seen past both ends.
      var pitch = Math.atan2(RIDGE - EAVE, HW), rafter = Math.hypot(HW, RIDGE - EAVE) + 0.3;
      [-1, 1].forEach(function (k) {
        box(rafter, 0.14, 0.1, M(front, at(k * HW / 2, EAVE + (RIDGE - EAVE) / 2 + 0.1, 0.06, 0, 0, -k * pitch)), '--hh-paint', false);
        [-0.4, -2.6].forEach(function (dz, j) {
          box(0.14, 5.4, 0.14, M(front, at(k * (HW - 0.4 - j * 2.2), 2.4, dz - 1.6, 0, 0.62)), '--hh-timber', 0.02);
          box(0.14, 0.1, 3.2, M(front, at(k * (HW - 0.4 - j * 2.2), 0.05, dz - 1.6)), '--hh-timber', 0.02);
        });
      });
      // The seams between the flats, up to the roofline, and the one up the
      // middle of the gable over the door; tape over a few of them.
      [-4, -2, 2, 4].forEach(function (x) {
        seam(front, x, 0.02, x, EAVE + (RIDGE - EAVE) * (1 - Math.abs(x) / HW) - 0.06);
      });
      seam(front, 0, EAVE + 0.02, 0, RIDGE - 0.08);
      // The seam along the roofline, where the gable meets the eaves' flats.
      seam(front, -HW + 0.2, EAVE, HW - 0.2, EAVE, 0.022);
      tape(front, -4, 2.2, 0.36); tape(front, -2, 3.3, 0.3); tape(front, 2, 1.2, 0.34); tape(front, 4, 3.0, 0.3);

      // THE DOOR, swung in, and the light all round its frame where the
      // frame meets the flats.
      box(0.06, DH, DW - 0.08, M(front, at(DW / 2 - 0.05, DH / 2, -(DW - 0.08) / 2 - 0.12)), '--hh-door', 0.02);
      [-1, 1].forEach(function (k) { box(0.1, DH + 0.1, 0.16, M(front, at(k * (DW / 2 + 0.05), DH / 2 + 0.05, 0)), '--hh-paint', 0.02); });
      box(DW + 0.3, 0.1, 0.16, M(front, at(0, DH + 0.1, 0)), '--hh-paint', 0.02);
      seam(front, -DW / 2 - 0.13, 0.02, -DW / 2 - 0.13, DH + 0.17, 0.022);
      seam(front, DW / 2 + 0.13, 0.02, DW / 2 + 0.13, DH + 0.17, 0.022);
      seam(front, -DW / 2 - 0.13, DH + 0.18, DW / 2 + 0.13, DH + 0.18, 0.022);

      // THE WINDOWS, boarded over, the light coming between the boards.
      function boarded(cx, cy) {
        var w = 1.6, h = 1.5;
        kit.flat(new T.PlaneGeometry(w, h), M(front, at(cx, cy, 0.006)), '--hh-dark');
        for (var b = 0; b < 4; b++) {
          var by = cy + h / 2 - 0.2 - b * 0.37;
          seam(front, cx - w / 2 + 0.05, by + 0.19, cx + w / 2 - 0.05, by + 0.19, 0.026);
          box(w + 0.24, 0.3, 0.04, M(front, at(cx, by, 0.04, 0, 0, b % 2 ? -0.035 : 0.035)), '--hh-board', 0.015);
        }
        [[0, h / 2 + 0.06, w + 0.24, 0.1], [0, -h / 2 - 0.06, w + 0.24, 0.1], [-w / 2 - 0.06, 0, 0.1, h + 0.22], [w / 2 + 0.06, 0, 0.1, h + 0.22]].forEach(function (t) {
          box(t[2], t[3], 0.08, M(front, at(cx + t[0], cy + t[1], 0.05)), '--hh-paint', false);
        });
      }
      boarded(-3.4, 2.15); boarded(3.4, 2.15);
      // The round window in the gable, boarded across, light in its cracks.
      var rw = 0.62, ry = EAVE + 1.25;
      kit.flat(new T.CircleGeometry(rw, 28), M(front, at(0, ry, 0.006)), '--hh-dark');
      seam(front, -rw + 0.08, ry + 0.09, rw - 0.08, ry + 0.09, 0.022);
      seam(front, -rw + 0.08, ry - 0.09, rw - 0.08, ry - 0.09, 0.022);
      seam(front, -0.09, ry - rw + 0.08, -0.09, ry + rw - 0.08, 0.022);
      seam(front, 0.09, ry - rw + 0.08, 0.09, ry + rw - 0.08, 0.022);
      box(rw * 2, 0.14, 0.04, M(front, at(0, ry, 0.03)), '--hh-board', false);
      box(0.14, rw * 2, 0.04, M(front, at(0, ry, 0.03)), '--hh-board', false);
      kit.piece(new T.TorusGeometry(rw + 0.06, 0.07, 8, 28), M(front, at(0, ry, 0.04)), '--hh-paint');
      // The cellar grate at the foot of the wall, the light between its bars.
      kit.flat(new T.PlaneGeometry(1.0, 0.32), M(front, at(-3.3, 0.36, 0.006)), '--hh-dark');
      [-0.36, -0.18, 0, 0.18, 0.36].forEach(function (o) { seam(front, -3.3 + o, 0.24, -3.3 + o, 0.48, 0.02); });
      [[0, 0.54, 1.12, 0.06], [0, 0.18, 1.12, 0.06], [-0.56, 0.36, 0.06, 0.42], [0.56, 0.36, 0.06, 0.42]].forEach(function (t) {
        box(t[2], t[3], 0.06, M(front, at(-3.3 + t[0], t[1], 0.04)), '--hh-paint', false);
      });

      // THE PORCH: three painted steps up to the door, and a pumpkin nobody
      // lit, sitting on the bottom one.
      [[DW + 1.2, 0.5, 0.42], [DW + 0.8, 0.34, 0.84], [DW + 0.4, 0.18, 1.26]].forEach(function (s, i) {
        box(s[0], s[1], 0.42, at(0, s[1] / 2, FZ + 0.21 + i * 0.42), '--hh-step', 0.02);
      });
      var pump = new T.SphereGeometry(0.24, 16, 12); pump.scale(1.15, 0.82, 1.15);
      kit.piece(pump, at(DW / 2 + 0.12, 0.37, FZ + 1.05), '--hh-pumpkin', 0.02);
      kit.cyl(0.025, 0.035, 0.12, at(DW / 2 + 0.12, 0.6, FZ + 1.05, 0, 0, 0.3), '--hh-timber', false, 6);

      // THE HALL, through the door: a corridor of flats with no ceiling, the
      // warehouse's trusses dark overhead, the light coming through the seams
      // in its walls, and at its far end the way out.
      [-1, 1].forEach(function (k) {
        box(0.12, CH, -CEND + FZ, at(k * (CW + 0.06), CH / 2, (FZ + CEND) / 2), '--hh-wall');
        var wall = at(k * CW, 0, 0, k < 0 ? LEFT : RIGHT);
        for (var z = FZ - 1.6; z > CEND + 0.6; z -= 1.8) {
          var lz = k < 0 ? -z : z;
          seam(wall, lz, 0.02, lz, CH - 0.04);
        }
        seam(wall, k < 0 ? -FZ : FZ, CH - 0.03, k < 0 ? -CEND : CEND, CH - 0.03, 0.02);
        box(0.08, 0.18, -CEND + FZ, at(k * (CW - 0.02), 0.09, (FZ + CEND) / 2), '--hh-paint', false, false);
      });
      tape(at(-CW, 0, 0, LEFT), 7.6, 1.8, 0.34); tape(at(CW, 0, 0, RIGHT), -11.2, 2.4, 0.3);
      // The back flat and the way out in it: a door, shut, with the light all
      // round its edges.
      box(CW * 2 + 0.24, CH, 0.12, at(0, CH / 2, CEND - 0.06), '--hh-wall');
      var back = at(0, 0, CEND + 0.01);
      box(1.1, 2.1, 0.06, M(back, at(0, 1.05, 0.02)), '--hh-door', 0.02);
      [[-0.6, 1.08, 0.1, 2.2], [0.6, 1.08, 0.1, 2.2], [0, 2.18, 1.3, 0.1]].forEach(function (t) {
        box(t[2], t[3], 0.12, M(back, at(t[0], t[1], 0.04)), '--hh-paint', false);
      });
      seam(back, -0.69, 0.02, -0.69, 2.24, 0.022); seam(back, 0.69, 0.02, 0.69, 2.24, 0.022);
      seam(back, -0.69, 2.25, 0.69, 2.25, 0.022); seam(back, -0.55, 0.012, 0.55, 0.012, 0.03);
      kit.cyl(0.035, 0.035, 0.04, M(back, at(0.4, 1.05, 0.07, 0, LEFT)), '--hh-paint', false, 10);

      // A PAINTED BOARD ON TIMBER JACKS, for each thing the page says out on
      // the warehouse floor, faced the way it is asked to face; returns where
      // the thing's foot goes, and keeps where to stand to read it square on.
      var spots = [];
      function board(x, z, rot, w, h, foot, d) {
        var g = at(x, 0, z, rot);
        box(w + 0.16, h + 0.16, 0.06, M(g, at(0, foot + h / 2, -0.06)), '--hh-slip');
        [-w / 2 + 0.25, w / 2 - 0.25].forEach(function (o) {
          box(0.1, foot + h * 0.6, 0.1, M(g, at(o, (foot + h * 0.6) / 2, -0.12)), '--hh-timber', 0.015);
          box(0.1, 1.6, 0.1, M(g, at(o, 0.7, -0.6, 0, -0.6)), '--hh-timber', 0.015);
        });
        spots.push({ x: x + Math.sin(rot) * d, z: z + Math.cos(rot) * d, yaw: rot });
        return M(g, at(0, foot, 0));
      }
      // A board inside the hall, flat on its wall.
      function onWall(k, z, d) {
        spots.push({ x: -k * (CW - d), z: z, yaw: k < 0 ? LEFT : RIGHT });
        return at(k * (CW - 0.02), 0.62, z, k < 0 ? LEFT : RIGHT);
      }
      function stop(i, name, where, pitch, more) {
        var s = { name: name, where: where, x: spots[i].x, z: spots[i].z, yaw: spots[i].yaw, pitch: pitch };
        for (var k in more) s[k] = more[k];
        return s;
      }

      // THE ROOM'S OWN PAGE, on a board by the way in, facing the house, the
      // hunt on it worked there by its own script.
      var OUT = [-12, 12, -5.6, 9], IN = [-CW, CW, CEND, -6.2];
      var pw = 2.6, ph = pw * 800 / 1180, py = 0.8 + ph / 2;
      var pg = at(0, 0, 8.4, Math.PI);
      box(pw + 0.2, ph + 0.2, 0.06, M(pg, at(0, py, -0.06)), '--hh-slip');
      [-pw / 2 + 0.2, pw / 2 - 0.2].forEach(function (o) { box(0.1, py + ph / 2, 0.1, M(pg, at(o, (py + ph / 2) / 2, -0.12)), '--hh-timber', 0.015); });
      var page = kit.screen(1180, 800, pw, M(pg, at(0, py, 0)), 'The Haunted House’s own page, on a board by the way in, the hunt on it', OUT);

      // THE PAGE'S OWN WORDS. Its name and how it begins flank the house; the
      // lore stands down the left of the floor and the house's own rules down
      // the right; who it is and who reads it behind you by the way in. In the
      // hall, the house's rooms on the left wall, everything in the house on
      // the right, and its soundtrack further down on the left.
      var W = function (sel, n, w, h, ww, m, more) {
        var o = { n: n, w: w, ww: ww, m: m, zone: more && more.zone ? more.zone : OUT };
        if (h) o.h = h;
        if (more && more.drop) o.drop = more.drop;
        return kit.lift(page, sel, o);
      };
      var head = W('.hh-head', 0, 700, 560, 2.4, board(-7.6, -3.2, 0.5, 2.4, 1.9, 0.6, 3.2));
      var lede = W('.hh-lede', 0, 700, 600, 2.4, board(7.6, -3.2, -0.5, 2.4, 2.0, 0.6, 3.2));
      var veil = W('.hh-part', 1, 700, 600, 2.4, board(-10.2, 3.4, LEFT, 2.4, 2.0, 0.6, 3.0));
      var hist = W('.hh-part', 2, 700, 600, 2.4, board(-10.2, 0.4, LEFT, 2.4, 2.0, 0.6, 3.0));
      var made = W('.hh-part', 3, 700, 600, 2.4, board(-10.2, -2.6, LEFT + 0.2, 2.4, 2.0, 0.6, 3.0));
      var weird = W('.hh-part', 4, 700, 600, 2.4, board(-8.0, 7.2, Math.PI - 0.55, 2.4, 2.0, 0.6, 3.0));
      var rest = W('.hh-part', 5, 700, 600, 2.4, board(10.2, 3.4, RIGHT, 2.4, 2.0, 0.6, 3.0));
      var bring = W('.hh-part', 6, 700, 600, 2.4, board(10.2, 0.4, RIGHT, 2.4, 2.0, 0.6, 3.0));
      var rules = W('.hh-part', 7, 700, 600, 2.4, board(10.2, -2.6, RIGHT - 0.2, 2.4, 2.0, 0.6, 3.0));
      var chan = W('.hh-part', 8, 700, 600, 2.4, board(8.0, 7.2, Math.PI + 0.55, 2.4, 2.0, 0.6, 3.0));
      var next = W('.hh-part', 9, 700, 560, 2.2, board(-4.4, 7.6, Math.PI - 0.3, 2.2, 1.7, 0.6, 3.0));
      var whose = W('.hh-part', 10, 700, 600, 2.2, board(4.4, 7.6, Math.PI + 0.3, 2.2, 1.9, 0.6, 3.0));
      var rooms = W('.hh-rooms', 0, 760, 700, 2.6, onWall(-1, -9.6, 0.4), { zone: IN, drop: '.hh-places' });
      var list = W('.hh-list', 0, 760, 700, 2.6, onWall(1, -13.6, 0.4), { zone: IN, drop: '.hh-thing__pic' });
      var score = W('.hh-part', 0, 760, 700, 2.4, onWall(-1, -18.2, 0.4), { zone: IN });

      var stops = [
        { name: 'on the warehouse floor, the house built of flats in front of you and the light coming through its seams', where: 'in the warehouse, looking at the house', x: 0, z: 5.0, yaw: 0, pitch: 0.16 },
        { name: 'at the porch, the door open, the light all round its frame and a pumpkin nobody lit on the step', where: 'at the porch', x: 0, z: FZ + 3.0, yaw: 0, pitch: 0.18 },
        stop(0, 'at the board to the left of the house: the Haunted House, turning 09', 'at the house’s name', 0.08, { frame: head.el }),
        stop(1, 'at the board to the right of the house: what is in here', 'at how it begins', 0.08, { frame: lede.el }),
        stop(2, 'down the left of the floor: Samhain, and the thin places', 'at Samhain, and the thin places', 0.08, { frame: veil.el }),
        stop(3, 'down the left: where haunted houses came from', 'at where haunted houses came from', 0.08, { frame: hist.el }),
        stop(4, 'down the left: built by hand, in empty warehouses', 'at the volunteers who built them', 0.08, { frame: made.el }),
        stop(5, 'behind you on the left: eldritch, weird, and who gets made the monster', 'at the eldritch and the weird', 0.08, { frame: weird.el }),
        stop(6, 'down the right of the floor: the darker half of the year', 'at the darker half of the year', 0.08, { frame: rest.el }),
        stop(7, 'down the right: bring something to the house', 'at bringing something to the house', 0.08, { frame: bring.el }),
        stop(8, 'down the right: what is not in this house', 'at what is not in this house', 0.08, { frame: rules.el }),
        stop(9, 'behind you on the right: who reads the channel, and for how long', 'at the channel', 0.08, { frame: chan.el }),
        { name: 'through the door, in the hall: a corridor of flats with the light coming through every seam', where: 'in the hall', x: 0, z: FZ - 1.4, yaw: 0, pitch: 0.06 },
        stop(12, 'in the hall, on the left wall: the rooms of the house, each with its way out', 'at the rooms of the house', 0.06, { frame: rooms.el }),
        stop(13, 'in the hall, on the right wall: everything in the house, with the lights up', 'at everything in the house', 0.06, { frame: list.el }),
        stop(14, 'further down the hall, on the left wall: the house’s soundtrack', 'at the soundtrack', 0.06, { frame: score.el }),
        { name: 'at the far end of the hall: the way out, a shut door with the light all round its edges', where: 'at the way out', x: 0, z: CEND + 2.4, yaw: 0, pitch: 0.04 },
        stop(10, 'behind you by the way in: next door on the road', 'at what is next door', 0.08, { frame: next.el }),
        stop(11, 'behind you by the way in: whose this is', 'at whose this is', 0.08, { frame: whose.el }),
        { name: 'by the way in, at the board with the room’s own page on it, the hunt on it', where: 'at the room’s own page', x: 0, z: 5.8, yaw: Math.PI, pitch: 0.06, page: kit.page, frame: page }
      ];

      return {
        start: { x: 0, z: 5.0, yaw: 0 },
        bounds: { x: [-11, 11], z: [CEND + 0.6, 7.8],
                  areas: [{ x: [-11, 11], z: [-5.4, 7.8] }, { x: [-0.55, 0.55], z: [-6.7, -5.2] }, { x: [-CW + 0.35, CW - 0.35], z: [CEND + 0.6, -6.2] }] },
        stops: stops
      };
    }
  };
})();

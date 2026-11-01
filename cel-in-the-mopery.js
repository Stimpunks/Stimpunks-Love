/* =============================================================================
   The Mopery, walked into on Cel Street. Ryan's ask, 2026-10-31: back to the
   street, working down it.

   IT IS THE MOPERY'S WORLD AND NOBODY ELSE'S (§22): a library somebody has been
   let into after everybody has gone home. Blue-black stone all the way to the
   skirting, flagstones, bookcases down both sides of a long aisle, and a candle
   the whole way along the top of every case. A candle lights about a foot of a
   very large room, so each flame here is a point of light and a small halo on
   the top of its case, and nothing else: no warm pool on the floor, no amber on
   the walls. The only other light is cold, through the tall windows of the
   reading room at the end of the aisle. If the greys in here ever warm at the
   edges, this has become the yurt with a bigger bookshelf.

   THE READING ROOM: the Mopery's own page on a lectern in a gilt edge, in front
   of the windows; the parlour's set lifted off the page on one side and the
   list of everybody playing Paint It Black on a cello on the other, which the
   room's own mopery.js tunes and plays exactly as it does on the page, saying
   how long before the press. Doré's plates and three leaves of the 1865
   Tyndale printing hang on the side walls, lifted off the page: both are
   public domain. The Library of Congress facsimile in Poe's hand is not here,
   and is never copied: it is only pointed at, on the page.

   Every spine is one of §22's nine measured spine colours, by name, and every
   other colour is one the room declares. NOTHING MOVES: no flame in here
   flickers at any setting. It keeps nothing, sends nothing and fetches
   nothing; its page arrives through Cel Street's screen().
   ========================================================================== */
(function () {
  'use strict';
  var SPINES = ['--mop-oxblood', '--mop-sugar', '--mop-inkspine', '--mop-graphite', '--mop-tar',
                '--mop-wine', '--mop-vellum', '--mop-dust', '--mop-moss'];
  function hash(i, j, k) {
    var n = Math.imul(i + 31, 374761393) ^ Math.imul(j + 17, 668265263) ^ Math.imul(k + 5, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['the-mopery.html'] = {
    name: 'The Mopery',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var AW = 3.2, AH = 4.2;                 // the aisle: between the cases, and the height of the stone
      var CASE_D = 0.5, CASE_H = 2.6, CASE_W = 2.0, N = 6;
      var AZ = -0.4, AEND = AZ - N * (CASE_W + 0.25) - 0.4;   // where the stacks end
      var RW = 12, RD = 8, RH = 6.0;          // the reading room
      var back = AEND - RD;

      // COLD: the stone barely lit from everywhere, and the windows' blue.
      kit.scene.background = kit.col('--mop-deep');
      kit.scene.add(new T.HemisphereLight(kit.col('--mop-dim'), kit.col('--mop-deep'), 0.55));
      var cold = new T.DirectionalLight(kit.col('--mop-dim'), 0.9);
      cold.position.set(0, 9, back - 8); cold.target.position.set(0, 0, AEND + 2);
      kit.scene.add(cold, cold.target);

      // THE FLAGSTONES, the joints in the stone's own rule.
      var SW = AW + 2 * CASE_D + 0.6;
      box(SW, 0.1, -AEND + 0.6, at(0, -0.05, AEND / 2 + 0.1), '--mop-stone', false, false);
      box(RW, 0.1, RD, at(0, -0.05, AEND - RD / 2), '--mop-stone', false, false);
      for (var j = 0; j * 0.9 < -back; j++) {
        var zz = -0.2 - j * 0.9, ww = zz > AEND ? SW : RW;
        box(ww, 0.006, 0.03, at(0, 0.003, zz), '--mop-rule', false, false);
      }

      // THE STONE: the stacks' outer walls, the ceiling, the wall round the door.
      [-1, 1].forEach(function (s) {
        box(0.4, AH, -AEND, at(s * (SW / 2 + 0.2), AH / 2, AEND / 2), '--mop-stone', 0.02);
      });
      box(SW + 0.8, 0.3, -AEND, at(0, AH + 0.15, AEND / 2), '--mop-night', false, false);
      [-1, 1].forEach(function (s) { box((SW - 1.4) / 2, AH, 0.4, at(s * (SW + 1.4) / 4, AH / 2, 0.3), '--mop-stone', 0.02); });
      box(1.4, AH - 2.4, 0.4, at(0, 2.4 + (AH - 2.4) / 2, 0.3), '--mop-stone', 0.02);

      // A BOOKCASE: dark wood, shelf after shelf of spines, and a row of candles
      // the whole way along the top, each a flame and a halo the width of a hand.
      var candles = 0;
      function bookcase(m, w, h, seed) {
        box(w, h, CASE_D, M(m, at(0, h / 2, 0)), '--mop-shelf', 0.02);
        var shelves = Math.floor((h - 0.2) / 0.42);
        for (var r = 0; r < shelves; r++) {
          var y = 0.12 + r * 0.42;
          box(w - 0.08, 0.03, CASE_D - 0.04, M(m, at(0, y, 0.02)), '--mop-rule', false);
          var x = -w / 2 + 0.07, k = 0;
          while (x < w / 2 - 0.1) {
            var bw = 0.04 + hash(seed, r, k) * 0.05, bh = 0.24 + hash(seed, r, k + 99) * 0.1;
            if (x + bw > w / 2 - 0.07) break;
            if (hash(seed, r, k + 7) > 0.06) {
              box(bw - 0.006, bh, CASE_D - 0.12, M(m, at(x + bw / 2, y + 0.015 + bh / 2, 0.06)),
                SPINES[Math.floor(hash(seed, r, k + 3) * SPINES.length)], false);
            }
            x += bw; k++;
          }
        }
        for (var c = 0; c < 6; c++) {
          var cx = -w / 2 + 0.18 + c * (w - 0.36) / 5;
          kit.cyl(0.035, 0.035, 0.22, M(m, at(cx, h + 0.11, 0.06)), '--mop-wax', false, 8);
          kit.flat(new T.ConeGeometry(0.022, 0.07, 8), M(m, at(cx, h + 0.26, 0.06)), '--mop-flame');
          var halo = kit.flat(new T.CircleGeometry(0.1, 16), M(m, at(cx, h + 0.26, 0.07)), '--mop-flame');
          halo.material.transparent = true; halo.material.opacity = 0.16;
          candles++;
        }
      }
      for (var n = 0; n < N; n++) {
        var z = AZ - 0.2 - CASE_W / 2 - n * (CASE_W + 0.25);
        bookcase(at(-AW / 2 - CASE_D / 2, 0, z, LEFT), CASE_W, CASE_H, n * 2);
        bookcase(at(AW / 2 + CASE_D / 2, 0, z, RIGHT), CASE_W, CASE_H, n * 2 + 1);
      }
      // A library ladder leaning on the stacks, halfway along.
      var lz = AZ - 2.6 * (CASE_W + 0.25);
      [-0.22, 0.22].forEach(function (dx) {
        box(0.05, 2.9, 0.05, at(AW / 2 - 0.35, 1.4, lz + dx, 0, 0, 0.16), '--mop-stone', 0.01);
      });
      for (var g = 0; g < 7; g++) box(0.04, 0.03, 0.46, at(AW / 2 - 0.55 + g * 0.065, 0.3 + g * 0.38, lz), '--mop-rule', false);

      // THE READING ROOM: stone walls, cases round the sides, and two tall
      // windows at the end the cold comes through.
      box(0.4, RH, RD, at(-RW / 2 - 0.2, RH / 2, AEND - RD / 2), '--mop-stone', 0.02);
      box(0.4, RH, RD, at(RW / 2 + 0.2, RH / 2, AEND - RD / 2), '--mop-stone', 0.02);
      box(RW + 0.8, 0.3, RD, at(0, RH + 0.15, AEND - RD / 2), '--mop-night', false, false);
      [-1, 1].forEach(function (s) {
        var w = (RW - SW) / 2;
        box(w, RH, 0.4, at(s * (SW / 2 + w / 2), RH / 2, AEND + 0.2), '--mop-stone', 0.02);
      });
      box(SW, RH - AH, 0.4, at(0, AH + (RH - AH) / 2, AEND + 0.2), '--mop-stone', 0.02);
      // The end wall, and its two windows, arched, with the night in them.
      var WX = 3.3, WW = 1.9, WB = 0.9, WT = 5.0;
      var endw = new T.Shape();
      endw.moveTo(-RW / 2, 0); endw.lineTo(RW / 2, 0); endw.lineTo(RW / 2, RH); endw.lineTo(-RW / 2, RH); endw.closePath();
      [-1, 1].forEach(function (s) {
        var p = new T.Path(), cx = s * WX, r = WW / 2;
        p.moveTo(cx - r, WB); p.lineTo(cx - r, WT - r); p.absarc(cx, WT - r, r, Math.PI, 0, true); p.lineTo(cx + r, WB); p.closePath();
        endw.holes.push(p);
      });
      var eg = new T.ExtrudeGeometry(endw, { depth: 0.4, bevelEnabled: false, curveSegments: 24 });
      eg.translate(0, 0, -0.2);
      kit.piece(eg, at(0, 0, back), '--mop-stone', 0.02);
      [-1, 1].forEach(function (s) {
        kit.flat(new T.PlaneGeometry(WW, WT - WB), at(s * WX, (WB + WT) / 2, back - 0.3), '--mop-night');
        for (var b = 1; b < 3; b++) box(0.05, WT - WB, 0.06, at(s * WX - WW / 2 + b * WW / 3, (WB + WT) / 2, back - 0.1), '--mop-deep', false);
        for (var yb = WB + 0.8; yb < WT - 0.6; yb += 0.9) box(WW, 0.05, 0.06, at(s * WX, yb, back - 0.1), '--mop-deep', false);
        box(WW + 0.3, 0.1, 0.4, at(s * WX, WB - 0.05, back + 0.2), '--mop-rule', 0.01);
      });
      // Cases along both side walls of the reading room, candles on them too.
      [-1, 1].forEach(function (s) {
        bookcase(at(s * (RW / 2 - CASE_D / 2), 0, back + 1.5, s < 0 ? LEFT : RIGHT), 2.2, 3.0, 20 + s);
      });

      // THE LECTERN, in front of the windows, with the room's own page open on
      // it in a gilt edge.
      var LZ = back + 1.3;
      box(0.5, 1.0, 0.5, at(0, 0.5, LZ), '--mop-shelf', 0.02);
      box(0.9, 0.06, 0.6, at(0, 1.03, LZ), '--mop-rule', 0.01);
      var pw = 2.4, ph = pw * 800 / 1180, py = 1.2 + ph / 2;
      var pm = at(0, py, LZ - 0.1, 0, -0.08);
      box(pw + 0.12, ph + 0.12, 0.05, M(pm, at(0, 0, -0.04)), '--mop-gilt', 0.01);
      var frame = kit.screen(1180, 800, pw, M(pm, at(0, 0, 0.0)), 'The Mopery’s own page, open on the lectern');

      // THE PARLOUR'S SET on one side of the lectern, and the list of cellos on
      // the other, each on a low table, off the page; mopery.js runs on them.
      var SX = 3.4, TZ = back + 2.6;
      [-1, 1].forEach(function (s) { box(1.6, 0.7, 0.7, at(s * SX, 0.35, TZ), '--mop-shelf', 0.015); });
      // What is lifted off the page is laid over the picture, so it shows only
      // from the reading room, where the stone does not stand between.
      var ROOM = [-RW / 2, RW / 2, back, AEND + 0.4];
      var parlour = kit.lift(frame, '.mop-parlour', { w: 760, h: 820, ww: 1.6, m: at(-SX, 0.72, TZ - 0.1, 0.35), zone: ROOM });
      var cuts = kit.lift(frame, '.mop-cuts', { w: 760, h: 760, ww: 1.6, m: at(SX, 0.72, TZ - 0.1, -0.35), zone: ROOM });
      kit.wire(frame, 'mopery.js');

      // DORÉ'S PLATES on the reading room's side walls, and three leaves of
      // the 1865 printing; all public domain, all off the page.
      var plates = [];
      [0, 1, 2].forEach(function (i) {
        var z = AEND - 1.2 - i * 1.5;
        box(1.2, 1.95, 0.05, at(-RW / 2 + 0.03, 1.55 + 0.97, z, LEFT), '--mop-gilt', 0.01);
        plates.push(kit.lift(frame, '.mop-plate', { n: i, w: 420, ww: 1.05, m: at(-RW / 2 + 0.07, 1.62, z, LEFT), zone: ROOM }));
      });
      var leaves = [];
      [0, 1, 2].forEach(function (i) {
        var z = AEND - 1.2 - i * 1.5;
        box(1.2, 1.95, 0.05, at(RW / 2 - 0.03, 1.55 + 0.97, z, RIGHT), '--mop-gilt', 0.01);
        leaves.push(kit.lift(frame, '.mop-leafshot', { n: i, w: 420, ww: 1.05, m: at(RW / 2 - 0.07, 1.62, z, RIGHT), zone: ROOM }));
      });

      return {
        start: { x: 0, z: -0.8, yaw: 0 },
        bounds: { x: [-AW / 2 + 0.3, AW / 2 - 0.3], z: [back + 1.9, -0.6],
                  areas: [{ x: [-AW / 2 + 0.3, AW / 2 - 0.3], z: [AEND - 0.6, -0.6] },
                          { x: [-RW / 2 + 0.9, RW / 2 - 0.9], z: [back + 2.1, AEND - 0.2] }] },
        stops: [
          { name: 'inside the door, at the end of the stacks', x: 0, z: -0.8, yaw: 0 },
          { name: 'between the stacks, halfway along, with the candles on every case', x: 0, z: AZ - 3 * (CASE_W + 0.25), yaw: 0, pitch: 0.12 },
          { name: 'at the library ladder, leaning on the stacks', x: -0.3, z: lz, yaw: RIGHT },
          { name: 'at the lectern, with the room’s own page open on it', x: 0, z: LZ + 2.4, yaw: 0, pitch: 0.06, page: kit.page, frame: frame },
          { name: 'at the parlour’s set, with Paint It Black on it', x: -SX + 0.55, z: TZ + 1.7, yaw: 0.35, pitch: -0.12, frame: parlour.el },
          { name: 'at the list of cellos, to choose one for the set', x: SX - 0.55, z: TZ + 1.7, yaw: -0.35, pitch: -0.12, frame: cuts.el },
          { name: 'at Doré’s plates on the left-hand wall', x: -RW / 2 + 2.6, z: AEND - 2.7, yaw: LEFT, pitch: 0.05, frame: plates[1].el },
          { name: 'at the leaves of the 1865 printing on the right-hand wall', x: RW / 2 - 2.6, z: AEND - 2.7, yaw: RIGHT, pitch: 0.05, frame: leaves[1].el },
          { name: 'at the tall windows, with the cold coming in', x: 1.8, z: back + 2.2, yaw: Math.atan2(-(WX - 1.8), 2.2), pitch: 0.3 }
        ]
      };
    }
  };
})();

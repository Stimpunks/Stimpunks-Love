/* =============================================================================
   The MUD Room, walked into on Cel Street. Ryan's ask, 2026-10-31: back on the
   street, working down it a room at a time.

   IT IS THE MUD ROOM'S WORLD AND NOBODY ELSE'S (§70): a narrow boot room at the
   back of the shop, a bench along one wall with coats on pegs above it and a
   rack of muddy boots under it, the yellow wellies by the back door, and the
   card on the noticeboard in capitals. The back door stands open, and out of
   it is the Slake: up onto the sea wall, and below it the marsh, then the mud,
   then the channels of water lying in the mud and holding the sky, all the way
   out to the island with its striped mark, and the horizon. It is the longest
   view on the street.

   THE LIGHT IS THE SKY LYING IN THE MUD: overcast, from everywhere at once, no
   sun you could point at and no shadow, and the brightest thing below the
   horizon is the water, because the water is holding the sky. Everything
   standing up out of the mud is dark against it. The greys are olive, the
   colour of mud, never slate; nothing glows; and the only warm value in the
   room is the yellow of one pair of wellies.

   THE GAME IS THE PAGE'S. mud.js talks to the CB, so it is not run here: the
   Slake is played on the room's own page, on the wall of the boot room. Its
   words come off the page as they are: how to play and the house rules on the
   back of the shop, out by the sea wall; the guidebook on the wall inside;
   whose this is by the front door. Nobody to fight, nothing counted.

   NOTHING MOVES: the tide does not turn here, and out there it is out. Every
   colour is one the room declares, by name. It keeps nothing, sends nothing
   and fetches nothing; its page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 31, 374761393) ^ Math.imul(j + 59, 668265263) ^ Math.imul(k + 83, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['the-mud-room.html'] = {
    name: 'The MUD Room',
    faces: ['Castoro'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var HW = 2.2, BACK = -6, H = 2.6, TH = 0.2;   // the boot room: half its width, its back wall, its height
      var DW = 1.0, DH = 2.1;                       // the back door
      var WALLTOP = BACK - 0.1, PATH = BACK - 3.4;  // the sea wall's path runs from the back step to here
      var LOW = -4.0;                               // the marsh, down the bank

      // OVERCAST: the sky from everywhere at once, coming back up off the mud.
      // No sun and no shadow. The distance pales into the sky, a long way off.
      kit.scene.background = kit.col('--mud-sky');
      kit.scene.fog = new T.Fog(kit.col('--mud-sky'), 160, 1500);
      kit.scene.add(new T.HemisphereLight(kit.col('--mud-sky'), kit.col('--mud-silver'), 2.1));

      /* ── The boot room ──────────────────────────────────────────────────── */
      box(HW * 2, 0.1, -BACK, at(0, -0.05, BACK / 2), '--mud-ground', false, false);
      box(HW * 2 + TH * 2, 0.16, -BACK + TH, at(0, H + 0.08, BACK / 2), '--mud-bank', false, false);
      box(TH, H, -BACK, at(-HW - TH / 2, H / 2, BACK / 2), '--mud-bank');
      box(TH, H, -BACK, at(HW + TH / 2, H / 2, BACK / 2), '--mud-bank');
      box(HW * 2 + TH * 2, H, TH, at(0, H / 2, TH / 2), '--mud-bank');
      // The back wall, with the back door's opening in it.
      var side = (HW * 2 - DW) / 2;
      [-1, 1].forEach(function (s) { box(side, H, TH, at(s * (DW / 2 + side / 2), H / 2, BACK - TH / 2), '--mud-bank'); });
      box(DW, H - DH, TH, at(0, DH + (H - DH) / 2, BACK - TH / 2), '--mud-bank');
      // The back door, standing open against the wall, the window in it full of sky.
      var door = at(DW / 2 - 0.03, 0, BACK + DW / 2 - 0.05, -Math.PI / 2);
      box(DW - 0.04, DH - 0.02, 0.05, M(door, at(0, DH / 2, 0)), '--mud-high', 0.012);
      kit.flat(new T.PlaneGeometry(0.5, 0.6), M(door, at(0, 1.55, 0.03)), '--mud-silver');
      kit.flat(new T.PlaneGeometry(0.5, 0.6), M(door, at(0, 1.55, -0.03, Math.PI)), '--mud-silver');
      // A doormat inside the back door, and the step down outside it.
      box(0.9, 0.02, 0.55, at(0, 0.01, BACK + 0.4), '--mud-land', false, false);

      // THE BENCH along the left-hand wall, the coats on pegs above it with one
      // empty peg at the end, and the rack of boots under it, every one muddy.
      var BZ0 = -1.3, BZ1 = -4.7, bx = -HW + 0.24;
      box(0.44, 0.06, BZ0 - BZ1, at(bx, 0.46, (BZ0 + BZ1) / 2), '--mud-land', 0.012);
      [BZ0 - 0.15, (BZ0 + BZ1) / 2, BZ1 + 0.15].forEach(function (z) { box(0.38, 0.43, 0.06, at(bx, 0.215, z), '--mud-land', 0.01); });
      box(0.08, 0.06, BZ0 - BZ1, at(-HW + 0.04, 1.78, (BZ0 + BZ1) / 2), '--mud-land', 0.01);
      var COATS = ['--mud-marsh-dk', '--mud-high', '--mud-land', '--mud-deep', '--mud-marsh-dk', '--mud-high'];
      for (var p = 0; p < 7; p++) {
        var pz = BZ0 - 0.25 - p * 0.47;
        cyl(0.025, 0.025, 0.14, at(-HW + 0.1, 1.74, pz, 0, 0, Math.PI / 2), '--mud-deep', false, 6);
        if (p === 6) continue;                      // the empty peg, for whoever comes next
        var cm = at(-HW + 0.18, 1.4, pz, 0, 0, (hash(p, 1, 1) - 0.5) * 0.06);
        box(0.12, 0.66, 0.36, cm, COATS[p], 0.012);
        box(0.14, 0.12, 0.18, M(cm, at(0.01, 0.3, 0)), COATS[p], 0.01);
        if (p % 2 === 0) {
          cyl(0.11, 0.12, 0.1, at(-HW + 0.22, 1.86, pz, 0, 0, Math.PI / 2 - 0.2), COATS[(p + 3) % COATS.length], 0.01, 12);
          cyl(0.17, 0.17, 0.015, at(-HW + 0.18, 1.83, pz, 0, 0, Math.PI / 2 - 0.2), COATS[(p + 3) % COATS.length], false, 14);
        }
      }
      // The boots, in pairs under the bench, the mud dried on them.
      for (var b = 0; b < 6; b++) {
        var bz = BZ0 - 0.3 - b * 0.55;
        [-0.08, 0.08].forEach(function (o, k) {
          var tall = 0.3 + hash(b, k, 2) * 0.08;
          box(0.11, tall, 0.12, at(bx + 0.02, tall / 2, bz + o), '--mud-deep', 0.008);
          box(0.24, 0.07, 0.12, at(bx + 0.08, 0.035, bz + o), '--mud-deep', 0.008);
          box(0.25, 0.04, 0.13, at(bx + 0.08, 0.02, bz + o), '--mud-high', false, false);
          box(0.115, 0.1, 0.125, at(bx + 0.02, 0.1, bz + o), '--mud-high', false, false);
        });
      }
      // The yellow wellies by the back door, your size, whatever your size is.
      [-0.1, 0.1].forEach(function (o) {
        box(0.12, 0.36, 0.13, at(-0.7 + o, 0.18, BACK + 0.5), '--mud-welly', 0.01);
        box(0.12, 0.08, 0.26, at(-0.7 + o, 0.04, BACK + 0.44), '--mud-welly', 0.01);
      });

      // THE NOTICEBOARD by the back door, its card pinned up in capitals.
      var card = kit.paper(640, 520, function (c, w, h) {
        c.fillStyle = kit.ink('--mud-sky'); c.fillRect(0, 0, w, h);
        c.fillStyle = kit.ink('--mud-deep'); c.textAlign = 'center';
        c.font = '50px Castoro';
        ['NOBODY TO FIGHT.', 'NOTHING IS COUNTED.', 'THE TIDE TURNS WHEN', 'YOU WAIT FOR IT,', 'AND NOT BEFORE.', 'SAY HOME AND', 'YOU ARE HOME.']
          .forEach(function (line, i) { c.fillText(line, w / 2, 76 + i * 66); });
      });
      box(1.0, 0.9, 0.04, at(-1.25, 1.5, BACK + 0.02), '--mud-land', 0.012);
      kit.sheet(card, 0.74, 0.6, at(-1.25, 1.5, BACK + 0.05));
      cyl(0.02, 0.02, 0.02, at(-1.25, 1.78, BACK + 0.07, 0, Math.PI / 2), '--mud-welly', false, 8);

      // THE ROOM'S OWN PAGE on the right-hand wall, where the Slake is played,
      // and the guidebook beside it, the whole Slake written out.
      var pw = 2.3, ph = pw * 800 / 1180, py = 0.55 + ph / 2;
      // A page laid over the picture is not hidden by a wall, so the boot room's
      // pages show only while you are in it, and the notices on the back of the
      // shop only once you are out of it.
      var IN = [-HW, HW, BACK, 0.2], OUT = [-40, 40, PATH - 2, BACK - 0.1];
      var pg = at(HW - 0.02, 0, -2.0, -Math.PI / 2);
      box(pw + 0.16, ph + 0.16, 0.05, M(pg, at(0, py, 0)), '--mud-land', 0.012);
      var frame = kit.screen(1180, 800, pw, M(pg, at(0, py, 0.035)), 'The MUD Room’s own page, where the Slake is played, on the boot room wall', IN);
      var book = kit.lift(frame, '.mud-part', { n: 5, w: 760, h: 900, ww: 1.5, zone: IN, m: M(at(HW - 0.03, 0, -4.4, -Math.PI / 2), at(0, 0.6, 0)) });
      // Its ways on are links to places further down the page, which here would
      // be read as leaving the room, so they stay on the page itself.
      // The page's own script shuts the guidebook once the game is up, which is
      // the state the copy arrives in; on the wall here it opens once, and is
      // then the reader's to shut and open again.
      var opened = false;
      kit.follow(book, '.mud-book', function (read, node) { if (!opened) { opened = true; node.open = true; } });
      // Whose this is, by the front door, behind you as you come in.
      var whose = kit.lift(frame, '.mud-part', { n: 4, w: 760, h: 820, ww: 1.4, zone: IN, m: at(-1.2, 0.55, -0.02, Math.PI) });

      /* ── Out the back door: the sea wall and the Slake ──────────────────── */
      // The shop's back seen from the wall: its roof over the boot room.
      box(HW * 2 + TH * 2 + 0.4, 0.16, -BACK + 1.0, at(0, H + 0.3, BACK / 2), '--mud-deep', 0.015);
      // The step down, and the sea wall: a long grassed bank, a path along its top.
      box(DW + 0.4, 0.12, 0.5, at(0, -0.06, BACK - 0.35), '--mud-bank', false, false);
      box(400, 0.2, PATH - WALLTOP - 0.6, at(0, -0.1, (WALLTOP + PATH) / 2 + 0.3), '--mud-marsh', false, false);
      box(400, 0.21, 1.3, at(0, -0.095, (WALLTOP + PATH) / 2), '--mud-high', false, false);
      // The fields behind the wall, inland, low and flat.
      box(600, 0.1, 300, at(0, -0.2, WALLTOP + 150), '--mud-land', false, false);
      // The bank going down to the marsh, the grass on it.
      var bank = new T.PlaneGeometry(400, Math.hypot(5, -LOW));
      kit.piece(bank, at(0, LOW / 2 - 0.1, PATH - 2.5, 0, -Math.PI / 2 - Math.atan2(-LOW, 5)), '--mud-marsh', false);
      for (var g = 0; g < 120; g++) {
        var gx = (hash(g, 2, 1) - 0.5) * 30, gz = WALLTOP - 0.5 - hash(g, 2, 2) * 2.4;
        kit.piece(new T.ConeGeometry(0.03, 0.3 + hash(g, 2, 3) * 0.2, 4), at(gx, 0.12, gz), '--mud-marsh-dk', false);
      }

      // THE NOTICES on the back of the shop, either side of the door, for reading
      // with your back to the Slake: how to play, the house rules, and other
      // people out here.
      var BACKFACE = BACK - TH - 0.02;
      var how = kit.lift(frame, '.mud-part', { n: 1, w: 760, h: 760, ww: 1.3, zone: OUT, m: at(-1.5, 0.35, BACKFACE, Math.PI) });
      var rules = kit.lift(frame, '.mud-part', { n: 2, w: 760, h: 760, ww: 1.3, zone: OUT, m: at(1.5, 0.35, BACKFACE, Math.PI) });
      var others = kit.lift(frame, '.mud-part', { n: 3, w: 760, h: 760, ww: 1.3, zone: OUT, m: at(3.4, 0.35, BACKFACE, Math.PI) });
      box(1.5, 0.08, 0.3, at(3.4, 2.0, BACKFACE - 0.1), '--mud-deep', 0.01);
      box(4.6, 0.08, 0.3, at(0, 2.0, BACKFACE - 0.1), '--mud-deep', 0.01);

      // THE MARSH below the wall, green and cut up by little creeks, then the
      // great flat of mud, then the channels lying in it holding the sky.
      var MARSH = 14;                               // how far the marsh runs out before the mud
      box(1200, 0.1, MARSH, at(0, LOW - 0.05, PATH - MARSH / 2), '--mud-marsh', false, false);
      box(3000, 0.1, 2400, at(0, LOW - 0.08, PATH - MARSH - 1200), '--mud-ground', false, false);
      for (var c = 0; c < 26; c++) {
        var cz = PATH - 3 - hash(c, 3, 1) * (MARSH - 6), cx = (hash(c, 3, 2) - 0.5) * 120;
        kit.flat(new T.PlaneGeometry(0.5 + hash(c, 3, 3) * 0.8, 4 + hash(c, 3, 4) * 8), at(cx, LOW + 0.012, cz, (hash(c, 3, 5) - 0.5) * 1.6, -Math.PI / 2), '--mud-marsh-dk');
      }
      // The channels lying in the mud, the brightest thing below the horizon.
      // Each one winds out from the edge of the marsh, widening as it goes.
      [[-14, 1], [22, 2], [-55, 3], [70, 4], [-130, 5], [150, 6], [-260, 7], [300, 8]].forEach(function (ch) {
        var x = ch[0], z = PATH - MARSH + 1, head = (hash(ch[1], 6, 1) - 0.5) * 0.3, w = 2.5 + hash(ch[1], 6, 2) * 2.5;
        for (var seg = 0; seg < 14; seg++) {
          var len = 14 + seg * 9;
          head += (hash(ch[1], seg, 7) - 0.5) * 1.3;
          head *= 0.75;                              // they bend, but they all run out to the sea
          var mx = x - Math.sin(head) * len / 2, mz = z - Math.cos(head) * len / 2;
          kit.flat(new T.PlaneGeometry(w, len + w), at(mx, LOW + 0.01, mz, head, -Math.PI / 2), '--mud-silver');
          x -= Math.sin(head) * len; z -= Math.cos(head) * len; w *= 1.3;
        }
      });
      // The sea, a long way out at low water: one sheet of the sky lying flat.
      kit.flat(new T.PlaneGeometry(4000, 1400), at(0, LOW + 0.01, PATH - 600 - 700, 0, -Math.PI / 2), '--mud-silver');
      // Raised banks of mud, darker, between the channels.
      for (var r = 0; r < 18; r++) {
        var rz = PATH - 80 - hash(r, 4, 1) * 500, rx = (hash(r, 4, 2) - 0.5) * 500;
        box(20 + hash(r, 4, 3) * 60, 0.3, 8 + hash(r, 4, 4) * 20, at(rx, LOW + 0.05, rz, hash(r, 4, 5) * 3), '--mud-bank', false, false);
      }

      // THE ISLAND far out, and its striped mark standing on it.
      var ix = 50, iz = PATH - 340;
      kit.piece(new T.CylinderGeometry(30, 40, 3, 18), at(ix, LOW + 1.2, iz), '--mud-land', false);
      kit.piece(new T.CylinderGeometry(14, 22, 3, 14), at(ix + 6, LOW + 3.5, iz - 4), '--mud-marsh-dk', false);
      for (var s = 0; s < 6; s++) {
        kit.piece(new T.CylinderGeometry(1.6, 1.8, 3.2, 10), at(ix + 6, LOW + 6.6 + s * 3.2, iz - 4), s % 2 ? '--mud-sky' : '--mud-deep', false);
      }
      // The line of causeway posts going out to it, standing out of the mud.
      for (var k = 0; k < 16; k++) {
        cyl(0.18, 0.2, 2.2, at(8 + k * 2.6, LOW + 1.0, PATH - MARSH - 4 - k * 19), '--mud-deep', false, 6);
      }
      // To the left, the reeds and the hide with a slot in it.
      for (var e = 0; e < 90; e++) {
        var ex = -12 - hash(e, 5, 1) * 26, ez = PATH - 4 - hash(e, 5, 2) * 9;
        kit.piece(new T.ConeGeometry(0.12, 2.2 + hash(e, 5, 3) * 1.4, 4), at(ex, LOW + 1.1, ez), '--mud-reed', false);
      }
      box(5, 2.6, 4, at(-20, LOW + 1.3, PATH - 12), '--mud-land');
      box(2.6, 0.18, 0.06, at(-20, LOW + 1.9, PATH - 9.98), '--mud-deep', false);
      // To the right, the white mill and the tall shed by the creek.
      box(9, 7, 7, at(24, LOW + 3.5, PATH - 14), '--mud-sky');
      kit.piece(new T.ConeGeometry(6.4, 4, 4), at(24, LOW + 9, PATH - 14, Math.PI / 4), '--mud-deep');
      box(4, 9, 4, at(33, LOW + 4.5, PATH - 9), '--mud-land');
      kit.flat(new T.PlaneGeometry(3, 34), at(30, LOW + 0.015, PATH - 6, 1.2, -Math.PI / 2), '--mud-silver');

      return {
        start: { x: 0, z: -0.7, yaw: 0 },
        bounds: { x: [-1.6, 1.6], z: [BACK + 0.5, -0.5],
                  areas: [{ x: [-1.6, 1.6], z: [BACK + 0.5, -0.5] }, { x: [-0.4, 0.4], z: [BACK - 1.0, BACK + 0.6] },
                          { x: [-16, 16], z: [PATH + 0.6, BACK - 0.8] }] },
        stops: [
          { name: 'just inside from the shop, the back door open at the end of the boot room', x: 0, z: -0.7, yaw: 0, pitch: 0.05 },
          { name: 'on the bench by the boots, where nobody asks you where you are going', x: 0.9, z: -3.0, yaw: Math.PI / 2, pitch: -0.42 },
          { name: 'at the coat pegs, one empty at the end for whoever comes next', x: 0.9, z: -3.4, yaw: Math.PI / 2 - 0.35, pitch: 0.08 },
          { name: 'by the yellow wellies at the back door, your size, whatever your size is', x: -0.4, z: BACK + 1.6, yaw: 0.3, pitch: -0.45 },
          { name: 'at the noticeboard by the back door: say home and you are home', x: -1.1, z: BACK + 1.4, yaw: 0, pitch: 0.05 },
          { name: 'at the boot room wall, with the room’s own page, where the Slake is played', x: -0.1, z: -2.0, yaw: -Math.PI / 2, pitch: -0.1, page: kit.page, frame: frame },
          { name: 'at the guidebook, the whole Slake written out', x: 0.4, z: -4.4, yaw: -Math.PI / 2, frame: book.el },
          { name: 'by the front door, at whose this is', x: -1.0, z: -1.6, yaw: Math.PI, frame: whose.el },
          { name: 'on the back step, the Slake opening out below', x: 0, z: BACK - 0.9, yaw: 0, pitch: -0.08 },
          { name: 'up on the sea wall, the mud and the water holding the sky all the way out to the island', x: 2.0, z: PATH + 1.0, yaw: -0.12, pitch: -0.16 },
          { name: 'on the sea wall, looking along to the reeds and the hide', x: -6.0, z: PATH + 0.7, yaw: 0.78, pitch: -0.2 },
          { name: 'on the sea wall, looking along to the white mill by the creek', x: 7.0, z: PATH + 0.7, yaw: -0.82, pitch: -0.12 },
          { name: 'at how to play, on the back of the shop', x: -1.5, z: BACKFACE - 1.6, yaw: Math.PI, frame: how.el },
          { name: 'at the house rules, on the back of the shop: nobody to fight, nothing counted', x: 1.5, z: BACKFACE - 1.6, yaw: Math.PI, frame: rules.el },
          { name: 'at other people out here, on the back of the shop', x: 3.4, z: BACKFACE - 1.6, yaw: Math.PI, frame: others.el }
        ]
      };
    }
  };
})();

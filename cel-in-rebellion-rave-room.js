/* =============================================================================
   The Rebellion Rave Room, walked into on Cel Street: turning 08 off the
   Outskirts. Ryan's ask, 2026-11-01: the turnings, each its own world.

   THE ANTE-CHAMBER COMES FIRST, AS IT DOES ON THE PAGE AND IN THE BUILDING
   (§68). You come in through a small room lit plainly and evenly, with the
   hangar doors shut-looking ahead of you, and the first thing on its walls is
   the warning, whole: the Epilepsy Society's figures, the Health and Safety
   Executive's four a second, and that the rig is off until you switch it on
   and say yes. The house rules are beside it, the hydration station on the
   right, and the other door, to the Cooldown Room, beside the station.

   THE HANGAR BEYOND IS IMMENSE, BLACK AND STEEL, and its light is light you
   see in the AIR: beams from the laser heads on the scaffold decks, caught
   along their whole length by the haze. HERE THE BEAMS ARE DRAWN STILL. THE
   STROBE IS AN OPT-IN AND IT STAYS ON THE PAGE: rave.js is never wired here,
   the rig and its switches are never lifted, and nothing in this scene
   flashes, blinks, pulses or moves at any setting. Nothing in it is the
   strobe's white. The big screen over the floor is dark: it is a set you tune
   on the page, and the page stands by the way in.

   DANCE, PUNKS IS THE COLLISION, out on the strip: steady glows at head
   height, outdoors, silent. In here there is a roof a long way up, haze, and
   nobody drawn; no light at head height anywhere.

   Every colour is one §68 declares, by name. It keeps nothing, sends nothing
   and fetches nothing; its page arrives through Cel Street's screen().
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 7, 374761393) ^ Math.imul(j + 29, 668265263) ^ Math.imul(k + 31, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['rebellion-rave-room.html'] = {
    name: 'Rebellion Rave Room',
    from: 'the-outskirts.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;

      // The ante-chamber: AW wide, from the way in at AF back to the hangar
      // doors at AB, AH high. The hangar: HW wide, from AB back to HB, HH high.
      var AW = 7.2, AF = 4.6, AB = -2.6, AH = 3.2;
      var HW = 32, HB = -42, HH = 18;
      var ANTE = [-AW / 2, AW / 2, AB, AF + 1], HALL = [-HW / 2, HW / 2, HB, AB - 0.05];

      // THE DARK: the hangar's black, and the haze that keeps the far end in it.
      kit.scene.background = kit.col('--rr-hangar');
      kit.scene.fog = new T.Fog(kit.col('--rr-hangar'), 14, 60);
      kit.scene.add(new T.HemisphereLight(kit.col('--rr-dim'), kit.col('--rr-hangar'), 0.95));

      // ── THE ANTE-CHAMBER ──────────────────────────────────────────────────
      // Lit plainly and evenly: two flat lights in the ceiling, steady, and
      // reaching no further than its own walls.
      [1.6, -1.0].forEach(function (z) {
        var l = new T.PointLight(kit.col('--rr-dim'), 16, 7.5, 1.0);
        l.position.set(0, AH - 0.3, z);
        kit.scene.add(l);
        box(1.6, 0.05, 0.5, at(0, AH - 0.03, z), '--rr-dim', false, false);
      });
      box(AW, 0.1, AF - AB, at(0, -0.05, (AF + AB) / 2), '--rr-deck', false, false);
      box(AW, 0.1, AF - AB, at(0, AH + 0.05, (AF + AB) / 2), '--rr-deck', false, false);
      [-1, 1].forEach(function (s) { box(0.2, AH, AF - AB, at(s * (AW / 2 + 0.1), AH / 2, (AF + AB) / 2), '--rr-steel'); });
      // The far wall, with the hangar doors in the middle standing open.
      var DG = 3.0;
      [-1, 1].forEach(function (s) {
        var w = (AW - DG) / 2;
        box(w, AH, 0.2, at(s * (DG / 2 + w / 2), AH / 2, AB), '--rr-steel');
      });
      box(DG, 0.5, 0.2, at(0, AH - 0.25, AB), '--rr-steel');
      // The hazard stripe across the threshold: the one place yellow is.
      for (var hz = -DG / 2 + 0.15; hz < DG / 2; hz += 0.5) kit.flat(new T.PlaneGeometry(0.25, 0.3), at(hz, 0.01, AB + 0.05, 0, -Math.PI / 2), '--rr-hazard');
      // The way in behind you, a plain door, shut.
      box(AW, AH, 0.2, at(0, AH / 2, AF), '--rr-steel');
      box(1.1, 2.2, 0.06, at(0, 1.1, AF - 0.13), '--rr-deck', 0.02);

      // THE HYDRATION STATION on the right: a counter, a stack of paper cups,
      // a basket of earplugs, ear defenders on a hook, a box of dark glasses.
      var SZ = 2.1;
      box(0.6, 0.95, 1.6, at(AW / 2 - 0.4, 0.475, SZ), '--rr-deck');
      box(0.66, 0.05, 1.66, at(AW / 2 - 0.4, 0.97, SZ), '--rr-steel', false);
      cyl(0.11, 0.11, 0.42, at(AW / 2 - 0.4, 1.3, SZ + 0.5), '--rr-text', 0.01, 12);
      cyl(0.08, 0.06, 0.12, at(AW / 2 - 0.42, 1.06, SZ), '--rr-text', 0.01, 10);
      cyl(0.08, 0.06, 0.12, at(AW / 2 - 0.36, 1.06, SZ - 0.18), '--rr-text', 0.01, 10);
      box(0.3, 0.12, 0.3, at(AW / 2 - 0.4, 1.06, SZ - 0.55), '--rr-dim', 0.01);
      kit.piece(new T.TorusGeometry(0.11, 0.03, 6, 14, Math.PI), at(AW / 2 - 0.05, 1.55, SZ + 0.1, LEFT), '--rr-steel');
      // The other door, to the Cooldown Room, on the right wall past the
      // station, shut and plain: the rig does not reach it.
      var CZ = 0.0;
      box(0.06, 2.2, 1.1, at(AW / 2 - 0.02, 1.1, CZ), '--rr-deck', 0.02);
      box(0.06, 0.08, 1.24, at(AW / 2 - 0.02, 2.24, CZ), '--rr-dim', false);
      box(0.06, 0.06, 0.12, at(AW / 2 - 0.08, 1.05, CZ - 0.4), '--rr-dim', false);

      // ── THE HANGAR ────────────────────────────────────────────────────────
      box(HW, 0.1, AB - HB, at(0, -0.05, (AB + HB) / 2), '--rr-hangar', false, false);
      [-1, 1].forEach(function (s) { box(0.4, HH, AB - HB, at(s * (HW / 2 + 0.2), HH / 2, (AB + HB) / 2), '--rr-hangar', false); });
      box(HW, HH, 0.4, at(0, HH / 2, HB - 0.2), '--rr-hangar', false);
      [-1, 1].forEach(function (s) { box((HW - AW) / 2, HH, 0.3, at(s * (AW / 2 + (HW - AW) / 4), HH / 2, AB - 0.25), '--rr-hangar', false); });
      box(AW, HH - AH, 0.3, at(0, AH + (HH - AH) / 2, AB - 0.25), '--rr-hangar', false);
      // The roof's trusses, a long way up, steel against the black.
      for (var tz = AB - 3; tz > HB; tz -= 6) {
        box(HW, 0.25, 0.25, at(0, HH - 0.6, tz), '--rr-steel', 0.02);
        for (var tx = -HW / 2 + 2; tx < HW / 2; tx += 4) box(0.12, 1.4, 0.12, at(tx, HH - 1.4, tz, 0, 0, (tx % 8) ? 0.6 : -0.6), '--rr-steel', false);
      }

      // THE SCAFFOLD DECKS up every wall, tier on tier, with the rig bolted to
      // them: moving heads and laser heads, still.
      var heads = [];
      [-1, 1].forEach(function (s) {
        var x = s * (HW / 2 - 1.2);
        for (var y = 3.2; y < HH - 3; y += 3.6) {
          box(2.2, 0.15, AB - HB - 2, at(x, y, (AB + HB) / 2 - 0.5), '--rr-deck', 0.02);
          box(0.06, 0.06, AB - HB - 2, at(x - s * 1.05, y + 0.9, (AB + HB) / 2 - 0.5), '--rr-steel', false);
          for (var pz = AB - 1.5; pz > HB + 1; pz -= 3.5) {
            [-1, 1].forEach(function (k) { box(0.08, 3.6, 0.08, at(x + k * 1.0, y - 1.8, pz), '--rr-steel', false); });
          }
          for (var lz = AB - 4; lz > HB + 3; lz -= 7) {
            box(0.42, 0.34, 0.42, at(x - s * 0.7, y + 0.33, lz), '--rr-steel', 0.02);
            heads.push({ x: x - s * 0.82, y: y + 0.33, z: lz, s: s });
          }
        }
      });
      // Speaker stacks on the floor either side of the booth.
      [-1, 1].forEach(function (s) {
        for (var k = 0; k < 3; k++) box(1.4, 1.2, 1.2, at(s * 7.5, 0.6 + k * 1.22, HB + 3.5), '--rr-deck');
        for (k = 0; k < 3; k++) cyl(0.4, 0.4, 0.05, at(s * 7.5, 0.6 + k * 1.22, HB + 4.12, 0, Math.PI / 2), '--rr-steel', 0.01, 18);
      });

      // THE DJ BOOTH two floors up on its own tower at the back, the stair
      // beside it, and the lift in the corner that stops at every deck.
      box(4, 0.3, 3, at(0, 7.2, HB + 2.6), '--rr-deck', 0.02);
      [-1.8, 1.8].forEach(function (x) { [HB + 1.3, HB + 3.9].forEach(function (z) { box(0.2, 7.2, 0.2, at(x, 3.6, z), '--rr-steel', 0.02); }); });
      box(4, 1.0, 0.1, at(0, 7.85, HB + 4.05), '--rr-steel', 0.02);
      box(2.2, 0.12, 0.8, at(0, 8.4, HB + 2.6), '--rr-steel', 0.01);
      for (var st = 0; st < 12; st++) box(1.0, 0.1, 0.4, at(3.0, 0.3 + st * 0.6, HB + 9 - st * 0.55), '--rr-steel', false);
      var LX = -HW / 2 + 2.4, LZ = AB - 3.0;
      box(2.4, HH - 2, 2.4, at(LX, (HH - 2) / 2, LZ), '--rr-deck');
      box(1.2, 2.2, 0.06, at(LX + 1.22, 1.1, LZ, RIGHT), '--rr-steel', 0.02);

      // Tables and chairs round the edges, and nothing in the middle but room.
      for (var t = 0; t < 10; t++) {
        var side = t % 2 ? 1 : -1, z = AB - 5 - Math.floor(t / 2) * 6.5, x = side * (HW / 2 - 4.6);
        cyl(0.55, 0.55, 0.05, at(x, 0.74, z), '--rr-steel', 0.01, 16);
        cyl(0.06, 0.06, 0.72, at(x, 0.36, z), '--rr-steel', false, 8);
        [0, 2.1, 4.2].forEach(function (a) {
          var cx = x + Math.cos(a + t) * 0.95, cz = z + Math.sin(a + t) * 0.95;
          box(0.42, 0.06, 0.42, at(cx, 0.45, cz), '--rr-deck', 0.01);
          box(0.42, 0.5, 0.05, at(cx + Math.cos(a + t) * 0.2, 0.7, cz + Math.sin(a + t) * 0.2, -(a + t) + Math.PI / 2), '--rr-deck', 0.01);
        });
      }

      // THE BIG SCREEN over the floor, dark: it is tuned on the page.
      var SZD = HB + 6.5, SY = 11;
      box(10.4, 6.0, 0.2, at(0, SY, SZD), '--rr-steel', 0.03);
      box(10.0, 5.6, 0.05, at(0, SY, SZD + 0.12), '--rr-hangar', false, false);
      [-4.6, 4.6].forEach(function (x) { box(0.06, HH - SY - 3, 0.06, at(x, SY + 3 + (HH - SY - 3) / 2, SZD), '--rr-steel', false); });

      // THE BEAMS, caught in the haze along their whole length, drawn still:
      // from the laser heads on the decks across to the floor and the far
      // walls, in the rig's three laser colours and never the strobe's white.
      var INKS = ['--rr-laser', '--rr-magenta', '--rr-cyan'];
      function beam(a, b, ink, op) {
        var d = new T.Vector3().subVectors(b, a), len = d.length();
        var g = new T.CylinderGeometry(0.02, 0.06, len, 6, 1, true);
        var mat = new T.MeshBasicMaterial({ color: kit.col(ink), transparent: true, opacity: op, depthWrite: false });
        var mesh = new T.Mesh(g, mat);
        mesh.position.copy(a).addScaledVector(d, 0.5);
        mesh.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.clone().normalize());
        kit.scene.add(mesh);
      }
      heads.forEach(function (h, i) {
        if (hash(i, 3, 1) < 0.62) return;
        var ink = INKS[i % 3];
        var to = new T.Vector3(-h.s * (2 + hash(i, 3, 2) * 10), 0.05, Math.min(AB - 7, h.z - 6 + hash(i, 3, 3) * 12));
        beam(new T.Vector3(h.x, h.y, h.z), to, ink, 0.55);
        if (hash(i, 3, 4) > 0.6) beam(new T.Vector3(h.x, h.y, h.z), new T.Vector3(-h.s * (HW / 2 - 0.5), h.y + 2 + hash(i, 3, 5) * 6, h.z - 4), ink, 0.4);
      });
      // A fan of beams from the booth, out over the floor.
      for (var f = 0; f < 9; f++) {
        beam(new T.Vector3(0, 8.6, HB + 2.6), new T.Vector3(-12 + f * 3, 0.05, AB - 9 - hash(f, 4, 1) * 6), INKS[f % 3], 0.45);
      }

      // ── THE PAGE AND ITS WORDS ────────────────────────────────────────────
      // The room's own page on the left wall by the way in, where the rig and
      // the big screen work: it is the one place they do.
      var pw = 2.4, ph = pw * 800 / 1180, py = 0.55 + ph / 2, pz = 3.4;
      box(0.05, ph + 0.12, pw + 0.12, at(-AW / 2 + 0.03, py, pz), '--rr-steel', 0.01);
      var page = kit.screen(1180, 800, pw, at(-AW / 2 + 0.07, py, pz, LEFT), 'The Rebellion Rave Room’s own page, on the ante-chamber wall by the way in, where the rig and the big screen are', ANTE);

      // On the far wall, either side of the hangar doors: the warning, whole,
      // on the left, and the house rules on the right. The room's name and its
      // first lines on the left wall; the station's words on the right.
      var warn = kit.lift(page, '.rr-warn', { w: 760, h: 900, ww: 1.95, m: at(-(DG / 2 + (AW - DG) / 4), 0.45, AB + 0.12), zone: ANTE });
      var rules = kit.lift(page, '.rr-rules', { w: 760, h: 900, ww: 1.95, m: at(DG / 2 + (AW - DG) / 4, 0.45, AB + 0.12), zone: ANTE });
      var head = kit.lift(page, '.rr-head', { w: 760, ww: 2.0, m: at(-AW / 2 + 0.05, 1.6, 0.2, LEFT), zone: ANTE });
      var lede = kit.lift(page, '.lede', { w: 760, ww: 2.0, m: at(-AW / 2 + 0.05, 0.55, 0.2, LEFT), zone: ANTE });
      var station = kit.lift(page, '.rr-station', { w: 760, ww: 1.7, m: at(AW / 2 - 0.05, 1.25, SZ + 1.2, RIGHT), zone: ANTE });

      // Out in the hangar, on steel boards at the floor's edge: what the
      // hangar is, the big screen's own words, and whose this all is.
      function board(side, z, hgt) {
        var g = at(side * (HW / 2 - 7.4), 0, z, side < 0 ? LEFT : RIGHT);
        box(2.4, hgt + 0.2, 0.08, M(g, at(0, 0.5 + hgt / 2, -0.08)), '--rr-deck');
        [-1.1, 1.1].forEach(function (o) { box(0.08, 0.5 + hgt, 0.08, M(g, at(o, (0.5 + hgt) / 2, -0.14)), '--rr-steel'); });
        return M(g, at(0, 0.5, 0));
      }
      var BX = HW / 2 - 7.4;
      var hall0 = kit.lift(page, '.rr-prose', { n: 0, w: 760, ww: 2.0, m: board(-1, AB - 5, 1.4), zone: HALL });
      var hall1 = kit.lift(page, '.rr-prose', { n: 1, w: 760, ww: 2.0, m: board(1, AB - 5, 1.4), zone: HALL });
      var scr0 = kit.lift(page, '.rr-prose', { n: 2, w: 760, ww: 2.0, m: board(-1, AB - 14, 1.6), zone: HALL });
      var scr1 = kit.lift(page, '.rr-prose', { n: 3, w: 760, ww: 2.0, m: board(1, AB - 14, 1.4), zone: HALL });
      var whose = kit.lift(page, '.rr-whose', { w: 760, h: 900, ww: 2.0, m: board(-1, AB - 23, 2.1), zone: HALL });

      var stops = [
        { name: 'just inside the ante-chamber, the warning on the wall ahead of you, left of the hangar doors', where: 'just inside the ante-chamber', x: -0.6, z: 3.2, yaw: 0.18, pitch: 0.04 },
        { name: 'at the strobe and laser warning, on the far wall left of the hangar doors', where: 'at the strobe and laser warning', x: -(DG / 2 + (AW - DG) / 4), z: AB + 2.2, yaw: 0, pitch: 0.12, frame: warn.el },
        { name: 'at the house rules, on the far wall right of the hangar doors', where: 'at the house rules', x: DG / 2 + (AW - DG) / 4, z: AB + 2.2, yaw: 0, pitch: 0.12, frame: rules.el },
        { name: 'at the left wall: the room’s name and what this hangar is', where: 'at the room’s name', x: -AW / 2 + 2.2, z: 0.2, yaw: LEFT, pitch: 0.06, frame: head.el },
        { name: 'at the hydration station on the right: water, earplugs, ear defenders and dark glasses', where: 'at the hydration station', x: AW / 2 - 2.0, z: SZ + 1.0, yaw: RIGHT, pitch: 0.08, frame: station.el },
        { name: 'The Cooldown Room', room: 'the Cooldown Room', where: 'at the other door, on the right wall past the station: the way through to the Cooldown Room, where the rig does not reach', x: AW / 2 - 1.6, z: CZ, yaw: RIGHT, pitch: 0.04, page: 'cooldown-room.html' },
        { name: 'at the room’s own page on the left wall by the way in, where the rig and the big screen are', where: 'at the room’s own page', x: -AW / 2 + 2.2, z: pz, yaw: LEFT, pitch: 0.04, page: kit.page, frame: page },
        { name: 'through the doors into the hangar: the roof a long way up, the decks up every wall, beams standing still in the haze', where: 'just inside the hangar', x: 0, z: AB - 1.2, yaw: 0, pitch: 0.14 },
        { name: 'at the board on the left: through the doors, the hangar', where: 'at the board on the hangar', x: -BX + 2.0, z: AB - 5, yaw: LEFT, pitch: 0.06, frame: hall0.el },
        { name: 'at the board on the right: light you can see in the air', where: 'at the board on the light', x: BX - 2.0, z: AB - 5, yaw: RIGHT, pitch: 0.06, frame: hall1.el },
        { name: 'at the board on the left: on the big screen', where: 'at the board on the big screen', x: -BX + 2.0, z: AB - 14, yaw: LEFT, pitch: 0.06, frame: scr0.el },
        { name: 'at the board on the right: the festival films have their own lighting in them', where: 'at the board on the films’ own lighting', x: BX - 2.0, z: AB - 14, yaw: RIGHT, pitch: 0.06, frame: scr1.el },
        { name: 'in the middle of the floor, the dark screen ahead and the booth on its tower behind it', where: 'in the middle of the floor', x: 0, z: AB - 16, yaw: 0, pitch: 0.3 },
        { name: 'at the board on the left at the back: whose this all is', where: 'at the board on whose this all is', x: -BX + 2.0, z: AB - 23, yaw: LEFT, pitch: 0.08, frame: whose.el },
        { name: 'at the back of the floor, turned round to the doors you came in by', where: 'at the back of the floor, looking back', x: 0, z: HB + 11, yaw: Math.PI, pitch: 0.06 }
      ];

      return {
        start: { x: -0.6, z: 3.2, yaw: 0.18 },
        bounds: { x: [-HW / 2 + 5.4, HW / 2 - 5.4], z: [HB + 10, AF - 0.6], areas: [
          { x: [-AW / 2 + 0.6, AW / 2 - 0.6], z: [AB + 0.4, AF - 0.6] },
          { x: [-0.9, 0.9], z: [AB - 0.6, AB + 0.6] },
          { x: [-HW / 2 + 5.4, HW / 2 - 5.4], z: [HB + 10, AB - 0.4] }
        ] },
        stops: stops
      };
    }
  };
})();

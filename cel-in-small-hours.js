/* =============================================================================
   The Small Hours, walked into on Cel Street, down turning 05 off the
   Outskirts. Ryan's ask, 2026-11-01: the Outskirts' turnings.

   IT IS THE ROOM'S OWN WORLD (§44): AN ALL-NIGHT DINER SEEN FROM THE CAR PARK.
   You arrive out on the dark tarmac, and the diner is one long low box with a
   band of plate glass all down its side, lit evenly from inside by tubes. The
   light lies out across the lot in pale shapes, one under every window, and
   nothing else out there is lit but the steady OPEN sign on the roof. Then
   you may walk in, through the door at the end, to the counter, the stools,
   the booths along the window and the clock with no hands.

   DEAD TIRED SOCIETY IS THE ROOM TO WATCH. That room is also tubes and a shape
   of light on a floor, and there you sit in the dark and the light is in a
   corridor nobody stands in. Here the light is inside and you are the one out
   in the dark. If the words ever come out of the windows onto the dark, this
   has become that room with a menu: so every word of the diner's own stands
   in a window, facing the lot, and out on the lot stand only the page's own
   name, its line, its house rules and whose it all is, on boards in the dark.

   THE PAGE'S OWN WORDS, lifted off it and never retyped. From the lot, in two
   of the windows: the clock with no hands, and nobody asks why you are up.
   Inside: the menu on the board behind the counter, the placemat and its
   crayons on a booth's table, Up All Night with every word of it as the page
   prints it (the one song printed in full on this street, under its
   permission, with its credit), and the jukebox. small-hours.js, which the
   page itself runs and which keeps nothing and sends nothing, is wired to
   what was lifted, so the crayons colour and the albums play where they stand.
   Nothing here reads the clock, says anything about sleep, or says when it
   shuts: it does not.

   THE TUBES DO NOT FLICKER and the sign is steady: nothing moves at any
   setting. Every colour is one §44 declares, by name. It keeps nothing, sends
   nothing and fetches nothing; its page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['small-hours.html'] = {
    name: 'The Small Hours',
    from: 'the-outskirts.html',
    faces: ['"Righteous"'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var X0 = -9, X1 = 9, BACK = -6, H = 3.2;     // the diner's box
      var LOW = 0.6, HIGH = 2.6;                   // the band of glass
      var DOOR0 = 6.5, DOOR1 = 7.7, DH = 2.3;      // the door at the end
      var GLASS0 = -8.8, GLASS1 = 6.3, BAYS = 6;   // the windows down the side
      var BAY = (GLASS1 - GLASS0) / BAYS;
      function bay(k) { return GLASS0 + BAY * (k + 0.5); }
      var OUT = [-12, 12, 0.3, 12], IN = [-9.2, 9.2, -6.2, 0.3];

      function hang(mesh, m) {
        mesh.matrixAutoUpdate = false;
        mesh.matrix.copy(m);
        mesh.matrixWorldNeedsUpdate = true;
        kit.scene.add(mesh);
        return mesh;
      }
      function glow(geo, m, ink, opacity) {
        var mesh = kit.flat(geo, m, ink);
        if (opacity < 1) { mesh.material.transparent = true; mesh.material.opacity = opacity; mesh.material.depthWrite = false; }
        return mesh;
      }

      // THE DARK, and only enough of it to tell the building from the night.
      kit.scene.background = kit.col('--sh-lot');
      kit.scene.add(new T.HemisphereLight(kit.col('--sh-line'), kit.col('--sh-lot'), 0.55));

      // THE TUBES, inside, all down the ceiling: even, cold, steady.
      [-6.6, -2.2, 2.2, 6.6].forEach(function (x) {
        var tube = new T.PointLight(kit.col('--sh-glass'), 9, 9.5, 1.15);
        tube.position.set(x, 2.9, -2.6);
        kit.scene.add(tube);
        glow(new T.BoxGeometry(2.4, 0.05, 0.16), at(x, H - 0.04, -1.6), '--sh-pale', 1);
        glow(new T.BoxGeometry(2.4, 0.05, 0.16), at(x, H - 0.04, -4.0), '--sh-pale', 1);
      });

      // THE LOT: tarmac to the dark, a kerb along the building, painted bays.
      kit.piece(new T.PlaneGeometry(120, 120), at(0, 0, 0, 0, -Math.PI / 2), '--sh-lot', false, false);
      box(X1 - X0 + 1, 0.12, 0.5, at(0, 0.06, 0.45), '--sh-line', false, false);
      for (var px = -8; px <= 8.01; px += 2.6) box(0.08, 0.01, 3.4, at(px, 0.006, 4.4), '--sh-line', false, false);

      // WHAT THE WINDOWS THROW: a pale shape on the tarmac under every bay,
      // widening as it goes, and a brighter one out of the door.
      function throwShape(x0, x1, far, spread) {
        var s = new T.Shape();
        s.moveTo(x0, -0.5); s.lineTo(x1, -0.5); s.lineTo(x1 + spread, -far); s.lineTo(x0 - spread, -far); s.closePath();
        return new T.ShapeGeometry(s);
      }
      for (var k = 0; k < BAYS; k++) {
        glow(throwShape(bay(k) - BAY / 2 + 0.12, bay(k) + BAY / 2 - 0.12, 3.8, 0.5 + k * 0.12), at(0, 0.012, 0, 0, -Math.PI / 2), '--sh-glass', 0.09);
      }
      glow(throwShape(DOOR0 + 0.05, DOOR1 - 0.05, 4.6, 0.8), at(0, 0.013, 0, 0, -Math.PI / 2), '--sh-glass', 0.13);

      // THE BUILDING: a dark wall with the band of glass let into it, chrome
      // along the top, the door at the end, and the roof.
      kit.piece(new T.PlaneGeometry(X1 - X0, -BACK), at(0, 0.01, BACK / 2, 0, -Math.PI / 2), '--sh-line', false, false);
      box(DOOR0 - X0, LOW, 0.2, at((X0 + DOOR0) / 2, LOW / 2, -0.1), '--sh-wall');
      box(X1 - DOOR1, H, 0.2, at((DOOR1 + X1) / 2, H / 2, -0.1), '--sh-wall');
      box(DOOR0 - GLASS1, HIGH - LOW, 0.2, at((GLASS1 + DOOR0) / 2, (LOW + HIGH) / 2, -0.1), '--sh-wall');
      box(GLASS0 - X0, HIGH - LOW, 0.2, at((X0 + GLASS0) / 2, (LOW + HIGH) / 2, -0.1), '--sh-wall');
      box(DOOR0 - X0, H - HIGH, 0.2, at((X0 + DOOR0) / 2, (HIGH + H) / 2, -0.1), '--sh-wall');
      box(DOOR1 - DOOR0, H - DH, 0.2, at((DOOR0 + DOOR1) / 2, (DH + H) / 2, -0.1), '--sh-wall');
      box(0.2, H, -BACK, at(X0, H / 2, BACK / 2), '--sh-wall');
      box(0.2, H, -BACK, at(X1, H / 2, BACK / 2), '--sh-wall');
      box(X1 - X0, H, 0.2, at(0, H / 2, BACK), '--sh-wall');
      box(X1 - X0 + 0.4, 0.16, -BACK + 0.4, at(0, H + 0.08, BACK / 2), '--sh-wall');
      box(X1 - X0 + 0.4, 0.12, 0.08, at(0, H + 0.04, 0.16), '--sh-chrome', 0.01);
      box(GLASS1 - GLASS0, 0.05, 0.24, at((GLASS0 + GLASS1) / 2, LOW, -0.06), '--sh-chrome', 0.01);
      box(GLASS1 - GLASS0, 0.05, 0.24, at((GLASS0 + GLASS1) / 2, HIGH, -0.06), '--sh-chrome', 0.01);
      for (k = 0; k <= BAYS; k++) box(0.1, HIGH - LOW, 0.22, at(GLASS0 + BAY * k, (LOW + HIGH) / 2, -0.1), '--sh-wall');
      [DOOR0, DOOR1].forEach(function (x) { box(0.08, DH, 0.24, at(x, DH / 2, -0.1), '--sh-chrome', 0.01); });
      box(DOOR1 - DOOR0, 0.08, 0.24, at((DOOR0 + DOOR1) / 2, DH, -0.1), '--sh-chrome', 0.01);
      // The glass itself, which the light comes through.
      glow(new T.PlaneGeometry(GLASS1 - GLASS0, HIGH - LOW), at((GLASS0 + GLASS1) / 2, (LOW + HIGH) / 2, 0.005), '--sh-glass', 0.14);
      // The door, standing open against the inside of the wall.
      glow(new T.PlaneGeometry(1.05, DH - 0.1), at(DOOR1 - 0.05, (DH - 0.1) / 2, -0.7, -Math.PI / 2), '--sh-glass', 0.2);
      box(0.04, DH - 0.1, 0.06, at(DOOR1 - 0.05, (DH - 0.1) / 2, -1.2), '--sh-chrome', 0.01);

      // THE SIGN ON THE ROOF, the one steady neon, lettered OPEN.
      box(2.6, 0.9, 0.16, at(0, H + 0.75, -0.4), '--sh-wall', 0.012);
      box(2.7, 0.06, 0.2, at(0, H + 1.22, -0.4), '--sh-chrome', 0.01);
      [-0.8, 0.8].forEach(function (x) { box(0.06, 0.4, 0.06, at(x, H + 0.2, -0.4), '--sh-chrome', 0.01); });
      var open = kit.paper(640, 220, function (c, w, h) {
        c.fillStyle = kit.ink('--sh-wall'); c.fillRect(0, 0, w, h);
        c.fillStyle = kit.ink('--sh-neon');
        c.font = '400 150px "Righteous"'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText('OPEN', w / 2, h / 2 + 8);
      });
      hang(new T.Mesh(new T.PlaneGeometry(2.4, 0.82), new T.MeshBasicMaterial({ map: open })), at(0, H + 0.75, -0.31));

      // INSIDE: the counter along the back, formica on top and chrome along
      // its lip, the stools in front of it, and the kettle that is always hot.
      var CZ = -4.4;
      box(10, 1.0, 0.7, at(-1, 0.5, CZ), '--sh-wall', 0.012);
      box(10.2, 0.06, 0.86, at(-1, 1.03, CZ + 0.05), '--sh-aqua', 0.01);
      box(10, 0.05, 0.02, at(-1, 0.94, CZ + 0.36), '--sh-chrome', false);
      for (var sx = -5.5; sx <= 3.51; sx += 1.0) {
        cyl(0.04, 0.05, 0.72, at(sx, 0.36, CZ + 0.95), '--sh-chrome', 0.008, 8);
        cyl(0.21, 0.21, 0.08, at(sx, 0.76, CZ + 0.95), '--sh-cherry', 0.01, 18);
        kit.piece(new T.TorusGeometry(0.15, 0.015, 6, 18), at(sx, 0.26, CZ + 0.95, 0, Math.PI / 2), '--sh-chrome', false);
      }
      cyl(0.13, 0.15, 0.24, at(2.6, 1.18, CZ - 0.1), '--sh-chrome', 0.008, 16);
      cyl(0.03, 0.03, 0.12, at(2.75, 1.28, CZ - 0.1, 0, 0, 1.1), '--sh-chrome', false, 8);
      [-3.0, -2.6, 0.4].forEach(function (x) { cyl(0.06, 0.055, 0.12, at(x, 1.12, CZ - 0.15), '--sh-pale', 0.006, 12); });
      // A shelf on the back wall behind it.
      box(9, 0.05, 0.3, at(-1.5, 1.7, BACK + 0.25), '--sh-chrome', 0.008);

      // THE CLOCK OVER THE COUNTER, which has no hands.
      var clk = at(-1.4, 2.45, BACK + 0.12);
      kit.piece(new T.TorusGeometry(0.34, 0.035, 8, 32), clk, '--sh-chrome', 0.01);
      glow(new T.CircleGeometry(0.33, 32), at(-1.4, 2.45, BACK + 0.11), '--sh-glass', 1);
      glow(new T.CircleGeometry(0.03, 12), at(-1.4, 2.45, BACK + 0.115), '--sh-ink', 1);

      // THE BOOTHS along the window: red vinyl either side of a formica table,
      // the table's end against the glass.
      function booth(x) {
        box(0.92, 0.05, 1.1, at(x, 0.74, -0.8), '--sh-aqua', 0.008);
        cyl(0.04, 0.05, 0.72, at(x, 0.37, -0.8), '--sh-chrome', 0.006, 8);
        [-1, 1].forEach(function (s) {
          box(0.5, 0.42, 1.1, at(x + s * 0.82, 0.21, -0.8), '--sh-cherry', 0.01);
          box(0.16, 1.15, 1.1, at(x + s * 1.1, 0.58, -0.8), '--sh-cherry', 0.01);
        });
      }
      booth(bay(0)); booth(bay(1)); booth(bay(2));

      // THE JUKEBOX at the end by the door: red, with a chrome arch.
      var JX = 8.45, JZ = -4.6;
      box(0.66, 1.3, 0.95, at(JX, 0.65, JZ), '--sh-cherry', 0.012);
      kit.piece(new T.CylinderGeometry(0.48, 0.48, 0.66, 20, 1, false, 0, Math.PI), at(JX, 1.3, JZ, 0, 0, Math.PI / 2), '--sh-chrome', 0.01);
      glow(new T.PlaneGeometry(0.7, 0.42), at(JX - 0.34, 1.0, JZ, -Math.PI / 2), '--sh-glass', 1);

      // THE ROOM'S OWN PAGE, out on the lot by the way in, on a board.
      var PGX = -3.4, PGZ = 7.4, PGR = 0.45;
      var pw = 2.3, ph = pw * 800 / 1180;
      box(pw + 0.2, ph + 0.2, 0.06, at(PGX - Math.sin(PGR) * 0.05, 0.5 + ph / 2, PGZ - Math.cos(PGR) * 0.05, PGR), '--sh-wall', 0.01);
      [-1, 1].forEach(function (s) { box(0.06, 0.5, 0.06, at(PGX + Math.cos(PGR) * s * (pw / 2 - 0.1), 0.25, PGZ - Math.sin(PGR) * s * (pw / 2 - 0.1)), '--sh-chrome', 0.01); });
      var page = kit.screen(1180, 800, pw, at(PGX, 0.5 + ph / 2, PGZ, PGR), 'The Small Hours’ own page, on a board in the car park', OUT);

      // A BOARD on the lot, standing in the dark, for words of the page's that
      // are out on the lot on the page too: they bring the lot's own ground.
      function board(x, z, ry, wide, high) {
        box(wide, high, 0.05, at(x - Math.sin(ry) * 0.04, 0.45 + high / 2, z - Math.cos(ry) * 0.04, ry), '--sh-wall', 0.01);
        [-1, 1].forEach(function (s) { box(0.06, 0.45, 0.06, at(x + Math.cos(ry) * s * (wide / 2 - 0.12), 0.22, z - Math.sin(ry) * s * (wide / 2 - 0.12)), '--sh-chrome', 0.01); });
      }

      // OUT ON THE LOT: the page's name and its line, its house rules, and
      // whose this all is.
      var HX = -6.8, HZ = 5.6, HR = 0.7;
      board(HX, HZ, HR, 2.2, 1.1);
      var head = kit.lift(page, '.sh-head', { w: 760, ww: 2.0, drop: '.sh-art', m: at(HX, 0.5, HZ + 0.01, HR), zone: OUT });
      var LX = -6.0, LZ = 8.4, LR = 0.9;
      board(LX, LZ, LR, 2.0, 1.4);
      var lede = kit.lift(page, '.sh-lede', { w: 760, ww: 1.8, m: at(LX, 0.5, LZ + 0.01, LR), zone: OUT });
      var RX = 4.4, RZ = 6.6, RR = -0.55;
      board(RX, RZ, RR, 2.3, 2.1);
      var rules = kit.lift(page, '.sh-part', { n: 0, w: 820, h: 720, ww: 2.1, m: at(RX, 0.5, RZ + 0.01, RR), zone: OUT });
      var WX = 7.6, WZ = 4.0, WR = -1.0;
      board(WX, WZ, WR, 2.0, 1.6);
      var whose = kit.lift(page, '.sh-part', { n: 1, w: 760, ww: 1.8, m: at(WX, 0.5, WZ + 0.01, WR), zone: OUT });

      // IN TWO OF THE WINDOWS, facing the lot: the clock with no hands, and
      // nobody asks why you are up. The other windows show the room.
      var clock = kit.lift(page, '.sh-window', { n: 0, w: 820, h: 640, ww: 2.3, m: at(bay(3), LOW + 0.04, -0.06), zone: OUT });
      var nobody = kit.lift(page, '.sh-window', { n: 1, w: 820, h: 640, ww: 2.3, m: at(bay(4), LOW + 0.04, -0.06), zone: OUT });

      // INSIDE: the menu on the board behind the counter; Up All Night on the
      // back wall by the jukebox, every word of it; the jukebox on the end
      // wall; the placemat and its crayons on the middle booth's table.
      var menu = kit.lift(page, '.sh-window--menu', { w: 820, h: 560, ww: 2.4, m: at(3.4, 1.32, BACK + 0.12), zone: IN });
      var record = kit.lift(page, '.sh-window--record', { w: 820, h: 760, ww: 2.0, m: at(6.9, 0.7, BACK + 0.12), zone: IN });
      var juke = kit.lift(page, '.sh-window--jukebox', { w: 820, h: 700, ww: 2.2, m: at(X1 - 0.12, 0.7, -2.6, -Math.PI / 2), zone: IN });
      var MX = bay(1), MZ = -1.3;
      var mat = kit.lift(page, '.sh-window--mat', { w: 820, h: 900, ww: 1.1, m: at(MX, 0.78, MZ, Math.PI, -1.12), zone: IN });

      kit.wire(page, 'small-hours.js');

      function before(x, z, ry, d, pitch, more) {
        var s = { x: x + Math.sin(ry) * d, z: z + Math.cos(ry) * d, yaw: ry, pitch: pitch || 0 };
        for (var key in more) s[key] = more[key];
        return s;
      }
      var stops = [
        { name: 'out in the dark car park, the diner’s band of window lit all down its side', x: 0, z: 8.8, yaw: 0, pitch: 0.1 },
        before(HX, HZ, HR, 2.4, 0.05, { name: 'at the board on the lot: the diner’s name, and the sign that says it is open', frame: head.el }),
        before(LX, LZ, LR, 2.2, 0.0, { name: 'at the board by it: the last lit thing on the road', frame: lede.el }),
        before(bay(3), -0.06, 0, 2.4, 0.08, { name: 'at a window: the clock over the counter has no hands', frame: clock.el }),
        before(bay(4), -0.06, 0, 2.4, 0.08, { name: 'at the next window: nobody asks why you are up', frame: nobody.el }),
        { name: 'at a window with the booths behind it, looking in', x: bay(1), z: 2.2, yaw: 0, pitch: 0.05 },
        before(RX, RZ, RR, 2.5, 0.05, { name: 'out on the lot: the rules of the house', frame: rules.el }),
        before(WX, WZ, WR, 2.2, 0.0, { name: 'at the board by the door: whose this all is', frame: whose.el }),
        { name: 'at the open door, the light coming out of it onto the tarmac', x: (DOOR0 + DOOR1) / 2, z: 2.4, yaw: 0, pitch: 0.05 },
        before(3.4, BACK + 0.12, 0, 2.6, 0.18, { name: 'at the counter: the menu on the board behind it', frame: menu.el }),
        { name: 'at the quiet end of the counter, furthest from the kitchen and the door', x: -5.2, z: -2.6, yaw: Math.PI / 6, pitch: 0.05 },
        before(MX, MZ, Math.PI, 1.55, -0.5, { name: 'in a booth by the window: a placemat and some crayons', frame: mat.el }),
        before(X1 - 0.12, -2.6, -Math.PI / 2, 2.4, 0.08, { name: 'at the jukebox on the end wall, both albums', frame: juke.el }),
        before(6.9, BACK + 0.12, 0, 2.3, 0.1, { name: 'by the jukebox: Up All Night, and every word of it', frame: record.el }),
        before(PGX, PGZ, PGR, 2.6, 0.03, { name: 'back on the lot by the way in, with the diner’s own page on a board', page: kit.page, frame: page })
      ];

      return {
        start: { x: 0, z: 8.8, yaw: 0 },
        bounds: {
          x: [-9.5, 9.5], z: [-5.6, 10],
          areas: [
            { x: [-9.5, 9.5], z: [0.6, 10] },
            { x: [DOOR0 + 0.25, DOOR1 - 0.25], z: [-0.7, 0.8] },
            { x: [X0 + 0.5, X1 - 0.5], z: [BACK + 0.45, -0.5] }
          ]
        },
        stops: stops
      };
    }
  };
})();

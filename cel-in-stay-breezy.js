/* =============================================================================
   Stay Breezy, walked into on Cel Street, through the door behind Stay Frosty
   at the bottom of Arlesglad Caverns. Ryan's ask, 2026-11-02: the caverns'
   levels, and the room behind the bottom one.

   IT IS STAY FROSTY'S OPPOSITE ON PURPOSE (§64), and the scene keeps it so.
   Frosty is dark, cool and wet, lit by reflections in points, with nothing to
   press and no sound. This is a pale, warm, dry hall full of fans, lit by a
   lamp hung UNDER every ceiling fan, so the blades never pass between you and
   the light and nothing in here flickers. Behind the far wall, through a
   doorway, is a room of your own with its own ceiling fan, its lamp under it
   too, and a table to perch a fan on.

   THE SCENE DRAWS EVERY FAN STILL. Nothing in the scene moves, at any setting.
   What sounds is the page's own: every fan's tile is lifted off it and stands
   on the wall beside the fan it is about, with the hall's panel by the way in,
   and stay-breezy.js is wired to them, so a fan sounds only when somebody
   switches it on, exactly as on the page. Nothing starts on arrival, your
   usual included: it comes back only on Switch on my usual. The tiles' own
   drawings turn their blades as the page does, and stop at Gentle as it does.

   No fan is named for who made it, and none is for sleep, focus or anything
   else. Every colour is one §64 declares, by name. The room's page arrives
   through Cel Street's screen(), and stands by the door you came in by.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['stay-breezy.html'] = {
    name: 'Stay Breezy',
    from: 'stay-frosty.html',
    faces: ['"Comfortaa"'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var X0 = -5.2, X1 = 5.2, NEAR = 3, FAR = -10, H = 4.2;      // the hall
      var RX0 = -2.6, RX1 = 2.6, RFAR = -14, RH = 3.6;            // your room
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2, BACK = Math.PI;
      var HALL = [X0, X1, FAR, NEAR + 1], ROOM = [RX0, RX1, RFAR - 1, FAR];
      function M(a, b) { return new T.Matrix4().multiplyMatrices(a, b); }

      // A PALE, WARM HALL, lit evenly enough from the lamps under its fans that
      // nothing in it is in the dark.
      kit.scene.background = kit.col('--bz-wall');
      kit.scene.add(new T.HemisphereLight(kit.col('--bz-card'), kit.col('--bz-wall'), 1.35));

      // THE HALL: a floor a shade off the walls, the walls, a ceiling.
      box(X1 - X0, 0.1, NEAR - FAR, at(0, -0.05, (NEAR + FAR) / 2), '--bz-card', false, false);
      box(X1 - X0, 0.1, NEAR - FAR, at(0, H + 0.05, (NEAR + FAR) / 2), '--bz-wall', false, false);
      [-1, 1].forEach(function (s) { box(0.2, H, NEAR - FAR, at(s * (X1 + 0.1), H / 2, (NEAR + FAR) / 2), '--bz-wall', 0.01, false); });
      box(X1 - X0, H, 0.2, at(0, H / 2, NEAR + 0.1), '--bz-wall', 0.01, false);
      // The far wall, with the doorway through to your room in the middle.
      [-1, 1].forEach(function (s) {
        var w = (X1 - 0.6);
        box(w, H, 0.2, at(s * (0.6 + w / 2), H / 2, FAR - 0.1), '--bz-wall', 0.01, false);
      });
      box(1.2, H - 2.2, 0.2, at(0, 2.2 + (H - 2.2) / 2, FAR - 0.1), '--bz-wall', 0.01, false);
      [-1, 1].forEach(function (k) { box(0.08, 2.24, 0.26, at(k * 0.64, 1.12, FAR - 0.1), '--bz-ink-2', 0.006); });
      box(1.36, 0.08, 0.26, at(0, 2.24, FAR - 0.1), '--bz-ink-2', 0.006);

      // THE DOOR YOU CAME IN BY, back to Stay Frosty, shut, in a fan card's
      // enamel with an ink frame.
      var DX = -1.0;
      box(0.95, 2.1, 0.06, at(DX, 1.05, NEAR - 0.04), '--bz-card', 0.008);
      [-1, 1].forEach(function (k) { box(0.06, 2.16, 0.1, at(DX + k * 0.5, 1.08, NEAR - 0.04), '--bz-ink', 0.006); });
      box(1.06, 0.06, 0.1, at(DX, 2.16, NEAR - 0.04), '--bz-ink', 0.006);
      box(0.05, 0.2, 0.05, at(DX + 0.33, 1.0, NEAR - 0.1), '--bz-ink-2', 0.004);

      // THE NAME over the doorway through to your room, in Comfortaa as the
      // page sets it, on a card of the hall's own enamel.
      var sign = kit.paper(900, 180, function (c, w, h) {
        c.fillStyle = kit.ink('--bz-card'); c.fillRect(0, 0, w, h);
        c.strokeStyle = kit.ink('--bz-ink'); c.lineWidth = 8; c.strokeRect(6, 6, w - 12, h - 12);
        c.fillStyle = kit.ink('--bz-ink'); c.font = '700 104px "Comfortaa"';
        c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Stay Breezy', w / 2, h / 2 + 4);
      });
      kit.sheet(sign, 2.6, 0.52, at(0, 3.3, FAR + 0.02));

      // A CEILING FAN: a rod down from the ceiling, the motor, five blades in
      // the blades' teal, drawn still, and the lamp hung UNDER the hub, below
      // the blades, with its light below that.
      function ceilingFan(x, y, z, r, lamp) {
        cyl(0.03, 0.03, 0.7, at(x, y - 0.35, z), '--bz-ink', 0.005, 8);
        cyl(0.2 * r, 0.26 * r, 0.22, at(x, y - 0.8, z), '--bz-ink', 0.008, 20);
        for (var b = 0; b < 5; b++) {
          var a = b * Math.PI * 2 / 5 + 0.3;
          box(1.25 * r, 0.025, 0.24 * r, M(at(x, y - 0.86, z, a), at(0.72 * r, 0, 0)), '--bz-blade', 0.006, false);
        }
        cyl(0.06, 0.06, 0.12, at(x, y - 0.98, z), '--bz-ink', 0.004, 12);
        cyl(0.16 * r, 0.1 * r, 0.16, at(x, y - 1.12, z), '--bz-lamp', 0.006, 20);
        var light = new T.PointLight(kit.col('--bz-lamp'), lamp, 12, 1.1);
        light.position.set(x, y - 1.3, z);
        kit.scene.add(light);
      }
      ceilingFan(0, H, -3.6, 1, 7);

      // The air, drawn as it is on the page's hall: still pale lines on the
      // floor running out from a fan, the only way a picture can show it.
      function air(x, z, dir, n) {
        for (var k = 0; k < n; k++) {
          var len = 0.7 + k * 0.15;
          kit.flat(new T.PlaneGeometry(len, 0.035), at(x + dir * (0.45 + len / 2), 0.012, z + (k - (n - 1) / 2) * 0.22, 0, -Math.PI / 2), '--bz-air');
        }
      }
      // A round cage on a fan facing across the hall (dir +1 faces +x): the
      // wire in the cage's grey, the blades a still cross in the teal behind it.
      function cage(x, y, z, r, dir) {
        cyl(r, r, 0.12, at(x, y, z, 0, 0, Math.PI / 2), '--bz-cage', 0.006, 24);
        box(0.02, r * 1.6, r * 0.32, at(x + dir * 0.07, y, z, 0, 0.5), '--bz-blade', 0.004, false);
        box(0.02, r * 1.6, r * 0.32, at(x + dir * 0.07, y, z, 0, -1.07), '--bz-blade', 0.004, false);
        cyl(r * 0.25, r * 0.25, 0.08, at(x + dir * 0.1, y, z, 0, 0, Math.PI / 2), '--bz-ink', 0.004, 12);
      }
      function ribbon(x, y, z) { box(0.01, 0.26, 0.05, at(x, y - 0.13, z), '--bz-ribbon', false, false); }

      // THE FLOOR FANS along the left-hand wall, each facing across the hall,
      // in the page's order, each with its tile on the wall just past it.
      var FX = X0 + 0.7, d = 1;
      function boxFan(z) {
        box(0.16, 0.6, 0.6, at(FX, 0.32, z), '--bz-ink', 0.008);
        box(0.02, 0.5, 0.5, at(FX + 0.09, 0.32, z), '--bz-cage', 0.004, false);
        cage(FX + 0.06, 0.32, z, 0.22, d);
        box(0.06, 0.04, 0.2, at(FX, 0.64, z), '--bz-ink-2', false);
        ribbon(FX + 0.1, 0.56, z + 0.18); air(FX, z, d, 3);
      }
      function pedestal(z) {
        cyl(0.24, 0.26, 0.05, at(FX, 0.025, z), '--bz-ink', 0.006, 20);
        cyl(0.022, 0.022, 1.05, at(FX, 0.55, z), '--bz-ink', 0.004, 8);
        cyl(0.1, 0.12, 0.2, at(FX - 0.1, 1.12, z, 0, 0, Math.PI / 2), '--bz-ink', 0.006, 16);
        cage(FX + 0.04, 1.12, z, 0.24, d);
        ribbon(FX + 0.06, 1.36, z); air(FX, z, d, 3);
      }
      function tower(z) {
        cyl(0.2, 0.2, 0.05, at(FX, 0.025, z), '--bz-ink', 0.006, 20);
        box(0.24, 1.15, 0.24, at(FX, 0.62, z), '--bz-ink', 0.008);
        box(0.02, 0.85, 0.14, at(FX + 0.13, 0.66, z), '--bz-cage', 0.004, false);
        air(FX, z, d, 4);
      }
      function windowFan(z) {
        box(0.5, 0.42, 0.9, at(FX, 0.21, z), '--bz-card', 0.008);
        box(0.16, 0.44, 0.92, at(FX, 0.64, z), '--bz-ink', 0.008);
        cage(FX + 0.04, 0.64, z - 0.22, 0.17, d);
        cage(FX + 0.04, 0.64, z + 0.22, 0.17, d);
        air(FX, z, d, 4);
      }
      function drum(z) {
        [-1, 1].forEach(function (k) {
          box(0.05, 0.55, 0.05, at(FX - 0.05, 0.28, z + k * 0.48), '--bz-ink', 0.004);
          cyl(0.07, 0.07, 0.05, at(FX - 0.05, 0.07, z + k * 0.48, 0, 0, Math.PI / 2), '--bz-ink-2', 0.004, 12);
        });
        cyl(0.48, 0.48, 0.3, at(FX, 0.6, z, 0, 0, Math.PI / 2), '--bz-ink', 0.01, 28);
        cage(FX + 0.12, 0.6, z, 0.42, d);
        ribbon(FX + 0.18, 1.0, z + 0.3); air(FX, z, d, 5);
      }
      var floor = [
        { n: 1, z: 1.2, draw: boxFan, what: 'the box fan' },
        { n: 2, z: -1.0, draw: pedestal, what: 'the oscillating pedestal fan' },
        { n: 3, z: -3.2, draw: tower, what: 'the tower fan' },
        { n: 4, z: -5.4, draw: windowFan, what: 'the twin window fan' },
        { n: 5, z: -7.6, draw: drum, what: 'the drum fan' }
      ];
      floor.forEach(function (f) { f.draw(f.z); });

      // THE TABLE FANS on a long table along the right-hand wall, each facing
      // across the hall the other way.
      var TX = X1 - 0.55, TY = 0.76;
      box(0.7, 0.05, 6.6, at(TX, TY, -3.5), '--bz-card', 0.008, true);
      [[-0.2, -0.2], [-0.2, -6.8], [0.2, -0.2], [0.2, -6.8]].forEach(function (l) {
        box(0.05, TY, 0.05, at(TX + l[0], TY / 2, l[1]), '--bz-ink-2', 0.004);
      });
      function deskFan(x, y, z, dir) {
        cyl(0.12, 0.14, 0.04, at(x, y + 0.02, z), '--bz-ink', 0.004, 16);
        cyl(0.018, 0.018, 0.22, at(x, y + 0.13, z), '--bz-ink', 0.003, 8);
        cyl(0.07, 0.08, 0.12, at(x - dir * 0.08, y + 0.28, z, 0, 0, Math.PI / 2), '--bz-ink', 0.004, 12);
        cage(x + dir * 0.03, y + 0.28, z, 0.16, dir);
        ribbon(x + dir * 0.05, y + 0.44, z);
      }
      function clipFan(x, y, z, dir) {
        box(0.12, 0.05, 0.08, at(x, y + 0.025, z), '--bz-ink-2', 0.004);
        cyl(0.012, 0.012, 0.1, at(x, y + 0.1, z), '--bz-ink', 0.003, 6);
        cage(x + dir * 0.02, y + 0.2, z, 0.1, dir);
      }
      function littleFan(x, y, z, dir) {
        cyl(0.06, 0.07, 0.03, at(x, y + 0.015, z), '--bz-ink', 0.003, 12);
        cyl(0.01, 0.01, 0.08, at(x, y + 0.07, z), '--bz-ink', 0.003, 6);
        cage(x + dir * 0.015, y + 0.15, z, 0.07, dir);
      }
      var table = [
        { n: 6, z: -0.9, draw: deskFan, what: 'the desk fan in a wire cage' },
        { n: 7, z: -3.1, draw: clipFan, what: 'the clip-on fan' },
        { n: 8, z: -5.3, draw: littleFan, what: 'the little fan on a stand' }
      ];
      table.forEach(function (f) { f.draw(TX, TY + 0.025, f.z, -1); });

      // YOUR ROOM, through the doorway: lower, its own ceiling fan with its
      // lamp under it, and a table with the fan you perch on it.
      box(RX1 - RX0, 0.1, FAR - RFAR, at(0, -0.05, (FAR + RFAR) / 2), '--bz-card', false, false);
      box(RX1 - RX0, 0.1, FAR - RFAR, at(0, RH + 0.05, (FAR + RFAR) / 2), '--bz-wall', false, false);
      [-1, 1].forEach(function (s) { box(0.2, RH, FAR - RFAR, at(s * (RX1 + 0.1), RH / 2, (FAR + RFAR) / 2), '--bz-wall', 0.01, false); });
      box(RX1 - RX0, RH, 0.2, at(0, RH / 2, RFAR - 0.1), '--bz-wall', 0.01, false);
      ceilingFan(0, RH, -11.8, 0.7, 4);
      box(1.0, 0.05, 0.6, at(1.5, TY, -12.9), '--bz-card', 0.008, true);
      [[-0.45, -0.25], [-0.45, 0.25], [0.45, -0.25], [0.45, 0.25]].forEach(function (l) {
        box(0.05, TY, 0.05, at(1.5 + l[0], TY / 2, -12.9 + l[1]), '--bz-ink-2', 0.004);
      });
      deskFan(1.5, TY + 0.025, -12.9, -1);
      box(0.5, 0.45, 0.5, at(0.6, 0.225, -12.6), '--bz-card', 0.008, true);

      // THE ROOM'S OWN PAGE, on the wall by the door back to Stay Frosty.
      var pw = 2.2, ph = pw * 800 / 1180, px = 2.4, py = 0.7 + ph / 2;
      box(pw + 0.1, ph + 0.1, 0.04, at(px, py, NEAR - 0.02), '--bz-ink', 0.006, false);
      var frame = kit.screen(1180, 800, pw, at(px, py, NEAR - 0.05, BACK), 'Stay Breezy’s own page, on the wall by the door', HALL);

      // THE PAGE'S OWN TILES AND PANEL, lifted whole, and the page's own script
      // wired to them, so a fan sounds only when it is switched on.
      function onLeft(z, y) { return at(X0 + 0.04, y, z, LEFT); }
      function onRight(z, y) { return at(X1 - 0.04, y, z, RIGHT); }
      floor.forEach(function (f) { f.tile = kit.lift(frame, '.bz-fan', { n: f.n, w: 380, ww: 1.1, m: onLeft(f.z - 1.05, 0.9), zone: HALL }); });
      table.forEach(function (f) { f.tile = kit.lift(frame, '.bz-fan', { n: f.n, w: 380, ww: 1.1, m: onRight(f.z - 1.05, 1.2), zone: HALL }); });
      var big = kit.lift(frame, '.bz-fan', { n: 0, w: 380, ww: 1.1, m: onRight(-8.4, 1.0), zone: HALL });
      var panel = kit.lift(frame, '.bz-panel', { w: 760, ww: 1.7, m: onRight(1.4, 0.9), zone: HALL });
      // The hall's live region, which the script speaks into: the page's own,
      // found by where it is among the page's screen-reader lines.
      kit.lift(frame, '.sr', { get n() {
        try {
          var dd = frame.contentDocument, all = dd.querySelectorAll('.sr');
          return Array.prototype.indexOf.call(all, dd.querySelector('[id="bz-says"]'));
        } catch (e) { return 0; }
      }, w: 400, ww: 0.4, m: onRight(2.6, 0.4) });
      var intro = kit.lift(frame, '.bz-intro', { n: 0, w: 640, ww: 1.0, m: onLeft(2.4, 1.05), zone: HALL });
      var words = kit.lift(frame, '.bz-words', { w: 700, ww: 1.5, m: at(-3.4, 1.0, NEAR - 0.04, BACK), zone: HALL });
      var over = kit.lift(frame, '.bz-over', { w: 700, ww: 1.4, m: at(-3.3, 2.3, FAR + 0.04), zone: HALL });
      var lede = kit.lift(frame, '.lede', { w: 700, ww: 1.6, m: at(-3.3, 1.0, FAR + 0.04), zone: HALL });
      var rules = kit.lift(frame, '.bz-rules', { w: 760, h: 820, ww: 1.75, m: at(3.2, 0.55, FAR + 0.04), zone: HALL });
      var credit = kit.lift(frame, '.bz-credit', { w: 420, ww: 0.62, m: at(1.5, 0.9, FAR + 0.04), zone: HALL });
      var roomFan = kit.lift(frame, '.bz-fan', { n: 9, w: 380, ww: 1.0, m: at(-1.0, 0.8, RFAR + 0.04), zone: ROOM });
      var perch = kit.lift(frame, '.bz-fan', { n: 10, w: 380, ww: 1.0, m: at(1.5, 1.1, RFAR + 0.04), zone: ROOM });
      var roomWords = kit.lift(frame, '.bz-intro', { n: 1, w: 640, ww: 1.1, m: at(RX0 + 0.04, 1.0, -12.0, LEFT), zone: ROOM });
      kit.wire(frame, 'stay-breezy.js');

      var stops = [
        { name: 'just in from Stay Frosty, the hall pale and warm, the big fan overhead with its lamp under it', x: -0.3, z: 2.0, yaw: 0, pitch: 0.1 },
        { name: 'at the hall’s panel, on the right by the way in: how loud the hall is, every fan off, and your usual', x: X1 - 1.9, z: 1.4, yaw: RIGHT, pitch: 0.0, frame: panel.el },
        { name: 'at the floor’s own words, on the left by the way in', x: X0 + 1.7, z: 2.4, yaw: LEFT, pitch: 0.05, frame: intro.el },
        { name: 'turned back to the door, with Ryan’s words on the wall beside it', x: -3.4, z: 0.6, yaw: BACK, pitch: 0.08, frame: words.el }
      ];
      floor.forEach(function (f) {
        stops.push({ name: 'at ' + f.what + ' on the floor, its card on the wall beside it', x: X0 + 1.8, z: f.z - 0.6, yaw: LEFT, pitch: -0.08, frame: f.tile.el });
      });
      table.forEach(function (f) {
        stops.push({ name: 'at ' + f.what + ' on the long table, its card on the wall above it', x: X1 - 1.8, z: f.z - 0.6, yaw: RIGHT, pitch: 0.0, frame: f.tile.el });
      });
      stops.push(
        { name: 'under the big ceiling fan, looking up: its blades still, its lamp hung under them', x: 0, z: -1.6, yaw: 0, pitch: 0.55 },
        { name: 'at the big ceiling fan’s card, on the right-hand wall by the far end', x: X1 - 1.8, z: -8.4, yaw: RIGHT, pitch: 0.02, frame: big.el },
        { name: 'at the far wall, the room’s own name over the doorway and its words on the left', x: -2.2, z: FAR + 2.6, yaw: 0.2, pitch: 0.12, frame: lede.el },
        { name: 'at the house rules on the far wall, right of the doorway', x: 2.6, z: FAR + 2.4, yaw: -0.1, pitch: 0.08, frame: rules.el },
        { name: 'through the doorway, in your own room: its own ceiling fan, and the room’s words on the left', x: 0, z: -10.6, yaw: 0.35, pitch: 0.0, frame: roomWords.el },
        { name: 'at your room’s ceiling fan’s card, on the back wall', x: -1.0, z: -12.3, yaw: 0, pitch: 0.02, frame: roomFan.el },
        { name: 'at your table, with the fan perched on it and its card on the back wall', x: 1.4, z: -11.8, yaw: 0, pitch: 0.0, frame: perch.el },
        { name: 'back by the door to Stay Frosty, with the room’s own page on the wall beside it', x: px, z: 1.0, yaw: BACK, pitch: 0.04, page: kit.page, frame: frame }
      );

      return {
        start: { x: -0.3, z: 2.0, yaw: 0 },
        bounds: { areas: [
          { x: [X0 + 1.0, X1 - 1.1], z: [FAR + 0.6, NEAR - 0.5] },
          { x: [-0.45, 0.45], z: [FAR - 0.8, FAR + 0.8] },
          { x: [RX0 + 0.5, RX1 - 0.5], z: [RFAR + 0.6, FAR - 0.4] }
        ] },
        stops: stops
      };
    }
  };
})();

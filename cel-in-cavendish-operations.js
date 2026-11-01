/* =============================================================================
   The Operations Room, walked into on Cel Street, through its door off the
   hall at Cavendish Coworking. Ryan's ask, 2026-11-01: the rooms behind the
   doors.

   IT IS THE OPERATIONS ROOM'S WORLD AND SHARES NOTHING WITH THE HOUSE IT OPENS
   OFF (§72). The house is green daylight through canvas blinds; this is down
   the steps, a building's plant room with no window in it: near-black
   concrete, a painted band at the foot of every wall, and every main painted
   the colour of what it carries, so anybody can tell which is which without
   opening anything. Water green down the middle under the ceiling, air blue
   along the left-hand wall, gas yellow along the right, and the fire main red
   from the floor to the ceiling at the far end. A brass tag on every valve,
   a gauge on the air main, a tank in the corner.

   THE LIGHT IS ONE CAGED LAMP ON A HOOK, AND ITS CAGE IS IN EVERY SHADOW. The
   one work lamp hangs from the water main in its wire guard, and the guard's
   bars throw a hard grid of shadow lines over the pipes, the walls and the
   floor, fanning out from the bulb: the only light on the street that stripes
   everything it lands on. The stripes are in the light and the shadow only:
   every word lifted off the page stands on its own ground of the room's
   concrete, so no bar's shadow ever crosses a word.

   WHAT IS ON THE WALLS IS THE PAGE'S OWN, lifted off it by the kit: the log,
   clipped to its board on the wall by the door, as the page clips it; why a
   plant room under the air main; the meeting's own line on the far wall; and
   whose words beside the gas main. Nothing is retyped. The room's call is the
   page's and stays on it, which hangs by the door.

   NOTHING MOVES AT ANY SETTING, the lamp included: a swinging bulb is a
   shadow moving across every word in the room. Every colour is one §72
   declares, by name. It keeps nothing, sends nothing and fetches nothing; its
   page arrives through Cel Street's screen().
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['cavendish-operations.html'] = {
    name: 'The Operations Room',
    from: 'cavendish-coworking.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var W = 7, NEAR = 0.8, FAR = -9.2, H = 3.0;          // the room
      var X0 = -W / 2, X1 = W / 2, MIDZ = (NEAR + FAR) / 2, D = NEAR - FAR;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var LX = 0, LY = 1.95, LZ = -4.3;                     // the lamp
      var WATER = 2.62, AIR = 2.45, GAS = 2.4;              // the mains' heights

      // A length of pipe from a to b, in the colour of what it carries.
      function pipe(name, r, a, b, ink) {
        var A = new T.Vector3(a[0], a[1], a[2]), B = new T.Vector3(b[0], b[1], b[2]);
        var span = B.clone().sub(A), mid = A.clone().add(B).multiplyScalar(0.5);
        var g = new T.CylinderGeometry(r, r, span.length(), 14);
        g.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), span.clone().normalize()));
        kit.piece(g, at(mid.x, mid.y, mid.z), name, ink === undefined ? 0.012 : ink, true);
      }
      // An elbow where a pipe turns, a ball of the pipe's own colour.
      function elbow(name, r, x, y, z) {
        kit.piece(new T.SphereGeometry(r * 1.08, 14, 10), at(x, y, z), name, 0.012, true);
      }
      // A flow arrow painted on a main, in the concrete's own colour, the
      // way the page paints them.
      function arrow(r, x, y, z, ry, rx) {
        kit.piece(new T.ConeGeometry(r * 0.5, r * 1.2, 3), at(x, y, z, ry, rx), '--op-concrete', false, false);
      }
      // A valve: its stem, its handwheel, and the brass tag on its chain.
      function valve(x, y, z, face, wheel) {
        cyl(0.025, 0.025, 0.16, at(x, y + 0.08, z), '--op-steel', false, 8);
        kit.piece(new T.TorusGeometry(wheel, 0.018, 6, 20), at(x, y + 0.17, z, face, Math.PI / 2), '--op-steel', false, true);
        [0, Math.PI / 2].forEach(function (s) { box(wheel * 2, 0.014, 0.014, at(x, y + 0.17, z, face + s), '--op-steel', false); });
        box(0.006, 0.18, 0.006, at(x + wheel * 0.7, y + 0.07, z), '--op-brass', false);
        box(0.1, 0.07, 0.008, at(x + wheel * 0.7, y - 0.05, z, face), '--op-brass', 0.006);
      }

      // THE DARK BETWEEN: no daylight, only enough of the steel's colour that
      // the walls can be told from the dark when the lamp's light is barred.
      kit.scene.background = kit.col('--op-concrete');
      kit.scene.add(new T.HemisphereLight(kit.col('--op-steel'), kit.col('--op-concrete'), 0.8));

      // THE ROOM: concrete floor, walls and ceiling, low and close, and the
      // painted band at the foot of every wall.
      box(W, 0.1, D, at(0, -0.05, MIDZ), '--op-concrete', false, false);
      box(W, 0.1, D, at(0, H + 0.05, MIDZ), '--op-concrete', false, false);
      [-1, 1].forEach(function (s) {
        box(0.2, H, D, at(s * (W / 2 + 0.1), H / 2, MIDZ), '--op-concrete', 0.01, false);
        box(0.03, 0.55, D, at(s * (W / 2 - 0.015), 0.275, MIDZ), '--op-wall', false, false);
      });
      box(W, H, 0.2, at(0, H / 2, FAR - 0.1), '--op-concrete', 0.01, false);
      box(W, 0.55, 0.03, at(0, 0.275, FAR + 0.015), '--op-wall', false, false);

      // THE WALL BEHIND YOU, its door at the top of three steps down from the
      // hall, shut, in a steel frame.
      var DX = 1.9, DW = 1.0, DH = 2.1, LAND = 0.45;
      box(DX - DW / 2 - X0, H, 0.2, at((X0 + DX - DW / 2) / 2, H / 2, NEAR + 0.1), '--op-concrete', 0.01, false);
      box(X1 - DX - DW / 2, H, 0.2, at((X1 + DX + DW / 2) / 2, H / 2, NEAR + 0.1), '--op-concrete', 0.01, false);
      box(DW, H - LAND - DH, 0.2, at(DX, (H + LAND + DH) / 2, NEAR + 0.1), '--op-concrete', 0.01, false);
      box(DW, DH, 0.05, at(DX, LAND + DH / 2, NEAR + 0.05), '--op-wall', 0.01, false);
      [-1, 1].forEach(function (e) { box(0.07, DH + 0.07, 0.1, at(DX + e * (DW / 2 + 0.035), LAND + (DH + 0.07) / 2, NEAR), '--op-steel', 0.01); });
      box(DW + 0.14, 0.07, 0.1, at(DX, LAND + DH + 0.035, NEAR), '--op-steel', 0.01);
      box(0.06, 0.06, 0.14, at(DX - DW / 2 + 0.12, LAND + 1.0, NEAR - 0.02), '--op-brass', 0.006);
      box(DW + 0.3, LAND, 0.9, at(DX, LAND / 2, NEAR - 0.45), '--op-concrete', 0.01);
      for (var s = 0; s < 3; s++) {
        var rise = LAND / 3 * (2 - s);
        if (rise > 0) box(DW + 0.3, rise, 0.3, at(DX, rise / 2, NEAR - 0.9 - 0.15 - s * 0.3), '--op-concrete', 0.01);
      }
      box(0.04, 0.04, 1.5, at(DX + DW / 2 + 0.2, LAND + 0.85, NEAR - 0.8), '--op-yellow', 0.006);

      // THE WATER MAIN, green, down the middle under the ceiling, turning at
      // the far end across to the tank in the corner; and the steel hangers
      // that hold it up.
      var TX = -2.3, TZ = -8.15, TR = 0.62, TH = 2.0;
      pipe('--op-green', 0.13, [0, WATER, NEAR - 0.2], [0, WATER, -7.6]);
      elbow('--op-green', 0.13, 0, WATER, -7.6);
      pipe('--op-green', 0.13, [0, WATER, -7.6], [TX, WATER, -7.6]);
      elbow('--op-green', 0.13, TX, WATER, -7.6);
      pipe('--op-green', 0.13, [TX, WATER, -7.6], [TX, WATER, TZ]);
      elbow('--op-green', 0.13, TX, WATER, TZ);
      pipe('--op-green', 0.13, [TX, WATER, TZ], [TX, TH, TZ]);
      [-0.8, -2.8, -6.0].forEach(function (z) {
        box(0.025, H - WATER - 0.12, 0.025, at(0, (H + WATER + 0.12) / 2, z), '--op-steel', false);
        kit.piece(new T.TorusGeometry(0.15, 0.014, 6, 16), at(0, WATER, z), '--op-steel', false, true);
      });
      arrow(0.13, 0, WATER - 0.11, -1.8, 0, -Math.PI / 2);
      arrow(0.13, -1.2, WATER - 0.11, -7.6, LEFT, -Math.PI / 2);

      // THE TANK in the far left-hand corner, steel, standing on its own feet.
      cyl(TR, TR, TH - 0.2, at(TX, 0.2 + (TH - 0.2) / 2, TZ), '--op-steel', 0.014, 24);
      kit.piece(new T.SphereGeometry(TR, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2), at(TX, TH, TZ), '--op-steel', 0.014, true);
      [[0.4, 0.4], [-0.4, 0.4], [0.4, -0.4], [-0.4, -0.4]].forEach(function (f) {
        box(0.08, 0.2, 0.08, at(TX + f[0], 0.1, TZ + f[1]), '--op-steel', 0.008);
      });

      // THE AIR MAIN, blue, along the left-hand wall on its brackets, with a
      // gauge dropped off it.
      var AX = X0 + 0.24;
      pipe('--op-blue', 0.09, [AX, AIR, NEAR - 0.2], [AX, AIR, FAR + 0.3]);
      [-1.0, -3.4, -5.9, -8.2].forEach(function (z) {
        box(0.24, 0.05, 0.05, at(X0 + 0.12, AIR - 0.12, z), '--op-steel', false);
        box(0.04, 0.2, 0.04, at(X0 + 0.04, AIR - 0.04, z), '--op-steel', false);
      });
      arrow(0.09, AX + 0.07, AIR, -6.6, 0, -Math.PI / 2);
      var GZ = -2.3;
      pipe('--op-blue', 0.025, [AX, AIR, GZ], [AX, 1.72, GZ], false);
      cyl(0.17, 0.17, 0.06, at(AX + 0.02, 1.55, GZ, 0, 0, Math.PI / 2), '--op-steel', 0.008, 24);
      kit.flat(new T.CircleGeometry(0.14, 24), at(AX + 0.056, 1.55, GZ, LEFT), '--op-sheet');
      box(0.006, 0.11, 0.012, at(AX + 0.06, 1.58, GZ + 0.03, LEFT, 0, -0.7), '--op-ink', false, false);
      valve(AX, AIR, -7.2, LEFT, 0.12);

      // THE GAS MAIN, yellow, along the right-hand wall, its valve over the
      // log's board.
      var GX = X1 - 0.22;
      pipe('--op-yellow', 0.07, [GX, GAS, NEAR - 0.2], [GX, GAS, FAR + 0.3]);
      [-1.4, -4.0, -6.8, -8.6].forEach(function (z) {
        box(0.22, 0.05, 0.05, at(X1 - 0.11, GAS - 0.1, z), '--op-steel', false);
      });
      arrow(0.07, GX - 0.055, GAS, -5.2, 0, Math.PI / 2);
      valve(GX, GAS, -3.0, RIGHT, 0.1);
      valve(0, WATER, -6.6, 0, 0.17);

      // THE FIRE MAIN, red, from the floor to the ceiling at the far end, with
      // its outlet and wheel at hand height.
      var FX = 2.4, FZ = FAR + 0.24;
      pipe('--op-red', 0.12, [FX, 0, FZ], [FX, H, FZ]);
      pipe('--op-red', 0.07, [FX, 1.2, FZ], [FX, 1.2, FZ + 0.36]);
      kit.piece(new T.TorusGeometry(0.14, 0.02, 6, 20), at(FX, 1.2, FZ + 0.4), '--op-steel', false, true);
      box(0.28, 0.02, 0.02, at(FX, 1.2, FZ + 0.4), '--op-steel', false);
      box(0.02, 0.28, 0.02, at(FX, 1.2, FZ + 0.4), '--op-steel', false);
      arrow(0.12, FX, 2.2, FZ + 0.1, 0, 0);

      // THE ONE LAMP, hung on its cord from the water main, in its cage. The
      // bulb gives off the light and casts nothing; every bar of the cage
      // casts, which is what stripes the room.
      box(0.012, WATER - 0.13 - (LY + 0.16), 0.012, at(LX, (WATER - 0.13 + LY + 0.16) / 2, LZ), '--op-steel', false);
      kit.piece(new T.TorusGeometry(0.04, 0.008, 6, 12), at(LX, WATER - 0.13 - 0.03, LZ, 0, 0, 0), '--op-steel', false, true);
      cyl(0.035, 0.03, 0.08, at(LX, LY + 0.12, LZ), '--op-steel', false, 10);
      kit.flat(new T.SphereGeometry(0.052, 16, 12), at(LX, LY, LZ), '--op-lamp');
      var CR = 0.11, CY0 = LY - 0.12, CY1 = LY + 0.1, BARS = 8;
      [CY0, LY, CY1].forEach(function (y) {
        kit.piece(new T.TorusGeometry(CR, 0.006, 4, 24), at(LX, y, LZ, 0, Math.PI / 2), '--op-steel', false, true);
      });
      for (var b = 0; b < BARS; b++) {
        var a = b / BARS * Math.PI * 2;
        box(0.012, CY1 - CY0, 0.012, at(LX + Math.cos(a) * CR, (CY0 + CY1) / 2, LZ + Math.sin(a) * CR), '--op-steel', false);
      }
      box(CR * 2, 0.01, 0.01, at(LX, CY0, LZ), '--op-steel', false);
      box(0.01, 0.01, CR * 2, at(LX, CY0, LZ), '--op-steel', false);
      var lamp = new T.PointLight(kit.col('--op-lamp'), 22, 16, 1.6);
      lamp.position.set(LX, LY, LZ);
      lamp.castShadow = true;
      lamp.shadow.mapSize.set(1024, 1024);
      lamp.shadow.camera.near = 0.02;
      lamp.shadow.camera.far = 16;
      lamp.shadow.bias = -0.002;
      kit.scene.add(lamp);

      // THE ROOM'S OWN PAGE, on the wall by the door, its call on it.
      var pw = 2.3, ph = pw * 800 / 1180, px = -1.55;
      box(pw + 0.12, ph + 0.12, 0.04, at(px, 0.62 + ph / 2, NEAR - 0.02), '--op-steel', 0.01, false);
      var frame = kit.screen(1180, 800, pw, at(px, 0.62 + ph / 2, NEAR - 0.05, Math.PI), 'The Operations Room’s own page, on the wall by the door');

      // THE LOG, clipped to its board on a nail on the right-hand wall by the
      // door, as the page clips it.
      var CBZ = -1.85;
      box(0.04, 0.9, 1.24, at(X1 - 0.03, 1.19, CBZ), '--op-steel', 0.01, false);
      box(0.06, 0.1, 0.4, at(X1 - 0.06, 1.62, CBZ), '--op-brass', 0.008);
      box(0.02, 0.05, 0.02, at(X1 - 0.03, 1.7, CBZ), '--op-steel', false);
      var log = kit.lift(frame, '.op-part', { n: 0, w: 640, h: 760, ww: 1.1, m: at(X1 - 0.07, 0.82, CBZ, RIGHT) });

      // THE PAGE'S OWN WORDS on the other walls: why a plant room under the air
      // main, the meeting's own line on the far wall between the tank and the
      // fire main, and whose words beside the gas main.
      var why = kit.lift(frame, '.op-part', { n: 2, w: 760, h: 620, ww: 1.8, m: at(X0 + 0.06, 0.85, -4.6, LEFT) });
      var lede = kit.lift(frame, '.lede', { w: 760, h: 360, ww: 2.0, m: at(0.35, 0.95, FAR + 0.06) });
      var whose = kit.lift(frame, '.op-part', { n: 3, w: 760, h: 520, ww: 1.5, m: at(X1 - 0.06, 0.7, -6.4, RIGHT) });

      var stops = [
        { name: 'at the foot of the steps from the hall, the plant room running away from you under its one caged lamp', x: 1.2, z: -1.6, yaw: 0.1, pitch: 0.02 },
        { name: 'under the caged lamp, its cage’s shadow fanning out over the pipes, the walls and the floor', x: 0.9, z: -2.9, yaw: 0.35, pitch: 0.32 },
        { name: 'at the log, clipped to its board on the wall by the door', x: X1 - 1.9, z: CBZ, yaw: RIGHT, pitch: 0.05, frame: log.el },
        { name: 'at the gauge on the air main, the left-hand wall’s blue', x: X0 + 1.6, z: GZ, yaw: LEFT, pitch: 0.12 },
        { name: 'at why a plant room, on the left-hand wall under the air main', x: X0 + 2.1, z: -4.6, yaw: LEFT, pitch: 0.08, frame: why.el },
        { name: 'at the water main’s valve, its brass tag hanging off it, down the middle under the ceiling', x: 0.6, z: -5.4, yaw: 0.2, pitch: 0.42 },
        { name: 'at the far wall, the fire main red from the floor to the ceiling, the tank in the corner and the meeting’s own words between them', x: 0.35, z: -6.6, yaw: 0, pitch: 0.06, frame: lede.el },
        { name: 'at whose words, on the right-hand wall beside the gas main', x: X1 - 1.9, z: -6.4, yaw: RIGHT, pitch: 0.08, frame: whose.el },
        { name: 'back at the door, with the room’s own page on the wall beside it, its call on it', x: px, z: -1.4, yaw: Math.PI, pitch: 0.05, page: kit.page, frame: frame }
      ];

      return {
        start: { x: 1.2, z: -1.6, yaw: 0.1 },
        bounds: { x: [X0 + 0.6, X1 - 0.6], z: [FAR + 0.7, -1.3] },
        stops: stops
      };
    }
  };
})();

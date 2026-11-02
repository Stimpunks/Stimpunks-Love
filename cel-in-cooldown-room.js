/* =============================================================================
   The Cooldown Room, walked into on Cel Street, through the other door in the
   Rebellion Rave Room's ante-chamber. Ryan's ask, 2026-11-01: the rooms down
   the Outskirts' turnings, and the rooms behind them.

   IT IS THE COOLDOWN ROOM'S WORLD AND SHARES NOTHING WITH THE HANGAR IT OPENS
   OFF (§69). The hangar is immense, black, steel and light you can see in the
   air; this is the size of a living room, soft, low and still: couches round
   the walls, an armchair, floor cushions, a low table with cups on it, a water
   cooler in the corner, and the door you came in by shut on the noise.

   IT IS LIT BY THE VENDING MACHINE, one tall, steady, pale panel at the side
   of the room at about the height of your head, its light going OUT across
   the room to the couches, which each get a pale edge on the side that faces
   it. There is no lamp, no flame and no brown. It is not the Doom Scoop's
   cabinet, which lights down into its own tubs, and the glass is not a screen.

   THE MACHINE'S FRONT IS THE PAGE'S OWN MACHINE, lifted off it, every slot
   saying what is in it and how it feels, free, with cooldown.js wired so a
   press drops it in the tray where it stands. It keeps nothing, sends nothing
   and makes no sound, here as on the page. Above the slots, behind the lit
   glass, the snacks stand in their rows in the slots' own inks.

   NOTHING MOVES AT ANY SETTING and nothing makes a sound. Every colour is one
   §69 declares, by name. The room's page arrives through Cel Street's
   screen(), and its words stand on the walls as the page has them.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['cooldown-room.html'] = {
    name: 'The Cooldown Room',
    from: 'rebellion-rave-room.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var X0 = -3, X1 = 3, NEAR = 2.5, FAR = -3.5, H = 2.6;   // the room
      var MIDZ = (NEAR + FAR) / 2, D = NEAR - FAR, W = X1 - X0;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;

      // A soft thing: a box with its corners taken off, in upholstery.
      function soft(w, h, d, m, ink) { box(w, h, d, m, ink, 0.012, true); }
      function M(a, b) { return new T.Matrix4().multiplyMatrices(a, b); }

      // A couch, facing out from its back, with its cushions in the room's
      // sweet inks. Its own front faces +z before it is turned.
      function couch(m, wide, ink, cushions) {
        soft(wide, 0.4, 0.85, M(m, at(0, 0.22, 0)), ink);
        soft(wide, 0.48, 0.24, M(m, at(0, 0.62, -0.33)), ink);
        [-1, 1].forEach(function (k) { soft(0.22, 0.6, 0.85, M(m, at(k * (wide / 2 - 0.11), 0.3, 0)), ink); });
        cushions.forEach(function (c, i) {
          var step = (wide - 0.6) / Math.max(1, cushions.length - 1);
          var cx = cushions.length > 1 ? -(wide - 0.6) / 2 + i * step : 0;
          soft(0.38, 0.32, 0.12, M(m, at(cx, 0.6, -0.17, 0, -0.2)), c);
        });
      }

      // THE DARK: the room's own colour, and only just enough of the
      // upholstery's that a wall can be told from a couch with the light off.
      kit.scene.background = kit.col('--cool-room');
      kit.scene.add(new T.HemisphereLight(kit.col('--cool-couch'), kit.col('--cool-shade'), 0.7));

      // THE ROOM: a floor darker than the walls, low, and close.
      box(W, 0.1, D, at(0, -0.05, MIDZ), '--cool-shade', false, false);
      box(W, 0.1, D, at(0, H + 0.05, MIDZ), '--cool-room', false, false);
      [-1, 1].forEach(function (s) { box(0.2, H, D, at(s * (W / 2 + 0.1), H / 2, MIDZ), '--cool-room', 0.01, false); });
      box(W, H, 0.2, at(0, H / 2, FAR - 0.1), '--cool-room', 0.01, false);
      box(W, H, 0.2, at(0, H / 2, NEAR + 0.1), '--cool-room', 0.01, false);

      // THE DOOR YOU CAME IN BY, back to the ante-chamber, shut on the noise:
      // padded, in the cabinet's steel colour, its handle in the shade.
      var DX = -1.3;
      soft(1.0, 2.05, 0.08, at(DX, 1.025, NEAR - 0.05), '--cool-cabinet');
      [-1, 1].forEach(function (k) { box(0.06, 2.12, 0.1, at(DX + k * 0.53, 1.06, NEAR - 0.04), '--cool-shade', 0.006); });
      box(1.12, 0.06, 0.1, at(DX, 2.12, NEAR - 0.04), '--cool-shade', 0.006);
      box(0.06, 0.24, 0.06, at(DX + 0.36, 1.0, NEAR - 0.12), '--cool-shade', 0.006);

      // THE MACHINE, on the right-hand wall: a dark cabinet with its glass at
      // head height, lit, and the snacks in their rows behind it in the slots'
      // own inks, A1 to C4 as the page has them.
      var MZ = -0.7, MX = X1 - 0.4, MF = X1 - 0.8;
      var face = function (x, y, z) { return at(x, y, z, RIGHT); };
      box(1.5, 2.2, 0.8, face(MX, 1.1, MZ), '--cool-cabinet', 0.014, true);
      kit.flat(new T.PlaneGeometry(1.16, 0.78), face(MF - 0.005, 1.68, MZ), '--cool-glass');
      var inks = ['--cool-lilac', '--cool-sky', '--cool-mint', '--cool-butter',
                  '--cool-rose', '--cool-coral', '--cool-butter', '--cool-sky',
                  '--cool-coral', '--cool-rose', '--cool-mint', '--cool-lilac'];
      inks.forEach(function (ink, i) {
        var row = Math.floor(i / 4), col = i % 4;
        var z = MZ - 0.42 + col * 0.28, y = 1.94 - row * 0.25;
        kit.flat(new T.PlaneGeometry(0.17, 0.17), face(MF - 0.02, y, z), ink);
        box(0.012, 0.012, 0.22, at(MF - 0.03, y - 0.11, MZ), '--cool-ink-2', false, false);
      });
      // Its light: steady, pale, out across the room from the glass, so every
      // couch has a pale edge on the side that faces it.
      var spill = new T.SpotLight(kit.col('--cool-glass'), 60, 12, 1.1, 0.85, 1.2);
      spill.position.set(MF - 0.1, 1.68, MZ);
      spill.target.position.set(X0, 0.5, MZ);
      spill.castShadow = true;
      spill.shadow.mapSize.set(1024, 1024);
      spill.shadow.bias = -0.002;
      kit.scene.add(spill); kit.scene.add(spill.target);
      var glow = new T.PointLight(kit.col('--cool-glass'), 3, 3.2, 1.6);
      glow.position.set(MF - 0.35, 1.6, MZ);
      kit.scene.add(glow);

      // THE COUCHES: a long one along the left-hand wall facing the machine,
      // an armchair under the far wall's words, and floor cushions.
      couch(at(X0 + 0.5, 0, -0.7, LEFT), 2.1, '--cool-couch', ['--cool-coral', '--cool-mint', '--cool-lilac']);
      couch(at(0.15, 0, FAR + 0.55, 0.45), 1.05, '--cool-couch', ['--cool-butter']);
      [[0.55, 0.9, '--cool-mint'], [1.15, 1.45, '--cool-lilac'], [-0.1, 1.55, '--cool-rose']].forEach(function (c) {
        cyl(0.34, 0.36, 0.2, at(c[0], 0.1, c[1]), c[2], 0.01, 24);
      });

      // THE LOW TABLE between the couch and the machine, with cups of cold
      // water on it.
      box(1.1, 0.06, 0.55, at(-1.2, 0.4, -0.7), '--cool-cabinet', 0.008, true);
      [[-1.6, -0.9], [-0.8, -0.9], [-1.6, -0.5], [-0.8, -0.5]].forEach(function (l) {
        box(0.05, 0.37, 0.05, at(l[0], 0.185, l[1]), '--cool-cabinet', 0.006);
      });
      [[-1.42, -0.62], [-1.12, -0.82]].forEach(function (c) {
        cyl(0.04, 0.035, 0.1, at(c[0], 0.48, c[1]), '--cool-sky', 0.004, 12);
      });

      // THE WATER COOLER in the far right-hand corner, its bottle the sky ink.
      cyl(0.17, 0.17, 0.95, at(X1 - 0.35, 0.475, FAR + 0.35), '--cool-cabinet', 0.01, 16);
      cyl(0.15, 0.15, 0.42, at(X1 - 0.35, 1.16, FAR + 0.35), '--cool-sky', 0.008, 16);
      box(0.08, 0.06, 0.06, at(X1 - 0.35, 0.78, FAR + 0.53), '--cool-shade', false);

      // THE ROOM'S OWN PAGE on the wall by the door.
      var pw = 2.0, ph = pw * 800 / 1180, px = 1.2;
      box(pw + 0.1, ph + 0.1, 0.04, at(px, 0.7 + ph / 2, NEAR - 0.02), '--cool-cabinet', 0.008, false);
      var frame = kit.screen(1180, 800, pw, at(px, 0.7 + ph / 2, NEAR - 0.05, Math.PI), 'The Cooldown Room’s own page, on the wall by the door');

      // THE MACHINE'S FRONT, lifted off the page whole: every slot, the
      // readout and the tray; and the room's own wiring to work it.
      var machine = kit.lift(frame, '.cool-machine', { w: 980, h: 800, ww: 1.36, m: face(MF - 0.02, 0.12, MZ) });
      kit.wire(frame, 'cooldown.js');

      // THE PAGE'S OWN WORDS on the walls, as the page has them.
      var head = kit.lift(frame, '.cool-head', { w: 900, ww: 1.7, m: at(0.15, 1.12, FAR + 0.04), drop: '.cool-head__art' });
      var lede = kit.lift(frame, '.lede', { w: 760, ww: 1.6, m: at(X0 + 0.04, 1.05, -0.7, LEFT) });
      var light = kit.lift(frame, '.cool-panel', { n: 0, w: 760, h: 560, ww: 1.2, m: face(X1 - 0.04, 0.55, FAR + 0.95) });
      var how = kit.lift(frame, '.cool-prose', { n: 0, w: 640, ww: 1.0, m: face(X1 - 0.04, 0.9, 0.95) });
      var water = kit.lift(frame, '.cool-panel', { n: 1, w: 640, h: 520, ww: 0.95, m: at(1.6, 0.95, FAR + 0.04) });
      var rules = kit.lift(frame, '.cool-panel', { n: 2, w: 760, h: 620, ww: 1.25, m: at(X0 + 0.04, 0.6, 1.55, LEFT) });
      var whose = kit.lift(frame, '.cool-panel', { n: 3, w: 640, h: 520, ww: 0.95, m: at(-1.95, 0.95, FAR + 0.04) });

      var stops = [
        { name: 'just in from the ante-chamber, the door shut behind you and the machine’s light across the room', x: -0.6, z: 1.7, yaw: -0.35, pitch: 0.02 },
        { name: 'at the machine, every slot saying what is in it and how it feels, all of it free', x: MF - 1.35, z: MZ, yaw: RIGHT, pitch: -0.18, frame: machine.el },
        { name: 'at the machine’s glass, the snacks in their rows behind it, lit', x: MF - 1.1, z: MZ, yaw: RIGHT, pitch: 0.12 },
        { name: 'at the light in here, on the right-hand wall past the machine', x: X1 - 1.6, z: FAR + 0.95, yaw: RIGHT, pitch: 0.02, frame: light.el },
        { name: 'at how the machine works, on the right-hand wall nearer the door', x: X1 - 1.5, z: 0.95, yaw: RIGHT, pitch: 0.06, frame: how.el },
        { name: 'on the couch along the left-hand wall, its pale edge to the machine, its words above it', x: X0 + 1.9, z: -0.7, yaw: LEFT, pitch: 0.12, frame: lede.el },
        { name: 'at the far wall, the room’s own name over the armchair', x: 0.15, z: FAR + 2.1, yaw: 0, pitch: 0.12, frame: head.el },
        { name: 'at the water cooler in the corner, and water on the far wall', x: 1.6, z: FAR + 1.6, yaw: 0, pitch: 0.06, frame: water.el },
        { name: 'at whose this all is, on the far wall at the left', x: -1.95, z: FAR + 1.6, yaw: 0, pitch: 0.06, frame: whose.el },
        { name: 'at the house rules, on the left-hand wall by the door', x: X0 + 1.7, z: 1.55, yaw: LEFT, pitch: 0.04, frame: rules.el },
        { name: 'back at the door to the ante-chamber, with the room’s own page on the wall beside it', x: px, z: 0.6, yaw: Math.PI, pitch: 0.04, page: kit.page, frame: frame }
      ];

      return {
        start: { x: -0.6, z: 1.7, yaw: -0.35 },
        bounds: { x: [X0 + 0.7, X1 - 1.0], z: [FAR + 0.6, NEAR - 0.6] },
        stops: stops
      };
    }
  };
})();

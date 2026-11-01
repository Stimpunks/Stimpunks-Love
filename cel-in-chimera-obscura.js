/* =============================================================================
   Chimera Obscura, walked into on Cel Street. Ryan's ask, 2026-10-31: down the
   street a room at a time.

   IT IS A CAMERA OBSCURA (§120): a room painted matte black inside, so that
   the only light in it comes down through one lens in the roof and lands on a
   round white table, and the chimera is the picture it makes there. So the
   lens is the room's one light, straight down, and its pool falls off before
   the table's rim, the way the page's own disc goes from the table's white to
   its edge and into the dark. THE EDITORIAL ROOM is the one to watch, a dark
   room round one lit white surface too: there the light comes up through the
   table, flat and even to its edge, with no picture in it. Here it comes down,
   it is the picture, and the rim stays dark. No shaft of light is drawn in the
   air, which is the Rabbit Hole's; nothing of the Bodymind Booth's or the
   Dress-Up Den's (no curtain, no strip lights, no crystal, no lavender).

   THE PICTURE ON THE TABLE IS THE PAGE'S OWN, lifted off it as chimera.js drew
   it there, and laid flat in the pool. The bench where a chimera is made stays
   on the room's own page on its wall, because chimera-obscura.js keeps a
   chimera in somebody's Profile over the CB and familiar.js keeps a familiar:
   neither is run here. Becky Hicks's chimeras hang on that page's wall, where
   she said yes to them, and are neither lifted nor drawn here. The room's own
   words (what it is, can't find it, the house rules) are lifted as they are.

   NOTHING MOVES and nothing makes a sound. Every colour is one §120 declares,
   by name. Nobody is counted, there is no quiz, and nothing calls a chimera
   anything less than whole. It keeps nothing, sends nothing and fetches
   nothing; its page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['chimera-obscura.html'] = {
    name: 'Chimera Obscura',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var W = 11, D = 11, H = 4.4, back = -D;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var TX = 0, TZ = -5.6, TOP = 0.95, R = 1.35;

      // MATTE BLACK, and only enough of the pool thrown back off the black for
      // the room's edges to be found; the lens is the light.
      kit.scene.background = kit.col('--chm-room');
      kit.scene.add(new T.HemisphereLight(kit.col('--chm-line'), kit.col('--chm-room'), 0.55));
      var lens = new T.SpotLight(kit.col('--chm-table'), 60, 8, Math.atan(1.0 / (H - TOP)), 0.75, 1.1);
      lens.position.set(TX, H - 0.15, TZ);
      lens.target.position.set(TX, 0, TZ);
      lens.castShadow = true;
      lens.shadow.mapSize.set(1024, 1024);
      lens.shadow.bias = -0.0008; lens.shadow.normalBias = 0.02;
      kit.scene.add(lens, lens.target);

      // THE ROOM: floor, four black walls, the black ceiling, the shut door
      // behind you with its brass handle.
      box(W, 0.1, D + 0.4, at(0, -0.05, -D / 2), '--chm-plinth', false, false);
      box(0.3, H, D, at(-W / 2 - 0.15, H / 2, -D / 2), '--chm-room');
      box(0.3, H, D, at(W / 2 + 0.15, H / 2, -D / 2), '--chm-room');
      box(W + 0.6, H, 0.3, at(0, H / 2, back - 0.15), '--chm-room');
      box(W + 0.6, H, 0.3, at(0, H / 2, 0.15), '--chm-room');
      box(W + 0.6, 0.2, D + 0.6, at(0, H + 0.1, -D / 2), '--chm-room', false, false);
      box(1.1, 2.3, 0.08, at(0, 1.15, -0.04), '--chm-plinth');
      cyl(0.03, 0.03, 0.16, at(0.4, 1.1, -0.13, 0, Math.PI / 2), '--chm-brass', false, 10);
      [[-W / 2 + 0.02, -D / 2, LEFT, D], [W / 2 - 0.02, -D / 2, RIGHT, D], [0, back + 0.02, 0, W], [0, -0.02, Math.PI, W]].forEach(function (w) {
        box(w[3], 0.16, 0.04, at(w[0], 0.08, w[1], w[2]), '--chm-rail', false);
      });

      // THE LENS IN THE ROOF: a brass housing, the glass in it, and the crank
      // that turns it hanging down beside it, still.
      cyl(0.42, 0.48, 0.3, at(TX, H - 0.05, TZ), '--chm-brass', 0.02, 28);
      kit.flat(new T.CircleGeometry(0.3, 32), at(TX, H - 0.21, TZ, 0, Math.PI / 2), '--chm-table');
      cyl(0.02, 0.02, 1.3, at(TX + 0.62, H - 0.7, TZ), '--chm-brass', false, 8);
      kit.piece(new T.TorusGeometry(0.16, 0.025, 8, 24), at(TX + 0.62, H - 1.38, TZ, 0, 0, 0), '--chm-brass', 0.01);
      box(0.32, 0.03, 0.03, at(TX + 0.62, H - 1.38, TZ), '--chm-brass', false);

      // THE ROUND WHITE TABLE on its dark pedestal: the table's edge colour
      // under all of it, its white only where the picture falls, the way the
      // page's own disc goes from white to its edge to the dark.
      cyl(0.32, 0.5, TOP - 0.06, at(TX, (TOP - 0.06) / 2, TZ), '--chm-plinth', 0.02, 24);
      cyl(R, R, 0.06, at(TX, TOP - 0.03, TZ), '--chm-edge', 0.015, 48);
      kit.flat(new T.CircleGeometry(R * 0.78, 48), at(TX, TOP + 0.002, TZ, 0, -Math.PI / 2), '--chm-table');

      // The viewing rail round it, with its opening on your side.
      var RR = 2.25, RH = 1.0;
      kit.piece(new T.TorusGeometry(RR, 0.035, 8, 64, Math.PI * 2 - 0.9), at(TX, RH, TZ, 0, Math.PI / 2, Math.PI / 2 + 0.45), '--chm-rail', false);
      for (var k = 0; k < 12; k++) {
        var a = Math.PI / 2 + 0.45 + k * (Math.PI * 2 - 0.9) / 11;
        cyl(0.025, 0.025, RH, at(TX + Math.cos(a) * RR, RH / 2, TZ + Math.sin(a) * RR), '--chm-rail', false, 8);
      }

      // THE ROOM'S OWN PAGE on the left-hand wall: the bench, and Becky Hicks's
      // chimeras on its wall, where they hang.
      var pw = 3.4, ph = pw * 800 / 1180, py = 1.05 + ph / 2;
      var pg = at(-W / 2 + 0.02, 0, -5.6, LEFT);
      box(pw + 0.2, ph + 0.2, 0.06, M(pg, at(0, py, 0)), '--chm-brass', false);
      var frame = kit.screen(1180, 800, pw, M(pg, at(0, py, 0.05)), 'Chimera Obscura’s own page, with the bench and the wall, on the left-hand wall');

      // The picture: the page's own chimera, as chimera.js drew it on the
      // page's table, laid flat in the pool.
      var picW = 1.8;
      kit.lift(frame, '.chm-disc__draw', { bare: true, w: 400, ww: picW, m: at(TX, TOP + 0.006, TZ + picW * 460 / 400 / 2, 0, -Math.PI / 2) });

      // The room's own words, lifted as they are: what it is on the right-hand
      // wall, can't find it beside it, the house rules on the back wall.
      var lede = kit.lift(frame, '.chm-lede', { w: 620, ww: 1.9, m: at(W / 2 - 0.03, 1.2, -3.0, RIGHT) });
      var find = kit.lift(frame, '.chm-part', { n: 2, w: 640, h: 700, ww: 2.1, m: at(W / 2 - 0.03, 0.8, -7.6, RIGHT) });
      var rules = kit.lift(frame, '.chm-part', { n: 3, w: 680, h: 720, ww: 2.2, m: at(0, 0.9, back + 0.03) });

      var stops = [
        { name: 'just inside the door, the table lit in the dark and nothing else', x: 0, z: -1.0, yaw: 0, pitch: -0.12 },
        { name: 'at the rail, the chimera the picture on the table', x: TX, z: TZ + 2.0, yaw: 0, pitch: -0.62 },
        { name: 'under the lens, looking up at it in the roof', x: TX, z: TZ + 2.4, yaw: 0, pitch: 0.7 },
        { name: 'at the left-hand wall, with the room’s own page, the bench and the wall on it', x: -W / 2 + 3.2, z: -5.6, yaw: LEFT, page: kit.page, frame: frame },
        { name: 'at the right-hand wall, with what the room is', x: W / 2 - 1.9, z: -3.0, yaw: RIGHT, frame: lede.el },
        { name: 'at the right-hand wall, with what to do if your animal is not on the shelf', x: W / 2 - 2.0, z: -7.6, yaw: RIGHT, frame: find.el },
        { name: 'at the back wall, with the house rules', x: 0, z: back + 2.4, yaw: 0, frame: rules.el },
        { name: 'looking back at the door, the black all round it', x: 0, z: -8.6, yaw: Math.PI }
      ];

      return {
        start: { x: 0, z: -1.0, yaw: 0 },
        bounds: { x: [-W / 2 + 0.8, W / 2 - 0.8], z: [back + 0.9, -0.6] },
        stops: stops
      };
    }
  };
})();

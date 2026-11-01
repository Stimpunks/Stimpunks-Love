/* =============================================================================
   The Lightbulb Picture House, walked into on Cel Street. Ryan's ask,
   2026-10-31: back on the street, working down it a room at a time.

   IT IS THE PICTURE HOUSE'S WORLD AND NOBODY ELSE'S (§42): an auditorium where
   every screening is a relaxed screening, so THE HOUSE LIGHTS STAY UP. It is
   lit all over by bare bulbs in brass sconces down both walls, steady, so the
   ground is lit velvet, red and never black, and THERE IS NO PROJECTOR BEAM,
   because a beam only shows in the dark. LAUGHINGSTOCK, one door along and
   also red, is the room to watch: that is a dark house with one spot from
   behind you onto brick; this is a lit house with many small sources and
   velvet, and nothing in it stands in a pool.

   NOTHING IN THIS BUILDING IS BLUE, which the page says in as many words: no
   blue or cyan in the sky, the lights or any material, every colour one the
   room declares (--lph-*), by name. Over the first screen is the gold infinity,
   never the rainbow one, and there is no puzzle piece anywhere in the place.

   THE SCREENS AND THE RACKS ARE THE PAGE'S OWN, lifted off it by the kit:
   Screen One on the far wall under its curtains, Screens Two and Three on the
   side walls, and each one's rack of cards beside it, scrolling, every card
   saying how long its film runs and what is in it before the press. rack.js,
   which the page loads, plays them here as it does there: a card plays where it
   hangs or goes up on its own screen, and nothing reaches YouTube until
   somebody presses. The seats have room between them and across the aisle;
   nothing is ranked.

   NOTHING MOVES and nothing sounds until a press. It keeps nothing, sends
   nothing and fetches nothing; its page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['lightbulb-picture-house.html'] = {
    name: 'The Lightbulb Picture House',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var W = 14, D = 22, H = 7.0, back = -D;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;

      // THE HOUSE LIGHTS, UP: a warm fill from everywhere, and the bulbs down
      // both walls, steady. No spot and no beam.
      kit.scene.background = kit.col('--lph-deep');
      kit.scene.add(new T.HemisphereLight(kit.col('--lph-bulb'), kit.col('--lph-velvet'), 1.5));
      var sun = new T.DirectionalLight(kit.col('--lph-bulb'), 0.6);
      sun.position.set(2, 12, 4); sun.target.position.set(0, 0, -10);
      kit.scene.add(sun, sun.target);

      // THE AUDITORIUM: velvet walls, a deep floor, a ceiling with gilt ribs.
      box(W, 0.1, D + 2, at(0, -0.05, -D / 2 + 1), '--lph-deep', false, false);
      box(W + 0.6, 0.2, D + 2, at(0, H + 0.1, -D / 2 + 1), '--lph-velvet', false, false);
      for (var r = 0; r < 7; r++) box(W, 0.08, 0.14, at(0, H - 0.04, -1.5 - r * 3.2), '--lph-gold', false, false);
      box(0.3, H, D + 2, at(-W / 2 - 0.15, H / 2, -D / 2 + 1), '--lph-velvet');
      box(0.3, H, D + 2, at(W / 2 + 0.15, H / 2, -D / 2 + 1), '--lph-velvet');
      box(W + 0.6, H, 0.3, at(0, H / 2, back - 0.15), '--lph-velvet');
      // A gilt dado down both walls.
      [-1, 1].forEach(function (s) { box(0.06, 0.08, D, at(s * (W / 2 - 0.03), 1.05, -D / 2), '--lph-gold', false, false); });
      // The way in, behind you.
      box((W - 2.6) / 2, H, 0.3, at(-(W + 2.6) / 4, H / 2, 1.15), '--lph-velvet');
      box((W - 2.6) / 2, H, 0.3, at((W + 2.6) / 4, H / 2, 1.15), '--lph-velvet');
      box(2.6, H - 2.5, 0.3, at(0, 2.5 + (H - 2.5) / 2, 1.15), '--lph-velvet');
      box(2.8, 0.1, 0.36, at(0, 2.5, 1.0), '--lph-brass', false);

      // THE SCONCES: a brass plate, a short arm and a bare bulb, down both
      // walls, every one lit, and a light behind every other one.
      var lit = 0;
      for (var z = -2.4; z > back + 1; z -= 3.0) {
        [-1, 1].forEach(function (s) {
          var x = s * (W / 2 - 0.04);
          box(0.04, 0.42, 0.26, at(x, 3.2, z), '--lph-brass', 0.01);
          box(0.3, 0.05, 0.05, at(x - s * 0.15, 3.2, z), '--lph-brass', false);
          kit.flat(new T.SphereGeometry(0.11, 12, 8), at(x - s * 0.32, 3.32, z), '--lph-bulb');
          if (lit++ % 2 === 0) {
            var b = new T.PointLight(kit.col('--lph-bulb'), 4, 9, 1.4);
            b.position.set(x - s * 0.5, 3.3, z);
            kit.scene.add(b);
          }
        });
      }

      // SCREEN ONE on the far wall, under velvet curtains drawn back and a gilt
      // pelmet, the gold infinity over it.
      var S1X = -1.6, S1W = 5.2;
      [-1, 1].forEach(function (s) {
        for (var f = 0; f < 4; f++) {
          cyl(0.16, 0.2, H - 0.9, at(S1X + s * (S1W / 2 + 0.25 + f * 0.24), (H - 0.9) / 2, back + 0.3 + (f % 2) * 0.08), f % 2 ? '--lph-fold' : '--lph-velvet', 0.012, 10);
        }
      });
      box(S1W + 2.4, 0.5, 0.3, at(S1X, H - 0.3, back + 0.35), '--lph-velvet');
      box(S1W + 2.4, 0.06, 0.34, at(S1X, H - 0.55, back + 0.36), '--lph-gold', false);
      var pts = [];
      for (var t = 0; t <= 64; t++) {
        var a = t / 64 * Math.PI * 2, d = 1 + Math.sin(a) * Math.sin(a);
        pts.push(new T.Vector3(S1X + 0.95 * Math.cos(a) / d, H - 1.15 + 0.95 * Math.sin(a) * Math.cos(a) / d * 0.9, back + 0.55));
      }
      kit.piece(new T.TubeGeometry(new T.CatmullRomCurve3(pts, true), 96, 0.05, 8, true), new T.Matrix4(), '--lph-gold', false);

      // THE SEATS: rows of velvet seats facing Screen One, with room between
      // the rows and an aisle down the middle, and the floor round the edges
      // left clear for anybody who would rather sit on it.
      for (var row = 0; row < 6; row++) {
        var rz = -7.2 - row * 1.6;
        [-1, 1].forEach(function (s) {
          for (var c = 0; c < 4; c++) {
            var sx = s * (1.0 + c * 0.82);
            box(0.62, 0.12, 0.56, at(sx, 0.46, rz), '--lph-deep', 0.012);
            box(0.62, 0.62, 0.12, at(sx, 0.78, rz + 0.3), '--lph-deep', 0.012);
            box(0.06, 0.28, 0.5, at(sx + 0.34, 0.62, rz), '--lph-brass', false);
          }
        });
      }

      // THE ROOM'S OWN PAGE on the right-hand wall by the way in.
      var pw = 2.6, ph = pw * 800 / 1180, py = 1.2 + ph / 2;
      box(0.06, ph + 0.18, pw + 0.18, at(W / 2 - 0.03, py, -3.2), '--lph-brass');
      var frame = kit.screen(1180, 800, pw, at(W / 2 - 0.08, py, -3.2, RIGHT), 'The Lightbulb Picture House’s own page, on the wall by the way in');

      // The screens and their racks, lifted off the page once it has loaded.
      var one = kit.lift(frame, '.lph-part.lph-screen', { n: 0, w: 900, ww: S1W - 0.6, m: at(S1X, 0.35, back + 0.32) });
      var rackOne = kit.lift(frame, '.lph-fold', { n: 0, w: 900, h: 900, ww: 2.6, m: at(4.9, 0.45, back + 0.32) });
      var two = kit.lift(frame, '.lph-part.lph-screen', { n: 1, w: 900, ww: 3.6, m: at(-W / 2 + 0.05, 0.9, -15.4, LEFT) });
      var rackTwo = kit.lift(frame, '.lph-fold', { n: 1, w: 900, h: 900, ww: 2.6, m: at(-W / 2 + 0.05, 0.6, -10.8, LEFT) });
      var three = kit.lift(frame, '.lph-part.lph-screen', { n: 2, w: 900, ww: 3.6, m: at(W / 2 - 0.05, 0.9, -15.4, RIGHT) });
      var rackThree = kit.lift(frame, '.lph-fold', { n: 2, w: 900, h: 900, ww: 2.6, m: at(W / 2 - 0.05, 0.6, -10.8, RIGHT) });
      var rules = kit.lift(frame, '.lph-part', { n: 0, w: 900, h: 920, ww: 2.4, m: at(-W / 2 + 0.05, 0.6, -4.2, LEFT) });
      kit.wire(frame, 'rack.js');

      return {
        start: { x: 0, z: -0.4, yaw: 0 },
        bounds: { x: [-W / 2 + 1.0, W / 2 - 1.0], z: [back + 2.2, 0.3] },
        stops: [
          { name: 'just inside, with the house lights up', x: 0, z: -0.4, yaw: 0 },
          { name: 'in the aisle between the seats, with room to stretch out', x: 0, z: -11.0, yaw: 0, pitch: 0.16 },
          { name: 'at Screen One, under the gold infinity', x: S1X, z: back + 5.6, yaw: 0, pitch: 0.24, frame: one.el },
          { name: 'at Screen One’s rack, every card saying how long and what is in it', x: 4.9, z: back + 3.4, yaw: 0, pitch: 0.12, frame: rackOne.el },
          { name: 'at Screen Two on the left-hand wall', x: -W / 2 + 4.0, z: -15.4, yaw: LEFT, pitch: 0.24, frame: two.el },
          { name: 'at Screen Two’s rack', x: -W / 2 + 3.2, z: -10.8, yaw: LEFT, pitch: 0.1, frame: rackTwo.el },
          { name: 'at Screen Three on the right-hand wall, the campfire screen', x: W / 2 - 4.0, z: -15.4, yaw: RIGHT, pitch: 0.24, frame: three.el },
          { name: 'at the campfire rack', x: W / 2 - 3.2, z: -10.8, yaw: RIGHT, pitch: 0.1, frame: rackThree.el },
          { name: 'at the house rules, every screening a relaxed screening', x: -W / 2 + 2.9, z: -4.2, yaw: LEFT, pitch: 0.1, frame: rules.el },
          { name: 'at the wall by the way in, with the picture house’s own page on it', x: W / 2 - 2.8, z: -3.2, yaw: RIGHT, page: kit.page, frame: frame }
        ]
      };
    }
  };
})();

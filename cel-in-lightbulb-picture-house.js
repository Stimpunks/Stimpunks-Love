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
   nothing is ranked. The floor is level all the way, two rows leave their
   wall seat out for a wheelchair, the ear defenders hang on the seat in the
   second row as the house rules say, and there is somewhere to step out to
   without leaving: long sofas against the back wall, and cushions on the
   floor at the front. The chandelier is bare bulbs too, and steady.

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
      // Where the page, the screens, the racks and the rules hang on the
      // walls: side, and the stretch of wall from nearer to further.
      var BEHIND = [[1, -1.6, -4.8], [-1, -2.8, -5.6], [-1, -9.3, -12.3], [1, -9.3, -12.3], [-1, -13.4, -17.4], [1, -13.4, -17.4]];
      // A gilt dado down both walls, with the wainscot under it in panels
      // of the lighter fold, each framed in gilt beading, and between the
      // sconces a velvet pilaster up to a gilt cornice under the ceiling.
      [-1, 1].forEach(function (s) {
        var wx = s * (W / 2 - 0.03);
        box(0.06, 0.08, D, at(wx, 1.05, -D / 2), '--lph-gold', false, false);
        box(0.08, 0.12, D, at(wx - s * 0.01, 0.06, -D / 2), '--lph-gold', false, false);
        box(0.12, 0.3, D, at(s * (W / 2 - 0.06), H - 0.15, -D / 2), '--lph-gold', 0.01, false);
        box(0.2, 0.12, D, at(s * (W / 2 - 0.1), H - 0.36, -D / 2), '--lph-brass', false, false);
        for (var pz = -1.0; pz > back + 1.4; pz -= 1.5) {
          box(0.04, 0.68, 1.16, at(s * (W / 2 - 0.02), 0.56, pz - 0.75), '--lph-fold', false, false);
          [[0, 0.24, 0.6], [0, 0.88, 0.6]].forEach(function (b) { box(0.05, 0.03, 1.16, at(s * (W / 2 - 0.04), b[1], pz - 0.75), '--lph-gold', false, false); });
          [-0.58, 0.58].forEach(function (o) { box(0.05, 0.67, 0.03, at(s * (W / 2 - 0.04), 0.56, pz - 0.75 + o), '--lph-gold', false, false); });
        }
        for (var qz = -0.9; qz > back + 1; qz -= 3.0) {
          // No pilaster stands behind a page, a screen or a rack.
          if (BEHIND.some(function (r) { return r[0] === s && qz < r[1] && qz > r[2]; })) continue;
          box(0.16, H - 1.6, 0.34, at(s * (W / 2 - 0.08), 1.1 + (H - 1.6) / 2, qz), '--lph-fold', 0.01);
          box(0.22, 0.16, 0.42, at(s * (W / 2 - 0.11), H - 0.62, qz), '--lph-gold', 0.01);
          box(0.22, 0.1, 0.42, at(s * (W / 2 - 0.11), 1.16, qz), '--lph-gold', false);
        }
      });
      // The dado and wainscot carry on across the back wall either side of
      // the curtains.
      [[-W / 2, S1X - S1W / 2 - 1.4], [S1X + S1W / 2 + 1.4, W / 2]].forEach(function (r) {
        var bw = r[1] - r[0], bx = (r[0] + r[1]) / 2;
        box(bw, 0.08, 0.06, at(bx, 1.05, back + 0.03), '--lph-gold', false, false);
        box(bw, 0.12, 0.08, at(bx, 0.06, back + 0.04), '--lph-gold', false, false);
        for (var px = r[0] + 0.15; px + 1.0 < r[1]; px += 1.25) {
          box(1.0, 0.68, 0.04, at(px + 0.5, 0.56, back + 0.02), '--lph-fold', false, false);
          [0.24, 0.88].forEach(function (y) { box(1.0, 0.03, 0.05, at(px + 0.5, y, back + 0.04), '--lph-gold', false, false); });
        }
      });

      // THE CEILING in gilt coffers, ribs both ways, and a rose in each.
      for (var cx = -W / 2 + W / 4; cx < W / 2; cx += W / 4) box(0.12, 0.1, D + 1, at(cx, H - 0.05, -D / 2 + 0.5), '--lph-gold', false, false);
      for (var rz0 = -1.5; rz0 > back + 1; rz0 -= 3.2) {
        for (var rx0 = -W / 2 + W / 8; rx0 < W / 2; rx0 += W / 4) {
          box(W / 4 - 0.5, 0.06, 2.7, at(rx0, H - 0.02, rz0 - 1.6), '--lph-deep', false, false);
          kit.piece(new T.CylinderGeometry(0.22, 0.26, 0.08, 14), at(rx0, H - 0.09, rz0 - 1.6), '--lph-gold', false, false);
        }
      }
      // THE CHANDELIER over the middle of the house, a brass ring of bare
      // bulbs, every one steady; one light for all of them.
      var CH = { x: 0, y: H - 1.5, z: -11.0 };
      kit.piece(new T.CylinderGeometry(0.02, 0.02, 1.1, 6), at(CH.x, H - 0.55, CH.z), '--lph-brass', false, false);
      kit.piece(new T.TorusGeometry(0.9, 0.05, 6, 32), at(CH.x, CH.y, CH.z, 0, Math.PI / 2), '--lph-brass', 0.01);
      kit.piece(new T.TorusGeometry(0.5, 0.04, 6, 24), at(CH.x, CH.y + 0.28, CH.z, 0, Math.PI / 2), '--lph-brass', 0.01);
      kit.piece(new T.SphereGeometry(0.16, 12, 8), at(CH.x, CH.y + 0.1, CH.z), '--lph-gold', 0.01);
      for (var cb = 0; cb < 16; cb++) {
        var ca = cb / 16 * Math.PI * 2, cr = cb % 2 ? 0.5 : 0.9, cy = cb % 2 ? CH.y + 0.38 : CH.y + 0.1;
        kit.piece(new T.CylinderGeometry(0.03, 0.04, 0.12, 8), at(CH.x + Math.cos(ca) * cr, cy - 0.06, CH.z + Math.sin(ca) * cr), '--lph-brass', false, false);
        kit.flat(new T.SphereGeometry(0.075, 10, 6), at(CH.x + Math.cos(ca) * cr, cy + 0.05, CH.z + Math.sin(ca) * cr), '--lph-bulb');
      }
      var chl = new T.PointLight(kit.col('--lph-bulb'), 6, 14, 1.5);
      chl.position.set(CH.x, CH.y - 0.2, CH.z); kit.scene.add(chl);

      // THE CARPET: a runner down the aisle in the lighter fold with gilt
      // edges, and a small gilt diamond in the deep velvet all over.
      box(1.3, 0.02, D - 2.2, at(0, 0.01, -D / 2 - 0.4), '--lph-fold', false, false);
      [-0.68, 0.68].forEach(function (o) { box(0.06, 0.025, D - 2.2, at(o, 0.012, -D / 2 - 0.4), '--lph-gold', false, false); });
      var dia = new T.PlaneGeometry(0.14, 0.14);
      for (var gx = -W / 2 + 0.9; gx < W / 2 - 0.5; gx += 1.1) {
        if (Math.abs(gx) < 0.9) continue;
        for (var gz = 0.2; gz > back + 0.6; gz -= 1.1) kit.piece(dia.clone(), at(gx, 0.006, gz, Math.PI / 4, -Math.PI / 2), '--lph-velvet', false, false);
      }
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
          kit.piece(new T.CylinderGeometry(0.12, 0.12, 0.04, 16), at(x, 3.1, z, 0, 0, Math.PI / 2), '--lph-brass', 0.008);
          kit.piece(new T.CylinderGeometry(0.022, 0.022, 0.3, 6), at(x - s * 0.15, 3.1, z, 0, 0, Math.PI / 2), '--lph-brass', false);
          kit.piece(new T.CylinderGeometry(0.022, 0.022, 0.14, 6), at(x - s * 0.3, 3.17, z), '--lph-brass', false);
          kit.piece(new T.CylinderGeometry(0.045, 0.045, 0.07, 12), at(x - s * 0.3, 3.27, z), '--lph-brass', 0.006);
          var bulb = new T.SphereGeometry(0.085, 12, 8); bulb.scale(1, 1.25, 1);
          kit.flat(bulb, at(x - s * 0.3, 3.39, z), '--lph-bulb');
          if (lit++ % 2 === 0) {
            var b = new T.PointLight(kit.col('--lph-bulb'), 2.6, 8, 1.4);
            b.position.set(x - s * 0.95, 3.0, z);
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
      // Each seat is a padded seat and a back with a rounded top, on a dark
      // standard, with a gilt-capped arm between it and the next. Two rows
      // leave the seat at the wall out, for a wheelchair, the space edged in
      // gilt on the floor with a seat beside it for whoever came along, and
      // the floor is level all the way, so every seat and space is reached
      // without a step.
      var ROUND = new T.CylinderGeometry(0.1, 0.1, 0.6, 12);
      function seat(sx, rz) {
        box(0.6, 0.14, 0.52, at(sx, 0.47, rz - 0.02), '--lph-fold', 0.012);
        box(0.6, 0.58, 0.14, at(sx, 0.86, rz + 0.28, 0, -0.1), '--lph-velvet', 0.012);
        kit.piece(ROUND.clone(), at(sx, 1.14, rz + 0.3, 0, 0, Math.PI / 2), '--lph-velvet', 0.012);
        box(0.46, 0.4, 0.02, at(sx, 0.86, rz + 0.2, 0, -0.1), '--lph-fold', false, false);
        box(0.5, 0.36, 0.08, at(sx, 0.2, rz + 0.1), '--lph-ink', false);
      }
      function arm(ax, rz) {
        box(0.07, 0.3, 0.5, at(ax, 0.55, rz + 0.02), '--lph-ink', false);
        box(0.09, 0.05, 0.52, at(ax, 0.72, rz + 0.02), '--lph-brass', 0.006);
      }
      for (var row = 0; row < 6; row++) {
        var rz = -7.2 - row * 1.6;
        [-1, 1].forEach(function (s) {
          var wheel = (row === 1 || row === 4);
          for (var c = 0; c < 4; c++) {
            var sx = s * (1.0 + c * 0.82);
            if (wheel && c === 3) {
              // The space for a wheelchair, edged in gilt on the floor.
              [[0, -0.42], [0, 0.42]].forEach(function (e) { box(0.9, 0.02, 0.05, at(sx + 0.05, 0.012, rz + e[1]), '--lph-gold', false, false); });
              box(0.05, 0.02, 0.84, at(sx + s * 0.48, 0.012, rz), '--lph-gold', false, false);
              continue;
            }
            seat(sx, rz);
            arm(sx + 0.34, rz); if (c === 0) arm(sx - 0.34, rz);
          }
        });
      }
      // THE EAR DEFENDERS hung on the seat in the second row, nearest the
      // aisle on the left, as the house rules say: two cups on a band, over
      // the seat's back.
      (function () {
        var ex = -1.0, ez = -7.2 - 1.6 + 0.33;
        var band = new T.TorusGeometry(0.13, 0.025, 6, 16, Math.PI);
        kit.piece(band, at(ex, 1.18, ez, Math.PI / 2), '--lph-ink-2', 0.006);
        [-0.13, 0.13].forEach(function (o) { kit.piece(new T.CylinderGeometry(0.075, 0.075, 0.07, 14), at(ex + o, 1.06, ez, 0, 0, Math.PI / 2), '--lph-ink', 0.006); });
      })();

      // SOMEWHERE TO STEP OUT TO, without leaving: a long velvet sofa against
      // the back wall either side of the way in, deep enough to lie on, and
      // cushions on the floor down at the front left, where the floor is kept
      // clear for anybody who would rather sit on it.
      [-1, 1].forEach(function (s) {
        var sx0 = s * (W / 4 + 0.65);
        box(3.6, 0.42, 0.9, at(sx0, 0.3, 0.45), '--lph-velvet', 0.015);
        box(3.6, 0.7, 0.24, at(sx0, 0.75, 0.88), '--lph-velvet', 0.015);
        [-1, 1].forEach(function (e) { box(0.24, 0.56, 0.9, at(sx0 + e * 1.92, 0.48, 0.45), '--lph-fold', 0.012); });
        [-1.1, 0, 1.1].forEach(function (o) { box(1.0, 0.12, 0.78, at(sx0 + o, 0.57, 0.42), '--lph-fold', 0.008); });
      });
      [[-5.4, -18.0, '--lph-fold'], [-4.5, -18.6, '--lph-velvet'], [-5.6, -19.2, '--lph-gold'], [-4.6, -19.6, '--lph-fold']].forEach(function (c, i) {
        var cu = new T.SphereGeometry(0.42, 14, 8); cu.scale(1, 0.38, 1);
        kit.piece(cu, at(c[0], 0.16, c[1], i * 0.6), c[2], 0.012);
      });

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
          { name: 'at Screen Two on the left-hand wall', x: -W / 2 + 4.0, z: -15.4, yaw: LEFT, pitch: 0.16, frame: two.el },
          { name: 'at Screen Two’s rack', x: -W / 2 + 3.2, z: -10.8, yaw: LEFT, pitch: 0.1, frame: rackTwo.el },
          { name: 'at Screen Three on the right-hand wall, the campfire screen', x: W / 2 - 4.0, z: -15.4, yaw: RIGHT, pitch: 0.16, frame: three.el },
          { name: 'at the campfire rack', x: W / 2 - 3.2, z: -10.8, yaw: RIGHT, pitch: 0.1, frame: rackThree.el },
          { name: 'at the house rules, every screening a relaxed screening', x: -W / 2 + 2.9, z: -4.2, yaw: LEFT, pitch: 0.1, frame: rules.el },
          { name: 'at the wall by the way in, with the picture house’s own page on it', x: W / 2 - 2.8, z: -3.2, yaw: RIGHT, page: kit.page, frame: frame }
        ]
      };
    }
  };
})();

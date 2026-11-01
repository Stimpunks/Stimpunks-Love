/* =============================================================================
   The Chappell, walked into on Cel Street, through the doorway in Pink Pony
   Club's left-hand wall. Ryan's ask, 2026-10-31: down the street a room at a
   time, and then the rooms behind the doors.

   IT IS A SUBROOM AND IT STILL SHARES NOTHING WITH ITS PARENT (§12). The
   dancefloor is flat hot pink, cream and one big tray; this is votive indigo,
   gold leaf and thirteen free-standing arches on the bare ground of a dark
   nave, the ground showing between them. Being reached through Pink Pony Club
   is a fact about the doors, not a licence to inherit its face, so not one of
   the dancefloor's colours is used in here.

   THE ARCHES ARE THE PAGE'S OWN NICHES, lifted off it by the kit, each standing
   on its own gold plinth inside a gold arch on the nave floor, seven down the
   left and six down the right, in the page's order; each plays its own video
   where it stands, and says how long it runs before the press, because the
   button is the page's. THE CHANCEL is the east end: the same ground, gold,
   cream serif and glass, and what makes it the east end is its size and its
   solitude, a deeper arch on a step with nothing beside it, under the rose
   window. Its button plays the whole playlist from the top, and says it runs
   until you stop it, because a playlist has no length to give. No random start.

   THE LIGHT is the rose window's violet coming down the nave from the east, a
   little gold at the votive rail by the door and at the chancel's step, and
   nothing else. The glass colours are on the rose window and the votive jars
   only and carry no word. NOTHING MOVES: no candle flickers, the window does
   not turn. Every colour is one the Chappell declares, by name. It keeps
   nothing, sends nothing and fetches nothing; its page arrives through Cel
   Street's screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['the-chappell.html'] = {
    name: 'The Chappell',
    from: 'pink-pony-club.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var W = 14, D = 38, H = 8.6, back = -D;

      // THE NAVE IN THE DARK, the rose window's violet coming down it.
      kit.scene.background = kit.col('--glass');
      kit.scene.add(new T.HemisphereLight(kit.col('--amethyst'), kit.col('--nave'), 1.0));
      // and the candles' gold, low, off the votive rail and the chancel step,
      // so the gold leaf reads as gold in the violet.
      kit.scene.add(new T.HemisphereLight(kit.col('--leaf'), kit.col('--nave'), 1.0));
      var rose = new T.SpotLight(kit.col('--amethyst'), 160, 44, 0.5, 0.8, 1.2);
      rose.position.set(0, H - 1.2, back + 1.0);
      rose.target.position.set(0, 0, -12);
      rose.castShadow = true;
      rose.shadow.mapSize.set(1024, 1024);
      rose.shadow.bias = -0.0008; rose.shadow.normalBias = 0.03;
      kit.scene.add(rose, rose.target);

      // THE ROOM: the nave floor, bare; its walls and roof in the dark; the
      // door you came in by in the west wall; a gold seam down the aisle.
      box(W, 0.1, D + 1, at(0, -0.05, -D / 2), '--nave', false, false);
      box(0.3, H, D + 1, at(-W / 2 - 0.15, H / 2, -D / 2), '--niche');
      box(0.3, H, D + 1, at(W / 2 + 0.15, H / 2, -D / 2), '--niche');
      box(W + 0.6, 0.2, D + 1, at(0, H + 0.1, -D / 2), '--glass', false, false);
      box((W - 2.2) / 2, H, 0.3, at(-(W + 2.2) / 4, H / 2, 0.15), '--niche');
      box((W - 2.2) / 2, H, 0.3, at((W + 2.2) / 4, H / 2, 0.15), '--niche');
      box(2.2, H - 3.0, 0.3, at(0, 3.0 + (H - 3.0) / 2, 0.15), '--niche');
      box(2.0, 2.9, 0.08, at(0, 1.45, 0.06), '--glass');
      [-1.05, 1.05].forEach(function (x) { box(0.12, 3.0, 0.36, at(x, 1.5, 0.12), '--leaf', 0.02); });
      box(2.3, 0.12, 0.36, at(0, 3.0, 0.12), '--leaf', 0.02);
      box(0.08, 0.02, D - 9, at(0, 0.01, -(D - 9) / 2 - 1.5), '--leaf', false, false);

      // AN ARCH: two gold posts, a pointed head, and a plinth at its foot,
      // free-standing, the nave floor showing all round it.
      function arch(m, w, h, rise, plinth) {
        box(w + 0.5, plinth, 0.9, M(m, at(0, plinth / 2, 0)), '--niche', 0.02);
        box(w + 0.5, 0.04, 0.9, M(m, at(0, plinth + 0.02, 0)), '--leaf', false);
        [-1, 1].forEach(function (s) { box(0.16, h, 0.24, M(m, at(s * w / 2, plinth + h / 2, 0)), '--leaf', 0.02); });
        var arm = Math.hypot(w / 2, rise);
        [-1, 1].forEach(function (s) {
          box(arm + 0.12, 0.16, 0.24, M(m, at(s * w / 4, plinth + h + rise / 2, 0, 0, 0, -s * Math.atan2(rise, w / 2))), '--leaf', 0.02);
        });
      }

      var frame = null, stops = [];
      stops.push({ name: 'just inside the west door, the nave ahead and the rose window at the end of it', x: 0, z: -1.4, yaw: 0 });

      // THE ROOM'S OWN PAGE on the west wall, left of the door, facing in.
      var pw = 3.0, ph = pw * 800 / 1180, py = 1.0 + ph / 2;
      box(pw + 0.24, ph + 0.24, 0.08, at(-4.4, py, 0.0), '--leaf');
      frame = kit.screen(1180, 800, pw, at(-4.4, py, -0.05, Math.PI), 'The Chappell’s own page, on the west wall beside the door');
      stops.push({ name: 'at the west wall, with the Chappell’s own page on it', x: -4.4, z: -3.4, yaw: Math.PI, page: kit.page, frame: frame });

      // The nameplate over the door inside, and the room's own words beside
      // the page, facing down the nave.
      var plate = kit.lift(frame, '.nameplate', { bare: true, w: 360, ww: 1.4, m: at(0, 3.25, -0.05, Math.PI) });
      var lede = kit.lift(frame, '.lede', { w: 560, ww: 1.9, m: at(4.4, 1.3, -0.05, Math.PI) });
      stops.push({ name: 'at the west wall, with what the Chappell is beside the door', x: 4.4, z: -2.9, yaw: Math.PI, frame: lede.el });

      // THE VOTIVE RAIL by the door on the right: a lit shelf of candles in
      // their glass, under a gold edge, the room's consent banner over it.
      var VZ = -5.0, VX = W / 2 - 0.5;
      box(0.6, 0.9, 3.0, at(VX, 0.45, VZ), '--niche', 0.02);
      box(0.64, 0.05, 3.04, at(VX, 0.92, VZ), '--leaf', false);
      ['--ruby', '--leaf', '--sapphire', '--emerald', '--amethyst', '--ruby', '--sapphire', '--emerald'].forEach(function (c, i) {
        var z = VZ - 1.3 + i * 0.37;
        kit.cyl(0.08, 0.08, 0.16, at(VX - 0.1, 1.03, z), c, 0.01, 10);
        kit.flat(new T.ConeGeometry(0.025, 0.07, 6), at(VX - 0.1, 1.15, z), '--leaf');
      });
      var votiveLight = new T.PointLight(kit.col('--leaf'), 3, 6, 1.5);
      votiveLight.position.set(VX - 0.3, 1.3, VZ);
      kit.scene.add(votiveLight);
      var votive = kit.lift(frame, '.votive', { w: 620, ww: 2.4, m: at(W / 2 - 0.02, 1.25, VZ, RIGHT) });
      stops.push({ name: 'at the votive rail, the candles lit and the room’s promise over them', x: VX - 2.6, z: VZ, yaw: RIGHT, frame: votive.el });

      // THE THIRTEEN ARCHES, in the page's order: seven down the left, six
      // down the right, each facing the aisle.
      var AW = 1.72, AH = 1.98, AR = 0.75, PL = 0.3;
      for (var n = 0; n < 13; n++) {
        var left = n < 7, k = left ? n : n - 7;
        var z = -9.0 - k * 3.4 - (left ? 0 : 1.7);
        var x = left ? -W / 2 + 1.6 : W / 2 - 1.6;
        var g = at(x, 0, z, left ? LEFT : RIGHT);
        arch(g, AW, AH, AR, PL);
        var it = kit.lift(frame, '.niche', { n: n, w: 360, ww: 1.85, m: M(g, at(0, PL + 0.02, 0.02)) });
        stops.push({ name: 'at the ' + ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh'][k] + ' arch down the ' + (left ? 'left' : 'right'),
          x: left ? x + 2.7 : x - 2.7, z: z, yaw: left ? LEFT : RIGHT, pitch: -0.08, frame: it.el });
      }

      // THE CHANCEL at the east end: a step, a deeper arch, and the whole
      // playlist in it, alone; the rose window over it.
      var CZ = back + 1.4, CW = 4.4, CS = 0.45;
      box(W - 1.0, CS, 4.0, at(0, CS / 2, back + 2.0), '--niche', 0.02);
      box(W - 1.0, 0.05, 0.1, at(0, CS + 0.02, back + 4.0), '--leaf', false);
      arch(at(0, CS - 0.3, CZ), CW + 0.3, 4.45, 1.2, 0.3);
      var chancel = kit.lift(frame, '.chancel', { w: 880, ww: CW + 0.8, m: at(0, CS + 0.02, CZ + 0.02) });
      var step = new T.PointLight(kit.col('--leaf'), 4, 7, 1.5);
      step.position.set(0, 1.6, back + 4.6);
      kit.scene.add(step);
      stops.push({ name: 'at the chancel, the whole playlist in the one deep arch at the east end', x: 0, z: back + 9.6, yaw: 0, pitch: 0.12, frame: chancel.el });

      // THE ROSE WINDOW: rings of glass round a gold eye, high in the east
      // wall over the chancel, still.
      var RY = H - 1.25, RZ = back + 0.02;
      kit.flat(new T.CircleGeometry(1.15, 40), at(0, RY, RZ), '--leaf');
      var GLASS = ['--ruby', '--sapphire', '--emerald', '--amethyst'];
      for (var p = 0; p < 16; p++) {
        var a0 = p * Math.PI / 8;
        kit.flat(new T.CircleGeometry(1.05, 6, a0 + 0.04, Math.PI / 8 - 0.08), at(0, RY, RZ + 0.01), GLASS[p % 4]);
      }
      kit.flat(new T.CircleGeometry(0.42, 24), at(0, RY, RZ + 0.02), '--leaf');
      kit.flat(new T.CircleGeometry(0.3, 24), at(0, RY, RZ + 0.03), '--amethyst');
      stops.push({ name: 'under the rose window, its violet coming down the nave', x: 0, z: back + 12, yaw: 0, pitch: 0.42 });

      // THE ROOM RULE, in the apse, on the right-hand wall by the chancel.
      var gloria = kit.lift(frame, '.gloria', { w: 620, ww: 2.2, m: at(W / 2 - 0.02, 1.3, back + 6.6, RIGHT) });
      stops.push({ name: 'at the room’s rule, in the apse beside the chancel', x: W / 2 - 2.7, z: back + 6.6, yaw: RIGHT, frame: gloria.el });

      stops.push({ name: 'looking back down the nave at the west door, the nameplate over it', x: 0, z: -6.5, yaw: Math.PI, pitch: 0.1, frame: plate.el });

      return {
        start: { x: 0, z: -1.4, yaw: 0 },
        bounds: { x: [-W / 2 + 2.8, W / 2 - 2.8], z: [back + 4.4, -0.8] },
        stops: stops
      };
    }
  };
})();

/* =============================================================================
   The Foundry, walked into on Cel Street. Ryan's ask, 2026-10-31: back to the
   street, working down it.

   IT IS THE FOUNDRY'S WORLD AND NOBODY ELSE'S (§32): a type foundry, a grey
   iron workshop under a dirty sawtooth roof. THE GREY IS THE SEPARATION: no
   black in it and no white, the colour of the metal, halfway between the
   street's night rooms and its paper rooms. THE LIGHT IS NORTH LIGHT: the
   roof's glazing faces away from the sun, so the light comes down flat, cool
   and from overhead, and nothing in the room has a lit face; each thing has
   its small shadow straight beneath it. There is no furnace and no flame.
   BRASS IS THE ONLY WARM VALUE, and it is a metal rather than a light: the
   pulls on the type cases, the rails of the racks. THE ONLY PALE THING IN THE
   ROOM IS ONE PROOF, lying on the bench.

   OFF THE PAGE: the bench itself (what to set, the face, the weight, the
   slant, the knobs and the four measured inks), lifted onto an iron easel,
   and the proof it pulls, lying on the bench, both worked by foundry.js, the
   page's own script, exactly as on the page. Print is left on the page: here
   it would print this street rather than the proof. And every face on this
   street, on its shelf, on racks round the walls, each shelf scrolling, set in
   itself with whoever drew it and the licence it travels under, as the page
   has them. Nothing here describes a typeface.

   Every colour is one the Foundry declares, by name. NOTHING MOVES, and
   nothing is turned but the things themselves: no word is set on a slant by a
   transform. It keeps nothing, sends nothing and fetches nothing; its page
   arrives through Cel Street's screen().
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 13, 374761393) ^ Math.imul(j + 41, 668265263) ^ Math.imul(k + 7, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['foundry.html'] = {
    name: 'The Foundry',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var W = 12, D = 13, H = 3.6, back = -D;

      // NORTH LIGHT: the sky with the sun taken out, from overhead, cool and
      // even, and one light straight down so every thing has its small shadow
      // under it and no lit face.
      kit.scene.background = kit.col('--fo-bench');
      kit.scene.add(new T.HemisphereLight(kit.col('--fo-roof'), kit.col('--fo-floor'), 2.8));
      var north = new T.DirectionalLight(kit.col('--fo-oil'), 1.5);
      north.position.set(0, 20, -D / 2 - 0.5); north.target.position.set(0, 0, -D / 2);
      north.castShadow = true;
      north.shadow.mapSize.set(1024, 1024);
      north.shadow.camera.left = -9; north.shadow.camera.right = 9;
      north.shadow.camera.top = 9; north.shadow.camera.bottom = -9;
      north.shadow.camera.far = 40;
      north.shadow.bias = -0.0008; north.shadow.normalBias = 0.03;
      kit.scene.add(north, north.target);

      // THE FLOOR, iron plate with the lead rules between the plates, and the
      // walls, the same grey as the metal.
      box(W + 0.4, 0.1, D + 0.6, at(0, -0.05, -D / 2), '--fo-floor', false, false);
      for (var r = 1; r < 9; r++) box(W, 0.006, 0.025, at(0, 0.003, -r * D / 9), '--fo-lead', false, false);
      for (var c = -2; c <= 2; c++) box(0.025, 0.006, D, at(c * W / 6, 0.003, -D / 2), '--fo-lead', false, false);
      box(0.3, H, D + 0.6, at(-W / 2 - 0.15, H / 2, -D / 2), '--fo-floor', 0.02);
      box(0.3, H, D + 0.6, at(W / 2 + 0.15, H / 2, -D / 2), '--fo-floor', 0.02);
      box(W + 0.6, H, 0.3, at(0, H / 2, back - 0.15), '--fo-floor', 0.02);
      // The front wall, and the door you came in by, behind you.
      [-1, 1].forEach(function (s) { box((W - 1.6) / 2, H, 0.3, at(s * (W + 1.6) / 4, H / 2, 0.3), '--fo-floor', 0.02); });
      box(1.6, H - 2.4, 0.3, at(0, 2.4 + (H - 2.4) / 2, 0.3), '--fo-floor', 0.02);
      box(1.5, 2.35, 0.08, at(0, 1.18, 0.42), '--fo-bench', 0.015);
      kit.cyl(0.04, 0.04, 0.05, at(0.55, 1.1, 0.36, 0, Math.PI / 2), '--fo-brass', false, 10);
      // A rule of lead round the top of the walls, where the roof sits.
      box(W, 0.06, 0.06, at(0, H - 0.1, back + 0.05), '--fo-lead', false);
      [-1, 1].forEach(function (s) { box(0.06, 0.06, D, at(s * (W / 2 - 0.05), H - 0.1, -D / 2), '--fo-lead', false); });

      // THE SAWTOOTH ROOF: four teeth across the room, each a solid slope
      // rising toward the back and a glazed face dropping back down, the glass
      // dirty and turned to the north, away from the sun.
      var TEETH = 4, TD = D / TEETH, RISE = 1.4;
      for (var t = 0; t < TEETH; t++) {
        var z0 = -t * TD, z1 = z0 - TD;
        var slope = Math.hypot(TD, RISE), ang = Math.atan2(RISE, TD);
        box(W + 0.4, 0.12, slope, at(0, H + RISE / 2, (z0 + z1) / 2, 0, ang), '--fo-roof', 0.02);
        // The glazing: a pane of dirty glass between iron bars.
        kit.flat(new T.PlaneGeometry(W, RISE - 0.1), at(0, H + RISE / 2, z1 + 0.02, 0), '--fo-oil');
        for (var b = -5; b <= 5; b++) box(0.06, RISE, 0.08, at(b * W / 11, H + RISE / 2, z1 + 0.06), '--fo-bench', false);
        box(W + 0.4, 0.1, 0.12, at(0, H + 0.05, z1 + 0.06), '--fo-bench', false);
        // A tie across the room under each tooth.
        box(W, 0.1, 0.1, at(0, H - 0.25, z1 + 0.3), '--fo-bench', 0.01);
      }

      // THE BENCH: an iron imposing table in the middle of the floor, the proof
      // lying on it, and an iron easel at its back carrying the bench's own
      // controls off the page.
      var BZ = -9.2, BW = 3.0, BD = 1.5, BH = 0.92;
      box(BW, 0.1, BD, at(0, BH - 0.05, BZ), '--fo-bench', 0.02);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) {
        box(0.1, BH - 0.1, 0.1, at(p[0] * (BW / 2 - 0.12), (BH - 0.1) / 2, BZ + p[1] * (BD / 2 - 0.12)), '--fo-bench', 0.01);
      });
      box(BW - 0.3, 0.06, BD - 0.3, at(0, 0.25, BZ), '--fo-bench', 0.01);
      // A galley and a stick of lead lying by the proof, and brass quoins.
      box(0.5, 0.04, 0.32, at(-1.05, BH + 0.02, BZ + 0.2), '--fo-lead', 0.008);
      box(0.4, 0.03, 0.05, at(1.1, BH + 0.015, BZ + 0.4, 0.3), '--fo-lead', false);
      for (var q = 0; q < 3; q++) box(0.08, 0.03, 0.04, at(1.0 + q * 0.1, BH + 0.015, BZ + 0.1), '--fo-brass', false);
      // The easel at the back of the bench.
      var EZ = BZ - BD / 2 - 0.15, EW = 2.3;
      [-1, 1].forEach(function (s) { box(0.08, 3.2, 0.08, at(s * (EW / 2 + 0.06), 1.6, EZ - 0.05), '--fo-bench', 0.01); });
      box(EW + 0.3, 0.06, 0.24, at(0, 1.05, EZ), '--fo-bench', 0.01);
      box(EW + 0.2, 0.04, 0.04, at(0, 1.1, EZ + 0.1), '--fo-brass', false);

      // THE ROOM'S OWN PAGE, on the right-hand wall by the door, framed in iron.
      var pw = 2.8, ph = pw * 800 / 1180, py = 0.85 + ph / 2;
      var pg = at(W / 2 - 0.02, 0, -2.6, RIGHT);
      box(pw + 0.16, ph + 0.16, 0.06, M(pg, at(0, py, 0)), '--fo-bench', 0.015);
      var frame = kit.screen(1180, 800, pw, M(pg, at(0, py, 0.05)), 'The Foundry’s own page, on the right-hand wall by the door');

      // OFF THE PAGE, onto the easel and the bench: the bench's controls,
      // standing; the proof, lying flat on the iron and turned up a little to
      // you. foundry.js, which the page loads, works both. Print is left on
      // the page, where it prints the proof and not this street.
      var bench = kit.lift(frame, '.fo-bench', { w: 900, h: 860, ww: EW, m: at(0, 1.12, EZ + 0.02), drop: '.fo-print' });
      var proof = kit.lift(frame, '.fo-pulled', { w: 900, h: 620, ww: 1.7, m: at(0, BH + 0.02, BZ + 0.62, 0, -1.25) });
      kit.wire(frame, 'foundry.js');

      // THE TYPE CASES along the back wall either side of the easel: iron
      // cabinets of shallow drawers, a brass pull and a lead label on each.
      function cabinet(m, w) {
        box(w, 1.25, 0.7, M(m, at(0, 0.625, 0)), '--fo-bench', 0.02);
        box(w + 0.1, 0.05, 0.8, M(m, at(0, 1.27, 0)), '--fo-lead', 0.01);
        for (var row = 0; row < 8; row++) {
          var y = 0.12 + row * 0.14;
          for (var col = 0; col < 2; col++) {
            var x = (col - 0.5) * (w / 2);
            box(w / 2 - 0.06, 0.11, 0.02, M(m, at(x, y, 0.36)), '--fo-floor', false);
            kit.cyl(0.012, 0.012, 0.09, M(m, at(x, y + 0.02, 0.39, 0, 0, Math.PI / 2)), '--fo-brass', false, 6);
            box(0.08, 0.03, 0.005, M(m, at(x, y - 0.025, 0.375)), '--fo-lead', false);
          }
        }
        // A case pulled out and left on top, its compartments of sorts.
        var top = M(m, at(0.05 + hash(w * 10, 1, 1) * 0.1, 1.31, 0.02));
        box(w * 0.8, 0.05, 0.5, top, '--fo-floor', 0.008);
        for (var i = 0; i < 6; i++) for (var j = 0; j < 3; j++) {
          box(w * 0.8 / 6 - 0.02, 0.012, 0.5 / 3 - 0.02, M(top, at(-w * 0.4 + (i + 0.5) * w * 0.8 / 6, 0.03, -0.25 + (j + 0.5) * 0.5 / 3)), '--fo-lead', false);
        }
      }
      cabinet(at(-3.6, 0, back + 0.5), 2.0);
      cabinet(at(3.6, 0, back + 0.5), 2.0);

      // THE SHELVES OF FACES: every face this street holds, on the shelf its own
      // record files it under, on iron racks with brass rails round the walls.
      // Each shelf is the page's own, and scrolls; its name stands over it.
      var RACKS = [
        { n: 0, x: -W / 2, z: -2.8, face: LEFT, what: 'serif' },
        { n: 1, x: -W / 2, z: -5.8, face: LEFT, what: 'sans serif' },
        { n: 2, x: -W / 2, z: -8.8, face: LEFT, what: 'display' },
        { n: 3, x: W / 2, z: -5.8, face: RIGHT, what: 'handwriting' },
        { n: 4, x: W / 2, z: -8.8, face: RIGHT, what: 'monospace' }
      ];
      var RW = 2.3;
      var shelves = RACKS.map(function (k) {
        var s = k.x < 0 ? 1 : -1;
        var g = at(k.x + s * 0.02, 0, k.z, k.face);
        box(RW + 0.2, 2.75, 0.08, M(g, at(0, 1.98, 0)), '--fo-bench', 0.015);
        box(RW + 0.3, 0.05, 0.3, M(g, at(0, 0.6, 0.12)), '--fo-bench', 0.01);
        box(RW + 0.2, 0.035, 0.035, M(g, at(0, 0.64, 0.26)), '--fo-brass', false);
        kit.lift(frame, '.fo-shelf', { n: k.n, w: 760, ww: RW, m: M(g, at(0, 2.86, 0.06)) });
        var it = kit.lift(frame, '.fo-sorts', { n: k.n, w: 760, h: 700, ww: RW, m: M(g, at(0, 0.66, 0.06)) });
        return { k: k, it: it };
      });

      var stops = [
        { name: 'just inside the door, under the sawtooth roof', x: 0, z: -1.0, yaw: 0 },
        { name: 'in the middle of the floor, with the north light coming down through the roof', x: 0, z: -5.0, yaw: 0, pitch: 0.55 },
        { name: 'at the bench, with the words and the face to set and the knobs and inks', x: 0, z: BZ + 2.35, yaw: 0, pitch: 0.12, frame: bench.el },
        { name: 'over the proof lying on the bench, the one pale thing in the room', x: 0, z: BZ + 1.5, yaw: 0, pitch: -0.45, frame: proof.el },
        { name: 'at the type cases along the back wall, the drawers of sorts', x: -3.6, z: back + 2.6, yaw: 0, pitch: -0.2 },
        { name: 'at the wall by the door, with the Foundry’s own page on it', x: W / 2 - 2.7, z: -2.6, yaw: RIGHT, page: kit.page, frame: frame }
      ];
      shelves.forEach(function (sh) {
        var k = sh.k, s = k.x < 0 ? 1 : -1;
        stops.push({ name: 'at the shelf of ' + k.what + ' faces, every one set in itself', x: k.x + s * 3.4, z: k.z, yaw: k.face, pitch: 0.2, frame: sh.it.el });
      });

      return {
        start: { x: 0, z: -1.0, yaw: 0 },
        bounds: { x: [-W / 2 + 0.9, W / 2 - 0.9], z: [back + 1.6, -0.6] },
        stops: stops
      };
    }
  };
})();

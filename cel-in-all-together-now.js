/* =============================================================================
   All Together Now Farms, walked into on Cel Street, through its arm of the
   fingerpost at the stile in Nature's Contribution. Ryan's ask, 2026-11-03:
   Nature's Contribution and its places.

   IT IS THE FARM'S OWN WORLD (§108): a mixed farm where trees, crops and
   animals share the same fields, and THE LIGHT IS TWO LIGHTS AT ONCE. You come
   in at the gate facing north, so the sun is going down on your left, half
   under the horizon, and the full moon is just up on your right, both there
   together. Everything is lit WARM ON ITS WEST SIDE AND SILVER ON ITS EAST:
   two low lights, one from each side, and the sky between them running from
   the sun's apricot round to the moon's periwinkle. No other room on the
   street is lit from two sides by two different lights, and that is the
   separation to keep: Pando's dusk has the sun already gone, the Hermitage
   has one low sun, Covenstead one patch of window light.

   THE FARM, AS THE PAGE DRAWS IT: two rows of round nut trees either side of
   the lane, with mounds in the alleys between them where corn stands up out
   of squash leaves and a bean winds up the corn. That is the Three Sisters
   planted, and only planted: the story of them belongs to the nations that
   tell it, so nothing here is a figure out of it. Sheep under the trees on
   the left, goats on the right, hens between. At the back, the red barn with
   the screen in it, and beside it the small white old dairy, a café now,
   whose door is the way into the Dairy. A brook comes in from the left, and a
   line of trees stands along the back.

   NO RAW MILK: the words about why are the page's own, lifted onto a board by
   the dairy. NOTHING MOVES, at any setting: the animals stand where they
   stand, and the screen plays only what is pressed, through rack.js as on the
   page.

   Every colour is one §108 declares, by name. It keeps nothing, sends
   nothing and fetches nothing; its page arrives through Cel Street's
   screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 11, 374761393) ^ Math.imul(j + 41, 668265263) ^ Math.imul(k + 43, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['all-together-now.html'] = {
    name: 'All Together Now Farms',
    from: 'natures-contribution.html',
    faces: ['"Patua One"'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var ROWS = [-10.4, -4.4, 4.4, 10.4];        // the nut trees' rows
      var ALLEYS = [-7.4, 7.4];                  // the mounds between them
      var NEAR = 6, FAR = -20;                   // the gate, and the end of the rows
      var BX = -5, BZ = -26, BW = 8, BD = 6, BH = 3.6;   // the barn
      var DX = 5.5, DZ = -25.2, DW = 4.2, DD = 4, DH = 2.8; // the old dairy

      // TWO LIGHTS: the sun's, warm and low from the west on your left, and
      // the moon's, silver and low from the east on your right, with the sky
      // between them filling the tops a little.
      kit.scene.background = kit.col('--atn-sky');
      kit.scene.add(new T.HemisphereLight(kit.col('--atn-sky'), kit.col('--atn-pasture'), 0.9));
      var sunLight = new T.DirectionalLight(kit.col('--atn-rim-warm'), 1.7);
      sunLight.position.set(-60, 5, -12);
      var moonLight = new T.DirectionalLight(kit.col('--atn-rim-cool'), 1.35);
      moonLight.position.set(60, 7, -12);
      kit.scene.add(sunLight, sunLight.target, moonLight, moonLight.target);

      // THE SKY ALL ROUND: apricot in the west where the sun is, periwinkle in
      // the east where the moon is, the flat sky north and south between them.
      // A band round you, drawn once, lit by nothing.
      var skyMap = kit.paper(1024, 64, function (c, w, h) {
        var g = c.createLinearGradient(0, 0, w, 0);
        g.addColorStop(0, kit.ink('--atn-sky'));
        g.addColorStop(0.25, kit.ink('--atn-east'));
        g.addColorStop(0.5, kit.ink('--atn-sky'));
        g.addColorStop(0.75, kit.ink('--atn-west'));
        g.addColorStop(1, kit.ink('--atn-sky'));
        c.fillStyle = g; c.fillRect(0, 0, w, h);
      });
      var sky = new T.Mesh(new T.CylinderGeometry(380, 380, 260, 64, 1, true),
        new T.MeshBasicMaterial({ map: skyMap, side: T.BackSide, fog: false, depthWrite: false }));
      sky.matrixAutoUpdate = false;
      sky.matrix.copy(at(0, 100, -10));
      sky.matrixWorldNeedsUpdate = true;
      kit.scene.add(sky);
      // The sun half down on the western horizon, the full moon just up in
      // the east.
      kit.flat(new T.CircleGeometry(11, 40), at(-300, 3, -70, LEFT), '--atn-sun');
      kit.flat(new T.CircleGeometry(7, 40), at(300, 12, -70, RIGHT), '--atn-moon');

      // THE GROUND, the lane up the middle, and the gate you came in by.
      box(900, 0.1, 900, at(0, -0.06, -40), '--atn-pasture', false, false);
      box(2.6, 0.04, NEAR - FAR + 8, at(0, 0.0, (NEAR + FAR - 8) / 2), '--atn-soil', false, false);
      [-1.5, 1.5].forEach(function (x) { box(0.2, 1.3, 0.2, at(x, 0.65, NEAR + 0.6), '--atn-trunk'); });
      var gate = at(1.5, 0, NEAR + 0.6, -2.0);
      for (var bar = 0; bar < 5; bar++) box(2.8, 0.08, 0.06, M(gate, at(-1.4, 0.2 + bar * 0.24, 0)), '--atn-trunk', 0.01);
      box(0.08, 1.2, 0.06, M(gate, at(-0.1, 0.65, 0)), '--atn-trunk', 0.01);
      box(0.08, 1.2, 0.06, M(gate, at(-2.7, 0.65, 0)), '--atn-trunk', 0.01);
      // Hedges either side of the gate, back along the field's edge.
      [-1, 1].forEach(function (s) { box(14, 1.1, 0.8, at(s * 9, 0.55, NEAR + 0.9), '--atn-leaf', 0.02); });

      // THE NUT TREES, in rows, round and full.
      function nutTree(x, z, i) {
        var r = 1.2 + hash(i, 1, 1) * 0.35, h = 2.0 + hash(i, 1, 2) * 0.5;
        cyl(0.13, 0.2, h, at(x, h / 2, z), '--atn-trunk', 0.02, 7);
        var crown = new T.IcosahedronGeometry(r, 1); crown.scale(1, 0.85, 1);
        kit.piece(crown, at(x, h + r * 0.7, z, i), '--atn-leaf', 0.03);
      }
      var n = 0;
      ROWS.forEach(function (x) { for (var z = -1; z >= FAR + 1; z -= 4.2) nutTree(x + (hash(n, 2, 1) - 0.5) * 0.3, z, n++); });

      // THE THREE SISTERS, on mounds in the alleys: corn up out of the middle,
      // a bean climbing the corn, squash leaves round the foot and a squash
      // lying among them. Planted, and nothing else.
      var leaf = new T.CircleGeometry(0.32, 7);
      function mound(x, z, i) {
        var m = new T.SphereGeometry(0.8, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2); m.scale(1, 0.45, 1);
        kit.piece(m, at(x, 0, z), '--atn-soil', 0.02);
        for (var c = 0; c < 3; c++) {
          var ca = c / 3 * Math.PI * 2 + i, cx = x + Math.cos(ca) * 0.18, cz = z + Math.sin(ca) * 0.18;
          var ch = 1.9 + hash(i, c, 3) * 0.4;
          cyl(0.03, 0.045, ch, at(cx, 0.3 + ch / 2, cz), '--atn-corn-stalk', false, 5);
          for (var l = 0; l < 3; l++) {
            var blade = new T.PlaneGeometry(0.08, 0.7); blade.translate(0, 0.35, 0);
            kit.piece(blade, at(cx, 0.8 + l * 0.45, cz, ca + l * 2.1, 0, 0.9), '--atn-corn-stalk', false);
          }
          var ear = new T.CylinderGeometry(0.05, 0.035, 0.28, 6);
          kit.piece(ear, at(cx + 0.05, 1.3 + hash(i, c, 4) * 0.3, cz, 0, 0, -0.3), '--atn-corn', false);
          // The bean, winding up this stalk: its leaves in a spiral round it.
          for (var b = 0; b < 6; b++) {
            var ba = b * 1.9 + c, by = 0.6 + b * 0.25;
            kit.piece(new T.CircleGeometry(0.08, 6), at(cx + Math.cos(ba) * 0.07, by, cz + Math.sin(ba) * 0.07, ba, 0.4), '--atn-bean', false);
          }
        }
        for (var s = 0; s < 7; s++) {
          var sa = s / 7 * Math.PI * 2 + hash(i, s, 5), sr = 0.75 + hash(i, s, 6) * 0.35;
          kit.piece(leaf.clone(), at(x + Math.cos(sa) * sr, 0.2, z + Math.sin(sa) * sr, sa, -1.2), '--atn-squash-leaf', false);
        }
        var sq = new T.SphereGeometry(0.22, 10, 8); sq.scale(1.3, 0.85, 1);
        kit.piece(sq, at(x + 0.6, 0.18, z + 0.4, i), '--atn-squash', 0.015);
      }
      ALLEYS.forEach(function (x, a) { for (var z = -3; z >= FAR + 2; z -= 4.2) mound(x, z, n++ + a * 30); });

      // THE ANIMALS, standing still: sheep under the trees on the left, goats
      // on the right, and hens between them in the lane's grass.
      function legs(g, w, d, h, ink) {
        [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(function (p) { box(0.08, h, 0.08, M(g, at(p[0] * w, h / 2, p[1] * d)), ink, 0.01); });
      }
      function sheep(x, z, r, i) {
        var g = at(x, 0, z, r);
        var body = new T.SphereGeometry(0.45, 10, 8); body.scale(1, 0.75, 1.35);
        kit.piece(body, M(g, at(0, 0.72, 0)), '--atn-fleece', 0.02);
        box(0.22, 0.24, 0.32, M(g, at(0, 0.82, 0.68, 0, hash(i, 7, 1) * 0.6)), '--atn-face', 0.01);
        legs(g, 0.2, 0.32, 0.45, '--atn-face');
      }
      function goat(x, z, r) {
        var g = at(x, 0, z, r);
        box(0.42, 0.42, 0.9, M(g, at(0, 0.8, 0)), '--atn-goat', 0.02);
        box(0.2, 0.26, 0.32, M(g, at(0, 1.1, 0.55, 0, -0.3)), '--atn-goat', 0.01);
        box(0.12, 0.12, 0.12, M(g, at(0, 1.02, 0.74)), '--atn-face', 0.01);
        [-1, 1].forEach(function (s) { kit.piece(new T.ConeGeometry(0.03, 0.22, 5), M(g, at(s * 0.06, 1.32, 0.5, 0, -0.5)), '--atn-face', false); });
        legs(g, 0.15, 0.36, 0.6, '--atn-goat');
      }
      function hen(x, z, r, i) {
        var g = at(x, 0, z, r);
        var body = new T.SphereGeometry(0.16, 8, 6); body.scale(1, 0.85, 1.3);
        kit.piece(body, M(g, at(0, 0.24, 0)), i % 2 ? '--atn-hen' : '--atn-hen-brown', 0.01);
        kit.piece(new T.SphereGeometry(0.08, 6, 5), M(g, at(0, 0.38, 0.15)), i % 2 ? '--atn-hen' : '--atn-hen-brown', 0.008);
        box(0.02, 0.06, 0.08, M(g, at(0, 0.47, 0.15)), '--atn-comb', false);
      }
      [[-11.4, -2.5], [-12.6, -6.0], [-11.0, -9.5], [-13.0, -13.0], [-11.8, -16.5]].forEach(function (p, i) { sheep(p[0], p[1], hash(i, 8, 1) * 6, i); });
      [[11.6, -4.0], [12.4, -11.5]].forEach(function (p, i) { goat(p[0], p[1], 2 + hash(i, 9, 1) * 2); });
      for (var h = 0; h < 7; h++) hen((hash(h, 10, 1) - 0.5) * 1.6 + (h % 2 ? 1.9 : -1.9), -4 - h * 2.1, hash(h, 10, 2) * 6, h);

      // THE BROOK, winding in from the left behind the barn, and the line of
      // trees along the back.
      for (var s = 0; s < 22; s++) {
        var bx0 = -60 + s * 3.2, bz0 = -33 + Math.sin(s * 0.55) * 2.2;
        kit.flat(new T.PlaneGeometry(3.6, 1.4 + hash(s, 11, 1) * 0.6), at(bx0, 0.01, bz0, -Math.cos(s * 0.55) * 0.5, -Math.PI / 2), '--atn-brook');
        if (bx0 > 6) break;
      }
      for (var t = 0; t < 34; t++) {
        var tx = -70 + t * 4.3 + hash(t, 12, 1) * 2, tz = -40 - hash(t, 12, 2) * 6, th = 4 + hash(t, 12, 3) * 3;
        cyl(0.2, 0.3, th * 0.45, at(tx, th * 0.22, tz), '--atn-trunk', 0.02, 7);
        var tc = new T.IcosahedronGeometry(1.8 + hash(t, 12, 4), 1); tc.scale(1, 1.25, 1);
        kit.piece(tc, at(tx, th * 0.55 + 1.6, tz, t), '--atn-leaf', 0.03);
      }

      // THE BARN at the back on the left, red, its doors open wide; inside,
      // the screen in the barn.
      var BF = BZ + BD / 2, DOOR = 3.0, DOORH = 2.9;
      box(0.3, BH, BD, at(BX - BW / 2, BH / 2, BZ), '--atn-barn');
      box(0.3, BH, BD, at(BX + BW / 2, BH / 2, BZ), '--atn-barn');
      box(BW, BH, 0.3, at(BX, BH / 2, BZ - BD / 2), '--atn-barn');
      box((BW - DOOR) / 2, BH, 0.3, at(BX - (BW + DOOR) / 4, BH / 2, BF), '--atn-barn');
      box((BW - DOOR) / 2, BH, 0.3, at(BX + (BW + DOOR) / 4, BH / 2, BF), '--atn-barn');
      box(DOOR, BH - DOORH, 0.3, at(BX, (BH + DOORH) / 2, BF), '--atn-barn');
      box(BW, 0.06, BD, at(BX, 0.01, BZ), '--atn-soil', false, false);
      // The roof, two slopes and the gable ends.
      var pitch = 0.62, half = BW / 2 / Math.cos(pitch);
      [-1, 1].forEach(function (s) {
        box(half + 0.3, 0.16, BD + 0.6, at(BX + s * BW / 4, BH + Math.tan(pitch) * BW / 4, BZ, 0, 0, -s * pitch), '--atn-roof', 0.02);
      });
      [BF, BZ - BD / 2].forEach(function (z) {
        var gable = new T.BufferGeometry();
        gable.setAttribute('position', new T.Float32BufferAttribute([-BW / 2, 0, 0, BW / 2, 0, 0, 0, Math.tan(pitch) * BW / 2, 0], 3));
        gable.computeVertexNormals();
        kit.piece(gable, at(BX, BH, z + (z === BF ? 0.16 : -0.16), z === BF ? 0 : Math.PI), '--atn-barn', false);
      });
      // The doors, swung out flat against the front.
      [-1, 1].forEach(function (s) {
        box(DOOR / 2, DOORH, 0.08, at(BX + s * (DOOR / 2 + DOOR / 4 + 0.1), DOORH / 2, BF + 0.2), '--atn-barn-door', 0.015);
      });

      // THE OLD DAIRY beside it, small and white, a café now: its door is the
      // way in, and what goes to it is on the board by the door.
      var DF = DZ + DD / 2;
      box(DW, DH, DD, at(DX, DH / 2, DZ), '--atn-dairy');
      [-1, 1].forEach(function (s) {
        box(DW / 2 / Math.cos(0.5) + 0.25, 0.14, DD + 0.4, at(DX + s * DW / 4, DH + Math.tan(0.5) * DW / 4, DZ, 0, 0, -s * 0.5), '--atn-roof', 0.02);
      });
      box(1.0, 2.0, 0.08, at(DX, 1.0, DF + 0.03), '--atn-roof', 0.01);
      [-1.4, 1.4].forEach(function (o) { box(0.5, 0.3, 0.06, at(DX + o, 2.3, DF + 0.03), '--atn-roof', 0.008); });

      // BOARDS AT THE LANE'S EDGE, each a plank on two posts, standing the
      // page's own words up where they belong on the farm. Lifted words are
      // laid over the picture, so each shows only while you are near it.
      function board(x, z, rot, w, h) {
        var g = at(x, 0, z, rot);
        box(w + 0.2, h + 0.2, 0.08, M(g, at(0, 0.6 + h / 2, -0.06)), '--atn-trunk', 0.015);
        [-w / 2, w / 2].forEach(function (o) { box(0.1, 0.6 + h + 0.1, 0.1, M(g, at(o, (0.6 + h + 0.1) / 2, -0.12)), '--atn-trunk', 0.01); });
        return M(g, at(0, 0.6, 0));
      }
      function zone(x, z) { return [x - 3.4, x + 3.4, z - 2.6, z + 2.6]; }
      var EDGE = 2.4, LANE = 0.2;
      var lifted = [];
      function sign(side, z, sel, opts, said) {
        var x = side * EDGE, rot = side < 0 ? LEFT : RIGHT;
        var w = 2.2, h = 1.9;
        var it = kit.lift(page, sel, Object.assign({ w: 720, h: 620, ww: w, m: board(x, z, rot, w, h), zone: zone(0, z) }, opts || {}));
        lifted.push({ name: said, x: -side * LANE, z: z, yaw: rot, pitch: 0.0, frame: it.el });
        return it;
      }

      // THE FARM'S OWN PAGE, on a board by the gate on the right.
      var pw = 2.6, ph = pw * 800 / 1180;
      var pg = at(EDGE + 0.2, 0, 3.4, RIGHT);
      box(pw + 0.2, ph + 0.2, 0.08, M(pg, at(0, 0.9 + ph / 2, -0.06)), '--atn-trunk', 0.015);
      [-pw / 2, pw / 2].forEach(function (o) { box(0.12, 0.9 + ph, 0.12, M(pg, at(o, (0.9 + ph) / 2, -0.12)), '--atn-trunk', 0.01); });
      var page = kit.screen(1180, 800, pw, M(pg, at(0, 0.9 + ph / 2, 0)), 'All Together Now Farms’ own page, on a board by the gate', zone(0, 3.4));

      sign(-1, 3.4, '.atn-lede', { h: 0 }, 'on the left by the gate: two lights at once');
      sign(-1, -1.6, '.atn-part', { n: 1 }, 'on the left: mixed farming');
      sign(1, -1.6, '.atn-part', { n: 2 }, 'on the right: agroforestry, and the five practices');
      sign(-1, -6.2, '.atn-part', { n: 3 }, 'on the left by the mounds: the Three Sisters, and whose they are');
      sign(1, -6.2, '.atn-part', { n: 4 }, 'on the right by the goats: the animals');
      sign(-1, -10.8, '.atn-part', { n: 5 }, 'on the left: what grows');
      sign(-1, -15.4, '.atn-rules', {}, 'on the left: on the farm');
      sign(1, -15.4, '.atn-part', { n: 6 }, 'on the right: the milk is pasteurised');

      // WHERE IT GOES, on a board beside the old dairy's door.
      var where = kit.lift(page, '.atn-where', { w: 720, ww: 2.0, m: board(DX - DW / 2 - 1.4, DF + 0.4, 0, 2.0, 1.3), zone: [DX - 5, DX + 3, DF - 1, DF + 5] });

      // THE SCREEN IN THE BARN, on the back wall inside, and the two racks on
      // the side walls; rack.js plays them as it does on the page.
      var IN = [BX - BW / 2, BX + BW / 2, BZ - BD / 2, BF + 1.4];
      var screen = kit.lift(page, '.atn-screen', { w: 820, ww: 3.0, m: at(BX, 0.9, BZ - BD / 2 + 0.2), zone: IN });
      var now = kit.lift(page, '.atn-screen__now', { w: 760, ww: 2.4, m: at(BX, 0.45, BZ - BD / 2 + 0.2), zone: IN });
      kit.lift(page, '.atn-screen__back', { w: 640, ww: 1.8, m: at(BX, 0.1, BZ - BD / 2 + 0.2), zone: IN });
      var picked = kit.lift(page, '.atn-rack', { n: 0, w: 760, h: 760, ww: 2.4, m: at(BX - BW / 2 + 0.2, 0.5, BZ, LEFT), zone: IN });
      var month = kit.lift(page, '.atn-rack', { n: 1, w: 760, h: 760, ww: 2.4, m: at(BX + BW / 2 - 0.2, 0.5, BZ, RIGHT), zone: IN });
      kit.wire(page, 'rack.js');

      var stops = [
        { name: 'in at the gate, the sun going down on the left and the moon coming up on the right', where: 'at the gate', x: 0, z: 4.4, yaw: 0, pitch: 0.04 },
        { name: 'at the board by the gate, with the farm’s own page on it', where: 'at the farm’s own page', x: LANE, z: 3.4, yaw: RIGHT, pitch: 0.06, page: kit.page, frame: page }
      ].concat(lifted).concat([
        { name: 'in the lane between the rows, the sun on every left side and the moon on every right', where: 'between the rows', x: 0, z: -12.8, yaw: 0, pitch: 0.05 },
        { name: 'The Dairy', room: 'The Dairy', where: 'at the door of the old dairy, a café now, where everything the land grows goes', x: DX, z: DF + 2.6, yaw: 0, pitch: 0.06, page: 'the-dairy.html' },
        { name: 'by the old dairy’s door: where it goes', where: 'by the old dairy’s door, at where it goes', x: DX - DW / 2 - 1.4, z: DF + 2.8, yaw: 0, pitch: 0.06, frame: where.el },
        { name: 'in the barn, at the screen', where: 'in the barn, at the screen, dark until somebody presses something', x: BX, z: BZ - 0.2, yaw: 0, pitch: 0.06, frame: screen.el },
        { name: 'under the screen: what is on it, and the way back', where: 'under the screen in the barn', x: BX, z: BZ - 0.6, yaw: 0, pitch: -0.22, frame: now.el },
        { name: 'in the barn, at the rack on the left: films about mixed farming, agroforestry and the Three Sisters', where: 'at the rack on the left in the barn', x: BX - BW / 2 + 2.4, z: BZ, yaw: LEFT, pitch: 0.02, frame: picked.el },
        { name: 'in the barn, at the rack on the right: Farming While Beige’s month', where: 'at the rack on the right in the barn', x: BX + BW / 2 - 2.4, z: BZ, yaw: RIGHT, pitch: 0.02, frame: month.el }
      ]);

      return {
        start: { x: 0, z: 4.4, yaw: 0 },
        bounds: { x: [-14, 14], z: [BZ - BD / 2 + 0.8, NEAR - 0.4] },
        stops: stops
      };
    }
  };
})();

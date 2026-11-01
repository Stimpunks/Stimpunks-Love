/* =============================================================================
   Learning Large, walked into on Cel Street. Ryan's ask, 2026-10-31: back on
   the street, working down it a room at a time.

   IT IS LEARNING LARGE'S WORLD AND NOBODY ELSE'S (§92): a glasshouse at night
   with every grow lamp on. THE LIGHT IS A SPIKY ONE: the lamps are the old red
   and blue kind, so the scene is lit by a red light and a blue light from a
   little either side of the ridge, and where the two land together the light
   is magenta, while a seedling or a tray standing in one and not the other
   throws a shadow that comes out red on one side and blue on the other. That
   split is only ever a shadow on the trays and the floor: every word in here
   is lifted off the page and lit by nothing. NOTHING IN THE ROOM IS GREEN,
   because under that light a leaf has no green to give back: the seedlings
   are the page's near-black leaf. THE ROOF IS A MIRROR: at night the glass
   shows the lamps back, a magenta smear on the pane over every fixture, and
   no sky.

   MYCELIUM MUNCHIES IS THE ONE TO WATCH: its lamps are heat lamps, red alone,
   over a pass where food is served. These are red AND blue, over seed trays
   nobody eats from. The Garden, where these are planted out, is midday through
   leaves; this is night under a roof that shows nothing of the sky. Nothing is
   drawn as the machine and nobody is drawn at all.

   THE RACK AND THE BENCH SCREEN ARE THE PAGE'S OWN, lifted off it by the kit,
   and rack.js, the page's own script, plays a card where it hangs or puts it
   up on the bench screen; nothing reaches YouTube until a press, and the
   titles are the channels' own. The propagation bench, the practices and the
   spiky profiles are lifted too, as they stand on the page.

   NOTHING MOVES. Every colour is one Learning Large declares, by name. It keeps
   nothing, sends nothing and fetches nothing; its page arrives through Cel
   Street's screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['learning-large.html'] = {
    name: 'Learning Large',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var W = 10, D = 18, E = 3.0, R = 4.8, back = -D;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var slope = Math.atan2(R - E, W / 2), L = Math.hypot(W / 2, R - E);

      // THE NIGHT outside, and the two lamps' colours: a red light from a
      // little left of the ridge and a blue one from a little right, each with
      // its own shadow, so a thing's shadow is red on one side and blue on the
      // other and the light is magenta wherever both land. A low magenta fill
      // from the glass all round, which is the lamps coming back off it.
      kit.scene.background = kit.col('--ll-night');
      kit.scene.add(new T.HemisphereLight(kit.col('--ll-lamp'), kit.col('--ll-night'), 0.55));
      [['--ll-red', -1.1], ['--ll-blue', 1.1]].forEach(function (l) {
        var d = new T.DirectionalLight(kit.col(l[0]), 2.2);
        // Its camera starts just under the lamp bars, so the roof, the
        // rafters and the bars themselves throw no shadow: the light comes
        // from the lamps, not from the sky.
        d.position.set(l[1], 2.25, -D / 2);
        d.target.position.set(0, 0, -D / 2);
        d.castShadow = true;
        d.shadow.mapSize.set(2048, 2048);
        var c = d.shadow.camera;
        c.left = -W / 2 - 1; c.right = W / 2 + 1; c.top = D / 2 + 1; c.bottom = -D / 2 - 1; c.near = 0.01; c.far = 4;
        d.shadow.bias = -0.0006; d.shadow.normalBias = 0.03;
        kit.scene.add(d, d.target);
      });

      // THE FLOOR: dark gravel either side, boards down the aisle.
      box(W, 0.1, D + 0.4, at(0, -0.05, -D / 2), '--ll-night', false, false);
      box(1.6, 0.04, D, at(0, 0.02, -D / 2), '--ll-bar', 0.01, false);

      // THE HOUSE: a low wall each side and glass above it to the eaves, the
      // glazing bars every pace and a half, the gabled roof of glass on its
      // rafters, and the ridge.
      [-1, 1].forEach(function (s) {
        box(0.25, 0.8, D, at(s * W / 2, 0.4, -D / 2), '--ll-bar');
        box(0.04, E - 0.8, D, at(s * (W / 2 - 0.02), 0.8 + (E - 0.8) / 2, -D / 2), '--ll-glass', false, false);
        for (var z = 0; z >= back; z -= 1.5) box(0.08, E - 0.8, 0.06, at(s * (W / 2 - 0.05), 0.8 + (E - 0.8) / 2, z), '--ll-bar', false, false);
        box(0.12, 0.1, D, at(s * (W / 2 - 0.05), E, -D / 2), '--ll-bar', false, false);
        // The roof's slope on this side, and its rafters.
        box(L, 0.04, D, at(s * W / 4, (E + R) / 2, -D / 2, 0, 0, -s * slope), '--ll-glass', false, false);
        for (var r = 0; r >= back; r -= 1.5) box(L, 0.08, 0.06, at(s * W / 4, (E + R) / 2 - 0.05, r, 0, 0, -s * slope), '--ll-bar', false, false);
      });
      box(0.14, 0.14, D, at(0, R - 0.05, -D / 2), '--ll-bar', false, false);

      // THE ENDS: glass to the gable, the door in the near end you came in by.
      var gable = new T.Shape();
      gable.moveTo(-W / 2, E); gable.lineTo(W / 2, E); gable.lineTo(0, R); gable.lineTo(-W / 2, E);
      [0, back].forEach(function (z) {
        kit.piece(new T.ExtrudeGeometry(gable, { depth: 0.04, bevelEnabled: false }), at(0, 0, z - 0.02), '--ll-glass', false, false);
        box(0.25, 0.8, 0.25, at(-W / 2 + 0.12, 0.4, z), '--ll-bar');
        box(0.25, 0.8, 0.25, at(W / 2 - 0.12, 0.4, z), '--ll-bar');
      });
      box(W, E, 0.04, at(0, E / 2, back), '--ll-glass', false, false);
      for (var g = -W / 2; g <= W / 2 + 0.01; g += 1.25) box(0.06, E, 0.08, at(g, E / 2, back + 0.02), '--ll-bar', false, false);
      [-1, 1].forEach(function (s) {
        box((W - 1.4) / 2, E, 0.04, at(s * (W + 1.4) / 4, E / 2, 0), '--ll-glass', false, false);
        box(0.08, 2.4, 0.1, at(s * 0.7, 1.2, -0.02), '--ll-bar', false);
      });
      box(1.4, E - 2.4, 0.04, at(0, 2.4 + (E - 2.4) / 2, 0), '--ll-glass', false, false);
      box(1.48, 0.08, 0.1, at(0, 2.4, -0.02), '--ll-bar', false);

      // THE BENCHES, one down each side: slatted tops at hand height, a shelf
      // of empty trays under them, and on top the seed trays, row after row,
      // every seedling the page's near-black leaf.
      var B0 = -2.6, B1 = -15.4, BX = 3.05, BW = 1.6, BH = 0.85;
      [-1, 1].forEach(function (s) {
        var x = s * BX, len = B0 - B1, mid = (B0 + B1) / 2;
        box(BW, 0.06, len, at(x, BH, mid), '--ll-bar', 0.012);
        box(BW - 0.1, 0.04, len, at(x, 0.28, mid), '--ll-bar', false);
        for (var lz = B0 - 0.1; lz >= B1 + 0.05; lz -= 2.1) {
          [-1, 1].forEach(function (e) { box(0.06, BH, 0.06, at(x + e * (BW / 2 - 0.06), BH / 2, lz), '--ll-bar', false); });
        }
        for (var sz = B0 - 0.6; sz >= B1 + 0.4; sz -= 1.3) box(0.6, 0.12, 0.4, at(x + (sz % 2 ? 0.3 : -0.3), 0.36, sz), '--ll-tray', false);
        var k = 0;
        for (var tz = B0 - 0.3; tz >= B1 + 0.25; tz -= 0.48) {
          [-1, 1].forEach(function (e) {
            var tx = x + e * 0.38;
            box(0.62, 0.07, 0.42, at(tx, BH + 0.065, tz), '--ll-tray', 0.008);
            for (var i = 0; i < 3; i++) for (var j = 0; j < 2; j++) {
              k++;
              var hgt = 0.06 + ((k * 37) % 7) * 0.012;
              kit.piece(new T.ConeGeometry(0.035, hgt, 5), at(tx - 0.18 + i * 0.18, BH + 0.1 + hgt / 2, tz - 0.09 + j * 0.18), '--ll-leaf', false);
            }
          });
        }
        // The lamps over this bench: a bar on two wires every three paces,
        // its diodes red and blue in turn along the underside, and its
        // reflection lying in the roof's glass over it.
        var yRoof = E + (W / 2 - BX) * Math.tan(slope), fx = 0;
        for (var fz = B0 - 1.0; fz >= B1 + 0.5; fz -= 3.0) {
          box(1.3, 0.06, 0.24, at(x, 2.35, fz), '--ll-bar', 0.01, false);
          [-0.5, 0.5].forEach(function (e) { cyl(0.008, 0.008, yRoof - 2.38, at(x + e, (yRoof + 2.38) / 2, fz), '--ll-bar', false, 4); });
          for (var dn = 0; dn < 8; dn++) {
            kit.flat(new T.BoxGeometry(0.1, 0.02, 0.06), at(x - 0.56 + dn * 0.16, 2.31, fz - 0.05), dn % 2 ? '--ll-blue' : '--ll-red');
            kit.flat(new T.BoxGeometry(0.1, 0.02, 0.06), at(x - 0.56 + dn * 0.16, 2.31, fz + 0.05), dn % 2 ? '--ll-red' : '--ll-blue');
          }
          kit.flat(new T.BoxGeometry(1.1, 0.01, 0.2), at(x, yRoof - 0.06, fz, 0, 0, -s * slope), '--ll-lamp');
          var lp = new T.PointLight(kit.col((fx++ + (s > 0 ? 1 : 0)) % 2 ? '--ll-blue' : '--ll-red'), 4, 4.5, 1.6);
          lp.position.set(x, 2.15, fz);
          kit.scene.add(lp);
        }
      });

      // THE POTTING BENCH across the far end, pots and a stack of trays on
      // it, and the bench screen propped up behind them.
      var PZ = back + 0.75;
      box(4.4, 0.08, 0.9, at(0, 0.92, PZ), '--ll-bar', 0.012);
      [-2.1, 2.1].forEach(function (x) { [-0.38, 0.38].forEach(function (dz) { box(0.07, 0.92, 0.07, at(x, 0.46, PZ + dz), '--ll-bar', false); }); });
      [[-1.8, 0.1], [-1.55, -0.12], [1.6, 0.05]].forEach(function (p) { cyl(0.11, 0.08, 0.18, at(p[0], 1.05, PZ + p[1]), '--ll-tray', 0.01, 10); });
      for (var st = 0; st < 4; st++) box(0.6, 0.06, 0.4, at(1.85, 0.99 + st * 0.065, PZ - 0.15), '--ll-tray', 0.006);
      box(3.0, 1.85, 0.06, at(0, 2.15, back + 0.12), '--ll-bar', 0.01);

      // HER PAGE, the room's own, on a board over the right-hand bench by the
      // door, and the page's own parts on the benches and the far end.
      var pw = 2.3, ph = pw * 800 / 1180, py = 1.1 + ph / 2;
      var pg = at(W / 2 - 0.1, 0, -4.4, RIGHT);
      box(pw + 0.16, ph + 0.16, 0.05, M(pg, at(0, py, 0)), '--ll-bar', 0.01);
      var page = kit.screen(1180, 800, pw, M(pg, at(0, py, 0.04)), 'Learning Large’s own page, over the right-hand bench by the door');

      var screen = kit.lift(page, '.ll-screen', { w: 860, ww: 2.8, m: at(0, 1.3, back + 0.17) });
      var now = kit.lift(page, '.ll-screen__now', { w: 760, ww: 2.2, m: at(0, 0.62, PZ + 0.47) });
      var off = kit.lift(page, '.ll-screen__back', { w: 420, ww: 1.2, m: at(0, 0.32, PZ + 0.47) });
      var rack = kit.lift(page, '.ll-racked', { w: 820, h: 640, ww: 2.6, m: at(-W / 2 + 0.12, 1.0, -7.6, LEFT) });
      kit.wire(page, 'rack.js');
      var bench = kit.lift(page, '.ll-bench', { w: 820, h: 660, ww: 2.4, m: at(-W / 2 + 0.12, 1.0, -12.4, LEFT) });
      var practices = kit.lift(page, '.ll-part', { n: 1, w: 760, h: 640, ww: 2.2, m: at(W / 2 - 0.12, 1.0, -8.6, RIGHT) });
      var spiky = kit.lift(page, '.ll-part', { n: 0, w: 760, h: 640, ww: 2.2, m: at(W / 2 - 0.12, 1.0, -12.6, RIGHT) });
      var sign = kit.lift(page, '.ll-head', { w: 760, ww: 2.0, m: at(0, 2.5, -0.05, Math.PI) });
      // Boards behind what hangs over the benches.
      [[-1, -7.6], [-1, -12.4], [1, -8.6], [1, -12.6]].forEach(function (b) {
        box(0.05, 1.95, 2.7, at(b[0] * (W / 2 - 0.08), 1.95, b[1]), '--ll-bar', 0.008);
      });

      var stops = [
        { name: 'just inside the door, the lamps on over every bench and their light lying in the roof', x: 0, z: -1.2, yaw: 0, pitch: 0.05 },
        { name: 'at the right-hand bench, with the room’s own page on the board over it', x: 1.7, z: -4.4, yaw: RIGHT, pitch: 0.12, page: kit.page, frame: page },
        { name: 'at the left-hand bench, with the rack of the month on the board over it', x: -1.7, z: -7.6, yaw: LEFT, pitch: 0.14, frame: rack.el },
        { name: 'at the right-hand bench, with how the two kinds of spike complement each other', x: 1.7, z: -8.6, yaw: RIGHT, pitch: 0.14, frame: practices.el },
        { name: 'down among the seed trays, the shadows red on one side and blue on the other', x: 1.3, z: -10.2, yaw: -1.0, pitch: -0.5 },
        { name: 'at the left-hand bench, with the propagation bench drawn over it', x: -1.7, z: -12.4, yaw: LEFT, pitch: 0.12, frame: bench.el },
        { name: 'at the right-hand bench, with what spiky means for a model and for us', x: 1.7, z: -12.6, yaw: RIGHT, pitch: 0.12, frame: spiky.el },
        { name: 'at the potting bench at the far end, with the bench screen propped up behind it', x: 0, z: back + 3.4, yaw: 0, pitch: 0.12, frame: screen.el },
        { name: 'looking up at the roof, the lamps shown back in the glass where the sky would be', x: 0, z: -9, yaw: 0, pitch: 0.75 },
        { name: 'looking back at the door, with the room’s name over it', x: 0, z: -4.2, yaw: Math.PI, pitch: 0.2, frame: sign.el }
      ];

      return {
        start: { x: 0, z: -1.2, yaw: 0 },
        bounds: { x: [-1.9, 1.9], z: [back + 1.7, -0.6], areas: [
          { x: [-1.9, 1.9], z: [back + 1.7, -0.6] },
          { x: [-W / 2 + 0.9, W / 2 - 0.9], z: [-2.4, -0.6] },
          { x: [-W / 2 + 0.9, W / 2 - 0.9], z: [back + 1.7, B1 - 0.3] }
        ] },
        stops: stops
      };
    }
  };
})();

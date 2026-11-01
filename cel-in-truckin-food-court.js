/* =============================================================================
   Truckin' Food Court, walked into on Cel Street, through its gate on the open
   ground past the last building. Ryan's ask, 2026-11-01: on from the doors to
   the street's gates.

   IT IS THE TRUCK STOP'S WORLD AND NOBODY ELSE'S (§97): a sunny lot of pale
   concrete with five trucks parked round it, a covered porch of tables, and the
   lots next door showing over the back fence. THE LIGHT COMES THROUGH THE
   AWNINGS: every truck has its awning out over its hatch, its colour striped
   with canvas, and the sun through it lays the same stripes on the counter and
   on the ground in front. They are the street's only stripes of light, so each
   is a colour and canvas and NOTHING DARK BETWEEN THEM, outdoors; everywhere
   between the trucks the lot is plain sun. All the colour at the Truck Stop is
   under an awning. Hey, Good Cookin' is the other place that feeds people for
   nothing, and it is a hall with its windows steamed up; this is outdoors, dry
   and the middle of the day.

   EVERY TRUCK'S BOARD IS THE PAGE'S OWN, lifted off it and never retyped, so
   every card says what is in it and which allergens, as the page does; its
   Bring it to my table is the page's own script's and is done on its screen.
   Nothing has a price, and the boards say so themselves. The screen on the
   side of the Cooler and its rack are the page's too, and rack.js, the page's
   own script, plays a film where it hangs or puts it up on the screen.

   NOTHING MOVES and nothing tilts, and no steam rises: the trucks are parked.
   Everything is outlined in the ink, and every colour is one the Truck Stop
   declares, by name. It keeps nothing and sends nothing; its page arrives
   through Cel Street's screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['truckin-food-court.html'] = {
    name: 'Truckin’ Food Court',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var X = 12, BACK = -18;

      // NOON, and sun everywhere but under an awning or the porch roof.
      kit.scene.background = kit.col('--tks-day');
      kit.scene.add(new T.HemisphereLight(kit.col('--tks-day'), kit.col('--tks-lot'), 1.5));
      var sun = new T.DirectionalLight(kit.col('--tks-paper'), 1.3);
      sun.position.set(-6, 14, 4);
      sun.target.position.set(1, 0, -12);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      sun.shadow.camera.left = -18; sun.shadow.camera.right = 18;
      sun.shadow.camera.top = 18; sun.shadow.camera.bottom = -18;
      sun.shadow.camera.near = 0.5; sun.shadow.camera.far = 40;
      sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.04;
      kit.scene.add(sun, sun.target);

      // THE LOT: pale concrete in the sun, a line of joints across it, and the
      // fence round three sides with the gate you came in by in the near one.
      box(2 * X + 4, 0.1, -BACK + 4, at(0, -0.05, BACK / 2), '--tks-lot', false, false);
      for (var j = -4; j > BACK; j -= 4) kit.flat(new T.PlaneGeometry(2 * X, 0.04), at(0, 0.002, j, 0, -Math.PI / 2), '--tks-fence');
      function fence(x0, z0, x1, z1) {
        var len = Math.hypot(x1 - x0, z1 - z0), ry = Math.atan2(x1 - x0, z1 - z0) - Math.PI / 2;
        var g = at((x0 + x1) / 2, 0, (z0 + z1) / 2, ry);
        // The fence casts no shadow: its pickets would lay dark bars across
        // the lot, and the awnings' are the only stripes of light here.
        box(len, 0.08, 0.05, M(g, at(0, 1.55, 0)), '--tks-fence', 0.012, false);
        box(len, 0.08, 0.05, M(g, at(0, 0.45, 0)), '--tks-fence', 0.012, false);
        for (var s = -len / 2; s <= len / 2 + 0.01; s += 0.3) box(0.12, 1.7, 0.03, M(g, at(s, 0.85, 0.04)), '--tks-fence', false, false);
      }
      fence(-X, BACK, X, BACK);
      fence(-X, BACK, -X, 0.6);
      fence(X, BACK, X, 0.6);
      fence(-X, 0.6, -1.4, 0.6);
      fence(1.4, 0.6, X, 0.6);
      [-1.4, 1.4].forEach(function (x) { box(0.16, 2.1, 0.16, at(x, 1.05, 0.6), '--tks-fence', 0.014); });

      // THE TREES of the lots next door, over the back fence and the sides.
      function tree(x, z, s) {
        cyl(0.12 * s, 0.16 * s, 2.4 * s, at(x, 1.2 * s, z), '--tks-fence', 0.012, 8);
        kit.facets(new T.IcosahedronGeometry(1.25 * s, 1), at(x, 2.9 * s, z), '--tks-trees');
        kit.facets(new T.IcosahedronGeometry(0.85 * s, 1), at(x + 0.7 * s, 3.4 * s, z + 0.3), '--tks-trees');
      }
      [[-9, -21, 1.2], [-4, -22, 1.4], [1.5, -21.5, 1.1], [6.5, -22.5, 1.5], [10.5, -21, 1.2],
       [-15, -14, 1.3], [-15.5, -6, 1.1], [15, -15, 1.4], [15.5, -6, 1.2]].forEach(function (t) { tree(t[0], t[1], t[2]); });

      // THE TRUCKS, round the lot facing the middle of it. Each is a white box
      // on wheels with a cab at one end, a hatch on the side facing you with a
      // steel counter under it and a low counter at its end, and its awning out
      // over the hatch: the awning's own colour striped with canvas, and the
      // same stripes again on the counter and on the ground in front, where the
      // sun comes through it. Nothing dark between the stripes.
      var TRUCKS = [
        { what: 'the tacos truck', awn: '--tks-marigold', x: -8.0, z: -9.6 },
        { what: 'the bánh mì truck', awn: '--tks-jade', x: -4.3, z: -12.9 },
        { what: 'the ramen truck', awn: '--tks-vermilion', x: 0.5, z: -14.0 },
        { what: 'the dog treats truck', awn: '--tks-sky', x: 5.3, z: -12.8 },
        { what: 'the Cooler, the drinks truck', awn: '--tks-plum', x: 8.6, z: -9.0 }
      ];
      var L = 4.2, Wd = 2.2, Hb = 2.3, RIDE = 0.5, HATCH = 1.25;
      var MID = { x: 0, z: -3.5 };
      TRUCKS.forEach(function (t, n) {
        t.ry = Math.atan2(MID.x - t.x, MID.z - t.z);
        var g = at(t.x, 0, t.z, t.ry);
        t.g = g;
        // The body and its roof, the cab at the right-hand end, and its glass.
        box(L, Hb, Wd, M(g, at(0, RIDE + Hb / 2, 0)), '--tks-white', 0.02);
        box(L + 0.1, 0.12, Wd + 0.1, M(g, at(0, RIDE + Hb + 0.06, 0)), '--tks-steel', 0.014);
        box(1.4, 1.6, Wd - 0.1, M(g, at(L / 2 + 0.7, RIDE + 0.8, 0)), '--tks-white', 0.02);
        kit.flat(new T.PlaneGeometry(1.1, 0.6), M(g, at(L / 2 + 0.8, RIDE + 1.15, Wd / 2 - 0.04)), '--tks-day');
        kit.flat(new T.PlaneGeometry(1.75, 0.55), M(g, at(L / 2 + 1.41, RIDE + 1.15, 0, Math.PI / 2)), '--tks-day');
        // Four wheels and their hubs.
        [[-L / 2 + 0.8, 1], [-L / 2 + 0.8, -1], [L / 2 + 0.7, 1], [L / 2 + 0.7, -1]].forEach(function (w) {
          cyl(0.38, 0.38, 0.26, M(g, at(w[0], 0.38, w[1] * (Wd / 2), 0, Math.PI / 2)), '--tks-roof', 0.012, 18);
          cyl(0.16, 0.16, 0.28, M(g, at(w[0], 0.38, w[1] * (Wd / 2), 0, Math.PI / 2)), '--tks-steel', false, 12);
        });
        // The hatch, the kitchen inside it, the counter and the low counter.
        var hz = Wd / 2 + 0.01;
        kit.flat(new T.PlaneGeometry(2.6, 1.0), M(g, at(-0.25, RIDE + HATCH + 0.5, hz)), '--tks-kitchen');
        box(2.8, 0.06, 0.08, M(g, at(-0.25, RIDE + HATCH + 1.03, hz + 0.02)), '--tks-steel', 0.01);
        box(2.8, 0.07, 0.45, M(g, at(-0.25, RIDE + HATCH - 0.02, hz + 0.2)), '--tks-steel', 0.012);
        box(0.9, 0.06, 0.55, M(g, at(-L / 2 - 0.4, 0.9, hz - 0.2)), '--tks-steel', 0.012);
        box(0.06, 0.9, 0.5, M(g, at(-L / 2 - 0.82, 0.45, hz - 0.2)), '--tks-steel', false);

        // THE AWNING over the hatch: stripes of the truck's colour and the
        // canvas, sloping out and down, and their light on the counter and the
        // ground below, the same stripes laid flat.
        var STRIPES = 9, sw = 3.2 / STRIPES, reach = 1.5, drop = 0.42;
        var slope = Math.atan2(drop, reach), lip = RIDE + HATCH + 1.25;
        for (var s = 0; s < STRIPES; s++) {
          var sx = -0.25 - 1.6 + sw * (s + 0.5), ink = s % 2 ? '--tks-canvas' : t.awn;
          box(sw, 0.03, Math.hypot(reach, drop), M(g, at(sx, lip - drop / 2, hz + reach / 2, 0, slope)), ink, false);
          box(sw, 0.16, 0.025, M(g, at(sx, lip - drop - 0.08, hz + reach)), ink, false);
          kit.flat(new T.PlaneGeometry(sw, 0.44), M(g, at(sx, RIDE + HATCH + 0.017, hz + 0.2, 0, -Math.PI / 2)), ink);
          kit.flat(new T.PlaneGeometry(sw, 1.7), M(g, at(sx + 0.35, 0.006, hz + 1.55, 0, -Math.PI / 2)), ink);
        }
        // Its two arms, steel, out to the awning's lip.
        [-1.85, 1.35].forEach(function (ax) {
          box(0.04, 0.04, Math.hypot(reach, drop), M(g, at(ax, lip - drop / 2 - 0.04, hz + reach / 2, 0, slope)), '--tks-steel', false);
        });
      });

      // What waits on each counter: a paper boat of tacos, a wrapped bánh mì, a
      // bowl of ramen, a bag of treats, and cups with straws at the Cooler.
      function onCounter(t, x, f) { f(M(t.g, at(x, RIDE + HATCH + 0.03, Wd / 2 + 0.24))); }
      function boat(m) {
        box(0.3, 0.07, 0.18, M(m, at(0, 0.035, 0)), '--tks-kraft', 0.006);
        cyl(0.06, 0.06, 0.22, M(m, at(0, 0.09, 0, 0, Math.PI / 2)), '--tks-corn', 0.005, 10);
      }
      function cup(m, drink) {
        cyl(0.06, 0.05, 0.17, M(m, at(0, 0.085, 0)), '--tks-cup', 0.006, 14);
        cyl(0.052, 0.052, 0.11, M(m, at(0, 0.06, 0)), drink, false, 14);
        cyl(0.008, 0.008, 0.18, M(m, at(0.015, 0.2, 0, 0, 0.15)), '--tks-straw', false, 6);
      }
      onCounter(TRUCKS[0], -1.0, boat); onCounter(TRUCKS[0], -0.4, boat);
      onCounter(TRUCKS[1], -0.6, function (m) {
        cyl(0.055, 0.055, 0.36, M(m, at(0, 0.06, 0, 0, 0, Math.PI / 2)), '--tks-crust', 0.006, 10);
        box(0.16, 0.08, 0.13, M(m, at(0.05, 0.04, 0)), '--tks-kraft', 0.005);
      });
      onCounter(TRUCKS[2], -0.8, function (m) {
        cyl(0.16, 0.1, 0.11, M(m, at(0, 0.055, 0)), '--tks-bowl', 0.006, 18);
        cyl(0.14, 0.14, 0.01, M(m, at(0, 0.105, 0)), '--tks-noodle', false, 18);
      });
      onCounter(TRUCKS[3], -0.6, function (m) {
        box(0.16, 0.24, 0.1, M(m, at(0, 0.12, 0)), '--tks-kraft', 0.006);
        box(0.16, 0.04, 0.1, M(m, at(0, 0.26, 0)), '--tks-kraft', 0.006);
      });
      onCounter(TRUCKS[4], -1.1, function (m) { cup(m, '--tks-lemonade'); });
      onCounter(TRUCKS[4], -0.7, function (m) { cup(m, '--tks-jamaica'); });
      onCounter(TRUCKS[4], -0.3, function (m) { cup(m, '--tks-milk-tea'); });

      // THE ROOM'S OWN PAGE, on a board by the gate, on the right as you come in.
      var pw = 2.6, ph = pw * 800 / 1180, pgm = at(4.4, 0, -1.4, -0.35);
      [-1.25, 1.25].forEach(function (lx) { box(0.1, 0.9 + ph, 0.1, M(pgm, at(lx, (0.9 + ph) / 2, -0.06)), '--tks-plank', 0.01); });
      box(pw + 0.16, ph + 0.16, 0.05, M(pgm, at(0, 0.9 + ph / 2, -0.02)), '--tks-ink', 0.01);
      var page = kit.screen(1180, 800, pw, M(pgm, at(0, 0.9 + ph / 2, 0.02)), 'Truckin’ Food Court’s own page, on a board by the gate');

      // THE BOARDS, the page's own, each on a stand beside its truck's hatch,
      // facing the lot the way the truck does.
      var boards = TRUCKS.map(function (t, n) {
        var bg = M(t.g, at(-L / 2 - 1.35, 0, Wd / 2 - 0.2, 0.35));
        [-0.75, 0.75].forEach(function (lx) { box(0.07, 0.7, 0.07, M(bg, at(lx, 0.35, -0.04)), '--tks-plank', 0.008); });
        box(1.6, 0.05, 0.1, M(bg, at(0, 0.68, -0.02)), '--tks-plank', 0.008);
        var it = kit.lift(page, '.tks-truck', { n: n, w: 620, h: 760, ww: 1.75, m: M(bg, at(0, 0.7, 0)), drop: '.tks-item__go' });
        return { t: t, bg: bg, it: it };
      });

      // THE SCREEN on the side of the Cooler facing the porch, with nothing of
      // its own on it, and its rack hung beside it.
      var cool = TRUCKS[4];
      var sg = M(cool.g, at(L / 2 + 1.42, 0, 0, Math.PI / 2));
      box(1.72, 1.0, 0.06, M(sg, at(0, 2.05, 0.03)), '--tks-roof', 0.012);
      kit.flat(new T.PlaneGeometry(1.6, 0.9), M(sg, at(0, 2.05, 0.065)), '--tks-kitchen');
      var screen = kit.lift(page, '.tks-screen', { w: 820, ww: 1.6, m: M(sg, at(0, 1.6, 0.08)) });
      kit.lift(page, '.tks-screen__now', { w: 520, ww: 1.1, m: M(sg, at(0, 2.62, 0.08)) });
      kit.lift(page, '.tks-screen__back', { w: 520, ww: 1.1, m: M(sg, at(0, 1.45, 0.08)) });
      var rg = M(sg, at(2.4, 0, 0.7, -0.5));
      [-0.8, 0.8].forEach(function (lx) { box(0.07, 0.6, 0.07, M(rg, at(lx, 0.3, -0.04)), '--tks-plank', 0.008); });
      var rack = kit.lift(page, '.tks-rack', { w: 820, h: 700, ww: 1.8, m: M(rg, at(0, 0.6, 0)) });
      kit.wire(page, 'rack.js');

      // THE PORCH, front left: a deck of planks, posts, a roof over the
      // tables, and one stripe of sun getting in under its edge onto a table.
      var px = -7.6, pz = -3.4, PW = 6.4, PD = 4.4, PH = 2.6;
      box(PW, 0.12, PD, at(px, 0.06, pz), '--tks-plank', 0.012);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) {
        box(0.14, PH, 0.14, at(px + c[0] * (PW / 2 - 0.1), PH / 2, pz + c[1] * (PD / 2 - 0.1)), '--tks-plank', 0.012);
      });
      box(PW + 0.6, 0.14, PD + 0.6, at(px, PH + 0.07, pz), '--tks-roof', 0.016);
      box(PW + 0.6, 0.24, 0.08, at(px, PH - 0.05, pz + PD / 2 + 0.3), '--tks-roof', false);
      function table(x, z) {
        box(1.3, 0.05, 0.8, at(x, 0.76, z), '--tks-plank', 0.012);
        [[-0.55, -0.32], [0.55, -0.32], [-0.55, 0.32], [0.55, 0.32]].forEach(function (l) {
          box(0.06, 0.7, 0.06, at(x + l[0], 0.47, z + l[1]), '--tks-plank', false);
        });
        [-0.65, 0.65].forEach(function (b) { box(1.2, 0.05, 0.3, at(x, 0.46, z + b), '--tks-plank', 0.01); });
      }
      table(px - 1.6, pz - 0.9);
      table(px + 1.4, pz - 0.9);
      // The table nearest the edge leaves room at one end for a wheelchair.
      box(1.6, 0.05, 0.8, at(px - 0.2, 0.76, pz + 1.15), '--tks-plank', 0.012);
      [[-0.95, -0.32], [-0.95, 0.32], [0.55, -0.32], [0.55, 0.32]].forEach(function (l) {
        box(0.06, 0.7, 0.06, at(px - 0.2 + l[0] * 0.8, 0.47, pz + 1.15 + l[1]), '--tks-plank', false);
      });
      box(1.0, 0.05, 0.3, at(px - 0.6, 0.46, pz + 1.8), '--tks-plank', 0.01);
      kit.flat(new T.PlaneGeometry(1.2, 0.34), at(px - 0.1, 0.79, pz + 1.2, 0, -Math.PI / 2), '--tks-sun');
      // A paper boat and a cup left on it.
      boat(at(px - 0.5, 0.79, pz + 1.1));
      cup(at(px + 0.3, 0.79, pz + 1.25), '--tks-sandia');

      // THE NAME over the gate, facing in, and the page's words on boards:
      // nothing has a price, and the house rules, by the porch.
      var name = kit.lift(page, '.tks-head', { w: 760, ww: 2.6, m: at(0, 2.2, 0.55, Math.PI) });
      var free = kit.lift(page, '.tks-part', { n: 2, w: 620, ww: 1.5, m: at(3.4, 0.6, -5.2, -0.3) });
      var rules = kit.lift(page, '.tks-part', { n: 5, w: 620, ww: 1.5, m: at(-3.6, 0.6, -6.6, 0.5) });
      [[3.4, -5.25, -0.3], [-3.6, -6.65, 0.5]].forEach(function (b) {
        var bm = at(b[0], 0, b[1], b[2]);
        [-0.65, 0.65].forEach(function (lx) { box(0.07, 0.62, 0.07, M(bm, at(lx, 0.31, -0.05)), '--tks-plank', 0.008); });
      });

      // THE PLACES.
      var face = function (x, z, tx, tz) { return Math.atan2(-(tx - x), -(tz - z)); };
      var stops = [{ name: 'through the gate, the trucks round the lot and their awnings out', where: 'through the gate', x: 0, z: -1.2, yaw: 0, pitch: 0.04 }];
      boards.forEach(function (b) {
        var p = new T.Vector3(0, 0, 2.4).applyMatrix4(b.bg);
        var q = new T.Vector3(0, 0, 0).applyMatrix4(b.bg);
        stops.push({ name: 'at ' + b.t.what + ', its board and the stripes under its awning', where: 'at ' + b.t.what, x: p.x, z: p.z, yaw: face(p.x, p.z, q.x, q.z), pitch: 0.08, frame: b.it.el });
      });
      var sp = new T.Vector3(0, 0, 2.6).applyMatrix4(sg), sq = new T.Vector3(0, 0, 0).applyMatrix4(sg);
      var rp = new T.Vector3(0, 0, 2.4).applyMatrix4(rg), rq = new T.Vector3(0, 0, 0).applyMatrix4(rg);
      stops.push(
        { name: 'at the screen on the side of the Cooler, with nothing of its own on it', where: 'at the screen on the Cooler', x: sp.x, z: sp.z, yaw: face(sp.x, sp.z, sq.x, sq.z), pitch: 0.2, frame: screen.el },
        { name: 'at the rack beside the screen: tacos, bánh mì and ramen, made and eaten', where: 'at the rack', x: rp.x, z: rp.z, yaw: face(rp.x, rp.z, rq.x, rq.z), pitch: 0.02, frame: rack.el },
        { name: 'on the porch, at the table with a stripe of sun across it', where: 'on the porch', x: px + 1.6, z: pz + 2.8, yaw: face(px + 1.6, pz + 2.8, px - 0.1, pz + 1.2), pitch: -0.42 },
        { name: 'at the board saying nothing has a price', where: 'at nothing has a price', x: 3.4 + Math.sin(-0.3) * 1.9, z: -5.2 + Math.cos(-0.3) * 1.9, yaw: -0.3, pitch: 0.06, frame: free.el },
        { name: 'at the house rules, by the porch', where: 'at the house rules', x: -3.6 + Math.sin(0.5) * 1.9, z: -6.6 + Math.cos(0.5) * 1.9, yaw: 0.5, pitch: 0.06, frame: rules.el },
        { name: 'at the board by the gate, the Truck Stop’s own page on it', where: 'at the room’s own page', x: 4.4 + Math.sin(-0.35) * 2.6, z: -1.4 + Math.cos(-0.35) * 2.6, yaw: -0.35, pitch: 0.04, page: kit.page, frame: page },
        { name: 'looking back at the name over the gate', where: 'looking back at the gate', x: 0, z: -4.2, yaw: Math.PI, pitch: 0.18, frame: name.el }
      );

      return {
        start: { x: 0, z: -1.2, yaw: 0 },
        bounds: { x: [-X + 1, X - 1], z: [BACK + 1.5, -0.4] },
        stops: stops
      };
    }
  };
})();

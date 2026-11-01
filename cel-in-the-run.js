/* =============================================================================
   The Run, walked into on Cel Street, through its gate on the open ground past
   the last building. Ryan's ask, 2026-11-01: the street's gates next, after
   every door and every room behind one.

   IT IS THE RUN'S WORLD AND NOBODY ELSE'S (§96): a dog park in A DOG'S
   COLOURS. Every colour here is a blue, a yellow or a grey, by name from the
   room's own --run-*, because a dog has two kinds of cone and cannot tell red
   from green: the grass is the khaki a dog sees, the sky blue, the porch
   boards straw, the roof slate, the ball blue so a dog can find it in the
   grass. THE LIGHT IS A BRIGHT DAY WITH CLOUDS GOING OVER, and each cloud's
   shadow lies on the grass under it, with every tree throwing a darker pool:
   both the grass's own yellow made darker, never blue, because blue shadows on
   snow are Rescue A Dog's, where these dogs came from, and the one room this
   must never look like.

   NO DOG IS DRAWN. The dogs are the shelter's, read fresh each time the page
   opens, and they run, lie in the beds and go home on the room's own page by
   the gate, because the scripts that do that talk to the CB and are never run
   here. What is drawn is everything that waits for them: the double gate and
   the pen between, the fence, the grass, the row of trees, the porch with its
   swings, rocking chairs and plush beds, the trough, a water bowl, a bench,
   the treat tin and the blue ball lying where it landed.

   THE DOG TELLY AND ITS RACK ARE THE PAGE'S OWN, lifted off it and hung low
   on the clubhouse wall, and rack.js, the page's own script, plays a film
   where it hangs or puts it up on the telly; nothing reaches YouTube until a
   press. The page's words stand on boards along the fence, lifted, never
   retyped.

   NOTHING MOVES and nothing tilts. Everything is outlined in the room's ink.
   Every colour is one the Run declares, by name. It keeps nothing, sends
   nothing and fetches nothing; its page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['the-run.html'] = {
    name: 'The Run',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var X0 = -12, X1 = 12, BACK = -30, PEN = 3.2;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2, FLAT = -Math.PI / 2;
      var ground = function (x, z) { return at(x, 0.012, z, 0, FLAT); };

      // A BRIGHT DAY: a blue sky, a pale light from above and a sun high up,
      // and the grass's own colour thrown back up. Nothing here is lit blue.
      kit.scene.background = kit.col('--run-sky');
      kit.scene.fog = new T.Fog(kit.col('--run-sky'), 45, 160);
      kit.scene.add(new T.HemisphereLight(kit.col('--run-cloud'), kit.col('--run-grass'), 1.8));
      var sun = new T.DirectionalLight(kit.col('--run-paper'), 1.0);
      sun.position.set(-6, 20, 4); sun.target.position.set(0, 0, -14);
      kit.scene.add(sun, sun.target);

      // THE GRASS, all the way out, and the field inside the fence.
      box(220, 0.1, 220, at(0, -0.05, -40), '--run-grass', false, false);

      // THE CLOUDS going over, and each one's shadow on the grass under it,
      // soft at the edge: a wide pool and a darker one inside it.
      [[-5, -9, 3.2], [6, -19, 4.0], [-2, -42, 5.0], [16, -6, 3.0], [-17, -24, 3.6]].forEach(function (c, n) {
        [[0, 0, 1], [c[2] * 0.6, 0.4, 0.8], [-c[2] * 0.55, -0.3, 0.75]].forEach(function (p) {
          kit.facets(new T.IcosahedronGeometry(c[2] * 0.5 * p[2], 1), at(c[0] + p[0], 15 + n % 2 * 2 + p[1], c[1]), '--run-cloud');
        });
        var e = new T.CircleGeometry(c[2] * 1.15, 32); e.scale(1.3, 1, 1);
        kit.flat(e, ground(c[0], c[1]), '--run-grass');
        var e2 = new T.CircleGeometry(c[2] * 1.0, 32); e2.scale(1.3, 1, 1);
        kit.flat(e2, at(c[0], 0.014, c[1], 0, FLAT), '--run-shadow');
      });

      // THE FENCE all round, posts and two rails, in the fence's grey-brown.
      function fence(x0, z0, x1, z1) {
        var len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(len / 2.4));
        var ry = Math.atan2(-(z1 - z0), x1 - x0);
        for (var i = 0; i <= n; i++) {
          var x = x0 + (x1 - x0) * i / n, z = z0 + (z1 - z0) * i / n;
          box(0.14, 1.3, 0.14, at(x, 0.65, z), '--run-fence', 0.014);
        }
        [0.45, 1.05].forEach(function (y) { box(len, 0.08, 0.06, at((x0 + x1) / 2, y, (z0 + z1) / 2, ry), '--run-fence', 0.01); });
      }
      fence(X0, 0, X0, BACK);            // the left side, behind the clubhouse
      fence(X1, 0, X1, BACK);            // the right side
      fence(X0, BACK, X1, BACK);         // the back, behind the trees
      fence(X0, 0, -1.3, 0);             // the front, either side of the inner gate
      fence(1.3, 0, X1, 0);
      // THE PEN between the two gates: shut one before you open the other.
      fence(-1.3, 0, -1.3, PEN); fence(1.3, 0, 1.3, PEN);
      fence(-1.3, PEN, -0.7, PEN); fence(0.7, PEN, 1.3, PEN);
      function gate(z, open) {
        // A frame of the fence's wood with a cross brace, swung open or shut.
        var g = open ? at(-0.7, 0, z, -1.2) : at(-0.7, 0, z);
        box(1.4, 0.08, 0.06, M(g, at(0.7, 0.4, 0)), '--run-fence', 0.01);
        box(1.4, 0.08, 0.06, M(g, at(0.7, 1.1, 0)), '--run-fence', 0.01);
        box(0.08, 0.8, 0.06, M(g, at(0.04, 0.75, 0)), '--run-fence', 0.01);
        box(0.08, 0.8, 0.06, M(g, at(1.36, 0.75, 0)), '--run-fence', 0.01);
        box(0.06, 1.0, 0.05, M(g, at(0.7, 0.75, 0, 0, 0, 1.0)), '--run-fence', 0.01);
      }
      gate(PEN, false);   // the outer gate, shut behind you
      gate(0, true);      // the inner gate, open onto the field
      // The arch over the inner gate, where the name hangs.
      [-1.3, 1.3].forEach(function (x) { box(0.16, 2.9, 0.16, at(x, 1.45, 0), '--run-fence', 0.014); });
      box(2.9, 0.16, 0.2, at(0, 2.9, 0), '--run-fence', 0.014);

      // THE ROOM'S OWN PAGE, on a board on the right-hand side of the pen, by the
      // gate. The dogs are there: running, lying in the beds and going home.
      var pw = 2.6, ph = pw * 800 / 1180, py = 0.85 + ph / 2;
      var pg = at(1.45, 0, 1.6, RIGHT);
      box(pw + 0.2, ph + 0.2, 0.08, M(pg, at(0, py, -0.05)), '--run-roof', 0.014);
      [-pw / 2, pw / 2].forEach(function (x) { box(0.12, py + ph / 2, 0.12, M(pg, at(x, (py + ph / 2) / 2, -0.12)), '--run-fence', 0.012); });
      var page = kit.screen(1180, 800, pw, M(pg, at(0, py, 0.0)), 'The Run’s own page, on the board by the gate, with the dogs on it');

      // THE NAME on the arch over the inner gate, facing you in the pen.
      var name = kit.lift(page, '.run-head', { w: 720, ww: 2.4, m: at(0, 3.05, 0.12) });

      // THE CLUBHOUSE along the left, and THE PORCH in front of it: boards on
      // the grass, slate roof on posts, two swings hung from it, two rocking
      // chairs and plush beds on the boards.
      var CZ0 = -2, CZ1 = -16, PX = -8.4, CH = 3.4, mid = (CZ0 + CZ1) / 2, len = CZ0 - CZ1;
      box(0.3, CH, len, at(X0 + 0.5, CH / 2, mid), '--run-wall', 0.014);
      box(1.1, 0.12, len + 0.6, at(X0 + 0.3, CH + 0.06, mid), '--run-roof', 0.014);
      box(PX - X0 - 0.5, 0.14, len, at((X0 + 0.65 + PX) / 2, 0.07, mid), '--run-board', 0.014);
      box(PX - X0 + 0.4, 0.1, len + 0.6, at((X0 + PX) / 2 + 0.3, 2.75, mid), '--run-roof', 0.014);
      for (var pz = CZ0; pz >= CZ1; pz -= len / 3) box(0.16, 2.7, 0.16, at(PX, 1.38, pz), '--run-board', 0.014);
      // The clubhouse door, in the roof's slate.
      box(0.06, 2.1, 1.0, at(X0 + 0.67, 1.19, -14.4), '--run-roof', 0.012);
      // Two swings, hung on chains from the porch roof.
      function swing(z) {
        [-0.6, 0.6].forEach(function (d) { box(0.03, 1.9, 0.03, at(-9.6, 1.8, z + d), '--run-steel', false); });
        box(0.5, 0.07, 1.4, at(-9.6, 0.85, z), '--run-board', 0.012);
        box(0.06, 0.45, 1.4, at(-9.85, 1.1, z), '--run-board', 0.012);
      }
      swing(-4.0); swing(-13.6);
      // Two rocking chairs, upright on their rockers.
      function rocker(z) {
        var g = at(-10.6, 0.14, z, LEFT);
        box(0.6, 0.06, 0.55, M(g, at(0, 0.45, 0)), '--run-chair', 0.012);
        box(0.6, 0.7, 0.06, M(g, at(0, 0.82, -0.27)), '--run-chair', 0.012);
        [-0.27, 0.27].forEach(function (x) {
          box(0.05, 0.42, 0.05, M(g, at(x, 0.22, 0.2)), '--run-chair', false);
          box(0.05, 0.42, 0.05, M(g, at(x, 0.22, -0.2)), '--run-chair', false);
          cyl(0.04, 0.04, 0.8, M(g, at(x, 0.02, 0, 0, Math.PI / 2)), '--run-chair', 0.008, 8);
        });
      }
      rocker(-6.0); rocker(-11.8);
      // The plush beds, round and low, in the two cushion colours, empty.
      [[-9.4, -7.4, '--run-cushion'], [-9.6, -9.1, '--run-cushion-2'], [-10.6, -8.3, '--run-cushion'], [-9.3, -10.6, '--run-cushion-2']].forEach(function (b) {
        cyl(0.55, 0.6, 0.22, at(b[0], 0.25, b[1]), b[2], 0.012, 24);
        cyl(0.4, 0.4, 0.06, at(b[0], 0.37, b[1]), '--run-paper', false, 24);
      });
      // THE TREAT TIN, on a low table by the door, filled from the treat truck.
      box(0.8, 0.05, 0.6, at(-11.1, 0.62, -15.2), '--run-board', 0.012);
      [[-0.35, -0.25], [0.35, -0.25], [-0.35, 0.25], [0.35, 0.25]].forEach(function (l) {
        box(0.05, 0.5, 0.05, at(-11.1 + l[0], 0.39, -15.2 + l[1]), '--run-board', false);
      });
      cyl(0.17, 0.17, 0.28, at(-11.1, 0.79, -15.2), '--run-steel', 0.01, 18);
      cyl(0.18, 0.18, 0.04, at(-11.1, 0.95, -15.2), '--run-roof', 0.008, 18);

      // THE DOG TELLY, hung low on the clubhouse wall under the porch roof, at
      // about a dog's eye level, and its rack beside it.
      var wall = function (z) { return at(X0 + 0.66, 0, z, LEFT); };
      var tz = -11.0;
      box(1.9, 1.15, 0.1, M(wall(tz), at(0, 0.95, 0.05)), '--run-ink', 0.012);
      kit.flat(new T.PlaneGeometry(1.74, 0.99), M(wall(tz), at(0, 0.95, 0.105)), '--run-screen');
      var screen = kit.lift(page, '.run-screen', { w: 820, ww: 1.74, m: M(wall(tz), at(0, 0.45, 0.12)) });
      kit.lift(page, '.run-screen__now', { w: 520, ww: 1.0, m: M(wall(tz + 1.5), at(0, 1.55, 0.04)) });
      kit.lift(page, '.run-screen__back', { w: 520, ww: 1.0, m: M(wall(tz + 1.5), at(0, 1.25, 0.04)) });
      var rack = kit.lift(page, '.run-rack', { w: 820, h: 620, ww: 1.8, m: M(wall(-7.4), at(0, 0.35, 0.04)) });
      kit.wire(page, 'rack.js');

      // THE ROW OF TREES along the back, for shade and for sniffing, each with
      // its pool of shade straight under it.
      [-9.5, -5.0, 0, 4.6, 9.2].forEach(function (x, n) {
        var z = BACK + 2.6 + (n % 2) * 0.8, h = 2.6 + (n === 2 ? 0.8 : 0);
        var pool = new T.CircleGeometry(n === 2 ? 3.2 : 2.5, 28); pool.scale(1.15, 1, 1);
        kit.flat(pool, at(x + 0.6, 0.018, z + 0.4, 0, FLAT), '--run-shade');
        cyl(0.22, 0.32, h, at(x, h / 2, z), '--run-bark', 0.014, 10);
        kit.facets(new T.IcosahedronGeometry(n === 2 ? 2.4 : 1.9, 1), at(x, h + 1.4, z), n % 2 ? '--run-leaf-2' : '--run-leaf');
        kit.facets(new T.IcosahedronGeometry(n === 2 ? 1.6 : 1.3, 1), at(x + 0.9, h + 0.8, z + 0.4), n % 2 ? '--run-leaf' : '--run-leaf-2');
      });

      // THE TROUGH by the right-hand fence, the water in it, a bowl beside it,
      // and a bench under the nearest tree.
      box(2.2, 0.55, 0.7, at(10.6, 0.3, -9.0), '--run-steel', 0.014);
      box(2.04, 0.04, 0.54, at(10.6, 0.56, -9.0), '--run-water', false, false);
      cyl(0.32, 0.24, 0.12, at(9.0, 0.06, -10.4), '--run-steel', 0.01, 20);
      cyl(0.26, 0.26, 0.02, at(9.0, 0.115, -10.4), '--run-water', false, 20);
      var bn = at(9.0, 0, BACK + 5.0);
      box(2.0, 0.08, 0.5, M(bn, at(0, 0.48, 0)), '--run-board', 0.012);
      box(2.0, 0.4, 0.06, M(bn, at(0, 0.78, -0.24)), '--run-board', 0.012);
      [-0.85, 0.85].forEach(function (x) { box(0.08, 0.48, 0.44, M(bn, at(x, 0.24, 0)), '--run-fence', 0.01); });

      // THE BLUE BALL, out in the open grass where it landed.
      kit.facets(new T.IcosahedronGeometry(0.16, 2), at(1.6, 0.16, -14.2), '--run-ball');
      kit.flat(new T.CircleGeometry(0.16, 16), at(1.6, 0.016, -14.2, 0, FLAT), '--run-shade');

      // THE PAGE'S WORDS, on boards along the right-hand fence, facing the
      // field, each with a slate frame behind it.
      var right = function (z) { return at(X1 - 0.3, 0, z, RIGHT); };
      var BOARDS = [
        { sel: '.run-lede', words: 'what the Run is' },
        { sel: '.run-part', n: 2, words: 'the dogs' },
        { sel: '.run-part', n: 3, words: 'in a dog’s colours' },
        { sel: '.run-part', n: 5, words: 'the porch' },
        { sel: '.run-part', n: 4, words: 'the treat tin' },
        { sel: '.run-part', n: 7, words: 'next door' },
        { sel: '.run-part', n: 9, words: 'what the Run keeps' },
        { sel: '.run-part', n: 10, words: 'whose it is', drop: '.quest' }
      ];
      var boards = BOARDS.map(function (b, i) {
        var z = -2.6 - i * 2.9, g = right(z);
        box(2.3, 1.95, 0.06, M(g, at(0, 1.6, -0.06)), '--run-roof', 0.012);
        [-1.0, 1.0].forEach(function (x) { box(0.1, 1.0, 0.1, M(g, at(x, 0.5, -0.1)), '--run-fence', 0.01); });
        var it = kit.lift(page, b.sel, { n: b.n || 0, w: 640, h: 520, ww: 2.1, m: M(g, at(0, 0.7, 0.0)), drop: b.drop });
        return { words: b.words, z: z, it: it };
      });

      // THE HOUSE RULES, on the inside of the pen, beside the inner gate.
      var rg = at(-1.3 - 0.12, 0, 1.6, LEFT);
      box(1.9, 1.5, 0.06, M(rg, at(0, 1.55, -0.05)), '--run-roof', 0.012);
      var rules = kit.lift(page, '.run-part', { n: 8, w: 560, h: 440, ww: 1.7, m: M(rg, at(0, 0.85, 0.0)) });

      // THE PLACES.
      var face = function (x, z, tx, tz) { return Math.atan2(-(tx - x), -(tz - z)); };
      var stops = [
        { name: 'in the pen between the two gates, the outer one shut behind you and the field through the inner one', where: 'in the pen between the gates', x: 0, z: 2.0, yaw: 0, pitch: 0.04 },
        { name: 'looking up at the Run’s name over the inner gate', where: 'at the name over the gate', x: 0, z: 2.4, yaw: 0, pitch: 0.28, frame: name.el },
        { name: 'at the house rules, inside the pen by the inner gate', where: 'at the house rules', x: 0.6, z: 1.6, yaw: LEFT, pitch: 0.02, frame: rules.el },
        { name: 'at the board by the gate, the Run’s own page on it, with the dogs', where: 'at the room’s own page, with the dogs', x: -0.6, z: 1.6, yaw: RIGHT, pitch: 0.06, page: kit.page, frame: page },
        { name: 'on the porch, two swings, two rocking chairs and the plush beds on the boards', where: 'on the porch', x: -6.8, z: -5.0, yaw: face(-6.8, -5.0, -10.2, -9.0), pitch: -0.12 },
        { name: 'at the dog telly, hung low on the clubhouse wall', where: 'at the dog telly', x: -9.3, z: tz, yaw: LEFT, pitch: -0.12, frame: screen.el },
        { name: 'at the rack of television made for dogs, beside the telly', where: 'at the rack', x: -9.3, z: -7.4, yaw: LEFT, pitch: -0.05, frame: rack.el },
        { name: 'at the treat tin by the clubhouse door', where: 'at the treat tin', x: -9.0, z: -14.8, yaw: face(-9.0, -14.8, -11.1, -15.2), pitch: -0.3 },
        { name: 'out in the open grass, the blue ball where it landed', where: 'at the blue ball', x: 1.6, z: -11.6, yaw: 0, pitch: -0.35 },
        { name: 'at the trough by the right-hand fence, and the water bowl', where: 'at the trough', x: 8.0, z: -7.6, yaw: face(8.0, -7.6, 10.2, -9.4), pitch: -0.25 },
        { name: 'under the trees at the back, on the bench in the shade', where: 'under the trees at the back', x: 4.0, z: BACK + 6.6, yaw: face(4.0, BACK + 6.6, 0, BACK + 2.6), pitch: 0.12 }
      ];
      boards.forEach(function (b) {
        stops.push({ name: 'at the board on the right-hand fence: ' + b.words, where: 'at the board: ' + b.words, x: X1 - 2.6, z: b.z, yaw: RIGHT, pitch: 0.04, frame: b.it.el });
      });

      return {
        start: { x: 0, z: 2.0, yaw: 0 },
        bounds: { areas: [{ x: [-1.0, 1.0], z: [0, PEN - 0.6] }, { x: [X0 + 1.1, X1 - 0.8], z: [BACK + 1.2, 0.4] }] },
        stops: stops
      };
    }
  };
})();

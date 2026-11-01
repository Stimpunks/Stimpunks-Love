/* =============================================================================
   Pekoe and Purrs, walked into on Cel Street. Ryan's ask, 2026-10-31: back on
   the street, working down it a room at a time.

   IT IS PEKOE AND PURRS' WORLD AND NOBODY ELSE'S (§94): a cat café on a coral
   wall, lit by A WINDOW AT EVERY HEIGHT, EACH CUT TO THE SIZE OF A CAT: one
   down at the floor for watching feet go by, round ones high up, a square in
   the middle of a wall, an arch, a slot under the eaves, and every one lays a
   small square of day on the wall down and to the right of it, because the sun
   is up and to the left. The light in the room is all of those squares at
   once. Rescue A Cat, where every cat in here came from, is the dark, a torch
   and eyes; this is day, lit all over, and if it ever goes dark it has become
   the shelter with tables in it. Covenstead is the other room that pours tea
   in daylight, one window, one warm patch and its mismatched china: here
   EVERY CUP, MUG AND POT IS THE SAME TEAL MUG, because the regulars knock
   things off tables.

   NO CAT IS DRAWN. The café keeps no cats of its own: the cats in here are
   the shelter's, read fresh every time the room opens, and they roam, are
   picked up and are let out on the room's own page on the right-hand wall,
   because the scripts that do that talk to the CB and are never run here. What
   is drawn is everything that waits for them: the tree, the perches up the
   wall, the hammock, the baskets, the box, the knitted toys, and a blanket on
   a chair for a lap.

   THE TELLY AND ITS RACK ARE THE PAGE'S OWN, lifted off it, and rack.js, the
   page's own script, plays a film where it hangs or puts it up on the telly;
   nothing reaches YouTube until a press. The menu boards are the page's own
   too, lifted and never retyped, without their Bring it to my table, which
   is the page's own script's and is done on its screen.

   NOTHING MOVES and nothing tilts. Everything is outlined in the room's ink.
   Every colour is one Pekoe and Purrs declares, by name. It keeps nothing,
   sends nothing and fetches nothing; its page arrives through Cel Street's
   screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['pekoe-and-purrs.html'] = {
    name: 'Pekoe and Purrs',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var W = 12, D = 13, H = 3.6, back = -D;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;

      // DAY, all over: the sky through every window and the coral thrown back
      // off the walls, and the sun up and to the left.
      kit.scene.background = kit.col('--pkp-sky');
      kit.scene.add(new T.HemisphereLight(kit.col('--pkp-day'), kit.col('--pkp-floor'), 1.6));
      var sun = new T.DirectionalLight(kit.col('--pkp-card'), 1.1);
      sun.position.set(-4.5, 3.4, -1.5);
      sun.target.position.set(2.5, 0, -9);
      sun.castShadow = true;
      sun.shadow.mapSize.set(1024, 1024);
      sun.shadow.camera.left = -10; sun.shadow.camera.right = 10;
      sun.shadow.camera.top = 10; sun.shadow.camera.bottom = -10;
      sun.shadow.camera.near = 0.1; sun.shadow.camera.far = 25;
      sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.03;
      kit.scene.add(sun, sun.target);

      // THE CAFÉ: the floor, the coral walls, the ceiling, a birch skirting all
      // the way round, and the door you came in by.
      box(W, 0.1, D + 0.4, at(0, -0.05, -D / 2), '--pkp-floor', false, false);
      box(0.3, H, D, at(-W / 2 - 0.15, H / 2, -D / 2), '--pkp-wall', false, false);
      box(0.3, H, D, at(W / 2 + 0.15, H / 2, -D / 2), '--pkp-wall', false, false);
      box(W + 0.6, H, 0.3, at(0, H / 2, back - 0.15), '--pkp-wall', false, false);
      box((W - 1.6) / 2, H, 0.3, at(-(W + 1.6) / 4, H / 2, 0.15), '--pkp-wall', false, false);
      box((W - 1.6) / 2, H, 0.3, at((W + 1.6) / 4, H / 2, 0.15), '--pkp-wall', false, false);
      box(1.6, H - 2.2, 0.3, at(0, 2.2 + (H - 2.2) / 2, 0.15), '--pkp-wall', false, false);
      box(1.4, 2.15, 0.08, at(0, 1.08, -0.05), '--pkp-birch', 0.015, false);
      box(W + 0.6, 0.2, D + 0.6, at(0, H + 0.1, -D / 2), '--pkp-shade', false, false);
      [[-W / 2 + 0.03, -D / 2, LEFT, D], [W / 2 - 0.03, -D / 2, RIGHT, D], [0, back + 0.03, 0, W]].forEach(function (s) {
        box(s[3], 0.14, 0.04, at(s[0], 0.07, s[1], s[2]), '--pkp-birch', false, false);
      });

      // THE WINDOWS, each cut to a cat, each with its own small square of day
      // on the wall down and to the right of it. A window is a birch frame
      // with the sky in it; its square is the same shape again in the day's
      // colour. The squares are drawn from the windows, never placed alone.
      var walls = {
        back: function (x) { return at(x, 0, back, 0); },
        left: function (z) { return at(-W / 2, 0, z, LEFT); },
        right: function (z) { return at(W / 2, 0, z, RIGHT); }
      };
      function shape(kind, w, h) {
        if (kind === 'round') return new T.CircleGeometry(w / 2, 28);
        if (kind === 'arch') {
          var s = new T.Shape();
          s.moveTo(-w / 2, -h / 2); s.lineTo(w / 2, -h / 2); s.lineTo(w / 2, h / 2 - w / 2);
          s.absarc(0, h / 2 - w / 2, w / 2, 0, Math.PI, false);
          s.lineTo(-w / 2, -h / 2);
          return new T.ShapeGeometry(s, 16);
        }
        return new T.PlaneGeometry(w, h);
      }
      function window_(g, lx, ly, kind, w, h) {
        // The square of day, down and to the right.
        kit.flat(shape(kind, w, h), M(g, at(lx + w * 0.75, ly - h * 0.7, 0.012)), '--pkp-day');
        // The frame, a little bigger than the opening and outlined in the ink,
        // and the sky in it.
        kit.flat(shape(kind, w + 0.2, h + 0.2), M(g, at(lx, ly, 0.02)), '--pkp-ink');
        kit.flat(shape(kind, w + 0.14, h + 0.14), M(g, at(lx, ly, 0.025)), '--pkp-birch');
        kit.flat(shape(kind, w, h), M(g, at(lx, ly, 0.03)), '--pkp-glass');
        kit.flat(shape(kind, w * 0.8, h * 0.8), M(g, at(lx + w * 0.04, ly + h * 0.04, 0.035)), '--pkp-sky');
        // A sill under every one that is not round, for a cat to sit on.
        if (kind !== 'round') box(w + 0.3, 0.06, 0.24, M(g, at(lx, ly - h / 2 - 0.1, 0.12)), '--pkp-birch', 0.012);
      }
      window_(walls.left(-2.2), 0, 0.32, 'square', 0.9, 0.42);      // down at the floor, for feet going by
      window_(walls.left(-11.4), 0, 1.7, 'arch', 0.62, 0.95);       // an arch
      window_(walls.right(-4.3), 0, 3.0, 'round', 0.5, 0.5);        // round, up high
      window_(walls.right(-8.0), 0, 1.6, 'square', 0.62, 0.62);     // the square in the middle of the wall
      window_(walls.back(5.0), 0, 2.85, 'round', 0.42, 0.42);       // another round one, higher still
      window_(walls.back(0.4), 0, 3.28, 'square', 0.7, 0.24);       // the slot under the eaves

      // THE ROOM'S OWN PAGE, on the right-hand wall by the door. The cats are
      // there: roaming, picked up, and let out.
      var pw = 2.8, ph = pw * 800 / 1180, py = 0.9 + ph / 2;
      var pg = walls.right(-2.0);
      box(pw + 0.18, ph + 0.18, 0.05, M(pg, at(0, py, 0)), '--pkp-mug-deep', 0.012);
      var page = kit.screen(1180, 800, pw, M(pg, at(0, py, 0.04)), 'Pekoe and Purrs’ own page, on the right-hand wall by the door, with the cats in it');

      // THE NAME, hung over the door inside, facing in.
      var name = kit.lift(page, '.pkp-head', { w: 720, ww: 2.2, m: at(0, 2.35, -0.04, Math.PI) });

      // THE HATCH in the back wall, the kitchen behind it, and the counter
      // ledge it hands the cups out onto.
      var hx = 1.0;
      kit.flat(new T.PlaneGeometry(2.2, 1.05), at(hx, 1.5, back + 0.01), '--pkp-shade');
      box(2.4, 0.08, 0.1, at(hx, 2.07, back + 0.05), '--pkp-birch', 0.012);
      [-1, 1].forEach(function (s) { box(0.08, 1.15, 0.1, at(hx + s * 1.16, 1.5, back + 0.05), '--pkp-birch', 0.012); });
      box(2.5, 0.08, 0.5, at(hx, 0.95, back + 0.25), '--pkp-birch', 0.012);
      box(2.5, 0.91, 0.08, at(hx, 0.455, back + 0.46), '--pkp-pink', 0.012);
      // A teapot and two mugs waiting on the ledge, all of them the teal mug.
      teapot(at(hx - 0.6, 0.99, back + 0.25));
      mug(at(hx + 0.2, 0.99, back + 0.22), true);
      mug(at(hx + 0.55, 0.99, back + 0.28), false);

      // THE TELLY by the hatch, and the rack of other cafés' films under it.
      var tx = -3.3;
      box(2.1, 1.25, 0.12, at(tx, 2.72, back + 0.07), '--pkp-ink', 0.012);
      kit.flat(new T.PlaneGeometry(1.92, 1.08), at(tx, 2.72, back + 0.135), '--pkp-mug');
      var screen = kit.lift(page, '.pkp-screen', { w: 820, ww: 1.92, m: at(tx, 2.18, back + 0.15) });
      kit.lift(page, '.pkp-screen__now', { w: 520, ww: 1.1, m: at(tx + 1.75, 2.55, back + 0.04) });
      kit.lift(page, '.pkp-screen__back', { w: 520, ww: 1.1, m: at(tx + 1.75, 2.25, back + 0.04) });
      var rack = kit.lift(page, '.pkp-rack', { w: 820, h: 640, ww: 1.92, m: at(tx, 0.3, back + 0.04) });
      kit.wire(page, 'rack.js');

      // THE MENU, the page's own boards along the left-hand wall.
      var BOARDS = ['coffee', 'everything that is not coffee', 'tea', 'tea sandwiches'];
      var stops = [{ name: 'just inside the door, a window at every height and a square of day by every one', x: 0, z: -0.8, yaw: 0, pitch: 0.06 }];
      var menus = BOARDS.map(function (words, n) {
        var z = -4.0 - n * 1.65, g = walls.left(z);
        box(1.52, 0.04, 0.12, M(g, at(0, 0.86, 0.06)), '--pkp-birch', 0.01);
        // Bringing it to your table is the page's own script's, not here.
        var it = kit.lift(page, '.pkp-board', { n: n, w: 640, h: 660, ww: 1.45, m: M(g, at(0, 0.9, 0.02)), drop: '.pkp-item__go' });
        return { words: words, z: z, it: it };
      });

      // THE HOUSE RULES, on the right-hand wall at the back.
      var rules = kit.lift(page, '.pkp-part', { n: 5, w: 640, h: 560, ww: 1.4, m: M(walls.right(-10.4), at(0, 1.0, 0.02)) });

      // THE CAT TREE in the back right-hand corner: sisal posts, birch
      // platforms with cushions on, a cubby with a round door, a bowl at the top.
      var ct = at(4.3, 0, -11.4);
      box(1.4, 0.1, 1.2, M(ct, at(0, 0.05, 0)), '--pkp-birch', 0.012);
      [[-0.45, -0.35, 2.4], [0.45, 0.35, 1.7], [0.4, -0.4, 1.1]].forEach(function (p) {
        cyl(0.09, 0.09, p[2], M(ct, at(p[0], p[2] / 2, p[1])), '--pkp-sisal', 0.01, 12);
      });
      [[0, 0.6, 0.1, 1.2], [0.25, 1.1, -0.2, 0.8], [-0.2, 1.7, 0.1, 0.9]].forEach(function (p) {
        box(p[3], 0.07, p[3] * 0.8, M(ct, at(p[0], p[1], p[2])), '--pkp-birch', 0.012);
        cyl(p[3] * 0.32, p[3] * 0.34, 0.08, M(ct, at(p[0], p[1] + 0.075, p[2])), '--pkp-pink', 0.01, 16);
      });
      box(0.6, 0.48, 0.55, M(ct, at(0.35, 1.38, 0.15)), '--pkp-card', 0.012);
      kit.flat(new T.CircleGeometry(0.15, 18), M(ct, at(0.35, 1.38, 0.43)), '--pkp-dim');
      cyl(0.38, 0.22, 0.18, M(ct, at(-0.45, 2.45, -0.35)), '--pkp-knit', 0.012, 18);

      // THE PERCHES stepping up the right-hand wall, and a knitted hammock slung
      // under the high round window.
      [[-4.0, 0.9], [-4.9, 1.35], [-5.8, 1.8], [-6.7, 2.25], [-7.5, 2.7]].forEach(function (p) {
        box(0.75, 0.06, 0.36, M(walls.right(p[0]), at(0, p[1], 0.18)), '--pkp-birch', 0.012);
        box(0.06, 0.2, 0.3, M(walls.right(p[0]), at(0, p[1] - 0.12, 0.16)), '--pkp-birch', false);
      });
      var hm = walls.right(-9.3);
      [-0.45, 0.45].forEach(function (x) { box(0.05, 0.5, 0.05, M(hm, at(x, 2.55, 0.32)), '--pkp-sisal', false); });
      box(0.96, 0.05, 0.46, M(hm, at(0, 2.3, 0.34)), '--pkp-knit', 0.012);

      // THE FLOOR'S THINGS: a basket with a cream cushion by the floor window,
      // an open box, a scratching post, and knitted toys where they were left.
      cyl(0.42, 0.36, 0.22, at(-4.6, 0.11, -3.0), '--pkp-sisal', 0.012, 20);
      cyl(0.34, 0.34, 0.08, at(-4.6, 0.2, -3.0), '--pkp-cream', 0.01, 20);
      var bx = at(-4.3, 0, -10.9, 0.3);
      box(0.7, 0.42, 0.5, M(bx, at(0, 0.21, 0)), '--pkp-crust', 0.012);
      kit.flat(new T.PlaneGeometry(0.62, 0.42), M(bx, at(0, 0.425, 0, 0, -Math.PI / 2)), '--pkp-rye');
      cyl(0.08, 0.08, 0.9, at(2.6, 0.45, -3.2), '--pkp-sisal', 0.01, 12);
      cyl(0.26, 0.26, 0.06, at(2.6, 0.03, -3.2), '--pkp-birch', 0.01, 16);
      [[-1.6, -3.3, '--pkp-knit'], [0.6, -8.9, '--pkp-green'], [3.1, -6.7, '--pkp-pink'], [-3.2, -6.9, '--pkp-gold']].forEach(function (t) {
        kit.facets(new T.IcosahedronGeometry(0.09, 1), at(t[0], 0.09, t[1]), t[2]);
      });
      // A feather wand lying on the floor.
      cyl(0.012, 0.012, 0.9, at(0.9, 0.02, -4.2, 0.4, 0, Math.PI / 2), '--pkp-rye', false, 6);
      kit.facets(new T.SphereGeometry(0.07, 8, 6), at(0.5, 0.06, -4.0), '--pkp-pink');

      // THE TABLES: small birch rounds, each with a chair or two, every cup on
      // them the same teal mug, a plate of sandwiches on one, and a blanket on
      // one chair for a lap.
      function mug(m, full) {
        cyl(0.055, 0.05, 0.11, M(m, at(0, 0.055, 0)), '--pkp-mug', 0.008, 14);
        cyl(0.045, 0.045, 0.006, M(m, at(0, 0.105, 0)), full ? '--pkp-coffee' : '--pkp-mug-deep', false, 14);
        box(0.02, 0.06, 0.035, M(m, at(0.065, 0.06, 0)), '--pkp-mug', 0.006);
      }
      function teapot(m) {
        kit.facets(new T.SphereGeometry(0.12, 14, 10), M(m, at(0, 0.11, 0)), '--pkp-mug');
        cyl(0.05, 0.05, 0.03, M(m, at(0, 0.23, 0)), '--pkp-mug-deep', 0.006, 12);
        cyl(0.018, 0.026, 0.13, M(m, at(0.14, 0.13, 0, 0, 0, -0.9)), '--pkp-mug', 0.006, 8);
        box(0.03, 0.1, 0.03, M(m, at(-0.13, 0.13, 0)), '--pkp-mug', 0.006);
      }
      function chair(m) {
        box(0.44, 0.05, 0.44, M(m, at(0, 0.45, 0)), '--pkp-salmon', 0.01);
        box(0.44, 0.48, 0.05, M(m, at(0, 0.72, -0.2)), '--pkp-salmon', 0.01);
        [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].forEach(function (l) {
          cyl(0.02, 0.02, 0.45, M(m, at(l[0], 0.225, l[1])), '--pkp-rye', false, 6);
        });
      }
      function table(x, z) {
        cyl(0.04, 0.04, 0.72, at(x, 0.36, z), '--pkp-rye', 0.01, 8);
        cyl(0.24, 0.28, 0.03, at(x, 0.015, z), '--pkp-rye', false, 14);
        cyl(0.42, 0.42, 0.04, at(x, 0.74, z), '--pkp-birch', 0.012, 24);
      }
      var TABLES = [[-1.6, -5.2], [1.4, -6.6], [-0.9, -9.0]];
      TABLES.forEach(function (t, n) {
        table(t[0], t[1]);
        chair(at(t[0], 0, t[1] + 0.7, Math.PI));
        if (n !== 1) chair(at(t[0], 0, t[1] - 0.7, 0));
        mug(at(t[0] - 0.12, 0.76, t[1] + 0.14), true);
        if (n === 0) mug(at(t[0] + 0.16, 0.76, t[1] - 0.12), false);
        if (n === 2) teapot(at(t[0] + 0.15, 0.76, t[1] - 0.05));
      });
      // The sandwiches, on a plate, at the table nearest the hatch.
      var pl = at(-0.9 - 0.12, 0.76, -9.0 + 0.2);
      cyl(0.13, 0.11, 0.015, pl, '--pkp-card', 0.006, 18);
      [[-0.04, 0, 0.3], [0.05, 0.03, -0.4]].forEach(function (s) {
        var tri = new T.Shape(); tri.moveTo(-0.07, -0.05); tri.lineTo(0.08, -0.05); tri.lineTo(-0.07, 0.07); tri.lineTo(-0.07, -0.05);
        kit.piece(new T.ExtrudeGeometry(tri, { depth: 0.03, bevelEnabled: false }), M(pl, at(s[0], 0.012, s[1], s[2], -Math.PI / 2)), '--pkp-bread', 0.006);
      });
      // The blanket on the chair at the middle table: a lap waiting.
      box(0.46, 0.04, 0.5, at(1.4, 0.495, -5.9), '--pkp-cream', 0.01);
      box(0.46, 0.22, 0.03, at(1.4, 0.4, -5.66), '--pkp-cream', 0.01);

      // THE PLACES.
      var face = function (x, z, tx, tz) { return Math.atan2(-(tx - x), -(tz - z)); };
      stops.push(
        { name: 'at the cat tree in the back corner, the cubby, the cushions and the bowl at the top', where: 'at the cat tree', x: 1.7, z: -8.6, yaw: face(1.7, -8.6, 4.3, -11.4), pitch: 0.14 },
        { name: 'at the window down at the floor, for watching feet go by, the basket beside it', where: 'at the window down at the floor', x: -3.6, z: -2.6, yaw: LEFT, pitch: -0.55 },
        { name: 'at the table with a blanket on the chair, a lap waiting', where: 'at the table with a blanket on the chair', x: 0.3, z: -4.9, yaw: face(0.3, -4.9, 1.4, -6.1), pitch: -0.48 },
        { name: 'at the perches up the right-hand wall, and the round window at the top', where: 'at the perches up the wall', x: 3.2, z: -5.8, yaw: RIGHT, pitch: 0.3 },
        { name: 'at the hatch, the teal mugs waiting on its ledge', where: 'at the hatch', x: 1.0, z: -10.9, yaw: 0, pitch: -0.05 },
        { name: 'at the telly by the hatch', x: -3.3, z: -10.0, yaw: 0, pitch: 0.32, frame: screen.el },
        { name: 'at the rack of films from other cat cafés, under the telly', where: 'at the rack under the telly', x: -3.3, z: -11.4, yaw: 0, pitch: -0.18, frame: rack.el }
      );
      menus.forEach(function (b) {
        stops.push({ name: 'at the menu on the left-hand wall: ' + b.words, where: 'at the menu: ' + b.words, x: -W / 2 + 2.1, z: b.z, yaw: LEFT, pitch: 0.05, frame: b.it.el });
      });
      stops.push(
        { name: 'at the house rules, on the right-hand wall at the back', where: 'at the house rules', x: W / 2 - 2.1, z: -10.4, yaw: RIGHT, pitch: 0.06, frame: rules.el },
        { name: 'at the right-hand wall by the door, the room’s own page on it, with the cats', where: 'at the room’s own page, with the cats', x: W / 2 - 2.7, z: -2.0, yaw: RIGHT, pitch: 0.06, page: kit.page, frame: page },
        { name: 'looking back at the café’s name, over the door inside', where: 'looking back at the name over the door', x: 0, z: -3.6, yaw: Math.PI, pitch: 0.24, frame: name.el }
      );

      return {
        start: { x: 0, z: -0.8, yaw: 0 },
        bounds: { x: [-W / 2 + 1.0, W / 2 - 1.0], z: [back + 1.6, -0.5] },
        stops: stops
      };
    }
  };
})();

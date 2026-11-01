/* =============================================================================
   The Feed, walked into on Cel Street. Ryan's ask, 2026-10-31: back on the
   street, working down it a room at a time.

   IT IS THE FEED'S WORLD AND NOBODY ELSE'S (§27): a dark station concourse
   under girders, with a split-flap arrivals board standing on legs for every
   site we run, down both sides of the hall. It is a MACHINE, not a document:
   every board is lit from inside, through a mask, so the letters have a hard
   edge and the enamel between them stays dead, and each throws its own pool
   of light on the floor in front of it. THE FURNITURE IS DARKER THAN THE ROOM:
   a board's carcass is the darkest thing in the hall. Every object stands on
   the floor and is separated from every other by a shadow; nothing lies flat.
   That is what keeps this off the Adventurer's Guild, which is pale, lit from
   nowhere and has no depth: if anything here loses its shadow, or a board
   ever lies flat, this has become the guild and it is this room that moves.

   THE BOARDS ARE THE PAGE'S OWN, lifted off it by the kit, each with the minute
   its own wire was read on its plate, in the page's running order, which is
   stimpunks.org's and not re-sorted here. Nothing is ranked and nothing is
   added up. The flaps do not flip: nothing in the hall moves, and the boards
   make no noise. The room's own page stands at the far end of the concourse,
   and out of the back, up the hill, is The Source.

   Every colour is one the Feed declares, by name. It keeps nothing, sends
   nothing and fetches nothing; its page arrives through Cel Street's
   screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['the-feed.html'] = {
    name: 'The Feed',
    faces: ['Michroma'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var W = 18, D = 27, H = 7.5, back = -D;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;

      // THE HALL'S OWN DARK, a little light off the girders, and one high
      // light through the roof for the shadows that keep everything apart.
      kit.scene.background = kit.col('--fd-enamel');
      kit.scene.add(new T.HemisphereLight(kit.col('--fd-dim'), kit.col('--fd-split'), 0.9));
      var roof = new T.DirectionalLight(kit.col('--fd-dim'), 0.8);
      roof.position.set(-4, 16, -6); roof.target.position.set(0, 0, -14);
      roof.castShadow = true;
      roof.shadow.mapSize.set(1024, 1024);
      roof.shadow.camera.left = -14; roof.shadow.camera.right = 14; roof.shadow.camera.top = 18; roof.shadow.camera.bottom = -18;
      roof.shadow.bias = -0.0006; roof.shadow.normalBias = 0.02;
      kit.scene.add(roof, roof.target);

      // THE CONCOURSE: the floor, the walls, the roof on its girders.
      box(W, 0.1, D + 2, at(0, -0.05, -D / 2 + 1), '--fd-hall', false, false);
      // The platform edge lines down the hall, the fold's lit grey, laid flush.
      [-1, 1].forEach(function (s) { box(0.08, 0.004, D - 2, at(s * 2.2, 0.003, -D / 2), '--fd-fold', false, false); });
      box(0.3, H, D + 2, at(-W / 2 - 0.15, H / 2, -D / 2 + 1), '--fd-hall');
      box(0.3, H, D + 2, at(W / 2 + 0.15, H / 2, -D / 2 + 1), '--fd-hall');
      box(W + 0.6, 0.2, D + 2, at(0, H + 0.1, -D / 2 + 1), '--fd-enamel', false, false);
      // The way in, behind you.
      box((W - 3) / 2, H, 0.3, at(-(W + 3) / 4, H / 2, 1.15), '--fd-hall');
      box((W - 3) / 2, H, 0.3, at((W + 3) / 4, H / 2, 1.15), '--fd-hall');
      box(3, H - 3, 0.3, at(0, 3 + (H - 3) / 2, 1.15), '--fd-hall');
      // The far wall, with an opening on the right out of the back of the
      // concourse, where the way up the hill goes.
      var OX = 6.0, OW = 2.6, OH = 3.2;
      box(W / 2 + OX - OW / 2, H, 0.3, at((-W / 2 + OX - OW / 2) / 2, H / 2, back - 0.15), '--fd-hall');
      box(W / 2 - OX - OW / 2, H, 0.3, at((W / 2 + OX + OW / 2) / 2, H / 2, back - 0.15), '--fd-hall');
      box(OW, H - OH, 0.3, at(OX, OH + (H - OH) / 2, back - 0.15), '--fd-hall');
      // Columns of riveted girder down both sides, and the trusses across.
      for (var z = -3; z > back + 1; z -= 6) {
        [-1, 1].forEach(function (s) { box(0.36, H, 0.36, at(s * (W / 2 - 0.6), H / 2, z), '--fd-girder', 0.012); });
        box(W - 1.2, 0.34, 0.24, at(0, H - 0.4, z), '--fd-girder', 0.012);
        for (var k = -3; k <= 3; k++) box(0.08, 0.9, 0.08, at(k * 2.4, H - 1.0, z, 0, 0, k % 2 ? 0.5 : -0.5), '--fd-girder', false);
      }

      // THE ROOM'S OWN PAGE at the far end of the concourse, on a board of its
      // own the size of the departures hall's main one, on its legs.
      var pw = 4.2, ph = pw * 800 / 1180, py = 1.4 + ph / 2;
      var pg = at(-1.4, 0, back + 0.6);
      [-1, 1].forEach(function (e) { box(0.16, py, 0.16, M(pg, at(e * (pw / 2 - 0.3), py / 2, -0.15)), '--fd-girder', 0.012); });
      box(pw + 0.3, ph + 0.3, 0.3, M(pg, at(0, py, -0.18)), '--fd-enamel', 0.02);
      var frame = kit.screen(1180, 800, pw, M(pg, at(0, py, 0.0)), 'The Feed’s own page, on the board at the far end of the concourse');

      // THE BOARDS, standing down both sides of the hall facing the aisle, in
      // the page's own running order, left side first and then the right. Each
      // stands on two girder legs over feet, with a deep carcass of enamel
      // behind its face, and its own light inside throws a pool on the floor
      // in front of it. The face is the page's own board, lifted.
      var PW = 760, BW = 2.2, FOOT = 0.95;
      var SPOTS = [
        { x: -5.4, z: -4.0, ry: LEFT }, { x: -5.4, z: -9.0, ry: LEFT }, { x: -5.4, z: -14.0, ry: LEFT },
        { x: -5.4, z: -19.0, ry: LEFT }, { x: -5.4, z: -24.0, ry: LEFT },
        { x: 5.4, z: -6.5, ry: RIGHT }, { x: 5.4, z: -11.5, ry: RIGHT }, { x: 5.4, z: -16.5, ry: RIGHT },
        { x: 5.4, z: -21.5, ry: RIGHT }
      ];
      var stops = [{ name: 'just inside the concourse, under the girders, the boards standing down both sides', x: 0, z: -0.4, yaw: 0 }];
      SPOTS.forEach(function (sp, n) {
        var g = at(sp.x, 0, sp.z, sp.ry);
        [-1, 1].forEach(function (e) {
          box(0.12, FOOT + 0.3, 0.12, M(g, at(e * 0.75, (FOOT + 0.3) / 2, -0.12)), '--fd-girder', 0.012);
          box(0.6, 0.06, 0.36, M(g, at(e * 0.75, 0.03, -0.12)), '--fd-girder', 0.012);
        });
        box(BW - 0.1, 1.0, 0.34, M(g, at(0, FOOT + 0.7, -0.2)), '--fd-enamel', 0.02);
        var pool = new T.PointLight(kit.col('--fd-lamp'), 10, 4.5, 1.4);
        pool.position.copy(new T.Vector3(0, 0.5, 0.55).applyMatrix4(g));
        kit.scene.add(pool);
        var it = kit.lift(frame, '.indicator', { n: n, w: PW, h: 760, ww: BW, m: M(g, at(0, FOOT, 0.02)) });
        var o = new T.Vector3(0, 0, 2.7).applyMatrix4(g);
        stops.push({ name: 'at the ' + (n + 1 === 1 ? 'first' : 'next') + ' board along the ' + (sp.x < 0 ? 'left' : 'right') + '-hand side', where: 'at a board on the ' + (sp.x < 0 ? 'left' : 'right') + '-hand side, its plate saying when its wire was read', x: o.x, z: o.z, yaw: sp.ry, pitch: 0.28, frame: it.el, n: n });
      });

      stops.push({ name: 'at the far end of the concourse, with the Feed’s own page on the big board', x: -1.4, z: back + 4.4, yaw: 0, pitch: 0.3, page: kit.page, frame: frame });

      // TWO NOTICES on their stands by the way in: the page's own word on
      // reading the feeds properly, and whose machine this is.
      var n0 = at(-2.4, 0, -2.2, 0.35), n2 = at(2.4, 0, -2.2, -0.35);
      [n0, n2].forEach(function (g) {
        box(0.1, 1.0, 0.1, M(g, at(0, 0.5, -0.06)), '--fd-girder', 0.012);
        box(0.5, 0.05, 0.4, M(g, at(0, 0.025, -0.06)), '--fd-girder', 0.012);
      });
      var read = kit.lift(frame, '.girder', { n: 0, w: 620, h: 700, ww: 1.4, m: M(n0, at(0, 1.0, 0.0)) });
      var whose = kit.lift(frame, '.girder', { n: 2, w: 620, h: 700, ww: 1.4, m: M(n2, at(0, 1.0, 0.0)) });
      stops.splice(1, 0,
        { name: 'at the notice by the way in, on going and reading the feeds properly', x: -1.7, z: -0.2, yaw: 0.35, pitch: 0.18, frame: read.el },
        { name: 'at the notice by the way in, on whose machine this is', x: 1.7, z: -0.2, yaw: -0.35, pitch: 0.18, frame: whose.el });

      // OUT OF THE BACK AND UP THE HILL: the opening in the far wall, a sign
      // over it lettered like a nameboard, and steps going up into the dark.
      var sign = kit.paper(520, 120, function (c, w, h) {
        c.fillStyle = kit.ink('--fd-enamel'); c.fillRect(0, 0, w, h);
        c.fillStyle = kit.ink('--fd-amber');
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.font = "44px 'Michroma'";
        c.fillText('THE SOURCE ↑', w / 2, h / 2 + 2);
      });
      box(2.3, 0.6, 0.12, at(OX, OH + 0.45, back + 0.1), '--fd-girder', 0.012);
      kit.sheet(sign, 2.2, 0.5, at(OX, OH + 0.45, back + 0.17));
      for (var st = 0; st < 8; st++) box(OW - 0.2, 0.22, 0.5, at(OX, 0.11 + st * 0.22, back - 0.6 - st * 0.5), '--fd-flap', 0.012);
      stops.push({ name: 'The Source', where: 'at the way out of the back of the concourse, up the hill to where every wire starts', x: OX, z: back + 3.0, yaw: 0, pitch: 0.3, page: 'the-source.html' });

      // The boards' stops in walking order: down the left, back up the right.
      var boards = stops.filter(function (s) { return s.n != null; });
      var left = boards.filter(function (s) { return s.x < 0; }), right = boards.filter(function (s) { return s.x > 0; });
      left.forEach(function (s, i) { s.name = i ? 'at the next board down the left-hand side' : 'at the first board on the left-hand side'; });
      right.forEach(function (s, i) { s.name = i ? 'at the next board down the right-hand side' : 'at the first board on the right-hand side'; });
      boards.forEach(function (s) { delete s.where; delete s.n; });

      return {
        start: { x: 0, z: -0.4, yaw: 0 },
        bounds: { x: [-W / 2 + 1.2, W / 2 - 1.2], z: [back + 1.4, 0.4] },
        stops: stops
      };
    }
  };
})();

/* =============================================================================
   Nothing For Sale, walked into on Cel Street: turning 07 off the Outskirts.
   Ryan's ask, 2026-11-01: the turnings, each its own world.

   A LAY-BY LIT BY EVERYBODY'S HEADLIGHTS AT ONCE (§46). A ring of cars has
   pulled up nose-in with their lamps left on and pointed at the middle, where
   the tables stand. Every car's lamps are its own colour (halogen, LED, fog),
   no two neighbours alike, and every car's lamp throws its own shadow, so
   everything in the middle casts a fan of shadows, one for every car, and
   nothing has a back. Nobody brought enough light alone.

   THE 404 IS THE COLLISION: its fog is lit from every side too, and nothing in
   it casts a shadow. Here everything casts several, hard. And the Honesty Box
   is the other roadside table, under one white lamp with its prices: there are
   no prices here, and nothing on the tables is anybody's to pay for.

   NOTHING MOVES. Headlights that swept would be a car leaving. The tables are
   drawn as trestles with things stacked on them and a blank cardboard sign on
   each; what is on them, in the page's own words and order, is lifted off the
   page and stands along the back of the row, so a table the page adds is there
   without a line here. Each lifted thing shows only while you stand at it, so
   the ring stays clear from everywhere else.

   Every colour is one §46 declares, by name. It keeps nothing, sends nothing
   and fetches nothing; its page arrives through Cel Street's screen().
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['nothing-for-sale.html'] = {
    name: 'Nothing For Sale',
    from: 'the-outskirts.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var RIGHT = -Math.PI / 2, DEG = Math.PI / 180;
      var RING = 9.6, BOARDS = 7.4, NEAR = 5.0;     // the cars, the boards, where you stand to read one
      var BEAMS = ['--nfs-halogen', '--nfs-led', '--nfs-fog'];

      // THE NIGHT past the ring: no moon and no streetlight, only the dark.
      kit.scene.background = kit.col('--nfs-shadow');
      kit.scene.fog = new T.Fog(kit.col('--nfs-shadow'), 20, 55);
      kit.scene.add(new T.HemisphereLight(kit.col('--nfs-lit'), kit.col('--nfs-shadow'), 0.3));

      // THE LAY-BY: gravel, and the middle trodden flat where the tables are.
      box(140, 0.1, 140, at(0, -0.06, -20), '--nfs-gravel', false, false);
      kit.cyl(7.2, 7.2, 0.04, at(0, 0.0, 0), '--nfs-lit', false, 40);

      // THE CARS, nose-in round the ring, the way in left open behind you.
      // Each has its lamps on, in its own colour, and each lamp throws a shadow.
      var CARS = [50, 95, 140, 185, 230, 275, 320];
      CARS.forEach(function (deg, i) {
        var th = deg * DEG, x = RING * Math.sin(th), z = RING * Math.cos(th);
        var g = at(x, 0, z, th + Math.PI), beam = BEAMS[i % 3];
        box(1.9, 0.72, 4.1, M(g, at(0, 0.62, 0)), '--nfs-car');
        box(1.62, 0.56, 2.0, M(g, at(0, 1.25, -0.45)), '--nfs-car');
        box(1.5, 0.42, 0.04, M(g, at(0, 1.25, 0.56)), '--nfs-shadow', false, false);
        [[-0.8, 1.35], [0.8, 1.35], [-0.8, -1.35], [0.8, -1.35]].forEach(function (w) {
          kit.cyl(0.34, 0.34, 0.26, M(g, at(w[0], 0.34, w[1], 0, 0, Math.PI / 2)), '--nfs-shadow', false, 12);
        });
        [-0.66, 0.66].forEach(function (lx) { kit.flat(new T.CircleGeometry(0.15, 16), M(g, at(lx, 0.74, 2.06)), beam); });
        var lamp = new T.SpotLight(kit.col(beam), 34, 26, 0.62, 0.6, 1.0);
        var p = new T.Vector3(0, 0.74, 2.2).applyMatrix4(g);
        lamp.position.copy(p);
        lamp.target.position.set(0, 0.5, 0);
        lamp.castShadow = true;
        lamp.shadow.mapSize.set(512, 512);
        lamp.shadow.bias = -0.0008; lamp.shadow.normalBias = 0.03;
        kit.scene.add(lamp, lamp.target);
      });

      // THE TABLES: a row of trestles across the middle, each with its top
      // edge in one car's light and things stacked on it, and a cardboard
      // sign standing on it with nothing written on the side you can see.
      var TABLE_Z = -1.4;
      for (var t = 0; t < 5; t++) {
        var tx = -4.4 + t * 2.2, beam = BEAMS[t % 3];
        box(1.9, 0.06, 0.9, at(tx, 0.76, TABLE_Z), '--nfs-table');
        box(1.9, 0.03, 0.04, at(tx, 0.79, TABLE_Z + 0.45), beam, false, false);
        [-0.82, 0.82].forEach(function (o) {
          box(0.05, 0.74, 0.05, at(tx + o, 0.37, TABLE_Z - 0.38), '--nfs-car');
          box(0.05, 0.74, 0.05, at(tx + o, 0.37, TABLE_Z + 0.38), '--nfs-car');
        });
        for (var s = 0; s < 3; s++) {
          var sx = tx - 0.55 + s * 0.5, hgt = 0.06 + ((t + s) % 3) * 0.05;
          box(0.34, hgt, 0.26, at(sx, 0.79 + hgt / 2, TABLE_Z + 0.08 + (s % 2) * 0.12, (s - 1) * 0.2), s % 2 ? '--nfs-pale' : '--nfs-dim');
        }
        box(0.7, 0.42, 0.03, at(tx + 0.45, 1.0, TABLE_Z - 0.3, -0.12), '--nfs-dim');
      }

      // A BOARD standing between two cars, its face to the middle.
      function board(deg, hgt) {
        var th = deg * DEG, g = at(BOARDS * Math.sin(th), 0, BOARDS * Math.cos(th), th + Math.PI);
        box(2.5, hgt + 0.2, 0.08, M(g, at(0, 0.5 + hgt / 2, -0.08)), '--nfs-table');
        [-1.15, 1.15].forEach(function (o) { box(0.08, 0.5 + hgt, 0.08, M(g, at(o, (0.5 + hgt) / 2, -0.14)), '--nfs-car'); });
        var sx = NEAR * Math.sin(th), sz = NEAR * Math.cos(th);
        return { m: M(g, at(0, 0.5, 0)), stop: { x: sx, z: sz, yaw: th + Math.PI }, zone: [sx - 2.6, sx + 2.6, sz - 2.6, sz + 2.6] };
      }

      // THE ROOM'S OWN PAGE, on a board on the right at the way in.
      var pw = 2.6, ph = pw * 800 / 1180, py = 0.6 + ph / 2;
      var pg = at(3.4, 0, 7.2, RIGHT);
      box(pw + 0.2, ph + 0.2, 0.08, M(pg, at(0, py, -0.08)), '--nfs-table');
      [-pw / 2, pw / 2].forEach(function (o) { box(0.08, py + ph / 2, 0.08, M(pg, at(o, (py + ph / 2) / 2, -0.14)), '--nfs-car'); });
      var page = kit.screen(1180, 800, pw, M(pg, at(0, py, 0)), 'Nothing For Sale’s own page, on a board at the way into the lay-by', [0.2, 3.4, 5.4, 9.0]);

      // THE PAGE'S OWN WORDS. What is on the tables stands along the back of
      // the row, as the page lists it; everything else is on a board in the
      // gaps between the cars.
      var tablesZone = [-5, 5, -0.6, 4.2];
      var tables = kit.lift(page, '.nfs-tables', { w: 1300, h: 520, ww: 6.0, m: at(0, 0.9, TABLE_Z - 0.5), zone: tablesZone });
      var bh = board(72.5, 1.3), bl = board(117.5, 1.5), bs = board(162.5, 2.0), bt = board(207.5, 2.0), br = board(252.5, 2.0), bw = board(297.5, 1.6);
      var head = kit.lift(page, '.nfs-head', { w: 760, ww: 2.2, drop: '.nfs-art', m: bh.m, zone: bh.zone });
      var lede = kit.lift(page, '.nfs-lede', { w: 760, h: 620, ww: 2.2, m: bl.m, zone: bl.zone });
      var soli = kit.lift(page, '.nfs-part', { n: 0, w: 760, h: 760, ww: 2.2, m: bs.m, zone: bs.zone });
      var told = kit.lift(page, '.nfs-part', { n: 1, w: 760, h: 760, ww: 2.2, drop: '.nfs-tables', m: bt.m, zone: bt.zone });
      var rules = kit.lift(page, '.nfs-part', { n: 2, w: 760, h: 760, ww: 2.2, m: br.m, zone: br.zone });
      var whose = kit.lift(page, '.nfs-part', { n: 3, w: 760, h: 640, ww: 2.2, m: bw.m, zone: bw.zone });

      function at_(b, name, frame) {
        return { name: name, x: b.stop.x, z: b.stop.z, yaw: b.stop.yaw, pitch: 0.08, frame: frame.el };
      }
      var stops = [
        { name: 'at the mouth of the lay-by, the ring of cars ahead with every lamp on the middle', x: 0, z: 9, yaw: 0, pitch: 0.02 },
        { name: 'at the board on the right at the way in, the room’s own page on it', x: 0.6, z: 7.2, yaw: RIGHT, pitch: 0.05, page: kit.page, frame: page },
        { name: 'at the tables, everything laid out on them in the middle of the light', x: 0, z: 1.3, yaw: 0, pitch: 0.06, frame: tables.el },
        at_(bh, 'at the board between the first cars on the right: turning 07, and the only free market on the road', head),
        at_(bl, 'at the board on the right: a ring of cars, and everything in the middle free', lede),
        at_(bs, 'at the board on the far right: solidarity, not charity', soli),
        at_(bt, 'at the board on the far left: on the tables, and the two things of ours not on one', told),
        at_(br, 'at the board on the left: the rules of the lay-by', rules),
        at_(bw, 'at the board between the last cars on the left: whose this all is', whose),
        { name: 'in the middle of the ring, behind the tables, turned back to the way in, a shadow of you for every car', x: 0, z: -3.6, yaw: Math.PI, pitch: 0.04 }
      ];

      return {
        start: { x: 0, z: 9, yaw: 0 },
        bounds: { x: [-6.2, 6.2], z: [-6.2, 9.4] },
        stops: stops
      };
    }
  };
})();

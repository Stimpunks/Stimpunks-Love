/* =============================================================================
   The Source, walked into on Cel Street, up the hill from the back of the
   Feed's concourse. Ryan's ask, 2026-11-01: the rooms behind the doors.

   IT SHARES THE SUBJECT WITH THE FEED AND NOTHING ELSE (§123). The Feed is a
   dark machine indoors, square and ruled, lit through a mask. This is noon
   outdoors on a hill of white travertine under a warm spring: the stone
   brighter than the sky, every rim a lip of the brightest stone with its hard
   shadow straight under it on the face below, streaked with what the water
   leaves, and the water milky with stone, so the sun makes no lines in it.
   NOTHING IS STRAIGHT: every pool is a rounded basin, no rim has a corner, and
   the pools step up the hill to one side and then the other, none lined up
   with the one below it. No ruled line and no dark ground anywhere: that would
   be the concourse with a view.

   A POOL FOR EVERY POOL ON THE PAGE, in its order, the first nearest the spring
   at the top of the hill, each on the side of the hill the page steps it to.
   tools/make-cel-street.py reads them off the-source.html and writes them
   between the cel:springs markers below, never by hand, so a repository the
   page grows a pool for is a pool on the hill the next run. Every pool's words
   are the page's own, lifted off it and stood on the basin's far rim: its name,
   what it is, and every deposit with its first line, its id, its day and whose
   hands made it, every hand the commit names. Nothing here counts them.

   NOTHING MOVES: the water is always moving and the stone it leaves never is,
   and the stone is what is drawn. Every colour is one §123 declares, by name.
   It keeps nothing, sends nothing and fetches nothing; its page arrives through
   Cel Street's screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j) {
    var n = Math.imul(i + 7, 374761393) ^ Math.imul(j + 11, 668265263);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['the-source.html'] = {
    name: 'The Source',
    from: 'the-feed.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      // cel:springs:begin
      var SPRINGS = [{"name": "Star Stuff", "far": false}, {"name": "Queering.Earth", "far": true}, {"name": "Cavendish Space", "far": false}, {"name": "Penguin Pebbling", "far": true}, {"name": "Map of Monotropic Experiences", "far": false}, {"name": "The Why Sheet Press", "far": true}, {"name": "Stimpunks.World", "far": false}, {"name": "Knowledge Garden Starter", "far": true}];
      // cel:springs:end
      var N = SPRINGS.length, STEP = 3.8, FOOT = -5;
      var zOf = function (i) { return FOOT - (N - 1 - i) * STEP; };
      var TOP = zOf(0) - 6;

      // NOON ON WHITE STONE: a high sun, the sky darker than the stone, and the
      // light thrown back up off the white rock all round.
      kit.scene.background = kit.col('--src-sky');
      kit.scene.add(new T.HemisphereLight(kit.col('--src-lip'), kit.col('--src-curtain'), 1.4));
      var sun = new T.DirectionalLight(kit.col('--src-lip'), 2.4);
      sun.position.set(-4, 60, -6);
      kit.scene.add(sun, sun.target);

      // THE HILLSIDE you stand on, stone the water has already laid down.
      kit.box(60, 0.06, 90, at(0, -0.03, TOP + 32), '--src-stone', false, false);

      // A BASIN on the hill: a rounded mound of stone whose face is the
      // curtain, the brightest stone for its rim, its hard shadow straight
      // under the rim, the milky water in it and the deep in its middle, and
      // the rust the water leaves streaked down the face.
      function basin(cx, cz, rx, rz, h, seed, toward) {
        var mound = new T.CylinderGeometry(1, 1.1, h, 48);
        mound.scale(rx, 1, rz);
        kit.piece(mound, at(cx, h / 2, cz), '--src-curtain', 0.014);
        var band = new T.CylinderGeometry(1.012, 1.012, 0.1, 48, 1, true);
        band.scale(rx, 1, rz);
        kit.flat(band, at(cx, h - 0.1, cz), '--src-shade');
        var lip = new T.TorusGeometry(1, 0.07, 8, 56);
        lip.rotateX(Math.PI / 2); lip.scale(rx, 1, rz);
        kit.piece(lip, at(cx, h, cz), '--src-lip', 0.008);
        var water = new T.CircleGeometry(0.96, 48); water.scale(rx, rz, 1);
        kit.flat(water, at(cx, h + 0.006, cz, 0, -Math.PI / 2), '--src-pool');
        var deep = new T.CircleGeometry(0.5, 40); deep.scale(rx, rz, 1);
        kit.flat(deep, at(cx + (hash(seed, 1) - 0.5) * 0.3 * rx, h + 0.012, cz + (hash(seed, 2) - 0.5) * 0.2 * rz, 0, -Math.PI / 2), '--src-deep');
        // Streaks of rust down the face, round the side the water spills.
        for (var s = 0; s < 4; s++) {
          var a = toward + (hash(seed, 10 + s) - 0.5) * 1.6, len = 0.1 + hash(seed, 20 + s) * (h - 0.2);
          var streak = new T.CylinderGeometry(0.013, 0.009, len, 6);
          kit.flat(streak, at(cx + Math.cos(a) * rx * 1.06, h - 0.16 - len / 2, cz + Math.sin(a) * rz * 1.06), s % 2 ? '--src-iron' : '--src-rust');
        }
      }
      // The water over the lowest point of a rim, down the face and away.
      function spill(points) {
        var curve = new T.CatmullRomCurve3(points.map(function (p) { return new T.Vector3(p[0], p[1], p[2]); }));
        kit.flat(new T.TubeGeometry(curve, 24, 0.035, 6, false), new T.Matrix4(), '--src-pool');
      }

      // THE WATER DOWN THE MIDDLE OF THE HILL, from the spring to your feet,
      // never in a straight line.
      var run = [];
      for (var q = 0; q <= 40; q++) {
        var rz = TOP + 1.6 + (0.4 - TOP - 1.6) * q / 40;
        run.push(new T.Vector3(Math.sin(q * 0.55) * 0.42 + Math.sin(q * 0.21) * 0.2, 0.012, rz));
      }
      var stream = new T.TubeGeometry(new T.CatmullRomCurve3(run), 160, 0.11, 6, false);
      stream.scale(1, 0.08, 1);
      kit.flat(stream, new T.Matrix4(), '--src-pool');

      var frame = kit.screen(1180, 800, 3.2, at(0, 0.8, TOP - 2.1), 'The Source’s own page, standing over the spring');
      var stops = [];

      // THE POOLS, one for every pool on the page, stepping up the hill.
      SPRINGS.forEach(function (sp, i) {
        var side = sp.far ? 1 : -1, cz = zOf(i) + (hash(i, 3) - 0.5) * 0.6;
        var rx = 1.35 + hash(i, 4) * 0.25, rz = 1.05 + hash(i, 5) * 0.2;
        var cx = side * (1.9 + rx + hash(i, 6) * 0.3), h = 0.36 + (N - 1 - i) * 0.05;
        var toward = side > 0 ? Math.PI : 0;
        basin(cx, cz, rx, rz, h, i, toward);
        var rimX = cx - side * rx, mid = side * 0.32;
        spill([[rimX, h, cz], [rimX - side * 0.08, h * 0.55, cz + 0.05], [rimX - side * 0.16, 0.02, cz + 0.12], [mid, 0.02, cz + 0.6]]);
        var words = kit.lift(frame, '.pool', { n: i, w: 820, h: 640, ww: 2.6, m: at(cx + side * (rx + 0.06), h + 0.02, cz, side > 0 ? RIGHT : LEFT) });
        stops.push({ name: 'at the pool for ' + sp.name, where: 'at the pool for ' + sp.name + ', its deposits standing on its far rim, newest first',
          x: side * 1.45, z: cz, yaw: side > 0 ? RIGHT : LEFT, pitch: 0.08, frame: words.el });
      });

      // THE SPRING AT THE TOP OF THE HILL, where it all comes from: the widest
      // pool, deep in its middle, a little warm breath standing over it.
      basin(0, TOP, 2.3, 1.6, 0.55, 99, Math.PI / 2);
      [[-0.5, 1.3, 0.2], [0.35, 1.7, -0.1], [0.05, 2.15, 0.05]].forEach(function (b, k) {
        var puff = new T.SphereGeometry(0.34 - k * 0.06, 16, 12); puff.scale(1.4, 0.6, 1.1);
        kit.piece(puff, at(b[0], b[1], TOP + b[2]), '--src-lip', false);
      });

      // THE HILL GOING ON UP behind the spring: terraces on terraces, each a
      // row of scalloped basins stepping one side and the other, white in the
      // sun against the sky.
      for (var k = 0; k < 5; k++) {
        var tz = TOP - 7 - k * 3.2, th = 1.2 + k * 1.25, shift = (k % 2 ? 1 : -1) * (1 + hash(k, 40) * 1.2);
        var tier = new T.CylinderGeometry(1, 1.08, th, 56); tier.scale(9 - k * 0.7, 1, 2.3);
        kit.piece(tier, at(shift, th / 2, tz), '--src-curtain', 0.02);
        var tband = new T.CylinderGeometry(1.01, 1.01, 0.16, 56, 1, true); tband.scale(9 - k * 0.7, 1, 2.3);
        kit.flat(tband, at(shift, th - 0.14, tz), '--src-shade');
        for (var p = 0; p < 3; p++) {
          var px = shift - 5 + p * 5 + (hash(k, 41 + p) - 0.5) * 1.4, prx = 1.6 + hash(k, 44 + p) * 0.9;
          var tlip = new T.TorusGeometry(1, 0.09, 8, 48); tlip.rotateX(Math.PI / 2); tlip.scale(prx, 1, 1.2);
          kit.piece(tlip, at(px, th, tz + 0.6), '--src-lip', 0.01);
          var tw = new T.CircleGeometry(0.95, 40); tw.scale(prx, 1.2, 1);
          kit.flat(tw, at(px, th + 0.006, tz + 0.6, 0, -Math.PI / 2), '--src-pool');
        }
      }

      // THE ROOM'S WORDS off its page: its name and what it is at the foot of
      // the hill, where you come up from the concourse, and the parts on the
      // springs and whose hands either side of the spring at the top.
      var head = kit.lift(frame, '.src-head', { w: 900, ww: 2.6, m: at(-2.9, 0.12, -2.2, 0.9) });
      var lede = kit.lift(frame, '.src-lede', { w: 760, ww: 2.4, m: at(2.9, 0.12, -2.2, -0.9) });
      var cbSide = N && SPRINGS[N - 1].far ? -1 : 1;
      var cb = kit.lift(frame, '.src-cb', { w: 760, ww: 2.4, m: at(cbSide * 3.1, 0.12, FOOT, cbSide > 0 ? RIGHT : LEFT) });
      var up = kit.lift(frame, '.src-part', { n: 0, w: 760, h: 620, ww: 2.4, m: at(-3.0, 0.12, TOP + 1.0, 0.7) });
      var hands = kit.lift(frame, '.src-part', { n: 1, w: 760, h: 620, ww: 2.4, m: at(3.0, 0.12, TOP + 1.0, -0.7) });

      return {
        start: { x: 0, z: -0.6, yaw: 0 },
        bounds: { x: [-1.5, 1.5], z: [TOP + 2.4, -0.4] },
        stops: [
          { name: 'at the foot of the hill, come up from the concourse, the white terraces stepping up to the spring in the sun', x: 0, z: -0.6, yaw: 0, pitch: 0.08 },
          { name: 'at the room’s name, at the foot of the hill', x: -0.72, z: -0.46, yaw: 0.9, frame: head.el },
          { name: 'at what every pool on the hill is', x: 0.72, z: -0.46, yaw: -0.9, frame: lede.el },
          { name: 'at what this room’s channel hears', x: cbSide * 0.6, z: FOOT, yaw: cbSide > 0 ? RIGHT : LEFT, frame: cb.el }
        ].concat(stops.reverse(), [
          { name: 'at the spring at the top of the hill, with the room’s own page standing over it', x: 0, z: TOP + 2.6, yaw: 0, pitch: 0.12, page: kit.page, frame: frame },
          { name: 'beside the spring, at the way up to the springs themselves', x: -0.95, z: TOP + 3.43, yaw: 0.7, frame: up.el },
          { name: 'beside the spring, at whose hands', x: 0.95, z: TOP + 3.43, yaw: -0.7, frame: hands.el }
        ])
      };
    }
  };
})();

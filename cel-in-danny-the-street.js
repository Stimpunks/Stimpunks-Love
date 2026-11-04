/* =============================================================================
   Danny the Street, walked into on Cel Street: off the plate with the
   street's name on it, on the end wall by the front door.

   IT IS THE ROAD'S WORLD AND NOBODY ELSE'S (§33): the road surface itself at
   four in the morning, under one sodium lamp, and you look DOWN at it. No
   walls, no door, no furniture and NOTHING STANDING UP: everything here lies
   flat on the tar, the page and its words included, painted on the road like
   its markings. The lamp is overhead and out of sight; all you see of it is
   its pool. ONE HUE AND NOTHING ELSE, because low-pressure sodium is a single
   wavelength: every value is on one warm line from the tar up to the lamp,
   and the front page's street (seen from the pavement, at eye level, standing
   up and full of colour) is what this is not.

   NOTHING OF DC'S IS DRAWN. Every drawing in it is of a road: kerbs, the
   broken centre line, a manhole cover, drain grates, joints in the tar. The
   words are the page's own, lifted, about whose the street's name is.

   Nothing moves, at any setting, as nothing on the page does. Every colour is
   one the page declares, by name. It keeps nothing, sends nothing and
   fetches nothing; its page arrives through Cel Street's screen().
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 7, 374761393) ^ Math.imul(j + 29, 668265263) ^ Math.imul(k + 31, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['danny-the-street.html'] = {
    name: 'Danny the Street',
    faces: ['"Overpass"'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at;
      var FLAT = -Math.PI / 2;
      var HALF = 4.2;               // half the road, kerb to kerb
      var STEP = 3.6;               // how far apart things lie along it
      var BAYS = 7;                 // the page's bays, one painted on the road after another
      var END = -(4 + STEP * (BAYS + 2));
      var DOWN = -0.55;             // as steeply down as anybody can look

      // FOUR IN THE MORNING. The tar, and nothing lit but the lamp's pool.
      kit.scene.background = kit.col('--dn-tar');
      kit.scene.fog = new T.Fog(kit.col('--dn-tar'), 14, 34);

      // Everything is laid flat on the road and lit by nothing but its own
      // value on the one line, so no other light can bring a second hue in.
      function lay(geo, x, z, ink, y, turn) { return kit.flat(geo, at(x, y || 0.01, z, turn || 0, FLAT), ink); }

      // THE ROAD, its kerbs and the pavement edges past them.
      lay(new T.PlaneGeometry(HALF * 2, 8 - END + 20), 0, (8 + END - 20) / 2, '--dn-tar', 0);
      [-1, 1].forEach(function (s) {
        lay(new T.PlaneGeometry(0.22, 8 - END + 20), s * HALF, (8 + END - 20) / 2, '--dn-kerb', 0.015);
        for (var z = 6; z > END - 18; z -= 0.9) lay(new T.PlaneGeometry(0.5, 0.04), s * (HALF + 0.36), z, '--dn-kerb', 0.015);
        lay(new T.PlaneGeometry(0.06, 8 - END + 20), s * (HALF + 0.62), (8 + END - 20) / 2, '--dn-kerb', 0.015);
      });
      // The broken centre line, and the joints across the tar.
      for (var z = 6; z > END - 18; z -= 3) lay(new T.PlaneGeometry(0.14, 1.6), 0, z, '--dn-paint', 0.02);
      for (var j = 0; j < 9; j++) lay(new T.PlaneGeometry(HALF * 2, 0.03), 0, 3 - j * 7.3 - hash(j, 1, 1) * 2, '--dn-kerb', 0.012);
      // A manhole cover, and drain grates at the kerb.
      var mz = -2.2;
      lay(new T.RingGeometry(0.42, 0.5, 28), -2.0, mz, '--dn-kerb', 0.02);
      for (var r = -2; r <= 2; r++) lay(new T.PlaneGeometry(0.78 - Math.abs(r) * 0.12, 0.03), -2.0, mz + r * 0.14, '--dn-kerb', 0.021);
      [[HALF - 0.4, -6], [-(HALF - 0.4), -17], [HALF - 0.4, -28]].forEach(function (g) {
        if (g[1] < END) return;
        lay(new T.PlaneGeometry(0.5, 0.9), g[0], g[1], '--dn-kerb', 0.018);
        for (var b = 0; b < 5; b++) lay(new T.PlaneGeometry(0.06, 0.8), g[0] - 0.18 + b * 0.09, g[1], '--dn-tar', 0.019);
      });

      // THE LAMP'S POOL: the only light, lying on the tar round where you
      // start, full in the middle and coming to nothing at its edge.
      var pool = kit.paper(256, 256, function (c, w, h) {
        c.fillStyle = kit.ink('--dn-sodium');
        for (var ring = 32; ring > 0; ring--) {
          c.globalAlpha = 0.05;
          c.beginPath(); c.arc(w / 2, h / 2, (w / 2) * ring / 32, 0, Math.PI * 2); c.fill();
        }
        c.globalAlpha = 1;
      });
      var mat = new T.MeshBasicMaterial({ map: pool, transparent: true, depthWrite: false });
      var lit = new T.Mesh(new T.PlaneGeometry(14, 14), mat);
      lit.position.set(0, 0.03, -2.5); lit.rotation.x = FLAT;
      lit.matrixAutoUpdate = false; lit.updateMatrix(); lit.matrixWorldNeedsUpdate = true;
      kit.scene.add(lit);

      // THE PAGE, lying on the road at your feet where you come in, and the
      // name plate and the first words painted on the tar beyond it.
      var stops = [];
      var pw = 3.4, page = kit.screen(1180, 800, pw, at(-1.9, 0.03, 1.4, 0, FLAT), 'Danny the Street’s own page, lying on the road at your feet');
      function paint(sel, n, x, z, w, ww, h) {
        return kit.lift(page, sel, { n: n, w: w, h: h, ww: ww, m: at(x, 0.04, z, 0, FLAT) });
      }
      var plate = paint('.dn-plate', 0, 1.9, 1.0, 640, 2.6);
      var lede = paint('.dn-lede', 0, 0, -3.4, 760, 2.8, 760);
      stops.push(
        { name: 'on the road under the lamp, looking down at it', where: 'on the road under the lamp', x: 0, z: 5.2, yaw: 0, pitch: DOWN },
        { name: 'over the road’s own page, lying at your feet', where: 'over the road’s own page', x: -1.9, z: 2.5, yaw: 0, pitch: DOWN, page: kit.page, frame: page },
        { name: 'over the name plate painted on the road', where: 'over the name plate on the road', x: 1.9, z: 2.0, yaw: 0, pitch: DOWN, frame: plate.el },
        { name: 'over the first words, painted across the road', where: 'over the first words on the road', x: 0, z: -2.3, yaw: 0, pitch: DOWN, frame: lede.el }
      );

      // THE BAYS, one after another down the road, each painted on the tar
      // between the dashes, its heading the legend at its near end.
      for (var b = 0; b < BAYS; b++) {
        var bz = -8.5 - b * STEP * 1.5, side = b % 2 ? 1.9 : -1.9;
        var bay = paint('.dn-bay', b, side, bz, 680, 2.8, 760);
        var nth = 'over the ' + ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth'][b] + ' bay painted on the road';
        stops.push({ name: nth, where: nth, x: side, z: bz + 1.0, yaw: 0, pitch: DOWN, frame: bay.el });
      }
      var last = -8.5 - (BAYS - 1) * STEP * 1.5;

      return {
        start: { x: 0, z: 5.2, yaw: 0, pitch: DOWN },
        bounds: { x: [-(HALF - 0.4), HALF - 0.4], z: [last - 4, 6] },
        stops: stops
      };
    }
  };
})();

/* =============================================================================
   The Repeater, walked into on Cel Street: turning 06 off the Outskirts, a
   radio mast and its hut on the ridge at the far end of the road.

   IT IS THE REPEATER'S WORLD AND NOBODY ELSE'S (§45): EVERYTHING IS A
   SILHOUETTE. Nothing up here is lit. The cloud is, faintly, from beneath, by
   every lit thing on the road and the town past it, so the ridge, the hut and
   the mast are black shapes against a sky the colour of somebody else's light:
   the glow low along the horizon, the dull warm cloud above it. Every shape is
   drawn flat in --rp-ridge and nothing in the room has a lit face, which is
   what holds it off Breaker Breaker, the street's other radio, where every
   shape is drawn dot to dot by its own lamps, and off the campgrounds, whose
   sky is cold and blue and lit by nothing.

   THE TWO LAMPS ON THE MAST ARE STEADY. They light nothing round them and they
   do not blink. Nothing in the room moves at any setting.

   THE PAGE'S WORDS STAND ON BOARDS ALONG THE TRACK up to the hut, each showing
   only while you stand at it, so from anywhere else the ridge is only its
   outline. The words on the hut's door are the page's own, which says they are
   painted there. The open line is the page's, worked by its own repeater.js,
   which makes a quiet noise in the browser and sends and listens to nothing.
   Every colour is one §45 declares, by name. It keeps nothing, sends nothing
   and fetches nothing; its page arrives through Cel Street's screen().
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 7, 374761393) ^ Math.imul(j + 29, 668265263) ^ Math.imul(k + 31, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['repeater.html'] = {
    name: 'The Repeater',
    from: 'the-outskirts.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var V = function (x, y, z) { return new T.Vector3(x, y, z); };
      function flatBox(w, h, d, m, ink) { kit.flat(new T.BoxGeometry(w, h, d), m, ink || '--rp-ridge'); }
      function strut(a, b, r, ink) {
        var d = new T.Vector3().subVectors(b, a);
        var g = new T.CylinderGeometry(r, r, d.length(), 5);
        var q = new T.Quaternion().setFromUnitVectors(V(0, 1, 0), d.clone().normalize());
        kit.flat(g, new T.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), q, V(1, 1, 1)), ink || '--rp-ridge');
      }

      // THE SKY: the dull warm cloud overhead, and lower down the band of it
      // lit from underneath by everything else on the road, with a darker
      // band between. Nothing in the room is lit by it; it is only behind.
      kit.scene.background = kit.col('--rp-cloud');
      function band(y0, y1, ink) {
        var g = new T.CylinderGeometry(260, 260, y1 - y0, 64, 1, true);
        var mesh = kit.flat(g, at(0, (y0 + y1) / 2, 0), ink);
        mesh.material.side = T.BackSide;
      }
      band(-80, 26, '--rp-glow');
      band(26, 52, '--rp-deep');

      // THE RIDGE: black ground underfoot that ends at its edges, so past them
      // there is only the glow, lower than you stand.
      kit.flat(new T.PlaneGeometry(30, 34), at(0, 0, -4, 0, -Math.PI / 2), '--rp-ridge');
      // Tussocks along the ridge's edge, cut out against the glow.
      var tuft = new T.ConeGeometry(0.16, 0.7, 4);
      for (var k = 0; k < 120; k++) {
        var side = k % 4, s = (hash(k, 1, 1) - 0.5);
        var tx = side === 0 ? s * 28 : side === 1 ? 14.4 : side === 2 ? -14.4 : s * 28;
        var tz = side === 0 ? -20.4 : side === 3 ? 12.4 : -4 + s * 32;
        if (side === 3 && Math.abs(tx) < 2) continue;
        kit.flat(tuft, at(tx + (hash(k, 2, 1) - 0.5) * 0.6, 0.3, tz + (hash(k, 2, 2) - 0.5) * 0.6, 0, (hash(k, 3, 1) - 0.5) * 0.5), '--rp-ridge');
      }

      // THE MAST: a lattice tower tapering up from a square foot, braced on
      // every face, aerials at the top, guy wires down to the ground.
      var MX = 5.6, MZ = -11, MH = 24;
      function leg(i, y) { var w = 0.8 - (0.6 * y / MH); return V(MX + (i & 1 ? w : -w), y, MZ + (i & 2 ? w : -w)); }
      [0, 1, 3, 2].forEach(function (i) { strut(leg(i, 0), leg(i, MH), 0.05); });
      for (var y = 0; y < MH; y += 2) {
        [[0, 1], [1, 3], [3, 2], [2, 0]].forEach(function (f) {
          strut(leg(f[0], y), leg(f[1], y + 2), 0.025);
          strut(leg(f[1], y), leg(f[0], y + 2), 0.025);
          strut(leg(f[0], y + 2), leg(f[1], y + 2), 0.025);
        });
      }
      strut(V(MX, MH, MZ), V(MX, MH + 3.4, MZ), 0.05);
      [[1.4, 21.5], [-1.2, 18.5]].forEach(function (a) {
        strut(V(MX + a[0], a[1] - 0.8, MZ), V(MX + a[0], a[1] + 0.8, MZ), 0.04);
        strut(V(MX, a[1], MZ), V(MX + a[0], a[1], MZ), 0.03);
      });
      [0, 1, 2].forEach(function (g) {
        var th = g * Math.PI * 2 / 3 + 0.4, ax = MX + Math.sin(th) * 9, az = MZ + Math.cos(th) * 9;
        [8, 15, 22].forEach(function (h) { strut(V(MX, h, MZ), V(ax, 0, az), 0.012); });
        flatBox(0.4, 0.3, 0.4, at(ax, 0.15, az));
      });
      // Its two lamps, steady, lighting nothing.
      kit.flat(new T.SphereGeometry(0.2, 10, 8), at(MX, MH + 3.5, MZ), '--rp-lamp');
      kit.flat(new T.SphereGeometry(0.16, 10, 8), at(MX + 0.5, 12, MZ + 0.5), '--rp-lamp');

      // THE HUT at the mast's foot: a box with a pitched roof and a door
      // facing the track, its frame just to be told from the dark.
      var HX = -4.6, HZ = -11;
      flatBox(4.0, 2.6, 3.2, at(HX, 1.3, HZ));
      [-1, 1].forEach(function (s) {
        var roof = new T.Matrix4().multiplyMatrices(at(HX + s * 1.05, 2.95, HZ), new T.Matrix4().makeRotationZ(-s * 0.42));
        flatBox(2.4, 0.12, 3.5, roof);
      });
      var DZ = HZ + 1.62;
      [[-0.62, 1.05, 0.08, 2.1], [0.62, 1.05, 0.08, 2.1], [0, 2.12, 1.32, 0.08]].forEach(function (f) {
        flatBox(f[2], f[3], 0.04, at(HX + f[0], f[1], DZ), '--rp-deep');
      });
      strut(V(HX + 1.6, 2.3, HZ + 1.0), V(MX - 0.6, 6, MZ), 0.02);

      // BOARDS along the track, silhouettes on two posts; the page's words on
      // each show only while you stand at it.
      function zone(st) { return [st.x - 1.9, st.x + 1.9, st.z - 1.9, st.z + 1.9]; }
      function board(x, z, r, w, h) {
        var m = at(x, 0, z, r), n = V(Math.sin(r), 0, Math.cos(r));
        [-1, 1].forEach(function (s) {
          flatBox(0.1, 0.55 + h, 0.1, new T.Matrix4().multiplyMatrices(m, at(s * (w / 2 + 0.04), (0.55 + h) / 2, -0.06)));
        });
        flatBox(w + 0.16, h + 0.14, 0.05, new T.Matrix4().multiplyMatrices(m, at(0, 0.55 + h / 2, -0.06)));
        var st = { x: x + n.x * 2.2, z: z + n.z * 2.2, yaw: r, pitch: 0.06 };
        return { m: new T.Matrix4().multiplyMatrices(m, at(0, 0.55, 0)), stop: st };
      }

      var stops = [
        { name: 'at the top of the track, the hut and the mast ahead, black against the glow', x: 0, z: 8.6, yaw: 0, pitch: 0.12 }
      ];

      // THE ROOM'S OWN PAGE, on a board by the top of the track.
      var pgw = 2.2, pgh = pgw * 800 / 1180, pg = board(3.4, 5.6, RIGHT, pgw, pgh);
      var frame = kit.screen(1180, 800, pgw, new T.Matrix4().multiplyMatrices(pg.m, at(0, pgh / 2, 0)), 'The Repeater’s own page, on a board by the top of the track', zone(pg.stop));

      var parts = [
        { x: -3.4, z: 5.6, r: LEFT, sel: '.rp-head', o: { drop: '.rp-art' }, w: 760, ww: 2.0, name: 'at the board by the top of the track: the name', where: 'at the board by the top of the track, with the name on it' },
        { x: -3.4, z: 1.6, r: LEFT, sel: '.rp-lede', w: 760, ww: 2.0, h: 640, name: 'at the board on the left: the ridge, and what a repeater is', where: 'at the board on the left of the track, on the ridge and what a repeater is' },
        { x: 3.4, z: 1.6, r: RIGHT, sel: '.rp-part', o: { n: 0 }, w: 760, ww: 2.0, h: 700, name: 'at the board on the right: signal is a place too', where: 'at the board on the right of the track, on signal being a place too' },
        { x: -3.4, z: -2.4, r: LEFT, sel: '.rp-part', o: { n: 2 }, w: 760, ww: 2.0, h: 700, name: 'at the board on the left further up: the log, every kind of contact and no count of any', where: 'at the board on the left further up, the log, with a card for every kind of contact' },
        { x: 3.4, z: -2.4, r: RIGHT, sel: '.rp-part', o: { n: 3 }, w: 760, ww: 2.0, h: 700, name: 'at the board on the right further up: the rules on the ridge', where: 'at the board on the right further up, the rules on the ridge' },
        { x: -1.2, z: -8.4, r: 0, sel: '.rp-part', o: { n: 1 }, w: 680, ww: 1.8, h: 760, name: 'at the board by the hut: leave the line open', where: 'at the board beside the hut, where the line can be opened and left open' },
        { x: 2.4, z: -7.4, r: RIGHT, sel: '.rp-part', o: { n: 4 }, w: 760, ww: 2.0, h: 700, name: 'at the board under the mast: whose this all is', where: 'at the board under the mast, on whose this all is' }
      ];
      var lifts = parts.map(function (pt) {
        var b = board(pt.x, pt.z, pt.r, pt.ww, 1.6);
        var o = { w: pt.w, ww: pt.ww, m: b.m, zone: zone(b.stop) };
        if (pt.h) o.h = pt.h;
        for (var key in (pt.o || {})) o[key] = pt.o[key];
        var it = kit.lift(frame, pt.sel, o);
        stops.push({ name: pt.name, where: pt.where, x: b.stop.x, z: b.stop.z, yaw: b.stop.yaw, pitch: b.stop.pitch, frame: it.el });
        return it;
      });
      // The open line works where it stands, by the page's own script.
      kit.wire(frame, 'repeater.js');

      // THE DOOR of the hut, with the words the page says are painted on it.
      var doorStop = { x: HX, z: DZ + 2.2, yaw: 0, pitch: 0.04 };
      var door = kit.lift(frame, '.rp-said', { n: 1, w: 520, ww: 1.1, m: at(HX, 0.75, DZ + 0.03), zone: zone(doorStop) });
      stops.push({ name: 'at the hut’s door, and the words painted on it', where: 'at the door of the hut at the foot of the mast, with the words painted on it', x: doorStop.x, z: doorStop.z, yaw: 0, pitch: doorStop.pitch, frame: door.el });

      stops.push(
        { name: 'under the mast, looking up at its two steady lamps', x: MX - 2.6, z: MZ + 3.6, yaw: 0.5, pitch: 0.9 },
        { name: 'at the board by the top of the track, with the Repeater’s own page on it', x: pg.stop.x, z: pg.stop.z, yaw: pg.stop.yaw, pitch: pg.stop.pitch, page: kit.page, frame: frame }
      );

      return {
        start: { x: 0, z: 8.6, yaw: 0 },
        bounds: { x: [-11, 11], z: [-8.6, 10] },
        stops: stops
      };
    }
  };
})();

/* =============================================================================
   Glow Wild Hollow, walked into on Cel Street, down through the glowing
   mushroom in the Faery Yurt. Ryan's ask, 2026-10-31: every doorway in the
   yurt opening onto its own room.

   IT IS HELEN EDGAR'S ROOM AND HER WORLD (§129), and this is OURS: a drawing of
   her hollow for Cel Street, in the colours her room declares and nothing
   else, which changes nothing on her page and is hers to keep or send back.
   Air, Earth and Water, her spaces, and Fire at the end. EVERY LIGHT DOWN HERE
   BELONGS TO SOMETHING ALIVE: no moon, no star, no lamp, no flame, but the
   fireflies over the grass, foxfire in the fallen logs, glow-worms on the
   bank, the sea sparkling at its edge and a jellyfish's rim over the water.
   The one exception is hers: the bonfire on the shore under Fire, the only
   light that is not alive, and the only thing that lights anything round it.
   You stand under the mushroom you came down through.

   HER SEA, HER JELLYFISH, HER FIREFLIES AND HER BONFIRE ARE HER PAGE'S OWN,
   lifted off it by Cel Street's kit.lift() and standing in their own spaces,
   with glow-wild.js, which her page loads, run against the copies. So they
   answer a touch here as they do there, under that script's own rules: a light
   comes up over RISE and goes over FADE, nothing flashes, sound and buzz and
   Keep it stirring start off, and at Gentle a light stays lit, still, until
   pressed again.

   NOTHING ELSE MOVES. Every colour is one her room declares, by name. It
   keeps nothing, sends nothing and fetches nothing; her page arrives through
   Cel Street's screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 19, 374761393) ^ Math.imul(j + 61, 668265263) ^ Math.imul(k + 67, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['glow-wild-hollow.html'] = {
    name: 'Glow Wild Hollow',
    from: 'faery-yurt.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var ID = new T.Matrix4();
      // Many small living lights as one mesh, so a swarm is one draw.
      function merged(parts) {
        var arrs = [], n = 0;
        parts.forEach(function (p) {
          var g = p[0].index ? p[0].toNonIndexed() : p[0].clone();
          g.applyMatrix4(p[1]); arrs.push(g.attributes.position.array); n += g.attributes.position.array.length;
        });
        var pos = new Float32Array(n), o = 0;
        arrs.forEach(function (a) { pos.set(a, o); o += a.length; });
        var out = new T.BufferGeometry(); out.setAttribute('position', new T.BufferAttribute(pos, 3));
        return out;
      }
      var dot = new T.SphereGeometry(1, 6, 4);
      function points(list, ink) { if (list.length) kit.flat(merged(list), ID, ink); }

      // NIGHT, with nothing in the sky. Only enough of it to tell the hills
      // from the dark.
      kit.scene.background = kit.col('--gwh-night');
      kit.scene.add(new T.HemisphereLight(kit.col('--gwh-deep'), kit.col('--gwh-night'), 1.6));

      // THE GROUND, and the hills all round, dark.
      box(80, 0.1, 90, at(0, -0.05, -24), '--gwh-hill', false, false);
      var hill = new T.SphereGeometry(1, 14, 8);
      [[-16, -10, 9], [15, -6, 8], [-18, -30, 11], [17, -26, 10], [-6, -60, 16], [12, -58, 14]].forEach(function (h) {
        var g = hill.clone(); g.scale(h[2], h[2] * 0.42, h[2] * 0.7);
        kit.piece(g, at(h[0], -1, h[1]), '--gwh-hill', 0.2);
      });

      // THE MUSHROOM you came down through, behind you: its gills glow with
      // foxfire, the one light up there.
      kit.cyl(0.9, 1.2, 4.2, at(0, 2.1, 2.6), '--gwh-hill', 0.04, 18);
      var cap = new T.SphereGeometry(3.4, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2); cap.scale(1, 0.55, 1);
      kit.piece(cap, at(0, 4.2, 2.6), '--gwh-hill', 0.06);
      kit.flat(new T.RingGeometry(1.0, 3.3, 32, 1), at(0, 4.18, 2.6, 0, Math.PI / 2), '--gwh-fox');
      box(0.9, 1.9, 0.1, at(0, 0.95, 1.65), '--gwh-night', false);

      var stops = [{ name: 'under the mushroom you came down through', x: 0, z: 0.4, yaw: 0 }];

      // HER OWN PAGE, standing by the mushroom's foot on the right, like the
      // panels down the hollow.
      var pw = 2.6, ph = pw * 800 / 1180;
      var pg = at(3.0, 0, -1.6, -Math.PI / 2 + 0.35);
      box(pw + 0.16, ph + 0.16, 0.06, M(pg, at(0, 0.3 + ph / 2, 0)), '--gwh-deep');
      var frame = kit.screen(1180, 800, pw, M(pg, at(0, 0.3 + ph / 2, 0.04)), 'Glow Wild Hollow’s own page, standing by the foot of the mushroom');
      stops.push({ name: 'by the foot of the mushroom, with her room’s own page', x: 0.6, z: -0.7, yaw: -Math.PI / 2 + 0.35, page: kit.page, frame: frame });

      // A panel off her page, standing on the ground beside the way down,
      // turned to face it; and a stop in front of it.
      function panel(sel, side, z, label) {
        var ry = side < 0 ? Math.PI / 2 : -Math.PI / 2;
        var it = kit.lift(frame, sel, { w: 760, ww: 2.2, m: at(side * 3.2, 0.12, z, ry) });
        stops.push({ name: label, x: side * 0.5, z: z, yaw: side < 0 ? Math.PI / 2 : -Math.PI / 2, frame: it.el });
        return it;
      }

      // AIR: long grass, and fireflies over it at every height.
      var blade = new T.ConeGeometry(0.02, 0.5, 3), grass = [];
      for (var k = 0; k < 420; k++) {
        var gx = (hash(k, 1, 1) - 0.5) * 22, gz = -2 - hash(k, 1, 2) * 12;
        if (Math.abs(gx) < 1.1) continue;
        grass.push([blade, at(gx, 0.22, gz, 0, (hash(k, 1, 3) - 0.5) * 0.5, (hash(k, 1, 4) - 0.5) * 0.5)]);
      }
      var grassGeo = merged(grass); grassGeo.computeVertexNormals();
      kit.piece(grassGeo, ID, '--gwh-hill', false);
      var flies = [];
      for (k = 0; k < 160; k++) {
        var s = 0.025 + hash(k, 2, 4) * 0.02;
        flies.push([dot, at((hash(k, 2, 1) - 0.5) * 18, 0.4 + hash(k, 2, 2) * 2.8, -1.5 - hash(k, 2, 3) * 13).scale(new T.Vector3(s, s, s))]);
      }
      points(flies, '--gwh-worm');
      panel('.hollow-panel.hollow-air', -1, -7, 'in the long grass, among the fireflies');

      // EARTH: a whirlpool's mouth in the ground, fallen logs grown with
      // foxfire, and glow-worms along the bank.
      for (var r = 0; r < 5; r++) {
        kit.piece(new T.TorusGeometry(0.4 + r * 0.32, 0.05, 6, 28), at(0, 0.03, -15.5, r, Math.PI / 2), r % 2 ? '--gwh-wave' : '--gwh-deep', false);
      }
      var fox = [];
      [[-3.0, -18.5, 0.4], [2.6, -20.5, -0.5], [-2.2, -23, 1.1]].forEach(function (lg, li) {
        kit.cyl(0.32, 0.36, 3.2, at(lg[0], 0.32, lg[1], lg[2], 0, Math.PI / 2), '--gwh-hill', 0.04, 12);
        for (var f = 0; f < 22; f++) {
          var t = (hash(li, f, 1) - 0.5) * 2.8, sz2 = 0.02 + hash(li, f, 2) * 0.03;
          var lx = lg[0] + Math.cos(lg[2]) * t, lzz = lg[1] - Math.sin(lg[2]) * t;
          var shelf = new T.SphereGeometry(1, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2);
          fox.push([shelf, at(lx + (hash(li, f, 3) - 0.5) * 0.3, 0.25 + hash(li, f, 4) * 0.4, lzz + 0.33, 0, -Math.PI / 2).scale(new T.Vector3(sz2 * 2, sz2 * 2, sz2))]);
        }
      });
      points(fox, '--gwh-fox');
      kit.piece((function () { var g = new T.CylinderGeometry(1, 1, 1, 20, 1, false, 0, Math.PI); g.scale(10, 1.2, 1.6); return g; })(), at(-6.5, 0.4, -21, Math.PI / 2), '--gwh-hill', 0.06);
      var worms = [];
      for (k = 0; k < 70; k++) worms.push([dot, at(-5.4 + hash(k, 3, 1) * 0.7, 0.2 + hash(k, 3, 2) * 0.9, -16.5 - hash(k, 3, 3) * 9).scale(new T.Vector3(0.022, 0.022, 0.022))]);
      points(worms, '--gwh-worm');
      stops.push({ name: 'by the fallen logs, with foxfire growing in them', x: 0.2, z: -19.5, yaw: 0.6 });

      // WATER: the shore, the sea going out dark, and sparkle where it meets
      // the land; a jellyfish's rim over it.
      kit.flat(new T.PlaneGeometry(80, 40), at(0, 0.03, -46, 0, -Math.PI / 2), '--gwh-wave');
      kit.flat(new T.PlaneGeometry(80, 30), at(0, 0.035, -58, 0, -Math.PI / 2), '--gwh-deep');
      var spark = [];
      for (k = 0; k < 260; k++) {
        var sx = (hash(k, 4, 1) - 0.5) * 30, edge = -26.2 + Math.sin(sx * 0.6) * 0.5;
        spark.push([dot, at(sx, 0.05, edge - hash(k, 4, 2) * 1.2).scale(new T.Vector3(0.035, 0.012, 0.035))]);
      }
      points(spark, '--gwh-sea');
      var bell = new T.SphereGeometry(0.55, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2); bell.scale(1, 0.6, 1);
      kit.piece(bell, at(4.5, 1.6, -31), '--gwh-wave', false);
      kit.flat(new T.TorusGeometry(0.55, 0.025, 6, 32), at(4.5, 1.6, -31, 0, Math.PI / 2), '--gwh-sea');
      var tent = [];
      for (k = 0; k < 14; k++) {
        var ta = k / 14 * Math.PI * 2;
        tent.push([new T.CylinderGeometry(0.006, 0.006, 0.9 + hash(k, 5, 1) * 0.6, 3), at(4.5 + Math.cos(ta) * 0.5, 1.1 - hash(k, 5, 2) * 0.2, -31 + Math.sin(ta) * 0.5)]);
      }
      points(tent, '--gwh-sea');
      panel('.hollow-panel.hollow-sea', -1, -24.6, 'at the edge of the sea, where it sparkles');
      panel('.hollow-panel.hollow-jelly', 1, -24.6, 'on the shore, with the jellyfish');

      // FIRE: the bonfire on the shore at the end, the one light down here
      // that is not alive, and the only one that lights anything round it.
      var fx = 0, fz = -29.5;
      var fire = new T.PointLight(kit.col('--gwh-flame'), 22, 14, 1.4);
      fire.position.set(fx, 1.1, fz);
      kit.scene.add(fire);
      for (var lgi = 0; lgi < 6; lgi++) {
        var la = lgi / 6 * Math.PI;
        kit.cyl(0.08, 0.1, 1.5, at(fx, 0.45, fz, la, 0, 0.9), '--gwh-fire-log', 0.02, 8);
      }
      for (var st = 0; st < 12; st++) {
        var sa = st / 12 * Math.PI * 2;
        kit.piece(new T.DodecahedronGeometry(0.16, 0), at(fx + Math.cos(sa) * 0.9, 0.1, fz + Math.sin(sa) * 0.9, st), '--gwh-hill', 0.02);
      }
      kit.flat(new T.ConeGeometry(0.42, 1.2, 9), at(fx, 0.75, fz), '--gwh-flame');
      kit.flat(new T.ConeGeometry(0.24, 0.8, 9), at(fx + 0.04, 0.62, fz + 0.12), '--gwh-flame-2');
      kit.flat(new T.CircleGeometry(0.6, 14), at(fx, 0.06, fz, 0, -Math.PI / 2), '--gwh-ember');
      var firePanel = kit.lift(frame, '.hollow-panel.hollow-fire', { w: 760, ww: 2.2, m: at(-3.2, 0.12, -29.5, Math.PI / 2) });
      stops.push({ name: 'by the bonfire on the shore, under Fire', x: -0.5, z: -28.6, yaw: Math.PI / 2, frame: firePanel.el });

      // Her page's own script, run against the panels here.
      kit.wire(frame, 'glow-wild.js');

      return {
        start: { x: 0, z: 0.4, yaw: 0 },
        bounds: { x: [-2.6, 2.6], z: [-29, 0.8] },
        stops: stops
      };
    }
  };
})();

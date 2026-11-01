/* =============================================================================
   The Campfire, walked into on Cel Street, through its door up the stair at
   Cavendish Coworking. Ryan's ask, 2026-11-01: the rooms behind the doors.

   IT IS THE ROOM'S OWN WORLD AND SHARES NOTHING WITH THE HOUSE IT OPENS OFF
   (§75). The house is green daylight through canvas blinds, every door shut;
   this is a fire in a clearing at night, a ring of logs round it, and past the
   logs the trunks of the trees going up into the black. There is no wall and
   no roof anywhere in it.

   THE LIGHT COMES FROM THE MIDDLE, AT GROUND HEIGHT, and nothing else is lit:
   every log is lit on the side facing in and dark on the side facing out,
   every shadow points away from the fire, and the trees are lit only on the
   faces that look at it. If a shadow ever points at the fire, or a wall goes
   up behind the trees, it has become an indoor room.

   NOTHING MOVES AT ANY SETTING, THE FLAME INCLUDED. It is drawn still, in the
   room's own flame and fire colours; a flicker would be Club Chronic's strobe
   arriving through a fire. The smoke hangs.

   THE WORDS ARE THE PAGE'S OWN, lifted off it and never retyped, each on a low
   trestle of two stakes at the edge of the light, facing the fire: the room's
   name and its line, how it goes here, why a campfire, and whose words, David
   Thornburg's name among them; across the fire, the screen the page calls the
   fire, what is on it and the way back to the playlist, and the rack of fires,
   played as on the page through love-embed.js and rack.js. The room's call and
   its radio stay on its page, which stands on a board by the way in, because
   they talk to the CB.

   Swaying Sweetgrass's fire pit is a small object in a meadow at golden hour,
   lit from behind by a low sun; this is night, and this fire is the only light.
   The fires on the rack are that pit's, borrowed by the page; nothing of the
   meadow is drawn here.

   Every colour is one §75 declares, by name. It keeps nothing, sends nothing
   and fetches nothing; its page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['cavendish-campfire.html'] = {
    name: 'The Campfire',
    from: 'cavendish-coworking.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var CX = 0, CZ = -5.0;          // the fire, in the middle of the clearing
      var RL = 2.5;                    // the ring of logs people sit on
      var RB = 4.5;                    // the trestles at the edge of the light
      var RC = 6.2;                    // where the clearing ends and the trees begin

      // A point at a turn a from the way in (a = 0 is the way in, a = PI the far
      // side), r from the fire; and the turn that faces the fire from there.
      function on(a, r) { return { x: CX + Math.sin(a) * r, z: CZ + Math.cos(a) * r }; }
      function facing(a) { return a + Math.PI; }
      // The same scatter every time: a number between 0 and 1 out of a seed.
      function seeded(n) { var s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }

      // THE NIGHT, and the one light: the fire, low, in the middle, throwing
      // every shadow outward. A little of the night itself, so the trunks past
      // the light are just there.
      kit.scene.background = kit.col('--cf-night');
      kit.scene.add(new T.HemisphereLight(kit.col('--cf-smoke'), kit.col('--cf-night'), 0.55));
      var fire = new T.PointLight(kit.col('--cf-flame'), 34, 22, 1.7);
      fire.position.set(CX, 0.75, CZ);
      fire.castShadow = true;
      fire.shadow.mapSize.set(1024, 1024);
      fire.shadow.bias = -0.002; fire.shadow.normalBias = 0.03;
      fire.shadow.camera.near = 0.3; fire.shadow.camera.far = 22;
      kit.scene.add(fire);

      // An unlit thing: what gives off its own light rather than being lit, the
      // flame and the embers, and the smoke hanging over them.
      function glow(geo, m, ink, alpha) {
        var mat = new T.MeshBasicMaterial({ color: kit.col(ink), side: T.DoubleSide, transparent: alpha < 1, depthWrite: alpha >= 1, opacity: alpha });
        var mesh = new T.Mesh(geo, mat);
        mesh.matrixAutoUpdate = false;
        mesh.matrix.copy(m);
        mesh.matrixWorldNeedsUpdate = true;
        kit.scene.add(mesh);
      }

      // THE GROUND: the lit earth of the clearing, going to night at its edge
      // and under the trees.
      kit.piece(new T.CircleGeometry(RC, 56), at(CX, 0, CZ, 0, -Math.PI / 2), '--cf-lit', false, false);
      kit.piece(new T.RingGeometry(RC, RC + 14, 56), at(CX, -0.005, CZ, 0, -Math.PI / 2), '--cf-night', false, false);

      // THE WAY IN: a path of trodden earth out between the trunks, toward the
      // stair you came up.
      kit.piece(new T.PlaneGeometry(1.5, 8), at(CX, 0.004, CZ + RC + 2.6, 0, -Math.PI / 2), '--cf-lit', false, false);

      // THE FIRE: a ring of stones, the logs leaning in, the embers under them,
      // and the flame standing still. Its light is the room's.
      for (var s = 0; s < 14; s++) {
        var sa = s / 14 * Math.PI * 2, sp = on(sa, 0.82);
        kit.piece(new T.DodecahedronGeometry(0.17 + seeded(s) * 0.06, 0), at(sp.x, 0.1, sp.z, sa * 2.3), '--cf-log', 0.01);
      }
      glow(new T.CircleGeometry(0.62, 28), at(CX, 0.02, CZ, 0, -Math.PI / 2), '--cf-ember', 1);
      for (var l = 0; l < 6; l++) {
        var la = l / 6 * Math.PI * 2 + 0.3, lp = on(la, 0.36);
        cyl(0.07, 0.09, 1.25, at(lp.x, 0.42, lp.z, la, -0.62), '--cf-bark', 0.012, 8);
      }
      glow(new T.ConeGeometry(0.42, 1.25, 18, 1, true), at(CX, 0.78, CZ), '--cf-fire', 0.92);
      glow(new T.ConeGeometry(0.26, 0.95, 16, 1, true), at(CX, 0.72, CZ), '--cf-flame', 1);
      [[0.2, 0.1, 0.55, 0.6], [-0.18, -0.08, 0.5, -0.5], [0.04, -0.2, 0.62, 1.9]].forEach(function (t) {
        glow(new T.ConeGeometry(0.12, t[2], 12, 1, true), at(CX + t[0], 0.42 + t[2] / 2, CZ + t[1], t[3]), '--cf-flame', 1);
      });
      // The smoke, hanging over the fire.
      glow(new T.CylinderGeometry(0.42, 0.18, 3.2, 20, 1, true), at(CX, 2.9, CZ), '--cf-smoke', 0.07);

      // THE RING OF LOGS to sit on, each lying across the ring, lit on the side
      // facing in; a gap at the way in so nobody has to step over one.
      for (var g = 0; g < 8; g++) {
        var ga = 0.45 + g * (Math.PI * 2 - 0.9) / 7, gp = on(ga, RL), len = 1.2 + seeded(g + 40) * 0.35;
        cyl(0.21, 0.23, len, at(gp.x, 0.22, gp.z, ga, 0, Math.PI / 2), '--cf-bark', 0.014, 12);
      }

      // THE TREES past the clearing: trunks only, going up out of the light into
      // the black, none of them a wall.
      for (var t = 0; t < 46; t++) {
        var ta = seeded(t + 100) * Math.PI * 2;
        if (Math.abs(((ta + Math.PI) % (Math.PI * 2)) - Math.PI) < 0.22) continue;   // the way in
        var tr = RC + 0.6 + seeded(t + 200) * 6, tp = on(ta, tr), th = 9 + seeded(t + 300) * 5;
        var w = 0.22 + seeded(t + 400) * 0.22;
        cyl(w * 0.75, w, th, at(tp.x, th / 2, tp.z), '--cf-bark', 0.02, 9);
      }

      // A LOW TRESTLE at the edge of the light for each of the page's words to
      // stand on: two stakes and a crossbar, facing the fire.
      function trestle(a, wide) {
        var p = on(a, RB + 0.12), side = wide / 2 - 0.12;
        [-1, 1].forEach(function (k) {
          cyl(0.045, 0.05, 0.62, at(p.x + Math.cos(a) * side * k, 0.31, p.z - Math.sin(a) * side * k), '--cf-bark', 0.01, 8);
        });
        box(wide, 0.08, 0.1, at(p.x, 0.36, p.z, facing(a)), '--cf-bark', 0.01);
      }
      function stand(a, y, r) { var p = on(a, r || RB); return at(p.x, y, p.z, facing(a)); }

      // THE ROOM'S OWN PAGE, on a board by the way in, with its call and its
      // radio on it.
      var PA = 0.24 * Math.PI, pgw = 2.3, pgh = pgw * 800 / 1180, pgy = 0.55 + pgh / 2;
      var pp = on(PA, RB + 0.15);
      box(pgw + 0.14, pgh + 0.14, 0.06, at(pp.x, pgy, pp.z, facing(PA)), '--cf-bark', 0.012);
      [-1, 1].forEach(function (k) {
        cyl(0.05, 0.06, pgy, at(pp.x + Math.cos(PA) * (pgw / 2 - 0.2) * k, pgy / 2, pp.z - Math.sin(PA) * (pgw / 2 - 0.2) * k), '--cf-bark', 0.01, 8);
      });
      var page = kit.screen(1180, 800, pgw, stand(PA, pgy, RB + 0.08), 'The Campfire’s own page, on a board by the way in, with its call');

      // THE FIRE ON THE PAGE, across the fire: the screen, giving off nothing
      // until somebody presses it, what is on it, and the way back to the
      // playlist; and the rack of fires round to the left of it.
      var SA = Math.PI;
      trestle(SA, 2.2);
      var screen = kit.lift(page, '.cf-screen', { w: 860, ww: 2.2, m: stand(SA, 1.3) });
      kit.lift(page, '.cf-screen__now', { w: 760, ww: 2.0, m: stand(SA, 0.98) });
      kit.lift(page, '.cf-screen__back', { w: 640, ww: 1.6, m: stand(SA, 0.62) });
      var KA = 0.68 * Math.PI;
      trestle(KA, 1.9);
      var rack = kit.lift(page, '.cf-rack', { w: 860, h: 900, ww: 1.9, m: stand(KA, 0.4) });

      // THE PAGE'S OTHER WORDS round the ring: the room's name and its line by
      // the way in, how it goes here and why a campfire on the right, and whose
      // words on the left beside the rack.
      var NA = -0.22 * Math.PI, HA = -0.48 * Math.PI, YA = -0.76 * Math.PI, CA = 0.44 * Math.PI;
      trestle(NA, 1.6); trestle(HA, 1.6); trestle(YA, 1.5); trestle(CA, 1.4);
      var head = kit.lift(page, '.cf-head', { drop: '.cf-head__art', w: 760, ww: 1.6, m: stand(NA, 1.05) });
      kit.lift(page, '.lede', { w: 760, ww: 1.6, m: stand(NA, 0.4) });
      var norms = kit.lift(page, '.cf-part', { n: 0, w: 760, h: 760, ww: 1.6, m: stand(HA, 0.4) });
      var why = kit.lift(page, '.cf-part', { n: 3, w: 760, ww: 1.5, m: stand(YA, 0.4) });
      var whose = kit.lift(page, '.cf-part', { n: 4, w: 760, ww: 1.4, m: stand(CA, 0.4) });

      kit.wire(page, 'rack.js');

      function stop(name, a, r, pitch, more) {
        var p = on(a, r), o = { name: name, x: p.x, z: p.z, yaw: facing(a), pitch: pitch || 0.05 };
        for (var key in more) o[key] = more[key];
        return o;
      }
      return {
        start: { x: CX, z: CZ + RC + 0.6, yaw: 0 },
        bounds: { areas: [
          { x: [CX - 4.4, CX + 4.4], z: [CZ - 4.4, CZ + 4.4] },
          { x: [CX - 0.6, CX + 0.6], z: [CZ - 4.4, CZ + RC + 0.8] }
        ] },
        stops: [
          { name: 'at the edge of the clearing, come in out of the trees: the fire in the middle and the ring of logs round it', x: CX, z: CZ + RC + 0.6, yaw: 0, pitch: 0.02 },
          { name: 'on a log by the fire, the only light there is, and nothing moving in it', x: CX + 0.6, z: CZ + 2.1, yaw: 0.28, pitch: -0.22 },
          stop('across the fire: the screen the page calls the fire, giving off nothing until somebody presses it', SA, 3.0, 0.05, { frame: screen.el }),
          stop('at the rack of fires round to the left, borrowed from Swaying Sweetgrass’s pit', KA, 3.1, -0.02, { frame: rack.el }),
          stop('at the trestle on the right: how it goes here', HA, 3.1, 0.0, { frame: norms.el }),
          stop('further round: why a campfire', YA, 3.1, 0.0, { frame: why.el }),
          stop('on the left: whose words these are', CA, 3.1, 0.0, { frame: whose.el }),
          stop('by the way in: the room’s name and its line', NA, 3.1, 0.05, { frame: head.el }),
          { name: 'looking up past the trunks into the dark, where the smoke goes', x: CX + 1.4, z: CZ + 1.4, yaw: 0.8, pitch: 0.9 },
          stop('at the board by the way in, with the room’s own page on it, its call and its radio', PA, 3.0, 0.05, { page: kit.page, frame: page })
        ]
      };
    }
  };
})();

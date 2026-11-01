/* =============================================================================
   Rescue A Dog, walked into on Cel Street. Ryan's ask, 2026-10-31: back on the
   street, working down it a room at a time.

   IT IS RESCUE A DOG'S WORLD AND NOBODY ELSE'S (§88): the park the morning
   after snow. THE LIGHT IS A LOW WINTER SUN ON SNOW, AND THE SHADOWS ARE BLUE:
   the sun stands just over the far edge of the park and everything throws a
   long shadow towards you, and a shadow on snow is lit only by the sky, so the
   only light in it here is the sky's blue. The ground is brighter than the sky.
   No torch, no eyeshine and no night anywhere, which is what keeps it off
   Rescue A Cat next door; the shadows are cold and blue, never warm, which is
   what keeps it off the Hermitage's low sun; and everything casts something,
   which is what keeps it off the 404's fog.

   THE PLACES ARE THE PAGE'S OWN: the bench off its sign, the bus shelter and
   the frozen pond out of its words, and the red lead dropped in the snow by
   the gate with prints going off from it, which is the room's job marker.
   THERE IS NO DOG IN THE SCENE. The dogs are the shelter's, read when the page
   opens, and the page is on the noticeboard by the path, where rescuing and
   adopting work as they do on the page (shelter.js talks to the CB, so it is
   never wired here, and no card of the shelter's is lifted). The kennels are
   drawn with their doors open and nothing on them: no name, no number, and
   nothing about who rescued anybody. You follow the prints.

   NOTHING MOVES. Every colour is one Rescue A Dog declares, by name. It keeps
   nothing, sends nothing and fetches nothing; its page arrives through Cel
   Street's screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['rescue-a-dog.html'] = {
    name: 'Rescue A Dog',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var PI = Math.PI;
      // Where to stand to face something whose front looks along its own +z.
      var front = function (x, z, ry, d) { return { x: x + Math.sin(ry) * d, z: z + Math.cos(ry) * d, yaw: ry }; };

      // THE MORNING: the sky paler than the snow, and the sun low over the far
      // edge of the park on the left. The sky's blue is all that lights a
      // shadow, so every shadow on the snow comes out blue.
      kit.scene.background = kit.col('--rad-sky');
      kit.scene.add(new T.HemisphereLight(kit.col('--rad-shade'), kit.col('--rad-snow'), 1.5));
      var mid = new T.Vector3(0, 0, -11);
      var toSun = new T.Vector3(-0.74, 0.17, -0.65).normalize();
      var sun = new T.DirectionalLight(kit.col('--rad-sun'), 2.6);
      sun.position.copy(mid).addScaledVector(toSun, 60);
      sun.target.position.copy(mid);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      var sc = sun.shadow.camera;
      sc.left = -19; sc.right = 19; sc.top = 19; sc.bottom = -19; sc.near = 1; sc.far = 130;
      sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
      kit.scene.add(sun, sun.target);
      var disc = mid.clone().addScaledVector(toSun, 150);
      var face = Math.atan2(mid.x - disc.x, mid.z - disc.z);
      kit.flat(new T.CircleGeometry(5.5, 40), at(disc.x, disc.y, disc.z, face), '--rad-sun');

      // THE PARK UNDER SNOW, to a far line of bare trees all round, and a few soft
      // drifts on it.
      box(170, 0.1, 170, at(0, -0.05, -40), '--rad-snow', false, false);
      for (var t = 0; t < 96; t++) {
        var crown = new T.SphereGeometry(1, 14, 8), th = 2.4 + ((t * 7) % 5) * 0.5;
        var ang = t / 96 * 2 * PI, far = 62 + (t % 4) * 2.2;
        crown.scale(2.4 + (t % 3) * 0.6, th, 1.6);
        kit.piece(crown, at(Math.sin(ang) * far, 0, -12 + Math.cos(ang) * far, ang), '--rad-track', false, false);
      }
      [[-6, -3, 2.4, 1.3], [7.5, -18, 3.0, 1.6], [-10, -19, 2.6, 1.2], [9.5, -1.8, 1.8, 1.0]].forEach(function (d) {
        var g = new T.SphereGeometry(1, 18, 8); g.scale(d[2], 0.32, d[3]);
        kit.piece(g, at(d[0], 0, d[1]), '--rad-snow', 0.015);
      });

      // THE GATE you came in by and the railings either side of it, the gate
      // swung open into the park, snow on the pillars.
      [-1, 1].forEach(function (s) {
        box(0.36, 1.45, 0.36, at(s * 1.05, 0.725, 1.2), '--rad-dim');
        box(0.42, 0.12, 0.42, at(s * 1.05, 1.51, 1.2), '--rad-snow', 0.012);
        box(11, 0.05, 0.05, at(s * 6.6, 0.42, 1.2), '--rad-ink', false);
        box(11, 0.05, 0.05, at(s * 6.6, 0.92, 1.2), '--rad-ink', false);
        for (var p = 0; p < 8; p++) box(0.06, 1.0, 0.06, at(s * (2.0 + p * 1.45), 0.5, 1.2), '--rad-ink', false);
      });
      var gate = at(1.1, 0, 0.72, PI / 2);
      box(1.0, 0.05, 0.05, M(gate, at(0, 0.24, 0)), '--rad-ink', false);
      box(1.0, 0.05, 0.05, M(gate, at(0, 1.0, 0)), '--rad-ink', false);
      for (var b = -0.45; b < 0.5; b += 0.15) box(0.035, 0.8, 0.035, M(gate, at(b, 0.62, 0)), '--rad-ink', false);

      // THE RED LEAD, dropped in the snow just inside the gate, with its clip.
      var lead = new T.CatmullRomCurve3([
        new T.Vector3(1.9, 0.03, -0.55), new T.Vector3(2.3, 0.03, -0.9), new T.Vector3(1.9, 0.03, -1.3),
        new T.Vector3(2.5, 0.03, -1.55), new T.Vector3(2.9, 0.03, -1.2), new T.Vector3(2.7, 0.03, -0.8)
      ]);
      kit.piece(new T.TubeGeometry(lead, 40, 0.03, 6, false), at(0, 0, 0), '--rad-link', false, false);
      box(0.1, 0.05, 0.06, at(1.88, 0.04, -0.5, 0.4), '--rad-dim', false, false);

      // THE PRINTS, going off from the lead across the park: past the bench,
      // under the bus shelter, round the pond and away towards the trees.
      var trail = new T.CatmullRomCurve3([
        new T.Vector3(2.0, 0, -1.8), new T.Vector3(0.6, 0, -3.8), new T.Vector3(-1.8, 0, -5.8),
        new T.Vector3(-4.6, 0, -8.6), new T.Vector3(-7.4, 0, -10.8), new T.Vector3(-5.2, 0, -13.2),
        new T.Vector3(-1.4, 0, -14.4), new T.Vector3(0.4, 0, -17.6), new T.Vector3(-0.8, 0, -21.5),
        new T.Vector3(-2.4, 0, -25)
      ]);
      var steps = Math.floor(trail.getLength() / 0.42);
      var pts = trail.getSpacedPoints(steps);
      for (var i = 1; i < pts.length; i++) {
        var a = pts[i - 1], c = pts[i], hx = c.x - a.x, hz = c.z - a.z;
        var ry = Math.atan2(-hx, -hz), side = i % 2 ? 0.1 : -0.1;
        var px = c.x + Math.cos(ry) * side, pz = c.z - Math.sin(ry) * side;
        var paw = at(px, 0.008, pz, ry, -PI / 2);
        var pad = new T.CircleGeometry(0.06, 10); pad.scale(1, 1.2, 1);
        kit.piece(pad, paw, '--rad-track', false, false);
        [[-0.06, 0.08], [-0.02, 0.11], [0.02, 0.11], [0.06, 0.08]].forEach(function (o) {
          kit.piece(new T.CircleGeometry(0.022, 8), M(paw, at(o[0], o[1], 0)), '--rad-track', false, false);
        });
      }

      // THE BENCH off the room's sign, facing the pond, snow on its seat and
      // along its back, its shadow lying long and blue across the snow.
      var bench = at(-3.0, 0, -6.6, Math.atan2(7.6, -8.6));
      box(1.9, 0.07, 0.48, M(bench, at(0, 0.46, 0)), '--rad-ink');
      box(1.9, 0.07, 0.06, M(bench, at(0, 0.76, -0.22)), '--rad-ink');
      box(1.9, 0.07, 0.06, M(bench, at(0, 0.92, -0.22)), '--rad-ink');
      [-0.8, 0.8].forEach(function (x) {
        box(0.07, 0.46, 0.07, M(bench, at(x, 0.23, 0.18)), '--rad-ink', false);
        box(0.07, 0.95, 0.07, M(bench, at(x, 0.47, -0.22)), '--rad-ink', false);
      });
      box(1.8, 0.06, 0.4, M(bench, at(0, 0.52, 0.02)), '--rad-snow', 0.01);
      box(1.85, 0.05, 0.09, M(bench, at(0, 0.98, -0.22)), '--rad-snow', 0.01);

      // THE BUS SHELTER on the left, facing into the park: a glass back and
      // side, a bench inside, snow piled on the roof, and the stop's round
      // plate on its post, with nothing written on it.
      var shel = at(-9.0, 0, -11.0, PI / 2);
      box(3.0, 2.1, 0.05, M(shel, at(0, 1.15, -0.6)), '--rad-shade', 0.015);
      box(0.05, 2.1, 1.2, M(shel, at(-1.5, 1.15, 0)), '--rad-shade', 0.015);
      [[-1.5, -0.6], [1.5, -0.6], [-1.5, 0.6], [1.5, 0.6]].forEach(function (q) {
        box(0.08, 2.3, 0.08, M(shel, at(q[0], 1.15, q[1])), '--rad-ink', false);
      });
      box(3.3, 0.1, 1.5, M(shel, at(0, 2.35, 0)), '--rad-dim');
      box(3.2, 0.14, 1.4, M(shel, at(0, 2.47, -0.02)), '--rad-snow', 0.012);
      box(2.4, 0.06, 0.35, M(shel, at(0, 0.48, -0.36)), '--rad-ink');
      [-1.0, 1.0].forEach(function (x) { box(0.06, 0.48, 0.06, M(shel, at(x, 0.24, -0.36)), '--rad-ink', false); });
      cyl(0.04, 0.04, 2.6, M(shel, at(2.1, 1.3, 0.8)), '--rad-ink', false, 8);
      cyl(0.3, 0.3, 0.04, M(shel, at(2.1, 2.55, 0.8, 0, PI / 2)), '--rad-link', 0.012, 24);

      // THE POND, frozen, with snow banked round its edge and reeds through it.
      var POND = { x: 4.6, z: -15.0 };
      var ice = new T.CylinderGeometry(3.6, 3.6, 0.04, 48); ice.scale(1, 1, 0.62);
      kit.piece(ice, at(POND.x, 0.02, POND.z), '--rad-sky', false, false);
      var bank = new T.TorusGeometry(3.65, 0.2, 6, 48); bank.rotateX(-PI / 2); bank.scale(1, 1, 0.62);
      kit.piece(bank, at(POND.x, 0.02, POND.z), '--rad-snow', 0.012);
      [[7.6, -14.0, 0.2], [7.9, -14.4, -0.15], [8.1, -15.4, 0.1], [1.5, -16.0, -0.2], [1.3, -15.5, 0.12]].forEach(function (r) {
        cyl(0.018, 0.018, 1.0, at(r[0], 0.5, r[1], 0, 0, r[2]), '--rad-stripe', false, 5);
      });

      // BARE TREES about the park, each throwing its long blue shadow.
      [[-11.5, -4.5, 3.4], [-6.0, -20.5, 4.0], [2.6, -23.0, 3.6], [11.0, -20.0, 4.2], [-13.5, -15.5, 3.8], [10.5, -8.5, 3.2]].forEach(function (tr, k) {
        cyl(0.13, 0.22, tr[2], at(tr[0], tr[2] / 2, tr[1]), '--rad-stripe', 0.012, 8);
        [[0.55, 0.6, 0.0], [0.7, -0.55, 1.4], [0.8, 0.5, 2.6], [0.92, -0.45, 4.0]].forEach(function (br) {
          var h = tr[2] * br[0], ry = br[2] + k, rz = br[1], L = tr[2] * 0.42;
          var dx = -Math.sin(rz) * Math.cos(ry), dy = Math.cos(rz), dz = Math.sin(rz) * Math.sin(ry);
          cyl(0.035, 0.08, L, at(tr[0] + dx * L / 2, h + dy * L / 2, tr[1] + dz * L / 2, ry, 0, rz), '--rad-stripe', false, 6);
        });
      });

      // THE KENNELS along the right, facing into the park, their doors open.
      // Nothing is written on them and nothing is drawn inside.
      var tri = new T.Shape();
      tri.moveTo(-0.6, 0); tri.lineTo(0.6, 0); tri.lineTo(0, 0.42); tri.lineTo(-0.6, 0);
      var gable = new T.ExtrudeGeometry(tri, { depth: 1.36, bevelEnabled: false });
      gable.translate(0, 0, -0.68);
      [-6.2, -8.4, -10.6, -12.8].forEach(function (z) {
        var k = at(9.0, 0, z, -PI / 2);
        box(1.2, 0.95, 1.36, M(k, at(0, 0.475, 0)), '--rad-link');
        kit.piece(gable, M(k, at(0, 0.95, 0)), '--rad-link', 0.015);
        box(0.52, 0.64, 0.03, M(k, at(0, 0.34, 0.68)), '--rad-ink', false, false);
        [-1, 1].forEach(function (s) {
          box(0.78, 0.07, 1.5, M(k, at(s * 0.32, 1.17, 0, 0, 0, -s * 0.61)), '--rad-stripe');
          box(0.74, 0.07, 1.46, M(k, at(s * 0.34, 1.235, 0, 0, 0, -s * 0.61)), '--rad-snow', 0.01);
        });
      });

      // THE NOTICEBOARD by the path, with the room's own page on it: where the
      // dogs are, and where rescuing and adopting work.
      var NB = { x: 2.6, z: -4.6, ry: Math.atan2(-2.6, 4.1) };
      var nb = at(NB.x, 0, NB.z, NB.ry);
      [-1, 1].forEach(function (s) { box(0.13, 2.7, 0.13, M(nb, at(s * 1.42, 1.35, -0.08)), '--rad-stripe'); });
      box(2.95, 1.98, 0.08, M(nb, at(0, 1.56, -0.08)), '--rad-stripe', 0.015);
      box(3.3, 0.08, 0.55, M(nb, at(0, 2.68, -0.02, 0, 0.22)), '--rad-stripe');
      box(3.2, 0.07, 0.5, M(nb, at(0, 2.74, -0.02, 0, 0.22)), '--rad-snow', 0.01);
      var pw = 1180, ph = 800, ww = 2.66;
      var page = kit.screen(pw, ph, ww, M(nb, at(0, 1.56, -0.02)), 'Rescue A Dog’s own page, on the noticeboard by the path');

      // THE ROOM'S SIGN, on posts just inside the gate, facing into the park,
      // and HOW RESCUING AND ADOPTING WORK, on a board by the kennels. Both
      // are the page's own words; nothing the shelter reads is lifted.
      var SG = { x: -2.0, z: 0.55, ry: PI };
      [-1, 1].forEach(function (s) { box(0.1, 2.0, 0.1, at(SG.x + s * 0.88, 1.0, SG.z + 0.05), '--rad-stripe'); });
      var sign = kit.lift(page, '.rad-head', { w: 720, ww: 1.7, m: at(SG.x, 0.85, SG.z, SG.ry) });
      var HB = { x: 6.0, z: -3.2, ry: Math.atan2(-6.0, 2.7) };
      var hb = at(HB.x, 0, HB.z, HB.ry);
      [-1, 1].forEach(function (s) { box(0.12, 2.9, 0.12, M(hb, at(s * 0.86, 1.45, -0.06)), '--rad-stripe'); });
      box(1.9, 0.08, 0.45, M(hb, at(0, 2.88, -0.02, 0, 0.22)), '--rad-stripe');
      box(1.82, 0.07, 0.4, M(hb, at(0, 2.94, -0.02, 0, 0.22)), '--rad-snow', 0.01);
      var how = kit.lift(page, '.rad-part', { n: 4, w: 640, h: 760, ww: 1.6, m: M(hb, at(0, 0.6, 0)) });

      var stops = [
        { where: 'just inside the gate, the park white and the sun low across it', name: 'just inside the gate', x: 0, z: -0.6, yaw: 0, pitch: 0.04 },
        { where: 'at the red lead dropped in the snow by the gate, the prints going off from it', name: 'at the red lead', x: 1.0, z: 0.2, yaw: Math.atan2(-1.4, 1.2), pitch: -0.55 }
      ];
      var at1 = front(NB.x, NB.z, NB.ry, 2.7);
      stops.push({ where: 'at the noticeboard by the path, with the room’s own page on it, where the dogs are', name: 'at the noticeboard', x: at1.x, z: at1.z, yaw: at1.yaw, pitch: 0.05, page: kit.page, frame: page });
      var at2 = front(SG.x, SG.z, SG.ry, 2.4);
      stops.push({ where: 'looking back at the room’s sign, just inside the gate', name: 'at the sign', x: at2.x, z: at2.z, yaw: at2.yaw, pitch: 0.12, frame: sign.el });
      var at3 = front(HB.x, HB.z, HB.ry, 2.9);
      stops.push({ where: 'at the board by the kennels, with how rescuing and adopting work', name: 'at the board by the kennels', x: at3.x, z: at3.z, yaw: at3.yaw, pitch: 0.1, frame: how.el });
      stops.push(
        { where: 'by the bench, its shadow long and blue across the snow', name: 'by the bench', x: -0.4, z: -3.0, yaw: Math.atan2(2.6, 3.6), pitch: -0.2 },
        { where: 'under the bus shelter, following the prints', name: 'under the bus shelter', x: -8.7, z: -11.0, yaw: Math.atan2(-3.4, 2.2), pitch: -0.14 },
        { where: 'at the frozen pond, snow banked round its edge', name: 'at the frozen pond', x: 1.0, z: -11.4, yaw: Math.atan2(-3.6, 3.6), pitch: -0.12 },
        { where: 'at the kennels, their doors open on the park', name: 'at the kennels', x: 4.0, z: -9.5, yaw: -PI / 2, pitch: -0.08 },
        { where: 'out where the prints go, towards the trees, the sun in your eyes', name: 'out towards the trees', x: -1.0, z: -19.0, yaw: Math.atan2(4, 3.4), pitch: 0.06 }
      );

      return {
        start: { x: 0, z: -0.6, yaw: 0 },
        bounds: { x: [-12.5, 11.0], z: [-25, 0.4] },
        stops: stops
      };
    }
  };
})();

/* =============================================================================
   The Music Room, walked into on Cel Street, through the door by the
   phonograph in the Faery Yurt. Ryan's ask, 2026-10-31: the yurt's doorways
   opening onto their rooms.

   IT IS HELEN EDGAR'S ROOM AND HER WORLD (§115), and this is OURS: a drawing
   of her music room for Cel Street, in the colours her room wears (the
   Reading Room's, §114, at her ask) and nothing else, which changes nothing on
   her page and is hers to keep or send back. The Reading Room's house one door
   along, kept off it by the LIGHT: no fire here, only candles on standing
   candelabra and the tall pointed window open on the night, with a crescent
   moon and bare branches in it, so the room is darkest at the ceiling and at
   the window. The phonograph stands in front of the window, and a chair in
   the dark faces it.

   ROUND 2 (Ryan's ask, 2026-11-04) drew more of what her page already has in
   it, and nothing it does not: the chandelier of seven candles over the rug,
   the candles in brass sconces along the far wall with a raven at each end of
   the row and a third raven on the sill looking in, the cello leaning in one
   corner and the harp in the other, the rug with its brass ring, a cobweb in
   the corner, the window's tracery as she drew it, the phonograph's horn as a
   flower of petals with a crank and records leaning on it, and her record
   case's pointed arches round the shelves. Three places to stand were added:
   under the chandelier, by the cello and by the harp.

   THE PHONOGRAPH'S DECK AND HER THREE SHELVES OF RECORDS ARE HER PAGE'S OWN,
   lifted off it by the kit, and rack.js, the page's own script, plays them
   here as it does there; nothing reaches YouTube until a press. Each shelf
   holds every record on it, and scrolls when there are more than fit.

   NOTHING MOVES: the record does not turn here, the candles stand still.
   Every colour is one her room declares, by name. It keeps nothing, sends
   nothing and fetches nothing; her page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['faery-music-room.html'] = {
    name: 'The Music Room',
    from: 'faery-yurt.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, W = 10, D = 11, H = 7.2, back = -D;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var UP = new T.Vector3(0, 1, 0);
      // A rod from one point to another in some frame m: a candle arm, a
      // string, a rib of the horn.
      function rod(m, a, b, r, ink, seg) {
        var d = new T.Vector3().subVectors(b, a), mid = a.clone().add(b).multiplyScalar(0.5);
        var g = new T.CylinderGeometry(r, r, d.length(), seg || 5);
        g.applyQuaternion(new T.Quaternion().setFromUnitVectors(UP, d.normalize()));
        kit.piece(g, M(m, at(mid.x, mid.y, mid.z)), ink, false);
      }
      function v(x, y, z) { return new T.Vector3(x, y, z); }
      // A candle as her page draws them: cream wax, a brass drip pan, and a
      // flame that is lit and still.
      function candle(m, h, r) {
        r = r || 0.024;
        kit.cyl(r * 2, r * 1.6, 0.016, M(m, at(0, 0.008, 0)), '--rdr-brass', false, 10);
        kit.cyl(r, r, h, M(m, at(0, 0.016 + h / 2, 0)), '--rdr-ink', false, 8);
        var flame = new T.ConeGeometry(r * 0.85, r * 3, 6); flame.translate(0, r * 1.5, 0);
        kit.flat(flame, M(m, at(0, 0.02 + h, 0)), '--rdr-flame-2');
      }
      // A raven, perched, looking into the room (+z): her page's ravens, in
      // the darkest colour her room has.
      function raven(m) {
        var body = new T.SphereGeometry(0.11, 10, 8); body.scale(0.85, 0.9, 1.35);
        kit.piece(body, M(m, at(0, 0.1, 0)), '--rdr-stone', 0.008);
        var tail = new T.BoxGeometry(0.1, 0.02, 0.2);
        kit.piece(tail, M(m, at(0, 0.06, -0.2, 0, 0.45)), '--rdr-stone', false);
        kit.piece(new T.SphereGeometry(0.065, 10, 8), M(m, at(0, 0.21, 0.11)), '--rdr-stone', 0.006);
        var beak = new T.ConeGeometry(0.022, 0.09, 6); beak.rotateX(Math.PI / 2);
        kit.piece(beak, M(m, at(0, 0.2, 0.2)), '--rdr-panel', false);
        [-1, 1].forEach(function (s) {
          kit.flat(new T.SphereGeometry(0.009, 5, 4), M(m, at(s * 0.04, 0.225, 0.155)), '--rdr-brass');
          kit.cyl(0.006, 0.006, 0.05, M(m, at(s * 0.03, 0.02, 0.02)), '--rdr-panel', false, 4);
        });
      }

      // CANDLES ONLY, and the night at the window.
      kit.scene.background = kit.col('--rdr-stone');
      kit.scene.add(new T.HemisphereLight(kit.col('--rdr-panel'), kit.col('--rdr-stone'), 1.2));

      // THE ROOM.
      box(W, 0.1, D + 0.4, at(0, -0.05, -D / 2), '--rdr-timber', false, false);
      // Boards running the length of the room, each joint a dark line.
      for (var bx = -W / 2 + 0.32; bx < W / 2; bx += 0.32) box(0.014, 0.004, D, at(bx, 0.002, -D / 2), '--rdr-stone', false, false);
      box(0.3, H, D, at(-W / 2 - 0.15, H / 2, -D / 2), '--rdr-wall');
      box(0.3, H, D, at(W / 2 + 0.15, H / 2, -D / 2), '--rdr-wall');
      box(W + 0.6, H, 0.3, at(0, H / 2, 0.15), '--rdr-wall');
      box(W + 0.6, 0.2, D + 0.6, at(0, H + 0.1, -D / 2), '--rdr-stone', false, false);
      // Beams across the ceiling, in the dark the candles never reach.
      for (var bz = -0.9; bz > back; bz -= 1.8) box(W, 0.26, 0.22, at(0, H - 0.13, bz), '--rdr-timber', false, false);
      [[-W / 2 + 0.02, -D / 2, LEFT, D], [W / 2 - 0.02, -D / 2, RIGHT, D], [0, -0.02, Math.PI, W]].forEach(function (w) {
        box(w[3], 0.2, 0.05, at(w[0], 0.1, w[1], w[2]), '--rdr-timber', false);
        // A dado of timber round the walls, panelled below it.
        box(w[3], 0.06, 0.06, at(w[0], 1.05, w[1], w[2]), '--rdr-timber', false);
        for (var p = -w[3] / 2 + 0.55; p < w[3] / 2; p += 1.1) box(0.04, 0.82, 0.03, M(at(w[0], 0.62, w[1], w[2]), at(p, 0, 0)), '--rdr-timber', false, false);
      });
      // The door you came in by, in its frame, with a brass knob.
      box(1.3, 2.4, 0.1, at(0, 1.2, -0.05), '--rdr-timber');
      [-1, 1].forEach(function (s) { box(0.12, 2.6, 0.14, at(s * 0.71, 1.3, -0.06), '--rdr-timber'); });
      box(1.54, 0.14, 0.14, at(0, 2.6, -0.06), '--rdr-timber');
      [[0.75, 0.5], [1.75, 0.6]].forEach(function (pn) { box(0.9, pn[1], 0.02, at(0, pn[0], -0.11), '--rdr-panel', false, false); });
      kit.piece(new T.SphereGeometry(0.04, 8, 6), at(0.45, 1.1, -0.13), '--rdr-brass', false);

      // THE FAR WALL AND ITS TALL POINTED WINDOW, open on the night: the wall
      // in pieces round the opening, stone tracery, the night behind, a
      // crescent moon and bare branches against it.
      var ww = 2.6, wh = 4.2, wy = 0.9, rise = 1.5;
      box((W - ww) / 2 + 0.3, H, 0.3, at(-(W + ww) / 4 - 0.075, H / 2, back - 0.15), '--rdr-wall');
      box((W - ww) / 2 + 0.3, H, 0.3, at((W + ww) / 4 + 0.075, H / 2, back - 0.15), '--rdr-wall');
      box(ww, wy, 0.3, at(0, wy / 2, back - 0.15), '--rdr-wall');
      box(ww, H - wy - wh - rise + 0.2, 0.3, at(0, (wy + wh + rise + H) / 2, back - 0.15), '--rdr-wall');
      // The two triangles beside the pointed top, filled with wall.
      [-1, 1].forEach(function (s) {
        var tri = new T.Shape();
        tri.moveTo(s * ww / 2, 0); tri.lineTo(s * ww / 2, rise + 0.25); tri.lineTo(0, rise + 0.25); tri.lineTo(0, rise);
        tri.lineTo(s * ww / 2, 0);
        var tg = new T.ExtrudeGeometry(tri, { depth: 0.3, bevelEnabled: false });
        kit.piece(tg, at(0, wy + wh, back - 0.3), '--rdr-wall', false);
      });
      // The night, a sheet behind the opening, and her crescent moon in it.
      kit.flat(new T.PlaneGeometry(ww + 1, wh + rise + 1), at(0, wy + (wh + rise) / 2, back - 0.6), '--rdr-panel');
      kit.flat(new T.CircleGeometry(0.34, 24), at(0.55, wy + wh + 0.2, back - 0.55), '--rdr-flame-2');
      kit.flat(new T.CircleGeometry(0.3, 24), at(0.68, wy + wh + 0.27, back - 0.54), '--rdr-panel');
      // Bare branches across it, from one side, with twigs off them.
      [[-1.6, 1.4, 0.5, 2.2, 0.05], [-0.7, 2.6, 0.9, 1.4, 0.035], [-1.2, 3.6, 0.3, 1.8, 0.04], [0.1, 3.0, 1.2, 0.9, 0.025], [-0.2, 4.4, 0.7, 1.2, 0.03],
       [-0.55, 1.9, 1.5, 0.5, 0.02], [0.3, 2.35, -0.4, 0.6, 0.018], [-0.9, 3.95, 1.3, 0.55, 0.018], [0.45, 4.0, 0.2, 0.5, 0.016]].forEach(function (b) {
        box(b[3], b[4], 0.02, at(b[0], wy + b[1], back - 0.5, 0, 0, b[2]), '--rdr-stone', false);
      });
      // Stone tracery as she drew it: the frame and the mullion, two
      // transoms, and an inner pointed arch under the head.
      [-1, 1].forEach(function (s) { box(0.16, wh, 0.36, at(s * ww / 2, wy + wh / 2, back - 0.1), '--rdr-stone'); });
      box(0.1, wh, 0.2, at(0, wy + wh / 2, back - 0.2), '--rdr-stone', false);
      [2.0, 3.2].forEach(function (ty) { box(ww, 0.08, 0.2, at(0, wy + ty, back - 0.2), '--rdr-stone', false); });
      box(ww + 0.3, 0.16, 0.5, at(0, wy - 0.08, back + 0.05), '--rdr-stone');
      var arm = Math.hypot(ww / 2, rise);
      [-1, 1].forEach(function (s) {
        box(arm + 0.1, 0.16, 0.36, at(s * ww / 4, wy + wh + rise / 2, back - 0.1, 0, 0, -s * Math.atan2(rise, ww / 2)), '--rdr-stone');
        var inner = Math.hypot(0.5, 0.75);
        box(inner, 0.07, 0.2, at(s * 0.25, wy + wh + 0.4, back - 0.2, 0, 0, -s * Math.atan2(0.75, 0.5)), '--rdr-stone', false);
        box(0.07, 0.75, 0.2, at(s * 0.5, wy + wh - 0.35, back - 0.2), '--rdr-stone', false);
      });
      // A raven on the sill, looking in at the room.
      raven(at(-0.62, wy + 0.01, back + 0.1));
      // A cobweb in the top corner, the one thing up there the candles touch.
      var cw = at(-W / 2 + 0.03, H - 0.25, back + 0.03);
      [0.2, 0.55, 0.9, 1.25].forEach(function (a) { rod(cw, v(0, 0, 0), v(Math.sin(a) * 0.9, -Math.cos(a) * 0.9, 0), 0.004, '--rdr-ink-2', 3); });
      [0.3, 0.55, 0.8].forEach(function (r0) {
        for (var k = 0; k < 3; k++) {
          var a0 = 0.2 + k * 0.35, a1 = a0 + 0.35;
          rod(cw, v(Math.sin(a0) * r0, -Math.cos(a0) * r0, 0), v(Math.sin(a1) * r0, -Math.cos(a1) * r0, 0), 0.003, '--rdr-ink-2', 3);
        }
      });

      // THE SCONCES along the far wall, two either side of the window, a candle
      // in each, and a raven on a bracket at each end of the row.
      [-3.3, -2.05, 2.05, 3.3].forEach(function (x) {
        var sc = at(x, 3.4, back + 0.01);
        box(0.09, 0.26, 0.02, M(sc, at(0, 0.02, 0.01)), '--rdr-brass', false);
        kit.piece(new T.SphereGeometry(0.03, 6, 4), M(sc, at(0, 0.17, 0.02)), '--rdr-brass', false);
        rod(sc, v(0, -0.12, 0.02), v(0, -0.06, 0.24), 0.018, '--rdr-brass', 5);
        kit.cyl(0.07, 0.05, 0.03, M(sc, at(0, -0.05, 0.24)), '--rdr-brass', false, 10);
        candle(M(sc, at(0, -0.035, 0.24)), 0.24, 0.034);
      });
      [-1, 1].forEach(function (s) {
        var br = at(s * 4.25, 3.3, back + 0.01);
        box(0.3, 0.03, 0.26, M(br, at(0, 0, 0.13)), '--rdr-brass', false);
        box(0.03, 0.18, 0.03, M(br, at(0, -0.1, 0.03)), '--rdr-brass', false);
        raven(M(br, at(0, 0.015, 0.12)));
      });

      // THE PHONOGRAPH in front of the window: a cabinet panelled in her
      // timber with a crank at its side, the turntable with a record on it,
      // the arm, and the horn opening like a flower, its petals brass and
      // flame by turns, a rib along every seam.
      var ph = at(0, 0, back + 2.6);
      box(1.0, 0.82, 0.7, M(ph, at(0, 0.49, 0)), '--rdr-timber');
      box(0.76, 0.5, 0.02, M(ph, at(0, 0.5, 0.36)), '--rdr-panel', false);
      [[-0.44, -0.29], [0.44, -0.29], [-0.44, 0.29], [0.44, 0.29]].forEach(function (f) { kit.cyl(0.05, 0.04, 0.08, M(ph, at(f[0], 0.04, f[1])), '--rdr-timber', false, 8); });
      box(0.72, 0.2, 0.6, M(ph, at(0, 1.0, 0)), '--rdr-leather');
      kit.cyl(0.27, 0.27, 0.02, M(ph, at(0, 1.11, 0)), '--rdr-stone', false, 24);
      kit.cyl(0.07, 0.07, 0.022, M(ph, at(0, 1.12, 0)), '--rdr-ember', false, 12);
      kit.cyl(0.02, 0.02, 0.6, M(ph, at(0.2, 1.33, -0.18, 0, -0.55)), '--rdr-brass', false, 6);
      // The crank, out of the cabinet's side.
      kit.cyl(0.02, 0.02, 0.16, M(ph, at(0.58, 0.62, 0, 0, 0, Math.PI / 2)), '--rdr-brass', false, 6);
      box(0.03, 0.22, 0.03, M(ph, at(0.67, 0.53, 0)), '--rdr-brass', false);
      kit.cyl(0.025, 0.025, 0.1, M(ph, at(0.72, 0.44, 0, 0, 0, Math.PI / 2)), '--rdr-timber', false, 6);
      var horn = M(ph, at(0.32, 1.86, -0.45, 0, -0.85)), PET = 10, HR = 0.55, HH = 0.95;
      for (var pt = 0; pt < PET; pt++) {
        var petal = new T.ConeGeometry(HR, HH, 3, 1, true, pt / PET * Math.PI * 2, Math.PI * 2 / PET);
        kit.piece(petal, horn, pt % 2 ? '--rdr-flame' : '--rdr-brass', false);
        // And its inside, which is what you see looking into the horn: the
        // same petal turned out, so the colours fall in the same places.
        var inside = new T.ConeGeometry(HR * 0.995, HH, 3, 1, true, (PET - 1 - pt) / PET * Math.PI * 2, Math.PI * 2 / PET);
        inside.scale(-1, 1, 1); inside.computeVertexNormals();
        kit.piece(inside, horn, pt % 2 ? '--rdr-flame' : '--rdr-brass', false);
        var th = pt / PET * Math.PI * 2;
        rod(horn, v(0, HH / 2, 0), v(HR * Math.sin(th), -HH / 2, HR * Math.cos(th)), 0.008, '--rdr-timber', 4);
      }
      var lip = new T.TorusGeometry(HR, 0.018, 4, 30); lip.rotateX(Math.PI / 2);
      kit.piece(lip, M(horn, at(0, -HH / 2, 0)), '--rdr-brass', false);
      kit.cyl(0.03, 0.05, 0.36, M(horn, at(0, HH / 2 + 0.16, 0)), '--rdr-brass', false, 8);
      // Two records leaning on the cabinet, in her sleeves' colours, the
      // discs showing at their tops.
      [['--rdr-velvet', -0.32, 0.12], ['--rdr-ember', -0.2, 0.2]].forEach(function (r, n) {
        var lean = M(ph, at(r[1], 0, 0.42 + n * 0.05, r[2], -0.18));
        kit.cyl(0.15, 0.15, 0.008, M(lean, at(0, 0.36, -0.005, 0, Math.PI / 2)), '--rdr-stone', false, 18);
        box(0.32, 0.32, 0.012, M(lean, at(0, 0.16, 0.004)), r[0], 0.004);
      });

      // THE RUG between the chair and the phonograph, velvet with her brass
      // ring woven into it, and the chandelier of seven candles over it.
      var rug = new T.CylinderGeometry(1, 1, 0.02, 40); rug.scale(1.7, 1, 2.3);
      kit.piece(rug, at(0, 0.012, -6.1), '--rdr-velvet', false, false);
      var ring = new T.TorusGeometry(1, 0.018, 4, 48); ring.rotateX(Math.PI / 2); ring.scale(1.35, 1, 1.85);
      kit.piece(ring, at(0, 0.026, -6.1), '--rdr-brass', false, false);
      var chy = 4.2, chz = -6.0, chm = at(0, chy, chz);
      kit.cyl(0.012, 0.012, H - chy - 0.8, at(0, (H + chy + 0.8) / 2, chz), '--rdr-brass', false, 4);
      kit.piece(new T.TorusGeometry(0.05, 0.012, 4, 10), M(chm, at(0, 0.8, 0)), '--rdr-brass', false);
      [0, 1, 2].forEach(function (cn) { var a3 = cn / 3 * Math.PI * 2; rod(chm, v(0, 0.76, 0), v(0.85 * Math.sin(a3), -0.22, 0.85 * Math.cos(a3)), 0.006, '--rdr-brass', 4); });
      kit.piece(new T.SphereGeometry(0.06, 8, 6), M(chm, at(0, -0.08, 0)), '--rdr-brass', false);
      kit.cyl(0.02, 0.004, 0.14, M(chm, at(0, -0.2, 0)), '--rdr-brass', false, 6);
      var crown = new T.TorusGeometry(0.85, 0.022, 5, 40); crown.rotateX(Math.PI / 2);
      kit.piece(crown, M(chm, at(0, -0.22, 0)), '--rdr-brass', false);
      for (var ca = 0; ca < 6; ca++) {
        var aa = ca / 6 * Math.PI * 2 + Math.PI / 6, cx = 0.85 * Math.sin(aa), cz = 0.85 * Math.cos(aa);
        rod(chm, v(0, -0.08, 0), v(cx * 0.95, -0.22, cz * 0.95), 0.014, '--rdr-brass', 5);
        candle(M(chm, at(cx, -0.21, cz)), 0.14);
        kit.piece(new T.SphereGeometry(0.02, 6, 4), M(chm, at(0.85 * Math.sin(aa + Math.PI / 6), -0.3, 0.85 * Math.cos(aa + Math.PI / 6))), '--rdr-brass', false);
      }
      candle(M(chm, at(0, -0.03, 0)), 0.16);
      var chl = new T.PointLight(kit.col('--rdr-flame-2'), 2.6, 6.5, 1.6);
      chl.position.set(0, chy - 0.1, chz);
      kit.scene.add(chl);

      // A CHAIR IN THE DARK, facing it: winged, velvet, brass studs along its
      // arms, on four short legs.
      var ch = at(0, 0, back + 6.4, Math.PI);
      box(1.0, 0.3, 0.95, M(ch, at(0, 0.36, 0)), '--rdr-velvet');
      box(0.86, 0.12, 0.84, M(ch, at(0, 0.56, 0.04)), '--rdr-velvet', 0.01);
      box(1.0, 1.1, 0.24, M(ch, at(0, 0.98, -0.38)), '--rdr-velvet');
      [-1, 1].forEach(function (s) {
        box(0.18, 0.5, 0.95, M(ch, at(s * 0.5, 0.58, 0)), '--rdr-velvet');
        box(0.22, 0.6, 0.3, M(ch, at(s * 0.46, 1.28, -0.28, s * 0.35)), '--rdr-velvet');
        for (var st = 0; st < 5; st++) kit.piece(new T.SphereGeometry(0.014, 5, 4), M(ch, at(s * 0.6, 0.6, -0.36 + st * 0.18)), '--rdr-brass', false);
        [-0.38, 0.38].forEach(function (lz) { kit.cyl(0.035, 0.025, 0.21, M(ch, at(s * 0.42, 0.105, lz)), '--rdr-timber', false, 6); });
      });

      // CANDELABRA standing either side, brass with three candles each, and
      // the only lights in the room besides the chandelier.
      [-1, 1].forEach(function (s) {
        var c = at(s * 2.3, 0, back + 2.9);
        kit.cyl(0.25, 0.3, 0.06, M(c, at(0, 0.03, 0)), '--rdr-brass', false, 12);
        [0, 1, 2].forEach(function (f) { var fa = f / 3 * Math.PI * 2; kit.piece(new T.SphereGeometry(0.06, 6, 4), M(c, at(0.24 * Math.sin(fa), 0.03, 0.24 * Math.cos(fa))), '--rdr-brass', false); });
        kit.cyl(0.035, 0.035, 1.6, M(c, at(0, 0.82, 0)), '--rdr-brass', false, 8);
        [0.5, 1.1].forEach(function (ky) { kit.piece(new T.SphereGeometry(0.06, 8, 6), M(c, at(0, ky, 0)), '--rdr-brass', false); });
        rod(c, v(0, 1.45, 0), v(-0.38, 1.62, 0), 0.02, '--rdr-brass', 5);
        rod(c, v(0, 1.45, 0), v(0.38, 1.62, 0), 0.02, '--rdr-brass', 5);
        [-0.38, 0, 0.38].forEach(function (x) { candle(M(c, at(x, x ? 1.62 : 1.64, 0)), x ? 0.24 : 0.3, 0.032); });
        var l = new T.PointLight(kit.col('--rdr-flame-2'), 7, 9, 1.4);
        l.position.set(s * 2.3, 2.0, back + 3.0);
        kit.scene.add(l);
      });

      // THE CELLO, leaning on the left-hand wall in the corner by the window,
      // and THE HARP in the other corner: hers, as her page draws them.
      var ce = at(-4.5, 0, back + 1.05, LEFT, -0.2);
      kit.cyl(0.008, 0.008, 0.16, M(ce, at(0, 0.08, 0)), '--rdr-brass', false, 4);
      [[0.46, 0.3], [0.88, 0.235]].forEach(function (bout) {
        var bg = new T.SphereGeometry(bout[1], 18, 12); bg.scale(1, 1.15, 0.38);
        kit.piece(bg, M(ce, at(0, bout[0], 0)), '--rdr-leather', 0.012);
      });
      box(0.14, 0.12, 0.08, M(ce, at(0, 0.68, 0)), '--rdr-leather', false);
      box(0.05, 0.6, 0.05, M(ce, at(0, 1.38, 0)), '--rdr-timber', false);
      box(0.05, 0.85, 0.02, M(ce, at(0, 1.1, 0.1)), '--rdr-stone', false);
      kit.piece(new T.SphereGeometry(0.045, 8, 6), M(ce, at(0, 1.72, 0)), '--rdr-timber', false);
      box(0.13, 0.05, 0.015, M(ce, at(0, 0.55, 0.115)), '--rdr-brass', false);
      [-0.03, -0.01, 0.01, 0.03].forEach(function (sx) { box(0.004, 1.05, 0.004, M(ce, at(sx, 1.08, 0.125)), '--rdr-brass', false); });
      [-1, 1].forEach(function (s) { box(0.012, 0.16, 0.01, M(ce, at(s * 0.13, 0.58, 0.105, 0, 0, s * 0.15)), '--rdr-stone', false); });
      var hp = at(4.05, 0, back + 1.15, -0.64);
      box(0.6, 0.1, 0.3, M(hp, at(0.02, 0.05, 0)), '--rdr-timber');
      kit.cyl(0.04, 0.045, 1.75, M(hp, at(-0.35, 0.93, 0)), '--rdr-timber', false, 8);
      kit.piece(new T.SphereGeometry(0.06, 8, 6), M(hp, at(-0.35, 1.84, 0)), '--rdr-brass', false);
      var sb = Math.hypot(0.65, 1.33);
      box(0.14, sb, 0.2, at(0.075, 0.785, 0, 0, 0, -Math.atan2(0.65, 1.33), hp), '--rdr-leather');
      rod(hp, v(-0.35, 1.8, 0), v(0.05, 1.78, 0), 0.04, '--rdr-timber', 6);
      rod(hp, v(0.05, 1.78, 0), v(0.42, 1.48, 0), 0.04, '--rdr-timber', 6);
      for (var hs = -0.26; hs < 0.36; hs += 0.06) {
        var foot = 0.12 + (hs + 0.25) / 0.65 * 1.33 + 0.05;
        var head = hs < 0.05 ? 1.8 - (hs + 0.35) / 0.4 * 0.02 : 1.78 - (hs - 0.05) / 0.37 * 0.3;
        if (head - foot > 0.08) box(0.005, head - foot - 0.05, 0.005, M(hp, at(hs, (head + foot) / 2, 0)), '--rdr-brass', false);
      }

      // HER PAGE on the right-hand wall, and the deck and the three shelves of
      // records off it: the deck by the phonograph on the far wall's left, the
      // shelves along the left-hand wall, each in an arch of her record
      // case's timber drawn up to a point.
      var pw = 2.8, phh = pw * 800 / 1180, py = 1.1 + phh / 2;
      var pg = at(W / 2 - 0.02, 0, -5.4, RIGHT);
      box(pw + 0.24, phh + 0.24, 0.08, M(pg, at(0, py, 0)), '--rdr-timber');
      var frame = kit.screen(1180, 800, pw, M(pg, at(0, py, 0.06)), 'Helen Edgar’s Music Room’s own page, on the right-hand wall');
      // The deck stands on a timber shelf on the far wall, on brass brackets.
      box(1.62, 0.06, 0.3, at(-3.3, 0.57, back + 0.15), '--rdr-timber');
      [-0.62, 0.62].forEach(function (bk) { rod(at(-3.3 + bk, 0, back), v(0, 0.3, 0.02), v(0, 0.54, 0.26), 0.014, '--rdr-brass', 4); });
      var deck = kit.lift(frame, '.mus-deck', { w: 560, ww: 1.5, m: at(-3.3, 0.6, back + 0.02) });
      var SHELVES = [
        { n: 0, z: -2.6, words: 'Faery Yurt’s Yarn' },
        { n: 1, z: -5.5, words: 'Strange things will happen' },
        { n: 2, z: -8.4, words: 'Symphrenia Chill' }
      ];
      var stops = [{ name: 'just through the door, in the candlelight', x: 0, z: -1.2, yaw: 0 }];
      stops.push({ name: 'in the chair in the dark, facing the phonograph and the window', x: 0, z: back + 6.4, yaw: 0 });
      stops.push({ name: 'at the edge of the rug beside the chair, looking up at the chandelier', x: 1.25, z: -3.9, yaw: 0.2, pitch: 0.6 });
      stops.push({ name: 'at the phonograph’s deck, with her playlists on it', x: -3.3, z: back + 2.1, yaw: 0, pitch: -0.22, frame: deck.el });
      SHELVES.forEach(function (sh) {
        var g = at(-W / 2 + 0.06, 0, sh.z, LEFT);
        box(1.72, 2.4, 0.02, M(g, at(0, 1.2, -0.02)), '--rdr-stone', false, false);
        [-1, 1].forEach(function (s) {
          box(0.1, 2.4, 0.16, M(g, at(s * 0.86, 1.2, 0.06)), '--rdr-timber');
          box(1.04, 0.1, 0.16, M(g, at(s * 0.43, 2.675, 0.06, 0, 0, -s * Math.atan2(0.55, 0.86))), '--rdr-timber');
        });
        kit.piece(new T.SphereGeometry(0.05, 8, 6), M(g, at(0, 3.0, 0.06)), '--rdr-brass', false);
        box(1.6, 0.12, 0.4, M(g, at(0, 0.06, 0.16)), '--rdr-timber');
        var it = kit.lift(frame, '.mus-rack', { n: sh.n, w: 560, h: 700, ww: 1.5, m: M(g, at(0, 0.14, 0.02)) });
        stops.push({ name: 'at the shelf of records off ' + sh.words, x: -W / 2 + 2.6, z: sh.z, yaw: LEFT, pitch: -0.2, frame: it.el });
      });
      kit.wire(frame, 'rack.js');
      stops.push({ name: 'beside the cello, leaning in the corner past the records', x: -3.55, z: back + 3.6, yaw: 0.34, pitch: -0.1 });
      stops.push({ name: 'beside the harp, in the corner by the window', x: 3.5, z: back + 4.5, yaw: -0.18, pitch: -0.12 });
      stops.push({ name: 'at the window, with the night in it and a raven on the sill', x: 0, z: back + 1.6, yaw: 0, pitch: 0.12 });
      stops.push({ name: 'at the right-hand wall, with her room’s own page on it', x: W / 2 - 2.6, z: -5.4, yaw: RIGHT, page: kit.page, frame: frame });

      return {
        start: { x: 0, z: -1.2, yaw: 0 },
        bounds: { x: [-W / 2 + 1.0, W / 2 - 1.0], z: [back + 1.4, -0.8] },
        stops: stops
      };
    }
  };
})();

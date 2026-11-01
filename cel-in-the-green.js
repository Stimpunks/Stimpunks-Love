/* =============================================================================
   The Green, walked into on Cel Street, through its gate in the fence past the
   last building. Ryan's ask, 2026-11-01: the street's gates.

   IT IS THE ROOM'S OWN WORLD (§98). It has just stopped raining and there is
   no sun, so NOTHING CASTS A SHADOW: no light here throws one, the sky lights
   everything from above at once, and every built thing that is wet holds a
   line of the pale sky along its top edge, the rails, the kerbs, the rims of
   the beds, the edge of the porch roof, the tops of the boards. A wood all
   round, a pond in the middle with the sky lying in it and the rain's rings on
   it, and a wooden boardwalk going round it, level and wide, with a kerb on
   both edges, beds raised to a seat's height along it, a little bridge on the
   right and a rain garden of rushes past it. You come in under the porch roof,
   by the gate in its back wall, where you stayed while it rained.

   THE GARDEN IS THE ONE TO WATCH. It is midday there, the sun coming down
   through leaves, and its shadows are small and hard. If anything here ever
   throws a shadow the sun has come out, and the Green has become the Garden
   with a pond in it.

   NOTHING MOVES AT ANY SETTING: the rings on the pond and the drops on the
   roof's edge are drawn as they lie.

   THE WORDS ARE THE PAGE'S OWN, lifted off it and never retyped: the name and
   its line, the trailhead sign by the porch steps, the trail itself with its
   plan and its way round, walked by the page's own green.js, the beds, the
   porch, after the rain, the house rules, what the Green keeps and whose it
   is. The screen under the porch roof and its racks are lifted too, and play
   as on the page through love-embed.js and rack.js. The room's own page hangs
   on the porch's back wall beside the gate.

   Every colour is one §98 declares, by name. It keeps nothing, sends nothing
   and fetches nothing; its page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['the-green.html'] = {
    name: 'The Green',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var CX = 0, CZ = -12;          // the pond's middle
      var RX = 10, RZ = 8;           // the boardwalk's centre line, round it
      var W = 1.6;                   // the boardwalk's tread
      var DECK = 0.15;               // the boards' top, level all the way round

      // THE LIGHT IS THE SKY'S, and only the sky's. Nothing here is set to throw
      // a shadow; the light from above lights the top of everything and the sky
      // and the wet lawn light the rest.
      kit.scene.background = kit.col('--grn-sky');
      kit.scene.add(new T.HemisphereLight(kit.col('--grn-sky'), kit.col('--grn-lawn'), 1.7));
      var above = new T.DirectionalLight(kit.col('--grn-sheen'), 1.1);
      above.position.set(0.001, 30, 0.001);
      above.castShadow = false;
      kit.scene.add(above, above.target);

      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      function blob(x, y, z, sx, sy, sz, ink, line) {
        var g = new T.SphereGeometry(1, 16, 11); g.scale(sx, sy, sz);
        kit.piece(g, at(x, y, z), ink, line === undefined ? 0.012 : line);
      }
      // THE SKY ALONG A TOP EDGE: a thin pale strip on top of a thing, w long.
      function sheen(w, d, m) { box(w, 0.018, d, m, '--grn-sheen', false); }
      // A point on the boardwalk's line, r further out than its centre line.
      function onLoop(th, r) {
        return { x: CX + (RX + r) * Math.sin(th), z: CZ + (RZ + r) * Math.cos(th) };
      }

      // THE LAWN, wet, out to the wood on every side.
      kit.piece(new T.PlaneGeometry(200, 200), at(0, 0, 0, 0, -Math.PI / 2), '--grn-lawn', false, false);

      // THE POND, with the pale sky lying in it and the rain's rings on it,
      // still. Unlit, because water shows the sky whatever the light is.
      var pond = new T.CircleGeometry(1, 56); pond.scale(RX - 3, RZ - 3, 1);
      kit.flat(pond, M(at(CX, 0.02, CZ), at(0, 0, 0, 0, -Math.PI / 2)), '--grn-pond');
      [[-2.2, -1.4, 2.6, 1.3], [1.8, 0.6, 2.0, 1.0], [-0.4, 2.0, 1.6, 0.7]].forEach(function (p) {
        var g = new T.CircleGeometry(1, 32); g.scale(p[2], p[3], 1);
        kit.flat(g, M(at(CX + p[0], 0.03, CZ + p[1]), at(0, 0, 0, 0, -Math.PI / 2)), '--grn-pond-sky');
      });
      [[-3.4, 1.0, 0.5], [2.6, -1.8, 0.7], [0.4, 0.2, 0.4], [-1.0, -2.6, 0.6], [3.8, 1.2, 0.35]].forEach(function (r) {
        [1, 1.7].forEach(function (k) {
          var g = new T.RingGeometry(r[2] * k, r[2] * k + 0.04, 40);
          kit.flat(g, M(at(CX + r[0], 0.04, CZ + r[1]), at(0, 0, 0, 0, -Math.PI / 2)), '--grn-sheen');
        });
      });

      // THE BOARDWALK, round the pond, level, its tread the same width all the
      // way, laid in short straight lengths, with a kerb along both edges. Where
      // the way from the porch joins it the inner side is whole and the outer
      // kerb stops, and on the right it crosses the little bridge.
      var N = 60;
      for (var i = 0; i < N; i++) {
        var a0 = i / N * Math.PI * 2, a1 = (i + 1) / N * Math.PI * 2, am = (a0 + a1) / 2;
        var p0 = onLoop(a0, 0), p1 = onLoop(a1, 0), pm = onLoop(am, 0);
        var len = Math.hypot(p1.x - p0.x, p1.z - p0.z) + 0.04;
        var ry = Math.atan2(p1.x - p0.x, p1.z - p0.z) - Math.PI / 2;
        var bridge = Math.abs(am - Math.PI / 2) < 0.22;
        var lift = bridge ? 0.25 : 0;
        box(len, 0.12, W, at(pm.x, DECK - 0.06 + lift, pm.z, ry), '--grn-board', 0.01);
        [-1, 1].forEach(function (side) {
          if (side > 0 && Math.abs(am) < 0.13) return;          // the way in from the porch
          var kx = pm.x + Math.sin(am) * side * (W / 2 + 0.05) * (RX + 0) / RX;
          var kz = pm.z + Math.cos(am) * side * (W / 2 + 0.05) * (RZ + 0) / RZ;
          box(len, 0.12, 0.1, at(kx, DECK + 0.06 + lift, kz, ry), '--grn-timber', 0.008);
          sheen(len, 0.1, at(kx, DECK + 0.125 + lift, kz, ry));
          if (bridge) {
            box(len, 0.06, 0.08, at(kx, DECK + 0.95 + lift, kz, ry), '--grn-timber', 0.008);
            sheen(len, 0.08, at(kx, DECK + 0.99 + lift, kz, ry));
            box(0.08, 0.85, 0.08, at(kx, DECK + 0.52 + lift, kz, ry), '--grn-timber', 0.006);
          }
        });
      }
      // The water under the bridge, out to the rain garden, and the rain garden
      // full of rushes and cane, still standing wet.
      kit.flat(new T.PlaneGeometry(4.6, 1.4), M(at(CX + RX + 0.6, 0.025, CZ), at(0, 0, 0, 0, -Math.PI / 2)), '--grn-pond');
      var rg = new T.CircleGeometry(1, 32); rg.scale(2.6, 3.2, 1);
      kit.flat(rg, M(at(CX + RX + 4.6, 0.025, CZ), at(0, 0, 0, 0, -Math.PI / 2)), '--grn-pond-sky');
      for (var r = 0; r < 34; r++) {
        var ra = r * 2.39996, rr = 0.4 + (r % 7) * 0.32;
        var rx = CX + RX + 4.6 + Math.cos(ra) * rr * 0.9, rz = CZ + Math.sin(ra) * rr * 1.1;
        cyl(0.025, 0.035, 0.9 + (r % 5) * 0.18, at(rx, 0.5 + (r % 5) * 0.09, rz), r % 3 ? '--grn-reed' : '--grn-cane', false, 5);
      }

      // THE WAY FROM THE PORCH to the loop, straight and level, kerbed both sides.
      var wz0 = 3, wz1 = CZ + RZ + W / 2 - 0.05, wl = wz0 - wz1, wm = (wz0 + wz1) / 2;
      box(W, 0.12, wl, at(0, DECK - 0.06, wm), '--grn-board', 0.01);
      [-1, 1].forEach(function (side) {
        box(0.1, 0.12, wl, at(side * (W / 2 + 0.05), DECK + 0.06, wm), '--grn-timber', 0.008);
        sheen(0.1, wl, at(side * (W / 2 + 0.05), DECK + 0.125, wm));
      });

      // THE BEDS along the boardwalk's outer edge, raised to a seat's height so
      // nobody kneels in the wet, each with what grows in it and its rim
      // holding the sky.
      var GROWS = [
        ['--grn-leaf', '--grn-tomato'], ['--grn-sage', '--grn-lavender'], ['--grn-fern', '--grn-fern'],
        ['--grn-leaf', '--grn-gold'], ['--grn-reed', '--grn-cone'], ['--grn-sage', '--grn-aster']
      ];
      [-0.32, 0.38, -1.55, 1.95, -2.25, 2.7, 3.45, -2.95, -0.95, 1.05].forEach(function (th, k) {
        var p = onLoop(th, W / 2 + 0.75), h = k % 2 ? 0.69 : 0.5;
        box(2.2, h, 0.9, at(p.x, h / 2, p.z, th), '--grn-timber', 0.012);
        sheen(2.2, 0.06, at(p.x + Math.sin(th) * 0.42, h + 0.009, p.z + Math.cos(th) * 0.42, th));
        sheen(2.2, 0.06, at(p.x - Math.sin(th) * 0.42, h + 0.009, p.z - Math.cos(th) * 0.42, th));
        var g = GROWS[k % GROWS.length];
        for (var j = -2; j <= 2; j++) {
          var px = p.x + Math.cos(th) * j * 0.42, pz = p.z - Math.sin(th) * j * 0.42;
          blob(px, h + 0.18, pz, 0.24, 0.2, 0.24, g[0]);
          if (j % 2 === 0) blob(px, h + 0.36, pz, 0.08, 0.08, 0.08, g[1], 0.006);
        }
      });

      // BENCHES with backs and arms at the resting places, beside the boards.
      function bench(x, z, ry) {
        box(1.4, 0.06, 0.45, at(x, 0.46, z, ry), '--grn-timber', 0.008);
        box(1.4, 0.45, 0.06, at(x - Math.sin(ry) * 0.22, 0.72, z - Math.cos(ry) * 0.22, ry), '--grn-timber', 0.008);
        sheen(1.4, 0.06, at(x - Math.sin(ry) * 0.22, 0.955, z - Math.cos(ry) * 0.22, ry));
        [-1, 1].forEach(function (s) {
          var ax = x + Math.cos(ry) * s * 0.7, az = z - Math.sin(ry) * s * 0.7;
          box(0.06, 0.66, 0.45, at(ax, 0.33, az, ry), '--grn-timber', 0.008);
        });
      }
      [-1.2, 1.4, 3.05, -2.6].forEach(function (th) {
        var p = onLoop(th, W / 2 + 0.6);
        bench(p.x, p.z, th + Math.PI);
      });

      // THE WOOD ALL ROUND, near and far, every crown lit from above and no
      // shadow under any of it.
      function tree(x, z, s, ink) {
        cyl(0.16 * s, 0.22 * s, 2.4 * s, at(x, 1.2 * s, z), '--grn-roof', 0.008, 8);
        blob(x, 2.9 * s, z, 1.35 * s, 1.1 * s, 1.35 * s, ink);
        blob(x + 0.5 * s, 3.6 * s, z - 0.3 * s, 0.95 * s, 0.85 * s, 0.95 * s, ink);
        blob(x - 0.45 * s, 3.4 * s, z + 0.35 * s, 0.9 * s, 0.8 * s, 0.9 * s, ink);
      }
      for (var t = 0; t < 46; t++) {
        var ta = t / 46 * Math.PI * 2 + (t % 3) * 0.04;
        var reach = 16.5 + (t % 4) * 1.7, ts = 1 + (t % 5) * 0.12;
        var tx = CX + Math.sin(ta) * reach * 1.15, tz = CZ + Math.cos(ta) * reach;
        if (tz > -1 && Math.abs(tx) < 10) continue;                         // the porch
        tree(tx, tz, ts, t % 2 ? '--grn-wood' : '--grn-wood-2');
      }
      for (t = 0; t < 30; t++) {
        var fa = t / 30 * Math.PI * 2;
        blob(CX + Math.sin(fa) * 36, 4.5, CZ + Math.cos(fa) * 30, 6, 4.8, 6, '--grn-wood', false);
      }
      [-1, 1].forEach(function (s) {
        tree(s * 11.5, 5.5, 1.1, '--grn-wood-2');
        tree(s * 12.8, 9.5, 1.2, '--grn-wood');
      });

      // THE PORCH, where you stayed while it rained: a floor level with the
      // boards, a back wall with the gate in it, two end walls, a rail along the
      // front with a gap for the way down to the loop, and a roof whose front
      // edge holds the sky and the last drops, hanging still.
      var PX0 = -8, PX1 = 8, PZ0 = 3, PZ1 = 10, PY = 3.1;
      box(PX1 - PX0, DECK, PZ1 - PZ0, at(0, DECK / 2, (PZ0 + PZ1) / 2), '--grn-board', 0.01);
      box(PX1 - PX0 + 0.3, 0.14, PZ1 - PZ0 + 0.8, at(0, PY, (PZ0 + PZ1) / 2 - 0.3), '--grn-roof', 0.012);
      sheen(PX1 - PX0 + 0.3, 0.08, at(0, PY + 0.08, PZ0 - 0.66));
      for (var dx = PX0 + 0.3; dx < PX1; dx += 0.55) blob(dx, PY - 0.13, PZ0 - 0.66, 0.035, 0.05, 0.035, '--grn-pond-sky', false);
      // The back wall, with the gate in it on the right, shut behind you.
      var GX0 = 5.2, GX1 = 6.9;
      box(GX0 - PX0, PY, 0.16, at((PX0 + GX0) / 2, PY / 2, PZ1), '--grn-timber', 0.01);
      box(PX1 - GX1, PY, 0.16, at((GX1 + PX1) / 2, PY / 2, PZ1), '--grn-timber', 0.01);
      box(GX1 - GX0, PY - 2.3, 0.16, at((GX0 + GX1) / 2, 2.3 + (PY - 2.3) / 2, PZ1), '--grn-timber', 0.01);
      for (var gx = GX0 + 0.12; gx < GX1; gx += 0.24) box(0.09, 1.9, 0.05, at(gx, 1.1, PZ1 + 0.02), '--grn-board', 0.006);
      box(GX1 - GX0, 0.09, 0.06, at((GX0 + GX1) / 2, 1.9, PZ1 + 0.02), '--grn-board', 0.006);
      sheen(GX1 - GX0, 0.06, at((GX0 + GX1) / 2, 1.95, PZ1 + 0.02));
      [PX0, PX1].forEach(function (x) { box(0.16, PY, PZ1 - PZ0, at(x, PY / 2, (PZ0 + PZ1) / 2), '--grn-timber', 0.01); });
      [PX0 + 0.1, -W / 2 - 0.1, W / 2 + 0.1, PX1 - 0.1].forEach(function (x) { box(0.16, PY, 0.16, at(x, PY / 2, PZ0), '--grn-timber', 0.008); });
      [[PX0, -W / 2 - 0.1], [W / 2 + 0.1, PX1]].forEach(function (seg) {
        var l = seg[1] - seg[0], mx = (seg[0] + seg[1]) / 2;
        box(l, 0.07, 0.1, at(mx, 0.95, PZ0), '--grn-timber', 0.008);
        sheen(l, 0.1, at(mx, 0.995, PZ0));
        for (var b = seg[0] + 0.2; b < seg[1]; b += 0.4) blob(b, 1.0, PZ0, 0.03, 0.03, 0.03, '--grn-pond-sky', false);
        box(l, 0.06, 0.06, at(mx, 0.45, PZ0), '--grn-timber', 0.006);
      });
      // Benches along the back wall, under what hangs on it.
      [[-5.8, 2.4], [-1.6, 2.4], [2.4, 2.4]].forEach(function (b) {
        box(b[1], 0.07, 0.45, at(b[0], 0.46, PZ1 - 0.36), '--grn-timber', 0.008);
        [-1, 1].forEach(function (s) { box(0.07, 0.42, 0.4, at(b[0] + s * (b[1] / 2 - 0.1), 0.24, PZ1 - 0.36), '--grn-timber', 0.006); });
        sheen(b[1], 0.06, at(b[0], 0.5, PZ1 - 0.17));
      });

      // A board on two posts, its top holding the sky, where a part of the page
      // stands to be read. ry is the way it faces.
      function board(x, z, ry, w) {
        [-1, 1].forEach(function (s) {
          box(0.1, 0.62, 0.1, at(x + Math.cos(ry) * s * (w / 2 - 0.15), 0.31, z - Math.sin(ry) * s * (w / 2 - 0.15), ry), '--grn-timber', 0.008);
        });
        box(w, 0.08, 0.24, at(x, 0.62, z, ry), '--grn-timber', 0.008);
        sheen(w, 0.24, at(x, 0.665, z, ry));
      }
      function spot(x, z, ry) { return { x: x, z: z, ry: ry }; }
      function foot(s, y) { return at(s.x, y, s.z, s.ry); }
      function front(name, s, d, pitch, more) {
        var o = { name: name, x: s.x + Math.sin(s.ry) * d, z: s.z + Math.cos(s.ry) * d, yaw: s.ry, pitch: pitch || 0.05 };
        for (var k in more) o[k] = more[k];
        return o;
      }
      // A board out round the loop, past its outer kerb, facing the boards.
      function round(th, out) {
        var p = onLoop(th, out || 2.4);
        return spot(p.x, p.z, th + Math.PI);
      }

      // THE ROOM'S OWN PAGE, on the porch's back wall beside the gate.
      var PG = spot(2.4, PZ1 - 0.1, Math.PI), pgw = 2.4, pgh = pgw * 800 / 1180;
      box(pgw + 0.14, pgh + 0.14, 0.05, foot(PG, 0.95 + pgh / 2), '--grn-ink', 0.01);
      sheen(pgw + 0.14, 0.05, foot(PG, 0.95 + pgh + 0.08));
      var page = kit.screen(1180, 800, pgw, foot({ x: PG.x, z: PG.z - 0.04, ry: PG.ry }, 0.95 + pgh / 2), 'The Green’s own page, on the porch wall beside the gate');

      // THE SCREEN UNDER THE PORCH ROOF, on the left end wall, giving off
      // nothing until somebody puts a film up, and the racks under it: Ryan's
      // pick and the newest on the back wall, the month on the right end wall.
      var SC = spot(PX0 + 0.1, 6.6, Math.PI / 2);
      var screen = kit.lift(page, '.grn-screen', { w: 860, ww: 2.4, m: foot(SC, 1.3) });
      kit.lift(page, '.grn-screen__now', { w: 760, ww: 2.2, m: foot(SC, 0.95) });
      kit.lift(page, '.grn-screen__back', { w: 640, ww: 1.6, m: foot(SC, 0.55) });
      var R0 = spot(-1.6, PZ1 - 0.1, Math.PI), R1 = spot(-5.4, PZ1 - 0.1, Math.PI), R2 = spot(PX1 - 0.1, 7.6, -Math.PI / 2);
      var rack0 = kit.lift(page, '.grn-rack', { n: 0, w: 720, h: 760, ww: 1.8, m: foot(R0, 0.75) });
      var rack1 = kit.lift(page, '.grn-rack', { n: 1, w: 720, h: 760, ww: 1.8, m: foot(R1, 0.75) });
      var rack2 = kit.lift(page, '.grn-rack', { n: 2, w: 720, h: 760, ww: 1.8, m: foot(R2, 0.75) });
      // The porch, in its own words, on the right end wall nearer the front.
      var PR = spot(PX1 - 0.1, 4.6, -Math.PI / 2);
      var porch = kit.lift(page, '.grn-part', { n: 4, w: 720, ww: 1.6, m: foot(PR, 0.8) });

      // THE TRAILHEAD, by the porch steps: the sign on the left of the way down,
      // and the trail itself on the right, its plan and its way round.
      var SG = spot(-2.0, 0.8, Math.PI / 2), TR = spot(2.0, 0.6, -Math.PI / 2);
      board(SG.x, SG.z, SG.ry, 1.8); board(TR.x, TR.z, TR.ry, 1.9);
      var sign = kit.lift(page, '.grn-sign', { w: 720, ww: 1.7, m: foot(SG, 0.66) });
      var trail = kit.lift(page, '.grn-walk', { w: 760, h: 620, ww: 1.8, m: foot(TR, 0.66) });

      // ROUND THE LOOP, each part of the page on a board past the outer kerb,
      // facing the boards you walk on.
      var HD = round(-0.6), LD = round(0.62), BD = round(-1.75), RN = round(1.15, 7.4),
          RL = round(2.45), KP = round(-2.45), WH = round(Math.PI - 0.02);
      [HD, LD, BD, RL, KP, WH].forEach(function (s) { board(s.x, s.z, s.ry, 1.8); });
      board(RN.x, RN.z, RN.ry, 1.8);
      var head = kit.lift(page, '.grn-head', { w: 720, ww: 1.6, m: foot(HD, 0.66) });
      var lede = kit.lift(page, '.grn-lede', { w: 720, ww: 1.6, m: foot(LD, 0.66) });
      var beds = kit.lift(page, '.grn-part', { n: 3, w: 720, ww: 1.6, m: foot(BD, 0.66) });
      var rain = kit.lift(page, '.grn-part', { n: 5, w: 720, ww: 1.6, m: foot(RN, 0.66) });
      var rules = kit.lift(page, '.grn-part', { n: 8, w: 720, ww: 1.6, m: foot(RL, 0.66) });
      var keeps = kit.lift(page, '.grn-part', { n: 9, w: 720, ww: 1.6, m: foot(KP, 0.66) });
      var whose = kit.lift(page, '.grn-part', { n: 10, w: 720, ww: 1.6, m: foot(WH, 0.66) });

      kit.wire(page, 'rack.js');
      kit.wire(page, 'green.js');

      var br = onLoop(Math.PI / 2, 0);
      return {
        start: { x: 3.4, z: 6.2, yaw: 0.2 },
        bounds: { x: [-17, 17], z: [-27, 9.4] },
        stops: [
          { name: 'just through the gate, under the porch roof, looking out over the boardwalk and the pond', where: 'on the porch, just through the gate, looking out over the pond', x: 3.4, z: 6.2, yaw: 0.2, pitch: 0.02 },
          front('on the porch, at the screen under the roof, giving off nothing until somebody puts a film up', SC, 3.0, 0.08, { frame: screen.el }),
          front('on the porch, at the first rack: Ryan’s pick', R0, 2.5, 0.12, { frame: rack0.el }),
          front('on the porch, at the second rack: the newest', R1, 2.5, 0.12, { frame: rack1.el }),
          front('on the porch, at the third rack: the month', R2, 2.5, 0.12, { frame: rack2.el }),
          front('on the porch, at its own words', PR, 2.4, 0.08, { frame: porch.el }),
          front('at the trailhead, at the sign by the porch steps', SG, 2.0, 0.12, { frame: sign.el }),
          front('at the trailhead, at the trail and its way round', TR, 2.0, 0.14, { frame: trail.el }),
          front('on the boardwalk, at the name and its line', HD, 2.4, 0.1, { frame: head.el }),
          front('on the boardwalk, at what the Green is', LD, 2.4, 0.1, { frame: lede.el }),
          front('on the boardwalk by the raised beds, at the beds’ own words', BD, 2.4, 0.1, { frame: beds.el }),
          { name: 'on the little bridge, the rain garden full past it', x: br.x, z: br.z, yaw: -Math.PI / 2, pitch: 0.04 },
          front('past the bridge, by the rain garden: after the rain', RN, 2.4, 0.1, { frame: rain.el }),
          front('on the far side of the loop: the house rules', RL, 2.4, 0.1, { frame: rules.el }),
          front('on the far side of the loop: what the Green keeps', KP, 2.4, 0.1, { frame: keeps.el }),
          front('at the far end of the loop, across the pond from the porch: whose it is', WH, 2.4, 0.1, { frame: whose.el }),
          front('back on the porch, by the gate, with the room’s own page on the wall beside it', PG, 2.6, 0.05, { page: kit.page, frame: page })
        ]
      };
    }
  };
})();

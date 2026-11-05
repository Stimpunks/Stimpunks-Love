/* =============================================================================
   The Aerial Arbour, walked into on Cel Street. Ryan's ask, 2026-11-05: pitch
   06 on the campgrounds, Rowena's, through its post in the field.

   THIS SCENE IS OURS, DRAWN FROM ROWENA'S OWN WORDS AND HER ROOM'S OWN
   COLOURS, AND IT IS HERS TO KEEP OR SEND BACK; it changes nothing on her
   page, and a change to how it looks is hers to ask for.

   IT IS THE ARBOUR'S WORLD AND NOBODY ELSE'S (§147): a round circus tent at
   night, pitched round a silver birch that holds the canvas up. Every seam
   runs down from the top of the tree to the wall, the canvas in stripes of
   deep purple, teal and dark pink, with a string of fairy lights down every
   one, small and silver and steady. Off the birch's branches hang the silks,
   the rope ladder, the rope, the hoop and the aerial pole; a tightrope runs
   from a little platform on the trunk out to a post by the wall; a crash mat
   lies under everything that hangs, a hammock is slung between two of the
   wall's poles, and the beanbags are on the rug. Nobody is drawn, there is no
   ring and no seats, because nothing in here is a show. That is what keeps it
   off the Faery Yurt next door: no flame and no brown anywhere, not even the
   tree; the light is cool silver points and all the colour is in the cloth.

   THE LIGHTS NEVER TWINKLE, at any setting: there is a switch for how bright
   they are and none for twinkling, because twinkling is the yurt's. The hoop
   and the pole turn slowly where they hang at MAX GLITTER, as they sway on her
   page, and at any other setting only when somebody asks; nothing else moves.
   The room's own page hangs on the wall across from the door.

   Every colour is one §147 declares, by name. It keeps nothing, sends nothing
   and fetches nothing; its page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 23, 374761393) ^ Math.imul(j + 61, 668265263) ^ Math.imul(k + 71, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['the-aerial-arbour.html'] = {
    name: 'The Aerial Arbour',
    from: 'campgrounds.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var DEG = Math.PI / 180;
      var R = 6.5, WH = 2.4, AP = 7.2, TOP = 0.36, N = 24;
      var STRIPES = ['--aar-purple', '--aar-teal', '--aar-wine'];
      // A place round the wall, turned to face the middle: θ = 0 is the wall
      // across from the door, and θ grows to the right as you come in.
      function round(theta, r, y) { return at(r * Math.sin(theta), y || 0, -r * Math.cos(theta), -theta); }
      function face(x, z, tx, tz) { return Math.atan2(-(tx - x), -(tz - z)); }
      // How high the canvas is, this far out from the tree.
      function roofY(r) { return AP - (AP - WH) * (r - TOP) / (R - TOP); }
      // A rod from a to b, round, r thick, in one ink.
      var UP = new T.Vector3(0, 1, 0);
      function rodAt(a, b) {
        var A = new T.Vector3(a[0], a[1], a[2]), B = new T.Vector3(b[0], b[1], b[2]);
        var d = B.clone().sub(A), len = d.length();
        var q = new T.Quaternion().setFromUnitVectors(UP, d.normalize());
        return { m: new T.Matrix4().compose(A.clone().add(B).multiplyScalar(0.5), q, new T.Vector3(1, 1, 1)), len: len };
      }
      function rod(a, b, r, ink, edge, seg) {
        var p = rodAt(a, b);
        kit.cyl(r, r, p.len, p.m, ink, edge === undefined ? false : edge, seg || 6);
      }

      // NIGHT, AND NO FLAME: the dark between the lights, the canvas's own
      // purple over everything, and the silver of the lights from above.
      kit.scene.background = kit.col('--aar-night');
      kit.scene.add(new T.HemisphereLight(kit.col('--aar-plum'), kit.col('--aar-floor'), 1.5));
      var crown = new T.PointLight(kit.col('--aar-bulb'), 34, 15, 1.2);
      crown.position.set(0, 5.6, 0.6);
      kit.scene.add(crown);
      // The strings throw a little of their silver onto the canvas under
      // them, between the things round the wall.
      var washes = [crown];
      [-150, -100, -50, 0, 50, 100, 150].forEach(function (deg) {
        var w = new T.PointLight(kit.col('--aar-bulb'), 6, 5, 1.4);
        var a = deg * DEG;
        w.position.set((R - 1.6) * Math.sin(a), 2.6, -(R - 1.6) * Math.cos(a));
        kit.scene.add(w); washes.push(w);
      });
      var washAt = washes.map(function (w) { return w.intensity; });

      // THE CANVAS, from inside: a gore for every seam, the wall straight down
      // and the roof up to the top of the tree, purple, teal and dark pink in
      // turn. Every triangle is wound to face in, so it is seen from inside.
      var IN = new T.Vector3(0, 1, 0);
      function canvas(rings, ink, door) {
        var pos = [], A = new T.Vector3(), B = new T.Vector3(), C = new T.Vector3(), mid = new T.Vector3();
        function tri(a, b, c) {
          A.fromArray(a); B.fromArray(b); C.fromArray(c);
          var nrm = B.clone().sub(A).cross(C.clone().sub(A));
          mid.copy(A).add(B).add(C).multiplyScalar(1 / 3);
          if (nrm.dot(IN.clone().sub(mid)) < 0) { var t = b; b = c; c = t; }
          pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
        }
        for (var i = 0; i < rings.length - 1; i++) {
          for (var j = 0; j < rings[i].length - 1; j++) {
            tri(rings[i][j], rings[i][j + 1], rings[i + 1][j]);
            tri(rings[i][j + 1], rings[i + 1][j + 1], rings[i + 1][j]);
          }
        }
        var g = new T.BufferGeometry();
        g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
        g.computeVertexNormals();
        kit.piece(g, new T.Matrix4(), ink, false, false);
      }
      function pt(theta, r, y) { return [r * Math.sin(theta), y, -r * Math.cos(theta)]; }
      var DOOR = 180 * DEG, DOORW = 11.25 * DEG;
      for (var s = 0; s < N; s++) {
        var a0 = (s / N) * Math.PI * 2 - Math.PI / N, a1 = a0 + Math.PI * 2 / N, ink = STRIPES[s % 3];
        var cols = [], c;
        for (c = 0; c <= 4; c++) cols.push(a0 + (a1 - a0) * c / 4);
        // The roof, from the wall's top to the collar round the tree.
        var rings = [];
        for (var k = 0; k <= 6; k++) {
          var rr = R - (R - TOP) * k / 6;
          rings.push(cols.map(function (t) { return pt(t, rr, roofY(rr)); }));
        }
        canvas(rings, ink);
        // The wall, straight down, with the doorway left open in it.
        var wall = cols.filter(function (t) { var d = Math.abs(((t - DOOR + Math.PI * 3) % (Math.PI * 2)) - Math.PI); return d >= DOORW - 1e-6; });
        if (wall.length > 1) canvas([wall.map(function (t) { return pt(t, R, 0); }), wall.map(function (t) { return pt(t, R, WH); })], ink);
      }
      // A canvas lintel over the doorway, and the door's own two posts.
      var lint = [];
      for (c = 0; c <= 6; c++) lint.push(DOOR - DOORW + 2 * DOORW * c / 6);
      canvas([lint.map(function (t) { return pt(t, R, 2.0); }), lint.map(function (t) { return pt(t, R, WH); })], '--aar-wine');
      [-1, 1].forEach(function (sd) { kit.cyl(0.04, 0.04, 2.0, round(DOOR + sd * DOORW, R - 0.05, 1.0), '--aar-steel', 0.012, 8); });

      // THE SEAMS, a steel cord from the top of the tree to the wall, a pole
      // in the wall under every one, and the fairy lights down every seam.
      var bulbsAt = [];
      for (s = 0; s < N; s++) {
        var sa = (s / N) * Math.PI * 2 - Math.PI / N;
        var lo = pt(sa, R - 0.04, WH), hi = pt(sa, TOP + 0.04, roofY(TOP));
        rod([lo[0], lo[1] - 0.03, lo[2]], [hi[0], hi[1] - 0.03, hi[2]], 0.012, '--aar-steel');
        if (Math.abs(((sa - DOOR + Math.PI * 3) % (Math.PI * 2)) - Math.PI) > DOORW + 0.01) {
          kit.cyl(0.035, 0.035, WH, round(sa, R - 0.08, WH / 2), '--aar-steel', 0.01, 8);
        }
        for (var b = 1; b < 16; b++) {
          var br = TOP + (R - TOP) * b / 16;
          var p = pt(sa, br - 0.02, roofY(br) - 0.09 - 0.04 * Math.sin(b * 1.7));
          bulbsAt.push(p);
        }
      }
      // And a string down the birch itself, round and round to the mat.
      for (var t = 0; t < 34; t++) {
        var ty = 6.9 - t * 0.19, tr = 0.34 - 0.14 * ty / 8 + 0.05;
        bulbsAt.push([tr * Math.sin(t * 0.9), ty, tr * Math.cos(t * 0.9)]);
      }
      var bulbs = kit.bulbs(bulbsAt, 0.04, ['--aar-bulb']);
      // The collar where the canvas meets the tree.
      kit.piece(new T.RingGeometry(0.2, TOP + 0.06, 24), at(0, roofY(TOP) - 0.03, 0, 0, Math.PI / 2), '--aar-steel', false, false);
      kit.piece(new T.TorusGeometry(TOP + 0.04, 0.04, 6, 24), at(0, roofY(TOP) - 0.05, 0, 0, Math.PI / 2), '--aar-steel', false);

      // THE VALANCE round the top of the wall: a rope, and a scallop under it
      // for every hand's width, the silks' two colours in turn, as on every
      // card on her page.
      kit.piece(new T.TorusGeometry(R - 0.09, 0.025, 6, 96), at(0, WH, 0, 0, Math.PI / 2), '--aar-steel', false);
      var scallop = new T.CircleGeometry(0.16, 10, Math.PI, Math.PI);
      var nsc = Math.floor(Math.PI * 2 * (R - 0.1) / 0.32);
      for (var v = 0; v < nsc; v++) {
        var va = v / nsc * Math.PI * 2;
        kit.piece(scallop, round(va, R - 0.11, WH - 0.01), v % 2 ? '--aar-sea' : '--aar-rose', 0.006, false);
      }

      // THE FLOOR: one round rug the shape of the tent, a dark pink ring near
      // its edge, and the crash mat round the tree under everything that hangs.
      kit.cyl(R - 0.05, R - 0.05, 0.08, at(0, -0.04, 0), '--aar-floor', false, 64);
      kit.piece(new T.RingGeometry(R - 0.7, R - 0.6, 64), at(0, 0.004, 0, 0, -Math.PI / 2), '--aar-rose', false, false);
      kit.piece(new T.RingGeometry(R - 0.95, R - 0.9, 64), at(0, 0.004, 0, 0, -Math.PI / 2), '--aar-sea', false, false);
      kit.cyl(3.15, 3.15, 0.22, at(-0.3, 0.11, 0), '--aar-panel', 0.015, 48);
      kit.piece(new T.TorusGeometry(3.15, 0.04, 6, 64), at(-0.3, 0.22, 0, 0, Math.PI / 2), '--aar-steel', false);
      // The seams quilted across the mat.
      for (var q = -2; q <= 2; q++) {
        var half = Math.sqrt(3.1 * 3.1 - (q * 1.2) * (q * 1.2));
        box(half * 2, 0.006, 0.03, at(-0.3, 0.224, q * 1.2), '--aar-plum', false, false);
      }

      // THE BIRCH, the king pole: white bark marked across with dark lines,
      // up through the middle of the tent and out at the top.
      kit.cyl(0.2, 0.34, 8, at(0, 4, 0), '--aar-birch', 0.03, 18);
      kit.cyl(0.42, 0.5, 0.18, at(0, 0.3, 0), '--aar-birch', 0.02, 14);
      for (var mk = 0; mk < 90; mk++) {
        var my = 0.35 + hash(mk, 1, 1) * 6.6, ma = hash(mk, 1, 2) * Math.PI * 2;
        var mr = 0.34 - 0.14 * (my / 8) + 0.006;
        var mw = 0.06 + hash(mk, 1, 3) * 0.14;
        box(mw, 0.022 + hash(mk, 1, 4) * 0.02, 0.02, at(mr * Math.sin(ma), my, mr * Math.cos(ma), ma), '--aar-mark', false, false);
      }
      // Its branches, each holding something up: the silks from the highest,
      // the ladder from the long one on the left, the rope, the hoop from the
      // one on the right, the pole from the far one, and twigs going up.
      var HANG = {
        silks:  [-1.7, 5.1, -0.4], ladder: [-2.45, 4.5, 0.3], rope: [-0.9, 4.65, 0.95],
        hoop:   [1.75, 4.75, -0.2], pole: [0.8, 5.3, -1.95]
      };
      function bough(from, to, r, lift) {
        var A = new T.Vector3(0, from, 0), D = new T.Vector3(to[0], to[1], to[2]);
        var m1 = A.clone().lerp(D, 0.4); m1.y += lift;
        var m2 = A.clone().lerp(D, 0.75); m2.y += lift * 0.6;
        var curve = new T.CatmullRomCurve3([A, m1, m2, D.clone().add(new T.Vector3(to[0] * 0.08, 0.04, to[2] * 0.08))]);
        kit.piece(new T.TubeGeometry(curve, 16, r, 7, false), new T.Matrix4(), '--aar-birch', 0.02);
        // A dark mark or two along it, and a few teal leaves at its end.
        for (var i = 1; i < 4; i++) {
          var pp = curve.getPoint(i / 4);
          box(0.09, 0.02, 0.02, at(pp.x, pp.y + r * 0.9, pp.z, Math.atan2(to[0], to[2]) + Math.PI / 2), '--aar-mark', false, false);
        }
        return curve;
      }
      bough(4.6, HANG.silks, 0.085, 0.25);
      bough(3.9, HANG.ladder, 0.1, 0.3);
      bough(4.2, HANG.rope, 0.07, 0.2);
      bough(4.25, HANG.hoop, 0.09, 0.25);
      bough(4.9, HANG.pole, 0.08, 0.15);
      var twigs = [bough(5.4, [1.15, 5.75, 1.05], 0.05, 0.15), bough(5.6, [-1.0, 5.85, -1.2], 0.05, 0.12), bough(6.0, [0.4, 6.2, 0.8], 0.04, 0.08)];
      var leaf = new T.SphereGeometry(0.1, 8, 5); leaf.scale(1, 0.32, 0.55);
      var tips = [HANG.silks, HANG.ladder, HANG.rope, HANG.hoop, HANG.pole];
      twigs.forEach(function (cv) { var e = cv.getPoint(1); tips.push([e.x, e.y, e.z]); });
      tips.forEach(function (tp, n) {
        for (var l = 0; l < 5; l++) {
          var lx = tp[0] * (0.82 + l * 0.05) + (hash(n, l, 1) - 0.5) * 0.4, lz = tp[2] * (0.82 + l * 0.05) + (hash(n, l, 2) - 0.5) * 0.4;
          kit.piece(leaf, at(lx, tp[1] + 0.12 + hash(n, l, 3) * 0.25, lz, hash(n, l, 4) * 6, (hash(n, l, 5) - 0.5) * 0.8), '--aar-sea', 0.006);
        }
      });

      // THE SILKS: two long lengths of cloth, dark pink and teal, from a
      // steel rig under the highest branch down to the mat, where they pool.
      var sk = HANG.silks;
      box(0.18, 0.1, 0.12, at(sk[0], sk[1] - 0.08, sk[2]), '--aar-steel', 0.01);
      [['--aar-rose', -1], ['--aar-sea', 1]].forEach(function (cl) {
        var len = sk[1] - 0.35;
        box(0.24, len, 0.016, at(sk[0] + cl[1] * 0.08, sk[1] - 0.12 - len / 2, sk[2], cl[1] * 0.25, 0, cl[1] * 0.025), cl[0], 0.006);
        box(0.5, 0.03, 0.34, at(sk[0] + cl[1] * 0.22, 0.24, sk[2] + cl[1] * 0.05, cl[1] * 0.6), cl[0], 0.006);
      });

      // THE ROPE LADDER off the long branch on the left, a rung at a time.
      var ld = HANG.ladder;
      [-0.18, 0.18].forEach(function (dx) { rod([ld[0] + dx, ld[1], ld[2]], [ld[0] + dx, 0.45, ld[2]], 0.017, '--aar-rope', 0.006); });
      for (var rung = 0.65; rung < ld[1] - 0.1; rung += 0.3) {
        kit.cyl(0.022, 0.022, 0.42, at(ld[0], rung, ld[2], 0, 0, Math.PI / 2), '--aar-rope', 0.006, 6);
      }

      // THE ROPE, one, with a knot at its foot.
      var rp = HANG.rope;
      rod([rp[0], rp[1], rp[2]], [rp[0], 0.5, rp[2]], 0.03, '--aar-rope', 0.008, 8);
      kit.piece(new T.SphereGeometry(0.075, 10, 8), at(rp[0], 0.5, rp[2]), '--aar-rope', 0.01);
      kit.piece(new T.TorusGeometry(0.05, 0.022, 6, 12), at(rp[0], 0.62, rp[2], 0, Math.PI / 2), '--aar-rope', false);

      // THE AERIAL HOOP, a steel ring wrapped in pink tape on a rope from the
      // branch on the right. It turns where it hangs, at MAX or when asked.
      var hp = HANG.hoop, hoopAt = at(hp[0], 0, hp[2]), HY = 2.05, HR = 0.48, hoop = [];
      hoop.push(kit.facets(new T.CylinderGeometry(0.014, 0.014, hp[1] - (HY + HR), 6), M(hoopAt, at(0, (hp[1] + HY + HR) / 2, 0)), '--aar-rope'));
      hoop.push(kit.facets(new T.TorusGeometry(HR, 0.032, 8, 40), M(hoopAt, at(0, HY, 0)), '--aar-steel'));
      for (var tp2 = 0; tp2 < 9; tp2++) {
        var ang = Math.PI * 0.6 + tp2 * 0.22;
        hoop.push(kit.facets(new T.TorusGeometry(HR, 0.04, 8, 4, 0.12), M(hoopAt, at(0, HY, 0, 0, 0, ang)), '--aar-rose'));
      }
      hoop.push(kit.facets(new T.SphereGeometry(0.045, 8, 6), M(hoopAt, at(0, HY + HR + 0.02, 0)), '--aar-steel'));

      // THE AERIAL POLE, steel on a swivel from the far branch, a spiral of
      // pink tape up its foot so you can see it turn.
      var pl = HANG.pole, poleAt = at(pl[0], 0, pl[2]), pole = [];
      pole.push(kit.facets(new T.CylinderGeometry(0.06, 0.06, 0.16, 10), M(poleAt, at(0, pl[1] - 0.1, 0)), '--aar-steel'));
      pole.push(kit.facets(new T.CylinderGeometry(0.048, 0.048, pl[1] - 0.45, 14), M(poleAt, at(0, (pl[1] - 0.2 + 0.25) / 2, 0)), '--aar-steel'));
      var helix = [];
      for (var hx = 0; hx <= 60; hx++) helix.push(new T.Vector3(0.05 * Math.cos(hx * 0.42), 0.4 + hx * 0.025, 0.05 * Math.sin(hx * 0.42)));
      pole.push(kit.facets(new T.TubeGeometry(new T.CatmullRomCurve3(helix), 120, 0.012, 5, false), poleAt, '--aar-rose'));
      pole.push(kit.facets(new T.CylinderGeometry(0.09, 0.09, 0.04, 12), M(poleAt, at(0, 0.27, 0)), '--aar-steel'));

      // THE TIGHTROPE, a wire from a little platform on the trunk out to a
      // post by the wall, low over the rug.
      box(0.62, 0.06, 0.5, at(-0.48, 1.26, 0.22), '--aar-steel', 0.01);
      rod([-0.78, 1.0, 0.22], [-0.3, 0.45, 0.2], 0.02, '--aar-steel');
      var postX = -4.95, postZ = 2.25;
      kit.cyl(0.055, 0.055, 1.36, at(postX, 0.68, postZ), '--aar-steel', 0.012, 10);
      kit.cyl(0.2, 0.22, 0.05, at(postX, 0.025, postZ), '--aar-steel', 0.01, 14);
      box(0.24, 0.05, 0.14, at(postX, 1.36, postZ, face(postX, postZ, -0.78, 0.25)), '--aar-steel', 0.008);
      rod([-0.78, 1.31, 0.25], [postX, 1.37, postZ], 0.009, '--aar-steel');
      rod([postX, 1.3, postZ], [postX - 0.5, 0.02, postZ + 0.25], 0.008, '--aar-steel');

      // THE HAMMOCK, slung between two of the wall's poles, dark pink with a
      // teal edge, and a blanket to put in it.
      var h0 = 112 * DEG, h1 = 148 * DEG;
      var P0 = pt(h0, R - 0.3, 1.55), P1 = pt(h1, R - 0.3, 1.55);
      [P0, P1].forEach(function (pp) { kit.cyl(0.045, 0.045, 1.6, at(pp[0], 0.8, pp[2]), '--aar-steel', 0.01, 8); });
      var HN = 22, hdir = new T.Vector3(P1[0] - P0[0], 0, P1[2] - P0[2]), hlen = hdir.length();
      var hyaw = Math.atan2(-hdir.z, hdir.x), blanket = [];
      function along(f) { return [P0[0] + (P1[0] - P0[0]) * f, 1.55 - 0.95 * Math.sin(Math.PI * (0.12 + f * 0.76)), P0[2] + (P1[2] - P0[2]) * f]; }
      var e0 = along(0), e1 = along(1);
      for (var hs = 0; hs < HN; hs++) {
        var f0 = (hs + 0.5) / HN, A0 = along(f0 - 0.5 / HN), A1 = along(f0 + 0.5 / HN), mp = along(f0);
        var pitch = Math.atan2(A1[1] - A0[1], hlen / HN);
        var seg = at(mp[0], mp[1], mp[2], hyaw, 0, pitch);
        var sl = hlen / HN + 0.05;
        box(sl, 0.025, 0.82, seg, '--aar-rose', false);
        box(sl, 0.04, 0.05, M(seg, at(0, 0.008, 0.41)), '--aar-sea', false);
        box(sl, 0.04, 0.05, M(seg, at(0, 0.008, -0.41)), '--aar-sea', false);
        if (hs > 3 && hs < HN - 4) blanket.push(kit.facets(new T.BoxGeometry(sl, 0.05, 0.66), M(seg, at(0, 0.035, 0)), '--aar-plum'));
      }
      // Three cords fanning from each pole to each end, across its width.
      var across = [-hdir.z / hlen, hdir.x / hlen];
      [[P0, e0], [P1, e1]].forEach(function (pr) {
        [-0.38, 0, 0.38].forEach(function (off) {
          rod(pr[0], [pr[1][0] + across[0] * off, pr[1][1], pr[1][2] + across[1] * off], 0.008, '--aar-rope');
        });
      });
      blanket.forEach(function (bk) { kit.hide(bk, true); });

      // THE BEANBAGS on the rug, dark pink, purple and teal. One of them can
      // be pulled over under the hoop.
      var bean = new T.SphereGeometry(0.5, 18, 12); bean.scale(1.05, 0.62, 0.95);
      var dent = new T.SphereGeometry(0.28, 12, 8); dent.scale(1, 0.4, 1);
      function beanbag(x, z, ink, rot, y) {
        y = y || 0;
        return [kit.facets(bean.clone(), at(x, y + 0.3, z, rot), ink), kit.facets(dent.clone(), at(x + 0.08, y + 0.55, z - 0.04, rot), ink)];
      }
      beanbag(4.0, -0.9, '--aar-rose', 0.4);
      beanbag(4.35, 0.35, '--aar-plum', 1.1);
      var bySide = beanbag(3.6, 1.45, '--aar-sea', 2.0);
      var underHoop = beanbag(2.1, 0.35, '--aar-sea', 0.7, 0.2);
      underHoop.forEach(function (pp) { kit.hide(pp, true); });

      // THE DOOR, two flaps of canvas let down across the doorway, or tied
      // back to its posts with the night outside.
      var flaps = [], tied = [];
      [-1, 1].forEach(function (sd) {
        var fa = DOOR + sd * DOORW * 0.5;
        flaps.push(kit.facets(new T.BoxGeometry(R * DOORW * 1.02, 2.0, 0.03), round(fa, R + 0.02, 1.0), sd < 0 ? '--aar-purple' : '--aar-teal'));
        var roll = new T.CylinderGeometry(0.12, 0.14, 1.9, 10);
        tied.push(kit.facets(roll, round(DOOR + sd * (DOORW + 0.03), R - 0.12, 1.0), sd < 0 ? '--aar-purple' : '--aar-teal'));
        tied.push(kit.facets(new T.TorusGeometry(0.15, 0.025, 6, 12), M(round(DOOR + sd * (DOORW + 0.03), R - 0.12, 1.3), at(0, 0, 0, 0, Math.PI / 2)), '--aar-rose'));
      });
      tied.forEach(function (tm) { kit.hide(tm, true); });
      // Out past the door when it is open: the field at night, and the path.
      box(30, 0.05, 20, at(0, -0.06, R + 10.2), '--aar-floor', false, false);
      box(0.9, 0.06, 6, at(0, -0.03, R + 3.2), '--aar-plum', false, false);

      // HER PAGE, on the wall across from the door, in a steel frame.
      var pa = -36 * DEG, pageAt = round(pa, R - 0.55, 1.5);
      box(2.82, 1.98, 0.05, M(pageAt, at(0, 0, -0.04)), '--aar-steel', 0.01);
      box(2.7, 1.86, 0.04, M(pageAt, at(0, 0, -0.02)), '--aar-panel', false);
      [-1.2, 1.2].forEach(function (lx) { kit.cyl(0.03, 0.03, 0.62, M(pageAt, at(lx, -1.19, -0.05)), '--aar-steel', false, 6); });
      var page = kit.screen(1180, 800, 2.6, pageAt, 'The Aerial Arbour’s own page, on the wall across from the door', [-R, R, -R, R]);

      // HER SWITCHES. The fairy lights, how bright and never twinkling.
      var LIT = [1, 0.5, 0.12];
      function light(i) {
        var c2 = kit.col('--aar-bulb').multiplyScalar(LIT[i]);
        for (var n = 0; n < bulbs.n; n++) bulbs.mesh.setColorAt(n, c2);
        bulbs.mesh.instanceColor.needsUpdate = true;
        washes.forEach(function (w, n) { w.intensity = washAt[n] * (i === 0 ? 1 : i === 1 ? 0.55 : 0.18); });
      }
      var lights = kit.choose({ label: 'The fairy lights', choices: ['Lit', 'Low', 'Nearly out'], start: 0,
        pick: function (i) {
          light(i);
          return i === 0 ? 'The fairy lights are lit, silver down every seam. They stay steady.'
            : i === 1 ? 'The fairy lights are low, and the stripes go dark between them.'
            : 'The fairy lights are nearly out: points of silver in the dark, still steady.';
        } });
      var hoopTurn = kit.turn(hoop, hoopAt, { say: 'Let the hoop turn', max: true, period: 9,
        said: function (on) { return on ? 'The hoop turns slowly on its rope, as if somebody has just let go of it.' : 'The hoop hangs still.'; } });
      var poleTurn = kit.turn(pole, poleAt, { say: 'Let the pole turn', max: true, period: 11,
        said: function (on) { return on ? 'The pole turns slowly on its swivel, its pink tape going round.' : 'The pole hangs still.'; } });
      var blanketIn = kit.press({ say: function () { return kit.hidden(blanket[0]) ? 'Put a blanket in the hammock' : 'Fold the blanket away'; },
        at: [kit.touch(2.6, 0.8, 1.2, at((P0[0] + P1[0]) / 2, 0.8, (P0[2] + P1[2]) / 2, hyaw))],
        press: function () {
          var put = kit.hidden(blanket[0]);
          blanket.forEach(function (bk) { kit.hide(bk, !put); });
          return put ? 'A purple blanket is spread in the hammock, for chilling out after the silks, or instead of them.' : 'The blanket is folded away; the hammock is still there.';
        } });
      var beanMove = kit.press({ say: function () { return kit.hidden(underHoop[0]) ? 'Pull the teal beanbag over under the hoop' : 'Put the teal beanbag back with the others'; },
        at: [kit.touch(1.2, 0.8, 1.2, at(3.6, 0.4, 1.45)), kit.touch(1.2, 0.8, 1.2, at(2.1, 0.6, 0.35))],
        press: function () {
          var over = kit.hidden(underHoop[0]);
          underHoop.forEach(function (bb) { kit.hide(bb, !over); });
          bySide.forEach(function (bb) { kit.hide(bb, over); });
          return over ? 'The teal beanbag is under the hoop now, on the edge of the crash mat.' : 'The teal beanbag is back with the other two.';
        } });
      var door = kit.press({ say: function () { return kit.hidden(tied[0]) ? 'Tie the door back' : 'Let the door down'; },
        at: [kit.touch(2.6, 2.0, 0.6, round(DOOR, R - 0.1, 1.0))],
        press: function () {
          var open = kit.hidden(tied[0]);
          tied.forEach(function (tm) { kit.hide(tm, !open); });
          flaps.forEach(function (fl) { kit.hide(fl, open); });
          return open ? 'The door flaps are tied back to their posts, and the field is out there in the dark.' : 'The door flaps are let down again, and the tent is shut round you.';
        } });

      var stops = [
        { name: 'just inside the door, with the birch in the middle', x: 0, z: R - 1.3, yaw: 0, pitch: 0.12, acts: [door] },
        { name: 'under the birch, looking up at the fairy lights down every seam', x: 0.9, z: 1.3, yaw: face(0.9, 1.3, 0, 0), pitch: 1.05, acts: [lights] },
        { name: 'at the silks, dark pink and teal, down from the highest branch', x: -1.45, z: 1.6, yaw: face(-1.45, 1.6, sk[0], sk[2]), pitch: 0.35 },
        { name: 'at the rope ladder and the rope, off the long branch on the left', x: -1.9, z: 2.5, yaw: face(-1.9, 2.5, -1.9, 0.3), pitch: 0.3 },
        { name: 'at the tightrope, from the platform on the trunk out to its post', x: -1.6, z: 3.5, yaw: face(-1.6, 3.5, -3.6, 1.6), pitch: 0.05 },
        { name: 'at the aerial hoop, on its rope from the branch on the right', x: 2.6, z: 2.2, yaw: face(2.6, 2.2, hp[0], hp[2]), pitch: 0.15, acts: [hoopTurn, beanMove] },
        { name: 'at the aerial pole, on its swivel from the far branch', x: 1.9, z: -0.3, yaw: face(1.9, -0.3, pl[0], pl[2]), pitch: 0.3, acts: [poleTurn] },
        { name: 'by the hammock and the beanbags', x: 1.6, z: 2.6, yaw: face(1.6, 2.6, 4.6, 1.9), pitch: -0.22, acts: [blanketIn, beanMove] },
        { name: 'at the wall across from the door, with her page on it', x: (R - 3.2) * Math.sin(pa), z: -(R - 3.2) * Math.cos(pa), yaw: -pa, page: kit.page, frame: page }
      ];

      return {
        start: { x: 0, z: R - 1.3, yaw: 0, pitch: 0.12 },
        bounds: { x: [-(R - 1.0), R - 1.0], z: [-(R - 1.0), R - 0.6] },
        stops: stops
      };
    }
  };
})();

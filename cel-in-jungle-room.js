/* =============================================================================
   The Jungle Room, walked into on Cel Street. Ryan's ask, 2026-10-31: the third
   room you can walk into, after Pink Pony Club and Club Chronic. Second pass,
   2026-11-04 (Ryan's ask: rough edges, texture and detail, toward the painted
   forests of The Dragon Prince within reason).

   IT IS THE JUNGLE ROOM'S WORLD AND NOBODY ELSE'S (§17): night-green under a
   ROOF of leaves, warm and wet, and you are inside it. Light arrives only where
   the leaves let it, falling in shafts onto the litter, and nothing stands
   alone because everything overlaps something: buttressed trunks hung with
   bromeliads and moss, lianas looping between them, aerial roots coming down
   out of the roof, ferns and heliconia at their feet, a log across the path,
   and layer after layer of trunks going back into the dark. The roof is made
   of leaves, many small ones in clumps, lit on the side a shaft catches and
   dark underneath.

   EVERY SCREEN IS A LEAF. The room's galleries of cams hang along the path,
   each on a leaf of its own between the trunks, lifted off the room's own
   page with its own screen and its rack of leaves, and played there through
   rack.js as on the page; each shows only while you stand at it, because a
   lifted page draws over the forest. At the end of the path, in a clearing
   where a shaft comes down, the room's own page hangs in the biggest leaf.
   At the foot of the forest a low door goes down to the other jungle room,
   quiet and not hidden, at full size in the list.

   A GALLERY ON THE PAGE IS A LEAF HERE: GALLERY_SLOTS is counted off the
   page's own galleries by tools/make-cel-street.py and written between the
   cel:galleries markers, never by hand, and the tool refuses more than the
   path has room for until the room is made longer for them.

   NOTHING MOVES. The light through the canopy moves on the room's own page at
   MAX; here the scene is drawn when you move and then left alone, at every
   setting. Every colour is one the room declares, by name. It keeps nothing,
   sends nothing and fetches nothing; its page arrives through Cel Street's
   screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 5, 374761393) ^ Math.imul(j + 13, 668265263) ^ Math.imul(k + 17, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }
  // cel:galleries:begin
  var GALLERY_SLOTS = 7;
  // cel:galleries:end
  var ORDINAL = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['jungle-room.html'] = {
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, D = 28, W = 16, back = -D, ROOF = 8.5;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2, PATH = 2.4;

      kit.scene.background = kit.col('--canopy');
      kit.scene.fog = new T.Fog(kit.col('--canopy'), 14, 46);
      kit.scene.add(new T.HemisphereLight(kit.col('--sap'), kit.col('--canopy'), 1.15));

      // THE SHAFTS: light only where the leaves part, falling straight down
      // onto the litter, each a gap in the roof with a spot of sun under it.
      var gaps = [[2.2, -7], [-3.2, -14.5], [1.0, -20], [0, back + 4.2]];
      gaps.forEach(function (g, i) {
        var sun = new T.SpotLight(kit.col('--sun'), i === 3 ? 260 : 170, 0, 0.42, 0.35, 1.2);
        sun.position.set(g[0] + 1.2, ROOF + 4, g[1] + 1);
        sun.target.position.set(g[0], 0, g[1]);
        sun.castShadow = i < 3;
        sun.shadow.mapSize.set(1024, 1024);
        sun.shadow.bias = -0.0008;
        kit.scene.add(sun, sun.target);
        var cone = new T.Mesh(new T.CylinderGeometry(0.5, 2.0, ROOF + 1, 20, 1, true),
          new T.MeshBasicMaterial({ color: kit.col('--sun'), transparent: true, opacity: 0.08, depthWrite: false, side: T.DoubleSide }));
        cone.position.set(g[0] + 0.6, (ROOF + 1) / 2, g[1] + 0.5);
        cone.rotation.z = 0.08;
        cone.updateMatrix();
        kit.scene.add(cone);
        // Motes in the shaft, still, a few flecks of the sun's own colour.
        for (var m = 0; m < 10; m++) {
          kit.piece(new T.IcosahedronGeometry(0.014, 0), at(g[0] + 0.6 + (hash(i, m, 1) - 0.5) * 1.2, 1.4 + hash(i, m, 2) * 5, g[1] + 0.5 + (hash(i, m, 3) - 0.5) * 1.2), '--sap', false);
        }
      });
      // A low green wash up under the roof, so the leaves have an underside.
      var under = new T.PointLight(kit.col('--palm'), 1.6, 24, 1.6);
      under.position.set(0, 6.4, -12);
      kit.scene.add(under);

      // THE FLOOR: litter, a worn path down the middle a shade paler with use,
      // and fallen leaves on it of every green the room has, a few heliconia
      // petals among them.
      box(W + 30, 0.1, D + 30, at(0, -0.05, -D / 2), '--litter', false, false);
      for (var k = 0; k < 26; k++) {
        var pz = 0.5 - k * 1.05;
        var pg = new T.CircleGeometry(1, 9); pg.scale(1.3 + hash(k, 0, 1) * 0.5, 0.75 + hash(k, 0, 2) * 0.3, 1);
        kit.piece(pg, at((hash(k, 0, 3) - 0.5) * 0.6, 0.004, pz, 0, -Math.PI / 2), '--buttress', false);
      }
      var leafBit = new T.CircleGeometry(1, 6); leafBit.scale(0.12, 0.06, 1);
      for (k = 0; k < 260; k++) {
        var lx = -W / 2 + hash(k, 2, 2) * W, lz = 1 - hash(k, 2, 3) * (D + 2);
        var ink = k % 11 === 0 ? '--heliconia' : k % 4 === 0 ? '--sap' : k % 3 ? '--buttress' : '--palm';
        kit.piece(leafBit.clone(), at(lx, 0.006 + (k % 5) * 0.0004, lz, hash(k, 2, 4) * 6, -Math.PI / 2), ink, false);
      }
      // Stones and the roots the path climbs over.
      for (k = 0; k < 18; k++) {
        var rock = new T.DodecahedronGeometry(0.16 + hash(k, 3, 1) * 0.22, 0); rock.scale(1, 0.5, 1);
        var rs = k % 2 ? 1 : -1;
        kit.piece(rock, at(rs * (PATH + 0.2 + hash(k, 3, 2) * 1.6), 0.05, -1 - hash(k, 3, 3) * (D - 4), k), '--understory', 0.02);
      }

      // A LEAF: a flattened, pointed blade with a midrib, used for the roof,
      // the ferns and the palms, so every leaf in the room is the same kind of
      // thing at a different size.
      function blade(len, wide) {
        var s = new T.Shape();
        s.moveTo(0, 0);
        s.quadraticCurveTo(wide, len * 0.35, 0, len);
        s.quadraticCurveTo(-wide, len * 0.35, 0, 0);
        var g = new T.ShapeGeometry(s, 4);
        g.rotateX(-Math.PI / 2);
        return g;
      }
      // A FERN: a fan of fronds arching out from one crown.
      function fern(x, z, size, seed) {
        var n = 7 + Math.floor(hash(seed, 1, 1) * 4);
        for (var f = 0; f < n; f++) {
          var a = f / n * Math.PI * 2 + hash(seed, f, 2);
          var g = blade(1.3 * size, 0.28 * size);
          kit.piece(g, M(at(x, 0.1, z, a), at(0, 0, 0, 0, 0.55 + hash(seed, f, 3) * 0.4)), f % 3 ? '--palm' : '--buttress', false);
        }
      }
      // A SMALL PALM: a thin stem and a crown of long drooping fronds.
      function palm(x, z, h, seed) {
        kit.cyl(0.05, 0.08, h, at(x, h / 2, z, 0, (hash(seed, 1, 1) - 0.5) * 0.12), '--buttress', 0.02, 6);
        for (var f = 0; f < 8; f++) {
          var g = blade(1.6, 0.32);
          kit.piece(g, M(at(x, h, z, f / 8 * Math.PI * 2 + hash(seed, f, 2)), at(0, 0, 0, 0, -0.35 - hash(seed, f, 3) * 0.3)), '--palm', false);
        }
      }
      // A BROMELIAD in a fork of a trunk: a tight rosette with a red heart.
      function bromeliad(x, y, z, seed) {
        for (var f = 0; f < 7; f++) {
          var g = blade(0.45, 0.1);
          kit.piece(g, M(at(x, y, z, f / 7 * Math.PI * 2 + hash(seed, f, 1)), at(0, 0, 0, 0, 0.9)), '--palm', false);
        }
        kit.piece(new T.ConeGeometry(0.05, 0.2, 6), at(x, y + 0.1, z), '--heliconia', 0.01);
      }

      // A TRUNK with buttress roots that taper as they leave it, ridges in its
      // bark, a collar of moss, a bromeliad or an orchid in it, and a vine
      // coming down out of the roof beside it.
      var fin = new T.Shape();
      fin.moveTo(0, 0); fin.lineTo(1, 0); fin.quadraticCurveTo(0.25, 0.25, 0, 1); fin.lineTo(0, 0);
      var finGeo = new T.ExtrudeGeometry(fin, { depth: 0.08, bevelEnabled: false });
      var tops = [];
      function trunk(x, z, r, n) {
        kit.cyl(r * 0.8, r, ROOF + 1, at(x, (ROOF + 1) / 2, z), '--buttress', 0.05, 14);
        tops.push({ x: x, z: z, r: r });
        for (var f = 0; f < 5; f++) {
          var a = f / 5 * Math.PI * 2 + hash(n, f, 1), fl = 0.8 + hash(n, f, 2) * 0.9, fh = 0.9 + hash(n, f, 3) * 1.0;
          var g = finGeo.clone(); g.scale(fl, fh, 1); g.translate(0, 0, -0.04);
          kit.piece(g, M(at(x, 0, z, a - Math.PI / 2), at(r * 0.7, 0, 0)), '--buttress', 0.02);
        }
        for (var b = 0; b < 6; b++) {
          var ba = b / 6 * Math.PI * 2 + hash(n, b, 4);
          box(0.05, ROOF * 0.7, 0.05, at(x + Math.sin(ba) * r * 0.92, ROOF * 0.38, z + Math.cos(ba) * r * 0.92), '--understory', false, false);
        }
        // Moss on the trunk's damp side, in soft cushions rather than a band.
        var ma = hash(n, 7, 3) * Math.PI * 2;
        for (var mo = 0; mo < 4; mo++) {
          var mg = new T.SphereGeometry(0.13 + hash(n, mo, 5) * 0.1, 7, 5); mg.scale(1, 1.8, 0.4);
          var mang = ma + (mo - 1.5) * 0.35;
          kit.piece(mg, at(x + Math.sin(mang) * r * 0.95, 0.9 + mo * 0.55 + hash(n, mo, 6) * 0.4, z + Math.cos(mang) * r * 0.95, mang), mo === 1 ? '--palm' : '--buttress', false);
        }
        if (hash(n, 9, 1) < 0.5) {
          var oy = 1.6 + hash(n, 9, 2) * 2.4, oa = hash(n, 9, 3) * Math.PI * 2;
          for (var p = 0; p < 5; p++) {
            kit.piece(new T.SphereGeometry(0.09, 8, 6), at(x + Math.sin(oa) * (r + 0.05) + (p - 2) * 0.08, oy + (p % 2) * 0.1, z + Math.cos(oa) * (r + 0.05)), '--orchid', 0.012);
          }
        } else {
          var bq = hash(n, 6, 1) * Math.PI * 2;
          bromeliad(x + Math.sin(bq) * r, 2.2 + hash(n, 6, 2) * 3, z + Math.cos(bq) * r, n);
        }
        if (hash(n, 8, 1) < 0.7) {
          var vx = x + (hash(n, 8, 2) - 0.5) * 1.4, vz = z + (hash(n, 8, 3) - 0.5) * 1.4, vy = 1.2 + hash(n, 8, 4) * 2.5;
          var pts = [];
          for (var q = 0; q <= 8; q++) pts.push(new T.Vector3(vx + Math.sin(q * 1.3 + n) * 0.15, ROOF - q / 8 * (ROOF - vy), vz + Math.cos(q * 0.9) * 0.12));
          kit.piece(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 24, 0.04, 5, false), new T.Matrix4(), '--palm', false);
        }
      }
      var n = 0;
      [-1, 1].forEach(function (s) {
        for (var z = -1.5; z > back + 2.5; z -= 2.6 + hash(s + 3, n, 1) * 1.6) {
          trunk(s * (3.6 + hash(n, 3, 1) * 3.2), z, 0.32 + hash(n, 3, 2) * 0.28, n++);
          if (hash(n, 4, 1) < 0.5) trunk(s * (6.5 + hash(n, 4, 2) * 1.5), z - 1.2, 0.5 + hash(n, 4, 3) * 0.3, n++);
        }
      });
      trunk(-3.4, back + 1.4, 0.55, 90);
      trunk(3.4, back + 1.4, 0.55, 91);
      // Layers of trunks further off, each fainter into the dark, so the
      // forest goes on past what the path shows.
      [9.5, 12.5, 15.5].forEach(function (d, layer) {
        [-1, 1].forEach(function (s) {
          for (var z = 2 - hash(layer, s + 2, 1) * 2; z > back - 6; z -= 2.2 + hash(layer, Math.round(z), 2) * 1.6) {
            kit.cyl(0.3, 0.4, ROOF + 2, at(s * (d + hash(layer, Math.round(z * 3), 3) * 2), (ROOF + 2) / 2, z), layer ? '--understory' : '--buttress', layer < 2 ? 0.03 : false, 8);
          }
        });
      });
      // LIANAS looping from trunk to trunk across the path, high up.
      for (k = 0; k + 1 < tops.length; k += 2) {
        var a1 = tops[k], a2 = tops[(k + 3) % tops.length];
        if (Math.abs(a1.z - a2.z) > 8) continue;
        var y1 = 5 + hash(k, 11, 1) * 2.5, y2 = 5 + hash(k, 11, 2) * 2.5, sag = 1.2 + hash(k, 11, 3) * 1.6, lp = [];
        for (var t = 0; t <= 16; t++) {
          var u = t / 16;
          lp.push(new T.Vector3(a1.x + (a2.x - a1.x) * u, y1 + (y2 - y1) * u - sag * 4 * u * (1 - u), a1.z + (a2.z - a1.z) * u));
        }
        kit.piece(new T.TubeGeometry(new T.CatmullRomCurve3(lp), 32, 0.05, 5, false), new T.Matrix4(), '--buttress', false);
      }
      // AERIAL ROOTS coming straight down out of the roof, thin, in bunches.
      for (k = 0; k < 24; k++) {
        var ax = (k % 2 ? 1 : -1) * (PATH + 0.6 + hash(k, 12, 1) * 4), az = -1 - hash(k, 12, 2) * (D - 4), ay = 1 + hash(k, 12, 3) * 3;
        for (var rr = 0; rr < 3; rr++) {
          kit.cyl(0.012, 0.012, ROOF - ay, at(ax + rr * 0.07, ay + (ROOF - ay) / 2, az + (rr % 2) * 0.05), '--buttress', false, 4);
        }
      }

      // THE ROOF: clumps of leaves all the way over, each a few dozen blades
      // tipped every way, the gaps the light comes through left open.
      for (k = 0; k < 110; k++) {
        var cx = -W / 2 - 2 + hash(k, 5, 1) * (W + 4), cz = 2 - hash(k, 5, 2) * (D + 4);
        if (gaps.some(function (g) { return Math.hypot(cx - g[0], cz - g[1]) < 2.4; })) continue;
        var cy = ROOF + hash(k, 5, 4) * 1.4, cs = 1.4 + hash(k, 5, 3) * 1.4;
        var dome = new T.SphereGeometry(cs, 8, 5); dome.scale(1, 0.38, 1);
        kit.piece(dome, at(cx, cy + 0.35, cz, k), k % 3 ? '--understory' : '--buttress', false);
        for (var lb = 0; lb < 14; lb++) {
          var g = blade(0.9 + hash(k, lb, 6) * 0.6, 0.26);
          var ang = hash(k, lb, 7) * Math.PI * 2, rad = hash(k, lb, 8) * cs;
          var lit = gaps.some(function (gp) { return Math.hypot(cx - gp[0], cz - gp[1]) < 4.6; });
          kit.piece(g, M(at(cx + Math.sin(ang) * rad, cy, cz + Math.cos(ang) * rad, ang), at(0, 0, 0, 0, -0.5 - hash(k, lb, 9) * 0.7)),
            lit && lb % 2 ? '--palm' : (lb % 3 ? '--buttress' : '--understory'), false);
        }
      }

      // THE UNDERSTOREY, kept off the path: ferns, small palms, broad low
      // leaves and heliconia with their bracts, overlapping the trunks' feet.
      for (k = 0; k < 30; k++) {
        var sd = k % 2 ? 1 : -1;
        fern(sd * (PATH + 0.7 + hash(k, 6, 1) * 4.5), -0.8 - hash(k, 6, 2) * (D - 3), 0.8 + hash(k, 6, 3) * 0.6, k);
      }
      for (k = 0; k < 10; k++) {
        var ps = k % 2 ? 1 : -1;
        palm(ps * (PATH + 2.4 + hash(k, 13, 1) * 3), -2 - hash(k, 13, 2) * (D - 6), 2.2 + hash(k, 13, 3) * 1.6, k);
      }
      for (k = 0; k < 40; k++) {
        var side = k % 2 ? 1 : -1, fx = side * (PATH + 0.8 + hash(k, 6, 7) * 5), fz = -0.5 - hash(k, 6, 8) * (D - 3);
        var fg = new T.SphereGeometry(1, 10, 6);
        fg.scale(0.22, 0.04, 0.9 + hash(k, 6, 9) * 0.5);
        kit.piece(fg, at(fx, 0.5 + hash(k, 6, 4) * 0.6, fz, hash(k, 6, 5) * 6, -0.5 - hash(k, 6, 6) * 0.4), '--palm', 0.02);
      }
      for (k = 0; k < 16; k++) {
        var hx = (k % 2 ? 1 : -1) * (PATH + 0.3 + hash(k, 7, 1) * 2), hz = -2 - hash(k, 7, 2) * (D - 6);
        kit.cyl(0.03, 0.03, 1.4, at(hx, 0.7, hz), '--palm', 0.01, 6);
        for (var b = 0; b < 5; b++) {
          kit.piece(new T.ConeGeometry(0.08, 0.3, 6), at(hx + (b % 2 ? 0.1 : -0.1), 1.45 - b * 0.16, hz, 0, 0, b % 2 ? -1.2 : 1.2), '--heliconia', 0.015);
        }
        var hl = blade(0.9, 0.22);
        kit.piece(hl, M(at(hx, 0.25, hz, hash(k, 7, 3) * 6), at(0, 0, 0, 0, -0.5)), '--palm', false);
      }

      // A LOG across the edge of the path, to sit on, mossed along its top
      // and with a shelf of the room's pale fungus-less moss at its end.
      kit.cyl(0.35, 0.38, 3.6, at(-2.6, 0.35, -11, 0.4, 0, Math.PI / 2), '--buttress', 0.04, 14);
      var moss = new T.SphereGeometry(1, 10, 6); moss.scale(1.1, 0.12, 0.26);
      kit.piece(moss, at(-2.5, 0.72, -10.95, 0.4 + Math.PI / 2 - Math.PI / 2), '--palm', false);
      kit.flat(new T.CircleGeometry(0.33, 14), at(-2.6 - 1.65, 0.35, -11 + 0.7, 0.4 - Math.PI / 2), '--sap');
      fern(-3.8, -12.2, 0.7, 77);

      // A LEAF-SHAPED BOARD: two pointed corners and two round ones, the
      // room's own screen shape, hung on vines from the roof.
      function leafBoard(m, lw, lh, rr, ink) {
        var shape = new T.Shape();
        shape.moveTo(-lw / 2, lh / 2);
        shape.lineTo(lw / 2 - rr, lh / 2); shape.quadraticCurveTo(lw / 2, lh / 2, lw / 2, lh / 2 - rr);
        shape.lineTo(lw / 2, -lh / 2);
        shape.lineTo(-lw / 2 + rr, -lh / 2); shape.quadraticCurveTo(-lw / 2, -lh / 2, -lw / 2, -lh / 2 + rr);
        shape.lineTo(-lw / 2, lh / 2);
        kit.piece(new T.ExtrudeGeometry(shape, { depth: 0.06, bevelEnabled: false }), m, ink || '--buttress', 0.03);
        var top = new T.Vector3(0, lh / 2, 0).applyMatrix4(m).y;
        [-1, 1].forEach(function (s) {
          var hang = new T.Vector3(s * (lw / 2 - 0.3), lh / 2, 0.03).applyMatrix4(m);
          kit.cyl(0.02, 0.02, ROOF - top, at(hang.x, top + (ROOF - top) / 2, hang.z), '--palm', false, 5);
        });
      }

      // THE ROOM'S OWN PAGE, in the biggest leaf between the two trunks.
      var sw = 4.6, sh = sw * 800 / 1180, sy = 0.7 + sh / 2;
      leafBoard(at(0, sy, back + 1.1), sw + 0.6, sh + 0.6, 0.9, '--palm');
      var frame = kit.screen(1180, 800, sw, at(0, sy, back + 1.22), 'The Jungle Room’s own page, in a leaf between two trunks');
      frame.style.borderRadius = '0 150px 0 150px';

      // THE GALLERIES, each on its own leaf along the path, alternately left
      // and right, facing the path, lifted off the page with its own screen
      // and its rack of leaves, and shown only while you stand at it.
      var stops = [];
      kit.wire(frame, 'rack.js');
      for (var gi = 0; gi < GALLERY_SLOTS; gi++) {
        var gs = gi % 2 ? 1 : -1, gz = -4.0 - gi * 2.7, gx = gs * (PATH + 0.8);
        var rot = gs < 0 ? LEFT : RIGHT, bw = 2.5, bh = 2.55;
        leafBoard(M(at(gx + gs * 0.06, 0, gz, rot), at(0, 0.7 + bh / 2, -0.04)), bw + 0.4, bh + 0.35, 0.6, '--understory');
        var zone = [-PATH - 0.1, PATH + 0.1, gz - 1.1, gz + 1.1];
        var it = kit.lift(frame, '.gallery', { n: gi, w: 720, h: 700, ww: bw, m: at(gx, 0.72, gz, rot), zone: zone });
        stops.push({ name: 'at the ' + (ORDINAL[gi] || 'next') + ' gallery of cams, on its leaf on the ' + (gs < 0 ? 'left' : 'right'),
                     where: 'at the ' + (ORDINAL[gi] || 'next') + ' gallery of cams, its screen at the top of its leaf',
                     x: -gs * 0.7, z: gz, yaw: rot, pitch: 0.16, frame: it.el });
      }

      // THE DOOR TO THE OTHER JUNGLE ROOM, at the foot of this one, quiet and
      // not hidden (§17): a low door set in a bank of earth off the path, a
      // hairline round it in the room's dimmest green and dark beyond, and an
      // ordinary place in the list, at full size, like every other.
      var DX = 3.05, DZ = back + 3.7, dm = at(DX, 0, DZ, -Math.PI / 2);
      box(1.3, 2.1, 1.7, M(dm, at(0, 1.05, -0.8)), '--understory', 0.03);
      kit.flat(new T.PlaneGeometry(0.9, 1.75), M(dm, at(0, 0.875, 0.06)), '--canopy');
      [-1, 1].forEach(function (s) { box(0.03, 1.78, 0.03, M(dm, at(s * 0.465, 0.89, 0.07)), '--buttress', false); });
      box(0.96, 0.03, 0.03, M(dm, at(0, 1.775, 0.07)), '--buttress', false);
      box(0.9, 0.012, 0.03, M(dm, at(0, 0.006, 0.2)), '--palm', false, false);
      fern(DX + 0.4, DZ + 1.2, 0.6, 88);

      return {
        start: { x: 0, z: 0.5, yaw: 0 },
        bounds: { x: [-PATH, PATH], z: [back + 4.3, 0.8] },
        stops: [
          { name: 'at the edge of the forest, under the roof of leaves', x: 0, z: 0.5, yaw: 0, pitch: 0.08 },
          { name: 'in a shaft of light, where the leaves part', x: 0.6, z: -8.05, yaw: 0.15, pitch: 0.22 },
          { name: 'by the log across the path', x: 1.7, z: -10.75, yaw: 1.4, pitch: -0.16 }
        ].concat(stops, [
          { name: 'in the clearing, with the room’s own page in a leaf between two trunks', x: 0, z: back + 6.1, yaw: 0, pitch: 0.12, page: kit.page, frame: frame },
          { name: 'the other jungle room', where: 'at a low door at the foot of the forest, a hairline round it: there is another jungle room', room: 'the Den', page: 'the-den.html', x: -1.4, z: DZ + 0.2, yaw: -Math.PI / 2, pitch: -0.02 }
        ])
      };
    }
  };
})();

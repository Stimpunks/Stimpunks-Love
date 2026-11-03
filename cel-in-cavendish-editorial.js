/* =============================================================================
   The Editorial Room, walked into on Cel Street, through its door off the hall
   at Cavendish Coworking. Ryan's ask, 2026-11-01: the rooms behind the doors.

   IT IS THE EDITORIAL ROOM'S WORLD AND SHARES NOTHING WITH THE HOUSE IT OPENS
   OFF (§73). The house is green daylight through canvas blinds; this is a
   designer's studio at night with every lamp in it switched off, and one
   light table in the middle of the floor, its glass lit from beneath. The
   table is the only light there is. The proofs laid out on the glass glow
   rather than being lit; round them the studio is dark and nothing in it
   catches anything but the table's light, from below: the underside of the
   desk lamp that is off, the drawers of the plan chest, the ceiling over the
   table where the light pools.

   THE ROOMS TO WATCH ARE ITS NEIGHBOURS ACROSS THE HALL. The Events Room is lit
   from ABOVE, one column down a hatch onto a table; the Operations Room is one
   caged lamp hung in the middle, striping everything. Here nothing is lit from
   above and nothing casts a stripe: the light comes up through the glass,
   evenly, and lands on the undersides of things. Chimera Obscura's table is
   lit from overhead with a picture thrown on it; this table has no picture,
   only proofs, and its light is its own. If a lamp in here is ever switched
   on, the room has become a desk.

   THE ONLY COLOURS ARE THE PRINTER'S. The colour bar and the registration
   target on the proofs are in the process inks, and they carry no word.

   WHAT IS ON THE TABLE AND THE WALLS IS THE PAGE'S OWN, lifted off it and never
   retyped: the proof itself, which says when the meeting is, laid on the glass
   with the hour on your own clock under it put there by the page's own
   coworking.js; the room's name and its line and what goes on the table on
   the far wall over the plan chest; why a light table on the right-hand wall;
   whose words by the door. The room's call and its radio stay on its page,
   which hangs on the left-hand wall, because they talk to the CB.

   NOTHING MOVES AT ANY SETTING. Every colour is one §73 declares, by name. It
   keeps nothing, sends nothing and fetches nothing; its page arrives through
   Cel Street's screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['cavendish-editorial.html'] = {
    name: 'The Editorial Room',
    from: 'cavendish-coworking.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var W = 8, NEAR = 0, FAR = -9, H = 3.2;               // the studio
      var X0 = -W / 2, X1 = W / 2;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;

      // THE LIGHT TABLE, tilted towards you like a drafting table, its glass
      // GW by GD, its middle at (0, TY, TZ), sloping at TH from level.
      var GW = 2.8, GD = 1.4, TY = 1.0, TZ = -4.4, TH = 0.38;
      var N = new T.Vector3(0, Math.cos(TH), Math.sin(TH));   // up out of the glass
      var V = new T.Vector3(0, -Math.sin(TH), Math.cos(TH));  // down the slope, towards you
      var C = new T.Vector3(0, TY, TZ);
      // A point on the glass, sx along it, sy down the slope, up off it by up.
      function on(sx, sy, up) {
        return C.clone().add(new T.Vector3(sx, 0, 0)).add(V.clone().multiplyScalar(sy)).add(N.clone().multiplyScalar(up || 0));
      }
      // Lying on the glass: a sheet (which faces you before it is laid down)
      // and a box or a column (whose top faces up before it is).
      function flat(p) { return at(p.x, p.y, p.z, 0, -Math.PI / 2 + TH); }
      function level(p) { return at(p.x, p.y, p.z, 0, TH); }

      // THE DARK. The studio is the background; the only light is the table's,
      // and it comes from below: a hemisphere whose ground is the table's halo
      // and whose sky is the dark, so every underside catches it and every top
      // stays dark, and three lamps just over the glass, which light what is
      // above it from underneath and nothing beyond the table's reach.
      kit.scene.background = kit.col('--ed-studio');
      kit.scene.add(new T.HemisphereLight(kit.col('--ed-studio'), kit.col('--ed-halo'), 2.2));
      [-1, 0, 1].forEach(function (s) {
        var p = on(s * 0.9, 0, 0.12);
        var l = new T.PointLight(kit.col('--ed-glow'), 5, 4.5, 1.4);
        l.position.copy(p);
        kit.scene.add(l);
      });

      // What gives off its own light rather than being lit: the glass, the
      // proofs on it, and the table's light pooled on the ceiling.
      function glow(geo, m, map, ink, alpha) {
        var mat = new T.MeshBasicMaterial({ side: T.DoubleSide, transparent: alpha < 1, depthWrite: alpha >= 1, opacity: alpha });
        if (map) mat.map = map; else mat.color = kit.col(ink);
        var mesh = new T.Mesh(geo, mat);
        mesh.matrixAutoUpdate = false;
        mesh.matrix.copy(m);
        mesh.matrixWorldNeedsUpdate = true;
        kit.scene.add(mesh);
      }

      // THE STUDIO: floor, ceiling and four walls, all in the dark, and the
      // door you came in by, shut.
      kit.piece(new T.PlaneGeometry(W, NEAR - FAR), at(0, 0, (NEAR + FAR) / 2, 0, -Math.PI / 2), '--ed-studio', false, false);
      kit.piece(new T.PlaneGeometry(W, NEAR - FAR), at(0, H, (NEAR + FAR) / 2, 0, Math.PI / 2), '--ed-studio', false, false);
      box(W, H, 0.2, at(0, H / 2, FAR - 0.1), '--ed-studio', false, false);
      box(0.2, H, NEAR - FAR, at(X0 - 0.1, H / 2, (NEAR + FAR) / 2), '--ed-studio', false, false);
      box(0.2, H, NEAR - FAR, at(X1 + 0.1, H / 2, (NEAR + FAR) / 2), '--ed-studio', false, false);
      box(W, H, 0.2, at(0, H / 2, NEAR + 0.1), '--ed-studio', false, false);
      box(1.0, 2.1, 0.06, at(0, 1.05, NEAR - 0.03), '--ed-desk', 0.01);
      box(1.16, 0.08, 0.1, at(0, 2.14, NEAR - 0.04), '--ed-halo', 0.008);
      cyl(0.035, 0.035, 0.16, at(0.36, 1.0, NEAR - 0.08, 0, Math.PI / 2), '--ed-halo', false, 10);

      // The table's light pooled on the ceiling over it, going to the dark.
      var pool = kit.paper(512, 512, function (c, w, h) {
        var g = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
        g.addColorStop(0, kit.ink('--ed-halo'));
        g.addColorStop(1, kit.ink('--ed-studio'));
        c.fillStyle = g; c.fillRect(0, 0, w, h);
      });
      glow(new T.PlaneGeometry(4.6, 3.6), at(0, H - 0.01, TZ - 0.2, 0, Math.PI / 2), pool, null, 1);

      // THE TABLE ITSELF: the desk it is set into, its legs, and the glass,
      // lit from beneath, which is the brightest thing in the room.
      box(GW + 0.24, 0.09, GD + 0.24, level(on(0, 0, -0.05)), '--ed-desk', 0.012);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (s) {
        var top = on(s[0] * (GW / 2 - 0.06), s[1] * (GD / 2 - 0.06), -0.1);
        box(0.08, top.y, 0.08, at(top.x, top.y / 2, top.z), '--ed-desk', 0.01);
      });
      var rail = on(0, GD / 2 - 0.06, -0.1);
      box(GW - 0.2, 0.05, 0.05, at(0, 0.24, rail.z), '--ed-desk', false);
      box(GW - 0.2, 0.05, 0.05, at(0, 0.24, on(0, -GD / 2 + 0.06, 0).z), '--ed-desk', false);
      glow(new T.PlaneGeometry(GW, GD), flat(on(0, 0, 0.002)), null, '--ed-glow', 1);

      // THE PROOFS on the glass: two spreads with their crop marks, a column
      // of grey lines for the type, a proofreader's mark in the margin, and on
      // one of them the colour bar and the registration target. They are paper
      // the light comes through, so they glow with the glass.
      function spread(mark) {
        return kit.paper(600, 300, function (c, w, h) {
          c.fillStyle = kit.ink('--ed-glow'); c.fillRect(0, 0, w, h);
          c.strokeStyle = kit.ink('--ed-ink'); c.lineWidth = 2;
          c.strokeRect(40, 40, w - 80, h - 80);
          c.beginPath(); c.moveTo(w / 2, 40); c.lineTo(w / 2, h - 40); c.stroke();
          // crop marks at every corner
          c.lineWidth = 1.5;
          [[40, 40], [w - 40, 40], [40, h - 40], [w - 40, h - 40]].forEach(function (p) {
            var sx = p[0] < w / 2 ? -1 : 1, sy = p[1] < h / 2 ? -1 : 1;
            c.beginPath(); c.moveTo(p[0] + sx * 8, p[1]); c.lineTo(p[0] + sx * 30, p[1]); c.stroke();
            c.beginPath(); c.moveTo(p[0], p[1] + sy * 8); c.lineTo(p[0], p[1] + sy * 30); c.stroke();
          });
          // a picture box on each page, crossed
          c.lineWidth = 2;
          c.strokeRect(62, 62, 110, 62);
          c.beginPath(); c.moveTo(62, 62); c.lineTo(172, 124); c.moveTo(172, 62); c.lineTo(62, 124); c.stroke();
          c.strokeRect(w / 2 + 120, 120, 110, 80);
          c.beginPath(); c.moveTo(w / 2 + 120, 120); c.lineTo(w / 2 + 230, 200); c.moveTo(w / 2 + 230, 120); c.lineTo(w / 2 + 120, 200); c.stroke();
          // the type, as lines
          c.lineWidth = 4;
          for (var i = 0; i < 6; i++) {
            c.beginPath(); c.moveTo(62, 146 + i * 14); c.lineTo(i === 5 ? 180 : 270, 146 + i * 14); c.stroke();
            c.beginPath(); c.moveTo(w / 2 + 22, 66 + i * 14); c.lineTo(w / 2 + (i === 5 ? 140 : 238), 66 + i * 14); c.stroke();
          }
          // a proofreader's mark in the margin, in the proof's magenta
          c.strokeStyle = kit.ink('--ed-process-m'); c.lineWidth = 3;
          c.beginPath(); c.moveTo(250, 176); c.lineTo(256, 166); c.lineTo(262, 176); c.stroke();
          c.beginPath(); c.moveTo(256, 166); c.lineTo(286, 26); c.stroke();
          if (mark) {
            // the colour bar, and a registration target
            ['--ed-process-c', '--ed-process-m', '--ed-process-y', '--ed-ink'].forEach(function (k, i) {
              c.fillStyle = kit.ink(k); c.fillRect(w / 2 - 50 + i * 26, 12, 24, 18);
            });
            c.strokeStyle = kit.ink('--ed-ink'); c.lineWidth = 1.5;
            c.beginPath(); c.arc(20, 20, 9, 0, Math.PI * 2); c.stroke();
            c.beginPath(); c.moveTo(6, 20); c.lineTo(34, 20); c.moveTo(20, 6); c.lineTo(20, 34); c.stroke();
          }
        });
      }
      glow(new T.PlaneGeometry(0.84, 0.42), flat(on(-0.92, -0.12, 0.006)), spread(true), null, 1);
      glow(new T.PlaneGeometry(0.84, 0.42), flat(on(0.92, 0.2, 0.006)), spread(false), null, 1);
      // A loupe left on the right-hand spread, its ring dark against the glass.
      var lp = on(1.12, 0.3, 0.02);
      kit.piece(new T.TorusGeometry(0.07, 0.014, 10, 28), at(lp.x, lp.y, lp.z, 0, -Math.PI / 2 + TH), '--ed-desk', false, false);
      var lh = on(1.12, 0.3, 0.03);
      cyl(0.012, 0.012, 0.2, at(lh.x + 0.12, lh.y, lh.z + 0.02, 0.6, Math.PI / 2 - TH, 0), '--ed-desk', false, 8);

      // THE ROOM'S OWN PAGE, on the left-hand wall in a frame of the desk's
      // dark, with its call and its radio on it.
      var pgw = 2.6, pgh = pgw * 800 / 1180, pgy = 0.5 + pgh / 2, PGZ = -4.6;
      box(0.05, pgh + 0.12, pgw + 0.12, at(X0 + 0.03, pgy, PGZ), '--ed-desk', 0.01);
      var page = kit.screen(1180, 800, pgw, at(X0 + 0.07, pgy, PGZ, LEFT), 'The Editorial Room’s own page, on the left-hand wall, with its call');

      // THE PROOF ITSELF, in the middle of the glass, lifted off the page, with
      // the hour on your own clock under it once coworking.js has run.
      var proof = kit.lift(page, '.ed-list', { w: 420, ww: 0.96, m: flat(on(0, 0.02, 0.012)) });

      // THE DESK LAMP, clamped to the back of the table and switched off: its
      // arm up and over the glass, its head turned down, caught underneath by
      // the table's light and nothing else.
      var clamp = on(GW / 2 - 0.2, -GD / 2 - 0.02, 0.02);
      box(0.1, 0.12, 0.1, at(clamp.x, clamp.y, clamp.z), '--ed-desk', 0.01);
      var elb = new T.Vector3(clamp.x + 0.15, clamp.y + 0.75, clamp.z - 0.1);
      var head = new T.Vector3(0.55, 1.95, TZ - 0.15);
      function rod(a, b) {
        var span = b.clone().sub(a), mid = a.clone().add(b).multiplyScalar(0.5);
        var g = new T.CylinderGeometry(0.02, 0.02, span.length(), 8);
        g.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), span.clone().normalize()));
        kit.piece(g, at(mid.x, mid.y, mid.z), '--ed-desk', 0.008, false);
      }
      rod(new T.Vector3(clamp.x, clamp.y + 0.06, clamp.z), elb);
      rod(elb, head);
      cyl(0.07, 0.17, 0.2, at(head.x, head.y - 0.1, head.z, 0, 0.25), '--ed-desk', 0.01, 18);

      // A DRAFTING STOOL, pushed back from the table to the left, nobody on it.
      var SX = -1.9, SZ = -3.0;
      cyl(0.22, 0.22, 0.06, at(SX, 0.72, SZ), '--ed-desk', 0.01, 18);
      cyl(0.03, 0.03, 0.7, at(SX, 0.36, SZ), '--ed-desk', false, 8);
      [0, 1, 2, 3].forEach(function (i) {
        var a = i * Math.PI / 2 + Math.PI / 4;
        var g = new T.CylinderGeometry(0.018, 0.018, 0.5, 6);
        g.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), new T.Vector3(Math.sin(a) * 0.5, -0.36, Math.cos(a) * 0.5).normalize()));
        kit.piece(g, at(SX + Math.sin(a) * 0.12, 0.2, SZ + Math.cos(a) * 0.12), '--ed-desk', false, false);
      });

      // THE PLAN CHEST against the far wall, its wide shallow drawers, every
      // handle catching a little of the table's light.
      var PZ = FAR + 0.45;
      box(3.2, 0.9, 0.8, at(0, 0.45, PZ), '--ed-desk', 0.012);
      for (var d = 0; d < 5; d++) {
        var dy = 0.12 + d * 0.16;
        box(3.0, 0.012, 0.01, at(0, dy + 0.07, PZ + 0.41), '--ed-halo', false, false);
        box(0.3, 0.03, 0.03, at(0, dy, PZ + 0.42), '--ed-halo', false, false);
      }

      // THE PAGE'S OTHER WORDS: its name and line and what goes on the table
      // over the plan chest; why a light table on the right-hand wall; whose
      // words by the door.
      var name = kit.lift(page, '.ed-head', { drop: '.ed-head__art', w: 760, ww: 2.0, m: at(-1.25, 2.0, FAR + 0.02) });
      var table = kit.lift(page, '.ed-part', { n: 0, drop: '.ed-list', w: 760, ww: 2.0, m: at(1.3, 1.95, FAR + 0.02) });
      var why = kit.lift(page, '.ed-part', { n: 3, w: 760, ww: 1.8, m: at(X1 - 0.02, 1.7, -5.2, RIGHT) });
      var whose = kit.lift(page, '.ed-credits', { w: 760, ww: 1.5, m: at(X1 - 0.02, 1.6, -1.6, RIGHT) });

      kit.wire(page, 'coworking.js');

      var front = on(0, GD / 2, 0);
      return {
        start: { x: 0, z: -0.9, yaw: 0 },
        bounds: { areas: [
          { x: [X0 + 0.6, X1 - 0.6], z: [front.z + 0.35, NEAR - 0.6] },
          { x: [X0 + 0.6, -GW / 2 - 0.45], z: [FAR + 1.35, NEAR - 0.6] },
          { x: [GW / 2 + 0.45, X1 - 0.6], z: [FAR + 1.35, NEAR - 0.6] },
          { x: [X0 + 0.6, X1 - 0.6], z: [FAR + 1.35, on(0, -GD / 2, 0).z - 0.5] }
        ] },
        stops: [
          { name: 'just inside the door, every lamp in the studio off and the light table glowing in the middle of the floor', x: 0, z: -0.9, yaw: 0, pitch: -0.08 },
          { name: 'at the light table: the proof on the glass, when the meeting is, the hour on your own clock under it', x: 0, z: front.z + 0.75, yaw: 0, pitch: -0.62, frame: proof.el },
          { name: 'beside the table: the spreads laid out on the glass with their crop marks, the colour bar, and a loupe left on them', x: 2.1, z: front.z + 0.55, yaw: 0.55, pitch: -0.5 },
          { name: 'under the desk lamp, switched off, its head caught from below by the table', x: 1.3, z: front.z + 0.5, yaw: 0.35, pitch: 0.32 },
          { name: 'at the plan chest by the far wall: the room’s name and its line', x: -1.25, z: FAR + 1.7, yaw: 0, pitch: 0.12, frame: name.el },
          { name: 'at the plan chest by the far wall: what goes on the table', x: 1.3, z: FAR + 1.7, yaw: 0, pitch: 0.1, frame: table.el },
          { name: 'at the right-hand wall: why a light table', x: X1 - 1.9, z: -5.2, yaw: RIGHT, pitch: 0.05, frame: why.el },
          { name: 'by the door, on the right: whose words these are', x: X1 - 1.7, z: -1.6, yaw: RIGHT, pitch: 0.04, frame: whose.el },
          { name: 'at the left-hand wall, with the room’s own page on it, its call and its radio', x: X0 + 2.2, z: PGZ, yaw: LEFT, pitch: 0.04, page: kit.page, frame: page }
        ]
      };
    }
  };
})();

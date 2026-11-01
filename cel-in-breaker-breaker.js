/* =============================================================================
   Breaker Breaker, walked into on Cel Street. Ryan's ask, 2026-10-31: down the
   street a room at a time.

   IT IS BREAKER BREAKER'S WORLD AND NOBODY ELSE'S (§125): night on the
   interstate from the driver's seat of a rig in the middle of a convoy, the
   picture on the room's own page stood up round you. EVERY LIGHT IS A MARKER
   LAMP, a point that shows where the edge of something is and lights nothing
   round it, each where the law puts it on a real rig: three in a row at the
   middle of the back as high as they go, one at each top corner, the tail
   lamps low, red on the back; amber along the sides and on the front, three in
   a row on the roof of every cab. Nothing else in the scene is lit: the lamps
   are drawn unlit by any light, in the room's amber and red, and no light in
   the scene casts anything. The sky is as dark as the road, so no shape stands
   against it: every rig is its lamps, dot to dot. That is what holds it off
   the Repeater, the street's other radio, where everything is a silhouette on
   a sky lit from below: if a glow ever comes up behind the convoy, it is this
   room that moves. Nothing blinks and nothing moves: no hazard flasher, no
   turn signal, and the convoy stands where it is drawn.

   WHAT IS IN THE PICTURE IS THE PAGE'S OWN WORDS FOR IT: the trailer ahead,
   the same red smaller and smaller up the lane as far as the front door; down
   the side of the rig in the next lane, amber along the bottom and the top;
   across the median, three amber dots at a time over the hedge, trucks coming
   the other way; three amber dots in the mirror, the back door; and on the
   dash, the radio, its red readout on 19. The cab you sit in is its dark
   frame and its dash.

   THE ROOM'S WORDS ARE ITS PAGE'S, lifted off it onto boards along the hard
   shoulder, never retyped, and the records are the page's own rack, every song
   its own button, played where it stands or put up on the screen in the cab
   by rack.js, the page's own script. Not a line of any song is in the scene.
   Every colour is one Breaker Breaker declares, by name. It keeps nothing,
   sends nothing and fetches nothing; its page arrives through Cel Street's
   screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['breaker-breaker.html'] = {
    name: 'Breaker Breaker',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2, BACK = Math.PI;

      // THE NIGHT, the road as dark as the sky. A very little of the dim in the
      // air, so the cab and the boards can be found by somebody walking; no
      // light in the scene casts anything.
      kit.scene.background = kit.col('--bkb-night');
      kit.scene.add(new T.HemisphereLight(kit.col('--bkb-dim'), kit.col('--bkb-night'), 0.32));

      // THE LAMPS, every one a point in amber or red, unlit by anything, with a
      // faint halo, drawn as two instanced sets per colour so a road full of
      // them is a handful of draws.
      var lamps = { amber: [], red: [] };
      var lamp = function (c, x, y, z, s) { lamps[c].push([x, y, z, s || 1]); };
      // Three in a row, centred at x, across a face at depth z (the law's
      // identification lamps), a little apart.
      var three = function (c, x, y, z, gap, s, alongZ) {
        for (var i = -1; i <= 1; i++) {
          if (alongZ) lamp(c, x, y, z + i * gap, s); else lamp(c, x + i * gap, y, z, s);
        }
      };
      // The back of a trailer at x, its back face at z: three red in a row at
      // the middle as high as they go, a red lamp at each top corner, the tail
      // lamps low down.
      var trailerBack = function (x, z, face) {
        var w = 1.26, s = 1;
        three('red', x, 4.02, z, 0.32, s);
        lamp('red', x - w, 4.0, z, s); lamp('red', x + w, 4.0, z, s);
        lamp('red', x - w + 0.18, 1.02, z, 1.3); lamp('red', x - w + 0.42, 1.02, z, 1.3);
        lamp('red', x + w - 0.18, 1.02, z, 1.3); lamp('red', x + w - 0.42, 1.02, z, 1.3);
      };
      // The side of a rig, running from z0 (its back) to z1 (its front) at x:
      // amber along the bottom and the top, red at the very back of the side.
      var rigSide = function (x, z0, z1) {
        var dir = z1 < z0 ? -1 : 1, len = Math.abs(z1 - z0), steps = Math.max(2, Math.round(len / 2.4));
        for (var i = 0; i <= steps; i++) {
          var zz = z0 + dir * (len * i / steps);
          var c = i === 0 ? 'red' : 'amber';
          lamp(c, x, 1.15, zz, 0.9);
          if (i % 2 === 0 || i === steps) lamp(c, x, 4.0, zz, 0.9);
        }
      };
      // The front of a cab coming the other way, or the back door's: three in
      // a row on its roof and one at each corner.
      var cabFront = function (x, z, alongZ) {
        three('amber', x, 3.86, z, 0.3, 1, alongZ);
        if (alongZ) { lamp('amber', x, 3.7, z - 1.1, 1); lamp('amber', x, 3.7, z + 1.1, 1); }
        else { lamp('amber', x - 1.1, 3.7, z, 1); lamp('amber', x + 1.1, 3.7, z, 1); }
      };

      // THE ROAD: our lane, the next lane over on the left, the hard shoulder
      // on the right, then the median's hedge on the far left and the lanes
      // coming the other way beyond it. Lane lines are faint and unlit.
      var LANE = 3.7, NEAR = 60, FAR = -240;
      box(30, 0.1, NEAR - FAR, at(-4, -0.05, (NEAR + FAR) / 2), '--bkb-night', false, false);
      var line = function (x, dashed) {
        if (!dashed) { kit.flat(new T.PlaneGeometry(0.14, NEAR - FAR), at(x, 0.005, (NEAR + FAR) / 2, 0, -Math.PI / 2), '--bkb-line'); return; }
        for (var z = NEAR; z > FAR; z -= 12) kit.flat(new T.PlaneGeometry(0.12, 3), at(x, 0.006, z - 1.5, 0, -Math.PI / 2), '--bkb-line');
      };
      line(LANE / 2, false);              // the edge of our lane, onto the shoulder
      line(-LANE / 2, true);              // between our lane and the next
      line(-LANE * 1.5, false);           // the edge by the median
      // The median's hedge, dark, low enough that the cabs coming the other
      // way show only their roof lamps over it.
      box(1.4, 1.6, NEAR - FAR, at(-LANE * 1.5 - 1.6, 0.8, (NEAR + FAR) / 2), '--bkb-line', false);
      // The verge beyond the shoulder, a little raised.
      box(6, 0.3, NEAR - FAR, at(LANE / 2 + 3.3 + 3, 0.15, (NEAR + FAR) / 2), '--bkb-line', false, false);

      // THE CONVOY UP OUR LANE: the trailer ahead, then the same red smaller
      // and smaller up the lane as far as the front door.
      [-10, -33, -58, -85, -114, -146, -180, -214].forEach(function (z, i) {
        trailerBack(0, z);
        // their sides, seen past the trailer ahead from the driver's seat: the
        // amber along the right-hand side of every rig up the lane.
        rigSide(1.3, z, z - 17);
        rigSide(-1.3, z, z - 17);
      });
      // The front door's cab, the last thing up the lane, its roof lamps.
      cabFront(0, -232, false);

      // THE RIG IN THE NEXT LANE, alongside and a little ahead: its trailer's
      // back face, amber down its side along the bottom and the top, and its
      // cab's roof lamps further up.
      var NX = -LANE;
      trailerBack(NX, -3.5);
      rigSide(NX + 1.3, -3.5, -20.5);
      cabFront(NX, -22.5, false);
      // Another further up the next lane.
      trailerBack(NX, -54);
      rigSide(NX + 1.3, -54, -71);

      // ACROSS THE MEDIAN: trucks coming the other way, three amber dots at a
      // time over the hedge.
      [[-11.2, 14], [-14.9, 4], [-11.2, -6], [-14.9, -14], [-11.2, -24], [-14.9, -46], [-11.2, -71], [-14.9, -97], [-11.2, -128], [-11.2, -164], [-14.9, -196]].forEach(function (p) {
        three('amber', p[0], 3.86, p[1], 0.3, 1);
      });

      // BEHIND: our own trailer, amber down both its sides and red on its back,
      // and the back door, the last rig in the convoy, its roof lamps.
      rigSide(1.3, 16, 1.6);
      rigSide(-1.3, 16, 1.6);
      trailerBack(0, 16.05);
      cabFront(0, 30, false);
      // Our own cab's roof lamps, seen from the shoulder.
      three('amber', 0, 2.62, -0.95, 0.3, 0.8);

      ['amber', 'red'].forEach(function (c) {
        var list = lamps[c], name = c === 'amber' ? '--bkb-amber' : '--bkb-red';
        var core = new T.InstancedMesh(new T.SphereGeometry(0.075, 10, 8), new T.MeshBasicMaterial({ color: kit.col(name) }), list.length);
        var halo = new T.InstancedMesh(new T.SphereGeometry(0.15, 10, 8), new T.MeshBasicMaterial({ color: kit.col(name), transparent: true, opacity: 0.16, depthWrite: false }), list.length);
        var m4 = new T.Matrix4();
        list.forEach(function (l, i) {
          m4.makeScale(l[3], l[3], l[3]); m4.setPosition(l[0], l[1], l[2]);
          core.setMatrixAt(i, m4); halo.setMatrixAt(i, m4);
        });
        [core, halo].forEach(function (mesh) {
          mesh.frustumCulled = false;
          mesh.matrixAutoUpdate = false;
          mesh.updateMatrix();
          kit.scene.add(mesh);
        });
      });

      // THE CAB YOU SIT IN, its dark frame: the dash, the windscreen's split
      // frame, the doors, the roof and the long hood out in front, none of it
      // lit and none of it outlined, there to be the edge of the picture: an
      // inked edge would be a line of light the law did not put there.
      var CW = 2.4;
      box(CW, 0.42, 0.7, at(0, 0.98, -0.8), '--bkb-line', false);
      box(CW, 0.08, 0.9, at(0, 1.2, -0.9), '--bkb-line', false);
      box(1.9, 0.5, 2.6, at(0, 1.05, -2.6), '--bkb-line', false);
      box(CW + 0.1, 0.1, 0.12, at(0, 2.32, -0.9), '--bkb-line', false);
      box(CW + 0.1, 0.1, 2.0, at(0, 2.42, 0.0), '--bkb-line', false);
      [-1, 1].forEach(function (e) {
        box(0.1, 1.15, 0.12, at(e * (CW / 2), 1.76, -0.88, 0, 0, e * 0.06), '--bkb-line', false);
        box(0.08, 0.72, 2.0, at(e * (CW / 2 + 0.04), 0.95, 0.05), '--bkb-line', false);
        box(0.1, 1.1, 0.12, at(e * (CW / 2 + 0.04), 1.86, 1.0), '--bkb-line', false);
      });
      box(0.06, 1.1, 0.08, at(0, 1.77, -0.9), '--bkb-line', false);
      box(CW, 0.1, 2.0, at(0, 0.6, 0.05), '--bkb-line', false, false);
      // The doors' windows are cut out of them: drawn as the night through a
      // frame, a lighter rail at the sill and the top.
      [-1, 1].forEach(function (e) {
        box(0.12, 0.08, 1.4, at(e * (CW / 2 + 0.06), 1.3, 0.0), '--bkb-dim', false);
      });

      // THE MIRRORS, out on both doors, and in the right-hand one three amber
      // dots: the back door.
      [-1, 1].forEach(function (e) {
        var mg = at(e * (CW / 2 + 0.42), 1.85, -0.75, -e * 0.55);
        box(0.06, 0.5, 0.06, M(mg, at(-e * 0.2, -0.3, 0, 0, 0, e * 0.9)), '--bkb-line', false);
        box(0.3, 0.52, 0.06, M(mg, at(0, 0, 0)), '--bkb-line', false);
        kit.flat(new T.PlaneGeometry(0.24, 0.44), M(mg, at(0, 0, 0.035)), '--bkb-glass');
        if (e > 0) [-0.05, 0, 0.05].forEach(function (dx) {
          kit.flat(new T.CircleGeometry(0.022, 12), M(mg, at(dx * 1.6, 0.12, 0.04)), '--bkb-amber');
        });
      });

      // THE RADIO ON THE DASH, its red readout on 19, its knobs and its
      // handset hung on the side: the one thing in the cab with a light of its
      // own, and that light is its readout.
      var CB = at(-0.22, 1.24, -0.6, 0, -0.18);
      box(0.6, 0.17, 0.3, M(CB, at(0, 0.085, 0)), '--bkb-line', false);
      // its faceplate's rim, the one dim edge in the cab, so it can be found
      [[0, 0.165, 0.6, 0.012], [0, 0.005, 0.6, 0.012]].forEach(function (r) {
        box(r[2], r[3], 0.012, M(CB, at(r[0], r[1], 0.152)), '--bkb-dim', false);
      });
      [-0.3, 0.3].forEach(function (x) { box(0.012, 0.17, 0.012, M(CB, at(x, 0.085, 0.152)), '--bkb-dim', false); });
      var read = kit.paper(128, 48, function (g, w, h) {
        g.fillStyle = kit.ink('--bkb-glass'); g.fillRect(0, 0, w, h);
        g.fillStyle = kit.ink('--bkb-red');
        g.font = '700 38px "Titillium Web", sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText('19', w / 2, h / 2 + 2);
      });
      var readout = new T.Mesh(new T.PlaneGeometry(0.16, 0.06), new T.MeshBasicMaterial({ map: read }));
      readout.matrixAutoUpdate = false;
      readout.matrix.copy(M(CB, at(-0.15, 0.09, 0.156)));
      readout.matrixWorldNeedsUpdate = true;
      kit.scene.add(readout);
      [0.04, 0.13, 0.22].forEach(function (dx) {
        cyl(0.026, 0.026, 0.03, M(CB, at(dx, 0.085, 0.165, 0, Math.PI / 2)), '--bkb-dim', false, 14);
      });
      // the handset, hung on its hook at the side, its cord coiled under it
      box(0.07, 0.13, 0.045, M(CB, at(0.38, 0.04, 0.08, 0, 0, 0.15)), '--bkb-line', false);
      box(0.012, 0.012, 0.012, M(CB, at(0.33, 0.12, 0.1)), '--bkb-dim', false);

      // THE ROOM'S OWN PAGE, on a board on the hard shoulder by the cab.
      var LANE2 = LANE / 2, BX = LANE2 + 3.35;
      // A page laid over the picture is not hidden by anything in front of it,
      // so the boards show only from the shoulder and the cab's screen only
      // from the cab: from the driver's seat the road is lamps and nothing else.
      var SHOULDER = [LANE2 + 0.3, BX, -41, 7], CAB = [-0.7, LANE2 + 1.3, -0.3, 0.5];
      var pw = 2.6, ph = pw * 800 / 1180, pg = at(BX, 0, -4.2, RIGHT);
      [-1, 1].forEach(function (e) { cyl(0.05, 0.05, 1.0 + ph, M(pg, at(e * (pw / 2 + 0.02), (1.0 + ph) / 2, -0.06)), '--bkb-line', false, 8); });
      box(pw + 0.14, ph + 0.14, 0.05, M(pg, at(0, 1.0 + ph / 2, -0.04)), '--bkb-line', false);
      var frame = kit.screen(1180, 800, pw, M(pg, at(0, 1.0 + ph / 2, 0.0)), 'Breaker Breaker’s own page, on a board on the hard shoulder', SHOULDER);

      // THE SCREEN IN THE CAB, on the right of the dash, facing the driver:
      // the page's own, which nothing shows on until a record is put on it.
      var SG = at(0.62, 1.25, -0.78, -0.62, -0.12);
      box(0.56, 0.03, 0.1, M(SG, at(0, -0.015, 0)), '--bkb-line', false);
      var scr = kit.lift(frame, '.bkb-screen', { w: 640, ww: 0.52, m: M(SG, at(0, 0.0, 0.0)), zone: CAB });
      kit.lift(frame, '.bkb-screen__now', { w: 640, ww: 0.52, m: M(SG, at(0, -0.1, 0.04)), zone: CAB });
      kit.lift(frame, '.bkb-screen__back', { w: 420, ww: 0.3, m: M(SG, at(0, -0.17, 0.05)), zone: CAB });

      // The driver's seat first, then the cab's own places.
      var stops = [
        { name: 'in the driver’s seat, in the middle of the convoy at night', x: -0.45, z: 0.1, yaw: 0, pitch: 0.02 },
        { name: 'looking down at the radio on the dash, its readout on 19', x: -0.3, z: -0.05, yaw: 0.05, pitch: -0.5 },
        { name: 'at the screen in the cab, on the right of the dash', x: 0.1, z: -0.05, yaw: -0.62, pitch: -0.22, frame: scr.el },
        { name: 'looking in the mirror, the back door’s three amber dots in it', x: -0.1, z: 0.1, yaw: -1.11, pitch: 0.1 },
        { name: 'looking across at the rig in the next lane, amber along the bottom and the top', x: -0.45, z: 0.1, yaw: 0.75, pitch: 0.08 },
        { name: 'looking across the median, three amber dots at a time over the hedge', x: -0.45, z: 0.1, yaw: 1.1, pitch: 0.1 },
        { name: 'at the room’s own page, on a board on the hard shoulder', x: BX - 2.6, z: -4.2, yaw: RIGHT, pitch: 0.08, page: kit.page, frame: frame }
      ];

      // ── THE BOARDS ALONG THE HARD SHOULDER, each a part of the page, on two
      // posts at the verge facing the road, up the lane in the page's order.
      var board = function (sel, n, z, w, h, ww, name, drop) {
        var g = at(BX, 0, z, RIGHT);
        [-1, 1].forEach(function (e) { cyl(0.05, 0.05, 1.0, M(g, at(e * (ww / 2 - 0.1), 0.5, -0.05)), '--bkb-line', false, 8); });
        box(ww + 0.12, 0.05, 0.08, M(g, at(0, 0.98, -0.06)), '--bkb-line', false);
        var o = { n: n, w: w, h: h, ww: ww, m: M(g, at(0, 1.0, 0)), zone: SHOULDER };
        if (drop) o.drop = drop;
        var it = kit.lift(frame, sel, o);
        stops.push({ name: name, x: BX - 2.0, z: z, yaw: RIGHT, pitch: 0.14, frame: it.el });
      };
      board('.bkb-lede', 0, -8.2, 900, 620, 1.9, 'at the board with what this room is');
      board('.bkb-part', 0, -11.4, 900, 620, 1.9, 'at the board on breaker, breaker');
      board('.bkb-part', 1, -14.6, 900, 620, 1.9, 'at the board on citizens');
      board('.bkb-part', 2, -17.8, 900, 680, 1.9, 'at the board on what our CB took from the citizens band');
      board('.bkb-part', 3, -21.0, 900, 680, 1.9, 'at the board on routing around the face to face');
      board('.bkb-part', 4, -24.6, 1100, 720, 2.3, 'at the slang board');
      board('.bkb-part', 5, -28.2, 900, 680, 1.9, 'at the board on the long haul');
      // The rack: its screen is the one in the cab, so the copy here leaves it out.
      board('.bkb-part', 6, -31.8, 1000, 760, 2.1, 'at the rack of records, every song its own button', '.bkb-screen, .bkb-screen__now, .bkb-screen__back');
      board('.bkb-part', 7, -35.4, 900, 620, 1.9, 'at the board on what this cab will not do');
      board('.bkb-part', 8, -38.6, 900, 620, 1.9, 'at the board on whose this is');

      kit.wire(frame, 'rack.js');

      stops.push({ name: 'standing on the hard shoulder, looking back at the cab and the back door', x: BX - 2.0, z: -7.0, yaw: BACK - 0.2, pitch: 0.04 });

      return {
        start: { x: -0.45, z: 0.1, yaw: 0, pitch: 0.02 },
        bounds: { areas: [
          { x: [-0.6, 0.6], z: [-0.25, 0.45] },
          { x: [0.3, LANE2 + 1.2], z: [-0.25, 0.45] },
          { x: [LANE2 + 0.4, BX - 1.2], z: [-40.5, 6] }
        ] },
        stops: stops
      };
    }
  };
})();

/* ==========================================================================
   cel-in-black-leather-lagoon.js — Black Leather Lagoon, walked into on Cel
   Street, down turning 01 off the Outskirts. Ryan's ask, 2026-11-01: the
   Outskirts' turnings, each its own world.

   A DRIVE-IN SCREEN STANDING OUT IN BLACK WATER, AND IT IS THE ONLY LIGHT
   (§35). You come down onto a strip of shore and a jetty that runs out over
   the water towards it; the screen stands far out on its legs with a HORIZON
   behind it and nothing else, and everything in the room is lit off it: a
   bright top edge on everything that faces it, its light lying on the water in
   broken dashes, still, and the reeds it shows to dark against it. Club
   Chronic, a flat wall of paper with no light in it, is the room this must not
   become: there is no paper here, no wall and no flyer, only distance.

   NOTHING FLICKERS, FLASHES OR ROLLS, at any setting, and nothing moves: the
   screen is lit and steady, the dashes on the water lie where they lie. The
   page's own words stand on the shore and along the jetty; the feature on the
   page's own drive-in stands at the jetty's end, and the rack of records is
   lifted whole, as the page has it, onto a board out in the shallows, so a
   record added to the page is there the next time the room is built. Every
   colour is one the Lagoon declares, by name. It keeps nothing, sends nothing
   and fetches nothing; its page arrives through Cel Street's screen(), and a
   facade lifted off it plays here as it does there, on the press.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 7, 374761393) ^ Math.imul(j + 29, 668265263) ^ Math.imul(k + 31, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['black-leather-lagoon.html'] = {
    name: 'Black Leather Lagoon',
    from: 'the-outskirts.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var SZ = -27, SW = 19, SH = 9.4, SY = 1.6;      // the screen: how far out, how big, how high its foot
      var JW = 2.2, JEND = -15;                       // the jetty: how wide, where it ends

      // THE NIGHT, black to the horizon, and the water a shade off black so
      // the horizon is there at all.
      kit.scene.background = kit.col('--lag-water');
      kit.scene.fog = new T.Fog(kit.col('--lag-water'), 46, 140);
      kit.scene.add(new T.HemisphereLight(kit.col('--lag-card'), kit.col('--lag-water'), 0.35));

      // THE SCREEN'S LIGHT, from out over the water, high and in front: every
      // top edge facing it bright, every shadow falling back towards you.
      var light = new T.DirectionalLight(kit.col('--lag-screen'), 2.4);
      light.position.set(0, SY + SH * 0.7, SZ);
      light.target.position.set(0, 0, 4);
      light.castShadow = true;
      light.shadow.mapSize.set(2048, 2048);
      var sc = light.shadow.camera; sc.left = -16; sc.right = 16; sc.top = 16; sc.bottom = -16; sc.near = 1; sc.far = 80;
      light.shadow.bias = -0.0006; light.shadow.normalBias = 0.03;
      kit.scene.add(light, light.target);

      // THE WATER, out to the horizon, and the shore you came down onto.
      box(400, 0.1, 420, at(0, -0.12, -180), '--lag-card', false, false);
      box(30, 0.3, 7, at(0, 0.02, 4.4), '--lag-water', false, false);

      // The screen itself: a lit face on a dark frame, standing on two legs
      // and a cross brace out in the water, with nothing behind it.
      box(SW + 0.6, SH + 0.6, 0.4, at(0, SY + SH / 2, SZ - 0.3), '--lag-water');
      kit.flat(new T.PlaneGeometry(SW, SH), at(0, SY + SH / 2, SZ - 0.08), '--lag-screen');
      [-SW / 2 + 1.4, SW / 2 - 1.4].forEach(function (x) {
        box(0.5, SY + 0.4, 0.5, at(x, (SY + 0.4) / 2 - 0.2, SZ - 0.3), '--lag-card');
        box(0.3, SY + 2.4, 0.3, at(x, (SY + 2.4) / 2 - 0.2, SZ - 1.6, 0, -0.55), '--lag-card');
      });
      box(SW - 2.2, 0.24, 0.24, at(0, SY * 0.55, SZ - 0.3), '--lag-card');

      // ITS LIGHT ON THE WATER, in broken dashes, still: wider the nearer they
      // lie, the way a lit rectangle breaks up on a dark ripple.
      for (var k = 0; k < 170; k++) {
        var f = hash(k, 1, 1), dz = SZ + 1.2 + f * (SZ * -1 - 1.2 + JEND + 1);
        var spread = (SW / 2) * (0.55 + 0.45 * (1 - (dz - SZ) / (JEND - SZ)));
        var dx = (hash(k, 1, 2) - 0.5) * 2 * spread;
        var len = 0.3 + hash(k, 1, 3) * 1.6;
        kit.flat(new T.PlaneGeometry(len, 0.18 + hash(k, 1, 4) * 0.34), at(dx, -0.06, dz, 0, -Math.PI / 2), '--lag-screen');
      }

      // THE AUDIENCE OF REEDS, standing in the shallows facing the screen,
      // dark against it, each with its lit top.
      var blade = new T.ConeGeometry(0.035, 1.3, 3);
      function reeds(cx, cz, n, seed) {
        for (var q = 0; q < n; q++) {
          var rx = cx + (hash(q, seed, 1) - 0.5) * 2.4, rz = cz + (hash(q, seed, 2) - 0.5) * 2.4;
          var tall = 0.8 + hash(q, seed, 3) * 0.7;
          for (var b = 0; b < 3; b++) {
            var g = blade.clone(); g.scale(1, tall, 1);
            kit.piece(g, at(rx + (b - 1) * 0.07, 0.55 * tall, rz + (b % 2) * 0.06, 0, (b - 1) * 0.18, (b - 1) * 0.2), '--lag-water', false);
          }
        }
      }
      [[-2.8, -19], [3.0, -21], [-6.5, -22], [6.8, -23.5], [-9.5, -20], [10, -18], [-9, 1.5], [9.4, 1], [-12, -11], [12, -14]].forEach(function (r, i) { reeds(r[0], r[1], 9, 10 + i); });

      // THE JETTY, out over the water from the shore, planks on piles, and a
      // wider end to stand at under the screen.
      box(JW, 0.14, -JEND + 1.2, at(0, 0.32, JEND / 2 + 0.6), '--lag-card');
      box(6.4, 0.14, 3.2, at(0, 0.32, JEND - 1.4), '--lag-card');
      for (var pz = 0.4; pz > JEND - 2.6; pz -= 2.4) {
        [-JW / 2 + 0.1, JW / 2 - 0.1].forEach(function (x) { kit.cyl(0.09, 0.09, 0.9, at(x, -0.1, pz), '--lag-water', false, 8); });
      }
      for (var pl = 0.9; pl > JEND - 2.9; pl -= 0.5) box(pl < JEND + 0.2 ? 6.4 : JW, 0.02, 0.04, at(0, 0.4, pl), '--lag-water', false, false);

      // A POST IN THE WATER WITH A BOARD ON IT, for each thing the page says,
      // faced the way it is asked to face; returns where the thing's foot goes,
      // and keeps where to stand to read it square on.
      var spots = [];
      function post(x, z, rot, w, h, foot, d) {
        var g = at(x, 0, z, rot);
        box(w + 0.16, h + 0.16, 0.08, M(g, at(0, foot + h / 2, -0.08)), '--lag-card');
        [-w / 2 + 0.2, w / 2 - 0.2].forEach(function (o) { box(0.12, foot + h * 0.4, 0.12, M(g, at(o, (foot + h * 0.4) / 2 - 0.1, -0.14)), '--lag-blood'); });
        // d is how far off to stand; on the jetty, as far as its edge allows.
        var sx = x + Math.sin(rot) * d, sz = z + Math.cos(rot) * d;
        if (sz < 1.4 && Math.abs(sx) > JW / 2 - 0.3) {
          var back = (Math.abs(x) - (JW / 2 - 0.3)) / Math.abs(Math.sin(rot));
          sx = x + Math.sin(rot) * back; sz = z + Math.cos(rot) * back;
        }
        spots.push({ x: sx, z: sz, yaw: rot });
        return M(g, at(0, foot, 0));
      }
      function at2(i, name, where, pitch, more) {
        var s = { name: name, where: where, x: spots[i].x, z: spots[i].z, yaw: spots[i].yaw, pitch: pitch };
        for (var k in more) s[k] = more[k];
        return s;
      }

      // THE ROOM'S OWN PAGE, on a board at the back of the shore, turned to
      // face the water.
      var pw = 2.6, ph = pw * 800 / 1180, py = 0.85 + ph / 2, prot = Math.PI + 0.6;
      var pg = at(4.4, 0.17, 4.9, prot);
      box(pw + 0.2, ph + 0.2, 0.08, M(pg, at(0, py, -0.06)), '--lag-card');
      [-pw / 2, pw / 2].forEach(function (x) { box(0.12, py + ph / 2, 0.12, M(pg, at(x, (py + ph / 2) / 2, -0.12)), '--lag-blood'); });
      var page = kit.screen(1180, 800, pw, M(pg, at(0, py, 0)), 'Black Leather Lagoon’s own page, on a board at the back of the shore');

      // THE PAGE'S OWN WORDS. The bill on the shore to the left, the
      // appreciation to the right, the door policy and the Napa show where the
      // jetty begins, the rack on its board out in the shallows, and the
      // feature on the page's own drive-in at the jetty's end.
      var bill = kit.lift(page, '.bill', { w: 680, ww: 2.4, m: post(-4.6, 1.2, 0.8, 2.4, 1.5, 0.75, 2.8) });
      var appr = kit.lift(page, '.appreciation', { w: 680, h: 600, ww: 2.4, m: post(4.6, 1.2, -0.8, 2.4, 2.1, 0.6, 2.8) });
      var tide = kit.lift(page, '.tide', { w: 680, h: 600, ww: 2.6, m: post(-4.4, -2.0, LEFT - 0.25, 2.6, 2.2, 0.55, 0) });
      var napa = kit.lift(page, '.napa', { w: 680, h: 600, ww: 2.6, m: post(4.4, -3.4, RIGHT + 0.25, 2.6, 2.2, 0.55, 0) });
      var pin = kit.lift(page, '.posts__intro', { w: 640, ww: 2.3, m: post(-4.6, -6.6, LEFT - 0.2, 2.3, 1.4, 0.6, 0) });
      var rack = kit.lift(page, '.posts', { w: 700, h: 780, ww: 3.2, m: post(5.0, -8.4, RIGHT + 0.2, 3.2, 3.6, 0.5, 0) });
      var fur = kit.lift(page, '.further', { w: 680, h: 520, ww: 2.4, m: post(-4.6, -11.0, LEFT - 0.2, 2.4, 1.8, 0.55, 0) });
      var din = kit.lift(page, '.drivein__intro', { w: 640, ww: 2.2, m: post(-4.4, JEND - 1.2, LEFT - 0.45, 2.2, 1.4, 0.6, 0) });
      var feature = kit.lift(page, '.drivein', { w: 560, ww: 1.5, m: post(1.6, JEND - 2.4, -0.25, 1.5, 0.9, 0.42, 2.0) });

      var stops = [
        { name: 'on the shore, the jetty going out over the black water to the screen', where: 'on the shore, looking out at the screen', x: 0, z: 3.2, yaw: 0, pitch: 0.06 },
        at2(0, 'at the bill on the shore, to the left: the Outskirts presents', 'at the bill on the shore', 0.08, { frame: bill.el }),
        at2(1, 'at the board on the shore to the right: an appreciation of The Cramps', 'at the appreciation on the shore', 0.1, { frame: appr.el }),
        at2(2, 'where the jetty begins, on the left: the door policy at the water’s edge', 'at the door policy', 0.08, { frame: tide.el }),
        at2(3, 'on the jetty, on the right: the Napa show, and how it usually gets told', 'at the Napa show', 0.08, { frame: napa.el }),
        at2(4, 'on the jetty, on the left: how the rack was put on its posts', 'at the rack’s own note', 0.04, { frame: pin.el }),
        at2(5, 'on the jetty, on the right: the rack of records out in the shallows', 'at the rack', 0.14, { frame: rack.el }),
        at2(6, 'on the jetty, on the left: where the facts on this page came from', 'at where the facts came from', 0.06, { frame: fur.el }),
        at2(8, 'at the jetty’s end, the feature on the page’s own drive-in, the screen out over the water behind it', 'at the feature, under the screen', 0.08, { frame: feature.el }),
        at2(7, 'at the jetty’s end, on the left: what is on the screen', 'at what is on the screen', 0.06, { frame: din.el }),
        { name: 'at the jetty’s end, looking up at the screen and its light on the water', where: 'under the screen', x: 0, z: JEND - 0.4, yaw: 0, pitch: 0.24 },
        { name: 'back on the shore, at the board with the room’s own page on it', where: 'at the room’s own page', x: 4.4 + Math.sin(prot) * 2.4, z: 4.9 + Math.cos(prot) * 2.4, yaw: prot, pitch: 0.06, page: kit.page, frame: page }
      ];

      return {
        start: { x: 0, z: 3.2, yaw: 0 },
        bounds: { x: [-JW / 2 + 0.25, JW / 2 - 0.25], z: [JEND - 2.4, 4.4],
                  areas: [{ x: [-5, 5], z: [1.4, 4.4] }, { x: [-JW / 2 + 0.25, JW / 2 - 0.25], z: [JEND + 0.4, 1.6] }, { x: [-2.8, 2.8], z: [JEND - 2.4, JEND + 0.6] }] },
        stops: stops
      };
    }
  };
})();

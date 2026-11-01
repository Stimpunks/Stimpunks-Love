/* =============================================================================
   The Events Room, walked into on Cel Street, through its door off Cavendish
   Coworking's hall. Ryan's ask, 2026-11-01: the rooms behind the doors.

   IT IS THE ROOM'S OWN WORLD AND SHARES NOTHING WITH THE HOUSE IT OPENS OFF
   (§71). The house is green daylight through canvas blinds, every door shut;
   this is a lighthouse keeper's watch room at dusk, round, whitewashed, the
   round room under the lantern. The lantern is overhead and out of sight: its
   steady light comes down through the round hatch in the ceiling as one column
   onto the chart table, and nothing else in the room is lit. The whitewash goes
   to slate away from it, one small window shows the sea at dusk, the ladder
   goes up into the light, and the weight on its chain by the wall is what turns
   the lens above. Nobody is drawn.

   THE COLUMN IS THE ROOM. If it ever goes, or the wall warms to cream, this has
   become the Mopery with a timetable: so there is one light, from above, and it
   lands on the table and nowhere else.

   NOTHING MOVES AT ANY SETTING. A real light turns, and this one is drawn
   standing still: the room is about a thing you can count on. The weight hangs;
   the screen on the wall plays only what somebody presses.

   THE WORDS ARE THE PAGE'S OWN, lifted off it and never retyped: the light list
   standing in the column on the chart table, the hour on your own clock put
   under each light by the page's own coworking.js; the screen on the wall and
   its rack, played as on the page through love-embed.js and rack.js; why a
   watch room; whose words. The room's call and its radio stay on its page,
   which hangs on the wall, because they talk to the CB.

   Every colour is one §71 declares, by name. It keeps nothing, sends nothing
   and fetches nothing; its page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['cavendish-events.html'] = {
    name: 'The Events Room',
    from: 'cavendish-coworking.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var R = 4.6, H = 3.6, CX = 0, CZ = -5.0;      // the round room: radius, height, middle
      var HATCH = 0.85, TY = 0.9;                   // the hatch's radius, the chart table's height

      // A point on the circle at a turn a from the front (a = 0 is the lift,
      // a = PI the far side), r from the middle; and the turn that faces the
      // wall there from inside, for a thing hung on it and for somebody
      // looking at it.
      function on(a, r) { return { x: CX + Math.sin(a) * r, z: CZ + Math.cos(a) * r }; }
      function facing(a) { return a + Math.PI; }
      function hang(a, y, r) { var p = on(a, r || R - 0.35); return at(p.x, y, p.z, facing(a)); }

      // THE DARK OF THE ROOM, and the one light. A little dusk from the window
      // and nothing more everywhere else; the lamp's light straight down the
      // hatch onto the chart table, hard enough to throw the table's shadow on
      // the floor.
      kit.scene.background = kit.col('--wr-stone');
      kit.scene.add(new T.HemisphereLight(kit.col('--wr-dusk'), kit.col('--wr-stone'), 2.6));
      var lamp = new T.SpotLight(kit.col('--wr-lit'), 42, 12, 0.36, 0.25, 1.0);
      lamp.position.set(CX, H + 0.55, CZ);
      lamp.target.position.set(CX, TY, CZ);
      lamp.castShadow = true;
      lamp.shadow.mapSize.set(1024, 1024);
      lamp.shadow.bias = -0.0006; lamp.shadow.normalBias = 0.02;
      kit.scene.add(lamp, lamp.target);

      // An unlit sheet: what glows of itself rather than being lit by anything,
      // the lamp's light in the hatch, the column in the air, and the window.
      function glow(geo, m, map, ink, alpha) {
        var mat = new T.MeshBasicMaterial({ side: T.DoubleSide, transparent: true, depthWrite: false, opacity: alpha });
        if (map) mat.map = map; else mat.color = kit.col(ink);
        var mesh = new T.Mesh(geo, mat);
        mesh.matrixAutoUpdate = false;
        mesh.matrix.copy(m);
        mesh.matrixWorldNeedsUpdate = true;
        kit.scene.add(mesh);
      }

      // THE FLOOR, stone, and the ceiling, with the round hatch in the middle of
      // it and the lamp's light filling the hatch.
      kit.piece(new T.CircleGeometry(R + 0.3, 48), at(CX, 0, CZ, 0, -Math.PI / 2), '--wr-stone', false, false);
      kit.piece(new T.RingGeometry(HATCH, R + 0.3, 48), at(CX, H, CZ, 0, Math.PI / 2), '--wr-stone', false, false);
      for (var k = 0; k < 10; k++) {
        var ka = k / 10 * Math.PI * 2, kp = on(ka, HATCH + 0.06);
        box(2 * (HATCH + 0.06) * Math.tan(Math.PI / 10) + 0.02, 0.5, 0.1, at(kp.x, H + 0.25, kp.z, ka), '--wr-lime', false, false);
      }
      glow(new T.CircleGeometry(HATCH + 0.1, 40), at(CX, H + 0.5, CZ, 0, Math.PI / 2), null, '--wr-lit', 1);

      // THE CURVED WALL, whitewash, panel by panel round the room, with the
      // lift's doors in it at the front, where you came in.
      var N = 28, pw = 2 * R * Math.tan(Math.PI / N) + 0.04;
      for (var i = 0; i < N; i++) {
        var a = i / N * Math.PI * 2, p = on(a, R);
        if (i === 0) {
          // The lift's way in: a lintel over it, and the doors, shut.
          box(pw, H - 2.2, 0.25, at(p.x, 2.2 + (H - 2.2) / 2, p.z, a), '--wr-lime');
          box(0.1, 2.2, 0.32, at(p.x - 0.5, 1.1, p.z, a), '--wr-rail', 0.01);
          box(0.1, 2.2, 0.32, at(p.x + 0.5, 1.1, p.z, a), '--wr-rail', 0.01);
          box(1.1, 0.12, 0.32, at(p.x, 2.2, p.z, a), '--wr-rail', 0.01);
          box(0.44, 2.1, 0.06, at(p.x - 0.23, 1.05, p.z - 0.12, a), '--wr-dusk', 0.008);
          box(0.44, 2.1, 0.06, at(p.x + 0.23, 1.05, p.z - 0.12, a), '--wr-dusk', 0.008);
          continue;
        }
        box(pw, H, 0.25, at(p.x, H / 2, p.z, a), '--wr-lime');
      }
      // The skirting where the wall meets the floor.
      for (i = 1; i < N; i++) {
        var sa = i / N * Math.PI * 2, sp = on(sa, R - 0.15);
        box(pw, 0.14, 0.05, at(sp.x, 0.07, sp.z, sa), '--wr-rail', false, false);
      }

      // THE COLUMN: the lamp's light in the air, down from the hatch to the
      // chart table, a little wider at the foot, and nothing else lit.
      var colH = H - TY;
      var colGeo = new T.CylinderGeometry(HATCH - 0.05, 1.15, colH, 40, 1, true);
      glow(colGeo, at(CX, TY + colH / 2, CZ), null, '--wr-lit', 0.09);
      glow(new T.CylinderGeometry(0.45, 0.7, colH, 32, 1, true), at(CX, TY + colH / 2, CZ), null, '--wr-lit', 0.06);

      // THE CHART TABLE, in the column, its top lit; and the light list
      // standing on it, the page's own, in the column's light.
      var TW = 2.0, TD = 1.1, TZ = CZ + 0.15;
      box(TW, 0.07, TD, at(CX, TY - 0.035, TZ), '--wr-lit', 0.012);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (s) {
        box(0.08, TY - 0.07, 0.08, at(CX + s[0] * (TW / 2 - 0.1), (TY - 0.07) / 2, TZ + s[1] * (TD / 2 - 0.1)), '--wr-rail', 0.01);
      });
      box(TW - 0.2, 0.05, 0.05, at(CX, 0.22, TZ), '--wr-rail', false);
      // A board along its far edge for the list to stand on.
      box(1.7, 0.06, 0.12, at(CX, TY + 0.03, TZ - TD / 2 + 0.12), '--wr-rail', 0.008);

      // THE LADDER, up from the floor behind the table into the hatch and the
      // light.
      var LB = 1.25, lean = Math.atan2(LB, H), LL = Math.sqrt(H * H + LB * LB);
      var LZ = CZ - HATCH + 0.12 - LB / 2;
      [-0.26, 0.26].forEach(function (x) { cyl(0.035, 0.035, LL, at(CX + x, H / 2, LZ, 0, lean), '--wr-rail', 0.008, 8); });
      for (var r = 1; r < 12; r++) {
        var t = r / 12, ry = t * H, rz = LZ - LB / 2 + t * LB;
        box(0.52, 0.035, 0.035, at(CX, ry, rz), '--wr-rail', 0.006);
      }

      // THE WINDOW, small and arched, with the sea at dusk in it and one far
      // light on the horizon: it lights nothing in here.
      var WA = 0.72 * Math.PI, wp = on(WA, R - 0.14);
      var sea = kit.paper(256, 360, function (c, w, h) {
        c.clearRect(0, 0, w, h);
        c.beginPath();
        c.moveTo(0, h); c.lineTo(0, w / 2); c.arc(w / 2, w / 2, w / 2, Math.PI, 0); c.lineTo(w, h); c.closePath();
        c.save(); c.clip();
        c.fillStyle = kit.ink('--wr-dusk'); c.fillRect(0, 0, w, h * 0.62);
        c.fillStyle = kit.ink('--wr-sea'); c.fillRect(0, h * 0.62, w, h * 0.38);
        c.fillStyle = kit.ink('--wr-lit'); c.beginPath(); c.arc(w * 0.68, h * 0.62 - 3, 4, 0, Math.PI * 2); c.fill();
        c.restore();
        c.strokeStyle = kit.ink('--wr-rail'); c.lineWidth = 14;
        c.beginPath();
        c.moveTo(7, h - 7); c.lineTo(7, w / 2); c.arc(w / 2, w / 2, w / 2 - 7, Math.PI, 0); c.lineTo(w - 7, h - 7); c.closePath(); c.stroke();
        c.lineWidth = 9; c.beginPath(); c.moveTo(w / 2, 7); c.lineTo(w / 2, h - 7); c.stroke();
      });
      glow(new T.PlaneGeometry(0.8, 1.12), at(wp.x, 1.75, wp.z, facing(WA)), sea, null, 1);
      var sill = on(WA, R - 0.25);
      box(0.95, 0.06, 0.2, at(sill.x, 1.17, sill.z, WA), '--wr-rail', 0.008);

      // THE WEIGHT that turns the lens, on its chain down from the ceiling by
      // the wall: hanging still.
      var GA = -0.66 * Math.PI, gp = on(GA, R - 0.45);
      cyl(0.012, 0.012, H - 1.9, at(gp.x, 1.9 + (H - 1.9) / 2, gp.z), '--wr-brass', false, 6);
      cyl(0.17, 0.17, 0.62, at(gp.x, 1.6, gp.z), '--wr-brass', 0.012, 20);
      cyl(0.06, 0.06, 0.05, at(gp.x, 1.93, gp.z), '--wr-brass', false, 10);

      // THE ROOM'S OWN PAGE, on the left-hand wall in a frame of the ladder's
      // rail, with its call and its radio on it.
      var PA = -Math.PI / 2, pgw = 2.4, pgh = pgw * 800 / 1180, pgy = 0.6 + pgh / 2;
      var pp = on(PA, R - 0.2);
      box(pgw + 0.12, pgh + 0.12, 0.05, at(pp.x, pgy, pp.z, PA), '--wr-rail', 0.01);
      var page = kit.screen(1180, 800, pgw, hang(PA, pgy, R - 0.26), 'The Events Room’s own page, on the left-hand wall, with its call');
      var list = kit.lift(page, '.wr-part', { n: 0, w: 760, h: 760, ww: 1.6, m: at(CX, TY + 0.06, TZ - TD / 2 + 0.14) });

      // THE SCREEN ON THE WALL, on the whitewash to the right where some of the
      // light reaches it, giving off nothing until somebody presses it; what is
      // on it under it, the way back to the programme under that; and the rack
      // round the curve towards the lift.
      var SA = Math.PI / 2;
      var screen = kit.lift(page, '.wr-screen', { w: 860, ww: 2.2, m: hang(SA, 1.2) });
      kit.lift(page, '.wr-screen__now', { w: 760, ww: 2.0, m: hang(SA, 0.88) });
      kit.lift(page, '.wr-screen__back', { w: 640, ww: 1.6, m: hang(SA, 0.55) });
      var KA = 0.24 * Math.PI;
      var rack = kit.lift(page, '.wr-rack', { w: 860, h: 900, ww: 1.9, m: hang(KA, 0.35) });

      // THE PAGE'S OTHER WORDS round the curve: the room's name and its line by
      // the lift, why a watch room past the weight, and whose words by the
      // window.
      var NA = -0.24 * Math.PI;
      var head = kit.lift(page, '.wr-head', { drop: '.wr-head__art', w: 760, ww: 1.6, m: hang(NA, 1.4) });
      kit.lift(page, '.lede', { w: 760, ww: 1.6, m: hang(NA, 0.85) });
      var YA = -0.88 * Math.PI, CA = 0.92 * Math.PI;
      var why = kit.lift(page, '.wr-part', { n: 3, w: 760, ww: 1.5, m: hang(YA, 0.9) });
      var whose = kit.lift(page, '.wr-part', { n: 4, w: 760, ww: 1.4, m: hang(CA, 0.9) });

      kit.wire(page, 'rack.js');
      kit.wire(page, 'coworking.js');

      function stand(a, r) { var s = on(a, r); return { x: s.x, z: s.z, yaw: facing(a) }; }
      function stop(name, a, r, pitch, more) {
        var s = stand(a, r), o = { name: name, x: s.x, z: s.z, yaw: s.yaw, pitch: pitch || 0.05 };
        for (var key in more) o[key] = more[key];
        return o;
      }
      return {
        start: { x: CX, z: CZ + 3.3, yaw: 0 },
        bounds: { areas: [{ x: [CX - 3.0, CX + 3.0], z: [CZ - 2.3, CZ + 2.3] }, { x: [CX - 2.2, CX + 2.2], z: [CZ - 3.2, CZ + 3.3] }] },
        stops: [
          { name: 'just out of the lift, the column of light falling through the hatch onto the chart table', x: CX, z: CZ + 3.3, yaw: 0, pitch: 0.1 },
          { name: 'at the chart table, in the column: the light list, the hour on your own clock under each light', x: CX, z: TZ + 1.9, yaw: 0, pitch: -0.08, frame: list.el },
          { name: 'at the foot of the ladder, looking up through the hatch into the lamp’s light', x: CX + 0.9, z: LZ - 0.4, yaw: -0.5, pitch: 0.95 },
          stop('at the window, small and arched: the sea at dusk, and a far light on the horizon', WA, 2.4, 0.1),
          stop('at the screen on the wall, giving off nothing until somebody presses it', SA, 1.6, 0.05, { frame: screen.el }),
          stop('at the rack under the curve towards the lift: something to watch together', KA, 2.0, -0.05, { frame: rack.el }),
          stop('at the weight on its chain by the wall, which turns the lens above, hanging still', GA, 2.4, 0.05),
          stop('past the weight: why a watch room', YA, 2.4, 0.05, { frame: why.el }),
          stop('by the window: whose words these are', CA, 2.4, 0.05, { frame: whose.el }),
          stop('by the lift: the room’s name and its line', NA, 2.4, 0.1, { frame: head.el }),
          stop('at the left-hand wall, with the room’s own page on it, its call and its radio', PA, 2.0, 0.05, { page: kit.page, frame: page })
        ]
      };
    }
  };
})();

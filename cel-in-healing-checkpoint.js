/* =============================================================================
   The Healing Checkpoint, walked into on Cel Street. Ryan's ask, 2026-10-31:
   back on the street, working down it a room at a time.

   IT IS ROOM 429 AND NOBODY ELSE'S (§31): a save room with a spring in the
   floor, and THE LIGHT COMES UP OUT OF THE FLOOR, which no other room on the
   street does. So every top surface here is dark, every underside carries a
   rim, the shadows run up the walls and the room gets lighter towards your
   feet: the scene's sky is the room's darkest dark and its ground is the
   spring's own pale light, and the one lamp in it is the water. There is no
   flame anywhere, no warm ground (--hc-clay, the room's one warm value, is an
   ink on a few small things and never a surface), and no straight edge: the
   chamber is round under a dome, the bed is soft, the stair is rounded.

   THE BED IS BUILT, in its arched alcove at the back, and it is not a reward:
   nothing here counts, nothing is stored, and nothing in this file says what
   rest is for. The room's own words are its page's panels, lifted off it by
   the kit and standing round the curved wall: the appreciation of rest, what a
   healing checkpoint is, why the room is numbered 429, the Retry-After slips
   (open and read; the copy button stays on the page, where its script is), the
   house rules and the way out. The back stair goes down to the Adventurer's
   Guild, as the guild's goes up here.

   NOTHING MOVES, and nothing makes a sound. Every colour is one the room
   declares, by name. It keeps nothing, sends nothing and fetches nothing; its
   page arrives through Cel Street's screen(). tools/make-cel-street.py holds
   each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['healing-checkpoint.html'] = {
    name: 'The Healing Checkpoint',
    build: function (kit) {
      var T = kit.THREE, at = kit.at;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var R = 6.5, CZ = -7, WALL = 2.6, DOME = 4.6;

      // Where a thing on the round wall stands, a turns from the back of the
      // room (0, the alcove) round to the door (π); it faces the middle.
      function onWall(a, r, y) { return at(Math.sin(a) * r, y, CZ - Math.cos(a) * r, -a); }
      function stand(a, r) { return { x: Math.sin(a) * r, z: CZ - Math.cos(a) * r, yaw: -a }; }

      // THE LIGHT IS IN THE FLOOR. From above, the darkest dark; from below,
      // the spring's pale light, so every underside is rimmed and every top is
      // dark. The one lamp is the water itself, low in the middle, which is
      // what makes the room lighter towards your feet.
      kit.scene.background = kit.col('--hc-vault');
      kit.scene.add(new T.HemisphereLight(kit.col('--hc-vault'), kit.col('--hc-glim'), 3.2));
      var spring = new T.PointLight(kit.col('--hc-glim'), 22, 16, 1.0);
      spring.position.set(0, 0.12, CZ);
      kit.scene.add(spring);

      // THE CHAMBER: one round wall going up into a dome, no corner in it.
      // A lathe drawn from the top down, so its faces look inward.
      var prof = [];
      for (var i = 0; i <= 10; i++) {
        var t = i / 10;
        prof.push(new T.Vector2(Math.max(0.01, R * Math.sin(t * Math.PI / 2)), WALL + (DOME - WALL) * Math.cos(t * Math.PI / 2)));
      }
      prof.push(new T.Vector2(R, 0));
      kit.piece(new T.LatheGeometry(prof, 64), at(0, 0, CZ), '--hc-chamber', false);
      // The floor, and a soft ring where it meets the wall.
      kit.piece(new T.CircleGeometry(R, 64), at(0, 0, CZ, 0, -Math.PI / 2), '--hc-lit', false);
      kit.piece(new T.TorusGeometry(R - 0.08, 0.1, 8, 64), at(0, 0.02, CZ, 0, Math.PI / 2), '--hc-lit', false);

      // THE SPRING in the middle of the floor: a rounded lip, the deep water,
      // and the pale light coming up out of it.
      kit.piece(new T.TorusGeometry(1.55, 0.14, 10, 48), at(0, 0.06, CZ, 0, Math.PI / 2), '--hc-alcove', 0.012);
      kit.flat(new T.RingGeometry(0.95, 1.5, 48), at(0, 0.035, CZ, 0, -Math.PI / 2), '--hc-spring');
      kit.flat(new T.CircleGeometry(0.95, 48), at(0, 0.04, CZ, 0, -Math.PI / 2), '--hc-glim');
      kit.flat(new T.TorusGeometry(1.6, 0.025, 6, 64), at(0, 0.005, CZ, 0, Math.PI / 2), '--hc-glim');

      // THE ALCOVE at the back: an arch dug into the wall, its back darker.
      var ax = 0, az = CZ - R + 0.35, AW = 3.6, AH = 2.6;
      var arch = new T.Shape(), r0 = AW / 2;
      arch.moveTo(-r0, 0); arch.lineTo(-r0, AH - r0); arch.absarc(0, AH - r0, r0, Math.PI, 0, true); arch.lineTo(r0, 0); arch.closePath();
      var archG = new T.ExtrudeGeometry(arch, { depth: 0.1, bevelEnabled: false, curveSegments: 32 });
      kit.piece(archG, at(ax, 0, az), '--hc-vault', false);
      kit.piece(new T.TorusGeometry(r0, 0.09, 10, 40, Math.PI), at(ax, AH - r0, az + 0.12), '--hc-lit', 0.012);
      [-1, 1].forEach(function (s) { kit.cyl(0.09, 0.09, AH - r0, at(ax + s * r0, (AH - r0) / 2, az + 0.12), '--hc-lit', 0.012, 12); });

      // THE BED, in the alcove, the long way across it: a soft frame on two
      // round feet, a mattress, one pillow with a dent in it, the cover turned
      // down at the foot, a rounded headboard. Nothing on it is square.
      var bz = az + 1.05, BL = 2.2;
      var cap = function (r, len, m, ink, sz) {
        var g = new T.CapsuleGeometry(r, len, 6, 16); g.rotateZ(Math.PI / 2); g.scale(1, 1, sz || 1);
        kit.piece(g, m, ink, 0.012);
      };
      cap(0.16, BL - 0.32, at(ax, 0.38, bz), '--hc-vault', 4.2);
      cap(0.11, BL - 0.3, at(ax, 0.6, bz), '--hc-chamber', 5.4);
      [-1, 1].forEach(function (s) { kit.cyl(0.07, 0.07, 0.26, at(ax + s * (BL / 2 - 0.25), 0.13, bz), '--hc-vault', 0.01, 12); });
      var head = new T.CapsuleGeometry(0.42, 0.5, 6, 16); head.scale(1, 1, 0.16);
      kit.piece(head, at(ax - BL / 2 - 0.02, 0.86, bz, Math.PI / 2), '--hc-vault', 0.012);
      var pillow = new T.SphereGeometry(0.3, 18, 12); pillow.scale(1, 0.38, 1.3);
      kit.piece(pillow, at(ax - BL / 2 + 0.42, 0.76, bz), '--hc-lit', 0.01);
      cap(0.07, 0.78, at(ax + 0.5, 0.72, bz), '--hc-vault', 9.4);
      cap(0.035, 0.74, at(ax + 0.08, 0.78, bz), '--hc-lit', 14);
      // The spring's pale rim under the bed, where the light gets underneath.
      kit.flat(new T.CircleGeometry(1, 40).scale(1.2, 0.5, 1), at(ax, 0.005, bz, 0, -Math.PI / 2), '--hc-lit');

      // THE DOOR in from the street, behind you, shut and rounded.
      var dr = 0.7, dh = 2.2, door = new T.Shape();
      door.moveTo(-dr, 0); door.lineTo(-dr, dh - dr); door.absarc(0, dh - dr, dr, Math.PI, 0, true); door.lineTo(dr, 0); door.closePath();
      kit.piece(new T.ExtrudeGeometry(door, { depth: 0.08, bevelEnabled: false, curveSegments: 24 }), onWall(Math.PI, R - 0.14, 0), '--hc-alcove', 0.012);
      kit.cyl(0.05, 0.05, 0.08, M(onWall(Math.PI, R - 0.24, 1.05), at(0.45, 0, 0, 0, Math.PI / 2)), '--hc-clay', false, 12);

      // THE BACK STAIR down to the guild: an arched way in the wall on the
      // right of the door as you come in, rounded treads going down into it.
      var SA = 2.25;
      kit.piece(new T.ExtrudeGeometry(door, { depth: 0.08, bevelEnabled: false, curveSegments: 24 }), onWall(SA, R - 0.12, 0), '--hc-vault', false);
      kit.piece(new T.TorusGeometry(dr, 0.07, 8, 24, Math.PI), onWall(SA, R - 0.22, dh - dr), '--hc-lit', 0.012);
      for (var k = 0; k < 4; k++) {
        var tread = new T.CapsuleGeometry(0.07, 1.1, 4, 10); tread.rotateZ(Math.PI / 2); tread.scale(1, 1, 3.2);
        kit.piece(tread, onWall(SA, R - 0.55 - k * 0.42, 0.26 - k * 0.07), k % 2 ? '--hc-chamber' : '--hc-lit', 0.01);
      }

      // THE DESK by the door, rounded, with nobody behind it and a bell nobody
      // has to ring.
      var DA = -2.4, dm = onWall(DA, R - 1.4, 0);
      var desk = new T.CapsuleGeometry(0.42, 1.0, 6, 16); desk.rotateZ(Math.PI / 2); desk.scale(1, 1.15, 0.9);
      kit.piece(desk, M(dm, at(0, 0.5, 0)), '--hc-chamber', 0.012);
      kit.piece(new T.SphereGeometry(0.09, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), M(dm, at(0.35, 0.98, 0)), '--hc-clay', 0.008);

      // THE ROOM'S OWN WORDS, round the curved wall, its page among them.
      var frame = kit.screen(1180, 800, 2.6, onWall(-1.75, R - 0.3, 1.5), 'The Healing Checkpoint’s own page, on the curved wall');
      var PANELS = [
        { n: 0, a: -0.62, h: 900, where: 'at the appreciation of rest, on the wall beside the alcove' },
        { n: 1, a: 0.62, h: 900, where: 'at what a healing checkpoint is' },
        { n: 2, a: -1.18, h: 900, where: 'at why the room is numbered 429' },
        { n: 3, a: 1.18, h: 900, where: 'at the Retry-After slips, to take or leave' },
        { n: 4, a: 1.72, h: 900, where: 'at the house rules of room 429' }
      ];
      var stops = [
        { name: 'just inside the door from the street, the light coming up out of the floor', x: 0, z: CZ + R - 1.3, yaw: 0 },
        { name: 'by the spring in the floor, where all the light comes from', x: 0, z: CZ + 2.3, yaw: 0, pitch: -0.32 },
        { name: 'at the bed in the alcove, already made up', x: 0, z: az + 3.6, yaw: 0, pitch: -0.12 }
      ];
      PANELS.forEach(function (p) {
        var it = kit.lift(frame, '.hc-panel', { n: p.n, w: 760, h: p.h, ww: 1.5, m: onWall(p.a, R - 0.3, 0.45) });
        var s = stand(p.a, R - 2.2);
        stops.push({ name: p.where, x: s.x, z: s.z, yaw: s.yaw, pitch: -0.1, frame: it.el });
      });
      var page = stand(-1.75, R - 2.8);
      stops.push({ name: 'at the curved wall, with the room’s own page on it', x: page.x, z: page.z, yaw: page.yaw, page: kit.page, frame: frame });
      var out = kit.lift(frame, '.hc-panel', { n: 5, w: 760, h: 760, ww: 1.3, m: onWall(2.72, R - 0.3, 0.45) });
      var o = stand(2.72, R - 2.3);
      stops.push({ name: 'at the way out, when you want it', x: o.x, z: o.z, yaw: o.yaw, pitch: -0.1, frame: out.el });
      var d = stand(DA, R - 3.0);
      stops.push({ name: 'at the desk by the door, with nobody behind it', x: d.x, z: d.z, yaw: d.yaw, pitch: -0.15 });
      var st = stand(SA, R - 2.6);
      stops.push({ name: 'the back stair', where: 'at the back stair, going down to the guild', room: 'the back stair, down to the Adventurer’s Guild',
                   page: 'adventurers-guild.html', x: st.x, z: st.z, yaw: st.yaw, pitch: -0.1 });

      return {
        start: { x: 0, z: CZ + R - 1.3, yaw: 0 },
        bounds: { x: [-R + 1.1, R - 1.1], z: [CZ - R + 1.6, CZ + R - 1.1] },
        stops: stops
      };
    }
  };
})();

/* =============================================================================
   Dance, Punks, walked into on Cel Street: turning 04 off the Outskirts.
   Ryan's ask, 2026-11-01: the turnings, each its own world.

   A SILENT DISCO ON THE OLD AIRSTRIP AT NIGHT, LIT BY NOTHING BUT THE
   HEADSETS (§43). Every headset glows steadily at head height in its channel's
   ink, blue, orange or white, and lights a little of the tarmac under it and
   nothing else: no rig, no runway lights, no moon. A crowd seen from the edge
   of the runway is a field of small coloured lights, and NOBODY IS DRAWN: the
   headsets are where heads would be, and the people in them are not ours to
   draw. The ones nobody has put on yet hang on hooks over the crate, unlit.

   THE REBELLION RAVE ROOM IS THE COLLISION, one turning on: a hangar of beams
   seen in haze. Here there is no roof, no haze, no beam and no rig, and a
   light goes only where somebody has walked with it.

   NOTHING MOVES AND NOTHING FLASHES, at any setting: the headsets glow
   steadily or not at all. The page's own headset, its three channels and its
   words are lifted off the page and stand at the runway's edge, and its own
   script tunes the headset there as it does on the page: tuning is silent,
   and nothing reaches YouTube until the headset is put on. Three channels are
   one crate started in three places, never a shuffle.

   Every colour is one §43 declares, by name. It keeps nothing, sends nothing
   and fetches nothing; its page arrives through Cel Street's screen().
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 7, 374761393) ^ Math.imul(j + 29, 668265263) ^ Math.imul(k + 31, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['dance-punks.html'] = {
    name: 'Dance, Punks',
    from: 'the-outskirts.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var RW = 5, EDGE = 6.4;                         // half the runway, where the boards stand
      var CH = ['--dp-blue', '--dp-orange', '--dp-white'];

      // THE NIGHT: no moon, no rig, only enough of the dark to tell the
      // runway from the field.
      kit.scene.background = kit.col('--dp-tarmac');
      kit.scene.fog = new T.Fog(kit.col('--dp-tarmac'), 18, 58);
      kit.scene.add(new T.HemisphereLight(kit.col('--dp-paint'), kit.col('--dp-tarmac'), 0.35));

      // THE AIRSTRIP: the field either side, the runway's own surface, its
      // edge lines, the threshold's bars at the near end and the centre line
      // going off into the dark.
      box(140, 0.1, 140, at(0, -0.06, -24), '--dp-tarmac', false, false);
      box(RW * 2, 0.06, 70, at(0, -0.01, -26), '--dp-strip', false, false);
      [-1, 1].forEach(function (s) { kit.flat(new T.PlaneGeometry(0.18, 70), at(s * (RW - 0.3), 0.025, -26, 0, -Math.PI / 2), '--dp-paint'); });
      for (var b = 0; b < 8; b++) {
        var bx = -RW + 0.9 + b * ((RW * 2 - 1.8) / 7);
        if (Math.abs(bx) < 0.5) continue;
        kit.flat(new T.PlaneGeometry(0.42, 3.2), at(bx, 0.025, 2.6, 0, -Math.PI / 2), '--dp-paint');
      }
      for (var cz = -1.5; cz > -58; cz -= 5) kit.flat(new T.PlaneGeometry(0.16, 2.6), at(0, 0.026, cz, 0, -Math.PI / 2), '--dp-paint');

      // A HEADSET: a band and two cups, in its channel's ink. Lit, it glows
      // steadily; on a hook, nobody has put it on yet and it is the dark
      // paint of everything else.
      var BAND = new T.TorusGeometry(0.12, 0.018, 6, 18, Math.PI);
      var CUP = new T.CylinderGeometry(0.055, 0.055, 0.04, 14);
      function headset(g, ink) {
        kit.flat(BAND.clone(), M(g, at(0, 0, 0)), ink);
        [-1, 1].forEach(function (s) { kit.flat(CUP.clone(), M(g, at(s * 0.122, -0.01, 0, 0, 0, Math.PI / 2)), ink); });
      }

      // THE CROWD: a headset for everybody out on the runway, at the height
      // of whoever is wearing it, each facing wherever they are facing. Some
      // carry a little light down onto the tarmac round them; it is the same
      // steady glow, and none of it moves.
      var lights = 0;
      for (var p = 0; p < 64; p++) {
        var x = (hash(p, 1, 1) - 0.5) * (RW * 2 - 1.6), z = -5 - hash(p, 1, 2) * 26;
        var y = 1.45 + hash(p, 1, 3) * 0.32, ink = CH[p % 3];
        headset(at(x, y, z, hash(p, 1, 4) * Math.PI * 2, (hash(p, 1, 5) - 0.5) * 0.3), ink);
        if (p % 5 === 0 && lights < 12) {
          var glow = new T.PointLight(kit.col(ink), 9, 6, 1.4);
          glow.position.set(x, y - 0.1, z);
          kit.scene.add(glow);
          lights++;
        }
      }

      // THE CRATE at the runway's edge on the left where the road comes in,
      // and a rail over it of headsets on hooks, unlit until somebody takes
      // one.
      var cg = at(-EDGE - 0.4, 0, 3.6, LEFT);
      box(1.8, 0.7, 0.9, M(cg, at(0, 0.35, -0.2)), '--dp-body');
      box(1.9, 0.06, 1.0, M(cg, at(0, 0.71, -0.2)), '--dp-paint');
      [-0.85, 0.85].forEach(function (o) { box(0.07, 1.9, 0.07, M(cg, at(o, 0.95, -0.55)), '--dp-paint'); });
      box(1.8, 0.05, 0.05, M(cg, at(0, 1.86, -0.55)), '--dp-paint');
      for (var h = 0; h < 6; h++) {
        var hx = -0.7 + h * 0.28;
        box(0.02, 0.12, 0.02, M(cg, at(hx, 1.79, -0.55)), '--dp-paint', false);
        headset(M(cg, at(hx, 1.6, -0.5)), '--dp-paint');
      }

      // BOARDS at the runway's edge for the page's own words, a dark board on
      // two posts, the words standing on the page's own tarmac.
      function standing(side, z, hgt) {
        var g = at(side * EDGE, 0, z, side < 0 ? LEFT : RIGHT);
        box(2.4, hgt + 0.2, 0.08, M(g, at(0, 0.5 + hgt / 2, -0.08)), '--dp-deep');
        [-1.1, 1.1].forEach(function (o) { box(0.08, 0.5 + hgt, 0.08, M(g, at(o, (0.5 + hgt) / 2, -0.14)), '--dp-paint'); });
        return M(g, at(0, 0.5, 0));
      }

      // THE ROOM'S OWN PAGE, on a board on the right where you came in.
      var pw = 2.6, ph = pw * 800 / 1180, py = 0.7 + ph / 2;
      var pg = at(EDGE, 0, 2.4, RIGHT);
      box(pw + 0.2, ph + 0.2, 0.08, M(pg, at(0, py, -0.08)), '--dp-deep');
      [-pw / 2, pw / 2].forEach(function (o) { box(0.08, py + ph / 2, 0.08, M(pg, at(o, (py + ph / 2) / 2, -0.14)), '--dp-paint'); });
      var page = kit.screen(1180, 800, pw, M(pg, at(0, py, 0)), 'Dance, Punks’ own page, on a board at the runway’s edge where you came in');

      // THE PAGE'S OWN WORDS. The headset and its three channels stand beside
      // the crate, and the page's own script tunes it there; the drawing of
      // dancers at the head of the page is left on the page, because nobody is
      // drawn out here.
      var tune = kit.lift(page, '.dp-part', { n: 1, w: 760, h: 900, ww: 2.0, m: standing(-1, 0.4, 2.4) });
      kit.wire(page, 'dance-punks.js');
      var head = kit.lift(page, '.dp-head', { w: 760, ww: 2.0, drop: '.dp-art', m: standing(1, -3.2, 1.2) });
      var lede = kit.lift(page, '.dp-lede', { w: 760, ww: 2.0, m: standing(-1, -6.0, 1.4) });
      var loud = kit.lift(page, '.dp-part', { n: 0, w: 760, h: 700, ww: 2.0, m: standing(1, -9.6, 1.8) });
      var rules = kit.lift(page, '.dp-part', { n: 2, w: 760, h: 760, ww: 2.0, m: standing(-1, -12.6, 2.0) });
      var whose = kit.lift(page, '.dp-part', { n: 3, w: 760, h: 640, ww: 2.0, m: standing(1, -16.0, 1.7) });

      var stops = [
        { name: 'at the edge of the runway, where the road comes in, the crowd out ahead a field of small steady lights', where: 'at the edge of the runway, the crowd ahead', x: 0, z: 4.4, yaw: 0, pitch: 0.02 },
        { name: 'at the crate on the left: the headsets on their hooks, and the headset to put on, with its three channels', where: 'at the crate, the headset and its three channels', x: -2.2, z: 1.4, yaw: LEFT + 0.12, pitch: 0.1, frame: tune.el },
        { name: 'at the board on the right where you came in, the room’s own page on it', where: 'at the room’s own page', x: RW - 1.1, z: 2.4, yaw: RIGHT, pitch: 0.06, page: kit.page, frame: page },
        { name: 'at the board on the right: turning 04, and you cannot hear it from the road', where: 'at the board with the room’s name', x: RW - 1.1, z: -3.2, yaw: RIGHT, pitch: 0.08, frame: head.el },
        { name: 'at the board on the left: the quietest thing on this road', where: 'at the board on the quietest thing on this road', x: -(RW - 1.1), z: -6.0, yaw: LEFT, pitch: 0.08, frame: lede.el },
        { name: 'at the board on the right: the loudest room you can turn down', where: 'at the board on the loudest room you can turn down', x: RW - 1.1, z: -9.6, yaw: RIGHT, pitch: 0.1, frame: loud.el },
        { name: 'at the board on the left: the rules on the runway', where: 'at the rules on the runway', x: -(RW - 1.1), z: -12.6, yaw: LEFT, pitch: 0.1, frame: rules.el },
        { name: 'at the board on the right: whose this all is', where: 'at the board on whose this all is', x: RW - 1.1, z: -16.0, yaw: RIGHT, pitch: 0.08, frame: whose.el },
        { name: 'out in the middle of the crowd, headsets glowing all round you at head height', where: 'in the middle of the crowd', x: 0.4, z: -18, yaw: 0.3, pitch: 0.04 },
        { name: 'at the far side of the crowd, turned back towards the road', where: 'at the far side of the crowd, looking back', x: -0.6, z: -31, yaw: Math.PI, pitch: 0.02 }
      ];

      return {
        start: { x: 0, z: 4.4, yaw: 0 },
        bounds: { x: [-(RW - 0.6), RW - 0.6], z: [-33, 5.2] },
        stops: stops
      };
    }
  };
})();

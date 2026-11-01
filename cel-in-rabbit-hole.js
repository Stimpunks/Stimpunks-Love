/* =============================================================================
   The Rabbit Hole, walked into on Cel Street. Ryan's ask, 2026-10-31: back on
   the street, working down it a room at a time.

   IT IS THE HOLE'S WORLD AND NOBODY ELSE'S (§30): somewhere you keep going,
   not somewhere you arrive. A square shaft of wet slate, the daylight you came
   in by a small pale square a long way overhead and behind you, and you on a
   ledge that runs round the walls, the middle open and going on down into the
   dark. Below you more ledges step down the walls with more pale things come
   to rest on them, fading out: the page's own "no floor at the bottom of it,
   just more page". NO BROWN ANYWHERE, which is what keeps it off the
   Latibulum, the same floor plan arrived at; no furniture, which is what
   keeps it off the Latibulum's chair; no candle, which is the Mopery's. Every
   word is pale on the dark, as in the room, and the light is above and
   behind you and does not reach far down.

   CEL STREET'S EYE IS AT ONE HEIGHT, so you do not walk down: the walk is
   round the ledge, and the going down is what you see over its edge. Looking
   down from the start is the first place in the list.

   THE ENGRAVINGS, THE LEDGES OF WORDS AND THE DORMOUSE'S PRESSES ARE THE
   ROOM'S OWN, lifted off its page by the kit: Tenniel's six cuts of 1865 on
   their paper mats with the sentence of ours beside each, the page's ledges,
   and the videos off our glossary entry, which say how long they run before
   the press and reach YouTube only on it. Not a line of the song's words is
   anywhere in here, as on the page.

   NOTHING MOVES. Every colour is one the room declares, by name. It keeps
   nothing, sends nothing and fetches nothing; its page arrives through Cel
   Street's screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 31, 374761393) ^ Math.imul(j + 17, 668265263) ^ Math.imul(k + 7, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['rabbit-hole.html'] = {
    name: 'The Rabbit Hole',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var S = 6, L = 2.6, TOP = 18, DEEP = -80;   // half the shaft, the ledge, the mouth, the dark
      var IN = S - L;                              // the ledge's inner edge
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2, BACKWARD = Math.PI;

      // THE LIGHT: daylight from the mouth, above and behind you, and the dark
      // taking everything a little way down.
      kit.scene.background = kit.col('--rh-deep');
      kit.scene.fog = new T.Fog(kit.col('--rh-deep'), 20, 64);
      kit.scene.add(new T.HemisphereLight(kit.col('--rh-daylight'), kit.col('--rh-deep'), 1.35));
      var day = new T.DirectionalLight(kit.col('--rh-daylight'), 1.5);
      day.position.set(0, 70, 22); day.target.position.set(0, -10, -4);
      kit.scene.add(day, day.target);

      // THE SHAFT: four walls of slate from the dark to the mouth.
      var WH = TOP - DEEP, WY = (TOP + DEEP) / 2;
      box(0.4, WH, 2 * S + 0.8, at(-S - 0.2, WY, 0), '--rh-slate', false, false);
      box(0.4, WH, 2 * S + 0.8, at(S + 0.2, WY, 0), '--rh-slate', false, false);
      box(2 * S + 0.8, WH, 0.4, at(0, WY, -S - 0.2), '--rh-slate', false, false);
      box(2 * S + 0.8, WH, 0.4, at(0, WY, S + 0.2), '--rh-slate', false, false);
      // Its courses, where the slate was cut, a hairline every so often, and
      // the wet catching the daylight in short runs down the walls.
      var walls = [at(-S + 0.005, 0, 0, LEFT), at(S - 0.005, 0, 0, RIGHT), at(0, 0, -S + 0.005), at(0, 0, S - 0.005, BACKWARD)];
      walls.forEach(function (w, wi) {
        for (var y = DEEP + 4; y < TOP; y += 3.2 + hash(wi, Math.round(y), 1) * 1.6) {
          kit.flat(new T.PlaneGeometry(2 * S, 0.03), M(w, at(0, y, 0)), '--rh-graphite');
        }
        for (var g = 0; g < 26; g++) {
          var gx = (hash(wi, g, 2) - 0.5) * (2 * S - 1), gy = -14 + hash(wi, g, 3) * 50;
          kit.flat(new T.PlaneGeometry(0.03, 0.3 + hash(wi, g, 4) * 0.9), M(w, at(gx, gy, 0.002)), '--rh-daylight');
        }
      });
      // THE MOUTH: the daylight you came in by, a small square of it in the
      // slate overhead, nearer the side behind you. The dark down here does
      // not reach it.
      var MZ = 3.0, MO = 2.0;
      box(2 * S, 0.6, S - MZ - MO, at(0, TOP, (S + MZ + MO) / 2), '--rh-slate', false, false);
      box(2 * S, 0.6, S + MZ - MO, at(0, TOP, (MZ - MO - S) / 2), '--rh-slate', false, false);
      box(S - MO, 0.6, 2 * MO, at(-(S + MO) / 2, TOP, MZ), '--rh-slate', false, false);
      box(S - MO, 0.6, 2 * MO, at((S + MO) / 2, TOP, MZ), '--rh-slate', false, false);
      var mouth = kit.flat(new T.PlaneGeometry(2 * MO + 0.4, 2 * MO + 0.4), at(0, TOP + 1.2, MZ, 0, Math.PI / 2), '--rh-daylight');
      mouth.material.fog = false;
      // What comes in at the mouth, falling off the further down it goes.
      var shaft = new T.PointLight(kit.col('--rh-daylight'), 40, 60, 1.3);
      shaft.position.set(0, TOP - 1, MZ);
      kit.scene.add(shaft);

      // THE LEDGE you are on, round all four walls, the middle open.
      function ledge(y, w, ink) {
        box(2 * S, 0.3, w, at(0, y - 0.15, S - w / 2), ink, 0.02);
        box(2 * S, 0.3, w, at(0, y - 0.15, -S + w / 2), ink, 0.02);
        box(w, 0.3, 2 * S - 2 * w, at(-S + w / 2, y - 0.15, 0), ink, 0.02);
        box(w, 0.3, 2 * S - 2 * w, at(S - w / 2, y - 0.15, 0), ink, 0.02);
      }
      ledge(0, L, '--rh-slate-2');
      // Its lip, where it stops.
      [[0, IN, 2 * IN, 0], [0, -IN, 2 * IN, 0], [-IN, 0, 2 * IN, LEFT], [IN, 0, 2 * IN, LEFT]].forEach(function (e) {
        kit.flat(new T.BoxGeometry(e[2], 0.02, 0.04), at(e[0], 0.005, e[1], e[3]), '--rh-graphite');
      });
      // LEDGES BELOW, stepping down the walls a side at a time, each with
      // a few pale things come to rest on it, fading into the dark: it keeps
      // going. And the ones above, the way you came down.
      for (var k = 1; k <= 7; k++) {
        var y = -k * 6, side = k % 4, half = [at(0, 0, 0), at(0, 0, 0, LEFT), at(0, 0, 0, BACKWARD), at(0, 0, 0, RIGHT)][side];
        box(2 * S, 0.3, 2.0, M(half, at(0, y - 0.15, -S + 1.0)), '--rh-slate-2', 0.02);
        for (var p = 0; p < 4; p++) {
          var px = -S + 1.6 + hash(k, p, 1) * (2 * S - 3.2);
          kit.flat(new T.PlaneGeometry(0.5 + hash(k, p, 2) * 0.5, 0.7 + hash(k, p, 3) * 0.6), M(half, at(px, y + 0.9, -S + 0.02)), '--rh-paper');
        }
      }
      for (k = 1; k <= 2; k++) {
        var hy = k * 6.5, hs = (k + 2) % 4, hh = [at(0, 0, 0), at(0, 0, 0, LEFT), at(0, 0, 0, BACKWARD), at(0, 0, 0, RIGHT)][hs];
        box(2 * S, 0.3, 1.6, M(hh, at(0, hy - 0.15, -S + 0.8)), '--rh-slate-2', 0.02);
      }

      // THE ROOM'S OWN PAGE on the far wall, straight across the open middle.
      var pw = 2.6, ph = pw * 800 / 1180, py = 0.55 + ph / 2;
      box(pw + 0.16, ph + 0.16, 0.06, at(0, py, -S + 0.04), '--rh-graphite');
      var frame = kit.screen(1180, 800, pw, at(0, py, -S + 0.08), 'The Rabbit Hole’s own page, hung on the far wall of the shaft');

      // WHAT HANGS ON THE WALLS: placed against wall w at u along it, its foot
      // at y, h pixels before it scrolls.
      function on(w, u, sel, o) {
        var m = M(w, at(u, o.y, 0.03));
        return kit.lift(frame, sel, { n: o.n || 0, w: o.w, h: o.h, ww: o.ww, m: m, bare: o.bare });
      }
      var wl = walls[0], wr = walls[1], wb = walls[2], wf = walls[3];
      // The left wall, walking on from where you came in: the White Rabbit,
      // what rabbit holing is, and where the hole comes from.
      var cut0 = on(wl, -2.3, '.rh-cut', { n: 0, w: 520, ww: 1.45, y: 0.4 });
      var led0 = on(wl, 0, '.rh-ledge', { n: 0, w: 640, h: 820, ww: 1.8, y: 0.4 });
      var led1 = on(wl, 2.3, '.rh-ledge', { n: 1, w: 640, h: 820, ww: 1.8, y: 0.4 });
      // The far wall: the curtain, the page, the hall.
      var cut1 = on(wb, -2.6, '.rh-cut', { n: 1, w: 520, ww: 1.45, y: 0.4 });
      var cut2 = on(wb, 2.6, '.rh-cut', { n: 2, w: 520, ww: 1.45, y: 0.4 });
      // The right wall: the pool, the warning, the house.
      var cut3 = on(wr, -2.3, '.rh-cut', { n: 3, w: 520, ww: 1.45, y: 0.4 });
      var led2 = on(wr, 0, '.rh-ledge', { n: 2, w: 640, h: 820, ww: 1.8, y: 0.4 });
      var cut4 = on(wr, 2.3, '.rh-cut', { n: 4, w: 520, ww: 1.45, y: 0.4 });
      // The wall you came in by: the cat in the tree, feed your head, and the
      // Dormouse's presses.
      var cut5 = on(wf, -2.3, '.rh-cut', { n: 5, w: 520, ww: 1.45, y: 0.4 });
      var led3 = on(wf, 0, '.rh-ledge', { n: 3, w: 640, h: 820, ww: 1.8, y: 0.4 });
      var press = on(wf, 2.3, '.rh-presses', { w: 640, h: 820, ww: 1.8, y: 0.4 });

      // Where to stand: on the ledge, back from a wall, facing the thing at u
      // along it (each wall's u runs the way that wall's drawing does).
      var D = S - 2.3;
      function atLeft(u) { return { x: -D, z: -u, yaw: LEFT }; }
      function atRight(u) { return { x: D, z: u, yaw: RIGHT }; }
      function atBack(u) { return { x: u, z: -D, yaw: 0 }; }
      function atFront(u) { return { x: -u, z: D, yaw: BACKWARD }; }
      function stop(name, where, it, extra) {
        var s = { name: name, x: where.x, z: where.z, yaw: where.yaw, pitch: 0.16 };
        if (it) s.frame = it.el;
        Object.keys(extra || {}).forEach(function (k2) { s[k2] = extra[k2]; });
        return s;
      }

      return {
        start: { x: 0, z: S - 1.0, yaw: 0 },
        bounds: { x: [-S + 0.5, S - 0.5], z: [-S + 0.5, S - 0.5],
                  areas: [{ x: [-S + 0.5, S - 0.5], z: [IN + 0.15, S - 0.5] },
                          { x: [-S + 0.5, S - 0.5], z: [-S + 0.5, -IN - 0.15] },
                          { x: [-S + 0.5, -IN - 0.15], z: [-S + 0.5, S - 0.5] },
                          { x: [IN + 0.15, S - 0.5], z: [-S + 0.5, S - 0.5] }] },
        stops: [
          { name: 'on the ledge where you came down, the daylight above and behind you', x: 0, z: S - 1.0, yaw: 0, pitch: 0.1 },
          { name: 'at the lip of the ledge, looking down: it keeps going', x: 0, z: IN + 0.4, yaw: 0, pitch: -0.55 },
          { name: 'across the ledge from where you came down, looking back up at the daylight', x: 0, z: -S + 0.8, yaw: BACKWARD, pitch: 0.75 },
          stop('at the White Rabbit, the first cut from 1865', atLeft(-2.3), cut0),
          stop('at what rabbit holing is, on the left-hand wall', atLeft(0), led0),
          stop('at where the hole comes from', atLeft(2.3), led1),
          stop('at the curtain and the small low door', atBack(-2.6), cut1),
          stop('at the far wall, with the room’s own page on it', atBack(0), null, { page: kit.page, frame: frame }),
          stop('at Alice filling the hall', atBack(2.6), cut2),
          stop('at Alice swimming with the mouse', atRight(-2.3), cut3),
          stop('at the warning about the holes you rabbit', atRight(0), led2),
          stop('at Alice filling the little house', atRight(2.3), cut4),
          stop('at the cat on the bough', atFront(-2.3), cut5),
          stop('at feed your head, on the wall you came in by', atFront(0), led3),
          stop('at what the Dormouse said, every video off our glossary entry', atFront(2.3), press)
        ]
      };
    }
  };
})();

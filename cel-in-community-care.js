/* =============================================================================
   Community Care, walked into on Cel Street. Ryan's ask, 2026-10-31: down the
   street a room at a time.

   IT IS THE STREET UNDER EVERYBODY'S UMBRELLAS, IN THE RAIN (§122): open
   umbrellas tied to one another and to the shopfronts either side, and between
   them one roof. It is overcast, so there is no sun anywhere and nothing casts
   a hard shadow; the only light is the grey sky, and the paving under the roof
   is dry and dim. Every word stands on that paving, on the shopfronts' walls.

   THE ROOF IS THE PAGE'S OWN ROOF, READ OFF IT. tools/make-community-care.py
   lays the umbrellas out in its drawing: a front row in the data's order and a
   back row it works out so that no two alike touch. That drawing is lifted
   onto the wall by the start, and the scene's roof is read off it once it has
   arrived, so the two cannot disagree: strings of umbrellas run the length of
   the street, the front row's order and the back row's in turn, each back
   string hanging between two front ones as it does in the drawing. THE TIES
   ARE THE ROOM: every umbrella's shaft comes down to a loose loop on a cord
   that runs to the next, and the end ones to the shopfronts' walls; nothing
   else holds the roof up, and no umbrella hangs untied.

   THE COLLISIONS (§122 has them all): the Truck Stop is coloured canvas over a
   sunny lot, its stripes laid on the counters, and here there is no sun and
   no colour is laid on the ground at all; the Chappell is coloured glass at
   night; the Green is just after the rain under an open sky, and here it is
   still raining and everybody is under cover.

   THE RAIN IS DRAWN STILL, over the roof and on the open street past its far
   end, and never under the umbrellas; nothing moves at any setting. The page's
   words are lifted off it as they are: the lede with the paragraph saying the
   channel is not a crisis line beside it, before anything else, and each part
   along the walls. Every colour is one the room declares, by name. It keeps
   nothing, sends nothing and fetches nothing; its page arrives through Cel
   Street's screen(), on the left-hand wall under the roof.
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['community-care.html'] = {
    name: 'Community Care',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var W = 8, D = 26, H = 5.6, back = -D;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var ROOF0 = -0.6, ROOF1 = back + 5;      // the roof runs from just ahead of you to five metres short of the end
      var HEM = 3.45, RISE = 0.5, TIE = 3.05;

      // THE LIGHT: the grey sky, from everywhere, and nothing else.
      kit.scene.background = kit.col('--cmc-sky');
      kit.scene.fog = new T.Fog(kit.col('--cmc-sky'), 16, 42);
      kit.scene.add(new T.HemisphereLight(kit.col('--cmc-rain'), kit.col('--cmc-under'), 2.8));
      kit.scene.add(new T.AmbientLight(kit.col('--cmc-sky'), 0.9));

      // THE STREET: the paving, dry under the roof and dark with rain past it,
      // and the shopfronts either side, their windows and doors dark.
      box(W, 0.1, D + 6, at(0, -0.05, -D / 2 + 3), '--cmc-under', false, false);
      box(W, 0.012, 5, at(0, 0.006, back + 2.5), '--cmc-slab', false, false);
      for (var k = 1; k < 13; k++) box(W, 0.008, 0.03, at(0, 0.011, -k * 2), '--cmc-slab', false, false);
      [-1, 1].forEach(function (s) {
        box(0.4, H, D + 6, at(s * (W / 2 + 0.2), H / 2, -D / 2 + 3), '--cmc-slab', 0.012, false);
        box(0.06, 0.18, D + 6, at(s * (W / 2 - 0.03), 0.09, -D / 2 + 3), '--cmc-rib', false, false);
      });
      // Shop windows and doors along each side, dark, between the boards.
      [[-1, -4.9], [1, -9.3], [-1, -13.7], [1, -18.1], [-1, -22.5], [1, -2.2]].forEach(function (d) {
        var s = d[0], z = d[1];
        box(0.05, 2.3, 1.1, at(s * (W / 2 - 0.02), 1.15, z), '--cmc-rib', 0.01, false);
        box(0.08, 0.08, 1.3, at(s * (W / 2 - 0.05), 2.34, z), '--cmc-dim', false, false);
      });
      // The street running on past the roof's end into the rain, and the
      // terrace across the far end.
      box(W + 0.8, H, 0.4, at(0, H / 2, back - 0.2), '--cmc-slab', 0.012, false);
      // Behind you, the way in from the street.
      box(W + 0.8, H, 0.4, at(0, H / 2, 3.2), '--cmc-slab', 0.012, false);

      // THE RAIN, still: streaks over the roof, and down to the ground on the
      // open street past its end. A fixed seed, so it is the same rain every
      // visit, and none of it falls under the umbrellas.
      var seed = 122;
      var rnd = function () { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
      var streak = new T.PlaneGeometry(0.018, 0.42);
      for (var r = 0; r < 260; r++) {
        var rx = -W / 2 + 0.2 + rnd() * (W - 0.4), rz = 2.5 - rnd() * (D + 2.5);
        var open = rz < ROOF1 - 0.6;
        var ry = open ? 0.3 + rnd() * 4.8 : HEM + 0.75 + rnd() * 1.7;
        kit.flat(streak, at(rx, ry, rz, rnd() * Math.PI, 0, 0.18), '--cmc-rain');
      }

      // THE PAGE'S OWN ROOF, on the left-hand wall by the start, and the
      // scene's roof read off it once it has arrived.
      var wl = function (z, y) { return at(-W / 2 + 0.03, y, z, LEFT); };
      var wr = function (z, y) { return at(W / 2 - 0.03, y, z, RIGHT); };
      var pw = 2.6, ph = pw * 800 / 1180, py = 0.85 + ph / 2;
      var frame = kit.screen(1180, 800, pw, at(-W / 2 + 0.03, py, -9.6, LEFT), 'Community Care’s own page, on the left-hand wall');
      box(0.05, ph + 0.14, pw + 0.14, at(-W / 2 + 0.01, py, -9.6), '--cmc-rib', false, false);
      var roof = kit.lift(frame, '.cmc-roof', { w: 1000, ww: 2.6, m: wl(-3.4, 0.75) });

      var STRINGS = [-2.85, -0.95, 0.95, 2.85];      // across the street; front, back, front, back
      var R = 1.12;
      var built = false;
      kit.follow(roof, '.cmc-canopy', function (read, node) {
        if (built) return;
        built = true;
        var inks = function (sel) {
          return Array.prototype.map.call(node.querySelectorAll(sel), function (p) {
            var m = /var\((--cmc-[a-z]+)\)/.exec(p.getAttribute('fill') || '');
            return m ? m[1] : null;
          }).filter(Boolean);
        };
        var front = inks('g.cmc-near > path:first-child'), backRow = inks('g.cmc-far > path:first-child');
        if (!front.length || !backRow.length) return;
        var len = ROOF0 - ROOF1, step = len / front.length;
        var dome = new T.ConeGeometry(R, RISE, 8, 1, true);
        var rib = new T.CylinderGeometry(0.014, 0.014, HEM - TIE + 0.15, 5);
        var ribLine = new T.BoxGeometry(Math.hypot(R, RISE), 0.012, 0.012);
        var loop = new T.TorusGeometry(0.06, 0.012, 5, 12);
        var anchor = new T.SphereGeometry(0.07, 8, 6);
        STRINGS.forEach(function (x, si) {
          var isBack = si % 2 === 1, row = isBack ? backRow : front;
          var shafts = [];
          row.forEach(function (ink, i) {
            var z = ROOF0 - step / 2 - i * step - (isBack ? step / 2 : 0);
            if (isBack && i >= front.length - 1) return;
            var h = isBack ? HEM + 0.12 : HEM;
            // The sky comes down through the canopy, so from under it every
            // umbrella is its own colour, flat, with its ribs dark across it.
            var d = kit.flat(dome, at(x, h + RISE / 2, z), ink);
            d.material.side = T.DoubleSide;
            for (var q = 0; q < 8; q++) {
              var ang = q * Math.PI / 4 + Math.PI / 8;
              kit.facets(ribLine, at(x + Math.cos(ang) * R / 2, h + RISE / 2 - 0.005, z + Math.sin(ang) * R / 2, -ang, 0, -Math.atan2(RISE, R)), '--cmc-rib');
            }
            kit.facets(new T.CylinderGeometry(0.03, 0.03, 0.12, 5), at(x, h + RISE + 0.06, z), '--cmc-rib');
            kit.facets(rib, at(x, TIE + (h - TIE) / 2 + 0.05, z), '--cmc-sky');
            kit.facets(new T.TorusGeometry(0.07, 0.016, 5, 10, Math.PI), at(x - 0.07, TIE - 0.1, z, 0, 0, Math.PI), '--cmc-sky');
            kit.facets(loop, at(x, TIE, z, LEFT), '--cmc-tie');
            shafts.push(new T.Vector3(x, TIE, z));
          });
          // The cord along the string, loose between every two shafts, and
          // out to the shopfront's wall at either end of the street's run.
          for (var j = 0; j + 1 < shafts.length; j++) {
            var a = shafts[j], b = shafts[j + 1], mid = a.clone().add(b).multiplyScalar(0.5);
            mid.y -= 0.14;
            kit.facets(new T.TubeGeometry(new T.QuadraticBezierCurve3(a, mid, b), 10, 0.011, 4), at(0, 0, 0), '--cmc-tie');
          }
        });
        // Across the street: every back umbrella tied to the two front ones
        // it hangs between, and the outside strings to the shopfronts' walls.
        var fz = function (i, isBack) { return ROOF0 - step / 2 - i * step - (isBack ? step / 2 : 0); };
        var cord = function (a, b, sag) {
          var mid = a.clone().add(b).multiplyScalar(0.5); mid.y -= sag;
          kit.facets(new T.TubeGeometry(new T.QuadraticBezierCurve3(a, mid, b), 8, 0.011, 4), at(0, 0, 0), '--cmc-tie');
        };
        for (var i = 0; i < front.length; i++) {
          cord(new T.Vector3(-W / 2, TIE, fz(i, false)), new T.Vector3(STRINGS[0], TIE, fz(i, false)), 0.12);
          kit.facets(anchor, at(-W / 2 + 0.02, TIE, fz(i, false)), '--cmc-tie');
          if (i >= front.length - 1) continue;
          cord(new T.Vector3(STRINGS[3], TIE, fz(i, true)), new T.Vector3(W / 2, TIE, fz(i, true)), 0.12);
          kit.facets(anchor, at(W / 2 - 0.02, TIE, fz(i, true)), '--cmc-tie');
          [[0, 1], [2, 1], [2, 3]].forEach(function (pr) {
            var f = new T.Vector3(STRINGS[pr[0]], TIE, fz(i, false)), bk = new T.Vector3(STRINGS[pr[1]], TIE, fz(i, true));
            cord(f, bk, 0.1);
          });
        }
      });

      // THE PAGE'S WORDS, as they are, on the shopfronts' walls under the
      // roof: its name, then the lede, which carries the not-a-crisis-line
      // paragraph inside it on the page and so here, then each part in turn along the street.
      kit.lift(frame, '.cmc-head', { w: 900, ww: 2.2, m: wl(-1.2, 2.15) });
      kit.lift(frame, '.cmc-lede', { w: 760, h: 620, ww: 1.75, m: wr(-3.2, 0.7) });
      var PARTS = [
        { n: 0, side: 'l', z: -6.0, words: 'ask, offer, receive, decline' },
        { n: 1, side: 'r', z: -7.0, words: 'solidarity, not charity' },
        { n: 2, side: 'l', z: -12.6, words: 'peer support, and where it comes from' },
        { n: 3, side: 'r', z: -10.8, words: 'everybody’s umbrella' },
        { n: 4, side: 'l', z: -15.6, words: 'what is not under here' },
        { n: 5, side: 'r', z: -14.6, words: 'who reads the channel, and for how long' },
        { n: 6, side: 'l', z: -18.6, words: 'next door, and down the street' },
        { n: 7, side: 'r', z: -18.4, words: 'whose this is' }
      ];
      var stops = [
        { name: 'just under the roof, the umbrellas over you and the rain on top of them', x: 0, z: -0.9, yaw: 0, pitch: 0.12 },
        { name: 'at the roof as its page draws it, under the room’s name', x: -W / 2 + 2.4, z: -2.6, yaw: LEFT },
        { name: 'at what this room is for, with the line saying the channel is not a crisis line', x: W / 2 - 2.2, z: -3.2, yaw: RIGHT, pitch: -0.05 },
        { name: 'at the room’s own page on the left-hand wall', x: -W / 2 + 2.6, z: -9.6, yaw: LEFT, page: kit.page, frame: frame },
        { name: 'looking up into the roof, every umbrella tied to the next', x: 0, z: -8.6, yaw: 0, pitch: 0.85 }
      ];
      PARTS.forEach(function (p) {
        var m = p.side === 'l' ? wl(p.z, 0.55) : wr(p.z, 0.55);
        var it = kit.lift(frame, '.cmc-part', { n: p.n, w: 760, h: 760, ww: 1.9, m: m });
        stops.push({ name: 'at ' + p.words, x: p.side === 'l' ? -W / 2 + 2.4 : W / 2 - 2.4, z: p.z, yaw: p.side === 'l' ? LEFT : RIGHT, frame: it.el });
      });
      stops.push({ name: 'at the far end of the roof, the rain falling on the open street past it', x: 0, z: ROOF1 + 1.0, yaw: 0 });

      return {
        start: { x: 0, z: -0.9, yaw: 0 },
        bounds: { x: [-W / 2 + 1.0, W / 2 - 1.0], z: [ROOF1 + 0.5, -0.5] },
        stops: stops
      };
    }
  };
})();

/* =============================================================================
   All Needs Met Wildlife Sanctuary, walked into on Cel Street, west of the
   stile in Nature's Contribution. Ryan's ask, 2026-11-03: Nature's
   Contribution and its places.

   IT IS THE ROOM'S OWN WORLD (§105): the keepers' night round, seen through
   the viewer that sees warmth, because a torch wakes everybody. THE LIGHT IS
   NOT LIGHT. The night is black, the cold sky and the cold water blackest,
   the ground and the walls holding a little of the day, and the only bright
   things are what is warm: the barn's and the hut's doorways, with somebody
   inside, and every resident, white with their own warmth. NOTHING IN HERE
   HAS A HUE, because heat has none: every colour is an --anm- grey §105
   declares, and nothing is drawn with the street's ink line, which is the one
   colour Cel Street would otherwise lay round every solid thing. No crosshair
   is drawn on anything, ever.

   THE RESIDENTS ARE THE PAGE'S, and here they are only what the viewer
   shows: a warm shape and the warmth coming off it, where each one likes to
   be as the page says, Juniper by her bale at the barn door, Hollis where he
   can see the door, Otis on his high perch in the mews, Duke in the shallow
   end. Who each one is stays in their own words on the page's list, lifted
   onto the barn wall. Nobody is for sale, nobody is a lesson, and nothing out
   here is counted. The preserve past the rail is left alone: there is no path
   into it and the stops stop at the rail.

   THE COLLISIONS ARE §105's: Rescue A Cat has a torch, and eyeshine; here
   nothing reflects, the bodies are the light. Danny the Street's one channel
   is a hue; this has none. Stay Frosty's light is reflected, in points; this
   is given off, softly, by everybody.

   NOTHING MOVES, at any setting. It keeps nothing, sends nothing and fetches
   nothing; its page arrives through Cel Street's screen(), and the screen in
   the keepers' hut plays through the page's own rack.js, nothing loading
   until somebody presses. tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 3, 374761393) ^ Math.imul(j + 17, 668265263) ^ Math.imul(k + 41, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['all-needs-met.html'] = {
    name: 'All Needs Met Wildlife Sanctuary',
    from: 'natures-contribution.html',
    faces: ['"Martian Mono"', '"Geist"'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      // No ink line round anything: the street's line has a hue.
      var box = function (w, h, d, m, ink) { kit.box(w, h, d, m, ink, false); };
      var cyl = function (r0, r1, h, m, ink, seg) { kit.cyl(r0, r1, h, m, ink, false, seg); };
      var warm = function (geo, m, ink) { kit.flat(geo, m, ink || '--anm-body'); };
      var RAIL = -15;                       // the edge of the yard: past it, the preserve

      // THE NIGHT, as the viewer has it: the sky the coldest thing there is,
      // and an even grey fill, because what shows is warmth, not light.
      kit.scene.background = kit.col('--anm-sky');
      kit.scene.fog = new T.Fog(kit.col('--anm-sky'), 18, 62);
      kit.scene.add(new T.HemisphereLight(kit.col('--anm-dim'), kit.col('--anm-ground-far'), 1.5));

      // THE GROUND: the yard holding a little of the day, the far ground
      // less, and the track in from the stile.
      box(80, 0.1, 90, at(0, -0.06, -25), '--anm-ground-far');
      box(14, 0.04, 17, at(0, -0.01, -6.5), '--anm-ground');
      box(1.6, 0.03, 16, at(0, 0.005, -6.5), '--anm-reed');

      // THE TREES at the back, behind the wetland, a little warmer than the sky.
      for (var k = 0; k < 46; k++) {
        var tx = -34 + k * 1.5 + (hash(k, 1, 1) - 0.5), tz = -31 - hash(k, 1, 2) * 9, th = 4 + hash(k, 1, 3) * 5;
        cyl(0.12, 0.16, th * 0.3, at(tx, th * 0.15, tz), '--anm-trees', 6);
        kit.piece(new T.SphereGeometry(th * 0.32, 8, 6), at(tx, th * 0.62, tz), '--anm-trees', false);
      }
      for (k = 0; k < 20; k++) {
        var sx = (k % 2 ? 1 : -1) * (9 + hash(k, 2, 1) * 10), sz = -2 - hash(k, 2, 2) * 24, sh = 4 + hash(k, 2, 3) * 4;
        kit.piece(new T.SphereGeometry(sh * 0.34, 8, 6), at(sx, sh * 0.6, sz), '--anm-trees', false);
        cyl(0.12, 0.16, sh * 0.3, at(sx, sh * 0.15, sz), '--anm-trees', 6);
      }

      // THE WETLAND past the rail: cold water, black, and reeds round it a
      // shade lighter. Nobody goes in.
      kit.flat(new T.CircleGeometry(1, 40).scale(13, 6.5, 1), at(0, 0.02, -23, 0, -Math.PI / 2), '--anm-water');
      var reed = new T.ConeGeometry(0.03, 1.2, 3);
      for (k = 0; k < 220; k++) {
        var a = hash(k, 3, 1) * Math.PI * 2, rr = 0.82 + hash(k, 3, 2) * 0.32;
        var rx = Math.cos(a) * 13 * rr, rz = -23 + Math.sin(a) * 6.5 * rr;
        if (rz > RAIL - 0.6) continue;
        kit.piece(reed.clone(), at(rx, 0.55, rz, 0, (hash(k, 3, 3) - 0.5) * 0.3, (hash(k, 3, 4) - 0.5) * 0.3), '--anm-reed', false);
      }
      // The rail: you look from here.
      for (var px = -7; px <= 7; px += 1.75) cyl(0.05, 0.05, 1.0, at(px, 0.5, RAIL), '--anm-wall', 6);
      box(14.2, 0.06, 0.06, at(0, 0.95, RAIL), '--anm-wall');
      box(14.2, 0.06, 0.06, at(0, 0.55, RAIL), '--anm-wall');

      // THE WILD NEIGHBOURS the viewer can see from the rail: a heron white in
      // the shallows, a muskrat a smudge on the bank, bats small over the water.
      cyl(0.02, 0.02, 0.7, at(-3.4, 0.35, -19.5), '--anm-body', 4);
      warm(new T.SphereGeometry(0.22, 10, 8).scale(0.8, 1.3, 0.8), at(-3.4, 0.95, -19.5));
      warm(new T.SphereGeometry(0.07, 8, 6), at(-3.35, 1.32, -19.45));
      warm(new T.SphereGeometry(0.18, 10, 8).scale(1.6, 0.7, 1), at(6.4, 0.12, -18.3), '--anm-halo');
      for (k = 0; k < 6; k++) {
        warm(new T.CircleGeometry(0.09, 6).scale(2.2, 0.6, 1), at(-5 + hash(k, 4, 1) * 10, 2.6 + hash(k, 4, 2) * 1.6, -21 - hash(k, 4, 3) * 4, hash(k, 4, 4)));
      }

      // A RESIDENT, as the viewer shows them: the body white with its own
      // warmth, and the warmth coming off it lying on the ground round it.
      function resident(x, y, z, sx, sy, sz, head) {
        kit.flat(new T.CircleGeometry(1, 24).scale(sx * 1.25, sz * 1.25, 1), at(x, 0.025, z, 0, -Math.PI / 2), '--anm-halo');
        warm(new T.SphereGeometry(1, 14, 10).scale(sx, sy, sz), at(x, y, z));
        if (head) warm(new T.SphereGeometry(head[3], 12, 8), at(x + head[0], y + head[1], z + head[2]));
      }

      // THE BARN on the left, its doorway bright with whoever is inside.
      var BX = -6.6;
      box(3.2, 3.0, 7.0, at(BX - 1.6, 1.5, -8.2), '--anm-wall');
      kit.piece(new T.CylinderGeometry(0.01, 2.6, 1.5, 4, 1).scale(1, 1, 2.0), at(BX - 1.6, 3.75, -8.2, Math.PI / 4), '--anm-roof', false);
      kit.flat(new T.PlaneGeometry(1.5, 2.1), at(BX + 0.01, 1.05, -6.2, LEFT), '--anm-door');
      // Juniper's bale by the barn door, and Juniper at it.
      box(0.9, 0.5, 0.6, at(BX + 0.6, 0.25, -5.0), '--anm-reed');
      resident(BX + 0.9, 0.42, -5.7, 0.42, 0.3, 0.22, [0.42, 0.22, 0, 0.14]);
      // Mabel's wallow, and Mabel in it.
      kit.flat(new T.CircleGeometry(1, 24).scale(1.4, 0.9, 1), at(-2.8, 0.02, -12.4, 0, -Math.PI / 2), '--anm-water');
      resident(-2.8, 0.25, -12.4, 0.62, 0.3, 0.36, [0.6, 0.12, 0, 0.18]);
      // Clover's box with two doors, and Clover by it.
      box(0.55, 0.4, 0.4, at(-3.8, 0.2, -3.6), '--anm-reed');
      resident(-3.25, 0.13, -3.6, 0.17, 0.13, 0.14, [0.08, 0.13, 0, 0.09]);
      // The run, Pip in her dust bath in the corner.
      for (var q = 0; q < 6; q++) cyl(0.03, 0.03, 0.8, at(-3.4 + q * 0.6, 0.4, -13.9), '--anm-wire', 4);
      box(3.0, 0.03, 0.03, at(-1.9, 0.78, -13.9), '--anm-wire');
      resident(-0.9, 0.15, -13.3, 0.16, 0.14, 0.13, [0.14, 0.14, 0, 0.07]);

      // THE MEWS for Otis, behind the barn on the left: a frame of wire as cold
      // as the air, and Otis on his high perch.
      var MX = -6.0, MZ = -13.5;
      [[-0.9, -0.9], [0.9, -0.9], [-0.9, 0.9], [0.9, 0.9]].forEach(function (c) { cyl(0.04, 0.04, 2.6, at(MX + c[0], 1.3, MZ + c[1]), '--anm-wire', 4); });
      box(1.9, 0.04, 1.9, at(MX, 2.6, MZ), '--anm-wire');
      for (q = -0.9; q <= 0.91; q += 0.3) {
        box(0.015, 2.6, 0.015, at(MX + q, 1.3, MZ + 0.9), '--anm-wire');
        box(0.015, 2.6, 0.015, at(MX + 0.9, 1.3, MZ + q), '--anm-wire');
      }
      box(1.2, 0.06, 0.06, at(MX, 2.0, MZ), '--anm-wire');
      resident(MX, 2.28, MZ, 0.17, 0.26, 0.16, [0, 0.3, 0, 0.13]);

      // THE FLOCK, Bramble at the edge of it, by the rail.
      [[2.4, -13.4], [3.4, -13.0], [3.0, -12.2]].forEach(function (s, i) {
        resident(s[0], 0.36, s[1], 0.36, 0.28, 0.24, [i ? 0.36 : -0.36, 0.14, 0, 0.13]);
      });
      // Duke on the shallow end, where the yard meets the water.
      kit.flat(new T.CircleGeometry(1, 24).scale(2.2, 1.1, 1), at(4.4, 0.025, -16.6, 0, -Math.PI / 2), '--anm-water');
      resident(4.2, 0.1, -16.6, 0.2, 0.11, 0.14, [0.18, 0.14, 0, 0.08]);

      // THE KEEPERS' HUT on the right, its doorway bright with the keeper
      // inside, and Hollis lying where he can see it.
      var HX = 6.0;
      box(3.0, 2.7, 5.4, at(HX + 1.5, 1.35, -8.0), '--anm-wall');
      box(3.4, 0.14, 5.8, at(HX + 1.5, 2.77, -8.0), '--anm-roof');
      kit.flat(new T.PlaneGeometry(0.9, 2.0), at(HX - 0.01, 1.0, -5.9, RIGHT), '--anm-door');
      resident(HX - 1.6, 0.18, -4.3, 0.48, 0.18, 0.22, [0.42, 0.14, -0.08, 0.13]);

      // NOTICE BOARDS for the page's own words: a dark plank on two posts, so
      // a card has something to stand on.
      function board(x, z, rot, wide, h) {
        var g = at(x, 0, z, rot);
        box(wide, 0.06, 0.3, M(g, at(0, 0.62, 0.05)), '--anm-case');
        [-wide / 2 + 0.08, wide / 2 - 0.08].forEach(function (o) { box(0.08, 0.62 + (h || 0), 0.08, M(g, at(o, (0.62 + (h || 0)) / 2, -0.04)), '--anm-case'); });
        return M(g, at(0, 0.66, 0.02));
      }

      // THE PAGE, on the hut's front wall by the track in.
      var pw = 2.6, ph = pw * 800 / 1180, py = 0.7 + ph / 2;
      box(pw + 0.2, ph + 0.2, 0.08, at(HX + 0.05, py, -2.9, RIGHT), '--anm-case');
      [-pw / 2, pw / 2].forEach(function (o) { box(0.1, py + ph / 2, 0.1, at(HX + 0.12, (py + ph / 2) / 2, -2.9 + o), '--anm-case'); });
      var page = kit.screen(1180, 800, pw, at(HX - 0.02, py, -2.9, RIGHT), 'All Needs Met’s own page, on the keepers’ hut by the track in',
        [0, 6, -4.6, 1.5]);

      // ON THE LEFT AS YOU COME IN: what this round is, and the house rules.
      var lede = kit.lift(page, '.anm-lede', { w: 760, ww: 1.9, m: board(-4.7, -1.4, LEFT, 2.1, 1.2), zone: [-6, 6, -4.6, 1.5] });
      var rules = kit.lift(page, '.anm-rules', { w: 760, h: 760, ww: 1.9, m: board(-4.7, -4.0, LEFT, 2.1, 1.2), zone: [-6, 6, -6.0, -2.4] });

      // ON THE BARN WALL by the door: who lives here, in their own words.
      var who = kit.lift(page, '.anm-part', { n: 1, w: 860, h: 860, ww: 2.4, m: at(BX + 0.04, 0.5, -9.3, LEFT), zone: [-6, 6, -11.5, -6.6] });

      // AT THE HUT: the screen in the keepers' hut on its wall, what is on it
      // and the way back under it, and the month of films beside it.
      var SW = 2.3, SZ = -7.6;
      var screen = kit.lift(page, '.anm-screen', { w: 820, ww: SW, m: at(HX - 0.04, 1.15, SZ, RIGHT), zone: [-6, 6, -11.5, -5.0] });
      var now = kit.lift(page, '.anm-screen__now', { w: 760, ww: 1.9, m: at(HX - 0.04, 0.8, SZ, RIGHT), zone: [-6, 6, -11.5, -5.0] });
      kit.lift(page, '.anm-screen__back', { w: 700, ww: 1.7, m: at(HX - 0.04, 0.5, SZ, RIGHT), zone: [-6, 6, -11.5, -5.0] });
      kit.lift(page, '.anm-rack__set', { w: 760, ww: 1.8, m: at(HX - 0.04, 2.25, -9.95, RIGHT), zone: [-6, 6, -12.5, -8.0] });
      var rack = kit.lift(page, '.anm-rack', { w: 860, h: 820, ww: 1.9, m: at(HX - 0.04, 0.35, -9.95, RIGHT), zone: [-6, 6, -12.5, -8.0] });

      // AT THE RAIL: the preserve, and what the sanctuary gives.
      var wild = kit.lift(page, '.anm-part', { n: 2, w: 860, h: 700, ww: 2.2, m: board(-1.6, RAIL + 0.35, 0, 2.4, 0.3), zone: [-6, 2.8, -15, -11.8] });
      var gives = kit.lift(page, '.anm-part', { n: 3, w: 860, h: 700, ww: 2.2, m: board(1.6, RAIL + 0.35, 0, 2.4, 0.3), zone: [-6, 2.8, -15, -11.8] });

      kit.wire(page, 'rack.js');

      return {
        start: { x: 0, z: 1.0, yaw: 0 },
        bounds: { x: [-4.6, 4.6], z: [RAIL + 1.3, 1.4] },
        stops: [
          { name: 'in at the gate off the track from the stile, the yard dark and the barn’s and the hut’s doorways bright', x: 0, z: 1.0, yaw: 0, pitch: 0.06 },
          { name: 'at the keepers’ hut by the track in, the sanctuary’s own page on its wall', x: HX - 2.4, z: -2.9, yaw: RIGHT, pitch: 0.05, page: kit.page, frame: page },
          { name: 'at the board on the left: the night round, and why there is no torch', x: -2.4, z: -1.4, yaw: LEFT, pitch: 0.08, frame: lede.el },
          { name: 'at the board on the left: the house rules', x: -2.4, z: -4.0, yaw: LEFT, pitch: 0.06, frame: rules.el },
          { name: 'by the barn door, Juniper at her bale, and who lives here on the barn wall', x: -3.0, z: -9.3, yaw: LEFT, pitch: 0.02, frame: who.el },
          { name: 'by the mews, Otis on his high perch', x: -3.6, z: -12.6, yaw: 1.21, pitch: 0.2 },
          { name: 'at the keepers’ hut: the screen in it, dark until somebody presses something', x: 3.1, z: SZ, yaw: RIGHT, pitch: 0.02, frame: screen.el },
          { name: 'under the screen: what is on it, and the way back', x: 3.4, z: SZ, yaw: RIGHT, pitch: -0.18, frame: now.el },
          { name: 'at the hut: a month of films from people who look after animals and the wild', x: 3.3, z: -9.95, yaw: RIGHT, pitch: 0.0, frame: rack.el },
          { name: 'at the rail on the left: the preserve, and who you might see from here', x: -1.6, z: RAIL + 2.3, yaw: 0, pitch: 0.0, frame: wild.el },
          { name: 'at the rail on the right: what the sanctuary gives', x: 1.6, z: RAIL + 2.3, yaw: 0, pitch: 0.0, frame: gives.el },
          { name: 'at the rail, looking out over the wetland: a heron white in the shallows, Duke in the shallow end', x: 4.0, z: RAIL + 1.4, yaw: 0.4, pitch: -0.08 }
        ]
      };
    }
  };
})();

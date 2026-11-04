/* =============================================================================
   Gentle Help Cannabis Farm, walked into on Cel Street, north-west of the
   stile in Nature's Contribution. Ryan's ask, 2026-11-03: Nature's
   Contribution and its places.

   IT IS THE ROOM'S OWN WORLD (§107): down the middle path of a hoop house in
   the afternoon. THE LIGHT COMES THROUGH THE HOUSE'S OWN SKIN: the whole arch
   of milky plastic glows at once, so the skin is drawn unlit, as a thing that
   gives light rather than takes it, and everything under it is lit evenly from
   above and both sides, with only a soft shadow on the floor under each plant
   and no hard one anywhere. Hoops arch over the path, closer together towards
   the lit doorway at the far end, and through it is the potting shed. In the
   beds both sides, cannabis in flower, its colas with their orange hairs and
   their frost, some of them purple, and along the beds' edges the companions
   the page names: basil, dill and marigolds.

   THE COLLISIONS ARE §107's: Learning Large is this room turned inside out,
   night and red and blue lamps and no green; here it is day, no lamp, and
   nothing but green and flowers. If a lamp is ever hung in here, the two have
   met. The Garden is midday through leaves, with small hard shadows; here the
   shadows are soft and the ground is warm milk.

   EVERY WORD IS THE PAGE'S. What is in a strain, how to be careful, why the
   farm is here: all of it is lifted off the page onto boards standing in the
   beds, and this file says nothing about what the plant does for anybody.
   Nothing here is for sale.

   NOTHING MOVES, at any setting. Every colour is one §107 declares, by name.
   It keeps nothing, sends nothing and fetches nothing; its page arrives
   through Cel Street's screen(), and the screen by the doorway plays through
   the page's own rack.js, nothing loading until somebody presses.
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 11, 374761393) ^ Math.imul(j + 5, 668265263) ^ Math.imul(k + 23, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['gentle-help.html'] = {
    name: 'Gentle Help Cannabis Farm',
    from: 'natures-contribution.html',
    faces: [],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var R = 3.6, NEAR = 1.6, FAR = -19.0, L = NEAR - FAR;   // the tunnel
      var PATH = 0.6;                                          // half the path

      // THE GLOW: the skin's own light, even, from above and both sides, and
      // the floor a little warmer under it.
      kit.scene.background = kit.col('--ghc-skin');
      kit.scene.fog = new T.Fog(kit.col('--ghc-skin'), 26, 70);
      kit.scene.add(new T.HemisphereLight(kit.col('--ghc-door'), kit.col('--ghc-floor'), 2.6));

      // THE SKIN: a half-cylinder of milky plastic over the hoops, unlit,
      // seen from inside; and the two ends, each with its doorway.
      var skin = kit.flat(new T.CylinderGeometry(R, R, L, 40, 1, true, Math.PI / 2, Math.PI), at(0, 0, (NEAR + FAR) / 2, 0, Math.PI / 2), '--ghc-skin');
      skin.material.side = T.DoubleSide;
      [NEAR, FAR].forEach(function (z, i) {
        var end = kit.flat(new T.CircleGeometry(R, 40, 0, Math.PI), at(0, 0, z), '--ghc-skin');
        end.material.side = T.DoubleSide;
        kit.flat(new T.PlaneGeometry(1.6, 2.2), at(0, 1.1, z + (i ? 0.02 : -0.02), i ? 0 : Math.PI), '--ghc-door');
      });
      // The hoops, closer together towards the far end.
      for (var z = NEAR - 0.1, gap = 2.2; z > FAR; z -= gap, gap = Math.max(1.3, gap * 0.94)) {
        kit.piece(new T.TorusGeometry(R - 0.04, 0.035, 5, 32, Math.PI), at(0, 0, z), '--ghc-rib', false);
      }
      box(0.06, 0.06, L, at(0, R - 0.08, (NEAR + FAR) / 2), '--ghc-rib', false);

      // THE FLOOR: the beds both sides, the path down the middle, and a low
      // board edging each bed.
      box(R * 2, 0.08, L, at(0, -0.04, (NEAR + FAR) / 2), '--ghc-floor', false, false);
      box(PATH * 2, 0.02, L, at(0, 0.005, (NEAR + FAR) / 2), '--ghc-path', false, false);
      [-1, 1].forEach(function (s) { box(0.05, 0.14, L - 0.4, at(s * (PATH + 0.05), 0.07, (NEAR + FAR) / 2), '--ghc-rib', false); });

      // A SOFT SHADOW, straight under a thing, on the floor.
      function shade(x, z, r) { kit.flat(new T.CircleGeometry(r, 20), at(x, 0.012, z, 0, -Math.PI / 2), '--ghc-shadow'); }

      // CANNABIS IN FLOWER: a stem, tiers of leaves, and a cola at the top
      // with its orange hairs and its frost. Every fourth plant flowers purple.
      function plant(x, z, h, n) {
        shade(x, z, 0.42 * h);
        cyl(0.025, 0.04, h * 0.85, at(x, h * 0.42, z), '--ghc-stem', false, 5);
        for (var t = 0; t < 4; t++) {
          var r = h * (0.36 - t * 0.07), y = h * (0.28 + t * 0.17);
          var cone = new T.ConeGeometry(r, h * 0.22, 7); cone.scale(1, 0.75, 1);
          kit.piece(cone, at(x, y, z, hash(n, t, 1) * 3), t % 2 ? '--ghc-leaf-light' : '--ghc-leaf', false);
        }
        var bud = n % 4 === 3 ? '--ghc-bud-purple' : '--ghc-bud';
        kit.piece(new T.SphereGeometry(0.1, 8, 6).scale(1, 2.2, 1), at(x, h * 0.92, z), bud, false);
        for (var p = 0; p < 5; p++) {
          var a = hash(n, p, 2) * Math.PI * 2, py = h * (0.84 + hash(n, p, 3) * 0.16);
          kit.piece(new T.SphereGeometry(0.018, 4, 3), at(x + Math.cos(a) * 0.1, py, z + Math.sin(a) * 0.1), p % 2 ? '--ghc-pistil' : '--ghc-trichome', false);
        }
      }
      // THE COMPANIONS along the bed's edge, as the page names them.
      function companion(x, z, n) {
        var kind = n % 3;
        if (kind === 0) {           // basil, a low round bush
          shade(x, z, 0.18);
          kit.piece(new T.SphereGeometry(0.17, 8, 6).scale(1, 0.75, 1), at(x, 0.14, z), '--ghc-basil', false);
        } else if (kind === 1) {    // marigolds, flowers over a leaf
          shade(x, z, 0.16);
          kit.piece(new T.SphereGeometry(0.14, 8, 6).scale(1, 0.6, 1), at(x, 0.1, z), '--ghc-leaf', false);
          for (var f = 0; f < 3; f++) kit.piece(new T.SphereGeometry(0.05, 6, 4), at(x + (f - 1) * 0.08, 0.2, z + (f % 2) * 0.05), '--ghc-marigold', false);
        } else {                    // dill, a tall stalk and its umbel
          shade(x, z, 0.1);
          cyl(0.01, 0.012, 0.7, at(x, 0.35, z), '--ghc-stem', false, 4);
          kit.piece(new T.CylinderGeometry(0.12, 0.02, 0.06, 8), at(x, 0.72, z), '--ghc-dill', false);
        }
      }
      var n = 0;
      for (z = NEAR - 1.2; z > FAR + 1.2; z -= 1.15) {
        [-1, 1].forEach(function (s) {
          plant(s * 1.55, z + hash(n, 9, 1) * 0.3, 1.3 + hash(n, 9, 2) * 0.35, n++);
          plant(s * 2.5, z - 0.5, 1.05 + hash(n, 9, 2) * 0.25, n++);
          companion(s * (PATH + 0.32), z - 0.3, n++);
        });
      }

      // A BOARD standing in the bed by the path for the page's words: a
      // plank on two posts in the hoops' colour, so a card has a foot.
      function board(side, zz, wide) {
        var g = at(side * 1.35, 0, zz, side < 0 ? LEFT : RIGHT);
        box(wide, 0.05, 0.22, M(g, at(0, 0.5, 0.04)), '--ghc-rib');
        [-wide / 2 + 0.06, wide / 2 - 0.06].forEach(function (o) { box(0.06, 0.5, 0.06, M(g, at(o, 0.25, -0.03)), '--ghc-rib'); });
        return M(g, at(0, 0.54, 0.02));
      }
      function zone(zz) { return [-PATH - 0.1, PATH + 0.1, zz - 2.0, zz + 2.0]; }

      // JUST INSIDE: the farm's own page on the left, what this is on the right.
      var Z1 = -1.6, Z2 = -5.6, Z3 = -9.6, Z4 = -13.6, ZE = FAR + 1.2;
      var pw = 1.8, ph = pw * 800 / 1180;
      var pg = board(-1, Z1, 2.0);
      var page = kit.screen(1180, 800, pw, M(pg, at(0, ph / 2 + 0.02, 0)), 'Gentle Help’s own page, on a board in the bed just inside the hoop house', zone(Z1));
      var lede = kit.lift(page, '.ghc-lede', { w: 760, ww: 1.6, m: board(1, Z1, 1.8), zone: zone(Z1) });
      // FURTHER IN: what is in it, and why the farm is here.
      var strains = kit.lift(page, '.ghc-part', { n: 1, w: 860, h: 680, ww: 1.65, m: board(-1, Z2, 1.8), zone: zone(Z2) });
      var why = kit.lift(page, '.ghc-part', { n: 3, w: 860, h: 680, ww: 1.65, m: board(1, Z2, 1.8), zone: zone(Z2) });
      // HALFWAY: how to be careful, and the companions.
      var care = kit.lift(page, '.ghc-part', { n: 4, w: 860, h: 680, ww: 1.65, m: board(-1, Z3, 1.8), zone: zone(Z3) });
      var comp = kit.lift(page, '.ghc-part', { n: 2, w: 860, h: 680, ww: 1.65, m: board(1, Z3, 1.8), zone: zone(Z3) });
      // TOWARDS THE DOOR: what the farm gives, and the rules on this farm.
      var gives = kit.lift(page, '.ghc-part', { n: 5, w: 860, h: 680, ww: 1.65, m: board(-1, Z4, 1.8), zone: zone(Z4) });
      var rules = kit.lift(page, '.ghc-rules', { w: 860, h: 680, ww: 1.65, m: board(1, Z4, 1.8), zone: zone(Z4) });

      // AT THE FAR END, either side of the lit doorway through to the potting
      // shed: its screen on a potting bench on the left, the rack on the right.
      var EZ = [-PATH - 0.1, PATH + 0.1, FAR + 0.6, FAR + 4.6];
      [-1, 1].forEach(function (s) {
        box(1.7, 0.08, 0.6, at(s * 1.75, 0.8, FAR + 0.45), '--ghc-rib');
        [-0.75, 0.75].forEach(function (o) { box(0.06, 0.8, 0.06, at(s * 1.75 + o, 0.4, FAR + 0.45), '--ghc-rib'); });
      });
      var screen = kit.lift(page, '.ghc-screen', { w: 820, ww: 1.6, m: at(-1.75, 1.32, FAR + 0.16), zone: EZ });
      var now = kit.lift(page, '.ghc-screen__now', { w: 760, ww: 1.4, m: at(-1.75, 1.02, FAR + 0.3), zone: EZ });
      kit.lift(page, '.ghc-screen__back', { w: 700, ww: 1.3, m: at(-1.75, 0.86, FAR + 0.3), zone: EZ });
      var rack = kit.lift(page, '.ghc-rack', { w: 820, h: 780, ww: 1.5, m: at(1.75, 0.86, FAR + 0.16), zone: EZ });

      kit.wire(page, 'rack.js');

      return {
        start: { x: 0, z: 0.9, yaw: 0 },
        bounds: { x: [-PATH + 0.1, PATH - 0.1], z: [FAR + 1.4, 1.0] },
        stops: [
          { name: 'just inside the hoop house, the whole skin glowing and the cannabis in flower in the beds both sides', x: 0, z: 0.9, yaw: 0, pitch: 0.1 },
          { name: 'at the board on the left: the farm’s own page', x: 0.5, z: Z1, yaw: LEFT, pitch: -0.12, page: kit.page, frame: page },
          { name: 'at the board on the right: what this farm is', x: -0.5, z: Z1, yaw: RIGHT, pitch: -0.12, frame: lede.el },
          { name: 'at the board on the left: what is in it, as far as anybody can say', x: 0.5, z: Z2, yaw: LEFT, pitch: -0.12, frame: strains.el },
          { name: 'at the board on the right: why this farm is here', x: -0.5, z: Z2, yaw: RIGHT, pitch: -0.12, frame: why.el },
          { name: 'at the board on the left: how to be careful', x: 0.5, z: Z3, yaw: LEFT, pitch: -0.12, frame: care.el },
          { name: 'at the board on the right: grown with companions, basil, dill and marigolds along the bed', x: -0.5, z: Z3, yaw: RIGHT, pitch: -0.12, frame: comp.el },
          { name: 'at the board on the left: what the farm gives', x: 0.5, z: Z4, yaw: LEFT, pitch: -0.12, frame: gives.el },
          { name: 'at the board on the right: on this farm', x: -0.5, z: Z4, yaw: RIGHT, pitch: -0.12, frame: rules.el },
          { name: 'at the far end by the lit doorway: the potting shed’s screen on the bench, dark until somebody presses something', x: -0.4, z: ZE + 1.4, yaw: 0.35, pitch: -0.08, frame: screen.el },
          { name: 'under the screen: what is on it, and the way back', x: -0.4, z: ZE + 1.0, yaw: 0.4, pitch: -0.3, frame: now.el },
          { name: 'at the far end by the lit doorway: the rack of films about growing among other plants', x: 0.4, z: ZE + 1.4, yaw: -0.35, pitch: -0.06, frame: rack.el }
        ]
      };
    }
  };
})();

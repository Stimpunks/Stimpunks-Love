/* =============================================================================
   The Doom Scoop, walked into on Cel Street. Ryan's ask, 2026-10-31: back on the
   street, working down it a room at a time.

   IT IS THE DOOM SCOOP'S WORLD AND NOBODY ELSE'S (§61): an ice cream parlour
   after closing, the shop's own lights off, lit only by the dipping cabinet
   along the back. Its light is ONE COLD TUBE under the lid, whose job is to
   show the flavours without warming them, so it falls straight down into the
   tubs and leaves the front of the counter dark. A TUB FOR EVERY MORNING OF
   THE LAST WEEK: each tub's flavour is its weekday, read off the page's own tub
   (so a tub keeps its colour as it ages), and how scraped out it is says how
   old it is, nothing about how much is in it: this morning's is full to the
   lid, six mornings ago nearly to the bottom.

   THERE IS NO PAPER IN HERE: no newsprint, no masthead, no column rule and no
   blackletter, because newsprint is the Doomscroll's, one door-name away. The
   scroll has no end and the scoop has a bottom. No pink (Pink Pony Club), no
   amber and no split-flap (The Feed, the other room a timer fills every
   morning). Chairs are up on the tables, because it is after closing.

   THE TUBS ARE THE PAGE'S OWN, lifted off it by the kit and hung on the back
   wall over their wells, each with its screen and its scoops, and rack.js, the
   page's own script, plays them where they hang or puts them up on that tub's
   screen; nothing reaches YouTube until a press, and the headlines are the
   channels' own, quoted as written. Ground News and MeidasTouch are doors on
   the counter, as on the page.

   NOTHING MOVES. Every colour is one the Doom Scoop declares, by name. It
   keeps nothing, sends nothing and fetches nothing; its page arrives through
   Cel Street's screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['the-doom-scoop.html'] = {
    name: 'The Doom Scoop',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var W = 12, D = 10, H = 3.4, back = -D;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;

      // THE SHOP WITH ITS LIGHTS OFF, a little of the cabinet's cold thrown
      // back off the walls, and the one tube under the lid falling straight
      // down into the tubs.
      kit.scene.background = kit.col('--ds-shop');
      kit.scene.add(new T.HemisphereLight(kit.col('--ds-rime'), kit.col('--ds-front'), 0.9));
      var CZ = back + 1.0, CH = 0.95;
      var tube = new T.SpotLight(kit.col('--ds-tube'), 14, 5, 1.35, 0.7, 1.2);
      tube.position.set(0, CH + 0.5, CZ - 0.2);
      tube.target.position.set(0, 0, CZ + 0.1);
      tube.castShadow = true;
      tube.shadow.mapSize.set(1024, 1024);
      tube.shadow.bias = -0.0008; tube.shadow.normalBias = 0.02;
      kit.scene.add(tube, tube.target);

      // THE PARLOUR: a dark floor, the walls, the ceiling, the door behind you.
      box(W, 0.1, D + 2, at(0, -0.05, -D / 2 + 1), '--ds-front', false, false);
      box(0.3, H, D + 2, at(-W / 2 - 0.15, H / 2, -D / 2 + 1), '--ds-shop');
      box(0.3, H, D + 2, at(W / 2 + 0.15, H / 2, -D / 2 + 1), '--ds-shop');
      box(W + 0.6, H, 0.3, at(0, H / 2, back - 0.15), '--ds-shop');
      box(W + 0.6, 0.2, D + 2, at(0, H + 0.1, -D / 2 + 1), '--ds-well', false, false);
      box((W - 1.6) / 2, H, 0.3, at(-(W + 1.6) / 4, H / 2, 1.15), '--ds-shop');
      box((W - 1.6) / 2, H, 0.3, at((W + 1.6) / 4, H / 2, 1.15), '--ds-shop');
      box(1.6, H - 2.2, 0.3, at(0, 2.2 + (H - 2.2) / 2, 1.15), '--ds-shop');
      box(1.5, 2.15, 0.08, at(0, 1.08, 1.02), '--ds-front', 0.015);
      box(0.06, 0.3, 0.06, at(0.55, 1.05, 0.94), '--ds-steel', false);

      // THE DIPPING CABINET along the back wall: a dark counter front with a
      // stainless rim, seven wells in a row, a tub sunk in each, the lid over
      // them with the tube along its underside, and the glass's frame and
      // sneeze rail in steel. The cabinet's own glass is left out, so the tubs
      // can be seen into from where you stand.
      var CL = 7 * 1.35 + 0.4, CD = 1.1;
      box(CL, CH, CD, at(0, CH / 2, CZ), '--ds-front', 0.02);
      box(CL + 0.1, 0.06, CD + 0.1, at(0, CH + 0.03, CZ), '--ds-steel', 0.012);
      box(CL, 0.05, 0.5, at(0, CH + 0.62, CZ - 0.32), '--ds-steel', 0.012);
      kit.flat(new T.CylinderGeometry(0.03, 0.03, CL - 0.4, 10), at(0, CH + 0.57, CZ - 0.2, 0, 0, Math.PI / 2), '--ds-tube');
      [-1, 1].forEach(function (e) {
        box(0.06, 0.62, 0.06, at(e * (CL / 2 - 0.05), CH + 0.31, CZ + CD / 2 - 0.05), '--ds-steel', false);
        box(0.06, 0.62, 0.06, at(e * (CL / 2 - 0.05), CH + 0.31, CZ - CD / 2 + 0.05), '--ds-steel', false);
      });
      box(CL, 0.04, 0.04, at(0, CH + 0.6, CZ + CD / 2 - 0.05), '--ds-steel', false);

      // THE ROOM'S OWN PAGE, on the left-hand wall near the door, in the dark.
      var pw = 3.0, ph = pw * 800 / 1180, py = 0.8 + ph / 2;
      var pg = at(-W / 2 + 0.02, 0, -3.0, LEFT);
      box(pw + 0.16, ph + 0.16, 0.05, M(pg, at(0, py, 0)), '--ds-steel', 0.012);
      var page = kit.screen(1180, 800, pw, M(pg, at(0, py, 0.04)), 'The Doom Scoop’s own page, on the left-hand wall near the door');

      // THE TUBS, one a morning, this morning's on the left. Every tub's
      // contents take its flavour off the page's own tub once it arrives; how
      // low they sit is how many mornings old the tub is.
      var FLAVOUR = {
        pistachio: '--ds-pistachio', lemon: '--ds-lemon', mint: '--ds-mint', vanilla: '--ds-vanilla',
        mango: '--ds-mango', blueberry: '--ds-blueberry', taro: '--ds-taro'
      };
      var AGE = [
        'this morning’s tub, full to the lid',
        'yesterday’s tub, the first scoops out of it',
        'the tub from two mornings ago',
        'the tub from three mornings ago, half gone',
        'the tub from four mornings ago',
        'the tub from five mornings ago, well down',
        'the tub from six mornings ago, scraped nearly to the bottom'
      ];
      var stops = [{ name: 'just inside the door, the shop’s lights off and the cabinet lit along the back', x: 0, z: -0.4, yaw: 0, pitch: 0.05 }];
      var PW = 640, TW = 1.25;
      for (var n = 0; n < 7; n++) {
        var x = -4.05 + n * 1.35;
        box(1.2, 0.05, 0.8, at(x, CH + 0.005, CZ + 0.05), '--ds-well', false, false);
        cyl(0.04, 0.04, 0.8, at(x - 0.6, CH + 0.02, CZ + 0.05, 0, Math.PI / 2), '--ds-steel', false, 6);
        var fill = 0.32 * (1 - n / 7.6);
        var stuff = kit.facets(new T.BoxGeometry(1.08, fill, 0.7, 3, 1, 2), at(x, CH - 0.34 + fill / 2, CZ + 0.05), '--ds-frost');
        // A scoop taken out of all but this morning's, nearer the front the older it is.
        if (n) kit.facets(new T.SphereGeometry(0.16, 10, 6), at(x - 0.2 + (n % 3) * 0.18, CH - 0.34 + fill + 0.04, CZ + 0.2 - n * 0.02), '--ds-well');
        var tub = kit.lift(page, '.ds-tub', { n: n, w: PW, h: 760, ww: TW, m: at(x, CH + 0.82, back + 0.03) });
        (function (mesh) {
          kit.follow(tub, '.ds-tub', function (read, node) {
            var m = /ds-tub--(\w+)/.exec(node.getAttribute('class') || '');
            var ink = m && FLAVOUR[m[1]];
            if (ink) mesh.material.color.copy(kit.col(ink));
          });
        })(stuff);
        stops.push({ name: 'at ' + AGE[n] + ', on the wall over its well', x: x, z: CZ + 2.6, yaw: 0, pitch: 0.28, frame: tub.el });
      }
      kit.wire(page, 'rack.js');

      // THE PARLOUR'S SIGN, hung over the door inside, facing in.
      var sign = kit.lift(page, '.ds-head', { w: 760, ww: 2.4, m: at(0, 2.3, 0.98, Math.PI), drop: 'svg' });
      stops.push({ name: 'looking back at the parlour’s sign, hung over the door inside', x: 0, z: -3.6, yaw: Math.PI, pitch: 0.28, frame: sign.el });

      // THE COUNTER by the door on the right, with its two doors on it, and
      // what is behind it on the wall.
      var ct = at(W / 2 - 1.4, 0, -3.2, RIGHT);
      box(2.8, 0.95, 0.7, M(ct, at(0, 0.475, 0)), '--ds-front', 0.02);
      box(2.9, 0.05, 0.8, M(ct, at(0, 0.975, 0)), '--ds-steel', 0.012);
      var counter = kit.lift(page, '.ds-part', { n: 1, w: 640, h: 600, ww: 1.4, m: M(ct, at(0, 1.0, 0.0, 0, -0.95)) });
      var rules = kit.lift(page, '.ds-part', { n: 0, w: 640, h: 820, ww: 1.5, m: at(W / 2 - 0.02, 1.15, -5.6, RIGHT) });
      stops.push(
        { name: 'at the counter by the door, with the doors that are not in the cabinet on it', x: W / 2 - 2.9, z: -3.2, yaw: RIGHT, pitch: -0.32, frame: counter.el },
        { name: 'at the wall behind the counter, with how the cabinet is filled', x: W / 2 - 2.8, z: -5.6, yaw: RIGHT, pitch: 0.12, frame: rules.el });

      // ON THE LEFT-HAND WALL past the page: if that was a lot, and whose this all is.
      var after = kit.lift(page, '.ds-part', { n: 2, w: 640, h: 700, ww: 1.4, m: at(-W / 2 + 0.02, 1.15, -6.0, LEFT) });
      var whose = kit.lift(page, '.ds-part', { n: 3, w: 640, h: 700, ww: 1.4, m: at(-W / 2 + 0.02, 1.15, -7.9, LEFT) });
      stops.push(
        { name: 'at the left-hand wall, with the room’s own page on it', x: -W / 2 + 2.6, z: -3.0, yaw: LEFT, pitch: 0.1, page: kit.page, frame: page },
        { name: 'at the word on the left-hand wall for if that was a lot', x: -W / 2 + 2.4, z: -6.0, yaw: LEFT, pitch: 0.12, frame: after.el },
        { name: 'at whose this all is, on the left-hand wall', x: -W / 2 + 2.4, z: -7.9, yaw: LEFT, pitch: 0.12, frame: whose.el });

      // THE TABLES, after closing: two small round ones in steel on the dark
      // floor, the chairs turned up on them.
      [[-2.2, -4.4], [1.6, -5.0]].forEach(function (p) {
        cyl(0.04, 0.04, 0.72, at(p[0], 0.36, p[1]), '--ds-steel', 0.01, 8);
        cyl(0.26, 0.3, 0.03, at(p[0], 0.015, p[1]), '--ds-steel', false, 16);
        cyl(0.45, 0.45, 0.04, at(p[0], 0.74, p[1]), '--ds-steel', 0.012, 24);
        [-1, 1].forEach(function (e) {
          var cg = at(p[0] + e * 0.2, 0.76, p[1], e * 0.4, Math.PI);
          box(0.4, 0.04, 0.4, M(cg, at(0, 0.02, 0)), '--ds-steel', 0.01);
          [[-0.17, -0.17], [0.17, -0.17], [-0.17, 0.17], [0.17, 0.17]].forEach(function (l) {
            cyl(0.015, 0.015, 0.44, M(cg, at(l[0], -0.22, l[1])), '--ds-steel', false, 6);
          });
        });
      });

      return {
        start: { x: 0, z: -0.4, yaw: 0 },
        bounds: { x: [-W / 2 + 1.0, W / 2 - 1.0], z: [CZ + CD / 2 + 0.7, 0.4] },
        stops: stops
      };
    }
  };
})();

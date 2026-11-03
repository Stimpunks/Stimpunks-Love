/* =============================================================================
   Glow Go Gee Gaws, walked into on Cel Street, off the passage at level B3 of
   Arlesglad Caverns. Ryan's ask, 2026-11-02: the caverns' levels.

   A SHOP WITH THE LIGHTS OFF, IN EVERY COLOUR GLOW COMES IN (§67). Shelves
   round a small dark room, and the caverns' handrail running along the front
   of every shelf, the one light in here, steady and pale. Every toy on the
   drawn shelves is dark, in the room's unlit ink: nothing in the scene lights,
   fades or glows by itself, because a toy here only glows after somebody
   charges it, and then gives the light back until it has none. That is the
   room's whole kind of light, and the scene does not fake it.

   THE TOYS YOU CAN CHARGE ARE THE PAGE'S OWN, lifted off it whole onto the
   left-hand wall, with glow.js wired: hold one up to the rail and it glows
   and fades there exactly as on the page, at Gentle staying lit for its time
   and then going dark in one step, with the same words. The rail's own part
   of the page, Hold everything up to the rail at once, stands by the counter.
   It keeps nothing, sends nothing and makes no sound, here as on the page.

   NOTHING MOVES and nothing is for sale. Every colour is one §67 declares, by
   name. The room's page arrives through Cel Street's screen().
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['glow-go-gee-gaws.html'] = {
    name: 'Glow Go Gee Gaws',
    from: 'arlesglad-caverns.html',
    faces: ['"Baloo 2"'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var X0 = -3.4, X1 = 3.4, NEAR = 2.6, FAR = -5.0, H = 2.8;   // the shop
      var MIDZ = (NEAR + FAR) / 2, D = NEAR - FAR, W = X1 - X0;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      function M(a, b) { return new T.Matrix4().multiplyMatrices(a, b); }
      function rnd(i) { var x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); }

      // THE DARK: the shop's own colour, and only as much of the shelves' that
      // a shelf can be told from the wall behind it.
      kit.scene.background = kit.col('--gg-dark');
      kit.scene.add(new T.HemisphereLight(kit.col('--gg-shelf'), kit.col('--gg-dark'), 0.9));

      // THE ROOM: low and close, the floor and the walls the shop's dark.
      box(W, 0.1, D, at(0, -0.05, MIDZ), '--gg-dark', false, false);
      box(W, 0.1, D, at(0, H + 0.05, MIDZ), '--gg-dark', false, false);
      [-1, 1].forEach(function (s) { box(0.2, H, D, at(s * (W / 2 + 0.1), H / 2, MIDZ), '--gg-dark', 0.01, false); });
      box(W, H, 0.2, at(0, H / 2, FAR - 0.1), '--gg-dark', 0.01, false);
      box(W, H, 0.2, at(0, H / 2, NEAR + 0.1), '--gg-dark', 0.01, false);

      // THE WAY IN from the passage: an opening in the near wall, its frame in
      // the shelves' line.
      var DX = -2.2;
      box(1.1, 2.1, 0.06, at(DX, 1.05, NEAR - 0.02), '--gg-dark', false, false);
      [-1, 1].forEach(function (k) { box(0.07, 2.16, 0.1, at(DX + k * 0.58, 1.08, NEAR - 0.04), '--gg-shelf-line', 0.006); });
      box(1.24, 0.07, 0.1, at(DX, 2.16, NEAR - 0.04), '--gg-shelf-line', 0.006);

      // THE RAIL, at the front of a shelf: a thin pale strip, lit, and a small
      // steady light along it that reaches the toys on that shelf and no
      // further. No toy is lit by it until somebody holds one up.
      function rail(len, m) {
        kit.flat(new T.BoxGeometry(len, 0.022, 0.022), m, '--gg-text');
      }
      function railLights(x0, x1, y, z, side) {
        for (var x = x0; x <= x1 + 0.01; x += 1.6) {
          var p = new T.PointLight(kit.col('--gg-text'), 0.9, 1.6, 1.6);
          if (side) p.position.set(side, y + 0.12, x); else p.position.set(x, y + 0.12, z);
          kit.scene.add(p);
        }
      }

      // A dark toy: one of a few moulded shapes, in the unlit ink.
      var star = (function () {
        var s = new T.Shape();
        for (var i = 0; i < 10; i++) {
          var r = i % 2 ? 0.035 : 0.08, a = i / 10 * Math.PI * 2 + Math.PI / 2;
          if (i === 0) s.moveTo(Math.cos(a) * r, Math.sin(a) * r); else s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        s.closePath();
        return new T.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: false });
      })();
      function toy(kind, m) {
        if (kind === 0) kit.piece(star.clone(), M(m, at(0, 0.08, 0)), '--gg-unlit', 0.004);
        else if (kind === 1) kit.piece(new T.SphereGeometry(0.07, 14, 10), M(m, at(0, 0.07, 0)), '--gg-unlit', 0.004);
        else if (kind === 2) box(0.1, 0.1, 0.1, M(m, at(0, 0.05, 0, 0.5)), '--gg-unlit', 0.004);
        else if (kind === 3) cyl(0.025, 0.025, 0.26, M(m, at(0, 0.13, 0)), '--gg-unlit', 0.004, 10);
        else if (kind === 4) kit.piece(new T.TorusGeometry(0.07, 0.022, 8, 16), M(m, at(0, 0.09, 0)), '--gg-unlit', 0.004);
        else kit.piece(new T.SphereGeometry(0.1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), M(m, at(0, 0, 0)), '--gg-unlit', 0.004);
      }

      // A run of shelves standing against a wall, the toys on them dark and
      // the rail along the front of each. m faces the room down its own +z.
      function shelving(len, m, seed) {
        [0.55, 1.15, 1.75, 2.35].forEach(function (y, row) {
          box(len, 0.05, 0.42, M(m, at(0, y, 0.21)), '--gg-shelf', 0.006, false);
          box(len, 0.02, 0.02, M(m, at(0, y + 0.035, 0.42)), '--gg-shelf-line', false, false);
          rail(len, M(m, at(0, y - 0.06, 0.45)));
          var n = Math.floor(len / 0.32);
          for (var i = 0; i < n; i++) {
            var k = seed + row * 37 + i;
            if (rnd(k) < 0.2) continue;
            toy(Math.floor(rnd(k + 9) * 6), M(m, at(-len / 2 + 0.2 + i * 0.32, y + 0.025, 0.2 + (rnd(k + 3) - 0.5) * 0.14, rnd(k + 5) * 6)));
          }
        });
        [-1, 1].forEach(function (s) { box(0.05, 2.45, 0.42, M(m, at(s * len / 2, 1.22, 0.21)), '--gg-shelf', 0.006, false); });
      }
      shelving(W - 0.4, at(0, 0, FAR + 0.02), 1);
      railLights(X0 + 0.6, X1 - 0.6, 1.15, FAR + 0.6);
      railLights(X0 + 0.6, X1 - 0.6, 1.75, FAR + 0.6);
      // A run along the right-hand wall at the back, under the words there.
      shelving(2.2, at(X1 - 0.02, 0, FAR + 1.6, RIGHT), 300);

      // THE NAME, over the back shelves, lettered in the room's own face in the
      // words' ink on the shop's dark.
      var sign = kit.paper(1200, 200, function (c, w, h) {
        c.fillStyle = kit.ink('--gg-dark'); c.fillRect(0, 0, w, h);
        c.fillStyle = kit.ink('--gg-text');
        c.font = '800 132px "Baloo 2"'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText('Glow Go Gee Gaws', w / 2, h / 2 + 8);
      });
      kit.sheet(sign, 2.4, 0.4, at(0, 2.58, FAR + 0.46));

      // THE COUNTER near the back on the right, where the rail's own part of
      // the page stands: Hold everything up to the rail at once.
      box(1.6, 0.9, 0.6, at(1.4, 0.45, -1.9), '--gg-shelf', 0.008, true);
      box(1.64, 0.04, 0.64, at(1.4, 0.92, -1.9), '--gg-shelf-line', false, false);
      rail(1.6, at(1.4, 0.86, -1.58));

      // THE ROOM'S OWN PAGE on the near wall, right of the way in.
      var pw = 2.2, ph = pw * 800 / 1180, px = 1.0;
      box(pw + 0.1, ph + 0.1, 0.04, at(px, 0.7 + ph / 2, NEAR - 0.02), '--gg-shelf', 0.008, false);
      var frame = kit.screen(1180, 800, pw, at(px, 0.7 + ph / 2, NEAR - 0.05, Math.PI), 'Glow Go Gee Gaws’ own page, on the wall by the way in');

      // THE TOYS YOU CAN CHARGE, the page's own shelf of them, whole, on the
      // left-hand wall; the rail's part on the counter; and glow.js to work
      // both, as on the page.
      var shelf = kit.lift(frame, '.gg-section', { n: 1, w: 1000, h: 980, ww: 2.5, m: at(X0 + 0.04, 0.3, -1.4, LEFT) });
      var railPart = kit.lift(frame, '.gg-section', { n: 0, w: 900, ww: 1.5, m: at(1.4, 0.96, -1.95), zone: [0, X1, -1.6, 0.6] });
      kit.wire(frame, 'glow.js');

      // THE PAGE'S OWN WORDS, as the page has them.
      var over = kit.lift(frame, '.gg-over', { w: 700, ww: 1.2, m: at(X0 + 0.04, 2.25, 1.35, LEFT) });
      var lede = kit.lift(frame, '.lede', { w: 760, ww: 1.4, m: at(X0 + 0.04, 1.1, 1.35, LEFT) });
      var lasts = kit.lift(frame, '.gg-ledge', { n: 0, w: 820, ww: 1.6, m: at(X1 - 0.04, 0.4, 0.6, RIGHT) });
      var rules = kit.lift(frame, '.gg-ledge', { n: 1, w: 820, h: 760, ww: 1.6, m: at(X1 - 0.04, 0.35, -1.2, RIGHT) });
      var credit = kit.lift(frame, '.gg-credit', { w: 760, ww: 0.9, m: at(-0.95, 0.35, NEAR - 0.04, Math.PI) });

      var stops = [
        { name: 'just in from the passage, the shelves dark at the back and the rail along the front of every one', x: -1.6, z: 1.7, yaw: 0.25, pitch: 0.06 },
        { name: 'at the back shelves, every toy on them dark, the rail’s light along their fronts', x: 0, z: FAR + 2.4, yaw: 0, pitch: 0.1 },
        { name: 'at the toys you can charge, on the left-hand wall: hold one up to the rail', x: X0 + 2.2, z: -1.4, yaw: LEFT, pitch: 0.05, frame: shelf.el },
        { name: 'at the counter: hold everything up to the rail at once', x: 1.4, z: -0.6, yaw: 0, pitch: -0.2, frame: railPart.el },
        { name: 'at how long a glow lasts, on the right-hand wall', x: X1 - 1.8, z: 0.6, yaw: RIGHT, pitch: 0.04, frame: lasts.el },
        { name: 'at the house rules, on the right-hand wall past the counter', x: X1 - 1.8, z: -1.2, yaw: RIGHT, pitch: 0.04, frame: rules.el },
        { name: 'by the way in: where you are, and what the shop is', x: X0 + 1.8, z: 1.35, yaw: LEFT, pitch: 0.1, frame: lede.el },
        { name: 'at whose words these are, on the near wall by the way in', x: -0.95, z: 1.3, yaw: Math.PI, pitch: -0.12, frame: credit.el },
        { name: 'back by the way in, with the shop’s own page on the wall beside it', x: px, z: 0.7, yaw: Math.PI, pitch: 0.04, page: kit.page, frame: frame }
      ];
      void over;

      return {
        start: { x: -1.6, z: 1.7, yaw: 0.25 },
        bounds: { x: [X0 + 0.7, X1 - 0.7], z: [FAR + 0.8, NEAR - 0.5] },
        stops: stops
      };
    }
  };
})();

/* =============================================================================
   The Dairy, walked into on Cel Street, through the old dairy's door at All
   Together Now Farms. Ryan's ask, 2026-11-03: Nature's Contribution and its
   places.

   IT IS THE CAFÉ'S OWN WORLD (§109), and a subroom shares nothing with its
   parent. Outside, the farm is lit by two lights from two sides; in here THE
   LIGHT IS BOUNCED OFF GLAZE: white tile to the ceiling, small windows set
   high, and the daylight going round and round the walls until it is
   everywhere at once and CASTS NOTHING. So there is no lamp and no light from
   any side in this scene, only the windows' daylight from above and the
   floor's from below, the same on every face. The farm's dusk never gets in.

   THE ONLY COLOURS ARE THE BAND OF GREEN TILE AT HAND HEIGHT AND THE FOOD.
   Everything else is glaze, grout, floor and steel: the steel counter on the
   left with the pasteuriser on it, its round thermometer, the pipe out of its
   side, two churns and a round cheese; the two tables on the right, each with
   a plate of something orange and a glass of milk. Every drop of milk here is
   pasteurised, and the page says why. The menu hangs on the back wall, a
   board for each of the page's sections, in the page's own words; nothing
   here says what a dish does for a body.

   THE COLLISIONS ARE §109's: the Guild is the other room lit from nowhere,
   and it is paper with no depth; Samefood Cafe is the other even-lit café,
   seen from straight above; Hey, Good Cookin' is lit through steamed windows,
   and nothing in a dairy is steamed. NOTHING MOVES, at any setting.

   Every colour is one §109 declares, by name. It keeps nothing, sends
   nothing and fetches nothing; its page arrives through Cel Street's
   screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['the-dairy.html'] = {
    name: 'The Dairy',
    from: 'all-together-now.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var X0 = -4, X1 = 4, NEAR = 4, FAR = -5, H = 3.2;
      var D = NEAR - FAR, MZ = (NEAR + FAR) / 2;
      var BAND0 = 0.9, BAND1 = 1.2;      // the green tile, at hand height
      var DW = 1.1, DH = 2.1;            // the door you came in by

      // GLAZE-LIGHT: daylight from the high windows above and the floor's
      // own from below, the same on every face. No lamp, and nothing in here
      // throws a shadow.
      kit.scene.background = kit.col('--dry-tile');
      kit.scene.add(new T.HemisphereLight(kit.col('--dry-window'), kit.col('--dry-floor'), 2.2));
      kit.scene.add(new T.AmbientLight(kit.col('--dry-tile'), 0.9));

      // THE TILE: small white glazed squares with their grout, and the band
      // of green ones at hand height, drawn once for each wall at its size.
      var PX = 200, TILE = 30;
      function tiles(wm) {
        return kit.paper(Math.round(wm * PX), Math.round(H * PX), function (c, w, h) {
          c.fillStyle = kit.ink('--dry-tile'); c.fillRect(0, 0, w, h);
          var b0 = h - BAND1 * PX, b1 = h - BAND0 * PX;
          c.fillStyle = kit.ink('--dry-band'); c.fillRect(0, b0, w, b1 - b0);
          for (var y = h; y > -TILE; y -= TILE) {
            c.fillStyle = kit.ink(y > b0 && y <= b1 + 1 ? '--dry-band-grout' : '--dry-grout');
            c.fillRect(0, y - 1, w, 2);
          }
          for (var x = 0; x < w; x += TILE) {
            c.fillStyle = kit.ink('--dry-grout'); c.fillRect(x - 1, 0, 2, b0); c.fillRect(x - 1, b1, 2, h - b1);
            c.fillStyle = kit.ink('--dry-band-grout'); c.fillRect(x - 1, b0, 2, b1 - b0);
          }
        });
      }
      kit.sheet(tiles(X1 - X0), X1 - X0, H, at(0, H / 2, FAR + 0.01));
      kit.sheet(tiles(D), D, H, at(X0 + 0.01, H / 2, MZ, LEFT));
      kit.sheet(tiles(D), D, H, at(X1 - 0.01, H / 2, MZ, RIGHT));
      kit.sheet(tiles(X1 - X0), X1 - X0, H, at(0, H / 2, NEAR - 0.01, Math.PI));
      // Behind the tile, the walls themselves; the floor and the ceiling.
      box(X1 - X0 + 0.4, H, 0.2, at(0, H / 2, FAR - 0.1), '--dry-tile', false, false);
      box(X1 - X0 + 0.4, H, 0.2, at(0, H / 2, NEAR + 0.1), '--dry-tile', false, false);
      box(0.2, H, D, at(X0 - 0.1, H / 2, MZ), '--dry-tile', false, false);
      box(0.2, H, D, at(X1 + 0.1, H / 2, MZ), '--dry-tile', false, false);
      box(X1 - X0 + 0.4, 0.08, D + 0.4, at(0, -0.04, MZ), '--dry-floor', false, false);
      box(X1 - X0 + 0.4, 0.1, D + 0.4, at(0, H + 0.05, MZ), '--dry-tile', false, false);

      // THE WINDOWS, small and set high, two on each long wall: daylight, and
      // nothing seen through it.
      [-2.6, 0.6].forEach(function (z) {
        kit.flat(new T.PlaneGeometry(0.9, 0.5), at(X0 + 0.03, H - 0.45, z, LEFT), '--dry-window');
        kit.flat(new T.PlaneGeometry(0.9, 0.5), at(X1 - 0.03, H - 0.45, z, RIGHT), '--dry-window');
      });

      // THE DOOR you came in by, steel, shut behind you, in its dark frame.
      box(DW, DH, 0.06, at(0, DH / 2, NEAR - 0.04), '--dry-steel', 0.01);
      box(DW + 0.16, 0.08, 0.1, at(0, DH + 0.04, NEAR - 0.05), '--dry-steel-dark', false);
      [-1, 1].forEach(function (s) { box(0.08, DH, 0.1, at(s * (DW / 2 + 0.04), DH / 2, NEAR - 0.05), '--dry-steel-dark', false); });
      box(0.04, 0.24, 0.06, at(DW / 2 - 0.16, 1.0, NEAR - 0.1), '--dry-steel-dark', false);

      // THE COUNTER on the left, steel, and on it the pasteuriser, still
      // working: a round vat with its round thermometer showing and a pipe
      // out of its side; a round cheese beside it, and two churns at its foot.
      var CX = X0 + 0.45, CZ0 = FAR + 0.9, CZ1 = -0.6, CTOP = 0.92;
      box(0.8, CTOP, CZ1 - CZ0, at(CX, CTOP / 2, (CZ0 + CZ1) / 2), '--dry-steel', 0.012);
      box(0.86, 0.04, CZ1 - CZ0 + 0.06, at(CX, CTOP + 0.02, (CZ0 + CZ1) / 2), '--dry-steel-dark', false);
      var VZ = -2.4;
      cyl(0.32, 0.32, 0.7, at(CX, CTOP + 0.39, VZ), '--dry-steel', 0.012, 20);
      cyl(0.34, 0.34, 0.05, at(CX, CTOP + 0.76, VZ), '--dry-steel-dark', false, 20);
      cyl(0.05, 0.05, 0.12, at(CX, CTOP + 0.84, VZ), '--dry-steel-dark', false, 8);
      kit.piece(new T.CircleGeometry(0.11, 18), at(CX + 0.33, CTOP + 0.48, VZ, LEFT + Math.PI), '--dry-milk', false);
      kit.piece(new T.TorusGeometry(0.11, 0.015, 6, 18), at(CX + 0.33, CTOP + 0.48, VZ, LEFT + Math.PI), '--dry-steel-dark', false);
      box(0.012, 0.08, 0.008, at(CX + 0.335, CTOP + 0.5, VZ + 0.02, LEFT + Math.PI, 0, 0.6), '--dry-steel-dark', false);
      var pipe = new T.CylinderGeometry(0.035, 0.035, 0.7, 8);
      kit.piece(pipe, at(CX, CTOP + 0.25, VZ + 0.55, 0, Math.PI / 2), '--dry-steel', 0.008);
      kit.piece(pipe.clone(), at(CX, CTOP - 0.05, VZ + 0.9), '--dry-steel', 0.008);
      cyl(0.17, 0.17, 0.11, at(CX, CTOP + 0.075, -1.2), '--dry-cheese', 0.008, 22);
      cyl(0.17, 0.17, 0.01, at(CX, CTOP + 0.135, -1.2), '--dry-cheese-top', false, 22);
      [-3.9, -3.35].forEach(function (z) {
        cyl(0.17, 0.2, 0.55, at(CX + 0.62, 0.275, z), '--dry-steel', 0.01, 14);
        cyl(0.09, 0.15, 0.14, at(CX + 0.62, 0.62, z), '--dry-steel', 0.008, 14);
        cyl(0.1, 0.1, 0.04, at(CX + 0.62, 0.71, z), '--dry-steel-dark', false, 14);
      });

      // THE TABLES on the right, each with a plate of something orange and a
      // glass of milk, and two steel stools.
      [-1.2, -3.6].forEach(function (z, i) {
        var tx = X1 - 1.3;
        cyl(0.5, 0.5, 0.04, at(tx, 0.74, z), '--dry-table', 0.01, 24);
        cyl(0.04, 0.04, 0.72, at(tx, 0.36, z), '--dry-steel-dark', false, 8);
        cyl(0.22, 0.22, 0.02, at(tx, 0.02, z), '--dry-steel-dark', false, 16);
        cyl(0.17, 0.17, 0.015, at(tx - 0.1, 0.77, z + 0.05), '--dry-plate', 0.006, 20);
        var food = new T.SphereGeometry(0.08, 10, 8); food.scale(1.3, 0.55, 1);
        kit.piece(food, at(tx - 0.1, 0.8, z + 0.05, i), '--dry-squash', 0.006);
        cyl(0.035, 0.03, 0.12, at(tx + 0.2, 0.82, z - 0.12), '--dry-milk', 0.005, 12);
        [-1, 1].forEach(function (s) {
          cyl(0.17, 0.17, 0.04, at(tx + s * 0.7, 0.46, z), '--dry-steel', 0.008, 16);
          cyl(0.025, 0.025, 0.44, at(tx + s * 0.7, 0.22, z), '--dry-steel-dark', false, 6);
        });
      });

      // THE CAFÉ'S OWN PAGE, on the wall right of the door as you face it to
      // leave.
      var NZ = [X0, X1, 0.4, NEAR];
      var pw = 2.2, ph = pw * 800 / 1180;
      var page = kit.screen(1180, 800, pw, at(2.4, 1.3 + ph / 2, NEAR - 0.04, Math.PI), 'The Dairy’s own page, on the wall beside the door', NZ);

      // THE PAGE'S OWN WORDS, standing on the tile above the green band:
      // what this room is by the door on the left, where it all comes from on
      // the right, the café's rules left of the door, and the menu on the
      // back wall, a board for each of its sections.
      var lede = kit.lift(page, '.dry-lede', { w: 700, ww: 1.9, m: at(X0 + 0.04, BAND1 + 0.1, 2.3, LEFT), zone: NZ });
      var pantry = kit.lift(page, '.dry-pantry', { w: 700, h: 640, ww: 1.9, m: at(X1 - 0.04, BAND1 + 0.1, 2.0, RIGHT), zone: NZ });
      var rules = kit.lift(page, '.dry-rules', { w: 700, ww: 1.9, m: at(-2.4, BAND1 + 0.1, NEAR - 0.04, Math.PI), zone: NZ });
      var MENU = [FAR + 0.04];
      var SECTIONS = ['from the stove', 'from the fields', 'from the oven and the dairy', 'to drink'];
      var BZ = [X0, X1, FAR, NEAR];
      var boards = SECTIONS.map(function (said, i) {
        var bx = -2.85 + i * 1.9;
        return { said: said, x: bx, it: kit.lift(page, '.dry-board', { n: i, w: 560, h: 600, ww: 1.7, m: at(bx, BAND1 + 0.1, MENU[0]), zone: BZ }) };
      });

      var stops = [
        { name: 'in at the door, the glaze white to the ceiling and the green band at hand height', where: 'just inside the door', x: 0, z: 3.2, yaw: 0, pitch: 0.04 },
        { name: 'by the door on the left: what this room is', where: 'by the door, at what this room is', x: X0 + 2.2, z: 2.3, yaw: LEFT, pitch: 0.12, frame: lede.el },
        { name: 'on the right: where it all comes from', where: 'at where it all comes from', x: X1 - 2.2, z: 2.0, yaw: RIGHT, pitch: 0.12, frame: pantry.el },
        { name: 'at the counter, the pasteuriser on it with its round thermometer showing', where: 'at the counter, by the pasteuriser', x: CX + 1.8, z: VZ, yaw: LEFT, pitch: -0.2 }
      ];
      boards.forEach(function (b) {
        stops.push({ name: 'at the menu on the back wall: ' + b.said, where: 'at the menu, ' + b.said, x: b.x, z: FAR + 2.1, yaw: 0, pitch: 0.2, frame: b.it.el });
      });
      stops.push(
        { name: 'at the tables, a plate of something orange and a glass of milk on each', where: 'at the tables', x: 0.5, z: -2.4, yaw: RIGHT, pitch: -0.3 },
        { name: 'left of the door: in the café', where: 'left of the door, at the café’s rules', x: -2.4, z: 1.6, yaw: Math.PI, pitch: 0.12, frame: rules.el },
        { name: 'right of the door, with the café’s own page on it', where: 'at the café’s own page', x: 2.4, z: 1.5, yaw: Math.PI, pitch: 0.08, page: kit.page, frame: page }
      );

      return {
        start: { x: 0, z: 3.2, yaw: 0 },
        bounds: { x: [X0 + 0.8, X1 - 0.8], z: [FAR + 0.8, NEAR - 0.6] },
        stops: stops
      };
    }
  };
})();

/* =============================================================================
   Mycelium Munchies, walked into on Cel Street, through its doorway off the
   passage of Arlesglad Caverns, level B2. Ryan's ask, 2026-11-02: the caverns'
   levels.

   IT IS THE ROOM'S OWN WORLD (§65): a mushroom farm with a restaurant at the
   end of the growing rooms. You come in at the dark end and walk down between
   the steel racks, the mushrooms on the shelves in their own colours, to the
   pass at the far end, seen straight on: a steel counter with plates set on it
   and heat lamps hanging low over them. THE HEAT LAMPS ARE THE ONLY LIGHT,
   red, electric, never a flame, and they light the pass and the plates and
   little else: the farm behind stands in the dark. The kitchen composes every
   dish and there is nothing here to build, which is what holds it off Vital
   Plant Living, the other kitchen, drawn cut open with everything touching.
   There is no wood anywhere: the kitchen is steel, and the only warm colours
   are the lamps' red and the mushrooms' own.

   NOTHING MOVES AT ANY SETTING and the lamps do not flicker.

   THE WORDS ARE THE PAGE'S OWN, lifted off it and never retyped: the house
   specialities and the menu by the pass, every dish saying what is in it; the
   growing rooms among the racks; Derek Sarno's masterclass on the screen at the
   back of the kitchen and his most recent videos on the rack beside the pass,
   each with how long it runs, his titles as he wrote them, played as on the
   page through love-embed.js and rack.js; why a mushroom farm, growing your
   own, the house rules and whose words. The room's name over the pass is
   lettered in the page's own face.

   Every colour is one §65 declares, by name. It keeps nothing, sends nothing
   and fetches nothing; its page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['mycelium-munchies.html'] = {
    name: 'Mycelium Munchies',
    from: 'arlesglad-caverns.html',
    faces: ['"Caprasimo"'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var XW = 3.6, ZIN = 1.4, PASS = -11.6, BACK = -15.0, H = 3.2;   // the hall
      var CAPS = ['--myc-pink', '--myc-gold', '--myc-blue', '--myc-tan', '--myc-cream'];
      function rnd(s) { var n = Math.sin(s * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); }

      // THE DARK, only just enough to tell a rack from nothing.
      kit.scene.background = kit.col('--myc-dark');
      kit.scene.add(new T.HemisphereLight(kit.col('--myc-shelf'), kit.col('--myc-dark'), 2.4));

      // THE HALL: a concrete floor, the walls in the dark, and the doorway you
      // came in by at the near end, back to the passage.
      box(XW * 2 + 0.4, 0.1, ZIN - BACK + 0.4, at(0, -0.05, (ZIN + BACK) / 2), '--myc-steel', false, false);
      box(0.2, H, ZIN - BACK, at(-XW - 0.1, H / 2, (ZIN + BACK) / 2), '--myc-dark', false);
      box(0.2, H, ZIN - BACK, at(XW + 0.1, H / 2, (ZIN + BACK) / 2), '--myc-dark', false);
      box(XW * 2, H, 0.2, at(0, H / 2, BACK - 0.1), '--myc-dark', false);
      [-1, 1].forEach(function (k) { box(XW - 0.7, H, 0.2, at(k * (XW + 0.7) / 2, H / 2, ZIN + 0.1), '--myc-dark', false); });
      box(1.4, H - 2.3, 0.2, at(0, 2.3 + (H - 2.3) / 2, ZIN + 0.1), '--myc-dark', false);
      [-0.72, 0.72].forEach(function (x) { box(0.08, 2.3, 0.24, at(x, 1.15, ZIN), '--myc-shelf', 0.01); });
      box(1.52, 0.08, 0.24, at(0, 2.3, ZIN), '--myc-shelf', 0.01);

      // THE GROWING RACKS: steel uprights, four shelves each, and the
      // mushrooms on them in clusters in their own colours. Along both walls,
      // and one double rack down the middle that you walk either side of.
      var cap = new T.SphereGeometry(1, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2);
      function cluster(x, y, z, s) {
        var ink = CAPS[Math.floor(rnd(s) * CAPS.length)], n = 2 + Math.floor(rnd(s + 1) * 3);
        for (var i = 0; i < n; i++) {
          var r = 0.05 + rnd(s + i * 3) * 0.04, dx = (rnd(s + i * 5) - 0.5) * 0.14, dz = (rnd(s + i * 7) - 0.5) * 0.14;
          cyl(0.012, 0.016, 0.05, at(x + dx, y + 0.025, z + dz), '--myc-cream', false, 6);
          var g = cap.clone(); g.scale(r, r * 0.55, r);
          kit.piece(g, at(x + dx, y + 0.05, z + dz), ink, 0.008, false);
        }
      }
      function rack(x, z0, z1, depth, sides, seed) {
        var len = z0 - z1, mid = (z0 + z1) / 2;
        [z0 - 0.04, z1 + 0.04, mid].forEach(function (z) {
          [-1, 1].forEach(function (k) { box(0.05, 2.3, 0.05, at(x + k * (depth / 2 - 0.03), 1.15, z), '--myc-steel', 0.008); });
        });
        for (var s = 0; s < 4; s++) {
          var y = 0.32 + s * 0.55;
          box(depth, 0.04, len, at(x, y, mid), '--myc-shelf', 0.008, false);
          sides.forEach(function (side) {
            for (var z = z0 - 0.18, j = 0; z > z1 + 0.12; z -= 0.26, j++) {
              if (rnd(seed + s * 41 + j) < 0.18) continue;
              cluster(x + side * depth * 0.24, y + 0.02, z, seed + s * 97 + j * 13 + side * 7);
            }
          });
        }
      }
      [[-2.7, -4.4], [-6.6, -8.7]].forEach(function (run, n) {
        rack(-XW + 0.4, run[0], run[1], 0.7, [1], 11 + n * 50);
        rack(XW - 0.4, run[0], run[1], 0.7, [-1], 211 + n * 50);
      });
      rack(0, -3.2, -8.2, 0.9, [-1, 1], 511);

      // THE PASS at the far end, seen straight on: a steel counter across the
      // hall, its top the pass's own steel, and the plates set out on it.
      var PW = XW * 2 - 0.6, PH = 1.0;
      box(PW, PH - 0.06, 0.7, at(0, (PH - 0.06) / 2, PASS), '--myc-steel', 0.012);
      box(PW + 0.08, 0.06, 0.84, at(0, PH - 0.03, PASS), '--myc-pass', 0.01);
      var plate = new T.CylinderGeometry(0.17, 0.13, 0.03, 20);
      var LAMPS = [-2.25, -0.75, 0.75, 2.25];
      LAMPS.forEach(function (x, i) {
        kit.piece(plate.clone(), at(x, PH + 0.015, PASS + 0.05), '--myc-cream', 0.008);
        // What is on it: a heap of mushrooms in their own colours.
        for (var k = 0; k < 4; k++) {
          var r = 0.045 + rnd(i * 9 + k) * 0.02, g = cap.clone(); g.scale(r, r * 0.6, r);
          kit.piece(g, at(x + (rnd(i * 5 + k) - 0.5) * 0.16, PH + 0.035, PASS + 0.05 + (rnd(i * 7 + k) - 0.5) * 0.12), CAPS[(i + k) % 4], 0.006, false);
        }
      });
      // Stools along the near side of the pass, steel, empty.
      [-2.6, -1.3, 0, 1.3, 2.6].forEach(function (x) {
        cyl(0.04, 0.06, 0.66, at(x, 0.33, PASS + 0.85), '--myc-steel', 0.006, 8);
        cyl(0.18, 0.18, 0.05, at(x, 0.68, PASS + 0.85), '--myc-shelf', 0.008, 16);
      });

      // THE HEAT LAMPS, hanging low over the pass on their rods, each lit
      // underneath and throwing its red straight down onto the plates. The
      // room's only light, and it does not flicker.
      var under = new T.MeshBasicMaterial({ color: kit.col('--myc-lamp') });
      LAMPS.forEach(function (x, i) {
        cyl(0.012, 0.012, H - 1.95, at(x, 1.95 + (H - 1.95) / 2, PASS + 0.05), '--myc-steel', false, 6);
        cyl(0.07, 0.2, 0.22, at(x, 1.84, PASS + 0.05), '--myc-steel', 0.01, 16);
        var disc = new T.Mesh(new T.CircleGeometry(0.17, 20), under);
        disc.matrixAutoUpdate = false; disc.matrix.copy(at(x, 1.725, PASS + 0.05, 0, Math.PI / 2)); disc.matrixWorldNeedsUpdate = true;
        kit.scene.add(disc);
        var lamp = new T.SpotLight(kit.col('--myc-lamp'), 16, 4.6, 0.7, 0.5, 1.2);
        lamp.position.set(x, 1.7, PASS + 0.05);
        lamp.target.position.set(x, 0, PASS + 0.3);
        lamp.castShadow = i === 1 || i === 2;
        if (lamp.castShadow) { lamp.shadow.mapSize.set(512, 512); lamp.shadow.bias = -0.0008; }
        kit.scene.add(lamp, lamp.target);
      });

      // THE KITCHEN behind the pass, in the dark: a steel bench along the back
      // wall and a shelf of clean plates over it.
      box(XW * 2 - 0.8, 0.9, 0.6, at(0, 0.45, BACK + 0.4), '--myc-steel', 0.01);
      box(XW * 2 - 0.8, 0.04, 0.3, at(0, 2.55, BACK + 0.2), '--myc-shelf', 0.008);
      for (var p = 0; p < 9; p++) cyl(0.12, 0.12, 0.03, at(-2.8 + p * 0.7, 2.59, BACK + 0.2), '--myc-cream', 0.006, 16);

      // THE ROOM'S NAME over the pass, lettered in the page's own face on a
      // steel board, in its own cream.
      var name = kit.paper(1024, 200, function (c, w, h) {
        c.fillStyle = kit.ink('--myc-steel'); c.fillRect(0, 0, w, h);
        c.strokeStyle = kit.ink('--myc-shelf'); c.lineWidth = 8; c.strokeRect(6, 6, w - 12, h - 12);
        c.fillStyle = kit.ink('--myc-cream'); c.font = '400 112px "Caprasimo"';
        c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Mycelium Munchies', w / 2, h / 2 + 6);
      });
            kit.sheet(name, 2.8, 0.55, at(0, H - 0.12, PASS - 0.25));

      // THE ROOM'S OWN PAGE, by the doorway you came in by, on the wall.
      var pgw = 2.2, pgh = pgw * 800 / 1180;
      box(pgw + 0.12, pgh + 0.12, 0.05, at(XW - 0.03, 0.5 + pgh / 2, -0.2, RIGHT), '--myc-shelf', 0.01);
      var page = kit.screen(1180, 800, pgw, at(XW - 0.07, 0.5 + pgh / 2, -0.2, RIGHT), 'Mycelium Munchies’ own page, on the wall by the doorway');

      // THE PAGE'S OWN WORDS. Each stands against a wall or the kitchen's back
      // wall and is seen only from its own stretch of the hall, so none of them
      // stands in front of the racks or the pass from anywhere else.
      var NEAR = [-XW, XW, -3.6, ZIN], MID = [-XW, XW, -7.6, -3.6], END = [-XW, XW, PASS + 0.4, -7.6];
      function onWall(side, z, foot, ww, sel, n, more) {
        var o = { n: n || 0, w: 760, ww: ww, m: at(side * (XW - 0.06), foot, z, side < 0 ? LEFT : RIGHT) };
        for (var k in more) o[k] = more[k];
        return kit.lift(page, sel, o);
      }
      var over = onWall(-1, -1.6, 1.9, 1.5, '.myc-over', 0, { zone: NEAR });
      var lede = onWall(-1, -1.6, 0.6, 1.6, '.lede', 0, { zone: NEAR });
      var grow = onWall(1, -1.9, 0.55, 1.5, '.myc-section', 3, { zone: NEAR, h: 620 });
      var rooms = onWall(-1, -5.5, 0.35, 1.6, '.myc-section', 1, { zone: MID, h: 900 });
      var why = onWall(1, -5.5, 0.35, 1.6, '.myc-ledge', 0, { zone: MID, h: 900 });
      var menu = onWall(-1, -9.8, 0.3, 1.6, '.myc-section', 0, { zone: END, h: 900 });
      var rackW = onWall(1, -9.8, 0.3, 1.6, '.myc-racked', 0, { zone: END, h: 900 });

      // Behind the pass, on the kitchen's back wall over the bench: the house
      // specialities on the left, and the masterclass's screen on the right.
      var onpass = kit.lift(page, '.myc-onpass', { w: 820, h: 520, ww: 2.4, m: at(-1.9, 0.95, BACK + 0.04), zone: END });
      var screen = kit.lift(page, '.myc-watchplate', { w: 660, ww: 2.3, m: at(1.8, 0.95, BACK + 0.04), zone: END });

      // By the doorway, on the near wall beside it: the house rules, and whose
      // words these are.
      var rules = kit.lift(page, '.myc-ledge', { n: 1, w: 760, h: 760, ww: 1.4, m: at(-2.2, 0.4, ZIN - 0.04, Math.PI) });
      var credit = kit.lift(page, '.myc-credit', { w: 760, ww: 1.4, m: at(2.2, 0.8, ZIN - 0.04, Math.PI) });

      kit.wire(page, 'rack.js');

      return {
        start: { x: 0, z: 0.4, yaw: 0 },
        bounds: { areas: [
          { x: [-XW + 0.9, -0.75], z: [PASS + 1.2, ZIN - 0.5] },
          { x: [0.75, XW - 0.9], z: [PASS + 1.2, ZIN - 0.5] },
          { x: [-XW + 0.9, XW - 0.9], z: [-2.7, ZIN - 0.5] },
          { x: [-XW + 0.9, XW - 0.9], z: [PASS + 1.2, -8.7] }
        ] },
        stops: [
          { name: 'in the doorway off the passage, the racks going away in the dark and the heat lamps red over the pass at the far end', x: 0, z: 0.4, yaw: 0, pitch: 0.02 },
          { name: 'by the doorway: the room’s name and what it is', x: -1.6, z: -1.6, yaw: LEFT, pitch: 0.08, frame: lede.el },
          { name: 'by the doorway on the right: growing your own', x: 1.6, z: -1.9, yaw: RIGHT, pitch: 0.05, frame: grow.el },
          { name: 'between the racks, the mushrooms on the shelves in their own colours', x: -1.8, z: -4.0, yaw: 0.25, pitch: -0.12 },
          { name: 'among the racks on the left: the growing rooms, what is on every shelf', x: -1.8, z: -5.5, yaw: LEFT, pitch: 0.05, frame: rooms.el },
          { name: 'among the racks on the right: why a mushroom farm', x: 1.8, z: -5.5, yaw: RIGHT, pitch: 0.05, frame: why.el },
          { name: 'at the pass, straight on, the plates under the heat lamps', x: 0, z: -9.3, yaw: 0, pitch: -0.1 },
          { name: 'by the pass on the left: the rest of the menu, every dish saying what is in it', x: -1.8, z: -9.8, yaw: LEFT, pitch: 0.05, frame: menu.el },
          { name: 'by the pass on the right: Derek Sarno’s most recent videos, each saying how long it runs', x: 1.8, z: -9.8, yaw: RIGHT, pitch: 0.05, frame: rackW.el },
          { name: 'across the pass, on the kitchen wall: the house specialities', x: -1.9, z: -10.3, yaw: 0, pitch: 0.08, frame: onpass.el },
          { name: 'across the pass, on the kitchen wall: his masterclass on the screen', x: 1.8, z: -10.3, yaw: 0, pitch: 0.06, frame: screen.el },
          { name: 'turned back to the doorway: the house rules', x: -2.2, z: -1.4, yaw: Math.PI, pitch: 0.05, frame: rules.el },
          { name: 'turned back to the doorway: whose words these are', x: 2.2, z: -1.2, yaw: Math.PI, pitch: 0.08, frame: credit.el },
          { name: 'on the wall by the doorway, with the room’s own page on it', x: 1.4, z: -0.2, yaw: RIGHT, pitch: 0.04, page: kit.page, frame: page }
        ]
      };
    }
  };
})();

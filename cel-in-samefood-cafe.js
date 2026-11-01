/* =============================================================================
   Samefood Cafe, walked into on Cel Street. Ryan's ask, 2026-10-31: back on
   the street, working down it a room at a time.

   IT IS SAMEFOOD CAFE'S WORLD AND NOBODY ELSE'S (§47): a café under ONE EVEN
   LIGHT straight overhead that is the same at every hour, so every object
   sits in its own soft ring of shade, drawn on the table round it, and the
   light from directly above puts every shadow straight under the thing that
   made it. Lilac-grey laminate, pale walls, no blue anywhere.

   EVERY PLATE IS THE SAME PLATE. One mould, one colour, everywhere in the
   room, every table laid the same way with the same plate, the same mug and
   the same spoon: COVENSTEAD INVERTED, one door along, where nobody's cup is
   anybody else's. If a plate here ever differs from another, it has become
   Covenstead with a menu.

   NOTHING ON A DIVIDED PLATE OR IN A RAMEKIN TOUCHES ANYTHING ELSE. The table
   in the window is laid as the page's own window is: pesto pasta in the big
   well, nooch popcorn along the top right, cheese in the well below it, the
   peanut butter in a small well of its own, a mug of coffee on the right, the
   apple slices in a ramekin and Ronan's ketchup in another on the left. Every
   food sits well inside its own well, every piece clear of every other, with
   room round it. Nothing on a table is turned: everything stands square.

   THE REGULARS' TRAYS ARE THEIR WORDS, lifted off the page as they are, one
   lying at each regular's own table; the menu, the house rules, the book on
   the counter and today's special (your favourite) are the page's own too.
   Nobody is drawn, and nothing anywhere passes a verdict on food.

   NOTHING MOVES and nothing makes a sound. Every colour is one the room
   declares, by name. It keeps nothing, sends nothing and fetches nothing; its
   page arrives through Cel Street's screen(), on the back wall.
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['samefood-cafe.html'] = {
    name: 'Samefood Cafe',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var W = 10, D = 11, H = 2.8, back = -D;
      var L = -W / 2, R = W / 2;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;

      // ONE EVEN LIGHT, STRAIGHT OVERHEAD, the same at every hour: a soft fill
      // of the room's pale everywhere, and one light from directly above, so
      // every shadow falls straight under what made it.
      kit.scene.background = kit.col('--sf-table');
      kit.scene.add(new T.HemisphereLight(kit.col('--sf-plate'), kit.col('--sf-shade'), 2.4));
      var over = new T.DirectionalLight(kit.col('--sf-plate'), 1.6);
      over.position.set(0.01, 30, back / 2 + 0.01);
      over.target.position.set(0, 0, back / 2);
      over.castShadow = true;
      over.shadow.mapSize.set(2048, 2048);
      over.shadow.camera.left = -7; over.shadow.camera.right = 7;
      over.shadow.camera.top = 8; over.shadow.camera.bottom = -8;
      over.shadow.camera.near = 1; over.shadow.camera.far = 40;
      over.shadow.bias = -0.0008; over.shadow.normalBias = 0.03;
      kit.scene.add(over, over.target);

      // THE ROOM: lilac-grey walls, a pale floor, a ceiling with its even
      // panels of light, and the door behind you.
      box(W + 0.4, 0.1, D + 0.4, at(0, -0.05, back / 2), '--sf-shade', false);
      box(W + 0.4, 0.12, D + 0.4, at(0, H + 0.06, back / 2), '--sf-plate', false, false);
      for (var px = -1; px <= 1; px++) {
        for (var pz = 0; pz < 3; pz++) {
          box(1.6, 0.02, 1.2, at(px * 3.0, H - 0.01, -2.2 - pz * 3.2), '--sf-well', false, false);
        }
      }
      box(0.3, H, D, at(L - 0.15, H / 2, back / 2), '--sf-table');
      box(0.3, H, D, at(R + 0.15, H / 2, back / 2), '--sf-table');
      box(W + 0.6, H, 0.3, at(0, H / 2, back - 0.15), '--sf-table');
      // The front wall, with the door you came in by and the window beside it.
      box(1.6, H, 0.3, at(R - 0.8, H / 2, 0.15), '--sf-table');
      box(W - 4.4, H, 0.3, at(L + (W - 4.4) / 2, H / 2, 0.15), '--sf-table');
      box(1.0, 0.7, 0.3, at(R - 2.1, H - 0.35, 0.15), '--sf-table');
      box(0.96, 2.06, 0.06, at(R - 2.1, 1.03, -0.02), '--sf-plate', 0.012);
      cyl(0.03, 0.03, 0.06, at(R - 1.75, 1.0, -0.07, 0, Math.PI / 2), '--sf-ink-2', false, 10);
      // A skirting of the room's fine-print ink all round, where wall meets floor.
      box(W, 0.08, 0.02, at(0, 0.04, back + 0.01), '--sf-ink-2', false, false);
      [L + 0.01, R - 0.01].forEach(function (x) { box(0.02, 0.08, D, at(x, 0.04, back / 2), '--sf-ink-2', false, false); });

      // THE SAME TABLE, LAID THE SAME WAY, wherever it stands: a square of the
      // laminate on four legs, the same plate, the same mug, the same spoon,
      // each in its own ring of shade, nothing turned.
      var TY = 0.74, TS = 1.0, PZ = 0.25;
      function ring(x, z, r, y) {
        kit.flat(new T.CircleGeometry(r, 28), at(x, y + 0.001, z, 0, -Math.PI / 2), '--sf-shade');
      }
      function plate(x, z, y) {
        ring(x, z, 0.19, y);
        cyl(0.155, 0.15, 0.016, at(x, y + 0.008, z), '--sf-plate', 0.004, 36);
        kit.piece(new T.TorusGeometry(0.148, 0.006, 6, 36), at(x, y + 0.017, z, 0, Math.PI / 2), '--sf-rim', false);
        // Its wells, sunk a little into it and kept apart: the big one on the
        // left, two on the right, and a small one at the foot.
        WELLS.forEach(function (w) {
          kit.flat(new T.CircleGeometry(w[2], 28), at(x + w[0], y + 0.0175, z - w[1], 0, -Math.PI / 2), '--sf-well');
          kit.piece(new T.TorusGeometry(w[2], 0.003, 4, 28), at(x + w[0], y + 0.018, z - w[1], 0, Math.PI / 2), '--sf-rim', false);
        });
      }
      // The wells as x, y-up-the-plate, radius: no two within a gap of each
      // other, and every one inside the plate's rim.
      var WELLS = [[-0.06, 0, 0.065], [0.07, 0.06, 0.04], [0.07, -0.04, 0.04], [0, -0.1, 0.025]];
      function mug(x, z, y, inside) {
        ring(x, z, 0.075, y);
        cyl(0.045, 0.045, 0.1, at(x, y + 0.05, z), '--sf-plate', 0.004, 18);
        box(0.012, 0.05, 0.012, at(x + 0.06, y + 0.055, z), '--sf-plate', false);
        box(0.02, 0.01, 0.012, at(x + 0.05, y + 0.08, z), '--sf-plate', false);
        box(0.02, 0.01, 0.012, at(x + 0.05, y + 0.03, z), '--sf-plate', false);
        if (inside) kit.flat(new T.CircleGeometry(0.04, 20), at(x, y + 0.09, z, 0, -Math.PI / 2), inside);
      }
      function spoon(x, z, y) {
        box(0.012, 0.006, 0.12, at(x, y + 0.004, z + 0.03), '--sf-ink-2', false);
        kit.piece(new T.SphereGeometry(0.02, 10, 6), at(x, y + 0.006, z - 0.05), '--sf-ink-2', false);
      }
      function ramekin(x, z, y) {
        ring(x, z, 0.06, y);
        cyl(0.04, 0.035, 0.04, at(x, y + 0.02, z), '--sf-plate', 0.004, 20);
        kit.flat(new T.CircleGeometry(0.034, 20), at(x, y + 0.041, z, 0, -Math.PI / 2), '--sf-well');
      }
      function chair(x, z) {
        box(0.42, 0.04, 0.42, at(x, 0.45, z), '--sf-ink-2', 0.008);
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { box(0.03, 0.45, 0.03, at(x + c[0] * 0.18, 0.225, z + c[1] * 0.18), '--sf-ink-2', false); });
        box(0.42, 0.36, 0.03, at(x, 0.66 + 0.18, z - 0.19), '--sf-ink-2', 0.008);
      }
      function table(x, z) {
        ring(x, z, 0.75, 0);
        box(TS, 0.04, TS, at(x, TY - 0.02, z), '--sf-table', 0.012);
        [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (c) { box(0.05, TY - 0.04, 0.05, at(x + c[0] * (TS / 2 - 0.06), (TY - 0.04) / 2, z + c[1] * (TS / 2 - 0.06)), '--sf-ink-2', false); });
        chair(x, z - TS / 2 - 0.2);
        plate(x, z - PZ, TY);
        mug(x + 0.3, z - PZ, TY);
        spoon(x - 0.26, z - PZ, TY);
      }

      // THE TABLE IN THE WINDOW, laid as the page's own window is, every food
      // in its own well and every piece clear of every other.
      var WX = L + 2.0, WZ = -1.3;
      table(WX, WZ);
      var py = TY + 0.019, pzz = WZ - PZ;
      // Pesto pasta in the big well: short tubes, each standing on its own.
      [[-0.09, 0.02], [-0.05, 0.03], [-0.07, -0.02], [-0.03, -0.01], [-0.09, -0.025]].forEach(function (p) {
        cyl(0.007, 0.007, 0.018, at(WX + p[0], py + 0.009, pzz - p[1]), '--sf-pesto', false, 8);
      });
      // Nooch popcorn along the top right, cheese in the well below it, and the
      // peanut butter in the small one at the foot.
      [[0.055, 0.07], [0.075, 0.05], [0.085, 0.075], [0.06, 0.045]].forEach(function (p) {
        kit.piece(new T.SphereGeometry(0.008, 8, 6), at(WX + p[0], py + 0.008, pzz - p[1]), '--sf-pop', false);
      });
      [[0.055, -0.03], [0.085, -0.03], [0.07, -0.055]].forEach(function (p) {
        box(0.014, 0.014, 0.014, at(WX + p[0], py + 0.007, pzz - p[1]), '--sf-cheese', false);
      });
      kit.flat(new T.CircleGeometry(0.014, 18), at(WX, py + 0.002, pzz + 0.1, 0, -Math.PI / 2), '--sf-nut');
      // The mug on the right has coffee in it.
      kit.flat(new T.CircleGeometry(0.04, 20), at(WX + 0.3, TY + 0.09, pzz, 0, -Math.PI / 2), '--sf-coffee');
      // On the left, the apple slices in a ramekin, and below them Ronan's
      // ketchup in its own, touching nothing.
      ramekin(WX - 0.3, WZ + 0.1, TY);
      [[-0.012, 0.012], [0.014, -0.006]].forEach(function (p) {
        box(0.016, 0.006, 0.01, at(WX - 0.3 + p[0], TY + 0.045, WZ + 0.1 + p[1]), '--sf-apple', false);
      });
      ramekin(WX - 0.3, WZ + 0.3, TY);
      kit.flat(new T.CircleGeometry(0.026, 18), at(WX - 0.3, TY + 0.042, WZ + 0.3, 0, -Math.PI / 2), '--sf-ketchup');
      // The window in the front wall, frosted even, so the hour never shows.
      box(2.6, 1.5, 0.06, at(WX, 1.45, 0.02), '--sf-well', false, false);
      box(2.7, 0.06, 0.12, at(WX, 0.7, -0.02), '--sf-ink-2', false);
      box(2.7, 0.06, 0.12, at(WX, 2.2, -0.02), '--sf-ink-2', false);
      box(0.06, 1.5, 0.12, at(WX, 1.45, -0.02), '--sf-ink-2', false);

      // THE PAGE on the back wall, and its words either side: the menu and the
      // house rules.
      var pw = 2.6, ph = pw * 800 / 1180, ppy = 1.05 + ph / 2;
      box(pw + 0.16, ph + 0.16, 0.05, at(0, ppy, back + 0.03), '--sf-ink-2');
      var frame = kit.screen(1180, 800, pw, at(0, ppy, back + 0.07), 'Samefood Cafe’s own page, on the back wall');
      var menu = kit.lift(frame, '.sf-part', { n: 1, w: 640, h: 900, ww: 1.6, m: at(-2.9, 0.5, back + 0.06) });
      var rules = kit.lift(frame, '.sf-part', { n: 0, w: 640, h: 900, ww: 1.6, m: at(2.9, 0.5, back + 0.06) });

      // THE COUNTER along the right-hand wall: the book on it, and today's
      // special on a little stand.
      var CX = R - 0.6, CZ0 = -3.2, CZ1 = -8.4, CZ = (CZ0 + CZ1) / 2, CL = CZ0 - CZ1;
      box(0.8, 1.0, CL, at(CX, 0.5, CZ), '--sf-rim', 0.012);
      box(0.9, 0.04, CL + 0.1, at(CX, 1.02, CZ), '--sf-plate', 0.01);
      var book = kit.lift(frame, '.sf-book', { w: 640, h: 760, ww: 0.85, m: at(CX - 0.05, 1.06, -4.4, RIGHT, -0.25) });
      box(0.03, 0.36, 1.0, at(CX + 0.02, 1.22, -6.8), '--sf-plate', 0.006);
      var special = kit.lift(frame, '.sf-special', { w: 420, ww: 0.9, m: at(CX - 0.02, 1.1, -6.8, RIGHT) });

      // THE WORDS ON THE LEFT-HAND WALL: what is not on the menu, and whose
      // these are.
      var nots = kit.lift(frame, '.sf-part', { n: 4, w: 640, h: 820, ww: 1.5, m: at(L + 0.06, 0.6, -6.0, LEFT) });
      var thanks = kit.lift(frame, '.sf-part', { n: 5, w: 640, h: 820, ww: 1.5, m: at(L + 0.06, 0.6, -8.8, LEFT) });

      // THE REGULARS' TABLES, one each, laid the same as every other, each
      // regular's tray off the page lying at the near side as they gave it.
      var REGULARS = [
        { n: 0, who: 'Ryan', x: -1.8, z: -4.4 },
        { n: 1, who: 'Helen', x: 0.6, z: -4.4 },
        // Ronan's table stands nearest the counter, out of its way.
        { n: 2, who: 'Ronan', x: 2.2, z: -4.4 },
        { n: 3, who: 'Chelsea', x: -1.8, z: -7.8 },
        { n: 4, who: 'Norah', x: 0.6, z: -7.8 }
      ];
      var stops = [
        { name: 'just inside the door, the same table as last time', x: R - 2.1, z: -0.8, yaw: 0.35 },
        { name: 'at the table in the window, nothing on it touching anything else', x: WX, z: WZ + 0.8, yaw: 0, pitch: -0.82 }
      ];
      REGULARS.forEach(function (r) {
        table(r.x, r.z);
        var tray = kit.lift(frame, '.sf-tray', { n: r.n, w: 600, h: 560, ww: 0.5, m: at(r.x, TY + 0.01, r.z + 0.44, 0, -1.25) });
        stops.push({ name: 'at ' + r.who + '’s table, with ' + r.who + '’s tray on it', x: r.x, z: r.z + 1.15, yaw: 0, pitch: -0.62, frame: tray.el });
      });

      stops.push(
        { name: 'at the counter, with the one book on it', x: CX - 1.5, z: -4.4, yaw: RIGHT, pitch: -0.25, frame: book.el },
        { name: 'at the counter, where today’s special is your favourite', x: CX - 1.1, z: -6.8, yaw: RIGHT, pitch: -0.2, frame: special.el },
        { name: 'at the menu on the back wall', x: -2.9, z: back + 2.4, yaw: 0, frame: menu.el },
        { name: 'at the back wall, with Samefood Cafe’s own page on it', x: 0, z: back + 2.6, yaw: 0, pitch: 0.05, page: kit.page, frame: frame },
        { name: 'at the house rules on the back wall', x: 2.9, z: back + 2.4, yaw: 0, frame: rules.el },
        { name: 'at what is not on the menu, on the left-hand wall', x: L + 1.8, z: -6.0, yaw: LEFT, frame: nots.el },
        { name: 'at the word on whose these are, on the left-hand wall', x: L + 1.8, z: -8.8, yaw: LEFT, frame: thanks.el }
      );

      return {
        start: { x: R - 2.1, z: -0.8, yaw: 0.35 },
        bounds: { x: [L + 0.6, R - 1.2], z: [back + 0.9, -0.5] },
        stops: stops
      };
    }
  };
})();

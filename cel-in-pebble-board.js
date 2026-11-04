/* =============================================================================
   The Pebble Board, walked into on Cel Street: off the pavement by the front
   door, where the case under glass stands on its legs.

   IT IS THE BOARD'S WORLD AND NOBODY ELSE'S (§21): TWO PALETTES ON PURPOSE,
   and the seam between them is the whole object. Outside is the street's
   night, all round the edge of the glass; inside is lamplit cork with the
   edition's paper pinned to it. One lamp hangs over the board on a bracket,
   and it lights the cork and the frame and nothing much else, so you walk
   along a long painted timber case in the dark with its inside glowing.
   It is not the Latibulum (dug, enclosed, no sky) and not the Brass Tacks
   Board next to it (metal on metal, no glass, no cork, no lamp).

   THE FRAME IS THE STREET'S AND THE PAPER IS THE EDITION'S. The case, its
   lamp, its plate and its legs are drawn here and stay; everything pinned on
   the cork is lifted off the page as it stands, the cover sheet, every spread
   in the page's own order, and the card in memory, so a new edition on the
   page is a new edition here with nothing to change. No picture is lifted:
   every image on the board is somebody's, and stays on the page, which
   stands at the near end of the case as itself. A song's button still plays,
   through love-embed.js, which Cel Street loads.

   NOTHING MOVES, at any setting. Every colour is one the board declares, by
   name. It keeps nothing, sends nothing and fetches nothing; its page arrives
   through Cel Street's screen().
   ========================================================================== */
(function () {
  'use strict';

  // How many spreads this edition has, counted off the page's own board by
  // tools/make-cel-street.py and written between the cel:spreads markers,
  // never by hand, so a new edition gets a slot for every spread it has.
  // cel:spreads:begin
  var SPREADS = 7;
  // cel:spreads:end
  var ORDINAL = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth',
                 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth', 'twentieth'];

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['pebble-board.html'] = {
    name: 'The Pebble Board',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var CASE_X = -2.6;            // the cork's face, along the left
      var STEP = 2.7, FIRST = -2.4; // where each sheet is pinned
      var SHEETS = SPREADS + 2;     // the cover, the spreads and the card in memory
      var LAST = FIRST - STEP * (SHEETS - 1);
      var LEN = FIRST - LAST + 3.4, MID = (FIRST + LAST) / 2;

      // THE NIGHT, outside the glass.
      kit.scene.background = kit.col('--pbnight');
      kit.scene.fog = new T.Fog(kit.col('--pbnight'), 14, 46);
      kit.scene.add(new T.HemisphereLight(kit.col('--pbchalk'), kit.col('--pbnight'), 0.6));

      // THE PAVEMENT, and the kerb where the street is.
      box(30, 0.1, 80, at(0, -0.05, -14), '--pbnight', false, false);
      box(0.3, 0.16, 80, at(3.6, 0.08, -14), '--pbframe', false, false);

      // THE CASE: painted timber on legs, a little pitched roof, cork inside,
      // and the lit edge along the top of the frame.
      var g = at(CASE_X, 0, MID, LEFT);
      function on(x, y, z) { return M(g, at(x, y, z)); }
      box(LEN, 2.5, 0.12, on(0, 1.85, -0.12), '--pbcork', false);
      box(LEN + 0.4, 0.22, 0.34, on(0, 0.5, 0), '--pbframe');
      box(LEN + 0.4, 0.22, 0.34, on(0, 3.2, 0), '--pbframe');
      box(LEN + 0.4, 0.05, 0.36, on(0, 3.33, 0.01), '--pbframe-lit', false);
      [-1, 1].forEach(function (s) { box(0.24, 2.92, 0.34, on(s * (LEN / 2 + 0.08), 1.85, 0), '--pbframe'); });
      for (var x = -LEN / 2 + 0.4; x <= LEN / 2 - 0.3; x += 4.4) {
        box(0.16, 0.42, 0.16, on(x, 0.2, -0.04), '--pbframe');
      }
      // The roof: two boards meeting over the case.
      box(LEN + 0.8, 0.08, 0.62, on(0, 3.48, -0.06, 0.32), '--pbframe');
      box(LEN + 0.8, 0.08, 0.62, on(0, 3.48, -0.5, -0.32), '--pbframe');

      // THE ONE LAMP, over the middle of the board on a bracket, and the light
      // it throws down onto the cork.
      box(0.08, 0.08, 1.0, on(0, 3.75, 0.4), '--pbframe', false);
      kit.cyl(0.26, 0.12, 0.22, on(0, 3.68, 0.9), '--pbframe', 0.02, 14);
      kit.flat(new T.CircleGeometry(0.22, 16), on(0, 3.56, 0.9, 0, Math.PI / 2), '--pblamp');
      var lamp = new T.SpotLight(kit.col('--pblamp'), 26, 40, 1.4, 0.7, 0.6);
      lamp.position.set(CASE_X + 3.2, 4.2, MID);
      lamp.target.position.set(CASE_X, 1.6, MID);
      kit.scene.add(lamp, lamp.target);

      // THE BOARD'S OWN PAGE, standing on its own legs on the right of the
      // pavement at the near end, as itself.
      var pw = 2.8, ph = pw * 800 / 1180, py = 0.8 + ph / 2;
      var pg = at(1.8, 0, -1.2, RIGHT);
      box(pw + 0.24, ph + 0.24, 0.1, M(pg, at(0, py, -0.07)), '--pbframe');
      [-pw / 2, pw / 2].forEach(function (px) { box(0.12, py + ph / 2, 0.12, M(pg, at(px, (py + ph / 2) / 2, -0.14)), '--pbframe'); });
      var page = kit.screen(1180, 800, pw, M(pg, at(0, py, 0)), 'The Pebble Board’s own page, standing at the near end of the case');

      // THE PLATE on the top rail, over the middle, as the page has it.
      kit.lift(page, '.pb-plate', { w: 360, ww: 1.4, bare: true, m: at(CASE_X + 0.19, 3.08, MID, LEFT) });

      // WHAT IS PINNED ON THE CORK, lifted off the page in its own order.
      // A slot for the cover, one for each spread this edition has, and one
      // for the card in memory.
      var stops = [], NTH = [];
      for (var sp = 0; sp < SPREADS; sp++) NTH.push(ORDINAL[sp] || 'number ' + (sp + 1));
      function pin(sel, n, i, name) {
        var z = FIRST - i * STEP;
        var it = kit.lift(page, sel, { n: n, w: 720, h: 640, ww: 2.3, bare: true, drop: 'img, .pb-zoom', m: at(CASE_X + 0.02, 0.75, z, LEFT) });
        stops.push({ name: 'at ' + name, where: 'at the board, at ' + name, x: CASE_X + 2.5, z: z, yaw: LEFT, pitch: 0.12, frame: it.el });
      }
      pin('.pb-cover', 0, 0, 'the cover sheet');
      NTH.forEach(function (t, n) { pin('.pb-spread', n, n + 1, 'the ' + t + ' spread'); });
      pin('.pb-memory', 0, NTH.length + 1, 'the card in memory');

      // THE TWO NOTICES under the case at the far end: back issues, and what a
      // pebble is.
      var eg = at(0.6, 0, LAST - 2.6, 0);
      box(4.8, 2.4, 0.1, M(eg, at(0, 1.9, -0.08)), '--pbframe');
      [-2.3, 2.3].forEach(function (ex) { box(0.14, 3.1, 0.14, M(eg, at(ex, 1.55, -0.16)), '--pbframe'); });
      var back = kit.lift(page, '.pb-rack', { n: 0, w: 640, h: 560, ww: 2.1, m: M(eg, at(-1.15, 0.8, 0)) });
      var what = kit.lift(page, '.pb-rack', { n: 1, w: 640, h: 560, ww: 2.1, m: M(eg, at(1.15, 0.8, 0)) });

      stops.unshift(
        { name: 'on the pavement in front of the board, in the dark', where: 'on the pavement in front of the board', x: 0.4, z: 1.6, yaw: 0.25, pitch: 0.06 },
        { name: 'at the board’s own page, at the near end', where: 'at the board’s own page', x: 0.2, z: -1.2, yaw: RIGHT, pitch: 0.06, page: kit.page, frame: page }
      );
      stops.push(
        { name: 'at the notice on the back issues', where: 'at the back issues', x: -0.55, z: LAST - 0.9, yaw: 0, pitch: 0.08, frame: back.el },
        { name: 'at the notice on what a pebble is', where: 'at what a pebble is', x: 1.75, z: LAST - 0.9, yaw: 0, pitch: 0.08, frame: what.el }
      );

      return {
        start: { x: 0.4, z: 1.6, yaw: 0.25 },
        bounds: { x: [CASE_X + 0.9, 3.2], z: [LAST - 1.6, 3] },
        stops: stops
      };
    }
  };
})();

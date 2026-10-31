/* =============================================================================
   The Music Room, walked into on Cel Street, through the door by the
   phonograph in the Faery Yurt. Ryan's ask, 2026-10-31: the yurt's doorways
   opening onto their rooms.

   IT IS HELEN EDGAR'S ROOM AND HER WORLD (§115), and this is OURS: a drawing
   of her music room for Cel Street, in the colours her room wears (the
   Reading Room's, §114, at her ask) and nothing else, which changes nothing on
   her page and is hers to keep or send back. The Reading Room's house one door
   along, kept off it by the LIGHT: no fire here, only candles on standing
   candelabra and the tall pointed window open on the night, with a crescent
   moon and bare branches in it, so the room is darkest at the ceiling and at
   the window. The phonograph stands in front of the window, and a chair in
   the dark faces it.

   THE PHONOGRAPH'S DECK AND HER THREE SHELVES OF RECORDS ARE HER PAGE'S OWN,
   lifted off it by the kit, and rack.js, the page's own script, plays them
   here as it does there; nothing reaches YouTube until a press. Each shelf
   holds every record on it, and scrolls when there are more than fit.

   NOTHING MOVES: the record does not turn here, the candles stand still.
   Every colour is one her room declares, by name. It keeps nothing, sends
   nothing and fetches nothing; her page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['faery-music-room.html'] = {
    name: 'The Music Room',
    from: 'faery-yurt.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, W = 10, D = 11, H = 7.2, back = -D;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;

      // CANDLES ONLY, and the night at the window.
      kit.scene.background = kit.col('--rdr-stone');
      kit.scene.add(new T.HemisphereLight(kit.col('--rdr-panel'), kit.col('--rdr-stone'), 1.2));

      // THE ROOM.
      box(W, 0.1, D + 0.4, at(0, -0.05, -D / 2), '--rdr-timber', false, false);
      box(0.3, H, D, at(-W / 2 - 0.15, H / 2, -D / 2), '--rdr-wall');
      box(0.3, H, D, at(W / 2 + 0.15, H / 2, -D / 2), '--rdr-wall');
      box(W + 0.6, H, 0.3, at(0, H / 2, 0.15), '--rdr-wall');
      box(W + 0.6, 0.2, D + 0.6, at(0, H + 0.1, -D / 2), '--rdr-stone', false, false);
      [[-W / 2 + 0.02, -D / 2, LEFT, D], [W / 2 - 0.02, -D / 2, RIGHT, D], [0, -0.02, Math.PI, W]].forEach(function (w) {
        box(w[3], 0.2, 0.05, at(w[0], 0.1, w[1], w[2]), '--rdr-timber', false);
      });
      // The door you came in by.
      box(1.3, 2.4, 0.1, at(0, 1.2, -0.05), '--rdr-timber');

      // THE FAR WALL AND ITS TALL POINTED WINDOW, open on the night: the wall
      // in pieces round the opening, stone tracery, the night behind, a
      // crescent moon and bare branches against it.
      var ww = 2.6, wh = 4.2, wy = 0.9, rise = 1.5;
      box((W - ww) / 2 + 0.3, H, 0.3, at(-(W + ww) / 4 - 0.075, H / 2, back - 0.15), '--rdr-wall');
      box((W - ww) / 2 + 0.3, H, 0.3, at((W + ww) / 4 + 0.075, H / 2, back - 0.15), '--rdr-wall');
      box(ww, wy, 0.3, at(0, wy / 2, back - 0.15), '--rdr-wall');
      box(ww, H - wy - wh - rise + 0.2, 0.3, at(0, (wy + wh + rise + H) / 2, back - 0.15), '--rdr-wall');
      // The two triangles beside the pointed top, filled with wall.
      [-1, 1].forEach(function (s) {
        var tri = new T.Shape();
        tri.moveTo(s * ww / 2, 0); tri.lineTo(s * ww / 2, rise + 0.25); tri.lineTo(0, rise + 0.25); tri.lineTo(0, rise);
        tri.lineTo(s * ww / 2, 0);
        var tg = new T.ExtrudeGeometry(tri, { depth: 0.3, bevelEnabled: false });
        kit.piece(tg, at(0, wy + wh, back - 0.3), '--rdr-wall', false);
      });
      // The night, a sheet behind the opening.
      kit.flat(new T.PlaneGeometry(ww + 1, wh + rise + 1), at(0, wy + (wh + rise) / 2, back - 0.6), '--rdr-panel');
      kit.flat(new T.CircleGeometry(0.34, 24), at(0.55, wy + wh + 0.2, back - 0.55), '--rdr-ink');
      kit.flat(new T.CircleGeometry(0.3, 24), at(0.68, wy + wh + 0.27, back - 0.54), '--rdr-panel');
      // Bare branches across it, from one side.
      [[-1.6, 1.4, 0.5, 2.2, 0.05], [-0.7, 2.6, 0.9, 1.4, 0.035], [-1.2, 3.6, 0.3, 1.8, 0.04], [0.1, 3.0, 1.2, 0.9, 0.025], [-0.2, 4.4, 0.7, 1.2, 0.03]].forEach(function (b) {
        box(b[3], b[4], 0.02, at(b[0], wy + b[1], back - 0.5, 0, 0, b[2]), '--rdr-stone', false);
      });
      // Stone tracery: the frame and the mullion, and the pointed head.
      [-1, 1].forEach(function (s) { box(0.16, wh, 0.36, at(s * ww / 2, wy + wh / 2, back - 0.1), '--rdr-stone'); });
      box(0.1, wh, 0.2, at(0, wy + wh / 2, back - 0.2), '--rdr-stone', false);
      box(ww + 0.3, 0.16, 0.5, at(0, wy - 0.08, back + 0.05), '--rdr-stone');
      var arm = Math.hypot(ww / 2, rise);
      [-1, 1].forEach(function (s) {
        box(arm + 0.1, 0.16, 0.36, at(s * ww / 4, wy + wh + rise / 2, back - 0.1, 0, 0, -s * Math.atan2(rise, ww / 2)), '--rdr-stone');
      });

      // THE PHONOGRAPH in front of the window, drawn: a cabinet, the
      // turntable with a record on it, the arm, and the horn.
      var ph = at(0, 0, back + 2.6);
      box(1.0, 0.9, 0.7, M(ph, at(0, 0.45, 0)), '--rdr-timber');
      box(0.72, 0.2, 0.6, M(ph, at(0, 1.0, 0)), '--rdr-leather');
      kit.cyl(0.27, 0.27, 0.02, M(ph, at(0, 1.11, 0)), '--rdr-stone', false, 24);
      kit.cyl(0.07, 0.07, 0.022, M(ph, at(0, 1.12, 0)), '--rdr-ember', false, 12);
      kit.cyl(0.02, 0.02, 0.6, M(ph, at(0.2, 1.33, -0.18, 0, -0.55)), '--rdr-brass', false, 6);
      kit.piece(new T.ConeGeometry(0.5, 0.9, 20, 1, true), M(ph, at(0.32, 1.86, -0.45, 0, -0.85)), '--rdr-brass', 0.02);

      // A CHAIR IN THE DARK, facing it.
      var ch = at(0, 0, back + 6.4, Math.PI);
      box(1.0, 0.45, 0.95, M(ch, at(0, 0.3, 0)), '--rdr-velvet');
      box(1.0, 1.1, 0.24, M(ch, at(0, 0.9, -0.38)), '--rdr-velvet');
      [-1, 1].forEach(function (s) { box(0.18, 0.62, 0.95, M(ch, at(s * 0.5, 0.52, 0)), '--rdr-velvet'); });

      // CANDELABRA standing either side, brass with three candles each, and
      // the only lights in the room.
      [-1, 1].forEach(function (s) {
        var c = at(s * 2.3, 0, back + 2.9);
        kit.cyl(0.25, 0.3, 0.06, M(c, at(0, 0.03, 0)), '--rdr-brass', false, 12);
        kit.cyl(0.035, 0.035, 1.6, M(c, at(0, 0.82, 0)), '--rdr-brass', false, 8);
        box(0.8, 0.04, 0.04, M(c, at(0, 1.6, 0)), '--rdr-brass', false);
        [-0.38, 0, 0.38].forEach(function (x) {
          kit.cyl(0.035, 0.035, 0.26, M(c, at(x, 1.75, 0)), '--rdr-ink-2', false, 8);
          kit.flat(new T.ConeGeometry(0.028, 0.08, 6), M(c, at(x, 1.92, 0)), '--rdr-flame-2');
        });
        var l = new T.PointLight(kit.col('--rdr-flame-2'), 7, 9, 1.4);
        l.position.set(s * 2.3, 2.0, back + 3.0);
        kit.scene.add(l);
      });

      // HER PAGE on the right-hand wall, and the deck and the three shelves of
      // records off it: the deck by the phonograph on the far wall's left, the
      // shelves along the left-hand wall.
      var pw = 2.8, phh = pw * 800 / 1180, py = 1.1 + phh / 2;
      var pg = at(W / 2 - 0.02, 0, -5.4, RIGHT);
      box(pw + 0.24, phh + 0.24, 0.08, M(pg, at(0, py, 0)), '--rdr-timber');
      var frame = kit.screen(1180, 800, pw, M(pg, at(0, py, 0.06)), 'Helen Edgar’s Music Room’s own page, on the right-hand wall');
      var deck = kit.lift(frame, '.mus-deck', { w: 560, ww: 1.5, m: at(-3.3, 0.6, back + 0.02) });
      var SHELVES = [
        { n: 0, z: -2.6, words: 'Faery Yurt’s Yarn' },
        { n: 1, z: -5.5, words: 'Strange things will happen' },
        { n: 2, z: -8.4, words: 'Symphrenia Chill' }
      ];
      var stops = [{ name: 'just through the door, in the candlelight', x: 0, z: -1.2, yaw: 0 }];
      stops.push({ name: 'in the chair in the dark, facing the phonograph and the window', x: 0, z: back + 6.4, yaw: 0 });
      stops.push({ name: 'at the phonograph’s deck, with both playlists on it', x: -3.3, z: back + 2.6, yaw: 0, frame: deck.el });
      SHELVES.forEach(function (sh) {
        var g = at(-W / 2 + 0.06, 0, sh.z, LEFT);
        box(1.6, 0.12, 0.4, M(g, at(0, 0.06, 0.16)), '--rdr-timber');
        var it = kit.lift(frame, '.mus-rack', { n: sh.n, w: 560, h: 700, ww: 1.5, m: M(g, at(0, 0.14, 0.02)) });
        stops.push({ name: 'at the shelf of records off ' + sh.words, x: -W / 2 + 2.6, z: sh.z, yaw: LEFT, pitch: -0.2, frame: it.el });
      });
      kit.wire(frame, 'rack.js');
      stops.push({ name: 'at the window, with the night in it', x: 0, z: back + 1.6, yaw: 0 });
      stops.push({ name: 'at the right-hand wall, with her room’s own page on it', x: W / 2 - 2.6, z: -5.4, yaw: RIGHT, page: kit.page, frame: frame });

      return {
        start: { x: 0, z: -1.2, yaw: 0 },
        bounds: { x: [-W / 2 + 1.0, W / 2 - 1.0], z: [back + 1.4, -0.8] },
        stops: stops
      };
    }
  };
})();

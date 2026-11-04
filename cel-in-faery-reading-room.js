/* =============================================================================
   The Reading Room, walked into on Cel Street, through the bookcase door in
   the Faery Yurt. Ryan's ask, 2026-10-31: the yurt's doorways opening onto
   their rooms.

   IT IS HELEN EDGAR'S ROOM AND HER WORLD (§114), and this is OURS: a drawing
   of her library for Cel Street, in her room's own declared colours and
   nothing else, which changes nothing on her page and is hers to keep or send
   back. Claret walls lit from the FLOOR by a fire at one side, so it is
   warmest at the hearthrug and darkest at the ceiling; a pointed stone
   fireplace, a sofa and two chairs, candles in brass sconces on the walls and
   never along the shelves (the Mopery's are along its shelves), and her
   bookcases standing in tall timber arches drawn up to a point.

   THE BOOKCASES AND THE GRAMOPHONE ARE HER PAGE'S OWN, lifted off it by the
   kit: five of her cases, every spine a door as on the page, and the
   gramophone's deck and its shelf of records, which rack.js, the page's own
   script, plays here as it does there; nothing reaches YouTube until a press.
   The record shelf holds every record, and scrolls when there are more than
   fit. Her page hangs on the far wall in a timber frame.

   ROUND 2 (Ryan's ask, 2026-11-04, "Do a round 2 on the subrooms of the yurt")
   brought more of what her page says is in the room: three more of her cases,
   two either side of the bookcase door and her Poetry at the far end of the
   right-hand wall; the card catalogue, a cabinet of drawers by the door with
   her page's own drawers lifted over it; and, drawn, the chandelier of seven
   candles over the hearthrug, a raven on the mantel and
   one on two of the arches, a candelabra of three candles either side of the
   hearth, the sofa's brass and flame cushions and the book left open on it,
   and the rug, an oval with a brass ring as on her page.

   NOTHING MOVES. The fire is drawn, the candles stand still. Every colour is
   one her room declares, by name. It keeps nothing, sends nothing and fetches
   nothing; her page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['faery-reading-room.html'] = {
    name: 'The Reading Room',
    from: 'faery-yurt.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, W = 12, D = 13, H = 6.8, back = -D;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;

      // FIRELIGHT FROM THE FLOOR AT ONE SIDE, and the dark up under the roof.
      kit.scene.background = kit.col('--rdr-stone');
      kit.scene.add(new T.HemisphereLight(kit.col('--rdr-wall'), kit.col('--rdr-ember'), 1.6));
      var fire = new T.PointLight(kit.col('--rdr-flame'), 34, 16, 1.2);
      fire.position.set(-W / 2 + 0.9, 0.5, -6.5);
      kit.scene.add(fire);

      // THE ROOM: boards, claret walls, a ceiling lost in the dark.
      box(W, 0.1, D + 0.4, at(0, -0.05, -D / 2), '--rdr-timber', false, false);
      box(0.3, H, D, at(-W / 2 - 0.15, H / 2, -D / 2), '--rdr-wall');
      box(0.3, H, D, at(W / 2 + 0.15, H / 2, -D / 2), '--rdr-wall');
      box(W + 0.6, H, 0.3, at(0, H / 2, back - 0.15), '--rdr-wall');
      box(W + 0.6, H, 0.3, at(0, H / 2, 0.15), '--rdr-wall');
      box(W + 0.6, 0.2, D + 0.6, at(0, H + 0.1, -D / 2), '--rdr-stone', false, false);
      // Skirting and a dado rail in timber all round.
      [[0, back + 0.02, 0, W], [0, -0.02, Math.PI, W], [-W / 2 + 0.02, -D / 2, LEFT, D], [W / 2 - 0.02, -D / 2, RIGHT, D]].forEach(function (w) {
        box(w[3], 0.2, 0.05, at(w[0], 0.1, w[1], w[2]), '--rdr-timber', false);
        box(w[3], 0.07, 0.06, at(w[0], 1.0, w[1], w[2]), '--rdr-timber', false);
      });
      // The bookcase door you came in by, behind you.
      box(1.6, 2.6, 0.12, at(0, 1.3, -0.06), '--rdr-timber');
      for (var r = 0; r < 4; r++) box(1.4, 0.04, 0.1, at(0, 0.4 + r * 0.6, -0.12), '--rdr-leather', false);

      // A POINTED TIMBER ARCH round a case, w wide and h tall, drawn up to a
      // point the way her arches are.
      function arch(g, w, h) {
        [-1, 1].forEach(function (s) { box(0.16, h + 0.1, 0.22, M(g, at(s * (w / 2 + 0.08), (h + 0.1) / 2, 0.02)), '--rdr-timber'); });
        var half = w / 2 + 0.16, rise = Math.max(0.6, w * 0.7), len = Math.hypot(half, rise);
        [-1, 1].forEach(function (s) {
          box(len + 0.08, 0.16, 0.22, M(g, at(s * half / 2, h + 0.1 + rise / 2, 0.02, 0, 0, -s * Math.atan2(rise, half))), '--rdr-timber');
        });
        box(w + 0.3, 0.14, 0.4, M(g, at(0, 0.07, 0.12)), '--rdr-timber');
      }

      // HER CASES, lifted off her page. A case is 236 pixels wide; at 0.8 of a
      // metre the shortest stands about two and a half metres tall and her own
      // shelf five and a half.
      var CW = 0.8, scale = CW / 236;
      var stops = [{ name: 'just through the bookcase door', x: 0, z: -1.4, yaw: 0 }];
      function caseAt(n, label, g, h) {
        arch(g, CW, h);
        var it = kit.lift(frame, '.yurt-case', { n: n, w: 236, ww: CW, m: M(g, at(0, 0.16, 0.06)) });
        return it;
      }
      var frame = null;
      // The page goes up first, so the lifts have a frame to copy from.
      var pw = 3.0, ph = pw * 800 / 1180, py = 1.3 + ph / 2;
      var pg = at(0, 0, back + 0.02);
      box(pw + 0.24, ph + 0.24, 0.08, M(pg, at(0, py, 0)), '--rdr-timber');
      frame = kit.screen(1180, 800, pw, M(pg, at(0, py, 0.06)), 'Helen Edgar’s Reading Room’s own page, on the far wall in a timber frame');
      stops.push({ name: 'at the far wall, with her room’s own page on it', x: 0, z: back + 3.4, yaw: 0, page: kit.page, frame: frame });

      var CASES = [
        { n: 8, label: 'Helen’s Shelf', g: at(-3.6, 0, back + 0.15), h: 1612 * scale, yaw: 0, sx: -3.6, sz: back + 3.0 },
        { n: 10, label: 'Art', g: at(3.6, 0, back + 0.15), h: 1032 * scale, yaw: 0, sx: 3.6, sz: back + 2.8 },
        { n: 3, label: 'Old Classics', g: at(W / 2 - 0.15, 0, -2.6, RIGHT), h: 742 * scale, yaw: RIGHT, sx: W / 2 - 2.5, sz: -2.6 },
        { n: 5, label: 'Myth & Otherworlds', g: at(W / 2 - 0.15, 0, -5.4, RIGHT), h: 742 * scale, yaw: RIGHT, sx: W / 2 - 2.5, sz: -5.4 },
        { n: 6, label: 'Liberation & Rest', g: at(W / 2 - 0.15, 0, -8.8, RIGHT), h: 1032 * scale, yaw: RIGHT, sx: W / 2 - 2.6, sz: -8.8 }
      ];
      CASES.forEach(function (c) {
        var it = caseAt(c.n, c.label, c.g, c.h);
        stops.push({ name: 'at the ' + c.label + ' case', x: c.sx, z: c.sz, yaw: c.yaw, frame: it.el });
      });

      // THE FIREPLACE in the left wall: a pointed stone surround, the logs and
      // the fire in them, two candles on the mantel.
      var fp = at(-W / 2 + 0.15, 0, -6.5, LEFT);
      [-1, 1].forEach(function (s) { box(0.4, 2.0, 0.5, M(fp, at(s * 1.1, 1.0, 0.25)), '--rdr-stone'); });
      [-1, 1].forEach(function (s) { box(1.45, 0.4, 0.5, M(fp, at(s * 0.58, 2.35, 0.25, 0, 0, -s * 0.5)), '--rdr-stone'); });
      box(2.9, 0.14, 0.7, M(fp, at(0, 2.05, 0.35)), '--rdr-stone');
      box(1.8, 1.9, 0.1, M(fp, at(0, 0.95, 0.05)), '--rdr-stone', false);
      box(2.6, 0.1, 1.1, M(fp, at(0, 0.05, 0.75)), '--rdr-stone', false);
      [-0.3, 0.3].forEach(function (x, i) { kit.cyl(0.12, 0.12, 1.1, M(fp, at(x, 0.2, 0.35, 0.3 * (i ? 1 : -1), 0, Math.PI / 2)), '--rdr-leather', 0.02, 10); });
      [[0, 0.62, 0.32, 0.5], [-0.32, 0.52, 0.22, 0.38], [0.3, 0.5, 0.2, 0.34]].forEach(function (f, i) {
        kit.flat(new T.ConeGeometry(f[2], f[3], 8), M(fp, at(f[0], f[1], 0.4)), i ? '--rdr-flame' : '--rdr-flame-2');
      });
      kit.flat(new T.PlaneGeometry(1.2, 0.08), M(fp, at(0, 0.3, 0.52)), '--rdr-ember');
      [-0.9, 0.9].forEach(function (x) {
        kit.cyl(0.05, 0.05, 0.32, M(fp, at(x, 2.28, 0.4)), '--rdr-ink-2', false, 8);
        kit.flat(new T.ConeGeometry(0.035, 0.1, 6), M(fp, at(x, 2.5, 0.4)), '--rdr-flame-2');
      });
      stops.push({ name: 'by the fire, on the hearthrug', x: -W / 2 + 3.6, z: -6.5, yaw: LEFT });

      // THE HEARTHRUG, the sofa facing the fire, and two chairs.
      // An oval rug with a brass ring, as her page draws it.
      kit.piece(new T.CylinderGeometry(1, 1, 0.03, 48).scale(1.75, 1, 1.25), at(-W / 2 + 2.6, 0.015, -6.5), '--rdr-velvet', false, false);
      kit.piece(new T.TorusGeometry(1, 0.03, 4, 56).scale(1.45, 1.0, 1), at(-W / 2 + 2.6, 0.035, -6.5, 0, Math.PI / 2), '--rdr-brass', false, false);
      var sofa = at(-W / 2 + 4.6, 0, -6.5, LEFT);
      box(2.4, 0.45, 0.9, M(sofa, at(0, 0.32, 0)), '--rdr-velvet');
      box(2.4, 0.8, 0.25, M(sofa, at(0, 0.75, -0.42)), '--rdr-velvet');
      [-1, 1].forEach(function (s) { box(0.22, 0.6, 0.9, M(sofa, at(s * 1.2, 0.5, 0)), '--rdr-velvet'); });
      [[-W / 2 + 3.0, -4.3, 2.4], [-W / 2 + 3.0, -8.7, 0.7]].forEach(function (c) {
        var g = at(c[0], 0, c[1], c[2]);
        box(0.9, 0.45, 0.85, M(g, at(0, 0.3, 0)), '--rdr-leather');
        box(0.9, 0.85, 0.2, M(g, at(0, 0.8, -0.35)), '--rdr-leather');
        [-1, 1].forEach(function (s) { box(0.16, 0.55, 0.85, M(g, at(s * 0.45, 0.5, 0)), '--rdr-leather'); });
      });

      // THE GRAMOPHONE, in the corner past the fire: a drawn machine on its
      // table, and her page's own deck and record shelf on the wall by it.
      var gm = at(-W / 2 + 0.7, 0, -10.6, LEFT);
      box(0.8, 0.8, 0.7, M(gm, at(0, 0.4, 0)), '--rdr-timber');
      box(0.55, 0.2, 0.5, M(gm, at(0, 0.9, 0)), '--rdr-leather');
      kit.cyl(0.21, 0.21, 0.02, M(gm, at(0, 1.01, 0)), '--rdr-stone', false, 20);
      kit.cyl(0.02, 0.02, 0.5, M(gm, at(0.15, 1.2, -0.12, 0, -0.5)), '--rdr-brass', false, 6);
      kit.piece(new T.ConeGeometry(0.36, 0.7, 18, 1, true), M(gm, at(0.25, 1.55, -0.32, 0, -0.85)), '--rdr-brass', 0.02);
      var deck = kit.lift(frame, '.rdr-deck', { w: 600, ww: 1.4, m: at(-W / 2 + 0.08, 1.15, -9.0, LEFT) });
      var lps = kit.lift(frame, '.rdr-rack', { w: 600, h: 700, ww: 1.4, m: at(-W / 2 + 0.08, 0.2, -11.7, LEFT) });
      kit.wire(frame, 'rack.js');
      stops.push({ name: 'at the gramophone, with its switch', x: -W / 2 + 2.4, z: -9.3, yaw: LEFT, frame: deck.el });
      stops.push({ name: 'at the shelf of records by the gramophone', x: -W / 2 + 2.6, z: -11.6, yaw: LEFT, pitch: -0.2, frame: lps.el });

      // CANDLES IN BRASS SCONCES on the walls, between the cases, still.
      function sconce(g) {
        box(0.08, 0.3, 0.08, M(g, at(0, 0, 0.06)), '--rdr-brass', false);
        box(0.2, 0.04, 0.2, M(g, at(0, -0.12, 0.14)), '--rdr-brass', false);
        kit.cyl(0.035, 0.035, 0.22, M(g, at(0, 0.0, 0.14)), '--rdr-ink-2', false, 8);
        kit.flat(new T.ConeGeometry(0.03, 0.09, 6), M(g, at(0, 0.16, 0.14)), '--rdr-flame-2');
      }
      [at(-1.9, 2.4, back + 0.02), at(1.9, 2.4, back + 0.02), at(W / 2 - 0.02, 2.4, -4.0, RIGHT), at(W / 2 - 0.02, 2.4, -7.1, RIGHT),
       at(-W / 2 + 0.02, 2.4, -3.0, LEFT), at(-W / 2 + 0.02, 2.4, -12.2, LEFT)].forEach(sconce);
      [[-1.9, back + 0.4], [W / 2 - 0.4, -4.0], [-W / 2 + 0.4, -3.0]].forEach(function (c) {
        var l = new T.PointLight(kit.col('--rdr-flame-2'), 2.2, 5, 1.6);
        l.position.set(c[0], 2.6, c[1]);
        kit.scene.add(l);
      });

      // A CANDLE standing still: wax in her ink, a flame, as on her page.
      function candle(g, h) {
        kit.cyl(0.035, 0.035, h, M(g, at(0, h / 2, 0)), '--rdr-ink', false, 8);
        kit.flat(new T.ConeGeometry(0.03, 0.1, 6), M(g, at(0, h + 0.05, 0)), '--rdr-flame-2');
      }
      // A RAVEN, perched, looking along +x of where it is put: her page's
      // ravens, drawn in the darkest stone she declares.
      function raven(g, k) {
        var r = function (x, y, z, ry, rx, rz) { return M(g, M(new T.Matrix4().makeScale(k, k, k), at(x, y, z, ry, rx, rz))); };
        kit.piece(new T.SphereGeometry(1, 12, 8).scale(0.17, 0.1, 0.09), r(0, 0.12, 0, 0, 0, 0.2), '--rdr-stone', 0.01);
        kit.piece(new T.SphereGeometry(0.065, 10, 8), r(0.15, 0.22, 0), '--rdr-stone', 0.01);
        kit.piece(new T.ConeGeometry(0.025, 0.1, 6), r(0.24, 0.21, 0, 0, 0, -Math.PI / 2), '--rdr-panel', false);
        box(0.16, 0.02, 0.07, r(-0.2, 0.08, 0, 0, 0, 0.35), '--rdr-stone', false);
        kit.flat(new T.SphereGeometry(0.01, 6, 4), r(0.18, 0.24, 0.05), '--rdr-brass');
        kit.flat(new T.SphereGeometry(0.01, 6, 4), r(0.18, 0.24, -0.05), '--rdr-brass');
        [-0.03, 0.03].forEach(function (z) { box(0.012, 0.06, 0.012, r(0.0, 0.03, z), '--rdr-panel', false); });
      }

      // THE FIRE'S OPENING drawn up to a point in darker stone, brass firedogs
      // either side of the logs, and the fire's light lying on the hearthstone.
      [-1, 1].forEach(function (s) {
        box(0.12, 1.25, 0.08, M(fp, at(s * 0.72, 0.62, 0.52)), '--rdr-panel', false);
        box(0.86, 0.12, 0.08, M(fp, at(s * 0.36, 1.42, 0.52, 0, 0, -s * 0.62)), '--rdr-panel', false);
        kit.cyl(0.02, 0.02, 0.42, M(fp, at(s * 0.52, 0.21, 0.62)), '--rdr-brass', false, 6);
        kit.flat(new T.SphereGeometry(0.05, 8, 6), M(fp, at(s * 0.52, 0.45, 0.62)), '--rdr-brass');
      });
      kit.flat(new T.CircleGeometry(0.9, 24).scale(1, 0.45, 1), M(fp, at(0, 0.11, 1.0, 0, -Math.PI / 2)), '--rdr-ember');

      // THE MANTEL: a raven on it, turned to the room, and a candelabra of
      // three candles standing on the floor either side of the hearth.
      raven(M(fp, at(0.1, 2.12, 0.35, -0.7)), 1.6);
      [-1.65, 1.65].forEach(function (x) {
        var c = M(fp, at(x, 0, 0.55));
        kit.cyl(0.14, 0.18, 0.05, M(c, at(0, 0.025, 0)), '--rdr-brass', false, 12);
        kit.cyl(0.025, 0.03, 1.15, M(c, at(0, 0.6, 0)), '--rdr-brass', false, 8);
        kit.flat(new T.SphereGeometry(0.05, 8, 6), M(c, at(0, 0.6, 0)), '--rdr-brass');
        [-1, 1].forEach(function (s) { box(0.34, 0.03, 0.03, M(c, at(s * 0.15, 1.12, 0, 0, 0, s * 0.35)), '--rdr-brass', false); });
        [[-0.3, 1.24], [0, 1.2], [0.3, 1.24]].forEach(function (k) {
          var cup = M(c, at(k[0], k[1], 0));
          kit.cyl(0.05, 0.03, 0.04, cup, '--rdr-brass', false, 8);
          candle(cup, k[0] ? 0.24 : 0.3);
        });
      });

      // THE SOFA'S CUSHIONS, brass and flame, and the book left open on it.
      box(0.5, 0.42, 0.14, M(sofa, at(-0.75, 0.75, -0.24, 0, -0.25)), '--rdr-brass');
      box(0.5, 0.42, 0.14, M(sofa, at(0.75, 0.75, -0.24, 0, -0.25)), '--rdr-flame');
      [-1, 1].forEach(function (s) { box(0.2, 0.012, 0.28, M(sofa, at(s * 0.1, 0.565, 0.12, 0, 0, s * 0.12)), '--rdr-ink', false, false); });

      // THE CHANDELIER over the hearthrug, as on her page: a brass ring hung
      // from the dark, seven candles, one at the heart of it; nothing flickers.
      var ch = at(-W / 2 + 2.8, 4.3, -6.5);
      kit.cyl(0.018, 0.018, H - 4.3 - 0.4, M(ch, at(0, (H - 4.3 + 0.4) / 2, 0)), '--rdr-brass', false, 6);
      kit.piece(new T.TorusGeometry(0.06, 0.012, 6, 16), M(ch, at(0, 0.42, 0)), '--rdr-brass', false);
      kit.flat(new T.SphereGeometry(0.07, 10, 8), M(ch, at(0, 0.3, 0)), '--rdr-brass');
      kit.piece(new T.TorusGeometry(0.85, 0.025, 6, 48), M(ch, at(0, -0.15, 0, 0, Math.PI / 2)), '--rdr-brass', 0.01);
      for (var a = 0; a < 6; a++) {
        var t = a / 6 * Math.PI * 2, cx = Math.cos(t) * 0.85, cz = Math.sin(t) * 0.85;
        box(0.86, 0.025, 0.025, M(ch, at(cx / 2, 0.08, cz / 2, -t, 0, -0.5)), '--rdr-brass', false);
        var cup = M(ch, at(cx, -0.12, cz));
        kit.cyl(0.05, 0.03, 0.04, cup, '--rdr-brass', false, 8);
        candle(cup, 0.22);
        kit.flat(new T.SphereGeometry(0.018, 6, 4), M(ch, at(Math.cos(t + 0.5) * 0.85, -0.22, Math.sin(t + 0.5) * 0.85)), '--rdr-brass');
      }
      candle(M(ch, at(0, 0.34, 0)), 0.26);
      var cl = new T.PointLight(kit.col('--rdr-flame-2'), 3.2, 6, 1.6);
      cl.position.set(-W / 2 + 2.8, 4.4, -6.5);
      kit.scene.add(cl);
      stops.push({ name: 'by the hearthrug, under the chandelier, its seven candles standing still', x: -0.5, z: -3.4, yaw: 0.72, pitch: 0.16 });

      // THREE MORE OF HER CASES: two either side of the bookcase door, facing
      // into the room, and her Poetry at the far end of the right-hand wall.
      [
        { n: 4, label: 'Earth & Kin', g: at(-3.4, 0, -0.15, Math.PI), h: 1322 * scale, yaw: Math.PI, sx: -3.4, sz: -4.4, pitch: 0.1 },
        { n: 7, label: 'Neurodivergence', g: at(3.4, 0, -0.15, Math.PI), h: 1032 * scale, yaw: Math.PI, sx: 3.4, sz: -3.8, pitch: 0.06 },
        { n: 0, label: 'Poetry', g: at(W / 2 - 0.15, 0, -11.6, RIGHT), h: 1612 * scale, yaw: RIGHT, sx: 0.2, sz: -11.4, pitch: 0.14 }
      ].forEach(function (c) {
        var it = caseAt(c.n, c.label, c.g, c.h);
        stops.push({ name: 'at the ' + c.label + ' case', x: c.sx, z: c.sz, yaw: c.yaw, pitch: c.pitch, frame: it.el });
      });
      // Ravens on two of the arches.
      raven(at(-3.6, 1612 * scale + 0.78, back + 0.3, -Math.PI / 2), 1.3);
      raven(at(W / 2 - 0.3, 1032 * scale + 0.66, -8.8, Math.PI), 1.3);
      // A sconce either side of the door between it and the cases.
      [at(-1.7, 2.4, -0.02, Math.PI), at(1.7, 2.4, -0.02, Math.PI), at(W / 2 - 0.02, 2.4, -10.2, RIGHT)].forEach(sconce);
      [[-1.7, -0.4], [W / 2 - 0.4, -10.2]].forEach(function (c) {
        var l = new T.PointLight(kit.col('--rdr-flame-2'), 2.2, 5, 1.6);
        l.position.set(c[0], 2.6, c[1]);
        kit.scene.add(l);
      });

      // THE CARD CATALOGUE by the door: a timber cabinet of drawers, each with
      // a brass pull and a card in its brass holder, and her page's own drawers
      // pulled out over it, a card for each author.
      var cg = at(-W / 2 + 0.3, 0, -1.9, LEFT);
      box(1.8, 1.15, 0.5, M(cg, at(0, 0.575, 0)), '--rdr-timber');
      box(1.9, 0.06, 0.56, M(cg, at(0, 1.18, 0)), '--rdr-timber');
      for (var dr = 0; dr < 3; dr++) {
        for (var dc = 0; dc < 6; dc++) {
          var dx = -0.75 + dc * 0.3, dy = 0.25 + dr * 0.32;
          box(0.26, 0.27, 0.02, M(cg, at(dx, dy, 0.26)), '--rdr-panel', false);
          box(0.1, 0.05, 0.02, M(cg, at(dx, dy + 0.06, 0.275)), '--rdr-brass', false);
          box(0.08, 0.035, 0.01, M(cg, at(dx, dy + 0.06, 0.29)), '--rdr-ink-2', false, false);
          box(0.08, 0.02, 0.03, M(cg, at(dx, dy - 0.07, 0.28)), '--rdr-brass', false);
        }
      }
      var cat = kit.lift(frame, '.rdr-cat', { w: 780, h: 1009, ww: 1.7, m: at(-W / 2 + 0.08, 1.35, -1.9, LEFT) });
      stops.push({ name: 'at the card catalogue, a drawer for each case and a card for each author', x: -W / 2 + 3.1, z: -1.9, yaw: LEFT, pitch: 0.06, frame: cat.el });

      return {
        start: { x: 0, z: -1.4, yaw: 0 },
        bounds: { x: [-W / 2 + 1.0, W / 2 - 1.0], z: [back + 1.2, -0.8] },
        stops: stops
      };
    }
  };
})();

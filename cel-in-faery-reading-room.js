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

   ROUND 3 (Ryan's ask, 2026-11-04: more texture and detail, things that move
   when asked, things to press) drew the joints between the boards, panels
   under the dado rail, wax run down every candle and pooled in its sconce,
   more logs, a grate and embers in the fire, buttons in the sofa's back and
   brass nails in the chairs, a fringe and an inner ring on the rug, and her
   record on the gramophone, black with its grooves, a red label and her brass
   crescent on it off the middle, with a tone arm and a crank. And it gave the
   room four things to press, each saying what it did: her page's own two
   switches, Join the Faeries (small faeries of ours, hung still between the
   cases) and Grow a garden (ivy, toadstools and mushrooms round the foot of
   the walls), drawn in the yurt's colours because they are the yurt's own
   switches in here too; the book left on the sofa, shut with a ribbon in it
   or open again; and a drawer of the card catalogue, pulled out or pushed
   back. The book and the drawer can be pressed where they are, too.

   WHAT MOVES IS WHAT MOVES ON HER PAGE. Her dial says MAX turns the record on
   the gramophone, nothing else moves unless you ask, and the candles stand
   still. So here the record goes round once in six seconds at MAX, as hers
   does, or at any setting once somebody presses Turn the record, and nothing
   else moves: the fire is drawn and the candles stand still, and there is no
   switch to make them flicker, because her page says they never do. Every
   colour is one her room declares, or the yurt's for its garden and faeries,
   by name. It keeps nothing, sends nothing and fetches nothing; her page
   arrives through Cel Street's screen(). tools/make-cel-street.py holds each
   of those.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 23, 374761393) ^ Math.imul(j + 61, 668265263) ^ Math.imul(k + 71, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }
  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['faery-reading-room.html'] = {
    name: 'The Reading Room',
    from: 'faery-yurt.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, W = 12, D = 13, H = 6.8, back = -D;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2, ID = new T.Matrix4();
      // Many small things in one colour as one mesh, so a garden of leaves or
      // a flock of faeries can be shown or put away in one go.
      function merged(parts) {
        var arrs = [], n = 0;
        parts.forEach(function (p) {
          var g = p[0].index ? p[0].toNonIndexed() : p[0].clone();
          g.applyMatrix4(p[1]); arrs.push(g.attributes.position.array); n += g.attributes.position.array.length;
        });
        var pos = new Float32Array(n), o = 0;
        arrs.forEach(function (a) { pos.set(a, o); o += a.length; });
        var out = new T.BufferGeometry(); out.setAttribute('position', new T.BufferAttribute(pos, 3));
        out.computeVertexNormals();
        return out;
      }
      function add(groups, ink, geo, m) { (groups[ink] = groups[ink] || []).push([geo, m]); }
      function drawn(groups, flat) {
        return Object.keys(groups).map(function (ink) { return flat ? kit.flat(merged(groups[ink]), ID, ink) : kit.facets(merged(groups[ink]), ID, ink); });
      }

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
      // The boards run from the door to the far wall, a dark joint between
      // each, and their ends meet here and there across them.
      for (var bx = -W / 2 + 0.24; bx < W / 2 - 0.1; bx += 0.24) box(0.014, 0.004, D, at(bx, 0.002, -D / 2), '--rdr-stone', false, false);
      for (var bj = 0; bj < 60; bj++) {
        var jx = -W / 2 + 0.12 + 0.24 * Math.floor(hash(bj, 1, 1) * 49);
        box(0.226, 0.004, 0.014, at(jx, 0.002, -0.4 - hash(bj, 1, 2) * (D - 0.8)), '--rdr-stone', false, false);
      }
      // Panels framed in timber under the dado rail, all round, but at the
      // bookcase door and the fireplace.
      [[at(0, 0, back + 0.03), W], [at(0, 0, -0.03, Math.PI), W], [at(-W / 2 + 0.03, 0, -D / 2, LEFT), D], [at(W / 2 - 0.03, 0, -D / 2, RIGHT), D]].forEach(function (w) {
        for (var px = -w[1] / 2 + 0.6; px < w[1] / 2 - 0.4; px += 1.0) {
          var p = new T.Vector3(px, 0, 0).applyMatrix4(w[0]);
          if (Math.abs(p.x) < 1.3 && p.z > -0.5) continue;
          if (p.x < -W / 2 + 0.5 && p.z < -4.8 && p.z > -8.2) continue;
          box(0.82, 0.03, 0.02, M(w[0], at(px, 0.28, 0.01)), '--rdr-timber', false, false);
          box(0.82, 0.03, 0.02, M(w[0], at(px, 0.92, 0.01)), '--rdr-timber', false, false);
          [-0.4, 0.4].forEach(function (e) { box(0.03, 0.67, 0.02, M(w[0], at(px + e, 0.6, 0.01)), '--rdr-timber', false, false); });
        }
      });
      // Beams across the dark under the roof.
      for (var bm = 0; bm < 6; bm++) box(W, 0.22, 0.24, at(0, H - 0.12, -1.0 - bm * 2.2), '--rdr-timber', false);

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
      // An ember ring inside the brass one, a lozenge at its heart, and a
      // fringe at either end, worn a little uneven.
      kit.piece(new T.TorusGeometry(1, 0.022, 4, 56).scale(1.05, 0.68, 1), at(-W / 2 + 2.6, 0.036, -6.5, 0, Math.PI / 2), '--rdr-ember', false, false);
      kit.piece(new T.CylinderGeometry(0.3, 0.3, 0.012, 4).scale(1.4, 1, 0.8), at(-W / 2 + 2.6, 0.036, -6.5), '--rdr-brass', false, false);
      [-1, 1].forEach(function (s) {
        for (var fr = 0; fr < 22; fr++) {
          var ft = (fr / 21 - 0.5) * 0.9, fl = 0.07 + hash(fr, s + 2, 5) * 0.04;
          var ex = Math.cos(ft) * 1.75, ez = Math.sin(ft) * 1.25;
          box(0.012, 0.006, fl, at(-W / 2 + 2.6 + s * (ex + fl / 2), 0.008, -6.5 + ez, s * Math.PI / 2 - ft * 0.4 * s), '--rdr-ink-2', false, false);
        }
      });
      var sofa = at(-W / 2 + 4.6, 0, -6.5, LEFT);
      box(2.4, 0.45, 0.9, M(sofa, at(0, 0.32, 0)), '--rdr-velvet');
      box(2.4, 0.8, 0.25, M(sofa, at(0, 0.75, -0.42)), '--rdr-velvet');
      [-1, 1].forEach(function (s) { box(0.22, 0.6, 0.9, M(sofa, at(s * 1.2, 0.5, 0)), '--rdr-velvet'); });
      [[-W / 2 + 3.0, -4.3, 2.4], [-W / 2 + 3.0, -8.7, 0.7]].forEach(function (c) {
        var g = at(c[0], 0, c[1], c[2]);
        box(0.9, 0.45, 0.85, M(g, at(0, 0.3, 0)), '--rdr-leather');
        box(0.9, 0.85, 0.2, M(g, at(0, 0.8, -0.35)), '--rdr-leather');
        [-1, 1].forEach(function (s) { box(0.16, 0.55, 0.85, M(g, at(s * 0.45, 0.5, 0)), '--rdr-leather'); });
        // Brass nails down the front of each arm and along the seat, and
        // turned feet.
        [-1, 1].forEach(function (s) {
          for (var nl = 0; nl < 6; nl++) kit.piece(new T.SphereGeometry(0.013, 5, 3), M(g, at(s * 0.45, 0.3 + nl * 0.08, 0.43)), '--rdr-brass', false);
          [-1, 1].forEach(function (f) { kit.cyl(0.035, 0.025, 0.08, M(g, at(s * 0.38, 0.04, f * 0.34)), '--rdr-timber', false, 8); });
        });
        for (var ns = 0; ns < 8; ns++) kit.piece(new T.SphereGeometry(0.012, 5, 3), M(g, at(-0.33 + ns * 0.094, 0.48, 0.43)), '--rdr-brass', false);
        box(0.7, 0.008, 0.012, M(g, at(0, 0.52, 0.4)), '--rdr-timber', false, false);
      });
      // The sofa's back buttoned deep in rows, its seat in two cushions, and
      // its feet.
      for (var by = 0; by < 2; by++) {
        for (var bc = 0; bc < 7; bc++) kit.piece(new T.SphereGeometry(0.022, 6, 4), M(sofa, at(-0.9 + bc * 0.3 + (by ? 0.15 : 0), 0.82 + by * 0.18, -0.29)), '--rdr-wall', false);
      }
      box(0.012, 0.01, 0.86, M(sofa, at(0, 0.548, 0)), '--rdr-wall', false, false);
      [-1, 1].forEach(function (s) { [-1, 1].forEach(function (f) { kit.cyl(0.04, 0.03, 0.1, M(sofa, at(s * 1.12, 0.05, f * 0.36)), '--rdr-timber', false, 8); }); });

      // THE GRAMOPHONE, in the corner past the fire: a drawn machine on its
      // table, and her page's own deck and record shelf on the wall by it.
      var gm = at(-W / 2 + 0.7, 0, -10.6, LEFT);
      box(0.8, 0.8, 0.7, M(gm, at(0, 0.4, 0)), '--rdr-timber');
      box(0.55, 0.2, 0.5, M(gm, at(0, 0.9, 0)), '--rdr-leather');
      // HER RECORD, as on her page: black, its grooves, a red label with a
      // brass ring, and her brass crescent off the middle so you can see it go
      // round; the tone arm lies on it and does not turn.
      var recordAt = M(gm, at(0, 1.01, 0)), record = [];
      kit.cyl(0.225, 0.225, 0.012, M(gm, at(0, 1.0, 0)), '--rdr-leather', false, 24);
      record.push(kit.facets(new T.CylinderGeometry(0.21, 0.21, 0.014, 36), M(recordAt, at(0, 0.006, 0)), '--rdr-stone'));
      [0.198, 0.18, 0.162, 0.144, 0.126, 0.108, 0.09].forEach(function (r) { kit.flat(new T.RingGeometry(r - 0.003, r, 40), M(recordAt, at(0, 0.0135, 0, 0, -Math.PI / 2)), '--rdr-panel'); });
      record.push(kit.flat(new T.CircleGeometry(0.065, 24), M(recordAt, at(0, 0.0142, 0, 0, -Math.PI / 2)), '--rdr-ember'));
      kit.flat(new T.RingGeometry(0.062, 0.065, 32), M(recordAt, at(0, 0.0146, 0, 0, -Math.PI / 2)), '--rdr-brass');
      var crescent = new T.Shape(); crescent.absarc(0, 0, 0.022, 0.6, Math.PI * 2 - 0.6, false); crescent.absarc(0.01, 0, 0.017, Math.PI * 2 - 1.0, 1.0, true);
      record.push(kit.flat(new T.ShapeGeometry(crescent), M(recordAt, at(-0.028, 0.0152, -0.014, 0, -Math.PI / 2)), '--rdr-brass'));
      kit.cyl(0.006, 0.006, 0.04, M(recordAt, at(0, 0.02, 0)), '--rdr-brass', false, 6);
      kit.cyl(0.025, 0.025, 0.05, M(gm, at(0.23, 1.035, 0.17)), '--rdr-brass', false, 8);
      kit.cyl(0.006, 0.005, 0.26, M(gm, at(0.13, 1.045, 0.1, -0.5, 0, Math.PI / 2)), '--rdr-brass', false, 5);
      box(0.035, 0.02, 0.045, M(gm, at(0.02, 1.035, 0.035, -0.5)), '--rdr-brass', false, false);
      // A crank in the side of the box to wind it.
      kit.cyl(0.012, 0.012, 0.16, M(gm, at(0.47, 0.62, 0.05, 0, 0, Math.PI / 2)), '--rdr-brass', false, 6);
      box(0.02, 0.16, 0.02, M(gm, at(0.55, 0.56, 0.05)), '--rdr-brass', false);
      kit.cyl(0.02, 0.02, 0.07, M(gm, at(0.59, 0.49, 0.05, 0, 0, Math.PI / 2)), '--rdr-timber', false, 8);
      kit.cyl(0.02, 0.02, 0.5, M(gm, at(0.15, 1.2, -0.12, 0, -0.5)), '--rdr-brass', false, 6);
      var hornAt = M(gm, at(0.25, 1.55, -0.32, 0, -0.85));
      kit.piece(new T.ConeGeometry(0.36, 0.7, 18, 1, true), hornAt, '--rdr-brass', 0.02);
      kit.piece(new T.TorusGeometry(0.36, 0.014, 6, 24), M(hornAt, at(0, -0.35, 0, 0, Math.PI / 2)), '--rdr-brass', false);
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
        // Wax run down its side and pooled in the dish, and the wick.
        kit.cyl(0.008, 0.012, 0.12, M(g, at(0.03, 0.04, 0.155)), '--rdr-ink-2', false, 5);
        kit.cyl(0.006, 0.01, 0.07, M(g, at(-0.028, 0.06, 0.13)), '--rdr-ink-2', false, 5);
        kit.cyl(0.06, 0.07, 0.012, M(g, at(0.01, -0.095, 0.14)), '--rdr-ink-2', false, 10);
        kit.cyl(0.003, 0.003, 0.02, M(g, at(0, 0.12, 0.14)), '--rdr-stone', false, 3);
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
        // A drip of wax down one side, a thinner one down the other, and the wick.
        kit.cyl(0.009, 0.013, h * 0.45, M(g, at(0.03, h * 0.74, 0.012)), '--rdr-ink', false, 5);
        kit.cyl(0.006, 0.01, h * 0.25, M(g, at(-0.024, h * 0.84, -0.018)), '--rdr-ink', false, 5);
        kit.cyl(0.003, 0.003, 0.022, M(g, at(0, h + 0.008, 0)), '--rdr-stone', false, 3);
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
      // A third log laid across the two, a grate of iron bars before them,
      // and embers and ash in the bed of the fire.
      kit.cyl(0.1, 0.11, 0.95, M(fp, at(0.05, 0.4, 0.3, 0.2, 0, Math.PI / 2)), '--rdr-leather', 0.02, 10);
      [[-0.3, 0.2, 0.35, -0.3], [0.3, 0.2, 0.35, 0.3]].forEach(function (lg) {
        [-1, 1].forEach(function (e) { kit.flat(new T.CircleGeometry(0.1, 10), M(fp, at(lg[0], lg[1], lg[2], lg[3])).multiply(at(e * 0.552, 0, 0, e * Math.PI / 2)), '--rdr-ember'); });
      });
      for (var gb = 0; gb < 7; gb++) box(0.03, 0.4, 0.03, M(fp, at(-0.54 + gb * 0.18, 0.22, 0.62)), '--rdr-stone', false);
      box(1.2, 0.04, 0.04, M(fp, at(0, 0.4, 0.62)), '--rdr-stone', false);
      box(1.2, 0.04, 0.04, M(fp, at(0, 0.06, 0.62)), '--rdr-stone', false);
      var embers = {};
      for (var em = 0; em < 26; em++) add(embers, em % 3 ? '--rdr-flame' : '--rdr-flame-2', new T.SphereGeometry(0.02 + hash(em, 7, 1) * 0.02, 5, 4), M(fp, at((hash(em, 7, 2) - 0.5) * 1.1, 0.07, 0.25 + hash(em, 7, 3) * 0.3)));
      drawn(embers, true);
      kit.piece(new T.SphereGeometry(0.5, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2).scale(1.3, 0.08, 0.5), M(fp, at(0, 0.05, 0.35)), '--rdr-ink-2', false, false);

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
      // It can be shut, a ribbon left in it, and opened again.
      var bk = M(sofa, at(0, 0.548, 0.12)), bookOpen = [], bookShut = [];
      bookOpen.push(kit.facets(new T.BoxGeometry(0.43, 0.008, 0.3), M(bk, at(0, 0.004, 0)), '--rdr-leather'));
      var lines = [];
      [-1, 1].forEach(function (s) {
        var pm = M(bk, at(s * 0.1, 0.017, 0, 0, 0, s * 0.12));
        bookOpen.push(kit.facets(new T.BoxGeometry(0.2, 0.012, 0.28), pm, '--rdr-ink'));
        for (var ln = 0; ln < 11; ln++) {
          if (s < 0 && ln < 3) continue;
          lines.push([new T.PlaneGeometry(ln === 10 ? 0.09 : 0.15, 0.006), M(pm, at(0, 0.0065, -0.11 + ln * 0.022, 0, -Math.PI / 2))]);
        }
      });
      bookOpen.push(kit.flat(merged(lines), ID, '--rdr-timber'));
      bookOpen.push(kit.flat(new T.PlaneGeometry(0.045, 0.045), M(bk, at(-0.155, 0.027, -0.09, 0, -Math.PI / 2, 0.12)), '--rdr-ember'));
      bookShut.push(kit.facets(new T.BoxGeometry(0.2, 0.007, 0.28), M(bk, at(0.06, 0.004, 0, 0.35)), '--rdr-leather'));
      bookShut.push(kit.facets(new T.BoxGeometry(0.19, 0.03, 0.27), M(bk, at(0.06, 0.022, 0, 0.35)).multiply(at(0.004, 0, 0)), '--rdr-ink'));
      bookShut.push(kit.facets(new T.BoxGeometry(0.2, 0.007, 0.28), M(bk, at(0.06, 0.04, 0, 0.35)), '--rdr-leather'));
      bookShut.push(kit.facets(new T.BoxGeometry(0.012, 0.044, 0.28), M(bk, at(0.06, 0.022, 0, 0.35)).multiply(at(-0.1, 0, 0)), '--rdr-leather'));
      bookShut.push(kit.flat(new T.PlaneGeometry(0.014, 0.09), M(bk, at(0.06, 0.03, 0, 0.35)).multiply(at(0.02, 0, 0.18, 0, -Math.PI / 2)), '--rdr-ember'));
      bookShut.forEach(function (m) { kit.hide(m, true); });

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
      // One drawer can be pulled out and pushed back: its front is drawn on
      // its own, and behind it the dark of the drawer's hole.
      var drawerIn = [], drawerOut = [];
      for (var dr = 0; dr < 3; dr++) {
        for (var dc = 0; dc < 6; dc++) {
          var dx = -0.75 + dc * 0.3, dy = 0.25 + dr * 0.32;
          if (dr === 1 && dc === 2) {
            box(0.24, 0.25, 0.01, M(cg, at(dx, dy, 0.252)), '--rdr-stone', false, false);
            drawerIn.push(kit.facets(new T.BoxGeometry(0.26, 0.27, 0.02), M(cg, at(dx, dy, 0.26)), '--rdr-panel'));
            drawerIn.push(kit.facets(new T.BoxGeometry(0.1, 0.05, 0.02), M(cg, at(dx, dy + 0.06, 0.275)), '--rdr-brass'));
            drawerIn.push(kit.facets(new T.BoxGeometry(0.08, 0.035, 0.01), M(cg, at(dx, dy + 0.06, 0.29)), '--rdr-ink-2'));
            drawerIn.push(kit.facets(new T.BoxGeometry(0.08, 0.02, 0.03), M(cg, at(dx, dy - 0.07, 0.28)), '--rdr-brass'));
            var out = M(cg, at(dx, dy, 0.42));
            drawerOut.push(kit.facets(new T.BoxGeometry(0.24, 0.02, 0.46), M(out, at(0, -0.11, -0.05)), '--rdr-timber'));
            [-1, 1].forEach(function (s) { drawerOut.push(kit.facets(new T.BoxGeometry(0.015, 0.18, 0.46), M(out, at(s * 0.115, -0.02, -0.05)), '--rdr-timber')); });
            drawerOut.push(kit.facets(new T.BoxGeometry(0.26, 0.27, 0.02), M(out, at(0, 0, 0.18)), '--rdr-panel'));
            drawerOut.push(kit.facets(new T.BoxGeometry(0.1, 0.05, 0.02), M(out, at(0, 0.06, 0.195)), '--rdr-brass'));
            drawerOut.push(kit.facets(new T.BoxGeometry(0.08, 0.035, 0.01), M(out, at(0, 0.06, 0.21)), '--rdr-ink-2'));
            drawerOut.push(kit.facets(new T.BoxGeometry(0.08, 0.02, 0.03), M(out, at(0, -0.07, 0.2)), '--rdr-brass'));
            // Its cards standing up in it, a few leaning, and a brass rod through them.
            var cards = [];
            for (var cd = 0; cd < 24; cd++) cards.push([new T.BoxGeometry(0.2, 0.13 + (cd % 5 === 0 ? 0.02 : 0), 0.004), M(out, at(0, -0.04, -0.25 + cd * 0.017, 0, (hash(cd, 3, 9) - 0.5) * 0.25))]);
            drawerOut.push(kit.facets(merged(cards), ID, '--rdr-ink'));
            drawerOut.push(kit.facets(new T.CylinderGeometry(0.005, 0.005, 0.46, 5).rotateX(Math.PI / 2), M(out, at(0, -0.08, -0.05)), '--rdr-brass'));
            drawerOut.forEach(function (m) { kit.hide(m, true); });
            continue;
          }
          box(0.26, 0.27, 0.02, M(cg, at(dx, dy, 0.26)), '--rdr-panel', false);
          box(0.1, 0.05, 0.02, M(cg, at(dx, dy + 0.06, 0.275)), '--rdr-brass', false);
          box(0.08, 0.035, 0.01, M(cg, at(dx, dy + 0.06, 0.29)), '--rdr-ink-2', false, false);
          box(0.08, 0.02, 0.03, M(cg, at(dx, dy - 0.07, 0.28)), '--rdr-brass', false);
        }
      }
      var cat = kit.lift(frame, '.rdr-cat', { w: 780, h: 1009, ww: 1.7, m: at(-W / 2 + 0.08, 1.35, -1.9, LEFT) });
      stops.push({ name: 'at the card catalogue, a drawer for each case and a card for each author', x: -W / 2 + 3.1, z: -1.9, yaw: LEFT, pitch: 0.06, frame: cat.el });

      // JOIN THE FAERIES, her page's own switch: small woodland faeries of
      // ours, hung still in the air between the cases, each with a flower
      // crown, long hair, a mossy cloak, a posy and four wings. Drawn in the
      // yurt's colours, because these are the yurt's own faeries in here too.
      var fae = {}, wings = {};
      [[4.4, 2.5, -4.0, 2.2], [4.5, 1.9, -7.1, 1.6], [-1.9, 2.9, -12.1, 0.2], [1.6, 2.3, -11.8, -0.4], [-2.6, 3.0, -3.3, 0.6], [2.4, 3.5, -5.6, -0.3], [0.6, 3.4, -7.4, 1.0]].forEach(function (p, n) {
        var f = at(p[0], p[1], p[2], p[3], 0, (hash(n, 5, 1) - 0.5) * 0.3).multiply(new T.Matrix4().makeScale(1.8, 1.8, 1.8));
        add(fae, ['--ivy', '--ivy-2', '--moonstone-2'][n % 3], new T.ConeGeometry(0.075, 0.24, 9), M(f, at(0, -0.06, 0)));
        add(fae, '--tallow-2', new T.SphereGeometry(0.042, 10, 8), M(f, at(0, 0.1, 0)));
        add(fae, n % 2 ? '--ember' : '--timber', new T.SphereGeometry(0.046, 8, 6).scale(1, 1.25, 0.8), M(f, at(0, 0.09, -0.018)));
        add(fae, '--candle', new T.TorusGeometry(0.036, 0.008, 4, 12), M(f, at(0, 0.135, 0, 0, Math.PI / 2 - 0.2)));
        [0, 1, 2].forEach(function (k) { add(fae, k === 1 ? '--candle' : '--toadstool', new T.SphereGeometry(0.014, 5, 4), M(f, at(-0.015 + k * 0.015, 0.02 + (k % 2) * 0.01, 0.07))); });
        [-1, 1].forEach(function (s) {
          add(wings, '--tallow', new T.CircleGeometry(1, 14).scale(0.1, 0.05, 1), M(f, at(s * 0.08, 0.07, -0.04, s * 0.5, 0, s * 0.55)));
          add(wings, '--tallow', new T.CircleGeometry(1, 14).scale(0.07, 0.035, 1), M(f, at(s * 0.065, 0.0, -0.04, s * 0.5, 0, -s * 0.35)));
        });
      });
      var faeries = drawn(fae).concat(drawn(wings, true));
      faeries[faeries.length - 1].material.side = T.DoubleSide;
      faeries.forEach(function (m) { kit.hide(m, true); });

      // GROW A GARDEN, her page's other switch: ivy along the foot of every
      // wall and a little way up it, small flowers in it, and red toadstools
      // and brown mushrooms in the ivy, in the yurt's colours as its garden is.
      var gdn = {};
      [[at(0, 0, back + 0.06), W], [at(0, 0, -0.06, Math.PI), W], [at(-W / 2 + 0.06, 0, -D / 2, LEFT), D], [at(W / 2 - 0.06, 0, -D / 2, RIGHT), D]].forEach(function (w, wi) {
        var n = Math.round(w[1] * 22);
        for (var lv = 0; lv < n; lv++) {
          var u = (hash(lv, wi, 1) - 0.5) * (w[1] - 0.3), v = Math.pow(hash(lv, wi, 2), 2.2) * 1.15 + 0.04;
          var p = new T.Vector3(u, 0, 0).applyMatrix4(w[0]);
          if (Math.abs(p.x) < 0.9 && p.z > -0.5) continue;
          if (p.x < -W / 2 + 0.5 && p.z < -5.2 && p.z > -7.8) continue;
          add(gdn, lv % 3 ? '--ivy' : '--ivy-2', new T.SphereGeometry(0.085, 6, 4).scale(1, 0.6, 0.35), M(w[0], at(u, v, 0.02, 0, 0, hash(lv, wi, 3) * 3)));
          if (lv % 9 === 0) add(gdn, lv % 2 ? '--moonstone-2' : '--candle', new T.SphereGeometry(0.022, 6, 4), M(w[0], at(u + 0.04, v + 0.03, 0.05)));
        }
        for (var ts = 0; ts < Math.round(w[1] * 1.2); ts++) {
          var tu = (hash(ts, wi, 5) - 0.5) * (w[1] - 0.6), q = new T.Vector3(tu, 0, 0).applyMatrix4(w[0]);
          if (Math.abs(q.x) < 0.9 && q.z > -0.5) continue;
          if (q.x < -W / 2 + 0.5 && q.z < -4.9 && q.z > -8.1) continue;
          var red = ts % 3 !== 2, sz = 0.7 + hash(ts, wi, 6) * 0.6, tm = M(w[0], at(tu, 0, 0.16 + hash(ts, wi, 7) * 0.12));
          add(gdn, '--tallow', new T.CylinderGeometry(0.018 * sz, 0.024 * sz, 0.09 * sz, 7), M(tm, at(0, 0.045 * sz, 0)));
          add(gdn, red ? '--toadstool' : '--rdr-leather', new T.SphereGeometry(0.06 * sz, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, red ? 0.75 : 0.55, 1), M(tm, at(0, 0.085 * sz, 0)));
          if (red) for (var sp = 0; sp < 4; sp++) add(gdn, '--tallow', new T.SphereGeometry(0.009 * sz, 4, 3), M(tm, at(Math.cos(sp * 1.7) * 0.034 * sz, 0.12 * sz, Math.sin(sp * 1.7) * 0.034 * sz)));
        }
      });
      var garden = drawn(gdn);
      garden.forEach(function (m) { kit.hide(m, true); });

      // THE SWITCHES. The record, which goes round at MAX as hers does, or
      // when asked; the faeries and the garden, her page's own two; the book
      // on the sofa; and the catalogue's drawer.
      var turning = kit.turn(record, recordAt, { say: 'Turn the record', max: true, period: 6,
        said: function (on) { return on ? 'The record on the gramophone goes round, once in six seconds.' : 'The record stops where it is.'; } });
      var joinFaeries = kit.press({ say: function () { return kit.hidden(faeries[0]) ? 'Join the Faeries' : 'Let the faeries go'; },
        press: function () {
          var come = kit.hidden(faeries[0]);
          faeries.forEach(function (m) { kit.hide(m, !come); });
          return come ? 'Faeries are among the bookcases now, each one hung still in the air.' : 'The faeries have gone, and the cases are as they were.';
        } });
      var growGarden = kit.press({ say: function () { return kit.hidden(garden[0]) ? 'Grow a garden' : 'Clear the garden'; },
        press: function () {
          var grow = kit.hidden(garden[0]);
          garden.forEach(function (m) { kit.hide(m, !grow); });
          return grow ? 'Ivy has grown along the foot of the walls, with toadstools and mushrooms in it, and stays as it is.' : 'The garden is cleared, back to the bare boards.';
        } });
      var theBook = kit.press({ say: function () { return kit.hidden(bookShut[0]) ? 'Shut the book on the sofa' : 'Open the book on the sofa'; },
        at: [kit.touch(0.5, 0.2, 0.45, M(sofa, at(0, 0.6, 0.12)))],
        press: function () {
          var shut = kit.hidden(bookShut[0]);
          bookShut.forEach(function (m) { kit.hide(m, !shut); });
          bookOpen.forEach(function (m) { kit.hide(m, shut); });
          return shut ? 'The book on the sofa is shut, a ribbon in it to keep the place. Nobody will ask how far you got.' : 'The book lies open on the sofa again, where it was left.';
        } });
      var theDrawer = kit.press({ say: function () { return kit.hidden(drawerOut[0]) ? 'Pull out a drawer of the catalogue' : 'Push the drawer back in'; },
        at: [kit.touch(0.32, 0.32, 0.6, M(cg, at(-0.15, 0.57, 0.4)))],
        press: function () {
          var pull = kit.hidden(drawerOut[0]);
          drawerOut.forEach(function (m) { kit.hide(m, !pull); });
          drawerIn.forEach(function (m) { kit.hide(m, pull); });
          return pull ? 'A drawer of the card catalogue is pulled out, its cards standing up in it.' : 'The drawer is pushed back into the catalogue.';
        } });
      stops[0].acts = [joinFaeries, growGarden];
      stops.forEach(function (st) {
        if (/gramophone/.test(st.name)) st.acts = [turning];
        if (/card catalogue/.test(st.name)) st.acts = [theDrawer];
      });
      stops.push({ name: 'at the sofa, with the book left on it', x: 0.7, z: -6.5, yaw: LEFT, pitch: -0.32, acts: [theBook] });
      stops.push({ name: 'over the gramophone itself, her record on it', x: -W / 2 + 2.0, z: -10.15, yaw: 1.4, pitch: -0.5, acts: [turning] });

      return {
        start: { x: 0, z: -1.4, yaw: 0 },
        bounds: { x: [-W / 2 + 1.0, W / 2 - 1.0], z: [back + 1.2, -0.8] },
        stops: stops
      };
    }
  };
})();

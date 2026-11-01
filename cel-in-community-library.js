/* =============================================================================
   The Community Library, walked into on Cel Street. Ryan's ask, 2026-10-31:
   back on the street, working down it a room at a time.

   IT IS THE LIBRARY'S WORLD AND NOBODY ELSE'S (§55): a public reading room at
   eleven in the morning. Oak shelving runs round the walls to head height, and
   above it the windows are set high, arched in stone, with the sky in every
   one of them; the daylight comes in from up there and washes every wall, so
   nothing in the room is in the dark. THERE IS NO FLAME ANYWHERE and the desk
   lamp is not even drawn: a candle in here would make it the Mopery at
   lunchtime, and it is this room that would move. THE ONLY RIOT IS THE SPINES,
   which carry no word, in the colours the room declares; everything else is
   plaster, stone and oak.

   WHAT IS ON THE WALLS AND TABLES IS THE PAGE'S OWN, lifted off it by the kit:
   the carved lintel and the room's name over the door, the praise of the
   public library on a noticeboard, each quotation propped on a reading table
   of its own with its credit and the line saying it was read on our page, the
   library economy on a board, and the collections laid out on the front desk.
   At the back, past the 800s, two cases stand a little apart and the aisle
   between them is longer on the inside than from out here: that place leads
   on to L-Space, which has its own page. The Librarian is not drawn anywhere,
   in here or anywhere else.

   NOTHING MOVES. Every colour is one the room declares, by name. It keeps
   nothing, sends nothing and fetches nothing; its page arrives through Cel
   Street's screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  // The spines' colours: the room's own, and nothing else.
  var SPINES = ['--cl-stamp', '--cl-sky', '--cl-ink', '--cl-card', '--cl-stone', '--cl-ink-2', '--cl-stamp', '--cl-sky'];
  function hash(i, j, k) {
    var n = Math.imul(i + 41, 374761393) ^ Math.imul(j + 13, 668265263) ^ Math.imul(k + 7, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['community-library.html'] = {
    name: 'The Community Library',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var W = 14, D = 16, H = 6.4, back = -D;
      var L = -W / 2, R = W / 2;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var SH = 2.5;                       // the shelving's height
      var WY0 = 3.1, WY1 = 5.7;           // the high windows, sill to the top of the arch

      // ELEVEN IN THE MORNING: the sky's light from everywhere above, and the
      // day coming down through the high windows on the left, soft.
      kit.scene.background = kit.col('--cl-sky');
      kit.scene.add(new T.HemisphereLight(kit.col('--cl-card'), kit.col('--cl-stone'), 2.2));
      var day = new T.DirectionalLight(kit.col('--cl-card'), 1.1);
      day.position.set(L - 8, 14, -4); day.target.position.set(0, 0, -8);
      day.castShadow = true;
      day.shadow.mapSize.set(2048, 2048);
      var sc = day.shadow.camera;
      sc.left = -12; sc.right = 12; sc.top = 12; sc.bottom = -12; sc.near = 1; sc.far = 40;
      day.shadow.bias = -0.0008;
      kit.scene.add(day, day.target);

      // THE ROOM: a stone floor, plaster walls washed with the daylight, a
      // plaster ceiling with stone ribs across it.
      box(W + 0.4, 0.1, D + 0.4, at(0, -0.05, back / 2), '--cl-stone', false, false);
      for (var f = 1; f * 1.6 < D; f++) box(W, 0.006, 0.025, at(0, 0.003, -f * 1.6), '--cl-wall', false, false);
      box(W + 0.4, 0.2, D + 0.4, at(0, H + 0.1, back / 2), '--cl-wall', false, false);
      for (var rb = 1; rb < 5; rb++) box(W, 0.18, 0.24, at(0, H - 0.09, -rb * D / 5), '--cl-stone', 0.015);

      // A wall with a row of arched windows cut high in it.
      function windowWall(m, len, n, seed) {
        var sh = new T.Shape();
        sh.moveTo(-len / 2, 0); sh.lineTo(len / 2, 0); sh.lineTo(len / 2, H); sh.lineTo(-len / 2, H); sh.closePath();
        var ww = 1.5, r = ww / 2, span = len / n;
        for (var i = 0; i < n; i++) {
          var cx = -len / 2 + span * (i + 0.5), top = WY1 - r;
          var hole = new T.Path();
          hole.moveTo(cx - r, WY0); hole.lineTo(cx + r, WY0); hole.lineTo(cx + r, top);
          hole.absarc(cx, top, r, 0, Math.PI, false);
          hole.lineTo(cx - r, WY0);
          sh.holes.push(hole);
          // The stone reveal round the arch, its sill, and the glazing bars.
          kit.piece(new T.TorusGeometry(r, 0.07, 6, 20, Math.PI), M(m, at(cx, top, 0.06)), '--cl-stone', 0.012);
          [-1, 1].forEach(function (s) { box(0.14, top - WY0, 0.14, M(m, at(cx + s * r, (WY0 + top) / 2, 0.06)), '--cl-stone', 0.012); });
          box(ww + 0.3, 0.12, 0.3, M(m, at(cx, WY0 - 0.06, 0.12)), '--cl-stone', 0.012);
          box(0.05, WY1 - WY0, 0.05, M(m, at(cx, (WY0 + WY1) / 2, -0.1)), '--cl-stone', false);
          [0.33, 0.66].forEach(function (k) { box(ww, 0.05, 0.05, M(m, at(cx, WY0 + (top - WY0) * k, -0.1)), '--cl-stone', false); });
          // The sky in it, and a cloud in some of them.
          kit.flat(new T.PlaneGeometry(ww + 0.4, WY1 - WY0 + 0.4), M(m, at(cx, (WY0 + WY1) / 2, -0.5)), '--cl-sky');
          if (hash(i, seed, 1) < 0.6) {
            var cy = WY0 + 0.6 + hash(i, seed, 2) * 1.2;
            [[-0.2, 0, 0.22], [0.05, 0.06, 0.28], [0.3, 0, 0.2]].forEach(function (c) {
              kit.flat(new T.CircleGeometry(c[2], 14), M(m, at(cx + c[0] + (hash(i, seed, 3) - 0.5) * 0.5, cy + c[1], -0.45)), '--cl-card');
            });
          }
        }
        var g = new T.ExtrudeGeometry(sh, { depth: 0.3, bevelEnabled: false });
        g.translate(0, 0, -0.3);
        kit.piece(g, m, '--cl-wall', 0.02);
      }
      windowWall(at(L, 0, back / 2, LEFT), D, 5, 1);
      windowWall(at(R, 0, back / 2, RIGHT), D, 5, 2);
      windowWall(at(0, 0, back, 0), W, 4, 3);
      // The front wall, with the door you came in by, and no window in it.
      [-1, 1].forEach(function (s) { box((W - 1.8) / 2, H, 0.3, at(s * (W + 1.8) / 4, H / 2, 0.15), '--cl-wall', 0.015); });
      box(1.8, H - 2.6, 0.3, at(0, 2.6 + (H - 2.6) / 2, 0.15), '--cl-wall', 0.015);
      box(2.2, 0.3, 0.2, at(0, 2.75, 0.0), '--cl-stone', 0.012);
      [-1, 1].forEach(function (s) { box(0.86, 2.5, 0.06, at(s * 0.44, 1.25, 0.02), '--cl-oak', 0.012); });

      // SHELVING to head height round the walls: oak, shelf after shelf, and
      // the spines in it, each its own colour and height, carrying no word.
      function shelving(m, len, seed, gap) {
        box(len, SH, 0.42, M(m, at(0, SH / 2, 0.21)), '--cl-oak', 0.015);
        box(len + 0.1, 0.08, 0.5, M(m, at(0, SH + 0.04, 0.24)), '--cl-oak', 0.012);
        var rows = 5, rh = (SH - 0.2) / rows;
        for (var r = 0; r < rows; r++) {
          var y = 0.12 + r * rh;
          box(len, 0.035, 0.4, M(m, at(0, y, 0.24)), '--cl-oak', false);
          var x = -len / 2 + 0.06, k = 0;
          while (x < len / 2 - 0.08) {
            var bw = 0.035 + hash(k, r, seed) * 0.05, bh = rh * (0.62 + hash(k, r, seed + 1) * 0.3);
            if (gap && Math.abs(x - gap[0]) < gap[1]) { x += 0.04; k++; continue; }
            if (hash(k, r, seed + 2) > 0.94) { x += 0.12; k++; continue; }    // a book out on loan
            box(bw, bh, 0.28, M(m, at(x + bw / 2, y + 0.018 + bh / 2, 0.3)), SPINES[Math.floor(hash(k, r, seed + 3) * SPINES.length)], false, false);
            x += bw + 0.006; k++;
          }
          // Uprights every couple of metres.
        }
        for (var u = -len / 2; u <= len / 2 + 0.01; u += len / Math.max(1, Math.round(len / 2))) {
          box(0.05, SH, 0.42, M(m, at(u, SH / 2, 0.24)), '--cl-oak', false);
        }
      }
      shelving(at(L, 0, -9.0, LEFT), 12.4, 11);
      shelving(at(R, 0, -9.0, RIGHT), 12.4, 22);
      // The back wall's cases, with the gap between two of them past the 800s.
      var GX = -2.6;
      shelving(at((L + GX - 0.45) / 2, 0, back, 0), (GX - 0.45) - L, 33);
      shelving(at((GX + 0.45 + R) / 2, 0, back, 0), R - (GX + 0.45), 44);
      // THE GAP in the stacks: the two cases a little apart, and between them an
      // aisle that goes on further than it should, a ball of string tied to the
      // shelf beside it.
      box(0.9, SH, 0.04, at(GX, SH / 2, back + 0.02), '--cl-ink', false, false);
      [-1, 1].forEach(function (s) { box(0.06, SH, 1.2, at(GX + s * 0.45, SH / 2, back - 0.4), '--cl-oak', 0.012); });
      kit.piece(new T.SphereGeometry(0.07, 10, 8), at(GX - 0.36, 1.1, back + 0.3), '--cl-card', 0.008);
      kit.piece(new T.CylinderGeometry(0.004, 0.004, 1.0, 4), at(GX - 0.1, 1.05, back + 0.05, 0, Math.PI / 2 - 0.2, 0.3), '--cl-card', false);

      // READING TABLES down the middle, oak, with chairs pulled in, each with a
      // quotation off the page propped on it, read on our page.
      var TABLES = [[-2.2, -4.2], [2.2, -4.2], [-2.2, -7.6], [2.2, -7.6], [0, -11.0]];
      TABLES.forEach(function (t, i) {
        var tm = at(t[0], 0, t[1]);
        box(2.4, 0.06, 1.0, M(tm, at(0, 0.76, 0)), '--cl-oak', 0.015);
        [[-1.1, -0.42], [1.1, -0.42], [-1.1, 0.42], [1.1, 0.42]].forEach(function (l) { box(0.07, 0.74, 0.07, M(tm, at(l[0], 0.37, l[1])), '--cl-oak', 0.01); });
        [-0.6, 0.6].forEach(function (cx) {
          [-1, 1].forEach(function (s) {
            var cm = M(tm, at(cx, 0, s * 0.78, s > 0 ? 0 : Math.PI));
            box(0.46, 0.05, 0.44, M(cm, at(0, 0.46, 0)), '--cl-oak', 0.01);
            box(0.46, 0.5, 0.05, M(cm, at(0, 0.72, 0.2)), '--cl-oak', 0.01);
            [[-0.2, -0.18], [0.2, -0.18], [-0.2, 0.18], [0.2, 0.18]].forEach(function (l) { box(0.04, 0.46, 0.04, M(cm, at(l[0], 0.23, l[1])), '--cl-oak', false); });
          });
        });
        // A book or two lying on it, closed.
        box(0.32, 0.05, 0.24, M(tm, at(-0.8, 0.815, 0.2, 0.3)), SPINES[i % SPINES.length], 0.008);
        box(0.28, 0.04, 0.2, M(tm, at(0.85, 0.81, -0.15, -0.2)), SPINES[(i + 3) % SPINES.length], 0.008);
        // The quotation, propped up on a small oak stand facing you.
        box(1.3, 0.04, 0.12, M(tm, at(0, 0.81, 0.32)), '--cl-oak', 0.008);
      });

      // THE ROOM'S OWN PAGE, on the back wall to the right of the gap.
      var pw = 2.6, ph = pw * 800 / 1180, py = SH + 0.15 + ph / 2;
      box(pw + 0.16, ph + 0.16, 0.06, at(4.0, py, back + 0.5), '--cl-oak', 0.012);
      var frame = kit.screen(1180, 800, pw, at(4.0, py, back + 0.54), 'The Community Library’s own page, on the back wall above the shelves');
      // Each table's quotation, now the page is up to lift it from.
      var tables = TABLES.map(function (t, i) {
        return kit.lift(frame, '.cl-quote', { n: i, w: 620, h: 560, ww: 1.25, m: M(at(t[0], 0, t[1]), at(0, 0.83, 0.3, 0, -0.18)) });
      });

      // OVER THE DOOR, inside: the carved lintel and the room's name.
      var head = kit.lift(frame, '.cl-head', { w: 900, ww: 3.2, m: at(0, 3.05, -0.05, Math.PI) });

      // THE NOTICEBOARD of the praise of the public library, on the front wall
      // to the left of the door; its quotations are on the tables.
      var nb = at(-4.2, 0, -0.08, Math.PI);
      box(1.9, 2.3, 0.08, M(nb, at(0, 1.5, 0)), '--cl-oak', 0.015);
      [-1, 1].forEach(function (s) { box(0.08, 1.4, 0.08, M(nb, at(s * 0.85, 0.7, 0)), '--cl-oak', 0.01); });
      var praise = kit.lift(frame, '.cl-part', { n: 0, w: 700, h: 760, ww: 1.7, drop: '.cl-quote', m: M(nb, at(0, 0.45, 0.06)) });

      // THE LIBRARY ECONOMY on a board on the front wall to the right of it.
      var eb = at(4.2, 0, -0.08, Math.PI);
      box(1.9, 2.3, 0.08, M(eb, at(0, 1.5, 0)), '--cl-oak', 0.015);
      [-1, 1].forEach(function (s) { box(0.08, 1.4, 0.08, M(eb, at(s * 0.85, 0.7, 0)), '--cl-oak', 0.01); });
      var economy = kit.lift(frame, '.cl-part', { n: 1, w: 700, h: 760, ww: 1.7, m: M(eb, at(0, 0.45, 0.06)) });

      // THE FRONT DESK across the far end, oak, the collections laid out on it
      // as cards, and where to start on a slip beside them. Nobody behind it,
      // and no lamp on it.
      var dk = at(0, 0, -13.4);
      box(4.4, 1.0, 0.8, M(dk, at(0, 0.5, 0)), '--cl-oak', 0.015);
      box(4.6, 0.06, 1.0, M(dk, at(0, 1.03, 0)), '--cl-oak', 0.012);
      var desk = kit.lift(frame, '.cl-desk', { w: 1100, h: 700, ww: 2.6, m: M(dk, at(-0.6, 1.07, 0.15, 0, -0.55)) });
      var startSlip = kit.lift(frame, '.cl-start', { w: 600, ww: 1.0, m: M(dk, at(1.5, 1.07, 0.2, 0, -0.55)) });
      // A pile of returns at the end of it, waiting to go back on the shelves.
      for (var p = 0; p < 4; p++) box(0.3 - p * 0.02, 0.06, 0.22, M(dk, at(-1.9, 1.09 + p * 0.06, 0.1, p * 0.2)), SPINES[(p * 3) % SPINES.length], 0.006);

      // PAST THE 800s: what the room says about the gap, beside it.
      var lec = at(GX - 1.7, 0, back + 1.3, 0.3);
      box(0.5, 1.0, 0.4, M(lec, at(0, 0.5, 0)), '--cl-oak', 0.012);
      box(0.7, 0.05, 0.5, M(lec, at(0, 1.02, 0.02, 0, -0.3)), '--cl-oak', 0.01);
      var gapWords = kit.lift(frame, '.cl-back', { w: 620, ww: 1.0, m: M(lec, at(0, 1.08, 0.08, 0, -0.3)) });

      return {
        start: { x: 0, z: -0.9, yaw: 0 },
        bounds: { x: [L + 0.9, R - 0.9], z: [back + 1.0, -0.6] },
        stops: [
          { name: 'just inside the doors, the sky in every window up high', x: 0, z: -0.9, yaw: 0, pitch: 0.3 },
          { name: 'looking back at the lintel over the door: free to all', x: 0, z: -4.4, yaw: Math.PI, pitch: 0.2, frame: head.el },
          { name: 'at the noticeboard by the door, in praise of the public library', x: -4.2, z: -2.5, yaw: Math.PI, pitch: 0.08, frame: praise.el },
          { name: 'at the board by the door on the library economy', x: 4.2, z: -2.5, yaw: Math.PI, pitch: 0.08, frame: economy.el },
          { name: 'at the first reading table, with Kurt Vonnegut’s words on it', x: -2.2, z: -2.6, yaw: 0, pitch: -0.12, frame: tables[0].el },
          { name: 'at the second reading table, with Cory Doctorow’s words on it', x: 2.2, z: -2.6, yaw: 0, pitch: -0.12, frame: tables[1].el },
          { name: 'at the third reading table, with Ranganathan’s five laws on it', x: -2.2, z: -6.0, yaw: 0, pitch: -0.12, frame: tables[2].el },
          { name: 'at the fourth reading table, with a librarian’s joy on it', x: 2.2, z: -6.0, yaw: 0, pitch: -0.12, frame: tables[3].el },
          { name: 'at the last reading table, with Octavia Butler’s words on it', x: 0, z: -9.4, yaw: 0, pitch: -0.12, frame: tables[4].el },
          { name: 'at the shelves along the left-hand wall, under the windows', x: L + 1.6, z: -8.0, yaw: LEFT, pitch: 0.1 },
          { name: 'at the shelves along the right-hand wall, under the windows', x: R - 1.6, z: -8.0, yaw: RIGHT, pitch: 0.1 },
          { name: 'at the front desk, with the collections laid out on it as cards', x: -0.6, z: -11.4, yaw: 0, pitch: -0.12, frame: desk.el },
          { name: 'at the end of the desk, where to start', x: 1.5, z: -11.9, yaw: 0, pitch: -0.2, frame: startSlip.el },
          { name: 'at the back wall, with the library’s own page above the shelves', x: 4.0, z: back + 5.6, yaw: 0, pitch: 0.24, page: kit.page, frame: frame },
          { name: 'past the 800s, at what is said about the gap in the stacks', x: GX - 1.31, z: back + 2.6, yaw: 0.3, pitch: -0.35, frame: gapWords.el },
          { name: 'L-Space, through the gap in the stacks', where: 'at the gap in the stacks, a ball of string tied to the shelf beside it', page: 'l-space.html', x: GX, z: back + 2.4, yaw: 0, pitch: 0.02 }
        ]
      };
    }
  };
})();

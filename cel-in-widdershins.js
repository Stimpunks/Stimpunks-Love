/* =============================================================================
   Widdershins, walked into on Cel Street. Ryan's ask, 2026-11-02: the room's
   own world on Cel Street, like every other door in the row.

   A CROOKED CITY WITH THE MORNING HALFWAY ACROSS IT (§135). You come out on a
   cobbled quay on the night side of a river too thick to drown in, and across
   it the city stands on its far bank: crooked houses built on top of each
   other, a thin tower far off, a clacks tower with its shutters, and a brass
   bridge over the water. The morning is slow on the Disc, so it is caught
   halfway: everything past the morning's edge, to the right, is lit, plaster
   pale and tiles red, and everything this side of it is still night. The sky
   behind is split the same way, with the edge between, and a compass hangs in
   the night half with its widdershins arm pointing into the morning.

   EVERY WORD IS ON THE NIGHT SIDE. The page's words are lifted onto boards
   along the back of the quay, with your back to the river, and you walk them
   right to left: widdershins. None of them stands in the morning.

   OOOK IS THE ONE TO WATCH, through L-space: the Disc seen from out in the
   dark. This is on the ground, in a city, and the Disc is never drawn, nor a
   turtle nor an elephant. NOBODY IS IN THE CITY, the windows are dark because
   nobody has lit a lamp, and there is no cover, map, crest or character of
   anybody's: the houses are crooked roofs anybody might draw. NOTHING MOVES:
   the morning stays halfway. Every colour is one §135 declares, by name. It
   keeps nothing, sends nothing and fetches nothing; the page arrives through
   Cel Street's screen(), and tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['widdershins.html'] = {
    name: 'Widdershins',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var FAR = -17;          // the far bank, where the city stands
      var EDGE = 3.5;         // the morning's edge, where it crosses the far bank
      var SLANT = 0.32;       // and how far it leans across the city with height

      function lit(x, y) { return x > EDGE - SLANT * y; }

      // THE NIGHT, AND NO LAMP. One cool fill from the night sky and nothing
      // else: a light that reached across the edge would warm the night side
      // of the city, so the morning is carried by the lit houses' own colours.
      kit.scene.background = kit.col('--wds-night');
      kit.scene.add(new T.HemisphereLight(kit.col('--wds-ink'), kit.col('--wds-sky-night'), 2.2));

      // THE SKY behind the city, split at the morning's edge: night on the
      // left, the morning sky on the right, and the edge itself between.
      var SKYZ = -46, SKYW = 220, SKYH = 120, LEAN = SLANT;
      function quad(pts, z, ink) {
        var s = new T.Shape();
        s.moveTo(pts[0][0], pts[0][1]);
        for (var i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
        kit.flat(new T.ShapeGeometry(s), at(0, 0, z), ink);
      }
      // Where the edge on the far bank falls on the sky, seen from the quay.
      var ex = 2.6;
      quad([[-SKYW / 2, 0], [ex, 0], [ex - LEAN * SKYH, SKYH], [-SKYW / 2, SKYH]], SKYZ, '--wds-sky-night');
      quad([[ex, 0], [SKYW / 2, 0], [SKYW / 2, SKYH], [ex - LEAN * SKYH, SKYH]], SKYZ, '--wds-sky-day');
      quad([[ex - 0.5, 0], [ex + 0.5, 0], [ex + 0.5 - LEAN * SKYH, SKYH], [ex - 0.5 - LEAN * SKYH, SKYH]], SKYZ + 0.05, '--wds-edge');

      // THE COMPASS in the night sky, on a sheet of paper drawn in the room's
      // own inks: the Disc's four directions, widdershins pointing right.
      var compass = kit.paper(720, 360, function (g, w, h) {
        var ox = w / 2 - 40, oy = h / 2, r = 92;
        g.clearRect(0, 0, w, h);
        g.strokeStyle = kit.ink('--wds-ink-3'); g.lineWidth = 4;
        g.beginPath(); g.arc(ox, oy, r - 24, 0, 2 * Math.PI); g.stroke();
        g.beginPath(); g.moveTo(ox, oy - r + 8); g.lineTo(ox, oy + r - 8); g.moveTo(ox - r + 8, oy); g.lineTo(ox, oy); g.stroke();
        g.strokeStyle = kit.ink('--wds-dawn'); g.lineWidth = 7;
        g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox + r + 10, oy); g.stroke();
        g.fillStyle = kit.ink('--wds-dawn');
        g.beginPath(); g.moveTo(ox + r + 2, oy - 13); g.lineTo(ox + r + 26, oy); g.lineTo(ox + r + 2, oy + 13); g.closePath(); g.fill();
        g.font = '700 26px Grenze, Georgia, serif'; g.textAlign = 'center';
        g.fillStyle = kit.ink('--wds-ink-2');
        g.fillText('HUBWARD', ox, oy - r - 10); g.fillText('RIMWARD', ox, oy + r + 30);
        g.textAlign = 'right'; g.fillText('TURNWISE', ox - r - 8, oy + 9);
        g.textAlign = 'left'; g.fillStyle = kit.ink('--wds-dawn'); g.fillText('WIDDERSHINS', ox + r + 32, oy + 9);
      });
      // Unlit and see-through, so it is the sky's own night round it.
      var cm = new T.Mesh(new T.PlaneGeometry(36, 18), new T.MeshBasicMaterial({ map: compass, transparent: true, depthWrite: false }));
      cm.matrixAutoUpdate = false;
      cm.matrix.copy(at(-24, 35, SKYZ + 0.4));
      cm.matrixWorldNeedsUpdate = true;
      kit.scene.add(cm);

      // THE RIVER, thick enough to stand on, with its crust, and the quay's
      // wall on this side of it.
      box(140, 0.2, 15.75, at(0, -0.62, -11.125), '--wds-ankh', false, false);
      // The far bank under the city, lit past the edge and night this side of it.
      box(70, 0.4, 16, at(EDGE - 35, -0.5, FAR - 7), '--wds-roof-night', false, false);
      box(70, 0.4, 16, at(EDGE + 35, -0.5, FAR - 7), '--wds-wall-day', false, false);
      function hash(n) { var v = Math.sin(n * 12.9898) * 43758.5453; return v - Math.floor(v); }
      for (var c = 0; c < 70; c++) {
        var cx = hash(c * 2.3 + 1) * 56 - 28, cz = -4 - hash(c * 5.1 + 2) * 12.4;
        var g = new T.SphereGeometry(0.5 + hash(c * 7.7) * 0.6, 10, 6); g.scale(1.6, 0.12, 1);
        kit.piece(g, at(cx, -0.5, cz, hash(c) * 3), '--wds-ankh-crust', false, false);
      }
      box(140, 0.9, 0.5, at(0, -0.15, -3.25), '--wds-wall-night', 0.02, false);
      box(140, 0.12, 0.62, at(0, 0.32, -3.25), '--wds-line', false, false);

      // THE QUAY you stand on: cobbles, all of them a little different, in the
      // night's own colours.
      box(140, 0.3, 9, at(0, -0.17, 1.4), '--wds-roof-night', false, false);
      for (var q = 0; q < 160; q++) {
        var qx = (q % 20) * 1.1 - 10.5 + (Math.floor(q / 20) % 2) * 0.55, qz = -2.6 + Math.floor(q / 20) * 0.66;
        var cb = new T.SphereGeometry(0.26, 8, 5); cb.scale(1.6, 0.35, 1);
        kit.piece(cb, at(qx, -0.02, qz, hash(q * 3.3)), '--wds-wall-night', false, false);
      }

      // THE CITY on the far bank: two rows of crooked houses, each a box with a
      // roof, leaning a little, taller ones behind. A house is lit if it stands
      // past the morning's edge.
      function house(x, z, w, d, h, lean, roof) {
        var day = lit(x, h * 0.6);
        var wall = day ? '--wds-wall-day' : '--wds-wall-night', top = day ? '--wds-roof-day' : '--wds-roof-night';
        box(w, h, d, at(x, h / 2 - 0.5, z, 0, 0, lean), wall, 0.04);
        if (roof) {
          var s = new T.Shape(); s.moveTo(-w / 2 - 0.1, 0); s.lineTo(w / 2 + 0.1, 0); s.lineTo(0, w * 0.45); s.closePath();
          var rg = new T.ExtrudeGeometry(s, { depth: d + 0.2, bevelEnabled: false }); rg.translate(0, 0, -(d + 0.2) / 2);
          kit.piece(rg, at(x - Math.sin(lean) * h, h - 0.5, z, 0, 0, lean), top, 0.04);
        } else {
          box(w + 0.2, 0.25, d + 0.2, at(x - Math.sin(lean) * h, h - 0.4, z, 0, 0, lean), top, 0.03);
          box(0.35, 0.9, 0.35, at(x - Math.sin(lean) * h + w * 0.25, h, z, 0, 0, lean), top, 0.03);
        }
        // Windows, dark on both sides of the edge, because nobody has lit a lamp.
        for (var wy = 1.1; wy < h - 0.9; wy += 1.3) {
          for (var wx = -w / 2 + 0.55; wx < w / 2 - 0.35; wx += 0.95) {
            if (hash(x * 13 + wy * 7 + wx) < 0.4) continue;
            box(0.38, 0.55, 0.05, at(x + wx - Math.sin(lean) * wy, wy - 0.5, z + d / 2 + 0.03, 0, 0, lean), '--wds-window', false, false);
          }
        }
      }
      [[FAR - 4.5, 3.2, 7.5, 11], [FAR, 2.6, 3.5, 7]].forEach(function (row, ri) {
        var x = -30, n = 0;
        while (x < 30) {
          var w = 1.6 + hash(ri * 100 + n * 1.3) * 1.7;
          var h = row[2] + hash(ri * 50 + n * 2.9) * (row[3] - row[2]);
          house(x + w / 2, row[0], w, row[1], h, (hash(n * 4.4 + ri) - 0.5) * 0.08, hash(n * 6.1 + ri * 3) > 0.3);
          x += w - 0.12; n++;
        }
      });
      // THE THIN TOWER, far off on the night side, taller than everything.
      cyl(0.45, 0.9, 20, at(-9, 9.5, FAR - 11), '--wds-roof-night', 0.05, 8);
      cyl(0.02, 0.6, 3, at(-9, 21, FAR - 11), '--wds-roof-night', 0.04, 8);
      // THE CLACKS TOWER, past the edge: a lattice, and a board of shutters
      // with every other one open.
      var KX = 11, KZ = FAR - 8;
      [-1, 1].forEach(function (s) {
        box(0.22, 14, 0.22, at(KX + s * 0.9, 6.5, KZ, 0, 0, -s * 0.05), '--wds-roof-day', 0.03);
      });
      for (var ky = 1; ky < 13; ky += 2.4) box(1.9, 0.14, 0.16, at(KX, ky, KZ), '--wds-roof-day', 0.02, false);
      box(3, 2.2, 0.3, at(KX, 14.4, KZ), '--wds-roof-day', 0.04);
      for (var si = 0; si < 4; si++) {
        for (var sj = 0; sj < 3; sj++) {
          if ((si + sj) % 2) continue;
          box(0.5, 0.42, 0.05, at(KX - 1.05 + si * 0.7, 13.75 + sj * 0.65, KZ + 0.17), '--wds-wall-day', false, false);
        }
      }

      // THE BRASS BRIDGE, over the water from this bank to the far one, on the
      // night side: two arcs of rail and a deck under them.
      [-0.9, 0.9].forEach(function (s) {
        var arc = new T.TorusGeometry(6.9, 0.09, 6, 40, Math.PI); arc.scale(1, 0.36, 1);
        kit.piece(arc, at(-6 + s, -0.1, -10.1, Math.PI / 2), '--wds-brass', 0.02, false);
      });
      var deck = new T.TorusGeometry(6.9, 0.3, 4, 40, Math.PI); deck.scale(1, 0.36, 3.4);
      kit.piece(deck, at(-6, -0.75, -10.1, Math.PI / 2), '--wds-brass', 0.03, false);

      // THE ROOM'S OWN PAGE, on a board at the right-hand end of the quay
      // where you come in, facing the river with its back to the street.
      var pw = 2.4, ph = pw * 800 / 1180;
      box(pw + 0.14, ph + 0.14, 0.08, at(8.6, 0.75 + ph / 2, 4.1, Math.PI), '--wds-line', 0.01);
      var page = kit.screen(1180, 800, pw, at(8.6, 0.75 + ph / 2, 4.05, Math.PI), 'Widdershins’ own page, on a board at the end of the quay');

      // THE PAGE'S WORDS on boards along the back of the quay, read with your
      // back to the river, walked right to left: widdershins.
      var BACKZ = 4.2, STAND = 2.4;
      function board(sel, n, x, w, ww, h) {
        var it = kit.lift(page, sel, { n: n, w: w, ww: ww, h: h, m: at(x, 0.5, BACKZ, Math.PI) });
        box(ww + 0.12, 0.1, 0.12, at(x, 0.45, BACKZ + 0.05, Math.PI), '--wds-line', 0.01);
        return { x: x, z: BACKZ - STAND, yaw: Math.PI, pitch: 0.06, frame: it.el };
      }
      var stops = [
        { name: 'on the quay, the city across the river and the morning halfway across it', x: 4, z: 0.6, yaw: 0, pitch: 0.12 },
        { name: 'at the river wall, looking at the morning’s edge on the far bank', x: EDGE, z: -2.2, yaw: 0, pitch: 0.18 },
        { name: 'by the bridge, the night side of the city in front of you', x: -6, z: -2.2, yaw: 0, pitch: 0.16 },
        { name: 'looking up at the compass, widdershins pointing into the morning', x: -12, z: -1.6, yaw: 0.28, pitch: 0.5 }
      ];
      function named(s, name) { s.name = name; stops.push(s); return s; }
      named(board('.wds-head', 0, 5.6, 900, 1.7), 'at the board with the room’s name');
      named(board('.wds-view__words', 0, 3.4, 640, 1.3), 'at the board saying what the city is');
      named(board('.wds-lede', 0, 1.2, 640, 1.4, 640), 'at the board with what widdershins means');
      var PARTS = [
        'at the board with a city that never matched',
        'at the board with the Watch, a competency network',
        'at the board with First Sight, and recognising ourselves',
        'at the board with Miss Level, who stores it in other people',
        'at the board with what Star Stuff wrote and drew',
        'at the board with what is not in this city',
        'at the board with next door',
        'at the board with whose this is'
      ];
      PARTS.forEach(function (words, i) {
        named(board('.wds-part', i, -1.2 - i * 2.4, 640, 1.5, 760), words);
      });
      stops.push({ name: 'at the end of the quay where you came in, with the room’s own page', x: 8.6, z: BACKZ - STAND, yaw: Math.PI, pitch: 0.04, page: kit.page, frame: page });

      return {
        start: { x: 4, z: 0.6, yaw: 0 },
        bounds: { x: [-20, 10], z: [-2.4, 2.8] },
        stops: stops
      };
    }
  };
})();

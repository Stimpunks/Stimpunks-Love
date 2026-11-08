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

   ROUND 2 (Ryan's ask, 2026-11-04) drew more of what her page already has in
   it, and nothing it does not: the chandelier of seven candles over the rug,
   the candles in brass sconces along the far wall with a raven at each end of
   the row and a third raven on the sill looking in, the cello leaning in one
   corner and the harp in the other, the rug with its brass ring, a cobweb in
   the corner, the window's tracery as she drew it, the phonograph's horn as a
   flower of petals with a crank and records leaning on it, and her record
   case's pointed arches round the shelves. Three places to stand were added:
   under the chandelier, by the cello and by the harp.

   ROUND 3 (Ryan's ask, 2026-11-04: "more texture and details", flickering
   candles, a spinning record, things to press). A damask on the walls above
   the dado and the grain in the boards, drawn on paper in her colours; wax run
   down every candle and pooled in its pan; leaded panes across the night in
   the window; the rug's medallion and its rings; buttons and studs on the
   chair, a stack of her records beside it and a little table with a candle on
   it; the cello's bow leaning by the cello; her record on the phonograph as
   her page draws it, red label, moon and star; and a tone arm resting on it.

   THE PHONOGRAPH'S DECK AND HER THREE SHELVES OF RECORDS ARE HER PAGE'S OWN,
   lifted off it by the kit, and rack.js, the page's own script, plays them
   here as it does there; nothing reaches YouTube until a press. Each shelf
   holds every record on it, and scrolls when there are more than fit.

   WHAT MOVES IS WHAT MOVES ON HER PAGE, AND WHAT YOU ASK FOR. Her dial says
   "In here MAX turns the record; nothing else moves unless you ask it to",
   so at MAX the record on the phonograph goes round once in six seconds, as
   hers does, and otherwise only after Turn the record. Her page says her
   candles stand still, and here they do too, at every setting, MAX included,
   until somebody presses Let the candles flicker; then each flickers in its
   own time under the flash line the kit holds. Three things to press, each
   saying what it did: Join the Faeries and Grow a garden, her page's own two
   switches, which hang faeries between the candles and grow ivy and
   toadstools round the edges of the room, holding still as hers do until
   pressed; and the candle on the little table by the chair, lit or blown out.
   The garden is drawn in her yurt's ivy, toadstool and tallow, because it is
   her yurt's garden, as on her page; everything else in her room's colours.

   This is ours, hers to keep or send back, and a change to how it looks is
   hers to ask for. Every colour is one of hers, by name. It keeps
   nothing, sends nothing and fetches nothing; her page arrives through Cel
   Street's screen(). tools/make-cel-street.py holds each of those.
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
      var UP = new T.Vector3(0, 1, 0);
      // A rod from one point to another in some frame m: a candle arm, a
      // string, a rib of the horn.
      function rod(m, a, b, r, ink, seg) {
        var d = new T.Vector3().subVectors(b, a), mid = a.clone().add(b).multiplyScalar(0.5);
        var g = new T.CylinderGeometry(r, r, d.length(), seg || 5);
        g.applyQuaternion(new T.Quaternion().setFromUnitVectors(UP, d.normalize()));
        kit.piece(g, M(m, at(mid.x, mid.y, mid.z)), ink, false);
      }
      function v(x, y, z) { return new T.Vector3(x, y, z); }
      function hash(i, j, k) {
        var n = Math.imul(i + 11, 374761393) ^ Math.imul(j + 37, 668265263) ^ Math.imul(k + 41, 2147483647);
        n = Math.imul(n ^ (n >>> 13), 1274126177);
        return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
      }
      // A HEAP: many small things in one colour gathered into one mesh, so a
      // press can show or put away all of them at once (the faeries, the
      // garden) without a mesh for every leaf.
      function heap() {
        var geos = [];
        return {
          add: function (geo, m) { var g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(m); geos.push(g); },
          mesh: function (ink, flat) {
            var n = 0, o = 0;
            geos.forEach(function (g) { n += g.attributes.position.count; });
            var pos = new Float32Array(n * 3), nor = new Float32Array(n * 3);
            geos.forEach(function (g) {
              if (!g.attributes.normal) g.computeVertexNormals();
              pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3);
              o += g.attributes.position.count; g.dispose();
            });
            var out = new T.BufferGeometry();
            out.setAttribute('position', new T.BufferAttribute(pos, 3));
            out.setAttribute('normal', new T.BufferAttribute(nor, 3));
            return flat ? kit.flat(out, new T.Matrix4(), ink) : kit.facets(out, new T.Matrix4(), ink);
          }
        };
      }
      // A candle as her page draws them: cream wax, a brass drip pan, and a
      // flame that is lit and still until somebody asks it to flicker. Wax has
      // run down its side and pooled in the pan, and every flame is kept, with
      // the light it gives if it gives one, so the candles can flicker.
      var flames = [], cn = 0;
      function candle(m, h, r, light) {
        r = r || 0.024; cn++;
        kit.cyl(r * 2, r * 1.6, 0.016, M(m, at(0, 0.008, 0)), '--rdr-brass', false, 10);
        kit.cyl(r, r, h, M(m, at(0, 0.016 + h / 2, 0)), '--rdr-ink', false, 8);
        // The rim softened where it has burned down, and two runs of wax.
        kit.cyl(r * 1.12, r, r * 0.5, M(m, at(0, 0.016 + h - r * 0.25, 0)), '--rdr-ink', false, 8);
        [0, 1].forEach(function (k) {
          var a = (hash(cn, k, 3) + k * 0.5) * Math.PI * 2, run = h * (0.3 + hash(cn, k, 4) * 0.45);
          kit.cyl(r * 0.28, r * 0.38, run, M(m, at(Math.cos(a) * r * 0.96, 0.016 + h - run / 2, Math.sin(a) * r * 0.96)), '--rdr-ink', false, 5);
        });
        var pool = new T.CylinderGeometry(r * 1.5, r * 1.6, 0.006, 9); pool.scale(1, 1, 0.8);
        kit.piece(pool, M(m, at(r * 0.5, 0.018, r * 0.3)), '--rdr-ink', false);
        kit.cyl(0.0025, 0.0025, r * 0.7, M(m, at(0, 0.016 + h + r * 0.35, 0)), '--rdr-stone', false, 3);
        var flame = new T.ConeGeometry(r * 0.85, r * 3, 6); flame.translate(0, r * 1.5, 0);
        var f = kit.flat(flame, M(m, at(0, 0.02 + h, 0)), '--rdr-flame-2');
        flames.push({ mesh: f, light: light || null });
        return f;
      }
      // A raven, perched, looking into the room (+z): her page's ravens, in
      // the darkest colour her room has.
      function raven(m) {
        var body = new T.SphereGeometry(0.11, 10, 8); body.scale(0.85, 0.9, 1.35);
        kit.piece(body, M(m, at(0, 0.1, 0)), '--rdr-stone', 0.008);
        var tail = new T.BoxGeometry(0.1, 0.02, 0.2);
        kit.piece(tail, M(m, at(0, 0.06, -0.2, 0, 0.45)), '--rdr-stone', false);
        kit.piece(new T.SphereGeometry(0.065, 10, 8), M(m, at(0, 0.21, 0.11)), '--rdr-stone', 0.006);
        var beak = new T.ConeGeometry(0.022, 0.09, 6); beak.rotateX(Math.PI / 2);
        kit.piece(beak, M(m, at(0, 0.2, 0.2)), '--rdr-panel', false);
        [-1, 1].forEach(function (s) {
          kit.flat(new T.SphereGeometry(0.009, 5, 4), M(m, at(s * 0.04, 0.225, 0.155)), '--rdr-brass');
          kit.cyl(0.006, 0.006, 0.05, M(m, at(s * 0.03, 0.02, 0.02)), '--rdr-panel', false, 4);
        });
      }

      // CANDLES ONLY, and the night at the window.
      kit.scene.background = kit.col('--rdr-stone');
      kit.scene.add(new T.HemisphereLight(kit.col('--rdr-panel'), kit.col('--rdr-stone'), 1.2));

      // THE ROOM.
      box(W, 0.1, D + 0.4, at(0, -0.05, -D / 2), '--rdr-timber', false, false);
      // Boards running the length of the room, each joint a dark line.
      for (var bx = -W / 2 + 0.32; bx < W / 2; bx += 0.32) box(0.014, 0.004, D, at(bx, 0.002, -D / 2), '--rdr-stone', false, false);
      box(0.3, H, D, at(-W / 2 - 0.15, H / 2, -D / 2), '--rdr-wall');
      box(0.3, H, D, at(W / 2 + 0.15, H / 2, -D / 2), '--rdr-wall');
      box(W + 0.6, H, 0.3, at(0, H / 2, 0.15), '--rdr-wall');
      box(W + 0.6, 0.2, D + 0.6, at(0, H + 0.1, -D / 2), '--rdr-stone', false, false);
      // The grain in the boards, drawn on paper in her timber and stone: long
      // streaks running with each board, a knot here and there, and the ends
      // where one board meets the next.
      var grain = kit.paper(500, 550, function (c, w, h) {
        c.fillStyle = kit.ink('--rdr-timber'); c.fillRect(0, 0, w, h);
        for (var b = 0; b * 16 < w; b++) {
          var x0 = b * 16;
          c.globalAlpha = 0.07 + hash(b, 1, 1) * 0.08; c.fillStyle = kit.ink('--rdr-leather'); c.fillRect(x0, 0, 16, h);
          c.strokeStyle = kit.ink('--rdr-stone'); c.lineWidth = 0.8;
          for (var g = 0; g < 5; g++) {
            c.globalAlpha = 0.18 + hash(b, g, 2) * 0.2;
            c.beginPath();
            var gx = x0 + 2 + hash(b, g, 3) * 12;
            c.moveTo(gx, 0);
            for (var y = 0; y <= h; y += 20) c.lineTo(gx + Math.sin(y / (30 + hash(b, g, 4) * 40) + g) * 1.4, y);
            c.stroke();
          }
          c.globalAlpha = 0.5;
          var ky = hash(b, 5, 5) * h;
          c.beginPath(); c.ellipse(x0 + 8, ky, 2.2, 5, 0, 0, Math.PI * 2); c.fillStyle = kit.ink('--rdr-stone'); c.fill();
          c.globalAlpha = 0.6; c.fillRect(x0, hash(b, 6, 6) * h, 16, 1.2);
        }
        c.globalAlpha = 1;
      });
      kit.sheet(grain, W, D, at(0, 0.001, -D / 2, 0, -Math.PI / 2));
      // A damask on the walls above the dado: a lattice of her panel's claret
      // over the wall's, a small flower of velvet in every lozenge.
      function damask(len) {
        return kit.paper(Math.round(len * 90), 520, function (c, w, h) {
          c.fillStyle = kit.ink('--rdr-wall'); c.fillRect(0, 0, w, h);
          c.strokeStyle = kit.ink('--rdr-panel'); c.lineWidth = 2.2; c.globalAlpha = 0.6;
          for (var x = -h; x < w + h; x += 46) {
            c.beginPath(); c.moveTo(x, 0); c.lineTo(x + h * 0.6, h); c.stroke();
            c.beginPath(); c.moveTo(x, 0); c.lineTo(x - h * 0.6, h); c.stroke();
          }
          for (var cy = 0; cy < h + 40; cy += 38.3) {
            for (var cx = (Math.round(cy / 38.3) % 2) * 23; cx < w + 23; cx += 46) {
              c.globalAlpha = 0.4; c.fillStyle = kit.ink('--rdr-velvet');
              for (var pe = 0; pe < 4; pe++) { c.beginPath(); c.ellipse(cx + Math.cos(pe * Math.PI / 2) * 4.5, cy + Math.sin(pe * Math.PI / 2) * 4.5, 4, 2.2, pe * Math.PI / 2, 0, Math.PI * 2); c.fill(); }
              c.globalAlpha = 0.5; c.fillStyle = kit.ink('--rdr-brass'); c.beginPath(); c.arc(cx, cy, 1.4, 0, Math.PI * 2); c.fill();
            }
          }
          c.globalAlpha = 1;
        });
      }
      var wy0 = 1.1, wh0 = H - 0.28 - wy0;
      var sideDamask = damask(D);
      kit.sheet(sideDamask, D, wh0, at(-W / 2 + 0.006, wy0 + wh0 / 2, -D / 2, LEFT));
      kit.sheet(sideDamask, D, wh0, at(W / 2 - 0.006, wy0 + wh0 / 2, -D / 2, RIGHT));
      kit.sheet(damask(W), W, wh0, at(0, wy0 + wh0 / 2, -0.006, Math.PI));
      // Beams across the ceiling, in the dark the candles never reach.
      for (var bz = -0.9; bz > back; bz -= 1.8) box(W, 0.26, 0.22, at(0, H - 0.13, bz), '--rdr-timber', false, false);
      [[-W / 2 + 0.02, -D / 2, LEFT, D], [W / 2 - 0.02, -D / 2, RIGHT, D], [0, -0.02, Math.PI, W]].forEach(function (w) {
        box(w[3], 0.2, 0.05, at(w[0], 0.1, w[1], w[2]), '--rdr-timber', false);
        // A dado of timber round the walls, panelled below it.
        box(w[3], 0.06, 0.06, at(w[0], 1.05, w[1], w[2]), '--rdr-timber', false);
        for (var p = -w[3] / 2 + 0.55; p < w[3] / 2; p += 1.1) box(0.04, 0.82, 0.03, M(at(w[0], 0.62, w[1], w[2]), at(p, 0, 0)), '--rdr-timber', false, false);
      });
      // The door you came in by, in its frame, with a brass knob.
      box(1.3, 2.4, 0.1, at(0, 1.2, -0.05), '--rdr-timber');
      [-1, 1].forEach(function (s) { box(0.12, 2.6, 0.14, at(s * 0.71, 1.3, -0.06), '--rdr-timber'); });
      box(1.54, 0.14, 0.14, at(0, 2.6, -0.06), '--rdr-timber');
      [[0.75, 0.5], [1.75, 0.6]].forEach(function (pn) { box(0.9, pn[1], 0.02, at(0, pn[0], -0.11), '--rdr-panel', false, false); });
      kit.piece(new T.SphereGeometry(0.04, 8, 6), at(0.45, 1.1, -0.13), '--rdr-brass', false);

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
      // The night, a sheet behind the opening, and her crescent moon in it.
      kit.flat(new T.PlaneGeometry(ww + 1, wh + rise + 1), at(0, wy + (wh + rise) / 2, back - 0.6), '--rdr-panel');
      kit.flat(new T.CircleGeometry(0.34, 24), at(0.55, wy + wh + 0.2, back - 0.55), '--rdr-flame-2');
      kit.flat(new T.CircleGeometry(0.3, 24), at(0.68, wy + wh + 0.27, back - 0.54), '--rdr-panel');
      // Leaded panes across the night, little diamonds of glass between the
      // stone, so you look at the moon through a window and not a hole.
      var LX = ww / 2 - 0.07, LY0 = wy + 0.02, LY1 = wy + wh - 0.02, LS = 0.42;
      for (var lc = -LX - (LY1 - LY0); lc < LX + (LY1 - LY0); lc += LS) {
        [1, -1].forEach(function (dir) {
          // The line x = lc + dir * (y - LY0), clipped to the panes.
          var ya = LY0, yb = LY1;
          var yAt = function (x) { return LY0 + (x - lc) * dir; };
          var y0 = Math.max(ya, Math.min(yAt(-LX), yAt(LX))), y1 = Math.min(yb, Math.max(yAt(-LX), yAt(LX)));
          if (y1 - y0 < 0.05) return;
          var x0 = lc + dir * (y0 - LY0), x1 = lc + dir * (y1 - LY0);
          rod(at(0, 0, 0), v(x0, y0, back - 0.32), v(x1, y1, back - 0.32), 0.006, '--rdr-stone', 3);
        });
      }
      // Bare branches across it, from one side, with twigs off them.
      [[-1.6, 1.4, 0.5, 2.2, 0.05], [-0.7, 2.6, 0.9, 1.4, 0.035], [-1.2, 3.6, 0.3, 1.8, 0.04], [0.1, 3.0, 1.2, 0.9, 0.025], [-0.2, 4.4, 0.7, 1.2, 0.03],
       [-0.55, 1.9, 1.5, 0.5, 0.02], [0.3, 2.35, -0.4, 0.6, 0.018], [-0.9, 3.95, 1.3, 0.55, 0.018], [0.45, 4.0, 0.2, 0.5, 0.016]].forEach(function (b) {
        box(b[3], b[4], 0.02, at(b[0], wy + b[1], back - 0.5, 0, 0, b[2]), '--rdr-stone', false);
      });
      // Stone tracery as she drew it: the frame and the mullion, two
      // transoms, and an inner pointed arch under the head.
      [-1, 1].forEach(function (s) { box(0.16, wh, 0.36, at(s * ww / 2, wy + wh / 2, back - 0.1), '--rdr-stone'); });
      box(0.1, wh, 0.2, at(0, wy + wh / 2, back - 0.2), '--rdr-stone', false);
      [2.0, 3.2].forEach(function (ty) { box(ww, 0.08, 0.2, at(0, wy + ty, back - 0.2), '--rdr-stone', false); });
      box(ww + 0.3, 0.16, 0.5, at(0, wy - 0.08, back + 0.05), '--rdr-stone');
      var arm = Math.hypot(ww / 2, rise);
      [-1, 1].forEach(function (s) {
        box(arm + 0.1, 0.16, 0.36, at(s * ww / 4, wy + wh + rise / 2, back - 0.1, 0, 0, -s * Math.atan2(rise, ww / 2)), '--rdr-stone');
        var inner = Math.hypot(0.5, 0.75);
        box(inner, 0.07, 0.2, at(s * 0.25, wy + wh + 0.4, back - 0.2, 0, 0, -s * Math.atan2(0.75, 0.5)), '--rdr-stone', false);
        box(0.07, 0.75, 0.2, at(s * 0.5, wy + wh - 0.35, back - 0.2), '--rdr-stone', false);
      });
      // A raven on the sill, looking in at the room.
      raven(at(-0.62, wy + 0.01, back + 0.1));
      // A cobweb in the top corner, the one thing up there the candles touch.
      var cw = at(-W / 2 + 0.03, H - 0.25, back + 0.03);
      [0.2, 0.55, 0.9, 1.25].forEach(function (a) { rod(cw, v(0, 0, 0), v(Math.sin(a) * 0.9, -Math.cos(a) * 0.9, 0), 0.004, '--rdr-ink-2', 3); });
      [0.3, 0.55, 0.8].forEach(function (r0) {
        for (var k = 0; k < 3; k++) {
          var a0 = 0.2 + k * 0.35, a1 = a0 + 0.35;
          rod(cw, v(Math.sin(a0) * r0, -Math.cos(a0) * r0, 0), v(Math.sin(a1) * r0, -Math.cos(a1) * r0, 0), 0.003, '--rdr-ink-2', 3);
        }
      });

      // THE SCONCES along the far wall, two either side of the window, a candle
      // in each, and a raven on a bracket at each end of the row.
      [-3.3, -2.05, 2.05, 3.3].forEach(function (x) {
        var sc = at(x, 3.4, back + 0.01);
        box(0.09, 0.26, 0.02, M(sc, at(0, 0.02, 0.01)), '--rdr-brass', false);
        kit.piece(new T.SphereGeometry(0.03, 6, 4), M(sc, at(0, 0.17, 0.02)), '--rdr-brass', false);
        rod(sc, v(0, -0.12, 0.02), v(0, -0.06, 0.24), 0.018, '--rdr-brass', 5);
        kit.cyl(0.07, 0.05, 0.03, M(sc, at(0, -0.05, 0.24)), '--rdr-brass', false, 10);
        candle(M(sc, at(0, -0.035, 0.24)), 0.16 + hash(Math.round(x * 10), 1, 8) * 0.12, 0.034);
      });
      [-1, 1].forEach(function (s) {
        var br = at(s * 4.25, 3.3, back + 0.01);
        box(0.3, 0.03, 0.26, M(br, at(0, 0, 0.13)), '--rdr-brass', false);
        box(0.03, 0.18, 0.03, M(br, at(0, -0.1, 0.03)), '--rdr-brass', false);
        raven(M(br, at(0, 0.015, 0.12)));
      });

      // THE PHONOGRAPH in front of the window: a cabinet panelled in her
      // timber with a crank at its side, the turntable with a record on it,
      // the arm, and the horn opening like a flower, its petals brass and
      // flame by turns, a rib along every seam.
      var ph = at(0, 0, back + 2.6);
      box(1.0, 0.82, 0.7, M(ph, at(0, 0.49, 0)), '--rdr-timber');
      box(0.76, 0.5, 0.02, M(ph, at(0, 0.5, 0.36)), '--rdr-panel', false);
      [[-0.44, -0.29], [0.44, -0.29], [-0.44, 0.29], [0.44, 0.29]].forEach(function (f) { kit.cyl(0.05, 0.04, 0.08, M(ph, at(f[0], 0.04, f[1])), '--rdr-timber', false, 8); });
      box(0.72, 0.2, 0.6, M(ph, at(0, 1.0, 0)), '--rdr-leather');
      kit.cyl(0.27, 0.27, 0.02, M(ph, at(0, 1.11, 0)), '--rdr-velvet', false, 24);
      // HER RECORD on it, as her page draws it: black with its grooves, a red
      // label ringed in gold, her moon and star on it off the middle so you
      // can see it go round. The tone arm rests on it and does not turn.
      var recordAt = M(ph, at(0, 1.126, 0)), record = [], FLAT = -Math.PI / 2;
      record.push(kit.facets(new T.CylinderGeometry(0.25, 0.25, 0.012, 40), recordAt, '--rdr-stone'));
      [0.235, 0.21, 0.185, 0.16, 0.135, 0.112].forEach(function (rg) { record.push(kit.flat(new T.RingGeometry(rg - 0.0025, rg, 40), M(recordAt, at(0, 0.0064, 0, 0, FLAT)), '--rdr-panel')); });
      record.push(kit.flat(new T.CircleGeometry(0.08, 24), M(recordAt, at(0, 0.0068, 0, 0, FLAT)), '--rdr-ember'));
      record.push(kit.flat(new T.RingGeometry(0.074, 0.078, 24), M(recordAt, at(0, 0.0072, 0, 0, FLAT)), '--rdr-brass'));
      var starShape = new T.Shape();
      for (var sp5 = 0; sp5 < 10; sp5++) { var sr5 = sp5 % 2 ? 0.009 : 0.022, sa5 = sp5 / 10 * Math.PI * 2; if (sp5) starShape.lineTo(sr5 * Math.sin(sa5), sr5 * Math.cos(sa5)); else starShape.moveTo(0, sr5); }
      record.push(kit.flat(new T.ShapeGeometry(starShape), M(recordAt, at(0.038, 0.0076, 0.02, 0, FLAT)), '--rdr-brass'));
      var moonShape = new T.Shape(); moonShape.absarc(0, 0, 0.024, 0.5, Math.PI * 2 - 0.5, false); moonShape.absarc(0.012, 0, 0.018, Math.PI * 2 - 0.9, 0.9, true);
      record.push(kit.flat(new T.ShapeGeometry(moonShape), M(recordAt, at(-0.034, 0.0076, -0.018, 0, FLAT)), '--rdr-brass'));
      kit.cyl(0.006, 0.006, 0.04, M(recordAt, at(0, 0.02, 0)), '--rdr-brass', false, 6);
      kit.cyl(0.03, 0.034, 0.06, M(ph, at(0.31, 1.14, -0.23)), '--rdr-brass', false, 10);
      rod(ph, v(0.31, 1.18, -0.23), v(0.08, 1.15, 0.12), 0.007, '--rdr-brass', 5);
      box(0.04, 0.02, 0.06, M(ph, at(0.07, 1.145, 0.13, -0.6)), '--rdr-brass', false, false);
      kit.cyl(0.02, 0.02, 0.6, M(ph, at(0.2, 1.33, -0.18, 0, -0.55)), '--rdr-brass', false, 6);
      // The crank, out of the cabinet's side.
      kit.cyl(0.02, 0.02, 0.16, M(ph, at(0.58, 0.62, 0, 0, 0, Math.PI / 2)), '--rdr-brass', false, 6);
      box(0.03, 0.22, 0.03, M(ph, at(0.67, 0.53, 0)), '--rdr-brass', false);
      kit.cyl(0.025, 0.025, 0.1, M(ph, at(0.72, 0.44, 0, 0, 0, Math.PI / 2)), '--rdr-timber', false, 6);
      var horn = M(ph, at(0.32, 1.86, -0.45, 0, -0.85)), PET = 10, HR = 0.55, HH = 0.95;
      for (var pt = 0; pt < PET; pt++) {
        var petal = new T.ConeGeometry(HR, HH, 3, 1, true, pt / PET * Math.PI * 2, Math.PI * 2 / PET);
        kit.piece(petal, horn, pt % 2 ? '--rdr-flame' : '--rdr-brass', false);
        // And its inside, which is what you see looking into the horn: the
        // same petal turned out, so the colours fall in the same places.
        var inside = new T.ConeGeometry(HR * 0.995, HH, 3, 1, true, (PET - 1 - pt) / PET * Math.PI * 2, Math.PI * 2 / PET);
        inside.scale(-1, 1, 1); inside.computeVertexNormals();
        kit.piece(inside, horn, pt % 2 ? '--rdr-flame' : '--rdr-brass', false);
        var th = pt / PET * Math.PI * 2;
        rod(horn, v(0, HH / 2, 0), v(HR * Math.sin(th), -HH / 2, HR * Math.cos(th)), 0.008, '--rdr-timber', 4);
      }
      var lip = new T.TorusGeometry(HR, 0.018, 4, 30); lip.rotateX(Math.PI / 2);
      kit.piece(lip, M(horn, at(0, -HH / 2, 0)), '--rdr-brass', false);
      kit.cyl(0.03, 0.05, 0.36, M(horn, at(0, HH / 2 + 0.16, 0)), '--rdr-brass', false, 8);
      // Two records leaning on the cabinet, in her sleeves' colours, the
      // discs showing at their tops.
      [['--rdr-velvet', -0.32, 0.12], ['--rdr-ember', -0.2, 0.2]].forEach(function (r, n) {
        var lean = M(ph, at(r[1], 0, 0.42 + n * 0.05, r[2], -0.18));
        kit.cyl(0.15, 0.15, 0.008, M(lean, at(0, 0.36, -0.005, 0, Math.PI / 2)), '--rdr-stone', false, 18);
        box(0.32, 0.32, 0.012, M(lean, at(0, 0.16, 0.004)), r[0], 0.004);
      });

      // THE RUG between the chair and the phonograph, velvet with her brass
      // ring woven into it, and the chandelier of seven candles over it.
      var rug = new T.CylinderGeometry(1, 1, 0.02, 40); rug.scale(1.7, 1, 2.3);
      kit.piece(rug, at(0, 0.012, -6.1), '--rdr-velvet', false, false);
      var ring = new T.TorusGeometry(1, 0.018, 4, 48); ring.rotateX(Math.PI / 2); ring.scale(1.35, 1, 1.85);
      kit.piece(ring, at(0, 0.026, -6.1), '--rdr-brass', false, false);
      // Woven into it: a band of little lozenges inside the brass ring, a
      // medallion in the middle, and a fringe at its two ends.
      var loz = new T.PlaneGeometry(0.11, 0.11), rugH = heap(), rugH2 = heap();
      for (var lz = 0; lz < 40; lz++) {
        var la0 = lz / 40 * Math.PI * 2;
        (lz % 2 ? rugH : rugH2).add(loz, at(1.12 * Math.sin(la0), 0.024, -6.1 + 1.56 * Math.cos(la0), 0, -Math.PI / 2, Math.PI / 4));
      }
      var med = new T.CircleGeometry(1, 28); med.scale(0.42, 0.6, 1);
      rugH.add(med, at(0, 0.024, -6.1, 0, -Math.PI / 2));
      var medIn = new T.CircleGeometry(1, 28); medIn.scale(0.26, 0.38, 1);
      rugH2.add(medIn, at(0, 0.025, -6.1, 0, -Math.PI / 2));
      rugH.mesh('--rdr-ember', false); rugH2.mesh('--rdr-brass', false);
      var medRing = new T.TorusGeometry(1, 0.012, 4, 36); medRing.rotateX(Math.PI / 2); medRing.scale(0.5, 1, 0.7);
      kit.piece(medRing, at(0, 0.026, -6.1), '--rdr-ink-2', false, false);
      [-1, 1].forEach(function (s) {
        for (var fx = -0.5; fx <= 0.5; fx += 0.05) {
          var fz = -6.1 + s * 2.3 * Math.sqrt(Math.max(0, 1 - (fx / 1.7) * (fx / 1.7)));
          kit.cyl(0.006, 0.006, 0.14, at(fx, 0.006, fz + s * 0.06, 0, Math.PI / 2), '--rdr-ink-2', false, 3);
        }
      });
      var chy = 4.2, chz = -6.0, chm = at(0, chy, chz);
      kit.cyl(0.012, 0.012, H - chy - 0.8, at(0, (H + chy + 0.8) / 2, chz), '--rdr-brass', false, 4);
      kit.piece(new T.TorusGeometry(0.05, 0.012, 4, 10), M(chm, at(0, 0.8, 0)), '--rdr-brass', false);
      [0, 1, 2].forEach(function (cn) { var a3 = cn / 3 * Math.PI * 2; rod(chm, v(0, 0.76, 0), v(0.85 * Math.sin(a3), -0.22, 0.85 * Math.cos(a3)), 0.006, '--rdr-brass', 4); });
      kit.piece(new T.SphereGeometry(0.06, 8, 6), M(chm, at(0, -0.08, 0)), '--rdr-brass', false);
      kit.cyl(0.02, 0.004, 0.14, M(chm, at(0, -0.2, 0)), '--rdr-brass', false, 6);
      var crown = new T.TorusGeometry(0.85, 0.022, 5, 40); crown.rotateX(Math.PI / 2);
      kit.piece(crown, M(chm, at(0, -0.22, 0)), '--rdr-brass', false);
      for (var ca = 0; ca < 6; ca++) {
        var aa = ca / 6 * Math.PI * 2 + Math.PI / 6, cx = 0.85 * Math.sin(aa), cz = 0.85 * Math.cos(aa);
        rod(chm, v(0, -0.08, 0), v(cx * 0.95, -0.22, cz * 0.95), 0.014, '--rdr-brass', 5);
        candle(M(chm, at(cx, -0.21, cz)), 0.1 + hash(ca, 2, 7) * 0.06);
        kit.piece(new T.SphereGeometry(0.02, 6, 4), M(chm, at(0.85 * Math.sin(aa + Math.PI / 6), -0.3, 0.85 * Math.cos(aa + Math.PI / 6))), '--rdr-brass', false);
      }
      var chl = new T.PointLight(kit.col('--rdr-flame-2'), 2.6, 6.5, 1.6);
      chl.position.set(0, chy - 0.1, chz);
      kit.scene.add(chl);
      candle(M(chm, at(0, -0.03, 0)), 0.16, 0.024, chl);

      // A CHAIR IN THE DARK, facing it: winged, velvet, brass studs along its
      // arms, on four short legs.
      var ch = at(0, 0, back + 6.4, Math.PI);
      box(1.0, 0.3, 0.95, M(ch, at(0, 0.36, 0)), '--rdr-velvet');
      box(0.86, 0.12, 0.84, M(ch, at(0, 0.56, 0.04)), '--rdr-velvet', 0.01);
      box(1.0, 1.1, 0.24, M(ch, at(0, 0.98, -0.38)), '--rdr-velvet');
      [-1, 1].forEach(function (s) {
        box(0.18, 0.5, 0.95, M(ch, at(s * 0.5, 0.58, 0)), '--rdr-velvet');
        box(0.22, 0.6, 0.3, M(ch, at(s * 0.46, 1.28, -0.28, s * 0.35)), '--rdr-velvet');
        for (var st = 0; st < 5; st++) kit.piece(new T.SphereGeometry(0.014, 5, 4), M(ch, at(s * 0.6, 0.6, -0.36 + st * 0.18)), '--rdr-brass', false);
        [-0.38, 0.38].forEach(function (lz) { kit.cyl(0.035, 0.025, 0.21, M(ch, at(s * 0.42, 0.105, lz)), '--rdr-timber', false, 6); });
      });

      // Buttons deep in the velvet of its back, a row of brass studs along
      // the top of it, and a cushion squashed into the seat.
      for (var bt = 0; bt < 12; bt++) {
        kit.piece(new T.SphereGeometry(0.016, 6, 4), M(ch, at(-0.33 + (bt % 4) * 0.22 + (Math.floor(bt / 4) % 2) * 0.11, 0.72 + Math.floor(bt / 4) * 0.22, -0.255)), '--rdr-stone', false);
      }
      for (var tp = 0; tp < 11; tp++) kit.piece(new T.SphereGeometry(0.014, 5, 4), M(ch, at(-0.45 + tp * 0.09, 1.53, -0.38)), '--rdr-brass', false);
      var cush = new T.SphereGeometry(0.3, 12, 8); cush.scale(1.1, 0.32, 0.9);
      kit.piece(cush, M(ch, at(0.05, 0.66, 0.02, 0.2)), '--rdr-leather', 0.01);
      // A little round table at its side, with a candle on it, which is lit
      // when somebody asks, and a stack of her records on the floor at the
      // other side, the top one out of its sleeve.
      var tb = at(0.95, 0, back + 6.55);
      kit.cyl(0.24, 0.24, 0.04, M(tb, at(0, 0.6, 0)), '--rdr-timber', 0.01, 18);
      kit.cyl(0.25, 0.25, 0.012, M(tb, at(0, 0.585, 0)), '--rdr-brass', false, 18);
      kit.cyl(0.03, 0.045, 0.56, M(tb, at(0, 0.3, 0)), '--rdr-timber', false, 8);
      [0, 1, 2].forEach(function (tf) { var ta = tf / 3 * Math.PI * 2; rod(tb, v(0, 0.08, 0), v(0.2 * Math.sin(ta), 0.0, 0.2 * Math.cos(ta)), 0.016, '--rdr-timber', 5); });
      var tableFlame = candle(M(tb, at(-0.08, 0.62, 0.02)), 0.11, 0.022);
      kit.hide(tableFlame, true);
      [['--rdr-velvet', 0.1], ['--rdr-ember', -0.25]].forEach(function (sl, n) { box(0.24, 0.006, 0.24, M(tb, at(0.07, 0.625 + n * 0.007, -0.02, sl[1])), sl[0], false, false); });
      var stk = at(-0.95, 0, back + 6.45);
      ['--rdr-velvet', '--rdr-leather', '--rdr-ember', '--rdr-panel', '--rdr-ink-2'].forEach(function (sl, n) {
        box(0.32, 0.011, 0.32, M(stk, at((hash(n, 4, 1) - 0.5) * 0.04, 0.006 + n * 0.012, (hash(n, 4, 2) - 0.5) * 0.04, (hash(n, 4, 3) - 0.5) * 0.4)), sl, 0.003);
      });
      kit.cyl(0.15, 0.15, 0.006, M(stk, at(0.06, 0.066, 0.04)), '--rdr-stone', false, 22);
      kit.cyl(0.05, 0.05, 0.007, M(stk, at(0.06, 0.067, 0.04)), '--rdr-ember', false, 14);

      // CANDELABRA standing either side, brass with three candles each, and
      // the only lights in the room besides the chandelier.
      [-1, 1].forEach(function (s) {
        var c = at(s * 2.3, 0, back + 2.9);
        kit.cyl(0.25, 0.3, 0.06, M(c, at(0, 0.03, 0)), '--rdr-brass', false, 12);
        [0, 1, 2].forEach(function (f) { var fa = f / 3 * Math.PI * 2; kit.piece(new T.SphereGeometry(0.06, 6, 4), M(c, at(0.24 * Math.sin(fa), 0.03, 0.24 * Math.cos(fa))), '--rdr-brass', false); });
        kit.cyl(0.035, 0.035, 1.6, M(c, at(0, 0.82, 0)), '--rdr-brass', false, 8);
        [0.5, 1.1].forEach(function (ky) { kit.piece(new T.SphereGeometry(0.06, 8, 6), M(c, at(0, ky, 0)), '--rdr-brass', false); });
        rod(c, v(0, 1.45, 0), v(-0.38, 1.62, 0), 0.02, '--rdr-brass', 5);
        rod(c, v(0, 1.45, 0), v(0.38, 1.62, 0), 0.02, '--rdr-brass', 5);
        var l = new T.PointLight(kit.col('--rdr-flame-2'), 7, 9, 1.4);
        l.position.set(s * 2.3, 2.0, back + 3.0);
        kit.scene.add(l);
        [-0.38, 0, 0.38].forEach(function (x) { candle(M(c, at(x, x ? 1.62 : 1.64, 0)), x ? 0.2 + (x > 0 ? 0.05 : 0) : 0.3, 0.032, x ? null : l); });
      });

      // THE CELLO, leaning on the left-hand wall in the corner by the window,
      // and THE HARP in the other corner: hers, as her page draws them.
      var ce = at(-4.5, 0, back + 1.05, LEFT, -0.2);
      kit.cyl(0.008, 0.008, 0.16, M(ce, at(0, 0.08, 0)), '--rdr-brass', false, 4);
      [[0.46, 0.3], [0.88, 0.235]].forEach(function (bout) {
        var bg = new T.SphereGeometry(bout[1], 18, 12); bg.scale(1, 1.15, 0.38);
        kit.piece(bg, M(ce, at(0, bout[0], 0)), '--rdr-leather', 0.012);
      });
      box(0.14, 0.12, 0.08, M(ce, at(0, 0.68, 0)), '--rdr-leather', false);
      box(0.05, 0.6, 0.05, M(ce, at(0, 1.38, 0)), '--rdr-timber', false);
      box(0.05, 0.85, 0.02, M(ce, at(0, 1.1, 0.1)), '--rdr-stone', false);
      kit.piece(new T.SphereGeometry(0.045, 8, 6), M(ce, at(0, 1.72, 0)), '--rdr-timber', false);
      box(0.13, 0.05, 0.015, M(ce, at(0, 0.55, 0.115)), '--rdr-brass', false);
      [-0.03, -0.01, 0.01, 0.03].forEach(function (sx) { box(0.004, 1.05, 0.004, M(ce, at(sx, 1.08, 0.125)), '--rdr-brass', false); });
      [-1, 1].forEach(function (s) { box(0.012, 0.16, 0.01, M(ce, at(s * 0.13, 0.58, 0.105, 0, 0, s * 0.15)), '--rdr-stone', false); });
      // Its bow, leaning beside it: the stick, the hair, the frog.
      var bow0 = v(-4.22, 0.03, back + 1.5), bow1 = v(-4.58, 1.32, back + 1.3);
      rod(at(0, 0, 0), bow0, bow1, 0.007, '--rdr-timber', 5);
      rod(at(0, 0, 0), bow0.clone().add(v(0.03, 0.06, 0)), bow1.clone().add(v(0.025, -0.05, 0)), 0.003, '--rdr-ink-2', 3);
      box(0.04, 0.07, 0.03, at(-4.245, 0.12, back + 1.49, 0, 0, 0.27), '--rdr-stone', false);
      var hp = at(4.05, 0, back + 1.15, -0.64);
      box(0.6, 0.1, 0.3, M(hp, at(0.02, 0.05, 0)), '--rdr-timber');
      kit.cyl(0.04, 0.045, 1.75, M(hp, at(-0.35, 0.93, 0)), '--rdr-timber', false, 8);
      kit.piece(new T.SphereGeometry(0.06, 8, 6), M(hp, at(-0.35, 1.84, 0)), '--rdr-brass', false);
      var sb = Math.hypot(0.65, 1.33);
      box(0.14, sb, 0.2, at(0.075, 0.785, 0, 0, 0, -Math.atan2(0.65, 1.33), hp), '--rdr-leather');
      rod(hp, v(-0.35, 1.8, 0), v(0.05, 1.78, 0), 0.04, '--rdr-timber', 6);
      rod(hp, v(0.05, 1.78, 0), v(0.42, 1.48, 0), 0.04, '--rdr-timber', 6);
      for (var hs = -0.26; hs < 0.36; hs += 0.06) {
        var foot = 0.12 + (hs + 0.25) / 0.65 * 1.33 + 0.05;
        var head = hs < 0.05 ? 1.8 - (hs + 0.35) / 0.4 * 0.02 : 1.78 - (hs - 0.05) / 0.37 * 0.3;
        if (head - foot > 0.08) box(0.005, head - foot - 0.05, 0.005, M(hp, at(hs, (head + foot) / 2, 0)), '--rdr-brass', false);
      }

      // HER PAGE on the right-hand wall, and the deck and the three shelves of
      // records off it: the deck by the phonograph on the far wall's left, the
      // shelves along the left-hand wall, each in an arch of her record
      // case's timber drawn up to a point.
      var pw = 2.8, phh = pw * 800 / 1180, py = 1.1 + phh / 2;
      var pg = at(W / 2 - 0.02, 0, -5.4, RIGHT);
      box(pw + 0.24, phh + 0.24, 0.08, M(pg, at(0, py, 0)), '--rdr-timber');
      var frame = kit.screen(1180, 800, pw, M(pg, at(0, py, 0.06)), 'Helen Edgar’s Music Room’s own page, on the right-hand wall');
      // The deck stands on a timber shelf on the far wall, on brass brackets.
      box(1.62, 0.06, 0.3, at(-3.3, 0.57, back + 0.15), '--rdr-timber');
      [-0.62, 0.62].forEach(function (bk) { rod(at(-3.3 + bk, 0, back), v(0, 0.3, 0.02), v(0, 0.54, 0.26), 0.014, '--rdr-brass', 4); });
      var deck = kit.lift(frame, '.mus-deck', { w: 560, ww: 1.5, m: at(-3.3, 0.6, back + 0.02) });
      var SHELVES = [
        { n: 0, z: -2.6, words: 'Faery Yurt’s Yarn' },
        { n: 1, z: -5.5, words: 'Strange things will happen' },
        { n: 2, z: -8.4, words: 'Symphrenia Chill' }
      ];
      var stops = [{ name: 'just through the door, in the candlelight', x: 0, z: -1.2, yaw: 0 }];
      stops.push({ name: 'in the chair in the dark, facing the phonograph and the window', x: 0, z: back + 6.4, yaw: 0 });
      stops.push({ name: 'at the edge of the rug beside the chair, looking up at the chandelier', x: 1.25, z: -3.9, yaw: 0.2, pitch: 0.6 });
      stops.push({ name: 'at the phonograph’s deck, with her playlists on it', x: -3.3, z: back + 2.1, yaw: 0, pitch: -0.22, frame: deck.el });
      SHELVES.forEach(function (sh) {
        var g = at(-W / 2 + 0.06, 0, sh.z, LEFT);
        box(1.72, 2.4, 0.02, M(g, at(0, 1.2, -0.02)), '--rdr-stone', false, false);
        [-1, 1].forEach(function (s) {
          box(0.1, 2.4, 0.16, M(g, at(s * 0.86, 1.2, 0.06)), '--rdr-timber');
          box(1.04, 0.1, 0.16, M(g, at(s * 0.43, 2.675, 0.06, 0, 0, -s * Math.atan2(0.55, 0.86))), '--rdr-timber');
        });
        kit.piece(new T.SphereGeometry(0.05, 8, 6), M(g, at(0, 3.0, 0.06)), '--rdr-brass', false);
        box(1.6, 0.12, 0.4, M(g, at(0, 0.06, 0.16)), '--rdr-timber');
        var it = kit.lift(frame, '.mus-rack', { n: sh.n, w: 560, h: 700, ww: 1.5, m: M(g, at(0, 0.14, 0.02)) });
        stops.push({ name: 'at the shelf of records off ' + sh.words, x: -W / 2 + 2.6, z: sh.z, yaw: LEFT, pitch: -0.2, frame: it.el });
      });
      kit.wire(frame, 'rack.js');
      stops.push({ name: 'beside the cello, leaning in the corner past the records', x: -3.55, z: back + 3.6, yaw: 0.34, pitch: -0.1 });
      stops.push({ name: 'beside the harp, in the corner by the window', x: 3.5, z: back + 4.5, yaw: -0.18, pitch: -0.12 });
      stops.push({ name: 'over the phonograph, looking down at her record on it', x: 0.15, z: back + 3.55, yaw: 0, pitch: -0.62 });
      stops.push({ name: 'at the window, with the night in it and a raven on the sill', x: 0, z: back + 1.6, yaw: 0, pitch: 0.12 });
      stops.push({ name: 'at the right-hand wall, with her room’s own page on it', x: W / 2 - 2.6, z: -5.4, yaw: RIGHT, page: kit.page, frame: frame });

      // JOIN THE FAERIES, her page's own switch: faeries between the candles,
      // round the chandelier and by the candelabra and the sconces, each with
      // a cloak, a head of hair, two pairs of pale wings and a little light at
      // its heart, holding still where they are, as hers do until pressed.
      var cloakH = [heap(), heap()], headH = heap(), hairH = [heap(), heap()], wingH = heap(), heartH = heap();
      [[-1.3, 3.9, -5.4], [1.2, 4.35, -6.7], [0.35, 3.45, -7.3], [-2.0, 2.45, -7.7], [2.65, 2.7, -7.9], [-2.75, 3.95, -10.2], [2.7, 3.75, -10.3], [-0.6, 4.6, -5.0]].forEach(function (fp, n) {
        var fm = at(fp[0], fp[1], fp[2], (hash(n, 9, 1) - 0.5) * 2.4, 0, (hash(n, 9, 2) - 0.5) * 0.4);
        cloakH[n % 2].add(new T.ConeGeometry(0.05, 0.17, 8), fm);
        headH.add(new T.SphereGeometry(0.036, 8, 6), M(fm, at(0, 0.115, 0)));
        hairH[(n >> 1) % 2].add(new T.SphereGeometry(0.04, 8, 5, 0, Math.PI * 2, 0, Math.PI * 0.6), M(fm, at(0, 0.12, -0.006)));
        [[0.06, 0.6, 1], [0.04, 0.0, 0.7]].forEach(function (wp) {
          [-1, 1].forEach(function (sd) {
            var wing = new T.CircleGeometry(0.075 * wp[2], 12); wing.scale(0.5, 1, 1);
            var wm = M(fm, at(sd * 0.05, wp[0], -0.035, sd * 0.5, 0, -sd * (0.7 + wp[1])));
            wingH.add(wing, wm);
            wingH.add(wing.clone().rotateY(Math.PI), wm);
          });
        });
        heartH.add(new T.SphereGeometry(0.016, 6, 4), M(fm, at(0, 0.05, 0.045)));
      });
      var faeries = [cloakH[0].mesh('--rdr-velvet'), cloakH[1].mesh('--rdr-leather'), headH.mesh('--rdr-ink'),
                     hairH[0].mesh('--rdr-flame'), hairH[1].mesh('--rdr-timber'), wingH.mesh('--rdr-ink-2', true), heartH.mesh('--rdr-flame-2', true)];
      faeries.forEach(function (f) { kit.hide(f, true); });

      // GROW A GARDEN, her page's other switch: ivy along the foot of every
      // wall and up the corners, and toadstools in the corners, in her yurt's
      // ivy, toadstool and tallow, because it is her yurt's garden.
      var leafA = heap(), leafB = heap(), vine = heap(), capH = heap(), stemH = heap();
      function ivy(pts, face, seed) {
        for (var k = 1; k < pts.length; k++) {
          vine.add((function () {
            var d = new T.Vector3().subVectors(pts[k], pts[k - 1]), g = new T.CylinderGeometry(0.008, 0.008, d.length(), 3);
            g.applyQuaternion(new T.Quaternion().setFromUnitVectors(UP, d.normalize()));
            return g;
          })(), at((pts[k].x + pts[k - 1].x) / 2, (pts[k].y + pts[k - 1].y) / 2, (pts[k].z + pts[k - 1].z) / 2));
          for (var q = 0; q < 3; q++) {
            var u = hash(seed, k * 3 + q, 1), p = pts[k - 1].clone().lerp(pts[k], u);
            var lf = new T.SphereGeometry(0.07, 6, 4); lf.scale(1, 0.55, 0.3);
            (hash(seed, k * 3 + q, 2) < 0.6 ? leafA : leafB).add(lf, at(p.x, p.y + (hash(seed, k * 3 + q, 3) - 0.5) * 0.12, p.z, face, 0, hash(seed, k * 3 + q, 4) * 3));
          }
        }
      }
      function run(from, to, base, wave, steps, seed, at2) {
        var pts = [];
        for (var k = 0; k <= steps; k++) {
          var t = k / steps, a2 = from + (to - from) * t;
          pts.push(at2(a2, base + Math.sin(t * steps * 0.7 + seed) * wave));
        }
        return pts;
      }
      ivy(run(-0.9, -10.6, 0.32, 0.18, 34, 1, function (z, y) { return v(-W / 2 + 0.07, y, z); }), LEFT, 1);
      ivy(run(-0.9, -10.6, 0.3, 0.2, 34, 2, function (z, y) { return v(W / 2 - 0.07, y, z); }), RIGHT, 2);
      ivy(run(-4.8, -0.9, 0.3, 0.15, 12, 3, function (x, y) { return v(x, y, -0.08); }), Math.PI, 3);
      ivy(run(0.9, 4.8, 0.34, 0.15, 12, 4, function (x, y) { return v(x, y, -0.08); }), Math.PI, 4);
      ivy(run(-4.8, -1.5, 0.3, 0.15, 11, 5, function (x, y) { return v(x, y, back + 0.07); }), 0, 5);
      ivy(run(1.5, 4.8, 0.32, 0.15, 11, 6, function (x, y) { return v(x, y, back + 0.07); }), 0, 6);
      // And up the corners, to about where the candles start.
      [[-W / 2 + 0.08, -0.9, LEFT], [W / 2 - 0.08, -0.9, RIGHT], [-W / 2 + 0.08, back + 0.4, LEFT], [W / 2 - 0.08, back + 0.4, RIGHT]].forEach(function (cr, n) {
        ivy(run(0.3, 2.6 + n * 0.3, 0, 0.12, 9, 7 + n, function (y, x) { return v(cr[0], y, cr[1] + x * (cr[1] < -5 ? 1 : -1)); }), cr[2], 7 + n);
      });
      function toadstool(x, z, sc) {
        stemH.add(new T.CylinderGeometry(0.035 * sc, 0.045 * sc, 0.18 * sc, 8), at(x, 0.09 * sc, z));
        capH.add(new T.SphereGeometry(0.11 * sc, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), at(x, 0.17 * sc, z));
        for (var d = 0; d < 5; d++) {
          var a3 = d / 5 * Math.PI * 2 + sc;
          stemH.add(new T.SphereGeometry(0.016 * sc, 5, 3), at(x + Math.cos(a3) * 0.065 * sc, 0.17 * sc + 0.075 * sc, z + Math.sin(a3) * 0.065 * sc));
        }
      }
      [[-4.55, -0.6], [4.55, -0.65], [-3.7, back + 0.35], [3.3, back + 0.4], [-4.6, -6.9], [4.6, -3.2], [4.6, -8.2]].forEach(function (cl, n) {
        for (var ts = 0; ts < 3 + n % 2; ts++) toadstool(cl[0] + (hash(n, ts, 1) - 0.5) * 0.35, cl[1] + (hash(n, ts, 2) - 0.5) * 0.35, 0.6 + hash(n, ts, 3) * 0.7);
      });
      var garden = [leafA.mesh('--ivy'), leafB.mesh('--ivy-2'), vine.mesh('--ivy-2'), capH.mesh('--toadstool'), stemH.mesh('--tallow')];
      garden.forEach(function (g) { kit.hide(g, true); });

      // THE ROOM'S SWITCHES. The record goes round at MAX as hers does, or
      // when asked; the candles flicker only when asked.
      var turning = kit.turn(record, recordAt, { say: 'Turn the record', max: true, period: 6,
        said: function (on) { return on ? 'Her record goes round on the phonograph, once in six seconds.' : 'The record stops where it is.'; } });
      var candles = kit.flames(flames, { say: 'Let the candles flicker',
        said: function (on) { return on ? 'Every candle in the room flickers, each in its own time.' : 'The candles stand still again, as on her page.'; } });
      var joinFaeries = kit.press({ say: function () { return kit.hidden(faeries[0]) ? 'Join the Faeries' : 'Let the Faeries go'; },
        at: [kit.touch(2.2, 1.2, 2.2, at(0, 3.9, chz))],
        press: function () {
          var come = kit.hidden(faeries[0]);
          faeries.forEach(function (f) { kit.hide(f, !come); });
          return come ? 'Faeries have come in and hang between the candles, round the chandelier and by the window, holding still.' : 'The Faeries have gone, and the candles are on their own again.';
        } });
      var grow = kit.press({ say: function () { return kit.hidden(garden[0]) ? 'Grow a garden' : 'Clear the garden'; },
        at: [kit.touch(1.2, 1.2, 1.2, at(-3.7, 0.4, back + 0.6))],
        press: function () {
          var growNow = kit.hidden(garden[0]);
          garden.forEach(function (g) { kit.hide(g, !growNow); });
          return growNow ? 'Ivy has grown along the foot of every wall and up the corners, with toadstools in the corners.' : 'The ivy and the toadstools are cleared away.';
        } });
      var tableCandle = kit.press({ say: function () { return kit.hidden(tableFlame) ? 'Light the candle by the chair' : 'Blow out the candle by the chair'; },
        at: [kit.touch(0.55, 0.5, 0.55, M(tb, at(0, 0.8, 0)))],
        press: function () {
          var light = kit.hidden(tableFlame);
          kit.hide(tableFlame, !light);
          return light ? 'The candle on the little table by the chair is lit.' : 'The candle by the chair is blown out.';
        } });
      stops.forEach(function (st2) {
        if (/^in the chair/.test(st2.name)) st2.acts = [turning, tableCandle];
        if (/phonograph’s deck|^over the phonograph/.test(st2.name)) st2.acts = [turning];
        if (/chandelier/.test(st2.name)) st2.acts = [candles, joinFaeries];
        if (/^beside the cello|^beside the harp/.test(st2.name)) st2.acts = [grow];
        if (/^at the window/.test(st2.name)) st2.acts = [candles, grow];
      });

      return {
        start: { x: 0, z: -1.2, yaw: 0 },
        bounds: { x: [-W / 2 + 1.0, W / 2 - 1.0], z: [back + 1.4, -0.8] },
        stops: stops,
        // Offered in a VR headset, as the yurt it opens off is (Ryan's ask,
        // 2026-11-07), so you walk in from the yurt without leaving the
        // headset. On a screen this changes nothing. What is lifted off her
        // page is not in the headset, which shows only the picture.
        vr: true
      };
    }
  };
})();

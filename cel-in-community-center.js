/* =============================================================================
   The Community Center, walked into on Cel Street. Ryan's ask, 2026-10-31:
   back on the street, working down it a room at a time.

   IT IS THE COMMUNITY CENTER'S WORLD AND NOBODY ELSE'S (§51): a window seat in
   north light. Cool sage lime plaster on every wall, and one big window in the
   back wall facing north onto a living hillside, with a deep seat built into
   the bay under it, a cushion of the room's wool on it and the plant on the
   sill. NORTH LIGHT: the day comes in soft and even from the window and lands
   nowhere in a patch or a bar, so nothing in here casts a hard shadow and no
   warm plaster appears anywhere (a patch of sun on warm plaster is Covenstead,
   and if one ever lands here it is this room that moves). The pale ash of the
   window's frame, the seat, the front desk and the pigeonholes is carried
   against the plaster by its darker grain.

   WHAT IS ON THE WALLS IS THE PAGE'S OWN, lifted off it by the kit, each on
   the flat plaster it was written for, with nothing laid over the words:
   Getting started and how the radio works on the left-hand wall, the house
   norms, the community service board's sorter and the covenant on the right,
   and whose this is on the front desk. The front desk's forms and the map of
   where we are stay on the page, which hangs on the left-hand wall by the
   window: they need the radio, which is the page's to load.

   WHAT IS NEW (2026-11-05, Ryan's ask for another round): the window is
   arched, as the page draws it, set in a bay of the plaster's hollow with its
   rounded edge lit round the arch, two mullions and a transom; clouds stand
   still in the north sky and a path goes over the near hill between round
   trees. The seat has its two panels, a pale cushion and a hill-green one at
   either end, the folded throw the page's lede names and a book; a rug of
   the room's wool lies in front of it. The boards have their joints, the
   walls an ash skirting, the door its panels, a peg rail by it holds a scarf,
   the pigeonholes have their label holders, and the radio the lede puts on
   the front desk stands there, ash with a grille, a dial and an aerial.

   THREE THINGS TO PRESS, each in the scene where it stands and among the
   switches where you would use it, each saying in words what it did: open
   the right-hand casement out over the hill (or shut it); unfold the throw
   over the seat (or fold it up again); pull the radio's aerial up (or push it
   down; signing on is still the page's, at the front desk). Each changes how
   a thing stands and nothing travels between the two: a press shows one and
   puts the other away.

   NOTHING MOVES AT ANY SETTING: the hillside does not sway, the clouds do not
   drift, the plant stands still, and no switch here sets anything going, so
   the kit's flames, turns and lights are not used. Every colour is one the
   room declares, by name. It keeps nothing, sends nothing and fetches
   nothing; its page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['community-center.html'] = {
    name: 'The Community Center',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var W = 8, D = 9, H = 3.0, back = -D;
      var L = -W / 2, R = W / 2;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      // The window: half-width, sill, spring line and rise of its arch.
      var WIN = { hw: 2.5, y0: 0.95, ys: 2.15, ry: 0.55 };
      WIN.x0 = -WIN.hw; WIN.x1 = WIN.hw;
      var archTop = function (x) { return WIN.ys + WIN.ry * Math.sqrt(Math.max(0, 1 - (x / WIN.hw) * (x / WIN.hw))); };
      // An arched opening, straight sides and a half-ellipse head, traced
      // into a shape or a hole.
      var arch = function (p, hw, y0, ys, ry) {
        p.moveTo(-hw, y0); p.lineTo(hw, y0); p.lineTo(hw, ys);
        p.absellipse(0, ys, hw, ry, 0, Math.PI, false);
        p.lineTo(-hw, y0);
        return p;
      };
      // A flat rounded rectangle lying on the floor, w by d.
      var rounded = function (w, d, r) {
        var s = new T.Shape(), x = -w / 2, y = -d / 2;
        s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
        s.lineTo(x + w, y + d - r); s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
        s.lineTo(x + r, y + d); s.quadraticCurveTo(x, y + d, x, y + d - r);
        s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
        return s;
      };

      // NORTH LIGHT: the sky in at the window from in front of you, even, with
      // no sun in it and nothing casting a hard shadow.
      kit.scene.background = kit.col('--ctr-sky');
      kit.scene.add(new T.HemisphereLight(kit.col('--ctr-sky'), kit.col('--ctr-plaster'), 2.4));
      var day = new T.DirectionalLight(kit.col('--ctr-sky'), 0.9);
      day.position.set(0, 6, back - 12);
      day.target.position.set(0, 0, -3);
      kit.scene.add(day, day.target);

      // THE ROOM: plaster walls, a plaster ceiling, pale ash boards, each
      // board's joints staggered down its length.
      box(W + 0.4, 0.1, D + 0.4, at(0, -0.05, back / 2), '--ctr-ash', false, false);
      for (var b = 0; b < 16; b++) {
        box(0.01, 0.004, D, at(L + 0.25 + b * 0.5, 0.002, back / 2), '--ctr-hollow', false, false);
        for (var j = 0; j < 3; j++) {
          var jz = -0.6 - ((b * 1.7 + j * 2.9) % D);
          if (jz > back + 0.2) box(0.49, 0.004, 0.012, at(L + b * 0.5, 0.002, jz), '--ctr-hollow', false, false);
        }
      }
      box(W + 0.4, 0.14, D + 0.4, at(0, H + 0.07, back / 2), '--ctr-plate', false, false);
      box(0.3, H, D, at(L - 0.15, H / 2, back / 2), '--ctr-plaster', 0.015);
      box(0.3, H, D, at(R + 0.15, H / 2, back / 2), '--ctr-plaster', 0.015);
      // The front wall, with the door you came in by, shut behind you, its
      // four panels picked out in the grain.
      box(W + 0.6, H, 0.3, at(0, H / 2, 0.15), '--ctr-plaster', 0.015);
      box(0.96, 2.06, 0.06, at(2.6, 1.03, -0.02), '--ctr-ash', 0.015);
      cyl(0.035, 0.035, 0.06, at(2.28, 1.0, -0.07, 0, Math.PI / 2), '--ctr-grain', false, 10);
      [[2.4, 1.5], [2.8, 1.5], [2.4, 0.5], [2.8, 0.5]].forEach(function (pn) {
        var pw2 = 0.3, ph2 = pn[1] > 1 ? 0.8 : 0.7;
        box(pw2, 0.008, 0.01, at(pn[0], pn[1] + ph2 / 2, -0.056), '--ctr-grain', false);
        box(pw2, 0.008, 0.01, at(pn[0], pn[1] - ph2 / 2, -0.056), '--ctr-grain', false);
        box(0.008, ph2, 0.01, at(pn[0] - pw2 / 2, pn[1], -0.056), '--ctr-grain', false);
        box(0.008, ph2, 0.01, at(pn[0] + pw2 / 2, pn[1], -0.056), '--ctr-grain', false);
      });
      // A peg rail beside the door, a scarf of the room's wool on one peg.
      box(1.0, 0.08, 0.03, at(1.35, 1.7, -0.015), '--ctr-ash', 0.01);
      [0.95, 1.35, 1.75].forEach(function (x) { cyl(0.02, 0.026, 0.1, at(x, 1.7, -0.07, 0, Math.PI / 2), '--ctr-grain', false, 8); });
      box(0.13, 0.07, 0.05, at(1.35, 1.72, -0.1), '--ctr-wool', 0.006);
      box(0.11, 0.62, 0.02, at(1.3, 1.4, -0.085), '--ctr-wool', 0.006);
      box(0.11, 0.48, 0.02, at(1.41, 1.47, -0.115), '--ctr-wool', 0.006);
      [[1.3, 1.16], [1.3, 1.2], [1.41, 1.3], [1.41, 1.34]].forEach(function (st) { box(0.112, 0.012, 0.024, at(st[0], st[1], st[0] < 1.35 ? -0.085 : -0.115), '--ctr-hill-2', false); });
      // The plaster's rounded edge along the top of the walls, where the
      // window's light catches it.
      [[0, back + 0.02, W, 0], [L + 0.02, back / 2, D, LEFT], [R - 0.02, back / 2, D, LEFT]].forEach(function (e) {
        kit.piece(new T.CylinderGeometry(0.06, 0.06, e[2], 10), at(e[0], H - 0.06, e[1], e[3], 0, Math.PI / 2), '--ctr-plate', false);
      });
      // An ash skirting round the walls, its top edge in the grain, stopping
      // at the door and at the bay.
      var skirt = function (len, m) {
        box(len, 0.1, 0.03, m, '--ctr-ash', false);
        box(len, 0.012, 0.036, M(m, at(0, 0.054, 0)), '--ctr-grain', false);
      };
      skirt(D, at(L + 0.015, 0.05, back / 2, LEFT));
      skirt(D, at(R - 0.015, 0.05, back / 2, LEFT));
      skirt(6.08, at(-0.96, 0.05, -0.015));
      skirt(0.88, at(3.56, 0.05, -0.015));
      skirt(1.05, at(L + 0.525, 0.05, back + 0.015));
      skirt(1.05, at(R - 0.525, 0.05, back + 0.015));

      // THE BACK WALL, with the one big arched window in it.
      var ww = new T.Shape();
      ww.moveTo(-W / 2, 0); ww.lineTo(W / 2, 0); ww.lineTo(W / 2, H); ww.lineTo(-W / 2, H); ww.closePath();
      ww.holes.push(arch(new T.Path(), WIN.hw, WIN.y0, WIN.ys, WIN.ry));
      var wg = new T.ExtrudeGeometry(ww, { depth: 0.5, bevelEnabled: false, curveSegments: 24 });
      wg.translate(0, 0, -0.5);
      kit.piece(wg, at(0, 0, back), '--ctr-plaster', 0.02);
      // The bay: the plaster's hollow round the window and down behind the
      // seat, and its rounded edge, lit by the window, all the way round.
      var bay = arch(new T.Shape(), 2.95, 0, WIN.ys, 0.68);
      bay.holes.push(arch(new T.Path(), WIN.hw, WIN.y0, WIN.ys, WIN.ry));
      kit.piece(new T.ShapeGeometry(bay, 24), at(0, 0, back + 0.012), '--ctr-hollow', false, false);
      var edge = [];
      for (var e1 = 0; e1 <= 8; e1++) edge.push(new T.Vector3(-2.95, e1 / 8 * WIN.ys, back + 0.02));
      for (var e2 = 1; e2 < 24; e2++) { var ea = Math.PI - e2 / 24 * Math.PI; edge.push(new T.Vector3(2.95 * Math.cos(ea), WIN.ys + 0.68 * Math.sin(ea), back + 0.02)); }
      for (var e3 = 8; e3 >= 0; e3--) edge.push(new T.Vector3(2.95, e3 / 8 * WIN.ys, back + 0.02));
      kit.piece(new T.TubeGeometry(new T.CatmullRomCurve3(edge), 96, 0.05, 8), at(0, 0, 0), '--ctr-plate', false);
      // Its ash frame round the arch, two mullions and a transom at the
      // spring of the arch, as the page draws them.
      var fr = arch(new T.Shape(), WIN.hw + 0.09, WIN.y0 - 0.06, WIN.ys, WIN.ry + 0.09);
      fr.holes.push(arch(new T.Path(), WIN.hw - 0.05, WIN.y0, WIN.ys, WIN.ry - 0.05));
      var fg = new T.ExtrudeGeometry(fr, { depth: 0.1, bevelEnabled: false, curveSegments: 24 });
      fg.translate(0, 0, -0.05);
      kit.piece(fg, at(0, 0, back - 0.3), '--ctr-ash', 0.012);
      [-0.83, 0.83].forEach(function (x) {
        var top = archTop(x);
        box(0.06, top - WIN.y0, 0.06, at(x, (top + WIN.y0) / 2, back - 0.3), '--ctr-ash', 0.008);
      });
      box(WIN.hw * 2, 0.06, 0.06, at(0, WIN.ys, back - 0.3), '--ctr-ash', 0.008);
      var wx = 0, wl = WIN.x1 - WIN.x0;

      // THE HILLSIDE through it, under the north sky: ridges behind ridges and
      // trees on them, still clouds over it, and a path going over the near
      // hill, as on the page.
      kit.flat(new T.PlaneGeometry(200, 80), at(0, 30, back - 60), '--ctr-sky');
      [[-16, 24, 7, 1.0], [6, 30, 9, 1.3], [22, 20, 6, 0.8], [-4, 34, 5, 0.7]].forEach(function (c) {
        var cg = new T.CircleGeometry(1, 32); cg.scale(c[2], c[2] * 0.22, 1);
        kit.flat(cg, at(c[0], c[1], back - 56), '--ctr-plate');
        var cg2 = new T.CircleGeometry(1, 32); cg2.scale(c[2] * 0.5, c[2] * 0.2, 1);
        kit.flat(cg2, at(c[0] - c[2] * 0.25, c[1] + c[2] * 0.13 * c[3], back - 56.1), '--ctr-plate');
      });
      [[-14, 22, 9, '--ctr-ridge', -48], [10, 26, 11, '--ctr-ridge', -50], [-6, 18, 7, '--ctr-hill', -38], [14, 16, 6, '--ctr-hill', -36], [0, 12, 4, '--ctr-hill-2', -28]].forEach(function (h) {
        kit.flat(new T.CircleGeometry(h[1], 40, 0, Math.PI), at(h[0], -h[1] + h[2], back + h[4]), h[3]);
      });
      kit.flat(new T.PlaneGeometry(200, 6), at(0, -2.6, back - 26), '--ctr-hill-2');
      // The path: a pale ribbon up the near hill's face, narrowing as it goes.
      var path = new T.Shape(), pl = [], pr = [];
      for (var pi = 0; pi <= 16; pi++) {
        var u = pi / 16, ux = -1.6 + 4.8 * u * u, uy = 0.1 + 3.6 * u - 0.6 * u * u, half = 0.32 - 0.24 * u;
        pl.push([ux - half * 0.7, uy + half * 0.7]); pr.push([ux + half * 0.7, uy - half * 0.7]);
      }
      path.moveTo(pl[0][0], pl[0][1]);
      pl.slice(1).forEach(function (q) { path.lineTo(q[0], q[1]); });
      pr.reverse().forEach(function (q) { path.lineTo(q[0], q[1]); });
      path.closePath();
      kit.flat(new T.ShapeGeometry(path), at(0, 0, back - 27.95), '--ctr-ridge');
      for (var t = 0; t < 14; t++) {
        var tx = -16 + t * 2.4 + (t % 3) * 0.7, tz = back - 30 + (t % 4) * 1.5, th = 1.6 + (t % 5) * 0.4;
        kit.piece(new T.ConeGeometry(0.5 + (t % 3) * 0.15, th, 7), at(tx, 2.8 + (t % 4) * 0.5 + th / 2, tz), '--ctr-tree', false);
      }
      // Round trees in twos on the near hill, as the page draws them.
      [[-4.2, 2.2, -27.6], [-3.4, 2.5, -27.7], [3.8, 2.4, -27.6], [4.7, 2.1, -27.7], [-8.5, 0.9, -25.8], [8.8, 0.8, -25.8]].forEach(function (rt, k) {
        var sg = new T.SphereGeometry(0.55 + (k % 2) * 0.15, 10, 8); sg.scale(1, 0.85, 0.6);
        kit.piece(sg, at(rt[0], rt[1], back + rt[2]), '--ctr-tree', false);
      });

      // THE DEEP SEAT built into the bay under the window, with its two
      // panels, its cushion of the room's wool, a pale cushion and a
      // hill-green one at either end, a book, and the plant on the sill.
      box(wl + 0.6, 0.48, 0.85, at(wx, 0.24, back + 0.42), '--ctr-ash', 0.015);
      box(wl + 0.6, 0.06, 0.06, at(wx, 0.48, back + 0.84), '--ctr-grain', false);
      [-1.4, 1.4].forEach(function (x) {
        var pw3 = 2.4, ph3 = 0.3, py3 = 0.22, pz3 = back + 0.856;
        box(pw3, 0.014, 0.01, at(x, py3 + ph3 / 2, pz3), '--ctr-grain', false);
        box(pw3, 0.014, 0.01, at(x, py3 - ph3 / 2, pz3), '--ctr-grain', false);
        box(0.014, ph3, 0.01, at(x - pw3 / 2, py3, pz3), '--ctr-grain', false);
        box(0.014, ph3, 0.01, at(x + pw3 / 2, py3, pz3), '--ctr-grain', false);
      });
      box(wl + 0.2, 0.14, 0.7, at(wx, 0.55, back + 0.42), '--ctr-wool', 0.012);
      // The wool's piping along the cushion's front edge.
      kit.piece(new T.CylinderGeometry(0.014, 0.014, wl + 0.2, 8), at(wx, 0.62, back + 0.77, 0, 0, Math.PI / 2), '--ctr-hill-2', false);
      var cu1 = new T.BoxGeometry(0.7, 0.36, 0.16);
      kit.piece(cu1, at(wx - 2.05, 0.82, back + 0.14, 0.2, -0.18), '--ctr-plate', 0.012);
      kit.piece(cu1.clone(), at(wx + 2.05, 0.8, back + 0.14, -0.2, -0.2), '--ctr-hill', 0.012);
      // A book lying on the cushion, its pages to the room.
      box(0.32, 0.05, 0.24, at(wx + 0.75, 0.645, back + 0.4, 0.25), '--ctr-form', 0.008);
      box(0.33, 0.012, 0.25, at(wx + 0.75, 0.676, back + 0.4, 0.25), '--ctr-tree', false);
      box(0.33, 0.012, 0.25, at(wx + 0.75, 0.616, back + 0.4, 0.25), '--ctr-tree', false);
      box(wl + 0.1, 0.06, 0.32, at(wx, WIN.y0 - 0.03, back - 0.18), '--ctr-ash', 0.012);
      var px = WIN.x1 - 0.45, pz = back - 0.18;
      cyl(0.11, 0.08, 0.2, at(px, WIN.y0 + 0.1, pz), '--ctr-pot', 0.01, 14);
      cyl(0.118, 0.118, 0.04, at(px, WIN.y0 + 0.19, pz), '--ctr-pot', 0.008, 14);
      [[0, 0.16, 0], [0.08, 0.1, 0.05], [-0.07, 0.12, -0.04], [0.03, 0.22, -0.06], [-0.05, 0.2, 0.06]].forEach(function (l) {
        kit.piece(new T.SphereGeometry(0.09, 8, 6), at(px + l[0], WIN.y0 + 0.2 + l[1], pz + l[2]), '--ctr-leaf', 0.008);
      });
      // A trailing stem over the pot's edge, its small leaves down it.
      [[0.13, 0.12, 0.06], [0.16, 0.04, 0.08], [0.17, -0.04, 0.09]].forEach(function (l) {
        var lg = new T.SphereGeometry(0.035, 6, 5); lg.scale(1, 0.8, 0.6);
        kit.piece(lg, at(px + l[0], WIN.y0 + 0.2 + l[1], pz + l[2]), '--ctr-leaf', false);
      });

      // A RUG OF THE ROOM'S WOOL in front of the seat, its border a darker
      // green of the same wool.
      var rug = new T.ExtrudeGeometry(rounded(3.6, 1.6, 0.3), { depth: 0.014, bevelEnabled: false });
      kit.piece(rug, at(wx, 0, back + 2.05, 0, -Math.PI / 2), '--ctr-wool', false, false);
      var rb = rounded(3.36, 1.36, 0.22);
      rb.holes.push(rounded(3.2, 1.2, 0.16));
      kit.piece(new T.ShapeGeometry(rb, 8), at(wx, 0.016, back + 2.05, 0, -Math.PI / 2), '--ctr-hill-2', false, false);

      // THE THROW, folded on the cushion as the page's lede has it, or
      // unfolded over the seat on a press. Both are drawn; one is put away.
      var thx = wx - 1.25, thz = back + 0.45;
      var folded = [
        kit.facets(new T.BoxGeometry(0.66, 0.1, 0.48), at(thx, 0.67, thz), '--ctr-ridge'),
        kit.facets(new T.BoxGeometry(0.665, 0.103, 0.022), at(thx, 0.67, thz - 0.17), '--ctr-wool'),
        kit.facets(new T.BoxGeometry(0.665, 0.103, 0.022), at(thx, 0.67, thz + 0.17), '--ctr-wool')
      ];
      var ux0 = wx - 0.9, unfolded = [
        kit.facets(new T.BoxGeometry(2.0, 0.02, 0.66), at(ux0, 0.632, back + 0.44), '--ctr-ridge'),
        kit.facets(new T.BoxGeometry(2.0, 0.02, 0.12), at(ux0, 0.6, back + 0.81, 0, 0.6), '--ctr-ridge'),
        kit.facets(new T.BoxGeometry(2.0, 0.3, 0.02), at(ux0, 0.42, back + 0.87), '--ctr-ridge')
      ];
      [-0.78, 0.78].forEach(function (dx) {
        unfolded.push(kit.facets(new T.BoxGeometry(0.04, 0.024, 0.665), at(ux0 + dx, 0.634, back + 0.44), '--ctr-wool'));
        unfolded.push(kit.facets(new T.BoxGeometry(0.04, 0.3, 0.024), at(ux0 + dx, 0.42, back + 0.872), '--ctr-wool'));
      });
      unfolded.forEach(function (f) { kit.hide(f, true); });
      var throwIt = kit.press({
        say: function () { return kit.hidden(unfolded[0]) ? 'Unfold the throw over the seat' : 'Fold the throw up again'; },
        at: [kit.touch(2.2, 0.5, 0.9, at(ux0, 0.55, back + 0.5))],
        press: function () {
          var open = kit.hidden(unfolded[0]);
          unfolded.forEach(function (f) { kit.hide(f, !open); });
          folded.forEach(function (f) { kit.hide(f, open); });
          return open ? 'The throw is unfolded over the window seat and down its front, somewhere warm to sit under while you look out.'
                      : 'The throw is folded up again on the cushion, where it was.';
        } });

      // THE RIGHT-HAND CASEMENT under the transom: shut in its light, or
      // open out over the hill on a press. Both are drawn; one is put away.
      var sx0 = 0.86, sx1 = WIN.x1 - 0.02, sw = sx1 - sx0, shh = WIN.ys - WIN.y0 - 0.06, sy = WIN.y0 + shh / 2 + 0.01;
      var sash = function (m) {
        return [
          kit.facets(new T.BoxGeometry(sw, 0.05, 0.04), M(m, at(-sw / 2, shh / 2 - 0.025, 0)), '--ctr-ash'),
          kit.facets(new T.BoxGeometry(sw, 0.05, 0.04), M(m, at(-sw / 2, -shh / 2 + 0.025, 0)), '--ctr-ash'),
          kit.facets(new T.BoxGeometry(0.05, shh, 0.04), M(m, at(-0.025, 0, 0)), '--ctr-ash'),
          kit.facets(new T.BoxGeometry(0.05, shh, 0.04), M(m, at(-sw + 0.025, 0, 0)), '--ctr-ash'),
          kit.facets(new T.BoxGeometry(0.03, shh, 0.03), M(m, at(-sw / 2, 0, 0)), '--ctr-ash'),
          kit.facets(new T.BoxGeometry(0.03, 0.03, 0.05), M(m, at(-sw + 0.08, 0, 0.03)), '--ctr-grain')
        ];
      };
      var shut = sash(at(sx1, sy, back - 0.39));
      var open = sash(at(sx1, sy, back - 0.39, -1.15));
      open.forEach(function (f) { kit.hide(f, true); });
      var casement = kit.press({
        say: function () { return kit.hidden(open[0]) ? 'Open the casement' : 'Shut the casement'; },
        at: [kit.touch(sw, shh, 0.3, at(sx0 + sw / 2, sy, back - 0.3))],
        press: function () {
          var o = kit.hidden(open[0]);
          open.forEach(function (f) { kit.hide(f, !o); });
          shut.forEach(function (f) { kit.hide(f, o); });
          return o ? 'The right-hand casement is open, out over the hill. The light is just the same: north light, with no sun in it.'
                   : 'The right-hand casement is shut again.';
        } });

      // THE ROOM'S OWN PAGE on the left-hand wall by the window.
      var pw = 2.4, ph = pw * 800 / 1180, py = 0.55 + ph / 2;
      box(0.06, ph + 0.16, pw + 0.16, at(L + 0.03, py, -6.9), '--ctr-ash', 0.012);
      var frame = kit.screen(1180, 800, pw, at(L + 0.07, py, -6.9, LEFT), 'The Community Center’s own page, on the left-hand wall by the window');

      // ON THE LEFT-HAND WALL: Getting started, and how the radio works.
      var start = kit.lift(frame, '.ctr-part', { n: 0, w: 760, h: 900, ww: 1.6, m: at(L + 0.05, 0.5, -2.0, LEFT) });
      var radio = kit.lift(frame, '.ctr-part', { n: 2, w: 760, h: 900, ww: 1.6, m: at(L + 0.05, 0.5, -4.3, LEFT) });

      // ON THE RIGHT-HAND WALL: the house norms, the community service board
      // (the sorter of slots, every one a room that takes something in), the
      // pigeonholes beside it, and the covenant.
      var norms = kit.lift(frame, '.ctr-part', { n: 3, w: 760, h: 900, ww: 1.6, m: at(R - 0.05, 0.5, -1.9, RIGHT) });
      var board = kit.lift(frame, '.ctr-part', { n: 5, w: 1000, h: 1000, ww: 2.4, m: at(R - 0.05, 0.4, -4.5, RIGHT) });
      // The pigeonholes: an ash frame of hollows, a form in some of them, and
      // a label holder of the lit plaster under every one.
      var ph0 = at(R - 0.2, 0, -6.7, RIGHT);
      box(1.3, 1.2, 0.36, M(ph0, at(0, 1.3, 0)), '--ctr-ash', 0.015);
      for (var r = 0; r < 3; r++) {
        for (var c = 0; c < 4; c++) {
          box(0.26, 0.3, 0.06, M(ph0, at(-0.47 + c * 0.31, 1.0 + r * 0.36, 0.16)), '--ctr-hollow', false);
          if ((r + c) % 2 === 0) box(0.2, 0.22, 0.01, M(ph0, at(-0.47 + c * 0.31, 0.98 + r * 0.36, 0.2)), '--ctr-form', false);
          box(0.12, 0.03, 0.012, M(ph0, at(-0.47 + c * 0.31, 0.83 + r * 0.36, 0.185)), '--ctr-plate', 0.004);
        }
      }
      box(1.3, 0.04, 0.4, M(ph0, at(0, 0.68, 0.02)), '--ctr-grain', false);
      var covenant = kit.lift(frame, '.ctr-part', { n: 4, w: 700, h: 600, ww: 1.1, m: at(R - 0.05, 0.6, -7.95, RIGHT) });

      // THE FRONT DESK of pale ash by the door, with nobody behind it, and
      // whose this is standing on it, the grain running along its sides.
      var dk = at(-1.6, 0, -1.4, 0.35);
      box(1.6, 0.04, 0.7, M(dk, at(0, 0.76, 0)), '--ctr-ash', 0.015);
      box(1.6, 0.74, 0.05, M(dk, at(0, 0.37, -0.32)), '--ctr-ash', 0.012);
      [-1, 1].forEach(function (s) {
        box(0.05, 0.74, 0.7, M(dk, at(s * 0.78, 0.37, 0)), '--ctr-ash', 0.012);
        [0.2, 0.42, 0.6].forEach(function (gy) { box(0.054, 0.008, 0.6, M(dk, at(s * 0.78, gy, 0)), '--ctr-hollow', false); });
      });
      box(1.6, 0.03, 0.05, M(dk, at(0, 0.79, 0.33)), '--ctr-grain', false);
      var whose = kit.lift(frame, '.ctr-part', { n: 7, w: 700, h: 640, ww: 0.95, m: M(dk, at(0, 0.8, -0.2)) });

      // THE RADIO the lede puts on the front desk: an ash case, a grille in
      // the hollow, a dial of the lit plaster with its needle, two knobs, and
      // an aerial lying along its top until somebody pulls it up.
      var rd = M(dk, at(0.63, 0.78, -0.02));
      box(0.27, 0.17, 0.13, M(rd, at(0, 0.085, 0)), '--ctr-ash', 0.008);
      box(0.12, 0.11, 0.006, M(rd, at(-0.055, 0.085, 0.066)), '--ctr-hollow', false);
      for (var gs = 0; gs < 5; gs++) box(0.12, 0.006, 0.004, M(rd, at(-0.055, 0.04 + gs * 0.022, 0.071)), '--ctr-grain', false);
      kit.piece(new T.CircleGeometry(0.038, 24), M(rd, at(0.07, 0.11, 0.0665)), '--ctr-plate', false);
      box(0.004, 0.032, 0.003, M(rd, at(0.07, 0.115, 0.069, 0, 0, -0.5)), '--ctr-grain', false);
      [0.045, 0.095].forEach(function (kx) { cyl(0.014, 0.014, 0.02, M(rd, at(kx, 0.035, 0.074, 0, Math.PI / 2)), '--ctr-grain', false, 10); });
      var down = [kit.facets(new T.CylinderGeometry(0.005, 0.005, 0.24, 6), M(rd, at(-0.01, 0.177, -0.03, 0, 0, Math.PI / 2)), '--ctr-grain')];
      var up = [
        kit.facets(new T.CylinderGeometry(0.004, 0.006, 0.44, 6), M(rd, at(0.1, 0.39, -0.03, 0, 0, -0.18)), '--ctr-grain'),
        kit.facets(new T.SphereGeometry(0.011, 8, 6), M(rd, at(0.139, 0.607, -0.03)), '--ctr-grain')
      ];
      up.forEach(function (f) { kit.hide(f, true); });
      var aerial = kit.press({
        say: function () { return kit.hidden(up[0]) ? 'Pull the radio’s aerial up' : 'Push the radio’s aerial down'; },
        at: [kit.touch(0.4, 0.5, 0.3, M(rd, at(0, 0.2, 0)))],
        press: function () {
          var u2 = kit.hidden(up[0]);
          up.forEach(function (f) { kit.hide(f, !u2); });
          down.forEach(function (f) { kit.hide(f, u2); });
          return u2 ? 'The aerial on the desk’s radio is up. Signing on to the CB is on the room’s own page, at the front desk.'
                    : 'The aerial is pushed down and lies along the radio’s top again.';
        } });

      return {
        start: { x: 2.4, z: -0.8, yaw: 0.35 },
        bounds: { x: [L + 0.6, R - 0.6], z: [back + 1.35, -0.5] },
        stops: [
          { name: 'just inside the door, the window across the room', x: 2.4, z: -0.8, yaw: 0.35 },
          { name: 'at the window seat, looking out at the hillside in north light', x: 0, z: back + 1.6, yaw: 0, pitch: 0.05, acts: [casement, throwIt] },
          { name: 'by the throw on the window seat', x: -1.0, z: back + 1.6, yaw: 0, pitch: -0.32, acts: [throwIt, casement] },
          { name: 'at the plant on the sill', x: WIN.x1 - 0.6, z: back + 1.45, yaw: 0, pitch: -0.15, acts: [casement] },
          { name: 'at Getting started, on the left-hand wall', x: L + 2.0, z: -2.0, yaw: LEFT, frame: start.el },
          { name: 'at how the radio works, on the left-hand wall', x: L + 2.0, z: -4.3, yaw: LEFT, frame: radio.el },
          { name: 'at the left-hand wall by the window, with the room’s own page on it', x: L + 2.6, z: -6.9, yaw: LEFT, page: kit.page, frame: frame },
          { name: 'at the house norms, on the right-hand wall', x: R - 2.0, z: -1.9, yaw: RIGHT, frame: norms.el },
          { name: 'at the community service board, a slot for every room that takes something in', x: R - 2.6, z: -4.5, yaw: RIGHT, frame: board.el },
          { name: 'at the pigeonholes beside the board', x: R - 1.7, z: -6.7, yaw: RIGHT, pitch: -0.05 },
          { name: 'at the covenant, by the window', x: R - 1.6, z: -7.7, yaw: RIGHT, frame: covenant.el },
          { name: 'at the front desk by the door, with nobody behind it', x: -1.2, z: -0.6, yaw: 0.35, pitch: -0.3, frame: whose.el, acts: [aerial] },
          { name: 'at the radio on the front desk', x: -0.75, z: -0.85, yaw: 0.2, pitch: -0.45, acts: [aerial] },
          { name: 'by the peg rail at the door', x: 1.4, z: -1.6, yaw: Math.PI, pitch: -0.05 }
        ]
      };
    }
  };
})();

/* =============================================================================
   Vital Plant Living, walked into on Cel Street. Ryan's ask, 2026-10-31: back
   on the street, working down it a room at a time.

   IT IS THE KITCHEN'S WORLD AND NOBODY ELSE'S (§50): a plant-based kitchen
   DRAWN CUT THROUGH THE MIDDLE. Every other room on the street is seen at eye
   level, as a plan or as a model; this one is a section, the way a cook
   sketches a dish to show what is in it. So the bowl on the island is cut in
   half and you see every layer sitting on the one under it, the sauce running
   down into the rice and the rice holding it up; the wraps are cut through and
   show their rings; the pots on the counter are cut open, the soil and what
   grows under it showing. EVERYTHING TOUCHES, AND THAT IS THE ROOM: nothing
   here sits in a well of its own with room round it, which would be Samefood
   Cafe with the lid off.

   A SECTION HAS NO LIGHT IN IT. The room is lit evenly from everywhere, sky and
   ground the same, so nothing has a lit face or a shadow side and every cut
   face is shown at full colour: a diagram, not a place lit by a flame or a
   window. The wall is turmeric, which is a spice and not a light; the green is
   the leaves'. NO RED IN THE ROOM'S OWN CLOTHES: a turmeric wall with green on
   it and a red accent would be wearing the Rastafari colours, on the page
   that decided not to wear the Rastafari name. Nothing here is drawn in the
   one food red.

   THE DECOR IS THE LARDER. The shelf of pots over the counter is the page's
   own drawing, lifted off it, every pot something in Ryan's pantry; the three
   pots cut open on the counter are three of the same (scallions, garlic,
   carrots). THE BUILDER, THE PASS AND THE BOARD ARE THE PAGE'S OWN, lifted off
   it and worked by vital.js, which the page loads: tick what goes in and the
   pass draws your bowl cut through the middle and writes the ticket; a combo
   off the board loads into the builder; copying puts the ticket on your own
   clipboard and nowhere else. The stereo and the telly's month of plant-based
   cooks are the page's too, rack.js putting a video up on the telly; nothing
   plays until a press. No dish is called Ital.

   NOTHING MOVES. Every colour is one the room declares, by name. It keeps
   nothing, sends nothing and fetches nothing; its page arrives through Cel
   Street's screen(), on the front wall. tools/make-cel-street.py holds each of
   those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['vital-plant-living.html'] = {
    name: 'Vital Plant Living',
    faces: ['Bagel Fat One'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var W = 11, D = 12, H = 3.2, back = -D;
      var L = -W / 2, R = W / 2;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;

      // NO LIGHT IN A SECTION: the same from above and below, so nothing has a
      // lit face and every cut face is at its own colour.
      kit.scene.background = kit.col('--vpl-wall');
      kit.scene.add(new T.HemisphereLight(kit.col('--vpl-bowl'), kit.col('--vpl-bowl'), Math.PI));

      // THE ROOM: turmeric walls, a pale floor and ceiling, the door behind you.
      box(W + 0.4, 0.1, D + 0.4, at(0, -0.05, back / 2), '--vpl-chip', false, false);
      box(W + 0.4, 0.14, D + 0.4, at(0, H + 0.07, back / 2), '--vpl-panel', false, false);
      box(0.3, H, D, at(L - 0.15, H / 2, back / 2), '--vpl-wall', 0.02);
      box(0.3, H, D, at(R + 0.15, H / 2, back / 2), '--vpl-wall', 0.02);
      box(W + 0.6, H, 0.3, at(0, H / 2, back - 0.15), '--vpl-wall', 0.02);
      box(W + 0.6, H, 0.3, at(0, H / 2, 0.15), '--vpl-wall', 0.02);
      box(1.0, 2.1, 0.06, at(0, 1.05, -0.02), '--vpl-leaf', 0.015);
      cyl(0.035, 0.035, 0.06, at(0.36, 1.0, -0.07, 0, Math.PI / 2), '--vpl-ink', false, 10);
      // A line of ink where every wall meets the floor, as the page outlines things.
      [[0, back + 0.01, W, 0], [0, -0.01, W, 0], [L + 0.01, back / 2, D, LEFT], [R - 0.01, back / 2, D, LEFT]].forEach(function (s) {
        box(s[2], 0.05, 0.02, at(s[0], 0.025, s[1], s[3]), '--vpl-ink', false, false);
        box(s[2], 0.05, 0.02, at(s[0], H - 0.025, s[1], s[3]), '--vpl-ink', false, false);
      });

      // A SECTION, DRAWN: a shape filled flat in one ink, laid on the cut, and
      // each layer of food laid on an ink plate a hair larger, so every layer
      // has its line round it and still touches the one under it.
      function shape(pts) {
        var s = new T.Shape();
        s.moveTo(pts[0][0], pts[0][1]);
        for (var i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
        s.closePath();
        return new T.ShapeGeometry(s);
      }
      // The band of a circle of radius r between heights a and b (both <= r),
      // its sides following the circle, the way a layer sits in a bowl.
      function band(r, a, b, wob) {
        var pts = [], n = 18, i, y;
        for (i = 0; i <= n; i++) { y = a + (b - a) * i / n; pts.push([-Math.sqrt(Math.max(0, r * r - y * y)), y]); }
        for (i = 0; i <= n; i++) {
          var x = -Math.sqrt(Math.max(0, r * r - b * b)) + 2 * Math.sqrt(Math.max(0, r * r - b * b)) * i / n;
          pts.push([x, b + (wob ? wob(i / n) : 0)]);
        }
        for (i = n; i >= 0; i--) { y = a + (b - a) * i / n; pts.push([Math.sqrt(Math.max(0, r * r - y * y)), y]); }
        return pts;
      }

      // THE ISLAND in the middle, and on it the bowl and the wraps.
      var IX = 0, IZ = -6.4, TOP = 0.9;
      box(2.2, 0.06, 1.1, at(IX, TOP - 0.03, IZ), '--vpl-panel', 0.015);
      box(2.0, TOP - 0.06, 0.9, at(IX, (TOP - 0.06) / 2, IZ), '--vpl-ink-2', 0.015);

      // THE BOWL, CUT THROUGH THE MIDDLE. The back half of the bowl stands on
      // the island; the cut is square to the door, so you look straight at it.
      var BR = 0.42, BT = 0.035, bx = IX - 0.4, bz = IZ;
      var by = TOP + BR;                       // the rim's height; the bowl's centre
      var bowl = at(bx, by, bz);
      // Its outside, and its inside showing over the food (drawn turned inside out).
      kit.piece(new T.SphereGeometry(BR, 40, 14, Math.PI, Math.PI, Math.PI / 2, Math.PI / 2), bowl, '--vpl-bowl', 0.012);
      var inner = new T.SphereGeometry(BR - BT, 40, 14, Math.PI, Math.PI, Math.PI / 2, Math.PI / 2);
      inner.scale(-1, 1, 1);
      kit.flat(inner, bowl, '--vpl-bowl');
      kit.cyl(0.14, 0.17, 0.05, at(bx, TOP + 0.025, bz - 0.06), '--vpl-bowl', 0.01, 24);
      // The cut face: the bowl's wall in section, and the food in layers in it.
      var cut = M(bowl, at(0, 0, 0.002));
      kit.flat(new T.RingGeometry(BR - BT - 0.006, BR + 0.006, 48, 1, Math.PI, Math.PI), M(bowl, at(0, 0, 0.001)), '--vpl-ink');
      kit.flat(new T.RingGeometry(BR - BT + 0.004, BR - 0.004, 48, 1, Math.PI, Math.PI), cut, '--vpl-bowl');
      var r = BR - BT, FILL = -0.04;
      kit.flat(shape(band(r, -r, FILL)), M(bowl, at(0, 0, 0.001)), '--vpl-ink');
      // Rice at the bottom, beans on the rice, greens on the beans, roasted
      // squash on the greens: each sitting on the one under it.
      var LAYERS = [
        { a: -r, b: -0.2, ink: '--vpl-f-rice' },
        { a: -0.2, b: -0.13, ink: '--vpl-f-bean' },
        { a: -0.13, b: -0.08, ink: '--vpl-f-green' },
        { a: -0.08, b: FILL, ink: '--vpl-f-orange' }
      ];
      LAYERS.forEach(function (l) {
        kit.flat(shape(band(r - 0.006, l.a + 0.006, l.b - 0.004)), cut, l.ink);
      });
      // Grains in the rice, beans in their layer: a few flecks on the cut.
      for (var g = 0; g < 26; g++) {
        var gx = -0.3 + (g * 0.0231) % 0.6, gy = -0.36 + (g * 0.017) % 0.12;
        if (gx * gx + gy * gy < (r - 0.03) * (r - 0.03)) kit.flat(new T.CircleGeometry(0.01, 6), M(cut, at(gx, gy, 0.002)), '--vpl-f-tan');
      }
      for (g = 0; g < 9; g++) kit.flat(new T.CircleGeometry(0.018, 8), M(cut, at(-0.28 + g * 0.07, -0.165, 0.002)), '--vpl-f-brown');
      // THE SAUCE, RUNNING DOWN INTO THE RICE: it comes off the top, slips down
      // between the layers and pools in the rice, laid over the cut in front.
      var SAUCE = [[-0.3, 0.1], [-0.12, 0.17], [0.06, 0.2], [0.24, 0.12]];
      kit.flat(shape([[-r + 0.04, FILL + 0.01], [r - 0.04, FILL + 0.01], [r - 0.06, FILL - 0.02], [-r + 0.06, FILL - 0.02]]), M(cut, at(0, 0, 0.003)), '--vpl-f-oil');
      SAUCE.forEach(function (s) {
        var x = s[0], d = s[1];
        kit.flat(shape([[x - 0.025, FILL - 0.015], [x + 0.025, FILL - 0.015], [x + 0.014, FILL - d], [x, FILL - d - 0.025], [x - 0.014, FILL - d]]), M(cut, at(0, 0, 0.004)), '--vpl-f-oil');
      });
      // The top of the food behind the cut, and the pile on it.
      kit.flat(new T.CircleGeometry(Math.sqrt(r * r - FILL * FILL), 40, Math.PI, Math.PI), M(bowl, at(0, FILL, 0, 0, -Math.PI / 2)), '--vpl-f-green');
      var pile = new T.SphereGeometry(0.3, 32, 10, Math.PI, Math.PI, 0, Math.PI / 2);
      pile.scale(1, 0.62, 1);
      kit.piece(pile, M(bowl, at(0, FILL, 0)), '--vpl-f-green', 0.01);
      // The pile in section: greens, with chickpeas, carrot rounds and sprouts
      // in it, all touching.
      var pp = [], k;
      for (k = 0; k <= 24; k++) { var t = Math.PI * k / 24; pp.push([-0.3 * Math.cos(t), FILL + 0.186 * Math.sin(t)]); }
      kit.flat(shape(pp.map(function (p) { return [p[0] * 1.03, FILL + (p[1] - FILL) * 1.05]; })), M(cut, at(0, 0, 0.001)), '--vpl-ink');
      kit.flat(shape(pp), M(cut, at(0, 0, 0.002)), '--vpl-f-green');
      [[-0.18, FILL + 0.05, '--vpl-f-tan'], [-0.08, FILL + 0.1, '--vpl-f-tan'], [0.06, FILL + 0.06, '--vpl-f-tan'],
       [0.17, FILL + 0.07, '--vpl-f-orange'], [-0.02, FILL + 0.035, '--vpl-f-orange'], [0.1, FILL + 0.13, '--vpl-f-plum']].forEach(function (c) {
        kit.flat(new T.CircleGeometry(0.036, 14), M(cut, at(c[0], c[1], 0.003)), '--vpl-ink');
        kit.flat(new T.CircleGeometry(0.03, 14), M(cut, at(c[0], c[1], 0.004)), c[2]);
      });
      for (k = 0; k < 7; k++) {
        var sx = -0.15 + k * 0.05;
        kit.flat(new T.PlaneGeometry(0.008, 0.07), M(cut, at(sx, FILL + 0.19 + (k % 2) * 0.012, 0.003, 0, 0, (k - 3) * 0.12)), '--vpl-f-sprout');
      }
      // Chickpeas and carrot rounds on the pile behind the cut, touching it.
      [[-0.14, 0.13, -0.12], [0.02, 0.17, -0.08], [0.15, 0.1, -0.15], [-0.05, 0.12, -0.2]].forEach(function (c, i) {
        kit.piece(new T.SphereGeometry(0.04, 10, 8), M(bowl, at(c[0], FILL + c[1], c[2])), i % 2 ? '--vpl-f-tan' : '--vpl-f-orange', 0.006);
      });

      // THE WRAPS, CUT IN HALF, lying side by side and touching, their cut ends
      // to you: the flatbread round the outside and the filling in rings.
      var WR = 0.11, WL = 0.46;
      [IX + 0.48, IX + 0.71].forEach(function (x, i) {
        var wz = IZ + 0.05 - i * 0.04;
        var wrap = at(x, TOP + WR, wz, 0, Math.PI / 2);
        kit.piece(new T.CylinderGeometry(WR, WR, WL, 28), wrap, '--vpl-f-paper', 0.008);
        var end = at(x, TOP + WR, wz + WL / 2 + 0.002);
        var RINGS = [[WR, '--vpl-ink'], [WR - 0.006, '--vpl-f-paper'], [WR - 0.018, '--vpl-ink'], [WR - 0.022, i ? '--vpl-f-green' : '--vpl-f-sprout'],
                     [WR - 0.044, '--vpl-ink'], [WR - 0.048, '--vpl-f-rice'], [WR - 0.072, '--vpl-ink'], [WR - 0.076, i ? '--vpl-f-bean' : '--vpl-f-tan']];
        RINGS.forEach(function (rg, j) { kit.flat(new T.CircleGeometry(rg[0], 28), M(end, at(0, 0, j * 0.0006)), rg[1]); });
        // The sauce, in a curl through the filling.
        kit.flat(new T.RingGeometry(WR - 0.05, WR - 0.042, 20, 1, 0.3, 2.6), M(end, at(0, 0, 0.006)), '--vpl-f-oil');
      });
      // The board under them.
      box(0.7, 0.03, 0.62, at(IX + 0.6, TOP + 0.015, IZ), '--vpl-f-tan', 0.008);

      // THE COUNTER along the back wall, and the shelf of pots over it: the
      // page's own drawing, every pot something in the pantry, cut open.
      box(8.0, 0.88, 0.7, at(0, 0.44, back + 0.35), '--vpl-panel', 0.015);
      box(8.1, 0.05, 0.76, at(0, 0.905, back + 0.38), '--vpl-chip', 0.012);

      // THE PAGE ITSELF, on the front wall left of the door, facing in.
      var pw = 2.3, ph = pw * 800 / 1180, py = 0.55 + ph / 2;
      box(pw + 0.2, ph + 0.2, 0.06, at(-3.2, py, -0.03, Math.PI), '--vpl-ink');
      var frame = kit.screen(1180, 800, pw, at(-3.2, py, -0.08, Math.PI), 'Vital Plant Living’s own page, on the front wall by the door');

      kit.lift(frame, '.vpl-art', { bare: true, w: 1000, ww: 4.4, m: at(0, 1.2, back + 0.05) });
      var sign = kit.paper(900, 130, function (c, w, h) {
        c.fillStyle = kit.ink('--vpl-panel'); c.fillRect(0, 0, w, h);
        c.strokeStyle = kit.ink('--vpl-ink'); c.lineWidth = 8; c.strokeRect(4, 4, w - 8, h - 8);
        c.fillStyle = kit.ink('--vpl-ink');
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.font = "78px 'Bagel Fat One'";
        c.fillText('Vital Plant Living', w / 2, h / 2 + 4);
      });
      kit.sheet(sign, 3.0, 0.43, at(0, 2.78, back + 0.06));

      // THREE POTS CUT OPEN on the end of the counter, three things the pantry
      // keeps and the shelf above has too: scallions with their white bulbs in
      // the soil, a garlic bulb with its cloves, and carrots going down.
      var PT = 0.92;
      function pot(x, kind) {
        var z = back + 0.42, P = at(x, PT, z), r0 = 0.12, r1 = 0.155, h = 0.3;
        // The back half of the pot, and its soil, behind the cut.
        kit.piece(new T.CylinderGeometry(r1, r0, h, 28, 1, true, Math.PI / 2, Math.PI), M(P, at(0, h / 2, 0)), '--vpl-pot', 0.008);
        kit.flat(new T.CircleGeometry(r1 - 0.012, 28, Math.PI, Math.PI), M(P, at(0, h - 0.03, 0, 0, -Math.PI / 2)), '--vpl-soil');
        // The cut: the pot's wall either side, the soil between, what grows in it.
        var C = M(P, at(0, 0, 0.002));
        kit.flat(shape([[-r1 - 0.006, h + 0.004], [r1 + 0.006, h + 0.004], [r0 + 0.006, -0.004], [-r0 - 0.006, -0.004]]), M(P, at(0, 0, 0.001)), '--vpl-ink');
        kit.flat(shape([[-r1, h], [r1, h], [r0, 0], [-r0, 0]]), C, '--vpl-pot');
        kit.flat(shape([[-r1 + 0.016, h - 0.03], [r1 - 0.016, h - 0.03], [r0 - 0.014, 0.016], [-r0 + 0.014, 0.016]]), M(C, at(0, 0, 0.001)), '--vpl-soil');
        var U = M(C, at(0, 0, 0.003));
        if (kind === 'scallions') {
          [-0.06, 0, 0.06].forEach(function (sx2) {
            kit.flat(new T.CircleGeometry(0.022, 12), M(U, at(sx2, h - 0.1, 0)), '--vpl-f-rice');
            kit.flat(new T.PlaneGeometry(0.008, 0.06), M(U, at(sx2, h - 0.15, 0)), '--vpl-f-paper');
            kit.flat(new T.PlaneGeometry(0.012, 0.26), M(P, at(sx2, h + 0.1, 0.003)), '--vpl-leaf');
            kit.cyl(0.006, 0.008, 0.26, M(P, at(sx2, h + 0.1, -0.03)), '--vpl-leaf', false, 6);
          });
        }
        if (kind === 'garlic') {
          kit.flat(new T.CircleGeometry(0.06, 20), M(U, at(0, h - 0.12, 0)), '--vpl-f-paper');
          [-0.032, 0, 0.032].forEach(function (cx) { kit.flat(new T.PlaneGeometry(0.004, 0.09), M(U, at(cx, h - 0.12, 0.001)), '--vpl-ink-2'); });
          [-0.02, 0.02].forEach(function (sx2, i) {
            kit.flat(new T.PlaneGeometry(0.012, 0.2), M(P, at(sx2, h + 0.07, 0.003, 0, 0, i ? -0.15 : 0.15)), '--vpl-leaf');
          });
        }
        if (kind === 'carrots') {
          [-0.05, 0.05].forEach(function (cx) {
            kit.flat(shape([[cx - 0.027, h - 0.026], [cx + 0.027, h - 0.026], [cx, h - 0.25]]), U, '--vpl-ink');
            kit.flat(shape([[cx - 0.02, h - 0.032], [cx + 0.02, h - 0.032], [cx, h - 0.235]]), M(U, at(0, 0, 0.001)), '--vpl-f-orange');
            [-0.04, 0, 0.04].forEach(function (a) {
              kit.flat(new T.PlaneGeometry(0.006, 0.18), M(P, at(cx, h + 0.08, 0.003, 0, 0, a * 3)), '--vpl-leaf');
              kit.piece(new T.ConeGeometry(0.03, 0.08, 6), M(P, at(cx + a * 1.4, h + 0.18, -0.02)), '--vpl-leaf', false);
            });
          });
        }
      }
      pot(2.3, 'scallions'); pot(2.9, 'garlic'); pot(3.5, 'carrots');

      /* ── THE SECOND PASS: a kitchen somebody cooks in ─────────────────────
         Everything added here is the room's own rule again: cut through the
         middle where there is an inside to show, round and piled where there
         is not, every thing touching the next, nothing in a well of its own,
         no ruled grid between two ingredients (that is the Guild), no flame
         and nothing cooking (that is a warm room), and no red in the room's
         own clothes: a chili may be red, because it is food. Every food is
         something in Ryan's pantry. */
      var ROUND = function (rad, seg) { return new T.SphereGeometry(rad, seg || 12, 9); };
      var DISC = function (rad) { return new T.CircleGeometry(rad, 18); };
      // A food cut in half and lying on its cut: ink rim, flesh, and what is
      // inside it at the middle.
      function halved(m, rad, skin, flesh, heart, heartR) {
        var dome = new T.SphereGeometry(rad, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        kit.piece(dome, M(m, at(0, 0, 0, 0, Math.PI)), skin, 0.006);
        kit.flat(DISC(rad + 0.004), M(m, at(0, 0.001, 0, 0, -Math.PI / 2)), '--vpl-ink');
        kit.flat(DISC(rad - 0.004), M(m, at(0, 0.002, 0, 0, -Math.PI / 2)), flesh);
        if (heart) kit.flat(DISC(heartR || rad * 0.4), M(m, at(0, 0.003, 0, 0, -Math.PI / 2)), heart);
      }

      // THE COUNTER'S FRONT: cupboard doors with rounded knobs, the ink line
      // round each the page's own way of outlining a thing, and a skirting.
      for (var cd = 0; cd < 8; cd++) {
        var cx0 = -3.5 + cd;
        box(0.9, 0.66, 0.02, at(cx0, 0.47, back + 0.71), '--vpl-chip', 0.008);
        kit.piece(ROUND(0.035, 10), at(cx0 + (cd % 2 ? -0.34 : 0.34), 0.66, back + 0.73), '--vpl-ink-2', false);
      }
      box(8.0, 0.1, 0.04, at(0, 0.05, back + 0.72), '--vpl-ink-2', false);

      // ON THE COUNTER'S LEFT END: a board with a knife on it, an onion and a
      // lemon cut in half on their cuts, a heap of chopped scallion against
      // them, a mortar with its pestle, and a crock of wooden spoons, all
      // pushed together.
      var CT = 0.93, CZ = back + 0.4;
      box(0.9, 0.04, 0.42, at(-3.25, CT + 0.02, CZ, 0.08), '--vpl-f-tan', 0.008);
      box(0.32, 0.012, 0.05, at(-3.32, CT + 0.05, CZ + 0.12, 0.25), '--vpl-ink-2', false);
      box(0.13, 0.02, 0.04, at(-3.52, CT + 0.05, CZ + 0.16, 0.25), '--vpl-ink', false);
      halved(at(-3.05, CT + 0.04, CZ - 0.04), 0.07, '--vpl-f-plum', '--vpl-f-paper', '--vpl-f-plum', 0.02);
      halved(at(-2.93, CT + 0.04, CZ + 0.05), 0.055, '--vpl-f-gold', '--vpl-f-oil', '--vpl-f-paper', 0.012);
      for (var ch = 0; ch < 14; ch++) {
        kit.piece(new T.CylinderGeometry(0.012, 0.012, 0.012, 8), at(-3.38 + (ch % 5) * 0.026, CT + 0.05 + Math.floor(ch / 5) * 0.012, CZ - 0.08 + (ch % 3) * 0.02), ch % 3 ? '--vpl-f-green' : '--vpl-f-sprout', false);
      }
      kit.cyl(0.11, 0.08, 0.13, at(-3.9, CT + 0.065, CZ), '--vpl-f-paper', 0.01, 18);
      kit.cyl(0.02, 0.03, 0.2, at(-3.87, CT + 0.17, CZ + 0.02, 0, 0, -0.5), '--vpl-f-tan', 0.006, 8);
      kit.cyl(0.08, 0.07, 0.17, at(-2.62, CT + 0.085, CZ - 0.05), '--vpl-pot', 0.01, 16);
      [[-0.03, 0.02, 0.15], [0.02, -0.02, -0.1], [0.0, 0.03, 0.02]].forEach(function (s, i) {
        kit.cyl(0.008, 0.008, 0.36, at(-2.62 + s[0], CT + 0.3, CZ - 0.05 + s[1], 0, s[2], s[2] * 0.6), '--vpl-f-tan', false, 6);
        kit.piece(new T.SphereGeometry(0.03, 10, 6), at(-2.62 + s[0] + s[2] * 0.2, CT + 0.48, CZ - 0.05 + s[1]), '--vpl-f-tan', 0.004);
      });

      // THE FRIDGE, in the back left corner against the counter, CUT THROUGH:
      // its shell, its shelves, and on every shelf the pantry's fresh things
      // piled against each other right out to the cut.
      var FX = -4.75, FW = 1.4, FH = 2.2, FD = 0.62, FZ = back + FD / 2;
      box(FW, FH, 0.06, at(FX, FH / 2, back + 0.03), '--vpl-bowl', 0.01);
      box(0.06, FH, FD, at(FX - FW / 2 + 0.03, FH / 2, FZ), '--vpl-bowl', 0.01);
      box(0.06, FH, FD, at(FX + FW / 2 - 0.03, FH / 2, FZ), '--vpl-bowl', 0.01);
      box(FW, 0.08, FD, at(FX, FH - 0.04, FZ), '--vpl-bowl', 0.01);
      box(FW, 0.16, FD, at(FX, 0.08, FZ), '--vpl-bowl', 0.01);
      box(FW - 0.12, FH - 0.24, 0.02, at(FX, FH / 2, back + 0.07), '--vpl-panel', false);
      // The ink of the cut, round the shell's edge where it was sliced.
      [[FX, FH - 0.004, FW + 0.02, 0.02], [FX, 0.004, FW + 0.02, 0.02]].forEach(function (b) { box(b[2], b[3], 0.01, at(b[0], b[1], back + FD + 0.005), '--vpl-ink', false); });
      [FX - FW / 2 + 0.01, FX + FW / 2 - 0.01].forEach(function (x) { box(0.02, FH, 0.01, at(x, FH / 2, back + FD + 0.005), '--vpl-ink', false); });
      var SHELVES = [0.62, 1.1, 1.56];
      SHELVES.forEach(function (y) { box(FW - 0.12, 0.025, FD - 0.06, at(FX, y, FZ), '--vpl-bowl', 0.006); });
      // The bottom: a drawer of greens and broccoli heaped to the top.
      for (var q = 0; q < 16; q++) {
        var qx = FX - 0.55 + (q % 8) * 0.155, qy = 0.24 + Math.floor(q / 8) * 0.13, qz = FZ + ((q * 7) % 5 - 2) * 0.05;
        kit.piece(ROUND(0.09 + (q % 3) * 0.015, 10), at(qx, qy, qz), q % 4 === 1 ? '--vpl-f-sprout' : '--vpl-f-green', 0.008);
      }
      // The first shelf: avocados and limes, one avocado cut on its cut face.
      for (q = 0; q < 6; q++) kit.piece(ROUND(0.075, 12), at(FX - 0.5 + q * 0.17, SHELVES[0] + 0.085, FZ + (q % 2 ? 0.08 : -0.07)), q % 2 ? '--vpl-f-sprout' : '--vpl-f-green', 0.007);
      halved(at(FX + 0.5, SHELVES[0] + 0.085, FZ + 0.12, 0, Math.PI / 2), 0.075, '--vpl-f-green', '--vpl-f-sprout', '--vpl-f-brown', 0.03);
      // The second: tofu in its block, a tub of hummus, lemons and mandarins.
      box(0.22, 0.11, 0.16, at(FX - 0.47, SHELVES[1] + 0.07, FZ), '--vpl-f-paper', 0.008);
      kit.cyl(0.1, 0.1, 0.1, at(FX - 0.22, SHELVES[1] + 0.065, FZ + 0.03), '--vpl-f-tan', 0.008, 16);
      for (q = 0; q < 5; q++) kit.piece(ROUND(0.07, 12), at(FX + 0.0 + q * 0.13, SHELVES[1] + 0.08, FZ + (q % 2 ? 0.1 : -0.04)), q % 2 ? '--vpl-f-orange' : '--vpl-f-gold', 0.007);
      // The third: a jar of kimchi cut through, and berries heaped in a bowl.
      jar(FX - 0.38, SHELVES[2] + 0.015, FZ + 0.06, 0.24, 0.32, [['--vpl-f-orange', 0.5], ['--vpl-f-red', 0.2], ['--vpl-f-orange', 0.3]]);
      kit.cyl(0.17, 0.11, 0.09, at(FX + 0.15, SHELVES[2] + 0.06, FZ), '--vpl-bowl', 0.008, 18);
      for (q = 0; q < 14; q++) kit.piece(ROUND(0.028, 8), at(FX + 0.15 + Math.cos(q * 2.4) * (0.03 + (q % 4) * 0.03), SHELVES[2] + 0.12 + (q % 3) * 0.02, FZ + Math.sin(q * 2.4) * (0.03 + (q % 4) * 0.025)), q % 3 ? '--vpl-f-plum' : '--vpl-f-bean', false);
      kit.piece(ROUND(0.06, 10), at(FX + 0.47, SHELVES[2] + 0.075, FZ + 0.06), '--vpl-f-gold', 0.006);

      // A JAR, CUT THROUGH: the back half of its glass, and on the cut the
      // dry goods in it, each layer lying on the one under it.
      function jar(x, y, z, w, h, layers) {
        var J = at(x, y, z);
        kit.piece(new T.CylinderGeometry(w / 2, w / 2, h, 20, 1, true, Math.PI / 2, Math.PI), M(J, at(0, h / 2, 0)), '--vpl-panel', 0.006);
        kit.cyl(w / 2 + 0.01, w / 2 + 0.01, 0.04, M(J, at(0, h + 0.02, 0)), '--vpl-f-tan', 0.006, 20);
        var C = M(J, at(0, 0, 0.002));
        kit.flat(shape([[-w / 2 - 0.006, h + 0.004], [w / 2 + 0.006, h + 0.004], [w / 2 + 0.006, -0.004], [-w / 2 - 0.006, -0.004]]), M(J, at(0, 0, 0.001)), '--vpl-ink');
        kit.flat(shape([[-w / 2, h], [w / 2, h], [w / 2, 0], [-w / 2, 0]]), C, '--vpl-panel');
        var y0 = 0.01, room = h * 0.86;
        layers.forEach(function (l) {
          var t2 = room * l[1];
          // a layer's top is a little heaped, never ruled straight
          kit.flat(shape([[-w / 2 + 0.01, y0], [w / 2 - 0.01, y0], [w / 2 - 0.01, y0 + t2 - 0.01], [w / 4, y0 + t2 + 0.006], [-w / 4, y0 + t2 - 0.004], [-w / 2 + 0.01, y0 + t2]]), M(C, at(0, 0, 0.001)), l[0]);
          y0 += t2;
        });
      }

      // THE PANTRY SHELF in the back right corner, tall and open, cut through
      // like everything else: on every shelf the jars of what is dry in the
      // pantry, cut open, shoulder to shoulder.
      var PX = 4.75, PW = 1.4, PD = 0.36, PZ = back + PD / 2, PH = 2.3;
      [PX - PW / 2 + 0.03, PX + PW / 2 - 0.03].forEach(function (x) { box(0.05, PH, PD, at(x, PH / 2, PZ), '--vpl-f-tan', 0.008); });
      box(PW, PH, 0.03, at(PX, PH / 2, back + 0.015), '--vpl-chip', false);
      var PSH = [0.12, 0.62, 1.12, 1.62, 2.12];
      PSH.forEach(function (y) { box(PW, 0.04, PD, at(PX, y, PZ), '--vpl-f-tan', 0.008); });
      var DRY = [
        [['--vpl-f-rice', 1]], [['--vpl-f-bean', 0.6], ['--vpl-f-tan', 0.4]], [['--vpl-f-orange', 0.7], ['--vpl-f-gold', 0.3]], [['--vpl-f-tan', 1]],
        [['--vpl-f-paper', 0.5], ['--vpl-f-rice', 0.5]], [['--vpl-f-brown', 1]], [['--vpl-f-gold', 0.8], ['--vpl-f-brown', 0.2]], [['--vpl-f-bean', 1]],
        [['--vpl-f-sprout', 0.4], ['--vpl-f-tan', 0.6]], [['--vpl-f-rice', 0.7], ['--vpl-f-oil', 0.3]], [['--vpl-f-plum', 1]], [['--vpl-f-gold', 1]]
      ];
      for (var sh = 0; sh < 3; sh++) {
        for (var jj = 0; jj < 4; jj++) {
          var tall = 0.26 + ((sh + jj) % 3) * 0.06;
          jar(PX - 0.47 + jj * 0.31, PSH[sh + 1] + 0.02, PZ + 0.02, 0.27, tall, DRY[(sh * 4 + jj) % DRY.length]);
        }
      }
      // The lowest shelf: a basket of potatoes and onions heaped on the floor.
      box(1.2, 0.18, PD - 0.04, at(PX, 0.24, PZ + 0.02), '--vpl-f-tan', 0.008);
      for (q = 0; q < 11; q++) kit.piece(ROUND(0.075, 10), at(PX - 0.5 + (q % 6) * 0.2, 0.36 + Math.floor(q / 6) * 0.08, PZ + (q % 2 ? 0.06 : -0.05)), q % 3 ? '--vpl-f-gold' : '--vpl-f-plum', 0.007);

      // THE ISLAND, lived at: a round woven rug under it in rings, a stool at
      // each end pushed in against it, and over it a rack hung with pans,
      // bunches of herbs and a braid of garlic.
      [[1.9, '--vpl-f-tan'], [1.75, '--vpl-f-gold'], [1.45, '--vpl-f-tan'], [1.25, '--vpl-f-oil'], [0.95, '--vpl-f-tan']].forEach(function (rg, i) {
        kit.flat(new T.CircleGeometry(rg[0], 48), at(IX, 0.004 + i * 0.001, IZ, 0, -Math.PI / 2), rg[1]);
      });
      [-1, 1].forEach(function (s) {
        var sx = IX + s * 1.33;
        kit.cyl(0.21, 0.21, 0.06, at(sx, 0.74, IZ), '--vpl-f-tan', 0.012, 20);
        kit.cyl(0.2, 0.2, 0.03, at(sx, 0.785, IZ), '--vpl-f-gold', false, 20);
        [0, 1, 2, 3].forEach(function (l) {
          var a = l * Math.PI / 2 + 0.6;
          kit.cyl(0.018, 0.022, 0.72, at(sx + Math.cos(a) * 0.14, 0.36, IZ + Math.sin(a) * 0.14, 0, Math.cos(a) * 0.08, -Math.sin(a) * 0.08), '--vpl-ink-2', false, 6);
        });
        box(0.3, 0.02, 0.02, at(sx, 0.28, IZ), '--vpl-ink-2', false);
      });
      var RY = 3.0;
      box(1.9, 0.05, 0.05, at(IX, RY, IZ), '--vpl-ink-2', 0.008);
      [-0.9, 0.9].forEach(function (x) { kit.cyl(0.01, 0.01, H - RY, at(IX + x, (H + RY) / 2, IZ), '--vpl-ink', false, 6); });
      [[-0.7, 'pan'], [-0.38, 'herb'], [-0.12, 'pan'], [0.18, 'garlic'], [0.44, 'pan'], [0.72, 'herb']].forEach(function (h) {
        var hx = IX + h[0];
        kit.piece(new T.TorusGeometry(0.03, 0.006, 6, 12), at(hx, RY - 0.03, IZ, 0, 0, 0), '--vpl-ink', false);
        if (h[1] === 'pan') {
          var pr = 0.14 + (Math.abs(h[0] * 10) % 3) * 0.03;
          box(0.025, 0.12, 0.012, at(hx, RY - 0.1, IZ), '--vpl-ink', false);
          kit.cyl(pr, pr, 0.035, at(hx, RY - 0.16 - pr, IZ, 0, Math.PI / 2), '--vpl-ink', 0.006, 22);
          kit.cyl(pr - 0.025, pr - 0.025, 0.037, at(hx, RY - 0.16 - pr, IZ, 0, Math.PI / 2), '--vpl-ink-2', false, 22);
        } else if (h[1] === 'herb') {
          kit.cyl(0.006, 0.006, 0.12, at(hx, RY - 0.09, IZ), '--vpl-f-tan', false, 5);
          for (var hb = 0; hb < 7; hb++) kit.piece(new T.ConeGeometry(0.035, 0.18, 6), at(hx + (hb - 3) * 0.018, RY - 0.24, IZ + (hb % 2 ? 0.02 : -0.02), 0, Math.PI + (hb - 3) * 0.08), hb % 2 ? '--vpl-leaf' : '--vpl-f-green', false);
        } else {
          for (var gb = 0; gb < 6; gb++) kit.piece(ROUND(0.045, 10), at(hx + (gb % 2 ? 0.025 : -0.025), RY - 0.1 - gb * 0.07, IZ), '--vpl-f-paper', 0.005);
        }
      });

      // HIGH ON BOTH SIDE WALLS, over the page's parts: a rail hung with
      // ristras of chilis (the one red, which is food), braids of garlic and
      // bunches of herbs, every one hanging against the next.
      [[L + 0.12, 1], [R - 0.12, -1]].forEach(function (w, wi) {
        var wx = w[0];
        box(0.04, 0.04, 9.6, at(wx, 2.98, -6.3), '--vpl-ink-2', 0.006);
        for (var hz = -1.6, hi = 0; hz > -11.1; hz -= 0.55, hi++) {
          var kind = (hi + wi) % 3;
          if (kind === 0) {
            for (var cc = 0; cc < 9; cc++) {
              kit.piece(new T.ConeGeometry(0.022, 0.1, 6), at(wx + w[1] * 0.03, 2.9 - cc * 0.045, hz + (cc % 2 ? 0.025 : -0.025), 0, Math.PI + (cc % 2 ? 0.25 : -0.25)), '--vpl-f-red', false);
            }
          } else if (kind === 1) {
            for (var gg = 0; gg < 5; gg++) kit.piece(ROUND(0.035, 8), at(wx + w[1] * 0.03, 2.9 - gg * 0.055, hz + (gg % 2 ? 0.02 : -0.02)), '--vpl-f-paper', 0.004);
          } else {
            for (var hh = 0; hh < 6; hh++) kit.piece(new T.ConeGeometry(0.03, 0.15, 6), at(wx + w[1] * 0.03, 2.82, hz + (hh - 2.5) * 0.02, 0, Math.PI + (hh - 2.5) * 0.09), hh % 2 ? '--vpl-leaf' : '--vpl-f-green', false);
          }
        }
      });

      // BY THE DOOR, in the left-hand corner: a banana plant in a big pot,
      // the pot cut through like the ones on the shelf, its soil and roots
      // showing, its leaves reaching up the turmeric wall.
      (function () {
        var x = L + 0.55, z = -0.55, r0 = 0.28, r1 = 0.36, h = 0.6, P = at(x, 0, z, Math.PI / 2);
        kit.piece(new T.CylinderGeometry(r1, r0, h, 28, 1, true, Math.PI / 2, Math.PI), M(P, at(0, h / 2, 0)), '--vpl-pot', 0.01);
        kit.flat(new T.CircleGeometry(r1 - 0.02, 28, Math.PI, Math.PI), M(P, at(0, h - 0.04, 0, 0, -Math.PI / 2)), '--vpl-soil');
        kit.flat(shape([[-r1 - 0.008, h + 0.006], [r1 + 0.008, h + 0.006], [r0 + 0.008, -0.006], [-r0 - 0.008, -0.006]]), M(P, at(0, 0, 0.001)), '--vpl-ink');
        kit.flat(shape([[-r1, h], [r1, h], [r0, 0], [-r0, 0]]), M(P, at(0, 0, 0.002)), '--vpl-pot');
        kit.flat(shape([[-r1 + 0.03, h - 0.05], [r1 - 0.03, h - 0.05], [r0 - 0.03, 0.03], [-r0 + 0.03, 0.03]]), M(P, at(0, 0, 0.003)), '--vpl-soil');
        [-0.12, -0.04, 0.05, 0.13].forEach(function (rx, i) {
          kit.flat(new T.PlaneGeometry(0.008, 0.3), M(P, at(rx, 0.28, 0.004, 0, 0, (i - 1.5) * 0.25)), '--vpl-f-paper');
        });
        kit.cyl(0.05, 0.07, 0.9, M(P, at(0, h + 0.45, 0)), '--vpl-leaf', 0.01, 10);
        [[0.0, 1.0, 0.5], [0.9, 0.8, 0.9], [1.8, 1.15, 0.35], [2.7, 0.9, 0.75], [3.6, 1.05, 0.45], [4.5, 0.85, 0.85], [5.4, 1.1, 0.6]].forEach(function (lf, i) {
          var a = lf[0], leaf = new T.SphereGeometry(0.5, 16, 8);
          leaf.scale(0.2, 0.035, 0.66 * lf[1]);
          var up = h + 0.8 + (i % 3) * 0.12;
          kit.cyl(0.018, 0.022, 0.4, M(P, at(Math.cos(a) * 0.12, up - 0.12, Math.sin(a) * 0.12, -a, 0, 0.5)), '--vpl-leaf', false, 6);
          kit.piece(leaf, M(P, at(Math.cos(a) * 0.36, up, Math.sin(a) * 0.36, -a + Math.PI / 2, lf[2])), i % 2 ? '--vpl-f-green' : '--vpl-leaf', 0.008);
        });
      })();
      // A round rag rug inside the door, in rings.
      [[0.62, '--vpl-f-plum'], [0.5, '--vpl-f-oil'], [0.36, '--vpl-f-plum'], [0.2, '--vpl-f-gold']].forEach(function (rg, i) {
        kit.flat(new T.CircleGeometry(rg[0], 36), at(0, 0.004 + i * 0.001, -0.8, 0, -Math.PI / 2), rg[1]);
      });

      // THE STEREO'S CABINET low on the left-hand wall, and the telly on the
      // right: a dark set with nothing on it until somebody puts a video up.
      box(0.45, 0.45, 2.0, at(L + 0.26, 0.225, -10.3), '--vpl-ink', 0.012);
      [-0.55, 0.55].forEach(function (z) { kit.cyl(0.13, 0.13, 0.02, at(L + 0.49, 0.23, -10.3 + z, 0, 0, Math.PI / 2), '--vpl-ink-2', false, 20); });
      box(0.1, 1.32, 2.32, at(R - 0.06, 1.08 + 0.6, -7.8), '--vpl-ink', 0.015);

      // THE PAGE'S OWN PARTS, round the walls. Left: where the name comes
      // from, the builder, the pass, the stereo. Right: the board, the counter's
      // snacks and drinks, the telly and the cooks' month. By the door: the
      // house rules and whose these are.
      var name = kit.lift(frame, '.vpl-part', { n: 0, w: 760, h: 760, ww: 2.0, m: at(L + 0.05, 0.55, -2.2, LEFT) });
      var builder = kit.lift(frame, '.vpl-part', { n: 1, w: 860, h: 780, ww: 2.4, m: at(L + 0.05, 0.5, -4.9, LEFT), drop: '.vpl-pass' });
      var pass = kit.lift(frame, '.vpl-pass', { w: 620, h: 760, ww: 1.8, m: at(L + 0.05, 0.5, -7.6, LEFT) });
      var stereo = kit.lift(frame, '.vpl-stereo', { w: 760, h: 760, ww: 2.0, m: at(L + 0.05, 0.6, -10.3, LEFT) });
      var board = kit.lift(frame, '.vpl-part', { n: 2, w: 860, h: 780, ww: 2.2, m: at(R - 0.05, 0.5, -2.4, RIGHT) });
      var counter = kit.lift(frame, '.vpl-part', { n: 3, w: 760, h: 760, ww: 2.0, m: at(R - 0.05, 0.55, -5.1, RIGHT), drop: '.patch' });
      var tv = kit.lift(frame, '.vpl-telly', { w: 900, ww: 2.0, m: at(R - 0.12, 1.12, -7.8, RIGHT) });
      kit.lift(frame, '.vpl-telly__now', { w: 900, ww: 2.0, m: at(R - 0.05, 0.82, -7.8, RIGHT) });
      kit.lift(frame, '.vpl-telly__back', { w: 900, ww: 2.0, m: at(R - 0.05, 0.6, -7.8, RIGHT) });
      var rack = kit.lift(frame, '.vpl-racked', { w: 760, h: 760, ww: 2.2, m: at(R - 0.05, 0.5, -10.4, RIGHT) });
      var rules = kit.lift(frame, '.vpl-part', { n: 6, w: 640, h: 760, ww: 1.5, m: at(2.4, 0.55, -0.05, Math.PI) });
      var thanks = kit.lift(frame, '.vpl-part', { n: 7, w: 640, h: 760, ww: 1.1, m: at(4.6, 0.55, -0.05, Math.PI) });
      kit.wire(frame, 'vital.js');
      kit.wire(frame, 'rack.js');

      return {
        start: { x: 0, z: -1.2, yaw: 0 },
        bounds: { x: [L + 0.6, R - 0.6], z: [back + 1.0, -0.6] },
        stops: [
          { name: 'just inside the door, the turmeric walls all round', x: 0, z: -1.2, yaw: 0 },
          { name: 'at the island, over the bowl cut through the middle, the sauce running down into the rice', x: bx, z: IZ + 1.25, yaw: 0, pitch: -0.5 },
          { name: 'at the island, over the wraps cut in half, their rings to you', x: IX + 0.6, z: IZ + 1.15, yaw: 0, pitch: -0.55 },
          { name: 'at the counter, under the shelf of pots cut open, every one in the pantry', x: 0, z: back + 3.4, yaw: 0, pitch: 0.12 },
          { name: 'at the pots cut open on the counter, scallions, garlic and carrots in their soil', x: 2.9, z: back + 1.6, yaw: 0, pitch: -0.3 },
          { name: 'at the fridge, cut through, the pantry’s fresh things piled to the cut', x: -4.45, z: back + 2.5, yaw: 0.12, pitch: 0.0 },
          { name: 'at the pantry shelf, every jar on it cut open, shoulder to shoulder', x: 4.1, z: back + 2.4, yaw: -0.4, pitch: 0.02 },
          { name: 'at the word on where the name comes from', x: L + 1.9, z: -2.2, yaw: LEFT, frame: name.el },
          { name: 'at the builder, to tick what goes in your bowl or your wrap', x: L + 2.1, z: -4.9, yaw: LEFT, frame: builder.el },
          { name: 'at the pass, where your bowl is drawn cut through the middle and the ticket is written', x: L + 1.9, z: -7.6, yaw: LEFT, frame: pass.el },
          { name: 'at the stereo, songs about food, each one its own press', x: L + 1.9, z: -10.3, yaw: LEFT, frame: stereo.el },
          { name: 'at the board, the combos off it, any of them loaded into the builder', x: R - 2.0, z: -2.4, yaw: RIGHT, frame: board.el },
          { name: 'at the counter’s list of snacks and drinks', x: R - 1.9, z: -5.1, yaw: RIGHT, frame: counter.el },
          { name: 'at the telly, with nothing on it until you put something up', x: R - 2.2, z: -7.8, yaw: RIGHT, pitch: 0.08, frame: tv.el },
          { name: 'at a month of plant-based cooks’ videos, newest first under each cook', x: R - 2.0, z: -10.4, yaw: RIGHT, frame: rack.el },
          { name: 'at the front wall, with the kitchen’s own page on it', x: -3.2, z: -2.6, yaw: Math.PI, page: kit.page, frame: frame },
          { name: 'at the house rules, by the door', x: 2.4, z: -1.9, yaw: Math.PI, frame: rules.el },
          { name: 'at the word on whose these are', x: 4.6, z: -1.6, yaw: Math.PI, frame: thanks.el }
        ]
      };
    }
  };
})();

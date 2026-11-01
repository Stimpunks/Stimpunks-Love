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

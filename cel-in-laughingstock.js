/* =============================================================================
   Laughingstock, walked into on Cel Street. Ryan's ask, 2026-10-31: back on the
   street, working down it a room at a time.

   IT IS THE CELLAR'S WORLD AND NOBODY ELSE'S (§41): a comedy club seen from the
   back of the house, down a ramp. ONE FOLLOW SPOT, FROM BEHIND YOU: it sits in
   the lighting box over the audience's heads and throws one hard-edged pool
   onto a brick wall, so the only lit things in the room are in front of you
   and every shadow falls straight back onto the brick. THE BRICK IS RED AND NOT
   BROWN; out of the light it is the same brick, darker. In the pool: a mic on
   a stand, a stool with a glass of water on it, and NOBODY. The only people on
   this stage are the comics on the bill, in their own sets, and we do not draw
   their bodies for them. The way onto the stage is a ramp, with a rail.

   ONLY WHAT THE COMICS SAID STANDS IN THE LIGHT. Their lines are the page's own,
   lifted off it by the kit, each in its own oval of light on the brick, the
   way the page sets them, with nothing of ours beside them: our context for
   each line stays on the page. Everything of ours -- the bill and its notes,
   the whole night's plate, the house rules, the questions for the bar, The
   Daily Tism on the bar, the page itself -- is out in the dark with the
   audience, on the walls of the house. The bill and the whole night are the
   page's own, and rack.js, which the page loads, plays them here as it does
   there; nothing reaches YouTube until somebody presses, every set says how
   long it runs first, and nobody headlines.

   THE NEON IS STEADY and the water is still: nothing in the cellar moves at any
   setting, and nothing flickers. Every colour is one the room declares, by
   name. It keeps nothing, sends nothing and fetches nothing; its page arrives
   through Cel Street's screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['laughingstock.html'] = {
    name: 'Laughingstock',
    faces: ['Yellowtail'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var W = 12, D = 16, H = 3.4, back = -D;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var SH = 0.45, SD = 3.2;                 // the stage: its height, its depth
      var PY = 2.15;                           // the middle of the pool on the brick

      // THE HOUSE'S OWN DARK, a little of it, and the follow spot from the
      // lighting box behind the audience, hard-edged, throwing every shadow
      // straight back onto the brick.
      kit.scene.background = kit.col('--ls-deep');
      kit.scene.add(new T.HemisphereLight(kit.col('--ls-dim'), kit.col('--ls-deep'), 0.55));
      var spot = new T.SpotLight(kit.col('--ls-spot'), 120, 26, 0.17, 0.04, 1.0);
      spot.position.set(0, 3.0, -0.9);
      spot.target.position.set(0, PY, back);
      spot.castShadow = true;
      spot.shadow.mapSize.set(1024, 1024);
      spot.shadow.bias = -0.0006; spot.shadow.normalBias = 0.02;
      kit.scene.add(spot, spot.target);

      // THE CELLAR: the floor, the low ceiling, the walls of the house.
      box(W, 0.1, D + 2, at(0, -0.05, -D / 2 + 1), '--ls-house', false, false);
      // The ceiling takes no light: the spot is aimed at the brick, and a low
      // ceiling lit by its spill would be a second pool.
      kit.flat(new T.PlaneGeometry(W + 0.6, D + 2), at(0, H, -D / 2 + 1, 0, Math.PI / 2), '--ls-deep');
      box(0.3, H, D + 2, at(-W / 2 - 0.15, H / 2, -D / 2 + 1), '--ls-house');
      box(0.3, H, D + 2, at(W / 2 + 0.15, H / 2, -D / 2 + 1), '--ls-house');
      // The way in, behind you, at the foot of the ramp down from the street.
      box((W - 2.4) / 2, H, 0.3, at(-(W + 2.4) / 4, H / 2, 1.15), '--ls-house');
      box((W - 2.4) / 2, H, 0.3, at((W + 2.4) / 4, H / 2, 1.15), '--ls-house');
      box(2.4, H - 2.4, 0.3, at(0, 2.4 + (H - 2.4) / 2, 1.15), '--ls-house');

      // THE BRICK WALL behind the stage: red brick, lit by nothing but the spot,
      // so out of the pool it is the same brick in the dark.
      var bricks = kit.paper(2048, 580, function (c, w, h) {
        c.fillStyle = kit.ink('--ls-joint-lit'); c.fillRect(0, 0, w, h);
        c.fillStyle = kit.ink('--ls-brick');
        var bw = 56, bh = 20, j = 3;
        for (var r = 0; r * bh < h; r++) {
          for (var x = (r % 2 ? -bw / 2 : 0); x < w; x += bw) c.fillRect(x + j / 2, r * bh + j / 2, bw - j, bh - j);
        }
      });
      bricks.wrapS = bricks.wrapT = T.RepeatWrapping;
      box(W + 0.6, H, 0.3, at(0, H / 2, back - 0.15), '--ls-wall', false);
      kit.sheet(bricks, W, H, at(0, H / 2, back + 0.01));

      // THE STAGE, low, its front edge picked out, and the ramp up to it on the
      // left with a rail, so nobody needs the steps there are none of.
      box(W, SH, SD, at(0, SH / 2, back + SD / 2), '--ls-deep');
      box(W, 0.03, 0.05, at(0, SH, back + SD - 0.02), '--ls-edge', false, false);
      var RL = 2.8, rise = Math.atan2(SH, RL);
      box(RL, 0.06, 1.1, at(-W / 2 + 1.6, SH / 2, back + SD + 0.6, 0, 0, rise), '--ls-deep');
      [-1, 1].forEach(function (e) {
        box(0.06, 0.9, 0.06, at(-W / 2 + 1.6 + e * RL / 2, 0.45 + (e > 0 ? SH : 0), back + SD + 1.12), '--ls-dim', false);
      });
      kit.piece(new T.BoxGeometry(RL + 0.1, 0.05, 0.05), at(-W / 2 + 1.6, 0.9 + SH / 2, back + SD + 1.12, 0, 0, rise), '--ls-dim', false);

      // IN THE POOL: the mic on its stand, and the stool with the glass of
      // water on it. Nobody.
      var mz = back + 1.5;
      cyl(0.16, 0.2, 0.03, at(0, SH + 0.015, mz), '--ls-deep', 0.01, 18);
      cyl(0.018, 0.018, 1.25, at(0, SH + 0.64, mz), '--ls-dim', false, 8);
      cyl(0.04, 0.035, 0.16, at(0, SH + 1.33, mz, 0, 0.15), '--ls-deep', 0.008, 12);
      var sx = 1.0, sz = back + 1.25;
      cyl(0.2, 0.2, 0.05, at(sx, SH + 0.72, sz), '--ls-deep', 0.01, 18);
      [0, 1, 2, 3].forEach(function (k) {
        var a = k * Math.PI / 2 + Math.PI / 4;
        cyl(0.016, 0.016, 0.72, at(sx + Math.cos(a) * 0.14, SH + 0.36, sz + Math.sin(a) * 0.14, 0, Math.cos(a) * -0.12, Math.sin(a) * 0.12), '--ls-dim', false, 6);
      });
      cyl(0.04, 0.035, 0.12, at(sx + 0.05, SH + 0.81, sz), '--ls-cream', 0.006, 12);

      // THE LINES IN THE LIGHT: what the comics said, each in its own oval of
      // the spot on the brick, over the mic, and nothing of ours among them.
      var LINES = [[-1.1, 2.95], [0, 2.95], [1.1, 2.95], [-1.1, 2.2], [0, 2.2], [1.1, 2.2]];

      // THE LIGHTING BOX over the audience's heads, behind you, with the spot's
      // lens in it, and the neon over the stage on the left-hand wall.
      box(1.4, 0.5, 0.7, at(0, 3.0, -0.6), '--ls-deep');
      kit.flat(new T.CircleGeometry(0.12, 18), at(0, 3.0, -0.96, Math.PI), '--ls-spot');
      var neon = kit.paper(1024, 260, function (c, w, h) {
        c.clearRect(0, 0, w, h);
        c.fillStyle = kit.ink('--ls-neon');
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.font = "150px 'Yellowtail'";
        c.fillText('Laughingstock', w / 2, h / 2 + 8);
      });
      var tube = new T.Mesh(new T.PlaneGeometry(2.8, 0.71), new T.MeshBasicMaterial({ map: neon, transparent: true }));
      tube.matrixAutoUpdate = false;
      tube.matrix.copy(at(-W / 2 + 0.03, 2.65, back + 1.9, LEFT));
      tube.matrixWorldNeedsUpdate = true;
      kit.scene.add(tube);

      // THE HOUSE: small round tables and chairs, sit wherever you like.
      [[-2.6, -6.8], [0.3, -7.6], [2.9, -6.6], [-1.4, -4.2], [1.7, -4.0]].forEach(function (tb, i) {
        cyl(0.42, 0.42, 0.04, at(tb[0], 0.72, tb[1]), '--ls-house', 0.012, 22);
        cyl(0.03, 0.03, 0.7, at(tb[0], 0.36, tb[1]), '--ls-dim', false, 6);
        cyl(0.22, 0.22, 0.02, at(tb[0], 0.01, tb[1]), '--ls-dim', false, 14);
        [0.6, 2.6, 4.4].forEach(function (a) {
          var cx = tb[0] + Math.cos(a + i) * 0.7, cz = tb[1] + Math.sin(a + i) * 0.7;
          box(0.38, 0.05, 0.38, at(cx, 0.45, cz, -(a + i)), '--ls-deep', 0.01);
          box(0.05, 0.45, 0.38, at(cx + Math.cos(a + i) * 0.18, 0.67, cz + Math.sin(a + i) * 0.18, -(a + i)), '--ls-deep', 0.01);
        });
      });

      // THE BAR along the right-hand wall by the way in.
      box(0.7, 1.05, 3.4, at(W / 2 - 0.65, 0.525, -2.6), '--ls-deep');
      box(0.86, 0.05, 3.56, at(W / 2 - 0.68, 1.075, -2.6), '--ls-edge', 0.01);

      // THE ROOM'S OWN PAGE on the left-hand wall by the way in, in the dark.
      var pw = 2.6, ph = pw * 800 / 1180, py = 0.9 + ph / 2;
      box(pw + 0.16, ph + 0.16, 0.06, at(-W / 2 + 0.04, py, -3.0, LEFT), '--ls-deep');
      var frame = kit.screen(1180, 800, pw, at(-W / 2 + 0.08, py, -3.0, LEFT), 'Laughingstock’s own page, on the wall by the way in');

      // Lifted off the page, once it has loaded: the lines into the light, and
      // everything of ours on the walls of the house.
      LINES.forEach(function (p, n) {
        kit.lift(frame, '.ls-spot', { n: n, w: 340, ww: 1.0, m: at(p[0], p[1] - 0.3, back + 0.04) });
      });
      var bill = kit.lift(frame, '.ls-fold', { w: 900, h: 820, ww: 2.7, m: at(-W / 2 + 0.05, 0.5, -9.2, LEFT) });
      var night = kit.lift(frame, '.ls-stageplate', { w: 900, h: 860, ww: 2.5, m: at(W / 2 - 0.05, 0.5, -9.6, RIGHT) });
      var rules = kit.lift(frame, '.ls-rules', { w: 760, h: 760, ww: 1.8, m: at(-W / 2 + 0.05, 0.5, -6.0, LEFT) });
      var paper = kit.lift(frame, '.ls-part', { n: 5, w: 760, h: 700, ww: 1.7, m: at(W / 2 - 0.05, 1.35, -1.6, RIGHT) });
      var bar = kit.lift(frame, '.ls-questions', { w: 760, h: 600, ww: 1.7, m: at(W / 2 - 0.05, 1.35, -3.7, RIGHT) });
      kit.wire(frame, 'rack.js');

      return {
        start: { x: 0, z: -0.4, yaw: 0 },
        bounds: { x: [-W / 2 + 0.9, W / 2 - 1.3], z: [back + SD + 0.9, 0.3] },
        stops: [
          { name: 'just inside, at the back of the house, the spot coming from over your head', x: 0, z: -0.4, yaw: 0 },
          { name: 'at a table in the middle of the house, facing the stage', x: 0.3, z: -6.2, yaw: 0, pitch: 0.12 },
          { name: 'at the foot of the stage, where only what the comics said stands in the light', x: 0, z: back + SD + 2.6, yaw: 0, pitch: 0.36 },
          { name: 'at the foot of the ramp up onto the stage, with its rail', x: -W / 2 + 1.6, z: back + SD + 2.6, yaw: 0, pitch: -0.18 },
          { name: 'at the bill on the left-hand wall, every set saying how long it runs', x: -W / 2 + 2.9, z: -9.2, yaw: LEFT, pitch: 0.12, frame: bill.el },
          { name: 'at the whole night on the right-hand wall, which runs until you stop it', x: W / 2 - 2.9, z: -9.6, yaw: RIGHT, pitch: 0.14, frame: night.el },
          { name: 'at the house rules on the left-hand wall', x: -W / 2 + 2.6, z: -6.0, yaw: LEFT, pitch: 0.1, frame: rules.el },
          { name: 'at the bar, with the questions to take home', x: W / 2 - 2.6, z: -3.7, yaw: RIGHT, pitch: 0.18, frame: bar.el },
          { name: 'at the bar, with The Daily Tism on it', x: W / 2 - 2.6, z: -1.6, yaw: RIGHT, pitch: 0.18, frame: paper.el },
          { name: 'at the wall by the way in, with the club’s own page on it', x: -W / 2 + 2.8, z: -3.0, yaw: LEFT, page: kit.page, frame: frame }
        ]
      };
    }
  };
})();

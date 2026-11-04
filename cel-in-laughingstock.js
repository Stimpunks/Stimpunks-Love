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
      kit.scene.add(new T.HemisphereLight(kit.col('--ls-dim'), kit.col('--ls-deep'), 0.85));
      // What the spot spills: a little of it comes back off the stage onto the
      // front of the house, low and warm, and the bar has its own dim working
      // light under the counter's lip. Neither is a second pool on the brick.
      var spill = new T.PointLight(kit.col('--ls-spot'), 2.6, 8, 1.6);
      spill.position.set(0, 0.7, back + SD + 0.6);
      kit.scene.add(spill);
      var barGlow = new T.PointLight(kit.col('--ls-dim'), 2.2, 5.5, 1.5);
      barGlow.position.set(W / 2 - 1.3, 1.0, -2.6);
      kit.scene.add(barGlow);
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
      // The joists under the street, a duct along the left and two pipes, in
      // the house's own dark: a cellar shows its ceiling. The joists take no
      // light, like the ceiling between them: the spot's beam runs just under
      // them, and lit they would be a second pool all the way to the stage.
      for (var jz = 0.6; jz > back; jz -= 1.15) kit.flat(new T.BoxGeometry(W, 0.2, 0.14), at(0, H - 0.1, jz), '--ls-house');
      box(0.7, 0.42, D + 1.6, at(-W / 2 + 0.8, H - 0.42, -D / 2 + 1), '--ls-house', 0.015);
      for (var dz = 0.4; dz > back + 0.5; dz -= 1.6) box(0.74, 0.46, 0.04, at(-W / 2 + 0.8, H - 0.42, dz), '--ls-deep', false);
      cyl(0.05, 0.05, D + 1.6, at(W / 2 - 0.5, H - 0.32, -D / 2 + 1, 0, Math.PI / 2), '--ls-edge', 0.008, 8);
      cyl(0.035, 0.035, D + 1.6, at(W / 2 - 0.75, H - 0.3, -D / 2 + 1, 0, Math.PI / 2), '--ls-dim', false, 8);
      // THE HOUSE'S WALLS ARE THE SAME BRICK, out of the light: the bricks
      // darker and the joints darker still.
      var dark = kit.paper(4096, 774, function (c, w, h) {
        c.fillStyle = kit.ink('--ls-joint'); c.fillRect(0, 0, w, h);
        c.fillStyle = kit.ink('--ls-wall');
        var bw = 52, bh = 17, j = 3;
        for (var r = 0; r * bh < h; r++) {
          for (var x = (r % 2 ? -bw / 2 : 0); x < w; x += bw) c.fillRect(x + j / 2, r * bh + j / 2, bw - j, bh - j);
        }
      });
      kit.sheet(dark, D + 2, H, at(-W / 2 + 0.01, H / 2, -D / 2 + 1, LEFT));
      kit.sheet(dark, D + 2, H, at(W / 2 - 0.01, H / 2, -D / 2 + 1, RIGHT));
      // The way in, behind you, at the foot of the ramp down from the street.
      box((W - 2.4) / 2, H, 0.3, at(-(W + 2.4) / 4, H / 2, 1.15), '--ls-house');
      box((W - 2.4) / 2, H, 0.3, at((W + 2.4) / 4, H / 2, 1.15), '--ls-house');
      box(2.4, H - 2.4, 0.3, at(0, 2.4 + (H - 2.4) / 2, 1.15), '--ls-house');
      // A heavy curtain across the way in, drawn to one side, so the street's
      // daylight stays out of the house.
      cyl(0.025, 0.025, 2.6, at(0, 2.35, 0.95, 0, 0, Math.PI / 2), '--ls-edge', false, 6);
      for (var cf = 0; cf < 6; cf++) cyl(0.09, 0.11, 2.3, at(0.62 + cf * 0.11, 1.17, 0.95 + (cf % 2) * 0.05), '--ls-wall', 0.01, 8);

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
      // The stage's boards, worn, and a wedge monitor at each front corner,
      // face up to whoever is at the mic; nobody is.
      for (var bz = back + 0.25; bz < back + SD; bz += 0.32) box(W, 0.006, 0.012, at(0, SH + 0.002, bz), '--ls-house', false, false);
      [-1, 1].forEach(function (e) {
        var wm = at(e * 2.3, SH, back + SD - 0.45, e * -0.25);
        box(0.62, 0.32, 0.42, M(wm, at(0, 0.16, 0, 0, 0.42)), '--ls-deep', 0.012);
        box(0.5, 0.2, 0.01, M(wm, at(0, 0.18, 0.15, 0, 0.42)), '--ls-house', false);
      });
      // The mic's lead across the boards and off the edge.
      var lead = new T.CatmullRomCurve3([
        new T.Vector3(0, SH + 0.02, back + 1.5), new T.Vector3(-0.6, SH + 0.01, back + 2.1),
        new T.Vector3(-1.9, SH + 0.01, back + 2.5), new T.Vector3(-3.6, SH + 0.01, back + 2.7), new T.Vector3(-5.2, SH + 0.01, back + 2.4)]);
      kit.piece(new T.TubeGeometry(lead, 24, 0.012, 4, false), new T.Matrix4(), '--ls-deep', false);
      // Speaker stacks either side of the stage, in the dark.
      [-1, 1].forEach(function (e) {
        box(0.6, 1.5, 0.5, at(e * (W / 2 - 0.55), SH + 0.75, back + 0.6), '--ls-deep', 0.015);
        cyl(0.18, 0.18, 0.02, at(e * (W / 2 - 0.55), SH + 1.0, back + 0.86, 0, Math.PI / 2), '--ls-house', false, 16);
        cyl(0.08, 0.08, 0.02, at(e * (W / 2 - 0.55), SH + 1.4, back + 0.86, 0, Math.PI / 2), '--ls-house', false, 12);
      });
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
      box(1.6, 0.05, 0.05, at(0, 2.72, -1.0), '--ls-edge', false);
      [-0.75, 0.75].forEach(function (x) { box(0.05, 0.6, 0.05, at(x, 2.42, -1.0), '--ls-edge', false); });
      cyl(0.13, 0.15, 0.62, at(0, 3.0, -0.72, 0, Math.PI / 2), '--ls-house', 0.01, 14);
      kit.flat(new T.CircleGeometry(0.12, 18), at(0, 3.0, -1.04, Math.PI), '--ls-spot');
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
        [0.6, 2.6, 4.4].forEach(function (a, k) {
          var r = a + i + k * 0.13;
          var cx = tb[0] + Math.cos(r) * 0.72, cz = tb[1] + Math.sin(r) * 0.72;
          var cm = at(cx, 0, cz, -r);
          cyl(0.2, 0.2, 0.05, M(cm, at(0, 0.46, 0)), '--ls-ink-2', 0.01, 14);
          [[0.13, 0.13], [-0.13, 0.13], [0.13, -0.13], [-0.13, -0.13]].forEach(function (l) {
            cyl(0.014, 0.014, 0.45, M(cm, at(l[0], 0.225, l[1])), '--ls-dim', false, 5);
          });
          [-0.12, 0.12].forEach(function (o) { cyl(0.014, 0.014, 0.42, M(cm, at(0.17, 0.68, o)), '--ls-dim', false, 5); });
          box(0.04, 0.12, 0.32, M(cm, at(0.18, 0.85, 0)), '--ls-ink-2', 0.008);
        });
        // What the audience has on the table: a glass or two, a bottle, a
        // little bowl, never the same twice.
        var GLASS = [[0.12, 0.1], [-0.15, -0.05], [0.02, -0.18]];
        GLASS.slice(0, 1 + (i % 3)).forEach(function (g, k) {
          cyl(0.035, 0.03, 0.12, at(tb[0] + g[0], 0.8, tb[1] + g[1]), k % 2 ? '--ls-cream' : '--ls-dim', 0.006, 10);
        });
        if (i % 2 === 0) cyl(0.03, 0.035, 0.24, at(tb[0] - 0.05, 0.86, tb[1] + 0.16), '--ls-ink-2', 0.006, 10);
        if (i % 3 === 1) cyl(0.09, 0.06, 0.05, at(tb[0] + 0.16, 0.765, tb[1] - 0.12), '--ls-ink-2', 0.006, 12);
      });

      // THE BAR along the right-hand wall by the way in.
      box(0.7, 1.05, 3.4, at(W / 2 - 0.65, 0.525, -2.6), '--ls-deep');
      box(0.86, 0.05, 3.56, at(W / 2 - 0.68, 1.075, -2.6), '--ls-edge', 0.01);
      // A foot rail along it, taps on it, a few glasses upside down on a mat,
      // and stools on the house side.
      cyl(0.025, 0.025, 3.4, at(W / 2 - 1.08, 0.22, -2.6, 0, Math.PI / 2), '--ls-edge', false, 6);
      [-1.6, -2.0, -2.4].forEach(function (z, k) {
        cyl(0.02, 0.02, 0.3, at(W / 2 - 0.55, 1.25, z), '--ls-dim', false, 6);
        box(0.05, 0.12, 0.05, at(W / 2 - 0.55, 1.42, z), k === 1 ? '--ls-cream' : '--ls-ink-2', 0.006);
      });
      box(0.34, 0.01, 0.5, at(W / 2 - 0.6, 1.105, -3.4), '--ls-ink-2', false);
      [-3.25, -3.4, -3.55].forEach(function (z) { cyl(0.03, 0.035, 0.11, at(W / 2 - 0.62, 1.165, z), '--ls-dim', 0.005, 10); });
      [-1.5, -2.6, -3.7].forEach(function (z) {
        cyl(0.19, 0.19, 0.06, at(W / 2 - 1.35, 0.76, z), '--ls-ink-2', 0.01, 14);
        cyl(0.03, 0.04, 0.74, at(W / 2 - 1.35, 0.37, z), '--ls-dim', false, 6);
        cyl(0.17, 0.17, 0.02, at(W / 2 - 1.35, 0.25, z), '--ls-dim', false, 12);
        cyl(0.2, 0.2, 0.02, at(W / 2 - 1.35, 0.01, z), '--ls-deep', false, 12);
      });

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
          { name: 'at the foot of the ramp up onto the stage, with its rail', x: -W / 2 + 3.9, z: back + SD + 3.0, yaw: 0.5, pitch: 0.02 },
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

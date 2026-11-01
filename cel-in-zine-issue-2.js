/* =============================================================================
   The Zine Table's Issue #2, One Root, Two Rainbows, walked into on Cel
   Street, off the Zine Table. Ryan's ask, 2026-10-31: the rooms behind the
   doors, after every door in the row.

   IT IS THE ZINE TABLE'S WORLD (§7) AND ITS OWN SCENE: photocopier black on
   white paper and the ransom note's yellow, red and cyan, the Zine Table's
   colours by name and no others. The table room is the copy room by day, sheets
   scattered at their angles; this is THE ISSUE ITSELF, one sheet, and you are
   standing on it. The sheet is the floor, cut with scissors along its edges,
   lying on the black of two in the morning ("photocopied at 2am", the page
   says) under the one hard light of the copier's lamp. Its parts stand up off
   it as cut-outs where they lie on the page: the ransom headline at its head,
   the pull-quote and the borrowed words down the left, the columns, the seven
   lines and the foot row down the right. The page is the paper.

   THE CUT-OUTS ARE THE PAGE'S OWN, lifted off it as they are, never retyped,
   and they LEAN ABOVE GENTLE AND STAND STRAIGHT AT GENTLE, as the table's
   sheets do; the ransom letters turn or not by the page's own rule. The scissors
   lie open across the edge where they stopped, and the paperclip is the issue's
   own job marker's picture. Nothing moves. It keeps nothing, sends nothing and
   fetches nothing; the page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 7, 374761393) ^ Math.imul(j + 29, 668265263) ^ Math.imul(k + 31, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['zine-issue-2.html'] = {
    name: 'Issue #2, One Root, Two Rainbows',
    from: 'zine-table.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      // The sheet, letter-shaped, its foot at z = 0 and its head away from you.
      var SW = 8.5, SD = 11, L = -SW / 2, R = SW / 2;
      var lean = function (s) { return kit.gentle ? 0 : s; };

      // TWO IN THE MORNING: the black all round, and the copier's one lamp
      // straight over the sheet, hard, white, every shadow short.
      kit.scene.background = kit.col('--ink');
      kit.scene.add(new T.HemisphereLight(kit.col('--paper'), kit.col('--ink'), 0.9));
      var lamp = new T.DirectionalLight(kit.col('--paper'), 2.2);
      lamp.position.set(-1.5, 12, -3); lamp.target.position.set(0, 0, -5.5);
      lamp.castShadow = true;
      lamp.shadow.mapSize.set(2048, 2048);
      lamp.shadow.camera.left = -8; lamp.shadow.camera.right = 8; lamp.shadow.camera.top = 9; lamp.shadow.camera.bottom = -9;
      lamp.shadow.bias = -0.0006; lamp.shadow.normalBias = 0.03;
      kit.scene.add(lamp, lamp.target);

      // The black it lies on.
      box(40, 0.1, 40, at(0, -0.06, -SD / 2), '--ink', false, false);

      // THE SHEET: the issue's own layout, laid out as the page lays it, drawn
      // as a photocopy would carry it: the headline's blocks at the head, the
      // bordered sections and the black box down the left, the columns and the
      // yellow box and the foot row down the right, every line of type a bar.
      var sheet = kit.paper(850, 1100, function (c, w, h) {
        c.fillStyle = kit.ink('--paper'); c.fillRect(0, 0, w, h);
        c.fillStyle = kit.ink('--ink');
        // Toner flecks.
        for (var k = 0; k < 240; k++) c.fillRect(hash(k, 1, 1) * w, hash(k, 1, 2) * h, 1 + hash(k, 1, 3) * 2, 1 + hash(k, 1, 4) * 2);
        // The ransom headline: ONE ROOT two RAINBOWS, as four cut blocks.
        [['--yellow', 150], ['--ink', 170], [null, 120], ['--cyan', 240]].forEach(function (b, i, all) {
          var x = 60 + all.slice(0, i).reduce(function (s, a) { return s + a[1] + 16; }, 0);
          if (b[0]) { c.fillStyle = kit.ink(b[0]); c.fillRect(x, 70 + (i % 2) * 8, b[1], 70); }
          else { c.fillStyle = kit.ink('--red'); c.fillRect(x + 10, 92, b[1] - 20, 26); }
        });
        var line = function (x, y, len) { c.fillStyle = kit.ink('--ink'); c.fillRect(x, y, len, 5); };
        var boxed = function (x, y, bw, bh, dashed) {
          c.strokeStyle = kit.ink('--ink'); c.lineWidth = 5;
          c.setLineDash(dashed ? [14, 9] : []);
          c.strokeRect(x, y, bw, bh); c.setLineDash([]);
          for (var l = 0; l * 14 + 26 < bh - 14; l++) line(x + 16, y + 22 + l * 14, (bw - 32) * (0.55 + 0.45 * hash(x, y, l)));
        };
        // Down the left: where it came from, the black pull-quote, the last
        // line of the course, the borrowed words.
        boxed(60, 200, 330, 150);
        c.fillStyle = kit.ink('--ink'); c.fillRect(60, 380, 330, 210);
        c.fillStyle = kit.ink('--paper'); for (var q = 0; q < 6; q++) c.fillRect(82, 410 + q * 26, 280 * (0.6 + 0.4 * hash(q, 2, 1)), 10);
        boxed(60, 620, 330, 180);
        boxed(60, 830, 330, 140, true);
        // Down the right: the two columns, the seven lines in yellow, the foot row.
        for (var col = 0; col < 2; col++) {
          for (var l = 0; l < 17; l++) line(440 + col * 185, 210 + l * 15, 160 * (0.55 + 0.45 * hash(col, l, 3)));
          c.fillStyle = kit.ink('--red'); c.fillRect(440 + col * 185, 470, 140, 6);
        }
        c.fillStyle = kit.ink('--yellow'); c.fillRect(440, 510, 350, 280);
        c.strokeStyle = kit.ink('--ink'); c.lineWidth = 5; c.strokeRect(440, 510, 350, 280);
        for (var s7 = 0; s7 < 7; s7++) line(468, 560 + s7 * 31, 290 * (0.6 + 0.4 * hash(s7, 4, 1)));
        c.fillStyle = kit.ink('--ink'); c.fillRect(440, 820, 210, 150);
        boxed(668, 820, 122, 150);
      });
      kit.sheet(sheet, SW, SD, at(0, 0.004, -SD / 2, 0, -Math.PI / 2));
      // The cut edges: snips of paper left standing proud of the edge, where the
      // scissors went a little off the line.
      for (var k = 0; k < 34; k++) {
        var side = k % 4, t = hash(k, 5, 1), sz = 0.08 + hash(k, 5, 2) * 0.12;
        var px = side === 0 ? L - sz / 3 : side === 1 ? R + sz / 3 : L + t * SW;
        var pz = side === 2 ? sz / 3 : side === 3 ? -SD - sz / 3 : -t * SD;
        box(sz, 0.006, sz * 0.6, at(px, 0.003, pz, hash(k, 5, 3) * Math.PI), '--paper', false, false);
      }

      // THE SCISSORS, open across the right-hand edge where they stopped, and
      // their trimmings on the black beside them.
      var sx = R + 0.2, sz2 = -5.2, sm = at(sx, 0.06, sz2, 0.5);
      [-1, 1].forEach(function (s) {
        box(0.16, 0.05, 1.7, M(sm, at(s * 0.22, 0, -0.85, s * 0.2)), '--ink', 0.02);
        kit.piece(new T.TorusGeometry(0.26, 0.06, 8, 18), M(sm, at(s * 0.3, 0, 0.42, 0, Math.PI / 2)), '--red', 0.02);
      });
      kit.cyl(0.06, 0.06, 0.08, M(sm, at(0, 0.02, 0)), '--paper', 0.01, 10);
      for (k = 0; k < 9; k++) box(0.5 + hash(k, 6, 1) * 0.6, 0.006, 0.08, at(R + 0.8 + hash(k, 6, 2) * 1.4, 0.004, sz2 - 1.5 + hash(k, 6, 3) * 3, hash(k, 6, 4) * Math.PI), '--paper', false, false);

      // THE PAPERCLIP, the issue's own job marker's picture, holding the
      // sheet's top left corner: two long sides and the bends between them.
      var cm = at(L + 0.35, 0.05, -SD + 1.3, 0.2), wire = 0.035;
      var straight = function (x, z0, z1) { kit.cyl(wire, wire, z1 - z0, M(cm, at(x, 0, (z0 + z1) / 2, 0, Math.PI / 2)), '--ink', 0.006, 8); };
      straight(-0.3, -0.5, 1.1); straight(0.3, -0.85, 0.9); straight(-0.06, -0.55, 0.55);
      kit.piece(new T.TorusGeometry(0.3, wire, 8, 20, Math.PI), M(cm, at(0, 0, -0.5, 0, -Math.PI / 2)), '--ink', 0.006);
      kit.piece(new T.TorusGeometry(0.18, wire, 8, 16, Math.PI), M(cm, at(0.12, 0, 0.9, Math.PI, -Math.PI / 2)), '--ink', 0.006);

      // THE CUT-OUTS, the page's own parts, each on a fold of card standing on
      // the sheet over where it lies on the page, facing the middle.
      var stops = [{ name: 'at the foot of the sheet, the whole issue lying in front of you', x: 0, z: 0.4, yaw: 0, pitch: -0.12 }];
      var card = function (it, o) {
        box(o.ww * 0.5, 0.5, 0.06, at(o.x, 0.25, o.z - 0.05 * Math.cos(o.yaw), o.yaw), '--ink', 0.012);
        var d = o.ww * 0.75 + 0.9;
        stops.push({ name: o.name, where: o.where, x: o.x + Math.sin(o.yaw) * d, z: o.z + Math.cos(o.yaw) * d, yaw: o.yaw, pitch: -0.1, frame: it.el });
      };
      var foot = function (o) { return at(o.x, 0.5, o.z, o.yaw, 0, lean(o.lean)); };

      // THE ROOM'S OWN PAGE, propped up at the foot of the sheet behind you, on
      // the black, as the copy came out of the machine.
      var pw = 3.2, ph = pw * 800 / 1180, py = 0.45 + ph / 2;
      var pm = at(0, py, 1.5, Math.PI, 0, lean(0.02));
      box(pw + 0.12, ph + 0.12, 0.04, M(pm, at(0, 0, -0.03)), '--paper', false);
      box(0.08, py, 0.08, at(-pw / 2 + 0.3, py / 2, 1.56), '--ink', 0.01);
      box(0.08, py, 0.08, at(pw / 2 - 0.3, py / 2, 1.56), '--ink', 0.01);
      var frame = kit.screen(1180, 800, pw, M(pm, at(0, 0, 0.0)), 'Issue #2’s own page, propped up at the foot of the sheet');

      var HEAD = { x: 0, z: -9.9, yaw: 0, lean: -0.02, ww: 5.0,
        name: 'at the head of the sheet, the headline cut out of other paper', where: 'at the head of the sheet, ONE ROOT two RAINBOWS cut out of other paper' };
      card(kit.lift(frame, '.ransom', { w: 820, ww: HEAD.ww, m: foot(HEAD) }), HEAD);
      var QUOTE = { x: L + 1.2, z: -6.6, yaw: 0.65, lean: 0.03, ww: 1.9,
        name: 'at the pull-quote, lesson six in one breath', where: 'at the black box down the left, lesson six in one breath' };
      card(kit.lift(frame, '.pullquote', { w: 420, ww: QUOTE.ww, m: foot(QUOTE) }), QUOTE);
      var WORDS = { x: L + 1.1, z: -3.6, yaw: 0.65, lean: -0.025, ww: 1.6,
        name: 'at the words the sheet borrowed', where: 'at the words the sheet borrowed, each one a door into the glossary' };
      card(kit.lift(frame, '.zine-glossary', { w: 380, ww: WORDS.ww, m: foot(WORDS) }), WORDS);
      var COLS = { x: R - 1.3, z: -8.0, yaw: -0.6, lean: 0.02, ww: 2.4,
        name: 'at the two columns, one root', where: 'at the two columns, the hand stilled and the gender denied' };
      card(kit.lift(frame, '.zine-cols', { w: 560, ww: COLS.ww, m: foot(COLS) }), COLS);
      var SEVEN = { x: R - 1.2, z: -5.4, yaw: -0.65, lean: -0.03, ww: 2.0,
        name: 'at the seven lessons, seven lines', where: 'at the yellow box, seven lessons in seven lines' };
      card(kit.lift(frame, '.keeps', { w: 460, h: 560, ww: SEVEN.ww, m: foot(SEVEN) }), SEVEN);
      var FOOT = { x: R - 1.2, z: -2.8, yaw: -0.7, lean: 0.025, ww: 2.2,
        name: 'at the foot row, one sheet, no colour', where: 'at the foot row, who distilled it and why it fits one sheet' };
      card(kit.lift(frame, '.zine-footrow', { w: 520, ww: FOOT.ww, m: foot(FOOT) }), FOOT);

      stops.push({ name: 'at the scissors, open across the edge where they stopped', x: R - 1.2, z: sz2 + 0.6, yaw: -1.25, pitch: -0.55 });
      stops.push({ name: 'at the paperclip holding the top corner', x: L + 1.6, z: -SD + 2.8, yaw: 0.6, pitch: -0.6 });
      stops.push({ name: 'looking back at the room’s own page, propped up at the foot of the sheet', where: 'at the foot of the sheet, looking back at the issue’s own page propped up on the black', x: 0, z: -1.9, yaw: Math.PI, page: kit.page, frame: frame });

      return {
        start: { x: 0, z: 0.4, yaw: 0, pitch: -0.12 },
        bounds: { x: [L + 0.4, R - 0.4], z: [-SD + 1.8, 0.6] },
        stops: stops
      };
    }
  };
})();

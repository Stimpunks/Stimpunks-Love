/* =============================================================================
   Looking-Glass House, walked into on Cel Street, through the looking-glass
   in the Faery Yurt. Helen Edgar's ask, 2026-11-11: every door and portal in
   her yurt opening onto a really good 3D room, this one through the gilt
   glass on the yurt's wall.

   IT IS HELEN EDGAR'S ROOM AND HER WORLD (§148), and this is OURS: a drawing of
   her Looking-Glass House for Cel Street, in the colours her page declares
   (--lgh-*) with her yurt's own inks for what the glass gives back and her
   fog's six washes for the rainbow in it, and nothing else, which changes
   nothing on her page and is hers to keep or send back. THE ROOM IS THE YURT
   GIVEN BACK: dark on pale where the yurt is cream on dark, silvered panes
   with gilt beading where the yurt has canvas and lattice, and the only warm
   thing in it the gilt and the candles, which are only ever points in the
   glass. A looking-glass makes no light, so what lights this room is cool
   silver from everywhere and the yurt's candlelight coming back off the glass
   behind you; there is no flame anywhere in it. The floor is the chessboard
   country her page draws from above, eight rows of fields pale and green in
   turn, a brook between every row, a hedge between the fields and Alice's own
   file marked out in red, with her as a White Pawn on the second square and a
   crown waiting on the eighth.

   WHAT IS HERS IS LIFTED OFF HER PAGE, never redrawn: the pin board of
   Carroll's lines in red and white pins on a cork board on the left-hand
   wall; the eight squares as she wrote them, on a reading stand; the game
   itself (Move Alice one square, Back to the second square) on a stand at the
   board's foot; the looking-glass book with its Jabberwocky verse the wrong
   way round, the writing glass and the un-birthday clock on the mantelpiece
   of a cold hearth on the right-hand wall; and Tenniel's four cuts of 1871,
   public domain, hung in gilt along both walls. looking-glass-house.js, her
   page's own script, is wired to the copies, so the pawn moves, the book
   turns the right way round and the writing glass answers here as there, and
   the pawn on the floor follows the pawn in her drawing. Her own page hangs
   on the far wall.

   THE GLASS YOU CAME THROUGH IS A PORTAL, as every way in the yurt is now: a
   gilt oval with the yurt reflected in it, its rainbow fog lying still in the
   silver, ivy and flowers in her inks up both sides and over the top, little
   glowing mushrooms at its feet, a halo on the wall, sparkle in the air round
   it, and two faeries perched on the ivy.

   MORE MAGICAL, MORE 3D AND REAL FOR A HEADSET (Helen Edgar's ask, the same
   day, 2026-11-11): a headset shows only the WebGL picture, never a lift or
   her page, so everything the lifts show has a drawn twin behind it in
   WebGL (pinned paper cards on the cork, an open book on each reading stand,
   a clock, a standing book and a little pane on the mantelpiece, gilt
   frames with a mount in each where the cuts hang), and the house itself has
   depth: panes with bevels and gilt mouldings, a cornice and a skirting,
   the chessboard country raised square by square with hedges of leaves and
   brooks with a sheen, and on the squares what her page says is there (a
   hill on the second, a railway on the third, a tree on the fourth, a shop
   by a river on the fifth, a wall on the sixth, the forest of the seventh,
   the crown on the eighth; never any of Carroll's people), the glass with a
   bevel ring and the yurt fuller in it, the fog in several soft layers, a
   silver haze under the ceiling and more sparkle on the candles' string.
   Ours, and hers to keep or send back.

   FOR A HEADSET AND A GAME CONTROLLER (Helen Edgar's ask, the same day,
   2026-11-11, for improvements that look fine without either too): signs
   lettered in WebGL in the room's own faces, because a headset shows no lift
   and no page: the way back named at the glass, the right way round on one
   side of the ivy and reversed on the other, as this house would have it;
   the room's name and a line of ours over her page's frame; and a small
   label at the pin board, both stands, the mantelpiece and each of Tenniel's
   frames. The stops are a tour in walking order, which a controller's
   bumpers follow: in through the glass, the game, the hill, the pin board,
   the reading stand, the forest, the cuts down the left, her page, the cuts
   up the right, the mantelpiece, and last the glass, the way back; every
   switch is on the stop where its thing is, and every switch can be pressed
   in the scene (the faeries on the ivy, the game on its stand). The bevel
   lines, the glass's lattice and Alice's file are a few centimetres rather
   than a hair, because a hairline shimmers in a headset. Ours, and hers to
   keep or send back.

   THE HEADSET'S SECOND ROUND (Helen Edgar, 2026-11-11, after her first real
   headset, "do all of above"): two chairs, one by the reading stand facing
   the squares and one by the mantelpiece, that seat you (kit.sit: your eyes
   at a sitting height, pressed on the chair or at its stop, pressed again to
   stand); three things to pick up and put back (kit.hold): a spare White
   Pawn at the board's foot, a gilt circlet on the mantelshelf, and one of the
   pinned cards on the cork; and two plaques for a headset, which shows no
   page: her own first lines by the glass, copied exactly from her page, dark
   on her paper, and a line of ours under the book on the mantelpiece saying
   the Jabberwocky verse is drawn reversed and reads the right way to a screen
   reader. The room already had one point light and two wide ones, under the
   ten a standalone headset keeps up with, so none was cut. Ours, and hers to
   keep or send back.

   WHAT MOVES IS WHAT HER PAGE MOVES, AND WHAT YOU ASK FOR. Her page says MAX
   lets the candles in the glass glint, slowly, so here the candle points
   glint by themselves at MAX and when asked; the faeries fly round the glass
   only once somebody presses Let the faeries fly, as her faeries drift only
   when asked; nothing else moves at any setting, and nothing flashes. It
   keeps nothing, sends nothing and fetches nothing; her page arrives through
   Cel Street's screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 29, 374761393) ^ Math.imul(j + 83, 668265263) ^ Math.imul(k + 97, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['looking-glass-house.html'] = {
    name: 'Looking-Glass House',
    from: 'faery-yurt.html',
    // The faces the signs are lettered in, loaded before the room is built.
    faces: ['"Old Standard TT"', '"Source Serif 4"'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, W = 9.6, D = 11, H = 3.2, FRONT = 1.2, back = FRONT - D;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var FLAT = -Math.PI / 2, LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      function see(mesh, a) { mesh.material.transparent = true; mesh.material.opacity = a; mesh.material.depthWrite = false; return mesh; }
      // A LETTERED SIGN IN WEBGL (Helen Edgar's ask, 2026-11-11, for a headset,
      // which shows no lift and no page): dark words on a card of her paper
      // with a gilt rule, one pixel a millimetre, so sixty pixels of type is
      // six centimetres in the world. o.flip letters it backwards, the way
      // this house would; o.small is a label rather than a sign.
      function sign(words, m, o) {
        o = o || {};
        var px = o.small ? 46 : 60, pad = o.small ? 18 : 26;
        var pw = Math.round(words.length * px * 0.56 + pad * 2), ph = o.line ? px * 2 + pad * 2 + 10 : px + pad * 2;
        var map = kit.paper(pw, ph, function (c, w, h) {
          c.fillStyle = kit.ink('--lgh-card'); c.fillRect(0, 0, w, h);
          c.fillStyle = kit.ink('--lgh-gilt'); c.fillRect(0, 0, w, 6); c.fillRect(0, h - 6, w, 6);
          c.fillStyle = kit.ink('--lgh-gilt-2'); c.fillRect(0, 6, w, 2); c.fillRect(0, h - 8, w, 2);
          if (o.flip) { c.translate(w, 0); c.scale(-1, 1); }
          c.fillStyle = kit.ink('--lgh-ink'); c.textAlign = 'center'; c.textBaseline = 'middle';
          c.font = px + 'px "Old Standard TT"';
          c.fillText(words, w / 2, o.line ? pad + px / 2 : h / 2);
          if (o.line) { c.font = Math.round(px * 0.62) + 'px "Source Serif 4"'; c.fillStyle = kit.ink('--lgh-ink-2'); c.fillText(o.line, w / 2, pad + px + 10 + px * 0.5); }
        });
        var w = pw / 1000, h = ph / 1000;
        // A board of cork behind the card, so it stands off the wall.
        box(w + 0.03, h + 0.03, 0.025, M(m, at(0, 0, -0.014)), '--lgh-cork-2', false, false);
        kit.sheet(map, w, h, m);
      }

      // THE LIGHT: silver from everywhere, cool, no flame; and the yurt's
      // candlelight coming back off the glass behind you, low and warm.
      kit.scene.background = kit.col('--lgh-glass');
      kit.scene.add(new T.HemisphereLight(kit.col('--lgh-mist'), kit.col('--lgh-pane'), 1.7));
      var day = new T.DirectionalLight(kit.col('--lgh-mist'), 0.8);
      day.position.set(2.5, 7, 3);
      kit.scene.add(day);
      var warm = new T.PointLight(kit.col('--ember-2'), 3.2, 5.5, 1.5);
      warm.position.set(0, 1.6, FRONT - 0.5);
      kit.scene.add(warm);

      // THE ROOM: a floor of meadow, silvered walls panelled in panes with
      // gilt beading, a dado rail, a cornice and a cork skirting.
      box(W, 0.1, D, at(0, -0.05, FRONT - D / 2), '--lgh-meadow', false, false);
      box(W + 0.6, 0.16, D + 0.6, at(0, H + 0.08, FRONT - D / 2), '--lgh-glass', false, false);
      function wall(len, m, gap) {
        // m: the wall's middle at its foot, facing into the room; gap: an
        // opening left in it (x from, x to), for the glass.
        box(len, H, 0.24, M(m, at(0, H / 2, -0.12)), '--lgh-pane');
        // The skirting, stepped, and the dado rail with a cove under it.
        box(len, 0.16, 0.08, M(m, at(0, 0.08, 0.03)), '--lgh-cork', false, false);
        box(len, 0.04, 0.1, M(m, at(0, 0.18, 0.04)), '--lgh-cork-2', false, false);
        box(len, 0.06, 0.07, M(m, at(0, 0.92, 0.03)), '--lgh-gilt', false, false);
        box(len, 0.03, 0.09, M(m, at(0, 0.965, 0.04)), '--lgh-gilt-2', false, false);
        // The cornice in three steps up to the ceiling.
        box(len, 0.08, 0.08, M(m, at(0, H - 0.04, 0.03)), '--lgh-gilt-2', false, false);
        box(len, 0.06, 0.13, M(m, at(0, H - 0.11, 0.05)), '--lgh-gilt', false, false);
        box(len, 0.04, 0.18, M(m, at(0, H - 0.16, 0.08)), '--lgh-silver', false, false);
        // Each pane's bevel: a lighter rim a finger in from the beading,
        // so the panes catch the light at their edges as old glass does.
        for (var x = -len / 2 + 1.2, n = 0; x < len / 2 - 0.4; x += 1.2, n++) {
          box(0.04, H - 0.3, 0.06, M(m, at(x, 0.15 + (H - 0.3) / 2, 0.03)), '--lgh-gilt', false, false);
          box(0.025, H - 0.3, 0.02, M(m, at(x - 0.03, 0.15 + (H - 0.3) / 2, 0.01)), '--lgh-gilt-2', false, false);
          if (!(gap && x > gap[0] - 1.2 && x < gap[1] + 1.2)) {
            // Each a few centimetres, never a hair: a hairline shimmers in a headset.
            box(0.035, H - 1.3, 0.02, M(m, at(x - 1.12, 1.05 + (H - 1.3) / 2, 0.01)), '--lgh-mist', false, false);
            box(0.035, H - 1.3, 0.02, M(m, at(x - 0.08, 1.05 + (H - 1.3) / 2, 0.01)), '--lgh-mist', false, false);
            box(1.06, 0.035, 0.02, M(m, at(x - 0.6, 1.04, 0.01)), '--lgh-mist', false, false);
            box(1.06, 0.035, 0.02, M(m, at(x - 0.6, H - 0.26, 0.01)), '--lgh-mist', false, false);
          }
          // A pane's sheen, the way old mirror glass catches the light, on
          // every other pane, over the dado and never on anything hung there.
          if (n % 2 && !(gap && x > gap[0] - 1.2 && x < gap[1] + 1.2)) {
            see(kit.flat(new T.PlaneGeometry(0.42, H - 1.2), M(m, at(x - 0.6, 0.95 + (H - 1.2) / 2, 0.006)), '--lgh-mist'), 0.22);
          }
        }
      }
      wall(D, at(-W / 2, 0, FRONT - D / 2, LEFT));
      wall(D, at(W / 2, 0, FRONT - D / 2, RIGHT));
      wall(W, at(0, 0, back, 0));
      wall(W, at(0, 0, FRONT, Math.PI), [-1.4, 1.4]);

      // THE CHESSBOARD COUNTRY on the floor, as her page draws it from above:
      // eight rows of fields, pale and green in turn, a brook across between
      // every row, a hedge between the fields, and Alice's file in red.
      var SQ = 1.0, BX = -4 * SQ, BZ = -0.6;
      function zOf(s) { return BZ - (s - 0.5) * SQ; }
      var FILE = 3, fileX = BX + (FILE + 0.5) * SQ;
      // Every square stands up out of the floor a little, a field of its own
      // with a lip, so the country has a step in it where the brooks run.
      for (var r = 1; r <= 8; r++) {
        for (var c = 0; c < 8; c++) {
          box(SQ - 0.1, 0.03, SQ - 0.1, at(BX + (c + 0.5) * SQ, 0.015, zOf(r)), (r + c) % 2 ? '--lgh-field' : '--lgh-meadow', false, false);
        }
        // The brook along this row's far edge, wandering a little, with a
        // sheen of the ceiling's silver lying on the water.
        if (r < 8) for (var b = 0; b < 16; b++) {
          var bx = BX + (b + 0.5) * SQ / 2, bz = zOf(r) - SQ / 2 + Math.sin(b * 1.1 + r) * 0.04;
          box(SQ / 2 + 0.02, 0.006, 0.1, at(bx, 0.004, bz), '--lgh-brook', false, false);
          if (b % 3 === 1) see(kit.flat(new T.PlaneGeometry(0.3, 0.05), at(bx, 0.012, bz, 0, FLAT), '--lgh-mist'), 0.5);
        }
      }
      // Hedges between the files, in short lengths as her page dashes them,
      // each a low row of leaves rather than a line.
      for (var h = 1; h < 8; h++) for (var d = 0; d < 32; d++) {
        if (d % 4 === 3) continue;
        for (var hl = 0; hl < 3; hl++) {
          var hleaf = new T.SphereGeometry(0.045 + hash(h, d, hl) * 0.02, 6, 4); hleaf.scale(1, 0.8, 1.3);
          kit.piece(hleaf, at(BX + h * SQ + (hash(h, d, hl + 7) - 0.5) * 0.04, 0.05, BZ - (d + 0.2 + hl * 0.3) * SQ / 4), hl % 2 ? '--lgh-hedge' : '--lgh-field', false);
        }
      }
      // WHAT HER PAGE SAYS IS ON EACH SQUARE OF ALICE'S FILE, drawn as the
      // place and never as anybody in it: a hill on the second, a railway
      // across the third, a tree on the fourth, a little dark shop by a
      // river on the fifth, a wall on the sixth, the forest of the seventh.
      function tree(m, sc) {
        kit.cyl(0.04 * sc, 0.06 * sc, 0.5 * sc, M(m, at(0, 0.25 * sc, 0)), '--lgh-cork-2', false, 7);
        [[0, 0.62, 0.26], [0.12, 0.52, 0.18], [-0.13, 0.55, 0.17], [0.03, 0.78, 0.17]].forEach(function (cl, ci) {
          kit.piece(new T.SphereGeometry(cl[2] * sc, 8, 6), M(m, at(cl[0] * sc, cl[1] * sc, (ci % 2 ? 0.08 : -0.06) * sc)), ci % 2 ? '--lgh-hedge' : '--lgh-field', false);
        });
      }
      var hill = new T.SphereGeometry(0.42, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2); hill.scale(1, 0.45, 1);
      kit.piece(hill, at(fileX + 0.22, 0.03, zOf(2) - 0.18), '--lgh-field', false);
      [-1, 1].forEach(function (sd) { box(0.02, 0.012, SQ - 0.14, at(fileX + sd * 0.11, 0.036, zOf(3)), '--lgh-ink-2', false, false); });
      for (var sl = 0; sl < 7; sl++) box(0.3, 0.01, 0.03, at(fileX, 0.034, zOf(3) - 0.39 + sl * 0.13), '--lgh-cork-2', false, false);
      tree(at(fileX - 0.3, 0.03, zOf(4) + 0.2, 0.4), 0.9);
      box(0.3, 0.3, 0.26, at(fileX + 0.26, 0.18, zOf(5) + 0.18, -0.3), '--lgh-ink-2', false);
      box(0.34, 0.03, 0.3, at(fileX + 0.26, 0.345, zOf(5) + 0.18, -0.3), '--lgh-cork-2', false, false);
      box(0.06, 0.08, 0.004, at(fileX + 0.26, 0.09, zOf(5) + 0.32, -0.3), '--lgh-gilt-2', false, false);
      box(0.9, 0.006, 0.12, at(fileX - 0.05, 0.034, zOf(5) - 0.22, 0.2), '--lgh-brook', false, false);
      for (var wb = 0; wb < 10; wb++) box(0.17, 0.07, 0.08, at(fileX - 0.36 + (wb % 5) * 0.18 + (wb > 4 ? 0.09 : 0), 0.065 + Math.floor(wb / 5) * 0.075, zOf(6) - 0.1), wb % 2 ? '--lgh-cork' : '--lgh-cork-2', false, false);
      [[-0.3, 0.3, 0.7], [0.3, 0.28, 0.8], [-0.05, -0.28, 0.75], [0.32, -0.3, 0.6], [-0.33, -0.05, 0.65]].forEach(function (tr) { tree(at(fileX + tr[0], 0.03, zOf(7) + tr[1], tr[0] * 2), tr[2]); });
      // And the forest of the seventh square runs on into its neighbours,
      // as a forest does.
      [[-1, 0.3, 0.7], [-1, -0.25, 0.6], [1, 0.1, 0.65], [1, -0.32, 0.75]].forEach(function (tr) { tree(at(fileX + tr[0] * SQ + tr[1] * 0.8, 0.03, zOf(7) + tr[1], tr[1] * 3), tr[2]); });
      // Alice's file, outlined in red, and the eighth square's crown waiting.
      [-1, 1].forEach(function (s) { box(0.035, 0.006, 8 * SQ, at(fileX + s * SQ / 2, 0.013, BZ - 4 * SQ), '--lgh-red', false, false); });
      box(SQ, 0.006, 0.035, at(fileX, 0.013, BZ), '--lgh-red', false, false);
      box(SQ, 0.006, 0.035, at(fileX, 0.013, BZ - 8 * SQ), '--lgh-red', false, false);
      // The White Pawn, one for each square she can stand on, all put away
      // but the one she is on; the pawn in her drawing says which.
      var pawns = {}, crown = null;
      for (var s = 2; s <= 8; s++) {
        var pm = at(fileX, 0, zOf(s)), ps = [];
        ps.push(kit.facets(new T.CylinderGeometry(0.16, 0.2, 0.06, 20), M(pm, at(0, 0.03, 0)), '--lgh-pawn'));
        ps.push(kit.facets(new T.CylinderGeometry(0.07, 0.14, 0.22, 16), M(pm, at(0, 0.17, 0)), '--lgh-pawn'));
        ps.push(kit.facets(new T.TorusGeometry(0.09, 0.025, 8, 18), M(pm, at(0, 0.3, 0, 0, FLAT)), '--lgh-pawn'));
        ps.push(kit.facets(new T.SphereGeometry(0.1, 16, 12), M(pm, at(0, 0.42, 0)), '--lgh-pawn'));
        ps.push(kit.facets(new T.TorusGeometry(0.19, 0.012, 6, 24), M(pm, at(0, 0.005, 0, 0, FLAT)), '--lgh-ink'));
        if (s === 8) {
          crown = [];
          for (var pt = 0; pt < 5; pt++) {
            var ang = pt / 5 * Math.PI * 2;
            crown.push(kit.facets(new T.ConeGeometry(0.03, 0.09, 6), M(pm, at(Math.cos(ang) * 0.075, 0.56, Math.sin(ang) * 0.075)), '--lgh-gilt-2'));
          }
          crown.push(kit.facets(new T.TorusGeometry(0.08, 0.018, 8, 18), M(pm, at(0, 0.51, 0, 0, FLAT)), '--lgh-gilt-2'));
          crown.forEach(function (k) { kit.hide(k, true); });
        }
        if (s !== 2) ps.forEach(function (k) { kit.hide(k, true); });
        pawns[s] = ps;
      }
      var pawnAt = 2;
      function showPawn(sq) {
        pawnAt = sq;
        Object.keys(pawns).forEach(function (k) { pawns[k].forEach(function (mesh) { kit.hide(mesh, Number(k) !== sq); }); });
        crown.forEach(function (k) { kit.hide(k, sq !== 8); });
      }

      var stops = [{ name: 'just through the glass, everything the other way round', x: 0, z: -0.4, yaw: 0 }];

      // THE GLASS YOU CAME THROUGH, on the wall behind you: a gilt oval, the
      // yurt in it back the other way round, as her page's drawing has it,
      // and the rainbow fog lying still in the silver.
      var gm = at(0, 0, FRONT - 0.02, Math.PI), GY = 1.55;
      var oval = new T.TorusGeometry(1.0, 0.09, 10, 40); oval.scale(1, 1.4, 1);
      kit.piece(oval, M(gm, at(0, GY, 0.1)), '--lgh-gilt', 0.015);
      var bead = new T.TorusGeometry(1.0, 0.02, 6, 40); bead.scale(1, 1.4, 1);
      kit.piece(bead, M(gm, at(0, GY, 0.2)), '--lgh-gilt-2', false);
      var crest = new T.SphereGeometry(0.07, 10, 8); crest.scale(1.6, 0.7, 0.6);
      kit.piece(crest, M(gm, at(0, GY + 1.52, 0.14)), '--lgh-gilt', 0.01);
      kit.piece(new T.SphereGeometry(0.035, 8, 6), M(gm, at(0, GY + 1.62, 0.16)), '--lgh-gilt-2', false);
      var face = new T.CircleGeometry(0.98, 40); face.scale(1, 1.4, 1);
      kit.flat(face, M(gm, at(0, GY, 0.06)), '--lgh-silver');
      // The bevel round the glass, a ring of mist a finger wide inside the
      // gilt, and a second, fainter one inside that.
      var bevel = new T.RingGeometry(0.9, 0.98, 40); bevel.scale(1, 1.4, 1);
      see(kit.flat(bevel, M(gm, at(0, GY, 0.065)), '--lgh-mist'), 0.75);
      var bevel2 = new T.RingGeometry(0.86, 0.9, 40); bevel2.scale(1, 1.4, 1);
      see(kit.flat(bevel2, M(gm, at(0, GY, 0.066)), '--lgh-mist'), 0.35);
      // The yurt in it: canvas, the lattice, the poles up to a lit ring, a
      // string of candle points, a bookshelf and a candle on a stand, all
      // turned the other way round by being seen from this side.
      var yv = new T.CircleGeometry(0.9, 40); yv.scale(1, 1.4, 1);
      kit.flat(yv, M(gm, at(0, GY, 0.07)), '--canvas');
      kit.flat(new T.PlaneGeometry(1.7, 1.0), M(gm, at(0, GY - 0.62, 0.075)), '--tent');
      for (var lt = -3; lt <= 3; lt++) {
        box(0.026, 1.0, 0.008, M(gm, at(lt * 0.28, GY - 0.62, 0.08, 0, 0, 0.7)), '--timber', false, false);
        box(0.026, 1.0, 0.008, M(gm, at(lt * 0.28, GY - 0.62, 0.08, 0, 0, -0.7)), '--timber', false, false);
      }
      [-0.5, -0.25, 0, 0.25, 0.5].forEach(function (px) {
        var len = Math.hypot(px, 1.05);
        box(0.022, len, 0.008, M(gm, at(px / 2, GY + 0.45, 0.08, 0, 0, Math.atan2(px, 1.05))), '--timber', false, false);
      });
      kit.flat(new T.RingGeometry(0.07, 0.1, 20), M(gm, at(0, GY + 1.0, 0.085)), '--candle');
      // More of the yurt in the glass: the rug's rings on its floor, a
      // cushion or two, the lantern under the crown, the stove's glow and
      // a second string of lights lower down.
      var rug = new T.RingGeometry(0.3, 0.55, 28); rug.scale(1, 0.35, 1);
      kit.flat(rug, M(gm, at(0, GY - 1.02, 0.082)), '--ember');
      var rug2 = new T.RingGeometry(0.12, 0.28, 24); rug2.scale(1, 0.35, 1);
      kit.flat(rug2, M(gm, at(0, GY - 1.02, 0.083)), '--ivy-2');
      [[-0.3, '--ember-2'], [0.25, '--moonstone-2']].forEach(function (cu) {
        var cush = new T.CircleGeometry(0.11, 14); cush.scale(1, 0.5, 1);
        kit.flat(cush, M(gm, at(cu[0], GY - 0.92, 0.086)), cu[1]);
      });
      box(0.004, 0.42, 0.004, M(gm, at(0, GY + 0.78, 0.086)), '--timber', false, false);
      box(0.1, 0.14, 0.004, M(gm, at(0, GY + 0.5, 0.087)), '--timber', false, false);
      kit.flat(new T.CircleGeometry(0.03, 8), M(gm, at(0, GY + 0.5, 0.092)), '--candle');
      kit.flat(new T.PlaneGeometry(0.18, 0.2), M(gm, at(0.62, GY - 0.55, 0.086)), '--hearth');
      kit.flat(new T.PlaneGeometry(0.1, 0.06), M(gm, at(0.62, GY - 0.55, 0.09)), '--ember-2');
      box(0.5, 0.05, 0.004, M(gm, at(0.4, GY - 0.4, 0.085)), '--timber', false, false);
      box(0.5, 0.05, 0.004, M(gm, at(0.4, GY - 0.72, 0.085)), '--timber', false, false);
      for (var sp = 0; sp < 6; sp++) {
        box(0.045, 0.14 + hash(sp, 1, 1) * 0.08, 0.004, M(gm, at(0.2 + sp * 0.075, GY - 0.3, 0.09)), sp % 2 ? '--tallow-2' : '--tallow-3', false, false);
      }
      box(0.09, 0.22, 0.004, M(gm, at(-0.45, GY - 0.6, 0.09)), '--tallow', false, false);
      kit.flat(new T.CircleGeometry(0.03, 8), M(gm, at(-0.45, GY - 0.44, 0.095)), '--candle');
      // The candle points in the glass, on the string her drawing shows,
      // kept so they can glint.
      var glints = [];
      for (var gp = 0; gp < 11; gp++) {
        var gx = -0.72 + gp * 0.144, p = new T.Vector3(gx, GY + 0.2 + Math.sin(gp * 0.6) * 0.06, 0.1).applyMatrix4(gm);
        glints.push([p.x, p.y, p.z]);
      }
      // The rainbow fog lying in the silver.
      [['--yurt-fog-rose', -0.3, 0.5, 0.4], ['--yurt-fog-sky', 0.35, -0.2, 0.36], ['--yurt-fog-lemon', -0.1, -0.7, 0.3], ['--yurt-fog-lilac', 0.25, 0.85, 0.3], ['--yurt-fog-mint', -0.45, -0.1, 0.26], ['--yurt-fog-peach', 0.5, 0.3, 0.24]].forEach(function (fg, fi) {
        var wisp = new T.CircleGeometry(fg[3], 20); wisp.scale(1.5, 0.8, 1);
        see(kit.flat(wisp, M(gm, at(fg[1], GY + fg[2], 0.1 + fi * 0.003, 0, 0, fi * 0.8)), fg[0]), 0.4);
      });
      // A second, softer layer of fog over the first, larger and fainter, and
      // a breath of it out past the gilt, so the rainbow seems to lie in the
      // glass rather than on it.
      [['--yurt-fog-lilac', 0.1, 0.3, 0.7], ['--yurt-fog-rose', -0.35, -0.4, 0.6], ['--yurt-fog-sky', 0.4, -0.6, 0.55], ['--yurt-fog-mint', -0.2, 0.75, 0.5]].forEach(function (fg, fi) {
        var wisp = new T.CircleGeometry(fg[3], 24); wisp.scale(1.6, 0.9, 1);
        see(kit.flat(wisp, M(gm, at(fg[1], GY + fg[2], 0.13 + fi * 0.003, 0, 0, fi * 1.1)), fg[0]), 0.16);
      });
      [['--yurt-fog-peach', -1.1, 0.9, 0.3], ['--yurt-fog-lemon', 1.15, -0.5, 0.26]].forEach(function (fg, fi) {
        var wisp = new T.CircleGeometry(fg[3], 20); wisp.scale(1.7, 0.7, 1);
        see(kit.flat(wisp, M(gm, at(fg[1], GY + fg[2], 0.2, 0, 0, fi * 0.9)), fg[0]), 0.12);
      });
      // The sheen across the glass.
      see(kit.flat(new T.PlaneGeometry(0.5, 2.4), M(gm, at(-0.4, GY + 0.1, 0.12, 0, 0, 0.35)), '--lgh-mist'), 0.3);
      // A silver haze under the ceiling, the room's own light lying in the air.
      [[-2.2, -3.0], [1.6, -5.5], [-0.5, -8.2]].forEach(function (hz, hi) {
        var haze = new T.CircleGeometry(1.4, 20); haze.scale(1.8, 1, 1);
        see(kit.flat(haze, at(hz[0], H - 0.3 - hi * 0.08, hz[1], hi * 0.5, FLAT), '--lgh-mist'), 0.14);
      });

      // THE GLASS AS A PORTAL (Helen's ask, 2026-11-11, with the yurt's):
      // a halo on the wall, ivy and flowers in her inks up both sides and
      // over the top, little glowing mushrooms at its feet, sparkle in the air
      // round it, and two faeries perched on the ivy.
      var motes = [], flyers = [];
      var PETALS = ['--yurt-fog-rose', '--yurt-fog-peach', '--yurt-fog-lemon', '--yurt-fog-lilac', '--yurt-fog-sky', '--yurt-fog-mint', '--lgh-red', '--lgh-pawn'];
      function bloom(m, n) {
        var head = M(m, at(0, 0.085, 0, 0, -1.1 + hash(n, 61, 1) * 0.6, hash(n, 61, 2) * Math.PI * 2));
        kit.cyl(0.004, 0.006, 0.085, M(m, at(0, 0.042, 0, 0, 0, (hash(n, 61, 3) - 0.5) * 0.5)), '--lgh-hedge', false, 4);
        for (var k = 0; k < 5; k++) {
          var petal = new T.CircleGeometry(0.026 + hash(n, 61, 4) * 0.012, 7); petal.scale(1, 1.5, 1); petal.translate(0, 0.03, 0);
          petal.rotateZ(k / 5 * Math.PI * 2);
          kit.piece(petal, head, PETALS[n % PETALS.length], false);
        }
        kit.flat(new T.CircleGeometry(0.012, 7), M(head, at(0, 0, 0.002)), '--lgh-gilt-2');
      }
      function leafAt(m, n) {
        var lf = new T.SphereGeometry(0.06 + hash(n, 62, 1) * 0.03, 6, 4); lf.scale(1, 0.5, 0.3);
        kit.piece(lf, M(m, at(0, 0, 0, hash(n, 62, 2) * 1.2 - 0.6, 0, hash(n, 62, 3) * 3)), n % 3 ? '--lgh-hedge' : '--lgh-field', false);
      }
      function glowcap(m, sc) {
        kit.cyl(0.012 * sc, 0.016 * sc, 0.07 * sc, M(m, at(0, 0.035 * sc, 0)), '--lgh-cork', false, 6);
        var cap = new T.SphereGeometry(0.045 * sc, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2); cap.scale(1, 0.75, 1);
        kit.flat(cap, M(m, at(0, 0.07 * sc, 0)), '--lgh-pawn');
      }
      function faerie(m, n) {
        var SKINS = ['--cb-fairy-skin-1', '--cb-fairy-skin-2', '--cb-fairy-skin-3', '--cb-fairy-skin-4', '--cb-fairy-skin-5'];
        var HAIRS = ['--cb-fairy-hair-1', '--cb-fairy-hair-2', '--cb-fairy-hair-3', '--cb-fairy-hair-4'];
        var WINGS = ['--cb-fairy-wing-1', '--cb-fairy-wing-2', '--cb-fairy-wing-3', '--cb-fairy-wing-4', '--cb-fairy-wing-5', '--cb-fairy-wing-6', '--cb-fairy-wing-7'];
        var skin = SKINS[n % 5], hair = HAIRS[(n * 3 + 1) % 4], wing = WINGS[(n * 5) % 7];
        var dress = ['--lgh-gilt-2', '--yurt-fog-rose', '--yurt-fog-lilac', '--yurt-fog-mint', '--yurt-fog-sky', '--lgh-red'][n % 6];
        var ms = [], wings = [];
        var body = new T.ConeGeometry(0.045, 0.14, 8); body.translate(0, 0.07, 0);
        ms.push(kit.facets(body, m, dress));
        ms.push(kit.facets(new T.SphereGeometry(0.034, 10, 8), M(m, at(0, 0.165, 0)), skin));
        var hr = new T.SphereGeometry(0.038, 10, 8); hr.scale(1, 0.8, 1);
        ms.push(kit.facets(hr, M(m, at(0, 0.185, -0.009)), hair));
        [-1, 1].forEach(function (sd) {
          var w = new T.CircleGeometry(0.07, 12); w.scale(sd * 1.6, 0.85, 1); w.translate(sd * 0.11, 0.01, 0);
          var wm = kit.flat(w, M(m, at(sd * 0.01, 0.12, -0.016, sd * 0.5, -0.2)), wing);
          wm.material.transparent = true; wm.material.opacity = 0.82; wm.material.side = T.DoubleSide;
          ms.push(wm); wings.push(wm);
        });
        return { meshes: ms, wings: wings };
      }
      var side0 = 2.3 / 2 + 0.14;
      (function portal() {
        var pw = 2.3, ph = 3.0, side = pw / 2 + 0.14;
        var halo = kit.flat(new T.RingGeometry(1.25, 1.42, 48), M(gm, at(0, GY, 0.012)), '--lgh-gilt-2');
        halo.material.transparent = true; halo.material.opacity = 0.3;
        var halo2 = kit.flat(new T.RingGeometry(1.42, 1.56, 48), M(gm, at(0, GY, 0.011)), '--yurt-fog-lilac');
        halo2.material.transparent = true; halo2.material.opacity = 0.2;
        [-1, 1].forEach(function (sd) {
          for (var y = 0.1, k = 0; y < ph + 0.05; y += 0.13, k++) {
            var x = sd * (side + Math.sin(k * 1.3) * 0.05);
            kit.cyl(0.012, 0.014, 0.14, M(gm, at(x, y + 0.06, 0.12, 0, 0, Math.sin(k * 1.3) * 0.25)), '--lgh-hedge', false, 4);
            leafAt(M(gm, at(x + sd * 0.07, y + 0.05, 0.18)), k);
            if (k % 2) leafAt(M(gm, at(x - sd * 0.06, y + 0.1, 0.16)), k + 20);
            if (k % 3 === 1) bloom(M(gm, at(x + sd * 0.1, y, 0.22)), k);
            if (k % 3 === 2) bloom(M(gm, at(x - sd * 0.04, y + 0.04, 0.24)), k + 10);
          }
        });
        for (var t = 0; t <= 14; t++) {
          var u = t / 14, ax = side * Math.cos(Math.PI * (1 - u)), ay = ph + 0.1 + Math.sin(Math.PI * u) * 0.3;
          leafAt(M(gm, at(ax, ay, 0.16)), 100 + t);
          if (t % 3 === 1) bloom(M(gm, at(ax, ay - 0.06, 0.22)), 100 + t);
          if (t % 2) leafAt(M(gm, at(ax, ay + 0.1, 0.22)), 120 + t);
        }
        [[-side - 0.3, 0.6, 0.8], [side + 0.3, 0.52, 1], [-side + 0.05, 0.5, 0.6], [side - 0.02, 0.62, 0.7], [-side - 0.55, 0.9, 0.5], [side + 0.5, 0.85, 0.6]].forEach(function (g, gi) {
          glowcap(M(gm, at(g[0] + (hash(gi, 9, 70) - 0.5) * 0.1, 0, g[1])), g[2]);
        });
        for (var mo = 0; mo < 18; mo++) {
          var ma = hash(mo, 9, 80) * Math.PI * 2, mr = 1.2 + hash(mo, 9, 81) * 0.7;
          var mp = new T.Vector3().setFromMatrixPosition(M(gm, at(Math.cos(ma) * mr, GY + Math.sin(ma) * mr * 0.9, 0.3 + hash(mo, 9, 82) * 0.6)));
          motes.push([mp.x, mp.y, mp.z]);
        }
        var about = new T.Vector3().setFromMatrixPosition(M(gm, at(0, GY, 0.9)));
        var fa = faerie(M(gm, at(-side - 0.02, GY - 0.5, 0.22, 0.6)), 0);
        var fb = faerie(M(gm, at(side + 0.02, GY + 0.6, 0.22, -0.6)), 1);
        flyers.push({ meshes: fa.meshes, wings: fa.wings, about: about, r: 0.9, h: 0.3, period: 7.5 });
        flyers.push({ meshes: fb.meshes, wings: fb.wings, about: about, r: 1.15, h: 0.4, period: 9.5 });
      })();
      // THE SIGN AT THE GLASS, for a headset: the way back named the right way
      // round on one side of the ivy and, as this house would have it, the
      // wrong way round on the other.
      sign('The Faery Yurt', M(gm, at(-2.35, 2.05, 0.03)), { line: 'the way back, through the glass' });
      sign('The Faery Yurt', M(gm, at(2.35, 2.05, 0.03)), { line: 'the way back, through the glass', flip: true });
      // A box to press on the ivy, for the faeries, in a headset or on the stage.
      var faerieTouch = kit.touch(0.5, 0.6, 0.5, M(gm, at(-side0, GY - 0.3, 0.3)));
      stops.push({ name: 'looking back at the glass, the way back into the yurt', x: 0, z: -2.6, yaw: Math.PI, pitch: 0.06 });

      // HER OWN PAGE on the far wall, as the yurt hangs it on its far wall.
      var pw0 = 3.0, ph0 = pw0 * 800 / 1180, py0 = 0.5 + ph0 / 2;
      var pg = at(0, 0, back + 0.02, 0);
      box(pw0 + 0.2, ph0 + 0.2, 0.06, M(pg, at(0, py0, 0)), '--lgh-gilt');
      var frame = kit.screen(1180, 800, pw0, M(pg, at(0, py0, 0.04)), 'Looking-Glass House’s own page, on the far wall');
      sign('Looking-Glass House', M(pg, at(0, py0 + ph0 / 2 + 0.32, 0.03)), { line: 'Helen Edgar\u2019s page hangs here: her yurt, given back in silver' });
      stops.push({ name: 'at the far wall, with her room’s own page on it', x: 0, z: back + 3.0, yaw: 0, page: kit.page, frame: frame });

      // THE PIN BOARD, lifted off her page onto a cork board in a gilt frame
      // on the left-hand wall: every line Carroll wrote, pinned red and white.
      var bm = at(-W / 2 + 0.02, 0, -4.2, LEFT);
      box(3.7, 2.7, 0.06, M(bm, at(0, 1.6, 0.03)), '--lgh-gilt');
      box(3.5, 2.5, 0.05, M(bm, at(0, 1.6, 0.06)), '--lgh-cork');
      // Behind the lift, for the headset: the cards pinned to the cork as
      // paper, a red or a white pin in each, so the board is a board there.
      for (var pc = 0; pc < 14; pc++) {
        var cx = -1.45 + (pc % 5) * 0.72 + (hash(pc, 3, 1) - 0.5) * 0.12, cy = 2.45 - Math.floor(pc / 5) * 0.72 + (hash(pc, 3, 2) - 0.5) * 0.1;
        var tilt = (hash(pc, 3, 3) - 0.5) * 0.2;
        box(0.58, 0.44, 0.006, M(bm, at(cx, cy, 0.09, 0, 0, tilt)), '--lgh-card', false, false);
        for (var ln = 0; ln < 4; ln++) box(0.42 - hash(pc, ln, 4) * 0.14, 0.012, 0.004, M(bm, at(cx - 0.05 + hash(pc, ln, 5) * 0.06, cy + 0.12 - ln * 0.08, 0.094, 0, 0, tilt)), '--lgh-ink-2', false, false);
        kit.piece(new T.SphereGeometry(0.018, 8, 6), M(bm, at(cx, cy + 0.2, 0.1)), pc % 2 ? '--lgh-red' : '--lgh-pawn', false);
      }
      sign('The pin board: Carroll’s lines', M(bm, at(0, 3.05, 0.03)), { small: true });
      var board = kit.lift(frame, '.lgh-board', { w: 760, ww: 3.3, h: 560, m: M(bm, at(0, 0.42, 0.1)) });
      stops.push({ name: 'at the pin board, the lines pinned up in red and white', x: -W / 2 + 2.6, z: -4.2, yaw: LEFT, frame: board.el });

      // THE SQUARES as she wrote them, on a reading stand at the board's side,
      // and the game itself on a stand at the board's foot, where the pawn
      // and the crown are hers to move.
      function stand(m, wid) {
        box(wid, 0.04, 0.4, M(m, at(0, 0.84, 0, 0, -0.35)), '--lgh-cork-2', 0.01);
        box(wid, 0.03, 0.03, M(m, at(0, 0.76, 0.2, 0, -0.35)), '--lgh-cork-2', false, false);
        kit.cyl(0.05, 0.07, 0.82, M(m, at(0, 0.41, -0.08)), '--lgh-cork-2', false, 8);
        kit.cyl(0.08, 0.06, 0.06, M(m, at(0, 0.79, -0.08)), '--lgh-gilt', false, 10);
        kit.cyl(0.26, 0.26, 0.04, M(m, at(0, 0.02, -0.08)), '--lgh-cork-2', false, 16);
        [0, 1, 2].forEach(function (f) { var fa = f / 3 * Math.PI * 2; box(0.08, 0.03, 0.3, M(m, at(Math.sin(fa) * 0.2, 0.03, -0.08 + Math.cos(fa) * 0.2, fa)), '--lgh-cork-2', false, false); });
        // An open book lying on it, for the headset: two leaves of card, a
        // spine between, and the lines of a page down each.
        [-1, 1].forEach(function (sd) {
          box(wid * 0.42, 0.025, 0.34, M(m, at(sd * wid * 0.22, 0.875, 0.0, 0, -0.35, sd * 0.06)), '--lgh-card', false, false);
          for (var ln = 0; ln < 6; ln++) box(wid * 0.3, 0.004, 0.012, M(m, at(sd * wid * 0.22, 0.89, -0.12 + ln * 0.045, 0, -0.35, sd * 0.06)), '--lgh-ink-2', false, false);
        });
        box(0.03, 0.04, 0.36, M(m, at(0, 0.875, 0.0, 0, -0.35)), '--lgh-red', false, false);
      }
      var sm = at(-2.9, 0, -5.9, 0.95);
      stand(sm, 1.4);
      sign('The eight squares', M(sm, at(0, 0.985, -0.25, 0, -0.35)), { small: true });
      var squares = kit.lift(frame, '.lgh-squares', { w: 520, ww: 1.3, h: 520, m: M(sm, at(0, 0.86, 0.1, 0, -0.35)) });
      stops.push({ name: 'at the reading stand, with the eight squares as she wrote them', x: -2.0, z: -4.9, yaw: 0.95, pitch: -0.3, frame: squares.el });
      var qm = at(1.9, 0, -1.1, -0.3);
      stand(qm, 1.7);
      sign('Alice’s game', M(qm, at(0, 0.985, -0.25, 0, -0.35)), { small: true });
      var game = kit.lift(frame, '.lgh-game', { w: 640, ww: 1.6, m: M(qm, at(0, 0.86, 0.1, 0, -0.35)) });
      // The pawn on the floor follows the pawn in her drawing: her script
      // moves that one by its transform, forty units a square.
      kit.follow(game, '[data-lgh-pawn]', function (read, node) {
        var tr = /translate\(\s*[\d.]+\s+([\d.]+)\s*\)/.exec(node.getAttribute('transform') || '');
        var sq = tr ? Math.round((340 - Number(tr[1])) / 40) : 2;
        if (sq >= 2 && sq <= 8) showPawn(sq);
      });
      kit.wire(frame, 'looking-glass-house.js');

      // A CHAIR to sit in (Helen's headset round): a plain cork-wood chair
      // with a cushion of her paper, its seat at knee height.
      function chair(m) {
        box(0.5, 0.05, 0.5, M(m, at(0, 0.45, 0)), '--lgh-cork-2', 0.01);
        box(0.46, 0.05, 0.46, M(m, at(0, 0.5, 0)), '--lgh-card', false, false);
        box(0.5, 0.55, 0.05, M(m, at(0, 0.75, -0.225)), '--lgh-cork-2', 0.01);
        box(0.5, 0.04, 0.05, M(m, at(0, 1.0, -0.225)), '--lgh-gilt-2', false, false);
        [[-0.21, -0.21], [0.21, -0.21], [-0.21, 0.21], [0.21, 0.21]].forEach(function (lg) { kit.cyl(0.025, 0.03, 0.45, M(m, at(lg[0], 0.225, lg[1])), '--lgh-cork-2', false, 8); });
      }
      // By the reading stand, facing the squares; by the mantelpiece, facing the hearth.
      var ch1 = at(-1.95, 0, -4.55, 0.95), ch2 = at(2.75, 0, -5.5, RIGHT);
      chair(ch1); chair(ch2);
      var sitStand = kit.sit({ x: -1.95, z: -4.55, yaw: 0.95, say: 'Sit in the chair by the reading stand', sat: 'You sit by the reading stand, the eight squares in front of you.',
        at: [kit.touch(0.55, 0.6, 0.55, M(ch1, at(0, 0.5, 0)))] });
      var sitHearth = kit.sit({ x: 2.75, z: -5.5, yaw: RIGHT, say: 'Sit by the mantelpiece', sat: 'You sit by the cold hearth, the three things on the shelf above you.',
        at: [kit.touch(0.55, 0.6, 0.55, M(ch2, at(0, 0.5, 0)))] });

      // THE MANTELPIECE on the right-hand wall: a cold hearth with nothing
      // burning in it, and on its shelf the three things Alice finds on the
      // other side of the glass, lifted off her page.
      var fm = at(W / 2 - 0.02, 0, -4.6, RIGHT);
      box(3.6, 1.3, 0.26, M(fm, at(0, 0.65, 0.13)), '--lgh-silver');
      box(2.2, 1.05, 0.2, M(fm, at(0, 0.525, 0.2)), '--lgh-ink-2', false);
      for (var gr = 0; gr < 7; gr++) box(0.03, 0.4, 0.03, M(fm, at(-0.9 + gr * 0.3, 0.2, 0.31)), '--lgh-ink', false, false);
      [-1, 1].forEach(function (sd) { box(0.22, 1.3, 0.3, M(fm, at(sd * 1.5, 0.65, 0.15)), '--lgh-gilt'); });
      box(3.8, 0.1, 0.44, M(fm, at(0, 1.35, 0.22)), '--lgh-gilt', 0.01);
      box(3.8, 0.04, 0.46, M(fm, at(0, 1.42, 0.23)), '--lgh-gilt-2', false, false);
      // On the shelf, for the headset: a book standing on its end with its
      // title band, a little pane of glass in a gilt frame on a stand, and a
      // drum clock on four feet with its face and two hands; the lifts of
      // her three toys stand in front of them on a screen.
      box(0.3, 0.42, 0.08, M(fm, at(-1.25, 1.65, 0.1, 0, 0, 0.08)), '--lgh-red', false);
      box(0.28, 0.4, 0.02, M(fm, at(-1.25, 1.65, 0.15, 0, 0, 0.08)), '--lgh-card', false, false);
      box(0.3, 0.06, 0.082, M(fm, at(-1.25, 1.76, 0.1, 0, 0, 0.08)), '--lgh-gilt-2', false, false);
      box(0.46, 0.36, 0.03, M(fm, at(0, 1.66, 0.1, 0, -0.2)), '--lgh-gilt', false);
      box(0.4, 0.3, 0.012, M(fm, at(0, 1.66, 0.12, 0, -0.2)), '--lgh-silver', false, false);
      see(kit.flat(new T.PlaneGeometry(0.14, 0.28), M(fm, at(-0.08, 1.67, 0.13, 0, -0.2, 0.3)), '--lgh-mist'), 0.5);
      box(0.3, 0.03, 0.16, M(fm, at(0, 1.46, 0.08)), '--lgh-gilt', false, false);
      kit.cyl(0.19, 0.19, 0.1, M(fm, at(1.25, 1.66, 0.1, 0, 0, Math.PI / 2)), '--lgh-gilt', 0.012, 24);
      kit.flat(new T.CircleGeometry(0.16, 24), M(fm, at(1.25, 1.66, 0.152)), '--lgh-card');
      kit.flat(new T.RingGeometry(0.14, 0.155, 24), M(fm, at(1.25, 1.66, 0.153)), '--lgh-ink-2');
      for (var hr = 0; hr < 12; hr++) { var ha = hr / 12 * Math.PI * 2; box(0.012, 0.03, 0.003, M(fm, at(1.25 + Math.sin(ha) * 0.125, 1.66 + Math.cos(ha) * 0.125, 0.154, 0, 0, -ha)), '--lgh-ink', false, false); }
      box(0.012, 0.1, 0.003, M(fm, at(1.25 - 0.02, 1.66 + 0.04, 0.155, 0, 0, 0.45)), '--lgh-ink', false, false);
      box(0.012, 0.07, 0.003, M(fm, at(1.25 + 0.03, 1.66 + 0.02, 0.156, 0, 0, -1.1)), '--lgh-ink', false, false);
      [[-0.12, -0.05], [0.12, -0.05], [-0.12, 0.05], [0.12, 0.05]].forEach(function (ft) { kit.piece(new T.SphereGeometry(0.02, 8, 6), M(fm, at(1.25 + ft[0], 1.465, 0.1 + ft[1])), '--lgh-gilt-2', false); });
      // And the hearth itself deeper: a fire basket, cold, with nothing in it
      // but a little grey ash, and a fender along its foot.
      for (var fb = 0; fb < 5; fb++) box(0.02, 0.22, 0.02, M(fm, at(-0.4 + fb * 0.2, 0.16, 0.36)), '--lgh-ink', false, false);
      box(0.9, 0.02, 0.02, M(fm, at(0, 0.27, 0.36)), '--lgh-ink', false, false);
      var ash = new T.SphereGeometry(0.16, 10, 6); ash.scale(2.2, 0.3, 1);
      kit.piece(ash, M(fm, at(0, 0.05, 0.3)), '--lgh-ink-2', false);
      box(2.4, 0.08, 0.04, M(fm, at(0, 0.04, 0.5)), '--lgh-gilt', false, false);
      sign('The mantelpiece: book, glass and clock', M(fm, at(0, 2.3, 0.03)), { small: true });
      // THINGS TO PICK UP (Helen's headset round), each one mesh so it comes
      // whole to the hand: a spare White Pawn at the board's foot, turned on a
      // lathe; a gilt circlet, a crown without its points, on the shelf by
      // the clock; and one more card pinned to the cork, below the rest.
      var profile = [];
      [[0.11, 0], [0.11, 0.03], [0.05, 0.05], [0.04, 0.14], [0.065, 0.17], [0.03, 0.19], [0.06, 0.24], [0.045, 0.28], [0, 0.29]].forEach(function (pt) { profile.push(new T.Vector2(pt[0], pt[1])); });
      kit.hold(kit.facets(new T.LatheGeometry(profile, 18), at(fileX + 0.62, 0, BZ + 0.32), '--lgh-pawn'), { say: 'the spare White Pawn' });
      kit.hold(kit.facets(new T.CylinderGeometry(0.075, 0.07, 0.06, 8, 1, true), M(fm, at(0.78, 1.5, 0.18)), '--lgh-gilt-2'), { say: 'the gilt circlet' });
      var card = kit.facets(new T.BoxGeometry(0.5, 0.38, 0.008), M(bm, at(1.2, 0.95, 0.09, 0, 0, 0.08)), '--lgh-card');
      kit.hold(card, { say: 'a pinned card' });
      kit.piece(new T.SphereGeometry(0.018, 8, 6), M(bm, at(1.2, 1.12, 0.1)), '--lgh-red', false);
      // PLAQUES for a headset, which shows no page: her own first lines by the
      // glass, copied exactly from her page; and under the book, a line of ours.
      kit.plaque({ face: '"Source Serif 4"', ink: '--lgh-ink', ground: '--lgh-card', edge: '--lgh-gilt', w: 0.9, size: 40,
        m: M(gm, at(-2.55, 1.15, 0.03)),
        lines: ['There is a looking-glass hanging in my yurt where the other rooms have wooden doors, and this is the other side of it. Everything you could see from the yurt is in here, back to front: the lattice, the lights, the candle. My yurt reads pale on dark; in here the glass gives it back dark on pale.'] });
      kit.plaque({ face: '"Source Serif 4"', ink: '--lgh-ink-2', ground: '--lgh-card', edge: '--lgh-gilt-2', w: 0.7, size: 38,
        m: M(fm, at(-1.25, 0.95, 0.27)),
        lines: ['The Jabberwocky verse in the book above is drawn the wrong way round, as Alice first saw it. The words are the real ones, only reversed, so a screen reader hears them the right way.'] });
      var toyBook = kit.lift(frame, '.lgh-toy.lgh-toy--book', { w: 420, ww: 1.05, m: M(fm, at(-1.25, 1.45, 0.3)) });
      var toyPane = kit.lift(frame, '.lgh-toy.lgh-toy--pane', { w: 420, ww: 1.05, m: M(fm, at(0, 1.45, 0.3)) });
      var toyClock = kit.lift(frame, '.lgh-toy.lgh-toy--clock', { w: 380, ww: 0.95, m: M(fm, at(1.25, 1.45, 0.3)) });
      stops.push({ name: 'at the mantelpiece: the looking-glass book, the writing glass and the un-birthday clock', x: W / 2 - 2.5, z: -4.6, yaw: RIGHT, pitch: 0.12, frame: toyBook.el });
      stops.push({ name: 'at the writing glass on the mantelpiece', x: W / 2 - 2.0, z: -4.6, yaw: RIGHT, pitch: 0.18, frame: toyPane.el });
      stops.push({ name: 'at the un-birthday clock on the mantelpiece', x: W / 2 - 2.0, z: -3.7, yaw: RIGHT - 0.3, pitch: 0.18, frame: toyClock.el });

      // TENNIEL'S CUTS OF 1871, four of them, public domain on her page, hung
      // in gilt along both walls past the board and the hearth.
      [[W / 2 - 0.02, -7.4, RIGHT, 0], [W / 2 - 0.02, -8.9, RIGHT, 1], [-W / 2 + 0.02, -7.4, LEFT, 2], [-W / 2 + 0.02, -8.9, LEFT, 3]].forEach(function (cu) {
        var cm = at(cu[0], 0, cu[1], cu[2]);
        box(1.5, 1.6, 0.05, M(cm, at(0, 1.55, 0.03)), '--lgh-gilt');
        box(1.56, 1.66, 0.03, M(cm, at(0, 1.55, 0.02)), '--lgh-gilt-2', false, false);
        box(1.34, 1.44, 0.02, M(cm, at(0, 1.55, 0.06)), '--lgh-gilt-2', false, false);
        box(1.24, 1.34, 0.012, M(cm, at(0, 1.55, 0.07)), '--lgh-card', false, false);
        box(0.3, 0.06, 0.01, M(cm, at(0, 0.78, 0.075)), '--lgh-gilt', false, false);
        sign('Tenniel, 1871', M(cm, at(0, 0.62, 0.03)), { small: true });
        var cut = kit.lift(frame, '.lgh-cut', { w: 460, ww: 1.3, n: cu[3], m: M(cm, at(0, 0.82, 0.07)) });
        stops.push({ name: 'at one of Tenniel’s cuts from 1871, on the ' + (cu[2] === LEFT ? 'left' : 'right') + '-hand wall', x: cu[0] + (cu[2] === LEFT ? 2.4 : -2.4), z: cu[1], yaw: cu[2], pitch: 0.1, frame: cut.el });
      });

      // THE CANDLE POINTS IN THE GLASS, and the sparkle round the portal, on
      // one string of lights: they glint by themselves at MAX, as her page's
      // dial line says the candles in the glass do, and when asked.
      var wallPoints = [];
      for (var wp = 0; wp < 26; wp++) {
        var wz = back + 0.6 + wp * ((D - 1.2) / 25);
        wallPoints.push([-W / 2 + 0.14, 2.5 + Math.sin(wp * 0.9) * 0.06, wz]);
        wallPoints.push([W / 2 - 0.14, 2.5 + Math.cos(wp * 0.9) * 0.06, wz]);
      }
      for (var sb = 0; sb < 16; sb++) motes.push([BX + hash(sb, 5, 1) * 8 * SQ, 1.2 + hash(sb, 5, 2) * 1.4, BZ - hash(sb, 5, 3) * 8 * SQ]);
      stops.push({ name: 'on the second square, up on the hill where the country is laid out below', x: fileX + 0.9, z: zOf(2) + 0.4, yaw: 0.9, pitch: -0.5 });
      stops.push({ name: 'in the forest of the seventh square', x: fileX - 1.6, z: zOf(7) + 0.9, yaw: 0.9, pitch: -0.2 });
      var glinting = kit.lights({ label: 'The candles in the glass', max: true, twinkle: 'Let them glint',
        strings: [kit.bulbs(glints, 0.03, ['--ember-2', '--candle']), kit.bulbs(wallPoints, 0.024, ['--ember-2', '--candle']), kit.bulbs(motes, 0.018, ['--candle', '--lgh-gilt-2'])],
        sets: [{ say: 'Ember and candle, as in her glass', inks: ['--ember-2', '--candle'] },
               { say: 'All candle gold', inks: ['--candle'] },
               { say: 'Silvered', inks: ['--lgh-mist', '--lgh-gilt-2'] }] });
      // The faeries, who fly only when asked.
      var faeries = kit.drift(flyers, { say: 'Let the faeries fly', at: [faerieTouch],
        said: function (on) { return on ? 'The faeries fly round the glass, each on her own slow loop.' : 'The faeries settle on the ivy where they are.'; } });
      // The pawn: her page's own buttons, pressed on the copy lifted off it,
      // so there is still one game and it says what hers says.
      var moveAlice = kit.press({ say: function () { return pawnAt >= 8 ? 'Alice is a Queen on the eighth square' : 'Move Alice one square'; },
        at: pawns[2] ? [kit.touch(1.0, 0.8, 8 * SQ, at(fileX, 0.4, BZ - 4 * SQ))] : [],
        press: function () {
          var b = game.el.querySelector('[data-lgh-move]');
          if (!b) return 'Her game has not come over from her page yet; it is on the stand once it does.';
          if (pawnAt >= 8) return 'She is already on the eighth square, with the crown on.';
          b.click();
          return pawnAt >= 8 ? 'The eighth square: Alice is a Queen, and the crown is on.' : 'Alice moves on to the ' + ['', '', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth'][pawnAt] + ' square.';
        } });
      var backAgain = kit.press({ say: 'Back to the second square', at: [kit.touch(1.7, 0.5, 0.6, M(qm, at(0, 0.9, 0)))],
        press: function () {
          var b = game.el.querySelector('[data-lgh-again]');
          if (!b) return 'Her game has not come over from her page yet.';
          b.click();
          return 'Back to the second square, the crown put away, and the whole board ahead of her again.';
        } });
      stops.push({ name: 'on the board, by Alice’s file, with the pawn to move', x: 1.0, z: -4.6, yaw: 0.5, pitch: -0.42, acts: [moveAlice, backAgain] });
      stops.forEach(function (st) {
        if (/looking back at the glass/.test(st.name)) st.acts = [faeries, glinting];
        if (/just through the glass/.test(st.name)) st.acts = [faeries, glinting];
        if (/game|board, by Alice/.test(st.name)) st.acts = [moveAlice, backAgain];
        if (/reading stand/.test(st.name)) st.acts = [sitStand];
        if (/mantelpiece: the/.test(st.name)) st.acts = [sitHearth];
      });
      // THE STOPS IN A WALKING ORDER (Helen's ask, 2026-11-11, for a headset
      // and a controller, whose bumpers walk them): in through the glass, the
      // game at the board's foot, up the hill of the second square, the pin
      // board and the reading stand on the left, the forest, Tenniel's two
      // cuts on the left, her page on the far wall, the two on the right, the
      // mantelpiece and its three things, and last the glass, the way back.
      var TOUR = [/just through the glass/, /board, by Alice/, /second square/, /pin board/, /reading stand/, /forest of the seventh/,
                  /left-hand wall/, /far wall/, /right-hand wall/, /mantelpiece: the/, /writing glass/, /un-birthday clock/, /looking back at the glass/];
      function tourOf(st) { for (var i = 0; i < TOUR.length; i++) if (TOUR[i].test(st.name)) return i; return TOUR.length; }
      stops = stops.map(function (st, i) { return { st: st, i: i }; })
        .sort(function (a, b) {
          var ta = tourOf(a.st), tb = tourOf(b.st);
          if (ta !== tb) return ta - tb;
          // Two cuts on one wall: the nearer the door first on the left, the
          // farther first on the right, so the walk goes down one side and up the other.
          if (ta === 6) return b.st.z - a.st.z;
          if (ta === 8) return a.st.z - b.st.z;
          return a.i - b.i;
        })
        .map(function (x) { return x.st; });

      return {
        start: { x: 0, z: -0.4, yaw: 0 },
        bounds: { x: [-W / 2 + 0.9, W / 2 - 0.9], z: [back + 1.4, FRONT - 1.0] },
        stops: stops,
        // Offered in a VR headset, as the yurt it opens off is (Ryan's ask,
        // 2026-11-08, for the yurt's subrooms). On a screen this changes
        // nothing. What is lifted off her page is not in the headset, which
        // shows only the picture.
        vr: true
      };
    }
  };
})();

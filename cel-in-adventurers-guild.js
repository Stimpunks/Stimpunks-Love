/* =============================================================================
   The Adventurer's Guild, walked into on Cel Street. Ryan's ask, 2026-10-31:
   back on the street, working down it a room at a time.

   IT IS THE GUILD'S WORLD AND NOBODY ELSE'S (§26): THE ONE TIDY ROOM. Somebody
   has come in and filed everything, so the room is a form you can stand in:
   manila walls ruled in hairlines, a heavy rule of printer's ink round the top
   and a light one under it like the board's masthead, a floor ruled into
   boxes, filing cabinets square to the wall, an unattended counter with a
   vermilion stamp and a tray of the clerk's blue folders on it, and nobody
   behind it. Everything is square to everything else; nothing is rotated and
   nothing overlaps.

   AND IT IS LIT LIKE A PHOTOCOPY, FROM NOWHERE. There is no lamp, no window
   and no sun: one even light the same from every side, so nothing in here has
   a lit face or a dark one and NOTHING CASTS A SHADOW. That is what keeps it
   off the Solarpunk Hermitage, the other room you can read by daylight, which
   has a sun in it and shadows falling away from it. The inked edges are what
   tell one thing from another, as they do on a printed sheet.

   THE BOARD, THE HOUSE RULES AND THE BADGES ARE THE PAGE'S OWN, lifted off it
   by the kit, each on the wall it belongs on and scrolling where it is long.
   The jobs' hints open as on the page. Handing a code in is the page's, on the
   wall behind the counter: nothing here is scored or counted, and nothing in
   this room keeps a stamp. Up the back stair is room 429, the Healing
   Checkpoint, whose front door is on the street; no job sends you to it.

   NOTHING MOVES and nothing makes a sound. Every colour is one the Guild
   declares, by name. It keeps nothing, sends nothing and fetches nothing; its
   page arrives through Cel Street's screen(). tools/make-cel-street.py holds
   each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['adventurers-guild.html'] = {
    name: 'The Adventurer’s Guild',
    faces: ['Rye', '"Public Sans"'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var W = 11, D = 13, H = 3.4, back = -D;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var L = -W / 2, R = W / 2;

      // FROM NOWHERE: one even light the same from every side, with no colour
      // of its own (three.js's ambient light, left at its default), so every
      // surface shows exactly the Guild's colour and nothing casts anything.
      // No lamp is drawn because there is none.
      kit.scene.background = kit.col('--gu-paper');
      kit.scene.add(new T.AmbientLight(undefined, Math.PI));

      // A hairline: a printed rule laid on a surface, square to it.
      function rule(w, h, m) { box(w, h, 0.006, m, '--gu-rule', false, false); }
      function inkRule(w, h, m) { box(w, h, 0.008, m, '--gu-ink', false, false); }

      // THE FLOOR, ruled into boxes like a form.
      box(W + 0.2, 0.1, D + 0.2, at(0, -0.05, back / 2), '--gu-paper-2', false, false);
      for (var fx = L + 1; fx < R; fx += 1) box(0.012, 0.004, D, at(fx, 0.003, back / 2), '--gu-rule', false, false);
      for (var fz = -1; fz > back; fz -= 1) box(W, 0.004, 0.012, at(0, 0.003, fz), '--gu-rule', false, false);

      // THE WALLS and ceiling, manila. An ink skirting along the foot, and
      // round the top the masthead's two rules: a heavy one, a light one.
      box(W, H, 0.2, at(0, H / 2, back - 0.1), '--gu-paper', false, false);
      box(W, H, 0.2, at(0, H / 2, 0.1), '--gu-paper', false, false);
      box(0.2, H, D, at(L - 0.1, H / 2, back / 2), '--gu-paper', false, false);
      box(0.2, H, D, at(R + 0.1, H / 2, back / 2), '--gu-paper', false, false);
      box(W, 0.1, D, at(0, H + 0.05, back / 2), '--gu-paper-2', false, false);
      function trim(len, m) {
        box(len, 0.16, 0.02, M(m, at(0, 0.08, 0.01)), '--gu-ink', false, false);
        box(len, 0.06, 0.02, M(m, at(0, H - 0.2, 0.01)), '--gu-ink', false, false);
        box(len, 0.02, 0.02, M(m, at(0, H - 0.32, 0.01)), '--gu-ink', false, false);
      }
      trim(W, at(0, 0, back));
      trim(W, at(0, 0, 0, Math.PI));
      trim(D, at(L, 0, back / 2, LEFT));
      trim(D, at(R, 0, back / 2, RIGHT));
      // Ruled columns down the walls, square, like the board's cells.
      [-3.5, 3.5].forEach(function (x) { rule(0.012, H - 0.6, at(x, H / 2, back + 0.006)); });
      [-2.5, -9.5].forEach(function (z) { rule(0.012, H - 0.6, M(at(L, 0, z, LEFT), at(0, H / 2, 0.006))); });
      [-1.2, -11.2].forEach(function (z) { rule(0.012, H - 0.6, M(at(R, 0, z, RIGHT), at(0, H / 2, 0.006))); });

      // THE DOOR behind you, shut, a plain panel ruled round.
      box(1.1, 2.2, 0.06, at(-3.6, 1.1, -0.03), '--gu-paper-2', 0.012, false);
      box(0.06, 0.24, 0.06, at(-3.2, 1.05, -0.1), '--gu-ink', false, false);

      // THE NAME, over the board, in the posted-bill face between two rules.
      var name = kit.paper(1400, 200, function (c, w, h) {
        c.fillStyle = kit.ink('--gu-paper'); c.fillRect(0, 0, w, h);
        c.fillStyle = kit.ink('--gu-ink');
        c.fillRect(0, 0, w, 14); c.fillRect(0, h - 6, w, 6);
        c.font = '96px Rye'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText('The Adventurer’s Guild', w / 2, h / 2 + 6);
      });
      kit.sheet(name, 4.2, 4.2 * 200 / 1400, at(0, H - 0.6, back + 0.02));

      // THE JOB BOARD on the back wall: the page's own list of jobs, ruled,
      // under an ink frame, scrolling through every job. Down its left margin
      // the classes, I to III, as the board files them.
      var bw = 3.4, bh = 3.4 * 520 / 980, by = 0.5;
      inkRule(bw + 0.08, 0.04, at(0, by - 0.02, back + 0.02));
      var margin = kit.paper(160, 900, function (c, w, h) {
        c.fillStyle = kit.ink('--gu-paper'); c.fillRect(0, 0, w, h);
        c.fillStyle = kit.ink('--gu-ink'); c.fillRect(w - 6, 0, 6, h);
        c.font = '80px Rye'; c.textAlign = 'center'; c.textBaseline = 'middle';
        ['I', 'II', 'III'].forEach(function (n, i) { c.fillText(n, (w - 6) / 2, 150 + i * 300); });
        c.fillStyle = kit.ink('--gu-rule');
        [300, 600].forEach(function (y) { c.fillRect(20, y, w - 46, 3); });
      });
      kit.sheet(margin, 0.44, bh, at(-bw / 2 - 0.28, by + bh / 2, back + 0.02));

      // THE HOUSE RULES on the left-hand wall, in their ruled box.

      // THE FILING CABINETS along the left-hand wall nearer the board, square
      // to it, a label on every drawer and a handle under it.
      [-7.4, -8.1, -8.8].forEach(function (z) {
        box(0.6, 1.36, 0.64, at(L + 0.32, 0.68, z), '--gu-ink-2', 0.012, false);
        for (var d = 0; d < 4; d++) {
          var y = 0.2 + d * 0.32;
          box(0.02, 0.26, 0.56, at(L + 0.63, y, z), '--gu-ink-2', 0.008, false);
          box(0.012, 0.06, 0.18, at(L + 0.645, y + 0.06, z), '--gu-paper', false, false);
          box(0.02, 0.025, 0.16, at(L + 0.655, y - 0.04, z), '--gu-ink', false, false);
        }
      });

      // THE BADGES on the right-hand wall nearer the board.

      // THE COUNTER, unattended, square to the right-hand wall near the door:
      // a stamp in the clerk's vermilion on its ink pad, and a tray of folders
      // in the clerk's blue. Nobody is behind it. The page is on the wall
      // behind it, and that is where a code is handed in.
      var cx = R - 1.4, cz = -3.6;
      box(0.8, 1.0, 2.2, at(cx, 0.5, cz), '--gu-ink-2', 0.014, false);
      box(0.9, 0.05, 2.3, at(cx, 1.025, cz), '--gu-paper-2', 0.012, false);
      box(0.24, 0.02, 0.16, at(cx - 0.1, 1.06, cz - 0.6), '--gu-ink', false, false);
      box(0.08, 0.06, 0.12, at(cx - 0.1, 1.1, cz - 0.6), '--gu-stamp', 0.006, false);
      kit.cyl(0.025, 0.025, 0.12, at(cx - 0.1, 1.19, cz - 0.6), '--gu-ink', 0.006, 10);
      box(0.4, 0.06, 0.5, at(cx - 0.05, 1.08, cz + 0.4), '--gu-ink-2', 0.008, false);
      [0, 1, 2].forEach(function (k) { box(0.34, 0.012, 0.42, at(cx - 0.05, 1.1 + k * 0.014, cz + 0.4), '--gu-file', false, false); });
      var pw = 3.0, ph = pw * 800 / 1180, py = 1.25 + ph / 2;
      inkRule(pw + 0.1, ph + 0.1, M(at(R, 0, cz, RIGHT), at(0, py, 0.004)));
      var frame = kit.screen(1180, 800, pw, M(at(R, 0, cz, RIGHT), at(0, py, 0.02)), 'The Adventurer’s Guild’s own page, on the wall behind the unattended counter');

      // THE LIFTS COME OFF THE PAGE, so they wait for its screen.
      var board = kit.lift(frame, '.guild-board', { w: 980, h: 520, ww: bw, m: at(0, by, back + 0.04) });
      var rules = kit.lift(frame, '.guild-rules', { w: 760, h: 600, ww: 2.4, m: at(L + 0.02, 0.7, -4.6, LEFT) });
      var badges = kit.lift(frame, '.guild-badges', { w: 980, h: 640, ww: 2.6, m: at(R - 0.02, 0.7, -8.2, RIGHT) });

      // THE BACK STAIR, in the far left-hand corner: a doorway square in the
      // back wall, the first treads going up, and room 429's number on the
      // lintel. It is the guest room's back door; its front door is on the
      // street.
      var sx = L + 1.2;
      box(1.3, 2.3, 0.04, at(sx, 1.15, back + 0.02), '--gu-ink', false, false);
      for (var t = 0; t < 5; t++) box(1.1, 0.2 + t * 0.2, 0.28, at(sx, (0.2 + t * 0.2) / 2, back + 0.14 + (4 - t) * 0.28), '--gu-paper-2', 0.008, false);
      var lintel = kit.paper(400, 120, function (c, w, h) {
        c.fillStyle = kit.ink('--gu-paper'); c.fillRect(0, 0, w, h);
        c.strokeStyle = kit.ink('--gu-ink'); c.lineWidth = 6; c.strokeRect(3, 3, w - 6, h - 6);
        c.fillStyle = kit.ink('--gu-ink'); c.font = '600 54px "Public Sans"';
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText('ROOM 429 ↑', w / 2, h / 2 + 2);
      });
      kit.sheet(lintel, 1.0, 0.3, at(sx, 2.5, back + 0.03));

      return {
        start: { x: -2.0, z: -0.9, yaw: 0 },
        bounds: { x: [L + 1.0, R - 1.0], z: [back + 1.2, -0.6] },
        stops: [
          { name: 'just inside the door, on the ruled floor', x: -2.0, z: -0.9, yaw: 0 },
          { name: 'at the job board, every job filed by class', x: 0, z: back + 3.4, yaw: 0, pitch: 0.06, frame: board.el },
          { name: 'at the house rules, in their ruled box on the wall', x: L + 3.3, z: -4.6, yaw: LEFT, pitch: 0.04, frame: rules.el },
          { name: 'at the filing cabinets, square to the wall', x: L + 2.8, z: -8.1, yaw: LEFT, pitch: -0.14 },
          { name: 'at the badges, each a set of jobs that go together', x: R - 2.9, z: -8.2, yaw: RIGHT, pitch: 0.04, frame: badges.el },
          { name: 'at the unattended counter, the stamp on its ink pad and nobody behind it', x: cx - 1.9, z: cz, yaw: RIGHT, pitch: -0.1 },
          { name: 'at the wall behind the counter, with the guild’s own page, where a code is handed in', x: R - 3.6, z: cz, yaw: RIGHT, pitch: 0.12, page: kit.page, frame: frame },
          { name: 'the Healing Checkpoint', where: 'at the back stair, up to room 429, the Healing Checkpoint', page: 'healing-checkpoint.html', x: sx + 0.6, z: back + 2.6, yaw: 0.2, pitch: 0.12 }
        ]
      };
    }
  };
})();

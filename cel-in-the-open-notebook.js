/* =============================================================================
   The Open Notebook, walked into on Cel Street. Ryan's ask, 2026-10-31: back
   on the street, working down it a room at a time.

   IT IS THE OPEN NOTEBOOK'S WORLD AND NOBODY ELSE'S (§91): a room with one
   window in the back wall and a desk under it, and on the desk a notebook
   lying open at ONE PAGE, the laptop beside it. The light is every hour at
   once. The page on the desk is the room's own drawing of the day, lifted off
   it, and the same hours lie on the floor in front of the window, read off
   that drawing once it arrives: the long blue patch from the left at dawn,
   the square one at noon, the long rose one from the right at dusk, side by
   side as the page keeps them. Nothing travels across the floor.

   THE ZIBALDONE IS THE ONE TO WATCH, and it is next door on Cel Street: there
   you are small enough to walk up the gutter of a bound book, lit by one lamp
   raking in from the left. Here you are your own size in a room, the notebook
   is one page with no fold, there is no lamp at all, and the light is the
   window's, at every hour. The tape on the walls is laid straight, and nothing
   in the room is cut or turned (the Zine Table's).

   RYAN'S PIECE IS HIS, ON THE WALL AS THE PAGE HAS IT: lifted off the page,
   never redrawn or paraphrased, taped up with washi laid straight across its
   corners. The collection and the monthly log are the page's own racks,
   lifted beside it, and rack.js, the page's own script, plays a video where
   it hangs or puts it up on the laptop on the desk; nothing reaches YouTube
   until a press. The sticker drawer stays on the page, on the wall.

   NOTHING MOVES. Every colour is one the room declares, by name. It keeps
   nothing, sends nothing and fetches nothing; its page arrives through Cel
   Street's screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['the-open-notebook.html'] = {
    name: 'The Open Notebook',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var W = 10, D = 11, H = 3.4, back = -D;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2, FLAT = -Math.PI / 2;

      // DAYLIGHT, from no one hour: the room lit evenly off its pale walls,
      // and nothing casting a shadow, because a shadow would be one hour's.
      kit.scene.background = kit.col('--onb-page');
      kit.scene.add(new T.HemisphereLight(kit.col('--onb-noon'), kit.col('--onb-shade'), 1.5));
      var day = new T.DirectionalLight(kit.col('--onb-card'), 1.1);
      day.position.set(2, 7, 4); day.target.position.set(0, 0, -6);
      kit.scene.add(day, day.target);

      // THE ROOM: the floor in the page's shade, where no sun is, paper walls,
      // a pale ceiling, and the door you came in by behind you.
      box(W, 0.1, D + 0.4, at(0, -0.05, -D / 2), '--onb-shade', false, false);
      box(0.3, H, D, at(-W / 2 - 0.15, H / 2, -D / 2), '--onb-page');
      box(0.3, H, D, at(W / 2 + 0.15, H / 2, -D / 2), '--onb-page');
      box(W + 0.6, H, 0.3, at(0, H / 2, 0.15), '--onb-page');
      box(W + 0.6, 0.2, D + 0.6, at(0, H + 0.1, -D / 2), '--onb-card', false, false);
      [[-W / 2 + 0.02, -D / 2, LEFT, D], [W / 2 - 0.02, -D / 2, RIGHT, D], [0, -0.02, Math.PI, W], [0, back + 0.02, 0, W]].forEach(function (w) {
        box(w[3], 0.12, 0.04, at(w[0], 0.06, w[1], w[2]), '--onb-dot', false);
      });
      box(1.2, 2.2, 0.08, at(0, 1.1, -0.04), '--onb-card', 0.015);
      cyl(0.03, 0.03, 0.14, at(0.45, 1.05, -0.12, 0, Math.PI / 2), '--onb-dim', false, 8);

      // THE BACK WALL AND ITS WINDOW, four panes in a cross: the wall in
      // pieces round the opening, the frame and its mullions, the sill.
      var WX = 0.9, WY0 = 1.0, WY1 = 2.9;
      box((W - 2 * WX) / 2 + 0.3, H, 0.3, at(-(W + 2 * WX) / 4 - 0.075, H / 2, back - 0.15), '--onb-page');
      box((W - 2 * WX) / 2 + 0.3, H, 0.3, at((W + 2 * WX) / 4 + 0.075, H / 2, back - 0.15), '--onb-page');
      box(2 * WX, WY0, 0.3, at(0, WY0 / 2, back - 0.15), '--onb-page');
      box(2 * WX, H - WY1, 0.3, at(0, (WY1 + H) / 2, back - 0.15), '--onb-page');
      kit.flat(new T.PlaneGeometry(2 * WX, WY1 - WY0), at(0, (WY0 + WY1) / 2, back - 0.25), '--onb-noon');
      [-1, 1].forEach(function (s) { box(0.08, WY1 - WY0 + 0.08, 0.14, at(s * WX, (WY0 + WY1) / 2, back - 0.1), '--onb-dim'); });
      box(2 * WX + 0.08, 0.08, 0.14, at(0, WY1, back - 0.1), '--onb-dim');
      box(2 * WX + 0.2, 0.06, 0.24, at(0, WY0 - 0.03, back + 0.02), '--onb-dim');
      box(0.05, WY1 - WY0, 0.08, at(0, (WY0 + WY1) / 2, back - 0.12), '--onb-dim', false);
      box(2 * WX, 0.05, 0.08, at(0, (WY0 + WY1) / 2, back - 0.12), '--onb-dim', false);

      // THE DESK under the window, and a chair pulled up to it.
      var DZ = back + 0.5, DH = 0.76;
      box(3.2, 0.05, 0.9, at(0, DH - 0.025, DZ), '--onb-dim', 0.012);
      [[-1.5, -0.35], [1.5, -0.35], [-1.5, 0.35], [1.5, 0.35]].forEach(function (l) {
        box(0.05, DH - 0.05, 0.05, at(l[0], (DH - 0.05) / 2, DZ + l[1]), '--onb-dim', false);
      });
      var ch = at(-0.5, 0, DZ + 1.05, Math.PI + 0.2);
      box(0.46, 0.04, 0.44, M(ch, at(0, 0.46, 0)), '--onb-laptop', 0.01);
      box(0.46, 0.5, 0.04, M(ch, at(0, 0.74, -0.2)), '--onb-laptop', 0.01);
      [[-0.2, -0.19], [0.2, -0.19], [-0.2, 0.19], [0.2, 0.19]].forEach(function (l) {
        cyl(0.015, 0.015, 0.46, M(ch, at(l[0], 0.23, l[1])), '--onb-laptop', false, 6);
      });

      // THE NOTEBOOK lying open at one page, its cover under it in the pen's
      // blue, a pen beside it: the page is the room's own drawing of the day,
      // lifted off the page and laid flat on the desk.
      var NX = -0.6;
      box(1.14, 0.02, 0.44, at(NX, DH + 0.01, DZ), '--onb-pen', 0.008);
      cyl(0.008, 0.008, 0.16, at(NX + 0.66, DH + 0.012, DZ + 0.05, 0.3, 0, Math.PI / 2), '--onb-pen', false, 6);
      var frameZ = DZ + 0.2;
      var screenM, pageFrame;

      // THE ROOM'S OWN PAGE, on the back wall left of the window.
      var pw = 2.4, ph = pw * 800 / 1180, py = 0.85 + ph / 2;
      box(pw + 0.12, ph + 0.12, 0.04, at(-3.3, py, back + 0.02), '--onb-dim', 0.01);
      screenM = at(-3.3, py, back + 0.05);
      pageFrame = kit.screen(1180, 800, pw, screenM, 'The Open Notebook’s own page, on the back wall beside the window');

      var notebook = kit.lift(pageFrame, '.onb-day', { w: 1000, ww: 1.06, bare: true, m: at(NX, DH + 0.022, frameZ, 0, FLAT) });

      // THE SAME HOURS ON THE FLOOR in front of the window, read off that
      // drawing once it arrives, each patch where the page keeps it: the page's
      // left is the floor's left, its top the end nearest the window.
      var HOURS = { '--onb-dawn': 1, '--onb-morning': 1, '--onb-noon': 1, '--onb-afternoon': 1, '--onb-dusk': 1 };
      var laid = false;
      kit.follow(notebook, '.onb-day', function (read, node) {
        if (laid) return;
        laid = true;
        Array.prototype.forEach.call(node.querySelectorAll('.onb-day__light path'), function (p, i) {
          var ink = /var\((--onb-[a-z]+)\)/.exec(p.getAttribute('fill') || '');
          if (!ink || !HOURS[ink[1]]) return;
          var n = (p.getAttribute('d') || '').match(/-?\d+(\.\d+)?/g);
          if (!n || n.length < 8) return;
          var shape = new T.Shape();
          for (var k = 0; k + 1 < n.length; k += 2) {
            var X = (parseFloat(n[k]) - 500) * 0.0088, Z = back + 1.25 + parseFloat(n[k + 1]) * 0.0105;
            if (k) shape.lineTo(X, -Z); else shape.moveTo(X, -Z);
          }
          kit.flat(new T.ShapeGeometry(shape), at(0, 0.004 + i * 0.0004, 0, 0, FLAT), ink[1]);
        });
      });

      // THE LAPTOP beside it, its lid up, and on the lid the page's own laptop:
      // what goes up on it from either rack plays there.
      var LX = 0.85;
      box(0.9, 0.025, 0.6, at(LX, DH + 0.0125, DZ + 0.05), '--onb-laptop', 0.008);
      var lid = at(LX, DH + 0.025, DZ - 0.25, 0, -0.22);
      box(0.9, 0.6, 0.02, M(lid, at(0, 0.3, -0.012)), '--onb-laptop', 0.008);
      var laptop = kit.lift(pageFrame, '.onb-laptop', { w: 640, ww: 0.82, m: M(lid, at(0, 0.0, 0.002)) });
      // What is on it now, and the way to take it off, on the wall beside it,
      // each there only while something is up.
      var now = kit.lift(pageFrame, '.onb-laptop__now', { w: 520, ww: 0.95, m: at(1.65, 1.25, back + 0.02) });
      kit.lift(pageFrame, '.onb-laptop__back', { w: 520, ww: 0.95, m: at(1.65, 1.0, back + 0.02) });

      // RYAN'S PIECE on the left-hand wall, taped up at its corners with washi
      // laid straight; the collection the videos in it were pulled into beside
      // it, nearer the window.
      var TAPE = ['--onb-washi-sage', '--onb-washi-blush', '--onb-washi-butter', '--onb-washi-sky'];
      function taped(m, w, top, t) {
        [[-1, 0], [1, 0], [-1, top], [1, top]].forEach(function (c, k) {
          if (c[1] === null) return;
          box(0.28, 0.07, 0.006, M(m, at(c[0] * (w / 2 - 0.06), c[1], 0.004)), TAPE[(t + k) % TAPE.length], false);
        });
      }
      var wl = function (z, y) { return at(-W / 2 + 0.02, y, z, LEFT); };
      var wr = function (z, y) { return at(W / 2 - 0.02, y, z, RIGHT); };
      var PIECE = { w: 760, h: 820, ww: 2.2 }, pieceFoot = 0.55;
      var pieceM = wl(-3.0, pieceFoot);
      var piece = kit.lift(pageFrame, '.onb-piece', { w: PIECE.w, h: PIECE.h, ww: PIECE.ww, m: pieceM });
      taped(pieceM, PIECE.ww, PIECE.h * PIECE.ww / PIECE.w, 0);
      var COLL = { w: 760, h: 760, ww: 2.0 };
      var collM = wl(-7.4, 0.6);
      var coll = kit.lift(pageFrame, '.onb-racked', { n: 0, w: COLL.w, h: COLL.h, ww: COLL.ww, m: collM });
      taped(collM, COLL.ww, COLL.h * COLL.ww / COLL.w, 1);

      // ON THE RIGHT-HAND WALL: the questions our community carried away, and
      // the monthly log, nearer the window.
      var QS = { w: 760, h: 800, ww: 2.0 };
      var qsM = wr(-3.0, 0.65);
      var qs = kit.lift(pageFrame, '.onb-part', { n: 0, w: QS.w, h: QS.h, ww: QS.ww, m: qsM });
      taped(qsM, QS.ww, null, 2);
      var LOG = { w: 860, h: 840, ww: 2.3 };
      var logM = wr(-7.3, 0.55);
      var log = kit.lift(pageFrame, '.onb-racked', { n: 1, w: LOG.w, h: LOG.h, ww: LOG.ww, m: logM });
      taped(logM, LOG.ww, LOG.h * LOG.ww / LOG.w, 3);
      kit.wire(pageFrame, 'rack.js');

      // THE BACK WALL right of the window: what the notebook keeps.
      var keepsM = at(3.3, 0.8, back + 0.02);
      var keeps = kit.lift(pageFrame, '.onb-part', { n: 5, w: 640, h: 760, ww: 1.9, m: keepsM });
      taped(keepsM, 1.9, null, 1);

      // BY THE DOOR, facing in: the notebook's name over it, and whose it is
      // beside it.
      var head = kit.lift(pageFrame, '.onb-head', { w: 760, ww: 2.0, m: at(0, 2.35, -0.02, Math.PI) });
      var whose = kit.lift(pageFrame, '.onb-part', { n: 6, w: 640, h: 700, ww: 1.7, m: at(-2.6, 0.8, -0.02, Math.PI) });

      return {
        start: { x: 0, z: -1.0, yaw: 0 },
        bounds: { x: [-W / 2 + 1.0, W / 2 - 1.0], z: [DZ + 1.3, -0.7] },
        stops: [
          { name: 'just inside the door, the window across the room and every hour on the floor in front of it', x: 0, z: -1.0, yaw: 0, pitch: -0.05 },
          { name: 'standing in the hours on the floor, dawn on your left and dusk on your right', x: 0, z: back + 5.4, yaw: 0, pitch: -0.5 },
          { name: 'at the desk, the notebook lying open at one page with the whole day on it', x: NX, z: DZ + 1.2, yaw: 0, pitch: -0.75, frame: notebook.el },
          { name: 'at the laptop beside it, where what goes up from either rack plays', x: LX, z: DZ + 1.25, yaw: 0, pitch: -0.3, frame: laptop.el },
          { name: 'at the back wall, with the room’s own page on it beside the window', x: -3.3, z: back + 2.7, yaw: 0, pitch: 0.05, page: kit.page, frame: pageFrame },
          { name: 'at Ryan’s piece, taped up on the left-hand wall', x: -W / 2 + 2.5, z: -3.0, yaw: LEFT, pitch: 0.12, frame: piece.el },
          { name: 'at the collection the piece’s videos were pulled into, on the left-hand wall', x: -W / 2 + 2.4, z: -7.4, yaw: LEFT, pitch: 0.12, frame: coll.el },
          { name: 'at the questions to carry forward, on the right-hand wall', x: W / 2 - 2.4, z: -3.0, yaw: RIGHT, pitch: 0.12, frame: qs.el },
          { name: 'at the monthly log, on the right-hand wall', x: W / 2 - 2.6, z: -7.3, yaw: RIGHT, pitch: 0.12, frame: log.el },
          { name: 'at what the notebook keeps, on the back wall right of the window', x: 3.3, z: back + 2.6, yaw: 0, pitch: 0.05, frame: keeps.el },
          { name: 'looking back at the door, the notebook’s name over it and whose it is beside it', x: -1.0, z: -3.2, yaw: Math.PI, pitch: 0.15, frame: head.el }
        ]
      };
    }
  };
})();

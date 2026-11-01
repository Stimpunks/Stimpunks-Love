/* =============================================================================
   Rescue A Cat, walked into on Cel Street. Ryan's ask, 2026-10-31: back on the
   street, working down it a room at a time.

   IT IS RESCUE A CAT'S WORLD AND NOBODY ELSE'S (§87): this end of the street
   with the lights out. The lamps are dark, the windows are dark, and the one
   light is a torch, the room's own: on the page it is in your hand, and a
   scene that cannot follow a hand has it set down on the kerb where you came
   in, still on, pointing the way you were looking, which is the job marker's
   own picture. Its beam goes down the road, and THE ONLY COLOUR ANYWHERE IS
   EYESHINE: pairs of eyes in the dark, under the parked car, halfway up a
   drainpipe, along the top of a garden wall and in a soggy cardboard box,
   sending the beam back the way it came. Two points at a time, paired and
   looking at you, which is what holds it off Stay Frosty's thousand beads of
   damp; a small beam on the ground and not level headlights on a sign, which
   holds it off the Outskirts; and nothing lit to go into, which holds it off
   the Small Hours' diner. Rescue A Dog is a low winter sun on snow, and
   nothing here is white, low or sunlit.

   NO CAT IS DRAWN, ONLY EYES. The cats waiting are the shelter's, on its
   page, each in its own torch pool, and a cat drawn here would be a cat the
   shelter does not have; so the eyes are anybody's, nobody is named, nothing
   says how many, and nothing says who brought anybody in. THE SHELTER IS NOT
   DRAWN AS A ROOM either (§87): a warm one would be the yurt, the burrow and
   the checkpoint over again.

   THE PAGE IS ON A BOARD BY THE KERB, and rescuing and adopting are done
   there, on its screen, because shelter.js talks to the CB and is never run
   here; what is lifted off it is only what stands still, the shelter's name
   and its rules.

   NOTHING MOVES: no eye blinks, no tail twitches, at any setting. Every
   colour is one Rescue A Cat declares, by name. It keeps nothing, sends
   nothing and fetches nothing; its page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['rescue-a-cat.html'] = {
    name: 'Rescue A Cat',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var HX = -6, WX = 5.6, END = -18;

      // THE LIGHTS OUT: a night with almost nothing in it, enough to find the
      // kerb by, and the torch.
      kit.scene.background = kit.col('--rac-night');
      kit.scene.add(new T.HemisphereLight(kit.col('--rac-panel'), kit.col('--rac-night'), 0.8));
      var torch = { x: 3.1, y: 0.2, z: -0.6 };
      var beam = new T.SpotLight(kit.col('--rac-beam'), 90, 26, 0.36, 0.55, 1.1);
      beam.position.set(torch.x, torch.y + 0.08, torch.z);
      beam.target.position.set(-0.6, 0, -11);
      beam.castShadow = true;
      beam.shadow.mapSize.set(1024, 1024);
      beam.shadow.bias = -0.0008; beam.shadow.normalBias = 0.02;
      kit.scene.add(beam, beam.target);

      // THE TORCH, set down on the kerb, still on.
      var tg = at(torch.x, torch.y - 0.12, torch.z, Math.atan2(torch.x + 0.6, torch.z + 11));
      cyl(0.07, 0.07, 0.42, M(tg, at(0, 0.08, 0.1, 0, Math.PI / 2)), '--rac-fall', 0.01, 12);
      cyl(0.1, 0.08, 0.1, M(tg, at(0, 0.08, -0.14, 0, Math.PI / 2)), '--rac-fall', 0.01, 12);
      kit.flat(new T.CircleGeometry(0.085, 18), M(tg, at(0, 0.08, -0.192, Math.PI)), '--rac-beam');

      // THE STREET: the road, a pavement either side with its kerb, the
      // terrace on the left, a garden wall on the right, and a wall across
      // the far end where the street stops.
      box(16, 0.1, -END + 4, at(0, -0.05, END / 2 + 1), '--rac-panel', false, false);
      box(2.5, 0.14, -END + 4, at(HX + 1.25, 0.07, END / 2 + 1), '--rac-panel', false);
      box(2.1, 0.14, -END + 4, at(WX - 1.05, 0.07, END / 2 + 1), '--rac-panel', false);
      box(0.12, 0.16, -END + 4, at(HX + 2.5, 0.08, END / 2 + 1), '--rac-fall', false);
      box(0.12, 0.16, -END + 4, at(WX - 2.1, 0.08, END / 2 + 1), '--rac-fall', false);
      box(16, 2.4, 0.4, at(0, 1.2, END - 0.2), '--rac-stripe', 0.02);
      box(16, 0.12, 0.5, at(0, 2.46, END - 0.2), '--rac-fall', false);

      // The terrace: three house fronts in dark brick, a door and two windows
      // each, every one of them unlit, and a drainpipe down between the
      // second and the third.
      for (var h = 0; h < 3; h++) {
        var hz = -h * 6 - 3;
        var hg = at(HX, 0, hz, LEFT);
        box(6, 6.2, 0.4, M(hg, at(0, 3.1, -0.2)), '--rac-stripe', 0.02);
        box(1.1, 2.2, 0.1, M(hg, at(-1.6, 1.1, 0.02)), '--rac-night', 0.01);
        box(0.1, 0.1, 0.06, M(hg, at(-1.2, 1.1, 0.08)), '--rac-fall', false);
        [[0.9, 1.6], [-1.6, 4.3], [0.9, 4.3]].forEach(function (w) {
          box(1.3, 1.3, 0.08, M(hg, at(w[0], w[1], 0.02)), '--rac-night', 0.01);
          box(1.5, 0.1, 0.16, M(hg, at(w[0], w[1] - 0.7, 0.06)), '--rac-fall', false);
        });
        box(6.1, 0.3, 0.5, M(hg, at(0, 6.3, -0.15)), '--rac-fall', false);
      }
      var pipeZ = -9;
      cyl(0.06, 0.06, 6.1, at(HX + 0.12, 3.05, pipeZ), '--rac-fall', 0.01, 8);
      [1.2, 3.0, 4.8].forEach(function (y) { box(0.18, 0.06, 0.18, at(HX + 0.12, y, pipeZ), '--rac-fall', false); });

      // The garden wall on the right, low, with dark hedges behind it.
      box(0.4, 1.1, -END, at(WX + 0.2, 0.55, END / 2), '--rac-fall', 0.015);
      for (var g = 0; g < 7; g++) {
        kit.facets(new T.DodecahedronGeometry(1.1, 0), at(WX + 1.3, 1.3, -1.5 - g * 2.4, g * 0.7), '--rac-panel');
      }

      // The street lamps, both out.
      [[HX + 2.3, -5.5], [WX - 1.9, -12.5]].forEach(function (l) {
        cyl(0.07, 0.09, 4.6, at(l[0], 2.3, l[1]), '--rac-fall', 0.01, 8);
        box(0.7, 0.08, 0.08, at(l[0] + (l[0] < 0 ? 0.3 : -0.3), 4.55, l[1]), '--rac-fall', false);
        box(0.5, 0.22, 0.32, at(l[0] + (l[0] < 0 ? 0.6 : -0.6), 4.45, l[1]), '--rac-night', 0.01);
      });

      // A car parked at the kerb on the right, its windows dark.
      var car = at(WX - 3.15, 0, -6.6);
      box(1.8, 0.7, 4.2, M(car, at(0, 0.62, 0)), '--rac-panel', 0.02);
      box(1.6, 0.55, 2.2, M(car, at(0, 1.24, 0.2)), '--rac-panel', 0.02);
      box(1.64, 0.4, 2.0, M(car, at(0, 1.26, 0.2)), '--rac-night', false);
      [[-0.9, 1.35], [0.9, 1.35], [-0.9, -1.35], [0.9, -1.35]].forEach(function (w) {
        cyl(0.34, 0.34, 0.24, M(car, at(w[0], 0.34, w[1], 0, 0, Math.PI / 2)), '--rac-night', 0.01, 14);
      });

      // A soggy cardboard box against the far wall, its flaps open.
      var bx = at(1.4, 0, END + 0.6, -0.2);
      box(0.8, 0.55, 0.6, M(bx, at(0, 0.275, 0)), '--rac-stripe', 0.012);
      box(0.8, 0.04, 0.32, M(bx, at(0, 0.6, 0.42, 0, -0.9)), '--rac-stripe', 0.008);
      box(0.5, 0.04, 0.26, M(bx, at(-0.47, 0.6, 0, Math.PI / 2, -0.9)), '--rac-stripe', 0.008);

      // THE EYES, a pair at a time, each looking back up the street at the
      // torch, and the only colour in the dark.
      var eyes = function (x, y, z, turn) {
        [-0.055, 0.055].forEach(function (s) {
          kit.flat(new T.CircleGeometry(0.036, 14), at(x + s * Math.cos(turn || 0), y, z - s * Math.sin(turn || 0), turn || 0), '--rac-eye');
        });
      };
      eyes(WX - 3.1, 0.22, -4.42);
      eyes(HX + 0.38, 2.15, pipeZ - 0.05, LEFT * 0.5);
      eyes(WX + 0.1, 1.28, -13.4, -0.4);
      eyes(1.42, 0.44, END + 0.92, -0.2);

      // THE BOARD BY THE KERB, on the right, facing the road, with the
      // shelter's own page on it, its name above, and its rules pasted on
      // the wall across the end of the street.
      var bd = at(WX - 0.4, 0, -2.6, RIGHT);
      var pw = 3.0, ph = pw * 800 / 1180, py = 1.0 + ph / 2;
      [-1, 1].forEach(function (s) { box(0.1, py + ph / 2 + 0.8, 0.1, M(bd, at(s * (pw / 2 + 0.12), (py + ph / 2 + 0.8) / 2, -0.06)), '--rac-fall', 0.01); });
      box(pw + 0.2, ph + 0.2, 0.06, M(bd, at(0, py, -0.03)), '--rac-stripe', 0.012);
      var page = kit.screen(1180, 800, pw, M(bd, at(0, py, 0.02)), 'Rescue A Cat’s own page, on the board by the kerb');
      box(1.95, 0.66, 0.05, M(bd, at(0, py + ph / 2 + 0.5, -0.03)), '--rac-stripe', 0.012);
      var head = kit.lift(page, '.rac-head', { w: 640, ww: 1.8, m: M(bd, at(0, py + ph / 2 + 0.22, 0.02)), drop: 'svg' });
      var rules = kit.lift(page, '.rac-part', { n: 4, w: 640, h: 760, ww: 1.6, m: at(-3.9, 0.32, END + 0.03) });
      var game = kit.lift(page, '.rac-part', { n: 5, w: 640, ww: 1.6, m: at(-1.5, 0.95, END + 0.03) });

      var stops = [
        { where: 'on the kerb by the torch', name: 'on the kerb by the torch, the street dark ahead', x: 1.6, z: 0.2, yaw: 0.12, pitch: -0.05 },
        { where: 'at the board by the kerb', name: 'at the board by the kerb, with the shelter’s own page on it, where cats are rescued and adopted', x: WX - 3.0, z: -2.6, yaw: RIGHT, pitch: 0.12, page: kit.page, frame: page },
        { where: 'under the shelter’s name', name: 'looking up at the shelter’s name over the board', x: WX - 3.2, z: -2.6, yaw: RIGHT, pitch: 0.42, frame: head.el },
        { where: 'by the parked car', name: 'by the parked car, where two eyes shine back from under it', x: 0.6, z: -2.4, yaw: -0.25, pitch: -0.42 },
        { where: 'under the drainpipe', name: 'under the drainpipe, two eyes halfway up it', x: -3.0, z: -7.2, yaw: 0.85, pitch: 0.18 },
        { where: 'along the garden wall', name: 'along the garden wall, two eyes on top of it in the dark', x: 1.6, z: -9.4, yaw: -0.5, pitch: -0.05 },
        { where: 'at the end of the street', name: 'at the end of the street, the soggy cardboard box against the wall', x: 0.8, z: -14.6, yaw: 0.05, pitch: -0.42 },
        { where: 'at the rules on the end wall', name: 'at the end wall, with how rescuing and adopting work pasted on it', x: -3.9, z: END + 3.4, yaw: 0, pitch: -0.14, frame: rules.el },
        { where: 'at where the game came from', name: 'at the end wall, with where the game came from pasted on it', x: -1.5, z: END + 2.2, yaw: 0, pitch: 0.08, frame: game.el }
      ];

      return {
        start: { x: 1.6, z: 0.2, yaw: 0.12 },
        bounds: { x: [HX + 1.0, WX - 0.9], z: [END + 1.2, 0.6] },
        stops: stops
      };
    }
  };
})();

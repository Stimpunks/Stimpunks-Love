/* =============================================================================
   Hear Queer Here, walked into on Cel Street. Ryan's ask, 2026-10-31: back on
   the street, working down it a door at a time.

   IT IS THIS ROOM'S WORLD AND NOBODY ELSE'S (§8): deep space, interference
   fringes, a mono face and a serif arguing, in the street's own neon inks on
   the dark. So the room is the experiment the page argues from, standing in
   the dark with nothing round it but stars: a source on a pedestal throwing
   its light at a barrier with two slits in it, and the pattern landing on a
   detector at the far end, cyan and pink fringes, the room's name lettered
   over them, still unmeasured. There are no walls, because space has none.

   THE ROOM'S WORDS ARE ITS PAGE'S OWN, lifted off it by Cel Street's kit:
   Karen Barad's words and Helen Edgar's on stands either side of the light,
   each credited as on the page; the instrument's two lines and why this is
   not a metaphor on the barrier; and both sets of readings at listening posts
   along the right, every passage in words and the recorded ones playable with
   the page's own players, on a press. The superposition panel is not lifted:
   its buttons are worked by the street's own script, which binds them once on
   the page itself, so they stay on the page, which stands on the left.

   NOTHING MOVES and nothing makes a sound until a player is pressed. The beams
   are drawn and stay where they are. Every colour is one love.css declares,
   by name. It keeps nothing, sends nothing and fetches nothing; its page
   arrives through Cel Street's screen(). tools/make-cel-street.py holds each
   of those.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 41, 374761393) ^ Math.imul(j + 13, 668265263) ^ Math.imul(k + 7, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['hear-queer-here.html'] = {
    faces: ['VT323'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var W = 12, D = 16, back = -D;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      // A straight line of light between two points, drawn once.
      function beam(a, b, r, ink) {
        var A = new T.Vector3(a[0], a[1], a[2]), B = new T.Vector3(b[0], b[1], b[2]);
        var span = B.clone().sub(A), mid = A.clone().add(B).multiplyScalar(0.5);
        var g = new T.CylinderGeometry(r, r, span.length(), 5);
        g.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), span.normalize()));
        kit.flat(g, at(mid.x, mid.y, mid.z), ink);
      }

      // DEEP SPACE: the dark all round, lit faintly violet, a cyan glow at the
      // source and a pink one where the pattern lands.
      kit.scene.background = kit.col('--ink');
      kit.scene.add(new T.HemisphereLight(kit.col('--violet'), kit.col('--ink'), 1.3));
      var src = new T.PointLight(kit.col('--cyan'), 6, 9, 1.4);
      src.position.set(0, 1.6, -1.6);
      var det = new T.PointLight(kit.col('--pink'), 7, 9, 1.4);
      det.position.set(0, 2.2, back + 2.4);
      kit.scene.add(src, det);
      for (var s = 0; s < 220; s++) {
        var sa = hash(s, 1, 1) * Math.PI * 2, se = 0.05 + hash(s, 1, 2) * 1.3, sr = 120;
        kit.flat(new T.CircleGeometry(0.18 + hash(s, 1, 3) * 0.35, 5),
          at(Math.sin(sa) * sr * Math.cos(se), sr * Math.sin(se) - 6, -8 - Math.cos(sa) * sr * Math.cos(se), -sa, 0),
          ['--cyan', '--violet', '--pink', '--ink-3'][s % 4]);
      }

      // THE FLOOR: a dark lab floor ruled in a faint grid, ending in the dark.
      box(W + 6, 0.1, D + 6, at(0, -0.05, -D / 2 + 1), '--ink-2', false, false);
      for (var g = -9; g <= 9; g++) {
        kit.flat(new T.PlaneGeometry(0.02, D + 6), at(g, 0.003, -D / 2 + 1, 0, -Math.PI / 2), '--ink-3');
      }
      for (g = 0; g <= D + 5; g++) {
        kit.flat(new T.PlaneGeometry(W + 6, 0.02), at(0, 0.003, 3.5 - g, 0, -Math.PI / 2), '--ink-3');
      }

      // THE SOURCE on its pedestal, its lens facing the slits.
      box(0.45, 0.9, 0.45, at(0, 0.45, -1.6), '--ink-3', 0.02);
      kit.cyl(0.09, 0.12, 0.36, at(0, 1.02, -1.6, 0, Math.PI / 2), '--violet', 0.015, 14);
      kit.flat(new T.CircleGeometry(0.075, 16), at(0, 1.02, -1.79, Math.PI), '--cyan');

      // THE BARRIER with two slits in it, the slits' edges lit.
      var BZ = -7, BH = 2.2, SX = 0.6, SW = 0.18, Y0 = 0.4, Y1 = 1.9;
      box(4 - SX - SW / 2, BH, 0.2, at(-(4 + SX + SW / 2) / 2, BH / 2, BZ), '--ink-2', 0.02);
      box(4 - SX - SW / 2, BH, 0.2, at((4 + SX + SW / 2) / 2, BH / 2, BZ), '--ink-2', 0.02);
      box(2 * (SX - SW / 2), BH, 0.2, at(0, BH / 2, BZ), '--ink-2', 0.02);
      [-1, 1].forEach(function (e) {
        box(SW, Y0, 0.2, at(e * SX, Y0 / 2, BZ), '--ink-2', false);
        box(SW, BH - Y1, 0.2, at(e * SX, Y1 + (BH - Y1) / 2, BZ), '--ink-2', false);
        [-1, 1].forEach(function (f) {
          kit.flat(new T.BoxGeometry(0.02, Y1 - Y0, 0.22), at(e * SX + f * SW / 2, (Y0 + Y1) / 2, BZ), '--cyan');
        });
      });

      // THE LIGHT, drawn once: from the source to each slit, and from each slit
      // fanning out to the detector.
      [-1, 1].forEach(function (e) {
        beam([0, 1.02, -1.8], [e * SX, 1.15, BZ], 0.012, '--cyan');
        for (var r = 0; r < 5; r++) {
          beam([e * SX, 1.15, BZ - 0.1], [-3.2 + r * 1.6, 1.0 + hash(e + 2, r, 1) * 1.6, back + 1.55], 0.006, '--violet');
        }
      });

      // THE DETECTOR at the far end: where the pattern lands, cyan and pink
      // fringes on the dark, the room's name over them as on the page.
      var DW = 8, DH = 3.6, DZ = back + 1.4;
      box(DW + 0.3, DH + 0.3, 0.2, at(0, 0.3 + DH / 2, DZ - 0.12), '--ink-3', 0.02);
      var fringes = kit.paper(1024, 460, function (c, w, h) {
        c.fillStyle = kit.ink('--ink'); c.fillRect(0, 0, w, h);
        for (var x = 0; x < w; x++) {
          var u = (x - w / 2) / (w / 2), env = Math.exp(-u * u * 1.6);
          var a = Math.pow(Math.cos(u * 15), 2) * env, b = Math.pow(Math.cos(u * 15 + 1.3), 2) * env;
          if (a > 0.45) { c.globalAlpha = a * 0.9; c.fillStyle = kit.ink('--cyan'); c.fillRect(x, 120, 1, h - 120); }
          if (b > 0.55) { c.globalAlpha = b * 0.7; c.fillStyle = kit.ink('--pink'); c.fillRect(x, 120, 1, h - 120); }
        }
        c.globalAlpha = 1;
        c.font = '88px VT323'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillStyle = kit.ink('--pink'); c.fillText('HEAR QUEER HERE', w / 2 + 4, 62);
        c.fillStyle = kit.ink('--green'); c.fillText('HEAR QUEER HERE', w / 2 - 4, 62);
        c.fillStyle = kit.ink('--cyan'); c.fillText('HEAR QUEER HERE', w / 2, 62);
        c.font = '30px VT323'; c.fillStyle = kit.ink('--violet');
        c.fillText('state: unmeasured', w / 2, h - 22);
      });
      kit.sheet(fringes, DW, DH, at(0, 0.3 + DH / 2, DZ));

      // THE ROOM'S OWN PAGE on a stand on the left, with the superposition
      // panel and the rest on it.
      var pw = 3.0, ph = pw * 800 / 1180, py = 0.55 + ph / 2;
      var pg = at(-W / 2 + 0.4, 0, -10.2, LEFT);
      [-1, 1].forEach(function (e) { box(0.08, py, 0.08, M(pg, at(e * (pw / 2 - 0.2), py / 2, -0.08)), '--ink-3', 0.01); });
      box(pw + 0.2, ph + 0.2, 0.06, M(pg, at(0, py, -0.04)), '--ink-3');
      var frame = kit.screen(1180, 800, pw, M(pg, at(0, py, 0.02)), 'Hear Queer Here’s own page, on a stand on the left, with the superposition panel on it');

      // A STAND for a sheet of the page's words, its top at y, facing ry.
      function stand(x, z, ry, y) {
        var m = at(x, 0, z, ry);
        [-1, 1].forEach(function (e) { box(0.05, y, 0.05, M(m, at(e * 0.55, y / 2, -0.05)), '--ink-3', 0.01); });
        box(1.5, 0.05, 0.16, M(m, at(0, y, 0)), '--ink-3', 0.01);
        return M(m, at(0, y + 0.03, 0.02));
      }

      // KAREN BARAD'S WORDS AND HELEN EDGAR'S, either side of the light.
      var bRy = 0.47, hRy = -0.47;
      var barad = kit.lift(frame, '.qcard.qcard--barad', { w: 520, ww: 1.6, m: stand(-2.6, -4.6, bRy, 1.0) });
      var helen = kit.lift(frame, '.qcard.qcard--helen', { w: 520, ww: 1.6, m: stand(2.6, -4.6, hRy, 1.0) });

      // ON THE BARRIER: the instrument's two lines, and why this is not a
      // metaphor.
      var term = kit.lift(frame, '.qcard', { n: 2, w: 520, ww: 1.5, m: at(-2.4, 0.95, BZ + 0.12) });
      var why = kit.lift(frame, '.qcard', { n: 5, w: 620, ww: 1.6, m: at(2.4, 0.5, BZ + 0.12) });

      // THE LISTENING POSTS along the right: every passage in words, and the
      // recorded ones with the page's own players.
      var posts = [{ n: 0, z: -3.8, words: 'monotropism' }, { n: 1, z: -10.2, words: 'developmental pace' }].map(function (p) {
        var m = at(W / 2 - 0.4, 0, p.z, RIGHT);
        box(1.8, 0.5, 0.4, M(m, at(0, 0.25, 0.1)), '--ink-3', 0.02);
        kit.cyl(0.22, 0.12, 0.2, M(m, at(0.75, 0.6, 0.12)), '--violet', 0.015, 14);
        p.it = kit.lift(frame, '.readset', { n: p.n, w: 620, h: 700, ww: 1.6, m: M(m, at(0, 0.52, 0.32)) });
        return p;
      });


      return {
        start: { x: 0, z: 1.2, yaw: 0 },
        bounds: { x: [-W / 2 + 0.6, W / 2 - 0.6], z: [back + 3.2, 2.0] },
        stops: [
          { name: 'at the edge of the dark, where the light comes from', x: 0, z: 1.2, yaw: 0 },
          { name: 'by the source, its light thrown at the two slits', x: 0.9, z: -0.4, yaw: 0.2 },
          { name: 'at Karen Barad’s words, on the left of the light', x: -2.6 + 1.7 * Math.sin(bRy), z: -4.6 + 1.7 * Math.cos(bRy), yaw: bRy, pitch: -0.08, frame: barad.el },
          { name: 'at Helen Edgar’s words, on the right of the light', x: 2.6 + 1.7 * Math.sin(hRy), z: -4.6 + 1.7 * Math.cos(hRy), yaw: hRy, pitch: -0.08, frame: helen.el },
          { name: 'at the barrier, at the instrument’s two lines', x: -2.4, z: BZ + 1.6, yaw: 0, pitch: -0.12, frame: term.el },
          { name: 'at the barrier, at why this is not a metaphor', x: 2.4, z: BZ + 2.1, yaw: 0, pitch: -0.1, frame: why.el },
          { name: 'at the listening post for monotropism', x: W / 2 - 2.7, z: posts[0].z, yaw: RIGHT, pitch: -0.12, frame: posts[0].it.el },
          { name: 'at the listening post for developmental pace', x: W / 2 - 2.7, z: posts[1].z, yaw: RIGHT, pitch: -0.12, frame: posts[1].it.el },
          { name: 'at the detector, where the pattern lands, still unmeasured', x: 0, z: back + 6.4, yaw: 0, pitch: 0.12 },
          { name: 'at the stand on the left, with the room’s own page and its superposition panel', x: -W / 2 + 2.8, z: -10.2, yaw: LEFT, page: kit.page, frame: frame }
        ]
      };
    }
  };
})();

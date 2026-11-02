/* =============================================================================
   Looming Rocks Amphitheatre, walked into on Cel Street: turning 03 off the
   Outskirts. Ryan's ask, 2026-11-01: the road's turnings.

   IT IS THE ROCKS' WORLD AND NOBODY ELSE'S (§38): two enormous rock faces with
   a stage between them, after dark, and THE LIGHT IS THROWN UPWARD. Violet
   floods stand on the ground at the foot of each face and point up it, so a
   face is brightest at its foot and goes dark towards the top, and there is
   nothing overhead at all: the opposite of Sithen one turning back, lit by a
   full moon from directly above, and of the Lagoon, lit flat across water from
   the screen in front of you.

   AND WHAT GLOWS IS NOT THE LAMP. The lichen on the rock takes the violet and
   gives back cyan-green, emission rather than reflection, so its patches are
   drawn as light of their own and not as paint the floods fall on. It stays a
   cyan-green: the Lagoon's acid one turning along is a yellow-green, and if
   this ever warms towards yellow two music rooms on one road share a colour.

   THE STAGE is the page's own set, lifted off it: the screen and the desk on
   the deck, and the running order on a stand in the wing, which the room's own
   looming.js works exactly as it does on the page. While the stage is dark,
   tuning is silent and nothing is fetched; the desk names the act it is about
   to move to and how long that one runs, before the press.

   Every colour is one §38 declares, by name. NOTHING MOVES: no flood sweeps and
   no beam turns. It keeps nothing, sends nothing and fetches nothing; its page
   arrives through Cel Street's screen().
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 19, 374761393) ^ Math.imul(j + 43, 668265263) ^ Math.imul(k + 11, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['looming-rocks.html'] = {
    name: 'Looming Rocks Amphitheatre',
    from: 'the-outskirts.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var FACE = 7.2;                         // the rock faces' inner foot, either side
      var SZ = -13, SD = 6, SW = 10, SH = 0.9; // the stage: its front edge, depth, width, height
      var FIN = 3.4;                          // how far along each slab of rock runs

      // THE DARK, and only a breath of it lifted so the ground is not a hole.
      // The night is the faces' own brown, so the unlit tops stand darker
      // against it than it is.
      kit.scene.background = kit.col('--lr-face');
      kit.scene.fog = new T.Fog(kit.col('--lr-face'), 24, 64);
      kit.scene.add(new T.HemisphereLight(kit.col('--lr-face'), kit.col('--lr-rock'), 0.4));

      // THE GROUND, unlit stone all the way out.
      box(80, 0.1, 90, at(0, -0.05, -14), '--lr-rock', false, false);

      // THE ROCK FACES: slab after slab of stone either side, each with a broken
      // top and a face broken into facets, standing shoulder to shoulder and
      // taller towards the stage, so the rocks loom over it. The parts of a face
      // that stand proud are where the lichen grows.
      var patches = [];
      [-1, 1].forEach(function (s) {
        for (var i = 0; i < 9; i++) {
          var zc = 4 - i * (FIN - 0.4), d = FIN + 0.6;
          var inner = FACE + hash(i, s + 3, 1) * 1.1;
          var h = 11 + i * 1.1 + hash(i, s + 3, 2) * 7, thick = 5, ny = 9, nz = 4;
          var g = new T.BoxGeometry(thick, h, d, 1, ny, nz), pos = g.attributes.position;
          var innerX = s > 0 ? -thick / 2 : thick / 2;
          var proud = {};
          for (var j = 1; j < ny; j++) {
            for (var k = 1; k < nz; k++) {
              if (hash(i * 31 + j, k, s + 40) < 0.34) {
                proud[j + ',' + k] = true;
                patches.push({ s: s, x: s * inner, y: j * h / ny, z: zc - d / 2 + k * d / nz, n: i * 97 + j * 7 + k });
              }
            }
          }
          for (var v = 0; v < pos.count; v++) {
            var x = pos.getX(v), y = pos.getY(v), z = pos.getZ(v);
            var jj = Math.round((y + h / 2) / (h / ny)), kk = Math.round((z + d / 2) / (d / nz));
            var nx = x, ny2 = y;
            if (Math.abs(y - h / 2) < 1e-6) ny2 = y + (hash(Math.round(x * 10) + 50, Math.round(z * 10) + 50, i * 7 + s + 9) - 0.6) * h * 0.3;
            if (Math.abs(x - innerX) < 1e-6 && !proud[jj + ',' + kk]) {
              nx = x + s * (0.25 + 0.6 * hash(jj + 60, kk + 60, i * 5 + s + 11));
            }
            pos.setXYZ(v, nx, ny2, z);
          }
          g.computeVertexNormals();
          g.translate(0, h / 2, 0);
          kit.facets(g, at(s * (inner + thick / 2), 0, zc), '--lr-face');
        }
        // Lower stone in front of the faces' feet, broken and tumbled.
        for (var b = 0; b < 7; b++) {
          var bz = 2.5 - b * 3.6 + hash(b, s, 7) * 1.2, br = 0.5 + hash(b, s, 8) * 0.7;
          var bg = new T.IcosahedronGeometry(1, 0); bg.scale(br * 1.4, br, br * 1.2);
          kit.piece(bg, at(s * (FACE - 0.3 - hash(b, s, 9) * 0.4), br * 0.5, bz, hash(b, s, 10) * 3), '--lr-face');
        }
      });
      // Behind the stage, a long low ridge closing the dark, unlit.
      for (var r = 0; r < 7; r++) {
        var rg = new T.IcosahedronGeometry(1, 0), rr = 3 + hash(r, 9, 1) * 2.5;
        rg.scale(rr * 1.6, rr, rr);
        kit.piece(rg, at(-12 + r * 4, rr * 0.4, -27 - hash(r, 9, 2) * 3, hash(r, 9, 3) * 3), '--lr-rock');
      }
      // Behind the way in, rock either side of the gap you came through.
      [-1, 1].forEach(function (s) {
        for (var w = 0; w < 3; w++) {
          var wg = new T.IcosahedronGeometry(1, 0), wr = 1.6 + hash(w, s, 12) * 1.2;
          wg.scale(wr * 1.3, wr * 1.5, wr);
          kit.piece(wg, at(s * (2.6 + w * 2.0), wr * 0.6, 6.4 + hash(w, s, 13)), '--lr-face');
        }
      });

      // THE LICHEN, fluorescing on the faces: thickest at the foot where the
      // floods are, a few faint patches higher up where the light thins. Light
      // of its own, so it is not lit by anything.
      patches.forEach(function (p) {
        var high = p.y > 4.5;
        if (p.y > 11 || (high && hash(p.n, 3, p.s) > 0.45)) return;
        var rx = (high ? 0.16 : 0.28) + hash(p.n, 1, p.s + 23) * (high ? 0.14 : 0.4);
        var cg = new T.CircleGeometry(1, 14); cg.scale(rx, rx * 0.55, 1);
        var patch = kit.flat(cg, at(p.x - p.s * 0.02, p.y, p.z, p.s > 0 ? RIGHT : LEFT), '--lr-lichen');
        patch.material.transparent = true;
        patch.material.opacity = high ? 0.34 : 0.6 + hash(p.n, 2, p.s + 24) * 0.3;
      });

      // THE FLOODS, standing on the ground at the foot of each face, each a
      // violet lamp in a low housing, pointed straight up the rock. Nothing
      // hangs overhead.
      function flood(x, z, tx, ty, tz) {
        kit.flat(new T.BoxGeometry(0.5, 0.32, 0.42), at(x, 0.16, z), '--lr-uv');
        var lamp = new T.SpotLight(kit.col('--lr-uv'), 130, 26, 0.6, 0.7, 1.3);
        lamp.position.set(x, 0.35, z);
        lamp.target.position.set(tx, ty, tz);
        kit.scene.add(lamp, lamp.target);
      }
      [-1, 1].forEach(function (s) {
        [1.2, -3.6, -8.4, -13.2, -18].forEach(function (z) {
          flood(s * (FACE - 1.1), z, s * (FACE + 0.6), 10, z);
        });
      });

      // THE STAGE between the faces: a dark deck with the lichen's green along
      // its lip, and two floods on its front corners pointed up the rocks
      // behind it.
      box(SW, SH, SD, at(0, SH / 2, SZ - SD / 2), '--lr-face');
      kit.flat(new T.PlaneGeometry(SW, 0.05), at(0, SH - 0.03, SZ + 0.005), '--lr-lichen');
      [-1, 1].forEach(function (s) {
        flood(s * (SW / 2 - 0.4), SZ - 0.4, s * (FACE + 0.4), 9, SZ - SD);
        // the stack of speakers at each end of the deck
        box(0.9, 1.9, 0.8, at(s * (SW / 2 - 0.6), SH + 0.95, SZ - 1.6), '--lr-rock');
        box(0.9, 1.1, 0.8, at(s * (SW / 2 - 0.6), SH + 2.45, SZ - 1.6), '--lr-rock');
      });
      kit.flat(new T.PlaneGeometry(SW - 0.4, 0.05), at(0, SH + 0.01, SZ - SD + 0.4, 0, -Math.PI / 2), '--lr-lichen');

      // THE BENCHES, row on row facing the stage either side of an aisle, dark
      // stone, lit by nothing but what the floods spill.
      for (var row = 0; row < 6; row++) {
        var bzz = -2.8 - row * 1.6;
        [-1, 1].forEach(function (s) {
          box(4.4, 0.42, 0.5, at(s * 3.0, 0.21, bzz), '--lr-face', 0.015);
        });
      }

      // THE ROOM'S OWN PAGE, on a board by the way in.
      var pw = 2.4, ph = pw * 800 / 1180, py = 0.6 + ph / 2;
      box(0.08, ph + 0.14, pw + 0.14, at(-5.45, py, 2.0), '--lr-face', 0.01);
      box(0.12, 0.6, 0.12, at(-5.45, 0.3, 2.0 - pw / 2 + 0.2), '--lr-face', 0.01);
      box(0.12, 0.6, 0.12, at(-5.45, 0.3, 2.0 + pw / 2 - 0.2), '--lr-face', 0.01);
      var frame = kit.screen(1180, 800, pw, at(-5.4, py, 2.0, LEFT), 'Looming Rocks Amphitheatre’s own page, on a board by the way in');

      // THE PAGE'S OWN WORDS, each on a low plinth at the foot of a face, its
      // own ground with it, facing the aisle.
      function plinth(s, z) {
        box(1.7, 0.5, 0.6, at(s * 6.0, 0.25, z), '--lr-face', 0.012);
        return at(s * 5.75, 0.5, z, s > 0 ? RIGHT : LEFT);
      }
      var head = kit.lift(frame, '.amphi', { w: 680, ww: 1.6, m: plinth(-1, -1.75), drop: '.amphi__art' });
      var lede = kit.lift(frame, '.lede', { w: 680, ww: 1.6, m: plinth(1, -1.75) });
      var glow = kit.lift(frame, '.scree', { n: 0, w: 680, ww: 1.6, m: plinth(-1, -6.25) });
      var door = kit.lift(frame, '.scree', { n: 1, w: 680, ww: 1.6, m: plinth(1, -6.25) });
      var whose = kit.lift(frame, '.scree', { n: 2, w: 680, ww: 1.6, m: plinth(1, -10.75) });

      // THE SET, on the deck: the screen and the desk standing at the back of
      // the stage, and the running order on a stand in the left wing.
      var set = kit.lift(frame, '.apron', { w: 900, ww: 5.4, m: at(0, SH + 0.02, SZ - SD + 0.7) });
      box(1.2, 0.95, 0.5, at(-6.1, 0.475, SZ - 1.6), '--lr-face', 0.012);
      var bill = kit.lift(frame, '.setlist', { w: 760, h: 980, ww: 1.8, m: at(-6.1, 0.96, SZ - 1.6, 0.6) });
      kit.wire(frame, 'looming.js');

      return {
        start: { x: 0, z: 2.4, yaw: 0 },
        bounds: { x: [-5.4, 5.4], z: [SZ + 0.6, 3.0] },
        stops: [
          { name: 'at the way in, the rock faces standing either side and the stage between them', x: 0, z: 2.4, yaw: 0, pitch: 0.16 },
          { name: 'at the foot of the left-hand face: the name of the place', x: -2.6, z: -1.75, yaw: LEFT, pitch: 0.05, frame: head.el },
          { name: 'at the foot of the right-hand face: what the rocks are', x: 2.6, z: -1.75, yaw: RIGHT, pitch: 0.05, frame: lede.el },
          { name: 'at the foot of the left-hand face: why the rocks glow', x: -2.6, z: -6.25, yaw: LEFT, pitch: 0.05, frame: glow.el },
          { name: 'at the foot of the right-hand face: the door policy', x: 2.6, z: -6.25, yaw: RIGHT, pitch: 0.05, frame: door.el },
          { name: 'across the aisle from a flood at the foot of the left-hand face, looking up the rock, bright at the bottom and dark at the top', x: -1.6, z: -8.4, yaw: LEFT, pitch: 0.42 },
          { name: 'at the foot of the right-hand face: whose this all is', x: 2.6, z: -10.75, yaw: RIGHT, pitch: 0.05, frame: whose.el },
          { name: 'in front of the stage, at the screen and the desk', x: 0, z: SZ + 0.9, yaw: 0, pitch: 0.2, frame: set.el },
          { name: 'at the running order on its stand in the wing', x: -3.6, z: SZ + 0.9, yaw: Math.atan2(2.5, 3.0), pitch: 0.05, frame: bill.el },
          { name: 'back by the way in, at the room’s own page on its board', x: -2.9, z: 2.0, yaw: LEFT, pitch: 0.04, page: kit.page, frame: frame }
        ]
      };
    }
  };
})();

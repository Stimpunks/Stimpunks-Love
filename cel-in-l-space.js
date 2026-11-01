/* =============================================================================
   L-Space, walked into on Cel Street, through the gap in the stacks past the
   Community Library's 800s. Ryan's ask, 2026-11-01: the rooms behind the doors.

   IT IS THE SHELVING OF EVERY LIBRARY AT ONCE, BENT BY THE WEIGHT IN THE MIDDLE
   (§56). The library you came out of is a room of vertical cases and level
   shelves under high daylight; here the same shelving runs away from you on
   both sides and every line of it bends towards the well at the far end: the
   shelves curve in and down, the uprights lean in, and the books stand at
   right angles to their shelf, smaller the nearer they are to the well, as
   the page's own drawing has them. NOTHING IN IT IS STRAIGHT: even the nearest
   shelf sags and wanders. AND NOTHING IN IT IS LIT: one even light, so nothing
   has a lit face and nothing casts a shadow. There is no floor, no wall, no
   window and no lamp. You stand on nothing in particular.

   THE STRING IS THE ONE CONTINUOUS THING, in --lsp-string. It is tied to the
   shelf beside the gap you came in by, goes loose down the middle of the
   shelving, and at the far end turns off to the left into a gap where there
   should not be one, round a corner that is not there: that is the way on, to
   Oook. The banana it is tied round is past the gap and not drawn here.

   THE RABBIT HOLE IS THE COLLAPSE TO WATCH: a vertical shaft of wet slate,
   daylit from one end. This has no up or down, no daylight at either end,
   and is violet, never grey; nothing in it falls, everything bends. The
   page's words stand in the warp as the page has them, lifted off it, each
   turned towards the middle of the shelving. The Librarian is not drawn,
   here or anywhere. NOTHING MOVES. Every colour is one §56 declares, by name.
   It keeps nothing, sends nothing and fetches nothing; its page arrives
   through Cel Street's screen().
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['l-space.html'] = {
    name: 'L-Space',
    from: 'community-library.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var ONE = new T.Matrix4();

      // NOTHING IS LIT: one even light, nothing that casts a shadow.
      kit.scene.background = kit.col('--lsp-void');
      kit.scene.add(new T.AmbientLight(undefined, Math.PI));

      // THE WARP. A point on the shelving as it would stand in a library (x
      // across, y up, z away) and where the weight of the books has put it:
      // pulled in and towards the height of the well the further away it is,
      // and wandering a little everywhere, so not one line in here is straight.
      var W = 3.0, WELL = { y: 1.7, z: -24 }, RUN = 22;
      function pull(z) { var t = Math.min(Math.max(-z / RUN, 0), 1); return 0.8 * t * t; }
      function warp(x, y, z) {
        var p = pull(z);
        var q = 1 - p * 0.6;
        return new T.Vector3(
          x * (1 - p) + q * (0.55 * Math.sin(z * 0.17 + 0.6) + 0.08 * Math.sin(z * 0.4 + y)),
          WELL.y + (y - WELL.y) * (1 - p) + q * (0.24 * Math.sin(z * 0.27) + 0.07 * Math.sin(z * 0.5 + y * 1.1 + x)),
          z);
      }
      function tube(pts, r, ink) {
        var c = new T.CatmullRomCurve3(pts);
        kit.piece(new T.TubeGeometry(c, Math.max(24, pts.length * 4), r, 6, false), ONE, ink, false, false);
      }

      // THE SHELVES, both sides, every level a line bending into the well.
      var LEVELS = [0.15, 0.65, 1.15, 1.65, 2.15, 2.65, 3.15, 3.65];
      var NEAR = 1.0, FAR = -21.5;
      // The gap in the left-hand shelving at the far end, where the string
      // turns off: no books there, a hole where there should not be one.
      var GAP = { z0: -17.7, z1: -15.7, top: 2.7 };
      function inGap(s, y, z) { return s < 0 && z < GAP.z1 && z > GAP.z0 && y < GAP.top; }
      [-1, 1].forEach(function (s) {
        LEVELS.forEach(function (y) {
          // Broken where the gap is, so nothing stands across the way on.
          var pts = [];
          for (var z = NEAR; z >= FAR; z -= 0.25) {
            if (inGap(s, y, z)) { if (pts.length > 1) tube(pts, 0.028, '--lsp-shelf'); pts = []; continue; }
            pts.push(warp(s * W, y, z));
          }
          if (pts.length > 1) tube(pts, 0.028, '--lsp-shelf');
        });
        // The uprights, every so often, leaning in as the shelves bend.
        for (var z = NEAR; z >= FAR; z -= 2.4) {
          if (inGap(s, 1, z)) continue;
          var up = [];
          for (var y = LEVELS[0]; y <= LEVELS[LEVELS.length - 1] + 0.01; y += 0.35) up.push(warp(s * W, y, z));
          tube(up, 0.035, '--lsp-shelf');
        }
      });

      // THE BOOKS, standing at right angles to their shelf: each one's foot on
      // the bent shelf, its top where the warp puts the top of a book there,
      // and so smaller the nearer it is to the well. A gap now and then, and
      // no two neighbours the same height, worked out, never drawn at random.
      var Y = new T.Vector3(), X = new T.Vector3(), Z = new T.Vector3(), B = new T.Matrix4();
      [-1, 1].forEach(function (s) {
        LEVELS.slice(0, -1).forEach(function (y, li) {
          var k = 0;
          for (var z = NEAR - 0.1; z >= FAR + 0.4; z -= 0.15) {
            k++;
            var n = (k * 7 + li * 11 + (s > 0 ? 5 : 0)) % 13;
            if (n === 0 || n === 9) continue;            // a book out on loan
            if (inGap(s, y, z)) continue;
            var h = 0.3 + 0.025 * ((k * 5 + li * 3) % 6);
            var foot = warp(s * (W - 0.12), y + 0.03, z), top = warp(s * (W - 0.12), y + 0.03 + h, z);
            var along = warp(s * (W - 0.12), y + 0.03, z - 0.1).sub(foot).normalize();
            Y.copy(top).sub(foot);
            var len = Y.length(); Y.normalize();
            X.crossVectors(Y, along).normalize(); Z.crossVectors(X, Y).normalize();
            var sc = 1 - pull(z) * 0.9;
            B.makeBasis(X, Y, Z).setPosition(foot.clone().addScaledVector(Y, len / 2));
            box(0.2 * sc, len, 0.11 * sc, B.clone(), '--lsp-shelf', 0.012 * sc, false);
          }
        });
      });

      // THE WELL at the far end, where everything is bending to: rings of the
      // shelving drawing in, and the bottom of it.
      for (var r = 0; r < 7; r++) {
        var rad = 2.3 - r * 0.3;
        kit.piece(new T.TorusGeometry(rad, 0.03, 6, 48), at(0, WELL.y, WELL.z + 1.5 - r * 0.45), '--lsp-shelf', false, false);
      }
      kit.flat(new T.CircleGeometry(0.75, 40), at(0, WELL.y, WELL.z - 1.8), '--lsp-well');

      // THE GAP YOU CAME IN BY, behind you: a doorway-shaped dark between the
      // ends of the shelves, its top bending like everything else.
      var gate = new T.Shape(), GW = 1.1, GH = 2.3;
      gate.moveTo(-GW / 2, 0); gate.lineTo(GW / 2, 0); gate.lineTo(GW / 2, GH - 0.35);
      gate.quadraticCurveTo(0.1, GH + 0.25, -GW / 2, GH - 0.25); gate.closePath();
      kit.flat(new T.ShapeGeometry(gate), at(-0.9, 0, NEAR + 0.25, Math.PI), '--lsp-well');

      // THE STRING: tied to the shelf beside the gap you came in by, loose
      // down the middle, and off to the left into the gap at the far end.
      var tie = warp(-W, 0.95, NEAR - 0.2);
      kit.piece(new T.TorusGeometry(0.07, 0.02, 6, 16), at(tie.x + 0.05, tie.y, tie.z, LEFT), '--lsp-string', false, false);
      var oo = warp(-W, 1.3, -16.7);
      var mid = function (dx, y, z) { var c = warp(0, y, z); return new T.Vector3(c.x + dx, y, z); };
      tube([tie, mid(-1.4, 0.95, -0.6), mid(-0.3, 1.05, -3.2), mid(0.6, 0.85, -6.0),
        mid(-0.4, 1.1, -8.8), mid(0.5, 0.9, -11.6), mid(-0.1, 1.05, -14.2),
        mid(-0.7, 1.0, -16.0), new T.Vector3(oo.x + 0.2, 1.0, -16.8), new T.Vector3(oo.x - 0.6, 1.0, -17.0)],
        0.012, '--lsp-string');

      // THE WAY ON: the gap in the left-hand shelving where the string turns
      // off, dark all the way through, facing the middle.
      var hole = new T.Shape();
      hole.moveTo(-0.85, 0); hole.lineTo(0.85, 0); hole.lineTo(0.8, 2.05);
      hole.quadraticCurveTo(0, 2.55, -0.9, 2.1); hole.closePath();
      var gz = (GAP.z0 + GAP.z1) / 2, gx = warp(-W, 1.3, gz).x;
      kit.flat(new T.ShapeGeometry(hole), at(gx - 0.15, 0.2, gz, LEFT), '--lsp-well');

      // THE ROOM'S OWN PAGE, standing beside the gap you came in by, facing
      // down the shelving, in nothing but a thread of the string round it.
      var pw = 2.2, ph = pw * 800 / 1180, px = 1.05, py = 0.5 + ph / 2;
      var frame = kit.screen(1180, 800, pw, at(px, py, NEAR + 0.2, Math.PI), 'L-Space’s own page, standing beside the gap you came in by');

      // THE PAGE'S WORDS, lifted off it as it has them, each standing in the
      // warp a little to one side, turned towards the middle.
      // The middle of the shelving wanders as the shelves do, so everything
      // that stands in it, and everywhere you stand, follows it.
      function cx(z) { return warp(0, 1.6, z).x; }
      function plate(sel, n, w, ww, side, z, ry, y) {
        return kit.lift(frame, sel, { n: n, w: w, ww: ww, m: at(cx(z) + side, y || 0.85, z, ry) });
      }
      var head = plate('.lsp-head', 0, 760, 1.5, -1.1, -3.0, 0.55, 1.0);
      var lede = plate('.lsp-lede', 0, 620, 1.35, 1.15, -4.8, -0.55);
      var mass = plate('.lsp-quote', 0, 560, 1.2, -1.1, -6.6, 0.6);
      var part = [];
      [[1.1, -8.6, -0.6], [-1.05, -10.6, 0.62], [1.0, -12.5, -0.65], [-0.9, -14.2, 0.7]].forEach(function (p, i) {
        part.push(plate('.lsp-part', i, 620, 1.1, p[0], p[1], p[2], 0.7));
      });
      var end = plate('.lsp-end', 0, 560, 1.0, -0.75, -15.4, 1.2, 0.8);

      function stand(name, dx, z, yaw, pitch, more) {
        var st = { name: name, x: cx(z) + dx, z: z, yaw: yaw, pitch: pitch };
        Object.keys(more || {}).forEach(function (k) { st[k] = more[k]; });
        return st;
      }
      var stops = [
        stand('just through the gap, the shelving bending away from you on both sides towards the well', 0, -0.3, 0, 0.06),
        stand('at the name, where every library is the same library', 0.1, -1.9, 0.55, 0.12, { frame: head.el }),
        stand('at what a library is, in L-space', -0.1, -3.7, -0.55, 0.05, { frame: lede.el }),
        stand('at Pratchett’s words on mass and space', 0.1, -5.5, 0.6, 0.05, { frame: mass.el }),
        stand('at a ball of string', -0.25, -7.2, -0.55, -0.1, { frame: part[0].el }),
        stand('at the question of whether you have really read all these', 0.25, -9.2, 0.58, -0.1, { frame: part[1].el }),
        stand('at Books of the Edges', -0.25, -11.1, -0.6, -0.08, { frame: part[2].el }),
        stand('at threads worth pulling, every one tied somewhere else', 0.25, -12.9, 0.65, -0.08, { frame: part[3].el }),
        stand('at the end of the shelving, looking into the well everything bends towards', 0, -15.0, 0, 0.02),
        stand('at the end of the string, where it says where it goes', 0.25, -14.7, 1.2, 0.05, { frame: end.el }),
        stand('Oook, at the far end of the string', 0.2, -16.7, LEFT, 0.02, { where: 'at the gap in the left-hand shelving where the string turns off, round a corner that is not there', room: 'Oook', page: 'oook.html' }),
        stand('back at the gap you came in by, with the string tied beside it and the room’s own page', 0.3, -2.2, Math.PI, 0.02, { page: kit.page, frame: frame })
      ];

      return {
        start: { x: cx(-0.3), z: -0.3, yaw: 0 },
        bounds: { x: [-1.2, 1.2], z: [-16.9, 0.4] },
        stops: stops
      };
    }
  };
})();

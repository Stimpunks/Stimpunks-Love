/* =============================================================================
   The Zibaldone, walked into on Cel Street. Ryan's ask, 2026-10-31: working
   down the street from the top, one room at a time.

   IT IS THE ZIBALDONE'S WORLD AND NOBODY ELSE'S (§29): a commonplace book left
   open on a desk, and here you are small enough to stand in it. You walk up the
   gutter, the fold between the verso and the recto, with the two pages rising
   gently away from it on either side, laid paper with a tooth, written into by
   hand. The book lies on the walnut desk, and the one lamp stands on the desk
   to the LEFT, at desk height, so the light rakes across the pages from the
   left: the verso is the brighter page, and everything throws its shadow down
   and to the right, away from it.

   THREE ROOMS ARE ONE EDIT AWAY, and the book is what keeps them off. THE
   MOPERY is a cold stone building you stand up in, with printed books on
   shelves; there is no building here, only a desk under a lamp, and nothing
   printed: the marks on the pages are a hand's. THE DOOMSCROLL is one grey roll
   with no fold; this has a gutter you walk along, a verso and a recto, and the
   paper is warm. THE ZINE TABLE is a photocopy in a hundred copies; this is
   one copy, nothing cut out of it.

   THE LEAVES ARE THE PAGE'S OWN, lifted off it by the kit, each line with its
   whole credit, never one without the other: tipped in along both pages, each
   at the angle the hand left it (and straight at Gentle). The flyleaf, the
   rules, the slip and the foot of the page are its own sheets, lifted too; the
   slip is worked by zibaldone.js, which the page loads, and it sends nothing
   anywhere: it copies to the clipboard, as on the page.

   NOTHING MOVES. Every colour is one the room declares, by name. It keeps
   nothing, sends nothing and fetches nothing; its page arrives through Cel
   Street's screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 29, 374761393) ^ Math.imul(j + 11, 668265263) ^ Math.imul(k + 41, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['zibaldone.html'] = {
    name: 'The Zibaldone',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      // The book: its spine runs away from you, the gutter at x = 0, each page
      // PW wide, the whole book BL long from its tail (z = 1) to its head.
      var PW = 8, BL = 28, TAIL = 1, HEAD = TAIL - BL, DESK = -0.4;
      // How high a page stands at x from the gutter: steep out of the fold,
      // then nearly flat across to the fore-edge.
      function rise(x) { return 0.55 * (1 - Math.exp(-Math.abs(x) / 1.2)); }

      // THE LAMP'S LIGHT, raking in low from the left, and a little warmth
      // back off the paper so the recto is not lost.
      kit.scene.background = kit.col('--zb-desk');
      kit.scene.add(new T.HemisphereLight(kit.col('--zb-laid'), kit.col('--zb-desk'), 0.9));
      var lamp = new T.DirectionalLight(kit.col('--zb-laid'), 2.4);
      lamp.position.set(-22, 7, -18); lamp.target.position.set(2, 0, -12);
      lamp.castShadow = true;
      lamp.shadow.mapSize.set(2048, 2048);
      lamp.shadow.camera.left = -18; lamp.shadow.camera.right = 18;
      lamp.shadow.camera.top = 18; lamp.shadow.camera.bottom = -18;
      lamp.shadow.camera.far = 80;
      lamp.shadow.bias = -0.0015; lamp.shadow.normalBias = 0.08;
      kit.scene.add(lamp, lamp.target);
      var glow = new T.PointLight(kit.col('--zb-laid'), 6, 26, 1.2);
      glow.position.set(-14, 3.2, -12);
      kit.scene.add(glow);

      // THE DESK, walnut, stretching off into the dark under everything.
      box(90, 0.2, 90, at(0, DESK - 0.1, -12), '--zb-desk', false, false);
      for (var g = 0; g < 40; g++) {
        box(90, 0.004, 0.06, at(0, DESK + 0.002, 30 - g * 2.1 - hash(g, 1, 1) * 0.6, 0.03), '--zb-desk-2', false, false);
      }

      // THE COVER, in boards under the page block, and the page block's edges.
      box(2 * PW + 0.9, 0.12, BL + 0.7, at(0, DESK + 0.06, (TAIL + HEAD) / 2), '--zb-oak', 0.02);
      [-1, 1].forEach(function (s) {
        box(0.12, rise(PW) - DESK, BL, at(s * (PW + 0.06), (rise(PW) + DESK) / 2, (TAIL + HEAD) / 2), '--zb-laid-2', false);
      });
      box(2 * PW, -DESK, 0.08, at(0, DESK / 2, HEAD + 0.04), '--zb-laid-2', false);
      box(2 * PW, -DESK, 0.08, at(0, DESK / 2, TAIL - 0.04), '--zb-laid-2', false);

      // THE TWO PAGES, curved up out of the fold: the verso in the lamp's
      // paper, the recto a shade further from it.
      function page(side, ink) {
        var geo = new T.PlaneGeometry(PW, BL, 64, 2);
        geo.rotateX(-Math.PI / 2);
        geo.translate(side * PW / 2, 0, (TAIL + HEAD) / 2);
        var pos = geo.attributes.position;
        for (var i = 0; i < pos.count; i++) pos.setY(i, rise(pos.getX(i)));
        pos.needsUpdate = true;
        geo.computeVertexNormals();
        kit.piece(geo, new T.Matrix4(), ink, false);
      }
      page(-1, '--zb-laid');
      page(1, '--zb-laid-2');
      // The fold, darker where the light cannot reach down into it.
      kit.flat(new T.PlaneGeometry(0.34, BL), at(0, 0.006, (TAIL + HEAD) / 2, 0, -Math.PI / 2), '--zb-gutter');

      // THE TOOTH of laid paper: the chain lines, faint, across both pages,
      // and flecks in it. Nothing is ruled: this is not a printed page.
      for (var c = 1; c < 9; c++) {
        [-1, 1].forEach(function (s) {
          var x = s * c * 0.9;
          kit.flat(new T.PlaneGeometry(0.012, BL - 0.4), at(x, rise(x) + 0.004, (TAIL + HEAD) / 2, 0, -Math.PI / 2), '--zb-laid-2');
        });
      }
      for (var f = 0; f < 220; f++) {
        var fx = (hash(f, 2, 1) * 2 - 1) * (PW - 0.3), fz = TAIL - 0.3 - hash(f, 2, 2) * (BL - 0.6);
        kit.flat(new T.CircleGeometry(0.008 + hash(f, 2, 3) * 0.016, 5), at(fx, rise(fx) + 0.005, fz, 0, -Math.PI / 2), '--zb-gutter');
      }

      // WRITING: lines of a hand across the open spaces of both pages, in the
      // inks the leaves are written in, and a few words crossed out in pencil.
      var INKS = ['--zb-oak', '--zb-iron', '--zb-aniline', '--zb-rubric'];
      function stroke(pts, r, ink) {
        var curve = new T.CatmullRomCurve3(pts.map(function (p) { return new T.Vector3(p[0], rise(p[0]) + 0.012, p[1]); }));
        kit.flat(new T.TubeGeometry(curve, Math.max(8, pts.length * 6), r, 4, false), new T.Matrix4(), ink);
      }
      for (var w = 0; w < 46; w++) {
        var s = w % 2 ? 1 : -1, x0 = s * (4.0 + hash(w, 3, 1) * 2.6), z0 = TAIL - 1.2 - hash(w, 3, 2) * (BL - 2.4);
        var len = 0.6 + hash(w, 3, 3) * 1.3, pts = [];
        for (var p = 0; p <= 6; p++) {
          pts.push([x0 + s * (p / 6) * len * 0.15, z0 - (p / 6) * len + Math.sin(p * 2.4 + w) * 0.035]);
        }
        stroke(pts, 0.012, w % 9 === 4 ? '--zb-pencil' : INKS[w % INKS.length]);
      }

      // THINGS PRESSED IN between the leaves: strips of gummed tape, a length
      // of thread curling off the page, a pressed stem.
      for (var t = 0; t < 10; t++) {
        var tx = (t % 2 ? 1 : -1) * (5.2 + hash(t, 4, 1) * 1.8), tz = TAIL - 2 - t * 2.3;
        kit.flat(new T.PlaneGeometry(0.5, 0.16), at(tx, rise(tx) + 0.01, tz, 0.3 - hash(t, 4, 2) * 0.6, -Math.PI / 2), '--zb-tape');
      }
      stroke([[-6.6, -9.2], [-6.2, -9.6], [-6.5, -10.1], [-6.0, -10.5], [-6.3, -11.0]], 0.018, '--zb-pencil');
      stroke([[6.2, -15.8], [6.5, -16.4], [6.4, -17.1], [6.8, -17.6]], 0.014, '--zb-oak');

      // THE LAMP itself, on the desk off the verso's fore-edge: a heavy foot, a
      // stem, and a shade turned in towards the book.
      var LX = -14, LZ = -12;
      kit.cyl(1.4, 1.6, 0.3, at(LX, DESK + 0.15, LZ), '--zb-desk-2', 0.03, 24);
      kit.cyl(0.14, 0.14, 2.6, at(LX, DESK + 1.6, LZ), '--zb-oak', 0.02, 10);
      kit.cyl(0.9, 1.9, 1.5, at(LX + 0.5, DESK + 3.2, LZ, 0, 0, -0.5), '--zb-tape', 0.03, 24);

      // THE ROOM'S OWN PAGE at the head of the book, standing up out of the
      // fold like a card somebody has left there to be read.
      var pw = 3.2, ph = pw * 800 / 1180;
      var frame = kit.screen(1180, 800, pw, at(0, ph / 2 + 0.15, HEAD + 2.2), 'The Zibaldone’s own page, standing at the head of the book');

      // THE SHEETS AND THE LEAVES, tipped in along both pages and facing the
      // gutter, each at the angle the hand left it, straight at Gentle.
      var LX0 = 2.6, START = TAIL - 2.0, STEP = 2.45;
      var stops = [{ name: 'at the tail of the book, standing in the fold between the pages', x: 0, z: TAIL - 0.4, yaw: 0 }];
      function tip(side, i, sel, o, words) {
        var x = side * LX0, z = START - i * STEP;
        var lean = kit.gentle ? 0 : (hash(i, side + 5, 7) - 0.5) * 0.06;
        var it = kit.lift(frame, sel, {
          n: o.n || 0, w: o.w || 430, h: o.h || 720, ww: o.ww || 1.55,
          m: at(x, rise(x), z, side < 0 ? LEFT : RIGHT, -0.06, lean)
        });
        stops.push({ name: words, x: side * 0.25, z: z, yaw: side < 0 ? LEFT : RIGHT, pitch: 0.02, frame: it.el });
        return it;
      }
      var WHO = ['Michel de Montaigne', 'Walt Whitman', 'Emily Dickinson', 'Henry David Thoreau', 'Marcus Aurelius',
                 'Karen Barad', 'Helen Edgar', null, null, 'Louisa May Alcott', 'Walt Whitman', 'Simone de Beauvoir', 'Sylvia Plath'];
      var VERSO = 'on the verso, the lit page', RECTO = 'on the recto, across the fold';
      tip(-1, 0, '.zb-flyleaf', { w: 560, ww: 1.9 }, 'at the flyleaf, where the book says what it is for');
      tip(1, 0, '.zb-sheet.zb-sheet--word', { w: 560, ww: 1.9 }, 'at the word on why this room exists');
      WHO.forEach(function (who, n) {
        var side = n % 2 ? 1 : -1, i = 1 + Math.floor(n / 2);
        var words = (who ? 'at the leaf with ' + who + '’s line, ' : 'at a leaf with a line of our own, ') + (side < 0 ? VERSO : RECTO);
        tip(side, i, '.zb-leaf', { n: n }, words);
      });
      tip(-1, 8, '.zb-sheet.zb-sheet--rules', { w: 600, ww: 2.0, h: 820 }, 'at the rules this book keeps, written where you can hold us to them');
      tip(1, 7, '.zb-sheet.zb-sheet--slip', { w: 600, ww: 2.0, h: 820 }, 'at the slip for a line of your own, which sends nothing anywhere');
      tip(1, 8, '.zb-sheet.zb-sheet--foot', { w: 600, ww: 2.0 }, 'at the foot of the page, with the gap somebody checked');
      kit.wire(frame, 'zibaldone.js');
      stops.push({ name: 'at the head of the book, with the room’s own page standing in the fold', x: 0, z: HEAD + 5.6, yaw: 0, pitch: 0.02, page: kit.page, frame: frame });

      return {
        start: { x: 0, z: TAIL - 0.4, yaw: 0 },
        // You keep to the fold, between the two rows of leaves.
        bounds: { x: [-1.4, 1.4], z: [HEAD + 4.4, TAIL - 0.2] },
        stops: stops
      };
    }
  };
})();

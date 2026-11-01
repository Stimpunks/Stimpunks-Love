/* =============================================================================
   The Garden, walked into on Cel Street, through its gate halfway down the
   street. Ryan's ask, 2026-11-01: the street's gates, after its doors.

   IT IS THE ROOM'S OWN WORLD AND SHARES NOTHING WITH THE STREET (§28). The
   street is night, shopfronts and signs; this is midday, the sun straight
   overhead and come down through leaves, so every pale surface is tinted
   green and every shadow is small, hard and directly under the thing that
   made it. The leaf shadow on the path is painted, --gd-dapple, the way §28
   paints it, and the palest thing here is not the ground: a limewashed board
   is brighter than the path it lies on, carried by its edge and by the hard
   shadow under it.

   THE BEDS ARE THE PAGE'S. One bed per site we publish is a claim, and how
   many sites there are is the page's to say (tools/make-garden.py writes them
   from data/arrivals.json), so the border here is one long raised bed with
   plants in it and no count, and the page's own beds stand beside it, lifted
   whole. NOTHING GREEN GOES BELOW THE SOIL LINE: every leaf and stem in the
   border starts at the top of the soil, the page's own rule.

   HELEN'S BOUNDARY IS IVY AND STARS, NEVER A FENCE. Her call, 2026-09-22: a
   fence says kept out and ivy says this is as far as we can see. So the right
   of the path runs out in winding ivy on the ground, with no post, rail or
   panel anywhere in it, and glimmers in it that light nothing. Past it is
   the garden next door, which is Helen's and not ours: none of it is drawn as
   a bed, nothing over there stands in soil we drew, and NOTHING PAST THE IVY
   CASTS A SHADOW, because the sun has not moved and the floor is past the ivy.
   Her plots' own words stand on our side of the ivy, as the page has them.

   THE GARDEN SPIDER IS AN ORB WEAVER IN ITS WEB AT THE FAR END, and its panel
   is lifted whole, caveats and all: the friendly edit is to trim them. Past
   its web is the way to the World room, which the page points at past this
   bed.

   NOTHING MOVES AT ANY SETTING, the leaf shadow included: §28 lets the page's
   dapple drift, and here it is drawn and stays drawn.

   Every colour is one §28 declares, by name. It keeps nothing, sends nothing
   and fetches nothing; its page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['the-garden.html'] = {
    name: 'The Garden',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var RIGHT = -Math.PI / 2, LEFT = Math.PI / 2;
      // The same garden every time it is built: a seeded number, never chance.
      function rnd(n) { var x = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); }

      // THE LIGHT IS MIDDAY THROUGH LEAVES. The sky is pale and green from the
      // leaves, the light thrown back off the path is green too, and the sun
      // is straight overhead, so each shadow lies directly under its thing.
      kit.scene.background = kit.col('--gd-day');
      kit.scene.add(new T.HemisphereLight(kit.col('--gd-board'), kit.col('--gd-edge'), 1.7));
      var sun = new T.DirectionalLight(kit.col('--gd-day'), 2.3);
      sun.position.set(0.001, 40, 0.001);
      sun.target.position.set(0, 0, -5);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      sun.shadow.camera.left = -24; sun.shadow.camera.right = 24;
      sun.shadow.camera.top = 24; sun.shadow.camera.bottom = -24;
      sun.shadow.camera.near = 1; sun.shadow.camera.far = 60;
      sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
      kit.scene.add(sun, sun.target);

      function blob(x, y, z, sx, sy, sz, ink, line) {
        var g = new T.SphereGeometry(1, 14, 10); g.scale(sx, sy, sz);
        kit.piece(g, at(x, y, z), ink, line === undefined ? 0.01 : line);
      }
      function flatOn(geo, x, z) { kit.flat(geo, at(x, 0.008, z, 0, -Math.PI / 2), '--gd-dapple'); }

      // THE PATH, the ground you are standing on, out to the hedges.
      kit.piece(new T.PlaneGeometry(90, 90), at(0, 0, -5, 0, -Math.PI / 2), '--gd-day', false, false);
      // THE LEAF SHADOW ON IT, painted and not layered, and still.
      for (var d = 0; d < 46; d++) {
        var e = new T.CircleGeometry(1, 20); e.scale(0.35 + rnd(d) * 0.6, 0.22 + rnd(d + 50) * 0.4, 1);
        flatOn(e, -3.4 + rnd(d + 100) * 8.6, 8 - rnd(d + 200) * 27);
      }

      // THE HEDGE AT THE BOTTOM, with the gate in it you came in by, and the
      // hedge down the left. Leaves, kept, never a wall.
      var GZ = 9.6;
      [-1, 1].forEach(function (side) { box(12, 2.3, 1.1, at(side * 7.1, 1.15, GZ), '--gd-leaf', 0.02); });
      box(0.16, 2.6, 0.2, at(-1.1, 1.3, GZ), '--gd-loam-2', 0.01);
      box(0.16, 2.6, 0.2, at(1.1, 1.3, GZ), '--gd-loam-2', 0.01);
      var arch = new T.TorusGeometry(1.1, 0.08, 8, 24, Math.PI);
      kit.piece(arch, at(0, 2.6, GZ), '--gd-loam-2', 0.01);
      box(1.1, 2.3, 30.4, at(-9.2, 1.15, -5.6), '--gd-leaf', 0.02);
      // And a low one across the far end, with a gap past the spider's web.
      box(6.8, 1.3, 1.0, at(-5.8, 0.65, -21.2), '--gd-leaf', 0.02);
      box(3.2, 1.3, 1.0, at(5.0, 0.65, -21.2), '--gd-leaf', 0.02);

      // TWO TREES behind the left hedge, the leaves the light came through,
      // their shadows straight under them.
      [[-11.2, 2.5], [-11.6, -12.5]].forEach(function (t, i) {
        cyl(0.32, 0.42, 5.2, at(t[0], 2.6, t[1]), '--gd-loam-2', 0.012, 10);
        blob(t[0] + 0.6, 6.0, t[1], 3.0, 1.7, 2.8, '--gd-leaf');
        blob(t[0] - 0.4, 6.9, t[1] - 0.8, 2.1, 1.3, 2.0, '--gd-leaf-2');
      });

      // THE BORDER, one long raised bed down the left: boards, soil, and
      // everything green starting at the top of the soil and never under it.
      var BX = -5.4, BW = 2.4, BZ0 = 4.2, BZ1 = -15.6, SOIL = 0.5;
      box(BW, SOIL - 0.04, BZ0 - BZ1, at(BX, (SOIL - 0.04) / 2, (BZ0 + BZ1) / 2), '--gd-loam-2', 0.012);
      box(BW - 0.16, 0.04, BZ0 - BZ1 - 0.16, at(BX, SOIL - 0.02, (BZ0 + BZ1) / 2), '--gd-loam', false);
      for (var p = 0, z = BZ0 - 0.6; z > BZ1 + 0.5; z -= 0.75, p++) {
        var x = BX - 0.6 + rnd(p + 300) * 1.2, kind = Math.floor(rnd(p + 400) * 4);
        if (kind === 0) {
          // a clump
          blob(x, SOIL + 0.28, z, 0.36, 0.28, 0.34, '--gd-leaf-2');
        } else if (kind === 1) {
          // an umbel on its stem, a flower head of the one bloom colour
          cyl(0.025, 0.03, 0.9, at(x, SOIL + 0.45, z), '--gd-leaf', false, 6);
          for (var u = 0; u < 5; u++) blob(x + Math.cos(u * 1.26) * 0.12, SOIL + 0.94, z + Math.sin(u * 1.26) * 0.12, 0.07, 0.06, 0.07, '--gd-bloom', false);
        } else if (kind === 2) {
          // a tendril up a cane, holding on
          cyl(0.02, 0.02, 1.3, at(x, SOIL + 0.65, z), '--gd-loam-2', false, 6);
          for (var k = 0; k < 6; k++) blob(x + Math.cos(k * 1.4) * 0.12, SOIL + 0.2 + k * 0.19, z + Math.sin(k * 1.4) * 0.12, 0.09, 0.06, 0.09, '--gd-leaf', false);
        } else {
          // a low spread of leaves
          blob(x, SOIL + 0.12, z, 0.5, 0.12, 0.4, '--gd-leaf');
          blob(x + 0.1, SOIL + 0.24, z - 0.1, 0.25, 0.1, 0.22, '--gd-leaf-2', false);
        }
      }

      // HELEN'S IVY, winding along the ground down the right, with no post,
      // rail or panel in it, and glimmers in it that light nothing.
      var IX = 7.2, IZ0 = -1.5, IZ1 = -17;
      [0, 1, 2].forEach(function (s) {
        var pts = [];
        for (var i = 0; i <= 24; i++) {
          var zz = IZ0 + (IZ1 - IZ0) * i / 24;
          pts.push(new T.Vector3(IX + Math.sin(i * 0.9 + s * 2.1) * 0.35, 0.12 + 0.18 * (1 + Math.sin(i * 1.7 + s)), zz));
        }
        kit.piece(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 90, 0.035, 5), at(0, 0, 0), '--gd-loam-2', false);
        pts.forEach(function (v, j) {
          if (j % 2) return;
          blob(v.x + 0.08, v.y + 0.06, v.z, 0.16, 0.05, 0.13, s === 1 ? '--gd-leaf-2' : '--gd-leaf', false);
        });
      });
      // The glimmers: small stars in the ivy, still, lighting nothing.
      function star(x, y, z, r) {
        var sh = new T.Shape();
        for (var i = 0; i < 8; i++) {
          var a = i * Math.PI / 4, rr = i % 2 ? r * 0.35 : r;
          if (i === 0) sh.moveTo(Math.sin(a) * rr, Math.cos(a) * rr); else sh.lineTo(Math.sin(a) * rr, Math.cos(a) * rr);
        }
        sh.closePath();
        kit.flat(new T.ShapeGeometry(sh), at(x, y, z, RIGHT), '--gd-board');
      }
      for (var g = 0; g < 14; g++) star(IX - 0.25 + rnd(g + 500) * 0.5, 0.45 + rnd(g + 600) * 0.6, IZ0 - 0.6 - rnd(g + 700) * (IZ0 - IZ1 - 1.2), 0.07 + rnd(g + 800) * 0.05);

      // PAST THE IVY, the garden next door: Helen's, drawn as far as we can see
      // and no further. No bed, no soil of ours, and nothing over there casts a
      // shadow. The grounded one keeps a nurse tree over something growing in
      // its shelter; the wilder ground past it keeps a fern's crozier, still
      // coiled.
      kit.flat(new T.CylinderGeometry(0.28, 0.36, 4.4, 10), at(11.4, 2.2, -6.5), '--gd-loam-2');
      var crown = new T.SphereGeometry(1, 16, 12); crown.scale(2.4, 1.6, 2.2);
      kit.flat(crown, at(11.4, 4.9, -6.5), '--gd-leaf');
      var young = new T.SphereGeometry(1, 12, 8); young.scale(0.4, 0.5, 0.4);
      kit.flat(young, at(10.3, 0.45, -6.0), '--gd-leaf-2');
      kit.flat(new T.CylinderGeometry(0.03, 0.04, 1.4, 6), at(11.0, 0.7, -12.0), '--gd-leaf');
      kit.flat(new T.TorusGeometry(0.28, 0.05, 8, 20, Math.PI * 1.6), at(11.0, 1.55, -12.0, RIGHT), '--gd-leaf-2');

      // THE GARDEN SPIDER IN ITS WEB AT THE FAR END: two stems, the spokes and
      // the spiral in the loam's ink, and the spider at the hub, still.
      var WZ = -17.4, WY = 1.7;
      cyl(0.05, 0.07, 3.0, at(-1.9, 1.5, WZ), '--gd-leaf', 0.008, 8);
      cyl(0.05, 0.07, 3.0, at(1.9, 1.5, WZ), '--gd-leaf', 0.008, 8);
      for (var r = 0; r < 12; r++) {
        var a = r * Math.PI / 6, len = 1.55;
        box(0.012, len, 0.012, at(Math.sin(a) * len / 2, WY + Math.cos(a) * len / 2, WZ, 0, 0, -a), '--gd-loam', false, false);
      }
      [0.35, 0.65, 0.95, 1.25].forEach(function (rad) {
        kit.piece(new T.TorusGeometry(rad, 0.006, 4, 40), at(0, WY, WZ), '--gd-loam', false, false);
      });
      blob(0, WY - 0.06, WZ + 0.03, 0.13, 0.17, 0.09, '--gd-loam-2');
      blob(0, WY + 0.13, WZ + 0.03, 0.07, 0.07, 0.06, '--gd-loam');

      // THE BOARDS: limewashed planks laid on the path, brighter than it,
      // carried by their edge and the shadow under them, for each of the
      // page's parts to stand on.
      function spot(x, z, ry) { return { x: x, z: z, ry: ry }; }
      function plank(s, w) { box(w, 0.12, 0.5, at(s.x, 0.06, s.z, s.ry), '--gd-board', 0.012); }
      function front(name, s, dd, pitch, more) {
        var o = { name: name, x: s.x + Math.sin(s.ry) * dd, z: s.z + Math.cos(s.ry) * dd, yaw: s.ry, pitch: pitch || 0.05 };
        for (var key in more) o[key] = more[key];
        return o;
      }
      function foot(s, y) { return at(s.x, y, s.z, s.ry); }

      // THE ROOM'S OWN PAGE, by the gate you came in by, facing into the garden.
      var PG = spot(-3.3, 8.2, Math.PI), pgw = 2.4, pgh = pgw * 800 / 1180, pgy = 0.4 + pgh / 2;
      box(pgw + 0.14, pgh + 0.14, 0.06, at(PG.x, pgy, PG.z + 0.05, PG.ry), '--gd-loam-2', 0.01);
      [-1, 1].forEach(function (side) { box(0.1, pgy - pgh / 2, 0.1, at(PG.x + side * (pgw / 2 - 0.2), (pgy - pgh / 2) / 2, PG.z + 0.08), '--gd-loam-2', 0.008); });
      var page = kit.screen(1180, 800, pgw, at(PG.x, pgy, PG.z - 0.01, PG.ry), 'The Garden’s own page, by the gate, with the street through it');
      // and the page's own word about the gate, on the other side of it
      var GT = spot(3.3, 8.2, Math.PI);
      plank(GT, 1.8);
      var gateNote = kit.lift(page, '.gd-note', { n: 10, w: 640, ww: 1.6, m: foot(GT, 0.12) });

      // ON THE RIGHT AS YOU COME IN: what this is, and what a knowledge garden is.
      var LD = spot(3.0, 5.2, RIGHT), PK = spot(3.0, 1.6, RIGHT);
      plank(LD, 1.7); plank(PK, 2.4);
      var lede = kit.lift(page, '.lede', { w: 680, ww: 1.6, m: foot(LD, 0.12) });
      var plankWords = kit.lift(page, '.gd-plank', { w: 900, h: 980, ww: 2.3, m: foot(PK, 0.12) });

      // ON THE LEFT, AGAINST THE BORDER: the beds, as the page has them.
      var BN = spot(-3.0, 2.0, LEFT), BD = spot(-3.0, -2.8, LEFT);
      plank(BN, 1.7); plank(BD, 2.6);
      var bedsNote = kit.lift(page, '.gd-note', { n: 1, w: 680, ww: 1.6, m: foot(BN, 0.12) });
      var beds = kit.lift(page, '.gd-beds', { w: 1000, h: 1050, ww: 2.5, m: foot(BD, 0.12) });

      // ON THE RIGHT, AT THE IVY: the garden next door, its own words on our
      // side of the line, and the line's own story.
      var NA = spot(5.4, -3.6, RIGHT), NB = spot(5.4, -8.0, RIGHT), NC = spot(5.4, -12.0, RIGHT);
      plank(NA, 1.8); plank(NB, 1.9); plank(NC, 1.9);
      var nextNote = kit.lift(page, '.gd-note', { n: 2, w: 680, ww: 1.6, m: foot(NA, 0.12) });
      kit.lift(page, '.gd-note', { n: 3, w: 680, ww: 1.6, m: at(NA.x, 0.12, NA.z - 1.7, NA.ry) });
      var plotA = kit.lift(page, '.gd-plot', { n: 0, w: 720, h: 900, ww: 1.75, m: foot(NB, 0.12) });
      var plotB = kit.lift(page, '.gd-plot', { n: 1, w: 720, h: 900, ww: 1.75, m: foot(NC, 0.12) });

      // ON THE LEFT, FURTHER DOWN: starting a garden of your own.
      var DN = spot(-3.0, -8.6, LEFT), DR = spot(-3.0, -12.4, LEFT);
      plank(DN, 1.7); plank(DR, 2.4);
      var drillNote = kit.lift(page, '.gd-note', { n: 8, w: 680, ww: 1.6, m: foot(DN, 0.12) });
      var drills = kit.lift(page, '.gd-drills', { w: 900, h: 950, ww: 2.2, m: foot(DR, 0.12) });

      // BESIDE THE WEB: the spider's panel, whole, its caveats with it.
      var SP = spot(3.2, -15.6, RIGHT);
      plank(SP, 2.4);
      var spider = kit.lift(page, '.gd-spider', { w: 1000, h: 1000, ww: 2.4, m: foot(SP, 0.12) });

      return {
        start: { x: 0, z: 7.4, yaw: 0 },
        bounds: { x: [-3.6, 5.0], z: [-20.4, 8.6] },
        stops: [
          { name: 'just through the gate, midday, the border down the left and the ivy down the right', x: 0, z: 7.4, yaw: 0, pitch: 0.04 },
          front('at the first board on the right: what this garden is', LD, 2.4, 0.08, { frame: lede.el }),
          front('at the long board on the right: what a knowledge garden is', PK, 2.8, 0.06, { frame: plankWords.el }),
          front('at the border: one bed per site we publish, and whose order they are in', BN, 2.4, 0.08, { frame: bedsNote.el }),
          front('at the beds, every one linking out to its site', BD, 2.9, 0.06, { frame: beds.el }),
          { name: 'in the middle of the path, every shadow small and straight under its thing', x: 0, z: -5.5, yaw: 0, pitch: -0.1 },
          front('at the ivy: the garden next door, which is Helen Edgar’s and not ours', NA, 2.4, 0.08, { frame: nextNote.el }),
          front('at the ivy, before Autistic Realms', NB, 2.4, 0.06, { frame: plotA.el }),
          front('at the ivy, before More Realms', NC, 2.4, 0.06, { frame: plotB.el }),
          front('on the left: starting a garden of your own', DN, 2.4, 0.08, { frame: drillNote.el }),
          front('at the steps for a garden of your own', DR, 2.8, 0.06, { frame: drills.el }),
          front('beside the garden spider’s web, and what it can and cannot do', SP, 2.8, 0.06, { frame: spider.el }),
          { name: 'the World room, past the spider’s web', x: 1.6, z: -19.6, yaw: 0, pitch: 0.04, where: 'at the gap in the far hedge past the web, where the spider’s own web runs on between every room', room: 'the World room', page: 'world.html' },
          front('back at the gate you came in by, with the room’s own page beside it', PG, 2.4, 0.05, { page: kit.page, frame: page }),
          front('at the gate’s own word about the street through it', GT, 2.2, 0.08, { frame: gateNote.el })
        ]
      };
    }
  };
})();

/* =============================================================================
   The Collection Collection, walked into on Cel Street. Ryan's ask,
   2026-10-31: back on the street, working down it a room at a time.

   IT IS THE COLLECTION COLLECTION'S WORLD AND NOBODY ELSE'S (§48): a dark
   gallery with NO HOUSE LIGHTS. The cabinets stand apart on the bare floor,
   drawn in the same dim line, and every cabinet brings its own lamp, which its
   owner chose for the thing it lights. NO TWO LAMPS ARE ALIKE: each is its own
   declared colour and its own kind of light. A lamp is lit only when its
   cabinet has something in it, a lamp nobody has chosen is not drawn at all,
   and an empty cabinet's label is as bright as any other: it is on a card of
   its own, the page's own, and nothing dims it. If two lamps in here are ever
   alike, this has become the Feed with shelves.

   WHAT IS IN HERE, as on the page: Ryan's pens, paper and ink, in a writing
   box open on a little table under a daylight desk lamp on an arm, from the
   upper left, lit; Ryan's perfume, a tall cupboard against the wall with its
   door ajar and the strip light inside the door switched off, because there is
   nothing in it yet; and three cabinets with no lamp, because the lamp is their
   owners' to choose: Norah and her husband's pegboard over a bench, Chelsea's
   plant stand in three steps, and Helen's chest of shallow drawers with one
   drawer pulled out. Nothing goes in any of them unless its owner sends it, so
   nothing is drawn in them.

   THE LABELS AND THE PHOTOGRAPHS ARE THE PAGE'S OWN, lifted off it by the kit:
   every cabinet's label on a stand in front of it, and the photographs of the
   pens, with the words Claude wrote for them, on a board behind the writing
   box. A lamp's colour never falls on a photograph: the photographs are laid
   over the picture, where no lamp in the scene reaches, and nothing tinted is
   drawn in front of them. Nobody is drawn. Nothing is counted, priced or
   called rare.

   Every colour is one the room declares, by name. NOTHING MOVES and nothing
   makes a sound. It keeps nothing, sends nothing and fetches nothing; its page
   arrives through Cel Street's screen(). tools/make-cel-street.py holds each
   of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['collection-collection.html'] = {
    name: 'The Collection Collection',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var W = 14, D = 16, H = 4.2, back = -D;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;

      // NO HOUSE LIGHTS: the dark of the gallery, and only enough of the
      // cabinets' own dim line to find your way between them.
      kit.scene.background = kit.col('--cc-dark');
      kit.scene.add(new T.HemisphereLight(kit.col('--cc-line'), kit.col('--cc-dark'), 1.6));

      // THE GALLERY: a bare floor, dark walls, a dark ceiling, the way in behind.
      box(W, 0.1, D + 1, at(0, -0.05, -D / 2 + 0.5), '--cc-dark', false, false);
      box(0.3, H, D + 1, at(-W / 2 - 0.15, H / 2, -D / 2 + 0.5), '--cc-dark');
      box(0.3, H, D + 1, at(W / 2 + 0.15, H / 2, -D / 2 + 0.5), '--cc-dark');
      box(W + 0.6, H, 0.3, at(0, H / 2, back - 0.15), '--cc-dark');
      box(W + 0.6, 0.2, D + 1, at(0, H + 0.1, -D / 2 + 0.5), '--cc-dark', false, false);
      [-1, 1].forEach(function (s) { box((W - 1.8) / 2, H, 0.3, at(s * (W + 1.8) / 4, H / 2, 1.15), '--cc-dark'); });
      box(1.8, H - 2.4, 0.3, at(0, 2.4 + (H - 2.4) / 2, 1.15), '--cc-dark');
      // A skirting in the furniture's line, so the floor meets the walls.
      [-1, 1].forEach(function (s) { box(0.04, 0.1, D, at(s * (W / 2 - 0.02), 0.05, -D / 2), '--cc-line', false, false); });
      box(W, 0.1, 0.04, at(0, 0.05, back + 0.02), '--cc-line', false, false);

      var frame = kit.screen(1180, 800, 3.0, at(W / 2 - 0.04, 0.7 + 3.0 * 800 / 1180 / 2, -3.2, RIGHT),
        'The Collection Collection’s own page, on the right-hand wall by the way in');
      box(3.2, 3.0 * 800 / 1180 + 0.2, 0.06, at(W / 2 - 0.02, 0.7 + 3.0 * 800 / 1180 / 2, -3.2, RIGHT), '--cc-line', 0.012);

      // A LABEL ON ITS STAND: a post and a foot in the furniture's dim line,
      // and the page's own label card on top, facing whoever walks up.
      function label(n, g) {
        box(0.08, 0.95, 0.08, M(g, at(0, 0.475, -0.06)), '--cc-body', 0.01);
        box(0.5, 0.04, 0.4, M(g, at(0, 0.02, -0.06)), '--cc-body', 0.01);
        box(0.92, 0.04, 0.06, M(g, at(0, 0.95, -0.04)), '--cc-line', false);
        return kit.lift(frame, '.cc-label', { n: n, w: 520, h: 760, ww: 0.95, m: M(g, at(0, 0.97, 0)) });
      }

      // RYAN'S PENS, PAPER AND INK: a writing box open on a little table, under
      // a daylight desk lamp on an arm, from the upper left. The only lamp lit
      // in the gallery tonight, because the only cabinet with anything in it.
      var tg = at(-3.4, 0, -6.0);
      [[-0.55, -0.32], [0.55, -0.32], [-0.55, 0.32], [0.55, 0.32]].forEach(function (l) {
        box(0.06, 0.74, 0.06, M(tg, at(l[0], 0.37, l[1])), '--cc-body', 0.01);
      });
      box(1.3, 0.05, 0.8, M(tg, at(0, 0.765, 0)), '--cc-body', 0.012);
      box(0.9, 0.12, 0.55, M(tg, at(0, 0.85, 0.02)), '--cc-body', 0.012);          // the box, open
      box(0.86, 0.02, 0.5, M(tg, at(0, 0.915, 0.02)), '--cc-line', false);          // its lining
      box(0.9, 0.5, 0.05, M(tg, at(0, 1.13, -0.27, 0, -0.18)), '--cc-body', 0.012); // the lid, up
      box(0.12, 0.012, 0.02, M(tg, at(0.42, 0.92, 0.3)), '--cc-brass', false);      // a catch
      // The lamp: a weighted foot on the table's left, an arm up and over, a shade.
      kit.cyl(0.11, 0.13, 0.04, M(tg, at(-0.5, 0.8, -0.18)), '--cc-brass', 0.008, 16);
      var a1 = new T.Vector3(-0.5, 0.82, -0.18), a2 = new T.Vector3(-0.62, 1.55, -0.1), a3 = new T.Vector3(-0.15, 1.7, 0.0);
      [[a1, a2], [a2, a3]].forEach(function (seg) {
        var v = seg[1].clone().sub(seg[0]), mid = seg[0].clone().add(seg[1]).multiplyScalar(0.5);
        var g = new T.CylinderGeometry(0.018, 0.018, v.length(), 6);
        g.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), v.normalize()));
        kit.piece(g, M(tg, at(mid.x, mid.y, mid.z)), '--cc-brass', false);
      });
      kit.piece(new T.ConeGeometry(0.16, 0.22, 16, 1, true), M(tg, at(-0.1, 1.62, 0.02, 0, 0, -0.5)), '--cc-body', 0.01);
      kit.flat(new T.CircleGeometry(0.13, 16), M(tg, at(-0.05, 1.52, 0.03, 0, -Math.PI / 2 + 0.2, 0)), '--cc-daylight');
      var daylight = new T.SpotLight(kit.col('--cc-daylight'), 14, 6, 0.75, 0.6, 1.4);
      daylight.position.copy(new T.Vector3(-0.08, 1.55, 0.02).applyMatrix4(tg));
      daylight.target.position.copy(new T.Vector3(0.05, 0.85, 0.05).applyMatrix4(tg));
      daylight.castShadow = true;
      daylight.shadow.mapSize.set(1024, 1024);
      daylight.shadow.bias = -0.0008; daylight.shadow.normalBias = 0.02;
      kit.scene.add(daylight, daylight.target);
      // Behind the table, the photographs on a board of their own, which the
      // lamp does not reach: they are laid over the picture, untinted.
      var pb = at(-3.4, 0, -7.1);
      [-1, 1].forEach(function (e) { box(0.08, 1.9, 0.08, M(pb, at(e * 1.15, 0.95, -0.08)), '--cc-body', 0.01); });
      var pens = kit.lift(frame, '.cc-items', { n: 0, w: 900, h: 900, ww: 2.3, m: M(pb, at(0, 0.75, 0)) });
      var pensLabel = label(0, at(-1.6, 0, -5.4, -0.5));

      // RYAN'S PERFUME: a tall cupboard against the left-hand wall, its door
      // ajar, the strip light inside the door switched off, because there is
      // nothing in it yet: its lamp goes on with the first photograph.
      var cg = at(-W / 2 + 0.5, 0, -10.0, LEFT);
      box(1.2, 2.2, 0.6, M(cg, at(0, 1.1, 0)), '--cc-body', 0.014);
      box(1.08, 2.0, 0.04, M(cg, at(0, 1.1, 0.29)), '--cc-dark', false);           // the dark inside
      [0.7, 1.3].forEach(function (y) { box(1.06, 0.03, 0.5, M(cg, at(0, y, 0.02)), '--cc-line', false); });
      var door = M(cg, at(0.6, 0, 0.3, -0.75));                                    // hinged on its right, ajar
      box(1.1, 2.1, 0.04, M(door, at(-0.55, 1.1, 0.0)), '--cc-body', 0.012);
      box(0.04, 1.6, 0.03, M(door, at(-0.92, 1.1, -0.03)), '--cc-line', false);    // the strip, off
      kit.cyl(0.025, 0.025, 0.05, M(door, at(-1.0, 1.1, 0.04, 0, Math.PI / 2)), '--cc-brass', false, 8);
      var perfumeLabel = label(1, at(-5.7, 0, -8.5, 1.25));

      // NORAH AND HER HUSBAND'S LEATHER: a pegboard on the back wall over a
      // bench, with no lamp, because the lamp is theirs to choose.
      var pg = at(-2.6, 0, back + 0.2);
      box(2.6, 1.4, 0.04, M(pg, at(0, 1.9, 0.02)), '--cc-body', 0.012);
      for (var px = 0; px < 12; px++) for (var py = 0; py < 6; py++) {
        kit.flat(new T.CircleGeometry(0.018, 6), M(pg, at(-1.15 + px * 0.21, 1.35 + py * 0.22, 0.045)), '--cc-line');
      }
      box(2.4, 0.06, 0.6, M(pg, at(0, 0.74, 0.35)), '--cc-body', 0.012);
      [-1, 1].forEach(function (e) { box(0.06, 0.72, 0.5, M(pg, at(e * 1.1, 0.36, 0.35)), '--cc-body', 0.01); });
      var leatherLabel = label(2, at(-0.4, 0, back + 1.4, -0.35));

      // CHELSEA'S HOUSE PLANTS: a plant stand in three steps, no lamp, and
      // nothing on it until Chelsea sends something.
      var sg = at(2.6, 0, -11.6, -0.25);
      [[0.4, 0.3], [0.8, 0.0], [1.2, -0.3]].forEach(function (s, i) {
        box(1.4, 0.04, 0.3, M(sg, at(0, s[0], s[1])), '--cc-body', 0.01);
      });
      [-0.65, 0.65].forEach(function (x) {
        var g = new T.CylinderGeometry(0.02, 0.02, 1.35, 6);
        g.applyQuaternion(new T.Quaternion().setFromEuler(new T.Euler(-0.4, 0, 0)));
        kit.piece(g, M(sg, at(x, 0.62, 0.0)), '--cc-line', false);
      });
      var plantsLabel = label(3, at(1.4, 0, -10.2, -0.6));

      // HELEN'S BOOKS AND ROCKS: a chest of shallow drawers against the
      // right-hand wall, one drawer pulled out and empty, no lamp.
      var hg = at(W / 2 - 0.5, 0, -8.4, RIGHT);
      box(1.4, 1.0, 0.6, M(hg, at(0, 0.5, 0)), '--cc-body', 0.014);
      for (var d = 0; d < 6; d++) {
        var out = d === 2 ? 0.3 : 0;
        box(1.3, 0.13, 0.04, M(hg, at(0, 0.12 + d * 0.15, 0.3 + out)), '--cc-body', 0.008);
        box(0.18, 0.025, 0.02, M(hg, at(0, 0.12 + d * 0.15, 0.33 + out)), '--cc-brass', false);
        if (out) box(1.28, 0.11, out, M(hg, at(0, 0.12 + d * 0.15, 0.3 + out / 2)), '--cc-dark', false);
      }
      var helenLabel = label(4, at(5.9, 0, -6.5, -1.45));

      // THE PAGE'S OWN WORDS ON THE WALLS, out on the dark: why keep a
      // collection by the way in, and the house rules, putting something in a
      // cabinet and whose these are along the right-hand wall.
      var why = kit.lift(frame, '.cc-part', { n: 0, w: 760, h: 760, ww: 1.7, m: at(-W / 2 + 0.04, 0.9, -2.6, LEFT) });
      var rules = kit.lift(frame, '.cc-part', { n: 2, w: 760, h: 760, ww: 1.7, m: at(W / 2 - 0.04, 0.9, -11.2, RIGHT) });
      var putIn = kit.lift(frame, '.cc-part', { n: 3, w: 760, h: 760, ww: 1.7, m: at(W / 2 - 0.04, 0.9, -13.8, RIGHT) });
      var whose = kit.lift(frame, '.cc-part.cc-thanks', { w: 760, h: 760, ww: 1.7, m: at(1.6, 0.9, back + 0.04) });

      return {
        start: { x: 0, z: -0.6, yaw: 0 },
        bounds: { x: [-W / 2 + 0.9, W / 2 - 0.9], z: [back + 1.0, 0.4] },
        stops: [
          { name: 'just inside the way in, the house lights off and only one lamp lit', x: 0, z: -0.6, yaw: 0 },
          { name: 'at why keep a collection, on the wall by the way in', x: -W / 2 + 2.4, z: -2.6, yaw: LEFT, pitch: 0.12, frame: why.el },
          { name: 'at the right-hand wall by the way in, with the gallery’s own page on it', x: W / 2 - 2.6, z: -3.2, yaw: RIGHT, pitch: 0.12, page: kit.page, frame: frame },
          { name: 'at Ryan’s writing box, open under the daylight lamp', x: -3.4, z: -4.2, yaw: 0, pitch: -0.25 },
          { name: 'at the photographs of Ryan’s pens, paper and ink, behind the writing box', x: -3.4, z: -4.6, yaw: 0, pitch: 0.12, frame: pens.el },
          { name: 'at the label for Ryan’s pens, paper and ink', x: -0.8, z: -4.2, yaw: -0.5, pitch: -0.05, frame: pensLabel.el },
          { name: 'at Ryan’s perfume cupboard, its door ajar and its strip light off', x: -3.6, z: -10.1, yaw: 1.5, pitch: 0.05 },
          { name: 'at the label for Ryan’s perfume', x: -4.2, z: -8.1, yaw: 1.35, pitch: -0.05, frame: perfumeLabel.el },
          { name: 'at Norah and her husband’s pegboard over the bench, waiting for its lamp', x: -1.9, z: back + 3.4, yaw: 0.05, pitch: 0.12, frame: leatherLabel.el },
          { name: 'at Chelsea’s plant stand, waiting for its lamp', x: 1.0, z: -8.8, yaw: -0.4, pitch: -0.05, frame: plantsLabel.el },
          { name: 'at Helen’s chest of drawers, one drawer out, waiting for its lamp', x: 3.5, z: -7.9, yaw: -1.35, pitch: -0.05, frame: helenLabel.el },
          { name: 'at the house rules, on the right-hand wall', x: W / 2 - 2.4, z: -11.2, yaw: RIGHT, pitch: 0.12, frame: rules.el },
          { name: 'at putting something in a cabinet, on the right-hand wall', x: W / 2 - 2.4, z: -13.8, yaw: RIGHT, pitch: 0.12, frame: putIn.el },
          { name: 'at whose these are, on the back wall', x: 1.6, z: back + 2.4, yaw: 0, pitch: 0.12, frame: whose.el }
        ]
      };
    }
  };
})();

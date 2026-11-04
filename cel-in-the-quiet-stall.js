/* =============================================================================
   The Quiet Stall, walked into on Cel Street: a public restroom on the street,
   for everybody. Ryan's brief, 2026-11-03.

   IT IS THE QUIET STALL'S WORLD AND NOBODY ELSE'S (§140): felt on the walls,
   cork on the floor, every corner rounded so nothing rings in it, and THE
   LIGHT FROM COVES HIDDEN ALONG THE TOPS OF THE WALLS, so the ceiling is the
   brightest thing in the room and the light comes down off it low and even,
   from nowhere you can see. There is no lamp, no bulb and no tube anywhere in
   it; the only lit things are the small lamps over the stalls, which say FREE
   or IN USE in words beside them, round when free and square when not.

   WHAT IS IN IT is the list every restroom on the street carries: the basins
   with the step folded under them, paper towels and no air dryer, the shelf
   with the cork bowl and the cabinet by the door, the long bench with a heavy
   blanket on it, the changing table big enough for an adult with its hoist
   parked by it, and the stalls, each a small room of its own. The list itself
   is lifted off the page onto the wall over the bench, so it is the page's
   own words and cannot drift from them.

   NOTHING MOVES, AT ANY SETTING. Every colour is one the room declares, by
   name. It keeps nothing, sends nothing and fetches nothing; its page arrives
   through Cel Street's screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['the-quiet-stall.html'] = {
    name: 'The Quiet Stall',
    faces: ['"Atkinson Hyperlegible"'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var PI = Math.PI;
      var W = 6, D = 16, H = 4.4, back = -D;

      // A box with every corner rounded, stood on its face: felt doors and
      // panels, which is how nothing in here rings.
      var soft = function (w, h, d, r, m, ink, edge) {
        var s = new T.Shape(), x = -w / 2, y = -h / 2;
        s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
        s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
        s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
        var g = new T.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 8 });
        g.translate(0, 0, -d / 2);
        kit.piece(g, m, ink, edge == null ? 0.02 : edge);
      };
      // A plate with words on it, in the room's own face and inks.
      var plate = function (words, w, h, m, ground, ink) {
        var tex = kit.paper(512, Math.round(512 * h / w), function (c, cw, ch) {
          c.fillStyle = kit.ink(ground); c.fillRect(0, 0, cw, ch);
          c.fillStyle = kit.ink(ink); c.textAlign = 'center'; c.textBaseline = 'middle';
          var size = Math.round(ch * 0.5);
          do { c.font = '700 ' + size + 'px "Atkinson Hyperlegible"'; size -= 2; } while (c.measureText(words).width > cw - 40 && size > 12);
          c.fillText(words, cw / 2, ch / 2 + 2);
        });
        kit.sheet(tex, w, h, m);
      };

      // THE LIGHT: down off the ceiling, low and even, and nothing casting a
      // hard shadow, because the source is a band along every wall rather
      // than a point.
      kit.scene.background = kit.col('--qst-felt');
      kit.scene.add(new T.HemisphereLight(kit.col('--qst-cove'), kit.col('--qst-felt'), 2.9));
      var down = new T.DirectionalLight(kit.col('--qst-cove'), 0.85);
      down.position.set(0, 20, -6); down.target.position.set(0, 0, -7);
      kit.scene.add(down, down.target);

      // THE ROOM: cork, felt, and a ceiling the coves light, drawn unlit so it
      // is as pale as the light on it.
      box(W * 2 + 1, 0.1, D + 1, at(0, -0.05, -D / 2), '--qst-cork', false, false);
      for (var k = 0; k < 360; k++) {
        var fx = ((k * 7919) % 1000) / 1000 * (W * 2 - 0.4) - W + 0.2;
        var fz = -((k * 104729) % 1000) / 1000 * (D - 0.3) - 0.15;
        kit.flat(new T.CircleGeometry(0.02 + ((k * 31) % 7) / 150, 6), at(fx, 0.006, fz, 0, -PI / 2), '--qst-cork-dark');
      }
      box(0.3, H, D, at(-W - 0.15, H / 2, -D / 2), '--qst-felt');
      box(0.3, H, D, at(W + 0.15, H / 2, -D / 2), '--qst-felt');
      box(W * 2 + 0.6, H, 0.3, at(0, H / 2, 0.15), '--qst-felt');
      box(W * 2 + 0.6, H, 0.3, at(0, H / 2, back - 0.15), '--qst-felt');
      kit.flat(new T.PlaneGeometry(W * 2, D), at(0, H, -D / 2, 0, PI / 2), '--qst-cove');
      // The coves: a dark lip along the top of every wall, hiding the light,
      // and the pale of the ceiling running down the wall just over it.
      [[-W + 0.2, 'side'], [W - 0.2, 'side']].forEach(function (c) {
        box(0.4, 0.22, D, at(c[0], H - 0.42, -D / 2), '--qst-shade', 0.02);
        box(0.04, 0.3, D, at(c[0] < 0 ? -W + 0.02 : W - 0.02, H - 0.16, -D / 2), '--qst-cove', false, false);
      });
      box(W * 2, 0.22, 0.4, at(0, H - 0.42, back + 0.2), '--qst-shade', 0.02);
      box(W * 2, 0.22, 0.4, at(0, H - 0.42, -0.2), '--qst-shade', 0.02);
      // Felt panels on the side walls, rounded, so the walls are soft all the
      // way along.
      for (var z = -1.6; z > back + 1.5; z -= 2.2) {
        soft(1.8, 1.6, 0.08, 0.32, at(-W + 0.05, 2.75, z, PI / 2), '--qst-shade', false);
        soft(1.8, 1.6, 0.08, 0.32, at(W - 0.05, 2.75, z, -PI / 2), '--qst-shade', false);
      }

      // THE STALLS across the far end: felt-faced doors floor to ceiling with
      // rounded corners and a soft round handle, and over each a lamp, round
      // when free and square when in use, with a plate that says which.
      var SZ = back + 4.2, SW = (W * 2 - 0.6) / 4;
      for (var s = 0; s < 4; s++) {
        var sx = -W + 0.3 + SW * (s + 0.5), free = s !== 1;
        box(0.16, H - 0.4, 4.2, at(sx - SW / 2, (H - 0.4) / 2, back + 2.1), '--qst-shade', 0.02);
        soft(SW - 0.24, H - 0.7, 0.12, 0.36, at(sx, (H - 0.7) / 2 + 0.05, SZ), '--qst-shade');
        soft(SW - 0.6, H - 1.2, 0.04, 0.28, at(sx, (H - 0.7) / 2 + 0.05, SZ + 0.08), '--qst-felt', false);
        kit.piece(new T.SphereGeometry(0.09, 14, 10), at(sx + SW / 2 - 0.42, 1.25, SZ + 0.12), '--qst-cork', 0.015);
        if (free) kit.flat(new T.CircleGeometry(0.12, 24), at(sx - 0.55, H - 0.55, SZ + 0.08), '--qst-free');
        else kit.flat(new T.PlaneGeometry(0.22, 0.22), at(sx - 0.55, H - 0.55, SZ + 0.08), '--qst-busy');
        plate(free ? 'FREE' : 'IN USE', 0.8, 0.26, at(sx + 0.15, H - 0.55, SZ + 0.08), '--qst-wool', '--qst-ink');
      }
      box(0.16, H - 0.4, 4.2, at(W - 0.3, (H - 0.4) / 2, back + 2.1), '--qst-shade', 0.02);
      plate('STALLS, FOR EVERYBODY', 2.6, 0.36, at(-W + 0.1, 3.4, SZ + 1.6, PI / 2), '--qst-wool', '--qst-ink');

      // THE BASINS on the left, with the step folded flat under them, a towel
      // dispenser that does not click, and the shelf of what is free.
      var BZ = -5.2;
      soft(0.7, 0.14, 3.2, 0.06, at(-W + 0.35, 0.86, BZ), '--qst-wool');
      box(0.6, 0.72, 3.0, at(-W + 0.32, 0.43, BZ), '--qst-shade', 0.02);
      [-0.9, 0.9].forEach(function (o) {
        var bowl = new T.CylinderGeometry(0.22, 0.16, 0.1, 24); bowl.scale(1, 1, 1.3);
        kit.piece(bowl, at(-W + 0.38, 0.9, BZ + o), '--qst-dim', 0.015);
        cyl(0.03, 0.03, 0.3, at(-W + 0.12, 1.08, BZ + o), '--qst-dim', 0.01, 8);
        // the Step 'n Wash, folded up flat against the cabinet
        soft(0.5, 0.3, 0.04, 0.06, at(-W + 0.64, 0.3, BZ + o, PI / 2), '--qst-dim');
      });
      soft(0.5, 0.62, 0.22, 0.12, at(-W + 0.12, 1.55, BZ + 2.0, PI / 2), '--qst-wool');
      box(0.32, 0.06, 1.8, at(-W + 0.2, 1.62, BZ - 2.2), '--qst-cork', 0.015);
      var bowl2 = new T.SphereGeometry(0.2, 18, 10, 0, PI * 2, 0, PI / 2); bowl2.rotateX(PI);
      kit.piece(bowl2, at(-W + 0.24, 1.86, BZ - 2.7), '--qst-cork', 0.015);
      box(0.2, 0.22, 0.24, at(-W + 0.24, 1.76, BZ - 2.15), '--qst-wool', 0.012);
      box(0.2, 0.18, 0.24, at(-W + 0.24, 1.74, BZ - 1.8), '--qst-blanket', 0.012);
      // The naloxone cabinet by the door, with its plate.
      soft(0.55, 0.62, 0.14, 0.1, at(-W + 0.08, 1.6, -1.6, PI / 2), '--qst-wool');
      plate('NALOXONE', 0.6, 0.16, at(-W + 0.16, 2.05, -1.6, PI / 2), '--qst-wool', '--qst-plum');
      plate('BASINS', 1.2, 0.3, at(-W + 0.1, 2.5, BZ, PI / 2), '--qst-wool', '--qst-ink');

      // THE BENCH on the right, upholstered, with a heavy blanket folded on it,
      // and the list lifted off the page onto the wall over it.
      var BX = W - 0.45;
      soft(0.8, 0.22, 4.6, 0.08, at(BX, 0.5, -5.0), '--qst-wool');
      soft(0.22, 0.7, 4.6, 0.08, at(W - 0.12, 0.92, -5.0), '--qst-wool');
      [-2.0, 2.0].forEach(function (o) { box(0.6, 0.38, 0.12, at(BX, 0.19, -5.0 + o), '--qst-shade', 0.012); });
      soft(0.66, 0.16, 1.3, 0.07, at(BX - 0.04, 0.7, -6.4), '--qst-blanket');
      soft(0.62, 0.12, 1.2, 0.06, at(BX - 0.04, 0.84, -6.42), '--qst-blanket');
      plate('SEATS', 1.2, 0.3, at(W - 0.1, 3.4, -2.4, -PI / 2), '--qst-wool', '--qst-ink');

      // THE CHANGING TABLE big enough for an adult, padded, by the stalls on
      // the left, with the hoist parked beside it on a cork mat.
      soft(1.0, 0.18, 2.0, 0.08, at(-W + 0.65, 0.82, back + 6.1), '--qst-wool');
      box(0.9, 0.7, 0.14, at(-W + 0.65, 0.4, back + 5.2), '--qst-shade', 0.012);
      box(0.9, 0.7, 0.14, at(-W + 0.65, 0.4, back + 7.0), '--qst-shade', 0.012);
      box(0.9, 0.04, 0.9, at(-W + 2.1, 0.02, back + 6.1), '--qst-cork-dark', false, false);
      cyl(0.04, 0.04, 2.1, at(-W + 2.1, 1.05, back + 6.1), '--qst-dim', 0.01, 8);
      box(0.9, 0.06, 0.06, at(-W + 1.7, 2.1, back + 6.1), '--qst-dim', 0.01);
      plate('CHANGING', 1.3, 0.3, at(-W + 0.1, 2.5, back + 6.1, PI / 2), '--qst-wool', '--qst-ink');

      // THE ROOM'S OWN PAGE, on the wall behind you, and its words lifted onto
      // the walls: what is in here over the bench, why it is quiet over the
      // basins.
      var pw = 1180, ph = 800, ww = 4.0;
      soft(ww + 0.3, ww * ph / pw + 0.3, 0.06, 0.18, at(0, 2.2, -0.05, PI), '--qst-shade', false);
      var frame = kit.screen(pw, ph, ww, at(0, 2.2, -0.1, PI), 'The Quiet Stall’s own page, on the wall behind you');
      var has = kit.lift(frame, '.qst-part', { n: 0, w: 720, h: 600, ww: 3.0, m: at(W - 0.08, 1.35, -5.0, -PI / 2) });
      var why = kit.lift(frame, '.qst-part', { n: 1, w: 640, h: 600, ww: 2.6, m: at(-W + 0.08, 1.2, -8.4, PI / 2) });

      return {
        start: { x: 0, z: -1.6, yaw: 0 },
        bounds: { x: [-W + 1.0, W - 1.2], z: [SZ + 1.2, -1.0] },
        stops: [
          { where: 'just inside the street door, the stalls ahead and the ceiling pale with light from nowhere you can see', name: 'just inside the door', x: 0, z: -1.6, yaw: 0, pitch: 0.06 },
          { where: 'at the basins, the step folded under them and the paper towels beside', name: 'at the basins', x: -W + 2.4, z: -5.2, yaw: PI / 2, pitch: -0.12 },
          { where: 'at the shelf of what is free, and the naloxone cabinet by the door', name: 'at the shelf', x: -W + 2.2, z: -2.6, yaw: PI / 2 + 0.3, pitch: 0.02 },
          { where: 'on the bench with the heavy blanket, under the list of what is in here', name: 'on the bench', x: W - 4.6, z: -5.0, yaw: -PI / 2, pitch: 0.1, frame: has.el },
          { where: 'at the stalls, every door felt-faced and its lamp saying free or in use', name: 'at the stalls', x: 0, z: SZ + 2.6, yaw: 0, pitch: 0.12 },
          { where: 'at the changing table big enough for an adult, the hoist parked beside it', name: 'at the changing table', x: -W + 3.0, z: back + 7.6, yaw: PI / 2 + 0.5, pitch: -0.1 },
          { where: 'at the wall over the basins, with why it is quiet', name: 'at why it is quiet', x: -W + 3.6, z: -8.4, yaw: PI / 2, pitch: 0.06, frame: why.el },
          { where: 'at the wall behind you, with the room’s own page on it', name: 'at the room’s own page', x: 0, z: -4.4, yaw: PI, pitch: 0.12, page: kit.page, frame: frame }
        ]
      };
    }
  };
})();

/* =============================================================================
   Big Steep Fermentables, walked into on Cel Street, through its doorway off
   the passage in Arlesglad Caverns, level B1. Ryan's ask, 2026-11-02: the
   caverns' levels.

   IT IS THE ROOM'S OWN WORLD (§66), A BREWERY AND CELLAR CUT INTO THE ROCK. Steel
   racks stand along both walls with the brewing on them in glass: bottles,
   carboys and fermenting jars, straw, amber, garnet, black and red. The lamps
   are behind the racks against the rock, so the light reaches the room through
   the drinks and the room's colour is what was brewed. Tall steel fermenters
   stand at the far corners. THERE IS NO WOOD AND NO BARREL ANYWHERE, and no
   brick: glass and steel on bare rock. The Chappell is the other room lit
   through glass, and that is fixed colour in a window; this is liquid in
   vessels, standing on racks.

   THE SCREEN IN THE ROCK IS NOT LIT. It is a dark pane set into the far wall in
   the racks' steel, and gives off nothing until somebody presses something.

   NOTHING MOVES AT ANY SETTING: no bubble rising, no glass filling.

   THE WORDS ARE THE PAGE'S OWN, lifted off it and never retyped: the house
   styles whole, every one as two pours with the alcohol-free one first and the
   same size, as the page has them; what the strengths mean and the house rules
   on steel plates on the right; the screen in the rock, what is on it and the
   way back; and the rack of somebody else's cellars, played as on the page
   through love-embed.js and rack.js.

   Every colour is one §66 declares, by name. It keeps nothing, sends nothing
   and fetches nothing; its page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['big-steep-fermentables.html'] = {
    name: 'Big Steep Fermentables',
    from: 'arlesglad-caverns.html',
    faces: ['"Zilla Slab"'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var W = 7.0, L = 15.0, H = 3.8;                  // the cellar
      var XL = -W / 2, XR = W / 2, FAR = -L;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;    // facing the left wall, the right wall
      var DRINKS = ['--bs-amber', '--bs-straw', '--bs-garnet', '--bs-stout', '--bs-hibiscus', '--bs-haze'];

      // THE ROCK'S OWN DARK, and only just enough to tell the walls from it.
      kit.scene.background = kit.col('--bs-rock');
      kit.scene.add(new T.HemisphereLight(kit.col('--bs-niche'), kit.col('--bs-rock'), 1.5));

      // An unlit sheet: what shines of itself rather than being lit, the light
      // coming through the drinks onto the rock behind the racks.
      function glow(map, w, h, m) {
        var mat = new T.MeshBasicMaterial({ map: map, transparent: true, depthWrite: false });
        var mesh = new T.Mesh(new T.PlaneGeometry(w, h), mat);
        mesh.matrixAutoUpdate = false;
        mesh.matrix.copy(m);
        mesh.matrixWorldNeedsUpdate = true;
        kit.scene.add(mesh);
      }
      // The lamps' light on the rock behind a run of glass, in that glass's
      // colour: brightest at the middle of the run, gone at its ends and at the
      // top and the foot, never a hard edge.
      function wash(ink) {
        return kit.paper(128, 96, function (c, w, h) {
          c.fillStyle = kit.ink(ink); c.fillRect(0, 0, w, h);
          var a = c.getImageData(0, 0, w, h);
          for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
            var fx = 1 - Math.abs(x - w / 2) / (w / 2), fy = 1 - Math.abs(y - h * 0.52) / (h * 0.52);
            a.data[(y * w + x) * 4 + 3] = Math.round(120 * Math.pow(Math.max(0, fx), 1.4) * Math.pow(Math.max(0, fy), 1.6));
          }
          c.putImageData(a, 0, 0);
        });
      }

      // THE FLOOR, the walls and the ceiling, bare rock, with the steel-framed
      // doorway back to the passage behind you.
      box(W + 0.6, 0.06, L + 1.2, at(0, -0.03, -L / 2 + 0.3), '--bs-rock', false, false);
      box(W + 0.6, 0.2, L + 1.2, at(0, H + 0.1, -L / 2 + 0.3), '--bs-rock', false, false);
      box(0.3, H, L + 1.2, at(XL - 0.15, H / 2, -L / 2 + 0.3), '--bs-rock', false);
      box(0.3, H, L + 1.2, at(XR + 0.15, H / 2, -L / 2 + 0.3), '--bs-rock', false);
      box(W + 0.6, H, 0.3, at(0, H / 2, FAR - 0.15), '--bs-rock', false);
      // The wall behind you, with the doorway in it.
      var DZ = 0.9;
      box((W - 1.4) / 2, H, 0.3, at(XL + (W - 1.4) / 4, H / 2, DZ), '--bs-rock', false);
      box((W - 1.4) / 2, H, 0.3, at(XR - (W - 1.4) / 4, H / 2, DZ), '--bs-rock', false);
      box(1.4, H - 2.3, 0.3, at(0, 2.3 + (H - 2.3) / 2, DZ), '--bs-rock', false);
      [-1, 1].forEach(function (k) { box(0.09, 2.3, 0.36, at(k * 0.7, 1.15, DZ - 0.02), '--bs-rack', 0.01); });
      box(1.5, 0.09, 0.36, at(0, 2.3, DZ - 0.02), '--bs-rack', 0.01);
      box(1.3, 2.25, 0.05, at(0, 1.12, DZ + 0.14), '--bs-niche', false, false);

      // THE RACKS along both walls: steel uprights and shelves, the brewing
      // standing on them in glass, and the light coming through it from the
      // lamps against the rock behind. Each run of shelving holds one kind.
      var SHELVES = [0.55, 1.35, 2.15], RD = 0.5;
      function vessel(kind, x, y, z, ink) {
        var flat = function (geo, m) { kit.flat(geo, m, ink); };
        if (kind === 0) {             // a bottle, and its neck
          flat(new T.CylinderGeometry(0.075, 0.075, 0.3, 12), at(x, y + 0.15, z));
          flat(new T.CylinderGeometry(0.03, 0.06, 0.14, 10), at(x, y + 0.37, z));
        } else if (kind === 1) {      // a carboy: round, with a short neck
          var g = new T.SphereGeometry(0.2, 16, 12); g.scale(1, 0.95, 1);
          flat(g, at(x, y + 0.2, z));
          flat(new T.CylinderGeometry(0.05, 0.05, 0.1, 10), at(x, y + 0.43, z));
        } else {                      // a fermenting jar, squat and wide
          flat(new T.CylinderGeometry(0.17, 0.17, 0.36, 16), at(x, y + 0.18, z));
          cyl(0.18, 0.18, 0.04, at(x, y + 0.38, z), '--bs-rack', 0.01, 16);
        }
      }
      function rack(side, z0, z1, ink, kind, seed) {
        var x = side * (W / 2 - RD / 2 - 0.12), len = z0 - z1, mid = (z0 + z1) / 2;
        [z0, z1].forEach(function (z) { box(0.07, 2.6, RD, at(x, 1.3, z), '--bs-rack', 0.01); });
        SHELVES.forEach(function (y) {
          box(0.05, 0.05, len, at(x - side * RD / 2, y, mid), '--bs-rack', 0.008);
          box(RD, 0.03, len, at(x, y - 0.03, mid), '--bs-rack', false);
          var n = Math.floor(len / (kind === 0 ? 0.26 : 0.5));
          for (var i = 0; i < n; i++) {
            if (((i * 7 + seed + y * 10) | 0) % 11 === 3) continue;          // a gap where one was taken
            vessel(kind, x, y, z0 - (i + 0.5) * len / n, ink);
          }
        });
        // The lamp's light through the glass, on the rock behind the run.
        glow(wash(ink), len, 2.6, at(side * (W / 2 - 0.005), 1.35, mid, side < 0 ? LEFT : RIGHT));
        var lamp = new T.PointLight(kit.col(ink), 3.2, 3.6, 1.4);
        lamp.position.set(side * (W / 2 - 0.08), 1.4, mid);
        kit.scene.add(lamp);
      }
      // The left wall: two runs, then the house styles' plate, then a run.
      rack(-1, -1.2, -3.8, '--bs-amber', 0, 1);
      rack(-1, -3.8, -5.6, '--bs-straw', 1, 2);
      rack(-1, -9.6, -12.2, '--bs-stout', 0, 3);
      // The right wall: a run, the plates, then two runs.
      rack(1, -1.6, -3.4, '--bs-hibiscus', 2, 4);
      rack(1, -8.6, -10.4, '--bs-garnet', 1, 5);
      rack(1, -10.4, -12.4, '--bs-haze', 2, 6);

      // THE TALL STEEL FERMENTERS at the far corners: a cylinder on legs with a
      // cone under it and a valve at the foot.
      [-1, 1].forEach(function (side) {
        var fx = side * (W / 2 - 0.75), fz = FAR + 1.0;
        cyl(0.5, 0.5, 1.9, at(fx, 1.75, fz), '--bs-rack', 0.015, 24);
        cyl(0.5, 0.12, 0.45, at(fx, 0.58, fz), '--bs-rack', 0.012, 24);
        cyl(0.52, 0.52, 0.05, at(fx, 2.72, fz), '--bs-dim', 0.008, 24);
        [0, 1, 2].forEach(function (k) {
          var a = k / 3 * Math.PI * 2;
          box(0.05, 0.9, 0.05, at(fx + Math.sin(a) * 0.42, 0.45, fz + Math.cos(a) * 0.42), '--bs-rack', 0.008);
        });
        box(0.14, 0.06, 0.06, at(fx - side * 0.08, 0.32, fz + 0.12), '--bs-dim', false);
      });

      // THE ROOM'S NAME, stencilled on a steel plate over the screen.
      var name = kit.paper(1024, 160, function (c, w, h) {
        c.fillStyle = kit.ink('--bs-rack'); c.fillRect(0, 0, w, h);
        c.strokeStyle = kit.ink('--bs-dim'); c.lineWidth = 6; c.strokeRect(8, 8, w - 16, h - 16);
        c.fillStyle = kit.ink('--bs-cream');
        c.font = '700 84px "Zilla Slab"'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText('Big Steep Fermentables', w / 2, h / 2 + 4);
      });
      kit.sheet(name, 3.6, 0.56, at(0, 3.25, FAR + 0.02));

      // THE SCREEN IN THE ROCK, in the far wall: a dark pane in a steel frame,
      // giving off nothing until somebody presses something; what is on it
      // under it, and the way back under that.
      var SW = 2.6, SH = SW * 9 / 16, SY = 1.75;
      box(SW + 0.2, SH + 0.2, 0.08, at(0, SY, FAR + 0.04), '--bs-rack', 0.012);
      box(SW, SH, 0.04, at(0, SY, FAR + 0.09), '--bs-niche', false, false);

      // THE ROOM'S OWN PAGE, on a steel plate on the right-hand wall by the
      // doorway, with the rest of the cellar on it.
      var pw = 2.2, ph = pw * 800 / 1180, py = 0.55 + ph / 2, pz = -0.2 - pw / 2 + 0.1;
      box(0.05, ph + 0.12, pw + 0.12, at(XR - 0.03, py, pz), '--bs-rack', 0.01);
      var page = kit.screen(1180, 800, pw, at(XR - 0.07, py, pz, RIGHT), 'Big Steep Fermentables’ own page, on the wall by the doorway', [0.6, XR, pz - 2.4, pz + 2.4]);

      // Everything the room shows of the page is lifted off the page itself,
      // each standing on its foot at the point it is given.
      // Lifted words are drawn over the picture, so each plate shows only while
      // you stand near it and the racks stay in sight from everywhere else.
      var Z_DOOR = [XL, -0.6, -2.4, 0.6], Z_STYLES = [XL, -0.4, -10.0, -5.2],
        Z_RULES = [0.4, XR, -8.8, -3.2], Z_FAR = [XL, XR, FAR, FAR + 5.2];
      var screen = kit.lift(page, '.bs-screen', { w: 860, ww: SW, m: at(0, SY - SH / 2, FAR + 0.12) });
      var now = kit.lift(page, '.bs-screen__now', { w: 760, ww: 2.0, m: at(0, SY - SH / 2 - 0.42, FAR + 0.12) });
      kit.lift(page, '.bs-screen__back', { w: 640, ww: 1.6, m: at(0, SY - SH / 2 - 0.78, FAR + 0.12) });

      // ON THE LEFT, in the gap between the runs: the house styles, every one
      // whole, on a steel plate; the line about them above it.
      var SZ = -7.6;
      box(0.05, 3.3, 3.2, at(XL + 0.03, 1.7, SZ), '--bs-rack', 0.01);
      var intro = kit.lift(page, '.bs-intro', { n: 0, w: 860, ww: 2.6, m: at(XL + 0.08, 3.0, SZ, LEFT), zone: Z_STYLES });
      var styles = kit.lift(page, '.bs-racks', { w: 900, h: 900, ww: 2.8, m: at(XL + 0.08, 0.15, SZ, LEFT), zone: Z_STYLES });

      // ON THE RIGHT, in the gap: what the strengths mean, and the house rules.
      box(0.05, 2.4, 4.4, at(XR - 0.03, 1.5, -6.0), '--bs-rack', 0.01);
      var strengths = kit.lift(page, '.bs-ledge', { n: 0, w: 760, h: 720, ww: 1.9, m: at(XR - 0.08, 0.85, -4.95, RIGHT), zone: Z_RULES });
      var rules = kit.lift(page, '.bs-ledge', { n: 1, w: 760, h: 720, ww: 1.9, m: at(XR - 0.08, 0.85, -7.05, RIGHT), zone: Z_RULES });

      // BY THE DOORWAY on the left: where you are and what the cellar is.
      var over = kit.lift(page, '.bs-over', { w: 640, ww: 1.3, m: at(XL + 0.08, 2.45, -0.35, LEFT), zone: Z_DOOR });
      var lede = kit.lift(page, '.lede', { w: 760, ww: 1.5, m: at(XL + 0.08, 1.2, -0.35, LEFT), zone: Z_DOOR });

      // ON THE FAR WALL, right of the screen: the rack of somebody else's
      // cellars, and the line about them over it; the credit on the left.
      var KX = SW / 2 + 1.2;
      var amb = kit.lift(page, '.bs-intro', { n: 1, w: 760, ww: 1.5, m: at(KX, 2.25, FAR + 0.12), zone: Z_FAR });
      var cellars = kit.lift(page, '.bs-cellars', { w: 760, h: 820, ww: 1.5, m: at(KX, 0.5, FAR + 0.12), zone: Z_FAR });
      var credit = kit.lift(page, '.bs-credit', { w: 760, ww: 1.4, m: at(-KX, 1.0, FAR + 0.12), zone: Z_FAR });

      kit.wire(page, 'rack.js');

      return {
        start: { x: 0, z: -0.2, yaw: 0 },
        bounds: { x: [XL + 1.0, XR - 1.0], z: [FAR + 1.6, 0.3] },
        stops: [
          { name: 'in from the passage, the racks along both walls lit from behind through their glass, the screen dark in the far wall', x: 0, z: -0.2, yaw: 0, pitch: 0.06 },
          { name: 'by the doorway: where you are, level B1', x: XL + 1.6, z: -0.35, yaw: LEFT, pitch: 0.12, frame: over.el },
          { name: 'by the doorway: what this cellar is', x: XL + 1.7, z: -0.35, yaw: LEFT, pitch: 0.02, frame: lede.el },
          { name: 'at the left-hand racks, close: bottles and carboys lit from behind, amber and straw', x: XL + 1.6, z: -3.4, yaw: LEFT, pitch: 0.1 },
          { name: 'at the plate on the left: our house styles, every one alcohol-free first and the same size', x: XL + 3.0, z: SZ, yaw: LEFT, pitch: -0.05, frame: styles.el },
          { name: 'over the house styles: what every pour says before you take it', x: XL + 2.6, z: SZ, yaw: LEFT, pitch: 0.42, frame: intro.el },
          { name: 'at the plate on the right: what the strengths mean', x: XR - 1.9, z: -4.95, yaw: RIGHT, pitch: 0.04, frame: strengths.el },
          { name: 'at the plate on the right: the house rules', x: XR - 1.9, z: -7.05, yaw: RIGHT, pitch: 0.04, frame: rules.el },
          { name: 'at the far end, before the screen in the rock, dark until somebody presses something', x: 0, z: FAR + 3.3, yaw: 0, pitch: 0.08, frame: screen.el },
          { name: 'under the screen: what is on it, and the way back', x: 0, z: FAR + 2.4, yaw: 0, pitch: -0.12, frame: now.el },
          { name: 'at the rack by the screen: somebody else’s cellars, to leave on', x: KX, z: FAR + 2.2, yaw: 0, pitch: 0.02, frame: cellars.el },
          { name: 'over the rack: whose cellars they are', x: KX, z: FAR + 2.4, yaw: 0, pitch: 0.26, frame: amb.el },
          { name: 'by the fermenters on the left of the screen: whose words these are', x: -KX, z: FAR + 2.2, yaw: 0, pitch: 0.04, frame: credit.el },
          { name: 'at the right-hand wall by the doorway, with the cellar’s own page on it', x: XR - 2.0, z: pz, yaw: RIGHT, pitch: 0.05, page: kit.page, frame: page }
        ]
      };
    }
  };
})();

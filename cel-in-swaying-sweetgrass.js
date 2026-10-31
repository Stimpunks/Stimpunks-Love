/* =============================================================================
   Swaying Sweetgrass, walked into on Cel Street. Ryan's ask, 2026-10-31: pitch
   02 on the campgrounds, through its post in the field.

   IT IS THE MEADOW'S WORLD AND NOBODY ELSE'S (§25): a meadow left alone, one
   accessible path through it, and a clearing at the end with a ring of stones
   and a fire pit. THE SUN IS LOW, A HUNDRED FEET OFF AND BEHIND EVERYTHING, so
   nothing has a lit face: the blades glow because the light is coming through
   them, the greens go yellow at the top and the ground stays dark, and the
   pale band is at the foot of the stems, where it is on the plant. No
   furniture: the path and the fire ring are the only built things, and you go
   a long way through nothing to reach them. Green-gold, never brown. The fire
   in the pit is painted in the room's own two golds; the real fire is the
   room's own, lifted off its page onto its plate beyond the ring, and only
   ever burns in a frame somebody pressed for, with the fires in the playlist
   laid on the ground beside the ring, each burning where it lies or going up
   on the plate, as rack.js works them on the page.

   NOTHING MOVES: the grass sways on the page at MAX, and here it stands still
   at every setting. Nothing here teaches sweetgrass. Every colour is one the
   room declares, by name. It keeps nothing, sends nothing and fetches nothing;
   its page arrives through Cel Street's screen(). tools/make-cel-street.py
   holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 19, 374761393) ^ Math.imul(j + 61, 668265263) ^ Math.imul(k + 67, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['swaying-sweetgrass.html'] = {
    name: 'Swaying Sweetgrass',
    from: 'campgrounds.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var CZ = -26, CR = 6.5;
      // Where the path goes: gently from the edge of the meadow to the clearing.
      function pathX(z) { return Math.sin(z * 0.16) * 1.2 * Math.min(1, -z / 8); }

      // THE LIGHT, low and ahead, behind the grass: a pale sky, the sun's disc
      // on the horizon at the end of the path, and a haze between.
      kit.scene.background = kit.col('--awn');
      kit.scene.fog = new T.Fog(kit.col('--awn'), 30, 220);
      kit.scene.add(new T.HemisphereLight(kit.col('--straw'), kit.col('--soil'), 1.9));
      var sun = new T.DirectionalLight(kit.col('--seed'), 1.1);
      sun.position.set(0, 3, -60); sun.target.position.set(0, 0, 0);
      kit.scene.add(sun, sun.target);
      kit.flat(new T.CircleGeometry(9, 40), at(0, 3.2, -80), '--seed');
      kit.flat(new T.CircleGeometry(5.5, 40), at(0, 3.2, -79.8), '--straw');

      // THE GROUND, dark, and the one path across it, firm and wide, with the
      // sun catching its two edges.
      box(200, 0.1, 200, at(0, -0.05, -40), '--soil', false, false);
      for (var z = 1.5; z > CZ + CR - 0.5; z -= 0.5) {
        var x0 = pathX(z);
        box(1.9, 0.03, 0.56, at(x0, 0.015, z, Math.cos(z * 0.16) * 0.19), '--shade', false, false);
        [-1, 1].forEach(function (s) { box(0.05, 0.035, 0.56, at(x0 + s * 0.97, 0.018, z, Math.cos(z * 0.16) * 0.19), '--awn', false, false); });
      }
      // The clearing: a disc of bare ground, and the ring of stones.
      kit.cyl(CR, CR, 0.04, at(0, 0.02, CZ), '--shade', false, 40);
      var stone = new T.DodecahedronGeometry(0.28, 0);
      for (var k = 0; k < 14; k++) {
        var a = k / 14 * Math.PI * 2, g = stone.clone(); g.scale(1, 0.6, 0.9);
        kit.piece(g, at(Math.cos(a) * 1.05, 0.12, CZ + Math.sin(a) * 1.05, k), '--stem', 0.03);
      }
      // THE FIRE in the pit, painted in the room's two golds and nothing else.
      [[0, 0, 0.9, '--seed'], [0.18, 0.1, 0.65, '--glow'], [-0.2, -0.05, 0.55, '--glow'], [0.05, -0.2, 0.5, '--seed'], [-0.08, 0.2, 0.42, '--seed']].forEach(function (f, i) {
        kit.piece(new T.ConeGeometry(0.16 + i * 0.01, f[2], 7), at(f[0], f[2] / 2 + 0.05, CZ + f[1], i), f[3], 0.02);
      });
      [-0.25, 0.25].forEach(function (o, i) { kit.cyl(0.07, 0.07, 1.0, at(o * 0.4, 0.08, CZ + o, i ? 0.7 : -0.6, 0, Math.PI / 2), '--stem', 0.02, 7); });
      // A thread of smoke, straight up into the still air.
      for (k = 0; k < 9; k++) kit.piece(new T.SphereGeometry(0.035 + k * 0.006, 6, 4), at(Math.sin(k * 0.9) * 0.05, 1.1 + k * 0.32, CZ - k * 0.03), '--awn', false);

      // THE GRASS, left alone: clumps of blades everywhere but the path and the
      // clearing, the tall ones gold at the tips where the light comes through,
      // the band pale at the foot of each clump, and seed heads on some.
      var blade = new T.ConeGeometry(0.028, 1, 3);
      var head = new T.SphereGeometry(0.05, 5, 4);
      var foot = new T.CircleGeometry(0.1, 6);
      for (k = 0; k < 2400; k++) {
        // The nearer half of the meadow is the thicker, so the grass is round you.
        var cx = (hash(k, 1, 1) - 0.5) * (k < 1700 ? 48 : 22), cz = 3 - hash(k, 1, 2) * (k < 1700 ? 56 : 24);
        if (Math.abs(cx - pathX(cz)) < 1.4 && cz > CZ + CR - 1) continue;
        if (Math.hypot(cx, cz - CZ) < CR + 0.2) continue;
        var near = Math.hypot(cx, cz) < 6 ? 0.7 : 1;
        var tall = (0.55 + hash(k, 1, 3) * 1.0) * near;
        kit.piece(foot.clone(), at(cx, 0.012, cz, 0, -Math.PI / 2), '--band', false);
        for (var b = 0; b < 4; b++) {
          var h = tall * (0.6 + hash(k, b, 4) * 0.5), lean = (hash(k, b, 5) - 0.5) * 0.5, turn = hash(k, b, 6) * 6;
          var gb = blade.clone(); gb.scale(1, h, 1);
          var ink = h > 1.0 ? '--glow' : h > 0.7 ? '--sedge' : '--stem';
          kit.piece(gb, at(cx + (hash(k, b, 7) - 0.5) * 0.3, h / 2, cz + (hash(k, b, 8) - 0.5) * 0.3, turn, lean * 0.6, lean), ink, false);
          if (h > 1.05 && b % 2 === 0) {
            var hg = head.clone(); hg.scale(0.8, 2.4, 0.8);
            kit.piece(hg, at(cx + (hash(k, b, 7) - 0.5) * 0.3 + Math.sin(lean) * h * 0.5, h + 0.06, cz + (hash(k, b, 8) - 0.5) * 0.3, turn, lean * 0.6, lean), '--seed', false);
          }
        }
      }

      // THE FIRE'S OWN PLATE, lifted off the page, standing beyond the ring: it
      // burns only once somebody presses it. And the fires in the playlist,
      // laid on the ground beside the ring, each burning where it lies or going
      // up on the plate. rack.js, which the page loads, works them here.
      var page = kit.screen(1180, 800, 3.0, at(5.6, 1.3, CZ + 0.2, -0.7), 'Swaying Sweetgrass’s own page, standing in the grass at the edge of the clearing');
      var plate = kit.lift(page, '.swg-plot.swg-hearth', { drop: '.swg-fires, .hlink', w: 1136, ww: 3.4, m: at(0, 0.05, CZ - 4.6) });
      // The fires stand against a bank of earth at the edge of the clearing,
      // so their words are on the dark ground as they are on the page.
      var bank = new T.SphereGeometry(1, 18, 12); bank.scale(3.0, 4.6, 0.9);
      kit.piece(bank, at(-5.38, 0, CZ - 1.18, 0.7), '--shade', 0.05);
      for (k = 0; k < 40; k++) {
        var ba = (hash(k, 9, 1) - 0.5) * 3.6, bb = blade.clone(), bh = 0.4 + hash(k, 9, 2) * 0.5; bb.scale(1, bh, 1);
        kit.piece(bb, at(-5.38 + Math.cos(0.7) * ba, 4.35 + bh / 2 - ba * ba * 0.2, CZ - 1.18 - Math.sin(0.7) * ba, k, (hash(k, 9, 3) - 0.5) * 0.4), bh > 0.7 ? '--glow' : '--sedge', false);
      }
      var fires = kit.lift(page, '.swg-fires', { drop: '.hlink', w: 1136, ww: 3.4, m: at(-4.8, 0.05, CZ - 0.5, 0.7) });
      kit.wire(page, 'rack.js');

      return {
        start: { x: 0, z: 1.5, yaw: 0 },
        bounds: { x: [-10, 10], z: [CZ - 3.5, 2.5] },
        stops: [
          { name: 'at the edge of the meadow, where the one path goes in', x: 0, z: 1.5, yaw: 0 },
          { name: 'on the path, in the long grass with the sun behind it', x: pathX(-12), z: -12, yaw: 0 },
          { name: 'at the ring of stones, in the clearing', x: 0, z: CZ + 3.2, yaw: 0 },
          { name: 'at the fire’s own plate, beyond the ring', x: 0, z: CZ - 0.2, yaw: 0, frame: plate.el },
          { name: 'by the fires in the playlist, against the bank at the edge of the clearing', x: -2.62, z: CZ + 2.08, yaw: 0.7, frame: fires.el },
          { name: 'at the room’s own page, at the edge of the clearing', x: 3.6, z: CZ + 2.5, yaw: -0.7, page: kit.page, frame: page }
        ]
      };
    }
  };
})();

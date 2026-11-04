/* =============================================================================
   The Seaside Convenience, walked into on Cel Street: out through the shop
   door and onto a promenade, where a Victorian public convenience of painted
   cast iron and glazed tile stands under a glass canopy, with the sea past the
   railings.

   IT IS THE FRONT'S WORLD AND NOBODY ELSE'S (§139): a bright hazy sky over the
   sea, and the glare off the water coming in from the sea side, so everything
   is pale and high-key and the shadows are faint and blue. Nothing is lit from
   inside. It is not the MUD Room's Slake (overcast, olive mud, nothing built)
   and not the Hermitage (a low warm sun with a direction).

   THE PAVILION: tiled walls, a row of cubicle doors each with a little lamp
   over it that says free or in use (the page says so in words), an arch with
   an enamel sign that says Toilets and nothing else, benches facing the sea
   under the canopy, a cabinet by the arch for the naloxone, and the railings
   along the front. The room's own page stands on an enamel board by the
   arch, and its list, its quotations and what is not here are lifted onto
   boards along the tiled wall.

   NOTHING MOVES, at any setting: the sea lies still and so do the gulls. Every
   colour is one §139 declares, by name. It keeps nothing, sends nothing and
   fetches nothing; its page arrives through Cel Street's screen().
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 7, 374761393) ^ Math.imul(j + 29, 668265263) ^ Math.imul(k + 31, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['seaside-convenience.html'] = {
    name: 'The Seaside Convenience',
    faces: ['"Playfair Display"'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;

      // THE HAZE, AND THE GLARE OFF THE SEA. The sea is ahead of you (north,
      // -z); the light comes most from there, pale, with little direction.
      kit.scene.background = kit.col('--sea-sky');
      kit.scene.fog = new T.Fog(kit.col('--sea-sky'), 40, 180);
      kit.scene.add(new T.HemisphereLight(kit.col('--sea-glare'), kit.col('--sea-sand'), 2.6));
      var glare = new T.DirectionalLight(kit.col('--sea-glare'), 1.1);
      glare.position.set(-10, 26, -60);
      glare.castShadow = true;
      glare.shadow.mapSize.set(1024, 1024);
      glare.shadow.camera.left = -20; glare.shadow.camera.right = 20;
      glare.shadow.camera.top = 20; glare.shadow.camera.bottom = -20;
      glare.shadow.bias = -0.0006;
      kit.scene.add(glare, glare.target);

      // THE PROMENADE, the railings along its edge, the sea beyond with the
      // glare lying on it in still dashes, and a pier far off.
      box(80, 0.2, 30, at(0, -0.1, 0), '--sea-sand', false, false);
      for (var k = -38; k <= 38; k += 2) kit.flat(new T.PlaneGeometry(0.05, 30), at(k, 0.005, 0, 0, -Math.PI / 2), '--sea-shade');
      kit.flat(new T.PlaneGeometry(400, 300), at(0, -1.2, -165, 0, -Math.PI / 2), '--sea-sea');
      for (k = 0; k < 160; k++) {
        var gx = (hash(k, 1, 1) - 0.5) * 140, gz = -18 - hash(k, 1, 2) * 120;
        kit.flat(new T.PlaneGeometry(1.2 + hash(k, 1, 3) * 3.5, 0.12), at(gx, -1.15, gz, 0, -Math.PI / 2), '--sea-glare');
      }
      box(36, 0.5, 1.6, at(-28, 0.6, -70), '--sea-ink-2', false);
      for (k = 0; k < 9; k++) box(0.3, 2.2, 0.3, at(-44 + k * 4, -0.4, -70), '--sea-ink-2', false);
      // The railings: a top rail, a lower rail and posts, in the iron's green.
      var RZ = -15;
      box(80, 0.12, 0.12, at(0, 1.1, RZ), '--sea-iron');
      box(80, 0.08, 0.08, at(0, 0.55, RZ), '--sea-iron', false);
      for (var x = -39; x <= 39; x += 1.2) box(0.06, 1.1, 0.06, at(x, 0.55, RZ), '--sea-iron', false);
      // Gulls lying still in the haze over the water.
      [[-6, 9, -40], [-3, 11, -46], [14, 8, -38], [18, 10.5, -50]].forEach(function (g) {
        [-1, 1].forEach(function (s) {
          box(0.9, 0.06, 0.12, at(g[0] + s * 0.42, g[1] + 0.12, g[2], 0, 0, s * 0.35), '--sea-ink-2', false, false);
        });
      });

      // THE PAVILION, its back to the street, its front to the sea: tiled walls
      // with a darker band at the foot, a row of cubicle doors, the arch.
      var PZ = -3, PW = 16, PH = 3.6;
      box(PW, PH, 0.4, at(0, PH / 2, PZ), '--sea-tile');
      box(PW + 0.04, 0.9, 0.44, at(0, 0.45, PZ), '--sea-tile-2', false);
      for (var y = 1.2; y < PH; y += 0.32) box(PW + 0.02, 0.025, 0.41, at(0, y, PZ), '--sea-tile-2', false, false);
      box(PW + 0.3, 0.2, 0.6, at(0, PH + 0.1, PZ), '--sea-iron');
      [-PW / 2, PW / 2].forEach(function (ex) { box(0.3, PH, 0.6, at(ex, PH / 2, PZ), '--sea-iron'); });
      var doors = [];
      for (k = 0; k < 9; k++) {
        var dx = -PW / 2 + 1.0 + k * 1.75;
        if (k === 4) continue;
        doors.push(dx);
        box(1.1, 2.3, 0.08, at(dx, 1.15, PZ + 0.22), '--sea-cream');
        box(1.24, 0.1, 0.1, at(dx, 2.35, PZ + 0.24), '--sea-iron', false);
        kit.cyl(0.11, 0.11, 0.06, at(dx, 2.7, PZ + 0.24, 0, Math.PI / 2), k % 3 ? '--sea-free' : '--sea-inuse', 0.02, 14);
      }
      // The arch in the middle, open, and its enamel sign over it.
      var AX = -PW / 2 + 1.0 + 4 * 1.75;
      box(1.4, 2.6, 0.5, at(AX, 1.3, PZ + 0.02), '--sea-ink');
      var sign = kit.paper(640, 160, function (c, w, h) {
        c.fillStyle = kit.ink('--sea-iron'); c.fillRect(0, 0, w, h);
        c.strokeStyle = kit.ink('--sea-cream'); c.lineWidth = 8; c.strokeRect(10, 10, w - 20, h - 20);
        c.fillStyle = kit.ink('--sea-cream'); c.textAlign = 'center'; c.textBaseline = 'middle';
        c.font = '700 88px "Playfair Display"'; c.fillText('TOILETS', w / 2, h / 2 + 4);
      });
      kit.sheet(sign, 2.0, 0.5, at(AX, 3.05, PZ + 0.24));
      // The naloxone cabinet by the arch, painted the iron's green.
      box(0.4, 0.7, 0.18, at(AX + 0.95, 1.6, PZ + 0.29), '--sea-iron');
      box(0.3, 0.08, 0.02, at(AX + 0.95, 1.85, PZ + 0.39), '--sea-cream', false, false);

      // THE GLASS CANOPY on curly iron brackets, its ribs, and the faint blue
      // shadow it lays on the paving.
      var CZ = PZ + 2.2;
      box(PW + 3, 0.06, 4.6, at(0, 4.1, CZ, 0, 0.1), '--sea-glass', false);
      for (x = -PW / 2 - 1.4; x <= PW / 2 + 1.4; x += 1.6) box(0.08, 0.1, 4.7, at(x, 4.14, CZ, 0, 0.1), '--sea-iron', false);
      box(PW + 3.1, 0.18, 0.18, at(0, 3.88, CZ + 2.3), '--sea-iron');
      [-PW / 2 - 1.2, -PW / 4, PW / 4, PW / 2 + 1.2].forEach(function (cx) {
        kit.cyl(0.09, 0.11, 3.9, at(cx, 1.95, CZ + 2.25), '--sea-iron', 0.02, 10);
        kit.piece(new T.TorusGeometry(0.4, 0.05, 6, 16, Math.PI * 1.2), at(cx, 3.5, CZ + 2.05, 0, 0, 0.6), '--sea-iron', false);
      });
      kit.flat(new T.PlaneGeometry(PW + 2, 4.2), at(0, 0.01, CZ - 0.2, 0, -Math.PI / 2), '--sea-shade');

      // BENCHES under the canopy and along the railings, facing the sea.
      function bench(bx, bz, turn) {
        var g = at(bx, 0, bz, turn);
        [0.45, 0.5].forEach(function (y, i) { box(1.8, 0.06, 0.16, M(g, at(0, y, -0.12 + i * 0.2)), '--sea-cream', 0.01); });
        [0.75, 0.92].forEach(function (y) { box(1.8, 0.1, 0.05, M(g, at(0, y, 0.2)), '--sea-cream', 0.01); });
        [-0.8, 0.8].forEach(function (o) { box(0.07, 0.95, 0.5, M(g, at(o, 0.47, 0.02)), '--sea-iron', false); });
      }
      bench(-5.5, 1.6, Math.PI); bench(5.5, 1.6, Math.PI);
      bench(-12, RZ + 1.2, Math.PI); bench(12, RZ + 1.2, Math.PI);

      // THE ROOM'S OWN PAGE on an enamel board by the arch, and its words on
      // boards along the tiled wall, each the room's own lifted off the page.
      function board(bx, bz, turn, w, h) {
        var g = at(bx, 0, bz, turn);
        box(w + 0.2, h + 0.2, 0.08, M(g, at(0, 0.9 + h / 2, -0.06)), '--sea-iron');
        [-w / 2, w / 2].forEach(function (o) { box(0.1, 0.9 + h, 0.1, M(g, at(o, (0.9 + h) / 2, -0.1)), '--sea-iron', false); });
        return M(g, at(0, 0.9, 0));
      }
      var pw = 2.8, ph = pw * 800 / 1180;
      var pg = board(9.6, 2.2, -0.35, pw, ph);
      var page = kit.screen(1180, 800, pw, M(pg, at(0, ph / 2, 0)), 'The Seaside Convenience’s own page, on an enamel board by the arch');
      var lede = kit.lift(page, '.sea-lede', { w: 640, ww: 2.0, m: board(-9.6, 2.2, 0.35, 2.0, 1.4) });
      var has = kit.lift(page, '.sea-has', { w: 720, h: 640, ww: 2.4, m: board(-5.6, PZ + 0.5, 0, 2.4, 1.9) });
      var rules = kit.lift(page, '.sea-rules', { w: 680, h: 560, ww: 2.2, m: board(5.6, PZ + 0.5, 0, 2.2, 1.6) });

      return {
        start: { x: 0, z: 7.5, yaw: 0 },
        bounds: { x: [-13, 13], z: [RZ + 0.6, 9] },
        stops: [
          { name: 'on the promenade, the convenience in front of you and the sea past it', where: 'on the promenade', x: 0, z: 7.5, yaw: 0, pitch: 0.06 },
          { name: 'at the arch, under the sign that says Toilets', where: 'at the arch, under the enamel sign', x: AX, z: PZ + 2.6, yaw: 0, pitch: 0.14 },
          { name: 'at the enamel board by the arch, the room’s own page on it', where: 'at the room’s own page', x: 9.6 + Math.sin(-0.35) * 2.8, z: 2.2 + Math.cos(-0.35) * 2.8, yaw: -0.35, pitch: 0.04, page: kit.page, frame: page },
          { name: 'at the board on the left: on the front', where: 'at the board on the front', x: -9.6 + Math.sin(0.35) * 2.4, z: 2.2 + Math.cos(0.35) * 2.4, yaw: 0.35, pitch: 0.06, frame: lede.el },
          { name: 'at the tiled wall: what it has', where: 'at the board on what it has', x: -5.6, z: PZ + 3.4, yaw: 0, pitch: 0.08, frame: has.el },
          { name: 'at the tiled wall: what is not on the front', where: 'at the board on what is not here', x: 5.6, z: PZ + 3.2, yaw: 0, pitch: 0.08, frame: rules.el },
          { name: 'at the railings, looking out to sea', where: 'at the railings, the sea in front of you', x: 0, z: RZ + 2.8, yaw: 0, pitch: -0.02 }
        ]
      };
    }
  };
})();

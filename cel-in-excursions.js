/* =============================================================================
   Excursions, walked into on Cel Street. Ryan's ask, 2026-11-05: every new
   room onto both streets.

   A VISITOR CENTRE'S LOBBY AFTER THE DOORS ARE LOCKED (§141). The overhead
   lights are off. THE ONE LIGHT LEFT ON IS THE MAP OF THE AREA ON THE FAR
   WALL, a lightbox printed with lakes, woods and orange routes and no word
   anywhere on it, glowing in the dark. Beside it, to the right, stands a wire
   rack of brochures, and every brochure is lit along the edge turned to the
   map and throws its shadow away from it, so the light in this room always
   comes from the left and from a picture of somewhere else. The map's light
   lies across the terrazzo towards you. Behind you the glass doors are shut on
   the night; on the right is the desk with the yellow i, unattended.

   THE BROCHURES ARE ALL ONE PAPER AND ONE CUT, and none wears its excursion's
   colours: the Map's rule, which §141 keeps on the page. The newest is in the
   top pocket, and it is the way into Retail Therapy, Norah Hobbs's, which is
   its own world behind this one.

   THE FEED IS THE ONE TO WATCH: also a board lit from inside in a dark hall,
   but its light comes through a mask and only letters are lit. Here the whole
   map glows in printed colour, carries no word, and its light lands on paper
   beside it. NOTHING MOVES AT ANY SETTING. Two presses: take the newest
   brochure out of the top pocket and open it on the desk, and pick up the one
   that fell out of the rack onto the floor. Every colour is one §141 declares,
   by name. It keeps nothing, sends nothing and fetches nothing; its page
   arrives through Cel Street's screen().
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['excursions.html'] = {
    name: 'Excursions',
    faces: ['"Josefin Sans"'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var W = 13, BACK = -9.5, FRONT = 1.6, H = 4.4;
      var L = -W / 2, R = W / 2;
      function hash(n) { var h = Math.sin(n * 12.9898) * 43758.5453; return h - Math.floor(h); }

      // THE MAP, a lightbox on the far wall, left of centre.
      var MX = -2.7, MY = 2.15, MW = 5.0, MH = 2.9, MZ = BACK + 0.12;

      // THE ONE LIGHT: out of the map's face, so everything in the lobby is lit
      // on the side turned to it and shadowed on the other. A breath of the
      // dark itself everywhere else, so the walls are there at all.
      kit.scene.background = kit.col('--exc-lobby');
      kit.scene.add(new T.AmbientLight(kit.col('--exc-ink-2'), 0.14));
      var glow = new T.PointLight(kit.col('--exc-glow'), 7, 17, 1.25);
      glow.position.set(MX, MY, MZ + 0.8);
      glow.castShadow = true;
      glow.shadow.mapSize.set(1024, 1024);
      glow.shadow.camera.near = 0.2; glow.shadow.camera.far = 18;
      kit.scene.add(glow);
      var wash = new T.PointLight(kit.col('--exc-glow'), 2.2, 9, 1.4);
      wash.position.set(MX + MW / 2 - 0.3, 1.0, MZ + 0.5);
      kit.scene.add(wash);

      // The lobby: terrazzo underfoot, walls and ceiling in the dark.
      box(W, 0.2, FRONT - BACK, at(0, -0.1, (FRONT + BACK) / 2), '--exc-floor', false, false);
      box(W, 0.2, FRONT - BACK, at(0, H + 0.1, (FRONT + BACK) / 2), '--exc-lobby', false, false);
      [-1, 1].forEach(function (s) { box(0.3, H, FRONT - BACK, at(s * (W / 2 + 0.15), H / 2, (FRONT + BACK) / 2), '--exc-lobby', false, false); });
      box(W, H, 0.3, at(0, H / 2, BACK - 0.15), '--exc-lobby', false, false);
      // The terrazzo itself: chips of stone set in the floor, in the lobby's
      // own few colours, and the brass-coloured strips between the pours.
      var terr = kit.paper(1024, 1024, function (c, w, h) {
        c.fillStyle = kit.ink('--exc-floor'); c.fillRect(0, 0, w, h);
        var inks = ['--exc-wire', '--exc-ink-2', '--exc-lobby', '--exc-print-2'];
        for (var i = 0; i < 2600; i++) {
          c.fillStyle = kit.ink(inks[i % inks.length]);
          var x = hash(i * 1.7) * w, y = hash(i * 3.1 + 5) * h, r = 1.5 + hash(i * 7.3) * 4.5;
          c.beginPath(); c.ellipse(x, y, r, r * (0.55 + hash(i) * 0.45), hash(i * 2.2) * 3, 0, Math.PI * 2); c.fill();
        }
        c.fillStyle = kit.ink('--exc-wire');
        c.globalAlpha = 0.5; c.fillRect(0, 0, w, 3); c.fillRect(0, 0, 3, h); c.globalAlpha = 1;
      });
      for (var tx = L; tx < R; tx += 3.25) for (var tz = BACK; tz < FRONT; tz += 3.25) {
        kit.sheet(terr, 3.25, Math.min(3.25, FRONT - tz), at(tx + 1.625, 0.004, tz + Math.min(3.25, FRONT - tz) / 2, 0, -Math.PI / 2));
      }
      // The map's light lying across the floor towards you and to the right,
      // as the lightbox throws it: wide where it lands, faint.
      var pool = new T.BufferGeometry();
      pool.setAttribute('position', new T.Float32BufferAttribute([
        MX - MW / 2, 0, 0, MX + MW / 2, 0, 0, MX + MW / 2 + 5.4, 0, 8.6,
        MX - MW / 2, 0, 0, MX + MW / 2 + 5.4, 0, 8.6, MX - MW / 2 + 0.4, 0, 8.6], 3));
      var lit = kit.flat(pool, at(0, 0.012, BACK + 0.25), '--exc-glow');
      lit.material.transparent = true; lit.material.opacity = 0.1; lit.material.depthWrite = false;

      // THE MAP. Printed in the lightbox's own inks and nothing else: lakes,
      // woods dotted with trees, a river, the orange routes and a dotted spur
      // off them, and a dot where you are. No word, no key, no legend.
      var mapTex = kit.paper(1200, 700, function (c, w, h) {
        c.fillStyle = kit.ink('--exc-glow'); c.fillRect(0, 0, w, h);
        c.fillStyle = kit.ink('--exc-park');
        c.beginPath(); c.moveTo(0, 360);
        c.bezierCurveTo(130, 300, 220, 420, 360, 360); c.bezierCurveTo(480, 310, 560, 280, 640, 320);
        c.lineTo(660, h); c.lineTo(0, h); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(860, h); c.bezierCurveTo(870, 560, 980, 520, w, 500); c.lineTo(w, h); c.closePath(); c.fill();
        c.beginPath(); c.ellipse(940, 160, 150, 90, 0.3, 0, Math.PI * 2); c.fill();
        // Trees in the woods, a little darker for being many.
        c.fillStyle = kit.ink('--exc-glow');
        for (var i = 0; i < 160; i++) {
          var x = hash(i * 4.1) * 640, y = 380 + hash(i * 9.7) * 300;
          if (y < 340 + Math.sin(x / 80) * 40) continue;
          c.globalAlpha = 0.35; c.beginPath(); c.arc(x, y, 5, 0, Math.PI * 2); c.fill();
        }
        c.globalAlpha = 1;
        c.fillStyle = kit.ink('--exc-water');
        c.beginPath(); c.ellipse(700, 210, 130, 70, -0.15, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.ellipse(280, 180, 80, 42, 0.2, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.ellipse(1080, 420, 46, 30, 0, 0, Math.PI * 2); c.fill();
        c.strokeStyle = kit.ink('--exc-water'); c.lineWidth = 14; c.lineCap = 'round';
        c.beginPath(); c.moveTo(700, 270); c.bezierCurveTo(760, 380, 840, 420, 860, h); c.stroke();
        c.lineWidth = 7;
        c.beginPath(); c.moveTo(280, 220); c.bezierCurveTo(300, 280, 420, 260, 470, 330); c.stroke();
        // The routes.
        c.strokeStyle = kit.ink('--exc-route'); c.lineWidth = 16;
        c.beginPath(); c.moveTo(60, 600); c.bezierCurveTo(200, 560, 280, 330, 450, 300);
        c.bezierCurveTo(600, 280, 620, 440, 900, 420); c.bezierCurveTo(1000, 410, 1080, 330, 1160, 320); c.stroke();
        c.lineWidth = 10;
        c.beginPath(); c.moveTo(450, 300); c.bezierCurveTo(470, 200, 540, 120, 620, 90); c.stroke();
        c.setLineDash([4, 26]); c.lineWidth = 11;
        c.beginPath(); c.moveTo(900, 420); c.bezierCurveTo(930, 330, 960, 260, 950, 170); c.stroke();
        c.beginPath(); c.moveTo(200, 540); c.bezierCurveTo(140, 460, 160, 300, 260, 230); c.stroke();
        c.setLineDash([]);
        // Where you are: a dark ring round the "i"'s yellow.
        c.fillStyle = kit.ink('--exc-lobby'); c.beginPath(); c.arc(450, 300, 24, 0, Math.PI * 2); c.fill();
        c.fillStyle = kit.ink('--exc-sign'); c.beginPath(); c.arc(450, 300, 11, 0, Math.PI * 2); c.fill();
      });
      box(MW + 0.3, MH + 0.3, 0.22, at(MX, MY, MZ - 0.05), '--exc-wire', 0.02);
      var face = new T.Mesh(new T.PlaneGeometry(MW, MH), new T.MeshBasicMaterial({ map: mapTex }));
      face.matrixAutoUpdate = false; face.matrix.copy(at(MX, MY, MZ + 0.065)); face.matrixWorldNeedsUpdate = true;
      kit.scene.add(face);

      // THE RACK, a wire rack standing on the floor right of the map: two
      // uprights, a grid of wire at the back, and three tiers of pockets, each
      // a wire lip along the front.
      var RX = 2.2, RW = 2.4, RZ = BACK + 0.55, TIERS = [1.95, 1.3, 0.65];
      [-1, 1].forEach(function (s) {
        cyl(0.025, 0.025, 2.5, at(RX + s * RW / 2, 1.25, RZ), '--exc-wire', 0.008, 8);
        box(0.06, 0.03, 0.5, at(RX + s * RW / 2, 0.015, RZ + 0.05), '--exc-wire', 0.008);
      });
      for (var gx = -RW / 2; gx <= RW / 2 + 0.01; gx += RW / 8) cyl(0.008, 0.008, 2.3, at(RX + gx, 1.3, RZ - 0.08), '--exc-wire', false, 6);
      [0.3, 0.95, 1.6, 2.25].forEach(function (y) { cyl(0.01, 0.01, RW, at(RX, y, RZ - 0.08, 0, 0, Math.PI / 2), '--exc-wire', false, 6); });
      TIERS.forEach(function (y) {
        box(RW, 0.02, 0.24, at(RX, y - 0.34, RZ + 0.03), '--exc-wire', 0.006);
        cyl(0.012, 0.012, RW, at(RX, y - 0.2, RZ + 0.15, 0, 0, Math.PI / 2), '--exc-wire', 0.005, 6);
      });

      // A BROCHURE: one paper and one cut, lit along the edge turned to the
      // map, printed in lines that say no word. The one in the top pocket at
      // the left is the newest, and its cover says whose night it was.
      var cover = kit.paper(500, 660, function (c, w, h) {
        c.fillStyle = kit.ink('--exc-paper'); c.fillRect(0, 0, w, h);
        c.fillStyle = kit.ink('--exc-glow'); c.fillRect(0, 0, 26, h);
        c.fillStyle = kit.ink('--exc-print-2');
        c.font = '600 30px "Josefin Sans"'; c.fillText('INFODUMPLINGS', 60, 90);
        c.fillStyle = kit.ink('--exc-print');
        c.font = '600 86px "Josefin Sans"'; c.fillText('Retail', 56, 200); c.fillText('Therapy', 56, 286);
        c.fillStyle = kit.ink('--exc-print-2');
        for (var k = 0; k < 6; k++) c.fillRect(60, 360 + k * 40, 330 - (k % 3) * 60, 10);
        c.strokeStyle = kit.ink('--exc-route'); c.lineWidth = 10; c.lineCap = 'round';
        c.beginPath(); c.moveTo(60, 620); c.bezierCurveTo(160, 590, 260, 640, 440, 600); c.stroke();
      });
      var plain = kit.paper(500, 660, function (c, w, h) {
        c.fillStyle = kit.ink('--exc-paper'); c.fillRect(0, 0, w, h);
        c.fillStyle = kit.ink('--exc-glow'); c.fillRect(0, 0, 26, h);
        c.fillStyle = kit.ink('--exc-print-2');
        c.fillRect(60, 70, 280, 22); c.fillRect(60, 110, 200, 22);
        for (var k = 0; k < 9; k++) c.fillRect(60, 200 + k * 40, 360 - (k % 4) * 50, 10);
        c.strokeStyle = kit.ink('--exc-route'); c.lineWidth = 10; c.lineCap = 'round';
        c.beginPath(); c.moveTo(60, 610); c.bezierCurveTo(200, 570, 300, 640, 440, 590); c.stroke();
      });
      var BW = 0.5, BH = 0.66;
      // The paper, a sheet over a thin card so it has an edge, leaning back
      // in its pocket.
      function brochure(m, map) {
        box(BW, BH, 0.02, m, '--exc-paper', 0.006);
        kit.sheet(map, BW, BH, M(m, at(0, 0, 0.012)));
      }
      var slots = [];
      TIERS.forEach(function (y, ti) {
        for (var b = 0; b < 3; b++) {
          var x = RX - RW / 2 + 0.42 + b * 0.78;
          slots.push({ ti: ti, b: b, m: at(x, y, RZ + 0.03, 0, -0.14) });
        }
      });
      // The newest in the top pocket at the left; a gap at the bottom right,
      // where the one on the floor fell out of.
      slots.forEach(function (s, i) {
        if (i === 0 || (s.ti === 2 && s.b === 2)) return;
        brochure(s.m, plain);
      });
      // The newest, in the top pocket at the left, drawn as a thing a press
      // can take out to the desk and put back.
      var inPocket = [];
      var newest = slots[0];
      inPocket.push(kit.facets(new T.BoxGeometry(BW, BH, 0.02), newest.m, '--exc-paper'));
      var ncov = new T.Mesh(new T.PlaneGeometry(BW, BH), new T.MeshToonMaterial({ map: cover, gradientMap: plain.userData.mat.gradientMap }));
      ncov.matrixAutoUpdate = false; ncov.matrix.copy(M(newest.m, at(0, 0, 0.012))); ncov.matrixWorldNeedsUpdate = true; ncov.castShadow = true;
      kit.scene.add(ncov); inPocket.push(ncov);

      // THE ONE ON THE FLOOR: fallen out of the bottom pocket, lying open on
      // the terrazzo in the map's light.
      var fallen = [], putBack = [];
      var FM = at(RX + 0.55, 0.012, RZ + 1.0, 0.6, -Math.PI / 2);
      fallen.push(kit.facets(new T.BoxGeometry(BW, BH, 0.01), M(FM, at(-BW / 2, 0, 0, 0, 0.18)), '--exc-paper'));
      fallen.push(kit.facets(new T.BoxGeometry(BW, BH, 0.01), M(FM, at(BW / 2 - 0.02, 0, 0.03, 0, -0.22)), '--exc-paper'));
      var fs = new T.Mesh(new T.PlaneGeometry(BW, BH), plain.userData.mat);
      fs.matrixAutoUpdate = false; fs.matrix.copy(M(FM, at(BW / 2 - 0.02, 0, 0.045, 0, -0.22))); fs.matrixWorldNeedsUpdate = true;
      kit.scene.add(fs); fallen.push(fs);
      var gap = slots[8];
      putBack.push(kit.facets(new T.BoxGeometry(BW, BH, 0.02), gap.m, '--exc-paper'));
      var gs = new T.Mesh(new T.PlaneGeometry(BW, BH), plain.userData.mat);
      gs.matrixAutoUpdate = false; gs.matrix.copy(M(gap.m, at(0, 0, 0.012))); gs.matrixWorldNeedsUpdate = true; gs.castShadow = true;
      kit.scene.add(gs); putBack.push(gs);
      putBack.forEach(function (m) { kit.hide(m, true); });
      var pickUp = kit.press({
        say: function () { return kit.hidden(fallen[0]) ? 'Let it lie where it fell' : 'Pick up the brochure on the floor'; },
        at: [kit.touch(1.2, 0.3, 1.0, FM)],
        press: function () {
          var up = !kit.hidden(fallen[0]);
          fallen.forEach(function (m) { kit.hide(m, up); });
          putBack.forEach(function (m) { kit.hide(m, !up); });
          return up ? 'You pick the brochure up off the floor, fold it shut and slide it back into the empty pocket at the bottom of the rack.'
                    : 'You take it out again and leave it lying open on the terrazzo, where it fell.';
        } });

      // THE DESK, unattended, with the yellow i over it on a pole: where you
      // would have asked, if anybody were here. Taking the newest brochure
      // opens it here, three panels, in the map's light.
      var DX = 4.6, DZ = -3.6;
      box(1.0, 1.05, 2.6, at(DX, 0.525, DZ), '--exc-floor', 0.02);
      box(1.2, 0.06, 2.8, at(DX, 1.08, DZ), '--exc-wire', 0.012);
      cyl(0.03, 0.03, 1.2, at(DX + 0.2, 1.7, DZ - 0.9), '--exc-wire', 0.008, 8);
      var iSign = kit.paper(256, 256, function (c, w, h) {
        c.fillStyle = kit.ink('--exc-sign'); c.fillRect(0, 0, w, h);
        c.fillStyle = kit.ink('--exc-lobby');
        c.font = '600 220px "Josefin Sans"'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText('i', w / 2, h / 2 + 18);
      });
      // Turned half towards the doors and half towards you at the desk, a
      // face each way.
      var SG = at(DX + 0.2, 2.55, DZ - 0.9, -Math.PI / 4);
      box(0.62, 0.62, 0.06, SG, '--exc-sign', 0.012);
      kit.sheet(iSign, 0.56, 0.56, M(SG, at(0, 0, 0.032)));
      kit.sheet(iSign, 0.56, 0.56, M(SG, at(0, 0, -0.032, Math.PI)));
      var open = [];
      var OM = at(DX - 0.05, 1.12, DZ + 0.3, LEFT, -Math.PI / 2 + 0.05);
      [-1, 0, 1].forEach(function (k) {
        var pm = M(OM, at(k * (BW - 0.01), 0, k === 0 ? 0 : 0.04, 0, k * -0.24));
        open.push(kit.facets(new T.BoxGeometry(BW, BH, 0.008), pm, '--exc-paper'));
        var sm = new T.Mesh(new T.PlaneGeometry(BW, BH), k === 0 ? ncov.material : plain.userData.mat);
        sm.matrixAutoUpdate = false; sm.matrix.copy(M(pm, at(0, 0, 0.006))); sm.matrixWorldNeedsUpdate = true;
        kit.scene.add(sm); open.push(sm);
      });
      open.forEach(function (m) { kit.hide(m, true); });
      var take = kit.press({
        say: function () { return kit.hidden(open[0]) ? 'Take the newest brochure to the desk' : 'Put the brochure back in the top pocket'; },
        at: [kit.touch(0.7, 0.8, 0.4, newest.m), kit.touch(0.9, 0.3, 1.8, at(DX, 1.2, DZ + 0.3))],
        press: function () {
          var out = kit.hidden(open[0]);
          open.forEach(function (m) { kit.hide(m, !out); });
          inPocket.forEach(function (m) { kit.hide(m, out); });
          return out ? 'You take the newest brochure out of the top pocket and open it on the desk, three panels in the map’s light: Retail Therapy, on the night of Infodumplings.'
                     : 'You fold it shut and put it back in the top pocket, the newest one, where it was.';
        } });

      // THE DOORS behind you, glass in steel, locked on the night.
      [-1.3, 0, 1.3].forEach(function (x) {
        box(1.24, 2.5, 0.06, at(x, 1.25, FRONT - 0.04), '--exc-wire', 0.012, false);
        box(1.08, 2.34, 0.08, at(x, 1.25, FRONT - 0.04), '--exc-lobby', false, false);
      });
      box(4.0, H - 2.5, 0.3, at(0, (H + 2.5) / 2, FRONT + 0.15), '--exc-lobby', false, false);
      [-1, 1].forEach(function (s) { box(W / 2 - 2.0, H, 0.3, at(s * (W / 4 + 1.0), H / 2, FRONT + 0.15), '--exc-lobby', false, false); });

      // THE ROOM'S OWN PAGE, on the left wall in a frame of the rack's wire.
      var pw = 3.0, ph = pw * 800 / 1180;
      var frame = kit.screen(1180, 800, pw, at(L + 0.05, 1.75, -3.6, LEFT), 'Excursions’ own page, on the wall of the lobby');
      box(0.04, ph + 0.2, pw + 0.2, at(L + 0.01, 1.75, -3.6), '--exc-wire', false, false);

      var stops = [
        { name: 'inside the locked doors, the map glowing on the far wall and the rack of brochures beside it', where: 'inside the locked doors', x: 0.2, z: 0.6, yaw: 0, pitch: 0.12 },
        { name: 'before the map, its lakes and woods and orange routes lit from behind, and a dot where you are', where: 'before the map', x: MX, z: BACK + 4.2, yaw: 0, pitch: 0.3 },
        { name: 'at the rack, every brochure lit along the edge turned to the map, one fallen onto the floor', where: 'at the rack', x: RX + 0.2, z: BACK + 3.4, yaw: 0.05, pitch: -0.12, acts: [pickUp] },
        { name: 'Retail Therapy', where: 'at the top pocket of the rack, the newest brochure: Retail Therapy, Norah Hobbs’s', room: 'Retail Therapy', page: 'retail-therapy.html', x: RX - 0.6, z: BACK + 2.4, yaw: 0, pitch: 0.12, acts: [take] },
        { name: 'at the desk with the yellow i, nobody behind it tonight', where: 'at the desk with the yellow i', x: DX - 2.9, z: DZ + 0.6, yaw: RIGHT + 0.12, pitch: -0.16, acts: [take] },
        { name: 'at the left wall, with the room’s own page', where: 'at the room’s own page', x: L + 2.8, z: -3.6, yaw: LEFT, pitch: 0.02, page: kit.page, frame: frame }
      ];

      return {
        start: { x: 0.2, z: 0.6, yaw: 0 },
        bounds: { x: [L + 1.0, R - 1.0], z: [BACK + 1.6, FRONT - 0.6], areas: [
          { x: [L + 1.0, DX - 1.0], z: [BACK + 1.6, FRONT - 0.6] },
          { x: [DX - 1.0, R - 1.0], z: [DZ + 1.6, FRONT - 0.6] },
          { x: [DX - 1.0, R - 1.0], z: [BACK + 1.6, DZ - 1.6] }
        ] },
        stops: stops
      };
    }
  };
})();

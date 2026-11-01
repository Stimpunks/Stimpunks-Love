/* =============================================================================
   The Broadsheet Broadside, walked into on Cel Street. Ryan's ask, 2026-10-31:
   back on the street, working down it a room at a time.

   IT IS THE BROADSIDE'S WORLD AND NOBODY ELSE'S (§60): the side of a ship in
   the Nelson chequer, seen from a boat at the waterline. A tarred hull, two
   bands of yellow along the gun decks broken by the black squares of the
   ports, the lower deck's ports shut and the upper deck's open, every lid
   swung up to show its red inside, and IN EVERY OPEN PORT A SHEET OF PAPER
   WHERE A GUN WOULD BE. NO GUN IS DRAWN ANYWHERE, and nothing is fired: one
   sheet is in the air on a dotted line, crossing in front of the bow of your
   boat, because a shot across the bow is the one that is meant to miss.

   THE LIGHT IS THE SEA'S: the sun is above and out of the picture, and what
   reaches the hull is the glare thrown back up off the water, so the only lit
   marks on the black side are short broken dashes low by the waterline, drawn
   and still. The bands and the lids are flat colour.

   THE SHEETS ARE THE PAGE'S OWN, lifted off it by the kit, each side of each
   sheet into a port of its own: ink on white with its two spot inks, its
   credits and its licence on the paper. The ship's name is lettered along her side
   in Bodoni Moda, which names the ship and never a sheet. The page's own words
   stand on boards in the boat, on the hull's own ground.

   NOTHING MOVES AT ANY SETTING: the sea is still, the sheet in the air stays
   in the air. Every colour is one the room declares, by name. It keeps
   nothing, sends nothing and fetches nothing; its page arrives through Cel
   Street's screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 31, 374761393) ^ Math.imul(j + 17, 668265263) ^ Math.imul(k + 7, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['broadsheet-broadside.html'] = {
    name: 'The Broadsheet Broadside',
    faces: ['Bodoni Moda'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var HULL = -3.2;                  // the ship's side, facing you
      var SEA = -0.4;                   // the waterline
      var LONG = 64;                    // how long the side runs
      var LOW = [0.6, 3.0], UP = [4.0, 5.4];       // the two yellow bands
      var TOP = 7.0;                    // the rail along the top of the side

      // THE SKY AND THE SEA, and the light thrown back up off the water: a
      // hazy sky, and a low light from in front of the hull and below it.
      kit.scene.background = kit.col('--bb-haze');
      kit.scene.fog = new T.Fog(kit.col('--bb-haze'), 40, 160);
      kit.scene.add(new T.HemisphereLight(kit.col('--bb-haze'), kit.col('--bb-sea'), 2.3));
      var glare = new T.DirectionalLight(kit.col('--bb-glint'), 1.4);
      glare.position.set(6, -8, 30);
      glare.target.position.set(0, 2, HULL);
      kit.scene.add(glare, glare.target);

      kit.flat(new T.PlaneGeometry(400, 400), at(0, SEA, -40, 0, -Math.PI / 2), '--bb-sea');

      // THE SIDE OF THE SHIP: the tarred hull from the water to the rail, the
      // two yellow bands, and the ports along them.
      box(LONG, TOP - SEA + 0.6, 6, at(0, (TOP + SEA - 0.6) / 2, HULL - 3), '--bb-hull');
      box(LONG, 0.16, 0.2, at(0, TOP + 0.08, HULL + 0.05), '--bb-hull', 0.015);
      [LOW, UP].forEach(function (b) {
        box(LONG, b[1] - b[0], 0.04, at(0, (b[0] + b[1]) / 2, HULL + 0.02), '--bb-ochre', false, false);
      });
      // The open ports on the lower deck, a sheet in each at the height of
      // your eyes, and the shut ones either side of them and all along the
      // upper deck.
      var OPEN = [-4.65, -1.55, 1.55, 4.65], PW = 1.9;
      for (var x = -30; x <= 30; x += 3.1) {
        box(PW, UP[1] - UP[0] - 0.3, 0.06, at(x + 1.55, (UP[0] + UP[1]) / 2, HULL + 0.05), '--bb-hull', false, false);
      }
      for (x = -29.45; x <= 30; x += 3.1) {
        var open = OPEN.some(function (o) { return Math.abs(o - x) < 0.01; });
        var ph = LOW[1] - LOW[0] - 0.3, py = (LOW[0] + LOW[1]) / 2;
        if (!open) { box(PW, ph, 0.06, at(x, py, HULL + 0.05), '--bb-hull', false, false); continue; }
        // The open port: a dark way into the deck, and its lid swung up above
        // it on its hinge, showing the red inside.
        box(PW, ph, 0.5, at(x, py, HULL - 0.2), '--bb-hull', false, false);
        var lid = new T.Matrix4().multiplyMatrices(at(x, py + ph / 2, HULL + 0.04), at(0, 0, 0, 0, -0.7));
        box(PW + 0.08, 0.06, ph + 0.04, new T.Matrix4().multiplyMatrices(lid, at(0, 0, ph / 2 + 0.02)), '--bb-lid', 0.012);
      }

      // THE GLARE OFF THE WATER: short broken dashes low on the hull, by the
      // waterline, and a few lying on the water itself. Drawn, and still.
      for (var d = 0; d < 140; d++) {
        var dx = (hash(d, 1, 1) - 0.5) * LONG, dy = SEA + 0.08 + Math.pow(hash(d, 1, 2), 1.8) * 0.9;
        var dl = 0.18 + hash(d, 1, 3) * 0.5;
        kit.flat(new T.PlaneGeometry(dl, 0.035), at(dx, dy, HULL + 0.07), '--bb-glint');
      }
      for (d = 0; d < 90; d++) {
        var wx = (hash(d, 2, 1) - 0.5) * 40, wz = HULL + 0.6 + hash(d, 2, 2) * 18;
        kit.flat(new T.PlaneGeometry(0.2 + hash(d, 2, 3) * 0.6, 0.04), at(wx, SEA + 0.01, wz, 0, -Math.PI / 2), '--bb-glint');
      }

      // THE SHIP'S NAME along her side, to the right, in Bodoni Moda and the yellow
      // of the chequer, on the black between the bands, and nowhere on a sheet.
      var name = kit.paper(1400, 160, function (c, w, h) {
        c.fillStyle = kit.ink('--bb-hull'); c.fillRect(0, 0, w, h);
        c.fillStyle = kit.ink('--bb-ochre'); c.font = '700 104px "Bodoni Moda"';
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText('The Broadsheet Broadside', w / 2, h / 2 + 6);
      });
      var nx = 8.2, ny = (LOW[1] + UP[0]) / 2, nw = 5.6;
      kit.sheet(name, nw, nw * 160 / 1400, at(nx, ny, HULL + 0.06));

      // THE BOAT you are standing in, alongside, low on the water: its bottom
      // boards, its gunwales and its thwarts, and its bow off to the left.
      var BZ0 = HULL + 1.6, BZ1 = 3.6, BX = 11;
      box(BX * 2, 0.12, BZ1 - BZ0, at(0, -0.06, (BZ0 + BZ1) / 2), '--bb-dim', false, false);
      [BZ0, BZ1].forEach(function (z) { box(BX * 2, 0.34, 0.1, at(0, 0.1, z), '--bb-bone', 0.012); });
      [-BX, BX].forEach(function (x2) { box(0.1, 0.34, BZ1 - BZ0, at(x2, 0.1, (BZ0 + BZ1) / 2), '--bb-bone', 0.012); });
      for (var t = -9; t <= 9; t += 4.5) box(0.3, 0.06, BZ1 - BZ0 - 0.2, at(t, 0.22, (BZ0 + BZ1) / 2), '--bb-bone', 0.01);
      box(1.6, 0.34, 0.1, at(-BX - 0.7, 0.1, BZ0 + 0.6, 0.7), '--bb-bone', 0.012);
      box(1.6, 0.34, 0.1, at(-BX - 0.7, 0.1, BZ1 - 0.6, -0.7), '--bb-bone', 0.012);

      // THE SHEET IN THE AIR, crossing in front of the bow on a dotted line out
      // of the nearest open port: the shot that is meant to miss.
      var from = new T.Vector3(OPEN[0] - PW / 2, LOW[0] + 1.6, HULL + 0.3), to = new T.Vector3(-BX - 1.8, 2.6, BZ0 + 1.8);
      for (var k = 1; k < 14; k++) {
        var p = from.clone().lerp(to, k / 14); p.y += Math.sin(Math.PI * k / 14) * 1.4;
        kit.flat(new T.SphereGeometry(0.035, 6, 4), at(p.x, p.y, p.z), '--bb-ochre');
      }
      kit.flat(new T.PlaneGeometry(0.42, 0.56), at(to.x, to.y, to.z, 0.5, -0.2, 0.25), '--bb-paper');

      // THE SHEETS, the page's own: each side of each sheet in a port of its
      // own, hanging out of it where a gun would be, side A then side B.
      var SHEETS = [
        { n: 0, drop: '.bb-issue, .bb-sheet--b', x: OPEN[0], words: 'No. 1, An introduction to Stimpunks.World: side A, to pin up' },
        { n: 0, drop: '.bb-issue, .bb-sheet--a', x: OPEN[1], words: 'No. 1, An introduction to Stimpunks.World: side B, to hand over' },
        { n: 1, drop: '.bb-issue, .bb-sheet--b', x: OPEN[2], words: 'No. 2, Ribald Songing, the manifesto: side A, to pin up' },
        { n: 1, drop: '.bb-issue, .bb-sheet--a', x: OPEN[3], words: 'No. 2, Ribald Songing, the manifesto: side B, to hand over' }
      ];
      var SW = 1.65;

      // THE ROOM'S OWN PAGE, on a board standing in the stern of the boat.
      var pw = 2.4, phh = pw * 800 / 1180, pby = 0.4 + phh / 2, pbx = 8.6, pbz = BZ1 - 0.5;
      [-1, 1].forEach(function (s) { box(0.08, pby + phh / 2, 0.08, at(pbx + s * (pw / 2 + 0.1), (pby + phh / 2) / 2, pbz + 0.05), '--bb-hull', 0.01); });
      box(pw + 0.16, phh + 0.16, 0.05, at(pbx, pby, pbz + 0.06, Math.PI), '--bb-hull', 0.012);
      var frame = kit.screen(1180, 800, pw, at(pbx, pby, pbz, Math.PI), 'The Broadsheet Broadside’s own page, on a board in the stern of the boat');

      var lifted = SHEETS.map(function (s) {
        return kit.lift(frame, '.bb-set', { n: s.n, drop: s.drop, bare: true, w: 780, h: 1120, ww: SW, m: at(s.x, LOW[0] + 0.17, HULL + 0.1) });
      });

      // THE PAGE'S OWN WORDS on boards leaning on the far gunwale of the boat,
      // read with your back to the ship: what a broadside is, the ship's
      // articles, the suggestions it takes, and whose this all is.
      function board(sel, n, x, w) {
        box(w + 0.12, 0.06, 0.06, at(x, 0.42, BZ1 - 0.35), '--bb-bone', 0.01);
        return kit.lift(frame, sel, { n: n, w: 760, h: 760, ww: w, m: at(x, 0.45, BZ1 - 0.35, Math.PI, -0.35) });
      }
      var lede = board('.bb-lede', 0, -8.4, 1.6);
      var articles = board('.bb-part', 0, -6.4, 1.6);
      var whose = board('.bb-part', 1, 4.6, 1.6);
      var note = board('.bb-note', 0, -10.2, 1.2);

      var stops = [
        { name: 'in the boat at the waterline, under the side of the ship', x: 0, z: BZ1 - 0.6, yaw: 0, pitch: 0.12 }
      ];
      SHEETS.forEach(function (s, i) {
        stops.push({ name: 'at the open port with ' + s.words, x: s.x, z: BZ0 + 0.9, yaw: 0, pitch: 0.1, frame: lifted[i].el });
      });
      stops.push(
        { name: 'at the ship’s name along her side, in Bodoni and the yellow of the chequer', x: nx, z: BZ0 + 1.6, yaw: 0, pitch: 0.2 },
        { name: 'in the bow, with the sheet in the air crossing in front of you', x: -BX + 1.6, z: BZ0 + 1.4, yaw: 1.3, pitch: 0.2 },
        { name: 'at the board on what a broadside is', x: -8.4, z: BZ1 - 1.8, yaw: Math.PI, pitch: -0.3, frame: lede.el },
        { name: 'at the board with the ship’s articles', x: -6.4, z: BZ1 - 1.8, yaw: Math.PI, pitch: -0.3, frame: articles.el },
        { name: 'at the board saying the press takes suggestions', x: -10.0, z: BZ1 - 1.8, yaw: Math.PI, pitch: -0.3, frame: note.el },
        { name: 'at the board on whose this all is', x: 4.6, z: BZ1 - 1.8, yaw: Math.PI, pitch: -0.3, frame: whose.el },
        { name: 'in the stern, with the press’s own page on its board', x: pbx, z: pbz - 2.6, yaw: Math.PI, pitch: 0, page: kit.page, frame: frame }
      );

      return {
        start: { x: 0, z: BZ1 - 0.6, yaw: 0 },
        bounds: { x: [-BX + 0.5, BX - 0.5], z: [BZ0 + 0.3, BZ1 - 0.3] },
        stops: stops
      };
    }
  };
})();

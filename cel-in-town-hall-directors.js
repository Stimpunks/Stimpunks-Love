/* =============================================================================
   The Directors' room, walked into on Cel Street, through its door off the
   Town Hall. Ryan's ask, 2026-11-01: the rooms behind the doors.

   IT IS THE ROOM'S OWN WORLD AND SHARES NOTHING WITH THE HALL IT OPENS OFF
   (§79). The hall is one hard disc of sun on stone under a hole in its dome;
   in here there is no lamp at all. The one light is the hall's, second hand,
   through the frosted pane in the shut door: the pane glows because the hall
   behind it is lit, and because the glass is frosted the light arrives with no
   edge anywhere and falls off softly across the floor. The round table and the
   chairs round it stand dark against it. The room's name is gilded on the
   hall's side of the glass, so from in here it reads backwards. Nobody is
   drawn.

   NO EDGE ON THE FLOOR, EVER: the door is shut, not ajar, and a hard wedge of
   light on this floor would make it Dead Tired Society with a round table. So
   nothing in here casts a shadow, and the light on the floor is a wash that
   fades to nothing, never a shape. NO RUNS ON THE GLASS either, which would be
   Hey, Good Cookin's steamed windows: frosted is even.

   THE WORDS ARE THE PAGE'S OWN, lifted off it and never retyped: who the
   directors are, as our About page lists them, and why frosted glass. The
   room's call and its radio stay on its page, which stands on the wall,
   because they talk to the CB.

   NOTHING MOVES AT ANY SETTING. Every colour is one §79 declares, by name. It
   keeps nothing, sends nothing and fetches nothing; its page arrives through
   Cel Street's screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['town-hall-directors.html'] = {
    name: 'The Directors’ room',
    from: 'town-hall.html',
    faces: ['"Abril Fatface"'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var W = 8, D = 9, H = 3, back = -D;
      var DX = 1.8, DW = 1.0, DH = 2.2;               // the door, in the front wall

      // NO LAMP: a dim even light everywhere, the colour of the hall's light
      // through the glass, from nowhere you could point at, so nothing in the
      // room has an edge of light or a shadow.
      kit.scene.background = kit.col('--dr-dark');
      kit.scene.add(new T.HemisphereLight(kit.col('--dr-milk'), kit.col('--dr-dark'), 2.6));

      // An unlit sheet: the glass and the light it lets fall, which glow of
      // themselves rather than being lit by anything.
      function glow(map, w, h, m) {
        var mesh = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: map, transparent: true, depthWrite: false }));
        mesh.matrixAutoUpdate = false;
        mesh.matrix.copy(m);
        mesh.matrixWorldNeedsUpdate = true;
        kit.scene.add(mesh);
      }

      // THE ROOM: dark walls, a floor, a ceiling, and the trim of the frame
      // colour where they meet.
      box(W, 0.06, D + 0.4, at(0, -0.03, -D / 2), '--dr-panel', false, false);
      box(0.3, H, D, at(-W / 2 - 0.15, H / 2, -D / 2), '--dr-dark');
      box(0.3, H, D, at(W / 2 + 0.15, H / 2, -D / 2), '--dr-dark');
      box(W + 0.6, H, 0.3, at(0, H / 2, back - 0.15), '--dr-dark');
      box(W + 0.6, 0.2, D + 0.6, at(0, H + 0.1, -D / 2), '--dr-dark', false, false);
      [[-W / 2 + 0.02, -D / 2, LEFT, D], [W / 2 - 0.02, -D / 2, RIGHT, D], [0, back + 0.02, 0, W]].forEach(function (w) {
        box(w[3], 0.12, 0.04, at(w[0], 0.06, w[1], w[2]), '--dr-frame', false);
      });

      // THE FRONT WALL, and in it the door you came in by from the hall, shut.
      var lw = DX - DW / 2 + W / 2, rw = W / 2 - (DX + DW / 2);
      box(lw, H, 0.3, at(-W / 2 + lw / 2, H / 2, 0.15), '--dr-dark');
      box(rw, H, 0.3, at(W / 2 - rw / 2, H / 2, 0.15), '--dr-dark');
      box(DW, H - DH, 0.3, at(DX, (H + DH) / 2, 0.15), '--dr-dark');
      box(W, 0.12, 0.04, at(0, 0.06, -0.02), '--dr-frame', false);
      // The frame round the door, and the leaf in it, shut.
      [-1, 1].forEach(function (s) { box(0.1, DH + 0.05, 0.36, at(DX + s * (DW / 2 + 0.05), (DH + 0.05) / 2, 0.12), '--dr-frame', 0.01); });
      box(DW + 0.3, 0.1, 0.36, at(DX, DH + 0.05, 0.12), '--dr-frame', 0.01);
      box(DW, DH, 0.06, at(DX, DH / 2, 0.06), '--dr-dark', false);
      // The frosted pane in its upper half, its rebate in the frame colour.
      var PW = 0.66, PH = 0.82, PY = 1.52;
      box(PW + 0.1, PH + 0.1, 0.03, at(DX, PY, 0.02), '--dr-frame', false, false);
      // The glass itself, lit from the hall: brightest in the middle and
      // going softly to its own edge, with no edge anywhere inside it, and the
      // gilt name across it, which from this side reads backwards.
      var pane = kit.paper(330, 410, function (c, w, h) {
        var g = c.createRadialGradient(w / 2, h * 0.46, 0, w / 2, h * 0.46, h * 0.62);
        g.addColorStop(0, kit.ink('--dr-pane'));
        g.addColorStop(1, kit.ink('--dr-milk'));
        c.fillStyle = g; c.fillRect(0, 0, w, h);
        c.save();
        c.translate(w, 0); c.scale(-1, 1);
        c.fillStyle = kit.ink('--dr-gilt');
        var size = 46;
        c.font = size + 'px "Abril Fatface"';
        while (c.measureText('DIRECTORS').width > w - 40 && size > 20) { size -= 2; c.font = size + 'px "Abril Fatface"'; }
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText('DIRECTORS', w / 2, h * 0.46);
        c.restore();
      });
      glow(pane, PW, PH, at(DX, PY, 0.0, Math.PI));
      // The handle, on the room's side.
      cyl(0.03, 0.03, 0.12, at(DX - DW / 2 + 0.14, 1.05, -0.04, 0, Math.PI / 2), '--dr-frame', false, 10);

      // THE HALL'S LIGHT ON THE FLOOR, falling off from the door with no edge:
      // a wash that fades to nothing, never a shape.
      var SW = 12, SD = 8.6;
      // The sheet is centred on the door, so the door is the middle of its
      // near edge (the canvas's foot, which lies towards the door).
      var spill = kit.paper(512, 320, function (c, w, h) {
        c.fillStyle = kit.ink('--dr-milk'); c.fillRect(0, 0, w, h);
        // Faded out to nothing at the far edge and both sides, so it has no
        // edge of its own where the sheet ends.
        var a = c.getImageData(0, 0, w, h);
        for (var y = 0; y < h; y++) {
          for (var x = 0; x < w; x++) {
            var dx = (x / w - 0.5) * 2, dy = (h - y) / h;
            var f = Math.max(0, 1 - Math.sqrt(dx * dx * 0.3 + dy * dy * 0.75));
            a.data[(y * w + x) * 4 + 3] = Math.round(175 * Math.pow(f, 1.3));
          }
        }
        c.putImageData(a, 0, 0);
      });
      glow(spill, SW, SD, at(DX, 0.004, -SD / 2, 0, -Math.PI / 2));

      // THE ROUND TABLE, and the chairs round it, all dark against the light.
      var TX = -0.4, TZ = -5.0, TR = 1.3;
      cyl(TR, TR, 0.06, at(TX, 0.74, TZ), '--dr-table', 0.012, 40);
      cyl(0.12, 0.12, 0.7, at(TX, 0.37, TZ), '--dr-table', false, 12);
      cyl(0.5, 0.56, 0.05, at(TX, 0.025, TZ), '--dr-table', 0.01, 24);
      for (var i = 0; i < 6; i++) {
        var a = i / 6 * Math.PI * 2 + 0.3, cr = TR + 0.42;
        var cx = TX + Math.sin(a) * cr, cz = TZ + Math.cos(a) * cr;
        var chair = at(cx, 0, cz, a);
        box(0.48, 0.06, 0.46, M(chair, at(0, 0.46, 0)), '--dr-table', 0.01);
        box(0.48, 0.54, 0.05, M(chair, at(0, 0.76, 0.21)), '--dr-table', 0.01);
        [[-0.2, -0.19], [0.2, -0.19], [-0.2, 0.19], [0.2, 0.19]].forEach(function (p) {
          box(0.04, 0.46, 0.04, M(chair, at(p[0], 0.23, p[1])), '--dr-table', false);
        });
      }

      // THE ROOM'S OWN PAGE on the right-hand wall, in a frame of the frame
      // colour, with its call and its radio on it.
      var pw = 2.4, ph = pw * 800 / 1180, py = 0.55 + ph / 2, pz = -3.0;
      box(0.05, ph + 0.12, pw + 0.12, at(W / 2 - 0.03, py, pz), '--dr-frame', 0.01);
      var frame = kit.screen(1180, 800, pw, at(W / 2 - 0.07, py, pz, RIGHT), 'The Directors’ room’s own page, on the wall to the right of the door');

      // THE PAGE'S OWN WORDS: who the directors are on the far wall, past the
      // table; why frosted glass on the left-hand wall; and the room's name
      // and its line on the front wall beside the door.
      var who = kit.lift(frame, '.dr-part', { n: 0, w: 760, ww: 2.3, m: at(0, 0.95, back + 0.04) });
      var why = kit.lift(frame, '.dr-part', { n: 2, w: 760, ww: 2.2, m: at(-W / 2 + 0.04, 0.95, -4.2, LEFT) });
      var head = kit.lift(frame, '.dr-head', { drop: '.dr-head__art', w: 760, ww: 1.9, m: at(-1.4, 1.2, -0.04, Math.PI) });
      var lede = kit.lift(frame, '.dr-lede', { w: 760, ww: 1.9, m: at(-1.4, 0.75, -0.04, Math.PI) });

      return {
        start: { x: DX, z: -1.0, yaw: 0 },
        bounds: { x: [-W / 2 + 0.8, W / 2 - 0.8], z: [back + 1.2, -0.7] },
        stops: [
          { name: 'just inside the door, the room dark, the table standing in the hall’s light', x: DX, z: -1.0, yaw: 0.3, pitch: -0.05 },
          { name: 'at the round table, the chairs round it dark against the light from the door', x: TX + 0.6, z: TZ + 2.6, yaw: 0.2, pitch: -0.3 },
          { name: 'at the far wall, past the table: the directors, as our About page lists them', x: 0, z: back + 2.6, yaw: 0, pitch: 0.05, frame: who.el },
          { name: 'at the left-hand wall: why frosted glass', x: -W / 2 + 2.3, z: -4.2, yaw: LEFT, pitch: 0.05, frame: why.el },
          { name: 'turned back to the door: the frosted pane, lit from the hall, the name on its glass backwards', x: DX, z: -3.0, yaw: Math.PI, pitch: 0.12 },
          { name: 'back by the door, with the room’s name and its line beside it', x: -1.4, z: -2.6, yaw: Math.PI, frame: head.el },
          { name: 'at the right-hand wall, with the room’s own page on it, its call and its radio', x: W / 2 - 2.5, z: pz, yaw: RIGHT, pitch: 0.05, page: kit.page, frame: frame }
        ]
      };
    }
  };
})();

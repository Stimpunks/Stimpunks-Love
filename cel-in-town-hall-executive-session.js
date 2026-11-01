/* =============================================================================
   Executive Session, walked into on Cel Street, through its door off the Town
   Hall. Ryan's ask, 2026-11-01: the rooms behind the doors.

   IT IS THE ROOM'S OWN WORLD AND SHARES NOTHING WITH THE HALL IT OPENS OFF
   (§82). The board without staff, in a dark room after everybody else has
   gone. There is no lamp. The one light is the EXIT sign over the shut door
   you came in by: a small green box that lights the door and the floor near it
   and fades before the far wall, so the chairs round the one small table each
   catch a green edge on the side that faces it. Nobody is drawn.

   THE SIGN NEVER FLICKERS: Club Chronic's rule, and an exit sign that
   flickered would be a broken one. It is a light and a lettered face that are
   simply on.

   THE COLLISIONS ARE §82's: the Board room next door has the same lamp at
   every seat, so there is no lamp here at all and one small table; the
   Directors' room is lit through its door's frosted glass, so this door has no
   glass and the light is the sign over it, inside the room.

   THE WORDS ARE THE PAGE'S OWN, lifted off it and never retyped: what an
   executive session is, who is on the board, and why the room is the way it
   is. The room's call and its radio stay on its page, which stands on the
   wall, because they talk to the CB and the call is the board's alone.

   NOTHING MOVES AT ANY SETTING. Every colour is one §82 declares, by name. It
   keeps nothing, sends nothing and fetches nothing; its page arrives through
   Cel Street's screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['town-hall-executive-session.html'] = {
    name: 'Executive Session',
    from: 'town-hall.html',
    faces: ['"Sofia Sans Condensed"'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var W = 7.4, D = 8, H = 2.9, back = -D;
      var DX = -1.6, DW = 1.0, DH = 2.15;            // the door, in the front wall

      // NO LAMP: the room's own dark, and only enough of it to see the walls.
      kit.scene.background = kit.col('--es-dark');
      kit.scene.add(new T.HemisphereLight(kit.col('--es-frame'), kit.col('--es-dark'), 1.3));

      // THE SIGN'S LIGHT: steady, green, from just under the sign over the
      // door, and gone before the far wall.
      var sign = new T.PointLight(kit.col('--es-exit'), 26, 7.5, 1.1);
      sign.position.set(DX, DH + 0.18, -0.35);
      kit.scene.add(sign);

      // An unlit sheet: the sign's face and the green it leaves on the floor,
      // which glow of themselves rather than being lit by anything.
      function glow(map, w, h, m) {
        var mesh = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: map, transparent: true, depthWrite: false }));
        mesh.matrixAutoUpdate = false;
        mesh.matrix.copy(m);
        mesh.matrixWorldNeedsUpdate = true;
        kit.scene.add(mesh);
      }

      // THE ROOM: the floor, the dark walls and ceiling, and the frame colour
      // along the floor's edge.
      box(W, 0.06, D + 0.4, at(0, -0.03, -D / 2), '--es-panel', false, false);
      box(0.3, H, D, at(-W / 2 - 0.15, H / 2, -D / 2), '--es-dark');
      box(0.3, H, D, at(W / 2 + 0.15, H / 2, -D / 2), '--es-dark');
      box(W + 0.6, H, 0.3, at(0, H / 2, back - 0.15), '--es-dark');
      box(W + 0.6, 0.2, D + 0.6, at(0, H + 0.1, -D / 2), '--es-dark', false, false);
      [[-W / 2 + 0.02, -D / 2, LEFT, D], [W / 2 - 0.02, -D / 2, RIGHT, D], [0, back + 0.02, 0, W]].forEach(function (w) {
        box(w[3], 0.1, 0.04, at(w[0], 0.05, w[1], w[2]), '--es-frame', false);
      });

      // THE FRONT WALL, and in it the door everybody else went out by, shut,
      // with no glass in it.
      var lw = DX - DW / 2 + W / 2, rw = W / 2 - (DX + DW / 2);
      box(lw, H, 0.3, at(-W / 2 + lw / 2, H / 2, 0.15), '--es-dark');
      box(rw, H, 0.3, at(W / 2 - rw / 2, H / 2, 0.15), '--es-dark');
      box(DW, H - DH, 0.3, at(DX, (H + DH) / 2, 0.15), '--es-dark');
      box(W, 0.1, 0.04, at(0, 0.05, -0.02), '--es-frame', false);
      [-1, 1].forEach(function (s) { box(0.1, DH + 0.05, 0.36, at(DX + s * (DW / 2 + 0.05), (DH + 0.05) / 2, 0.12), '--es-frame', 0.01); });
      box(DW + 0.3, 0.1, 0.36, at(DX, DH + 0.05, 0.12), '--es-frame', 0.01);
      box(DW, DH, 0.06, at(DX, DH / 2, 0.06), '--es-door', false);
      // The push bar across it, on the room's side, the way out.
      box(DW - 0.16, 0.06, 0.06, at(DX, 1.0, 0.0), '--es-frame', false);

      // THE EXIT SIGN over the door: a small box in the frame colour, and its
      // face lettered EXIT in its own green, steady.
      box(0.62, 0.24, 0.1, at(DX, DH + 0.3, -0.03), '--es-frame', 0.008);
      var face = kit.paper(320, 120, function (c, w, h) {
        c.fillStyle = kit.ink('--es-door'); c.fillRect(0, 0, w, h);
        c.fillStyle = kit.ink('--es-exit');
        var size = 90;
        c.font = '700 ' + size + 'px "Sofia Sans Condensed"';
        while (c.measureText('EXIT').width > w - 40 && size > 30) { size -= 4; c.font = '700 ' + size + 'px "Sofia Sans Condensed"'; }
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText('EXIT', w / 2, h / 2 + 4);
      });
      glow(face, 0.54, 0.2, at(DX, DH + 0.3, -0.085, Math.PI));

      // THE SIGN'S GREEN ON THE FLOOR, falling off from the door with no
      // edge, gone before the table's far side.
      var SW = 6, SD = 5.2;
      var spill = kit.paper(384, 320, function (c, w, h) {
        c.fillStyle = kit.ink('--es-glow'); c.fillRect(0, 0, w, h);
        var a = c.getImageData(0, 0, w, h);
        for (var y = 0; y < h; y++) {
          for (var x = 0; x < w; x++) {
            var dx = (x / w - 0.5) * 2, dy = (h - y) / h;
            var f = Math.max(0, 1 - Math.sqrt(dx * dx * 0.5 + dy * dy));
            a.data[(y * w + x) * 4 + 3] = Math.round(160 * Math.pow(f, 1.4));
          }
        }
        c.putImageData(a, 0, 0);
      });
      glow(spill, SW, SD, at(DX, 0.004, -SD / 2, 0, -Math.PI / 2));

      // THE ONE SMALL TABLE, and the chairs drawn up round it, all in the
      // door's dark, each catching the sign's green on its near side. No lamp.
      var TX = 0.4, TZ = -4.6, TW = 1.5, TD = 1.0;
      box(TW, 0.05, TD, at(TX, 0.74, TZ), '--es-door', 0.012);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) {
        box(0.05, 0.72, 0.05, at(TX + p[0] * (TW / 2 - 0.08), 0.36, TZ + p[1] * (TD / 2 - 0.08)), '--es-door', false);
      });
      [[-0.4, TD / 2 + 0.38, 0], [0.4, TD / 2 + 0.38, 0], [-0.4, -TD / 2 - 0.38, Math.PI], [0.4, -TD / 2 - 0.38, Math.PI],
       [TW / 2 + 0.38, 0, LEFT]].forEach(function (s) {
        var chair = at(TX + s[0], 0, TZ + s[1], s[2]);
        box(0.46, 0.06, 0.44, M(chair, at(0, 0.46, 0)), '--es-door', 0.01);
        box(0.46, 0.5, 0.05, M(chair, at(0, 0.74, 0.2)), '--es-door', 0.01);
        [[-0.19, -0.18], [0.19, -0.18], [-0.19, 0.18], [0.19, 0.18]].forEach(function (p) {
          box(0.04, 0.46, 0.04, M(chair, at(p[0], 0.23, p[1])), '--es-door', false);
        });
      });

      // THE ROOM'S OWN PAGE on the right-hand wall, in a frame of the frame
      // colour, with its call and its radio on it.
      var pw = 2.4, ph = pw * 800 / 1180, py = 0.55 + ph / 2, pz = -3.4;
      box(0.05, ph + 0.12, pw + 0.12, at(W / 2 - 0.03, py, pz), '--es-frame', 0.01);
      var frame = kit.screen(1180, 800, pw, at(W / 2 - 0.07, py, pz, RIGHT), 'Executive Session’s own page, on the wall to the right of the table');

      // THE PAGE'S OWN WORDS, standing out of the dark on its own ground: what
      // an executive session is and who is on the board on the far wall, past
      // the table; why the room is the way it is on the left-hand wall; and
      // the room's name and its line on the front wall beside the door.
      var what = kit.lift(frame, '.es-part', { n: 0, w: 760, ww: 2.2, m: at(-1.75, 0.95, back + 0.04) });
      var who = kit.lift(frame, '.es-part', { n: 1, w: 760, ww: 2.2, m: at(1.75, 0.95, back + 0.04) });
      var why = kit.lift(frame, '.es-part', { n: 3, w: 760, ww: 2.2, m: at(-W / 2 + 0.04, 0.95, -4.4, LEFT) });
      var head = kit.lift(frame, '.es-head', { drop: '.es-head__art', w: 760, ww: 1.8, m: at(1.6, 1.25, -0.04, Math.PI) });
      kit.lift(frame, '.es-lede', { w: 760, ww: 1.8, m: at(1.6, 0.8, -0.04, Math.PI) });

      return {
        start: { x: DX, z: -1.0, yaw: -0.2 },
        bounds: { x: [-W / 2 + 0.8, W / 2 - 0.8], z: [back + 1.2, -0.7] },
        stops: [
          { name: 'just inside the door, the room dark but for the green sign behind you', x: DX, z: -1.0, yaw: -0.2, pitch: -0.05 },
          { name: 'at the small table, the chairs drawn up round it catching the sign’s green', x: TX - 0.4, z: TZ + 2.4, yaw: -0.1, pitch: -0.3 },
          { name: 'at the far wall, past the table: what an executive session is', x: -1.75, z: back + 2.6, yaw: 0, pitch: 0.05, frame: what.el },
          { name: 'at the far wall: who is on the board, as our Board & Governance page lists them', x: 1.75, z: back + 2.6, yaw: 0, pitch: 0.05, frame: who.el },
          { name: 'at the left-hand wall: why the room is the way it is', x: -W / 2 + 2.3, z: -4.4, yaw: LEFT, pitch: 0.05, frame: why.el },
          { name: 'turned back to the shut door, the EXIT sign over it, steady', x: DX, z: -3.4, yaw: Math.PI, pitch: 0.2 },
          { name: 'back by the door, with the room’s name and its line beside it', x: 1.6, z: -2.4, yaw: Math.PI, frame: head.el },
          { name: 'at the right-hand wall, with the room’s own page on it, its call and its radio', x: W / 2 - 2.5, z: pz, yaw: RIGHT, pitch: 0.05, page: kit.page, frame: frame }
        ]
      };
    }
  };
})();

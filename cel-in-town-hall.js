/* =============================================================================
   The Town Hall, walked into on Cel Street. Ryan's ask, 2026-10-31: back on
   the street, working down it a room at a time.

   IT IS THE TOWN HALL'S WORLD AND NOBODY ELSE'S (§77): a rotunda at noon. One
   round room under a coffered dome, the top of the dome open to the sky, and
   the sun through the hole lying on the floor as ONE hard-edged disc, with
   everything else in the dome's even shade. Clean air shows no beam, so none
   is drawn; there is no lamp, no window and no glass, and NOBODY STANDS IN THE
   DISC: every word here is in the shade, and the disc carries none.

   THE DOORS ROUND THE WALL are drawn in the hall's own stone, never in the
   worlds behind them: arched panels of the drum wall in granite, each with its
   name cut over it in the hall's capitals. The Fishbowl's stands open onto the
   dark of its doorway; the rooms for our directors, our board, our moderators
   and Executive Session are simply shut doors with their names. Each is a
   place whose link goes into that room's own page. Nothing of the radio or the
   calls is wired here: those rooms' locks are the street's server's, and this
   is only the hall.

   WHAT IS ON THE WALLS IS THE PAGE'S OWN, lifted off it by the kit, each on
   the drum wall in the shade: the word on the hall, who can talk where, why a
   hole in the roof, and whose this is. The page itself hangs on the wall by the
   way in.

   NOTHING MOVES: the sun is drawn at noon and stays there. Every colour is one
   the room declares, by name. It keeps nothing, sends nothing and fetches
   nothing; its page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['town-hall.html'] = {
    name: 'The Town Hall',
    faces: ['Forum'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var R = 7.2, CZ = -8.2, DRUM = 4.2, DOME = R;      // the rotunda
      var OC = 1.18;                                      // the oculus, as an angle up the dome
      var OR = R * Math.cos(OC);                          // its radius

      // Where a thing on the drum wall stands, at angle th round from the far
      // wall (0) and d in from it, facing the middle.
      function onWall(th, y, d) {
        var r = R - (d || 0);
        return at(Math.sin(th) * r, y, CZ - Math.cos(th) * r, -th);
      }
      // Where to stand to face it, s in from the wall.
      function before(th, s) {
        var r = R - s;
        return { x: Math.sin(th) * r, z: CZ - Math.cos(th) * r, yaw: -th };
      }

      // THE SHADE: the dome's even light, from everywhere and nowhere, and no
      // second light. The sky in the hole is the only bright thing overhead.
      kit.scene.background = kit.col('--th-coffer');
      kit.scene.add(new T.HemisphereLight(kit.col('--th-dim'), kit.col('--th-shade'), 2.0));

      // THE FLOOR: grey and red rings of stone, round the middle.
      cyl(R + 0.3, R + 0.3, 0.1, at(0, -0.05, CZ), '--th-granite', false, 64);
      [[R - 0.4, R - 0.9, '--th-porphyry'], [4.6, 4.3, '--th-porphyry'], [2.9, 2.75, '--th-porphyry']].forEach(function (g) {
        kit.flat(new T.RingGeometry(g[1], g[0], 64), at(0, 0.004, CZ, 0, -Math.PI / 2), g[2]);
      });
      // THE DISC: the sun through the hole, at noon, a little off the middle,
      // hard-edged, lying on the floor. It is the one bright thing on the floor
      // and nothing stands in it.
      kit.flat(new T.CircleGeometry(OR, 64), at(0.7, 0.008, CZ + 0.5, 0, -Math.PI / 2), '--th-sun');

      // THE DRUM WALL: panels of the wall all the way round, with the way in
      // left open at the front.
      var PANELS = 40;
      for (var p = 0; p < PANELS; p++) {
        var th = (p + 0.5) / PANELS * Math.PI * 2;
        if (Math.abs(Math.PI - th) < 0.16) continue;                 // the way in
        var pw = 2 * Math.PI * (R + 0.15) / PANELS + 0.03;
        box(pw, DRUM, 0.3, M(onWall(th, 0, -0.15), at(0, DRUM / 2, 0)), '--th-wall', 0.012);
        box(pw, 0.22, 0.12, M(onWall(th, 0, 0.0), at(0, DRUM - 0.11, 0)), '--th-granite', false);
        box(pw, 0.32, 0.08, M(onWall(th, 0, 0.0), at(0, 0.16, 0)), '--th-granite', false);
      }
      // The way in, behind you: its jambs and lintel in granite.
      [-0.5, 0.5].forEach(function (o) { box(0.22, 2.8, 0.42, M(onWall(Math.PI + o, 0, 0), at(0, 1.4, 0)), '--th-granite', 0.012); });
      box(2.6, 0.3, 0.42, M(onWall(Math.PI, 0, 0), at(0, 2.95, 0)), '--th-granite', 0.012);

      // THE DOME: rings of coffers up to the hole, each a sunk square of the
      // wall's stone with the dark of the coffer showing between them.
      var centre = new T.Vector3(0, DRUM, CZ);
      for (var ring = 0; ring < 7; ring++) {
        var a = 0.08 + ring * (OC - 0.18) / 6, rr = DOME * Math.cos(a), yy = DRUM + DOME * Math.sin(a);
        var n = Math.max(10, Math.round(2 * Math.PI * rr / 1.15));
        var size = 2 * Math.PI * rr / n * 0.78;
        for (var k = 0; k < n; k++) {
          var t = (k + (ring % 2) * 0.5) / n * Math.PI * 2;
          var o = new T.Object3D();
          o.position.set(Math.sin(t) * rr, yy, CZ - Math.cos(t) * rr);
          o.lookAt(centre);
          o.updateMatrix();
          box(size, size * 0.9, 0.16, o.matrix, '--th-wall', 0.01);
        }
      }
      // The ring round the hole, and the sky in it.
      kit.piece(new T.TorusGeometry(OR + 0.1, 0.16, 8, 48), at(0, DRUM + DOME * Math.sin(OC), CZ, 0, Math.PI / 2), '--th-granite', 0.012);
      kit.flat(new T.CircleGeometry(OR, 48), at(0, DRUM + DOME * Math.sin(OC) + 0.4, CZ, 0, Math.PI / 2), '--th-sky');

      // A NAME CUT OVER A DOOR, in the hall's capitals.
      function name(words) {
        return kit.paper(1024, 200, function (c, w, h) {
          c.fillStyle = kit.ink('--th-wall'); c.fillRect(0, 0, w, h);
          c.fillStyle = kit.ink('--th-text');
          var size = 120;
          c.font = size + 'px Forum';
          while (c.measureText(words.toUpperCase()).width > w - 60 && size > 40) { size -= 4; c.font = size + 'px Forum'; }
          c.textAlign = 'center'; c.textBaseline = 'middle';
          c.fillText(words.toUpperCase(), w / 2, h / 2 + 4);
        });
      }
      // AN ARCHED DOOR, open or shut, in granite.
      function arch(wd, ht) {
        var s = new T.Shape(), r = wd / 2;
        s.moveTo(-r, 0); s.lineTo(r, 0); s.lineTo(r, ht - r);
        s.absarc(0, ht - r, r, 0, Math.PI, false);
        s.lineTo(-r, 0);
        return s;
      }
      function door(th, words, open) {
        var m = onWall(th, 0, 0.02);
        var frame = new T.ExtrudeGeometry(arch(1.9, 3.1), { depth: 0.1, bevelEnabled: false });
        kit.piece(frame, M(m, at(0, 0, 0)), '--th-granite', 0.012);
        var leaf = new T.ExtrudeGeometry(arch(1.5, 2.85), { depth: 0.06, bevelEnabled: false });
        kit.piece(leaf, M(m, at(0, 0, 0.1)), open ? '--th-coffer' : '--th-wall', open ? false : 0.01);
        if (!open) {
          box(0.03, 2.1, 0.02, M(m, at(0, 1.05, 0.17)), '--th-granite', false);           // the meeting of the leaves
          cyl(0.04, 0.04, 0.05, M(m, at(0.14, 1.05, 0.19, 0, Math.PI / 2)), '--th-link', false, 10);
        }
        kit.sheet(name(words), 2.6, 2.6 * 200 / 1024, M(m, at(0, 3.5, 0.2)));
      }
      var DOORS = [
        { th: -1.25, words: 'The Fishbowl', page: 'town-hall-fishbowl.html', open: true, room: 'the Fishbowl',
          where: 'at the Fishbowl’s door, open, where anybody signed on to the CB can talk' },
        { th: -0.62, words: 'Directors', page: 'town-hall-directors.html', room: 'the Directors’ room',
          where: 'at the Directors’ door, shut, the room where our directors meet' },
        { th: 0, words: 'Board', page: 'town-hall-board.html', room: 'the Board room',
          where: 'at the Board’s door, shut, across the hall from the way in' },
        { th: 0.62, words: 'Moderators', page: 'town-hall-moderators.html', room: 'the Moderators’ room',
          where: 'at the Moderators’ door, shut, the room where our moderators meet' },
        { th: 1.25, words: 'Executive Session', page: 'town-hall-executive-session.html', room: 'Executive Session',
          where: 'at the door to Executive Session, shut, for the board and nobody else' }
      ];
      var stops = [
        { name: 'just inside the way in, under the dome', x: 0, z: CZ + R - 1.2, yaw: 0, pitch: 0.1 },
        { name: 'at the edge of the disc of sun, looking up at the sky through the hole', x: 0.7, z: CZ + OR + 1.4, yaw: 0, pitch: 0.7 }
      ];
      DOORS.forEach(function (d) {
        door(d.th, d.words, d.open);
        var b = before(d.th, 4.2);
        stops.push({ name: d.room, where: d.where, x: b.x, z: b.z, yaw: b.yaw, pitch: 0.12, page: d.page });
      });

      // THE PAGE ITSELF and ITS OWN WORDS on the drum wall, in the shade, on
      // either side between the doors and the way in: the word on the hall
      // and whose this is on the left, who can talk where, why a hole in the
      // roof and the page on the right.
      var pg = 2.38, sw = 2.2, sh = sw * 800 / 1180, sy = 0.7 + sh / 2;
      box(sw + 0.16, sh + 0.16, 0.06, M(onWall(pg, 0, 0.02), at(0, sy, 0)), '--th-granite', 0.012);
      var frame = kit.screen(1180, 800, sw, M(onWall(pg, 0, 0.06), at(0, sy, 0)), 'The Town Hall’s own page, on the drum wall by the way in');
      var WORDS = [
        { th: -1.62, sel: '.th-lede', n: 0, w: 520, ww: 1.8, h: 700, y: 1.0, name: 'at the word on the hall, on the wall to the left' },
        { th: -2.0, sel: '.th-part', n: 3, ww: 1.5, h: 700, name: 'at whose this is, on the wall to the left by the way in' },
        { th: 1.62, sel: '.th-part', n: 1, ww: 2.0, h: 900, name: 'at who can talk where, on the wall to the right' },
        { th: 2.0, sel: '.th-part', n: 2, ww: 1.6, h: 700, name: 'at why a hole in the roof, on the wall to the right' }
      ];
      WORDS.forEach(function (w) {
        var it = kit.lift(frame, w.sel, { n: w.n, w: w.w || 760, h: w.h, ww: w.ww, m: onWall(w.th, w.y || 0.55, 0.05) });
        var b = before(w.th, 1.9);
        stops.push({ name: w.name, x: b.x, z: b.z, yaw: b.yaw, pitch: 0.05, frame: it.el });
      });
      var bp = before(pg, 2.6);
      stops.push({ name: 'at the drum wall by the way in, with the Town Hall’s own page on it', x: bp.x, z: bp.z, yaw: bp.yaw, pitch: 0.05, page: kit.page, frame: frame });

      return {
        start: { x: 0, z: CZ + R - 1.2, yaw: 0 },
        // Round inside, square here: you keep to a square inside the drum, and
        // a strip from it out to the way in.
        bounds: { x: [-R * 0.69, R * 0.69], z: [CZ - R * 0.69, CZ + R - 0.8],
                  areas: [{ x: [-R * 0.69, R * 0.69], z: [CZ - R * 0.69, CZ + R * 0.69] }, { x: [-1, 1], z: [CZ, CZ + R - 0.8] }] },
        stops: stops
      };
    }
  };
})();

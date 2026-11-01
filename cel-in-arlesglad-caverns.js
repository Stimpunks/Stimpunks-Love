/* =============================================================================
   Arlesglad Caverns, walked into on Cel Street, down the lift by the stoop.
   Ryan's ask, 2026-11-01: the street's edges, once every door had its room.

   IT IS THE AREA'S OWN WORLD (§62). You step out of the lift into rock nobody
   dug, and the stair comes down beside the shaft, the same size as the lift,
   because neither is the other's alternative. THE ONLY LIGHT IS THE HANDRAIL:
   one warm strip at hand height along the left of the one route, from the
   lift to every door, so the rock is lit in a band where the path goes and is
   black above and below it. Every notice is on that band, with the rail along
   its FOOT. There is no sky, no lamp and no daylight from the top, and no
   brown: the greys are stone, and the only colour in the passage is the
   light. The rooms off it bring their own colours, and none is drawn here.

   THE LIFT'S PANEL IS THE AREA'S BOARD, and every landing has its names
   painted on it: one doorway off the passage for every level, in the page's
   order, top to bottom, with that level's own plate lifted off the page
   beside it. A lit level is an open doorway and a stop that offers to walk in
   once its room is built. An unlit level is a shut door with a dashed ring,
   its words at full strength, and no way through. Stay Frosty is at the
   bottom, at the passage's end; Stay Breezy is behind it and is reached from
   there, not from here. Stay Frosty's temperature is never drawn: it is on
   its plate, lifted off the page, which writes it from the one place it lives.

   THE COLLISIONS ARE §62's: the Rabbit Hole is a grey shaft daylit from one
   end, and nothing comes down from the top here; the Latibulum is a brown
   burrow with one lamp, and there is no lamp and no brown here; the Mopery is
   the other cold stone, and it is a building. No room is mapped onto ARLES's
   rungs.

   NOTHING MOVES AT ANY SETTING, and the rail does not flicker, because it is
   the one thing in here you are holding. Every colour is one §62 declares, by
   name. It keeps nothing, sends nothing and fetches nothing; its page arrives
   through Cel Street's screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['arlesglad-caverns.html'] = {
    name: 'Arlesglad Caverns',
    faces: ['"Syne"', '"Rethink Sans"'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var W = 4.4, L = 26.5, H = 3.7;                 // the passage
      var RAIL = 0.92, BAND = 2.3, FOOT = 1.04;       // the rail, the lit band, where a notice stands
      var XL = -W / 2;                                 // the left wall, where the rail runs
      var DW = 1.4, DH = 2.3, LX = -1.1, SX = 1.1;     // the lift and the stair, one size

      // THE LEVELS, as the page's panel has them, top to bottom. A lit one is
      // a doorway and a stop; the unlit one is a shut door with nothing behind.
      // cel:levels:begin
      var LEVELS = [{"key": "B1", "room": "Big Steep Fermentables", "page": "big-steep-fermentables.html"}, {"key": "B2", "room": "Mycelium Munchies", "page": "mycelium-munchies.html"}, {"key": "B3", "room": "Glow Go Gee Gaws", "page": "glow-go-gee-gaws.html"}, {"key": "B4", "room": "Buoyant Bodyminds", "page": null}, {"key": "B5", "room": "Stay Frosty", "page": "stay-frosty.html"}];
      // cel:levels:end
      // Written off the page's panel by tools/make-cel-street.py, never by hand.
      // Every level but the bottom one opens off the passage in turn; the bottom
      // one is the doorway in the far wall, and the passage is as long as they need.
      LEVELS.forEach(function (lv, n) { lv.z = n === LEVELS.length - 1 ? null : -6.6 - n * 3.4; });
      L = Math.max(L, 6.6 + (LEVELS.length - 1) * 3.4 + 9.9);

      // NO LAMP AND NO SKY: the rock's own dark, only just enough to tell the
      // walls from nothing.
      kit.scene.background = kit.col('--cav-rock');
      kit.scene.add(new T.HemisphereLight(kit.col('--cav-seam'), kit.col('--cav-rock'), 0.5));

      // THE RAIL'S LIGHT: steady, warm white, at hand height along the left,
      // reaching about a body's width either side of it and no further.
      for (var lz = -1.2; lz > -L; lz -= 4.6) {
        var lamp = new T.PointLight(kit.col('--cav-rail'), 5, 4.2, 1.3);
        lamp.position.set(XL + 0.35, RAIL, lz);
        kit.scene.add(lamp);
      }

      // An unlit sheet: the rail itself, the light it spills, and the paint
      // that glows in it, which shine of themselves rather than being lit.
      function glow(map, w, h, m, solid) {
        var mat = new T.MeshBasicMaterial({ map: map, transparent: !solid, depthWrite: !!solid });
        var mesh = new T.Mesh(new T.PlaneGeometry(w, h), mat);
        mesh.matrixAutoUpdate = false;
        mesh.matrix.copy(m);
        mesh.matrixWorldNeedsUpdate = true;
        kit.scene.add(mesh);
        return mesh;
      }
      // The rail's glow on the rock: strongest at the rail, gone at the top of
      // the band and at the floor, never a hard edge.
      var band = kit.paper(64, 256, function (c, w, h) {
        c.fillStyle = kit.ink('--cav-rail'); c.fillRect(0, 0, w, h);
        var a = c.getImageData(0, 0, w, h), mid = h * (1 - RAIL / BAND);
        for (var y = 0; y < h; y++) {
          var f = Math.max(0, 1 - Math.abs(y - mid) / (y < mid ? mid : h - mid));
          for (var x = 0; x < w; x++) a.data[(y * w + x) * 4 + 3] = Math.round(48 * Math.pow(f, 1.8));
        }
        c.putImageData(a, 0, 0);
      });
      var spill = kit.paper(256, 64, function (c, w, h) {
        c.fillStyle = kit.ink('--cav-rail'); c.fillRect(0, 0, w, h);
        var a = c.getImageData(0, 0, w, h);
        for (var x = 0; x < w; x++) {
          var f = Math.max(0, 1 - x / w);
          for (var y = 0; y < h; y++) a.data[(y * w + x) * 4 + 3] = Math.round(55 * Math.pow(f, 2));
        }
        c.putImageData(a, 0, 0);
      });

      // THE FLOOR, the passage's rock, and its ceiling far up in the dark.
      box(W + 0.6, 0.06, L + 0.6, at(0, -0.03, -L / 2), '--cav-rock', false, false);
      box(W + 0.6, 0.2, L + 0.6, at(0, H + 0.1, -L / 2), '--cav-rock', false, false);
      // The left wall: the face the rail lights, and the dark rock over it.
      box(0.3, BAND, L, at(XL - 0.15, BAND / 2, -L / 2), '--cav-wall', false);
      box(0.3, H - BAND, L, at(XL - 0.15, BAND + (H - BAND) / 2, -L / 2), '--cav-rock', false);
      // The right wall, unlit rock, and its strata in the seam colour.
      box(0.3, H, L, at(W / 2 + 0.15, H / 2, -L / 2), '--cav-rock', false);
      [0.7, 1.55, 2.6].forEach(function (y, n) {
        for (var z = -0.4, k = 0; z > -L; z -= 2.2, k++) {
          var dy = Math.sin(k * 1.7 + n) * 0.09;
          box(0.04, 0.035, 2.25, at(W / 2 - 0.02, y + dy, z - 1.1, 0, 0.02 * Math.sin(k + n)), '--cav-seam', false, false);
        }
      });
      // Rock nobody dug: boulders in the upper dark and along the right, and a
      // few points of rock hanging from the ceiling, all of it still.
      var rock = new T.IcosahedronGeometry(1, 0);
      for (var b = 0; b < 26; b++) {
        var g = rock.clone(), r = 0.35 + ((b * 37) % 11) / 18, side = b % 3 === 0 ? -1 : 1;
        g.scale(r, r * 0.8, r * 1.3);
        var bz = -0.8 - (b * 2.9) % L;
        kit.facets(g, at(side * (W / 2 + 0.05), side < 0 ? H - 0.15 : 0.1 + ((b * 13) % 7) / 6, bz, b), side < 0 ? '--cav-rock' : '--cav-wall');
      }
      for (var s = 0; s < 9; s++) {
        cyl(0.01, 0.12 + (s % 3) * 0.05, 0.5 + (s % 4) * 0.18, at(-0.6 + (s * 0.7) % 2.2, H - 0.3 - (s % 4) * 0.09, -3 - s * 2.6), '--cav-wall', false, 6);
      }

      // THE FRONT WALL: the lift's doors standing open on the left, where you
      // came in, and the stair coming down on the right, each opening the same
      // width and the same height.
      var fw = [[XL, LX - DW / 2], [LX + DW / 2, SX - DW / 2], [SX + DW / 2, W / 2]];
      fw.forEach(function (p) { box(p[1] - p[0], H, 0.3, at((p[0] + p[1]) / 2, H / 2, 0.15), '--cav-rock', false); });
      box(W, H - DH, 0.3, at(0, (H + DH) / 2, 0.15), '--cav-rock', false);
      [LX, SX].forEach(function (x) {
        [-1, 1].forEach(function (k) { box(0.1, DH + 0.05, 0.36, at(x + k * (DW / 2 + 0.05), (DH + 0.05) / 2, 0.12), '--cav-steel', 0.01); });
        box(DW + 0.3, 0.1, 0.36, at(x, DH + 0.05, 0.12), '--cav-steel', 0.01);
      });
      // The lift car behind its doors, in the panel's steel, its two leaves
      // slid back into the frame.
      box(DW, DH, 0.06, at(LX, DH / 2, 1.8), '--cav-steel', false);
      box(0.06, DH, 1.8, at(LX - DW / 2, DH / 2, 0.9), '--cav-steel', false);
      box(0.06, DH, 1.8, at(LX + DW / 2, DH / 2, 0.9), '--cav-steel', false);
      box(DW, 0.06, 1.8, at(LX, 0.0, 0.9), '--cav-steel', false, false);
      box(DW, 0.06, 1.8, at(LX, DH, 0.9), '--cav-steel', false, false);
      [-1, 1].forEach(function (k) { box(0.08, DH - 0.06, 0.04, at(LX + k * (DW / 2 - 0.06), (DH - 0.06) / 2, 0.32), '--cav-steel', 0.01); });
      // The stair coming down beside it, out of the dark, with the rail on its
      // left all the way down.
      for (var st = 0; st < 10; st++) {
        box(DW, 0.18, 0.3, at(SX, 0.09 + st * 0.18, 0.3 + st * 0.3 + 0.15), '--cav-wall', 0.008);
      }
      box(0.06, DH + 1.8, 3.2, at(SX + DW / 2 + 0.03, (DH + 1.8) / 2, 1.6), '--cav-rock', false);
      box(0.06, DH + 1.8, 3.2, at(SX - DW / 2 - 0.03, (DH + 1.8) / 2, 1.6), '--cav-rock', false);
      var stairRail = new T.Mesh(new T.BoxGeometry(0.035, 0.035, 3.3), new T.MeshBasicMaterial({ color: kit.col('--cav-rail') }));
      stairRail.matrixAutoUpdate = false;
      stairRail.matrix.copy(at(SX - DW / 2 + 0.06, RAIL + 0.85, 1.55, 0, -Math.atan2(1.8, 3.0)));
      stairRail.matrixWorldNeedsUpdate = true;
      kit.scene.add(stairRail);
      var stairLamp = new T.PointLight(kit.col('--cav-rail'), 3, 2.6, 1.3);
      stairLamp.position.set(SX - DW / 2 + 0.25, RAIL + 0.9, 1.4);
      kit.scene.add(stairLamp);

      // THE NAME over both, painted on the rock and lit by nothing but its own
      // paint catching the rail, in the page's own face and the rail's colour.
      var name = kit.paper(1024, 160, function (c, w, h) {
        c.fillStyle = kit.ink('--cav-rock'); c.fillRect(0, 0, w, h);
        c.fillStyle = kit.ink('--cav-rail');
        var size = 112;
        c.font = '800 ' + size + 'px "Syne"';
        while (c.measureText('Arlesglad Caverns').width > w - 60 && size > 40) { size -= 4; c.font = '800 ' + size + 'px "Syne"'; }
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText('Arlesglad Caverns', w / 2, h / 2 + 4);
        c.fillRect(w * 0.18, h - 14, w * 0.64, 5);
      });
      glow(name, 3.4, 0.53, at(0, DH + 0.62, -0.02, Math.PI), true);

      // THE LIFT'S PANEL on the pier between the lift and the stair: a steel
      // plate, one ring for every level top to bottom, each with its level in
      // Rethink Sans. A lit ring is the rail's colour; the unlit one is dashed
      // in the fine print's colour and its letters are not dimmed further.
      var panel = kit.paper(180, 520, function (c, w, h) {
        c.fillStyle = kit.ink('--cav-steel'); c.fillRect(0, 0, w, h);
        c.strokeStyle = kit.ink('--cav-seam'); c.lineWidth = 4; c.strokeRect(6, 6, w - 12, h - 12);
        LEVELS.forEach(function (lv, n) {
          var y = 66 + n * 96, lit = !!lv.page;
          c.lineWidth = 7;
          c.strokeStyle = kit.ink(lit ? '--cav-rail' : '--cav-dim');
          c.setLineDash(lit ? [] : [11, 9]);
          c.beginPath(); c.arc(w / 2, y, 36, 0, Math.PI * 2); c.stroke();
          c.setLineDash([]);
          c.fillStyle = kit.ink(lit ? '--cav-rail' : '--cav-dim');
          c.font = '700 32px "Rethink Sans"'; c.textAlign = 'center'; c.textBaseline = 'middle';
          c.fillText(lv.key, w / 2, y + 2);
        });
      });
      box(0.42, 1.16, 0.04, at(0, 1.25, -0.02), '--cav-steel', 0.01);
      glow(panel, 0.36, 1.04, at(0, 1.25, -0.045, Math.PI), true);

      // THE RAIL ITSELF along the left, at hand height, on steel brackets, the
      // one warm thing in the passage, broken only where a doorway opens.
      var gaps = LEVELS.filter(function (lv) { return lv.z !== null; }).map(function (lv) { return [lv.z + 0.75, lv.z - 0.75]; });
      var runs = [], z0 = -0.35;
      gaps.forEach(function (gp) { runs.push([z0, gp[0]]); z0 = gp[1]; });
      runs.push([z0, -L + 0.4]);
      runs.forEach(function (r) {
        var len = r[0] - r[1], mid = (r[0] + r[1]) / 2;
        var bar = new T.Mesh(new T.BoxGeometry(0.035, 0.035, len), new T.MeshBasicMaterial({ color: kit.col('--cav-rail') }));
        bar.matrixAutoUpdate = false; bar.matrix.copy(at(XL + 0.12, RAIL, mid)); bar.matrixWorldNeedsUpdate = true;
        kit.scene.add(bar);
        for (var bz = r[0] - 0.2; bz > r[1]; bz -= 1.6) box(0.12, 0.03, 0.03, at(XL + 0.06, RAIL - 0.03, bz), '--cav-steel', false, false);
        glow(band, len, BAND, at(XL + 0.01, BAND / 2, mid, LEFT));
        glow(spill, 1.6, len, at(XL + 0.8, 0.004, mid, 0, -Math.PI / 2), false);
      });

      // THE DOORWAYS, one for every level, off the left of the passage. An
      // open one is a dark way through in a steel frame; the unlit one is a
      // shut steel door. Stay Frosty's is at the far end, at the bottom.
      function doorway(m, open) {
        if (open) box(1.2, 2.2, 0.08, M(m, at(0, 1.1, -0.02)), '--cav-rock', false, false);
        else box(1.2, 2.2, 0.06, M(m, at(0, 1.1, 0.02)), '--cav-steel', 0.01);
        [-1, 1].forEach(function (k) { box(0.09, 2.28, 0.14, M(m, at(k * 0.64, 1.14, 0.05)), '--cav-steel', 0.01); });
        box(1.38, 0.09, 0.14, M(m, at(0, 2.27, 0.05)), '--cav-steel', 0.01);
      }
      LEVELS.forEach(function (lv) {
        if (lv.z !== null) doorway(at(XL + 0.01, 0, lv.z, LEFT), !!lv.page);
      });
      // The far end, and the way down to the bottom in the middle of it.
      box(W + 0.6, H, 0.3, at(0, H / 2, -L - 0.15), '--cav-rock', false);
      doorway(at(0, 0, -L + 0.01), true);
      var endLamp = new T.PointLight(kit.col('--cav-rail'), 4, 3.2, 1.3);
      endLamp.position.set(XL + 0.4, RAIL, -L + 0.6);
      kit.scene.add(endLamp);

      // THE ROOM'S OWN PAGE on the right-hand wall by the lift, in a steel
      // frame; the passage's dark does not reach into it.
      var pw = 2.4, ph = pw * 800 / 1180, py = 0.5 + ph / 2, pz = -2.6;
      box(0.05, ph + 0.12, pw + 0.12, at(W / 2 - 0.03, py, pz), '--cav-steel', 0.01);
      var frame = kit.screen(1180, 800, pw, at(W / 2 - 0.07, py, pz, RIGHT), 'Arlesglad Caverns’ own page, on the wall by the lift');

      // THE PAGE'S OWN WORDS, every one a notice on the band with the rail
      // along its foot: what is down here, the panel's note, every level's
      // plate beside its doorway, and where the name comes from.
      function onBand(z) { return at(XL + 0.04, FOOT, z, LEFT); }
      var lede = kit.lift(frame, '.lede', { w: 680, ww: 1.6, m: onBand(-1.6) });
      var what = kit.lift(frame, '.cav-ledge', { n: 0, w: 760, ww: 2.0, h: 560, m: onBand(-4.0) });
      var plates = LEVELS.map(function (lv, n) {
        // Stay Frosty's plate is on the far wall, beside its doorway down.
        var m = lv.z !== null ? onBand(lv.z - 1.65) : at(XL + 0.78, FOOT, -L + 0.04);
        return kit.lift(frame, '.cav-stop', { n: n, w: 560, ww: lv.z !== null ? 1.6 : 1.3, m: m });
      });
      var note = kit.lift(frame, '.cav-panel__note', { w: 760, ww: 1.6, m: at(0, DH + 0.1, -0.04, Math.PI) });
      var why = kit.lift(frame, '.cav-ledge', { n: 1, w: 760, ww: 2.0, h: 560, m: onBand(-(L - 5.3)) });

      var stops = [
        { name: 'out of the lift, the rail beginning at your left hand and the passage going on into the dark', x: 0.3, z: -1.4, yaw: 0, pitch: -0.05 },
        { name: 'turned back to the lift, the doors open and the stair the same size beside them, under the name', x: 0, z: -3.6, yaw: Math.PI, pitch: 0.12 },
        { name: 'at the panel between the lift and the stair, a ring for every level', x: 0, z: -2.0, yaw: Math.PI, pitch: -0.1, frame: note.el },
        { name: 'on the band by the lift: under the street there is rock nobody dug', x: XL + 2.0, z: -1.6, yaw: LEFT, pitch: 0.05, frame: lede.el },
        { name: 'on the band: what is down here', x: XL + 2.4, z: -4.0, yaw: LEFT, pitch: 0.1, frame: what.el }
      ];
      LEVELS.forEach(function (lv, n) {
        var s = lv.z !== null
          ? { name: lv.room, where: lv.room + ', level ' + lv.key + ': its doorway off the passage and its plate beside it on the band', x: XL + 2.0, z: lv.z - 0.8, yaw: LEFT, pitch: 0.05, frame: plates[n].el }
          : { name: lv.room, where: lv.room + ', level ' + lv.key + ', at the bottom: the doorway at the far end of the passage, its plate beside it', x: -0.75, z: -L + 2.1, yaw: 0, pitch: 0.02, frame: plates[n].el };
        if (lv.page) s.page = lv.page;
        else s.where = lv.room + ', level ' + lv.key + ', not open yet: its door is shut, its ring is not lit, and its plate says so at full strength';
        if (n === LEVELS.length - 1) stops.push({ name: 'on the band near the end: where the name comes from', x: XL + 2.4, z: -(L - 5.3), yaw: LEFT, pitch: 0.1, frame: why.el });
        stops.push(s);
      });
      stops.push({ name: 'at the right-hand wall by the lift, with the area’s own page on it', x: W / 2 - 2.6, z: pz, yaw: RIGHT, pitch: 0.05, page: kit.page, frame: frame });

      return {
        start: { x: 0.3, z: -1.4, yaw: 0 },
        bounds: { x: [XL + 0.6, W / 2 - 0.6], z: [-L + 1.0, -0.9] },
        stops: stops
      };
    }
  };
})();

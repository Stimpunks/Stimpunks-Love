/* =============================================================================
   Stay Frosty, walked into on Cel Street, through the doorway at the far end
   of Arlesglad Caverns' passage. Ryan's ask, 2026-11-02: the caverns' levels.

   IT IS THE ROOM'S OWN WORLD (§63): the bottom of the caverns, where nothing
   changes. A low chamber of wet blue-grey rock with no lamp in it and no lamp
   anywhere you can see. THE LIGHT IS REFLECTED, IN POINTS: the handrail is up
   the slope behind you, through the doorway you came in by, and what reaches
   the bottom is its reflection in every bead of damp on the rock. So the walls,
   the ceiling and the floor carry many small copies of one light, each a point
   in the rail's own warm white (--cav-rail, the only warm value in the room,
   used only where the rail's light would land), and the dimmer beads in
   --fro-bead carry none. Never a pool, a wedge or a gradient: no light is put
   in the scene but the dim fill that lets a wall be told from nothing. If a
   glow ever gathers anywhere in here it has become a room with a lamp in it.

   THE COLLISIONS ARE §63's: the passage above is lit by the rail in a band and
   is warm-grey stone, where this is lit by its reflections in points and is
   cool, wet and blue-grey; the Mopery is the other cold stone, and it is a
   building with candles; the Doom Scoop is the other cold room, and this one
   is not cold at all. It only looks frosty.

   NOTHING MOVES, NOTHING MAKES A SOUND, THERE IS NO CLOCK AND NOTHING TO PRESS
   in the scene, at any setting. The temperature is never written in this
   file: it is in the copies lifted off the page, which writes it from the one
   place it lives. Nothing here says what the room or the cold does for a
   body. The door at the back goes through to Stay Breezy, the hall of fans,
   and it is shut, as the page says, on the one room that promises no sound.

   Every colour is one §63 declares, and the rail's, by name. It keeps
   nothing, sends nothing and fetches nothing; its page arrives through Cel
   Street's screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  // A fixed scatter, the same every build: murmur's finaliser over the three
  // numbers, so neighbouring beads do not fall into rows.
  function hash(i, j, k) {
    var n = Math.imul(i + 1, 73856093) ^ Math.imul(j + 7, 19349663) ^ Math.imul(k + 13, 83492791);
    n ^= n >>> 16; n = Math.imul(n, 0x85ebca6b);
    n ^= n >>> 13; n = Math.imul(n, 0xc2b2ae35);
    n ^= n >>> 16;
    return (n >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['stay-frosty.html'] = {
    name: 'Stay Frosty',
    from: 'arlesglad-caverns.html',
    faces: ['"Geologica"'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var X0 = -4, X1 = 4, NEAR = 4, FAR = -5, H = 3.1;     // the chamber
      var D = NEAR - FAR, MZ = (NEAR + FAR) / 2;
      var SHELF = 0.9;                                       // the top of every flowstone ledge
      var DX = -1.4, DW = 1.2, DH = 2.2;                    // the doorway you came in by
      var BX = 2.3, BW = 1.0, BH = 2.05;                    // the door through to Stay Breezy

      // THE DARK: the wet rock's own colour, and only the dimmest fill from
      // above, so a ledge can be told from a wall. Not a lamp: it lights
      // nothing more than anything else.
      kit.scene.background = kit.col('--fro-rock');
      kit.scene.add(new T.HemisphereLight(kit.col('--fro-mist'), kit.col('--fro-rock'), 1.6));

      // THE CHAMBER: floor, ceiling and walls of wet rock.
      box(X1 - X0 + 0.6, 0.06, D + 0.6, at(0, -0.03, MZ), '--fro-rock', false, false);
      box(X1 - X0 + 0.6, 0.2, D + 0.6, at(0, H + 0.1, MZ), '--fro-rock', false, false);
      box(0.3, H, D, at(X0 - 0.15, H / 2, MZ), '--fro-rock', false);
      box(0.3, H, D, at(X1 + 0.15, H / 2, MZ), '--fro-rock', false);
      // The far wall, with the door at the back in it.
      box(BX - BW / 2 - X0, H, 0.3, at((X0 + BX - BW / 2) / 2, H / 2, FAR - 0.15), '--fro-rock', false);
      box(X1 - (BX + BW / 2), H, 0.3, at((BX + BW / 2 + X1) / 2, H / 2, FAR - 0.15), '--fro-rock', false);
      box(BW, H - BH, 0.3, at(BX, (H + BH) / 2, FAR - 0.15), '--fro-rock', false);
      // The near wall, with the doorway you came down through.
      box(DX - DW / 2 - X0, H, 0.3, at((X0 + DX - DW / 2) / 2, H / 2, NEAR + 0.15), '--fro-rock', false);
      box(X1 - (DX + DW / 2), H, 0.3, at((DX + DW / 2 + X1) / 2, H / 2, NEAR + 0.15), '--fro-rock', false);
      box(DW, H - DH, 0.3, at(DX, (H + DH) / 2, NEAR + 0.15), '--fro-rock', false);

      // THE WAY YOU CAME, through the doorway: the rock floor going up the
      // slope into the dark, and high up it the handrail itself, a thin warm
      // line at hand height. That is where every point in here comes from.
      var slope = Math.atan2(2.4, 7);
      box(DW, 0.08, 7.4, at(DX, 1.2, NEAR + 3.7, 0, -slope), '--fro-ledge', false, false);
      [-1, 1].forEach(function (k) { box(0.08, 4.6, 7.4, at(DX + k * (DW / 2 + 0.04), 2.2, NEAR + 3.7), '--fro-rock', false, false); });
      box(DW + 0.2, 0.08, 7.4, at(DX, DH + 2.0, NEAR + 3.7, 0, -slope), '--fro-rock', false, false);
      var rail = new T.Mesh(new T.BoxGeometry(0.03, 0.03, 4.2), new T.MeshBasicMaterial({ color: kit.col('--cav-rail') }));
      rail.matrixAutoUpdate = false;
      rail.matrix.copy(at(DX - DW / 2 + 0.1, 2.75, NEAR + 5.0, 0, -slope));
      rail.matrixWorldNeedsUpdate = true;
      kit.scene.add(rail);

      // ROCK NOBODY DUG: lumps along the foot of the walls and hanging from the
      // ceiling, all of it still and all of it wet.
      var rock = new T.IcosahedronGeometry(1, 0);
      for (var b = 0; b < 30; b++) {
        var g = rock.clone(), r = 0.25 + hash(b, 1, 0) * 0.5, side = b % 2 ? 1 : -1;
        g.scale(r, r * (0.6 + hash(b, 2, 0) * 0.5), r * 1.4);
        var bz = FAR + 0.6 + hash(b, 3, 0) * (D - 2.2);
        kit.facets(g, at(side * (X1 - 0.05), b % 3 ? 0.05 : H - 0.1, bz, b), b % 4 ? '--fro-rock' : '--fro-ledge');
      }
      for (var s = 0; s < 14; s++) {
        var sx = -3.2 + hash(s, 4, 0) * 6.4, sz = FAR + 0.8 + hash(s, 5, 0) * (D - 2.6);
        cyl(0.01, 0.06 + hash(s, 6, 0) * 0.08, 0.3 + hash(s, 7, 0) * 0.5, at(sx, H - 0.25 - hash(s, 7, 1) * 0.2, sz), '--fro-ledge', false, 6);
      }

      // THE FLOWSTONE LEDGES, the ground of every notice, a shelf of it
      // running out from the rock wherever the page's words stand.
      function ledge(m, wide) { box(wide, 0.14, 0.55, kit.at(0, SHELF - 0.07, 0.24, 0, 0, 0, m), '--fro-ledge', 0.012); }
      function onWall(side, z) { return side < 0 ? at(X0 + 0.02, 0, z, LEFT) : at(X1 - 0.02, 0, z, RIGHT); }
      function onFar(x) { return at(x, 0, FAR + 0.02, 0); }
      function stand(m) { return new T.Matrix4().multiplyMatrices(m, at(0, SHELF + 0.03, 0.3)); }

      // THE DOOR AT THE BACK, through to Stay Breezy: shut, in flowstone with a
      // frame in the bead colour, its handle the same. Through it is the one
      // room down here that makes a sound, and it waits to be opened.
      box(BW, BH, 0.08, at(BX, BH / 2, FAR + 0.05), '--fro-ledge', 0.01);
      [-1, 1].forEach(function (k) { box(0.08, BH + 0.06, 0.14, at(BX + k * (BW / 2 + 0.04), (BH + 0.06) / 2, FAR + 0.06), '--fro-bead', 0.008); });
      box(BW + 0.16, 0.08, 0.14, at(BX, BH + 0.04, FAR + 0.06), '--fro-bead', 0.008);
      box(0.05, 0.22, 0.06, at(BX - BW / 2 + 0.16, 1.0, FAR + 0.12), '--fro-bead', false);

      // THE NAME, painted on the far wall above the thermometer's ledge in the
      // room's one face and its frost colour, lit by nothing.
      var nameMap = kit.paper(1024, 180, function (c, w, h) {
        c.clearRect(0, 0, w, h);
        c.fillStyle = kit.ink('--fro-frost');
        var size = 120;
        c.font = '300 ' + size + 'px "Geologica"';
        while (c.measureText('Stay Frosty').width > w - 60 && size > 40) { size -= 4; c.font = '300 ' + size + 'px "Geologica"'; }
        c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText('Stay Frosty', w / 2, h / 2 + 4);
      });
      var nameMesh = new T.Mesh(new T.PlaneGeometry(2.6, 0.46), new T.MeshBasicMaterial({ map: nameMap, transparent: true }));
      nameMesh.matrixAutoUpdate = false;
      nameMesh.matrix.copy(at(-1.6, 2.55, FAR + 0.03));
      nameMesh.matrixWorldNeedsUpdate = true;
      kit.scene.add(nameMesh);

      // THE DAMP: a point in every bead on the rock. Most hold a small copy of
      // the rail, brighter or dimmer; the rest are only wet and hold nothing.
      // Each is a tiny disc on its surface, and all of one kind are one mesh.
      function dots(list, ink, fade) {
        var pos = [], idx = [];
        list.forEach(function (d) {
          var n = new T.Vector3(d[3], d[4], d[5]);
          var a = Math.abs(n.y) > 0.9 ? new T.Vector3(1, 0, 0) : new T.Vector3(0, 1, 0);
          var u = new T.Vector3().crossVectors(n, a).normalize(), v = new T.Vector3().crossVectors(n, u);
          var base = pos.length / 3;
          pos.push(d[0], d[1], d[2]);
          for (var k = 0; k < 6; k++) {
            var ang = k * Math.PI / 3, c = Math.cos(ang) * d[6], sn = Math.sin(ang) * d[6];
            pos.push(d[0] + u.x * c + v.x * sn, d[1] + u.y * c + v.y * sn, d[2] + u.z * c + v.z * sn);
            idx.push(base, base + 1 + k, base + 1 + (k + 1) % 6);
          }
        });
        var geo = new T.BufferGeometry();
        geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
        geo.setIndex(idx);
        var mat = new T.MeshBasicMaterial({ color: kit.col(ink), side: T.DoubleSide });
        if (fade) { mat.transparent = true; mat.opacity = fade; mat.depthWrite = false; }
        var mesh = new T.Mesh(geo, mat);
        mesh.matrixAutoUpdate = false; mesh.matrixWorldNeedsUpdate = true;
        kit.scene.add(mesh);
      }
      var bright = [], dim = [], wet = [];
      function scatter(seed, count, pick) {
        for (var i = 0; i < count; i++) {
          var d = pick(hash(seed, i, 1), hash(seed, i, 2));
          if (!d) continue;
          var kind = hash(seed, i, 3), r = 0.007 + hash(seed, i, 4) * 0.02;
          if (kind < 0.42) bright.push(d.concat([r]));
          else if (kind < 0.72) dim.push(d.concat([r]));
          else wet.push(d.concat([r * 1.3]));
        }
      }
      function clearOf(x, y, ox, w, h) { return Math.abs(x - ox) > w / 2 + 0.1 || y > h + 0.1; }
      scatter(1, 260, function (p, q) { return [X0 + 0.012, 0.1 + q * (H - 0.2), FAR + 0.2 + p * (D - 0.4), 1, 0, 0]; });
      scatter(2, 260, function (p, q) { return [X1 - 0.012, 0.1 + q * (H - 0.2), FAR + 0.2 + p * (D - 0.4), -1, 0, 0]; });
      scatter(3, 220, function (p, q) {
        var x = X0 + 0.2 + p * (X1 - X0 - 0.4), y = 0.1 + q * (H - 0.2);
        return clearOf(x, y, BX, BW + 0.2, BH) ? [x, y, FAR + 0.012, 0, 0, 1] : null;
      });
      scatter(4, 160, function (p, q) {
        var x = X0 + 0.2 + p * (X1 - X0 - 0.4), y = 0.1 + q * (H - 0.2);
        return clearOf(x, y, DX, DW + 0.2, DH) ? [x, y, NEAR - 0.012, 0, 0, -1] : null;
      });
      scatter(5, 240, function (p, q) { return [X0 + 0.2 + p * (X1 - X0 - 0.4), H - 0.012, FAR + 0.2 + q * (D - 0.4), 0, -1, 0]; });
      scatter(6, 140, function (p, q) { return [X0 + 0.3 + p * (X1 - X0 - 0.6), 0.006, FAR + 0.3 + q * (D - 0.6), 0, 1, 0]; });
      dots(bright, '--cav-rail');
      dots(dim, '--cav-rail', 0.4);
      dots(wet, '--fro-bead');

      // THE ROOM'S OWN PAGE, on the near wall beside the doorway, facing in.
      var pw = 2.0, ph = pw * 800 / 1180, px = 1.7, py = 0.6 + ph / 2;
      box(pw + 0.12, ph + 0.12, 0.05, at(px, py, NEAR - 0.03), '--fro-ledge', 0.01);
      function zone(x, z) { return [x - 2.3, x + 2.3, z - 2.3, z + 2.3]; }
      var pageStop = { x: px, z: NEAR - 2.2 };
      var frame = kit.screen(1180, 800, pw, at(px, py, NEAR - 0.06, Math.PI), 'Stay Frosty’s own page, on the wall beside the doorway', zone(pageStop.x, pageStop.z));

      // THE PAGE'S OWN WORDS, each standing on its ledge, and each showing only
      // while you stand at it, so the rock is clear from everywhere else.
      var spots = [
        { sel: '.lede', side: -1, z: 2.5, wide: 1.7, ww: 1.4, w: 680 },
        { sel: '.fro-ledge', n: 0, side: -1, z: 0.0, wide: 1.9, ww: 1.6, w: 760, h: 640 },
        { sel: '.fro-ledge', n: 2, side: -1, z: -2.8, wide: 1.9, ww: 1.6, w: 760, h: 700 },
        { sel: '.fro-ledge', n: 1, side: 1, z: 0.0, wide: 1.9, ww: 1.6, w: 760, h: 640 },
        { sel: '.fro-credit', side: 1, z: -2.8, wide: 1.7, ww: 1.4, w: 680 }
      ];
      var lifts = spots.map(function (sp) {
        var wall = onWall(sp.side, sp.z);
        ledge(wall, sp.wide);
        var sx = sp.side < 0 ? X0 + 2.0 : X1 - 2.0;
        var o = { w: sp.w, ww: sp.ww, m: stand(wall), zone: zone(sx, sp.z) };
        if (sp.n) o.n = sp.n;
        if (sp.h) o.h = sp.h;
        return kit.lift(frame, sp.sel, o);
      });
      // The thermometer, which is words and not a drawing, on the far wall's
      // ledge under the name; and the door's own words beside the door.
      var dialX = -1.6, doorX = 0.9;
      ledge(onFar(dialX), 2.0);
      var dial = kit.lift(frame, '.fro-dial', { w: 640, ww: 1.4, m: stand(onFar(dialX)), zone: zone(dialX, FAR + 2.2) });
      ledge(onFar(doorX), 1.4);
      var door = kit.lift(frame, '.fro-door', { w: 560, ww: 1.1, m: stand(onFar(doorX)), zone: zone(1.4, FAR + 2.4) });

      var stops = [
        { name: 'just in from the passage, the damp on every wall holding a point of the rail', x: -0.4, z: 2.9, yaw: 0, pitch: 0.06 },
        { name: 'at the ledge just inside on the left: a quiet place to chill', x: X0 + 2.0, z: 2.5, yaw: LEFT, pitch: 0.06, frame: lifts[0].el },
        { name: 'at the ledge on the left: why it is always the same down here', x: X0 + 2.0, z: 0.0, yaw: LEFT, pitch: 0.06, frame: lifts[1].el },
        { name: 'at the ledge on the right: who it is for', x: X1 - 2.0, z: 0.0, yaw: RIGHT, pitch: 0.06, frame: lifts[3].el },
        { name: 'at the ledge further along on the left: what never changes in here', x: X0 + 2.0, z: -2.8, yaw: LEFT, pitch: 0.06, frame: lifts[2].el },
        { name: 'at the ledge further along on the right: where the room’s words come from', x: X1 - 2.0, z: -2.8, yaw: RIGHT, pitch: 0.06, frame: lifts[4].el },
        { name: 'at the far wall, under the room’s name, at the thermometer, which is words', x: dialX, z: FAR + 2.2, yaw: 0, pitch: 0.1, frame: dial.el },
        { name: 'Stay Breezy', room: 'Stay Breezy', where: 'at the door at the back, shut, through to Stay Breezy, the hall of fans, its words beside it', x: 1.4, z: FAR + 2.4, yaw: 0, pitch: 0.06, page: 'stay-breezy.html', frame: door.el },
        { name: 'in the middle, looking up at the rock overhead, every bead of it holding a point of the rail', x: 0, z: -0.4, yaw: 0, pitch: 0.55 },
        { name: 'turned back to the doorway you came down through, the rail far up the slope beyond it', x: DX + 0.3, z: 1.2, yaw: Math.PI, pitch: 0.12 },
        { name: 'at the near wall beside the doorway, with the room’s own page on it', x: pageStop.x, z: pageStop.z, yaw: Math.PI, pitch: 0.04, page: kit.page, frame: frame }
      ];

      return {
        start: { x: -0.4, z: 2.9, yaw: 0 },
        bounds: { x: [X0 + 0.8, X1 - 0.8], z: [FAR + 0.8, NEAR - 0.6] },
        stops: stops
      };
    }
  };
})();

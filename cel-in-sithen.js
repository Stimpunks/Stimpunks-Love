/* =============================================================================
   Sithen, walked into on Cel Street: turning 02 off the Outskirts, a fairy fort
   standing in a field under a full moon.

   IT IS SITHEN'S WORLD AND NOBODY ELSE'S (§36): ONE OBJECT THAT YOU CIRCLE. A
   ring of banked earth with whitethorn growing on it, in an open field, lit by
   the moon from directly overhead, so everything is evenly silvered and what
   shadow there is goes straight down. Not the road it turns off, where a
   headlight is low and level and every sign has a bright face and no back.

   THE DOOR IS NOT OPENED, AND YOU DO NOT GO IN. There is no interior, no door
   into the mound and no flame: the field is walked all the way round the ring
   and kept out of it, which is what the page says and what the bounds do. If a
   door is ever opened here it is a room of its own behind this one.

   THERE IS NO GREEN IN IT ANYWHERE. Grass under a full moon has a brightness
   and not a colour, so every value is one of §36's on its grey-violet line:
   the field and the ring in the bank's earth, the thorn's dark lines, the
   blossom in bone. That is what holds it off the campgrounds, the other cold
   night ground, which is spruce and lichen.

   THE PAGE'S WORDS STAND ROUND THE RING on low panels of earth at its foot,
   each facing out to the track trodden round it, and each shows only while
   you stand at it, so the fort is not hidden behind words from anywhere else.
   Nothing here is from the Merry Gentry or October Daye books, and nothing
   tells anybody how to behave. Nothing moves. Every colour is one §36
   declares, by name. It keeps nothing, sends nothing and fetches nothing; its
   page arrives through Cel Street's screen().
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 7, 374761393) ^ Math.imul(j + 29, 668265263) ^ Math.imul(k + 31, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['sithen.html'] = {
    name: 'Sithen',
    from: 'the-outskirts.html',
    faces: ['"Italiana"', '"Literata"'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var CZ = -16;                 // the middle of the ring
      var BANK = 5.2;               // the ring of earth, to the middle of its bank
      var TRACK = 10;               // the track trodden round it
      var DEG = Math.PI / 180;
      function round(r, th) { return { x: Math.sin(th) * r, z: CZ + Math.cos(th) * r }; }

      // THE MOON, from directly overhead, and the night's own dark.
      kit.scene.background = kit.col('--sth-night');
      kit.scene.fog = new T.Fog(kit.col('--sth-night'), 40, 170);
      kit.scene.add(new T.HemisphereLight(kit.col('--sth-dim'), kit.col('--sth-night'), 0.9));
      var moon = new T.DirectionalLight(kit.col('--sth-bone'), 3.2);
      moon.position.set(0.6, 60, CZ + 0.4);
      moon.target.position.set(0, 0, CZ);
      moon.castShadow = true;
      moon.shadow.mapSize.set(2048, 2048);
      moon.shadow.camera.left = -24; moon.shadow.camera.right = 24;
      moon.shadow.camera.top = 24; moon.shadow.camera.bottom = -24;
      moon.shadow.camera.near = 1; moon.shadow.camera.far = 90;
      kit.scene.add(moon, moon.target);
      // The moon itself, high up: you see it when you look up.
      kit.flat(new T.CircleGeometry(2.6, 40), at(9, 44, CZ - 26, 0, 0.82), '--sth-bone');

      // THE FIELD: the bank's earth all the way to the dark, grass that is a
      // brightness and not a colour, and the track trodden round the ring.
      box(160, 0.1, 160, at(0, -0.05, CZ), '--sth-night', false, false);
      kit.flat(new T.RingGeometry(TRACK - 0.55, TRACK + 0.55, 72), at(0, 0.012, CZ, 0, -Math.PI / 2), '--sth-night');
      kit.flat(new T.PlaneGeometry(1.1, 9.4), at(0, 0.012, CZ + TRACK + 5.2, 0, -Math.PI / 2), '--sth-night');
      var blade = new T.ConeGeometry(0.018, 0.22, 3);
      for (var k = 0; k < 900; k++) {
        var tx = (hash(k, 1, 1) - 0.5) * 58, tz = CZ + (hash(k, 1, 2) - 0.5) * 50;
        var r = Math.hypot(tx, tz - CZ);
        if (r < BANK + 1.4 || Math.abs(r - TRACK) < 0.75 || (Math.abs(tx) < 0.8 && tz > CZ + TRACK)) continue;
        for (var bl = 0; bl < 3; bl++) {
          kit.piece(blade, at(tx + (bl - 1) * 0.05, 0.1, tz + (hash(k, bl, 9) - 0.5) * 0.06, hash(k, bl, 3) * 6, (bl - 1) * 0.35), '--sth-dim', false, false);
        }
      }

      // THE RING: one bank of earth, round and unbroken, with no way into it.
      var ring = new T.TorusGeometry(BANK, 1.05, 12, 64);
      ring.scale(1, 1, 0.58);
      kit.piece(ring, at(0, 0, CZ, 0, Math.PI / 2), '--sth-bank', 0.03);
      var inner = new T.TorusGeometry(BANK - 1.3, 0.26, 8, 64);
      inner.scale(1, 1, 0.5);
      kit.piece(inner, at(0, 0, CZ, 0, Math.PI / 2), '--sth-bank', 0.02);

      // WHITETHORN, growing on the bank: a dark stem, branches out of it, and
      // the blossom in bone at their ends. A thorn bush in the field is the
      // same thing with nothing out on it.
      var stick = new T.CylinderGeometry(0.035, 0.06, 1, 5);
      var bloom = new T.SphereGeometry(0.075, 6, 4);
      function branch(x0, y0, z0, x1, y1, z1, w) {
        var a = new T.Vector3(x0, y0, z0), b = new T.Vector3(x1, y1, z1), d = new T.Vector3().subVectors(b, a);
        var g = stick.clone(); g.scale(w, d.length(), w);
        var q = new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), d.clone().normalize());
        var m = new T.Matrix4().compose(new T.Vector3().addVectors(a, b).multiplyScalar(0.5), q, new T.Vector3(1, 1, 1));
        kit.piece(g, m, '--sth-thorn', false);
      }
      function thorn(x, y, z, h, seed, blossom) {
        branch(x, y, z, x, y + h * 0.55, z, 2.2);
        for (var b = 0; b < 6; b++) {
          var a = hash(seed, b, 1) * Math.PI * 2, up = 0.35 + hash(seed, b, 2) * 0.55, out = 0.35 + hash(seed, b, 3) * 0.55;
          var y0 = y + h * (0.3 + hash(seed, b, 4) * 0.25);
          var ex = x + Math.sin(a) * out * h * 0.6, ey = y0 + up * h * 0.6, ez = z + Math.cos(a) * out * h * 0.6;
          branch(x, y0, z, ex, ey, ez, 1.1);
          if (!blossom) continue;
          for (var f = 0; f < 4; f++) {
            kit.piece(bloom, at(ex + (hash(seed, b * 9 + f, 5) - 0.5) * 0.36, ey + (hash(seed, b * 9 + f, 6) - 0.3) * 0.26, ez + (hash(seed, b * 9 + f, 7) - 0.5) * 0.36), '--sth-bone', false, false);
          }
        }
      }
      for (k = 0; k < 13; k++) {
        var th = (k / 13) * Math.PI * 2 + (hash(k, 2, 1) - 0.5) * 0.3;
        var p = round(BANK + (hash(k, 2, 2) - 0.5) * 0.5, th);
        thorn(p.x, 0.45, p.z, 1.3 + hash(k, 2, 3) * 0.9, k + 20, true);
      }
      // The old one on the north of the bank, taller than the rest.
      var old = round(BANK, Math.PI);
      thorn(old.x, 0.5, old.z, 3.0, 99, true);
      // Thorn without blossom along the field's edge, and the field gate.
      for (k = 0; k < 34; k++) {
        var hx = -24 + k * 1.45 + (hash(k, 3, 1) - 0.5) * 0.4;
        if (Math.abs(hx) < 1.6) continue;
        thorn(hx, 0, CZ + TRACK + 10.4 + (hash(k, 3, 2) - 0.5) * 0.5, 1.4 + hash(k, 3, 3) * 0.6, k + 200, false);
      }
      for (k = 0; k < 30; k++) {
        var fa = (k / 30) * Math.PI * 2, fp = round(27 + hash(k, 4, 1) * 4, fa);
        if (fp.z > CZ + 18) continue;
        thorn(fp.x, 0, fp.z, 1.6 + hash(k, 4, 2), k + 400, false);
      }
      [-1, 1].forEach(function (s) { box(0.16, 1.3, 0.16, at(s * 1.25, 0.65, CZ + TRACK + 10.4), '--sth-thorn', 0.015); });

      // A PANEL OF EARTH at the ring's foot for every part of the page, facing
      // out to the track, and showing only while you stand at it.
      var R = BANK + 2.25;
      function zone(st) { return [st.x - 3.1, st.x + 3.1, st.z - 3.1, st.z + 3.1]; }
      function panel(deg) {
        var th = deg * DEG, p = round(R, th);
        box(1.9, 0.26, 0.5, at(p.x, 0.13, p.z, th), '--sth-bank', 0.02);
        var st = round(TRACK, th);
        return { m: at(p.x, 0.27, p.z, th), stop: { x: st.x, z: st.z, yaw: th, pitch: -0.02 } };
      }

      // THE ROOM'S OWN PAGE, on a board at the field gate.
      var pgw = 2.4, pgh = pgw * 800 / 1180, pgx = -3.2, pgz = CZ + TRACK + 7.6, pgy = 0.45 + pgh / 2;
      [-1, 1].forEach(function (s) { box(0.12, pgy + pgh / 2 + 0.1, 0.12, at(pgx + s * (pgw / 2 + 0.1), (pgy + pgh / 2 + 0.1) / 2, pgz - 0.08), '--sth-thorn', 0.015); });
      box(pgw + 0.2, pgh + 0.2, 0.06, at(pgx, pgy, pgz - 0.06), '--sth-bank', 0.02);
      var gateStop = { x: pgx, z: pgz + 2.5, yaw: 0, pitch: 0.04 };
      var frame = kit.screen(1180, 800, pgw, at(pgx, pgy, pgz), 'Sithen’s own page, on a board at the field gate', zone(gateStop));

      var parts = [
        { deg: 22, sel: '.mound', o: { drop: '.mound__art' }, w: 760, ww: 1.8, name: 'at the panel by the track in from the gate: the name, and what it means', where: 'at the panel nearest the gate, the ring rising behind it: the name' },
        { deg: 56, sel: '.lede', w: 720, ww: 1.8, name: 'a little way round: the ring that is walked round and not gone into', where: 'a little way round the ring, at the panel saying it is walked round and not gone into' },
        { deg: 92, sel: '.bank', o: { n: 0 }, w: 760, ww: 1.9, h: 700, name: 'on the east of the ring: what the name is, and whose it is not', where: 'on the east of the ring, at the panel on the name and whose it is not' },
        { deg: 124, sel: '.ring__intro', o: { n: 0 }, w: 720, ww: 1.7, name: 'round towards the north: the ground, which is documented', where: 'round towards the north, at the panel saying the next part is earthworks and a motorway' },
        { deg: 156, sel: '.dugs', w: 760, ww: 1.9, h: 720, name: 'nearly at the north: what is dug and recorded', where: 'nearly at the north of the ring, at the panel of what is dug and recorded' },
        { deg: 188, sel: '.bank', o: { n: 1 }, w: 760, ww: 1.9, h: 700, name: 'at the north, under the old whitethorn: a country that routes around a tree', where: 'at the north of the ring, the old whitethorn above the panel: a country that routes around a tree' },
        { deg: 222, sel: '.ring__intro', o: { n: 1 }, w: 720, ww: 1.8, h: 700, name: 'round towards the west: the rules, which nobody will say out loud', where: 'round towards the west, at the panel saying what the rules are and whose the words beside them are' },
        { deg: 256, sel: '.taboos', w: 760, ww: 2.1, h: 760, name: 'on the west of the ring: the rules, each with where it comes from', where: 'on the west of the ring, at the long panel of the rules, each with where it comes from and what it is like' },
        { deg: 292, sel: '.bank', o: { n: 2 }, w: 760, ww: 1.9, h: 700, name: 'round towards the gate again: why the door is not opened', where: 'round towards the gate again, at the panel on why the door is not opened' },
        { deg: 326, sel: '.creditors', w: 760, ww: 1.9, h: 700, name: 'nearly back at the track: what pointed us here, and what is not in this room', where: 'nearly back at the track in, at the panel on what pointed us here and what is not in this room' }
      ];
      var stops = [
        { name: 'in at the field gate, the ring ahead on its own in the moonlight', where: 'in at the field gate, the ring of earth and whitethorn ahead under the moon', x: 0, z: CZ + TRACK + 8.6, yaw: 0, pitch: 0.06 },
        { name: 'at the board by the field gate, with Sithen’s own page on it', x: gateStop.x, z: gateStop.z, yaw: 0, pitch: gateStop.pitch, page: kit.page, frame: frame }
      ];
      parts.forEach(function (pt) {
        var pn = panel(pt.deg), o = { w: pt.w, ww: pt.ww, m: pn.m, zone: zone(pn.stop) };
        if (pt.h) o.h = pt.h;
        for (var key in (pt.o || {})) o[key] = pt.o[key];
        var it = kit.lift(frame, pt.sel, o);
        stops.push({ name: pt.name, where: pt.where, x: pn.stop.x, z: pn.stop.z, yaw: pn.stop.yaw, pitch: pn.stop.pitch, frame: it.el });
      });
      stops.push({ name: 'looking up from the track, at the full moon over the ring', x: 0, z: CZ + TRACK, yaw: 0, pitch: 0.7 });

      // You walk the field and the track round the ring, and not into it.
      var IN = BANK + 1.8, OUT = 22;
      return {
        start: { x: 0, z: CZ + TRACK + 8.6, yaw: 0 },
        bounds: {
          areas: [
            { x: [-OUT, OUT], z: [CZ + IN, CZ + TRACK + 9.6] },
            { x: [-OUT, OUT], z: [CZ - OUT, CZ - IN] },
            { x: [-OUT, -IN], z: [CZ - OUT, CZ + TRACK + 9.6] },
            { x: [IN, OUT], z: [CZ - OUT, CZ + TRACK + 9.6] }
          ]
        },
        stops: stops
      };
    }
  };
})();

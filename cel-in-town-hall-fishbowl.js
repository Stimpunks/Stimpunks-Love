/* =============================================================================
   The Fishbowl, walked into on Cel Street, through its door off the Town Hall's
   rotunda. Ryan's ask, 2026-11-01: the rooms behind the doors.

   YOU ARE IN THE BOWL (§78). A round glass bowl of water on a sunny sill, drawn
   big enough to stand in: the gravel under your feet, the glass curving out and
   up all round you to a rim far overhead, the water's face above that, and
   outside the glass the sill, pale, going off into the colour of looking through
   water. On the gravel is the ring of stones with ONE GAP IN IT, which is the
   seat kept empty, and you come in through it; round the foot of the glass,
   outside, on the sill, is the wider ring of shells. A goldfish hangs in the
   water and is not going anywhere.

   THE LIGHT IS BENT. The sun comes in from the left, through the water, and
   lands on the gravel and on the sill to the right as bright tangled lines,
   drawn once and still: no other room is lit by refraction. Every word is the
   page's, lifted off it and stood on the gravel on the pale water it was set
   on, dark on pale, round the back of the bowl; the circle itself (the call)
   stays on the page, because the CB talks there, and nobody is drawn in here.

   ITS PARENT IS A ROUND STONE HALL IN SHADE with one hard disc of sun on the
   floor; this is pale, wet and glass, and the light is a tangle, not a disc.
   Every colour is one §78 declares, by name, and nothing moves. It keeps
   nothing, sends nothing and asks for nothing; its page arrives through Cel
   Street's screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j) {
    var n = Math.imul(i + 7, 374761393) ^ Math.imul(j + 11, 668265263);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['town-hall-fishbowl.html'] = {
    name: 'The Fishbowl',
    from: 'town-hall.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var C = { x: 0, z: -5.6 }, FOOT = 4.6;

      // THE WATER all round, and the sun from the left.
      kit.scene.background = kit.col('--fb-water');
      kit.scene.fog = new T.Fog(kit.col('--fb-water'), 16, 44);
      kit.scene.add(new T.HemisphereLight(kit.col('--fb-water'), kit.col('--fb-gravel'), 2.3));
      var sun = new T.DirectionalLight(kit.col('--fb-caustic'), 1.7);
      sun.position.set(-16, 11, C.z + 2);
      sun.target.position.set(0, 0, C.z);
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      sun.shadow.camera.left = -14; sun.shadow.camera.right = 14;
      sun.shadow.camera.top = 14; sun.shadow.camera.bottom = -14;
      sun.shadow.camera.near = 1; sun.shadow.camera.far = 50;
      sun.shadow.bias = -0.0008; sun.shadow.normalBias = 0.04;
      kit.scene.add(sun, sun.target);

      // THE SILL AND THE GRAVEL, one sheet: the sill all over, the bowl's gravel
      // in the middle of it, and the sun bent by the water into bright tangled
      // lines on the gravel and out across the sill to the right.
      var SPAN = 40, PX = 2048, K = PX / SPAN;
      var floor = kit.paper(PX, PX, function (g, w, h) {
        var cx = w / 2, cy = h / 2 + (C.z + 5.6) * K;
        g.fillStyle = kit.ink('--fb-sill'); g.fillRect(0, 0, w, h);
        g.fillStyle = kit.ink('--fb-gravel');
        g.beginPath(); g.arc(cx, cy, FOOT * K, 0, Math.PI * 2); g.fill();
        // The gravel's grains, in the stones' grey.
        g.fillStyle = kit.ink('--fb-stone');
        for (var i = 0; i < 1400; i++) {
          var r = Math.sqrt(hash(i, 1)) * (FOOT - 0.1) * K, a = hash(i, 2) * Math.PI * 2;
          g.beginPath(); g.arc(cx + r * Math.cos(a), cy + r * Math.sin(a), 1.5 + hash(i, 3) * 3, 0, Math.PI * 2); g.fill();
        }
        // The caustics: loose loops of light, each a few strokes that cross.
        g.strokeStyle = kit.ink('--fb-caustic'); g.lineCap = 'round'; g.lineJoin = 'round';
        function tangle(x0, y0, rx, ry, n, seed, lw) {
          for (var k = 0; k < n; k++) {
            g.lineWidth = lw * (0.6 + hash(seed + k, 4) * 0.8);
            var x = x0 + (hash(seed + k, 5) - 0.5) * rx * 2, y = y0 + (hash(seed + k, 6) - 0.5) * ry * 2;
            g.beginPath(); g.moveTo(x, y);
            for (var s = 0; s < 4; s++) {
              var nx = x + (hash(seed + k, 10 + s) - 0.5) * 120, ny = y + (hash(seed + k, 20 + s) - 0.5) * 120;
              g.quadraticCurveTo(x + (hash(seed + k, 30 + s) - 0.5) * 140, y + (hash(seed + k, 40 + s) - 0.5) * 140, nx, ny);
              x = nx; y = ny;
            }
            g.stroke();
          }
        }
        tangle(cx + 0.6 * K, cy, 2.8 * K, 3.0 * K, 70, 100, 6);
        tangle(cx + 7.4 * K, cy - 0.4 * K, 2.6 * K, 2.4 * K, 46, 300, 7);
      });
      kit.sheet(floor, SPAN, SPAN, at(0, 0, C.z, 0, -Math.PI / 2));

      // THE WINDOW the sun comes in by, off to the left beyond the sill: the
      // day in its panes, white as the light the water bends, its bars the
      // sill's own paint.
      var WX = -13;
      kit.flat(new T.PlaneGeometry(10, 8), at(WX, 4.6, C.z, Math.PI / 2), '--fb-caustic');
      [-5, -2.5, 0, 2.5, 5].forEach(function (dz) { box(0.25, 8.3, 0.25, at(WX + 0.1, 4.6, C.z + dz), '--fb-sill', 0.02); });
      [0.5, 4.6, 8.7].forEach(function (yy) { box(0.25, 0.25, 10.3, at(WX + 0.1, yy, C.z), '--fb-sill', 0.02); });

      // THE GLASS: a round bowl, the foot on the gravel's edge, out to its
      // widest at head height and in again to a lip far overhead. Seen through.
      var prof = [[FOOT, 0], [5.9, 0.8], [6.9, 2.0], [7.2, 3.6], [6.9, 5.2], [6.0, 6.8], [5.0, 8.0], [4.7, 8.6], [4.95, 8.95]];
      var glass = kit.flat(new T.LatheGeometry(prof.map(function (p) { return new T.Vector2(p[0], p[1]); }), 72), at(C.x, 0, C.z), '--fb-glass');
      glass.material.transparent = true; glass.material.opacity = 0.2;
      glass.material.side = T.DoubleSide; glass.material.depthWrite = false;
      // Its foot and its lip, where the glass is thick enough to see.
      kit.piece(new T.TorusGeometry(FOOT + 0.04, 0.07, 8, 96), at(C.x, 0.05, C.z, 0, Math.PI / 2), '--fb-glass', false);
      kit.piece(new T.TorusGeometry(4.95, 0.14, 8, 96), at(C.x, 8.95, C.z, 0, Math.PI / 2), '--fb-glass', false);
      // The sun's own streak on the glass on the left, where it comes in.
      function rAt(y) {
        for (var i = 1; i < prof.length; i++) {
          if (y <= prof[i][1]) { var t = (y - prof[i - 1][1]) / (prof[i][1] - prof[i - 1][1]); return prof[i - 1][0] + t * (prof[i][0] - prof[i - 1][0]); }
        }
        return prof[prof.length - 1][0];
      }
      var streak = [];
      for (var y = 1.4; y <= 5.8; y += 0.4) {
        var rr = rAt(y) - 0.08;
        streak.push(new T.Vector3(-rr * 0.96, y, rr * 0.27));
      }
      kit.piece(new T.TubeGeometry(new T.CatmullRomCurve3(streak), 40, 0.07, 6), at(C.x, 0, C.z), '--fb-caustic', false, false);

      // THE WATER'S FACE overhead, a shade deeper, seen from under it.
      var face = kit.flat(new T.CircleGeometry(rAt(7.4) - 0.05, 72), at(C.x, 7.4, C.z, 0, Math.PI / 2), '--fb-shallow');
      face.material.transparent = true; face.material.opacity = 0.55;
      face.material.side = T.DoubleSide; face.material.depthWrite = false;

      // THE RING OF STONES on the gravel, with one gap: the seat kept empty,
      // at the front, towards the door you came in by.
      var STONE = new T.SphereGeometry(0.42, 14, 10);
      for (var s = 1; s < 10; s++) {
        var a = s * Math.PI * 2 / 10;   // 0, the gap, is towards the door
        var g = STONE.clone(); g.scale(1 + hash(s, 7) * 0.2, 0.52, 0.85);
        kit.piece(g, at(C.x + 2.0 * Math.sin(a), 0.2, C.z + 2.0 * Math.cos(a), a + hash(s, 8)), '--fb-stone');
      }

      // THE RING OF SHELLS outside the glass, round its foot on the sill.
      var SHELL = new T.SphereGeometry(0.34, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2);
      for (var h = 0; h < 18; h++) {
        var b = h * Math.PI * 2 / 18 + 0.09;
        var sg = SHELL.clone(); sg.scale(1.2, 0.5, 0.75);
        kit.piece(sg, at(C.x + 5.5 * Math.sin(b), 0, C.z + 5.5 * Math.cos(b), b), '--fb-shell');
      }

      // THE GOLDFISH, hanging still in the water over the ring, side on to the door.
      var fx = -0.6, fy = 2.6, fz = C.z - 2.4, fyaw = 0.25;
      var body = new T.SphereGeometry(0.36, 16, 12); body.scale(1.7, 1, 0.75);
      kit.piece(body, at(fx, fy, fz, fyaw), '--fb-gold');
      var tail = new T.ConeGeometry(0.34, 0.6, 12); tail.rotateZ(-Math.PI / 2); tail.scale(1, 1, 0.3);
      kit.piece(tail, at(fx - 0.82 * Math.cos(fyaw), fy, fz + 0.82 * Math.sin(fyaw), fyaw), '--fb-gold');
      var eye = new T.SphereGeometry(0.055, 8, 6);
      kit.piece(eye, at(fx + 0.42 * Math.cos(fyaw) + 0.12 * Math.sin(fyaw), fy + 0.1, fz - 0.42 * Math.sin(fyaw) + 0.12 * Math.cos(fyaw)), '--fb-ink', false);

      // THE DOOR FROM THE TOWN HALL, standing on its own on the gravel at the
      // front of the bowl, a frame of the stones' grey round the hall's shade.
      var DZ = C.z + 3.7, DW = 1.2, DH = 2.4;
      kit.flat(new T.PlaneGeometry(DW, DH), at(0, DH / 2, DZ, Math.PI), '--fb-ink');
      [-1, 1].forEach(function (e) { box(0.1, DH + 0.05, 0.12, at(e * (DW / 2 + 0.05), (DH + 0.05) / 2, DZ), '--fb-stone', 0.012); });
      box(DW + 0.3, 0.1, 0.12, at(0, DH + 0.08, DZ), '--fb-stone', 0.012);

      // THE ROOM'S OWN PAGE, standing on the gravel beside the door, facing in.
      var pw = 2.0, ph = pw * 800 / 1180, px = 2.0, py = 0.35 + ph / 2, pz = C.z + 3.1, PY = Math.PI + 0.3;
      box(pw + 0.1, ph + 0.1, 0.05, at(px - 0.04 * Math.sin(PY), py, pz - 0.04 * Math.cos(PY), PY), '--fb-glass', 0.01);
      var frame = kit.screen(1180, 800, pw, at(px, py, pz, PY), 'The Fishbowl’s own page, standing beside the door');

      // THE PAGE'S WORDS, lifted off it, standing on the gravel round the back
      // of the bowl, each on the pale water it was set on, facing the middle.
      // The circle itself, the call, stays on the page.
      var R = 3.55, words = [
        { n: 0, a: -1.15, name: 'how a fishbowl goes' },
        { n: 1, a: -0.4, name: 'how it goes here' },
        { n: 3, a: 0.4, name: 'why a bowl on a sill' },
        { n: 4, a: 1.15, name: 'whose words' }
      ];
      words.forEach(function (w) {
        var wx = C.x + R * Math.sin(w.a), wz = C.z - R * Math.cos(w.a);
        w.it = kit.lift(frame, '.fb-part', { n: w.n, w: 700, ww: 1.9, m: at(wx, 0.08, wz, -w.a) });
        box(1.95, 0.06, 0.14, at(wx, 0.03, wz, -w.a), '--fb-glass', false, false);
      });

      var stops = [
        { name: 'just through the door from the Town Hall, the gap in the ring of stones in front of you', x: 0, z: C.z + 3.0, yaw: 0, pitch: 0.1 },
        { name: 'in the gap in the ring of stones, the seat kept empty', x: 0, z: C.z + 2.0, yaw: 0, pitch: 0.05 },
        { name: 'in the middle of the ring of stones, the water’s face far overhead', x: 0, z: C.z + 0.8, yaw: 0, pitch: 0.14 }
      ];
      words.forEach(function (w) {
        var back = 0.45;
        stops.push({ name: 'at ' + w.name + ', stood on the gravel at the back of the bowl',
          x: C.x + back * Math.sin(w.a), z: C.z - back * Math.cos(w.a), yaw: -w.a, pitch: -0.32, frame: w.it.el });
      });
      stops.push({ name: 'at the glass on the left, where the sun comes in through the water', x: -3.4, z: C.z, yaw: Math.PI / 2, pitch: 0.02 });
      stops.push({ name: 'at the glass on the right, the shells and the bent sunlight on the sill outside', x: 3.3, z: C.z + 0.4, yaw: -Math.PI / 2, pitch: -0.3 });
      stops.push({ name: 'back at the door, with the room’s own page beside it', x: px + 2.4 * Math.sin(PY), z: pz + 2.4 * Math.cos(PY), yaw: PY, pitch: -0.2, page: kit.page, frame: frame });

      return {
        start: { x: 0, z: C.z + 3.0, yaw: 0 },
        bounds: { areas: [
          { x: [-1.4, 1.4], z: [C.z - 3.9, C.z + 3.4] },
          { x: [-3.9, 3.9], z: [C.z - 1.6, C.z + 1.6] },
          { x: [-2.9, 2.9], z: [C.z - 3.0, C.z + 2.9] }
        ] },
        stops: stops
      };
    }
  };
})();

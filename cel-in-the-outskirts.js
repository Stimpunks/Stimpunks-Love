/* =============================================================================
   The Outskirts, walked into on Cel Street: past the last streetlight at the
   far end of the road, where the kerb gives up and becomes a verge.

   IT IS THE ROAD'S WORLD AND NOBODY ELSE'S (§34): a road seen from ON it, at
   eye level, at night, LIT BY HEADLIGHTS. Your own car is stopped behind you
   with its lights on, low and level and close, so every sign has one bright
   face and no back, every post throws its shadow away down the road, and the
   road goes black an inch past the beam. The light is yours and you have
   stopped, so it does not sweep, and nothing else on the road moves either.
   NOTHING IN IT IS BLUE: the only colours are the beam and the paint, bone,
   dead khaki and a rust red. It is not the campgrounds (a field lit by
   nothing, the sky on it, posts routed by a machine) and it is not Danny the
   Street (a road seen from directly above under sodium, with nothing standing
   up in it).

   A PAINTED SIGN FOR EVERY TURNING, at the mouth of its side road, in the order
   the page's own board has them: painted once by whoever owned the premises,
   leaning a little in the weeds. These are placed by hand from the page as it
   stood on 2026-11-01 (the board is read by nothing here), so a new turning on
   the page is a new sign here at the next run of tools/make-cel-street.py, which
   writes TURNINGS between the cel:turnings markers off the page's own board,
   never by hand. A turning with no road behind it yet
   keeps a dashed edge round its board and its words are never dimmed. A sign
   is not the room it points at: each carries words and nothing else, and a
   turning built for Cel Street opens off its sign.

   NOBODY WAS SENT OUT HERE. What is down these turnings is here because this
   is where it is, which the page says in its own words on the verge.

   Every colour is one the road declares, by name. It keeps nothing, sends
   nothing and fetches nothing; its page arrives through Cel Street's screen().
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 7, 374761393) ^ Math.imul(j + 29, 668265263) ^ Math.imul(k + 31, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  // The turnings, as the page's board has them. state 'raising' is a turning
  // with no road behind it yet: a dashed board, its words at full strength.
  // cel:turnings:begin
  var TURNINGS = [{"no": "TURNING 01", "name": "Black Leather Lagoon", "page": "black-leather-lagoon.html", "state": ""}, {"no": "TURNING 02", "name": "Sithen", "page": "sithen.html", "state": ""}, {"no": "TURNING 03", "name": "Looming Rocks Amphitheatre", "page": "looming-rocks.html", "state": ""}, {"no": "TURNING 04", "name": "Dance, Punks", "page": "dance-punks.html", "state": ""}, {"no": "TURNING 05", "name": "The Small Hours", "page": "small-hours.html", "state": ""}, {"no": "TURNING 06", "name": "The Repeater", "page": "repeater.html", "state": ""}, {"no": "TURNING 07", "name": "Nothing For Sale", "page": "nothing-for-sale.html", "state": ""}, {"no": "TURNING 08", "name": "Rebellion Rave Room", "page": "rebellion-rave-room.html", "state": ""}, {"no": "TURNING 09", "name": "The Haunted House", "page": "haunted-house.html", "state": ""}];
  // cel:turnings:end

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['the-outskirts.html'] = {
    name: 'The Outskirts',
    faces: ['"Bowlby One SC"'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var HALF = 3;                 // half the road
      var FIRST = -8, STEP = 5.4;   // where the turnings start, and how far apart
      var END = FIRST - STEP * (TURNINGS.length - 1) - 8;

      // THE NIGHT, AND ONLY AS MUCH OF IT AS THE BEAM REACHES. A breath of the
      // dim so the near verge is not a hole, and black a little way on.
      kit.scene.background = kit.col('--osk-night');
      kit.scene.fog = new T.Fog(kit.col('--osk-night'), 22, 70);
      kit.scene.add(new T.HemisphereLight(kit.col('--osk-dim'), kit.col('--osk-night'), 0.22));

      // YOUR HEADLIGHTS, behind you, low and level, both aimed down the road.
      // One throws the shadows; both light the faces.
      [-0.72, 0.72].forEach(function (x, k) {
        var lamp = new T.SpotLight(kit.col('--osk-beam'), 150, 78, 0.5, 0.55, 1.0);
        lamp.position.set(x, 0.8, 4.6);
        lamp.target.position.set(x * 0.6, 0.5, -60);
        if (k === 0) {
          lamp.castShadow = true;
          lamp.shadow.mapSize.set(1024, 1024);
          lamp.shadow.bias = -0.0006; lamp.shadow.normalBias = 0.02;
        }
        kit.scene.add(lamp, lamp.target);
      });

      // THE CAR, stopped behind you with its lights on: you see it if you turn
      // round, a dark body and two lamps.
      box(1.9, 0.75, 3.6, at(0, 0.62, 6.6), '--osk-board');
      box(1.6, 0.6, 1.8, at(0, 1.3, 7.1), '--osk-board');
      [-0.72, 0.72].forEach(function (x) {
        kit.flat(new T.CircleGeometry(0.15, 16), at(x, 0.72, 4.79, Math.PI), '--osk-beam');
        kit.cyl(0.33, 0.33, 0.24, at(x * 1.15, 0.33, 5.4, 0, 0, Math.PI / 2), '--osk-night', false, 12);
        kit.cyl(0.33, 0.33, 0.24, at(x * 1.15, 0.33, 7.9, 0, 0, Math.PI / 2), '--osk-night', false, 12);
      });

      // THE GROUND either side of the road, and the road itself: no kerb, no
      // pavement, its edge broken where the verge has had it.
      box(120, 0.1, 140, at(0, -0.06, -40), '--osk-night', false, false);
      box(HALF * 2, 0.06, 6 - END + 70, at(0, -0.01, (6 + END - 70) / 2), '--osk-board', false, false);
      for (var z = 4; z > END - 30; z -= 4.2) {
        if (hash(Math.round(z * 10), 1, 1) < 0.3) continue;
        kit.flat(new T.PlaneGeometry(0.14, 2.0), at(0, 0.03, z, 0, -Math.PI / 2), '--osk-dim');
      }
      for (var k = 0; k < 60; k++) {
        var ez = 4 - hash(k, 2, 1) * (4 - END + 20), es = k % 2 ? 1 : -1;
        var bite = new T.CircleGeometry(0.3 + hash(k, 2, 2) * 0.5, 7);
        kit.flat(bite, at(es * (HALF - 0.1 + hash(k, 2, 3) * 0.2), 0.035, ez, 0, -Math.PI / 2), '--osk-night');
      }

      // THE TURNINGS: a side road going off into the dark at each, and at its
      // mouth the sign, standing in the weeds with its face to the beam.
      function board(t) {
        return kit.paper(720, 420, function (c, w, h) {
          c.fillStyle = kit.ink('--osk-board'); c.fillRect(0, 0, w, h);
          c.strokeStyle = kit.ink('--osk-rust'); c.lineWidth = 9;
          if (t.state === 'raising') c.setLineDash([26, 18]);
          c.strokeRect(14, 14, w - 28, h - 28);
          c.setLineDash([]);
          c.textAlign = 'center'; c.textBaseline = 'alphabetic';
          c.fillStyle = kit.ink('--osk-rust');
          c.font = '44px "Bowlby One SC"'; c.fillText(t.no, w / 2, 98);
          c.fillStyle = kit.ink('--osk-beam');
          var size = 78, lines;
          do {
            c.font = size + 'px "Bowlby One SC"';
            lines = [];
            var line = '';
            t.name.split(' ').forEach(function (word) {
              var tryLine = line ? line + ' ' + word : word;
              if (c.measureText(tryLine).width > w - 90 && line) { lines.push(line); line = word; } else line = tryLine;
            });
            lines.push(line);
            size -= 4;
          } while (lines.length * size * 1.12 > h - 210 && size > 30);
          size += 4;
          var top = 124, room = h - 80 - top, block = lines.length * size * 1.12;
          lines.forEach(function (l, i) { c.fillText(l, w / 2, top + (room - block) / 2 + size * 0.92 + i * size * 1.12); });
          c.fillStyle = kit.ink('--osk-rust'); c.fillRect(w / 2 - 70, h - 66, 140, 10);
        });
      }
      var tuft = new T.ConeGeometry(0.03, 0.42, 3);
      function weeds(cx, cz, spread, n, seed) {
        for (var q = 0; q < n; q++) {
          var wx = cx + (hash(q, seed, 1) - 0.5) * spread, wz = cz + (hash(q, seed, 2) - 0.5) * spread;
          for (var b = 0; b < 3; b++) kit.piece(tuft.clone(), at(wx + (b - 1) * 0.06, 0.2, wz + (b % 2) * 0.05, 0, (b - 1) * 0.35, (b - 1) * 0.35), '--osk-weed', false);
        }
      }
      var stops = [];
      TURNINGS.forEach(function (t, i) {
        var side = i % 2 ? 1 : -1, tz = FIRST - i * STEP;
        // The side road, off into the dark.
        box(18, 0.05, 3.2, at(side * (HALF + 9), -0.015, tz - 1.9), '--osk-board', false, false);
        // The sign: two posts, the painted board, leaning a little.
        var lean = (hash(i, 3, 1) - 0.5) * 0.08, turn = side * (0.35 + hash(i, 3, 2) * 0.15);
        var g = at(side * (HALF + 1.6), 0, tz, -turn, 0, lean);
        [-0.85, 0.85].forEach(function (o) { box(0.12, 2.3, 0.12, M(g, at(o, 1.15, -0.06)), '--osk-dim'); });
        box(1.9, 1.12, 0.08, M(g, at(0, 1.75, -0.02)), '--osk-board');
        kit.sheet(board(t), 1.8, 1.05, M(g, at(0, 1.75, 0.03)));
        weeds(side * (HALF + 1.6), tz, 2.4, 22, 40 + i);
        var front = new T.Vector3(0, 0, 3.0).applyMatrix4(g);
        var fx = Math.max(-HALF + 0.6, Math.min(HALF - 0.6, front.x));
        stops.push({ name: t.name, where: 'at the sign for ' + t.no.toLowerCase() + ', ' + t.name,
                     page: t.page, x: fx, z: tz + 2.2, yaw: Math.atan2(-(side * (HALF + 1.6) - fx), -(tz - (tz + 2.2))), pitch: 0.1 });
      });
      // The verge all the way along, weeds and stones.
      for (k = 0; k < 340; k++) {
        var vs = k % 2 ? 1 : -1, vx = vs * (HALF + 0.4 + hash(k, 5, 1) * 7), vz = 4 - hash(k, 5, 2) * (4 - END + 10);
        kit.piece(tuft.clone(), at(vx, 0.2, vz, 0, (hash(k, 5, 3) - 0.5) * 0.6, (hash(k, 5, 4) - 0.5) * 0.6), '--osk-weed', false);
      }
      for (k = 0; k < 30; k++) {
        var rock = new T.DodecahedronGeometry(0.18 + hash(k, 6, 1) * 0.3, 0); rock.scale(1, 0.55, 1);
        var rs = k % 2 ? 1 : -1;
        kit.piece(rock, at(rs * (HALF + 0.8 + hash(k, 6, 2) * 6), 0.08, 2 - hash(k, 6, 3) * (2 - END), k), '--osk-dim', 0.02);
      }

      // THE ROAD'S OWN PAGE, on a board on the right at the verge's edge,
      // where you came in.
      var pw = 2.6, ph = pw * 800 / 1180, py = 0.85 + ph / 2;
      var pg = at(HALF + 1.4, 0, -1.6, RIGHT);
      box(pw + 0.2, ph + 0.2, 0.08, M(pg, at(0, py, -0.06)), '--osk-board');
      [-pw / 2, pw / 2].forEach(function (x) { box(0.12, py + ph / 2, 0.12, M(pg, at(x, (py + ph / 2) / 2, -0.12)), '--osk-dim'); });
      weeds(HALF + 1.4, -1.6, 2.6, 18, 90);
      var page = kit.screen(1180, 800, pw, M(pg, at(0, py, 0)), 'The Outskirts’ own page, on a board at the verge where you came in');

      // THE PAGE'S OWN WORDS, painted up at the verge as the page has them.
      function notice(x, z, rot, h) {
        var g = at(x, 0, z, rot);
        box(2.3, h + 0.2, 0.08, M(g, at(0, 0.8 + h / 2, -0.06)), '--osk-board');
        [-1.05, 1.05].forEach(function (o) { box(0.1, 0.8 + h, 0.1, M(g, at(o, (0.8 + h) / 2, -0.12)), '--osk-dim'); });
        weeds(x, z, 2, 12, Math.round(z * 7) + 200);
        return M(g, at(0, 0.8, 0));
      }
      var lede = kit.lift(page, '.lede', { w: 640, ww: 2.0, m: notice(-(HALF + 1.4), -1.4, LEFT, 1.5) });
      var out = kit.lift(page, '.verge', { n: 0, w: 680, h: 560, ww: 2.0, m: notice(HALF + 1.4, -5.2, RIGHT, 1.7) });
      var foot = kit.lift(page, '.verge--foot', { w: 680, h: 560, ww: 2.0, m: notice(-(HALF + 1.4), END + 4, LEFT, 1.7) });

      // THE PLACES: where you stopped, the page, the words at the verge, every
      // turning in the board's order, and the end of what the beam reaches.
      stops.unshift(
        { name: 'on the road past the last streetlight, your headlights on it from behind', where: 'on the road, in your headlights', x: 0, z: 2.6, yaw: 0, pitch: 0.04 },
        { name: 'at the board where you came in, the road’s own page on it', where: 'at the road’s own page', x: HALF - 1.2, z: -1.6, yaw: RIGHT, pitch: 0.06, page: kit.page, frame: page },
        { name: 'at the painted notice on the left, where the kerb gives up', where: 'at the notice where the kerb gives up', x: -(HALF - 1.2), z: -1.4, yaw: LEFT, pitch: 0.12, frame: lede.el },
        { name: 'at the notice on the right: what is out here', where: 'at the notice on what is out here', x: HALF - 1.2, z: -5.2, yaw: RIGHT, pitch: 0.08, frame: out.el }
      );
      stops.push({ name: 'at the last notice, on the unlit signs, where the beam runs out', where: 'where the beam runs out', x: -(HALF - 1.2), z: END + 4, yaw: LEFT, pitch: 0.08, frame: foot.el });

      return {
        start: { x: 0, z: 2.6, yaw: 0 },
        bounds: { x: [-(HALF - 0.4), HALF - 0.4], z: [END + 1, 3.2] },
        stops: stops
      };
    }
  };
})();

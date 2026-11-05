/* =============================================================================
   The Campgrounds, walked into on Cel Street. Ryan's ask, 2026-10-31: past the
   treeline at the stoop's end of the street, through the gap in the trees.

   IT IS THE FIELD'S WORLD AND NOBODY ELSE'S (§13): cold dusk under nothing,
   night-blue rather than night-black, bone lettering routed into bark like a
   park sign, and posts standing alone on open ground. LIT BY NOTHING: no lamp,
   no sun, no lit window, nothing casting anything, everything evenly dim, and
   you can see all the way to the treeline. The pond lies between pitches 01,
   05 and 03, the stream is the boundary, and the mountain stands over the far
   side with the cable car going up from the pond.

   EVERY POST IS A PITCH ON THE BOARD, read off campgrounds.html by
   tools/make-cel-street.py and written between the cel:pitches markers, in the
   board's order, never by hand. A sign is not the room it points at, so the
   posts carry words and nothing else: what is pitched behind each one is that
   room's own world, and the ones built for Cel Street open off their post.
   The field's own page stands on the trailhead board by the gap.

   NOTHING MOVES, at any setting, as nothing on the field does. Every colour is
   one the field declares, by name. It keeps nothing, sends nothing and fetches
   nothing; its page arrives through Cel Street's screen().
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 7, 374761393) ^ Math.imul(j + 29, 668265263) ^ Math.imul(k + 31, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['campgrounds.html'] = {
    name: 'The Campgrounds',
    faces: ['"Alfa Slab One"', '"Bitter"'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      // cel:pitches:begin
      var PITCHES = [{"no": "THE SUMMIT", "name": "The Emergent Future Worlds Meets Mountain Man", "page": "the-mountain-cabin.html", "state": "summit"}, {"no": "PITCH 01", "name": "The Faery Yurt", "page": "faery-yurt.html", "state": ""}, {"no": "PITCH 05", "name": "The Bough House", "page": "the-bough-house.html", "state": ""}, {"no": "PITCH 02", "name": "Swaying Sweetgrass", "page": "swaying-sweetgrass.html", "state": ""}, {"no": "PITCH 03", "name": "The Solarpunk Hermitage", "page": "solarpunk-hermitage.html", "state": ""}, {"no": "PITCH 04", "name": "Brew and Stew", "page": "brew-and-stew.html", "state": ""}, {"no": "PITCH 06", "name": "The Aerial Arbour", "page": "the-aerial-arbour.html", "state": ""}];
      // cel:pitches:end

      // Where the one track through the wood leaves the field, over the stream.
      var TRACK = -10;

      // DUSK, AND NOTHING LIGHTING IT.
      kit.scene.background = kit.col('--dusk');
      kit.scene.fog = new T.Fog(kit.col('--dusk'), 40, 520);
      kit.scene.add(new T.HemisphereLight(kit.col('--lichen'), kit.col('--bark'), 2.8));

      // The field, the stream along its far edge, and the treeline all round.
      box(140, 0.1, 140, at(0, -0.05, -40), '--bark', false, false);
      var stream = new T.PlaneGeometry(120, 3.2);
      kit.flat(stream, at(0, 0.02, -46, 0, -Math.PI / 2), '--dusk');
      for (var k = 0; k < 40; k++) {
        kit.flat(new T.PlaneGeometry(0.6 + hash(k, 1, 1) * 1.2, 0.05), at(-50 + hash(k, 1, 2) * 100, 0.03, -46 + (hash(k, 1, 3) - 0.5) * 2.4, 0, -Math.PI / 2), '--lichen');
      }
      function spruce(x, z, h) {
        kit.cyl(0.12, 0.16, h * 0.25, at(x, h * 0.12, z), '--bark', 0.02, 6);
        for (var t = 0; t < 3; t++) {
          var r = h * (0.32 - t * 0.08), y = h * (0.3 + t * 0.22);
          kit.piece(new T.ConeGeometry(r, h * 0.42, 8), at(x, y + h * 0.18, z, t), '--spruce', 0.04);
        }
      }
      for (k = 0; k < 70; k++) {
        var a = k / 70 * Math.PI * 2, d = 46 + hash(k, 2, 1) * 10;
        var sx = Math.sin(a) * d, sz = -24 - Math.cos(a) * d * 0.9;
        if (sz > -1 && Math.abs(sx) < 3) continue;
        if (sz < -40 && Math.abs(sx - TRACK) < 3) continue;
        spruce(sx, sz, 5 + hash(k, 2, 2) * 5);
      }
      // The gap you came through, and the trees either side of it.
      for (k = 0; k < 10; k++) {
        var gx = (k % 2 ? 1 : -1) * (3 + Math.floor(k / 2) * 2.4 + hash(k, 3, 1)), gz = 3 + hash(k, 3, 2) * 3;
        spruce(gx, gz, 5 + hash(k, 3, 3) * 3);
      }

      // Tufts of grass and a few stones on the open ground, so the field has
      // a near and a far.
      var tuft = new T.ConeGeometry(0.025, 0.32, 3);
      for (k = 0; k < 260; k++) {
        var tx = (hash(k, 6, 1) - 0.5) * 70, tz = 1 - hash(k, 6, 2) * 44;
        if (Math.hypot(tx, tz + 20) < 4.6 || (Math.abs(tx) < 1.6 && tz > -6)) continue;
        for (var b = 0; b < 3; b++) kit.piece(tuft.clone(), at(tx + (b - 1) * 0.05, 0.14, tz + (b % 2) * 0.04, 0, (b - 1) * 0.3, (b - 1) * 0.3), '--moss', false);
      }
      for (k = 0; k < 24; k++) {
        var rx = (hash(k, 7, 1) - 0.5) * 60, rz = -2 - hash(k, 7, 2) * 40;
        if (Math.hypot(rx, rz + 20) < 5) continue;
        var rock = new T.DodecahedronGeometry(0.3 + hash(k, 7, 3) * 0.4, 0); rock.scale(1, 0.55, 1);
        kit.piece(rock, at(rx, 0.12, rz, k), '--spruce', 0.03);
      }

      // THE SKY: the moon, and a few stars, still.
      kit.flat(new T.CircleGeometry(7, 40), at(-60, 70, -210), '--moon');
      for (k = 0; k < 90; k++) {
        var sa = hash(k, 4, 1) * Math.PI * 1.4 - Math.PI * 0.7, se = 0.25 + hash(k, 4, 2) * 0.9;
        kit.flat(new T.CircleGeometry(0.35 + hash(k, 4, 3) * 0.4, 6),
          at(Math.sin(sa) * 230 * Math.cos(se), 230 * Math.sin(se), -30 - Math.cos(sa) * 230 * Math.cos(se), -sa, 0), k % 4 ? '--moss' : '--lichen');
      }

      // THE MOUNTAIN over the far side, the snow on its top drawn in bark,
      // and the cable going up to it from the pond.
      kit.piece(new T.ConeGeometry(75, 95, 10), at(28, 46, -175, 0.3), '--spruce', 0.5);
      kit.piece(new T.ConeGeometry(22, 28, 10), at(28, 80, -175, 0.3), '--bark', 0.3);
      var foot = new T.Vector3(5.5, 3.2, -24), top = new T.Vector3(24, 90, -168);
      var span = top.clone().sub(foot), mid = foot.clone().add(top).multiplyScalar(0.5);
      var cable = new T.CylinderGeometry(0.04, 0.04, span.length(), 4);
      cable.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), span.clone().normalize()));
      kit.piece(cable, at(mid.x, mid.y, mid.z), '--bark', false);
      box(2.4, 3.2, 2.4, at(5.5, 1.6, -24.6), '--bark');
      box(2.8, 0.2, 2.8, at(5.5, 3.3, -24.6), '--spruce');
      // THE CABLE CAR, waiting just out of the station for whoever is going up
      // to visit: a car of spruce under a bark roof, hung from the cable on
      // one arm, its windows the dusk. It does not move; you ride it by
      // going in.
      var hang = foot.clone().add(span.clone().multiplyScalar(0.03));
      var turn = Math.atan2(span.x, span.z);
      kit.cyl(0.05, 0.05, 1.3, at(hang.x, hang.y - 0.65, hang.z), '--bark', false, 6);
      box(1.7, 1.5, 1.4, at(hang.x, hang.y - 2.05, hang.z, turn), '--spruce');
      box(1.9, 0.14, 1.6, at(hang.x, hang.y - 1.25, hang.z, turn), '--bark');
      [-1, 1].forEach(function (e) {
        var side = new T.Vector3(e * 0.86, 0, 0).applyAxisAngle(new T.Vector3(0, 1, 0), turn);
        kit.flat(new T.PlaneGeometry(1.0, 0.6), at(hang.x + side.x, hang.y - 1.85, hang.z + side.z, turn + e * Math.PI / 2), '--dusk');
      });

      // THE POND between pitches 01, 05 and 03, and the pebble paths.
      kit.piece(new T.CylinderGeometry(4.2, 4.2, 0.06, 28), at(0, 0.03, -20), '--spruce', false);
      kit.flat(new T.CircleGeometry(3.8, 28), at(0, 0.07, -20, 0, -Math.PI / 2), '--dusk');
      for (k = 0; k < 130; k++) {
        var t = hash(k, 5, 1), lane = k % 3;
        var ex = [-9, 9, 0][lane], ez = [-13, -15, -32][lane];
        var px = ex * t + (hash(k, 5, 2) - 0.5) * 0.9, pz = -20 + (ez + 20) * t + (hash(k, 5, 3) - 0.5) * 0.9;
        if (Math.hypot(px, pz + 20) < 4.4) continue;
        kit.flat(new T.CircleGeometry(0.07 + hash(k, 5, 4) * 0.06, 6), at(px, 0.02, pz, 0, -Math.PI / 2), '--lichen');
      }
      // The swing seats by the pond.
      [[-3.2, -25.6], [3.4, -15.2]].forEach(function (s, i) {
        var g = at(s[0], 0, s[1], i ? 2.6 : -0.6);
        [-0.9, 0.9].forEach(function (o) { box(0.12, 2.4, 0.12, M(g, at(o, 1.2, 0)), '--bark'); });
        box(2.0, 0.12, 0.12, M(g, at(0, 2.4, 0)), '--bark');
        box(0.9, 0.08, 0.4, M(g, at(0, 0.55, 0)), '--bark');
        [-0.35, 0.35].forEach(function (o) { box(0.02, 1.8, 0.02, M(g, at(o, 1.45, 0)), '--moss', false); });
      });

      // THE POSTS. A routed sign on a post for every pitch on the board, bone
      // on bark, its number in moss and its name in bone.
      var WHERE = { 'PITCH 01': [-9, -13], 'PITCH 05': [9, -15], 'PITCH 03': [0, -33], 'PITCH 02': [-15, -27], 'PITCH 04': [15, -29], 'THE SUMMIT': [8.5, -24] };
      function sign(p) {
        return kit.paper(640, 340, function (c, w, h) {
          c.fillStyle = kit.ink('--bark'); c.fillRect(0, 0, w, h);
          c.strokeStyle = kit.ink('--spruce'); c.lineWidth = 10; c.strokeRect(8, 8, w - 16, h - 16);
          c.fillStyle = kit.ink('--moss'); c.textAlign = 'center'; c.textBaseline = 'alphabetic';
          c.font = '40px "Alfa Slab One"'; c.fillText(p.no, w / 2, 76);
          c.fillStyle = kit.ink('--bone');
          var size = 60, lines;
          do {
            c.font = size + 'px "Alfa Slab One"';
            lines = [];
            var line = '';
            p.name.split(' ').forEach(function (word) {
              var tryLine = line ? line + ' ' + word : word;
              if (c.measureText(tryLine).width > w - 80 && line) { lines.push(line); line = word; } else line = tryLine;
            });
            lines.push(line);
            size -= 4;
          } while (lines.length * size * 1.15 > h - 120 && size > 26);
          lines.forEach(function (l, i) { c.fillText(l, w / 2, 140 + i * size * 1.18 + (3 - lines.length) * size * 0.4); });
        });
      }
      var stops = [{ name: 'at the gap in the trees, where the street runs out', x: 0, z: 0.5, yaw: 0 }];
      PITCHES.forEach(function (p, i) {
        var w = WHERE[p.no] || [(i % 2 ? 1 : -1) * (16 + i), -36 - i * 3];
        var g = at(w[0], 0, w[1], Math.atan2(-w[0], -w[1] - 0) * 0.35);
        box(0.22, 2.3, 0.22, M(g, at(0, 1.15, -0.06)), '--bark');
        box(1.84, 1.0, 0.12, M(g, at(0, 2.0, 0)), '--bark');
        kit.sheet(sign(p), 1.7, 0.9, M(g, at(0, 2.0, 0.065)));
        // A pitch with nothing behind it yet has a dashed post: rings cut
        // into it, as the board dashes its edge.
        if (p.state === 'raising' || p.state === 'open') {
          for (var r = 0; r < 4; r++) box(0.26, 0.06, 0.26, M(g, at(0, 0.3 + r * 0.38, -0.06)), '--spruce', false);
        }
        var front = new T.Vector3(0, 0, 2.6).applyMatrix4(g);
        var face = Math.atan2(front.x - w[0], front.z - w[1]);
        stops.push({ name: p.name, where: 'at the post for ' + p.no.toLowerCase() + ', ' + p.name, page: p.page || undefined, x: front.x, z: front.z, yaw: face });
      });

      // WHAT IS PITCHED BEHIND EACH POST, seen from the field: drawn in the
      // field's own inks, spruce and bark, with the one light the board gives
      // each, because you are looking at them across cold ground at night.
      // The yurt EMITS (her candle out of the crown and the door), the
      // hermitage CATCHES (the moon on its panels, one window that is a
      // screen, three sunflowers), the meadow's fireflies are CARRIED, the tea
      // room's light is GROWN in its own logs, the Bough House's LINGERS on
      // the top of its tree, and the summit's is FAR, among the stars. A
      // pitch with nothing drawn here yet has its post alone.
      function standing(w, back) {
        var len = Math.hypot(w[0], w[1]) || 1, bx = w[0] + w[0] / len * back, bz = w[1] + w[1] / len * back;
        return { x: bx, z: bz, m: at(bx, 0, bz, Math.atan2(-bx, -bz)) };
      }
      var glow = function (geo, m, ink) { kit.flat(geo, m, ink); };
      var EXTERIOR = {
        'faery-yurt.html': function (b) {
          var g = b.m;
          kit.cyl(3, 3, 1.9, M(g, at(0, 0.95, 0)), '--spruce', 0.05, 24);
          kit.piece(new T.ConeGeometry(3.4, 1.5, 24), M(g, at(0, 2.65, 0)), '--bark', 0.05);
          kit.cyl(0.55, 0.55, 0.25, M(g, at(0, 3.45, 0)), '--bark', 0.03, 16);
          glow(new T.CircleGeometry(0.42, 16), M(g, at(0, 3.585, 0, 0, -Math.PI / 2)), '--candle');
          glow(new T.PlaneGeometry(1.0, 1.6), M(g, at(0, 0.8, 3.01)), '--candle');
          glow(new T.PlaneGeometry(1.4, 3.2), M(g, at(0, 0.02, 4.6, 0, -Math.PI / 2)), '--ember-2');
          for (var q = 0; q < 26; q++) {
            var a = q / 26 * Math.PI * 2;
            glow(new T.SphereGeometry(0.05, 6, 4), M(g, at(Math.sin(a) * 3.05, 1.82 - Math.abs(Math.sin(a * 13)) * 0.12, Math.cos(a) * 3.05)), '--candle');
          }
        },
        'the-bough-house.html': function (b) {
          var g = b.m;
          kit.cyl(0.45, 0.7, 9, M(g, at(0, 4.5, 0)), '--bark', 0.05, 10);
          var leaf = new T.IcosahedronGeometry(1, 1);
          [[0, 9.2, 0, 2.6], [-1.8, 8, 0.6, 2], [1.9, 8.2, -0.4, 2.1], [0.4, 7.2, 1.6, 1.8], [-0.6, 7.4, -1.7, 1.9]].forEach(function (c, i) {
            var lg = leaf.clone(); lg.scale(c[3], c[3] * 0.8, c[3]);
            kit.piece(lg, M(g, at(c[0], c[1], c[2], i)), '--spruce', 0.06);
          });
          var top = leaf.clone(); top.scale(1.3, 0.9, 1.3);
          kit.piece(top, M(g, at(0.2, 11.1, 0.2)), '--camp-lingers', 0.05);
          box(3.2, 2.0, 2.6, M(g, at(0, 5.2, 0.4)), '--bark');
          kit.piece(new T.ConeGeometry(2.6, 1.2, 4), M(g, at(0, 6.8, 0.4, Math.PI / 4)), '--spruce', 0.04);
          box(3.8, 0.12, 3.2, M(g, at(0, 4.15, 0.4)), '--bark');
          [-0.3, 0.3].forEach(function (o) { box(0.07, 4.2, 0.07, M(g, at(1.9 + o, 2.05, 1.9, 0, 0.1)), '--bark', false); });
          for (var r = 0; r < 9; r++) box(0.66, 0.05, 0.07, M(g, at(1.9, 0.3 + r * 0.44, 1.9 + r * 0.04)), '--bark', false);
        },
        'swaying-sweetgrass.html': function (b) {
          var g = b.m, blade = new T.ConeGeometry(0.035, 1.3, 3);
          for (var q = 0; q < 420; q++) {
            var r = Math.sqrt(hash(q, 8, 1)) * 4.6, a = hash(q, 8, 2) * Math.PI * 2;
            var x = Math.sin(a) * r * 1.3, z = Math.cos(a) * r;
            if (Math.abs(x) < 0.5 && z > -1) continue;
            kit.piece(blade.clone(), M(g, at(x, 0.6, z, 0, (hash(q, 8, 3) - 0.5) * 0.3, (hash(q, 8, 4) - 0.5) * 0.3)), q % 3 ? '--moss' : '--bark', false);
          }
          box(0.9, 0.03, 5, M(g, at(0, 0.02, 2.4)), '--spruce', false, false);
          var pts = [];
          for (var k2 = 0; k2 <= 10; k2++) pts.push(new T.Vector3(Math.sin(k2 * 0.9) * 0.18, 1.4 + k2 * 0.45, Math.cos(k2 * 0.7) * 0.1));
          kit.piece(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 30, 0.03, 5, false), M(g, at(0, 0, -1)), '--lichen', false);
          for (q = 0; q < 34; q++) {
            var fr = Math.sqrt(hash(q, 9, 1)) * 4.4, fa = hash(q, 9, 2) * Math.PI * 2;
            glow(new T.SphereGeometry(0.05, 6, 4), M(g, at(Math.sin(fa) * fr * 1.3, 0.4 + hash(q, 9, 3) * 0.9, Math.cos(fa) * fr)), '--camp-firefly');
          }
        },
        'solarpunk-hermitage.html': function (b) {
          var g = b.m;
          box(7, 2.6, 3.2, M(g, at(0, 1.75, 0)), '--spruce');
          [-1, 1].forEach(function (s2) {
            box(7.5, 0.12, 2.0, M(g, at(0, 3.3, s2 * 0.82, 0, s2 * 0.6)), '--bark');
            [-2.6, 2.4].forEach(function (x) { kit.cyl(0.42, 0.42, 0.24, M(g, at(x, 0.42, s2 * 1.62, 0, Math.PI / 2)), '--bark', 0.03, 16); });
          });
          for (var x = -3.0; x < 3.2; x += 1.25) glow(new T.PlaneGeometry(1.1, 1.5), M(g, at(x, 3.36, 0.9, 0, -Math.PI / 2 + 0.6)), '--moon');
          glow(new T.PlaneGeometry(1.4, 0.9), M(g, at(-1.4, 1.9, 1.61)), '--camp-screen');
          box(0.9, 1.9, 0.06, M(g, at(1.9, 1.4, 1.62)), '--bark', false);
          kit.cyl(0.03, 0.03, 1.8, M(g, at(-3.2, 4.1, 0)), '--moss', false, 6);
          [-0.6, 0.0, 0.6].forEach(function (o, i) {
            kit.cyl(0.03, 0.03, 1.9 + i * 0.2, M(g, at(1.9 + o, 0.95 + i * 0.1, 2.3)), '--bark', false, 5);
            glow(new T.CircleGeometry(0.22, 12), M(g, at(1.9 + o, 1.95 + i * 0.2, 2.32)), '--camp-sunflower');
          });
        },
        'brew-and-stew.html': function (b) {
          var g = b.m;
          for (var r = 0; r < 7; r++) {
            [[0, 1.8, 5.2, 0], [0, -1.8, 5.2, 0], [2.5, 0, 3.8, Math.PI / 2], [-2.5, 0, 3.8, Math.PI / 2]].forEach(function (wl, i) {
              if (i === 0 && r < 5 && Math.abs(wl[0]) < 1) {
                [-1.65, 1.65].forEach(function (x) { kit.cyl(0.15, 0.15, 1.9, M(g, at(x, 0.15 + r * 0.29, wl[1], wl[3], 0, Math.PI / 2)), '--bark', 0.02, 8); });
                return;
              }
              kit.cyl(0.15, 0.15, wl[2], M(g, at(wl[0], 0.15 + r * 0.29, wl[1], wl[3], 0, Math.PI / 2)), '--bark', 0.02, 8);
            });
          }
          [-1, 1].forEach(function (s2) { box(6, 0.12, 2.6, M(g, at(0, 2.55, s2 * 1.1, 0, s2 * 0.55)), '--spruce'); });
          box(0.12, 1.5, 0.12, M(g, at(1.0, 0.75, 1.85)), '--spruce', false);
          for (var q = 0; q < 46; q++) {
            var face = q % 4, u = hash(q, 10, 1) - 0.5, y = 0.2 + hash(q, 10, 2) * 1.8;
            var pos = face < 2 ? [u * 4.8, y, face ? 1.97 : -1.97] : [face === 2 ? 2.67 : -2.67, y, u * 3.4];
            glow(new T.SphereGeometry(0.045, 6, 4), M(g, at(pos[0], pos[1], pos[2])), '--camp-foxfire');
          }
        }
      };
      PITCHES.forEach(function (p) {
        var draw = EXTERIOR[p.page];
        if (!draw) return;
        var w = WHERE[p.no];
        if (w) draw(standing(w, 6));
      });
      // The summit's cabin, at the top of the mountain, its one window FAR.
      box(4, 2.4, 3.4, at(28, 87.5, -170.5), '--spruce');
      glow(new T.PlaneGeometry(1.2, 0.8), at(28, 87.8, -168.75), '--camp-far');

      stops.push({ name: 'the cable car', where: 'at the cable car, waiting just out of the station by the pond', room: 'the cable car, up to the cabin at the summit',
                   page: 'the-mountain-cabin.html', x: hang.x - 7, z: hang.z + 1.5, yaw: Math.atan2(-7, 1.5), pitch: 0.27 });

      // THE TRACK THROUGH THE WOOD. The page says the stream is the boundary
      // and the wood past it is not mapped, and that one track goes through it
      // to a stile onto open land. So: a plank bridge over the stream, the
      // track going on into the trees as far as you can see, which is not far,
      // and a post at this end saying where it comes out. The wood itself is
      // not drawn any further than the treeline already is.
      for (k = 0; k < 9; k++) box(1.6, 0.08, 0.3, at(TRACK, 0.1, -44.4 - k * 0.4), '--bark', 0.02);
      [-0.75, 0.75].forEach(function (o) { box(0.08, 0.5, 3.6, at(TRACK + o, 0.4, -46), '--bark', false); });
      for (k = 0; k < 30; k++) {
        kit.flat(new T.CircleGeometry(0.09 + hash(k, 8, 1) * 0.06, 6),
          at(TRACK + (hash(k, 8, 2) - 0.5) * 1.1, 0.025, -42 - hash(k, 8, 3) * 2.2, 0, -Math.PI / 2), '--lichen');
      }
      box(1.4, 0.04, 14, at(TRACK, 0.0, -55), '--spruce', false, false);
      var tg = at(TRACK + 2.3, 0, -41.4, -0.35);
      box(0.22, 2.3, 0.22, M(tg, at(0, 1.15, -0.06)), '--bark');
      box(1.84, 1.0, 0.12, M(tg, at(0, 2.0, 0)), '--bark');
      kit.sheet(sign({ no: 'THE TRACK', name: 'Through the wood to Nature’s Contribution' }), 1.7, 0.9, M(tg, at(0, 2.0, 0.065)));
      stops.push({ name: 'Nature’s Contribution', where: 'at the track through the wood, by the bridge over the stream',
                   room: 'the track through the wood, out to the stile onto Nature’s Contribution',
                   page: 'natures-contribution.html', x: TRACK + 0.4, z: -38.4, yaw: 0.05, pitch: 0.12 });

      // THE TRAILHEAD BOARD by the gap, with the field's own page on it,
      // under a little roof of bark.
      var bw = 3.2, bh = bw * 800 / 1180, by = 0.7 + bh / 2, bz = -6.5, bx = 5.2;
      [-1, 1].forEach(function (s) { box(0.2, by + bh / 2 + 0.6, 0.2, at(bx + s * (bw / 2 + 0.2), (by + bh / 2 + 0.6) / 2, bz - 0.05), '--bark'); });
      box(bw + 0.3, bh + 0.3, 0.08, at(bx, by, bz - 0.06), '--bark');
      box(bw + 1.0, 0.12, 1.0, at(bx, by + bh / 2 + 0.65, bz + 0.2, 0, 0.18), '--spruce');
      var frame = kit.screen(1180, 800, bw, at(bx, by, bz), 'The Campgrounds’ own page, on the trailhead board by the gap in the trees');
      stops.splice(1, 0, { name: 'at the trailhead board, with the field’s own page on it', x: bx, z: bz + 2.9, yaw: 0, page: kit.page, frame: frame });

      return {
        start: { x: 0, z: 0.5, yaw: 0 },
        bounds: { x: [-22, 22], z: [-42, 2] },
        stops: stops
      };
    }
  };
})();

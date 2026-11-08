/* =============================================================================
   Glow Wild Hollow, walked into on Cel Street, down through the glowing
   mushroom in the Faery Yurt. Ryan's ask, 2026-10-31: every doorway in the
   yurt opening onto its own room.

   IT IS HELEN EDGAR'S ROOM AND HER WORLD (§129), and this is OURS: a drawing of
   her hollow for Cel Street, in the colours her room declares and nothing
   else, which changes nothing on her page and is hers to keep or send back.
   Air, Earth and Water, her spaces, and Fire at the end. EVERY LIGHT DOWN HERE
   BELONGS TO SOMETHING ALIVE: no moon, no star, no lamp, no flame, but the
   fireflies over the grass, foxfire in the fallen logs, glow-worms on the
   bank, the sea sparkling at its edge and a jellyfish's rim over the water.
   The one exception is hers: the bonfire on the shore under Fire, the only
   light that is not alive, and the only thing that lights anything round it.
   You stand under the mushroom you came down through.

   ROUND 2 (Ryan, 2026-11-04) laid the hollow out as her page lays it out, one
   space after another, with more of what she wrote down in each: moths
   circling the fireflies' glow, lit by nothing of their own; her whirlpool of
   light down into the earth, and the second one down through the rhizome,
   its glowing threads wandering over the ground to the sea; the old logs on
   one slope, foxfire and glowing toadstools growing through them, and on the
   other slope glow-worms waiting at the tops of the grass stems; waves
   sparkling where they break, plankton out on the dark water, the crystal
   jelly drawn by its edges, and sparks over the bonfire. The night is only
   bright enough to tell the hills and the grass from the dark, and the
   living lights stand where they are and light nothing round them. Two new
   places to stand at the whirlpools, with her own whirls lifted off her page,
   and one each among the moths, on the glow-worms' slope and at the water's
   edge.

   HER SEA, HER JELLYFISH, HER FIREFLIES, HER WHIRLPOOLS AND HER BONFIRE ARE
   HER PAGE'S OWN, lifted off it by Cel Street's kit.lift() and standing in
   their own spaces, with glow-wild.js, which her page loads, run against the
   copies. So they answer a touch here as they do there, under that script's
   own rules: a light comes up over RISE and goes over FADE, nothing flashes,
   sound and buzz and Keep it stirring start off, and at Gentle a light stays
   lit, still, until pressed again. A whirl's way down is a link to a part of
   her page, which is not here, so it is left out.

   ROUND 3 (Ryan, 2026-11-04) added more of what is there and things to
   press: ferns among the grass, rings, a split, ridges of bark and branch
   stubs on the fallen logs, and on the shore by the fire a log to sit on, a
   pile of logs for later, driftwood, pebbles and weed left by the tide.

   WHAT MOVES IS WHAT HER PAGE MOVES, AND WHAT YOU ASK FOR. Her dial says MAX
   lets the lights in the drawing breathe and the jellyfish pulse by itself,
   and nothing ever flashes. So at MAX the fireflies and the glow-worms
   breathe, slowly, each in its own time, and the lights round the
   jellyfish's rim pulse; each has its own switches too (out, low or lit, and
   breathing or still), and the fireflies and the rim a choice of colour. The
   slow swell her page rolls along the sea at MAX has nothing in the kit to
   move it, so the waves here stand still.
   The bonfire is the one light that is not alive: its flames sway only
   when somebody presses Let the bonfire's flames sway, under the flash line the
   kit holds, and it can be let burn down to a bed of embers and built up
   again. The water can be touched, and rings of sparkle spread out where it
   was; the jellyfish can be touched, and it lights up green, as hers does.
   Each press changes the scene at once and says what it did; nothing in the
   scene glides. Every colour is one her room declares, by name. It keeps
   nothing, sends nothing and fetches nothing; her page arrives through Cel
   Street's screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 19, 374761393) + Math.imul(j + 61, 668265263) + Math.imul(k + 67, 362437);
    n = Math.imul(n ^ (n >>> 16), 2246822507);
    n = Math.imul(n ^ (n >>> 13), 3266489909);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['glow-wild-hollow.html'] = {
    name: 'Glow Wild Hollow',
    from: 'faery-yurt.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var ID = new T.Matrix4();
      var V3 = function (x, y, z) { return new T.Vector3(x, y, z); };
      // Many small living lights as one mesh, so a swarm is one draw.
      function merged(parts) {
        var arrs = [], n = 0;
        parts.forEach(function (p) {
          var g = p[0].index ? p[0].toNonIndexed() : p[0].clone();
          g.applyMatrix4(p[1]); arrs.push(g.attributes.position.array); n += g.attributes.position.array.length;
        });
        var pos = new Float32Array(n), o = 0;
        arrs.forEach(function (a) { pos.set(a, o); o += a.length; });
        var out = new T.BufferGeometry(); out.setAttribute('position', new T.BufferAttribute(pos, 3));
        return out;
      }
      var dot = new T.SphereGeometry(1, 6, 4);
      var bar = new T.BoxGeometry(1, 1, 1);
      function points(list, ink) { return list.length ? kit.flat(merged(list), ID, ink) : null; }
      function solid(list, ink, line) {
        if (!list.length) return;
        var g = merged(list); g.computeVertexNormals();
        kit.piece(g, ID, ink, line === undefined ? false : line);
      }
      // A dot of living light at a place, of a size.
      function spot(list, x, y, z, s, sy) { list.push([dot, at(x, y, z).scale(V3(s, sy || s, s))]); }
      // A thin line of light lying on the ground, from one place to the next.
      function thread(list, x0, z0, x1, z1, w) {
        var dx = x1 - x0, dz = z1 - z0, len = Math.sqrt(dx * dx + dz * dz);
        list.push([bar, at((x0 + x1) / 2, 0.025, (z0 + z1) / 2, Math.atan2(dx, dz)).scale(V3(w, 0.012, len + w))]);
      }

      // NIGHT, with nothing in the sky. Only enough of it to tell the hills,
      // the grass and the logs from the dark; it is no moon, and it lights
      // nothing more than the shapes of things.
      kit.scene.background = kit.col('--gwh-night');
      kit.scene.add(new T.HemisphereLight(kit.col('--gwh-ink-2'), kit.col('--gwh-hill'), 1.5));

      // THE GROUND, and the hills all round, dark.
      box(100, 0.1, 120, at(0, -0.05, -34), '--gwh-hill', false, false);
      var hill = new T.SphereGeometry(1, 16, 8);
      [[-17, -8, 9], [16, -5, 8], [-19, -26, 11], [18, -24, 10], [-12, -46, 9], [13, -44, 9], [-7, -78, 18], [14, -74, 15], [-30, -60, 16], [32, -58, 17]].forEach(function (h) {
        var g = hill.clone(); g.scale(h[2], h[2] * 0.42, h[2] * 0.7);
        kit.piece(g, at(h[0], -1, h[1]), '--gwh-hill', 0.2);
      });

      // THE MUSHROOM you came down through, behind you: its gills glow with
      // foxfire, the one light up there, and small ones glow round its foot.
      kit.cyl(0.9, 1.2, 4.2, at(0, 2.1, 2.6), '--gwh-hill', 0.04, 18);
      var cap = new T.SphereGeometry(3.4, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2); cap.scale(1, 0.55, 1);
      kit.piece(cap, at(0, 4.2, 2.6), '--gwh-hill', 0.06);
      kit.flat(new T.RingGeometry(1.0, 3.3, 32, 1), at(0, 4.18, 2.6, 0, Math.PI / 2), '--gwh-fox');
      var gills = [];
      for (var gi = 0; gi < 40; gi++) {
        var ga = gi / 40 * Math.PI * 2;
        gills.push([bar, at(Math.cos(ga) * 2.15, 4.12, 2.6 + Math.sin(ga) * 2.15, -ga).scale(V3(0.03, 0.05, 2.3))]);
      }
      points(gills, '--gwh-deep');
      box(0.9, 1.9, 0.1, at(0, 0.95, 1.65), '--gwh-night', false);

      // Glowing toadstools: a stem and a cap, all of it alight.
      var stool = [];
      function toadstool(x, z, s, y) {
        stool.push([new T.CylinderGeometry(0.035, 0.05, 1, 6), at(x, (y || 0) + s * 0.5, z).scale(V3(s, s, s))]);
        var c = new T.SphereGeometry(0.16, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2); c.scale(1, 0.55, 1);
        stool.push([c, at(x, (y || 0) + s * 0.98, z).scale(V3(s, s, s))]);
      }
      for (var tf = 0; tf < 16; tf++) {
        var ta0 = Math.PI * 0.15 + hash(tf, 9, 1) * Math.PI * 1.7, tr0 = 1.4 + hash(tf, 9, 2) * 0.9;
        toadstool(Math.cos(ta0) * tr0, 2.6 - Math.sin(ta0) * tr0 * 0.7 - 0.2, 0.25 + hash(tf, 9, 3) * 0.3);
      }

      var stops = [{ name: 'under the mushroom you came down through', x: 0, z: 0.4, yaw: 0 }];

      // HER OWN PAGE, standing by the mushroom's foot on the right, like the
      // panels down the hollow.
      var pw = 2.6, ph = pw * 800 / 1180;
      var pg = at(3.0, 0, -1.6, -Math.PI / 2 + 0.35);
      box(pw + 0.16, ph + 0.16, 0.06, M(pg, at(0, 0.3 + ph / 2, 0)), '--gwh-deep');
      var frame = kit.screen(1180, 800, pw, M(pg, at(0, 0.3 + ph / 2, 0.04)), 'Glow Wild Hollow’s own page, standing by the foot of the mushroom');
      stops.push({ name: 'by the foot of the mushroom, with her room’s own page', x: 0.6, z: -0.7, yaw: -Math.PI / 2 + 0.35, page: kit.page, frame: frame });

      // A thing off her page, standing on the ground beside the way down,
      // turned to face it; and a stop in front of it.
      function panel(sel, side, z, label, drop, foot) {
        var ry = side < 0 ? Math.PI / 2 : -Math.PI / 2;
        // A short one (a whirl) stands on a dark stand of deep water, so it
        // comes up to the eye like the others.
        if (foot) box(2.3, foot + 0.14, 0.12, at(side * 3.26, (foot + 0.14) / 2, z, ry), '--gwh-deep', 0.02);
        var it = kit.lift(frame, sel, { w: 760, ww: 2.2, m: at(side * 3.2, (foot || 0) + 0.12, z, ry), drop: drop });
        stops.push({ name: label, x: side * 0.5, z: z, yaw: ry, frame: it.el });
        return it;
      }

      // ── AIR: long grass, fireflies rising out of it, and moths ──────────────
      var blade = new T.ConeGeometry(0.02, 0.55, 3), grass = [];
      for (var k = 0; k < 760; k++) {
        var gx = (hash(k, 1, 1) - 0.5) * 24, gz = -1.8 - hash(k, 1, 2) * 9.6;
        if (Math.abs(gx) < 0.9) continue;
        var gs = 0.7 + hash(k, 1, 5) * 0.9;
        grass.push([blade, at(gx, 0.25 * gs, gz, 0, (hash(k, 1, 3) - 0.5) * 0.5, (hash(k, 1, 4) - 0.5) * 0.5).scale(V3(1, gs, 1))]);
      }
      solid(grass, '--gwh-hill');
      // Most of them low, just up out of the grass; fewer higher; none up in
      // the sky, which has nothing in it.
      // Each firefly is a bulb of the kit's, small ones and larger ones, so
      // their light can be let down, put out or let breathe: at MAX they
      // breathe by themselves, as the lights in her drawing do.
      var flySmall = [], flyBig = [];
      for (k = 0; k < 260; k++) {
        var hy = hash(k, 2, 2), fy = 0.35 + hy * hy * 3.4;
        (hash(k, 2, 4) < 0.5 ? flySmall : flyBig).push([(hash(k, 2, 1) - 0.5) * 20, fy, -1.6 - hash(k, 2, 3) * 11.4]);
      }
      // A knot of them over the grass on the right, where the moths come.
      var MX = 2.4, MY = 1.7, MZ = -9.4;
      for (k = 0; k < 22; k++) flyBig.push([MX + (hash(k, 6, 1) - 0.5) * 0.9, MY + (hash(k, 6, 2) - 0.5) * 0.7, MZ + (hash(k, 6, 3) - 0.5) * 0.9]);
      var fireflies = kit.lights({ label: 'The fireflies’ lights', max: true, twinkle: 'Let them breathe',
        strings: [kit.bulbs(flySmall, 0.026, ['--gwh-worm']), kit.bulbs(flyBig, 0.038, ['--gwh-worm'])],
        sets: [{ say: 'Yellow-green, as in her drawing', inks: ['--gwh-worm'] },
               { say: 'Yellow and green', inks: ['--gwh-worm', '--gwh-fox'] }] });
      // Ferns among the grass, as along the foot of her drawing of the air:
      // each a stem arching over with its leaflets along it, dark.
      var ferns = [], leaflet = new T.SphereGeometry(1, 5, 3);
      for (var fn = 0; fn < 26; fn++) {
        var fnx = (hash(fn, 13, 1) - 0.5) * 18, fnz = -2.2 - hash(fn, 13, 2) * 8.8;
        if (Math.abs(fnx) < 1.1) fnx += fnx < 0 ? -1.2 : 1.2;
        for (var fr = 0; fr < 5; fr++) {
          var fa = fr / 5 * Math.PI * 2 + hash(fn, fr, 3), flen = 0.5 + hash(fn, fr, 4) * 0.35;
          for (var lf = 0; lf < 9; lf++) {
            var u = lf / 9, reach = u * flen, lift = Math.sin(u * Math.PI * 0.8) * flen * 0.55, sz = (1 - u) * 0.07 + 0.02;
            var cxl = fnx + Math.cos(fa) * reach, czl = fnz + Math.sin(fa) * reach;
            [-1, 1].forEach(function (sd) {
              ferns.push([leaflet, at(cxl - Math.sin(fa) * sd * sz, 0.05 + lift, czl + Math.cos(fa) * sd * sz, -fa).scale(V3(sz, 0.006, sz * 0.4))]);
            });
          }
        }
      }
      solid(ferns, '--gwh-hill');
      // Moths make no light of their own, and circle the glow in a spiral:
      // each two pale wings, seen only for the fireflies beside them.
      var moths = [], wing = new T.SphereGeometry(1, 6, 4);
      for (k = 0; k < 14; k++) {
        var ma = k * 2.4, mr = 0.32 + k * 0.035, my = MY - 0.4 + k * 0.06;
        var mx = MX + Math.cos(ma) * mr, mz = MZ + Math.sin(ma) * mr, face = -ma;
        [-1, 1].forEach(function (sd) {
          moths.push([wing, M(at(mx, my, mz, face), at(sd * 0.03, 0, 0, 0, 0.25 * sd, -sd * 0.35)).scale(V3(0.034, 0.005, 0.026))]);
        });
      }
      points(moths, '--gwh-ink-2');
      panel('.hollow-panel.hollow-air', -1, -6.5, 'in the long grass, among the fireflies');
      stops[stops.length - 1].acts = [fireflies];
      stops.push({ name: 'among the moths, circling the fireflies’ glow', x: 0.5, z: MZ + 0.4, yaw: -1.25, acts: [fireflies] });

      // ── THE WHIRLPOOL DOWN INTO THE EARTH ─────────────────────────────────
      // Her whirl: three arms of light winding in to a dark middle, in the
      // glow-worm's yellow-green and the foxfire's green, as she drew it.
      function whirl(cx, cz, R, inks, list) {
        for (var arm = 0; arm < 3; arm++) {
          for (var i = 0; i < 60; i++) {
            var u = i / 60, rad = R * Math.pow(1 - u, 1.4) + 0.08, a = arm * 2.094 + u * 9.5;
            list[inks[(i + arm) % inks.length]].push([dot, at(cx + Math.cos(a) * rad, 0.04, cz + Math.sin(a) * rad).scale(V3(0.03 + u * 0.035, 0.012, 0.03 + u * 0.035))]);
          }
        }
        kit.flat(new T.CircleGeometry(R * 0.18, 20), at(cx, 0.03, cz, 0, -Math.PI / 2), '--gwh-night');
        for (var r = 0; r < 4; r++) {
          kit.flat(new T.RingGeometry(R * (0.28 + r * 0.2), R * (0.3 + r * 0.2), 40), at(cx, 0.02, cz, 0, -Math.PI / 2), r % 2 ? '--gwh-wave' : '--gwh-deep');
        }
      }
      var WZ = -12.6;
      var earthWhirl = { '--gwh-worm': [], '--gwh-fox': [], '--gwh-ink': [] };
      whirl(0, WZ, 1.7, ['--gwh-worm', '--gwh-fox', '--gwh-fox', '--gwh-ink'], earthWhirl);
      Object.keys(earthWhirl).forEach(function (ink) { points(earthWhirl[ink], ink); });
      panel('.hollow-whirl.hollow-whirl--earth', -1, WZ, 'at the whirlpool of light, down into the earth', '.hollow-whirl__way', 0.7);

      // ── EARTH: two slopes, the logs on one and the glow-worms on the other ──
      var TH = 0.42, TAN = Math.tan(TH), S0 = 1.9, EZ0 = -15.4, EZ1 = -24.2, EL = EZ0 - EZ1;
      function slopeTop(x) { return Math.max(0, (Math.abs(x) - S0) * TAN); }
      [-1, 1].forEach(function (sd) {
        var half = 2.9, cx = sd * (S0 + half * Math.cos(TH));
        box(half * 2, 0.5, EL, at(cx, half * Math.sin(TH) - 0.25 / Math.cos(TH), (EZ0 + EZ1) / 2, 0, 0, sd * TH), '--gwh-hill', 0.04);
        // A bank behind it, and its ends rounded off into the ground, so the
        // slope never ends in a wall.
        var g = hill.clone(); g.scale(4, 3.2, EL * 0.6);
        kit.piece(g, at(sd * 7.4, -0.4, (EZ0 + EZ1) / 2), '--gwh-hill', 0.1);
        [EZ0 - 0.3, EZ1 + 0.3].forEach(function (ez) {
          var cap2 = hill.clone(); cap2.scale(2.9, 2.0, 1.4);
          kit.piece(cap2, at(sd * 4.6, -0.6, ez), '--gwh-hill', 0.1);
        });
      });

      // THE LOGS on the right-hand slope, lying along it, with foxfire growing
      // through them on the side that faces you, and toadstools at their ends.
      var fox = [];
      [[3.3, -16.8, 3.0, 0.32], [4.6, -19.2, 3.6, 0.38], [3.0, -21.9, 2.6, 0.28]].forEach(function (lg, li) {
        var lx = lg[0], ly = slopeTop(lx) + lg[3] * 0.8, lz = lg[1], len = lg[2], rad = lg[3];
        kit.cyl(rad, rad * 1.08, len, at(lx, ly, lz, 0.12 * (li - 1), Math.PI / 2), '--gwh-hill', 0.04, 12);
        kit.flat(new T.CircleGeometry(rad * 0.8, 12), at(lx, ly, lz + len / 2 + 0.02), '--gwh-deep');
        // Its cut end: the rings of the years it grew, and a split from the
        // middle where it dried; ridges of bark along it, and the stubs of
        // branches it lost when it fell.
        for (var rg = 1; rg < 5; rg++) {
          kit.flat(new T.RingGeometry(rad * 0.8 * rg / 5, rad * 0.8 * rg / 5 + 0.008, 16), at(lx, ly, lz + len / 2 + 0.025), '--gwh-hill');
        }
        box(0.012, rad * 0.75, 0.01, at(lx + rad * 0.2, ly + rad * 0.3, lz + len / 2 + 0.03, 0, 0, 0.5), '--gwh-night', false, false);
        for (var bk = 0; bk < 16; bk++) {
          var ba = Math.PI * (0.15 + hash(li, bk, 11) * 0.7), bl = len * (0.3 + hash(li, bk, 12) * 0.6);
          box(0.03, 0.025, bl, at(lx + Math.cos(ba) * rad * 1.03, ly + Math.sin(ba) * rad * 1.03, lz + (hash(li, bk, 13) - 0.5) * (len - bl), 0, 0, ba - Math.PI / 2), '--gwh-deep', false, false);
        }
        [0.3, -0.25].forEach(function (u, sb) {
          kit.cyl(rad * 0.22, rad * 0.3, rad * 0.9, at(lx + rad * 0.5, ly + rad * 0.85, lz + u * len, 0, 0, -0.6 - sb * 0.3), '--gwh-hill', 0.02, 7);
        });
        for (var f = 0; f < 110; f++) {
          var t = (hash(li, f, 1) - 0.5) * (len - 0.3), s2 = 0.01 + hash(li, f, 2) * 0.022;
          var ang = Math.PI * (0.55 + hash(li, f, 4) * 0.75);
          var shelf = new T.SphereGeometry(1, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2);
          fox.push([shelf, at(lx + Math.cos(ang) * rad * 1.02, ly + Math.sin(ang) * rad * 1.02, lz + t, 0, 0, ang - Math.PI / 2).scale(V3(s2 * 2, s2, s2 * 1.6))]);
        }
        // Cracks in the bark where the fungus shows through.
        for (var cr = 0; cr < 5; cr++) {
          var ct = (hash(li, cr, 7) - 0.5) * (len - 0.6);
          fox.push([bar, at(lx - rad * 0.98, ly + 0.05, lz + ct, 0, 0, 0.25).scale(V3(0.01, 0.025, 0.25 + hash(li, cr, 8) * 0.3))]);
        }
        for (var ts = 0; ts < 4; ts++) {
          var tx = lx - rad * 1.2 - hash(li, ts, 5) * 0.4, tz = lz + len / 2 - 0.2 - hash(li, ts, 6) * 0.6;
          toadstool(tx, tz, 0.18 + hash(li, ts, 9) * 0.18, slopeTop(tx));
        }
      });
      points(fox, '--gwh-fox');
      points(stool, '--gwh-fox');

      // THE OTHER SLOPE, on the left: grass on it, and here and there a light
      // sitting at the top of a stem, not moving. It is waiting.
      var stems = [], worms = [], bankGrass = [];
      for (k = 0; k < 420; k++) {
        var bx = -S0 - 0.1 - hash(k, 3, 1) * 4.4, bz = EZ0 - 0.2 - hash(k, 3, 2) * (EL - 0.4);
        var bs = 0.6 + hash(k, 3, 4) * 0.8;
        bankGrass.push([blade, at(bx, slopeTop(bx) + 0.25 * bs, bz, 0, (hash(k, 3, 5) - 0.5) * 0.4, (hash(k, 3, 6) - 0.5) * 0.4).scale(V3(1, bs, 1))]);
      }
      for (k = 0; k < 64; k++) {
        var sx = -S0 - 0.15 - hash(k, 7, 1) * 3.8, sz = EZ0 - 0.4 - hash(k, 7, 2) * (EL - 0.8);
        var sh = 0.45 + hash(k, 7, 3) * 0.45, lean = (hash(k, 7, 4) - 0.5) * 0.3;
        var base = slopeTop(sx);
        stems.push([new T.CylinderGeometry(0.008, 0.012, sh, 3), at(sx + lean * sh / 2, base + sh / 2, sz, 0, 0, -lean)]);
        worms.push([sx + lean * sh, base + sh + 0.02, sz]);
      }
      solid(bankGrass, '--gwh-hill');
      solid(stems, '--gwh-hill');
      // The glow-worms are bulbs of the kit's, as the fireflies are: let down,
      // put out, or breathing slowly, by themselves at MAX.
      var glowworms = kit.lights({ label: 'The glow-worms’ lights', max: true, twinkle: 'Let them breathe',
        strings: [kit.bulbs(worms, 0.032, ['--gwh-worm'])],
        sets: [{ say: 'Yellow-green', inks: ['--gwh-worm'] }] });
      stops.push({ name: 'by the fallen logs, with foxfire growing in them', x: 0.4, z: -19.2, yaw: -1.0 });
      stops.push({ name: 'on the other slope, where glow-worms wait at the tops of the grass stems', x: -0.5, z: -18.6, yaw: 1.05, acts: [glowworms] });

      // ── DOWN THROUGH THE RHIZOME ──────────────────────────────────────────
      // The fine threads fungi grow through soil and wood, glowing, wandering
      // down from the logs over the ground to the second whirl and on to the sea.
      var RZ = -26.8, threads = [], blue = [];
      for (var th = 0; th < 9; th++) {
        var x = (hash(th, 8, 1) - 0.5) * 6, z = -20.5 - hash(th, 8, 2) * 2, a0 = Math.PI + (x > 0 ? 0.3 : -0.3);
        for (var seg = 0; seg < 26; seg++) {
          a0 += (hash(th, seg, 3) - 0.5) * 0.8;
          a0 += (Math.atan2(-x, RZ - z) - a0) * 0.12;
          var nx = x + Math.sin(a0) * 0.32, nz = z + Math.cos(a0) * 0.32;
          if (nz > EZ0 - 0.3) nz = z - 0.2;
          thread(seg > 18 ? blue : threads, x, z, nx, nz, 0.022 - seg * 0.0004);
          if (hash(th, seg, 5) < 0.18) {
            var bx2 = x + Math.cos(a0) * 0.3, bz2 = z - Math.sin(a0) * 0.3;
            thread(threads, x, z, bx2, bz2, 0.012);
          }
          x = nx; z = nz;
          if (z < RZ - 2.2) break;
        }
      }
      points(threads, '--gwh-fox');
      points(blue, '--gwh-sea');
      var rhizWhirl = { '--gwh-fox': [], '--gwh-sea': [], '--gwh-ink': [] };
      whirl(0, RZ, 1.5, ['--gwh-fox', '--gwh-sea', '--gwh-sea', '--gwh-ink'], rhizWhirl);
      Object.keys(rhizWhirl).forEach(function (ink) { points(rhizWhirl[ink], ink); });
      panel('.hollow-whirl.hollow-whirl--rhizome', 1, RZ, 'at the watery whirlpool, down through the rhizome to the sea', '.hollow-whirl__way', 0.7);

      // ── WATER: the shore, waves sparkling where they break, the dark sea ──
      var EDGE = -35;
      kit.flat(new T.PlaneGeometry(100, 40), at(0, 0.03, EDGE - 20, 0, -Math.PI / 2), '--gwh-wave');
      kit.flat(new T.PlaneGeometry(100, 40), at(0, 0.035, EDGE - 44, 0, -Math.PI / 2), '--gwh-deep');
      // Each wave a low dark ridge coming in, lit along its crest where it
      // breaks; the one on the sand brightest and the far ones only flecked.
      var spark = [];
      [[0, 1, 300], [1.6, 0.55, 160], [3.6, 0.3, 90], [6.4, 0.16, 60]].forEach(function (wv, wi) {
        for (var s = 0; s < wv[2]; s++) {
          var px = (hash(s, 4, wi) - 0.5) * 36, line = EDGE - wv[0] + Math.sin(px * 0.55 + wi) * 0.45;
          if (hash(s, 5, wi) > wv[1] + 0.25) continue;
          spot(spark, px, 0.06, line - hash(s, 6, wi) * 0.5, 0.03 + hash(s, 7, wi) * 0.03, 0.012);
        }
        if (wi) {
          var ridge = new T.CylinderGeometry(0.06, 0.06, 40, 6); ridge.rotateZ(Math.PI / 2);
          kit.flat(ridge, at(0, 0.02, EDGE - wv[0] - 0.25), '--gwh-deep');
        }
      });
      // Far out, a few of the sea's own lights: plankton where the water moves.
      for (k = 0; k < 90; k++) spot(spark, (hash(k, 10, 1) - 0.5) * 50, 0.05, EDGE - 9 - hash(k, 10, 2) * 30, 0.025, 0.01);
      points(spark, '--gwh-sea');

      // THE CRYSTAL JELLY out past the waves, almost clear, so you see only its
      // edges: the rim of its bell, the canals running out to it, and its long
      // tentacles trailing down to the water.
      var JX = 3.6, JY = 2.1, JZ = EDGE - 6;
      var bell = new T.SphereGeometry(0.8, 22, 8, 0, Math.PI * 2, 0, Math.PI / 2); bell.scale(1, 0.55, 1);
      kit.piece(bell, at(JX, JY, JZ), '--gwh-wave', false);
      // The lights round its rim are bulbs of the kit's: they pulse by
      // themselves at MAX, as her jellyfish does, and can be let down or out.
      var rim = [];
      for (k = 0; k < 44; k++) { var ra = k / 44 * Math.PI * 2; rim.push([JX + Math.cos(ra) * 0.8, JY, JZ + Math.sin(ra) * 0.8]); }
      var jellyRim = kit.lights({ label: 'The lights round the jellyfish’s rim', max: true, twinkle: 'Let it pulse',
        strings: [kit.bulbs(rim, 0.03, ['--gwh-sea'])],
        sets: [{ say: 'Sea blue', inks: ['--gwh-sea'] }, { say: 'Green, as when it is touched', inks: ['--gwh-fox'] }] });
      // Its glow when it is touched, in her drawing's green: the bell lit
      // through, and a band of light round the rim. Put away until then.
      var jellyGlow = [];
      var lit = new T.SphereGeometry(0.88, 22, 8, 0, Math.PI * 2, 0, Math.PI / 2); lit.scale(1, 0.6, 1);
      var litBell = kit.flat(lit, at(JX, JY - 0.02, JZ), '--gwh-fox');
      litBell.material.transparent = true; litBell.material.opacity = 0.28; litBell.material.depthWrite = false;
      jellyGlow.push(litBell);
      jellyGlow.push(kit.flat(new T.TorusGeometry(0.84, 0.045, 6, 44), at(JX, JY - 0.01, JZ, 0, Math.PI / 2), '--gwh-fox'));
      var hang = new T.CylinderGeometry(0.05, 0.01, 0.7, 6);
      for (k = 0; k < 6; k++) {
        var ha = k / 6 * Math.PI * 2 + 0.3;
        var hm = kit.flat(hang, at(JX + Math.cos(ha) * 0.35, JY - 0.3, JZ + Math.sin(ha) * 0.35), '--gwh-fox');
        hm.material.transparent = true; hm.material.opacity = 0.5; hm.material.depthWrite = false;
        jellyGlow.push(hm);
      }
      jellyGlow.forEach(function (g) { kit.hide(g, true); });
      var jel = [], canals = [];
      for (k = 0; k < 16; k++) {
        var ca = k / 16 * Math.PI * 2;
        canals.push([bar, at(JX + Math.cos(ca) * 0.42, JY + 0.28, JZ + Math.sin(ca) * 0.42, -ca + Math.PI / 2, 0, -0.55).scale(V3(0.012, 0.012, 0.62))]);
      }
      for (k = 0; k < 22; k++) {
        var ta = k / 22 * Math.PI * 2, tl = 1.3 + hash(k, 5, 1) * 0.9;
        jel.push([new T.CylinderGeometry(0.006, 0.006, tl, 3), at(JX + Math.cos(ta) * 0.74, JY - tl / 2, JZ + Math.sin(ta) * 0.74, 0, (hash(k, 5, 3) - 0.5) * 0.15, (hash(k, 5, 2) - 0.5) * 0.12)]);
      }
      for (k = 0; k < 5; k++) jel.push([new T.CylinderGeometry(0.03, 0.012, 0.9, 5), at(JX + (k - 2) * 0.08, JY - 0.45, JZ, 0, 0, (k - 2) * 0.05)]);
      points(canals, '--gwh-fox');
      points(jel, '--gwh-sea');
      // Rings of sea sparkle spreading out from where a finger touched the
      // water at its edge, shown when somebody touches it.
      var ripples = [];
      [0.35, 0.75, 1.2, 1.7].forEach(function (rr, ri) {
        var dots = [];
        for (var d = 0; d < 18 + ri * 10; d++) {
          var da = d / (18 + ri * 10) * Math.PI * 2;
          spot(dots, 2.2 + Math.cos(da) * rr, 0.06, EDGE - 2.9 + Math.sin(da) * rr * 0.8, 0.034 - ri * 0.005, 0.012);
        }
        ripples.push(points(dots, '--gwh-sea'));
      });
      ripples.forEach(function (r) { kit.hide(r, true); });
      var touchWater = kit.press({ say: function () { return kit.hidden(ripples[0]) ? 'Touch the water' : 'Let the water settle'; },
        at: [kit.touch(3.6, 0.5, 2.8, at(2.2, 0.1, EDGE - 2.9))],
        press: function () {
          var show = kit.hidden(ripples[0]);
          ripples.forEach(function (r) { kit.hide(r, !show); });
          return show ? 'Where the water was touched, rings of blue sparkle spread out across it: the sea’s own light, made where it moves.'
                      : 'The water settles, and goes dark again but for the waves breaking.';
        } });
      var touchJelly = kit.press({ say: function () { return kit.hidden(litBell) ? 'Touch the jellyfish' : 'Let its glow go down'; },
        at: [kit.touch(2, 2.6, 2, at(JX, JY - 0.4, JZ))],
        press: function () {
          var show = kit.hidden(litBell);
          jellyGlow.forEach(function (g) { kit.hide(g, !show); });
          return show ? 'The jellyfish lights up green where it was touched, its bell glowing through and a band of light round its rim.'
                      : 'The jellyfish’s glow goes down, and it is almost clear again, only its edges showing.';
        } });
      panel('.hollow-panel.hollow-sea', -1, EDGE + 4.0, 'at the edge of the sea, where it sparkles');
      stops[stops.length - 1].acts = [touchWater];
      panel('.hollow-panel.hollow-jelly', 1, EDGE + 4.0, 'on the shore, with the jellyfish');
      stops[stops.length - 1].acts = [touchJelly, jellyRim];
      stops.push({ name: 'at the water’s edge, looking out to the crystal jelly over the sea', x: 0.4, z: EDGE + 0.6, yaw: -0.5, acts: [touchWater, touchJelly, jellyRim] });

      // ── FIRE: the bonfire on the shore at the end ─────────────────────────
      // The one light down here that is not alive, and the only one that
      // lights anything round it: laid in a ring of stones on the sand by the
      // water, sparks over it, and her own bonfire's panel standing beside it
      // with its back to the sea.
      var fx = 1.3, fz = EDGE + 1.5;
      var fire = new T.PointLight(kit.col('--gwh-flame'), 22, 14, 1.4);
      fire.position.set(fx, 1.1, fz);
      kit.scene.add(fire);
      for (var lgi = 0; lgi < 7; lgi++) {
        var la = lgi / 7 * Math.PI;
        kit.cyl(0.08, 0.1, 1.5, at(fx, 0.45, fz, la, 0, 0.9), '--gwh-fire-log', 0.02, 8);
      }
      for (var st = 0; st < 14; st++) {
        var sa = st / 14 * Math.PI * 2;
        kit.piece(new T.DodecahedronGeometry(0.16 + hash(st, 11, 1) * 0.06, 0), at(fx + Math.cos(sa) * 0.95, 0.1, fz + Math.sin(sa) * 0.95, st), '--gwh-hill', 0.02);
      }
      // The flames, each with its foot at the fire's heart so it can sway:
      // a tall one in the middle and tongues round it, the pale yellow inside.
      var flameList = [], flameMeshes = [];
      function tongue(r, h, x, z, ry, rz, ink, light) {
        var g = new T.ConeGeometry(r, h, 9); g.translate(0, h / 2, 0);
        var f = kit.flat(g, at(fx + x, 0.16, fz + z, ry, 0, rz), ink);
        flameList.push({ mesh: f, light: light || null }); flameMeshes.push(f);
      }
      tongue(0.44, 1.3, 0, 0, 0, 0, '--gwh-flame', fire);
      tongue(0.22, 0.9, -0.24, 0.1, 0.4, 0.2, '--gwh-flame');
      tongue(0.2, 0.8, 0.26, -0.06, -0.3, -0.22, '--gwh-flame');
      tongue(0.16, 0.62, 0.05, 0.28, 0.9, 0.16, '--gwh-flame');
      tongue(0.24, 0.85, 0.04, 0.12, 0, 0, '--gwh-flame-2');
      tongue(0.12, 0.55, -0.1, -0.05, 0.2, -0.1, '--gwh-flame-2');
      kit.flat(new T.CircleGeometry(0.62, 14), at(fx, 0.06, fz, 0, -Math.PI / 2), '--gwh-ember');
      var sparks = [], embers = [];
      for (k = 0; k < 26; k++) {
        var sy = 1.4 + hash(k, 12, 1) * 2.2, sr = (0.15 + (sy - 1.4) * 0.4) * (0.3 + hash(k, 12, 2) * 0.7), sa2 = hash(k, 12, 3) * Math.PI * 2;
        spot(hash(k, 12, 4) < 0.6 ? sparks : embers, fx + Math.cos(sa2) * sr, sy, fz + Math.sin(sa2) * sr, 0.016 + hash(k, 12, 5) * 0.012);
      }
      var aloft = [points(sparks, '--gwh-flame-2'), points(embers, '--gwh-ember')];
      // When it burns down: a bed of embers where the flames were, the logs
      // fallen in, and only a low red light. Put away until then.
      var bed = [], bedLumps = [];
      for (k = 0; k < 40; k++) {
        var ba2 = hash(k, 14, 1) * Math.PI * 2, br2 = Math.sqrt(hash(k, 14, 2)) * 0.55;
        bedLumps.push([new T.DodecahedronGeometry(1, 0), at(fx + Math.cos(ba2) * br2, 0.09, fz + Math.sin(ba2) * br2, k).scale(V3(0.06 + hash(k, 14, 3) * 0.05, 0.04, 0.06))]);
      }
      var glowing = [];
      for (k = 0; k < 30; k++) { var ga2 = hash(k, 15, 1) * Math.PI * 2, gr2 = Math.sqrt(hash(k, 15, 2)) * 0.5; spot(glowing, fx + Math.cos(ga2) * gr2, 0.13, fz + Math.sin(ga2) * gr2, 0.03, 0.015); }
      bed.push(points(bedLumps, '--gwh-ember'), points(glowing, '--gwh-flame-2'));
      bed.forEach(function (b) { kit.hide(b, true); });
      var embersLight = new T.PointLight(kit.col('--gwh-ember'), 7, 6, 1.6);
      embersLight.position.set(fx, 0.4, fz);
      kit.scene.add(embersLight);
      kit.hide(embersLight, true);
      var bonfire = kit.flames(flameList, { say: 'Let the bonfire’s flames sway',
        said: function (on) { return on ? 'The bonfire’s flames sway, each in its own time; it never flashes.' : 'The bonfire burns still again.'; } });
      var burn = kit.press({ say: function () { return kit.hidden(flameMeshes[0]) ? 'Build the bonfire up again' : 'Let it burn down to embers'; },
        at: [kit.touch(1.6, 1.8, 1.6, at(fx, 0.8, fz))],
        press: function () {
          var down = !kit.hidden(flameMeshes[0]);
          flameMeshes.concat(aloft).forEach(function (f) { kit.hide(f, down); });
          bed.forEach(function (b) { kit.hide(b, !down); });
          kit.hide(fire, down); kit.hide(embersLight, !down);
          return down ? 'The bonfire burns down to a bed of embers, glowing red in its ring of stones, and the shore goes dark round it.'
                      : 'The bonfire is built up again, and burns, lighting the stones and the shore round it.';
        } });

      // Round it on the sand: a log to sit on, a pile of logs for later,
      // driftwood, pebbles, and weed left by the tide, all seen only by the
      // fire's light.
      kit.cyl(0.2, 0.22, 1.9, at(fx - 1.6, 0.2, fz + 0.9, 0.9, 0, Math.PI / 2), '--gwh-fire-log', 0.03, 10);
      kit.flat(new T.CircleGeometry(0.17, 10), at(fx - 1.6 - Math.cos(0.9) * 0.96, 0.2, fz + 0.9 + Math.sin(0.9) * 0.96, -Math.PI / 2 + 0.9), '--gwh-hill');
      [[0, 0], [0.22, 0.02], [0.11, 0.18], [-0.1, 0.02]].forEach(function (lp, li2) {
        kit.cyl(0.09, 0.1, 0.9, at(fx + 1.55 + lp[0], 0.1 + lp[1], fz - 0.6 + li2 * 0.02, -0.2, 0, Math.PI / 2), '--gwh-fire-log', 0.015, 8);
      });
      [[-2.4, -0.8, 1.4, 0.4], [2.6, 0.7, 1.1, -0.7], [-0.4, -1.6, 0.8, 1.2]].forEach(function (dw) {
        kit.cyl(0.05, 0.07, dw[2], at(fx + dw[0], 0.05, fz + dw[1], dw[3], 0, Math.PI / 2), '--gwh-fire-log', 0.01, 7);
      });
      var pebbles = [];
      for (k = 0; k < 70; k++) {
        var px2 = fx + (hash(k, 16, 1) - 0.5) * 6, pz2 = fz + (hash(k, 16, 2) - 0.5) * 3.6;
        if (Math.hypot(px2 - fx, pz2 - fz) < 1.2) continue;
        var ps = 0.03 + hash(k, 16, 3) * 0.06;
        pebbles.push([new T.DodecahedronGeometry(1, 0), at(px2, ps * 0.4, pz2, k).scale(V3(ps * 1.3, ps * 0.6, ps))]);
      }
      solid(pebbles, '--gwh-hill', 0.01);
      var weed = [];
      for (k = 0; k < 40; k++) {
        var wx2 = (hash(k, 17, 1) - 0.5) * 9, wz2 = EDGE + 0.15 + hash(k, 17, 2) * 0.35;
        thread(weed, wx2, wz2, wx2 + (hash(k, 17, 3) - 0.5) * 0.5, wz2 + (hash(k, 17, 4) - 0.5) * 0.25, 0.03);
      }
      solid(weed, '--gwh-deep', false);
      var firePanel = kit.lift(frame, '.hollow-panel.hollow-fire', { w: 760, ww: 2.2, m: at(-1.5, 0.12, EDGE + 0.05, 0.12) });
      stops.push({ name: 'by the bonfire on the shore, under Fire', x: -0.6, z: EDGE + 3.2, yaw: -0.28, pitch: -0.2, frame: firePanel.el, acts: [bonfire, burn] });

      // Her page's own script, run against the panels here.
      kit.wire(frame, 'glow-wild.js');

      return {
        start: { x: 0, z: 0.4, yaw: 0 },
        bounds: { x: [-2.6, 2.6], z: [EDGE + 0.4, 0.8] },
        stops: stops,
        // Offered in a VR headset, as the yurt it opens off is (Ryan's ask,
        // 2026-11-07), so you walk in from the yurt without leaving the
        // headset. On a screen this changes nothing. What is lifted off her
        // page is not in the headset, which shows only the picture.
        vr: true
      };
    }
  };
})();

/* =============================================================================
   Club Chronic, walked into on Cel Street. Ryan's ask, 2026-10-31: the second
   room you can walk into, after Pink Pony Club. A second pass, 2026-11-04:
   the flyers as sediment rather than islands, the decks and the rack lifted
   off the page onto the walls to play here, the door policy pasted up by the
   door, a bar with something on it, and a stage somebody has just set up.

   IT IS THE CLUB'S WORLD AND NOBODY ELSE'S (§20): a black wall with paper stuck
   to it. A low basement, brick-black walls under flyers pasted down in layers
   going back years, flat and overlapping, photocopies and coloured paper with
   the marker written over the top of them and staples in their corners. Never
   the zine table's one cut sheet scattered at angles: every sheet here is
   pasted square and flat, and a newer one goes over an older one. A bar by the
   door, a small stage at the far end with the amps, the wedges, a mic stand
   and a kit on it, and on the wall behind the stage, pasted up like the
   biggest flyer in the room, the room's own page, to read and press as itself.
   What the page carries is pasted up too, on paper of its own over the
   sediment: the decks on the left wall, the six racks down the right, the door
   policy by the door, each to read and play here as on the page.

   IT DOES NOT STROBE, AT ANY SETTING, and nothing in it moves: the room's own
   rule, because the one obvious light a punk club has can put somebody on the
   floor. There is no stage light either. The light is flat and even from the
   door you came in by, the way the room's page has no light source at all, and
   the one working bulb over the front of the stage is lit and steady, never
   flickering, putting the faint wash --stage-lit names on the wall there.
   Every colour is one the room declares, by name. It keeps nothing, sends
   nothing and fetches nothing; its page arrives through Cel Street's screen(),
   and rack.js and club.js run against what is lifted, as on the page.
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  function hash(i, j, k) {
    var n = Math.imul(i + 11, 374761393) ^ Math.imul(j + 7, 668265263) ^ Math.imul(k + 3, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['club-chronic.html'] = {
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, D = 22, W = 12, H = 4.6, back = -D;
      var STAGE = 2.6, LIP = 0.6;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var XL = -W / 2, XR = W / 2;

      // FLAT, FROM THE DOOR: no lamp in the room and nothing that flickers.
      kit.scene.background = kit.col('--bootblack');
      kit.scene.add(new T.HemisphereLight(kit.col('--paste'), kit.col('--brick'), 2.5));
      var front = new T.DirectionalLight(kit.col('--paste'), 1.25);
      front.position.set(0, 3, 12); front.target.position.set(0, 1.5, back);
      kit.scene.add(front, front.target);
      // The one working bulb, over the front of the stage: lit, steady, and
      // only enough to put a faint wash on the wall and the stage there.
      var bulb = new T.PointLight(kit.col('--marker'), 2.2, 9, 1.6);
      bulb.position.set(0.8, H - 0.9, back + STAGE + 0.6);
      kit.scene.add(bulb);

      // THE FLYERS. Photocopied and on coloured paper, each printed in
      // bootblack, some with a photocopied picture as dots, some with the
      // marker over the top, and some a bill crammed edge to edge.
      var PAPERS = ['--paste', '--paste-2', '--newsprint', '--paste', '--marker', '--siren', '--paste-2', '--newsprint', '--paste', '--paste-2', '--siren', '--paste'];
      var sheets = PAPERS.map(function (paper, n) {
        return kit.paper(160, 220, function (c, w, h) {
          c.fillStyle = kit.ink(paper); c.fillRect(0, 0, w, h);
          c.fillStyle = kit.ink('--bootblack');
          var y = 12, kind = n % 4;
          if (kind === 3) {
            // A bill crammed edge to edge: the band names in blocks, one per
            // line, getting smaller down the sheet.
            for (var b = 0; y < h - 16; b++) {
              var bh = Math.max(7, 26 - b * 3);
              c.fillRect(10 + hash(n, b, 9) * 12, y, (w - 24) * (0.55 + 0.45 * hash(n, b, 8)), bh);
              y += bh + 6;
            }
          } else {
            c.fillRect(10, y, w - 20, 26 + (n % 3) * 8); y += 40 + (n % 3) * 8;
            if (kind === 0 || kind === 2) {
              for (var dy = 0; dy < 70; dy += 6) for (var dx = 0; dx < w - 30; dx += 6) {
                var r = 1 + 2.2 * hash(n, dx, dy);
                c.beginPath(); c.arc(15 + dx, y + dy, r, 0, Math.PI * 2); c.fill();
              }
              y += 80;
            }
            for (var l = 0; y < h - 18; l++, y += 13) c.fillRect(14, y, (w - 28) * (0.45 + 0.55 * hash(n, l, 1)), 7);
          }
          // The marker, over the top of the paper.
          if (n % 3 !== 1 && paper !== '--marker') {
            c.strokeStyle = kit.ink('--marker'); c.lineWidth = 7; c.lineCap = 'round';
            c.beginPath(); c.moveTo(18, h * 0.6); c.lineTo(w - 22, h * 0.48); c.moveTo(24, h * 0.72); c.lineTo(w - 40, h * 0.66); c.stroke();
          }
        });
      });
      // One flyer pasted down flat, with a staple in its top corners.
      function flyer(m, fw, fh, pick) {
        kit.sheet(sheets[Math.floor(pick * sheets.length) % sheets.length], fw, fh, m);
        box(0.03, 0.012, 0.003, M(m, at(-fw / 2 + 0.06, fh / 2 - 0.05, 0.002)), '--staple', false, false);
        box(0.03, 0.012, 0.003, M(m, at(fw / 2 - 0.06, fh / 2 - 0.05, 0.002)), '--staple', false, false);
      }
      // SEDIMENT: layers of flyers covering the wall from the dado up, every
      // layer a jittered grid a little in front of the one before it, so the
      // paper reads as years of it with the black wall only in the gaps.
      function sediment(seed, along, z0, z1, y0, y1, place) {
        for (var layer = 0; layer < 3; layer++) {
          var cw = 0.62 + layer * 0.05, ch = 0.82 + layer * 0.06;
          for (var u = z0 + cw / 2 + (layer % 2) * cw * 0.5; u < z1 - cw * 0.3; u += cw) {
            for (var v = y0 + ch / 2 + (layer === 1 ? ch * 0.4 : 0); v < y1 - ch * 0.3; v += ch) {
              var k = Math.round(u * 37 + v * 91) + layer * 7919;
              if (hash(seed, k, 11) < 0.12 + layer * 0.14) continue;
              var fw = 0.42 + hash(seed, k, 1) * 0.36, fh = fw * (1.18 + hash(seed, k, 2) * 0.28);
              var du = (hash(seed, k, 4) - 0.5) * cw * 0.5, dv = (hash(seed, k, 5) - 0.5) * ch * 0.45;
              var vv = Math.min(y1 - fh / 2, Math.max(y0 + fh / 2, v + dv));
              flyer(place(u + du, vv, 0.004 + layer * 0.006 + hash(seed, k, 6) * 0.003), fw, fh, hash(seed, k, 3));
            }
          }
        }
      }
      [-1, 1].forEach(function (s, si) {
        sediment(si + 1, 'z', -(D - STAGE - 0.4), -1.0, 0.62, H - 0.45, function (u, v, off) {
          return at(s * (W / 2 - off), v, u, s > 0 ? -Math.PI / 2 : Math.PI / 2);
        });
      });
      // The front wall either side of the door, inside.
      [-1, 1].forEach(function (s, si) {
        sediment(20 + si, 'x', 0, (W - 2.2) / 2, 0.62, H - 0.45, function (u, v, off) {
          return at(s * (1.1 + u), v, 1.0 - off, Math.PI);
        });
      });
      // And round the pillar halfway down.
      [0, 1, 2, 3].forEach(function (face) {
        var ry = face * Math.PI / 2;
        sediment(10 + face, 'u', -0.3, 0.3, 0.55, H - 0.6, function (u, v, off) {
          var d = 0.3 + off;
          return at(-2.4 + Math.sin(ry) * d + Math.cos(ry) * u, v, -11 + Math.cos(ry) * d - Math.sin(ry) * u, ry);
        });
      });

      // THE ROOM: a sticky floor, black walls with their brick showing under
      // the dado and over the paper, a low ceiling with its joists and pipes.
      box(W, 0.1, D + 2, at(0, -0.05, -D / 2 + 1), '--brick-2', false, false);
      for (var k = 0; k < 70; k++) {
        kit.flat(new T.CircleGeometry(0.08 + hash(k, 3, 3) * 0.32, 12), at(XL + 0.6 + hash(k, 3, 1) * (W - 1.2), 0.004 + k * 0.00001, -0.6 - hash(k, 3, 2) * (D - STAGE - 1.4), 0, -Math.PI / 2), '--grime');
      }
      box(0.4, H, D + 2, at(XL - 0.2, H / 2, -D / 2 + 1), '--brick');
      box(0.4, H, D + 2, at(XR + 0.2, H / 2, -D / 2 + 1), '--brick');
      box(W + 0.8, H, 0.4, at(0, H / 2, back - 0.2), '--brick');
      // Brick courses, where no paper is: under the dado and under the ceiling.
      [-1, 1].forEach(function (s) {
        for (var y = 0.1; y < 0.6; y += 0.15) box(0.01, 0.018, D, at(s * (W / 2 - 0.005), y, -D / 2 + 0.2), '--grime', false, false);
        for (y = H - 0.38; y < H - 0.02; y += 0.15) box(0.01, 0.018, D, at(s * (W / 2 - 0.005), y, -D / 2 + 0.2), '--grime', false, false);
        // A black dado rail along the top of the bricks, where the paste stops.
        box(0.05, 0.05, D, at(s * (W / 2 - 0.025), 0.6, -D / 2 + 0.2), '--grime', false);
      });
      box(W + 0.8, 0.3, D + 2, at(0, H + 0.15, -D / 2 + 1), '--bootblack', false, false);
      for (var j = -1.6; j > back; j -= 1.5) box(W, 0.18, 0.12, at(0, H - 0.09, j), '--grime', false);
      [[-3.2, 0.07], [0.9, 0.05], [3.8, 0.09]].forEach(function (pp, i) {
        kit.cyl(pp[1], pp[1], D, at(pp[0], H - 0.3 - i * 0.06, -D / 2, 0, Math.PI / 2), '--grime', 0.015, 10);
        for (var hz = -2; hz > back + 1; hz -= 3) box(0.03, 0.3, 0.03, at(pp[0], H - 0.15, hz), '--staple', false);
      });
      box((W - 2.2) / 2, H, 0.4, at(-(W + 2.2) / 4, H / 2, 1.2), '--brick');
      box((W - 2.2) / 2, H, 0.4, at((W + 2.2) / 4, H / 2, 1.2), '--brick');
      box(2.2, H - 2.5, 0.4, at(0, 2.5 + (H - 2.5) / 2, 1.2), '--brick');
      box(0.6, H, 0.6, at(-2.4, H / 2, -11), '--brick');
      // The fire door at the back right, and a cable run up the wall to it.
      box(1.0, 2.1, 0.06, at(XR - 1.0, 1.05, back + 0.03), '--grime');
      box(0.7, 0.04, 0.05, at(XR - 1.0, 1.0, back + 0.08), '--staple', false);

      // THE BAR by the door: a black counter with a grimy top and stools, the
      // back bar's shelves on the wall behind it, and the bar's own things.
      var bx = XR - 0.75;
      box(1.0, 1.05, 5.0, at(bx, 0.525, -4.4), '--bootblack');
      box(1.15, 0.08, 5.1, at(bx - 0.05, 1.09, -4.4), '--grime');
      box(0.04, 0.04, 5.0, at(bx - 0.56, 0.2, -4.4), '--staple', false);
      for (var st = 0; st < 4; st++) {
        var sz = -2.6 - st * 1.2;
        kit.cyl(0.04, 0.04, 0.7, at(bx - 1.0, 0.35, sz), '--staple', 0.015, 6);
        kit.cyl(0.2, 0.2, 0.08, at(bx - 1.0, 0.74, sz), '--bootblack', 0.02, 14);
        kit.cyl(0.13, 0.13, 0.02, at(bx - 1.0, 0.22, sz), '--staple', false, 10);
      }
      // Taps, a stack of cups, a few cans and a cup somebody left.
      for (var tp = 0; tp < 3; tp++) {
        box(0.06, 0.32, 0.06, at(bx - 0.1, 1.29, -3.0 - tp * 0.28), '--staple', 0.01);
        box(0.04, 0.12, 0.04, at(bx - 0.18, 1.48, -3.0 - tp * 0.28), PAPERS[tp], false);
      }
      kit.cyl(0.05, 0.04, 0.3, at(bx - 0.3, 1.28, -4.5), '--paste-2', 0.01, 10);
      [[-0.35, -5.2, '--siren'], [-0.25, -5.6, '--newsprint'], [-0.4, -6.1, '--marker'], [-0.32, -2.4, '--paste-2']].forEach(function (c, i) {
        kit.cyl(0.035, 0.035, i === 3 ? 0.11 : 0.13, at(bx + c[0], 1.19, c[1]), c[2], 0.008, 10);
      });
      // The back bar: two shelves along the wall behind, with bottles on them.
      [1.55, 2.15].forEach(function (y, row) {
        box(0.28, 0.04, 4.6, at(XR - 0.16, y, -4.4), '--grime', 0.01);
        for (var bt = 0; bt < 14; bt++) {
          var bz = -2.3 - bt * 0.32 - hash(row, bt, 1) * 0.08, bk = ['--newsprint', '--paste-2', '--grime', '--bootblack', '--siren'][Math.floor(hash(row, bt, 2) * 5)];
          var tall = 0.22 + hash(row, bt, 3) * 0.14;
          kit.cyl(0.045, 0.045, tall, at(XR - 0.16, y + 0.02 + tall / 2, bz), bk, 0.01, 8);
          kit.cyl(0.015, 0.02, 0.08, at(XR - 0.16, y + 0.06 + tall, bz), bk, false, 6);
        }
      });

      // A MERCH TABLE by the door on the left: folded shirts in stacks, the
      // way every gig has one, and a box of badges.
      var mx = XL + 0.7, mz = -4.6;
      box(0.8, 0.06, 1.8, at(mx, 0.76, mz), '--grime', 0.015);
      [[-0.3, -0.72], [0.3, -0.72], [-0.3, 0.72], [0.3, 0.72]].forEach(function (l) { box(0.04, 0.74, 0.04, at(mx + l[0], 0.37, mz + l[1]), '--staple', false); });
      [['--bootblack', -0.55], ['--paste', -0.05], ['--siren', 0.45]].forEach(function (s2, i) {
        for (var f = 0; f < 4; f++) box(0.42, 0.04, 0.36, at(mx - 0.08, 0.81 + f * 0.045, mz + s2[1], 0, 0, (hash(i, f, 1) - 0.5) * 0.08), s2[0], 0.006);
      });
      box(0.22, 0.08, 0.22, at(mx + 0.22, 0.83, mz + 0.72), '--paste-2', 0.008);

      // THE STAGE: a low black box with a paste edge and gaffer tape on it,
      // the amps either side of the wall behind with their grilles, two
      // wedges at the front, cables run across the boards, a mic off to the
      // side so it hides nothing, a set list taped down, and a kit on a rug.
      var sz0 = back + STAGE / 2;
      box(W, LIP, STAGE, at(0, LIP / 2, sz0), '--grime');
      box(W, 0.06, 0.06, at(0, LIP + 0.01, back + STAGE - 0.03), '--paste', false);
      [[-2.6, 0.3], [-0.4, -0.5], [2.2, 0.1], [3.4, -0.6]].forEach(function (g, i) {
        box(0.32, 0.004, 0.05, at(g[0], LIP + 0.003, sz0 + g[1], i), '--paste-2', false, false);
        box(0.32, 0.004, 0.05, at(g[0], LIP + 0.003, sz0 + g[1], i + Math.PI / 2), '--paste-2', false, false);
      });
      [[-4.9, -0.9, 3.2, 0.2], [4.9, -0.9, -3.0, 0.5], [-1.6, 0.9, 1.0, -0.4]].forEach(function (c) {
        var a = new T.Vector3(c[0], LIP + 0.015, back + 0.9 + c[1]), b = new T.Vector3(c[2], LIP + 0.015, back + 1.1 + c[3]);
        var span = b.clone().sub(a), mid = a.clone().add(b).multiplyScalar(0.5);
        var cable = new T.CylinderGeometry(0.015, 0.015, span.length(), 5);
        cable.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0, 1, 0), span.clone().normalize()));
        kit.piece(cable, at(mid.x, mid.y, mid.z), '--bootblack', false);
      });
      [-1, 1].forEach(function (s) {
        var ax = s * (W / 2 - 1.1);
        box(1.4, 1.5, 0.8, at(ax, LIP + 0.75, back + 0.6), '--bootblack');
        box(1.4, 1.1, 0.8, at(ax, LIP + 2.05, back + 0.6), '--bootblack');
        box(1.2, 1.2, 0.02, at(ax, LIP + 0.7, back + 1.01), '--grime', false);
        box(1.2, 0.8, 0.02, at(ax, LIP + 2.05, back + 1.01), '--grime', false);
        for (var gy = 0.2; gy < 1.25; gy += 0.12) box(1.16, 0.015, 0.01, at(ax, LIP + gy, back + 1.025), '--bootblack', false, false);
        box(0.4, 0.1, 0.02, at(ax, LIP + 1.38, back + 1.02), '--paste', false);
        for (var kn = 0; kn < 5; kn++) kit.cyl(0.03, 0.03, 0.03, at(ax - 0.4 + kn * 0.2, LIP + 2.44, back + 1.02, 0, Math.PI / 2), '--staple', false, 8);
        box(1.0, 0.45, 0.6, at(s * 2.5, LIP + 0.2, back + STAGE - 0.45, 0, 0.5), '--bootblack');
        box(0.8, 0.02, 0.3, at(s * 2.5, LIP + 0.36, back + STAGE - 0.32, 0, 0.5), '--grime', false);
      });
      var mic = -1.5;
      kit.cyl(0.02, 0.02, 1.5, at(mic, LIP + 0.75, back + STAGE - 0.7), '--staple', 0.01, 6);
      kit.cyl(0.18, 0.18, 0.02, at(mic, LIP + 0.01, back + STAGE - 0.7), '--staple', 0.01, 12);
      kit.cyl(0.04, 0.03, 0.18, at(mic, LIP + 1.55, back + STAGE - 0.72, 0, -0.5), '--bootblack', 0.01, 8);
      var list = kit.paper(120, 160, function (c, w, h) {
        c.fillStyle = kit.ink('--paste'); c.fillRect(0, 0, w, h);
        c.fillStyle = kit.ink('--bootblack');
        for (var ln = 0; ln < 10; ln++) c.fillRect(12, 14 + ln * 14, (w - 30) * (0.4 + 0.6 * hash(ln, 5, 5)), 7);
      });
      kit.sheet(list, 0.26, 0.34, at(mic + 0.5, LIP + 0.006, back + STAGE - 0.35, 0.2, -Math.PI / 2));
      var kx = XL + 2.2, kz = back + 1.1;
      box(2.0, 0.01, 1.6, at(kx, LIP + 0.006, kz + 0.1), '--siren', false, false);
      kit.cyl(0.36, 0.36, 0.36, at(kx, LIP + 0.37, kz, 0, Math.PI / 2), '--bootblack', 0.02, 20);
      kit.flat(new T.CircleGeometry(0.33, 20), at(kx, LIP + 0.37, kz + 0.19), '--paste');
      kit.cyl(0.18, 0.18, 0.2, at(kx + 0.45, LIP + 0.75, kz + 0.1), '--bootblack', 0.02, 16);
      kit.cyl(0.24, 0.24, 0.3, at(kx - 0.5, LIP + 0.3, kz + 0.2), '--bootblack', 0.02, 16);
      kit.cyl(0.16, 0.16, 0.08, at(kx + 0.05, LIP + 0.5, kz + 0.5), '--bootblack', 0.015, 14);
      [[0.75, 1.25], [-0.8, 1.3]].forEach(function (c) {
        kit.cyl(0.015, 0.015, c[1], at(kx + c[0], LIP + c[1] / 2, kz + 0.1), '--staple', false, 6);
        kit.cyl(0.3, 0.3, 0.01, at(kx + c[0], LIP + c[1], kz + 0.1), '--staple', 0.01, 18);
      });
      // The bulb: a bare bulb on its flex, lit and steady.
      kit.cyl(0.006, 0.006, 0.85, at(0.8, H - 0.45, back + STAGE + 0.6), '--bootblack', false, 4);
      kit.flat(new T.SphereGeometry(0.07, 12, 8), at(0.8, H - 0.92, back + STAGE + 0.6), '--marker');

      // THE ROOM'S OWN PAGE, pasted up on the wall behind the stage like the
      // biggest flyer in the room.
      var sw = 4.4, sh = sw * 800 / 1180, sy = LIP + 0.75 + sh / 2;
      box(sw + 0.3, sh + 0.3, 0.04, at(0, sy, back + 0.02), '--paste');
      kit.flat(new T.PlaneGeometry(0.05, 0.02), at(-sw / 2 - 0.05, sy + sh / 2 + 0.05, back + 0.05), '--staple');
      kit.flat(new T.PlaneGeometry(0.05, 0.02), at(sw / 2 + 0.05, sy + sh / 2 + 0.05, back + 0.05), '--staple');
      var frame = kit.screen(1180, 800, sw, at(0, sy, back + 0.06), 'Club Chronic’s own page, pasted up behind the stage');

      // WHAT THE PAGE CARRIES, PASTED UP OVER THE SEDIMENT on paper of its
      // own: a sheet of flyer stock with a staple at each corner, and the
      // page's own thing on it, to read and to play here.
      // Each sheet is printed like a big flyer, so from across the room, where
      // the words it carries are put away, it reads as one more bill on the
      // wall rather than a blank.
      var posters = [0, 1, 2].map(function (n) {
        return kit.paper(300, 420, function (c, w, h) {
          c.fillStyle = kit.ink(n === 2 ? '--paste-2' : '--paste'); c.fillRect(0, 0, w, h);
          c.fillStyle = kit.ink('--bootblack');
          c.fillRect(16, 16, w - 32, 54);
          for (var dy = 0; dy < 120; dy += 8) for (var dx = 0; dx < w - 44; dx += 8) {
            c.beginPath(); c.arc(22 + dx, 92 + dy, 1 + 2.8 * hash(n + 40, dx, dy), 0, Math.PI * 2); c.fill();
          }
          for (var l = 0, y = 232; y < h - 24; l++, y += 18) c.fillRect(20, y, (w - 40) * (0.4 + 0.6 * hash(n + 40, l, 1)), 9);
          c.strokeStyle = kit.ink('--marker'); c.lineWidth = 9; c.lineCap = 'round';
          c.beginPath(); c.moveTo(30, h * 0.66); c.lineTo(w - 36, h * 0.58); c.stroke();
        });
      });
      var postered = 0;
      function pasteUp(x, z, face, ww, wh, y0) {
        var g = at(x, 0, z, face);
        box(ww + 0.14, wh + 0.14, 0.01, M(g, at(0, y0 + wh / 2, 0.018)), '--paste', false);
        kit.sheet(posters[postered++ % posters.length], ww + 0.12, wh + 0.12, M(g, at(0, y0 + wh / 2, 0.0245)));
        [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(function (c) {
          box(0.035, 0.012, 0.004, M(g, at(c[0] * (ww / 2 + 0.02), y0 + wh / 2 + c[1] * (wh / 2 + 0.03), 0.03)), '--staple', false, false);
        });
        return M(g, at(0, y0, 0.03));
      }
      var stops = [
        { name: 'just inside the door', x: 0, z: -0.6, yaw: 0 },
        { name: 'at the bar', x: bx - 3.0, z: -4.4, yaw: RIGHT, pitch: 0.02 }
      ];
      // The door policy and the room's first words, by the door, on the left.
      var DOORZONE = [XL, 0, -6.5, 1.0];
      var pol = kit.lift(frame, '.policy', { w: 600, h: 760, ww: 1.9, m: pasteUp(XL + 0.03, -2.25, LEFT, 1.9, 760 * 1.9 / 600, 0.62), zone: DOORZONE });
      var lede = kit.lift(frame, '.lede', { w: 460, ww: 1.2, m: pasteUp(XL + 0.03, -4.6, LEFT, 1.2, 0.5, 1.6), zone: DOORZONE });
      stops.splice(1, 0,
        { name: 'by the door, at the door policy pasted up on the wall', where: 'at the door policy, pasted up by the door', x: XL + 2.6, z: -2.25, yaw: LEFT, pitch: 0.04, frame: pol.el },
        { name: 'at the merch table, the room’s first words over it', where: 'at the merch table by the door', x: XL + 2.6, z: -4.4, yaw: LEFT, pitch: 0.02, frame: lede.el });
      stops.push({ name: 'at the flyer wall, in layers going back years', x: XL + 2.8, z: -8.0, yaw: LEFT });

      // THE DECKS on the left wall towards the stage: YouTube, which is the
      // racks' screen and starts somewhere in the list, then Spotify, Apple
      // Music, and Qobuz's door.
      var DECKZONE = [XL, -0.4, back + STAGE, -10.2];
      var DECKS = ['On YouTube, the stage itself, which starts somewhere in the list', 'On Spotify', 'On Apple Music', 'On Qobuz, a door'];
      DECKS.forEach(function (name, n) {
        var z = -11.9 - n * 1.78, wh = 640 * 1.5 / 480;
        var d = kit.lift(frame, '.deck', { n: n, w: 480, h: 640, ww: 1.5, m: pasteUp(XL + 0.03, z, LEFT, 1.5, wh, 0.7), zone: DECKZONE });
        stops.push({ name: 'at the decks: ' + name, where: 'at the decks: ' + name, x: XL + 2.2, z: z, yaw: LEFT, pitch: 0.06, frame: d.el });
      });

      // THE RACK along the right wall, its six racks in the page's order.
      var RACKZONE = [0.4, XR, back + STAGE, -7.0];
      var NTH = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'];
      for (var rk = 0; rk < 6; rk++) {
        var rz = -8.3 - rk * 1.74, rh = 760 * 1.55 / 520;
        var rack = kit.lift(frame, '.rack', { n: rk, w: 520, h: 760, ww: 1.55, m: pasteUp(XR - 0.03, rz, RIGHT, 1.55, rh, 0.66), zone: RACKZONE });
        stops.push({ name: 'at rack ' + NTH[rk] + ' along the right wall', where: 'at rack ' + NTH[rk] + ', the records to play on the stage', x: XR - 2.3, z: rz, yaw: RIGHT, pitch: 0.08, frame: rack.el });
      }
      stops.push({ name: 'at the front of the stage, with the room’s own page pasted up behind it', x: 0, z: back + STAGE + 1.9, yaw: 0, pitch: 0.14, page: kit.page, frame: frame });

      // The racks play on the stage through rack.js, and club.js drops the
      // needle somewhere in the playlist, as on the page.
      kit.wire(frame, 'rack.js');
      kit.wire(frame, 'club.js');

      return {
        start: { x: 0, z: -0.6, yaw: 0 },
        bounds: { x: [XL + 0.9, XR - 0.9], z: [back + STAGE + 0.5, -0.4] },
        stops: stops
      };
    }
  };
})();

/* =============================================================================
   Club Chronic, walked into on Cel Street. Ryan's ask, 2026-10-31: the second
   room you can walk into, after Pink Pony Club.

   IT IS THE CLUB'S WORLD AND NOBODY ELSE'S (§20): a black wall with paper stuck
   to it. A low basement, brick-black walls under flyers pasted down in layers
   going back years, flat and overlapping, photocopies and coloured paper with
   the marker written over the top of them and staples in their corners. A bar
   by the door, a small stage at the far end with the amps, the wedges, a mic
   stand and a kit on it, and on the wall behind the stage, pasted up like the
   biggest flyer in the room, the room's own page, to read and press as itself.

   IT DOES NOT STROBE, AT ANY SETTING, and nothing in it moves: the room's own
   rule, because the one obvious light a punk club has can put somebody on the
   floor. There is no stage light either. The light is flat and even from the
   door you came in by, the way the room's page has no light source at all.
   Every colour is one the room declares, by name. It keeps nothing, sends
   nothing and fetches nothing; its page arrives through Cel Street's
   screen(). tools/make-cel-street.py holds each of those.
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

      // FLAT, FROM THE DOOR: no lamp in the room and nothing that flickers.
      kit.scene.background = kit.col('--bootblack');
      kit.scene.add(new T.HemisphereLight(kit.col('--paste'), kit.col('--brick'), 2.2));
      var front = new T.DirectionalLight(kit.col('--paste'), 1.2);
      front.position.set(0, 3, 12); front.target.position.set(0, 1.5, back);
      kit.scene.add(front, front.target);

      // THE FLYERS. A handful of sheets, photocopied and on coloured paper,
      // each printed in bootblack, and some with the marker over the top.
      var PAPERS = ['--paste', '--paste-2', '--newsprint', '--paste', '--marker', '--siren', '--paste-2', '--newsprint'];
      var sheets = PAPERS.map(function (paper, n) {
        return kit.paper(160, 220, function (c, w, h) {
          c.fillStyle = kit.ink(paper); c.fillRect(0, 0, w, h);
          c.fillStyle = kit.ink('--bootblack');
          var y = 12;
          // The bill's name, crammed across the top in a block.
          c.fillRect(10, y, w - 20, 26 + (n % 3) * 8); y += 40 + (n % 3) * 8;
          // A photocopied picture, as dots.
          if (n % 2 === 0) {
            for (var dy = 0; dy < 70; dy += 6) for (var dx = 0; dx < w - 30; dx += 6) {
              var r = 1 + 2.2 * hash(n, dx, dy);
              c.beginPath(); c.arc(15 + dx, y + dy, r, 0, Math.PI * 2); c.fill();
            }
            y += 80;
          }
          // The rest of the bill, in lines.
          for (var l = 0; y < h - 18; l++, y += 13) c.fillRect(14, y, (w - 28) * (0.45 + 0.55 * hash(n, l, 1)), 7);
          // The marker, over the top of the paper.
          if (n % 3 !== 1 && paper !== '--marker') {
            c.strokeStyle = kit.ink('--marker'); c.lineWidth = 7; c.lineCap = 'round';
            c.beginPath(); c.moveTo(18, h * 0.6); c.lineTo(w - 22, h * 0.48); c.moveTo(24, h * 0.72); c.lineTo(w - 40, h * 0.66); c.stroke();
          }
        });
      });
      // Pasted down flat on a wall, in layers, each a hair in front of the
      // last, with a staple in the top corners.
      function flyers(seed, count, place) {
        for (var n = 0; n < count; n++) {
          var fw = 0.42 + hash(seed, n, 1) * 0.45, fh = fw * (1.15 + hash(seed, n, 2) * 0.3);
          var p = place(n, fw, fh);
          kit.sheet(sheets[Math.floor(hash(seed, n, 3) * sheets.length)], fw, fh, p.m);
          box(0.03, 0.012, 0.003, new T.Matrix4().multiplyMatrices(p.m, at(-fw / 2 + 0.06, fh / 2 - 0.05, 0.002)), '--staple', false, false);
          box(0.03, 0.012, 0.003, new T.Matrix4().multiplyMatrices(p.m, at(fw / 2 - 0.06, fh / 2 - 0.05, 0.002)), '--staple', false, false);
        }
      }
      [-1, 1].forEach(function (s, si) {
        flyers(si + 1, 340, function (n, fw, fh) {
          var z = -1.2 - hash(si, n, 4) * (D - STAGE - 2.6), y = 0.55 + fh / 2 + hash(si, n, 5) * (H - 1.3 - fh);
          return { m: at(s * (W / 2 - 0.02 - n * 0.00022), y, z, s > 0 ? -Math.PI / 2 : Math.PI / 2) };
        });
      });
      // And round the pillar halfway down.
      [0, 1, 2, 3].forEach(function (face) {
        flyers(10 + face, 26, function (n, fw, fh) {
          var ry = face * Math.PI / 2, off = (hash(face, n, 6) - 0.5) * 0.25, y = 0.5 + fh / 2 + hash(face, n, 7) * (H - 1.2 - fh);
          var d = 0.32 + n * 0.0004;
          return { m: at(-2.4 + Math.sin(ry) * d + Math.cos(ry) * off, y, -11 + Math.cos(ry) * d - Math.sin(ry) * off, ry) };
        });
      });

      // THE ROOM: a sticky floor, black walls, a low ceiling with its pipes.
      box(W, 0.1, D + 2, at(0, -0.05, -D / 2 + 1), '--brick-2', false, false);
      for (var k = 0; k < 26; k++) {
        kit.flat(new T.CircleGeometry(0.25 + hash(k, 3, 3) * 0.6, 14), at(-W / 2 + 1 + hash(k, 3, 1) * (W - 2), 0.004, -1 - hash(k, 3, 2) * (D - STAGE - 2), 0, -Math.PI / 2), '--grime');
      }
      box(0.4, H, D + 2, at(-W / 2 - 0.2, H / 2, -D / 2 + 1), '--brick');
      box(0.4, H, D + 2, at(W / 2 + 0.2, H / 2, -D / 2 + 1), '--brick');
      box(W + 0.8, H, 0.4, at(0, H / 2, back - 0.2), '--brick');
      box(W + 0.8, 0.3, D + 2, at(0, H + 0.15, -D / 2 + 1), '--bootblack', false, false);
      [-3.2, 0.6, 3.6].forEach(function (x, i) {
        kit.cyl(0.09 + i * 0.03, 0.09 + i * 0.03, D, at(x, H - 0.25 - i * 0.05, -D / 2, 0, Math.PI / 2), '--staple', 0.02, 10);
      });
      box((W - 2.2) / 2, H, 0.4, at(-(W + 2.2) / 4, H / 2, 1.2), '--brick');
      box((W - 2.2) / 2, H, 0.4, at((W + 2.2) / 4, H / 2, 1.2), '--brick');
      box(2.2, H - 2.5, 0.4, at(0, 2.5 + (H - 2.5) / 2, 1.2), '--brick');
      // The pillar halfway down.
      box(0.6, H, 0.6, at(-2.4, H / 2, -11), '--brick');

      // THE BAR by the door: a black counter with a grimy top and stools.
      var bx = W / 2 - 0.75;
      box(1.0, 1.05, 5.0, at(bx, 0.525, -4.4), '--bootblack');
      box(1.15, 0.08, 5.1, at(bx - 0.05, 1.09, -4.4), '--grime');
      for (var st = 0; st < 4; st++) {
        var sz = -2.6 - st * 1.2;
        kit.cyl(0.04, 0.04, 0.7, at(bx - 1.0, 0.35, sz), '--staple', 0.015, 6);
        kit.cyl(0.2, 0.2, 0.08, at(bx - 1.0, 0.74, sz), '--bootblack', 0.02, 14);
      }

      // THE STAGE: a low black box with a paste edge, the amps either side
      // of the wall behind, two wedges at the front, a mic, and a kit.
      var sz0 = back + STAGE / 2;
      box(W, LIP, STAGE, at(0, LIP / 2, sz0), '--grime');
      box(W, 0.06, 0.06, at(0, LIP + 0.01, back + STAGE - 0.03), '--paste', false);
      [-1, 1].forEach(function (s) {
        var ax = s * (W / 2 - 1.1);
        box(1.4, 1.5, 0.8, at(ax, LIP + 0.75, back + 0.6), '--bootblack');
        box(1.4, 1.1, 0.8, at(ax, LIP + 2.05, back + 0.6), '--bootblack');
        box(1.2, 1.2, 0.02, at(ax, LIP + 0.7, back + 1.01), '--grime', false);
        box(1.2, 0.8, 0.02, at(ax, LIP + 2.05, back + 1.01), '--grime', false);
        box(0.4, 0.1, 0.02, at(ax, LIP + 1.38, back + 1.02), '--paste', false);
        box(1.0, 0.45, 0.6, at(s * 1.6, LIP + 0.2, back + STAGE - 0.45, 0, 0.5), '--bootblack');
      });
      kit.cyl(0.02, 0.02, 1.5, at(0.2, LIP + 0.75, back + STAGE - 0.7), '--staple', 0.01, 6);
      kit.cyl(0.18, 0.18, 0.02, at(0.2, LIP + 0.01, back + STAGE - 0.7), '--staple', 0.01, 12);
      kit.cyl(0.04, 0.03, 0.18, at(0.2, LIP + 1.55, back + STAGE - 0.72, 0, -0.5), '--bootblack', 0.01, 8);
      var kx = -W / 2 + 2.2, kz = back + 1.1;
      kit.cyl(0.36, 0.36, 0.36, at(kx, LIP + 0.37, kz, 0, Math.PI / 2), '--bootblack', 0.02, 20);
      kit.flat(new T.CircleGeometry(0.33, 20), at(kx, LIP + 0.37, kz + 0.19), '--paste');
      kit.cyl(0.18, 0.18, 0.2, at(kx + 0.45, LIP + 0.75, kz + 0.1), '--bootblack', 0.02, 16);
      kit.cyl(0.24, 0.24, 0.3, at(kx - 0.5, LIP + 0.3, kz + 0.2), '--bootblack', 0.02, 16);
      [[0.75, 1.25], [-0.8, 1.3]].forEach(function (c) {
        kit.cyl(0.015, 0.015, c[1], at(kx + c[0], LIP + c[1] / 2, kz + 0.1), '--staple', false, 6);
        kit.cyl(0.3, 0.3, 0.01, at(kx + c[0], LIP + c[1], kz + 0.1), '--staple', 0.01, 18);
      });

      // THE ROOM'S OWN PAGE, pasted up on the wall behind the stage like the
      // biggest flyer in the room.
      var sw = 4.4, sh = sw * 800 / 1180, sy = LIP + 0.75 + sh / 2;
      box(sw + 0.3, sh + 0.3, 0.04, at(0, sy, back + 0.02), '--paste');
      kit.flat(new T.PlaneGeometry(0.05, 0.02), at(-sw / 2 - 0.05, sy + sh / 2 + 0.05, back + 0.05), '--staple');
      kit.flat(new T.PlaneGeometry(0.05, 0.02), at(sw / 2 + 0.05, sy + sh / 2 + 0.05, back + 0.05), '--staple');
      var frame = kit.screen(1180, 800, sw, at(0, sy, back + 0.06), 'Club Chronic’s own page, pasted up behind the stage');

      return {
        start: { x: 0, z: -0.6, yaw: 0 },
        bounds: { x: [-W / 2 + 0.9, W / 2 - 0.9], z: [back + STAGE + 0.5, -0.4] },
        stops: [
          { name: 'just inside the door', x: 0, z: -0.6, yaw: 0 },
          { name: 'at the bar', x: bx - 2.4, z: -4.4, yaw: -Math.PI / 2 },
          { name: 'at the flyer wall, in layers going back years', x: -W / 2 + 2.8, z: -7, yaw: Math.PI / 2 },
          { name: 'at the front of the stage, with the room’s own page pasted up behind it', x: 0, z: back + STAGE + 0.6, yaw: 0, page: kit.page, frame: frame }
        ]
      };
    }
  };
})();

/* =============================================================================
   Volunteers, walked into on Cel Street. Ryan's ask, 2026-10-31: the street's
   rooms opened one by one, down the street in order.

   A CLOTH ON THE LOOM, HALF WOVEN (§130). The loom stands in the middle of a
   plain room with its back to the one window, so you face the weaver's side
   and the day comes towards you through the bare warp. The warp is our
   values, one undyed thread the same from one end of the cloth to the other;
   the weft is what each person brings, a band of its own dye for every thing
   on the page's help list, two rows to a band, and in each row the warp goes
   over the weft at every other thread and at the others in the next: the
   page's own drawing (tools/make-volunteers.py), woven again here on a sheet
   so a band cannot be drawn without the warp crossing it.

   THE BANDS ARE THE PAGE'S, IN ITS ORDER. Which dye each band is comes out of
   data/volunteers.json's help list, newest row first under the bare warp, as
   the page draws it; the tool there refuses two of one dye touching and four
   in a rainbow's order, so this cloth keeps that too. They are written below
   in BANDS between cel:bands markers by tools/make-cel-street.py, never by hand.

   THE LIGHT COMES THROUGH THE BARE WARP, AND ONLY IN THE DRAWING. One level
   light from the window behind the loom, the room's walls holding the rest of
   the day out, so the warp threads throw their stripes on the floor in front
   of the loom and nowhere near a word: every word here is the page's own,
   lifted onto flat undyed linen, never with anything striped or lit behind
   it. The shuttle lies on the newest row where somebody put it down, with the
   next thread on its bobbin in the warp's own undyed colour; it does not fly.

   NOTHING MOVES, AT ANY SETTING. Every colour is one §130 declares, by name.
   There is no form here: the volunteer form is on stimpunks.org, linked from
   the page's own words. It keeps nothing, sends nothing and fetches nothing;
   the page arrives through Cel Street's screen(), and
   tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['volunteers.html'] = {
    name: 'Volunteers',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var W = 7.6, D = 9, H = 3.2, back = -D;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;

      // The bands, newest first, out of data/volunteers.json's help list.
      // cel:bands:begin
      var BANDS = ["--vol-madder", "--vol-woad", "--vol-weld", "--vol-cochineal", "--vol-lichen", "--vol-walnut", "--vol-indigo", "--vol-onion", "--vol-logwood", "--vol-weld", "--vol-madder", "--vol-lichen", "--vol-woad", "--vol-onion"];
      // cel:bands:end

      // THE DAY BEHIND THE LOOM, coming in level at the window and nowhere
      // else, and a soft fill so the room's own linen can be read.
      kit.scene.background = kit.col('--vol-wall');
      kit.scene.add(new T.HemisphereLight(kit.col('--vol-day'), kit.col('--vol-wood'), 1.6));
      var day = new T.DirectionalLight(kit.col('--vol-day'), 2.4);
      day.position.set(0.4, 2.7, back - 6);
      day.target.position.set(0, 0.2, -3.2);
      day.castShadow = true;
      day.shadow.mapSize.set(2048, 2048);
      var sc = day.shadow.camera;
      sc.left = -5; sc.right = 5; sc.top = 5; sc.bottom = -5; sc.near = 0.5; sc.far = 18;
      day.shadow.bias = -0.0004; day.shadow.normalBias = 0.02;
      kit.scene.add(day, day.target);

      // THE ROOM: boards underfoot, linen walls, and the door you came in by.
      box(W, 0.1, D, at(0, -0.05, -D / 2), '--vol-wood', false, false);
      for (var b = 1; b < 12; b++) box(0.012, 0.012, D, at(-W / 2 + b * W / 12, 0.003, -D / 2), '--vol-knot', false, false);
      box(0.3, H, D, at(-W / 2 - 0.15, H / 2, -D / 2), '--vol-wall');
      box(0.3, H, D, at(W / 2 + 0.15, H / 2, -D / 2), '--vol-wall');
      box(W + 0.6, H, 0.3, at(0, H / 2, 0.15), '--vol-wall');
      box(W + 0.6, 0.2, D + 0.6, at(0, H + 0.1, -D / 2), '--vol-wall', false, false);
      box(1.2, 2.3, 0.08, at(0, 1.15, -0.04), '--vol-wood', 0.01);
      box(0.1, 0.04, 0.06, at(0.45, 1.05, -0.1), '--vol-knot', false);
      [[-W / 2 + 0.02, -D / 2, LEFT, D], [W / 2 - 0.02, -D / 2, RIGHT, D], [0, -0.02, Math.PI, W]].forEach(function (w) {
        box(w[3], 0.16, 0.04, at(w[0], 0.08, w[1], w[2]), '--vol-wood', false);
      });

      // THE BACK WALL AND ITS ONE WINDOW, the wall in pieces round the opening
      // so it holds the day out everywhere but there, the sky behind it.
      var ww = 3.6, wy = 0.95, wh = 1.95;
      box((W - ww) / 2 + 0.3, H, 0.3, at(-(W + ww) / 4 - 0.075, H / 2, back - 0.15), '--vol-wall');
      box((W - ww) / 2 + 0.3, H, 0.3, at((W + ww) / 4 + 0.075, H / 2, back - 0.15), '--vol-wall');
      box(ww, wy, 0.3, at(0, wy / 2, back - 0.15), '--vol-wall');
      box(ww, H - wy - wh, 0.3, at(0, (wy + wh + H) / 2, back - 0.15), '--vol-wall');
      kit.flat(new T.PlaneGeometry(ww + 2, wh + 2), at(0, wy + wh / 2, back - 1.2), '--vol-sky');
      kit.flat(new T.PlaneGeometry(ww + 2, 0.5), at(0, wy + 0.2, back - 1.19), '--vol-day');
      // The frame, the mullion and the transom, in the loom's wood.
      [-1, 1].forEach(function (s) { box(0.1, wh + 0.1, 0.36, at(s * ww / 2, wy + wh / 2, back - 0.1), '--vol-wood', 0.01); });
      box(ww + 0.2, 0.1, 0.36, at(0, wy + wh, back - 0.1), '--vol-wood', 0.01);
      box(ww + 0.3, 0.08, 0.46, at(0, wy - 0.04, back + 0.02), '--vol-wood', 0.01);
      box(0.06, wh, 0.12, at(0, wy + wh / 2, back - 0.2), '--vol-wood', false);
      box(ww, 0.06, 0.12, at(0, wy + wh * 0.62, back - 0.2), '--vol-wood', false);

      // THE LOOM, its back to the window: two uprights, the beam at the top the
      // warp is tied to, and the breast beam at the bottom the cloth winds round.
      var LZ = -6.4, LX = 1.5, TOP = 2.82, FELL = 1.62, BEAM = 0.66;
      [-1, 1].forEach(function (s) {
        box(0.14, 3.0, 0.16, at(s * (LX + 0.22), 1.5, LZ), '--vol-wood', 0.012);
        box(0.14, 0.12, 0.9, at(s * (LX + 0.22), 0.06, LZ), '--vol-wood', 0.01);
      });
      cyl(0.07, 0.07, 2 * LX + 0.6, at(0, TOP + 0.04, LZ, 0, 0, Math.PI / 2), '--vol-wood', 0.012, 14);
      cyl(0.08, 0.08, 2 * LX + 0.6, at(0, BEAM - 0.07, LZ + 0.02, 0, 0, Math.PI / 2), '--vol-wood', 0.012, 14);
      // The cloth already woven, wound round the breast beam in the bands' dyes.
      cyl(0.095, 0.095, 2 * LX, at(0, BEAM - 0.07, LZ + 0.02, 0, 0, Math.PI / 2), BANDS[BANDS.length - 1], 0.006, 18);

      // THE CLOTH: two rows of weft to a band, and in each row the warp over the
      // weft at every other thread, at the others in the next row, as the page
      // draws it; the light lying across its top, as the page has it too.
      var PW = 1800, PH = Math.round(1800 * (FELL - BEAM) / (2 * LX)), PITCH = 24;
      var ROWH = PH / (2 * BANDS.length);
      var cloth = kit.paper(PW, PH, function (c, w, h) {
        var threads = [];
        for (var x = PITCH / 2; x < w; x += PITCH) threads.push(x);
        BANDS.forEach(function (dye, k) {
          for (var r = 0; r < 2; r++) {
            var y = (2 * k + r) * ROWH;
            c.fillStyle = kit.ink(dye); c.fillRect(0, y, w, ROWH + 0.6);
            c.strokeStyle = kit.ink('--vol-warp'); c.lineWidth = 10.8; c.lineCap = 'round';
            c.beginPath();
            threads.forEach(function (tx, j) {
              if ((j + r) % 2 === 0) { c.moveTo(tx, y + 2); c.lineTo(tx, y + ROWH - 2); }
            });
            c.stroke();
          }
          c.globalAlpha = 0.5; c.strokeStyle = kit.ink('--vol-knot'); c.lineWidth = 1.6;
          c.beginPath(); c.moveTo(0, (2 * k + 2) * ROWH); c.lineTo(w, (2 * k + 2) * ROWH); c.stroke();
          c.globalAlpha = 1;
        });
        // The selvedges, where the weft turns round the outermost thread.
        c.fillStyle = kit.ink('--vol-warp'); c.fillRect(0, 0, 12, h); c.fillRect(w - 12, 0, 12, h);
        // The day lying across the top of the cloth.
        c.fillStyle = kit.ink('--vol-day');
        c.globalAlpha = 0.5; c.fillRect(0, 0, w, 6);
        c.globalAlpha = 0.22; c.fillRect(0, 6, w, 44);
        c.globalAlpha = 1;
      });
      kit.sheet(cloth, 2 * LX, FELL - BEAM, at(0, (FELL + BEAM) / 2, LZ));

      // THE BARE WARP above the newest row, up to the beam, each thread in its
      // own undyed colour, with the window's day between them.
      for (var tx = -LX + 0.02; tx < LX; tx += 0.04) {
        box(0.007, TOP - FELL, 0.007, at(tx, (TOP + FELL) / 2, LZ), '--vol-thread', false);
      }

      // THE SHUTTLE lying on the newest row, its bobbin wound with the next
      // thread in the warp's own colour, the thread run out to the selvedge.
      var SX = 0.3, SY = FELL + 0.02, SZ = LZ + 0.05;
      var hull = new T.SphereGeometry(0.03, 18, 10); hull.scale(6.4, 1, 1.3);
      kit.piece(hull, at(SX, SY, SZ), '--vol-wood', 0.004);
      cyl(0.016, 0.016, 0.16, at(SX, SY + 0.004, SZ, 0, 0, Math.PI / 2), '--vol-knot', false, 12);
      cyl(0.014, 0.014, 0.12, at(SX, SY + 0.008, SZ, 0, 0, Math.PI / 2), '--vol-warp', false, 12);
      box(LX - SX - 0.1, 0.005, 0.005, at((SX + 0.1 + LX) / 2, SY + 0.004, SZ), '--vol-warp', false);

      // THE WEAVER'S BENCH, empty, on your side of the loom.
      box(1.6, 0.06, 0.36, at(0, 0.5, LZ + 1.05), '--vol-wood', 0.01);
      [-1, 1].forEach(function (s) {
        [-1, 1].forEach(function (f) { box(0.05, 0.47, 0.05, at(s * 0.68, 0.235, LZ + 1.05 + f * 0.13), '--vol-wood', 0.006); });
      });

      // THE ROOM'S OWN PAGE on the right-hand wall by the door: the way in is
      // the volunteer form its words link to, and nothing else here takes it.
      var pw = 2.4, ph = pw * 800 / 1180, py = 0.85 + ph / 2;
      var pg = at(W / 2 - 0.02, 0, -1.7, RIGHT);
      box(pw + 0.12, ph + 0.12, 0.05, M(pg, at(0, py, 0)), '--vol-wood', 0.01);
      var page = kit.screen(1180, 800, pw, M(pg, at(0, py, 0.04)), 'Volunteers’ own page, on the right-hand wall by the door');

      // The room's name over the left-hand wall's first stretch, and the page's
      // words under its cloth on a board standing beside the loom.
      var head = kit.lift(page, '.vol-head', { w: 900, ww: 1.6, m: at(-W / 2 + 0.02, 1.3, -1.4, LEFT) });
      var words = kit.lift(page, '.vol-cloth__words', { w: 620, ww: 1.0, m: at(-LX - 0.85, 0.9, LZ + 0.35, 0.35) });
      box(1.1, 0.05, 0.06, at(-LX - 0.85, 0.86, LZ + 0.32, 0.35), '--vol-wood', 0.006);

      var stops = [
        { name: 'just inside the door, the loom in front of you and the day coming through its warp', x: 0, z: -0.8, yaw: 0, pitch: 0.04 },
        { name: 'at the loom, the cloth half woven and every band crossed by the warp', x: 0, z: LZ + 2.0, yaw: 0, pitch: -0.08 },
        { name: 'close to the cloth, the warp going over and under every row', x: -0.5, z: LZ + 1.2, yaw: 0, pitch: -0.32 },
        { name: 'under the bare warp, the window’s day between the threads', x: 0, z: LZ + 1.6, yaw: 0, pitch: 0.34 },
        { name: 'at the shuttle, lying on the newest row with the next thread on it', x: SX, z: LZ + 0.95, yaw: 0, pitch: -0.42 },
        { name: 'beside the loom, with the page’s words for the cloth', x: -LX - 0.85 + 1.3 * Math.sin(0.35), z: LZ + 0.35 + 1.3 * Math.cos(0.35), yaw: 0.35, pitch: -0.12, frame: words.el },
        { name: 'at the right-hand wall by the door, with the room’s own page on it', x: W / 2 - 2.3, z: -1.7, yaw: RIGHT, pitch: 0.06, page: kit.page, frame: page },
        { name: 'at the left-hand wall, with the room’s name', x: -W / 2 + 2.2, z: -1.4, yaw: LEFT, pitch: 0.12, frame: head.el }
      ];

      // THE PAGE'S WORDS, lifted onto the linen as the page has them, along
      // both side walls and on the wall behind you either side of the door.
      var lede = kit.lift(page, '.vol-lede', { w: 640, h: 640, ww: 1.3, m: at(-W / 2 + 0.02, 0.85, -3.0, LEFT) });
      stops.push({ name: 'at the left-hand wall, with what the room is for', x: -W / 2 + 2.1, z: -3.0, yaw: LEFT, pitch: 0.1, frame: lede.el });
      var PARTS = [
        { n: 0, wall: LEFT, z: -4.6, words: 'at the left-hand wall, with the warp: what has to fit' },
        { n: 1, wall: LEFT, z: -6.2, words: 'at the left-hand wall, with the weft: what we need help with' },
        { n: 2, wall: LEFT, z: -7.8, words: 'at the left-hand wall, with an ecology of care' },
        { n: 3, wall: RIGHT, z: -3.5, words: 'at the right-hand wall, with roles in social change' },
        { n: 4, wall: RIGHT, z: -5.1, words: 'at the right-hand wall, with the playbooks' },
        { n: 5, wall: RIGHT, z: -6.6, words: 'at the right-hand wall, with how to volunteer' },
        { n: 6, wall: RIGHT, z: -8.1, words: 'at the right-hand wall, with what is not on this loom' },
        { n: 7, wall: Math.PI, x: -3.0, words: 'at the wall behind you, with who reads the channel and for how long' },
        { n: 9, wall: Math.PI, x: -1.55, words: 'at the wall behind you, with whose this is' },
        { n: 8, wall: Math.PI, x: 1.55, words: 'at the wall behind you, with next door' }
      ];
      PARTS.forEach(function (p) {
        var m, stop;
        if (p.wall === Math.PI) {
          m = at(p.x, 0.85, -0.04, Math.PI);
          stop = { x: p.x, z: -2.2, yaw: Math.PI };
        } else {
          var x = p.wall === LEFT ? -W / 2 + 0.02 : W / 2 - 0.02;
          m = at(x, 0.85, p.z, p.wall);
          stop = { x: p.wall === LEFT ? -W / 2 + 2.1 : W / 2 - 2.1, z: p.z, yaw: p.wall };
        }
        var it = kit.lift(page, '.vol-part', { n: p.n, w: 640, h: 640, ww: 1.3, m: m });
        stop.name = p.words; stop.pitch = 0.1; stop.frame = it.el;
        stops.push(stop);
      });

      return {
        start: { x: 0, z: -0.8, yaw: 0 },
        bounds: {
          x: [-W / 2 + 0.9, W / 2 - 0.9], z: [LZ + 0.9, -0.6],
          areas: [
            { x: [-W / 2 + 0.9, W / 2 - 0.9], z: [LZ + 0.9, -0.6] },
            { x: [-W / 2 + 0.9, -LX - 0.6], z: [back + 0.8, LZ + 1.2] },
            { x: [LX + 0.6, W / 2 - 0.9], z: [back + 0.8, LZ + 1.2] }
          ]
        },
        stops: stops
      };
    }
  };
})();

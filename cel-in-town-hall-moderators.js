/* =============================================================================
   The Moderators' room, walked into on Cel Street, through its door off the
   Town Hall. Ryan's ask, 2026-11-01: the rooms behind the doors.

   IT IS THE ROOM'S OWN WORLD AND SHARES NOTHING WITH THE HALL IT OPENS OFF
   (§81). The hall is a rotunda at noon under one disc of sun; this is a low
   room up above the street at night, and THERE IS NO LAMP IN IT. The one window
   in the far wall looks down on the shopfronts, and their own colours come up
   through it and lie on the ceiling as bands, side by side, every shop's colour
   kept apart from the next by the dark line of a window bar and never mixed
   into it. The room that looks after the street is lit by the street.

   THE REPEATER IS THE ONE TO WATCH: there the road's light comes off cloud,
   blended into one grey. If the bands up there ever run into one another, this
   has become the Repeater with a roof, so each is its own sheet of its own
   colour with a gap of the ceiling's dark between it and the next.

   THE RADIO ON THE DESK IS OFF, AND DARK: its readout is the window's dark
   glass and nothing on it is lit. The room's real radio, its call and its desk
   are the base's and talk to the CB, so they stay on the room's own page, which
   hangs on the right-hand wall. What is lifted off that page is its words only:
   the room's name and its line, what the base looks after, and why the
   street's own light. Nothing is retyped and nobody is drawn.

   NOTHING MOVES AT ANY SETTING. Every colour is one §81 declares, by name. It
   keeps nothing, sends nothing and fetches nothing; its page arrives through
   Cel Street's screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['town-hall-moderators.html'] = {
    name: 'The Moderators’ room',
    from: 'town-hall.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var W = 8, D = 8, H = 2.8, back = -D;
      var DX = 1.8, DW = 1.0, DH = 2.2;               // the door, in the front wall
      var WX = 0, WW = 2.0, WY0 = 0.85, WY1 = 2.1;     // the window, in the far wall

      // NO LAMP: only enough of the room's own dark that the walls, the desk
      // and the chair can be told from it. The light is the street's, below.
      kit.scene.background = kit.col('--md-dark');
      kit.scene.add(new T.HemisphereLight(kit.col('--md-dim'), kit.col('--md-dark'), 1.5));

      // An unlit sheet: the street's colours and the window they come through,
      // which glow of themselves rather than being lit by anything in here.
      function glow(map, w, h, m) {
        var mesh = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ map: map, transparent: true, depthWrite: false }));
        mesh.matrixAutoUpdate = false;
        mesh.matrix.copy(m);
        mesh.matrixWorldNeedsUpdate = true;
        kit.scene.add(mesh);
      }

      // THE ROOM: a dark floor, dark walls, and the ceiling in the panels' colour.
      box(W, 0.06, D + 0.4, at(0, -0.03, -D / 2), '--md-dark', false, false);
      box(0.3, H, D, at(-W / 2 - 0.15, H / 2, -D / 2), '--md-dark');
      box(0.3, H, D, at(W / 2 + 0.15, H / 2, -D / 2), '--md-dark');
      box(W + 0.6, 0.2, D + 0.6, at(0, H + 0.1, -D / 2), '--md-panel', false, false);
      [[-W / 2 + 0.02, -D / 2, LEFT, D], [W / 2 - 0.02, -D / 2, RIGHT, D]].forEach(function (w) {
        box(w[3], 0.1, 0.04, at(w[0], 0.05, w[1], w[2]), '--md-frame', false);
        box(w[3], 0.06, 0.04, at(w[0], H - 0.03, w[1], w[2]), '--md-frame', false);
      });

      // THE FAR WALL, and the one window in it, its bars in the frame colour.
      var sw = (W - WW) / 2;
      box(sw, H, 0.3, at(-W / 2 + sw / 2, H / 2, back - 0.15), '--md-dark');
      box(sw, H, 0.3, at(W / 2 - sw / 2, H / 2, back - 0.15), '--md-dark');
      box(WW, WY0, 0.3, at(WX, WY0 / 2, back - 0.15), '--md-dark');
      box(WW, H - WY1, 0.3, at(WX, (H + WY1) / 2, back - 0.15), '--md-dark');
      box(W, 0.06, 0.04, at(0, H - 0.03, back + 0.02), '--md-frame', false);
      // The glass, dark, and far down through it the shopfronts' own colours,
      // each its own and side by side, the way the page draws them.
      var COLS = ['--md-pink', '--md-gold', '--md-green', '--md-blue', '--md-violet'];
      var glass = kit.paper(400, 250, function (c, w, h) {
        c.fillStyle = kit.ink('--md-glass'); c.fillRect(0, 0, w, h);
        var cw = w / COLS.length;
        COLS.forEach(function (name, i) {
          c.globalAlpha = 0.7;
          c.fillStyle = kit.ink(name);
          c.fillRect(i * cw + 4, h * 0.78, cw - 8, h * 0.18);
        });
        c.globalAlpha = 1;
      });
      glow(glass, WW, WY1 - WY0, at(WX, (WY0 + WY1) / 2, back - 0.12));
      // The frame, its bars, and the sill.
      [-1, 1].forEach(function (s) { box(0.08, WY1 - WY0 + 0.08, 0.14, at(WX + s * (WW / 2 + 0.04), (WY0 + WY1) / 2, back - 0.05), '--md-frame', 0.008); });
      box(WW + 0.16, 0.08, 0.14, at(WX, WY1 + 0.04, back - 0.05), '--md-frame', 0.008);
      box(WW + 0.3, 0.06, 0.32, at(WX, WY0 - 0.03, back + 0.04), '--md-frame', 0.008);
      for (var b = 1; b < 4; b++) box(0.04, WY1 - WY0, 0.06, at(WX - WW / 2 + b * WW / 4, (WY0 + WY1) / 2, back - 0.06), '--md-frame', false);
      box(WW, 0.04, 0.06, at(WX, (WY0 + WY1) / 2, back - 0.06), '--md-frame', false);

      // THE STREET'S COLOURS ON THE CEILING: a band for every colour, rising out
      // of the window and widening towards the door, each with the dark of a
      // window bar either side of it so no two ever touch or mix. One sheet per
      // band, so not even their edges are shared.
      var CD = D - 0.4;
      COLS.forEach(function (name, i) {
        var band = kit.paper(256, 512, function (c, w, h) {
          // h is the window end, 0 the door end; the band fans out as it comes.
          var nearL = 0.36 + i * 0.07, nearR = nearL + 0.055;
          var farL = 0.02 + i * 0.2, farR = farL + 0.16;
          var g = c.createLinearGradient(0, h, 0, 0);
          g.addColorStop(0, kit.ink(name));
          g.addColorStop(1, kit.ink('--md-panel'));
          c.globalAlpha = 0.85;
          c.fillStyle = g;
          c.beginPath();
          c.moveTo(nearL * w, h); c.lineTo(nearR * w, h);
          c.lineTo(farR * w, 0); c.lineTo(farL * w, 0);
          c.closePath(); c.fill();
        });
        glow(band, W - 0.2, CD, at(0, H - 0.005 - i * 0.0005, back + CD / 2 + 0.05, 0, Math.PI / 2));
      });

      // THE FRONT WALL, behind you, and in it the door from the Town Hall, shut.
      var lw = DX - DW / 2 + W / 2, rw = W / 2 - (DX + DW / 2);
      box(lw, H, 0.3, at(-W / 2 + lw / 2, H / 2, 0.15), '--md-dark');
      box(rw, H, 0.3, at(W / 2 - rw / 2, H / 2, 0.15), '--md-dark');
      box(DW, H - DH, 0.3, at(DX, (H + DH) / 2, 0.15), '--md-dark');
      [-1, 1].forEach(function (s) { box(0.1, DH + 0.05, 0.36, at(DX + s * (DW / 2 + 0.05), (DH + 0.05) / 2, 0.12), '--md-frame', 0.01); });
      box(DW + 0.3, 0.1, 0.36, at(DX, DH + 0.05, 0.12), '--md-frame', 0.01);
      box(DW, DH, 0.06, at(DX, DH / 2, 0.06), '--md-panel', false);
      cyl(0.03, 0.03, 0.12, at(DX - DW / 2 + 0.14, 1.05, -0.04, 0, Math.PI / 2), '--md-frame', false, 10);

      // THE DESK against the left-hand wall, and the radio on it, OFF: its
      // readout the window's own dark glass, nothing on it lit.
      var KX = -W / 2 + 0.55, KZ = -2.6, KW = 2.2, KD = 0.8, KH = 0.76;
      var desk = at(KX, 0, KZ, LEFT);
      box(KW, 0.06, KD, M(desk, at(0, KH, 0)), '--md-frame', 0.01);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (p) {
        box(0.06, KH, 0.06, M(desk, at(p[0] * (KW / 2 - 0.08), KH / 2, p[1] * (KD / 2 - 0.08))), '--md-frame', false);
      });
      var radio = M(desk, at(-0.3, KH + 0.03, 0));
      box(0.62, 0.2, 0.32, M(radio, at(0, 0.1, 0)), '--md-frame', 0.008);
      box(0.3, 0.09, 0.01, M(radio, at(-0.08, 0.11, 0.165)), '--md-glass', false);
      cyl(0.035, 0.035, 0.02, M(radio, at(0.19, 0.11, 0.165, 0, Math.PI / 2)), '--md-panel', false, 14);
      cyl(0.008, 0.008, 0.5, M(radio, at(0.24, 0.45, -0.1)), '--md-frame', false, 6);
      // The handset on its hook at the radio's side.
      box(0.06, 0.16, 0.05, M(radio, at(-0.38, 0.1, 0.05)), '--md-frame', false);

      // THE CHAIR, empty, pushed back from the desk's far end, so the radio can
      // be seen from the room.
      var chair = at(KX + 0.7, 0, KZ - 0.85, RIGHT + 0.6);
      box(0.46, 0.06, 0.44, M(chair, at(0, 0.46, 0)), '--md-frame', 0.01);
      box(0.46, 0.5, 0.05, M(chair, at(0, 0.74, 0.2)), '--md-frame', 0.01);
      [[-0.19, -0.18], [0.19, -0.18], [-0.19, 0.18], [0.19, 0.18]].forEach(function (p) {
        box(0.04, 0.46, 0.04, M(chair, at(p[0], 0.23, p[1])), '--md-frame', false);
      });

      // THE ROOM'S OWN PAGE on the right-hand wall, in a frame of the frame
      // colour, with its desk, its radio and its call on it.
      var pw = 2.4, ph = pw * 800 / 1180, py = 0.5 + ph / 2, pz = -2.6;
      box(0.05, ph + 0.12, pw + 0.12, at(W / 2 - 0.03, py, pz), '--md-frame', 0.01);
      var frame = kit.screen(1180, 800, pw, at(W / 2 - 0.07, py, pz, RIGHT), 'The Moderators’ room’s own page, on the wall to the right, with its desk, its radio and its call');

      // THE PAGE'S OWN WORDS: what the base looks after on the left-hand wall
      // past the desk; why the street's own light on the right-hand wall past
      // the page; the room's name and its line on the front wall by the door.
      var what = kit.lift(frame, '.md-part', { n: 0, w: 760, ww: 2.0, m: at(-W / 2 + 0.04, 0.85, -5.6, LEFT) });
      var why = kit.lift(frame, '.md-part', { n: 11, w: 760, ww: 1.8, m: at(W / 2 - 0.04, 0.9, -5.8, RIGHT) });
      var head = kit.lift(frame, '.md-head', { drop: '.md-head__art', w: 760, ww: 1.9, m: at(-1.4, 1.25, -0.04, Math.PI) });
      var lede = kit.lift(frame, '.md-lede', { w: 760, ww: 1.9, m: at(-1.4, 0.85, -0.04, Math.PI) });

      return {
        start: { x: DX - 0.6, z: -1.0, yaw: 0.15 },
        bounds: { x: [-W / 2 + 0.8, W / 2 - 0.8], z: [back + 0.9, -0.7] },
        stops: [
          { name: 'just inside the door, the room dark, the street’s colours on the ceiling over the window', x: DX - 0.6, z: -1.0, yaw: 0.15, pitch: 0.12 },
          { name: 'under the bands, looking up: every shop’s colour on the ceiling, side by side, none mixed into the next', x: 0, z: -4.4, yaw: 0, pitch: 0.75 },
          { name: 'at the window, looking down on the shopfronts below', x: WX, z: back + 1.1, yaw: 0, pitch: -0.2 },
          { name: 'at the desk, the radio on it off and dark', x: KX + 1.8, z: KZ + 0.3, yaw: LEFT, pitch: -0.3 },
          { name: 'at the left-hand wall, past the desk: what the base looks after', x: -W / 2 + 2.3, z: -5.6, yaw: LEFT, pitch: 0.05, frame: what.el },
          { name: 'at the right-hand wall, near the window: why the street’s own light', x: W / 2 - 2.2, z: -5.8, yaw: RIGHT, pitch: 0.05, frame: why.el },
          { name: 'back by the door, with the room’s name and its line beside it', x: -1.4, z: -2.6, yaw: Math.PI, frame: head.el },
          { name: 'at the right-hand wall, with the room’s own page on it, its desk, its radio and its call', x: W / 2 - 2.5, z: pz, yaw: RIGHT, pitch: 0.05, page: kit.page, frame: frame }
        ]
      };
    }
  };
})();

/* =============================================================================
   Fantasy Fancy Dress, walked into on Cel Street, through the curtain at the
   back of the Dopamine Dress-Up Den. Ryan's ask, 2026-11-01: the rooms behind
   the doors, a few at a time.

   IT IS THE SHOP'S WORLD AND NOBODY ELSE'S (§116): the back of a fancy dress
   shop, lit only from behind, through sheer stuff. Lengths of tulle and
   chiffon hang from the ceiling in rose, mint, gold and lilac, overlapping,
   and the only light in the room is at the far end, coming through them.
   Where two sheers cross the colour deepens and nothing has an edge; the rail
   of stock, the mirror and you stand dark against the light, and every word
   stands on that dark. The Den you came from is white daylight on lavender,
   with a crystal's rainbows on the wall: none of that comes through the
   curtain, and there is no flame, no brown, no bulb, no strip and no string of
   fairy lights in here.

   NOBODY'S BODY IS DRAWN BY THE HOUSE. The rail holds stock on hangers, the
   wings hang on a hook, and the mirror holds the page's own fitting, lifted
   off it by the kit: avatar.js and fancy-dress.js, which the page loads
   itself, are run against it and the rails, so it draws somebody at random as
   the page does, and wears whatever you pick off the rails. Neither keeps nor
   sends anything. Your strip asks the CB, so strip.js is not run here: the
   strip stays on the page, which hangs on the left-hand wall by the curtain.

   NOTHING MOVES AT ANY SETTING: the sheers hang still, in a room with no
   window to let a breeze in. Every colour is one the shop declares, by name.
   This file keeps nothing, sends nothing and fetches nothing; its page
   arrives through Cel Street's screen(). tools/make-cel-street.py holds each
   of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['fantasy-fancy-dress.html'] = {
    name: 'Fantasy Fancy Dress',
    from: 'dopamine-dress-up-den.html',
    faces: ['Abril Fatface'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var W = 8, D = 11, H = 3.4, back = -D;
      var L = -W / 2, R = W / 2;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var SHEERS = ['--ffd-rose', '--ffd-mint', '--ffd-gold', '--ffd-lilac'];

      // THE LIGHT is at the far end and comes through the sheers towards you,
      // so everything you look at is lit from behind and stands dark; the
      // room's own dark fills the rest a little, never enough to light a face.
      // What reaches the backs of things has come through the sheers, so it is
      // lilac, never the warm white at the far end: that would go brown.
      kit.scene.background = kit.col('--ffd-ground');
      kit.scene.add(new T.HemisphereLight(kit.col('--ffd-panel'), kit.col('--ffd-hush'), 1.1));
      var glow = new T.DirectionalLight(kit.col('--ffd-lilac'), 1.5);
      glow.position.set(0, 2.6, back + 0.4);
      glow.target.position.set(0, 0.4, 0);
      glow.castShadow = true;
      glow.shadow.mapSize.set(1024, 1024);
      glow.shadow.camera.left = -7; glow.shadow.camera.right = 7; glow.shadow.camera.top = 6; glow.shadow.camera.bottom = -6;
      glow.shadow.camera.far = 20;
      kit.scene.add(glow, glow.target);

      // THE SHOP: a dark floor, dark walls, a darker ceiling.
      box(W + 0.4, 0.1, D + 0.4, at(0, -0.05, back / 2), '--ffd-ground', false, false);
      box(W + 0.4, 0.14, D + 0.4, at(0, H + 0.07, back / 2), '--ffd-hush', false, false);
      box(0.3, H, D, at(L - 0.15, H / 2, back / 2), '--ffd-ground', 0.015);
      box(0.3, H, D, at(R + 0.15, H / 2, back / 2), '--ffd-ground', 0.015);

      // A wall with a doorway in it, extruded.
      function holed(w, h, holes, m, ink) {
        var s = new T.Shape();
        s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h); s.lineTo(-w / 2, h); s.closePath();
        holes.forEach(function (o) {
          var p = new T.Path();
          p.moveTo(o[0], o[2]); p.lineTo(o[1], o[2]); p.lineTo(o[1], o[3]); p.lineTo(o[0], o[3]); p.closePath();
          s.holes.push(p);
        });
        var g = new T.ExtrudeGeometry(s, { depth: 0.3, bevelEnabled: false });
        g.translate(0, 0, -0.3);
        kit.piece(g, m, ink, 0.015);
      }

      // THE FRONT WALL, behind you, and the curtain you came through: this
      // side of it is the shop's dark stuff, in heavy folds, drawn shut.
      var CX = 1.4, CW = 1.3, CH = 2.3;
      holed(W + 0.6, H, [[CX - CW / 2, CX + CW / 2, 0, CH]], at(0, 0, 0.3), '--ffd-ground');
      box(CW + 0.2, 0.1, 0.12, at(CX, CH + 0.05, -0.02), '--ffd-panel', 0.012);
      for (var f = 0; f < 11; f++) {
        var fx = CX - CW / 2 + 0.06 + f * (CW - 0.12) / 10;
        box((CW - 0.12) / 10 + 0.01, CH - 0.08, 0.05, at(fx, (CH - 0.08) / 2, -0.06 - (f % 2) * 0.04), f % 2 ? '--ffd-panel' : '--ffd-hush', 0.006);
      }

      // THE FAR END: the light itself, a wall of it, and nothing drawn in it.
      kit.flat(new T.PlaneGeometry(W, H), at(0, H / 2, back + 0.02), '--ffd-glow');
      box(W + 0.4, H, 0.3, at(0, H / 2, back - 0.15), '--ffd-ground', false, false);

      // THE SHEERS, hung from battens under the ceiling in staggered rows in
      // front of the light, overlapping, so where two cross the colour
      // deepens. Seen through, never lit on their faces: the light is behind.
      function sheer(x, z, w, long, ink, thin) {
        var s = kit.flat(new T.PlaneGeometry(w, long), at(x, H - 0.06 - long / 2, z), ink);
        s.material.transparent = true;
        s.material.opacity = thin;
        s.material.depthWrite = false;
        s.material.side = T.DoubleSide;
        box(w + 0.06, 0.03, 0.03, at(x, H - 0.05, z), '--ffd-hush', false, false);
      }
      var ROWS = [
        { z: back + 0.5, xs: [-3.1, -1.6, -0.1, 1.5, 3.0], w: 1.7, long: H - 0.1, thin: 0.55 },
        { z: back + 1.1, xs: [-2.4, -0.8, 0.8, 2.4], w: 1.5, long: H - 0.5, thin: 0.45 },
        { z: back + 1.7, xs: [-3.2, -1.4, 0.4, 2.2], w: 1.3, long: H - 0.9, thin: 0.4 },
        { z: back + 2.3, xs: [-2.6, -0.2, 1.9, 3.4], w: 1.0, long: H - 1.4, thin: 0.36 }
      ];
      ROWS.forEach(function (row, r) {
        row.xs.forEach(function (x, i) { sheer(x, row.z, row.w, row.long, SHEERS[(i + r) % SHEERS.length], row.thin); });
      });
      // A few lengths swagged lower over the rail, catching nothing but the
      // light behind them.
      [[-2.0, back + 2.7, '--ffd-lilac'], [0.6, back + 2.75, '--ffd-rose'], [2.6, back + 2.65, '--ffd-mint']].forEach(function (s) {
        sheer(s[0], s[1], 1.1, 0.8, s[2], 0.3);
      });

      // THE RAIL OF STOCK, standing across the shop in front of the sheers:
      // dress-up suits, onesies and wings on their hangers, all of it dark
      // against the light, a rim of the room's edge colour round each.
      var RZ = back + 3.0, RL = 5.6;
      [-RL / 2, RL / 2].forEach(function (x) {
        cyl(0.025, 0.025, 1.7, at(x, 0.85, RZ), '--ffd-hush', 0.01, 8);
        box(0.5, 0.04, 0.3, at(x, 0.02, RZ), '--ffd-hush', 0.01);
      });
      cyl(0.02, 0.02, RL, at(0, 1.68, RZ, 0, 0, Math.PI / 2), '--ffd-hush', 0.01, 8);
      for (var g = 0; g < 26; g++) {
        var gx = -RL / 2 + 0.2 + g * (RL - 0.4) / 25;
        var suit = g % 3 !== 1;
        var long = suit ? 1.15 + (g % 4) * 0.05 : 0.8;
        box(0.012, 0.06, 0.012, at(gx, 1.64, RZ), '--ffd-edge', false, false);
        box(0.03, 0.03, 0.4, at(gx, 1.6, RZ), '--ffd-hush', false, false);
        box(suit ? 0.06 : 0.04, long, suit ? 0.46 : 0.5, at(gx, 1.58 - long / 2, RZ), '--ffd-hush', 0.012);
      }

      // THE SIGN, hung on two cords over the rail, gold on the shop's dark,
      // lettered in the sign's own face. Its words stand on the dark, never in
      // the light.
      var sign = kit.paper(1100, 260, function (c, cw, ch) {
        c.fillStyle = kit.ink('--ffd-ground'); c.fillRect(0, 0, cw, ch);
        c.strokeStyle = kit.ink('--ffd-edge'); c.lineWidth = 6; c.strokeRect(10, 10, cw - 20, ch - 20);
        c.fillStyle = kit.ink('--ffd-gold');
        c.textAlign = 'center'; c.textBaseline = 'middle';
        var size = 132;
        c.font = size + "px 'Abril Fatface'";
        while (size > 20 && c.measureText('Fantasy Fancy Dress').width > cw * 0.88) { size -= 4; c.font = size + "px 'Abril Fatface'"; }
        c.fillText('Fantasy Fancy Dress', cw / 2, ch / 2 + 4);
      });
      var board = new T.Mesh(new T.PlaneGeometry(2.6, 2.6 * 260 / 1100), new T.MeshBasicMaterial({ map: sign }));
      board.matrixAutoUpdate = false;
      board.matrix.copy(at(0, 2.62, RZ + 0.15));
      board.matrixWorldNeedsUpdate = true;
      kit.scene.add(board);
      [-1.1, 1.1].forEach(function (x) { cyl(0.004, 0.004, 0.5, at(x, H - 0.25, RZ + 0.15), '--ffd-edge', false, 4); });

      // WINGS ON A HOOK on the right-hand wall, the shop's own sheer stuff in
      // the shape of a pair, nobody in them.
      function wing(side, ink) {
        var s = new T.Shape();
        s.moveTo(0, 0);
        s.bezierCurveTo(side * 0.35, 0.55, side * 0.95, 0.75, side * 1.05, 0.35);
        s.bezierCurveTo(side * 1.1, 0.05, side * 0.55, -0.1, 0, 0);
        s.bezierCurveTo(side * 0.45, -0.15, side * 0.8, -0.4, side * 0.6, -0.65);
        s.bezierCurveTo(side * 0.35, -0.8, side * 0.1, -0.4, 0, 0);
        return s;
      }
      var WZ = -7.2, wm = at(R - 0.06, 1.75, WZ, RIGHT);
      cyl(0.02, 0.02, 0.14, M(wm, at(0, 0.02, 0.05, 0, Math.PI / 2)), '--ffd-hush', false, 6);
      [[1, '--ffd-lilac'], [-1, '--ffd-rose']].forEach(function (w) {
        var piece = kit.flat(new T.ShapeGeometry(wing(w[0], w[1])), M(wm, at(0, -0.05, 0.07)), w[1]);
        piece.material.transparent = true;
        piece.material.opacity = 0.6;
        piece.material.depthWrite = false;
        piece.material.side = T.DoubleSide;
      });

      // THE SHOP'S OWN PAGE, on the left-hand wall by the curtain, with your
      // strip on it, which asks the CB and so stays there.
      var pw = 2.5, ph = pw * 800 / 1180, py = 0.55 + ph / 2;
      var pg = at(L + 0.02, 0, -2.2, LEFT);
      box(pw + 0.14, ph + 0.14, 0.05, M(pg, at(0, py, 0)), '--ffd-panel', 0.012);
      var frame = kit.screen(1180, 800, pw, M(pg, at(0, py, 0.035)), 'Fantasy Fancy Dress’s own page, on the left-hand wall');

      // THE MIRROR on the floor, a tall dark frame on two feet, dark against
      // the light, and in it the page's own fitting: the bodymind is the
      // page's, drawn by avatar.js, somebody at random until you bring yours.
      var MX = 2.0, MZ = -6.2, MW = 0.95, MH = MW * 1.5, MY = 0.4;
      [-0.5, 0.5].forEach(function (x) { box(0.08, 0.06, 0.5, at(MX + x, 0.03, MZ), '--ffd-hush', 0.01); });
      [-(MW / 2 + 0.06), MW / 2 + 0.06].forEach(function (x) { box(0.1, MY + MH + 0.12, 0.08, at(MX + x, (MY + MH + 0.12) / 2, MZ - 0.05), '--ffd-panel', 0.012); });
      box(MW + 0.22, 0.1, 0.08, at(MX, MY + MH + 0.07, MZ - 0.05), '--ffd-panel', 0.012);
      box(MW + 0.22, 0.1, 0.08, at(MX, MY - 0.05, MZ - 0.05), '--ffd-panel', 0.012);
      var mirror = kit.lift(frame, '.ffd-body', { w: 400, ww: MW, m: at(MX, MY, MZ) });
      // Beside it, on the shop's dark, the page's own words for what is on
      // the mirror, and its buttons: surprise, take it all off, somebody else,
      // and back through to the Den wearing it.
      var BX = MX - 1.4;
      kit.lift(frame, '.ffd-readout', { w: 420, ww: 1.0, m: at(BX, 1.0, MZ) });
      var doing = kit.lift(frame, '.ffd-do', { w: 420, ww: 1.0, m: at(BX, 0.3, MZ) });

      // THE PAGE'S OWN RAILS on the left-hand wall, every piece with how it
      // feels and how it comes off, scrolling: picking dresses the mirror.
      var rails = kit.lift(frame, '.ffd-rails', { w: 760, h: 800, ww: 2.6, m: at(L + 0.05, 0.3, -5.9, LEFT), drop: '.ffd-chimera__mine' });

      // ON THE RIGHT-HAND WALL: the house rules, and whose this is.
      var rules = kit.lift(frame, '.ffd-part', { n: 1, w: 760, h: 820, ww: 1.7, m: at(R - 0.05, 0.35, -2.6, RIGHT) });
      var whose = kit.lift(frame, '.ffd-part', { n: 2, w: 760, h: 760, ww: 1.6, m: at(R - 0.05, 0.4, -5.0, RIGHT) });

      // The page's own scripts, run against the mirror and the rails above,
      // in the order the page runs them: neither keeps nor sends anything.
      kit.wire(frame, 'avatar.js');
      kit.wire(frame, 'fancy-dress.js');

      return {
        start: { x: CX - 0.2, z: -1.0, yaw: 0 },
        bounds: { x: [L + 0.9, R - 0.9], z: [RZ + 0.7, -0.6] },
        stops: [
          { name: 'just through the curtain, the light at the far end coming through the sheers', x: CX - 0.2, z: -1.0, yaw: 0, pitch: 0.06 },
          { name: 'at the mirror, the fitting the page draws, somebody at random until you bring yours', x: MX - 0.5, z: MZ + 2.8, yaw: 0, pitch: -0.08, frame: mirror.el },
          { name: 'at the words beside the mirror, and its buttons', x: BX, z: MZ + 1.6, yaw: 0, pitch: -0.16, frame: doing.el },
          { name: 'at the rails on the left-hand wall, to pick what the mirror shows', x: L + 2.5, z: -5.9, yaw: LEFT, frame: rails.el },
          { name: 'at the rail of stock, dark against the sheers and the light behind them', x: -0.6, z: RZ + 2.4, yaw: 0, pitch: 0.12 },
          { name: 'at the wings on their hook, sheer stuff with nobody in it', x: R - 1.7, z: WZ, yaw: RIGHT, pitch: 0.05 },
          { name: 'at the house rules, on the right-hand wall', x: R - 2.1, z: -2.6, yaw: RIGHT, pitch: -0.1, frame: rules.el },
          { name: 'at whose this is, on the right-hand wall', x: R - 2.0, z: -5.0, yaw: RIGHT, pitch: -0.1, frame: whose.el },
          { name: 'at the shop’s own page, on the left-hand wall by the curtain, with your strip on it', x: L + 2.3, z: -2.2, yaw: LEFT, page: kit.page, frame: frame }
        ]
      };
    }
  };
})();

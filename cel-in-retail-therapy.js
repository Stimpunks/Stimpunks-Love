/* =============================================================================
   Retail Therapy, walked into on Cel Street, out of the top pocket of the
   brochure rack in Excursions. Ryan's ask, 2026-11-05: every new room onto
   both streets.

   NORAH HOBBS'S SHOP THAT SELLS NOTHING (§142), made with Claude for
   Infodumplings on 5 November 2026. THIS SCENE IS OURS, drawn from her page
   and in her colours only, and changes nothing on her page; it is hers to keep
   or to send back, and anything in it is hers to change.

   You stand in the forecourt before her shopfront as she drew it at the top
   of her page, stood up: the red brick front, the teal sign with the shop's
   name in her round heavy script, the teal and cream striped awning, two shop
   windows with shapes on their shelves, the glass door with its yellow sign
   saying QUIET HRS, and a Caroline's Cart parked by it. Round you, out of her
   page's own words: the bench by the fountain in the middle, which is the best
   seat in the house; the cart corral, where the row of Caroline's Carts never
   gets shorter, and the electric carts beside it; the little free library,
   its house of wood and roof of brick and seven spines in her seven book
   colours; and the store directory, a mall map board, in her tile colours. Her
   page itself is on a board on the right.

   HER LIGHTS ARE THE ONE SWITCH, AND THEY ARE HER TWO PALETTES: lights low,
   the shop in sensory hours, pale sage and teal under a pale sky; or lights
   off, the shop after closing, shutters down over the windows, the door's
   sign saying CLOSED, and the exit sign and the light under the shutters the
   only light. Every colour in each is one §142 names out of her page. Two more
   presses: take a Caroline's Cart (the row is no shorter after), and take a
   book from the little free library, or put it back. NOTHING MOVES, as her
   page promises: the fountain stands still, and the switch is a press. It
   keeps nothing, sends nothing and fetches nothing; her page arrives through
   Cel Street's screen().
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['retail-therapy.html'] = {
    name: 'Retail Therapy',
    from: 'excursions.html',
    faces: ['Shrikhand', '"Atkinson Hyperlegible"'],
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;
      var W = 17, FZ = -11, NEAR = 2.4, HW = 5.2;
      var L = -W / 2, R = W / 2;

      // HER TWO PALETTES. Everything that changes with the lights is drawn in
      // the lights-low name, and the switch lays the lights-off one over it,
      // name for name, as her page's own --rt-* names follow data-lights.
      var SWAP = {
        'floor': ['--rth-floor', '--rth-off-floor'],
        'shelf': ['--rth-shelf', '--rth-off-shelf'],
        'ink': ['--rth-ink', '--rth-off-ink'],
        'quiet': ['--rth-quiet', '--rth-off-quiet'],
        'rule': ['--rth-rule', '--rth-off-rule'],
        'register': ['--rth-register', '--rth-off-register'],
        'tag': ['--rth-tag', '--rth-off-tag'],
        'tag-ink': ['--rth-tag-ink', '--rth-off-tag-ink'],
        'glass': ['--rth-glass', '--rth-off-glass'],
        'brick': ['--rth-brick', '--rth-off-brick'],
        'sky': ['--rth-sky', '--rth-off-sky']
      };
      var off = false;
      function P(x) { return SWAP[x][off ? 1 : 0]; }
      // A room built again starts with the lights low, whatever it was left at.
      Object.keys(SWAP).forEach(function (x) { kit.tint(SWAP[x][0], SWAP[x][0]); });
      // A drawing on a canvas that is drawn again when the lights change.
      var drawn = [];
      function paper(w, h, fn) {
        var t = kit.paper(w, h, fn);
        drawn.push({ t: t, fn: fn, w: w, h: h });
        return t;
      }
      // THE LIGHT. Low: a pale sky over the forecourt and a soft light from
      // over your shoulder. Off: the sky gone dark, the soft light out, and a
      // breath of the night so the shapes are there at all.
      kit.scene.background = kit.col('--rth-sky');
      var skyLight = new T.AmbientLight(kit.col('--rth-sky'), 1.0);
      kit.scene.add(skyLight);
      var day = new T.DirectionalLight(kit.col('--rth-glass'), 1.5);
      day.position.set(5, 11, 8); day.target.position.set(0, 0, FZ + 4);
      day.castShadow = true;
      day.shadow.mapSize.set(2048, 2048);
      var dc = day.shadow.camera; dc.left = -14; dc.right = 14; dc.top = 14; dc.bottom = -14; dc.near = 1; dc.far = 40;
      kit.scene.add(day); kit.scene.add(day.target);
      var exitLight = new T.PointLight(kit.col('--rth-off-register'), 0, 9, 1.4);
      exitLight.position.set(0, 0.9, FZ + 0.9);
      kit.scene.add(exitLight);

      // THE FORECOURT: her pale sage, laid in squares, the grout in her rule.
      box(W, 0.2, NEAR - FZ + 2, at(0, -0.1, (NEAR + FZ - 2) / 2), '--rth-floor', false, false);
      for (var gx = L + 1.2; gx < R; gx += 1.2) box(0.03, 0.006, NEAR - FZ, at(gx, 0.003, (NEAR + FZ) / 2), '--rth-rule', false, false);
      for (var gz = FZ + 1.2; gz < NEAR; gz += 1.2) box(W, 0.006, 0.03, at(0, 0.003, gz), '--rth-rule', false, false);
      // The arcade walls either side, plain, a shelf's pale with her rule's
      // lines down them: nothing on them is anybody else's shop.
      [-1, 1].forEach(function (s) {
        box(0.4, 4.4, NEAR - FZ + 2, at(s * (R + 0.2), 2.2, (NEAR + FZ - 2) / 2), '--rth-shelf', false, false);
        for (var pz = FZ + 1; pz < NEAR; pz += 2.4) box(0.06, 4.4, 0.18, at(s * (R - 0.03), 2.2, pz), '--rth-rule', 0.006, false);
      });

      // THE SHOPFRONT, her drawing stood up: px 450 across her picture is the
      // middle, and her picture's foot is the ground; a pixel of hers is
      // S of ours.
      var S = 0.014;
      function X(x) { return (x - 450) * S; }
      function Y(y) { return (340 - y) * S; }
      function front(x, y, w, h, z, ink, line) {
        box(w * S, h * S, 0.06, at(X(x + w / 2), Y(y + h / 2), FZ + z), ink, line === undefined ? 0.008 : line, false);
      }
      box(740 * S, 300 * S, 0.5, at(0, Y(190), FZ - 0.25), '--rth-brick', 0.012);
      // The brick's courses, faint: her front is flat brick and she called it
      // red brick.
      var brick = paper(1024, 420, function (c, w, h) {
        c.fillStyle = kit.ink(P('brick')); c.fillRect(0, 0, w, h);
        c.fillStyle = kit.ink(P('ink')); c.globalAlpha = 0.14;
        for (var r = 0, y = 0; y < h; r++, y += 14) {
          c.fillRect(0, y, w, 2);
          for (var x = (r % 2) * 22; x < w; x += 44) c.fillRect(x, y, 2, 14);
        }
        c.globalAlpha = 1;
      });
      kit.sheet(brick, 740 * S, 300 * S, at(0, Y(190), FZ + 0.005));
      front(80, 40, 740, 10, 0.03, '--rth-ink');
      // The sign, her name for the shop in her script, cream on teal.
      var sign = paper(880, 116, function (c, w, h) {
        c.fillStyle = kit.ink(P('register')); c.fillRect(0, 0, w, h);
        c.fillStyle = kit.ink(P('floor'));
        c.font = '68px Shrikhand'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText('Retail Therapy', w / 2, h / 2 + 8);
      });
      box(440 * S, 58 * S, 0.08, at(0, Y(91), FZ + 0.05), '--rth-register', 0.01);
      kit.sheet(sign, 440 * S, 58 * S, at(0, Y(91), FZ + 0.095));
      // The awning, teal with cream stripes, sloping out over the windows: a
      // top, an underside and a valance along its front, all striped.
      var awn = paper(1400, 120, function (c, w, h) {
        c.fillStyle = kit.ink(P('register')); c.fillRect(0, 0, w, h);
        c.fillStyle = kit.ink(P('floor'));
        for (var x = 50; x < w; x += 100) c.fillRect(x, 0, 50, h);
      });
      var AD = 0.85, AR = 0.45, ATH = Math.atan2(AR, AD), AL = Math.hypot(AD, AR);
      var AM = at(0, Y(132) - AR / 2, FZ + AD / 2, 0, -Math.PI / 2 + ATH);
      box(700 * S, AL, 0.03, AM, '--rth-register', 0.01);
      kit.sheet(awn, 700 * S, AL, M(AM, at(0, 0, 0.018)));
      kit.sheet(awn, 700 * S, AL, M(AM, at(0, 0, -0.018, 0, Math.PI)));
      box(700 * S, 0.22, 0.03, at(0, Y(132) - AR - 0.11, FZ + AD), '--rth-register', 0.008);
      kit.sheet(awn, 700 * S, 0.22, at(0, Y(132) - AR - 0.11, FZ + AD + 0.018));
      // The two windows, the shapes on their shelves as she drew them.
      [120, 520].forEach(function (wx) {
        front(wx, 185, 260, 140, 0.03, '--rth-ink');
        front(wx + 8, 193, 244, 124, 0.06, '--rth-glass', false);
      });
      function stock(x, y, w, h) { front(x, y, w, h, 0.09, '--rth-quiet', false); }
      stock(150, 270, 60, 47); stock(160, 255, 40, 15); stock(262, 250, 16, 67);
      cyl(18 * S, 18 * S, 0.03, at(X(270), Y(232), FZ + 0.09, 0, Math.PI / 2), '--rth-quiet', false, 18);
      stock(320, 287, 30, 30);
      cyl(15 * S, 15 * S, 0.03, at(X(335), Y(287), FZ + 0.09, 0, Math.PI / 2), '--rth-quiet', false, 18);
      stock(568, 272, 54, 45); stock(660, 260, 22, 57); stock(690, 240, 22, 77); stock(720, 275, 22, 42);
      // The door, glass in her trim, and its little yellow sign, which says
      // QUIET HRS with the lights low and CLOSED with them off.
      front(405, 185, 90, 155, 0.03, '--rth-ink');
      front(413, 193, 74, 147, 0.06, '--rth-glass', false);
      front(416, 215, 68, 26, 0.09, '--rth-tag', 0.005);
      var doorSign = paper(272, 104, function (c, w, h) {
        c.fillStyle = kit.ink(P('tag')); c.fillRect(0, 0, w, h);
        c.fillStyle = kit.ink(P('tag-ink'));
        c.font = '700 44px "Atkinson Hyperlegible"'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText(off ? 'CLOSED' : 'QUIET HRS', w / 2, h / 2 + 3);
      });
      kit.sheet(doorSign, 68 * S, 26 * S, at(X(450), Y(228), FZ + 0.125));
      // LIGHTS OFF: the shutters come down over the windows, light only under
      // them and from the exit sign in the door.
      var offOnly = [];
      [120, 520].forEach(function (wx) {
        offOnly.push(kit.facets(new T.BoxGeometry(260 * S, 128 * S, 0.05), at(X(wx + 130), Y(249), FZ + 0.16), '--rth-shutter'));
        for (var ly = 205; ly < 300; ly += 20) offOnly.push(kit.facets(new T.BoxGeometry(260 * S, 2 * S, 0.02), at(X(wx + 130), Y(ly), FZ + 0.195), '--rth-shutter-line'));
        offOnly.push(kit.flat(new T.PlaneGeometry(244 * S, 4 * S), at(X(wx + 122 + 8), Y(315), FZ + 0.1), '--rth-off-register'));
      });
      offOnly.push(kit.flat(new T.PlaneGeometry(40 * S, 14 * S), at(X(450), Y(277), FZ + 0.1), '--rth-off-register'));
      offOnly.forEach(function (m) { kit.hide(m, true); });

      // A CAROLINE'S CART: a wire basket on wheels, a handle, and the big
      // harnessed seat facing whoever pushes, in her teal.
      function cart(m, list) {
        function part(geo, mm, ink) {
          if (list) list.push(kit.facets(geo, M(m, mm), ink));
          else kit.piece(geo, M(m, mm), ink, 0.008);
        }
        var B = new T.BoxGeometry(1, 1, 1);
        function bar(w, h, d, mm) { var g = B.clone(); g.scale(w, h, d); part(g, mm, '--rth-ink'); }
        bar(0.6, 0.03, 0.9, at(0, 0.58, 0));
        bar(0.6, 0.03, 0.9, at(0, 0.98, 0));
        [-0.3, 0.3].forEach(function (x) { bar(0.03, 0.4, 0.9, at(x, 0.78, 0)); [-0.45, 0.45].forEach(function (z) { bar(0.03, 0.55, 0.03, at(x, 0.3, z)); }); });
        bar(0.6, 0.4, 0.03, at(0, 0.78, -0.45));
        bar(0.66, 0.04, 0.04, at(0, 1.12, 0.52));
        [-0.3, 0.3].forEach(function (x) { bar(0.03, 0.2, 0.03, at(x, 1.03, 0.5)); });
        var seat = B.clone(); seat.scale(0.5, 0.36, 0.42); part(seat, at(0, 1.06, 0.22), '--rth-register');
        var back = B.clone(); back.scale(0.5, 0.42, 0.08); part(back, at(0, 1.3, 0.4), '--rth-register');
        [-0.26, 0.26].forEach(function (x) { [-0.42, 0.42].forEach(function (z) {
          part(new T.CylinderGeometry(0.06, 0.06, 0.04, 12), at(x, 0.06, z, 0, 0, Math.PI / 2), '--rth-ink');
        }); });
      }
      // The one parked by the door, as in her drawing.
      cart(at(X(575), 0, FZ + 1.1, -0.3));
      // THE CART CORRAL, left of the door: the row of Caroline's Carts that
      // never gets shorter, and beside it the electric carts, always charged.
      var CX = -5.6, CZ = FZ + 2.6;
      for (var ci = 0; ci < 4; ci++) cart(at(CX + ci * 0.42, 0, CZ + ci * 0.06, 0));
      function ecart(m) {
        box(0.7, 0.3, 1.3, M(m, at(0, 0.32, 0)), '--rth-ink', 0.01);
        box(0.56, 0.12, 0.5, M(m, at(0, 0.53, 0.2)), '--rth-tag', 0.008);
        box(0.56, 0.4, 0.1, M(m, at(0, 0.78, 0.44)), '--rth-tag', 0.008);
        box(0.46, 0.3, 0.32, M(m, at(0, 0.62, -0.46)), '--rth-quiet', 0.008);
        cyl(0.03, 0.03, 0.6, M(m, at(0, 0.75, -0.25, 0, -0.4)), '--rth-ink', 0.006, 8);
        box(0.42, 0.04, 0.04, M(m, at(0, 1.02, -0.37)), '--rth-ink', 0.006);
        [-0.32, 0.32].forEach(function (x) { [-0.5, 0.5].forEach(function (z) { cyl(0.12, 0.12, 0.08, M(m, at(x, 0.12, z, 0, 0, Math.PI / 2)), '--rth-ink', 0.006, 14); }); });
      }
      ecart(at(CX - 1.6, 0, CZ + 1.6, 0.5));
      ecart(at(CX - 0.6, 0, CZ + 2.2, 0.4));

      // THE BENCH BY THE FOUNTAIN, in the middle: the best seat in the house.
      var FX = 0, FCZ = FZ + 5.6, BZ = FCZ + 2.0;
      cyl(1.35, 1.4, 0.5, at(FX, 0.25, FCZ), '--rth-shelf', 0.012, 40);
      cyl(1.42, 1.42, 0.08, at(FX, 0.52, FCZ), '--rth-rule', 0.01, 40);
      cyl(1.22, 1.22, 0.04, at(FX, 0.5, FCZ), '--rth-sky', false, 40);
      cyl(0.12, 0.16, 1.2, at(FX, 1.0, FCZ), '--rth-rule', 0.01, 16);
      cyl(0.6, 0.26, 0.26, at(FX, 1.62, FCZ), '--rth-shelf', 0.01, 28);
      cyl(0.54, 0.54, 0.03, at(FX, 1.74, FCZ), '--rth-sky', false, 28);
      cyl(0.06, 0.08, 0.3, at(FX, 1.88, FCZ), '--rth-rule', 0.006, 12);
      function bench(m) {
        [-0.18, 0, 0.18].forEach(function (z) { box(2.2, 0.05, 0.14, M(m, at(0, 0.48, z)), '--rth-wood', 0.006); });
        [0.62, 0.8].forEach(function (y) { box(2.2, 0.12, 0.05, M(m, at(0, y, 0.3, 0, -0.12)), '--rth-wood', 0.006); });
        [-0.95, 0.95].forEach(function (x) {
          box(0.06, 0.46, 0.5, M(m, at(x, 0.23, 0)), '--rth-ink', 0.006);
          box(0.06, 0.48, 0.06, M(m, at(x, 0.66, 0.28)), '--rth-ink', 0.006);
        });
      }
      bench(at(FX, 0, BZ));

      // TAKE A CART: one comes out of the corral to stand by the bench, and
      // the row is no shorter after, because it never is.
      var yours = [];
      cart(at(FX + 1.7, 0, BZ + 0.3, 0.7), yours);
      yours.forEach(function (m) { kit.hide(m, true); });
      var takeCart = kit.press({
        say: function () { return kit.hidden(yours[0]) ? 'Take a Caroline’s Cart' : 'Put your cart back'; },
        at: [kit.touch(2.0, 1.4, 1.4, at(CX + 0.6, 0.7, CZ))],
        press: function () {
          var go = kit.hidden(yours[0]);
          yours.forEach(function (m) { kit.hide(m, !go); });
          return go ? 'A Caroline’s Cart is yours, by the bench, for as long as you like. The row by the door is no shorter: it never is.'
                    : 'You wheel it back to the corral. Take one again whenever you like; nobody needs a reason.';
        } });

      // THE LITTLE FREE LIBRARY, on a post: a house of wood, a roof of brick,
      // and her seven spines, in her seven book colours.
      var LX = 5.4, LZ = FZ + 4.0, LY = 1.25;
      var LM = at(LX, 0, LZ, -0.45);
      box(0.12, LY, 0.12, M(LM, at(0, LY / 2, 0)), '--rth-wood', 0.008);
      // Open at the front: a back, two sides, a floor, a lid and a shelf.
      box(1.3, 0.9, 0.06, M(LM, at(0, LY + 0.45, -0.27)), '--rth-wood', 0.01);
      [-1, 1].forEach(function (s) { box(0.09, 0.9, 0.6, M(LM, at(s * 0.605, LY + 0.45, 0)), '--rth-wood', 0.01); });
      box(1.3, 0.09, 0.6, M(LM, at(0, LY + 0.045, 0)), '--rth-wood', 0.01);
      box(1.3, 0.09, 0.6, M(LM, at(0, LY + 0.855, 0)), '--rth-wood', 0.01);
      box(1.12, 0.72, 0.02, M(LM, at(0, LY + 0.45, -0.23)), '--rth-shelf', false, false);
      box(1.12, 0.03, 0.5, M(LM, at(0, LY + 0.44, 0)), '--rth-wood', false, false);
      [-1, 1].forEach(function (s) { box(0.82, 0.06, 0.72, M(LM, at(s * 0.3, LY + 1.12, 0, 0, 0, s * -0.62)), '--rth-brick', 0.01); });
      // The gable's back, in wood, behind the roof.
      box(0.74, 0.74, 0.05, M(LM, at(0, LY + 0.9, -0.29, 0, 0, Math.PI / 4)), '--rth-wood', false, false);
      var SPINES = ['--rth-book-blue', '--rth-tag', '--rth-book-wine', '--rth-book-green', '--rth-book-lilac', '--rth-book-amber', '--rth-register'];
      var bookOut = null, bookIn = null;
      SPINES.forEach(function (ink, i) {
        var bh = 0.24 + ((i * 37) % 7) * 0.02, bx = -0.46 + i * 0.12 + (i > 3 ? 0.04 : 0);
        var bm = M(LM, at(bx, LY + 0.06 + bh / 2 + (i < 4 ? 0 : 0), 0.02, 0, 0, i === 6 ? 0.18 : 0));
        if (i === 4) { bookIn = kit.facets(new T.BoxGeometry(0.1, bh, 0.36), bm, ink); }
        else box(0.1, bh, 0.36, bm, ink, 0.005);
        // An upper shelf of the same, lying down.
        if (i < 4) box(0.36, 0.08, 0.3, M(LM, at(-0.3 + (i % 2) * 0.05, LY + 0.5 + i * 0.085, 0.04, 0.05 * i)), SPINES[6 - i], 0.004);
      });
      bookOut = kit.facets(new T.BoxGeometry(0.36, 0.06, 0.26), at(FX - 0.6, 0.54, BZ - 0.05, 0.3), '--rth-book-lilac');
      kit.hide(bookOut, true);
      var takeBook = kit.press({
        say: function () { return kit.hidden(bookOut) ? 'Take a book from the little free library' : 'Put the book back'; },
        at: [kit.touch(1.4, 1.0, 0.8, M(LM, at(0, LY + 0.45, 0)))],
        press: function () {
          var go = kit.hidden(bookOut);
          kit.hide(bookOut, !go); kit.hide(bookIn, go);
          return go ? 'You take the lilac book off the shelf and leave it on the bench to read. Take a book, leave a book: keep it as long as you need it.'
                    : 'You put the lilac book back in the little free library, between the green one and the amber one.';
        } });

      // THE STORE DIRECTORY, a mall map board, in her tile colours: her
      // departments in her order, the till by the door in brick.
      var TILES = [
        ['Cart corral', 0], ['Little free library', 1], ['Bench by the fountain', 2], ['Front window', 3], ['Registers', 0],
        ['Fitting rooms', 1], ['Access aisle', 2], ['Toy aisle', 3], ['Customer service', 0], ['Gently used corner', 1],
        ['Gift wrap counter', 2], ['Sample table', 3], ['Stockroom', 0], ['Covenstead, next door', 2], ['Stimpunks shop', 'shop']];
      var dir = paper(1000, 760, function (c, w, h) {
        c.fillStyle = kit.ink(P('ink')); c.fillRect(0, 0, w, h);
        c.fillStyle = kit.ink(off ? P('floor') : P('tag'));
        c.font = '64px Shrikhand'; c.textBaseline = 'alphabetic'; c.fillText('Store directory', 40, 96);
        var GROUND = [P('register'), P('tag'), P('shelf'), P('floor')], INK = [P('floor'), P('tag-ink'), P('ink'), P('ink')];
        TILES.forEach(function (t, i) {
          var tx = 40 + (i % 5) * 186, ty = 140 + Math.floor(i / 5) * 200;
          c.fillStyle = kit.ink(t[1] === 'shop' ? P('brick') : GROUND[t[1]]);
          c.beginPath(); c.roundRect(tx, ty, 170, 180, 14); c.fill();
          c.fillStyle = kit.ink(t[1] === 'shop' ? '--rth-white' : INK[t[1]]);
          c.font = '700 26px "Atkinson Hyperlegible"';
          var words = t[0].split(' '), line = '', yy = ty + 120;
          var lines = [];
          words.forEach(function (wd) { if ((line + ' ' + wd).trim().length > 11 && line) { lines.push(line); line = wd; } else line = (line + ' ' + wd).trim(); });
          lines.push(line);
          lines.forEach(function (ln, k) { c.fillText(ln, tx + 14, yy - (lines.length - 1 - k) * 30); });
          c.strokeStyle = c.fillStyle; c.lineWidth = 5; c.lineCap = 'round';
          c.beginPath(); c.arc(tx + 40, ty + 46, 20, 0, Math.PI * 2); c.stroke();
          if (i === 0) {
            c.fillStyle = kit.ink(P('brick')); c.beginPath(); c.roundRect(tx + 70, ty + 14, 90, 30, 15); c.fill();
            c.fillStyle = kit.ink('--rth-white'); c.font = '700 16px "Atkinson Hyperlegible"'; c.fillText('You are here', tx + 77, ty + 35);
          }
        });
      });
      var DM = at(-5.9, 0, FZ + 6.4, 0.75);
      [-1, 1].forEach(function (s) { box(0.08, 1.0, 0.08, M(DM, at(s * 0.9, 0.5, 0)), '--rth-ink', 0.006); });
      box(2.06, 1.6, 0.08, M(DM, at(0, 1.8, 0)), '--rth-ink', 0.01);
      kit.sheet(dir, 2.0, 1.52, M(DM, at(0, 1.8, 0.045)));

      // HER PAGE, on a board on the right, her shelf's pale with her rule.
      var PM = at(R - 0.55, 0, FZ + 7.4, RIGHT);
      var pw = 2.9, ph = pw * 800 / 1180;
      var frame = kit.screen(1180, 800, pw, M(PM, at(0, 1.8, 0.05)), 'Retail Therapy’s own page, on a board in the forecourt');
      box(pw + 0.24, ph + 0.24, 0.06, M(PM, at(0, 1.8, 0)), '--rth-register', 0.01);
      [-1, 1].forEach(function (s) { box(0.08, 0.9, 0.08, M(PM, at(s * 1.2, 0.45, 0)), '--rth-ink', 0.006); });

      // HER LIGHTS, the one switch on her page, here too.
      function lights(i) {
        off = i === 1;
        Object.keys(SWAP).forEach(function (x) { kit.tint(SWAP[x][0], P(x)); });
        drawn.forEach(function (d) { d.fn(d.t.image.getContext('2d'), d.w, d.h); d.t.needsUpdate = true; });
        offOnly.forEach(function (m) { kit.hide(m, !off); });
        kit.scene.background = kit.col(P('sky'));
        skyLight.color = kit.col(off ? '--rth-off-ink' : '--rth-sky');
        skyLight.intensity = off ? 0.24 : 1.0;
        day.intensity = off ? 0 : 1.5;
        exitLight.intensity = off ? 2.2 : 0;
      }
      var lightSwitch = kit.choose({
        label: 'The lights', choices: ['Lights low', 'Lights off'], start: 0,
        pick: function (i) {
          lights(i);
          return i ? 'The lights are off: the shop has closed for the night, the shutters are down, and the exit sign and the light under the shutters are all there is. The door says CLOSED.'
                   : 'The lights are low and the music is off: sensory hours, all night. The door says QUIET HRS.';
        } });

      var stops = [
        { name: 'in the forecourt before her shopfront, the bench and the fountain in the middle', where: 'in the forecourt', x: -1.7, z: NEAR - 0.6, yaw: -0.1, pitch: 0.1, acts: [lightSwitch] },
        { name: 'at the shop door, its yellow sign, and a Caroline’s Cart parked by it', where: 'at the shop door', x: 0.4, z: FZ + 5.0, yaw: 0, pitch: 0.12, acts: [lightSwitch] },
        { name: 'on the bench by the fountain, the best seat in the house, watching the carts go by', where: 'on the bench by the fountain', x: FX, z: BZ + 0.5, yaw: 0, pitch: 0.02, acts: [lightSwitch, takeBook] },
        { name: 'at the cart corral, the row of Caroline’s Carts that never gets shorter, and the electric carts', where: 'at the cart corral', x: CX + 0.4, z: CZ + 3.2, yaw: 0.25, pitch: -0.2, acts: [takeCart] },
        { name: 'at the little free library: take a book, leave a book', where: 'at the little free library', x: LX - 1.2, z: LZ + 2.3, yaw: -0.45, pitch: 0.02, acts: [takeBook] },
        { name: 'at the store directory, a mall map board', where: 'at the store directory', x: -4.1, z: FZ + 8.1, yaw: 0.75, pitch: 0.12 },
        { name: 'at the board on the right, with her shop’s own page', where: 'at her shop’s own page', x: R - 3.4, z: FZ + 7.4, yaw: RIGHT, pitch: 0.02, page: kit.page, frame: frame }
      ];

      return {
        start: { x: -1.7, z: NEAR - 0.6, yaw: -0.1 },
        bounds: { x: [L + 1.0, R - 1.0], z: [FZ + 2.0, NEAR - 0.4] },
        stops: stops
      };
    }
  };
})();

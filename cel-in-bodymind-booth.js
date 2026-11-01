/* =============================================================================
   The Bodymind Booth, walked into on Cel Street. Ryan's ask, 2026-10-31: back
   on the street, working down it a room at a time.

   IT IS THE BOOTH'S WORLD AND NOBODY ELSE'S (§113): a photo booth with no
   camera in it, walked into and the curtain drawn behind you. The curtain is
   tangerine corduroy in soft wide folds; the booth's face in front of you is
   cream enamel in a steel rim, and every plate in here is that enamel.

   THE LIGHT IS TWO STRIP LIGHTS, one down each side wall a hand's width from
   the stool, behind frosted panels, the same white twice, steady, and NO
   FLASH: a photo booth's flash is the strobe Club Chronic refuses. Two lights
   that close and that alike light both sides of everything and leave the
   middle a shade darker, so every plate has its rims lit left and right and
   nothing throws a shadow you can see. Neither light casts one.

   NOBODY IS HANDED A BODY. The room draws no figure of its own: there is a
   stool, and whoever sits on it is you. The booth's own builder is the page's,
   lifted off it by the kit: the window where your bodymind is drawn, its
   readout and its buttons in front of the stool, and your choices on the
   left-hand wall. avatar.js and booth.js, which the page loads itself, are run
   against them, so it opens on somebody drawn at random, as the page does,
   and draws somebody else when you ask. The drawing is aria-hidden and its
   words are the page's readout. Nothing is kept or sent until you press Keep,
   which is the page's own button and the page's own promise.

   The house rules and where it goes hang on the right-hand wall with the
   booth's own page by the curtain, whose this is at the far end of the left,
   and the way next door to the Dopamine Dress-Up Den is a gap in the
   left-hand wall by the curtain.

   NOTHING MOVES. Every colour is one the booth declares, by name. This file
   keeps nothing, sends nothing and fetches nothing; its page arrives through
   Cel Street's screen(). tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['bodymind-booth.html'] = {
    name: 'The Bodymind Booth',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };
      var W = 6, D = 7.6, H = 3.2, back = -D, SZ = -4.8;
      var L = -W / 2, R = W / 2;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;

      // TWO STRIP LIGHTS, the same white, one from each side, and no flash.
      // A dim fill of the enamel from above; neither strip casts a shadow.
      kit.scene.background = kit.col('--bmb-ink');
      kit.scene.add(new T.HemisphereLight(kit.col('--bmb-lamp'), kit.col('--bmb-ink-2'), 0.9));
      [-1, 1].forEach(function (s) {
        var strip = new T.DirectionalLight(kit.col('--bmb-lamp'), 1.25);
        strip.position.set(s * 8, 2.0, SZ);
        strip.target.position.set(0, 1.4, SZ);
        kit.scene.add(strip, strip.target);
      });

      // THE BOOTH: a dark floor, an enamel ceiling, enamel side walls in a
      // steel trim.
      box(W + 0.4, 0.1, D + 0.4, at(0, -0.05, back / 2), '--bmb-ink', false, false);
      box(W + 0.4, 0.12, D + 0.4, at(0, H + 0.06, back / 2), '--bmb-chrome', false, false);
      box(0.3, H, D, at(L - 0.15, H / 2, back / 2), '--bmb-chrome', 0.015);
      box(0.3, H, D, at(R + 0.15, H / 2, back / 2), '--bmb-chrome', 0.015);
      [L + 0.01, R - 0.01].forEach(function (x) {
        box(0.04, 0.08, D, at(x, H - 0.04, back / 2), '--bmb-steel', false);
        box(0.04, 0.12, D, at(x, 0.06, back / 2), '--bmb-steel', false);
      });

      // THE STRIPS themselves: a tall frosted panel down each side wall, in a
      // steel surround, a hand's width either side of the stool's place.
      [L, R].forEach(function (x, i) {
        var face = i ? RIGHT : LEFT, inn = i ? -0.04 : 0.04;
        box(0.06, 2.2, 0.5, at(x + inn, 1.45, SZ), '--bmb-steel', 0.012);
        kit.flat(new T.PlaneGeometry(0.34, 2.0), at(x + inn * 2.1, 1.45, SZ, face), '--bmb-lamp');
      });

      // THE CURTAIN behind you, drawn shut: soft wide folds of tangerine
      // corduroy on a steel rod, the pleats in their own shade.
      box(W, 0.06, 0.06, at(0, H - 0.12, -0.25), '--bmb-steel', false);
      for (var p = 0; p < 15; p++) {
        var px = L + 0.2 + p * (W - 0.4) / 14;
        cyl(0.22, 0.22, H - 0.2, at(px, (H - 0.2) / 2, -0.12), p % 2 ? '--bmb-pleat' : '--bmb-curtain', false, 12);
      }

      // THE BOOTH'S OWN PAGE on the right-hand wall by the curtain.
      var pw = 1.5, ph = pw * 800 / 1180, py = 0.75 + ph / 2;
      box(0.05, ph + 0.14, pw + 0.14, at(R - 0.03, py, -1.0), '--bmb-steel', 0.012);
      var frame = kit.screen(1180, 800, pw, at(R - 0.07, py, -1.0, RIGHT), 'The Bodymind Booth’s own page, on the right-hand wall by the curtain');

      // THE BOOTH'S FACE in front of the stool: a cream enamel plate in a steel
      // rim where a camera would be, with no camera in it, and the lamp box
      // over it. The window and the sign on it are the page's own.
      var FZ = back + 0.12;
      box(3.4, 2.7, 0.12, at(0, 1.5, FZ - 0.06), '--bmb-steel', 0.015);
      box(3.2, 2.5, 0.06, at(0, 1.5, FZ + 0.02), '--bmb-chrome', 0.012);
      box(2.2, 0.62, 0.3, at(0, H - 0.34, FZ + 0.1), '--bmb-steel', 0.015);
      var sign = kit.lift(frame, '.bmb-lamp', { bare: true, w: 560, ww: 1.3, m: at(0, H - 0.68, FZ + 0.27) });
      var win = kit.lift(frame, '.bmb-window', { w: 520, h: 780, ww: 1.4, m: at(0, 0.36, FZ + 0.08) });

      // THE STOOL, steel, on one post, in the middle of the booth; nobody on it.
      cyl(0.34, 0.34, 0.07, at(0, 0.62, SZ), '--bmb-steel', 0.012, 24);
      cyl(0.04, 0.04, 0.56, at(0, 0.32, SZ), '--bmb-steel', false, 10);
      cyl(0.28, 0.3, 0.04, at(0, 0.02, SZ), '--bmb-steel', 0.012, 24);

      // YOUR CHOICES on the left-hand wall, on a plate of the enamel.
      box(0.06, 2.3, 1.9, at(L + 0.03, 1.35, -3.0), '--bmb-steel', 0.012);
      var choices = kit.lift(frame, '.bmb-choices', { w: 700, h: 900, ww: 1.6, m: at(L + 0.08, 0.3, -3.0, LEFT) });

      // THE RIGHT-HAND WALL: the house rules and where it goes, either side of
      // the strip; whose this is on the left-hand wall past the other strip.
      var goes = kit.lift(frame, '.bmb-part', { n: 2, w: 760, h: 820, ww: 1.6, m: at(R - 0.05, 0.45, -6.2, RIGHT) });
      var rules = kit.lift(frame, '.bmb-part', { n: 3, w: 760, h: 820, ww: 1.6, m: at(R - 0.05, 0.45, -2.6, RIGHT) });

      var whose = kit.lift(frame, '.bmb-part', { n: 4, w: 760, h: 700, ww: 1.3, m: at(L + 0.05, 0.4, -6.4, LEFT) });

      // NEXT DOOR: a gap in the left-hand wall by the curtain, through to the
      // Dopamine Dress-Up Den, its lintel in steel.
      box(0.34, 0.5, 1.1, at(L - 0.02, H - 0.25, -1.1), '--bmb-chrome', 0.015);
      box(0.36, 0.06, 1.1, at(L + 0.02, H - 0.53, -1.1), '--bmb-steel', false);
      box(0.32, H - 0.56, 1.1, at(L - 0.2, (H - 0.56) / 2, -1.1), '--bmb-ink-2', false);

      kit.wire(frame, 'avatar.js');
      kit.wire(frame, 'booth.js');

      return {
        start: { x: 0, z: -0.9, yaw: 0 },
        bounds: { x: [L + 0.7, R - 0.7], z: [back + 1.1, -0.8] },
        stops: [
          { name: 'just inside, the curtain drawn shut behind you', x: 0, z: -0.9, yaw: 0 },
          { name: 'on the stool, facing the window where your bodymind is drawn', x: 0, z: SZ, yaw: 0, pitch: 0.05, frame: win.el },
          { name: 'beside the stool, at a strip light a hand’s width from it, steady and with no flash', x: -0.6, z: SZ, yaw: LEFT, pitch: 0.1 },
          { name: 'under the sign: no camera, no flash, no photograph', x: 0, z: back + 2.4, yaw: 0, pitch: 0.35, frame: sign.el },
          { name: 'at your choices on the left-hand wall, everything you always have with you among them', x: L + 2.5, z: -3.0, yaw: LEFT, pitch: 0.02, frame: choices.el },
          { name: 'at the house rules, on the right-hand wall', x: R - 2.0, z: -2.6, yaw: RIGHT, frame: rules.el },
          { name: 'at where it goes, on the right-hand wall', x: R - 2.0, z: -6.2, yaw: RIGHT, frame: goes.el },
          { name: 'at whose this is, at the far end of the left-hand wall', x: L + 1.8, z: -6.4, yaw: LEFT, frame: whose.el },
          { name: 'at the right-hand wall by the curtain, with the booth’s own page on it', x: R - 1.6, z: -1.0, yaw: RIGHT, page: kit.page, frame: frame },
          { name: 'at the gap in the left-hand wall, next door to the Dopamine Dress-Up Den', x: L + 1.3, z: -1.1, yaw: LEFT, page: 'dopamine-dress-up-den.html' }
        ]
      };
    }
  };
})();

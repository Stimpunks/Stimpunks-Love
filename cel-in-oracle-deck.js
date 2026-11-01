/* =============================================================================
   The Oracle Deck, walked into on Cel Street, through a door in the Mopery's
   reading room. Ryan's ask, 2026-11-01: the rooms behind the doors.

   IT IS THE DECK'S WORLD AND SHARES NOTHING WITH THE LIBRARY IT IS KEPT IN
   (§23). The library is blue-black stone lit by candles that reach nothing; this
   is warm ash with not one blue in it, lit from NOWHERE: no lamp, no window, no
   sun and so no shadow, an even light over a plain ground, because a table of
   cards is the only thing you are looking at. There is no furniture. The door
   you came in by stands on its own on the ash, the deck's name and its page
   either side of it, and in front of you are thirteen
   rectangles standing on the plain ground in a horseshoe, the whole deck face
   up, every one of them the page's own card lifted off it: its plate, its name
   cut in capitals, its question and the museum's own credit. Nothing here is
   drawn of a plate. In the mouth of the horseshoe is the page's draw, lifted too,
   which the page's own oracle.js works exactly as it does there: one card, a
   copy, into the slot, and a way to put it back. No spread, no position, no
   reversal, nothing read together, and nothing kept.

   THE DECK ASKS AND DOES NOT ANSWER, and this scene adds no word to it. NO GOLD
   ON INDIGO, which is The Chappell's. NOTHING MOVES. Every colour is one §23
   declares, by name. It keeps nothing, sends nothing and fetches nothing; its
   page arrives through Cel Street's screen().
   ========================================================================== */
(function () {
  'use strict';

  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['oracle-deck.html'] = {
    name: 'The Oracle Deck',
    from: 'the-mopery.html',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };

      // LIT FROM NOWHERE: one even light, nothing that casts a shadow.
      kit.scene.background = kit.col('--orc-deep');
      kit.scene.add(new T.AmbientLight(undefined, Math.PI));

      // THE PLAIN GROUND, ash, and nothing standing on it but the cards, the
      // draw, and the door you came in by.
      box(30, 0.1, 30, at(0, -0.05, -6), '--orc-slate', false, false);

      // THE CUT RULE laid on the ground between you and the deck: two lines of
      // the edge and a brass lozenge between them, a shape and not a turned
      // square.
      [-1, 1].forEach(function (s) { box(2.6, 0.006, 0.03, at(s * 1.7, 0.003, -1.6), '--orc-edge', false, false); });
      var loz = new T.Shape();
      loz.moveTo(0, 0.13); loz.lineTo(0.13, 0); loz.lineTo(0, -0.13); loz.lineTo(-0.13, 0); loz.closePath();
      kit.flat(new T.ShapeGeometry(loz), at(0, 0.006, -1.6, 0, -Math.PI / 2), '--orc-brass');

      // THE DOOR FROM THE MOPERY, standing on its own on the ash: a frame of the
      // edge round a dark opening, and nothing either side of it.
      var DW = 1.3, DH = 2.5;
      kit.flat(new T.PlaneGeometry(DW, DH), at(0, DH / 2, 0.6, Math.PI), '--orc-deep');
      [-1, 1].forEach(function (e) { box(0.1, DH + 0.05, 0.12, at(e * (DW / 2 + 0.05), (DH + 0.05) / 2, 0.6), '--orc-edge', 0.012); });
      box(DW + 0.3, 0.1, 0.12, at(0, DH + 0.08, 0.6), '--orc-edge', 0.012);

      // THE ROOM'S OWN PAGE, standing on the ground beside the door in an edge
      // of its own, facing the deck.
      var pw = 2.2, ph = pw * 800 / 1180, px = 2.4, py = 0.4 + ph / 2;
      box(pw + 0.1, ph + 0.1, 0.05, at(px, py, 0.64), '--orc-edge', 0.01);
      [-1, 1].forEach(function (e) { box(0.06, 0.4, 0.06, at(px + e * pw / 3, 0.2, 0.64), '--orc-edge', false); });
      var frame = kit.screen(1180, 800, pw, at(px, py, 0.6, Math.PI), 'The Oracle Deck’s own page, standing beside the door');

      // THE DECK, face up: thirteen cards off the page, each standing on the
      // ash in a horseshoe round the draw, each facing its middle. The page's
      // own oracle.js finds the cards it draws from as .orc-index .orc-card, so
      // each card's lift wears the index's name, as each card on the page sits
      // in it; a drawn card is a copy of one of these.
      var C = { x: 0, z: -6.2 }, R = 5.0, N = 13, SPAN = 100 * Math.PI / 180;
      var cards = [];
      for (var i = 0; i < N; i++) {
        var a = -SPAN + i * (2 * SPAN / (N - 1));
        var cx = C.x + R * Math.sin(a), cz = C.z - R * Math.cos(a);
        cards.push({ a: a, x: cx, z: cz, it: kit.lift(frame, '.orc-card', { n: i, w: 360, ww: 1.05, m: at(cx, 0.02, cz, -a), cls: 'orc-index' }) });
        // Its foot on the ground: a slip of the edge it stands in.
        box(1.12, 0.03, 0.12, at(cx, 0.015, cz, -a), '--orc-edge', false, false);
      }

      // THE DRAW in the mouth of the horseshoe, lifted off the page; oracle.js
      // runs against it and the cards above, exactly as on the page.
      var draw = kit.lift(frame, '.orc-table', { w: 620, ww: 1.4, m: at(C.x, 0.05, C.z + 2.2) });
      // Its name, cut in capitals, on the other side of the door from the page.
      box(2.3, 0.03, 0.12, at(-px, 0.015, 0.62), '--orc-edge', false, false);
      var head = kit.lift(frame, '.orc-head', { w: 760, ww: 2.2, m: at(-px, 0.03, 0.6, Math.PI) });
      kit.wire(frame, 'oracle.js');

      var stops = [
        { name: 'just through the door, the deck standing face up in a horseshoe on the ash in front of you', x: 0, z: -0.6, yaw: 0, pitch: 0.05 },
        { name: 'at the draw, in the mouth of the horseshoe: one card, a copy, and a way to put it back', x: C.x, z: C.z + 4.0, yaw: 0, pitch: -0.15, frame: draw.el },
        { name: 'in the middle of the deck, every card face up round you', x: C.x, z: C.z + 0.6, yaw: 0, pitch: 0.12 }
      ];
      // A stop at cards round the horseshoe, standing back from each towards the middle.
      [[0, 'at the card at the near end of the horseshoe’s left arm'], [3, 'at a card on the left of the horseshoe'],
       [6, 'at the card at the head of the horseshoe, furthest from the door'], [9, 'at a card on the right of the horseshoe'],
       [12, 'at the card at the near end of the horseshoe’s right arm']].forEach(function (w) {
        var c = cards[w[0]], back = R - 2.3;
        stops.push({ name: w[1] + ', its question under its plate',
          x: C.x + back * Math.sin(c.a), z: C.z - back * Math.cos(c.a), yaw: -c.a, pitch: 0.05, frame: c.it.el });
      });
      stops.push({ name: 'back at the door, with the deck’s name cut beside it', x: -px, z: -2.0, yaw: Math.PI, frame: head.el });
      stops.push({ name: 'back at the door, with the room’s own page beside it', x: px, z: -2.0, yaw: Math.PI, page: kit.page, frame: frame });

      return {
        start: { x: 0, z: -0.6, yaw: 0 },
        bounds: { x: [-3.9, 3.9], z: [C.z - 3.0, -0.3] },
        stops: stops
      };
    }
  };
})();

/* =============================================================================
   The Oracle Deck, walked into on Paper Street. Ryan's ask, 2026-11-04: round
   one of the rest of the rooms, each its own world in card. On Cel Street it
   opens off the Mopery's parlour; on Paper Street it is reached by its address
   or the teleporter for now.

   IT IS THE DECK'S WORLD AND NOBODY ELSE'S (§23): the deck's rectangles on a
   plain ground and nothing else. The ground is warm ash with no source of
   light in it anywhere, because a table with cards on it is the only thing you
   are looking at, and there is no furniture: the cards lie face up across the
   ash in a spread, their engravings on paper the only warm thing, one card
   stands on its edge with its question mark showing, and at the far end the
   room's own page stands in a card's cut edge.

   IT SHARES NOTHING WITH THE MOPERY it opens off on Cel Street: no blue at
   all, no candle, no shelf, and no gold on indigo (that is the Chappell's).
   THE DECK ASKS AND DOES NOT ANSWER: no card is laid in a position, nothing is
   read together, and the scene says nothing about anybody's life. Nothing
   moves at any setting. Every colour is one §23 declares, by name. It keeps
   nothing, sends nothing and fetches nothing; its page arrives through Paper
   Street's screen(). tools/make-paper-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }

  // A card stood on its edge, its back toward you: the cut paper, a border in
  // the room's brass, and the question mark, cut rather than printed.
  function cardBack(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, rx: 14, fill: 'var(--orc-cut)', stroke: 'var(--orc-edge)', 'stroke-width': 6 }));
    s.appendChild(el('rect', { x: 26, y: 26, width: w - 52, height: h - 52, rx: 6, fill: 'none', stroke: 'var(--orc-brass)', 'stroke-width': 5 }));
    for (var y = 60; y < h - 60; y += 24) s.appendChild(el('rect', { x: 44, y: y, width: w - 88, height: 2, fill: 'var(--orc-dim)' }));
    var q = el('text', { x: w / 2, y: h * 0.62, 'text-anchor': 'middle', 'font-family': 'Cinzel, serif', 'font-weight': 700, 'font-size': h * 0.42, fill: 'var(--orc-red)' });
    q.textContent = '?';
    s.appendChild(q);
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['oracle-deck.html'] = {
    prefix: 'orc-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 900), sh = kit.H - 24;
      var END = 2600 + F;                       // where the page stands
      var eye = sh / 2;
      var CW = 300, CL = 470;                   // a card on the ground: across, and along
      var decor = [];

      // THE SPREAD: the deck laid face up on the ash, in rows, a hand's
      // gap between them, none in a position meaning anything.
      var cards = [];
      [[4, 900], [5, 1550], [4, 2200]].forEach(function (row) {
        for (var i = 0; i < row[0]; i++) cards.push({ x: (i - (row[0] - 1) / 2) * (CW + 90), z: row[1] });
      });
      var stood = kit.item(cardBack(300, 470), { x: 900, z: 2000, w: 300, h: 470 });
      decor.push(stood);

      var page = kit.screen(kit.page, 'The Oracle Deck’s own page, standing in a card’s cut edge');
      var face = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'orc-walk-face' });

      var stops = [
        kit.stop({ name: 'at the edge of the spread, the cards laid face up on the ash', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'among the cards, in the middle of the spread', spot: { x: 0, z: 1200 } }),
        kit.stop({ name: 'at the card stood on its edge, a question on its back', spot: kit.front(stood, 900) }),
        kit.stop({ name: 'at the far end, with the room’s own page standing in a card’s cut edge', spot: { x: 0, z: END - F }, link: page }, face)
      ];

      return {
        cls: 'orc-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The deck lies face up across the ash; its own page stands at the far end.',
        bounds: function () { return { x: [-1100, 1100], z: [0, END - F] }; },
        ground: function (g, near, far) {
          kit.quad(g, -6000, 6000, near, far, kit.ink('--orc-slate'));
          var cut = kit.ink('--orc-cut'), edge = kit.ink('--orc-edge'), dim = kit.ink('--orc-dim'), deep = kit.ink('--orc-deep');
          cards.forEach(function (c, n) {
            var x0 = c.x - CW / 2, x1 = c.x + CW / 2, z0 = c.z - CL / 2, z1 = c.z + CL / 2;
            if (z1 < near || z0 > far) return;
            kit.quad(g, x0 + 10, x1 + 10, z0 + 14, z1 + 14, deep, 0.5);
            kit.quad(g, x0, x1, z0, z1, edge);
            kit.quad(g, x0 + 8, x1 - 8, z0 + 8, z1 - 8, cut);
            // The engraving on each, a plate of hatching in its own place.
            kit.quad(g, x0 + 34, x1 - 34, z0 + 60, z1 - 120, dim, 0.55);
            for (var k = 0; k < 6; k++) {
              var hz = z0 + 70 + k * ((CL - 200) / 6) + (n % 3) * 6;
              kit.quad(g, x0 + 44, x1 - 44, hz, hz + 6, edge, 0.6);
            }
            kit.quad(g, x0 + 34, x1 - 34, z1 - 90, z1 - 70, edge, 0.5);
          });
        }
      };
    }
  };
})();

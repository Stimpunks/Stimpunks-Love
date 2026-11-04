/* =============================================================================
   The Polaroid Wall, walked into on Paper Street. Ryan's ask, 2026-11-04: round
   one of the rooms still to be walked into. On Cel Street it opens off Enid's
   Room, through the door at the back; here it is reached by its address or the
   teleporter.

   THE ROOM IS PHOTOGRAPHS, AND NOT ONE OF THEM IS HERE. Every photograph on the
   wall has a consent record naming the pages it is published on, so the
   photographs are seen only on the room's own page, which hangs on the
   left-hand wall here. What is cut out of card is the wall they hang on, as the
   page itself puts it: grey rectangles, placeholders that stay grey until
   somebody sends one. Every frame on the far wall is empty, a pale card with a
   grey plate and no caption, held up by a yellow pin. No picture, no face and
   no figure standing in for a person is drawn anywhere, because a drawing of
   somebody is a description of them in our words, which the wall promises not
   to make. The frames hang straight here, as they do on the page at Gentle,
   because nothing in a room on Paper Street is turned but by the kit.

   It is a plain room (§11), in the plain rooms' own colours by name: the ink
   walls, the paper of the frames, the chalk of the plates, the yellow pins.

   NOTHING MOVES, nothing is fetched but the page through Paper Street's
   screen(), and nothing is kept. tools/make-paper-street.py holds each of those.
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

  // An empty polaroid: the paper card, a grey plate where a picture would be,
  // the deep margin at the foot with no caption on it, and its pin.
  function polaroid(s, x, y, w) {
    var h = w * 1.2;
    s.appendChild(el('rect', { x: x, y: y, width: w, height: h, fill: 'var(--paper)' }));
    s.appendChild(el('rect', { x: x + w * 0.07, y: y + w * 0.07, width: w * 0.86, height: w * 0.86, fill: 'var(--chalk)' }));
    s.appendChild(el('circle', { cx: x + w / 2, cy: y + 10, r: 9, fill: 'var(--yellow)' }));
  }

  // A wall of the room, and on the far one the frames in rows, every one empty.
  function wall(w, h, frames) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--ink-2)' }));
    s.appendChild(el('rect', { x: 0, y: h - 40, width: w, height: 40, fill: 'var(--ink)' }));
    if (frames) {
      var fw = 150, gap = 70;
      for (var row = 0; row < 3; row++) {
        for (var x = 160 + (row % 2) * 90; x < w - 200; x += fw + gap) {
          polaroid(s, x, h - 800 + row * (fw * 1.2 + 60), fw);
        }
      }
    }
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['polaroids.html'] = {
    prefix: 'pol-walk',
    build: function (kit) {
      var F = kit.F;
      var sh = kit.H - 24;
      var eye = sh / 2;
      var BACK = 2400, HALF = 1000, WH = Math.max(1100, sh + 560);
      var decor = [];

      var far = { x: 0, z: BACK, w: 2 * HALF + 200, h: WH };
      decor.push(kit.item(wall(2 * HALF + 200, WH, true), far));
      [-1, 1].forEach(function (side) {
        decor.push(kit.item(wall(BACK + 600, WH, side > 0), { x: side * HALF, z: BACK / 2 - 300, w: BACK + 600, h: WH, turn: side < 0 ? kit.LEFT : kit.RIGHT }));
      });

      // The page, on the left-hand wall, in a paper edge.
      var PW = Math.min(kit.W - 160, 860), PH = Math.round(PW * 0.62);
      var page = kit.screen(kit.page, 'The Polaroid Wall’s own page, on the left-hand wall');
      var hung = kit.item(page, { x: -HALF + 6, z: 1000, w: PW, h: PH, y: 200, turn: kit.LEFT, cls: 'pol-walk-page' });

      var stops = [
        kit.stop({ name: 'inside the door, the wall of empty frames ahead', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the left-hand wall, with the room’s own page, where the photographs are', spot: kit.front(hung), link: page }, hung),
        kit.stop({ name: 'at the far wall, every frame on it a grey plate waiting for somebody to send one', spot: { x: 0, z: BACK - F * 1.1 } })
      ];

      return {
        cls: 'pol-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Every frame here is empty; the photographs are on the room’s own page, on the left-hand wall.',
        bounds: function () { return { x: [-HALF + 220, HALF - 220], z: [-200, BACK - 500] }; },
        ground: function (g, near, far) {
          kit.quad(g, -5000, 5000, near, far, kit.ink('--ink'));
          var seam = kit.ink('--ink-3');
          for (var z = Math.ceil(near / 200) * 200; z < Math.min(far, BACK); z += 200) kit.quad(g, -HALF, HALF, z, z + 3, seam, 0.6);
        }
      };
    }
  };
})();

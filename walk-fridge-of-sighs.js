/* =============================================================================
   The Fridge of Sighs, walked into on Paper Street. Ryan's ask, 2026-11-04:
   round 1 of the rooms left on Paper Street.

   IT IS THE FRIDGE OF SIGHS' WORLD AND NOBODY ELSE'S (§85): a kitchen cut out
   of card, and at the end of it the door of its fridge, in turquoise enamel.
   THE LIGHT IS THE WINDOW BEHIND YOU, SEEN IN THE ENAMEL: the kitchen window
   is in the wall at your back, and what you see of it is one soft, pale,
   upright band lying down the fridge's glossy doors, drawn flat because a
   reflection is not lit by anything. Nothing in the room is cut open and
   nothing in it is yellow (Vital Plant Living, the street's other kitchen, is a
   section on a turmeric wall); there is no type, no metal and no workshop (the
   Foundry); and nothing lines the magnets up (the Adventurer's Guild).

   THE MAGNETS ON THE DOOR CARRY NO WORDS. The words are the community's, put
   up one at a time on the room's own page, which hangs on the left-hand wall
   and is the real door: putting a word up works there, and no sentence is
   copied into the scene. The magnets sit straight and land at uneven heights,
   the way a hand leaves them.

   NOTHING MOVES. Every colour is one the Fridge of Sighs declares, by name. It
   keeps nothing, sends nothing and fetches nothing; its page arrives through
   Paper Street's screen(). tools/make-paper-street.py holds each of those.
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

  // A tiled kitchen wall.
  function tiles(w, h) {
    var s = svg(w, h), t = 80;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--fos-tile)' }));
    for (var x = 0; x < w; x += t) s.appendChild(el('rect', { x: x, y: h * 0.35, width: 3, height: h * 0.65, fill: 'var(--fos-chrome)' }));
    for (var y = h * 0.35; y < h; y += t) s.appendChild(el('rect', { x: 0, y: y, width: w, height: 3, fill: 'var(--fos-chrome)' }));
    s.appendChild(el('rect', { x: 0, y: h - 30, width: w, height: 30, fill: 'var(--fos-edge)' }));
    return s;
  }

  // The fridge: two glossy turquoise doors, the window's band lying down them,
  // chrome handles, and magnets with no words on them, straight, at uneven
  // heights.
  function fridge(w, h) {
    var s = svg(w, h), split = h * 0.32;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, rx: 40, fill: 'var(--fos-edge)' }));
    s.appendChild(el('rect', { x: 10, y: 10, width: w - 20, height: split - 16, rx: 32, fill: 'var(--fos-door)' }));
    s.appendChild(el('rect', { x: 10, y: split + 6, width: w - 20, height: h - split - 16, rx: 32, fill: 'var(--fos-door)' }));
    s.appendChild(el('rect', { x: w * 0.62, y: 18, width: w * 0.1, height: h - 36, fill: 'var(--fos-sheen)', 'fill-opacity': '0.8' }));
    s.appendChild(el('rect', { x: w * 0.06, y: split - 70, width: 18, height: 56, rx: 9, fill: 'var(--fos-chrome)' }));
    s.appendChild(el('rect', { x: w * 0.06, y: split + 30, width: 18, height: 160, rx: 9, fill: 'var(--fos-chrome)' }));
    var n = 0;
    for (var y = 60; y < h - 80; y += 46) {
      if (Math.abs(y - split) < 30) continue;
      for (var x = w * 0.16 + (n * 17) % 40; x < w * 0.9 - 60; n++) {
        var mw = 46 + (n * 29) % 60;
        s.appendChild(el('rect', { x: x, y: y + (n * 7) % 14, width: mw, height: 26, rx: 3, fill: 'var(--fos-tile)', stroke: 'var(--fos-dim)', 'stroke-width': 2 }));
        x += mw + 10 + (n * 13) % 30;
      }
    }
    return s;
  }

  // The kitchen window behind you: the light that lies down the enamel.
  function windowWall(w, h) {
    var s = tiles(w, h);
    s.appendChild(el('rect', { x: w * 0.36, y: h * 0.1, width: w * 0.28, height: h * 0.5, fill: 'var(--fos-sheen)', stroke: 'var(--fos-chrome)', 'stroke-width': 18 }));
    s.appendChild(el('rect', { x: w * 0.5 - 6, y: h * 0.1, width: 12, height: h * 0.5, fill: 'var(--fos-chrome)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['fridge-of-sighs.html'] = {
    prefix: 'fos-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 940), sh = kit.H - 24;
      var END = 1700 + F;                          // the fridge's wall
      var eye = sh / 2;
      var SIDE = 900, WH = Math.max(950, sh + 400);
      var decor = [];

      decor.push(kit.item(tiles(SIDE * 2 + 40, WH), { x: 0, z: END + 40, w: SIDE * 2 + 40, h: WH }));
      [-1, 1].forEach(function (side) {
        decor.push(kit.item(tiles(END + 500, WH), { x: side * SIDE, z: (END - 500) / 2, w: END + 500, h: WH,
          turn: side < 0 ? kit.LEFT : kit.RIGHT, near: 0.3 }));
      });
      decor.push(kit.item(windowWall(SIDE * 2 + 40, WH), { x: 0, z: -500, w: SIDE * 2 + 40, h: WH, turn: Math.PI }));
      var door = kit.item(fridge(560, 1000), { x: 140, z: END, w: 560, h: 1000 });
      decor.push(door);

      var page = kit.screen(kit.page, 'The Fridge of Sighs’ own page, on the left-hand wall');
      var leaf = kit.item(page, { x: -SIDE + 8, z: 1200, w: sw, h: sh, turn: kit.LEFT, cls: 'fos-walk-wall' });

      var stops = [
        kit.stop({ name: 'in the kitchen, the window behind you and the fridge ahead', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the fridge, the window lying down its enamel, its magnets with no words on them', spot: kit.front(door, F * 1.1) }, door),
        kit.stop({ name: 'at the left-hand wall, with the room’s own page on it, where the words go up', spot: kit.front(leaf), link: page }, leaf)
      ];

      return {
        cls: 'fos-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page hangs on the left-hand wall; the fridge stands at the end of the kitchen.',
        bounds: function () { return { x: [-SIDE + 300, SIDE - 300], z: [-200, END - 700] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--fos-edge'));
          // A kitchen floor of checks, the fridge's own two darks.
          var a = kit.ink('--fos-dim');
          for (var j = Math.max(-5, Math.floor(from / 120)); j * 120 < Math.min(to, END + 40); j++) {
            for (var i = -8; i < 8; i++) if ((i + j + 64) % 2 === 0) kit.quad(g, i * 120, i * 120 + 120, j * 120, j * 120 + 120, a);
          }
        }
      };
    }
  };
})();

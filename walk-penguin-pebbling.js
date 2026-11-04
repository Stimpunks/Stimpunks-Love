/* =============================================================================
   Penguin Pebbling, walked into on Paper Street. Ryan's ask, 2026-11-04: round
   one of the rooms still to be walked into. On Cel Street it opens off the
   Arcade, through its cabinet; here it is reached by its address or the
   teleporter.

   IT IS THE ARCADE'S BODY AND THIS MACHINE'S SCREEN (§15). The Arcade is the
   one room whose pages are supposed to look alike: the grape carpet, the
   purple walls, the marquee bulbs and the cabinet build are the foyer's,
   because an arcade is machines with one body and different things behind the
   glass. So this is a bay off the carpet, close up to one cabinet, and the
   world is its screen: an overcast shore, the sky pale, the sea grey-green, the
   shingle and a penguin on it with a pebble at its feet. Cut out of card here,
   it is a picture of the attract screen; the game itself is played on the
   room's own page, on the back wall beside the cabinet in a coin edge.

   IT IS BUILT ON THE LOCUTION AND TAKES NOTHING FROM THE DECK: Amythest
   Schaber's locution, and no card, prompt or artwork of Helen Edgar's and Ryan
   Boren's Penguin Pebbling card game is drawn here. Nothing is counted: the
   pebbles on the carpet by the cabinet are a few stones, not a tally.

   NOTHING MOVES: the bulbs are lit and still, and the cabinet makes no sound,
   ever. Every colour is one the Arcade or the shore declares, by name. It
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
  function hash(i, j, k) {
    var n = Math.imul(i + 13, 374761393) ^ Math.imul(j + 3, 668265263) ^ Math.imul(k + 41, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }
  // Marquee bulbs in a row, lit and still, coin and zap by turns.
  function bulbs(s, x0, x1, y, n, r) {
    for (var b = 0; b < n; b++) {
      s.appendChild(el('circle', { cx: x0 + (b + 0.5) * (x1 - x0) / n, cy: y, r: r, fill: b % 2 ? 'var(--zap)' : 'var(--coin)' }));
    }
  }

  // THE SHORE, the cabinet's screen: overcast sky, grey sea with a line of
  // surf, shingle, and a penguin standing on it with one pebble at its feet.
  function shore(s, x, y, w, h) {
    s.appendChild(el('rect', { x: x, y: y, width: w, height: h, fill: 'var(--sky)' }));
    s.appendChild(el('rect', { x: x, y: y + h * 0.42, width: w, height: h * 0.22, fill: 'var(--sea)' }));
    s.appendChild(el('rect', { x: x, y: y + h * 0.62, width: w, height: 6, fill: 'var(--pen-light)' }));
    s.appendChild(el('rect', { x: x, y: y + h * 0.64, width: w, height: h * 0.36, fill: 'var(--shingle)' }));
    for (var k = 0; k < 40; k++) {
      s.appendChild(el('ellipse', { cx: x + hash(k, 1, 1) * w, cy: y + h * (0.68 + hash(k, 2, 1) * 0.3), rx: 7 + hash(k, 3, 1) * 8, ry: 5, fill: 'var(--pen-dark)', 'fill-opacity': '0.25' }));
    }
    var px = x + w * 0.3, py = y + h * 0.9;
    s.appendChild(el('ellipse', { cx: px, cy: py - 70, rx: 34, ry: 64, fill: 'var(--pen-dark)' }));
    s.appendChild(el('ellipse', { cx: px + 8, cy: py - 62, rx: 20, ry: 48, fill: 'var(--pen-light)' }));
    s.appendChild(el('circle', { cx: px, cy: py - 140, r: 26, fill: 'var(--pen-dark)' }));
    s.appendChild(el('circle', { cx: px + 10, cy: py - 146, r: 4, fill: 'var(--pen-light)' }));
    s.appendChild(el('path', { d: 'M' + (px + 22) + ' ' + (py - 142) + ' l22 6 l-22 6 z', fill: 'var(--beak)' }));
    s.appendChild(el('ellipse', { cx: px + 58, cy: py - 6, rx: 13, ry: 9, fill: 'var(--pen-dark)' }));
  }

  // THE CABINET, the foyer's build: hard blocks of the purple, coin edges,
  // bulbs along the marquee, the shore in its screen, a pad and two knobs.
  function cabinet(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--cab)' }));
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'none', stroke: 'var(--coin)', 'stroke-width': 8 }));
    s.appendChild(el('rect', { x: 24, y: 24, width: w - 48, height: 120, fill: 'var(--carpet)' }));
    bulbs(s, 34, w - 34, 44, 11, 9);
    s.appendChild(el('rect', { x: 80, y: 74, width: w - 160, height: 40, rx: 6, fill: 'var(--sea)' }));
    shore(s, 50, 180, w - 100, h * 0.42);
    s.appendChild(el('rect', { x: 46, y: 176, width: w - 92, height: h * 0.42 + 8, fill: 'none', stroke: 'var(--carpet)', 'stroke-width': 8 }));
    var py = 180 + h * 0.42 + 40;
    s.appendChild(el('rect', { x: 30, y: py, width: w - 60, height: 120, fill: 'var(--carpet)' }));
    s.appendChild(el('circle', { cx: 120, cy: py + 60, r: 34, fill: 'var(--mint)' }));
    s.appendChild(el('circle', { cx: w - 160, cy: py + 60, r: 22, fill: 'var(--coin)' }));
    s.appendChild(el('circle', { cx: w - 90, cy: py + 60, r: 22, fill: 'var(--zap)' }));
    s.appendChild(el('rect', { x: w / 2 - 40, y: h - 50, width: 80, height: 14, rx: 4, fill: 'var(--coin)' }));
    return s;
  }

  // The bay's walls: the purple, a coin rail at the foot and bulbs along the
  // top, the same in every bay of the foyer.
  function bayWall(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--cab)' }));
    s.appendChild(el('rect', { x: 0, y: h - 14, width: w, height: 14, fill: 'var(--coin)' }));
    bulbs(s, 20, w - 20, 40, Math.max(6, Math.round(w / 70)), 10);
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['penguin-pebbling.html'] = {
    prefix: 'peb-walk',
    from: 'arcade.html',
    build: function (kit) {
      var F = kit.F;
      var sh = kit.H - 24;
      var eye = sh / 2;
      var BACK = 2400, HALF = 1100, WH = Math.max(1000, sh + 420);
      var decor = [];

      decor.push(kit.item(bayWall(2 * HALF + 200, WH), { x: 0, z: BACK, w: 2 * HALF + 200, h: WH }));
      [-1, 1].forEach(function (side) {
        decor.push(kit.item(bayWall(BACK + 800, WH), { x: side * HALF, z: BACK / 2 - 400, w: BACK + 800, h: WH, turn: side < 0 ? kit.LEFT : kit.RIGHT }));
      });
      var CW = 520, CH = 800;
      var cab = { x: -380, z: BACK - 240, w: CW, h: CH };
      decor.push(kit.item(cabinet(CW, CH), cab));

      // The page, on the back wall beside the cabinet, in a coin edge.
      var PW = Math.min(kit.W - 200, 820), PH = Math.round(PW * 0.62);
      var page = kit.screen(kit.page, 'Penguin Pebbling’s own page, on the back wall beside its cabinet');
      var glass = kit.item(page, { x: 480, z: BACK - 6, w: PW, h: PH, y: 200, cls: 'peb-walk-glass' });

      var stops = [
        kit.stop({ name: 'in the bay off the carpet, the cabinet ahead', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the cabinet, with the overcast shore on its screen', spot: kit.front(cab, 1400) }),
        kit.stop({ name: 'at the back wall, with the game’s own page, where it is played', spot: kit.front(glass), link: page }, glass)
      ];

      return {
        cls: 'peb-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The game is played on its own page, on the back wall beside its cabinet.',
        bounds: function () { return { x: [-HALF + 240, HALF - 240], z: [-300, BACK - 500] }; },
        ground: function (g, near, far) {
          kit.quad(g, -5000, 5000, near, far, kit.ink('--carpet'));
          // The foyer's confetti in the carpet, the same every visit.
          var inks = [kit.ink('--coin'), kit.ink('--mint'), kit.ink('--zap')];
          for (var j = Math.max(-6, Math.floor(near / 110)); j < Math.min(Math.ceil(BACK / 110), Math.ceil(far / 110)); j++) {
            for (var i = -10; i <= 10; i++) {
              if (hash(i, j, 1) > 0.5) continue;
              var px = i * 110 + hash(i, j, 2) * 80, pz = j * 110 + hash(i, j, 3) * 80;
              kit.quad(g, px, px + 14, pz, pz + 14, inks[Math.floor(hash(i, j, 4) * 3)]);
            }
          }
          // A few pebbles by the cabinet's foot: stones, not a tally.
          var stone = kit.ink('--shingle');
          [[-200, BACK - 380], [-150, BACK - 420], [-470, BACK - 400]].forEach(function (p) { kit.oval(g, p[0], p[1], 16, 11, stone); });
        }
      };
    }
  };
})();

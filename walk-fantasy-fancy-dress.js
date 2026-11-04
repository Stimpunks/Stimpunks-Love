/* =============================================================================
   Fantasy Fancy Dress, walked into on Paper Street. Ryan's ask, 2026-11-04:
   round 1 of the rooms left on Paper Street.

   IT IS THE SHOP'S WORLD AND NOBODY ELSE'S (§116): the back of a fancy dress
   shop, cut out of card, lit only from behind, through sheer stuff. Lengths of
   tulle and chiffon hang across the far end in rose, mint, gold and lilac,
   overlapping, and the only light in the room is behind them, coming through:
   where two sheers cross the colour deepens. The rail of stock, the mirror and
   the wings on their hook stand dark against that light, and you with them;
   every word stands on the dark, which is why the shop's own page hangs on
   the left-hand wall and not in the light. The Den this opens off is white
   daylight on lavender with a crystal's rainbows; none of that comes through
   the curtain, and there is no flame, no brown, no bulb and no string of fairy
   lights in here. NOBODY'S BODY IS DRAWN: the stock hangs on hangers.

   NOTHING MOVES AT ANY SETTING: the sheers hang still, in a room with no
   window to let a breeze in. Every colour is one §116 declares, by name. It
   keeps nothing, sends nothing and fetches nothing; its page arrives through
   Paper Street's screen(). tools/make-paper-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var SHEERS = ['--ffd-rose', '--ffd-mint', '--ffd-gold', '--ffd-lilac'];

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }

  // The far end: the light behind, and the sheers hanging in front of it,
  // overlapping, each with a soft hem and nothing with an edge.
  function sheers(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--ffd-hush)' }));
    s.appendChild(el('rect', { x: w * 0.04, y: h * 0.04, width: w * 0.92, height: h * 0.96, fill: 'var(--ffd-glow)' }));
    for (var i = 0, x = -60; x < w; i++, x += 150) {
      var sw = 260 + (i % 3) * 40, hem = h - 40 - (i % 4) * 30;
      s.appendChild(el('path', { fill: 'var(' + SHEERS[i % SHEERS.length] + ')', 'fill-opacity': '0.55',
        d: 'M' + x + ' 0 H' + (x + sw) + ' V' + hem + ' Q' + (x + sw * 0.75) + ' ' + (hem + 40) + ' ' + (x + sw / 2) + ' ' + hem +
           ' Q' + (x + sw * 0.25) + ' ' + (hem - 40) + ' ' + x + ' ' + hem + ' Z' }));
    }
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: 30, fill: 'var(--ffd-hush)' }));
    return s;
  }

  // The rail of stock on hangers, dark against the light: capes, wings, a
  // dress-up suit with its hood, a onesie, each only an outline.
  function rail(w, h) {
    var s = svg(w, h), top = 60;
    s.appendChild(el('rect', { x: 0, y: top, width: w, height: 10, fill: 'var(--ffd-edge)' }));
    [0, w - 12].forEach(function (x) { s.appendChild(el('rect', { x: x, y: top, width: 12, height: h - top, fill: 'var(--ffd-edge)' })); });
    for (var x = 70, n = 0; x < w - 60; x += 110, n++) {
      s.appendChild(el('path', { fill: 'none', stroke: 'var(--ffd-edge)', 'stroke-width': 4, d: 'M' + x + ' ' + (top + 5) + ' q0 -22 14 -22' }));
      s.appendChild(el('path', { fill: 'none', stroke: 'var(--ffd-edge)', 'stroke-width': 4, d: 'M' + (x - 40) + ' ' + (top + 40) + ' L' + x + ' ' + (top + 14) + ' L' + (x + 40) + ' ' + (top + 40) }));
      var long = n % 3 === 0 ? h * 0.75 : n % 3 === 1 ? h * 0.55 : h * 0.4;
      s.appendChild(el('path', { fill: 'var(--ffd-hush)', stroke: 'var(--ffd-panel)', 'stroke-width': 3,
        d: 'M' + (x - 40) + ' ' + (top + 40) + ' L' + (x - 52) + ' ' + (top + long) + ' H' + (x + 52) + ' L' + (x + 40) + ' ' + (top + 40) + ' Z' }));
    }
    return s;
  }

  // The mirror in its frame, holding only the dark of the room.
  function mirror(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, rx: w / 2, fill: 'var(--ffd-edge)' }));
    s.appendChild(el('rect', { x: 18, y: 18, width: w - 36, height: h - 36, rx: w / 2 - 18, fill: 'var(--ffd-panel)' }));
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--ffd-ink-2)', 'stroke-width': 4, 'stroke-opacity': '0.5',
      d: 'M' + (w * 0.3) + ' ' + (h * 0.25) + ' L' + (w * 0.6) + ' ' + (h * 0.12) }));
    return s;
  }

  // Faery wings on a hook, dark against the light.
  function wings(w, h) {
    var s = svg(w, h), cx = w / 2;
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--ffd-edge)', 'stroke-width': 6, d: 'M' + cx + ' 0 V40 q0 16 -14 16' }));
    [-1, 1].forEach(function (side) {
      s.appendChild(el('path', { fill: 'var(--ffd-hush)', stroke: 'var(--ffd-edge)', 'stroke-width': 4,
        d: 'M' + cx + ' 70 Q' + (cx + side * w * 0.5) + ' 20 ' + (cx + side * w * 0.46) + ' ' + h * 0.45 + ' Q' + (cx + side * w * 0.2) + ' ' + h * 0.5 + ' ' + cx + ' ' + h * 0.5 + ' Z' }));
      s.appendChild(el('path', { fill: 'var(--ffd-hush)', stroke: 'var(--ffd-edge)', 'stroke-width': 4,
        d: 'M' + cx + ' ' + h * 0.5 + ' Q' + (cx + side * w * 0.4) + ' ' + h * 0.55 + ' ' + (cx + side * w * 0.3) + ' ' + h * 0.95 + ' Q' + (cx + side * w * 0.1) + ' ' + h * 0.8 + ' ' + cx + ' ' + h * 0.55 + ' Z' }));
    });
    return s;
  }

  // A side wall of the shop, the dark the words stand on.
  function wall(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--ffd-ground)' }));
    s.appendChild(el('rect', { x: 0, y: h - 30, width: w, height: 30, fill: 'var(--ffd-hush)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['fantasy-fancy-dress.html'] = {
    prefix: 'ffd-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 940), sh = kit.H - 24;
      var END = 2200 + F;                          // the sheers
      var eye = sh / 2;
      var SIDE = 820, WH = Math.max(1000, sh + 440);
      var decor = [];

      decor.push(kit.item(sheers(SIDE * 2 + 40, WH), { x: 0, z: END + 30, w: SIDE * 2 + 40, h: WH }));
      [-1, 1].forEach(function (side) {
        decor.push(kit.item(wall(END + 400, WH), { x: side * SIDE, z: (END - 400) / 2, w: END + 400, h: WH,
          turn: side < 0 ? kit.LEFT : kit.RIGHT, near: 0.3 }));
      });
      var stock = kit.item(rail(1100, 560), { x: 260, z: END - 600, w: 1100, h: 560 });
      var glass = kit.item(mirror(260, 620), { x: SIDE - 180, z: 1800, w: 260, h: 620, turn: -0.9 });
      var hook = kit.item(wings(300, 360), { x: -360, z: END - 300, w: 300, h: 360, y: 260 });
      decor.push(stock, glass, hook);

      var page = kit.screen(kit.page, 'Fantasy Fancy Dress’s own page, on the left-hand wall by the curtain');
      var leaf = kit.item(page, { x: -SIDE + 8, z: 1000, w: sw, h: sh, turn: kit.LEFT, cls: 'ffd-walk-wall' });

      var stops = [
        kit.stop({ name: 'through the curtain from the Den, the light ahead through the sheers', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the mirror, holding only the dark of the room', spot: kit.front(glass, F * 0.8) }, glass),
        kit.stop({ name: 'at the rail of stock, dark against the sheers', spot: { x: 160, z: END - 600 - F * 0.9 } }, stock),
        kit.stop({ name: 'at the left-hand wall, on the dark, with the shop’s own page on it', spot: kit.front(leaf), link: page }, leaf)
      ];

      return {
        cls: 'ffd-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page hangs on the left-hand wall, on the dark; the light is at the far end, through the sheers.',
        bounds: function () { return { x: [-SIDE + 300, SIDE - 300], z: [0, END - 900] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--ffd-hush'));
          kit.quad(g, -SIDE, SIDE, Math.max(from, -400), Math.min(to, END), kit.ink('--ffd-ground'));
          // The light through the sheers reaches the floor only near them,
          // in their colours, and fades into the dark before your feet.
          SHEERS.forEach(function (name, i) {
            kit.quad(g, -SIDE + i * (SIDE / 2), -SIDE + (i + 1) * (SIDE / 2), END - 700, END, kit.ink(name), 0.08);
          });
          kit.oval(g, 0, END, 1200, 500, kit.ink('--ffd-glow'), 0.08);
        }
      };
    }
  };
})();

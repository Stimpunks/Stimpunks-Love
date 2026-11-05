/* =============================================================================
   Retail Therapy, walked into on Paper Street, out of the newest brochure in
   Excursions. Ryan's ask, 2026-11-05: every new room onto both streets.

   NORAH HOBBS'S SHOP THAT SELLS NOTHING (§142), made with Claude for
   Infodumplings on 5 November 2026. THIS SCENE IS OURS, cut out of card from
   her page and in her colours only, and changes nothing on her page; it is
   hers to keep or to send back, and anything in it is hers to change.

   At the far end, her shopfront exactly as she drew it at the top of her
   page, as a flat: the red brick front, the teal sign with the shop's name in
   her round heavy script, the striped awning, two windows with shapes on their
   shelves, the glass door with QUIET HRS on its yellow sign, and a Caroline's
   Cart parked by it. In front of it, out of her page's own words: the bench by
   the fountain in the middle, the best seat in the house; the cart corral,
   where the row of Caroline's Carts never gets shorter; the little free
   library, a house of wood with a brick roof and her seven book spines; and
   the store directory, a mall map board in her tile colours. Her page is on a
   board on the right wall. It is the shop with the lights low, in sensory
   hours, under her pale sky.

   NOTHING MOVES, as her page promises: the fountain stands still. Every colour
   is one §142 names out of her page. It keeps nothing, sends nothing and
   fetches nothing; her page arrives through Paper Street's screen().
   tools/make-paper-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function el(name, attrs, words) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (words) e.textContent = words;
    return e;
  }
  // A drawing in its own units (vw by vh), shown w by h.
  function svg(vw, vh, w, h) {
    return el('svg', { viewBox: '0 0 ' + vw + ' ' + vh, width: w || vw, height: h || vh, 'aria-hidden': 'true', focusable: 'false' });
  }
  function rect(s, x, y, w, h, fill, more) {
    var a = { x: x, y: y, width: w, height: h, fill: fill };
    for (var k in more || {}) a[k] = more[k];
    s.appendChild(el('rect', a));
  }

  // A Caroline's Cart, in her drawing's own strokes: the big seat in her teal.
  function cartAt(s, ox, oy, k) {
    k = k || 1;
    function P(x, y) { return (ox + x * k) + ' ' + (oy + y * k); }
    rect(s, ox + 18 * k, oy - 13 * k, 26 * k, 16 * k, 'var(--rth-register)', { rx: 4 * k });
    s.appendChild(el('path', { d: 'M' + P(0, 0) + ' h' + (12 * k) + ' L' + P(19, 33) + ' h' + (47 * k) + ' l' + (10 * k) + ' ' + (-32 * k) + ' h' + (-64 * k) + ' M' + P(19, 33) + ' l' + (3 * k) + ' ' + (12 * k) + ' M' + P(66, 33) + ' l' + (-3 * k) + ' ' + (12 * k) + ' M' + P(15, 45) + ' h' + (54 * k),
      fill: 'none', stroke: 'var(--rth-ink)', 'stroke-width': 3 * k, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }));
    s.appendChild(el('circle', { cx: ox + 20 * k, cy: oy + 49 * k, r: 4 * k, fill: 'var(--rth-ink)' }));
    s.appendChild(el('circle', { cx: ox + 64 * k, cy: oy + 49 * k, r: 4 * k, fill: 'var(--rth-ink)' }));
  }

  // HER SHOPFRONT, her drawing, with the lights low.
  function shopfront(w, h) {
    var s = svg(900, 340, w, h);
    rect(s, 80, 40, 740, 300, 'var(--rth-brick)');
    for (var y = 54, r = 0; y < 340; y += 12, r++) {
      rect(s, 80, y, 740, 1.2, 'var(--rth-ink)', { opacity: 0.12 });
      for (var x = 80 + (r % 2) * 18; x < 820; x += 36) rect(s, x, y, 1.2, 12, 'var(--rth-ink)', { opacity: 0.12 });
    }
    rect(s, 80, 40, 740, 10, 'var(--rth-ink)', { opacity: 0.85 });
    rect(s, 230, 62, 440, 58, 'var(--rth-register)', { rx: 6 });
    s.appendChild(el('text', { x: 450, y: 104, 'text-anchor': 'middle', fill: 'var(--rth-floor)', 'font-family': 'Shrikhand, Georgia, serif', 'font-size': 34 }, 'Retail Therapy'));
    s.appendChild(el('path', { d: 'M100 132 h700 l-20 40 h-660 z', fill: 'var(--rth-register)' }));
    s.appendChild(el('path', { d: 'M150 132 h50 l-6 40 h-50 z M250 132 h50 l-4 40 h-50 z M350 132 h50 l-2 40 h-50 z M450 132 h50 l0 40 h-50 z M550 132 h50 l2 40 h-50 z M650 132 h50 l4 40 h-50 z M750 132 h30 l6 40 h-30 z', fill: 'var(--rth-floor)' }));
    [120, 520].forEach(function (wx) {
      rect(s, wx, 185, 260, 140, 'var(--rth-ink)', { opacity: 0.85 });
      rect(s, wx + 8, 193, 244, 124, 'var(--rth-glass)');
    });
    var st = el('g', { fill: 'var(--rth-ink)', opacity: 0.55 });
    [[150, 270, 60, 47], [160, 255, 40, 15], [262, 250, 16, 67], [660, 260, 22, 57], [690, 240, 22, 77], [720, 275, 22, 42]].forEach(function (b) {
      st.appendChild(el('rect', { x: b[0], y: b[1], width: b[2], height: b[3] }));
    });
    st.appendChild(el('circle', { cx: 270, cy: 232, r: 18 }));
    st.appendChild(el('path', { d: 'M320 317 v-40 q15 -30 30 0 v40 z' }));
    st.appendChild(el('path', { d: 'M560 317 h70 l-8 -45 h-54 z' }));
    s.appendChild(st);
    rect(s, 405, 185, 90, 155, 'var(--rth-ink)', { opacity: 0.85 });
    rect(s, 413, 193, 74, 147, 'var(--rth-glass)');
    rect(s, 416, 215, 68, 26, 'var(--rth-tag)', { rx: 3 });
    s.appendChild(el('text', { x: 450, y: 233, 'text-anchor': 'middle', fill: 'var(--rth-tag-ink)', 'font-family': '"Atkinson Hyperlegible", sans-serif', 'font-weight': 700, 'font-size': 11, 'letter-spacing': '.04em' }, 'QUIET HRS'));
    cartAt(s, 534, 285, 1);
    return s;
  }

  // THE BENCH BY THE FOUNTAIN: a stone basin, a column, a bowl at the top,
  // the water standing still in them, and the bench in front.
  function fountain(w, h) {
    var s = svg(w, h), cx = w / 2;
    s.appendChild(el('ellipse', { cx: cx, cy: h * 0.62, rx: w * 0.46, ry: h * 0.06, fill: 'var(--rth-rule)' }));
    s.appendChild(el('ellipse', { cx: cx, cy: h * 0.62, rx: w * 0.42, ry: h * 0.045, fill: 'var(--rth-sky)' }));
    rect(s, w * 0.04, h * 0.62, w * 0.92, h * 0.16, 'var(--rth-shelf)');
    s.appendChild(el('ellipse', { cx: cx, cy: h * 0.78, rx: w * 0.46, ry: h * 0.035, fill: 'var(--rth-shelf)' }));
    rect(s, w * 0.04, h * 0.62, w * 0.92, 8, 'var(--rth-rule)');
    rect(s, cx - 18, h * 0.12, 36, h * 0.5, 'var(--rth-rule)');
    s.appendChild(el('path', { d: 'M' + (cx - w * 0.2) + ' ' + (h * 0.12) + ' Q' + cx + ' ' + (h * 0.26) + ' ' + (cx + w * 0.2) + ' ' + (h * 0.12) + ' Z', fill: 'var(--rth-shelf)' }));
    s.appendChild(el('ellipse', { cx: cx, cy: h * 0.12, rx: w * 0.2, ry: h * 0.025, fill: 'var(--rth-sky)' }));
    rect(s, cx - 8, h * 0.04, 16, h * 0.08, 'var(--rth-rule)');
    // The bench, slats of her library's wood on legs of her ink.
    var by = h * 0.8;
    [0, 1, 2].forEach(function (k) { rect(s, w * 0.12, by + k * 22 - 70, w * 0.76, 16, 'var(--rth-wood)', { rx: 3 }); });
    rect(s, w * 0.12, by + 4, w * 0.76, 18, 'var(--rth-wood)', { rx: 3 });
    [0.16, 0.8].forEach(function (f) { rect(s, w * f, by - 70, 18, h - by + 70, 'var(--rth-ink)'); });
    return s;
  }

  // THE CART CORRAL: the row that never gets shorter, nested one in another.
  function corral(w, h) {
    var s = svg(w, h), k = (h - 20) / 62;
    for (var i = 0; i < 5; i++) cartAt(s, 10 + i * 34 * k, h - 52 * k, k);
    return s;
  }

  // THE LITTLE FREE LIBRARY: a house of wood on a post, a roof of brick, and
  // her seven spines in her seven book colours.
  function library(w, h) {
    var s = svg(w, h), hx = w * 0.08, hw = w * 0.84, hy = h * 0.22, hh = h * 0.36;
    rect(s, w / 2 - 14, hy + hh, 28, h - hy - hh, 'var(--rth-wood)');
    s.appendChild(el('path', { d: 'M' + (hx - 18) + ' ' + hy + ' L' + (w / 2) + ' ' + (h * 0.02) + ' L' + (hx + hw + 18) + ' ' + hy + ' Z', fill: 'var(--rth-brick)' }));
    rect(s, hx, hy, hw, hh, 'var(--rth-wood)');
    rect(s, hx + 18, hy + 14, hw - 36, hh - 28, 'var(--rth-shelf)');
    rect(s, hx + 18, hy + hh / 2 - 4, hw - 36, 8, 'var(--rth-wood)');
    var inks = ['--rth-book-blue', '--rth-tag', '--rth-book-wine', '--rth-book-green', '--rth-book-lilac', '--rth-book-amber', '--rth-register'];
    var bw = (hw - 50) / inks.length;
    inks.forEach(function (ink, i) {
      var bh = hh / 2 - 26 - (i * 37 % 5) * 5;
      rect(s, hx + 25 + i * bw, hy + hh - 14 - bh, bw - 4, bh, 'var(' + ink + ')', { rx: 2 });
      if (i < 4) rect(s, hx + 30, hy + hh / 2 - 4 - 14 * (i + 1), hw * 0.5 - i * 10, 12, 'var(' + inks[6 - i] + ')', { rx: 2 });
    });
    return s;
  }

  // THE STORE DIRECTORY, a mall map board: her departments in her order, in
  // her tile colours, the till by the door in brick.
  function directory(w, h) {
    var s = svg(1000, 900, w, h);
    rect(s, 470, 760, 60, 140, 'var(--rth-ink)');
    rect(s, 0, 0, 1000, 760, 'var(--rth-ink)', { rx: 18 });
    s.appendChild(el('text', { x: 40, y: 96, fill: 'var(--rth-tag)', 'font-family': 'Shrikhand, Georgia, serif', 'font-size': 64 }, 'Store directory'));
    var TILES = [
      ['Cart corral', 0], ['Little free library', 1], ['Bench by the fountain', 2], ['Front window', 3], ['Registers', 0],
      ['Fitting rooms', 1], ['Access aisle', 2], ['Toy aisle', 3], ['Customer service', 0], ['Gently used corner', 1],
      ['Gift wrap counter', 2], ['Sample table', 3], ['Stockroom', 0], ['Covenstead, next door', 2], ['Stimpunks shop', 4]];
    var GROUND = ['--rth-register', '--rth-tag', '--rth-shelf', '--rth-floor', '--rth-brick'];
    var INK = ['--rth-floor', '--rth-tag-ink', '--rth-ink', '--rth-ink', '--rth-white'];
    TILES.forEach(function (t, i) {
      var tx = 40 + (i % 5) * 186, ty = 140 + Math.floor(i / 5) * 200;
      rect(s, tx, ty, 170, 180, 'var(' + GROUND[t[1]] + ')', { rx: 14 });
      s.appendChild(el('circle', { cx: tx + 40, cy: ty + 46, r: 20, fill: 'none', stroke: 'var(' + INK[t[1]] + ')', 'stroke-width': 5 }));
      var words = t[0].split(' '), lines = [], line = '';
      words.forEach(function (wd) { if ((line + ' ' + wd).trim().length > 11 && line) { lines.push(line); line = wd; } else line = (line + ' ' + wd).trim(); });
      lines.push(line);
      lines.forEach(function (ln, k) {
        s.appendChild(el('text', { x: tx + 14, y: ty + 120 - (lines.length - 1 - k) * 30, fill: 'var(' + INK[t[1]] + ')', 'font-family': '"Atkinson Hyperlegible", sans-serif', 'font-weight': 700, 'font-size': 26 }, ln));
      });
      if (i === 0) {
        rect(s, tx + 70, ty + 14, 90, 30, 'var(--rth-brick)', { rx: 15 });
        s.appendChild(el('text', { x: tx + 77, y: ty + 35, fill: 'var(--rth-white)', 'font-family': '"Atkinson Hyperlegible", sans-serif', 'font-weight': 700, 'font-size': 16 }, 'You are here'));
      }
    });
    return s;
  }

  // The arcade's side walls, her shelf's pale with her rule's lines down them.
  function side(w, h) {
    var s = svg(w, h);
    rect(s, 0, 0, w, h, 'var(--rth-shelf)');
    for (var x = 200; x < w; x += 600) rect(s, x, 0, 26, h, 'var(--rth-rule)');
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['retail-therapy.html'] = {
    prefix: 'rth-walk',
    from: 'excursions.html',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 960), sh = kit.H - 24;
      var eye = sh / 2, END = 2600 + F, SIDE = 2000;
      var FW = 2600, FH = FW * 340 / 900;
      var decor = [];

      var front = kit.item(shopfront(FW, FH), { x: 0, z: END, w: FW, h: FH });
      decor.push(front);
      [-1, 1].forEach(function (k) {
        decor.push(kit.item(side(END + 30, FH + 300), { x: k * SIDE, z: (END + 30) / 2, w: END + 30, h: FH + 300, turn: k < 0 ? kit.LEFT : kit.RIGHT }));
      });
      var cr = kit.item(corral(760, 300), { x: -1300, z: END - 500, w: 760, h: 300 });
      var fn = kit.item(fountain(620, 480), { x: 0, z: END - 900, w: 620, h: 480 });
      var lib = kit.item(library(360, 700), { x: 1300, z: END - 700, w: 360, h: 700 });
      var dir = kit.item(directory(640, 576), { x: -1350, z: END - 1000, w: 640, h: 576 });
      decor.push(cr, fn, lib, dir);
      var page = kit.screen(kit.page, 'Retail Therapy’s own page, on a board in the forecourt');
      var board = kit.item(page, { x: SIDE - 20, z: END - 1600, w: sw, h: sh, cls: 'rth-walk-board', turn: kit.RIGHT });

      var stops = [
        kit.stop({ name: 'in the forecourt, her shopfront at the far end and the fountain in the middle', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'on the bench by the fountain, the best seat in the house', spot: kit.front(fn, 1300) }, fn),
        kit.stop({ name: 'at the shop door, QUIET HRS on its yellow sign and a Caroline’s Cart parked by it', spot: { x: 0, z: END - F * 1.7 } }, front),
        kit.stop({ name: 'at the cart corral, the row of Caroline’s Carts that never gets shorter', spot: kit.front(cr, 1100) }, cr),
        kit.stop({ name: 'at the little free library: take a book, leave a book', spot: kit.front(lib, 1000) }, lib),
        kit.stop({ name: 'at the store directory, a mall map board', spot: kit.front(dir, 1100) }, dir),
        kit.stop({ name: 'at the board on the right wall, with her shop’s own page', spot: kit.front(board), link: page }, board)
      ];
      return {
        cls: 'rth-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The lights are low and the music is off. Her shopfront is at the far end, the bench by the fountain in the middle, and her page on a board on the right.',
        bounds: function () { return { x: [-SIDE + 300, SIDE - 300], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--rth-floor'));
          var grout = kit.ink('--rth-rule'), z0 = Math.max(from, 0), z1 = Math.min(to, END + 30);
          for (var z = Math.ceil(z0 / 240) * 240; z < z1; z += 240) kit.quad(g, -SIDE, SIDE, z, z + 5, grout);
          for (var x = -SIDE; x <= SIDE; x += 240) kit.quad(g, x, x + 5, z0, z1, grout);
        }
      };
    }
  };
})();

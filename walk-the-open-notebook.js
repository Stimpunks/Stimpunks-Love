/* =============================================================================
   The Open Notebook, walked into on Paper Street. Ryan's ask, 2026-11-04: round
   1 of the rooms still to be walked into.

   IT IS THE OPEN NOTEBOOK'S WORLD AND NOBODY ELSE'S (§91): a room with one
   window in the back wall and a desk under it, a notebook lying open on the
   desk at ONE PAGE, a dot grid under the writing, and the laptop beside it.
   THE LIGHT IS EVERY HOUR AT ONCE: the window's patch of sun has crossed the
   floor at every hour since first light, and the floor has kept all of them
   side by side, the long blue one thrown in from the left at dawn, the square
   nearly white one at noon, the long rose one from the right at dusk. Nothing
   travels across the floor at any setting; it is drawn, not lived.

   THE ZIBALDONE IS THE ONE TO WATCH: bound leaves with a gutter and a fold, one
   lamp at desk height on the left, other people's words. Here the notebook is
   one page with no fold, there is no lamp at all, and the light is the
   window's, at every hour. The tape is laid straight, and nothing in the room
   is cut or turned, which keeps it off the Zine Table.

   THE ROOM'S OWN PAGE, with Ryan's piece in it in full, is taped up on the back
   wall beside the window with washi across its corners, laid straight.

   NOTHING MOVES. Every colour is one the room declares, by name. It keeps
   nothing, sends nothing and fetches nothing; its page arrives through Paper
   Street's screen(). tools/make-paper-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var HOURS = ['--onb-dawn', '--onb-morning', '--onb-noon', '--onb-afternoon', '--onb-dusk'];
  var WASHI = ['--onb-washi-sage', '--onb-washi-blush', '--onb-washi-butter', '--onb-washi-sky'];

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }

  // The back wall: plain paper-pale plaster and the one window, its sky going
  // from dawn on the left pane to dusk on the right.
  function backWall(w, h, wx, ww, wh) {
    var s = svg(w, h), x0 = w / 2 + wx - ww / 2, top = h - wh - 420;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--onb-card)' }));
    s.appendChild(el('rect', { x: x0 - 24, y: top - 24, width: ww + 48, height: wh + 48, fill: 'var(--onb-dim)' }));
    HOURS.forEach(function (c, i) {
      s.appendChild(el('rect', { x: x0 + i * ww / HOURS.length, y: top, width: ww / HOURS.length + 1, height: wh, fill: 'var(' + c + ')' }));
    });
    s.appendChild(el('rect', { x: x0 + ww / 2 - 6, y: top, width: 12, height: wh, fill: 'var(--onb-dim)' }));
    s.appendChild(el('rect', { x: x0, y: top + wh / 2 - 6, width: ww, height: 12, fill: 'var(--onb-dim)' }));
    s.appendChild(el('rect', { x: x0 - 40, y: top + wh + 24, width: ww + 80, height: 22, fill: 'var(--onb-shade)' }));
    return s;
  }

  // The desk under the window, with the notebook open on it at one page (a dot
  // grid, the day's hours kept on it, lines of shorthand, the pen) and the
  // laptop beside it, shut.
  function desk(w, h) {
    var s = svg(w, h), top = 150;
    var nx = w * 0.12, nw = w * 0.46, nh = 120;
    s.appendChild(el('rect', { x: nx, y: top - nh, width: nw, height: nh, fill: 'var(--onb-page)', stroke: 'var(--onb-dim)', 'stroke-width': 3 }));
    for (var dx = nx + 14; dx < nx + nw - 8; dx += 18) {
      for (var dy = top - nh + 14; dy < top - 6; dy += 18) s.appendChild(el('circle', { cx: dx, cy: dy, r: 2, fill: 'var(--onb-dot)' }));
    }
    HOURS.forEach(function (c, i) {
      s.appendChild(el('rect', { x: nx + 16 + i * (nw - 32) / 5, y: top - nh + 20, width: (nw - 32) / 5 - 6, height: 30, fill: 'var(' + c + ')' }));
    });
    [64, 84, 104].forEach(function (y, i) { s.appendChild(el('rect', { x: nx + 20, y: top - nh + y, width: nw * (0.7 - i * 0.15), height: 4, fill: 'var(--onb-ink)' })); });
    s.appendChild(el('rect', { x: nx + nw - 40, y: top - 40, width: 10, height: 70, fill: 'var(--onb-pen)' }));
    s.appendChild(el('rect', { x: w * 0.64, y: top - 26, width: w * 0.26, height: 26, rx: 4, fill: 'var(--onb-laptop)' }));
    s.appendChild(el('rect', { x: 0, y: top, width: w, height: 28, fill: 'var(--onb-shade)' }));
    s.appendChild(el('rect', { x: 0, y: top + 28, width: w, height: 6, fill: 'var(--onb-dim)' }));
    s.appendChild(el('rect', { x: 30, y: top + 34, width: 24, height: h - top - 34, fill: 'var(--onb-dim)' }));
    s.appendChild(el('rect', { x: w - 54, y: top + 34, width: 24, height: h - top - 34, fill: 'var(--onb-dim)' }));
    return s;
  }

  // A strip of washi tape, laid straight across a corner.
  function tape(w, h, ink) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(' + ink + ')', 'fill-opacity': '0.88' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['the-open-notebook.html'] = {
    prefix: 'onb-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 900), sh = kit.H - 24;
      var END = 2200 + F;                      // the back wall
      var PAGE_X = -sw / 2 - 60, WIN_X = 560, WIN_W = 760, WIN_H = 560;
      var eye = sh / 2 + 60;
      var decor = [];

      var WW = 3600, WH = Math.max(1500, sh + 700);
      decor.push(kit.item(backWall(WW, WH, WIN_X, WIN_W, WIN_H), { x: 0, z: END + 20, w: WW, h: WH }));
      var table = kit.item(desk(900, 420), { x: WIN_X, z: END - 260, w: 900, h: 420 });
      decor.push(table);

      var page = kit.screen(kit.page, 'The Open Notebook’s own page, taped up on the wall beside the window');
      var wall = kit.item(page, { x: PAGE_X, z: END, w: sw, h: sh, y: 60, cls: 'onb-walk-wall' });
      // Washi across the page's four corners, laid straight, each its own colour.
      [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(function (c, i) {
        decor.push(kit.item(tape(150, 40, WASHI[i]), { x: PAGE_X + c[0] * sw / 2, z: END - 8, w: 150, h: 40, y: c[1] > 0 ? 60 + sh - 20 : 40 }));
      });

      var stops = [
        kit.stop({ name: 'in the doorway, the window and the desk ahead', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'in the middle of the floor, standing in the day’s hours of light', spot: { x: WIN_X * 0.5, z: END - F * 2.2 } }),
        kit.stop({ name: 'at the desk under the window, the notebook open at one page', spot: kit.front(table, 900) }, table),
        kit.stop({ name: 'at the wall beside the window, with the room’s own page taped up on it', spot: { x: PAGE_X, z: END - F }, link: page }, wall)
      ];

      return {
        cls: 'onb-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The window has lit the floor at every hour of the day. The room’s own page is taped up beside it.',
        bounds: function () { return { x: [PAGE_X - 100, WIN_X + 200], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--onb-shade'));
          var z = END - F * 1.4;
          // The hours on the floor, side by side as the page keeps them: long
          // and blue from the left at dawn, square at noon, long and rose from
          // the right at dusk.
          kit.quad(g, WIN_X - 900, WIN_X - 300, z - 160, z + 160, kit.ink('--onb-dawn'));
          kit.quad(g, WIN_X - 300, WIN_X - 60, z - 200, z + 160, kit.ink('--onb-morning'));
          kit.quad(g, WIN_X - 40, WIN_X + 280, z - 300, z + 160, kit.ink('--onb-noon'));
          kit.quad(g, WIN_X + 300, WIN_X + 560, z - 200, z + 160, kit.ink('--onb-afternoon'));
          kit.quad(g, WIN_X + 580, WIN_X + 1200, z - 160, z + 160, kit.ink('--onb-dusk'));
        }
      };
    }
  };
})();

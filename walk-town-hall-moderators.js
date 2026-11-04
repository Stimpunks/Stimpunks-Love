/* =============================================================================
   The Moderators' room, walked into on Paper Street. Ryan's ask, 2026-11-04:
   round 1 of the rooms still to be walked into. On Cel Street it opens off the
   Town Hall; here it is reached by its address or the teleporter for now.

   IT IS THE MODERATORS' ROOM'S WORLD AND NOBODY ELSE'S (§81): a room above the
   street at night, LIT BY THE STREET. There is no lamp. The shopfronts below
   throw their own colours up through the one window, and they land on the
   ceiling and the top of the walls as bands side by side, none of them mixed
   into the next, with the window's bars dark between them. The room that looks
   after the street is lit by the street, every room on it at once.

   THE REPEATER IS THE ONE TO WATCH: skyglow, every light on the road blended
   into one warm grey. Here every colour stays its own; if the bands ever blur
   into one, it has become the Repeater with a roof. The radio on the desk is
   OFF, and dark, and nothing in the room glows. The room's own page hangs on
   the wall beside the window.

   NOTHING MOVES AT ANY SETTING. Every colour is one the room declares, by name.
   It keeps nothing, sends nothing and fetches nothing; its page arrives through
   Paper Street's screen(). tools/make-paper-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var STREET = ['--md-pink', '--md-gold', '--md-green', '--md-blue', '--md-violet'];

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }

  // The street's colours thrown up onto the top of a wall: bands side by side,
  // each its own colour, the window's bars dark between them, none mixed.
  function bands(s, x0, w, y, h) {
    var bw = w / STREET.length;
    STREET.forEach(function (c, i) {
      s.appendChild(el('rect', { x: x0 + i * bw, y: y, width: bw, height: h, fill: 'var(' + c + ')', 'fill-opacity': '0.55' }));
      s.appendChild(el('rect', { x: x0 + i * bw - 6, y: y, width: 12, height: h, fill: 'var(--md-dark)' }));
    });
  }

  // The end wall: dark, the bands across its top, and the one window, through
  // which the street's lit fronts are small squares of their own colours.
  function endWall(w, h, wx, ww, wh) {
    var s = svg(w, h), x0 = w / 2 + wx - ww / 2, top = 210;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--md-dark)' }));
    bands(s, 0, w, 0, 180);
    s.appendChild(el('rect', { x: x0 - 20, y: top - 20, width: ww + 40, height: wh + 40, fill: 'var(--md-frame)' }));
    s.appendChild(el('rect', { x: x0, y: top, width: ww, height: wh, fill: 'var(--md-glass)' }));
    for (var i = 0; i < 10; i++) {
      s.appendChild(el('rect', { x: x0 + 20 + i * (ww - 40) / 10, y: top + wh * 0.62, width: (ww - 40) / 10 - 8, height: wh * 0.3, fill: 'var(' + STREET[i % STREET.length] + ')', 'fill-opacity': '0.8' }));
    }
    [1, 2].forEach(function (k) { s.appendChild(el('rect', { x: x0 + k * ww / 3 - 6, y: top, width: 12, height: wh, fill: 'var(--md-frame)' })); });
    s.appendChild(el('rect', { x: x0, y: top + wh / 2 - 6, width: ww, height: 12, fill: 'var(--md-frame)' }));
    return s;
  }

  // A side wall, the bands along its top.
  function sideWall(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--md-dark)' }));
    bands(s, 0, w, 0, 120);
    return s;
  }

  // The desk, and the radio on it, off: its display dark.
  function desk(w, h) {
    var s = svg(w, h), top = 170;
    s.appendChild(el('rect', { x: w * 0.3, y: 30, width: w * 0.4, height: top - 30, rx: 10, fill: 'var(--md-panel)' }));
    s.appendChild(el('rect', { x: w * 0.34, y: 50, width: w * 0.2, height: 50, rx: 4, fill: 'var(--md-glass)' }));
    s.appendChild(el('circle', { cx: w * 0.62, cy: 80, r: 22, fill: 'var(--md-frame)' }));
    s.appendChild(el('rect', { x: w * 0.6, y: 0, width: 6, height: 40, fill: 'var(--md-frame)' }));
    s.appendChild(el('rect', { x: 0, y: top, width: w, height: 30, fill: 'var(--md-frame)' }));
    s.appendChild(el('rect', { x: 20, y: top + 30, width: 30, height: h - top - 30, fill: 'var(--md-panel)' }));
    s.appendChild(el('rect', { x: w - 50, y: top + 30, width: 30, height: h - top - 30, fill: 'var(--md-panel)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['town-hall-moderators.html'] = {
    prefix: 'md-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 880), sh = kit.H - 24;
      var END = 2000 + F;                      // the end wall and its window
      var SIDE = 1000, WIN_X = 560, PAGE_X = -sw / 2 - 40;
      var eye = sh / 2 + 40, WH = sh + 420;
      var decor = [];

      decor.push(kit.item(endWall(SIDE * 2 + 40, WH, WIN_X, 520, 460), { x: 0, z: END + 20, w: SIDE * 2 + 40, h: WH }));
      [-1, 1].forEach(function (side) {
        decor.push(kit.item(sideWall(END, WH), { x: side * SIDE, z: END / 2, w: END, h: WH, turn: side < 0 ? kit.LEFT : kit.RIGHT }));
      });
      var radio = kit.item(desk(640, 380), { x: WIN_X, z: END - 500, w: 640, h: 380 });
      decor.push(radio);

      var page = kit.screen(kit.page, 'The Moderators’ room’s own page, on the wall beside the window');
      var wall = kit.item(page, { x: PAGE_X, z: END, w: sw, h: sh, y: 40, cls: 'md-walk-wall' });

      var stops = [
        kit.stop({ name: 'inside the door, the street’s colours on the ceiling in bands', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the desk under the window, the radio on it off and dark', spot: kit.front(radio, 900) }, radio),
        kit.stop({ name: 'at the wall beside the window, with the room’s own page on it', spot: { x: PAGE_X, z: END - F }, link: page }, wall)
      ];

      return {
        cls: 'md-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'There is no lamp: the street lights the room through the one window. The room’s own page is on the wall beside it.',
        bounds: function () { return { x: [-SIDE + 200, SIDE - 200], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--md-dark'));
          var board = kit.ink('--md-panel');
          for (var x = -SIDE; x < SIDE; x += 140) kit.quad(g, x, x + 4, Math.max(from, 0), Math.min(to, END), board, 0.8);
        }
      };
    }
  };
})();

/* =============================================================================
   The MUD Room, walked into on Paper Street. Ryan's ask, 2026-11-04: round 1 of
   the rooms still to be walked into.

   IT IS THE MUD ROOM'S WORLD AND NOBODY ELSE'S (§70): a narrow boot room at the
   back of the shop, a bench along one wall with coats on pegs over it and
   boots under it, the yellow wellies by the back door, and the back door
   standing open on the Slake: the marsh, then the mud, then the channels lying
   in the mud and holding the sky, out to the island with its striped mark and
   the horizon. The longest view on the street, through one door.

   THE LIGHT IS THE SKY LYING IN THE MUD: overcast, from everywhere, no sun and
   no shadow, and the brightest thing below the horizon is the water, because
   the water is holding the sky. The greys are olive, never slate, nothing
   glows, and the only warm value is the yellow of one pair of wellies.

   THE GAME IS THE PAGE'S. mud.js talks to the CB, so it is not run here: the
   Slake is played on the room's own page, which hangs on the boot room's back
   wall beside the open door. Nobody to fight, nothing counted.

   NOTHING MOVES: the tide does not turn here, and out there it is out. Every
   colour is one the room declares, by name. It keeps nothing, sends nothing
   and fetches nothing; its page arrives through Paper Street's screen().
   tools/make-paper-street.py holds each of those.
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

  // The Slake, seen through the open door: sky, horizon, the island and its
  // mark, channels holding the sky, the mud, the marsh, the sea wall.
  function slake(s, x, y, w, h) {
    s.appendChild(el('rect', { x: x, y: y, width: w, height: h * 0.42, fill: 'var(--mud-sky)' }));
    s.appendChild(el('rect', { x: x, y: y + h * 0.42, width: w, height: h * 0.58, fill: 'var(--mud-ground)' }));
    s.appendChild(el('path', { d: 'M' + (x + w * 0.55) + ' ' + (y + h * 0.42) + ' q' + (w * 0.12) + ' -30 ' + (w * 0.26) + ' 0 Z', fill: 'var(--mud-land)' }));
    for (var i = 0; i < 4; i++) {
      s.appendChild(el('rect', { x: x + w * 0.66, y: y + h * 0.42 - 70 + i * 14, width: 10, height: 14, fill: i % 2 ? 'var(--mud-deep)' : 'var(--mud-text)' }));
    }
    [[0.47, 0.9, 6], [0.55, 0.6, 10], [0.66, 0.75, 16], [0.8, 0.5, 24]].forEach(function (c) {
      s.appendChild(el('ellipse', { cx: x + w * (0.5 + (c[0] - 0.6) * 0.6), cy: y + h * c[0], rx: w * c[1] * 0.5, ry: c[2], fill: 'var(--mud-silver)' }));
    });
    s.appendChild(el('rect', { x: x, y: y + h * 0.86, width: w, height: h * 0.14, fill: 'var(--mud-marsh-dk)' }));
    for (var r = 0; r < 16; r++) s.appendChild(el('rect', { x: x + 10 + r * w / 16, y: y + h * 0.8, width: 4, height: h * 0.1, fill: 'var(--mud-reed)' }));
  }

  // The boot room's back wall: boards, the page's place, the open back door.
  function backWall(w, h, sw, sh, door) {
    var s = svg(w, h), m = w / 2;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--mud-bank)' }));
    for (var x = 0; x < w; x += 60) s.appendChild(el('rect', { x: x, y: 0, width: 3, height: h, fill: 'var(--mud-deep)' }));
    var dw = 520, dh = Math.min(h - 40, sh + 260), dx = door + m - dw / 2;
    s.appendChild(el('rect', { x: dx - 26, y: h - dh - 26, width: dw + 52, height: dh + 26, fill: 'var(--mud-deep)' }));
    slake(s, dx, h - dh, dw, dh);
    return s;
  }

  // The bench along the wall: coats on pegs above, boots in a row under it.
  function bench(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 30, width: w, height: 16, fill: 'var(--mud-deep)' }));
    var coats = ['--mud-high', '--mud-marsh-dk', '--mud-dim', '--mud-high', '--mud-marsh'];
    coats.forEach(function (c, i) {
      var cx = 120 + i * (w - 240) / (coats.length - 1);
      s.appendChild(el('circle', { cx: cx, cy: 38, r: 9, fill: 'var(--mud-silver)' }));
      s.appendChild(el('path', { d: 'M' + (cx - 20) + ' 50 h40 l30 300 h-100 Z', fill: 'var(' + c + ')' }));
    });
    var seat = h - 230;
    s.appendChild(el('rect', { x: 0, y: seat, width: w, height: 30, fill: 'var(--mud-high)' }));
    s.appendChild(el('rect', { x: 20, y: seat + 30, width: 20, height: h - seat - 30, fill: 'var(--mud-deep)' }));
    s.appendChild(el('rect', { x: w - 40, y: seat + 30, width: 20, height: h - seat - 30, fill: 'var(--mud-deep)' }));
    for (var b = 0; b < 6; b++) {
      var bx = 90 + b * (w - 180) / 5;
      s.appendChild(el('path', { d: 'M' + bx + ' ' + (h - 130) + ' h40 v100 h30 v30 h-70 Z', fill: 'var(--mud-deep)' }));
      s.appendChild(el('path', { d: 'M' + bx + ' ' + (h - 40) + ' h70 v10 h-70 Z', fill: 'var(--mud-ground)' }));
    }
    return s;
  }

  // The yellow wellies by the back door: the one warm thing in the room.
  function wellies(w, h) {
    var s = svg(w, h);
    [0, 1].forEach(function (i) {
      var x = 20 + i * (w / 2);
      s.appendChild(el('rect', { x: x, y: 0, width: 58, height: h - 20, rx: 10, fill: 'var(--mud-welly)' }));
      s.appendChild(el('ellipse', { cx: x + 52, cy: h - 34, rx: 52, ry: 30, fill: 'var(--mud-welly)' }));
      s.appendChild(el('rect', { x: x - 4, y: 0, width: 66, height: 12, rx: 4, fill: 'var(--mud-welly)' }));
      s.appendChild(el('rect', { x: x - 4, y: h - 16, width: 112, height: 16, rx: 6, fill: 'var(--mud-ground)' }));
    });
    return s;
  }

  // A side wall of the boot room: the same boards as the back wall.
  function sideWall(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--mud-bank)' }));
    for (var x = 0; x < w; x += 60) s.appendChild(el('rect', { x: x, y: 0, width: 3, height: h, fill: 'var(--mud-deep)' }));
    return s;
  }

  // The noticeboard's card, in capitals: a card pinned up, the words the page's.
  function notice(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--mud-deep)' }));
    s.appendChild(el('rect', { x: 30, y: 30, width: w - 60, height: h - 60, fill: 'var(--mud-sky)' }));
    for (var y = 70; y < h - 60; y += 44) s.appendChild(el('rect', { x: 60, y: y, width: w - 120 - (y % 3) * 30, height: 16, fill: 'var(--mud-ground)' }));
    s.appendChild(el('circle', { cx: w / 2, cy: 30, r: 10, fill: 'var(--mud-welly)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['the-mud-room.html'] = {
    prefix: 'mud-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 900), sh = kit.H - 24;
      var END = 2300 + F;                      // the back wall, its page and its open door
      var NARROW = 950;                        // from the middle to each side wall
      var PAGE_X = -300, DOOR_X = sw / 2 - 300 + 360;
      var eye = sh / 2 + 40;
      var decor = [];

      var WW = 3200, WH = Math.max(1500, sh + 600);
      decor.push(kit.item(backWall(WW, WH, sw, sh, DOOR_X), { x: 0, z: END + 20, w: WW, h: WH }));
      [-1, 1].forEach(function (side) {
        decor.push(kit.item(sideWall(END, WH), { x: side * (NARROW + 20), z: END / 2, w: END, h: WH, turn: side < 0 ? kit.LEFT : kit.RIGHT }));
      });
      var bootBench = kit.item(bench(1400, 760), { x: -NARROW, z: 1200, w: 1400, h: 760, turn: kit.LEFT });
      decor.push(bootBench);
      var card = kit.item(notice(380, 300), { x: NARROW, z: 1000, w: 380, h: 300, y: 240, turn: kit.RIGHT });
      decor.push(card);
      decor.push(kit.item(wellies(170, 160), { x: DOOR_X - 180, z: END - 120, w: 170, h: 160 }));

      var page = kit.screen(kit.page, 'The MUD Room’s own page, on the boot room’s back wall');
      var wall = kit.item(page, { x: PAGE_X, z: END, w: sw, h: sh, y: 40, cls: 'mud-walk-wall' });

      var stops = [
        kit.stop({ name: 'inside the boot room, the back door open at the end of it', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the bench, under the coats, the boots in a row', spot: kit.front(bootBench, 900) }, bootBench),
        kit.stop({ name: 'at the noticeboard’s card, in capitals', spot: kit.front(card, 700) }, card),
        kit.stop({ name: 'at the back wall, with the room’s own page on it and the Slake through the door beside it', spot: { x: PAGE_X, z: END - F }, link: page }, wall)
      ];

      return {
        cls: 'mud-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The back door stands open on the Slake. The room’s own page, where the game is played, is on the wall beside it.',
        bounds: function () { return { x: [-NARROW + 200, NARROW - 160], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--mud-deep'));
          kit.quad(g, -NARROW, NARROW, Math.max(from, 0), Math.min(to, END + 30), kit.ink('--mud-ground'));
          // A runner of matting down the middle, and the mud walked in on it.
          kit.quad(g, -180, 180, Math.max(from, 0), Math.min(to, END), kit.ink('--mud-bank'));
          [[60, 400], [-90, 900], [40, 1500], [-30, 2100]].forEach(function (p) {
            kit.oval(g, p[0], p[1], 40, 18, kit.ink('--mud-land'), 1);
          });
          // The sky, lying in the wet on the floor in front of the open door.
          kit.oval(g, DOOR_X, END - 100, 300, 120, kit.ink('--mud-silver'), 0.25);
        }
      };
    }
  };
})();

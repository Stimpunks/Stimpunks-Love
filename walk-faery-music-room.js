/* =============================================================================
   The Music Room, walked into on Paper Street. Ryan's ask, 2026-11-04: round 1
   of the rooms left on Paper Street.

   IT IS HELEN EDGAR'S ROOM AND HER WORLD (§115), and this is OURS: a drawing of
   her music room in card for Paper Street, in the colours her room wears (the
   Reading Room's, §114, at her ask) and nothing else, which changes nothing on
   her page and is hers to keep or send back. The Reading Room's house one door
   along, kept off it by the LIGHT: there is no fire here, only candles on two
   standing candelabra, and the tall pointed window at the end is open on the
   night, a crescent moon and bare branches in it, so the room is darkest at
   the ceiling and at the window and nothing on the floor is warm but a
   candle's width round each stand. The phonograph stands in front of the
   window with a chair in the dark facing it; her record case stands in its
   arch on the left-hand wall, the sleeves in it; her page hangs on the right.

   NOTHING MOVES: the record does not turn, the candles stand still. Every
   colour is one her room declares, by name. It keeps nothing, sends nothing
   and fetches nothing; her page arrives through Paper Street's screen().
   tools/make-paper-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var SLEEVES = ['--rdr-velvet', '--rdr-leather', '--rdr-ink-2', '--rdr-brass', '--rdr-timber', '--tallow'];

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }
  function pointed(x, w, h, top) {
    var mid = x + w / 2, spring = top + w * 0.7;
    return 'M' + x + ' ' + h + ' V' + spring + ' Q' + x + ' ' + (top + w * 0.15) + ' ' + mid + ' ' + top +
      ' Q' + (x + w) + ' ' + (top + w * 0.15) + ' ' + (x + w) + ' ' + spring + ' V' + h + ' Z';
  }

  // The far wall with the tall pointed window open on the night: a crescent
  // moon and bare branches.
  function windowWall(w, h) {
    var s = svg(w, h), ww = 520, wx = (w - ww) / 2, top = h * 0.08, bot = h * 0.8;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--rdr-wall)' }));
    s.appendChild(el('path', { fill: 'var(--rdr-timber)', d: pointed(wx - 26, ww + 52, bot + 26, top - 26) }));
    s.appendChild(el('path', { fill: 'var(--rdr-stone)', d: pointed(wx, ww, bot, top) }));
    var mx = wx + ww * 0.68, my = top + ww * 0.55;
    s.appendChild(el('circle', { cx: mx, cy: my, r: 48, fill: 'var(--tallow)' }));
    s.appendChild(el('circle', { cx: mx + 22, cy: my - 14, r: 44, fill: 'var(--rdr-stone)' }));
    [['M', wx, bot - 80, wx + ww * 0.4, bot - 260, wx + ww * 0.3, top + ww * 0.9],
     ['M', wx + ww, bot - 140, wx + ww * 0.6, bot - 320, wx + ww * 0.75, bot - 470],
     ['M', wx + ww * 0.4, bot - 260, wx + ww * 0.55, bot - 380, wx + ww * 0.5, bot - 520]].forEach(function (b) {
      s.appendChild(el('path', { fill: 'none', stroke: 'var(--rdr-timber)', 'stroke-width': 10, 'stroke-linecap': 'round',
        d: 'M' + b[1] + ' ' + b[2] + ' Q' + b[3] + ' ' + b[4] + ' ' + b[5] + ' ' + b[6] }));
    });
    s.appendChild(el('rect', { x: wx - 40, y: bot, width: ww + 80, height: 24, fill: 'var(--rdr-timber)' }));
    return s;
  }

  // A side wall, claret, darkest at the ceiling, a dado of timber.
  function plainWall(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--rdr-stone)' }));
    s.appendChild(el('rect', { x: 0, y: h * 0.25, width: w, height: h * 0.75, fill: 'var(--rdr-wall)' }));
    s.appendChild(el('rect', { x: 0, y: h * 0.7, width: w, height: 14, fill: 'var(--rdr-timber)' }));
    s.appendChild(el('rect', { x: 0, y: h - 30, width: w, height: 30, fill: 'var(--rdr-timber)' }));
    return s;
  }

  // A standing candelabrum: a brass stem and five candles, still.
  function candelabrum(w, h) {
    var s = svg(w, h), cx = w / 2, top = 110;
    s.appendChild(el('rect', { x: cx - 8, y: top + 40, width: 16, height: h - top - 60, fill: 'var(--rdr-brass)' }));
    s.appendChild(el('rect', { x: cx - 50, y: h - 24, width: 100, height: 24, rx: 8, fill: 'var(--rdr-brass)' }));
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--rdr-brass)', 'stroke-width': 10,
      d: 'M' + (cx - w * 0.4) + ' ' + top + ' Q' + (cx - w * 0.4) + ' ' + (top + 60) + ' ' + cx + ' ' + (top + 60) +
         ' Q' + (cx + w * 0.4) + ' ' + (top + 60) + ' ' + (cx + w * 0.4) + ' ' + top }));
    [-0.4, -0.2, 0, 0.2, 0.4].forEach(function (k) {
      var x = cx + k * w, y = k === 0 ? top - 30 : top + (Math.abs(k) < 0.3 ? 14 : 0);
      s.appendChild(el('rect', { x: x - 7, y: y - 40, width: 14, height: 40, fill: 'var(--tallow)' }));
      s.appendChild(el('circle', { cx: x, cy: y - 56, r: 20, fill: 'var(--rdr-flame-2)', 'fill-opacity': '0.18' }));
      s.appendChild(el('ellipse', { cx: x, cy: y - 54, rx: 6, ry: 11, fill: 'var(--rdr-flame-2)' }));
    });
    return s;
  }

  // The phonograph on its cabinet, the horn up towards the window.
  function phonograph(w, h) {
    var s = svg(w, h), cy = h * 0.55;
    s.appendChild(el('rect', { x: w * 0.15, y: cy, width: w * 0.7, height: h - cy, rx: 8, fill: 'var(--rdr-timber)' }));
    s.appendChild(el('rect', { x: w * 0.2, y: cy + 30, width: w * 0.6, height: (h - cy) * 0.5, rx: 6, fill: 'var(--rdr-wall)' }));
    s.appendChild(el('rect', { x: w * 0.18, y: cy - 30, width: w * 0.64, height: 34, rx: 6, fill: 'var(--rdr-leather)' }));
    s.appendChild(el('ellipse', { cx: w * 0.45, cy: cy - 32, rx: w * 0.24, ry: 10, fill: 'var(--rdr-stone)' }));
    s.appendChild(el('path', { fill: 'var(--rdr-brass)',
      d: 'M' + (w * 0.62) + ' ' + (cy - 36) + ' Q' + (w * 0.66) + ' ' + (h * 0.3) + ' ' + (w * 0.4) + ' ' + (h * 0.08) +
         ' Q' + (w * 0.62) + ' 0 ' + (w * 0.98) + ' ' + (h * 0.06) + ' Q' + (w * 0.74) + ' ' + (h * 0.28) + ' ' + (w * 0.7) + ' ' + (cy - 36) + ' Z' }));
    return s;
  }

  // A chair in the dark facing the phonograph, its back to you.
  function chair(w, h) {
    var s = svg(w, h);
    s.appendChild(el('path', { fill: 'var(--rdr-velvet)', d: 'M' + w * 0.1 + ' ' + h * 0.7 + ' V' + h * 0.2 + ' Q' + w / 2 + ' -' + h * 0.06 + ' ' + w * 0.9 + ' ' + h * 0.2 + ' V' + h * 0.7 + ' Z' }));
    s.appendChild(el('rect', { x: 0, y: h * 0.5, width: w, height: h * 0.26, rx: 20, fill: 'var(--rdr-leather)' }));
    [0.12, 0.88].forEach(function (k) { s.appendChild(el('rect', { x: w * k - 8, y: h * 0.76, width: 16, height: h * 0.24, fill: 'var(--rdr-timber)' })); });
    return s;
  }

  // The record case in its arch, the sleeves standing in it.
  function recordCase(w, h) {
    var s = svg(w, h), n = 0, top = h * 0.12;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--rdr-wall)' }));
    s.appendChild(el('path', { fill: 'var(--rdr-timber)', d: pointed(w * 0.1 - 20, w * 0.8 + 40, h, top - 20) }));
    s.appendChild(el('path', { fill: 'var(--rdr-stone)', d: pointed(w * 0.1, w * 0.8, h, top) }));
    for (var y = top + w * 0.6; y + 150 < h; y += 170) {
      for (var x = w * 0.1 + 10; x < w * 0.9 - 14; x += 14, n++) {
        s.appendChild(el('rect', { x: x, y: y, width: 11, height: 150, fill: 'var(' + SLEEVES[n % SLEEVES.length] + ')' }));
      }
      s.appendChild(el('rect', { x: w * 0.1, y: y + 150, width: w * 0.8, height: 12, fill: 'var(--rdr-timber)' }));
    }
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['faery-music-room.html'] = {
    prefix: 'mus-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 940), sh = kit.H - 24;
      var END = 2300 + F;                          // the window wall
      var eye = sh / 2;
      var SIDE = 900, WH = Math.max(1100, sh + 500);
      var decor = [];

      decor.push(kit.item(windowWall(SIDE * 2 + 40, WH), { x: 0, z: END + 20, w: SIDE * 2 + 40, h: WH }));
      [-1, 1].forEach(function (side) {
        decor.push(kit.item(plainWall(END + 400, WH), { x: side * SIDE, z: (END - 400) / 2, w: END + 400, h: WH,
          turn: side < 0 ? kit.LEFT : kit.RIGHT, near: 0.3 }));
      });
      var phono = kit.item(phonograph(420, 520), { x: 0, z: END - 300, w: 420, h: 520 });
      decor.push(phono);
      decor.push(kit.item(chair(260, 300), { x: -260, z: END - 1000, w: 260, h: 300 }));
      [-1, 1].forEach(function (side) {
        decor.push(kit.item(candelabrum(260, 760), { x: side * 520, z: END - 520, w: 260, h: 760 }));
      });
      var records = kit.item(recordCase(900, WH * 0.85), { x: -SIDE + 6, z: 1300, w: 900, h: WH * 0.85, turn: kit.LEFT });
      decor.push(records);

      var page = kit.screen(kit.page, 'Helen’s Music Room’s own page, on the right-hand wall');
      var leaf = kit.item(page, { x: SIDE - 8, z: 1300, w: sw, h: sh, turn: kit.RIGHT, cls: 'mus-walk-wall' });

      var stops = [
        kit.stop({ name: 'through the door by the phonograph, the window ahead open on the night', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at her record case, the sleeves standing in it', spot: kit.front(records, F * 1.2) }, records),
        kit.stop({ name: 'at the phonograph in front of the window, between the candles', spot: { x: 0, z: END - 300 - F * 0.9 } }, phono),
        kit.stop({ name: 'at the right-hand wall, with her own page on it', spot: kit.front(leaf), link: page }, leaf)
      ];

      return {
        cls: 'mus-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Her own page hangs on the right-hand wall; the phonograph stands at the window at the end.',
        bounds: function () { return { x: [-SIDE + 300, SIDE - 300], z: [0, END - 700] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--rdr-stone'));
          kit.quad(g, -SIDE, SIDE, Math.max(from, -400), Math.min(to, END), kit.ink('--rdr-timber'));
          var seam = kit.ink('--rdr-stone');
          for (var z = Math.max(-400, Math.ceil(from / 120) * 120); z < Math.min(to, END); z += 120) kit.quad(g, -SIDE, SIDE, z, z + 4, seam, 0.6);
          // A candle's width of light round each stand, and nothing more.
          [-1, 1].forEach(function (side) { kit.oval(g, side * 520, END - 520, 260, 200, kit.ink('--rdr-flame-2'), 0.10); });
          kit.quad(g, -420, 200, END - 1250, END - 650, kit.ink('--rdr-velvet'), 0.8);
        }
      };
    }
  };
})();

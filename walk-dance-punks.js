/* =============================================================================
   Dance, Punks, walked into on Paper Street: turning 04 off the Outskirts.
   Ryan's ask, 2026-11-04: round 1 of the rooms that could not yet be walked
   into.

   A SILENT DISCO ON THE OLD AIRSTRIP AT NIGHT, LIT BY NOTHING BUT THE
   HEADSETS (§43). Every headset glows steadily at head height in its channel's
   ink, blue, orange or white, and lights a little of the tarmac under it and
   nothing else: no rig, no runway lights, no moon. A crowd seen from the edge
   of the runway is a field of small coloured lights standing in card, and
   NOBODY IS DRAWN: the headsets are where heads would be, and the people in
   them are not ours to draw. The ones nobody has put on yet hang on hooks over
   the crate by the runway's edge, unlit, and the room's own page stands on a
   board beside it, where its headset and its channels are, to read and press
   as itself.

   THE REBELLION RAVE ROOM IS THE COLLISION, one turning on: a hangar of beams
   seen in haze. Here there is no roof, no haze, no beam and no rig, and a light
   goes only where somebody has walked with it.

   NOTHING MOVES AND NOTHING FLASHES, at any setting: the headsets glow steadily
   or not at all. Every colour is one §43 declares, by name. It keeps nothing,
   sends nothing and fetches nothing; its page arrives through Paper Street's
   screen(). tools/make-paper-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var CHANNELS = ['--dp-blue', '--dp-orange', '--dp-white'];

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }
  function hash(i, j) {
    var n = Math.imul(i, 374761393) ^ Math.imul(j, 668265263);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  // A headset glowing at head height: its band, its two cups, and the glow
  // round it in its channel's ink, steady. Nobody's head is drawn in it.
  function headset(w, ink) {
    var s = svg(w, w), c = w / 2;
    s.appendChild(el('circle', { cx: c, cy: c, r: c - 2, fill: 'var(' + ink + ')', 'fill-opacity': '0.16' }));
    s.appendChild(el('path', { fill: 'none', stroke: 'var(' + ink + ')', 'stroke-width': w * 0.06, d: 'M' + (c - w * 0.2) + ' ' + (c + w * 0.04) + ' A' + (w * 0.2) + ' ' + (w * 0.2) + ' 0 0 1 ' + (c + w * 0.2) + ' ' + (c + w * 0.04) }));
    s.appendChild(el('rect', { x: c - w * 0.26, y: c, width: w * 0.12, height: w * 0.16, rx: w * 0.04, fill: 'var(' + ink + ')' }));
    s.appendChild(el('rect', { x: c + w * 0.14, y: c, width: w * 0.12, height: w * 0.16, rx: w * 0.04, fill: 'var(' + ink + ')' }));
    return s;
  }

  // The crate at the runway's edge, and the headsets nobody has put on yet,
  // hanging unlit on their hooks over it.
  function crate(w, h) {
    var s = svg(w, h), top = h * 0.5;
    s.appendChild(el('rect', { x: 0, y: top, width: w, height: h - top, fill: 'var(--dp-body)', stroke: 'var(--dp-paint)', 'stroke-width': 6 }));
    for (var y = top + 40; y < h - 10; y += 50) s.appendChild(el('rect', { x: 6, y: y, width: w - 12, height: 4, fill: 'var(--dp-paint)' }));
    s.appendChild(el('rect', { x: 0, y: 10, width: w, height: 10, fill: 'var(--dp-paint)' }));
    for (var x = 50; x < w - 30; x += 90) {
      s.appendChild(el('rect', { x: x - 3, y: 20, width: 6, height: 26, fill: 'var(--dp-paint)' }));
      s.appendChild(el('path', { fill: 'none', stroke: 'var(--dp-strip)', 'stroke-width': 9, d: 'M' + (x - 26) + ' 90 A26 26 0 0 1 ' + (x + 26) + ' 90' }));
      s.appendChild(el('rect', { x: x - 34, y: 86, width: 16, height: 30, rx: 5, fill: 'var(--dp-strip)', stroke: 'var(--dp-paint)', 'stroke-width': 2 }));
      s.appendChild(el('rect', { x: x + 18, y: 86, width: 16, height: 30, rx: 5, fill: 'var(--dp-strip)', stroke: 'var(--dp-paint)', 'stroke-width': 2 }));
    }
    return s;
  }

  // The board the page stands on at the runway's edge: two posts.
  function board(w, h) {
    var s = svg(w, h);
    [0.1, 0.9].forEach(function (k) { s.appendChild(el('rect', { x: w * k - 12, y: 0, width: 24, height: h, fill: 'var(--dp-paint)' })); });
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['dance-punks.html'] = {
    prefix: 'dp-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 920), sh = kit.H - 24;
      var eye = sh / 2, HEAD = Math.max(eye + 20, 300), EDGE = -1300;
      var decor = [], crowd = [];

      // The crowd on the runway: headsets at head height, scattered, steady.
      for (var i = 0; i < 46; i++) {
        var x = -900 + hash(i, 1) * 2600, z = 1200 + hash(i, 2) * 5200;
        if (x < -600 && z < 2600) continue;      // the runway's edge, where the crate is
        var w = 90, ink = CHANNELS[Math.floor(hash(i, 3) * 3)];
        decor.push(kit.item(headset(w, ink), { x: x, z: z, w: w, h: w, y: HEAD + (hash(i, 4) - 0.5) * 60 }));
        crowd.push({ x: x, z: z, ink: ink });
      }
      var cr = kit.item(crate(560, 360), { x: EDGE + 260, z: 1500, w: 560, h: 360, turn: 0.4 });
      decor.push(cr);
      decor.push(kit.item(board(sw, 140), { x: EDGE + 260, z: 2300, w: sw, h: 140, turn: 0.4 }));

      var page = kit.screen(kit.page, 'Dance, Punks’ own page, on a board at the runway’s edge');
      var hung = kit.item(page, { x: EDGE + 260, z: 2300 - 6, w: sw, h: sh, y: 140, turn: 0.4, cls: 'dp-walk-board' });

      var stops = [
        kit.stop({ name: 'at the edge of the runway, the crowd a field of small lights', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the crate, the headsets nobody has put on yet hanging unlit', spot: kit.front(cr, 900) }, cr),
        kit.stop({ name: 'at the board, with the room’s own page and its headset', spot: kit.front(hung), link: page }, hung),
        kit.stop({ name: 'among the dancers, their headsets glowing round you', spot: { x: 300, z: 3200 } })
      ];

      return {
        cls: 'dp-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Its own page is on a board at the runway’s edge, on the left by the crate of headsets.',
        bounds: function () { return { x: [-1200, 1600], z: [0, 6000] }; },
        ground: function (g, from, to) {
          kit.quad(g, -9000, 9000, from, to, kit.ink('--dp-tarmac'));
          // The old runway's paint, worn, and under every headset a little of
          // its own light on the tarmac, and nothing else lit.
          var paint = kit.ink('--dp-paint');
          kit.quad(g, -1000, -980, from, to, paint);
          kit.quad(g, 1700, 1720, from, to, paint);
          for (var z = Math.max(0, Math.ceil(from / 600) * 600); z < to; z += 600) kit.quad(g, 340, 370, z, z + 300, paint);
          crowd.forEach(function (c) { kit.oval(g, c.x, c.z, 70, 40, kit.ink(c.ink), 0.18); });
        }
      };
    }
  };
})();

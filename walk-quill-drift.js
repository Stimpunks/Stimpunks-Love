/* =============================================================================
   Quill Drift, walked into on Paper Street. Ryan's ask, 2026-11-04: round one
   of the rooms still to be walked into. On Cel Street it opens off the Arcade,
   through its cabinet; here it is reached by its address or the teleporter.

   IT IS THE ARCADE'S BODY AND THIS MACHINE'S SCREEN (§15). The Arcade is the
   one room whose pages are supposed to look alike: the grape carpet, the purple
   walls, the marquee bulbs and the cabinet build are the foyer's, because an
   arcade is machines with one body and different things behind the glass. So
   this is a bay off the carpet, close up to one cabinet, and the world is the
   screen: a flat dark field, a different black from the room round it, with
   quills drifting across it in the Arcade's own inks. Cut out of card here it
   is a picture of the field before the coin goes in, with nobody on it; Esmx is
   on the room's own page, which hangs on the left-hand wall of the bay in a
   coin edge, and the game is played there.

   A PORCUPINE CANNOT SHOOT A QUILL, and nothing on this screen is fired: the
   quills drift, as the game says, and they are still here at every setting.

   NOTHING MOVES: the bulbs are lit and still, and the cabinet makes no sound,
   ever. Every colour is one the Arcade declares, by name. It keeps nothing,
   sends nothing and fetches nothing; its page arrives through Paper Street's
   screen(). tools/make-paper-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var INKS = ['var(--coin)', 'var(--mint)', 'var(--zap)', 'var(--tube)'];

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }
  function hash(i, j, k) {
    var n = Math.imul(i + 29, 374761393) ^ Math.imul(j + 11, 668265263) ^ Math.imul(k + 7, 2147483647);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }
  function bulbs(s, x0, x1, y, n, r) {
    for (var b = 0; b < n; b++) {
      s.appendChild(el('circle', { cx: x0 + (b + 0.5) * (x1 - x0) / n, cy: y, r: r, fill: b % 2 ? 'var(--zap)' : 'var(--coin)' }));
    }
  }

  // A quill, drawn on its slant as a long thin wedge with a dark tip.
  function quill(s, x, y, len, dx, dy, ink) {
    var nx = -dy * 5, ny = dx * 5;
    s.appendChild(el('path', { fill: ink,
      d: 'M' + x + ' ' + y + ' L' + (x + dx * len + nx) + ' ' + (y + dy * len + ny) + ' L' + (x + dx * len - nx) + ' ' + (y + dy * len - ny) + ' Z' }));
    s.appendChild(el('circle', { cx: x + dx * len, cy: y + dy * len, r: 4, fill: 'var(--carpet)' }));
  }

  // THE FIELD, the cabinet's screen: the crt's own black, its scanlines, and
  // quills drifting across it.
  function field(s, x, y, w, h) {
    s.appendChild(el('rect', { x: x, y: y, width: w, height: h, fill: 'var(--crt)' }));
    for (var ly = y + 6; ly < y + h; ly += 8) s.appendChild(el('rect', { x: x, y: ly, width: w, height: 2, fill: 'var(--carpet)', 'fill-opacity': '0.5' }));
    for (var k = 0; k < 9; k++) {
      var a = hash(k, 1, 1) * Math.PI * 2;
      quill(s, x + 40 + hash(k, 2, 1) * (w - 80), y + 40 + hash(k, 3, 1) * (h - 80), 50, Math.cos(a), Math.sin(a), INKS[k % INKS.length]);
    }
  }

  // THE CABINET, the foyer's build: the purple in hard blocks, coin edges,
  // bulbs on the marquee, the field in its screen, a pad and the speed knob.
  function cabinet(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--cab)' }));
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'none', stroke: 'var(--coin)', 'stroke-width': 8 }));
    s.appendChild(el('rect', { x: 24, y: 24, width: w - 48, height: 120, fill: 'var(--carpet)' }));
    bulbs(s, 34, w - 34, 44, 11, 9);
    s.appendChild(el('rect', { x: 80, y: 74, width: w - 160, height: 40, rx: 6, fill: 'var(--mint)' }));
    field(s, 50, 180, w - 100, h * 0.42);
    var py = 180 + h * 0.42 + 40;
    s.appendChild(el('rect', { x: 30, y: py, width: w - 60, height: 120, fill: 'var(--carpet)' }));
    // The pad: four arrows round a hub, in the screen's mint.
    var cx = 120, cy = py + 60;
    [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(function (d) {
      s.appendChild(el('rect', { x: cx + d[0] * 30 - 14, y: cy + d[1] * 30 - 14, width: 28, height: 28, rx: 4, fill: 'var(--mint)' }));
    });
    s.appendChild(el('rect', { x: w - 220, y: py + 36, width: 140, height: 48, rx: 24, fill: 'var(--crt)', stroke: 'var(--mint)', 'stroke-width': 4 }));
    s.appendChild(el('rect', { x: w / 2 - 40, y: h - 50, width: 80, height: 14, rx: 4, fill: 'var(--coin)' }));
    return s;
  }

  function bayWall(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--cab)' }));
    s.appendChild(el('rect', { x: 0, y: h - 14, width: w, height: 14, fill: 'var(--coin)' }));
    bulbs(s, 20, w - 20, 40, Math.max(6, Math.round(w / 70)), 10);
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['quill-drift.html'] = {
    prefix: 'quill-walk',
    build: function (kit) {
      var F = kit.F;
      var sh = kit.H - 24;
      var eye = sh / 2;
      var BACK = 2200, HALF = 900, WH = Math.max(1000, sh + 420);
      var decor = [];

      decor.push(kit.item(bayWall(2 * HALF + 200, WH), { x: 0, z: BACK, w: 2 * HALF + 200, h: WH }));
      [-1, 1].forEach(function (side) {
        decor.push(kit.item(bayWall(BACK + 800, WH), { x: side * HALF, z: BACK / 2 - 400, w: BACK + 800, h: WH, turn: side < 0 ? kit.LEFT : kit.RIGHT }));
      });
      var CW = 560, CH = 820;
      var cab = { x: 0, z: BACK - 260, w: CW, h: CH };
      decor.push(kit.item(cabinet(CW, CH), cab));

      // The page, on the bay's left-hand wall, in a coin edge.
      var PW = Math.min(kit.W - 200, 820), PH = Math.round(PW * 0.62);
      var page = kit.screen(kit.page, 'Quill Drift’s own page, on the left-hand wall of the bay');
      var glass = kit.item(page, { x: -HALF + 6, z: 1100, w: PW, h: PH, y: 200, turn: kit.LEFT, cls: 'quill-walk-glass' });

      var stops = [
        kit.stop({ name: 'in the bay off the carpet, the cabinet straight ahead', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the left-hand wall, with the game’s own page, where Esmx walks', spot: kit.front(glass), link: page }, glass),
        kit.stop({ name: 'at the cabinet, its dark field full of drifting quills', spot: kit.front(cab, 1400) })
      ];

      return {
        cls: 'quill-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Esmx is on the game’s own page, on the left-hand wall of the bay, where the game is played.',
        bounds: function () { return { x: [-HALF + 240, HALF - 240], z: [-300, BACK - 500] }; },
        ground: function (g, near, far) {
          kit.quad(g, -5000, 5000, near, far, kit.ink('--carpet'));
          var inks = [kit.ink('--coin'), kit.ink('--mint'), kit.ink('--zap')];
          for (var j = Math.max(-6, Math.floor(near / 110)); j < Math.min(Math.ceil(BACK / 110), Math.ceil(far / 110)); j++) {
            for (var i = -9; i <= 9; i++) {
              if (hash(i, j, 1) > 0.5) continue;
              var px = i * 110 + hash(i, j, 2) * 80, pz = j * 110 + hash(i, j, 3) * 80;
              kit.oval(g, px, pz, 8, 8, inks[Math.floor(hash(i, j, 4) * 3)]);
            }
          }
          // The screen's glow on the carpet in front of the cabinet, above
          // Gentle only, as the foyer's is.
          if (document.documentElement.getAttribute('data-intensity') !== 'gentle') {
            kit.oval(g, 0, BACK - 500, 360, 260, kit.ink('--mint'), 0.06);
          }
        }
      };
    }
  };
})();

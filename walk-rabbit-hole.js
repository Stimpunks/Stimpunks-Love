/* =============================================================================
   The Rabbit Hole, walked into on Paper Street. Ryan's ask, 2026-11-04: round
   one of the rooms still to be walked into.

   IT IS THE HOLE'S WORLD AND NOBODY ELSE'S (§30): somewhere you keep going, not
   somewhere you arrive. A square shaft of wet slate, and you on a ledge that
   runs along the near wall and down the left-hand one, with the middle open
   and going on down into the dark. The floor of Paper Street is a card, and
   here it is cut away where the shaft drops: the walls carry on below the edge,
   and more ledges step down them with pale things come to rest on them, each
   fainter than the one above, the page's own "no floor at the bottom of it,
   just more page". The light is the daylight you came in by, a long way above
   and behind you, so the walls are palest at the top and go dark further down.

   NO BROWN ANYWHERE, which keeps it off the Latibulum, the same floor plan
   arrived at; no furniture, which keeps it off the Latibulum's chair; no
   candle, which is the Mopery's. The room's own page hangs on the far wall
   across the drop, pale on the dark as the room's words are, and you read it
   from the end of the ledge. Nothing of Tenniel's is redrawn here: his cuts are
   on the page, and nothing of the song's words is anywhere.

   NOTHING MOVES. Every colour is one the room declares, by name. It keeps
   nothing, sends nothing and fetches nothing; its page arrives through Paper
   Street's screen(). tools/make-paper-street.py holds each of those.
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
  function hash(i, j) {
    var n = Math.imul(i + 3, 374761393) ^ Math.imul(j + 17, 668265263);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  }

  // A wall of the shaft, from high over your head to far below the ledge you
  // are on (`ledge` is how far down the drawing that is): wet slate in strata,
  // palest at the top where the daylight still reaches it, and the ledges
  // below stepping down it, each with a few pale things on it and each fainter.
  function shaftWall(w, h, ledge, seed) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--rh-slate-2)' }));
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: ledge * 0.55, fill: 'var(--rh-slate)' }));
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: ledge * 0.18, fill: 'var(--rh-graphite)' }));
    for (var y = 60, k = 0; y < h; y += 70 + hash(seed, k) * 90, k++) {
      s.appendChild(el('rect', { x: 0, y: y, width: w, height: 4, fill: 'var(--rh-graphite)', 'fill-opacity': y < ledge ? '0.7' : '0.3' }));
    }
    // Wet streaks running down from the top, where the light catches them.
    for (var x = 80, j = 0; x < w; x += 140 + hash(seed, 50 + j) * 160, j++) {
      s.appendChild(el('rect', { x: x, y: 0, width: 6, height: ledge * (0.3 + hash(seed, 90 + j) * 0.4), fill: 'var(--rh-daylight)', 'fill-opacity': '0.25' }));
    }
    // The ledges below, fading out.
    [0.62, 0.38, 0.2].forEach(function (op, d) {
      var ly = ledge + 200 + d * 380;
      s.appendChild(el('rect', { x: 0, y: ly, width: w, height: 30, fill: 'var(--rh-slate)', 'fill-opacity': String(op) }));
      for (var n = 0; n < 5; n++) {
        var px = 60 + hash(seed + d, n) * (w - 160);
        s.appendChild(el('rect', { x: px, y: ly - 64, width: 90, height: 64, fill: 'var(--rh-paper)', 'fill-opacity': String(op) }));
      }
    });
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['rabbit-hole.html'] = {
    prefix: 'rh-walk',
    build: function (kit) {
      var F = kit.F;
      var sh = kit.H - 24;
      var eye = sh / 2;
      var HALF = 800, NEAR = -400, FAR = 2400, LEDGE = 300;   // the shaft, and how wide the ledge is
      var UP = 2400, DOWN = 2600;                             // how far the walls go up, and down past the ledge
      var decor = [];
      var WH = UP + DOWN;

      decor.push(kit.item(shaftWall(2 * HALF + 40, WH, UP, 1), { x: 0, z: FAR, w: 2 * HALF + 40, h: WH, y: -DOWN }));
      decor.push(kit.item(shaftWall(FAR - NEAR + 40, WH, UP, 2), { x: -HALF, z: (FAR + NEAR) / 2, w: FAR - NEAR + 40, h: WH, y: -DOWN, turn: kit.LEFT }));
      decor.push(kit.item(shaftWall(FAR - NEAR + 40, WH, UP, 3), { x: HALF, z: (FAR + NEAR) / 2, w: FAR - NEAR + 40, h: WH, y: -DOWN, turn: kit.RIGHT }));

      // The page, on the far wall across the drop.
      var PW = Math.min(kit.W - 160, 900), PH = Math.round(PW * 0.62);
      var page = kit.screen(kit.page, 'The Rabbit Hole’s own page, on the far wall across the drop');
      var hung = kit.item(page, { x: 0, z: FAR - 6, w: PW, h: PH, y: 140, cls: 'rh-walk-page' });

      var EDGE = -HALF + LEDGE;                               // the edge of the left-hand ledge
      var across = function (x, z) { return { x: x, z: z, yaw: Math.atan2(0 - x, FAR - z) }; };
      var stops = [
        kit.stop({ name: 'on the ledge where you came in, the shaft open in front of you and going on down', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'along the left-hand ledge, looking down the walls at the ledges below', spot: { x: EDGE - 120, z: 900, yaw: 0.5 } }),
        kit.stop({ name: 'at the far end of the ledge, across the drop from the room’s own page', spot: across(EDGE - 120, FAR - F * 1.2), link: page }, hung)
      ];

      return {
        cls: 'rh-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The shaft goes on down. Its own page is on the far wall, across the drop from the end of the ledge.',
        // The ledge is along the near wall and down the left-hand one, and
        // nowhere over the drop.
        bounds: function (cam) {
          var onLeft = cam && cam.x <= EDGE + 40;
          var deep = cam && cam.z > LEDGE * 0.8;
          return { x: [-HALF + 120, deep ? EDGE - 60 : HALF - 120], z: [NEAR + 120, onLeft ? FAR - 300 : LEDGE * 0.8] };
        },
        ground: function (g, near, far) {
          // Only the ledge is card; the rest of the floor is cut away where the
          // shaft drops, so the walls below show through.
          var slate = kit.ink('--rh-slate'), edge = kit.ink('--rh-graphite');
          kit.quad(g, -HALF, HALF, Math.max(near, NEAR), Math.min(far, LEDGE), slate);
          kit.quad(g, -HALF, EDGE, Math.max(near, NEAR), Math.min(far, FAR), slate);
          kit.quad(g, EDGE - 10, EDGE, Math.max(near, LEDGE), Math.min(far, FAR), edge);
          kit.quad(g, EDGE, HALF, LEDGE - 10, LEDGE, edge);
        }
      };
    }
  };
})();

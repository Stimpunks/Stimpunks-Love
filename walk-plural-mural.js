/* =============================================================================
   Plural Mural, walked into on Paper Street. Ryan's ask, 2026-11-04: round one
   of the rooms still to be walked into.

   IT IS PLURAL MURAL'S WORLD AND NOBODY ELSE'S (§54): an end wall on the street
   seen from across the road at golden hour, OUTDOORS, the sun low and BEHIND
   you and square on, so the mural is at its full colour and the only shadow is
   the lamppost's beside you, lying across the road and up the wall. The
   backcloth is the evening, the wall is sunlit render under its coping, and the
   tarmac is under your feet.

   THE MURAL IS THE PAGE'S OWN PAINT, lifted off it by Paper Street's
   kit.lift(): the stage of murals as the house painted them, with the
   lamppost's shadow over it as the page paints it, and nobody real on it. It is
   the mural that was up when the room opened, and here it holds still: mural.js
   is not run in this scene, so the wall turns over only on the room's own
   page, at MAX by itself or on a press of Turn it over.

   EVERY WORD IS ON THE ROAD, NEVER ON THE WALL: so the room's own page does not
   hang on the wall but stands on a board at the kerb on your side of the road,
   and the chalkboard leans on the far pavement as a bare board, because its
   notes are read and written on the room's own page and chalk.js talks to the
   CB and is never run here.

   NOTHING MOVES BY ITSELF: the lamppost stands and the sun does not set. Every
   colour is one the room declares, by name. It keeps nothing, sends nothing and
   fetches nothing; its page arrives through Paper Street's screen().
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

  // THE END WALL: concrete render in the sun, its coping along the top, a pier
  // at either end, and the lamppost's shadow laid up it from the road.
  function endWall(w, h, sx) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 40, width: w, height: h - 40, fill: 'var(--pm-render)' }));
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: 48, fill: 'var(--pm-coping)' }));
    s.appendChild(el('rect', { x: 0, y: h - 30, width: w, height: 30, fill: 'var(--pm-coping)' }));
    [0, w - 80].forEach(function (x) { s.appendChild(el('rect', { x: x, y: 0, width: 80, height: h, fill: 'var(--pm-coping)' })); });
    // The lamppost's shadow, carried on up the wall where the road ends.
    s.appendChild(el('path', { d: 'M' + (sx - 16) + ' ' + h + ' H' + (sx + 16) + ' L' + (sx + 20) + ' ' + (h - 120) + ' H' + (sx - 12) + ' Z', fill: 'var(--pm-road)', 'fill-opacity': '0.3' }));
    return s;
  }

  // The lamppost on your side of the road, in the slate, its lamp unlit in
  // the daylight.
  function lamppost(w, h) {
    var s = svg(w, h), cx = w / 2;
    s.appendChild(el('rect', { x: cx - 14, y: 60, width: 28, height: h - 60, fill: 'var(--pm-slate)' }));
    s.appendChild(el('rect', { x: cx - 30, y: h - 50, width: 60, height: 50, fill: 'var(--pm-slate)' }));
    s.appendChild(el('path', { d: 'M' + (cx - 10) + ' 70 Q' + (cx + 60) + ' 10 ' + (w - 20) + ' 30', fill: 'none', stroke: 'var(--pm-slate)', 'stroke-width': 16 }));
    s.appendChild(el('path', { d: 'M' + (w - 70) + ' 26 h60 l-12 34 h-36 z', fill: 'var(--pm-slate)' }));
    return s;
  }

  // The chalkboard, leaning on the far pavement as a bare board in its frame.
  function chalkboard(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h - 40, rx: 6, fill: 'var(--pm-frame)' }));
    s.appendChild(el('rect', { x: 22, y: 22, width: w - 44, height: h - 84, fill: 'var(--pm-slate)' }));
    s.appendChild(el('rect', { x: 30, y: h - 40, width: 20, height: 40, fill: 'var(--pm-frame)' }));
    s.appendChild(el('rect', { x: w - 50, y: h - 40, width: 20, height: 40, fill: 'var(--pm-frame)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['plural-mural.html'] = {
    prefix: 'pm-walk',
    build: function (kit) {
      var F = kit.F;
      var sh = kit.H - 24;
      var eye = sh / 2;
      var WALL = 2800, ROAD = 520, MW = 1400, MH = MW / 2;
      var WW = 3400, WH = MH + 360;
      var decor = [];

      var post = { x: 280, z: 260, w: 280, h: 1200 };
      decor.push(kit.item(endWall(WW, WH, WW / 2 + post.x), { x: 0, z: WALL + 20, w: WW, h: WH }));
      decor.push(kit.item(lamppost(280, 1200), post));
      decor.push(kit.item(chalkboard(420, 520), { x: -1100, z: WALL - 260, w: 420, h: 520 }));

      // The room's own page, on a board at the kerb on your side of the road.
      var PW = Math.min(kit.W - 160, 820), PH = Math.round(PW * 0.62);
      var page = kit.screen(kit.page, 'Plural Mural’s own page, on a board at the kerb');
      var board = kit.item(page, { x: -820, z: 520, w: PW, h: PH, y: 90, turn: 0.45, cls: 'pm-walk-board' });
      // THE MURAL, the page's own stage of paint, on the wall.
      var mural = kit.lift(page, '.pm-stage', { x: 0, z: WALL, y: 120, w: MW, cls: 'pm-walk-mural' });

      var stops = [
        kit.stop({ name: 'across the road from the wall, by the lamppost, the sun at your back', spot: { x: 0, z: -350 } }),
        kit.stop({ name: 'at the board at the kerb, with the room’s own page, where the wall is turned over', spot: kit.front(board), link: page }, board),
        kit.stop({ name: 'over the road, in front of the wall, the mural at its full colour', spot: kit.front(mural, F * 1.6) }, mural)
      ];

      return {
        cls: 'pm-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: -350 },
        stops: stops,
        decor: decor,
        arrive: 'The mural on the wall holds still; its own page, on the board at the kerb, turns it over.',
        bounds: function () { return { x: [-1000, 1000], z: [-400, WALL - 500] }; },
        ground: function (g, near, far) {
          // You stand on the pavement, the road runs across between you and
          // the wall, and the wall's own pavement is beyond it.
          var road = kit.ink('--pm-road'), line = kit.ink('--pm-line'), yellow = kit.ink('--pm-yellow');
          var R0 = ROAD, R1 = WALL - 700;
          kit.quad(g, -6000, 6000, near, far, kit.ink('--pm-coping'));
          kit.quad(g, -6000, 6000, Math.max(near, R0), Math.min(far, R1), road);
          // The double yellow lines along both kerbs, and the dashes down the middle.
          [R0 + 12, R0 + 30, R1 - 38, R1 - 20].forEach(function (z) { kit.quad(g, -6000, 6000, z, z + 8, yellow); });
          for (var x = -3000; x < 3000; x += 320) kit.quad(g, x, x + 150, (R0 + R1) / 2 - 8, (R0 + R1) / 2 + 8, line);
          // THE LAMPPOST'S SHADOW, lying straight across the road from the
          // post to the wall, the one shadow there is.
          kit.quad(g, post.x - 14, post.x + 14, post.z, WALL, road, 0.5);
        }
      };
    }
  };
})();

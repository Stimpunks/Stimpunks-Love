/* =============================================================================
   Executive Session, walked into on Paper Street. Ryan's ask, 2026-11-04: round
   1 of the rooms still to be walked into. On Cel Street it opens off the Town
   Hall; here it is reached by its address or the teleporter for now. Its page
   is the board's alone to use; anybody may stand in the room.

   IT IS EXECUTIVE SESSION'S WORLD AND NOBODY ELSE'S (§82): the board without
   staff, in a dark room lit only by the EXIT sign. THE LIGHT IS THE SIGN,
   steady, over the shut door you came in by: a small green box that lights the
   door and the floor near it and fades before the far wall, and the chairs
   drawn up round the small table each catch a green edge on the side facing
   it. It is the light left on once everybody else has gone out through that
   door. Nobody faces it; it is behind them, at the side.

   THE BOARD ROOM NEXT DOOR is the same people at the same work, lit by the same
   lamp at every seat down one long table. This has no lamp at all, one small
   table, and a light that is somebody else's: the building's, over the way
   out. If a lamp is ever put on this table, it has become the Board room with
   fewer chairs. The room's own page is on the far wall, in the dark.

   NOTHING MOVES AT ANY SETTING, AND THE SIGN NEVER FLICKERS: an exit sign that
   flickered would be a broken one. Every colour is one the room declares, by
   name. It keeps nothing, sends nothing and fetches nothing; its page arrives
   through Paper Street's screen(). tools/make-paper-street.py holds each of
   those.
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

  // The shut door with no glass in it, and the EXIT sign over it, steady.
  function exitDoor(w, h) {
    var s = svg(w, h), m = w / 2, dw = w * 0.6, top = 200;
    s.appendChild(el('rect', { x: m - 130, y: 30, width: 260, height: 100, rx: 8, fill: 'var(--es-frame)' }));
    s.appendChild(el('rect', { x: m - 116, y: 44, width: 232, height: 72, rx: 4, fill: 'var(--es-exit)' }));
    var word = el('text', { x: m, y: 98, 'text-anchor': 'middle', 'font-size': 52, 'font-weight': 700, 'letter-spacing': 6, fill: 'var(--es-dark)' });
    word.textContent = 'EXIT';
    s.appendChild(word);
    s.appendChild(el('ellipse', { cx: m, cy: 160, rx: dw * 0.6, ry: 40, fill: 'var(--es-glow)', 'fill-opacity': '0.5' }));
    s.appendChild(el('rect', { x: m - dw / 2 - 20, y: top - 20, width: dw + 40, height: h - top + 20, fill: 'var(--es-frame)' }));
    s.appendChild(el('rect', { x: m - dw / 2, y: top, width: dw, height: h - top, fill: 'var(--es-door)' }));
    s.appendChild(el('rect', { x: m - dw / 2, y: top, width: dw, height: 8, fill: 'var(--es-glow)' }));
    s.appendChild(el('rect', { x: m - dw / 2 + 30, y: top + (h - top) * 0.5, width: dw - 60, height: 14, fill: 'var(--es-frame)' }));
    return s;
  }

  // The small table and the chairs drawn up round it, each chair catching a
  // green edge on the side that faces the sign.
  function table(w, h) {
    var s = svg(w, h), m = w / 2, top = h * 0.55;
    [0.15, 0.38, 0.62, 0.85].forEach(function (k) {
      var cx = w * k;
      s.appendChild(el('rect', { x: cx - 60, y: top - 180, width: 120, height: 210, rx: 14, fill: 'var(--es-panel)' }));
      s.appendChild(el('rect', { x: cx - 60, y: top - 180, width: 8, height: 210, fill: 'var(--es-exit)', 'fill-opacity': '0.4' }));
    });
    s.appendChild(el('ellipse', { cx: m, cy: top, rx: w * 0.4, ry: 40, fill: 'var(--es-frame)' }));
    s.appendChild(el('path', { d: 'M' + (m - w * 0.4) + ' ' + top + ' A' + (w * 0.4) + ' 40 0 0 0 ' + m + ' ' + (top + 40), fill: 'none', stroke: 'var(--es-exit)', 'stroke-width': 5, 'stroke-opacity': '0.5' }));
    s.appendChild(el('rect', { x: m - 26, y: top + 30, width: 52, height: h - top - 50, fill: 'var(--es-frame)' }));
    s.appendChild(el('ellipse', { cx: m, cy: h - 20, rx: 110, ry: 16, fill: 'var(--es-frame)' }));
    return s;
  }

  // A wall of the dark room.
  function wall(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--es-dark)' }));
    s.appendChild(el('rect', { x: 0, y: h - 40, width: w, height: 10, fill: 'var(--es-panel)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['town-hall-executive-session.html'] = {
    prefix: 'es-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 900), sh = kit.H - 24;
      var END = 1900 + F;                      // the far wall
      var SIDE = 900, DOOR_Z = 500;            // the walls, and where the door is in the left one
      var eye = sh / 2 + 40, WH = sh + 420;
      var decor = [];

      decor.push(kit.item(wall(END + 200, WH), { x: -SIDE - 10, z: (END + 200) / 2, w: END + 200, h: WH, turn: kit.LEFT }));
      decor.push(kit.item(wall(END + 200, WH), { x: SIDE + 10, z: (END + 200) / 2, w: END + 200, h: WH, turn: kit.RIGHT }));
      decor.push(kit.item(wall(SIDE * 2 + 40, WH), { x: 0, z: END + 20, w: SIDE * 2 + 40, h: WH }));
      var DW = 520, DH = Math.round(sh * 1.05);
      var out = kit.item(exitDoor(DW, DH), { x: -SIDE, z: DOOR_Z, w: DW, h: DH, turn: kit.LEFT });
      decor.push(out);
      var small = kit.item(table(640, 380), { x: 420, z: 1300, w: 640, h: 380 });
      decor.push(small);

      var page = kit.screen(kit.page, 'Executive Session’s own page, on the far wall in the dark');
      var far = kit.item(page, { x: 0, z: END, w: sw, h: sh, y: 40, cls: 'es-walk-wall' });

      var stops = [
        kit.stop({ name: 'just in from the door, the EXIT sign’s green behind you at your side', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the shut door with the EXIT sign over it, steady', spot: kit.front(out, 900) }, out),
        kit.stop({ name: 'at the small table, the chairs’ green edges on the side towards the sign', spot: kit.front(small, 1000) }, small),
        kit.stop({ name: 'at the far wall, with the room’s own page on it in the dark', spot: { x: 0, z: END - F }, link: page }, far)
      ];

      return {
        cls: 'es-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The only light is the EXIT sign over the door at your side. The room’s own page is on the far wall.',
        bounds: function () { return { x: [-SIDE + 200, SIDE - 200], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--es-dark'));
          // The sign's green on the floor by the door, fading well before the
          // far wall.
          var glow = kit.ink('--es-glow');
          for (var i = 0; i < 14; i++) kit.oval(g, -SIDE, DOOR_Z, 200 + i * 70, 240 + i * 60, glow, 0.07);
        }
      };
    }
  };
})();

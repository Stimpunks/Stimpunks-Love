/* =============================================================================
   The Directors' room, walked into on Paper Street. Ryan's ask, 2026-11-04:
   round 1 of the rooms still to be walked into. On Cel Street it opens off the
   Town Hall; here it is reached by its address or the teleporter for now.

   IT IS THE DIRECTORS' ROOM'S WORLD AND NOBODY ELSE'S (§79): a room for
   Stimpunks Directors to meet, lit only through the frosted pane in its door.
   THE LIGHT IS THE HALL'S, SECOND HAND: there is no lamp in the room, the pane
   glows because the hall behind it is lit, and because the glass is frosted
   the light arrives with no edge at all and falls off softly across the floor
   from the door you came in by, behind you. The table and chairs stand dark
   against it. The name on the glass is gilded on the hall's side, so from in
   here it reads backwards; turn round to see it.

   DEAD TIRED SOCIETY IS THE ONE TO WATCH: lit from a corridor through a door
   left AJAR, one hard wedge with an edge you could trace. This door is shut,
   and nothing on this floor has an edge. If one appears, the door has been
   opened. Its neighbours off the hall are sunlit; nothing in here is.

   The room's own page, which says who the directors are, is on the far wall.
   NOTHING MOVES AT ANY SETTING. Every colour is one the room declares, by name.
   It keeps nothing, sends nothing and fetches nothing; its page arrives through
   Paper Street's screen(). tools/make-paper-street.py holds each of those.
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

  // The door you came in by, seen from inside: dark wood, the frosted pane
  // glowing with the hall behind it, and the gilt name on the hall's side
  // showing through backwards, drawn as the backs of its strokes.
  function door(w, h) {
    var s = svg(w, h), pw = w - 120, ph = h * 0.4;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--dr-frame)' }));
    s.appendChild(el('rect', { x: 30, y: 30, width: w - 60, height: h - 30, fill: 'var(--dr-panel)' }));
    s.appendChild(el('rect', { x: 60, y: 70, width: pw, height: ph, fill: 'var(--dr-pane)' }));
    for (var i = 0; i < 9; i++) {
      var gx = 60 + pw - 40 - i * (pw - 60) / 9;
      s.appendChild(el('rect', { x: gx, y: 70 + ph * 0.42, width: (pw - 80) / 12, height: ph * 0.12, fill: 'var(--dr-gilt)' }));
    }
    s.appendChild(el('rect', { x: 60, y: 70 + ph * 0.62, width: pw, height: 4, fill: 'var(--dr-milk)' }));
    s.appendChild(el('circle', { cx: 80, cy: h * 0.62, r: 12, fill: 'var(--dr-gilt)' }));
    return s;
  }

  // The round table and its chairs, dark against the light from the door: two
  // chairs drawn up on the far side, two on this side with their backs to you.
  function chairBack(s, cx, top, tall) {
    s.appendChild(el('rect', { x: cx - 64, y: top, width: 128, height: tall, rx: 18, fill: 'var(--dr-panel)' }));
    s.appendChild(el('rect', { x: cx - 64, y: top, width: 128, height: 6, fill: 'var(--dr-milk)', 'fill-opacity': '0.5' }));
  }
  function table(w, h) {
    var s = svg(w, h), m = w / 2, top = h * 0.5;
    chairBack(s, w * 0.3, top - 160, 180);
    chairBack(s, w * 0.7, top - 160, 180);
    s.appendChild(el('ellipse', { cx: m, cy: top, rx: w * 0.42, ry: 40, fill: 'var(--dr-table)' }));
    s.appendChild(el('path', { d: 'M' + (m - w * 0.42) + ' ' + top + ' A' + (w * 0.42) + ' 40 0 0 0 ' + (m + w * 0.42) + ' ' + top, fill: 'none', stroke: 'var(--dr-milk)', 'stroke-width': 4, 'stroke-opacity': '0.5' }));
    s.appendChild(el('rect', { x: m - 26, y: top + 30, width: 52, height: h - top - 50, fill: 'var(--dr-table)' }));
    s.appendChild(el('ellipse', { cx: m, cy: h - 20, rx: 120, ry: 16, fill: 'var(--dr-table)' }));
    chairBack(s, w * 0.2, top - 40, h - top + 40);
    chairBack(s, w * 0.8, top - 40, h - top + 40);
    return s;
  }

  // The far wall, panelled, dark, round the page.
  function farWall(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--dr-dark)' }));
    for (var x = 40; x < w - 200; x += 320) s.appendChild(el('rect', { x: x, y: 60, width: 260, height: h - 160, fill: 'none', stroke: 'var(--dr-frame)', 'stroke-width': 6 }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['town-hall-directors.html'] = {
    prefix: 'dr-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 940), sh = kit.H - 24;
      var END = 2000 + F;                      // the far wall
      var eye = sh / 2 + 40;
      var decor = [];

      var round = kit.item(table(760, 420), { x: -520, z: 1300, w: 760, h: 420 });
      decor.push(round);
      decor.push(kit.item(farWall(3200, sh + 500), { x: 0, z: END + 20, w: 3200, h: sh + 500 }));
      // The door is behind you as you come in, facing into the room.
      var DH = Math.round(sh * 1.1), shut = kit.item(door(460, DH), { x: 0, z: -200, w: 460, h: DH, turn: kit.LEFT * 2 });
      decor.push(shut);

      var page = kit.screen(kit.page, 'The Directors’ room’s own page, on the far wall');
      var wall = kit.item(page, { x: 0, z: END, w: sw, h: sh, y: 40, cls: 'dr-walk-wall' });

      var stops = [
        kit.stop({ name: 'just inside the shut door, its light soft on the floor round you', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'turned round to the door, the frosted pane glowing and the name on it backwards', spot: { x: 0, z: F + 80, yaw: kit.LEFT * 2 } }, shut),
        kit.stop({ name: 'at the round table, dark against the light', spot: kit.front(round, 1100) }, round),
        kit.stop({ name: 'at the far wall, with the room’s own page on it', spot: { x: 0, z: END - F }, link: page }, wall)
      ];

      return {
        cls: 'dr-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The only light is the frosted pane in the door behind you. The room’s own page is on the far wall.',
        bounds: function () { return { x: [-900, 900], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--dr-dark'));
          // The pane's light on the floor from the door: soft, and no edge
          // anywhere, so many faint ovals one inside the next.
          var milk = kit.ink('--dr-milk');
          for (var i = 0; i < 16; i++) kit.oval(g, 0, -200, 300 + i * 60, 500 + i * 90, milk, 0.025);
        }
      };
    }
  };
})();

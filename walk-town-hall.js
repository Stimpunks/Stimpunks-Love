/* =============================================================================
   The Town Hall, walked into on Paper Street. Ryan's ask, 2026-11-04: round 1
   of the rooms still to be walked into.

   IT IS THE TOWN HALL'S WORLD AND NOBODY ELSE'S (§77): a rotunda at noon. One
   round room of stone under a coffered dome, and the top of the dome open to
   the sky. THE LIGHT COMES THROUGH THE HOLE IN THE ROOF AND LANDS AS ONE DISC:
   no lamp, no window, no glass, only a round opening and the sun through it
   lying on the floor as a single hard-edged disc, with everything else in the
   hall in the dome's even shade. Clean air shows no beam, so none is drawn.
   Nobody stands in the disc and it carries no word: every word here, the
   room's own page included, is in the shade.

   DOORS STAND ROUND THE WALL between porphyry columns, each with its name cut
   on a plate fixed across it, and each is a way through: the Fishbowl's standing open,
   and the shut doors of the rooms for our directors, our board, our
   moderators and Executive Session. Every one of those rooms is its own world,
   sharing nothing with this hall, and these doors are the hall's granite and
   shade, nothing of theirs. The room's own page is on the wall across the
   floor from where you come in.

   If the disc ever softens into a glow, or a second light comes into the hall,
   it has stopped being a hole in the roof. NOTHING MOVES: it is noon and it
   stays noon. Every colour is one the room declares, by name. It keeps
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

  // A bay of the round wall: stone in shade, the coffers of the dome springing
  // from its top, a porphyry column at each side, and a shut door or none.
  var PLATE = 120;
  function bay(w, h, door, open) {
    var s = svg(w, h), m = w / 2, spring = 260;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--th-wall)' }));
    for (var row = 0; row < 3; row++) {
      for (var x = 20; x < w - 40; x += 120) {
        s.appendChild(el('rect', { x: x + row * 10, y: 20 + row * 80, width: 100 - row * 20, height: 60, fill: 'var(--th-coffer)' }));
      }
    }
    s.appendChild(el('rect', { x: 0, y: spring, width: w, height: 24, fill: 'var(--th-granite)' }));
    [0, w - 40].forEach(function (x) { s.appendChild(el('rect', { x: x, y: spring + 24, width: 40, height: h - spring - 24, fill: 'var(--th-porphyry)' })); });
    if (door) {
      var dw = 260, dh = Math.min(560, h - spring - 80);
      s.appendChild(el('path', { d: 'M' + (m - dw / 2) + ' ' + h + ' V' + (h - dh + dw / 2) + ' A' + (dw / 2) + ' ' + (dw / 2) + ' 0 0 1 ' + (m + dw / 2) + ' ' + (h - dh + dw / 2) + ' V' + h + ' Z', fill: 'var(--th-granite)' }));
      s.appendChild(el('path', { d: 'M' + (m - dw / 2 + 22) + ' ' + h + ' V' + (h - dh + dw / 2) + ' A' + (dw / 2 - 22) + ' ' + (dw / 2 - 22) + ' 0 0 1 ' + (m + dw / 2 - 22) + ' ' + (h - dh + dw / 2) + ' V' + h + ' Z', fill: open ? 'var(--th-coffer)' : 'var(--th-wall)' }));
      if (!open) {
        // Two leaves meeting, and a handle in the hall's warm link colour.
        s.appendChild(el('rect', { x: m - 3, y: h - dh + 40, width: 6, height: dh - 40, fill: 'var(--th-granite)' }));
        s.appendChild(el('circle', { cx: m + 26, cy: h - dh * 0.32, r: 10, fill: 'var(--th-link)' }));
      }
      // The plate fixed across the door, its name cut in it (kit.door letters it).
      s.appendChild(el('rect', { x: m - 165, y: h - dh + 140, width: 330, height: PLATE, fill: 'var(--th-coffer)', stroke: 'var(--th-granite)', 'stroke-width': 8 }));
    }
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['town-hall.html'] = {
    prefix: 'th-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 940), sh = kit.H - 24;
      var R = 1500, C = 2000;                  // the round wall's radius, and its middle
      var SUN = 360;                           // the disc's radius
      var eye = sh / 2 + 40, WH = sh + 420;
      var decor = [], doors = [];

      // The bays round the wall, each turned to face the middle of the floor.
      // The far one is wide enough for the page; the near ones are behind you.
      // A door is a way through, made in the order you meet them going round
      // from the left of the way in to the right, as the page lists them.
      var WAYS = {
        '-90': { page: 'town-hall-fishbowl.html', open: true, stop: 'at the Fishbowl’s door, standing open, where anybody signed on to the CB can talk' },
        '-36': { page: 'town-hall-directors.html', stop: 'at the Directors’ door, shut, the room where our directors meet' },
        '36': { page: 'town-hall-board.html', stop: 'at the Board’s door, shut, the room where our board meets' },
        '90': { page: 'town-hall-moderators.html', stop: 'at the Moderators’ door, shut, the room where our moderators meet' },
        '120': { page: 'town-hall-executive-session.html', stop: 'at the door to Executive Session, shut, for the board and nobody else' }
      };
      [-120, -90, -62, -36, 36, 62, 90, 120].forEach(function (deg) {
        var a = deg * Math.PI / 180, bw = 2 * R * Math.sin(Math.PI / 12) + 20;
        var way = WAYS[String(deg)];
        var o = { x: R * Math.sin(a), z: C + R * Math.cos(a), w: bw, h: WH, turn: -a };
        if (!way) { decor.push(kit.item(bay(bw, WH, false), o)); return; }
        o.art = bay(bw, WH, true, way.open);
        o.label = 'th-walk-plate';
        o.cls = 'th-walk-door';
        var it = kit.door(way.page, o);
        decor.push(it);
        doors.push({ it: it, stop: way.stop });
      });
      var far = kit.item(bay(sw + 260, WH, false), { x: 0, z: C + R + 10, w: sw + 260, h: WH });
      decor.push(far);

      var page = kit.screen(kit.page, 'The Town Hall’s own page, on the wall across the floor');
      var wall = kit.item(page, { x: 0, z: C + R, w: sw, h: sh, y: 40, cls: 'th-walk-wall' });

      var stops = [
        kit.stop({ name: 'inside the door, the hall in the dome’s shade', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the edge of the disc of sun, where nobody stands', spot: { x: 0, z: C - SUN - 220 } }),
        kit.stop({ name: 'across the floor, at the wall with the room’s own page on it', spot: { x: 0, z: C + R - F }, link: page }, wall)
      ];
      // The doors' stops, in the order the doors are made, before the page's.
      doors.forEach(function (d, n) {
        stops.splice(2 + n, 0, kit.stop({ name: d.stop, spot: kit.front(d.it, 1100), link: d.it.link }, d.it));
      });

      return {
        cls: 'th-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The sun lies on the floor as one disc through the open top of the dome. The room’s own page is on the far wall.',
        bounds: function () { return { x: [-R + 400, R - 400], z: [0, C + R - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--th-shade'));
          // The floor's rings of inlay, granite and porphyry, round the middle.
          kit.oval(g, 0, C, R, R, kit.ink('--th-wall'), 1);
          kit.oval(g, 0, C, R * 0.72, R * 0.72, kit.ink('--th-granite'), 1);
          kit.oval(g, 0, C, R * 0.7, R * 0.7, kit.ink('--th-shade'), 1);
          kit.oval(g, 0, C, R * 0.46, R * 0.46, kit.ink('--th-porphyry'), 1);
          kit.oval(g, 0, C, R * 0.44, R * 0.44, kit.ink('--th-shade'), 1);
          // The one disc of sun: hard-edged, and nothing else lit.
          kit.oval(g, 0, C, SUN, SUN, kit.ink('--th-sun'), 1);
        }
      };
    }
  };
})();

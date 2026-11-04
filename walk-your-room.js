/* =============================================================================
   Your Room, walked into on Paper Street. Ryan's ask, 2026-11-04: round 1 of
   the rooms you can walk into, down the rest of the street.

   IT IS A ROOM NOBODY HAS MOVED INTO YET, AND THAT IS THE WHOLE PAGE. The page
   says there is a storefront on this street with nothing in it, empty on
   purpose, not scenery and not "coming soon", a room we are not going to
   decorate because it is not ours to decorate. So this is that shop, unlet:
   bare boards, bare walls, empty brackets where a shelf could go, a bulb with
   no shade, the door standing open behind you with the street's light lying
   in off the pavement, one chair, and the page pinned up on the far wall.
   Nothing else. No sign anywhere, because a sign would be "coming soon" by
   another name.

   IT WEARS THE PLAIN ROOMS' CLOTHES (§11) AND NOBODY ELSE'S: the street's
   night ground and one accent, every colour off the street's base, by name,
   and nothing borrowed from any other room's palette, because a room of
   somebody's own will bring its own. The light in off the street is the plain
   rooms' chalk, not any one shopfront's colour; the bulb is not lit.

   NOTHING MOVES. It keeps nothing, sends nothing and fetches nothing; its
   page arrives through Paper Street's screen(). tools/make-paper-street.py
   holds each of those.
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
  function sized(s, w, h) { s.setAttribute('width', w); s.setAttribute('height', h); return s; }
  function rect(s, x, y, w, h, fill, rx) { s.appendChild(el('rect', { x: x, y: y, width: w, height: h, rx: rx || 0, fill: 'var(' + fill + ')' })); }

  // A bare wall: the night ground, a skirting, and for the side walls a row of
  // empty shelf brackets where somebody's shelf might go one day.
  function wall(w, h, brackets) {
    var s = svg(w, h);
    rect(s, 0, 0, w, h, '--ink');
    rect(s, 0, h - 40, w, 40, '--ink-3');
    if (brackets) {
      for (var x = 300; x < w - 200; x += 520) {
        rect(s, x, h - 760, 18, 120, '--ink-3');
        s.appendChild(el('path', { d: 'M' + (x + 18) + ' ' + (h - 760) + ' H' + (x + 90) + ' L' + (x + 18) + ' ' + (h - 680) + ' Z', fill: 'var(--ink-3)' }));
      }
    }
    return s;
  }

  // The chair: the only thing in the room, plain, facing nowhere in particular.
  function chair(w, h) {
    var s = svg(w, h), seat = h * 0.55;
    rect(s, w * 0.12, 0, 22, h, '--ink-3');
    rect(s, w * 0.12, h * 0.06, w * 0.7, h * 0.12, '--ink-3', 6);
    rect(s, w * 0.12, h * 0.3, w * 0.7, h * 0.08, '--ink-3', 6);
    rect(s, w * 0.06, seat, w * 0.88, h * 0.1, '--chalk', 8);
    rect(s, w * 0.82 - 22, seat, 22, h - seat, '--ink-3');
    rect(s, w * 0.12, seat, 22, h - seat, '--ink-3');
    return s;
  }

  // A bulb on its flex, no shade and not lit.
  function bulb(w, h) {
    var s = svg(w, h);
    rect(s, w / 2 - 3, 0, 6, h - 70, '--ink-3');
    rect(s, w / 2 - 14, h - 80, 28, 22, '--ink-3', 4);
    s.appendChild(el('circle', { cx: w / 2, cy: h - 34, r: 30, fill: 'var(--ink-2)', stroke: 'var(--chalk)', 'stroke-width': 3 }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['your-room.html'] = {
    prefix: 'yr-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 980), sh = kit.H - 24;
      var END = 2000 + F;                       // the far wall
      var SIDE = 700;
      var eye = sh / 2, k = eye / 520;
      var decor = [];
      var put = function (s, w, h, o) {
        o.w = w * k; o.h = h * k; o.y = (o.y || 0) * k;
        return kit.item(sized(s, o.w, o.h), o);
      };

      var wallH = Math.max(1400, sh + 700);
      decor.push(kit.item(wall(3600, wallH, false), { x: 0, z: END + 20, w: 3600, h: wallH }));
      [-1, 1].forEach(function (side) {
        var len = END + 20;
        decor.push(kit.item(sized(wall(len / k, wallH / k, true), len, wallH), { x: side * SIDE, z: len / 2, w: len, h: wallH, turn: side < 0 ? kit.LEFT : kit.RIGHT }));
      });
      var chairIt = put(chair(320, 500), 320, 500, { x: -260, z: END - F * 1.4 });
      decor.push(chairIt);
      decor.push(put(bulb(120, 700), 120, 700, { x: 0, z: END * 0.45, y: 520 }));

      var page = kit.screen(kit.page, 'Your Room’s own page, pinned up on the far wall');
      var pinned = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'yr-walk-pinned' });

      var stops = [
        kit.stop({ name: 'just inside the open door, the street’s light lying in on the bare boards', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'by the one chair, in a room nobody has moved into yet', spot: kit.front(chairIt, 800) }, chairIt),
        kit.stop({ name: 'at the far wall, with the room’s own page pinned up on it', spot: { x: 0, z: END - F }, link: page }, pinned)
      ];

      return {
        cls: 'yr-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Nobody has moved in yet; its own page is pinned up on the far wall.',
        bounds: function () { return { x: [-SIDE + 140, SIDE - 140], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--ink-2'));
          // Bare boards, the long way, nothing on them.
          var seam = kit.ink('--ink');
          for (var x = -SIDE; x <= SIDE; x += 110) kit.quad(g, x, x + 4, Math.max(from, -400), Math.min(to, END + 20), seam);
          // The street's light, in off the pavement through the open door
          // behind you, lying on the boards and going no further.
          kit.quad(g, -260, 260, -400, 900, kit.ink('--chalk'), 0.22);
          kit.quad(g, -190, 190, -400, 420, kit.ink('--chalk'), 0.18);
        }
      };
    }
  };
})();

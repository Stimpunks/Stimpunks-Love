/* =============================================================================
   Cavendish Coworking, walked into on Paper Street. Ryan's call, 2026-11-04:
   round one of the rooms you can walk into, the house among them.

   IT IS THE HOUSE'S WORLD AND NOBODY ELSE'S (§58): Henry Cavendish's house in
   Bedford Square, green throughout, with a door onto each of our calls. EVERY
   DOOR IS SHUT AND NONE IS LOCKED: each is a Georgian six-panel door in
   mahogany, in a Coade stone case with a fanlight
   over it, a brass plate on it and a note pinned beside it. You can tell a
   room is in there without anybody opening anything; going in is yours to
   decide. Transparency does not mean an open floor plan, and if a door here
   is ever drawn open, the room has lost its argument.

   THE BLINDS ARE DOWN AND YOU CAN SEE THROUGH THEM: the light is daylight
   from the front windows at the end of the hall, through green transparent
   canvas, soft and even and faintly green on the floor. Between the two
   windows hangs the house's own page, full size once you stand at it.

   THE WAYS IN ARE THOSE DOORS: three meeting doors down the left wall (the
   Events, Operations and Editorial Rooms), each with its brass plate lettered
   in Caslon, and up a stone stair on the right wall a landing with the three
   Hang Suites' doors on it (the Cave, the Campfire, the Watering Hole). All of
   them drawn shut; pressing one goes in. Nothing moves. Every colour is one §58 declares, by name.
   It keeps nothing, sends nothing and fetches nothing; its page arrives
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

  // One shut door in its Coade stone case: pilasters, a fanlight over it,
  // six mahogany panels, a brass plate and knob, and a note pinned beside it.
  // The plate is wide enough for the room's name, which kit.door letters on
  // it in Caslon.
  function door(s, x, h) {
    var dw = 300, dh = 640, top = h - dh;
    s.appendChild(el('rect', { x: x - 60, y: top - 40, width: dw + 120, height: dh + 40, fill: 'var(--cw-stone)' }));
    s.appendChild(el('path', { fill: 'var(--cw-stone)', d: 'M' + (x - 60) + ' ' + (top - 40) + ' A' + (dw / 2 + 60) + ' ' + (dw / 2 + 20) + ' 0 0 1 ' + (x + dw + 60) + ' ' + (top - 40) + ' Z' }));
    s.appendChild(el('path', { fill: 'var(--cw-light)', d: 'M' + x + ' ' + (top - 20) + ' A' + (dw / 2) + ' ' + (dw / 2 - 30) + ' 0 0 1 ' + (x + dw) + ' ' + (top - 20) + ' Z' }));
    for (var i = 1; i < 5; i++) {
      var a = Math.PI * i / 5;
      s.appendChild(el('path', { fill: 'none', stroke: 'var(--cw-stone)', 'stroke-width': 5,
        d: 'M' + (x + dw / 2) + ' ' + (top - 20) + ' L' + (x + dw / 2 - Math.cos(a) * dw / 2) + ' ' + (top - 20 - Math.sin(a) * (dw / 2 - 30)) }));
    }
    s.appendChild(el('rect', { x: x, y: top, width: dw, height: dh, fill: 'var(--cw-mahogany)' }));
    [[0.1, 0.06, 0.18], [0.1, 0.3, 0.3], [0.1, 0.66, 0.28]].forEach(function (p) {
      [0, 1].forEach(function (c) {
        s.appendChild(el('rect', { x: x + dw * (0.1 + c * 0.44), y: top + dh * p[1], width: dw * 0.36, height: dh * p[2], fill: 'none', stroke: 'var(--cw-plate-ink)', 'stroke-width': 6 }));
      });
    });
    s.appendChild(el('rect', { x: x + 10, y: top + 70, width: dw - 20, height: 140, fill: 'var(--cw-plate)', stroke: 'var(--cw-plate-ink)', 'stroke-width': 3 }));
    s.appendChild(el('circle', { cx: x + dw - 40, cy: top + dh * 0.55, r: 12, fill: 'var(--cw-brass)' }));
    s.appendChild(el('rect', { x: x + dw + 80, y: top + 140, width: 110, height: 140, fill: 'var(--cw-card)' }));
    for (var y = top + 166; y < top + 260; y += 20) s.appendChild(el('rect', { x: x + dw + 96, y: y, width: 78, height: 5, fill: 'var(--cw-ink-2)' }));
    s.appendChild(el('circle', { cx: x + dw + 135, cy: top + 150, r: 6, fill: 'var(--cw-brass)' }));
  }

  // A wall of the hall: green paint above a dado. Its doors stand in front of
  // it, each a way in of its own.
  function hallWall(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--cw-wall)' }));
    s.appendChild(el('rect', { x: 0, y: h - 300, width: w, height: 14, fill: 'var(--cw-stone)' }));
    s.appendChild(el('rect', { x: 0, y: h - 40, width: w, height: 40, fill: 'var(--cw-mahogany)' }));
    return s;
  }

  // The right-hand wall carries the stair: stone steps rising along it from
  // the foot (at.foot, measured from the wall's far end) to the landing
  // (at.land high), and the landing running on to the front of the house with
  // a stone balustrade along its edge. The suites' doors stand on it.
  function stairWall(w, h, at) {
    var s = hallWall(w, h), steps = 12, run = (at.foot - at.top) / steps, rise = at.land / steps;
    s.appendChild(el('rect', { x: 0, y: h - at.land - 10, width: at.top, height: at.land + 10, fill: 'var(--cw-stone)' }));
    for (var p = 30; p < at.top - 120; p += 160) s.appendChild(el('rect', { x: p, y: h - at.land + 26, width: 120, height: at.land - 60, fill: 'none', stroke: 'var(--cw-dim)', 'stroke-width': 6 }));
    s.appendChild(el('rect', { x: 0, y: h - at.land - 10, width: at.top, height: 14, fill: 'var(--cw-mahogany)' }));
    for (var i = 0; i < steps; i++) {
      var x = at.foot - run * (i + 1);
      s.appendChild(el('rect', { x: x, y: h - rise * (i + 1), width: run + 1, height: rise * (i + 1), fill: 'var(--cw-stone)' }));
      s.appendChild(el('rect', { x: x, y: h - rise * (i + 1), width: run + 1, height: 4, fill: 'var(--cw-dim)' }));
    }
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--cw-mahogany)', 'stroke-width': 10,
      d: 'M' + at.foot + ' ' + (h - 110) + ' L' + at.top + ' ' + (h - at.land - 110) + ' L0 ' + (h - at.land - 110) }));
    return s;
  }

  // A door to stand on its own in the hall, drawn at half size.
  var DW = 560, DH = 860, DS = 0.5;
  function doorArt() {
    var s = el('svg', { viewBox: '0 0 ' + DW + ' ' + DH, width: DW * DS, height: DH * DS, 'aria-hidden': 'true', focusable: 'false' });
    door(s, 60, DH);
    return s;
  }

  // The front wall: two tall windows with their green canvas blinds down and
  // the day coming through them, and a frame between for the page.
  function frontWall(w, h, gap, ph) {
    var s = svg(w, h), m = w / 2;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--cw-wall)' }));
    [-1, 1].forEach(function (k) {
      var ww = 400, x = m + k * (gap / 2 + 70) - (k < 0 ? ww : 0), top = h - ph - 220, wh = ph + 120;
      s.appendChild(el('rect', { x: x - 26, y: top - 26, width: ww + 52, height: wh + 52, fill: 'var(--cw-stone)' }));
      s.appendChild(el('rect', { x: x, y: top, width: ww, height: wh, fill: 'var(--cw-light)' }));
      s.appendChild(el('rect', { x: x, y: top, width: ww, height: wh * 0.8, fill: 'var(--cw-canvas)', 'fill-opacity': '0.8' }));
      for (var y = top + 40; y < top + wh * 0.8; y += 60) s.appendChild(el('rect', { x: x, y: y, width: ww, height: 3, fill: 'var(--cw-wall)', 'fill-opacity': '0.3' }));
      s.appendChild(el('rect', { x: x - 10, y: top + wh * 0.8 - 8, width: ww + 20, height: 14, fill: 'var(--cw-mahogany)' }));
    });
    s.appendChild(el('rect', { x: m - gap / 2 - 30, y: h - ph - 30, width: gap + 60, height: ph + 30, fill: 'var(--cw-brass)' }));
    s.appendChild(el('rect', { x: 0, y: h - 40, width: w, height: 40, fill: 'var(--cw-mahogany)' }));
    return s;
  }

  // How each way in is spoken of at its stop.
  var NAMES_OF = {
    'cavendish-events.html': 'the Events Room', 'cavendish-operations.html': 'the Operations Room',
    'cavendish-editorial.html': 'the Editorial Room', 'cavendish-cave.html': 'the Cave',
    'cavendish-campfire.html': 'the Campfire', 'cavendish-watering-hole.html': 'the Watering Hole'
  };

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['cavendish-coworking.html'] = {
    prefix: 'cw-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 960), sh = kit.H - 24;
      var END = 3200 + F;                       // the front wall, between the windows
      var eye = sh / 2, SIDE = 1200;
      var decor = [];
      var WH = Math.max(sh + 500, 1100);

      decor.push(kit.item(frontWall(3600, WH, sw, sh), { x: 0, z: END + 30, w: 3600, h: WH }));
      var len = END + 30;
      var STAIR = { foot: len - 900, top: len - 1500, land: 160 };
      decor.push(kit.item(hallWall(len, WH), { x: -SIDE, z: len / 2, w: len, h: WH, turn: kit.LEFT }));
      decor.push(kit.item(stairWall(len, WH, STAIR), { x: SIDE, z: len / 2, w: len, h: WH, turn: kit.RIGHT }));

      // THE WAYS IN, made in the order you pass them going down the hall:
      // the meeting doors on the left at floor level, the suites' doors on
      // the landing up the stair on the right.
      var WAYS = [
        { page: 'cavendish-events.html', z: 700, side: -1 },
        { page: 'cavendish-operations.html', z: 1500, side: -1 },
        { page: 'cavendish-cave.html', z: 1950, side: 1 },
        { page: 'cavendish-editorial.html', z: 2300, side: -1 },
        { page: 'cavendish-campfire.html', z: 2550, side: 1 },
        { page: 'cavendish-watering-hole.html', z: 3150, side: 1 }
      ];
      var stops = [
        kit.stop({ name: 'inside the front door, the hall’s doors shut down both walls', spot: { x: 0, z: 0 } })
      ];
      WAYS.forEach(function (d) {
        var up = d.side > 0;
        var it = kit.door(d.page, { art: doorArt(), label: 'cw-walk-plate', cls: 'cw-walk-door',
                                    x: d.side * (SIDE - 8), y: up ? STAIR.land : 0, z: d.z, w: DW * DS, h: DH * DS,
                                    turn: up ? kit.RIGHT : kit.LEFT });
        decor.push(it);
        var name = NAMES_OF[d.page];
        stops.push(kit.stop({ name: up ? 'below the landing, with the door to ' + name + ' up on it, shut and unlocked at the top of the stair'
                                       : 'at the door to ' + name + ', shut and unlocked, its note pinned beside it',
                              spot: kit.front(it), link: it.link }, it));
      });
      var page = kit.screen(kit.page, 'Cavendish Coworking’s own page, between the front windows');
      var hung = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'cw-walk-page' });
      stops.push(kit.stop({ name: 'at the front windows, blinds down, with the house’s own page between them', spot: { x: 0, z: END - F }, link: page }, hung));

      return {
        cls: 'cw-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Every door in the hall is shut and none is locked. The house’s own page hangs between the front windows, which have their green blinds down.',
        bounds: function () { return { x: [-SIDE + 400, SIDE - 400], z: [0, END - F] }; },
        // Stone flags, and the day through the green blinds lying faintly on
        // them at the front of the house.
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--cw-stone'));
          var joint = kit.ink('--cw-dim'), z0 = Math.max(from, 0), z1 = Math.min(to, END + 30);
          for (var x = -1800; x <= 1800; x += 300) kit.quad(g, x - 3, x + 3, z0, z1, joint);
          for (var z = Math.ceil(z0 / 300) * 300; z < z1; z += 300) kit.quad(g, -1800, 1800, z - 3, z + 3, joint);
          kit.quad(g, -SIDE, SIDE, Math.max(from, END - 1400), z1, kit.ink('--cw-canvas'), 0.18);
        }
      };
    }
  };
})();

/* =============================================================================
   Cavendish Coworking, walked into on Paper Street. Ryan's call, 2026-11-04:
   round one of the rooms you can walk into, the house among them.

   IT IS THE HOUSE'S WORLD AND NOBODY ELSE'S (§58): Henry Cavendish's house in
   Bedford Square, green throughout, with a door onto each of our calls. EVERY
   DOOR IS SHUT AND NONE IS LOCKED: down both walls of the hall stands a
   Georgian six-panel door in mahogany, in a Coade stone case with a fanlight
   over it, a brass plate on it and a note pinned beside it. You can tell a
   room is in there without anybody opening anything; going in is yours to
   decide. Transparency does not mean an open floor plan, and if a door here
   is ever drawn open, the room has lost its argument.

   THE BLINDS ARE DOWN AND YOU CAN SEE THROUGH THEM: the light is daylight
   from the front windows at the end of the hall, through green transparent
   canvas, soft and even and faintly green on the floor. Between the two
   windows hangs the house's own page, full size once you stand at it.

   The fanlights carry no names: what is behind each door is said on the
   house's own page. Nothing moves. Every colour is one §58 declares, by name.
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
    s.appendChild(el('rect', { x: x + dw / 2 - 70, y: top + dh * 0.25 - 26, width: 140, height: 30, fill: 'var(--cw-plate)' }));
    s.appendChild(el('circle', { cx: x + dw - 40, cy: top + dh * 0.55, r: 12, fill: 'var(--cw-brass)' }));
    s.appendChild(el('rect', { x: x + dw + 80, y: top + 140, width: 110, height: 140, fill: 'var(--cw-card)' }));
    for (var y = top + 166; y < top + 260; y += 20) s.appendChild(el('rect', { x: x + dw + 96, y: y, width: 78, height: 5, fill: 'var(--cw-ink-2)' }));
    s.appendChild(el('circle', { cx: x + dw + 135, cy: top + 150, r: 6, fill: 'var(--cw-brass)' }));
  }

  // A wall of the hall: green paint above a dado, and shut doors along it.
  function hallWall(w, h, doors) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--cw-wall)' }));
    s.appendChild(el('rect', { x: 0, y: h - 300, width: w, height: 14, fill: 'var(--cw-stone)' }));
    s.appendChild(el('rect', { x: 0, y: h - 40, width: w, height: 40, fill: 'var(--cw-mahogany)' }));
    doors.forEach(function (x) { door(s, x, h); });
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

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['cavendish-coworking.html'] = {
    prefix: 'cw-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 960), sh = kit.H - 24;
      var END = 3200 + F;                       // the front wall, between the windows
      var eye = sh / 2, SIDE = 1000;
      var decor = [];
      var WH = Math.max(sh + 500, 1100);

      decor.push(kit.item(frontWall(3600, WH, sw, sh), { x: 0, z: END + 30, w: 3600, h: WH }));
      var page = kit.screen(kit.page, 'Cavendish Coworking’s own page, between the front windows');
      var hung = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'cw-walk-page' });
      var len = END + 30;
      [-1, 1].forEach(function (k) {
        var xs = [];
        for (var x = 300 + (k > 0 ? 400 : 0); x < len - 900; x += 1100) xs.push(x);
        var wall = kit.item(hallWall(len, WH, xs), { x: k * SIDE, z: len / 2, w: len, h: WH, turn: k < 0 ? kit.LEFT : kit.RIGHT });
        decor.push(wall);
      });

      var stops = [
        kit.stop({ name: 'inside the front door, the hall’s doors shut down both walls', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'halfway along the hall, between the shut doors, none of them locked', spot: { x: 0, z: (END - F) * 0.5 } }),
        kit.stop({ name: 'at the front windows, blinds down, with the house’s own page between them', spot: { x: 0, z: END - F }, link: page }, hung)
      ];

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

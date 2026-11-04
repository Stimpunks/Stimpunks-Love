/* =============================================================================
   Arlesglad Caverns, walked into on Paper Street. Ryan's call, 2026-11-04:
   round one of the rooms you can walk into, the caverns among them.

   IT IS THE CAVERNS' WORLD AND NOBODY ELSE'S (§62): rock nobody dug, under the
   street, reached by a lift or the stair beside it. THE LIGHT IS AT HAND HEIGHT
   AND FOLLOWS THE ROUTE: one strip along the handrail on each side of the
   passage, so the rock is lit in a band where the path goes and is black above
   and below it, and the light spills a little onto the floor along the walls.
   There is no sky, no lamp and no daylight from the top; THERE IS NO BROWN,
   because the greys are stone, and if they ever warm at the edges this has
   become the Latibulum with a handrail.

   You come down the passage between the rails to the lift and the stair,
   drawn the same size side by side, and between them the area's board, which
   is the caverns' own page, full size once you stand at it, sitting on the
   rail's band as every notice down here does. Off the passage, in turn, is a
   doorway in the rock for every level on the caverns' own panel, its key and
   its room lettered on a plate above it with the rail along its foot; a level
   with nothing open yet keeps a dashed edge and its words are never dimmed.
   They are written here by tools/make-paper-street.py between the ps:levels
   markers, never by hand. Nothing is down here because it was hidden or sent:
   down is a direction and not a verdict.

   Nothing moves. Every colour is one §62 declares, by name. It keeps nothing,
   sends nothing and fetches nothing; its page arrives through Paper Street's
   screen(). tools/make-paper-street.py holds each of those.
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

  // A wall of rock with the handrail along it at hand height: black above and
  // below, the band of lit stone round the rail, seams in the rock.
  function rockWall(w, h, rail) {
    var s = svg(w, h), y = h - rail;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--cav-rock)' }));
    s.appendChild(el('rect', { x: 0, y: y - 220, width: w, height: 300, fill: 'var(--cav-wall)' }));
    for (var x = 30, k = 0; x < w; x += 170, k++) {
      var a = y - 200 + (k * 41) % 120;
      s.appendChild(el('path', { fill: 'none', stroke: 'var(--cav-seam)', 'stroke-width': 5,
        d: 'M' + x + ' ' + a + ' l' + (40 + k % 3 * 20) + ' ' + (50 + k % 2 * 40) + ' l' + (-20 + k % 4 * 15) + ' 70' }));
    }
    s.appendChild(el('rect', { x: 0, y: y, width: w, height: 14, fill: 'var(--cav-rail)' }));
    s.appendChild(el('rect', { x: 0, y: y + 14, width: w, height: 8, fill: 'var(--cav-steel)' }));
    for (x = 60; x < w; x += 360) s.appendChild(el('rect', { x: x, y: y + 22, width: 10, height: rail - 22, fill: 'var(--cav-steel)' }));
    return s;
  }

  // The end of the passage: the lift on one side, the stair down on the
  // other, the same size, and the rail running across between them.
  function landing(w, h, gap, ph, rail) {
    var s = svg(w, h), m = w / 2, y = h - rail, dw = 460, dh = Math.min(ph + 80, h - 60);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--cav-rock)' }));
    s.appendChild(el('rect', { x: 0, y: y - 220, width: w, height: 300, fill: 'var(--cav-wall)' }));
    var lx = m - gap / 2 - 80 - dw, rx = m + gap / 2 + 80;
    // The lift: steel doors, shut, with a seam down the middle.
    s.appendChild(el('rect', { x: lx - 20, y: h - dh - 20, width: dw + 40, height: dh + 20, fill: 'var(--cav-seam)' }));
    s.appendChild(el('rect', { x: lx, y: h - dh, width: dw, height: dh, fill: 'var(--cav-steel)' }));
    s.appendChild(el('rect', { x: lx + dw / 2 - 3, y: h - dh, width: 6, height: dh, fill: 'var(--cav-rock)' }));
    // The stair: the same opening, steps going down away from you, each step's
    // nosing caught by the rail.
    s.appendChild(el('rect', { x: rx - 20, y: h - dh - 20, width: dw + 40, height: dh + 20, fill: 'var(--cav-seam)' }));
    s.appendChild(el('rect', { x: rx, y: h - dh, width: dw, height: dh, fill: 'var(--cav-rock)' }));
    for (var i = 0; i < 7; i++) {
      var sy = h - 40 - i * 46, inset = i * 26;
      s.appendChild(el('rect', { x: rx + inset, y: sy, width: dw - inset * 2, height: 8, fill: 'var(--cav-dim)', opacity: (1 - i * 0.12).toFixed(2) }));
    }
    s.appendChild(el('rect', { x: 0, y: y, width: w, height: 14, fill: 'var(--cav-rail)' }));
    s.appendChild(el('rect', { x: 0, y: y + 14, width: w, height: 8, fill: 'var(--cav-steel)' }));
    return s;
  }

  // A doorway in the rock off the passage: a plate over it lettered by
  // kit.door, the rail running along the plate's foot, and the opening black
  // because the light is at hand height and goes no further in.
  var PLATE = 150;
  function doorway(w, h, raising) {
    var s = svg(w, h), dw = w - 120;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: PLATE, fill: 'var(--cav-wall)' }));
    var edge = { x: 6, y: 6, width: w - 12, height: PLATE - 12, fill: 'none', stroke: 'var(--cav-seam)', 'stroke-width': 4 };
    if (raising) { edge.stroke = 'var(--cav-dim)'; edge['stroke-dasharray'] = '14 10'; }
    s.appendChild(el('rect', edge));
    s.appendChild(el('rect', { x: 0, y: PLATE, width: w, height: 10, fill: 'var(--cav-rail)' }));
    s.appendChild(el('path', { fill: 'var(--cav-seam)', d: 'M' + (w / 2 - dw / 2 - 18) + ' ' + h + ' L' + (w / 2 - dw / 2 - 18) + ' ' + (PLATE + 70) + ' Q' + (w / 2) + ' ' + (PLATE + 10) + ' ' + (w / 2 + dw / 2 + 18) + ' ' + (PLATE + 70) + ' L' + (w / 2 + dw / 2 + 18) + ' ' + h + ' Z' }));
    s.appendChild(el('path', { fill: 'var(--cav-rock)', d: 'M' + (w / 2 - dw / 2) + ' ' + h + ' L' + (w / 2 - dw / 2) + ' ' + (PLATE + 80) + ' Q' + (w / 2) + ' ' + (PLATE + 30) + ' ' + (w / 2 + dw / 2) + ' ' + (PLATE + 80) + ' L' + (w / 2 + dw / 2) + ' ' + h + ' Z' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['arlesglad-caverns.html'] = {
    prefix: 'cav-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 980), sh = kit.H - 24;
      var END = 3000 + F;                       // where the lift and the stair are
      var eye = sh / 2, SIDE = 520, RAIL = Math.round(eye * 0.6);
      var decor = [];
      var WH = Math.max(sh + 700, 1300), LEN = END - F * 1.6;

      decor.push(kit.item(landing(3600, WH, sw, sh, RAIL), { x: 0, z: END + 30, w: 3600, h: WH }));
      [-1, 1].forEach(function (side) {
        var len = LEN;
        decor.push(kit.item(rockWall(len, WH, RAIL), { x: side * SIDE, z: len / 2, w: len, h: WH, turn: side < 0 ? kit.LEFT : kit.RIGHT }));
      });

      var stops = [kit.stop({ name: 'at the top of the passage, the handrail lit either side of you', spot: { x: 0, z: 0 } })];
      // ps:levels:begin
      var LEVELS = [{"no": "B1", "name": "Big Steep Fermentables", "page": "big-steep-fermentables.html", "state": ""}, {"no": "B2", "name": "Mycelium Munchies", "page": "mycelium-munchies.html", "state": ""}, {"no": "B3", "name": "Glow Go Gee Gaws", "page": "glow-go-gee-gaws.html", "state": ""}, {"no": "B4", "name": "Buoyant Bodyminds", "page": null, "state": "raising"}, {"no": "B5", "name": "Stay Frosty", "page": "stay-frosty.html", "state": ""}];
      // ps:levels:end
      var DW = 440, DH = Math.round(eye + 140);
      var gap = (LEN - 1500) / Math.max(LEVELS.length - 1, 1);
      LEVELS.forEach(function (l, k) {
        var side = k % 2 ? 1 : -1;
        var it = kit.door(l.page, { art: doorway(DW, DH, l.state === 'raising'), no: l.no, name: l.name, label: 'cav-walk-sign', cls: 'cav-walk-door',
                                    x: side * (SIDE - 8), z: 1100 + k * gap, w: DW, h: DH, turn: side < 0 ? kit.LEFT : kit.RIGHT });
        decor.push(it);
        stops.push(kit.stop({ name: 'at the doorway to level ' + l.no + ', ' + l.name + (l.page ? '' : ', with nothing open behind it yet'), spot: kit.front(it), link: it.link }, it));
      });
      var page = kit.screen(kit.page, 'The caverns’ own page, on the board between the lift and the stair');
      var board = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'cav-walk-board' });
      stops.push(kit.stop({ name: 'at the board between the lift and the stair, with the caverns’ own page on it', spot: { x: 0, z: END - F }, link: page }, board));

      return {
        cls: 'cav-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The only light down here is the handrail’s. The caverns’ own page is on the board between the lift and the stair at the end of the passage.',
        // The passage is the rails' width; past its end it opens onto the
        // landing in front of the lift and the stair.
        bounds: function (cam) {
          var x = cam && cam.z > LEN ? 900 : SIDE - 180;
          return { x: [-x, x], z: [0, END - F] };
        },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--cav-rock'));
          var z0 = Math.max(from, 0), z1 = Math.min(to, END + 30);
          // The rail's light spilling onto the floor along both walls, and
          // nowhere else.
          var rail = kit.ink('--cav-rail'), z2 = Math.min(to, LEN);
          kit.quad(g, -SIDE, -SIDE + 160, z0, z2, rail, 0.08);
          kit.quad(g, SIDE - 160, SIDE, z0, z2, rail, 0.08);
          kit.quad(g, -SIDE, -SIDE + 60, z0, z2, rail, 0.08);
          kit.quad(g, SIDE - 60, SIDE, z0, z2, rail, 0.08);
          // And along the foot of the landing's wall, under its rail.
          kit.quad(g, -1800, 1800, Math.max(from, END - 140), Math.min(to, END + 30), rail, 0.1);
          // The path worn smooth down the middle, seams in the rock either side.
          var seam = kit.ink('--cav-seam');
          kit.quad(g, -200, 200, z0, z1, kit.ink('--cav-wall'));
          for (var z = Math.ceil(z0 / 260) * 260; z < z1; z += 260) kit.quad(g, -200, 200, z, z + 5, seam);
        }
      };
    }
  };
})();

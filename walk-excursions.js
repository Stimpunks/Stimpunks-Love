/* =============================================================================
   Excursions, walked into on Paper Street. Ryan's ask, 2026-11-05: every new
   room onto both streets.

   A VISITOR CENTRE'S LOBBY AFTER THE DOORS ARE LOCKED (§141), cut out of card.
   The far wall is one flat of the dark, and on it the only light left on: the
   backlit map of the area, lakes and woods and orange routes and no word on
   it. Beside it stands the wire rack of brochures, each lit along the edge
   turned to the map, and in front of the rack, on a stand of the rack's wire,
   the newest one, which is the way into Retail Therapy, Norah Hobbs's, a room
   of its own behind this one. To the right is the desk with the yellow i,
   nobody behind it; on the left wall, the room's own page. The map's light
   lies across the terrazzo towards you.

   The Feed is the collision to watch: its light comes through a mask and only
   letters are lit; here the map glows whole and carries no word. NOTHING
   MOVES. Every colour is one §141 declares, by name. It keeps nothing, sends
   nothing and fetches nothing; its page arrives through Paper Street's
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
  function hash(n) { var h = Math.sin(n * 12.9898) * 43758.5453; return h - Math.floor(h); }

  // The far wall, dark, and the map on it lit from behind: no word, no key.
  function wall(w, h, mx, my, mw, mh) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--exc-lobby)' }));
    s.appendChild(el('rect', { x: mx - 24, y: my - 24, width: mw + 48, height: mh + 48, fill: 'var(--exc-wire)' }));
    var g = el('g', {});
    g.appendChild(el('rect', { x: mx, y: my, width: mw, height: mh, fill: 'var(--exc-glow)' }));
    var u = mw / 1200, v = mh / 700;
    function P(x, y) { return (mx + x * u) + ' ' + (my + y * v); }
    g.appendChild(el('path', { d: 'M' + P(0, 360) + ' C' + P(130, 300) + ' ' + P(220, 420) + ' ' + P(360, 360) + ' C' + P(480, 310) + ' ' + P(560, 280) + ' ' + P(640, 320) + ' L' + P(660, 700) + ' L' + P(0, 700) + ' Z', fill: 'var(--exc-park)' }));
    g.appendChild(el('path', { d: 'M' + P(860, 700) + ' C' + P(870, 560) + ' ' + P(980, 520) + ' ' + P(1200, 500) + ' L' + P(1200, 700) + ' Z', fill: 'var(--exc-park)' }));
    g.appendChild(el('ellipse', { cx: mx + 940 * u, cy: my + 160 * v, rx: 150 * u, ry: 90 * v, fill: 'var(--exc-park)' }));
    for (var i = 0; i < 90; i++) {
      var tx = hash(i * 4.1) * 640, ty = 400 + hash(i * 9.7) * 280;
      g.appendChild(el('circle', { cx: mx + tx * u, cy: my + ty * v, r: 5 * u, fill: 'var(--exc-glow)', opacity: 0.35 }));
    }
    [[700, 210, 130, 70], [280, 180, 80, 42], [1080, 420, 46, 30]].forEach(function (e) {
      g.appendChild(el('ellipse', { cx: mx + e[0] * u, cy: my + e[1] * v, rx: e[2] * u, ry: e[3] * v, fill: 'var(--exc-water)' }));
    });
    g.appendChild(el('path', { d: 'M' + P(700, 270) + ' C' + P(760, 380) + ' ' + P(840, 420) + ' ' + P(860, 700), fill: 'none', stroke: 'var(--exc-water)', 'stroke-width': 14 * u, 'stroke-linecap': 'round' }));
    g.appendChild(el('path', { d: 'M' + P(60, 600) + ' C' + P(200, 560) + ' ' + P(280, 330) + ' ' + P(450, 300) + ' C' + P(600, 280) + ' ' + P(620, 440) + ' ' + P(900, 420) + ' C' + P(1000, 410) + ' ' + P(1080, 330) + ' ' + P(1160, 320), fill: 'none', stroke: 'var(--exc-route)', 'stroke-width': 16 * u, 'stroke-linecap': 'round' }));
    g.appendChild(el('path', { d: 'M' + P(450, 300) + ' C' + P(470, 200) + ' ' + P(540, 120) + ' ' + P(620, 90), fill: 'none', stroke: 'var(--exc-route)', 'stroke-width': 10 * u, 'stroke-linecap': 'round' }));
    g.appendChild(el('path', { d: 'M' + P(900, 420) + ' C' + P(930, 330) + ' ' + P(960, 260) + ' ' + P(950, 170), fill: 'none', stroke: 'var(--exc-route)', 'stroke-width': 11 * u, 'stroke-linecap': 'round', 'stroke-dasharray': (4 * u) + ' ' + (26 * u) }));
    g.appendChild(el('circle', { cx: mx + 450 * u, cy: my + 300 * v, r: 24 * u, fill: 'var(--exc-lobby)' }));
    g.appendChild(el('circle', { cx: mx + 450 * u, cy: my + 300 * v, r: 11 * u, fill: 'var(--exc-sign)' }));
    s.appendChild(g);
    return s;
  }

  // A brochure: one paper, one cut, lit along the edge turned to the map,
  // printed in lines that say no word.
  // A cover (bare) keeps its middle clear for a name.
  function brochure(g, x, y, w, h, n, bare) {
    g.appendChild(el('rect', { x: x + w, y: y + 8, width: w * 0.16, height: h - 8, fill: 'var(--exc-floor)' }));
    g.appendChild(el('rect', { x: x, y: y, width: w, height: h, fill: 'var(--exc-paper)' }));
    g.appendChild(el('rect', { x: x, y: y, width: w * 0.06, height: h, fill: 'var(--exc-glow)' }));
    for (var k = 0; k < 5; k++) if (!bare || k === 0) g.appendChild(el('rect', { x: x + w * 0.18, y: y + h * (0.14 + k * 0.12), width: w * (0.66 - ((k + n) % 3) * 0.12), height: h * 0.025, fill: 'var(--exc-print-2)' }));
    g.appendChild(el('path', { d: 'M' + (x + w * 0.18) + ' ' + (y + h * 0.86) + ' q' + (w * 0.3) + ' ' + (-h * 0.06) + ' ' + (w * 0.66) + ' 0', fill: 'none', stroke: 'var(--exc-route)', 'stroke-width': h * 0.02, 'stroke-linecap': 'round' }));
  }

  // The wire rack, its pockets, and the brochures in them.
  function rack(w, h) {
    var s = svg(w, h), tiers = [0.08, 0.38, 0.68], bw = w * 0.24, bh = h * 0.26;
    var wire = el('g', { fill: 'none', stroke: 'var(--exc-wire)', 'stroke-width': 6, 'stroke-linecap': 'round' });
    wire.appendChild(el('path', { d: 'M6 0 V' + h + ' M' + (w - 6) + ' 0 V' + h }));
    for (var gx = 0; gx <= 8; gx++) wire.appendChild(el('path', { d: 'M' + (6 + gx * (w - 12) / 8) + ' 6 V' + (h - 20), 'stroke-width': 2 }));
    s.appendChild(wire);
    var g = el('g', {});
    tiers.forEach(function (t, ti) {
      for (var b = 0; b < 3; b++) {
        if (ti === 0 && b === 0) continue;
        brochure(g, 24 + b * (bw + w * 0.06), h * t, bw, bh, ti * 3 + b);
      }
    });
    s.appendChild(g);
    var lips = el('g', { fill: 'none', stroke: 'var(--exc-wire)', 'stroke-width': 7, 'stroke-linecap': 'round' });
    tiers.forEach(function (t) { lips.appendChild(el('path', { d: 'M6 ' + (h * t + bh * 0.7) + ' H' + (w - 6) })); });
    s.appendChild(lips);
    return s;
  }

  // The newest, taken out of the top pocket and stood on a stand of the
  // rack's wire: the way into the room it is a brochure for.
  function newest(w, h) {
    var s = svg(w, h), bh = h * 0.7;
    s.appendChild(el('path', { d: 'M' + (w / 2) + ' ' + bh + ' V' + h + ' M' + (w * 0.2) + ' ' + (h - 4) + ' H' + (w * 0.8), stroke: 'var(--exc-wire)', 'stroke-width': 10, 'stroke-linecap': 'round' }));
    var g = el('g', {});
    brochure(g, 0, 0, w * 0.86, bh, 1, true);
    s.appendChild(g);
    return s;
  }

  // The desk, unattended, and the yellow i over it on a pole.
  function desk(w, h) {
    var s = svg(w, h), top = h * 0.55;
    s.appendChild(el('rect', { x: w * 0.62, y: h * 0.18, width: 10, height: top - h * 0.18, fill: 'var(--exc-wire)' }));
    s.appendChild(el('rect', { x: w * 0.62 - 70, y: 0, width: 150, height: 150, fill: 'var(--exc-sign)' }));
    s.appendChild(el('circle', { cx: w * 0.62 + 5, cy: 38, r: 13, fill: 'var(--exc-lobby)' }));
    s.appendChild(el('rect', { x: w * 0.62 - 6, y: 62, width: 22, height: 64, fill: 'var(--exc-lobby)' }));
    s.appendChild(el('rect', { x: 0, y: top, width: w, height: 22, fill: 'var(--exc-wire)' }));
    s.appendChild(el('rect', { x: 14, y: top + 22, width: w - 28, height: h - top - 22, fill: 'var(--exc-floor)' }));
    return s;
  }

  // A side wall, dark, with a terrazzo skirting.
  function side(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--exc-lobby)' }));
    s.appendChild(el('rect', { x: 0, y: h - 40, width: w, height: 40, fill: 'var(--exc-floor)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['excursions.html'] = {
    prefix: 'exc-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 960), sh = kit.H - 24;
      var eye = sh / 2, END = 2400 + F, SIDE = 2000;
      var WH = sh + 900, WWALL = 4200;
      var MX = 600, MY = WH - 1060, MW = 1300, MH = 760;   // the map, on the wall's own drawing
      var decor = [];

      decor.push(kit.item(wall(WWALL, WH, MX, MY, MW, MH), { x: 0, z: END + 30, w: WWALL, h: WH }));
      [-1, 1].forEach(function (k) {
        decor.push(kit.item(side(END + 30, WH), { x: k * SIDE, z: (END + 30) / 2, w: END + 30, h: WH, turn: k < 0 ? kit.LEFT : kit.RIGHT }));
      });
      var rk = kit.item(rack(620, 640), { x: 420, z: END - 120, w: 620, h: 640 });
      decor.push(rk);
      // The way into the room behind this one, made before the page, so the
      // keyboard meets it first.
      var way = kit.door('retail-therapy.html', { art: newest(320, 600), no: 'The newest brochure', name: 'Retail Therapy', label: 'exc-walk-way', cls: 'exc-walk-door',
                                                  x: 980, z: END - 520, w: 320, h: 600 });
      decor.push(way);
      var dk = kit.item(desk(900, 560), { x: 1450, z: END - 1500, w: 900, h: 560, turn: kit.RIGHT });
      decor.push(dk);
      var page = kit.screen(kit.page, 'Excursions’ own page, on the wall of the lobby');
      var board = kit.item(page, { x: -SIDE + 20, z: END - 1300, w: sw, h: sh, cls: 'exc-walk-board', turn: kit.LEFT });
      var mapAt = { x: -WWALL / 2 + MX + MW / 2, z: END, y: MY, w: MW, h: MH };

      var stops = [
        kit.stop({ name: 'inside the locked doors, the map glowing on the far wall and the rack beside it', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'before the map, its lakes and woods and orange routes lit from behind', spot: { x: mapAt.x, z: END - F * 1.6 } }),
        kit.stop({ name: 'at the rack, every brochure lit along the edge turned to the map', spot: kit.front(rk, 1100) }, rk),
        kit.stop({ name: 'at the newest brochure, Retail Therapy, Norah Hobbs’s', spot: kit.front(way, 900), link: way.link }, way),
        kit.stop({ name: 'at the desk with the yellow i, nobody behind it tonight', spot: kit.front(dk, 1100) }, dk),
        kit.stop({ name: 'at the left wall, with the room’s own page', spot: kit.front(board), link: page }, board)
      ];
      return {
        cls: 'exc-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The only light is the map on the far wall; the rack of brochures stands beside it, the newest on a stand, and the room’s own page is on the left wall.',
        bounds: function () { return { x: [-SIDE + 300, SIDE - 300], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--exc-floor'));
          // Terrazzo: chips of stone set in the floor, and the strips between
          // the pours.
          var chips = [kit.ink('--exc-wire'), kit.ink('--exc-ink-2'), kit.ink('--exc-lobby')];
          for (var i = 0; i < 260; i++) {
            var cx = -SIDE + hash(i * 1.7) * SIDE * 2, cz = hash(i * 3.1 + 5) * (END + 30);
            if (cz < from || cz > to) continue;
            kit.oval(g, cx, cz, 10 + hash(i * 7.3) * 14, 7 + hash(i) * 10, chips[i % 3], 0.8);
          }
          var strip = kit.ink('--exc-wire'), z0 = Math.max(from, 0), z1 = Math.min(to, END + 30);
          for (var z = Math.ceil(z0 / 700) * 700; z < z1; z += 700) kit.quad(g, -SIDE, SIDE, z, z + 5, strip, 0.5);
          // The map's light, lying across the floor towards you and to the right.
          kit.quad(g, mapAt.x - MW / 2, mapAt.x + MW / 2 + 900, Math.max(from, END - 1800), Math.min(to, END + 30), kit.ink('--exc-glow'), 0.1);
        }
      };
    }
  };
})();

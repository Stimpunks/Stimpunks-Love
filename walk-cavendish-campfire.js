/* =============================================================================
   The Campfire, walked into on Paper Street. Ryan's call, 2026-11-04: round
   one of the rooms you can walk into, the Campfire behind Cavendish
   Coworking's door among them.

   IT IS THE CAMPFIRE'S WORLD AND NOBODY ELSE'S (§75): a fire in a clearing, at
   night, with a ring of logs round it, for small groups working on something
   together or watching and listening together; the campfire is David
   Thornburg's name for the place where you learn from somebody by listening.
   THE LIGHT COMES FROM THE MIDDLE OF THE ROOM, AT GROUND HEIGHT, and no other
   room is lit from its own centre: the ground is lit in a pool round the fire
   and every shadow on it points outward, away from the fire; the logs and the
   trunks are lit on the side facing in; and past the ring there is only the
   black of the trees. The room's own page stands on the far side of the fire,
   lit from it, full size once you go round to it.

   It shares nothing with the house it is behind: Cavendish Coworking is green
   Georgian daylight through blinds and shut doors, and this is a clearing at
   night. The fire is drawn and stands still; NOTHING FLICKERS at any setting.
   Every colour is one §75 declares, by name. It keeps nothing, sends nothing
   and fetches nothing; its page arrives through Paper Street's screen().
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

  // The fire: logs crossed in the ember bed and the flames standing up out of
  // them, drawn once and still. Two of these, crossed, make it from any side.
  function fire(w, h) {
    var s = svg(w, h), m = w / 2, base = h - 30;
    s.appendChild(el('ellipse', { cx: m, cy: base, rx: w / 2 - 10, ry: 26, fill: 'var(--cf-ember)' }));
    s.appendChild(el('path', { fill: 'var(--cf-fire)', d: 'M' + (m - 140) + ' ' + base + ' Q' + (m - 150) + ' ' + (base - 200) + ' ' + (m - 60) + ' ' + (base - 300) + ' Q' + (m - 40) + ' ' + (base - 180) + ' ' + m + ' ' + (base - 420) + ' Q' + (m + 50) + ' ' + (base - 200) + ' ' + (m + 90) + ' ' + (base - 290) + ' Q' + (m + 160) + ' ' + (base - 160) + ' ' + (m + 140) + ' ' + base + ' Z' }));
    s.appendChild(el('path', { fill: 'var(--cf-flame)', d: 'M' + (m - 70) + ' ' + base + ' Q' + (m - 70) + ' ' + (base - 120) + ' ' + (m - 10) + ' ' + (base - 220) + ' Q' + (m + 10) + ' ' + (base - 120) + ' ' + (m + 40) + ' ' + (base - 170) + ' Q' + (m + 80) + ' ' + (base - 80) + ' ' + (m + 70) + ' ' + base + ' Z' }));
    s.appendChild(el('rect', { x: m - 170, y: base - 30, width: 340, height: 36, rx: 18, fill: 'var(--cf-log)' }));
    return s;
  }

  // A log to sit on, lit along its top from the fire.
  function log(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 10, width: w, height: h - 10, rx: (h - 10) / 2, fill: 'var(--cf-bark)' }));
    s.appendChild(el('rect', { x: 20, y: 10, width: w - 40, height: 14, rx: 7, fill: 'var(--cf-lit)' }));
    s.appendChild(el('circle', { cx: (h - 10) / 2, cy: h / 2 + 5, r: (h - 10) / 2 - 10, fill: 'var(--cf-log)' }));
    return s;
  }

  // The trees round the clearing: black, their trunks lit on the side facing
  // the fire, and nothing beyond them.
  function trees(w, h) {
    var s = svg(w, h);
    for (var x = 40, k = 0; x < w; x += 160 + (k * 37) % 120, k++) {
      var tw = 50 + (k * 19) % 40;
      s.appendChild(el('rect', { x: x, y: 0, width: tw, height: h, fill: 'var(--cf-log)' }));
      s.appendChild(el('rect', { x: x + (x < w / 2 ? tw - 12 : 0), y: h * 0.35, width: 12, height: h * 0.65, fill: 'var(--cf-lit)' }));
    }
    return s;
  }

  // Smoke going up from the fire into the dark, still.
  function smoke(w, h) {
    var s = svg(w, h), m = w / 2;
    s.appendChild(el('path', { fill: 'none', stroke: 'var(--cf-smoke)', 'stroke-width': 26, 'stroke-linecap': 'round', 'stroke-opacity': '0.6',
      d: 'M' + m + ' ' + h + ' C' + (m - 80) + ' ' + (h * 0.7) + ' ' + (m + 90) + ' ' + (h * 0.45) + ' ' + (m - 20) + ' ' + (h * 0.2) + ' S' + (m + 40) + ' 0 ' + (m + 10) + ' 0' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['cavendish-campfire.html'] = {
    prefix: 'cf-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 960), sh = kit.H - 24;
      var END = 3600 + F;                       // where the page stands, past the fire
      var eye = sh / 2, R = 720, C = END - F - R - 500;
      var decor = [];

      decor.push(kit.item(trees(6000, sh + 1200), { x: 0, z: END + 600, w: 6000, h: sh + 1200 }));
      [-1, 1].forEach(function (k) {
        decor.push(kit.item(trees(5000, sh + 1200), { x: k * 2200, z: C, w: 5000, h: sh + 1200, turn: k < 0 ? kit.LEFT : kit.RIGHT }));
      });
      var page = kit.screen(kit.page, 'The Campfire’s own page, on the far side of the fire');
      var stand = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'cf-walk-page' });

      var flames = kit.item(fire(520, 520), { x: 0, z: C, w: 520, h: 520 });
      decor.push(flames);
      decor.push(kit.item(fire(520, 520), { x: 0, z: C, w: 520, h: 520, turn: kit.LEFT }));
      decor.push(kit.item(smoke(260, 900), { x: 0, z: C, y: 480, w: 260, h: 900 }));
      // The ring of logs, each turned to the fire, with a gap on your side
      // and one on the far side, to walk through.
      [0.55, 1.05, 1.6, 2.1, -0.55, -1.05, -1.6, -2.1].forEach(function (a) {
        decor.push(kit.item(log(380, 120), { x: R * Math.sin(a), z: C - R * Math.cos(a), w: 380, h: 120, turn: a + Math.PI }));
      });

      var stops = [
        kit.stop({ name: 'at the edge of the clearing, the fire in the middle of it', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'by the fire, inside the ring of logs', spot: { x: 0, z: C - R * 0.55 } }),
        kit.stop({ name: 'on the far side of the fire, with the room’s own page lit by it', spot: { x: 0, z: END - F }, link: page }, stand)
      ];

      return {
        cls: 'cf-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The fire in the middle of the clearing is the only light. The room’s own page is on the far side of it.',
        bounds: function () { return { x: [-1100, 1100], z: [0, END - F] }; },
        // The night ground, the fire's pool of light on it, brightest at the
        // middle, and every log's shadow pointing out, away from the fire.
        ground: function (g, from, to) {
          kit.quad(g, -6000, 6000, from, to, kit.ink('--cf-night'));
          var lit = kit.ink('--cf-lit');
          [[1500, 0.25], [1150, 0.3], [800, 0.35], [480, 0.4]].forEach(function (p) { kit.oval(g, 0, C, p[0], p[0], lit, p[1]); });
          kit.oval(g, 0, C, 300, 300, kit.ink('--cf-ember'), 0.3);
          var dark = kit.ink('--cf-night');
          [0.55, 1.05, 1.6, 2.1, -0.55, -1.05, -1.6, -2.1].forEach(function (a) {
            var d = R + 260;
            kit.oval(g, d * Math.sin(a), C - d * Math.cos(a), 170, 170, dark, 0.7);
          });
        }
      };
    }
  };
})();

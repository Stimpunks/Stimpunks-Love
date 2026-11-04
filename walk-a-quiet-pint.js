/* =============================================================================
   A Quiet Pint, walked into on Paper Street. Ryan's call, 2026-11-04: round one
   of the rooms you can walk into, the pub among them.

   IT IS THE PUB'S WORLD AND NOBODY ELSE'S (§100): a cellar a few steps down
   from the street, made like McAnally's, wood all the way round under a low
   ceiling of beams. THE LIGHT IS THE STREET'S, PASSED ROUND BY THE MIRRORS:
   grey daylight comes in at the top of the end wall through small windows at
   the level of the pavement, and what reaches the floor has been in a mirror
   first, so it lies about the boards in patches, none the same shape and none
   in a row, a little green. Nothing in here is lit warm; no lamp is drawn and
   the stove is not drawn lit, which is what keeps the browns muted and this off
   The Den. The bar runs down the left wall, carved columns stand about the
   floor, none of them alike and none of them in a row, the player piano stands
   against the right wall, and the board at the far end carries the pub's own
   page, which you read and press as the page, full size once you stand at it.

   Both pours on the bar are one drawing, the pub's rule: nobody can tell from
   across the room which glass anybody has. Nothing moves, the fans included.
   Every colour is one §100 declares, by name. It keeps nothing, sends nothing
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
  function poly(pts, fill) {
    return el('path', { d: 'M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L') + ' Z', fill: fill });
  }

  // The end wall: dark panelling, beams across the top, the small windows at
  // the pavement's level with the grey street in them, and mirrors of their
  // own sizes at their own heights, each tipped its own way.
  function endWall(w, h, gap) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--aqp-wall)' }));
    for (var x = 0; x < w; x += 180) s.appendChild(el('rect', { x: x, y: 160, width: 6, height: h - 160, fill: 'var(--aqp-wall2)' }));
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: 70, fill: 'var(--aqp-ceil)' }));
    // Small windows at the top of the wall, each a different width.
    var wins = [[180, 110], [520, 90], [860, 130], [w - 960, 100], [w - 600, 120], [w - 280, 90]];
    wins.forEach(function (v) {
      s.appendChild(el('rect', { x: v[0] - 8, y: 82, width: v[1] + 16, height: 76, fill: 'var(--aqp-beam)' }));
      s.appendChild(el('rect', { x: v[0], y: 88, width: v[1], height: 64, fill: 'var(--aqp-street)' }));
      s.appendChild(el('rect', { x: v[0], y: 136, width: v[1], height: 16, fill: 'var(--aqp-kerb)' }));
    });
    // Mirrors either side of the board, none the same.
    var m = w / 2, side = gap / 2 + 120;
    [[-side - 260, 300, 200, 280, -0.05], [-side - 40, 420, 150, 210, 0.07], [side + 30, 330, 230, 190, 0.04], [side + 320, 460, 140, 260, -0.08]].forEach(function (q) {
      var cx = m + q[0] + q[2] / 2, cy = q[1] + q[3] / 2, a = q[4];
      var c = Math.cos(a), sn = Math.sin(a);
      var at = function (dx, dy) { return [cx + dx * c - dy * sn, cy + dx * sn + dy * c]; };
      var hw = q[2] / 2, hh = q[3] / 2;
      s.appendChild(poly([at(-hw - 14, -hh - 14), at(hw + 14, -hh - 14), at(hw + 14, hh + 14), at(-hw - 14, hh + 14)], 'var(--aqp-carve)'));
      s.appendChild(poly([at(-hw, -hh), at(hw, -hh), at(hw, hh), at(-hw, hh)], 'var(--aqp-glass)'));
      s.appendChild(poly([at(-hw + 20, -hh + 20), at(-hw + 50, -hh + 20), at(hw - 40, hh - 20), at(hw - 70, hh - 20)], 'var(--aqp-sheen)'));
    });
    return s;
  }

  // A carved column, its own height of carving and its own capital.
  function column(w, h, turns) {
    var s = svg(w, h), cx = w / 2, sw = w * 0.42;
    s.appendChild(el('rect', { x: cx - w / 2, y: 0, width: w, height: 60, fill: 'var(--aqp-beam2)' }));
    s.appendChild(el('rect', { x: cx - sw / 2, y: 60, width: sw, height: h - 120, fill: 'var(--aqp-col)' }));
    var step = (h - 220) / turns;
    for (var k = 0; k < turns; k++) {
      var y = 120 + k * step;
      s.appendChild(el('path', { fill: 'none', stroke: 'var(--aqp-carve)', 'stroke-width': 10,
        d: 'M' + (cx - sw / 2) + ' ' + y + ' Q' + cx + ' ' + (y + step * 0.6) + ' ' + (cx + sw / 2) + ' ' + (y + step * 0.2) }));
      s.appendChild(el('path', { fill: 'none', stroke: 'var(--aqp-col2)', 'stroke-width': 6,
        d: 'M' + (cx - sw / 2) + ' ' + (y + 18) + ' Q' + cx + ' ' + (y + step * 0.6 + 18) + ' ' + (cx + sw / 2) + ' ' + (y + step * 0.2 + 18) }));
    }
    s.appendChild(el('rect', { x: cx - sw / 2 - 14, y: h - 60, width: sw + 28, height: 60, fill: 'var(--aqp-col2)' }));
    return s;
  }

  // The bar: a long front of panels, the top, and two glasses standing on it
  // that are one drawing, as every pair of pours in the pub is.
  function bar(w, h) {
    var s = svg(w, h + 120), top = 120;
    s.appendChild(el('rect', { x: 0, y: top, width: w, height: h, fill: 'var(--aqp-barfront)' }));
    for (var x = 30; x < w - 120; x += 210) s.appendChild(el('rect', { x: x, y: top + 70, width: 170, height: h - 120, fill: 'none', stroke: 'var(--aqp-grain)', 'stroke-width': 8 }));
    s.appendChild(el('rect', { x: -20, y: top, width: w + 40, height: 34, fill: 'var(--aqp-bartop)' }));
    s.appendChild(el('rect', { x: -20, y: top + 30, width: w + 40, height: 6, fill: 'var(--aqp-rim)' }));
    [w * 0.3, w * 0.36].forEach(function (gx, k) {
      s.appendChild(el('path', { fill: k ? 'var(--aqp-cider)' : 'var(--aqp-ale)', d: 'M' + (gx - 26) + ' ' + (top - 104) + ' L' + (gx + 26) + ' ' + (top - 104) + ' L' + (gx + 20) + ' ' + top + ' L' + (gx - 20) + ' ' + top + ' Z' }));
      s.appendChild(el('rect', { x: gx - 27, y: top - 116, width: 54, height: 16, rx: 6, fill: 'var(--aqp-froth)' }));
    });
    return s;
  }

  // The player piano against the wall: its case, the window where a roll would
  // turn, and its keys.
  function piano(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--aqp-piano)' }));
    s.appendChild(el('rect', { x: w * 0.18, y: h * 0.1, width: w * 0.64, height: h * 0.28, fill: 'var(--aqp-piano2)' }));
    s.appendChild(el('rect', { x: w * 0.24, y: h * 0.15, width: w * 0.52, height: h * 0.18, fill: 'var(--aqp-crumb)' }));
    for (var x = w * 0.26; x < w * 0.74; x += 22) s.appendChild(el('rect', { x: x, y: h * 0.17, width: 6, height: h * 0.14, fill: 'var(--aqp-mush)' }));
    s.appendChild(el('rect', { x: w * 0.04, y: h * 0.48, width: w * 0.92, height: h * 0.1, fill: 'var(--aqp-plate)' }));
    for (x = w * 0.04 + 18; x < w * 0.96 - 10; x += 26) {
      if (Math.floor(x / 26) % 7 !== 2 && Math.floor(x / 26) % 7 !== 6) s.appendChild(el('rect', { x: x, y: h * 0.48, width: 12, height: h * 0.06, fill: 'var(--aqp-iron)' }));
    }
    s.appendChild(el('rect', { x: w * 0.1, y: h * 0.62, width: w * 0.8, height: h * 0.3, fill: 'var(--aqp-piano2)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['a-quiet-pint.html'] = {
    prefix: 'aqp-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 980), sh = kit.H - 24;
      var END = 3400 + F;                       // where the board stands
      var eye = sh / 2, SIDE = 640;
      var decor = [];

      decor.push(kit.item(endWall(3600, sh + 520, sw), { x: 0, z: END + 30, w: 3600, h: sh + 520 }));
      var page = kit.screen(kit.page, 'A Quiet Pint’s own page, on the board at the far end');
      var board = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'aqp-walk-board' });

      // The bar down the left wall, facing across the room.
      var BL = 1800;
      var counter = kit.item(bar(BL, 380), { x: -SIDE, z: 1100 + BL / 2, w: BL, h: 500, turn: kit.LEFT });
      decor.push(counter);
      // Carved columns about the floor, none alike and none in a row.
      [[-260, 900, 150, 3], [330, 1500, 170, 4], [-120, 2350, 140, 5], [420, 2700, 160, 3]].forEach(function (c) {
        decor.push(kit.item(column(c[2], 760), { x: c[0], z: c[1], w: c[2], h: 760 }));
      });
      var keys = kit.item(piano(520, 520), { x: SIDE, z: 2500, w: 520, h: 520, turn: kit.RIGHT });
      decor.push(keys);

      var stops = [
        kit.stop({ name: 'at the foot of the steps down from the street', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the bar, where both pours stand in the same glass', spot: kit.front(counter, SIDE + 380) }, counter),
        kit.stop({ name: 'at the player piano against the wall', spot: kit.front(keys, SIDE + 420) }, keys),
        kit.stop({ name: 'at the board, with the pub’s own page on it', spot: { x: 0, z: END - F }, link: page }, board)
      ];

      return {
        cls: 'aqp-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Grey light from the street comes in at the top of the far wall; the pub’s own page is on the board there.',
        bounds: function () { return { x: [-SIDE + 260, SIDE - 260], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--aqp-floor'));
          var seam = kit.ink('--aqp-seam');
          for (var x = -1800; x <= 1800; x += 110) kit.quad(g, x - 2, x + 2, Math.max(from, 0), Math.min(to, END + 40), seam);
          // The street's light, out of the mirrors: patches, none the same
          // shape, none in a row.
          var light = kit.ink('--aqp-light');
          [[-120, 640, 150, 70], [210, 1180, 90, 120], [-330, 1720, 200, 60], [60, 2060, 120, 90],
           [300, 2480, 170, 80], [-200, 2900, 80, 130], [150, 3300, 140, 60]].forEach(function (p) {
            kit.oval(g, p[0], p[1], p[2], p[3], light, 0.12);
          });
        }
      };
    }
  };
})();

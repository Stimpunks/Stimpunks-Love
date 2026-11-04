/* =============================================================================
   Nature's Contribution, walked into on Paper Street. Ryan's ask, 2026-11-04:
   round one of the rest of the rooms, each its own world in card. On Cel
   Street it is the land past the Campgrounds' wood; on Paper Street it is
   reached by its address or the teleporter for now.

   IT IS THE AREA'S WORLD AND NOBODY ELSE'S (§104): land kept for balancing
   conservation, agriculture and renewable energy. You stand at the stile in a
   cloud's shadow, with a hedge either side of you and the fingerpost just
   over it, and the valley in front of you is in the sun: fields in their own
   colours, a barn, a row of panels, the ridge and the sky with its clouds
   beyond. The area's own page is on a board by the stile.

   THE LIGHT IS AN AFTERNOON UNDER BROKEN CLOUD, AND THE SHADOWS ON THE LAND ARE
   THE CLOUDS'. Nothing on the ground casts them; they lie across whole fields
   at once, soft-edged, and you are standing in one. Nothing is lit from the
   side (that is the Hermitage) and the green here is grass in shade, never
   spruce in the dark (that is the campgrounds). The fingerpost is a cast white
   arm with black letters, pointed at the end, and its arms are the page's to
   name: here they carry their lettering as marks, and the page says where
   each goes. Nothing moves at any setting. Every colour is one §104 declares,
   by name. It keeps nothing, sends nothing and fetches nothing; its page
   arrives through Paper Street's screen(). tools/make-paper-street.py holds
   each of those.
   ========================================================================== */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var FIELDS = ['--ncx-pasture', '--ncx-wheat', '--ncx-plough', '--ncx-meadow', '--ncx-corn'];

  function el(name, attrs) {
    var e = document.createElementNS(NS, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function svg(w, h) {
    return el('svg', { viewBox: '0 0 ' + w + ' ' + h, width: w, height: h, 'aria-hidden': 'true', focusable: 'false' });
  }

  // The far side of the valley: the sky high and low, clouds with their
  // undersides grey, and the ridge.
  function backdrop(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--ncx-sky-high)' }));
    s.appendChild(el('rect', { x: 0, y: h * 0.45, width: w, height: h * 0.55, fill: 'var(--ncx-sky)' }));
    [[0.2, 0.32, 300], [0.38, 0.2, 420], [0.62, 0.36, 340], [0.8, 0.24, 280]].forEach(function (c) {
      var cx = w * c[0], cy = h * c[1], r = c[2];
      s.appendChild(el('ellipse', { cx: cx, cy: cy + r * 0.18, rx: r * 1.1, ry: r * 0.28, fill: 'var(--ncx-cloud-under)' }));
      s.appendChild(el('ellipse', { cx: cx - r * 0.4, cy: cy, rx: r * 0.6, ry: r * 0.32, fill: 'var(--ncx-cloud)' }));
      s.appendChild(el('ellipse', { cx: cx + r * 0.3, cy: cy - r * 0.08, rx: r * 0.7, ry: r * 0.38, fill: 'var(--ncx-cloud)' }));
    });
    s.appendChild(el('path', { d: 'M0 ' + h + ' L0 ' + (h * 0.82) + ' Q' + w * 0.25 + ' ' + (h * 0.7) + ' ' + w * 0.5 + ' ' + (h * 0.8) + ' T' + w + ' ' + (h * 0.76) + ' L' + w + ' ' + h + ' Z', fill: 'var(--ncx-ridge)' }));
    return s;
  }

  // The hedge across the way with the stile in it: wooden steps and a bar.
  function hedge(w, h, gap) {
    var s = svg(w, h), m = w / 2;
    s.appendChild(el('path', { d: 'M0 ' + h + ' L0 ' + h * 0.3 + ' Q' + w * 0.1 + ' ' + h * 0.05 + ' ' + w * 0.2 + ' ' + h * 0.25 + ' T' + w * 0.4 + ' ' + h * 0.2 + ' L' + (m - gap / 2) + ' ' + h * 0.3 + ' V' + h + ' Z', fill: 'var(--ncx-hedge)' }));
    s.appendChild(el('path', { d: 'M' + w + ' ' + h + ' L' + w + ' ' + h * 0.28 + ' Q' + w * 0.9 + ' ' + h * 0.08 + ' ' + w * 0.8 + ' ' + h * 0.22 + ' T' + w * 0.6 + ' ' + h * 0.2 + ' L' + (m + gap / 2) + ' ' + h * 0.3 + ' V' + h + ' Z', fill: 'var(--ncx-hedge)' }));
    s.appendChild(el('rect', { x: m - gap / 2, y: h * 0.3, width: 14, height: h * 0.7, fill: 'var(--ncx-stile)' }));
    s.appendChild(el('rect', { x: m + gap / 2 - 14, y: h * 0.3, width: 14, height: h * 0.7, fill: 'var(--ncx-stile)' }));
    s.appendChild(el('rect', { x: m - gap / 2, y: h * 0.42, width: gap, height: 12, fill: 'var(--ncx-stile)' }));
    s.appendChild(el('rect', { x: m - gap / 2 + 10, y: h * 0.72, width: gap - 20, height: 16, fill: 'var(--ncx-stile)' }));
    return s;
  }

  // The fingerpost: a white post, its arms pointed at their ends, black marks
  // for the lettering the page itself gives.
  function fingerpost(w, h) {
    var s = svg(w, h), m = w / 2;
    s.appendChild(el('rect', { x: m - 9, y: 30, width: 18, height: h - 30, fill: 'var(--ncx-post)', stroke: 'var(--ncx-letter)', 'stroke-width': 2 }));
    [[60, 1], [130, -1], [200, 1], [270, -1]].forEach(function (a) {
      var y = a[0], dir = a[1], len = 150, x0 = m, x1 = m + dir * len;
      s.appendChild(el('path', { d: 'M' + x0 + ' ' + y + ' H' + (x1 - dir * 22) + ' L' + x1 + ' ' + (y + 17) + ' L' + (x1 - dir * 22) + ' ' + (y + 34) + ' H' + x0 + ' Z',
        fill: 'var(--ncx-post)', stroke: 'var(--ncx-letter)', 'stroke-width': 2 }));
      for (var k = 0; k < 5; k++) s.appendChild(el('rect', { x: x0 + dir * (18 + k * 20) - (dir < 0 ? 14 : 0), y: y + 12, width: 14, height: 10, fill: 'var(--ncx-letter)' }));
    });
    return s;
  }

  // A barn across the valley, and a row of panels in front of it.
  function barn(w, h) {
    var s = svg(w, h);
    s.appendChild(el('path', { d: 'M20 ' + h + ' V' + h * 0.42 + ' L' + w * 0.4 + ' ' + h * 0.08 + ' L' + (w * 0.8 - 20) + ' ' + h * 0.42 + ' V' + h + ' Z', fill: 'var(--ncx-barn)' }));
    s.appendChild(el('path', { d: 'M0 ' + h * 0.46 + ' L' + w * 0.4 + ' ' + h * 0.04 + ' L' + w * 0.8 + ' ' + h * 0.46, fill: 'none', stroke: 'var(--ncx-roof)', 'stroke-width': 16 }));
    s.appendChild(el('rect', { x: w * 0.3, y: h * 0.6, width: w * 0.2, height: h * 0.4, fill: 'var(--ncx-barn-door)' }));
    for (var x = w * 0.5; x < w; x += 70) {
      s.appendChild(el('path', { d: 'M' + x + ' ' + (h - 50) + ' L' + (x + 60) + ' ' + (h - 80) + ' V' + (h - 50) + ' Z', fill: 'var(--ncx-pv)' }));
      s.appendChild(el('rect', { x: x + 28, y: h - 50, width: 4, height: 50, fill: 'var(--ncx-trunk)' }));
    }
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['natures-contribution.html'] = {
    prefix: 'ncx-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 820), sh = kit.H - 24;
      var STILE = 1500, FAR = 8000;
      var eye = sh / 2;
      var decor = [];

      decor.push(kit.item(backdrop(14000, 2400), { x: 0, z: FAR, w: 14000, h: 2400 }));
      decor.push(kit.item(barn(900, 420), { x: -1500, z: 5200, w: 900, h: 420 }));
      decor.push(kit.item(hedge(4400, 210, 220), { x: 0, z: STILE, w: 4400, h: 210 }));
      var post = kit.item(fingerpost(340, 420), { x: -320, z: STILE + 500, w: 340, h: 420 });
      decor.push(post);

      var page = kit.screen(kit.page, 'Nature’s Contribution’s own page, on a board by the stile');
      var board = kit.item(page, { x: 900, z: STILE - 40, w: sw, h: sh, cls: 'ncx-walk-board' });

      var stops = [
        kit.stop({ name: 'short of the stile, standing in a cloud’s shadow, the valley in the sun ahead', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the board by the stile, with the area’s own page on it', spot: { x: 900, z: STILE - 40 - F }, link: page }, board),
        kit.stop({ name: 'over the stile at the fingerpost, its arms pointing every way into the land', spot: { x: -320, z: STILE + 500 - 620 } }),
        kit.stop({ name: 'out in the fields, where a cloud’s shadow lies across a whole field at once', spot: { x: 0, z: 3200 } })
      ];

      return {
        cls: 'ncx-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'The valley is in the sun beyond the stile; the area’s own page is on a board beside it.',
        bounds: function () { return { x: [-1400, 1400], z: [0, 4400] }; },
        ground: function (g, near, far) {
          kit.quad(g, -14000, 14000, near, far, kit.ink('--ncx-pasture'));
          // The fields beyond the hedge, each its own crop.
          for (var j = 0; j < 7; j++) {
            for (var i = -5; i < 5; i++) {
              var f = FIELDS[Math.abs(i * 3 + j * 7) % FIELDS.length];
              kit.quad(g, i * 1400 + 20, (i + 1) * 1400 - 20, STILE + 60 + j * 900, STILE + 60 + (j + 1) * 900 - 30, kit.ink(f));
            }
          }
          // The shade you are standing in, this side of the hedge.
          kit.quad(g, -14000, 14000, -400, STILE + 40, kit.ink('--ncx-shade'));
          // The clouds' shadows, whole fields wide, soft at the edge.
          var cs = kit.ink('--ncx-cloud-shadow');
          [[-1800, 3200, 1400, 700], [1600, 4800, 1800, 900], [-400, 6200, 2200, 800]].forEach(function (c) {
            kit.oval(g, c[0], c[1], c[2], c[3], cs, 0.18);
            kit.oval(g, c[0], c[1], c[2] * 0.8, c[3] * 0.8, cs, 0.18);
          });
        }
      };
    }
  };
})();

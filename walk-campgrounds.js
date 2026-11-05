/* =============================================================================
   The Campgrounds, walked into on Paper Street. Ryan's call, 2026-11-04: round
   one of the places you can walk into, the field among them.

   IT IS THE FIELD'S WORLD AND NOBODY ELSE'S (§13): an area, not a room, where
   the street runs out, a field past the treeline with pitches on it for the
   ones who would rather live on the edge of town and be left alone. COLD WHERE
   THE STREET IS BLACK AND THE YURT IS WARM: night-blue spruce, posts standing
   alone on bare ground with their signs routed into the wood in bone, lichen
   in the grass and the moon over the treeline. IT IS LIT BY NOTHING: the sky is
   still on it, everything is evenly dim, nothing casts anything, and you can
   see all the way to the trees. The board in the middle of the field carries
   the field's own page, the laminated notice of it, full size once you stand
   at it.

   NOTHING HERE MOVES AT ANY SETTING, MAX GLITTER included, because an area that
   exists for people who want quiet cannot have a loud setting and mean it. The
   pitches are their own worlds and are not drawn here; their posts are. Every
   colour is one the field declares, by name. It keeps nothing, sends nothing
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

  // The treeline: spruce after spruce, against the dusk.
  function treeline(w, h) {
    var s = svg(w, h);
    for (var x = -60, k = 0; x < w; x += 110 + (k * 29) % 70, k++) {
      var top = 30 + (k * 71) % 220, tw = 150 + (k * 23) % 90;
      s.appendChild(el('rect', { x: x - 8, y: h - 80, width: 16, height: 80, fill: 'var(--spruce)' }));
      for (var t = 0; t < 4; t++) {
        var ty = top + t * (h - 80 - top) / 4;
        s.appendChild(el('path', { fill: 'var(--bark)', d: 'M' + (x - tw / 2 * (0.5 + t * 0.18)) + ' ' + (ty + (h - 80 - top) / 3) + ' L' + x + ' ' + ty + ' L' + (x + tw / 2 * (0.5 + t * 0.18)) + ' ' + (ty + (h - 80 - top) / 3) + ' Z' }));
      }
    }
    return s;
  }

  // The moon over the trees.
  function moon(w) {
    var s = svg(w, w);
    s.appendChild(el('circle', { cx: w / 2, cy: w / 2, r: w / 2 - 4, fill: 'var(--moon)' }));
    s.appendChild(el('circle', { cx: w * 0.36, cy: w * 0.4, r: w * 0.08, fill: 'var(--lichen)' }));
    s.appendChild(el('circle', { cx: w * 0.62, cy: w * 0.62, r: w * 0.06, fill: 'var(--lichen)' }));
    return s;
  }

  // A marker post standing alone, its sign routed into the wood: a groove in
  // bone round the board, and the pitch's own number and name routed into it
  // (kit.door letters them over the board in the field's face). A pitch with
  // nothing behind it yet keeps a dashed groove; its words are never dimmed.
  var SIGN = 200;
  function post(w, h, raising) {
    var s = svg(w, h), m = w / 2;
    s.appendChild(el('rect', { x: m - 16, y: SIGN - 10, width: 32, height: h - SIGN + 10, fill: 'var(--bark)' }));
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: SIGN, rx: 10, fill: 'var(--bark)' }));
    var groove = { x: 12, y: 12, width: w - 24, height: SIGN - 24, rx: 6, fill: 'none', stroke: 'var(--bone)', 'stroke-width': 4 };
    if (raising) groove['stroke-dasharray'] = '14 10';
    s.appendChild(el('rect', groove));
    return s;
  }

  // The board in the middle of the field, on two legs, holding the page.
  function boardLegs(w, h, ph) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 50, y: 0, width: 36, height: h, fill: 'var(--bark)' }));
    s.appendChild(el('rect', { x: w - 86, y: 0, width: 36, height: h, fill: 'var(--bark)' }));
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: ph + 40, rx: 8, fill: 'var(--bark)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['campgrounds.html'] = {
    prefix: 'camp-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 940), sh = kit.H - 24;
      var END = 3000 + F;                       // where the board stands
      var eye = sh / 2, UP = 140;
      var decor = [];

      decor.push(kit.item(moon(560), { x: 1600, z: 9000, y: 1700, w: 560, h: 560 }));
      decor.push(kit.item(treeline(9000, 1300), { x: 0, z: 6000, w: 9000, h: 1300 }));
      decor.push(kit.item(boardLegs(sw + 80, sh + UP + 20, sh), { x: 0, z: END + 10, w: sw + 80, h: sh + UP + 20 }));
      // A post for every pitch on the field's own board, in the board's order,
      // written here by tools/make-paper-street.py, never by hand.
      // ps:pitches:begin
      var PITCHES = [{"no": "THE SUMMIT", "name": "The Emergent Future Worlds Meets Mountain Man", "page": "the-mountain-cabin.html", "state": "summit"}, {"no": "PITCH 01", "name": "The Faery Yurt", "page": "faery-yurt.html", "state": ""}, {"no": "PITCH 05", "name": "The Bough House", "page": "the-bough-house.html", "state": ""}, {"no": "PITCH 02", "name": "Swaying Sweetgrass", "page": "swaying-sweetgrass.html", "state": ""}, {"no": "PITCH 03", "name": "The Solarpunk Hermitage", "page": "solarpunk-hermitage.html", "state": ""}, {"no": "PITCH 04", "name": "Brew and Stew", "page": "brew-and-stew.html", "state": ""}, {"no": "PITCH 06", "name": "The Aerial Arbour", "page": "the-aerial-arbour.html", "state": ""}, {"no": "PITCH 07", "name": "Luis’s Burrow", "page": "luis-burrow.html", "state": ""}];
      // ps:pitches:end
      var posts = [], PW = 380, PH = 600;
      var stops = [kit.stop({ name: 'where the street runs out, at the edge of the field', spot: { x: 0, z: 0 } })];
      var step = (END - 900) / Math.max(PITCHES.length, 1);
      PITCHES.forEach(function (p, k) {
        var side = k % 2 ? 1 : -1;
        var it = kit.door(p.page, { art: post(PW, PH, p.state === 'raising'), no: p.no, name: p.name, label: 'camp-walk-sign', cls: 'camp-walk-post',
                                    x: side * (700 + (k % 3) * 160), z: 700 + k * step, w: PW, h: PH, turn: side < 0 ? kit.LEFT / 3 : kit.RIGHT / 3 });
        decor.push(it); posts.push(it);
        stops.push(kit.stop({ name: 'at the post for ' + p.no.toLowerCase() + ', ' + p.name + (p.page ? '' : ', with nothing pitched behind it yet'), spot: kit.front(it), link: it.link }, it));
      });
      // The board after the posts, so the keyboard meets them in the order you
      // walk past them.
      var page = kit.screen(kit.page, 'The Campgrounds’ own page, on the board in the field');
      var notice = kit.item(page, { x: 0, z: END, y: UP, w: sw, h: sh, cls: 'camp-walk-board' });
      stops.push(kit.stop({ name: 'at the board in the middle of the field, with the field’s own page on it', spot: kit.front(notice), link: page }, notice));
      // Where the one track through the wood leaves the field, over the stream:
      // the wood is not drawn, and the way through it comes out on the land.
      var track = kit.door('natures-contribution.html', { art: post(PW, PH, false), no: 'THE TRACK THROUGH THE WOOD', label: 'camp-walk-sign', cls: 'camp-walk-post',
                                                         x: -1300, z: END + 300, w: PW, h: PH, turn: kit.LEFT / 3 });
      decor.push(track);
      stops.push(kit.stop({ name: 'at the track post by the treeline, where the one way through the wood begins', spot: kit.front(track), link: track.link }, track));

      return {
        cls: 'camp-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'A cold field, lit by nothing, with the treeline at the far end. The field’s own page is on the board in the middle of it.',
        bounds: function () { return { x: [-1700, 1700], z: [0, END - 100] }; },
        // Bare ground under the night, tufts of grass in the field's moss and
        // lichen, the same every visit, and nothing lit.
        ground: function (g, from, to) {
          kit.quad(g, -6000, 6000, from, to, kit.ink('--spruce'));
          var moss = kit.ink('--moss'), lichen = kit.ink('--lichen');
          for (var z = Math.max(0, Math.ceil(from / 160) * 160); z < Math.min(to, 6000); z += 160) {
            for (var i = -14; i < 14; i++) {
              var k = Math.abs((Math.round(z / 160) * 73 + i * 41) % 11);
              if (k > 3) continue;
              var x = i * 220 + k * 47;
              kit.oval(g, x, z, 26 + k * 8, 10, k % 2 ? moss : lichen, 0.35);
            }
          }
        }
      };
    }
  };
})();

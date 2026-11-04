/* =============================================================================
   The Fishbowl, walked into on Paper Street. Ryan's ask, 2026-11-04: round 1 of
   the rooms still to be walked into. On Cel Street it opens off the Town Hall;
   here it is reached by its address or the teleporter for now.

   IT IS THE FISHBOWL'S WORLD AND NOBODY ELSE'S (§78): you are down in a glass
   bowl of water on a sunny sill, on its gravel. A fishbowl is a small circle
   that talks, a wide circle that listens, and one seat in the middle kept
   empty, and this is the object the format is named after: a ring of stones on
   the gravel with one gap in it, a wider ring of shells round the foot of the
   glass, and nothing in the middle. The goldfish is not going anywhere.

   THE LIGHT IS BENT: the sun comes in from the left, through the water, and the
   water focuses it into bright tangled lines on the gravel. No other room is
   lit by refraction. ITS PARENT, THE TOWN HALL, is a round stone hall in shade
   with one hard disc of sun; this is pale, wet, glass and bright, and the light
   in it is a tangle, not a disc. A round room off a round room, and that is
   all they share. If the lines ever go dark, it is the Garden in a bowl.

   THE ROOM'S OWN PAGE is through the glass at the far side of the bowl, where
   you would read through it. NOTHING MOVES AT ANY SETTING: real caustics
   shimmer, and these are drawn still. Every colour is one the room declares,
   by name. It keeps nothing, sends nothing and fetches nothing; its page
   arrives through Paper Street's screen(). tools/make-paper-street.py holds
   each of those.
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
  function seeded(n) {
    return function () {
      n = (n + 0x6D2B79F5) | 0;
      var t = Math.imul(n ^ (n >>> 15), 1 | n);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // One stone of the ring, round and smooth, a caustic line across its top.
  function stone(r, w, h) {
    var s = svg(w, h);
    s.appendChild(el('ellipse', { cx: w / 2, cy: h * 0.55, rx: w / 2 - 4, ry: h * 0.45 - 2, fill: 'var(--fb-stone)' }));
    s.appendChild(el('path', { d: 'M' + (w * 0.2) + ' ' + (h * 0.3) + ' q' + (w * 0.3) + ' ' + (-h * 0.12) + ' ' + (w * 0.6) + ' ' + (h * 0.05), fill: 'none', stroke: 'var(--fb-caustic)', 'stroke-width': 5, 'stroke-linecap': 'round' }));
    return s;
  }

  // The goldfish, side on, its tail fanned.
  function fish(w, h) {
    var s = svg(w, h);
    s.appendChild(el('path', { d: 'M' + (w * 0.72) + ' ' + (h / 2) + ' L' + w + ' ' + (h * 0.12) + ' L' + (w * 0.92) + ' ' + (h / 2) + ' L' + w + ' ' + (h * 0.88) + ' Z', fill: 'var(--fb-gold)' }));
    s.appendChild(el('ellipse', { cx: w * 0.42, cy: h / 2, rx: w * 0.34, ry: h * 0.32, fill: 'var(--fb-gold)' }));
    s.appendChild(el('circle', { cx: w * 0.2, cy: h * 0.44, r: h * 0.06, fill: 'var(--fb-ink)' }));
    s.appendChild(el('path', { d: 'M' + (w * 0.4) + ' ' + (h * 0.2) + ' q' + (w * 0.08) + ' ' + (-h * 0.16) + ' ' + (w * 0.18) + ' 0', fill: 'var(--fb-gold)' }));
    return s;
  }

  // The far side of the bowl: the curve of the glass, the sill beyond it in
  // the sun, and the bright lines thrown on the sill behind the bowl.
  function glass(w, h, sw, sh) {
    var s = svg(w, h), m = w / 2;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--fb-sill)' }));
    s.appendChild(el('path', { d: 'M0 0 Q' + m + ' ' + (h * 0.18) + ' ' + w + ' 0 V' + h + ' Q' + m + ' ' + (h * 0.86) + ' 0 ' + h + ' Z', fill: 'var(--fb-shallow)', 'fill-opacity': '0.7' }));
    for (var i = 0; i < 6; i++) {
      s.appendChild(el('path', { d: 'M' + (40 + i * 30) + ' 0 Q' + (100 + i * 40) + ' ' + (h / 2) + ' ' + (30 + i * 30) + ' ' + h, fill: 'none', stroke: 'var(--fb-glass)', 'stroke-width': 4 }));
      s.appendChild(el('path', { d: 'M' + (w - 40 - i * 30) + ' 0 Q' + (w - 100 - i * 40) + ' ' + (h / 2) + ' ' + (w - 30 - i * 30) + ' ' + h, fill: 'none', stroke: 'var(--fb-glass)', 'stroke-width': 4 }));
    }
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['town-hall-fishbowl.html'] = {
    prefix: 'fb-walk',
    build: function (kit) {
      var F = kit.F, r = seeded(78);
      var sw = Math.min(kit.W - 24, 940), sh = kit.H - 24;
      var C = 1700, RING = 620, SHELLS = 1250;  // the ring's middle, the ring of stones, the ring of shells
      var END = C + SHELLS + 300;               // the glass at the far side of the bowl
      var eye = sh / 2 + 120;
      var decor = [], stones = [];

      // The ring of stones, round the empty middle, with one gap in it, on the
      // side nearest you.
      for (var deg = 0; deg < 360; deg += 24) {
        if (deg > 160 && deg < 200) continue;
        var a = deg * Math.PI / 180, sw0 = 150 + r() * 60, sh0 = 90 + r() * 40;
        var st = kit.item(stone(r, sw0, sh0), { x: RING * Math.sin(a), z: C + RING * Math.cos(a), w: sw0, h: sh0 });
        decor.push(st); stones.push(st);
      }
      var goldfish = kit.item(fish(300, 170), { x: -520, z: 1100, w: 300, h: 170, y: eye + 40 });
      decor.push(goldfish);
      var GW = sw + 2400, GH = sh + 900;
      decor.push(kit.item(glass(GW, GH, sw, sh), { x: 0, z: END + 20, w: GW, h: GH }));

      var page = kit.screen(kit.page, 'The Fishbowl’s own page, through the glass at the far side of the bowl');
      var through = kit.item(page, { x: 0, z: END, w: sw, h: sh, y: 120, cls: 'fb-walk-glass' });

      var stops = [
        kit.stop({ name: 'down on the gravel inside the bowl, the bright lines lying all round you', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'in the gap in the ring of stones, the way into the small circle', spot: { x: 0, z: C - RING - F * 0.7 } }),
        kit.stop({ name: 'in the middle of the ring, where the one seat is kept empty', spot: { x: 0, z: C - F * 0.3 } }),
        kit.stop({ name: 'at the glass on the far side, with the room’s own page through it', spot: { x: 0, z: END - F }, link: page }, through)
      ];

      return {
        cls: 'fb-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'A ring of stones lies ahead with one gap in it, and the room’s own page is through the glass beyond.',
        bounds: function () { return { x: [-SHELLS + 200, SHELLS - 200], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--fb-gravel'));
          // The wide ring of shells round the foot of the glass.
          var shell = kit.ink('--fb-shell'), q = seeded(7);
          for (var deg = 0; deg < 360; deg += 9) {
            var a = deg * Math.PI / 180;
            kit.oval(g, SHELLS * Math.sin(a), C + SHELLS * Math.cos(a), 30 + q() * 20, 20, shell, 1);
          }
          // The bright tangled lines the water focuses onto the gravel: long
          // thin ones every way, crossing, and none of them dark.
          var light = kit.ink('--fb-caustic'), c = seeded(11);
          for (var i = 0; i < 90; i++) {
            var x = -1600 + c() * 3200, z = c() * (END + 200), along = c() < 0.5;
            kit.oval(g, x, z, along ? 90 + c() * 120 : 6, along ? 6 : 90 + c() * 120, light, 0.55);
          }
        }
      };
    }
  };
})();

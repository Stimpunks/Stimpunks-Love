/* =============================================================================
   The Outskirts, walked into on Paper Street: past the last streetlight, where
   the kerb gives up and becomes a verge. Ryan's ask, 2026-11-04: round 1 of the
   rooms still to be walked into.

   IT IS THE ROAD'S WORLD AND NOBODY ELSE'S (§34): a road seen from ON it, at
   eye level, at night, LIT BY HEADLIGHTS. Your own car is stopped behind you
   with its lights on, low and level and close, so every board has one bright
   face and no back, every post throws its shadow away down the road, and the
   road goes black a step past the beam. The light is yours and you have
   stopped, so it does not sweep. NOTHING IN IT IS BLUE: the only colours are
   the beam and the paint, bone, dead khaki and a rust red. It is not the
   campgrounds (a field lit by nothing, the sky on it) and not Danny the Street
   (a road from directly above under sodium, nothing standing up in it).

   THE BOARDS AT THE MOUTHS OF THE TURNINGS were painted once by whoever owned
   the premises and have been in the weeds since. Here they carry paint and no
   words: a sign is not the room it points at, and what each turning is, and
   where it goes, is on the room's own page, which stands on the last and
   biggest board at the far edge of the beam. NOBODY WAS SENT OUT HERE: what is
   down these turnings is here because this is where it is.

   NOTHING MOVES. Every colour is one the room declares, by name. It keeps
   nothing, sends nothing and fetches nothing; its page arrives through Paper
   Street's screen(). tools/make-paper-street.py holds each of those.
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

  // Weeds at the foot of a post, khaki in the beam.
  function weeds(s, r, x0, x1, foot, tall) {
    for (var x = x0; x < x1; x += 10 + r() * 14) {
      var h = tall * (0.4 + r() * 0.6);
      s.appendChild(el('path', { d: 'M' + x + ' ' + foot + ' q' + ((r() - 0.5) * 30) + ' ' + (-h / 2) + ' ' + ((r() - 0.5) * 20) + ' ' + (-h), fill: 'none', stroke: 'var(--osk-weed)', 'stroke-width': 4 }));
    }
  }

  // A painted board on two posts at the mouth of a turning: its face lit by
  // the beam, paint on it in rust, and the weeds grown up round its legs.
  function board(r, w, h) {
    var s = svg(w, h), bh = h * 0.55;
    [w * 0.2, w * 0.8].forEach(function (x) { s.appendChild(el('rect', { x: x - 10, y: bh - 20, width: 20, height: h - bh + 20, fill: 'var(--osk-dim)' })); });
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: bh, fill: 'var(--osk-beam)' }));
    s.appendChild(el('rect', { x: 14, y: 14, width: w - 28, height: bh - 28, fill: 'none', stroke: 'var(--osk-rust)', 'stroke-width': 8 }));
    // The paint where the words were: blocks of rust and khaki, flaked.
    for (var y = 44; y < bh - 40; y += 46) {
      var len = (w - 90) * (0.5 + r() * 0.5);
      s.appendChild(el('rect', { x: 45, y: y, width: len, height: 24, fill: y < 60 ? 'var(--osk-rust)' : 'var(--osk-weed)' }));
    }
    s.appendChild(el('path', { d: 'M' + (w - 70) + ' ' + (bh / 2 - 30) + ' l40 30 l-40 30 Z', fill: 'var(--osk-rust)' }));
    weeds(s, r, 0, w, h, h * 0.4);
    return s;
  }

  // The last and biggest board, on its own legs, round the room's own page.
  function bigBoard(r, w, h, sw, sh) {
    var s = svg(w, h), m = w / 2;
    [m - sw / 2 + 60, m + sw / 2 - 60].forEach(function (x) { s.appendChild(el('rect', { x: x - 16, y: 80, width: 32, height: h - 80, fill: 'var(--osk-dim)' })); });
    s.appendChild(el('rect', { x: m - sw / 2 - 40, y: 20, width: sw + 80, height: sh + 80, fill: 'var(--osk-beam)' }));
    s.appendChild(el('rect', { x: m - sw / 2 - 26, y: 34, width: sw + 52, height: sh + 52, fill: 'none', stroke: 'var(--osk-rust)', 'stroke-width': 10 }));
    weeds(s, r, 0, w, h, 220);
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['the-outskirts.html'] = {
    prefix: 'osk-walk',
    build: function (kit) {
      var F = kit.F, r = seeded(34);
      var sw = Math.min(kit.W - 24, 940), sh = kit.H - 24;
      var END = 2400 + F;                      // the last board, at the far edge of the beam
      var ROAD = 420;                          // half the road's width
      var eye = sh / 2 + 160;
      var decor = [], posts = [];

      [[-1, 500], [1, 900], [-1, 1400], [1, 1850], [-1, 2350], [1, 2800]].forEach(function (b) {
        var bw = 300 + r() * 90, bh = 400 + r() * 90;
        var it = kit.item(board(r, bw, bh), { x: b[0] * (ROAD + 260), z: b[1], w: bw, h: bh, turn: b[0] < 0 ? kit.LEFT / 3 : kit.RIGHT / 3 });
        decor.push(it); posts.push(it);
      });
      var BW = sw + 300, BH = sh + 220;
      decor.push(kit.item(bigBoard(r, BW, BH, sw, sh), { x: 0, z: END + 20, w: BW, h: BH }));

      var page = kit.screen(kit.page, 'The Outskirts’ own page, on the last board at the far edge of the headlights');
      var last = kit.item(page, { x: 0, z: END, w: sw, h: sh, y: BH - sh - 60, cls: 'osk-walk-board' });

      var stops = [
        kit.stop({ name: 'on the road past the last streetlight, your own headlights behind you', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the verge, by a painted board at the mouth of a turning', spot: kit.front(posts[0], 800) }, posts[0]),
        kit.stop({ name: 'further down the road, where the beam begins to give out', spot: { x: 0, z: 1600 } }),
        kit.stop({ name: 'at the last board, with the room’s own page and every turning on it', spot: { x: 0, z: END - F }, link: page }, last)
      ];

      return {
        cls: 'osk-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Your headlights are on behind you. The room’s own page is on the last board, where the beam gives out.',
        bounds: function () { return { x: [-ROAD - 100, ROAD + 100], z: [0, END - F] }; },
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--osk-night'));
          // The road, and the beam lying on it: bright near you, giving out
          // further down, and black a step past its edges.
          var beam = kit.ink('--osk-beam');
          kit.quad(g, -ROAD, ROAD, from, to, kit.ink('--osk-board'));
          for (var z = 0; z < END + 200; z += 200) {
            var a = Math.max(0, 0.3 - z / (END * 3.4));
            kit.quad(g, -ROAD - 200 + z * 0.05, ROAD + 200 - z * 0.05, z, z + 200, beam, a);
          }
          // The verge's weeds, khaki in the beam.
          kit.quad(g, -ROAD - 400, -ROAD, from, to, kit.ink('--osk-weed'), 0.25);
          kit.quad(g, ROAD, ROAD + 400, from, to, kit.ink('--osk-weed'), 0.25);
          // Every post's shadow, thrown away down the road from the beam.
          var night = kit.ink('--osk-night');
          posts.forEach(function (p) { kit.quad(g, p.x - 20, p.x + 20, p.z, p.z + 600, night, 0.9); });
          // The centre line, painted once, worn.
          var line = kit.ink('--osk-dim');
          for (z = 100; z < END; z += 260) kit.quad(g, -6, 6, z, z + 110, line, 0.6);
        }
      };
    }
  };
})();

/* =============================================================================
   The Zine Table's Issue #2, One Root, Two Rainbows, walked into on Paper
   Street. Ryan's ask, 2026-11-04: round 1 of the rooms you can walk into, down
   the rest of the street. On Cel Street it opens off the Zine Table; here it
   is reached by its own address or the teleporter, for now.

   IT IS THE ZINE TABLE'S WORLD (§7) AND ITS OWN SCENE: photocopier black on
   white paper and the ransom note's yellow, red and cyan, the Zine Table's
   colours by name and no others. The table room is the copy room by day, its
   sheets scattered at their angles; this is THE ISSUE ITSELF, one sheet, and
   you are standing on it. The sheet is the floor, cut with scissors along its
   edges, lying on the black of two in the morning ("photocopied at 2am", the
   page says) under the one hard light of the copier's lamp, so nothing on it
   is warm. Its parts stand up off it as cut-outs where they lie on the page:
   the ransom headline and the pull-quote, lifted off the page as they are and
   never retyped, the ransom letters turning or not by the page's own rule.
   The scissors stand open at the edge where they stopped, a paperclip holds
   the corner, and at the head of the sheet the issue's own page stands up as
   the paper it is.

   NOTHING MOVES. It keeps nothing, sends nothing and fetches nothing; its page
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
  function sized(s, w, h) { s.setAttribute('width', w); s.setAttribute('height', h); return s; }

  // The scissors, standing open where they stopped at the edge of the sheet:
  // two black blades and the red handles.
  function scissors(w, h) {
    var s = svg(w, h), px = w * 0.5, py = h * 0.58;
    s.appendChild(el('polygon', { points: px + ',' + py + ' ' + (w * 0.08) + ',4 ' + (w * 0.16) + ',0 ' + (px + 10) + ',' + (py - 4), fill: 'var(--ink)' }));
    s.appendChild(el('polygon', { points: px + ',' + py + ' ' + (w * 0.92) + ',4 ' + (w * 0.84) + ',0 ' + (px - 10) + ',' + (py - 4), fill: 'var(--ink)' }));
    s.appendChild(el('circle', { cx: px, cy: py, r: 12, fill: 'var(--paper)', stroke: 'var(--ink)', 'stroke-width': 5 }));
    s.appendChild(el('ellipse', { cx: w * 0.3, cy: h * 0.84, rx: w * 0.14, ry: h * 0.12, fill: 'none', stroke: 'var(--red)', 'stroke-width': 16 }));
    s.appendChild(el('ellipse', { cx: w * 0.7, cy: h * 0.84, rx: w * 0.14, ry: h * 0.12, fill: 'none', stroke: 'var(--red)', 'stroke-width': 16 }));
    s.appendChild(el('path', { d: 'M' + (px - 6) + ' ' + (py + 6) + ' L' + (w * 0.38) + ' ' + (h * 0.74) + ' M' + (px + 6) + ' ' + (py + 6) + ' L' + (w * 0.62) + ' ' + (h * 0.74), stroke: 'var(--red)', 'stroke-width': 14 }));
    return s;
  }

  // The paperclip, standing up off the corner it holds.
  function paperclip(w, h) {
    var s = svg(w, h), r = w * 0.3;
    s.appendChild(el('path', { d: 'M' + (w * 0.62) + ' ' + (h * 0.3) + ' V' + (h - r - 10) + ' A' + r + ' ' + r + ' 0 0 1 ' + (w * 0.62 - 2 * r) + ' ' + (h - r - 10) +
      ' V' + (r + 10) + ' A' + (r * 0.8) + ' ' + (r * 0.8) + ' 0 0 1 ' + (w * 0.62 - 2 * r + 1.6 * r) + ' ' + (r + 10) + ' V' + (h * 0.7),
      fill: 'none', stroke: 'var(--ink)', 'stroke-width': 14, 'stroke-linecap': 'round' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['zine-issue-2.html'] = {
    prefix: 'zine-issue-walk',
    from: 'zine-table.html',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 980), sh = kit.H - 24;
      var HALF = 1200;                          // the sheet, from its middle to each edge
      var END = 2300 + F;                       // the head of the sheet, where the page stands up
      var SHEET = END + 260;
      var eye = sh / 2, k = eye / 520;
      var decor = [];
      var put = function (s, w, h, o) {
        o.w = w * k; o.h = h * k; o.y = (o.y || 0) * k;
        return kit.item(sized(s, o.w, o.h), o);
      };

      var page = kit.screen(kit.page, 'The issue’s own page, standing up at the head of the sheet');
      // The cut-outs off the page, where they lie on it: the ransom headline
      // and the pull-quote, each a cut piece of the sheet standing up.
      var ransom = kit.lift(page, '.ransom', { x: -420, z: 1300, w: 560, turn: 0.18, cls: 'zine-issue-walk-cut' });
      var quote = kit.lift(page, '.pullquote', { x: 520, z: 1900, w: 520, turn: -0.2, cls: 'zine-issue-walk-cut' });
      decor.push(put(scissors(420, 560), 420, 560, { x: HALF - 60, z: 900, turn: kit.RIGHT * 0.5 }));
      decor.push(put(paperclip(120, 340), 120, 340, { x: -HALF + 80, z: SHEET - 120 }));
      var stood = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'zine-issue-walk-sheet' });

      var stops = [
        kit.stop({ name: 'at the foot of the sheet, the black of two in the morning all round it', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'at the ransom headline, cut out and standing up off the sheet', spot: kit.front(ransom, 900) }, ransom),
        kit.stop({ name: 'at the pull-quote, cut out with its collar on', spot: kit.front(quote, 900) }, quote),
        kit.stop({ name: 'at the head of the sheet, with the issue’s own page standing up as the paper it is', spot: { x: 0, z: END - F }, link: page }, stood)
      ];

      return {
        cls: 'zine-issue-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'You are standing on the issue itself; its own page stands up at the head of the sheet.',
        bounds: function () { return { x: [-HALF + 120, HALF - 120], z: [0, END - F] }; },
        ground: function (g, from, to) {
          var ink = kit.ink('--ink'), paper = kit.ink('--paper');
          kit.quad(g, -6000, 6000, from, to, ink);
          var z0 = Math.max(from, -300), z1 = Math.min(to, SHEET);
          if (z1 <= z0) return;
          kit.quad(g, -HALF, HALF, z0, z1, paper);
          // The scissors' cut along both edges: not quite straight, a nick
          // wherever a new snip began.
          for (var z = Math.ceil(z0 / 140) * 140; z < z1; z += 140) {
            var nick = 10 + (Math.abs(Math.sin(z * 0.37)) * 26);
            kit.quad(g, -HALF - nick, -HALF, z, z + 70, paper);
            kit.quad(g, HALF, HALF + nick * 0.8, z + 50, z + 130, paper);
          }
          // Two columns of typewriter lines down the sheet, the page's grain.
          for (var y = Math.ceil(z0 / 46) * 46; y < z1 - 300; y += 46) {
            var a = Math.abs(Math.sin(y * 0.11)), b = Math.abs(Math.cos(y * 0.07));
            kit.quad(g, -HALF + 120, -HALF + 120 + 800 * (0.6 + a * 0.4), y, y + 10, ink, 0.55);
            kit.quad(g, 120, 120 + 820 * (0.55 + b * 0.45), y, y + 10, ink, 0.55);
          }
          // A ransom block or two lying flat on the sheet, in the note's colours.
          kit.quad(g, -300, -60, 600, 700, kit.ink('--yellow'));
          kit.quad(g, 260, 420, 2500, 2580, kit.ink('--cyan'));
          kit.quad(g, -900, -760, 2200, 2290, kit.ink('--red'));
        }
      };
    }
  };
})();

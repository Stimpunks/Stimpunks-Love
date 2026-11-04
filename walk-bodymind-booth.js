/* =============================================================================
   The Bodymind Booth, walked into on Paper Street. Ryan's call, 2026-11-04:
   round one of the rooms you can walk into, the booth among them.

   IT IS THE BOOTH'S WORLD AND NOBODY ELSE'S (§113): a photo booth with no
   camera in it. You pull the curtain back and step in: the back of the booth
   is tangerine corduroy in soft wide folds, a steel stool stands in front of
   it, and on the curtain hangs the booth's own page in a frame of cream enamel,
   which you read and press as the page, full size once you stand at it.

   THE LIGHT IS TWO STRIP LIGHTS, ONE EITHER SIDE, A HAND'S WIDTH AWAY, behind
   frosted panels, and NO FLASH, because a booth's flash is the strobe the
   street refuses. Two lights that close put a bright edge on both sides of
   everything and leave the middle a shade darker, and nothing throws a shadow
   you can see, so nothing here casts one on the floor. NO BODY IS DRAWN: the
   booth hands nobody a body, and the frame on the curtain holds the page,
   not a figure. Nothing moves. Every colour is one §113 declares, by name. It
   keeps nothing, sends nothing and fetches nothing; its page arrives through
   Paper Street's screen(). tools/make-paper-street.py holds each of those.
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

  // The curtain at the back: corduroy in wide soft folds, each fold lit at
  // both edges by the two strip lights, and its wales running up it.
  function curtain(w, h) {
    var s = svg(w, h), fold = 160;
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--bmb-curtain)' }));
    for (var x = 0; x < w; x += fold) {
      s.appendChild(el('rect', { x: x + fold * 0.35, y: 0, width: fold * 0.3, height: h, fill: 'var(--bmb-pleat)' }));
      s.appendChild(el('rect', { x: x + fold * 0.44, y: 0, width: fold * 0.12, height: h, fill: 'var(--bmb-shade)' }));
      for (var wx = x + 10; wx < x + fold; wx += 22) s.appendChild(el('rect', { x: wx, y: 0, width: 3, height: h, fill: 'var(--bmb-shade)', 'fill-opacity': '0.25' }));
    }
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: 40, fill: 'var(--bmb-steel)' }));
    return s;
  }

  // A side of the booth: enamel, a frosted panel at hand's width, and the
  // strip light behind it, the same white on both sides.
  function side(w, h) {
    var s = svg(w, h);
    s.appendChild(el('rect', { x: 0, y: 0, width: w, height: h, fill: 'var(--bmb-chrome)' }));
    s.appendChild(el('rect', { x: w * 0.4, y: h * 0.08, width: w * 0.2, height: h * 0.78, rx: 30, fill: 'var(--bmb-steel)' }));
    s.appendChild(el('rect', { x: w * 0.415, y: h * 0.11, width: w * 0.17, height: h * 0.72, rx: 24, fill: 'var(--bmb-lamp)' }));
    s.appendChild(el('rect', { x: 0, y: h - 60, width: w, height: 60, fill: 'var(--bmb-steel)' }));
    return s;
  }

  // The stool: a round steel seat on one column and a ring for your feet.
  function stool(w, h) {
    var s = svg(w, h), m = w / 2;
    s.appendChild(el('rect', { x: m - 14, y: 50, width: 28, height: h - 70, fill: 'var(--bmb-steel)' }));
    s.appendChild(el('rect', { x: m - w / 2 + 10, y: 20, width: w - 20, height: 44, rx: 22, fill: 'var(--bmb-chrome)' }));
    s.appendChild(el('rect', { x: m - w / 2 + 10, y: 20, width: w - 20, height: 44, rx: 22, fill: 'none', stroke: 'var(--bmb-steel)', 'stroke-width': 6 }));
    s.appendChild(el('ellipse', { cx: m, cy: h - 150, rx: w * 0.36, ry: 14, fill: 'none', stroke: 'var(--bmb-steel)', 'stroke-width': 10 }));
    s.appendChild(el('rect', { x: m - w * 0.4, y: h - 22, width: w * 0.8, height: 22, rx: 10, fill: 'var(--bmb-steel)' }));
    return s;
  }

  window.lovePaperRooms = window.lovePaperRooms || {};
  window.lovePaperRooms['bodymind-booth.html'] = {
    prefix: 'bmb-walk',
    build: function (kit) {
      var F = kit.F;
      var sw = Math.min(kit.W - 24, 940), sh = kit.H - 24;
      var END = 1300 + F;                       // where the curtain hangs
      var eye = sh / 2, SIDE = sw / 2 + 240;
      var decor = [];
      var CH = sh + 400;

      decor.push(kit.item(curtain(SIDE * 2 + 200, CH), { x: 0, z: END + 30, w: SIDE * 2 + 200, h: CH }));
      var page = kit.screen(kit.page, 'The Bodymind Booth’s own page, framed on the curtain');
      var framed = kit.item(page, { x: 0, z: END, w: sw, h: sh, cls: 'bmb-walk-frame' });
      [-1, 1].forEach(function (k) {
        var len = END + 30;
        decor.push(kit.item(side(len, CH), { x: k * SIDE, z: len / 2, w: len, h: CH, turn: k < 0 ? kit.LEFT : kit.RIGHT }));
      });
      var seat = kit.item(stool(300, 420), { x: 330, z: END - F * 1.5, w: 300, h: 420 });
      decor.push(seat);

      var stops = [
        kit.stop({ name: 'with the curtain pulled back, stepping in', spot: { x: 0, z: 0 } }),
        kit.stop({ name: 'by the stool, between the two strip lights', spot: { x: 0, z: (END - F) * 0.45 } }),
        kit.stop({ name: 'at the curtain, with the booth’s own page framed on it', spot: { x: 0, z: END - F }, link: page }, framed)
      ];

      return {
        cls: 'bmb-walk',
        eye: eye,
        horizon: 0.5,
        start: { x: 0, z: 0 },
        stops: stops,
        decor: decor,
        arrive: 'Two strip lights, one either side of you, and no flash. The booth’s own page is framed on the curtain.',
        bounds: function () { return { x: [-SIDE + 260, SIDE - 260], z: [0, END - F] }; },
        // A floor of the curtain's shade, a bright line down each side where
        // the strip lights reach it, and no shadow anywhere.
        ground: function (g, from, to) {
          kit.quad(g, -4000, 4000, from, to, kit.ink('--bmb-shade'));
          var lamp = kit.ink('--bmb-lamp'), z0 = Math.max(from, 0), z1 = Math.min(to, END + 30);
          kit.quad(g, -SIDE, -SIDE + 200, z0, z1, lamp, 0.22);
          kit.quad(g, SIDE - 200, SIDE, z0, z1, lamp, 0.22);
        }
      };
    }
  };
})();

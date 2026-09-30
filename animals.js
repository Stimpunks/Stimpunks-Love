/* =============================================================================
   The animals, drawn: every cat and dog on the street, in the shelters and in
   the CB's Pets tray. One file, so an animal cannot be drawn one way in the
   shelter it was rescued into and another in the tray of whoever adopted it.

   AN ANIMAL IS DRAWN FROM ITS KIND, ITS COAT AND ITS MARKINGS, and nothing
   else, in the ground it was found on: a cat in the torch's pool, a dog on the
   snow with a blue shadow under it. Every one is outlined in a dark line,
   because a white cat vanishes in torchlight and a white dog in snow. Nothing
   is rarer, nothing is a prize, and nothing moves.

   The colours are the rooms' own, from love.css's :root, and custom properties
   inherit into the radio's shadow root, so the tray draws in the same inks.
   tools/make-rescue.py refuses a coat or a marking the server can hand out
   that this file cannot draw.
   ============================================================================= */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';

  function el(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  function add(svg, tag, attrs) { svg.appendChild(el(tag, attrs)); }

  /* ── Cats ──────────────────────────────────────────────────────────────── */
  var CAT_COATS = {
    black:       { base: 'black' },
    ginger:      { base: 'ginger' },
    grey:        { base: 'grey' },
    white:       { base: 'white' },
    cream:       { base: 'cream' },
    tabby:       { base: 'tabby', stripes: true },
    greytabby:   { base: 'greytabby', stripes: true },
    tortie:      { base: 'black', patches: ['ginger', 'ginger'] },
    calico:      { base: 'white', patches: ['ginger', 'black'] },
    tuxedo:      { base: 'black', bib: true, socks: true },
    gingerwhite: { base: 'ginger', belly: true },
    bluecream:   { base: 'blue', patches: ['cream', 'cream'] },
  };
  var CAT_MARKS = { socks: 1, bib: 1, kink: 1, tip: 1, three: 1, oneeye: 1, long: 1, plain: 1 };
  function cc(k) { return 'var(--rac-coat-' + k + ')'; }

  function drawCat(c, cls) {
    var look = CAT_COATS[c.coat] || CAT_COATS.grey;
    var mark = CAT_MARKS[c.mark] ? c.mark : 'plain';
    var fill = cc(look.base);
    var line = { stroke: 'var(--rac-night)', 'stroke-width': '2.5', 'stroke-linejoin': 'round' };
    var svg = el('svg', { 'class': cls || 'rac-cat', viewBox: '0 0 200 170', 'aria-hidden': 'true', focusable: 'false' });
    add(svg, 'ellipse', { cx: 100, cy: 94, rx: 97, ry: 74, fill: 'var(--rac-beam)', stroke: 'var(--rac-fall)', 'stroke-width': 3 });
    var tail = mark === 'kink' ? 'M136 136 Q168 128 160 104 L170 92' : 'M136 136 Q172 128 158 92';
    add(svg, 'path', { d: tail, fill: 'none', stroke: 'var(--rac-night)', 'stroke-width': 14, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    add(svg, 'path', { d: tail, fill: 'none', stroke: fill, 'stroke-width': 9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    if (mark === 'long') add(svg, 'ellipse', { cx: 100, cy: 118, rx: 50, ry: 43, fill: fill, stroke: 'var(--rac-night)', 'stroke-width': 2.5, 'stroke-dasharray': '4 3' });
    add(svg, 'ellipse', Object.assign({ cx: 100, cy: 118, rx: 42, ry: 36, fill: fill }, line));
    if (look.belly || look.bib || mark === 'bib') add(svg, 'ellipse', { cx: 100, cy: look.belly ? 122 : 106, rx: look.belly ? 22 : 14, ry: look.belly ? 22 : 16, fill: cc('white') });
    if (look.patches) {
      add(svg, 'ellipse', { cx: 82, cy: 116, rx: 15, ry: 11, fill: cc(look.patches[0]) });
      add(svg, 'ellipse', { cx: 118, cy: 128, rx: 13, ry: 9, fill: cc(look.patches[1]) });
    }
    if (look.stripes) {
      ['M72 104 Q80 110 76 120', 'M128 104 Q120 110 124 120', 'M70 124 Q80 128 76 138', 'M130 124 Q120 128 124 138'].forEach(function (d) {
        add(svg, 'path', { d: d, fill: 'none', stroke: 'var(--rac-stripe)', 'stroke-width': 4, 'stroke-linecap': 'round' });
      });
    }
    (mark === 'three' ? [96] : [86, 106]).forEach(function (x) {
      add(svg, 'rect', Object.assign({ x: x, y: 128, width: 9, height: 26, rx: 3, fill: fill }, line));
      if (look.socks || mark === 'socks') add(svg, 'rect', { x: x + 1.2, y: 145, width: 6.6, height: 8, rx: 2, fill: cc('white') });
    });
    var left = mark === 'tip' ? '74,52 76,32 86,30 94,46' : '74,52 80,24 94,46';
    [left, '106,46 120,24 126,52'].forEach(function (pts) { add(svg, 'polygon', Object.assign({ points: pts, fill: fill }, line)); });
    add(svg, 'circle', Object.assign({ cx: 100, cy: 70, r: 28, fill: fill }, line));
    if (look.patches) add(svg, 'ellipse', { cx: 112, cy: 60, rx: 10, ry: 8, fill: cc(look.patches[0]) });
    if (look.stripes) {
      ['M92 46 L94 56', 'M100 44 L100 55', 'M108 46 L106 56'].forEach(function (d) {
        add(svg, 'path', { d: d, stroke: 'var(--rac-stripe)', 'stroke-width': 3.5, 'stroke-linecap': 'round' });
      });
    }
    [[89, true], [111, mark !== 'oneeye']].forEach(function (e) {
      if (e[1]) {
        add(svg, 'ellipse', { cx: e[0], cy: 68, rx: 6, ry: 7, fill: 'var(--rac-eye)', stroke: 'var(--rac-night)', 'stroke-width': 1.5 });
        add(svg, 'ellipse', { cx: e[0], cy: 68, rx: 1.6, ry: 5, fill: 'var(--rac-night)' });
      } else {
        add(svg, 'path', { d: 'M' + (e[0] - 6) + ' 69 Q' + e[0] + ' 72 ' + (e[0] + 6) + ' 69', fill: 'none', stroke: 'var(--rac-night)', 'stroke-width': 2, 'stroke-linecap': 'round' });
      }
    });
    add(svg, 'polygon', { points: '96,78 104,78 100,83', fill: 'var(--rac-night)' });
    return svg;
  }

  /* ── Dogs ──────────────────────────────────────────────────────────────── */
  var DOG_COATS = {
    black:     { base: 'black' },
    brown:     { base: 'brown' },
    golden:    { base: 'golden' },
    white:     { base: 'white' },
    cream:     { base: 'cream' },
    grey:      { base: 'grey' },
    brindle:   { base: 'brown', stripes: true },
    blacktan:  { base: 'black', muzzle: 'tan', paws: 'tan' },
    merle:     { base: 'grey', patches: ['black', 'black'] },
    spotted:   { base: 'white', spots: true },
    piebald:   { base: 'white', patches: ['brown', 'brown'] },
    tricolour: { base: 'black', muzzle: 'white', chest: 'white', paws: 'tan' },
  };
  var DOG_MARKS = { socks: 1, blaze: 1, pointy: 1, patch: 1, three: 1, oneeye: 1, curly: 1, plain: 1 };
  function dc(k) { return 'var(--rad-coat-' + k + ')'; }

  function drawDog(d, cls) {
    var look = DOG_COATS[d.coat] || DOG_COATS.golden;
    var mark = DOG_MARKS[d.mark] ? d.mark : 'plain';
    var fill = dc(look.base);
    var line = { stroke: 'var(--rad-ink)', 'stroke-width': '2.5', 'stroke-linejoin': 'round' };
    var svg = el('svg', { 'class': cls || 'rad-dog', viewBox: '0 0 200 170', 'aria-hidden': 'true', focusable: 'false' });
    add(svg, 'rect', { x: 2, y: 2, width: 196, height: 166, rx: 18, fill: 'var(--rad-snow)', stroke: 'var(--rad-track)', 'stroke-width': 2 });
    // The shadow falls away to the right, and it is blue: lit only by the sky.
    add(svg, 'ellipse', { cx: 128, cy: 156, rx: 62, ry: 9, fill: 'var(--rad-shade)' });
    add(svg, 'path', { d: 'M138 132 Q170 116 162 88', fill: 'none', stroke: 'var(--rad-ink)', 'stroke-width': 13, 'stroke-linecap': 'round' });
    add(svg, 'path', { d: 'M138 132 Q170 116 162 88', fill: 'none', stroke: fill, 'stroke-width': 8, 'stroke-linecap': 'round' });
    if (mark === 'curly') add(svg, 'ellipse', { cx: 100, cy: 118, rx: 47, ry: 40, fill: fill, stroke: 'var(--rad-ink)', 'stroke-width': 2.5, 'stroke-dasharray': '3 3' });
    add(svg, 'ellipse', Object.assign({ cx: 100, cy: 118, rx: 40, ry: 34, fill: fill }, line));
    if (look.chest) add(svg, 'ellipse', { cx: 100, cy: 108, rx: 15, ry: 17, fill: dc(look.chest) });
    if (look.patches) {
      add(svg, 'ellipse', { cx: 84, cy: 112, rx: 14, ry: 11, fill: dc(look.patches[0]) });
      add(svg, 'ellipse', { cx: 118, cy: 128, rx: 12, ry: 9, fill: dc(look.patches[1]) });
    }
    if (look.spots) {
      [[80, 108], [116, 112], [96, 132], [124, 132], [86, 126]].forEach(function (p) { add(svg, 'circle', { cx: p[0], cy: p[1], r: 5, fill: dc('black') }); });
    }
    if (look.stripes) {
      ['M76 106 L82 124', 'M92 100 L96 122', 'M108 100 L104 122', 'M124 106 L118 124'].forEach(function (p) {
        add(svg, 'path', { d: p, stroke: 'var(--rad-stripe)', 'stroke-width': 3.5, 'stroke-linecap': 'round' });
      });
    }
    (mark === 'three' ? [96] : [85, 106]).forEach(function (x) {
      add(svg, 'rect', Object.assign({ x: x, y: 128, width: 10, height: 26, rx: 3, fill: fill }, line));
      var paw = look.paws || ((mark === 'socks') ? 'white' : null);
      if (paw) add(svg, 'rect', { x: x + 1.3, y: 145, width: 7.4, height: 8, rx: 2, fill: dc(paw) });
    });
    // Ears: floppy unless they stand straight up, then the head over them.
    if (mark === 'pointy') {
      ['72,56 78,26 92,44', '108,44 122,26 128,56'].forEach(function (pts) { add(svg, 'polygon', Object.assign({ points: pts, fill: fill }, line)); });
    }
    add(svg, 'circle', Object.assign({ cx: 100, cy: 66, r: 27, fill: fill }, line));
    if (mark !== 'pointy') {
      ['M76 50 Q62 56 66 84 Q72 90 80 78 Z', 'M124 50 Q138 56 134 84 Q128 90 120 78 Z'].forEach(function (p) {
        add(svg, 'path', Object.assign({ d: p, fill: look.base === 'white' && look.patches ? dc(look.patches[0]) : fill }, line));
      });
    }
    if (mark === 'blaze') add(svg, 'rect', { x: 96, y: 42, width: 8, height: 34, rx: 4, fill: dc('white') });
    if (mark === 'patch') add(svg, 'ellipse', { cx: 89, cy: 62, rx: 10, ry: 9, fill: look.base === 'black' ? dc('white') : 'var(--rad-stripe)' });
    add(svg, 'ellipse', Object.assign({ cx: 100, cy: 80, rx: 15, ry: 11, fill: look.muzzle ? dc(look.muzzle) : fill }, line));
    add(svg, 'ellipse', { cx: 100, cy: 75, rx: 5.5, ry: 4, fill: 'var(--rad-ink)' });
    add(svg, 'path', { d: 'M100 79 V84 M94 86 Q100 90 106 86', fill: 'none', stroke: 'var(--rad-ink)', 'stroke-width': 1.8, 'stroke-linecap': 'round' });
    [[89, true], [111, mark !== 'oneeye']].forEach(function (e) {
      if (e[1]) {
        add(svg, 'circle', { cx: e[0], cy: 62, r: 4.5, fill: 'var(--rad-ink)', stroke: look.base === 'black' ? 'var(--rad-snow)' : 'none', 'stroke-width': 1.2 });
        add(svg, 'circle', { cx: e[0] + 1.4, cy: 60.6, r: 1.3, fill: 'var(--rad-snow)' });
      } else {
        add(svg, 'path', { d: 'M' + (e[0] - 5) + ' 63 Q' + e[0] + ' 66 ' + (e[0] + 5) + ' 63', fill: 'none', stroke: look.base === 'black' ? 'var(--rad-snow)' : 'var(--rad-ink)', 'stroke-width': 2, 'stroke-linecap': 'round' });
      }
    });
    return svg;
  }

  function draw(a, cls) { return a && a.kind === 'dog' ? drawDog(a, cls) : drawCat(a, cls); }

  function about(a) {
    var w = a.words || {};
    return 'A ' + w.coat + ' ' + (a.kind === 'dog' ? 'dog' : 'cat') + ' ' + w.mark + ', found ' + w.place + '. They ' + w.mood + '.';
  }

  window.loveAnimals = { draw: draw, about: about };
}());

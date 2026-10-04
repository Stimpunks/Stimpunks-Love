/* =============================================================================
   The animals, drawn: every cat, dog and small animal on the street, in the shelters and in
   the CB's Profile. One file, so an animal cannot be drawn one way in the
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

  /* `bare` leaves out the torch's pool, for a room with a ground of its own:
     Pekoe and Purrs, the cat café, where the shelter's cats are seen in
     daylight rather than in the dark they were found in. The cat itself, its
     coat, markings and outline, is drawn exactly as it is here. */
  function drawCat(c, cls, bare) {
    var look = CAT_COATS[c.coat] || CAT_COATS.grey;
    var mark = CAT_MARKS[c.mark] ? c.mark : 'plain';
    var fill = cc(look.base);
    var line = { stroke: 'var(--rac-night)', 'stroke-width': '2.5', 'stroke-linejoin': 'round' };
    var svg = el('svg', { 'class': cls || 'rac-cat', viewBox: '0 0 200 170', 'aria-hidden': 'true', focusable: 'false' });
    if (!bare) add(svg, 'ellipse', { cx: 100, cy: 94, rx: 97, ry: 74, fill: 'var(--rac-beam)', stroke: 'var(--rac-fall)', 'stroke-width': 3 });
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

  /* A cat curled up asleep, seen from above: on somebody's lap at Pekoe and
     Purrs. The same coat, the same markings and the same outline as the cat
     sitting up, so the cat on your lap is the cat you picked up. The eyes are
     shut, a missing eye is a short straight lid rather than a closed one, the
     legs are tucked under, and a cat with three legs shows one front paw. */
  function drawCurled(c, cls) {
    var look = CAT_COATS[c.coat] || CAT_COATS.grey;
    var mark = CAT_MARKS[c.mark] ? c.mark : 'plain';
    var fill = cc(look.base);
    var line = { stroke: 'var(--rac-night)', 'stroke-width': '2.5', 'stroke-linejoin': 'round' };
    var svg = el('svg', { 'class': cls || 'rac-cat', viewBox: '0 0 200 170', 'aria-hidden': 'true', focusable: 'false' });
    if (mark === 'long') add(svg, 'ellipse', { cx: 110, cy: 90, rx: 82, ry: 66, fill: fill, stroke: 'var(--rac-night)', 'stroke-width': 2.5, 'stroke-dasharray': '4 3' });
    add(svg, 'ellipse', Object.assign({ cx: 110, cy: 90, rx: 74, ry: 58, fill: fill }, line));
    if (look.patches) {
      add(svg, 'ellipse', { cx: 132, cy: 66, rx: 24, ry: 17, fill: cc(look.patches[0]) });
      add(svg, 'ellipse', { cx: 150, cy: 110, rx: 19, ry: 13, fill: cc(look.patches[1]) });
    }
    if (look.stripes) {
      ['M118 38 Q130 58 118 80', 'M144 42 Q156 64 144 88', 'M166 58 Q176 80 166 104'].forEach(function (d) {
        add(svg, 'path', { d: d, fill: 'none', stroke: 'var(--rac-stripe)', 'stroke-width': 5, 'stroke-linecap': 'round' });
      });
    }
    if (look.belly || look.bib || mark === 'bib') add(svg, 'ellipse', { cx: 84, cy: 112, rx: look.belly ? 24 : 17, ry: look.belly ? 18 : 13, fill: cc('white') });
    var tail = mark === 'kink' ? 'M180 104 Q182 150 122 152 Q84 153 64 138 L56 126' : 'M180 104 Q182 150 122 152 Q84 153 60 136';
    add(svg, 'path', { d: tail, fill: 'none', stroke: 'var(--rac-night)', 'stroke-width': 19, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    add(svg, 'path', { d: tail, fill: 'none', stroke: fill, 'stroke-width': 14, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    (mark === 'three' ? [86] : [84, 100]).forEach(function (x) {
      var white = look.socks || mark === 'socks';
      add(svg, 'ellipse', Object.assign({ cx: x, cy: 128, rx: 8, ry: 6, fill: white ? cc('white') : fill }, line));
    });
    add(svg, 'circle', Object.assign({ cx: 64, cy: 92, r: 32, fill: fill }, line));
    var left = mark === 'tip' ? '36,74 38,56 46,50 58,64' : '36,74 40,48 58,64';
    [left, '66,60 80,40 90,64'].forEach(function (pts) { add(svg, 'polygon', Object.assign({ points: pts, fill: fill }, line)); });
    add(svg, 'circle', { cx: 64, cy: 92, r: 30.75, fill: fill });
    if (look.patches) add(svg, 'ellipse', { cx: 78, cy: 80, rx: 10, ry: 8, fill: cc(look.patches[0]) });
    if (look.stripes) {
      ['M56 66 L58 75', 'M64 64 L64 73', 'M72 66 L70 75'].forEach(function (d) {
        add(svg, 'path', { d: d, stroke: 'var(--rac-stripe)', 'stroke-width': 3.5, 'stroke-linecap': 'round' });
      });
    }
    [[52, true], [76, mark !== 'oneeye']].forEach(function (e) {
      if (e[1]) add(svg, 'path', { d: 'M' + (e[0] - 6) + ' 92 Q' + e[0] + ' 98 ' + (e[0] + 6) + ' 92', fill: 'none', stroke: 'var(--rac-night)', 'stroke-width': 2.4, 'stroke-linecap': 'round' });
      else add(svg, 'path', { d: 'M' + (e[0] - 5) + ' 94 H' + (e[0] + 5), stroke: 'var(--rac-night)', 'stroke-width': 2, 'stroke-linecap': 'round' });
    });
    add(svg, 'polygon', { points: '60,102 68,102 64,107', fill: 'var(--rac-night)' });
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

  /* ── Small animals ─────────────────────────────────────────────────────────
     Nine species, drawn side on and facing left, each standing in a strip of
     the daylight that comes down through the cracks between the floorboards:
     the strip is the only light in Rescue Small Animals, and an animal is only
     ever seen in it. The coat names the species; three coats each. */
  var SMALL_COATS = {
    'rabbit-brown':          { base: 'brown', sp: 'rabbit' },
    'rabbit-white':          { base: 'white', sp: 'rabbit' },
    'rabbit-dutch':          { base: 'white', sp: 'rabbit', patch: 'black' },
    'rat-hooded':            { base: 'white', sp: 'rat', patch: 'black' },
    'rat-brown':             { base: 'brown', sp: 'rat' },
    'rat-grey':              { base: 'grey', sp: 'rat' },
    'mouse-white':           { base: 'white', sp: 'mouse' },
    'mouse-brown':           { base: 'brown', sp: 'mouse' },
    'mouse-black':           { base: 'black', sp: 'mouse' },
    'hamster-golden':        { base: 'golden', sp: 'hamster', belly: 'cream' },
    'hamster-cream':         { base: 'cream', sp: 'hamster' },
    'hamster-grey':          { base: 'grey', sp: 'hamster', belly: 'white' },
    'gerbil-sandy':          { base: 'sandy', sp: 'gerbil', belly: 'white' },
    'gerbil-white':          { base: 'white', sp: 'gerbil' },
    'gerbil-black':          { base: 'black', sp: 'gerbil' },
    'guineapig-gingerwhite': { base: 'white', sp: 'guineapig', patch: 'ginger' },
    'guineapig-black':       { base: 'black', sp: 'guineapig' },
    'guineapig-brownwhite':  { base: 'white', sp: 'guineapig', patch: 'brown' },
    'chinchilla-grey':       { base: 'grey', sp: 'chinchilla', belly: 'white' },
    'chinchilla-beige':      { base: 'beige', sp: 'chinchilla', belly: 'white' },
    'chinchilla-black':      { base: 'black', sp: 'chinchilla', belly: 'grey' },
    'ferret-sable':          { base: 'sable', sp: 'ferret', face: 'cream' },
    'ferret-white':          { base: 'white', sp: 'ferret' },
    'ferret-cinnamon':       { base: 'cinnamon', sp: 'ferret', face: 'cream' },
    'hedgehog-brown':        { base: 'brown', sp: 'hedgehog' },
    'hedgehog-pale':         { base: 'pale', sp: 'hedgehog' },
    'hedgehog-dark':         { base: 'dark', sp: 'hedgehog' },
  };
  var SMALL_MARKS = { plain: 1, three: 1, oneeye: 1, patch: 1, nick: 1, whiskers: 1, round: 1 };
  function sc(k) { return 'var(--rsa-coat-' + k + ')'; }
  var DARK = { black: 1, sable: 1, dark: 1, brown: 1 };

  /* Each species draws its own body and says where its eye, ear, nose and feet
     are, so a marking is drawn the same way on all of them. `g` is the group
     the body goes in; `r` scales the body for an animal who is mostly round. */
  var SPECIES = {
    rabbit: function (g, f, look, r) {
      add(g, 'ellipse', Object.assign({ cx: 128, cy: 148, rx: 22, ry: 6, fill: f }, INK));
      add(g, 'ellipse', Object.assign({ cx: 112, cy: 118, rx: 44 * r, ry: 32 * r, fill: f }, INK));
      if (look.patch) add(g, 'ellipse', { cx: 130, cy: 114, rx: 24 * r, ry: 26 * r, fill: sc(look.patch) });
      add(g, 'circle', Object.assign({ cx: 156 + 8 * (r - 1) * 5, cy: 110, r: 9, fill: sc('white') }, INK));
      var ears = look.patch ? sc(look.patch) : f;
      add(g, 'ellipse', Object.assign({ cx: 60, cy: 60, rx: 7, ry: 24, fill: ears }, INK));
      add(g, 'ellipse', Object.assign({ cx: 76, cy: 62, rx: 7, ry: 23, fill: ears, transform: 'rotate(16 76 62)' }, INK));
      add(g, 'ellipse', { cx: 60, cy: 62, rx: 3, ry: 16, fill: 'var(--rsa-skin)' });
      add(g, 'circle', Object.assign({ cx: 64, cy: 100, r: 22, fill: f }, INK));
      if (look.patch) add(g, 'ellipse', { cx: 64, cy: 94, rx: 17, ry: 13, fill: sc(look.patch) });
      return { eye: [58, 96], ear: [60, 38], nose: [43, 104], feet: [[80, 147], [96, 148]] };
    },
    rat: function (g, f, look, r) {
      add(g, 'path', { d: 'M146 128 Q182 138 192 162', fill: 'none', stroke: 'var(--rsa-ink)', 'stroke-width': 8, 'stroke-linecap': 'round' });
      add(g, 'path', { d: 'M146 128 Q182 138 192 162', fill: 'none', stroke: 'var(--rsa-skin)', 'stroke-width': 4.5, 'stroke-linecap': 'round' });
      add(g, 'ellipse', Object.assign({ cx: 110, cy: 124, rx: 42 * r, ry: 24 * r, fill: f }, INK));
      if (look.patch) {
        add(g, 'ellipse', { cx: 86, cy: 118, rx: 17, ry: 19 * r, fill: sc(look.patch) });
        add(g, 'ellipse', { cx: 114, cy: 110 - 24 * (r - 1), rx: 30 * r, ry: 6, fill: sc(look.patch) });
      }
      add(g, 'circle', Object.assign({ cx: 74, cy: 100, r: 10, fill: 'var(--rsa-skin)' }, INK));
      add(g, 'ellipse', Object.assign({ cx: 66, cy: 118, rx: 24, ry: 15, fill: look.patch ? sc(look.patch) : f }, INK));
      add(g, 'ellipse', Object.assign({ cx: 45, cy: 122, rx: 10, ry: 8, fill: look.patch ? sc(look.patch) : f }, INK));
      return { eye: [60, 113], ear: [74, 90], nose: [36, 121], feet: [[84, 146], [100, 147], [124, 147], [138, 146]] };
    },
    mouse: function (g, f, look, r) {
      add(g, 'path', { d: 'M136 136 Q174 118 186 148', fill: 'none', stroke: 'var(--rsa-ink)', 'stroke-width': 6, 'stroke-linecap': 'round' });
      add(g, 'path', { d: 'M136 136 Q174 118 186 148', fill: 'none', stroke: 'var(--rsa-skin)', 'stroke-width': 3, 'stroke-linecap': 'round' });
      add(g, 'ellipse', Object.assign({ cx: 110, cy: 130, rx: 32 * r, ry: 21 * r, fill: f }, INK));
      add(g, 'circle', Object.assign({ cx: 86, cy: 104, r: 14, fill: f }, INK));
      add(g, 'circle', { cx: 86, cy: 104, r: 8, fill: 'var(--rsa-skin)' });
      add(g, 'ellipse', Object.assign({ cx: 76, cy: 124, rx: 19, ry: 14, fill: f }, INK));
      add(g, 'ellipse', Object.assign({ cx: 60, cy: 128, rx: 9, ry: 7, fill: f }, INK));
      return { eye: [70, 120], ear: [86, 90], nose: [52, 128], feet: [[90, 150], [104, 151], [124, 151]] };
    },
    hamster: function (g, f, look, r) {
      add(g, 'circle', Object.assign({ cx: 82, cy: 88, r: 8, fill: f }, INK));
      add(g, 'circle', Object.assign({ cx: 100, cy: 84, r: 8, fill: f }, INK));
      add(g, 'circle', { cx: 82, cy: 88, r: 4, fill: 'var(--rsa-skin)' });
      add(g, 'circle', { cx: 100, cy: 84, r: 4, fill: 'var(--rsa-skin)' });
      add(g, 'ellipse', Object.assign({ cx: 104, cy: 120, rx: 46 * r, ry: 36 * r, fill: f }, INK));
      if (look.belly) add(g, 'ellipse', { cx: 104, cy: 140, rx: 32 * r, ry: 14, fill: sc(look.belly) });
      add(g, 'ellipse', Object.assign({ cx: 70, cy: 126, rx: 17, ry: 14, fill: look.belly ? sc(look.belly) : f }, INK));
      return { eye: [72, 108], ear: [82, 80], nose: [54, 118], feet: [[80, 155], [96, 156], [118, 156]] };
    },
    gerbil: function (g, f, look, r) {
      add(g, 'path', { d: 'M140 128 Q176 132 184 104', fill: 'none', stroke: 'var(--rsa-ink)', 'stroke-width': 8, 'stroke-linecap': 'round' });
      add(g, 'path', { d: 'M140 128 Q176 132 184 104', fill: 'none', stroke: f, 'stroke-width': 4.5, 'stroke-linecap': 'round' });
      add(g, 'ellipse', Object.assign({ cx: 184, cy: 100, rx: 5, ry: 9, fill: f }, INK));
      add(g, 'ellipse', Object.assign({ cx: 118, cy: 147, rx: 20, ry: 5, fill: f }, INK));
      add(g, 'ellipse', Object.assign({ cx: 112, cy: 122, rx: 32 * r, ry: 24 * r, fill: f }, INK));
      if (look.belly) add(g, 'ellipse', { cx: 104, cy: 134, rx: 20 * r, ry: 10, fill: sc(look.belly) });
      add(g, 'ellipse', Object.assign({ cx: 90, cy: 92, rx: 6, ry: 9, fill: 'var(--rsa-skin)' }, INK));
      add(g, 'ellipse', Object.assign({ cx: 78, cy: 108, rx: 19, ry: 15, fill: f }, INK));
      add(g, 'ellipse', Object.assign({ cx: 62, cy: 112, rx: 8, ry: 7, fill: f }, INK));
      return { eye: [72, 103], ear: [90, 83], nose: [55, 112], feet: [[88, 145], [100, 146]] };
    },
    guineapig: function (g, f, look, r) {
      add(g, 'ellipse', Object.assign({ cx: 106, cy: 120, rx: 54 * r, ry: 32 * r, fill: f }, INK));
      if (look.patch) {
        add(g, 'ellipse', { cx: 134, cy: 116, rx: 24 * r, ry: 26 * r, fill: sc(look.patch) });
        add(g, 'ellipse', { cx: 70, cy: 110, rx: 15, ry: 13, fill: sc(look.patch) });
      }
      add(g, 'ellipse', Object.assign({ cx: 76, cy: 94, rx: 9, ry: 6, fill: 'var(--rsa-skin)', transform: 'rotate(-20 76 94)' }, INK));
      add(g, 'ellipse', Object.assign({ cx: 56, cy: 124, rx: 9, ry: 10, fill: look.patch ? sc('white') : f }, INK));
      return { eye: [66, 110], ear: [76, 88], nose: [48, 124], feet: [[74, 150], [90, 151], [124, 151], [140, 150]] };
    },
    chinchilla: function (g, f, look, r) {
      add(g, 'path', { d: 'M146 120 Q182 110 170 74', fill: 'none', stroke: 'var(--rsa-ink)', 'stroke-width': 19, 'stroke-linecap': 'round' });
      add(g, 'path', { d: 'M146 120 Q182 110 170 74', fill: 'none', stroke: f, 'stroke-width': 14, 'stroke-linecap': 'round' });
      add(g, 'ellipse', Object.assign({ cx: 112, cy: 120, rx: 38 * r, ry: 32 * r, fill: f }, INK));
      if (look.belly) add(g, 'ellipse', { cx: 104, cy: 138, rx: 24 * r, ry: 12, fill: sc(look.belly) });
      add(g, 'ellipse', Object.assign({ cx: 80, cy: 72, rx: 11, ry: 15, fill: f }, INK));
      add(g, 'ellipse', Object.assign({ cx: 96, cy: 74, rx: 11, ry: 15, fill: f }, INK));
      add(g, 'ellipse', { cx: 96, cy: 74, rx: 6, ry: 9, fill: 'var(--rsa-skin)' });
      add(g, 'ellipse', Object.assign({ cx: 76, cy: 104, rx: 23, ry: 21, fill: f }, INK));
      return { eye: [68, 99], ear: [96, 60], nose: [54, 108], feet: [[92, 150], [108, 151]] };
    },
    ferret: function (g, f, look, r, mark) {
      add(g, 'path', { d: 'M164 130 Q188 132 194 116', fill: 'none', stroke: 'var(--rsa-ink)', 'stroke-width': 12, 'stroke-linecap': 'round' });
      add(g, 'path', { d: 'M164 130 Q188 132 194 116', fill: 'none', stroke: f, 'stroke-width': 8, 'stroke-linecap': 'round' });
      [[78, 150], [96, 151], [136, 151], [154, 150]].filter(function (p, i) { return !(mark === 'three' && i === 1); }).forEach(function (p) {
        add(g, 'rect', Object.assign({ x: p[0] - 5, y: 134, width: 10, height: 17, rx: 4, fill: f }, INK));
      });
      add(g, 'ellipse', Object.assign({ cx: 114, cy: 128, rx: 58 * r, ry: 17 * r, fill: f }, INK));
      add(g, 'circle', Object.assign({ cx: 60, cy: 106, r: 7, fill: f }, INK));
      add(g, 'ellipse', Object.assign({ cx: 50, cy: 120, rx: 20, ry: 14, fill: look.face ? sc(look.face) : f }, INK));
      if (look.face) add(g, 'ellipse', { cx: 54, cy: 115, rx: 11, ry: 5, fill: f });
      return { eye: [52, 115], ear: [60, 99], nose: [31, 122], feet: [[78, 150], [96, 151], [136, 151], [154, 150]], legs: true };
    },
    hedgehog: function (g, f, look, r) {
      var spikes = 'M60 132 L64 104 L72 112 L78 92 L88 104 L96 86 L104 102 L114 86 L120 102 L132 88 L136 104 L148 94 L150 110 L160 106 L158 124 L164 130 Z';
      add(g, 'path', Object.assign({ d: spikes, fill: f, transform: r > 1 ? 'translate(-11 -12) scale(1.1)' : '' }, INK));
      add(g, 'ellipse', Object.assign({ cx: 112, cy: 126, rx: 50 * r, ry: 26 * r, fill: f }, INK));
      ['M92 108 L96 118', 'M110 104 L112 116', 'M128 108 L128 118', 'M144 114 L142 124'].forEach(function (d) {
        add(g, 'path', { d: d, stroke: 'var(--rsa-ink)', 'stroke-width': 2, 'stroke-linecap': 'round' });
      });
      add(g, 'circle', Object.assign({ cx: 70, cy: 116, r: 5, fill: 'var(--rsa-coat-face)' }, INK));
      add(g, 'path', Object.assign({ d: 'M78 118 Q60 116 38 134 Q58 146 80 144 Z', fill: 'var(--rsa-coat-face)' }, INK));
      return { eye: [60, 126], ear: [70, 111], nose: [38, 134], feet: [[72, 150], [96, 152], [128, 152]] };
    },
  };
  var INK = { stroke: 'var(--rsa-ink)', 'stroke-width': '2.5', 'stroke-linejoin': 'round' };

  function drawSmall(a, cls) {
    var look = SMALL_COATS[a.coat] || SMALL_COATS['mouse-brown'];
    var mark = SMALL_MARKS[a.mark] ? a.mark : 'plain';
    var f = sc(look.base);
    var r = mark === 'round' ? 1.14 : 1;
    var svg = el('svg', { 'class': cls || 'rsa-animal', viewBox: '0 0 200 170', 'aria-hidden': 'true', focusable: 'false' });
    // The dark under the boards, and the strip of daylight the animal is in.
    add(svg, 'rect', { x: 2, y: 2, width: 196, height: 166, rx: 14, fill: 'var(--rsa-dust)' });
    add(svg, 'rect', { x: 28, y: 2, width: 144, height: 166, fill: 'var(--rsa-lit)' });
    add(svg, 'rect', { x: 28, y: 2, width: 144, height: 3, fill: 'var(--rsa-crack)' });
    var g = el('g', {});
    svg.appendChild(g);
    var at = SPECIES[look.sp](g, f, look, r, mark);
    // Feet, one fewer for an animal with three legs.
    if (!at.legs) {
      var feet = at.feet.slice();
      if (mark === 'three') feet.splice(feet.length > 2 ? 1 : 0, 1);
      feet.forEach(function (p) { add(g, 'ellipse', Object.assign({ cx: p[0], cy: p[1], rx: 6, ry: 4, fill: 'var(--rsa-skin)' }, INK)); });
    }
    // A patch round the eye, in whichever of dark or pale the coat is not.
    if (mark === 'patch') add(g, 'ellipse', { cx: at.eye[0], cy: at.eye[1], rx: 8, ry: 7, fill: DARK[look.base] ? sc('white') : sc('dark') });
    if (mark === 'oneeye') {
      add(g, 'path', { d: 'M' + (at.eye[0] - 4) + ' ' + at.eye[1] + ' Q' + at.eye[0] + ' ' + (at.eye[1] + 3) + ' ' + (at.eye[0] + 4) + ' ' + at.eye[1], fill: 'none', stroke: 'var(--rsa-ink)', 'stroke-width': 2, 'stroke-linecap': 'round' });
    } else {
      add(g, 'circle', { cx: at.eye[0], cy: at.eye[1], r: 3.6, fill: 'var(--rsa-ink)', stroke: DARK[look.base] || mark === 'patch' && !DARK[look.base] ? 'var(--rsa-lit)' : 'none', 'stroke-width': 1.2 });
      add(g, 'circle', { cx: at.eye[0] + 1.2, cy: at.eye[1] - 1.2, r: 1.1, fill: 'var(--rsa-lit)' });
    }
    add(g, 'circle', { cx: at.nose[0], cy: at.nose[1], r: 2.6, fill: 'var(--rsa-ink)' });
    if (mark === 'nick') add(g, 'path', { d: 'M' + (at.ear[0] - 4) + ' ' + (at.ear[1] - 1) + ' L' + at.ear[0] + ' ' + (at.ear[1] + 5) + ' L' + (at.ear[0] + 4) + ' ' + (at.ear[1] - 1) + ' Z', fill: 'var(--rsa-lit)', stroke: 'var(--rsa-ink)', 'stroke-width': 1.6, 'stroke-linejoin': 'round' });
    var w = mark === 'whiskers'
      ? [[-22, -12], [-26, -2], [-24, 8], [-16, 16], [-8, -18], [-18, 20]]
      : [[-18, -4], [-20, 3], [-17, 9]];
    w.forEach(function (d) {
      add(g, 'path', { d: 'M' + at.nose[0] + ' ' + at.nose[1] + ' l' + d[0] + ' ' + d[1], stroke: 'var(--rsa-ink)', 'stroke-width': 1.3, 'stroke-linecap': 'round' });
    });
    return svg;
  }

  /* `opts` is only ever asked for by the café, and only for cats: `bare`
     leaves out the ground a cat was found on, and `pose: 'curled'` draws it
     asleep on a lap. Dogs and small animals are drawn as they always are. */
  function draw(a, cls, opts) {
    if (a && a.kind === 'small') return drawSmall(a, cls);
    if (a && a.kind === 'dog') return drawDog(a, cls);
    opts = opts || {};
    return opts.pose === 'curled' ? drawCurled(a, cls) : drawCat(a, cls, !!opts.bare);
  }

  /* What an animal is, in a word: the server's, or the kind's. */
  function noun(a) { return (a.words && a.words.noun) || (a.kind === 'dog' ? 'dog' : 'cat'); }

  function about(a) {
    var w = a.words || {};
    return 'A ' + w.coat + ' ' + noun(a) + ' ' + w.mark + ', found ' + w.place + '. They ' + w.mood + '.';
  }

  window.loveAnimals = { draw: draw, about: about, noun: noun };
}());

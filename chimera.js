/* =============================================================================
   The chimeras, drawn: every creature made in Chimera Obscura, wherever it
   goes. One file, so a chimera cannot be drawn one way on the room's table and
   another in somebody's Profile or on a sticker -- avatar.js's rule, for
   animals made of animals.

   A CHIMERA IS A LIST OF CHOICES, NEVER A PICTURE. Which animal gave the body,
   the head, the ears, the mouth, the tail, the back, the colours and the
   markings, every value a key out of the shelf below, and this file draws it
   fresh wherever it goes. clean() takes nothing it does not know, so no word
   anybody typed ever reaches the drawing; a chimera's name travels beside it
   and is never put inside it.

   EVERY PART IS FITTED TO THE BODY IT LANDS ON. Each animal is drawn for one
   shared rig, sitting up and facing you: a body of its own width and height, a
   head on top, ears placed round the head, a tail leaving the body's side, a
   back behind it. Nothing below is a picture of one animal; ears, tails, backs
   and markings are worked out from whatever body and head they are put on, so
   any part goes with any other. tools/chimera.test.mjs draws every pair.

   THE DRAWING IS SILENT. Every <svg> this makes is aria-hidden, and whoever
   shows one says what it is in words: words() says which animal gave which
   part, and a chimera's name is its maker's.

   THE SHELF IS GENERATED. Everything between the chimera:data markers is
   written by tools/make-chimera-obscura.py out of data/chimera-obscura.json,
   and the same keys go into netlify/cb/lib.mjs. Add an animal to the data file
   and run the tool. Never hand-edit between the markers.

   The drawings are code, written by Claude to Ryan's brief, after the
   chimeras Becky Hicks drew for stimpunks.org's About page.

   NOTHING MOVES, AND NOTHING HERE STORES OR SENDS ANYTHING. It draws.
   ============================================================================= */
(function (root) {
  'use strict';

/* chimera:data:begin */
  var SHELF = {"slots":[{"key":"body","legend":"Body","word":"body"},{"key":"head","legend":"Head","word":"head"},{"key":"ears","legend":"Ears","word":"ears"},{"key":"mouth","legend":"Mouth","word":"mouth"},{"key":"tail","legend":"Tail","word":"tail"},{"key":"back","legend":"Back","word":"back"},{"key":"colours","legend":"Colours","word":"colours"},{"key":"markings","legend":"Markings","word":"markings"}],"animals":{"bear":{"a":"a","say":["Bear","bear"],"colours":{"fur":"#8A5A3B","light":"#D9AB7F","dark":"#4B2F20","skin":"#E3A587","nose":"#2A1A12"},"body":{"w":200,"h":178,"top":0.8,"arms":"thick","feet":"pads"},"head":{"r":80,"sx":1.05,"sy":1.0,"shape":"round","muz":{"y":0.36,"rx":0.44,"ry":0.3},"nose":"round","eyes":{"x":0.38,"y":-0.04}},"ears":{"a":42,"type":"round","s":0.36},"mouth":"smile","tail":{"d":"@circle 16 -4 17","fill":"fur","at":0.44},"back":null,"markings":{"belly":true}},"mouse":{"a":"a","say":["Mouse","mouse"],"colours":{"fur":"#AAA29D","light":"#EFE9E3","dark":"#6B625D","skin":"#F3A9B8","nose":"#E27A92"},"body":{"w":156,"h":150,"top":0.74,"arms":"thin","feet":"small"},"head":{"r":70,"sx":1.0,"sy":0.95,"shape":"round","muz":{"y":0.38,"rx":0.3,"ry":0.24},"nose":"tri","eyes":{"x":0.36,"y":-0.02},"whiskers":true},"ears":{"a":48,"type":"round","s":0.62},"mouth":"buck","tail":{"d":"M-10,0 C40,6 70,-10 62,-48 C56,-78 84,-96 100,-82","string":true,"fill":"skin"},"back":null,"markings":{"belly":true}},"panda":{"a":"a","say":["Panda","panda"],"colours":{"fur":"#F7F4EE","light":"#FFFFFF","dark":"#262626","skin":"#3B3B3B","nose":"#1C1C1C"},"body":{"w":204,"h":176,"top":0.82,"arms":"thick","feet":"pads"},"head":{"r":84,"sx":1.08,"sy":0.98,"shape":"round","muz":{"y":0.4,"rx":0.32,"ry":0.24},"nose":"round","eyes":{"x":0.4,"y":-0.02}},"ears":{"a":44,"type":"round","s":0.38},"mouth":"w","tail":{"d":"@circle 18 -2 19","fill":"light","at":0.44},"back":null,"markings":{"patches":true,"darkEars":true,"darkLimbs":true,"band":true}},"armadillo":{"a":"an","say":["Armadillo","dillo"],"colours":{"fur":"#D8AE8E","light":"#F0D6BE","dark":"#8F6B52","skin":"#ECB9A3","nose":"#6D4A3A"},"body":{"w":168,"h":162,"top":0.7,"arms":"thin","feet":"claws"},"head":{"r":66,"sx":0.86,"sy":0.92,"shape":"round","muz":{"y":0.55,"rx":0.25,"ry":0.5},"nose":"small","eyes":{"x":0.4,"y":-0.1}},"ears":{"a":30,"type":"oval","s":0.34},"mouth":"tiny","tail":{"d":"M-6,-14 C40,-14 90,10 120,22 C126,25 122,31 115,30 C80,26 40,15 -6,14 Z","fill":"fur","bands":true,"axis":[0,0,118,26]},"back":{"kind":"shell","word":"an armadillo's plates","plate":"#9A7354","band":"#5E4231","speck":"#CBA584"},"markings":{"belly":true}},"rabbit":{"a":"a","say":["Bunny","bunny"],"colours":{"fur":"#B39A83","light":"#F2E9DD","dark":"#5F4C3D","skin":"#F2B5BB","nose":"#E48A98"},"body":{"w":164,"h":166,"top":0.72,"arms":"thin","feet":"big"},"head":{"r":72,"sx":0.95,"sy":1.02,"shape":"round","muz":{"y":0.4,"rx":0.34,"ry":0.22},"nose":"y","eyes":{"x":0.38,"y":-0.04},"whiskers":true},"ears":{"a":16,"type":"long","s":0.8},"mouth":"bunny","tail":{"d":"@circle 18 -8 22","fill":"light","at":0.44},"back":null,"markings":{"belly":true}},"badger":{"a":"a","say":["Badger","badger"],"colours":{"fur":"#56555A","light":"#F0EFEA","dark":"#1D1D20","skin":"#4A4A4E","nose":"#111113"},"body":{"w":212,"h":152,"top":0.86,"arms":"thick","feet":"claws"},"head":{"r":76,"sx":1.08,"sy":0.94,"shape":"wedge","muz":{"y":0.44,"rx":0.3,"ry":0.26},"nose":"round","eyes":{"x":0.38,"y":-0.02}},"ears":{"a":58,"type":"semi","s":0.26},"mouth":"fierce","tail":{"d":"M-6,-10 C20,-40 60,-56 72,-48 C82,-40 52,-8 -6,12 Z","fill":"fur","axis":[0,0,70,-46]},"back":null,"markings":{"bands":true,"rimEars":true,"lightHead":true,"tailTip":true}},"otter":{"a":"an","say":["Otter","otter"],"colours":{"fur":"#7B5233","light":"#DCC099","dark":"#45291A","skin":"#5B3A27","nose":"#2A1A10"},"body":{"w":146,"h":198,"top":0.7,"arms":"thin","feet":"webbed"},"head":{"r":74,"sx":1.18,"sy":0.88,"shape":"round","muz":{"y":0.36,"rx":0.48,"ry":0.3},"nose":"wide","eyes":{"x":0.4,"y":-0.1},"whiskers":true,"pads":true},"ears":{"a":68,"type":"round","s":0.17},"mouth":"open","tail":{"d":"M-6,-18 C50,-16 100,6 132,-10 C140,-14 142,-5 136,1 C102,30 50,24 -6,16 Z","fill":"fur","axis":[0,0,134,-6]},"back":null,"markings":{"chest":true,"lowerFace":true}},"raccoon":{"a":"a","say":["Raccoon","accoon","Racc"],"colours":{"fur":"#8F8E91","light":"#E8E5E0","dark":"#2B2B2E","skin":"#3C3C3F","nose":"#161617"},"body":{"w":180,"h":164,"top":0.78,"arms":"hands","feet":"pads"},"head":{"r":76,"sx":1.06,"sy":0.96,"shape":"wedge","muz":{"y":0.42,"rx":0.3,"ry":0.26},"nose":"round","eyes":{"x":0.38,"y":-0.02},"whiskers":true},"ears":{"a":36,"type":"tri","s":0.46},"mouth":"smirk","tail":{"d":"M-8,-16 C30,-40 70,-110 106,-112 C132,-114 130,-84 110,-60 C80,-24 40,0 -8,18 Z","fill":"fur","axis":[0,0,112,-96]},"back":null,"markings":{"mask":true,"rimEars":true,"rings":true,"darkPaws":true,"belly":true}}},"known":{"panda+armadillo":"Pandillo","pig+porcupine":"Porkypine"},"presets":[{"id":"bearmouse","label":"Bearmouse","whose":"Ryan's","parts":{"body":"bear","head":"bear","ears":"bear","mouth":"mouse","tail":"mouse","back":"none","colours":"bear","markings":"bear"}},{"id":"pandillo","label":"Pandillo","whose":"Chelsea's","parts":{"body":"panda","head":"panda","ears":"panda","mouth":"panda","tail":"panda","back":"armadillo","colours":"panda","markings":"panda"}},{"id":"bunnybadger","label":"Bunnybadger","whose":"Inna's","parts":{"body":"rabbit","head":"rabbit","ears":"rabbit","mouth":"badger","tail":"badger","back":"none","colours":"badger","markings":"badger"}},{"id":"otteraccoon","label":"An otteraccoon","whose":"Norah asked for one","parts":{"body":"otter","head":"otter","ears":"raccoon","mouth":"otter","tail":"raccoon","back":"none","colours":"otter","markings":"raccoon"}}],"opensOn":"otteraccoon"};
/* chimera:data:end */

  var INK = '#2A211F';
  var A = SHELF.animals || {};
  var SLOTS = (SHELF.slots || []).map(function (s) { return s.key; });
  var seq = 0;

  /* ── Small pieces ────────────────────────────────────────────────────── */
  function n(v) { return Math.round(v * 10) / 10; }
  function ellD(cx, cy, rx, ry) {
    return 'M' + n(cx - rx) + ',' + n(cy) + ' a' + n(rx) + ',' + n(ry) + ' 0 1,0 ' + n(2 * rx) + ',0 a' + n(rx) + ',' + n(ry) + ' 0 1,0 ' + n(-2 * rx) + ',0 Z';
  }
  function OL(sw) { return 'stroke="' + INK + '" stroke-width="' + (sw || 5) + '" stroke-linejoin="round" stroke-linecap="round"'; }
  function ell(cx, cy, rx, ry, attrs, deg) {
    return '<ellipse cx="' + n(cx) + '" cy="' + n(cy) + '" rx="' + n(rx) + '" ry="' + n(ry) + '" ' + attrs +
      (deg ? ' transform="rotate(' + n(deg) + ' ' + n(cx) + ' ' + n(cy) + ')"' : '') + '/>';
  }
  function pth(d, attrs) { return '<path d="' + d + '" ' + attrs + '/>'; }
  function line(x1, y1, x2, y2, attrs) {
    return '<line x1="' + n(x1) + '" y1="' + n(y1) + '" x2="' + n(x2) + '" y2="' + n(y2) + '" ' + attrs + '/>';
  }
  /* A tail's shape, with "@circle cx cy r" for a round one. */
  function tailD(d) {
    var m = /^@circle (-?[\d.]+) (-?[\d.]+) ([\d.]+)$/.exec(d);
    return m ? ellD(+m[1], +m[2], +m[3], +m[3]) : d;
  }
  function pear(cx, top, bot, wt, wb) {
    var H = bot - top;
    return 'M' + n(cx) + ',' + n(top) +
      ' C' + n(cx + wt * .55) + ',' + n(top) + ' ' + n(cx + wb * .56) + ',' + n(top + H * .45) + ' ' + n(cx + wb * .5) + ',' + n(top + H * .78) +
      ' C' + n(cx + wb * .47) + ',' + n(bot) + ' ' + n(cx + wb * .25) + ',' + n(bot) + ' ' + n(cx) + ',' + n(bot) +
      ' C' + n(cx - wb * .25) + ',' + n(bot) + ' ' + n(cx - wb * .47) + ',' + n(bot) + ' ' + n(cx - wb * .5) + ',' + n(top + H * .78) +
      ' C' + n(cx - wb * .56) + ',' + n(top + H * .45) + ' ' + n(cx - wt * .55) + ',' + n(top) + ' ' + n(cx) + ',' + n(top) + ' Z';
  }
  function wedge(hx, hy, rx, ry) {
    return 'M' + n(hx - rx) + ',' + n(hy - ry * .1) +
      ' C' + n(hx - rx) + ',' + n(hy - ry * 1.12) + ' ' + n(hx + rx) + ',' + n(hy - ry * 1.12) + ' ' + n(hx + rx) + ',' + n(hy - ry * .1) +
      ' C' + n(hx + rx) + ',' + n(hy + ry * .5) + ' ' + n(hx + rx * .35) + ',' + n(hy + ry * 1.05) + ' ' + n(hx) + ',' + n(hy + ry * 1.05) +
      ' C' + n(hx - rx * .35) + ',' + n(hy + ry * 1.05) + ' ' + n(hx - rx) + ',' + n(hy + ry * .5) + ' ' + n(hx - rx) + ',' + n(hy - ry * .1) + ' Z';
  }

  var SPECKS = [[-.8, -.2], [-.6, -.6], [-.45, .1], [-.25, -.75], [-.1, -.35], [.15, -.82], [.3, -.42], [.5, -.7], [.62, 0], [.8, -.32], [-.7, .42], [.72, .45]];

  /* ── The parts ───────────────────────────────────────────────────────── */
  function shellDome(id, cx, yt, h, w, P) {
    var dcy = yt + h * .3, drx = w * .6, dry = h * .5, d = ellD(cx, dcy, drx, dry), cid = id('sh');
    var s = '<clipPath id="' + cid + '"><path d="' + d + '"/></clipPath>' + pth(d, 'fill="' + P.plate + '"') + '<g clip-path="url(#' + cid + ')">';
    for (var i = -3; i <= 3; i++) {
      var x0 = cx + i * drx * .27;
      s += pth('M' + n(x0) + ',' + n(dcy - dry - 6) + ' Q' + n(x0 + i * drx * .07) + ',' + n(dcy) + ' ' + n(x0) + ',' + n(dcy + dry + 6),
        'fill="none" stroke="' + P.band + '" stroke-width="4"');
    }
    SPECKS.forEach(function (q) { s += ell(cx + q[0] * drx, dcy + q[1] * dry, 4, 3, 'fill="' + P.speck + '"'); });
    return s + '</g>' + pth(d, 'fill="none" ' + OL());
  }

  function cap(id, hx, hy, rx, ry, P) {
    var L = hx - rx * .8, R = hx + rx * .8, yb = hy - ry * .4, cid = id('cp');
    var d = 'M' + n(L) + ',' + n(yb) + ' Q' + n(hx) + ',' + n(hy - ry * 1.62) + ' ' + n(R) + ',' + n(yb) +
      ' Q' + n(hx) + ',' + n(hy - ry * .62) + ' ' + n(L) + ',' + n(yb) + ' Z';
    var s = '<clipPath id="' + cid + '"><path d="' + d + '"/></clipPath>' + pth(d, 'fill="' + P.plate + '"') + '<g clip-path="url(#' + cid + ')">';
    [-.3, 0, .3].forEach(function (u) {
      s += pth('M' + n(hx + u * rx) + ',' + n(hy - ry * 1.2) + ' Q' + n(hx + u * rx * 1.25) + ',' + n(hy - ry * .8) + ' ' + n(hx + u * rx * 1.1) + ',' + n(hy - ry * .3),
        'fill="none" stroke="' + P.band + '" stroke-width="3.5"');
    });
    [[-.5, -.62], [-.15, -.85], [.2, -.7], [.48, -.6]].forEach(function (q) { s += ell(hx + q[0] * rx, hy + q[1] * ry, 3.5, 2.6, 'fill="' + P.speck + '"'); });
    return s + '</g>' + pth(d, 'fill="none" ' + OL(4.5));
  }

  function ears(E, hx, hy, rx, ry, r, C, mk) {
    var a = E.a * Math.PI / 180, k = E.s * r, s = '';
    var outer = mk.darkEars ? C.dark : mk.rimEars ? C.light : C.fur;
    var mid = mk.rimEars ? C.fur : null;
    var inner = mk.darkEars ? C.dark : C.skin;
    [-1, 1].forEach(function (side) {
      var ax = hx + side * rx * Math.sin(a), ay = hy - ry * Math.cos(a), g = '';
      if (E.type === 'round' || E.type === 'semi') {
        var cy = E.type === 'round' ? -k * .35 : -k * .2;
        g += ell(0, cy, k, k, 'fill="' + outer + '" ' + OL());
        if (mid) g += ell(0, cy, k * .76, k * .76, 'fill="' + mid + '"');
        g += ell(0, cy + k * .08, k * .48, k * .48, 'fill="' + inner + '"');
      } else if (E.type === 'long' || E.type === 'oval') {
        var long = E.type === 'long', c2 = long ? -k * .85 : -k * .6, w2 = long ? r * .22 : r * .2;
        g += ell(0, c2, w2, k * (long ? 1 : .95), 'fill="' + outer + '" ' + OL());
        if (mid) g += ell(0, c2 + k * .04, w2 * .74, k * .84, 'fill="' + mid + '"');
        g += ell(0, c2 + k * .1, w2 * .45, k * (long ? .66 : .55), 'fill="' + inner + '"');
      } else if (E.type === 'tri') {
        var K = k * 1.25;
        g += pth('M' + n(-.42 * K) + ',' + n(.2 * K) + ' L0,' + n(-K) + ' L' + n(.42 * K) + ',' + n(.2 * K) + ' Z', 'fill="' + outer + '" ' + OL());
        if (mid) g += pth('M' + n(-.32 * K) + ',' + n(.16 * K) + ' L0,' + n(-.78 * K) + ' L' + n(.32 * K) + ',' + n(.16 * K) + ' Z',
          'fill="' + mid + '" stroke="' + mid + '" stroke-width="4" stroke-linejoin="round"');
        g += pth('M' + n(-.2 * K) + ',' + n(.12 * K) + ' L0,' + n(-.5 * K) + ' L' + n(.2 * K) + ',' + n(.12 * K) + ' Z',
          'fill="' + inner + '" stroke="' + inner + '" stroke-width="4" stroke-linejoin="round"');
      }
      s += '<g transform="translate(' + n(ax) + ' ' + n(ay) + ') rotate(' + side * E.a + ')">' + g + '</g>';
    });
    return s;
  }

  function tail(id, T, tx, ty, C, mk) {
    var fill = T.fill === 'skin' ? C.skin : T.fill === 'light' ? C.light : C.fur, d = tailD(T.d);
    var s = '<g transform="translate(' + n(tx) + ' ' + n(ty) + ')">';
    if (T.string) {
      s += pth(d, 'fill="none" stroke="' + INK + '" stroke-width="12" stroke-linecap="round"');
      s += pth(d, 'fill="none" stroke="' + fill + '" stroke-width="6" stroke-linecap="round"');
      if (mk.rings) s += pth(d, 'fill="none" stroke="' + C.dark + '" stroke-width="6" stroke-dasharray="9 9"');
      return s + '</g>';
    }
    var cid = id('tl'), inner = '';
    s += '<clipPath id="' + cid + '"><path d="' + d + '"/></clipPath>' + pth(d, 'fill="' + fill + '"');
    if (T.bands) [24, 48, 72, 96].forEach(function (x) { inner += line(x, -30, x + 6, 40, 'stroke="' + C.dark + '" stroke-width="3"'); });
    if (T.axis) {
      var x0 = T.axis[0], y0 = T.axis[1], x1 = T.axis[2], y1 = T.axis[3];
      var dx = x1 - x0, dy = y1 - y0, L = Math.sqrt(dx * dx + dy * dy), nx = -dy / L, ny = dx / L;
      if (mk.rings) {
        [.32, .54, .76].forEach(function (t) {
          var mx = x0 + dx * t, my = y0 + dy * t;
          inner += line(mx + nx * 90, my + ny * 90, mx - nx * 90, my - ny * 90, 'stroke="' + C.dark + '" stroke-width="' + n(L * .1) + '"');
        });
        inner += ell(x1, y1, L * .13, L * .13, 'fill="' + C.dark + '"');
      }
      if (mk.tailTip) inner += ell(x1, y1, L * .24, L * .24, 'fill="' + C.light + '"');
    }
    s += '<g clip-path="url(#' + cid + ')">' + inner + '</g>' + pth(d, 'fill="none" ' + OL());
    return s + '</g>';
  }

  function arm(sx, sy, px, py, rw, fill) {
    var vx = px - sx, vy = py - sy, len = Math.sqrt(vx * vx + vy * vy);
    var deg = Math.atan2(-vx, vy) * 180 / Math.PI;
    return ell((sx + px) / 2, (sy + py) / 2, rw, len / 2 + rw * .6, 'fill="' + fill + '" ' + OL(), deg);
  }

  function foot(type, fx, fy, w, fill, C) {
    var s = '';
    if (type === 'pads') {
      s += ell(fx, fy, w * .15, w * .105, 'fill="' + fill + '" ' + OL());
      s += ell(fx, fy + w * .015, w * .07, w * .05, 'fill="' + C.skin + '"');
      [-1, 0, 1].forEach(function (i) { s += ell(fx + i * w * .052, fy - w * .058, w * .022, w * .022, 'fill="' + C.skin + '"'); });
    } else if (type === 'small') {
      s += ell(fx, fy, w * .11, w * .068, 'fill="' + fill + '" ' + OL());
    } else if (type === 'claws') {
      s += ell(fx, fy, w * .125, w * .078, 'fill="' + fill + '" ' + OL());
      [-1, 0, 1].forEach(function (i) { s += line(fx + i * w * .04, fy + w * .03, fx + i * w * .046, fy + w * .075, 'stroke="#EFE9DF" stroke-width="3.5" stroke-linecap="round"'); });
    } else if (type === 'big') {
      s += ell(fx, fy - w * .05, w * .15, w * .165, 'fill="' + fill + '" ' + OL());
      s += ell(fx, fy - w * .03, w * .07, w * .095, 'fill="' + C.skin + '"');
    } else if (type === 'webbed') {
      s += ell(fx, fy, w * .15, w * .078, 'fill="' + fill + '" ' + OL());
      [-1, 0, 1].forEach(function (i) { s += line(fx + i * w * .05, fy - w * .03, fx + i * w * .062, fy + w * .05, 'stroke="' + INK + '" stroke-width="2.5" stroke-linecap="round"'); });
    }
    return s;
  }

  function eyes(HD, hx, hy, rx, ry, r, sclera, fierce) {
    var s = '';
    [-1, 1].forEach(function (side) {
      var ex = hx + side * HD.eyes.x * rx, ey = hy + HD.eyes.y * ry;
      if (sclera) {
        s += ell(ex, ey, r * .1, r * .115, 'fill="#FFFFFF"');
        s += ell(ex - side * r * .015, ey + r * .01, r * .062, r * .078, 'fill="#141010"');
      } else {
        s += ell(ex, ey, r * .075, r * .095, 'fill="#141010"');
      }
      s += ell(ex - r * .022, ey - r * .035, r * .027, r * .027, 'fill="#FFFFFF"');
      if (fierce) s += line(ex + side * r * .14, ey - r * .21, ex - side * r * .1, ey - r * .12, OL(5.5));
    });
    return s;
  }

  function nose(type, hx, ny, r, C) {
    var g = 'fill="' + C.nose + '" ' + OL(3);
    if (type === 'round') return ell(hx, ny, r * .14, r * .095, g) + ell(hx - r * .045, ny - r * .03, r * .035, r * .02, 'fill="#FFFFFF" opacity=".7"');
    if (type === 'wide') return ell(hx, ny, r * .19, r * .1, g) + ell(hx - r * .06, ny - r * .035, r * .045, r * .022, 'fill="#FFFFFF" opacity=".7"');
    if (type === 'small') return ell(hx, ny, r * .08, r * .055, g);
    var q = type === 'y' ? .075 : .1;
    return pth('M' + n(hx - r * q) + ',' + n(ny - r * q * .5) + ' Q' + n(hx) + ',' + n(ny - r * q) + ' ' + n(hx + r * q) + ',' + n(ny - r * q * .5) +
      ' Q' + n(hx + r * q * .2) + ',' + n(ny + r * q * .8) + ' ' + n(hx) + ',' + n(ny + r * q * .8) +
      ' Q' + n(hx - r * q * .2) + ',' + n(ny + r * q * .8) + ' ' + n(hx - r * q) + ',' + n(ny - r * q * .5) + ' Z', g);
  }

  function mouthArt(type, hx, ny, my, r) {
    var k = r / 75, s = '', st = 'fill="none" ' + OL(3.5);
    var phil = pth('M' + n(hx) + ',' + n(ny + r * .08) + ' L' + n(hx) + ',' + n(my), st);
    function wsmile(wd, dp) {
      return pth('M' + n(hx - wd * k) + ',' + n(my - 2 * k) + ' Q' + n(hx - wd * k / 2) + ',' + n(my + dp * k) + ' ' + n(hx) + ',' + n(my) +
        ' Q' + n(hx + wd * k / 2) + ',' + n(my + dp * k) + ' ' + n(hx + wd * k) + ',' + n(my - 2 * k), st);
    }
    function teeth(tw, th) {
      return '<rect x="' + n(hx - tw * k) + '" y="' + n(my) + '" width="' + n(tw * k) + '" height="' + n(th * k) + '" rx="1.5" fill="#FFFFFF" ' + OL(2.5) + '/>' +
        '<rect x="' + n(hx) + '" y="' + n(my) + '" width="' + n(tw * k) + '" height="' + n(th * k) + '" rx="1.5" fill="#FFFFFF" ' + OL(2.5) + '/>';
    }
    if (type === 'smile') s = phil + wsmile(15, 8);
    else if (type === 'buck') s = teeth(7.5, 12) + phil + wsmile(14, 6);
    else if (type === 'bunny') s = teeth(5, 9) + phil + wsmile(11, 5);
    else if (type === 'w') s = wsmile(12, 6);
    else if (type === 'tiny') s = pth('M' + n(hx - 6 * k) + ',' + n(my) + ' Q' + n(hx) + ',' + n(my + 5 * k) + ' ' + n(hx + 6 * k) + ',' + n(my), st);
    else if (type === 'fierce') s = pth('M' + n(hx + 3 * k) + ',' + n(my + 1 * k) + ' L' + n(hx + 6.5 * k) + ',' + n(my + 9 * k) + ' L' + n(hx + 10 * k) + ',' + n(my + 2.5 * k) + ' Z', 'fill="#FFFFFF" ' + OL(2.5)) +
      pth('M' + n(hx - 13 * k) + ',' + n(my + 5 * k) + ' Q' + n(hx) + ',' + n(my - 4 * k) + ' ' + n(hx + 13 * k) + ',' + n(my + 5 * k), st);
    else if (type === 'open') s = phil + pth('M' + n(hx - 15 * k) + ',' + n(my - 1 * k) + ' Q' + n(hx) + ',' + n(my + 20 * k) + ' ' + n(hx + 15 * k) + ',' + n(my - 1 * k) + ' Z', 'fill="#5A2420" ' + OL(3)) +
      ell(hx, my + 8 * k, 6.5 * k, 4 * k, 'fill="#E8788A"');
    else if (type === 'smirk') s = pth('M' + n(hx + 4 * k) + ',' + n(my + 3 * k) + ' L' + n(hx + 6.5 * k) + ',' + n(my + 9 * k) + ' L' + n(hx + 9.5 * k) + ',' + n(my + 2 * k) + ' Z', 'fill="#FFFFFF" ' + OL(2.5)) +
      pth('M' + n(hx - 12 * k) + ',' + n(my) + ' Q' + n(hx + 2 * k) + ',' + n(my + 9 * k) + ' ' + n(hx + 14 * k) + ',' + n(my - 4 * k), st);
    return s;
  }

  /* ── One chimera ─────────────────────────────────────────────────────── */
  function inner(c, prefix) {
    var p = clean(c);
    if (!p) return '';
    var P = prefix || ('chm' + (++seq)), k = 0;
    function id(tag) { k += 1; return P + '-' + tag + k; }
    var C = A[p.colours].colours, mk = A[p.markings].markings, B = A[p.body].body, HD = A[p.head].head,
      E = A[p.ears].ears, T = A[p.tail].tail, MO = A[p.mouth].mouth, BK = p.back === 'none' ? null : A[p.back].back;
    var cx = 200, yb = 405, w = B.w, h = B.h, wTop = w * B.top, yt = yb - h;
    var r = HD.r, rx = r * HD.sx, ry = r * HD.sy, hx = cx, hy = yt - ry * .55;
    var torsoD = pear(cx, yt, yb, wTop, w);
    var headD = HD.shape === 'wedge' ? wedge(hx, hy, rx, ry) : ellD(hx, hy, rx, ry);
    var cT = id('t'), cH = id('h'), s = '';
    s += '<defs><clipPath id="' + cT + '"><path d="' + torsoD + '"/></clipPath><clipPath id="' + cH + '"><path d="' + headD + '"/></clipPath></defs>';
    s += ell(cx, yb + 6, w * .62, 13, 'fill="#000000" opacity=".12"');
    if (BK) s += shellDome(id, cx, yt, h, w, BK);
    s += tail(id, T, cx + w * (T.at || .3), yb - h * .24, C, mk);
    s += ears(E, hx, hy, rx, ry, r, C, mk);

    s += pth(torsoD, 'fill="' + C.fur + '"') + '<g clip-path="url(#' + cT + ')">';
    if (mk.band) s += '<rect x="' + n(cx - w) + '" y="' + n(yt - 20) + '" width="' + n(2 * w) + '" height="' + n(h * .36 + 20) + '" fill="' + C.dark + '"/>';
    if (mk.belly) s += ell(cx, yt + h * .64, w * .28, h * .28, 'fill="' + C.light + '"');
    if (mk.chest) s += ell(cx, yt + h * .52, w * .27, h * .4, 'fill="' + C.light + '"');
    s += ell(cx + w * .56, yt + h * .55, w * .4, h * .85, 'fill="#000000" opacity=".09"');
    s += '</g>' + pth(torsoD, 'fill="none" ' + OL());

    var limb = mk.darkLimbs ? C.dark : C.fur, feetFill = (mk.darkLimbs || mk.darkPaws) ? C.dark : C.fur;
    [-1, 1].forEach(function (side) { s += foot(B.feet, cx + side * w * .26, yb - 4, w, feetFill, C); });
    var rw = B.arms === 'thick' ? w * .12 : w * .085;
    [-1, 1].forEach(function (side) {
      var sx = cx + side * wTop * .4, sy = yt + h * .18, px = cx + side * w * .22, py = sy + Math.min(h * .42, w * .4);
      s += arm(sx, sy, px, py, rw, limb);
      if (B.arms === 'hands') {
        var hf = mk.darkPaws || mk.darkLimbs ? C.dark : C.fur;
        s += ell(px, py + rw * .4, w * .07, w * .065, 'fill="' + hf + '" ' + OL());
        [-1, 0, 1].forEach(function (i) { s += line(px + i * w * .03, py + rw * .4 + w * .02, px + i * w * .034, py + rw * .4 + w * .06, OL(2.5)); });
      } else if (mk.darkPaws) {
        s += ell(px, py + rw * .5, rw * 1.02, rw * .9, 'fill="' + C.dark + '" ' + OL());
      }
    });

    s += pth(headD, 'fill="' + (mk.lightHead ? C.light : C.fur) + '"') + '<g clip-path="url(#' + cH + ')">';
    if (mk.lowerFace) s += ell(hx, hy + ry * .5, rx * .92, ry * .62, 'fill="' + C.light + '"');
    if (mk.bands) [-1, 1].forEach(function (side) { s += ell(hx + side * rx * .36, hy - ry * .25, rx * .2, ry * .95, 'fill="' + C.dark + '"', side * 14); });
    if (mk.patches) [-1, 1].forEach(function (side) {
      var ex = hx + side * HD.eyes.x * rx, ey = hy + HD.eyes.y * ry;
      s += ell(ex + side * r * .03, ey + r * .04, r * .2, r * .145, 'fill="' + C.dark + '"', side * 28);
    });
    if (mk.mask) {
      s += pth('M' + n(hx - rx * .95) + ',' + n(hy - ry * .1) +
        ' C' + n(hx - rx * .7) + ',' + n(hy - ry * .34) + ' ' + n(hx - rx * .2) + ',' + n(hy - ry * .3) + ' ' + n(hx) + ',' + n(hy - ry * .14) +
        ' C' + n(hx + rx * .2) + ',' + n(hy - ry * .3) + ' ' + n(hx + rx * .7) + ',' + n(hy - ry * .34) + ' ' + n(hx + rx * .95) + ',' + n(hy - ry * .1) +
        ' C' + n(hx + rx * .72) + ',' + n(hy + ry * .28) + ' ' + n(hx + rx * .25) + ',' + n(hy + ry * .22) + ' ' + n(hx) + ',' + n(hy + ry * .12) +
        ' C' + n(hx - rx * .25) + ',' + n(hy + ry * .22) + ' ' + n(hx - rx * .72) + ',' + n(hy + ry * .28) + ' ' + n(hx - rx * .95) + ',' + n(hy - ry * .1) + ' Z',
        'fill="' + C.dark + '"');
      [-1, 1].forEach(function (side) { s += ell(hx + side * rx * .42, hy - ry * .42, rx * .22, ry * .07, 'fill="' + C.light + '"', side * 8); });
    }
    s += ell(hx + rx * .95, hy + ry * .25, rx * .5, ry * 1.1, 'fill="#000000" opacity=".07"');
    s += '</g>' + pth(headD, 'fill="none" ' + OL());

    var M = HD.muz, my = hy + M.y * ry, mry = M.ry * r;
    if (HD.pads) [-1, 1].forEach(function (side) { s += ell(hx + side * r * .19, my, r * .25, r * .2, 'fill="' + C.light + '" ' + OL(3.5)); });
    else s += ell(hx, my, M.rx * r, mry, 'fill="' + C.light + '" ' + OL(3.5));
    if (BK) s += cap(id, hx, hy, rx, ry, BK);
    s += eyes(HD, hx, hy, rx, ry, r, !!(mk.patches || mk.mask || mk.bands), MO === 'fierce');

    var ny = HD.nose === 'small' ? my + mry * .55 : my - mry * .3;
    if (HD.whiskers) [-1, 1].forEach(function (side) {
      [0, 1, 2].forEach(function (i) {
        s += line(hx + side * r * .3, my - r * .02 + i * r * .06, hx + side * r * .78, my - r * .14 + i * r * .13, 'stroke="' + INK + '" stroke-width="2" stroke-linecap="round"');
      });
    });
    s += mouthArt(MO, hx, ny, ny + r * .2, r);
    s += nose(HD.nose, hx, ny, r, C);
    return s;
  }

  /* The whole drawing. opts: prefix (for every id inside it, so two chimeras
     on one page never share a clip), cls, and width/height if wanted. */
  function svg(c, opts) {
    opts = opts || {};
    var body = inner(c, opts.prefix);
    if (!body) return '';
    return '<svg' + (opts.cls ? ' class="' + opts.cls + '"' : '') + ' viewBox="0 0 400 460"' +
      (opts.width ? ' width="' + opts.width + '"' : '') + (opts.height ? ' height="' + opts.height + '"' : '') +
      ' aria-hidden="true" focusable="false">' + body + '</svg>';
  }

  /* ── Checking, words and names ───────────────────────────────────────── */
  var own = function (o, k) { return Object.prototype.hasOwnProperty.call(o, k); };

  /* Only a chimera made of animals on the shelf, every part present and
     nothing else. A back is 'none' or an animal that has one. */
  function clean(c) {
    if (!c || typeof c !== 'object' || Array.isArray(c)) return null;
    var out = {};
    for (var i = 0; i < SLOTS.length; i++) {
      var k = SLOTS[i], v = own(c, k) ? c[k] : undefined;
      if (typeof v !== 'string') return null;
      if (k === 'back') {
        if (v !== 'none' && !(own(A, v) && A[v].back)) return null;
      } else if (!own(A, v)) return null;
      out[k] = v;
    }
    var extra = Object.keys(c).filter(function (key) { return SLOTS.indexOf(key) === -1; });
    return extra.length ? null : out;
  }

  /* The animal, other than the body's, that gave the most parts; a tie goes
     to whichever gave the earlier part. */
  function second(p) {
    var count = {}, best = null;
    SLOTS.forEach(function (k) {
      var v = p[k];
      if (k === 'body' || v === 'none' || v === p.body) return;
      count[v] = (count[v] || 0) + 1;
    });
    SLOTS.forEach(function (k) {
      var v = p[k];
      if (v && count[v] && (!best || count[v] > count[best])) best = v;
    });
    return best;
  }

  /* The name the room suggests: the body's animal, then the second animal,
     joined where they share a letter. tools/make-chimera-obscura.py works
     every one of these out and refuses a name that is Randimals' or that
     carries a word nobody should be called. */
  function suggest(c) {
    var p = clean(c);
    if (!p) return '';
    var d = second(p);
    if (!d) return A[p.body].say[0];
    var known = (SHELF.known || {})[p.body + '+' + d];
    if (known) return known;
    var tail = A[d].say[1], vowel = /^[aeiou]/.test(tail);
    var head = vowel && A[p.body].say[2] ? A[p.body].say[2] : A[p.body].say[0];
    if (head.slice(-1).toLowerCase() === tail[0]) head = head.slice(0, -1);
    return head + tail;
  }

  /* Which animal gave which part, in words, for the live line beside the
     table and for anybody who cannot see the drawing. */
  function words(c) {
    var p = clean(c);
    if (!p) return '';
    var by = {}, order = [];
    (SHELF.slots || []).forEach(function (s) {
      var v = p[s.key];
      if (v === 'none') return;
      if (!by[v]) { by[v] = []; order.push(v); }
      by[v].push(s.word);
    });
    var out = order.map(function (an) {
      var ws = by[an], list = ws.length > 1 ? ws.slice(0, -1).join(', ') + ' and ' + ws[ws.length - 1] : ws[0];
      return 'the ' + list + ' of ' + A[an].a + ' ' + an;
    }).join('; ');
    return out.charAt(0).toUpperCase() + out.slice(1) + '.';
  }

  /* A chimera as a few letters for an address, after the #, and back. The
     parts in the shelf's order, by animal, separated by dots. */
  function code(c) {
    var p = clean(c);
    return p ? SLOTS.map(function (k) { return p[k]; }).join('.') : '';
  }
  function uncode(s) {
    if (typeof s !== 'string' || !/^[a-z.]{3,400}$/.test(s)) return null;
    var bits = s.split('.');
    if (bits.length !== SLOTS.length) return null;
    var c = {};
    SLOTS.forEach(function (k, i) { c[k] = bits[i]; });
    return clean(c);
  }

  root.loveChimera = {
    svg: svg, inner: inner, clean: clean, words: words, suggest: suggest,
    second: second, code: code, uncode: uncode,
    slots: SHELF.slots || [], animals: Object.keys(A),
    hasBack: function (an) { return !!(own(A, an) && A[an].back); },
    article: function (an) { return own(A, an) ? A[an].a : 'a'; },
    presets: SHELF.presets || [], opensOn: SHELF.opensOn || ''
  };
})(typeof window !== 'undefined' ? window : globalThis);

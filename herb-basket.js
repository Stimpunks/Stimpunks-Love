/* =============================================================================
   The herb basket, and the cauldron in the Herbery.

   Helen Edgar's ask, 2026-10-26: gather herbs in the Herbery in Myths &
   Legends, keep them in a basket in your Profile, and combine them into brews
   and magical stews, the way the crystal pouch works.

   THIS IS THE ONLY THING THAT DRAWS A HERB, THE BASKET OR THE CAULDRON. Every
   drawing is built with createElementNS in the herb's own two inks, declared
   in love.css as --herb-*, on a disc of the basket's linen, outlined in the
   line, so it carries its own ground on the radio's darkest theme as on its
   palest. tools/make-yurt-myths.py writes the herbs and the book of brews and
   stews between the markers below out of data/yurt-myths.json.

   THE BOOK IS STORIES, NEVER RECIPES. A brew or a stew is a set of herbs and a
   name and a line of this room's own; the cauldron says which one you stirred.
   Nothing it says is to eat or drink, and the room says so above it.

   IN THE HERBERY IT SENDS ONE THING, AND ONLY WHEN SOMEBODY PRESSES THE BUTTON
   THAT SAYS SO: which herb, to /cb/herbs, with the pass the radio keeps in
   love-cb, which this file reads and never writes. Signed off, Gather it never
   appears and nothing is sent. The cauldron sends nothing and keeps nothing,
   signed on or not. Nothing moves. tools/make-yurt-myths.py reads this file
   for all of that.
   ============================================================================= */
(function (root) {
  'use strict';

  /* herbs:data:begin */
  var DATA = {"room": "faery-myths-room.html", "herbs": [{"id": "rosemary", "name": "Rosemary", "draw": "needles", "ink": "--herb-rosemary", "shine": "--herb-rosemary-2"}, {"id": "thyme", "name": "Thyme", "draw": "tiny", "ink": "--herb-thyme", "shine": "--herb-thyme-2"}, {"id": "mint", "name": "Mint", "draw": "pairs", "ink": "--herb-mint", "shine": "--herb-mint-2"}, {"id": "basil", "name": "Basil", "draw": "broad", "ink": "--herb-basil", "shine": "--herb-basil-2"}, {"id": "bay", "name": "Bay", "draw": "laurel", "ink": "--herb-bay", "shine": "--herb-bay-2"}, {"id": "lavender", "name": "Lavender", "draw": "spike", "ink": "--herb-lavender", "shine": "--herb-lavender-2"}, {"id": "rose", "name": "Rose", "draw": "bloom", "ink": "--herb-rose", "shine": "--herb-rose-2"}, {"id": "elder", "name": "Elder", "draw": "umbel", "ink": "--herb-elder", "shine": "--herb-elder-2"}, {"id": "yarrow", "name": "Yarrow", "draw": "flat", "ink": "--herb-yarrow", "shine": "--herb-yarrow-2"}, {"id": "hawthorn", "name": "Hawthorn", "draw": "haws", "ink": "--herb-hawthorn", "shine": "--herb-hawthorn-2"}], "book": [{"name": "Brew of Remembering", "kind": "brew", "herbs": ["rosemary", "bay"], "says": "For an evening of telling old stories out loud, so nobody in them is forgotten."}, {"name": "Brew of Small Courage", "kind": "brew", "herbs": ["thyme", "basil"], "says": "For the moment before a door, a phone call, or the first word in a full room."}, {"name": "Under-the-Rose Brew", "kind": "brew", "herbs": ["rose", "mint"], "says": "For a secret kept kindly: the kind that is somebody else's to tell."}, {"name": "Elder Mother's Brew", "kind": "brew", "herbs": ["elder", "hawthorn"], "says": "Ask the Elder Mother first, and leave the lone thorn standing."}, {"name": "Sea-Dew Brew", "kind": "brew", "herbs": ["rosemary", "lavender"], "says": "Sea air and clean washing, for a room that wants airing."}, {"name": "Yarrow Stalk Brew", "kind": "brew", "herbs": ["yarrow", "thyme"], "says": "Stir it while you wonder, and let the stalks fall where they fall."}, {"name": "Underworld Stew", "kind": "stew", "herbs": ["mint", "rose", "bay"], "says": "Minthe, Daphne and the rose that kept a secret: three stories of plants and gods, simmered together."}, {"name": "Fair Folk Stew", "kind": "stew", "herbs": ["hawthorn", "elder", "yarrow"], "says": "Set out a bowl under the thorn, and do not wait up."}, {"name": "Windowsill Stew", "kind": "stew", "herbs": ["basil", "thyme", "rosemary"], "says": "Everything growing on the sill, for an ordinary Tuesday."}, {"name": "Moonlight Stew", "kind": "stew", "herbs": ["lavender", "rose", "elder"], "says": "Pale flowers only, stirred after dark."}]};
  /* herbs:data:end */

  var PASS_KEY = 'love-cb';
  var HERBS = '/cb/herbs';
  var NS = 'http://www.w3.org/2000/svg';
  var byId = {};
  DATA.herbs.forEach(function (h) { byId[h.id] = h; });

  function shape(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }
  function ink(name) { return 'var(' + name + ')'; }
  var LINE = { stroke: ink('--herb-line'), 'stroke-width': '1', 'stroke-linejoin': 'round' };
  function lined(tag, attrs) { return shape(tag, Object.assign({}, LINE, attrs)); }
  function stroke(g, d, colour, w) {
    return g.appendChild(shape('path', { d: d, fill: 'none', stroke: ink(colour), 'stroke-width': String(w), 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  }
  /* A leaf: an almond centred on (x, y), so long and so wide, turned by deg,
     with a vein in the herb's second ink. */
  function leaf(g, h, x, y, len, wid, deg, fill, vein) {
    var l = len / 2, w = wid / 2;
    var t = 'rotate(' + deg + ' ' + x + ' ' + y + ')';
    g.appendChild(lined('path', { d: 'M' + (x - l) + ' ' + y + ' Q' + x + ' ' + (y - w * 2) + ' ' + (x + l) + ' ' + y + ' Q' + x + ' ' + (y + w * 2) + ' ' + (x - l) + ' ' + y + ' Z', fill: ink(fill || h.ink), transform: t }));
    if (vein !== false) stroke(g, 'M' + (x - l + 1.5) + ' ' + y + ' H' + (x + l - 1.5), vein || h.shine, 0.7).setAttribute('transform', t);
  }
  function dot(g, x, y, r, fill) { g.appendChild(lined('circle', { cx: String(x), cy: String(y), r: String(r), fill: ink(fill), 'stroke-width': '.6' })); }

  /* Each herb is drawn in a 48 by 48 box. */
  var DRAW = {
    needles: function (g, h) {
      stroke(g, 'M24 43 C24 31 25 19 27 7', h.ink, 2);
      for (var i = 0; i < 9; i++) {
        var y = 39 - i * 3.6, x = 24 + i * 0.36;
        stroke(g, 'M' + x + ' ' + y + ' L' + (x - 6) + ' ' + (y - 3), h.ink, 1.7);
        stroke(g, 'M' + x + ' ' + (y - 1.6) + ' L' + (x + 6) + ' ' + (y - 4.6), h.ink, 1.7);
      }
      dot(g, 19, 15, 2.1, h.shine); dot(g, 31.5, 19, 2.1, h.shine); dot(g, 21, 25, 2.1, h.shine);
    },
    tiny: function (g, h) {
      stroke(g, 'M24 43 V22 M24 33 L15 19 M24 28 L33 15', h.ink, 1.6);
      [[24, 38], [24, 32], [24, 26], [20, 26], [17, 22], [27, 24], [30, 19]].forEach(function (p, i) {
        g.appendChild(lined('ellipse', { cx: String(p[0] + (i % 2 ? 2.4 : -2.4)), cy: String(p[1]), rx: '2.2', ry: '1.3', fill: ink(h.ink), 'stroke-width': '.5' }));
      });
      [[15, 17], [33, 13], [24, 20]].forEach(function (p) {
        dot(g, p[0] - 1.6, p[1], 1.6, h.shine); dot(g, p[0] + 1.6, p[1], 1.6, h.shine); dot(g, p[0], p[1] - 2.2, 1.6, h.shine);
      });
    },
    pairs: function (g, h) {
      stroke(g, 'M24 44 V9', h.ink, 2.2);
      leaf(g, h, 16, 35, 15, 8, 15); leaf(g, h, 32, 35, 15, 8, -15);
      leaf(g, h, 17, 25, 13, 7, 20); leaf(g, h, 31, 25, 13, 7, -20);
      leaf(g, h, 19, 15, 10, 5.5, 30); leaf(g, h, 29, 15, 10, 5.5, -30);
    },
    broad: function (g, h) {
      stroke(g, 'M24 44 V14', h.ink, 2);
      leaf(g, h, 15, 32, 19, 12, 30); leaf(g, h, 33, 32, 19, 12, -30);
      leaf(g, h, 18, 19, 13, 8, 45); leaf(g, h, 30, 19, 13, 8, -45);
      leaf(g, h, 24, 10, 9, 6, 90);
    },
    laurel: function (g, h) {
      stroke(g, 'M13 43 L35 6', h.shine, 1.8);
      leaf(g, h, 13, 33, 15, 6, -10); leaf(g, h, 30, 30, 15, 6, 10);
      leaf(g, h, 18, 22, 14, 5.5, -25); leaf(g, h, 35, 18, 13, 5.5, 5);
      leaf(g, h, 27, 10, 11, 5, -60);
    },
    spike: function (g, h) {
      stroke(g, 'M24 44 C20 34 17 22 15 12 M24 44 V10 M24 44 C28 34 31 22 33 12', h.ink, 1.5);
      [[15, 12], [24, 9], [33, 12]].forEach(function (p) {
        for (var i = 0; i < 5; i++) {
          g.appendChild(lined('ellipse', { cx: String(p[0] + (i % 2 ? 1 : -1)), cy: String(p[1] - 5 + i * 2.6), rx: '1.9', ry: '1.5', fill: ink(h.shine), 'stroke-width': '.5' }));
        }
      });
      leaf(g, h, 18, 38, 9, 3, -50, h.ink, false); leaf(g, h, 30, 38, 9, 3, 50, h.ink, false);
    },
    bloom: function (g, h) {
      stroke(g, 'M24 44 V26', h.shine, 2);
      leaf(g, h, 17, 36, 11, 6, -25, h.shine, h.ink); leaf(g, h, 31, 33, 11, 6, 25, h.shine, h.ink);
      g.appendChild(lined('circle', { cx: '24', cy: '18', r: '10.5', fill: ink(h.ink) }));
      g.appendChild(shape('path', { d: 'M21 18 A3 3 0 1 1 27 18 A5 5 0 1 1 18 19 A7.5 7.5 0 1 1 31.5 16', fill: 'none', stroke: ink('--herb-line'), 'stroke-width': '.9', 'stroke-linecap': 'round' }));
    },
    umbel: function (g, h) {
      leaf(g, h, 15, 38, 12, 5, -35); leaf(g, h, 33, 38, 12, 5, 35);
      [[13, 17], [18, 14], [24, 13], [30, 14], [35, 17]].forEach(function (p) { stroke(g, 'M24 34 L' + p[0] + ' ' + p[1], h.ink, 1.1); });
      stroke(g, 'M24 44 V34', h.ink, 1.8);
      for (var i = 0; i < 14; i++) {
        var x = 11 + i * 1.9, y = 15 - Math.sin((i / 13) * Math.PI) * 3 + (i % 2 ? 1.6 : -1.2);
        dot(g, x.toFixed(1), y.toFixed(1), 1.6, h.shine);
      }
    },
    flat: function (g, h) {
      stroke(g, 'M24 44 V17', h.ink, 1.8);
      stroke(g, 'M24 38 L18 36 L20 34 L15 32 L18 30 L14 28 M24 33 L30 31 L28 29 L33 27 L30 25 L34 23', h.ink, 1.1);
      stroke(g, 'M24 18 L16 13 M24 18 L32 13 M24 18 V12', h.ink, 1);
      for (var i = 0; i < 12; i++) {
        var x = 14 + (i % 6) * 4, y = 11 + Math.floor(i / 6) * 3 + (i % 2) * 0.6;
        dot(g, x + Math.floor(i / 6) * 2, y.toFixed(1), 1.7, h.shine);
      }
    },
    haws: function (g, h) {
      stroke(g, 'M9 41 C19 35 27 26 39 10', '--herb-line', 2.2);
      leaf(g, h, 14, 30, 11, 7, -40); leaf(g, h, 33, 26, 11, 7, 20); leaf(g, h, 32, 12, 9, 6, -10);
      [[22, 34], [26, 37], [19, 39], [24, 31]].forEach(function (p) { dot(g, p[0], p[1], 2.8, h.shine); });
    }
  };

  function sprig(h, x, y, size) {
    var g = shape('g', { transform: 'translate(' + (x - size / 2).toFixed(1) + ' ' + (y - size / 2).toFixed(1) + ') scale(' + (size / 48).toFixed(3) + ')' });
    DRAW[h.draw](g, h);
    return g;
  }

  /* A herb, drawn on its linen disc: { cls, label }. Without a label it is
     hidden from a screen reader, which hears the name beside it instead. */
  function draw(id, opts) {
    var h = byId[id];
    if (!h || !DRAW[h.draw] || typeof document === 'undefined') return null;
    opts = opts || {};
    var svg = shape('svg', { viewBox: '0 0 48 48', class: opts.cls || 'herb' });
    if (opts.label) { svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', h.name); }
    else { svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false'); }
    svg.appendChild(lined('circle', { cx: '24', cy: '24', r: '23', fill: ink('--herb-cloth') }));
    svg.appendChild(sprig(h, 24, 24, 48));
    return svg;
  }

  function said(names) {
    return names.length < 2 ? names.join('') : names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
  }

  /* THE BASKET (Helen's ask, as the pouch is a pouch): a wicker basket with a
     handle, lined with linen whose corners stand up behind the herbs, every
     herb gathered standing in it in the Herbery's order. */
  function basket(ids, opts) {
    if (typeof document === 'undefined') return null;
    opts = opts || {};
    var inIt = DATA.herbs.filter(function (h) { return ids.indexOf(h.id) >= 0 && DRAW[h.draw]; });
    var svg = shape('svg', { viewBox: '0 0 260 224', class: opts.cls || 'herb-basket', role: 'img' });
    var names = inIt.map(function (h) { return h.name; });
    svg.setAttribute('aria-label', 'A wicker basket with a handle, lined with linen' +
      (names.length ? ', with ' + said(names) + ' gathered in it.' : ', with nothing gathered in it yet.'));
    svg.appendChild(shape('path', { d: 'M58 124 C58 22 202 22 202 124', fill: 'none', stroke: ink('--herb-line'), 'stroke-width': '10', 'stroke-linecap': 'round' }));
    svg.appendChild(shape('path', { d: 'M58 124 C58 22 202 22 202 124', fill: 'none', stroke: ink('--herb-wicker'), 'stroke-width': '7', 'stroke-linecap': 'round' }));
    svg.appendChild(lined('path', { d: 'M46 124 C30 74 64 40 92 54 C104 18 156 18 168 54 C196 40 230 74 214 124 Z', fill: ink('--herb-cloth'), 'stroke-width': '1.6' }));
    var back = inIt.length > 5 ? inIt.slice(5) : [], front = inIt.slice(0, 5);
    [[back, 76, 15], [front, 92, 0]].forEach(function (row) {
      var n = row[0].length, step = 32, x0 = 130 - (n - 1) * step / 2 + (n === 5 ? 0 : row[2]);
      row[0].forEach(function (h, i) { svg.appendChild(sprig(h, x0 + i * step, row[1], 66)); });
    });
    svg.appendChild(lined('path', { d: 'M44 122 H216 L200 200 C197 210 188 216 176 216 H84 C72 216 63 210 60 200 Z', fill: ink('--herb-wicker'), 'stroke-width': '1.8' }));
    [140, 158, 176, 194].forEach(function (y, i) {
      var w = 6 + i * 3.4;
      svg.appendChild(shape('path', { d: 'M' + (48 + w) + ' ' + y + ' H' + (212 - w), fill: 'none', stroke: ink('--herb-wicker-2'), 'stroke-width': '2.4' }));
    });
    for (var x = 72; x < 200; x += 16) {
      svg.appendChild(shape('path', { d: 'M' + x + ' 128 L' + (x + (130 - x) * 0.12) + ' 210', fill: 'none', stroke: ink('--herb-wicker-2'), 'stroke-width': '1.6' }));
    }
    svg.appendChild(lined('path', { d: 'M38 116 H222 C226 116 228 119 228 122 C228 126 226 128 222 128 H38 C34 128 32 126 32 122 C32 119 34 116 38 116 Z', fill: ink('--herb-wicker-2'), 'stroke-width': '1.6' }));
    return svg;
  }

  /* The brews and stews a set of herbs could make: every one in the book whose
     herbs are all in it, in the book's order. Worked out every time, kept
     nowhere. */
  function brewsFor(ids) {
    return DATA.book.filter(function (b) { return b.herbs.every(function (h) { return ids.indexOf(h) >= 0; }); });
  }
  function bookFor(ids) {
    var key = ids.slice().sort().join(' ');
    return DATA.book.filter(function (b) { return b.herbs.slice().sort().join(' ') === key; })[0] || null;
  }
  function herbNames(ids) {
    return said(DATA.herbs.filter(function (h) { return ids.indexOf(h.id) >= 0; }).map(function (h) { return h.name; }));
  }

  root.loveHerbs = {
    list: DATA.herbs.map(function (h) { return { id: h.id, name: h.name, href: '/' + DATA.room + '#herb-' + h.id }; }),
    draw: draw,
    basket: basket,
    brewsFor: brewsFor,
    names: herbNames,
    name: function (id) { return byId[id] ? byId[id].name : ''; }
  };

  if (typeof document === 'undefined') return;

  /* ── The cauldron ─────────────────────────────────────────────────────── */
  function cauldron(ids) {
    var svg = shape('svg', { viewBox: '0 0 200 172', class: 'myth-cauldron__art', 'aria-hidden': 'true', focusable: 'false' });
    var inIt = DATA.herbs.filter(function (h) { return ids.indexOf(h.id) >= 0; });
    svg.appendChild(lined('path', { d: 'M58 140 L46 166 M142 140 L154 166 M100 150 V168', fill: 'none', stroke: ink('--herb-iron'), 'stroke-width': '7', 'stroke-linecap': 'round' }));
    svg.appendChild(lined('path', { d: 'M38 66 C32 118 58 154 100 154 C142 154 168 118 162 66 Z', fill: ink('--herb-iron'), 'stroke-width': '2' }));
    svg.appendChild(shape('path', { d: 'M52 84 C50 112 64 136 86 144', fill: 'none', stroke: ink('--herb-iron-2'), 'stroke-width': '4', 'stroke-linecap': 'round' }));
    svg.appendChild(lined('ellipse', { cx: '100', cy: '64', rx: '66', ry: '15', fill: ink('--herb-iron-2'), 'stroke-width': '2' }));
    svg.appendChild(lined('ellipse', { cx: '100', cy: '64', rx: '57', ry: '10', fill: ink(inIt.length ? inIt[0].ink : '--herb-iron'), 'stroke-width': '1' }));
    inIt.forEach(function (h, i) {
      var y = 60 + i * 3;
      svg.appendChild(shape('path', { d: 'M' + (56 + i * 6) + ' ' + y + ' C80 ' + (y - 6) + ' 120 ' + (y + 6) + ' ' + (144 - i * 6) + ' ' + y, fill: 'none', stroke: ink(h.shine), 'stroke-width': '2.2', 'stroke-linecap': 'round' }));
    });
    var step = 34, x0 = 100 - (inIt.length - 1) * step / 2;
    inIt.forEach(function (h, i) { svg.appendChild(sprig(h, x0 + i * step, 46, 40)); });
    return svg;
  }

  function cauldronRoom() {
    var box = document.querySelector('[data-cauldron]');
    if (!box) return;
    var art = box.querySelector('[data-cauldron-art]');
    var picks = box.querySelectorAll('input[type="checkbox"][data-herb]');
    var stir = box.querySelector('[data-cauldron-stir]');
    var empty = box.querySelector('[data-cauldron-empty]');
    var out = box.querySelector('[data-cauldron-said]');
    if (!art || !stir || !empty || !out || !picks.length) return;
    box.hidden = false;
    function chosen() {
      var ids = [];
      for (var i = 0; i < picks.length; i++) if (picks[i].checked) ids.push(picks[i].getAttribute('data-herb'));
      return ids;
    }
    function paint() { art.textContent = ''; art.appendChild(cauldron(chosen())); }
    for (var i = 0; i < picks.length; i++) picks[i].addEventListener('change', function (e) {
      if (chosen().length > 3) { e.target.checked = false; out.textContent = 'The cauldron takes three herbs at most. Take one out first.'; return; }
      out.textContent = '';
      paint();
    });
    stir.addEventListener('click', function () {
      var ids = chosen();
      if (ids.length < 2) { out.textContent = 'Tip in two or three herbs, then stir.'; return; }
      var b = bookFor(ids);
      out.textContent = b
        ? 'You stirred the ' + b.name + ', a ' + b.kind + ' of ' + herbNames(b.herbs) + '. ' + b.says
        : 'A ' + (ids.length === 3 ? 'stew' : 'brew') + ' of ' + herbNames(ids) + ': it is not in the book, so it is yours to name.';
    });
    empty.addEventListener('click', function () {
      for (var i = 0; i < picks.length; i++) picks[i].checked = false;
      out.textContent = 'The cauldron is empty again.';
      paint();
    });
    paint();
  }

  /* ── Gather it, in the Herbery ────────────────────────────────────────── */
  function pass() {
    try { var v = JSON.parse(localStorage.getItem(PASS_KEY) || 'null'); return v && v.pass ? v.pass : null; }
    catch (e) { return null; }
  }

  function call(payload) {
    var p = pass();
    if (!p) return Promise.resolve({ status: 0, body: {} });
    return fetch(HERBS, {
      method: 'POST', credentials: 'omit', cache: 'no-store',
      headers: { 'accept': 'application/json', 'content-type': 'application/json', 'authorization': 'Bearer ' + p },
      body: JSON.stringify(payload)
    }).then(function (r) {
      return r.json().then(function (b) { return { status: r.status, body: b || {} }; },
        function () { return { status: r.status, body: {} }; });
    }, function () { return { status: -1, body: {} }; });
  }

  function herbery() {
    var arts = document.querySelectorAll('[data-herb-art]');
    for (var a = 0; a < arts.length; a++) {
      var d = draw(arts[a].getAttribute('data-herb-art'), { cls: 'myth-herb__art' });
      if (d) arts[a].appendChild(d);
    }
    cauldronRoom();
    var takes = document.querySelectorAll('[data-herb-take]');
    if (!takes.length || !pass()) return;
    for (var i = 0; i < takes.length; i++) (function (row) {
      var btn = row.querySelector('button');
      var out = row.querySelector('[data-herb-said]');
      if (!btn || !out) return;
      row.hidden = false;
      btn.addEventListener('click', function () {
        btn.disabled = true;
        call({ take: row.getAttribute('data-herb-take') }).then(function (r) {
          btn.disabled = false;
          if (r.status === 200) {
            out.textContent = r.body.changed
              ? 'It is in your herb basket now. Profile, on the radio, shows it.'
              : 'You have this one already. It is in your herb basket, in your Profile.';
            try { window.dispatchEvent(new CustomEvent('love-herbs')); } catch (e) {}
            return;
          }
          out.textContent = r.status === 401
            ? 'Since you signed on, this username has been signed off. Sign on again at the Community Center, and press it again.'
            : r.status === -1 ? 'The street could not be reached just now. Nothing was gathered.'
            : (r.body && typeof r.body.error === 'string') ? r.body.error : 'That did not work just now. Nothing was gathered.';
        });
      });
    })(takes[i]);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', herbery);
  else herbery();
})(typeof window !== 'undefined' ? window : globalThis);

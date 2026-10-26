/* =============================================================================
   The crystal pouch.

   Helen Edgar's ask, 2026-10-26: take a crystal with you from the Crystal Wheel
   in Myths & Legends, behind her Faery Yurt, and have it in your Profile.

   THIS IS THE ONLY THING THAT DRAWS A CRYSTAL OR THE POUCH. The pouch holds small
   drawings of the stones, never anybody's photograph: the photographs are their
   photographers' and stay on the wheel's cards, credited, and every drawing in
   the pouch links back to its card. tools/make-yurt-myths.py writes the list
   between the markers below out of data/yurt-myths.json. Each crystal is drawn
   with createElementNS in its own two inks, declared in love.css as --crys-*,
   on a disc of the pouch's own cloth, so it carries its own ground wherever it
   lands, the radio's darkest theme included.

   ON THE WHEEL IT SENDS ONE THING, AND ONLY WHEN SOMEBODY PRESSES THE BUTTON
   THAT SAYS SO: which crystal, to /cb/crystals, with the pass the radio keeps
   in love-cb, which this file reads and never writes. Signed off, the button
   never appears and nothing is sent. Nothing is stored and nothing moves.
   tools/make-yurt-myths.py reads this file for all of that.
   ============================================================================= */
(function (root) {
  'use strict';

  /* crystals:data:begin */
  var DATA = {"room": "faery-myths-room.html", "crystals": [{"id": "amethyst", "name": "Amethyst", "shape": "cluster", "ink": "--crys-amethyst", "shine": "--crys-amethyst-2"}, {"id": "citrine", "name": "Citrine", "shape": "point", "ink": "--crys-citrine", "shine": "--crys-citrine-2"}, {"id": "garnet", "name": "Garnet", "shape": "gem", "ink": "--crys-garnet", "shine": "--crys-garnet-2"}, {"id": "moonstone", "name": "Moonstone", "shape": "tumble", "ink": "--crys-moonstone", "shine": "--crys-moonstone-2"}, {"id": "labradorite", "name": "Labradorite", "shape": "flash", "ink": "--crys-labradorite", "shine": "--crys-labradorite-2"}, {"id": "lapis-lazuli", "name": "Lapis lazuli", "shape": "flecks", "ink": "--crys-lapis-lazuli", "shine": "--crys-lapis-lazuli-2"}, {"id": "turquoise", "name": "Turquoise", "shape": "veins", "ink": "--crys-turquoise", "shine": "--crys-turquoise-2"}, {"id": "rose-quartz", "name": "Rose quartz", "shape": "tumble", "ink": "--crys-rose-quartz", "shine": "--crys-rose-quartz-2"}, {"id": "clear-quartz", "name": "Clear quartz", "shape": "point", "ink": "--crys-clear-quartz", "shine": "--crys-clear-quartz-2"}, {"id": "smoky-quartz", "name": "Smoky quartz", "shape": "point", "ink": "--crys-smoky-quartz", "shine": "--crys-smoky-quartz-2"}, {"id": "obsidian", "name": "Obsidian", "shape": "tumble", "ink": "--crys-obsidian", "shine": "--crys-obsidian-2"}, {"id": "tigers-eye", "name": "Tiger's eye", "shape": "band", "ink": "--crys-tigers-eye", "shine": "--crys-tigers-eye-2"}]};
  /* crystals:data:end */

  var PASS_KEY = 'love-cb';
  var CRYSTALS = '/cb/crystals';
  var NS = 'http://www.w3.org/2000/svg';
  var byId = {};
  DATA.crystals.forEach(function (c) { byId[c.id] = c; });

  function shape(tag, attrs) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }
  function ink(name) { return 'var(' + name + ')'; }

  /* Each shape is drawn in a 48 by 48 box, on the cloth, outlined in the line. */
  var LINE = { stroke: ink('--crys-line'), 'stroke-width': '1.3', 'stroke-linejoin': 'round' };
  function lined(tag, attrs) { return shape(tag, Object.assign({}, LINE, attrs)); }
  function point(g, c, x, top, w, foot) {
    var h = w / 2;
    g.appendChild(lined('path', { d: 'M' + (x - h) + ' ' + foot + ' V' + (top + w * 0.85) + ' L' + x + ' ' + top + ' L' + (x + h) + ' ' + (top + w * 0.85) + ' V' + foot + ' Z', fill: ink(c.ink) }));
    g.appendChild(shape('path', { d: 'M' + (x - h) + ' ' + (top + w * 0.85) + ' L' + x + ' ' + top + ' V' + foot + ' H' + (x - h) + ' Z', fill: ink(c.shine), opacity: '.55' }));
    g.appendChild(shape('path', { d: 'M' + (x - h) + ' ' + (top + w * 0.85) + ' L' + x + ' ' + (top + w) + ' L' + (x + h) + ' ' + (top + w * 0.85) + ' M' + x + ' ' + (top + w) + ' V' + foot, fill: 'none', stroke: ink('--crys-line'), 'stroke-width': '.8' }));
  }
  function tumble(g, c) {
    g.appendChild(lined('path', { d: 'M10 27 C10 18 18 14 26 15 C35 16 39 22 38 29 C37 36 30 39 22 38 C14 37 10 33 10 27 Z', fill: ink(c.ink) }));
  }
  function gleam(g, c) {
    g.appendChild(shape('path', { d: 'M15 24 C16 20 20 18 24 18', fill: 'none', stroke: ink(c.shine), 'stroke-width': '2.4', 'stroke-linecap': 'round' }));
  }
  var DRAW = {
    point: function (g, c) { point(g, c, 24, 8, 14, 40); },
    cluster: function (g, c) { point(g, c, 16, 18, 10, 40); point(g, c, 32, 15, 10, 40); point(g, c, 24, 7, 12, 40); },
    gem: function (g, c) {
      g.appendChild(lined('path', { d: 'M17 10 H31 L39 18 V30 L31 38 H17 L9 30 V18 Z', fill: ink(c.ink) }));
      g.appendChild(lined('path', { d: 'M19 17 H29 L32 20 V28 L29 31 H19 L16 28 V20 Z', fill: ink(c.shine), 'stroke-width': '.9' }));
      g.appendChild(shape('path', { d: 'M17 10 L19 17 M31 10 L29 17 M39 18 L32 20 M39 30 L32 28 M31 38 L29 31 M17 38 L19 31 M9 30 L16 28 M9 18 L16 20', fill: 'none', stroke: ink('--crys-line'), 'stroke-width': '.8' }));
    },
    tumble: function (g, c) { tumble(g, c); gleam(g, c); },
    flash: function (g, c) {
      tumble(g, c);
      g.appendChild(shape('path', { d: 'M15 31 C20 25 27 24 34 21', fill: 'none', stroke: ink(c.shine), 'stroke-width': '3.2', 'stroke-linecap': 'round' }));
    },
    flecks: function (g, c) {
      tumble(g, c);
      [[17, 23], [24, 30], [30, 21], [20, 32], [33, 29], [26, 19]].forEach(function (p) {
        g.appendChild(shape('circle', { cx: p[0], cy: p[1], r: '1.3', fill: ink(c.shine) }));
      });
    },
    veins: function (g, c) {
      g.appendChild(lined('path', { d: 'M12 28 C9 20 15 13 23 13 C29 12 35 15 37 21 C40 28 36 36 28 37 C20 39 14 35 12 28 Z', fill: ink(c.ink) }));
      g.appendChild(shape('path', { d: 'M15 22 C20 25 24 22 28 26 C31 29 34 27 36 25 M21 34 C23 30 27 30 28 26', fill: 'none', stroke: ink(c.shine), 'stroke-width': '1.4' }));
    },
    band: function (g, c) {
      tumble(g, c);
      g.appendChild(shape('path', { d: 'M12 23 C19 20 28 22 37 20 M11 29 C19 26 28 28 38 26 M14 34 C21 32 28 34 35 32', fill: 'none', stroke: ink(c.shine), 'stroke-width': '1.6' }));
    }
  };

  /* A crystal, drawn: { cls, label }. With label, it is a picture named for
     its crystal; without, it is hidden from a screen reader, which hears the
     name beside it instead. */
  function draw(id, opts) {
    var c = byId[id];
    if (!c || !DRAW[c.shape] || typeof document === 'undefined') return null;
    opts = opts || {};
    var svg = shape('svg', { viewBox: '0 0 48 48', class: opts.cls || 'crystal' });
    if (opts.label) { svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', c.name); }
    else { svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false'); }
    svg.appendChild(lined('circle', { cx: '24', cy: '24', r: '22.5', fill: ink('--crys-cloth') }));
    var g = shape('g', {});
    DRAW[c.shape](g, c);
    svg.appendChild(g);
    return svg;
  }

  /* THE POUCH ITSELF (Helen's ask, 2026-10-26: "a medieval pouch bag with draw
     string for crystals", as the battle jacket is a jacket): a leather bag
     gathered at the neck by a cord tied in a bow, and every crystal in it
     spilled out at its foot onto a cloth, in the wheel's order. Empty, it is only the bag.
     Its label names what has spilled out, so a screen reader hears the same. */
  var BAG = [
    ['path', { d: 'M98 76 C68 92 50 130 54 166 C58 202 92 216 130 216 C168 216 202 202 206 166 C210 130 192 92 162 76 Z', fill: ink('--crys-bag') }, true],
    ['path', { d: 'M112 92 C101 122 99 162 108 202 M148 92 C159 122 161 162 152 202 M130 88 V206', fill: 'none', stroke: ink('--crys-bag-2'), 'stroke-width': '3', 'stroke-linecap': 'round' }],
    ['path', { d: 'M92 66 C87 50 100 40 108 48 C112 35 126 33 130 44 C136 33 150 35 152 48 C160 40 173 50 168 66 C150 82 110 82 92 66 Z', fill: ink('--crys-bag') }, true],
    ['path', { d: 'M108 48 C110 55 112 60 114 62 M130 44 V60 M152 48 C150 55 148 60 146 62', fill: 'none', stroke: ink('--crys-bag-2'), 'stroke-width': '2', 'stroke-linecap': 'round' }],
    ['path', { d: 'M94 66 C110 74 150 74 166 66 L164 82 C148 88 112 88 96 82 Z', fill: ink('--crys-bag-2') }, true],
    ['path', { d: 'M96 75 C112 82 148 82 164 75', fill: 'none', stroke: ink('--crys-cord'), 'stroke-width': '4', 'stroke-linecap': 'round' }],
    ['path', { d: 'M130 80 C117 86 113 100 124 99 C132 98 133 88 130 80 C143 86 147 100 136 99 C128 98 127 88 130 80 M128 82 L119 116 M132 82 L143 118', fill: 'none', stroke: ink('--crys-cord'), 'stroke-width': '3', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }],
    ['circle', { cx: '118.6', cy: '118', r: '3.6', fill: ink('--crys-cord') }, true],
    ['circle', { cx: '143.6', cy: '120', r: '3.6', fill: ink('--crys-cord') }, true]
  ];

  function crystalAt(c, x, y, size) {
    var g = shape('g', { transform: 'translate(' + (x - size / 2).toFixed(1) + ' ' + (y - size / 2).toFixed(1) + ') scale(' + (size / 48).toFixed(3) + ')' });
    DRAW[c.shape](g, c);
    return g;
  }

  function pouch(ids, opts) {
    if (typeof document === 'undefined') return null;
    opts = opts || {};
    var inIt = DATA.crystals.filter(function (c) { return ids.indexOf(c.id) >= 0 && DRAW[c.shape]; });
    var svg = shape('svg', { viewBox: '0 0 260 252', class: opts.cls || 'crystal-pouch', role: 'img' });
    var names = inIt.map(function (c) { return c.name; });
    var said = names.length < 2 ? names.join('') : names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
    svg.setAttribute('aria-label', 'A leather pouch with a drawstring tied in a bow' +
      (names.length ? ', with ' + said + ' spilled out at its foot.' : ', with nothing in it yet.'));
    BAG.forEach(function (b) { svg.appendChild(b[2] ? lined(b[0], b[1]) : shape(b[0], b[1])); });
    // Spilled at its foot, centred on the bag: one row, or two when there are
    // many, the back row drawn first and set half a crystal along.
    var per = 7, step = 32, back = inIt.length > per ? inIt.slice(per) : [], front = inIt.slice(0, per);
    // They lie on a cloth spread in front of it, the pouch's own, so every
    // stone has a ground under it on the darkest theme as on the palest.
    if (front.length) {
      svg.appendChild(lined('ellipse', { cx: '130', cy: back.length ? '217' : '229', rx: String(Math.min(126, 30 + front.length * step / 2 + 14)), ry: back.length ? '33' : '21', fill: ink('--crys-cloth') }));
    }
    [[back, 204, step / 2], [front, 228, 0]].forEach(function (row) {
      var n = row[0].length, x0 = 130 - (n - 1) * step / 2 + (n === per ? 0 : row[2]);
      row[0].forEach(function (c, i) { svg.appendChild(crystalAt(c, x0 + i * step, row[1], 40)); });
    });
    return svg;
  }

  root.loveCrystals = {
    list: DATA.crystals.map(function (c) { return { id: c.id, name: c.name, href: '/' + DATA.room + '#crystal-' + c.id }; }),
    draw: draw,
    pouch: pouch,
    name: function (id) { return byId[id] ? byId[id].name : ''; }
  };

  /* ── Take it with you, on the wheel ────────────────────────────────────── */
  if (typeof document === 'undefined') return;

  function pass() {
    try { var v = JSON.parse(localStorage.getItem(PASS_KEY) || 'null'); return v && v.pass ? v.pass : null; }
    catch (e) { return null; }
  }

  function call(payload) {
    var p = pass();
    if (!p) return Promise.resolve({ status: 0, body: {} });
    return fetch(CRYSTALS, {
      method: 'POST', credentials: 'omit', cache: 'no-store',
      headers: { 'accept': 'application/json', 'content-type': 'application/json', 'authorization': 'Bearer ' + p },
      body: JSON.stringify(payload)
    }).then(function (r) {
      return r.json().then(function (b) { return { status: r.status, body: b || {} }; },
        function () { return { status: r.status, body: {} }; });
    }, function () { return { status: -1, body: {} }; });
  }

  function cards() {
    var takes = document.querySelectorAll('[data-crystal-take]');
    if (!takes.length || !pass()) return;
    for (var i = 0; i < takes.length; i++) (function (row) {
      var btn = row.querySelector('button');
      var said = row.querySelector('[data-crystal-said]');
      if (!btn || !said) return;
      row.hidden = false;
      btn.addEventListener('click', function () {
        btn.disabled = true;
        call({ take: row.getAttribute('data-crystal-take') }).then(function (r) {
          btn.disabled = false;
          if (r.status === 200) {
            said.textContent = r.body.changed
              ? 'It is in your crystal pouch now. Profile, on the radio, shows it.'
              : 'You have this one already. It is in your crystal pouch, in your Profile.';
            try { window.dispatchEvent(new CustomEvent('love-crystals')); } catch (e) {}
            return;
          }
          said.textContent = r.status === 401
            ? 'Since you signed on, this username has been signed off. Sign on again at the Community Center, and press it again.'
            : r.status === -1 ? 'The street could not be reached just now. Nothing was taken.'
            : (r.body && typeof r.body.error === 'string') ? r.body.error : 'That did not work just now. Nothing was taken.';
        });
      });
    })(takes[i]);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', cards);
  else cards();
})(typeof window !== 'undefined' ? window : globalThis);

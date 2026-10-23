/* =============================================================================
   The member map on the Community Center's wall (Ryan's brief, 2026-10-22:
   "Let's move the member map off of Google into S.W").

   The world is drawn in the page already, by tools/make-member-map.py. This
   asks /cb/member-map for every place on the map, where it is and how many of
   us are there, and draws a pin for each, with the number on it where there is
   more than one of us (Ryan's call: "We like knowing how many folks are in
   each place"), and every place in words below, by country, because the
   drawing is hidden from screen readers. There is never a name.

   It zooms (Ryan's question, 2026-10-23: "Can I zoom in on this map?"): by
   the buttons under it, which a keyboard reaches, and by a double press, a
   pinch, Ctrl or Cmd with the scroll wheel, and dragging to move it. The pins
   stay the same size on the screen while the world grows under them, which is
   what pulls a crowded place apart; the closest it goes is a unit of the map
   sixteen pixels wide on any screen. The first time anybody zooms in it asks
   for /member-map-detail.json, the land again, finer, with its lakes and the
   borders between countries and states, so a place zoomed in on has something
   round it. It moves only when somebody presses or drags it, and it jumps
   there rather than gliding, at every setting of the dial. Pressing a pin says
   where it is, under the buttons.

   It builds everything from nodes, keeps nothing and sends nothing.
   tools/make-member-map.py holds it to that.
   ============================================================================= */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var map = document.querySelector('.ctr-map__world');
  var pins = document.querySelector('[data-member-pins]');
  var fine = document.querySelector('[data-member-fine]');
  var land = document.querySelector('[data-member-land]');
  var list = document.querySelector('[data-member-list]');
  var total = document.querySelector('[data-member-total]');
  var strip = document.querySelector('[data-member-zoom]');
  var how = document.querySelector('[data-member-how]');
  var here = document.querySelector('[data-member-here]');
  if (!map || !pins || !list || !total) return;

  var frame = (map.getAttribute('viewBox') || '0 0 1000 434.8').split(/\s+/).map(Number);
  var W = frame[2], H = frame[3];
  var CLOSEST = 16;                          // screen pixels to a unit of the map, at the closest
  var view = { k: 1, cx: W / 2, cy: H / 2 };
  var drawn = [];                            // every pin: its group, circle, number and place
  var picked = null;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function svg(tag, attrs, text) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (text != null) e.textContent = text;
    return e;
  }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
  function r2(v) { return Math.round(v * 100) / 100; }
  // A pin's size in screen pixels by how many are there, so a number fits on it: the same sizes as the image stimpunks.org shows.
  function radius(n) { return n < 2 ? 3.6 : n < 10 ? 8 : 9.5; }
  function where(p) { return p.place + (p.country ? ', ' + p.country : ''); }

  /* Screen pixels to a unit of the map when the whole world is showing. */
  function px() {
    var r = map.getBoundingClientRect(), cs = getComputedStyle(map);
    var w = r.width - (parseFloat(cs.borderLeftWidth) || 0) - (parseFloat(cs.borderRightWidth) || 0);
    return w > 0 ? w / W : 1;
  }
  function closest() { return Math.max(2, CLOSEST / px()); }

  /* The part of the world showing, kept inside the world. */
  function apply() {
    view.k = Math.min(Math.max(view.k, 1), closest());
    var w = W / view.k, h = H / view.k;
    view.cx = Math.min(Math.max(view.cx, w / 2), W - w / 2);
    view.cy = Math.min(Math.max(view.cy, h / 2), H - h / 2);
    map.setAttribute('viewBox', [view.cx - w / 2, view.cy - h / 2, w, h].map(r2).join(' '));
    var u = 1 / (px() * view.k);            // units of the map to a screen pixel
    drawn.forEach(function (d) {
      d.c.setAttribute('r', r2(radius(d.p.n) * u));
      if (d.t) d.t.style.fontSize = r2((d.p.n < 10 ? 11 : 10) * u) + 'px';
    });
    var zoomed = view.k > 1.001;
    map.classList.toggle('is-zoomed', zoomed);
    if (zoomed) detail();
    if (!strip) return;
    var edge = 0.01;
    off('[data-zoom="in"]', view.k >= closest() - 0.001);
    off('[data-zoom="out"]', !zoomed);
    off('[data-zoom="world"]', !zoomed);
    off('[data-pan="west"]', view.cx - w / 2 <= edge);
    off('[data-pan="east"]', view.cx + w / 2 >= W - edge);
    off('[data-pan="north"]', view.cy - h / 2 <= edge);
    off('[data-pan="south"]', view.cy + h / 2 >= H - edge);
    if (how) how.textContent = zoomed ? times(view.k) + ' times closer.' : 'The whole world.';
  }
  function off(sel, yes) {
    var b = strip.querySelector(sel);
    if (b) b.setAttribute('aria-disabled', yes ? 'true' : 'false');
  }
  function times(k) { return k < 10 ? String(Math.round(k * 10) / 10) : String(Math.round(k)); }

  /* Zoom by f, keeping the point p of the map where it is on the screen. */
  function zoomAt(f, p) {
    var k0 = view.k;
    view.k = Math.min(Math.max(k0 * f, 1), closest());
    var s = k0 / view.k;
    view.cx = p.x - (p.x - view.cx) * s;
    view.cy = p.y - (p.y - view.cy) * s;
    apply();
  }
  function middle() { return { x: view.cx, y: view.cy }; }
  /* Where on the map a point on the screen is. */
  function at(x, y) {
    var m = map.getScreenCTM();
    if (!m) return middle();
    var p = map.createSVGPoint ? map.createSVGPoint() : new DOMPoint();
    p.x = x; p.y = y;
    p = p.matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  }

  /* The world finer, with lakes and borders, the first time anybody zooms in. */
  var asked = false;
  function detail() {
    if (asked || !fine || !land) return;
    asked = true;
    fetch('/member-map-detail.json', { headers: { accept: 'application/json' }, credentials: 'omit' })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (d) {
        if (d.land) land.setAttribute('d', d.land);
        [['lakes', 'ctr-map__lake'], ['states', 'ctr-map__state'], ['borders', 'ctr-map__border']].forEach(function (layer) {
          if (d[layer[0]]) fine.appendChild(svg('path', { 'class': layer[1], d: d[layer[0]] }));
        });
      }, function () { asked = false; });   // the plainer world stays, and the next zoom asks again
  }

  function pick(d) {
    if (picked) picked.g.classList.remove('is-picked');
    picked = d;
    if (!d) { if (here) here.textContent = ''; return; }
    d.g.classList.add('is-picked');
    if (here) here.textContent = where(d.p) + ': ' + (d.p.n === 1 ? 'one of us' : d.p.n + ' of us') + '.';
  }

  if (strip) {
    strip.hidden = false;
    strip.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b || b.getAttribute('aria-disabled') === 'true') return;
      var z = b.getAttribute('data-zoom'), d = b.getAttribute('data-pan');
      if (z === 'in') zoomAt(2, middle());
      else if (z === 'out') zoomAt(0.5, middle());
      else if (z === 'world') { view.k = 1; view.cx = W / 2; view.cy = H / 2; apply(); }
      else if (d) {
        var step = 0.3;
        view.cx += (d === 'east' ? 1 : d === 'west' ? -1 : 0) * step * W / view.k;
        view.cy += (d === 'south' ? 1 : d === 'north' ? -1 : 0) * step * H / view.k;
        apply();
      }
    });
  }

  /* Hands: drag to move it once it is zoomed in, two fingers to pinch, a double press to zoom in there. */
  var down = {}, moved = false, pinch = null, kind = 'mouse', tap = null;
  function spread() {
    var ps = Object.keys(down).map(function (id) { return down[id]; });
    if (ps.length < 2) return null;
    return { d: Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y), x: (ps[0].x + ps[1].x) / 2, y: (ps[0].y + ps[1].y) / 2 };
  }
  map.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    kind = e.pointerType;
    down[e.pointerId] = { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY };
    moved = false;
    var two = Object.keys(down).length >= 2;
    if (two) pinch = spread();
    if (two || view.k > 1.001) { try { map.setPointerCapture(e.pointerId); } catch (_) { /* nothing to capture */ } }
  });
  map.addEventListener('pointermove', function (e) {
    var was = down[e.pointerId];
    if (!was) return;
    if (Object.keys(down).length >= 2) {
      was.x = e.clientX; was.y = e.clientY;
      var now = spread();
      if (pinch && now && pinch.d > 0 && now.d > 0) {
        // The spot that was between the fingers follows them, and the world grows round it.
        var p = at(pinch.x, pinch.y), u = 1 / (px() * view.k);
        view.cx -= (now.x - pinch.x) * u; view.cy -= (now.y - pinch.y) * u;
        zoomAt(now.d / pinch.d, p);
      }
      pinch = now; moved = true;
      return;
    }
    if (view.k <= 1.001) return;            // the whole world: nothing to drag, and a finger scrolls the page
    if (!moved && Math.abs(e.clientX - was.x0) + Math.abs(e.clientY - was.y0) < 5) return;
    moved = true;
    var u = 1 / (px() * view.k);
    view.cx -= (e.clientX - was.x) * u; view.cy -= (e.clientY - was.y) * u;
    was.x = e.clientX; was.y = e.clientY;
    apply();
  });
  function lift(e) {
    var was = down[e.pointerId];
    delete down[e.pointerId];
    if (Object.keys(down).length < 2) pinch = null;
    // A double tap with a finger or pen zooms in there; a mouse's double click is dblclick's.
    if (e.type === 'pointerup' && was && !moved && e.pointerType !== 'mouse') {
      var t = e.timeStamp;
      if (tap && t - tap.t < 350 && Math.hypot(e.clientX - tap.x, e.clientY - tap.y) < 30) { tap = null; zoomAt(2, at(e.clientX, e.clientY)); }
      else tap = { t: t, x: e.clientX, y: e.clientY };
    }
  }
  map.addEventListener('pointerup', lift);
  map.addEventListener('pointercancel', lift);
  map.addEventListener('dblclick', function (e) {
    e.preventDefault();
    if (kind === 'mouse') zoomAt(2, at(e.clientX, e.clientY));
  });
  map.addEventListener('wheel', function (e) {
    if (!e.ctrlKey && !e.metaKey) return;   // the plain wheel scrolls the page, as it always does
    e.preventDefault();
    var dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * 400 : e.deltaY;
    zoomAt(Math.exp(-Math.max(-60, Math.min(60, dy)) * 0.01), at(e.clientX, e.clientY));
  }, { passive: false });
  pins.addEventListener('click', function (e) {
    if (moved) return;
    var g = e.target.closest('.ctr-map__pin');
    var d = g && drawn.filter(function (x) { return x.g === g; })[0];
    pick(d || null);
  });
  window.addEventListener('resize', apply);

  function draw(m) {
    var places = m.places || [];
    // The busiest places first, so a place on its own beside them is drawn over them and never hidden.
    places.slice().sort(function (a, b) { return b.n - a.n; }).forEach(function (p) {
      var g = svg('g', { 'class': 'ctr-map__pin' + (p.n > 1 ? ' ctr-map__pin--many' : '') });
      var c = svg('circle', { cx: p.x, cy: p.y, r: radius(p.n) });
      g.appendChild(svg('title', {}, where(p) + ': ' + p.n));
      g.appendChild(c);
      var t = null;
      if (p.n > 1) g.appendChild(t = svg('text', { x: p.x, y: p.y, dy: '0.35em', 'text-anchor': 'middle', 'class': 'ctr-map__count' }, String(p.n)));
      pins.appendChild(g);
      drawn.push({ g: g, c: c, t: t, p: p });
    });
    apply();
    var countries = m.countries || [];
    total.textContent = places.length
      ? plural(m.total, 'of us', 'of us') + ' in ' + plural(places.length, 'place', 'places') + ', in ' + plural(countries.filter(function (c) { return c.country; }).length, 'country', 'countries') + '. Every place is listed in words below.'
      : 'Nobody is on the map yet.';
    list.textContent = '';
    var ul = el('ul', 'ctr-map__countries');
    countries.forEach(function (c) {
      var li = el('li');
      li.appendChild(el('strong', null, (c.country || 'Somewhere not named') + ': ' + c.n));
      var inner = el('ul', 'ctr-map__places');
      places.filter(function (p) { return (p.country || '') === (c.country || ''); }).forEach(function (p) {
        inner.appendChild(el('li', null, p.place + (p.n > 1 ? ': ' + p.n : '')));
      });
      li.appendChild(inner);
      ul.appendChild(li);
    });
    list.appendChild(ul);
  }

  apply();
  fetch('/cb/member-map', { headers: { accept: 'application/json' }, credentials: 'omit', cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
    .then(draw, function () { total.textContent = 'The places on the map could not be read just now. The world is still here; try again later.'; });
})();

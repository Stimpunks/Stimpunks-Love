/* =============================================================================
   The member map on the Community Center's wall (Ryan's brief, 2026-10-22:
   "Let's move the member map off of Google into S.W").

   The world is drawn in the page already, by tools/make-member-map.py. This
   asks /cb/member-map, the one thing it asks, for every place on the map,
   where it is and how many of us are there, and draws a pin for each, with
   the number on it where there is more than one of us (Ryan's call: "We like
   knowing how many folks are in each place"), and every place in words below,
   by country, because the drawing is hidden from screen readers. There is
   never a name. It builds everything from nodes, keeps nothing and sends
   nothing. tools/make-member-map.py holds it to that.
   ============================================================================= */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var pins = document.querySelector('[data-member-pins]');
  var list = document.querySelector('[data-member-list]');
  var total = document.querySelector('[data-member-total]');
  if (!pins || !list || !total) return;

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
  // A pin's size by how many are there, so a number fits on it: the same sizes as the image stimpunks.org shows.
  function radius(n) { return n < 2 ? 3.6 : n < 10 ? 8 : 9.5; }

  function draw(m) {
    var places = m.places || [];
    // The busiest places first, so a place on its own beside them is drawn over them and never hidden.
    places.slice().sort(function (a, b) { return b.n - a.n; }).forEach(function (p) {
      var g = svg('g', { 'class': 'ctr-map__pin' + (p.n > 1 ? ' ctr-map__pin--many' : '') + (p.n > 9 ? ' ctr-map__pin--wide' : '') });
      g.appendChild(svg('circle', { cx: p.x, cy: p.y, r: radius(p.n) }));
      if (p.n > 1) g.appendChild(svg('text', { x: p.x, y: p.y, dy: '0.35em', 'text-anchor': 'middle', 'class': 'ctr-map__count' }, String(p.n)));
      pins.appendChild(g);
    });
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

  fetch('/cb/member-map', { headers: { accept: 'application/json' }, credentials: 'omit', cache: 'no-store' })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
    .then(draw, function () { total.textContent = 'The places on the map could not be read just now. The world is still here; try again later.'; });
})();

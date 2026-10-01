/* =============================================================================
   The finder: a search box for rooms, on the front page and on the Map.

   Helen Edgar's ask, 2026-10-01: "Can we please have a search tool bar at
   top?" Ryan's call the same day: a box near the top of the street and of the
   Map, and nowhere else, because the teleporter already searches from every
   page and a box at the top of every room would be the street's furniture
   laid over every world.

   IT IS THE TELEPORTER'S SEARCH, character for character (findRooms, below,
   is also in cb.js and guest.js, and tools/check-teleport.py refuses the
   three apart), over the same /cb-rooms.json, fetched from this site the first
   time somebody types and not before. What it finds are ordinary links, so a
   result is reached the way any link is; Enter goes to the first one.

   The box ships hidden, so a page with no script shows no box that does
   nothing; the Map and the street's row of doors are what that page has.
   It says what it found first and never how many, because nothing on this
   street counts the rooms. It stores nothing and sends nothing anywhere.
   Each page dresses it in its own section of love.css: the markup carries
   data-finder and nothing here sets a colour.
   ============================================================================= */
(function () {
  'use strict';

  var ROOMPATH = /^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\.html)?$/;
  var rooms = null, asked = null;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function herePath() {
    var p = location.pathname.replace(/\/index(?:\.html)?$/, '/');
    return p === '/' ? '/' : p.replace(/\.html$/, '') + '.html';
  }
  function load() {
    if (asked) return asked;
    asked = fetch('/cb-rooms.json', { credentials: 'omit', headers: { 'accept': 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        var ok = [];
        ((d && d.rooms) || []).forEach(function (r) {
          if (r && typeof r.tag === 'string' && typeof r.name === 'string' && typeof r.path === 'string' && ROOMPATH.test(r.path)) ok.push(r);
        });
        rooms = ok;
        return !!d;
      })
      .catch(function () { rooms = []; return false; });
    return asked;
  }

  /* WHAT THE TELEPORTER FINDS. Helen Edgar's asks, 2026-10-01: "fire" should
     find The Campfire, and a keyword should find the rooms it is about. So a
     room is found three ways, and every word typed has to be found in it:
     a name that starts with what you typed (the #tag completion's rule),
     then a name with it inside a word (fire, Campfire), then the room's own
     description, `about` in cb-rooms.json, which make-sitemap.py copies off
     the page's <meta name="description"> so nobody keeps a keyword list.
     Each group is in walking order and nothing is ranked within it. Small
     words (the, of, a) are looked for in names only, and a word shorter than
     three letters is not looked for inside names or in descriptions, so one
     letter does not offer the whole street. A room found by its description
     says the words it was found in. THIS IS ALSO IN guest.js AND finder.js,
     AND ALL THREE MUST STAY THE SAME; tools/check-teleport.py refuses them apart. */
  var TP_SMALL = /^(?:a|an|and|as|at|by|for|from|in|into|is|it|its|of|on|or|the|to|with)$/;
  function tpFold(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function tpWords(s) { return tpFold(s).split(/[^a-z0-9]+/).filter(Boolean); }
  // dogs finds dog: a plural is looked for as its singular, which also finds the plural.
  function tpRoot(t) { return t.length > 3 && /[^s]s$/.test(t) ? t.slice(0, -1) : t; }
  function tpBegins(words, t) { for (var i = 0; i < words.length; i++) if (words[i].indexOf(t) === 0) return true; return false; }
  function tpHas(words, t) { for (var i = 0; i < words.length; i++) if (words[i].indexOf(t) >= 0) return true; return false; }
  function tpAll(terms, test) { for (var i = 0; i < terms.length; i++) if (!test(terms[i])) return false; return true; }
  // A few words either side of the first one that matched, as written on the page.
  function tpWhy(about, t) {
    var bits = about.split(/\s+/);
    for (var i = 0; i < bits.length; i++) {
      if (!tpBegins(tpWords(bits[i]), t)) continue;
      var from = Math.max(0, i - 3), to = Math.min(bits.length, i + 5);
      return (from ? '…' : '') + bits.slice(from, to).join(' ').replace(/[,;:.]$/, '') + (to < bits.length ? '…' : '');
    }
    return '';
  }
  function findRooms(text) {
    var typed = tpWords(String(text).replace(/^\s*#/, ''));
    var terms = typed.map(tpRoot);
    var begins = [], inside = [], about = [];
    if (!terms.length) { for (var a = 0; a < rooms.length; a++) begins.push({ room: rooms[a], why: '' }); return begins; }
    var flat = terms.join(''), tag = typed.join('-');
    var keys = terms.filter(function (t) { return !TP_SMALL.test(t); });
    var long = tpAll(terms, function (t) { return t.length >= 3 || TP_SMALL.test(t); });
    var wide = keys.length > 0 && tpAll(keys, function (t) { return t.length >= 3; });
    for (var i = 0; i < rooms.length; i++) {
      var r = rooms[i], name = tpWords(r.name);
      if (r.tag.indexOf(tag) === 0 || name.join('').indexOf(flat) === 0 ||
          tpAll(terms, function (t) { return tpBegins(name, t); })) { begins.push({ room: r, why: '' }); continue; }
      if (long && tpAll(terms, function (t) { return tpHas(name, t); })) { inside.push({ room: r, why: '' }); continue; }
      if (!wide || typeof r.about !== 'string') continue;
      var said = tpWords(r.about);
      if (!tpAll(keys, function (t) { return tpBegins(said, t) || tpHas(name, t); })) continue;
      var shown = '';
      for (var k = 0; !shown && k < keys.length; k++) if (!tpHas(name, keys[k])) shown = tpWhy(r.about, keys[k]);
      about.push({ room: r, why: shown });
    }
    return begins.concat(inside, about);
  }

  function wire(form) {
    var q = form.querySelector('[data-finder-q]');
    var out = form.querySelector('[data-finder-out]');
    var said = form.querySelector('[data-finder-said]');
    if (!q || !out || !said) return;
    // Each page names its own parts (check-classes.py), so the results take
    // the page's name for the box: finder on the street, mm-find on the Map.
    var name = form.className.split(/\s+/)[0];
    var first = null;

    function draw(ok) {
      out.textContent = '';
      first = null;
      if (!q.value.trim()) { said.textContent = ''; out.hidden = true; return; }
      if (!rooms) { said.textContent = 'Finding the rooms\u2026'; out.hidden = true; return; }
      if (!ok && !rooms.length) { said.textContent = 'The list of rooms cannot be reached just now.'; out.hidden = true; return; }
      var found = findRooms(q.value), here = herePath();
      for (var i = 0; i < found.length; i++) {
        var r = found[i].room, li = el('li', name + '__room');
        var a = el('a', name + '__go', r.name);
        a.href = r.path;
        if (r.path === here) a.setAttribute('aria-current', 'page');
        li.appendChild(a);
        if (r.path === here) li.appendChild(el('span', name + '__here', ' you are here'));
        if (found[i].why) li.appendChild(el('span', name + '__why', found[i].why));
        out.appendChild(li);
      }
      first = found.length ? found[0].room : null;
      out.hidden = !found.length;
      said.textContent = first ? 'First: ' + first.name + '. Enter goes there.' : 'No room by that name, or about that.';
    }

    q.addEventListener('input', function () {
      if (rooms) { draw(true); return; }
      draw(false);
      load().then(function (ok) { draw(ok); });
    });
    q.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && q.value) { e.preventDefault(); q.value = ''; draw(true); }
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (first) location.href = first.path;
    });
    form.hidden = false;
  }

  var forms = document.querySelectorAll('[data-finder]');
  for (var i = 0; i < forms.length; i++) wire(forms[i]);
})();

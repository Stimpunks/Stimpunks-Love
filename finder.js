/* =============================================================================
   The finder: the street's search, on the front page and on the Map. It
   finds rooms by name and what they are about, and then every section of
   every page that holds the words (Ryan's ask the same day: site search,
   like all our other sites).

   Helen Edgar's ask, 2026-10-01: "Can we please have a search tool bar at
   top?" Ryan's call the same day: a box near the top of the street and of the
   Map, and nowhere else, because the teleporter already searches from every
   page and a box at the top of every room would be the street's furniture
   laid over every world.

   ROOMS FIRST, BY THE TELEPORTER'S SEARCH, character for character (findRooms, below,
   is also in cb.js and guest.js, and tools/check-teleport.py refuses the
   three apart), over the same /cb-rooms.json, fetched from this site the first
   time somebody types and not before. Then the pages' words, out of
   /search-index.json (findWords, below). What it finds are ordinary links,
   so a result is reached the way any link is; Enter goes to the first one.

   The box ships hidden, so a page with no script shows no box that does
   nothing; the Map and the street's row of doors are what that page has.
   It says what it found first and never how many, because nothing on this
   street counts the rooms, and More shows the next few without a number. It stores nothing and sends nothing anywhere.
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

  /* THE WORDS ON THE PAGES (Ryan, 2026-10-01: "Add site search"). Every
     section of every page, out of /search-index.json, which
     tools/make-search-index.py reads off each page's own <main>. Fetched the
     first time somebody types and not before, and searched here: nothing
     anybody types leaves the browser. Rooms found by name come first, as the
     teleporter finds them; these come after. Every word typed has to be in a
     section for it to be found, and the sections with the most of them come
     first, the changelog's after everything else, because it is mostly the
     street describing its own week. */
  var words = null, askedWords = null;
  function loadWords() {
    if (askedWords) return askedWords;
    askedWords = fetch('/search-index.json', { credentials: 'omit', headers: { 'accept': 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !d.pages || !d.records) { words = []; return false; }
        words = [];
        for (var i = 0; i < d.records.length; i++) {
          var r = d.records[i], pg = d.pages[r[0]];
          if (!pg || typeof pg[0] !== 'string' || !ROOMPATH.test(pg[0])) continue;
          words.push({ path: pg[0], page: pg[1], anchor: r[1], heading: r[2], text: r[3], by: r[4], order: i,
            log: pg[0] === '/changelog.html',
            f: ' ' + tpWords(r[2] + ' ' + r[3] + ' ' + (r[4] && r[4] !== '-' ? r[4] : '')).join(' ') + ' ',
            fh: ' ' + tpWords(r[2]).join(' ') + ' ' });
        }
        return true;
      })
      .catch(function () { words = []; return false; });
    return askedWords;
  }
  // Two letters must be a whole word (AI, UK); three or more may start one.
  function needle(t) { return ' ' + t + (t.length < 3 ? ' ' : ''); }
  function hits(hay, t) {
    var n = 0, at = hay.indexOf(needle(t));
    while (at >= 0 && n < 5) { n++; at = hay.indexOf(needle(t), at + 1); }
    return n;
  }
  function findWords(text) {
    var keys = tpWords(String(text)).map(tpRoot).filter(function (t) { return !TP_SMALL.test(t); });
    if (!keys.length || !words) return [];
    var out = [];
    for (var i = 0; i < words.length; i++) {
      var w = words[i], score = 0, all = true;
      for (var k = 0; k < keys.length && all; k++) {
        var n = hits(w.f, keys[k]);
        if (!n) all = false;
        score += n + (w.fh.indexOf(needle(keys[k])) >= 0 ? 4 : 0);
      }
      if (all) out.push({ w: w, score: score });
    }
    out.sort(function (x, y) {
      return (x.w.log - y.w.log) || (y.score - x.score) || (x.w.order - y.w.order);
    });
    return out.map(function (o) { return o.w; });
  }
  /* A few lines round the first match, as written, never cutting into a
     quotation: a window that would start or end inside one is widened to hold
     all of it. A <blockquote> never gets here at all; it is shown by its
     credit, in draw(). */
  function snippet(text, keys) {
    var fs = '', map = [];
    for (var i = 0; i < text.length; i++) {
      var c = tpFold(text.charAt(i)).replace(/[^a-z0-9]/g, ' ');
      for (var j = 0; j < c.length; j++) { fs += c.charAt(j); map.push(i); }
    }
    fs = ' ' + fs + ' ';
    var at = -1, len = 0;
    for (var k = 0; k < keys.length && at < 0; k++) {
      var f = fs.indexOf(needle(keys[k]));
      if (f >= 0) { at = map[Math.min(f, map.length - 1)]; len = keys[k].length; }
    }
    if (at < 0) at = 0;
    var start = Math.max(0, at - 90), end = Math.min(text.length, at + 160);
    var q = /“[^“”]{0,600}”/g, m;
    while ((m = q.exec(text))) {
      var a = m.index, b = m.index + m[0].length;
      if (a < start && b > start) start = a;
      if (a < end && b > end) end = b;
    }
    if (start > 0) { var sp = text.lastIndexOf(' ', start); start = sp < 0 ? 0 : sp + 1; }
    if (end < text.length) { var ep = text.indexOf(' ', end); end = ep < 0 ? text.length : ep; }
    var wordEnd = at;
    while (wordEnd < text.length && /[^\s.,;:!?’”)]/.test(text.charAt(wordEnd))) wordEnd++;
    if (wordEnd - at < len) wordEnd = Math.min(text.length, at + len);
    return { before: (start > 0 ? '…' : '') + text.slice(start, at), hit: text.slice(at, wordEnd),
             after: text.slice(wordEnd, end) + (end < text.length ? '…' : '') };
  }

  var STEP = 10;

  function wire(form) {
    var q = form.querySelector('[data-finder-q]');
    var out = form.querySelector('[data-finder-out]');
    var said = form.querySelector('[data-finder-said]');
    var roomsH = form.querySelector('[data-finder-rooms-h]');
    var wordsH = form.querySelector('[data-finder-words-h]');
    var wout = form.querySelector('[data-finder-words]');
    var more = form.querySelector('[data-finder-more]');
    if (!q || !out || !said || !wout || !more || !roomsH || !wordsH) return;
    // Each page names its own parts (check-classes.py), so the results take
    // the page's name for the box: finder on the street, mm-find on the Map.
    var name = form.className.split(/\s+/)[0];
    var first = null, found = [], shown = 0;

    function wordItem(w, keys) {
      var li = el('li', name + '__room');
      var a = el('a', name + '__go', w.heading && w.heading !== w.page ? w.page + ' · ' + w.heading : w.page);
      a.href = w.path + (w.anchor ? '#' + w.anchor : '');
      li.appendChild(a);
      if (w.by) {
        // A quotation is never shown cut down, so it is not shown: its credit is.
        li.appendChild(el('span', name + '__why', w.by === '-'
          ? 'Found in a quotation in this section.'
          : 'Found in a quotation in this section, credited: ' + w.by));
      } else {
        var s = snippet(w.text, keys), p = el('span', name + '__why');
        p.appendChild(document.createTextNode(s.before));
        p.appendChild(el('b', null, s.hit));
        p.appendChild(document.createTextNode(s.after));
        li.appendChild(p);
      }
      return li;
    }
    function showMore(focusNew) {
      var keys = tpWords(q.value).map(tpRoot).filter(function (t) { return !TP_SMALL.test(t); });
      var firstNew = null;
      for (var i = shown; i < Math.min(found.length, shown + STEP); i++) {
        var li = wordItem(found[i], keys);
        if (!firstNew) firstNew = li;
        wout.appendChild(li);
      }
      shown = Math.min(found.length, shown + STEP);
      more.hidden = shown >= found.length;
      if (focusNew && firstNew && more.hidden) firstNew.querySelector('a').focus();
    }

    function draw(ok) {
      out.textContent = '';
      wout.textContent = '';
      first = null; found = []; shown = 0;
      more.hidden = true;
      var empty = !q.value.trim();
      if (empty) { said.textContent = ''; out.hidden = wout.hidden = roomsH.hidden = wordsH.hidden = true; return; }
      if (!rooms) { said.textContent = 'Finding the rooms…'; out.hidden = wout.hidden = roomsH.hidden = wordsH.hidden = true; return; }
      var hit = findRooms(q.value), here = herePath();
      for (var i = 0; i < hit.length; i++) {
        var r = hit[i].room, li = el('li', name + '__room');
        var a = el('a', name + '__go', r.name);
        a.href = r.path;
        if (r.path === here) a.setAttribute('aria-current', 'page');
        li.appendChild(a);
        if (r.path === here) li.appendChild(el('span', name + '__here', ' you are here'));
        if (hit[i].why) li.appendChild(el('span', name + '__why', hit[i].why));
        out.appendChild(li);
      }
      out.hidden = roomsH.hidden = !hit.length;
      found = findWords(q.value);
      showMore(false);
      wout.hidden = wordsH.hidden = !found.length;
      var room = hit.length ? hit[0].room : null, word = found.length ? found[0] : null;
      first = room ? room.path : word ? word.path + (word.anchor ? '#' + word.anchor : '') : null;
      var where = room ? room.name : word ? (word.heading && word.heading !== word.page ? word.page + ', ' + word.heading : word.page) : '';
      if (first) said.textContent = 'First: ' + where + '. Enter goes there.';
      else if (!words) said.textContent = ok ? 'Reading the pages…' : 'The list of rooms cannot be reached just now.';
      else said.textContent = 'Nothing on the street has that, by name or in its words.';
    }

    function ready() {
      draw(true);
      if (!words) loadWords().then(function () { draw(true); });
    }
    q.addEventListener('input', function () {
      if (rooms) { ready(); return; }
      draw(false);
      load().then(function (ok) { if (ok) ready(); else draw(false); });
    });
    q.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && q.value) { e.preventDefault(); q.value = ''; draw(true); }
    });
    more.addEventListener('click', function () { showMore(true); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (first) location.href = first;
    });
    form.hidden = false;
  }

  var forms = document.querySelectorAll('[data-finder]');
  for (var i = 0; i < forms.length; i++) wire(forms[i]);
})();

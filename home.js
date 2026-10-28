/* =============================================================================
   Home, the community dashboard, on home.html. Ryan's brief, 2026-10-27:
   somewhere for people signed on to the CB to land, see what is new to them,
   and find what the street has. The radio's bar links here (a house with a CB
   aerial where it said CB), and the joining page sends a new member here.

   THE CB'S, DRESSED AS THE CB, as the directory and the forums are: a shadow
   root with cb.css and home.css the only sheets that reach it, in the theme
   the reader's radio wears. home.css names no colour of its own, and every
   drawing here is in that theme's seven inks, never in the colours of the
   place it points at: a page of every room in its own colours is the swatch
   book the Map refuses.

   IT KEEPS NOTHING AND SENDS NOTHING NEW. It reads love-cb for the pass and
   never writes it, and asks only what the radio and the forums already
   answer, each the way they already ask: /cb/unread and /cb/events with an
   empty body (never a read, never an action), /cb/online, /cb/forum's latest,
   /cb/brass, /cb/props, /cb/rooms, and the street's own public files. The
   rooms you follow are the radio's, in love-cb; a Follow switch here asks the
   radio (window.loveRadioFollow), which keeps them. It asks once when the page
   opens and again only when you press Look again: no timer.

   MARKS, NEVER NUMBERS. Something new is a dot and the words "something new",
   as on the radio's Unreads. Nothing here says how many of anything, and
   nobody is counted. Nothing moves. tools/check-home.py holds all of this.
   ============================================================================= */
(function () {
  'use strict';

  var mount = document.querySelector('[data-home]');
  if (!mount) return;
  var SVGNS = 'http://www.w3.org/2000/svg';
  var WORLD = 'world';

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function cbState() {
    try { var v = JSON.parse(localStorage.getItem('love-cb') || 'null'); return v && v.pass ? v : null; }
    catch (e) { return null; }
  }
  function link(href, text, cls) { var a = el('a', cls || null, text); a.href = href; return a; }
  function words(p, parts) {
    parts.forEach(function (x) { p.appendChild(typeof x === 'string' ? document.createTextNode(x) : x); });
    return p;
  }
  function button(text, cls) { var b = el('button', 'cb-btn' + (cls ? ' ' + cls : ''), text); b.type = 'button'; return b; }
  // Only a path on this site, never an address somebody else's words could steer.
  function local(href) {
    try {
      var u = new URL(href, location.href);
      // The feed writes the street's own address in full, which is this site wherever it is served from.
      return u.origin === location.origin || u.origin === 'https://stimpunks.world' ? u.pathname + u.search + u.hash : null;
    }
    catch (e) { return null; }
  }
  function when(t) {
    if (typeof t !== 'number') return '';
    var d = new Date(t), now = new Date();
    try {
      if (d.toDateString() === now.toDateString()) return 'today, ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
      var o = { weekday: 'short', day: 'numeric', month: 'short' };
      if (d.getFullYear() !== now.getFullYear()) o.year = 'numeric';
      return d.toLocaleDateString(undefined, o);
    } catch (e) { return d.toISOString().slice(0, 10); }
  }
  // The changelog's entries carry a day and no real time of day, so a day is all it says.
  function day(t) {
    var d = new Date(t), now = new Date();
    if (d.toDateString() === now.toDateString()) return 'today';
    try { return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined }); }
    catch (e) { return d.toISOString().slice(0, 10); }
  }
  function whenAt(t) {
    try { return new Date(t).toLocaleString(undefined, { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }); }
    catch (e) { return new Date(t).toISOString().slice(0, 16).replace('T', ' '); }
  }

  /* ── The box ───────────────────────────────────────────────────────────── */

  var host = el('div', 'hm-mount');
  var root = host.attachShadow({ mode: 'open' });
  var waiting = 2;
  host.style.visibility = 'hidden';
  ['/cb.css', '/home.css'].forEach(function (href) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    function ready() { if (--waiting === 0) host.style.visibility = ''; }
    l.addEventListener('load', ready);
    l.addEventListener('error', ready);
    root.appendChild(l);
  });
  var box = el('div', 'hm');
  root.appendChild(box);
  mount.textContent = '';
  mount.appendChild(host);

  /* The same colours as my radio: what its host wears, or call.js's answer
     for what it would wear when there is no radio on the page. Nothing moves
     here, whatever the radio does. */
  function radioHost() { return document.querySelector('.cb-host'); }
  function dressNow() {
    var lc = window.loveCall, r = radioHost(), s = cbState(), look = null;
    if (r && r.getAttribute('data-scheme')) look = r.getAttribute('data-scheme');
    else if (lc && lc.schemeFor) look = lc.schemeFor((s && s.scheme) || 'auto');
    if (look) host.setAttribute('data-scheme', look);
    host.setAttribute('data-motion', 'off');
  }
  dressNow();
  try {
    var watched = null;
    var onHost = new MutationObserver(dressNow);
    new MutationObserver(function () {
      var r = radioHost();
      if (r && r !== watched) { watched = r; onHost.observe(r, { attributes: true, attributeFilter: ['data-scheme'] }); dressNow(); }
    }).observe(document.body, { childList: true });
  } catch (e) { /* Home keeps the colours it opened in */ }
  ['(prefers-contrast: more)', '(prefers-color-scheme: light)'].forEach(function (q) {
    try { window.matchMedia(q).addEventListener('change', dressNow); } catch (e) { /* an old browser */ }
  });

  /* A part of Home: a heading of its own, and its body. */
  function part(id, title, intro) {
    var sec = el('section', 'hm-sec');
    var h = el('h2', 'hm-h', title);
    h.id = 'hm-' + id;
    sec.setAttribute('aria-labelledby', h.id);
    sec.appendChild(h);
    if (intro) sec.appendChild(el('p', 'hm-intro', intro));
    var body = el('div', 'hm-body');
    sec.appendChild(body);
    return { sec: sec, body: body };
  }
  function quiet(where, text) { where.textContent = ''; where.appendChild(el('p', 'cb-quiet', text)); }

  /* ── The drawings ─────────────────────────────────────────────────────────
     Each place's own shape, in the reader's radio theme: a line is the theme's
     steel, a lit part its amber, a plate its bar and a readout its lcd, the
     seven inks check-contrast.py already measures for every theme. aria-hidden:
     the words beside each drawing say what the place is. */
  var ART = {
    chat: [
      ['rect', { x: 10, y: 8, width: 62, height: 32, rx: 11 }, 'hm-plate hm-ln'],
      ['path', { d: 'M26 40l-5 11 15-11' }, 'hm-plate hm-ln'],
      ['path', { d: 'M22 20h38M22 28h26' }, 'hm-hl'],
      ['rect', { x: 48, y: 30, width: 62, height: 30, rx: 11 }, 'hm-lcd hm-hl'],
      ['path', { d: 'M94 60l7 9-16-9' }, 'hm-lcd hm-hl'],
      ['circle', { cx: 66, cy: 45, r: 3.2 }, 'hm-dot'],
      ['circle', { cx: 79, cy: 45, r: 3.2 }, 'hm-dot'],
      ['circle', { cx: 92, cy: 45, r: 3.2 }, 'hm-dot'],
    ],
    forums: [
      ['rect', { x: 26, y: 6, width: 78, height: 17, rx: 3 }, 'hm-plate hm-ln'],
      ['rect', { x: 14, y: 28, width: 78, height: 17, rx: 3 }, 'hm-lcd hm-hl'],
      ['rect', { x: 30, y: 50, width: 78, height: 17, rx: 3 }, 'hm-plate hm-ln'],
      ['circle', { cx: 35, cy: 14.5, r: 3 }, 'hm-dot'],
      ['circle', { cx: 23, cy: 36.5, r: 3 }, 'hm-dot'],
      ['circle', { cx: 39, cy: 58.5, r: 3 }, 'hm-dot'],
      ['path', { d: 'M44 14.5h48M32 36.5h50M48 58.5h44' }, 'hm-ln'],
    ],
    wiki: [
      ['path', { d: 'M60 16C46 8 27 8 12 14v46c15-6 34-6 48 2z' }, 'hm-plate hm-ln'],
      ['path', { d: 'M60 16c14-8 33-8 48-2v46c-15-6-34-6-48 2z' }, 'hm-plate hm-ln'],
      ['path', { d: 'M60 16v46' }, 'hm-ln'],
      ['path', { d: 'M20 24c10-3 22-3 32 1M20 33c10-3 22-3 32 1M20 42c10-3 22-3 32 1' }, 'hm-hl'],
      ['path', { d: 'M68 25c10-4 22-4 32-1M68 34c10-4 22-4 32-1M68 43c10-4 18-4 24-2' }, 'hm-ln'],
    ],
    events: [
      ['rect', { x: 28, y: 12, width: 64, height: 54, rx: 5 }, 'hm-plate hm-ln'],
      ['path', { d: 'M28 26h64' }, 'hm-ln'],
      ['rect', { x: 29.5, y: 13.5, width: 61, height: 11, rx: 4 }, 'hm-lcd'],
      ['path', { d: 'M42 6v12M78 6v12' }, 'hm-hl'],
      ['path', { d: 'M38 36h6M52 36h6M66 36h6M80 36h4M38 46h6M52 46h6M80 46h4M38 56h6M52 56h6M66 56h6' }, 'hm-ln'],
      ['circle', { cx: 69, cy: 46, r: 6.5 }, 'hm-hl'],
    ],
    brass: [
      ['rect', { x: 16, y: 10, width: 88, height: 52, rx: 4 }, 'hm-lcd hm-hl'],
      ['rect', { x: 24, y: 18, width: 72, height: 36, rx: 2 }, 'hm-ln'],
      ['circle', { cx: 22, cy: 16, r: 3.2 }, 'hm-dot'],
      ['circle', { cx: 98, cy: 16, r: 3.2 }, 'hm-dot'],
      ['circle', { cx: 22, cy: 56, r: 3.2 }, 'hm-dot'],
      ['circle', { cx: 98, cy: 56, r: 3.2 }, 'hm-dot'],
      ['path', { d: 'M34 30h52M34 38h40M34 46h46' }, 'hm-hl'],
    ],
    sorter: [
      ['rect', { x: 14, y: 8, width: 92, height: 58, rx: 2 }, 'hm-plate hm-ln'],
      ['path', { d: 'M37 8v58M60 8v58M83 8v58M14 27.3h92M14 46.6h92' }, 'hm-ln'],
      ['rect', { x: 18, y: 15, width: 15, height: 9 }, 'hm-lcd hm-hl'],
      ['rect', { x: 64, y: 34, width: 15, height: 9 }, 'hm-lcd hm-hl'],
      ['rect', { x: 87, y: 53, width: 15, height: 9 }, 'hm-lcd hm-hl'],
      ['rect', { x: 41, y: 53, width: 15, height: 9 }, 'hm-lcd hm-hl'],
    ],
    poster: [
      ['path', { d: 'M20 68h80' }, 'hm-ln'],
      ['rect', { x: 42, y: 10, width: 36, height: 58 }, 'hm-plate hm-ln'],
      ['ellipse', { cx: 60, cy: 10, rx: 22, ry: 5 }, 'hm-plate hm-ln'],
      ['path', { d: 'M38 10h44' }, 'hm-ln'],
      ['rect', { x: 46, y: 20, width: 28, height: 20, rx: 1 }, 'hm-lcd hm-hl'],
      ['path', { d: 'M51 27h18M51 33h12' }, 'hm-hl'],
      ['path', { d: 'M46 47h28M46 53h22M46 59h26' }, 'hm-ln'],
    ],
    pebbles: [
      ['rect', { x: 12, y: 12, width: 96, height: 48, rx: 6 }, 'hm-plate hm-ln'],
      ['path', { d: 'M20 22l12-6M24 30l20-12' }, 'hm-ln'],
      ['ellipse', { cx: 40, cy: 44, rx: 9, ry: 6 }, 'hm-lcd hm-hl'],
      ['ellipse', { cx: 60, cy: 36, rx: 7, ry: 5 }, 'hm-lcd hm-hl'],
      ['ellipse', { cx: 79, cy: 46, rx: 10, ry: 6.5 }, 'hm-lcd hm-hl'],
      ['ellipse', { cx: 94, cy: 30, rx: 6, ry: 4.5 }, 'hm-lcd hm-hl'],
    ],
    directory: [
      ['rect', { x: 18, y: 22, width: 52, height: 36, rx: 4 }, 'hm-plate hm-ln'],
      ['rect', { x: 34, y: 16, width: 52, height: 36, rx: 4 }, 'hm-plate hm-ln'],
      ['rect', { x: 50, y: 10, width: 52, height: 36, rx: 4 }, 'hm-lcd hm-hl'],
      ['circle', { cx: 63, cy: 24, r: 6 }, 'hm-hl'],
      ['path', { d: 'M74 22h20M74 30h14M58 38h34' }, 'hm-hl'],
      ['path', { d: 'M30 62h60' }, 'hm-ln'],
    ],
    world: [
      ['path', { d: 'M60 36L60 4M60 36L94 14M60 36L104 44M60 36L80 70M60 36L36 70M60 36L16 46M60 36L24 10' }, 'hm-ln'],
      ['path', { d: 'M60 14L79 24L84 41L71 56L48 56L37 40L42 22Z' }, 'hm-ln'],
      ['path', { d: 'M60 24L70 29L72 38L66 46L53 46L48 38L51 29Z' }, 'hm-ln'],
      ['circle', { cx: 94, cy: 14, r: 4 }, 'hm-dot'],
      ['circle', { cx: 16, cy: 46, r: 4 }, 'hm-dot'],
      ['circle', { cx: 80, cy: 70, r: 3.4 }, 'hm-dot'],
      ['circle', { cx: 24, cy: 10, r: 3.4 }, 'hm-dot'],
      ['circle', { cx: 60, cy: 36, r: 3 }, 'hm-dot'],
    ],
    you: [
      ['path', { d: 'M60 52v16' }, 'hm-thick'],
      ['ellipse', { cx: 60, cy: 28, rx: 19, ry: 24 }, 'hm-plate hm-ln'],
      ['ellipse', { cx: 60, cy: 28, rx: 13, ry: 18 }, 'hm-lcd hm-hl'],
      ['path', { d: 'M53 19c2-4 6-6 10-5' }, 'hm-hl'],
      ['path', { d: 'M92 12v12M86 18h12M30 44v6M27 47h6' }, 'hm-hl'],
    ],
  };
  function art(kind) {
    var svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('viewBox', '0 0 120 72');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('class', 'hm-art');
    (ART[kind] || []).forEach(function (s) {
      var e = document.createElementNS(SVGNS, s[0]);
      for (var k in s[1]) e.setAttribute(k, String(s[1][k]));
      e.setAttribute('class', s[2]);
      svg.appendChild(e);
    });
    return svg;
  }

  /* ── Somebody not signed on ─────────────────────────────────────────── */

  var on = cbState();
  if (!on) {
    var off = el('div', 'hm-view');
    off.appendChild(words(el('p'), ['Home is for people signed on to the CB, the street’s radio. Joining it takes an invite: ',
      link('/community-center.html#getting-started', 'the Community Center'), ' says how to ask for one. Already on? Sign on at ',
      link('/community-center.html#cb-signon-desk', 'the front desk'), ' and come back. In the meantime, ',
      link('/map.html', 'the Map'), ' shows the whole street.']));
    box.appendChild(off);
    return;
  }
  if (/^cb1\./.test(on.pass)) {
    var claim = el('div', 'hm-view');
    claim.appendChild(el('p', null, 'This browser is signed on with a shared password, which only claims a username now. The radio, in the corner of the screen, will claim ' + on.handle + ' for you, and then Home opens here.'));
    box.appendChild(claim);
    return;
  }

  /* ── Asking ───────────────────────────────────────────────────────────── */

  function ask(path, opts) {
    var s = cbState();
    if (!s) return Promise.resolve({ status: 401, body: {} });
    var o = { method: (opts && opts.post) ? 'POST' : 'GET', credentials: 'omit', cache: 'no-store',
      headers: { 'accept': 'application/json', 'authorization': 'Bearer ' + s.pass } };
    if (opts && opts.post) { o.headers['content-type'] = 'application/json'; o.body = '{}'; }
    return fetch(path, o).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (b) { return { status: r.status, body: b || {} }; });
    }, function () { return { status: 0, body: {} }; });
  }
  function file(path, kind) {
    return fetch(path, { credentials: 'omit', headers: { 'accept': kind === 'xml' ? 'application/rss+xml' : 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error(); return kind === 'xml' ? r.text() : r.json(); })
      .catch(function () { return null; });
  }

  /* The street's rooms by tag, with the forums' categories this pass may read
     after them, the radio's list. Fetched once. */
  var rooms = [], byTag = {};
  var roomsReady = Promise.all([file('/cb-rooms.json'), ask('/cb/rooms')]).then(function (rs) {
    var street = (rs[0] && Array.isArray(rs[0].rooms)) ? rs[0].rooms : [];
    var forum = (rs[1].status === 200 && Array.isArray(rs[1].body.rooms)) ? rs[1].body.rooms : [];
    street.forEach(function (r) { if (r && typeof r.tag === 'string' && typeof r.name === 'string' && typeof r.path === 'string') { rooms.push(r); byTag[r.tag] = r; } });
    forum.forEach(function (r) { if (r && /^forum-[a-z0-9-]+$/.test(r.tag) && typeof r.name === 'string') { rooms.push(r); byTag[r.tag] = r; } });
  });
  function roomName(tag) { return tag === WORLD ? 'World' : (byTag[tag] ? byTag[tag].name : null); }
  function chatHref(tag) { return '/chat.html#' + tag; }

  /* ── The parts, top to bottom ─────────────────────────────────────────── */

  var head = el('div', 'cb-bar hm-bar');
  var brand = el('p', 'hm-name', 'Home on the CB, signed on as ' + on.handle);
  head.appendChild(brand);
  var again = button('Look again', 'hm-again');
  head.appendChild(again);
  box.appendChild(head);
  var view = el('div', 'hm-view');
  box.appendChild(view);
  var said = el('p', 'cb-said hm-said');
  said.setAttribute('role', 'status');
  view.appendChild(said);

  var news = part('new', 'New to you', 'World, the rooms you follow and your conversations, wherever something was said since you last read it there. A dot says something is new and never how much.');
  var latest = part('latest', 'Latest on the street');
  var events = part('events', 'Coming up', 'Events on World and in the rooms you can go into, the soonest first.');
  var follow = part('follow', 'Rooms you follow', 'Your favourite rooms, as the radio keeps them: following a room puts it on New to you whenever something is said there. Kept in this browser only.');
  var around = part('around', 'Who’s around', 'People who pressed Be seen here, and where, and the rooms whose call has somebody in it.');
  var places = part('places', 'Places on the CB');
  var jobs = part('jobs', 'Jobs to start with', 'From the Adventurer’s Guild, near the start of the street. Each sends you to a marker in a room, and nothing is scored.');
  var give = part('ask-and-give', 'Ways to ask and give');
  var wander = part('wander', 'Somewhere to start');
  var welcome = part('getting-started', 'New here?');
  var grid = el('div', 'hm-grid');
  [news, events, follow, around].forEach(function (p) { grid.appendChild(p.sec); });
  view.appendChild(latest.sec);
  view.appendChild(grid);
  view.appendChild(places.sec);
  var grid2 = el('div', 'hm-grid');
  [jobs, give, wander, welcome].forEach(function (p) { grid2.appendChild(p.sec); });
  view.appendChild(grid2);

  /* New to you: /cb/unread's marks, the radio's Unreads in a page. Asked with
     an empty body, which only reads: this page never says you have read
     anything. */
  function drawNews(r) {
    var b = news.body;
    if (r.status === 403) { quiet(b, 'Claim your username, under Account on the radio, and Home marks what is new to you.'); return; }
    if (r.status !== 200) { quiet(b, 'What is new could not be read just now.'); return; }
    var n = r.body, s = cbState() || {}, mine = s.follow || [], all = !!s.followAll;
    var latestBy = n.latest || {}, read = n.read || {};
    function fresh(tag) { var t = latestBy[tag]; return typeof t === 'number' && t > (read[tag] || 0); }
    var list = el('ul', 'hm-list');
    function item(name, href, onPress) {
      var li = el('li', 'hm-new');
      var a;
      if (href) a = link(href, name);
      else { a = el('button', 'cb-handle hm-press', name); a.type = 'button'; a.addEventListener('click', onPress); }
      li.appendChild(a);
      var dot = el('span', 'cb-new');
      dot.setAttribute('aria-hidden', 'true');
      li.appendChild(dot);
      li.appendChild(el('span', 'sr', ', something new'));
      list.appendChild(li);
    }
    if (fresh(WORLD)) item('World', chatHref(WORLD));
    rooms.forEach(function (r) {
      if (r.tag === WORLD || !(all || mine.indexOf(r.tag) >= 0) || !fresh(r.tag)) return;
      item(r.name, chatHref(r.tag));
    });
    (n.dms || []).forEach(function (h) {
      item('Your conversation with ' + h, null, function () {
        if (!(window.loveRadioMessage && window.loveRadioMessage(h))) say('Conversations open on the radio, under Messages. If it is in a window of its own, it is there.');
      });
    });
    b.textContent = '';
    if (list.children.length) b.appendChild(list);
    else b.appendChild(el('p', 'cb-quiet', 'Nothing new to you just now.' + (!all && !mine.length ? ' Follow a room, under Rooms you follow, and it shows up here when something is said there.' : '')));
    if (n.asking) b.appendChild(el('p', 'hm-line', 'Somebody has written to you for the first time. It waits under Messages on the radio until you answer, accept or reject it.'));
  }
  function drawProps(r) {
    if (r.status !== 200 || !r.body || !Array.isArray(r.body.waiting) || !r.body.waiting.length) return;
    var p = el('p', 'hm-line');
    var go = el('button', 'cb-handle hm-press', 'Props are waiting for your yes');
    go.type = 'button';
    go.addEventListener('click', function () {
      if (!(window.loveRadioProps && window.loveRadioProps())) say('Your props are under Profile on the radio, in Your props.');
    });
    p.appendChild(go);
    p.appendChild(document.createTextNode(': nothing goes on your Props tab until you confirm it.'));
    news.body.appendChild(p);
  }

  /* Latest on the street: the Brass Tacks Board's newest plates, the forums'
     latest topics, and the changelog's newest entries, in three columns. */
  var LATEST_EACH = 4;
  function column(title, more, moreText) {
    var c = el('div', 'hm-col');
    var h = el('h3', 'hm-h3', title);
    c.appendChild(h);
    var body = el('div');
    c.appendChild(body);
    var m = el('p', 'hm-more');
    m.appendChild(link(more, moreText));
    c.appendChild(m);
    return { col: c, body: body };
  }
  function entry(list, title, href, line) {
    var li = el('li', 'hm-entry');
    li.appendChild(link(href, title, 'hm-entry__title'));
    if (line) li.appendChild(el('span', 'hm-entry__line', line));
    list.appendChild(li);
  }
  var brassCol = column('Brass Tacks Board', '/brass-tacks-board.html', 'The whole board');
  var forumCol = column('The forums', '/forum.html#/latest', 'Every latest topic');
  var logCol = column('What changed on the street', '/changelog.html', 'The changelog');
  var cols = el('div', 'hm-cols');
  [brassCol, forumCol, logCol].forEach(function (c) { cols.appendChild(c.col); });
  latest.body.appendChild(cols);

  function drawBrass(r) {
    var b = brassCol.body, posts = (r.status === 200 && Array.isArray(r.body.posts)) ? r.body.posts.slice() : null;
    if (!posts) { quiet(b, 'The board could not be read just now.'); return; }
    posts.sort(function (x, y) { return (y.t || 0) - (x.t || 0); });
    if (!posts.length) { quiet(b, 'Nothing is up on the board yet.'); return; }
    var list = el('ul', 'hm-list');
    posts.slice(0, LATEST_EACH).forEach(function (p) {
      if (typeof p.id !== 'string' || typeof p.title !== 'string') return;
      entry(list, p.title, '/brass-tacks-board.html#post-' + encodeURIComponent(p.id), 'From ' + p.handle + ', ' + when(p.t));
    });
    b.textContent = '';
    b.appendChild(list);
  }
  function drawForum(r) {
    var b = forumCol.body;
    if (r.status === 403) { quiet(b, 'The forums are for claimed usernames. Claim yours under Account on the radio.'); return; }
    var topics = (r.status === 200 && Array.isArray(r.body.topics)) ? r.body.topics : null;
    if (!topics) { quiet(b, 'The forums could not be read just now.'); return; }
    if (!topics.length) { quiet(b, 'No topics yet.'); return; }
    var list = el('ul', 'hm-list');
    topics.slice(0, LATEST_EACH).forEach(function (t) {
      if (typeof t.id !== 'string' || typeof t.title !== 'string') return;
      entry(list, t.title, '/forum.html#/t/' + encodeURIComponent(t.id), 'Last post from ' + (t.lastBy || t.handle) + ', ' + when(t.last));
    });
    b.textContent = '';
    b.appendChild(list);
  }
  function drawLog(xml) {
    var b = logCol.body, doc = null;
    try { doc = xml ? new DOMParser().parseFromString(xml, 'application/xml') : null; } catch (e) { doc = null; }
    var items = doc ? Array.prototype.slice.call(doc.querySelectorAll('item'), 0, LATEST_EACH) : [];
    if (!items.length) { quiet(b, 'The changelog could not be read just now.'); return; }
    var list = el('ul', 'hm-list');
    items.forEach(function (it) {
      var title = (it.querySelector('title') || {}).textContent, href = local((it.querySelector('link') || {}).textContent || '');
      var t = Date.parse((it.querySelector('pubDate') || {}).textContent || '');
      if (!title || !href) return;
      entry(list, title, href, isNaN(t) ? '' : day(t));
    });
    b.textContent = '';
    if (list.children.length) b.appendChild(list);
    else quiet(b, 'The changelog could not be read just now.');
  }

  /* Coming up: /cb/events, asked with an empty body, which only lists. */
  var EVENTS_SHOWN = 4;
  function drawEvents(r) {
    var b = events.body;
    if (r.status === 403) { quiet(b, 'Events are for a claimed username. Claim yours under Account on the radio.'); return; }
    var list = (r.status === 200 && Array.isArray(r.body.events)) ? r.body.events : null;
    if (!list) { quiet(b, 'Events could not be read just now.'); return; }
    b.textContent = '';
    if (!list.length) b.appendChild(el('p', 'cb-quiet', 'Nothing is scheduled just now.'));
    else {
      var ul = el('ul', 'hm-list');
      list.slice(0, EVENTS_SHOWN).forEach(function (e) {
        if (typeof e.id !== 'string' || typeof e.title !== 'string') return;
        var li = el('li', 'hm-entry');
        li.appendChild(link('/chat.html#events/' + encodeURIComponent(e.id), e.title, 'hm-entry__title'));
        var where = roomName(e.room) || 'a room';
        li.appendChild(el('span', 'hm-entry__line', (e.on ? 'On now' : whenAt(e.start)) + ', in ' + where + (e.mine ? '. You are interested.' : '')));
        ul.appendChild(li);
      });
      b.appendChild(ul);
    }
    var m = el('p', 'hm-more');
    m.appendChild(link('/chat.html#events', 'Every event, and scheduling your own'));
    b.appendChild(m);
  }

  /* Rooms you follow: love-cb's follow and followAll, read here and changed
     only by the radio. */
  // Where the keyboard goes once the list is drawn again: a room's link, or the picker.
  var focusAfter = null;
  function drawFollow() {
    var b = follow.body, s = cbState() || {}, mine = s.follow || [], want = focusAfter;
    focusAfter = null;
    b.textContent = '';
    if (s.followAll) {
      b.appendChild(el('p', null, 'You follow every room you can go into, rooms that open later too. Switch Follow every room off under Unreads on the radio to choose them one by one.'));
      return;
    }
    var shown = rooms.filter(function (r) { return mine.indexOf(r.tag) >= 0; });
    if (shown.length) {
      var ul = el('ul', 'hm-list');
      shown.forEach(function (r) {
        var li = el('li', 'hm-follow');
        var name = link(local(r.path) || chatHref(r.tag), r.name, 'hm-entry__title');
        name.dataset.tag = r.tag;
        li.appendChild(name);
        var bits = el('span', 'hm-follow__do');
        bits.appendChild(link(chatHref(r.tag), 'Open in Chat'));
        var x = button('Stop following', 'hm-small');
        x.setAttribute('aria-label', 'Stop following ' + r.name);
        x.addEventListener('click', function () {
          focusAfter = 'pick';
          if (followIt(r.tag, false)) say('Not following ' + r.name + ' any more.');
          else { focusAfter = null; say(noRadio); }
        });
        bits.appendChild(x);
        li.appendChild(bits);
        ul.appendChild(li);
      });
      b.appendChild(ul);
    } else b.appendChild(el('p', 'cb-quiet', 'None yet. Pick one below, or press Follow this room on the radio in any room.'));
    var add = el('div', 'hm-add');
    var lab = el('label', 'cb-lab', 'Follow a room');
    lab.htmlFor = 'hm-add-room';
    var pick = el('select', 'cb-say hm-pick');
    pick.id = 'hm-add-room';
    pick.appendChild(el('option', null, 'Choose a room…')).value = '';
    rooms.forEach(function (r) {
      if (r.tag === WORLD || r.tag === 'home' || mine.indexOf(r.tag) >= 0) return;
      var o = el('option', null, r.name);
      o.value = r.tag;
      pick.appendChild(o);
    });
    var go = button('Follow it');
    go.addEventListener('click', function () {
      if (!pick.value) { say('Choose a room to follow first.'); pick.focus(); return; }
      var name = roomName(pick.value);
      focusAfter = pick.value;
      if (followIt(pick.value, true)) say('Following ' + name + '.');
      else { focusAfter = null; say(noRadio); }
    });
    add.appendChild(lab);
    var row = el('div', 'hm-add__row');
    row.appendChild(pick);
    row.appendChild(go);
    add.appendChild(row);
    b.appendChild(add);
    if (want === 'pick') pick.focus();
    else if (want) { var to = b.querySelector('a[data-tag="' + want + '"]'); if (to) to.focus(); }
  }
  var noRadio = 'The radio keeps the rooms you follow, and it is not on this page just now. If it is in a window of its own, bring it back here and try again.';
  function followIt(tag, onOff) { return !!(window.loveRadioFollow && window.loveRadioFollow(tag, onOff)); }
  document.addEventListener('love-follow', function () { roomsReady.then(drawFollow); });
  window.addEventListener('storage', function (e) { if (e.key === 'love-cb') roomsReady.then(drawFollow); });

  /* Who's around: Who's online's answer, names alphabetical, and no number. */
  function drawAround(r) {
    var b = around.body;
    if (r.status !== 200) { quiet(b, 'Who is around could not be read just now.'); return; }
    b.textContent = '';
    var people = Array.isArray(r.body.people) ? r.body.people : [];
    if (people.length) {
      var ul = el('ul', 'hm-list');
      people.forEach(function (p) {
        if (typeof p.handle !== 'string') return;
        var li = el('li', 'hm-entry');
        var who = el('button', 'cb-handle hm-press', p.handle);
        who.type = 'button';
        who.setAttribute('aria-haspopup', 'dialog');
        who.addEventListener('click', function () {
          if (window.loveRadioPeek) window.loveRadioPeek(p.handle, who, { base: !!p.base, claimed: !!p.claimed });
          else say('Profiles open from the radio on this page.');
        });
        li.appendChild(who);
        var where = (p.rooms || []).map(roomName).filter(Boolean);
        if (where.length) li.appendChild(el('span', 'hm-entry__line', 'in ' + where.join(', ')));
        ul.appendChild(li);
      });
      b.appendChild(ul);
    } else b.appendChild(el('p', 'cb-quiet', 'Nobody has pressed Be seen here just now.'));
    var calls = (r.body.callHeard && Array.isArray(r.body.calls)) ? r.body.calls.map(function (t) { return { tag: t, name: roomName(t) }; }).filter(function (c) { return c.name; }) : [];
    if (calls.length) {
      var p = el('p', 'hm-line', 'A call is going on in ');
      calls.forEach(function (c, i) {
        if (i) p.appendChild(document.createTextNode(i === calls.length - 1 ? ' and ' : ', '));
        var room = byTag[c.tag];
        p.appendChild(link(c.tag === WORLD ? '/world.html' : (room && local(room.path)) || chatHref(c.tag), c.name));
      });
      p.appendChild(document.createTextNode('.'));
      b.appendChild(p);
    }
    var m = el('p', 'hm-more');
    m.appendChild(link('/world.html', 'Every room in World, with who is seen there'));
    b.appendChild(m);
  }

  /* Places on the CB: a card each, its own drawing, its own words. */
  var PLACES = [
    ['chat', '/chat.html', 'Chat', 'Every room’s channel on one page, with your conversations down the side.'],
    ['forums', '/forum.html', 'The forums', 'For what needs longer than the channel’s two weeks: topics, replies, polls and pictures.'],
    ['wiki', '/forum.html#/c/wiki', 'The wiki', 'How-tos and support docs in the forums, kept for good and kept up to date.'],
    ['events', '/chat.html#events', 'Events', 'What is coming up on World and in the rooms, and how to schedule your own.'],
    ['brass', '/brass-tacks-board.html', 'The Brass Tacks Board', 'Notices from our moderators, meant to last, with a feed of their own.'],
    ['sorter', '/community-center.html#ctr-service-h', 'The community service board', 'Every room that takes something in: what it takes, what it asks of you, and how to send it.'],
    ['poster', '/now-playing.html', 'Now Playing', 'Every room with something to press and play, and what each one puts on first.'],
    ['pebbles', '/pebble-board.html', 'The Pebble Board', 'Songs, art, jokes and recipes our people bring each other, one edition at a time.'],
    ['directory', '/directory.html', 'The community directory', 'Everybody on the CB who chose to be listed, each a press away from their profile card.'],
    ['world', '/world.html', 'World', 'Every room on one web, with who is seen in each and which have a call going.'],
    ['you', '/you.html', 'You', 'Your profile, your account and your past notifications, on a page of their own.'],
  ];
  (function drawPlaces() {
    var ul = el('ul', 'hm-places');
    PLACES.forEach(function (p) {
      var li = el('li', 'hm-place');
      li.appendChild(art(p[0]));
      var h = el('h3', 'hm-h3');
      h.appendChild(link(p[1], p[2], 'hm-place__link'));
      li.appendChild(h);
      li.appendChild(el('p', 'hm-place__about', p[3]));
      ul.appendChild(li);
    });
    places.body.appendChild(ul);
  }());

  /* Jobs to start with: the board's first jobs, in its own order, each to its
     row on the board. Whether you have done one is the board's to say. */
  var JOBS_SHOWN = 4;
  function drawJobs(d) {
    var b = jobs.body, list = d && Array.isArray(d.jobs) ? d.jobs : null;
    if (!list) { quiet(b, 'The job board could not be read just now.'); return; }
    var ul = el('ul', 'hm-list');
    list.slice(0, JOBS_SHOWN).forEach(function (j) {
      if (typeof j.id !== 'string' || typeof j.title !== 'string') return;
      entry(ul, j.title, '/adventurers-guild.html#job-' + encodeURIComponent(j.id), j.room ? 'In ' + j.room : '');
    });
    b.textContent = '';
    b.appendChild(ul);
    var m = el('p', 'hm-more');
    m.appendChild(link('/adventurers-guild.html', 'The whole job board'));
    b.appendChild(m);
  }

  /* Ways to ask and give, each a room that already says how. */
  (function drawGive() {
    var ul = el('ul', 'hm-list');
    [['/community-care.html', 'Community Care', 'Ask for mutual aid, peer support or any other help, on its channel.'],
      ['/volunteers.html', 'Volunteers', 'Volunteering with Stimpunks: what we need help with, and how to say you would like to.'],
      ['/show-your-work.html', 'Show Your Work', 'Show the work you are making, unfinished, to the people who love the same things.'],
      ['/sandbox.html#suggestion-box', 'The suggestion box', 'A suggestion, a feature you would like or a bug, and a moderator answers.'],
    ].forEach(function (g) { entry(ul, g[1], g[0], g[2]); });
    give.body.appendChild(ul);
  }());

  /* Somewhere to start: one room, chosen here at random from the street's
     list, and another on a press. Paperwork and the forums are left out. */
  var notRooms = null;
  function drawWander(tags) {
    var b = wander.body;
    if (tags) notRooms = tags;
    var skip = notRooms || {};
    var pool = rooms.filter(function (r) {
      return !/^forum/.test(r.tag) && r.tag !== WORLD && r.tag !== 'home' && local(r.path) && !skip[r.tag];
    });
    b.textContent = '';
    if (!pool.length) { quiet(b, 'The street’s list of rooms could not be read just now. The Map shows every one.'); return; }
    var r = pool[Math.floor(Math.random() * pool.length)];
    var p = el('p', 'hm-wander');
    p.appendChild(document.createTextNode('Try '));
    p.appendChild(link(local(r.path), r.name));
    p.appendChild(document.createTextNode('.'));
    b.appendChild(p);
    if (r.about) b.appendChild(el('p', 'hm-place__about', r.about));
    var row = el('p', 'hm-more');
    var other = button('Somewhere else', 'hm-small');
    other.addEventListener('click', function () { drawWander(); var a = wander.body.querySelector('.hm-wander a'); if (a) a.focus(); });
    row.appendChild(other);
    row.appendChild(document.createTextNode(' '));
    row.appendChild(link('/map.html', 'The Map'));
    b.appendChild(row);
  }
  function paperwork(d) {
    var out = {}, by = d && d.rooms;
    if (by && typeof by === 'object') Object.keys(by).forEach(function (file) {
      var t = by[file];
      if (Array.isArray(t) && (t.indexOf('paperwork') >= 0 || t.indexOf('forums') >= 0)) out[file === 'index.html' ? 'street' : file.replace(/\.html$/, '')] = true;
    });
    return out;
  }

  /* New here? The Community Center's first steps, and the guide. */
  (function drawWelcome() {
    var b = welcome.body;
    b.appendChild(words(el('p'), ['The Community Center has ', link('/community-center.html#getting-started', 'Getting started'),
      ', the first steps for everybody new, and ', link('/cb-guide.html', 'the CB guide'), ' says what every part of the radio does. ',
      link('/forum.html#/c/introductions', 'Introductions'), ' in the forums is where people say hello.']));
  }());

  /* ── Loading ──────────────────────────────────────────────────────────── */

  function say(t) { said.textContent = t || ''; }
  var once = false;
  function load() {
    again.disabled = true;
    var asked = roomsReady.then(function () {
      return Promise.all([
        ask('/cb/unread', { post: true }).then(function (r) { drawNews(r); return ask('/cb/props'); }).then(drawProps),
        ask('/cb/brass').then(drawBrass),
        ask('/cb/forum?view=latest').then(drawForum),
        file('/feed.xml', 'xml').then(drawLog),
        ask('/cb/events', { post: true }).then(drawEvents),
        ask('/cb/online').then(drawAround),
      ]);
    });
    if (!once) {
      once = true;
      roomsReady.then(function () {
        drawFollow();
        file('/guild-jobs.json').then(drawJobs);
        file('/data/room-tags.json').then(function (d) { drawWander(paperwork(d)); });
      });
    }
    return asked.then(function () { again.disabled = false; }, function () { again.disabled = false; });
  }
  [news, events, around].forEach(function (p) { quiet(p.body, 'Looking…'); });
  [brassCol, forumCol, logCol].forEach(function (c) { quiet(c.body, 'Looking…'); });
  again.addEventListener('click', function () { say('Looking again…'); load().then(function () { say('Up to date as of ' + when(Date.now()) + '.'); }); });
  load();
})();

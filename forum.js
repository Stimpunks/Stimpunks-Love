/* =============================================================================
   The forums, the CB's place for conversations that need longer than two days.
   Ryan's brief, 2026-10-18, after Discourse. See netlify/cb/lib.mjs, the
   forums, and privacy.html#forums for what they keep.

   THE CB'S, DRESSED AS THE CB. The forums live in a shadow root, as the radio
   does, with cb.css and forum.css the only sheets that reach them, so they
   wear whichever of the radio's themes the reader has on, or one chosen here
   for the forums alone: its seven colours, its face for headings and its
   drawing along the top and foot. forum.css names no colour of its own, so
   every pair is one check-contrast.py already holds for the radio.

   ONLY A CLAIMED USERNAME READS THEM, and this file only asks: the server
   refuses everybody else, and a category somebody's roles do not reach is
   never in any answer. It reads love-cb for the pass and never writes it.

   EVERY POST ARRIVES AS NODES, NOT HTML, and markdown.js builds them with
   createElement and textContent. A preview is built here the same way, from
   what the server read when the post was made: a page's title and
   description, a video's title, channel and length, or a room's own name off
   cb-rooms.json. A video is a press-to-play button that says how long it runs
   before the press, built into a frame by love-embed.js, the street's one
   builder; one nobody could measure is a door to YouTube.

   PICTURES AND FILES (Ryan, 2026-10-18) go up from the composer before the
   post does. A picture is redrawn first by the radio's one redraw,
   window.loveRedraw, which takes off what a camera wrote into it, GPS first;
   a file goes as it is. Each is fetched again with the pass, never from a
   public address, and a file is only ever saved, as a download with no type a
   browser would open as a page.

   @MENTIONS (Ryan, 2026-10-18): typing @ offers the people in the topic and
   anybody claimed on Who's online, the radio's own list, asked for once when
   an @ is first typed; a post's mentions are drawn as names that open a
   profile, and Mentions lists where you have been mentioned, worked out by
   the server each time. A mention notifies only the devices that asked, from
   the server, and nothing here.

   SUBCATEGORIES, TEMPLATES AND PICTURES IN THE WORDS (Ryan, 2026-10-20, for
   the team's documents moving from Google Docs): a category can stand in
   another, and the side, the cards and every list name a category by the
   path to it; a new topic can start from a template, which copies its title
   and words in; and a picture can stand where the words put it, by a button,
   by pasting a screenshot into the box, or by dropping one on it.

   NOTHING ABOUT READING IS SENT. What is new to you is marked from love-forum,
   in this browser: which topics you opened and the time of their latest post
   when you did. No number is put beside anything. tools/make-forum.py holds
   all of this.
   ============================================================================= */
(function () {
  'use strict';

  var mount = document.querySelector('[data-forum]');
  if (!mount) return;

  var SEEN = 'love-forum';
  var SEEN_MAX = 1000;
  var GROUPS = [['every', 'Everyday'], ['radio', 'Radio faceplates'], ['world', 'Worlds, with drawings'],
    ['skin', 'Winamp skins'], ['geo', 'GeoCities pages'], ['game', 'Ryan’s favourite games']];

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
  function mine() {
    try { var v = JSON.parse(localStorage.getItem(SEEN) || 'null'); return v && typeof v === 'object' ? v : {}; }
    catch (e) { return {}; }
  }
  function keepMine(v) { try { localStorage.setItem(SEEN, JSON.stringify(v)); } catch (e) { /* a private window keeps nothing */ } }
  function fold(h) { return String(h || '').normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim(); }

  /* ── The box ───────────────────────────────────────────────────────────── */

  var host = el('div', 'fm-host');
  var root = host.attachShadow({ mode: 'open' });
  var waiting = 2;
  host.style.visibility = 'hidden';
  ['/cb.css', '/forum.css'].forEach(function (href) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    function ready() { if (--waiting === 0) { host.style.visibility = ''; drawArt(); } }
    l.addEventListener('load', ready);
    l.addEventListener('error', ready);
    root.appendChild(l);
  });
  var box = el('div', 'fm');
  root.appendChild(box);

  var bar = el('div', 'cb-bar fm-bar');
  var brand = el('p', 'fm-name');
  brand.appendChild(el('span', 'cb-brand', 'CB'));
  brand.appendChild(document.createTextNode(' Forums'));
  bar.appendChild(brand);
  var nav = el('nav', 'fm-nav');
  nav.setAttribute('aria-label', 'The forums');
  var navHome = el('a', 'cb-btn fm-navlink', 'Categories'); navHome.href = '#/';
  var navLatest = el('a', 'cb-btn fm-navlink', 'Latest'); navLatest.href = '#/latest';
  var navAt = el('a', 'cb-btn fm-navlink', 'Mentions'); navAt.href = '#/mentions';
  var navNew = el('a', 'cb-btn fm-navlink', 'New topic'); navNew.href = '#/new';
  // Tasks and the office, a press away for the directors, board members and administrators who
  // can open them (Ryan's ask, 2026-10-21), set a little apart because they are
  // other pages, and shown only once the server says this pass reaches them.
  var navTasks = el('a', 'cb-btn fm-navlink fm-navlink--other', 'Tasks'); navTasks.href = '/tasks.html#/'; navTasks.hidden = true;
  var navOffice = el('a', 'cb-btn fm-navlink', 'Office'); navOffice.href = '/office.html#/dashboard'; navOffice.hidden = true;
  [navHome, navLatest, navAt, navNew, navTasks, navOffice].forEach(function (a) { nav.appendChild(a); });
  bar.appendChild(nav);
  var find = el('form', 'fm-find');
  find.setAttribute('role', 'search');
  var findLab = el('label', 'sr', 'Search the forums');
  findLab.htmlFor = 'fm-q';
  var findBox = el('input', 'cb-say fm-q');
  findBox.id = 'fm-q'; findBox.type = 'search'; findBox.placeholder = 'Search the forums'; findBox.autocomplete = 'off';
  var findGo = el('button', 'cb-btn', 'Search'); findGo.type = 'submit';
  find.appendChild(findLab); find.appendChild(findBox); find.appendChild(findGo);
  find.addEventListener('submit', function (e) {
    e.preventDefault();
    var q = findBox.value.trim();
    if (q) location.hash = '#/search?q=' + encodeURIComponent(q);
  });
  bar.appendChild(find);
  box.appendChild(bar);

  var trimTop = el('div', 'cb-trim cb-trim--top fm-trim');
  var trimFoot = el('div', 'cb-trim cb-trim--foot fm-trim');
  [trimTop, trimFoot].forEach(function (t) { t.hidden = true; t.setAttribute('aria-hidden', 'true'); });
  box.appendChild(trimTop);

  // Back one step: steps.js fills it, above the categories and the view alike.
  var backRow = el('p', 'fm-back');
  backRow.hidden = true;
  box.appendChild(backRow);

  var main = el('div', 'fm-main');
  var side = el('nav', 'fm-side');
  side.setAttribute('aria-label', 'Categories');
  var view = el('div', 'fm-view');
  main.appendChild(side);
  main.appendChild(view);
  box.appendChild(main);

  var said = el('p', 'fm-said');
  said.setAttribute('role', 'status');
  box.appendChild(said);
  function say(t) { said.textContent = ''; setTimeout(function () { said.textContent = t || ''; }, 30); }

  /* Your own settings for the forums, kept in love-forum, sent nowhere. */
  var opts = el('div', 'fm-opts');
  var schemeLab = el('label', 'cb-lab', 'Colours for the forums');
  schemeLab.htmlFor = 'fm-scheme';
  var schemeSel = el('select', 'cb-say fm-scheme');
  schemeSel.id = 'fm-scheme';
  var forget = el('button', 'cb-btn', 'Forget what I have read');
  forget.type = 'button';
  forget.addEventListener('click', function () {
    var m = mine();
    delete m.seen; delete m.since;
    keepMine(m);
    say('Forgotten. Nothing is marked as read in this browser any more.');
    route();
  });
  var schemeRow = el('div', 'fm-opt');
  schemeRow.appendChild(schemeLab);
  schemeRow.appendChild(schemeSel);
  opts.appendChild(schemeRow);
  opts.appendChild(forget);
  opts.appendChild(el('p', 'cb-quiet fm-opts__why', 'Both are kept in this browser only. What is new to you is worked out here, from the topics you have opened, and never sent to us.'));
  box.appendChild(opts);
  box.appendChild(trimFoot);

  mount.textContent = '';
  mount.appendChild(host);

  /* GOING BACK ONE STEP, at the height you left the view, is steps.js's. What
     the link back says about each view is here: a topic by its title and a
     category by its name, from this page's memory only. */
  function placeOf(hash, title) {
    var p = String(hash || '').slice(1).split('?')[0].split('/').filter(Boolean);
    if (!p.length) return 'the categories';
    if (p[0] === 'latest') return 'Latest';
    if (p[0] === 'mentions') return 'Mentions';
    if (p[0] === 'new') return 'the new topic';
    if (p[0] === 'search') return 'the search';
    if (p[0] === 'c') return title || 'the category';
    return title ? '“' + title + '”' : 'the topic';
  }
  var step = window.loveSteps({
    root: root, view: view, slot: backRow, place: placeOf,
    title: function () { var h = view.querySelector('h2'); return h ? h.textContent : null; },
    route: function () { route(); },
  });

  /* ── Wearing the CB's themes ─────────────────────────────────────────────

     The same as my radio, unless somebody picks one here. Following the radio
     means copying what its host wears, so a theme picked on the radio is on
     the forums at once; with no radio on the page, it is call.js's own answer
     for what the radio would wear. */
  var lc = null;
  function dial() { return document.documentElement.getAttribute('data-intensity') || 'regular'; }
  function own() { var v = mine().scheme; return v && v !== 'radio' ? v : null; }
  function radioHost() { return document.querySelector('.cb-host'); }
  function dressNow() {
    lc = window.loveCall || null;
    if (!lc) return;
    var choice = own(), r = radioHost(), look, motion;
    if (!choice && r && r.getAttribute('data-scheme')) {
      look = r.getAttribute('data-scheme');
      motion = r.getAttribute('data-motion') === 'on' ? 'on' : 'off';
    } else {
      var s = cbState();
      look = lc.schemeFor(choice || (s && s.scheme) || 'auto');
      motion = dial() === 'max' || (s && s.motion) ? 'on' : 'off';
    }
    var was = host.getAttribute('data-scheme');
    host.setAttribute('data-scheme', look);
    host.setAttribute('data-motion', motion);
    if (was !== look) { artKey = null; drawArt(); }
  }
  function fillSchemes() {
    lc = window.loveCall || null;
    schemeSel.textContent = '';
    var same = el('option', null, 'The same as my radio');
    same.value = 'radio';
    schemeSel.appendChild(same);
    if (!lc || !lc.schemes) return;
    GROUPS.forEach(function (g) {
      var og = document.createElement('optgroup');
      og.label = g[1];
      lc.schemes.forEach(function (x) {
        if (x[2] !== g[0]) return;
        var o = el('option', null, x[1]);
        o.value = x[0];
        og.appendChild(o);
      });
      if (og.children.length) schemeSel.appendChild(og);
    });
    schemeSel.value = own() || 'radio';
  }
  schemeSel.addEventListener('change', function () {
    var m = mine();
    if (schemeSel.value === 'radio') delete m.scheme; else m.scheme = schemeSel.value;
    keepMine(m);
    dressNow();
    var x = lc && lc.schemes && lc.schemes.filter(function (s) { return s[0] === schemeSel.value; })[0];
    say(schemeSel.value === 'radio' ? 'The forums wear your radio’s colours now.' : 'The forums are in ' + (x ? x[1] : 'that theme') + ' now.');
  });
  try {
    new MutationObserver(dressNow).observe(document.documentElement, { attributes: true, attributeFilter: ['data-intensity'] });
    var watched = null;
    var onHost = new MutationObserver(dressNow);
    new MutationObserver(function () {
      var r = radioHost();
      if (r && r !== watched) { watched = r; onHost.observe(r, { attributes: true, attributeFilter: ['data-scheme', 'data-motion'] }); dressNow(); }
    }).observe(document.body, { childList: true });
  } catch (e) { /* the forums keep the colours they opened in */ }
  ['(prefers-contrast: more)', '(prefers-color-scheme: light)'].forEach(function (q) {
    try { window.matchMedia(q).addEventListener('change', dressNow); } catch (e) { /* an old browser */ }
  });

  /* The theme's drawing, along the top and the foot, from cb-themes.js, which
     the radio also loads: fetched once, whoever asks first. */
  var artKey = null, artWait = null;
  function withArt(then) {
    if (window.loveCbArt) { then(); return; }
    if (!artWait) {
      artWait = [then];
      var tag = document.querySelector('script[src="/cb-themes.js"]');
      if (!tag) {
        tag = document.createElement('script');
        tag.src = '/cb-themes.js';
        document.head.appendChild(tag);
      }
      tag.addEventListener('load', function () { var w = artWait; artWait = null; w.forEach(function (f) { f(); }); });
      // It may have loaded already, for the radio, between the check and now.
      setTimeout(function () { if (window.loveCbArt && artWait) { var w = artWait; artWait = null; w.forEach(function (f) { f(); }); } }, 400);
    } else artWait.push(then);
  }
  function drawArt() {
    if (waiting > 0 || !lc) return;
    var look = host.getAttribute('data-scheme');
    var x = lc.schemes && lc.schemes.filter(function (s) { return s[0] === look; })[0];
    if (!x || !x[4]) { trimTop.hidden = trimFoot.hidden = true; trimTop.textContent = trimFoot.textContent = ''; artKey = null; return; }
    withArt(function () {
      trimTop.hidden = trimFoot.hidden = false;
      var w = trimTop.clientWidth, key = look + '|' + w;
      if (!w || key === artKey) return;
      artKey = key;
      var used = window.loveCbArt.draw(look, { top: trimTop, foot: trimFoot });
      trimTop.hidden = !used.top;
      trimFoot.hidden = !used.foot;
    });
  }
  try { new ResizeObserver(function () { drawArt(); }).observe(box); } catch (e) { /* drawn once */ }

  /* ── Talking to the forums ───────────────────────────────────────────── */

  function call(q, send) {
    var s = cbState();
    var headers = { accept: 'application/json', authorization: 'Bearer ' + (s ? s.pass : '') };
    if (send) headers['content-type'] = 'application/json';
    return fetch('/cb/forum' + (q ? '?' + q : ''), {
      method: send ? 'POST' : 'GET', headers: headers, body: send ? JSON.stringify(send) : undefined,
      credentials: 'omit', cache: 'no-store',
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (b) { return { status: r.status, body: b || {} }; });
    }, function () { return { status: 0, body: {} }; });
  }
  // What [[ offers, asked of /cb/forum by POST, so nothing typed is in an address (links.js).
  function findLinks(q) { return call(null, { action: 'links', q: q }).then(function (r) { return r.status === 200 ? r.body.found : []; }); }
  // Where each topic read whole is linked from, kept while it is redrawn after a reply or an edit.
  var linkedFrom = {};
  function why(r, otherwise) {
    if (r.body && typeof r.body.error === 'string' && r.body.error && r.status !== 404) return r.body.error;
    if (r.status === 404 && r.body && r.body.error) return r.body.error;
    if (r.status === 404 || r.status === 405) return 'The forums only answer on stimpunks.world itself.';
    if (r.status === 0) return 'No signal. The forums could not be reached just now.';
    return otherwise;
  }

  /* A picture or a file, put up or fetched with the pass. */
  function fileCall(q, bytes) {
    var s = cbState();
    var headers = { authorization: 'Bearer ' + (s ? s.pass : '') };
    if (bytes) { headers['content-type'] = 'application/octet-stream'; headers.accept = 'application/json'; }
    return fetch('/cb/forum/file?' + q, { method: bytes ? 'POST' : 'GET', headers: headers, body: bytes || undefined, credentials: 'omit', cache: 'no-store' });
  }

  /* Who's online, the radio's own list, for the @ completion: claimed names
     only, because only they can read the forums. Asked once, when an @ is
     first typed. */
  var online = null, onlineAsk = null;
  // Who else the @ list offers: whoever started or last posted in a topic you can read (forumPeople), asked once.
  var known = null, knownAsk = null;
  function loadKnown() {
    if (knownAsk) return knownAsk;
    knownAsk = call('view=people').then(function (r) { known = r.status === 200 && Array.isArray(r.body.people) ? r.body.people : []; return known; });
    return knownAsk;
  }
  function loadOnline() {
    if (onlineAsk) return onlineAsk;
    var s = cbState();
    onlineAsk = fetch('/cb/online', { headers: { accept: 'application/json', authorization: 'Bearer ' + (s ? s.pass : '') }, credentials: 'omit', cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        online = ((d && d.people) || []).filter(function (x) { return x.claimed; }).map(function (x) { return x.handle; });
        return online;
      }, function () { online = []; return online; });
    return onlineAsk;
  }

  var cats = [], me = null, quick = [];
  var takes = { most: 6, body: 20000, fileMax: 5000000, kinds: ['pdf', 'txt', 'md', 'csv', 'rtf', 'docx', 'xlsx', 'pptx', 'odt', 'ods', 'odp', 'epub'] };
  var rooms = null, roomsAsk = null;
  function loadRooms() {
    if (roomsAsk) return roomsAsk;
    roomsAsk = fetch('/cb-rooms.json', { credentials: 'omit' }).then(function (r) { return r.json(); })
      .then(function (d) { rooms = (d && d.rooms) || []; return rooms; }, function () { rooms = []; return rooms; });
    return roomsAsk;
  }
  function roomByPath(path) {
    if (!rooms) return null;
    var p = String(path || '/').replace(/\.html$/, '');
    return rooms.filter(function (r) { return r.path.replace(/\.html$/, '') === p; })[0] || null;
  }
  function roomByTag(tag) {
    var c = FORUM_ROOM_TAG.test(tag || '') ? catOf(tag.slice(FORUM_ROOM.length)) : null;
    if (c) return { tag: tag, name: FORUM_ROOM_NAME + c.name, path: '/forum.html#/c/' + c.slug };
    return rooms ? rooms.filter(function (r) { return r.tag === tag; })[0] || null : null;
  }
  function catOf(slug) { return cats.filter(function (c) { return c.slug === slug; })[0] || null; }
  function kidsOf(slug) { return cats.filter(function (c) { return c.parent === slug; }); }
  function pathOf(c) { var out = []; while (c) { out.unshift(c); c = c.parent ? catOf(c.parent) : null; } return out; }
  // A category by the path to it, so a year says whose year it is.
  function label(c) { return pathOf(c).map(function (x) { return x.name; }).join(' › '); }
  // Where a topic can start in or under a category: itself, or the first
  // under it that holds topics, as New topic in a shelf needs.
  function startIn(c) {
    if (!c) return null;
    if (c.start) return c;
    var k = kidsOf(c.slug);
    for (var i = 0; i < k.length; i++) { var x = startIn(k[i]); if (x) return x; }
    return null;
  }

  /* ── Words for times and keeps ─────────────────────────────────────────── */

  function when(t) {
    try {
      var d = new Date(t), now = new Date();
      var o = { day: 'numeric', month: 'long' };
      if (d.getFullYear() !== now.getFullYear()) o.year = 'numeric';
      return d.toLocaleDateString(undefined, o) + ', ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    } catch (e) { return ''; }
  }
  function dayOf(t) {
    try { return new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch (e) { return ''; }
  }
  function keepWords(keep) {
    if (keep === 'never') return 'Topics here are kept for good.';
    if (keep === '1 week') return 'A topic here goes a week after its last post.';
    var m = /^(\d+) months$/.exec(keep || '');
    var n = m ? +m[1] : 3;
    return 'A topic here goes ' + (['no', 'one', 'two', 'three', 'four', 'five', 'six'][n] || n) + ' months after its last post.';
  }
  function goesWords(x) {
    if (x.pinned) return 'Kept while it is pinned.';
    if (x.goes == null) return 'Kept for good.';
    return 'Goes on ' + dayOf(x.goes) + ' unless somebody posts in it.';
  }
  function sizeWords(n) {
    if (n >= 1000000) return (Math.round(n / 100000) / 10) + ' MB';
    return Math.max(1, Math.round(n / 1000)) + ' KB';
  }
  function runtime(n) {
    var h = Math.floor(n / 3600), m = Math.floor((n % 3600) / 60), s = n % 60;
    var two = function (v) { return (v < 10 ? '0' : '') + v; };
    return h ? h + ':' + two(m) + ':' + two(s) : m + ':' + two(s);
  }

  /* What is new to you: a topic you have never opened that was started since
     you first came here, and one you have opened whose latest post is since. */
  function newness(x) {
    var m = mine(), seen = m.seen || {};
    if (seen[x.id] == null) return m.since && x.t > m.since ? 'New' : null;
    return x.last > seen[x.id] ? 'New posts' : null;
  }
  function markSeen(t) {
    var m = mine();
    m.seen = m.seen || {};
    m.seen[t.id] = t.last;
    var ids = Object.keys(m.seen);
    if (ids.length > SEEN_MAX) {
      ids.sort(function (a, b) { return m.seen[a] - m.seen[b]; });
      ids.slice(0, ids.length - SEEN_MAX).forEach(function (k) { delete m.seen[k]; });
    }
    keepMine(m);
  }
  function unsee(id) { var m = mine(); if (m.seen && m.seen[id] != null) { delete m.seen[id]; keepMine(m); } }

  /* ── Pieces ──────────────────────────────────────────────────────────── */

  /* BASE, filled, beside a moderator's name. There is no CLAIMED any more:
     every username on the CB is claimed (2026-10-21), so it said nothing. */
  function tag(text) { return el('span', 'cb-tag', text); }
  function marks(into, base) { if (base) into.appendChild(tag('BASE')); }

  /* A name opens that person's profile on the radio, as a handle on the channel does. */
  function who(handle, base) {
    var b = el('button', 'fm-who', handle);
    b.type = 'button';
    b.setAttribute('aria-label', handle + '’s profile');
    b.addEventListener('click', function () {
      if (window.loveRadioPeek) window.loveRadioPeek(handle, b, { base: !!base, claimed: !base });
      else say('Open the radio, in the corner, to see ' + handle + '’s profile.');
    });
    return b;
  }

  function heading(level, text, cls) {
    var h = el('h' + level, cls || null, text);
    h.tabIndex = -1;
    return h;
  }

  function quiet(text) { return el('p', 'cb-quiet', text); }

  /* A topic's tags, each a link to its category's topics that carry it. */
  function tagLine(x) {
    if (!x.tags || !x.tags.length) return null;
    var slug = x.cat && x.cat.slug ? x.cat.slug : x.cat;
    var ul = el('ul', 'fm-tags');
    ul.setAttribute('aria-label', 'Tags');
    x.tags.forEach(function (t) {
      var li = el('li');
      var a = el('a', 'fm-tagchip', t);
      a.href = '#/c/' + slug + '?tag=' + encodeURIComponent(t);
      li.appendChild(a);
      ul.appendChild(li);
    });
    return ul;
  }
  /* What was typed in a box of tags: commas between them; the server makes the rest lower case and hyphened. */
  function tagsFrom(v) { return String(v || '').split(/[,\n]+/).map(function (x) { return x.trim(); }).filter(Boolean); }
  var TAGS_HINT = 'Separate tags with commas. Each is lower case letters, numbers and hyphens, like grant-round; a space becomes a hyphen.';

  /* The path to a category, each a link, after `lead`. */
  function crumbs(lead, path, cls) {
    var p = el('p', cls || 'fm-crumbs');
    if (lead) p.appendChild(document.createTextNode(lead));
    path.forEach(function (x, i) {
      if (i) p.appendChild(document.createTextNode(' › '));
      var a = el('a', null, x.name);
      a.href = '#/c/' + x.slug;
      p.appendChild(a);
    });
    return p;
  }

  function topicRow(x) {
    var li = el('li', 'fm-row');
    var top = el('p', 'fm-row__top');
    var a = el('a', 'fm-row__title', x.title);
    a.href = '#/t/' + x.id;
    top.appendChild(a);
    if (x.pinned) top.appendChild(tag('PINNED', true));
    if (x.closed) top.appendChild(tag('CLOSED', true));
    if (x.poll) top.appendChild(tag('POLL', true));
    var n = newness(x);
    if (n) top.appendChild(tag(n.toUpperCase()));
    li.appendChild(top);
    var meta = el('p', 'fm-row__meta');
    var c = catOf(x.cat);
    if (c) {
      var ca = el('a', null, label(c));
      ca.href = '#/c/' + c.slug;
      meta.appendChild(ca);
      meta.appendChild(document.createTextNode(' · '));
    }
    meta.appendChild(document.createTextNode('started by ' + x.handle));
    if (x.last !== x.t || x.lastBy !== x.handle) meta.appendChild(document.createTextNode(' · latest from ' + x.lastBy + ', ' + when(x.last)));
    else meta.appendChild(document.createTextNode(', ' + when(x.t)));
    li.appendChild(meta);
    var tl = tagLine(x);
    if (tl) li.appendChild(tl);
    return li;
  }
  function topicList(list, empty) {
    if (!list.length) return quiet(empty);
    var ul = el('ul', 'fm-rows');
    list.forEach(function (x) { ul.appendChild(topicRow(x)); });
    return ul;
  }

  function drawSide(active) {
    side.textContent = '';
    var d = el('details', 'fm-side__box');
    d.open = window.matchMedia ? !window.matchMedia('(max-width: 759px)').matches : true;
    d.appendChild(el('summary', 'fm-side__sum', 'Categories'));
    var groups = [];
    cats.forEach(function (c) { if (!c.parent && groups.indexOf(c.group) < 0) groups.push(c.group); });
    // A category's subcategories are a list inside its own item.
    function list(of, cls) {
      var ul = el('ul', cls);
      of.forEach(function (c) {
        var li = el('li');
        var a = el('a', null, c.name);
        a.href = '#/c/' + c.slug;
        if (c.slug === active) a.setAttribute('aria-current', 'page');
        li.appendChild(a);
        var k = kidsOf(c.slug);
        if (k.length) li.appendChild(list(k, 'fm-side__list fm-side__sub'));
        ul.appendChild(li);
      });
      return ul;
    }
    groups.forEach(function (g) {
      d.appendChild(el('p', 'cb-h fm-side__group', g));
      d.appendChild(list(cats.filter(function (c) { return !c.parent && c.group === g; }), 'fm-side__list'));
    });
    side.appendChild(d);
  }

  /* ── Posts: words, previews, copied messages ─────────────────────────── */

  // `pic` draws a picture the server placed in the words (markdown.js's hook).
  function blocks(nodes, into, pic) {
    var run = [];
    function flush() { if (run.length) { window.loveMarkdown.blocks(run, into, { top: 3, prefix: 'fm', pic: pic || null }); run = []; } }
    (nodes || []).forEach(function (b) {
      if (b.t === 'preview') { flush(); into.appendChild(previewOf(b)); }
      else run.push(b);
    });
    flush();
  }

  function plainLink(href) {
    var p = el('p');
    var a = el('a', null, href);
    a.href = href;
    p.appendChild(a);
    return p;
  }
  function hostOf(href) { try { return new URL(href).host; } catch (e) { return ''; } }

  function previewOf(b) {
    if (b.kind === 'street') {
      var room = roomByPath(b.path);
      if (!room) return plainLink(b.href);
      var card = el('a', 'fm-card fm-card--street');
      card.href = room.path;
      card.appendChild(el('span', 'fm-card__site', 'On the street'));
      card.appendChild(el('span', 'fm-card__title', room.name));
      if (room.about) card.appendChild(el('span', 'fm-card__about', room.about));
      return card;
    }
    if (b.kind === 'page') {
      var pc = el('div', 'fm-card');
      if (b.site) pc.appendChild(el('p', 'fm-card__site', b.site));
      var t = el('p', 'fm-card__title');
      var a = el('a', null, b.title);
      a.href = b.href;
      a.rel = 'noopener noreferrer';
      t.appendChild(a);
      pc.appendChild(t);
      if (b.about) pc.appendChild(el('p', 'fm-card__about', b.about));
      var h = hostOf(b.href);
      pc.appendChild(el('p', 'fm-card__host', '↗ ' + h + (b.host && b.host !== h ? ', which goes on to ' + b.host : '')));
      return pc;
    }
    if (b.kind === 'video') {
      var vc = el('div', 'fm-card fm-card--video');
      if (b.embed && (b.length || b.live)) {
        var play = el('button', 'cb-btn fm-play');
        play.type = 'button';
        play.textContent = 'Play “' + b.title + '”' + (b.channel ? ', from ' + b.channel : '') +
          (b.live ? '. It is live, so it runs until you close it' : ' (' + runtime(b.length) + ')');
        play.addEventListener('click', function () {
          var f = window.loveEmbed && window.loveEmbed.frame(b.id, b.title);
          if (!f) { say('The player could not be opened on this page.'); return; }
          var shell = el('div', 'fm-screen');
          shell.appendChild(f);
          play.replaceWith(shell);
          f.focus();
        });
        vc.appendChild(play);
        vc.appendChild(el('p', 'fm-card__host', 'Nothing from YouTube loads until you press it.'));
      } else {
        var door = el('a', 'fm-door');
        door.href = 'https://www.youtube.com/watch?v=' + b.id;
        door.rel = 'noopener noreferrer';
        door.textContent = 'Watch “' + b.title + '”' + (b.channel ? ', from ' + b.channel : '') + ', on YouTube ↗';
        vc.appendChild(door);
        vc.appendChild(el('p', 'fm-card__host', b.length ? 'Its maker does not let it play on other sites, so it opens on YouTube.'
          : 'How long it runs could not be found out when it was posted, so it opens on YouTube rather than playing here.'));
      }
      return vc;
    }
    return plainLink(b.href);
  }

  function copied(t, p) {
    var c = p.cb;
    var wrap = el('div', 'cb-lcd fm-cb');
    var room = c.room ? roomByTag(c.room) : null;
    var from = c.room ? (room ? '#' + room.name : 'a room on the street') : 'World';
    /* A channel keeps 48 hours since 2026-10-18, so what was copied can span
       two days or three: the heading names the day only when there is one,
       and otherwise every message says its own. */
    var days = {};
    c.messages.forEach(function (m) { days[dayOf(m.t)] = true; });
    var oneDay = Object.keys(days).length === 1 ? Object.keys(days)[0] : '';
    wrap.appendChild(el('p', 'fm-cb__from', 'Copied from the CB: ' + from + (oneDay ? ', ' + oneDay : '')));
    var ul = el('ul', 'fm-cb__log');
    c.messages.forEach(function (m) {
      var li = el('li', 'fm-cb__msg');
      var head = el('p', 'fm-cb__head');
      head.appendChild(el('b', null, m.handle));
      if (m.base) head.appendChild(tag('BASE'));
      var tm = el('span', 'fm-cb__time');
      try { tm.textContent = oneDay ? new Date(m.t).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) : when(m.t); } catch (e) {}
      head.appendChild(tm);
      // Its sender edited it on the channel before it was copied.
      if (m.edited) head.appendChild(el('span', 'fm-cb__edited', 'edited'));
      li.appendChild(head);
      var words = el('div', 'fm-body fm-cb__words');
      blocks(m.blocks, words);
      if (t.posts) markMentions(words, peopleOf(t));
      li.appendChild(words);
      if (m.takeOut) {
        var out = el('button', 'cb-btn fm-small', fold(m.handle) === fold(me && me.handle) ? 'Take my message out' : 'Take ' + m.handle + '’s message out');
        out.type = 'button';
        out.addEventListener('click', function () {
          sure(li, 'This takes the message out of this topic for everybody. It cannot be put back.', 'Take it out', function (done) {
            act({ action: 'uncopy', t: t.id, p: p.id, m: m.id }, 'Taken out.', done);
          }, out);
        });
        li.appendChild(out);
      }
      ul.appendChild(li);
    });
    wrap.appendChild(ul);
    return wrap;
  }

  /* ── Pictures and files in a post ────────────────────────────────────── */

  // Each fetched once while this page is open, and only when it comes near
  // the screen, so a long topic does not ask for every picture at once.
  var fetched = {};
  var near = null;
  try {
    near = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { near.unobserve(e.target); e.target.fmLoad(); } });
    }, { rootMargin: '600px 0px' });
  } catch (e) { near = null; }

  function fileQuery(t, f) { return 't=' + encodeURIComponent(t.id) + '&f=' + encodeURIComponent(f.id); }

  function picOf(t, p, f) { return picEl('li', 'fm-pic', t, p, f, f.alt); }

  /* A picture standing in the words where the post put it: the same frame,
     pressed to grow, fetched as it comes near, inside the paragraph. */
  function picIn(t, p, n) {
    var f = (p.files || []).filter(function (x) { return x.id === n.id; })[0];
    if (!f) return document.createTextNode(n.alt || '');
    return picEl('span', 'fm-pic fm-pic--in', t, p, f, n.alt);
  }

  function picEl(tag, cls, t, p, f, alt) {
    var li = el(tag, cls);
    var said = alt || (p.handle + ' posted a picture, with no description.');
    var b = el('button', 'fm-pic__btn');
    b.type = 'button';
    b.setAttribute('aria-pressed', 'false');
    b.setAttribute('aria-label', 'Larger: ' + said);
    var img = el('img', 'fm-pic__img');
    img.alt = '';
    b.appendChild(img);
    li.appendChild(b);
    b.addEventListener('click', function () {
      var big = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', String(big));
      li.classList.toggle('fm-pic--large', big);
    });
    var key = t.id + '/' + f.id;
    li.fmLoad = function () {
      if (fetched[key]) { img.src = fetched[key]; return; }
      fileCall(fileQuery(t, f)).then(function (r) { return r.ok ? r.blob() : null; }, function () { return null; }).then(function (blob) {
        if (!blob || !/^image\//.test(blob.type)) { b.replaceWith(el(tag === 'li' ? 'p' : 'span', 'cb-quiet', 'This picture could not be fetched just now: ' + said)); return; }
        img.src = fetched[key] = URL.createObjectURL(blob);
      });
    };
    if (near) near.observe(li); else li.fmLoad();
    return li;
  }

  function docOf(t, f) {
    var li = el('li', 'fm-doc');
    var b = el('button', 'cb-btn fm-small', 'Save “' + f.name + '”');
    b.type = 'button';
    li.appendChild(b);
    li.appendChild(el('span', 'fm-doc__what', (f.name.split('.').pop() || '').toUpperCase() + ', ' + sizeWords(f.size)));
    b.addEventListener('click', function () {
      b.disabled = true;
      fileCall(fileQuery(t, f)).then(function (r) { return r.ok ? r.arrayBuffer() : null; }, function () { return null; }).then(function (buf) {
        b.disabled = false;
        if (!buf) { say('That file could not be fetched just now.'); return; }
        // Saved, never opened here: a type no browser shows as a page.
        var url = URL.createObjectURL(new Blob([buf], { type: 'application/octet-stream' }));
        var a = el('a');
        a.href = url;
        a.download = f.name;
        a.hidden = true;
        box.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
        say('Saving ' + f.name + '. It is exactly as it was posted: open it only with something you trust.');
      });
    });
    return li;
  }

  function attached(t, p) {
    var wrap = el('div', 'fm-files');
    // A picture standing in the words is not shown again below them.
    var pics = (p.files || []).filter(function (f) { return f.kind === 'pic' && !f.placed; });
    var docs = (p.files || []).filter(function (f) { return f.kind === 'file'; });
    if (pics.length) { var ul = el('ul', 'fm-pics'); pics.forEach(function (f) { ul.appendChild(picOf(t, p, f)); }); wrap.appendChild(ul); }
    if (docs.length) { var ul2 = el('ul', 'fm-docs'); docs.forEach(function (f) { ul2.appendChild(docOf(t, f)); }); wrap.appendChild(ul2); }
    return wrap;
  }

  /* ── @mentions in a post ─────────────────────────────────────────────── */

  // Everybody this topic knows by name: who started it, who posted in it, and
  // whose messages were copied into it.
  function peopleOf(t) {
    var out = [];
    function add(h) { if (h && out.every(function (x) { return fold(x) !== fold(h); })) out.push(h); }
    if (!t) return out;
    add(t.handle);
    (t.posts || []).forEach(function (p) {
      add(p.handle);
      (p.at || []).forEach(add);
      if (p.cb) p.cb.messages.forEach(function (m) { add(m.handle); });
    });
    return out;
  }

  /* A mention drawn as the name it is, which opens that person's profile as
     every name in the forums does: only for the handles the server kept with
     the post and the topic's own people, matched as the server's mentions()
     matches, so a word after an @ that is nobody stays a word. Answers
     whether the reader was one of them. Drawn by links.js, which Tasks and the
     office draw theirs with too. */
  function markMentions(into, handles) {
    return window.loveLinks.mentions(into, handles, { p: 'fm', me: me && me.handle, said: say });
  }

  function reactions(t, p) {
    var line = el('div', 'fm-rx');
    (p.reactions || []).forEach(function (r) {
      var b = el('button', 'cb-btn fm-rx__btn');
      b.type = 'button';
      var mineToo = r.who.some(function (h) { return fold(h) === fold(me && me.handle); });
      b.setAttribute('aria-pressed', String(mineToo));
      b.setAttribute('aria-label', r.name + ', from ' + r.who.join(', ') + (mineToo ? '. Press to take yours off.' : '. Press to add yours.'));
      b.appendChild(el('span', 'fm-rx__emoji', r.emoji));
      b.appendChild(el('span', 'fm-rx__who', r.who.join(', ')));
      b.addEventListener('click', function () { act({ action: 'react', t: t.id, p: p.id, emoji: r.emoji }, null); });
      line.appendChild(b);
    });
    var add = el('button', 'cb-btn fm-small', 'React');
    add.type = 'button';
    add.setAttribute('aria-expanded', 'false');
    var pick = null;
    add.addEventListener('click', function () {
      if (pick) { pick.remove(); pick = null; add.setAttribute('aria-expanded', 'false'); return; }
      pick = el('div', 'fm-rx__pick');
      pick.setAttribute('role', 'group');
      pick.setAttribute('aria-label', 'Reactions');
      quick.forEach(function (q) {
        var b = el('button', 'cb-btn fm-rx__btn', q.emoji);
        b.type = 'button';
        b.setAttribute('aria-label', q.name);
        b.addEventListener('click', function () { act({ action: 'react', t: t.id, p: p.id, emoji: q.emoji }, null); });
        pick.appendChild(b);
      });
      var anyLab = el('label', 'sr', 'Any other emoji');
      var any = el('input', 'cb-say fm-rx__any');
      any.id = 'fm-any-' + p.id; anyLab.htmlFor = any.id;
      any.placeholder = 'Any emoji';
      any.maxLength = 16;
      any.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && any.value.trim()) { e.preventDefault(); act({ action: 'react', t: t.id, p: p.id, emoji: any.value.trim() }, null); }
        if (e.key === 'Escape') { e.preventDefault(); add.click(); add.focus(); }
      });
      pick.appendChild(anyLab);
      pick.appendChild(any);
      line.appendChild(pick);
      add.setAttribute('aria-expanded', 'true');
      pick.querySelector('button').focus();
    });
    line.appendChild(add);
    return line;
  }

  /* A second press for anything that cannot be put back, beside the first. */
  function sure(into, text, yesText, yes, back) {
    var b = el('div', 'fm-sure');
    b.appendChild(el('p', null, text));
    var y = el('button', 'cb-btn fm-small', yesText); y.type = 'button';
    var n = el('button', 'cb-btn fm-small', 'Leave it'); n.type = 'button';
    b.appendChild(y); b.appendChild(n);
    into.appendChild(b);
    if (back) back.hidden = true;
    n.focus();
    n.addEventListener('click', function () { b.remove(); if (back) { back.hidden = false; back.focus(); } });
    y.addEventListener('click', function () { y.disabled = true; yes(function () { y.disabled = false; }); });
  }

  /* poll:begin */
  /* A TOPIC'S POLL, the one place in the forums with numbers in it (Ryan's
     call, 2026-10-22): how many picked each choice, in the poll's own order,
     never sorted by it, and no winner marked. A show of hands names who picked
     what as the votes come in. A sealed ballot shows nobody a number until it
     closes, because until then the server sends none, and its vote goes only
     after a second press, because it cannot be taken back. */
  function votes(n) { return n === 1 ? '1 vote' : n ? n + ' votes' : 'No votes'; }
  function pollTally(c, total) {
    var line = el('div', 'fm-poll__tally');
    line.id = 'fm-poll-n-' + c.id;
    var bar = el('span', 'fm-poll__bar');
    bar.setAttribute('aria-hidden', 'true');
    var fill = el('span', 'fm-poll__fill');
    fill.style.width = (total ? Math.round(100 * c.n / total) : 0) + '%';
    bar.appendChild(fill);
    line.appendChild(bar);
    line.appendChild(el('span', 'fm-poll__n', votes(c.n) + (c.who && c.who.length ? ': ' + c.who.join(', ') : '')));
    return line;
  }
  function pollForm(t, poll) {
    var sealed = poll.kind === 'sealed', mineNow = poll.mine || [];
    var form = el('form', 'fm-poll__form');
    form.noValidate = true;
    var set = el('fieldset', 'fm-poll__set');
    set.appendChild(el('legend', 'sr', poll.many ? 'Your choices' : 'Your choice'));
    var boxes = [];
    poll.choices.forEach(function (c) {
      var row = el('div', 'fm-poll__choice');
      var lab = el('label', 'fm-poll__pick');
      var inp = el('input');
      inp.type = poll.many ? 'checkbox' : 'radio';
      inp.name = 'fm-poll-pick';
      inp.value = c.id;
      inp.checked = mineNow.indexOf(c.id) >= 0;
      boxes.push(inp);
      lab.appendChild(inp);
      lab.appendChild(el('span', 'fm-poll__text', c.text));
      row.appendChild(lab);
      if (!sealed) { row.appendChild(pollTally(c, poll.n)); inp.setAttribute('aria-describedby', 'fm-poll-n-' + c.id); }
      set.appendChild(row);
    });
    form.appendChild(set);
    var row = el('div', 'fm-poll__tools');
    var go = el('button', 'cb-btn fm-small', mineNow.length ? 'Change my vote' : 'Vote'); go.type = 'submit';
    row.appendChild(go);
    if (mineNow.length) {
      var back = el('button', 'cb-btn fm-small', 'Take my vote back'); back.type = 'button';
      back.addEventListener('click', function () {
        back.disabled = true;
        act({ action: 'vote', t: t.id, picks: [] }, 'Your vote is taken back.', function () { back.disabled = false; });
      });
      row.appendChild(back);
    }
    form.appendChild(row);
    var answer = el('p', 'fm-answer');
    answer.setAttribute('role', 'status');
    form.appendChild(answer);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (row.querySelector('.fm-sure')) return;
      var ids = boxes.filter(function (b) { return b.checked; }).map(function (b) { return b.value; });
      if (!ids.length) { answer.textContent = 'Pick a choice first.'; return; }
      answer.textContent = '';
      if (!sealed) {
        go.disabled = true;
        act({ action: 'vote', t: t.id, picks: ids }, mineNow.length ? 'Your vote is changed.' : 'Your vote is in.', function () { go.disabled = false; });
        return;
      }
      var named = poll.choices.filter(function (c) { return ids.indexOf(c.id) >= 0; }).map(function (c) { return '“' + c.text + '”'; }).join(' and ');
      sure(row, 'Your vote for ' + named + ' cannot be changed or taken back afterwards, because nothing we keep says what you picked.', 'Cast my vote', function (done) {
        act({ action: 'vote', t: t.id, picks: ids }, 'Your vote is in. Nothing we keep says what you picked.', done);
      }, go);
    });
    return form;
  }
  function pollResults(poll) {
    var list = el('ul', 'fm-poll__results');
    poll.choices.forEach(function (c) {
      var li = el('li', 'fm-poll__choice');
      var yours = poll.mine && poll.mine.indexOf(c.id) >= 0;
      li.appendChild(el('span', 'fm-poll__text', c.text + (yours ? ' (your vote)' : '')));
      if (c.n != null) li.appendChild(pollTally(c, poll.n));
      list.appendChild(li);
    });
    return list;
  }
  function pollOf(t) {
    var poll = t.poll, sealed = poll.kind === 'sealed';
    var box = el('section', 'fm-poll');
    box.id = 'fm-poll';
    box.tabIndex = -1;
    box.setAttribute('aria-labelledby', 'fm-poll-h');
    var kind = el('p', 'fm-poll__kind');
    kind.appendChild(tag(sealed ? 'SEALED BALLOT' : 'SHOW OF HANDS', true));
    box.appendChild(kind);
    // The question is a sentence that is read, so it is set as the topic's title is, never in the theme's face.
    var h = el('h3', 'fm-poll__h', poll.q || t.title);
    h.id = 'fm-poll-h';
    box.appendChild(h);
    var open = !poll.shut && !t.closed && !(sealed && poll.voted);
    box.appendChild(quiet((sealed
      ? 'A sealed ballot: nothing we keep says who picked what, so nobody can see it, moderators included, and a vote cannot be changed or taken back.'
      : 'A show of hands: everybody who can read this topic sees who picked what.') + (!open ? '' : poll.many ? ' Pick as many as you like.' : ' Pick one.')));
    var then = sealed ? ', and then everybody sees the results.' : '.';
    box.appendChild(quiet(poll.shut ? 'Closed ' + when(poll.shutAt || poll.closes) + '.'
      : poll.closes ? 'Closes ' + when(poll.closes) + then
      : 'Open until ' + t.handle + ' or a moderator closes it' + then));
    box.appendChild(open ? pollForm(t, poll) : pollResults(poll));
    if (!poll.shut && t.closed) box.appendChild(quiet('This topic is closed, so its poll takes no more votes.'));
    if (sealed && poll.voted && !poll.shut) box.appendChild(el('p', 'fm-poll__done', 'You have voted. Nothing we keep says what you picked, so it cannot be changed. The results show when the poll closes.'));
    if (sealed && poll.shut) box.appendChild(quiet('Ballots cast: ' + poll.n + '.'));
    var tools = el('div', 'fm-poll__tools');
    if (poll.close) {
      var shutB = el('button', 'cb-btn fm-small', sealed ? 'Close the poll and show the results' : 'Close the poll'); shutB.type = 'button';
      shutB.addEventListener('click', function () {
        if (!sealed) { shutB.disabled = true; act({ action: 'poll', t: t.id }, 'The poll is closed.', function () { shutB.disabled = false; }); return; }
        sure(tools, 'Closing shows the results to everybody, and a sealed ballot cannot be opened again.', 'Close it', function (done) {
          act({ action: 'poll', t: t.id }, 'The poll is closed, and its results are out.', done);
        }, shutB);
      });
      tools.appendChild(shutB);
    }
    if (poll.reopen) {
      var openB = el('button', 'cb-btn fm-small', 'Open the poll again'); openB.type = 'button';
      openB.addEventListener('click', function () {
        openB.disabled = true;
        act({ action: 'poll', t: t.id, open: true }, 'The poll is open again.', function () { openB.disabled = false; });
      });
      tools.appendChild(openB);
    }
    if (tools.children.length) box.appendChild(tools);
    return box;
  }
  /* poll:end */

  function postOf(t, p, i) {
    var art = el('article', 'fm-post');
    art.id = 'fm-p-' + p.id;
    art.setAttribute('aria-labelledby', 'fm-p-' + p.id + '-by');
    var head = el('p', 'fm-post__head');
    head.id = 'fm-p-' + p.id + '-by';
    // A wiki page is everybody's to keep up: it says who started it, and who
    // edited it last when that was somebody else.
    if (p.wiki) { head.appendChild(tag('WIKI PAGE', true)); head.appendChild(document.createTextNode(' started by ')); }
    head.appendChild(who(p.handle, p.base));
    marks(head, p.base);
    var link = el('a', 'fm-post__when', when(p.t));
    link.href = '#/t/' + t.id + '/' + p.id;
    link.setAttribute('aria-label', 'Posted ' + when(p.t) + '. Link to this post.');
    head.appendChild(link);
    if (p.notion) {
      var from = el('span', 'fm-post__edited', 'brought from ');
      var na = el('a', null, 'Notion');
      na.href = 'https://www.notion.so/' + p.notion;
      na.setAttribute('aria-label', 'Brought from Notion. Its page there.');
      from.appendChild(na);
      head.appendChild(from);
    }
    if (p.edited && p.editedBy && p.editedBy !== p.handle) {
      var eby = el('span', 'fm-post__edited', 'edited by ');
      eby.appendChild(who(p.editedBy, p.editedBase));
      eby.appendChild(document.createTextNode(' ' + when(p.edited)));
      head.appendChild(eby);
    } else if (p.edited) head.appendChild(el('span', 'fm-post__edited', 'edited ' + when(p.edited)));
    art.appendChild(head);
    if (p.reply) {
      var to = t.posts.filter(function (x) { return x.id === p.reply; })[0];
      if (to) {
        var rp = el('p', 'fm-post__reply');
        rp.appendChild(document.createTextNode('In reply to '));
        var ra = el('a', null, to.handle + '’s post');
        ra.href = '#/t/' + t.id + '/' + to.id;
        rp.appendChild(ra);
        art.appendChild(rp);
      }
    }
    if (p.cb) art.appendChild(copied(t, p));
    var body = el('div', 'fm-body');
    blocks(p.blocks, body, function (n) { return picIn(t, p, n); });
    if (markMentions(body, (p.at || []).concat(peopleOf(t)))) head.appendChild(tag('MENTIONS YOU', true));
    if (body.children.length) art.appendChild(body);
    if (p.files && p.files.some(function (f) { return !f.placed; })) art.appendChild(attached(t, p));
    art.appendChild(reactions(t, p));
    var tools = el('div', 'fm-post__tools');
    if (t.reply && !t.full) {
      var rb = el('button', 'cb-btn fm-small', 'Reply'); rb.type = 'button';
      rb.addEventListener('click', function () { replyTo(p); });
      tools.appendChild(rb);
      if (p.body) {
        var qb = el('button', 'cb-btn fm-small', 'Quote'); qb.type = 'button';
        qb.addEventListener('click', function () { quote(p); });
        tools.appendChild(qb);
      }
    }
    if (p.edit) {
      var eb = el('button', 'cb-btn fm-small', 'Edit'); eb.type = 'button';
      eb.addEventListener('click', function () { editing(t, p, i, art); });
      tools.appendChild(eb);
    }
    if (p.takeDown) {
      var db = el('button', 'cb-btn fm-small', 'Take down'); db.type = 'button';
      db.addEventListener('click', function () {
        sure(tools, (p.edit ? 'This takes your post down' : 'This takes ' + p.handle + '’s post down') + ' for everybody, its reactions with it. It cannot be put back.',
          'Take it down', function (done) { act({ action: 'remove', t: t.id, p: p.id }, 'Taken down.', done); }, db);
      });
      tools.appendChild(db);
    }
    art.appendChild(tools);
    return art;
  }

  /* ── The composer ────────────────────────────────────────────────────── */

  var replying = null, current = null, replyBox = null;

  function composer(o) {
    var form = el('form', 'fm-compose');
    form.noValidate = true;
    var key = o.key;
    var draft = mine().draft;
    var fresh = draft && draft.key === key ? draft : null;
    var catSel = null, title = null;
    if (o.cats) {
      var cl = el('label', 'cb-lab', 'Category'); cl.htmlFor = 'fm-c';
      catSel = el('select', 'cb-say fm-field');
      catSel.id = 'fm-c';
      o.cats.forEach(function (c) { var op = el('option', null, label(c) + (c.staff ? ' (staff)' : '')); op.value = c.slug; catSel.appendChild(op); });
      catSel.value = (fresh && fresh.cat) || o.cat || (o.cats[0] && o.cats[0].slug) || '';
      form.appendChild(cl); form.appendChild(catSel);
      var keepLine = quiet('');
      var setKeep = function () { var c = catOf(catSel.value); keepLine.textContent = c ? c.about + ' ' + keepWords(c.keep) : ''; };
      catSel.addEventListener('change', function () { setKeep(); saveDraft(); });
      setKeep();
      form.appendChild(keepLine);
    }
    if (o.title !== undefined) {
      var tl = el('label', 'cb-lab', 'Title'); tl.htmlFor = 'fm-title';
      title = el('input', 'cb-say fm-field');
      title.id = 'fm-title';
      title.maxLength = 120;
      title.value = (fresh && fresh.title != null) ? fresh.title : (o.title || '');
      form.appendChild(tl); form.appendChild(title);
    }
    var tagsIn = null;
    if (o.tags !== undefined) {
      var tgl = el('label', 'cb-lab', 'Tags (you can leave this empty)'); tgl.htmlFor = 'fm-tags';
      tagsIn = el('input', 'cb-say fm-field');
      tagsIn.id = 'fm-tags';
      tagsIn.value = (fresh && fresh.tags != null) ? fresh.tags : (o.tags || []).join(', ');
      tagsIn.setAttribute('aria-describedby', 'fm-tags-hint');
      var tgh = el('p', 'cb-quiet fm-hint', TAGS_HINT);
      tgh.id = 'fm-tags-hint';
      form.appendChild(tgl); form.appendChild(tagsIn); form.appendChild(tgh);
    }
    if (o.templates && o.templates.length) form.insertBefore(templateRow(), title ? title.previousSibling : null);
    if (o.above) form.appendChild(o.above);
    var tid = 'fm-body-' + key.replace(/[^a-z0-9]/gi, '');
    var bl = el('label', 'cb-lab', o.label || 'Your post'); bl.htmlFor = tid;
    var text = el('textarea', 'cb-say fm-text');
    text.id = tid;
    text.rows = 7;
    text.value = (fresh && fresh.body != null) ? fresh.body : (o.body || '');
    text.setAttribute('aria-describedby', tid + '-hint');
    /* THE @ LIST, the radio's # list for people: the ARIA combobox pattern.
       Typing @ and a letter opens it; arrows move, Enter or Tab puts the name
       in, Escape closes it for that @ and leaves what you typed alone. */
    text.setAttribute('role', 'combobox');
    text.setAttribute('aria-autocomplete', 'list');
    text.setAttribute('aria-controls', tid + '-at');
    text.setAttribute('aria-expanded', 'false');
    var pick = el('ul', 'cb-pick fm-atpick');
    pick.id = tid + '-at';
    pick.setAttribute('role', 'listbox');
    pick.setAttribute('aria-label', 'People to mention');
    pick.hidden = true;
    form.appendChild(bl);
    form.appendChild(text);
    form.appendChild(pick);
    // [[ links a forum topic, and for staff a task or a record of the office (links.js).
    window.loveLinks.attach(text, { ask: findLinks, said: say, after: function () { saveDraft(); } });
    // Buttons for Bold, Italic, Link and the rest, over the box (format.js).
    window.loveFormat.toolbar(text, { p: 'fm', said: say });
    var hint = el('p', 'cb-quiet fm-hint', 'Use the buttons above, or Markdown if you know it: **bold**, *italic*, lists, > quotes, `code`, links, and tables: a row to a line, a | between cells, and a line of dashes and bars under the first row. A link on a line of its own becomes a preview, which our server makes by reading that page once. Paste a screenshot into the box, or drop a picture on it, to have it stand right there in the words. Type @ and a name to mention somebody: if they asked to be told, they are. Type [[ and part of a title to link another topic: everybody who can read it sees its title.');
    hint.id = tid + '-hint';
    form.appendChild(hint);

    /* Pictures and files: each goes up as soon as it is chosen, a picture
       redrawn first in this browser, and waits for the post. A picture can
       stand in the words, as ![what it shows](pic:its-id) on a line of its
       own: Put it in the words writes that at the cursor, and so does pasting
       a screenshot into the box or dropping a picture on it. */
    var files = (o.files || []).map(function (f) { return { id: f.id, kind: f.kind, name: f.name, size: f.size, alt: f.alt || '', had: true }; });
    var pending = 0;
    // A wiki's document holds a screenshot for every step; any other post, a few.
    function most() {
      var c = catSel ? catOf(catSel.value) : null;
      return (o.doc || (c && c.wiki)) && takes.docMost ? takes.docMost : takes.most;
    }
    // As long as this post may be: a wiki's page far longer, kept in step with the category.
    function longest() {
      var c = catSel ? catOf(catSel.value) : null;
      return (o.doc || (c && c.wiki)) && takes.docBody ? takes.docBody : takes.body;
    }
    text.maxLength = longest();
    if (catSel) catSel.addEventListener('change', function () { text.maxLength = longest(); });
    var attach = el('div', 'fm-attach');
    var addBtn = el('button', 'cb-btn fm-small', 'Add pictures or files');
    addBtn.type = 'button';
    var picker = el('input', 'fm-picker');
    picker.type = 'file';
    picker.multiple = true;
    // Any picture: written in two halves, because a slash and a star together
    // read as the start of a comment to the tools that check this file.
    picker.accept = 'image/' + '*,' + takes.kinds.map(function (k) { return '.' + k; }).join(',');
    picker.hidden = true;
    picker.tabIndex = -1;
    addBtn.addEventListener('click', function () { picker.click(); });
    function several(list, at) {
      refused = []; notKind = [];
      list.forEach(function (f) { upload(f, at); });
      if (notKind.length) {
        refused.unshift(notKind.join(' and ') + (notKind.length > 1 ? ' are not kinds' : ' is not a kind') + ' of file the forums take. They take pictures, and ' +
          takes.kinds.map(function (k) { return '.' + k; }).join(', ') + ' files.');
      }
      attWhy.textContent = refused.join(' ');
    }
    picker.addEventListener('change', function () {
      var list = Array.prototype.slice.call(picker.files || []);
      picker.value = '';
      several(list, null);
    });
    var attList = el('ul', 'fm-att');
    // What could not go, kept on its own line so the next file's "ready" does not hide it.
    var attWhy = el('p', 'fm-answer');
    attWhy.setAttribute('role', 'status');
    var refused = [], notKind = [];
    var attNote = el('p', 'cb-quiet fm-hint', 'Pictures are redrawn in your browser before they go, which takes off what a camera wrote into them, where it was taken included. A file goes exactly as it is, with anything written inside it, such as an author’s name. Files can be ' +
      takes.kinds.map(function (k) { return '.' + k; }).join(', ') + ', up to ' + sizeWords(takes.fileMax) + ' each. A picture is shown below the words unless you put it in them. Ask anybody recognisable in a picture before you post it. They are not kept with a draft.');
    attach.appendChild(addBtn);
    attach.appendChild(picker);
    attach.appendChild(attList);
    attach.appendChild(attWhy);
    attach.appendChild(attNote);
    form.appendChild(attach);

    /* A POLL, only when a topic is started, and of the kind its starter
       chooses here and never after: a show of hands, or a sealed ballot. */
    var pollOn = false, pollIn = null, pollToggle = null;
    if (o.poll) {
      var had = fresh && fresh.poll;
      pollToggle = el('button', 'cb-btn fm-small', 'Add a poll'); pollToggle.type = 'button';
      pollToggle.setAttribute('aria-expanded', 'false');
      pollToggle.setAttribute('aria-controls', 'fm-pollset');
      var pset = el('fieldset', 'fm-pollset');
      pset.id = 'fm-pollset';
      pset.hidden = true;
      pset.appendChild(el('legend', 'cb-lab', 'The poll'));
      var kinds = el('div', 'fm-pollset__kinds');
      kinds.setAttribute('role', 'radiogroup');
      kinds.setAttribute('aria-label', 'What kind of poll');
      var kindIn = {};
      [['hands', 'A show of hands', 'Everybody who can read the topic sees who picked what, as the votes come in. A vote can be changed or taken back while the poll is open.'],
        ['sealed', 'A sealed ballot', 'Nothing we keep says who picked what, so nobody can see it, moderators included, and a vote cannot be changed or taken back. Nobody sees a number until the poll closes, and then everybody does. With only a few votes, the results can still say who picked what.']].forEach(function (k) {
        var lab = el('label', 'fm-pollset__kind');
        var r = el('input');
        r.type = 'radio'; r.name = 'fm-poll-kind'; r.value = k[0];
        r.checked = had ? had.kind === k[0] : k[0] === 'hands';
        r.addEventListener('change', saveDraft);
        kindIn[k[0]] = r;
        lab.appendChild(r);
        var words = el('span');
        words.appendChild(el('strong', null, k[1]));
        words.appendChild(document.createTextNode('. ' + k[2]));
        lab.appendChild(words);
        kinds.appendChild(lab);
      });
      pset.appendChild(kinds);
      var pql = el('label', 'cb-lab', 'The question (you can leave this empty, and the title is the question)'); pql.htmlFor = 'fm-poll-q';
      var pq = el('input', 'cb-say fm-field'); pq.id = 'fm-poll-q'; pq.maxLength = takes.q || 300;
      pq.value = had && had.q ? had.q : '';
      var pcl = el('label', 'cb-lab', 'The choices, one to a line'); pcl.htmlFor = 'fm-poll-c';
      var pc = el('textarea', 'cb-say fm-text fm-pollset__choices'); pc.id = 'fm-poll-c'; pc.rows = 4;
      pc.value = had && had.choices ? had.choices.join('\n') : '';
      pc.setAttribute('aria-describedby', 'fm-poll-c-hint');
      var pch = el('p', 'cb-quiet fm-hint', 'Between two and ' + (takes.choices || 20) + ' choices, each up to ' + (takes.choice || 200) + ' characters. They are shown in this order, and so are the results.');
      pch.id = 'fm-poll-c-hint';
      var pml = el('label', 'fm-pollset__many');
      var pm = el('input'); pm.type = 'checkbox'; pm.checked = !!(had && had.many);
      pml.appendChild(pm);
      pml.appendChild(document.createTextNode(' People can pick more than one'));
      var pdl = el('label', 'cb-lab', 'It closes at the end of (you can leave this empty, and close it yourself)'); pdl.htmlFor = 'fm-poll-d';
      var pd = el('input', 'cb-say fm-field fm-pollset__day'); pd.id = 'fm-poll-d'; pd.type = 'date';
      pd.value = had && had.day ? had.day : '';
      [pq, pc, pd].forEach(function (x) { x.addEventListener('input', saveDraft); });
      pm.addEventListener('change', saveDraft);
      [pql, pq, pcl, pc, pch, pml, pdl, pd].forEach(function (x) { pset.appendChild(x); });
      pollIn = function () {
        var kind = kindIn.sealed.checked ? 'sealed' : 'hands';
        var closes = null, m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(pd.value);
        // The end of that day where the starter is, as the date was meant.
        if (m) closes = new Date(+m[1], +m[2] - 1, +m[3], 23, 59, 0).getTime();
        return { kind: kind, q: pq.value, choices: pc.value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean),
          many: pm.checked, closes: closes, day: pd.value };
      };
      var setPoll = function (on) {
        pollOn = on;
        pset.hidden = !on;
        pollToggle.textContent = on ? 'Take the poll off' : 'Add a poll';
        pollToggle.setAttribute('aria-expanded', String(on));
      };
      pollToggle.addEventListener('click', function () { setPoll(!pollOn); if (pollOn) kindIn[kindIn.sealed.checked ? 'sealed' : 'hands'].focus(); saveDraft(); });
      if (had) setPoll(true);
      var prow = el('div', 'fm-attach');
      prow.appendChild(pollToggle);
      prow.appendChild(pset);
      form.appendChild(prow);
    }

    /* A picture's place in the words. Its description goes between the
       brackets, without anything that would end them. */
    function refOf(f) { return new RegExp('!\\[[^\\]\\n]*\\]\\(pic:' + f.id + '\\)', 'g'); }
    function bracket(v) { return String(v || '').replace(/[[\]\n]+/g, ' ').replace(/\s+/g, ' ').trim(); }
    function inWords(f) { return refOf(f).test(text.value); }
    function putIn(f, at) {
      var v = text.value;
      var c = at != null ? Math.min(at, v.length) : (text.selectionEnd != null ? text.selectionEnd : v.length);
      var before = v.slice(0, c), after = v.slice(c);
      var lead = !before || /\n\n$/.test(before) ? '' : (/\n$/.test(before) ? '\n' : '\n\n');
      var tail = /^\n\n/.test(after) ? '' : (/^\n/.test(after) ? '\n' : '\n\n');
      var put = before + lead + '![' + bracket(f.alt) + '](pic:' + f.id + ')' + tail;
      text.value = put + after;
      text.setSelectionRange(put.length, put.length);
      saveDraft();
      return put.length;
    }
    function takeOut(f) {
      text.value = text.value.replace(refOf(f), '').replace(/\n{3,}/g, '\n\n');
      saveDraft();
    }

    function drawFiles() {
      attList.textContent = '';
      files.forEach(function (f, i) {
        var li = el('li', 'fm-att__item');
        if (f.kind === 'pic') {
          if (f.local) { var im = el('img', 'fm-att__thumb'); im.alt = ''; im.src = f.local; li.appendChild(im); }
          var placed = inWords(f);
          var line = el('p', 'fm-att__line', (f.had ? 'A picture already on this post' : 'A picture, ready') + (placed ? ', standing in the words where its line is.' : ', shown below the words.'));
          li.appendChild(line);
          var al = el('label', 'cb-lab', 'Say what is in it, if you like');
          var ai = el('input', 'cb-say fm-field');
          ai.id = tid + '-alt-' + i;
          al.htmlFor = ai.id;
          ai.maxLength = 600;
          ai.value = f.alt || '';
          // The words between its brackets follow, so the box and the line agree.
          ai.addEventListener('input', function () {
            f.alt = ai.value;
            if (inWords(f)) { text.value = text.value.replace(refOf(f), '![' + bracket(f.alt) + '](pic:' + f.id + ')'); saveDraft(); }
          });
          li.appendChild(al);
          li.appendChild(ai);
          var where = el('button', 'cb-btn fm-small', placed ? 'Show it below the words instead' : 'Put it in the words, at the cursor');
          where.type = 'button';
          where.addEventListener('click', function () {
            if (inWords(f)) { takeOut(f); answer.textContent = 'It is shown below the words now.'; }
            else { putIn(f, lastAt); answer.textContent = 'It stands in the words now, on a line of its own. Move the line to move the picture.'; }
            drawFiles();
            var again = attList.children[files.indexOf(f)];
            if (again) again.querySelectorAll('button')[0].focus();
          });
          li.appendChild(where);
        } else {
          li.appendChild(el('p', 'fm-att__line', f.name + ', ' + sizeWords(f.size) + (f.had ? ', already on this post.' : ', ready.')));
        }
        var drop = el('button', 'cb-btn fm-small', f.kind === 'pic' ? 'Take the picture off' : 'Take ' + f.name + ' off');
        drop.type = 'button';
        drop.addEventListener('click', function () {
          files.splice(files.indexOf(f), 1);
          if (f.local) URL.revokeObjectURL(f.local);
          if (f.kind === 'pic' && inWords(f)) takeOut(f);
          drawFiles();
          addBtn.focus();
          answer.textContent = 'Taken off.';
        });
        li.appendChild(drop);
        attList.appendChild(li);
      });
    }

    // Where the cursor was in the box, for a picture put in after it has gone.
    var lastAt = null;

    // `at`: where in the words a pasted or dropped picture goes, or null.
    function upload(file, at) {
      if (files.length + pending >= most()) { refused.push(file.name + ' did not go: ' + (most() > takes.most ? 'a wiki page' : 'a post') + ' holds ' + most() + ' pictures and files at most.'); return; }
      var ext = (String(file.name || '').split('.').pop() || '').toLowerCase();
      var isPic = /^image\//.test(file.type || '') && !/svg/.test(file.type);
      if (!isPic && takes.kinds.indexOf(ext) < 0) {
        notKind.push(file.name || 'That');
        return;
      }
      if (!isPic && file.size > takes.fileMax) { refused.push(file.name + ' is ' + sizeWords(file.size) + '. A file is ' + sizeWords(takes.fileMax) + ' at most.'); return; }
      if (isPic && !window.loveRedraw) { refused.push((file.name || 'The picture') + ' did not go: the radio, which redraws pictures, has not finished loading. Try again in a moment.'); return; }
      pending++;
      go.disabled = true;
      answer.textContent = isPic ? 'Redrawing the picture…' : 'Sending ' + file.name + '…';
      var ready = isPic ? window.loveRedraw(file) : Promise.resolve(file);
      ready.then(function (blob) {
        return fileCall(isPic ? 'kind=pic' : 'kind=file&name=' + encodeURIComponent(file.name), blob).then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (b) {
            if (!r.ok) throw new Error((b && b.error) || 'That could not be sent just now.');
            var f = { id: b.id, kind: b.kind, name: b.name, size: b.size, alt: '' };
            if (isPic) f.local = URL.createObjectURL(blob);
            files.push(f);
            // Several pasted at once go in one after another.
            if (isPic && at != null) at = putIn(f, at);
            drawFiles();
            answer.textContent = isPic ? (at != null ? 'The picture is in the words where you put it. Say what is in it below, if you like.' : 'The picture is ready. Say what is in it below, if you like.') : file.name + ' is ready.';
          });
        });
      }).catch(function (e) {
        answer.textContent = '';
        attWhy.textContent = (attWhy.textContent ? attWhy.textContent + ' ' : '') + (file.name || 'The picture') + ': ' + ((e && e.message && e.message !== 'big') ? e.message : (isPic ? 'it could not be read or made small enough here. Try a screenshot of it, or another picture.' : 'it could not be sent just now.'));
      }).then(function () { pending--; if (!pending) go.disabled = false; });
    }

    /* The @ being typed at the caret: where it starts and what follows it.
       A handle can have spaces in it, so up to three words follow. */
    var picked = [], offer = [], active = -1, dismissed = -1;
    function token() {
      var c = text.selectionStart;
      if (c == null || c !== text.selectionEnd) return null;
      var m = text.value.slice(0, c).match(/(^|[^\p{L}\p{N}_@])@([^\s@][^\n@]{0,23})$/u) || text.value.slice(0, c).match(/(^|[^\p{L}\p{N}_@])@()$/u);
      if (!m || (m[2].match(/ /g) || []).length > 3 || / {2}$/.test(m[2])) return null;
      return { start: c - m[2].length - 1, end: c, q: fold(m[2]), done: / $/.test(m[2]) };
    }
    function people() {
      var out = [];
      function add(h) { if (h && (!me || fold(h) !== fold(me.handle)) && out.every(function (x) { return fold(x) !== fold(h); })) out.push(h); }
      (o.people || []).forEach(add);
      (online || []).forEach(add);
      (known || []).forEach(add);
      return out;
    }
    function shut() {
      pick.hidden = true; pick.textContent = ''; offer = []; active = -1;
      text.setAttribute('aria-expanded', 'false');
      text.removeAttribute('aria-activedescendant');
    }
    function markAt(n) {
      active = n;
      var lis = pick.children;
      for (var i = 0; i < lis.length; i++) lis[i].setAttribute('aria-selected', String(i === n));
      if (lis[n]) text.setAttribute('aria-activedescendant', lis[n].id); else text.removeAttribute('aria-activedescendant');
    }
    function complete() {
      var t = root.activeElement === text && token();
      if (!t || t.start === dismissed) { if (!t) dismissed = -1; shut(); return; }
      if (online === null) loadOnline().then(complete);
      if (known === null) loadKnown().then(complete);
      var q = t.q;
      // A name already typed out in full, and a space after it, is finished.
      if (t.done && people().some(function (h) { return fold(h) === q; })) { shut(); return; }
      var list = people().filter(function (h) {
        var f = fold(h);
        return !q || f.indexOf(q) === 0 || f.split(' ').some(function (w) { return w.indexOf(q) === 0; });
      }).slice(0, 8);
      if (!list.length) { shut(); return; }
      offer = list;
      pick.textContent = '';
      list.forEach(function (h, i) {
        var li = el('li', 'cb-opt');
        li.id = tid + '-at-' + i;
        li.setAttribute('role', 'option');
        li.appendChild(el('span', 'cb-opt__name', h));
        li.addEventListener('mousedown', function (e) { e.preventDefault(); });
        li.addEventListener('click', function () { choose(i); });
        pick.appendChild(li);
      });
      pick.hidden = false;
      text.setAttribute('aria-expanded', 'true');
      markAt(0);
    }
    function choose(n) {
      var t = token(), h = offer[n];
      if (!t || !h) { shut(); return; }
      var v = text.value;
      text.value = v.slice(0, t.start) + '@' + h + ' ' + v.slice(t.end);
      var c = t.start + h.length + 2;
      text.setSelectionRange(c, c);
      if (picked.every(function (x) { return fold(x) !== fold(h); })) picked.push(h);
      shut();
      saveDraft();
      text.focus();
    }
    text.addEventListener('keydown', function (e) {
      if (pick.hidden || e.isComposing) return;
      var n = offer.length;
      if (e.key === 'ArrowDown') { e.preventDefault(); markAt((active + 1) % n); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); markAt((active - 1 + n) % n); }
      else if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); choose(active); }
      else if (e.key === 'Escape') { e.preventDefault(); var t = token(); dismissed = t ? t.start : -1; shut(); }
    });
    text.addEventListener('input', complete);
    text.addEventListener('click', complete);
    text.addEventListener('blur', function () { lastAt = text.selectionEnd; setTimeout(shut, 150); });
    /* A screenshot pasted into the box, or a picture dropped on it, goes up
       and stands in the words where the cursor is. Words pasted stay words. */
    function picturesIn(list) {
      return Array.prototype.slice.call(list || []).filter(function (f) { return /^image\//.test(f.type || '') && !/svg/.test(f.type); });
    }
    text.addEventListener('paste', function (e) {
      var pics = picturesIn(e.clipboardData && e.clipboardData.files);
      if (!pics.length) return;
      e.preventDefault();
      several(pics, text.selectionStart);
    });
    text.addEventListener('dragover', function (e) {
      if (e.dataTransfer && Array.prototype.indexOf.call(e.dataTransfer.types || [], 'Files') >= 0) e.preventDefault();
    });
    text.addEventListener('drop', function (e) {
      var all = Array.prototype.slice.call((e.dataTransfer && e.dataTransfer.files) || []);
      if (!all.length) return;
      e.preventDefault();
      var pics = picturesIn(all);
      several(pics, text.selectionStart);
      if (all.length > pics.length) several(all.filter(function (f) { return pics.indexOf(f) < 0; }), null);
    });
    // Everybody the words might @mention, for the server to check against them.
    function mentioned() {
      var v = text.value;
      return picked.concat(people()).filter(function (h, i, all) {
        return v.toLowerCase().indexOf('@' + h.toLowerCase()) >= 0 && all.indexOf(h) === i;
      }).slice(0, 40);
    }

    var shown = el('div', 'fm-body fm-preview');
    shown.hidden = true;
    form.appendChild(shown);
    var row = el('div', 'fm-compose__row');
    var go = el('button', 'cb-btn fm-go', o.go || 'Post'); go.type = 'submit';
    var look = el('button', 'cb-btn', 'Preview'); look.type = 'button';
    look.setAttribute('aria-pressed', 'false');
    row.appendChild(go); row.appendChild(look);
    if (o.cancel) {
      var no = el('button', 'cb-btn', 'Cancel'); no.type = 'button';
      no.addEventListener('click', function () { clearDraft(); o.cancel(); });
      row.appendChild(no);
    }
    form.appendChild(row);
    var answer = el('p', 'fm-answer');
    answer.setAttribute('role', 'status');
    form.appendChild(answer);
    drawFiles();

    var timer = null;
    function saveDraft() {
      clearTimeout(timer);
      timer = setTimeout(function () {
        var m = mine();
        if (!text.value.trim() && !(title && title.value.trim()) && !pollOn) { if (m.draft && m.draft.key === key) { delete m.draft; keepMine(m); } return; }
        m.draft = { key: key, body: text.value, title: title ? title.value : null, cat: catSel ? catSel.value : null, tags: tagsIn ? tagsIn.value : null };
        if (pollOn) { var pv = pollIn(); m.draft.poll = { kind: pv.kind, q: pv.q, choices: pv.choices, many: pv.many, day: pv.day }; }
        keepMine(m);
      }, 400);
    }
    function clearDraft() { clearTimeout(timer); var m = mine(); if (m.draft && m.draft.key === key) { delete m.draft; keepMine(m); } }
    text.addEventListener('input', saveDraft);
    if (title) title.addEventListener('input', saveDraft);
    if (tagsIn) tagsIn.addEventListener('input', saveDraft);

    look.addEventListener('click', function () {
      if (!shown.hidden) { shown.hidden = true; look.setAttribute('aria-pressed', 'false'); look.textContent = 'Preview'; return; }
      if (!text.value.trim()) { answer.textContent = 'There is nothing to preview yet.'; return; }
      answer.textContent = 'Setting it…';
      var pics = files.filter(function (f) { return f.kind === 'pic'; });
      call(null, { action: 'preview', body: text.value, pics: pics.map(function (f) { return f.id; }) }).then(function (r) {
        if (r.status !== 200) { answer.textContent = why(r, 'The preview could not be made just now.'); return; }
        shown.textContent = '';
        blocks(r.body.blocks, shown, function (n) {
          var f = pics.filter(function (x) { return x.id === n.id; })[0];
          var said = n.alt || (f && f.alt) || 'A picture, with no description yet.';
          if (f && f.had && o.topic) return picEl('span', 'fm-pic fm-pic--in', o.topic, { handle: '', files: [] }, f, said);
          var sp = el('span', 'fm-pic fm-pic--in');
          if (f && f.local) { var im = el('img', 'fm-pic__img'); im.src = f.local; im.alt = said; sp.appendChild(im); }
          else sp.appendChild(el('span', 'cb-quiet', said));
          return sp;
        });
        markMentions(shown, mentioned().concat(o.people || []));
        shown.hidden = false;
        look.setAttribute('aria-pressed', 'true');
        look.textContent = 'Hide the preview';
        answer.textContent = 'This is how it will look. Previews of links are made when you post.';
      });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (pending) { answer.textContent = 'Wait for the pictures and files to be ready.'; return; }
      go.disabled = true;
      answer.textContent = o.sending || 'Posting…';
      var v = { body: text.value, title: title ? title.value : undefined, cat: catSel ? catSel.value : undefined, at: mentioned(),
        tags: tagsIn ? tagsFrom(tagsIn.value) : undefined,
        files: files.map(function (f) { return f.kind === 'pic' && f.alt && f.alt.trim() ? { id: f.id, alt: f.alt.trim() } : { id: f.id }; }) };
      if (pollOn) { var pv = pollIn(); v.poll = { kind: pv.kind, q: pv.q, choices: pv.choices, many: pv.many, closes: pv.closes }; }
      o.send(v).then(function (msg) {
        go.disabled = false;
        if (msg) { answer.textContent = msg; return; }
        clearDraft();
        files.forEach(function (f) { if (f.local) URL.revokeObjectURL(f.local); });
      });
    });
    /* START FROM A TEMPLATE: its title and words, copied in to be filled.
       Over words already written, only after a second press. */
    function templateRow() {
      var row = el('div', 'fm-tpl');
      var lab = el('label', 'cb-lab', 'Start from a template');
      lab.htmlFor = 'fm-tpl';
      var sel = el('select', 'cb-say fm-field');
      sel.id = 'fm-tpl';
      var none = el('option', null, 'No template');
      none.value = '';
      sel.appendChild(none);
      o.templates.forEach(function (x) { var op = el('option', null, x.title); op.value = x.id; sel.appendChild(op); });
      var use = el('button', 'cb-btn fm-small', 'Use it');
      use.type = 'button';
      var said2 = el('p', 'fm-answer');
      said2.setAttribute('role', 'status');
      function useIt(x) {
        if (title) title.value = x.title;
        text.value = x.body;
        // Its tags come with it, so every topic started from it is tagged alike.
        if (tagsIn && x.tags && x.tags.length) tagsIn.value = x.tags.join(', ');
        saveDraft();
        said2.textContent = 'The title and words of “' + x.title + '” are in. Change the title, and fill in the words.';
        if (title) { title.focus(); title.select(); } else text.focus();
      }
      use.addEventListener('click', function () {
        var x = o.templates.filter(function (y) { return y.id === sel.value; })[0];
        if (!x) { said2.textContent = 'Pick a template first.'; return; }
        if (!text.value.trim() && !(title && title.value.trim())) { useIt(x); return; }
        said2.textContent = '';
        sure(row, 'This puts the title and words of “' + x.title + '” in place of what you have written.', 'Use the template', function () {
          var box2 = row.querySelector('.fm-sure');
          if (box2) box2.remove();
          use.hidden = false;
          useIt(x);
        }, use);
      });
      var line = el('div', 'fm-tpl__row');
      line.appendChild(sel);
      line.appendChild(use);
      row.appendChild(lab);
      row.appendChild(line);
      row.appendChild(said2);
      return row;
    }

    form.focusFirst = function () { (title && !title.value ? title : text).focus(); };
    form.text = text;
    return form;
  }

  function replyTo(p) {
    replying = p ? p.id : null;
    drawReplying(p);
    if (replyBox) { replyBox.text.focus(); }
  }
  var replyNote = null;
  function drawReplying(p) {
    if (!replyNote) return;
    replyNote.textContent = '';
    if (!p) { replyNote.hidden = true; return; }
    replyNote.hidden = false;
    replyNote.appendChild(document.createTextNode('Replying to ' + p.handle + '’s post. '));
    var x = el('button', 'cb-btn fm-small', 'Reply to the topic instead'); x.type = 'button';
    x.addEventListener('click', function () { replying = null; drawReplying(null); replyBox.text.focus(); });
    replyNote.appendChild(x);
  }
  function quote(p) {
    if (!replyBox) return;
    var words = p.body.length > 800 ? p.body.slice(0, 800).replace(/\s+\S*$/, '') + ' …' : p.body;
    var q = words.split('\n').map(function (l) { return '> ' + l; }).join('\n') + '\n>\n> — ' + p.handle + '\n\n';
    var tx = replyBox.text;
    tx.value = (tx.value ? tx.value.replace(/\s*$/, '\n\n') : '') + q;
    replyTo(p);
    tx.dispatchEvent(new Event('input'));
    tx.setSelectionRange(tx.value.length, tx.value.length);
  }

  function editing(t, p, i, art) {
    var first = i === 0 && t.retitle;
    var f = composer({
      key: 'edit:' + p.id, body: p.body, title: first ? t.title : undefined, label: p.wiki ? 'The wiki page' : 'Your post', go: 'Save', sending: 'Saving…',
      files: p.files || [], people: peopleOf(t), doc: !!p.wiki, topic: t,
      cancel: function () { f.replaceWith(was); was.querySelector('.fm-post__tools button') && was.querySelector('.fm-post__tools button').focus(); },
      send: function (v) {
        var b = { action: 'edit', t: t.id, p: p.id, body: v.body, files: v.files, at: v.at };
        if (first) b.title = v.title;
        return call(null, b).then(function (r) {
          if (r.status !== 200) return why(r, 'That did not save. Nothing was changed.');
          drawTopic(r.body, p.id);
          say('Saved.');
          return null;
        });
      },
    });
    var was = art;
    art.replaceWith(f);
    f.focusFirst();
  }

  /* An action on the topic open now, redrawing it with what the server says. */
  function act(send, done, release) {
    return call(null, send).then(function (r) {
      if (release) release();
      if (r.status !== 200) { say(why(r, 'That did not work. Nothing was changed.')); return; }
      if (r.body.gone || !r.body.topic) {
        if (current) unsee(current.id);
        say(done || 'Done. The topic has gone.');
        step.go(current ? '#/c/' + current.cat.slug : '#/');
        return;
      }
      drawTopic(r.body, null, true);
      // The button pressed was redrawn with its post, so the keyboard goes back
      // to that post, or to the topic, where it was, without moving the page.
      var back = (send.p && root.getElementById('fm-p-' + send.p)) || ((send.action === 'vote' || send.action === 'poll') && view.querySelector('.fm-poll')) || view.querySelector('h2');
      if (back) { back.tabIndex = -1; back.focus({ preventScroll: true }); }
      if (done) say(done);
    });
  }

  /* ── The views ───────────────────────────────────────────────────────── */

  function blank(h, text) {
    view.textContent = '';
    if (h) view.appendChild(h);
    if (text) view.appendChild(quiet(text));
  }
  function refused(r) {
    placeRadio(null);
    var why2 = why(r, 'The forums could not be read just now.');
    view.textContent = '';
    var h = heading(2, r.body && r.body.claim ? 'Claim your username first' : 'The forums');
    view.appendChild(h);
    view.appendChild(el('p', null, why2));
    if (r.body && r.body.claim) view.appendChild(el('p', null, 'Profile, on the radio in the corner, is where you claim it, with a password of your own. Then reload this page.'));
    if (r.status === 401) view.appendChild(el('p', null, 'Your pass has stopped working, which happens when a password changes. Sign on to the CB again from the radio in the corner.'));
    side.textContent = '';
    return h;
  }

  function guest() {
    placeRadio(null);
    view.textContent = '';
    side.textContent = '';
    var h = heading(2, 'Sign on to read the forums');
    view.appendChild(h);
    view.appendChild(el('p', null, 'The forums are for everybody on the CB. Sign on with the bar in the corner of your screen, or join with an invite if you are new: the radio will ask you to claim your username first if you are on with the old starter password.'));
    var p = el('p');
    var a = el('a', null, 'How to get on the CB');
    a.href = '/community-center.html';
    p.appendChild(a);
    p.appendChild(document.createTextNode(' · '));
    var g = el('a', null, 'What the forums are, in the CB guide');
    g.href = '/cb-guide.html#forums';
    p.appendChild(g);
    view.appendChild(p);
    return h;
  }

  /* EVERY CATEGORY IS A ROOM ON THE CB (Ryan's calls, 2026-10-21), so the
     radio's This room is the category being read: a category's page, a topic
     in it, or a new topic started in it, and a subcategory is its top
     category's room. The forums' home, Latest, Mentions and Search are The
     forums' own room, and so is anything the forums could not show. Said on
     the page's own <body>, where the radio reads it (cb.js's forumHere), with
     love-forum-room when it changes; FORUM_ROOM and the name's start are
     netlify/cb/lib.mjs's, and tools/make-forum.py holds these to them. Only a
     category the server sent this reader is ever written there, and the
     server asks the category's roles again for everything done in its room. */
  var FORUM_ROOM = 'forum-', FORUM_ROOM_NAME = 'The forums: ';
  var FORUM_ROOM_TAG = /^forum-[a-z0-9]+(?:-[a-z0-9]+)*$/;
  function placeRadio(slug) {
    var top = slug ? pathOf(catOf(slug))[0] : null;
    var b = document.body, tag = top ? FORUM_ROOM + top.slug : '';
    if ((b.getAttribute('data-forum-room') || '') === tag) return;
    if (top) {
      b.setAttribute('data-forum-room', tag);
      b.setAttribute('data-forum-room-name', FORUM_ROOM_NAME + top.name);
    } else {
      b.removeAttribute('data-forum-room');
      b.removeAttribute('data-forum-room-name');
    }
    window.dispatchEvent(new CustomEvent('love-forum-room'));
  }

  function took(r, here) {
    if (r.body.cats) cats = r.body.cats;
    if (r.body.me) me = r.body.me;
    if (r.body.takes) takes = r.body.takes;
    navTasks.hidden = !(me && me.tasks);
    navOffice.hidden = !(me && me.office);
    placeRadio(here || null);
    navNew.hidden = !cats.some(function (c) { return c.start; });
    // New topic starts in the category you are in, where you can start one.
    var c = startIn(here && catOf(here));
    navNew.href = c ? '#/new?c=' + encodeURIComponent(c.slug) : '#/new';
  }

  function home() {
    blank(null, 'Looking…');
    return call('view=home').then(function (r) {
      if (r.status !== 200) return refused(r);
      took(r);
      drawSide(null);
      view.textContent = '';
      var h = heading(2, 'Categories');
      view.appendChild(h);
      view.appendChild(el('p', 'fm-lede', 'Topics in categories, for conversations that need longer than two days. Everything here is for claimed usernames on the CB, and nothing about who reads anything is kept.'));
      var groups = [];
      r.body.home.forEach(function (c) { if (groups.indexOf(c.group) < 0) groups.push(c.group); });
      groups.forEach(function (g) {
        view.appendChild(el('h3', 'cb-h fm-group', g));
        var grid = el('div', 'fm-cats');
        r.body.home.filter(function (c) { return c.group === g; }).forEach(function (c) {
          var card = el('section', 'fm-cat');
          card.setAttribute('aria-labelledby', 'fm-cat-' + c.slug);
          var ch = el('h4', 'fm-cat__name');
          ch.id = 'fm-cat-' + c.slug;
          var a = el('a', null, c.name);
          a.href = '#/c/' + c.slug;
          ch.appendChild(a);
          if (c.staff) ch.appendChild(tag('STAFF', true));
          if (c.wiki) ch.appendChild(tag('WIKI', true));
          card.appendChild(ch);
          card.appendChild(el('p', 'fm-cat__about', c.about));
          if (c.subs) card.appendChild(subLine(c.subs));
          card.appendChild(quiet(keepWords(c.keep)));
          if (c.latest.length) {
            var ul = el('ul', 'fm-cat__latest');
            c.latest.forEach(function (x) {
              var li = el('li');
              var ta = el('a', null, x.title);
              ta.href = '#/t/' + x.id;
              li.appendChild(ta);
              var n = newness(x);
              if (n) li.appendChild(tag(n.toUpperCase()));
              li.appendChild(el('span', 'fm-cat__when', ' ' + when(x.last)));
              ul.appendChild(li);
            });
            card.appendChild(ul);
          } else card.appendChild(quiet('Nothing here yet.'));
          grid.appendChild(card);
        });
        view.appendChild(grid);
      });
      return h;
    });
  }

  /* What stands in a category, named in a line of links. */
  function subLine(subs) {
    var p = el('p', 'fm-cat__subs');
    p.appendChild(document.createTextNode('In it: '));
    subs.forEach(function (x, i) {
      if (i) p.appendChild(document.createTextNode(' · '));
      var a = el('a', null, x.name);
      a.href = '#/c/' + x.slug;
      p.appendChild(a);
    });
    return p;
  }

  // In a category, its own pinned topics were on the first page already.
  /* Older topics, a page at a time. Coming back to a list reads again the
     pages that were open (`again`), before steps.js puts the place back. */
  function more(into, q, before, slug, again) {
    var b = el('button', 'cb-btn', 'Older topics'); b.type = 'button';
    function load() {
      b.disabled = true;
      return call(q + '&before=' + before).then(function (r) {
        b.remove();
        if (r.status !== 200) { say(why(r, 'Older topics could not be read just now.')); return null; }
        var ul = into.querySelector('.fm-rows') || into.appendChild(el('ul', 'fm-rows'));
        var first = null;
        r.body.topics.filter(function (x) { return !(slug && x.pinned && x.cat === slug); }).forEach(function (x) { var li = topicRow(x); first = first || li; ul.appendChild(li); });
        return { first: first, on: r.body.more && r.body.topics.length ? r.body.topics[r.body.topics.length - 1].last : null };
      });
    }
    b.addEventListener('click', function () {
      load().then(function (got) {
        if (!got) return;
        step.keep('older', (step.kept('older') || 0) + 1);
        if (got.first) got.first.querySelector('a').focus();
        if (got.on) more(into, q, got.on, slug);
      });
    });
    into.appendChild(b);
    if (!again) return Promise.resolve();
    return load().then(function (got) { if (got && got.on) return more(into, q, got.on, slug, again - 1); });
  }

  function latest() {
    blank(null, 'Looking…');
    return call('view=latest').then(function (r) {
      if (r.status !== 200) return refused(r);
      took(r);
      drawSide(null);
      view.textContent = '';
      var h = heading(2, 'Latest');
      view.appendChild(h);
      view.appendChild(quiet('Every topic you can read, the one posted in most lately first.'));
      view.appendChild(topicList(r.body.topics, 'Nobody has started a topic yet.'));
      var older = r.body.more && r.body.topics.length ? more(view, 'view=latest', r.body.topics[r.body.topics.length - 1].last, null, step.kept('older')) : null;
      return Promise.resolve(older).then(function () { return h; });
    });
  }

  function category(slug, tagged) {
    blank(null, 'Looking…');
    var tagQ = tagged ? '&tag=' + encodeURIComponent(tagged) : '';
    return call('view=cat&c=' + encodeURIComponent(slug) + tagQ).then(function (r) {
      if (r.status !== 200) {
        if (r.status === 404) { took(r); drawSide(null); var h0 = heading(2, 'No such category'); blank(h0, why(r, 'There is no such category.')); return h0; }
        return refused(r);
      }
      took(r, r.body.cat && r.body.cat.slug);
      var c = r.body.cat;
      drawSide(c.slug);
      view.textContent = '';
      var h = heading(2, c.name);
      view.appendChild(h);
      var up = pathOf(catOf(c.slug) || c).slice(0, -1);
      if (up.length) view.appendChild(crumbs('In ', up));
      if (c.staff) view.appendChild(el('p', null, '')).appendChild(tag('STAFF', true));
      if (c.wiki) view.appendChild(el('p', null, '')).appendChild(tag('WIKI', true));
      view.appendChild(el('p', 'fm-lede', c.about));
      view.appendChild(quiet(keepWords(c.keep)));
      var where = startIn(catOf(c.slug) || c);
      if (where) {
        var p = el('p');
        var a = el('a', 'cb-btn fm-start', 'Start a topic in ' + (where.slug === c.slug ? c.name : label(where)));
        a.href = '#/new?c=' + encodeURIComponent(where.slug);
        p.appendChild(a);
        view.appendChild(p);
      } else if (c.shelf) view.appendChild(quiet('Topics go in the categories under it.'));
      else view.appendChild(quiet('Only moderators start topics here. Anybody can reply to them.'));
      if (r.body.subs) {
        view.appendChild(el('h3', 'cb-h fm-group', 'In ' + c.name));
        var ul = el('ul', 'fm-subs');
        r.body.subs.forEach(function (x) {
          var li = el('li', 'fm-sub');
          var a = el('a', 'fm-sub__name', x.name);
          a.href = '#/c/' + x.slug;
          li.appendChild(a);
          li.appendChild(el('p', 'fm-sub__about', x.about));
          ul.appendChild(li);
        });
        view.appendChild(ul);
        view.appendChild(el('h3', 'cb-h fm-group', 'Topics in all of it'));
      }
      // The tags its topics carry, to show only the ones carrying one; never how many.
      if (r.body.tags && r.body.tags.length) {
        var tf = el('nav', 'fm-tagfilter');
        tf.setAttribute('aria-label', 'Tags');
        tf.appendChild(el('p', 'cb-lab', 'Tags'));
        var tu = el('ul', 'fm-tags');
        [''].concat(r.body.tags).forEach(function (x) {
          var li = el('li');
          var a = el('a', 'fm-tagchip', x || 'Every topic');
          a.href = '#/c/' + c.slug + (x ? '?tag=' + encodeURIComponent(x) : '');
          if ((r.body.tag || '') === x) a.setAttribute('aria-current', 'page');
          li.appendChild(a);
          tu.appendChild(li);
        });
        tf.appendChild(tu);
        view.appendChild(tf);
      }
      if (r.body.tag) view.appendChild(el('p', 'fm-lede', 'Only the topics tagged ' + r.body.tag + '.'));
      else if (tagged) view.appendChild(el('p', 'fm-lede', 'No topic here is tagged ' + tagged + '.'));
      view.appendChild(topicList(r.body.topics, r.body.tag ? 'No topic here carries that tag.' : 'Nothing here yet.'));
      var older = null;
      if (r.body.more) {
        var rest = r.body.topics.filter(function (x) { return !(x.pinned && x.cat === c.slug); });
        if (rest.length) older = more(view, 'view=cat&c=' + encodeURIComponent(c.slug) + tagQ, rest[rest.length - 1].last, c.slug, step.kept('older'));
      }
      return Promise.resolve(older).then(function () { return h; });
    });
  }

  function drawTopic(body, focusPost, keepPlace) {
    took({ body: body }, body.topic && body.topic.cat.slug);
    var t = current = body.topic;
    if (body.quick) quick = body.quick;
    markSeen(t);
    drawSide(t.cat.slug);
    var y = window.scrollY;
    view.textContent = '';
    var h = heading(2, t.title, 'fm-topic__title');
    view.appendChild(h);
    var meta = crumbs('', pathOf(catOf(t.cat.slug) || t.cat), 'fm-topic__meta');
    meta.appendChild(document.createTextNode(' · started by ' + t.handle + ', ' + when(t.t)));
    if (t.pinned) meta.appendChild(tag('PINNED', true));
    if (t.closed) meta.appendChild(tag('CLOSED', true));
    view.appendChild(meta);
    var tl = tagLine(t);
    if (tl) view.appendChild(tl);
    view.appendChild(quiet(goesWords(t)));
    if (t.mod || t.takeDown || t.retag) view.appendChild(topicTools(t));
    // A poll stands under the post that opens the topic, or alone when that has been taken down.
    t.posts.forEach(function (p, i) { view.appendChild(postOf(t, p, i)); if (i === 0 && t.poll) view.appendChild(pollOf(t)); });
    if (!t.posts.length && t.poll) view.appendChild(pollOf(t));
    if (!t.posts.length) view.appendChild(quiet('Every post in this topic has been taken down.'));
    // Linked from: the topics, and for staff the tasks and the office's records, that link here (links.js).
    if (body.backlinks) linkedFrom[t.id] = body.backlinks;
    var from = window.loveLinks.backlinks(linkedFrom[t.id], { p: 'fm', heading: function (l, w) { return heading(l, w); } });
    if (from) view.appendChild(from);
    replyBox = null;
    if (t.full) view.appendChild(el('p', null, 'This topic is full. Start a new one, and link back to this one if it helps.'));
    else if (!t.reply) view.appendChild(el('p', null, 'This topic is closed, so nobody can reply to it.'));
    else {
      var rh = el('h3', 'cb-h fm-reply-h', t.closed ? 'Reply (the topic is closed, and you are a moderator)' : 'Reply');
      view.appendChild(rh);
      replyNote = el('p', 'fm-replying');
      replyNote.hidden = true;
      view.appendChild(replyNote);
      replyBox = composer({
        key: 'reply:' + t.id, label: 'Your reply', go: 'Post the reply', people: peopleOf(t),
        send: function (v) {
          return call(null, { action: 'reply', t: t.id, body: v.body, reply: replying, files: v.files, at: v.at }).then(function (r) {
            if (r.status !== 200) return why(r, 'That did not post. Nothing was changed.');
            replying = null;
            drawTopic(r.body, r.body.post);
            say('Posted.');
            return null;
          });
        },
      });
      view.appendChild(replyBox);
      var stillReplying = replying && t.posts.filter(function (p) { return p.id === replying; })[0];
      if (stillReplying) drawReplying(stillReplying); else replying = null;
    }
    if (keepPlace) { window.scrollTo(0, y); return null; }
    if (focusPost) {
      var a = root.getElementById('fm-p-' + focusPost);
      if (a) { a.tabIndex = -1; a.focus(); return null; }
    }
    return h;
  }

  function topicTools(t) {
    var box2 = el('div', 'fm-topic__tools');
    if (t.mod) {
      var pin = el('button', 'cb-btn fm-small', t.pinned ? 'Unpin' : 'Pin'); pin.type = 'button';
      pin.addEventListener('click', function () { act({ action: 'moderate', t: t.id, pin: !t.pinned }, t.pinned ? 'Unpinned. Its clock starts again from now.' : 'Pinned. It stays while it is pinned.'); });
      var shut = el('button', 'cb-btn fm-small', t.closed ? 'Open for replies' : 'Close'); shut.type = 'button';
      shut.addEventListener('click', function () { act({ action: 'moderate', t: t.id, close: !t.closed }, t.closed ? 'Open for replies again.' : 'Closed. Only moderators can reply now.'); });
      box2.appendChild(pin);
      box2.appendChild(shut);
      var ml = el('label', 'sr', 'Move to'); ml.htmlFor = 'fm-move';
      var ms = el('select', 'cb-say fm-small');
      ms.id = 'fm-move';
      cats.forEach(function (c) { if (c.slug !== t.cat.slug && !c.shelf) { var o = el('option', null, label(c)); o.value = c.slug; ms.appendChild(o); } });
      var mv = el('button', 'cb-btn fm-small', 'Move'); mv.type = 'button';
      mv.addEventListener('click', function () { act({ action: 'moderate', t: t.id, move: ms.value }, 'Moved.'); });
      if (ms.children.length) { box2.appendChild(ml); box2.appendChild(ms); box2.appendChild(mv); }
    }
    if (t.retag) {
      var rt = el('div', 'fm-retag');
      var rl = el('label', 'cb-lab', 'Tags'); rl.htmlFor = 'fm-retag';
      var ri = el('input', 'cb-say fm-field');
      ri.id = 'fm-retag';
      ri.value = (t.tags || []).join(', ');
      ri.setAttribute('aria-describedby', 'fm-retag-hint');
      var rb = el('button', 'cb-btn fm-small', 'Save the tags'); rb.type = 'button';
      rb.addEventListener('click', function () { act({ action: 'tag', t: t.id, tags: tagsFrom(ri.value) }, 'Tags saved.'); });
      var rh = el('p', 'cb-quiet fm-hint', TAGS_HINT);
      rh.id = 'fm-retag-hint';
      var rrow = el('div', 'fm-tpl__row');
      rrow.appendChild(ri); rrow.appendChild(rb);
      rt.appendChild(rl); rt.appendChild(rrow); rt.appendChild(rh);
      box2.appendChild(rt);
    }
    if (t.takeDown) {
      var down = el('button', 'cb-btn fm-small', 'Take the topic down'); down.type = 'button';
      down.addEventListener('click', function () {
        sure(box2, 'This takes “' + t.title + '” down for everybody, with every post in it. It cannot be put back.', 'Take it all down',
          function (done) { act({ action: 'removeTopic', t: t.id }, 'Taken down.', done); }, down);
      });
      box2.appendChild(down);
    }
    return box2;
  }

  function topic(id, focusPost) {
    blank(null, 'Looking…');
    return Promise.all([call('view=topic&t=' + encodeURIComponent(id)), loadRooms()]).then(function (rs) {
      var r = rs[0];
      if (r.status !== 200) {
        if (r.status === 404) { unsee(id); took(r); drawSide(null); var h0 = heading(2, 'That topic has gone'); blank(h0, why(r, 'That topic has gone, or is not one you can read.')); return h0; }
        return refused(r);
      }
      return drawTopic(r.body, focusPost);
    });
  }

  function search(q) {
    findBox.value = q;
    blank(null, 'Looking…');
    return call('view=search&q=' + encodeURIComponent(q)).then(function (r) {
      if (r.status !== 200) return refused(r);
      took(r);
      drawSide(null);
      view.textContent = '';
      var h = heading(2, 'Searching for “' + q + '”');
      view.appendChild(h);
      view.appendChild(quiet('Titles, posts, copied messages, file names and picture descriptions in every topic you can read, the latest first. Every word has to be there.'));
      if (!r.body.results.length) { view.appendChild(quiet('Nothing in the forums has all of those words.')); return h; }
      var ul = el('ul', 'fm-rows');
      r.body.results.forEach(function (x) {
        var li = topicRow(x);
        if (x.match) {
          var m = el('p', 'fm-row__match');
          var a = el('a', null, x.match.handle + ': ' + x.match.words);
          a.href = '#/t/' + x.id + (x.match.post ? '/' + x.match.post : '');
          m.appendChild(a);
          li.appendChild(m);
        }
        ul.appendChild(li);
      });
      view.appendChild(ul);
      return h;
    });
  }

  function mentionsView() {
    blank(null, 'Looking…');
    return call('view=mentions').then(function (r) {
      if (r.status !== 200) return refused(r);
      took(r);
      drawSide(null);
      view.textContent = '';
      var h = heading(2, 'Mentions');
      view.appendChild(h);
      view.appendChild(quiet('Topics where somebody else has @mentioned you, in posts or in messages copied from the CB, the latest first. Our server works this out from the posts each time you look, and keeps nothing about it.'));
      if (!r.body.results.length) { view.appendChild(quiet('Nobody has @mentioned you in a topic you can read.')); return h; }
      var ul = el('ul', 'fm-rows');
      r.body.results.forEach(function (x) {
        var li = topicRow(x);
        var m = el('p', 'fm-row__match');
        var a = el('a', null, x.match.handle + ': ' + x.match.words);
        a.href = '#/t/' + x.id + (x.match.post ? '/' + x.match.post : '');
        m.appendChild(a);
        li.appendChild(m);
        ul.appendChild(li);
      });
      view.appendChild(ul);
      return h;
    });
  }

  function newTopic(q) {
    blank(null, 'Looking…');
    var from = q.from ? { room: q.from === 'world' ? null : q.from, ids: (q.ids || '').split(',').filter(Boolean) } : null;
    var asks = [call('view=home'), loadRooms(), call('view=templates')];
    if (from) asks.push(call('view=cb&room=' + encodeURIComponent(from.room || '') + '&ids=' + encodeURIComponent(from.ids.join(','))));
    return Promise.all(asks).then(function (rs) {
      var r = rs[0];
      if (r.status !== 200) return refused(r);
      // Started in a category, or from a category's channel on the CB: that
      // category's, until it is changed, and that category's room on the radio.
      if (r.body.cats) cats = r.body.cats;
      var inCat = q.c || (q.from && FORUM_ROOM_TAG.test(q.from) && catOf(q.from.slice(FORUM_ROOM.length)) ? q.from.slice(FORUM_ROOM.length) : null);
      took(r, inCat);
      drawSide(inCat);
      var templates = rs[2].status === 200 ? rs[2].body.templates || [] : [];
      view.textContent = '';
      var h = heading(2, from ? 'A new topic, from the CB' : 'A new topic');
      view.appendChild(h);
      var startable = cats.filter(function (c) { return c.start; });
      if (!startable.length) { view.appendChild(quiet('There is no category you can start a topic in.')); return h; }
      var above = null;
      if (from) {
        var x = rs[3];
        above = el('div', 'fm-from');
        if (x.status !== 200) {
          above.appendChild(el('p', 'fm-answer', why(x, 'Those messages could not be read off the channel just now.')));
          from = null;
        } else {
          above.appendChild(el('p', null, 'These messages go into the topic exactly as they are on the channel, with their handles and times, and edited on any their sender has edited, copied off the channel by our server when you post. Pictures and stickers stay behind. Whoever sent one can take it out of the topic again.'));
          above.appendChild(el('p', null, 'Ask everybody in the conversation first, as you would before a screenshot.'));
          if (x.body.short) above.appendChild(el('p', 'fm-answer', 'Some of the messages you ticked have gone from the channel, or had no words in them, so they are not here.'));
          above.appendChild(copied({ id: '' }, { id: '', cb: x.body.cb }));
          above.querySelectorAll('.fm-cb__msg > button').forEach(function (b) { b.remove(); });
        }
      }
      var f = composer({
        key: 'new:' + (q.from || '') + ':' + (q.ids || ''), cats: startable, cat: inCat && startIn(catOf(inCat)) ? startIn(catOf(inCat)).slug : inCat, title: '', above: above,
        templates: templates, tags: [], poll: true,
        people: from && rs[3].status === 200 ? rs[3].body.cb.messages.map(function (m) { return m.handle; }) : [],
        label: from ? 'Anything you want to add (you can leave this empty)' : 'Your post', go: 'Start the topic', sending: 'Starting it…',
        send: function (v) {
          var b = { action: 'start', cat: v.cat, title: v.title, body: v.body, files: v.files, at: v.at, tags: v.tags };
          if (v.poll) b.poll = v.poll;
          if (from) b.from = from;
          return call(null, b).then(function (r2) {
            if (r2.status !== 200) return why(r2, 'That did not post. Nothing was changed.');
            step.go('#/t/' + r2.body.topic.id);
            say('Started.');
            return null;
          });
        },
      });
      view.appendChild(f);
      return h;
    });
  }

  /* ── Where in the forums an address is ───────────────────────────────── */

  function route() {
    step.arrive();
    fillSchemes();
    dressNow();
    var hash = location.hash || '';
    if (hash && hash.indexOf('#/') !== 0) hash = '';
    var m = mine();
    if (!m.since) { m.since = Date.now(); keepMine(m); }
    var path = hash.slice(1).split('?')[0] || '/';
    var q = {};
    (hash.split('?')[1] || '').split('&').forEach(function (kv) {
      if (!kv) return;
      var i = kv.indexOf('=');
      try { q[decodeURIComponent(i < 0 ? kv : kv.slice(0, i))] = i < 0 ? '' : decodeURIComponent(kv.slice(i + 1).replace(/\+/g, ' ')); } catch (e) { /* a broken address */ }
    });
    var parts = path.split('/').filter(Boolean);
    var done;
    if (!cbState()) done = Promise.resolve(guest());
    else if (!parts.length) done = home();
    else if (parts[0] === 'latest') done = latest();
    else if (parts[0] === 'c' && parts[1]) done = category(parts[1], q.tag || null);
    else if (parts[0] === 't' && parts[1]) done = topic(parts[1], parts[2] || null);
    else if (parts[0] === 'new') done = newTopic(q);
    else if (parts[0] === 'search' && q.q) done = search(q.q);
    else if (parts[0] === 'mentions') done = mentionsView();
    else done = home();
    [navHome, navLatest, navAt, navNew].forEach(function (a) { a.removeAttribute('aria-current'); });
    if (!parts.length) navHome.setAttribute('aria-current', 'page');
    if (parts[0] === 'latest') navLatest.setAttribute('aria-current', 'page');
    if (parts[0] === 'mentions') navAt.setAttribute('aria-current', 'page');
    if (parts[0] === 'new') navNew.setAttribute('aria-current', 'page');
    // On arriving, the page keeps the keyboard where the browser put it;
    // after that, a step forward puts it on the new view's heading, and a step
    // back on what it was on before (steps.js).
    step.land(done);
  }
  window.addEventListener('hashchange', function () {
    if ((location.hash || '').indexOf('#/') === 0 || !location.hash) route();
  });
  loadRooms();
  route();
})();

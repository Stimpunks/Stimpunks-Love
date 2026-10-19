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
  nav.appendChild(navHome); nav.appendChild(navLatest); nav.appendChild(navAt); nav.appendChild(navNew);
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
  var takes = { most: 6, fileMax: 5000000, kinds: ['pdf', 'txt', 'md', 'csv', 'rtf', 'docx', 'xlsx', 'pptx', 'odt', 'ods', 'odp', 'epub'] };
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
  function roomByTag(tag) { return rooms ? rooms.filter(function (r) { return r.tag === tag; })[0] || null : null; }
  function catOf(slug) { return cats.filter(function (c) { return c.slug === slug; })[0] || null; }

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

  function tag(text, claimed) { return el('span', 'cb-tag' + (claimed ? ' cb-tag--claimed' : ''), text); }
  function marks(into, base) { into.appendChild(base ? tag('BASE') : tag('CLAIMED', true)); }

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

  function topicRow(x) {
    var li = el('li', 'fm-row');
    var top = el('p', 'fm-row__top');
    var a = el('a', 'fm-row__title', x.title);
    a.href = '#/t/' + x.id;
    top.appendChild(a);
    if (x.pinned) top.appendChild(tag('PINNED', true));
    if (x.closed) top.appendChild(tag('CLOSED', true));
    var n = newness(x);
    if (n) top.appendChild(tag(n.toUpperCase()));
    li.appendChild(top);
    var meta = el('p', 'fm-row__meta');
    var c = catOf(x.cat);
    if (c) {
      var ca = el('a', null, c.name);
      ca.href = '#/c/' + c.slug;
      meta.appendChild(ca);
      meta.appendChild(document.createTextNode(' · '));
    }
    meta.appendChild(document.createTextNode('started by ' + x.handle));
    if (x.last !== x.t || x.lastBy !== x.handle) meta.appendChild(document.createTextNode(' · latest from ' + x.lastBy + ', ' + when(x.last)));
    else meta.appendChild(document.createTextNode(', ' + when(x.t)));
    li.appendChild(meta);
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
    cats.forEach(function (c) { if (groups.indexOf(c.group) < 0) groups.push(c.group); });
    groups.forEach(function (g) {
      d.appendChild(el('p', 'cb-h fm-side__group', g));
      var ul = el('ul', 'fm-side__list');
      cats.filter(function (c) { return c.group === g; }).forEach(function (c) {
        var li = el('li');
        var a = el('a', null, c.name);
        a.href = '#/c/' + c.slug;
        if (c.slug === active) a.setAttribute('aria-current', 'page');
        li.appendChild(a);
        ul.appendChild(li);
      });
      d.appendChild(ul);
    });
    side.appendChild(d);
  }

  /* ── Posts: words, previews, copied messages ─────────────────────────── */

  function blocks(nodes, into) {
    var run = [];
    function flush() { if (run.length) { window.loveMarkdown.blocks(run, into, { top: 3, prefix: 'fm' }); run = []; } }
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
      else if (m.claimed) head.appendChild(tag('CLAIMED', true));
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

  function picOf(t, p, f) {
    var li = el('li', 'fm-pic');
    var said = f.alt || (p.handle + ' posted a picture, with no description.');
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
        if (!blob || !/^image\//.test(blob.type)) { b.replaceWith(quiet('This picture could not be fetched just now: ' + said)); return; }
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
    var pics = (p.files || []).filter(function (f) { return f.kind === 'pic'; });
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
     whether the reader was one of them. */
  function markMentions(into, handles) {
    var list = [];
    handles.forEach(function (h) { if (h && list.every(function (x) { return fold(x) !== fold(h); })) list.push(h); });
    if (!list.length) return false;
    list.sort(function (a, b) { return b.length - a.length; });
    var escd = list.map(function (h) { return h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+'); });
    var re;
    try { re = new RegExp('(^|[^\\p{L}\\p{N}_@])@(' + escd.join('|') + ')(?![\\p{L}\\p{N}_]|:\\d)', 'giu'); } catch (e) { return false; }
    var texts = [];
    var walk = document.createTreeWalker(into, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) { return n.parentNode && n.parentNode.closest('a, code, pre, button') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; },
    });
    while (walk.nextNode()) texts.push(walk.currentNode);
    var mineToo = false;
    texts.forEach(function (n) {
      var text = n.nodeValue, last = 0, m, frag = null;
      re.lastIndex = 0;
      while ((m = re.exec(text))) {
        frag = frag || document.createDocumentFragment();
        var at = m.index + m[1].length;
        frag.appendChild(document.createTextNode(text.slice(last, at)));
        var named = m[2].replace(/\s+/g, ' ');
        var h = list.filter(function (x) { return fold(x) === fold(named); })[0] || named;
        var mine = !!me && fold(h) === fold(me.handle);
        if (mine) mineToo = true;
        var b = el('button', 'fm-at' + (mine ? ' fm-at--me' : ''), '@' + m[2]);
        b.type = 'button';
        b.setAttribute('aria-label', mine ? '@' + h + ', you. Opens your profile.' : '@' + h + '. Opens their profile.');
        (function (who2, btn) {
          btn.addEventListener('click', function () {
            if (window.loveRadioPeek) window.loveRadioPeek(who2, btn, null);
            else say('Open the radio, in the corner, to see ' + who2 + '’s profile.');
          });
        })(h, b);
        frag.appendChild(b);
        last = at + 1 + m[2].length;
      }
      if (frag) { frag.appendChild(document.createTextNode(text.slice(last))); n.parentNode.replaceChild(frag, n); }
    });
    return mineToo;
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

  function postOf(t, p, i) {
    var art = el('article', 'fm-post');
    art.id = 'fm-p-' + p.id;
    art.setAttribute('aria-labelledby', 'fm-p-' + p.id + '-by');
    var head = el('p', 'fm-post__head');
    head.id = 'fm-p-' + p.id + '-by';
    head.appendChild(who(p.handle, p.base));
    marks(head, p.base);
    var link = el('a', 'fm-post__when', when(p.t));
    link.href = '#/t/' + t.id + '/' + p.id;
    link.setAttribute('aria-label', 'Posted ' + when(p.t) + '. Link to this post.');
    head.appendChild(link);
    if (p.edited) head.appendChild(el('span', 'fm-post__edited', 'edited ' + when(p.edited)));
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
    blocks(p.blocks, body);
    if (markMentions(body, (p.at || []).concat(peopleOf(t)))) head.appendChild(tag('MENTIONS YOU', true));
    if (body.children.length) art.appendChild(body);
    if (p.files && p.files.length) art.appendChild(attached(t, p));
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
      o.cats.forEach(function (c) { var op = el('option', null, c.name + (c.staff ? ' (staff)' : '')); op.value = c.slug; catSel.appendChild(op); });
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
    if (o.above) form.appendChild(o.above);
    var tid = 'fm-body-' + key.replace(/[^a-z0-9]/gi, '');
    var bl = el('label', 'cb-lab', o.label || 'Your post'); bl.htmlFor = tid;
    var text = el('textarea', 'cb-say fm-text');
    text.id = tid;
    text.rows = 7;
    text.maxLength = 20000;
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
    var hint = el('p', 'cb-quiet fm-hint', 'Markdown works: **bold**, _italic_, lists, > quotes, `code` and links. A link on a line of its own becomes a preview, which our server makes by reading that page once. Type @ and a name to mention somebody: if they asked to be told, they are.');
    hint.id = tid + '-hint';
    form.appendChild(hint);

    /* Pictures and files: each goes up as soon as it is chosen, a picture
       redrawn first in this browser, and waits for the post. */
    var files = (o.files || []).map(function (f) { return { id: f.id, kind: f.kind, name: f.name, size: f.size, alt: f.alt || '', had: true }; });
    var pending = 0;
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
    picker.addEventListener('change', function () {
      var list = Array.prototype.slice.call(picker.files || []);
      picker.value = '';
      refused = []; notKind = [];
      list.forEach(upload);
      if (notKind.length) {
        refused.unshift(notKind.join(' and ') + (notKind.length > 1 ? ' are not kinds' : ' is not a kind') + ' of file the forums take. They take pictures, and ' +
          takes.kinds.map(function (k) { return '.' + k; }).join(', ') + ' files.');
      }
      attWhy.textContent = refused.join(' ');
    });
    var attList = el('ul', 'fm-att');
    // What could not go, kept on its own line so the next file's "ready" does not hide it.
    var attWhy = el('p', 'fm-answer');
    attWhy.setAttribute('role', 'status');
    var refused = [], notKind = [];
    var attNote = el('p', 'cb-quiet fm-hint', 'Pictures are redrawn in your browser before they go, which takes off what a camera wrote into them, where it was taken included. A file goes exactly as it is, with anything written inside it, such as an author’s name. Files can be ' +
      takes.kinds.map(function (k) { return '.' + k; }).join(', ') + ', up to ' + sizeWords(takes.fileMax) + ' each. Ask anybody recognisable in a picture before you post it. They are not kept with a draft.');
    attach.appendChild(addBtn);
    attach.appendChild(picker);
    attach.appendChild(attList);
    attach.appendChild(attWhy);
    attach.appendChild(attNote);
    form.appendChild(attach);

    function drawFiles() {
      attList.textContent = '';
      files.forEach(function (f, i) {
        var li = el('li', 'fm-att__item');
        if (f.kind === 'pic') {
          if (f.local) { var im = el('img', 'fm-att__thumb'); im.alt = ''; im.src = f.local; li.appendChild(im); }
          var line = el('p', 'fm-att__line', f.had ? 'A picture already on this post.' : 'A picture, ready.');
          li.appendChild(line);
          var al = el('label', 'cb-lab', 'Say what is in it, if you like');
          var ai = el('input', 'cb-say fm-field');
          ai.id = tid + '-alt-' + i;
          al.htmlFor = ai.id;
          ai.maxLength = 600;
          ai.value = f.alt || '';
          ai.addEventListener('input', function () { f.alt = ai.value; });
          li.appendChild(al);
          li.appendChild(ai);
        } else {
          li.appendChild(el('p', 'fm-att__line', f.name + ', ' + sizeWords(f.size) + (f.had ? ', already on this post.' : ', ready.')));
        }
        var drop = el('button', 'cb-btn fm-small', f.kind === 'pic' ? 'Take the picture off' : 'Take ' + f.name + ' off');
        drop.type = 'button';
        drop.addEventListener('click', function () {
          files.splice(files.indexOf(f), 1);
          if (f.local) URL.revokeObjectURL(f.local);
          drawFiles();
          addBtn.focus();
          answer.textContent = 'Taken off.';
        });
        li.appendChild(drop);
        attList.appendChild(li);
      });
    }
    drawFiles();

    function upload(file) {
      if (files.length + pending >= takes.most) { refused.push(file.name + ' did not go: a post holds ' + takes.most + ' pictures and files at most.'); return; }
      var ext = (String(file.name || '').split('.').pop() || '').toLowerCase();
      var isPic = /^image\//.test(file.type || '') && !/svg/.test(file.type);
      if (!isPic && takes.kinds.indexOf(ext) < 0) {
        notKind.push(file.name);
        return;
      }
      if (!isPic && file.size > takes.fileMax) { refused.push(file.name + ' is ' + sizeWords(file.size) + '. A file is ' + sizeWords(takes.fileMax) + ' at most.'); return; }
      if (isPic && !window.loveRedraw) { refused.push(file.name + ' did not go: the radio, which redraws pictures, has not finished loading. Try again in a moment.'); return; }
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
            drawFiles();
            answer.textContent = isPic ? 'The picture is ready. Say what is in it below, if you like.' : file.name + ' is ready.';
          });
        });
      }).catch(function (e) {
        answer.textContent = '';
        attWhy.textContent = (attWhy.textContent ? attWhy.textContent + ' ' : '') + file.name + ': ' + ((e && e.message && e.message !== 'big') ? e.message : (isPic ? 'it could not be read or made small enough here. Try a screenshot of it, or another picture.' : 'it could not be sent just now.'));
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
    text.addEventListener('blur', function () { setTimeout(shut, 150); });
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

    var timer = null;
    function saveDraft() {
      clearTimeout(timer);
      timer = setTimeout(function () {
        var m = mine();
        if (!text.value.trim() && !(title && title.value.trim())) { if (m.draft && m.draft.key === key) { delete m.draft; keepMine(m); } return; }
        m.draft = { key: key, body: text.value, title: title ? title.value : null, cat: catSel ? catSel.value : null };
        keepMine(m);
      }, 400);
    }
    function clearDraft() { clearTimeout(timer); var m = mine(); if (m.draft && m.draft.key === key) { delete m.draft; keepMine(m); } }
    text.addEventListener('input', saveDraft);
    if (title) title.addEventListener('input', saveDraft);

    look.addEventListener('click', function () {
      if (!shown.hidden) { shown.hidden = true; look.setAttribute('aria-pressed', 'false'); look.textContent = 'Preview'; return; }
      if (!text.value.trim()) { answer.textContent = 'There is nothing to preview yet.'; return; }
      answer.textContent = 'Setting it…';
      call(null, { action: 'preview', body: text.value }).then(function (r) {
        if (r.status !== 200) { answer.textContent = why(r, 'The preview could not be made just now.'); return; }
        shown.textContent = '';
        blocks(r.body.blocks, shown);
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
        files: files.map(function (f) { return f.kind === 'pic' && f.alt && f.alt.trim() ? { id: f.id, alt: f.alt.trim() } : { id: f.id }; }) };
      o.send(v).then(function (msg) {
        go.disabled = false;
        if (msg) { answer.textContent = msg; return; }
        clearDraft();
        files.forEach(function (f) { if (f.local) URL.revokeObjectURL(f.local); });
      });
    });
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
      key: 'edit:' + p.id, body: p.body, title: first ? t.title : undefined, label: 'Your post', go: 'Save', sending: 'Saving…',
      files: p.files || [], people: peopleOf(t),
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
        location.hash = current ? '#/c/' + current.cat.slug : '#/';
        return;
      }
      drawTopic(r.body, null, true);
      // The button pressed was redrawn with its post, so the keyboard goes back
      // to that post, or to the topic, where it was, without moving the page.
      var back = (send.p && root.getElementById('fm-p-' + send.p)) || view.querySelector('h2');
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
    view.textContent = '';
    side.textContent = '';
    var h = heading(2, 'Sign on to read the forums');
    view.appendChild(h);
    view.appendChild(el('p', null, 'The forums are for claimed usernames on the CB. Sign on to the CB with the bar in the corner of your screen, then press Profile on the radio and claim your username with a password of your own.'));
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

  function took(r, here) {
    if (r.body.cats) cats = r.body.cats;
    if (r.body.me) me = r.body.me;
    if (r.body.takes) takes = r.body.takes;
    navNew.hidden = !cats.some(function (c) { return c.start; });
    // New topic starts in the category you are in, where you can start one.
    var c = here && catOf(here);
    navNew.href = c && c.start ? '#/new?c=' + encodeURIComponent(c.slug) : '#/new';
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
          card.appendChild(ch);
          card.appendChild(el('p', 'fm-cat__about', c.about));
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

  function more(into, q, before) {
    var b = el('button', 'cb-btn', 'Older topics'); b.type = 'button';
    b.addEventListener('click', function () {
      b.disabled = true;
      call(q + '&before=' + before).then(function (r) {
        b.remove();
        if (r.status !== 200) { say(why(r, 'Older topics could not be read just now.')); return; }
        var ul = into.querySelector('.fm-rows') || into.appendChild(el('ul', 'fm-rows'));
        var first = null;
        r.body.topics.filter(function (x) { return !x.pinned; }).forEach(function (x) { var li = topicRow(x); first = first || li; ul.appendChild(li); });
        if (first) first.querySelector('a').focus();
        if (r.body.more && r.body.topics.length) more(into, q, r.body.topics[r.body.topics.length - 1].last);
      });
    });
    into.appendChild(b);
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
      if (r.body.more && r.body.topics.length) more(view, 'view=latest', r.body.topics[r.body.topics.length - 1].last);
      return h;
    });
  }

  function category(slug) {
    blank(null, 'Looking…');
    return call('view=cat&c=' + encodeURIComponent(slug)).then(function (r) {
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
      if (c.staff) view.appendChild(el('p', null, '')).appendChild(tag('STAFF', true));
      view.appendChild(el('p', 'fm-lede', c.about));
      view.appendChild(quiet(keepWords(c.keep)));
      if (c.start) {
        var p = el('p');
        var a = el('a', 'cb-btn fm-start', 'Start a topic in ' + c.name);
        a.href = '#/new?c=' + encodeURIComponent(c.slug);
        p.appendChild(a);
        view.appendChild(p);
      } else view.appendChild(quiet('Only moderators start topics here. Anybody can reply to them.'));
      view.appendChild(topicList(r.body.topics, 'Nothing here yet.'));
      if (r.body.more) {
        var rest = r.body.topics.filter(function (x) { return !x.pinned; });
        if (rest.length) more(view, 'view=cat&c=' + encodeURIComponent(c.slug), rest[rest.length - 1].last);
      }
      return h;
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
    var meta = el('p', 'fm-topic__meta');
    var ca = el('a', null, t.cat.name);
    ca.href = '#/c/' + t.cat.slug;
    meta.appendChild(ca);
    meta.appendChild(document.createTextNode(' · started by ' + t.handle + ', ' + when(t.t)));
    if (t.pinned) meta.appendChild(tag('PINNED', true));
    if (t.closed) meta.appendChild(tag('CLOSED', true));
    view.appendChild(meta);
    view.appendChild(quiet(goesWords(t)));
    if (t.mod || t.takeDown) view.appendChild(topicTools(t));
    t.posts.forEach(function (p, i) { view.appendChild(postOf(t, p, i)); });
    if (!t.posts.length) view.appendChild(quiet('Every post in this topic has been taken down.'));
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
      cats.forEach(function (c) { if (c.slug !== t.cat.slug) { var o = el('option', null, c.name); o.value = c.slug; ms.appendChild(o); } });
      var mv = el('button', 'cb-btn fm-small', 'Move'); mv.type = 'button';
      mv.addEventListener('click', function () { act({ action: 'moderate', t: t.id, move: ms.value }, 'Moved.'); });
      if (ms.children.length) { box2.appendChild(ml); box2.appendChild(ms); box2.appendChild(mv); }
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
    var asks = [call('view=home'), loadRooms()];
    if (from) asks.push(call('view=cb&room=' + encodeURIComponent(from.room || '') + '&ids=' + encodeURIComponent(from.ids.join(','))));
    return Promise.all(asks).then(function (rs) {
      var r = rs[0];
      if (r.status !== 200) return refused(r);
      took(r);
      drawSide(q.c || null);
      view.textContent = '';
      var h = heading(2, from ? 'A new topic, from the CB' : 'A new topic');
      view.appendChild(h);
      var startable = cats.filter(function (c) { return c.start; });
      if (!startable.length) { view.appendChild(quiet('There is no category you can start a topic in.')); return h; }
      var above = null;
      if (from) {
        var x = rs[2];
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
        key: 'new:' + (q.from || '') + ':' + (q.ids || ''), cats: startable, cat: q.c, title: '', above: above,
        people: from && rs[2].status === 200 ? rs[2].body.cb.messages.map(function (m) { return m.handle; }) : [],
        label: from ? 'Anything you want to add (you can leave this empty)' : 'Your post', go: 'Start the topic', sending: 'Starting it…',
        send: function (v) {
          var b = { action: 'start', cat: v.cat, title: v.title, body: v.body, files: v.files, at: v.at };
          if (from) b.from = from;
          return call(null, b).then(function (r2) {
            if (r2.status !== 200) return why(r2, 'That did not post. Nothing was changed.');
            location.hash = '#/t/' + r2.body.topic.id;
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

  var first = true;
  function route() {
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
    else if (parts[0] === 'c' && parts[1]) done = category(parts[1]);
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
    Promise.resolve(done).then(function (h) {
      // On arriving, the page's own heading keeps the keyboard; after that,
      // every move in the forums puts it on what moved.
      if (h && !first) h.focus();
      first = false;
    });
  }
  window.addEventListener('hashchange', function () {
    if ((location.hash || '').indexOf('#/') === 0 || !location.hash) route();
  });
  loadRooms();
  route();
})();

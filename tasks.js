/* =============================================================================
   Tasks, the team's to-do list, moved here from EspoCRM. Ryan's brief,
   2026-10-20. See netlify/cb/lib.mjs, tasks, and privacy.html#tasks for what
   they keep.

   THE CB'S, DRESSED AS THE CB, as the forums are: a shadow root with cb.css
   and tasks.css the only sheets that reach it, wearing whichever of the
   radio's themes the reader has on. tasks.css names no colour of its own.

   ONLY DIRECTORS AND ADMINISTRATORS READ THEM, and this file only asks: the
   server refuses everybody else. It reads love-cb for the pass and keeps
   nothing in the browser: a list's filters and order live in the address,
   so a bookmark or a link to another director keeps them.

   A DESCRIPTION ARRIVES AS NODES, NOT HTML, and markdown.js builds it.

   NUMBERS ARE FINE HERE (Ryan's call, the same day): the list says how many
   tasks match, and how many have each status, priority, person and tag.
   tools/make-tasks.py holds all of this.
   ============================================================================= */
(function () {
  'use strict';

  var mount = document.querySelector('[data-tasks]');
  if (!mount) return;

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
  function fold(h) { return String(h || '').normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim(); }

  /* ── The box ───────────────────────────────────────────────────────────── */

  var host = el('div', 'tk-mount');
  var root = host.attachShadow({ mode: 'open' });
  var waiting = 2;
  host.style.visibility = 'hidden';
  ['/cb.css', '/tasks.css'].forEach(function (href) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    function ready() { if (--waiting === 0) { host.style.visibility = ''; toneNow(); } }
    l.addEventListener('load', ready);
    l.addEventListener('error', ready);
    root.appendChild(l);
  });
  var box = el('div', 'tk');
  root.appendChild(box);

  var bar = el('div', 'cb-bar tk-bar');
  var brand = el('p', 'tk-name');
  brand.appendChild(el('span', 'cb-brand', 'CB'));
  brand.appendChild(document.createTextNode(' Tasks'));
  bar.appendChild(brand);
  var nav = el('nav', 'tk-nav');
  nav.setAttribute('aria-label', 'Tasks');
  var navList = el('a', 'cb-btn tk-navlink', 'List'); navList.href = '#/';
  var navBoard = el('a', 'cb-btn tk-navlink', 'Board'); navBoard.href = '#/board';
  var navTime = el('a', 'cb-btn tk-navlink', 'Timeline'); navTime.href = '#/timeline';
  var navFeed = el('a', 'cb-btn tk-navlink', 'Feed'); navFeed.href = '#/feed';
  var navRecur = el('a', 'cb-btn tk-navlink', 'Recurring'); navRecur.href = '#/recurring';
  var navTpl = el('a', 'cb-btn tk-navlink', 'Templates'); navTpl.href = '#/templates';
  var navNew = el('a', 'cb-btn tk-navlink', 'New task'); navNew.href = '#/new';
  // Notifications, with how many are unread beside it (numbers are fine in tasks).
  var navInbox = el('a', 'cb-btn tk-navlink', 'Notifications'); navInbox.href = '#/inbox';
  var inboxCount = el('span', 'tk-n tk-unread');
  inboxCount.hidden = true;
  navInbox.appendChild(inboxCount);
  // The office, Tasks' other half for the same people (Ryan's ask, 2026-10-21),
  // set a little apart, because it is another page; the office's bar has Tasks
  // and the forums' has both.
  var navOffice = el('a', 'cb-btn tk-navlink tk-navlink--other', 'Office'); navOffice.href = '/office.html#/dashboard';
  // And the forums, where the team's documents and the rest of the conversation are.
  var navForums = el('a', 'cb-btn tk-navlink', 'Forums'); navForums.href = '/forum.html#/';
  nav.appendChild(navList); nav.appendChild(navBoard); nav.appendChild(navTime); nav.appendChild(navFeed); nav.appendChild(navRecur); nav.appendChild(navTpl); nav.appendChild(navNew); nav.appendChild(navInbox); nav.appendChild(navOffice); nav.appendChild(navForums);
  function setUnread(n) {
    inboxCount.textContent = n ? ' ' + n : '';
    inboxCount.hidden = !n;
    navInbox.setAttribute('aria-label', n ? 'Notifications, ' + n + ' unread' : 'Notifications');
  }
  bar.appendChild(nav);
  box.appendChild(bar);

  // Back one step, or a view's own way up: steps.js fills it.
  var backRow = el('p', 'tk-back');
  backRow.hidden = true;
  box.appendChild(backRow);
  var view = el('div', 'tk-view');
  // A task's preview beside its name in the list, on hover or focus (preview.js).
  var peek = window.lovePreview({ p: 'tk', box: box });
  box.appendChild(view);
  var said = el('p', 'tk-said');
  said.setAttribute('role', 'status');
  box.appendChild(said);
  function say(t) { said.textContent = ''; setTimeout(function () { said.textContent = t || ''; }, 30); }

  mount.textContent = '';
  mount.appendChild(host);

  /* GOING BACK ONE STEP, at the height you left the view, is steps.js's. What
     the link back says about each view is here: a task or a recurring task by
     its name, which stays in this page's memory and nowhere else. */
  function placeOf(hash, title) {
    var p = String(hash || '').slice(1).split('?')[0].split('/').filter(Boolean);
    if (!p.length) return 'the list';
    if (p[0] === 'board') return 'the board';
    if (p[0] === 'timeline') return 'the timeline';
    if (p[0] === 'inbox') return 'Notifications';
    if (p[0] === 'new') return 'the new task';
    if (p[0] === 'edit') return 'changing the task';
    if (p[0] === 'recurring') {
      if (!p[1]) return 'the recurring tasks';
      if (p[1] === 'new') return 'the new recurring task';
      if (p[1] === 'edit') return 'changing the recurring task';
      return title ? '“' + title + '”' : 'the recurring task';
    }
    if (p[0] === 'templates') {
      if (!p[1]) return 'the templates';
      if (p[1] === 'new') return 'the new template';
      if (p[1] === 'edit') return 'changing the template';
      return title ? '“' + title + '”' : 'the template';
    }
    return title ? '“' + title + '”' : 'the task';
  }
  var step = window.loveSteps({
    root: root, view: view, slot: backRow, place: placeOf,
    title: function () { var h = view.querySelector('h2'); return h ? h.textContent : null; },
    route: function () { route(); },
  });

  /* Wearing the radio's theme, as the forums do: what its host wears, or
     call.js's own answer for what the radio would wear. */
  function dressNow() {
    var lc = window.loveCall, r = document.querySelector('.cb-host'), look;
    if (r && r.getAttribute('data-scheme')) look = r.getAttribute('data-scheme');
    else if (lc && lc.schemeFor) { var s = cbState(); look = lc.schemeFor((s && s.scheme) || 'auto'); }
    if (look) host.setAttribute('data-scheme', look);
    host.setAttribute('data-motion', 'off');
    toneNow();
  }
  /* Light or dark, measured off the case the reader's theme draws, so a tag's
     colour takes the step made for that kind of ground (tasks.css). */
  function toneNow() {
    var m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(getComputedStyle(box).backgroundColor || '');
    if (!m) return;
    var l = [m[1], m[2], m[3]].map(function (v) { v = v / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    host.setAttribute('data-tone', 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2] > 0.18 ? 'light' : 'dark');
  }
  try {
    var watched = null, onHost = new MutationObserver(dressNow);
    new MutationObserver(function () {
      var r = document.querySelector('.cb-host');
      if (r && r !== watched) { watched = r; onHost.observe(r, { attributes: true, attributeFilter: ['data-scheme'] }); dressNow(); }
    }).observe(document.body, { childList: true });
  } catch (e) { /* tasks keep the colours they opened in */ }
  ['(prefers-contrast: more)', '(prefers-color-scheme: light)'].forEach(function (q) {
    try { window.matchMedia(q).addEventListener('change', dressNow); } catch (e) { /* an old browser */ }
  });

  /* ── Talking to /cb/tasks ──────────────────────────────────────────────── */

  function call(q, send) {
    var s = cbState();
    var headers = { accept: 'application/json', authorization: 'Bearer ' + (s ? s.pass : '') };
    if (send) headers['content-type'] = 'application/json';
    return fetch('/cb/tasks' + (q ? '?' + q : ''), {
      method: send ? 'POST' : 'GET', headers: headers, body: send ? JSON.stringify(send) : undefined,
      credentials: 'omit', cache: 'no-store',
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (b) { return { status: r.status, body: b || {} }; });
    }, function () { return { status: 0, body: {} }; });
  }
  function why(r, otherwise) {
    if (r.body && typeof r.body.error === 'string' && r.body.error) return r.body.error;
    if (r.status === 404 || r.status === 405) return 'Tasks only answer on stimpunks.world itself.';
    if (r.status === 0) return 'No signal. Tasks could not be reached just now.';
    return otherwise;
  }

  var settings = null, people = [], me = null, tasks = [], views = [], recurs = [], templates = [];
  function took(b) {
    if (typeof b.unread === 'number') setUnread(b.unread);
    if (b.settings) settings = b.settings;
    if (b.people) people = b.people;
    if (b.me) me = b.me;
    if (b.templates) templates = b.templates;
  }

  /* ── Words for days ────────────────────────────────────────────────────── */

  function today() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function plus(day0, n) { var p = day0.split('-'); var d = new Date(+p[0], +p[1] - 1, +p[2] + n); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function dayWords(v) {
    if (!v) return '';
    var p = v.split('-'), d = new Date(+p[0], +p[1] - 1, +p[2]), now = new Date();
    var o = { weekday: 'short', day: 'numeric', month: 'short' };
    if (d.getFullYear() !== now.getFullYear()) o.year = 'numeric';
    try { return d.toLocaleDateString(undefined, o); } catch (e) { return v; }
  }
  function when(t) {
    try { return new Date(t).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }); }
    catch (e) { return ''; }
  }
  function isDone(t) { return settings && settings.done.indexOf(t.status) >= 0; }
  function overdue(t) { return t.due && !isDone(t) && t.due < today(); }

  /* ── Tag colours ───────────────────────────────────────────────────────── */

  /* Each tag's colour is data/tasks.json's, by what the tag is about; a tag
     with none (Weekly, Monthly) wears none. A colour always comes with the
     tag's name in words, never alone. */
  function colourOf(tag) { return (settings && settings.tagColours && settings.tagColours[tag]) || null; }
  function coloursOf(t) {
    var out = [];
    (t.tags || []).forEach(function (x) { var c = colourOf(x); if (c && out.indexOf(c) < 0) out.push(c); });
    return out;
  }
  function tagDot(tag) {
    var d = el('span', 'tk-dot' + (colourOf(tag) ? ' tk-c--' + colourOf(tag) : ' tk-dot--none'));
    d.setAttribute('aria-hidden', 'true');
    return d;
  }
  /* A STATUS IS A PILL, after Notion's (Ryan's ask, 2026-10-21): data/tasks.json
     says which colour each wears, and Started is Notion's light blue for In
     progress, which Norah and Chelsea key off. The name is always on it. */
  function statusColour(s) { return (settings && settings.statusColours && settings.statusColours[s]) || 'gray'; }
  function statusPill(s) { return el('span', 'tk-status tk-s--' + statusColour(s), s); }
  function statusDot(s) {
    var d = el('span', 'tk-dot tk-dot--status tk-s--' + statusColour(s));
    d.setAttribute('aria-hidden', 'true');
    return d;
  }
  function tagWords(tags, cls) {
    var w = el('span', cls || null);
    tags.forEach(function (x, i) {
      var one = el('span', 'tk-tagname');
      one.appendChild(tagDot(x));
      one.appendChild(document.createTextNode(x));
      w.appendChild(one);
      if (i < tags.length - 1) w.appendChild(document.createTextNode(', '));
    });
    return w;
  }

  /* ── Pieces ────────────────────────────────────────────────────────────── */

  // A task's address, or one of its comments': #/t/<task>/c/<comment>, which opens the task on the comment.
  function taskHref(id, c) { return '#/' + ['t', id].concat(c ? ['c', c] : []).join('/'); }
  // An office comment's address in the office, which opens the record on it.
  function officeHref(it) {
    var at = { contact: 'c', grant: 'g', 'case': 'k', mailing: 'mailings', template: 'templates', email: 'm' }[it.what] || 'c';
    // An email's comments go by email- and its Gmail id, and its page by the Gmail id alone.
    var rec = it.what === 'email' ? String(it.rec || '').replace(/^email-/, '') : it.rec;
    return 'office.html#/' + [at, rec, 'c', it.comment].join('/');
  }
  function heading(level, text) { var h = el('h' + level, null, text); h.tabIndex = -1; return h; }
  function quiet(text) { return el('p', 'cb-quiet', text); }
  function tag(text, cls) { return el('span', 'cb-tag tk-tag' + (cls ? ' ' + cls : ''), text); }
  function sure(into, text, yesText, yes, back) {
    var b = el('div', 'tk-sure');
    b.appendChild(el('p', null, text));
    var y = el('button', 'cb-btn tk-small', yesText); y.type = 'button';
    var n = el('button', 'cb-btn tk-small', 'Leave it'); n.type = 'button';
    b.appendChild(y); b.appendChild(n);
    into.appendChild(b);
    if (back) back.hidden = true;
    n.focus();
    n.addEventListener('click', function () { b.remove(); if (back) { back.hidden = false; back.focus(); } });
    y.addEventListener('click', function () { y.disabled = true; yes(function () { y.disabled = false; }); });
  }

  /* ── The list and the board: filters and order, kept in the address ──── */

  // WHOSE (Ryan's ask, 2026-10-21) is Assigned to and Also on it together, to sort on.
  var COLUMNS = [['name', 'Task'], ['status', 'Status'], ['priority', 'Priority'], ['who', 'Assigned to'], ['with', 'Also on it'], ['whose', 'Whose'], ['start', 'Starts'], ['due', 'Due'], ['tags', 'Tags']];
  var DUES = [['', 'Any time'], ['overdue', 'Overdue'], ['today', 'Due today'], ['week', 'Due in the next 7 days'], ['month', 'Due this month'], ['none', 'No due date']];
  // What a board's columns can be, and the field a move between them changes.
  var GROUPS = [['status', 'Status'], ['priority', 'Priority'], ['who', 'Assigned to']];
  /* WHAT THE LIST CAN BE GROUPED BY (Ryan's ask, 2026-10-21, after Notion's By
     assignee view). Whose and Tags put a task under each person on it, or each
     of its tags, so it can be in more than one group; the others, once. */
  var LIST_GROUPS = [['', 'Nothing'], ['whose', 'Whose'], ['who', 'Assigned to'], ['status', 'Status'], ['priority', 'Priority'], ['tags', 'Tags']];

  /* An address's filters, from the part after its ?: this page's, or a saved
     filter's. */
  function readQuery(hash) {
    var q = {};
    (String(hash == null ? location.hash : hash).split('?')[1] || '').split('&').forEach(function (kv) {
      if (!kv) return;
      var i = kv.indexOf('=');
      try { q[decodeURIComponent(i < 0 ? kv : kv.slice(0, i))] = i < 0 ? '' : decodeURIComponent(kv.slice(i + 1).replace(/\+/g, ' ')); } catch (e) { /* a broken address */ }
    });
    var list = function (k) { return q[k] != null ? q[k].split(',').filter(Boolean) : null; };
    var cols = q.cols === 'priority' || q.cols === 'who' ? q.cols : 'status';
    var span = SPANS.some(function (x) { return String(x[0]) === q.span; }) ? +q.span : 14;
    return {
      q: q.q || '', status: list('status'), priority: list('priority'), tags: list('tags'),
      who: q.who || '', due: q.due || '', sort: q.sort || 'due', dir: q.dir === 'desc' ? 'desc' : 'asc', cols: cols,
      group: LIST_GROUPS.some(function (x) { return x[0] && x[0] === q.group; }) ? q.group : '',
      from: /^\d{4}-\d{2}-\d{2}$/.test(q.from || '') ? q.from : null, span: span,
    };
  }
  function addressOf(f, mode) {
    var parts = [];
    if (f.q) parts.push('q=' + encodeURIComponent(f.q));
    if (f.status) parts.push('status=' + f.status.map(encodeURIComponent).join(','));
    if (f.priority) parts.push('priority=' + f.priority.map(encodeURIComponent).join(','));
    if (f.tags) parts.push('tags=' + f.tags.map(encodeURIComponent).join(','));
    if (f.who) parts.push('who=' + encodeURIComponent(f.who));
    if (f.due) parts.push('due=' + f.due);
    if (f.sort !== 'due' || f.dir !== 'asc') parts.push('sort=' + f.sort + '&dir=' + f.dir);
    if (mode === 'board' && f.cols !== 'status') parts.push('cols=' + f.cols);
    if (mode === 'list' && f.group) parts.push('group=' + f.group);
    if (mode === 'timeline' && f.span !== 14) parts.push('span=' + f.span);
    // A timeline on this week keeps no day, so a saved one is always this week.
    if (mode === 'timeline' && f.from && mondayOf(f.from) !== mondayOf(today())) parts.push('from=' + mondayOf(f.from));
    return homeOf(mode) + (parts.length ? '?' + parts.join('&') : '');
  }
  function homeOf(mode) { return mode === 'board' ? '#/board' : mode === 'timeline' ? '#/timeline' : mode === 'feed' ? '#/feed' : '#/'; }
  function writeQuery(f, mode) {
    var h = addressOf(f, mode);
    if (location.hash !== h) step.replace(h);
  }
  function modeOf(hash) { var m = /^#\/(board|timeline|feed)(\?|$)/.exec(hash || ''); return m ? m[1] : 'list'; }
  /* Until somebody picks statuses, the list shows the ones still to do, and a
     board by status and the feed show every status but the ones the board
     hides (Canceled), so the feed shows what was finished as well. */
  function statusesOf(f, mode) {
    if (f.status) return f.status;
    if ((mode === 'board' && f.cols === 'status') || mode === 'feed') return settings.statuses.filter(function (s) { return (settings.boardHides || []).indexOf(s) < 0; });
    return settings.statuses.filter(function (s) { return settings.done.indexOf(s) < 0; });
  }

  /* Whether a task passes every filter, leaving out `skip`, so each filter's
     own counts say what picking that value would show. */
  function passes(t, f, skip, mode) {
    if (skip !== 'q' && f.q) { var w = fold(f.q); if (fold(t.name).indexOf(w) < 0) return false; }
    if (skip !== 'status' && statusesOf(f, mode).indexOf(t.status) < 0) return false;
    if (skip !== 'priority' && f.priority && f.priority.indexOf(t.priority) < 0) return false;
    if (skip !== 'tags' && f.tags && !t.tags.some(function (x) { return f.tags.indexOf(x) >= 0; })) return false;
    if (skip !== 'who') {
      // Whose: a task is somebody's when it is assigned to them or they are also on it. Mine until another is picked.
      var whose = whoOf(f);
      if (whose === '-') { if (t.who) return false; }
      else if (whose !== 'all' && !owns(t, whose === '@me' ? (me ? me.handle : '') : whose)) return false;
    }
    if (skip !== 'due' && f.due) {
      var d = t.due, now = today();
      if (f.due === 'none' && d) return false;
      if (f.due !== 'none' && !d) return false;
      if (f.due === 'overdue' && !overdue(t)) return false;
      if (f.due === 'today' && d !== now) return false;
      if (f.due === 'week' && (d < now || d > plus(now, 7))) return false;
      if (f.due === 'month' && d.slice(0, 7) !== now.slice(0, 7)) return false;
    }
    return true;
  }
  /* Whose tasks: '' or '@me' is mine, 'all' everybody's, '-' assigned to
     nobody, and a handle that person's. A task is somebody's when it is
     assigned to them or they are also on it, as the team counts it. */
  function whoOf(f) { return !f.who || f.who === '@me' ? '@me' : f.who; }
  // Who else is on a task, beside whoever it is assigned to.
  function alsoOn(t) { return (t.with || []).filter(function (x) { return fold(x) !== fold(t.who); }); }
  /* Everybody whose a task is, the one it is assigned to and everybody also on
     it, in alphabetical order: the Whose column, and what it sorts by, so a
     task's place in the sort is what its cell says. */
  function whoseOf(t) {
    var all = (t.who ? [t.who] : []).concat(alsoOn(t));
    return all.filter(function (x, i) { return all.map(fold).indexOf(fold(x)) === i; })
      .sort(function (a, b) { return fold(a) < fold(b) ? -1 : fold(a) > fold(b) ? 1 : 0; });
  }
  function owns(t, h) { return !!h && (fold(t.who) === fold(h) || (t.with || []).some(function (x) { return fold(x) === fold(h); })); }
  function counted(f, skip, key, mode) {
    var n = {};
    tasks.forEach(function (t) {
      if (!passes(t, f, skip, mode)) return;
      var v = key(t);
      (Array.isArray(v) ? v : [v]).forEach(function (x) { n[x] = (n[x] || 0) + 1; });
    });
    return n;
  }
  function ordered(list, f) {
    var rank = { status: settings.statuses, priority: settings.priorities };
    var by = function (t) {
      var v = t[f.sort];
      if (rank[f.sort]) return rank[f.sort].indexOf(v);
      if (f.sort === 'tags' || f.sort === 'with') return (v || []).join(', ').toLowerCase() || null;
      if (f.sort === 'whose') return whoseOf(t).join(', ').toLowerCase() || null;
      return v == null ? null : String(v).toLowerCase();
    };
    var s = f.dir === 'desc' ? -1 : 1;
    return list.slice().sort(function (a, b) {
      var x = by(a), y = by(b);
      // Nothing set sorts last, whichever way round.
      if (x == null || x === '') return y == null || y === '' ? a.name.localeCompare(b.name) : 1;
      if (y == null || y === '') return -1;
      if (x < y) return -s;
      if (x > y) return s;
      return a.name.localeCompare(b.name);
    });
  }
  // How many tasks a saved filter would show now, worked out here: on a timeline, those on its days.
  function howMany(address) {
    var g = readQuery(address), m = modeOf(address), a = mondayOf(g.from || today()), b = plus(a, g.span - 1);
    return tasks.filter(function (t) { return passes(t, g, null, m) && (m !== 'timeline' || onDays(t, a, b)); }).length;
  }

  /* THE TIMELINE'S DAYS: weeks start on Monday, as the recurring tasks' weeks
     do; a task's days run from its start to its due day, and a task with only
     one of them is on that one day. */
  var SPANS = [[7, 'A week'], [14, '2 weeks'], [28, '4 weeks']];
  function mondayOf(d) { var p = d.split('-'), x = new Date(+p[0], +p[1] - 1, +p[2]); return plus(d, -((x.getDay() + 6) % 7)); }
  function daysBetween(a, b) { var p = a.split('-'), q = b.split('-'); return Math.round((Date.UTC(+q[0], +q[1] - 1, +q[2]) - Date.UTC(+p[0], +p[1] - 1, +p[2])) / 86400000); }
  function spanOf(t) { var s = t.start || t.due, e = t.due || t.start; if (!s) return null; return s <= e ? [s, e] : [e, s]; }
  function onDays(t, a, b) { var d = spanOf(t); return !!d && d[0] <= b && d[1] >= a; }

  function tasksView(mode) {
    view.textContent = '';
    view.appendChild(quiet('Looking…'));
    return call('view=list').then(function (r) {
      if (r.status !== 200) return refused(r);
      took(r.body);
      tasks = r.body.tasks || [];
      views = r.body.views || [];
      recurs = r.body.recurs || [];
      return drawTasks(readQuery(), mode);
    });
  }

  function drawTasks(f, mode) {
    view.textContent = '';
    var h = heading(2, mode === 'board' ? 'Tasks, as a board' : mode === 'timeline' ? 'Tasks, on a timeline' : mode === 'feed' ? 'Tasks, as a feed' : 'Tasks');
    view.appendChild(h);
    var saved = el('div', 'tk-saved');
    var filters = el('form', 'tk-filters');
    filters.setAttribute('aria-label', 'Filter the tasks');
    filters.addEventListener('submit', function (e) { e.preventDefault(); });
    var shown = el('p', 'tk-shown');
    shown.setAttribute('aria-live', 'polite');
    var out = el('div', mode === 'board' ? 'tk-boardbox' : mode === 'timeline' ? 'tk-tlbox' : mode === 'feed' ? 'tk-feedbox' : 'tk-tablebox');
    // It scrolls sideways on a narrow screen, so a keyboard can reach it. The feed never does, so it is no stop of its own.
    if (mode !== 'feed') out.tabIndex = 0;
    out.setAttribute('role', 'region');
    out.setAttribute('aria-label', mode === 'board' ? 'The board' : mode === 'timeline' ? 'The timeline' : mode === 'feed' ? 'The feed' : 'The tasks');
    view.appendChild(saved);
    view.appendChild(filters);
    // The timeline's way along its days, which stays put while the days change.
    var along = null;
    if (mode === 'timeline') {
      along = el('div', 'tk-row tk-along');
      along.setAttribute('aria-label', 'Which days');
      along.setAttribute('role', 'group');
      [['earlier', '← Earlier'], ['now', 'This week'], ['later', 'Later →']].forEach(function (b) {
        var x = el('button', 'cb-btn tk-small', b[1]); x.type = 'button';
        x.addEventListener('click', function () {
          var a = mondayOf(f.from || today());
          f.from = b[0] === 'now' ? null : plus(a, b[0] === 'earlier' ? -f.span : f.span);
          if (f.from && mondayOf(f.from) === mondayOf(today())) f.from = null;
          writeQuery(f, mode);
          drawSaved();
          drawOut();
        });
        along.appendChild(x);
      });
      view.appendChild(along);
      var legend = el('div', 'tk-legend');
      legend.setAttribute('role', 'group');
      legend.setAttribute('aria-label', 'What the colours are');
      view.appendChild(legend);
    }
    view.appendChild(shown);
    view.appendChild(out);

    // The words box and the tags' fold, held rather than looked up: they live
    // in this view's own box, which no page's ids reach.
    var qBox = null, tagFoldEl = null;
    function refresh(focusSort) {
      writeQuery(f, mode);
      drawSaved();
      drawFilters();
      drawOut(focusSort);
    }
    function drawOut(focus) { peek.hide(); if (mode === 'board') drawBoard(focus); else if (mode === 'timeline') drawTimeline(); else if (mode === 'feed') drawFeed(); else drawTable(focus); }

    /* SAVED FILTERS, each yours, kept under your username: what it shows, and
       how many tasks it shows now. */
    var savedOpen = false, savedSel = null;
    function drawSaved() {
      var at = root.activeElement && root.activeElement.id;
      saved.textContent = '';
      var here = addressOf(f, mode);
      var mine = views.filter(function (v) { return v.address === here; })[0] || null;
      var row = el('div', 'tk-savedrow');
      var lab = el('label', 'cb-lab', 'Saved filters'); lab.htmlFor = 'tk-saved';
      var sel = el('select', 'cb-say tk-input'); sel.id = 'tk-saved';
      savedSel = sel;
      var none = el('option', null, views.length ? (mine ? 'None: clear the filters' : 'This view is not saved') : 'None saved yet'); none.value = '';
      sel.appendChild(none);
      views.forEach(function (v) { var o = el('option', null, v.name + ' (' + howMany(v.address) + ')'); o.value = v.id; sel.appendChild(o); });
      sel.value = mine ? mine.id : '';
      sel.addEventListener('change', function () {
        var v = views.filter(function (x) { return x.id === sel.value; })[0];
        location.hash = v ? v.address : homeOf(mode);
      });
      var field = el('div', 'tk-field tk-savedpick');
      field.appendChild(lab); field.appendChild(sel);
      row.appendChild(field);
      var tools = el('div', 'tk-row');
      if (mine) {
        var del = el('button', 'cb-btn tk-small', 'Delete “' + mine.name + '”'); del.type = 'button';
        del.addEventListener('click', function () {
          sure(tools, 'This deletes the saved filter “' + mine.name + '”. The tasks stay as they are.', 'Delete it', function (done) {
            call(null, { action: 'view-remove', id: mine.id }).then(function (r) {
              done();
              if (r.status !== 200) { say(why(r, 'That did not delete. Nothing was changed.')); return; }
              views = r.body.views || [];
              drawSaved();
              if (savedSel) savedSel.focus();
              say('Deleted the saved filter. This view stays as it is until you change it.');
            });
          }, del);
        });
        tools.appendChild(del);
      } else {
        var save = el('button', 'cb-btn tk-small', 'Save this view'); save.type = 'button';
        save.setAttribute('aria-expanded', String(savedOpen));
        save.addEventListener('click', function () { savedOpen = !savedOpen; drawSaved(); var n = saved.querySelector('.tk-savename'); if (n) n.focus(); });
        tools.appendChild(save);
      }
      row.appendChild(tools);
      saved.appendChild(row);
      if (savedOpen && !mine) {
        var form = el('form', 'tk-savedform');
        var nl = el('label', 'cb-lab', 'Name it'); nl.htmlFor = 'tk-savename';
        var name = el('input', 'cb-say tk-input tk-savename'); name.id = 'tk-savename'; name.maxLength = settings.viewNameMax || 60;
        var replace = views.length ? select(views, '') : null;
        var go = el('button', 'cb-btn tk-small', 'Save'); go.type = 'submit';
        form.appendChild(nl); form.appendChild(name);
        if (replace) {
          var rl = el('label', 'cb-lab', 'Or put it in place of'); rl.htmlFor = 'tk-replace'; replace.id = 'tk-replace';
          form.appendChild(rl); form.appendChild(replace);
        }
        form.appendChild(go);
        var said2 = el('p', 'tk-answer'); said2.setAttribute('role', 'status');
        form.appendChild(said2);
        form.addEventListener('submit', function (e) {
          e.preventDefault();
          var send = { action: 'view-save', address: here, name: name.value };
          if (replace && replace.value) { send.id = replace.value; if (!name.value.trim()) send.name = views.filter(function (x) { return x.id === replace.value; })[0].name; }
          go.disabled = true;
          call(null, send).then(function (r) {
            go.disabled = false;
            if (r.status !== 200) { said2.textContent = why(r, 'That did not save.'); return; }
            views = r.body.views || [];
            savedOpen = false;
            drawSaved();
            if (savedSel) savedSel.focus();
            say('Saved. It is under Saved filters, here and on any device you sign on with.');
          });
        });
        saved.appendChild(form);
      }
      if (at) { var back = root.getElementById(at); if (back) back.focus(); }
    }
    function select(list, value) {
      var s = el('select', 'cb-say tk-input');
      var o0 = el('option', null, 'Nothing: a new saved filter'); o0.value = ''; s.appendChild(o0);
      list.forEach(function (v) { var o = el('option', null, v.name); o.value = v.id; s.appendChild(o); });
      s.value = value;
      return s;
    }

    /* Words, then each filter with how many tasks each choice would show. */
    function drawFilters() {
      var at = root.activeElement && root.activeElement.id;
      var tagsOpen = tagFoldEl ? tagFoldEl.open : !!f.tags;
      filters.textContent = '';
      var fields = el('div', 'tk-fields');
      filters.appendChild(fields);
      if (mode === 'timeline') {
        var sf = el('div', 'tk-field');
        var sl = el('label', 'cb-lab', 'Days shown'); sl.htmlFor = 'tk-span';
        var ss = el('select', 'cb-say tk-input'); ss.id = 'tk-span';
        SPANS.forEach(function (x) { var o = el('option', null, x[1]); o.value = String(x[0]); ss.appendChild(o); });
        ss.value = String(f.span);
        ss.addEventListener('change', function () { f.span = +ss.value; refresh(); });
        sf.appendChild(sl); sf.appendChild(ss);
        fields.appendChild(sf);
      }
      if (mode === 'list') {
        var gf = el('div', 'tk-field');
        var gl = el('label', 'cb-lab', 'Group by'); gl.htmlFor = 'tk-group';
        var gs = el('select', 'cb-say tk-input'); gs.id = 'tk-group';
        LIST_GROUPS.forEach(function (g) { var o = el('option', null, g[1]); o.value = g[0]; gs.appendChild(o); });
        gs.value = f.group;
        gs.addEventListener('change', function () { f.group = gs.value; refresh(); });
        gf.appendChild(gl); gf.appendChild(gs);
        fields.appendChild(gf);
      }
      if (mode === 'board') {
        var cf = el('div', 'tk-field');
        var cl = el('label', 'cb-lab', 'Columns by'); cl.htmlFor = 'tk-cols';
        var cs = el('select', 'cb-say tk-input'); cs.id = 'tk-cols';
        GROUPS.forEach(function (g) { var o = el('option', null, g[1]); o.value = g[0]; cs.appendChild(o); });
        cs.value = f.cols;
        cs.addEventListener('change', function () { f.cols = cs.value; refresh(); });
        cf.appendChild(cl); cf.appendChild(cs);
        fields.appendChild(cf);
      }
      var words = el('div', 'tk-field');
      var wl = el('label', 'cb-lab', 'Words in the name'); wl.htmlFor = 'tk-q';
      var wi = el('input', 'cb-say tk-input'); wi.id = 'tk-q'; wi.type = 'search'; wi.value = f.q; wi.autocomplete = 'off';
      qBox = wi;
      wi.addEventListener('input', function () { f.q = wi.value; writeQuery(f, mode); drawOut(); drawCounts(); });
      words.appendChild(wl); words.appendChild(wi);
      fields.appendChild(words);

      var who = el('div', 'tk-field');
      var hl = el('label', 'cb-lab', 'Whose'); hl.htmlFor = 'tk-who';
      var hs = el('select', 'cb-say tk-input'); hs.id = 'tk-who';
      // Each person's count is the tasks assigned to them or with them on it, so the counts overlap.
      var nWho = counted(f, 'who', function (t) {
        var o = [t.who ? fold(t.who) : '-'];
        (t.with || []).forEach(function (x) { if (o.indexOf(fold(x)) < 0) o.push(fold(x)); });
        return o.concat('*');
      }, mode);
      var opt = function (v, label) { var o = el('option', null, label); o.value = v; hs.appendChild(o); };
      opt('', 'Mine: assigned to me or also on it (' + (me ? nWho[fold(me.handle)] || 0 : 0) + ')');
      opt('all', 'Everybody’s (' + (nWho['*'] || 0) + ')');
      people.forEach(function (p) { if (!me || fold(p) !== fold(me.handle)) opt(p, p + '’s (' + (nWho[fold(p)] || 0) + ')'); });
      opt('-', 'Assigned to nobody (' + (nWho['-'] || 0) + ')');
      hs.value = whoOf(f) === '@me' ? '' : f.who;
      hs.addEventListener('change', function () { f.who = hs.value; refresh(); });
      who.appendChild(hl); who.appendChild(hs);
      fields.appendChild(who);

      var due = el('div', 'tk-field');
      var dl = el('label', 'cb-lab', 'Due'); dl.htmlFor = 'tk-due';
      var ds = el('select', 'cb-say tk-input'); ds.id = 'tk-due';
      DUES.forEach(function (d) {
        var g = { q: f.q, status: f.status, priority: f.priority, tags: f.tags, who: f.who, due: d[0], cols: f.cols };
        var n = tasks.filter(function (t) { return passes(t, g, null, mode); }).length;
        var o = el('option', null, d[1] + ' (' + n + ')'); o.value = d[0]; ds.appendChild(o);
      });
      ds.value = f.due;
      ds.addEventListener('change', function () { f.due = ds.value; refresh(); });
      due.appendChild(dl); due.appendChild(ds);
      fields.appendChild(due);

      filters.appendChild(checks('status', 'Status', settings.statuses, statusesOf(f, mode), function (t) { return t.status; }));
      filters.appendChild(checks('priority', 'Priority', settings.priorities, f.priority || settings.priorities, function (t) { return t.priority; }));
      // Tags in a fold of their own, open while any is picked.
      var tagFold = el('details', 'tk-fold');
      tagFoldEl = tagFold;
      tagFold.open = tagsOpen;
      tagFold.appendChild(el('summary', 'tk-fold__sum', f.tags ? 'Tags: ' + f.tags.join(', ') : 'Tags: any'));
      tagFold.appendChild(checks('tags', 'Tags', settings.tags, f.tags || [], function (t) { return t.tags; }));
      filters.appendChild(tagFold);

      var row = el('p', 'tk-row');
      var clear = el('a', 'cb-btn tk-small', 'Clear the filters'); clear.href = homeOf(mode);
      row.appendChild(clear);
      var link = el('button', 'cb-btn tk-small', 'Copy a link to this view'); link.type = 'button';
      link.addEventListener('click', function () {
        var u = location.href;
        (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(function () { say('Copied. A director who opens it sees the same filters and order.'); },
          function () { say('Copy the address in the browser’s bar: it holds these filters and this order.'); });
      });
      row.appendChild(link);
      filters.appendChild(row);
      if (at) { var back = root.getElementById(at); if (back) back.focus(); }
    }

    // A group of checkboxes, each with how many tasks it would show.
    function checks(key, label, values, on, val) {
      var fs = el('fieldset', 'tk-checks');
      fs.appendChild(el('legend', 'cb-lab', label));
      var n = counted(f, key, val, mode);
      values.forEach(function (v, i) {
        var id = 'tk-' + key + '-' + i;
        var c = el('input'); c.type = 'checkbox'; c.id = id; c.value = v; c.checked = on.indexOf(v) >= 0;
        var l = el('label', 'tk-check'); l.htmlFor = id;
        l.appendChild(c);
        if (key === 'tags') { l.appendChild(document.createTextNode(' ')); l.appendChild(tagDot(v)); l.appendChild(document.createTextNode(v + ' ')); }
        else if (key === 'status') { l.appendChild(document.createTextNode(' ')); l.appendChild(statusDot(v)); l.appendChild(document.createTextNode(v + ' ')); }
        else l.appendChild(document.createTextNode(' ' + v + ' '));
        l.appendChild(el('span', 'tk-n', String(n[v] || 0)));
        c.addEventListener('change', function () {
          var picked = Array.prototype.filter.call(fs.querySelectorAll('input'), function (x) { return x.checked; }).map(function (x) { return x.value; });
          if (key === 'status') f.status = picked;
          else if (key === 'priority') f.priority = picked.length === values.length ? null : picked;
          else f.tags = picked.length ? picked : null;
          refresh();
        });
        fs.appendChild(l);
      });
      return fs;
    }
    function drawCounts() {
      var at = root.activeElement;
      var keep = at && at === qBox ? [at.selectionStart, at.selectionEnd] : null;
      drawSaved();
      drawFilters();
      if (keep) { qBox.focus(); qBox.setSelectionRange(keep[0], keep[1]); }
    }

    /* THE LIST: one table, or with Group by one under each group's heading,
       each sorted by the column headings, which sort every group alike. A
       group's heading folds it away, which lasts while this view is open and
       is kept nowhere. */
    var shut = {};
    function drawTable(focusSort, focusGroup) {
      peek.hide();
      var list = ordered(tasks.filter(function (t) { return passes(t, f, null, mode); }), f);
      shown.textContent = list.length + ' of ' + tasks.length + ' tasks';
      out.textContent = '';
      if (!list.length) { out.appendChild(quiet(tasks.length ? 'No task matches every filter.' : 'There are no tasks yet.')); return; }
      if (!f.group) {
        var one = table(list, '');
        out.appendChild(one);
        if (focusSort) { var sb = one.querySelector('[data-sort="' + focusSort + '"]'); if (sb) sb.focus(); }
        return;
      }
      groupsOf(list).forEach(function (g, i) {
        var sec = el('section', 'tk-group');
        var hid = 'tk-group-' + i;
        sec.setAttribute('aria-labelledby', hid);
        var h = el('h3', 'tk-group__h');
        var b = el('button', 'tk-group__fold'); b.type = 'button'; b.id = hid;
        var was = f.group + '\n' + g.key;
        b.setAttribute('aria-expanded', String(!shut[was]));
        b.appendChild(el('span', 'tk-group__mark', shut[was] ? '\u25B8' : '\u25BE'));
        b.lastChild.setAttribute('aria-hidden', 'true');
        if (f.group === 'status') b.appendChild(statusPill(g.name));
        else if (f.group === 'tags' && g.key) { b.appendChild(tagDot(g.name)); b.appendChild(document.createTextNode(g.name)); }
        else b.appendChild(document.createTextNode(g.name));
        b.appendChild(document.createTextNode(' '));
        b.appendChild(el('span', 'tk-n', String(g.tasks.length)));
        h.appendChild(b);
        sec.appendChild(h);
        var tab = table(g.tasks, g.key);
        tab.hidden = !!shut[was];
        sec.appendChild(tab);
        b.addEventListener('click', function () {
          var open = b.getAttribute('aria-expanded') !== 'true';
          b.setAttribute('aria-expanded', String(open));
          b.firstChild.textContent = open ? '\u25BE' : '\u25B8';
          tab.hidden = !open;
          shut[was] = !open;
        });
        out.appendChild(sec);
        if (focusSort && g.key === focusGroup) { var gb = tab.querySelector('[data-sort="' + focusSort + '"]'); if (gb) gb.focus(); }
      });
    }

    /* The groups a list falls into, each with its tasks in the list's order.
       Whose: everybody on a task, in alphabetical order, then Nobody. Assigned
       to: each person, then Nobody. Status and priority: in their own order.
       Tags: each tag in its order, then No tags. */
    function groupsOf(list) {
      var by = {}, order = [];
      function put(key, name, t) {
        var k = fold(key);
        if (!by[k]) { by[k] = { key: k, name: name, tasks: [] }; order.push(k); }
        by[k].tasks.push(t);
      }
      list.forEach(function (t) {
        if (f.group === 'whose') { var w = whoseOf(t); if (w.length) w.forEach(function (p) { put(p, p, t); }); else put('', 'Nobody', t); }
        else if (f.group === 'who') put(t.who || '', t.who || 'Nobody', t);
        else if (f.group === 'tags') { if (t.tags.length) t.tags.forEach(function (x) { put(x, x, t); }); else put('', 'No tags', t); }
        else put(t[f.group], t[f.group], t);
      });
      var rank = f.group === 'status' ? settings.statuses : f.group === 'priority' ? settings.priorities : f.group === 'tags' ? settings.tags : null;
      return order.map(function (k) { return by[k]; }).sort(function (a, b) {
        // Nobody and No tags last; the rest in their own order, or alphabetical.
        if (!a.key !== !b.key) return a.key ? -1 : 1;
        if (rank) return rank.indexOf(a.name) - rank.indexOf(b.name);
        return a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
      });
    }

    function table(list, groupKey) {
      var t = el('table', 'tk-list');
      t.appendChild(el('caption', 'sr', 'Tasks, ' + list.length + ' shown. The column headings sort them.'));
      var hr = el('tr');
      COLUMNS.forEach(function (c) {
        var th = el('th'); th.scope = 'col';
        var b = el('button', 'tk-sort', c[1]); b.type = 'button';
        if (f.sort === c[0]) th.setAttribute('aria-sort', f.dir === 'asc' ? 'ascending' : 'descending');
        b.appendChild(el('span', 'tk-arrow', f.sort === c[0] ? (f.dir === 'asc' ? ' ↑' : ' ↓') : ''));
        b.addEventListener('click', function () {
          f.dir = f.sort === c[0] && f.dir === 'asc' ? 'desc' : 'asc';
          f.sort = c[0];
          writeQuery(f, mode);
          drawSaved();
          drawTable(c[0], groupKey);
        });
        b.dataset.sort = c[0];
        th.appendChild(b);
        hr.appendChild(th);
      });
      var thead = el('thead'); thead.appendChild(hr); t.appendChild(thead);
      var tb = el('tbody');
      list.forEach(function (x) {
        var tr = el('tr');
        if (isDone(x)) tr.className = 'tk-done';
        var td = el('td', 'tk-title');
        var a = el('a', null, x.name); a.href = '#/t/' + x.id;
        peek.watch(a, x.id, peekWays);
        td.appendChild(a);
        tr.appendChild(td);
        var st = el('td'); st.appendChild(statusPill(x.status)); tr.appendChild(st);
        var pr = el('td', null, x.priority);
        if (x.priority === 'High' || x.priority === 'Urgent') pr.className = 'tk-high';
        tr.appendChild(pr);
        tr.appendChild(el('td', null, x.who || '—'));
        tr.appendChild(el('td', 'tk-withcell', (x.with || []).join(', ') || '—'));
        tr.appendChild(el('td', 'tk-withcell', whoseOf(x).join(', ') || '—'));
        tr.appendChild(el('td', 'tk-day', dayWords(x.start)));
        var due = el('td', 'tk-day', dayWords(x.due));
        if (overdue(x)) due.appendChild(tag('OVERDUE', 'tk-late'));
        tr.appendChild(due);
        var tc = el('td', 'tk-tagcell'); tc.appendChild(tagWords(x.tags)); tr.appendChild(tc);
        tb.appendChild(tr);
      });
      t.appendChild(tb);
      return t;
    }

    /* THE BOARD: a column for each status, priority or person, with how many
       tasks are in it. A card moves by dragging it to another column, or by
       its own Move to, which is how a keyboard, a screen reader and a phone
       move it: dragging alone would leave them out. A move changes that one
       field and nothing else. */
    function columnsOf() {
      if (f.cols === 'priority') return (f.priority || settings.priorities).map(function (v) { return [v, v]; });
      if (f.cols === 'who') {
        var ps = people.slice();
        tasks.forEach(function (t) { if (t.who && ps.every(function (p) { return fold(p) !== fold(t.who); }) && passes(t, f, null, mode)) ps.push(t.who); });
        return ps.map(function (p) { return [p, p]; }).concat([['', 'Nobody']]);
      }
      return statusesOf(f, mode).map(function (v) { return [v, v]; });
    }
    function choicesOf() {
      if (f.cols === 'priority') return settings.priorities.map(function (v) { return [v, v]; });
      if (f.cols === 'who') return people.map(function (p) { return [p, p]; }).concat([['', 'Nobody']]);
      return settings.statuses.map(function (v) { return [v, v]; });
    }
    function valueOf(t) { return f.cols === 'who' ? (t.who || '') : t[f.cols]; }
    function columnFor(v) {
      var cols = columnsOf();
      return cols.filter(function (c) { return f.cols === 'who' ? fold(c[0]) === fold(v) : c[0] === v; })[0] || null;
    }

    function move(t, to, focusAfter) {
      if (fold(valueOf(t)) === fold(to)) return;
      var send = { action: 'save', id: t.id };
      send[f.cols] = f.cols === 'who' && !to ? null : to;
      say('Moving “' + t.name + '”…');
      call(null, send).then(function (r) {
        if (r.status !== 200) { say(why(r, 'That did not move. Nothing was changed.')); drawBoard(); return; }
        var k = tasks.findIndex(function (x) { return x.id === t.id; });
        var next = r.body.task; delete next.body; delete next.blocks;
        if (k >= 0) tasks[k] = next;
        var col = columnFor(to);
        drawSaved();
        drawFilters();
        drawBoard(focusAfter ? t.id : null);
        say('Moved “' + t.name + '” to ' + (col ? col[1] : (to || 'Nobody')) + (col ? '.' : ', which is not on this board as it is filtered, so it has gone from view.'));
      });
    }

    var dragging = null;
    function drawBoard(focusId) {
      var list = ordered(tasks.filter(function (t) { return passes(t, f, null, mode); }), f);
      shown.textContent = list.length + ' of ' + tasks.length + ' tasks';
      out.textContent = '';
      var board = el('div', 'tk-board');
      var cols = columnsOf(), choices = choicesOf();
      cols.forEach(function (c) {
        var mine = list.filter(function (t) { return fold(valueOf(t)) === fold(c[0]); });
        var col = el('section', 'tk-col');
        var hid = 'tk-col-' + cols.indexOf(c);
        col.setAttribute('aria-labelledby', hid);
        var hd = el('h3', 'tk-col__h');
        hd.id = hid;
        if (f.cols === 'status') hd.appendChild(statusPill(c[1]));
        else hd.appendChild(document.createTextNode(c[1]));
        hd.appendChild(document.createTextNode(' '));
        hd.appendChild(el('span', 'tk-n', String(mine.length)));
        col.appendChild(hd);
        var ul = el('ul', 'tk-cards');
        ul.addEventListener('dragover', function (e) { if (dragging) { e.preventDefault(); col.classList.add('tk-col--over'); } });
        ul.addEventListener('dragleave', function () { col.classList.remove('tk-col--over'); });
        ul.addEventListener('drop', function (e) {
          e.preventDefault();
          col.classList.remove('tk-col--over');
          if (dragging) move(dragging, c[0], false);
          dragging = null;
        });
        if (!mine.length) ul.appendChild(el('li', 'tk-empty cb-quiet', 'Nothing here.'));
        mine.forEach(function (t) { ul.appendChild(card(t, choices)); });
        col.appendChild(ul);
        board.appendChild(col);
      });
      out.appendChild(board);
      if (focusId) { var m = out.querySelector('[data-move="' + focusId + '"]'); if (m) m.focus(); }
    }

    function card(t, choices) {
      var li = el('li', 'tk-card' + (isDone(t) ? ' tk-done' : ''));
      li.draggable = true;
      li.addEventListener('dragstart', function (e) {
        dragging = t;
        li.classList.add('tk-card--lifted');
        try { e.dataTransfer.setData('text/plain', t.name); e.dataTransfer.effectAllowed = 'move'; } catch (err) { /* an old browser */ }
      });
      li.addEventListener('dragend', function () { li.classList.remove('tk-card--lifted'); dragging = null; });
      var a = el('a', 'tk-card__name', t.name); a.href = '#/t/' + t.id;
      a.draggable = false;
      li.appendChild(a);
      var facts = el('p', 'tk-card__facts');
      var bits = [];
      if (f.cols !== 'priority' && t.priority !== settings.priority) bits.push(t.priority);
      if (f.cols !== 'who') bits.push(t.who || 'Nobody');
      var others = alsoOn(t);
      if (others.length) bits.push('with ' + others.join(', '));
      if (t.due) bits.push('due ' + dayWords(t.due));
      if (f.cols !== 'status') { facts.appendChild(statusPill(t.status)); if (bits.length) facts.appendChild(document.createTextNode(' · ')); }
      facts.appendChild(document.createTextNode(bits.join(' · ')));
      if (overdue(t)) facts.appendChild(tag('OVERDUE', 'tk-late'));
      if ((t.priority === 'High' || t.priority === 'Urgent') && f.cols !== 'priority') facts.classList.add('tk-high');
      li.appendChild(facts);
      if (t.tags.length) { var tp = el('p', 'tk-card__tags'); tp.appendChild(tagWords(t.tags)); li.appendChild(tp); }
      var mv = el('label', 'tk-move');
      var ms = el('select', 'cb-say tk-move__sel');
      ms.dataset.move = t.id;
      ms.setAttribute('aria-label', 'Move “' + t.name + '” to');
      mv.appendChild(el('span', 'tk-move__lab', 'Move to'));
      // Somebody who has left the people a task can go to keeps the tasks they had, so their name stays a choice on those.
      var own = choices.some(function (c) { return fold(c[0]) === fold(valueOf(t)); }) ? choices : choices.concat([[valueOf(t), valueOf(t)]]);
      own.forEach(function (c) { var o = el('option', null, c[1]); o.value = c[0]; ms.appendChild(o); });
      ms.value = own.filter(function (c) { return fold(c[0]) === fold(valueOf(t)); }).map(function (c) { return c[0]; })[0] || '';
      ms.addEventListener('change', function () { move(t, ms.value, true); });
      mv.appendChild(ms);
      li.appendChild(mv);
      return li;
    }

    /* THE TIMELINE, after EspoCRM's calendar timeline: a row for each person a
       task can be assigned to, and Nobody when anything is, with the days
       running across and each task a bar from its start to its due day. A bar
       that began before these days or runs past them says so, in words as well
       as at its open end. The day header is drawn for the eye; every bar says
       its own days in words. Two tasks on the same days stand one above the
       other, and nothing is left off a row for want of room. */
    /* The legend: each colour on these days, in the palette's order, with the
       tags that wear it, so a colour is always said in words too. */
    function drawLegend(on) {
      var lg = view.querySelector('.tk-legend');
      if (!lg) return;
      lg.textContent = '';
      var here = (settings.colours || []).filter(function (c) { return on.some(function (t) { return coloursOf(t).indexOf(c) >= 0; }); });
      if (!here.length) { lg.hidden = true; return; }
      lg.hidden = false;
      here.forEach(function (c) {
        var item = el('span', 'tk-legend__item');
        var sw = el('span', 'tk-dot tk-c--' + c); sw.setAttribute('aria-hidden', 'true');
        item.appendChild(sw);
        item.appendChild(document.createTextNode(settings.tags.filter(function (x) { return colourOf(x) === c; }).join(', ')));
        lg.appendChild(item);
      });
      if (on.some(function (t) { return coloursOf(t).length > 1; })) lg.appendChild(el('span', 'tk-legend__item', 'Stripes along a bar’s foot: tags of more than one colour, the bar in the first.'));
    }

    function drawTimeline() {
      var a = mondayOf(f.from || today()), span = f.span, b = plus(a, span - 1), now = today();
      var all = tasks.filter(function (t) { return passes(t, f, null, mode); });
      var on = all.filter(function (t) { return onDays(t, a, b); });
      var undated = all.filter(function (t) { return !spanOf(t); }).length;
      shown.textContent = on.length + ' of ' + all.length + ' tasks fall between ' + dayWords(a) + ' and ' + dayWords(b)
        + (undated ? '; ' + undated + ' have no start or due day, so no place on it' : '');
      if (along) along.querySelectorAll('button')[1].setAttribute('aria-pressed', String(a === mondayOf(now)));
      drawLegend(on);
      out.textContent = '';
      var tl = el('div', 'tk-tl');
      // A day is never narrower than a short word, so a one-day bar can be read; the box scrolls sideways instead.
      tl.style.minWidth = (span * 80) + 'px';
      var cols = 'repeat(' + span + ', minmax(0, 1fr))';
      var days = el('div', 'tk-tl__days');
      days.setAttribute('aria-hidden', 'true');
      days.style.gridTemplateColumns = cols;
      for (var i = 0; i < span; i++) {
        var d = plus(a, i), p = d.split('-'), x = new Date(+p[0], +p[1] - 1, +p[2]);
        var c = el('div', 'tk-tl__day' + (d === now ? ' tk-tl__day--today' : '') + (x.getDay() === 1 ? ' tk-tl__day--monday' : ''));
        c.appendChild(el('span', 'tk-tl__wd', x.toLocaleDateString(undefined, { weekday: 'short' })));
        c.appendChild(el('span', 'tk-tl__dn', (i === 0 || +p[2] === 1 ? x.toLocaleDateString(undefined, { month: 'short' }) + ' ' : '') + (+p[2])));
        if (d === now) c.appendChild(el('span', 'tk-tl__now', 'Today'));
        days.appendChild(c);
      }
      tl.appendChild(days);
      /* A task stands in the row of whoever it is assigned to and in the row of
         everybody also on it, because that is whose it is. Everybody's shows a
         row for everybody, empty or not; one person's (mine included) shows
         theirs alone, and Assigned to nobody the row of tasks nobody has. */
      var rows = people.slice(), whose = whoOf(f);
      on.forEach(function (t) {
        [t.who].concat(t.with || []).forEach(function (h) { if (h && rows.every(function (p) { return fold(p) !== fold(h); })) rows.push(h); });
      });
      rows = rows.map(function (p) { return [p, p]; });
      if (on.some(function (t) { return !t.who; })) rows.push(['', 'Assigned to nobody']);
      var rowOf = function (row) { return on.filter(function (t) { return row[0] ? owns(t, row[0]) : !t.who; }); };
      if (whose !== 'all') {
        var keep = whose === '@me' ? (me ? me.handle : '') : whose === '-' ? '' : whose;
        rows = rows.filter(function (row) { return fold(row[0]) === fold(keep); });
        if (!rows.length) rows = [[keep, keep || 'Assigned to nobody']];
      }
      var todayAt = daysBetween(a, now);
      rows.forEach(function (row, r) {
        var mine = rowOf(row).sort(function (x, y) {
          var p = spanOf(x), q = spanOf(y);
          return p[0] < q[0] ? -1 : p[0] > q[0] ? 1 : p[1] < q[1] ? -1 : p[1] > q[1] ? 1 : x.name.localeCompare(y.name);
        });
        var sec = el('section', 'tk-tl__row');
        var hid = 'tk-tl-row-' + r;
        sec.setAttribute('aria-labelledby', hid);
        var hd = el('h3', 'tk-tl__who'); hd.id = hid;
        hd.appendChild(document.createTextNode(row[1] + ' '));
        hd.appendChild(el('span', 'tk-n', String(mine.length)));
        sec.appendChild(hd);
        if (!mine.length) { sec.appendChild(el('p', 'cb-quiet tk-tl__none', 'Nothing on these days.')); tl.appendChild(sec); return; }
        var lanes = el('ul', 'tk-tl__lanes');
        lanes.style.gridTemplateColumns = cols;
        var ends = [];
        var placed = mine.map(function (t) {
          var d = spanOf(t), s0 = Math.max(0, daysBetween(a, d[0])), e0 = Math.min(span - 1, daysBetween(a, d[1]));
          var lane = 0;
          while (ends[lane] != null && ends[lane] >= s0) lane++;
          ends[lane] = e0;
          return { t: t, d: d, s0: s0, e0: e0, lane: lane };
        });
        if (todayAt >= 0 && todayAt < span) {
          var mark = el('li', 'tk-tl__todaycol');
          mark.setAttribute('aria-hidden', 'true');
          mark.style.gridColumn = (todayAt + 1) + ' / ' + (todayAt + 2);
          mark.style.gridRow = '1 / ' + (ends.length + 1);
          lanes.appendChild(mark);
        }
        placed.forEach(function (pl) {
          var t = pl.t, before = pl.d[0] < a, after = pl.d[1] > b;
          // In the row of somebody also on it rather than assigned to it, the bar says so, in words.
          var also = !!row[0] && fold(t.who) !== fold(row[0]);
          var li = el('li', 'tk-tl__item');
          li.style.gridColumn = (pl.s0 + 1) + ' / ' + (pl.e0 + 2);
          li.style.gridRow = String(pl.lane + 1);
          var bar = el('a', 'tk-tl__bar' + (before ? ' tk-tl__bar--before' : '') + (after ? ' tk-tl__bar--after' : '')
            + (overdue(t) ? ' tk-tl__bar--late' : '') + (isDone(t) ? ' tk-done' : '') + (t.priority === 'High' || t.priority === 'Urgent' ? ' tk-high' : '')
            + (also ? ' tk-tl__bar--also' : '') + (coloursOf(t).length ? ' tk-filled tk-c--' + coloursOf(t)[0] : ''));
          bar.href = '#/t/' + t.id;
          if (overdue(t)) bar.appendChild(tag('OVERDUE', 'tk-late'));
          if (also) bar.appendChild(tag('ALSO ON IT', 'tk-also'));
          bar.appendChild(el('span', 'tk-tl__name', t.name));
          if (coloursOf(t).length > 1) {
            var stripes = el('span', 'tk-tl__stripes');
            stripes.setAttribute('aria-hidden', 'true');
            coloursOf(t).forEach(function (c) { stripes.appendChild(el('span', 'tk-c--' + c)); });
            bar.appendChild(stripes);
          }
          var words = t.start && t.due && t.start !== t.due ? 'starts ' + dayWords(t.start) + ', due ' + dayWords(t.due)
            : t.due ? 'due ' + dayWords(t.due) : 'starts ' + dayWords(t.start);
          bar.appendChild(el('span', 'sr', ', ' + words + (before ? ', began before these days' : '') + (after ? ', runs on past these days' : '')
            + ', ' + t.status + (t.priority === 'High' || t.priority === 'Urgent' ? ', ' + t.priority : '')
            + (also ? ', assigned to ' + (t.who || 'nobody') : alsoOn(t).length ? ', with ' + alsoOn(t).join(', ') : '')
            + (t.tags.length ? ', tagged ' + t.tags.join(', ') : '')));
          li.appendChild(bar);
          lanes.appendChild(li);
        });
        sec.appendChild(lanes);
        tl.appendChild(sec);
      });
      out.appendChild(tl);
    }

    /* THE FEED, after Notion's Feed view (Ryan's ask, 2026-10-21): every task
       that passes the filters as a card, the one something last happened to
       first, each saying what that was, with its description to read and tick
       where it stands and Mark it completed. A page of cards at a time; Show
       more adds the next. A card changed here is redrawn where it is, not moved
       to the top under the hand that changed it; the order catches up the next
       time the feed is drawn. */
    // How many cards are open is kept for coming back here, so Back finds the card you left by.
    var feedShown = step.kept('feed') || settings.feedPage || 20, feedGot = {};
    function lastAt(t) { return Math.max(t.t || 0, t.edited || 0, t.done || 0, t.talk || 0); }
    function readCard(id) {
      var t = tasks.filter(function (y) { return y.id === id; })[0];
      if (!t) return Promise.resolve(null);
      if (feedGot[id] && feedGot[id].at === lastAt(t)) return Promise.resolve(feedGot[id]);
      return call('view=feed&ids=' + encodeURIComponent(id)).then(function (r) {
        var x = r.status === 200 && (r.body.feed || [])[0];
        if (!x) return null;
        return (feedGot[id] = { at: lastAt(t), task: x.task, acts: x.acts, comments: x.comments || [], said: x.said || 0 });
      });
    }
    /* What happened to a task last, in words, for its card and its preview. */
    function happened(t, got) {
      var ev = got && got.acts && got.acts[0];
      return (ev ? actWords(ev) : t.recur ? 'Its recurring task made this task.' : t.by ? whoWords(t.by, true) + ' made this task.'
        : t.espo ? 'Brought over from EspoCRM.' : t.notion ? 'Brought over from Notion.' : 'Made.')
        + ' ' + when(ev ? ev.t : t.t);
    }
    /* A TASK'S PREVIEW in the list (Norah's ask, 2026-10-21): what happened to
       it last, the first parts of its description and its latest comments, read
       as the feed reads a card, and kept with the feed's. The row has the rest. */
    var peekWays = {
      read: readCard,
      draw: function (c, id, got) {
        var t = tasks.filter(function (y) { return y.id === id; })[0];
        if (!t) return;
        c.appendChild(el('p', 'tk-peek__name', t.name));
        if (got) c.appendChild(el('p', 'tk-peek__what', happened(t, got)));
        var whole = got ? got.task : null;
        if (t.words === 0 || (whole && (!whole.blocks || !whole.blocks.length))) c.appendChild(quiet('No description.'));
        else if (!got) c.appendChild(quiet('Reading…'));
        else {
          var FEW = 3, body = el('div', 'tk-body tk-peek__body');
          window.loveMarkdown.blocks(whole.blocks.slice(0, FEW), body, { top: 4, prefix: 'tk' });
          marked(body);
          c.appendChild(body);
          if (whole.blocks.length > FEW) c.appendChild(quiet('The rest of it is on its page.'));
        }
        if (got && got.said) c.appendChild(window.loveComments.latest({ p: 'tk', mark: marked, when: when, href: function () { return null; } }, got.comments || [], got.said));
      }
    };
    function drawFeed(focusFrom) {
      var list = tasks.filter(function (t) { return passes(t, f, null, mode); })
        .sort(function (a, b) { return lastAt(b) - lastAt(a) || a.name.localeCompare(b.name); });
      shown.textContent = list.length + ' of ' + tasks.length + ' tasks, the latest change first';
      out.textContent = '';
      if (!list.length) { out.appendChild(quiet('No task passes these filters.')); return; }
      var page = list.slice(0, feedShown);
      var ol = el('ol', 'tk-feed');
      out.appendChild(ol);
      var cards = {};
      page.forEach(function (t) {
        var li = el('li', 'tk-post');
        cards[t.id] = li;
        feedCard(li, t, feedGot[t.id] && feedGot[t.id].at === lastAt(t) ? feedGot[t.id] : null);
        ol.appendChild(li);
      });
      if (list.length > page.length) {
        var more = el('button', 'cb-btn tk-small tk-feed__more', 'Show ' + Math.min(settings.feedPage || 20, list.length - page.length) + ' more'); more.type = 'button';
        more.addEventListener('click', function () { var from = feedShown; feedShown += settings.feedPage || 20; step.keep('feed', feedShown); drawFeed(from); });
        out.appendChild(more);
      }
      if (focusFrom != null && page[focusFrom]) { var go = cards[page[focusFrom].id].querySelector('.tk-post__name'); if (go) go.focus(); }
      // The cards not yet read whole are read in one ask, then drawn where they stand.
      var want = page.filter(function (t) { return !(feedGot[t.id] && feedGot[t.id].at === lastAt(t)); }).map(function (t) { return t.id; });
      if (!want.length) return;
      call('view=feed&ids=' + want.map(encodeURIComponent).join(',')).then(function (r) {
        if (r.status !== 200) { say(why(r, 'The feed could not read its cards just now.')); return; }
        (r.body.feed || []).forEach(function (x) {
          var t = tasks.filter(function (y) { return y.id === x.task.id; })[0];
          feedGot[x.task.id] = { at: t ? lastAt(t) : lastAt(x.task), task: x.task, acts: x.acts, comments: x.comments || [], said: x.said || 0 };
          var li = cards[x.task.id];
          if (li && li.isConnected) feedCard(li, x.task, feedGot[x.task.id]);
        });
      });
    }
    /* One card: its name, what happened last, its facts, its description (the
       first few parts of it, and the rest with More), and what can be done
       there. `got` is the task read whole, or nothing yet. */
    function feedCard(li, t, got) {
      var whole = got ? got.task : null, open = li.dataset.open === '1';
      // What has the keyboard, said before anything it pressed was disabled or redrawn, or else whatever has it now.
      var keep = li.dataset.keep || (root.activeElement && li.contains(root.activeElement) ? root.activeElement.getAttribute('data-keep') : null);
      delete li.dataset.keep;
      li.textContent = '';
      li.className = 'tk-post' + (isDone(t) ? ' tk-done' : '');
      var head = el('h3', 'tk-post__head');
      var a = el('a', 'tk-post__name', t.name); a.href = '#/t/' + t.id; a.setAttribute('data-keep', 'name');
      head.appendChild(a);
      li.appendChild(head);
      li.appendChild(el('p', 'tk-post__what', happened(t, got)));
      var facts = el('p', 'tk-post__facts');
      facts.appendChild(statusPill(t.status));
      var bits = [''];
      if (t.priority !== settings.priority) bits.push(t.priority);
      bits.push(t.who ? 'assigned to ' + t.who : 'assigned to nobody');
      var others = alsoOn(t);
      if (others.length) bits.push('with ' + others.join(', '));
      if (t.start && t.due && t.start !== t.due) bits.push('starts ' + dayWords(t.start));
      if (t.due) bits.push('due ' + dayWords(t.due));
      facts.appendChild(document.createTextNode(bits.join(' · ')));
      if (overdue(t)) facts.appendChild(tag('OVERDUE', 'tk-late'));
      li.appendChild(facts);
      if (t.tags.length) { var tp = el('p', 'tk-post__tags'); tp.appendChild(tagWords(t.tags)); li.appendChild(tp); }
      // A task with no description has no place for one: the list already says how long each is.
      var body = el('div', 'tk-body tk-post__body');
      if (t.words === 0 || (whole && (!whole.blocks || !whole.blocks.length))) body = null;
      else if (!got) body.appendChild(quiet('Reading…'));
      else {
        // The first parts of the description, and More for the rest: never the rest hidden under the first, where a box could be reached and not seen.
        var FEW = 3, all = whole.blocks, some = open ? all : all.slice(0, FEW);
        var md = { top: 3, prefix: 'tk' };
        if (whole.ticks) md.box = function (bx, c) {
          c.setAttribute('data-keep', 'box-' + bx.n);
          c.addEventListener('change', function () {
            var on = c.checked, label = c.getAttribute('aria-label');
            c.disabled = true;
            call(null, { action: 'tick', id: t.id, n: bx.n, text: bx.raw, on: on }).then(function (r) {
              if (r.status !== 200) { c.checked = !on; c.disabled = false; c.focus(); say(why(r, 'That did not save. Nothing was changed.')); return; }
              li.dataset.keep = 'box-' + bx.n;
              settle(li, r.body.task);
              say((on ? 'Ticked' : 'Unticked') + ' “' + label + '”.');
            });
          });
        };
        window.loveMarkdown.blocks(some, body, md);
        marked(body);
        if (all.length > FEW) {
          var mo = el('button', 'cb-btn tk-small tk-post__more', open ? 'Less' : 'More'); mo.type = 'button';
          mo.setAttribute('aria-expanded', String(open)); mo.setAttribute('data-keep', 'more');
          mo.addEventListener('click', function () { li.dataset.open = open ? '' : '1'; li.dataset.keep = 'more'; feedCard(li, t, got); });
          body.appendChild(mo);
        }
      }
      if (body) li.appendChild(body);
      // Its latest comments, to read where the card stands; they are edited on the task's own page.
      if (got && got.said) li.appendChild(window.loveComments.latest({ p: 'tk', mark: marked, when: when, href: function (c) { return taskHref(t.id, c.id); } }, got.comments || [], got.said));
      var writing = li.dataset.writing === '1';
      if (writing) {
        // A comment written on the card: what is typed is kept on the card while it is redrawn.
        var box = window.loveComments.box({ p: 'tk', said: say, people: function () { return people; }, roles: roles, me: me ? me.handle : '', mark: marked, id: 'tk-say-' + t.id, label: 'Comment on “' + t.name + '”', value: li.draft || '', goText: 'Comment',
          max: settings.commentMax, hint: COMMENT_HINT, ask: function (send) { return call(null, send); }, why: why,
          cancel: function () { li.dataset.writing = ''; li.draft = ''; li.dataset.keep = 'comment'; feedCard(li, t, got); },
          send: function (text, done) {
            call(null, { action: 'comment', id: t.id, body: text }).then(function (r) {
              if (r.status !== 200) { done(false, why(r, 'That did not post. Nothing was changed.')); return; }
              var c = r.body.comment, now = Object.assign({}, got && got.task ? got.task : t, { talk: c.t });
              li.dataset.writing = ''; li.draft = ''; li.dataset.keep = 'comment';
              if (got) { got = Object.assign({}, got, { comments: (got.comments || []).concat([c]).slice(-2), said: (got.said || 0) + 1 }); }
              feedGot[t.id] = got;
              settle(li, now);
              say('Comment posted on “' + t.name + '”.');
            });
          } });
        box.text.setAttribute('data-keep', 'comment-text');
        box.text.addEventListener('input', function () { li.draft = box.text.value; });
        li.appendChild(box.form);
      }
      var tools = el('div', 'tk-row tk-post__tools');
      var go = el('a', 'cb-btn tk-small', 'Open'); go.href = '#/t/' + t.id; go.setAttribute('aria-label', 'Open “' + t.name + '”');
      tools.appendChild(go);
      if (!writing) {
        var cm = el('button', 'cb-btn tk-small', 'Comment'); cm.type = 'button'; cm.setAttribute('data-keep', 'comment');
        cm.setAttribute('aria-label', 'Comment on “' + t.name + '”');
        cm.addEventListener('click', function () { li.dataset.writing = '1'; li.dataset.keep = 'comment-text'; feedCard(li, t, got); });
        tools.appendChild(cm);
      }
      if (t.status !== 'Completed') {
        var fin = el('button', 'cb-btn tk-small', 'Mark it completed'); fin.type = 'button'; fin.setAttribute('data-keep', 'done');
        fin.setAttribute('aria-label', 'Mark “' + t.name + '” completed');
        fin.addEventListener('click', function () {
          fin.disabled = true;
          call(null, { action: 'save', id: t.id, status: 'Completed' }).then(function (r) {
            fin.disabled = false;
            if (r.status !== 200) { say(why(r, 'That did not save. Nothing was changed.')); return; }
            settle(li, r.body.task);
            var nm = li.querySelector('.tk-post__name'); if (nm) nm.focus();
            say('Completed “' + t.name + '”.');
          });
        });
        tools.appendChild(fin);
      }
      li.appendChild(tools);
      if (keep) { var k = li.querySelector('[data-keep="' + keep + '"]'); if (k && !k.disabled) k.focus(); }
    }
    /* A task changed on its card: kept in the list for the counts, and its card
       read again where it stands. */
    function settle(li, task) {
      tasks = tasks.map(function (x) { return x.id === task.id ? task : x; });
      // The save hands back the task whole, so the card keeps its words, and the keyboard its place, while its latest changes are read.
      var had = feedGot[task.id];
      feedGot[task.id] = { at: lastAt(task), task: task, acts: had ? had.acts : [], comments: had ? had.comments : [], said: had ? had.said : 0 };
      feedCard(li, task, feedGot[task.id]);
      drawCounts();
      call('view=feed&ids=' + encodeURIComponent(task.id)).then(function (r) {
        var x = r.status === 200 && (r.body.feed || [])[0];
        if (!x) return;
        feedGot[task.id] = { at: lastAt(task), task: x.task, acts: x.acts, comments: x.comments || [], said: x.said || 0 };
        if (li.isConnected) feedCard(li, task, feedGot[task.id]);
      });
    }

    drawSaved();
    drawFilters();
    drawOut();
    return h;
  }

  /* ── One task ──────────────────────────────────────────────────────────── */

  function taskView(id, landOn) {
    view.textContent = '';
    view.appendChild(quiet('Looking…'));
    return call('view=task&id=' + encodeURIComponent(id)).then(function (r) {
      if (r.status !== 200) {
        if (r.status === 404) { view.textContent = ''; var h0 = heading(2, 'That task has been deleted'); view.appendChild(h0); step.up('#/', '← Back to the list'); return h0; }
        return refused(r);
      }
      took(r.body);
      linked = { id: r.body.task.id, list: r.body.backlinks || [] };
      return drawTask(r.body.task, r.body.activity, r.body.comments, landOn);
    });
  }
  // The comments of the task on the page, kept while it is redrawn by a tick or Mark it completed; and where it is linked from.
  var talked = { id: null, list: null }, linked = { id: null, list: [] };
  function drawTask(t, activity, comments, landOn) {
    if (comments) talked = { id: t.id, list: comments };
    else if (talked.id !== t.id) talked = { id: t.id, list: null };
    view.textContent = '';
    step.up('#/', '← Back to the list');
    var h = heading(2, t.name);
    view.appendChild(h);
    var dl = el('dl', 'tk-facts');
    function fact(k, v) { if (v == null || v === '') return; dl.appendChild(el('dt', null, k)); var dd = el('dd'); if (typeof v === 'string') dd.textContent = v; else dd.appendChild(v); dl.appendChild(dd); }
    fact('Status', statusPill(t.status));
    fact('Priority', t.priority);
    fact('Assigned to', t.who || 'Nobody');
    if (t.with.length) fact('Also on it', t.with.join(', '));
    fact('Starts', dayWords(t.start));
    if (t.due) { var d = el('span', null, dayWords(t.due)); if (overdue(t)) d.appendChild(tag('OVERDUE', 'tk-late')); fact('Due', d); }
    if (t.done) fact('Finished', when(t.done));
    if (t.tags.length) fact('Tags', tagWords(t.tags));
    if (t.recur) {
      // Made by a recurring task, on its day, under nobody's name.
      var made = el('span', null, 'By ');
      if (t.from) { var ra = el('a', null, 'the recurring task “' + t.from.name + '”'); ra.href = '#/recurring/' + t.from.id; made.appendChild(ra); }
      else made.appendChild(document.createTextNode('a recurring task since deleted'));
      made.appendChild(document.createTextNode(', for ' + dayWords(t.on) + ', ' + when(t.t)));
      fact('Made', made);
    } else if (t.tpl) {
      // From a template: by a director, or with nobody's name by a form, through the office's intake.
      var fromT = el('span', null, (t.by ? t.by : 'By a form') + ', from ');
      if (t.fromTpl) { var pa = el('a', null, 'the template “' + t.fromTpl.name + '”'); pa.href = '#/templates/' + t.fromTpl.id; fromT.appendChild(pa); }
      else fromT.appendChild(document.createTextNode('a template since deleted'));
      fromT.appendChild(document.createTextNode(', ' + when(t.t)));
      fact('Made', fromT);
    } else fact('Made', (t.by ? t.by + ', ' : '') + when(t.t));
    if (t.notion) {
      // Brought from Notion's Tasks: its page there may say more than came over.
      var np = el('a', null, 'its page in Notion');
      np.href = 'https://www.notion.so/' + t.notion;
      np.rel = 'noopener noreferrer';
      var nf = el('span', null, 'Brought over from ');
      nf.appendChild(np);
      fact('From', nf);
    }
    if (t.edited) fact('Changed', (t.editedBy ? t.editedBy + ', ' : '') + when(t.edited));
    view.appendChild(dl);
    var body = el('div', 'tk-body');
    // A checkbox in the description ticks in place, as EspoCRM's did: only that box's line changes.
    var md = { top: 2, prefix: 'tk' };
    if (t.ticks) md.box = function (bx, c) {
      c.setAttribute('data-box', String(bx.n));
      c.addEventListener('change', function () {
        var on = c.checked, label = c.getAttribute('aria-label');
        c.disabled = true;
        call(null, { action: 'tick', id: t.id, n: bx.n, text: bx.raw, on: on }).then(function (r) {
          if (r.status !== 200) { c.checked = !on; c.disabled = false; say(why(r, 'That did not save. Nothing was changed.')); return; }
          drawTask(r.body.task);
          freshActivity(t.id);
          var again = view.querySelector('input[data-box="' + bx.n + '"]');
          if (again) again.focus();
          say((on ? 'Ticked' : 'Unticked') + ' “' + label + '”.');
        });
      });
    };
    if (t.blocks && t.blocks.length) { window.loveMarkdown.blocks(t.blocks, body, md); marked(body); }
    else body.appendChild(quiet('No description.'));
    view.appendChild(body);
    if (!t.ticks && body.querySelector('input[type="checkbox"]')) view.appendChild(quiet('These boxes are ticked by editing the description: here, they are not where the description says they are.'));
    var tools = el('div', 'tk-row');
    var edit = el('a', 'cb-btn tk-small', 'Edit'); edit.href = '#/edit/' + t.id;
    tools.appendChild(edit);
    if (t.status !== 'Completed') {
      var finish = el('button', 'cb-btn tk-small', 'Mark it completed'); finish.type = 'button';
      finish.addEventListener('click', function () {
        finish.disabled = true;
        call(null, { action: 'save', id: t.id, status: 'Completed' }).then(function (r) {
          finish.disabled = false;
          if (r.status !== 200) { say(why(r, 'That did not save. Nothing was changed.')); return; }
          drawTask(r.body.task).focus();
          freshActivity(t.id);
          say('Completed.');
        });
      });
      tools.appendChild(finish);
    }
    var del = el('button', 'cb-btn tk-small', 'Delete'); del.type = 'button';
    del.addEventListener('click', function () {
      sure(tools, 'This deletes “' + t.name + '” for everybody. It cannot be put back.', 'Delete it', function (done) {
        call(null, { action: 'remove', id: t.id }).then(function (r) {
          done();
          if (r.status !== 200) { say(why(r, 'That did not delete. Nothing was changed.')); return; }
          say('Deleted.');
          step.go('#/');
        });
      }, del);
    });
    tools.appendChild(del);
    view.appendChild(tools);
    // Linked from: the tasks, comments, topics and office records that link here, which this reader can open (links.js).
    var from = linked.id === t.id && window.loveLinks.backlinks(linked.list, { p: 'tk', heading: heading });
    if (from) view.appendChild(from);
    // Comments: the conversation under the task, oldest first, with a box to add to it at the foot (comments.js).
    var talk = window.loveComments.section(commentsFor(t.id, landOn, function () { freshActivity(t.id); }));
    talkNow = talk;
    view.appendChild(talk.section);
    var landed = talk.landed;
    // Activity: every change to this task, newest first, as EspoCRM's stream showed it.
    var act = el('section', 'tk-activity');
    act.appendChild(heading(3, 'Activity'));
    var actList = el('ol', 'tk-acts');
    act.appendChild(actList);
    view.appendChild(act);
    fillActivity(actList, activity);
    if (landed) {
      // Opened from a notification about it: the comment is brought into view, and has the keyboard unless the page has just loaded.
      requestAnimationFrame(function () { landed.scrollIntoView({ block: 'center' }); });
      return landed;
    }
    return h;
  }
  /* What comments.js needs for this task's comments: tasks.js's own words,
     classes and way of asking /cb/tasks. */
  var talkNow = null;
  var COMMENT_HINT = 'Use the buttons above, or Markdown if you know it: **bold**, *italic*, lists, > quotes and links. An @ before a director’s username tells them, and @board, @director, @administrator or @moderator tells everybody on Tasks who holds that role. Type [[ to link a task, a topic or a record of the office. Ctrl or Cmd and Enter sends it.';
  /* An @mention of somebody tasks can be assigned to, drawn as their name,
     which opens their profile (links.js): the people a description or a
     comment tells. */
  function marked(into) { window.loveLinks.mentions(into, people, { p: 'tk', me: me ? me.handle : '', said: say, roles: roles(), mine: (me && me.roles) || [] }); return into; }
  /* The roles a description or comment can call with an @ (@board and the
     rest), which the server says (mentionableRoles): every reader of Tasks may
     call every role, and everybody on Tasks holding it is told. Never who. */
  function roles() { return (me && me.mention) || []; }
  // What [[ offers, asked of /cb/tasks by POST (links.js).
  function findLinks(q) { return call(null, { action: 'links', q: q }).then(function (r) { return r.status === 200 ? r.body.found : []; }); }
  function commentsFor(id, landOn, posted) {
    return { p: 'tk', id: id, heading: heading, comments: talked.id === id ? talked.list : null, landOn: landOn,
      admin: !!(me && me.admin), max: settings.commentMax, hint: COMMENT_HINT, when: when,
      ask: function (send) { return call(null, send); }, why: why, say: say, sure: sure,
      people: function () { return people; }, roles: roles, me: me ? me.handle : '', mark: marked,
      kept: function (list) { talked = { id: id, list: list }; }, posted: posted };
  }
  function fillActivity(into, list) {
    if (!into) return;
    into.textContent = '';
    if (!list) { into.appendChild(el('li', 'cb-quiet', 'Looking…')); return; }
    if (!list.length) { into.appendChild(el('li', 'cb-quiet', 'Nothing has changed since it was made, or since activity was first kept.')); return; }
    list.forEach(function (ev) {
      var li = el('li', 'tk-act');
      li.appendChild(el('p', null, actWords(ev)));
      li.appendChild(el('p', 'tk-when', when(ev.t)));
      into.appendChild(li);
    });
  }
  function freshActivity(id) {
    call('view=task&id=' + encodeURIComponent(id)).then(function (r) {
      if (r.status !== 200) return;
      fillActivity(view.querySelector('.tk-acts'), r.body.activity);
      // The comments too, when the page had none to keep, without moving the keyboard from one of them.
      if ((!talked.list || talked.id !== id) && talkNow) talkNow.set(r.body.comments || []);
    });
  }

  /* ── Activity and notifications, in words ─────────────────────────────── */

  function isMe(h) { return !!(me && h && fold(h) === fold(me.handle)); }
  function whoWords(h, cap) { return isMe(h) ? (cap ? 'You' : 'you') : h; }
  function and(list) { return list.length < 2 ? list.join('') : list.slice(0, -1).join(', ') + ' and ' + list[list.length - 1]; }
  var FIELD = { status: 'the status', priority: 'the priority', name: 'the name', start: 'the start', due: 'the due date' };
  /* What one change did, as a phrase: "changed the status from Started to Completed". */
  function changeWords(c) {
    var f = c.field;
    if (f === 'body') return 'edited the description';
    if (f === 'status' || f === 'priority') return 'changed ' + FIELD[f] + ' from ' + (c.from || 'nothing') + ' to ' + (c.to || 'nothing');
    if (f === 'name') return 'renamed it from “' + c.from + '” to “' + c.to + '”';
    if (f === 'start' || f === 'due') {
      if (!c.from) return 'set ' + FIELD[f] + ' to ' + dayWords(c.to);
      if (!c.to) return 'took ' + FIELD[f] + ' off';
      return 'moved ' + FIELD[f] + ' from ' + dayWords(c.from) + ' to ' + dayWords(c.to);
    }
    if (f === 'who') return c.to ? 'assigned it to ' + whoWords(c.to) : 'took it off ' + whoWords(c.from) + ', leaving it assigned to nobody';
    var from = c.from || [], to = c.to || [];
    var put = to.filter(function (x) { return !from.some(function (y) { return fold(y) === fold(x); }); });
    var off = from.filter(function (x) { return !to.some(function (y) { return fold(y) === fold(x); }); });
    var bits = [];
    if (f === 'with') {
      if (put.length) bits.push('put ' + and(put.map(function (x) { return whoWords(x); })) + ' on it');
      if (off.length) bits.push('took ' + and(off.map(function (x) { return whoWords(x); })) + ' off it');
    } else if (f === 'tags') {
      if (put.length) bits.push('tagged it ' + and(put));
      if (off.length) bits.push('took the tag' + (off.length > 1 ? 's ' : ' ') + and(off) + ' off');
    }
    return bits.join(' and ');
  }
  /* An event on a task's own page: "Ryan changed the status from … ; set the due date to …". */
  function actWords(ev) {
    var by = ev.by ? whoWords(ev.by, true) : 'Its recurring task';
    if (ev.kind === 'made') return by + ' made this task.';
    if (ev.kind === 'recurred') return 'Its recurring task made this task.';
    if (ev.kind === 'formed') return 'A form made this task, from a template.';
    if (ev.kind === 'ticked') return by + ' ' + (ev.box && ev.box.on ? 'ticked' : 'unticked') + ' “' + (ev.box ? ev.box.text : '') + '”.';
    if (ev.kind === 'commented') return by + ' commented.';
    return by + ' ' + ev.changes.map(changeWords).filter(Boolean).join('; ') + '.';
  }
  /* A notification's first line, from why it is in the reader's list. */
  // What an office comment is on: never its name, which the office keeps sealed.
  var OFFICE_WHAT = { contact: 'a contact', grant: 'a grant request', 'case': 'a case', mailing: 'a mailing', template: 'a template', email: 'an email' };
  function headWords(it) {
    var by = it.by ? whoWords(it.by, true) : null, name = '“' + it.name + '”';
    if (it.kind === 'office') return by + (it.why === 'mentioned' ? ' mentioned you in a comment on ' : it.why === 'commented' ? ' also commented on ' : ' commented on ')
      + (OFFICE_WHAT[it.what] || 'something') + ' in the office.';
    if (it.kind === 'recurred') return name + (it.why === 'assigned' ? ' came round, and is yours.' : it.why === 'added' ? ' came round, and you are on it.' : ' came round again.');
    if (it.kind === 'formed') return name + (it.why === 'assigned' ? ' came in from a form, and is yours.' : it.why === 'added' ? ' came in from a form, and you are on it.' : ' came in from a form.');
    if (it.why === 'assigned') return by + (it.kind === 'made' ? ' made ' + name + ' and assigned it to you.' : ' assigned ' + name + ' to you.');
    if (it.why === 'added') return by + (it.kind === 'made' ? ' made ' + name + ' and put you on it.' : ' put you on ' + name + '.');
    if (it.why === 'removed') return by + ' took you off ' + name + '.';
    if (it.kind === 'commented') return by + (it.why === 'mentioned' ? ' mentioned you in a comment on ' : it.why === 'commented' ? ' also commented on ' : ' commented on ') + name + '.';
    if (it.why === 'mentioned') return by + ' mentioned you in ' + name + '.';
    if (it.kind === 'made') return by + ' made ' + name + '.';
    if (it.kind === 'deleted') return by + ' deleted ' + name + '.';
    if (it.kind === 'ticked') return by + ' ' + (it.box && it.box.on ? 'ticked' : 'unticked') + ' a box on ' + name + '.';
    return by + ' changed ' + name + '.';
  }
  function detailWords(it) {
    if (it.kind === 'ticked') return '“' + (it.box ? it.box.text : '') + '”';
    if (it.kind !== 'changed') return '';
    // The headline already says the reader was assigned, put on or taken off, so the details leave that out.
    var said = it.why === 'assigned' || it.why === 'added' || it.why === 'removed';
    var notMe = function (l) { return (l || []).filter(function (x) { return !isMe(x); }); };
    var w = it.changes.map(function (c) {
      if (!said) return c;
      if (c.field === 'who' && (isMe(c.to) || isMe(c.from))) return null;
      if (c.field === 'with') return { field: 'with', from: notMe(c.from), to: notMe(c.to) };
      return c;
    }).filter(Boolean).map(changeWords).filter(Boolean).join('; ');
    return w ? w.charAt(0).toUpperCase() + w.slice(1) + '.' : '';
  }

  /* ── Notifications ─────────────────────────────────────────────────────── */

  function inboxView() {
    view.textContent = '';
    view.appendChild(quiet('Looking…'));
    return call('view=inbox').then(function (r) {
      if (r.status !== 200) return refused(r);
      took(r.body);
      setUnread(r.body.inbox.unread);
      return drawInbox(r.body.inbox, /[?&]show=unread/.test(location.hash));
    });
  }
  function drawInbox(box, onlyUnread) {
    view.textContent = '';
    var h = heading(2, 'Notifications');
    view.appendChild(h);
    view.appendChild(quiet('Changes to the tasks you are assigned to, are on or made, being taken off a task, and @mentions of you in a description, from the last 30 days. Your own changes are not here.'));
    // Due: worked out from the tasks now, nothing kept for it.
    if (box.due.length) {
      var dh = el('section', 'tk-due');
      dh.appendChild(heading(3, 'Due'));
      var dl = el('ul', 'tk-dues');
      box.due.forEach(function (t) {
        var li = el('li');
        var a = el('a', null, t.name); a.href = '#/t/' + t.id;
        li.appendChild(a);
        li.appendChild(tag(t.due < box.today ? 'OVERDUE' : t.due === box.today ? 'DUE TODAY' : 'DUE TOMORROW', t.due < box.today ? 'tk-late' : null));
        li.appendChild(el('span', 'tk-when', ' ' + dayWords(t.due)));
        dl.appendChild(li);
      });
      dh.appendChild(dl);
      view.appendChild(dh);
    }
    var tools = el('div', 'tk-row');
    var all = el('a', 'cb-btn tk-small', 'Every one (' + box.items.length + ')'); all.href = '#/inbox';
    var un = el('a', 'cb-btn tk-small', 'Unread (' + box.unread + ')'); un.href = '#/inbox?show=unread';
    (onlyUnread ? un : all).setAttribute('aria-current', 'page');
    tools.appendChild(all); tools.appendChild(un);
    if (box.unread) {
      var mark = el('button', 'cb-btn tk-small', 'Mark all read'); mark.type = 'button';
      mark.addEventListener('click', function () {
        mark.disabled = true;
        call(null, { action: 'inbox-read', all: true }).then(function (r) {
          mark.disabled = false;
          if (r.status !== 200) { say(why(r, 'That did not save. Nothing was changed.')); return; }
          setUnread(r.body.unread);
          box.items.forEach(function (x) { x.read = true; });
          box.unread = 0;
          drawInbox(box, onlyUnread).focus();
          say('All read.');
        });
      });
      tools.appendChild(mark);
    }
    view.appendChild(tools);
    var shown = box.items.filter(function (x) { return !onlyUnread || !x.read; });
    if (!shown.length) { view.appendChild(quiet(onlyUnread ? 'Nothing unread.' : 'Nothing yet.')); return h; }
    var list = el('ol', 'tk-inbox');
    shown.forEach(function (it) {
      var li = el('li', 'tk-note' + (it.read ? '' : ' tk-note--new'));
      var head = el('p', 'tk-note__head');
      if (!it.read) head.appendChild(tag('NEW', 'tk-new'));
      head.appendChild(document.createTextNode(headWords(it)));
      li.appendChild(head);
      var d = detailWords(it);
      if (d) li.appendChild(el('p', 'tk-note__what', d));
      var foot = el('p', 'tk-when', when(it.t) + ' ');
      if (it.kind !== 'deleted') {
        var a = el('a', null, it.kind === 'office' ? 'Open it in the office' : it.kind === 'commented' ? 'Open the comment' : 'Open the task');
        a.href = it.kind === 'office' ? officeHref(it) : taskHref(it.task, it.kind === 'commented' ? it.comment : null);
        // Opening it marks it read; the task opens whether or not that saves.
        if (!it.read) a.addEventListener('click', function () {
          call(null, { action: 'inbox-read', ids: [it.id] }).then(function (r) { if (r.status === 200) setUnread(r.body.unread); });
        });
        foot.appendChild(a);
      }
      if (!it.read) {
        var rd = el('button', 'cb-btn tk-small', 'Mark read'); rd.type = 'button';
        rd.addEventListener('click', function () {
          rd.disabled = true;
          call(null, { action: 'inbox-read', ids: [it.id] }).then(function (r) {
            if (r.status !== 200) { rd.disabled = false; say(why(r, 'That did not save. Nothing was changed.')); return; }
            setUnread(r.body.unread);
            it.read = true; box.unread = r.body.unread;
            drawInbox(box, onlyUnread).focus();
            say('Read.');
          });
        });
        foot.appendChild(document.createTextNode(' '));
        foot.appendChild(rd);
      }
      li.appendChild(foot);
      list.appendChild(li);
    });
    view.appendChild(list);
    return h;
  }

  /* ── Making and changing a task ───────────────────────────────────────── */

  function formView(id, from) {
    view.textContent = '';
    view.appendChild(quiet('Looking…'));
    var ask = id ? call('view=task&id=' + encodeURIComponent(id)) : from ? call('view=template&id=' + encodeURIComponent(from)) : call('view=list');
    return ask.then(function (r) {
      if (!id && from && r.status === 404) { from = null; return formView(null); }
      if (r.status !== 200) return refused(r);
      took(r.body);
      return drawForm(id ? r.body.task : null, from ? r.body.template : null);
    });
  }

  /* A form's pieces, for a task's form and a recurring task's: a labelled
     field, a select, a group of checkboxes, and the description with its
     preview, Save and Cancel. */
  function formKit(form) {
    function field(id, label, input) {
      var w = el('div', 'tk-field');
      var l = el('label', 'cb-lab', label); l.htmlFor = id; input.id = id;
      w.appendChild(l); w.appendChild(input);
      form.appendChild(w);
      return input;
    }
    function select(values, value, blank) {
      var s = el('select', 'cb-say tk-input');
      if (blank) { var o0 = el('option', null, blank); o0.value = ''; s.appendChild(o0); }
      values.forEach(function (v) { var o = el('option', null, v); o.value = v; s.appendChild(o); });
      s.value = value || '';
      return s;
    }
    function boxes(id, label, values, on, dots) {
      var fs = el('fieldset', 'tk-checks');
      fs.appendChild(el('legend', 'cb-lab', label));
      values.forEach(function (v, i) {
        var c = el('input'); c.type = 'checkbox'; c.id = id + '-' + i; c.value = v;
        c.checked = on.some(function (x) { return fold(x) === fold(v); });
        var l = el('label', 'tk-check'); l.htmlFor = c.id;
        l.appendChild(c); l.appendChild(document.createTextNode(' '));
        if (dots) l.appendChild(tagDot(v));
        l.appendChild(document.createTextNode(v));
        fs.appendChild(l);
      });
      form.appendChild(fs);
      return function () { return Array.prototype.filter.call(fs.querySelectorAll('input'), function (x) { return x.checked; }).map(function (x) { return x.value; }); };
    }
    function describe(value, goText, cancelTo) {
      var text = el('textarea', 'cb-say tk-text'); text.rows = 9; text.maxLength = settings.bodyMax; text.value = value;
      field('tk-body', 'Description', text);
      text.setAttribute('aria-describedby', 'tk-body-hint');
      window.loveLinks.attach(text, { ask: findLinks, said: say });
      window.loveLinks.people(text, { people: function () { return people; }, roles: roles, me: me ? me.handle : '', said: say });
      window.loveFormat.toolbar(text, { p: 'tk', said: say, checklist: true });
      var hint = el('p', 'cb-quiet tk-hint', 'Use the buttons above, or Markdown if you know it: **bold**, *italic*, lists, > quotes, `code`, links, and tables: a row to a line, a | between cells, and a line of dashes and bars under the first row. A list item starting [ ] or [x] is a checkbox, ticked on the task itself. Type @ and a name to mention a director, who is told, or a role (@board, @director, @administrator, @moderator) to tell everybody on Tasks who holds it, and [[ and part of a name to link a task, a forum topic or a record of the office.');
      hint.id = 'tk-body-hint';
      form.appendChild(hint);
      var preview = el('div', 'tk-body tk-preview'); preview.hidden = true;
      form.appendChild(preview);
      var row = el('div', 'tk-row');
      var go = el('button', 'cb-btn', goText); go.type = 'submit';
      var look = el('button', 'cb-btn', 'Preview'); look.type = 'button'; look.setAttribute('aria-pressed', 'false');
      var cancel = step.leave(el('a', 'cb-btn', 'Cancel')); cancel.href = cancelTo;
      row.appendChild(go); row.appendChild(look); row.appendChild(cancel);
      form.appendChild(row);
      var answer = el('p', 'tk-answer'); answer.setAttribute('role', 'status');
      form.appendChild(answer);
      look.addEventListener('click', function () {
        if (!preview.hidden) { preview.hidden = true; look.setAttribute('aria-pressed', 'false'); look.textContent = 'Preview'; return; }
        if (!text.value.trim()) { answer.textContent = 'There is no description to preview yet.'; return; }
        call(null, { action: 'preview', body: text.value }).then(function (r) {
          if (r.status !== 200) { answer.textContent = why(r, 'The preview could not be made just now.'); return; }
          preview.textContent = '';
          window.loveMarkdown.blocks(r.body.blocks, preview, { top: 2, prefix: 'tk' });
          marked(preview);
          preview.hidden = false;
          look.setAttribute('aria-pressed', 'true');
          look.textContent = 'Hide the preview';
        });
      });
      return { text: text, go: go, answer: answer };
    }
    return { field: field, select: select, boxes: boxes, describe: describe };
  }

  function drawForm(t, tpl) {
    view.textContent = '';
    if (t) step.up('#/t/' + t.id, '← ' + t.name); else step.up('#/', '← Back to the list');
    var h = heading(2, t ? 'Changing “' + t.name + '”' : tpl ? 'A new task from “' + tpl.name + '”' : 'A new task');
    view.appendChild(h);
    // A new task can start from a template, which fills the form; the fill-ins it holds are the director's to replace.
    if (!t && templates.length) {
      var pick = el('p', 'tk-row');
      var pl = el('label', 'cb-lab', 'Start from a template'); pl.htmlFor = 'tk-fromtpl';
      var ps = el('select', 'cb-say tk-input'); ps.id = 'tk-fromtpl';
      var p0 = el('option', null, 'None: a blank task'); p0.value = ''; ps.appendChild(p0);
      templates.forEach(function (x) { var o = el('option', null, x.name); o.value = x.id; ps.appendChild(o); });
      ps.value = tpl ? tpl.id : '';
      ps.addEventListener('change', function () {
        var id = ps.value;
        step.replace(id ? '#/new?from=' + encodeURIComponent(id) : '#/new');
        if (!id) { drawForm(null, null); view.querySelector('#tk-fromtpl').focus(); return; }
        call('view=template&id=' + encodeURIComponent(id)).then(function (r) {
          if (r.status !== 200) { say(why(r, 'That template could not be read just now.')); return; }
          took(r.body);
          drawForm(null, r.body.template);
          view.querySelector('#tk-fromtpl').focus();
          say('The form is filled from “' + r.body.template.name + '”.');
        });
      });
      pick.appendChild(pl); pick.appendChild(document.createTextNode(' ')); pick.appendChild(ps);
      view.appendChild(pick);
    }
    var fills = tpl ? leftFills(tpl.name + '\n' + (tpl.body || '')) : [];
    if (fills.length) view.appendChild(el('p', 'cb-quiet tk-hint', 'Replace ' + and(fills) + ' before making the task: '
      + (fills.indexOf('{name}') >= 0 ? '{name} with their name, ' : '') + 'and a link fill-in with a link, by typing [[ and part of a name.'));
    var form = el('form', 'tk-form');
    form.noValidate = true;
    var kit = formKit(form), field = kit.field, select = kit.select, boxes = kit.boxes;
    var name = el('input', 'cb-say tk-input'); name.maxLength = settings.nameMax; name.value = t ? t.name : tpl ? tpl.name : '';
    field('tk-name', 'Name', name);
    var status = field('tk-status', 'Status', select(settings.statuses, t ? t.status : settings.statuses[0]));
    var priority = field('tk-priority', 'Priority', select(settings.priorities, t ? t.priority : tpl ? tpl.priority : settings.priority));
    var choices = people.slice();
    if (t && t.who && choices.every(function (p) { return fold(p) !== fold(t.who); })) choices.push(t.who);
    var mine = me && choices.some(function (p) { return fold(p) === fold(me.handle); }) ? me.handle : '';
    var who = field('tk-whois', 'Assigned to', select(choices, t ? t.who : tpl && tpl.who ? tpl.who : mine, 'Nobody'));
    var start = el('input', 'cb-say tk-input'); start.type = 'date'; start.value = t && t.start ? t.start : tpl && tpl.startAfter != null ? plus(today(), tpl.startAfter) : '';
    field('tk-start', 'Starts', start);
    var due = el('input', 'cb-say tk-input'); due.type = 'date'; due.value = t && t.due ? t.due : tpl && tpl.dueAfter != null ? plus(today(), tpl.dueAfter) : '';
    field('tk-duein', 'Due', due);

    var withOn = t ? t.with : tpl ? tpl.with : [];
    var withAll = people.concat(withOn.filter(function (h) { return people.every(function (p) { return fold(p) !== fold(h); }); }));
    var withOf = boxes('tk-with', 'Also on it', withAll, withOn);
    var tagsOf = boxes('tk-tagbox', 'Tags', settings.tags, t ? t.tags : tpl ? tpl.tags : [], true);

    var desc = kit.describe(t ? t.body : tpl ? tpl.body || '' : '', t ? 'Save' : 'Make the task', t ? '#/t/' + t.id : '#/');
    var text = desc.text, go = desc.go, answer = desc.answer;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = { name: name.value, status: status.value, priority: priority.value, who: who.value || null,
        start: start.value || null, due: due.value || null, with: withOf(), tags: tagsOf(), body: text.value };
      var left = tpl && !t ? leftFills(v.name + '\n' + v.body) : [];
      if (left.length) { answer.textContent = 'Replace ' + and(left) + ' first: they are the template’s fill-ins, and this task is about somebody in particular.'; return; }
      // A change sends only what changed, so somebody else's change to another field stays.
      var send = { action: 'save' };
      if (t) {
        send.id = t.id;
        Object.keys(v).forEach(function (k) {
          var was = t[k] == null ? (k === 'body' ? '' : null) : t[k];
          if (JSON.stringify(was) !== JSON.stringify(v[k])) send[k] = v[k];
        });
        if (Object.keys(send).length === 2) { step.go('#/t/' + t.id); return; }
      } else { Object.keys(v).forEach(function (k) { send[k] = v[k]; }); if (tpl) send.tpl = tpl.id; }
      go.disabled = true;
      answer.textContent = 'Saving…';
      call(null, send).then(function (r) {
        go.disabled = false;
        if (r.status !== 200) { answer.textContent = why(r, 'That did not save. Nothing was changed.'); return; }
        step.go('#/t/' + r.body.task.id);
        say(t ? 'Saved.' : 'Made.');
      });
    });
    view.appendChild(form);
    return h;
  }

  /* ── Recurring tasks ───────────────────────────────────────────────────── */

  /* A task that comes round again: on its next day the server makes its task
     by itself, starting and due so many days after that day, and moves the day
     on. Switched off, it makes nothing. lib.mjs works out what each will make,
     and this only shows it. */
  function afterWords(n) { return n === 0 ? 'that day' : n === 1 ? 'a day after' : n + ' days after'; }

  function recurList() {
    view.textContent = '';
    view.appendChild(quiet('Looking…'));
    return call('view=list').then(function (r) {
      if (r.status !== 200) return refused(r);
      took(r.body);
      tasks = r.body.tasks || [];
      recurs = r.body.recurs || [];
      return drawRecurs();
    });
  }

  function drawRecurs() {
    view.textContent = '';
    var h = heading(2, 'Recurring tasks');
    view.appendChild(h);
    var on = recurs.filter(function (r) { return r.on; }).length;
    view.appendChild(el('p', 'tk-shown', recurs.length + ' recurring ' + (recurs.length === 1 ? 'task' : 'tasks') + ', ' + on + ' switched on'));
    view.appendChild(el('p', null, 'On its next day, each one switched on makes its task by itself, within the hour after midnight in Colorado, and its next day moves on.'));
    var row = el('p', 'tk-row');
    var make = el('a', 'cb-btn tk-small', 'New recurring task'); make.href = '#/recurring/new';
    row.appendChild(make);
    view.appendChild(row);
    if (!recurs.length) { view.appendChild(quiet('There are no recurring tasks yet.')); return h; }
    var box = el('div', 'tk-tablebox');
    box.tabIndex = 0; box.setAttribute('role', 'region'); box.setAttribute('aria-label', 'Recurring tasks');
    var t = el('table', 'tk-list');
    t.appendChild(el('caption', 'sr', 'Recurring tasks, by the next day each makes a task.'));
    var hr = el('tr');
    ['Recurring task', 'Comes round', 'Next', 'Each task', 'Assigned to', 'Switched on'].forEach(function (c) { var th = el('th', null, c); th.scope = 'col'; hr.appendChild(th); });
    var thead = el('thead'); thead.appendChild(hr); t.appendChild(thead);
    var tb = el('tbody');
    recurs.slice().sort(function (a, b) { return a.next < b.next ? -1 : a.next > b.next ? 1 : a.name.localeCompare(b.name); }).forEach(function (r) {
      var tr = el('tr');
      var td = el('td', 'tk-title');
      var a = el('a', null, r.name); a.href = '#/recurring/' + r.id;
      td.appendChild(a);
      tr.appendChild(td);
      tr.appendChild(el('td', null, r.repeats));
      tr.appendChild(el('td', 'tk-day', dayWords(r.next)));
      tr.appendChild(el('td', null, r.startAfter === r.dueAfter ? 'Starts and is due ' + afterWords(r.startAfter)
        : 'Starts ' + afterWords(r.startAfter) + ', due ' + afterWords(r.dueAfter)));
      tr.appendChild(el('td', null, r.who || '—'));
      var o = el('td');
      if (r.on) o.textContent = 'On'; else o.appendChild(tag('OFF', 'tk-off'));
      tr.appendChild(o);
      tb.appendChild(tr);
    });
    t.appendChild(tb);
    box.appendChild(t);
    view.appendChild(box);
    return h;
  }

  function recurView(id) {
    view.textContent = '';
    view.appendChild(quiet('Looking…'));
    return call('view=recur&id=' + encodeURIComponent(id)).then(function (r) {
      if (r.status !== 200) {
        if (r.status === 404) { view.textContent = ''; var h0 = heading(2, 'That recurring task has been deleted'); view.appendChild(h0); step.up('#/recurring', '← All recurring tasks'); return h0; }
        return refused(r);
      }
      took(r.body);
      return drawRecur(r.body.recur, r.body.made || []);
    });
  }

  function drawRecur(r, made) {
    view.textContent = '';
    step.up('#/recurring', '← All recurring tasks');
    var h = heading(2, r.name);
    view.appendChild(h);
    var dl = el('dl', 'tk-facts');
    function fact(k, v) { if (v == null || v === '') return; dl.appendChild(el('dt', null, k)); var dd = el('dd'); if (typeof v === 'string') dd.textContent = v; else dd.appendChild(v); dl.appendChild(dd); }
    fact('Switched on', r.on ? 'Yes' : 'No: it makes nothing until it is switched on');
    fact('Comes round', r.repeats);
    fact('Next day', dayWords(r.next));
    fact('Each task starts', afterWords(r.startAfter));
    fact('Each task is due', afterWords(r.dueAfter));
    fact('Assigned to', r.who || 'Nobody');
    if (r.with.length) fact('Also on it', r.with.join(', '));
    fact('Priority', r.priority);
    if (r.tags.length) fact('Tags', tagWords(r.tags));
    if (r.espo) fact('From', 'Brought over from EspoCRM');
    fact('Made', (r.by ? r.by + ', ' : '') + when(r.t));
    if (r.edited) fact('Changed', (r.editedBy ? r.editedBy + ', ' : '') + when(r.edited));
    view.appendChild(dl);

    view.appendChild(heading(3, 'Its next three'));
    if (!r.on) view.appendChild(quiet('Switched off, so none of these will be made until it is switched on.'));
    var ul = el('ul', 'tk-coming');
    r.coming.forEach(function (c) {
      ul.appendChild(el('li', null, dayWords(c.on) + ': “' + c.name + '”, starts ' + dayWords(c.start) + ', due ' + dayWords(c.due)));
    });
    view.appendChild(ul);

    var body = el('div', 'tk-body');
    if (r.blocks && r.blocks.length) { window.loveMarkdown.blocks(r.blocks, body, { top: 3, prefix: 'tk' }); marked(body); }
    else body.appendChild(quiet('No description.'));
    view.appendChild(heading(3, 'Each task’s description'));
    view.appendChild(body);

    var tools = el('div', 'tk-row');
    var edit = el('a', 'cb-btn tk-small', 'Edit'); edit.href = '#/recurring/edit/' + r.id;
    tools.appendChild(edit);
    var flip = el('button', 'cb-btn tk-small', r.on ? 'Switch off' : 'Switch on'); flip.type = 'button';
    flip.addEventListener('click', function () {
      flip.disabled = true;
      call(null, { action: 'recur-save', id: r.id, on: !r.on }).then(function (a) {
        flip.disabled = false;
        if (a.status !== 200) { say(why(a, 'That did not save. Nothing was changed.')); return; }
        drawRecur(a.body.recur, made).focus();
        say(a.body.recur.on ? 'Switched on. Its next task is made on ' + dayWords(a.body.recur.next) + '.' : 'Switched off. It makes nothing until it is switched on.');
      });
    });
    tools.appendChild(flip);
    var del = el('button', 'cb-btn tk-small', 'Delete'); del.type = 'button';
    del.addEventListener('click', function () {
      var stay = made.length === 0 ? 'It has made no tasks here.' : made.length === 1 ? 'The task it made stays.' : 'The ' + made.length + ' tasks it made stay.';
      sure(tools, 'This deletes the recurring task “' + r.name + '” for everybody, and it makes no more tasks. ' + stay + ' It cannot be put back.', 'Delete it', function (done) {
        call(null, { action: 'recur-remove', id: r.id }).then(function (a) {
          done();
          if (a.status !== 200) { say(why(a, 'That did not delete. Nothing was changed.')); return; }
          say('Deleted. The tasks it made stay.');
          step.go('#/recurring');
        });
      }, del);
    });
    tools.appendChild(del);
    view.appendChild(tools);

    view.appendChild(heading(3, 'Tasks it has made (' + made.length + ')'));
    if (!made.length) view.appendChild(quiet(r.espo ? 'None here yet. The tasks EspoCRM made from it were brought over as tasks of their own.' : 'None yet.'));
    else {
      var ml = el('ul', 'tk-made');
      made.slice().sort(function (a, b) { return a.on < b.on ? 1 : a.on > b.on ? -1 : 0; }).forEach(function (t) {
        var li = el('li', isDone(t) ? 'tk-done' : null);
        var a = el('a', null, t.name); a.href = '#/t/' + t.id;
        li.appendChild(a);
        li.appendChild(document.createTextNode(', ' + dayWords(t.on) + ', ' + t.status));
        if (overdue(t)) li.appendChild(tag('OVERDUE', 'tk-late'));
        ml.appendChild(li);
      });
      view.appendChild(ml);
    }
    return h;
  }

  function recurFormView(id) {
    view.textContent = '';
    view.appendChild(quiet('Looking…'));
    var ask = id ? call('view=recur&id=' + encodeURIComponent(id)) : call('view=list');
    return ask.then(function (r) {
      if (r.status !== 200) return refused(r);
      took(r.body);
      return drawRecurForm(id ? r.body.recur : null);
    });
  }

  function drawRecurForm(r) {
    view.textContent = '';
    if (r) step.up('#/recurring/' + r.id, '← ' + r.name); else step.up('#/recurring', '← All recurring tasks');
    var h = heading(2, r ? 'Changing “' + r.name + '”' : 'A new recurring task');
    view.appendChild(h);
    var form = el('form', 'tk-form');
    form.noValidate = true;
    var kit = formKit(form), field = kit.field, select = kit.select, boxes = kit.boxes;
    var name = el('input', 'cb-say tk-input'); name.maxLength = settings.nameMax; name.value = r ? r.name : '';
    field('tk-name', 'Name', name);
    name.setAttribute('aria-describedby', 'tk-name-hint');
    var nameHint = el('p', 'cb-quiet tk-hint', '{week}, {year} and {month} are filled in from the day each task is made: “Week in Review for Week {week} of {year}”. {week} is the ISO week, Monday to Sunday.');
    nameHint.id = 'tk-name-hint';
    form.appendChild(nameHint);
    var repeats = field('tk-repeats', 'Comes round', select(settings.repeats, r ? r.repeats : settings.repeats[0]));
    var next = el('input', 'cb-say tk-input'); next.type = 'date'; next.value = r ? r.next : today();
    field('tk-next', 'Next day it makes a task', next);
    function days(id, label, value) {
      var n = el('input', 'cb-say tk-input'); n.type = 'number'; n.min = '0'; n.max = String(settings.afterMax); n.step = '1'; n.inputMode = 'numeric'; n.value = String(value);
      return field(id, label, n);
    }
    var startAfter = days('tk-startafter', 'Each task starts, days after that day', r ? r.startAfter : 0);
    var dueAfter = days('tk-dueafter', 'Each task is due, days after that day', r ? r.dueAfter : 0);
    var priority = field('tk-priority', 'Priority', select(settings.priorities, r ? r.priority : settings.priority));
    var choices = people.slice();
    if (r && r.who && choices.every(function (p) { return fold(p) !== fold(r.who); })) choices.push(r.who);
    var who = field('tk-whois', 'Assigned to', select(choices, r ? r.who : (me && choices.some(function (p) { return fold(p) === fold(me.handle); }) ? me.handle : ''), 'Nobody'));
    var withOn = r ? r.with : [];
    var withAll = people.concat(withOn.filter(function (x) { return people.every(function (p) { return fold(p) !== fold(x); }); }));
    var withOf = boxes('tk-with', 'Also on it', withAll, withOn);
    var tagsOf = boxes('tk-tagbox', 'Tags', settings.tags, r ? r.tags : [], true);
    var onWrap = el('label', 'tk-check tk-switch');
    var on = el('input'); on.type = 'checkbox'; on.id = 'tk-on'; on.checked = r ? r.on : true;
    onWrap.htmlFor = 'tk-on';
    onWrap.appendChild(on);
    onWrap.appendChild(document.createTextNode(' Switched on: it makes its task on its next day'));
    form.appendChild(onWrap);
    var desc = kit.describe(r ? r.body : '', r ? 'Save' : 'Make the recurring task', r ? '#/recurring/' + r.id : '#/recurring');
    var text = desc.text, go = desc.go, answer = desc.answer;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var whole = function (x) { return x.value.trim() === '' ? 0 : Number(x.value); };
      var v = { name: name.value, repeats: repeats.value, next: next.value || null, startAfter: whole(startAfter), dueAfter: whole(dueAfter),
        priority: priority.value, who: who.value || null, with: withOf(), tags: tagsOf(), on: on.checked, body: text.value };
      // A change sends only what changed, so somebody else's change to another field stays.
      var send = { action: 'recur-save' };
      if (r) {
        send.id = r.id;
        Object.keys(v).forEach(function (k) {
          var was = r[k] == null ? (k === 'body' ? '' : null) : r[k];
          if (JSON.stringify(was) !== JSON.stringify(v[k])) send[k] = v[k];
        });
        if (Object.keys(send).length === 2) { step.go('#/recurring/' + r.id); return; }
      } else Object.keys(v).forEach(function (k) { send[k] = v[k]; });
      go.disabled = true;
      answer.textContent = 'Saving…';
      call(null, send).then(function (a) {
        go.disabled = false;
        if (a.status !== 200) { answer.textContent = why(a, 'That did not save. Nothing was changed.'); return; }
        step.go('#/recurring/' + a.body.recur.id);
        say(r ? 'Saved.' : 'Made. Its first task is made on ' + dayWords(a.body.recur.next) + '.');
      });
    });
    view.appendChild(form);
    return h;
  }

  /* ── Templates ─────────────────────────────────────────────────────────── */

  /* A task to start from (Ryan's ask, 2026-10-22). Its name and description can
     hold fill-ins: a task made from it here leaves them in the form for the
     director to replace, and the office's intake fills them from a form, which
     is how a join request's onboarding task is made. lib.mjs checks them; this
     only shows them. */
  function fillWords() { return and((settings.fillIns || []).map(function (x) { return '{' + x + '}'; })); }
  function leftFills(text) {
    var out = [];
    String(text || '').replace(/\{(\w+)\}/g, function (m, k) { if ((settings.fillIns || []).indexOf(k) >= 0 && out.indexOf(m) < 0) out.push(m); return m; });
    return out;
  }
  function tplDay(n) { return n == null ? 'on no day' : n === 0 ? 'the day it is made' : n === 1 ? 'a day after it is made' : n + ' days after it is made'; }

  function tplList() {
    view.textContent = '';
    view.appendChild(quiet('Looking…'));
    return call('view=list').then(function (r) {
      if (r.status !== 200) return refused(r);
      took(r.body);
      tasks = r.body.tasks || [];
      return drawTpls();
    });
  }

  function drawTpls() {
    view.textContent = '';
    var h = heading(2, 'Templates');
    view.appendChild(h);
    view.appendChild(el('p', 'tk-shown', templates.length + (templates.length === 1 ? ' template' : ' templates')));
    view.appendChild(el('p', null, 'A template is a task to start from: choose it under Start from a template when you make a new task. Its name and description can hold ' + fillWords()
      + ', which you replace in the form. The office fills them itself when a form names a template, as the Join form does for each new community member’s onboarding task.'));
    var row = el('p', 'tk-row');
    var make = el('a', 'cb-btn tk-small', 'New template'); make.href = '#/templates/new';
    row.appendChild(make);
    view.appendChild(row);
    if (!templates.length) { view.appendChild(quiet('There are no templates yet.')); return h; }
    var box = el('div', 'tk-tablebox');
    box.tabIndex = 0; box.setAttribute('role', 'region'); box.setAttribute('aria-label', 'Templates');
    var tb0 = el('table', 'tk-list');
    tb0.appendChild(el('caption', 'sr', 'Templates, by name.'));
    var hr = el('tr');
    ['Template', 'Each task', 'Assigned to', 'Tags'].forEach(function (c) { var th = el('th', null, c); th.scope = 'col'; hr.appendChild(th); });
    var thead = el('thead'); thead.appendChild(hr); tb0.appendChild(thead);
    var tb = el('tbody');
    templates.forEach(function (p) {
      var tr = el('tr');
      var td = el('td', 'tk-title');
      var a = el('a', null, p.name); a.href = '#/templates/' + p.id;
      td.appendChild(a);
      tr.appendChild(td);
      tr.appendChild(el('td', null, (p.startAfter == null ? 'No start day' : 'Starts ' + tplDay(p.startAfter)) + ', ' + (p.dueAfter == null ? 'no due day' : 'due ' + tplDay(p.dueAfter))));
      tr.appendChild(el('td', null, p.who || '—'));
      var tg = el('td');
      if (p.tags.length) tg.appendChild(tagWords(p.tags)); else tg.textContent = '—';
      tr.appendChild(tg);
      tb.appendChild(tr);
    });
    tb0.appendChild(tb);
    box.appendChild(tb0);
    view.appendChild(box);
    return h;
  }

  function tplView(id) {
    view.textContent = '';
    view.appendChild(quiet('Looking…'));
    return call('view=template&id=' + encodeURIComponent(id)).then(function (r) {
      if (r.status !== 200) {
        if (r.status === 404) { view.textContent = ''; var h0 = heading(2, 'That template has been deleted'); view.appendChild(h0); step.up('#/templates', '← All templates'); return h0; }
        return refused(r);
      }
      took(r.body);
      return drawTpl(r.body.template, r.body.made || []);
    });
  }

  function drawTpl(p, made) {
    view.textContent = '';
    step.up('#/templates', '← All templates');
    var h = heading(2, p.name);
    view.appendChild(h);
    var dl = el('dl', 'tk-facts');
    function fact(k, v) { if (v == null || v === '') return; dl.appendChild(el('dt', null, k)); var dd = el('dd'); if (typeof v === 'string') dd.textContent = v; else dd.appendChild(v); dl.appendChild(dd); }
    fact('Each task starts', tplDay(p.startAfter));
    fact('Each task is due', tplDay(p.dueAfter));
    fact('Assigned to', p.who || 'Nobody');
    if (p.with.length) fact('Also on it', p.with.join(', '));
    fact('Priority', p.priority);
    if (p.tags.length) fact('Tags', tagWords(p.tags));
    fact('Made', p.by ? p.by + ', ' + when(p.t) : 'One Tasks started with');
    if (p.edited) fact('Changed', (p.editedBy ? p.editedBy + ', ' : '') + when(p.edited));
    view.appendChild(dl);
    var fills = leftFills(p.name + '\n' + (p.body || ''));
    if (fills.length) view.appendChild(el('p', null, 'It holds ' + and(fills) + ', which you replace when you make a task from it, and a form’s intake fills in.'));

    var body = el('div', 'tk-body');
    if (p.blocks && p.blocks.length) { window.loveMarkdown.blocks(p.blocks, body, { top: 3, prefix: 'tk' }); marked(body); }
    else body.appendChild(quiet('No description.'));
    view.appendChild(heading(3, 'Each task’s description'));
    view.appendChild(body);

    var tools = el('div', 'tk-row');
    var use = el('a', 'cb-btn tk-small', 'Make a task from it'); use.href = '#/new?from=' + encodeURIComponent(p.id);
    tools.appendChild(use);
    var edit = el('a', 'cb-btn tk-small', 'Edit'); edit.href = '#/templates/edit/' + p.id;
    tools.appendChild(edit);
    var del = el('button', 'cb-btn tk-small', 'Delete'); del.type = 'button';
    del.addEventListener('click', function () {
      var stay = made.length === 0 ? 'No task has been made from it.' : made.length === 1 ? 'The task made from it stays.' : 'The ' + made.length + ' tasks made from it stay.';
      sure(tools, 'This deletes the template “' + p.name + '” for everybody. ' + stay + ' A form whose tasks are made from it makes none until it has a template again. It cannot be put back.', 'Delete it', function (done) {
        call(null, { action: 'template-remove', id: p.id }).then(function (a) {
          done();
          if (a.status !== 200) { say(why(a, 'That did not delete. Nothing was changed.')); return; }
          say('Deleted. The tasks made from it stay.');
          step.go('#/templates');
        });
      }, del);
    });
    tools.appendChild(del);
    view.appendChild(tools);

    view.appendChild(heading(3, 'Tasks made from it (' + made.length + ')'));
    if (!made.length) view.appendChild(quiet('None yet.'));
    else {
      var ml = el('ul', 'tk-made');
      made.slice().sort(function (a, b) { return b.t - a.t; }).forEach(function (t) {
        var li = el('li', isDone(t) ? 'tk-done' : null);
        var a = el('a', null, t.name); a.href = '#/t/' + t.id;
        li.appendChild(a);
        li.appendChild(document.createTextNode(', ' + when(t.t) + ', ' + t.status));
        if (overdue(t)) li.appendChild(tag('OVERDUE', 'tk-late'));
        ml.appendChild(li);
      });
      view.appendChild(ml);
    }
    return h;
  }

  function tplFormView(id) {
    view.textContent = '';
    view.appendChild(quiet('Looking…'));
    var ask = id ? call('view=template&id=' + encodeURIComponent(id)) : call('view=list');
    return ask.then(function (r) {
      if (r.status !== 200) return refused(r);
      took(r.body);
      return drawTplForm(id ? r.body.template : null);
    });
  }

  function drawTplForm(p) {
    view.textContent = '';
    if (p) step.up('#/templates/' + p.id, '← ' + p.name); else step.up('#/templates', '← All templates');
    var h = heading(2, p ? 'Changing “' + p.name + '”' : 'A new template');
    view.appendChild(h);
    var form = el('form', 'tk-form');
    form.noValidate = true;
    var kit = formKit(form), field = kit.field, select = kit.select, boxes = kit.boxes;
    var name = el('input', 'cb-say tk-input'); name.maxLength = settings.nameMax; name.value = p ? p.name : '';
    field('tk-name', 'Name', name);
    name.setAttribute('aria-describedby', 'tk-name-hint');
    var nameHint = el('p', 'cb-quiet tk-hint', 'A name or description can hold ' + fillWords() + ': “Onboard {name} into Community”. {name} is somebody’s name; the others are links to their records in the office, so they go in the description.');
    nameHint.id = 'tk-name-hint';
    form.appendChild(nameHint);
    function days(id, label, value) {
      var n = el('input', 'cb-say tk-input'); n.type = 'number'; n.min = '0'; n.max = String(settings.afterMax); n.step = '1'; n.inputMode = 'numeric';
      n.value = value == null ? '' : String(value);
      n.setAttribute('aria-describedby', 'tk-days-hint');
      return field(id, label, n);
    }
    var startAfter = days('tk-startafter', 'Each task starts, days after it is made', p ? p.startAfter : 0);
    var dueAfter = days('tk-dueafter', 'Each task is due, days after it is made', p ? p.dueAfter : null);
    var daysHint = el('p', 'cb-quiet tk-hint', 'Leave one empty for no day.');
    daysHint.id = 'tk-days-hint';
    form.appendChild(daysHint);
    var priority = field('tk-priority', 'Priority', select(settings.priorities, p ? p.priority : settings.priority));
    var choices = people.slice();
    if (p && p.who && choices.every(function (x) { return fold(x) !== fold(p.who); })) choices.push(p.who);
    var who = field('tk-whois', 'Assigned to', select(choices, p ? p.who : '', 'Nobody'));
    var withOn = p ? p.with : [];
    var withAll = people.concat(withOn.filter(function (x) { return people.every(function (q) { return fold(q) !== fold(x); }); }));
    var withOf = boxes('tk-with', 'Also on it', withAll, withOn);
    var tagsOf = boxes('tk-tagbox', 'Tags', settings.tags, p ? p.tags : [], true);
    var desc = kit.describe(p ? p.body : '', p ? 'Save' : 'Make the template', p ? '#/templates/' + p.id : '#/templates');
    var text = desc.text, go = desc.go, answer = desc.answer;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var dayOf = function (x) { return x.value.trim() === '' ? null : Number(x.value); };
      var v = { name: name.value, startAfter: dayOf(startAfter), dueAfter: dayOf(dueAfter),
        priority: priority.value, who: who.value || null, with: withOf(), tags: tagsOf(), body: text.value };
      var send = { action: 'template-save' };
      if (p) {
        send.id = p.id;
        Object.keys(v).forEach(function (k) {
          var was = p[k] == null ? (k === 'body' ? '' : null) : p[k];
          if (JSON.stringify(was) !== JSON.stringify(v[k])) send[k] = v[k];
        });
        if (Object.keys(send).length === 2) { step.go('#/templates/' + p.id); return; }
      } else Object.keys(v).forEach(function (k) { send[k] = v[k]; });
      go.disabled = true;
      answer.textContent = 'Saving…';
      call(null, send).then(function (a) {
        go.disabled = false;
        if (a.status !== 200) { answer.textContent = why(a, 'That did not save. Nothing was changed.'); return; }
        step.go('#/templates/' + a.body.template.id);
        say(p ? 'Saved.' : 'Made.');
      });
    });
    view.appendChild(form);
    return h;
  }

  /* ── Refusals ──────────────────────────────────────────────────────────── */

  function refused(r) {
    view.textContent = '';
    var h = heading(2, r.status === 403 ? 'Tasks are for our directors, board members and administrators' : 'Tasks');
    view.appendChild(h);
    view.appendChild(el('p', null, why(r, 'Tasks could not be read just now.')));
    if (r.status === 401) view.appendChild(el('p', null, 'Your pass has stopped working, which happens when a password changes. Sign on to the CB again from the radio in the corner.'));
    return h;
  }
  function guest() {
    view.textContent = '';
    var h = heading(2, 'Sign on to see tasks');
    view.appendChild(h);
    view.appendChild(el('p', null, 'Tasks are the team’s to-do list, for our directors, board members and administrators. Sign on to the CB with the bar in the corner of your screen, with your claimed username.'));
    var p = el('p'); var a = el('a', null, 'What tasks keep'); a.href = '/privacy.html#tasks'; p.appendChild(a);
    view.appendChild(p);
    return h;
  }

  /* ── Where in tasks an address is ─────────────────────────────────────── */

  function route() {
    step.arrive();
    dressNow();
    var hash = location.hash || '';
    if (hash && hash.indexOf('#/') !== 0) hash = '';
    var parts = hash.slice(1).split('?')[0].split('/').filter(Boolean);
    var done;
    if (!cbState()) done = Promise.resolve(guest());
    else if (parts[0] === 'edit' && parts[1]) done = formView(parts[1]);
    else if (parts[0] === 't' && parts[1]) done = taskView(parts[1], parts[2] === 'c' ? parts[3] : null);
    else if (parts[0] === 'new') { var fromM = /[?&]from=(p[A-Za-z0-9_-]{12})(?:&|$)/.exec(hash); done = formView(null, fromM ? fromM[1] : null); }
    else if (parts[0] === 'board') done = tasksView('board');
    else if (parts[0] === 'timeline') done = tasksView('timeline');
    else if (parts[0] === 'feed') done = tasksView('feed');
    else if (parts[0] === 'recurring' && parts[1] === 'new') done = recurFormView(null);
    else if (parts[0] === 'recurring' && parts[1] === 'edit' && parts[2]) done = recurFormView(parts[2]);
    else if (parts[0] === 'recurring' && parts[1]) done = recurView(parts[1]);
    else if (parts[0] === 'recurring') done = recurList();
    else if (parts[0] === 'templates' && parts[1] === 'new') done = tplFormView(null);
    else if (parts[0] === 'templates' && parts[1] === 'edit' && parts[2]) done = tplFormView(parts[2]);
    else if (parts[0] === 'templates' && parts[1]) done = tplView(parts[1]);
    else if (parts[0] === 'templates') done = tplList();
    else if (parts[0] === 'inbox') done = inboxView();
    else done = tasksView('list');
    [navList, navBoard, navTime, navFeed, navRecur, navTpl, navNew, navInbox].forEach(function (a) { a.removeAttribute('aria-current'); });
    if (parts[0] === 'new') navNew.setAttribute('aria-current', 'page');
    else if (parts[0] === 'inbox') navInbox.setAttribute('aria-current', 'page');
    else if (parts[0] === 'board') navBoard.setAttribute('aria-current', 'page');
    else if (parts[0] === 'timeline') navTime.setAttribute('aria-current', 'page');
    else if (parts[0] === 'feed') navFeed.setAttribute('aria-current', 'page');
    else if (parts[0] === 'recurring' && !parts[1]) navRecur.setAttribute('aria-current', 'page');
    else if (parts[0] === 'templates' && !parts[1]) navTpl.setAttribute('aria-current', 'page');
    else if (!parts.length) navList.setAttribute('aria-current', 'page');
    // The keyboard goes to the new view's heading, or back where it was.
    step.land(done);
  }
  window.addEventListener('hashchange', function () { if ((location.hash || '').indexOf('#/') === 0 || !location.hash) route(); });
  route();
})();

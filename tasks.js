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
    function ready() { if (--waiting === 0) host.style.visibility = ''; }
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
  var navRecur = el('a', 'cb-btn tk-navlink', 'Recurring'); navRecur.href = '#/recurring';
  var navNew = el('a', 'cb-btn tk-navlink', 'New task'); navNew.href = '#/new';
  nav.appendChild(navList); nav.appendChild(navBoard); nav.appendChild(navTime); nav.appendChild(navRecur); nav.appendChild(navNew);
  bar.appendChild(nav);
  box.appendChild(bar);

  var view = el('div', 'tk-view');
  box.appendChild(view);
  var said = el('p', 'tk-said');
  said.setAttribute('role', 'status');
  box.appendChild(said);
  function say(t) { said.textContent = ''; setTimeout(function () { said.textContent = t || ''; }, 30); }

  mount.textContent = '';
  mount.appendChild(host);

  /* Wearing the radio's theme, as the forums do: what its host wears, or
     call.js's own answer for what the radio would wear. */
  function dressNow() {
    var lc = window.loveCall, r = document.querySelector('.cb-host'), look;
    if (r && r.getAttribute('data-scheme')) look = r.getAttribute('data-scheme');
    else if (lc && lc.schemeFor) { var s = cbState(); look = lc.schemeFor((s && s.scheme) || 'auto'); }
    if (look) host.setAttribute('data-scheme', look);
    host.setAttribute('data-motion', 'off');
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

  var settings = null, people = [], me = null, tasks = [], views = [], recurs = [];
  function took(b) {
    if (b.settings) settings = b.settings;
    if (b.people) people = b.people;
    if (b.me) me = b.me;
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

  /* ── Pieces ────────────────────────────────────────────────────────────── */

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

  var COLUMNS = [['name', 'Task'], ['status', 'Status'], ['priority', 'Priority'], ['who', 'Assigned to'], ['start', 'Starts'], ['due', 'Due'], ['tags', 'Tags']];
  var DUES = [['', 'Any time'], ['overdue', 'Overdue'], ['today', 'Due today'], ['week', 'Due in the next 7 days'], ['month', 'Due this month'], ['none', 'No due date']];
  // What a board's columns can be, and the field a move between them changes.
  var GROUPS = [['status', 'Status'], ['priority', 'Priority'], ['who', 'Assigned to']];

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
    if (mode === 'timeline' && f.span !== 14) parts.push('span=' + f.span);
    // A timeline on this week keeps no day, so a saved one is always this week.
    if (mode === 'timeline' && f.from && mondayOf(f.from) !== mondayOf(today())) parts.push('from=' + mondayOf(f.from));
    return (mode === 'board' ? '#/board' : mode === 'timeline' ? '#/timeline' : '#/') + (parts.length ? '?' + parts.join('&') : '');
  }
  function writeQuery(f, mode) {
    var h = addressOf(f, mode);
    if (location.hash !== h) history.replaceState(null, '', h);
  }
  function modeOf(hash) { var m = /^#\/(board|timeline)(\?|$)/.exec(hash || ''); return m ? m[1] : 'list'; }
  /* Until somebody picks statuses, the list shows the ones still to do, and a
     board by status shows every status but the ones it hides (Canceled). */
  function statusesOf(f, mode) {
    if (f.status) return f.status;
    if (mode === 'board' && f.cols === 'status') return settings.statuses.filter(function (s) { return (settings.boardHides || []).indexOf(s) < 0; });
    return settings.statuses.filter(function (s) { return settings.done.indexOf(s) < 0; });
  }

  /* Whether a task passes every filter, leaving out `skip`, so each filter's
     own counts say what picking that value would show. */
  function passes(t, f, skip, mode) {
    if (skip !== 'q' && f.q) { var w = fold(f.q); if (fold(t.name).indexOf(w) < 0) return false; }
    if (skip !== 'status' && statusesOf(f, mode).indexOf(t.status) < 0) return false;
    if (skip !== 'priority' && f.priority && f.priority.indexOf(t.priority) < 0) return false;
    if (skip !== 'tags' && f.tags && !t.tags.some(function (x) { return f.tags.indexOf(x) >= 0; })) return false;
    if (skip !== 'who' && f.who) {
      if (f.who === '-') { if (t.who) return false; }
      else if (fold(t.who) !== fold(f.who === '@me' && me ? me.handle : f.who)) return false;
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
      if (f.sort === 'tags') return (v || []).join(', ').toLowerCase();
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
    var h = heading(2, mode === 'board' ? 'Tasks, as a board' : mode === 'timeline' ? 'Tasks, on a timeline' : 'Tasks');
    view.appendChild(h);
    var saved = el('div', 'tk-saved');
    var filters = el('form', 'tk-filters');
    filters.setAttribute('aria-label', 'Filter the tasks');
    filters.addEventListener('submit', function (e) { e.preventDefault(); });
    var shown = el('p', 'tk-shown');
    shown.setAttribute('aria-live', 'polite');
    var out = el('div', mode === 'board' ? 'tk-boardbox' : mode === 'timeline' ? 'tk-tlbox' : 'tk-tablebox');
    // It scrolls sideways on a narrow screen, so a keyboard can reach it.
    out.tabIndex = 0;
    out.setAttribute('role', 'region');
    out.setAttribute('aria-label', mode === 'board' ? 'The board' : mode === 'timeline' ? 'The timeline' : 'The tasks');
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
    function drawOut(focus) { if (mode === 'board') drawBoard(focus); else if (mode === 'timeline') drawTimeline(); else drawTable(focus); }

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
        location.hash = v ? v.address : (mode === 'board' ? '#/board' : '#/');
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
      var hl = el('label', 'cb-lab', 'Assigned to'); hl.htmlFor = 'tk-who';
      var hs = el('select', 'cb-say tk-input'); hs.id = 'tk-who';
      var nWho = counted(f, 'who', function (t) { return t.who ? fold(t.who) : '-'; }, mode);
      var opt = function (v, label) { var o = el('option', null, label); o.value = v; hs.appendChild(o); };
      opt('', 'Anybody (' + Object.keys(nWho).reduce(function (a, k) { return a + nWho[k]; }, 0) + ')');
      if (me) opt('@me', 'Me (' + (nWho[fold(me.handle)] || 0) + ')');
      people.forEach(function (p) { opt(p, p + ' (' + (nWho[fold(p)] || 0) + ')'); });
      opt('-', 'Nobody (' + (nWho['-'] || 0) + ')');
      hs.value = f.who;
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
      var clear = el('a', 'cb-btn tk-small', 'Clear the filters'); clear.href = mode === 'board' ? '#/board' : mode === 'timeline' ? '#/timeline' : '#/';
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
        l.appendChild(document.createTextNode(' ' + v + ' '));
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

    function drawTable(focusSort) {
      var list = ordered(tasks.filter(function (t) { return passes(t, f, null, mode); }), f);
      shown.textContent = list.length + ' of ' + tasks.length + ' tasks';
      out.textContent = '';
      if (!list.length) { out.appendChild(quiet(tasks.length ? 'No task matches every filter.' : 'There are no tasks yet.')); return; }
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
          drawTable(c[0]);
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
        td.appendChild(a);
        tr.appendChild(td);
        tr.appendChild(el('td', null, x.status));
        var pr = el('td', null, x.priority);
        if (x.priority === 'High' || x.priority === 'Urgent') pr.className = 'tk-high';
        tr.appendChild(pr);
        tr.appendChild(el('td', null, x.who || '—'));
        tr.appendChild(el('td', 'tk-day', dayWords(x.start)));
        var due = el('td', 'tk-day', dayWords(x.due));
        if (overdue(x)) due.appendChild(tag('OVERDUE', 'tk-late'));
        tr.appendChild(due);
        tr.appendChild(el('td', 'tk-tagcell', x.tags.join(', ')));
        tb.appendChild(tr);
      });
      t.appendChild(tb);
      out.appendChild(t);
      if (focusSort) { var sb = t.querySelector('[data-sort="' + focusSort + '"]'); if (sb) sb.focus(); }
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
        hd.appendChild(document.createTextNode(c[1] + ' '));
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
      if (f.cols !== 'status') bits.push(t.status);
      if (f.cols !== 'priority' && t.priority !== settings.priority) bits.push(t.priority);
      if (f.cols !== 'who') bits.push(t.who || 'Nobody');
      if (t.due) bits.push('due ' + dayWords(t.due));
      facts.textContent = bits.join(' · ');
      if (overdue(t)) facts.appendChild(tag('OVERDUE', 'tk-late'));
      if ((t.priority === 'High' || t.priority === 'Urgent') && f.cols !== 'priority') facts.classList.add('tk-high');
      li.appendChild(facts);
      if (t.tags.length) li.appendChild(el('p', 'tk-card__tags', t.tags.join(', ')));
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
    function drawTimeline() {
      var a = mondayOf(f.from || today()), span = f.span, b = plus(a, span - 1), now = today();
      var all = tasks.filter(function (t) { return passes(t, f, null, mode); });
      var on = all.filter(function (t) { return onDays(t, a, b); });
      var undated = all.filter(function (t) { return !spanOf(t); }).length;
      shown.textContent = on.length + ' of ' + all.length + ' tasks fall between ' + dayWords(a) + ' and ' + dayWords(b)
        + (undated ? '; ' + undated + ' have no start or due day, so no place on it' : '');
      if (along) along.querySelectorAll('button')[1].setAttribute('aria-pressed', String(a === mondayOf(now)));
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
      var rows = people.slice();
      on.forEach(function (t) { if (t.who && rows.every(function (p) { return fold(p) !== fold(t.who); })) rows.push(t.who); });
      rows = rows.map(function (p) { return [p, p]; });
      if (on.some(function (t) { return !t.who; })) rows.push(['', 'Nobody']);
      var todayAt = daysBetween(a, now);
      rows.forEach(function (row, r) {
        var mine = on.filter(function (t) { return fold(t.who || '') === fold(row[0]); }).sort(function (x, y) {
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
          var li = el('li', 'tk-tl__item');
          li.style.gridColumn = (pl.s0 + 1) + ' / ' + (pl.e0 + 2);
          li.style.gridRow = String(pl.lane + 1);
          var bar = el('a', 'tk-tl__bar' + (before ? ' tk-tl__bar--before' : '') + (after ? ' tk-tl__bar--after' : '')
            + (overdue(t) ? ' tk-tl__bar--late' : '') + (isDone(t) ? ' tk-done' : '') + (t.priority === 'High' || t.priority === 'Urgent' ? ' tk-high' : ''));
          bar.href = '#/t/' + t.id;
          if (overdue(t)) bar.appendChild(tag('OVERDUE', 'tk-late'));
          bar.appendChild(el('span', 'tk-tl__name', t.name));
          var words = t.start && t.due && t.start !== t.due ? 'starts ' + dayWords(t.start) + ', due ' + dayWords(t.due)
            : t.due ? 'due ' + dayWords(t.due) : 'starts ' + dayWords(t.start);
          bar.appendChild(el('span', 'sr', ', ' + words + (before ? ', began before these days' : '') + (after ? ', runs on past these days' : '')
            + ', ' + t.status + (t.priority === 'High' || t.priority === 'Urgent' ? ', ' + t.priority : '')));
          li.appendChild(bar);
          lanes.appendChild(li);
        });
        sec.appendChild(lanes);
        tl.appendChild(sec);
      });
      out.appendChild(tl);
    }

    drawSaved();
    drawFilters();
    drawOut();
    return h;
  }

  /* ── One task ──────────────────────────────────────────────────────────── */

  function taskView(id, focusEdit) {
    view.textContent = '';
    view.appendChild(quiet('Looking…'));
    return call('view=task&id=' + encodeURIComponent(id)).then(function (r) {
      if (r.status !== 200) {
        if (r.status === 404) { view.textContent = ''; var h0 = heading(2, 'That task has been deleted'); view.appendChild(h0); view.appendChild(backToList()); return h0; }
        return refused(r);
      }
      took(r.body);
      return drawTask(r.body.task);
    });
  }
  function backToList() { var p = el('p'); var a = el('a', null, '← Back to the list'); a.href = '#/'; p.appendChild(a); return p; }

  function drawTask(t) {
    view.textContent = '';
    view.appendChild(backToList());
    var h = heading(2, t.name);
    view.appendChild(h);
    var dl = el('dl', 'tk-facts');
    function fact(k, v) { if (v == null || v === '') return; dl.appendChild(el('dt', null, k)); var dd = el('dd'); if (typeof v === 'string') dd.textContent = v; else dd.appendChild(v); dl.appendChild(dd); }
    fact('Status', t.status);
    fact('Priority', t.priority);
    fact('Assigned to', t.who || 'Nobody');
    if (t.with.length) fact('Also on it', t.with.join(', '));
    fact('Starts', dayWords(t.start));
    if (t.due) { var d = el('span', null, dayWords(t.due)); if (overdue(t)) d.appendChild(tag('OVERDUE', 'tk-late')); fact('Due', d); }
    if (t.done) fact('Finished', when(t.done));
    if (t.tags.length) fact('Tags', t.tags.join(', '));
    if (t.recur) {
      // Made by a recurring task, on its day, under nobody's name.
      var made = el('span', null, 'By ');
      if (t.from) { var ra = el('a', null, 'the recurring task “' + t.from.name + '”'); ra.href = '#/recurring/' + t.from.id; made.appendChild(ra); }
      else made.appendChild(document.createTextNode('a recurring task since deleted'));
      made.appendChild(document.createTextNode(', for ' + dayWords(t.on) + ', ' + when(t.t)));
      fact('Made', made);
    } else fact('Made', (t.by ? t.by + ', ' : '') + when(t.t));
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
          var again = view.querySelector('input[data-box="' + bx.n + '"]');
          if (again) again.focus();
          say((on ? 'Ticked' : 'Unticked') + ' “' + label + '”.');
        });
      });
    };
    if (t.blocks && t.blocks.length) window.loveMarkdown.blocks(t.blocks, body, md);
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
          location.hash = '#/';
        });
      }, del);
    });
    tools.appendChild(del);
    view.appendChild(tools);
    return h;
  }

  /* ── Making and changing a task ───────────────────────────────────────── */

  function formView(id) {
    view.textContent = '';
    view.appendChild(quiet('Looking…'));
    var ask = id ? call('view=task&id=' + encodeURIComponent(id)) : call('view=list');
    return ask.then(function (r) {
      if (r.status !== 200) return refused(r);
      took(r.body);
      return drawForm(id ? r.body.task : null);
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
    function boxes(id, label, values, on) {
      var fs = el('fieldset', 'tk-checks');
      fs.appendChild(el('legend', 'cb-lab', label));
      values.forEach(function (v, i) {
        var c = el('input'); c.type = 'checkbox'; c.id = id + '-' + i; c.value = v;
        c.checked = on.some(function (x) { return fold(x) === fold(v); });
        var l = el('label', 'tk-check'); l.htmlFor = c.id;
        l.appendChild(c); l.appendChild(document.createTextNode(' ' + v));
        fs.appendChild(l);
      });
      form.appendChild(fs);
      return function () { return Array.prototype.filter.call(fs.querySelectorAll('input'), function (x) { return x.checked; }).map(function (x) { return x.value; }); };
    }
    function describe(value, goText, cancelTo) {
      var text = el('textarea', 'cb-say tk-text'); text.rows = 9; text.maxLength = settings.bodyMax; text.value = value;
      field('tk-body', 'Description', text);
      text.setAttribute('aria-describedby', 'tk-body-hint');
      var hint = el('p', 'cb-quiet tk-hint', 'Markdown works: **bold**, _italic_, lists, > quotes, `code`, links, and tables: a row to a line, a | between cells, and a line of dashes and bars under the first row. A list item starting [ ] or [x] is a checkbox, ticked on the task itself.');
      hint.id = 'tk-body-hint';
      form.appendChild(hint);
      var preview = el('div', 'tk-body tk-preview'); preview.hidden = true;
      form.appendChild(preview);
      var row = el('div', 'tk-row');
      var go = el('button', 'cb-btn', goText); go.type = 'submit';
      var look = el('button', 'cb-btn', 'Preview'); look.type = 'button'; look.setAttribute('aria-pressed', 'false');
      var cancel = el('a', 'cb-btn', 'Cancel'); cancel.href = cancelTo;
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
          preview.hidden = false;
          look.setAttribute('aria-pressed', 'true');
          look.textContent = 'Hide the preview';
        });
      });
      return { text: text, go: go, answer: answer };
    }
    return { field: field, select: select, boxes: boxes, describe: describe };
  }

  function drawForm(t) {
    view.textContent = '';
    view.appendChild(backToList());
    var h = heading(2, t ? 'Changing “' + t.name + '”' : 'A new task');
    view.appendChild(h);
    var form = el('form', 'tk-form');
    form.noValidate = true;
    var kit = formKit(form), field = kit.field, select = kit.select, boxes = kit.boxes;
    var name = el('input', 'cb-say tk-input'); name.maxLength = settings.nameMax; name.value = t ? t.name : '';
    field('tk-name', 'Name', name);
    var status = field('tk-status', 'Status', select(settings.statuses, t ? t.status : settings.statuses[0]));
    var priority = field('tk-priority', 'Priority', select(settings.priorities, t ? t.priority : settings.priority));
    var choices = people.slice();
    if (t && t.who && choices.every(function (p) { return fold(p) !== fold(t.who); })) choices.push(t.who);
    var who = field('tk-whois', 'Assigned to', select(choices, t ? t.who : (me && choices.some(function (p) { return fold(p) === fold(me.handle); }) ? me.handle : ''), 'Nobody'));
    var start = el('input', 'cb-say tk-input'); start.type = 'date'; start.value = t && t.start ? t.start : '';
    field('tk-start', 'Starts', start);
    var due = el('input', 'cb-say tk-input'); due.type = 'date'; due.value = t && t.due ? t.due : '';
    field('tk-duein', 'Due', due);

    var withOn = t ? t.with : [];
    var withAll = people.concat(withOn.filter(function (h) { return people.every(function (p) { return fold(p) !== fold(h); }); }));
    var withOf = boxes('tk-with', 'Also on it', withAll, withOn);
    var tagsOf = boxes('tk-tagbox', 'Tags', settings.tags, t ? t.tags : []);

    var desc = kit.describe(t ? t.body : '', t ? 'Save' : 'Make the task', t ? '#/t/' + t.id : '#/');
    var text = desc.text, go = desc.go, answer = desc.answer;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = { name: name.value, status: status.value, priority: priority.value, who: who.value || null,
        start: start.value || null, due: due.value || null, with: withOf(), tags: tagsOf(), body: text.value };
      // A change sends only what changed, so somebody else's change to another field stays.
      var send = { action: 'save' };
      if (t) {
        send.id = t.id;
        Object.keys(v).forEach(function (k) {
          var was = t[k] == null ? (k === 'body' ? '' : null) : t[k];
          if (JSON.stringify(was) !== JSON.stringify(v[k])) send[k] = v[k];
        });
        if (Object.keys(send).length === 2) { location.hash = '#/t/' + t.id; return; }
      } else Object.keys(v).forEach(function (k) { send[k] = v[k]; });
      go.disabled = true;
      answer.textContent = 'Saving…';
      call(null, send).then(function (r) {
        go.disabled = false;
        if (r.status !== 200) { answer.textContent = why(r, 'That did not save. Nothing was changed.'); return; }
        location.hash = '#/t/' + r.body.task.id;
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
  function backToRecurs() { var p = el('p'); var a = el('a', null, '← All recurring tasks'); a.href = '#/recurring'; p.appendChild(a); return p; }

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
        if (r.status === 404) { view.textContent = ''; var h0 = heading(2, 'That recurring task has been deleted'); view.appendChild(h0); view.appendChild(backToRecurs()); return h0; }
        return refused(r);
      }
      took(r.body);
      return drawRecur(r.body.recur, r.body.made || []);
    });
  }

  function drawRecur(r, made) {
    view.textContent = '';
    view.appendChild(backToRecurs());
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
    if (r.tags.length) fact('Tags', r.tags.join(', '));
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
    if (r.blocks && r.blocks.length) window.loveMarkdown.blocks(r.blocks, body, { top: 3, prefix: 'tk' });
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
          location.hash = '#/recurring';
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
    view.appendChild(backToRecurs());
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
    var tagsOf = boxes('tk-tagbox', 'Tags', settings.tags, r ? r.tags : []);
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
        if (Object.keys(send).length === 2) { location.hash = '#/recurring/' + r.id; return; }
      } else Object.keys(v).forEach(function (k) { send[k] = v[k]; });
      go.disabled = true;
      answer.textContent = 'Saving…';
      call(null, send).then(function (a) {
        go.disabled = false;
        if (a.status !== 200) { answer.textContent = why(a, 'That did not save. Nothing was changed.'); return; }
        location.hash = '#/recurring/' + a.body.recur.id;
        say(r ? 'Saved.' : 'Made. Its first task is made on ' + dayWords(a.body.recur.next) + '.');
      });
    });
    view.appendChild(form);
    return h;
  }

  /* ── Refusals ──────────────────────────────────────────────────────────── */

  function refused(r) {
    view.textContent = '';
    var h = heading(2, r.status === 403 ? 'Tasks are for our directors and administrators' : 'Tasks');
    view.appendChild(h);
    view.appendChild(el('p', null, why(r, 'Tasks could not be read just now.')));
    if (r.status === 401) view.appendChild(el('p', null, 'Your pass has stopped working, which happens when a password changes. Sign on to the CB again from the radio in the corner.'));
    return h;
  }
  function guest() {
    view.textContent = '';
    var h = heading(2, 'Sign on to see tasks');
    view.appendChild(h);
    view.appendChild(el('p', null, 'Tasks are the team’s to-do list, for our directors and administrators. Sign on to the CB with the bar in the corner of your screen, with your claimed username.'));
    var p = el('p'); var a = el('a', null, 'What tasks keep'); a.href = '/privacy.html#tasks'; p.appendChild(a);
    view.appendChild(p);
    return h;
  }

  /* ── Where in tasks an address is ─────────────────────────────────────── */

  var first = true;
  function route() {
    dressNow();
    var hash = location.hash || '';
    if (hash && hash.indexOf('#/') !== 0) hash = '';
    var parts = hash.slice(1).split('?')[0].split('/').filter(Boolean);
    var done;
    if (!cbState()) done = Promise.resolve(guest());
    else if (parts[0] === 'edit' && parts[1]) done = formView(parts[1]);
    else if (parts[0] === 't' && parts[1]) done = taskView(parts[1]);
    else if (parts[0] === 'new') done = formView(null);
    else if (parts[0] === 'board') done = tasksView('board');
    else if (parts[0] === 'timeline') done = tasksView('timeline');
    else if (parts[0] === 'recurring' && parts[1] === 'new') done = recurFormView(null);
    else if (parts[0] === 'recurring' && parts[1] === 'edit' && parts[2]) done = recurFormView(parts[2]);
    else if (parts[0] === 'recurring' && parts[1]) done = recurView(parts[1]);
    else if (parts[0] === 'recurring') done = recurList();
    else done = tasksView('list');
    [navList, navBoard, navTime, navRecur, navNew].forEach(function (a) { a.removeAttribute('aria-current'); });
    if (parts[0] === 'new') navNew.setAttribute('aria-current', 'page');
    else if (parts[0] === 'board') navBoard.setAttribute('aria-current', 'page');
    else if (parts[0] === 'timeline') navTime.setAttribute('aria-current', 'page');
    else if (parts[0] === 'recurring' && !parts[1]) navRecur.setAttribute('aria-current', 'page');
    else if (!parts.length) navList.setAttribute('aria-current', 'page');
    Promise.resolve(done).then(function (h) { if (h && !first) h.focus(); first = false; });
  }
  window.addEventListener('hashchange', function () { if ((location.hash || '').indexOf('#/') === 0 || !location.hash) route(); });
  route();
})();

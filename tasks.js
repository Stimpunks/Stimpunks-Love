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
  var navNew = el('a', 'cb-btn tk-navlink', 'New task'); navNew.href = '#/new';
  nav.appendChild(navList); nav.appendChild(navNew);
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

  var settings = null, people = [], me = null, tasks = [];
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

  /* ── The list: filters and order, kept in the address ────────────────── */

  var COLUMNS = [['name', 'Task'], ['status', 'Status'], ['priority', 'Priority'], ['who', 'Assigned to'], ['start', 'Starts'], ['due', 'Due'], ['tags', 'Tags']];
  var DUES = [['', 'Any time'], ['overdue', 'Overdue'], ['today', 'Due today'], ['week', 'Due in the next 7 days'], ['month', 'Due this month'], ['none', 'No due date']];

  function readQuery() {
    var q = {};
    (location.hash.split('?')[1] || '').split('&').forEach(function (kv) {
      if (!kv) return;
      var i = kv.indexOf('=');
      try { q[decodeURIComponent(i < 0 ? kv : kv.slice(0, i))] = i < 0 ? '' : decodeURIComponent(kv.slice(i + 1).replace(/\+/g, ' ')); } catch (e) { /* a broken address */ }
    });
    var list = function (k) { return q[k] ? q[k].split(',').filter(Boolean) : null; };
    return {
      q: q.q || '', status: list('status'), priority: list('priority'), tags: list('tags'),
      who: q.who || '', due: q.due || '', sort: q.sort || 'due', dir: q.dir === 'desc' ? 'desc' : 'asc',
    };
  }
  function writeQuery(f) {
    var parts = [];
    if (f.q) parts.push('q=' + encodeURIComponent(f.q));
    if (f.status) parts.push('status=' + f.status.map(encodeURIComponent).join(','));
    if (f.priority) parts.push('priority=' + f.priority.map(encodeURIComponent).join(','));
    if (f.tags) parts.push('tags=' + f.tags.map(encodeURIComponent).join(','));
    if (f.who) parts.push('who=' + encodeURIComponent(f.who));
    if (f.due) parts.push('due=' + f.due);
    if (f.sort !== 'due' || f.dir !== 'asc') parts.push('sort=' + f.sort + '&dir=' + f.dir);
    var h = '#/' + (parts.length ? '?' + parts.join('&') : '');
    if (location.hash !== h) history.replaceState(null, '', h);
  }
  // Until somebody picks statuses, the list shows the ones still to do.
  function statusesOf(f) { return f.status || settings.statuses.filter(function (s) { return settings.done.indexOf(s) < 0; }); }

  /* Whether a task passes every filter, leaving out `skip`, so each filter's
     own counts say what picking that value would show. */
  function passes(t, f, skip) {
    if (skip !== 'q' && f.q) { var w = fold(f.q); if (fold(t.name).indexOf(w) < 0) return false; }
    if (skip !== 'status' && statusesOf(f).indexOf(t.status) < 0) return false;
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
  function counted(f, skip, key) {
    var n = {};
    tasks.forEach(function (t) {
      if (!passes(t, f, skip)) return;
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
      if (f.sort === 'priority') return v;
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

  function listView() {
    view.textContent = '';
    view.appendChild(quiet('Looking…'));
    return call('view=list').then(function (r) {
      if (r.status !== 200) return refused(r);
      took(r.body);
      tasks = r.body.tasks || [];
      return drawList(readQuery());
    });
  }

  function drawList(f) {
    view.textContent = '';
    var h = heading(2, 'Tasks');
    view.appendChild(h);
    var filters = el('form', 'tk-filters');
    filters.setAttribute('aria-label', 'Filter the tasks');
    filters.addEventListener('submit', function (e) { e.preventDefault(); });
    var shown = el('p', 'tk-shown');
    shown.setAttribute('aria-live', 'polite');
    var table = el('div', 'tk-tablebox');
    // It scrolls sideways on a narrow screen, so a keyboard can reach it.
    table.tabIndex = 0;
    table.setAttribute('role', 'region');
    table.setAttribute('aria-label', 'The tasks');
    view.appendChild(filters);
    view.appendChild(shown);
    view.appendChild(table);

    // The words box and the tags' fold, held rather than looked up: they live
    // in this list's own box, which no page's ids reach.
    var qBox = null, tagFoldEl = null;
    function refresh(focusSort) {
      writeQuery(f);
      drawFilters();
      drawTable(focusSort);
    }

    /* Words, then each filter with how many tasks each choice would show. */
    function drawFilters() {
      var at = root.activeElement && root.activeElement.id;
      var tagsOpen = tagFoldEl ? tagFoldEl.open : !!f.tags;
      filters.textContent = '';
      var fields = el('div', 'tk-fields');
      filters.appendChild(fields);
      var words = el('div', 'tk-field');
      var wl = el('label', 'cb-lab', 'Words in the name'); wl.htmlFor = 'tk-q';
      var wi = el('input', 'cb-say tk-input'); wi.id = 'tk-q'; wi.type = 'search'; wi.value = f.q; wi.autocomplete = 'off';
      qBox = wi;
      wi.addEventListener('input', function () { f.q = wi.value; writeQuery(f); drawTable(); drawCounts(); });
      words.appendChild(wl); words.appendChild(wi);
      fields.appendChild(words);

      var who = el('div', 'tk-field');
      var hl = el('label', 'cb-lab', 'Assigned to'); hl.htmlFor = 'tk-who';
      var hs = el('select', 'cb-say tk-input'); hs.id = 'tk-who';
      var nWho = counted(f, 'who', function (t) { return t.who ? fold(t.who) : '-'; });
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
        var g = { q: f.q, status: f.status, priority: f.priority, tags: f.tags, who: f.who, due: d[0] };
        var n = tasks.filter(function (t) { return passes(t, g); }).length;
        var o = el('option', null, d[1] + ' (' + n + ')'); o.value = d[0]; ds.appendChild(o);
      });
      ds.value = f.due;
      ds.addEventListener('change', function () { f.due = ds.value; refresh(); });
      due.appendChild(dl); due.appendChild(ds);
      fields.appendChild(due);

      filters.appendChild(checks('status', 'Status', settings.statuses, statusesOf(f), function (t) { return t.status; }));
      filters.appendChild(checks('priority', 'Priority', settings.priorities, f.priority || settings.priorities, function (t) { return t.priority; }));
      // Tags in a fold of their own, open while any is picked.
      var tagFold = el('details', 'tk-fold');
      tagFoldEl = tagFold;
      tagFold.open = tagsOpen;
      tagFold.appendChild(el('summary', 'tk-fold__sum', f.tags ? 'Tags: ' + f.tags.join(', ') : 'Tags: any'));
      tagFold.appendChild(checks('tags', 'Tags', settings.tags, f.tags || [], function (t) { return t.tags; }));
      filters.appendChild(tagFold);

      var row = el('p', 'tk-row');
      var clear = el('a', 'cb-btn tk-small', 'Clear the filters'); clear.href = '#/';
      row.appendChild(clear);
      var link = el('button', 'cb-btn tk-small', 'Copy a link to this list'); link.type = 'button';
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
      var n = counted(f, key, val);
      values.forEach(function (v, i) {
        var id = 'tk-' + key + '-' + i;
        var c = el('input'); c.type = 'checkbox'; c.id = id; c.value = v; c.checked = on.indexOf(v) >= 0;
        var l = el('label', 'tk-check'); l.htmlFor = id;
        l.appendChild(c);
        l.appendChild(document.createTextNode(' ' + v + ' '));
        l.appendChild(el('span', 'tk-n', String(n[v] || 0)));
        c.addEventListener('change', function () {
          var picked = Array.prototype.filter.call(fs.querySelectorAll('input'), function (x) { return x.checked; }).map(function (x) { return x.value; });
          if (key === 'status') f.status = picked.length ? picked : [];
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
      drawFilters();
      if (keep) { qBox.focus(); qBox.setSelectionRange(keep[0], keep[1]); }
    }

    function drawTable(focusSort) {
      var list = ordered(tasks.filter(function (t) { return passes(t, f); }), f);
      shown.textContent = list.length + ' of ' + tasks.length + ' tasks';
      table.textContent = '';
      if (!list.length) { table.appendChild(quiet(tasks.length ? 'No task matches every filter.' : 'There are no tasks yet.')); return; }
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
          writeQuery(f);
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
      table.appendChild(t);
      if (focusSort) { var sb = t.querySelector('[data-sort="' + focusSort + '"]'); if (sb) sb.focus(); }
    }

    drawFilters();
    drawTable();
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
    fact('Made', (t.by ? t.by + ', ' : '') + when(t.t));
    if (t.edited) fact('Changed', (t.editedBy ? t.editedBy + ', ' : '') + when(t.edited));
    view.appendChild(dl);
    var body = el('div', 'tk-body');
    if (t.blocks && t.blocks.length) window.loveMarkdown.blocks(t.blocks, body, { top: 2, prefix: 'tk' });
    else body.appendChild(quiet('No description.'));
    view.appendChild(body);
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

  function drawForm(t) {
    view.textContent = '';
    view.appendChild(backToList());
    var h = heading(2, t ? 'Changing “' + t.name + '”' : 'A new task');
    view.appendChild(h);
    var form = el('form', 'tk-form');
    form.noValidate = true;
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
    var withOn = t ? t.with : [];
    var withAll = people.concat(withOn.filter(function (h) { return people.every(function (p) { return fold(p) !== fold(h); }); }));
    var withOf = boxes('tk-with', 'Also on it', withAll, withOn);
    var tagsOf = boxes('tk-tagbox', 'Tags', settings.tags, t ? t.tags : []);

    var text = el('textarea', 'cb-say tk-text'); text.rows = 9; text.maxLength = settings.bodyMax; text.value = t ? t.body : '';
    field('tk-body', 'Description', text);
    text.setAttribute('aria-describedby', 'tk-body-hint');
    var hint = el('p', 'cb-quiet tk-hint', 'Markdown works: **bold**, _italic_, lists, > quotes, `code`, links, and tables: a row to a line, a | between cells, and a line of dashes and bars under the first row.');
    hint.id = 'tk-body-hint';
    form.appendChild(hint);
    var preview = el('div', 'tk-body tk-preview'); preview.hidden = true;
    form.appendChild(preview);

    var row = el('div', 'tk-row');
    var go = el('button', 'cb-btn', t ? 'Save' : 'Make the task'); go.type = 'submit';
    var look = el('button', 'cb-btn', 'Preview'); look.type = 'button'; look.setAttribute('aria-pressed', 'false');
    var cancel = el('a', 'cb-btn', 'Cancel'); cancel.href = t ? '#/t/' + t.id : '#/';
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
    else done = listView();
    navList.removeAttribute('aria-current'); navNew.removeAttribute('aria-current');
    if (parts[0] === 'new') navNew.setAttribute('aria-current', 'page'); else if (!parts.length) navList.setAttribute('aria-current', 'page');
    Promise.resolve(done).then(function (h) { if (h && !first) h.focus(); first = false; });
  }
  window.addEventListener('hashchange', function () { if ((location.hash || '').indexOf('#/') === 0 || !location.hash) route(); });
  route();
})();

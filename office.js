/* =============================================================================
   The office: contacts and grant requests (and, at the next stage, cases),
   moved here from EspoCRM. Ryan's brief, 2026-10-20. See netlify/cb/lib.mjs, the
   office, and privacy.html#office for what it keeps.

   THE CB'S, DRESSED AS THE CB, as tasks are: a shadow root with cb.css and
   office.css the only sheets that reach it, wearing whichever of the radio's
   themes the reader has on. office.css names no colour of its own.

   ONLY DIRECTORS AND ADMINISTRATORS READ IT, and this file only asks: the
   server refuses everybody else. It reads love-cb for the pass and keeps
   nothing in the browser, least of all anybody's details. The list's order
   lives in the page's address; a search does not, because what is searched
   for is a name, an email or a phone number, and the address goes into the
   browser's history. It is kept only while the page is open.

   NOTES ARRIVE AS NODES, NOT HTML, and markdown.js builds them.

   NUMBERS ARE FINE HERE (Ryan's call, 2026-10-20, for tasks and backend
   tools): the lists say how many match, and grant requests what they come to.
   tools/make-office.py holds all of this.
   ============================================================================= */
(function () {
  'use strict';

  var mount = document.querySelector('[data-office]');
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

  var host = el('div', 'of-mount');
  var root = host.attachShadow({ mode: 'open' });
  var waiting = 2;
  host.style.visibility = 'hidden';
  ['/cb.css', '/office.css'].forEach(function (href) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    function ready() { if (--waiting === 0) host.style.visibility = ''; }
    l.addEventListener('load', ready);
    l.addEventListener('error', ready);
    root.appendChild(l);
  });
  var box = el('div', 'of');
  root.appendChild(box);

  var bar = el('div', 'cb-bar of-bar');
  var brand = el('p', 'of-name');
  brand.appendChild(el('span', 'cb-brand', 'CB'));
  brand.appendChild(document.createTextNode(' Office'));
  bar.appendChild(brand);
  var nav = el('nav', 'of-nav');
  nav.setAttribute('aria-label', 'The office');
  var navContacts = el('a', 'cb-btn of-navlink', 'Contacts'); navContacts.href = '#/';
  var navGrants = el('a', 'cb-btn of-navlink', 'Grant requests'); navGrants.href = '#/grants';
  var navBoard = el('a', 'cb-btn of-navlink', 'Board'); navBoard.href = '#/grants/board';
  var navNew = el('a', 'cb-btn of-navlink', 'New contact'); navNew.href = '#/contacts/new';
  var navNewGrant = el('a', 'cb-btn of-navlink', 'New grant request'); navNewGrant.href = '#/grants/new';
  [navContacts, navGrants, navBoard, navNew, navNewGrant].forEach(function (a) { nav.appendChild(a); });
  bar.appendChild(nav);
  box.appendChild(bar);

  var view = el('div', 'of-view');
  box.appendChild(view);
  var said = el('p', 'of-said');
  said.setAttribute('role', 'status');
  box.appendChild(said);
  function say(t) { said.textContent = ''; setTimeout(function () { said.textContent = t || ''; }, 30); }

  mount.textContent = '';
  mount.appendChild(host);

  /* Wearing the radio's theme, as tasks do. */
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
  } catch (e) { /* the office keeps the colours it opened in */ }
  ['(prefers-contrast: more)', '(prefers-color-scheme: light)'].forEach(function (q) {
    try { window.matchMedia(q).addEventListener('change', dressNow); } catch (e) { /* an old browser */ }
  });

  /* ── Talking to /cb/office ─────────────────────────────────────────────── */

  function call(q, send) {
    var s = cbState();
    var headers = { accept: 'application/json', authorization: 'Bearer ' + (s ? s.pass : '') };
    if (send) headers['content-type'] = 'application/json';
    return fetch('/cb/office' + (q ? '?' + q : ''), {
      method: send ? 'POST' : 'GET', headers: headers, body: send ? JSON.stringify(send) : undefined,
      credentials: 'omit', cache: 'no-store',
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (b) { return { status: r.status, body: b || {} }; });
    }, function () { return { status: 0, body: {} }; });
  }
  function why(r, otherwise) {
    if (r.body && typeof r.body.error === 'string' && r.body.error) return r.body.error;
    if (r.status === 404 || r.status === 405) return 'The office only answers on stimpunks.world itself.';
    if (r.status === 0) return 'No signal. The office could not be reached just now.';
    return otherwise;
  }

  var settings = null, contacts = [], grants = [];
  function took(b) { if (b.settings) settings = b.settings; }

  /* ── Pieces ────────────────────────────────────────────────────────────── */

  function when(t) {
    try { return new Date(t).toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' }); }
    catch (e) { return ''; }
  }
  function dayOf(t) {
    try { return new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch (e) { return ''; }
  }
  function dayWords(v) {
    if (!v) return '';
    var p = v.split('-'), d = new Date(+p[0], +p[1] - 1, +p[2]);
    try { return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return v; }
  }
  function money(n) { try { return '$' + Number(n).toLocaleString('en-US'); } catch (e) { return '$' + n; } }
  function heading(level, text) { var h = el('h' + level, null, text); h.tabIndex = -1; return h; }
  function quiet(text) { return el('p', 'cb-quiet', text); }
  function tag(text) { return el('span', 'cb-tag', text); }
  function sure(into, text, yesText, yes, back) {
    var b = el('div', 'of-sure');
    b.appendChild(el('p', null, text));
    var y = el('button', 'cb-btn of-small', yesText); y.type = 'button';
    var n = el('button', 'cb-btn of-small', 'Leave it'); n.type = 'button';
    b.appendChild(y); b.appendChild(n);
    into.appendChild(b);
    if (back) back.hidden = true;
    n.focus();
    n.addEventListener('click', function () { b.remove(); if (back) { back.hidden = false; back.focus(); } });
    y.addEventListener('click', function () { y.disabled = true; yes(function () { y.disabled = false; }); });
  }
  function backTo(href, words) { var p = el('p'); var a = el('a', null, words); a.href = href; p.appendChild(a); return p; }
  function nameOf(c) { return c.name || 'A contact with no name'; }

  /* ── Contacts: a search and an order, kept in the address ──────────────── */

  var SORTS = [['name', 'Name'], ['email', 'Email'], ['phone', 'Phone'], ['t', 'Added']];
  var PAGE = 100;
  var searched = '';
  function readQuery() {
    var q = {};
    (String(location.hash).split('?')[1] || '').split('&').forEach(function (kv) {
      var i = kv.indexOf('=');
      if (i > 0) { try { q[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1)); } catch (e) { /* a broken address keeps its defaults */ } }
    });
    return {
      q: searched,
      sort: SORTS.some(function (s) { return s[0] === q.sort; }) ? q.sort : 'name',
      dir: q.dir === 'desc' ? 'desc' : 'asc',
    };
  }
  function writeQuery(f) {
    var parts = [];
    if (f.sort !== 'name') parts.push('sort=' + f.sort);
    if (f.dir !== 'asc') parts.push('dir=' + f.dir);
    var to = '#/' + (parts.length ? '?' + parts.join('&') : '');
    if (to !== location.hash) history.replaceState(null, '', to);
  }
  // A phone matches by its digits too, so 555-0100 finds (555) 0100.
  function digits(v) { return String(v || '').replace(/\D+/g, ''); }
  function matches(c, q) {
    if (!q) return true;
    var hay = fold(c.name + ' ' + c.email + ' ' + c.phone), nums = digits(c.phone);
    return fold(q).split(' ').every(function (w) { return hay.indexOf(w) >= 0 || (digits(w).length >= 3 && nums.indexOf(digits(w)) >= 0); });
  }
  // By last name, then first: how a list of people is read.
  function sortKey(c, by) {
    if (by === 'name') return fold((c.last || '') + ' ' + (c.first || ''));
    if (by === 't') return c.t || 0;
    return fold(c[by]);
  }
  function ordered(list, f) {
    return list.slice().sort(function (a, b) {
      var x = sortKey(a, f.sort), y = sortKey(b, f.sort);
      // An empty email or phone sorts last whichever way.
      if (x === '' && y !== '') return 1;
      if (y === '' && x !== '') return -1;
      var d = x < y ? -1 : x > y ? 1 : 0;
      return f.dir === 'asc' ? d : -d;
    });
  }

  function contactsView() {
    view.textContent = '';
    view.appendChild(quiet('Looking…'));
    return call('view=contacts').then(function (r) {
      if (r.status !== 200) return refused(r);
      took(r.body);
      contacts = r.body.contacts || [];
      return drawContacts(readQuery());
    });
  }

  function drawContacts(f) {
    view.textContent = '';
    var h = heading(2, 'Contacts');
    view.appendChild(h);
    var find = el('form', 'of-find');
    find.setAttribute('role', 'search');
    find.addEventListener('submit', function (e) { e.preventDefault(); });
    var fw = el('div', 'of-field');
    var fl = el('label', 'cb-lab', 'Find a contact'); fl.htmlFor = 'of-q';
    var qBox = el('input', 'cb-say of-input'); qBox.id = 'of-q'; qBox.type = 'search'; qBox.value = f.q; qBox.autocomplete = 'off';
    qBox.setAttribute('aria-describedby', 'of-q-hint');
    var hint = el('p', 'cb-quiet of-hint', 'Any part of a name, an email or a phone number.'); hint.id = 'of-q-hint';
    fw.appendChild(fl); fw.appendChild(qBox); fw.appendChild(hint);
    find.appendChild(fw);
    view.appendChild(find);
    var shown = el('p', 'of-shown');
    shown.setAttribute('aria-live', 'polite');
    view.appendChild(shown);
    var out = el('div', 'of-tablebox');
    view.appendChild(out);
    var more = el('p', 'of-row');
    view.appendChild(more);
    var showing = PAGE;

    qBox.addEventListener('input', function () { f.q = searched = qBox.value; showing = PAGE; drawTable(); });

    function drawTable(focusSort, focusRow) {
      var list = ordered(contacts.filter(function (c) { return matches(c, f.q); }), f);
      shown.textContent = f.q ? list.length + ' of ' + contacts.length + ' contacts match' : contacts.length + ' contacts';
      out.textContent = '';
      more.textContent = '';
      if (!list.length) { out.appendChild(quiet(contacts.length ? 'No contact matches that.' : 'There are no contacts yet.')); return; }
      var t = el('table', 'of-list');
      var some = list.slice(0, showing);
      t.appendChild(el('caption', 'sr', 'Contacts, ' + some.length + ' of ' + list.length + ' shown. The column headings sort them.'));
      var hr = el('tr');
      SORTS.forEach(function (c) {
        var th = el('th'); th.scope = 'col';
        var b = el('button', 'of-sort', c[1]); b.type = 'button';
        if (f.sort === c[0]) th.setAttribute('aria-sort', f.dir === 'asc' ? 'ascending' : 'descending');
        b.appendChild(el('span', null, f.sort === c[0] ? (f.dir === 'asc' ? ' ↑' : ' ↓') : ''));
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
      some.forEach(function (c, i) {
        var tr = el('tr');
        var td = el('td', 'of-title');
        var a = el('a', null, nameOf(c)); a.href = '#/c/' + c.id;
        if (i === focusRow) a.setAttribute('data-first-new', '');
        td.appendChild(a);
        tr.appendChild(td);
        var em = el('td', 'of-mail', c.email || '—');
        if (c.noEmail) em.appendChild(tag('NO EMAIL'));
        tr.appendChild(em);
        var ph = el('td', 'of-phone', c.phone || '—');
        if (c.noCall) ph.appendChild(tag('NO CALLS'));
        tr.appendChild(ph);
        tr.appendChild(el('td', 'of-day', dayOf(c.t)));
        tb.appendChild(tr);
      });
      t.appendChild(tb);
      out.appendChild(t);
      if (list.length > showing) {
        var b = el('button', 'cb-btn of-small', 'Show ' + Math.min(PAGE, list.length - showing) + ' more'); b.type = 'button';
        b.addEventListener('click', function () {
          var from = showing;
          showing += PAGE;
          drawTable(null, from);
          var next = out.querySelector('[data-first-new]');
          if (next) next.focus();
        });
        more.appendChild(b);
        more.appendChild(el('span', 'cb-quiet', some.length + ' of ' + list.length + ' shown'));
      }
      if (focusSort) { var sb = t.querySelector('[data-sort="' + focusSort + '"]'); if (sb) sb.focus(); }
    }
    drawTable();
    return h;
  }

  /* ── One contact ───────────────────────────────────────────────────────── */

  function contactView(id) {
    view.textContent = '';
    view.appendChild(quiet('Looking…'));
    return call('view=contact&id=' + encodeURIComponent(id)).then(function (r) {
      if (r.status !== 200) {
        if (r.status === 404) { view.textContent = ''; var h0 = heading(2, 'That contact has been deleted'); view.appendChild(h0); view.appendChild(backTo('#/', '← All contacts')); return h0; }
        return refused(r);
      }
      took(r.body);
      return drawContact(r.body.contact);
    });
  }

  function drawContact(c) {
    view.textContent = '';
    view.appendChild(backTo('#/', '← All contacts'));
    var h = heading(2, nameOf(c));
    view.appendChild(h);
    var dl = el('dl', 'of-facts');
    function fact(k, v) { if (v == null || v === '') return; dl.appendChild(el('dt', null, k)); var dd = el('dd'); if (typeof v === 'string') dd.textContent = v; else dd.appendChild(v); dl.appendChild(dd); }
    if (c.email) {
      var em = el('span');
      var ma = el('a', null, c.email); ma.href = 'mailto:' + c.email;
      em.appendChild(ma);
      if (c.noEmail) em.appendChild(tag('ASKED NOT TO BE EMAILED'));
      fact('Email', em);
    } else fact('Email', 'None');
    if (c.phone) {
      var ph = el('span');
      var ta = el('a', null, c.phone); ta.href = 'tel:' + c.phone.replace(/[^\d+]/g, '');
      ph.appendChild(ta);
      if (c.noCall) ph.appendChild(tag('ASKED NOT TO BE CALLED'));
      fact('Phone', ph);
    } else fact('Phone', 'None');
    fact('Added', (c.by ? c.by + ', ' : '') + when(c.t) + (c.espo ? ', in EspoCRM' : ''));
    if (c.edited) fact('Changed', (c.editedBy ? c.editedBy + ', ' : '') + when(c.edited));
    view.appendChild(dl);
    var body = el('div', 'of-body');
    if (c.blocks && c.blocks.length) window.loveMarkdown.blocks(c.blocks, body, { top: 2, prefix: 'of' });
    else body.appendChild(quiet('No notes.'));
    view.appendChild(body);
    var gh = el('h3', null, 'Grant requests');
    view.appendChild(gh);
    var theirs = c.grants || [];
    if (theirs.length) {
      var gl = el('ul', 'of-theirs');
      theirs.forEach(function (g) {
        var li = el('li');
        var a = el('a', null, g.name); a.href = '#/g/' + g.id;
        li.appendChild(a);
        li.appendChild(document.createTextNode(' · ' + g.pipeline + ', ' + g.stage + (g.amount != null ? ', ' + money(g.amount) : '') + (g.submitted ? ', submitted ' + dayWords(g.submitted) : '')));
        gl.appendChild(li);
      });
      view.appendChild(gl);
    } else view.appendChild(quiet('None.'));
    var tools = el('div', 'of-row');
    var newGrant = el('a', 'cb-btn of-small', 'New grant request from them'); newGrant.href = '#/grants/new?contact=' + c.id;
    tools.appendChild(newGrant);
    var edit = el('a', 'cb-btn of-small', 'Edit'); edit.href = '#/contacts/edit/' + c.id;
    tools.appendChild(edit);
    var del = el('button', 'cb-btn of-small', 'Delete'); del.type = 'button';
    del.addEventListener('click', function () {
      sure(tools, 'This deletes ' + nameOf(c) + ' for everybody. It cannot be put back' + (c.espo ? ', and bringing contacts over from EspoCRM again leaves it deleted.' : '.'), 'Delete it', function (done) {
        call(null, { action: 'contact-remove', id: c.id }).then(function (r) {
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

  /* ── Adding and changing a contact ─────────────────────────────────────── */

  function formView(id) {
    view.textContent = '';
    view.appendChild(quiet('Looking…'));
    var ask = id ? call('view=contact&id=' + encodeURIComponent(id)) : call('view=contacts');
    return ask.then(function (r) {
      if (r.status !== 200) return refused(r);
      took(r.body);
      return drawForm(id ? r.body.contact : null);
    });
  }

  function drawForm(c) {
    view.textContent = '';
    view.appendChild(c ? backTo('#/c/' + c.id, '← ' + nameOf(c)) : backTo('#/', '← All contacts'));
    var h = heading(2, c ? 'Changing ' + nameOf(c) : 'A new contact');
    view.appendChild(h);
    var form = el('form', 'of-form');
    form.noValidate = true;
    function field(id, label, input) {
      var w = el('div', 'of-field');
      var l = el('label', 'cb-lab', label); l.htmlFor = id; input.id = id;
      w.appendChild(l); w.appendChild(input);
      form.appendChild(w);
      return input;
    }
    function input(type, value, max, auto) {
      var i = el('input', 'cb-say of-input'); i.type = type; i.value = value || ''; if (max) i.maxLength = max;
      i.autocomplete = auto || 'off';
      return i;
    }
    var first = field('of-first', 'First name', input('text', c && c.first, settings.nameMax));
    var last = field('of-last', 'Last name', input('text', c && c.last, settings.nameMax));
    var email = field('of-email', 'Email', input('email', c && c.email, 254));
    var phone = field('of-phone', 'Phone', input('tel', c && c.phone, 40));
    var fs = el('fieldset', 'of-checks');
    fs.appendChild(el('legend', 'cb-lab', 'What they have asked'));
    function check(id, words, on) {
      var x = el('input'); x.type = 'checkbox'; x.id = id; x.checked = !!on;
      var l = el('label', 'of-check'); l.htmlFor = id;
      l.appendChild(x); l.appendChild(document.createTextNode(' ' + words));
      fs.appendChild(l);
      return x;
    }
    var noEmail = check('of-noemail', 'Not to be emailed', c && c.noEmail);
    var noCall = check('of-nocall', 'Not to be called', c && c.noCall);
    form.appendChild(fs);

    var text = el('textarea', 'cb-say of-text'); text.rows = 8; text.maxLength = settings.notesMax; text.value = c ? c.notes : '';
    field('of-notes', 'Notes', text);
    text.setAttribute('aria-describedby', 'of-notes-hint');
    var hint = el('p', 'cb-quiet of-hint', 'Markdown works: **bold**, _italic_, lists, > quotes, `code`, links and tables.');
    hint.id = 'of-notes-hint';
    form.appendChild(hint);
    var preview = el('div', 'of-body of-preview'); preview.hidden = true;
    form.appendChild(preview);
    var row = el('div', 'of-row');
    var go = el('button', 'cb-btn', c ? 'Save' : 'Add the contact'); go.type = 'submit';
    var look = el('button', 'cb-btn', 'Preview the notes'); look.type = 'button'; look.setAttribute('aria-pressed', 'false');
    var cancel = el('a', 'cb-btn', 'Cancel'); cancel.href = c ? '#/c/' + c.id : '#/';
    row.appendChild(go); row.appendChild(look); row.appendChild(cancel);
    form.appendChild(row);
    var answer = el('p', 'of-answer'); answer.setAttribute('role', 'status');
    form.appendChild(answer);
    look.addEventListener('click', function () {
      if (!preview.hidden) { preview.hidden = true; look.setAttribute('aria-pressed', 'false'); look.textContent = 'Preview the notes'; return; }
      if (!text.value.trim()) { answer.textContent = 'There are no notes to preview yet.'; return; }
      call(null, { action: 'preview', body: text.value }).then(function (r) {
        if (r.status !== 200) { answer.textContent = why(r, 'The preview could not be made just now.'); return; }
        preview.textContent = '';
        window.loveMarkdown.blocks(r.body.blocks, preview, { top: 2, prefix: 'of' });
        preview.hidden = false;
        look.setAttribute('aria-pressed', 'true');
        look.textContent = 'Hide the preview';
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = { first: first.value, last: last.value, email: email.value, phone: phone.value, noEmail: noEmail.checked, noCall: noCall.checked, notes: text.value };
      // A change sends only what changed, so somebody else's change to another field stays.
      var send = { action: 'contact-save' };
      if (c) {
        send.id = c.id;
        Object.keys(v).forEach(function (k) { if (JSON.stringify(c[k] == null ? '' : c[k]) !== JSON.stringify(v[k])) send[k] = v[k]; });
        if (Object.keys(send).length === 2) { location.hash = '#/c/' + c.id; return; }
      } else Object.keys(v).forEach(function (k) { send[k] = v[k]; });
      go.disabled = true;
      answer.textContent = 'Saving…';
      call(null, send).then(function (r) {
        go.disabled = false;
        if (r.status !== 200) { answer.textContent = why(r, 'That did not save. Nothing was changed.'); return; }
        location.hash = '#/c/' + r.body.contact.id;
        say(c ? 'Saved.' : 'Added.');
      });
    });
    view.appendChild(form);
    return h;
  }


  /* ── Grant requests: a list and a board ────────────────────────────────── */

  /* The list's pipeline, statuses, stage and order live in the address, as
     tasks' do; a search does not, for the contacts' reason. A new view opens
     on the open ones. */
  var GSORTS = [['name', 'Name'], ['contact', 'Contact'], ['pipeline', 'Pipeline'], ['stage', 'Stage'], ['amount', 'Amount'],
    ['submitted', 'Submitted'], ['closed', 'Decided']];
  var gSearched = '';
  function readGrantQuery() {
    var q = {};
    (String(location.hash).split('?')[1] || '').split('&').forEach(function (kv) {
      var i = kv.indexOf('=');
      if (i > 0) { try { q[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1)); } catch (e) { /* a broken address keeps its defaults */ } }
    });
    var pipes = settings ? settings.pipelines.map(function (p) { return p.name; }) : [];
    var stats = settings ? settings.statuses : [];
    return {
      q: gSearched,
      pipeline: pipes.indexOf(q.pipeline) >= 0 ? q.pipeline : '',
      stage: q.stage || '',
      status: q.status != null ? q.status.split(',').filter(function (x) { return stats.indexOf(x) >= 0; }) : ['Open'],
      sort: GSORTS.some(function (x) { return x[0] === q.sort; }) ? q.sort : 'submitted',
      dir: q.dir === 'asc' ? 'asc' : (q.dir === 'desc' || !q.sort ? 'desc' : 'asc'),
    };
  }
  function writeGrantQuery(f, board) {
    var parts = [];
    if (f.pipeline) parts.push('pipeline=' + encodeURIComponent(f.pipeline));
    if (!board) {
      if (f.stage) parts.push('stage=' + encodeURIComponent(f.stage));
      if (f.status.join(',') !== 'Open') parts.push('status=' + f.status.join(','));
      if (f.sort !== 'submitted') parts.push('sort=' + f.sort);
      if (f.dir !== 'desc') parts.push('dir=' + f.dir);
    }
    var to = (board ? '#/grants/board' : '#/grants') + (parts.length ? '?' + parts.join('&') : '');
    if (to !== location.hash) history.replaceState(null, '', to);
  }
  function grantMatches(g, q) {
    if (!q) return true;
    var hay = fold(g.name + ' ' + (g.contactName || '') + ' ' + (g.contactEmail || '') + ' ' + (g.form || ''));
    return fold(q).split(' ').every(function (w) { return hay.indexOf(w) >= 0; });
  }
  function stageOrder(g) {
    var p = settings.pipelines.filter(function (x) { return x.name === g.pipeline; })[0];
    return p ? p.stages.map(function (x) { return x.name; }).indexOf(g.stage) : 99;
  }
  function grantKey(g, by) {
    if (by === 'contact') return fold(g.contactName || '');
    if (by === 'amount') return g.amount == null ? '' : g.amount;
    if (by === 'stage') return stageOrder(g);
    if (by === 'submitted' || by === 'closed') return g[by] || '';
    return fold(g[by]);
  }
  function grantsOrdered(list, f) {
    return list.slice().sort(function (a, b) {
      var x = grantKey(a, f.sort), y = grantKey(b, f.sort);
      if (x === '' && y !== '') return 1;
      if (y === '' && x !== '') return -1;
      var d = x < y ? -1 : x > y ? 1 : 0;
      return f.dir === 'asc' ? d : -d;
    });
  }

  function grantsView(board) {
    view.textContent = '';
    view.appendChild(quiet('Looking…'));
    return call('view=grants').then(function (r) {
      if (r.status !== 200) return refused(r);
      took(r.body);
      grants = r.body.grants || [];
      return board ? drawBoard(readGrantQuery()) : drawGrants(readGrantQuery());
    });
  }

  function drawGrants(f) {
    view.textContent = '';
    var h = heading(2, 'Grant requests');
    view.appendChild(h);
    var find = el('form', 'of-find');
    find.addEventListener('submit', function (e) { e.preventDefault(); });
    function field(id, label, input, hintText) {
      var w = el('div', 'of-field');
      var l = el('label', 'cb-lab', label); l.htmlFor = id; input.id = id;
      w.appendChild(l); w.appendChild(input);
      if (hintText) { var hn = el('p', 'cb-quiet of-hint', hintText); hn.id = id + '-hint'; input.setAttribute('aria-describedby', hn.id); w.appendChild(hn); }
      find.appendChild(w);
      return input;
    }
    var qBox = el('input', 'cb-say of-input'); qBox.type = 'search'; qBox.value = f.q; qBox.autocomplete = 'off';
    field('of-gq', 'Find a grant request', qBox, 'Any part of its name, its contact’s name or email, or its form entry.');
    var ps = el('select', 'cb-say of-input');
    field('of-gpipe', 'Pipeline', ps);
    var ss = el('select', 'cb-say of-input');
    var stageField = field('of-gstage', 'Stage', ss);
    var fs = el('fieldset', 'of-checks');
    fs.appendChild(el('legend', 'cb-lab', 'Status'));
    find.appendChild(fs);
    view.appendChild(find);
    var shown = el('p', 'of-shown');
    shown.setAttribute('aria-live', 'polite');
    view.appendChild(shown);
    var out = el('div', 'of-tablebox');
    view.appendChild(out);
    var more = el('p', 'of-row');
    view.appendChild(more);
    var showing = PAGE;

    function passes(g, skip) {
      if (skip !== 'pipeline' && f.pipeline && g.pipeline !== f.pipeline) return false;
      if (skip !== 'stage' && f.stage && g.stage !== f.stage) return false;
      if (skip !== 'status' && f.status.indexOf(g.status) < 0) return false;
      return grantMatches(g, f.q);
    }
    function count(skip, test) { return grants.filter(function (g) { return passes(g, skip) && test(g); }).length; }
    function drawFilters() {
      ps.textContent = '';
      var all = el('option', null, 'Every pipeline (' + count('pipeline', function () { return true; }) + ')'); all.value = ''; ps.appendChild(all);
      settings.pipelines.forEach(function (p) {
        var o = el('option', null, p.name + ' (' + count('pipeline', function (g) { return g.pipeline === p.name; }) + ')'); o.value = p.name; ps.appendChild(o);
      });
      ps.value = f.pipeline;
      ss.textContent = '';
      var any = el('option', null, 'Every stage (' + count('stage', function () { return true; }) + ')'); any.value = ''; ss.appendChild(any);
      var names = [];
      settings.pipelines.forEach(function (p) {
        if (f.pipeline && p.name !== f.pipeline) return;
        p.stages.forEach(function (x) { if (names.indexOf(x.name) < 0) names.push(x.name); });
      });
      if (f.stage && names.indexOf(f.stage) < 0) f.stage = '';
      names.forEach(function (n) { var o = el('option', null, n + ' (' + count('stage', function (g) { return g.stage === n; }) + ')'); o.value = n; ss.appendChild(o); });
      ss.value = f.stage;
      while (fs.children.length > 1) fs.removeChild(fs.lastChild);
      settings.statuses.forEach(function (st, i) {
        var c = el('input'); c.type = 'checkbox'; c.id = 'of-gst-' + i; c.value = st; c.checked = f.status.indexOf(st) >= 0;
        var l = el('label', 'of-check'); l.htmlFor = c.id;
        l.appendChild(c); l.appendChild(document.createTextNode(' ' + st + ' '));
        l.appendChild(el('span', 'of-n', '(' + count('status', function (g) { return g.status === st; }) + ')'));
        c.addEventListener('change', function () {
          f.status = Array.prototype.filter.call(fs.querySelectorAll('input'), function (x) { return x.checked; }).map(function (x) { return x.value; });
          refresh();
          var again = fs.querySelector('#of-gst-' + i); if (again) again.focus();
        });
        fs.appendChild(l);
      });
    }
    function refresh() { showing = PAGE; writeGrantQuery(f, false); drawFilters(); drawTable(); }
    ps.addEventListener('change', function () { f.pipeline = ps.value; refresh(); });
    ss.addEventListener('change', function () { f.stage = ss.value; refresh(); });
    qBox.addEventListener('input', function () { f.q = gSearched = qBox.value; showing = PAGE; drawFilters(); drawTable(); });

    function drawTable(focusSort, focusRow) {
      var list = grantsOrdered(grants.filter(function (g) { return passes(g); }), f);
      var sum = list.reduce(function (t, g) { return t + (g.amount || 0); }, 0);
      shown.textContent = list.length + ' of ' + grants.length + ' grant requests · ' + money(sum);
      out.textContent = '';
      more.textContent = '';
      if (!list.length) { out.appendChild(quiet(grants.length ? 'No grant request matches every filter.' : 'There are no grant requests yet.')); return; }
      var t = el('table', 'of-list');
      var some = list.slice(0, showing);
      t.appendChild(el('caption', 'sr', 'Grant requests, ' + some.length + ' of ' + list.length + ' shown. The column headings sort them.'));
      var hr = el('tr');
      GSORTS.forEach(function (c) {
        var th = el('th'); th.scope = 'col';
        var b = el('button', 'of-sort', c[1]); b.type = 'button';
        if (f.sort === c[0]) th.setAttribute('aria-sort', f.dir === 'asc' ? 'ascending' : 'descending');
        b.appendChild(el('span', null, f.sort === c[0] ? (f.dir === 'asc' ? ' ↑' : ' ↓') : ''));
        b.addEventListener('click', function () {
          f.dir = f.sort === c[0] && f.dir === 'asc' ? 'desc' : 'asc';
          f.sort = c[0];
          writeGrantQuery(f, false);
          drawTable(c[0]);
        });
        b.dataset.sort = c[0];
        th.appendChild(b);
        hr.appendChild(th);
      });
      var thead = el('thead'); thead.appendChild(hr); t.appendChild(thead);
      var tb = el('tbody');
      some.forEach(function (g, i) {
        var tr = el('tr');
        var td = el('td', 'of-title');
        var a = el('a', null, g.name); a.href = '#/g/' + g.id;
        if (i === focusRow) a.setAttribute('data-first-new', '');
        td.appendChild(a);
        tr.appendChild(td);
        var ct = el('td', 'of-mail');
        if (g.contact && !g.contactGone) { var ca = el('a', null, g.contactName || g.contactEmail); ca.href = '#/c/' + g.contact; ct.appendChild(ca); }
        else ct.textContent = g.contactGone ? 'A contact since deleted' : '—';
        tr.appendChild(ct);
        tr.appendChild(el('td', 'of-phone', g.pipeline));
        tr.appendChild(el('td', 'of-phone', g.stage));
        tr.appendChild(el('td', 'of-day', g.amount != null ? money(g.amount) : '—'));
        tr.appendChild(el('td', 'of-day', dayWords(g.submitted)));
        tr.appendChild(el('td', 'of-day', dayWords(g.closed)));
        tb.appendChild(tr);
      });
      t.appendChild(tb);
      out.appendChild(t);
      if (list.length > showing) {
        var b = el('button', 'cb-btn of-small', 'Show ' + Math.min(PAGE, list.length - showing) + ' more'); b.type = 'button';
        b.addEventListener('click', function () {
          var from = showing;
          showing += PAGE;
          drawTable(null, from);
          var next = out.querySelector('[data-first-new]');
          if (next) next.focus();
        });
        more.appendChild(b);
        more.appendChild(el('span', 'cb-quiet', some.length + ' of ' + list.length + ' shown'));
      }
      if (focusSort) { var sb = t.querySelector('[data-sort="' + focusSort + '"]'); if (sb) sb.focus(); }
    }
    drawFilters();
    drawTable();
    return h;
  }

  /* THE BOARD: one pipeline's stages as columns, after EspoCRM's Kanban, each
     saying how many it holds and what they come to. A card moves by dragging
     or by its own Move to, which is how a keyboard, a screen reader and a
     phone move it. The stages that decide a request keep their cards folded
     until opened, because they are long and nothing more happens to them. */
  var dragging = null;
  function drawBoard(f) {
    view.textContent = '';
    var p = settings.pipelines.filter(function (x) { return x.name === f.pipeline; })[0] || settings.pipelines[0];
    f.pipeline = p.name;
    writeGrantQuery(f, true);
    var h = heading(2, p.name + ': the board');
    view.appendChild(h);
    var row = el('div', 'of-row');
    var lab = el('label', 'cb-lab', 'Pipeline '); lab.htmlFor = 'of-bpipe';
    var ps = el('select', 'cb-say'); ps.id = 'of-bpipe';
    settings.pipelines.forEach(function (x) { var o = el('option', null, x.name); o.value = x.name; ps.appendChild(o); });
    ps.value = p.name;
    ps.addEventListener('change', function () { f.pipeline = ps.value; drawBoard(f); var again = view.querySelector('#of-bpipe'); if (again) again.focus(); });
    row.appendChild(lab); row.appendChild(ps);
    view.appendChild(row);
    var mine = grants.filter(function (g) { return g.pipeline === p.name; });
    var boardEl = el('div', 'of-board');
    p.stages.forEach(function (stage) {
      var here = grantsOrdered(mine.filter(function (g) { return g.stage === stage.name; }), { sort: 'submitted', dir: 'desc' });
      var sum = here.reduce(function (t, g) { return t + (g.amount || 0); }, 0);
      var col = el('section', 'of-col');
      col.setAttribute('aria-label', stage.name);
      col.appendChild(el('h3', 'of-col__name', stage.name + ' (' + here.length + ')'));
      col.appendChild(el('p', 'cb-quiet of-col__sum', money(sum)));
      var ul = el('ul', 'of-cards');
      ul.dataset.stage = stage.name;
      ul.addEventListener('dragover', function (e) { if (dragging) { e.preventDefault(); col.classList.add('of-col--over'); } });
      ul.addEventListener('dragleave', function () { col.classList.remove('of-col--over'); });
      ul.addEventListener('drop', function (e) {
        e.preventDefault(); col.classList.remove('of-col--over');
        var g = dragging; dragging = null;
        if (g && g.stage !== stage.name) moveGrant(g, stage.name, f, false);
      });
      here.forEach(function (g) { ul.appendChild(card(g, p, f)); });
      if (stage.status !== 'Open' && here.length) {
        var fold = el('details', 'of-fold');
        fold.appendChild(el('summary', 'of-fold__sum', 'Show the ' + here.length));
        fold.appendChild(ul);
        col.appendChild(fold);
      } else {
        col.appendChild(ul);
        if (!here.length) col.appendChild(quiet('None.'));
      }
      boardEl.appendChild(col);
    });
    view.appendChild(boardEl);
    return h;
  }
  function card(g, p, f) {
    var li = el('li', 'of-card');
    li.draggable = true;
    li.addEventListener('dragstart', function (e) { dragging = g; li.classList.add('of-card--lifted'); try { e.dataTransfer.setData('text/plain', g.id); e.dataTransfer.effectAllowed = 'move'; } catch (x) { /* an old browser */ } });
    li.addEventListener('dragend', function () { li.classList.remove('of-card--lifted'); dragging = null; });
    var a = el('a', 'of-card__name', g.name); a.href = '#/g/' + g.id;
    li.appendChild(a);
    var bits = [];
    if (g.contactName) bits.push(g.contactName);
    if (g.amount != null) bits.push(money(g.amount));
    if (g.submitted) bits.push('submitted ' + dayWords(g.submitted));
    if (bits.length) li.appendChild(el('p', 'cb-quiet', bits.join(' · ')));
    var mv = el('label', 'of-move');
    mv.appendChild(el('span', null, 'Move to '));
    var ms = el('select', 'cb-say');
    ms.setAttribute('aria-label', 'Move ' + g.name + ' to');
    ms.setAttribute('data-grant', g.id);
    p.stages.forEach(function (x) { var o = el('option', null, x.name); o.value = x.name; ms.appendChild(o); });
    ms.value = g.stage;
    ms.addEventListener('change', function () { moveGrant(g, ms.value, f, true); });
    mv.appendChild(ms);
    li.appendChild(mv);
    return li;
  }
  function moveGrant(g, to, f, keyboard) {
    call(null, { action: 'grant-save', id: g.id, stage: to }).then(function (r) {
      if (r.status !== 200) { say(why(r, 'That did not move. Nothing was changed.')); drawBoard(f); return; }
      var k = grants.findIndex(function (x) { return x.id === g.id; });
      if (k >= 0) { var w = r.body.grant; grants[k] = Object.assign({}, w, { words: (w.body || '').length }); }
      drawBoard(f);
      if (keyboard) {
        var again = view.querySelector('select[data-grant="' + g.id + '"]');
        var shut = again && again.closest('details');
        if (shut) shut.open = true;
        if (again) again.focus();
      }
      say('Moved to ' + to + '.');
    });
  }

  /* ── One grant request ─────────────────────────────────────────────────── */

  function grantView(id) {
    view.textContent = '';
    view.appendChild(quiet('Looking…'));
    return call('view=grant&id=' + encodeURIComponent(id)).then(function (r) {
      if (r.status !== 200) {
        if (r.status === 404) { view.textContent = ''; var h0 = heading(2, 'That grant request has been deleted'); view.appendChild(h0); view.appendChild(backTo('#/grants', '← All grant requests')); return h0; }
        return refused(r);
      }
      took(r.body);
      return drawGrant(r.body.grant);
    });
  }

  function drawGrant(g) {
    view.textContent = '';
    view.appendChild(backTo('#/grants', '← All grant requests'));
    var h = heading(2, g.name);
    view.appendChild(h);
    var dl = el('dl', 'of-facts');
    function fact(k, v) { if (v == null || v === '') return; dl.appendChild(el('dt', null, k)); var dd = el('dd'); if (typeof v === 'string') dd.textContent = v; else dd.appendChild(v); dl.appendChild(dd); }
    fact('Pipeline', g.pipeline);
    fact('Stage', g.stage);
    fact('Amount', g.amount != null ? money(g.amount) : 'None given');
    fact('Submitted', dayWords(g.submitted) || 'Not given');
    if (g.closed) fact(g.status === 'Granted' ? 'Granted' : 'Decided', dayWords(g.closed));
    if (g.contact && !g.contactGone) {
      var cs = el('span'); var ca = el('a', null, g.contactName || g.contactEmail); ca.href = '#/c/' + g.contact; cs.appendChild(ca);
      if (g.contactEmail && g.contactName) cs.appendChild(document.createTextNode(' · ' + g.contactEmail));
      fact('Contact', cs);
    } else fact('Contact', g.contactGone ? 'A contact since deleted' : 'None');
    if (g.form) fact('Form entry', '#' + g.form);
    fact('Added', (g.by ? g.by + ', ' : '') + when(g.t) + (g.espo ? ', in EspoCRM' : ''));
    if (g.edited) fact('Changed', (g.editedBy ? g.editedBy + ', ' : '') + when(g.edited));
    view.appendChild(dl);
    var body = el('div', 'of-body');
    if (g.blocks && g.blocks.length) window.loveMarkdown.blocks(g.blocks, body, { top: 2, prefix: 'of' });
    else body.appendChild(quiet('No description.'));
    view.appendChild(body);
    var tools = el('div', 'of-row');
    var mv = el('label', 'of-move');
    mv.appendChild(el('span', null, 'Move to '));
    var ms = el('select', 'cb-say');
    var p = settings.pipelines.filter(function (x) { return x.name === g.pipeline; })[0];
    (p ? p.stages : []).forEach(function (x) { var o = el('option', null, x.name); o.value = x.name; ms.appendChild(o); });
    ms.value = g.stage;
    ms.addEventListener('change', function () {
      ms.disabled = true;
      call(null, { action: 'grant-save', id: g.id, stage: ms.value }).then(function (r) {
        ms.disabled = false;
        if (r.status !== 200) { ms.value = g.stage; say(why(r, 'That did not move. Nothing was changed.')); return; }
        drawGrant(r.body.grant);
        var again = view.querySelector('.of-move select'); if (again) again.focus();
        say('Moved to ' + r.body.grant.stage + '.');
      });
    });
    mv.appendChild(ms);
    tools.appendChild(mv);
    var edit = el('a', 'cb-btn of-small', 'Edit'); edit.href = '#/grants/edit/' + g.id;
    tools.appendChild(edit);
    var del = el('button', 'cb-btn of-small', 'Delete'); del.type = 'button';
    del.addEventListener('click', function () {
      sure(tools, 'This deletes “' + g.name + '” for everybody. It cannot be put back' + (g.espo ? ', and bringing grant requests over from EspoCRM again leaves it deleted.' : '.'), 'Delete it', function (done) {
        call(null, { action: 'grant-remove', id: g.id }).then(function (r) {
          done();
          if (r.status !== 200) { say(why(r, 'That did not delete. Nothing was changed.')); return; }
          say('Deleted.');
          location.hash = '#/grants';
        });
      }, del);
    });
    tools.appendChild(del);
    view.appendChild(tools);
    return h;
  }

  /* ── Adding and changing a grant request ───────────────────────────────── */

  function grantFormView(id, contact) {
    view.textContent = '';
    view.appendChild(quiet('Looking…'));
    var ask = id ? call('view=grant&id=' + encodeURIComponent(id)) : contact ? call('view=contact&id=' + encodeURIComponent(contact)) : call('view=grants');
    return ask.then(function (r) {
      if (r.status !== 200 && !(contact && r.status === 404)) return refused(r);
      took(r.body);
      return drawGrantForm(id ? r.body.grant : null, !id && r.body.contact ? r.body.contact : null);
    });
  }

  function drawGrantForm(g, from) {
    view.textContent = '';
    view.appendChild(g ? backTo('#/g/' + g.id, '← ' + g.name) : backTo('#/grants', '← All grant requests'));
    var h = heading(2, g ? 'Changing “' + g.name + '”' : 'A new grant request');
    view.appendChild(h);
    var form = el('form', 'of-form');
    form.noValidate = true;
    function field(id, label, input, hintText) {
      var w = el('div', 'of-field');
      var l = el('label', 'cb-lab', label); l.htmlFor = id; input.id = id;
      w.appendChild(l); w.appendChild(input);
      if (hintText) { var hn = el('p', 'cb-quiet of-hint', hintText); hn.id = id + '-hint'; input.setAttribute('aria-describedby', hn.id); w.appendChild(hn); }
      form.appendChild(w);
      return input;
    }
    var name = el('input', 'cb-say of-input'); name.maxLength = settings.grantNameMax; name.value = g ? g.name : (from ? 'Grant request: ' + (from.name || '') : '');
    field('of-gname', 'Name', name).parentNode.classList.add('of-wide');
    var pipe = el('select', 'cb-say of-input');
    settings.pipelines.forEach(function (p) { var o = el('option', null, p.name); o.value = p.name; pipe.appendChild(o); });
    pipe.value = g ? g.pipeline : settings.pipelines[0].name;
    field('of-gpipeline', 'Pipeline', pipe);
    var stage = el('select', 'cb-say of-input');
    field('of-gstagein', 'Stage', stage, 'Granted or Denied sets the day it was decided, if none is given.');
    function stages(keep) {
      var p = settings.pipelines.filter(function (x) { return x.name === pipe.value; })[0];
      stage.textContent = '';
      p.stages.forEach(function (x) { var o = el('option', null, x.name); o.value = x.name; stage.appendChild(o); });
      stage.value = keep && p.stages.some(function (x) { return x.name === keep; }) ? keep : p.stages[0].name;
    }
    stages(g ? g.stage : null);
    pipe.addEventListener('change', function () { stages(stage.value); });
    var amount = el('input', 'cb-say of-input'); amount.type = 'number'; amount.min = '0'; amount.max = String(settings.amountMax); amount.step = '1';
    amount.value = g && g.amount != null ? String(g.amount) : '';
    field('of-gamount', 'Amount, in whole dollars', amount);
    var sub = el('input', 'cb-say of-input'); sub.type = 'date'; sub.value = g && g.submitted ? g.submitted : '';
    field('of-gsub', 'Submitted', sub);
    var closed = el('input', 'cb-say of-input'); closed.type = 'date'; closed.value = g && g.closed ? g.closed : '';
    field('of-gclosed', 'Decided', closed, 'Cleared when it moves back to an open stage.');
    var email = el('input', 'cb-say of-input'); email.type = 'email'; email.autocomplete = 'off';
    email.value = g ? (g.contactEmail || '') : (from ? from.email || '' : '');
    field('of-gcontact', 'Contact’s email', email, 'The email of a contact already in the office, to link them. Empty for none.');
    var formNo = el('input', 'cb-say of-input'); formNo.type = 'number'; formNo.min = '1'; formNo.step = '1'; formNo.value = g && g.form ? String(g.form) : '';
    field('of-gform', 'Form entry', formNo, 'Its number on stimpunks.org, if it came in through a form.');
    var text = el('textarea', 'cb-say of-text'); text.rows = 8; text.maxLength = settings.grantBodyMax; text.value = g ? g.body : '';
    field('of-gbody', 'Description', text, 'Markdown works: **bold**, _italic_, lists, > quotes, `code`, links and tables.');
    var preview = el('div', 'of-body of-preview'); preview.hidden = true;
    form.appendChild(preview);
    var row = el('div', 'of-row');
    var go = el('button', 'cb-btn', g ? 'Save' : 'Add the grant request'); go.type = 'submit';
    var look = el('button', 'cb-btn', 'Preview the description'); look.type = 'button'; look.setAttribute('aria-pressed', 'false');
    var cancel = el('a', 'cb-btn', 'Cancel'); cancel.href = g ? '#/g/' + g.id : (from ? '#/c/' + from.id : '#/grants');
    row.appendChild(go); row.appendChild(look); row.appendChild(cancel);
    form.appendChild(row);
    var answer = el('p', 'of-answer'); answer.setAttribute('role', 'status');
    form.appendChild(answer);
    look.addEventListener('click', function () {
      if (!preview.hidden) { preview.hidden = true; look.setAttribute('aria-pressed', 'false'); look.textContent = 'Preview the description'; return; }
      if (!text.value.trim()) { answer.textContent = 'There is no description to preview yet.'; return; }
      call(null, { action: 'preview', body: text.value }).then(function (r) {
        if (r.status !== 200) { answer.textContent = why(r, 'The preview could not be made just now.'); return; }
        preview.textContent = '';
        window.loveMarkdown.blocks(r.body.blocks, preview, { top: 2, prefix: 'of' });
        preview.hidden = false;
        look.setAttribute('aria-pressed', 'true');
        look.textContent = 'Hide the preview';
      });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = { name: name.value, pipeline: pipe.value, stage: stage.value, amount: amount.value === '' ? null : Number(amount.value),
        submitted: sub.value || null, closed: closed.value || null, contactEmail: email.value.trim(), form: formNo.value === '' ? null : Number(formNo.value), body: text.value };
      var send = { action: 'grant-save' };
      if (g) {
        send.id = g.id;
        var was = { name: g.name, pipeline: g.pipeline, stage: g.stage, amount: g.amount, submitted: g.submitted, closed: g.closed,
          contactEmail: g.contactEmail || '', form: g.form, body: g.body };
        Object.keys(v).forEach(function (k) { if (JSON.stringify(was[k] == null ? null : was[k]) !== JSON.stringify(v[k] === '' && k !== 'contactEmail' && k !== 'body' ? null : v[k])) send[k] = v[k]; });
        // A pipeline changed sends its stage with it, so the stage is checked against the new one.
        if (send.pipeline) send.stage = v.stage;
        if (Object.keys(send).length === 2) { location.hash = '#/g/' + g.id; return; }
      } else Object.keys(v).forEach(function (k) { send[k] = v[k]; });
      go.disabled = true;
      answer.textContent = 'Saving…';
      call(null, send).then(function (r) {
        go.disabled = false;
        if (r.status !== 200) { answer.textContent = why(r, 'That did not save. Nothing was changed.'); return; }
        location.hash = '#/g/' + r.body.grant.id;
        say(g ? 'Saved.' : 'Added.');
      });
    });
    view.appendChild(form);
    return h;
  }

  /* ── Refusals ──────────────────────────────────────────────────────────── */

  function refused(r) {
    view.textContent = '';
    var h = heading(2, r.status === 403 ? 'The office is for our directors and administrators' : 'The office');
    view.appendChild(h);
    view.appendChild(el('p', null, why(r, 'The office could not be read just now.')));
    if (r.status === 401) view.appendChild(el('p', null, 'Your pass has stopped working, which happens when a password changes. Sign on to the CB again from the radio in the corner.'));
    return h;
  }
  function guest() {
    view.textContent = '';
    var h = heading(2, 'Sign on to open the office');
    view.appendChild(h);
    view.appendChild(el('p', null, 'The office holds the people and organisations we are in touch with, for our directors and administrators. Sign on to the CB with the bar in the corner of your screen, with your claimed username.'));
    var p = el('p'); var a = el('a', null, 'What the office keeps'); a.href = '/privacy.html#office'; p.appendChild(a);
    view.appendChild(p);
    return h;
  }

  /* ── Where in the office an address is ─────────────────────────────────── */

  var first = true;
  function route() {
    dressNow();
    var hash = location.hash || '';
    if (hash && hash.indexOf('#/') !== 0) hash = '';
    var parts = hash.slice(1).split('?')[0].split('/').filter(Boolean);
    var done;
    if (!cbState()) done = Promise.resolve(guest());
    else if (parts[0] === 'contacts' && parts[1] === 'new') done = formView(null);
    else if (parts[0] === 'contacts' && parts[1] === 'edit' && parts[2]) done = formView(parts[2]);
    else if (parts[0] === 'c' && parts[1]) done = contactView(parts[1]);
    else if (parts[0] === 'grants' && parts[1] === 'board') done = grantsView(true);
    else if (parts[0] === 'grants' && parts[1] === 'new') done = grantFormView(null, (/[?&]contact=([^&]+)/.exec(hash) || [])[1] || null);
    else if (parts[0] === 'grants' && parts[1] === 'edit' && parts[2]) done = grantFormView(parts[2], null);
    else if (parts[0] === 'grants') done = grantsView(false);
    else if (parts[0] === 'g' && parts[1]) done = grantView(parts[1]);
    else done = contactsView();
    [navContacts, navGrants, navBoard, navNew, navNewGrant].forEach(function (a) { a.removeAttribute('aria-current'); });
    if (parts[0] === 'contacts' && parts[1] === 'new') navNew.setAttribute('aria-current', 'page');
    else if (parts[0] === 'grants' && parts[1] === 'new') navNewGrant.setAttribute('aria-current', 'page');
    else if (parts[0] === 'grants' && parts[1] === 'board') navBoard.setAttribute('aria-current', 'page');
    else if (parts[0] === 'grants' && !parts[1]) navGrants.setAttribute('aria-current', 'page');
    else if (!parts.length) navContacts.setAttribute('aria-current', 'page');
    Promise.resolve(done).then(function (h) { if (h && !first) h.focus(); first = false; });
  }
  window.addEventListener('hashchange', function () { if ((location.hash || '').indexOf('#/') === 0 || !location.hash) route(); });
  route();
})();

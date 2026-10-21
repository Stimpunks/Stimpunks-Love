/* =============================================================================
   The office: contacts, grant requests and cases, moved here from EspoCRM. Ryan's brief, 2026-10-20. See netlify/cb/lib.mjs, the
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
  var navDash = el('a', 'cb-btn of-navlink', 'Dashboard'); navDash.href = '#/dashboard';
  var navContacts = el('a', 'cb-btn of-navlink', 'Contacts'); navContacts.href = '#/';
  var navGrants = el('a', 'cb-btn of-navlink', 'Grant requests'); navGrants.href = '#/grants';
  var navCases = el('a', 'cb-btn of-navlink', 'Cases'); navCases.href = '#/cases';
  var navMailings = el('a', 'cb-btn of-navlink', 'Mailings'); navMailings.href = '#/mailings';
  [navDash, navContacts, navGrants, navCases, navMailings].forEach(function (a) { nav.appendChild(a); });
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
    setTimeout(toneNow, 0);
  }
  /* Light or dark, measured off the case the theme gives the office, so a
     chart takes the light or the dark step of each colour, as tasks do. */
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
  /* Links into the team mailbox in Gmail. They open Gmail, signed in as whoever
     opens them; the office fetches nothing from Google. */
  function gmailBase(mailbox) { return 'https://mail.google.com/mail/' + (mailbox ? 'u/' + encodeURIComponent(mailbox) + '/' : ''); }
  function gmailThread(mailbox, thread) { return gmailBase(mailbox) + '#all/' + encodeURIComponent(thread); }
  function gmailCompose(mailbox, to, subject) {
    return gmailBase(mailbox) + '?view=cm&fs=1&to=' + encodeURIComponent(to) + (subject ? '&su=' + encodeURIComponent(subject) : '');
  }
  function outLink(href, words) { var a = el('a', null, words); a.href = href; a.target = '_blank'; a.rel = 'noopener noreferrer'; return a; }
  function viewLinks(list) {
    var row = el('p', 'of-row');
    list.forEach(function (x) {
      var a = el('a', 'cb-btn of-small', x[1]); a.href = x[0];
      if (x[2]) a.setAttribute('aria-current', 'page');
      row.appendChild(a);
    });
    return row;
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
    view.appendChild(viewLinks([['#/contacts/new', 'New contact']]));
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
    view.appendChild(el('h3', null, 'Emails'));
    var mail = c.mail || [];
    if (c.email) {
      var wr = el('p', 'of-row');
      wr.appendChild(outLink(gmailCompose(c.mailbox, c.email, ''), 'Write to them in Gmail'));
      if (c.noEmail) wr.appendChild(tag('THEY ASKED NOT TO BE EMAILED'));
      view.appendChild(wr);
    }
    if (mail.length) {
      view.appendChild(el('p', 'of-shown', mail.length + (mail.length === 1 ? ' email' : ' emails') + ' with the team mailbox'));
      var ml = el('ul', 'of-theirs');
      mail.forEach(function (m) {
        var li = el('li');
        li.appendChild(el('span', 'of-day', dayOf(m.at) + ' · ' + (m.out ? 'to them' : 'from them') + ' · '));
        var a = el('a', null, m.subject || '(no subject)'); a.href = '#/m/' + m.id;
        li.appendChild(a);
        ml.appendChild(li);
      });
      view.appendChild(ml);
    } else view.appendChild(quiet('None yet. Emails with them reach the office from the team mailbox.'));
    view.appendChild(el('h3', null, 'Cases'));
    var theirCases = c.cases || [];
    if (theirCases.length) {
      var kl = el('ul', 'of-theirs');
      theirCases.forEach(function (k) {
        var li = el('li');
        var a = el('a', null, '#' + k.number + ' ' + k.name); a.href = '#/k/' + k.id;
        li.appendChild(a);
        li.appendChild(document.createTextNode(' · ' + k.type + ', ' + k.status + (k.submitted ? ', submitted ' + dayWords(k.submitted) : '')));
        kl.appendChild(li);
      });
      view.appendChild(kl);
    } else view.appendChild(quiet('None.'));
    var tools = el('div', 'of-row');
    var newGrant = el('a', 'cb-btn of-small', 'New grant request from them'); newGrant.href = '#/grants/new?contact=' + c.id;
    tools.appendChild(newGrant);
    var newCase = el('a', 'cb-btn of-small', 'New case from them'); newCase.href = '#/cases/new?contact=' + c.id;
    tools.appendChild(newCase);
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
    view.appendChild(viewLinks([['#/grants', 'List', true], ['#/grants/board', 'Board'], ['#/grants/new', 'New grant request']]));
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
    var mailRow = el('p', 'of-row');
    view.appendChild(mailRow);
    var out = el('div', 'of-tablebox');
    view.appendChild(out);
    var more = el('p', 'of-row');
    view.appendChild(more);
    var showing = PAGE;
    // Down to one stage of one pipeline, the list can be a mailing.
    function drawMailRow() {
      mailRow.textContent = '';
      if (!f.pipeline || !f.stage) return;
      var a = el('a', 'cb-btn of-small', 'Email everyone at ' + f.stage);
      a.href = '#/mailings/new?pipeline=' + encodeURIComponent(f.pipeline) + '&stage=' + encodeURIComponent(f.stage);
      mailRow.appendChild(a);
    }

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
    function refresh() { showing = PAGE; writeGrantQuery(f, false); drawFilters(); drawMailRow(); drawTable(); }
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
    drawMailRow();
    drawTable();
    return h;
  }

  /* A BOARD, after EspoCRM's Kanban, for grant requests by stage and cases by
     status: a column for each, saying how many it holds (and, for grant
     requests, what they come to). A card moves by dragging or by its own Move
     to, which is how a keyboard, a screen reader and a phone move it. The
     columns that close a record keep their cards folded until opened, because
     they are long and nothing more happens to them. */
  var dragging = null;
  function columnBoard(o) {
    var boardEl = el('div', 'of-board');
    o.cols.forEach(function (colDef) {
      var here = o.items.filter(function (x) { return o.valueOf(x) === colDef.name; });
      var col = el('section', 'of-col');
      col.setAttribute('aria-label', colDef.name);
      col.appendChild(el('h3', 'of-col__name', colDef.name + ' (' + here.length + ')'));
      if (o.sum) col.appendChild(el('p', 'cb-quiet of-col__sum', o.sum(here)));
      var ul = el('ul', 'of-cards');
      ul.addEventListener('dragover', function (e) { if (dragging) { e.preventDefault(); col.classList.add('of-col--over'); } });
      ul.addEventListener('dragleave', function () { col.classList.remove('of-col--over'); });
      ul.addEventListener('drop', function (e) {
        e.preventDefault(); col.classList.remove('of-col--over');
        var x = dragging; dragging = null;
        if (x && o.valueOf(x) !== colDef.name) o.move(x, colDef.name, false);
      });
      here.forEach(function (x) { ul.appendChild(boardCard(x, o)); });
      if (colDef.fold && here.length) {
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
    return boardEl;
  }
  function boardCard(x, o) {
    var li = el('li', 'of-card');
    li.draggable = true;
    li.addEventListener('dragstart', function (e) { dragging = x; li.classList.add('of-card--lifted'); try { e.dataTransfer.setData('text/plain', x.id); e.dataTransfer.effectAllowed = 'move'; } catch (er) { /* an old browser */ } });
    li.addEventListener('dragend', function () { li.classList.remove('of-card--lifted'); dragging = null; });
    var a = el('a', 'of-card__name', o.title(x)); a.href = o.href(x);
    li.appendChild(a);
    var bits = o.bits(x).filter(Boolean);
    if (bits.length) li.appendChild(el('p', 'cb-quiet', bits.join(' · ')));
    var mv = el('label', 'of-move');
    mv.appendChild(el('span', null, 'Move to '));
    var ms = el('select', 'cb-say');
    ms.setAttribute('aria-label', 'Move ' + o.title(x) + ' to');
    ms.setAttribute('data-item', x.id);
    o.cols.forEach(function (c) { var op = el('option', null, c.name); op.value = c.name; ms.appendChild(op); });
    ms.value = o.valueOf(x);
    ms.addEventListener('change', function () { o.move(x, ms.value, true); });
    mv.appendChild(ms);
    li.appendChild(mv);
    return li;
  }
  /* After a move, the board is drawn again and the keyboard goes back to the
     card's Move to, opening its column if that column folds. */
  function backToCard(id) {
    var again = view.querySelector('select[data-item="' + id + '"]');
    var shut = again && again.closest('details');
    if (shut) shut.open = true;
    if (again) again.focus();
  }

  function drawBoard(f) {
    view.textContent = '';
    var p = settings.pipelines.filter(function (x) { return x.name === f.pipeline; })[0] || settings.pipelines[0];
    f.pipeline = p.name;
    writeGrantQuery(f, true);
    var h = heading(2, p.name + ': the board');
    view.appendChild(h);
    view.appendChild(viewLinks([['#/grants', 'List'], ['#/grants/board', 'Board', true], ['#/grants/new', 'New grant request']]));
    var row = el('div', 'of-row');
    var lab = el('label', 'cb-lab', 'Pipeline '); lab.htmlFor = 'of-bpipe';
    var ps = el('select', 'cb-say'); ps.id = 'of-bpipe';
    settings.pipelines.forEach(function (x) { var op = el('option', null, x.name); op.value = x.name; ps.appendChild(op); });
    ps.value = p.name;
    ps.addEventListener('change', function () { f.pipeline = ps.value; drawBoard(f); var again = view.querySelector('#of-bpipe'); if (again) again.focus(); });
    row.appendChild(lab); row.appendChild(ps);
    view.appendChild(row);
    view.appendChild(columnBoard({
      cols: p.stages.map(function (x) { return { name: x.name, fold: x.status !== 'Open' }; }),
      items: grantsOrdered(grants.filter(function (g) { return g.pipeline === p.name; }), { sort: 'submitted', dir: 'desc' }),
      valueOf: function (g) { return g.stage; },
      sum: function (here) { return money(here.reduce(function (t, g) { return t + (g.amount || 0); }, 0)); },
      title: function (g) { return g.name; },
      href: function (g) { return '#/g/' + g.id; },
      bits: function (g) { return [g.contactName, g.amount != null ? money(g.amount) : null, g.submitted ? 'submitted ' + dayWords(g.submitted) : null]; },
      move: function (g, to, keyboard) {
        call(null, { action: 'grant-save', id: g.id, stage: to }).then(function (r) {
          if (r.status !== 200) { say(why(r, 'That did not move. Nothing was changed.')); drawBoard(f); return; }
          var k = grants.findIndex(function (x) { return x.id === g.id; });
          if (k >= 0) { var w = r.body.grant; grants[k] = Object.assign({}, w, { words: (w.body || '').length }); }
          drawBoard(f);
          if (keyboard) backToCard(g.id);
          say('Moved to ' + to + '.');
        });
      },
    }));
    return h;
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


  /* ── Cases: connection requests and volunteer applications ─────────────── */

  /* The list opens on the open cases, newest number first. Its type, statuses
     and order live in the address; a search does not, for the contacts' reason. */
  var KSORTS = [['number', 'No.'], ['name', 'Name'], ['contact', 'Contact'], ['type', 'Type'], ['status', 'Status'], ['priority', 'Priority'],
    ['submitted', 'Submitted'], ['closed', 'Closed']];
  var kSearched = '', cases = [];
  function openStatuses() { return settings.cases.statuses.filter(function (x) { return x.open; }).map(function (x) { return x.name; }); }
  function readCaseQuery() {
    var q = {};
    (String(location.hash).split('?')[1] || '').split('&').forEach(function (kv) {
      var i = kv.indexOf('=');
      if (i > 0) { try { q[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1)); } catch (e) { /* a broken address keeps its defaults */ } }
    });
    var names = settings.cases.statuses.map(function (x) { return x.name; });
    return {
      q: kSearched,
      type: settings.cases.types.indexOf(q.type) >= 0 ? q.type : '',
      status: q.status != null ? q.status.split(',').filter(function (x) { return names.indexOf(x) >= 0; }) : openStatuses(),
      sort: KSORTS.some(function (x) { return x[0] === q.sort; }) ? q.sort : 'number',
      dir: q.dir === 'asc' ? 'asc' : (q.dir === 'desc' || !q.sort ? 'desc' : 'asc'),
    };
  }
  function writeCaseQuery(f, board) {
    var parts = [];
    if (f.type) parts.push('type=' + encodeURIComponent(f.type));
    if (!board) {
      if (f.status.join(',') !== openStatuses().join(',')) parts.push('status=' + f.status.map(encodeURIComponent).join(','));
      if (f.sort !== 'number') parts.push('sort=' + f.sort);
      if (f.dir !== 'desc') parts.push('dir=' + f.dir);
    }
    var to = (board ? '#/cases/board' : '#/cases') + (parts.length ? '?' + parts.join('&') : '');
    if (to !== location.hash) history.replaceState(null, '', to);
  }
  function caseMatches(k, q) {
    if (!q) return true;
    var hay = fold('#' + k.number + ' ' + k.name + ' ' + (k.contactName || '') + ' ' + (k.contactEmail || '') + ' ' + (k.form || ''));
    return fold(q).split(' ').every(function (w) { return hay.indexOf(w) >= 0; });
  }
  function caseKey(k, by) {
    if (by === 'contact') return fold(k.contactName || '');
    if (by === 'number') return k.number;
    if (by === 'status') return settings.cases.statuses.map(function (x) { return x.name; }).indexOf(k.status);
    if (by === 'priority') return settings.cases.priorities.indexOf(k.priority);
    if (by === 'submitted' || by === 'closed') return k[by] || '';
    return fold(k[by]);
  }
  function casesOrdered(list, f) {
    return list.slice().sort(function (a, b) {
      var x = caseKey(a, f.sort), y = caseKey(b, f.sort);
      if (x === '' && y !== '') return 1;
      if (y === '' && x !== '') return -1;
      var d = x < y ? -1 : x > y ? 1 : 0;
      return f.dir === 'asc' ? d : -d;
    });
  }

  function casesView(board) {
    view.textContent = '';
    view.appendChild(quiet('Looking…'));
    return call('view=cases').then(function (r) {
      if (r.status !== 200) return refused(r);
      took(r.body);
      cases = r.body.cases || [];
      return board ? drawCaseBoard(readCaseQuery()) : drawCases(readCaseQuery());
    });
  }

  function drawCases(f) {
    view.textContent = '';
    var h = heading(2, 'Cases');
    view.appendChild(h);
    view.appendChild(viewLinks([['#/cases', 'List', true], ['#/cases/board', 'Board'], ['#/cases/new', 'New case']]));
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
    field('of-kq', 'Find a case', qBox, 'Its number, any part of its name, its contact’s name or email, or its form entry.');
    var ts = el('select', 'cb-say of-input');
    field('of-ktype', 'Type', ts);
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

    function passes(k, skip) {
      if (skip !== 'type' && f.type && k.type !== f.type) return false;
      if (skip !== 'status' && f.status.indexOf(k.status) < 0) return false;
      return caseMatches(k, f.q);
    }
    function count(skip, test) { return cases.filter(function (k) { return passes(k, skip) && test(k); }).length; }
    function drawFilters() {
      ts.textContent = '';
      var all = el('option', null, 'Every type (' + count('type', function () { return true; }) + ')'); all.value = ''; ts.appendChild(all);
      settings.cases.types.forEach(function (t) {
        var o = el('option', null, t + ' (' + count('type', function (k) { return k.type === t; }) + ')'); o.value = t; ts.appendChild(o);
      });
      ts.value = f.type;
      while (fs.children.length > 1) fs.removeChild(fs.lastChild);
      settings.cases.statuses.forEach(function (st, i) {
        var c = el('input'); c.type = 'checkbox'; c.id = 'of-kst-' + i; c.value = st.name; c.checked = f.status.indexOf(st.name) >= 0;
        var l = el('label', 'of-check'); l.htmlFor = c.id;
        l.appendChild(c); l.appendChild(document.createTextNode(' ' + st.name + ' '));
        l.appendChild(el('span', 'of-n', '(' + count('status', function (k) { return k.status === st.name; }) + ')'));
        c.addEventListener('change', function () {
          f.status = Array.prototype.filter.call(fs.querySelectorAll('input'), function (x) { return x.checked; }).map(function (x) { return x.value; });
          refresh();
          var again = fs.querySelector('#of-kst-' + i); if (again) again.focus();
        });
        fs.appendChild(l);
      });
    }
    function refresh() { showing = PAGE; writeCaseQuery(f, false); drawFilters(); drawTable(); }
    ts.addEventListener('change', function () { f.type = ts.value; refresh(); });
    qBox.addEventListener('input', function () { f.q = kSearched = qBox.value; showing = PAGE; drawFilters(); drawTable(); });

    function drawTable(focusSort, focusRow) {
      var list = casesOrdered(cases.filter(function (k) { return passes(k); }), f);
      shown.textContent = list.length + ' of ' + cases.length + ' cases';
      out.textContent = '';
      more.textContent = '';
      if (!list.length) { out.appendChild(quiet(cases.length ? 'No case matches every filter.' : 'There are no cases yet.')); return; }
      var t = el('table', 'of-list');
      var some = list.slice(0, showing);
      t.appendChild(el('caption', 'sr', 'Cases, ' + some.length + ' of ' + list.length + ' shown. The column headings sort them.'));
      var hr = el('tr');
      KSORTS.forEach(function (c) {
        var th = el('th'); th.scope = 'col';
        var b = el('button', 'of-sort', c[1]); b.type = 'button';
        if (f.sort === c[0]) th.setAttribute('aria-sort', f.dir === 'asc' ? 'ascending' : 'descending');
        b.appendChild(el('span', null, f.sort === c[0] ? (f.dir === 'asc' ? ' ↑' : ' ↓') : ''));
        b.addEventListener('click', function () {
          f.dir = f.sort === c[0] && f.dir === 'asc' ? 'desc' : 'asc';
          f.sort = c[0];
          writeCaseQuery(f, false);
          drawTable(c[0]);
        });
        b.dataset.sort = c[0];
        th.appendChild(b);
        hr.appendChild(th);
      });
      var thead = el('thead'); thead.appendChild(hr); t.appendChild(thead);
      var tb = el('tbody');
      some.forEach(function (k, i) {
        var tr = el('tr');
        tr.appendChild(el('td', 'of-day', '#' + k.number));
        var td = el('td', 'of-title');
        var a = el('a', null, k.name); a.href = '#/k/' + k.id;
        if (i === focusRow) a.setAttribute('data-first-new', '');
        td.appendChild(a);
        tr.appendChild(td);
        var ct = el('td', 'of-mail');
        if (k.contact && !k.contactGone) { var ca = el('a', null, k.contactName || k.contactEmail); ca.href = '#/c/' + k.contact; ct.appendChild(ca); }
        else ct.textContent = k.contactGone ? 'A contact since deleted' : '—';
        tr.appendChild(ct);
        tr.appendChild(el('td', 'of-phone', k.type));
        tr.appendChild(el('td', 'of-phone', k.status));
        tr.appendChild(el('td', 'of-phone', k.priority));
        tr.appendChild(el('td', 'of-day', dayWords(k.submitted)));
        tr.appendChild(el('td', 'of-day', dayWords(k.closed)));
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

  function drawCaseBoard(f) {
    view.textContent = '';
    writeCaseQuery(f, true);
    var h = heading(2, (f.type ? f.type + 's' : 'Cases') + ': the board');
    view.appendChild(h);
    view.appendChild(viewLinks([['#/cases', 'List'], ['#/cases/board', 'Board', true], ['#/cases/new', 'New case']]));
    var row = el('div', 'of-row');
    var lab = el('label', 'cb-lab', 'Type '); lab.htmlFor = 'of-btype';
    var ts = el('select', 'cb-say'); ts.id = 'of-btype';
    var any = el('option', null, 'Every type'); any.value = ''; ts.appendChild(any);
    settings.cases.types.forEach(function (x) { var op = el('option', null, x); op.value = x; ts.appendChild(op); });
    ts.value = f.type;
    ts.addEventListener('change', function () { f.type = ts.value; drawCaseBoard(f); var again = view.querySelector('#of-btype'); if (again) again.focus(); });
    row.appendChild(lab); row.appendChild(ts);
    view.appendChild(row);
    view.appendChild(columnBoard({
      cols: settings.cases.statuses.map(function (x) { return { name: x.name, fold: !x.open }; }),
      items: casesOrdered(cases.filter(function (k) { return !f.type || k.type === f.type; }), { sort: 'number', dir: 'desc' }),
      valueOf: function (k) { return k.status; },
      title: function (k) { return '#' + k.number + ' ' + k.name; },
      href: function (k) { return '#/k/' + k.id; },
      bits: function (k) { return [f.type ? null : k.type, k.contactName, k.submitted ? 'submitted ' + dayWords(k.submitted) : null]; },
      move: function (k, to, keyboard) {
        call(null, { action: 'case-save', id: k.id, status: to }).then(function (r) {
          if (r.status !== 200) { say(why(r, 'That did not move. Nothing was changed.')); drawCaseBoard(f); return; }
          var i = cases.findIndex(function (x) { return x.id === k.id; });
          if (i >= 0) { var w = r.body.case; cases[i] = Object.assign({}, w, { words: (w.body || '').length }); }
          drawCaseBoard(f);
          if (keyboard) backToCard(k.id);
          say('Moved to ' + to + '.');
        });
      },
    }));
    return h;
  }

  function caseView(id) {
    view.textContent = '';
    view.appendChild(quiet('Looking…'));
    return call('view=case&id=' + encodeURIComponent(id)).then(function (r) {
      if (r.status !== 200) {
        if (r.status === 404) { view.textContent = ''; var h0 = heading(2, 'That case has been deleted'); view.appendChild(h0); view.appendChild(backTo('#/cases', '← All cases')); return h0; }
        return refused(r);
      }
      took(r.body);
      return drawCase(r.body.case);
    });
  }

  function drawCase(k) {
    view.textContent = '';
    view.appendChild(backTo('#/cases', '← All cases'));
    var h = heading(2, '#' + k.number + ' ' + k.name);
    view.appendChild(h);
    var dl = el('dl', 'of-facts');
    function fact(key, v) { if (v == null || v === '') return; dl.appendChild(el('dt', null, key)); var dd = el('dd'); if (typeof v === 'string') dd.textContent = v; else dd.appendChild(v); dl.appendChild(dd); }
    fact('Type', k.type);
    fact('Status', k.status);
    fact('Priority', k.priority);
    fact('Submitted', dayWords(k.submitted) || 'Not given');
    if (k.closed) fact('Closed', dayWords(k.closed));
    if (k.contact && !k.contactGone) {
      var cs = el('span'); var ca = el('a', null, k.contactName || k.contactEmail); ca.href = '#/c/' + k.contact; cs.appendChild(ca);
      if (k.contactEmail && k.contactName) cs.appendChild(document.createTextNode(' · ' + k.contactEmail));
      fact('Contact', cs);
    } else fact('Contact', k.contactGone ? 'A contact since deleted' : 'None');
    if (k.form) fact('Form entry', '#' + k.form);
    fact('Added', (k.by ? k.by + ', ' : '') + when(k.t) + (k.espo ? ', in EspoCRM' : ''));
    if (k.edited) fact('Changed', (k.editedBy ? k.editedBy + ', ' : '') + when(k.edited));
    view.appendChild(dl);
    var body = el('div', 'of-body');
    if (k.blocks && k.blocks.length) window.loveMarkdown.blocks(k.blocks, body, { top: 2, prefix: 'of' });
    else body.appendChild(quiet('No description.'));
    view.appendChild(body);
    var tools = el('div', 'of-row');
    var mv = el('label', 'of-move');
    mv.appendChild(el('span', null, 'Move to '));
    var ms = el('select', 'cb-say');
    settings.cases.statuses.forEach(function (x) { var o = el('option', null, x.name); o.value = x.name; ms.appendChild(o); });
    ms.value = k.status;
    ms.addEventListener('change', function () {
      ms.disabled = true;
      call(null, { action: 'case-save', id: k.id, status: ms.value }).then(function (r) {
        ms.disabled = false;
        if (r.status !== 200) { ms.value = k.status; say(why(r, 'That did not move. Nothing was changed.')); return; }
        drawCase(r.body.case);
        var again = view.querySelector('.of-move select'); if (again) again.focus();
        say('Moved to ' + r.body.case.status + '.');
      });
    });
    mv.appendChild(ms);
    tools.appendChild(mv);
    var edit = el('a', 'cb-btn of-small', 'Edit'); edit.href = '#/cases/edit/' + k.id;
    tools.appendChild(edit);
    var del = el('button', 'cb-btn of-small', 'Delete'); del.type = 'button';
    del.addEventListener('click', function () {
      sure(tools, 'This deletes case #' + k.number + ' for everybody. It cannot be put back, and its number is not given again' + (k.espo ? '; bringing cases over from EspoCRM again leaves it deleted.' : '.'), 'Delete it', function (done) {
        call(null, { action: 'case-remove', id: k.id }).then(function (r) {
          done();
          if (r.status !== 200) { say(why(r, 'That did not delete. Nothing was changed.')); return; }
          say('Deleted.');
          location.hash = '#/cases';
        });
      }, del);
    });
    tools.appendChild(del);
    view.appendChild(tools);
    return h;
  }

  function caseFormView(id, contact) {
    view.textContent = '';
    view.appendChild(quiet('Looking…'));
    var ask = id ? call('view=case&id=' + encodeURIComponent(id)) : contact ? call('view=contact&id=' + encodeURIComponent(contact)) : call('view=cases');
    return ask.then(function (r) {
      if (r.status !== 200 && !(contact && r.status === 404)) return refused(r);
      took(r.body);
      return drawCaseForm(id ? r.body.case : null, !id && r.body.contact ? r.body.contact : null);
    });
  }

  function drawCaseForm(k, from) {
    view.textContent = '';
    view.appendChild(k ? backTo('#/k/' + k.id, '← #' + k.number + ' ' + k.name) : backTo('#/cases', '← All cases'));
    var h = heading(2, k ? 'Changing case #' + k.number : 'A new case');
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
    function pick(values, value) {
      var sel = el('select', 'cb-say of-input');
      values.forEach(function (v) { var o = el('option', null, v); o.value = v; sel.appendChild(o); });
      sel.value = value;
      return sel;
    }
    var name = el('input', 'cb-say of-input'); name.maxLength = settings.caseNameMax; name.value = k ? k.name : (from ? 'Connection Request: ' + (from.name || '') : '');
    field('of-kname', 'Name', name).parentNode.classList.add('of-wide');
    var type = field('of-ktypein', 'Type', pick(settings.cases.types, k ? k.type : settings.cases.types[0]));
    var status = field('of-kstatus', 'Status', pick(settings.cases.statuses.map(function (x) { return x.name; }), k ? k.status : settings.cases.statuses[0].name),
      'A status that closes the case sets the day it closed, if none is given.');
    var prio = field('of-kprio', 'Priority', pick(settings.cases.priorities, k ? k.priority : settings.cases.default_priority));
    var sub = el('input', 'cb-say of-input'); sub.type = 'date'; sub.value = k && k.submitted ? k.submitted : '';
    field('of-ksub', 'Submitted', sub);
    var closed = el('input', 'cb-say of-input'); closed.type = 'date'; closed.value = k && k.closed ? k.closed : '';
    field('of-kclosed', 'Closed', closed, 'Cleared when it moves back to an open status.');
    var email = el('input', 'cb-say of-input'); email.type = 'email'; email.autocomplete = 'off';
    email.value = k ? (k.contactEmail || '') : (from ? from.email || '' : '');
    field('of-kcontact', 'Contact’s email', email, 'The email of a contact already in the office, to link them. Empty for none.');
    var formNo = el('input', 'cb-say of-input'); formNo.type = 'number'; formNo.min = '1'; formNo.step = '1'; formNo.value = k && k.form ? String(k.form) : '';
    field('of-kform', 'Form entry', formNo, 'Its number on stimpunks.org, if it came in through a form.');
    var text = el('textarea', 'cb-say of-text'); text.rows = 8; text.maxLength = settings.caseBodyMax; text.value = k ? k.body : '';
    field('of-kbody', 'Description', text, 'Markdown works: **bold**, _italic_, lists, > quotes, `code`, links and tables.');
    var preview = el('div', 'of-body of-preview'); preview.hidden = true;
    form.appendChild(preview);
    var row = el('div', 'of-row');
    var go = el('button', 'cb-btn', k ? 'Save' : 'Add the case'); go.type = 'submit';
    var look = el('button', 'cb-btn', 'Preview the description'); look.type = 'button'; look.setAttribute('aria-pressed', 'false');
    var cancel = el('a', 'cb-btn', 'Cancel'); cancel.href = k ? '#/k/' + k.id : (from ? '#/c/' + from.id : '#/cases');
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
      var v = { name: name.value, type: type.value, status: status.value, priority: prio.value, submitted: sub.value || null, closed: closed.value || null,
        contactEmail: email.value.trim(), form: formNo.value === '' ? null : Number(formNo.value), body: text.value };
      var send = { action: 'case-save' };
      if (k) {
        send.id = k.id;
        var was = { name: k.name, type: k.type, status: k.status, priority: k.priority, submitted: k.submitted, closed: k.closed,
          contactEmail: k.contactEmail || '', form: k.form, body: k.body };
        Object.keys(v).forEach(function (x) { if (JSON.stringify(was[x] == null ? null : was[x]) !== JSON.stringify(v[x] === '' && x !== 'contactEmail' && x !== 'body' ? null : v[x])) send[x] = v[x]; });
        if (Object.keys(send).length === 2) { location.hash = '#/k/' + k.id; return; }
      } else Object.keys(v).forEach(function (x) { send[x] = v[x]; });
      go.disabled = true;
      answer.textContent = 'Saving…';
      call(null, send).then(function (r) {
        go.disabled = false;
        if (r.status !== 200) { answer.textContent = why(r, 'That did not save. Nothing was changed.'); return; }
        location.hash = '#/k/' + r.body.case.id;
        say(k ? 'Saved.' : 'Added.');
      });
    });
    view.appendChild(form);
    return h;
  }


  /* ── One email ─────────────────────────────────────────────────────────── */

  /* An email as the team mailbox's script sent it: who, when, the subject, the
     attachments' names (the files stay in Gmail) and its text, shown as text
     with its line breaks and nothing turned into markup. */
  function emailView(id) {
    view.textContent = '';
    view.appendChild(quiet('Looking…'));
    return call('view=email&id=' + encodeURIComponent(id)).then(function (r) {
      if (r.status !== 200) {
        if (r.status === 404) { view.textContent = ''; var h0 = heading(2, 'That email has been deleted from the office'); view.appendChild(h0); view.appendChild(backTo('#/', '← All contacts')); return h0; }
        return refused(r);
      }
      took(r.body);
      return drawEmail(r.body.email);
    });
  }

  function drawEmail(m) {
    view.textContent = '';
    var first = m.contacts[0];
    view.appendChild(first ? backTo('#/c/' + first.id, '← ' + (first.name || first.email)) : backTo('#/', '← All contacts'));
    var h = heading(2, m.subject || '(no subject)');
    view.appendChild(h);
    var dl = el('dl', 'of-facts');
    function fact(k, v) { if (v == null || v === '' || (Array.isArray(v) && !v.length)) return; dl.appendChild(el('dt', null, k)); var dd = el('dd'); if (typeof v === 'string') dd.textContent = v; else if (Array.isArray(v)) dd.textContent = v.join(', '); else dd.appendChild(v); dl.appendChild(dd); }
    fact('From', m.from);
    fact('To', m.to);
    fact('Cc', m.cc);
    fact('Bcc', m.bcc);
    fact('Sent', when(m.at));
    if (m.contacts.length) {
      var cs = el('span');
      m.contacts.forEach(function (c, i) { if (i) cs.appendChild(document.createTextNode(', ')); var a = el('a', null, c.name || c.email); a.href = '#/c/' + c.id; cs.appendChild(a); });
      fact(m.contacts.length === 1 ? 'Contact' : 'Contacts', cs);
    }
    if (m.files.length) fact('Attachments', m.files.map(function (f) { return f.name + (f.size != null ? ' (' + Math.max(1, Math.round(f.size / 1024)) + ' KB)' : ''); }).join(', ') + ', in Gmail');
    view.appendChild(dl);
    var body = el('div', 'of-body of-mail');
    body.textContent = m.text || '';
    view.appendChild(body);
    var tools = el('div', 'of-row');
    if (m.thread) tools.appendChild(outLink(gmailThread(m.mailbox, m.thread), 'Open the thread in Gmail'));
    var to = m.out ? (first && first.email) : m.from;
    if (to) tools.appendChild(outLink(gmailCompose(m.mailbox, to, /^re:/i.test(m.subject || '') ? m.subject : 'Re: ' + (m.subject || '')), 'Reply in Gmail'));
    var del = el('button', 'cb-btn of-small', 'Delete from the office'); del.type = 'button';
    del.addEventListener('click', function () {
      sure(tools, 'This deletes the email from the office for everybody, and it is not taken in again. It stays in Gmail.', 'Delete it', function (done) {
        call(null, { action: 'mail-remove', id: m.id }).then(function (r) {
          done();
          if (r.status !== 200) { say(why(r, 'That did not delete. Nothing was changed.')); return; }
          say('Deleted from the office.');
          location.hash = first ? '#/c/' + first.id : '#/';
        });
      }, del);
    });
    tools.appendChild(del);
    view.appendChild(tools);
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

  /* ── The dashboard ─────────────────────────────────────────────────────── */

  /* THE OFFICE AT A GLANCE, worked out by the server each time it is opened:
     EspoCRM's four reports, what came in this week and the week before, tasks
     and mailings, and the newest of each, with sentences built from the same
     numbers and nothing else. Every chart has its numbers in a table beneath
     it, every bar is labelled with its value, and colour follows the thing
     counted: a pipeline wears the same colour on every chart. Charts are drawn
     at the width they are shown at, as SVG built from nodes. */
  var SVGNS = 'http://www.w3.org/2000/svg';
  function sv(tag, attrs, text) {
    var e = document.createElementNS(SVGNS, tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (text != null) e.textContent = text;
    return e;
  }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }
  function against(now, before) {
    if (now === before) return 'the same as the week before';
    var d = Math.abs(now - before);
    return d + (now > before ? ' more' : ' fewer') + ' than the week before';
  }
  function monthWords(m) {
    var p = m.split('-');
    try { return new Date(+p[0], +p[1] - 1, 1).toLocaleDateString(undefined, { month: 'short' }); } catch (e) { return m; }
  }
  var tip = null;
  function tipShow(e, lines) {
    if (!tip) { tip = el('div', 'of-tip'); tip.setAttribute('aria-hidden', 'true'); box.appendChild(tip); }
    tip.textContent = '';
    lines.forEach(function (l, i) {
      var p = el('p', i ? 'of-tip__k' : 'of-tip__v');
      if (l.key) { var k = el('span', 'of-key ' + l.key); p.appendChild(k); }
      p.appendChild(document.createTextNode(l.text));
      tip.appendChild(p);
    });
    tip.hidden = false;
    var r = box.getBoundingClientRect();
    tip.style.left = Math.min(e.clientX - r.left + 12, r.width - 200) + 'px';
    tip.style.top = (e.clientY - r.top + 14) + 'px';
  }
  function tipHide() { if (tip) tip.hidden = true; }
  function hoverable(target, lines) {
    target.addEventListener('pointermove', function (e) { tipShow(e, lines); });
    target.addEventListener('pointerleave', tipHide);
  }
  /* A figure: its title, the chart drawn at its width (again whenever that
     changes), and its numbers as a table under it. */
  function figure(title, draw, table) {
    var f = el('figure', 'of-fig');
    f.appendChild(el('figcaption', 'of-fig__title', title));
    var art = el('div', 'of-fig__art');
    f.appendChild(art);
    var nums = el('details', 'of-numbers');
    nums.appendChild(el('summary', null, 'The numbers'));
    nums.appendChild(table);
    f.appendChild(nums);
    var w = 0;
    function again() { var now = Math.floor(art.clientWidth); if (now > 0 && now !== w) { w = now; art.textContent = ''; draw(art, w); } }
    try { new ResizeObserver(again).observe(art); } catch (e) { /* an old browser draws once */ }
    setTimeout(again, 0);
    return f;
  }
  function numbersTable(head, rows) {
    var t = el('table', 'of-list of-ntable');
    var tr = el('tr'); head.forEach(function (h, i) { var th = el('th', i ? 'of-num' : null, h); th.scope = 'col'; tr.appendChild(th); });
    var th = el('thead'); th.appendChild(tr); t.appendChild(th);
    var tb = el('tbody');
    rows.forEach(function (r) {
      var row = el('tr');
      r.forEach(function (c, i) { var td = el(i ? 'td' : 'th', i ? 'of-num' : null, String(c)); if (!i) td.scope = 'row'; row.appendChild(td); });
      tb.appendChild(row);
    });
    t.appendChild(tb);
    return t;
  }
  /* Horizontal bars, one series in one colour: a label down the left, each bar
     no thicker than 24px with a rounded end, and its value at the tip. */
  function hbars(art, w, rows, cls) {
    var lab = Math.min(170, Math.max(90, w * 0.36)), gapR = 46, band = 34, bar = 22;
    var h = rows.length * band + 6, max = Math.max(1, Math.max.apply(null, rows.map(function (r) { return r.value; })));
    var svg = sv('svg', { width: w, height: h, viewBox: '0 0 ' + w + ' ' + h, role: 'img', 'aria-hidden': 'true', class: 'of-chart' });
    art.appendChild(svg);
    var span = Math.max(10, w - lab - gapR);
    svg.appendChild(sv('line', { x1: lab, x2: lab, y1: 0, y2: h, class: 'of-axis' }));
    rows.forEach(function (r, i) {
      var y = i * band + (band - bar) / 2, len = r.value ? Math.max(4, span * r.value / max) : 0;
      // A label longer than its column is cut short with an ellipsis; the tooltip and the table carry it whole.
      var t = sv('text', { x: lab - 8, y: y + bar / 2, class: 'of-label', 'text-anchor': 'end', 'dominant-baseline': 'central' }, r.label);
      svg.appendChild(t);
      var words = r.label;
      while (words.length > 1 && t.getComputedTextLength && t.getComputedTextLength() > lab - 12) { words = words.slice(0, -1); t.textContent = words.replace(/\s+$/, '') + '…'; }
      if (len) {
        var x0 = lab + 1, x1 = lab + len, rr = Math.min(4, len / 2);
        svg.appendChild(sv('path', { class: 'of-mark ' + cls, d: 'M' + x0 + ' ' + y + 'H' + (x1 - rr) + 'Q' + x1 + ' ' + y + ' ' + x1 + ' ' + (y + rr) + 'V' + (y + bar - rr) + 'Q' + x1 + ' ' + (y + bar) + ' ' + (x1 - rr) + ' ' + (y + bar) + 'H' + x0 + 'Z' }));
      }
      svg.appendChild(sv('text', { x: lab + len + 6, y: y + bar / 2, class: 'of-value', 'dominant-baseline': 'central' }, r.valueText || String(r.value)));
      var hit = sv('rect', { x: 0, y: i * band, width: w, height: band, class: 'of-hit' });
      hoverable(hit, [{ text: r.valueText || String(r.value) }, { text: r.label, key: cls }].concat(r.more ? [{ text: r.more }] : []));
      svg.appendChild(hit);
    });
  }
  /* Columns stacked by series, one per month or year: 2px of the case between
     the parts, a rounded top, the column's total over it, and a legend. o is
     { series, cls, cols: [{ label, counts }], fmt } with fmt for the values. */
  function compactMoney(n) { return n >= 1000 ? '$' + Math.round(n / 100) / 10 + 'K' : '$' + n; }
  function stacked(art, w, o) {
    var fmt = o.fmt || String, cols = o.cols;
    if (o.series.length > 1) {
      var leg = el('p', 'of-legend');
      o.series.forEach(function (s, i) { var it = el('span', 'of-legend__it'); it.appendChild(el('span', 'of-swatch ' + o.cls[i])); it.appendChild(document.createTextNode(s)); leg.appendChild(it); });
      art.appendChild(leg);
    }
    var axisW = o.money ? 46 : 30, top = 18, base = 150, axisH = 22, h = top + base + axisH;
    var totals = cols.map(function (c) { return c.counts.reduce(function (a, b) { return a + b; }, 0); });
    var max = Math.max(1, Math.max.apply(null, totals));
    var raw = max / 4, mag = Math.pow(10, Math.floor(Math.log10(raw))), step = Math.max(1, [1, 2, 2.5, 5, 10].map(function (m) { return m * mag; }).filter(function (v) { return v >= raw; })[0]);
    if (!o.money) step = Math.max(1, Math.ceil(step));
    var nice = step * Math.ceil(max / step);
    var svg = sv('svg', { width: w, height: h, viewBox: '0 0 ' + w + ' ' + h, role: 'img', 'aria-hidden': 'true', class: 'of-chart' });
    for (var g = 0; g <= nice + 1e-9; g += step) {
      var gy = top + base - base * g / nice;
      svg.appendChild(sv('line', { x1: axisW, x2: w, y1: gy, y2: gy, class: g ? 'of-grid' : 'of-axis' }));
      svg.appendChild(sv('text', { x: axisW - 6, y: gy, class: 'of-tick', 'text-anchor': 'end', 'dominant-baseline': 'central' }, o.money ? compactMoney(g) : String(g)));
    }
    var slot = (w - axisW) / Math.max(1, cols.length), bw = Math.min(24, slot * 0.6), every = Math.max(1, Math.ceil(46 / slot));
    cols.forEach(function (c, i) {
      var cx = axisW + slot * i + slot / 2, x = cx - bw / 2, y = top + base;
      var parts = [];
      c.counts.forEach(function (n, j) { if (n) parts.push({ n: n, j: j }); });
      parts.forEach(function (p, k) {
        var hh = base * p.n / nice, last = k === parts.length - 1, gap = k ? 2 : 0;
        var y1 = y - hh, y0 = y - gap, rr = last ? Math.min(4, (y0 - y1) / 2, bw / 2) : 0;
        if (y0 - y1 > 0.5) {
          svg.appendChild(sv('path', { class: 'of-mark ' + o.cls[p.j], d: 'M' + x + ' ' + y0 + 'V' + (y1 + rr) + (rr ? 'Q' + x + ' ' + y1 + ' ' + (x + rr) + ' ' + y1 + 'H' + (x + bw - rr) + 'Q' + (x + bw) + ' ' + y1 + ' ' + (x + bw) + ' ' + (y1 + rr) : 'H' + (x + bw)) + 'V' + y0 + 'Z' }));
        }
        y = y1;
      });
      if (totals[i] && slot >= 34 && !o.bare) svg.appendChild(sv('text', { x: cx, y: y - 5, class: 'of-value', 'text-anchor': 'middle' }, o.money ? compactMoney(totals[i]) : fmt(totals[i])));
      if ((cols.length - 1 - i) % every === 0) svg.appendChild(sv('text', { x: cx, y: top + base + 15, class: 'of-tick', 'text-anchor': 'middle' }, c.label));
      var hit = sv('rect', { x: axisW + slot * i, y: 0, width: slot, height: h, class: 'of-hit' });
      hoverable(hit, [{ text: fmt(totals[i]) + (o.on ? ' on ' : ' in ') + (c.long || c.label) }].concat(o.series.length > 1 ? o.series.map(function (s, j) { return { text: s + ': ' + fmt(c.counts[j]), key: o.cls[j] }; }) : []).concat((c.more || []).map(function (t) { return { text: t }; })));
      svg.appendChild(hit);
    });
    art.appendChild(svg);
  }
  /* Lines, one per series, on one axis: 2px each, a dot on the last night,
     ticks on the left, the first and last day underneath, and a crosshair that
     says every series at the point under it. o is { series, cls, dash, days,
     rows } with rows[i] the values for days[i]; names, if given, label the
     points instead of their days, and money says the values are dollars. */
  function lines(art, w, o) {
    var name = function (i) { return o.names ? o.names[i] : dayShort(o.days[i]); };
    var fmt = o.money ? money : String;
    if (o.series.length > 1) {
      var leg = el('p', 'of-legend');
      o.series.forEach(function (s, i) { var it = el('span', 'of-legend__it'); it.appendChild(el('span', 'of-swatch ' + o.cls[i] + (o.dash && o.dash[i] ? ' of-swatch--dash' : ''))); it.appendChild(document.createTextNode(s)); leg.appendChild(it); });
      art.appendChild(leg);
    }
    var axisW = o.money ? 50 : 34, top = 12, base = 120, axisH = 22, right = 10, h = top + base + axisH;
    var all = []; o.rows.forEach(function (r) { all = all.concat(r); });
    var max = Math.max(1, Math.max.apply(null, all));
    var raw = max / 3, mag = Math.pow(10, Math.floor(Math.log10(raw))), step = Math.max(1, Math.ceil([1, 2, 2.5, 5, 10].map(function (m) { return m * mag; }).filter(function (v) { return v >= raw; })[0]));
    if (o.money) step = Math.max(1, step);
    var nice = step * Math.ceil(max / step);
    var svg = sv('svg', { width: w, height: h, viewBox: '0 0 ' + w + ' ' + h, role: 'img', 'aria-hidden': 'true', class: 'of-chart' });
    for (var g = 0; g <= nice; g += step) {
      var gy = top + base - base * g / nice;
      svg.appendChild(sv('line', { x1: axisW, x2: w - right, y1: gy, y2: gy, class: g ? 'of-grid' : 'of-axis' }));
      svg.appendChild(sv('text', { x: axisW - 6, y: gy, class: 'of-tick', 'text-anchor': 'end', 'dominant-baseline': 'central' }, o.money ? compactMoney(g) : String(g)));
    }
    var n = o.rows.length, span = w - axisW - right - 8;
    var xAt = function (i) { return axisW + 4 + (n > 1 ? span * i / (n - 1) : span / 2); };
    var yAt = function (v) { return top + base - base * Math.max(0, v) / nice; };
    o.series.forEach(function (s, j) {
      if (n > 1) {
        var d = o.rows.map(function (r, i) { return (i ? 'L' : 'M') + xAt(i).toFixed(1) + ' ' + yAt(r[j]).toFixed(1); }).join('');
        svg.appendChild(sv('path', { d: d, class: 'of-line ' + o.cls[j] + (o.dash && o.dash[j] ? ' of-line--dash' : '') }));
      }
      var last = o.rows[n - 1][j];
      svg.appendChild(sv('circle', { cx: xAt(n - 1), cy: yAt(last), r: 4, class: 'of-dot ' + o.cls[j] }));
    });
    [0, n - 1].filter(function (i, k, a) { return a.indexOf(i) === k; }).forEach(function (i) {
      svg.appendChild(sv('text', { x: xAt(i), y: top + base + 15, class: 'of-tick', 'text-anchor': n > 1 ? (i ? 'end' : 'start') : 'middle' }, name(i)));
    });
    var cross = sv('line', { x1: 0, x2: 0, y1: top, y2: top + base, class: 'of-cross' });
    cross.style.display = 'none';
    svg.appendChild(cross);
    var hit = sv('rect', { x: axisW, y: 0, width: w - axisW, height: h, class: 'of-hit' });
    hit.addEventListener('pointermove', function (e) {
      var r = svg.getBoundingClientRect(), x = e.clientX - r.left;
      var i = n > 1 ? Math.max(0, Math.min(n - 1, Math.round((x - axisW - 4) / span * (n - 1)))) : 0;
      cross.setAttribute('x1', xAt(i)); cross.setAttribute('x2', xAt(i)); cross.style.display = '';
      tipShow(e, [{ text: name(i) }].concat(o.series.map(function (s, j) { return { text: s + ': ' + fmt(o.rows[i][j]), key: o.cls[j] }; })));
    });
    hit.addEventListener('pointerleave', function () { cross.style.display = 'none'; tipHide(); });
    svg.appendChild(hit);
    art.appendChild(svg);
  }
  function dayShort(v) {
    var p = String(v).split('-');
    try { return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }); } catch (e) { return v; }
  }
  /* The cap, as a track filled to how many there are, and words beside it. */
  function meter(count, cap, cls, name) {
    var wrap = el('div', 'of-meter');
    var track = el('div', 'of-meter__track');
    var fill = el('div', 'of-meter__fill ' + (cls || 'of-bg1'));
    fill.style.width = Math.min(100, 100 * count / Math.max(1, cap)) + '%';
    track.appendChild(fill);
    wrap.appendChild(track);
    wrap.setAttribute('role', 'meter');
    wrap.setAttribute('aria-valuemin', '0'); wrap.setAttribute('aria-valuemax', String(cap)); wrap.setAttribute('aria-valuenow', String(Math.min(count, cap)));
    wrap.setAttribute('aria-label', (name ? name + ': ' : '') + count + ' of a cap of ' + cap);
    return wrap;
  }
  /* Each pipeline's open grant requests submitted this year, against its own cap. */
  function capFigure(title, a, year) {
    var f = el('figure', 'of-fig');
    f.appendChild(el('figcaption', 'of-fig__title', title));
    a.byPipeline.forEach(function (x, i) {
      var row = el('div', 'of-capped');
      row.appendChild(el('p', 'of-capped__name', x.pipeline));
      row.appendChild(el('p', 'of-big', x.count + ' of ' + x.cap));
      row.appendChild(meter(x.count, x.cap, i ? 'of-bg2' : 'of-bg1', x.pipeline));
      row.appendChild(el('p', 'cb-quiet', x.count <= x.cap ? (x.cap - x.count) + ' more before the cap.' : (x.count - x.cap) + ' over the cap.'));
      f.appendChild(row);
    });
    f.appendChild(el('p', 'cb-quiet', 'Open grant requests submitted in ' + year + ', each pipeline against its own cap.'));
    var nums = el('details', 'of-numbers'); nums.appendChild(el('summary', null, 'The numbers'));
    nums.appendChild(numbersTable(['Pipeline', 'Open, submitted this year', 'Cap'], a.byPipeline.map(function (x) { return [x.pipeline, x.count, x.cap]; })));
    f.appendChild(nums);
    return f;
  }
  function tile(label, value, note) {
    var t = el('div', 'of-tile');
    t.appendChild(el('p', 'of-tile__label', label));
    t.appendChild(el('p', 'of-tile__value', value));
    if (note) t.appendChild(el('p', 'of-tile__note', note));
    return t;
  }

  /* QuickBooks, as the office last read it (Ryan, 2026-10-21). Not connected,
     it says so and offers Connect, which goes to Intuit and comes back; once
     connected, money in over the last days the server read and this year's
     profit and loss by month, read late each evening and on Read the books
     now. Nothing here writes to our books. */
  function quickBooksFigure(q) {
    var f = el('figure', 'of-fig of-fig--wide');
    f.appendChild(el('figcaption', 'of-fig__title', 'QuickBooks'));
    var tools = el('p', 'of-row');
    if (!q || !q.ready) {
      f.appendChild(quiet('QuickBooks is not set up yet: the office needs our Intuit app’s id and secret in Netlify’s settings.'));
      return f;
    }
    if (!q.connected) {
      f.appendChild(quiet('The office is not connected to QuickBooks. Connecting takes you to Intuit to sign in and choose our company, then brings you back here. From then on the office reads the books late each evening, and never writes to them.'));
      var go = el('button', 'cb-btn of-small', 'Connect QuickBooks'); go.type = 'button';
      go.addEventListener('click', function () {
        go.disabled = true;
        call(null, { action: 'qb-connect' }).then(function (r) {
          if (r.status !== 200 || !r.body.go) { go.disabled = false; say(why(r, 'That did not start. Nothing was changed.')); return; }
          location.assign(r.body.go);
        });
      });
      tools.appendChild(go);
      f.appendChild(tools);
      return f;
    }
    var b = q.books;
    f.appendChild(quiet('Connected by ' + q.by + ' on ' + when(q.since) + '. ' + (b ? 'The books were last read ' + when(b.read) + '.' : 'The books have not been read yet.') +
      (q.stale ? ' Intuit’s permission has run out: disconnect, then connect again.' : '')));
    if (b) {
      var inn = b.moneyIn, total = inn.reduce(function (n, x) { return n + x.amount; }, 0);
      var said = el('ul', 'of-theirs of-said-list');
      // Say which kinds there were, so a month of deposits is not called deposits, payments and sales receipts.
      var counted = inn.filter(function (x) { return x.amount; });
      var kinds = [['Deposit', 'deposit'], ['Payment', 'payment'], ['Sales receipt', 'sales receipt']].map(function (k) {
        var n = counted.filter(function (x) { return x.kind === k[0]; }).length;
        return n ? plural(n, k[1]) : null;
      }).filter(Boolean);
      said.appendChild(el('li', null, counted.length
        ? money(Math.round(total * 100) / 100) + ' came in from ' + dayWords(b.from) + ' to ' + dayWords(b.day) + ', in ' + (kinds.length > 1 ? kinds.slice(0, -1).join(', ') + ' and ' + kinds[kinds.length - 1] : kinds[0]) + '.'
        : 'Nothing came in from ' + dayWords(b.from) + ' to ' + dayWords(b.day) + '.'));
      var pl = b.profitLoss, inc = pl.months.reduce(function (n, x) { return n + x.income; }, 0), exp = pl.months.reduce(function (n, x) { return n + x.expense; }, 0);
      if (pl.months.length) said.appendChild(el('li', null, 'This year so far, income was ' + money(Math.round(inc)) + ' and expenses ' + money(Math.round(exp)) + ', ' + (inc >= exp ? money(Math.round(inc - exp)) + ' more in than out.' : money(Math.round(exp - inc)) + ' more out than in.')));
      f.appendChild(said);
      var small = el('div', 'of-small');
      var days = []; for (var dd = b.from; dd <= b.day; dd = nextDay(dd)) days.push(dd);
      var perDay = days.map(function (x) { var on = inn.filter(function (t) { return t.day === x; }); return { day: x, total: on.reduce(function (n, t) { return n + t.amount; }, 0), count: on.length }; });
      var mf = figure('Money in each day', function (art, w) {
        stacked(art, w, { series: ['Money in'], cls: ['of-c6'], money: true, on: true, bare: true, fmt: money, cols: perDay.map(function (x) {
          return { label: dayShort(x.day), long: dayWords(x.day), counts: [Math.round(x.total * 100) / 100], more: [plural(x.count, 'transaction')] };
        }) });
      }, numbersTable(['Day', 'Money in', 'Transactions'], perDay.slice().reverse().filter(function (x) { return x.count; }).map(function (x) { return [dayWords(x.day), money(Math.round(x.total * 100) / 100), x.count]; })));
      mf.classList.add('of-fig--small');
      small.appendChild(mf);
      if (pl.months.length) {
        var pf = figure('Income and expenses this year, by month', function (art, w) {
          lines(art, w, { series: ['Income', 'Expenses'], cls: ['of-c6', 'of-c7'], money: true, names: pl.months.map(function (x) { return x.month; }), rows: pl.months.map(function (x) { return [x.income, x.expense]; }) });
        }, numbersTable(['Month', 'Income', 'Expenses', 'Net'], pl.months.map(function (x) { return [x.month, money(x.income), money(x.expense), money(x.net)]; })));
        pf.classList.add('of-fig--small');
        small.appendChild(pf);
      }
      f.appendChild(small);
      // The newest money in, as QuickBooks names who it was from.
      var shown = inn.filter(function (x) { return x.amount || x.moved; }).slice(0, 12);
      if (shown.length) {
        f.appendChild(el('h3', 'of-fig__title', 'The newest money in'));
        f.appendChild(numbersTable(['Day', 'Kind', 'From', 'Into', 'Amount'], shown.map(function (x) {
          return [dayWords(x.day), x.kind, x.from || '', x.account || '', x.amount ? money(x.amount) : 'already listed (' + money(x.moved) + ')'];
        })));
      }
    }
    var read = el('button', 'cb-btn of-small', 'Read the books now'); read.type = 'button';
    read.addEventListener('click', function () {
      read.disabled = true;
      say('Reading the books…');
      call(null, { action: 'qb-read' }).then(function (r) {
        read.disabled = false;
        if (r.status !== 200) { say(why(r, 'The books could not be read just now. What the office last read is still here.')); return; }
        say('Read.');
        dashboardView();
      });
    });
    var off = el('button', 'cb-btn of-small', 'Disconnect'); off.type = 'button';
    off.addEventListener('click', function () {
      sure(f, 'This tells Intuit the office may no longer read our books, and deletes what the office last read. Our books in QuickBooks are not touched.', 'Disconnect', function (done) {
        call(null, { action: 'qb-disconnect' }).then(function (r) {
          done();
          if (r.status !== 200) { say(why(r, 'That did not disconnect. Nothing was changed.')); return; }
          say('Disconnected.');
          dashboardView();
        });
      }, off);
    });
    tools.appendChild(read); tools.appendChild(off);
    f.appendChild(tools);
    return f;
  }
  function nextDay(v) {
    var p = v.split('-'), d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2] + 1));
    return d.toISOString().slice(0, 10);
  }
  /* Givebutter, as the office last read it (Ryan, 2026-10-21): gifts in the
     last 30 days against the 30 before, recurring plans, every month of the
     last year, and campaigns. Nobody who gave is named here, because the
     office keeps no name. Read late each evening and on Read Givebutter now;
     nothing here writes to Givebutter. */
  function givebutterFigure(g, day) {
    var f = el('figure', 'of-fig of-fig--wide');
    f.appendChild(el('figcaption', 'of-fig__title', 'Givebutter'));
    if (!g || !g.ready) {
      f.appendChild(quiet('Givebutter is not set up yet: the office needs an API key from Givebutter in Netlify’s settings.'));
      return f;
    }
    var b = g.books;
    f.appendChild(quiet(b ? 'Read ' + when(b.read) + '. Nobody who gave is named here: the office keeps no name.' : 'The office has not read Givebutter yet.'));
    if (b) {
      var ok = b.gifts.filter(function (x) { return x.ok; });
      var sum = function (list, k) { return Math.round(list.reduce(function (n, x) { return n + x[k]; }, 0) * 100) / 100; };
      var from30 = dayBack(b.day, 29), from60 = dayBack(b.day, 59);
      var now = ok.filter(function (x) { return x.day >= from30; }), before = ok.filter(function (x) { return x.day >= from60 && x.day < from30; });
      var failed = b.gifts.filter(function (x) { return !x.ok && x.day >= from30; }).length;
      var said = el('ul', 'of-theirs of-said-list');
      var rec = now.filter(function (x) { return x.recurring; }).length;
      said.appendChild(el('li', null, now.length
        ? money(sum(now, 'amount')) + ' was given in the last 30 days, in ' + plural(now.length, 'gift') + (rec ? ', ' + rec + ' of ' + (now.length === 1 ? 'it' : 'them') + ' recurring' : '') + '; ' + money(sum(now, 'payout')) + ' of it reached us after Givebutter’s fees. The 30 days before: ' + money(sum(before, 'amount')) + '.'
        : 'Nothing was given in the last 30 days. The 30 days before: ' + money(sum(before, 'amount')) + '.'));
      var m = b.monthly;
      said.appendChild(el('li', null, m.active
        ? plural(m.active, 'recurring plan') + ' ' + (m.active === 1 ? 'is' : 'are') + ' giving, ' + money(m.aMonth) + ' a month between them' + (m.unknown ? ' (' + m.unknown + ' of them at a frequency the office does not know, not counted)' : '') + '.' + (m.pastDue ? ' ' + plural(m.pastDue, 'plan') + ' ' + (m.pastDue === 1 ? 'is' : 'are') + ' past due.' : '')
        : 'No recurring plan is giving.' + (m.pastDue ? ' ' + plural(m.pastDue, 'plan') + ' ' + (m.pastDue === 1 ? 'is' : 'are') + ' past due.' : '')));
      if (failed) said.appendChild(el('li', null, plural(failed, 'gift') + ' failed in the last 30 days and ' + (failed === 1 ? 'is' : 'are') + ' not counted.'));
      f.appendChild(said);
      var small = el('div', 'of-small');
      // Every month of the last year, one series, with its parts in the tooltip and the table.
      var months = []; for (var mo = b.from.slice(0, 7); mo <= b.day.slice(0, 7); mo = nextMonth(mo)) months.push(mo);
      var per = months.map(function (x) {
        var on = ok.filter(function (t) { return t.day.slice(0, 7) === x; });
        var r = on.filter(function (t) { return t.recurring; });
        return { month: x, total: sum(on, 'amount'), recurring: sum(r, 'amount'), once: sum(on.filter(function (t) { return !t.recurring; }), 'amount'), count: on.length };
      });
      var mf = figure('Given each month', function (art, w) {
        stacked(art, w, { series: ['Given'], cls: ['of-c6'], money: true, bare: true, fmt: money, cols: per.map(function (x) {
          return { label: monthWords(x.month), long: monthWords(x.month) + ' ' + x.month.slice(0, 4), counts: [x.total],
            more: [plural(x.count, 'gift'), 'Recurring: ' + money(x.recurring), 'Once: ' + money(x.once)] };
        }) });
      }, numbersTable(['Month', 'Given', 'Recurring', 'Once', 'Gifts'], per.slice().reverse().map(function (x) {
        return [monthWords(x.month) + ' ' + x.month.slice(0, 4), money(x.total), money(x.recurring), money(x.once), x.count];
      })));
      mf.classList.add('of-fig--small');
      small.appendChild(mf);
      var camps = b.campaigns.filter(function (c) { return c.raised > 0; }).sort(function (a, c) { return c.raised - a.raised; });
      if (camps.length) {
        var cf = figure('Campaigns, raised so far', function (art, w) {
          hbars(art, w, camps.map(function (c) {
            return { label: c.title, value: c.raised, valueText: money(c.raised), more: (c.goal ? 'Goal ' + money(c.goal) + '. ' : '') + plural(c.donors, 'donor') };
          }), 'of-c6');
        }, numbersTable(['Campaign', 'Raised', 'Goal', 'Donors'], camps.map(function (c) { return [c.title, money(c.raised), c.goal ? money(c.goal) : '', c.donors]; })));
        cf.classList.add('of-fig--small');
        small.appendChild(cf);
      }
      f.appendChild(small);
      var newest = ok.slice(0, 12);
      if (newest.length) {
        f.appendChild(el('h3', 'of-fig__title', 'The newest gifts'));
        f.appendChild(numbersTable(['Day', 'Campaign', 'Kind', 'Given', 'Reached us'], newest.map(function (x) {
          return [dayWords(x.day), x.campaign || '', x.recurring ? 'Recurring' : 'Once', money(x.amount), money(x.payout)];
        })));
      }
    }
    var tools = el('p', 'of-row');
    var read = el('button', 'cb-btn of-small', 'Read Givebutter now'); read.type = 'button';
    read.addEventListener('click', function () {
      read.disabled = true;
      say('Reading Givebutter…');
      call(null, { action: 'gb-read' }).then(function (r) {
        read.disabled = false;
        if (r.status !== 200) { say(why(r, 'Givebutter could not be read just now. What the office last read is still here.')); return; }
        say('Read.');
        dashboardView();
      });
    });
    tools.appendChild(read);
    f.appendChild(tools);
    return f;
  }
  function dayBack(v, n) {
    var p = v.split('-'), d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2] - n));
    return d.toISOString().slice(0, 10);
  }
  function nextMonth(m) {
    var y = +m.slice(0, 4), mo = +m.slice(5, 7) + 1;
    if (mo > 12) { mo = 1; y++; }
    return y + '-' + (mo < 10 ? '0' : '') + mo;
  }
  function dashboardView(back) {
    view.textContent = '';
    view.appendChild(quiet('Looking…'));
    return call('view=dashboard').then(function (r) {
      if (r.status !== 200) return refused(r);
      took(r.body);
      var h = drawDashboard(r.body.dashboard);
      // Back from Intuit, the address says only whether connecting worked.
      if (back === 'connected') say('QuickBooks is connected. The office has read the books, and reads them again late each evening.');
      else if (back === 'not-connected') say('QuickBooks was not connected. Nothing was changed; Connect QuickBooks tries again.');
      // Netlify adds Intuit's query (the code, already used) to the way back, so the address loses it here.
      if (back) history.replaceState(null, '', location.pathname + '#/dashboard');
      return h;
    });
  }
  function drawDashboard(d) {
    view.textContent = '';
    var h = heading(2, 'Dashboard');
    view.appendChild(h);
    view.appendChild(el('p', 'cb-quiet', 'Worked out ' + when(d.asOf) + ' from the office’s own records. This week is the seven days to ' + dayWords(d.day) + '; the week before is the seven before that.'));
    view.appendChild(viewLinks([['#/dashboard', 'Dashboard', true], ['#/reports', 'Reports']]));
    var g = d.grants, k = d.cases, t = d.tasks, m = d.mailings;

    // What it comes to, in sentences built from the same numbers.
    var said = el('ul', 'of-theirs of-said-list');
    function line(text) { said.appendChild(el('li', null, text)); }
    line(plural(g.week.now, 'grant request') + ' came in this week, ' + against(g.week.now, g.week.before) + '.');
    line(plural(k.week.now, 'case') + ' came in this week, ' + against(k.week.now, k.week.before) + '.');
    line('Open grant requests submitted this year: ' + g.active.byPipeline.map(function (x) {
      return x.pipeline + ' has ' + x.count + ', ' + (x.count <= x.cap ? (x.cap - x.count) + ' under' : (x.count - x.cap) + ' over') + ' its cap of ' + x.cap;
    }).join('; ') + '.');
    line('This year ' + plural(g.decided.granted, 'grant request') + (g.decided.granted === 1 ? ' was' : ' were') + ' granted, ' + money(g.decided.grantedSum) + ' in all, and ' + g.decided.denied + ' denied.');
    line(plural(t.open, 'task') + (t.open === 1 ? ' is' : ' are') + ' open: ' + t.overdue + ' overdue and ' + t.dueSoon + ' due in the next seven days.');
    line(plural(d.cb.week.now, 'message') + ' went out on the CB this week, ' + against(d.cb.week.now, d.cb.week.before) + '.');
    if (m.waiting || m.sentWeek) line(plural(m.sentWeek, 'mailing email') + ' went this week' + (m.waiting ? ', and ' + m.waiting + (m.waiting === 1 ? ' is' : ' are') + ' waiting for the team mailbox' : '') + '.');
    view.appendChild(said);

    var tiles = el('div', 'of-tiles');
    tiles.appendChild(tile('Grant requests this week', String(g.week.now), against(g.week.now, g.week.before)));
    tiles.appendChild(tile('Open grant requests', String(g.open), money(g.openSum) + ' between them'));
    tiles.appendChild(tile('Open cases', String(k.open), plural(k.week.now, 'new one') + ' this week'));
    tiles.appendChild(tile('Open tasks', String(t.open), t.overdue + ' overdue'));
    view.appendChild(tiles);

    var grid = el('div', 'of-dash');
    // EspoCRM's first report: open grant requests submitted this year, against the cap.
    grid.appendChild(capFigure('Active grant applications this year', g.active, d.year));
    // Every open case, by status.
    grid.appendChild(figure('Open cases by status', function (art, w) {
      hbars(art, w, k.byStatus.map(function (x) { return { label: x.status, value: x.count }; }), 'of-c3');
    }, numbersTable(['Status', 'Open cases'], k.byStatus.map(function (x) { return [x.status, x.count]; }).concat(k.byType.map(function (x) { return [x.type + ' (open)', x.count]; })).concat([['Every open case', k.open]]))));
    // Open grant requests by stage, a chart for each pipeline in its own colour.
    g.stages.forEach(function (p, i) {
      grid.appendChild(figure('Open grant requests by stage: ' + p.pipeline, function (art, w) {
        hbars(art, w, p.stages.map(function (x) { return { label: x.stage, value: x.count, more: money(x.sum) }; }), i ? 'of-c2' : 'of-c1');
      }, numbersTable(['Stage', 'Open', 'Amount'], p.stages.map(function (x) { return [x.stage, x.count, money(x.sum)]; }))));
    });
    // This year's grant requests, by the month they were submitted.
    grid.appendChild(figure('Grant requests this year by month', function (art, w) {
      stacked(art, w, { series: g.pipelines, cls: ['of-c1', 'of-c2'], cols: g.months.map(function (x) { return { label: monthWords(x.month), counts: x.counts }; }) });
    },
      numbersTable(['Month'].concat(g.pipelines).concat(['Every pipeline']), g.months.map(function (x) {
        return [monthWords(x.month)].concat(x.counts).concat([x.counts.reduce(function (a, b) { return a + b; }, 0)]);
      }))));
    // The CB, how many messages a day on its channels, and never whose.
    var cbSeries = ['World', 'The rooms', 'The staff rooms'];
    var cbFig = figure('CB messages each day', function (art, w) {
      stacked(art, w, { series: ['Messages'], cls: ['of-c5'], on: true, bare: true, cols: d.cb.days.map(function (x) {
        return { label: dayShort(x.day), long: dayWords(x.day), counts: [x.counts.reduce(function (a, b) { return a + b; }, 0)],
          more: cbSeries.map(function (n, i) { return n + ': ' + x.counts[i]; }) };
      }) });
    }, numbersTable(['Day'].concat(cbSeries).concat(['Every channel']), d.cb.days.slice().reverse().map(function (x) {
      return [dayWords(x.day)].concat(x.counts).concat([x.counts.reduce(function (a, b) { return a + b; }, 0)]);
    })));
    cbFig.classList.add('of-fig--wide');
    cbFig.appendChild(el('p', 'cb-quiet', 'Messages sent on World and in the rooms, by the street’s clock. ' + (d.cb.since ? 'Counted since ' + dayWords(d.cb.since) + '.' : 'Counting starts with the next message.') + ' A count is all that is kept: no name, no room and no words. Direct messages are not counted.'));
    grid.appendChild(cbFig);
    // Each night, what was open: kept as it happened, so it starts on the first night.
    var nights = d.nights;
    var nf = el('figure', 'of-fig of-fig--wide');
    nf.appendChild(el('figcaption', 'of-fig__title', 'Open each night'));
    if (!nights.length) {
      nf.appendChild(el('p', 'cb-quiet', 'The office keeps a count of what is open late each evening, and the first is still to come. A line needs two nights.'));
    } else {
      var small = el('div', 'of-small');
      function nightChart(title, series, cls, rows, dash) {
        var f = figure(title, function (art, w) {
          lines(art, w, { series: series, cls: cls, dash: dash, days: nights.map(function (x) { return x.day; }), rows: rows });
        }, numbersTable(['Night'].concat(series), nights.slice().reverse().map(function (x, i) { return [dayWords(x.day)].concat(rows[nights.length - 1 - i]); })));
        f.classList.add('of-fig--small');
        small.appendChild(f);
      }
      nightChart('Open grant requests', g.pipelines, ['of-c1', 'of-c2'], nights.map(function (x) { return x.grants; }));
      nightChart('Open cases', ['Open cases'], ['of-c3'], nights.map(function (x) { return [x.cases]; }));
      nightChart('Open tasks', ['Open', 'Overdue'], ['of-c4', 'of-c4'], nights.map(function (x) { return [x.tasks, x.overdue]; }), [false, true]);
      nf.appendChild(small);
      nf.appendChild(el('p', 'cb-quiet', 'Counted late each evening in Colorado, since ' + dayWords(d.firstNight) + (nights.length < 2 ? '. A line needs two nights.' : '; the last ' + nights.length + ' nights are shown.')));
    }
    grid.appendChild(nf);
    // QuickBooks: read late each evening and on a press; nothing here writes to our books.
    grid.appendChild(quickBooksFigure(d.quickbooks));
    // Givebutter: read late each evening and on a press; nobody who gave is named.
    grid.appendChild(givebutterFigure(d.givebutter, d.day));
    // Tasks, by who they are assigned to.
    var tf = el('figure', 'of-fig');
    tf.appendChild(el('figcaption', 'of-fig__title', 'Open tasks by person'));
    tf.appendChild(numbersTable(['Assigned to', 'Open', 'Overdue'], t.byPerson.map(function (x) { return [x.who, x.open, x.overdue]; }).concat(t.unassigned ? [['Nobody yet', t.unassigned, '']] : [])));
    var tl = el('p'); var ta = el('a', null, 'Open the tasks'); ta.href = '/tasks.html#/'; tl.appendChild(ta); tf.appendChild(tl);
    grid.appendChild(tf);
    view.appendChild(grid);

    // What came in last, of each.
    view.appendChild(el('h3', null, 'Newest'));
    var newest = el('div', 'of-dash');
    function list(title, items, draw) {
      var f = el('section', 'of-fig');
      f.appendChild(el('h4', 'of-fig__title', title));
      if (!items.length) { f.appendChild(quiet('None yet.')); return f; }
      var ul = el('ul', 'of-theirs');
      items.forEach(function (x) { var li = el('li'); draw(li, x); ul.appendChild(li); });
      f.appendChild(ul);
      return f;
    }
    newest.appendChild(list('Grant requests', d.recent.grants, function (li, x) {
      var a = el('a', null, x.name); a.href = '#/g/' + x.id; li.appendChild(a);
      li.appendChild(document.createTextNode(' · ' + x.pipeline + ', ' + x.stage + (x.submitted ? ', ' + dayWords(x.submitted) : '')));
    }));
    newest.appendChild(list('Cases', d.recent.cases, function (li, x) {
      var a = el('a', null, '#' + x.number + ' ' + x.name); a.href = '#/k/' + x.id; li.appendChild(a);
      li.appendChild(document.createTextNode(' · ' + x.status + (x.submitted ? ', ' + dayWords(x.submitted) : '')));
    }));
    newest.appendChild(list('Tasks', d.recent.tasks, function (li, x) {
      var a = el('a', null, x.name); a.href = '/tasks.html#/t/' + x.id; li.appendChild(a);
      li.appendChild(document.createTextNode(' · ' + x.status + (x.who ? ', ' + x.who : '') + (x.due ? ', due ' + dayWords(x.due) : '')));
    }));
    view.appendChild(newest);
    return h;
  }

  /* EspoCRM's nine reports, by the names it gave them, worked out by the server
     each time this page is opened, with a chart and its table for each. */
  function reportsView() {
    view.textContent = '';
    view.appendChild(quiet('Looking…'));
    return call('view=reports').then(function (r) {
      if (r.status !== 200) return refused(r);
      took(r.body);
      return drawReports(r.body.reports);
    });
  }
  function drawReports(d) {
    view.textContent = '';
    var h = heading(2, 'Reports');
    view.appendChild(h);
    view.appendChild(el('p', 'cb-quiet', 'EspoCRM’s reports, by the names it gave them, worked out ' + when(d.asOf) + ' from the office’s own records. A request or case counts in the year it was submitted, and an award in the year it was decided.'));
    view.appendChild(viewLinks([['#/dashboard', 'Dashboard'], ['#/reports', 'Reports', true]]));
    var pc = ['of-c1', 'of-c2'], kc = ['of-c3', 'of-c4'];
    function sumOf(a) { return a.reduce(function (x, y) { return x + y; }, 0); }

    view.appendChild(el('h3', null, 'Grant requests'));
    var gg = el('div', 'of-dash');
    gg.appendChild(capFigure('Active Applications This Year', d.active, d.year));
    d.openStages.forEach(function (p, i) {
      gg.appendChild(figure('Open Grant Requests by Stage: ' + p.pipeline, function (art, w) {
        hbars(art, w, p.stages.map(function (x) { return { label: x.stage, value: x.count, more: money(x.sum) }; }), pc[i] || 'of-c1');
      }, numbersTable(['Stage', 'Open', 'Amount'], p.stages.map(function (x) { return [x.stage, x.count, money(x.sum)]; }))));
    });
    gg.appendChild(figure('Grant Requests This Year by Month', function (art, w) {
      stacked(art, w, { series: d.pipelines, cls: pc, cols: d.months.map(function (x) { return { label: monthWords(x.month), counts: x.counts }; }) });
    }, numbersTable(['Month'].concat(d.pipelines).concat(['Every pipeline']), d.months.map(function (x) { return [monthWords(x.month)].concat(x.counts).concat([sumOf(x.counts)]); }))));
    var byYear = figure('Grant Requests by Year', function (art, w) {
      stacked(art, w, { series: d.pipelines, cls: pc, cols: d.byYear.map(function (x) { return { label: x.year, counts: x.counts }; }) });
    }, numbersTable(['Year'].concat(d.pipelines).concat(['Every pipeline', 'Amount asked']), d.byYear.map(function (x) { return [x.year].concat(x.counts).concat([sumOf(x.counts), money(sumOf(x.sums))]); })));
    if (d.noSubmitted) byYear.appendChild(el('p', 'cb-quiet', plural(d.noSubmitted, 'grant request') + ' with no submitted day ' + (d.noSubmitted === 1 ? 'is' : 'are') + ' not in it.'));
    gg.appendChild(byYear);
    var awarded = figure('Grants Awarded by Year', function (art, w) {
      stacked(art, w, { series: d.pipelines, cls: pc, money: true, fmt: money, cols: d.awarded.map(function (x) { return { label: x.year, counts: x.sums }; }) });
    }, numbersTable(['Year'].concat(d.pipelines.map(function (p) { return p + ' granted'; })).concat(d.pipelines.map(function (p) { return p + ' amount'; })).concat(['Amount in all']),
      d.awarded.map(function (x) { return [x.year].concat(x.counts).concat(x.sums.map(money)).concat([money(sumOf(x.sums))]); })));
    if (d.grantedUndated) awarded.appendChild(el('p', 'cb-quiet', plural(d.grantedUndated, 'granted request') + ' with no decided day ' + (d.grantedUndated === 1 ? 'is' : 'are') + ' not in it.'));
    gg.appendChild(awarded);
    view.appendChild(gg);

    // Grantees: every granted request with its contact, a year at a time.
    var gf = el('section', 'of-fig of-fig--wide');
    gf.appendChild(el('h4', 'of-fig__title', 'Grantees'));
    var yrs = []; d.grantees.forEach(function (x) { var y = x.closed ? x.closed.slice(0, 4) : 'No decided day'; if (yrs.indexOf(y) < 0) yrs.push(y); });
    var pick = el('select', 'cb-say of-input'); pick.id = 'of-gyear';
    var any = el('option', null, 'Every year'); any.value = ''; pick.appendChild(any);
    yrs.forEach(function (y) { var o = el('option', null, y); o.value = y; pick.appendChild(o); });
    if (yrs.indexOf(d.year) >= 0) pick.value = d.year;
    var pl = el('label', 'cb-lab', 'Decided in '); pl.htmlFor = 'of-gyear';
    var pr = el('p', 'of-row'); pr.appendChild(pl); pr.appendChild(pick); gf.appendChild(pr);
    var gsum = el('p', 'of-shown'); gsum.setAttribute('aria-live', 'polite'); gf.appendChild(gsum);
    var gbox = el('div', 'of-tablebox'); gf.appendChild(gbox);
    function drawGrantees() {
      var list = d.grantees.filter(function (x) { return !pick.value || (x.closed ? x.closed.slice(0, 4) : 'No decided day') === pick.value; });
      gsum.textContent = plural(list.length, 'grant') + ' · ' + money(list.reduce(function (t, x) { return t + (x.amount || 0); }, 0));
      gbox.textContent = '';
      var t = el('table', 'of-list');
      var hr = el('tr'); ['Decided', 'Grantee', 'Grant request', 'Pipeline', 'Amount'].forEach(function (x, i) { var th = el('th', i === 4 ? 'of-num' : null, x); th.scope = 'col'; hr.appendChild(th); });
      var thd = el('thead'); thd.appendChild(hr); t.appendChild(thd);
      var tb = el('tbody');
      list.forEach(function (x) {
        var tr = el('tr');
        tr.appendChild(el('td', 'of-day', dayWords(x.closed) || '—'));
        var c = el('td', 'of-mail');
        if (x.contact) { var ca = el('a', null, x.contactName || 'A contact'); ca.href = '#/c/' + x.contact; c.appendChild(ca); } else c.textContent = '—';
        tr.appendChild(c);
        var gt = el('td', 'of-title'); var ga = el('a', null, x.name); ga.href = '#/g/' + x.id; gt.appendChild(ga); tr.appendChild(gt);
        tr.appendChild(el('td', 'of-phone', x.pipeline));
        tr.appendChild(el('td', 'of-num', x.amount != null ? money(x.amount) : '—'));
        tb.appendChild(tr);
      });
      t.appendChild(tb);
      gbox.appendChild(list.length ? t : quiet('Nobody was granted in ' + pick.value + '.'));
    }
    pick.addEventListener('change', drawGrantees);
    drawGrantees();
    view.appendChild(gf);

    view.appendChild(el('h3', null, 'Cases'));
    var kg = el('div', 'of-dash');
    kg.appendChild(figure('Open Collaboration Cases', function (art, w) {
      hbars(art, w, d.openCases.byStatus.map(function (x) { return { label: x.status, value: x.count }; }), 'of-c3');
    }, numbersTable(['Status', 'Open cases'], d.openCases.byStatus.map(function (x) { return [x.status, x.count]; }).concat([['Every open case', d.openCases.open]]))));
    kg.appendChild(figure('Collaboration Cases by Status', function (art, w) {
      hbars(art, w, d.casesByStatus.map(function (x) { return { label: x.status, value: x.count }; }), 'of-c3');
    }, numbersTable(['Status', 'Cases'], d.casesByStatus.map(function (x) { return [x.status, x.count]; }))));
    kg.appendChild(figure('Collaboration Cases by Year', function (art, w) {
      stacked(art, w, { series: d.caseTypes, cls: kc, cols: d.casesByYear.map(function (x) { return { label: x.year, counts: x.counts }; }) });
    }, numbersTable(['Year'].concat(d.caseTypes).concat(['Every case']), d.casesByYear.map(function (x) { return [x.year].concat(x.counts).concat([sumOf(x.counts)]); }))));
    view.appendChild(kg);
    return h;
  }

  /* ── Mailings: an email from a template to everybody at one stage ──────── */

  /* A TEMPLATE is a subject and words, with fill-ins in braces that the office
     knows by name; it refuses any other. A MAILING is shown in full, every email
     filled in and everybody it leaves out named with the reason, and is sent
     only from a second press that names everybody it goes to. The team
     mailbox's script sends it within ten minutes, one email to each person, and
     each is filed on its contact once the mailbox sees it go. */
  var FILL_WORDS = { first: 'their first name, or their whole name if they have none', last: 'their last name', name: 'their whole name',
    grant: 'the grant request’s name', amount: 'its amount, as $500', pipeline: 'its pipeline', stage: 'its stage', submitted: 'the day it was submitted, as October 1, 2026' };
  function mailingLinks(here) {
    return viewLinks([['#/mailings', 'Mailings', here === 'mailings'], ['#/mailings/new', 'New mailing', here === 'new'], ['#/templates', 'Templates', here === 'templates']]);
  }
  function countWords(c) {
    var out = [];
    if (c.sent) out.push(c.sent + ' sent');
    if (c.waiting) out.push(c.waiting + ' waiting to go');
    if (c.failed) out.push(c.failed + ' Google would not send');
    if (c.stopped) out.push(c.stopped + ' stopped');
    return out.join(' · ') || 'nobody left in it';
  }
  function fillInList() {
    var ul = el('ul', 'of-theirs');
    settings.fillIns.forEach(function (k) {
      var li = el('li');
      li.appendChild(el('code', null, '{' + k + '}'));
      li.appendChild(document.createTextNode(' ' + (FILL_WORDS[k] || '')));
      ul.appendChild(li);
    });
    return ul;
  }

  function templatesView() {
    view.textContent = '';
    view.appendChild(quiet('Looking…'));
    return call('view=templates').then(function (r) {
      if (r.status !== 200) return refused(r);
      took(r.body);
      return drawTemplates(r.body.templates || []);
    });
  }
  function drawTemplates(list) {
    view.textContent = '';
    var h = heading(2, 'Templates');
    view.appendChild(h);
    view.appendChild(mailingLinks('templates'));
    view.appendChild(el('p', null, 'A template is the subject and words of a mailing. These fill-ins are filled in for each person:'));
    view.appendChild(fillInList());
    var add = el('p', 'of-row'); var a = el('a', 'cb-btn of-small', 'New template'); a.href = '#/templates/new'; add.appendChild(a);
    view.appendChild(add);
    if (!list.length) { view.appendChild(quiet('No templates yet.')); return h; }
    var ul = el('ul', 'of-theirs');
    list.forEach(function (t) {
      var li = el('li');
      var ta = el('a', null, t.name); ta.href = '#/templates/edit/' + t.id;
      li.appendChild(ta);
      li.appendChild(document.createTextNode(' · ' + t.subject + ' · ' + (t.edited ? 'changed by ' + (t.editedBy || 'somebody') + ', ' + when(t.edited) : 'added by ' + (t.by || 'somebody') + ', ' + when(t.t))));
      ul.appendChild(li);
    });
    view.appendChild(ul);
    return h;
  }
  function templateFormView(id) {
    view.textContent = '';
    view.appendChild(quiet('Looking…'));
    return call('view=templates').then(function (r) {
      if (r.status !== 200) return refused(r);
      took(r.body);
      var t = id ? (r.body.templates || []).filter(function (x) { return x.id === id; })[0] : null;
      if (id && !t) { view.textContent = ''; var h = heading(2, 'That template has been deleted'); view.appendChild(h); view.appendChild(backTo('#/templates', '← All templates')); return h; }
      return drawTemplateForm(t);
    });
  }
  function drawTemplateForm(t) {
    view.textContent = '';
    view.appendChild(backTo('#/templates', '← All templates'));
    var h = heading(2, t ? 'Changing ' + t.name : 'A new template');
    view.appendChild(h);
    var form = el('form', 'of-form');
    form.noValidate = true;
    function field(id, label, input, wide) {
      var w = el('div', 'of-field' + (wide ? ' of-wide' : ''));
      var l = el('label', 'cb-lab', label); l.htmlFor = id; input.id = id;
      w.appendChild(l); w.appendChild(input);
      form.appendChild(w);
      return input;
    }
    var name = el('input', 'cb-say of-input'); name.type = 'text'; name.maxLength = settings.templateNameMax; name.value = t ? t.name : ''; name.autocomplete = 'off';
    field('of-tname', 'Name, for the office', name);
    var subject = el('input', 'cb-say of-input'); subject.type = 'text'; subject.maxLength = settings.templateSubjectMax; subject.value = t ? t.subject : ''; subject.autocomplete = 'off';
    field('of-tsubject', 'Subject', subject, true);
    var text = el('textarea', 'cb-say of-text'); text.rows = 12; text.maxLength = settings.templateBodyMax; text.value = t ? t.body : '';
    field('of-tbody', 'Words', text);
    text.setAttribute('aria-describedby', 'of-tbody-hint');
    var hint = el('div', 'cb-quiet of-hint');
    hint.id = 'of-tbody-hint';
    hint.appendChild(el('p', null, 'Plain text, sent as written, with these fill-ins filled in for each person:'));
    hint.appendChild(fillInList());
    form.appendChild(hint);
    var row = el('div', 'of-row');
    var go = el('button', 'cb-btn', t ? 'Save' : 'Add the template'); go.type = 'submit';
    var cancel = el('a', 'cb-btn', 'Cancel'); cancel.href = '#/templates';
    row.appendChild(go); row.appendChild(cancel);
    if (t) {
      var del = el('button', 'cb-btn', 'Delete'); del.type = 'button';
      del.addEventListener('click', function () {
        sure(row, 'This deletes the template ' + t.name + '. Mailings already sent keep their words.', 'Delete it', function (done) {
          call(null, { action: 'template-remove', id: t.id }).then(function (r) {
            done();
            if (r.status !== 200) { say(why(r, 'That did not delete. Nothing was changed.')); return; }
            say('Deleted.');
            location.hash = '#/templates';
          });
        }, del);
      });
      row.appendChild(del);
    }
    form.appendChild(row);
    var answer = el('p', 'of-answer'); answer.setAttribute('role', 'status');
    form.appendChild(answer);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var send = { action: 'template-save', name: name.value, subject: subject.value, body: text.value };
      if (t) send.id = t.id;
      go.disabled = true;
      answer.textContent = 'Saving…';
      call(null, send).then(function (r) {
        go.disabled = false;
        if (r.status !== 200) { answer.textContent = why(r, 'That did not save. Nothing was changed.'); return; }
        location.hash = '#/templates';
        say(t ? 'Saved.' : 'Added.');
      });
    });
    view.appendChild(form);
    return h;
  }

  function mailingsView() {
    view.textContent = '';
    view.appendChild(quiet('Looking…'));
    return call('view=mailings').then(function (r) {
      if (r.status !== 200) return refused(r);
      took(r.body);
      return drawMailings(r.body.mailings || []);
    });
  }
  function drawMailings(list) {
    view.textContent = '';
    var h = heading(2, 'Mailings');
    view.appendChild(h);
    view.appendChild(mailingLinks('mailings'));
    view.appendChild(el('p', null, 'An email from a template to everybody at one stage of a grant pipeline, one email to each person, sent from the team mailbox within ten minutes of being sent here. Each is filed on its contact once the team mailbox sees it go.'));
    if (!list.length) { view.appendChild(quiet('No mailings yet.')); return h; }
    var ul = el('ul', 'of-theirs');
    list.forEach(function (m) {
      var li = el('li');
      var a = el('a', null, m.template + ' · ' + m.pipeline + ', ' + m.stage + (m.since ? ', since ' + dayWords(m.since) : '')); a.href = '#/mailings/' + m.id;
      li.appendChild(a);
      li.appendChild(document.createTextNode(' · ' + m.by + ', ' + when(m.t) + ' · ' + countWords(m.counts)));
      ul.appendChild(li);
    });
    view.appendChild(ul);
    return h;
  }
  function mailingView(id) {
    view.textContent = '';
    view.appendChild(quiet('Looking…'));
    return call('view=mailing&id=' + encodeURIComponent(id)).then(function (r) {
      if (r.status !== 200) return refused(r);
      took(r.body);
      return drawMailing(r.body.mailing);
    });
  }
  var STATE_WORDS = { waiting: 'Waiting to go', sent: 'Sent', failed: 'Google would not send it', stopped: 'Stopped' };
  function drawMailing(m) {
    view.textContent = '';
    view.appendChild(backTo('#/mailings', '← All mailings'));
    var h = heading(2, m.template + ' · ' + m.stage);
    view.appendChild(h);
    var dl = el('dl', 'of-facts');
    function fact(k, v) { dl.appendChild(el('dt', null, k)); dl.appendChild(el('dd', null, v)); }
    fact('Template', m.template);
    fact('To', 'Everybody at ' + m.stage + ', in ' + m.pipeline + (m.since ? ', submitted since ' + dayWords(m.since) : ''));
    fact('Sent by', m.by + ', ' + when(m.t));
    if (m.stopped) fact('Stopped', (m.stoppedBy ? m.stoppedBy + ', ' : '') + when(m.stopped));
    fact('Where they are', countWords(m.counts));
    view.appendChild(dl);
    view.appendChild(el('h3', null, 'Its words, before they were filled in'));
    view.appendChild(el('p', null, 'Subject: ' + m.subject));
    view.appendChild(el('div', 'of-mail', m.body));
    view.appendChild(el('h3', null, 'Who it went to'));
    if (m.emails.length) {
      var ul = el('ul', 'of-theirs');
      m.emails.forEach(function (e) {
        var li = el('li');
        if (e.name) { var ca = el('a', null, e.name); ca.href = '#/c/' + e.contact; li.appendChild(ca); }
        else li.appendChild(document.createTextNode('A contact since deleted'));
        li.appendChild(document.createTextNode(' · '));
        if (e.grantName) { var ga = el('a', null, e.grantName); ga.href = '#/g/' + e.grant; li.appendChild(ga); }
        else li.appendChild(document.createTextNode('a grant request since deleted'));
        li.appendChild(document.createTextNode(' · ' + STATE_WORDS[e.state] + (e.when ? ', ' + when(e.when) : '')));
        ul.appendChild(li);
      });
      view.appendChild(ul);
    } else view.appendChild(quiet('Nobody: every email in it was taken back with its contact.'));
    var tools = el('div', 'of-row');
    if (m.counts.waiting) {
      var stop = el('button', 'cb-btn of-small', 'Stop the rest'); stop.type = 'button';
      stop.addEventListener('click', function () {
        sure(tools, 'This takes back the ' + m.counts.waiting + (m.counts.waiting === 1 ? ' email' : ' emails') + ' not sent yet. Those already sent cannot be taken back.', 'Stop them', function (done) {
          call(null, { action: 'mailing-stop', id: m.id }).then(function (r) {
            done();
            if (r.status !== 200) { say(why(r, 'That did not stop. Nothing was changed.')); return; }
            say(r.body.stopped ? 'Stopped.' : 'There was nothing left to stop: the team mailbox had sent them.');
            mailingView(m.id).then(function (hh) { if (hh) hh.focus(); });
          });
        }, stop);
      });
      tools.appendChild(stop);
    } else {
      var del = el('button', 'cb-btn of-small', 'Delete this record'); del.type = 'button';
      del.addEventListener('click', function () {
        sure(tools, 'This deletes the office’s record of this mailing. The emails it sent stay in Gmail and on each contact.', 'Delete it', function (done) {
          call(null, { action: 'mailing-remove', id: m.id }).then(function (r) {
            done();
            if (r.status !== 200) { say(why(r, 'That did not delete. Nothing was changed.')); return; }
            say('Deleted.');
            location.hash = '#/mailings';
          });
        }, del);
      });
      tools.appendChild(del);
    }
    view.appendChild(tools);
    return h;
  }

  function newMailingView(hash) {
    view.textContent = '';
    view.appendChild(quiet('Looking…'));
    var q = {};
    (String(hash).split('?')[1] || '').split('&').forEach(function (kv) {
      var i = kv.indexOf('=');
      if (i > 0) { try { q[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1)); } catch (e) { /* a broken address starts empty */ } }
    });
    return call('view=templates').then(function (r) {
      if (r.status !== 200) return refused(r);
      took(r.body);
      return drawNewMailing(r.body.templates || [], q);
    });
  }
  function drawNewMailing(templates, q) {
    view.textContent = '';
    view.appendChild(backTo('#/mailings', '← All mailings'));
    var h = heading(2, 'A new mailing');
    view.appendChild(h);
    view.appendChild(el('p', null, 'An email from a template to everybody at one stage of a grant pipeline. You see every email, filled in, and who is left out, before anything is sent.'));
    if (!templates.length) {
      var p = el('p'); p.appendChild(document.createTextNode('There are no templates yet. '));
      var ta = el('a', null, 'Write one first'); ta.href = '#/templates/new'; p.appendChild(ta);
      view.appendChild(p);
      return h;
    }
    var form = el('form', 'of-form');
    form.noValidate = true;
    function field(id, label, input) {
      var w = el('div', 'of-field');
      var l = el('label', 'cb-lab', label); l.htmlFor = id; input.id = id;
      w.appendChild(l); w.appendChild(input);
      form.appendChild(w);
      return input;
    }
    var ps = field('of-npipe', 'Pipeline', el('select', 'cb-say of-input'));
    var ss = field('of-nstage', 'Stage', el('select', 'cb-say of-input'));
    var ts = field('of-ntemplate', 'Template', el('select', 'cb-say of-input'));
    var since = field('of-nsince', 'Submitted since', el('input', 'cb-say of-input'));
    since.type = 'date';
    since.setAttribute('aria-describedby', 'of-nsince-hint');
    var sinceHint = el('p', 'cb-quiet of-hint', 'Optional. A stage holds everybody who ever reached it, so a date here narrows it to the requests submitted on or after that day. Empty is everybody.');
    sinceHint.id = 'of-nsince-hint';
    since.parentNode.appendChild(sinceHint);
    var thisYear = el('button', 'cb-btn of-small', 'This year'); thisYear.type = 'button';
    since.parentNode.appendChild(thisYear);
    settings.pipelines.forEach(function (x) { var o = el('option', null, x.name); o.value = x.name; ps.appendChild(o); });
    if (q.pipeline && settings.pipelines.some(function (x) { return x.name === q.pipeline; })) ps.value = q.pipeline;
    function stages() {
      ss.textContent = '';
      var pipe = settings.pipelines.filter(function (x) { return x.name === ps.value; })[0];
      (pipe ? pipe.stages : []).forEach(function (x) { var o = el('option', null, x.name); o.value = x.name; ss.appendChild(o); });
    }
    stages();
    if (q.stage) ss.value = q.stage;
    if (!ss.value && ss.options.length) ss.selectedIndex = 0;
    templates.forEach(function (t) { var o = el('option', null, t.name); o.value = t.id; ts.appendChild(o); });
    if (q.template && templates.some(function (t) { return t.id === q.template; })) ts.value = q.template;
    if (/^\d{4}-\d{2}-\d{2}$/.test(q.since || '')) since.value = q.since;
    var row = el('div', 'of-row');
    var look = el('button', 'cb-btn', 'Show every email'); look.type = 'submit';
    row.appendChild(look);
    form.appendChild(row);
    var answer = el('p', 'of-answer'); answer.setAttribute('role', 'status');
    form.appendChild(answer);
    view.appendChild(form);
    var shown = el('div', 'of-shownmail');
    view.appendChild(shown);

    function remember() {
      var to = '#/mailings/new?pipeline=' + encodeURIComponent(ps.value) + '&stage=' + encodeURIComponent(ss.value) + '&template=' + encodeURIComponent(ts.value) +
        (since.value ? '&since=' + since.value : '');
      if (to !== location.hash) history.replaceState(null, '', to);
    }
    function clear() { shown.textContent = ''; answer.textContent = ''; remember(); }
    ps.addEventListener('change', function () { stages(); clear(); });
    ss.addEventListener('change', clear);
    ts.addEventListener('change', clear);
    since.addEventListener('change', clear);
    thisYear.addEventListener('click', function () { since.value = new Date().getFullYear() + '-01-01'; clear(); since.focus(); });
    remember();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      shown.textContent = '';
      look.disabled = true;
      answer.textContent = 'Filling them in…';
      call(null, { action: 'mailing-preview', pipeline: ps.value, stage: ss.value, template: ts.value, since: since.value || null }).then(function (r) {
        look.disabled = false;
        if (r.status !== 200) { answer.textContent = why(r, 'The emails could not be filled in just now.'); return; }
        answer.textContent = '';
        drawPreview(r.body);
      });
    });

    function drawPreview(p) {
      var n = p.emails.length;
      var top = heading(3, n + (n === 1 ? ' email' : ' emails') + (p.left.length ? ' · ' + p.left.length + ' left out' : ''));
      shown.appendChild(top);
      if (p.since) shown.appendChild(el('p', null, 'Only the requests submitted on or after ' + dayWords(p.since) + '. ' +
        (p.before ? p.before + (p.before === 1 ? ' earlier one at ' + p.stage + ' is' : ' earlier ones at ' + p.stage + ' are') + ' not in it.' : 'None at ' + p.stage + ' is earlier.')));
      if (p.left.length) {
        shown.appendChild(el('h3', null, 'Left out'));
        var lu = el('ul', 'of-theirs');
        p.left.forEach(function (x) {
          var li = el('li');
          var ga = el('a', null, x.grantName); ga.href = '#/g/' + x.grant; li.appendChild(ga);
          li.appendChild(document.createTextNode(': ' + x.why + '.'));
          lu.appendChild(li);
        });
        shown.appendChild(lu);
      }
      if (!n) { shown.appendChild(quiet('Nobody at ' + p.stage + (p.since ? ' submitted since ' + dayWords(p.since) : '') + ' can be emailed, so there is nothing to send.')); top.focus(); return; }
      if (n > p.max) { shown.appendChild(el('p', null, 'A mailing goes to at most ' + p.max + ' people. Move some grant requests on first, or write to them in two mailings.')); top.focus(); return; }
      shown.appendChild(el('h3', null, 'The emails'));
      p.emails.forEach(function (x) {
        var box = el('div', 'of-preview');
        box.appendChild(el('p', 'of-to', 'To ' + (x.name ? x.name + ' <' + x.to + '>' : x.to) + ' · ' + x.grantName));
        box.appendChild(el('p', null, 'Subject: ' + x.subject));
        box.appendChild(el('div', 'of-mail', x.body));
        shown.appendChild(box);
      });
      var go = el('div', 'of-row');
      var send = el('button', 'cb-btn', 'Send ' + n + (n === 1 ? ' email' : ' emails')); send.type = 'button';
      go.appendChild(send);
      shown.appendChild(go);
      var names = p.emails.map(function (x) { return x.name || x.to; });
      send.addEventListener('click', function () {
        sure(go, 'Send ' + (n === 1 ? 'this email' : 'these ' + n + ' emails') + ' from the team mailbox, one to each person, within ten minutes?' +
          (p.since ? ' Only requests at ' + p.stage + ' submitted since ' + dayWords(p.since) + '.' : ' Everybody at ' + p.stage + ', whenever they were submitted.') + ' They go to: ' + names.join(', ') + '.',
          'Yes, send ' + (n === 1 ? 'it' : 'them'), function (done) {
            call(null, { action: 'mailing-send', pipeline: p.pipeline, stage: p.stage, template: p.template.id, since: p.since, stamp: p.template.stamp,
              grants: p.emails.map(function (x) { return x.grant; }) }).then(function (r) {
              done();
              if (r.status !== 200) { say(why(r, 'That did not send. Nothing was sent.')); return; }
              location.hash = '#/mailings/' + r.body.mailing;
              say('Sent to the team mailbox, which sends ' + (r.body.count === 1 ? 'it' : 'them') + ' within ten minutes.');
            });
          }, send);
      });
      top.focus();
    }
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
    else if (parts[0] === 'cases' && parts[1] === 'board') done = casesView(true);
    else if (parts[0] === 'cases' && parts[1] === 'new') done = caseFormView(null, (/[?&]contact=([^&]+)/.exec(hash) || [])[1] || null);
    else if (parts[0] === 'cases' && parts[1] === 'edit' && parts[2]) done = caseFormView(parts[2], null);
    else if (parts[0] === 'cases') done = casesView(false);
    else if (parts[0] === 'k' && parts[1]) done = caseView(parts[1]);
    else if (parts[0] === 'm' && parts[1]) done = emailView(parts[1]);
    else if (parts[0] === 'dashboard') done = dashboardView(parts[1] === 'quickbooks' ? parts[2] : null);
    else if (parts[0] === 'reports') done = reportsView();
    else if (parts[0] === 'templates' && parts[1] === 'new') done = templateFormView(null);
    else if (parts[0] === 'templates' && parts[1] === 'edit' && parts[2]) done = templateFormView(parts[2]);
    else if (parts[0] === 'templates') done = templatesView();
    else if (parts[0] === 'mailings' && parts[1] === 'new') done = newMailingView(hash);
    else if (parts[0] === 'mailings' && parts[1]) done = mailingView(parts[1]);
    else if (parts[0] === 'mailings') done = mailingsView();
    else done = contactsView();
    // The bar says which part of the office you are in.
    [navDash, navContacts, navGrants, navCases, navMailings].forEach(function (a) { a.removeAttribute('aria-current'); });
    var part = parts[0] === 'dashboard' || parts[0] === 'reports' ? navDash : parts[0] === 'grants' || parts[0] === 'g' ? navGrants : parts[0] === 'cases' || parts[0] === 'k' ? navCases
      : parts[0] === 'mailings' || parts[0] === 'templates' ? navMailings : navContacts;
    part.setAttribute('aria-current', !parts[1] && (!parts.length || parts[0] === 'grants' || parts[0] === 'cases' || parts[0] === 'mailings' || parts[0] === 'dashboard') ? 'page' : 'true');
    if (parts[0] === 'reports') navDash.setAttribute('aria-current', 'true');
    Promise.resolve(done).then(function (h) { if (h && !first) h.focus(); first = false; });
  }
  window.addEventListener('hashchange', function () { if ((location.hash || '').indexOf('#/') === 0 || !location.hash) route(); });
  route();
})();

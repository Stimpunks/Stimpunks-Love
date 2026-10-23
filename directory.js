/* =============================================================================
   The community directory, on directory.html. Ryan's ask, 2026-10-23: an
   opt-in directory for people signed on to the CB, with each person's
   nameplate and tagline. See netlify/cb/lib.mjs, profiles, and
   privacy.html#community-directory for what it keeps.

   THE CB'S, DRESSED AS THE CB, as the forums and the joining desk are: a
   shadow root with cb.css and directory.css the only sheets that reach it,
   in the theme the reader's radio wears. directory.css names no colour of its
   own, and a line of the directory is profile.js's listing(), the one the
   card's editor shows before a card is saved, so the two cannot differ.

   OPT-IN, AND THE SERVER DECIDES. Nobody is in it until they tick Show my
   profile in the community directory on their profile card; this file only
   asks /cb/directory with the pass and shows what it is told. It reads
   love-cb for the pass and never writes it, and keeps nothing.

   NO NUMBER AND NO DATE. The list is alphabetical, as Who's online is, and
   the filter narrows what is shown and sends nothing and never says how many
   it found. A name opens that person's card through the radio, as a name on
   Who's online does. Nothing here moves. tools/make-profile.py holds all of
   this.
   ============================================================================= */
(function () {
  'use strict';

  var mount = document.querySelector('[data-directory]');
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
  function link(href, text) { var a = el('a', null, text); a.href = href; return a; }
  function words(p, parts) {
    parts.forEach(function (x) { p.appendChild(typeof x === 'string' ? document.createTextNode(x) : x); });
    return p;
  }

  /* ── The box ───────────────────────────────────────────────────────────── */

  var host = el('div', 'dr-mount');
  var root = host.attachShadow({ mode: 'open' });
  var waiting = 2;
  host.style.visibility = 'hidden';
  ['/cb.css', '/directory.css'].forEach(function (href) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    function ready() { if (--waiting === 0) host.style.visibility = ''; }
    l.addEventListener('load', ready);
    l.addEventListener('error', ready);
    root.appendChild(l);
  });
  var box = el('div', 'dr');
  root.appendChild(box);
  var bar = el('div', 'cb-bar dr-bar');
  var brand = el('p', 'dr-name');
  brand.appendChild(el('span', 'cb-brand', 'CB'));
  brand.appendChild(document.createTextNode(' Community directory'));
  bar.appendChild(brand);
  box.appendChild(bar);
  var view = el('div', 'dr-view');
  box.appendChild(view);
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
  } catch (e) { /* the directory keeps the colours it opened in */ }
  ['(prefers-contrast: more)', '(prefers-color-scheme: light)'].forEach(function (q) {
    try { window.matchMedia(q).addEventListener('change', dressNow); } catch (e) { /* an old browser */ }
  });

  /* ── Somebody not signed on ─────────────────────────────────────────── */

  var on = cbState();
  if (!on) {
    view.appendChild(words(el('p'), ['The community directory lists everybody on the CB who has chosen to be in it, and only people signed on to the CB can see it. Joining the CB takes an invite: ',
      link('/community-center.html#getting-started', 'the Community Center'), ' says how to ask for one. Already on? Sign on at ',
      link('/community-center.html#cb-signon-desk', 'the front desk'), ' and come back.']));
    return;
  }
  if (/^cb1\./.test(on.pass)) {
    view.appendChild(el('p', null, 'This browser is signed on with a shared password, which only claims a username now. The radio, in the corner of the screen, will claim ' + on.handle + ' for you, and then the directory opens here.'));
    return;
  }

  /* ── The drawings, fetched once, whoever asks first ───────────────────── */

  function need(src, ready, mark) {
    return new Promise(function (go) {
      if (ready()) { go(); return; }
      var t = document.querySelector('script[src="' + src + '"]') || (mark ? document.querySelector('script[' + mark + ']') : null);
      if (!t) {
        t = document.createElement('script');
        t.src = src;
        if (mark) t.setAttribute(mark, '');
        document.head.appendChild(t);
      }
      t.addEventListener('load', go);
      t.addEventListener('error', go);
      // It may have loaded already, for the radio, before this listened.
      var tries = 0;
      (function look() { if (ready() || ++tries > 50) { go(); return; } setTimeout(look, 200); })();
    });
  }
  var drawn = Promise.all([
    need('/cb-themes.js', function () { return !!window.loveCbArt; }),
    need('/avatar.js', function () { return !!window.loveAvatar; }, 'data-cb-avatar'),
  ]).then(function () { return need('/profile.js', function () { return !!window.loveProfile; }); });

  /* ── What is drawn ────────────────────────────────────────────────────── */

  var me = el('div', 'dr-me');
  var meSaid = el('p');
  var edit = el('button', 'cb-btn dr-edit', 'Edit my profile card');
  edit.type = 'button';
  edit.setAttribute('aria-haspopup', 'dialog');
  me.appendChild(meSaid);
  me.appendChild(edit);
  view.appendChild(me);

  var find = el('div', 'dr-find');
  find.setAttribute('role', 'search');
  var findLab = el('label', 'cb-lab', 'Find somebody');
  findLab.htmlFor = 'dr-q';
  var findBox = el('input', 'cb-say dr-q');
  findBox.id = 'dr-q';
  findBox.type = 'search';
  findBox.autocomplete = 'off';
  findBox.spellcheck = false;
  var findHint = el('p', 'cb-hint', 'By name, pronouns or tagline. It narrows the list in your browser and sends nothing.');
  findHint.id = 'dr-q-hint';
  findBox.setAttribute('aria-describedby', findHint.id);
  find.appendChild(findLab);
  find.appendChild(findBox);
  find.appendChild(findHint);
  find.hidden = true;
  view.appendChild(find);

  var said = el('p', 'cb-said dr-said');
  said.setAttribute('role', 'status');
  view.appendChild(said);
  var list = el('ul', 'dr-list');
  list.setAttribute('aria-label', 'The community directory');
  list.hidden = true;
  view.appendChild(list);
  var none = el('p', 'cb-quiet dr-none');
  none.hidden = true;
  view.appendChild(none);
  var again = el('button', 'cb-btn', 'Try again');
  again.type = 'button';
  again.hidden = true;
  view.appendChild(again);

  function say(t) { said.textContent = t || ''; }

  edit.addEventListener('click', function () {
    if (window.loveRadioEditCard) { say(''); window.loveRadioEditCard(edit); }
    else say('Your card is under Profile, on the radio. If the radio is in a window of its own, it is there; bring it back here to edit your card from this page.');
  });

  function ask() {
    var s = cbState();
    if (!s) return Promise.resolve({ status: 401, body: {} });
    return fetch('/cb/directory', {
      method: 'GET', credentials: 'omit', cache: 'no-store',
      headers: { 'accept': 'application/json', 'authorization': 'Bearer ' + s.pass },
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (b) { return { status: r.status, body: b || {} }; });
    }, function () { return { status: 0, body: {} }; });
  }

  function narrow() {
    var q = findBox.value.trim().toLowerCase(), any = false;
    Array.prototype.forEach.call(list.children, function (li) {
      var show = !q || li.dataset.find.indexOf(q) >= 0;
      li.hidden = !show;
      if (show) any = true;
    });
    if (!list.children.length) return;
    none.hidden = any;
    none.textContent = any ? '' : 'Nobody in the directory matches that.';
  }
  findBox.addEventListener('input', narrow);

  function draw(b) {
    var LP = window.loveProfile;
    meSaid.textContent = b.listed
      ? 'You are in the directory. To come out of it, untick Show my profile in the community directory on your profile card.'
      : 'You are not in the directory. To be in it, tick Show my profile in the community directory on your profile card, and save it.';
    list.textContent = '';
    var people = Array.isArray(b.people) ? b.people : [];
    people.forEach(function (p) {
      var who = el('button', 'cb-handle cb-dir-name', p.handle);
      who.type = 'button';
      who.setAttribute('aria-haspopup', 'dialog');
      who.addEventListener('click', function () {
        if (window.loveRadioPeek) window.loveRadioPeek(p.handle, who, { base: !!p.base, claimed: !p.base });
        else say('Profiles open from the radio on this page. Bring the radio back here if it is in a window of its own.');
      });
      var li = LP ? LP.listing(p, who, 'li') : el('li', 'cb-dir-row');
      if (!LP) li.appendChild(who);
      li.dataset.find = [p.handle, p.pronouns || '', p.tagline || ''].join(' ').toLowerCase();
      list.appendChild(li);
      if (LP && li.pfPlate) LP.drawing(li.pfPlate, p.plate);
    });
    list.hidden = !people.length;
    find.hidden = !people.length;
    none.hidden = !!people.length;
    if (!people.length) none.textContent = 'Nobody is in the directory yet. Anybody signed on to the CB can be, by ticking Show my profile in the community directory on their profile card.';
    else narrow();
  }

  function load() {
    again.hidden = true;
    return Promise.all([ask(), drawn]).then(function (rs) {
      var r = rs[0];
      if (r.status === 200) { say(''); draw(r.body); return; }
      list.hidden = find.hidden = true;
      if (r.status === 401) {
        me.hidden = true;
        view.insertBefore(words(el('p'), ['Since you signed on, this username has been signed off. Sign on again at ',
          link('/community-center.html#cb-signon-desk', 'the front desk'), ' and come back.']), said);
        return;
      }
      say(r.status === 429 ? 'Too many tries from here in a minute. Wait a moment and try again.' : (r.body && r.body.error) || 'The directory could not be read just now.');
      again.hidden = false;
    });
  }
  again.addEventListener('click', function () { say('Looking again…'); load(); });
  meSaid.textContent = 'Opening the directory…';
  load();

  // Your own card saved or cleared, from this page or anywhere the radio is:
  // ask again, so your own line is as you left it.
  document.addEventListener('love-profile-saved', function () { load(); });
})();

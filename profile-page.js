/* =============================================================================
   A profile's own page, profile.html#<username>. Helen Edgar asked how to
   share her profile outside the street; Ryan's calls, 2026-10-26: a direct
   link to every profile, a card that is private, for the community or open to
   the public, and nothing of the community's on a public one. See
   netlify/cb/lib.mjs, profilePage, and privacy.html#public-profiles.

   THE CB'S, DRESSED AS THE CB, as the community directory is: a shadow root
   with cb.css and profile-page.css the only sheets that reach it, in the
   theme the reader's radio wears, or the device's when there is no radio. The
   card is profile.js's, the one the radio draws, and every tab is drawn with
   the street's own drawings: avatar.js, animals.js, patches.js, chimera.js,
   crystal-pouch.js and herb-basket.js. profile-page.css names no colour.

   THE NAME IS AFTER THE #, so it never reaches a server in the address: this
   page sends it in the body of one request, /cb/profile/page, with the CB
   pass when there is one. The server decides everything: somebody signed off
   is shown a card only if its owner opened it to the public, and is told the
   same thing for every other name, so nobody can learn here which usernames
   exist.

   NO PROPS, NO CHAT STATUS AND NO WAY TO MESSAGE ANYBODY ON THIS PAGE. Those
   are the community's and stay on the radio: somebody signed on is offered
   buttons that open them there, through loveRadioPeek and loveRadioMessage,
   and somebody signed off is offered nothing of them. The friendly edit is a
   Props tab here "so the page is complete", which puts other people's words
   on a page anybody can read.

   It reads love-cb for the pass and never writes it, and keeps nothing. Only
   the tabs a person shows are drawn, and nothing is counted. Nothing moves
   unless the dial is at MAX GLITTER, when a card's effect may pass over it, as
   it does on the radio. tools/make-profile.py holds this file.
   ============================================================================= */
(function () {
  'use strict';

  var mount = document.querySelector('[data-profile-page]');
  if (!mount) return;
  var SVGNS = 'http://www.w3.org/2000/svg';

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

  var host = el('div', 'pp-mount');
  var root = host.attachShadow({ mode: 'open' });
  var waiting = 2;
  host.style.visibility = 'hidden';
  ['/cb.css', '/profile-page.css'].forEach(function (href) {
    var l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = href;
    function ready() { if (--waiting === 0) host.style.visibility = ''; }
    l.addEventListener('load', ready);
    l.addEventListener('error', ready);
    root.appendChild(l);
  });
  var box = el('div', 'pp');
  root.appendChild(box);
  var view = el('div', 'pp-view');
  box.appendChild(view);
  mount.textContent = '';
  mount.appendChild(host);

  /* The same colours as my radio, or call.js's answer for what it would wear.
     An effect passes over a card only at MAX GLITTER, or when the reader let
     their radio's theme move, the radio's own rule. */
  function radioHost() { return document.querySelector('.cb-host'); }
  function dressNow() {
    var lc = window.loveCall, r = radioHost(), s = cbState(), look = null;
    if (r && r.getAttribute('data-scheme')) look = r.getAttribute('data-scheme');
    else if (lc && lc.schemeFor) look = lc.schemeFor((s && s.scheme) || 'auto');
    if (look) host.setAttribute('data-scheme', look);
    var max = document.documentElement.getAttribute('data-intensity') === 'max';
    var low = document.documentElement.hasAttribute('data-low');
    host.setAttribute('data-motion', !low && (max || letMove || (s && s.motion)) ? 'on' : 'off');
    // The note above the card, Ryan's ask: nobody should miss the whimsy. It
    // is not shown once it is all moving, nor to somebody who asked for quiet.
    if (glitterNote) glitterNote.hidden = low || max;
    if (moveBtn) {
      moveBtn.hidden = low || max;
      moveBtn.setAttribute('aria-pressed', String(letMove));
      moveBtn.textContent = letMove ? 'Hold it still' : 'Let it move';
    }
  }
  /* LET IT MOVE (Ryan's ask, 2026-10-26: the animations are a big part of what
     people want to show off). A card's effect, and every drawing on it that
     moves, moves at MAX GLITTER by itself and at any other setting only after
     this press, the candles' rule: moving at Regular unasked would change what
     Regular means. It lasts for this visit and is kept nowhere, and a
     low-stimulation mode holds everything still whatever is pressed. */
  var letMove = false, moveBtn = null, glitterNote = null;
  dressNow();
  try {
    var watched = null;
    var onHost = new MutationObserver(dressNow);
    new MutationObserver(function () {
      var r = radioHost();
      if (r && r !== watched) { watched = r; onHost.observe(r, { attributes: true, attributeFilter: ['data-scheme'] }); dressNow(); }
    }).observe(document.body, { childList: true });
    new MutationObserver(dressNow).observe(document.documentElement, { attributes: true, attributeFilter: ['data-intensity', 'data-low'] });
  } catch (e) { /* the page keeps the colours it opened in */ }
  ['(prefers-contrast: more)', '(prefers-color-scheme: light)'].forEach(function (q) {
    try { window.matchMedia(q).addEventListener('change', dressNow); } catch (e) { /* an old browser */ }
  });

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
  function getJSON(path) {
    return fetch(path, { credentials: 'omit' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }
  var cardReady = Promise.all([
    need('/cb-themes.js', function () { return !!window.loveCbArt; }),
    need('/avatar.js', function () { return !!window.loveAvatar; }, 'data-cb-avatar'),
    need('/markdown.js', function () { return !!window.loveMarkdown; }),
  ]).then(function () { return need('/profile.js', function () { return !!window.loveProfile; }); });
  var rooms = getJSON('/cb-rooms.json').then(function (d) {
    var by = {};
    ((d && d.rooms) || []).forEach(function (r) { if (r && r.tag) by[r.tag] = r; });
    return by;
  });

  /* ── Whose ────────────────────────────────────────────────────────────── */

  function wanted() {
    var h = location.hash.replace(/^#/, '');
    try { h = decodeURIComponent(h); } catch (e) { /* as typed */ }
    return h.replace(/^@/, '').trim();
  }
  function addressOf(handle) {
    return location.origin + '/profile.html#' + encodeURIComponent(handle);
  }

  function ask(handle) {
    var s = cbState(), headers = { 'accept': 'application/json', 'content-type': 'application/json' };
    // A shared password's pass only claims a username now: it is nobody here.
    if (s && !/^cb1\./.test(s.pass)) headers.authorization = 'Bearer ' + s.pass;
    return fetch('/cb/profile/page', {
      method: 'POST', credentials: 'omit', cache: 'no-store', headers: headers,
      body: JSON.stringify({ handle: handle }),
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (b) { return { status: r.status, body: b || {} }; });
    }, function () { return { status: 0, body: {} }; });
  }

  /* ── Links on a card, as the radio links them ─────────────────────────── */

  // An address as typed, linked to what URL() makes of it, with its host after
  // it, so nobody is sent somewhere it does not say.
  function cardLink(li, said) {
    var u;
    try { u = new URL(said); } catch (e) { u = null; }
    if (!u || !/^https?:$/.test(u.protocol) || u.username || u.password || !/\./.test(u.hostname)) {
      li.appendChild(document.createTextNode(said));
      return;
    }
    var a = el('a', 'cb-away', said);
    a.href = u.href;
    if (/^(?:www\.)?stimpunks\.world$/i.test(u.hostname)) { li.appendChild(a); return; }
    a.target = '_blank';
    a.rel = 'noopener noreferrer nofollow ugc';
    var host = u.hostname.replace(/^www\./, '');
    var mark = el('span', 'cb-away-host', ' ↗ ' + host);
    mark.setAttribute('aria-hidden', 'true');
    a.appendChild(mark);
    a.appendChild(el('span', 'sr', ', leaves the street for ' + host + ', in a new tab'));
    li.appendChild(a);
  }

  /* ── Tabs, the ARIA pattern, as the radio's profile has them ──────────── */

  function tabsInto(right, label, names) {
    var list = el('div', 'pf-tabs');
    list.setAttribute('role', 'tablist');
    list.setAttribute('aria-label', label);
    right.appendChild(list);
    var tabs = [], panels = [];
    names.forEach(function (n, i) {
      var t = el('button', 'pf-tab', n);
      t.type = 'button';
      t.id = 'pp-tab-' + i;
      t.setAttribute('role', 'tab');
      t.setAttribute('aria-controls', 'pp-panel-' + i);
      var pn = el('div', 'pf-panel-tab');
      pn.id = 'pp-panel-' + i;
      pn.setAttribute('role', 'tabpanel');
      pn.setAttribute('aria-labelledby', t.id);
      pn.tabIndex = 0;
      list.appendChild(t);
      right.appendChild(pn);
      tabs.push(t); panels.push(pn);
      t.addEventListener('click', function () { show(i, false); });
    });
    function show(i, focus) {
      tabs.forEach(function (t, j) {
        t.setAttribute('aria-selected', String(i === j));
        t.tabIndex = i === j ? 0 : -1;
        panels[j].hidden = i !== j;
      });
      if (focus) tabs[i].focus();
    }
    list.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(e.target), n = tabs.length;
      if (i < 0) return;
      var to = e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i + n - 1) % n
        : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1;
      if (to < 0) return;
      e.preventDefault();
      show(to, true);
    });
    show(0, false);
    return panels;
  }

  /* ── An avatar larger, in a dialog of its own ─────────────────────────── */

  var lbox = null;
  function avatarLarger(a, from, whose) {
    if (!lbox) {
      lbox = el('dialog', 'pp-lbox');
      lbox.setAttribute('aria-label', 'An avatar, larger');
      lbox.addEventListener('click', function (e) { if (e.target === lbox) lbox.close(); });
      lbox.addEventListener('close', function () { if (lbox.from && lbox.from.isConnected) lbox.from.focus(); });
      root.appendChild(lbox);
    }
    lbox.textContent = '';
    lbox.from = from;
    var art = window.loveAvatar.draw(a.look, { ground: true, cls: 'pp-lbox__art' });
    if (art) lbox.appendChild(art);
    lbox.appendChild(el('p', 'pp-lbox__whose', a.name || ('The avatar ' + whose + ' wears')));
    if (a.about) lbox.appendChild(el('p', 'pp-lbox__about', a.about));
    var shut = el('button', 'cb-btn', 'Close');
    shut.type = 'button';
    shut.addEventListener('click', function () { lbox.close(); });
    lbox.appendChild(shut);
    lbox.showModal();
    shut.focus();
  }

  /* ── The tabs' drawings ───────────────────────────────────────────────── */

  function avatarsInto(panel, list, whose) {
    var grid = el('div', 'cb-peek__avatars');
    list.forEach(function (a, i) {
      var fig = el('figure', 'cb-peek__av' + (i === 0 ? ' cb-peek__av--first' : ''));
      var open = el('button', 'cb-peek__open');
      open.type = 'button';
      var what = a.worn ? 'the avatar ' + whose + ' wears' : (a.name || 'an avatar of ' + whose + '’s');
      open.setAttribute('aria-label', 'Open ' + what + ' larger' + (a.about ? '. ' + a.about : ''));
      var art = window.loveAvatar.draw(a.look, { ground: true, cls: 'cb-peek__art' });
      if (art) open.appendChild(art);
      open.addEventListener('click', function () { avatarLarger(a, open, whose); });
      fig.appendChild(open);
      var cap = el('figcaption', 'cb-peek__cap');
      cap.setAttribute('aria-hidden', 'true');
      if (a.worn) cap.appendChild(el('span', 'cb-avatar__worn', 'Wearing on the CB'));
      if (a.name) cap.appendChild(el('span', 'cb-peek__name', a.name));
      if (a.about) cap.appendChild(el('span', 'cb-peek__about', a.about));
      if (cap.childNodes.length) fig.appendChild(cap);
      grid.appendChild(fig);
    });
    panel.appendChild(grid);
  }

  // A pet in a few words: its name, what it is and its markings.
  function petWords(a) {
    var w = a.words || {};
    return w.coat + ' ' + (w.noun || (a.kind === 'dog' ? 'dog' : 'cat')) + ' ' + w.mark;
  }
  function petsInto(panel, pets) {
    var ul = el('ul', 'cb-pets__list');
    pets.slice().reverse().forEach(function (a) {
      var li = el('li', 'cb-pet');
      li.appendChild(window.loveAnimals.draw(a, 'cb-pet__art'));
      var w = el('div', 'cb-pet__words');
      w.appendChild(el('p', 'cb-pet__name', a.name || 'Not named yet'));
      w.appendChild(el('p', 'cb-pet__about', 'A ' + petWords(a) + '.'));
      li.appendChild(w);
      ul.appendChild(li);
    });
    panel.appendChild(ul);
  }

  function badgeArt(b) {
    var svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('viewBox', '0 0 32 32');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('class', 'cb-badge__art');
    (b.draw || []).forEach(function (p) {
      if (!p || typeof p[1] !== 'string' || !/^[MmLlHhVvCcSsQqTtAaZz0-9 .,\-]+$/.test(p[1])) return;
      var path = document.createElementNS(SVGNS, 'path');
      path.setAttribute('d', p[1]);
      if (p[0] === 'f') path.setAttribute('fill', 'currentColor');
      else {
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', 'currentColor');
        path.setAttribute('stroke-width', '2.2');
        path.setAttribute('stroke-linecap', 'square');
      }
      svg.appendChild(path);
    });
    return svg;
  }
  // Which badges, worked out from what the profile shows, never counted: the
  // jobs make most of them and shown pets make Pet Parent. Never Rescue
  // Ranger, because nothing on the street knows who rescued.
  function badgesFor(guild, done, pets) {
    var all = guild.jobs.map(function (j) { return j.id; });
    return guild.badges.filter(function (b) {
      if (b.from === 'rescues') return false;
      if (b.from === 'pets') return pets;
      var want = b.jobs || [];
      if (b.needs === 'any') return (want.length ? want : all).some(function (id) { return done.indexOf(id) >= 0; });
      return want.length > 0 && want.every(function (id) { return done.indexOf(id) >= 0; });
    });
  }
  function badgesInto(panel, guild, jobs, pets, whose) {
    var bs = badgesFor(guild, jobs || [], pets);
    if (bs.length) {
      var ul = el('ul', 'cb-badges');
      bs.forEach(function (b) {
        var li = el('li', 'cb-badge');
        li.appendChild(badgeArt(b));
        var w = el('div', 'cb-badge__words');
        var a = el('a', 'cb-badge__name', b.name);
        a.href = '/adventurers-guild.html#badge-' + b.id;
        w.appendChild(a);
        w.appendChild(el('p', 'cb-badge__for', b['for']));
        li.appendChild(w);
        ul.appendChild(li);
      });
      panel.appendChild(ul);
    }
    if (jobs && jobs.length) {
      var det = el('details', 'cb-jobs');
      det.appendChild(el('summary', null, 'The jobs ' + whose + ' has handed in'));
      var list = el('ul', 'cb-jobs__list');
      guild.jobs.forEach(function (j) {
        if (jobs.indexOf(j.id) < 0) return;
        var li = el('li');
        li.appendChild(link('/adventurers-guild.html#job-' + j.id, j.title));
        li.appendChild(el('span', 'cb-jobs__room', ' · ' + j.room));
        list.appendChild(li);
      });
      det.appendChild(list);
      panel.appendChild(det);
    }
    if (!bs.length && !(jobs && jobs.length)) panel.appendChild(el('p', null, whose + ' has no jobs kept.'));
  }

  function jacketInto(panel, ids, whose) {
    var LP = window.lovePatches;
    var art = LP.jacket(ids, { cls: 'cb-jacket__art' });
    var wrap = el('div', 'cb-jacket');
    if (art) wrap.appendChild(art);
    panel.appendChild(wrap);
    if (!ids.length) { wrap.appendChild(el('p', 'cb-jacket__on', 'Nothing is sewn on ' + whose + '’s jacket yet.')); return; }
    wrap.appendChild(el('h3', 'pf-sub', 'Sewn on'));
    var ul = el('ul', 'cb-patchlist');
    LP.list.forEach(function (p) {
      if (ids.indexOf(p.id) < 0) return;
      var li = el('li', 'cb-patchlist__one');
      var one = LP.draw(p.id, { cls: 'cb-patchlist__art', label: true });
      if (one) li.appendChild(one);
      li.appendChild(el('span', 'cb-patchlist__name', p.name));
      var from = el('span', 'cb-patchlist__from', 'From ');
      from.appendChild(link('/' + p.page + '#patch-' + p.id, p.room));
      li.appendChild(from);
      ul.appendChild(li);
    });
    wrap.appendChild(ul);
  }

  function chimerasInto(panel, list, whose) {
    if (!list.length) { panel.appendChild(el('p', null, whose + ' has no chimeras yet.')); return; }
    var LC = window.loveChimera;
    var ul = el('ul', 'cb-avatars__list cb-peek__chimeras');
    list.forEach(function (c) {
      var li = el('li', 'cb-avatar');
      var wrap = el('span', 'cb-avatar__art');
      wrap.setAttribute('aria-hidden', 'true');
      var art = LC.draw(c.parts, { ground: true });
      if (art) wrap.appendChild(art);
      li.appendChild(wrap);
      var w = el('div', 'cb-avatar__words');
      w.appendChild(el('p', 'cb-pet__name', c.name || LC.suggest(c.parts)));
      w.appendChild(el('p', 'cb-pet__about', LC.words(c.parts)));
      (c.sayings || []).forEach(function (t) {
        if (typeof t === 'string' && t) w.appendChild(el('p', 'cb-pet__about cb-ch-says', '“' + t + '”'));
      });
      li.appendChild(w);
      ul.appendChild(li);
    });
    panel.appendChild(ul);
  }

  // A crystal pouch or a herb basket: the drawing, then each by name, linked
  // to its card, in its own room's order and with nothing counted.
  function pouchInto(panel, LX, ids, art, heading, cardWords) {
    if (!ids.length) { panel.appendChild(el('p', null, heading + ': nothing yet.')); return; }
    var wrap = el('div', 'cb-pouch');
    var drawn = LX[art](ids, { cls: 'cb-jacket__art' });
    if (drawn) wrap.appendChild(drawn);
    wrap.appendChild(el('h3', 'pf-sub', heading));
    var ul = el('ul', 'cb-patchlist');
    LX.list.forEach(function (c) {
      if (ids.indexOf(c.id) < 0) return;
      var li = el('li', 'cb-patchlist__one');
      var one = LX.draw(c.id, { cls: 'cb-patchlist__art' });
      if (one) li.appendChild(one);
      li.appendChild(el('span', 'cb-patchlist__name', c.name));
      var from = el('span', 'cb-patchlist__from', '');
      from.appendChild(link(c.href, cardWords));
      li.appendChild(from);
      ul.appendChild(li);
    });
    wrap.appendChild(ul);
    panel.appendChild(wrap);
  }

  /* ── What is drawn ────────────────────────────────────────────────────── */

  var said = el('p', 'cb-said pp-said');
  said.setAttribute('role', 'status');
  function say(t) { said.textContent = t || ''; }

  function signOnWords(p) {
    return words(p, ['Joining the CB takes an invite: ',
      link('/community-center.html#getting-started', 'the Community Center'), ' says how to ask for one. Already on? Sign on at ',
      link('/community-center.html#cb-signon-desk', 'the front desk'), ' and come back.']);
  }

  // The page with nobody named: what it is, and, signed on, your own link.
  function nobodyNamed() {
    view.textContent = '';
    var s = cbState();
    view.appendChild(el('h2', 'pp-h', 'A profile on the CB'));
    view.appendChild(el('p', null, 'Every username on the CB has a page of its own here, at an address ending in # and the username. Its owner chooses who may open it: only themselves, the community signed on to the CB, or anybody with the link.'));
    if (s && s.handle && !/^cb1\./.test(s.pass)) {
      var p = words(el('p'), ['Your own is ', link('#' + encodeURIComponent(s.handle), addressOf(s.handle)), '.']);
      view.appendChild(p);
    } else view.appendChild(signOnWords(el('p')));
  }

  function shareRow(handle, b) {
    var row = el('div', 'pp-share');
    var addr = addressOf(handle);
    var p = el('p', 'pp-share__where');
    if (b.mine) {
      var reach = b.profile ? b.profile.reach || '' : '';
      p.textContent = reach === 'public'
        ? 'Your card is open to the public: anybody with this link can read it, signed on or not.'
        : reach === 'private'
          ? 'Your card is private: only you can read it, here or on the radio. The tabs you show still show.'
          : 'Your card is for the community: anybody signed on to the CB can read it with this link, and nobody else.';
    } else p.textContent = 'The link to ' + handle + '’s profile.';
    row.appendChild(p);
    var line = el('p', 'pp-share__line');
    var a = el('a', 'pp-share__addr', addr);
    a.href = addr;
    line.appendChild(a);
    var copy = el('button', 'cb-btn', 'Copy the link');
    copy.type = 'button';
    copy.addEventListener('click', function () {
      var done = function () { say('Copied the link to ' + (b.mine ? 'your' : handle + '’s') + ' profile.'); };
      try {
        navigator.clipboard.writeText(addr).then(done, function () { say('The link could not be copied here. It is the address above.'); });
      } catch (e) { say('The link could not be copied here. It is the address above.'); }
    });
    line.appendChild(copy);
    row.appendChild(line);
    if (b.mine) {
      var change = el('p', 'cb-hint');
      change.textContent = 'Who may open it is chosen on your card: Edit my profile card, under Profile on the radio.';
      row.appendChild(change);
      if (window.loveRadioEditCard) {
        var edit = el('button', 'cb-btn', 'Edit my profile card');
        edit.type = 'button';
        edit.setAttribute('aria-haspopup', 'dialog');
        edit.addEventListener('click', function () { if (window.loveRadioEditCard) window.loveRadioEditCard(edit); });
        row.appendChild(edit);
      }
    }
    return row;
  }

  // Signed on and somebody else's: their props and a message are the radio's.
  function communityRow(handle, mark) {
    var row = el('div', 'cb-acct__row pp-community');
    var props = el('button', 'cb-btn', 'Props for ' + handle);
    props.type = 'button';
    props.setAttribute('aria-haspopup', 'dialog');
    props.addEventListener('click', function () {
      if (window.loveRadioPeek) { say(''); window.loveRadioPeek(handle, props, mark, 'props'); }
      else say('Props are on the radio. Bring the radio back to this page to read them.');
    });
    var msg = el('button', 'cb-btn', 'Message ' + handle);
    msg.type = 'button';
    msg.addEventListener('click', function () {
      if (window.loveRadioMessage && window.loveRadioMessage(handle)) say('');
      else say('Messages are on the radio. Bring the radio back to this page to write to ' + handle + '.');
    });
    row.appendChild(props);
    row.appendChild(msg);
    return row;
  }

  function draw(b, byTag) {
    var LP = window.loveProfile, whose = b.handle, mark = b.signedOn ? { base: !!b.base, claimed: !b.base } : null;
    document.title = whose + ' — Stimpunks.World';
    view.textContent = '';
    var p = b.profile;
    glitterNote = null;
    if (p && (p.effect || p.frame || p.banner || p.decoration || p.plate || p.theme)) {
      glitterNote = el('p', 'pp-glitter');
      glitterNote.appendChild(document.createTextNode('For fun animations, turn on MAX GLITTER below, or press Let it move on the card. '));
      var toDial = el('button', 'cb-btn', 'Take me to the dial');
      toDial.type = 'button';
      toDial.addEventListener('click', function () {
        var max = document.querySelector('.dial__btn[data-level="max"]');
        if (!max) return;
        max.scrollIntoView({ block: 'center' });
        max.focus();
      });
      glitterNote.appendChild(toDial);
      view.appendChild(glitterNote);
    }
    var stage = el('div', 'pf-stage');
    var sheet = el('div', 'pf-sheet pp-sheet');
    var left = el('div', 'pf-left');
    var right = el('div', 'pf-right');
    sheet.appendChild(left);
    sheet.appendChild(right);
    stage.appendChild(sheet);
    view.appendChild(stage);
    LP.surround(stage, p);
    var card = LP.card(p || {}, {
      handle: whose, mark: mark, mine: !!b.mine, wearing: b.wearing, nameId: 'pp-name',
      md: function (into) { if (b.bio && window.loveMarkdown) window.loveMarkdown.blocks(b.bio, into, { top: 3, prefix: 'pp' }); },
      links: cardLink,
      room: function (tag) { return byTag[tag] || null; },
      onAvatar: function (btn) { avatarLarger({ look: b.wearing.look, about: b.wearing.about, worn: true }, btn, whose); },
    });
    // The name is the page's heading.
    card.pfName.removeAttribute('tabindex');
    left.appendChild(card);
    LP.drawCard(card, p);
    var body = card.querySelector('.pf-body');
    // The nameplate, which the radio shows under their name on Who's online.
    if (p && p.plate) {
      var plate = el('div', 'pf-plate pp-plate');
      plate.setAttribute('aria-hidden', 'true');
      var after = card.querySelector('.pf-tagline') || card.querySelector('.pf-line') || card.pfName;
      after.parentNode.insertBefore(plate, after.nextSibling);
      LP.drawing(plate, p.plate);
    }
    if (p && (p.effect || p.frame || p.banner || p.decoration || p.plate || p.theme)) {
      var moveRow = el('p', 'pp-move');
      moveBtn = el('button', 'cb-btn', 'Let it move');
      moveBtn.type = 'button';
      moveBtn.setAttribute('aria-describedby', 'pp-move-hint');
      moveBtn.addEventListener('click', function () { letMove = !letMove; dressNow(); });
      var moveHint = el('span', 'cb-hint pp-move__hint', ' Shows this card\u2019s animations at any setting, for this visit. Nothing in it flashes. At MAX GLITTER it moves by itself.');
      moveHint.id = 'pp-move-hint';
      moveRow.appendChild(moveBtn);
      moveRow.appendChild(moveHint);
      body.appendChild(moveRow);
    } else moveBtn = null;
    dressNow();
    if (b['private']) body.appendChild(el('p', 'cb-quiet pf-empty', whose + ' keeps their card private.'));
    else if (!p) body.appendChild(el('p', 'cb-quiet pf-empty', b.mine ? 'Your card has nothing on it yet. Edit my profile card, under Profile on the radio, is where you fill it in.' : whose + ' has nothing on their card.'));
    if (b.signedOn && !b.mine) body.appendChild(communityRow(whose, mark));

    // Only the tabs they show, and none at all when they show none.
    var tabs = [];
    var avs = b.avatars || (b.wearing ? [{ look: b.wearing.look, about: b.wearing.about, name: '', worn: true }] : []);
    if (avs.length) tabs.push(['Avatars', function (pn) { avatarsInto(pn, avs, whose); }]);
    if (b.pets && b.pets.length) tabs.push(['Pets', function (pn) { need('/animals.js', function () { return !!window.loveAnimals; }).then(function () { petsInto(pn, b.pets); }); }]);
    if (b.jobs || (b.pets && b.pets.length)) {
      tabs.push(['Badges and jobs', function (pn) {
        getJSON('/guild-jobs.json').then(function (g) {
          if (g && Array.isArray(g.jobs) && Array.isArray(g.badges)) badgesInto(pn, g, b.jobs, !!(b.pets && b.pets.length), whose);
          else pn.appendChild(el('p', null, 'The badges could not be fetched just now.'));
        });
      }]);
    }
    if (b.patches) tabs.push(['Battle jacket', function (pn) { need('/patches.js', function () { return !!window.lovePatches; }, 'data-cb-patches').then(function () { jacketInto(pn, b.patches, whose); }); }]);
    if (b.chimeras) tabs.push(['Chimeras', function (pn) { need('/chimera.js', function () { return !!window.loveChimera; }, 'data-cb-chimera').then(function () { chimerasInto(pn, b.chimeras, whose); }); }]);
    if (b.crystals) tabs.push(['Crystals', function (pn) { need('/crystal-pouch.js', function () { return !!window.loveCrystals; }, 'data-cb-crystals').then(function () { pouchInto(pn, window.loveCrystals, b.crystals, 'pouch', 'In ' + whose + '’s pouch', 'Its card on the Crystal Wheel'); }); }]);
    if (b.herbs) tabs.push(['Herbs', function (pn) { need('/herb-basket.js', function () { return !!window.loveHerbs; }, 'data-cb-herbs').then(function () { pouchInto(pn, window.loveHerbs, b.herbs, 'basket', 'In ' + whose + '’s basket', 'Its card in the Herbery'); }); }]);
    if (tabs.length) {
      var panels = tabsInto(right, whose + '’s ' + tabs.map(function (t) { return t[0].toLowerCase(); }).join(', '), tabs.map(function (t) { return t[0]; }));
      tabs.forEach(function (t, i) { t[1](panels[i]); });
    } else {
      right.appendChild(el('p', 'cb-quiet', b.mine
        ? 'You are not showing anything beside your card. Profile, on the radio, is where you switch on your avatars, pets, jobs, jacket, chimeras, crystals and herbs.'
        : whose + ' is not showing anything beside their card.'));
    }
    if (b.mine) right.appendChild(el('p', 'cb-hint pp-note', 'This is your profile as anybody who may open it sees it on this page. Props, your chat status and messages are only ever on the radio.'));
    view.appendChild(shareRow(whose, b));
    view.appendChild(said);
  }

  function closed(handle, signedOn) {
    document.title = 'A profile — Stimpunks.World';
    view.textContent = '';
    view.appendChild(el('h2', 'pp-h', handle));
    if (signedOn) {
      view.appendChild(el('p', null, 'Nobody on the CB goes by that name, or their username has gone.'));
      return;
    }
    view.appendChild(el('p', null, 'This profile is not open to the public. Its owner may keep it for the community, which means signing on to the CB to read it, or there may be nobody on the CB by that name.'));
    view.appendChild(signOnWords(el('p')));
  }

  function load() {
    var handle = wanted();
    if (!handle) { document.title = 'A profile — Stimpunks.World'; nobodyNamed(); return; }
    view.textContent = '';
    view.appendChild(el('p', null, 'Opening ' + handle + '’s profile…'));
    Promise.all([ask(handle), cardReady, rooms]).then(function (rs) {
      if (handle !== wanted()) return;
      var r = rs[0];
      if (r.status === 200 && r.body.open) { draw(r.body, rs[2]); return; }
      if (r.status === 200) { closed(handle, !!r.body.signedOn); return; }
      view.textContent = '';
      var again = el('button', 'cb-btn', 'Try again');
      again.type = 'button';
      again.addEventListener('click', load);
      view.appendChild(el('p', null, r.status === 429 ? 'Too many tries from here in a minute. Wait a moment and try again.'
        : (r.body && typeof r.body.error === 'string') ? r.body.error : 'That profile could not be read just now.'));
      view.appendChild(again);
    });
  }
  window.addEventListener('hashchange', load);
  // Your own card saved, from this page or anywhere the radio is: draw it again.
  document.addEventListener('love-profile-saved', function () { if (wanted()) load(); });
  load();
})();

/* =============================================================================
   The guest CB: the radio's bar for everybody who is not signed on.

   Ryan's brief, 2026-09-30: a guest CB on every page for visitors who are not
   signed on, with the teleporter and the way onto the CB, so that it helps
   bring people into the community and reminds a member who signed off where
   to turn their radio back on.

   IT IS NOT THE RADIO AND IT IS NOT cb.js. "Nobody who has not signed on ever
   downloads cb.js" still holds: love.js loads this file instead, and only
   where the radio would have come (not in a frame, not on a page that says
   data-cb="off" or "here"). It knows nothing about the channel and sends
   nothing to it: no count of who is on, no hint of what is being said, because
   a guest bar that showed the channel would be a window into it for people who
   are not on it.

   FOLDED UNTIL PRESSED (Ryan's call): a visitor arriving in a room meets the
   room, and a bar in the corner, not a panel over the room. The only thing it
   keeps is that somebody left it open, under love-cb-guest in their own
   browser, never sent; folding it takes the key away again. The teleporter's
   list of rooms is fetched from this site when somebody opens it, and not
   before, the radio's rule.

   IT WEARS THE RADIO'S CLOTHES, in its own shadow root with cb.css, the dial's
   precedent: one piece of furniture, the same in every room. The teleporter
   here is a copy of the radio's, because the radio's is in cb.js; keep the two
   behaving alike (what they offer is roomsFor's match, in walking order).
   Nothing on it moves or lights up at any setting.
   ============================================================================= */
(function () {
  'use strict';

  var KEY = 'love-cb-guest';
  var ROOMPATH = /^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\.html)?$/;
  var rooms = null, asked = false;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function link(href, text) { var a = el('a', null, text); a.href = href; return a; }
  function wasOpen() { try { return localStorage.getItem(KEY) === 'open'; } catch (e) { return false; } }
  function keep(open) {
    try { if (open) localStorage.setItem(KEY, 'open'); else localStorage.removeItem(KEY); } catch (e) { /* private window */ }
  }
  function herePath() {
    var p = location.pathname.replace(/\/index(?:\.html)?$/, '/');
    return p === '/' ? '/' : p.replace(/\.html$/, '') + '.html';
  }
  // The radio's own match: tag or any word of the name, from its start, in walking order.
  function roomsFor(q) {
    var out = [], flat = q.replace(/-/g, '');
    for (var i = 0; i < rooms.length; i++) {
      var r = rooms[i], words = r.name.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
      var hit = r.tag.indexOf(q) === 0 || words.join('').indexOf(flat) === 0;
      for (var w = 0; !hit && w < words.length; w++) hit = words[w].indexOf(flat) === 0;
      if (hit) out.push(r);
    }
    return out;
  }

  function build() {
    var host = el('div', 'cb-host');
    var root = host.attachShadow({ mode: 'open' });
    var sheet = document.createElement('link');
    sheet.rel = 'stylesheet';
    sheet.href = '/cb.css';
    host.style.visibility = 'hidden';
    function shown() { host.style.visibility = ''; }
    sheet.addEventListener('load', shown);
    sheet.addEventListener('error', shown);
    root.appendChild(sheet);

    var box = el('section', 'cb-radio cb-guest');
    box.setAttribute('aria-label', 'CB radio, not signed on');
    box.style.right = '8px';
    box.style.bottom = '8px';

    var bar = el('div', 'cb-bar');
    var name = el('p', 'cb-name');
    name.appendChild(el('span', 'cb-brand', 'CB'));
    var tp = el('button', 'cb-tp', 'Teleport');
    tp.type = 'button';
    tp.setAttribute('aria-expanded', 'false');
    tp.setAttribute('aria-controls', 'cb-guest-tp');
    name.appendChild(tp);
    bar.appendChild(name);
    var on = el('button', 'cb-btn cb-guest-on', 'Get on the CB');
    on.type = 'button';
    on.setAttribute('aria-controls', 'cb-guest-set');
    bar.appendChild(on);
    box.appendChild(bar);

    /* The teleporter, the radio's: type to narrow, arrows to move, Enter to
       go, Escape to put it away. Going is ordinary navigation and tells
       nobody where you went. */
    var tpp = el('div', 'cb-tp-panel');
    tpp.id = 'cb-guest-tp';
    tpp.hidden = true;
    var lab = el('label', 'cb-lab', 'Teleport to a room');
    lab.htmlFor = 'cb-guest-find';
    var find = el('input', 'cb-say cb-tp-find');
    find.id = 'cb-guest-find';
    find.type = 'text';
    find.autocomplete = 'off';
    find.spellcheck = false;
    find.setAttribute('role', 'combobox');
    find.setAttribute('aria-autocomplete', 'list');
    find.setAttribute('aria-controls', 'cb-guest-list');
    find.setAttribute('aria-expanded', 'true');
    var list = el('ul', 'cb-pick cb-tp-list');
    list.id = 'cb-guest-list';
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-label', 'Rooms on the street');
    var none = el('p', 'cb-quiet');
    none.hidden = true;
    tpp.appendChild(lab);
    tpp.appendChild(find);
    tpp.appendChild(list);
    tpp.appendChild(none);
    box.appendChild(tpp);

    /* GETTING ON THE CB: what it is, where the password comes from, and where
       a member who signed off turns it back on. Every link is a place on this
       street that already says more. */
    var set = el('div', 'cb-set cb-guest-set');
    set.id = 'cb-guest-set';
    var p1 = el('p', null, 'The CB is the street’s radio. Signed on, you can talk on World and in every room, share a picture, see who else is here, join a room’s call and watch a film together. It keeps nothing past midnight.');
    var p2 = el('p');
    p2.appendChild(document.createTextNode('It takes a handle of your choosing and the community password, which is shared inside our community: ask for it in '));
    p2.appendChild(link('/community-center.html#meeting-hall', 'the meeting hall'));
    p2.appendChild(document.createTextNode(', our group chat on Stoat, which the Community Center says how to join. Then sign on here, or at '));
    p2.appendChild(link('/community-center.html#cb-signon-desk', 'the front desk'));
    p2.appendChild(document.createTextNode(', where the house norms are.'));
    var p3 = el('p');
    p3.appendChild(el('b', null, 'Signed on before? '));
    p3.appendChild(document.createTextNode('Signing off, or a new browser, takes the radio away. Sign on again here and it is back on every page.'));

    /* SIGN ON FROM HERE, for somebody who already knows the password (Ryan,
       2026-09-30). The front desk's own form, sending exactly what the desk
       sends, to the same /cb/signon, only when pressed; what comes back is kept
       in love-cb the way the desk keeps it, and then love.js brings the radio,
       with every rule it applies to a page. The moderators' password works
       here too, because the server decides which one it is. */
    var form = el('form', 'cb-tx cb-guest-signon');
    form.setAttribute('aria-label', 'Sign on to the CB');
    var hl = el('label', 'cb-lab', 'Your handle');
    hl.htmlFor = 'cb-guest-handle';
    var handle = el('input', 'cb-say cb-guest-in');
    handle.id = 'cb-guest-handle';
    handle.name = 'handle';
    handle.type = 'text';
    handle.maxLength = 24;
    handle.required = true;
    handle.autocomplete = 'nickname';
    handle.spellcheck = false;
    var pl = el('label', 'cb-lab', 'The community password');
    pl.htmlFor = 'cb-guest-password';
    var password = el('input', 'cb-say cb-guest-in');
    password.id = 'cb-guest-password';
    password.name = 'password';
    password.type = 'password';
    password.required = true;
    password.autocomplete = 'current-password';
    var go = el('button', 'cb-btn', 'Sign on');
    go.type = 'submit';
    var row = el('div', 'cb-row cb-send-row');
    row.appendChild(go);
    var said = el('p', 'cb-said');
    said.setAttribute('role', 'status');
    form.appendChild(hl); form.appendChild(handle);
    form.appendChild(pl); form.appendChild(password);
    form.appendChild(row); form.appendChild(said);
    var p4 = el('p', 'cb-norms');
    p4.appendChild(link('/community-center.html#cb-norms', 'The house norms'));
    p4.appendChild(document.createTextNode(' and '));
    p4.appendChild(link('/privacy.html#cb', 'what the CB keeps'));
    p4.appendChild(document.createTextNode('. Until you sign on, this bar sends nothing and knows nothing about the channel.'));

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      said.textContent = 'Checking\u2026';
      go.disabled = true;
      fetch('/cb/signon', {
        method: 'POST', credentials: 'omit', cache: 'no-store',
        headers: { 'accept': 'application/json', 'content-type': 'application/json' },
        body: JSON.stringify({ handle: handle.value, password: password.value }),
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (b) { return { status: r.status, body: b }; });
      }).then(function (r) {
        go.disabled = false;
        if (r.status === 200 && r.body.pass) {
          password.value = '';
          try {
            localStorage.setItem('love-cb', JSON.stringify({ handle: r.body.handle, pass: r.body.pass, base: !!r.body.base, roles: r.body.roles || [], folded: false, aloud: true }));
          } catch (x) { said.textContent = 'This browser will not keep the pass, so the radio cannot stay on. A private window does that.'; return; }
          keep(false);
          host.remove();
          if (window.loveRadio) window.loveRadio();
          return;
        }
        if (r.status === 429) { said.textContent = 'Too many tries from here in a minute. Wait a moment and try again.'; return; }
        if (r.body && typeof r.body.error === 'string' && r.body.error) { said.textContent = r.body.error; return; }
        said.textContent = r.status === 404 || r.status === 405
          ? 'The CB is not running on this server. It only answers on stimpunks.world itself.'
          : 'That did not work. Try again.';
      }).catch(function () {
        go.disabled = false;
        said.textContent = 'No signal: the CB could not be reached.';
      });
    });
    set.appendChild(p1); set.appendChild(p2); set.appendChild(p3); set.appendChild(form); set.appendChild(p4);
    box.appendChild(set);

    root.appendChild(box);
    document.body.appendChild(host);

    function setOpen(open, quiet) {
      set.hidden = !open;
      box.classList.toggle('cb-radio--folded', !open && tpp.hidden);
      on.setAttribute('aria-expanded', String(open));
      on.textContent = open ? 'Fold away' : 'Get on the CB';
      if (!quiet) keep(open);
    }

    var offer = [], active = -1;
    function mark(n) {
      var lis = list.children;
      for (var i = 0; i < lis.length; i++) lis[i].setAttribute('aria-selected', String(i === n));
      if (!lis[n]) { find.removeAttribute('aria-activedescendant'); return; }
      find.setAttribute('aria-activedescendant', lis[n].id);
      var li = lis[n];
      if (li.offsetTop < list.scrollTop) list.scrollTop = li.offsetTop;
      else if (li.offsetTop + li.offsetHeight > list.scrollTop + list.clientHeight)
        list.scrollTop = li.offsetTop + li.offsetHeight - list.clientHeight;
    }
    function go(room) { if (!room) return; setTp(false); location.href = room.path; }
    function render(failed) {
      list.textContent = '';
      if (!rooms || failed || !rooms.length) {
        offer = [];
        none.textContent = rooms && !failed ? 'No rooms to go to.' : (failed ? 'The list of rooms cannot be reached just now.' : 'Finding the rooms…');
        none.hidden = false; list.hidden = true; mark(-1);
        return;
      }
      var q = find.value.toLowerCase().trim().replace(/^#/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      var here = herePath();
      offer = roomsFor(q);
      for (var i = 0; i < offer.length; i++) {
        var li = el('li', 'cb-opt');
        li.id = 'cb-guest-tp-' + offer[i].tag;
        li.setAttribute('role', 'option');
        li.appendChild(el('span', 'cb-opt__name', offer[i].name));
        li.appendChild(el('span', 'cb-opt__tag', offer[i].path === here ? 'you are here' : '#' + offer[i].tag));
        li.addEventListener('mousedown', function (e) { e.preventDefault(); });
        (function (room) { li.addEventListener('click', function () { go(room); }); })(offer[i]);
        list.appendChild(li);
      }
      none.textContent = 'No room by that name.';
      none.hidden = offer.length > 0;
      list.hidden = offer.length === 0;
      active = offer.length ? 0 : -1;
      mark(active);
    }
    function loadRooms() {
      if (asked) return;
      asked = true;
      fetch('/cb-rooms.json', { credentials: 'omit', headers: { 'accept': 'application/json' } })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) {
          var ok = [];
          ((d && d.rooms) || []).forEach(function (r) {
            if (r && typeof r.tag === 'string' && typeof r.name === 'string' && typeof r.path === 'string' && ROOMPATH.test(r.path)) ok.push(r);
          });
          rooms = ok;
          if (!tpp.hidden) render(!d);
        })
        .catch(function () { rooms = rooms || []; if (!tpp.hidden) render(true); });
    }
    function setTp(open) {
      tpp.hidden = !open;
      tp.setAttribute('aria-expanded', String(open));
      box.classList.toggle('cb-radio--folded', !open && set.hidden);
      if (open) { find.value = ''; loadRooms(); render(); find.focus(); }
      else { list.textContent = ''; offer = []; active = -1; }
    }

    tp.addEventListener('click', function () { setTp(tpp.hidden); });
    on.addEventListener('click', function () { setOpen(set.hidden); });
    find.addEventListener('input', function () { render(); });
    find.addEventListener('keydown', function (e) {
      if (e.isComposing) return;
      var n = offer.length;
      if (e.key === 'Escape') { e.preventDefault(); setTp(false); tp.focus(); return; }
      if (!n) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % n; mark(active); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + n) % n; mark(active); }
      else if (e.key === 'Enter') { e.preventDefault(); go(offer[active]); }
    });
    setOpen(wasOpen(), true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();

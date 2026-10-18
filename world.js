/* =============================================================================
   The World room's directory, live. Ryan's brief, 2026-10-18.

   THE LIST IS THE PAGE'S OWN, written by tools/make-world.py, so it reads with
   no script and for anybody. This adds, for somebody signed on to the CB, who is
   in each room, whether its call has somebody in it, and when it was last busy
   in the last 48 hours, out of /cb/world, which answers by Who's online's rules; and it shows,
   filters and orders the list in the reader's own browser.

   NOTHING HERE PUTS A NUMBER BESIDE ANYTHING. Most active is the order the
   server sends (busiest), worked out from how many people are seen in each
   room and in its call, and the numbers never reach this page: it is the one
   place on the street that counts people, Ryan's call, and privacy.html#world
   says so. Names, never numbers, everywhere else.

   IT ASKS WHILE THE PAGE IS IN FRONT, every half minute and on coming back to
   it, and never in a tab behind others: the radio's own rule. It keeps the
   reader's filter and order in love-world, reads love-cb for the pass, and
   never writes it. tools/make-world.py holds all of this.
   ============================================================================= */
(function () {
  'use strict';

  var dir = document.querySelector('[data-world-dir]');
  var flat = document.querySelector('[data-world-flat]');
  var tools = document.querySelector('[data-world-tools]');
  var status = document.querySelector('[data-world-status]');
  if (!dir || !flat || !tools || !status) return;

  var KEEP = 'love-world';
  var EVERY = 30000;
  var rows = Array.prototype.slice.call(dir.querySelectorAll('.www-room'));
  var shows = Array.prototype.slice.call(tools.querySelectorAll('input[name="www-show"]'));
  var sortSel = document.getElementById('www-sort');

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function pass() {
    try { var v = JSON.parse(localStorage.getItem('love-cb') || 'null'); return v && v.pass ? v.pass : null; }
    catch (e) { return null; }
  }
  function mine() {
    try { var v = JSON.parse(localStorage.getItem(KEEP) || 'null'); return v && typeof v === 'object' ? v : {}; }
    catch (e) { return {}; }
  }
  function keep(v) { try { localStorage.setItem(KEEP, JSON.stringify(v)); } catch (e) { /* a private window keeps nothing */ } }
  function clock(t) {
    try { return new Date(t).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }); }
    catch (e) { return ''; }
  }
  /* A channel keeps 48 hours (Ryan, 2026-10-18), so a room's last busy time
     can be yesterday or the day before, said in the reader's own day. */
  function lastBusy(t) {
    var d = new Date(t), now = new Date();
    var start = function (x) { return new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime(); };
    var n = Math.round((start(now) - start(d)) / 86400000);
    if (n <= 0) return clock(t) + ' today';
    if (n === 1) return clock(t) + ' yesterday';
    try { return clock(t) + ' on ' + d.toLocaleDateString(undefined, { weekday: 'long' }); }
    catch (e) { return clock(t); }
  }

  var live = null, busiest = [], heard = true, asOf = null, timer = null;

  /* ── What the reader chose ───────────────────────────────────────────── */
  var chose = mine();
  if (chose.show) shows.forEach(function (r) { r.checked = r.value === chose.show; });
  if (chose.sort && sortSel.querySelector('option[value="' + chose.sort + '"]')) sortSel.value = chose.sort;
  function showing() { var r = shows.filter(function (x) { return x.checked; })[0]; return r ? r.value : 'all'; }
  function remember() { keep({ show: showing(), sort: sortSel.value }); }
  shows.forEach(function (r) { r.addEventListener('change', function () { remember(); draw(); }); });
  sortSel.addEventListener('change', function () { remember(); draw(); });

  /* ── Each room's line ────────────────────────────────────────────────── */
  function liveOf(li) { return live && live[li.dataset.room] || null; }
  function active(r) { return !!(r && ((r.people && r.people.length) || r.call)); }

  function fill(li) {
    var r = liveOf(li), box = li.querySelector('[data-live]');
    box.textContent = '';
    var on = active(r);
    li.classList.toggle('www-room--active', on);
    if (!r) { box.hidden = true; return; }
    box.hidden = false;
    if (r.people && r.people.length) {
      var here = el('span', 'www-here');
      here.appendChild(el('span', 'www-here__lab', 'Here now: '));
      r.people.forEach(function (p, i) {
        if (i) here.appendChild(document.createTextNode(', '));
        here.appendChild(el('b', null, p.handle));
        if (p.base) here.appendChild(el('span', 'www-mark', 'BASE'));
        else if (p.claimed) here.appendChild(el('span', 'www-mark www-mark--claimed', 'CLAIMED'));
      });
      box.appendChild(here);
    }
    if (r.call) box.appendChild(el('span', 'www-call', 'Call going'));
    if (!on && r.last) box.appendChild(el('span', 'www-when', 'last busy at ' + lastBusy(r.last)));
  }

  /* ── Showing and ordering ────────────────────────────────────────────── */
  function fits(li) {
    var s = showing();
    if (s === 'all' || !live) return true;
    return s === 'active' ? active(liveOf(li)) : !active(liveOf(li));
  }
  function byStreet(a, b) { return Number(a.dataset.order) - Number(b.dataset.order); }
  function byLatest(a, b) {
    var x = (liveOf(a) || {}).last || 0, y = (liveOf(b) || {}).last || 0;
    return y - x || byStreet(a, b);
  }
  function byBusiest(a, b) {
    var x = busiest.indexOf(a.dataset.room), y = busiest.indexOf(b.dataset.room);
    if (x < 0) x = Infinity;
    if (y < 0) y = Infinity;
    return (x === y ? 0 : x < y ? -1 : 1) || byLatest(a, b);
  }

  function draw() {
    rows.forEach(fill);
    var sort = live ? sortSel.value : 'street';
    var shown = rows.filter(fits);
    if (sort === 'street') {
      flat.hidden = true;
      flat.textContent = '';
      dir.hidden = false;
      rows.forEach(function (li) { li.hidden = shown.indexOf(li) < 0; });
      Array.prototype.forEach.call(dir.querySelectorAll('.www-cat'), function (sec) {
        sec.hidden = !sec.querySelector('.www-room:not([hidden])');
      });
    } else {
      // One list across the whole street, in the chosen order, made of copies
      // of the directory's own lines, so nothing here is typed twice.
      dir.hidden = true;
      flat.hidden = false;
      flat.textContent = '';
      flat.appendChild(el('h2', 'www-cat__h', sort === 'busiest' ? 'Every room, the most active first' : 'Every room, the latest busy first'));
      var ul = el('ul', 'www-list');
      shown.slice().sort(sort === 'busiest' ? byBusiest : byLatest).forEach(function (li) {
        var c = li.cloneNode(true);
        c.hidden = false;
        ul.appendChild(c);
      });
      flat.appendChild(ul);
    }
    say(shown.length === 0);
  }

  function say(none) {
    status.textContent = '';
    if (!live) return;
    var line = 'Live, as of ' + clock(asOf) + ', and asked again every half minute while this page is in front.';
    if (!heard) line += ' Calls are not being reported to us just now, so no room shows a call.';
    if (none) line += showing() === 'active' ? ' Nobody is seen in any room just now, and no call is going.' : ' Every room has somebody in it just now.';
    status.textContent = line;
  }

  /* ── Asking ──────────────────────────────────────────────────────────── */
  function ask() {
    var p = pass();
    if (!p || document.visibilityState !== 'visible') return;
    fetch('/cb/world', { headers: { accept: 'application/json', authorization: 'Bearer ' + p }, credentials: 'omit', cache: 'no-store' })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (b) { return { status: r.status, body: b || {} }; }); })
      .then(function (r) {
        if (r.status === 401) { live = null; tools.hidden = true; status.textContent = 'Your pass for the CB has stopped working, which happens when a password changes. Sign on again from the radio in the corner, and this list says which rooms are active.'; draw(); return; }
        if (r.status !== 200) { if (!live) status.textContent = r.status === 404 ? 'Who is where only answers on stimpunks.world itself.' : 'Who is where could not be asked just now. The list is all here.'; return; }
        live = {};
        (r.body.rooms || []).forEach(function (x) { live[x.tag] = x; });
        busiest = r.body.busiest || [];
        heard = r.body.callHeard !== false;
        asOf = r.body.now || Date.now();
        tools.hidden = false;
        draw();
      }, function () { if (!live) status.textContent = 'No signal. Who is where could not be asked just now; the list is all here.'; });
  }
  function every() {
    clearInterval(timer);
    timer = null;
    if (pass() && document.visibilityState === 'visible') timer = setInterval(ask, EVERY);
  }
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') ask(); every(); });

  if (pass()) {
    status.textContent = 'Asking who is where…';
    ask();
    every();
  }
})();

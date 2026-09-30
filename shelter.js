/* =============================================================================
   A shelter, Rescue A Cat's or Rescue A Dog's: what is out there, the rescue,
   the shelter, adopting, the ones you rescued, and everybody ever adopted.
   Ryan's briefs, 2026-09-30. The page says which kind it is and which room's
   clothes to wear (data-shelter and data-prefix on <main>); the drawings are
   animals.js's, and the words that describe each animal come from the server
   with it, so the drawing and the words cannot disagree.

   NOTHING HERE KNOWS WHEN THE NEXT ANIMAL IS DUE, so the page looks when it
   opens and when the tab comes back to the front, and does not poll. Rescuing
   and adopting send the CB pass the radio keeps in love-cb, which this file
   reads and never writes.

   THE ANIMALS YOU RESCUED ARE KEPT IN YOUR BROWSER, under love-rescues, so you
   can find them again; the shelter never knows which were yours. Forget the
   ones I rescued clears it. An older love-cats list is folded into it and
   removed. That is the only thing this file stores; privacy.html lists it.
   Your ADOPTED animals are kept on the server, under a scrambled form of your
   handle, and they are the radio's Pets tray, where Forget Me is.

   Every name goes in with textContent. Nothing is rarer and nothing moves.
   ============================================================================= */
(function () {
  'use strict';

  var room = document.querySelector('main[data-shelter]');
  var outState = document.getElementById('shelter-out-state');
  var list = document.getElementById('shelter-list');
  var listState = document.getElementById('shelter-list-state');
  if (!room || !outState || !list || !listState || !window.loveAnimals) return;
  var KIND = room.getAttribute('data-shelter');
  var P = room.getAttribute('data-prefix');
  var KEY = 'love-rescues';
  var A = window.loveAnimals;

  var SAY = {
    cat: { looking: 'Shining the torch about…', none: 'No cat out there right now. Cats turn up at random, so look in again later.',
           there: 'There is a cat ', unreached: 'The street could not be searched just now.', it: 'cat', full: 'The shelter is full, so this one waits outside until somebody adopts.' },
    dog: { looking: 'Following the tracks…', none: 'No dog out there right now. Dogs turn up at random, so look in again later.',
           there: 'There is a dog ', unreached: 'The park could not be searched just now.', it: 'dog', full: 'The kennels are full, so this one waits outside until somebody adopts.' },
  }[KIND];
  if (!SAY) return;

  function pass() {
    try { var v = JSON.parse(localStorage.getItem('love-cb') || 'null'); return v && v.pass ? v : null; }
    catch (e) { return null; }
  }

  function call(path, send, p) {
    var headers = { 'accept': 'application/json' };
    if (send) headers['content-type'] = 'application/json';
    if (p) headers['authorization'] = 'Bearer ' + p;
    return fetch(path, {
      method: send ? 'POST' : 'GET', headers: headers,
      body: send ? JSON.stringify(send) : undefined,
      credentials: 'omit', cache: 'no-store',
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (b) { return { status: r.status, body: b }; });
    });
  }

  /* The chalkboard's rule for what went wrong: our own sentence, or ours. */
  function why(r, otherwise) {
    if (r && r.body && typeof r.body.error === 'string' && r.body.error) return r.body.error;
    if (r && (r.status === 404 || r.status === 405)) {
      return 'The shelter is not kept on this server. It only answers on stimpunks.world itself.';
    }
    return otherwise;
  }

  function p(cls, text) { var e = document.createElement('p'); if (cls) e.className = cls; e.textContent = text; return e; }
  function when(t) {
    try { return new Date(t).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' }); }
    catch (e) { return ''; }
  }
  function monthName(m) {
    try { return new Date(m + '-15T12:00:00Z').toLocaleDateString(undefined, { month: 'long', year: 'numeric' }); }
    catch (e) { return m; }
  }

  var me = pass();
  var base = !!(me && (me.base || /^cb1\.base\./.test(me.pass)));
  var said = document.getElementById('shelter-said');
  function say(t) { if (said) said.textContent = t; }

  function button(text, cls) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = P + '-btn' + (cls ? ' ' + cls : ''); b.textContent = text;
    return b;
  }

  /* One animal's card. `how` is 'shelter', 'mine' or 'adopted'. */
  function card(a, into, how) {
    var li = document.createElement('li');
    li.className = P + '-card';
    li.appendChild(A.draw(a, P + '-animal'));
    li.appendChild(p(P + '-card__name', a.name || 'Not named yet'));
    li.appendChild(p(P + '-card__about', A.about(a)));
    li.appendChild(p(P + '-card__when', how === 'mine' ? 'You brought them in ' + when(a.t)
      : how === 'adopted' ? 'Adopted ' + when(a.at) : 'Came in ' + when(a.t)));
    if (how === 'shelter' && me) {
      var adopt = button('Adopt ' + (a.name || 'this ' + SAY.it));
      adopt.addEventListener('click', function () {
        adopt.disabled = true;
        say('Signing the papers…');
        call('/cb/shelter/adopt', { kind: KIND, id: a.id }, me.pass).then(function (r) {
          if (r.status === 200 && r.body.adopted) {
            drawShelter(r.body.shelter || []);
            readAdopted();
            say((a.name || 'They') + (a.name ? ' is' : ' are') + ' yours now, and in the Pets tray on your CB radio.');
            try { window.dispatchEvent(new CustomEvent('love-pets')); } catch (e) {}
          } else {
            adopt.disabled = false;
            if (r.body && r.body.shelter) drawShelter(r.body.shelter);
            say(why(r, 'That did not work. Try again in a moment.'));
          }
        }, function () { adopt.disabled = false; say('The shelter could not be reached just now. Nothing was signed.'); });
      });
      li.appendChild(adopt);
    }
    if (base && how !== 'mine' && a.name) {
      var un = button('Take this name off', P + '-btn--small');
      un.addEventListener('click', function () {
        un.disabled = true;
        call('/cb/shelter/unname', { kind: KIND, id: a.id }, me.pass).then(function (r) {
          if (r.status === 200) { drawShelter(r.body.shelter || []); readAdopted(); say('The name is off, everywhere it was.'); }
          else { un.disabled = false; say(why(r, 'That did not work. Try again in a moment.')); }
        }, function () { un.disabled = false; say('The shelter could not be reached just now.'); });
      });
      li.appendChild(un);
    }
    into.appendChild(li);
  }

  function drawShelter(animals) {
    list.textContent = '';
    if (!animals.length) { list.hidden = true; listState.hidden = false; listState.textContent = 'Nobody in the shelter right now.'; return; }
    listState.hidden = true; list.hidden = false;
    animals.slice().reverse().forEach(function (a) { card(a, list, 'shelter'); });
  }

  /* ── Out there now ─────────────────────────────────────────────────────── */
  var waiting = null, full = false;
  var drawn = document.getElementById('shelter-out-animal');
  var words = document.getElementById('shelter-out-words');
  var rescueBox = document.getElementById('shelter-rescue');
  function drawOut(a) {
    waiting = a;
    drawn.textContent = ''; words.textContent = '';
    if (!a) {
      outState.hidden = false; outState.textContent = SAY.none;
      drawn.hidden = true; words.hidden = true;
      if (rescueBox) rescueBox.hidden = true;
      return;
    }
    outState.hidden = true; drawn.hidden = false; words.hidden = false;
    drawn.appendChild(A.draw(a, P + '-animal'));
    words.appendChild(p('', SAY.there + a.words.place + '.'));
    words.appendChild(p('', 'A ' + a.words.coat + ' ' + SAY.it + ' ' + a.words.mark + '.'));
    if (full) words.appendChild(p('', SAY.full));
    if (rescueBox && me) rescueBox.hidden = !!full;
  }

  function look() {
    return call('/cb/shelter?kind=' + KIND).then(function (r) {
      if (r.status === 200 && r.body.shelter) { full = !!r.body.full; drawOut(r.body.waiting); drawShelter(r.body.shelter); return; }
      outState.textContent = SAY.unreached;
      listState.textContent = 'The shelter could not be reached just now.';
    }, function () {
      outState.textContent = SAY.unreached;
      listState.textContent = 'The shelter could not be reached just now.';
    });
  }
  outState.textContent = SAY.looking;
  listState.textContent = 'Looking in at the shelter…';
  look();
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') { look(); readAdopted(); } });

  /* ── Adopted, for good ─────────────────────────────────────────────────── */
  var adoptedList = document.getElementById('shelter-adopted');
  var adoptedState = document.getElementById('shelter-adopted-state');
  var months = document.getElementById('shelter-months');
  function showMonth(r) {
    adoptedList.textContent = '';
    var animals = (r.body && r.body.animals) || [];
    if (!animals.length) { adoptedList.hidden = true; adoptedState.hidden = false; adoptedState.textContent = 'Nobody has been adopted yet.'; return; }
    adoptedState.hidden = true; adoptedList.hidden = false;
    animals.slice().reverse().forEach(function (a) { card(a, adoptedList, 'adopted'); });
  }
  function readAdopted(month) {
    if (!adoptedList || !adoptedState) return;
    adoptedState.hidden = false;
    adoptedState.textContent = 'Reading the book…';
    call('/cb/adopted?kind=' + KIND + (month ? '&month=' + encodeURIComponent(month) : '')).then(function (r) {
      if (r.status !== 200) { adoptedState.textContent = 'The book could not be read just now.'; return; }
      showMonth(r);
      if (!months) return;
      months.textContent = '';
      var ms = r.body.months || [];
      if (ms.length < 2) return;
      ms.slice().reverse().forEach(function (m) {
        var b = button(monthName(m), P + '-btn--small');
        b.setAttribute('aria-pressed', String(m === r.body.month));
        b.addEventListener('click', function () { readAdopted(m); });
        months.appendChild(b);
      });
    }, function () { adoptedState.textContent = 'The book could not be read just now.'; });
  }
  readAdopted();

  /* ── The ones you rescued, in your own browser ─────────────────────────── */
  var mine = document.getElementById('shelter-mine');
  var mineState = document.getElementById('shelter-mine-state');
  var forget = document.getElementById('shelter-forget');
  function readMine() {
    var all = [];
    try { var v = JSON.parse(localStorage.getItem(KEY) || '[]'); if (Array.isArray(v)) all = v; } catch (e) {}
    try {
      var old = JSON.parse(localStorage.getItem('love-cats') || 'null');
      if (Array.isArray(old)) {
        old.forEach(function (c) { if (c && !all.some(function (x) { return x.id === c.id; })) all.push(Object.assign({ kind: 'cat' }, c)); });
        localStorage.setItem(KEY, JSON.stringify(all));
        localStorage.removeItem('love-cats');
      }
    } catch (e) {}
    return all;
  }
  function writeMine(all) { try { localStorage.setItem(KEY, JSON.stringify(all)); return true; } catch (e) { return false; } }
  function drawMine() {
    if (!mine || !mineState) return;
    var all = readMine().filter(function (a) { return a && a.kind === KIND && a.words; });
    mine.textContent = '';
    if (!all.length) { mine.hidden = true; mineState.textContent = 'You have not rescued one on this browser yet.'; if (forget) forget.hidden = true; return; }
    mine.hidden = false; mineState.textContent = 'Kept in this browser only. The shelter does not know which were yours.';
    if (forget) forget.hidden = false;
    all.slice().reverse().forEach(function (a) { card(a, mine, 'mine'); });
  }
  if (forget) forget.addEventListener('click', function () {
    writeMine(readMine().filter(function (a) { return a && a.kind !== KIND; }));
    drawMine();
    say('Forgotten. This browser no longer remembers which ones you rescued here.');
  });
  drawMine();

  /* ── Rescuing ──────────────────────────────────────────────────────────── */
  var signon = document.getElementById('shelter-signon');
  if (!me) { if (signon) signon.hidden = false; return; }
  var nameBox = document.getElementById('shelter-name');
  if (!rescueBox || !nameBox) return;
  var go = rescueBox.querySelector('button[type="submit"]');
  rescueBox.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!waiting) { say('There is nobody out there right now.'); return; }
    go.disabled = true;
    say('Going to get them…');
    call('/cb/shelter/rescue', { kind: KIND, id: waiting.id, name: nameBox.value.trim() }, me.pass).then(function (r) {
      go.disabled = false;
      if (r.status === 200 && r.body.rescued) {
        var a = r.body.rescued;
        nameBox.value = '';
        var all = readMine(); all.push(a);
        var kept = writeMine(all);
        drawOut(null); drawShelter(r.body.shelter || []); drawMine();
        say((a.name ? a.name + ' is' : 'They are') + ' safe in the shelter.' + (kept ? ' This browser will remember it was you.' : ''));
      } else if (r.status === 409) {
        if (r.body.full) { full = true; drawOut(waiting); } else drawOut(null);
        if (r.body.shelter) drawShelter(r.body.shelter);
        say(why(r, 'That one is already safe in the shelter.'));
      } else if (r.status === 401) {
        say('The password has changed since you signed on. Sign on again at the Community Center, then come back.');
      } else {
        say(why(r, 'That did not work. Try again in a moment.'));
      }
    }, function () { go.disabled = false; say('The shelter could not be reached just now. They are still out there.'); });
  });
}());

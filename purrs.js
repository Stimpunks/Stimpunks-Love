/* =============================================================================
   Pekoe and Purrs, the cat café: the shelter's cats on their perches, each
   cat's card, your lap, your table, the toys, and the cats wandering at MAX
   GLITTER. Ryan's brief, 2026-10-04.

   THE CATS ARE READ OFF THE SHELTER'S OWN LIST every time the room opens, with
   the one GET the shelter pages make, and again when the tab comes back to the
   front, so a cat adopted while you were away goes home and a cat brought in
   arrives. That is the only thing this file asks for. It stores nothing, sends
   nothing, posts nothing, and knows nothing about a CB pass: adopting is done
   at Rescue A Cat, and every cat's card links to its own card there.

   THE PICTURE IS THE PAGE'S, written by tools/make-pekoe.py: the room, every
   perch (the list #pkp-spots, with where it is in words), the toys, and the
   view down at your lap and your table. Your table is table.js's, shared with
   Brew and Stew; this file only adds the cat on your lap to it. Cats are drawn
   by animals.js, so a cat here is drawn exactly as it is in the shelter.

   WHERE A CAT GOES IS ITS MOOD'S BUSINESS AND NOTHING ELSE'S, the rule
   written on the room as data-moods. A cat's markings are only ever handed to
   animals.js to draw, and make-pekoe.py refuses this file if it reads them for
   anything else. A cat whose mood is in data-left-alone is never picked up.

   NOTHING MOVES BY ITSELF BELOW MAX GLITTER. The dial is read on every tick:
   at MAX a cat wanders now and then, silently, never in a hidden tab; at
   Gentle and Regular the cats stay put until a toy is pressed. A move fades at
   Regular and MAX and is a plain jump at Gentle, where §3 takes transitions
   away. Cats move with left and top and never a transform, arcade.js's call,
   so check-gentle.py can see everything that moves.

   Every answer is said where the hand is, on the card, the toy or the menu
   item that was pressed, and once into the one live region, cleared first so
   a sentence said twice is heard twice. Every name goes in as text.
   ============================================================================= */
(function () {
  'use strict';

  var room = document.getElementById('pkp-room');
  var catsBox = document.getElementById('pkp-cats');
  var spotList = document.getElementById('pkp-spots');
  if (!room || !catsBox || !spotList || !window.loveAnimals) return;
  var A = window.loveAnimals;

  var W = +room.getAttribute('data-w'), H = +room.getAttribute('data-h');
  var CW = +room.getAttribute('data-cat-w'), CH = +room.getAttribute('data-cat-h');
  var ALONE = (room.getAttribute('data-left-alone') || '').split(/\s+/);
  var MOODS = {};
  try { MOODS = JSON.parse(room.getAttribute('data-moods') || '{}'); } catch (e) {}

  var state = document.getElementById('pkp-state');
  var says = document.getElementById('pkp-says');
  var who = document.getElementById('pkp-who');
  var whoH = document.getElementById('pkp-who-h');
  var roomWrap = document.getElementById('pkp-roomwrap');
  var lapView = document.getElementById('pkp-lap');
  var lookBtn = document.querySelector('[data-table-look]');
  var toysSaid = document.getElementById('pkp-toys-said');

  var spots = Array.prototype.map.call(spotList.querySelectorAll('li'), function (li) {
    return { key: li.getAttribute('data-spot'), kind: li.getAttribute('data-kind'), level: li.getAttribute('data-level'),
             x: +li.getAttribute('data-x'), y: +li.getAttribute('data-y'), where: li.textContent, cat: null };
  });

  var cats = [];       // { a, spot, btn }
  var lap = null;      // the cat on your lap
  var lastRead = 0;

  /* ── Saying things ───────────────────────────────────────────────────── */
  function speak(text) {
    if (!says) return;
    says.textContent = '';
    setTimeout(function () { says.textContent = text; }, 40);
  }
  var lastSaid = null;
  function sayAt(el, text) {
    if (lastSaid && lastSaid !== el) { lastSaid.hidden = true; lastSaid.textContent = ''; }
    if (el) { el.textContent = text; el.hidden = false; lastSaid = el; }
    speak(text);
  }
  function intensity() { return document.documentElement.getAttribute('data-intensity') || 'regular'; }

  /* ── Who a cat is, in words ──────────────────────────────────────────── */
  function described(c) { return 'a ' + c.a.words.coat + ' ' + A.noun(c.a); }
  function nameOf(c) { return c.a.name || 'the ' + c.a.words.coat + ' ' + A.noun(c.a); }
  function Name(c) { var n = nameOf(c); return n.charAt(0).toUpperCase() + n.slice(1); }
  function whereOf(c) { return c === lap ? 'on your lap' : (c.spot ? c.spot.where : 'somewhere in the café'); }
  function listOf(names) {
    if (names.length < 2) return names.join('');
    return names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
  }
  function leftAlone(c) { return ALONE.indexOf(c.a.mood) !== -1; }
  function when(t) {
    try { return new Date(t).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }); }
    catch (e) { return ''; }
  }

  /* ── Perches ─────────────────────────────────────────────────────────── */
  function likes(c, s, extra) {
    var r = MOODS[c.a.mood] || {};
    if (r.kinds && r.kinds.length && r.kinds.indexOf(s.kind) === -1) return false;
    if (r.levels && r.levels.length && r.levels.indexOf(s.level) === -1) return false;
    if (extra) {
      if (extra.kinds.length && extra.kinds.indexOf(s.kind) === -1) return false;
      if (extra.levels.length && extra.levels.indexOf(s.level) === -1) return false;
    }
    return true;
  }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  function free(c, extra, strict) {
    var open = spots.filter(function (s) { return !s.cat && s !== c.spot; });
    var liked = open.filter(function (s) { return likes(c, s, extra); });
    if (liked.length) return pick(liked);
    return strict ? null : (open.length ? pick(open) : null);
  }

  function setPlace(c) {
    var b = c.btn, s = c.spot;
    if (!s) { b.hidden = true; return; }
    b.hidden = false;
    b.style.left = ((s.x - CW / 2) / W * 100) + '%';
    b.style.top = ((s.y - CH) / H * 100) + '%';
    b.setAttribute('aria-label', Name(c) + ', ' + described(c) + ', ' + s.where);
  }
  function seat(c, s) {
    if (c.spot) c.spot.cat = null;
    c.spot = s;
    if (s) s.cat = c;
    setPlace(c);
  }
  /* A hop: a fade where the dial allows one, a plain jump at Gentle. */
  function hop(c, s) {
    if (intensity() === 'gentle') { seat(c, s); drawWho(); refreshCard(); return; }
    c.btn.classList.add('pkp-cat--away');
    setTimeout(function () {
      seat(c, s);
      c.btn.classList.remove('pkp-cat--away');
      drawWho(); refreshCard();
    }, 360);
  }

  /* ── The cats arriving and leaving ───────────────────────────────────── */
  function arrive(a) {
    var c = { a: a, spot: null, btn: document.createElement('button') };
    c.btn.type = 'button';
    c.btn.className = 'pkp-cat';
    c.btn.appendChild(A.draw(a, 'pkp-cat__draw', { bare: true }));
    c.btn.addEventListener('click', function () { openCard(c, c.btn); });
    catsBox.appendChild(c.btn);
    cats.push(c);
    seat(c, free(c));
    return c;
  }
  function leave(c) {
    seat(c, null);
    if (c.btn.parentNode) c.btn.parentNode.removeChild(c.btn);
    cats.splice(cats.indexOf(c), 1);
    if (lap === c) { lap = null; drawLap(); }
    if (open === c) closeCard(true);
  }

  function settle(list, waiting) {
    var ids = {};
    list.forEach(function (a) { if (a && a.id && a.words) ids[a.id] = a; });
    var gone = [];
    cats.slice().forEach(function (c) {
      if (!ids[c.a.id]) { gone.push(c); return; }
      c.a = ids[c.a.id];            // a name taken off, or put on, at the shelter
      setPlace(c);
      delete ids[c.a.id];
    });
    gone.forEach(function (c) {
      if (c === lap) speak(Name(c) + ' has been adopted while you were here, and has gone home.');
      leave(c);
    });
    // Newest last in the shelter's list; the order they came in is the order they arrive.
    list.forEach(function (a) { if (ids[a.id]) arrive(a); });
    drawWho(); drawLap(); refreshCard();
    if (!cats.length) {
      state.hidden = false;
      state.textContent = 'No cats from the shelter are in today: every one of them has gone home. ';
      if (waiting) {
        state.appendChild(document.createTextNode('There is a cat out on the street right now, waiting to be brought in at '));
        var l = document.createElement('a'); l.href = 'rescue-a-cat.html'; l.textContent = 'Rescue A Cat';
        state.appendChild(l); state.appendChild(document.createTextNode('.'));
      }
    } else {
      state.hidden = false;
      state.textContent = 'Every cat in here is from ';
      var r = document.createElement('a'); r.href = 'rescue-a-cat.html'; r.textContent = 'Rescue A Cat';
      state.appendChild(r);
      state.appendChild(document.createTextNode(', waiting for a home. Press one to meet them.'));
    }
  }

  function read() {
    lastRead = Date.now();
    fetch('/cb/shelter?kind=cat', { headers: { accept: 'application/json' }, credentials: 'omit', cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (b) { settle(Array.isArray(b.shelter) ? b.shelter : [], b.waiting); },
        function () {
          if (cats.length) return;
          state.hidden = false;
          state.textContent = 'The shelter could not be reached just now, so the cats are staying at ';
          var l = document.createElement('a'); l.href = 'rescue-a-cat.html'; l.textContent = 'Rescue A Cat';
          state.appendChild(l);
          state.appendChild(document.createTextNode('. The café only reads their list on stimpunks.world itself.'));
        });
  }

  /* ── Who is in today, in words ───────────────────────────────────────── */
  function drawWho() {
    if (!who) return;
    var here = cats.slice().sort(function (p, q) {
      if (p === lap || q === lap) return p === lap ? -1 : 1;
      return (p.spot.y - q.spot.y) || (p.spot.x - q.spot.x);
    });
    // Rows are updated in place, and only put back in order while the
    // keyboard is somewhere else, so a cat wandering off at MAX GLITTER never
    // throws somebody off the name they were on. Each name is a way to the
    // cat's card as well, for a phone where the room is wider than the screen.
    var focused = who.contains(document.activeElement);
    Array.prototype.slice.call(who.children).forEach(function (li) {
      if (!here.some(function (c) { return c.row && c.row.li === li; })) who.removeChild(li);
    });
    here.forEach(function (c) {
      if (!c.row) {
        var li = document.createElement('li'), b = document.createElement('button'), t = document.createTextNode('');
        b.type = 'button';
        b.className = 'pkp-who__cat';
        b.addEventListener('click', function () { openCard(c, b); });
        li.appendChild(b); li.appendChild(t);
        c.row = { li: li, b: b, t: t };
      }
      c.row.b.textContent = Name(c);
      c.row.t.textContent = ', ' + described(c) + ', ' + whereOf(c) + '.';
      if (!focused || !c.row.li.parentNode) who.appendChild(c.row.li);
    });
    who.hidden = whoH.hidden = !here.length;
  }

  /* ── A cat's card ────────────────────────────────────────────────────── */
  var card = document.getElementById('pkp-card');
  var open = null, openedFrom = null;
  var el = {
    pic: document.getElementById('pkp-card-pic'), name: document.getElementById('pkp-card-name'),
    about: document.getElementById('pkp-card-about'), now: document.getElementById('pkp-card-now'),
    came: document.getElementById('pkp-card-came'), hold: document.getElementById('pkp-card-hold'),
    alone: document.getElementById('pkp-card-alone'), adopt: document.getElementById('pkp-card-adopt'),
    close: document.getElementById('pkp-card-close'),
  };
  function refreshCard() {
    var c = open;
    if (!c || !card) return;
    el.name.textContent = c.a.name || 'Not named yet';
    el.about.textContent = A.about(c.a);
    el.now.textContent = 'Right now: ' + whereOf(c) + '.';
    el.came.textContent = c.a.t ? 'Came in to the shelter on ' + when(c.a.t) + '.' : '';
    el.adopt.href = 'rescue-a-cat.html#animal-' + encodeURIComponent(c.a.id);
    el.adopt.textContent = 'Adopt ' + nameOf(c) + ' at Rescue A Cat →';
    if (leftAlone(c)) {
      el.hold.hidden = true;
      el.alone.hidden = false;
      el.alone.textContent = Name(c) + ' would rather not be picked up, which is allowed. Sit nearby and let them watch.';
    } else {
      el.alone.hidden = true;
      el.hold.hidden = false;
      el.hold.textContent = c === lap ? 'Let ' + nameOf(c) + ' down' : 'Put ' + nameOf(c) + ' on your lap';
    }
  }
  function openCard(c, from) {
    open = c; openedFrom = from || null;
    el.pic.textContent = '';
    el.pic.appendChild(A.draw(c.a, 'pkp-card__draw', { bare: true }));
    refreshCard();
    card.hidden = false;
    el.name.focus();
  }
  function closeCard(quiet) {
    var c = open;
    open = null;
    card.hidden = true;
    if (quiet) return;
    // Back to whatever was pressed to open it, if it is still there: the cat
    // in the room, or its name in the list, which is redrawn as cats move.
    var back = openedFrom && document.body.contains(openedFrom) && !openedFrom.hidden ? openedFrom
      : (c && c.btn && !c.btn.hidden && c.btn.parentNode ? c.btn : lookBtn);
    if (back) back.focus();
  }
  if (el.close) el.close.addEventListener('click', function () { closeCard(); });
  if (card) card.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCard(); });
  if (el.hold) el.hold.addEventListener('click', function () {
    var c = open;
    if (!c || leftAlone(c)) return;
    if (c === lap) letDown(c); else pickUp(c);
    refreshCard();
  });

  /* ── Your lap ────────────────────────────────────────────────────────── */
  function pickUp(c) {
    var off = lap;
    if (off) { lap = null; seat(off, free(off)); }
    seat(c, null);
    lap = c;
    drawWho(); drawLap();
    speak(Name(c) + ' is on your lap.' + (off ? ' ' + Name(off) + ' hopped down and went ' + off.spot.where + '.' : '') +
          (looking() ? '' : ' Look down to see them.'));
  }
  function letDown(c) {
    lap = null;
    seat(c, free(c));
    drawWho(); drawLap();
    speak(Name(c) + ' hopped down and went ' + (c.spot ? c.spot.where : 'off') + '.');
  }

  /* ── Your lap, looking down ─────────────────────────────────────────────
     table.js draws the table and what is on it, and looks down and back up;
     this adds the cat on your lap to the picture and to the sentence. */
  var lapCat = document.getElementById('pkp-lap-cat');
  function lapWords() {
    return lap ? 'On your lap, under the blanket: ' + nameOf(lap) + ', asleep.'
      : 'On your lap: the blanket, and no cat. Pick one up from their card.';
  }
  function drawLapCat(place) {
    if (!lapCat) return;
    while (lapCat.firstChild) lapCat.removeChild(lapCat.firstChild);
    if (lap) place(lapCat, A.draw(lap.a, 'pkp-lap__cat', { pose: 'curled' }));
  }
  function drawLap() { if (window.loveTable) window.loveTable.redraw(); }
  function looking() { return !!(window.loveTable && window.loveTable.looking()); }
  if (window.loveTable) window.loveTable.add({ words: lapWords, draw: drawLapCat });

  /* ── Toys ────────────────────────────────────────────────────────────── */
  Array.prototype.forEach.call(document.querySelectorAll('.pkp-toy'), function (b) {
    var want = {
      kinds: (b.getAttribute('data-kinds') || '').split(/\s+/).filter(Boolean),
      levels: (b.getAttribute('data-levels') || '').split(/\s+/).filter(Boolean),
    };
    var most = +b.getAttribute('data-most') || 1;
    var went = b.getAttribute('data-went');
    b.hidden = false;
    b.addEventListener('click', function () {
      var here = cats.filter(function (c) { return c !== lap && c.spot; });
      if (!here.length) { sayAt(toysSaid, 'There are no cats in the café to go after it.'); return; }
      var keen = here.filter(function (c) { return (MOODS[c.a.mood] || {}).toys !== false; });
      keen.sort(function () { return Math.random() - 0.5; });
      var moved = [];
      keen.forEach(function (c) {
        if (moved.length >= most) return;
        if (likes(c, c.spot, want)) return;     // already somewhere the toy is
        var s = free(c, want, true);
        if (!s) return;
        s.cat = c;                               // held for this cat while it hops
        moved.push([c, s]);
      });
      moved.forEach(function (m) { hop(m[0], m[1]); });
      var space = spots.filter(function (s) { return !s.cat && likes({ a: { mood: '' } }, s, want); });
      if (moved.length) {
        sayAt(toysSaid, listOf(moved.map(function (m) { return Name(m[0]); })) + ' ' + went + '.');
      } else if (!space.length) {
        // Every perch the toy went near is taken, whoever is on it.
        var there = spots.filter(function (s) { return s.cat && likes({ a: { mood: '' } }, s, want); });
        sayAt(toysSaid, listOf(there.map(function (s) { return Name(s.cat); })) + ' got there first.');
      } else {
        sayAt(toysSaid, 'Nobody went after it this time, which is allowed.');
      }
    });
  });

  /* ── Wandering, at MAX GLITTER only ──────────────────────────────────── */
  function wander() {
    setTimeout(wander, 18000 + Math.random() * 22000);
    if (intensity() !== 'max' || document.visibilityState !== 'visible') return;
    var here = cats.filter(function (c) { return c !== lap && c.spot; });
    if (!here.length) return;
    var c = pick(here);
    if ((MOODS[c.a.mood] || {}).toys === false && Math.random() < 0.75) return;  // sleepers mostly stay asleep
    var s = free(c, null, true);
    if (s) hop(c, s);
  }
  setTimeout(wander, 20000);

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && Date.now() - lastRead > 60000) read();
  });

  state.textContent = 'Looking in at the shelter to see who is visiting…';
  drawLap();
  read();
}());

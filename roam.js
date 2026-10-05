/* =============================================================================
   Animals from a shelter, somewhere to be in a room: every animal in the
   shelter's own list put on a perch that suits its mood, each animal's card,
   the toys that move them, one of them with you, and the animals wandering at
   MAX GLITTER.

   Pekoe and Purrs came first (2026-10-04, inside purrs.js), and The Run asked
   for the same thing with the dogs (Ryan's brief, 2026-10-05), so the
   behaviour moved into this one file, the way table.js and rack.js did when a
   second room took a pattern. THE BEHAVIOUR IS SHARED AND THE LOOK IS NOT:
   every room draws its own room and its own perches, words its own sentences
   and dresses everything in its own section of love.css. This file finds the
   parts by their data- attributes and takes the room's words from the room's
   own script, which calls window.loveRoam({...}).

   THE ANIMALS ARE READ OFF THE SHELTER'S OWN LIST every time the room opens,
   with the one GET the shelter pages make, and again when the tab comes back
   to the front, so an animal adopted while you were away goes home and one
   brought in arrives. That is the only thing this file asks for. It stores
   nothing, sends nothing, posts nothing, and knows nothing about a CB pass:
   adopting is done at the shelter, and every animal's card links to its own
   card there. make-pekoe.py and make-the-run.py both refuse this file if any
   of that changes.

   WHERE AN ANIMAL GOES IS ITS MOOD'S BUSINESS AND NOTHING ELSE'S, the rule
   written on the room as data-moods. Markings are only ever handed to
   animals.js to draw: a cat with three legs gets to the top of the tree, and a
   dog with three legs gets to the far end of the field. An animal whose mood
   is in data-left-alone is never picked up and never called over.

   NOTHING MOVES BY ITSELF BELOW MAX GLITTER. The dial is read on every tick:
   at MAX an animal wanders now and then, silently, never in a hidden tab; at
   Gentle and Regular they stay put until a toy is pressed. A move fades at
   Regular and MAX and is a plain jump at Gentle, where §3 takes transitions
   away. Animals move with left and top and never a transform, arcade.js's
   call, so check-gentle.py can see everything that moves.

   Every answer is said where the hand is, on the card or the toy that was
   pressed, and once into the one live region, cleared first so a sentence
   said twice is heard twice. Every name goes in as text.

   The parts, all found by attribute:
     [data-roam]           the room, with data-kind (cat or dog), data-shelter
                           (the shelter's page), data-moods, data-left-alone,
                           data-w, data-h, data-animal-w and data-animal-h
     [data-roam-box]       where the animals' buttons go, inside the room
     [data-roam-spots]     the perches, each an li with data-spot, data-kind,
                           data-level, data-x, data-y and its place in words
     [data-roam-state]     the line saying who is in, or why nobody is
     [data-roam-says]      the room's live region
     [data-roam-who], [data-roam-who-h]   who is in, in words
     [data-roam-card]      an animal's card, holding data-roam-card-pic, -name,
                           -about, -now, -came, -hold, -alone, -adopt, -close
     [data-roam-toy]       a toy, with data-kinds, data-levels, data-most and
                           data-went; ships hidden
     [data-roam-toys-said] the answer under the toys (aria-hidden)
     [data-roam-back]      where the keyboard goes when a card closes and
                           nothing else is there to go back to
   ============================================================================= */
(function () {
  'use strict';

  var KINDS = { cat: 1, dog: 1 };

  window.loveRoam = function (opts) {
    var room = document.querySelector('[data-roam]');
    var box = document.querySelector('[data-roam-box]');
    var spotList = document.querySelector('[data-roam-spots]');
    var KIND = room && room.getAttribute('data-kind');
    if (!room || !box || !spotList || !window.loveAnimals || !KINDS[KIND]) return null;
    var A = window.loveAnimals;
    var SHELTER = room.getAttribute('data-shelter');
    var cls = opts.cls;
    var keep = opts.keep;
    var said = opts.says;

    var W = +room.getAttribute('data-w'), H = +room.getAttribute('data-h');
    var AW = +room.getAttribute('data-animal-w'), AH = +room.getAttribute('data-animal-h');
    var ALONE = (room.getAttribute('data-left-alone') || '').split(/\s+/);
    var MOODS = {};
    try { MOODS = JSON.parse(room.getAttribute('data-moods') || '{}'); } catch (e) {}

    var state = document.querySelector('[data-roam-state]');
    var says = document.querySelector('[data-roam-says]');
    var who = document.querySelector('[data-roam-who]');
    var whoH = document.querySelector('[data-roam-who-h]');
    var back = document.querySelector('[data-roam-back]');
    var toysSaid = document.querySelector('[data-roam-toys-said]');

    var spots = Array.prototype.map.call(spotList.querySelectorAll('li'), function (li) {
      return { key: li.getAttribute('data-spot'), kind: li.getAttribute('data-kind'), level: li.getAttribute('data-level'),
               x: +li.getAttribute('data-x'), y: +li.getAttribute('data-y'), where: li.textContent, animal: null };
    });
    /* A PERCH KEPT FOR WHOEVER IS WITH YOU. The Run keeps the bed beside your
       chair for the dog you called over, so no other dog is ever put there;
       the café keeps none, because a cat on your lap is in the view down at
       your lap rather than anywhere in the room. */
    var kept = keep.spot ? spots.filter(function (s) { return s.key === keep.spot; })[0] || null : null;
    var open = spots.filter(function (s) { return s !== kept; });

    var animals = [];   // { a, spot, btn }
    var withYou = null;
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
    /* A sentence the room wrote as a list of words and links, built as text. */
    function write(el, parts) {
      if (!el) return;
      el.textContent = '';
      (parts || []).forEach(function (p) {
        if (typeof p === 'string') { el.appendChild(document.createTextNode(p)); return; }
        var l = document.createElement('a');
        l.href = p.href;
        l.textContent = p.text;
        el.appendChild(l);
      });
      el.hidden = false;
    }
    function intensity() { return document.documentElement.getAttribute('data-intensity') || 'regular'; }

    /* ── Who an animal is, in words ──────────────────────────────────────── */
    function described(c) { return 'a ' + c.a.words.coat + ' ' + A.noun(c.a); }
    function nameOf(c) { return c.a.name || 'the ' + c.a.words.coat + ' ' + A.noun(c.a); }
    function Name(c) { var n = nameOf(c); return n.charAt(0).toUpperCase() + n.slice(1); }
    function whereOf(c) { return c === withYou ? keep.where : (c.spot ? c.spot.where : opts.somewhere); }
    function listOf(names) {
      if (names.length < 2) return names.join('');
      return names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
    }
    /* A list of names that starts a sentence: only the first is capitalised, so
       "the black dog" is not "The black dog" in the middle of one. */
    function Names(list) { var s = listOf(list.map(nameOf)); return s.charAt(0).toUpperCase() + s.slice(1); }
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
      var empty = open.filter(function (s) { return !s.animal && s !== c.spot; });
      var liked = empty.filter(function (s) { return likes(c, s, extra); });
      if (liked.length) return pick(liked);
      return strict ? null : (empty.length ? pick(empty) : null);
    }

    function setPlace(c) {
      var b = c.btn, s = c.spot;
      if (!s) { b.hidden = true; return; }
      b.hidden = false;
      b.style.left = ((s.x - AW / 2) / W * 100) + '%';
      b.style.top = ((s.y - AH) / H * 100) + '%';
      b.setAttribute('aria-label', Name(c) + ', ' + described(c) + ', ' + (c === withYou ? keep.where : s.where));
    }
    function seat(c, s) {
      if (c.spot) c.spot.animal = null;
      c.spot = s;
      if (s) s.animal = c;
      setPlace(c);
    }
    /* A move: a fade where the dial allows one, a plain jump at Gentle. */
    function hop(c, s) {
      if (intensity() === 'gentle') { seat(c, s); drawWho(); refreshCard(); return; }
      c.btn.classList.add(cls.away);
      setTimeout(function () {
        seat(c, s);
        c.btn.classList.remove(cls.away);
        drawWho(); refreshCard();
      }, 360);
    }

    /* ── The animals arriving and leaving ────────────────────────────────── */
    function arrive(a) {
      var c = { a: a, spot: null, btn: document.createElement('button') };
      c.btn.type = 'button';
      c.btn.className = cls.animal;
      c.btn.appendChild(opts.draw(a, cls.draw));
      c.btn.addEventListener('click', function () { openCard(c, c.btn); });
      box.appendChild(c.btn);
      animals.push(c);
      seat(c, free(c));
      return c;
    }
    function leave(c) {
      seat(c, null);
      if (c.btn.parentNode) c.btn.parentNode.removeChild(c.btn);
      animals.splice(animals.indexOf(c), 1);
      if (withYou === c) { withYou = null; changed(); }
      if (shown === c) closeCard(true);
    }

    function settle(list, waiting) {
      var ids = {};
      list.forEach(function (a) { if (a && a.id && a.words && a.kind === KIND) ids[a.id] = a; });
      var gone = [];
      animals.slice().forEach(function (c) {
        if (!ids[c.a.id]) { gone.push(c); return; }
        c.a = ids[c.a.id];            // a name taken off, or put on, at the shelter
        setPlace(c);
        delete ids[c.a.id];
      });
      gone.forEach(function (c) {
        if (c === withYou) speak(keep.gone(Name(c)));
        leave(c);
      });
      // Newest last in the shelter's list; the order they came in is the order they arrive.
      list.forEach(function (a) { if (ids[a.id]) arrive(a); });
      drawWho(); changed(); refreshCard();
      write(state, animals.length ? said.some() : said.none(!!waiting));
    }

    function read() {
      lastRead = Date.now();
      fetch('/cb/shelter?kind=' + KIND, { headers: { accept: 'application/json' }, credentials: 'omit', cache: 'no-store' })
        .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
        .then(function (b) { settle(Array.isArray(b.shelter) ? b.shelter : [], b.waiting); },
          function () { if (!animals.length) write(state, said.unreachable()); });
    }

    /* ── Who is in today, in words ───────────────────────────────────────── */
    function drawWho() {
      if (!who) return;
      var here = animals.slice().sort(function (p, q) {
        if (p === withYou || q === withYou) return p === withYou ? -1 : 1;
        return (p.spot.y - q.spot.y) || (p.spot.x - q.spot.x);
      });
      // Rows are updated in place, and only put back in order while the
      // keyboard is somewhere else, so an animal wandering off at MAX GLITTER
      // never throws somebody off the name they were on. Each name is a way to
      // the animal's card as well, for a phone where the room is wider than
      // the screen.
      var focused = who.contains(document.activeElement);
      Array.prototype.slice.call(who.children).forEach(function (li) {
        if (!here.some(function (c) { return c.row && c.row.li === li; })) who.removeChild(li);
      });
      here.forEach(function (c) {
        if (!c.row) {
          var li = document.createElement('li'), b = document.createElement('button'), t = document.createTextNode('');
          b.type = 'button';
          b.className = cls.whoBtn;
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

    /* ── An animal's card ────────────────────────────────────────────────── */
    var card = document.querySelector('[data-roam-card]');
    function part(k) { return card ? card.querySelector('[data-roam-card-' + k + ']') : null; }
    var el = {
      pic: part('pic'), name: part('name'), about: part('about'), now: part('now'), came: part('came'),
      hold: part('hold'), alone: part('alone'), adopt: part('adopt'), close: part('close'),
    };
    var shown = null, openedFrom = null;
    function refreshCard() {
      var c = shown;
      if (!c || !card) return;
      el.name.textContent = c.a.name || 'Not named yet';
      el.about.textContent = A.about(c.a);
      el.now.textContent = 'Right now: ' + whereOf(c) + '.';
      el.came.textContent = c.a.t ? 'Came in to the shelter on ' + when(c.a.t) + '.' : '';
      el.adopt.href = SHELTER + '#animal-' + encodeURIComponent(c.a.id);
      el.adopt.textContent = said.adopt(nameOf(c));
      if (leftAlone(c)) {
        el.hold.hidden = true;
        el.alone.hidden = false;
        el.alone.textContent = keep.alone(Name(c));
      } else {
        el.alone.hidden = true;
        el.hold.hidden = false;
        el.hold.textContent = keep.label(nameOf(c), c === withYou);
      }
    }
    function openCard(c, from) {
      shown = c; openedFrom = from || null;
      el.pic.textContent = '';
      el.pic.appendChild(opts.draw(c.a, cls.card));
      refreshCard();
      card.hidden = false;
      el.name.focus();
    }
    function closeCard(quiet) {
      var c = shown;
      shown = null;
      card.hidden = true;
      if (quiet) return;
      // Back to whatever was pressed to open it, if it is still there: the
      // animal in the room, or its name in the list, which is redrawn as they
      // move.
      var to = openedFrom && document.body.contains(openedFrom) && !openedFrom.hidden ? openedFrom
        : (c && c.btn && !c.btn.hidden && c.btn.parentNode ? c.btn : back);
      if (to) to.focus();
    }
    if (el.close) el.close.addEventListener('click', function () { closeCard(); });
    if (card) card.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCard(); });
    if (el.hold) el.hold.addEventListener('click', function () {
      var c = shown;
      if (!c || leftAlone(c)) return;
      if (c === withYou) letGo(c); else take(c);
      refreshCard();
    });

    /* ── One of them with you ────────────────────────────────────────────── */
    function changed() { if (keep.change) keep.change(); }
    function take(c) {
      var off = withYou;
      if (off) { withYou = null; seat(off, free(off)); }
      withYou = c;
      seat(c, kept);
      drawWho(); changed();
      speak(keep.taken(Name(c), off ? Name(off) : null, off && off.spot ? off.spot.where : null));
    }
    function letGo(c) {
      withYou = null;
      seat(c, free(c));
      drawWho(); changed();
      speak(keep.left(Name(c), c.spot ? c.spot.where : null));
    }

    /* ── Toys ────────────────────────────────────────────────────────────── */
    Array.prototype.forEach.call(document.querySelectorAll('[data-roam-toy]'), function (b) {
      var want = {
        kinds: (b.getAttribute('data-kinds') || '').split(/\s+/).filter(Boolean),
        levels: (b.getAttribute('data-levels') || '').split(/\s+/).filter(Boolean),
      };
      var most = +b.getAttribute('data-most') || 1;
      var went = b.getAttribute('data-went');
      b.hidden = false;
      b.addEventListener('click', function () {
        var here = animals.filter(function (c) { return c !== withYou && c.spot; });
        if (!here.length) { sayAt(toysSaid, said.toysNone()); return; }
        var keen = here.filter(function (c) { return (MOODS[c.a.mood] || {}).toys !== false; });
        keen.sort(function () { return Math.random() - 0.5; });
        var moved = [];
        keen.forEach(function (c) {
          if (moved.length >= most) return;
          if (likes(c, c.spot, want)) return;     // already somewhere the toy is
          var s = free(c, want, true);
          if (!s) return;
          s.animal = c;                            // held for this one while it moves
          moved.push([c, s]);
        });
        moved.forEach(function (m) { hop(m[0], m[1]); });
        var space = open.filter(function (s) { return !s.animal && likes({ a: { mood: '' } }, s, want); });
        if (moved.length) {
          sayAt(toysSaid, Names(moved.map(function (m) { return m[0]; })) + ' ' + went + '.');
        } else if (!space.length) {
          // Every perch the toy went near is taken, whoever is on it.
          var there = open.filter(function (s) { return s.animal && likes({ a: { mood: '' } }, s, want); });
          sayAt(toysSaid, Names(there.map(function (s) { return s.animal; })) + ' got there first.');
        } else {
          sayAt(toysSaid, 'Nobody went after it this time, which is allowed.');
        }
      });
    });

    /* ── Wandering, at MAX GLITTER only ──────────────────────────────────── */
    function wander() {
      setTimeout(wander, 18000 + Math.random() * 22000);
      if (intensity() !== 'max' || document.visibilityState !== 'visible') return;
      var here = animals.filter(function (c) { return c !== withYou && c.spot; });
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

    write(state, [said.looking()]);
    read();

    return {
      withYou: function () { return withYou; },
      nameOf: nameOf,
      Name: Name,
      speak: speak,
    };
  };
}());

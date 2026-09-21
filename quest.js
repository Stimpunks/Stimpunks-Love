/* =============================================================================
   The job markers, and the Adventurer's Guild's board.

   One file, two callers, the shape love.js already has: each half looks for its
   own markup and returns at once if it is not on this page. Every room on the
   street loads this; only one page has a board.

   NOTHING HERE IS REQUIRED TO DO A QUEST. The marker is a native <details>, so
   with scripts off it still opens, still explains itself, still shows its hints
   and still gives up its code through the "give me the answer" way out. What
   this file adds is the answer box -- which SHIPS HIDDEN and is revealed here,
   so a page without JavaScript shows no dead control -- and the board's
   bookkeeping. A quest that only worked with JavaScript would be a room a chunk
   of our own readers cannot enter, on a site that exists to say so.

   AND THE DIAL GOVERNS THE FANFARE, NEVER THE WORDS. Handing in a code says the
   same sentences at all three settings. Gentle adds nothing to them; Regular
   adds a short chime; MAX adds a fuller one and a shower of sparks that rise and
   fade. NOTHING FLASHES, at any setting, which is Club Chronic's rule and holds
   here for its reason: a room whose argument is come in as you are cannot have a
   light in it that puts somebody on the floor.
   ============================================================================= */
(function () {
  'use strict';

  var KEY = 'love-quests';

  /* ── Remembering ────────────────────────────────────────────────────────
     Every read and write is wrapped, because localStorage throws rather than
     returning empty in a private window and behind blocked site data. A board
     that cannot remember still redeems; it just cannot keep the stamp, and it
     says so out loud rather than looking broken. */
  function done() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Object.prototype.toString.call(v) === '[object Array]' ? v : [];
    } catch (e) { return []; }
  }

  function remember(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); return true; }
    catch (e) { return false; }
  }

  function storageWorks() {
    try {
      localStorage.setItem(KEY + '-probe', '1');
      localStorage.removeItem(KEY + '-probe');
      return true;
    } catch (e) { return false; }
  }

  /* ── The two normalisers ────────────────────────────────────────────────
     A code and an answer are both "one word, typed by a person who is not
     being tested on spelling", so both come down to letters only. Anything
     else -- spaces, hyphens, a stray full stop, the capital letters somebody
     copied -- is thrown away before comparing. */
  function letters(s) { return String(s || '').toLowerCase().replace(/[^a-z]/g, ''); }

  /* djb2, and the same eight hex digits make-guild.py computes. The XOR's own
     ToInt32 does the 32-bit masking the Python side writes out by hand. This is
     not a lock and is not pretending to be one -- see make-guild.py's note on
     what it is actually for. */
  function sum(code) {
    var h = 5381, up = String(code).toUpperCase();
    for (var i = 0; i < up.length; i++) h = ((h * 33) ^ up.charCodeAt(i)) >>> 0;
    var s = h.toString(16);
    while (s.length < 8) s = '0' + s;
    return s;
  }

  /* ── Noise ──────────────────────────────────────────────────────────────
     Synthesised, never a hosted file, and built inside the handler so that no
     AudioContext exists until somebody has pressed hand in. A fanfare is a
     handful of notes rather than the stim box's single blip, so it is its own
     instrument rather than a second caller of somebody else's. */
  var ctx = null;
  function flourish(notes) {
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      var t0 = ctx.currentTime;
      notes.forEach(function (n, i) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        var t = t0 + i * 0.11;
        o.type = 'triangle';
        o.frequency.setValueAtTime(n, t);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.13, t + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
        o.connect(g); g.connect(ctx.destination);
        o.start(t); o.stop(t + 0.46);
      });
    } catch (e) { /* no audio available: the words are the whole message anyway */ }
  }

  function level() {
    return document.documentElement.getAttribute('data-intensity') || 'regular';
  }

  /* ── The markers, in every room ─────────────────────────────────────────── */
  function markers() {
    var all = document.querySelectorAll('.quest');
    if (!all.length) return;

    for (var i = 0; i < all.length; i++) (function (q) {
      var try_ = q.querySelector('.quest__try');
      if (!try_) return;                       /* an ungated marker: nothing to add */

      var input = q.querySelector('.quest__in');
      var check = q.querySelector('.quest__check');
      var said = q.querySelector('.quest__said');
      var won = q.querySelector('.quest__won');
      var accepted = (q.dataset.accept || '').split('|').filter(Boolean);

      try_.hidden = false;                     /* the control exists now, so show it */

      function judge() {
        var got = letters(input.value);
        if (!got) {
          said.textContent = 'Type a word in the box and press Check.';
          return;
        }
        var ok = accepted.indexOf(got) >= 0;
        /* One plural's worth of slack, so nobody loses on an s. The accept list
           in the data does the rest of the work -- variations are written down
           rather than guessed at by a stemmer that would also accept the wrong
           thing. */
        if (!ok && got.charAt(got.length - 1) === 's') {
          ok = accepted.indexOf(got.slice(0, -1)) >= 0;
        }
        if (ok) {
          if (won) won.hidden = false;
          /* The box STAYS on the page. It holds the only live region in this
             marker, so emptying it or hiding it would mean a screen reader was
             told nothing at the one moment there is something to say -- and
             somebody may reasonably want to see what they typed. */
          said.textContent = 'That is the one. The quest code is just below.';
          if (input) input.readOnly = true;
          if (check) check.disabled = true;
        } else {
          /* No counting of wrong tries, and no locking anybody out. The way
             through is the hints and the escape, both of which are open the
             whole time and neither of which costs anything. */
          said.textContent = 'Not that one. The hints are under this box, and ' +
            'so is the answer if you would rather just have it.';
        }
      }

      if (check) check.addEventListener('click', judge);
      if (input) input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); judge(); }
      });
    })(all[i]);
  }

  /* ── The board ──────────────────────────────────────────────────────────── */
  function board() {
    var board = document.querySelector('.guild-board');
    if (!board) return;

    var jobs = board.querySelectorAll('.job');
    var input = document.querySelector('.hand__in');
    var press = document.querySelector('.hand__do');
    var said = document.querySelector('.hand__said');
    var sky = document.querySelector('.guild-sparks');
    var forget = document.querySelector('.hand__forget');
    var warn = document.querySelector('.hand__nostore');

    /* A board that cannot remember is not broken, but it is not what it looks
       like either, so it says which one it is before somebody finds out by
       coming back tomorrow. */
    if (warn && !storageWorks()) warn.hidden = false;

    function jobFor(code) {
      var s = sum(letters(code));
      for (var i = 0; i < jobs.length; i++) {
        if (jobs[i].dataset.sum === s) return jobs[i];
      }
      return null;
    }

    function stamp(li, fresh) {
      var mark = li.querySelector('.job__stamp');
      var learned = li.querySelector('.job__done');
      li.classList.add('job--done');
      if (mark) mark.hidden = false;
      if (learned) learned.hidden = false;
      if (fresh && level() !== 'gentle') li.classList.add('job--just');
    }

    /* Everything already handed in, drawn on arrival. Nothing sounds and
       nothing sparks here: this is the page loading, not a press. */
    var have = done();
    for (var i = 0; i < jobs.length; i++) {
      if (have.indexOf(jobs[i].dataset.quest) >= 0) stamp(jobs[i], false);
    }

    /* Sparks. Plain spans that rise and fade, moved with `top` and a translate
       rather than a rotation, so what check-gentle.py measures is what is
       actually happening. Nothing flashes and nothing strobes -- see the note
       at the head of this file. MAX only. */
    function sparks() {
      if (!sky || level() !== 'max') return;
      sky.textContent = '';
      for (var i = 0; i < 18; i++) {
        var s = document.createElement('span');
        s.className = 'guild-spark';
        s.style.left = (4 + Math.random() * 92) + '%';
        s.style.animationDelay = (Math.random() * 0.4).toFixed(2) + 's';
        sky.appendChild(s);
      }
      window.setTimeout(function () { if (sky) sky.textContent = ''; }, 2600);
    }

    function fanfare() {
      var lv = level();
      if (lv === 'regular') flourish([523.25, 783.99]);
      if (lv === 'max') { flourish([523.25, 659.25, 783.99, 1046.5]); sparks(); }
      /* Gentle adds nothing. The words below are identical at all three. */
    }

    function handIn() {
      var typed = letters(input ? input.value : '');
      if (!typed) {
        said.textContent = 'Type a quest code in the box. You get one from a job ' +
          'marker standing in whichever room the job is in.';
        return;
      }
      var li = jobFor(typed);
      if (!li) {
        said.textContent = '“' + (input.value || '').trim() + '” is not a code ' +
          'this board knows. Check the spelling — spaces and capitals do not matter, ' +
          'but the letters do. Every job below opens its own hints, and the last hint ' +
          'says exactly where its marker is.';
        return;
      }

      var id = li.dataset.quest;
      var title = li.querySelector('.job__title');
      var name = title ? title.textContent : 'that job';
      var list = done();

      if (list.indexOf(id) >= 0) {
        said.textContent = 'You have already handed that one in — ' + name +
          '. It stays done; there was never anything to do twice.';
        li.scrollIntoView({ block: 'center' });
        return;
      }

      list.push(id);
      var kept = remember(list);
      stamp(li, true);
      fanfare();
      said.textContent = 'Done: ' + name + '.' +
        (kept ? ' The board has stamped it.'
              : ' Your browser is not letting this page remember anything, so the ' +
                'stamp will go when you leave — the code still works next time.');
      if (input) input.value = '';
      li.scrollIntoView({ block: 'center' });
    }

    if (press) press.addEventListener('click', handIn);
    if (input) input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); handIn(); }
    });

    /* A marker links here with its code in the query string, which puts the word
       in the box and stops. The press is still the visitor's: it is what the
       fanfare is consented by, and a link that redeemed itself would make a
       noise nobody asked for. */
    try {
      var q = new URLSearchParams(window.location.search).get('code');
      if (q && input) {
        input.value = q.toUpperCase().replace(/[^A-Z]/g, '');
        said.textContent = 'That code came with you from a room. Press hand it in ' +
          'when you are ready.';
        input.focus();
      }
    } catch (e) { /* an old browser without URLSearchParams: the box still works */ }

    if (forget) forget.addEventListener('click', function () {
      try { localStorage.removeItem(KEY); } catch (e) {}
      for (var i = 0; i < jobs.length; i++) {
        jobs[i].classList.remove('job--done', 'job--just');
        var m = jobs[i].querySelector('.job__stamp');
        var d = jobs[i].querySelector('.job__done');
        if (m) m.hidden = true;
        if (d) d.hidden = true;
      }
      said.textContent = 'Forgotten. Every stamp is off the board and nothing was ' +
        'kept anywhere else — this was only ever in your own browser.';
    });
  }

  function go() { markers(); board(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', go);
  } else { go(); }
})();

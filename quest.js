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

   THE BOARD'S BOOKKEEPING IS THREE THINGS NOW (Ryan's brief, 2026-10-14), and
   none of them is a number. The filter shows done jobs, not-done jobs or every
   job, and never says how many. A badge is worked out from the stamps every
   time and kept nowhere; two are worked out from the shelters instead, from
   the animals this browser rescued and from whether your Profile has a pet. And signed on to the CB, Keep my jobs in my Profile
   keeps them there as well, once it is switched on and never before.

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

  /* ── The CB, for the board only ────────────────────────────────────────
     Ryan's brief, 2026-10-14: the jobs you hand in can be kept in your Profile
     on the CB. NOTHING IS SENT UNTIL SOMEBODY SWITCHES THAT ON. A page with no
     pass in love-cb never calls anything; a page with one asks /cb/jobs once,
     on arrival, whether the Profile is keeping them, which is the same pass the
     radio on this page is already sending. Everything goes through call(), to
     /cb/jobs and nowhere else, and love-cb is the radio's: this file reads it
     and never writes it. tools/make-guild.py reads this file for all of that. */
  var PASS_KEY = 'love-cb';
  var JOBS = '/cb/jobs';
  var RESCUES_KEY = 'love-rescues';

  /* WHETHER THIS BROWSER HAS RESCUED ANYBODY, for Rescue Ranger. The shelters
     keep the animals you rescued under love-rescues, in your browser, and
     nothing anywhere else knows who rescued which animal. Read, never
     written, turned into yes or no here, and never sent. */
  function rescuedHere() {
    try { var v = JSON.parse(localStorage.getItem(RESCUES_KEY) || '[]'); return Array.isArray(v) && v.length > 0; }
    catch (e) { return false; }
  }

  function pass() {
    try { var v = JSON.parse(localStorage.getItem(PASS_KEY) || 'null'); return v && v.pass ? v : null; }
    catch (e) { return null; }
  }

  function call(payload) {
    var me = pass();
    if (!me) return Promise.resolve({ status: 0, body: {} });
    var opts = { method: payload ? 'POST' : 'GET', credentials: 'omit', cache: 'no-store',
      headers: { 'accept': 'application/json', 'authorization': 'Bearer ' + me.pass } };
    if (payload) { opts.headers['content-type'] = 'application/json'; opts.body = JSON.stringify(payload); }
    return fetch(JOBS, opts).then(function (r) {
      return r.json().then(function (b) { return { status: r.status, body: b || {} }; },
        function () { return { status: r.status, body: {} }; });
    }, function () { return { status: -1, body: {} }; });
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
    var badges = document.querySelectorAll('.badge');

    /* A board that cannot remember is not broken, but it is not what it looks
       like either, so it says which one it is before somebody finds out by
       coming back tomorrow. */
    if (warn && !storageWorks()) warn.hidden = false;

    /* What is done is what this browser stamped, and, while the Profile is
       keeping them, what the Profile holds: the same jobs on any device. */
    var local = done();
    var profile = null;          // the Profile's jobs while it keeps them, or null
    var rescued = rescuedHere(); // Rescue Ranger: this browser has rescued somebody
    var adopted = false;         // Pet Parent: the Profile has a pet, which only a signed-on page can ask
    function isDone(id) {
      return local.indexOf(id) >= 0 || (!!profile && profile.indexOf(id) >= 0);
    }

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

    function unstamp(li) {
      li.classList.remove('job--done', 'job--just');
      var m = li.querySelector('.job__stamp');
      var d = li.querySelector('.job__done');
      if (m) m.hidden = true;
      if (d) d.hidden = true;
    }

    /* A BADGE IS WORKED OUT, NEVER KEPT: which badges are yours is asked of
       the stamps every time, so there is nothing to count and nothing to lose
       but the jobs. Its own list marks the done ones with the board's word, and
       nothing here says how many are left. */
    function hasBadge(b) {
      if (b.dataset.from === 'rescues') return rescued;
      if (b.dataset.from === 'pets') return adopted;
      var want = (b.dataset.jobs || '').split(' ').filter(Boolean);
      if (b.dataset.needs === 'any') {
        if (!want.length) {
          for (var i = 0; i < jobs.length; i++) if (isDone(jobs[i].dataset.quest)) return true;
          return false;
        }
        return want.some(isDone);
      }
      return want.length > 0 && want.every(isDone);
    }

    function held() {
      var out = [];
      for (var i = 0; i < badges.length; i++) if (hasBadge(badges[i])) out.push(badges[i]);
      return out;
    }

    function drawBadges() {
      for (var i = 0; i < badges.length; i++) {
        var b = badges[i], yes = hasBadge(b);
        b.classList.toggle('badge--yours', yes);
        var st = b.querySelector('.badge__stamp');
        if (st) st.hidden = !yes;
        var rows = b.querySelectorAll('.badge__job');
        for (var j = 0; j < rows.length; j++) {
          var d = isDone(rows[j].dataset.quest);
          rows[j].classList.toggle('badge__job--done', d);
          var tick = rows[j].querySelector('.badge__tick');
          if (tick) tick.hidden = !d;
        }
      }
    }

    /* ── Done and not done ─────────────────────────────────────────────────
       The filter hides rows and never says how many it hid: a count of the
       jobs left is the total this board refuses, arriving as a convenience. */
    var filterBox = document.querySelector('.guild-filter');
    var filterSaid = document.querySelector('.guild-filter__said');
    var filterBtns = document.querySelectorAll('.guild-filter__btn');
    var showing = 'all';
    var spare = null;            // the job just handed in, left in view until the filter is pressed

    function applyFilter(speak) {
      var any = false;
      for (var i = 0; i < jobs.length; i++) {
        var id = jobs[i].dataset.quest, d = isDone(id);
        var show = showing === 'all' || (showing === 'done' ? d : !d) || id === spare;
        jobs[i].hidden = !show;
        if (show) any = true;
      }
      if (!speak || !filterSaid) return;
      var words = {
        all: 'Showing every job.',
        done: any ? 'Showing the jobs you have handed in.'
                  : 'You have not handed any job in on this board. Every job is under Every job.',
        todo: any ? 'Showing the jobs you have not handed in.'
                  : 'There is no job on this board you have not handed in.'
      };
      filterSaid.textContent = words[showing];
    }

    if (filterBox) {
      filterBox.hidden = false;                /* the control exists now, so show it */
      for (var f = 0; f < filterBtns.length; f++) filterBtns[f].addEventListener('click', function () {
        showing = this.dataset.show;
        spare = null;
        for (var k = 0; k < filterBtns.length; k++) {
          filterBtns[k].setAttribute('aria-pressed', String(filterBtns[k] === this));
        }
        applyFilter(true);
      });
    }

    /* Everything already handed in, drawn on arrival and again whenever the
       Profile answers. Nothing sounds and nothing sparks here: this is the page
       loading, not a press. */
    function redraw() {
      for (var i = 0; i < jobs.length; i++) {
        if (isDone(jobs[i].dataset.quest)) stamp(jobs[i], false);
        else unstamp(jobs[i]);
      }
      drawBadges();
      applyFilter(false);
    }
    redraw();

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

    function badgeName(b) {
      var n = b.querySelector('.badge__name');
      return n ? n.textContent : 'a badge';
    }

    /* ── Keeping them in your Profile ─────────────────────────────────────── */
    var cb = document.querySelector('.hand__cb');
    var cbWho = document.querySelector('.hand__cb-who');
    var keepBtn = document.querySelector('.hand__keep');
    var keepWhy = document.querySelector('.hand__keep-why');
    var sure = document.querySelector('.hand__keep-sure');
    var sureYes = document.querySelector('.hand__keep-yes');
    var sureNo = document.querySelector('.hand__keep-no');
    var bring = document.querySelector('.hand__bring');
    var cbSaid = document.querySelector('.hand__cb-said');
    var claimed = true;

    function trouble(r, nothing) {
      if (r.status === 0) return 'You are not signed on to the CB in this browser any more. ' + nothing;
      if (r.status === 401) return 'The password has changed since you signed on. Sign on again at the Community Center. ' + nothing;
      if (r.status === -1) return 'The street could not be reached just now. ' + nothing;
      return (r.body && typeof r.body.error === 'string') ? r.body.error + ' ' + nothing
        : 'That did not work just now. ' + nothing;
    }

    function drawCb() {
      if (!cb || !keepBtn) return;
      var on = !!profile;
      keepBtn.textContent = 'Keep my jobs in my Profile: ' + (on ? 'on' : 'off');
      keepBtn.setAttribute('aria-pressed', String(on));
      if (keepWhy) keepWhy.textContent = (on
        ? 'On: every job you hand in here is kept in your Profile on the CB as well as stamped in this browser. ' +
          'Profile, on the radio, is where you can show them, and the badges they make, to people on the CB. ' +
          'Switching this off deletes them from your Profile.'
        : 'Off: the jobs you hand in are stamped in this browser and sent nowhere. Switch it on and they are ' +
          'kept in your Profile on the CB as well, under your handle scrambled, so they follow you to any device ' +
          'you sign on with, and this browser’s stamps go with them. It keeps which jobs and nothing about when.') +
        (claimed ? '' : ' Your handle is not claimed, so anybody who signs on with it has these jobs too, until you claim it in Profile.');
      var extra = on ? local.filter(function (id) { return profile.indexOf(id) < 0; }) : [];
      if (bring) bring.hidden = !extra.length;
    }

    function fromAnswer(b) {
      profile = b && b.keeping && Array.isArray(b.jobs) ? b.jobs.slice() : null;
      if (b && typeof b.claimed === 'boolean') claimed = b.claimed;
      if (b && typeof b.adopted === 'boolean') adopted = b.adopted;
      drawCb();
      redraw();
    }

    var me = pass();
    if (cb && keepBtn && me) {
      cb.hidden = false;
      if (cbWho) cbWho.textContent = 'You are signed on to the CB as ' + me.handle + '.';
      keepBtn.disabled = true;
      if (keepWhy) keepWhy.textContent = 'Asking your Profile whether it keeps your jobs…';
      call(null).then(function (r) {
        keepBtn.disabled = false;
        if (r.status === 200) { fromAnswer(r.body); return; }
        drawCb();
        if (cbSaid) cbSaid.textContent = trouble(r, 'Your stamps here still work.');
      });

      keepBtn.addEventListener('click', function () {
        if (profile) { if (sure) { sure.hidden = false; keepBtn.hidden = true; if (sureNo) sureNo.focus(); } return; }
        keepBtn.disabled = true;
        call({ keep: true, done: local }).then(function (r) {
          keepBtn.disabled = false;
          if (r.status === 200) {
            fromAnswer(r.body);
            if (cbSaid) cbSaid.textContent = 'Kept. Your Profile has every job this browser had stamped, and every job you hand in from now on.';
            return;
          }
          if (cbSaid) cbSaid.textContent = trouble(r, 'Nothing was kept.');
        });
      });
      if (sureNo) sureNo.addEventListener('click', function () {
        sure.hidden = true; keepBtn.hidden = false; keepBtn.focus();
      });
      if (sureYes) sureYes.addEventListener('click', function () {
        sureYes.disabled = true;
        call({ keep: false }).then(function (r) {
          sureYes.disabled = false;
          sure.hidden = true; keepBtn.hidden = false; keepBtn.focus();
          if (r.status === 200) {
            fromAnswer(r.body);
            if (cbSaid) cbSaid.textContent = 'Stopped. Your Profile keeps no jobs now; the stamps in this browser are still here.';
            return;
          }
          if (cbSaid) cbSaid.textContent = trouble(r, 'Nothing was deleted.');
        });
      });
      if (bring) bring.addEventListener('click', function () {
        if (!profile) return;
        bring.disabled = true;
        call({ done: local }).then(function (r) {
          bring.disabled = false;
          if (r.status === 200) {
            fromAnswer(r.body);
            if (cbSaid) cbSaid.textContent = 'Your Profile has this browser’s stamps as well now.';
            keepBtn.focus();
            return;
          }
          if (r.status === 409) fromAnswer({ keeping: false });
          if (cbSaid) cbSaid.textContent = trouble(r, 'Nothing was kept.');
        });
      });
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

      if (isDone(id)) {
        said.textContent = 'You have already handed that one in — ' + name +
          '. It stays done; there was never anything to do twice.';
        spare = id;
        applyFilter(false);
        li.scrollIntoView({ block: 'center' });
        return;
      }

      var before = held();
      var list = done();
      list.push(id);
      var kept = remember(list);
      local = list;
      stamp(li, true);
      spare = id;
      drawBadges();
      applyFilter(false);
      var made = held().filter(function (b) { return before.indexOf(b) < 0; });
      fanfare();
      said.textContent = 'Done: ' + name + '.' +
        (made.length ? ' That makes ' + made.map(function (b) { return 'the ' + badgeName(b) + ' badge'; }).join(' and ') + ' yours.' : '') +
        (kept ? ' The board has stamped it.'
              : ' Your browser is not letting this page remember anything, so the ' +
                'stamp will go when you leave — the code still works next time.');
      if (input) input.value = '';
      li.scrollIntoView({ block: 'center' });

      if (profile) {
        call({ done: [id] }).then(function (r) {
          if (r.status === 200) { fromAnswer(r.body); return; }
          if (r.status === 409) fromAnswer({ keeping: false });
          if (cbSaid) cbSaid.textContent = trouble(r, 'This job is stamped in this browser, and was not kept in your Profile.');
        });
      }
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
      local = [];
      spare = null;
      redraw();
      drawCb();
      said.textContent = profile
        ? 'Forgotten here: every stamp this browser kept is gone. Your Profile on the CB still keeps its ' +
          'jobs, so they are still stamped while you are signed on; switching Keep my jobs in my Profile off ' +
          'deletes those.'
        : 'Forgotten. Every stamp is off the board and nothing was kept anywhere else — this was only ' +
          'ever in your own browser.';
    });
  }

  function go() { markers(); board(); }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', go);
  } else { go(); }
})();

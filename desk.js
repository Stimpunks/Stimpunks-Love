/* =============================================================================
   The moderators' desk in the Moderators' room: make and delete invites; look
   up one username by name, give it a reset code, delete it, or clear its
   profile card; read the direct messages people have reported, and close
   them; and read the calls for a moderator members made (2026-10-23), and
   close them. Ryan's calls, 2026-09-30: accounts with no email, recovery codes, and
   moderators able to reset or delete, here; 2026-10-18, clearing one card that
   breaks the covenant without deleting the username it is on; and 2026-10-21,
   invites in place of the starter password, which the desk makes and deletes.
   An invite counts its uses and never says who used it. And the same day,
   roles: an administrator gives and takes them here (/cb/roles). And on
   2026-10-23, the notice along the top of the street's front
   page, the Community Center, the forums and the office's dashboard (/cb/notice).

   IT OPENS ONLY FOR A BASE PASS, and the server refuses anybody else whatever
   this page shows: this file is the page keeping quiet, never the lock. It
   reads love-cb and never writes it.

   EVERYBODY (Ryan's ask and call, 2026-10-22, reversing "there is no list of
   everybody", after moderators asked for it for safeguarding): every username,
   how many there are, and who is seen in a room now by Be seen here's rules,
   fetched when a moderator presses for it and never on arrival. A name opens
   its profile, as a handle on the channel does. Kick, time out and ban came
   the same day, on the username looked up. A reset code is shown once, to be
   passed on privately after the moderator has made sure who they are talking
   to; the server keeps only its hash. Every destructive press asks once more.
   ============================================================================= */
(function () {
  'use strict';

  var desk = document.getElementById('md-desk');
  var off = document.getElementById('md-desk-off');
  if (!desk) return;
  var me = null;
  try { me = JSON.parse(localStorage.getItem('love-cb') || 'null'); } catch (e) {}
  // A base pass from the moderators' password is good only for claiming now.
  if (!me || !me.pass || !/^cb2\.base\./.test(me.pass)) return;
  desk.hidden = false;
  if (off) off.hidden = true;

  var nameBox = document.getElementById('md-desk-name');
  var find = document.getElementById('md-desk-find');
  var found = document.getElementById('md-desk-found');
  var said = document.getElementById('md-desk-said');
  function say(t) { said.textContent = t; }

  function call(send) {
    return fetch('/cb/account/admin', {
      method: 'POST', credentials: 'omit', cache: 'no-store',
      headers: { 'accept': 'application/json', 'content-type': 'application/json', 'authorization': 'Bearer ' + me.pass },
      body: JSON.stringify(send),
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (b) { return { status: r.status, body: b }; });
    });
  }
  function why(r, otherwise) {
    if (r && r.body && typeof r.body.error === 'string' && r.body.error) return r.body.error;
    if (r && (r.status === 404 || r.status === 405)) return 'The desk is not on this server. It only answers on stimpunks.world itself.';
    return otherwise;
  }

  function el(tag, text, cls) { var e = document.createElement(tag); if (text) e.textContent = text; if (cls) e.className = cls; return e; }
  function button(text) { var b = el('button', text); b.type = 'button'; return b; }

  /* Ask once more: a sentence, a yes and a no, the keyboard on the no. */
  function confirmThen(sentence, yesText, act) {
    var box = el('div');
    box.appendChild(el('p', sentence));
    var yes = button(yesText), no = button('Not now');
    box.appendChild(yes); box.appendChild(no);
    found.appendChild(box);
    no.focus();
    no.addEventListener('click', function () { box.remove(); });
    yes.addEventListener('click', function () { box.remove(); act(); });
  }

  // How much longer a time out has, or that a ban holds until it is lifted.
  function barSaid(bar) {
    if (!bar) return '';
    if (bar.until === 0) return 'Banned, until a moderator lifts it.';
    var t = '';
    try { t = new Date(bar.until).toLocaleString(undefined, { weekday: 'long', hour: 'numeric', minute: '2-digit', day: 'numeric', month: 'long' }); } catch (e) {}
    return 'Timed out until ' + t + '.';
  }
  function profileButton(handle, mod) {
    var b = button('Open ' + handle + '\u2019s profile');
    b.addEventListener('click', function () {
      if (window.loveRadioPeek) window.loveRadioPeek(handle, b, { base: !!mod, claimed: !mod });
      else say('Profiles open from the radio on this page. Bring the radio back here if it is in a window of its own.');
    });
    return b;
  }
  var SPANS = [['10m', 'ten minutes'], ['1h', 'an hour'], ['1d', 'a day'], ['1w', 'a week']];

  function show(handle, a) {
    found.textContent = '';
    if (!a.claimed) {
      found.appendChild(el('p', a.mod
        ? handle + ' is a moderator\u2019s handle, not claimed yet. Its moderator claims it on the joining page, with the moderators\u2019 password.'
        : handle + ' has not been claimed, so nobody can sign on as it. Anybody with an invite can join as it.'));
      return;
    }
    var since = '';
    try { since = new Date(a.since).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) {}
    if (a.mod) {
      found.appendChild(el('p', a.handle + ' is a moderator\u2019s username, on their own password since ' + since + '. The desk does not reset or delete a moderator\u2019s username, or clear its card, because a reset code would let one moderator sign on as another, roles and all. They use their own recovery code, or Ryan or Helen moves them back.'));
      return;
    }
    var about = el('p', a.handle + ' is claimed, since ' + since + (a.card ? ', and has a profile card.' : ', with no profile card.') + (a.bar ? ' ' + barSaid(a.bar) : ''));
    found.appendChild(about);
    var look = el('p'); look.appendChild(profileButton(a.handle, false));
    found.appendChild(look);
    var reset = button('Give ' + a.handle + ' a reset code'), del = button('Delete ' + a.handle);
    var row = el('p'); row.appendChild(reset); row.appendChild(del);
    var card = a.card ? button('Clear ' + a.handle + '\u2019s profile card') : null;
    if (card) row.appendChild(card);
    found.appendChild(row);
    /* KICK, TIME OUT, BAN (2026-10-22). Each signs every device off at once.
       A time out and a ban keep until when and nothing else, so tell them why
       yourself if you can. Lifting one asks nothing more: it takes nothing away. */
    var off = el('p');
    var kick = button('Kick ' + a.handle);
    off.appendChild(kick);
    var span = null, timeout = null, ban = null, lift = null;
    if (a.bar) {
      lift = button(a.bar.until === 0 ? 'Lift the ban on ' + a.handle : 'Lift ' + a.handle + '\u2019s time out');
      off.appendChild(lift);
    } else {
      var lab = el('label', 'For', 'md-desk__lab md-desk__lab--inline');
      span = el('select', null, 'md-desk__in');
      span.id = 'md-desk-span';
      lab.htmlFor = span.id;
      SPANS.forEach(function (x) { var o = el('option', x[1]); o.value = x[0]; if (x[0] === '1d') o.selected = true; span.appendChild(o); });
      timeout = button('Time out ' + a.handle);
      ban = button('Ban ' + a.handle);
      off.appendChild(lab); off.appendChild(span); off.appendChild(timeout); off.appendChild(ban);
    }
    found.appendChild(off);
    function act(send, doing, done, failed) {
      say(doing);
      call(send).then(function (r) {
        if (r.status !== 200) { say(why(r, failed)); return; }
        lookUp(done);
      }, function () { say('The desk could not be reached. ' + failed); });
    }
    kick.addEventListener('click', function () {
      confirmThen('This signs ' + a.handle + ' off every device at once. They can sign straight back on with their own password, and their notifications stay off until they switch them on again. Nothing tells them why, so tell them yourself if you can.',
        'Kick ' + a.handle, function () { act({ action: 'kick', handle: a.handle }, 'Signing them off\u2026', a.handle + ' is signed off everywhere. They can sign back on.', 'Nothing was changed.'); });
    });
    if (timeout) timeout.addEventListener('click', function () {
      var pick = SPANS.filter(function (x) { return x[0] === span.value; })[0] || SPANS[2];
      confirmThen('This signs ' + a.handle + ' off every device and keeps them off the CB for ' + pick[1] + ': the channel, messages, the forums and everything else that needs signing on, reading included. Signing on, they are told a moderator timed them out, for how much longer and where to reach us, and nothing else. Nothing records who did it or why.',
        'Time them out for ' + pick[1], function () { act({ action: 'timeout', handle: a.handle, 'for': pick[0] }, 'Timing them out\u2026', a.handle + ' is timed out for ' + pick[1] + '.', 'Nothing was changed.'); });
    });
    if (ban) ban.addEventListener('click', function () {
      confirmThen('This signs ' + a.handle + ' off every device and keeps the username off the CB until a moderator lifts the ban. The username stays theirs, with everything under it, and nobody else can claim it. A ban holds the name, not the person: with another invite they could join under another. Nothing records who did it or why.',
        'Ban ' + a.handle, function () { act({ action: 'ban', handle: a.handle }, 'Banning\u2026', a.handle + ' is banned until a moderator lifts it.', 'Nothing was changed.'); });
    });
    if (lift) lift.addEventListener('click', function () {
      act({ action: 'lift', handle: a.handle }, 'Lifting it\u2026', a.handle + ' can sign on again, with their own password.', 'Nothing was changed.');
    });
    reset.addEventListener('click', function () {
      confirmThen('This signs ' + a.handle + ' off everywhere and makes a one-time code, good for a day, that lets them set a new password at the Community Center. Only do it once you are sure you are talking to them.',
        'Make the reset code', function () {
          say('Making it…');
          call({ action: 'reset', handle: a.handle }).then(function (r) {
            if (r.status !== 200) { say(why(r, 'That did not work. Nothing was changed.')); return; }
            say('');
            found.appendChild(el('p', 'The reset code for ' + a.handle + ', shown once. Pass it on privately. It works at the Community Center, under "Forgotten the password", until this time tomorrow:'));
            var code = el('p', r.body.code, 'md-desk__code');
            found.appendChild(code);
          }, function () { say('The desk could not be reached. Nothing was changed.'); });
        });
    });
    del.addEventListener('click', function () {
      confirmThen('This deletes ' + a.handle + '’s username, its password and its pets, and signs them off. Anybody can claim the name afterwards. It cannot be undone.',
        'Delete ' + a.handle, function () {
          say('Deleting…');
          call({ action: 'delete', handle: a.handle }).then(function (r) {
            if (r.status !== 200) { say(why(r, 'That did not work. Nothing was deleted.')); return; }
            found.textContent = '';
            say(a.handle + ' is deleted, with its password and its pets.');
          }, function () { say('The desk could not be reached. Nothing was deleted.'); });
        });
    });
    /* For a card that breaks the covenant. The username and everything else
       under it stay; nothing is kept about the clearing. */
    if (card) card.addEventListener('click', function () {
      confirmThen('This clears ' + a.handle + '\u2019s profile card: its theme, banner, decoration, name face, nameplate, pronouns, bio, links and favourite room, and takes the nameplate off Who\u2019s online. Their username, password, pets, avatars, jobs and patches stay, and they can fill in a new card. Nothing tells them it was cleared. It cannot be undone.',
        'Clear the card', function () {
          say('Clearing…');
          call({ action: 'clearCard', handle: a.handle }).then(function (r) {
            if (r.status !== 200) { say(why(r, 'That did not work. Nothing was cleared.')); return; }
            card.remove();
            about.textContent = a.handle + ' is claimed, since ' + since + ', with no profile card.';
            say(r.body.had
              ? a.handle + '\u2019s profile card is cleared. Their username and everything else under it are as they were.'
              : a.handle + ' had no profile card by then. Nothing else was changed.');
          }, function () { say('The desk could not be reached. Nothing was cleared.'); });
        });
    });
  }

  // `after`: what to say once it is shown again, after something was done to it.
  function lookUp(after) {
    var handle = nameBox.value.trim();
    if (!handle) { say('Type the username you were asked about.'); nameBox.focus(); return; }
    say('Looking…');
    found.textContent = '';
    call({ action: 'find', handle: handle }).then(function (r) {
      if (r.status !== 200) { say(why(r, 'That did not work just now.')); return; }
      say(typeof after === 'string' ? after : '');
      show(handle, r.body);
    }, function () { say('The desk could not be reached just now.'); });
  }
  find.addEventListener('click', function () { lookUp(); });
  nameBox.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); lookUp(); } });

  /* EVERYBODY (Ryan's ask and call, 2026-10-22): every username and how many,
     and who is seen in a room now, with the rooms. Seen means pressed Be seen
     here, so everybody else may be on the CB too, and the list says so rather
     than calling them offline. Fetched on a press, never on arrival; the
     filter narrows what is drawn and sends nothing. A name opens its profile;
     At the desk looks it up below, where everything that acts on it is. */
  (function () {
    var box = document.getElementById('md-everybody');
    var pOff = document.getElementById('md-everybody-off');
    var load = document.getElementById('md-everybody-load');
    var list = document.getElementById('md-everybody-list');
    var pSaid = document.getElementById('md-everybody-said');
    var filter = document.getElementById('md-everybody-filter');
    if (!box || !load || !list || !filter) return;
    box.hidden = false;
    if (pOff) pOff.hidden = true;
    function pSay(t) { pSaid.textContent = t; }
    var names = null;
    // Room names: the street's, and the forum categories this pass may enter.
    function roomNames() {
      if (names) return Promise.resolve(names);
      names = {};
      var street = fetch('/cb-rooms.json', { credentials: 'omit' }).then(function (r) { return r.ok ? r.json() : {}; }).then(function (b) {
        (b.rooms || []).forEach(function (x) { names[x.tag] = x.name; });
      }, function () {});
      var forums = fetch('/cb/rooms', { credentials: 'omit', cache: 'no-store', headers: { 'accept': 'application/json', 'authorization': 'Bearer ' + me.pass } })
        .then(function (r) { return r.ok ? r.json() : {}; }).then(function (b) {
          (b.rooms || []).forEach(function (x) { if (x && x.tag) names[x.tag] = x.name; });
        }, function () {});
      return Promise.all([street, forums]).then(function () { return names; });
    }
    function roomsSaid(rooms) {
      return rooms.map(function (t) { return '#' + (names[t] || t); }).join(', ');
    }
    function row(p) {
      var li = el('li', null, 'md-person');
      li.dataset.name = p.handle.toLowerCase();
      var line = el('p', null, 'md-person__line');
      var who = button(p.handle);
      who.className = 'md-person__name';
      who.setAttribute('aria-label', 'Open ' + p.handle + '’s profile');
      who.addEventListener('click', function () {
        if (window.loveRadioPeek) window.loveRadioPeek(p.handle, who, { base: !!p.mod, claimed: !p.mod });
        else pSay('Profiles open from the radio on this page. Bring the radio back here if it is in a window of its own.');
      });
      line.appendChild(who);
      var marks = [];
      if (p.mod) marks.push('Moderator');
      if (p.bar) marks.push(p.bar.until === 0 ? 'Banned' : 'Timed out');
      if (p.rooms.length) marks.push('Seen in ' + roomsSaid(p.rooms));
      if (marks.length) line.appendChild(el('span', marks.join('. ') + '.', 'md-person__marks'));
      if (!p.mod) {
        var desk = button('At the desk');
        desk.className = 'md-person__desk';
        desk.setAttribute('aria-label', 'Look ' + p.handle + ' up at the desk');
        desk.addEventListener('click', function () { nameBox.value = p.handle; lookUp(); nameBox.focus(); });
        line.appendChild(desk);
      }
      li.appendChild(line);
      return li;
    }
    function part(title, people, none) {
      var wrap = el('div', null, 'md-people__part');
      wrap.appendChild(el('h3', title, 'md-people__h'));
      if (!people.length) { wrap.appendChild(el('p', none, 'md-call__fine')); return wrap; }
      var ul = el('ul', null, 'md-people');
      people.forEach(function (p) { ul.appendChild(row(p)); });
      wrap.appendChild(ul);
      return wrap;
    }
    function draw(b) {
      list.textContent = '';
      var people = b.people || [];
      var seen = people.filter(function (p) { return p.rooms.length; });
      var rest = people.filter(function (p) { return !p.rooms.length; });
      list.appendChild(el('p', b.count + (b.count === 1 ? ' username' : ' usernames') + ' on the CB. ' + b.seen + ' of them seen in a room now.', 'md-people__count'));
      list.appendChild(part('Seen in a room now (' + seen.length + ')', seen, 'Nobody has pressed Be seen here anywhere just now.'));
      list.appendChild(part('Everybody else (' + rest.length + ')', rest, 'Everybody is seen somewhere just now.'));
      narrow();
      load.textContent = 'Show everybody again';
    }
    function narrow() {
      var q = filter.value.trim().toLowerCase(), shown = 0, all = 0;
      Array.prototype.forEach.call(list.querySelectorAll('.md-person'), function (li) {
        all++;
        var on = !q || li.dataset.name.indexOf(q) >= 0;
        li.hidden = !on;
        if (on) shown++;
      });
      if (q && all) pSay(shown === 0 ? 'No name has “' + filter.value.trim() + '” in it.' : shown + (shown === 1 ? ' name has' : ' names have') + ' “' + filter.value.trim() + '” in it.');
      else if (!q) pSay('');
    }
    filter.addEventListener('input', narrow);
    load.addEventListener('click', function () {
      pSay('Looking…');
      Promise.all([call({ action: 'directory' }), roomNames()]).then(function (got) {
        var r = got[0];
        if (r.status !== 200) { pSay(why(r, 'The list could not be fetched just now.')); return; }
        pSay('');
        draw(r.body);
      }, function () { pSay('The desk could not be reached just now.'); });
    });
  }());

  /* INVITES (Ryan's brief, 2026-10-21): make one with a note, how many people
     may join with it and when it runs out; see every one with its link and how
     many times it has been used; delete one, which asks once more. The list is
     fetched when a moderator presses for it, or after making one, never on
     arrival. Nothing here says who joined with which invite, because nothing
     anywhere knows. */
  (function () {
    var box = document.getElementById('md-invites');
    var iOff = document.getElementById('md-invites-off');
    var list = document.getElementById('md-invites-list');
    var iSaid = document.getElementById('md-invites-said');
    var make = document.getElementById('md-invites-make');
    var load = document.getElementById('md-invites-load');
    if (!box || !list || !make || !load) return;
    box.hidden = false;
    if (iOff) iOff.hidden = true;
    function iSay(t) { iSaid.textContent = t; }
    function inviteCall(send) {
      return fetch('/cb/invites', {
        method: 'POST', credentials: 'omit', cache: 'no-store',
        headers: { 'accept': 'application/json', 'content-type': 'application/json', 'authorization': 'Bearer ' + me.pass },
        body: JSON.stringify(send),
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (b) { return { status: r.status, body: b }; });
      });
    }
    function day(t) {
      try { return new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return ''; }
    }
    function linkOf(code) { return location.origin + '/join.html#invite=' + code; }
    function draw(invites, made) {
      list.textContent = '';
      if (!invites.length) { list.appendChild(el('p', 'There are no invites. Make one above.')); return null; }
      var ul = el('ul', null, 'md-invites'), first = null;
      invites.forEach(function (v) {
        var li = el('li', null, 'md-invite' + (v.state === 'open' ? '' : ' md-invite--done'));
        li.appendChild(el('p', v.note || 'No note', 'md-invite__note'));
        var uses = v.most ? 'Used ' + v.used + ' of ' + v.most + (v.most === 1 ? ' time' : ' times') : 'Used ' + v.used + (v.used === 1 ? ' time' : ' times') + ', no limit';
        var ends = v.until ? (v.state === 'ended' ? 'Ran out on ' + day(v.until) : 'Runs out on ' + day(v.until)) : 'Never runs out';
        var state = v.state === 'open' ? 'Works.' : v.state === 'used' ? 'Used up: it lets nobody else in.' : 'Ran out: it lets nobody else in.';
        li.appendChild(el('p', state + ' ' + uses + '. ' + ends + '. Made by ' + v.by + ' on ' + day(v.made) + '. The code is ' + v.code + '.', 'md-invite__about'));
        var lab = el('label', 'Its link', 'md-desk__lab');
        var id = 'md-invite-' + v.id;
        lab.htmlFor = id;
        var input = el('input', null, 'md-desk__in md-invite__link');
        input.id = id; input.type = 'text'; input.readOnly = true; input.value = linkOf(v.code);
        input.addEventListener('focus', function () { input.select(); });
        li.appendChild(lab); li.appendChild(input);
        var row = el('p');
        var copy = button('Copy the link'), del = button('Delete this invite');
        row.appendChild(copy); row.appendChild(del);
        li.appendChild(row);
        copy.addEventListener('click', function () {
          var done = function () { iSay('Copied the link' + (v.note ? ' for ' + v.note : '') + '.'); };
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(input.value).then(done, function () { input.focus(); iSay('This browser would not copy it. The link is selected: copy it from there.'); });
          else { input.focus(); iSay('The link is selected: copy it from there.'); }
        });
        del.addEventListener('click', function () {
          var ask = el('div');
          ask.appendChild(el('p', 'This stops the invite working at once. The usernames made with it stay. It cannot be undone.'));
          var yes = button('Delete it'), no = button('Not now');
          ask.appendChild(yes); ask.appendChild(no);
          li.appendChild(ask);
          no.focus();
          no.addEventListener('click', function () { ask.remove(); del.focus(); });
          yes.addEventListener('click', function () {
            iSay('Deleting…');
            inviteCall({ delete: v.id }).then(function (r) {
              if (r.status !== 200) { iSay(why(r, 'That did not work. Nothing was deleted.')); return; }
              draw(r.body.invites || []);
              iSay('Deleted. That invite lets nobody in now.');
              load.focus();
            }, function () { iSay('The desk could not be reached. Nothing was deleted.'); });
          });
        });
        if (v.id === made) first = input;
        ul.appendChild(li);
      });
      list.appendChild(ul);
      load.textContent = 'Show them again';
      return first;
    }
    load.addEventListener('click', function () {
      iSay('Looking…');
      inviteCall({}).then(function (r) {
        if (r.status !== 200) { iSay(why(r, 'The invites could not be fetched just now.')); return; }
        iSay('');
        draw(r.body.invites || []);
      }, function () { iSay('The desk could not be reached just now.'); });
    });
    make.addEventListener('click', function () {
      var note = document.getElementById('md-invites-note');
      var most = Number(document.getElementById('md-invites-most').value);
      var days = Number(document.getElementById('md-invites-days').value);
      iSay('Making it…');
      make.disabled = true;
      inviteCall({ make: { note: note.value, most: most, days: days } }).then(function (r) {
        make.disabled = false;
        if (r.status !== 200) { iSay(why(r, 'That did not work. No invite was made.')); return; }
        note.value = '';
        var at = draw(r.body.invites || [], r.body.made);
        iSay('Made. Its link is first in the list, selected, to copy and pass on.');
        if (at) at.focus();
      }, function () { make.disabled = false; iSay('The desk could not be reached. No invite was made.'); });
    });
  }());

  /* THE NOTICE (Ryan's ask, 2026-10-23): one line along the top of the street's
     front page, the Community Center, the forums and the office's dashboard.
     What is up now is asked for when the desk opens, because the same words are
     on those pages for anybody; the desk is also told which moderator put it up
     or took it down last, and when. Put it up shows how it will look first and
     asks once more, because it replaces what every visitor sees; Take it down
     asks once more. notice.js draws both, as the pages do. */
  (function () {
    var box = document.getElementById('md-notice');
    var nOff = document.getElementById('md-notice-off');
    var now = document.getElementById('md-notice-now');
    var words = document.getElementById('md-notice-words');
    var look = document.getElementById('md-notice-look');
    var set = document.getElementById('md-notice-set');
    var clear = document.getElementById('md-notice-clear');
    var shown = document.getElementById('md-notice-preview');
    var nSaid = document.getElementById('md-notice-said');
    if (!box || !now || !words || !look || !set || !clear || !shown || !window.loveNotice) return;
    box.hidden = false;
    if (nOff) nOff.hidden = true;
    function nSay(t) { nSaid.textContent = t; }
    function noticeCall(send) {
      return fetch('/cb/notice', {
        method: 'POST', credentials: 'omit', cache: 'no-store',
        headers: { 'accept': 'application/json', 'content-type': 'application/json', 'authorization': 'Bearer ' + me.pass },
        body: JSON.stringify(send),
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (b) { return { status: r.status, body: b }; });
      });
    }
    function day(t) {
      try { return new Date(t).toLocaleString(undefined, { day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit' }); } catch (e) { return ''; }
    }
    // What is up now, and whose doing it was.
    function drawNow(b) {
      now.textContent = '';
      var who = b.by ? b.by + ' on ' + day(b.t) : null;
      if (b.notice) {
        now.appendChild(el('p', 'Up now, ' + (who ? 'put up by ' + who : 'the first notice, which came with the site') + ':', 'md-desk__lab'));
        var slot = el('div', null, 'md-notice-slot');
        now.appendChild(slot);
        window.loveNotice.draw(slot, b.notice);
        words.value = b.notice.text;
      } else {
        now.appendChild(el('p', 'There is no notice up' + (who ? ': ' + b.by + ' took the last one down on ' + day(b.t) + '.' : '.')));
      }
      clear.disabled = !b.notice;
    }
    function refresh() {
      noticeCall({ action: 'look' }).then(function (r) {
        if (r.status !== 200) { nSay(why(r, 'The notice could not be fetched just now.')); return; }
        drawNow(r.body);
      }, function () { nSay('The desk could not be reached just now.'); });
    }
    // How the words will set, drawn the way the pages will draw them.
    function preview(then) {
      var text = words.value.trim();
      if (!text) { nSay('Type the notice first.'); words.focus(); return; }
      nSay('Setting it…');
      noticeCall({ action: 'preview', text: text }).then(function (r) {
        shown.textContent = '';
        if (r.status !== 200) { nSay(why(r, 'That could not be set just now.')); return; }
        shown.appendChild(el('p', 'It will look like this:', 'md-desk__lab'));
        var slot = el('div', null, 'md-notice-slot');
        shown.appendChild(slot);
        window.loveNotice.draw(slot, r.body.notice);
        nSay('');
        if (then) then(text);
      }, function () { nSay('The desk could not be reached just now.'); });
    }
    function ask(sentence, yesText, act) {
      var q = el('div');
      q.appendChild(el('p', sentence));
      var yes = button(yesText), no = button('Not now');
      q.appendChild(yes); q.appendChild(no);
      shown.appendChild(q);
      no.focus();
      no.addEventListener('click', function () { q.remove(); });
      yes.addEventListener('click', function () { q.remove(); act(); });
    }
    look.addEventListener('click', function () { preview(); });
    words.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); preview(); } });
    set.addEventListener('click', function () {
      preview(function (text) {
        ask('This goes up at once on the street’s front page, the Community Center, the forums and the office’s dashboard, for everybody, in place of what is up now.', 'Put it up now', function () {
          nSay('Putting it up…');
          noticeCall({ action: 'set', text: text }).then(function (r) {
            if (r.status !== 200) { nSay(why(r, 'That did not work. Nothing was changed.')); return; }
            shown.textContent = '';
            drawNow(r.body);
            nSay('It is up. Each page shows it the next time it is opened.');
            set.focus();
          }, function () { nSay('The desk could not be reached. Nothing was changed.'); });
        });
      });
    });
    clear.addEventListener('click', function () {
      shown.textContent = '';
      ask('This takes the notice off the street’s front page, the Community Center, the forums and the office’s dashboard at once.', 'Take it down', function () {
        nSay('Taking it down…');
        noticeCall({ action: 'clear' }).then(function (r) {
          if (r.status !== 200) { nSay(why(r, 'That did not work. Nothing was changed.')); return; }
          drawNow(r.body);
          nSay('It is down. The words are still in the box, if you want to put them back.');
          look.focus();
        }, function () { nSay('The desk could not be reached. Nothing was changed.'); });
      });
    });
    refresh();
  }());

  /* REPORTED MESSAGES (Ryan, 2026-10-18): the one way a direct message reaches
     a moderator. Fetched when a moderator presses Show the reports, never on
     arrival, and drawn as plain text: what somebody typed is never markup
     here. Closing one asks once more, because it deletes it.

     A REPORTED PICTURE (Ryan's call, 2026-10-19, when conversations took
     pictures) waits behind Show the picture, so nobody looking through the
     desk has a picture somebody reported put in front of them unasked. It is
     fetched with the pass when pressed, shown from memory, and its
     description, if it had one, is said with it. */
  /* A MEMBER'S CALL FOR A MODERATOR (Ryan's call, 2026-10-23): somebody who
     is not a moderator called @moderator, and the server left a note here
     (noteModCall in netlify/cb/lib.mjs): who, when, where, linked, and the
     words, drawn as plain text. Fetched when a moderator presses Show the
     calls, never on arrival. Closing one asks once more, because it deletes it. */
  (function () {
    var box = document.getElementById('md-modcalls');
    var cOff = document.getElementById('md-modcalls-off');
    var load = document.getElementById('md-modcalls-load');
    var list = document.getElementById('md-modcalls-list');
    var cSaid = document.getElementById('md-modcalls-said');
    if (!box || !load) return;
    box.hidden = false;
    if (cOff) cOff.hidden = true;
    function cSay(t) { cSaid.textContent = t; }
    function ask(send) {
      return fetch('/cb/mod-calls', {
        method: 'POST', credentials: 'omit', cache: 'no-store',
        headers: { 'accept': 'application/json', 'content-type': 'application/json', 'authorization': 'Bearer ' + me.pass },
        body: JSON.stringify(send),
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (b) { return { status: r.status, body: b }; });
      });
    }
    function at(t) {
      try { return new Date(t).toLocaleString(undefined, { weekday: 'long', hour: 'numeric', minute: '2-digit', day: 'numeric', month: 'long' }); } catch (e) { return ''; }
    }
    function draw(calls) {
      list.textContent = '';
      if (!calls.length) { list.appendChild(el('p', 'Nobody is waiting on a call.')); return; }
      var ul = el('ul', null, 'md-reports');
      calls.forEach(function (c) {
        var li = el('li', null, 'md-report');
        var who = el('p', null, 'md-report__who');
        who.appendChild(document.createTextNode(c.by + ' called @moderator on ' + at(c.t) + ', in '));
        var place = c.place && typeof c.place.path === 'string' && /^\/[a-z0-9-]+\.html(#[A-Za-z0-9_\/-]*)?$/.test(c.place.path) ? c.place : null;
        if (place) { var a = el('a', place.name); a.href = place.path; who.appendChild(a); }
        else who.appendChild(document.createTextNode(c.place && c.place.name ? c.place.name : 'a place that has gone'));
        who.appendChild(document.createTextNode(':'));
        li.appendChild(who);
        if (c.text) li.appendChild(el('p', c.text, 'md-report__words'));
        var row = el('p');
        var look = button('Look ' + c.by + ' up at the desk'), close = button('Close this call');
        row.appendChild(look); row.appendChild(close);
        li.appendChild(row);
        look.addEventListener('click', function () { nameBox.value = c.by; lookUp(); nameBox.focus(); });
        close.addEventListener('click', function () {
          var sure = el('div');
          sure.appendChild(el('p', 'This deletes the note. Nothing else changes, and nobody is told. It cannot be undone.'));
          var yes = button('Close it'), no = button('Not now');
          sure.appendChild(yes); sure.appendChild(no);
          li.appendChild(sure);
          no.focus();
          no.addEventListener('click', function () { sure.remove(); close.focus(); });
          yes.addEventListener('click', function () {
            cSay('Closing\u2026');
            ask({ close: c.id }).then(function (x) {
              if (x.status !== 200) { cSay(why(x, 'That did not work. Nothing was closed.')); return; }
              draw(x.body.calls || []);
              cSay('Closed and deleted.');
              load.focus();
            }, function () { cSay('The desk could not be reached. Nothing was closed.'); });
          });
        });
        ul.appendChild(li);
      });
      list.appendChild(ul);
    }
    load.addEventListener('click', function () {
      cSay('Looking\u2026');
      ask({}).then(function (x) {
        if (x.status !== 200) { cSay(why(x, 'The calls could not be fetched just now.')); return; }
        cSay('');
        draw(x.body.calls || []);
        load.textContent = 'Show them again';
      }, function () { cSay('The desk could not be reached just now.'); });
    });
  }());

  var reports = document.getElementById('md-reports');
  var rOff = document.getElementById('md-reports-off');
  var rLoad = document.getElementById('md-reports-load');
  var rList = document.getElementById('md-reports-list');
  var rSaid = document.getElementById('md-reports-said');
  if (!reports || !rLoad) return;
  reports.hidden = false;
  if (rOff) rOff.hidden = true;
  function rSay(t) { rSaid.textContent = t; }
  function reportCall(send) {
    return fetch('/cb/dm/reports', {
      method: 'POST', credentials: 'omit', cache: 'no-store',
      headers: { 'accept': 'application/json', 'content-type': 'application/json', 'authorization': 'Bearer ' + me.pass },
      body: JSON.stringify(send),
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (b) { return { status: r.status, body: b }; });
    });
  }
  function when(t) {
    try { return new Date(t).toLocaleString(undefined, { weekday: 'long', hour: 'numeric', minute: '2-digit', day: 'numeric', month: 'long' }); } catch (e) { return ''; }
  }
  function drawReports(list) {
    rList.textContent = '';
    if (!list.length) { rList.appendChild(el('p', 'Nothing has been reported.')); return; }
    var ul = el('ul', null, 'md-reports');
    list.forEach(function (r) {
      var li = el('li', null, 'md-report');
      li.appendChild(el('p', r.of + ' sent this to ' + r.by + ' on ' + when(r.sent) + ', and ' + r.by + ' reported it on ' + when(r.t) + ':', 'md-report__who'));
      if (r.text) li.appendChild(el('p', r.text, 'md-report__words'));
      if (r.img) {
        var pic = el('p', null, 'md-report__pic');
        var show = button('Show the picture ' + r.of + ' sent');
        pic.appendChild(show);
        li.appendChild(pic);
        show.addEventListener('click', function () {
          show.disabled = true;
          fetch('/cb/dm/reports', {
            method: 'POST', credentials: 'omit', cache: 'no-store',
            headers: { 'content-type': 'application/json', 'authorization': 'Bearer ' + me.pass },
            body: JSON.stringify({ picture: r.id }),
          }).then(function (x) { return x.ok ? x.blob() : null; }).then(function (b) {
            if (!b) { pic.textContent = 'That picture is not on the desk any more.'; return; }
            var img = document.createElement('img');
            img.className = 'md-report__img';
            img.src = URL.createObjectURL(b);
            img.alt = r.alt ? r.of + '\u2019s description: ' + r.alt : r.of + ' sent it with no description.';
            pic.textContent = '';
            pic.appendChild(img);
          }, function () { show.disabled = false; rSay('The desk could not be reached just now.'); });
        });
      }
      if (r.note) li.appendChild(el('p', r.by + '\u2019s note: ' + r.note, 'md-report__note'));
      var row = el('p');
      var look = button('Look ' + r.of + ' up at the desk'), close = button('Close this report');
      row.appendChild(look); row.appendChild(close);
      li.appendChild(row);
      look.addEventListener('click', function () { nameBox.value = r.of; lookUp(); nameBox.focus(); });
      close.addEventListener('click', function () {
        var box = el('div');
        box.appendChild(el('p', 'This deletes the report. Nothing else changes, and nobody is told. It cannot be undone.'));
        var yes = button('Close it'), no = button('Not now');
        box.appendChild(yes); box.appendChild(no);
        li.appendChild(box);
        no.focus();
        no.addEventListener('click', function () { box.remove(); close.focus(); });
        yes.addEventListener('click', function () {
          rSay('Closing\u2026');
          reportCall({ close: r.id }).then(function (x) {
            if (x.status !== 200) { rSay(why(x, 'That did not work. Nothing was closed.')); return; }
            drawReports(x.body.reports || []);
            rSay('Closed and deleted.');
            rLoad.focus();
          }, function () { rSay('The desk could not be reached. Nothing was closed.'); });
        });
      });
      ul.appendChild(li);
    });
    rList.appendChild(ul);
  }
  rLoad.addEventListener('click', function () {
    rSay('Looking\u2026');
    reportCall({}).then(function (x) {
      if (x.status !== 200) { rSay(why(x, 'The reports could not be fetched just now.')); return; }
      rSay('');
      drawReports(x.body.reports || []);
      rLoad.textContent = 'Show them again';
    }, function () { rSay('The desk could not be reached just now.'); });
  });

  /* ROLES (Ryan's ask and calls, 2026-10-21): an administrator sees everybody
     with a role, ticks and unticks board, director and administrator, puts
     somebody on the list or takes them off it. The break-glass list is shown
     and cannot be changed here. Board is given or taken only by somebody on
     the board or the break-glass list, which the server decides; the page
     only says so. Fetched when an administrator presses for it, never on
     arrival. Taking somebody off, taking away administrator and changing board
     ask once more. */
  (function () {
    var box = document.getElementById('md-roles');
    var rOff = document.getElementById('md-roles-off');
    var list = document.getElementById('md-roles-list');
    var rSaid = document.getElementById('md-roles-said');
    var load = document.getElementById('md-roles-load');
    var name = document.getElementById('md-roles-name');
    var checks = document.getElementById('md-roles-checks');
    var add = document.getElementById('md-roles-add');
    if (!box || !list || !load || !add) return;
    if ((me.roles || []).indexOf('administrator') < 0) return;
    box.hidden = false;
    if (rOff) rOff.hidden = true;
    var GIVEN = [['board', 'Board'], ['director', 'Director'], ['administrator', 'Administrator']];
    var mayBoard = true, people = [];
    function rSay(t) { rSaid.textContent = t; }
    function rolesCall(send) {
      return fetch('/cb/roles', {
        method: 'POST', credentials: 'omit', cache: 'no-store',
        headers: { 'accept': 'application/json', 'content-type': 'application/json', 'authorization': 'Bearer ' + me.pass },
        body: JSON.stringify(send),
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (b) { return { status: r.status, body: b }; });
      });
    }
    function day(t) {
      try { return new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return ''; }
    }
    function words(roles) {
      var w = GIVEN.filter(function (g) { return roles.indexOf(g[0]) >= 0; }).map(function (g) { return g[1].toLowerCase(); });
      return w.length ? 'Moderator, ' + w.join(', ') + '.' : 'Moderator.';
    }
    // A row of boxes, one for each role: Moderator first, always ticked, because being
    // on the list is what makes somebody one; board shown and not changeable by somebody
    // who may not give it.
    function boxes(into, idBase, on) {
      into.textContent = '';
      var always = el('label', null, 'md-role__check md-role__check--always');
      var m = el('input');
      m.type = 'checkbox'; m.value = 'moderator'; m.id = idBase + '-moderator'; m.checked = true; m.disabled = true;
      always.title = 'Being on the list makes somebody a moderator. Take them off the list to end it.';
      always.appendChild(m); always.appendChild(document.createTextNode('Moderator'));
      into.appendChild(always);
      GIVEN.forEach(function (g) {
        var lab = el('label', null, 'md-role__check');
        var c = el('input');
        c.type = 'checkbox'; c.value = g[0]; c.id = idBase + '-' + g[0]; c.checked = on.indexOf(g[0]) >= 0;
        if (g[0] === 'board' && !mayBoard) { c.disabled = true; lab.title = 'Only somebody on the board, or on the break-glass list, can give or take away board.'; }
        lab.appendChild(c); lab.appendChild(document.createTextNode(g[1]));
        into.appendChild(lab);
      });
    }
    function ticked(into) {
      return Array.prototype.filter.call(into.querySelectorAll('input'), function (c) { return c.checked && c.value !== 'moderator'; }).map(function (c) { return c.value; });
    }
    function send(handle, roles, remove, had, after) {
      rSay(remove ? 'Taking ' + handle + ' off the list…' : 'Saving…');
      rolesCall(remove ? { action: 'remove', handle: handle } : { action: 'set', handle: handle, roles: roles }).then(function (r) {
        if (r.status !== 200) { rSay(why(r, 'That did not work. Nothing was changed.')); return; }
        draw(r.body);
        rSay(remove ? handle + ' is off the list, and an ordinary username again.' : had ? 'Saved. ' + handle + ': ' + words(roles) : handle + ' is on the list as a moderator' + (roles.length ? ': ' + words(roles) : ', and nothing more.'));
        if (after) after();
      }, function () { rSay('The desk could not be reached. Nothing was changed.'); });
    }
    // Ask once more before something that takes a key away.
    function sure(into, sentence, yesText, act, back) {
      var ask = el('div');
      ask.appendChild(el('p', sentence));
      var yes = button(yesText), no = button('Not now');
      ask.appendChild(yes); ask.appendChild(no);
      into.appendChild(ask);
      no.focus();
      no.addEventListener('click', function () { ask.remove(); if (back) back.focus(); });
      yes.addEventListener('click', function () { ask.remove(); act(); });
    }
    function draw(b) {
      people = b.people || [];
      if (typeof b.mayBoard === 'boolean') mayBoard = b.mayBoard;
      boxes(checks, 'md-roles-new', []);
      list.textContent = '';
      if (!mayBoard) list.appendChild(el('p', 'Board is greyed out for you: only somebody on the board, or on the break-glass list, can give or take it away.', 'md-call__fine'));
      var ul = el('ul', null, 'md-roles');
      people.forEach(function (x, i) {
        var li = el('li', null, 'md-role' + (x.fixed ? ' md-role--fixed' : ''));
        li.appendChild(el('p', x.handle, 'md-role__name'));
        var about = x.fixed ? 'On the break-glass list, in the site’s settings: the desk cannot change it. ' + words(x.roles)
          : (x.claimed ? 'Claimed.' : 'Not claimed yet: they claim it on the joining page with the moderators’ password.') + (x.by ? ' Changed last by ' + x.by + (x.t ? ' on ' + day(x.t) : '') + '.' : '');
        li.appendChild(el('p', about, 'md-role__about'));
        if (!x.fixed) {
          var row = el('p', null, 'md-roles__checks');
          boxes(row, 'md-role-' + i, x.roles);
          li.appendChild(row);
          var tools = el('p');
          var save = button('Save ' + x.handle + '’s roles'), off = button('Take ' + x.handle + ' off the list');
          tools.appendChild(save); tools.appendChild(off);
          li.appendChild(tools);
          save.addEventListener('click', function () {
            var now = ticked(row);
            var lostAdmin = x.roles.indexOf('administrator') >= 0 && now.indexOf('administrator') < 0;
            var boardMoved = (x.roles.indexOf('board') >= 0) !== (now.indexOf('board') >= 0);
            if (lostAdmin || boardMoved) {
              sure(li, (lostAdmin ? x.handle + ' will no longer be an administrator. ' : '') + (boardMoved ? (now.indexOf('board') >= 0 ? x.handle + ' will be on the board, with Executive Session. ' : x.handle + ' will no longer be on the board. ') : '') + 'It reaches every page within half a minute.',
                'Save it', function () { send(x.handle, now, false, true); }, save);
            } else send(x.handle, now, false, true);
          });
          off.addEventListener('click', function () {
            sure(li, x.handle + ' will no longer be a moderator, and keeps an ordinary username. It reaches every page within half a minute.', 'Take them off', function () { send(x.handle, [], true, true, function () { load.focus(); }); }, off);
          });
        }
        ul.appendChild(li);
      });
      list.appendChild(ul);
      load.textContent = 'Show them again';
    }
    load.addEventListener('click', function () {
      rSay('Looking…');
      rolesCall({ action: 'list' }).then(function (r) {
        if (r.status !== 200) { rSay(why(r, 'The roles could not be fetched just now.')); return; }
        rSay('');
        draw(r.body);
      }, function () { rSay('The desk could not be reached just now.'); });
    });
    boxes(checks, 'md-roles-new', []);
    add.addEventListener('click', function () {
      var h = name.value.trim();
      if (!h) { rSay('Type the username first.'); name.focus(); return; }
      var had = people.filter(function (x) { return x.handle.toLowerCase() === h.toLowerCase(); })[0];
      var now = ticked(checks);
      send(h, now, false, !!had, function () { name.value = ''; });
    });
    name.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); add.click(); } });
  }());

  /* CHANNELS (Ryan's ask and calls, 2026-10-25): an administrator sets how
     many messages a channel keeps and for how long, for every channel not set
     otherwise, World, direct messages and any room. A longer time reaches only
     what is sent after it, which the server decides by stamping each message
     as it is sent; a shorter time or fewer messages reaches everything at
     once, so those ask once more. Fetched when an administrator presses for
     it, never on arrival. */
  (function () {
    var box = document.getElementById('md-chan');
    var cOff = document.getElementById('md-chan-off');
    var list = document.getElementById('md-chan-list');
    var cSaid = document.getElementById('md-chan-said');
    var load = document.getElementById('md-chan-load');
    var pick = document.getElementById('md-chan-room');
    var fresh = document.getElementById('md-chan-new');
    var add = document.getElementById('md-chan-add');
    if (!box || !list || !load || !add || !pick) return;
    if ((me.roles || []).indexOf('administrator') < 0) return;
    box.hidden = false;
    if (cOff) cOff.hidden = true;
    var FOR = { 1: 'a day', 2: 'two days', 7: 'a week', 14: 'two weeks', 30: '30 days', 90: '90 days', 365: 'a year', 0: 'for good' };
    var FIXED = [['every', 'Every channel not set otherwise', 'Every channel that is not set on its own, World included, and the Slake’s places.'],
      ['world', 'World', 'The channel the whole street shares.'],
      ['dm', 'Direct messages', 'Every conversation between two people. It does not follow Every channel.']];
    var keeps = [50, 100, 200, 500, 1000], days = [1, 2, 7, 14, 30, 90, 365, 0], defaults = { keep: 100, days: 14 }, rules = {}, names = {}, loaded = false;
    function cSay(t) { cSaid.textContent = t; }
    function chanCall(send) {
      return fetch('/cb/channel-rules', {
        method: 'POST', credentials: 'omit', cache: 'no-store',
        headers: { 'accept': 'application/json', 'content-type': 'application/json', 'authorization': 'Bearer ' + me.pass },
        body: JSON.stringify(send),
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (b) { return { status: r.status, body: b }; });
      });
    }
    function day(t) {
      try { return new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return ''; }
    }
    function says(r) { return 'Its latest ' + r.keep + ' messages, ' + (r.days === 0 ? 'for good.' : 'each for ' + FOR[r.days] + '.'); }
    // What a name follows when it is not set: dm and every the code's defaults,
    // anything else every.
    function follows(n) { return n === 'dm' || n === 'every' ? defaults : rules.every || defaults; }
    // Two choosers, how many and how long, with a label each.
    function choosers(into, idBase, r) {
      into.textContent = '';
      var a = el('label', 'How many', 'md-desk__lab'), k = el('select', null, 'md-desk__in');
      k.id = idBase + '-keep'; a.htmlFor = k.id;
      keeps.forEach(function (n) { var o = el('option', n + ' messages'); o.value = String(n); o.selected = n === r.keep; k.appendChild(o); });
      var b = el('label', 'For how long', 'md-desk__lab'), d = el('select', null, 'md-desk__in');
      d.id = idBase + '-days'; b.htmlFor = d.id;
      days.forEach(function (n) { var o = el('option', n === 0 ? 'For good' : 'Each for ' + FOR[n]); o.value = String(n); o.selected = n === r.days; d.appendChild(o); });
      var p1 = el('span'), p2 = el('span');
      p1.appendChild(a); p1.appendChild(k); p2.appendChild(b); p2.appendChild(d);
      into.appendChild(p1); into.appendChild(p2);
      return function () { return { keep: Number(k.value), days: Number(d.value) }; };
    }
    function send(name, label, r, clear, back) {
      cSay(clear ? 'Putting ' + label + ' back…' : 'Saving…');
      chanCall(clear ? { action: 'clear', name: name } : { action: 'set', name: name, keep: r.keep, days: r.days }).then(function (x) {
        if (x.status !== 200) { cSay(why(x, 'That did not work. Nothing was changed.')); return; }
        draw(x.body);
        cSay(clear ? label + ' follows ' + (name === 'dm' || name === 'every' ? 'the street’s default' : 'Every channel') + ' again: ' + says(follows(name)) : 'Saved. ' + label + ': ' + says(r));
        if (back) back.focus();
      }, function () { cSay('The desk could not be reached. Nothing was changed.'); });
    }
    function sure(into, sentence, yesText, act, back) {
      var ask = el('div');
      ask.appendChild(el('p', sentence));
      var yes = button(yesText), no = button('Not now');
      ask.appendChild(yes); ask.appendChild(no);
      into.appendChild(ask);
      no.focus();
      no.addEventListener('click', function () { ask.remove(); if (back) back.focus(); });
      yes.addEventListener('click', function () { ask.remove(); act(); });
    }
    // What a change does, said before it is made.
    function warn(was, now) {
      var w = [];
      var wasLife = was.days === 0 ? Infinity : was.days, nowLife = now.days === 0 ? Infinity : now.days;
      if (now.keep < was.keep) w.push('Only the latest ' + now.keep + ' messages stay: anything older is deleted now.');
      if (nowLife < wasLife) w.push('Every message older than ' + FOR[now.days] + ' is deleted now.');
      if (nowLife > wasLife) w.push('Only messages sent from now on are kept ' + (now.days === 0 ? 'for good' : 'for ' + FOR[now.days]) + '; what was already said keeps the time it was sent under.');
      return w.join(' ');
    }
    function row(ul, name, label, about) {
      var set = rules[name], r = set || follows(name);
      var li = el('li', null, 'md-role');
      li.appendChild(el('p', label, 'md-role__name'));
      li.appendChild(el('p', (about ? about + ' ' : '') + (set ? says(r) + (set.by ? ' Set by ' + set.by + (set.t ? ' on ' + day(set.t) : '') + '.' : '') : 'Not set on its own: ' + says(r)), 'md-role__about'));
      var line = el('p', null, 'md-roles__checks');
      var read = choosers(line, 'md-chan-' + name, r);
      li.appendChild(line);
      var tools = el('p');
      var save = button('Save ' + label);
      tools.appendChild(save);
      if (set) {
        var back = button('Put ' + label + ' back');
        tools.appendChild(back);
        back.addEventListener('click', function () {
          var t = follows(name), sentence = warn(r, t);
          if (sentence) sure(li, sentence, 'Put it back', function () { send(name, label, null, true, load); }, back);
          else send(name, label, null, true, load);
        });
      }
      li.appendChild(tools);
      save.addEventListener('click', function () {
        var now = read(), sentence = warn(r, now);
        if (now.keep === r.keep && now.days === r.days && set) { cSay('Nothing to change.'); return; }
        if (sentence) sure(li, sentence, 'Save it', function () { send(name, label, now, false, save); }, save);
        else send(name, label, now, false, save);
      });
      ul.appendChild(li);
    }
    function draw(b) {
      loaded = true;
      rules = b.rules || {};
      if (b.defaults) defaults = b.defaults;
      if (Array.isArray(b.keeps)) keeps = b.keeps;
      if (Array.isArray(b.days)) days = b.days;
      list.textContent = '';
      var ul = el('ul', null, 'md-roles');
      FIXED.forEach(function (f) { row(ul, f[0], f[1], f[2]); });
      Object.keys(rules).filter(function (n) { return !FIXED.some(function (f) { return f[0] === n; }); }).sort().forEach(function (n) {
        row(ul, n, names[n] ? '#' + names[n] : '#' + n, null);
      });
      list.appendChild(ul);
      load.textContent = 'Show them again';
    }
    var readNew = choosers(fresh, 'md-chan-new', defaults);
    // The rooms by name, from the street's own list; a room that keeps to itself is never on it.
    fetch('/cb-rooms.json', { credentials: 'omit' }).then(function (r) { return r.json(); }).then(function (j) {
      (j.rooms || []).forEach(function (x) {
        if (!x || !x.tag || x.tag === 'world') return;
        names[x.tag] = x.name;
        var o = el('option', x.name); o.value = x.tag; pick.appendChild(o);
      });
    }).catch(function () { cSay('The list of rooms could not be fetched just now.'); });
    load.addEventListener('click', function () {
      cSay('Looking…');
      chanCall({ action: 'list' }).then(function (x) {
        if (x.status !== 200) { cSay(why(x, 'The channels could not be fetched just now.')); return; }
        cSay('');
        draw(x.body);
      }, function () { cSay('The desk could not be reached just now.'); });
    });
    add.addEventListener('click', function () {
      var n = pick.value;
      if (!loaded) { cSay('Show the channels first, so the desk can say what a change would do.'); load.focus(); return; }
      if (!n) { cSay('Choose a room first.'); pick.focus(); return; }
      var now = readNew(), was = rules[n] || follows(n), sentence = warn(was, now), label = '#' + (names[n] || n);
      if (sentence) sure(fresh.parentNode, sentence, 'Set it', function () { send(n, label, now, false, add); }, add);
      else send(n, label, now, false, add);
    });
  }());
}());

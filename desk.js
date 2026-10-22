/* =============================================================================
   The moderators' desk in the Moderators' room: make and delete invites; look
   up one username by name, give it a reset code, delete it, or clear its
   profile card; and read the direct messages people have reported, and close
   them. Ryan's calls, 2026-09-30: accounts with no email, recovery codes, and
   moderators able to reset or delete, here; 2026-10-18, clearing one card that
   breaks the covenant without deleting the username it is on; and 2026-10-21,
   invites in place of the starter password, which the desk makes and deletes.
   An invite counts its uses and never says who used it. And the same day,
   roles: an administrator gives and takes them here (/cb/roles).

   IT OPENS ONLY FOR A BASE PASS, and the server refuses anybody else whatever
   this page shows: this file is the page keeping quiet, never the lock. It
   reads love-cb and never writes it.

   THERE IS NO LIST OF EVERYBODY. A moderator types the name they were asked
   about. A reset code is shown once, to be passed on privately after the
   moderator has made sure who they are talking to; the server keeps only its
   hash. Every destructive press asks once more.
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
    var about = el('p', a.handle + ' is claimed, since ' + since + (a.card ? ', and has a profile card.' : ', with no profile card.'));
    found.appendChild(about);
    var reset = button('Give ' + a.handle + ' a reset code'), del = button('Delete ' + a.handle);
    var row = el('p'); row.appendChild(reset); row.appendChild(del);
    var card = a.card ? button('Clear ' + a.handle + '\u2019s profile card') : null;
    if (card) row.appendChild(card);
    found.appendChild(row);
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

  function lookUp() {
    var handle = nameBox.value.trim();
    if (!handle) { say('Type the username you were asked about.'); nameBox.focus(); return; }
    say('Looking…');
    found.textContent = '';
    call({ action: 'find', handle: handle }).then(function (r) {
      if (r.status !== 200) { say(why(r, 'That did not work just now.')); return; }
      say('');
      show(handle, r.body);
    }, function () { say('The desk could not be reached just now.'); });
  }
  find.addEventListener('click', lookUp);
  nameBox.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); lookUp(); } });

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

  /* REPORTED MESSAGES (Ryan, 2026-10-18): the one way a direct message reaches
     a moderator. Fetched when a moderator presses Show the reports, never on
     arrival, and drawn as plain text: what somebody typed is never markup
     here. Closing one asks once more, because it deletes it.

     A REPORTED PICTURE (Ryan's call, 2026-10-19, when conversations took
     pictures) waits behind Show the picture, so nobody looking through the
     desk has a picture somebody reported put in front of them unasked. It is
     fetched with the pass when pressed, shown from memory, and its
     description, if it had one, is said with it. */
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
}());

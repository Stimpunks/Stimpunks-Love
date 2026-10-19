/* =============================================================================
   The moderators' desk in the Moderators' room: look up one username by name,
   give it a reset code, delete it, or clear its profile card; and read the
   direct messages people have reported, and close them. Ryan's calls,
   2026-09-30: accounts with no email, recovery codes, and moderators able to
   reset or delete, here; and 2026-10-18, clearing one card that breaks the
   covenant without deleting the username it is on.

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
  if (!me || !me.pass || !(me.base || /^cb[12]\.base\./.test(me.pass))) return;
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
        ? handle + ' is a moderator\u2019s handle, still on the moderators\u2019 password.'
        : handle + ' has not been claimed. Anybody with the community password can sign on as it.'));
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

  /* REPORTED MESSAGES (Ryan, 2026-10-18): the one way a direct message reaches
     a moderator. Fetched when a moderator presses Show the reports, never on
     arrival, and drawn as plain text: what somebody typed is never markup
     here. Closing one asks once more, because it deletes it. */
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
      li.appendChild(el('p', r.text, 'md-report__words'));
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
}());

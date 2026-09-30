/* =============================================================================
   The moderators' desk in the Moderators' room: look up one username by name,
   give it a reset code, or delete it. Ryan's calls, 2026-09-30: accounts with
   no email, recovery codes, and moderators able to reset or delete, here.

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
  if (!me || !me.pass || !(me.base || /^cb1\.base\./.test(me.pass))) return;
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
    if (!a.claimed) { found.appendChild(el('p', handle + ' has not been claimed. Anybody with the community password can sign on as it.')); return; }
    var since = '';
    try { since = new Date(a.since).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) {}
    found.appendChild(el('p', a.handle + ' is claimed, since ' + since + '.'));
    var reset = button('Give ' + a.handle + ' a reset code'), del = button('Delete ' + a.handle);
    var row = el('p'); row.appendChild(reset); row.appendChild(del);
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
}());

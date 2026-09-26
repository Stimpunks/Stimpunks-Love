/* =============================================================================
   Plural Mural's chalkboard. Helen Edgar's idea, after the board at her
   floatation tank place: a board on the pavement for leaving a note to whoever
   comes by next.

   ANYBODY CAN READ IT AND ONLY THE CB CAN WRITE ON IT. Ryan's call,
   2026-09-25. Reading is one request to this site when the page opens, and
   again after you chalk something up; there is no polling, because a board is
   not a channel and nothing on it is waiting for you. Writing uses the pass the
   radio already keeps in love-cb, which privacy.html describes: this file
   reads it and never writes it, and signing on or off is the radio's job.

   IT NEVER CLAIMS WHAT IT HAS NOT READ, which is the radio's rule. Until the
   board answers it says it is reading, and if the answer fails it says so;
   "nothing on the board" is a statement about the board and only a reply can
   make it true.

   Every note goes in with textContent. Nothing anybody chalks is ever parsed
   as markup, and nothing on the board is counted.
   ============================================================================= */
(function () {
  'use strict';

  var board = document.getElementById('pm-board-notes');
  var state = document.getElementById('pm-board-state');
  if (!board || !state) return;

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

  function when(t) {
    try {
      return new Date(t).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
    } catch (e) { return ''; }
  }

  var me = pass();
  var base = !!(me && (me.base || /^cb1\.base\./.test(me.pass)));

  function draw(notes) {
    board.textContent = '';
    if (!notes.length) {
      board.hidden = true;
      state.hidden = false;
      state.textContent = 'Nothing on the board this week. The chalk is on the ledge.';
      return;
    }
    state.hidden = true;
    board.hidden = false;
    /* Newest at the top, the way you read a board you walk up to. */
    notes.slice().reverse().forEach(function (n) {
      var li = document.createElement('li');
      li.className = 'pm-note-chalk' + (n.base ? ' pm-note-chalk--base' : '');
      var text = document.createElement('p');
      text.className = 'pm-note-chalk__text';
      text.textContent = n.text;
      var by = document.createElement('p');
      by.className = 'pm-note-chalk__by';
      by.textContent = '— ' + n.handle + (n.base ? ', the base station' : '') + ', ' + when(n.t);
      li.appendChild(text); li.appendChild(by);
      if (base) {
        var rub = document.createElement('button');
        rub.type = 'button';
        rub.className = 'pm-put pm-note-chalk__rub';
        rub.textContent = 'Rub this one out';
        rub.addEventListener('click', function () {
          rub.disabled = true;
          call('/cb/chalk/rub', { remove: n.id }, me.pass).then(function (r) {
            if (r.status === 200 && r.body.notes) { draw(r.body.notes); say('Rubbed out.'); }
            else { rub.disabled = false; say(why(r, 'That did not work. Try again in a moment.')); }
          }, function () { rub.disabled = false; say('The board could not be reached just now.'); });
        });
        li.appendChild(rub);
      }
      board.appendChild(li);
    });
  }

  var said = document.getElementById('pm-chalk-said');
  /* WHAT WENT WRONG, IN WORDS. Our functions answer a refusal with
     { error: "a sentence" }, and that sentence is shown as it is. Anything else
     that answers -- the local preview server, which has no functions and says
     { error: { code, message } } with a 404, or a host having a bad minute --
     is not ours to repeat, so it gets our own sentence instead. The first
     version printed body.error whatever it was, and signing on at the preview
     said "[object Object]"; Ryan found it, 2026-09-26. */
  function why(r, otherwise) {
    if (r && r.body && typeof r.body.error === 'string' && r.body.error) return r.body.error;
    if (r && (r.status === 404 || r.status === 405)) {
      return 'The CB is not running on this server. It only answers on stimpunks.world itself.';
    }
    return otherwise;
  }

  function say(t) { if (said) said.textContent = t; }

  function read() {
    state.hidden = false;
    state.textContent = 'Reading the board…';
    call('/cb/chalk').then(function (r) {
      if (r.status === 200 && r.body.notes) draw(r.body.notes);
      else { board.hidden = true; state.textContent = 'The board could not be read just now.'; }
    }, function () { board.hidden = true; state.textContent = 'The board could not be read just now.'; });
  }
  read();

  var write = document.getElementById('pm-chalk-write');
  var signon = document.getElementById('pm-chalk-signon');
  if (!me) { if (signon) signon.hidden = false; return; }
  if (!write) return;
  write.hidden = false;
  document.getElementById('pm-chalk-as').textContent = me.handle || 'you';

  var form = document.getElementById('pm-chalk-form');
  var box = document.getElementById('pm-chalk-text');
  var go = form.querySelector('.pm-chalk__go');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = box.value.trim();
    if (!text) { say('Write something first, then chalk it up.'); box.focus(); return; }
    go.disabled = true;
    say('Chalking it up…');
    call('/cb/chalk/write', { text: text }, me.pass).then(function (r) {
      go.disabled = false;
      if (r.status === 200 && r.body.notes) {
        box.value = '';
        draw(r.body.notes);
        say('It is on the board, at the top, for seven days.');
      } else if (r.status === 401) {
        say('The password has changed since you signed on. Sign on again at the Community Center, then come back.');
      } else {
        say(why(r, 'That did not go up. Try again in a moment.'));
      }
    }, function () { go.disabled = false; say('The board could not be reached just now. Nothing was written.'); });
  });
}());

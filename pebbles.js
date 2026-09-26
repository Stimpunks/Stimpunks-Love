/* =============================================================================
   The pebble bowl by the door of a hosted room. Helen Edgar's idea, 2026-09-26.
   tools/make-pebbles.py prints the bowl; this reads what is in it and leaves
   pebbles in it.

   THE CHALKBOARD'S RULES, IN A ROOM. Anybody can see what is in the bowl, and
   only people signed on to the CB can leave a pebble, using the pass the radio
   keeps in love-cb: this file reads that pass and never writes it. The bowl is
   read once when the page opens and again after you leave something. There is
   no polling, because a bowl is not a channel.

   IT NEVER CLAIMS WHAT IT HAS NOT READ. Until the bowl answers it says it is
   looking, and if the answer fails it says so, because "the bowl is empty" is
   only true once the bowl has said so.

   Every pebble goes in with textContent, and its link is shown as its whole
   address, so what somebody reads is where it goes. Nothing in the bowl is
   counted: not the pebbles, not who left them, not who came to the door.
   ============================================================================= */
(function () {
  'use strict';

  var bowl = document.getElementById('pebbles');
  var left = document.getElementById('pebbles-left');
  var state = document.getElementById('pebbles-state');
  if (!bowl || !left || !state) return;
  var room = bowl.getAttribute('data-room');
  var said = document.getElementById('pebbles-said');

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

  // The chalkboard's rule for what went wrong: our own sentence, or ours.
  function why(r, otherwise) {
    if (r && r.body && typeof r.body.error === 'string' && r.body.error) return r.body.error;
    if (r && (r.status === 404 || r.status === 405)) {
      return 'The bowl is not kept on this server. It only answers on stimpunks.world itself.';
    }
    return otherwise;
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function when(t) {
    try {
      return new Date(t).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
    } catch (e) { return ''; }
  }

  function say(t) { if (said) said.textContent = t; }

  var me = pass();
  var base = !!(me && (me.base || /^cb1\.base\./.test(me.pass)));

  function draw(pebbles) {
    left.textContent = '';
    if (!pebbles.length) {
      left.hidden = true;
      state.hidden = false;
      state.textContent = 'Nothing in the bowl this week.';
      return;
    }
    state.hidden = true;
    left.hidden = false;
    // Newest first: the one somebody just left is the one on top.
    pebbles.slice().reverse().forEach(function (p) {
      var li = el('li', 'pebbles__pebble');
      var head = el('p', 'pebbles__who');
      head.appendChild(el('b', null, p.handle));
      var t = el('time', null, when(p.t));
      try { t.dateTime = new Date(p.t).toISOString(); } catch (e) { /* no date, no attribute */ }
      head.appendChild(document.createTextNode(' · '));
      head.appendChild(t);
      li.appendChild(head);
      li.appendChild(el('p', 'pebbles__what', p.text));
      if (p.link && /^https?:\/\//.test(p.link)) {
        var go = el('p', 'pebbles__where');
        var a = el('a', null, p.link.replace(/^https?:\/\//, '').replace(/\/$/, ''));
        a.href = p.link;
        a.rel = 'nofollow ugc noopener noreferrer';
        go.appendChild(a);
        li.appendChild(go);
      }
      if (base) {
        var lift = el('button', 'pebbles__lift', 'Lift this one out');
        lift.type = 'button';
        lift.setAttribute('aria-label', 'Lift ' + p.handle + '’s pebble out of the bowl');
        lift.addEventListener('click', function () {
          lift.disabled = true;
          call('/cb/pebbles/lift', { room: room, remove: p.id }, me.pass).then(function (r) {
            if (r.status === 200 && r.body.pebbles) { draw(r.body.pebbles); say('Lifted out.'); }
            else { lift.disabled = false; say(why(r, 'That did not work. Try again in a moment.')); }
          }, function () { lift.disabled = false; say('The bowl could not be reached just now.'); });
        });
        li.appendChild(lift);
      }
      left.appendChild(li);
    });
  }

  function read() {
    state.hidden = false;
    state.textContent = 'Looking in the bowl…';
    call('/cb/pebbles?room=' + encodeURIComponent(room)).then(function (r) {
      if (r.status === 200 && r.body.pebbles) draw(r.body.pebbles);
      else { left.hidden = true; state.textContent = why(r, 'The bowl could not be read just now.'); }
    }, function () { left.hidden = true; state.textContent = 'The bowl could not be read just now.'; });
  }
  read();

  var write = document.getElementById('pebbles-write');
  var signon = document.getElementById('pebbles-signon');
  if (!me) { if (signon) signon.hidden = false; return; }
  if (!write) return;
  write.hidden = false;
  document.getElementById('pebbles-as').textContent = me.handle || 'you';

  var form = document.getElementById('pebbles-form');
  var text = document.getElementById('pebbles-text');
  var link = document.getElementById('pebbles-link');
  var go = form.querySelector('.pebbles__go');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var words = text.value.trim();
    if (!words) { say('Say what it is first, in your own words.'); text.focus(); return; }
    go.disabled = true;
    say('Leaving it…');
    call('/cb/pebbles/leave', { room: room, text: words, link: link.value.trim() }, me.pass).then(function (r) {
      go.disabled = false;
      if (r.status === 200 && r.body.pebbles) {
        text.value = '';
        link.value = '';
        draw(r.body.pebbles);
        say('It is in the bowl, on top, for seven days.');
      } else if (r.status === 401) {
        say('The password has changed since you signed on. Sign on again at the Community Center, then come back.');
      } else {
        say(why(r, 'That did not go in. Try again in a moment.'));
      }
    }, function () { go.disabled = false; say('The bowl could not be reached just now. Nothing was left.'); });
  });
}());

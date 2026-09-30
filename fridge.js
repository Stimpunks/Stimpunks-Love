/* =============================================================================
   The Fridge of Sighs: the door, the word you put up, and the drawer. Ryan's
   brief, 2026-09-30, after the sentence builder in our Discord's Collaborative
   Nonsense channels.

   ONE WORD EACH, NEVER TWO IN A ROW, AND NO NAMES. Putting up a word sends the
   CB pass the radio keeps in love-cb, which this file reads and never writes.
   The server keeps a scrambled mark of whoever put up the last word and nothing
   else about anybody, so nothing this page is ever told says whose a word was.

   READ ONCE, NOT POLLED. The door is read when the page opens and again after
   you put up a word, because a fridge is not a channel. A drawer is read when
   somebody opens it. It never claims what it has not read: until the door
   answers it says it is reading it.

   Every word goes in with textContent, and nothing here is stored anywhere.
   ============================================================================= */
(function () {
  'use strict';

  var line = document.getElementById('fos-words');
  var lineState = document.getElementById('fos-line-state');
  var doorList = document.getElementById('fos-door');
  var doorState = document.getElementById('fos-door-state');
  var drawersBox = document.getElementById('fos-drawers');
  var drawerList = document.getElementById('fos-drawer');
  if (!line || !lineState || !doorList || !doorState || !drawersBox || !drawerList) return;

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

  /* The chalkboard's rule for what went wrong: our own sentence, or ours. */
  function why(r, otherwise) {
    if (r && r.body && typeof r.body.error === 'string' && r.body.error) return r.body.error;
    if (r && (r.status === 404 || r.status === 405)) {
      return 'The fridge is not kept on this server. It only answers on stimpunks.world itself.';
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
    try { return new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch (e) { return ''; }
  }

  function monthName(m) {
    try { return new Date(m + '-15T12:00:00Z').toLocaleDateString(undefined, { month: 'long', year: 'numeric' }); }
    catch (e) { return m; }
  }

  var me = pass();
  var base = !!(me && (me.base || /^cb[12]\.base\./.test(me.pass)));
  var said = document.getElementById('fos-said');
  function say(t) { if (said) said.textContent = t; }

  /* A run of magnets, one word to each. */
  function tiles(words) {
    var ol = el('ol', 'fos-tiles');
    words.forEach(function (w) { ol.appendChild(el('li', 'fos-tile', w)); });
    return ol;
  }

  function drawLine(words) {
    line.textContent = '';
    if (!words.length) {
      line.hidden = true;
      lineState.hidden = false;
      lineState.textContent = 'Nothing on the line yet. The next word starts a new sentence.';
      return;
    }
    lineState.hidden = true;
    line.hidden = false;
    words.forEach(function (w, i) {
      line.appendChild(el('li', 'fos-tile', w));
      if (base) {
        var holder = el('li');
        var b = el('button', 'fos-btn fos-btn--small', 'Take “' + w + '” down');
        b.type = 'button';
        b.addEventListener('click', function () {
          b.disabled = true;
          call('/cb/fridge/strike', { word: i }, me.pass).then(function (r) {
            if (r.status === 200) { draw(r.body); say('Taken down.'); }
            else { b.disabled = false; say(why(r, 'That did not work. Try again in a moment.')); }
          }, function () { b.disabled = false; say('The fridge could not be reached just now.'); });
        });
        holder.appendChild(b);
        line.appendChild(holder);
      }
    });
  }

  function sentence(n, into) {
    var li = el('li', 'fos-sentence');
    li.appendChild(tiles(n.text.split(' ')));
    li.appendChild(el('p', 'fos-sentence__when', 'Finished ' + when(n.t)));
    if (base) {
      var b = el('button', 'fos-btn fos-btn--small', 'Take this sentence down');
      b.type = 'button';
      b.addEventListener('click', function () {
        b.disabled = true;
        call('/cb/fridge/strike', { sentence: n.id }, me.pass).then(function (r) {
          if (r.status === 200) { li.remove(); if (r.body.door) drawDoor(r.body.door); say('Taken down.'); }
          else { b.disabled = false; say(why(r, 'That did not work. Try again in a moment.')); }
        }, function () { b.disabled = false; say('The fridge could not be reached just now.'); });
      });
      li.appendChild(b);
    }
    into.appendChild(li);
  }

  function drawDoor(list) {
    doorList.textContent = '';
    if (!list.length) {
      doorList.hidden = true;
      doorState.hidden = false;
      doorState.textContent = 'No finished sentences on the door yet.';
      return;
    }
    doorState.hidden = true;
    doorList.hidden = false;
    list.slice().reverse().forEach(function (n) { sentence(n, doorList); });
  }

  function drawDrawers(months) {
    drawersBox.textContent = '';
    if (!months.length) {
      drawersBox.appendChild(el('p', 'fos-line__state', 'Nothing in the drawer yet: everything finished is still on the door.'));
      return;
    }
    months.slice().reverse().forEach(function (m) {
      var b = el('button', 'fos-btn', monthName(m));
      b.type = 'button';
      b.addEventListener('click', function () {
        drawerList.hidden = false;
        drawerList.textContent = '';
        drawerList.appendChild(el('li', 'fos-sentence__when', 'Opening the drawer…'));
        call('/cb/fridge?drawer=' + encodeURIComponent(m)).then(function (r) {
          drawerList.textContent = '';
          if (r.status === 200 && r.body.sentences) {
            if (!r.body.sentences.length) drawerList.appendChild(el('li', 'fos-sentence__when', 'That pile is empty now.'));
            r.body.sentences.slice().reverse().forEach(function (n) { sentence(n, drawerList); });
          } else {
            drawerList.appendChild(el('li', 'fos-sentence__when', 'The drawer could not be opened just now.'));
          }
        }, function () {
          drawerList.textContent = '';
          drawerList.appendChild(el('li', 'fos-sentence__when', 'The drawer could not be opened just now.'));
        });
      });
      drawersBox.appendChild(b);
    });
  }

  function draw(body) {
    drawLine(body.words || []);
    drawDoor(body.door || []);
    if (body.drawers) drawDrawers(body.drawers);
  }

  function read() {
    lineState.textContent = 'Reading the door…';
    doorState.textContent = 'Reading the door…';
    call('/cb/fridge').then(function (r) {
      if (r.status === 200 && r.body.words) { draw(r.body); return; }
      unread();
    }, unread);
  }
  function unread() {
    lineState.textContent = doorState.textContent = 'The door could not be read just now.';
    drawersBox.textContent = '';
    drawersBox.appendChild(el('p', 'fos-line__state', 'The drawer could not be opened just now.'));
  }
  read();

  var form = document.getElementById('fos-put');
  var box = document.getElementById('fos-word');
  var signon = document.getElementById('fos-signon');
  if (!me) { if (signon) signon.hidden = false; return; }
  if (!form || !box) return;
  form.hidden = false;
  var go = form.querySelector('.fos-btn');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var word = box.value.trim();
    if (!word) { say('Write a word first, then put it up.'); box.focus(); return; }
    if (/\s/.test(word)) { say('That is more than one word. One magnet holds one.'); box.focus(); return; }
    go.disabled = true;
    say('Putting it up…');
    call('/cb/fridge/word', { word: word }, me.pass).then(function (r) {
      go.disabled = false;
      if (r.status === 200) {
        box.value = '';
        draw(r.body);
        say(r.body.finished ? 'Up, and that finished the sentence. It is stuck on the door with the others.'
                            : 'Up. The next word is somebody else’s.');
      } else if (r.status === 409) {
        if (r.body.words) draw(r.body);
        say(why(r, 'The last word put up was yours, so the next one is somebody else’s.'));
      } else if (r.status === 401) {
        say('The password has changed since you signed on. Sign on again at the Community Center, then come back.');
      } else {
        say(why(r, 'That did not go up. Try again in a moment.'));
      }
    }, function () { go.disabled = false; say('The fridge could not be reached just now. Nothing was put up.'); });
  });
}());

/* =============================================================================
   The call's own window: call-window.html, opened by Pop out on a call.

   Ryan, 2026-10-13: a call that follows you about the street. Every room is a
   page and a page that goes takes its call with it, so the call goes into a
   browser window of its own and stays there while you go from room to room in
   the one you came from. This reads which call from the fragment, which never
   reaches a server, and opens it with call.js, the same as Join does in a room:
   a fresh pass into the call for this browser's own CB handle, 8x8's first
   screen, camera and microphone off. It keeps nothing.

   Pop out again, from any call, while this window is open, puts the new call
   here in place of the old one, because there is one call at a time. Leave
   the call, here or from the radio, hangs up and closes this window.

   TWO BUTTONS OF ITS OWN ON THE CALL'S BAR (Ryan's asks, 2026-11-06):
     · SHOW THE CHAT, by request: the call's chat is its room's channel
       (Jitsi's own is off), so this puts the chat page, chat.html#<the
       call's room>, in a frame beside the call, and Hide the chat takes the
       frame away again, so it listens only while it is shown. It is the chat
       page, the radio docked, which cb.js and love.js let into a frame only
       here (callFramed); every other frame of this site still gets no radio.
       The window grows by the chat's width if the screen has room, so the
       call keeps its size. Not remembered: every window starts without it.
     · SHOW THE PAGE, the page the call was popped out of, which the radio
       there could already do the other way round (Show the call window). It
       brings that window forward; a browser may not let it, and then this
       says so. It reads nothing of that page but its title, for the label.

   AND A THIRD, SHOW THE FILM (Ryan's ask, 2026-11-06): the film somebody is
   hosting in the call's room, above the call, as its play button, which
   says how long it runs and starts where the host is when it is pressed.
   Nothing reaches YouTube until that press, and Catch up moves it to the
   host's place again and presses nothing, love-embed.js's seek().
     · IT HEARS THE HOST ONLY WHILE IT IS SHOWN: it asks /cb/channel for the
       room's beacons every FILM_EVERY while the film is shown and the window
       is in front, as the radio does, sending back the `v` it has so no
       messages come with it, and stops on Hide the film. It keeps nothing.
     · ONLY A FILM THE ROOM ITSELF OFFERS, OR A MODERATOR'S (cb.js's plateFor
       rule, carried here): a beacon's video is whatever its sender says, so
       a host who is not the base gets their film up only when the room's own
       page has a play button for it, read once from the page's markup. A
       list's film opens the list at that film (love-embed.js's atEntry).
       Anything else is said in words, with nothing to press.
     · Follow is the radio's, on the page with the film; it is not here.
   ============================================================================= */
(function () {
  'use strict';
  var head = document.querySelector('[data-callwin-name]');
  var said = document.querySelector('[data-callwin-said]');
  var more = document.querySelector('[data-callwin-more]');
  function tell(s) { said.textContent = s; }

  var CHAT_W = 400;        // px the chat takes beside the call, which the window grows by
  var room = null, chatFrame = null;
  function btn(text) { var b = document.createElement('button'); b.type = 'button'; b.className = 'cb-btn'; b.textContent = text; return b; }
  // Spoken on the bar, under the buttons, in the call's own words line (call.js's note is the radio's).
  var chatBtn = btn('Show the chat'), pageBtn = btn('Show the page'), filmBtn = btn('Show the film');
  // What those two say, under the call's bar, where the eye is: the page's own line is behind the call.
  var toolSaid = document.createElement('p');
  toolSaid.className = 'cb-call-note cb-call-said';
  toolSaid.setAttribute('role', 'status');
  toolSaid.hidden = true;
  var toolSaidFor = null;
  function sayHere(s) {
    toolSaid.textContent = s;
    toolSaid.hidden = !s;
    clearTimeout(toolSaidFor);
    if (s) toolSaidFor = setTimeout(function () { toolSaid.hidden = true; }, 8000);
  }
  chatBtn.setAttribute('aria-expanded', 'false');
  function chatShown(on) {
    document.body.classList.toggle('cb-callwin--chat', on);
    chatBtn.textContent = on ? 'Hide the chat' : 'Show the chat';
    chatBtn.setAttribute('aria-expanded', String(on));
    if (on && !chatFrame && room) {
      chatFrame = document.createElement('iframe');
      chatFrame.className = 'cb-callwin__chat';
      chatFrame.id = 'cb-callwin-chat';
      chatFrame.title = 'The chat in ' + room.name;
      chatFrame.src = '/chat.html#' + room.tag;
      document.body.appendChild(chatFrame);
      chatBtn.setAttribute('aria-controls', chatFrame.id);
    } else if (!on && chatFrame) {
      // Taken away, not hidden, so the radio in it stops listening.
      chatFrame.remove();
      chatFrame = null;
      chatBtn.removeAttribute('aria-controls');
    }
    // Wider by the chat, or back, where the screen has room and the browser allows.
    var wide = matchMedia('(min-width: 760px)').matches || on;
    try {
      if (wide && window.screen && (!on || window.outerWidth + CHAT_W <= screen.availWidth)) window.resizeTo(window.outerWidth + (on ? CHAT_W : -CHAT_W), window.outerHeight);
    } catch (e) { /* the browser decides */ }
  }
  chatBtn.addEventListener('click', function () { chatShown(!chatFrame); });

  // The page the call came from: the window that opened this one.
  function fromWin() { try { var o = window.opener; return o && !o.closed ? o : null; } catch (e) { return null; } }
  function pageNamed() {
    var o = fromWin(), t = '';
    try { t = o ? String(o.document.title || '').replace(/\s+—\s+Stimpunks\.World$/, '') : ''; } catch (e) { t = ''; }
    pageBtn.hidden = !o;
    pageBtn.setAttribute('aria-label', 'Show the page you came from' + (t ? ', ' + t : ''));
    pageBtn.title = t ? 'Bring forward the page you came from: ' + t : 'Bring forward the page you came from';
  }
  pageBtn.addEventListener('click', function () {
    var o = fromWin();
    if (!o) { pageNamed(); sayHere('The page you came from has closed. Closing this window hangs up.'); return; }
    try { o.focus(); } catch (e) { /* the browser decides */ }
    setTimeout(function () {
      if (document.hasFocus()) sayHere('Your browser would not bring the page you came from forward from here. It is the window this call was popped out of.');
    }, 300);
  });
  window.addEventListener('focus', pageNamed);

  /* ── SHOW THE FILM ─────────────────────────────────────────────────────── */
  var FILM_EVERY = 6000;   // ms between asks for the room's host, while shown and in front
  var VIDEO = /^[A-Za-z0-9_-]{11}$/;
  var film = null;         // the panel's parts and state while it is shown
  filmBtn.setAttribute('aria-expanded', 'false');
  function cbState() { try { var v = JSON.parse(localStorage.getItem('love-cb') || 'null'); return v || {}; } catch (e) { return {}; } }
  function clock(secs) {
    secs = Math.max(0, Math.floor(secs));
    var h = Math.floor(secs / 3600), m = Math.floor(secs / 60) % 60, s = secs % 60;
    var two = function (n) { return (n < 10 ? '0' : '') + n; };
    return h ? h + ':' + two(m) + ':' + two(s) : m + ':' + two(s);
  }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  // The room's own play buttons, read once from its page: single films by id,
  // and lists by their list id with the address their button frames.
  function pageOffers(tag) {
    return fetch('/cb-rooms.json').then(function (r) { return r.ok ? r.json() : { rooms: [] }; }).catch(function () { return { rooms: [] }; })
      .then(function (j) {
        var path = null;
        (j.rooms || []).forEach(function (x) { if (x.tag === tag) path = x.path; });
        if (!path) path = '/' + tag + '.html';
        if (path.indexOf('#') >= 0 || path.charAt(0) !== '/') return null;
        return fetch(path).then(function (r) { return r.ok ? r.text() : null; });
      })
      .catch(function () { return null; })
      .then(function (html) {
        var got = { ids: {}, lists: {} };
        if (!html) return got;
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var bs = doc.querySelectorAll('[data-embed-id], [data-embed-src]');
        for (var i = 0; i < bs.length; i++) {
          var id = bs[i].getAttribute('data-embed-id'), src = bs[i].getAttribute('data-embed-src') || '', m;
          if (id && VIDEO.test(id)) got.ids[id] = true;
          if ((m = /[?&]list=([A-Za-z0-9_-]+)/.exec(src)) && m[1].indexOf('RD') !== 0) { if (!got.lists[m[1]]) got.lists[m[1]] = src; }
          else if ((m = /\/embed\/([A-Za-z0-9_-]{11})(?:[?#]|$)/.exec(src))) got.ids[m[1]] = true;
        }
        return got;
      });
  }

  // What the window can put up for this beacon, or null: the room's list at the
  // host's film, the room's own film, or a moderator's film by its id.
  function offered(b) {
    var o = film && film.offers;
    if (!b || !VIDEO.test(b.video || '')) return null;
    if (o && b.list && o.lists[b.list]) return { src: o.lists[b.list], entry: b.video };
    if ((o && o.ids[b.video]) || b.base) return { id: b.video };
    return null;
  }
  // A line under the host's, for what a press here did; it goes after a while.
  function filmSay(s) {
    if (!film) return;
    film.said.textContent = s;
    clearTimeout(film.saidFor);
    if (s) film.saidFor = setTimeout(function () { if (film) film.said.textContent = ''; }, 8000);
  }
  function placeOf(b) { return b.at + (b.playing ? Math.max(0, (Date.now() + film.skew - b.t) / 1000) : 0); }
  function keyOf(b) { return b ? [b.handle, b.video, b.list || ''].join('|') : ''; }

  function plateFor(b, put) {
    var p = el('button', 'facade');
    p.type = 'button';
    p.dataset.embedTitle = b.film;
    if (put.src) { p.dataset.embedSrc = put.src; p.dataset.embedEntry = put.entry; } else p.dataset.embedId = put.id;
    p.appendChild(document.createTextNode('\u201c' + b.film + '\u201d \u2014 ' +
      (b.live ? 'live, so it runs until you close it' : b.length ? 'runs ' + clock(b.length) : 'how long it runs was not said') +
      ', hosted on the CB by ' + b.handle + (b.live ? '' : '. It starts where they are when you press it.')));
    p.appendChild(el('span', 'facade__play', '\u25B6 PRESS PLAY'));
    return p;
  }

  function filmDraw() {
    if (!film) return;
    var b = film.beacon, me = (cbState().handle || '').toLowerCase(), screen = film.screen, put = offered(b);
    var plate = screen.querySelector('button.facade'), playing = screen.querySelector('div.facade');
    film.catchBtn.hidden = !(playing && b && !b.live && put);
    film.swapBtn.hidden = true;
    if (!film.heard) { film.line.textContent = 'Listening for a film hosted in ' + room.name + '\u2026'; return; }
    if (!b) {
      film.line.textContent = playing ? 'Nobody is hosting a film in ' + room.name + ' now. Yours plays on until you close it or hide the film.'
        : 'Nobody is hosting a film in ' + room.name + ' just now. When somebody hosts one, it shows here, waiting for your press.';
      if (plate) plate.remove();
      film.shown = '';
      return;
    }
    var at = b.live ? 'live' + (b.playing ? '' : ', paused') : clock(placeOf(b)) + (b.playing ? ', playing' : ', paused');
    if (b.handle.toLowerCase() === me) {
      film.line.textContent = 'You are hosting \u201c' + b.film + '\u201d from the page it plays on: ' + at + '.';
      if (plate) plate.remove();
      film.shown = '';
      return;
    }
    if (!put) {
      film.line.textContent = b.handle + ' is hosting \u201c' + b.film + '\u201d (' + at + '), which is not one of ' + room.name + '\u2019s own films, so this window does not put it up. It plays on the page it is hosted from.';
      if (plate) plate.remove();
      film.shown = '';
      return;
    }
    film.line.textContent = b.handle + ' is hosting \u201c' + b.film + '\u201d here: ' + at + '.';
    var key = keyOf(b);
    if (key === film.shown) return;
    if (playing) {
      // Yours is playing: another film goes up only on your press.
      film.swapBtn.textContent = 'Put \u201c' + b.film + '\u201d up instead';
      film.swapBtn.hidden = false;
      return;
    }
    if (plate) plate.remove();
    screen.appendChild(plateFor(b, put));
    film.shown = key;
    filmSay('');
  }

  function filmAsk() {
    if (!film) return;
    clearTimeout(film.timer);
    if (document.visibilityState !== 'visible') return;
    var pass = cbState().pass;
    if (!pass) { film.heard = true; film.line.textContent = 'This browser is not signed on to the CB, so this window cannot hear who is hosting.'; return; }
    var asked = film;
    fetch('/cb/channel?room=' + encodeURIComponent(room.tag) + (film.v ? '&v=' + encodeURIComponent(film.v) : ''), { headers: { authorization: 'Bearer ' + pass } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; })
      .then(function (j) {
        if (film !== asked) return;
        if (j) {
          film.v = j.v || null;
          film.skew = (j.now || Date.now()) - Date.now();
          film.beacon = null;
          (j.beacons || []).forEach(function (b) { if (b.room === room.tag) film.beacon = b; });
          film.heard = true;
        }
        filmDraw();
        film.timer = setTimeout(filmAsk, FILM_EVERY);
      });
  }

  function filmShown(on) {
    document.body.classList.toggle('cb-callwin--film', on);
    filmBtn.textContent = on ? 'Hide the film' : 'Show the film';
    filmBtn.setAttribute('aria-expanded', String(on));
    if (on && !film && room) {
      var panel = el('section', 'cb-callwin__film');
      panel.id = 'cb-callwin-film';
      panel.setAttribute('aria-label', 'The film hosted in ' + room.name);
      var top = el('div', 'cb-callwin__film-top');
      var line = el('p', 'cb-callwin__film-line');
      var catchBtn = el('button', 'cb-btn', 'Catch up'); catchBtn.type = 'button';
      var swapBtn = el('button', 'cb-btn', ''); swapBtn.type = 'button';
      var heard = el('p', 'cb-callwin__film-said');
      heard.setAttribute('role', 'status');
      top.appendChild(line); top.appendChild(catchBtn); top.appendChild(swapBtn);
      var screen = el('div', 'cb-callwin__screen');
      panel.appendChild(top); panel.appendChild(heard); panel.appendChild(screen);
      document.body.appendChild(panel);
      film = { panel: panel, line: line, catchBtn: catchBtn, swapBtn: swapBtn, said: heard, screen: screen,
               beacon: null, heard: false, v: null, skew: 0, shown: '', timer: null, saidFor: null, offers: null };
      filmBtn.setAttribute('aria-controls', panel.id);
      // The host's place, read the moment the play button is pressed: this
      // listens before love-embed.js's own, which builds the frame from it.
      screen.addEventListener('click', function (e) {
        var p = e.target.closest('button.facade'), b = film && film.beacon;
        if (!p || !b) return;
        if (b.live) delete p.dataset.embedStart; else p.dataset.embedStart = String(Math.floor(placeOf(b)));
        setTimeout(filmDraw, 0);
      }, true);
      catchBtn.addEventListener('click', function () {
        var b = film.beacon, e = window.loveEmbed, w = e && e.where ? e.where() : null;
        if (!b || !w) { filmSay('Press play on the film first; it starts where they are.'); return; }
        var at = placeOf(b), got = e.seek(at);
        filmSay(got && !got.past ? 'Moved to ' + clock(at) + ', where ' + b.handle + ' is. Whether it plays is yours.'
          : 'Your film could not be moved there. Hide the film and show it again to start where they are.');
      });
      swapBtn.addEventListener('click', function () {
        var b = film.beacon, put = offered(b), old = screen.querySelector('div.facade');
        if (!b || !put) return;
        if (old) old.remove();
        var p = plateFor(b, put);
        screen.appendChild(p);
        film.shown = keyOf(b);
        filmDraw();
        p.focus();
        filmSay('\u201c' + b.film + '\u201d is up, waiting for your press.');
      });
      pageOffers(room.tag).then(function (o) { if (film && film.panel === panel) { film.offers = o; filmDraw(); } });
      filmDraw();
      filmAsk();
    } else if (!on && film) {
      // Taken away, film and all, so nothing more is asked or played.
      clearTimeout(film.timer);
      clearTimeout(film.saidFor);
      film.panel.remove();
      film = null;
      filmBtn.removeAttribute('aria-controls');
    }
  }
  filmBtn.addEventListener('click', function () { filmShown(!film); });
  document.addEventListener('visibilitychange', function () { if (film && document.visibilityState === 'visible') filmAsk(); });

  // The call the fragment names: a tag in a room's shape, and the words to show.
  function wanted() {
    var q = new URLSearchParams(location.hash.slice(1));
    var tag = q.get('tag') || '';
    if (tag.length > 80 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tag)) return null;
    var name = (q.get('name') || tag).slice(0, 120);
    var title = (q.get('title') || '').slice(0, 120) || 'The call in ' + name;
    return { tag: tag, name: name, title: title };
  }

  function nothing(s) {
    head.textContent = 'No call in this window';
    document.title = 'A call — Stimpunks.World';
    tell(s);
    more.hidden = false;
  }

  function go() {
    if (!window.loveCall) { nothing('This window could not load the call. Close it and try Pop out again.'); return; }
    var want = wanted();
    if (!want) { nothing('There is no call to open here. You can close this window.'); return; }
    // Another call popped out here takes this one's place, and its chat with it.
    if (room && room.tag !== want.tag && chatFrame) chatShown(false);
    if (room && room.tag !== want.tag && film) filmShown(false);
    room = want;
    pageNamed();
    if (window.loveCall.openRoom() === room.tag) return;
    head.textContent = room.title;
    document.title = room.title + ' — Stimpunks.World';
    more.hidden = true;
    tell('Opening the call…');
    window.loveCall.open(room, {
      whole: true,
      tools: [chatBtn, filmBtn, pageBtn], said: toolSaid,
      left: function (why) {
        if (why === 'switch') return;
        tell('You have left the call. You can close this window.');
        // A window a script opened is one a script may close; one somebody
        // opened by its address stays, saying the call is over.
        window.close();
      }
    }).then(function (r) {
      if (r.ok) { tell('The call is open in this window.'); return; }
      if (r.status === 401) { nothing('This browser is not signed on to the CB, so this window cannot join the call. Sign on at the Community Center, then pop the call out again.'); return; }
      nothing(r.said);
    });
  }

  window.addEventListener('hashchange', go);
  go();
})();

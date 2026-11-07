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
  var chatBtn = btn('Show the chat'), pageBtn = btn('Show the page');
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
    room = want;
    pageNamed();
    if (window.loveCall.openRoom() === room.tag) return;
    head.textContent = room.title;
    document.title = room.title + ' — Stimpunks.World';
    more.hidden = true;
    tell('Opening the call…');
    window.loveCall.open(room, {
      whole: true,
      tools: [chatBtn, pageBtn], said: toolSaid,
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

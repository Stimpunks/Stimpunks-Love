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
   ============================================================================= */
(function () {
  'use strict';
  var head = document.querySelector('[data-callwin-name]');
  var said = document.querySelector('[data-callwin-said]');
  var more = document.querySelector('[data-callwin-more]');
  function tell(s) { said.textContent = s; }

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
    var room = wanted();
    if (!room) { nothing('There is no call to open here. You can close this window.'); return; }
    if (window.loveCall.openRoom() === room.tag) return;
    head.textContent = room.title;
    document.title = room.title + ' — Stimpunks.World';
    more.hidden = true;
    tell('Opening the call…');
    window.loveCall.open(room, {
      whole: true,
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

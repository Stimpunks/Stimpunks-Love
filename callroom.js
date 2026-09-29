/* The rooms behind Cavendish Coworking's doors: joining a room's call from the
   room itself.

   Ryan's brief, 2026-09-28: Proton goes, every door opens onto a room of its
   own, and each room has a call. Events, Operations and Editorial are open to
   the world, as our meetings always were; the Cave, the Campfire and the
   Watering Hole are for people signed on to the CB, and anybody can walk in
   and look around. So a room's call panel is one of three things, decided
   here and nowhere else:

     · signed on to the CB (a pass in this browser's love-cb, READ and never
       written: signing on is the radio's job) -- "Join the call as <handle>";
     · not signed on, in a public room -- a name box and "Knock on the door",
       because a public call's lobby is on and a moderator lets you in;
     · not signed on, in one of the suites -- the way to get CB access, at the
       Community Center, and nothing to press;
     · in one of the Town Hall's private rooms (data-call-mods), anybody not
       signed on as the base gets the [data-call-cb] part, which there says the
       call is the base's. The server refuses them either way.

   THE BEHAVIOUR IS SHARED AND THE LOOK IS NOT, the job marker's rule: every
   room dresses its own panel, and this file only finds the parts by their
   data- attributes. Every part ships hidden, so a page with no script shows
   no control that does nothing. Nothing is fetched until a press, and
   call.js, which builds the window, is loaded on that press. The name a
   guest types goes to /cb/call and into their token for 8x8, and nowhere
   else: it is not stored, here or by us. */
(function () {
  'use strict';

  function member() {
    try { var v = JSON.parse(localStorage.getItem('love-cb') || 'null'); return v && v.pass ? v : null; }
    catch (e) { return null; }
  }

  function withCall(then) {
    if (window.loveCall) { then(); return; }
    var s = document.createElement('script');
    s.src = '/call.js';
    s.addEventListener('load', function () { if (window.loveCall) then(); });
    document.head.appendChild(s);
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-call]'), function (panel) {
    var room = { tag: panel.getAttribute('data-call'), name: panel.getAttribute('data-call-name') };
    var open = panel.hasAttribute('data-call-public');
    var mods = panel.hasAttribute('data-call-mods');
    var said = panel.querySelector('[data-call-said]');
    var guest = panel.querySelector('[data-call-guest]');
    var join = panel.querySelector('[data-call-join]');
    var cb = panel.querySelector('[data-call-cb]');
    var me = member();

    // Never hidden: a live region that is only unhidden when it has something to
    // say may not be announced at all. It is empty until then.
    function tell(s) { if (said) said.textContent = s; }

    function go(guestName, back) {
      tell('Opening the call…');
      withCall(function () {
        window.loveCall.open(room, {
          guest: guestName,
          left: function () { tell('You have left the call.'); if (back) back.focus(); }
        }).then(function (r) { tell(r.said); });
      });
    }

    if (me && join && (!mods || me.base)) {
      var who = join.querySelector('[data-call-handle]');
      if (who) who.textContent = me.handle;
      join.hidden = false;
      var b = join.querySelector('button');
      b.addEventListener('click', function () { go(null, b); });
    } else if (!me && open && guest) {
      guest.hidden = false;
      guest.addEventListener('submit', function (e) {
        e.preventDefault();
        var input = guest.querySelector('input');
        var name = input.value.trim();
        if (!name) { tell('Type the name you want to appear under first.'); input.focus(); return; }
        go(name, guest.querySelector('button'));
      });
    } else if (cb) {
      cb.hidden = false;
    }
  });
})();

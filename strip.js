/* =============================================================================
   Your strip: the avatars you kept, a frame each, in whichever room asks.

   THREE ROOMS SHOW IT AND ONE FILE DRAWS IT. The Bodymind Booth had a strip
   first; when the Dopamine Dress-Up Den and Fantasy Fancy Dress took it up it
   moved here, rack.js's rule. Each room calls window.loveStrip with its own
   parts, its own classes and what pressing a frame does there, so each dresses
   the strip in its own section and no two rooms share a look. The drawings are
   avatar.js's, which draws every avatar on the street.

   IT ONLY READS. "Open my strip" asks /cb/avatars for the avatars already
   kept, with the pass the radio keeps in love-cb, which this file reads and
   never writes, and only when somebody presses it. Keeping and changing are
   the rooms' own files, booth.js and try-on.js, and only when somebody presses
   a button that says it keeps. This sends nothing else, stores nothing, writes
   no markup from a string and draws nothing onto a canvas: an avatar stays a
   list of choices. tools/make-bodymind.py reads this file and refuses each of
   those, and a POST.

   AND IT READS YOUR CHIMERAS, FOR FANTASY FANCY DRESS'S CHIMERA ONESIE (a
   request from our community for Halloween, 2026-10-28): loveStrip.chimeras()
   asks /cb/chimeras for the chimeras already kept in Chimera Obscura, the same
   way and under the same rules, and only when somebody presses Bring my
   chimeras. Keeping one is Chimera Obscura's, as keeping an avatar is the
   booth's and the Den's.

   A SCREEN READER HEARS ONLY WHAT ITS OWNER WROTE. A frame's drawing is named
   by what was written about it, and is silent if nothing was; nothing here
   describes a body for anybody.

   AN ARIA-LIVE REGION DOES NOT ANNOUNCE TEXT IT ALREADY HOLDS, so say() clears
   it and sets it back on the next tick, as love.js does.
   ============================================================================= */
(function () {
  'use strict';

  var AVATARS = '/cb/avatars', CHIMERAS = '/cb/chimeras';

  function say(el, text) {
    el.textContent = '';
    setTimeout(function () { el.textContent = text; }, 60);
  }

  function pass() {
    try { var v = JSON.parse(localStorage.getItem('love-cb') || 'null'); return v && v.pass ? v.pass : null; }
    catch (e) { return null; }
  }

  function read(from) {
    var p = pass();
    if (!p) return Promise.resolve({ status: 0, body: {} });
    return fetch(from || AVATARS, { method: 'GET', credentials: 'omit', cache: 'no-store',
      headers: { 'accept': 'application/json', 'authorization': 'Bearer ' + p } }).then(function (r) {
      return r.json().then(function (b) { return { status: r.status, body: b }; }, function () { return { status: r.status, body: {} }; });
    }, function () { return { status: -1, body: {} }; });
  }

  function trouble(r) {
    if (r.status === 0) return 'Sign on to the CB first, at the Community Center, and press it again.';
    if (r.status === 401) return 'Since you signed on, this username has been signed off. Sign on again at the Community Center.';
    if (r.status === -1) return 'The street could not be reached just now.';
    return (r.body && typeof r.body.error === 'string') ? r.body.error : 'That did not work just now.';
  }

  /* o.shows   the part holding the button, unhidden once there is a pass
     o.open    the button that opens the strip
     o.list    the <ul> the frames go in, shipped hidden
     o.said    the strip's own status line
     o.item    the room's class for a frame; its __art and __name hang off it
     o.art     the room's class for the drawing itself
     o.none    what to say when nothing is kept yet
     o.act     function (avatar, wearing) giving the frame's button or link */
  window.loveStrip = function (o) {
    var A = window.loveAvatar;
    if (!A || !o || !o.open || !o.list || !o.said || typeof o.act !== 'function') return null;

    function frame(a, wearing) {
      var li = document.createElement('li');
      li.className = o.item;
      var pic = document.createElement('span');
      pic.className = o.item + '__art';
      if (a.about) { pic.setAttribute('role', 'img'); pic.setAttribute('aria-label', a.about); }
      else pic.setAttribute('aria-hidden', 'true');
      var art = A.draw(a.look, { ground: true, cls: o.art });
      if (art) pic.appendChild(art);
      li.appendChild(pic);
      var name = document.createElement('p');
      name.className = o.item + '__name';
      name.textContent = (a.name || 'Not named') + (wearing === a.id ? ', worn on the CB' : '');
      li.appendChild(name);
      var go = o.act(a, wearing);
      if (go) li.appendChild(go);
      return li;
    }

    function open() {
      say(o.said, 'Fetching your strip…');
      read().then(function (r) {
        if (r.status !== 200 || !r.body.avatars) { say(o.said, trouble(r)); return; }
        o.list.textContent = '';
        if (!r.body.avatars.length) { o.list.hidden = true; say(o.said, o.none || 'Nothing kept yet.'); return; }
        o.list.hidden = false;
        r.body.avatars.slice().reverse().forEach(function (a) { o.list.appendChild(frame(a, r.body.wearing)); });
        say(o.said, 'Your strip is open.');
      });
    }

    o.open.addEventListener('click', open);
    if (o.shows && pass()) o.shows.hidden = false;
    return {
      // After a room keeps or changes one, an open strip is read again.
      refresh: function () { if (!o.list.hidden) open(); }
    };
  };
  /* Your kept chimeras: a promise of { status, body }, body.chimeras each
     { id, parts, name }, and trouble() words for anything else. */
  window.loveStrip.chimeras = function () { return read(CHIMERAS); };
  window.loveStrip.trouble = trouble;
  window.loveStrip.signedOn = function () { return !!pass(); };
})();

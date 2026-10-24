/* =============================================================================
   The CB — the radio, and the sign-on counter at the Community Center.

   THE ONLY SCRIPT ON THIS SITE THAT SENDS ANYTHING, and it is not on any page
   until somebody has signed on. love.js loads it on a page only when a pass is
   already in this browser; the Community Center loads it itself, because that
   is where the pass comes from. Nobody who has not signed on ever downloads it.

   What it keeps, sends and refuses is written out on privacy.html, and every
   one of those sentences is kept here:

     · OPEN IS ON AND CLOSED IS OFF. It asks for the channel every few seconds
       while the radio is open AND the tab is in front of somebody, and at no
       other time. Folded down, or in a tab nobody is looking at, it sends
       nothing at all. That is the whole of "if the CB is closed you get
       nothing", and it is also what keeps this cheap.
     · NO ALERTS. No chime, no notification, no badge, no number, nothing in
       the page title. WHAT IS NEW TO YOU IS MARKED, NEVER COUNTED (Ryan's ask
       and call, 2026-10-20, reversing "no unread count" for a mark): a dot on
       World, This room, Your messages and a conversation, and the Unreads
       part, worked out by the server from when your claimed username last
       read each one. See newsTick. The
       channels it does use are the screen reader's and, if you switch it on,
       a voice reading the words out, and both only while the radio is open,
       each with its own switch on the radio. See setSpeak.
     · NOTHING IS COUNTED. No number of people on the channel, no number of
       messages. The pebbling cabinet's refusal of a tally, on the one object on
       this street that has other people on the other end of it.
     · WHAT PEOPLE TYPE IS WRITTEN WITH textContent AND NEVER innerHTML. It is
       the only place on the street where a stranger's words reach the page.
       An address on this street in a message becomes a link, built as an
       element whose href is a path this script assembled after checking every
       character of it; an address anywhere else stays words. See streetLinks.
       #the-den becomes a link to that room, named as the room names itself,
       out of the list in /cb-rooms.json; a #word that is not a room stays a
       word. See hashRooms, and the completion list under the message box.
     · IT NEVER SCROLLS UNDER SOMEBODY WHO IS READING. See show.
     · THE TELEPORTER GOES TO A ROOM AND SENDS NOTHING. See setTeleport.
     · THE PETS TRAY IS THE ONE THING KEPT UNDER A PERSON, and Forget Me is in
       it. See the tools row, and setPets.
     · WORLD OR THIS ROOM. The radio hears one channel at a time: World, the
       channel it always had, or the room it is on, each with the same rules.
       Tuned to a room it says which room every time it listens, and tuned to
       World it says nothing about where it is, so World is where it starts.
       See setBand.
     · A ROOM'S CALL IS A WINDOW OF ITS OWN. Join this room's call asks our
       /cb/call for a token for this handle and this room, and frames 8x8's
       call through love-embed.js, the only thing here that builds a frame.
       It is shown only when the channel says calls are switched on, the
       camera and microphone start off, and leaving the page hangs up. See
       setCall.
     · FOLLOW THE HOST IS EACH VIEWER'S OWN SWITCH. It keeps the film on your
       page in step with the host's, at your own volume, and it is the only
       thing here that plays, pauses or moves a film without a press on the
       film, because you pressed Follow. Your own pause ends it. It sends
       nothing: it reads the beacon every radio already hears. See followTick.
     · HOSTING A FILM IS A BEACON, AND IT GOES OUT ONLY FROM INSIDE listen().
       Host this film tells the channel where the film on your page has got
       to, when it plays, pauses or jumps and every half minute besides, and
       stops the moment the radio is folded; every radio shows each host and a
       way to catch up. See setHosting and drawBeacons.
     · A MODERATOR CAN SCREEN A VIDEO. Screen a video takes the address of one
       YouTube video and puts it up on the page's first screen, playing on the
       moderator's page and nowhere else; hosting it is what lets the room
       follow, and everybody else's screen gets its play button, unpressed. See
       screenVideo and plateFor.
     · @34:12 IS A PLACE IN THE FILM, and pressing it moves the film playing
       on YOUR page there, without pressing play. Add my spot writes your own
       place, film and room into the box and sends nothing. A stamp that
       names a film or a room moves nothing anywhere else. See stamps and
       jump. A LIVE VIDEO HAS NO PLACE, so its spot is @live and its beacon
       says live; pressing either gets its play button ready, and it has no
       Follow. See liveHere.
     · SMALL IS STILL ON. Folded is off and sends nothing; small is the bar and
       the newest message and nothing else, listening as it does full size, so
       somebody can watch a film in a room and still see the channel. See
       setSmall.

   It moves with the pointer or with the keyboard, and the keyboard is not an
   afterthought: a panel you can only reposition by dragging is a panel some of
   our visitors cannot get out of the way of the page.
   ============================================================================= */
(function () {
  'use strict';

  var KEY = 'love-cb';
  // This page's visit, for Be seen here: made up now, shown to nobody, gone with the page.
  var VISIT = (function () {
    var b = new Uint8Array(18);
    crypto.getRandomValues(b);
    return btoa(String.fromCharCode.apply(null, b)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  })();
  var MESSAGE_MAX = 2000;  // characters, as netlify/cb/lib.mjs takes them
  var EVERY = 4000;       // ms between listens while open and in front
  var BEAT = 30000;       // ms a host's beacon goes unsent at most, while nothing changes
  var FILM_MAX = 120;     // characters of a film's title on a beacon, as the server takes it
  var DRIFT = 3;          // seconds a follower may drift from the host before it is moved
  /* THE WORLD CALL's name: WORLD_CALL in netlify/cb/lib.mjs, copied, and
     make-sitemap.py refuses the two if they differ. One call for the whole
     street, joined from any room, the way the World channel is heard. */
  var WORLD_CALL = 'world';
  var WORLD = { tag: WORLD_CALL, name: 'World', title: 'The World call' };
  var SETTLE = 3000;      // ms a follower's player is given to obey before it is judged

  /* THE RADIO'S OWN WINDOW (Ryan's ask, 2026-10-19: "a popout for the CB like
     the video player, keeping currently selected size"). Pop out, under Your
     radio, opens cb-window.html in a browser window of its own, as big as the
     radio is and at the size it is, and the radio there carries on while you
     go from room to room in the window you came from: the way a radio can
     follow you about a street where every room is a page. Like the call's
     own window (call.js):
       · ONE RADIO AT A TIME. While it is out, the radio on every other page
         steps aside for a bar saying where it is, with Show it and Bring it
         back, which sends nothing, so two radios are never listening. The
         pages and the window talk only inside this browser, over a
         BroadcastChannel (love-cb-window), and love-cb keeps `popped` while
         it is out, so a page opened meanwhile knows before it asks.
       · IT IS ABOUT THE PAGE YOU CAME FROM. That window is this site's, so the
         radio reads where it is straight from it (streetDoc): This room, Be
         seen here, the room's call and Where you are are that page's, a link
         on the channel or the teleporter opens there, and an @time or Catch
         up moves the film there (loveCbFilms). It reads the page's address,
         its title and what its <body> says about it, nothing else, and sends
         nothing the radio on that page would not have sent. A page with no
         radio (data-cb="off") is no room to it, so the Healing Checkpoint is
         still a page that writes nothing down about you.
       · NOTHING ABOUT IT IS KEPT but `popped`, which goes with the window.
     Hosting a film and Follow stay with the radio in the page: they read and
     drive the film the whole time, and the film is in the other window. */
  var CB_WINDOW = '/cb-window.html';   // the page a popped-out radio is held in
  var CB_WINDOW_NAME = 'stimpunks-cb'; // one such window, found again by its name
  var popLine = typeof BroadcastChannel === 'function' ? new BroadcastChannel('love-cb-window') : null;
  function inWindow() { return !!(document.body && document.body.hasAttribute('data-cb-window')); }
  /* THE CHAT PAGE (Ryan's ask, 2026-10-22: "a /chat page with a Discord style
     interface for our room chat channels"). chat.html is the radio on a page
     of its own, docked into the page rather than floating over it, at Full,
     with every room's channel listed down the left in groups: Community
     (World, the Community Center, Dead Tired Society, Community Care, Show
     Your Work and every room at Cavendish Coworking), Staff (the Town Hall's
     private rooms and the forums' locked categories, each listed only for the
     people who can go in) and every other room under each of its tags (Ryan's
     ask, 2026-10-24, out of data/room-tags.json), in walking order. It
     is the same radio, so a channel there is the room's own channel, as This
     room hears it in the room, and everything the radio does it does for the
     channel picked: messages, replies, reactions, Be seen here and the room's
     call. The channel picked is in the address, after the #, so Back goes to
     the one before and a link can name one, and it is kept nowhere else.
       · IT CHANGES NOTHING FOR THE RADIO ON EVERY OTHER PAGE. Its size,
         whether it is folded, where it sits, World or This room, and whether
         it is popped out are love-cb's for those pages, and save() here writes
         back whatever they are there (CHAT_OWN), never this page's.
       · OPEN IS STILL ON: it listens while the page is in front of somebody,
         to the one channel picked and to nothing else. The marks on the other
         channels are Unreads' (newsTick), which asks nothing new.
     tools/make-chat.py writes the groups onto the page, out of
     data/coworking.json and MOD_ROOMS, and holds the rest. See chatMake. */
  function chatDock() { return document.querySelector('[data-cb-dock]'); }
  function inChat() { return !inWindow() && !!(document.body && document.body.hasAttribute('data-cb-chat') && chatDock()); }
  var CHAT_OWN = ['folded', 'size', 'small', 'popped', 'band', 'x', 'y'];
  var streetWin = null;
  // The window this one came from, or the one it last opened a room in, while
  // it is open and on this site.
  function streetWindow() {
    var ws = [streetWin, window.opener];
    for (var i = 0; i < ws.length; i++) {
      try {
        var w = ws[i];
        if (w && !w.closed && w.location.host === location.host && w.document && w.document.body && w.location.pathname !== CB_WINDOW) return w;
      } catch (e) { /* elsewhere now, or gone */ }
    }
    return null;
  }
  // The page the radio is about: this one, or from its own window, that
  // window's page, or null. A page with no radio, or one the pass may not use,
  // is none.
  function streetDoc() {
    if (!inWindow()) return document;
    var w = streetWindow(), b = w && w.document.body;
    if (!b || b.getAttribute('data-cb') === 'off') return null;
    if (b.getAttribute('data-cb') === 'mods' && !mayHere(load(), b)) return null;
    return w.document;
  }
  /* A CALL STAYS UP WHEN YOU FOLLOW A LINK (Ryan's ask, 2026-10-24). Every
     room is a page, and a page that goes takes its call with it, so following
     a #tag on the channel hung up the call you were in. While a call is open
     in the page a link would leave, anything in the radio that would leave it
     opens in a new tab instead, and the radio says so (tabTold); with no call
     up, links walk you from room to room as they always have. A link that
     stays on the page (the chat page's channels, a spot in this room) is not
     leaving, and a link to elsewhere already opens in a new tab. A call in a
     window of its own (Pop out) is in no page, so it changes nothing. Every
     other way off the page asks Leave site? first (call.js, guarding). The
     friendly edit is a new tab for every link "to be safe", which piles up
     tabs, each with its own radio, for everybody who was never in a call. */
  function callUp(w) {
    try { var c = (w || window).loveCall; return !!(c && c.isOpen && c.isOpen()); } catch (e) { return false; }
  }
  // Whether going to href would take the page w is showing away.
  function leavesPage(href, w) {
    var at, u;
    try { at = (w || window).location; u = new URL(href, at.href); } catch (e) { return false; }
    return u.origin === at.origin && (u.pathname !== at.pathname || u.search !== at.search);
  }
  // A new tab with nothing pointing back at this page, or null when the
  // browser would not open one.
  function newTab(href) {
    var t = null;
    try { t = window.open(href, '_blank'); } catch (e) { t = null; }
    if (t) { try { t.opener = null; } catch (e) { /* the browser decides */ } }
    return t;
  }
  /* Going somewhere from this page: 'tab' when a call here sent it to a new
     tab, 'kept' when the browser would not open one, so nothing moved, and
     nothing at all when it went. */
  function goPage(href) {
    if (callUp() && leavesPage(href)) return newTab(href) ? 'tab' : 'kept';
    location.href = href;
  }

  // An address on the street: opened here, or from the radio's own window, in
  // the window it came from, or a new one if that has gone. What it answers is
  // goPage's, for tabTold.
  function goStreet(href) {
    if (!inWindow()) return goPage(href);
    var w = streetWindow();
    if (!w) { try { w = window.opener && !window.opener.closed ? window.opener : null; } catch (e) { w = null; } }
    if (w && callUp(w) && leavesPage(href, w)) {
      var t = newTab(href);
      if (!t) return 'kept';
      streetWin = t;
      return 'tab';
    }
    if (w) { try { w.location.href = href; w.focus(); return; } catch (e) { /* gone */ } }
    streetWin = window.open(href, '_blank');
  }

  function load() {
    try { var v = JSON.parse(localStorage.getItem(KEY) || 'null'); return v && v.pass ? v : null; }
    catch (e) { return null; }
  }
  function save(v) {
    try {
      // The chat page leaves the radio on every other page as it found it.
      if (inChat()) {
        var was = load() || {};
        v = Object.assign({}, v);
        CHAT_OWN.forEach(function (k) { if (k in was) v[k] = was[k]; else delete v[k]; });
      }
      localStorage.setItem(KEY, JSON.stringify(v));
    } catch (e) { /* private window */ }
  }
  function forget() { try { localStorage.removeItem(KEY); } catch (e) { /* nothing to forget */ } }

  /* Redraw a picture on a canvas: at most 1600 pixels on its long side, the
     right way up, on white, as a JPEG. Nothing the camera wrote into the file
     survives a redraw, which is the point; the server refuses a file that
     still carries it. Smaller and softer again if it is still too big.

     WEBKIT'S ENCODER WRITES ITS OWN EXIF. Every iPhone browser, and Safari
     on a Mac, hands back a canvas JPEG with an Exif block (colour space and
     pixel size, no camera data) and an empty Photoshop block, measured in a
     WKWebView on 2026-10-18; the server refused every picture sent from an
     iPhone. So bare() keeps only what a JPEG needs to be drawn: the JFIF
     header, a colour profile, Adobe's colour marker and the image itself,
     and drops every other application block and comment. Anything it cannot
     read goes as it is, and the server still decides. */
  var PIC_SIDE = 1600, PIC_MAX = 1500000;
  function bare(blob) {
    return blob.arrayBuffer().then(function (buf) {
      var b = new Uint8Array(buf), keep = [b.subarray(0, 2)], i = 2;
      if (b[0] !== 0xff || b[1] !== 0xd8) return blob;
      while (i + 4 <= b.length) {
        if (b[i] !== 0xff) return blob;
        var m = b[i + 1];
        if (m === 0xff) { i++; continue; }
        if (m === 0xda) { keep.push(b.subarray(i)); return new Blob(keep, { type: 'image/jpeg' }); }
        if (m === 0x01 || (m >= 0xd0 && m <= 0xd7)) { keep.push(b.subarray(i, i + 2)); i += 2; continue; }
        var end = i + 2 + ((b[i + 2] << 8) | b[i + 3]);
        if (end > b.length) return blob;
        var app = m >= 0xe0 && m <= 0xef;
        if (!(app && m !== 0xe0 && m !== 0xe2 && m !== 0xee) && m !== 0xfe) keep.push(b.subarray(i, end));
        i = end;
      }
      return blob;
    });
  }
  function redraw(file) {
    return createImageBitmap(file, { imageOrientation: 'from-image' }).then(function (bmp) {
      function draw(side, q) {
        var sc = Math.min(1, side / Math.max(bmp.width, bmp.height));
        var c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(bmp.width * sc));
        c.height = Math.max(1, Math.round(bmp.height * sc));
        var g = c.getContext('2d');
        g.fillStyle = '#ffffff';
        g.fillRect(0, 0, c.width, c.height);
        g.drawImage(bmp, 0, 0, c.width, c.height);
        return new Promise(function (ok, no) { c.toBlob(function (b) { b ? ok(b) : no(); }, 'image/jpeg', q); }).then(bare);
      }
      return draw(PIC_SIDE, 0.86).then(function (b) {
        return b.size <= PIC_MAX ? b : draw(1100, 0.78).then(function (b2) { if (b2.size > PIC_MAX) throw new Error('big'); return b2; });
      });
    });
  }

  /* A PICTURE IS SHOWN BEFORE IT GOES (Ryan's ask, 2026-10-19), so you can see
     you picked the one you meant, and so picking one plainly did something. The
     box opens above the message box the moment a file is chosen, saying it is
     getting it ready, and then shows the picture as the radio redrew it, which
     is exactly what will be sent: the right way up, smaller, and with nothing of
     the camera's left in it. It is a blob: address in this browser alone, and
     nothing has gone anywhere until Transmit or Send. The line names the file,
     which is how somebody who cannot see the preview knows it is the right one.
     The channel's box and a conversation's work the same way, through these. */
  function picPending(box, img, line, file) {
    var name = file.name || 'the picture', waiting = !box.hidden && !!img.src;
    // A picture already waiting stays in view until the new one is ready.
    line.textContent = waiting ? 'Getting ' + name + ' ready, to go in place of the one above…' : 'Getting ' + name + ' ready…';
    if (!waiting) img.hidden = true;
    box.hidden = false;
    box.scrollIntoView({ block: 'nearest' });
  }
  function picReady(box, img, line, blob, file) {
    if (img.cbUrl) URL.revokeObjectURL(img.cbUrl);
    img.cbUrl = URL.createObjectURL(blob);
    img.src = img.cbUrl;
    img.hidden = false;
    line.textContent = 'This is the picture that will go with your message, ' + (file.name ? file.name + ', ' : '') +
      'as it will be sent: the radio has redrawn it and taken off anything the camera wrote into it. Nothing has gone yet.';
    box.hidden = false;
    box.scrollIntoView({ block: 'nearest' });
  }
  function picFailed(box, img, line, had) {
    if (had) { line.textContent = 'That picture could not be read, so the one above is still the one waiting to go.'; return; }
    picGone(box, img);
  }
  function picGone(box, img) {
    if (img.cbUrl) URL.revokeObjectURL(img.cbUrl);
    img.cbUrl = null;
    img.removeAttribute('src');
    img.hidden = true;
    box.hidden = true;
  }

  /* A PICTURE CAN BE PASTED (Ryan's ask, 2026-10-20): a screenshot on the
     clipboard goes into the message box with Ctrl or Cmd and V and comes to
     the same preview and the same redraw as one picked with Picture. Words
     pasted with it are pasted as words; only a clipboard holding a picture and
     no words is not also pasted as text. SVG is never a picture here. */
  function pastedPicture(e) {
    var d = e.clipboardData, f = null, i;
    if (!d) return null;
    var ok = function (t) { return /^image\//.test(t || '') && !/svg/i.test(t); };
    for (i = 0; d.files && i < d.files.length && !f; i++) if (ok(d.files[i].type)) f = d.files[i];
    for (i = 0; !f && d.items && i < d.items.length; i++) if (d.items[i].kind === 'file' && ok(d.items[i].type)) f = d.items[i].getAsFile();
    if (f && !d.getData('text/plain')) e.preventDefault();
    return f;
  }

  /* THE ONE REDRAW. The Brass Tacks Board takes a moderator's picture through
     this same function rather than a copy of it, because two copies of what
     strips a camera's GPS is one copy that gets fixed and one that does not.
     Only a signed-on page has the radio, and only a signed-on moderator posts. */
  window.loveRedraw = redraw;

  // A kept picture's file name: who sent it and when, so a folder of them sorts.
  function pictureName(m) {
    var d = new Date(m.t), two = function (n) { return (n < 10 ? '0' : '') + n; };
    var who = String(m.handle).replace(/[^A-Za-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'cb';
    return 'cb-' + who + '-' + d.getFullYear() + '-' + two(d.getMonth() + 1) + '-' + two(d.getDate()) +
      '-' + two(d.getHours()) + two(d.getMinutes()) + '.jpg';
  }

  /* A picture for a conversation under Messages, once it is accepted: the
     same redraw, its own address, and the handle in a header rather than the
     address, as /cb/dm keeps it in the body. */
  function sendDmPicture(blob, handle, pass) {
    return fetch('/cb/dm/image', {
      method: 'POST', body: blob, credentials: 'omit', cache: 'no-store',
      headers: { 'content-type': 'image/jpeg', 'authorization': 'Bearer ' + pass, 'accept': 'application/json', 'x-cb-with': encodeURIComponent(handle) },
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (b) { return { status: r.status, body: b }; });
    });
  }

  function sendPicture(blob, room, pass) {
    return fetch('/cb/image' + (room ? '?room=' + encodeURIComponent(room) : ''), {
      method: 'POST', body: blob, credentials: 'omit', cache: 'no-store',
      headers: { 'content-type': 'image/jpeg', 'authorization': 'Bearer ' + pass, 'accept': 'application/json' },
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (b) { return { status: r.status, body: b }; });
    });
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  /* ON A PHONE, RETURN MAKES A NEW LINE (feedback from our community,
     2026-10-19). A phone's keyboard has no Shift and Enter, so with Enter
     sending there was no way to start a new line on one. Where the main
     pointer is a finger and nothing hovers, Return is a new line and the
     button sends; Ctrl or Cmd and Enter sends everywhere, for a tablet with a
     keyboard on it. Every box that sends on Enter asks sendKey(), and its hint
     comes from enterHint(), so the two cannot disagree. */
  var TOUCH = window.matchMedia ? window.matchMedia('(hover: none) and (pointer: coarse)') : null;
  function onTouch() { return !!(TOUCH && TOUCH.matches); }
  function sendKey(e) {
    if (e.key !== 'Enter' || e.isComposing || e.shiftKey || e.altKey) return false;
    return e.ctrlKey || e.metaKey || !onTouch();
  }
  // The first half of a box's hint, for a button named `button` that does `does`.
  function enterHint(button, does) {
    return onTouch() ? 'Return makes a new line, and ' + button + ' ' + does + '.'
      : 'Enter ' + does + ', and Shift and Enter makes a new line.';
  }
  // A box that sends on Enter: the keyboard's key says what it does.
  function sendBox(t, key) {
    t.rows = onTouch() ? 4 : 2;
    t.setAttribute('enterkeyhint', onTouch() ? 'enter' : key);
  }

  function call(path, opts, pass) {
    opts = opts || {};
    var headers = { 'accept': 'application/json' };
    if (opts.body) headers['content-type'] = 'application/json';
    if (pass) headers['authorization'] = 'Bearer ' + pass;
    return fetch(path, {
      method: opts.body ? 'POST' : 'GET',
      headers: headers,
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      credentials: 'omit',
      cache: 'no-store',
      keepalive: !!opts.keepalive,
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (b) { return { status: r.status, body: b }; });
    });
  }

  /* A LINK TO ANOTHER ROOM IS A PATH ON THIS STREET. Ryan
     asked, 2026-09-25, so that somebody can drop a room on the channel for
     somebody else to join them in. Only this street's own addresses become
     links -- stimpunks.world/..., with or without https:// and www. -- and they
     open as a path on whatever host is serving the page, so they work the same
     on the dev server. An address anywhere else is AWAY's, below, and says it
     is leaving, because the channel is a stranger's words reaching the page.
     The path is checked character by character
     rather than escaped, so nothing but a path can reach an href. */
  var STREET = /(?:https?:\/\/)?(?:www\.)?stimpunks\.world(\/[A-Za-z0-9\-._~\/#?=&%+]*)?/gi;
  var TRAIL = /[.,;:!?)\]'"]+$/;

  /* AND AN ADDRESS ON ANOTHER SITE IS A LINK THAT SAYS IT IS LEAVING. Ryan's
     call, 2026-09-29, which widens the rule above rather than dropping its
     reason: a link off the street must not look like one on it. So only an
     address written out with http:// or https:// is taken, it is parsed with
     URL() and must still be http or https with a dotted host and no name or
     password in it (stimpunks.world@elsewhere is elsewhere), and it opens in a
     new tab with no referrer, nofollow and ugc, with the site it goes to
     written after it, as the browser spells that host, so a lookalike name
     shows its punycode. What was typed stays the words; the href is what
     URL() made of it. An address on this street is left to STREET above. */
  var AWAY = /\bhttps?:\/\/[^\s<>"“”‘’]+/gi;
  function awayUrl(said) {
    var u;
    try { u = new URL(said); } catch (e) { return null; }
    if (!/^https?:$/.test(u.protocol) || u.username || u.password) return null;
    if (!/\./.test(u.hostname)) return null;
    return u;
  }
  function onStreet(said) {
    try { var u = new URL(said); } catch (e) { return false; }
    return !u.username && !u.password && /^(?:www\.)?stimpunks\.world$/i.test(u.hostname);
  }
  // The address as typed, less punctuation after it (and Markdown's * and ~,
  // so **https://...** stays bold), and less a ) it did not open. One that
  // URL() refuses is kept as words, whole: stimpunks.world@elsewhere must not
  // come out half a link to the street.
  var AWAY_TRAIL = /[.,;:!?)\]'"*~]+$/;
  function awayAt(text) {
    var out = [], m, re = new RegExp(AWAY.source, 'gi');
    while ((m = re.exec(text))) {
      var said = m[0], t = said.match(AWAY_TRAIL);
      if (t) said = said.slice(0, -t[0].length);
      var opens = (said.match(/\(/g) || []).length, shuts = (said.match(/\)/g) || []).length;
      if (shuts < opens && m[0].charAt(said.length) === ')') said += ')';
      if (said.length > 8 && !onStreet(said)) out.push({ at: m.index, end: m.index + said.length, said: said, url: awayUrl(said) });
      re.lastIndex = m.index + Math.max(1, said.length);
    }
    return out;
  }
  function awayLink(said, u) {
    var a = el('a', 'cb-away', said);
    a.href = u.href;
    a.target = '_blank';
    a.rel = 'noopener noreferrer nofollow ugc';
    var host = u.hostname.replace(/^www\./, '');
    var mark = el('span', 'cb-away-host', ' \u2197\u00a0' + host);
    mark.setAttribute('aria-hidden', 'true');
    a.appendChild(mark);
    a.appendChild(el('span', 'sr', ', leaves the street for ' + host + ', in a new tab'));
    return a;
  }

  /* BASIC MARKDOWN, Ryan's ask, 2026-09-29, and it is drawn as elements, never
     as HTML: a message is split into lines and every piece becomes a node built
     here, with the words as text, so nothing anybody types can become markup.
     Paragraphs and line breaks; # a heading; > a quote; - or * or 1. a list;
     ``` a block of code; **bold**, *italic* or _italic_, ~~struck~~, `code`
     and [words](address) inline.
     A HEADING IS # AND A SPACE (Ryan's ask, 2026-10-19), so #the-den is still
     a room: # is a heading under the channel's own, an h3, ## an h4, and so
     on down to h6, the forums' rule that a heading in somebody's words is
     never the page's.
     A LINK CAN HAVE WORDS OF ITS OWN NOW (Ryan's ask, 2026-10-19, reversing
     "a [text](address) stays as typed"), and the old reason still holds,
     because a link off the street still says where it goes: [words](address)
     to another site is a link with those words and the host after them,
     exactly as a bare address is (awayLink), so no words can make it look
     like one on the street. One on the street is a path, checked as
     streetLinks checks one. And words that are themselves an address, or
     look like one (paypal.com), are not made a link at all: the whole thing
     stays as typed and its address is linked as it would be anyway, because
     words naming one site over a link to another are the thing to refuse.
     THREE THINGS ARE KEPT WHOLE and never parsed for emphasis: an address,
     on the street or off it (underscores in a path are not italics), a
     [words](address) link, and a place in a film with what it
     names (@1:25 in “the film” at #the-room), because a title with an asterisk
     in it would otherwise break the button that jumps to it. */
  var MD_ITEM = /^\s*([-*•]|\d{1,3}[.)])\s+(.*)$/;
  var MD_QUOTE = /^\s*>\s?(.*)$/;
  var MD_FENCE = /^\s*```/;
  var MD_HEAD = /^\s{0,3}(#{1,6})\s+(.*?\S)\s*#*\s*$/;
  var MD_EMPH = '\\*\\*(?=\\S)([^*\\n]*?\\S)\\*\\*|~~(?=\\S)([^~\\n]*?\\S)~~|(^|[^\\w*])\\*(?=\\S)([^*\\n]*?\\S)\\*(?![\\w*])|(^|[^\\w])_(?=\\S)([^_\\n]*?\\S)_(?!\\w)';
  // [words](address): one pair of brackets, and an address that may hold one
  // pair of brackets of its own, as Wikipedia's do, in <> or not.
  var MD_LINK = /\[([^\[\]\n]{1,300})\]\(\s*<?((?:[^\s()<>]|\([^\s()<>]*\))+)>?\s*\)/g;
  var STREET_PATH = /^\/(?!\/)[A-Za-z0-9\-._~\/#?=&%+]*$/;

  // Where a [words](address) link may go: a path on this street, or a site
  // elsewhere as awayUrl takes one. Anything else stays as typed.
  function mdTarget(said) {
    if (STREET_PATH.test(said)) return { path: said };
    var s = new RegExp('^' + STREET.source + '$', 'i').exec(said);
    if (s && /^[A-Za-z0-9\-._~\/#?=&%+]*$/.test(s[1] || '')) return { path: s[1] || '/' };
    if (!/^https?:\/\//i.test(said)) return null;
    var u = awayUrl(said);
    return u ? { away: u } : null;
  }
  /* Words that name a site other than the one the link goes to: an address,
     a word with www. or stimpunks.world in it, or words that are one word
     shaped like host.tld. Naming the link's own site disguises nothing, so
     [Chat — Stimpunks.World](https://stimpunks.world/chat) is a link (Ryan,
     2026-10-22, after it stayed raw on the channel), and so is
     [paypal.com](https://paypal.com/), while [paypal.com](https://elsewhere/)
     stays as typed. A link on the street's own site is stimpunks.world's. */
  function siteOf(t) {
    return t.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9\/]+$/g, '').replace(/^[a-z][a-z0-9+.-]*:\/\//i, '')
      .replace(/^www\./i, '').split(/[\/:?#]/)[0].toLowerCase();
  }
  function addressy(words, to) {
    var w = words.trim(), own = (to && to.away ? to.away.hostname : 'stimpunks.world').replace(/^www\./i, '').toLowerCase();
    var named = w.split(/\s+/).filter(function (t) { return /:\/\/|^\W*www\.|stimpunks\.world/i.test(t); });
    if (/^[^\s]*[A-Za-z0-9-]\.[A-Za-z]{2,}(?:[\/:?#][^\s]*)?$/.test(w)) named.push(w);
    return named.some(function (t) { return siteOf(t) !== own; });
  }
  function mdLinksIn(text) {
    var out = [], m, re = new RegExp(MD_LINK.source, 'g');
    while ((m = re.exec(text))) {
      if (m.index && text.charAt(m.index - 1) === '!') continue;
      var to = mdTarget(m[2]);
      if (!to || addressy(m[1], to) || !m[1].trim()) continue;
      out.push({ at: m.index, end: m.index + m[0].length, words: m[1].trim(), to: to });
    }
    return out;
  }
  function mdLink(l) {
    if (l.to.away) {
      var a = awayLink(l.words, l.to.away);
      a.classList.add('cb-md-a');
      return a;
    }
    var b = el('a', 'cb-md-a', l.words);
    b.href = l.to.path;
    return b;
  }
  /* LINKS TO TASKS, TOPICS AND THE OFFICE'S RECORDS (Ryan's ask, 2026-10-21,
     after Notion's): [[task:<id>]], typed by picking from the [[ menu
     (links.js), is drawn with the name /cb/links gives this reader, linked, or
     as words saying it is one they can't open. The words never carry the name,
     so nobody who can't open it is told it; each name is asked once and kept
     while the page is open. A chat leaves no backlink (lib.mjs, links). */
  var LINK_TOKEN = /\[\[(task|topic|grant|case|contact):([A-Za-z0-9_-]{13})\]\]/g;
  var LINK_KIND = { task: 'Task', topic: 'Forum topic', grant: 'Grant request', 'case': 'Case', contact: 'Contact' };
  var LINK_WORDS = { task: 'a task', topic: 'a forum topic', grant: 'a grant request', 'case': 'a case', contact: 'a contact' };
  var linkNames = {}, linkEls = [], linkWant = {}, linkTimer = 0;
  function linkEl(kind, id) {
    var e = el('span', 'cb-ref'), key = kind + ':' + id;
    e.setAttribute('data-ref', key);
    fillLink(e);
    linkEls.push(e);
    if (!(key in linkNames)) { linkWant[key] = 1; clearTimeout(linkTimer); linkTimer = setTimeout(askLinks, 60); }
    return e;
  }
  function fillLink(e) {
    var key = e.getAttribute('data-ref'), kind = key.split(':')[0], n = linkNames[key], words = LINK_WORDS[kind];
    e.textContent = '';
    e.className = 'cb-ref';
    if (n && n.name && typeof n.href === 'string' && /^\/[a-z-]+\.html#\//.test(n.href)) {
      var a = el('a', 'cb-md-a cb-ref__a');
      a.href = n.href;
      a.appendChild(el('span', 'cb-ref__kind', LINK_KIND[kind] + ': '));
      a.appendChild(document.createTextNode(n.name));
      e.appendChild(a);
    } else {
      e.className = 'cb-ref cb-ref--shut';
      e.textContent = n && n.gone ? words + (kind === 'topic' ? ' that has gone' : ' since deleted') : n && n.shut ? words + ' you can’t open' : words;
    }
  }
  function askLinks() {
    var keys = Object.keys(linkWant).slice(0, 50), s = load();
    linkWant = {};
    if (!keys.length || !s) return;
    call('/cb/links', { body: { action: 'names', refs: keys } }, s.pass).then(function (r) {
      var names = r.status === 200 && r.body && r.body.names ? r.body.names : null;
      keys.forEach(function (k) { linkNames[k] = names ? (names[k] || { shut: true }) : null; });
      linkEls = linkEls.filter(function (e) { return e.isConnected; });
      linkEls.forEach(function (e) { if (keys.indexOf(e.getAttribute('data-ref')) >= 0) fillLink(e); });
    }, function () {});
  }
  /* The [[ menu on a message box, once links.js is here; it asks /cb/links. */
  var linksAsked = false;
  function withLinks(then) {
    if (window.loveLinks) { then(); return; }
    var s = document.createElement('script');
    s.src = '/links.js';
    s.addEventListener('load', function () { if (window.loveLinks) then(); });
    if (!linksAsked) { linksAsked = true; document.head.appendChild(s); }
    else setTimeout(function () { withLinks(then); }, 200);
  }
  function linkBox(box, said) {
    withLinks(function () {
      window.loveLinks.attach(box, { above: true, said: said, ask: function (q) {
        var st = load();
        if (!st) return Promise.resolve([]);
        return call('/cb/links', { body: { action: 'find', q: q } }, st.pass).then(function (r) { return r.status === 200 && r.body ? r.body.found || [] : []; });
      } });
    });
  }

  // Text with any [words](address) links in it; everything between them goes
  // on to streetLinks as it always did. A [[link]] to a task, a topic or a
  // record is taken out first.
  function mdLinks(parent, text) {
    var at = 0, m, re = new RegExp(LINK_TOKEN.source, 'g');
    while ((m = re.exec(text))) {
      if (m.index > at) wordLinks(parent, text.slice(at, m.index));
      parent.appendChild(linkEl(m[1], m[2]));
      at = m.index + m[0].length;
    }
    if (at < text.length) wordLinks(parent, text.slice(at));
  }
  function wordLinks(parent, text) {
    var links = mdLinksIn(text), at = 0;
    for (var i = 0; i < links.length; i++) {
      if (links[i].at > at) streetLinks(parent, text.slice(at, links[i].at));
      parent.appendChild(mdLink(links[i]));
      at = links[i].end;
    }
    if (at < text.length) streetLinks(parent, text.slice(at));
  }

  function md(box, text) {
    var lines = String(text || '').split('\n'), i = 0, para = null, q, it, hd;
    while (i < lines.length) {
      var line = lines[i];
      if ((hd = MD_HEAD.exec(line))) {
        var h = el('h' + Math.min(6, hd[1].length + 2), 'cb-md-h cb-md-h' + Math.min(3, hd[1].length));
        inline(h, hd[2]);
        box.appendChild(h);
        para = null;
        i++;
        continue;
      }
      if (MD_FENCE.test(line)) {
        var code = [];
        for (i++; i < lines.length && !/^\s*```\s*$/.test(lines[i]); i++) code.push(lines[i]);
        i++;
        var pre = el('pre', 'cb-md-pre');
        pre.appendChild(el('code', null, code.join('\n')));
        box.appendChild(pre);
        para = null;
        continue;
      }
      if (!line.trim()) { para = null; i++; continue; }
      if (MD_QUOTE.test(line)) {
        var bq = el('blockquote', 'cb-md-quote'), inner = [];
        while (i < lines.length && (q = MD_QUOTE.exec(lines[i]))) { inner.push(q[1]); i++; }
        md(bq, inner.join('\n'));
        box.appendChild(bq);
        para = null;
        continue;
      }
      if ((it = MD_ITEM.exec(line))) {
        var ordered = /\d/.test(it[1]), list = el(ordered ? 'ol' : 'ul', 'cb-md-list');
        if (ordered && parseInt(it[1], 10) !== 1) list.start = parseInt(it[1], 10);
        while (i < lines.length && (it = MD_ITEM.exec(lines[i])) && /\d/.test(it[1]) === ordered) {
          var item = el('li');
          inline(item, it[2]);
          list.appendChild(item);
          i++;
        }
        box.appendChild(list);
        para = null;
        continue;
      }
      if (!para) { para = el('p', 'cb-md-p'); box.appendChild(para); }
      else para.appendChild(el('br'));
      inline(para, line);
      i++;
    }
    return box;
  }

  // `code` first: nothing inside a code span is anything but its words.
  function inline(parent, text) {
    var parts = text.split(/(`[^`\n]+`)/);
    for (var i = 0; i < parts.length; i++) {
      if (!parts[i]) continue;
      if (i % 2) parent.appendChild(el('code', 'cb-md-code', parts[i].slice(1, -1)));
      else emphasis(parent, parts[i]);
    }
  }

  function kept(text) {
    var out = awayAt(text).map(function (w) { return [w.at, w.end]; })
      .concat(mdLinksIn(text).map(function (l) { return [l.at, l.end]; }));
    var m, re = new RegExp(STREET.source, 'gi'), st = new RegExp(STAMP.source, 'g'), lk = new RegExp(LINK_TOKEN.source, 'g');
    while ((m = lk.exec(text))) out.push([m.index, m.index + m[0].length]);
    while ((m = re.exec(text))) out.push([m.index, m.index + m[0].length]);
    while ((m = st.exec(text))) {
      var end = m.index + m[0].length, n = text.slice(end).match(NAMED);
      out.push([m.index, end + (n ? n[0].length : 0)]);
    }
    return out;
  }

  function emphasis(parent, text) {
    var keep = kept(text), re = new RegExp(MD_EMPH, 'g'), at = 0, m;
    while ((m = re.exec(text))) {
      var lead = m[3] != null ? m[3] : m[5] != null ? m[5] : '';
      var s = m.index + lead.length, e = m.index + m[0].length;
      // A protected range may sit wholly inside the emphasis (**see https://...**)
      // but may not touch either of its markers.
      var ml = m[1] != null || m[2] != null ? 2 : 1;
      var hit = keep.some(function (k) { return (k[0] < s + ml && k[1] > s) || (k[0] < e && k[1] > e - ml); });
      if (hit) { re.lastIndex = m.index + 1; continue; }
      if (s > at) mdLinks(parent, text.slice(at, s));
      var tag = m[1] != null ? 'strong' : m[2] != null ? 's' : 'em';
      var w = el(tag);
      emphasis(w, m[1] != null ? m[1] : m[2] != null ? m[2] : m[4] != null ? m[4] : m[6]);
      parent.appendChild(w);
      at = e;
    }
    if (at < text.length) mdLinks(parent, text.slice(at));
  }

  function streetLinks(parent, text) {
    stampsIn(text);
    var from = 0, away = awayAt(text);
    for (var i = 0; i < away.length; i++) {
      if (away[i].at > from) streetPart(parent, text, from, away[i].at);
      parent.appendChild(away[i].url ? awayLink(away[i].said, away[i].url) : document.createTextNode(away[i].said));
      from = away[i].end;
    }
    if (from < text.length) streetPart(parent, text, from, text.length);
    return parent;
  }

  // The street's own addresses between from and to; every offset stays the
  // whole text's, because the #tags and stamps were read off the whole text.
  function streetPart(parent, whole, from, to) {
    var text = whole.slice(0, to), at = from, m;
    STREET.lastIndex = from;
    while ((m = STREET.exec(text))) {
      var said = m[0], path = m[1] || '/';
      var tail = said.match(TRAIL);
      if (tail) {
        said = said.slice(0, -tail[0].length);
        path = path.slice(0, Math.max(1, path.length - tail[0].length));
      }
      // "stimpunks.worldly" is a word, not an address, and neither is the tail
      // of somebody else's, like notstimpunks.world or elsewhere.example/stimpunks.world.
      var next = text.charAt(m.index + said.length);
      var prev = m.index > from ? text.charAt(m.index - 1) : ' ';
      if (!m[1] && /[A-Za-z0-9-]/.test(next)) continue;
      if (/[A-Za-z0-9.\/@_~%-]/.test(prev)) continue;
      if (m.index > at) hashRooms(parent, text.slice(at, m.index), at);
      var a = el('a', null, said);
      a.href = path;
      parent.appendChild(a);
      at = m.index + said.length;
      STREET.lastIndex = at;
    }
    if (at < to) hashRooms(parent, text.slice(at, to), at);
  }

  /* #ROOMS, DISCORD'S WAY. Ryan's call, 2026-09-25: a message carries
     #the-den, and every radio shows it as "#The Den", linked to the room. The
     tag is the room's filename and the name is its own <title>, both out of
     /cb-rooms.json, which tools/make-sitemap.py writes from every page's head,
     so a new room is a tag the day it is in the street's order. The list is
     fetched from this site once, the first time the radio listens -- never
     while it is folded, because folded means it sends nothing -- and until it
     arrives, or if it cannot, a #tag is shown as the words somebody typed. A
     #word that is not a room is a word: #1, #metoo and #tbt stay what they
     were. Nothing about the list is counted, and it is in walking order. */
  var rooms = null, byTag = {};
  var TAG = /#([a-z0-9]+(?:-[a-z0-9]+)*)/gi;
  var ROOMPATH = /^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\.html)?$/;

  /* EVERY FORUM CATEGORY IS A ROOM, AND ONLY ITS READERS KNOW ITS NAME. Ryan's
     calls, 2026-10-21: in the forums, This room is the category being read, a
     room in every way under the tag forum-<slug> (FORUM_ROOM in
     netlify/cb/lib.mjs, which tools/make-forum.py holds this copy to), and a
     subcategory is its top category's room. A category's room is not in
     /cb-rooms.json, which is public, so the radio asks once, with a claimed
     username's pass, for the rooms of the categories that pass may read
     (/cb/rooms), and puts them in the list after The forums themselves. A
     category somebody cannot read is never named to them, so #tags, the
     teleporter, Who's online and Unreads name it only for its readers; for
     anybody else it stays the words that were typed. */
  var FORUM_PAGE = 'forum', FORUM_ROOM = FORUM_PAGE + '-';
  var FORUMTAG = /^forum-[a-z0-9]+(?:-[a-z0-9]+)*$/;
  var FORUMPATH = /^\/forum\.html#\/c\/[a-z0-9]+(?:-[a-z0-9]+)*$/;
  var streetRooms = null, forumRooms = [];

  function takeRooms(list) {
    var ok = [];
    for (var i = 0; i < (list || []).length; i++) {
      var r = list[i];
      if (r && typeof r.tag === 'string' && typeof r.name === 'string' &&
          typeof r.path === 'string' && ROOMPATH.test(r.path) && !FORUMTAG.test(r.tag)) ok.push(r);
    }
    streetRooms = ok;
    mergeRooms();
  }

  function takeForumRooms(list) {
    var ok = [];
    for (var i = 0; i < (list || []).length; i++) {
      var r = list[i];
      if (r && typeof r.tag === 'string' && FORUMTAG.test(r.tag) && typeof r.name === 'string' &&
          typeof r.path === 'string' && FORUMPATH.test(r.path) && r.path.slice(r.path.lastIndexOf('/') + 1) === r.tag.slice(FORUM_ROOM.length)) {
        ok.push({ tag: r.tag, name: r.name, path: r.path, about: typeof r.about === 'string' ? r.about : '', forum: true, locked: r.locked === true });
      }
    }
    forumRooms = ok;
    mergeRooms();
  }

  // The street's rooms in walking order, with the forums' categories after them.
  function mergeRooms() {
    if (!streetRooms) return;
    var out = [];
    byTag = {};
    streetRooms.forEach(function (r) {
      out.push(r);
      byTag[r.tag] = r;
      if (r.tag === FORUM_PAGE) forumRooms.forEach(function (f) { out.push(f); byTag[f.tag] = f; });
    });
    rooms = out;
  }

  // A room's address with something for the page after it, which a category's
  // room cannot carry: its address has a fragment already.
  function roomHref(room, frag) { return frag && room.path.indexOf('#') < 0 ? room.path + frag : room.path; }

  function hashRooms(parent, text, off) {
    off = off || 0;
    var at = 0, m;
    TAG.lastIndex = 0;
    while ((m = TAG.exec(text))) {
      var room = byTag[m[1].toLowerCase()];
      var prev = m.index ? text.charAt(m.index - 1) : ' ';
      var next = text.charAt(m.index + m[0].length);
      if (!room || /[A-Za-z0-9_&#\/-]/.test(prev) || /[A-Za-z0-9_]/.test(next)) continue;
      if (m.index > at) stamps(parent, text.slice(at, m.index), off + at);
      var a = el('a', 'cb-room');
      var spot = tagAt[off + m.index];
      // A room named by a spot carries the spot, in the fragment, which no
      // browser sends to any server. See arrive.
      a.href = spot ? roomHref(room, '#spot=' + (spot.secs == null ? 'live' : spot.secs) + '&film=' + encodeURIComponent(spot.film)) : chatHref(room) || roomHref(room, '');
      var hash = el('span', null, '#');
      hash.setAttribute('aria-hidden', 'true');
      a.appendChild(hash);
      a.appendChild(document.createTextNode(room.name));
      if (spot) a.appendChild(el('span', 'sr', spot.secs == null ? ', ready to play live' : ', ready at ' + place(spot.secs)));
      parent.appendChild(a);
      at = m.index + m[0].length;
    }
    if (at < text.length) stamps(parent, text.slice(at), off + at);
  }

  /* A PLACE IN A FILM. Ryan, 2026-09-28: at a watch-together everybody runs
     their own player and pauses when they like, which is the point, and
     somebody drops a timestamp on the channel now and then so the others can
     find where the room has got to. "@34:12" or "@1:02:03" is shown as the
     sender typed it, as a button; pressing it moves the film on the page YOU
     are on to that place, through love-embed.js, which is the only thing on
     this site that talks to a player. It moves your place and never presses
     play: whether it plays is still yours, and nobody else's press moves
     anything of yours. The @ is what makes it a place rather than a time of
     day: "back at 7:30" stays words.
     @LIVE IS A LIVE VIDEO'S SPOT (Ryan, 2026-10-17): a live video has no place
     to move to, so Add my spot writes @live in “the video” at #the-room, and
     pressing it gets that video's own play button ready and presses nothing.
     It is a button only when it names a video, so "@live" in passing stays
     words. */
  var STAMP = /@(?:(?:(\d{1,2}):([0-5]\d)|(\d{1,3})):([0-5]\d)(?![\d:])|([Ll][Ii][Vv][Ee])(?![A-Za-z0-9_]))/g;

  /* WHICH FILM, AND WHICH ROOM. Ryan, 2026-09-28: a bare @34:12 dropped from
     one room moved whatever happened to be playing in another. So Add my spot
     writes @34:12 in “the film” at #the-room, the #tag becomes the
     room's name, linked, like any other, and a stamp that names a room or a
     film checks both before it moves anything: somewhere else, or a
     different film playing, and nothing moves, and the radio says where that
     place is. A stamp typed bare still moves whatever is playing, as it did.
     The message is split round addresses and #tags before stamps() sees it,
     so what each stamp names is read here off the whole message first, with
     the same test for where a stamp may start, and kept by where it stands
     in the message: stampAt for the stamp, tagAt for the # of the room it
     names, whose link then carries the spot. */
  var NAMED = /^ in “([^”]{1,200})”(?:,? (?:at )?#([a-z0-9]+(?:-[a-z0-9]+)*))?/i;
  var stampAt = {}, tagAt = {};

  function isStamp(text, i) {
    return !/[A-Za-z0-9_@.\/]/.test(i ? text.charAt(i - 1) : ' ');
  }

  function stampsIn(text) {
    var m;
    stampAt = {}; tagAt = {};
    STAMP.lastIndex = 0;
    while ((m = STAMP.exec(text))) {
      if (!isStamp(text, m.index)) continue;
      var end = m.index + m[0].length, n = text.slice(end).match(NAMED);
      if (m[5] && !n) continue;
      stampAt[m.index] = n ? { film: n[1], room: n[2] ? n[2].toLowerCase() : '' } : { film: '', room: '' };
      if (n && n[2]) tagAt[end + n[0].lastIndexOf('#')] = { secs: secsOf(m), film: n[1] };
    }
  }

  // null for @live, which has no place.
  function secsOf(m) {
    if (m[5]) return null;
    return m[1] != null ? (+m[1]) * 3600 + (+m[2]) * 60 + (+m[4]) : (+m[3]) * 60 + (+m[4]);
  }

  function stamps(parent, text, off) {
    var at = 0, m;
    off = off || 0;
    STAMP.lastIndex = 0;
    while ((m = STAMP.exec(text))) {
      if (!isStamp(text, m.index)) continue;
      var secs = secsOf(m);
      var what = stampAt[off + m.index] || { film: '', room: '' };
      if (secs == null && !what.film) continue;
      if (m.index > at) parent.appendChild(document.createTextNode(text.slice(at, m.index)));
      var b = el('button', 'cb-jump', m[0]);
      b.type = 'button';
      if (secs == null) b.dataset.live = '1';
      else b.dataset.at = String(secs);
      if (what.film) b.dataset.film = what.film;
      if (what.room) b.dataset.room = what.room;
      b.setAttribute('aria-label', secs == null
        ? 'Get ' + what.film + ' ready to play live'
        : 'Jump to ' + place(secs) + (what.film ? ' in ' + what.film : ''));
      parent.appendChild(b);
      at = m.index + m[0].length;
    }
    if (at < text.length) parent.appendChild(document.createTextNode(text.slice(at)));
  }

  // 754 -> "12:34", 3723 -> "1:02:03"
  function place(secs) {
    secs = Math.floor(secs);
    var h = Math.floor(secs / 3600), mi = Math.floor(secs / 60) % 60, se = secs % 60;
    var two = function (n) { return (n < 10 ? '0' : '') + n; };
    return h ? h + ':' + two(mi) + ':' + two(se) : mi + ':' + two(se);
  }

  /* What the completion list offers for what has been typed after a #: every
     room whose tag, or any word of whose name, starts with it, in walking
     order and no other, and no more than PICK of them. */
  var PICK = 8;
  /* The roles an @ can call (ROLES in netlify/cb/lib.mjs, which decides who
     may call which: mentionableRoles), and what the @ list says each calls.
     Never who holds one. */
  var ROLE_SAYS = { administrator: 'Calls every administrator', board: 'Calls the board', director: 'Calls every director', moderator: 'Calls every moderator' };
  var ROLE_OPT = {};
  Object.keys(ROLE_SAYS).forEach(function (r) { ROLE_OPT[r] = { role: r }; });
  function roomsFor(q, most) {
    var out = [], flat = q.replace(/-/g, ''), cap = most || PICK;
    for (var i = 0; i < rooms.length && out.length < cap; i++) {
      var r = rooms[i];
      var words = r.name.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
      var hit = r.tag.indexOf(q) === 0 || words.join('').indexOf(flat) === 0;
      for (var w = 0; !hit && w < words.length; w++) hit = words[w].indexOf(flat) === 0;
      if (hit) out.push(r);
    }
    return out;
  }

  /* WHAT THE TELEPORTER FINDS. Helen Edgar's asks, 2026-10-01: "fire" should
     find The Campfire, and a keyword should find the rooms it is about. So a
     room is found three ways, and every word typed has to be found in it:
     a name that starts with what you typed (the #tag completion's rule),
     then a name with it inside a word (fire, Campfire), then the room's own
     description, `about` in cb-rooms.json, which make-sitemap.py copies off
     the page's <meta name="description"> so nobody keeps a keyword list.
     Each group is in walking order and nothing is ranked within it. Small
     words (the, of, a) are looked for in names only, and a word shorter than
     three letters is not looked for inside names or in descriptions, so one
     letter does not offer the whole street. A room found by its description
     says the words it was found in. THIS IS ALSO IN guest.js AND finder.js,
     AND ALL THREE MUST STAY THE SAME; tools/check-teleport.py refuses them apart. */
  var TP_SMALL = /^(?:a|an|and|as|at|by|for|from|in|into|is|it|its|of|on|or|the|to|with)$/;
  function tpFold(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function tpWords(s) { return tpFold(s).split(/[^a-z0-9]+/).filter(Boolean); }
  // dogs finds dog: a plural is looked for as its singular, which also finds the plural.
  function tpRoot(t) { return t.length > 3 && /[^s]s$/.test(t) ? t.slice(0, -1) : t; }
  function tpBegins(words, t) { for (var i = 0; i < words.length; i++) if (words[i].indexOf(t) === 0) return true; return false; }
  function tpHas(words, t) { for (var i = 0; i < words.length; i++) if (words[i].indexOf(t) >= 0) return true; return false; }
  function tpAll(terms, test) { for (var i = 0; i < terms.length; i++) if (!test(terms[i])) return false; return true; }
  // A few words either side of the first one that matched, as written on the page.
  function tpWhy(about, t) {
    var bits = about.split(/\s+/);
    for (var i = 0; i < bits.length; i++) {
      if (!tpBegins(tpWords(bits[i]), t)) continue;
      var from = Math.max(0, i - 3), to = Math.min(bits.length, i + 5);
      return (from ? '…' : '') + bits.slice(from, to).join(' ').replace(/[,;:.]$/, '') + (to < bits.length ? '…' : '');
    }
    return '';
  }
  function findRooms(text) {
    var typed = tpWords(String(text).replace(/^\s*#/, ''));
    var terms = typed.map(tpRoot);
    var begins = [], inside = [], about = [];
    if (!terms.length) { for (var a = 0; a < rooms.length; a++) begins.push({ room: rooms[a], why: '' }); return begins; }
    var flat = terms.join(''), tag = typed.join('-');
    var keys = terms.filter(function (t) { return !TP_SMALL.test(t); });
    var long = tpAll(terms, function (t) { return t.length >= 3 || TP_SMALL.test(t); });
    var wide = keys.length > 0 && tpAll(keys, function (t) { return t.length >= 3; });
    for (var i = 0; i < rooms.length; i++) {
      var r = rooms[i], name = tpWords(r.name);
      if (r.tag.indexOf(tag) === 0 || name.join('').indexOf(flat) === 0 ||
          tpAll(terms, function (t) { return tpBegins(name, t); })) { begins.push({ room: r, why: '' }); continue; }
      if (long && tpAll(terms, function (t) { return tpHas(name, t); })) { inside.push({ room: r, why: '' }); continue; }
      if (!wide || typeof r.about !== 'string') continue;
      var said = tpWords(r.about);
      if (!tpAll(keys, function (t) { return tpBegins(said, t) || tpHas(name, t); })) continue;
      var shown = '';
      for (var k = 0; !shown && k < keys.length; k++) if (!tpHas(name, keys[k])) shown = tpWhy(r.about, keys[k]);
      about.push({ room: r, why: shown });
    }
    return begins.concat(inside, about);
  }

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

  /* A claimed username's pass is the only cb2.acct pass there is, so the pass
     itself says whether this radio is on as one. CLAIMED is no longer drawn
     anywhere (2026-10-21: every username is claimed, so a mark everybody wears
     says nothing); this decides only what the radio offers to whom. */
  function claimedPass(pass) { return /^cb2\.acct\./.test(pass || ''); }
  // A pass the forums take: any claimed username's, a moderator's own included.
  function forumPass(pass) { return /^cb2\./.test(pass || ''); }

  /* A MESSAGE CAN BE TWO DAYS OLD (Ryan, 2026-10-18: 48 hours on the channel,
     for the people asleep while it was said), so a time that is not today says
     which day, in the reader's own day: yesterday, or the day's name before
     that. clock() is what the log shows; sentAt() is the same for a label, read
     after "message". */
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function hhmm(d) { return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
  function dayAgo(t) {
    var d = new Date(t), now = new Date();
    var start = function (x) { return new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime(); };
    var n = Math.round((start(now) - start(d)) / 86400000);
    return n <= 0 ? '' : n === 1 ? 'yesterday' : DAYS[d.getDay()];
  }
  function clock(t) {
    var day = dayAgo(t), hm = hhmm(new Date(t));
    return day === 'yesterday' ? 'yesterday ' + hm : day ? day.slice(0, 3) + ' ' + hm : hm;
  }
  function sentAt(t) {
    var day = dayAgo(t), hm = hhmm(new Date(t));
    return (day === 'yesterday' ? 'from yesterday at ' : day ? 'from ' + day + ' at ' : 'at ') + hm;
  }

  /* ── The radio ─────────────────────────────────────────────────────────── */

  var radio = null;

  function Radio(state) {
    var me = this;
    this.state = state;
    this.seen = {};
    this.timer = null;
    // Let people find me lived for an afternoon (2026-10-07) and Who's online
    // replaced it; a browser that remembered it forgets it here.
    if ('findable' in state) { delete state.findable; save(state); }

    var chat = inChat();
    var box = this.box = el('section', 'cb-radio' + (inWindow() ? ' cb-radio--window' : '') + (chat ? ' cb-radio--chat' : ''));
    box.setAttribute('aria-label', 'CB radio');
    // In its own window it is out, and says so for any page opened meanwhile.
    if (inWindow() && !state.popped) { state.popped = true; save(state); }

    // The bar along the top is the handle you drag it by, and holds the buttons.
    var bar = this.bar = el('div', 'cb-bar');
    /* THE ICON, the smallest size (Ryan, 2026-10-19): a CB set drawn on the
       radio's own case, and while the radio is one, the icon is all of it. It
       is still on, which is what keeps it a size rather than folded: it
       listens, hosts, follows and keeps you seen as Small does. Pressing it
       opens the radio at Small; dragging it moves it (data-drag, the Mover's).
       Shown only at that size, by cb.css. See setSize. */
    var opener = this.openerBtn = el('button', 'cb-btn cb-opener');
    opener.type = 'button';
    opener.setAttribute('data-drag', '');
    opener.setAttribute('aria-label', 'The CB, still on: open it');
    opener.title = 'The CB, still on: open it';
    opener.appendChild(radioIcon());
    bar.appendChild(opener);
    var name = el('p', 'cb-name');
    name.appendChild(el('span', 'cb-brand', 'CB'));
    /* THE TELEPORTER, where "CH 19" used to sit. Ryan, 2026-09-26: the channel
       number was decoration, and the radio now knows every room on the street.
       Pressing it opens a box under the bar: type to narrow the list, arrows to
       move, Enter to go, Escape to put it away. Going to a room is ordinary
       navigation on this site, so it sends nothing to the channel and tells
       nobody where you went. It hides while the radio is folded, like Small,
       because folded sends nothing and the list is fetched from this site. */
    var tp = this.tpBtn = el('button', 'cb-tp', 'Teleport');
    tp.type = 'button';
    tp.setAttribute('aria-expanded', 'false');
    tp.setAttribute('aria-controls', 'cb-tp-panel');
    name.appendChild(tp);
    bar.appendChild(name);

    /* MOVE IS A GRIP AND THE SIZE IS MINUS AND PLUS (Ryan, 2026-10-17: Size then
       Small was a step too many). The grip is the same button the Mover drags by
       and listens to, named Move for a screen reader, so dragging it, or
       pressing it and then the arrow keys, moves the radio as Move did. Minus
       and plus step through Icon, Small, Normal, Large and Full, each named for
       the size it goes to; at either end the one with nowhere to go stays where
       it is, focusable, and says so, so the keyboard is never dropped off the
       bar. At Icon the bar is the icon, and pressing it is the way back up. */
    var move = this.moveBtn = el('button', 'cb-btn cb-icon-btn cb-move');
    move.type = 'button';
    move.id = 'cb-move';
    move.setAttribute('aria-label', 'Move');
    move.appendChild(barIcon('grip'));
    var moveHow = el('span', 'sr', 'Drag to move the radio, or press and use the arrow keys. Home puts it back in the corner.');
    moveHow.id = 'cb-move-how';
    move.setAttribute('aria-describedby', 'cb-move-how');
    bar.appendChild(move);
    bar.appendChild(moveHow);

    var sizer = this.sizer = el('span', 'cb-sizer');
    sizer.setAttribute('role', 'group');
    sizer.setAttribute('aria-label', 'Radio size');
    var smaller = this.smallerBtn = el('button', 'cb-btn cb-icon-btn cb-smaller');
    smaller.type = 'button';
    smaller.appendChild(barIcon('minus'));
    var larger = this.largerBtn = el('button', 'cb-btn cb-icon-btn cb-larger');
    larger.type = 'button';
    larger.appendChild(barIcon('plus'));
    sizer.appendChild(smaller);
    sizer.appendChild(larger);
    bar.appendChild(sizer);

    var fold = this.foldBtn = el('button', 'cb-btn cb-fold');
    fold.type = 'button';
    fold.setAttribute('aria-controls', 'cb-set');
    bar.appendChild(fold);
    box.appendChild(bar);
    /* THE TRIMS: a band under the bar and one at the foot, where a theme with a
       drawing draws it (cb-themes.js). Empty and hidden for every other theme,
       aria-hidden always, and drawn again whenever their width changes, which
       is also when the radio unfolds or comes back from Small. See drawArt. */
    var trimTop = this.trimTop = el('div', 'cb-trim cb-trim--top');
    var trimFoot = this.trimFoot = el('div', 'cb-trim cb-trim--foot');
    var sideL = this.sideL = el('div', 'cb-side cb-side--left');
    var sideR = this.sideR = el('div', 'cb-side cb-side--right');
    [trimTop, trimFoot, sideL, sideR].forEach(function (t) { t.hidden = true; t.setAttribute('aria-hidden', 'true'); });
    box.appendChild(trimTop);

    var tpp = this.tpPanel = el('div', 'cb-tp-panel');
    tpp.id = 'cb-tp-panel';
    tpp.hidden = true;
    var tlab = el('label', 'cb-lab', 'Teleport to a room, or to @somebody');
    tlab.htmlFor = 'cb-tp-find';
    var find = this.tpFind = el('input', 'cb-say cb-tp-find');
    find.id = 'cb-tp-find';
    find.type = 'text';
    find.autocomplete = 'off';
    find.spellcheck = false;
    find.setAttribute('role', 'combobox');
    find.setAttribute('aria-autocomplete', 'list');
    find.setAttribute('aria-controls', 'cb-tp-list');
    find.setAttribute('aria-expanded', 'true');
    var tlist = this.tpList = el('ul', 'cb-pick cb-tp-list');
    tlist.id = 'cb-tp-list';
    tlist.setAttribute('role', 'listbox');
    tlist.setAttribute('aria-label', 'Rooms on the street');
    this.tpNone = el('p', 'cb-quiet', '');
    this.tpNone.hidden = true;
    this.tpOffer = [];
    this.tpActive = -1;
    tpp.appendChild(tlab);
    tpp.appendChild(find);
    tpp.appendChild(tlist);
    tpp.appendChild(this.tpNone);
    box.appendChild(tpp);

    // Everything below the bar is the set, and folding it switches it off.
    var set = this.set = el('div', 'cb-set cb-set--parts');
    set.id = 'cb-set';

    /* THE SET IS IN PARTS, EACH UNDER A HEADING. Ryan, 2026-10-13, after user
       testing: the radio had grown one control at a time into one long column
       with nothing to say where one part ended and the next began, and people
       could not tell where they were. So it reads top to bottom as where you
       are, the channel, messages, what is about this channel, who is around,
       what is new and the events, watching together, you, and your radio
       (Ryan's order, 2026-10-23, after the channel had been pushed too far
       down), with space and a groove in the case between them. The headings are real ones,
       so a screen reader can move between the parts, and they are lettered on
       the case in the radio's own clothes. Small shows none of them. */
    /* THREE COLUMNS, which are only columns at Full on a wide window (Ryan,
       2026-10-19), left to right in the order the parts come top to bottom.
       Since 2026-10-23 the radio's first column is where you are and the
       channel, wide (b), then messages, this channel, who is around, Unreads
       and Events (c), then watching together, you and your radio (d); the chat
       page puts its channels down the left (a) and has no fourth. A column
       with nothing in it is not drawn. At every other size cb.css makes them
       display: contents and the parts stand in one column. The groove is
       above every part but the first (cb-sec--after), because a part's
       neighbour may be in another column. */
    var cols = ['a', 'b', 'c', 'd'].map(function (k) { return el('div', 'cb-col cb-col--' + k); });
    cols.forEach(function (c) { set.appendChild(c); });
    var dividers = this.dividers = [], parts = 0;
    function part(cls, title, col) {
      var sec = el('div', 'cb-sec ' + cls + (parts ? ' cb-sec--after' : ''));
      // The groove above every part after the first carries a theme's drawing too.
      if (parts) {
        var dv = el('div', 'cb-divider');
        dv.hidden = true;
        dv.setAttribute('aria-hidden', 'true');
        sec.appendChild(dv);
        dividers.push(dv);
      }
      parts++;
      sec.appendChild(el('h2', 'cb-h', title));
      cols[col].appendChild(sec);
      return sec;
    }
    /* ON THE CHAT PAGE the channels come first, down the left, and what is
       about the channel picked and who is around stand on the right, after
       the channel, the way chat lays them out. See chatMake. */
    var chansSec = chat ? part('cb-sec--chans', 'Channels', 0) : null;
    /* WHERE YOU ARE, the room's name, and then straight away the channel
       (Ryan, 2026-10-23: the channel was pushed too far down, under Who's
       around, Unreads and Events). The chat page names the channel picked
       over its messages instead, so it has no Where you are. */
    var whereSec = chat ? null : part('cb-sec--where', 'Where you are', 1);
    /* IN THIS CHANNEL, as the chat page has it (the same day): On the channel
       as, Be seen here, Bring my familiar, the room's call and what is on now
       here, under Messages. */
    var hereSec = part('cb-sec--here', 'In this channel', 2);
    var aroundSec = part('cb-sec--around', 'Who\u2019s around', 2);
    /* UNREADS (Ryan's proposal, 2026-10-20): World, the rooms you follow and
       your conversations, each listed while something has been said there
       since you last read it, and never how much. See newsShown. */
    var newSec = this.newSec = part('cb-sec--new', 'Unreads', chat ? 0 : 2);
    this.newList = el('ul', 'cb-new-list');
    this.newList.hidden = true;
    this.newNone = el('p', 'cb-quiet');
    newSec.appendChild(this.newList);
    newSec.appendChild(this.newNone);
    /* FOLLOW EVERY ROOM (Norah's ask, 2026-10-21): every room you can go into
       on Unreads, rooms added later included, instead of following them one
       at a time. Kept in love-cb as followAll and sent nowhere; the rooms you
       followed one by one stay your list for when it goes off. Never a room
       that keeps to itself, which the street does not list. */
    var fa = this.followAllBtn = el('button', 'cb-btn cb-follow-room', 'Follow every room: off');
    fa.type = 'button';
    fa.hidden = true;
    fa.setAttribute('aria-pressed', 'false');
    fa.addEventListener('click', function () { me.setFollowAll(fa.getAttribute('aria-pressed') !== 'true'); });
    newSec.appendChild(fa);
    this.newsSaid = el('p', 'cb-said');
    this.newsSaid.setAttribute('role', 'status');
    newSec.appendChild(this.newsSaid);
    /* EVENTS (Ryan's ask, 2026-10-23, after Discord's): what is on now in
       this room, and the list of what is scheduled. On the chat page it is
       the middle, under Events at the top of the channels. See evMake. */
    var evSec = this.evSec = part('cb-sec--events', 'Events', chat ? 0 : 2);
    this.evMake(evSec);
    var chanSec = part('cb-sec--channel', 'Channel', 1);
    var dmSec = this.dmSec = part('cb-sec--dm', 'Messages', 2);
    // Messages comes straight after the channel, before In this channel.
    if (!chat) cols[2].insertBefore(dmSec, hereSec);
    var filmSec = this.filmSec = part('cb-sec--film', 'Watching together', chat ? 2 : 3);
    filmSec.hidden = true;
    /* YOU, Profile and Sign off under a heading of their own (Ryan's ask,
       2026-10-19): with Profile open he lost where it started, and scrolled
       past its top looking for the button to close it. The tray opens under
       this heading, and Your radio, after it, is the radio's own switches. */
    var youSec = part('cb-sec--you', 'You', chat ? 2 : 3);
    var yourSec = part('cb-sec--yours', 'Your radio', chat ? 2 : 3);
    /* MESSAGES, straight after the channel (Ryan, 2026-10-18; under it since
       2026-10-23): one person to another, for claimed usernames. See dmMake. */
    this.dmMake(dmSec);
    if (chat) this.chatMake(chansSec, chanSec, dmSec);

    /* WHERE YOU ARE, in words, at the top. Ryan, 2026-10-13: some people could
       not tell where they were. "Tuned to World" is the channel and not the
       place, so the room this page is gets a line of its own, the largest
       words on the radio. See hereShown. */
    this.hereName = el('p', 'cb-here-name');
    (whereSec || hereSec).appendChild(this.hereName);

    /* I NEED A BODYMIND BREAK (Helen Edgar's idea and Ryan's answer,
       2026-10-24): the calm screen in bodymind-break.js, straight under where
       you are, and on the bar while the radio is folded, where Teleport and
       the size buttons step aside and leave it room. Not on the bar at Small,
       which is full; the dial's box has one too. Opening it sends nothing, and
       the radio says nothing aloud while it is up (see speak). */
    var whereRow = el('div', 'cb-tools cb-where-tools');
    var brk = this.breakBtn = el('button', 'cb-btn cb-break', 'I need a bodymind break');
    brk.type = 'button';
    brk.setAttribute('aria-haspopup', 'dialog');
    brk.addEventListener('click', function () { me.hush(); takeBreak(brk); });
    whereRow.appendChild(brk);
    /* THE GLITTER DIAL, beside it (a request from our community, 2026-10-24):
       the dial's levels and its low-stimulation modes, from any page the
       radio is on, the pages with no dial of their own included. Its panel
       opens straight after its button, on a line of its own. See dialMake. */
    var dialBtn = this.dialBtn = el('button', 'cb-btn cb-dial-btn', 'Glitter dial');
    dialBtn.type = 'button';
    dialBtn.setAttribute('aria-expanded', 'false');
    dialBtn.setAttribute('aria-controls', 'cb-dial');
    dialBtn.addEventListener('click', function () { me.dialOpen(dialBtn.getAttribute('aria-expanded') !== 'true'); });
    whereRow.appendChild(dialBtn);
    var dialPanel = this.dialPanel = el('div', 'cb-dial');
    dialPanel.id = 'cb-dial';
    dialPanel.hidden = true;
    whereRow.appendChild(dialPanel);
    /* OPEN IN CHAT, after the dial (the same request): the chat page with the
       room you are in picked, or World where this page is no room. Not on
       the chat page, and not in a room that keeps to itself, whose name the
       chat page never lists and whose #tag is its address. See hereShown. */
    var toChat = this.toChatLink = el('a', 'cb-btn cb-to-chat', 'Open in Chat');
    toChat.href = '/' + CHAT_PAGE + '.html';
    toChat.hidden = true;
    whereRow.appendChild(toChat);
    (whereSec || hereSec).appendChild(whereRow);
    // The page's own dial and the bodymind break turn the same dial.
    document.addEventListener('love-low', function () { me.dialShown(); });
    document.addEventListener('love-intensity', function () { me.dialShown(); });
    // Break on the bar, as on the guest bar; its name says the whole of it.
    var brkBar = this.breakBarBtn = el('button', 'cb-btn cb-break-bar', 'Break');
    brkBar.type = 'button';
    brkBar.hidden = true;
    brkBar.setAttribute('aria-label', 'I need a bodymind break');
    brkBar.title = 'I need a bodymind break';
    brkBar.setAttribute('aria-haspopup', 'dialog');
    brkBar.addEventListener('click', function () { me.hush(); takeBreak(brkBar); });
    bar.insertBefore(brkBar, move);

    var who = el('p', 'cb-who');
    who.appendChild(document.createTextNode('On the channel as '));
    who.appendChild(el('b', null, state.handle));
    if (state.base) who.appendChild(el('span', 'cb-tag', 'BASE'));
    hereSec.appendChild(who);

    /* THE BAND SWITCH: World, or this room's own channel. Two buttons, one
       pressed, the dial's pattern. This room is only offered on a page that is
       a room on the street. */
    var band = el('div', 'cb-band');
    band.setAttribute('role', 'group');
    band.setAttribute('aria-label', 'Channel');
    var bw = this.worldBtn = el('button', 'cb-btn cb-band-btn', 'World');
    bw.type = 'button';
    var br = this.roomBtn = el('button', 'cb-btn cb-band-btn', 'This room');
    br.type = 'button';
    band.appendChild(bw);
    band.appendChild(br);
    /* FOLLOW THIS ROOM, for Unreads: kept in love-cb, in this browser, and
       sent nowhere. Only on a page that is a room, and only for a claimed
       username, because only one is told what is new. */
    var fr = this.followRoomBtn = el('button', 'cb-btn cb-follow-room', 'Follow this room: off');
    fr.type = 'button';
    fr.hidden = true;
    fr.setAttribute('aria-pressed', 'false');
    fr.addEventListener('click', function () { me.setFollowRoom(fr.getAttribute('aria-pressed') !== 'true'); });
    band.appendChild(fr);
    chanSec.appendChild(band);
    /* THE FORUMS (Ryan, 2026-10-18): for what needs longer than the channel's
       day, for claimed usernames. A link, and Take to the forums under a
       message's More; the radio never sends anything to them itself. */
    var forumLine = el('p', 'cb-quiet cb-forum-line');
    forumLine.appendChild(document.createTextNode('For what needs longer than two days: '));
    var forumLink = el('a', null, 'the forums');
    forumLink.href = '/forum.html';
    forumLine.appendChild(forumLink);
    forumLine.appendChild(document.createTextNode(forumPass(state.pass) ? '.' : ', for claimed usernames.'));
    chanSec.appendChild(forumLine);
    /* THE WORLD ROOM, beside it (Ryan, 2026-10-19): every room on one page,
       with which are active now and which have a call going. Left off in the
       World room itself, which is where it would send you. */
    if (!worldHere()) {
      var worldLine = el('p', 'cb-quiet cb-world-line');
      worldLine.appendChild(document.createTextNode('For a list of active rooms and calls: '));
      var worldLink = el('a', null, 'the World room');
      worldLink.href = '/' + WORLD_CALL + '.html';
      worldLine.appendChild(worldLink);
      worldLine.appendChild(document.createTextNode('.'));
      chanSec.appendChild(worldLine);
    }
    /* WHO'S ONLINE, under Who's around. Ryan, 2026-10-07: "Folks are
       wanting to know who's around and are having a hard time connecting right
       now." Everybody seen in a room, with the rooms they are in, for anybody
       signed on. It reverses the rule that a radio not seen is told nothing,
       and the CB's refusal of a list of who is on; both were Ryan's calls, and
       so is this. Names in alphabetical order, BASE as on the
       channel, no number, and not a live region: it is redrawn on each listen
       while it is open, and only then, because listen() is the only thing that
       asks. A name opens that person's profile, as a handle on the channel does
       (Ryan, 2026-10-13), and under the people is every room whose call has
       somebody in it: the rooms, never who or how many. See onlineShown. */
    var ob = this.onlineBtn = el('button', 'cb-btn cb-online-btn', 'Who\u2019s online');
    ob.type = 'button';
    ob.setAttribute('aria-expanded', 'false');
    ob.setAttribute('aria-controls', 'cb-online');
    /* JOIN WORLD CALL, beside it. Ryan, 2026-10-13: a call for the whole
       street, which anybody signed on can join from any room. It is a room's
       call in every other way, in the same window, and like every call it
       hangs up when the page goes, so going to another room leaves it. See
       setCall. */
    var wcall = this.worldCallBtn = el('button', 'cb-btn cb-call-btn cb-world-call', 'Join World call');
    wcall.type = 'button';
    wcall.hidden = true;
    wcall.setAttribute('aria-pressed', 'false');
    /* SHOW THE CALL WINDOW, while a call is popped out into a window of its
       own (call.js, Ryan, 2026-10-13): the window stays open while you go from
       room to room, and this brings it to the front from whichever room you
       are in. The call's own button, pressed again, hangs it up. */
    var showWin = this.showWinBtn = el('button', 'cb-btn cb-show-call', 'Show the call window');
    showWin.type = 'button';
    showWin.hidden = true;
    var aroundRow = el('div', 'cb-tools');
    aroundRow.appendChild(ob);
    aroundRow.appendChild(wcall);
    aroundRow.appendChild(showWin);
    aroundSec.appendChild(aroundRow);
    var online = this.online = el('div', 'cb-online');
    online.id = 'cb-online';
    online.hidden = true;
    online.appendChild(el('p', 'cb-online-about', 'Everybody who has switched on Be seen here, and the room they are in. A name opens their profile, and a room\u2019s name takes you there.'));
    online.appendChild(el('h3', 'cb-h3', 'People'));
    this.onlineList = el('ul', 'cb-online-list');
    this.onlineList.setAttribute('aria-label', 'Who\u2019s online');
    online.appendChild(this.onlineList);
    this.onlineNone = el('p', 'cb-seen-now');
    online.appendChild(this.onlineNone);
    this.onlineMe = el('p', 'cb-seen-now');
    online.appendChild(this.onlineMe);
    // Everybody who chose to be listed, seen or not (2026-10-23).
    var dirLine = el('p', 'cb-seen-now');
    dirLine.appendChild(document.createTextNode('Everybody who chose to be listed, seen in a room or not, is in '));
    var dirLink = el('a', null, 'the community directory');
    dirLink.href = '/directory.html';
    dirLine.appendChild(dirLink);
    dirLine.appendChild(document.createTextNode('.'));
    online.appendChild(dirLine);
    // Shown only once the server says 8x8 is telling it, so no call is a guess.
    var calls = this.callsBox = el('div', 'cb-online-calls');
    calls.hidden = true;
    calls.appendChild(el('h3', 'cb-h3', 'Calls going now'));
    this.callList = el('ul', 'cb-online-list');
    this.callList.setAttribute('aria-label', 'Calls going now');
    calls.appendChild(this.callList);
    this.callNone = el('p', 'cb-seen-now');
    calls.appendChild(this.callNone);
    online.appendChild(calls);
    aroundSec.appendChild(online);
    // Where a room's link here says it opened in a new tab (tabTold).
    var aroundSaid = this.aroundSaid = el('p', 'cb-said');
    aroundSaid.setAttribute('role', 'status');
    aroundSec.appendChild(aroundSaid);
    // YOUR CHAT STATUS (Ryan's ask, 2026-10-24), for a claimed username. See chatStatusMake.
    if (forumPass(this.state.pass)) this.chatStatusMake(aroundSec);

    /* BE SEEN HERE, the Slake's switch in every room. Ryan, 2026-09-29. One
       switch both ways: seen, the radio is told who else is seen in this room
       and who is in its call; not seen, it asks and is told nothing. Handles
       only, alphabetical, with no number. Remembered in this browser once
       pressed (Ryan's call the same day), and it sends nothing while folded or
       in a tab behind another, because listen() is the only thing that asks.
       Not a live region: it is redrawn on every listen, and somebody arriving
       is not an alert. */
    /* IN THIS CHANNEL IS IN SUBSECTIONS, each under a heading of its own
       (Ryan's ask, 2026-10-24: "we like big headings and breaking things into
       sections"): Seen here, In this room's call, Your familiar and On now. A
       subsection with nothing showing under its heading is not shown (cb.css,
       .cb-sub), so no heading ever stands over nothing. */
    var present = this.present = el('div', 'cb-sub cb-present');
    present.appendChild(el('h3', 'cb-h3', 'Seen here'));
    // It says whether it is on, as the switches under Your radio do (Ryan's ask, 2026-10-19).
    var seenBtn = this.seenBtn = el('button', 'cb-btn cb-seen', 'Be seen here: off');
    seenBtn.type = 'button';
    seenBtn.setAttribute('aria-pressed', 'false');
    this.seenNow = el('p', 'cb-seen-now');
    present.appendChild(seenBtn);
    present.appendChild(this.seenNow);
    present.hidden = true;
    hereSec.appendChild(present);
    // The room's call: Join this room's call (callBtn, below) and who is in it.
    var callSub = this.callSub = el('div', 'cb-sub cb-call-sub');
    callSub.appendChild(el('h3', 'cb-h3', 'In this room\u2019s call'));
    this.inCallNow = el('p', 'cb-seen-now cb-in-call');
    this.inCallNow.hidden = true;
    callSub.appendChild(this.inCallNow);
    hereSec.appendChild(callSub);
    /* BRING MY FAMILIAR (Ryan, 2026-10-19): only for a claimed username with
       a familiar following it, off until pressed; see familiarShown(). */
    var famSub = el('div', 'cb-sub cb-fam-sub');
    famSub.appendChild(el('h3', 'cb-h3', 'Your familiar'));
    var famBtn = this.famBtn = el('button', 'cb-btn cb-seen', 'Bring my familiar: off');
    famBtn.type = 'button';
    famBtn.setAttribute('aria-pressed', 'false');
    famBtn.hidden = true;
    this.famNow = el('p', 'cb-seen-now');
    this.famNow.hidden = true;
    famSub.appendChild(famBtn);
    famSub.appendChild(this.famNow);
    hereSec.appendChild(famSub);
    var nowSub = el('div', 'cb-sub cb-now-sub');
    nowSub.appendChild(el('h3', 'cb-h3', 'On now'));
    nowSub.appendChild(this.evNowLine);
    hereSec.appendChild(nowSub);

    var lcd = this.lcd = el('div', 'cb-lcd');
    // Which channel this is, at every size, because small shows only the readout.
    this.bandNow = el('p', 'cb-band-now');
    lcd.appendChild(this.bandNow);
    var log = this.log = el('ol', 'cb-log');
    log.setAttribute('role', 'log');
    lcd.appendChild(log);
    // Nothing is claimed about the channel until it has been heard.
    this.quiet = el('p', 'cb-quiet', 'Tuning in\u2026');
    lcd.appendChild(this.quiet);
    /* HOSTING NOW, first under Watching together: every beacon on the
       street, this room's with a Catch up button and the others with a link to
       their room that carries the host's spot. It was in the readout under the
       log until Ryan, 2026-10-19: a host's line under the messages read as the
       newest message, and the part it belongs to has a heading now. Not a live
       region: it is redrawn on every listen, and something read out every four
       seconds is the alert this radio refuses. Nothing is counted. */
    var hosts = this.hostsBox = el('div', 'cb-hosts');
    hosts.hidden = true;
    hosts.appendChild(el('h3', 'cb-h3', 'Hosting now'));
    var beacons = this.beaconList = el('ul', 'cb-beacons');
    beacons.setAttribute('aria-label', 'Hosting now');
    hosts.appendChild(beacons);
    filmSec.appendChild(hosts);
    this.beacons = [];
    this.skew = 0;
    chanSec.appendChild(lcd);
    this.lcdBox = lcd;

    /* THE RADIO'S ANSWER, directly under the readout, where the log, the hosts'
       Catch up and Follow and every @time are: an answer somebody has to scroll
       past the message box to find is one they do not see (Ryan, 2026-09-29,
       after people thought Follow was broken). It used to sit under the box. */
    this.said = el('p', 'cb-said');
    this.said.setAttribute('role', 'status');
    chanSec.appendChild(this.said);

    var form = this.form = el('form', 'cb-tx');
    var lab = el('label', 'cb-lab', 'Your message');
    lab.htmlFor = 'cb-say';
    /* A TEXTAREA, so a message can be a list, a paragraph or a block of code.
       It grows as you type, up to about eight lines, and can be dragged taller.
       Enter sends and Shift and Enter makes a new line, the way chat does,
       and on a phone Return makes a new line and Transmit sends (sendKey). */
    var say = this.say = el('textarea', 'cb-say cb-say--msg');
    say.id = 'cb-say';
    say.maxLength = MESSAGE_MAX;
    say.setAttribute('aria-describedby', 'cb-say-hint');
    say.autocomplete = 'off';
    sendBox(say, 'send');
    /* THE COMPLETION LIST, the ARIA combobox pattern. Typing # and a letter
       opens it; arrows move, Enter or Tab puts the room in, Escape closes it
       for that # and leaves what you typed alone. With the list closed, Enter
       transmits as it always did. The screen reader hears the room under the
       arrow and never how many there are. */
    say.setAttribute('role', 'combobox');
    say.setAttribute('aria-autocomplete', 'list');
    say.setAttribute('aria-controls', 'cb-pick');
    say.setAttribute('aria-expanded', 'false');
    var pick = this.pick = el('ul', 'cb-pick');
    pick.id = 'cb-pick';
    pick.setAttribute('role', 'listbox');
    pick.setAttribute('aria-label', 'Rooms on the street');
    pick.hidden = true;
    this.offer = [];
    this.active = -1;
    this.dismissed = -1;
    var send = el('button', 'cb-btn cb-send', 'Transmit');
    send.type = 'submit';
    /* A PICTURE, Ryan's ask, 2026-09-29: a screenshot or a photo on the
       channel, which goes when its message goes. The file is redrawn here,
       in this browser, before anything is sent, which drops what the camera
       wrote into it, GPS first. The description is optional. */
    var picBtn = el('button', 'cb-btn cb-pic', 'Picture');
    picBtn.type = 'button';
    picBtn.setAttribute('aria-label', 'Add a picture to your message');
    var picFile = this.picFile = el('input', 'cb-pic-file');
    picFile.type = 'file';
    picFile.accept = 'image/*';
    picFile.hidden = true;
    picFile.tabIndex = -1;
    picBtn.addEventListener('click', function () { picFile.click(); });
    picFile.addEventListener('change', function () { me.pickPicture(picFile.files && picFile.files[0]); });
    var stickBtn = this.stickBtn = el('button', 'cb-btn cb-stick', 'Sticker');
    stickBtn.type = 'button';
    stickBtn.setAttribute('aria-label', 'Send a sticker of one of your avatars or pets');
    stickBtn.setAttribute('aria-expanded', 'false');
    stickBtn.setAttribute('aria-controls', 'cb-stickers');
    stickBtn.addEventListener('click', function () { me.setStickers(me.stickBox.hidden); });
    var stickBox = this.stickBox = el('div', 'cb-stickers');
    stickBox.id = 'cb-stickers';
    stickBox.hidden = true;
    stickBox.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); me.setStickers(false); stickBtn.focus(); } });
    var row = el('div', 'cb-row cb-send-row');
    row.appendChild(picBtn);
    row.appendChild(stickBtn);
    row.appendChild(send);
    var ready = this.picReady = el('div', 'cb-pic-ready');
    ready.hidden = true;
    var preview = this.picShown = el('img', 'cb-pic-preview');
    preview.alt = '';
    preview.hidden = true;
    ready.appendChild(preview);
    var readyLine = this.picReadyLine = el('p', 'cb-pic-line');
    readyLine.setAttribute('role', 'status');
    var altLab = el('label', 'cb-lab', 'Say what is in it, if you like');
    altLab.htmlFor = 'cb-pic-alt';
    var alt = this.picAlt = el('input', 'cb-say cb-pic-alt');
    alt.id = 'cb-pic-alt';
    alt.type = 'text';
    alt.maxLength = 280;
    alt.autocomplete = 'off';
    var drop = el('button', 'cb-btn cb-pic-drop', 'Remove the picture');
    drop.type = 'button';
    drop.addEventListener('click', function () { me.dropPicture(); picBtn.focus(); });
    ready.appendChild(readyLine);
    ready.appendChild(altLab);
    ready.appendChild(alt);
    ready.appendChild(drop);
    /* REPLYING TO, between the picture waiting to go and the box. */
    var reB = this.reBar = reBar('cb-re-line', 'cb-say-hint', function () { me.replyStop(); say.focus(); });
    this.replying = null;
    // In the form, hidden: a file input outside the document is one some
    // browsers will not open a picker for.
    form.appendChild(picFile);
    var hint = el('p', 'cb-hint', enterHint('Transmit', 'sends') + ' Markdown works: **bold**, *italic*, `code`, # headings, > quotes, - lists and [words](address). Type @ and a name to mention somebody, # and a room, or [[ and part of a name to link a forum topic, or for staff a task or a record of the office. Paste a picture to add it.');
    hint.id = 'cb-say-hint';
    /* The picture waiting to go is above the box, where Discord puts one:
       you see it, say what is in it, write the message and send, in that
       order, top to bottom and in the keyboard's order too. */
    form.appendChild(ready);
    form.appendChild(reB);
    form.appendChild(lab);
    form.appendChild(pick);
    form.appendChild(say);
    form.appendChild(hint);
    form.appendChild(row);
    form.appendChild(stickBox);
    chanSec.appendChild(form);
    linkBox(say, function (t) { me.tell(t); });

    var film = el('div', 'cb-tools cb-film');
    var tools = el('div', 'cb-tools');
    var youTools = el('div', 'cb-tools');
    /* ADD MY SPOT, shown only while a film on this page has been started. It
       reads where your player is and writes "@34:12" into the box, and that
       is all: nothing goes out until you transmit, the same as anything else
       you type. */
    var spot = this.spotBtn = el('button', 'cb-btn cb-spot', 'Add my spot');
    spot.type = 'button';
    spot.hidden = true;
    film.appendChild(spot);
    /* HOST THIS FILM, shown with Add my spot. See setHosting. Never
       remembered: a new page starts with nobody hosting. */
    var hostBtn = this.hostBtn = el('button', 'cb-btn cb-hosting', 'Host this film');
    hostBtn.type = 'button';
    hostBtn.hidden = true;
    hostBtn.setAttribute('aria-pressed', 'false');
    film.appendChild(hostBtn);
    this.hosting = null;
    /* SCREEN A VIDEO, for the base, on a page with a screen. See screenVideo.
       A tray opened from the row like Profile, because it is a moderator's
       occasional tool and the radio is full enough. */
    var scrBtn = this.screenBtn = el('button', 'cb-btn cb-screen-btn', 'Screen a video');
    scrBtn.type = 'button';
    scrBtn.hidden = true;
    scrBtn.setAttribute('aria-expanded', 'false');
    scrBtn.setAttribute('aria-controls', 'cb-screen');
    film.appendChild(scrBtn);
    filmSec.appendChild(film);
    /* WATCHING TOGETHER'S ANSWER, under its buttons and the hosts' Catch up
       and Follow, for the reason the readout's answer is under the readout.
       See tellFilm. */
    this.filmSaid = el('p', 'cb-said');
    this.filmSaid.setAttribute('role', 'status');
    filmSec.appendChild(this.filmSaid);
    this.screened = null;
    var callBtn = this.callBtn = el('button', 'cb-btn cb-call-btn', 'Join this room\u2019s call');
    callBtn.type = 'button';
    callBtn.hidden = true;
    callBtn.setAttribute('aria-pressed', 'false');
    this.callSub.insertBefore(callBtn, this.inCallNow);
    this.calls = false;
    var aloud = this.aloudBtn = el('button', 'cb-btn cb-aloud');
    aloud.type = 'button';
    tools.appendChild(aloud);
    var speak = this.speakBtn = el('button', 'cb-btn cb-speak');
    speak.type = 'button';
    speak.hidden = !VOICE;
    tools.appendChild(speak);
    if (state.base) {
      var clear = el('button', 'cb-btn cb-clear', 'Clear the channel');
      clear.type = 'button';
      clear.addEventListener('click', function () { me.moderate({ clear: true }); });
      tools.appendChild(clear);
    }
    /* PROFILE. Ryan, 2026-09-30: one button in the tools row, beside Sign off,
       because the bar is full, and a tray that pops up from the radio with two
       things in it. YOUR USERNAME: claim it with a password of your own, so
       nobody else can sign on as it, and once claimed change the password or
       delete the account; there is no email, so claiming hands you a recovery
       code, once. YOUR PETS: the animals you adopted, which are the one
       thing the street keeps under a person, and Forget Me for them. Every
       destructive press asks once more. The tray is read when it is opened and
       never polled. */
    /* COLOURS. Ryan, 2026-10-17, from a request: the radio in another colour
       scheme, which is the visitor's to choose like the size and is remembered
       with it, and the call window wears the same. A tray under this row, so
       the radio is no busier than it was; every choice shows a swatch of
       itself, and pressing one puts it on at once. call.js decides what each
       means and puts it on the hosts; see setScheme. */
    var schemeBtn = this.schemeBtn = el('button', 'cb-btn cb-scheme-btn', 'Themes');
    schemeBtn.type = 'button';
    schemeBtn.setAttribute('aria-expanded', 'false');
    schemeBtn.setAttribute('aria-controls', 'cb-scheme-panel');
    tools.appendChild(schemeBtn);
    var petsBtn = this.petsBtn = el('button', 'cb-btn cb-pets-btn', 'Profile');
    petsBtn.type = 'button';
    petsBtn.setAttribute('aria-expanded', 'false');
    petsBtn.setAttribute('aria-controls', 'cb-pets');
    youTools.appendChild(petsBtn);
    /* ACCOUNT (Ryan's ask, 2026-10-19): your username, claiming it, its
       password, its recovery and deleting it, and Forget me, out of Profile
       into a tray of their own. Profile is what you show; Account is what
       you are signed on as and what the street keeps under you. */
    var acctBtn = this.acctBtn = el('button', 'cb-btn cb-acct-btn', 'Account');
    acctBtn.type = 'button';
    acctBtn.setAttribute('aria-expanded', 'false');
    acctBtn.setAttribute('aria-controls', 'cb-account');
    youTools.appendChild(acctBtn);
    /* NOTIFICATIONS (Ryan, 2026-10-18, after requests, "especially for
       staff"): a tray under this row, like Themes and Profile, where a device
       is switched on to be told about mentions, rooms it follows, calls
       starting and everything on World. Nothing is asked of the browser, and
       nothing is registered or sent, until a button in it is pressed. */
    var notifyBtn = this.notifyBtn = el('button', 'cb-btn cb-notify-btn', 'Notifications');
    notifyBtn.type = 'button';
    notifyBtn.setAttribute('aria-expanded', 'false');
    notifyBtn.setAttribute('aria-controls', 'cb-notify');
    tools.appendChild(notifyBtn);
    /* POP OUT, into a window of its own (see CB_WINDOW), and in that window,
       the way back. Only where the browser can tell the other pages, because a
       radio out that the pages cannot hear about would be a second radio. */
    var popBtn = this.popBtn = el('button', 'cb-btn cb-pop-btn', inWindow() ? 'Back into the page' : 'Pop out');
    popBtn.type = 'button';
    // The chat page is the radio's page already, and keeps it.
    popBtn.hidden = !popLine || chat;
    var popHow = el('span', 'sr', inWindow()
      ? 'Closes this window and puts the radio back on the page you came from.'
      : 'Moves the radio into a window of its own, at the size it is now, which stays open while you go from room to room.');
    popHow.id = 'cb-pop-how';
    popBtn.setAttribute('aria-describedby', 'cb-pop-how');
    popBtn.addEventListener('click', function () { if (inWindow()) closeWindow(); else me.popOut(); });
    tools.appendChild(popBtn);
    tools.appendChild(popHow);
    var off = el('button', 'cb-btn cb-off', 'Sign off');
    off.type = 'button';
    off.addEventListener('click', function () { signOff(); });
    youTools.appendChild(off);
    youSec.appendChild(youTools);
    yourSec.appendChild(tools);
    var scp = this.schemePanel = el('div', 'cb-scheme-panel');
    scp.id = 'cb-scheme-panel';
    scp.hidden = true;
    scp.setAttribute('role', 'group');
    scp.setAttribute('aria-label', 'Themes for your radio');
    this.schemeChoices = {};
    var lc = window.loveCall, rows = {};
    /* In three groups, each under its own heading: the everyday ones, the
       radio faceplates, and the worlds, which Ryan asked for on 2026-10-17 and
       which have nothing to do with radios. */
    [['every', 'Everyday'], ['radio', 'Radio faceplates'], ['world', 'Worlds, with drawings'], ['skin', 'Winamp skins'], ['geo', 'GeoCities pages'], ['game', 'Ryan\u2019s favourite games']].forEach(function (g) {
      scp.appendChild(el('h3', 'cb-h3', g[1]));
      rows[g[0]] = el('div', 'cb-scheme-row');
      scp.appendChild(rows[g[0]]);
    });
    ((lc && lc.schemes) || []).forEach(function (x) {
      var b = el('button', 'cb-btn cb-scheme-choice');
      b.type = 'button';
      var sw = el('span', 'cb-swatch');
      sw.setAttribute('aria-hidden', 'true');
      sw.appendChild(el('span', 'cb-swatch__lcd', 'Aa'));
      b.appendChild(sw);
      b.appendChild(el('span', 'cb-scheme-name', x[1]));
      b.addEventListener('click', function () { me.setScheme(x[0]); });
      me.schemeChoices[x[0]] = { button: b, swatch: sw, name: x[1], about: x[3] || '', art: !!x[4], moves: x[4] === 'moves' };
      (rows[x[2]] || rows.every).appendChild(b);
    });
    /* LET MY THEME MOVE: a theme's drawing moves at MAX GLITTER by itself, and
       at any other setting once this is on, which is the asking (the candles'
       rule). Remembered in love-cb as motion. */
    var mv = this.motionBtn = el('button', 'cb-btn cb-motion');
    mv.type = 'button';
    mv.addEventListener('click', function () { me.setMotion(!me.state.motion); });
    scp.appendChild(mv);
    scp.appendChild(el('p', 'cb-hint', 'A theme with a drawing moves by itself at MAX GLITTER and stands still at the other settings unless you let it move. Nothing in any of them flashes, and nothing moves when a message arrives.'));
    scp.appendChild(this.footClose('Close Themes', function () { me.setSchemePanel(false); }, schemeBtn));
    scp.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); me.setSchemePanel(false); me.schemeBtn.focus(); }
    });
    yourSec.appendChild(scp);

    var scr = this.screenPanel = el('form', 'cb-screen');
    scr.id = 'cb-screen';
    scr.hidden = true;
    scr.noValidate = true;
    scr.setAttribute('aria-label', 'Screen a video');
    var scrLab = this.screenLab = el('label', 'cb-lab', 'A YouTube address');
    scrLab.htmlFor = 'cb-screen-url';
    var scrUrl = this.screenUrl = el('input', 'cb-say cb-screen-url');
    scrUrl.id = 'cb-screen-url';
    scrUrl.type = 'url';
    scrUrl.autocomplete = 'off';
    scrUrl.spellcheck = false;
    var scrGo = el('button', 'cb-btn', 'Put it up');
    scrGo.type = 'submit';
    var scrRow = el('div', 'cb-acct__row');
    scrRow.appendChild(scrGo);
    scr.appendChild(scrLab);
    scr.appendChild(scrUrl);
    scr.appendChild(scrRow);
    scr.appendChild(el('p', 'cb-hint', 'One video, not a playlist. It plays on your page at once and is sent nowhere. Host this film, once it plays, is what lets this room follow: their screens get its play button, and it waits for their press.'));
    var scrSaid = this.screenSaid = el('p', 'cb-said');
    scrSaid.setAttribute('role', 'status');
    scr.appendChild(scrSaid);
    filmSec.appendChild(scr);

    var pets = this.petsPanel = el('div', 'cb-pets');
    pets.id = 'cb-pets';
    pets.hidden = true;
    pets.setAttribute('role', 'group');
    pets.setAttribute('aria-label', 'Your profile');

    // The Account tray: your username, then Forget me. See acctBtn.
    var acctP = this.acctPanel = el('div', 'cb-pets cb-account');
    acctP.id = 'cb-account';
    acctP.hidden = true;
    acctP.setAttribute('role', 'group');
    acctP.setAttribute('aria-label', 'Your account');
    acctP.appendChild(el('p', 'cb-pets__h', 'Your username'));
    var acct = this.acctBox = el('div', 'cb-acct');
    acctP.appendChild(acct);
    this.acctSaid = el('p', 'cb-said cb-acct__said');
    this.acctSaid.setAttribute('role', 'status');
    acctP.appendChild(this.acctSaid);

    /* YOUR PROFILE CARD (Ryan, 2026-10-17, after requests for profiles more
       like Discord's): what anybody signed on sees when they press your name,
       edited in a window of its own with the card drawn beside the choices. */
    var pfCard = this.pfSection(pets, 'card', 'Your profile card', function () { this.loadProfileCard(); });
    this.pfBox = el('div', 'cb-pf-box');
    pfCard.appendChild(this.pfBox);

    /* YOUR PROFILE SETS (2026-10-19, a request from our community): the
       card's look saved under a name, with the avatar you wear, and worn again
       with one press, by mood, by room or for what is on. Drawn from the same
       answer as the card, so read when its section opens and never polled. */
    this.pfSetsBox = el('div', 'cb-pfsets-box');
    this.pfSetsBox.hidden = true;
    pfCard.appendChild(this.pfSetsBox);

    /* YOUR PROPS (Ryan, 2026-10-18): the props people gave you, waiting here
       for you to Confirm, which puts them on your profile's Props tab, or
       Reject, which deletes them and tells nobody; the ones up, to take off;
       and the switch that opens the tab. Read when its section opens, never
       polled, and never counted. */
    var pfProps = this.pfSection(pets, 'props', 'Your props', function () { this.loadProps(); });
    this.prState = el('p', 'cb-quiet', '');
    pfProps.appendChild(this.prState);
    this.prShow = el('div', 'cb-pets__show');
    pfProps.appendChild(this.prShow);
    this.prBox = el('div', 'cb-props');
    pfProps.appendChild(this.prBox);
    this.prSaid = el('p', 'cb-said');
    this.prSaid.setAttribute('role', 'status');
    this.prSaid.tabIndex = -1;
    pfProps.appendChild(this.prSaid);

    /* YOUR AVATARS (Ryan, 2026-10-14): what you made at the Bodymind Booth or
       put on the stand at the Dress-Up Den, kept here, one of them worn on the
       CB, beside your name on Who's online. Read when its section opens, never
       polled, and drawn by avatar.js, loaded on the first. */
    var pfAvatars = this.pfSection(pets, 'avatars', 'Your avatars', function () { this.loadAvatars(); });
    this.avState = el('p', 'cb-quiet', '');
    pfAvatars.appendChild(this.avState);
    this.avList = el('ul', 'cb-avatars__list');
    this.avList.hidden = true;
    pfAvatars.appendChild(this.avList);
    // Whether people on the CB see the rest in your profile, too.
    this.avShow = el('div', 'cb-pets__show');
    pfAvatars.appendChild(this.avShow);
    this.avWhere = el('p', 'cb-pets__where');
    pfAvatars.appendChild(this.avWhere);

    /* YOUR CHIMERAS (Ryan, 2026-10-18): what you kept from Chimera Obscura,
       named here, shown in your profile if you switch that on, and sent as
       stickers. Read when its section opens, never polled, and drawn by
       chimera.js, loaded on the first. */
    var pfChimeras = this.pfSection(pets, 'chimeras', 'Your chimeras', function () { this.loadChimeras(); });
    this.chState = el('p', 'cb-quiet', '');
    pfChimeras.appendChild(this.chState);
    this.chList = el('ul', 'cb-avatars__list');
    this.chList.hidden = true;
    pfChimeras.appendChild(this.chList);
    this.chShow = el('div', 'cb-pets__show');
    pfChimeras.appendChild(this.chShow);
    this.chWhere = el('p', 'cb-pets__where');
    pfChimeras.appendChild(this.chWhere);

    // Your pets.
    var pfPets = this.pfSection(pets, 'pets', 'Your pets', function () { this.drawWhere(/^cb2\./.test(this.state.pass)); this.loadPets(); });
    this.petsState = el('p', 'cb-quiet', '');
    pfPets.appendChild(this.petsState);
    this.petsList = el('ul', 'cb-pets__list');
    this.petsList.hidden = true;
    pfPets.appendChild(this.petsList);
    // Whether people on the CB can see them, by pressing your handle.
    this.showBox = el('div', 'cb-pets__show');
    pfPets.appendChild(this.showBox);
    var where = this.petsWhere = el('p', 'cb-pets__where');
    pfPets.appendChild(where);

    /* YOUR JOBS (Ryan, 2026-10-14): the jobs kept from the Adventurer's Guild,
       once its board's Keep my jobs in my Profile is on, and the badges they
       make, worked out here from the jobs and kept nowhere. Read when the tray
       opens, never polled. */
    var pfJobs = this.pfSection(pets, 'jobs', 'Your badges and jobs', function () { this.loadJobs(); });
    this.badgeBox = el('div', 'cb-jobs-box');
    this.badgeBox.hidden = true;
    pfJobs.appendChild(this.badgeBox);
    this.jobsState = el('p', 'cb-quiet', '');
    pfJobs.appendChild(this.jobsState);
    this.jobsBox = el('div', 'cb-jobs-box');
    this.jobsBox.hidden = true;
    pfJobs.appendChild(this.jobsBox);
    // Whether people on the CB see them in your profile.
    this.jobsShow = el('div', 'cb-pets__show');
    pfJobs.appendChild(this.jobsShow);
    this.jobsWhere = el('p', 'cb-pets__where');
    pfJobs.appendChild(this.jobsWhere);

    /* YOUR BATTLE JACKET (Ryan, 2026-10-14): the patches picked up around the
       street, sewn onto one denim jacket by patches.js, loaded on the first.
       Read when its section opens, never polled. */
    var pfJacket = this.pfSection(pets, 'jacket', 'Your battle jacket', function () { this.loadPatches(); });
    this.patchState = el('p', 'cb-quiet', '');
    pfJacket.appendChild(this.patchState);
    this.patchBox = el('div', 'cb-jacket');
    this.patchBox.hidden = true;
    pfJacket.appendChild(this.patchBox);
    this.patchShow = el('div', 'cb-pets__show');
    pfJacket.appendChild(this.patchShow);
    this.patchWhere = el('p', 'cb-pets__where');
    pfJacket.appendChild(this.patchWhere);

    acctP.appendChild(el('p', 'cb-pets__h', 'Forget me'));
    acctP.appendChild(el('p', 'cb-pets__where', 'Deletes everything the street keeps under this handle, from your avatars to your messages. It asks once more first.'));
    var forgetBtn = this.forgetBtn = el('button', 'cb-btn cb-forget', 'Forget me');
    forgetBtn.type = 'button';
    acctP.appendChild(forgetBtn);
    var sure = this.forgetSure = el('div', 'cb-forget-sure');
    sure.hidden = true;
    sure.appendChild(el('p', null, 'This deletes everything the street keeps under this handle, which is your avatars, your chimeras, your pets, the jobs kept from the Adventurer\u2019s Guild, your battle jacket, your profile card and its sets, the props on it and waiting for you, your chat status, your direct messages and every conversation you are in, for both of you, when you last read each channel and conversation, notifications on every device switched on as this handle, and whether any of them are shown. Your pets stay on the list of everybody adopted, with nothing connecting them to you. It cannot be undone.'));
    var yes = el('button', 'cb-btn cb-forget-yes', 'Yes, forget me');
    yes.type = 'button';
    var no = el('button', 'cb-btn', 'Keep them');
    no.type = 'button';
    sure.appendChild(yes); sure.appendChild(no);
    acctP.appendChild(sure);
    var forgetSaid = this.forgetSaid = el('p', 'cb-said');
    forgetSaid.setAttribute('role', 'status');
    acctP.appendChild(forgetSaid);
    pets.appendChild(this.footClose('Close Profile', function () { me.setPets(false); }, petsBtn));
    acctP.appendChild(this.footClose('Close Account', function () { me.setAccount(false); }, acctBtn));
    youSec.appendChild(pets);
    youSec.appendChild(acctP);
    var ntf = this.notifyPanel = el('div', 'cb-notify');
    ntf.id = 'cb-notify';
    // notifyLoad and notifyDraw redraw the body; the foot is the tray's own.
    this.notifyBody = el('div', 'cb-notify__body');
    ntf.appendChild(this.notifyBody);
    ntf.appendChild(this.footClose('Close Notifications', function () { me.setNotify(false); }, notifyBtn));
    ntf.hidden = true;
    ntf.setAttribute('role', 'group');
    ntf.setAttribute('aria-label', 'Notifications');
    ntf.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); me.setNotify(false); me.notifyBtn.focus(); }
    });
    yourSec.appendChild(ntf);
    notifyBtn.addEventListener('click', function () { me.setNotify(ntf.hidden); });
    petsBtn.addEventListener('click', function () { me.setPets(pets.hidden); });
    acctBtn.addEventListener('click', function () { me.setAccount(acctP.hidden); });
    forgetBtn.addEventListener('click', function () { sure.hidden = false; forgetBtn.hidden = true; no.focus(); });
    no.addEventListener('click', function () { sure.hidden = true; forgetBtn.hidden = false; forgetBtn.focus(); });
    yes.addEventListener('click', function () { me.forgetMe(); });
    window.addEventListener('love-pets', function () { if (me.pfShown('pets')) me.loadPets(); });
    window.addEventListener('love-avatars', function () { if (me.pfShown('avatars')) me.loadAvatars(); });
    window.addEventListener('love-chimeras', function () { if (me.pfShown('chimeras')) me.loadChimeras(); });
    window.addEventListener('love-patches', function () { if (me.pfShown('jacket')) me.loadPatches(); });

    var norms = el('p', 'cb-norms');
    var a = el('a', null, 'House norms at the Community Center');
    a.href = '/community-center.html#cb-norms';
    norms.appendChild(a);
    // Every part of the radio, named the way it names itself. guest.js links it too.
    norms.appendChild(document.createTextNode(' · '));
    var guide = el('a', null, 'The CB guide');
    guide.href = '/cb-guide.html';
    norms.appendChild(guide);
    yourSec.appendChild(norms);

    box.appendChild(set);
    box.appendChild(trimFoot);
    box.appendChild(sideL);
    box.appendChild(sideR);
    if (window.ResizeObserver) new ResizeObserver(function () { me.drawArt(); }).observe(trimTop);

    fold.addEventListener('click', function () { me.setFolded(!me.state.folded); });
    /* THE SIZE, Ryan's ask, 2026-09-29: Small is the bar and the newest message
       and still listens, Normal is the radio as it was, and Large is wide and
       tall, for long messages and pictures. Then, 2026-10-19, Icon under Small
       and Full over Large: see setSize. */
    smaller.addEventListener('click', function () { me.stepSize(-1); });
    larger.addEventListener('click', function () { me.stepSize(1); });
    opener.addEventListener('click', function () {
      if (me.state.size !== 'icon') return;
      me.setSize('small');
      larger.focus();
    });
    schemeBtn.addEventListener('click', function () { me.setSchemePanel(me.schemePanel.hidden); });
    tp.addEventListener('click', function () { me.setTeleport(tpp.hidden); });
    find.addEventListener('input', function () { me.tpRender(); });
    find.addEventListener('keydown', function (e) { me.tpKey(e); });
    aloud.addEventListener('click', function () { me.setAloud(!me.aloud()); });
    spot.addEventListener('click', function () { me.addSpot(); });
    hostBtn.addEventListener('click', function () { me.setHosting(!me.hosting); });
    scrBtn.addEventListener('click', function () { me.setScreenPanel(scr.hidden); });
    scr.addEventListener('submit', function (e) { e.preventDefault(); me.screenVideo(); });
    // Each button asks after its own call: with the World call open, this
    // room's button joins this room's call rather than leaving the World's.
    callBtn.addEventListener('click', function () { me.setCall(callBtn.getAttribute('aria-pressed') !== 'true'); });
    wcall.addEventListener('click', function () { me.setCall(wcall.getAttribute('aria-pressed') !== 'true', true); });
    showWin.addEventListener('click', function () {
      if (!window.loveCall.showAway()) me.tell('The call\u2019s window has closed, so the call has ended.');
    });
    // Which call a window of its own holds, as it says over the browser's own line.
    window.loveCall.onAway(function () { me.callShown(); });
    bw.addEventListener('click', function () { me.setBand('world'); });
    seenBtn.addEventListener('click', function () { me.setSeen(!me.state.seen); });
    famBtn.addEventListener('click', function () { me.setFamiliarOut(!me.famOut); });
    // A familiar taken, changed or sent home on this page: the switch follows.
    window.addEventListener('love-familiar', function () { if (me.present) me.familiarShown(true); });
    ob.addEventListener('click', function () { me.setOnline(online.hidden); });
    window.addEventListener('pagehide', function () { me.leaveSeen(); });
    br.addEventListener('click', function () { me.setBand('room'); });
    beacons.addEventListener('click', function (e) {
      // Follow first: it wears .cb-catch too, for the look, and asking for
      // .cb-catch first made pressing Follow a Catch up.
      var f = e.target.closest('.cb-follow');
      if (f) { me.setFollow(!me.following, f.dataset.room); return; }
      var c = e.target.closest('.cb-catch');
      if (c) me.catchUp(c.dataset.room);
    });
    this.following = null;
    log.addEventListener('click', function (e) {
      var b = e.target.closest('.cb-jump');
      if (b) me.jump(b.dataset.live ? null : +b.dataset.at, b.dataset.film || '', b.dataset.room || '');
    });
    speak.addEventListener('click', function () { me.setSpeak(!me.state.speak); });
    form.addEventListener('submit', function (e) { e.preventDefault(); me.transmit(); });
    say.addEventListener('input', function () { me.complete(); });
    say.addEventListener('click', function () { me.complete(); });
    say.addEventListener('keyup', function (e) {
      if (/^(ArrowLeft|ArrowRight|Home|End)$/.test(e.key)) me.complete();
    });
    say.addEventListener('keydown', function (e) {
      me.pickKey(e);
      if (e.defaultPrevented || e.isComposing) return;
      // Escape lets a reply go, the way chat does, and keeps what you wrote.
      if (e.key === 'Escape' && me.replying) { e.preventDefault(); me.replyStop(); return; }
      if (sendKey(e)) { e.preventDefault(); me.transmit(); }
      // Up in an empty box edits your newest message, the way chat does.
      if (e.key === 'ArrowUp' && !say.value && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
        var last = me.lastMine();
        if (last) { e.preventDefault(); me.editStart(last); }
      }
    });
    say.addEventListener('input', function () { me.grow(); });
    say.addEventListener('blur', function () { me.close(); });
    say.addEventListener('paste', function (e) { var f = pastedPicture(e); if (f) me.pickPicture(f); });
    this.mover = new window.loveCall.Mover(box, bar, move, state, 'right', 'cb-radio--held', function () { save(me.state); }, function () {
      me.tell('Drag the bar to move the radio, or use the arrow keys while Move has the keyboard. Home puts it back in the corner.');
    });
    // At Full the radio fills the window, so there is nowhere to move it to.
    // In its own window it is the window, and the window is what moves.
    this.mover.still = function () { return inWindow() || chat || (me.state.size === 'full' && !me.state.folded); };
    // A theme's sides hang outside the box, so the radio keeps that much further in.
    this.mover.margin = function () {
      if (!me.sidesShown()) return 0;
      var b = box.getBoundingClientRect();
      return Math.ceil(Math.max(b.left - me.sideL.getBoundingClientRect().left, me.sideR.getBoundingClientRect().right - b.right)) + 4;
    };

    document.addEventListener('visibilitychange', function () { me.tune(); });
    window.addEventListener('resize', function () { me.drawArt(); me.place(); });
    /* It grows as messages and hosts arrive, and place() is what keeps its top
       on the screen, so it is placed again whenever its own size changes, not
       only when the window's does. place() sets right and bottom and never the
       size, so this cannot feed itself. */
    if (window.ResizeObserver) new ResizeObserver(function () { me.place(); }).observe(box);

    /* IN A SHADOW ROOT, because it floats in every room and every room's own
       rules would otherwise reach into it. `.room-x a` at (0,2,0) is how the
       skip link came out yellow on yellow in twenty-one rooms; a radio appended
       to <body> would have met every one of those rules at once, in rooms
       nobody is thinking about when they change the radio. Inside a shadow
       root no room's selector can match it, and its own stylesheet, cb.css,
       is the only one that applies. The colours are still love.css's: custom
       properties declared on :root inherit across the boundary, which is what
       keeps them in check-contrast.py's reach. */
    var host = this.host = el('div', 'cb-host');
    if (window.loveCall && window.loveCall.dress) window.loveCall.dress(host, state.scheme);
    var root = host.attachShadow({ mode: 'open' });
    var sheet = document.createElement('link');
    sheet.rel = 'stylesheet';
    sheet.href = '/cb.css';
    host.style.visibility = 'hidden';
    function shown() {
      host.style.visibility = ''; me.place(); me.drawArt();
      // Anything waiting to put the keyboard in the radio: hidden, it cannot.
      var then = me.whenShown; me.whenShown = null;
      if (then) then();
    }
    sheet.addEventListener('load', shown);
    sheet.addEventListener('error', shown);
    root.appendChild(sheet);
    root.appendChild(box);
    if (chat) {
      // Into the page, where the page's own words about the chat were.
      var dock = chatDock();
      dock.textContent = '';
      host.classList.add('cb-host--chat');
      dock.appendChild(host);
    } else document.body.appendChild(host);
    if (inWindow()) {
      /* A link to a page of this site opens in the window you came from, so
         this window keeps the radio: the channel's, the teleporter's, a
         profile's. One to elsewhere opens in a new tab as everywhere. */
      root.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('a[href]');
        if (!a || a.target || a.hasAttribute('download') || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        var u;
        try { u = new URL(a.getAttribute('href'), location.href); } catch (x) { return; }
        if (u.origin !== location.origin) return;
        e.preventDefault();
        me.tabTold(goStreet(u.href), a);
      });
      window.addEventListener('focus', function () { if (me.whereNow() === false) me.bandShown(); });
      this.whereNow();
    } else {
      /* While a call is open on this page, a link in the radio that would
         leave the page opens in a new tab, so the call stays up (callUp). A
         press with a key held, or on a link that already says where it opens,
         is the browser's. */
      root.addEventListener('click', function (e) {
        if (!callUp()) return;
        var a = e.target.closest && e.target.closest('a[href]');
        if (!a || a.target || a.hasAttribute('download') || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (!leavesPage(a.href)) return;
        e.preventDefault();
        me.tabTold(newTab(a.href) ? 'tab' : 'kept', a);
      });
    }
    this.bandShown();
    this.setAloud(this.aloud(), true);
    this.setSpeak(!!this.state.speak, true);
    this.setSize(state.size || (state.small ? 'small' : 'normal'), true);
    this.setFolded(!!state.folded, true);
    if (state.online) this.setOnline(true, true);
    this.place();
    if (chat) this.chatShown();
  }

  Radio.prototype.aloud = function () { return this.state.aloud !== false; };

  Radio.prototype.setAloud = function (on, quiet) {
    this.state.aloud = on;
    this.log.setAttribute('aria-live', on ? 'polite' : 'off');
    this.aloudBtn.setAttribute('aria-pressed', String(on));
    this.aloudBtn.textContent = on ? 'New messages to a screen reader: on' : 'New messages to a screen reader: off';
    if (!quiet) save(this.state);
  };

  /* SPEAK IS FOR THOSE OF US NOT USING A SCREEN READER. Ryan, 2026-09-26:
     the radio's "Read new messages aloud" switch only ever reached a screen
     reader, and is labelled for that now, and a voice
     coming out of the radio is what makes it a CB. So the browser's own speech
     reads out each new message -- the handle, then the words -- as it arrives.

       · OFF UNTIL SOMEBODY SWITCHES IT ON. A voice nobody asked for is an
         alert, and this radio has none. It is a second switch rather than the
         first one changed, because a screen reader user with both on would
         hear everything twice, and one with only this on has chosen that.
       · ONLY WHAT ARRIVES AFTER THE SWITCH, and never your own transmission.
         What is already on the channel when you tune in is not read at you.
       · ONLY WHILE THE RADIO IS ON. Folding it away, signing off, or turning
         the switch off stops a voice mid-word, because folded is off. Small is
         still on, so small still speaks.
       · ONLY ON-DEVICE VOICES. Some browsers offer voices that are a speech
         service somewhere else -- Chrome's "Google" voices send the text to
         Google to be spoken -- and reading somebody's message through one
         would hand a stranger's words to a third party nobody on the channel
         agreed to. SpeechSynthesisVoice.localService says which is which; a
         device with no local voice gets told so rather than a remote one.
       · A #ROOM IS READ AS ITS NAME, the way the screen reader hears it, with
         the drawn # left out, rather than as "hash the dash den". */
  var VOICE = typeof window.speechSynthesis !== 'undefined' && typeof window.SpeechSynthesisUtterance === 'function';
  // Chrome lists its voices a moment after it is first asked; asking now means
  // they are there by the time a message arrives.
  if (VOICE) window.speechSynthesis.getVoices();

  function localVoice() {
    var all = VOICE ? window.speechSynthesis.getVoices() : [];
    var lang = (document.documentElement.lang || 'en').toLowerCase().split('-')[0];
    var mine = null, any = null;
    for (var i = 0; i < all.length; i++) {
      if (!all[i].localService) continue;
      any = any || all[i];
      if (all[i].lang && all[i].lang.toLowerCase().split('-')[0] === lang) {
        if (!mine || all[i]['default']) mine = all[i];
      }
    }
    return mine || any;
  }

  Radio.prototype.setSpeak = function (on, quiet) {
    if (!VOICE) on = false;
    this.state.speak = on;
    this.speakBtn.setAttribute('aria-pressed', String(on));
    this.speakBtn.textContent = on ? 'Speak new messages aloud: on' : 'Speak new messages aloud: off';
    if (!on) this.hush();
    // Pressing the switch is the gesture that lets this page make a sound.
    else if (!quiet && AUDIO && !gentle()) { try { this.ctx = this.ctx || new AUDIO(); this.ctx.resume(); } catch (e) { /* no audio */ } }
    else if (!quiet && window.speechSynthesis.getVoices().length && !localVoice()) this.tell('This device has no voice of its own to read with, so nothing will be spoken.');
    if (!quiet) save(this.state);
  };

  /* THE SQUELCH. Ryan, 2026-09-26: a burst of static when a station keys up,
     the words, and the tail of static when it lets go, which is the sound a CB
     actually makes. It is noise made here, in the page, through Web Audio:
     nothing is fetched and nothing is recorded.

       · IT ONLY EVER COMES WITH THE WORDS. No squelch without a message being
         spoken, so with Speak off the radio is exactly as silent as it was,
         and "no chimes" stays true: a squelch is not a signal that something
         arrived, it is what the voice arriving sounds like.
       · IT FOLLOWS THE DIAL AND THE WORDS NEVER DO. Gentle speaks the message
         with no static round it; Regular and MAX key up and let go. The
         Adventurer's Guild fanfare's rule: decoration goes, the words stay.
       · ONE STATION AT A TIME. Messages are queued here rather than handed to
         speechSynthesis together, so each one gets its own key-up and tail
         instead of a pile of static and then a stream of words. */
  var AUDIO = window.AudioContext || window.webkitAudioContext;
  var BURST = 0.11, TAIL = 0.24, GAP = 260; // seconds, seconds, ms

  function gentle() {
    return document.documentElement.getAttribute('data-intensity') === 'gentle';
  }

  // The browser only lets a page make a sound once somebody has pressed or
  // typed something on it. Where it can say so, ask rather than fail.
  function mayPlay() {
    var ua = navigator.userActivation;
    return !ua || ua.hasBeenActive;
  }

  /* THE BODYMIND BREAK's loader: love.js's, and a copy of it for the radio's
     own window (cb-window.html), which has no love.js. bodymind-break.js is
     downloaded on the first press and on no page before. */
  function takeBreak(from) {
    if (window.loveTakeBreak) { window.loveTakeBreak(from); return; }
    if (window.loveBreak) { window.loveBreak.take(from); return; }
    var s = document.querySelector('script[data-love-break]');
    if (!s) {
      s = document.createElement('script');
      s.src = '/bodymind-break.js';
      s.setAttribute('data-love-break', '');
      document.head.appendChild(s);
    }
    s.addEventListener('load', function () { if (window.loveBreak) window.loveBreak.take(from); });
  }
  function breakUp() { return !!(window.loveBreak && window.loveBreak.open); }

  Radio.prototype.hush = function () {
    this.air = [];
    this.onAir = false;
    // What was cut off answers late, after anything started straight after
    // it; the generation is how it knows it is no longer the one speaking.
    this.gen = (this.gen || 0) + 1;
    this.readOver();
    clearTimeout(this.airTimer);
    if (this.noise) { try { this.noise.stop(); } catch (e) { /* already stopped */ } this.noise = null; }
    if (VOICE) window.speechSynthesis.cancel();
  };

  Radio.prototype.squelch = function (length, then) {
    if (gentle() || !AUDIO) { then(); return; }
    var ctx = this.ctx;
    try { if (!ctx) ctx = this.ctx = new AUDIO(); } catch (e) { then(); return; }
    if (ctx.state === 'suspended') ctx.resume();
    if (ctx.state !== 'running' && !mayPlay()) { then(); return; }
    var n = Math.ceil(ctx.sampleRate * length), buf = ctx.createBuffer(1, n, ctx.sampleRate);
    var d = buf.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    var src = this.noise = ctx.createBufferSource();
    src.buffer = buf;
    // A radio's speaker: nothing much below 400Hz or above 3kHz.
    var band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 1700;
    band.Q.value = 0.7;
    var amp = ctx.createGain(), t = ctx.currentTime;
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(0.12, t + 0.006);
    amp.gain.setValueAtTime(0.12, t + length * 0.4);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + length);
    src.connect(band); band.connect(amp); amp.connect(ctx.destination);
    var me = this, done = false;
    function next() { if (done) return; done = true; if (me.noise === src) me.noise = null; then(); }
    src.onended = next;
    // onended is not promised on every browser; the words must not wait on it.
    setTimeout(next, length * 1000 + 80);
    src.start(t);
    src.stop(t + length);
  };

  /* What the voice says for a message: its handle, who it answers, its words
     with a pause between paragraphs, and its picture's description or its
     sticker. Speak new messages aloud and Read aloud say the same. */
  function spokenText(li) {
    var words = li.querySelector('.cb-text').cloneNode(true);
    var drawn = words.querySelectorAll('[aria-hidden="true"]');
    for (var i = 0; i < drawn.length; i++) drawn[i].remove();
    // A pause between the Markdown's paragraphs, lines and list items, which
    // textContent would otherwise run together into one word.
    var parts = words.querySelectorAll('p, li, pre, br, h3, h4, h5, h6');
    for (i = 0; i < parts.length; i++) parts[i].after('. ');
    var pic = li.querySelector('.cb-picture-open');
    var told = pic ? ' ' + pic.getAttribute('aria-label').replace(/^Open the picture larger\. /, 'A picture: ') : '';
    var st = li.querySelector('.cb-sticker figcaption');
    if (st) told += ' A sticker: ' + st.textContent + '.';
    var re = li.querySelector(':scope > .cb-re'), reWho = re && re.querySelector('.cb-re__who');
    var answers = re ? (reWho ? ', replying to ' + reWho.textContent : ', replying to a message no longer there') : '';
    return li.querySelector('.cb-handle').textContent + answers + '. ' + words.textContent + told;
  }

  Radio.prototype.speak = function (li) {
    // Nothing aloud during a bodymind break; it is on the channel afterwards.
    if (!this.state.speak || this.state.folded || breakUp()) return;
    (this.air = this.air || []).push(spokenText(li));
    if (!this.onAir) this.transmitNext();
  };

  /* READ ALOUD, under a message's three dots (Ryan's ask, 2026-10-21): that
     one message, now, in Speak new messages aloud's voice and under its rules,
     an on-device voice only and the squelch following the dial, whether that
     switch is on or off. It stops whatever the radio was saying first, and
     pressed again while it reads, it stops. It goes through the same queue as
     a `read` item, so anything Speak aloud has waiting comes after it. */
  Radio.prototype.readBtn = function (m, li, say) {
    var me = this, b = el('button', 'cb-btn cb-read', 'Read aloud');
    var tellIt = say || function (t) { me.tell(t); };
    b.type = 'button';
    b.setAttribute('aria-label', 'Read ' + m.handle + '\u2019s message ' + sentAt(m.t) + ' aloud');
    b.addEventListener('click', function () { me.readAloud(li, b, tellIt); });
    return b;
  };
  Radio.prototype.readAloud = function (li, b, tellIt) {
    if (this.reading === b) { this.hush(); return; }
    if (!localVoice()) { tellIt('This device has no voice of its own to read with, so nothing will be spoken.'); return; }
    this.hush();
    this.reading = b;
    b.textContent = 'Stop reading';
    this.air = [{ read: true, text: spokenText(li) }];
    this.transmitNext();
  };
  Radio.prototype.readOver = function () {
    if (!this.reading) return;
    this.reading.textContent = 'Read aloud';
    this.reading = null;
  };

  // One message off the queue: key up, the words, let go, a breath, the next.
  Radio.prototype.transmitNext = function () {
    var me = this, item = this.air.shift(), voice = localVoice();
    var read = !!(item && item.read), text = read ? item.text : item;
    // A message pressed to be read has been, once whatever comes next starts.
    if (!read) this.readOver();
    if (!text || !voice || (!this.state.speak && !read) || this.state.folded) { this.onAir = false; this.readOver(); return; }
    this.onAir = true;
    if (!mayPlay()) {
      this.air = [];
      this.onAir = false;
      this.readOver();
      if (!this.askedToPlay) {
        this.askedToPlay = true;
        this.tell('Your browser will not let the radio speak on this page until you have pressed or typed something on it.');
      }
      return;
    }
    var gen = this.gen;
    this.squelch(BURST, function () {
      if (!me.onAir || me.gen !== gen) return;
      var u = new SpeechSynthesisUtterance(text), over = false;
      u.voice = voice;
      u.lang = voice.lang;
      function done(e) {
        if (over || me.gen !== gen) return;
        over = true;
        clearTimeout(me.airTimer);
        if (!me.onAir) return;
        if (e && e.error === 'not-allowed') { me.air = []; me.onAir = false; me.readOver(); return; }
        me.squelch(TAIL, function () {
          if (!me.onAir || me.gen !== gen) return;
          me.airTimer = setTimeout(function () { me.transmitNext(); }, GAP);
        });
      }
      u.onend = done;
      u.onerror = done;
      // Some browsers drop onend now and then; a message is never so long that
      // the queue should stall on it.
      me.airTimer = setTimeout(done, 4000 + text.length * 120);
      window.speechSynthesis.speak(u);
    });
  };

  /* SMALL IS STILL ON, AND THAT IS THE WHOLE DIFFERENCE FROM FOLDED. Ryan,
     2026-09-25, watching a film at the Hermitage's campfire: a way to see the
     latest message as it comes in without the radio covering the screen. Small
     is the bar and the newest message, clamped to a few lines, and nothing
     else; it listens exactly as full size does, and the screen reader hears
     what arrives exactly as it does full size, because the log is the same log
     with the older messages hidden. Nothing lights up when a message lands,
     here as anywhere on the radio. To answer, make it full size again: a box
     to type in is most of what the radio's height is. The radio is anchored by
     its bottom right corner, so it shrinks towards wherever it was put.

     ICON IS SMALLER AGAIN, AND STILL ON (Ryan, 2026-10-19): the radio drawn as
     a CB set on its own case, and nothing else. It listens, so a film you host
     or follow carries on and Be seen here still holds, but it shows nothing and
     reads nothing to a screen reader, because the log is not on the page; Small
     is the size for keeping an ear on the channel, and Fold away is still the
     only off. Nothing on the icon lights up when a message lands, the radio's
     rule. FULL is the whole window, less the gap every size keeps from its
     edges, for somebody who wants only the CB: the channel down the middle as
     tall as the window, and on a wide one, the other parts in a column either
     side (cb.css). It does not move, because there is nowhere to move it, and
     it sits under a room's call window rather than over it, so a call is never
     lost behind it. */
  var SIZES = ['icon', 'small', 'normal', 'large', 'full'];
  var SIZE_SAYS = { icon: 'an icon, still on', small: 'Small, the bar and the newest message', normal: 'Normal', large: 'Large, wider and taller', full: 'Full, the whole window' };
  Radio.prototype.setSize = function (size, quiet) {
    if (SIZES.indexOf(size) < 0) size = 'normal';
    // The chat page is the radio at Full, in the page, and has no other size.
    if (inChat()) size = 'full';
    var small = size === 'small', tiny = small || size === 'icon';
    var had = this.box.contains(document.activeElement) || (this.host && this.host.shadowRoot && this.host.shadowRoot.activeElement);
    this.state.size = size;
    this.state.small = small;   // kept, so a radio saved before sizes still opens small
    SIZES.forEach(function (s) { this.box.classList.toggle('cb-radio--' + s, s === size && s !== 'normal'); }, this);
    this.sizeShown();
    if (tiny) { this.close(); this.tell(''); }
    if (size === 'icon' && !this.tpPanel.hidden) this.setTeleport(false);
    if (!quiet) save(this.state);
    this.place();
    if (inWindow() && !quiet) this.fitWindow();
    if (!tiny) this.log.scrollTop = this.log.scrollHeight;
    // The minus that made it an icon has gone, so the keyboard goes to the icon.
    if (size === 'icon' && had && !this.state.folded) this.openerBtn.focus();
  };
  /* IN ITS OWN WINDOW A SIZE IS THE WINDOW'S: - and + make the window as big
     as the radio is at that size, as near as the browser allows, and Full fills
     the screen. Only on a press, never as messages arrive, and a browser that
     will not let a page size its window leaves the radio filling the one it has. */
  var WIN_WIDE = { icon: 120, small: 360, normal: 360, large: 640 };
  Radio.prototype.fitWindow = function () {
    var me = this;
    requestAnimationFrame(function () {
      var size = me.state.folded ? 'small' : (me.state.size || 'normal');
      var dw = window.outerWidth - window.innerWidth, dh = window.outerHeight - window.innerHeight;
      var w, h;
      if (size === 'full') {
        w = screen.availWidth; h = screen.availHeight;
        try { window.moveTo(screen.availLeft || 0, screen.availTop || 0); } catch (e) { /* the browser decides */ }
      } else {
        // As tall as what is in it, which in this window is not its height.
        var tall = 4;
        for (var i = 0; i < me.box.children.length; i++) {
          var c = me.box.children[i];
          if (getComputedStyle(c).display === 'none' || c.hidden) continue;
          tall += c === me.set ? c.scrollHeight : c.offsetHeight;
        }
        w = WIN_WIDE[size] + dw;
        h = Math.min(screen.availHeight, tall + dh);
      }
      try { window.resizeTo(Math.round(w), Math.round(h)); } catch (e) { /* the browser decides */ }
    });
  };

  /* OUT INTO A WINDOW OF ITS OWN, as big as the radio is now and where it is
     on the screen, so it keeps the size it is at. This radio steps aside once
     the window has opened; the window's radio is a new one, which reads
     love-cb as this one left it. A film hosted or followed here stops, and the
     radio says so on the bar left here. */
  Radio.prototype.popOut = function () {
    var r = this.box.getBoundingClientRect();
    var w = Math.max(240, Math.round(r.width)), h = Math.max(160, Math.round(r.height));
    var left = Math.round((window.screenX || 0) + r.left), top = Math.round((window.screenY || 0) + (window.outerHeight - window.innerHeight) + r.top);
    var win = null;
    try { win = window.open(CB_WINDOW, CB_WINDOW_NAME, 'popup,width=' + w + ',height=' + h + ',left=' + left + ',top=' + top); } catch (e) { win = null; }
    if (!win) { this.tell('Your browser stopped the window opening. Allow pop-ups for stimpunks.world to pop the radio out, or keep it here.'); return; }
    var stopped = !!(this.hosting || this.following);
    this.state.popped = true;
    save(this.state);
    stepAside(stopped ? 'The radio is in a window of its own. Hosting and Follow stopped here, because they need the radio on the page with the film.' : '');
  };

  // Small or an icon: what a press that needs the radio open makes Normal.
  Radio.prototype.tiny = function () { return this.state.size === 'small' || this.state.size === 'icon'; };

  /* A SCHEME, chosen: remembered in love-cb like the size, put on this radio and
     on the call window at once by call.js, and said on the radio's own line,
     which is where the eye is. Match my device says what it has matched. */
  Radio.prototype.setScheme = function (choice, quiet) {
    var lc = window.loveCall;
    if (!lc || !lc.redress) return;
    this.state.scheme = choice;
    if (!quiet) save(this.state);
    lc.redress(choice);
    this.schemeShown();
    this.drawArt();
    if (!quiet) {
      var now = lc.schemeFor(choice), c = this.schemeChoices, x = c[choice];
      this.tell(choice === 'auto'
        ? 'Your radio matches your device now, which means ' + c[now].name + '. It changes when your device does.'
        : 'Your radio is in ' + x.name + ' now, and the call window with it' + (x.about ? ', after ' + x.about : '') + '.' +
          (x.moves && this.motionOff() ? ' Its drawing moves at MAX GLITTER, or when you let it move.' : ''));
    }
  };

  // Whether a theme's drawing stands still here: not at MAX GLITTER, and not let move.
  Radio.prototype.motionOff = function () {
    return !this.state.motion && document.documentElement.getAttribute('data-intensity') !== 'max';
  };

  Radio.prototype.setMotion = function (on, quiet) {
    this.state.motion = !!on;
    if (!quiet) save(this.state);
    if (window.loveCall && window.loveCall.redress) window.loveCall.redress();
    this.schemeShown();
    if (!quiet) this.tell(on
      ? 'Your theme\u2019s drawing moves now, at every setting of the dial. Nothing in it flashes.'
      : 'Your theme\u2019s drawing stands still now, except at MAX GLITTER.');
  };

  /* THE DRAWING, for a theme that has one: cb-themes.js is fetched the first
     time one is on, and draws into the two trims at the width they have now.
     A trim with no width, folded or Small, waits: the ResizeObserver on it
     calls this again when it shows. Every other theme empties and hides them. */
  var artWait = null;
  function withArt(then) {
    if (window.loveCbArt) { then(); return; }
    if (!artWait) {
      artWait = [];
      var s = document.createElement('script');
      s.src = '/cb-themes.js';
      s.addEventListener('load', function () { var w = artWait; artWait = null; w.forEach(function (f) { f(); }); });
      document.head.appendChild(s);
    }
    artWait.push(then);
  }
  Radio.prototype.drawArt = function () {
    var me = this, lc = window.loveCall, top = this.trimTop, foot = this.trimFoot;
    if (!top || !lc || !lc.schemeFor) return;
    var look = lc.schemeFor(this.state.scheme), c = this.schemeChoices;
    var all = [top, foot, this.sideL, this.sideR].concat(this.dividers);
    if (!c || !c[look] || !c[look].art) {
      all.forEach(function (t) { t.hidden = true; t.textContent = ''; });
      this.artKey = this.sideKey = null;
      this.place();
      return;
    }
    withArt(function () {
      all.forEach(function (t) { t.hidden = false; });
      /* The trims and dividers are drawn for their width, which only Size,
         folding or a theme changes. The sides are drawn once for the window's
         height and never because the radio grew: a message arriving must not
         start a drawing again. */
      var w = top.clientWidth, key = look + '|' + w;
      if (w && key !== me.artKey) {
        me.artKey = key;
        var used = window.loveCbArt.draw(look, { top: top, foot: foot, dividers: me.dividers });
        top.hidden = !used.top;
        foot.hidden = !used.foot;
      }
      var side = look + '|' + window.loveCbArt.sideLength();
      if (side !== me.sideKey) {
        me.sideKey = side;
        window.loveCbArt.draw(look, { left: me.sideL, right: me.sideR });
      }
      me.place();
    });
  };

  // Whether the sides are showing, which is whether the radio keeps room for them.
  Radio.prototype.sidesShown = function () {
    return !!(this.sideL && !this.sideL.hidden && this.sideL.offsetWidth);
  };

  // Which choice is pressed, and each swatch drawn in the colours it stands for.
  Radio.prototype.schemeShown = function () {
    var lc = window.loveCall, mine = this.state.scheme || 'auto', c = this.schemeChoices;
    if (!lc || !c) return;
    var root = getComputedStyle(document.documentElement);
    Object.keys(c).forEach(function (k) {
      var look = lc.schemeFor(k), pre = look === 'amber' ? '--cb-' : '--cb-' + look + '-';
      ['case', 'lcd', 'amber', 'steel-2'].forEach(function (part) {
        c[k].swatch.style.setProperty('--sw-' + part, root.getPropertyValue(pre + part).trim());
      });
      c[k].button.setAttribute('aria-pressed', String(k === mine));
    });
    if (c.auto) c.auto.button.lastChild.textContent = 'Match my device (' + c[lc.schemeFor('auto')].name + ')';
    if (this.motionBtn) {
      this.motionBtn.setAttribute('aria-pressed', String(!!this.state.motion));
      this.motionBtn.textContent = 'Let my theme move: ' + (this.state.motion ? 'on' : 'off');
    }
  };

  /* ── Notifications (Ryan, 2026-10-18) ──────────────────────────────────
     A device's side lives in the browser: the service worker, /cb-sw.js, and
     its push subscription, which only exist once Notify me on this device has
     been pressed, and are taken away by Switch off on this device and by
     signing off. What the device asked for is kept on the street, beside its
     push address (/cb/push), and nothing it is sent is kept anywhere. */
  var NOTIFY_SW = '/cb-sw.js';
  /* EVERYTHING comes first (feedback from our community and Ryan's call,
     2026-10-19): every kind below, every message on World included, and any
     kind added later, which the street decides with wants() in lib.mjs. It
     leaves the words and the rooms you follow as they are. While it is on,
     every kind reads on, and switching one off switches Everything off and
     keeps the others on. */
  var NOTIFY_ALL = 'Everything, and anything added later';
  var NOTIFY_KINDS = [
    ['mentions', 'When somebody @mentions me'],
    ['replies', 'When somebody replies to me'],
    ['props', 'When somebody gives me props'],
    ['messages', 'When somebody messages me'],
    ['world', 'Every message on World'],
    ['calls', 'Calls starting in rooms I follow, and the World call'],
    // Tasks are for directors, board members and administrators, on the base pass, so only a base pass is offered the switch.
    ['tasks', 'Something new in my Notifications in Tasks', 'base'],
    // Events (Ryan's ask, 2026-10-23): one you said you are interested in starting, and a new one.
    ['events', 'When an event I\u2019m interested in starts'],
    ['scheduled', 'New events on World and in rooms I follow'],
    ['words', 'Show the words of a message, a post, props, a task or an event\u2019s title'],
  ];
  function pushable() { return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window; }
  function ourReg() {
    if (!pushable()) return Promise.resolve(null);
    return navigator.serviceWorker.getRegistration('/').then(function (r) {
      var w = r && (r.active || r.waiting || r.installing);
      return w && /\/cb-sw\.js$/.test(w.scriptURL) ? r : null;
    }).catch(function () { return null; });
  }
  function subOf(sub) { var j = sub.toJSON(); return { endpoint: j.endpoint, keys: j.keys }; }
  function keyBytes(k) {
    var b = atob(String(k).replace(/-/g, '+').replace(/_/g, '/')), a = new Uint8Array(b.length);
    for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i);
    return a;
  }
  /* This device's notifications off: on the street first, with the pass it
     was switched on with, then the subscription and the worker themselves. */
  function dropThisDevice(pass) {
    return ourReg().then(function (reg) {
      if (!reg) return null;
      return reg.pushManager.getSubscription().then(function (sub) {
        var told = sub && pass ? call('/cb/push', { body: { drop: sub.endpoint } }, pass).catch(function () {}) : Promise.resolve();
        return told.then(function () { return sub ? sub.unsubscribe() : null; }).then(function () { return reg.unregister(); });
      });
    }).catch(function () { return null; });
  }

  /* CLOSE AT THE FOOT (Ryan's ask, 2026-10-19): a long tray ends in a button
     that closes it, so nobody has to scroll back up past all of it for the
     button that opened it. Closing puts the view and the keyboard back on that
     button, which is where the tray began. */
  Radio.prototype.footClose = function (label, close, opener) {
    var me = this, row = el('div', 'cb-row cb-foot-close');
    var b = el('button', 'cb-btn', label);
    b.type = 'button';
    b.addEventListener('click', function () {
      close();
      opener.scrollIntoView({ block: 'nearest' });
      opener.focus({ preventScroll: true });
      me.place();
    });
    row.appendChild(b);
    return row;
  };

  Radio.prototype.setNotify = function (open) {
    this.notifyPanel.hidden = !open;
    this.notifyBtn.setAttribute('aria-expanded', String(!!open));
    if (open) this.notifyLoad();
    this.place();
  };

  Radio.prototype.notifyLoad = function () {
    var me = this, box = this.notifyBody;
    box.textContent = '';
    box.appendChild(el('h3', 'cb-h3', 'Notifications on this device'));
    var said = el('p', 'cb-quiet', 'Looking…');
    box.appendChild(said);
    if (!pushable()) {
      said.textContent = 'This browser cannot show notifications from a website. On an iPhone or iPad with iOS or iPadOS 26 or later, add stimpunks.world to your Home Screen (Share, then Add to Home Screen, with Open as Web App left on) and open it from there.';
      return;
    }
    this.loadRooms();
    Promise.all([call('/cb/push', { body: { key: true } }, me.state.pass), ourReg()]).then(function (rs) {
      if (rs[0].status === 401) return me.lost();
      var key = rs[0].status === 200 && rs[0].body ? rs[0].body.key : null;
      if (!key) { said.textContent = 'Notifications are not set up on the street yet.'; return; }
      me.pushKey = key;
      var reg = rs[1];
      (reg ? reg.pushManager.getSubscription() : Promise.resolve(null)).then(function (sub) {
        if (!sub) { me.notifyDraw(null, null); return; }
        call('/cb/push', { body: { read: sub.endpoint } }, me.state.pass).then(function (r) {
          me.notifyDraw(sub, r.status === 200 && r.body ? r.body.want : null);
        }, function () { me.notifyDraw(sub, null); });
      });
    }, function () { said.textContent = 'The street could not be reached just now.'; });
  };

  Radio.prototype.notifyDraw = function (sub, want, told, focusKey) {
    var me = this, box = this.notifyBody;
    var on = !!(sub && want);
    if (want) this.notifyWant = want;
    var w = this.notifyWant = this.notifyWant || { all: false, mentions: false, props: false, messages: false, world: false, calls: false, tasks: false, events: false, scheduled: false, words: true, rooms: [], everyRoom: false };
    box.textContent = '';
    box.appendChild(el('h3', 'cb-h3', 'Notifications on this device'));
    box.appendChild(el('p', null, on
      ? 'On for this device, as ' + me.state.handle + '. It is told about what is switched on below, even with stimpunks.world closed.'
      : 'Off on this device. Choose what you want to be told about, then press Notify me on this device. Your browser will ask whether stimpunks.world may show notifications.'));
    if (window.Notification && Notification.permission === 'denied') {
      box.appendChild(el('p', 'cb-quiet', 'Notifications are blocked for stimpunks.world in this browser’s settings. Allow them there, then come back here.'));
    }
    var said = el('p', 'cb-said');
    said.setAttribute('role', 'status');
    function apply(next, key) {
      if (!on) { me.notifyWant = next; me.notifyDraw(null, null, '', key); return; }
      call('/cb/push', { body: { device: subOf(sub), want: next } }, me.state.pass).then(function (r) {
        if (r.status === 401) return me.lost();
        if (r.status === 200 && r.body.want) { me.notifyDraw(sub, r.body.want, 'Changed.', key); return; }
        said.textContent = (r.body && r.body.error) || 'That did not work just now. Nothing changed.';
      }, function () { said.textContent = 'The street could not be reached just now. Nothing changed.'; });
    }
    var row = el('div', 'cb-notify__kinds');
    var every = el('button', 'cb-btn cb-notify__kind', NOTIFY_ALL + ': ' + (w.all ? 'on' : 'off'));
    every.type = 'button';
    every.setAttribute('aria-pressed', String(!!w.all));
    every.setAttribute('aria-describedby', 'cb-notify-all');
    every.addEventListener('click', function () { apply(Object.assign({}, w, { all: !w.all }), 'all'); });
    row.appendChild(every);
    if (focusKey === 'all') setTimeout(function () { every.focus(); }, 0);
    NOTIFY_KINDS.forEach(function (k) {
      if (k[2] === 'base' && !me.state.base) return;
      // The words are not a kind of notification, so Everything leaves them alone.
      var kind = k[0] !== 'words', is = !!(w[k[0]] || (kind && w.all));
      var b = el('button', 'cb-btn cb-notify__kind', k[1] + ': ' + (is ? 'on' : 'off'));
      b.type = 'button';
      b.setAttribute('aria-pressed', String(is));
      b.addEventListener('click', function () {
        var n = Object.assign({}, w);
        if (kind && w.all) {
          n.all = false;
          NOTIFY_KINDS.forEach(function (x) { if (x[0] !== 'words') n[x[0]] = true; });
        }
        n[k[0]] = !is;
        apply(n, k[0]);
      });
      row.appendChild(b);
      if (focusKey === k[0]) setTimeout(function () { b.focus(); }, 0);
    });
    box.appendChild(row);
    var allSays = el('p', 'cb-hint', w.all
      ? 'Everything is on, so anything new the street can tell you about will be on here too, without asking. Switch any one off and the rest stay on. Rooms you follow are still your own list.'
      : 'Everything switches on every kind above, every message on World included, and anything the street adds later. Rooms you follow stay your own list.');
    allSays.id = 'cb-notify-all';
    box.appendChild(allSays);
    // Rooms you follow: every room, or this one, if this page is one, and every one you follow.
    box.appendChild(el('p', 'cb-pets__h', 'Rooms you follow'));
    /* EVERY ROOM (Norah's ask, 2026-10-21): every message in every room your
       pass can go into, rooms that open later too, instead of one at a time;
       followsRoom() in lib.mjs. Never a room that keeps to itself, which tells
       only a device that followed it there by name, so that switch stays. */
    var ev = el('button', 'cb-btn', 'Follow every room: ' + (w.everyRoom ? 'on' : 'off'));
    ev.type = 'button';
    ev.setAttribute('aria-pressed', String(!!w.everyRoom));
    ev.setAttribute('aria-describedby', 'cb-notify-every');
    ev.addEventListener('click', function () { apply(Object.assign({}, w, { everyRoom: !w.everyRoom }), 'every'); });
    box.appendChild(ev);
    if (focusKey === 'every') setTimeout(function () { ev.focus(); }, 0);
    var evSays = el('p', 'cb-hint', w.everyRoom
      ? 'Every message in every room you can go into tells this device, rooms that open later too, and with Calls on, every call starting in one. World is its own switch, above. A room that keeps to itself tells you only if you follow it there. The rooms you follow one by one stay your list for when this goes off.'
      : 'Every message in every room you can go into, rooms that open later too, instead of following them one at a time. It can be a lot.');
    evSays.id = 'cb-notify-every';
    box.appendChild(evSays);
    var room = hereRoom();
    // Following every room, this one is followed already, unless it keeps to
    // itself, or has a feed bot, whose arrivals tell only a device that
    // follows the room by name (notifyWire in lib.mjs).
    var bot = !!room && BOT_ROOMS.indexOf(room.tag) >= 0;
    if (room && (!w.everyRoom || room.quiet || bot)) {
      var follows = w.rooms.indexOf(room.tag) >= 0;
      var fb = el('button', 'cb-btn', 'Follow ' + room.name + ': ' + (follows ? 'on' : 'off'));
      fb.type = 'button';
      fb.setAttribute('aria-pressed', String(follows));
      fb.addEventListener('click', function () {
        var n = Object.assign({}, w, { rooms: follows ? w.rooms.filter(function (t) { return t !== room.tag; }) : w.rooms.concat([room.tag]) });
        apply(n, 'follow');
      });
      box.appendChild(fb);
      if (bot) box.appendChild(el('p', 'cb-hint', 'Following ' + room.name + ' here, by name, also tells you about every new arrival it says on its channel. Follow every room does not.'));
      if (focusKey === 'follow') setTimeout(function () { fb.focus(); }, 0);
    }
    if (w.rooms.length) {
      var ul = el('ul', 'cb-notify__rooms');
      w.rooms.forEach(function (t) {
        var li = el('li');
        var r = byTag[t] || (room && room.tag === t ? room : null);
        li.appendChild(document.createTextNode(r ? r.name : '#' + t));
        var x = el('button', 'cb-btn cb-notify__unfollow', 'Stop following');
        x.type = 'button';
        x.setAttribute('aria-label', 'Stop following ' + (r ? r.name : t));
        x.addEventListener('click', function () { apply(Object.assign({}, w, { rooms: w.rooms.filter(function (y) { return y !== t; }) }), 'follow'); });
        li.appendChild(document.createTextNode(' '));
        li.appendChild(x);
        ul.appendChild(li);
      });
      box.appendChild(ul);
    } else if (!w.everyRoom) {
      box.appendChild(el('p', 'cb-quiet', room ? 'None yet. Following a room tells you about every message on its channel.' : 'None yet. In a room, this tray can follow it: every message on its channel.'));
    }
    var acts = el('div', 'cb-acct__row');
    if (!on) {
      var go = el('button', 'cb-btn', 'Notify me on this device');
      go.type = 'button';
      go.addEventListener('click', function () { me.notifyOn(go, said); });
      acts.appendChild(go);
      if (focusKey === 'go') setTimeout(function () { go.focus(); }, 0);
    } else {
      var test = el('button', 'cb-btn', 'Send me a test');
      test.type = 'button';
      test.addEventListener('click', function () {
        said.textContent = 'Sending…';
        call('/cb/push', { body: { test: subOf(sub) } }, me.state.pass).then(function (r) {
          if (r.status === 200 && r.body.sent) {
            said.textContent = 'Sent, and your browser\u2019s push service took it. It should appear in a moment. If it does not, the computer may be keeping it back: on a Mac, System Settings, Notifications, then your browser, needs Allow notifications on, and Focus or Do Not Disturb hides them.';
          } else if (r.status === 200) {
            said.textContent = 'Your browser\u2019s push service did not take it (it answered ' + (r.body.status || 'nothing') + '). Switch off on this device, then Notify me on this device again.';
          } else said.textContent = (r.body && r.body.error) || 'The street could not send it just now.';
        }, function () { said.textContent = 'The street could not be reached just now.'; });
      });
      var stop = el('button', 'cb-btn', 'Switch off on this device');
      stop.type = 'button';
      stop.addEventListener('click', function () {
        stop.disabled = true;
        dropThisDevice(me.state.pass).then(function () { me.notifyDraw(null, null, 'Off. This device is not told about anything now, and the street has forgotten it.', 'go'); });
      });
      acts.appendChild(test);
      acts.appendChild(stop);
    }
    box.appendChild(acts);
    said.textContent = told || '';
    box.appendChild(said);
    var more = el('p', 'cb-hint');
    more.appendChild(document.createTextNode('What is kept, and what your browser’s push service sees: '));
    var pa = el('a', null, 'Privacy');
    pa.href = '/privacy.html#notifications';
    more.appendChild(pa);
    more.appendChild(document.createTextNode('.'));
    box.appendChild(more);
  };

  // Notify me on this device: the browser's question first, inside the press.
  Radio.prototype.notifyOn = function (btn, said) {
    var me = this;
    btn.disabled = true;
    said.textContent = 'Asking your browser…';
    Promise.resolve(Notification.requestPermission()).then(function (p) {
      if (p !== 'granted') {
        btn.disabled = false;
        said.textContent = 'Notifications were not allowed, so nothing was switched on. Your browser’s settings for stimpunks.world can allow them.';
        return null;
      }
      return navigator.serviceWorker.register(NOTIFY_SW, { scope: '/' })
        .then(function () { return navigator.serviceWorker.ready; })
        .then(function (reg) {
          return reg.pushManager.getSubscription().then(function (s) {
            return s || reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(me.pushKey) });
          });
        })
        .then(function (sub) {
          return call('/cb/push', { body: { device: subOf(sub), want: me.notifyWant } }, me.state.pass).then(function (r) {
            btn.disabled = false;
            if (r.status === 401) return me.lost();
            if (r.status === 200 && r.body.want) { me.notifyDraw(sub, r.body.want, 'On. Send me a test shows how one looks here.'); return null; }
            said.textContent = (r.body && r.body.error) || 'That did not work just now. Nothing was switched on.';
            return sub.unsubscribe();
          });
        });
    }).catch(function () {
      btn.disabled = false;
      said.textContent = 'This browser would not switch notifications on just now. Nothing was kept.';
    });
  };

  Radio.prototype.setSchemePanel = function (open) {
    this.schemePanel.hidden = !open;
    this.schemeBtn.setAttribute('aria-expanded', String(!!open));
    if (open) {
      this.schemeShown();
      var on = this.schemePanel.querySelector('[aria-pressed="true"]') || this.schemePanel.querySelector('button');
      if (on) on.focus();
    }
    this.place();
  };

  /* Minus and plus: one size down or up, and at either end the button with
     nowhere to go says so on the radio's line rather than doing nothing. At
     Icon there is no minus to press: the icon is the way back up. */
  Radio.prototype.stepSize = function (by) {
    var top = SIZES.length - 1, i = SIZES.indexOf(this.state.size || 'normal'), j = Math.max(0, Math.min(top, i + by));
    if (j === i) { this.tell(by < 0 ? 'The radio is as small as it goes.' : 'The radio is as large as it goes.'); return; }
    this.tell('');
    this.setSize(SIZES[j]);
  };
  Radio.prototype.sizeShown = function () {
    var top = SIZES.length - 1, i = SIZES.indexOf(this.state.size || 'normal');
    this.smallerBtn.setAttribute('aria-label', i > 0 ? 'Smaller: ' + SIZE_SAYS[SIZES[i - 1]] : 'Smaller: already an icon');
    this.largerBtn.setAttribute('aria-label', i < top ? 'Larger: ' + SIZE_SAYS[SIZES[i + 1]] : 'Larger: already Full');
    this.smallerBtn.setAttribute('aria-disabled', String(i === 0));
    this.largerBtn.setAttribute('aria-disabled', String(i === top));
  };

  Radio.prototype.setFolded = function (folded, quiet) {
    // The chat page is the radio switched on; leaving the page is switching it off.
    if (inChat()) folded = false;
    this.state.folded = folded;
    this.box.classList.toggle('cb-radio--folded', folded);
    this.set.hidden = folded;
    this.sizer.hidden = folded;
    this.tpBtn.hidden = folded;
    this.breakBarBtn.hidden = !folded;
    if (folded && !this.tpPanel.hidden) this.setTeleport(false);
    if (folded && !this.petsPanel.hidden) this.setPets(false);
    if (folded && !this.acctPanel.hidden) this.setAccount(false);
    if (folded && !this.screenPanel.hidden) this.setScreenPanel(false);
    this.foldBtn.setAttribute('aria-expanded', String(!folded));
    this.foldBtn.textContent = folded ? 'Switch on' : 'Fold away';
    if (folded) this.hush();
    // Folded sends nothing, so a beacon cannot say it has stopped: it goes
    // quiet, and every radio stops showing it within seventy-five seconds.
    if (folded && this.hosting) { this.hosting = null; this.hostShown(); }
    // Folded, the radio hears no beacons, so it cannot follow one either.
    if (folded && this.following) this.following = null;
    if (!quiet) save(this.state);
    this.place();
    this.tune();
    if (this.present) this.presenceShown();
  };

  /* Listening happens here and nowhere else, so this is the one function that
     decides whether the radio is making requests. */
  Radio.prototype.tune = function () {
    var on = !this.state.folded && document.visibilityState === 'visible';
    // Whatever was said while it was off is on the screen when it comes back,
    // and is not read out: nothing is saved up for when you come back.
    if (!on) this.heard = false;
    if (!on) this.leaveSeen();
    clearTimeout(this.timer);
    this.timer = null;
    if (on) this.listen();
  };

  Radio.prototype.listen = function () {
    var me = this;
    if (this.whereNow()) return;
    this.loadRooms();
    // The chat page hears nothing until it knows which channels there are.
    if (inChat() && !this.chatSure) { this.chatWait(); return; }
    /* Tuned to a room, the first listen waits for the street's list, so that
       a page that is no room (the 404 answers any address) never sends its
       address to us as if it were one: it hears World instead. */
    if (this.state.band === 'room' && rooms === null && !offList()) {
      this.roomsReady.then(function () {
        if (radio === me && !me.state.folded && document.visibilityState === 'visible') me.tune();
      });
      return;
    }
    // A live video counts here: Add my spot and Host this film both have a
    // live way of saying where you are.
    var w = window.loveEmbed && window.loveEmbed.where ? window.loveEmbed.where({ live: true }) : null;
    this.spotBtn.hidden = !w;
    this.hostBtn.hidden = !w && !this.hosting;
    this.screenBtn.hidden = !(this.state.base && firstScreen());
    if (this.screenBtn.hidden && !this.screenPanel.hidden) this.setScreenPanel(false);
    this.filmShown();
    this.screenNamed(w);
    this.hostTick(w);
    this.hereTick();
    if (!this.online.hidden) this.onlineTick();
    if (this.dmBox && !this.dmBox.hidden) this.dmTick();
    this.newsTick();
    this.evTick();
    if (inChat()) this.chatDmTick();
    var room = this.tunedRoom(), sent = this.state.pass;
    call('/cb/channel' + (room ? '?room=' + room : ''), null, sent).then(function (r) {
      // A listen that left just before the pass changed, by claiming the
      // username or changing its password, is refused for the old pass: only a
      // refusal of the pass the radio holds now signs it off.
      if (r.status === 401) { if (sent === me.state.pass) me.lost(); return; }
      if (r.body && r.body.swap && sent === me.state.pass) me.takeSwap(r.body.swap);
      // Retuned while this was on its way: it is the other channel's answer.
      if (r.status === 200 && (r.body.room || null) !== me.tunedRoom()) return;
      if (r.status === 200) {
        me.signal(true); me.show(r.body.messages || []); me.readTick(r.body.messages || []); me.showBeacons(r.body.beacons, r.body.now);
        me.calls = !!r.body.calls;
        me.callShown();
        me.keepRoles(r.body.roles);
        // The roles this pass may call with an @ (mentionableRoles), for the @ list only: never kept.
        me.mayRoles = Array.isArray(r.body.mention) ? r.body.mention.filter(function (x) { return ROLE_SAYS[x]; }) : [];
      }
      else me.signal(false);
    }).catch(function () { me.signal(false); })
      .then(function () {
        if (!me.state.folded && document.visibilityState === 'visible' && radio === me) {
          clearTimeout(me.timer);
          me.timer = setTimeout(function () { me.listen(); }, EVERY);
        }
      });
  };

  /* IT NEVER SCROLLS UNDER SOMEBODY WHO IS READING. This used to set the log to
     the bottom on every listen, every four seconds, so scrolling up to read
     something earlier was undone a moment later; Ryan found it. Now it follows
     the newest message only when something new has arrived AND the log was
     already at the bottom, or when you have just transmitted yourself. Anybody
     scrolled up stays where they are; the screen reader still hears what
     arrives, because that is the live region's job and not the scroll bar's. */
  Radio.prototype.show = function (messages, mine) {
    var me = this, want = {}, i, added = 0;
    /* What is on the channel now, for Take to the forums, Up to edit and the @
       list. Not this.onAir, which is the voice's flag that it is speaking: the
       two shared a name from 2026-10-18, and the list being there kept the
       voice from ever starting (Speak new messages aloud said nothing). */
    this.aired = messages;
    var log = this.log;
    var atEnd = log.hidden || log.scrollHeight - log.scrollTop - log.clientHeight < 24;
    // The first hearing is what was already said; only what comes after is news.
    var news = this.heard;
    this.heard = true;
    for (i = 0; i < messages.length; i++) want[messages[i].id] = true;
    // Gone from the channel: pushed off by a newer one, taken off, or past its
    // 48 hours.
    // The log's own children only: a message's Markdown list has li in it too.
    var lis = this.log.querySelectorAll(':scope > li');
    for (i = 0; i < lis.length; i++) {
      if (!want[lis[i].dataset.id]) {
        delete this.seen[lis[i].dataset.id];
        var gone = lis[i].querySelector('img[data-pic]');
        if (gone && this.pics && this.pics[gone.dataset.pic]) {
          // A picture open in the lightbox closes when its message goes.
          if (this.lbox && this.lboxId === gone.dataset.pic && this.lbox.open) this.lbox.close();
          URL.revokeObjectURL(this.pics[gone.dataset.pic]);
          delete this.pics[gone.dataset.pic];
        }
        // The message you were editing went: the keyboard goes to the
        // message box rather than to nowhere, and the radio says why.
        if (this.editing && this.editing.li === lis[i]) {
          var held = this.editing.box.contains(this.box.getRootNode().activeElement);
          this.editing = null;
          if (held && this.say.offsetParent) this.say.focus();
          this.tell('The message you were editing has gone off the air.');
        }
        if (this.replying && this.replying.id === lis[i].dataset.id) {
          this.replyStop();
          this.tell('The message you were replying to has gone off the air. What you write now goes out on its own.');
        }
        lis[i].remove();
      }
    }
    for (i = 0; i < messages.length; i++) {
      var m = messages[i];
      if (this.seen[m.id]) {
        // Already on the log: only its words, if its sender edited it, and
        // its reactions can have changed.
        var was = this.msgLi(m.id);
        if (was) { this.drawWords(was, m); this.drawReactions(was, m); this.drawRe(was, m, messages, this.log, RE_GONE); }
        continue;
      }
      this.seen[m.id] = true;
      var bot = !!m.feed;
      var li = el('li', 'cb-msg' + (m.base ? ' cb-msg--base' : '') + (bot ? ' cb-msg--bot' : ''));
      li.dataset.id = m.id;
      var head = el('p', 'cb-head');
      var who;
      if (bot) {
        // A room's feed bot (runFeedBot in lib.mjs) is nobody, so its name opens no profile.
        who = el('span', 'cb-handle cb-handle--bot', m.handle);
      } else {
        who = el('button', 'cb-handle', m.handle);
        who.type = 'button';
        who.setAttribute('aria-haspopup', 'dialog');
        (function (h, b, mk) { b.addEventListener('click', function () { me.peek(h, b, mk); }); })(m.handle, who, m);
      }
      head.appendChild(who);
      if (m.base) head.appendChild(el('span', 'cb-tag', 'BASE'));
      if (bot) head.appendChild(el('span', 'cb-tag', 'BOT'));
      var when = el('time', 'cb-time', clock(m.t));
      when.dateTime = new Date(m.t).toISOString();
      head.appendChild(when);
      li.appendChild(head);
      // A reply says what it answers above the name, first in the markup too,
      // so the log's live region reads who it answers before what it says.
      this.drawRe(li, m, messages, this.log, RE_GONE);
      var said = el('div', 'cb-text' + (bot ? ' cb-feed' : ''));
      said.cbRaw = m.text || '';
      said.cbAt = m.at || [];
      said.cbRoles = m.roles || [];
      if (bot) li.appendChild(feedCard(said, m.feed));
      else {
        li.appendChild(md(said, m.text));
        this.markAt(said, said.cbAt, said.cbRoles);
      }
      this.markEdited(li, m);
      if (m.img) li.appendChild(this.picture_(m));
      if (m.sticker) li.appendChild(sticker(m.sticker));
      if (m.avatar) li.appendChild(avatarSticker(m.avatar));
      if (m.chimera) li.appendChild(chimeraSticker(m.chimera));
      if (m.patch) li.appendChild(patchSticker(m.patch));
      if (m.jacket) li.appendChild(jacketSticker(m.jacket));
      /* REACTIONS: who pressed what, by handle and never how many. Not read out
         as they change: the log is a live region, and a reaction landing is
         not a message, so this line is its own region with politeness off. */
      var rx = el('div', 'cb-rx');
      rx.setAttribute('aria-live', 'off');
      li.appendChild(rx);
      this.drawReactions(li, m);
      added++;
      /* Drawn on the message's own name-and-time line by cb.css, but kept
         AFTER the words in the markup: the log is a live region, and a new
         message is announced in markup order, so "React" or "More" first
         would be read in front of every message. Two icons, a smiley for React
         and three dots for More, which holds Copy and Take off (a proposal
         Ryan brought, 2026-10-17: a row of words on every message was a lot to
         look at). cb.css shows them while a message is pointed at or has the
         keyboard in it, and always where nothing can point. */
      this.drawActs(li, m);
      this.log.appendChild(li);
      if (news && !(mine && m.handle === this.state.handle)) this.speak(li);
    }
    this.quiet.textContent = this.quietText();
    this.quiet.hidden = messages.length > 0;
    this.log.hidden = messages.length === 0;
    if (mine || (added && atEnd)) this.log.scrollTop = this.log.scrollHeight;
  };

  /* A NEW ARRIVAL, said by The Feed or The Source on its own channel (Ryan's
     ask, 2026-10-23, after Discord's feed bots; runFeedBot in lib.mjs): the
     site, the item's name as a link that says where it goes, and for a commit
     its short id, its day and whose hands. Built as elements from what the
     server's shapeFeed checked, and nothing in it is read as Markdown, because
     somebody else's title is not a message anybody here wrote. */
  // The rooms with a feed bot: FEED_NAMES's tags in lib.mjs, which
  // tools/make-the-source.py holds this copy to.
  var BOT_ROOMS = ['the-feed', 'the-source'];
  function feedCard(said, f) {
    var p = el('p', 'cb-feed__item');
    p.appendChild(el('span', 'cb-feed__site', f.site));
    p.appendChild(document.createTextNode(': '));
    var u = awayUrl(f.url);
    if (u && onStreet(f.url)) {
      var a = el('a', null, f.title);
      a.href = u.pathname + u.search + u.hash;
      p.appendChild(a);
    } else p.appendChild(u ? awayLink(f.title, u) : document.createTextNode(f.title));
    said.appendChild(p);
    if (f.sha) {
      var hands = (f.anon ? ['somebody GitHub does not name'] : []).concat(f.by || []);
      var day = new Date(f.when).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
      said.appendChild(el('p', 'cb-feed__how', f.sha + ' \u00b7 ' + day + ' \u00b7 ' +
        (hands.length ? 'by ' + names(hands) : 'GitHub names nobody')));
    }
    return said;
  }

  /* React and More, after everything else in the message (above for why).
     Drawn again only when an edit gives a message words or takes them all
     away, because Copy and Take to the forums are only on a message with
     words in it; the keyboard goes back to More if it was in them. */
  Radio.prototype.drawActs = function (li, m) {
    var me = this, on = this.box.getRootNode().activeElement;
    var was = li.querySelector(':scope > .cb-acts'), old = li.querySelector(':scope > .cb-more-menu');
    var held = !!on && ((was && was.contains(on)) || (old && old.contains(on)));
    if (was) was.remove();
    if (old) old.remove();
    var acts = el('div', 'cb-acts');
    acts.appendChild(this.reactBtn(m, li));
    acts.appendChild(this.replyBtn(m, function () { me.replyStart(m.id); }));
    var more = this.moreFor(m, li);
    if (more) acts.appendChild(more.btn);
    li.appendChild(acts);
    if (more) li.appendChild(more.box);
    if (held) (more ? more.btn : acts.firstChild).focus();
  };

  /* REPLY, between React and the dots (Ryan's ask, 2026-10-21): the bar above
     the message box says whose message and its first words, and Transmit
     sends yours as an answer to it. Cancel reply, or Escape in the box, lets
     it go and keeps what you wrote. */
  Radio.prototype.replyBtn = function (m, start) {
    var b = el('button', 'cb-btn cb-ico cb-reply');
    b.type = 'button';
    b.appendChild(msgIcon('reply'));
    b.setAttribute('aria-label', 'Reply to ' + m.handle + '\u2019s message ' + sentAt(m.t));
    b.addEventListener('click', start);
    return b;
  };
  Radio.prototype.replyStart = function (id) {
    var m = (this.aired || []).filter(function (x) { return x.id === id; })[0];
    if (!m) return;
    if (this.editing) this.editStop();
    this.replying = { id: id };
    reOn(this.reBar, this.say, m);
    this.say.focus();
    this.reBar.scrollIntoView({ block: 'nearest' });
  };
  Radio.prototype.replyStop = function () {
    if (!this.replying) return;
    this.replying = null;
    reOff(this.reBar, this.say);
  };

  /* THE QUOTE, above the message's name: who it answers and their first
     words, a button that takes you to that message while it is still there,
     and words saying it has gone once it has. `list` is what is there now,
     `log` the list it is drawn in, the channel's or a conversation's, and
     `gone` what to say. Drawn again only when what it says changes, with the
     keyboard kept on it. */
  Radio.prototype.drawRe = function (li, m, list, log, gone) {
    var me = this, was = li.querySelector(':scope > .cb-re');
    if (!m.re) { if (was) was.remove(); return; }
    var to = null;
    for (var i = 0; i < list.length; i++) if (list[i].id === m.re) { to = list[i]; break; }
    var key = to ? to.handle + '\n' + reWords(to) : '';
    if (was && was.dataset.key === key) return;
    var held = !!was && was === this.box.getRootNode().activeElement;
    var q;
    if (to) {
      q = el('button', 'cb-re');
      q.type = 'button';
      var mark = el('span', 'cb-re__mark', '\u21aa');
      mark.setAttribute('aria-hidden', 'true');
      q.appendChild(mark);
      q.appendChild(document.createTextNode('Replying to '));
      q.appendChild(el('b', 'cb-re__who', to.handle));
      q.appendChild(document.createTextNode(': ' + reWords(to)));
      q.addEventListener('click', function () { me.reJump(log, m.re); });
    } else q = el('p', 'cb-re', gone);
    q.dataset.key = key;
    if (was) was.replaceWith(q); else li.insertBefore(q, li.firstChild);
    if (held && to) q.focus();
  };
  /* A quote pressed: the message it answers, brought into view in its list
     and given the keyboard, edged so you can see which. Small shows only the
     newest message, so the radio is made Normal for this page, as a
     notification of props makes it. */
  Radio.prototype.reJump = function (log, id) {
    var li = log.querySelector(':scope > li[data-id="' + CSS.escape(id) + '"]');
    if (!li) return;
    if (log === this.log && this.state.size === 'small') this.setSize('normal', true);
    li.tabIndex = -1;
    li.scrollIntoView({ block: 'nearest' });
    li.focus({ preventScroll: true });
  };

  /* AN EDIT arrives as the same message with new words and a later `edited`
     (Ryan, 2026-10-18). The words and the mark are drawn again and nothing
     else on the message moves. The log is a live region, so the new words are
     read out as they land, after the mark the first time: what a screen
     reader hears is that it was edited, and what it says now. */
  Radio.prototype.drawWords = function (li, m) {
    var said = li.querySelector(':scope > .cb-text');
    if (!said) return;
    var text = m.text || '';
    if (said.cbRaw === text && (li.dataset.edited || '') === String(m.edited || '')) return;
    var had = !!said.cbRaw;
    this.markEdited(li, m);
    said.cbRaw = text;
    said.cbAt = m.at || [];
    said.cbRoles = m.roles || [];
    said.textContent = '';
    md(said, text);
    this.markAt(said, said.cbAt, said.cbRoles);
    if (had !== !!text) this.drawActs(li, m);
  };

  /* EDITED, after the time on the message's line, with the time of the
     latest edit. The words it replaced are not kept anywhere, so there is
     nothing more to show. */
  Radio.prototype.markEdited = function (li, m) {
    var head = li.querySelector(':scope > .cb-head');
    var mark = head && head.querySelector(':scope > .cb-edited');
    li.dataset.edited = m.edited ? String(m.edited) : '';
    if (!m.edited) { if (mark) mark.remove(); return; }
    if (!mark) {
      mark = el('time', 'cb-edited');
      head.appendChild(mark);
    }
    mark.textContent = 'edited ' + clock(m.edited);
    mark.dateTime = new Date(m.edited).toISOString();
  };

  /* MORE, the three dots: Copy, Read aloud, Edit and Take off, folded under
     the message's line. A disclosure and not an ARIA menu: a row of ordinary buttons straight
     under the line, ready from the start and hidden, so opening it adds
     nothing to the log's live region, and the keyboard reaches them with Tab
     like everything else on the radio. Escape folds it and puts the keyboard
     back on the dots. Where the browser has a voice, every message has Read
     aloud; where it has none, a message with nothing in it to copy and
     nothing of yours to take off has no dots at all. */
  Radio.prototype.moreFor = function (m, li) {
    var me = this, items = [];
    if (m.text) items.push(this.copyBtn(m, li));
    if (VOICE) items.push(this.readBtn(m, li));
    /* EDIT is on your own messages, and only yours, even for the base (Ryan,
       2026-10-18): which are yours to edit is canEdit's rule in lib.mjs,
       asked again by the server. */
    if (this.mayEdit(m)) {
      var ed = el('button', 'cb-btn cb-edit-btn', 'Edit');
      ed.type = 'button';
      ed.setAttribute('aria-label', 'Edit your message ' + sentAt(m.t));
      ed.addEventListener('click', function () { me.editStart(m.id); });
      items.push(ed);
    }
    /* TAKE TO THE FORUMS, for a claimed username, on a message with words in
       it, anywhere but a room that keeps to itself (the server refuses that
       too). It only ticks; the server copies the messages off the channel. */
    if (m.text && forumPass(this.state.pass) && !(offList() && this.tunedRoom())) items.push(this.forumBtn(m));
    /* TAKE OFF is on every message for the base, and on your own for
       everybody (Ryan, 2026-10-08). Which are yours is canTakeOff's rule in
       lib.mjs, asked again by the server: this only decides where the button
       is drawn. */
    var yours = this.mine(m);
    if (this.state.base || yours) {
      var off = el('button', 'cb-btn cb-take', 'Take off');
      off.type = 'button';
      off.setAttribute('aria-label', yours
        ? 'Take your message ' + sentAt(m.t) + ' off the air'
        : 'Take ' + m.handle + '\u2019s message ' + sentAt(m.t) + ' off the air');
      off.addEventListener('click', function () { me.moderate({ remove: m.id }, yours); });
      items.push(off);
    }
    if (!items.length) return null;
    return this.moreMenu(m, li, items);
  };

  /* THE THREE DOTS AND WHAT THEY OPEN, for the channel's messages and a
     conversation's alike (Ryan's ask, 2026-10-20: messages should have the
     same interface), each with its own items. */
  Radio.prototype.moreMenu = function (m, li, items) {
    var box = el('div', 'cb-more-menu');
    box.id = 'cb-more-' + m.id;
    box.hidden = true;
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', 'More for ' + m.handle + '\u2019s message');
    box.setAttribute('aria-live', 'off');
    items.forEach(function (x) { box.appendChild(x); });
    var b = el('button', 'cb-btn cb-ico cb-more');
    b.type = 'button';
    b.appendChild(msgIcon('more'));
    b.setAttribute('aria-expanded', 'false');
    b.setAttribute('aria-controls', box.id);
    b.setAttribute('aria-label', 'More for ' + m.handle + '\u2019s message ' + sentAt(m.t) + ': ' +
      items.map(function (x) { return x.textContent; }).join(', '));
    function shut(back) {
      box.hidden = true;
      b.setAttribute('aria-expanded', 'false');
      if (back) b.focus();
    }
    b.addEventListener('click', function () {
      if (!box.hidden) { shut(); return; }
      shutPick(li);
      box.hidden = false;
      b.setAttribute('aria-expanded', 'true');
      box.querySelector('button').focus();
    });
    box.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); shut(true); }
    });
    b.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !box.hidden) { e.preventDefault(); shut(); }
    });
    return { btn: b, box: box };
  };

  /* One thing open under a message at a time: the reactions or More. */
  function shutPick(li) {
    var pick = li.querySelector(':scope > .cb-rx-pick');
    if (!pick) return;
    pick.remove();
    var rb = li.querySelector(':scope > .cb-acts > .cb-react');
    if (rb) rb.setAttribute('aria-expanded', 'false');
  }
  function shutMore(li) {
    var box = li.querySelector(':scope > .cb-more-menu');
    if (!box || box.hidden) return;
    box.hidden = true;
    var mb = li.querySelector(':scope > .cb-acts > .cb-more');
    if (mb) mb.setAttribute('aria-expanded', 'false');
  }

  /* TAKE TO THE FORUMS: a box under the readout listing what is on the channel
     now, this message ticked, to start a forum topic with. Starting it opens
     the forums with the ticked messages' ids in the address, after a #, which
     never reaches a server; the forums ask ours to copy them off the channel
     when the topic is posted, so nobody can type words into anybody else's
     mouth. The radio itself sends nothing for it. */
  Radio.prototype.forumBtn = function (m) {
    var me = this, b = el('button', 'cb-btn cb-forum', 'Take to the forums');
    b.type = 'button';
    b.setAttribute('aria-label', 'Take ' + m.handle + '\u2019s message ' + sentAt(m.t) + ', and others, to a new forum topic');
    b.addEventListener('click', function () { me.pickForForum(m.id); });
    return b;
  };
  Radio.prototype.pickForForum = function (first) {
    var me = this;
    if (this.forumPick) this.forumPick.remove();
    var box = this.forumPick = el('div', 'cb-forum-pick');
    box.setAttribute('role', 'group');
    box.setAttribute('aria-labelledby', 'cb-forum-pick-h');
    var h = el('p', 'cb-h3', 'Take to the forums');
    h.id = 'cb-forum-pick-h';
    box.appendChild(h);
    box.appendChild(el('p', 'cb-quiet', 'Tick the messages to start a forum topic with. They go in exactly as they are on the channel, handles and times and all, edited marks too, and whoever sent one can take it out again. Pictures and stickers stay behind. Ask everybody in the conversation first, as you would before a screenshot.'));
    var list = el('ul', 'cb-forum-pick__list');
    (this.aired || []).forEach(function (m) {
      if (!m.text) return;
      var li = el('li');
      var lab = el('label', 'cb-forum-pick__row');
      var tick = el('input');
      tick.type = 'checkbox';
      tick.value = m.id;
      tick.checked = m.id === first;
      var words = m.text.replace(/\s+/g, ' ');
      lab.appendChild(tick);
      lab.appendChild(document.createTextNode(' ' + m.handle + ', ' + clock(m.t) + ': ' + (words.length > 70 ? words.slice(0, 69) + '\u2026' : words)));
      li.appendChild(lab);
      list.appendChild(li);
    });
    box.appendChild(list);
    var row = el('div', 'cb-band');
    var go = el('button', 'cb-btn', 'Start a topic with these');
    go.type = 'button';
    var no = el('button', 'cb-btn', 'Cancel');
    no.type = 'button';
    go.addEventListener('click', function () {
      var ids = Array.prototype.map.call(list.querySelectorAll('input:checked'), function (x) { return x.value; });
      if (!ids.length) { me.tell('Tick at least one message first.'); return; }
      box.remove();
      me.forumPick = null;
      me.tabTold(goPage('/forum.html#/new?from=' + encodeURIComponent(me.tunedRoom() || 'world') + '&ids=' + encodeURIComponent(ids.join(','))), null);
    });
    no.addEventListener('click', function () { box.remove(); me.forumPick = null; me.tell(''); });
    box.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); no.click(); } });
    row.appendChild(go);
    row.appendChild(no);
    box.appendChild(row);
    this.lcdBox.parentNode.insertBefore(box, this.lcdBox.nextSibling);
    var on = list.querySelector('input:checked') || list.querySelector('input');
    if (on) on.focus();
  };

  /* COPY, on every message with words in it: the words as they were typed,
     Markdown and all, onto your own clipboard. The answer is on the button and
     on the radio's own line under the log, so it is seen where the hand is. */
  // `say` is where it answers: the channel's line, or a conversation's.
  Radio.prototype.copyBtn = function (m, li, say) {
    var me = this, b = el('button', 'cb-btn cb-copy', 'Copy');
    var tellIt = say || function (t) { me.tell(t); };
    b.type = 'button';
    b.setAttribute('aria-label', 'Copy ' + m.handle + '’s message ' + sentAt(m.t));
    b.addEventListener('click', function () {
      var done = function () {
        b.textContent = 'Copied';
        tellIt('Copied ' + m.handle + '’s message.');
        setTimeout(function () { b.textContent = 'Copy'; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        // The words on the message now, which an edit may have changed.
        var said = li && li.querySelector(':scope > .cb-text');
        navigator.clipboard.writeText(said ? said.cbRaw : m.text).then(done, function () { tellIt('Your browser would not let the radio copy that.'); });
      } else tellIt('Your browser would not let the radio copy that.');
    });
    return b;
  };

  /* A picture in the log. It has no public address, so it is fetched with the
     pass, once, and shown from memory until its message goes. `from` is where
     it is fetched: the channel's, or a conversation's under Messages. */
  Radio.prototype.picture_ = function (m, from) {
    var me = this, fig = el('figure', 'cb-picture');
    var img = el('img', 'cb-picture-img');
    img.alt = m.alt || (m.handle + ' sent a picture, with no description.');
    img.dataset.pic = m.img;
    img.decoding = 'async';
    /* THE PICTURE IS A BUTTON THAT OPENS IT LARGE, and under it is a way to
       keep it. Both use the copy already in memory, so neither fetches
       anything; the file you keep is the redrawn one, with nothing of the
       camera's in it. */
    var open = el('button', 'cb-picture-open');
    open.type = 'button';
    open.setAttribute('aria-label', 'Open the picture larger. ' + img.alt);
    img.alt = '';
    open.appendChild(img);
    open.addEventListener('click', function () { me.lightbox(m, open); });
    fig.appendChild(open);
    var under = el('p', 'cb-picture-under');
    // The description is shown for eyes and said once, in the button's name:
    // the line is aria-hidden so a screen reader does not hear it twice.
    if (m.alt) { var cap = el('span', 'cb-picture-alt', m.alt); cap.setAttribute('aria-hidden', 'true'); under.appendChild(cap); }
    var keep = el('a', 'cb-picture-dl', 'Download');
    keep.setAttribute('aria-label', 'Download ' + m.handle + '’s picture');
    keep.hidden = true;
    under.appendChild(keep);
    fig.appendChild(under);
    this.pics = this.pics || {};
    function ready(url) {
      img.src = url;
      keep.href = url;
      keep.download = pictureName(m);
      keep.hidden = false;
    }
    if (this.pics[m.img]) { ready(this.pics[m.img]); return fig; }
    fetch((from || '/cb/image?id=') + encodeURIComponent(m.img), {
      headers: { 'authorization': 'Bearer ' + this.state.pass }, credentials: 'omit', cache: 'no-store',
    }).then(function (r) { return r.ok ? r.blob() : null; }).then(function (b) {
      if (!b) { fig.replaceChild(el('p', 'cb-picture-gone', 'That picture has gone with its message.'), open); keep.remove(); return; }
      var url = URL.createObjectURL(b);
      me.pics[m.img] = url;
      ready(url);
    }).catch(function () { fig.replaceChild(el('p', 'cb-picture-gone', 'No signal: the picture did not come through.'), open); keep.remove(); });
    return fig;
  };

  /* THE LIGHTBOX: a picture from the channel, as large as the window allows,
     with its description, a way to keep it, and a way out. A <dialog> opened
     modally, so it sits over the page, keeps the keyboard inside it, and closes
     on Escape; Close, or a press outside the picture, closes it too, and the
     keyboard goes back to the picture it was opened from. Nothing in it moves
     at any setting. */
  Radio.prototype.lightbox = function (m, from) {
    var me = this, url = this.pics && this.pics[m.img];
    if (!url) return;
    var d = this.lboxMake();
    this.lboxImg.hidden = false;
    this.lboxArt.hidden = true;
    this.lboxArt.textContent = '';
    this.lboxDl.hidden = false;
    var said = m.alt || (m.handle + ' sent a picture, with no description.');
    d.setAttribute('aria-label', m.handle + '’s picture');
    this.lboxImg.src = url;
    this.lboxImg.alt = said;
    this.lboxCap.textContent = m.alt ? m.alt : '';
    this.lboxCap.hidden = !m.alt;
    if (m.alt) this.lboxCap.setAttribute('aria-hidden', 'true');
    this.lboxDl.href = url;
    this.lboxDl.download = pictureName(m);
    this.lboxShow(from, m.img);
  };

  /* AN AVATAR IN THE LIGHTBOX, as large as the window allows, drawn fresh by
     avatar.js on its own ground. It is a drawing and not a file, so there is
     nothing to download; its name and what its owner wrote are the caption,
     which is what a screen reader hears, and the drawing itself is silent. */
  Radio.prototype.avatarBox = function (a, from, whose) {
    var d = this.lboxMake();
    this.lboxImg.hidden = true;
    this.lboxImg.removeAttribute('src');
    this.lboxDl.hidden = true;
    this.lboxArt.textContent = '';
    var art = window.loveAvatar && window.loveAvatar.draw(a.look, { ground: true, cls: 'cb-lightbox-svg' });
    if (art) this.lboxArt.appendChild(art);
    this.lboxArt.hidden = false;
    d.setAttribute('aria-label', whose + '’s avatar');
    var words = (a.worn ? 'Wearing on the CB. ' : '') + (a.name ? a.name + (a.about ? ': ' : '.') : '') + (a.about || (a.name ? '' : 'Nothing is written about it.'));
    this.lboxCap.textContent = words;
    this.lboxCap.hidden = false;
    this.lboxCap.removeAttribute('aria-hidden');
    this.lboxShow(from, null);
  };

  Radio.prototype.lboxShow = function (from, id) {
    var d = this.lbox;
    this.lboxFrom = from;
    this.lboxId = id;
    // The dialog gives the keyboard back to whatever had it when it opened,
    // and Safari does not focus a button on a click, so the picture takes it
    // first: closing always comes back to the picture.
    if (from && from.focus) from.focus({ preventScroll: true });
    if (!d.open) d.showModal();
    this.lboxShut.focus();
  };

  Radio.prototype.lboxMake = function () {
    var me = this, d = this.lbox;
    if (!d) {
      d = this.lbox = el('dialog', 'cb-lightbox');
      var art = this.lboxArt = el('div', 'cb-lightbox-art');
      art.hidden = true;
      var big = this.lboxImg = el('img', 'cb-lightbox-img');
      var cap = this.lboxCap = el('p', 'cb-lightbox-cap');
      var bar = el('div', 'cb-lightbox-bar');
      var dl = this.lboxDl = el('a', 'cb-btn cb-lightbox-dl', 'Download');
      var shut = this.lboxShut = el('button', 'cb-btn cb-lightbox-close', 'Close');
      shut.type = 'button';
      shut.addEventListener('click', function () { d.close(); });
      d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
      d.addEventListener('close', function () {
        var back = me.lboxFrom;
        me.lboxFrom = null; me.lboxId = null;
        if (back && back.isConnected) back.focus();
      });
      bar.appendChild(dl);
      bar.appendChild(shut);
      d.appendChild(art);
      d.appendChild(big);
      d.appendChild(cap);
      d.appendChild(bar);
      this.host.shadowRoot.appendChild(d);
    }
    return d;
  };

  /* The room list, fetched from this site once, and only while the radio is
     on: by the first listen, or by opening the teleporter, whichever is first.
     With a claimed username, the rooms of the forums' categories it may read
     come with it, asked once of /cb/rooms. */
  Radio.prototype.loadRooms = function () {
    var me = this;
    if (this.askedRooms) return;
    this.askedRooms = true;
    if (forumPass(this.state.pass)) {
      this.forumReady = call('/cb/rooms', null, this.state.pass).then(function (r) {
        if (r.status !== 200 || !r.body || !Array.isArray(r.body.rooms)) return;
        takeForumRooms(r.body.rooms);
        if (!rooms) return;
        me.rerender(); me.bandShown();
        if (!me.tpPanel.hidden) me.tpRender();
        if (!me.online.hidden) me.onlineShown();
      }, function () { /* the categories' rooms stay unnamed, as a #word is */ });
    }
    this.roomsReady = fetch('/cb-rooms.json', { credentials: 'omit', headers: { 'accept': 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (d) { takeRooms(d.rooms); me.rerender(); me.complete(); me.bandShown(); }
        if (!me.tpPanel.hidden) me.tpRender();
        if (!me.online.hidden) me.onlineShown();
      })
      .catch(function () {
        // #tags stay words, which is what they are, and the teleporter says so.
        rooms = rooms || [];
        if (!me.tpPanel.hidden) me.tpRender(true);
        if (!me.online.hidden) me.onlineShown();
      });
  };

  /* Once the rooms arrive, the messages already on the screen get their #tags. */
  Radio.prototype.rerender = function () {
    var ps = this.log.querySelectorAll('.cb-text');
    for (var i = 0; i < ps.length; i++) {
      if (typeof ps[i].cbRaw !== 'string') continue;
      ps[i].textContent = '';
      md(ps[i], ps[i].cbRaw);
      this.markAt(ps[i], ps[i].cbAt, ps[i].cbRoles);
    }
  };

  /* AN @MENTION IS DRAWN AS THE NAME IT IS (Ryan's ask, 2026-10-19): a button
     that opens that person's profile, as their handle on the channel does. Only
     the handles the server kept with the message (channelMentions in
     netlify/cb/lib.mjs) and your own, matched as the server's mentions()
     matches, so an @ followed by nobody stays words. Yours is filled, the BASE
     tag's pair the other way round, so you can see where you were named; it
     neither moves nor lights up when it lands, the radio's rule. Not inside a
     link, code or another button.

     A ROLE IT CALLS (Ryan's ask, 2026-10-23: @moderator, @director, @board
     and @administrator) is drawn as words in a mention's ink with nothing to
     press, because there is no profile behind a role and nobody is told who
     holds one: only the roles the server kept with the message (roles,
     roleMentions in netlify/cb/lib.mjs), so a role's word somebody may not
     call stays words. One you hold is filled, as your name is. */
  Radio.prototype.markAt = function (into, handles, roles) {
    var me = this, list = [];
    var called = (roles || []).filter(function (r) { return ROLE_SAYS[r]; });
    (handles || []).concat(this.state.handle).forEach(function (h) {
      if (typeof h === 'string' && h.trim() && !ROLE_SAYS[fold(h)] && list.every(function (x) { return fold(x) !== fold(h); })) list.push(h);
    });
    list = list.concat(called);
    list.sort(function (a, b) { return b.length - a.length; });
    var escd = list.map(function (h) { return h.normalize('NFKC').trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+'); });
    var re;
    try { re = new RegExp('(^|[^\\p{L}\\p{N}_@])@(' + escd.join('|') + ')(?![\\p{L}\\p{N}_]|:\\d)', 'giu'); } catch (e) { return; }
    var texts = [];
    var walk = document.createTreeWalker(into, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) { return n.parentNode && n.parentNode.closest('a, code, pre, button') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; },
    });
    while (walk.nextNode()) texts.push(walk.currentNode);
    texts.forEach(function (n) {
      var text = n.nodeValue, last = 0, m, frag = null;
      re.lastIndex = 0;
      while ((m = re.exec(text))) {
        frag = frag || document.createDocumentFragment();
        var at = m.index + m[1].length;
        frag.appendChild(document.createTextNode(text.slice(last, at)));
        var named = m[2].replace(/\s+/g, ' ');
        if (called.indexOf(fold(named)) >= 0) {
          var held = (me.state.roles || []).indexOf(fold(named)) >= 0;
          var r = el('span', 'cb-at cb-at--role' + (held ? ' cb-at--me' : ''), '@' + m[2]);
          if (held) r.appendChild(el('span', 'sr', ', a role you hold'));
          frag.appendChild(r);
          last = at + 1 + m[2].length;
          continue;
        }
        var h = list.filter(function (x) { return fold(x) === fold(named); })[0] || named;
        var mine = fold(h) === fold(me.state.handle);
        var b = el('button', 'cb-at' + (mine ? ' cb-at--me' : ''), '@' + m[2]);
        b.type = 'button';
        b.setAttribute('aria-haspopup', 'dialog');
        b.setAttribute('aria-label', mine ? '@' + h + ', you. Opens your profile.' : '@' + h + '. Opens their profile.');
        (function (who, btn) { btn.addEventListener('click', function () { me.peek(who, btn, null); }); })(h, b);
        frag.appendChild(b);
        last = at + 1 + m[2].length;
      }
      if (frag) { frag.appendChild(document.createTextNode(text.slice(last))); n.parentNode.replaceChild(frag, n); }
    });
  };

  /* The # or @ being typed at the caret, if any: which, where it starts and
     what follows. A # is a room. An @ is a person, with up to three words
     after it, because a handle can have spaces in it; never a place in a film
     (@34:12), which is digits, and never the middle of an address
     (ada@example.org), which has a letter before it. */
  Radio.prototype.token = function () {
    var v = this.say.value, c = this.say.selectionStart;
    if (c == null || c !== this.say.selectionEnd) return null;
    var before = v.slice(0, c);
    var m = before.match(/(^|[\s(\[])#([a-z][a-z0-9-]*)$/i);
    if (m) return { kind: 'room', start: c - m[2].length - 1, end: c, q: m[2].toLowerCase() };
    m = before.match(/(^|[^\p{L}\p{N}_@.\/])@([^\s@][^\n@]{0,23})$/u) || before.match(/(^|[^\p{L}\p{N}_@.\/])@()$/u);
    if (!m || (m[2].match(/ /g) || []).length > 3 || / {2}$/.test(m[2]) || /^\d{1,3}(?::\d{0,2}){0,2}$/.test(m[2])) return null;
    return { kind: 'person', start: c - m[2].length - 1, end: c, q: fold(m[2]), done: / $/.test(m[2]) };
  };

  /* WHO THE @ LIST OFFERS (Ryan's ask, 2026-10-19): everybody who has said
     something on this channel, everybody those messages @mention, and
     everybody on Who's online, which is asked for once, the first time an @
     is typed, as the teleporter's @ asks. Never you. Alphabetical, the way
     Who's online lists people, so nobody is put first, and nothing is counted. */
  Radio.prototype.atPeople = function () {
    var me = this, out = [];
    function add(h) { if (h && fold(h) !== fold(me.state.handle) && out.every(function (x) { return fold(x) !== fold(h); })) out.push(h); }
    // A room's feed bot is nobody to @mention.
    (this.aired || []).forEach(function (m) { if (!m.feed) add(m.handle); (m.at || []).forEach(add); });
    (this.people || []).forEach(function (p) { add(p.handle); });
    (this.atPicked || []).forEach(add);
    return out.sort(function (a, b) { return fold(a).localeCompare(fold(b)); });
  };

  Radio.prototype.peopleFor = function (t) {
    if (!this.people && !this.atAsked) { this.atAsked = true; this.atWants = true; this.onlineTick(); }
    var q = t.q, all = this.atPeople().filter(function (h) { return !ROLE_SAYS[fold(h)]; });
    var roles = (this.mayRoles || []).filter(function (r) { return !q || r.indexOf(q) === 0; });
    // A name already typed out in full, and a space after it, is finished.
    if (t.done && (all.some(function (h) { return fold(h) === q; }) || ROLE_SAYS[q])) return [];
    // The roles this pass may call come first, being few, and each says it is a role.
    return roles.map(function (r) { return ROLE_OPT[r]; }).concat(all.filter(function (h) {
      var f = fold(h);
      return !q || f.indexOf(q) === 0 || f.split(' ').some(function (w) { return w.indexOf(q) === 0; });
    })).slice(0, PICK);
  };

  // Everybody the words might @mention, for the server to check against them
  // (channelMentions in netlify/cb/lib.mjs keeps only the ones they name).
  Radio.prototype.mentioned = function (text, more) {
    var v = String(text || '').toLowerCase();
    return (this.atPicked || []).concat(more || [], this.atPeople()).filter(function (h, i, all) {
      return v.indexOf('@' + h.toLowerCase()) >= 0 && all.indexOf(h) === i;
    }).slice(0, 40);
  };

  Radio.prototype.complete = function () {
    var t = this.say.getRootNode().activeElement === this.say && this.token();
    if (t && t.kind === 'room' && !rooms) t = null;
    if (!t || t.start === this.dismissed) { if (!t) this.dismissed = -1; this.close(); return; }
    var person = t.kind === 'person';
    var offer = person ? this.peopleFor(t) : roomsFor(t.q);
    if (!offer.length) { this.close(); return; }
    var keep = this.active >= 0 && this.offer[this.active] && offer.indexOf(this.offer[this.active]);
    this.offer = offer;
    this.offerKind = t.kind;
    this.pick.textContent = '';
    this.pick.setAttribute('aria-label', person ? (offer[0] && offer[0].role ? 'Roles and people to mention' : 'People to mention') : 'Rooms on the street');
    for (var i = 0; i < offer.length; i++) {
      var li = el('li', 'cb-opt');
      li.setAttribute('role', 'option');
      if (person && offer[i].role) {
        li.id = 'cb-pick-at-' + i;
        li.appendChild(el('span', 'cb-opt__name', '@' + offer[i].role));
        li.appendChild(el('span', 'cb-opt__tag', ROLE_SAYS[offer[i].role]));
      } else if (person) {
        li.id = 'cb-pick-at-' + i;
        li.appendChild(el('span', 'cb-opt__name', offer[i]));
      } else {
        li.id = 'cb-pick-' + offer[i].tag;
        li.appendChild(el('span', 'cb-opt__name', offer[i].name));
        li.appendChild(el('span', 'cb-opt__tag', '#' + offer[i].tag));
      }
      li.addEventListener('mousedown', function (e) { e.preventDefault(); });
      (function (n, me) { li.addEventListener('click', function () { me.choose(n); }); })(i, this);
      this.pick.appendChild(li);
    }
    this.pick.hidden = false;
    this.say.setAttribute('aria-expanded', 'true');
    this.mark(typeof keep === 'number' && keep >= 0 ? keep : 0);
  };

  // Highlight option n in a listbox and point its combobox at it.
  function markIn(box, input, n) {
    var lis = box.children;
    for (var i = 0; i < lis.length; i++) lis[i].setAttribute('aria-selected', String(i === n));
    if (!lis[n]) { input.removeAttribute('aria-activedescendant'); return; }
    input.setAttribute('aria-activedescendant', lis[n].id);
    var li = lis[n];
    if (li.offsetTop < box.scrollTop) box.scrollTop = li.offsetTop;
    else if (li.offsetTop + li.offsetHeight > box.scrollTop + box.clientHeight)
      box.scrollTop = li.offsetTop + li.offsetHeight - box.clientHeight;
  }

  Radio.prototype.mark = function (n) {
    this.active = n;
    markIn(this.pick, this.say, n);
  };

  /* A ROOM YOU HAVE TO KNOW THE ADDRESS OF KEEPS TO ITSELF. Ryan, 2026-10-07:
     easter egg rooms, listed nowhere, with "all the usual amenities, just kept
     quiet". Such a page says so on its own <body> (data-unlisted) and is not in
     the street's list of rooms, so it is a room by its own word: quietHere()
     below, which needs no list and so cannot wait on one or fall through when
     it fails. It has This room, and the radio opens on it there; Be seen here
     and its call; and hosting, which the server tells only to radios tuned to
     this room (QUIET_ROOMS in netlify/cb/lib.mjs), and which never puts the
     room's name in a message: a spot written here carries no #tag, because a
     #tag is the address, and the address is how you get in. Who's online
     never lists it. */
  function offList() {
    var d = streetDoc();
    return !!(d && d.body && d.body.hasAttribute('data-unlisted'));
  }

  // The room an unlisted page is, out of its own address and its own title.
  function quietHere() {
    var tag = herePath().replace(/^\//, '').replace(/\.html$/, '');
    var d = streetDoc();
    var name = (d ? d.title : '').replace(/\s+\u2014\s+Stimpunks\.World$/, '');
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tag) ? { tag: tag, name: name, path: herePath(), quiet: true } : null;
  }

  /* IN THE FORUMS, THE CATEGORY BEING READ. forum.js says which on the page's
     own <body>, data-forum-room and data-forum-room-name, for a category's
     page, a topic in it and a new topic started in it, and takes them off
     again on the forums' home, Latest, Mentions and Search, which are The
     forums' own room. Only a category the forums sent this reader is ever
     written there, and the server asks the category's roles again for
     everything the radio does in its room. */
  function forumHere() {
    var d = streetDoc();
    if (!d || !d.body || herePath() !== '/' + FORUM_PAGE + '.html') return null;
    var tag = d.body.getAttribute('data-forum-room');
    if (!tag || !FORUMTAG.test(tag)) return null;
    return byTag[tag] || { tag: tag, name: d.body.getAttribute('data-forum-room-name') || 'The forums: a category',
      path: '/' + FORUM_PAGE + '.html#/c/' + tag.slice(FORUM_ROOM.length), forum: true };
  }
  function forumHereTag() { var f = forumHere(); return f ? f.tag : ''; }

  // Whether a room on a list is the one this page is in.
  function isHere(r) {
    var h = hereRoom();
    return h ? r.tag === h.tag : r.path === herePath();
  }

  // Where this page is, as the room list writes it, so the list can say so.
  // On the chat page, the channel picked is where the radio is.
  function herePath() {
    if (inChat()) return chatRoom().path;
    var d = streetDoc();
    var p = (d ? d.location : location).pathname.replace(/\/index(?:\.html)?$/, '/');
    return p === '/' ? '/' : p.replace(/\.html$/, '') + '.html';
  }

  /* THE WORLD ROOM (Ryan, 2026-10-18): a room whose own channel is World and
     whose own call is the World call, so there is no second channel or call to
     split people between. Told by its address, so it holds before the list of
     rooms arrives. make-sitemap.py holds the page and this to each other. */
  function worldHere() { return herePath() === '/' + WORLD_CALL + '.html'; }

  /* ── The chat page's channels ─────────────────────────────────────────── */

  /* The channel picked on the chat page (inChat), World until another is.
     The address says which, after the #, and nothing else keeps it. */
  var chatTag = WORLD_CALL, chatSpecs = null;
  var CHAT_PAGE = 'chat';   // the chat page's own name, which is no channel on itself (make-chat.py)
  var CHAT_WIDE = window.matchMedia ? window.matchMedia('(min-width: 1000px)') : null;

  function chatRoom() {
    if (chatTag !== WORLD_CALL && byTag[chatTag]) return byTag[chatTag];
    return byTag[WORLD_CALL] || { tag: WORLD_CALL, name: 'World', path: '/' + WORLD_CALL + '.html' };
  }

  /* The groups make-chat.py wrote on the chat page: Community's rooms, World
     first, in its order; Staff's, each with the roles that open it, as its
     Town Hall page carries them; and every other room by its tags, out of
     data/room-tags.json, each tag with its name and its rooms in walking
     order. Read once. */
  function chatSpec() {
    if (chatSpecs) return chatSpecs;
    var g = null, dock = chatDock();
    try { g = JSON.parse((dock && dock.getAttribute('data-chat-groups')) || 'null'); } catch (e) { g = null; }
    chatSpecs = {
      community: g && Array.isArray(g.community) ? g.community.filter(function (t) { return typeof t === 'string'; }) : [WORLD_CALL],
      staff: g && Array.isArray(g.staff) ? g.staff.filter(function (x) { return x && typeof x.tag === 'string' && Array.isArray(x.roles); }) : [],
      tagged: g && Array.isArray(g.tagged) ? g.tagged.filter(function (x) {
        return x && typeof x.key === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(x.key) && typeof x.name === 'string' && Array.isArray(x.rooms);
      }) : []
    };
    return chatSpecs;
  }

  // A Town Hall room this pass may listen in: the page keeping quiet, as
  // mayHere does, while the server refuses its channel to anybody else.
  function mayStaff(s, x) {
    var roles = (s && s.roles) || [];
    var key = !x.strict && roles.indexOf('administrator') >= 0;
    return !!(s && s.base) && (key || x.roles.some(function (r) { return roles.indexOf(r) >= 0; }));
  }

  /* THE GROUPS, Ryan's: Community is World, the Community Center, Dead Tired
     Society, Community Care, Show Your Work and Cavendish Coworking's rooms;
     Staff is the Town Hall's private rooms and the forums' locked categories,
     each only for a pass that can go in (the server named the categories to
     their readers only); and every room but Staff's and World is under each
     of its tags (Ryan's asks, 2026-10-24), Community's too, in walking order,
     a tag's group in the order data/room-tags.json lists them, with the
     forums' other categories after The forums, as everywhere on the radio. So
     a room can be in more than one group, and its link is in each. A staff
     room is never under a tag, so it is only ever listed for a pass that can
     go in. More rooms holds anything the page did
     not tag, which make-chat.py refuses at the build, so it is only ever a
     page older than the street's list. Never a room that keeps to itself,
     which the street's list does not name; never this page, which is no
     channel; and the World room once, as World, whose channel it is. */
  function chatChannels(s) {
    var spec = chatSpec(), taken = {}, staffed = {}, community = [], staff = [], tagged = [], seen = {}, cats = [], more = [];
    taken[CHAT_PAGE] = staffed[CHAT_PAGE] = staffed[WORLD_CALL] = true;
    spec.community.forEach(function (t) {
      taken[t] = true;
      if (t === WORLD_CALL) community.push(byTag[WORLD_CALL] || { tag: WORLD_CALL, name: 'World', path: '/' + WORLD_CALL + '.html' });
      else if (byTag[t]) community.push(byTag[t]);
    });
    spec.staff.forEach(function (x) {
      taken[x.tag] = staffed[x.tag] = true;
      if (byTag[x.tag] && mayStaff(s, x)) staff.push(byTag[x.tag]);
    });
    (rooms || []).forEach(function (r) {
      if (r.forum && r.locked) { taken[r.tag] = true; staff.push(r); }
      else if (r.forum) cats.push(r);
    });
    spec.tagged.forEach(function (g) {
      var list = [];
      g.rooms.forEach(function (t) {
        var r = byTag[t];
        if (!r || staffed[t] || r.quiet || r.forum) return;
        list.push(r);
        seen[t] = true;
        if (t === FORUM_PAGE) cats.forEach(function (c) { list.push(c); seen[c.tag] = true; });
      });
      tagged.push({ key: 'tag-' + g.key, name: g.name, rooms: list });
    });
    (rooms || []).forEach(function (r) { if (!taken[r.tag] && !seen[r.tag] && !r.quiet) more.push(r); });
    var dms = [];
    if (radio && radio.dmBox) {
      dms.push({ dm: '', name: 'All messages' });
      var b = radio.dmInboxBody, convs = b && Array.isArray(b.conversations) ? b.conversations : [];
      convs.forEach(function (c) { if (c && typeof c.handle === 'string') dms.push({ dm: c.handle, name: c.handle, asking: c.state === 'asking' }); });
    }
    return [
      { key: 'community', name: 'Community', rooms: community },
      { key: 'dm', name: 'Direct messages', rooms: dms },
      { key: 'staff', name: 'Staff', rooms: staff }
    ].concat(tagged, [{ key: 'more', name: 'More rooms', rooms: more }]).filter(function (g) { return g.rooms.length; });
  }

  // On the chat page, a link to a room that is a channel there is a link to
  // the channel; anywhere else, and for anything that is not, null.
  function chatHref(room) {
    return room && inChat() && radio && radio.chatHas(room.tag) ? '#' + room.tag : null;
  }

  // The tag the address names, if it is shaped like one.
  function chatFromHash() {
    var t = '';
    try { t = decodeURIComponent(location.hash.slice(1)); } catch (e) { t = ''; }
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(t) ? t : '';
  }

  // Going to a channel is going to its address, so Back comes back.
  function chatGo(tag) {
    if (location.hash.slice(1) === tag) { chatTake(); return; }
    location.hash = tag;
  }

  /* The address has changed, or the lists have arrived: the channel it names,
     if this pass can hear it. A # that names nothing (the page's own #top
     and #main) leaves the channel where it is; no # at all is World, where
     the page starts. */
  function chatTake(first) {
    if (!radio || !radio.chatSure) return false;
    var evAt = evFromHash();
    if (evAt !== null && radio.evSec) { radio.chatViewEvents(evAt); return false; }
    var t = chatFromHash(), said = '';
    if (!t) t = WORLD_CALL;
    else if (!radio.chatHas(t)) {
      if (!first) return false;
      if (byTag[t] || FORUMTAG.test(t)) {
        said = 'That channel is not one you can listen to here, so the chat is on World.';
        // The address says World too, rather than naming a channel it is not on.
        try { history.replaceState(history.state, '', location.pathname + location.search); } catch (e) { /* it says what it says */ }
      }
      t = WORLD_CALL;
    }
    if (!first && radio.chatView !== 'channel') radio.chatViewChannel();
    if (t === chatTag && !first) return false;
    chatTag = t;
    var moved = radio.wasPath !== undefined ? radio.whereNow() : (radio.bandShown(), false);
    if (said) radio.tell(said);
    return moved;
  }

  /* THE CHANNEL LIST, the left of the chat page: a box to find a channel by
     its name or what its room is about (the teleporter's search, findRooms),
     and the groups, each folding under a button, each channel a link to its
     address. One channel at a time is in the Tab order, the one picked, and
     the arrow keys move between them, so the list is one stop on the way to
     the message box rather than a hundred. What is new in a channel since you
     last read it is marked as everywhere on the radio, a dot and the words,
     never a number. On a narrow screen the list folds under one button that
     names the channel picked, and picking one folds it again. */
  Radio.prototype.chatMake = function (sec, chanSec, dmSec) {
    var me = this;
    this.chatSec = sec;
    /* MESSAGES IN THE MIDDLE (Ryan's ask, 2026-10-22, so a conversation gets
       the room a channel has): on the chat page your conversations are listed
       with the channels, and the one picked takes the channel's place in the
       middle. The Messages part stands there, after the channel, shown only
       while a conversation or All messages is picked, and the right-hand
       column has no Messages of its own. See chatViewDm. */
    this.chatChan = chanSec;
    this.chatView = 'channel';
    if (dmSec && this.dmBox) { chanSec.parentNode.insertBefore(dmSec, chanSec.nextSibling); dmSec.hidden = true; }
    /* EVENTS IN THE MIDDLE TOO (2026-10-23): Events, at the top of the
       channels, puts the list of events where the channel was, as tall as the
       column, with its address #events, and an event's #events/<id>. */
    if (this.evSec) { chanSec.parentNode.insertBefore(this.evSec, chanSec.nextSibling); this.evSec.hidden = true; }
    this.chatFolded = {};
    this.chatLinks = [];
    var t = this.chatToggle = el('button', 'cb-btn cb-chans-toggle');
    t.type = 'button';
    t.setAttribute('aria-expanded', 'false');
    t.setAttribute('aria-controls', 'cb-chans-body');
    sec.appendChild(t);
    var body = el('div', 'cb-chans-body');
    body.id = 'cb-chans-body';
    var lab = el('label', 'cb-lab', 'Find a channel');
    lab.htmlFor = 'cb-chans-find';
    var find = this.chatFind = el('input', 'cb-say cb-chans-find');
    find.id = 'cb-chans-find';
    find.type = 'search';
    find.autocomplete = 'off';
    find.spellcheck = false;
    find.setAttribute('aria-controls', 'cb-chans-groups');
    var groups = this.chatGroupsBox = el('nav', 'cb-chans-groups');
    groups.id = 'cb-chans-groups';
    groups.setAttribute('aria-label', 'Channels');
    groups.appendChild(el('p', 'cb-quiet', 'Finding the channels…'));
    this.chatNone = el('p', 'cb-quiet');
    this.chatNone.hidden = true;
    body.appendChild(lab);
    body.appendChild(find);
    body.appendChild(groups);
    body.appendChild(this.chatNone);
    sec.appendChild(body);
    find.addEventListener('input', function () { me.chatFilter(); });
    find.addEventListener('keydown', function (e) {
      // Down from the box goes into the list, to the first channel it shows.
      if (e.key === 'ArrowDown') { var a = me.chatVisible()[0]; if (a) { e.preventDefault(); a.focus(); } }
    });
    t.addEventListener('click', function () { me.chatOpen(t.getAttribute('aria-expanded') !== 'true'); });
    groups.addEventListener('keydown', function (e) { me.chatKey(e); });
    groups.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('.cb-chan');
      if (!a) return;
      var narrow = !me.chatWide();
      if (narrow) me.chatOpen(false);
      // A conversation, or All messages, which are not in the address.
      if (a.dataset.dm != null) {
        e.preventDefault();
        if (a.dataset.dm) me.dmOpen(a.dataset.dm);
        else { me.chatViewDm(); if (me.dmWith) me.dmShowInbox(); if (me.dmBox.hidden) me.setDm(true); else me.dmTick(); me.chatShown(); var to = me.dmInbox.querySelector('#cb-dm-to'); if (narrow && to) to.focus(); }
        return;
      }
      // The channel the address already names: back to it from a
      // conversation, and otherwise nothing to go to.
      if (a.dataset.tag === chatRoom().tag && me.chatView !== 'events') {
        e.preventDefault();
        if (me.chatView === 'dm') { me.chatViewChannel(); if (narrow) me.chanH.focus(); }
        return;
      }
      // Events, already open: back to the top of the list.
      if (a.dataset.tag === 'events' && evFromHash() === '') { e.preventDefault(); me.chatViewEvents(''); if (narrow) me.evH.focus(); return; }
      if (narrow) me.chatAfterPick = true;
    });
    /* THE CHANNEL'S OWN HEAD, under its name: what its room is about, in the
       room's own words, and the way into the room itself. The name is the
       Channel part's heading, which the keyboard is put on when a pick on a
       narrow screen folds the list away. */
    var h = this.chanH = chanSec.querySelector(':scope > .cb-h');
    h.tabIndex = -1;
    var head = el('div', 'cb-chat-head');
    this.chatAbout = el('p', 'cb-chat-about');
    var go = el('p', 'cb-chat-go');
    this.chatGoLink = el('a');
    go.appendChild(this.chatGoLink);
    head.appendChild(this.chatAbout);
    head.appendChild(go);
    h.insertAdjacentElement('afterend', head);
    if (CHAT_WIDE && CHAT_WIDE.addEventListener) CHAT_WIDE.addEventListener('change', function () { me.chatOpen(false); });
    this.chatOpen(false);
  };

  Radio.prototype.chatWide = function () { return !CHAT_WIDE || CHAT_WIDE.matches; };

  // The list open or folded under its button, which only a narrow screen shows.
  Radio.prototype.chatOpen = function (open) {
    this.chatSec.classList.toggle('cb-sec--chans-open', !!open);
    this.chatToggle.setAttribute('aria-expanded', String(!!open));
  };

  // Waits for the street's rooms and the forums' categories, then hears the
  // channel the address names.
  Radio.prototype.chatWait = function () {
    var me = this;
    if (this.chatWaiting) return;
    this.chatWaiting = true;
    function settled(p) { return p ? p.then(null, function () {}) : null; }
    Promise.all([settled(this.roomsReady), settled(this.forumReady)]).then(function () {
      if (radio !== me) return;
      me.chatSure = true;
      // The list first, because it is what says which channels there are;
      // then the one the address names, and retuned to it, it is listening.
      me.chatShown();
      var moved = chatTake(true);
      if (!moved) me.tune();
    });
  };

  Radio.prototype.chatHas = function (tag) {
    for (var i = 0; i < this.chatLinks.length; i++) if (this.chatLinks[i].tag === tag && this.chatLinks[i].dm == null && !this.chatLinks[i].ev) return true;
    return false;
  };

  /* A conversation, or All messages, in the middle: the channel steps out of
     the way and the Messages part takes its place. The channel's radio goes
     on listening, as it does with Messages open anywhere, and its messages are
     not counted as read while you are not looking at them (readTick). */
  Radio.prototype.chatViewDm = function () {
    if (!this.dmBox || this.chatView === 'dm') return;
    if (this.chatView === 'events') this.chatLeaveEvents(true);
    this.chatView = 'dm';
    this.chatChan.hidden = true;
    this.dmSec.hidden = false;
    this.chatShown();
  };
  Radio.prototype.chatViewChannel = function () {
    if (this.chatView === 'channel') return;
    if (this.chatView === 'events') this.chatLeaveEvents(false);
    else {
      if (this.dmWith) this.dmShowInbox();
      this.setDm(false);
      this.dmSec.hidden = true;
    }
    this.chatView = 'channel';
    this.chatChan.hidden = false;
    this.chatShown();
  };

  /* EVENTS, in the middle: the channel steps out of the way for the list of
     events, as it does for a conversation, and goes on listening. `id` opens
     the list on that event. */
  Radio.prototype.chatViewEvents = function (id) {
    if (this.chatView === 'dm') {
      if (this.dmWith) this.dmShowInbox();
      this.setDm(false);
      this.dmSec.hidden = true;
    }
    this.chatView = 'events';
    this.chatChan.hidden = true;
    this.evSec.hidden = false;
    this.evFocus = id || '';
    if (!this.evShown()) this.setEvents(true);
    else { this.evKey = null; this.evDraw(); }
    this.chatShown();
  };
  // Out of Events. Into a conversation, the address goes back to the channel,
  // so a reload is not Events again.
  Radio.prototype.chatLeaveEvents = function (toDm) {
    this.setEvents(false);
    this.evSec.hidden = true;
    this.chatView = 'channel';
    if (toDm && evFromHash() !== null) {
      try { history.replaceState(history.state, '', location.pathname + location.search + (chatTag === WORLD_CALL ? '' : '#' + chatTag)); } catch (e) { /* it says what it says */ }
    }
  };

  /* YOUR CONVERSATIONS, for the list: asked from listen() and nowhere else,
     at most every NEWS_EVERY, or sooner when Unreads says somebody new has
     written, and not while Messages is asking for the list itself. */
  Radio.prototype.chatDmTick = function () {
    var me = this;
    if (!this.dmBox || this.chatDmBusy || (!this.dmBox.hidden && !this.dmWith)) return;
    var known = (this.chatDmSeen || []), fresh = (this.news && this.news.dms) || [];
    var due = !this.chatDmAt || Date.now() - this.chatDmAt >= NEWS_EVERY || fresh.some(function (h) { return known.indexOf(fold(h)) < 0; });
    if (!due) return;
    this.chatDmBusy = true;
    call('/cb/dm', { body: {} }, this.state.pass).then(function (r) {
      me.chatDmAt = Date.now();
      if (r.status === 401) return me.lost();
      if (r.status === 200 && r.body && Array.isArray(r.body.conversations)) me.dmDrawInbox(r.body);
    }, function () { me.chatDmAt = Date.now(); }).then(function () { me.chatDmBusy = false; });
  };

  /* Drawn again only when which channels there are changes; the channel
     picked, the marks and the channel's head every time it is asked. */
  Radio.prototype.chatShown = function () {
    if (!this.chatGroupsBox || !this.chatSure) return;
    var groups = chatChannels(this.state);
    var sig = JSON.stringify(groups.map(function (g) { return [g.key, g.rooms.map(function (r) { return r.dm != null ? 'dm|' + r.dm + '|' + !!r.asking : r.tag + '|' + r.name; })]; }));
    if (sig !== this.chatSig) { this.chatSig = sig; this.chatBuild(groups); }
    var room = chatRoom(), tuned = room.tag, n = this.news, focus = null, dmView = this.chatView === 'dm', evView = this.chatView === 'events', with_ = this.dmWith || '';
    var dmsNew = ((n && n.dms) || []).map(fold);
    this.chatDmSeen = this.chatLinks.filter(function (x) { return x.dm; }).map(function (x) { return fold(x.dm); });
    this.chatLinks.forEach(function (x) {
      if (x.ev) {
        if (evView) { x.a.setAttribute('aria-current', 'page'); focus = x.a; } else x.a.removeAttribute('aria-current');
        return;
      }
      var on = x.dm != null ? dmView && fold(x.dm) === fold(with_) : !dmView && !evView && x.tag === tuned;
      if (on) { x.a.setAttribute('aria-current', x.dm != null ? 'true' : 'page'); focus = focus || x.a; } else x.a.removeAttribute('aria-current');
      var t = x.dm == null && n && n.latest && n.latest[x.tag];
      var fresh = x.dm != null ? !!x.dm && !on && dmsNew.indexOf(fold(x.dm)) >= 0 : !on && !!t && t > ((n.read && n.read[x.tag]) || 0);
      if (fresh !== x.a.classList.contains('cb-chan--new')) { markNew(x.a, fresh); x.a.classList.toggle('cb-chan--new', fresh); }
    });
    this.chatRove(focus);
    var world = tuned === WORLD_CALL;
    this.chanH.textContent = '';
    if (!world) { var hash = el('span', 'cb-chan-hash', '#'); hash.setAttribute('aria-hidden', 'true'); this.chanH.appendChild(hash); }
    this.chanH.appendChild(document.createTextNode(world ? 'World' : room.name));
    this.chatAbout.textContent = world
      ? 'The whole street’s channel, heard by everybody tuned to World, whichever room they are in.'
      : room.about || (room.forum ? 'A category in the forums, and its channel.' : '');
    this.chatAbout.hidden = !this.chatAbout.textContent;
    this.chatGoLink.href = room.path;
    this.chatGoLink.textContent = world ? 'Go to the World room' : room.forum ? 'Go to ' + room.name + ' in the forums' : 'Go to ' + room.name;
    this.chatToggle.textContent = 'Channels: ' + (evView ? 'Events' : dmView ? (with_ ? 'messages with ' + with_ : 'All messages') : world ? 'World' : '#' + room.name);
    if (this.chatAfterPick) {
      this.chatAfterPick = false;
      (evView ? this.evH : this.chanH).focus();
    }
  };

  Radio.prototype.chatBuild = function (groups) {
    var me = this, box = this.chatGroupsBox;
    var on = this.box.getRootNode().activeElement, keep = on && on.classList && on.classList.contains('cb-chan') ? on.dataset.tag : null;
    // A room under several tags has a link in each: come back to the same one.
    var keepIn = keep && on.closest('.cb-chan-list') ? on.closest('.cb-chan-list').id : '';
    this.chatDmAll = null;
    box.textContent = '';
    this.chatLinks = [];
    this.chatGroupEls = [];
    /* EVENTS, at the top, as on Discord: no group of its own, and saying
       "on now" while something you can see is. */
    if (this.evSec) {
      var ew = el('div', 'cb-chan-group cb-chan-group--events'), eul = el('ul', 'cb-chan-list'), eli = el('li');
      var ea = el('a', 'cb-chan cb-chan--events');
      ea.href = '#events';
      ea.dataset.tag = 'events';
      ea.tabIndex = -1;
      ea.appendChild(el('span', 'cb-chan-name', 'Events'));
      // A space between, so a screen reader says "Events on now" and not one word.
      ea.appendChild(document.createTextNode(' '));
      var note = this.chatEvNote = el('span', 'cb-chan-note', 'on now');
      note.hidden = true;
      ea.appendChild(note);
      eli.appendChild(ea);
      eul.appendChild(eli);
      ew.appendChild(eul);
      box.appendChild(ew);
      this.chatLinks.push({ tag: 'events', a: ea, li: eli, ev: true });
      this.evDraw();
    }
    groups.forEach(function (g) {
      var wrap = el('div', 'cb-chan-group');
      var h = el('h3', 'cb-h3 cb-chan-h');
      var b = el('button', 'cb-chan-fold', g.name);
      b.type = 'button';
      var ul = el('ul', 'cb-chan-list');
      ul.id = 'cb-chans-' + g.key;
      b.setAttribute('aria-controls', ul.id);
      h.appendChild(b);
      wrap.appendChild(h);
      g.rooms.forEach(function (r) {
        var li = el('li'), a;
        if (r.dm != null) {
          // A conversation is no address, so it is a button, and says whose.
          a = el('button', 'cb-chan cb-chan--dm');
          a.type = 'button';
          a.dataset.tag = 'dm|' + fold(r.dm);
          a.dataset.dm = r.dm;
          // Named in full, and markNew adds "something new" to the name.
          if (r.dm) { a.dataset.label = r.asking ? r.dm + ', asking to message you' : 'Your conversation with ' + r.dm; a.setAttribute('aria-label', a.dataset.label); }
          a.appendChild(el('span', 'cb-chan-name', r.name));
          if (r.asking) a.appendChild(el('span', 'cb-chan-note', 'asking'));
        } else {
          a = el('a', 'cb-chan');
          a.href = '#' + r.tag;
          a.dataset.tag = r.tag;
          var hash = el('span', 'cb-chan-hash', r.tag === WORLD_CALL ? '' : '#');
          hash.setAttribute('aria-hidden', 'true');
          a.appendChild(hash);
          a.appendChild(el('span', 'cb-chan-name', r.tag === WORLD_CALL ? 'World' : r.name));
        }
        a.tabIndex = -1;
        li.appendChild(a);
        ul.appendChild(li);
        me.chatLinks.push({ tag: a.dataset.tag, a: a, li: li, room: r, dm: r.dm });
      });
      wrap.appendChild(ul);
      box.appendChild(wrap);
      var ge = { key: g.key, name: g.name, wrap: wrap, ul: ul, button: b };
      me.chatGroupEls.push(ge);
      b.addEventListener('click', function () {
        me.chatFolded[g.key] = !me.chatFolded[g.key];
        me.chatFilter();
      });
    });
    this.chatFilter();
    this.chatLinks.forEach(function (x) { if (x.dm === '') me.chatDmAll = x.a; });
    if (keep) {
      var sel = '.cb-chan[data-tag="' + CSS.escape(keep) + '"]';
      var again = (keepIn && box.querySelector('#' + CSS.escape(keepIn) + ' ' + sel)) || box.querySelector(sel);
      if (again) again.focus();
    }
  };

  /* What the box finds, in each group's own order. A folded group opens
     while something is being looked for, and folds again when it is not. */
  Radio.prototype.chatFilter = function () {
    var me = this, q = this.chatFind.value.trim(), hit = null, any = false;
    if (q && rooms) {
      hit = {};
      findRooms(q).forEach(function (x) { hit[x.room.tag] = true; });
      var fq = fold(q);
      this.chatLinks.forEach(function (x) { if (x.dm != null && fold(x.dm || 'all messages').indexOf(fq) >= 0) hit[x.tag] = true; });
      // A tag's name finds the channels under it: "pets" finds the Pets group whole.
      (this.chatGroupEls || []).forEach(function (g) {
        if (g.key.indexOf('tag-') !== 0 || fold(g.name).indexOf(fq) < 0) return;
        me.chatLinks.forEach(function (x) { if (g.ul.contains(x.li)) hit[x.tag] = true; });
      });
    }
    (this.chatGroupEls || []).forEach(function (g) {
      var shown = 0;
      me.chatLinks.forEach(function (x) {
        if (!g.ul.contains(x.li)) return;
        x.li.hidden = !!hit && !hit[x.tag];
        if (!x.li.hidden) shown++;
      });
      any = any || shown > 0;
      g.wrap.hidden = !!hit && !shown;
      var open = !!hit || !me.chatFolded[g.key];
      g.ul.hidden = !open;
      g.button.setAttribute('aria-expanded', String(open));
      g.button.disabled = !!hit;
    });
    this.chatNone.hidden = !hit || any;
    this.chatNone.textContent = hit && !any ? 'No channel’s name, its tags, or what its room is about, has ' + (q.split(/\s+/).length > 1 ? 'those words' : 'that word') + '.' : '';
    this.chatRove();
  };

  // The channel links shown now, in order.
  Radio.prototype.chatVisible = function () {
    return this.chatLinks.filter(function (x) { return !x.li.hidden && !x.li.parentNode.hidden && !x.li.parentNode.parentNode.hidden; }).map(function (x) { return x.a; });
  };

  // One channel in the Tab order: the one picked, or the first shown.
  Radio.prototype.chatRove = function (want) {
    var shown = this.chatVisible(), cur = shown.filter(function (a) { return a.hasAttribute('aria-current'); })[0];
    var stop = want && shown.indexOf(want) >= 0 ? want : cur || shown[0];
    this.chatLinks.forEach(function (x) { x.a.tabIndex = x.a === stop ? 0 : -1; });
  };

  Radio.prototype.chatKey = function (e) {
    var a = e.target.closest && e.target.closest('.cb-chan');
    if (!a) return;
    var shown = this.chatVisible(), i = shown.indexOf(a), j = -1;
    if (e.key === 'ArrowDown') j = Math.min(shown.length - 1, i + 1);
    else if (e.key === 'ArrowUp') { if (i === 0) { e.preventDefault(); this.chatFind.focus(); return; } j = i - 1; }
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = shown.length - 1;
    else return;
    e.preventDefault();
    if (j < 0 || !shown[j]) return;
    this.chatRove(shown[j]);
    shown[j].focus();
  };

  /* ── Events ──────────────────────────────────────────────────────────── */

  /* EVENTS (Ryan's ask and calls, 2026-10-23, after Discord's Scheduled
     Events): anybody signed on schedules one, on World, in a room they can go
     into, or at a link off the street; its maker or a moderator changes it or
     cancels it; anybody who can see it says they are interested. An event
     NAMES WHO IS INTERESTED, ALPHABETICAL, AND NEVER HOW MANY, the reactions'
     rule, where Discord prints a number on every event: nothing here counts
     the names, and tools/check-events.py refuses a count in this code.
     Every time is said in your own clock, the way the radio says every time;
     a repeating event says its rule in its maker's, because that is the clock
     it keeps to across summer time.

     WHERE IT IS: a part of its own on the radio, under Unreads, with an
     Events button that opens the list, and what is on now in the room you
     are in under In this channel;
     on the chat page, Events at the top of the channels, which puts the list
     where the channel was, the way a conversation does. It asks /cb/events
     from listen() and nowhere else: every EV_EVERY while the list is open,
     and every EV_QUIET while it is shut, for what is on now here. Nothing is
     kept in the browser. */
  var EV_EVERY = 60000;
  var EV_QUIET = 5 * 60000;
  var EV_LENGTHS = [15, 30, 45, 60, 90, 120, 180, 240, 360, 480, 720, 1440];
  var EV_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var EV_NTH = ['', 'first', 'second', 'third', 'fourth', 'last'];
  var EV_ID = /^e[A-Za-z0-9_-]{12}$/;

  function myZone() { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { return ''; } }
  function zoneWords(z) { return String(z || '').replace(/_/g, ' '); }
  function evDate(t) { return new Date(t).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' }); }
  function sameDay(a, b) { return new Date(a).toDateString() === new Date(b).toDateString(); }
  // Today, Tomorrow, or the day and date, in your own clock.
  function evDay(t, now) {
    if (sameDay(t, now)) return 'Today';
    if (sameDay(t, now + 864e5) && new Date(t) > new Date(now)) return 'Tomorrow';
    return evDate(t);
  }
  function evLength(m) {
    if (m === 1440) return 'a day';
    var h = Math.floor(m / 60), r = m % 60, out = [];
    if (h) out.push(h + (h === 1 ? ' hour' : ' hours'));
    if (r) out.push(r + ' minutes');
    return out.join(' ');
  }
  function evWhen(e, now) {
    if (e.start <= now) return 'On now, until ' + hhmm(new Date(e.end)) + (sameDay(e.end, now) ? '' : ', ' + evDay(e.end, now).toLowerCase());
    var day = evDay(e.start, now);
    if (!sameDay(e.start, e.end - 1)) return day + ', ' + hhmm(new Date(e.start)) + ', until ' + evDay(e.end, now).toLowerCase() + ', ' + hhmm(new Date(e.end));
    return day + ', ' + hhmm(new Date(e.start)) + ' to ' + hhmm(new Date(e.end));
  }
  // How it repeats, by its maker's clock, which is the clock it keeps to.
  function evRule(e) {
    if (!e.repeat || !e.wall) return '';
    var day = EV_DAYS[e.wall.dow] || '', clock = ' at ' + e.wall.time + (e.zone === myZone() ? '' : ' in ' + zoneWords(e.zone));
    if (e.repeat === 'weekly') return 'Every week on ' + day + clock;
    if (e.repeat === 'fortnightly') return 'Every other week on ' + day + clock;
    if (e.repeat === 'monthly') return 'Every month on the ' + EV_NTH[e.wall.nth] + ' ' + day + clock;
    if (e.repeat === 'weekdays') return 'Every weekday, Monday to Friday,' + clock;
    return '';
  }
  // The rule a date would make, for the box that chooses it.
  function evRuleFor(repeat, date) {
    var d = new Date(date + 'T12:00:00');
    if (isNaN(d)) return '';
    var day = EV_DAYS[d.getDay()], nth = Math.min(5, Math.ceil(d.getDate() / 7));
    if (repeat === 'weekly') return 'Every week on ' + day;
    if (repeat === 'fortnightly') return 'Every other week on ' + day;
    if (repeat === 'monthly') return 'Every month on the ' + EV_NTH[nth] + ' ' + day;
    if (repeat === 'weekdays') return 'Every weekday, Monday to Friday';
    return 'Does not repeat';
  }
  function evRoom(e) {
    if (e.room === WORLD_CALL) return null;
    return byTag[e.room] || (e.place ? { tag: e.room, name: e.place.name, path: e.place.path, forum: true } : { tag: e.room, name: '#' + e.room, path: '/' + e.room + '.html' });
  }
  function evFromHash() {
    var m = /^#events(?:\/(e[A-Za-z0-9_-]{12}))?$/.exec(location.hash);
    return m ? (m[1] || '') : null;
  }
  function pad2(n) { return String(n).padStart(2, '0'); }
  function localDate(t) { var d = new Date(t); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }

  /* ADD TO MY CALENDAR: the next time it happens, as an .ics file made here
     and handed to your device, which is yours rather than ours. It sends
     nothing anywhere, and it is only the next time: a calendar app that is
     told how an event repeats keeps it to its own idea of the time zone. */
  function icsText(s) { return String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); }
  function icsTime(t) { return new Date(t).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
  function icsFold(line) {
    var out = [], cur = '', n = 0;
    for (var ch of line) {
      var b = new TextEncoder().encode(ch).length;
      if (n + b > (out.length ? 74 : 75)) { out.push(cur); cur = ''; n = 0; }
      cur += ch; n += b;
    }
    out.push(cur);
    return out.join('\r\n ');
  }
  function evIcs(e, where) {
    var url = location.origin + '/chat.html#events/' + e.id;
    var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Stimpunks.World//The CB//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
      'UID:' + e.id + '-' + e.start + '@stimpunks.world', 'DTSTAMP:' + icsTime(Date.now()),
      'DTSTART:' + icsTime(e.start), 'DTEND:' + icsTime(e.end), 'SUMMARY:' + icsText(e.title),
      'DESCRIPTION:' + icsText((e.about ? e.about + '\n\n' : '') + where + '\n' + url), 'LOCATION:' + icsText(e.away || where), 'URL:' + (e.away || url),
      'END:VEVENT', 'END:VCALENDAR'];
    return lines.map(icsFold).join('\r\n') + '\r\n';
  }
  function evWhereWords(e) {
    var r = evRoom(e), name = r ? r.name : 'World';
    if (e.at === 'away') return 'Off the street, at ' + e.away + ', posted ' + (r ? 'in ' + name : 'on World');
    if (e.at === 'call') return r ? 'In ' + name + '\u2019s call, on the CB at stimpunks.world' : 'On the World call, on the CB at stimpunks.world';
    return r ? 'In ' + name + ', at stimpunks.world' : 'On World, the CB\u2019s channel for the whole street';
  }

  Radio.prototype.evMake = function (sec) {
    var me = this;
    this.evH = sec.querySelector(':scope > .cb-h');
    this.evH.tabIndex = -1;
    this.events = null;
    this.evMe = { locked: [], may: [] };
    /* What is on now in the room you are in, in a line of its own, so a call
       or a watch-together going on here is seen without opening anything. It
       stands under In this channel (the constructor puts it there). */
    var now = this.evNowLine = el('p', 'cb-ev-now');
    now.hidden = true;
    var b = this.evBtn = el('button', 'cb-btn cb-ev-btn', 'Events');
    b.type = 'button';
    b.setAttribute('aria-expanded', 'false');
    b.setAttribute('aria-controls', 'cb-ev-tray');
    b.addEventListener('click', function () { me.setEvents(b.getAttribute('aria-expanded') !== 'true'); });
    var row = el('div', 'cb-tools cb-ev-open');
    row.appendChild(b);
    sec.appendChild(row);
    var tray = this.evTray = el('div', 'cb-ev');
    tray.id = 'cb-ev-tray';
    tray.hidden = true;
    tray.appendChild(el('p', 'cb-hint cb-ev-zone', 'Times are in your own time' + (myZone() ? ', ' + zoneWords(myZone()) : '') + '.'));
    var mk = this.evMakeBtn = el('button', 'cb-btn', 'Schedule an event');
    mk.type = 'button';
    mk.setAttribute('aria-expanded', 'false');
    mk.setAttribute('aria-controls', 'cb-ev-form');
    mk.addEventListener('click', function () { if (me.evForm.hidden) me.evFormOpen(null); else me.evFormShut(); });
    var mrow = el('div', 'cb-tools');
    mrow.appendChild(mk);
    tray.appendChild(mrow);
    var form = this.evForm = el('form', 'cb-ev-form');
    form.id = 'cb-ev-form';
    form.hidden = true;
    form.noValidate = true;
    tray.appendChild(form);
    this.evSaid = el('p', 'cb-said');
    this.evSaid.setAttribute('role', 'status');
    tray.appendChild(this.evSaid);
    var list = this.evList = el('ul', 'cb-ev-list');
    list.setAttribute('aria-label', 'Events');
    tray.appendChild(list);
    this.evNone = el('p', 'cb-quiet', 'Looking\u2026');
    tray.appendChild(this.evNone);
    this.evFoot = this.footClose('Close Events', function () { me.setEvents(false); }, b);
    tray.appendChild(this.evFoot);
    sec.appendChild(tray);
  };

  Radio.prototype.evShown = function () { return !!this.evTray && !this.evTray.hidden; };

  Radio.prototype.setEvents = function (open) {
    this.evTray.hidden = !open;
    this.evBtn.setAttribute('aria-expanded', String(!!open));
    if (open) { this.loadRooms(); this.evKey = null; this.evDraw(); this.evLoad(); }
    else this.evFormShut(true);
    this.place();
  };

  // From listen(), and nowhere else.
  Radio.prototype.evTick = function () {
    if (!this.evTray) return;
    var due = !this.evAt || Date.now() - this.evAt >= (this.evShown() ? EV_EVERY : EV_QUIET);
    if (due) this.evLoad();
    else this.evDraw();
  };

  Radio.prototype.evLoad = function () {
    var me = this;
    if (this.evBusy) return;
    this.evBusy = true;
    this.evAt = Date.now();
    call('/cb/events', { body: {} }, this.state.pass).then(function (r) {
      if (r.status === 401) return me.lost();
      if (r.status === 200 && Array.isArray(r.body.events)) me.evTake(r.body);
      else if (!me.events) { me.evFailed = true; me.evDraw(); }
    }, function () { if (!me.events) { me.evFailed = true; me.evDraw(); } }).then(function () { me.evBusy = false; });
  };

  Radio.prototype.evTake = function (b) {
    this.events = b.events.filter(function (e) { return e && EV_ID.test(e.id) && typeof e.start === 'number' && typeof e.end === 'number'; });
    if (b.me && Array.isArray(b.me.locked) && Array.isArray(b.me.may)) this.evMe = b.me;
    this.evFailed = false;
    this.evDraw();
  };

  // A room the radio may list as somewhere for an event to be.
  Radio.prototype.evMayRoom = function (r) {
    if (!r || r.quiet || r.tag === WORLD_CALL || r.tag === CHAT_PAGE) return false;
    return this.evMe.locked.indexOf(r.tag) < 0 || this.evMe.may.indexOf(r.tag) >= 0;
  };

  /* Drawn again only when what it says changes, which includes the minute,
     because On now and Today change with the clock; the keyboard is put back
     on the same control afterwards. An event past its end is left off until
     the next answer brings its next time. */
  Radio.prototype.evDraw = function () {
    var me = this, now = Date.now();
    var live = (this.events || []).filter(function (e) { return e.end > now; });
    this.evNowShown(live, now);
    if (inChat() && this.chatEvNote) this.chatEvNote.hidden = !live.some(function (e) { return e.start <= now; });
    if (!this.evShown()) return;
    var key = JSON.stringify([live, Math.floor(now / 60000), this.evFailed, this.events === null, rooms === null, this.evFocus || '']);
    if (key === this.evKey) return;
    this.evKey = key;
    var focused = this.evTray.getRootNode().activeElement;
    var again = focused && this.evList.contains(focused) && focused.dataset ? focused.dataset.at : null;
    this.evList.textContent = '';
    this.evNone.hidden = live.length > 0;
    this.evNone.textContent = this.events === null ? (this.evFailed ? 'Events cannot be reached just now. Still trying.' : 'Looking\u2026')
      : 'Nothing is scheduled. Schedule an event, and everybody who can go where it is can see it.';
    live.forEach(function (e) { me.evList.appendChild(me.evCard(e, now)); });
    if (again) {
      var b = this.evList.querySelector('[data-at="' + CSS.escape(again) + '"]');
      if (b) b.focus();
    }
    if (this.evFocus && this.events) {
      var want = this.evFocus;
      this.evFocus = '';
      var card = this.evList.querySelector('.cb-ev-card[data-id="' + CSS.escape(want) + '"]');
      if (card) { var h = card.querySelector('.cb-ev-title'); h.scrollIntoView({ block: 'start' }); h.focus({ preventScroll: true }); }
      else this.evSaid.textContent = 'That event is not on the list: it has been and gone, been cancelled, or is somewhere you cannot go.';
    }
  };

  // What is on now in the room you are in, or in the channel picked.
  Radio.prototype.evNowShown = function (live, now) {
    var line = this.evNowLine, me = this;
    var here = hereRoom(), tag = here && !here.quiet ? here.tag : (worldHere() ? WORLD_CALL : null);
    var on = tag ? live.filter(function (e) { return e.room === tag && e.start <= now; }) : [];
    var key = JSON.stringify([on.map(function (e) { return [e.id, e.title, e.end]; }), tag]);
    if (key === this.evNowKey) return;
    this.evNowKey = key;
    line.textContent = '';
    line.hidden = !on.length;
    if (!on.length) return;
    line.appendChild(document.createTextNode((inChat() ? 'On now in this channel: ' : 'On now in this room: ')));
    on.forEach(function (e, i) {
      if (i) line.appendChild(document.createTextNode('; '));
      var b = el('button', 'cb-ev-link', e.title);
      b.type = 'button';
      b.addEventListener('click', function () { me.evGo(e.id); });
      line.appendChild(b);
      line.appendChild(document.createTextNode(', until ' + hhmm(new Date(e.end))));
    });
    line.appendChild(document.createTextNode('.'));
  };

  // Open the list on one event.
  Radio.prototype.evGo = function (id) {
    if (inChat()) { location.hash = 'events/' + id; return; }
    this.evFocus = id;
    if (!this.evShown()) this.setEvents(true);
    else { this.evKey = null; this.evDraw(); }
  };

  Radio.prototype.evCard = function (e, now) {
    var me = this, li = el('li', 'cb-ev-card');
    li.dataset.id = e.id;
    var h = el('h3', 'cb-h3 cb-ev-title', e.title);
    h.tabIndex = -1;
    li.appendChild(h);
    var when = el('p', 'cb-ev-when');
    if (e.start <= now) when.appendChild(el('span', 'cb-tag cb-ev-on', 'ON NOW'));
    when.appendChild(document.createTextNode(evWhen(e, now).replace(/^On now, until/, 'Until') + '.'));
    li.appendChild(when);
    var rule = evRule(e);
    if (rule) li.appendChild(el('p', 'cb-ev-rule', rule + '.'));
    if (e.then && e.then.length) {
      li.appendChild(el('p', 'cb-ev-then', 'Then ' + e.then.map(function (t) { return evDay(t, now).replace(/^Today|^Tomorrow/, function (w) { return w.toLowerCase(); }) + ' at ' + hhmm(new Date(t)); }).join('; ') + '.'));
    }
    li.appendChild(el('p', 'cb-ev-length', 'Runs ' + evLength(e.mins) + '.'));
    li.appendChild(this.evWhere(e));
    var by = el('p', 'cb-ev-by');
    by.appendChild(document.createTextNode('Scheduled by '));
    by.appendChild(this.evName(e.handle, e.id + '|by'));
    if (e.base) by.appendChild(el('span', 'cb-tag', 'BASE'));
    by.appendChild(document.createTextNode('.'));
    li.appendChild(by);
    if (e.about) {
      var ab = el('div', 'cb-text cb-ev-about');
      md(ab, e.about);
      li.appendChild(ab);
    }
    /* WHO IS INTERESTED: their names, each opening their profile, and never
       how many. */
    var keen = el('p', 'cb-ev-keen');
    if (e.keen && e.keen.length) {
      keen.appendChild(document.createTextNode('Interested: '));
      e.keen.forEach(function (k, i) {
        if (i) keen.appendChild(document.createTextNode(', '));
        keen.appendChild(me.evName(k, e.id + '|keen|' + k));
      });
      keen.appendChild(document.createTextNode('.'));
    } else keen.appendChild(document.createTextNode('Nobody has said they are interested yet.'));
    li.appendChild(keen);
    var acts = el('div', 'cb-acct__row cb-ev-acts');
    var ib = el('button', 'cb-btn', 'I\u2019m interested: ' + (e.mine ? 'on' : 'off'));
    ib.type = 'button';
    ib.dataset.at = e.id + '|keen';
    ib.setAttribute('aria-pressed', String(!!e.mine));
    ib.addEventListener('click', function () {
      me.evCall({ action: 'keen', id: e.id, on: !e.mine },
        e.mine ? 'Taken back. You are not on its list now.' : 'You are on its list now. With When an event I\u2019m interested in starts switched on under Notifications, this device is told as it starts.');
    });
    acts.appendChild(ib);
    var cal = el('button', 'cb-btn', 'Add to my calendar');
    cal.type = 'button';
    cal.dataset.at = e.id + '|cal';
    cal.setAttribute('aria-describedby', 'cb-ev-cal-' + e.id);
    cal.addEventListener('click', function () {
      var name = (e.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'event') + '.ics';
      handOver(new Blob([evIcs(e, evWhereWords(e))], { type: 'text/calendar' }), name);
      me.evSaid.textContent = 'Your device has ' + name + ', for ' + evWhen(e, Date.now()).replace(/^On now, /, 'now, ') + '. Open it to put it in your calendar.';
    });
    acts.appendChild(cal);
    var calSays = el('span', 'sr', 'The next time it happens, as a file for your calendar.');
    calSays.id = 'cb-ev-cal-' + e.id;
    acts.appendChild(calSays);
    if (e.may) {
      var ch = el('button', 'cb-btn', 'Change it');
      ch.type = 'button';
      ch.dataset.at = e.id + '|change';
      ch.addEventListener('click', function () { me.evFormOpen(e); });
      acts.appendChild(ch);
      if (e.repeat) {
        var one = el('button', 'cb-btn', 'Cancel just this time');
        one.type = 'button';
        one.dataset.at = e.id + '|skip';
        one.addEventListener('click', function () {
          me.evSure(acts, 'Cancel ' + evWhen(e, Date.now()).replace(/^On now, /, 'the one on now, ') + ' for everybody? The times after it go on.', 'Yes, cancel this time', function () {
            me.evCall({ action: 'skip', id: e.id, at: e.start }, 'Cancelled this time. The times after it go on.');
          });
        });
        acts.appendChild(one);
      }
      var x = el('button', 'cb-btn', e.repeat ? 'Cancel every time' : 'Cancel the event');
      x.type = 'button';
      x.dataset.at = e.id + '|cancel';
      x.addEventListener('click', function () {
        me.evSure(acts, 'Cancel \u201c' + e.title + '\u201d for everybody' + (e.repeat ? ', every time it would happen' : '') + '? It cannot be put back.', 'Yes, cancel it', function () {
          me.evCall({ action: 'remove', id: e.id }, 'Cancelled. It is off the list for everybody.', true);
        });
      });
      acts.appendChild(x);
    }
    li.appendChild(acts);
    return li;
  };

  // A name on an event, which opens their profile, as one on Who's online does.
  Radio.prototype.evName = function (handle, at) {
    var me = this, b = el('button', 'cb-handle', handle);
    b.type = 'button';
    b.dataset.at = at;
    b.setAttribute('aria-haspopup', 'dialog');
    b.addEventListener('click', function () { me.peek(handle, b); });
    return b;
  };

  // Where an event is, as words with the room's link in them.
  Radio.prototype.evWhere = function (e) {
    var p = el('p', 'cb-ev-where'), r = evRoom(e);
    function room() {
      var a = el('a', null, r.name);
      a.href = chatHref(r) || r.path;
      return a;
    }
    function add(x) { p.appendChild(typeof x === 'string' ? document.createTextNode(x) : x); }
    if (e.at === 'away') {
      var u = awayUrl(e.away);
      add('Off the street, at ');
      add(u ? awayLink(e.away, u) : e.away);
      add('. Posted ');
      if (r) { add('in '); add(room()); } else add('on World');
      add('.');
    } else if (!r) {
      add(e.at === 'call' ? 'On the World call, which Join World call under Who\u2019s around takes you into.' : 'On World, the whole street\u2019s channel.');
    } else if (e.at === 'call') {
      add('In the call in '); add(room()); add(': Join this room\u2019s call is under In this channel, in the room.');
    } else {
      add('In '); add(room()); add('.');
    }
    return p;
  };

  // Asked once more, in the card, before anything is cancelled.
  Radio.prototype.evSure = function (acts, ask, yes, then) {
    var me = this, was = [].slice.call(acts.childNodes);
    acts.textContent = '';
    var q = el('p', 'cb-ev-ask', ask);
    q.tabIndex = -1;
    var y = el('button', 'cb-btn', yes), n = el('button', 'cb-btn', 'Keep it');
    y.type = 'button'; n.type = 'button';
    y.addEventListener('click', function () { y.disabled = true; then(); });
    n.addEventListener('click', function () {
      acts.textContent = '';
      was.forEach(function (c) { acts.appendChild(c); });
      var back = acts.querySelector('[data-at$="|cancel"], [data-at$="|skip"]');
      if (back) back.focus();
    });
    acts.appendChild(q);
    acts.appendChild(y);
    acts.appendChild(n);
    y.focus();
  };

  Radio.prototype.evCall = function (b, ok, gone) {
    var me = this;
    this.evSaid.textContent = 'Sending\u2026';
    call('/cb/events', { body: b }, this.state.pass).then(function (r) {
      if (r.status === 401) return me.lost();
      if (r.body && Array.isArray(r.body.events)) me.evTake(r.body);
      me.evSaid.textContent = r.status === 200 ? ok : (r.body && r.body.error) || 'That did not work just now. Nothing changed.';
      if (gone && r.status === 200) me.evMakeBtn.focus();
    }, function () { me.evSaid.textContent = 'The street could not be reached just now. Nothing changed.'; });
  };

  /* SCHEDULE AN EVENT, or change one: a form in the tray, every field labelled,
     every time in your own clock and zone, which is the clock a repeating
     event keeps to from then on. */
  Radio.prototype.evFormOpen = function (e) {
    var me = this, f = this.evForm, editing = !!e;
    f.textContent = '';
    f.hidden = false;
    this.evEditing = e ? e.id : null;
    this.evMakeBtn.setAttribute('aria-expanded', 'true');
    var h = el('h3', 'cb-h3', editing ? 'Change \u201c' + e.title + '\u201d' : 'Schedule an event');
    h.tabIndex = -1;
    f.appendChild(h);
    function field(label, input, id, hint) {
      var lab = el('label', 'cb-lab', label);
      lab.htmlFor = id;
      input.id = id;
      f.appendChild(lab);
      f.appendChild(input);
      if (hint) { var p = el('p', 'cb-hint', hint); p.id = id + '-hint'; input.setAttribute('aria-describedby', p.id); f.appendChild(p); }
      return input;
    }
    var title = el('input', 'cb-say cb-ev-in');
    title.type = 'text';
    title.maxLength = 100;
    title.autocomplete = 'off';
    title.value = editing ? e.title : '';
    field('Title', title, 'cb-ev-f-title');
    // Where: World, then the room you are in, then every room you can go into.
    var where = el('select', 'cb-say cb-ev-in');
    var here = hereRoom(), seen = {}, chosen = editing ? e.room : (here && this.evMayRoom(here) ? here.tag : WORLD_CALL);
    function opt(box, tag, name) {
      var o = el('option', null, name);
      o.value = tag;
      if (tag === chosen) o.selected = true;
      box.appendChild(o);
      seen[tag] = true;
    }
    opt(where, WORLD_CALL, 'World, the whole street');
    if (here && this.evMayRoom(here)) opt(where, here.tag, here.name + (inChat() ? ' (this channel)' : ' (this room)'));
    var grp = el('optgroup');
    grp.label = 'Rooms';
    (rooms || []).forEach(function (r) { if (!seen[r.tag] && me.evMayRoom(r)) opt(grp, r.tag, r.name); });
    if (editing && !seen[e.room]) { var er = evRoom(e); opt(grp, e.room, er ? er.name : '#' + e.room); }
    where.appendChild(grp);
    field('Where', where, 'cb-ev-f-room', 'Whoever can go into the room can see it; on World, everybody on the CB can.');
    // In what way: the call, the room itself, or a link off the street.
    var how = editing ? e.at : 'call';
    f.appendChild(el('p', 'cb-lab', 'How people join it'));
    var hows = el('div', 'cb-tools cb-ev-how');
    hows.setAttribute('role', 'group');
    hows.setAttribute('aria-label', 'How people join it');
    var away = el('input', 'cb-say cb-ev-in');
    away.type = 'url';
    away.placeholder = 'https://';
    away.autocomplete = 'off';
    away.value = editing && e.away ? e.away : '';
    var awayBox = el('div', 'cb-ev-away');
    var awayLab = el('label', 'cb-lab', 'Its link');
    awayLab.htmlFor = 'cb-ev-f-away';
    away.id = 'cb-ev-f-away';
    awayBox.appendChild(awayLab);
    awayBox.appendChild(away);
    var hb = {};
    function labels() {
      var world = where.value === WORLD_CALL;
      hb.call.textContent = world ? 'On the World call' : 'In the room\u2019s call';
      hb.here.textContent = world ? 'On World\u2019s channel' : 'In the room itself';
      hb.away.textContent = 'Off the street, at a link';
    }
    ['call', 'here', 'away'].forEach(function (k) {
      var b = hb[k] = el('button', 'cb-btn');
      b.type = 'button';
      b.setAttribute('aria-pressed', String(how === k));
      b.addEventListener('click', function () {
        how = k;
        Object.keys(hb).forEach(function (x) { hb[x].setAttribute('aria-pressed', String(x === k)); });
        awayBox.hidden = k !== 'away';
        if (k === 'away') away.focus();
      });
      hows.appendChild(b);
    });
    labels();
    where.addEventListener('change', labels);
    f.appendChild(hows);
    awayBox.hidden = how !== 'away';
    f.appendChild(awayBox);
    var start = editing ? new Date(e.start) : null;
    var date = el('input', 'cb-say cb-ev-in');
    date.type = 'date';
    date.value = start ? localDate(e.start) : '';
    field('Date', date, 'cb-ev-f-date');
    var time = el('input', 'cb-say cb-ev-in');
    time.type = 'time';
    time.value = start ? pad2(start.getHours()) + ':' + pad2(start.getMinutes()) : '';
    field('Starts at', time, 'cb-ev-f-time', 'In your own time' + (myZone() ? ', ' + zoneWords(myZone()) : '') + '. Everybody else sees it in theirs.');
    var len = el('select', 'cb-say cb-ev-in');
    var lens = EV_LENGTHS.slice(), m = editing ? e.mins : 60;
    if (lens.indexOf(m) < 0) { lens.push(m); lens.sort(function (a, b) { return a - b; }); }
    lens.forEach(function (n) { var o = el('option', null, evLength(n)); o.value = String(n); if (n === m) o.selected = true; len.appendChild(o); });
    field('How long it runs', len, 'cb-ev-f-mins');
    var rep = el('select', 'cb-say cb-ev-in');
    var repNow = editing ? e.repeat : '';
    rep.addEventListener('change', function () { repNow = rep.value; });
    function repeats() {
      var v = repNow, d = new Date(date.value + 'T12:00:00'), weekend = !isNaN(d) && (d.getDay() === 0 || d.getDay() === 6);
      rep.textContent = '';
      ['', 'weekly', 'fortnightly', 'monthly', 'weekdays'].forEach(function (k) {
        var o = el('option', null, date.value ? evRuleFor(k, date.value) : (k ? evRuleFor(k, '2026-01-05').replace(/ on .*$/, '') : 'Does not repeat'));
        o.value = k;
        if (k === 'weekdays' && weekend) o.disabled = true;
        if (k === v && !o.disabled) o.selected = true;
        rep.appendChild(o);
      });
    }
    repeats();
    date.addEventListener('change', repeats);
    field('Repeats', rep, 'cb-ev-f-repeat', 'A repeating event keeps to your clock, so it stays at the same time where you are when summer time starts or ends.');
    var about = el('textarea', 'cb-say cb-say--msg cb-ev-in');
    about.maxLength = 2000;
    about.rows = 3;
    about.value = editing ? e.about : '';
    field('What it is (if you like)', about, 'cb-ev-f-about', 'Up to 2,000 characters, and Markdown works, as in a message.');
    var said = el('p', 'cb-said');
    said.setAttribute('role', 'status');
    var row = el('div', 'cb-acct__row');
    var go = el('button', 'cb-btn', editing ? 'Save the change' : 'Schedule it');
    go.type = 'submit';
    var no = el('button', 'cb-btn', 'Cancel');
    no.type = 'button';
    no.addEventListener('click', function () { me.evFormShut(); });
    row.appendChild(go);
    row.appendChild(no);
    f.appendChild(row);
    f.appendChild(said);
    f.onsubmit = function (ev) {
      ev.preventDefault();
      var b = { action: editing ? 'edit' : 'make', title: title.value, about: about.value, room: where.value, at: how,
        away: how === 'away' ? away.value : '', date: date.value, time: time.value, zone: myZone(), mins: Number(len.value), repeat: rep.value };
      if (editing) b.id = e.id;
      if (!title.value.trim()) { said.textContent = 'An event needs a title.'; title.focus(); return; }
      if (!date.value || !time.value) { said.textContent = 'An event needs a date and a time to start.'; (date.value ? time : date).focus(); return; }
      go.disabled = true;
      said.textContent = 'Sending\u2026';
      call('/cb/events', { body: b }, me.state.pass).then(function (r) {
        go.disabled = false;
        if (r.status === 401) return me.lost();
        if (r.body && Array.isArray(r.body.events)) me.evTake(r.body);
        if (r.status !== 200) { said.textContent = (r.body && r.body.error) || 'That did not work just now. Nothing changed.'; return; }
        me.evFormShut(true);
        me.evSaid.textContent = editing ? 'Changed.' : 'Scheduled. You are interested in it, so with When an event I\u2019m interested in starts switched on under Notifications, this device is told as it starts.';
        me.evFocus = r.body.id || (editing ? e.id : '');
        me.evKey = null;
        me.evDraw();
      }, function () { go.disabled = false; said.textContent = 'The street could not be reached just now. Nothing changed.'; });
    };
    h.scrollIntoView({ block: 'nearest' });
    title.focus();
    this.place();
  };

  Radio.prototype.evFormShut = function (quiet) {
    if (!this.evForm || this.evForm.hidden) return;
    this.evForm.hidden = true;
    this.evForm.textContent = '';
    this.evMakeBtn.setAttribute('aria-expanded', 'false');
    var was = this.evEditing;
    this.evEditing = null;
    if (quiet) return;
    var back = was && this.evList.querySelector('[data-at="' + CSS.escape(was + '|change') + '"]');
    (back || this.evMakeBtn).focus();
    this.place();
  };

  /* ── The Profile ─────────────────────────────────────────────────────── */
  /* A pet in a few words, for a sticker's caption and somebody's pets: its
     name, what it is and its markings, never where it was found or when. */
  function petWords(a) {
    var w = a.words || {};
    return (a.name ? a.name + ', a ' : 'A ') + w.coat + ' ' + (w.noun || (a.kind === 'dog' ? 'dog' : 'cat')) + ' ' + w.mark;
  }

  /* A STICKER on a message: the pet drawn by animals.js, loaded on the first
     one, with its words under it for everybody, so nobody needs the drawing. */
  function sticker(st) {
    var fig = el('figure', 'cb-sticker');
    fig.appendChild(el('figcaption', null, petWords(st)));
    withAnimals(function () { fig.insertBefore(window.loveAnimals.draw(st, 'cb-sticker__art'), fig.firstChild); });
    return fig;
  }

  /* SOMEBODY'S PROFILE, IN FULL (Ryan, 2026-10-17, after requests for
     profiles more like Discord's). Pressing a handle on the channel, or a name
     on Who's online, opens a <dialog> over the page: on the left their card,
     in the theme they chose, with whatever they filled in (profile.js draws
     it); on the right, where Discord has Board, Activity and Wishlist, tabs for
     their avatars, their pets, their badges and jobs and their battle jacket,
     each shown only as they have chosen. Opened modally, so the keyboard stays
     inside it; Escape, Close or a press outside shuts it, and the keyboard
     goes back to the name. Nothing is fetched until the press. */
  var profileWait = null;
  function withProfile(then) {
    if (window.loveProfile && window.loveCbArt && window.loveAvatar) { then(); return; }
    if (!profileWait) {
      profileWait = [];
      var got = 0;
      var done = function () {
        if (++got < 2) return;
        if (window.loveProfile) { then(); return; }
        var s = document.createElement('script');
        s.src = '/profile.js';
        s.addEventListener('load', function () { var w = profileWait; profileWait = null; w.forEach(function (f) { f(); }); });
        document.head.appendChild(s);
      };
      withArt(done);
      withAvatar(done);
    }
    profileWait.push(then);
  }

  Radio.prototype.pfMake = function () {
    var me = this, d = this.pfDialog;
    if (!d) {
      d = this.pfDialog = el('dialog', 'pf-dialog');
      d.setAttribute('aria-labelledby', 'pf-name');
      /* EVERY WAY OUT ASKS FIRST (Ryan, 2026-10-18): a press outside, Escape
         and Cancel all go through pfGuard, which the editor sets while it has
         changes nobody has saved, and which asks before they are thrown away.
         A profile someone is only looking at has no guard and just closes. */
      d.addEventListener('click', function (e) { if (e.target === d && !(me.pfGuard && me.pfGuard())) d.close(); });
      d.addEventListener('cancel', function (e) { if (me.pfGuard && me.pfGuard()) e.preventDefault(); });
      d.addEventListener('close', function () {
        // A dialog's close event comes a moment after it closes, so a profile
        // or the editor opened in that moment is already in it: leave it be.
        if (d.open) return;
        me.pfGuard = null;
        d.textContent = '';
        var from = me.peekFrom, at = me.peekAt;
        me.peekFrom = null;
        me.peekAt = null;
        me.peekN = (me.peekN || 0) + 1;
        // Who's online may have been redrawn while it was open: the same
        // name's new button takes the keyboard back.
        // So may Profile's buttons, which a save draws again.
        if (from && !from.isConnected && at) {
          var again = me.onlineList.querySelectorAll('.cb-handle');
          for (var i = 0; i < again.length; i++) if (again[i].dataset.at === at) from = again[i];
          var mine = me.pfBox && me.pfBox.querySelector('[data-at="' + CSS.escape(at) + '"]');
          if (mine) from = mine;
        }
        if (from && from.isConnected) from.focus();
      });
      this.host.shadowRoot.appendChild(d);
    }
    this.pfGuard = null;
    d.textContent = '';
    return d;
  };

  // The card's helpers, lent to profile.js: what is typed reaches it as text.
  function pfLink(li, l) {
    var u = awayUrl(l);
    if (onStreet(l)) streetPart(li, l, 0, l.length);
    else if (u) li.appendChild(awayLink(l, u));
    else li.appendChild(document.createTextNode(l));
  }
  function pfRoom(tag) { return byTag[tag] || null; }

  /* Tabs, the ARIA pattern: the arrow keys, Home and End move along them and
     show the one they land on, and only the tab showing is in the tab order. */
  function tabsInto(right, label, names, start) {
    var list = el('div', 'pf-tabs');
    list.setAttribute('role', 'tablist');
    list.setAttribute('aria-label', label);
    right.appendChild(list);
    var tabs = [], panels = [];
    names.forEach(function (n, i) {
      var t = el('button', 'pf-tab', n);
      t.type = 'button';
      t.id = 'pf-tab-' + i;
      t.setAttribute('role', 'tab');
      t.setAttribute('aria-controls', 'pf-panel-' + i);
      var pn = el('div', 'pf-panel-tab');
      pn.id = 'pf-panel-' + i;
      pn.setAttribute('role', 'tabpanel');
      pn.setAttribute('aria-labelledby', t.id);
      pn.tabIndex = 0;
      list.appendChild(t);
      right.appendChild(pn);
      tabs.push(t); panels.push(pn);
      t.addEventListener('click', function () { show(i, false); });
    });
    function show(i, focus) {
      tabs.forEach(function (t, j) {
        t.setAttribute('aria-selected', String(i === j));
        t.tabIndex = i === j ? 0 : -1;
        panels[j].hidden = i !== j;
      });
      if (focus) tabs[i].focus();
    }
    list.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(e.target), n = tabs.length;
      if (i < 0) return;
      var to = e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i + n - 1) % n
        : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1;
      if (to < 0) return;
      e.preventDefault();
      show(to, true);
    });
    show(start || 0, false);
    return panels;
  }

  Radio.prototype.peek = function (handle, from, mark, tab) {
    var me = this;
    this.peekFrom = from;
    this.peekAt = from && from.dataset ? from.dataset.at : null;
    var peekN = this.peekN = (this.peekN || 0) + 1;
    this.loadRooms();
    withProfile(function () {
      if (peekN !== me.peekN) return;
      var d = me.pfMake();
      d.setAttribute('aria-labelledby', 'pf-name');
      var sheet = el('div', 'pf-sheet');
      var left = el('div', 'pf-left');
      var right = el('div', 'pf-right');
      var close = el('button', 'cb-btn pf-close', 'Close');
      close.type = 'button';
      close.addEventListener('click', function () { d.close(); });
      var said = el('p', 'cb-quiet pf-looking', 'Looking…');
      left.appendChild(said);
      sheet.appendChild(left);
      sheet.appendChild(right);
      sheet.appendChild(close);
      // The stage holds the sheet, and their frame and effect once they come.
      var stage = el('div', 'pf-stage');
      stage.appendChild(sheet);
      d.appendChild(stage);
      if (!d.open) d.showModal();
      close.focus();
      var mineP = String(handle).toLowerCase() === String(me.state.handle || '').toLowerCase();
      var panels = tabsInto(right, handle + '’s avatars, pets, badges, battle jacket, chimeras and props',
        ['Avatars', 'Pets', 'Badges and jobs', 'Battle jacket', 'Chimeras', 'Props'], tab === 'props' ? 5 : 0);
      // The card waits for both its profile and the avatar its owner wears.
      var prof = call('/cb/profile/of', { body: { handle: handle } }, me.state.pass);
      var avs = call('/cb/avatars/of', { body: { handle: handle } }, me.state.pass);
      Promise.all([prof, avs, me.roomsReady || null]).then(function (rs) {
        if (peekN !== me.peekN) return;
        if (rs[0].status === 401 || rs[1].status === 401) { d.close(); return me.lost(); }
        var p = rs[0].status === 200 && rs[0].body ? rs[0].body.profile : null;
        var av = rs[1].status === 200 && rs[1].body ? rs[1].body : null;
        var whose = (rs[0].body && rs[0].body.handle) || handle;
        window.loveProfile.surround(stage, p);
        left.textContent = '';
        var card = window.loveProfile.card(p || {}, {
          handle: whose, mark: mark, mine: mineP, wearing: av && av.wearing, nameId: 'pf-name',
          md: md, links: pfLink, room: pfRoom,
          onAvatar: function (btn) { me.avatarBox({ look: av.wearing.look, about: av.wearing.about, worn: true }, btn, whose); },
        });
        left.appendChild(card);
        window.loveProfile.drawCard(card, p);
        /* THEIR CHAT STATUS (2026-10-24), under their name and the line of
           their own, with what the badge asks in the card's own words. */
        var chatNow = rs[0].status === 200 && rs[0].body ? chatOf(rs[0].body.chat) : null;
        if (chatNow) {
          var chatLine = el('p', 'pf-chat');
          chatLine.appendChild(chatBadge(chatNow.id));
          chatLine.appendChild(el('span', 'pf-chat__says', chatNow.says));
          var after = card.querySelector('.pf-tagline') || card.querySelector('.pf-line') || card.querySelector('.pf-name');
          if (after) after.parentNode.insertBefore(chatLine, after.nextSibling);
        }
        var cardBody = card.querySelector('.pf-body');
        if (rs[0].status !== 200) cardBody.appendChild(el('p', 'cb-quiet pf-empty', 'Their profile card could not be fetched just now.'));
        else if (!p) cardBody.appendChild(el('p', 'cb-quiet pf-empty', mineP
          ? (me.state.claimed ? 'Your card has nothing on it yet. Edit my profile card, in Profile on this radio, is where you fill it in.' : 'Claim your username, under Account on this radio, and you can fill in a profile card.')
          : whose + ' has nothing on their card.'));
        /* MESSAGE THEM (Ryan, 2026-10-18), for a claimed username looking at
           somebody else's. Whether they take messages is said once their
           conversation opens, never here: the answer is the same words for a
           switch that is off and a block, so the profile cannot tell either. */
        if (!mineP && me.dmBox) {
          var dmRow = el('p', 'pf-message');
          var dmB = el('button', 'cb-btn', 'Message ' + whose);
          dmB.type = 'button';
          dmB.addEventListener('click', function () { me.peekFrom = null; d.close(); me.dmTo(whose); });
          dmRow.appendChild(dmB);
          (card.querySelector('.pf-body') || left).appendChild(dmRow);
        }
        var avSaid = el('p', 'cb-quiet', 'Looking…');
        panels[0].appendChild(avSaid);
        var avBox = el('div', 'cb-peek__avatars');
        avBox.hidden = true;
        panels[0].appendChild(avBox);
        if (!av) avSaid.textContent = 'Their avatars could not be fetched just now.';
        else me.peekAvatars(av, handle, avSaid, avBox);
      }, function () { if (peekN === me.peekN) said.textContent = 'Their profile could not be fetched just now.'; });

      // PETS.
      var pSaid = el('p', 'cb-quiet', 'Looking…');
      panels[1].appendChild(pSaid);
      var list = el('ul', 'cb-pets__list');
      list.hidden = true;
      panels[1].appendChild(list);
      /* THEIR JOBS AND BADGES (Ryan, 2026-10-14), only if they have chosen to
         show them, which needs a claimed username. The badges are worked out
         here from the jobs; nobody keeps a badge, and nothing counts them.
         They come from what the profile shows and nothing else: their jobs if
         they show them, and Pet Parent if they show their pets. Never Rescue
         Ranger, because nothing on the street knows who rescued. */
      var bBox = el('div', 'cb-jobs-box');
      bBox.hidden = true;
      panels[2].appendChild(bBox);
      var jSaid = el('p', 'cb-quiet', 'Looking…');
      panels[2].appendChild(jSaid);
      var jBox = el('div', 'cb-jobs-box');
      jBox.hidden = true;
      panels[2].appendChild(jBox);
      var shownJobs = [], shownPets = false, guildNow = null, waiting = 2;
      function badgesNow() {
        if (--waiting > 0 || peekN !== me.peekN || !guildNow) return;
        var bs = badgesFor(guildNow, shownJobs, { pets: shownPets, rescues: false });
        badgesInto(bBox, bs);
        bBox.hidden = !bs.length;
      }
      withGuild(function (guild) {
        guildNow = guild;
        call('/cb/jobs/of', { body: { handle: handle } }, me.state.pass).then(function (r) {
          if (peekN !== me.peekN) return;
          if (r.status === 401) return me.lost();
          if (r.status !== 200 || !r.body || !guild) jSaid.textContent = 'Their jobs could not be fetched just now.';
          else if (!r.body.shown) {
            jSaid.textContent = mineP
              ? 'You have not made your jobs public. Profile, on this radio, is where you switch that on.'
              : handle + ' has not made their jobs public.';
          } else if (!r.body.jobs.length) jSaid.textContent = r.body.handle + ' has no jobs kept.';
          else {
            shownJobs = r.body.jobs;
            jSaid.hidden = true;
            jBox.hidden = false;
            jobsInto(jBox, guild, r.body.jobs, mineP ? 'The jobs you have handed in' : 'The jobs ' + r.body.handle + ' has handed in');
          }
          badgesNow();
        }, function () { jSaid.textContent = 'Their jobs could not be fetched just now.'; badgesNow(); });
      });
      // THEIR BATTLE JACKET (Ryan, 2026-10-14), only if they have chosen to show it.
      var jkSaid = el('p', 'cb-quiet', 'Looking…');
      panels[3].appendChild(jkSaid);
      var jkBox = el('div', 'cb-jacket');
      jkBox.hidden = true;
      panels[3].appendChild(jkBox);
      withPatches(function () {
        call('/cb/patches/of', { body: { handle: handle } }, me.state.pass).then(function (r) {
          if (peekN !== me.peekN) return;
          if (r.status === 401) return me.lost();
          if (r.status !== 200 || !r.body) { jkSaid.textContent = 'Their jacket could not be fetched just now.'; return; }
          if (!r.body.shown) {
            jkSaid.textContent = mineP
              ? 'You have not made your battle jacket public. Profile, on this radio, is where you switch that on.'
              : handle + ' has not made their battle jacket public.';
            return;
          }
          jkSaid.hidden = true;
          jkBox.hidden = false;
          jacketInto(jkBox, r.body.patches || [], mineP ? 'yours' : r.body.handle + '’s', true);
        }, function () { jkSaid.textContent = 'Their jacket could not be fetched just now.'; });
      });
      /* THEIR CHIMERAS (Ryan, 2026-10-18), only if they have chosen to show
         them, which needs a claimed username: each drawn, with its name and
         which animal gave which part. */
      var chSaid = el('p', 'cb-quiet', 'Looking…');
      panels[4].appendChild(chSaid);
      var chList = el('ul', 'cb-avatars__list cb-peek__chimeras');
      chList.hidden = true;
      panels[4].appendChild(chList);
      withChimera(function () {
        call('/cb/chimeras/of', { body: { handle: handle } }, me.state.pass).then(function (r) {
          if (peekN !== me.peekN) return;
          if (r.status === 401) return me.lost();
          if (r.status !== 200 || !r.body) { chSaid.textContent = 'Their chimeras could not be fetched just now.'; return; }
          if (!r.body.shown) {
            chSaid.textContent = mineP
              ? 'You have not made your chimeras public. Profile, on this radio, is where you switch that on.'
              : handle + ' has not made their chimeras public.';
            return;
          }
          var list = r.body.chimeras || [];
          if (!list.length) { chSaid.textContent = (r.body.handle || handle) + ' has no chimeras yet.'; return; }
          chSaid.hidden = true;
          chList.hidden = false;
          list.forEach(function (c) {
            var li = el('li', 'cb-avatar');
            li.appendChild(chimeraArt(c.parts, 'cb-avatar__art'));
            var words = el('div', 'cb-avatar__words');
            words.appendChild(el('p', 'cb-pet__name', c.name || window.loveChimera.suggest(c.parts)));
            words.appendChild(el('p', 'cb-pet__about', window.loveChimera.words(c.parts)));
            chimeraSays(words, c.sayings);
            li.appendChild(words);
            chList.appendChild(li);
          });
        }, function () { chSaid.textContent = 'Their chimeras could not be fetched just now.'; });
      });
      withAnimals(function () {
        call('/cb/pets/of', { body: { handle: handle } }, me.state.pass).then(function (r) {
          if (peekN !== me.peekN) return;
          if (r.status === 401) return me.lost();
          shownPets = !!(r.status === 200 && r.body.shown && r.body.pets && r.body.pets.length);
          badgesNow();
          if (r.status !== 200) { pSaid.textContent = 'Their pets could not be fetched just now.'; return; }
          if (!r.body.shown) {
            pSaid.textContent = mineP
              ? 'You have not made your pets public. Profile, on this radio, is where you switch that on.'
              : handle + ' has not made their pets public.';
            return;
          }
          if (!r.body.pets.length) { pSaid.textContent = r.body.handle + ' has no pets yet.'; return; }
          pSaid.hidden = true;
          list.hidden = false;
          r.body.pets.slice().reverse().forEach(function (a) {
            var li = el('li', 'cb-pet');
            li.appendChild(window.loveAnimals.draw(a, 'cb-pet__art'));
            var words = el('div', 'cb-pet__words');
            words.appendChild(el('p', 'cb-pet__name', a.name || 'Not named yet'));
            words.appendChild(el('p', 'cb-pet__about', petWords(Object.assign({}, a, { name: '' })) + '.'));
            li.appendChild(words);
            list.appendChild(li);
          });
        }, function () { pSaid.textContent = 'Their pets could not be fetched just now.'; badgesNow(); });
      });
      me.peekProps(panels[5], handle, mineP, peekN);
    });
  };

  /* THEIR PROPS (Ryan, 2026-10-18, after the forums' Props & Gratitude): the
     props they confirmed, newest first, each with who wrote it, if they have
     opened their Props tab; and, for anybody with a claimed username, a box to
     give them props, which wait for them to Confirm or Reject in Profile.
     Whatever you wrote for them that is still waiting is shown to you, with a
     way to take it back. NEVER A COUNT: not how many props anybody has, nor how
     many are waiting. The answer to a press goes in one status line under the
     tab, which stays while the rest is drawn again. */
  Radio.prototype.peekProps = function (panel, handle, mine, peekN) {
    var me = this;
    var box = el('div', 'pf-props');
    var said = el('p', 'cb-said pf-props__said');
    said.setAttribute('role', 'status');
    panel.appendChild(box);
    panel.appendChild(said);
    box.appendChild(el('p', 'cb-quiet', 'Looking…'));
    var ctx = { panel: panel, box: box, said: said, handle: handle, mine: mine, peekN: peekN };
    call('/cb/props/of', { body: { handle: handle } }, me.state.pass).then(function (r) {
      if (peekN !== me.peekN) return;
      if (r.status === 401) return me.lost();
      if (r.status !== 200 || !r.body) { box.textContent = ''; box.appendChild(el('p', 'cb-quiet', 'Their props could not be fetched just now.')); return; }
      me.drawPeekProps(ctx, r.body);
    }, function () {
      if (peekN !== me.peekN) return;
      box.textContent = '';
      box.appendChild(el('p', 'cb-quiet', 'Their props could not be fetched just now.'));
    });
  };

  /* Send something about somebody's props, and draw the tab again from the
     answer. focus says where the keyboard goes once it is drawn. */
  Radio.prototype.propsOf = function (ctx, body, done, focus) {
    var me = this;
    body.handle = ctx.handle;
    return call('/cb/props/of', { body: body }, me.state.pass).then(function (r) {
      if (ctx.peekN !== me.peekN) return false;
      if (r.status === 401) { me.lost(); return false; }
      if (r.status === 200 && r.body) {
        me.drawPeekProps(ctx, r.body);
        ctx.said.textContent = done;
        var to = focus && focus();
        (to || ctx.panel).focus();
        return true;
      }
      ctx.said.textContent = (r.body && typeof r.body.error === 'string') ? r.body.error : 'That did not work just now. Nothing changed.';
      return false;
    }, function () { ctx.said.textContent = 'The street could not be reached just now. Nothing changed.'; return false; });
  };

  Radio.prototype.drawPeekProps = function (ctx, b) {
    var me = this, box = ctx.box, whose = b.handle || ctx.handle, mine = ctx.mine;
    box.textContent = '';
    var waiting = Array.isArray(b.waiting) ? b.waiting : [];
    var up = Array.isArray(b.props) ? b.props : [];
    if (waiting.length) {
      box.appendChild(el('h3', 'pf-props__h', 'Waiting for ' + whose + ' to confirm'));
      var wl = el('ul', 'pf-props__list');
      waiting.forEach(function (p) { wl.appendChild(me.propItem(ctx, p, whose)); });
      box.appendChild(wl);
      box.appendChild(el('p', 'cb-quiet', 'Only you and ' + whose + ' can read it until they confirm it. If they reject it, it stops waiting, and nobody is told.'));
    }
    if (!b.shown) {
      box.appendChild(el('p', 'cb-quiet', mine
        ? 'You have not opened your Props tab. Profile, on this radio, is where you switch that on.'
        : whose + ' has not opened their Props tab.'));
    } else {
      if (mine && b.yours) box.appendChild(el('p', null, 'Props are waiting for you to confirm or reject, in Profile on this radio.'));
      if (waiting.length || up.length) box.appendChild(el('h3', 'pf-props__h', mine ? 'Your props' : 'Props for ' + whose));
      if (!up.length) {
        box.appendChild(el('p', 'cb-quiet', mine ? 'Nobody has given you props yet.' : 'Nobody has given ' + whose + ' props yet.'));
      } else {
        var ul = el('ul', 'pf-props__list');
        up.forEach(function (p) { ul.appendChild(me.propItem(ctx, p, whose)); });
        box.appendChild(ul);
      }
      if (!mine) this.propGive(ctx, whose, waiting.length > 0);
    }
    var more = el('p', 'cb-quiet pf-props__more');
    more.appendChild(document.createTextNode('For thanks the whole community reads, there is '));
    var a = el('a', null, 'Props & Gratitude in the forums');
    a.href = '/forum.html#/c/props-and-gratitude';
    more.appendChild(a);
    more.appendChild(document.createTextNode('.'));
    box.appendChild(more);
  };

  /* One prop: its words, as Markdown drawn into elements like a message; who
     wrote it, which opens their profile; and, for whoever may, a way to take it
     off, which asks once more. */
  Radio.prototype.propItem = function (ctx, p, whose) {
    var me = this;
    var li = el('li', 'pf-prop');
    // From inside a profile, their profile opens in its place, and Close
    // still takes the keyboard back to the name first pressed.
    this.propWords(li, p, function () { return me.peekFrom; });
    var label = p.mine ? 'Take it back' : ctx.mine ? 'Take it off my profile' : me.state.base ? 'Take it down' : '';
    if (!label) return li;
    var sureText = p.mine ? 'This deletes what you wrote for ' + whose + '. It cannot be undone.'
      : ctx.mine ? 'This takes it off your profile and deletes it. Nobody is told. It cannot be undone.'
      : 'This takes it off ' + whose + '’s profile and deletes it. Nothing is kept about it. It cannot be undone.';
    var row = el('div', 'cb-acct__row');
    var drop = el('button', 'cb-btn', label);
    drop.type = 'button';
    row.appendChild(drop);
    li.appendChild(row);
    var sure = el('div', 'cb-forget-sure');
    sure.hidden = true;
    sure.appendChild(el('p', null, sureText));
    var yes = el('button', 'cb-btn', 'Yes, ' + label.charAt(0).toLowerCase() + label.slice(1));
    yes.type = 'button';
    var no = el('button', 'cb-btn', 'Leave it');
    no.type = 'button';
    sure.appendChild(yes); sure.appendChild(no);
    li.appendChild(sure);
    drop.addEventListener('click', function () { sure.hidden = false; drop.hidden = true; no.focus(); });
    no.addEventListener('click', function () { sure.hidden = true; drop.hidden = false; drop.focus(); });
    yes.addEventListener('click', function () {
      yes.disabled = true;
      me.propsOf(ctx, { remove: p.id }, p.mine ? 'Taken back.' : 'Taken off.').then(function (ok) { if (!ok) yes.disabled = false; });
    });
    return li;
  };

  /* A prop's words, as Markdown drawn into elements like a message, and who
     wrote it, a button that opens their profile, with the mark their pass gave
     them. from() is what the keyboard goes back to when that profile closes. */
  Radio.prototype.propWords = function (li, p, from) {
    var me = this;
    var words = el('div', 'pf-prop__words');
    md(words, p.text);
    li.appendChild(words);
    var line = el('p', 'pf-prop__from');
    line.appendChild(document.createTextNode('From '));
    var who = el('button', 'cb-handle pf-prop__who', p.handle);
    who.type = 'button';
    who.setAttribute('aria-haspopup', 'dialog');
    who.addEventListener('click', function () { me.peek(p.handle, from() || who, { base: !!p.base, claimed: !!p.claimed }); });
    line.appendChild(who);
    if (p.base) line.appendChild(el('span', 'cb-tag', 'BASE'));
    li.appendChild(line);
  };

  /* Giving somebody props: a sentence or a short paragraph, which waits for
     them. Only a claimed username can, and one at a time for each person. */
  Radio.prototype.propGive = function (ctx, whose, waiting) {
    var me = this, box = ctx.box;
    if (waiting) return;
    if (!forumPass(me.state.pass)) {
      box.appendChild(el('p', 'cb-quiet', 'Claim your username, under Account on this radio, and you can give ' + whose + ' props.'));
      return;
    }
    var form = el('form', 'pf-props__give');
    var id = 'pf-props-give';
    var lab = el('label', 'pf-props__h', 'Give ' + whose + ' props');
    lab.htmlFor = id;
    var ta = el('textarea', 'cb-say pf-props__say');
    ta.id = id;
    ta.rows = 3;
    ta.maxLength = 500;
    ta.setAttribute('aria-describedby', id + '-hint');
    var hint = el('p', 'pf-props__hint', 'A sentence or a short paragraph thanking ' + whose + ', acknowledging them or celebrating them, for something they did for you or for the community. It goes on their profile, with your username on it, only once they confirm it. Basic Markdown works, as on the channel.');
    hint.id = id + '-hint';
    var go = el('button', 'cb-btn', 'Send it to ' + whose);
    go.type = 'submit';
    form.appendChild(lab);
    form.appendChild(ta);
    form.appendChild(hint);
    var row = el('div', 'cb-acct__row');
    row.appendChild(go);
    form.appendChild(row);
    box.appendChild(form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!ta.value.trim()) { ctx.said.textContent = 'Write what you would like to thank them for first.'; ta.focus(); return; }
      go.disabled = true;
      me.propsOf(ctx, { give: ta.value }, 'Sent. It goes on ' + whose + '’s profile if they confirm it.', function () {
        var h = ctx.box.querySelector('h3');
        if (h) h.tabIndex = -1;
        return h;
      }).then(function (ok) { if (!ok) { go.disabled = false; ta.focus(); } });
    });
  };

  /* The avatars in somebody's profile: the one they wear first and largest,
     then the rest, newest first, if they have made them public. What their
     owner wrote is said once, in the button's name, and shown under it for
     eyes. Nobody is told whether somebody has avatars they have not shown. */
  Radio.prototype.peekAvatars = function (b, handle, said, box) {
    var me = this;
    var whose = b.handle || handle;
    var mine = String(handle).toLowerCase() === String(this.state.handle || '').toLowerCase();
    var list = b.shown && Array.isArray(b.avatars) ? b.avatars
      : (b.wearing ? [{ look: b.wearing.look, about: b.wearing.about, name: '', worn: true }] : []);
    box.textContent = '';
    if (!list.length) {
      said.textContent = mine
        ? 'You are not wearing an avatar on the CB. Profile, on this radio, is where you wear one.'
        : whose + ' is not wearing an avatar on the CB.';
      return;
    }
    said.hidden = true;
    box.hidden = false;
    list.forEach(function (a, i) {
      var fig = el('figure', 'cb-peek__av' + (i === 0 ? ' cb-peek__av--first' : ''));
      var open = el('button', 'cb-peek__open');
      open.type = 'button';
      var what = a.worn ? 'the avatar ' + (mine ? 'you wear' : whose + ' wears') : (a.name || 'an avatar of ' + (mine ? 'yours' : whose + '\u2019s'));
      open.setAttribute('aria-label', 'Open ' + what + ' larger' + (a.about ? '. ' + a.about : ''));
      var art = window.loveAvatar.draw(a.look, { ground: true, cls: 'cb-peek__art' });
      if (art) open.appendChild(art);
      open.addEventListener('click', function () { me.avatarBox(a, open, whose); });
      fig.appendChild(open);
      var cap = el('figcaption', 'cb-peek__cap');
      cap.setAttribute('aria-hidden', 'true');
      if (a.worn) cap.appendChild(el('span', 'cb-avatar__worn', 'Wearing on the CB'));
      if (a.name) cap.appendChild(el('span', 'cb-peek__name', a.name));
      if (a.about) cap.appendChild(el('span', 'cb-peek__about', a.about));
      if (cap.childNodes.length) fig.appendChild(cap);
      box.appendChild(fig);
    });
    if (mine && !b.shown) box.appendChild(el('p', 'cb-quiet cb-peek__note', 'Only the one you wear is shown here. Show my avatars on the CB, in Profile, shows the rest.'));
  };

  Radio.prototype.unpeek = function () {
    if (this.pfDialog && this.pfDialog.open) this.pfDialog.close();
  };

  /* YOUR PROFILE CARD, in Profile: what it is, a way to edit it and a way to
     see it as anybody else does. Only a claimed username has one. */
  Radio.prototype.myMark = function () {
    return { base: !!this.state.base, claimed: !this.state.base && (!!this.state.claimed || claimedPass(this.state.pass)) };
  };
  Radio.prototype.loadProfileCard = function (quiet) {
    var me = this, box = this.pfBox;
    if (!quiet) {
      box.textContent = '';
      box.appendChild(el('p', 'cb-quiet', 'Looking up your card…'));
    }
    call('/cb/profile', null, me.state.pass).then(function (r) {
      if (r.status !== 200 || !r.body) {
        box.textContent = '';
        me.pfSetsBox.hidden = true;
        box.appendChild(el('p', 'cb-quiet', r.status === 401
          ? 'Since you signed on, this username has been signed off. Sign on again at the Community Center.'
          : 'Your card could not be looked up just now.'));
        return;
      }
      if (r.body.limits) me.pfLimits = r.body.limits;
      me.drawProfileCard(r.body);
    }, function () {
      box.textContent = '';
      me.pfSetsBox.hidden = true;
      box.appendChild(el('p', 'cb-quiet', 'Your card could not be looked up just now.'));
    });
  };
  Radio.prototype.drawProfileCard = function (got, told) {
    var me = this, box = this.pfBox;
    box.textContent = '';
    me.drawProfileSets(got, told);
    if (!got.claimed) {
      box.appendChild(el('p', 'cb-quiet', 'Claim your username under Account and you can fill in a profile card: a theme and a banner, a decoration round the avatar you wear, a frame round your profile and an effect over it, a face for your name, a nameplate on Who’s online, your pronouns, a few words about yourself, links to your other places and your favourite room. Whatever you fill in is shown to anybody signed on to the CB.'));
      return;
    }
    box.appendChild(el('p', null, got.profile
      ? 'Your card is what anybody signed on to the CB sees when they press your name, with everything you filled in on it.'
      : 'Your card has nothing on it yet. Whatever you fill in is shown to anybody signed on to the CB when they press your name; a part left empty shows nothing.'));
    var row = el('p', 'cb-acct__row');
    var edit = el('button', 'cb-btn', 'Edit my profile card');
    edit.type = 'button';
    edit.dataset.at = 'pf-edit';
    edit.setAttribute('aria-haspopup', 'dialog');
    edit.addEventListener('click', function () { me.pfEdit(edit); });
    var see = el('button', 'cb-btn', 'See my card as others do');
    see.type = 'button';
    see.setAttribute('aria-haspopup', 'dialog');
    see.addEventListener('click', function () { me.peek(me.state.handle, see, me.myMark()); });
    row.appendChild(edit);
    row.appendChild(see);
    box.appendChild(row);
  };

  /* YOUR PROFILE SETS: each one a button with its name, a strip of its
     banner in its own theme's colours (a picture, so a screen reader hears its
     words instead), what it holds in words, and which one your card is wearing,
     which the server works out by comparing and nothing records. Pressing one
     wears it at once. Change it folds away under it: Update puts your card as
     it is into it, Rename, and Delete, which asks once more, as Update does.
     The answer to a press goes under that set, where the hand is. */
  var PF_LOOK_SAID = [['theme', ' theme'], ['banner', ' banner'], ['decoration', ' decoration'], ['frame', ' frame'], ['effect', ' effect'], ['face', ''], ['plate', ' nameplate']];
  function pfSetWords(x) {
    var LP = window.loveProfile, names = {};
    ((window.loveCall && window.loveCall.schemes) || []).forEach(function (sc) { names[sc[0]] = sc[1]; });
    function named(list, k) { for (var i = 0; i < list.length; i++) if (list[i][0] === k) return list[i][1]; return k; }
    var l = x.look || {}, parts = [];
    PF_LOOK_SAID.forEach(function (w) {
      var k = l[w[0]];
      if (!k) return;
      var n = w[0] === 'decoration' ? named(LP.DECORATIONS, k) : w[0] === 'frame' ? named(LP.FRAMES, k)
        : w[0] === 'effect' ? named(LP.EFFECTS, k) : w[0] === 'face' ? 'your name in ' + k : (names[k] || k);
      parts.push(n + w[1]);
    });
    var t = parts.length
      ? parts.slice(0, -1).join(', ') + (parts.length > 1 ? ' and ' : '') + parts[parts.length - 1] + '.'
      : 'A plain card: no theme, and nothing drawn on it.';
    t = t.charAt(0).toUpperCase() + t.slice(1);
    return t + ' ' + (x.avatarGone ? 'Its avatar has been deleted, so wearing it leaves the one you wear.'
      : x.avatar ? (x.avatarName ? 'Wears ' + x.avatarName + '.' : 'Wears one of your avatars, not named.')
      : 'Wears no avatar.');
  }

  Radio.prototype.drawProfileSets = function (got, told) {
    var me = this, box = this.pfSetsBox;
    box.textContent = '';
    box.hidden = !got || !got.claimed;
    if (box.hidden) return;
    var head = el('p', 'cb-pets__h', 'Your profile sets');
    head.tabIndex = -1;
    box.appendChild(head);
    box.appendChild(el('p', 'cb-pfsets__about', 'A set keeps your card\u2019s look under a name: its theme, banner, decoration, frame, effect, name face and nameplate, and the avatar you wear. Press one to wear it, and your card changes at once for everybody who opens it. Your pronouns, your words, your links and your favourite room are not in a set, so they stay as they are whichever you wear. Nobody else sees your sets.'));
    var sets = got.sets || [], focus = null;
    var state = el('p', 'cb-quiet', '');
    state.setAttribute('role', 'status');
    if (!sets.length) state.textContent = 'No sets yet. Get your card looking the way you want it, then save it as a set below.';
    box.appendChild(state);
    var list = el('ul', 'cb-pfsets');
    list.hidden = !sets.length;
    box.appendChild(list);
    withProfile(function () {
      sets.forEach(function (x) {
        var li = el('li', 'cb-pfset' + (x.on ? ' cb-pfset--on' : ''));
        var wear = el('button', 'cb-btn cb-pfset__wear');
        wear.type = 'button';
        var sw = el('span', 'cb-pfset__swatch');
        sw.setAttribute('aria-hidden', 'true');
        wear.appendChild(sw);
        wear.appendChild(el('span', 'cb-pfset__name', x.name));
        if (x.on) wear.appendChild(el('span', 'cb-pfset__on', 'On your card now'));
        li.appendChild(wear);
        var l = x.look || {};
        if (!window.loveProfile.drawing(sw, l.banner || l.plate)) {
          // No drawing: a strip in the theme's own case and amber, or none.
          sw.hidden = !l.theme;
          if (l.theme) { window.loveProfile.dress(sw, l.theme); sw.classList.add('cb-pfset__swatch--plain'); }
        }
        var words = el('div', 'cb-pfset__words');
        var what = el('p', 'cb-pfset__what', pfSetWords(x));
        what.id = 'cb-pfset-what-' + x.id;
        wear.setAttribute('aria-describedby', what.id);
        words.appendChild(what);
        var said = el('p', 'cb-quiet', '');
        said.setAttribute('role', 'status');
        var more = el('details', 'cb-pfset__more');
        var sum = el('summary', null, 'Change ' + x.name);
        more.appendChild(sum);
        var row = el('div', 'cb-acct__row');
        var upd = el('button', 'cb-btn', 'Update it to my card as it is'); upd.type = 'button';
        var ren = el('button', 'cb-btn', 'Rename it'); ren.type = 'button';
        var del = el('button', 'cb-btn', 'Delete it'); del.type = 'button';
        row.appendChild(upd); row.appendChild(ren); row.appendChild(del);
        more.appendChild(row);
        function ask(sentence, yesSaid, noSaid, go) {
          var sure = el('div', 'cb-forget-sure'); sure.hidden = true;
          sure.appendChild(el('p', null, sentence));
          var yes = el('button', 'cb-btn', yesSaid); yes.type = 'button';
          var no = el('button', 'cb-btn', noSaid); no.type = 'button';
          sure.appendChild(yes); sure.appendChild(no);
          more.appendChild(sure);
          no.addEventListener('click', function () { sure.hidden = true; row.hidden = false; sum.focus(); });
          yes.addEventListener('click', function () { yes.disabled = true; go(function () { yes.disabled = false; }); });
          return function () { sure.hidden = false; row.hidden = true; no.focus(); };
        }
        var askUpd = ask('This puts your card as it is now, and the avatar you wear, into ' + x.name + ', in place of what it held.', 'Yes, update ' + x.name, 'Keep it as it was', function (done) {
          me.pfSetSend({ setUpdate: x.id }, said, { id: x.id, at: 'more', said: x.name + ' holds your card as it is now.' }).then(done);
        });
        var askDel = ask('This deletes the set ' + x.name + '. Your card stays as it is.', 'Yes, delete ' + x.name, 'Keep it', function (done) {
          me.pfSetSend({ setRemove: x.id }, said, { said: 'Deleted ' + x.name + '. Your card stays as it is.' }).then(done);
        });
        upd.addEventListener('click', askUpd);
        del.addEventListener('click', askDel);
        var form = el('div', 'cb-acct__form'); form.hidden = true;
        more.appendChild(form);
        ren.addEventListener('click', function () {
          form.textContent = ''; form.hidden = false; row.hidden = true;
          var n = field('A new name for ' + x.name, 'cb-pfset-name-' + x.id, 'text');
          n.input.maxLength = (me.pfLimits && me.pfLimits.setName) || 24; n.input.value = x.name;
          form.appendChild(n.wrap);
          var go = el('button', 'cb-btn', 'Rename it'); go.type = 'button';
          var keep = el('button', 'cb-btn', 'Leave its name'); keep.type = 'button';
          form.appendChild(go); form.appendChild(keep);
          n.input.focus();
          n.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); go.click(); } });
          keep.addEventListener('click', function () { form.hidden = true; row.hidden = false; ren.focus(); });
          go.addEventListener('click', function () {
            go.disabled = true;
            me.pfSetSend({ setRename: x.id, name: n.input.value }, said, { id: x.id, at: 'more', said: 'Renamed it.' }).then(function () { go.disabled = false; });
          });
        });
        words.appendChild(more);
        words.appendChild(said);
        li.appendChild(words);
        list.appendChild(li);
        wear.addEventListener('click', function () {
          wear.disabled = true;
          me.pfSetSend({ setWear: x.id }, said, { id: x.id, at: 'wear', wore: true, name: x.name }).then(function () { wear.disabled = false; });
        });
        if (told && told.id === x.id) {
          said.textContent = told.said;
          if (told.at === 'more') { more.open = true; focus = sum; } else focus = wear;
        }
      });
      if (told && !focus && told.said) { state.textContent = told.said; focus = head; }
      if (focus) focus.focus();
    });

    // A new set, out of the card as it is.
    var form = el('form', 'cb-pfsets__new');
    form.noValidate = true;
    var n = field('Save your card as it is now as a new set, named', 'cb-pfset-new', 'text');
    n.input.maxLength = (me.pfLimits && me.pfLimits.setName) || 24;
    form.appendChild(n.wrap);
    form.appendChild(el('p', 'cb-hint', 'A set takes your card as you last saved it with Edit my profile card, and the avatar you wear.'));
    var go = el('button', 'cb-btn', 'Save as a set'); go.type = 'submit';
    form.appendChild(go);
    var newSaid = el('p', 'cb-quiet', '');
    newSaid.setAttribute('role', 'status');
    form.appendChild(newSaid);
    if (told && told.saved) { newSaid.textContent = told.saved; n.input.focus(); }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = n.input.value.trim();
      go.disabled = true;
      me.pfSetSend({ setSave: name }, newSaid, { saved: 'Saved your card as ' + name + '. Press it any time to wear it again.' }).then(function () { go.disabled = false; });
    });
    box.appendChild(form);
  };

  /* Every press on a set goes through here, and the tray is drawn again from
     the answer, which carries the card, the sets and the avatar worn. */
  Radio.prototype.pfSetSend = function (send, said, told) {
    var me = this;
    return call('/cb/profile', { body: send }, me.state.pass).then(function (r) {
      if (r.status === 401) { me.lost(); return false; }
      if (r.status !== 200 || !r.body) { said.textContent = (r.body && typeof r.body.error === 'string') ? r.body.error : 'That did not work just now. Nothing changed.'; return false; }
      if (told.wore) {
        told.said = 'Wearing ' + told.name + '. Your card has its look now, and your words are as they were.'
          + (r.body.avatarGone ? ' Its avatar has been deleted, so you are still wearing the one you wore.' : '');
        if (me.pfShown('avatars')) me.loadAvatars();
      }
      me.drawProfileCard(r.body, told);
      return true;
    }, function () { said.textContent = 'The street could not be reached just now. Nothing changed.'; return false; });
  };

  /* EDITING IT, in the same window a profile opens in: the choices on the
     left, in your radio's own clothes, and the card drawn beside them in the
     theme you are choosing, again after every change, with your nameplate as
     Who's online would show it. Nothing is kept until Save my card; Cancel,
     Escape or a press outside leaves the card as it was, and asks first when
     anything has changed since it was opened or last saved (pfGuard). */
  var PF_GROUPS = [['every', 'Everyday'], ['radio', 'Radio faceplates'], ['world', 'Worlds'], ['skin', 'Winamp skins'], ['geo', 'GeoCities pages'], ['game', 'Ryan’s favourite games']];
  function pfField(form, label, id, input, hint) {
    var wrap = el('div', 'pf-field');
    var lab = el('label', 'cb-lab', label);
    lab.htmlFor = id;
    input.id = id;
    wrap.appendChild(lab);
    wrap.appendChild(input);
    if (hint) {
      var h = el('p', 'cb-hint pf-hint', hint);
      h.id = id + '-hint';
      input.setAttribute('aria-describedby', h.id);
      wrap.appendChild(h);
    }
    form.appendChild(wrap);
    return input;
  }
  function pfSelect(options, none) {
    var s = el('select', 'cb-say pf-select');
    if (none) { var o = el('option', null, none); o.value = ''; s.appendChild(o); }
    options.forEach(function (x) {
      if (x.group) {
        var g = el('optgroup');
        g.label = x.group;
        x.options.forEach(function (y) { var o = el('option', null, y[1]); o.value = y[0]; g.appendChild(o); });
        if (x.options.length) s.appendChild(g);
        return;
      }
      var o = el('option', null, x[1]);
      o.value = x[0];
      s.appendChild(o);
    });
    return s;
  }

  /* A page showing cards, the community directory, hears that one was saved or
     cleared, here or from the radio's own window, and asks again. */
  function profileSaved() {
    [document, streetDoc()].forEach(function (d, i) {
      if (!d || (i && d === document)) return;
      try { d.dispatchEvent(new d.defaultView.CustomEvent('love-profile-saved')); } catch (e) { /* an old browser, or a window gone */ }
    });
  }

  Radio.prototype.pfEdit = function (from) {
    var me = this;
    this.peekFrom = from;
    this.peekAt = 'pf-edit';
    var peekN = this.peekN = (this.peekN || 0) + 1;
    this.loadRooms();
    withProfile(function () {
      if (peekN !== me.peekN) return;
      Promise.all([call('/cb/profile', null, me.state.pass), call('/cb/avatars', null, me.state.pass), me.roomsReady || null]).then(function (rs) {
        if (peekN !== me.peekN) return;
        if (rs[0].status === 401) return me.lost();
        if (rs[0].status !== 200 || !rs[0].body || !rs[0].body.claimed) { me.acctSay('Your card could not be opened just now.'); return; }
        me.pfEditor(rs[0].body, rs[1].status === 200 ? rs[1].body : null, peekN);
      }, function () { me.acctSay('Your card could not be opened just now.'); });
    });
  };

  Radio.prototype.pfEditor = function (got, avs, peekN) {
    var me = this, LP = window.loveProfile, lc = window.loveCall;
    var keys = got.keys, lim = got.limits;
    var worn = avs && avs.wearing ? (avs.avatars || []).filter(function (a) { return a.id === avs.wearing; })[0] : null;
    var wearing = worn ? { look: worn.look, about: worn.about || '' } : null;
    var p0 = got.profile || {};
    var d = me.pfMake();
    d.setAttribute('aria-labelledby', 'pf-edit-h');
    var sheet = el('div', 'pf-sheet pf-sheet--edit');
    var form = el('form', 'pf-editor');
    form.noValidate = true;
    var h = el('h2', 'pf-edit__h', 'Your profile card');
    h.id = 'pf-edit-h';
    h.tabIndex = -1;
    form.appendChild(h);
    form.appendChild(el('p', 'cb-hint', 'Whatever you fill in is shown to anybody signed on to the CB when they press your name. A part left empty shows nothing, and nothing says when you joined. Nothing is kept until you press Save my card.'));

    var names = {};
    ((lc && lc.schemes) || []).forEach(function (x) { names[x[0]] = x[1]; });
    function grouped(list) {
      return PF_GROUPS.map(function (g) {
        return { group: g[1], options: ((lc && lc.schemes) || []).filter(function (x) { return x[2] === g[0] && list.indexOf(x[0]) >= 0; }).map(function (x) { return [x[0], x[1]]; }) };
      });
    }
    form.appendChild(el('h3', 'pf-edit__sub', 'Theme and banner'));
    var fTheme = pfField(form, 'Theme', 'pf-theme', pfSelect(grouped(keys.themes), 'None: everybody sees it in their own radio’s theme'),
      'The CB’s themes, every one with colours that clear 4.5 to 1.');
    var fBanner = pfField(form, 'Banner', 'pf-banner', pfSelect(grouped(keys.banners), 'None'),
      'A theme’s drawing, along the top of your card on its own theme’s colours. It moves where the radio’s drawings do.');
    form.appendChild(el('h3', 'pf-edit__sub', 'Avatar decoration'));
    var fDeco = pfField(form, 'Decoration', 'pf-deco', pfSelect(LP.DECORATIONS.filter(function (x) { return keys.decorations.indexOf(x[0]) >= 0; }), 'None'),
      wearing ? 'Drawn round the avatar you wear, in your card’s colours.' : 'Drawn round the avatar you wear, in your card’s colours. You are not wearing one: Your avatars, in Profile, is where you wear one.');
    form.appendChild(el('h3', 'pf-edit__sub', 'Frame and effect'));
    var fFrame = pfField(form, 'Frame', 'pf-frame', pfSelect(LP.FRAMES.filter(function (x) { return (keys.frames || []).indexOf(x[0]) >= 0; }), 'None'),
      'A band of your card’s theme round all four sides of your profile, outside it. It moves where the radio’s drawings do.');
    var fEffect = pfField(form, 'Effect', 'pf-effect', pfSelect(LP.EFFECTS.filter(function (x) { return (keys.effects || []).indexOf(x[0]) >= 0; }), 'None'),
      'Drawn over your profile in your card’s colours, or in a room’s own for an effect after one. Part of it stays along the edges and in the banner; the rest crosses the whole profile, words and all, from time to time, only for people whose radio is at MAX GLITTER or set to Let my theme move. For everybody else it stays at the edges, still.');
    // An effect after somebody's work says whose, here and on the card.
    var fxCredit = el('p', 'cb-hint pf-hint');
    fxCredit.hidden = true;
    form.appendChild(fxCredit);
    form.appendChild(el('h3', 'pf-edit__sub', 'Name style'));
    var fFace = pfField(form, 'Face for your name', 'pf-face', pfSelect(LP.FACES.filter(function (x) { return keys.faces.indexOf(x[0]) >= 0; }).map(function (x, i) {
      return [i ? x[0] : '', i ? x[0] : 'Plain (' + x[0] + ')'];
    })), 'One of the street’s typefaces. It sets your name on your card and nothing else.');
    form.appendChild(el('h3', 'pf-edit__sub', 'Nameplate'));
    var fPlate = pfField(form, 'Nameplate', 'pf-plate', pfSelect(grouped(keys.banners), 'None'),
      'A strip of a theme’s drawing under your name on Who’s online.');
    form.appendChild(el('h3', 'pf-edit__sub', 'In your own words'));
    var pr = el('input', 'cb-say');
    pr.type = 'text'; pr.maxLength = lim.pronouns; pr.autocomplete = 'off';
    var fPron = pfField(form, 'Pronouns', 'pf-pron', pr, 'Up to ' + lim.pronouns + ' characters, as you write them.');
    var tg = el('input', 'cb-say');
    tg.type = 'text'; tg.maxLength = lim.tagline || 100; tg.autocomplete = 'off';
    var fTag = pfField(form, 'Tagline', 'pf-tagline', tg, 'One line of your own under your name, on your card and in the community directory if you are in it. Up to ' + (lim.tagline || 100) + ' characters.');
    var bio = el('textarea', 'cb-say pf-bio-in');
    bio.rows = 5; bio.maxLength = lim.bio;
    var fBio = pfField(form, 'About you', 'pf-bio', bio, 'Up to ' + lim.bio + ' characters. Markdown works as it does on the channel.');
    form.appendChild(el('h3', 'pf-edit__sub', 'Elsewhere'));
    var linkIns = [];
    for (var i = 0; i < lim.links; i++) {
      var li = el('input', 'cb-say');
      li.type = 'url'; li.maxLength = lim.link; li.autocomplete = 'off'; li.spellcheck = false;
      linkIns.push(pfField(form, 'Link ' + (i + 1), 'pf-link-' + i, li, i ? null : 'Each starts with https:// and is shown as you type it, with its site after it, so nobody is sent somewhere it does not say.'));
    }
    form.appendChild(el('h3', 'pf-edit__sub', 'Favourite room'));
    var fRoom = pfField(form, 'Your favourite room on the street', 'pf-room', pfSelect((streetRooms || []).map(function (r) { return [r.tag, r.name]; }), 'None'));
    var why = el('input', 'cb-say');
    why.type = 'text'; why.maxLength = lim.why; why.autocomplete = 'off';
    var fWhy = pfField(form, 'Why it is your favourite', 'pf-why', why, 'Up to ' + lim.why + ' characters.');
    /* THE COMMUNITY DIRECTORY (Ryan's ask, 2026-10-23): off until ticked, and
       saved with the card, so nothing is listed before Save my card. */
    form.appendChild(el('h3', 'pf-edit__sub', 'Community directory'));
    var dirWrap = el('div', 'pf-field');
    var dirLab = el('label', 'pf-check');
    var fListed = el('input');
    fListed.type = 'checkbox';
    fListed.id = 'pf-listed';
    dirLab.appendChild(fListed);
    dirLab.appendChild(el('span', null, 'Show my profile in the community directory'));
    dirWrap.appendChild(dirLab);
    var dirHint = el('p', 'cb-hint pf-hint');
    dirHint.id = 'pf-listed-hint';
    dirHint.appendChild(document.createTextNode('The directory lists everybody who has ticked this, for anybody signed on to the CB: your username, your nameplate, your tagline, your pronouns and the avatar you wear, and your name there opens this card. Nothing in it says when anybody joined, and nothing counts anybody. '));
    var dirA = el('a', null, 'The community directory');
    dirA.href = '/directory.html';
    dirHint.appendChild(dirA);
    dirHint.appendChild(document.createTextNode('.'));
    fListed.setAttribute('aria-describedby', dirHint.id);
    dirWrap.appendChild(dirHint);
    form.appendChild(dirWrap);

    fTheme.value = p0.theme || ''; fBanner.value = p0.banner || ''; fDeco.value = p0.decoration || '';
    fFrame.value = p0.frame || ''; fEffect.value = p0.effect || '';
    fFace.value = p0.face || ''; fPlate.value = p0.plate || ''; fPron.value = p0.pronouns || '';
    fTag.value = p0.tagline || ''; fListed.checked = !!p0.listed;
    fBio.value = p0.bio || ''; fRoom.value = p0.room || ''; fWhy.value = p0.why || '';
    (p0.links || []).forEach(function (l, j) { if (linkIns[j]) linkIns[j].value = l; });

    var row = el('div', 'cb-acct__row pf-edit__row');
    var save = el('button', 'cb-btn', 'Save my card');
    save.type = 'submit';
    var cancel = el('button', 'cb-btn', 'Cancel');
    cancel.type = 'button';
    var clear = el('button', 'cb-btn', 'Clear my card');
    clear.type = 'button';
    row.appendChild(save); row.appendChild(cancel); row.appendChild(clear);
    form.appendChild(row);
    var sure = el('div', 'cb-acct__row');
    sure.hidden = true;
    sure.appendChild(el('p', null, 'This clears everything on your card, takes your nameplate off Who’s online and takes you out of the community directory. Your profile sets, avatars, pets, jobs and jacket stay as they are.'));
    var yes = el('button', 'cb-btn', 'Yes, clear my card'); yes.type = 'button';
    var keep = el('button', 'cb-btn', 'Keep it'); keep.type = 'button';
    sure.appendChild(yes); sure.appendChild(keep);
    form.appendChild(sure);
    // Leaving with changes nobody has saved: asked, never decided for you.
    var leave = el('div', 'cb-acct__row pf-leave');
    leave.hidden = true;
    leave.setAttribute('role', 'group');
    var leaveSaid = el('p', null, 'Your card has changes you have not saved.');
    leaveSaid.id = 'pf-leave-said';
    leave.setAttribute('aria-labelledby', 'pf-leave-said');
    var leaveSave = el('button', 'cb-btn', 'Save and close'); leaveSave.type = 'button';
    var leaveGo = el('button', 'cb-btn', 'Close without saving'); leaveGo.type = 'button';
    var leaveStay = el('button', 'cb-btn', 'Keep editing'); leaveStay.type = 'button';
    leave.appendChild(leaveSaid);
    leave.appendChild(leaveSave); leave.appendChild(leaveGo); leave.appendChild(leaveStay);
    form.appendChild(leave);
    var said = el('p', 'cb-said');
    said.setAttribute('role', 'status');
    form.appendChild(said);

    var prev = el('div', 'pf-preview');
    prev.appendChild(el('h3', 'pf-edit__sub', 'As others see it'));
    // A picture of your choices, and nothing in it to press or to hear twice:
    // the form says everything it shows.
    var cardAt = el('div', 'pf-preview__card');
    cardAt.inert = true;
    prev.appendChild(cardAt);
    prev.appendChild(el('h3', 'pf-edit__sub', 'On Who’s online'));
    var sample = el('div', 'pf-preview__online cb-online-row');
    sample.inert = true;
    prev.appendChild(sample);
    var dirHead = el('h3', 'pf-edit__sub', 'In the community directory');
    var dirSample = el('div', 'pf-preview__dir');
    dirSample.inert = true;
    prev.appendChild(dirHead);
    prev.appendChild(dirSample);
    prev.appendChild(el('p', 'cb-hint', 'The card here is a picture of your choices; press your name on Who’s online, or See my card as others do, in Profile, for the card itself.'));

    sheet.appendChild(form);
    sheet.appendChild(prev);
    d.appendChild(sheet);

    function current() {
      return {
        theme: fTheme.value, banner: fBanner.value, decoration: fDeco.value, frame: fFrame.value, effect: fEffect.value, face: fFace.value, plate: fPlate.value,
        pronouns: fPron.value.trim(), tagline: fTag.value.trim(), bio: fBio.value, room: fRoom.value, why: fRoom.value ? fWhy.value.trim() : '',
        links: linkIns.map(function (x) { return x.value.trim(); }).filter(Boolean), listed: fListed.checked,
      };
    }
    // What the card was when it was opened or last saved: anything else is a
    // change nobody has saved.
    var saved = JSON.stringify(current());
    function dirty() { return JSON.stringify(current()) !== saved; }
    me.pfGuard = function () {
      if (!dirty()) return false;
      leave.hidden = false;
      sure.hidden = true; clear.hidden = false;
      leave.scrollIntoView({ block: 'nearest' });
      leaveSave.focus();
      return true;
    };
    var drawn = '', timer = null;
    function redraw() {
      timer = null;
      var p = current(), k = JSON.stringify(p);
      if (k === drawn) return;
      drawn = k;
      // Only the card is drawn again: the frame and effect round it stay as they
      // are unless they changed, so typing a bio does not start an effect over.
      var was = cardAt.querySelector(':scope > .pf-card');
      if (was) cardAt.removeChild(was);
      var card = LP.card(p, { handle: me.state.handle, mark: me.myMark(), mine: true, wearing: wearing, nameId: 'pf-preview-name', md: md, links: pfLink, room: pfRoom });
      card.pfName.removeAttribute('tabindex');
      cardAt.appendChild(card);
      LP.drawCard(card, p);
      LP.surround(cardAt, p);
      sample.textContent = '';
      if (wearing) sample.appendChild(avatarArt(wearing.look, '', 'cb-online-face', 'bust'));
      sample.appendChild(el('b', null, me.state.handle));
      var mk = me.myMark();
      if (mk.base) sample.appendChild(el('span', 'cb-tag', 'BASE'));
      sample.appendChild(document.createTextNode(' in ' + (p.room && byTag[p.room] ? byTag[p.room].name : 'a room')));
      var plate = el('div', 'pf-plate');
      plate.setAttribute('aria-hidden', 'true');
      sample.appendChild(plate);
      LP.drawing(plate, p.plate);
      dirHead.hidden = dirSample.hidden = !p.listed;
      dirSample.textContent = '';
      if (p.listed) {
        var line = LP.listing({ handle: me.state.handle, base: mk.base, tagline: p.tagline, pronouns: p.pronouns, avatar: wearing });
        dirSample.appendChild(line);
        LP.drawing(line.pfPlate, p.plate);
      }
      fWhy.disabled = !fRoom.value;
      var credit = LP.effectCredit ? LP.effectCredit(p.effect) : '';
      fxCredit.textContent = credit;
      fxCredit.hidden = !credit;
    }
    function soon() { if (!timer) timer = setTimeout(redraw, 120); }
    form.addEventListener('input', soon);
    form.addEventListener('change', soon);
    cancel.addEventListener('click', function () { if (!me.pfGuard()) d.close(); });
    leaveGo.addEventListener('click', function () { saved = JSON.stringify(current()); d.close(); });
    leaveStay.addEventListener('click', function () { leave.hidden = true; h.focus(); });
    leaveSave.addEventListener('click', function () { saveCard(function () { d.close(); }); });
    clear.addEventListener('click', function () { sure.hidden = false; clear.hidden = true; keep.focus(); });
    keep.addEventListener('click', function () { sure.hidden = true; clear.hidden = false; clear.focus(); });
    yes.addEventListener('click', function () {
      yes.disabled = true;
      call('/cb/profile', { body: { clear: true } }, me.state.pass).then(function (r) {
        yes.disabled = false;
        if (r.status === 401) { d.close(); return me.lost(); }
        if (r.status !== 200) { said.textContent = (r.body && r.body.error) || 'That did not work just now. Nothing changed.'; return; }
        [fTheme, fBanner, fDeco, fFrame, fEffect, fFace, fPlate, fPron, fTag, fBio, fRoom, fWhy].concat(linkIns).forEach(function (x) { x.value = ''; });
        fListed.checked = false;
        sure.hidden = true; clear.hidden = false; leave.hidden = true;
        saved = JSON.stringify(current());
        redraw();
        said.textContent = 'Cleared. Your card has nothing on it, your nameplate is off Who’s online, and you are not in the community directory.';
        clear.focus();
        me.loadProfileCard();
        profileSaved();
      }, function () { yes.disabled = false; said.textContent = 'The street could not be reached just now. Nothing changed.'; });
    });
    // Save, and then, if asked, close: a save that does not go through keeps
    // the editor open with the changes still in it, and says why.
    function saveCard(then) {
      var sending = current(), was = JSON.stringify(sending);
      save.disabled = true; leaveSave.disabled = true;
      said.textContent = 'Saving…';
      call('/cb/profile', { body: { profile: sending } }, me.state.pass).then(function (r) {
        save.disabled = false; leaveSave.disabled = false;
        if (r.status === 401) { saved = JSON.stringify(current()); d.close(); return me.lost(); }
        if (r.status !== 200) { said.textContent = (r.body && r.body.error) || 'That did not work just now. Nothing changed.'; return; }
        saved = was;
        leave.hidden = true;
        said.textContent = !r.body.profile
          ? 'Saved, with nothing on it, so your card is empty, and you are not in the community directory.'
          : r.body.profile.listed
            ? 'Saved. Anybody signed on to the CB sees it when they press your name, and you are in the community directory.'
            : 'Saved. Anybody signed on to the CB sees it when they press your name. You are not in the community directory.';
        me.loadProfileCard();
        profileSaved();
        if (then) then();
      }, function () { save.disabled = false; leaveSave.disabled = false; said.textContent = 'The street could not be reached just now. Nothing changed.'; });
    }
    form.addEventListener('submit', function (e) { e.preventDefault(); saveCard(null); });
    if (!d.open) d.showModal();
    h.focus();
    redraw();
  };

  /* THE STICKER PICKER: your pets, each a button that sends a sticker of them
     to the channel you are tuned to, straight away. Whatever is in the box
     stays there. */
  /* `where` is 'dm' for the tray under a conversation's box (Ryan's ask,
     2026-10-20), and the channel's otherwise; one tray is open at a time, and
     sendSticker sends to whichever it was opened for. */
  Radio.prototype.setStickers = function (open, where) {
    var me = this, dm = where === 'dm';
    var box = dm ? this.dmStickBox : this.stickBox, btn = dm ? this.dmStickBtn : this.stickBtn;
    var other = dm ? this.stickBox : this.dmStickBox;
    if (open && other && !other.hidden) { other.hidden = true; other.textContent = ''; (dm ? this.stickBtn : this.dmStickBtn).setAttribute('aria-expanded', 'false'); }
    this.stickTo = dm ? 'dm' : 'channel';
    box.hidden = !open;
    btn.setAttribute('aria-expanded', String(!!open));
    if (!open) { box.textContent = ''; return; }
    box.textContent = '';
    /* YOUR AVATARS FIRST, then your pets: each a button that sends a sticker
       of it to the channel you are tuned to, straight away. */
    var avSaid = el('p', 'cb-quiet', 'Fetching your avatars\u2026');
    avSaid.setAttribute('role', 'status');
    box.appendChild(avSaid);
    withAvatar(function () {
      call('/cb/avatars', null, me.state.pass).then(function (r) {
        if (r.status === 401) return me.lost();
        if (r.status !== 200 || !r.body.avatars) { avSaid.textContent = 'Your avatars could not be fetched just now.'; return; }
        if (!r.body.avatars.length) {
          avSaid.textContent = 'No avatars yet. Make one at the ';
          var bth = el('a', null, 'Bodymind Booth'); bth.href = '/bodymind-booth.html';
          avSaid.appendChild(bth); avSaid.appendChild(document.createTextNode('.'));
          return;
        }
        avSaid.textContent = 'Press an avatar to send a sticker of it.';
        var ul = el('ul', 'cb-stickers__list');
        r.body.avatars.slice().reverse().forEach(function (a) {
          var li = el('li');
          var b = el('button', 'cb-stickers__pick');
          b.type = 'button';
          var art = window.loveAvatar.draw(a.look, { ground: true, cls: 'cb-stickers__art' });
          if (art) b.appendChild(art);
          b.appendChild(el('span', null, 'Send ' + (a.name || 'this avatar')));
          b.addEventListener('click', function () { me.sendSticker(a.id, 'avatar'); });
          li.appendChild(b);
          ul.appendChild(li);
        });
        avSaid.after(ul);
        var first = ul.querySelector('button');
        if (first) first.focus();
      }, function () { avSaid.textContent = 'Your avatars could not be fetched just now.'; });
    });
    /* YOUR CHIMERAS next, each a button that sends a sticker of it. */
    var chSaid = el('p', 'cb-quiet', 'Fetching your chimeras\u2026');
    chSaid.setAttribute('role', 'status');
    box.appendChild(chSaid);
    withChimera(function () {
      call('/cb/chimeras', null, me.state.pass).then(function (r) {
        if (r.status === 401) return me.lost();
        if (r.status !== 200 || !r.body.chimeras) { chSaid.textContent = 'Your chimeras could not be fetched just now.'; return; }
        if (!r.body.chimeras.length) {
          chSaid.textContent = 'No chimeras yet. Make one in ';
          var room = el('a', null, 'Chimera Obscura'); room.href = '/chimera-obscura.html';
          chSaid.appendChild(room); chSaid.appendChild(document.createTextNode('.'));
          return;
        }
        chSaid.textContent = 'Press a chimera to send a sticker of it.';
        var ul = el('ul', 'cb-stickers__list');
        r.body.chimeras.slice().reverse().forEach(function (c) {
          var li = el('li');
          var b = el('button', 'cb-stickers__pick');
          b.type = 'button';
          var art = window.loveChimera.draw(c.parts, { ground: true, cls: 'cb-stickers__art' });
          if (art) b.appendChild(art);
          b.appendChild(el('span', null, 'Send ' + (c.name || window.loveChimera.suggest(c.parts))));
          b.addEventListener('click', function () { me.sendSticker(c.id, 'chimera'); });
          li.appendChild(b);
          ul.appendChild(li);
        });
        chSaid.after(ul);
      }, function () { chSaid.textContent = 'Your chimeras could not be fetched just now.'; });
    });
    var said = el('p', 'cb-quiet', 'Fetching your pets\u2026');
    said.setAttribute('role', 'status');
    box.appendChild(said);
    withAnimals(function () {
      call('/cb/pets', null, me.state.pass).then(function (r) {
        if (r.status === 401) return me.lost();
        if (r.status !== 200 || !r.body.pets) { said.textContent = 'Your pets could not be fetched just now.'; return; }
        if (!r.body.pets.length) {
          said.textContent = 'No pets yet. Adopt one at ';
          var c = el('a', null, 'Rescue A Cat'); c.href = '/rescue-a-cat.html';
          var d = el('a', null, 'Rescue A Dog'); d.href = '/rescue-a-dog.html';
          said.appendChild(c); said.appendChild(document.createTextNode(' or ')); said.appendChild(d); said.appendChild(document.createTextNode('.'));
          return;
        }
        said.textContent = 'Press a pet to send a sticker of them.';
        var ul = el('ul', 'cb-stickers__list');
        r.body.pets.slice().reverse().forEach(function (a) {
          var li = el('li');
          var b = el('button', 'cb-stickers__pick');
          b.type = 'button';
          b.appendChild(window.loveAnimals.draw(a, 'cb-stickers__art'));
          b.appendChild(el('span', null, 'Send ' + (a.name || 'a sticker of this ' + ((a.words && a.words.noun) || (a.kind === 'dog' ? 'dog' : 'cat')))));
          b.addEventListener('click', function () { me.sendSticker(a.id); });
          li.appendChild(b);
          ul.appendChild(li);
        });
        // Under its own line, never at the end of the box: the patches below
        // were put there while this was still being fetched. And the keyboard
        // goes to the first pet only when no avatar above took it.
        var noneYet = !(avSaid.nextElementSibling && avSaid.nextElementSibling.tagName === 'UL');
        said.after(ul);
        if (noneYet) { var first = ul.querySelector('button'); if (first) first.focus(); }
      }, function () { said.textContent = 'Your pets could not be fetched just now.'; });
    });
    /* YOUR PATCHES (Ryan, 2026-10-14): each one on your battle jacket, a
       button that sends a sticker of it, drawn by patches.js. */
    var pSaid = el('p', 'cb-quiet', 'Fetching your patches\u2026');
    pSaid.setAttribute('role', 'status');
    box.appendChild(pSaid);
    withPatches(function () {
      call('/cb/patches', null, me.state.pass).then(function (r) {
        if (r.status === 401) return me.lost();
        if (r.status !== 200 || !Array.isArray(r.body.patches)) { pSaid.textContent = 'Your patches could not be fetched just now.'; return; }
        var mine = window.lovePatches.list.filter(function (p) { return r.body.patches.indexOf(p.id) >= 0; });
        if (!mine.length) { pSaid.textContent = 'No patches on your battle jacket. They lie about the street, and some are on a counter in a shop.'; return; }
        pSaid.textContent = 'Press your battle jacket, or one patch off it, to send a sticker of it.';
        var ul = el('ul', 'cb-stickers__list');
        /* YOUR WHOLE JACKET FIRST (Ryan, 2026-10-16): the server reads what is
           sewn on it when it goes, so the sticker is the jacket as it is now. */
        var jli = el('li');
        var jb = el('button', 'cb-stickers__pick');
        jb.type = 'button';
        var jart = window.lovePatches.jacket(mine.map(function (p) { return p.id; }), { cls: 'cb-stickers__art' });
        if (jart) {
          jart.removeAttribute('role');
          jart.removeAttribute('aria-label');
          jart.setAttribute('aria-hidden', 'true');
          jb.appendChild(jart);
        }
        jb.appendChild(el('span', null, 'Send your battle jacket'));
        jb.addEventListener('click', function () { me.sendSticker(null, 'jacket'); });
        jli.appendChild(jb);
        ul.appendChild(jli);
        mine.forEach(function (p) {
          var li = el('li');
          var b = el('button', 'cb-stickers__pick');
          b.type = 'button';
          var art = window.lovePatches.draw(p.id, { cls: 'cb-stickers__art cb-sticker__patch' });
          if (art) b.appendChild(art);
          b.appendChild(el('span', null, 'Send ' + p.name));
          b.addEventListener('click', function () { me.sendSticker(p.id, 'patch'); });
          li.appendChild(b);
          ul.appendChild(li);
        });
        pSaid.after(ul);
      }, function () { pSaid.textContent = 'Your patches could not be fetched just now.'; });
    });
    box.appendChild(this.footClose('Close stickers', function () { me.setStickers(false, where); }, btn));
  };

  Radio.prototype.sendSticker = function (id, kind) {
    var me = this, room = this.tunedRoom(), b = {};
    if (kind === 'jacket') b.jacket = true;
    else b[kind === 'avatar' ? 'avatar' : kind === 'chimera' ? 'chimera' : kind === 'patch' ? 'patch' : 'sticker'] = id;
    // Into a conversation, through Messages' own way of asking.
    if (this.stickTo === 'dm' && this.dmWith) {
      b.with = this.dmWith;
      b.send = '';
      this.dmTold('Sending the sticker\u2026');
      this.dmJustSent = true;
      this.dmCall(b, '').then(function (r) { if (r) { me.setStickers(false, 'dm'); me.dmStickBtn.focus(); } });
      return;
    }
    if (room) b.room = room;
    this.tell('Sending the sticker\u2026');
    call('/cb/transmit', { body: b }, this.state.pass).then(function (r) {
      if (r.status === 401) return me.lost();
      if (r.status === 200) {
        me.setStickers(false);
        me.tell('');
        me.stickBtn.focus();
        if (room === me.tunedRoom()) me.show(r.body.messages || [], true);
        return;
      }
      if (r.status === 429) { me.tell('Easy on the mic: too many in a minute. Try again shortly.'); return; }
      me.tell(why(r, 'That did not go out. Try again.'));
    }).catch(function () { me.tell('No signal. That did not go out.'); });
  };

  /* ── Reactions ─────────────────────────────────────────────────────────── */
  var REACTIONS = [
    ['\u2764\uFE0F', 'heart'], ['\u{1F44D}', 'thumbs up'], ['\u{1F602}', 'laughing'], ['\u{1F389}', 'party'],
    ['\u{1F440}', 'eyes'], ['\u2728', 'sparkles'], ['\u{1F427}', 'a penguin, for a pebble'],
    ['\u{1F436}', 'dog'], ['\u{1F431}', 'cat'], ['\u{1F9A6}', 'otter'], ['\u{1F308}', 'rainbow'],
    ['\u{1F984}', 'unicorn'], ['\u{1F918}', 'sign of the horns'], ['\u{1F994}', 'hedgehog'],
    ['\u{1F917}', 'hugging face'], ['\u{1FAC2}', 'people hugging'], ['\u{1F622}', 'crying face'],
    ['\u{1F4AF}', 'hundred points'],
  ];
  /* How to reach the system's own emoji picker, which a page cannot open: it
     types into the box under the quick row like any other keyboard. */
  var PICKER = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
    ? (/iPhone|iPad/.test(navigator.userAgent) ? 'the emoji key on your keyboard' : 'Control, Command and Space')
    : /Win/.test(navigator.platform || '') ? 'the Windows key and full stop' : /Android/.test(navigator.userAgent) ? 'the emoji key on your keyboard' : 'your system\u2019s emoji picker';
  function fold(h) { return String(h || '').normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim(); }
  function names(list) {
    if (list.length < 2) return list.join('');
    return list.slice(0, -1).join(', ') + ' and ' + list[list.length - 1];
  }

  Radio.prototype.msgLi = function (id) {
    var lis = this.log.querySelectorAll(':scope > li');
    for (var i = 0; i < lis.length; i++) if (lis[i].dataset.id === id) return lis[i];
    return null;
  };

  /* The line under a message: one button per reaction on it, the reaction
     and the handles that pressed it, alphabetical. Pressing one adds yours or
     takes it back. Drawn again only when it has changed, and the keyboard
     stays on the reaction it was on. */
  Radio.prototype.drawReactions = function (li, m, send) {
    var me = this, rx = li.querySelector(':scope > .cb-rx');
    send = send || function (e) { me.react(m.id, e); };
    if (!rx) return;
    var list = m.reactions || [];
    var key = JSON.stringify(list);
    if (rx.dataset.key === key) return;
    rx.dataset.key = key;
    var focused = rx.contains(document.activeElement) || (rx.getRootNode().activeElement && rx.contains(rx.getRootNode().activeElement));
    var on = focused && (rx.getRootNode().activeElement || document.activeElement).dataset.emoji;
    rx.textContent = '';
    rx.hidden = !list.length;
    var mine = fold(this.state.handle);
    list.forEach(function (x) {
      var yours = x.who.some(function (h) { return fold(h) === mine; });
      var b = el('button', 'cb-rx__one');
      b.type = 'button';
      b.dataset.emoji = x.emoji;
      b.setAttribute('aria-pressed', String(yours));
      b.setAttribute('aria-label', x.name + ', from ' + names(x.who) + (yours ? '. Press to take yours back.' : '. Press to add yours.'));
      var e = el('span', 'cb-rx__emoji', x.emoji); e.setAttribute('aria-hidden', 'true');
      b.appendChild(e);
      b.appendChild(el('span', 'cb-rx__who', names(x.who)));
      b.addEventListener('click', function () { send(x.emoji); });
      rx.appendChild(b);
    });
    if (on) { var again = rx.querySelector('[data-emoji="' + on + '"]'); if (again) again.focus(); }
  };

  /* React, on the message's own line: opens the set under the message. `send`
     presses one: on the channel by default, or in a conversation. */
  Radio.prototype.reactBtn = function (m, li, send) {
    var me = this;
    send = send || function (e) { me.react(m.id, e); };
    var b = el('button', 'cb-btn cb-ico cb-react');
    b.type = 'button';
    b.appendChild(msgIcon('react'));
    b.setAttribute('aria-expanded', 'false');
    b.setAttribute('aria-label', 'React to ' + m.handle + '\u2019s message ' + sentAt(m.t));
    b.addEventListener('click', function () {
      var open = li.querySelector(':scope > .cb-rx-pick');
      if (open) { open.remove(); b.setAttribute('aria-expanded', 'false'); return; }
      shutMore(li);
      var pick = el('div', 'cb-rx-pick');
      pick.setAttribute('role', 'group');
      pick.setAttribute('aria-label', 'Reactions');
      var mine = fold(me.state.handle);
      var here = {};
      var cur = li.querySelectorAll(':scope > .cb-rx [data-emoji]');
      for (var i = 0; i < cur.length; i++) here[cur[i].dataset.emoji] = cur[i].getAttribute('aria-pressed') === 'true';
      REACTIONS.forEach(function (x) {
        var p = el('button', 'cb-rx__pick', x[0]);
        p.type = 'button';
        p.setAttribute('aria-label', x[1]);
        p.setAttribute('aria-pressed', String(!!here[x[0]]));
        p.addEventListener('click', function () {
          pick.remove(); b.setAttribute('aria-expanded', 'false'); b.focus();
          send(x[0]);
        });
        pick.appendChild(p);
      });
      /* ANY OTHER EMOJI: a box the system picker can type into. One emoji,
         checked again by the server, and nothing else. */
      var other = el('span', 'cb-rx__other');
      var oid = 'cb-rx-other-' + m.id;
      var olab = el('label', 'cb-rx__olab', 'Or any emoji, with ' + PICKER + ':');
      olab.htmlFor = oid;
      var oin = el('input', 'cb-say cb-rx__in');
      oin.id = oid; oin.type = 'text'; oin.maxLength = 16; oin.autocomplete = 'off'; oin.spellcheck = false;
      oin.setAttribute('enterkeyhint', 'send');
      var ogo = el('button', 'cb-rx__pick cb-rx__go', 'React');
      ogo.type = 'button';
      function sendOther() {
        var v = oin.value.trim();
        if (!v) { oin.focus(); return; }
        pick.remove(); b.setAttribute('aria-expanded', 'false'); b.focus();
        send(v);
      }
      ogo.addEventListener('click', sendOther);
      oin.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); sendOther(); } });
      other.appendChild(olab); other.appendChild(oin); other.appendChild(ogo);
      pick.appendChild(other);
      pick.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { e.preventDefault(); pick.remove(); b.setAttribute('aria-expanded', 'false'); b.focus(); }
      });
      li.appendChild(pick);
      b.setAttribute('aria-expanded', 'true');
      pick.querySelector('button').focus();
    });
    return b;
  };

  Radio.prototype.react = function (id, emoji) {
    var me = this, room = this.tunedRoom(), b = { id: id, emoji: emoji };
    if (room) b.room = room;
    call('/cb/react', { body: b }, this.state.pass).then(function (r) {
      if (r.status === 401) return me.lost();
      if (r.body && r.body.messages && room === me.tunedRoom()) me.show(r.body.messages);
      if (r.status === 200) return;
      if (r.status === 429) { me.tell('Easy on the reactions: too many in a minute. Try again shortly.'); return; }
      me.tell(why(r, 'That reaction did not go out. Try again.'));
    }).catch(function () { me.tell('No signal. That reaction did not go out.'); });
  };

  function withAnimals(then) {
    if (window.loveAnimals) { then(); return; }
    var s = document.createElement('script');
    s.src = '/animals.js';
    s.addEventListener('load', function () { if (window.loveAnimals) then(); });
    document.head.appendChild(s);
  }

  /* THE GUILD'S LIST: every job's title and room, and every badge's name, what
     its jobs have in common, which jobs, and its drawing as paths. Written by
     tools/make-guild.py into /guild-jobs.json, fetched once, the first time a
     Profile or a profile has jobs to name, the way cb-rooms.json is. */
  var GUILD = null, guildWait = null;
  function withGuild(then) {
    if (GUILD) { then(GUILD); return; }
    if (!guildWait) {
      guildWait = call('/guild-jobs.json').then(function (r) {
        if (r.status === 200 && r.body && Array.isArray(r.body.jobs) && Array.isArray(r.body.badges)) GUILD = r.body;
        guildWait = null;
        return GUILD;
      }, function () { guildWait = null; return null; });
    }
    guildWait.then(function (g) { then(g); });
  }

  /* THE RADIO'S ICON (Ryan, 2026-10-19): a CB set, for the radio's smallest
     size. A case with its readout and its knob, the aerial up out of the top,
     and the handset on its coiled cord, which is what makes a CB a CB rather
     than a radio you listen to. The readout says 19, the channel the bar used
     to say before the teleporter took its place. Drawn in the radio's own
     steel on its own case, the readout in its own amber on its own glass, so
     every scheme's icon is that scheme's, in pairs check-contrast.py holds.
     aria-hidden: the button carries its name. */
  function radioIcon() {
    var svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('viewBox', '0 0 32 32');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('class', 'cb-opener__art');
    function add(tag, at) {
      var e = document.createElementNS(SVGNS, tag);
      for (var k in at) e.setAttribute(k, at[k]);
      svg.appendChild(e);
      return e;
    }
    var line = { fill: 'none', stroke: 'currentColor', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
    function stroke(at, w) { var o = {}; for (var k in line) o[k] = line[k]; for (k in at) o[k] = at[k]; o['stroke-width'] = w; return o; }
    add('path', stroke({ d: 'M23.5 9.5L27 2.8' }, '2'));
    add('circle', { cx: '27', cy: '2.8', r: '1.7', fill: 'currentColor' });
    add('rect', stroke({ x: '2', y: '9.5', width: '28', height: '12.5', rx: '3' }, '2'));
    add('rect', { class: 'cb-opener__glass', x: '5', y: '12.5', width: '12', height: '6.5', rx: '1.2', stroke: 'currentColor', 'stroke-width': '1.4' });
    add('path', { class: 'cb-opener__lit', d: 'M8.9 14.3v3.1M11.6 15.85v-1.55h2.8v3.1h-2.8M11.6 15.85h2.8', fill: 'none', 'stroke-width': '1.3', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' });
    add('circle', stroke({ cx: '23.5', cy: '15.75', r: '3.4' }, '1.8'));
    add('path', stroke({ d: 'M23.5 15.75V13.1' }, '1.6'));
    add('path', stroke({ d: 'M6.5 22c-1.6.9-1.6 1.9 0 2.6s1.6 1.8 0 2.6-1.2 2.2 1.6 2.1H12' }, '1.4'));
    add('rect', { x: '12', y: '26.2', width: '13', height: '4.8', rx: '2.4', fill: 'currentColor' });
    add('path', { class: 'cb-opener__grille', d: 'M17 28.6h5', fill: 'none', 'stroke-width': '1.2', 'stroke-linecap': 'round' });
    return svg;
  }

  /* THE BAR'S ICONS: a grip of six dots for Move, and minus and plus for the
     size, in currentColor, aria-hidden, because each button carries its name. */
  function barIcon(kind) {
    var svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('viewBox', '0 0 20 20');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('class', 'cb-icon-btn__art');
    function add(tag, at) {
      var e = document.createElementNS(SVGNS, tag);
      for (var k in at) e.setAttribute(k, at[k]);
      svg.appendChild(e);
    }
    if (kind === 'grip') {
      [6, 10, 14].forEach(function (y) { [7, 13].forEach(function (x) { add('circle', { cx: String(x), cy: String(y), r: '1.7', fill: 'currentColor' }); }); });
    } else {
      add('path', { d: kind === 'plus' ? 'M4 10H16M10 4V16' : 'M4 10H16', fill: 'none', stroke: 'currentColor', 'stroke-width': '2.6', 'stroke-linecap': 'round' });
    }
    return svg;
  }

  /* A MESSAGE'S TWO ICONS, drawn in currentColor so each takes its button's
     amber: React is a face with a plus by it, Discord's mark for adding a
     reaction, and More is three dots in a row. aria-hidden, because each
     button carries its name in words. */
  function msgIcon(kind) {
    var svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('viewBox', '0 0 20 20');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('class', 'cb-ico__art');
    function add(tag, at) {
      var e = document.createElementNS(SVGNS, tag);
      for (var k in at) e.setAttribute(k, at[k]);
      svg.appendChild(e);
    }
    if (kind === 'react') {
      var line = { fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round' };
      add('circle', Object.assign({ cx: '9', cy: '11', r: '6.5' }, line));
      add('circle', { cx: '6.6', cy: '9.4', r: '1.1', fill: 'currentColor' });
      add('circle', { cx: '11.4', cy: '9.4', r: '1.1', fill: 'currentColor' });
      add('path', Object.assign({ d: 'M5.9 12.5a3.5 3.5 0 0 0 6.2 0' }, line));
      add('path', Object.assign({ d: 'M16.5 1.2v5M14 3.7h5' }, line));
    } else if (kind === 'reply') {
      var bend = { fill: 'none', stroke: 'currentColor', 'stroke-width': '1.8', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
      add('path', Object.assign({ d: 'M8 4.5 3.5 9 8 13.5' }, bend));
      add('path', Object.assign({ d: 'M4 9h7.5a5 5 0 0 1 5 5v1.5' }, bend));
    } else {
      [4, 10, 16].forEach(function (x) { add('circle', { cx: String(x), cy: '10', r: '1.9', fill: 'currentColor' }); });
    }
    return svg;
  }

  /* A REPLY names the message it answers by id and nothing else of it
     (replyTo in lib.mjs, Ryan's ask, 2026-10-21): the quote is drawn from
     what is on the channel, or in the conversation, now, so it changes when
     that message is edited and goes when it does. Its words here are the
     start of it with the Markdown's marks taken off, since a quote is a
     reminder and not the message. */
  var RE_WORDS = 90;
  function reWords(m) {
    var t = String(m.text || '')
      .replace(/!?\[([^\]]*)\]\([^)\s]*\)/g, '$1')
      .replace(/^[ \t]{0,3}(?:#{1,6}[ \t]+|>[ \t]?|[-*+][ \t]+|\d+[.)][ \t]+)/gm, '')
      .replace(/\*\*|__|~~|[*`]/g, '')
      .replace(/\s+/g, ' ').trim();
    if (!t) return m.img ? 'a picture' : (m.sticker || m.avatar || m.chimera || m.patch || m.jacket) ? 'a sticker' : 'a message';
    var cs = Array.from(t);
    return cs.length > RE_WORDS ? cs.slice(0, RE_WORDS - 1).join('') + '\u2026' : t;
  }
  /* The bar above a message box while a reply is being written: whose message
     and its first words, and Cancel reply. The box's description names them
     too, so a screen reader hears who you are answering on the box itself. */
  function reBar(id, hint, stop) {
    var bar = el('div', 'cb-re-bar');
    bar.hidden = true;
    var line = el('p', 'cb-re-line');
    line.id = id;
    var no = el('button', 'cb-btn cb-re-no', 'Cancel reply');
    no.type = 'button';
    no.addEventListener('click', stop);
    bar.appendChild(line);
    bar.appendChild(no);
    bar.cbHint = hint;
    return bar;
  }
  function reOn(bar, say, m) {
    var line = bar.firstChild;
    line.textContent = '';
    line.appendChild(document.createTextNode('Replying to '));
    line.appendChild(el('b', null, m.handle));
    line.appendChild(document.createTextNode(': ' + reWords(m)));
    bar.hidden = false;
    say.setAttribute('aria-describedby', line.id + ' ' + bar.cbHint);
  }
  function reOff(bar, say) {
    bar.hidden = true;
    bar.firstChild.textContent = '';
    say.setAttribute('aria-describedby', bar.cbHint);
  }
  var RE_GONE = 'Replying to a message no longer on the channel';
  var RE_GONE_DM = 'Replying to a message no longer in this conversation';

  /* A badge's drawing, built path by path from the list: never from markup,
     and only out of the letters and numbers a path is made of. */
  var SVGNS = 'http://www.w3.org/2000/svg';
  function badgeArt(b, cls) {
    var svg = document.createElementNS(SVGNS, 'svg');
    svg.setAttribute('viewBox', '0 0 32 32');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('class', cls);
    (b.draw || []).forEach(function (p) {
      if (!p || typeof p[1] !== 'string' || !/^[MmLlHhVvCcSsQqTtAaZz0-9 .,\-]+$/.test(p[1])) return;
      var path = document.createElementNS(SVGNS, 'path');
      path.setAttribute('d', p[1]);
      if (p[0] === 'f') path.setAttribute('fill', 'currentColor');
      else {
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', 'currentColor');
        path.setAttribute('stroke-width', '2.2');
        path.setAttribute('stroke-linecap', 'square');
      }
      svg.appendChild(path);
    });
    return svg;
  }

  /* Which badges somebody has, asked every time, in the order the board posts
     them, and never counted: the jobs make most of them, `has.pets` makes Pet
     Parent and `has.rescues` makes Rescue Ranger. */
  function badgesFor(guild, done, has) {
    has = has || {};
    var all = guild.jobs.map(function (j) { return j.id; });
    return guild.badges.filter(function (b) {
      if (b.from === 'rescues') return !!has.rescues;
      if (b.from === 'pets') return !!has.pets;
      var want = b.jobs || [];
      if (b.needs === 'any') {
        return (want.length ? want : all).some(function (id) { return done.indexOf(id) >= 0; });
      }
      return want.length > 0 && want.every(function (id) { return done.indexOf(id) >= 0; });
    });
  }

  /* WHETHER THIS BROWSER HAS RESCUED ANYBODY, for Rescue Ranger in your own
     Profile and nowhere else. The shelters keep the animals you rescued under
     love-rescues, in your browser, and nothing on the street knows who rescued
     which animal, so this is read, never written and never sent, and somebody
     else's profile never shows the badge. */
  function rescuedHere() {
    try { var v = JSON.parse(localStorage.getItem('love-rescues') || '[]'); return Array.isArray(v) && v.length > 0; }
    catch (e) { return false; }
  }

  /* Badges, drawn and named with what they are for, and in your own Profile
     (`save`) each with a Download, on the radio's own ground, because a badge
     is drawn in the radio's ink. */
  function badgesInto(box, bs, save) {
    box.textContent = '';
    if (bs.length) {
      var ul = el('ul', 'cb-badges');
      bs.forEach(function (b) {
        var li = el('li', 'cb-badge');
        li.appendChild(badgeArt(b, 'cb-badge__art'));
        var words = el('div', 'cb-badge__words');
        var a = el('a', 'cb-badge__name', b.name);
        a.href = '/adventurers-guild.html#badge-' + b.id;
        words.appendChild(a);
        words.appendChild(el('p', 'cb-badge__for', b['for']));
        if (save) {
          var said = el('p', 'cb-quiet cb-save__said', ''); said.setAttribute('role', 'status');
          words.appendChild(saveButton('the ' + b.name + ' badge', function () { return li.querySelector('.cb-badge__art'); },
            'badge-' + fileName(b.id), function (live) { return { ground: groundOf(live), pad: 4, long: 512 }; }, said));
          words.appendChild(said);
        }
        li.appendChild(words);
        ul.appendChild(li);
      });
      box.appendChild(ul);
    }
  }

  /* Somebody's jobs, folded, each a link to its place on the board. */
  function jobsInto(box, guild, done, whose) {
    box.textContent = '';
    var det = el('details', 'cb-jobs');
    det.appendChild(el('summary', null, whose));
    var list = el('ul', 'cb-jobs__list');
    guild.jobs.forEach(function (j) {
      if (done.indexOf(j.id) < 0) return;
      var li = el('li');
      var a = el('a', null, j.title);
      a.href = '/adventurers-guild.html#job-' + j.id;
      li.appendChild(a);
      li.appendChild(el('span', 'cb-jobs__room', ' \u00b7 ' + j.room));
      list.appendChild(li);
    });
    det.appendChild(list);
    box.appendChild(det);
  }

  /* patches.js, loaded on the first patch the radio has to draw. A room with a
     patch lying in it has loaded it already, under the same mark. */
  function withPatches(then) {
    if (window.lovePatches) { then(); return; }
    var s = document.querySelector('script[data-cb-patches]');
    if (!s) {
      s = document.createElement('script');
      s.src = '/patches.js';
      s.setAttribute('data-cb-patches', '');
      document.head.appendChild(s);
    }
    s.addEventListener('load', function () { if (window.lovePatches) then(); });
  }

  /* "A, B and C", for the patches sewn on, in the street's own order. */
  function patchNames(ids) {
    var n = window.lovePatches.list.filter(function (p) { return ids.indexOf(p.id) >= 0; }).map(function (p) { return p.name; });
    return n.length < 2 ? n.join('') : n.slice(0, -1).join(', ') + ' and ' + n[n.length - 1];
  }

  /* A battle jacket into a box: the drawing, whose label names what is sewn
     on, and the same words under it for everybody. In a profile (listed), the
     patches sewn on are listed under it one by one instead, Ryan's ask of
     2026-10-18: each drawn on its own, by name, with the room it came from
     linked to where it lies, in the street's order and with nothing counted. */
  function jacketInto(box, ids, whose, listed) {
    box.textContent = '';
    var art = window.lovePatches.jacket(ids, { cls: 'cb-jacket__art' });
    if (art) box.appendChild(art);
    if (!ids.length) { box.appendChild(el('p', 'cb-jacket__on', 'Nothing is sewn on ' + whose + ' yet.')); return; }
    if (!listed) { box.appendChild(el('p', 'cb-jacket__on', 'Sewn on: ' + patchNames(ids) + '.')); return; }
    box.appendChild(el('h3', 'pf-sub', 'Sewn on'));
    var ul = el('ul', 'cb-patchlist');
    window.lovePatches.list.forEach(function (p) {
      if (ids.indexOf(p.id) < 0) return;
      var li = el('li', 'cb-patchlist__one');
      var one = window.lovePatches.draw(p.id, { cls: 'cb-patchlist__art', label: true });
      if (one) li.appendChild(one);
      li.appendChild(el('span', 'cb-patchlist__name', p.name));
      var from = el('span', 'cb-patchlist__from', 'From ');
      var a = el('a', null, p.room);
      a.href = '/' + p.page + '#patch-' + p.id;
      from.appendChild(a);
      li.appendChild(from);
      ul.appendChild(li);
    });
    box.appendChild(ul);
  }

  /* SAVING A DRAWING AS A PICTURE (Ryan, 2026-10-16): an avatar, a pet, a
     badge, a patch or the battle jacket, out of your own Profile. The file is
     made here, from the drawing already on the screen: a copy of it with every
     colour the page gave it written in, and every typeface on it put inside
     it, so it looks the same anywhere. That copy is drawn onto a canvas and the
     PNG handed to the browser's own download. Nothing is sent, and the only
     thing fetched is a typeface, from this street. A browser that will not
     make a PNG of a drawing gets the drawing itself, as an SVG. */
  var KEEP = ['fill', 'fill-opacity', 'fill-rule', 'stroke', 'stroke-width', 'stroke-opacity', 'stroke-linecap',
    'stroke-linejoin', 'stroke-dasharray', 'stroke-dashoffset', 'opacity', 'stop-color', 'stop-opacity',
    'font-family', 'font-size', 'font-weight', 'font-style', 'letter-spacing', 'paint-order'];
  var faceData = {};

  function fileName(s) {
    return String(s || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  }

  function unquote(s) { return String(s || '').trim().replace(/^["']|["']$/g, ''); }

  /* Whether an @font-face's weight, one number or a range, covers `w`. */
  function weighs(spec, w) {
    var n = String(spec || '400').replace('normal', '400').replace('bold', '700').split(/\s+/).map(Number);
    return n.length > 1 ? (w >= n[0] && w <= n[1]) : n[0] === w;
  }

  /* Every typeface the drawing's words are set in, as @font-face rules with
     the file inside them, read off this street's own stylesheets. */
  function facesIn(want) {
    var rules = [];
    for (var i = 0; i < document.styleSheets.length; i++) {
      var list = null;
      try { list = document.styleSheets[i].cssRules; } catch (e) {}
      for (var j = 0; list && j < list.length; j++) if (list[j].type === 5) rules.push(list[j]);
    }
    var jobs = [];
    Object.keys(want).forEach(function (k) {
      var w = want[k];
      var fam = rules.filter(function (r) {
        return unquote(r.style.getPropertyValue('font-family')).toLowerCase() === w.family.toLowerCase() &&
          (r.style.getPropertyValue('font-style') || 'normal') === w.style;
      });
      var hit = fam.filter(function (r) { return weighs(r.style.getPropertyValue('font-weight'), w.weight); });
      (hit.length ? hit : fam.slice(0, 1)).forEach(function (r) {
        var m = /url\(\s*(['"]?)([^'")]+)\1\s*\)/.exec(r.style.getPropertyValue('src'));
        if (!m) return;
        var u = new URL(m[2], (r.parentStyleSheet && r.parentStyleSheet.href) || location.href);
        if (u.origin !== location.origin) return;
        var type = /\.woff2$/.test(u.pathname) ? 'font/woff2' : /\.woff$/.test(u.pathname) ? 'font/woff' : 'font/ttf';
        var got = faceData[u.href] = faceData[u.href] || fetch(u.href, { credentials: 'omit' }).then(function (res) {
          if (!res.ok) throw new Error('no face');
          return res.arrayBuffer();
        }).then(function (buf) {
          var bytes = new Uint8Array(buf), s = '';
          for (var i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
          return 'data:' + type + ';base64,' + btoa(s);
        });
        var range = r.style.getPropertyValue('unicode-range');
        jobs.push(got.then(function (data) {
          return '@font-face{font-family:"' + unquote(r.style.getPropertyValue('font-family')) + '";src:url(' + data +
            ');font-weight:' + (r.style.getPropertyValue('font-weight') || '400') + ';font-style:' + w.style +
            (range ? ';unicode-range:' + range : '') + '}';
        }, function () { return ''; }));
      });
    });
    return Promise.all(jobs).then(function (css) { return css.join(''); });
  }

  /* The drawing on its own: every colour it was given written in, its words'
     typefaces inside it, `ground` behind it if it needs one, `pad` round it. */
  function standalone(live, opts) {
    var copy = live.cloneNode(true);
    var from = [live].concat([].slice.call(live.querySelectorAll('*')));
    var to = [copy].concat([].slice.call(copy.querySelectorAll('*')));
    var want = {};
    for (var i = 0; i < from.length; i++) {
      var cs = getComputedStyle(from[i]), st = [];
      KEEP.forEach(function (k) {
        var v = cs.getPropertyValue(k);
        // A paint server is in the drawing, never at the page's address.
        if (v) st.push(k + ':' + v.replace(/url\(\s*"?[^"#)]*#([^")]+)"?\s*\)/g, 'url(#$1)'));
      });
      if (cs.display === 'none') st.push('display:none');
      if (cs.visibility === 'hidden') st.push('visibility:hidden');
      to[i].setAttribute('style', st.join(';'));
      if (/^(text|tspan|textPath)$/.test(from[i].localName)) {
        var fam = unquote(cs.fontFamily.split(',')[0]);
        want[fam + '|' + cs.fontWeight + '|' + cs.fontStyle] = { family: fam, weight: +cs.fontWeight || 400, style: cs.fontStyle || 'normal' };
      }
    }
    var vb = (live.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number);
    if (vb.length !== 4 || vb.some(isNaN)) { var bb = live.getBoundingClientRect(); vb = [0, 0, bb.width || 100, bb.height || 100]; }
    var pad = opts.pad || 0;
    vb = [vb[0] - pad, vb[1] - pad, vb[2] + pad * 2, vb[3] + pad * 2];
    var k = (opts.long || 1200) / Math.max(vb[2], vb[3]);
    var w = Math.round(vb[2] * k), h = Math.round(vb[3] * k);
    copy.setAttribute('viewBox', vb.join(' '));
    copy.setAttribute('width', w);
    copy.setAttribute('height', h);
    copy.removeAttribute('class');
    if (opts.ground) {
      var r = document.createElementNS(SVGNS, 'rect');
      r.setAttribute('x', vb[0]); r.setAttribute('y', vb[1]);
      r.setAttribute('width', vb[2]); r.setAttribute('height', vb[3]);
      r.setAttribute('fill', opts.ground);
      copy.insertBefore(r, copy.firstChild);
    }
    return facesIn(want).then(function (css) {
      if (css) {
        var style = document.createElementNS(SVGNS, 'style');
        style.textContent = css;
        copy.insertBefore(style, copy.firstChild);
      }
      return { svg: new XMLSerializer().serializeToString(copy), w: w, h: h };
    });
  }

  function pngOf(d) {
    return new Promise(function (ok, no) {
      var url = URL.createObjectURL(new Blob([d.svg], { type: 'image/svg+xml' }));
      var img = new Image();
      img.onload = function () {
        try {
          var cv = document.createElement('canvas');
          cv.width = d.w; cv.height = d.h;
          cv.getContext('2d').drawImage(img, 0, 0, d.w, d.h);
          cv.toBlob(function (b) { URL.revokeObjectURL(url); if (b) ok(b); else no(new Error('no png')); }, 'image/png');
        } catch (e) { URL.revokeObjectURL(url); no(e); }
      };
      img.onerror = function () { URL.revokeObjectURL(url); no(new Error('no image')); };
      img.src = url;
    });
  }

  function handOver(blob, name) {
    var url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
    return name;
  }

  function saveDrawing(live, name, opts) {
    return standalone(live, opts || {}).then(function (d) {
      return pngOf(d).then(function (b) { return handOver(b, name + '.png'); },
        function () { return handOver(new Blob([d.svg], { type: 'image/svg+xml' }), name + '.svg'); });
    });
  }

  /* The colour behind a drawing on the radio, for one drawn in the radio's
     own ink, like a badge, which needs a ground to be seen on. */
  function groundOf(node) {
    for (var n = node; n; n = n.parentElement || (n.getRootNode && n.getRootNode().host)) {
      var c = getComputedStyle(n).backgroundColor;
      if (c && !/^(transparent|rgba\([^)]*,\s*0\))$/.test(c)) return c;
    }
    return '#ffffff';
  }

  /* A Download button for one drawing, answered on `said`, where the hand is.
     `art` is the drawing, or a function that finds it when pressed. */
  function saveButton(what, art, name, opts, said) {
    var b = el('button', 'cb-btn cb-save', 'Download');
    b.type = 'button';
    b.setAttribute('aria-label', 'Download a picture of ' + what);
    b.addEventListener('click', function () {
      var live = typeof art === 'function' ? art() : art;
      if (!live) return;
      b.disabled = true;
      said.textContent = 'Drawing the picture\u2026';
      saveDrawing(live, name || 'drawing', typeof opts === 'function' ? opts(live) : opts).then(function (file) {
        b.disabled = false;
        said.textContent = 'Saved as ' + file + ', wherever your browser puts downloads. It went nowhere else.';
      }, function () {
        b.disabled = false;
        said.textContent = 'That picture could not be made just now.';
      });
    });
    return b;
  }

  /* avatar.js, loaded on the first avatar the radio has to draw. */
  function withAvatar(then) {
    if (window.loveAvatar) { then(); return; }
    var s = document.querySelector('script[data-cb-avatar]');
    if (!s) {
      s = document.createElement('script');
      s.src = '/avatar.js';
      s.setAttribute('data-cb-avatar', '');
      document.head.appendChild(s);
    }
    s.addEventListener('load', function () { if (window.loveAvatar) then(); });
  }

  /* An avatar on its own ground. What its owner wrote about it is what a
     screen reader hears, and nothing else is ever said about it: the drawing
     is silent when they wrote nothing. */
  function avatarArt(look, about, cls, crop, whose) {
    var wrap = el('span', cls);
    var art = window.loveAvatar && window.loveAvatar.draw(look, { crop: crop, ground: true });
    if (art) wrap.appendChild(art);
    if (about) { wrap.setAttribute('role', 'img'); wrap.setAttribute('aria-label', (whose ? whose + ': ' : '') + about); }
    else wrap.setAttribute('aria-hidden', 'true');
    return wrap;
  }

  /* A PATCH STICKER on a message: the patch, drawn by patches.js, and its name
     under it for everybody. */
  function patchSticker(st) {
    var fig = el('figure', 'cb-sticker cb-sticker--patch');
    var cap = el('figcaption', null, 'A patch');
    fig.appendChild(cap);
    withPatches(function () {
      cap.textContent = 'A patch: ' + (window.lovePatches.name(st.patch) || 'one from the street');
      var art = window.lovePatches.draw(st.patch, { cls: 'cb-sticker__art cb-sticker__patch' });
      if (art) fig.insertBefore(art, fig.firstChild);
    });
    return fig;
  }

  /* A BATTLE JACKET STICKER on a message (Ryan, 2026-10-16): the jacket as it
     was when it was sent, drawn by patches.js, and what is sewn on it under it
     for everybody. The caption speaks for it, so the drawing is silent. */
  function jacketSticker(st) {
    var fig = el('figure', 'cb-sticker cb-sticker--jacket');
    var cap = el('figcaption', null, 'A battle jacket');
    fig.appendChild(cap);
    withPatches(function () {
      var ids = (st.patches || []).filter(function (id) { return window.lovePatches.name(id); });
      cap.textContent = 'A battle jacket' + (ids.length ? ', with ' + patchNames(ids) + ' sewn on' : '');
      var art = window.lovePatches.jacket(ids, { cls: 'cb-sticker__art cb-sticker__jacket' });
      if (art) {
        art.removeAttribute('role');
        art.removeAttribute('aria-label');
        art.setAttribute('aria-hidden', 'true');
        fig.insertBefore(art, fig.firstChild);
      }
    });
    return fig;
  }

  /* An AVATAR STICKER on a message: the drawing and, under it for everybody,
     its name and what its owner wrote about it. */
  function avatarSticker(st) {
    var fig = el('figure', 'cb-sticker cb-sticker--avatar');
    fig.appendChild(el('figcaption', null, (st.name || 'An avatar') + (st.about ? ': ' + st.about : '')));
    withAvatar(function () {
      var art = window.loveAvatar.draw(st.look, { ground: true, cls: 'cb-sticker__art' });
      if (art) fig.insertBefore(art, fig.firstChild);
    });
    return fig;
  }

  /* chimera.js, loaded on the first chimera the radio has to draw. */
  function withChimera(then) {
    if (window.loveChimera) { then(); return; }
    var s = document.querySelector('script[data-cb-chimera]');
    if (!s) {
      s = document.createElement('script');
      s.src = '/chimera.js';
      s.setAttribute('data-cb-chimera', '');
      document.head.appendChild(s);
    }
    s.addEventListener('load', function () { if (window.loveChimera) then(); });
  }

  /* familiar.js, loaded the first time somebody takes a chimera with them
     from Profile, or the first time somebody seen here has brought theirs, in
     the page the familiars are in. It is the one file that keeps a familiar,
     in the browser; the radio only hands it what to draw. */
  function withFamiliar(then) {
    var w = familiarWindow();
    try {
      if (w.loveFamiliar) { then(w.loveFamiliar); return; }
      var d = w.document, s = d.querySelector('script[src$="familiar.js"]');
      if (!s) {
        s = d.createElement('script');
        s.src = '/familiar.js';
        d.head.appendChild(s);
      }
      s.addEventListener('load', function () { if (w.loveFamiliar) then(w.loveFamiliar); });
    } catch (e) { /* that page has gone */ }
  }

  /* What a chimera says, its maker's words, each in quotation marks, as text. */
  function chimeraSays(box, sayings) {
    (sayings || []).forEach(function (t) {
      if (typeof t === 'string' && t) box.appendChild(el('p', 'cb-pet__about cb-ch-says', '\u201c' + t + '\u201d'));
    });
  }

  /* A chimera, drawn by chimera.js as elements. The drawing is silent; the
     words beside it say which animal gave which part. */
  function chimeraArt(parts, cls) {
    var wrap = el('span', cls);
    wrap.setAttribute('aria-hidden', 'true');
    var art = window.loveChimera && window.loveChimera.draw(parts, { ground: true });
    if (art) wrap.appendChild(art);
    return wrap;
  }

  /* A CHIMERA STICKER on a message: the drawing and, under it for everybody,
     its name and which animal gave which part. */
  function chimeraSticker(st) {
    var fig = el('figure', 'cb-sticker cb-sticker--chimera');
    var cap = el('figcaption', null, st.name || 'A chimera');
    fig.appendChild(cap);
    withChimera(function () {
      var said = window.loveChimera.words(st.parts);
      cap.textContent = (st.name || window.loveChimera.suggest(st.parts) || 'A chimera') + (said ? ': ' + said : '');
      var art = window.loveChimera.draw(st.parts, { ground: true, cls: 'cb-sticker__art' });
      if (art) fig.insertBefore(art, fig.firstChild);
    });
    return fig;
  }

  Radio.prototype.loadAvatars = function () {
    var me = this;
    me.avState.hidden = false;
    me.avState.textContent = 'Looking for your avatars\u2026';
    withAvatar(function () {
      call('/cb/avatars', null, me.state.pass).then(function (r) {
        if (r.status === 200 && r.body.avatars) { me.drawAvatars(r.body); return; }
        me.avState.textContent = r.status === 401
          ? 'Since you signed on, this username has been signed off. Sign on again at the Community Center.'
          : 'Your avatars could not be fetched just now.';
      }, function () { me.avState.textContent = 'Your avatars could not be fetched just now.'; });
    });
  };

  Radio.prototype.avatarSend = function (body, said, done) {
    var me = this;
    return call('/cb/avatars', { body: body }, me.state.pass).then(function (r) {
      if (r.status === 200 && r.body.avatars) {
        me.drawAvatars(r.body, done);
        if ((body.wear !== undefined || body.remove) && me.pfShown('card')) me.loadProfileCard(true);
        return true;
      }
      if (r.status === 401) { said.textContent = 'Since you signed on, this username has been signed off. Sign on again at the Community Center.'; return false; }
      said.textContent = (r.body && typeof r.body.error === 'string') ? r.body.error : 'That did not work just now. Nothing changed.';
      return false;
    }, function () { said.textContent = 'The street could not be reached just now. Nothing changed.'; return false; });
  };

  /* YOUR AVATARS: each one drawn, named, with what you wrote about it; worn
     on the CB or not (a claimed username only); named and described; taken
     next door to be dressed, or back to the booth; and deleted, which asks
     once more. The answer to a press goes on that avatar's own card. */
  Radio.prototype.drawAvatars = function (b, told) {
    var me = this, ul = this.avList, claimed = !!b.claimed;
    ul.textContent = '';
    var w = this.avWhere;
    w.textContent = '';
    w.appendChild(document.createTextNode('Make one at the '));
    var booth = el('a', null, 'Bodymind Booth'); booth.href = '/bodymind-booth.html';
    w.appendChild(booth);
    w.appendChild(document.createTextNode(', or put an outfit on the stand at the '));
    var den = el('a', null, 'Dopamine Dress-Up Den'); den.href = '/dopamine-dress-up-den.html';
    w.appendChild(den);
    w.appendChild(document.createTextNode(claimed
      ? ', and keep it here. They are kept under your username, scrambled, and only your password reaches them. The one you wear is shown beside your name on Who\u2019s online, and large in your profile, to anybody signed on to the CB.'
      : ', and keep it here. They are kept under the handle ' + this.state.handle + ', scrambled. A handle is not an account: anybody who signs on with it sees them too. Claim your username under Account to wear one on the CB, beside your name on Who\u2019s online.'));
    this.avatarShow(b, told && told.show);
    if (!b.avatars.length) {
      ul.hidden = true;
      this.avState.hidden = false;
      this.avState.textContent = 'No avatars yet.';
      return;
    }
    this.avState.hidden = true;
    ul.hidden = false;
    b.avatars.slice().reverse().forEach(function (a) {
      var li = el('li', 'cb-avatar');
      li.appendChild(avatarArt(a.look, a.about, 'cb-avatar__art', 'full'));
      var words = el('div', 'cb-avatar__words');
      words.appendChild(el('p', 'cb-pet__name', a.name || 'Not named'));
      words.appendChild(el('p', 'cb-pet__about', a.about || 'Nothing written about it yet, so a screen reader hears nothing for it.'));
      var worn = b.wearing === a.id;
      if (worn) words.appendChild(el('p', 'cb-avatar__worn', 'Worn on the CB'));
      var said = el('p', 'cb-quiet', ''); said.setAttribute('role', 'status');
      var row = el('div', 'cb-acct__row');
      if (claimed) {
        var wear = el('button', 'cb-btn', worn ? 'Take it off the CB' : 'Wear it on the CB');
        wear.type = 'button';
        wear.setAttribute('aria-pressed', String(worn));
        wear.addEventListener('click', function () {
          wear.disabled = true;
          me.avatarSend({ wear: worn ? null : a.id }, said, { id: a.id, said: worn ? 'Taken off: Who\u2019s online shows no avatar beside your name now.' : 'Worn: Who\u2019s online shows it beside your name now.' })
            .then(function () { wear.disabled = false; });
        });
        row.appendChild(wear);
      }
      var name = el('button', 'cb-btn', 'Name it and say what it shows');
      name.type = 'button';
      row.appendChild(name);
      var code = window.loveAvatar.code(a.look);
      var dress = el('a', 'cb-btn', 'Dress it at the Den');
      dress.href = '/dopamine-dress-up-den.html#avatar=' + encodeURIComponent(a.id) + '&look=' + code;
      row.appendChild(dress);
      if (a.look.base === 'bodymind') {
        var change = el('a', 'cb-btn', 'Change it in the booth');
        change.href = '/bodymind-booth.html#avatar=' + encodeURIComponent(a.id) + '&look=' + code;
        row.appendChild(change);
      }
      row.appendChild(saveButton(a.name || 'this avatar', function () { return li.querySelector('.cb-avatar__art svg'); },
        'avatar' + (a.name ? '-' + fileName(a.name) : ''), null, said));
      var del = el('button', 'cb-btn', 'Delete it');
      del.type = 'button';
      row.appendChild(del);
      words.appendChild(row);
      var form = el('div', 'cb-acct__form'); form.hidden = true;
      words.appendChild(form);
      name.addEventListener('click', function () {
        form.textContent = ''; form.hidden = false; name.hidden = true;
        var n = field('Its name, for you', 'cb-av-name-' + a.id, 'text');
        n.input.maxLength = 24; n.input.autocomplete = 'off'; n.input.value = a.name || '';
        var t = field('What it shows, in your own words. This is all a screen reader hears for it, on Who\u2019s online and on a sticker.', 'cb-av-about-' + a.id, 'text');
        t.input.maxLength = 280; t.input.autocomplete = 'off'; t.input.value = a.about || '';
        form.appendChild(n.wrap); form.appendChild(t.wrap);
        var go = el('button', 'cb-btn', 'Save'); go.type = 'button';
        var keep = el('button', 'cb-btn', 'Leave it as it is'); keep.type = 'button';
        form.appendChild(go); form.appendChild(keep);
        n.input.focus();
        keep.addEventListener('click', function () { form.hidden = true; name.hidden = false; name.focus(); });
        go.addEventListener('click', function () {
          go.disabled = true;
          me.avatarSend({ edit: a.id, name: n.input.value, about: t.input.value }, said, { id: a.id, said: 'Saved.' })
            .then(function () { go.disabled = false; });
        });
      });
      var sure = el('div', 'cb-forget-sure'); sure.hidden = true;
      sure.appendChild(el('p', null, worn ? 'This deletes it and takes it off the CB. It cannot be undone.' : 'This deletes it. It cannot be undone.'));
      var yes = el('button', 'cb-btn', 'Yes, delete it'); yes.type = 'button';
      var no = el('button', 'cb-btn', 'Keep it'); no.type = 'button';
      sure.appendChild(yes); sure.appendChild(no);
      words.appendChild(sure);
      del.addEventListener('click', function () { sure.hidden = false; del.hidden = true; no.focus(); });
      no.addEventListener('click', function () { sure.hidden = true; del.hidden = false; del.focus(); });
      yes.addEventListener('click', function () {
        yes.disabled = true;
        me.avatarSend({ remove: a.id }, said, { said: 'Deleted.' }).then(function () { yes.disabled = false; });
      });
      words.appendChild(said);
      if (told && told.id === a.id) { said.textContent = told.said; told.focus = (claimed && wear) || name; }
      li.appendChild(words);
      ul.appendChild(li);
    });
    if (told) {
      if (told.focus) told.focus.focus();
      else if (told.said) { this.avState.hidden = false; this.avState.textContent = told.said; }
    }
  };

  /* SHOWING THE REST OF YOUR AVATARS in your profile, off until you switch it
     on, and only on a claimed username, the pets' rule. The one you wear is
     shown there either way. */
  Radio.prototype.avatarShow = function (b, focus) {
    var me = this, box = this.avShow;
    box.textContent = '';
    if (!b.claimed || !b.avatars.length) return;
    var on = !!b.shown;
    var t = el('button', 'cb-btn cb-pets-show', 'Show my avatars on the CB: ' + (on ? 'on' : 'off'));
    t.type = 'button';
    t.setAttribute('aria-pressed', String(on));
    box.appendChild(t);
    box.appendChild(el('p', 'cb-quiet', on
      ? 'Anybody signed on to the CB who opens your profile, from your handle on the channel or your name on Who\u2019s online, sees all your avatars, the one you wear first, with their names and what you wrote.'
      : 'Off: your profile shows only the one you wear. Switch it on to show the rest there, with their names and what you wrote.'));
    var said = el('p', 'cb-quiet', ''); said.setAttribute('role', 'status');
    box.appendChild(said);
    if (focus) t.focus();
    t.addEventListener('click', function () {
      t.disabled = true;
      me.avatarSend({ show: !on }, said, { show: true }).then(function () { t.disabled = false; });
    });
  };

  /* ── New to you ──────────────────────────────────────────────────────────

     WHAT IS NEW IS MARKED AND NEVER COUNTED (Ryan, 2026-10-20). The server
     keeps, for a claimed username, when it last read each channel and each
     conversation (newFor and markRead in netlify/cb/lib.mjs), so reading on
     one device clears the mark on another; Ryan chose that over each
     browser keeping its own. The radio asks /cb/unread from inside listen()
     and nowhere else, at most every NEWS_EVERY, and says it has read a
     channel when the newest message there is on the screen at the foot of
     the log, or a conversation when it is open. The marks are a dot in the
     button's own ink and the words "something new" to a screen reader: no
     number, no colour of their own, nothing that moves or sounds. The rooms
     you follow are kept in love-cb, in this browser, and sent nowhere. */
  var NEWS_EVERY = 30000;   // ms between asking what is new, while listening
  var FOLLOW_MAX = 200;     // rooms one browser follows at most

  function markNew(btn, on) {
    if (!btn) return;
    var dot = btn.querySelector(':scope > .cb-new');
    if (on && !dot) {
      dot = el('span', 'cb-new');
      dot.setAttribute('aria-hidden', 'true');
      btn.appendChild(dot);
      btn.appendChild(el('span', 'sr cb-new-sr', ', something new'));
    }
    if (!on && dot) {
      dot.remove();
      var said = btn.querySelector(':scope > .cb-new-sr');
      if (said) said.remove();
    }
    var base = btn.dataset.label;
    if (base) btn.setAttribute('aria-label', base + (on ? ', something new' : ''));
  }

  Radio.prototype.newsTick = function () {
    var me = this;
    if (!forumPass(this.state.pass)) { this.news = null; this.newsShown(); return; }
    if (this.newsBusy || Date.now() - (this.newsAt || 0) < NEWS_EVERY) return;
    this.newsBusy = true;
    var asked = Date.now();
    call('/cb/unread', { body: {} }, this.state.pass).then(function (r) {
      me.newsAt = Date.now();
      if (r.status === 401) return me.lost();
      if (r.status === 200 && r.body && r.body.latest) { me.news = r.body; me.newsShown(); }
      // Your own chat status rides on this ask, so another device's choice reaches here.
      if (r.status === 200 && r.body && typeof r.body.chat === 'string') me.chatStatusKnown(r.body.chat, asked);
    }, function () { me.newsAt = Date.now(); }).then(function () { me.newsBusy = false; });
  };

  /* YOUR CHAT STATUS, under Who's around (Ryan's ask, 2026-10-24): none, or
     one of the three badges, chosen with ordinary radio buttons, so arrows
     move between them and a screen reader hears a group. It is sent to
     /cb/chat-status half a second after the last change, so walking the
     arrows past a badge does not choose it, and read back from /cb/unread on
     the radio's own ask, never on a timer of its own. Nothing is chosen for
     anybody: none is where it starts. */
  Radio.prototype.chatStatusMake = function (sec) {
    var me = this;
    var box = this.chatStatusBox = el('fieldset', 'cb-chatpick');
    box.appendChild(el('legend', 'cb-h3', 'Your chat status'));
    var about = el('p', 'cb-online-about');
    about.appendChild(document.createTextNode('Whether you would like to be talked to, after the interaction badges. It is shown beside your name on Who\u2019s online and to people seen in the same room, on your profile, and to anybody about to write to you. It is a sign, not a lock: it stops nobody writing. Nothing is shown until you choose, and it stays until you change it. '));
    var more = el('a', null, 'More about it');
    more.href = '/cb-guide.html#chat-status';
    about.appendChild(more);
    about.appendChild(document.createTextNode('.'));
    box.appendChild(about);
    var opts = [{ id: '', says: 'nothing is shown beside your name' }].concat(CHAT);
    this.chatStatusInputs = opts.map(function (c) {
      var lab = el('label', 'cb-chatpick__row');
      var r = el('input');
      r.type = 'radio';
      r.name = 'cb-chat';
      r.value = c.id;
      lab.appendChild(r);
      lab.appendChild(c.id ? chatBadge(c.id, true) : el('span', 'cb-chatpick__none', 'none'));
      lab.appendChild(el('span', 'cb-chatpick__says', c.says));
      r.addEventListener('change', function () { if (r.checked) me.setChatStatus(c.id); });
      box.appendChild(lab);
      return r;
    });
    var said = this.chatStatusSaid = el('p', 'cb-said');
    said.setAttribute('role', 'status');
    box.appendChild(said);
    sec.appendChild(box);
    this.chatStatusShown();
  };

  Radio.prototype.setChatStatus = function (id) {
    var me = this;
    clearTimeout(this.chatStatusTimer);
    // Anything read back before this is kept is older than it.
    this.chatStatusHold = Infinity;
    var seq = this.chatStatusSeq = (this.chatStatusSeq || 0) + 1;
    this.chatStatusTimer = setTimeout(function () {
      call('/cb/chat-status', { body: { chat: id } }, me.state.pass).then(function (r) {
        if (r.status === 401) return me.lost();
        if (seq !== me.chatStatusSeq) return;
        me.chatStatusHold = Date.now();
        if (r.status === 200 && r.body && typeof r.body.chat === 'string') {
          me.chatStatusMine = r.body.chat;
          var c = chatOf(r.body.chat);
          me.chatStatusSaid.textContent = c ? 'Done. People see ' + c.name + ' beside your name.' : 'Done. Nothing is shown beside your name.';
        } else me.chatStatusSaid.textContent = (r.body && r.body.error) || 'That did not work just now. Nothing changed.';
        me.chatStatusShown();
      }, function () {
        if (seq !== me.chatStatusSeq) return;
        me.chatStatusHold = Date.now();
        me.chatStatusSaid.textContent = 'That did not work just now. Nothing changed.';
        me.chatStatusShown();
      });
    }, 500);
  };

  // What the server keeps, unless a choice has been made since it was asked.
  Radio.prototype.chatStatusKnown = function (v, asked) {
    if (this.chatStatusHold && asked < this.chatStatusHold) return;
    if (this.chatStatusMine === v) return;
    this.chatStatusMine = v;
    this.chatStatusShown();
  };

  Radio.prototype.chatStatusShown = function () {
    if (!this.chatStatusInputs) return;
    var v = typeof this.chatStatusMine === 'string' ? this.chatStatusMine : null;
    this.chatStatusInputs.forEach(function (r) { r.checked = v !== null && r.value === v; });
  };

  // The channel being listened to has been read up to its newest message, if
  // that message is on the screen.
  Radio.prototype.readTick = function (messages) {
    if (!forumPass(this.state.pass) || this.state.folded || this.state.size === 'icon' || offList()) return;
    if (this.chatView && this.chatView !== 'channel') return;
    var log = this.log;
    if (!log.hidden && log.scrollHeight - log.scrollTop - log.clientHeight >= 24) return;
    var tag = this.tunedRoom() || WORLD_CALL, newest = 0;
    (messages || []).forEach(function (m) { if (typeof m.t === 'number' && m.t > newest) newest = m.t; });
    this.readUpTo({ ch: tag }, 'ch|' + tag, newest);
  };

  // A conversation open on the screen has been read up to its newest message.
  Radio.prototype.dmReadTick = function (msgs) {
    var who = this.dmWith, newest = 0;
    if (!who || this.state.folded || !forumPass(this.state.pass)) return;
    (msgs || []).forEach(function (m) { if (typeof m.t === 'number' && m.t > newest) newest = m.t; });
    if (this.news && this.news.dms) this.news.dms = this.news.dms.filter(function (h) { return fold(h) !== fold(who); });
    this.readUpTo({ dm: who }, 'dm|' + fold(who), newest);
  };

  Radio.prototype.readUpTo = function (what, key, newest) {
    var sent = this.readSent = this.readSent || {};
    if (!newest || (sent[key] || 0) >= newest) return;
    sent[key] = newest;
    var n = this.news;
    if (n && what.ch) {
      n.read = n.read || {};
      n.read[what.ch] = Math.max(n.read[what.ch] || 0, newest);
    }
    this.newsShown();
    call('/cb/unread', { body: { read: what, t: newest } }, this.state.pass).catch(function () { /* the next look asks again */ });
  };

  // This page's room, if it is one Unreads and Follow can name.
  function followable() {
    var here = hereRoom();
    return here && !here.quiet && !worldHere() ? here : null;
  }

  Radio.prototype.followShown = function () {
    var here = followable(), b = this.followRoomBtn, fa = this.followAllBtn, all = !!this.state.followAll;
    fa.hidden = !forumPass(this.state.pass);
    fa.setAttribute('aria-pressed', String(all));
    fa.textContent = 'Follow every room: ' + (all ? 'on' : 'off');
    // Following every room, this one is followed already, and the switch for it would say nothing.
    b.hidden = !here || !forumPass(this.state.pass) || all;
    if (b.hidden) return;
    var on = (this.state.follow || []).indexOf(here.tag) >= 0;
    b.setAttribute('aria-pressed', String(on));
    b.textContent = 'Follow this room: ' + (on ? 'on' : 'off');
  };

  Radio.prototype.setFollowRoom = function (on) {
    var here = followable();
    if (!here) return;
    var list = (this.state.follow || []).filter(function (t) { return t !== here.tag; });
    if (on) list.push(here.tag);
    this.state.follow = list.slice(-FOLLOW_MAX);
    save(this.state);
    this.followShown();
    this.newsShown();
    this.tell(on ? 'Following ' + here.name + ': Unreads lists it whenever something new is said here. Kept in this browser only.' : 'Not following ' + here.name + ' any more.');
  };

  Radio.prototype.setFollowAll = function (on) {
    if (on) this.state.followAll = true; else delete this.state.followAll;
    save(this.state);
    this.followShown();
    this.newsShown();
    var mine = (this.state.follow || []).length;
    this.tellNews(on ? 'Following every room: Unreads lists any room you can go into whenever something new is said there, rooms added later too. Kept in this browser only.'
      : 'Not following every room any more.' + (mine ? ' Unreads is back to the rooms you followed one by one.' : ''));
  };

  Radio.prototype.newsShown = function () {
    if (!this.newList) return;
    if (inChat()) this.chatShown();
    var me = this, n = this.news, claimed = forumPass(this.state.pass);
    var tuned = this.tunedRoom() || WORLD_CALL, here = followable();
    function fresh(tag) {
      var t = n && n.latest && n.latest[tag];
      return !!t && t > ((n.read && n.read[tag]) || 0) && tag !== tuned;
    }
    markNew(this.worldBtn, fresh(WORLD_CALL));
    markNew(this.roomBtn, !!here && fresh(here.tag));
    var dms = (n && n.dms) || [];
    // A first message waiting is in dms until it is read, like any other.
    markNew(this.dmBtn, dms.length > 0);
    if (this.dmBox && !this.dmBox.hidden && !this.dmWith && this.dmInboxBody) this.dmDrawInbox(this.dmInboxBody);
    // Unreads: World, then the rooms followed, in walking order, then conversations.
    var items = [];
    if (fresh(WORLD_CALL)) items.push({ key: 'w', world: true });
    var follow = this.state.follow || [], all = !!this.state.followAll;
    // The World room's channel is World, which is listed first already.
    (rooms || []).forEach(function (r) { if (r.tag !== WORLD_CALL && (all || follow.indexOf(r.tag) >= 0) && fresh(r.tag)) items.push({ key: 'r|' + r.tag, room: r }); });
    // A first message waiting is one of these: it opens where Accept is.
    dms.forEach(function (h) { items.push({ key: 'd|' + h, dm: h }); });
    var sig = JSON.stringify([claimed, items.map(function (x) { return x.key; }), here && here.tag, follow.length > 0, all]);
    if (sig === this.newSig) return;
    this.newSig = sig;
    var on = this.box.getRootNode().activeElement, keep = on && this.newList.contains(on) ? on.dataset.newKey : null;
    var ul = this.newList;
    ul.textContent = '';
    items.forEach(function (x) {
      var li = el('li'), b;
      if (x.room && !(here && x.room.tag === here.tag)) {
        b = el('a', 'cb-room');
        b.href = chatHref(x.room) || x.room.path;
        var hash = el('span', null, '#');
        hash.setAttribute('aria-hidden', 'true');
        b.appendChild(hash);
        b.appendChild(document.createTextNode(x.room.name));
      } else {
        b = el('button', 'cb-btn cb-new-go', x.world ? 'World' : x.room ? '#' + x.room.name : 'Messages from ' + x.dm);
        b.type = 'button';
        b.addEventListener('click', function () {
          if (x.world) me.setBand('world');
          else if (x.room) me.setBand('room');
          else { me.setDm(true); me.dmOpen(x.dm); }
        });
      }
      b.dataset.newKey = x.key;
      li.appendChild(b);
      ul.appendChild(li);
    });
    ul.hidden = !items.length;
    var hint = follow.length || all ? '' : 'Follow a room, with Follow this room under Channel, and it is listed here whenever something new is said there; or follow every room, below.';
    this.newNone.textContent = !claimed
      ? 'Claim your username, under Account, and the radio marks what is new to you and lists it here.'
      : items.length ? hint : 'Nothing new in World, ' + (all ? 'any room' : 'the rooms you follow') + ' or your messages.' + (hint ? ' ' + hint : '');
    this.newNone.hidden = !this.newNone.textContent;
    if (keep) { var again = ul.querySelector('[data-new-key="' + CSS.escape(keep) + '"]'); if (again) again.focus(); }
  };

  /* ── Messages ────────────────────────────────────────────────────────────

     Ryan's calls, 2026-10-18, as our community moves off Discord: messages
     between two people, with a claimed username at both ends. Nobody new can
     start one with you until you switch on Let people message me; their first
     message waits for you to answer it, accept it or reject it; each message
     goes 48 hours after it was sent; a block says nothing to the person
     blocked; and the only way a message reaches the moderators is a report.
     The server is the Direct messages part of lib.mjs and /cb/dm.

     ASKED ONLY FROM listen(), AND ONLY WHILE THIS PART IS OPEN: the list of
     conversations, or the one on the screen. Folded, in a tab behind another,
     or with the part shut, the radio asks nothing about messages, the same as
     Who's online. A message arriving is told by a notification, for anybody
     who switched When somebody messages me on, and never by anything on the
     radio lighting up.

     NOTHING IS COUNTED AND NOTHING SAYS WHO READ WHAT: no unread number, no
     "seen", no typing. The list says who wrote last and when, which is all the
     server keeps. Everything typed is drawn into elements by md(), as on the
     channel. */
  function firstWords(text) {
    var t = String(text || '').replace(/\s+/g, ' ').trim();
    return t.length > 140 ? t.slice(0, 139) + '…' : t;
  }

  Radio.prototype.dmMake = function (sec) {
    var me = this;
    this.dmWith = null;
    this.dmBusy = null;
    if (!forumPass(this.state.pass)) {
      sec.appendChild(el('p', 'cb-quiet', 'Claim your username, under Account in You on this radio, and you can send direct messages and get them: one person to another, each gone 48 hours after it was sent.'));
      return;
    }
    var btn = this.dmBtn = el('button', 'cb-btn cb-dm-btn', 'Your messages');
    btn.dataset.label = 'Your messages';
    btn.type = 'button';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'cb-dm');
    var row = el('div', 'cb-tools');
    row.appendChild(btn);
    sec.appendChild(row);
    var box = this.dmBox = el('div', 'cb-dm');
    box.id = 'cb-dm';
    box.hidden = true;

    // THE LIST: the switch, a way to write to a username, and the conversations.
    var inbox = this.dmInbox = el('div', 'cb-dm-inbox');
    var about = el('p', 'cb-online-about');
    about.appendChild(document.createTextNode('Between you and one other person, both with claimed usernames. Each message goes 48 hours after it was sent. Nobody else can read them, moderators included, unless one of you reports a message to them. They are not end-to-end encrypted: '));
    var pa = el('a', null, 'what that means');
    pa.href = '/privacy.html#messages';
    about.appendChild(pa);
    about.appendChild(document.createTextNode('.'));
    inbox.appendChild(about);
    var openBtn = this.dmOpenBtn = el('button', 'cb-btn cb-dm-open', 'Let people message me');
    openBtn.type = 'button';
    openBtn.setAttribute('aria-pressed', 'false');
    inbox.appendChild(openBtn);
    this.dmOpenNow = el('p', 'cb-seen-now');
    inbox.appendChild(this.dmOpenNow);
    var start = el('form', 'cb-dm-start');
    var sl = el('label', 'cb-lab', 'Write to a username');
    sl.htmlFor = 'cb-dm-to';
    var to = el('input', 'cb-say cb-dm-to');
    to.id = 'cb-dm-to';
    to.type = 'text';
    to.maxLength = 24;
    to.autocomplete = 'off';
    to.spellcheck = false;
    var go = el('button', 'cb-btn', 'Open');
    go.type = 'submit';
    var srow = el('div', 'cb-acct__row');
    srow.appendChild(to);
    srow.appendChild(go);
    start.appendChild(sl);
    start.appendChild(srow);
    inbox.appendChild(start);
    this.dmLists = el('div', 'cb-dm-lists');
    inbox.appendChild(this.dmLists);
    box.appendChild(inbox);

    // ONE CONVERSATION: who with, where it stands, its messages, and the box.
    var talk = this.dmTalk = el('div', 'cb-dm-talk');
    talk.hidden = true;
    var back = el('button', 'cb-btn cb-dm-back', 'All messages');
    back.type = 'button';
    talk.appendChild(back);
    var head = this.dmHead = el('h3', 'cb-h3 cb-dm-with');
    head.tabIndex = -1;
    talk.appendChild(head);
    this.dmState = el('div', 'cb-dm-state');
    talk.appendChild(this.dmState);
    var lcd = this.dmLcd = el('div', 'cb-lcd cb-dm-lcd');
    lcd.hidden = true;
    var log = this.dmLog = el('ol', 'cb-log cb-dm-log');
    log.setAttribute('role', 'log');
    log.setAttribute('aria-live', 'off');
    lcd.appendChild(log);
    talk.appendChild(lcd);
    var form = this.dmForm = el('form', 'cb-tx cb-dm-tx');
    form.hidden = true;
    var lab = this.dmLab = el('label', 'cb-lab', 'Your message');
    lab.htmlFor = 'cb-dm-say';
    var say = this.dmSay = el('textarea', 'cb-say cb-say--msg');
    say.id = 'cb-dm-say';
    say.maxLength = MESSAGE_MAX;
    say.autocomplete = 'off';
    sendBox(say, 'send');
    say.setAttribute('aria-describedby', 'cb-dm-hint');
    var hint = el('p', 'cb-hint', enterHint('Send', 'sends') + ' Markdown works, as on the channel, and so does [[ for a link. Once you are both talking, paste a picture to add it.');
    hint.id = 'cb-dm-hint';
    var send = el('button', 'cb-btn cb-send', 'Send');
    send.type = 'submit';
    /* A PICTURE, once the conversation is accepted (Ryan's call, 2026-10-19):
       a request is words only, so the button is there only in an open
       conversation (dmDrawTalk). The channel's redraw, before anything goes. */
    var picBtn = this.dmPicBtn = el('button', 'cb-btn cb-pic', 'Picture');
    picBtn.type = 'button';
    picBtn.setAttribute('aria-label', 'Add a picture to your message');
    picBtn.hidden = true;
    var picFile = this.dmPicFile = el('input', 'cb-pic-file');
    picFile.type = 'file';
    picFile.accept = 'image/' + '*';
    picFile.hidden = true;
    picFile.tabIndex = -1;
    picBtn.addEventListener('click', function () { picFile.click(); });
    picFile.addEventListener('change', function () { me.dmPickPicture(picFile.files && picFile.files[0]); });
    var ready = this.dmPicReady = el('div', 'cb-pic-ready');
    ready.hidden = true;
    var dmShown = this.dmPicShown = el('img', 'cb-pic-preview');
    dmShown.alt = '';
    dmShown.hidden = true;
    ready.appendChild(dmShown);
    var dmLine = this.dmPicLine = el('p', 'cb-pic-line');
    dmLine.setAttribute('role', 'status');
    ready.appendChild(dmLine);
    var altLab = el('label', 'cb-lab', 'Say what is in it, if you like');
    altLab.htmlFor = 'cb-dm-pic-alt';
    var alt = this.dmPicAlt = el('input', 'cb-say cb-pic-alt');
    alt.id = 'cb-dm-pic-alt';
    alt.type = 'text';
    alt.maxLength = 280;
    alt.autocomplete = 'off';
    var drop = el('button', 'cb-btn cb-pic-drop', 'Remove the picture');
    drop.type = 'button';
    drop.addEventListener('click', function () { me.dmDropPicture(); picBtn.focus(); });
    ready.appendChild(altLab);
    ready.appendChild(alt);
    ready.appendChild(drop);
    /* A STICKER, once the conversation is accepted (Ryan's ask, 2026-10-20):
       the channel's tray, sending here instead (setStickers' where). */
    var stickBtn = this.dmStickBtn = el('button', 'cb-btn cb-stick', 'Sticker');
    stickBtn.type = 'button';
    stickBtn.hidden = true;
    stickBtn.setAttribute('aria-label', 'Send a sticker of one of your avatars or pets');
    stickBtn.setAttribute('aria-expanded', 'false');
    stickBtn.setAttribute('aria-controls', 'cb-dm-stickers');
    stickBtn.addEventListener('click', function () { me.setStickers(me.dmStickBox.hidden, 'dm'); });
    var stickBox = this.dmStickBox = el('div', 'cb-stickers');
    stickBox.id = 'cb-dm-stickers';
    stickBox.hidden = true;
    stickBox.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); me.setStickers(false, 'dm'); stickBtn.focus(); } });
    var frow = el('div', 'cb-acct__row');
    frow.appendChild(picBtn);
    frow.appendChild(stickBtn);
    frow.appendChild(send);
    /* REPLYING TO, as on the channel, once the conversation is accepted. */
    var reB = this.dmReBar = reBar('cb-dm-re-line', 'cb-dm-hint', function () { me.dmReplyStop(); say.focus(); });
    this.dmReplying = null;
    form.appendChild(picFile);
    form.appendChild(ready);
    form.appendChild(reB);
    form.appendChild(lab);
    form.appendChild(say);
    form.appendChild(hint);
    form.appendChild(frow);
    form.appendChild(stickBox);
    talk.appendChild(form);
    linkBox(say, function (t) { if (me.dmSaid) me.dmSaid.textContent = t; });
    this.dmBlockRow = el('div', 'cb-dm-block');
    talk.appendChild(this.dmBlockRow);
    box.appendChild(talk);

    var said = this.dmSaid = el('p', 'cb-said');
    said.setAttribute('role', 'status');
    said.tabIndex = -1;
    box.appendChild(said);
    box.appendChild(this.footClose('Close your messages', function () { me.setDm(false); }, btn));
    sec.appendChild(box);

    btn.addEventListener('click', function () { me.setDm(box.hidden); });
    openBtn.addEventListener('click', function () {
      var on = openBtn.getAttribute('aria-pressed') !== 'true';
      me.dmCall({ open: on }, on ? 'On. Anybody with a claimed username can ask to message you.' : 'Off. Nobody new can message you.', function () { return openBtn; });
    });
    start.addEventListener('submit', function (e) {
      e.preventDefault();
      var h = to.value.trim();
      if (!h) { me.dmTold('Type the username you want to write to.'); to.focus(); return; }
      to.value = '';
      me.dmOpen(h);
    });
    back.addEventListener('click', function () { me.dmBack(); });
    form.addEventListener('submit', function (e) { e.preventDefault(); me.dmSend(); });
    say.addEventListener('keydown', function (e) {
      // Escape lets a reply go first; with none, it goes back to the list.
      if (e.key === 'Escape' && !e.isComposing && me.dmReplying) { e.preventDefault(); me.dmReplyStop(); return; }
      if (sendKey(e)) { e.preventDefault(); me.dmSend(); }
    });
    say.addEventListener('input', function () { me.grow(say); });
    // A pasted picture, only where Picture is offered: a request is words only.
    say.addEventListener('paste', function (e) {
      var f = pastedPicture(e);
      if (!f) return;
      if (picBtn.hidden) { me.dmTold('A picture can go once ' + me.dmWith + ' has accepted the conversation. A first message is words only.'); return; }
      me.dmPickPicture(f);
    });
    // Escape in a conversation goes back to the list, unless something in it
    // (an edit, a report) took the Escape first.
    talk.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !e.defaultPrevented) { e.preventDefault(); me.dmBack(); }
    });
  };

  Radio.prototype.setDm = function (open) {
    if (!this.dmBox) return;
    this.dmBox.hidden = !open;
    this.dmBtn.setAttribute('aria-expanded', String(open));
    if (open) { this.dmSig = null; this.dmTick(); }
    this.place();
  };

  // One status line for the whole part, set only when it changes, so a
  // failure every few seconds is not read out every few seconds.
  Radio.prototype.dmTold = function (t) { if (this.dmSaid.textContent !== t) this.dmSaid.textContent = t; };

  /* From listen(), while the part is open: the conversation on the screen, or
     the list. One request at a time for each. */
  Radio.prototype.dmTick = function () {
    var me = this;
    if (!this.dmBox || this.dmBox.hidden) return;
    var w = this.dmWith || '';
    if (this.dmBusy === w) return;
    this.dmBusy = w;
    call('/cb/dm', { body: w ? { with: w } : {} }, this.state.pass).then(function (r) {
      if (r.status === 401) return me.lost();
      if (w !== (me.dmWith || '')) return;
      if (r.status === 200 && r.body) {
        if (w) me.dmDrawTalk(r.body); else me.dmDrawInbox(r.body);
        if (me.dmFailed) { me.dmFailed = false; me.dmTold(''); }
        return;
      }
      me.dmFailed = true;
      me.dmTold(r.body && typeof r.body.error === 'string' ? r.body.error : 'Your messages could not be fetched just now. Still trying.');
    }, function () {
      if (w !== (me.dmWith || '')) return;
      me.dmFailed = true;
      me.dmTold('The street could not be reached just now. Still trying.');
    }).then(function () { if (me.dmBusy === w) me.dmBusy = null; });
  };

  /* Something pressed: send it, and draw what comes back, which is the list
     or the conversation. done is said in the status line; focus() says where
     the keyboard goes, and without one it goes to that line. */
  Radio.prototype.dmCall = function (body, done, focus) {
    var me = this;
    return call('/cb/dm', { body: body }, this.state.pass).then(function (r) {
      if (r.status === 401) { me.lost(); return null; }
      if (r.status === 200 && r.body) {
        if (Array.isArray(r.body.conversations)) {
          if (me.dmWith) me.dmShowInbox();
          me.dmDrawInbox(r.body);
        } else me.dmDrawTalk(r.body);
        me.dmTold(done || '');
        var to = focus && focus();
        if (to && !to.hidden && to.isConnected) to.focus(); else if (done) me.dmSaid.focus();
        return r.body;
      }
      me.dmTold((r.body && typeof r.body.error === 'string') ? r.body.error : 'That did not work just now. Nothing changed.');
      return null;
    }, function () { me.dmTold('The street could not be reached just now. Nothing changed.'); return null; });
  };

  Radio.prototype.dmShowInbox = function () {
    this.dmReplyStop();
    this.dmWith = null;
    this.dmTalk.hidden = true;
    this.dmInbox.hidden = false;
    this.dmSig = null;
    this.place();
    if (inChat()) this.chatShown();
  };

  /* The list: who has asked to message you, then everybody you are talking
     to, the latest first, then anybody you blocked. Drawn again only when it
     changes, and the keyboard stays on the same row when it is. */
  Radio.prototype.dmDrawInbox = function (b) {
    var me = this;
    this.dmOpenBtn.setAttribute('aria-pressed', String(!!b.open));
    this.dmOpenBtn.textContent = 'Let people message me: ' + (b.open ? 'on' : 'off');
    this.dmOpenNow.textContent = b.open
      ? 'Anybody with a claimed username can ask to message you. Their first message waits here until you answer it, accept it or reject it.'
      : 'Nobody new can message you. Conversations already going go on, and you can still write to people who take messages.';
    var convs = Array.isArray(b.conversations) ? b.conversations : [];
    var blocked = Array.isArray(b.blocked) ? b.blocked : [];
    this.dmInboxBody = b;
    var fresh = (this.news && this.news.dms) || [];
    if (inChat()) this.chatShown();
    var sig = JSON.stringify([convs, blocked, fresh]);
    if (sig === this.dmSig) return;
    this.dmSig = sig;
    var on = this.box.getRootNode().activeElement;
    var keep = on && this.dmLists.contains(on) ? on.dataset.dmKey : null;
    var box = this.dmLists;
    box.textContent = '';
    var asking = convs.filter(function (c) { return c.state === 'asking'; });
    var rest = convs.filter(function (c) { return c.state !== 'asking'; });
    function pick(c, key, label, aria) {
      var open = el('button', 'cb-btn cb-dm-pick', label);
      open.type = 'button';
      open.dataset.dmKey = key;
      if (aria) open.setAttribute('aria-label', aria);
      open.addEventListener('click', function () { me.dmOpen(c.handle); });
      return open;
    }
    if (asking.length) {
      box.appendChild(el('h3', 'cb-h3', 'Asking to message you'));
      var al = el('ul', 'cb-dm-list');
      asking.forEach(function (c) {
        var li = el('li', 'cb-dm-row');
        li.appendChild(pick(c, 'a|' + c.handle, 'Read ' + c.handle + '’s message'));
        if (c.text) li.appendChild(el('p', 'cb-dm-peek', firstWords(c.text)));
        al.appendChild(li);
      });
      box.appendChild(al);
    }
    box.appendChild(el('h3', 'cb-h3', 'Conversations'));
    if (!rest.length) {
      box.appendChild(el('p', 'cb-seen-now', 'None going. To write to somebody, press their name on Who’s online or their handle on the channel and choose Message, or type their username above.'));
    } else {
      var ul = el('ul', 'cb-dm-list');
      rest.forEach(function (c) {
        var li = el('li', 'cb-dm-row');
        var pk = pick(c, 'c|' + c.handle, c.handle, 'Your conversation with ' + c.handle);
        pk.dataset.label = 'Your conversation with ' + c.handle;
        markNew(pk, fresh.some(function (h) { return fold(h) === fold(c.handle); }));
        li.appendChild(pk);
        li.appendChild(el('p', 'cb-dm-peek', c.state === 'asked'
          ? 'Waiting for ' + c.handle + ' to answer.'
          : (c.last.mine ? 'You wrote last, ' : c.handle + ' wrote last, ') + clock(c.last.t) + '.'));
        ul.appendChild(li);
      });
      box.appendChild(ul);
    }
    if (blocked.length) {
      box.appendChild(el('h3', 'cb-h3', 'People you have blocked'));
      var bl = el('ul', 'cb-dm-list');
      blocked.forEach(function (h) {
        var li = el('li', 'cb-dm-row');
        li.appendChild(el('span', 'cb-handle', h));
        li.appendChild(document.createTextNode(' '));
        var un = el('button', 'cb-btn', 'Unblock');
        un.type = 'button';
        un.dataset.dmKey = 'b|' + h;
        un.setAttribute('aria-label', 'Unblock ' + h);
        un.addEventListener('click', function () {
          un.disabled = true;
          me.dmCall({ unblock: h }, h + ' is unblocked. If you both write, nothing that was said before is back.', function () { return start(); })
            .then(function (r) { if (!r) un.disabled = false; });
        });
        li.appendChild(un);
        bl.appendChild(li);
      });
      box.appendChild(bl);
    }
    function start() { return me.dmInbox.querySelector('#cb-dm-to'); }
    if (keep) {
      var again = box.querySelector('[data-dm-key="' + CSS.escape(keep) + '"]');
      if (again) again.focus();
    }
  };

  /* Open the conversation with `handle`: its own view, the keyboard on its
     heading, and the first answer drawn without reading every message out. */
  Radio.prototype.dmOpen = function (handle) {
    if (inChat()) this.chatViewDm();
    this.dmReplyStop();
    this.dmWith = String(handle);
    this.dmStateSig = null;
    this.dmBlockState = null;
    this.dmHead.dataset.who = '';
    this.dmHead.textContent = 'With ' + handle;
    this.dmLog.textContent = '';
    this.dmLog.setAttribute('aria-live', 'off');
    this.dmFirst = true;
    this.dmState.textContent = '';
    this.dmForm.hidden = true;
    this.dmLcd.hidden = true;
    this.dmBlockRow.textContent = '';
    this.dmTold('');
    this.dmInbox.hidden = true;
    this.dmTalk.hidden = false;
    if (this.dmBox.hidden) this.setDm(true); else this.dmTick();
    this.dmHead.focus();
    this.place();
    if (inChat()) this.chatShown();
  };

  Radio.prototype.dmBack = function () {
    var was = this.dmWith;
    this.dmShowInbox();
    this.dmTick();
    var row = was ? this.dmLists.querySelector('[data-dm-key="c|' + CSS.escape(was) + '"], [data-dm-key="a|' + CSS.escape(was) + '"]') : null;
    (row || (inChat() ? this.dmInbox.querySelector('#cb-dm-to') : this.dmBtn)).focus();
  };

  /* From a profile's Message button, or anywhere else that names somebody:
     the radio switched on and Normal for this page, and their conversation
     open. */
  Radio.prototype.dmTo = function (handle) {
    var me = this;
    if (!this.dmBox) return;
    if (this.state.folded) this.setFolded(false, true);
    if (this.tiny()) this.setSize('normal', true);
    this.dmOpen(handle);
    function go() { me.dmSec.scrollIntoView({ block: 'nearest' }); me.dmHead.focus(); }
    if (this.host.style.visibility === 'hidden') this.whenShown = go; else go();
  };

  /* A notification of a message opens the street at #cb=messages (cb-sw.js),
     and this opens the list with the keyboard on it. The address loses the
     fragment, so a reload does not open it again; the radio is switched on
     and made Normal for this page only, toProps' rule. */
  Radio.prototype.toMessages = function () {
    var me = this;
    try { history.replaceState(history.state, '', location.pathname + location.search); } catch (e) { /* the address stays */ }
    if (!this.dmBox) return;
    if (this.state.folded) this.setFolded(false, true);
    if (this.tiny()) this.setSize('normal', true);
    if (inChat()) this.chatViewDm();
    if (this.dmWith) this.dmShowInbox();
    if (this.dmBox.hidden) this.setDm(true); else this.dmTick();
    function go() { me.dmSec.scrollIntoView({ block: 'start' }); ((inChat() && me.chatDmAll) || me.dmBtn).focus(); }
    if (this.host.style.visibility === 'hidden') this.whenShown = go; else go();
  };

  Radio.prototype.dmDrawTalk = function (b) {
    var me = this;
    if (typeof b.handle === 'string' && b.handle) this.dmWith = b.handle;
    var who = this.dmWith;
    if (this.dmHead.dataset.who !== who) {
      this.dmHead.dataset.who = who;
      this.dmHead.textContent = '';
      this.dmHead.appendChild(document.createTextNode('With '));
      var hb = el('button', 'cb-handle', who);
      hb.type = 'button';
      hb.setAttribute('aria-haspopup', 'dialog');
      hb.addEventListener('click', function () { me.peek(who, hb); });
      this.dmHead.appendChild(hb);
      this.dmLab.textContent = 'Your message to ' + who;
    }
    var sig = b.state + '|' + b.can + '|' + (b.chat || '');
    if (this.dmStateSig !== sig) { this.dmStateSig = sig; this.dmDrawState(b); }
    this.dmForm.hidden = b.can !== 'yes';
    // A picture only once the conversation is accepted: a request is words only.
    var pics = b.can === 'yes' && b.state === 'open';
    this.dmPicBtn.hidden = !pics;
    if (!pics && this.dmPicture) this.dmDropPicture();
    // So with a sticker, and a reaction (dmDrawActs).
    this.dmStickBtn.hidden = !pics;
    if (!pics && !this.dmStickBox.hidden) this.setStickers(false, 'dm');
    // So with a reply.
    if (!pics) this.dmReplyStop();
    this.dmLive = pics;
    var msgs = Array.isArray(b.messages) ? b.messages : [];
    this.dmDrawLog(msgs);
    this.dmReadTick(msgs);
    this.dmBlockShown(msgs.length > 0 && b.can !== 'blocked');
  };

  /* Where it stands, in words, with Accept and Reject on a request. */
  Radio.prototype.dmDrawState = function (b) {
    var me = this, box = this.dmState, who = this.dmWith;
    box.textContent = '';
    if (b.can === 'blocked') {
      box.appendChild(el('p', null, 'You have blocked ' + who + '. Unblock them under All messages, and you can write to each other again.'));
      return;
    }
    if (b.can === 'closed') {
      box.appendChild(el('p', null, who + ' is not taking messages from you just now.'));
      return;
    }
    /* THEIR CHAT STATUS, before anything is written (Ryan's ask, 2026-10-24:
       check it before messaging somebody), with what the badge asks and what
       that means here. A sign and never a lock: the box is still there. */
    var cs = chatOf(b.chat);
    if (cs) {
      var cl = el('p', 'cb-dm-chat');
      cl.appendChild(document.createTextNode(who + ' shows '));
      cl.appendChild(chatBadge(cs.id, true));
      cl.appendChild(document.createTextNode(': ' + cs.says + ' ' + cs.then));
      box.appendChild(cl);
    }
    if (b.state === 'asked') {
      box.appendChild(el('p', 'cb-seen-now', 'Waiting for ' + who + ' to answer. Until they do, only the two of you can read it and you can write nothing more, but you can edit it or take it back. If they reject it, it goes, and nobody is told.'));
      return;
    }
    if (b.state === 'new') {
      box.appendChild(el('p', 'cb-seen-now', 'Nothing between you yet. Your first message waits for ' + who + ' to answer it, and you can write nothing more until they do.'));
      return;
    }
    if (b.state !== 'asking') return;
    box.appendChild(el('p', null, who + ' asks to message you. They can write nothing more until you answer. Answering, or Accept, starts the conversation; Reject deletes their message, and nobody is told.'));
    var row = el('div', 'cb-acct__row');
    var yes = el('button', 'cb-btn', 'Accept');
    yes.type = 'button';
    var no = el('button', 'cb-btn', 'Reject');
    no.type = 'button';
    row.appendChild(yes);
    row.appendChild(no);
    box.appendChild(row);
    var sure = el('div', 'cb-forget-sure');
    sure.hidden = true;
    sure.appendChild(el('p', null, 'This deletes ' + who + '’s message, and nobody is told. They can ask again. It cannot be undone.'));
    var sy = el('button', 'cb-btn', 'Yes, reject it');
    sy.type = 'button';
    var sn = el('button', 'cb-btn', 'Not now');
    sn.type = 'button';
    sure.appendChild(sy);
    sure.appendChild(sn);
    box.appendChild(sure);
    yes.addEventListener('click', function () {
      yes.disabled = true;
      me.dmCall({ with: who, accept: true }, 'Accepted. You can write to each other now.', function () { return me.dmSay; })
        .then(function (r) { if (!r) yes.disabled = false; });
    });
    no.addEventListener('click', function () { sure.hidden = false; row.hidden = true; sn.focus(); });
    sn.addEventListener('click', function () { sure.hidden = true; row.hidden = false; no.focus(); });
    sy.addEventListener('click', function () {
      sy.disabled = true;
      me.dmCall({ with: who, reject: true }, 'Rejected and deleted.').then(function (r) { if (!r) sy.disabled = false; });
    });
  };

  /* The messages, each drawn once and its words again only when they change,
     so the keyboard and anything half-written stay put while the rest is
     asked again every few seconds. It follows the newest message only when
     the log was at the bottom, or you have just sent one: the channel's rule. */
  Radio.prototype.dmDrawLog = function (msgs) {
    var me = this, log = this.dmLog;
    var atEnd = log.scrollHeight - log.scrollTop - log.clientHeight < 24;
    var want = {}, added = 0, prev = null;
    msgs.forEach(function (m) { want[m.id] = m; });
    this.dmNow = msgs;
    Array.prototype.slice.call(log.children).forEach(function (li) {
      if (want[li.dataset.id]) return;
      if (me.dmReplying && me.dmReplying.id === li.dataset.id) {
        me.dmReplyStop();
        me.dmTold('The message you were replying to is no longer in this conversation. What you write now goes on its own.');
      }
      li.remove();
    });
    msgs.forEach(function (m) {
      var li = log.querySelector(':scope > li[data-id="' + CSS.escape(m.id) + '"]');
      if (!li) {
        li = me.dmMsg(m);
        // Its quote before it goes into the log, so it is read in order.
        me.drawRe(li, m, msgs, log, RE_GONE_DM);
        added++;
        if (prev) prev.after(li); else log.prepend(li);
      } else {
        if (!li.dmEditing && (li.dmText !== m.text || li.dmEdited !== (m.edited || 0))) me.dmWords(li, m);
        if (li.dmLive !== me.dmLive) me.dmDrawActs(li, m);
        me.drawReactions(li, m, function (e) { me.dmReact(m.id, e); });
        me.drawRe(li, m, msgs, log, RE_GONE_DM);
      }
      prev = li;
    });
    this.dmLcd.hidden = !msgs.length;
    if (this.dmFirst) {
      this.dmFirst = false;
      log.scrollTop = log.scrollHeight;
      log.setAttribute('aria-live', 'polite');
    } else if (added && (atEnd || this.dmJustSent)) log.scrollTop = log.scrollHeight;
    this.dmJustSent = false;
  };

  /* A MESSAGE IS DRAWN AS THE CHANNEL'S ARE (Ryan's ask, 2026-10-20:
     everything group chat does, the same interface): the handle opens their
     profile, then the words, a picture or sticker, the reactions, and React
     and the three dots on the message's own line. */
  Radio.prototype.dmMsg = function (m) {
    var me = this, li = el('li', 'cb-msg cb-dm-msg' + (m.base ? ' cb-msg--base' : ''));
    li.dataset.id = m.id;
    var head = el('p', 'cb-head');
    var who = el('button', 'cb-handle', m.handle);
    who.type = 'button';
    who.setAttribute('aria-haspopup', 'dialog');
    who.addEventListener('click', function () { me.peek(m.handle, who, m); });
    head.appendChild(who);
    if (m.base) head.appendChild(el('span', 'cb-tag', 'BASE'));
    var tm = el('time', 'cb-time', clock(m.t));
    tm.dateTime = new Date(m.t).toISOString();
    head.appendChild(tm);
    li.appendChild(head);
    li.appendChild(el('div', 'cb-text'));
    this.dmWords(li, m);
    li.dmImg = !!m.img;
    if (m.img) li.appendChild(this.picture_(m, '/cb/dm/image?id='));
    if (m.sticker) li.appendChild(sticker(m.sticker));
    if (m.avatar) li.appendChild(avatarSticker(m.avatar));
    if (m.chimera) li.appendChild(chimeraSticker(m.chimera));
    if (m.patch) li.appendChild(patchSticker(m.patch));
    if (m.jacket) li.appendChild(jacketSticker(m.jacket));
    li.dmStuck = !!(m.sticker || m.avatar || m.chimera || m.patch || m.jacket);
    var rx = el('div', 'cb-rx');
    rx.setAttribute('aria-live', 'off');
    li.appendChild(rx);
    this.drawReactions(li, m, function (e) { me.dmReact(m.id, e); });
    this.dmDrawActs(li, m);
    return li;
  };

  Radio.prototype.dmWords = function (li, m) {
    var words = li.querySelector(':scope > .cb-text');
    words.textContent = '';
    words.cbRaw = m.text || '';
    md(words, m.text || '');
    // An @name is drawn as a name, as on the channel: here only the two of you.
    this.markAt(words, this.dmWith ? [this.dmWith] : []);
    li.dmText = m.text;
    li.dmEdited = m.edited || 0;
    this.markEdited(li, m);
  };

  /* React and the three dots, on the message's line, as on the channel. React
     only in an open conversation; under the dots, Copy, and on your own
     message Edit and Take back, on theirs Report. Drawn again only when the
     conversation opens or stops being open, with the keyboard kept on them. */
  Radio.prototype.dmDrawActs = function (li, m) {
    var me = this, on = this.box.getRootNode().activeElement;
    var was = li.querySelector(':scope > .cb-acts'), old = li.querySelector(':scope > .cb-more-menu');
    var held = !!on && ((was && was.contains(on)) || (old && old.contains(on)));
    if (was) was.remove();
    if (old) old.remove();
    shutPick(li);
    li.dmLive = this.dmLive;
    var acts = el('div', 'cb-acts');
    if (this.dmLive) acts.appendChild(this.reactBtn(m, li, function (e) { me.dmReact(m.id, e); }));
    if (this.dmLive) acts.appendChild(this.replyBtn(m, function () { me.dmReplyStart(m.id); }));
    var more = this.dmMore(m, li);
    acts.appendChild(more.btn);
    li.appendChild(acts);
    li.appendChild(more.box);
    if (held) more.btn.focus();
  };

  Radio.prototype.dmMore = function (m, li) {
    var me = this, items = [];
    if (m.text) items.push(this.copyBtn(m, li, function (t) { me.dmTold(t); }));
    if (VOICE) items.push(this.readBtn(m, li, function (t) { me.dmTold(t); }));
    if (m.mine) {
      var ed = el('button', 'cb-btn cb-edit-btn', 'Edit');
      ed.type = 'button';
      ed.setAttribute('aria-label', 'Edit your message ' + sentAt(m.t));
      ed.addEventListener('click', function () { shutMore(li); me.dmEdit(li, m.id); });
      var tb = el('button', 'cb-btn cb-take', 'Take back');
      tb.type = 'button';
      tb.setAttribute('aria-label', 'Take back your message ' + sentAt(m.t));
      tb.addEventListener('click', function () {
        shutMore(li);
        me.dmSure(li, 'This deletes your message for both of you. It cannot be undone.', 'Yes, take it back', function () {
          return me.dmCall({ with: me.dmWith, take: m.id }, 'Taken back.');
        });
      });
      items.push(ed);
      items.push(tb);
    } else {
      var rp = el('button', 'cb-btn cb-take', 'Report');
      rp.type = 'button';
      rp.setAttribute('aria-label', 'Report ' + m.handle + '’s message ' + sentAt(m.t) + ' to the moderators');
      rp.addEventListener('click', function () { shutMore(li); me.dmReport(li, m); });
      items.push(rp);
    }
    return this.moreMenu(m, li, items);
  };

  // The line's buttons, out of the way while a question or an edit is open
  // under the message, and the keyboard back on the dots when it shuts.
  function dmActsOff(li, off) {
    var a = li.querySelector(':scope > .cb-acts');
    if (!a) return;
    a.hidden = !!off;
    if (!off) { var d = a.querySelector('.cb-more') || a.firstChild; if (d) d.focus(); }
  }

  // A reaction, or yours taken back: the channel's, in this conversation.
  Radio.prototype.dmReact = function (id, emoji) {
    return this.dmCall({ with: this.dmWith, react: id, emoji: emoji });
  };

  // Ask once more, under the message, with the keyboard on Not now.
  Radio.prototype.dmSure = function (li, text, yesText, act) {
    var sure = el('div', 'cb-forget-sure cb-dm-sure');
    sure.appendChild(el('p', null, text));
    var y = el('button', 'cb-btn cb-copy', yesText);
    y.type = 'button';
    var n = el('button', 'cb-btn cb-copy', 'Not now');
    n.type = 'button';
    sure.appendChild(y);
    sure.appendChild(n);
    dmActsOff(li, true);
    li.appendChild(sure);
    n.focus();
    function shut() { sure.remove(); dmActsOff(li, false); }
    n.addEventListener('click', shut);
    sure.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); shut(); } });
    y.addEventListener('click', function () {
      y.disabled = true;
      act().then(function (r) { if (!r) y.disabled = false; });
    });
  };

  /* EDIT, in the words' place: the channel's rule, the old words kept
     nowhere, and the message still gone 48 hours after it was sent. */
  Radio.prototype.dmEdit = function (li, id) {
    if (li.dmEditing) return;
    li.dmEditing = true;
    var me = this, words = li.querySelector(':scope > .cb-text');
    words.hidden = true;
    shutMore(li);
    shutPick(li);
    dmActsOff(li, true);
    var f = el('form', 'cb-edit cb-dm-edit');
    var lab = el('label', 'cb-lab', 'Edit your message');
    lab.htmlFor = 'cb-dm-edit-' + id;
    var ta = el('textarea', 'cb-say');
    ta.id = 'cb-dm-edit-' + id;
    sendBox(ta, 'done');
    ta.maxLength = MESSAGE_MAX;
    ta.value = li.dmText || '';
    var save = el('button', 'cb-btn cb-copy', 'Save');
    save.type = 'submit';
    var cancel = el('button', 'cb-btn cb-copy', 'Cancel');
    cancel.type = 'button';
    var r = el('div', 'cb-acct__row cb-edit__row');
    r.appendChild(save);
    r.appendChild(cancel);
    f.appendChild(lab);
    f.appendChild(ta);
    f.appendChild(r);
    li.appendChild(f);
    ta.focus();
    function stop(back) {
      f.remove();
      words.hidden = false;
      li.dmEditing = false;
      if (back) dmActsOff(li, false); else { var a = li.querySelector(':scope > .cb-acts'); if (a) a.hidden = false; }
    }
    cancel.addEventListener('click', function () { stop(true); });
    ta.addEventListener('keydown', function (e) {
      if (e.isComposing) return;
      if (e.key === 'Escape') { e.preventDefault(); stop(true); }
      else if (sendKey(e)) { e.preventDefault(); f.requestSubmit(); }
    });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!ta.value.trim() && !li.dmImg && !li.dmStuck) { me.dmTold('A message needs words. Take it back instead, if you want it gone.'); ta.focus(); return; }
      save.disabled = true;
      me.dmCall({ with: me.dmWith, edit: id, text: ta.value }).then(function (b) {
        if (!b) { save.disabled = false; return; }
        stop(false);
        if (Array.isArray(b.messages)) me.dmDrawLog(b.messages);
        if (li.isConnected) dmActsOff(li, false);
        me.dmTold('Edited.');
      });
    });
  };

  /* REPORT: a copy of this one message onto the moderators' desk, with who
     reported it and a note if they write one. The sender is not told. */
  Radio.prototype.dmReport = function (li, m) {
    var me = this;
    var f = el('form', 'cb-forget-sure cb-dm-sure');
    f.appendChild(el('p', null, 'This sends a copy of this message, who sent it and when, to the moderators’ desk, with your username and a note if you write one. ' + m.handle + ' is not told. Only moderators read it, and it is deleted when they close it, or after thirty days.'));
    var lab = el('label', 'cb-lab', 'A note for the moderators, if you like');
    lab.htmlFor = 'cb-dm-note-' + m.id;
    var ta = el('textarea', 'cb-say');
    ta.id = 'cb-dm-note-' + m.id;
    ta.rows = 2;
    ta.maxLength = 280;
    var y = el('button', 'cb-btn cb-copy', 'Send the report');
    y.type = 'submit';
    var n = el('button', 'cb-btn cb-copy', 'Not now');
    n.type = 'button';
    var r = el('div', 'cb-acct__row');
    r.appendChild(y);
    r.appendChild(n);
    f.appendChild(lab);
    f.appendChild(ta);
    f.appendChild(r);
    dmActsOff(li, true);
    li.appendChild(f);
    ta.focus();
    function shut(back) { f.remove(); if (back) dmActsOff(li, false); else { var a = li.querySelector(':scope > .cb-acts'); if (a) a.hidden = false; } }
    n.addEventListener('click', function () { shut(true); });
    f.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); shut(true); } });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      y.disabled = true;
      me.dmCall({ with: me.dmWith, report: m.id, note: ta.value }, 'Reported. The moderators have it. If you do not want to hear from ' + m.handle + ', Block them below.')
        .then(function (b) { if (b) shut(false); else y.disabled = false; });
    });
  };

  /* BLOCK, under the conversation, asking once more. Built again only when
     the person or whether it is shown changes. */
  Radio.prototype.dmBlockShown = function (show) {
    var me = this, box = this.dmBlockRow, who = this.dmWith;
    var sig = who + '|' + show;
    if (this.dmBlockState === sig) return;
    this.dmBlockState = sig;
    box.textContent = '';
    if (!show) return;
    var b = el('button', 'cb-btn', 'Block ' + who);
    b.type = 'button';
    var sure = el('div', 'cb-forget-sure');
    sure.hidden = true;
    sure.appendChild(el('p', null, 'This stops ' + who + ' writing to you, and you to them, and deletes your conversation for both of you. They are not told: if they try to write, they are told you are not taking messages from them. Report anything first, if you want the moderators to see it. You can unblock them from All messages.'));
    var y = el('button', 'cb-btn', 'Yes, block ' + who);
    y.type = 'button';
    var n = el('button', 'cb-btn', 'Not now');
    n.type = 'button';
    sure.appendChild(y);
    sure.appendChild(n);
    box.appendChild(b);
    box.appendChild(sure);
    b.addEventListener('click', function () { sure.hidden = false; b.hidden = true; n.focus(); });
    n.addEventListener('click', function () { sure.hidden = true; b.hidden = false; b.focus(); });
    y.addEventListener('click', function () {
      y.disabled = true;
      me.dmCall({ with: who, block: true }, who + ' is blocked.').then(function (r) { if (!r) y.disabled = false; });
    });
  };

  // A picture chosen, and redrawn at once, the channel's way.
  Radio.prototype.dmPickPicture = function (file) {
    var me = this;
    this.dmPicFile.value = '';
    if (!file) return;
    if (!/^image\//.test(file.type)) { this.dmTold('That is not a picture.'); return; }
    this.dmTold('');
    picPending(this.dmPicReady, this.dmPicShown, this.dmPicLine, file);
    redraw(file).then(function (blob) {
      me.dmPicture = blob;
      picReady(me.dmPicReady, me.dmPicShown, me.dmPicLine, blob, file);
      me.dmPicAlt.focus({ preventScroll: true });
    }).catch(function () {
      picFailed(me.dmPicReady, me.dmPicShown, me.dmPicLine, !!me.dmPicture);
      me.dmTold('The radio could not read that picture.');
    });
  };

  Radio.prototype.dmDropPicture = function () {
    this.dmPicture = null;
    this.dmPicAlt.value = '';
    picGone(this.dmPicReady, this.dmPicShown);
  };

  /* A reply in a conversation: the channel's bar, sending here. */
  Radio.prototype.dmReplyStart = function (id) {
    var m = (this.dmNow || []).filter(function (x) { return x.id === id; })[0];
    if (!m || this.dmForm.hidden) return;
    this.dmReplying = { id: id };
    reOn(this.dmReBar, this.dmSay, m);
    this.dmSay.focus();
    this.dmReBar.scrollIntoView({ block: 'nearest' });
  };
  Radio.prototype.dmReplyStop = function () {
    if (!this.dmReplying) return;
    this.dmReplying = null;
    reOff(this.dmReBar, this.dmSay);
  };

  Radio.prototype.dmSend = function () {
    var me = this, say = this.dmSay, text = say.value, who = this.dmWith, picture = this.dmPicture, re = this.dmReplying;
    if (!who) return;
    if (!text.trim() && !picture) { this.dmTold('Write something, or add a picture, first.'); say.focus(); return; }
    if (this.dmSending) return;
    this.dmSending = true;
    if (picture) this.dmTold('Sending the picture…');
    var first = picture ? sendDmPicture(picture, who, this.state.pass) : Promise.resolve(null);
    first.then(function (up) {
      if (up && up.status !== 200) return up;
      var body = { with: who, send: text };
      if (re) body.re = re.id;
      if (up) { body.img = up.body.id; body.alt = me.dmPicAlt.value.trim(); }
      return call('/cb/dm', { body: body }, me.state.pass);
    }).then(function (r) {
      if (r.status === 401) return me.lost();
      if (who !== me.dmWith && String(who).toLowerCase() !== String(me.dmWith || '').toLowerCase()) return;
      if (r.status === 200 && r.body) {
        say.value = '';
        me.grow(say);
        if (picture) me.dmDropPicture();
        if (me.dmReplying === re) me.dmReplyStop();
        me.dmJustSent = true;
        me.dmDrawTalk(r.body);
        me.dmTold(r.body.asked ? 'Sent. It waits for ' + me.dmWith + ' to answer it.' : r.body.accepted ? 'Sent, which accepts what ' + me.dmWith + ' asked.' : '');
        if (me.dmForm.hidden) me.dmSaid.focus(); else say.focus();
        return;
      }
      if (r.status === 409 && r.body && r.body.gone === 're' && me.dmReplying === re) me.dmReplyStop();
      me.dmTold((r.body && typeof r.body.error === 'string') ? r.body.error : 'That did not send just now. Your words are still in the box.');
    }, function () { me.dmTold('The street could not be reached just now. It did not send; your words are still in the box.'); })
      .then(function () { me.dmSending = false; });
  };

  /* ── Your props ──────────────────────────────────────────────────────── */

  /* A notification that somebody gave you props opens the street at #cb=props
     (cb-sw.js), and this opens Profile there with the keyboard on Your props.
     The address loses #cb=props, so a reload does not open it again. The radio
     is switched on and made Normal for this page only, because that is what
     the press asked for; what it remembers between pages is left alone. */
  Radio.prototype.toProps = function () {
    try { history.replaceState(history.state, '', location.pathname + location.search); } catch (e) { /* the address stays */ }
    if (this.state.folded) this.setFolded(false, true);
    if (this.tiny()) this.setSize('normal', true);
    if (this.petsPanel.hidden) this.setPets(true);
    if (this.pfSecs.props.body.hidden) this.pfOpen('props', true);
    var head = this.pfSecs.props.btn;
    function go() { head.scrollIntoView({ block: 'start' }); head.focus(); }
    // Until cb.css has loaded the radio is hidden, and nothing hidden takes focus.
    if (this.host.style.visibility === 'hidden') this.whenShown = go; else go();
  };

  Radio.prototype.loadProps = function () {
    var me = this;
    me.prBox.textContent = '';
    me.prShow.textContent = '';
    me.prSaid.textContent = '';
    me.prState.hidden = false;
    me.prState.className = 'cb-quiet';
    me.prState.textContent = 'Looking for your props\u2026';
    call('/cb/props', null, me.state.pass).then(function (r) {
      if (r.status === 200 && r.body) { me.drawProps(r.body); return; }
      me.prState.textContent = r.status === 401
        ? 'Since you signed on, this username has been signed off. Sign on again at the Community Center.'
        : 'Your props could not be fetched just now.';
    }, function () { me.prState.textContent = 'Your props could not be fetched just now.'; });
  };

  /* Send something about your props and draw them again from the answer.
     focus() says where the keyboard goes once they are drawn; without one it
     goes to the line that says what happened. */
  Radio.prototype.propSend = function (body, done, focus) {
    var me = this;
    return call('/cb/props', { body: body }, me.state.pass).then(function (r) {
      if (r.status === 200 && r.body) {
        me.drawProps(r.body);
        me.prSaid.textContent = done;
        var to = focus && focus();
        (to || me.prSaid).focus();
        return true;
      }
      me.prSaid.textContent = r.status === 401
        ? 'Since you signed on, this username has been signed off. Sign on again at the Community Center.'
        : (r.body && typeof r.body.error === 'string') ? r.body.error : 'That did not work just now. Nothing changed.';
      return false;
    }, function () { me.prSaid.textContent = 'The street could not be reached just now. Nothing changed.'; return false; });
  };

  /* YOUR PROPS: what is waiting, each with Confirm and Reject, and what is up,
     each with a way to take it off, both newest first. Reject and taking one
     off ask once more, because neither can be undone; Confirm does not, because
     a prop that is up can always come off again. */
  Radio.prototype.drawProps = function (b) {
    var me = this, box = this.prBox;
    box.textContent = '';
    this.prShow.textContent = '';
    this.prState.hidden = false;
    this.prState.className = 'cb-props__about';
    if (!b.claimed) {
      this.prState.textContent = 'Claim your username under Account and you can open a Props tab on your profile, where anybody with a claimed username can give you props: a sentence or a short paragraph thanking you for something. Nothing goes up until you confirm it.';
      return;
    }
    this.prState.textContent = 'Props are what people with a claimed username write to thank you, acknowledge you or celebrate you. Each one waits here until you confirm it; then it is on your profile\u2019s Props tab, with their username on it. Reject one and it is deleted, and nobody is told.';
    this.propShow(b);
    var waiting = b.waiting || [], up = b.props || [];
    if (waiting.length) {
      box.appendChild(el('p', 'cb-props__sub', 'Waiting for you'));
      var wl = el('ul', 'cb-props__list cb-props__list--waiting');
      waiting.forEach(function (p) {
        var li = el('li', 'cb-prop');
        me.propWords(li, p, function () { return null; });
        var row = el('div', 'cb-acct__row');
        var yes = el('button', 'cb-btn cb-prop__confirm', 'Confirm');
        yes.type = 'button';
        yes.setAttribute('aria-label', 'Confirm the props from ' + p.handle + ', which puts them on your profile');
        var no = el('button', 'cb-btn', 'Reject');
        no.type = 'button';
        no.setAttribute('aria-label', 'Reject the props from ' + p.handle);
        row.appendChild(yes); row.appendChild(no);
        li.appendChild(row);
        var sure = el('div', 'cb-forget-sure');
        sure.hidden = true;
        sure.appendChild(el('p', null, 'This deletes it, and nobody is told. It cannot be undone.'));
        var sureYes = el('button', 'cb-btn', 'Yes, reject it');
        sureYes.type = 'button';
        var sureNo = el('button', 'cb-btn', 'Leave it waiting');
        sureNo.type = 'button';
        sure.appendChild(sureYes); sure.appendChild(sureNo);
        li.appendChild(sure);
        // After either, the keyboard goes to the next prop waiting, if any.
        var next = function () { return box.querySelector('.cb-prop__confirm'); };
        yes.addEventListener('click', function () {
          yes.disabled = true;
          me.propSend({ confirm: p.id }, 'Confirmed. It is on your profile\u2019s Props tab.', next).then(function (ok) { if (!ok) yes.disabled = false; });
        });
        no.addEventListener('click', function () { sure.hidden = false; row.hidden = true; sureNo.focus(); });
        sureNo.addEventListener('click', function () { sure.hidden = true; row.hidden = false; no.focus(); });
        sureYes.addEventListener('click', function () {
          sureYes.disabled = true;
          me.propSend({ reject: p.id }, 'Rejected and deleted.', next).then(function (ok) { if (!ok) sureYes.disabled = false; });
        });
        wl.appendChild(li);
      });
      box.appendChild(wl);
    }
    if (up.length) {
      box.appendChild(el('p', 'cb-props__sub', 'On your profile'));
      var ul = el('ul', 'cb-props__list');
      up.forEach(function (p) {
        var li = el('li', 'cb-prop');
        me.propWords(li, p, function () { return null; });
        var off = el('button', 'cb-btn', 'Take it off my profile');
        off.type = 'button';
        off.setAttribute('aria-label', 'Take the props from ' + p.handle + ' off my profile');
        var row = el('div', 'cb-acct__row');
        row.appendChild(off);
        li.appendChild(row);
        var sure = el('div', 'cb-forget-sure');
        sure.hidden = true;
        sure.appendChild(el('p', null, 'This takes it off your profile and deletes it. Nobody is told. It cannot be undone.'));
        var sureYes = el('button', 'cb-btn', 'Yes, take it off');
        sureYes.type = 'button';
        var sureNo = el('button', 'cb-btn', 'Leave it up');
        sureNo.type = 'button';
        sure.appendChild(sureYes); sure.appendChild(sureNo);
        li.appendChild(sure);
        off.addEventListener('click', function () { sure.hidden = false; row.hidden = true; sureNo.focus(); });
        sureNo.addEventListener('click', function () { sure.hidden = true; row.hidden = false; off.focus(); });
        sureYes.addEventListener('click', function () {
          sureYes.disabled = true;
          me.propSend({ remove: p.id }, 'Taken off your profile.').then(function (ok) { if (!ok) sureYes.disabled = false; });
        });
        ul.appendChild(li);
      });
      box.appendChild(ul);
    }
    if (!waiting.length && !up.length && b.open) box.appendChild(el('p', 'cb-quiet', 'Nobody has given you props yet.'));
    if (b.open) {
      var see = el('button', 'cb-btn', 'See my Props tab as others do');
      see.type = 'button';
      see.setAttribute('aria-haspopup', 'dialog');
      see.addEventListener('click', function () { me.peek(me.state.handle, see, me.myMark(), 'props'); });
      var seeRow = el('p', 'cb-acct__row');
      seeRow.appendChild(see);
      box.appendChild(seeRow);
    }
  };

  /* OPENING YOUR PROPS TAB, off until you switch it on, and only on a claimed
     username, the other tabs' rule. Shut, nobody can give you props and your
     tab shows none of them; what you confirmed is kept for when you open it. */
  Radio.prototype.propShow = function (b) {
    var me = this, box = this.prShow;
    box.textContent = '';
    var on = !!b.open;
    var t = el('button', 'cb-btn cb-pets-show', 'Show my props on the CB: ' + (on ? 'on' : 'off'));
    t.type = 'button';
    t.setAttribute('aria-pressed', String(on));
    box.appendChild(t);
    box.appendChild(el('p', 'cb-quiet', on
      ? 'Anybody signed on to the CB who opens your profile, from your handle on the channel or your name on Who\u2019s online, reads the props you confirmed on its Props tab, and anybody with a claimed username can give you props there.'
      : 'Off: your Props tab shows none of them, and nobody can give you props. Switch it on to open it. Props you confirmed before are kept, and come back when you do.'));
    t.addEventListener('click', function () {
      t.disabled = true;
      me.propSend({ show: !on }, on ? 'Your Props tab is shut.' : 'Your Props tab is open.', function () {
        return me.prShow.querySelector('.cb-pets-show');
      }).then(function (ok) { if (!ok) t.disabled = false; });
    });
  };

  /* ── Your chimeras ───────────────────────────────────────────────────── */
  Radio.prototype.loadChimeras = function () {
    var me = this;
    me.chState.hidden = false;
    me.chState.textContent = 'Looking for your chimeras\u2026';
    withChimera(function () {
      call('/cb/chimeras', null, me.state.pass).then(function (r) {
        if (r.status === 200 && r.body.chimeras) { me.drawChimeras(r.body); return; }
        me.chState.textContent = r.status === 401
          ? 'Since you signed on, this username has been signed off. Sign on again at the Community Center.'
          : 'Your chimeras could not be fetched just now.';
      }, function () { me.chState.textContent = 'Your chimeras could not be fetched just now.'; });
    });
  };

  Radio.prototype.chimeraSend = function (body, said, done) {
    var me = this;
    return call('/cb/chimeras', { body: body }, me.state.pass).then(function (r) {
      if (r.status === 200 && r.body.chimeras) { me.drawChimeras(r.body, done); return true; }
      if (r.status === 401) { said.textContent = 'Since you signed on, this username has been signed off. Sign on again at the Community Center.'; return false; }
      said.textContent = (r.body && typeof r.body.error === 'string') ? r.body.error : 'That did not work just now. Nothing changed.';
      return false;
    }, function () { said.textContent = 'The street could not be reached just now. Nothing changed.'; return false; });
  };

  /* YOUR CHIMERAS: each one drawn, with its name and which animal gave which
     part; renamed; opened back on the table in Chimera Obscura; downloaded;
     and deleted, which asks once more. The answer to a press goes on that
     chimera's own card. */
  Radio.prototype.drawChimeras = function (b, told) {
    var me = this, ul = this.chList, claimed = !!b.claimed, C = window.loveChimera;
    this.chSayings = b.sayingsMax;
    this.chSayingMax = b.sayingMax;
    ul.textContent = '';
    var w = this.chWhere;
    w.textContent = '';
    w.appendChild(document.createTextNode('Make one in '));
    var room = el('a', null, 'Chimera Obscura'); room.href = '/chimera-obscura.html';
    w.appendChild(room);
    w.appendChild(document.createTextNode(claimed
      ? ' and keep it here, and send it from Sticker. They are kept under your username, scrambled, and only your password reaches them.'
      : ' and keep it here, and send it from Sticker. They are kept under the handle ' + this.state.handle + ', scrambled. A handle is not an account: anybody who signs on with it sees them too. Claim your username under Account to show them in your profile.'));
    this.chimeraShow(b, told && told.show);
    if (!b.chimeras.length) {
      ul.hidden = true;
      this.chState.hidden = false;
      this.chState.textContent = told && told.said ? told.said + ' No chimeras now.' : 'No chimeras yet.';
      return;
    }
    this.chState.hidden = true;
    ul.hidden = false;
    b.chimeras.slice().reverse().forEach(function (c) {
      var li = el('li', 'cb-avatar');
      li.appendChild(chimeraArt(c.parts, 'cb-avatar__art'));
      var words = el('div', 'cb-avatar__words');
      var shown = c.name || C.suggest(c.parts);
      words.appendChild(el('p', 'cb-pet__name', shown));
      words.appendChild(el('p', 'cb-pet__about', C.words(c.parts)));
      chimeraSays(words, c.sayings);
      var said = el('p', 'cb-quiet', ''); said.setAttribute('role', 'status');
      var row = el('div', 'cb-acct__row');
      var rename = el('button', 'cb-btn', 'Its name and sayings'); rename.type = 'button';
      row.appendChild(rename);
      var open = el('a', 'cb-btn', 'Put it back on the table');
      open.href = '/chimera-obscura.html#chimera=' + C.code(c.parts);
      row.appendChild(open);
      row.appendChild(saveButton(shown, function () { return li.querySelector('.cb-avatar__art svg'); },
        'chimera-' + fileName(shown), null, said));
      var take = el('button', 'cb-btn', 'Take it with me'); take.type = 'button';
      row.appendChild(take);
      take.addEventListener('click', function () {
        withFamiliar(function (fam) {
          said.textContent = fam.take({ parts: c.parts, name: shown, sayings: c.sayings || [], kept: c.id })
            ? shown + ' is your familiar now, and follows you from room to room. Press it to move it, let it move by itself, or send it home.'
            : 'Your browser would not keep it, so it cannot follow you.';
        });
      });
      var del = el('button', 'cb-btn', 'Delete it'); del.type = 'button';
      row.appendChild(del);
      words.appendChild(row);
      var form = el('div', 'cb-acct__form'); form.hidden = true;
      words.appendChild(form);
      rename.addEventListener('click', function () {
        form.textContent = ''; form.hidden = false; rename.hidden = true;
        var n = field('Its name', 'cb-ch-name-' + c.id, 'text');
        n.input.maxLength = 24; n.input.autocomplete = 'off'; n.input.value = c.name || '';
        form.appendChild(n.wrap);
        /* ITS SAYINGS (Ryan, 2026-10-19), edited beside its name: what it
           says when it is pressed as a familiar, in a speech bubble when it
           may move by itself, and under it in your profile. */
        var sw = el('p', 'cb-acct__field');
        var sl = el('label', 'cb-lab', 'Its sayings, one to a line');
        sl.htmlFor = 'cb-ch-says-' + c.id;
        var sa = el('textarea', 'cb-say');
        sa.id = 'cb-ch-says-' + c.id; sa.rows = 4; sa.spellcheck = true;
        sa.value = (c.sayings || []).join('\n');
        var shint = el('span', 'cb-quiet', 'Up to ' + (me.chSayings || 5) + ' lines, each up to ' + (me.chSayingMax || 80) + ' characters.');
        shint.id = 'cb-ch-says-hint-' + c.id;
        sa.setAttribute('aria-describedby', shint.id);
        sw.appendChild(sl); sw.appendChild(sa); sw.appendChild(shint);
        form.appendChild(sw);
        var go = el('button', 'cb-btn', 'Save'); go.type = 'button';
        var keep = el('button', 'cb-btn', 'Leave it as it is'); keep.type = 'button';
        form.appendChild(go); form.appendChild(keep);
        n.input.focus();
        keep.addEventListener('click', function () { form.hidden = true; rename.hidden = false; rename.focus(); });
        go.addEventListener('click', function () {
          go.disabled = true;
          var lines = sa.value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
          me.chimeraSend({ edit: c.id, name: n.input.value, sayings: lines }, said, { id: c.id, said: 'Saved.' })
            .then(function () { go.disabled = false; });
        });
      });
      var sure = el('div', 'cb-forget-sure'); sure.hidden = true;
      sure.appendChild(el('p', null, 'This deletes it. It cannot be undone.'));
      var yes = el('button', 'cb-btn', 'Yes, delete it'); yes.type = 'button';
      var no = el('button', 'cb-btn', 'Keep it'); no.type = 'button';
      sure.appendChild(yes); sure.appendChild(no);
      words.appendChild(sure);
      del.addEventListener('click', function () { sure.hidden = false; del.hidden = true; no.focus(); });
      no.addEventListener('click', function () { sure.hidden = true; del.hidden = false; del.focus(); });
      yes.addEventListener('click', function () {
        yes.disabled = true;
        me.chimeraSend({ remove: c.id }, said, { said: 'Deleted.' }).then(function () { yes.disabled = false; });
      });
      words.appendChild(said);
      if (told && told.id === c.id) { said.textContent = told.said; told.focus = rename; }
      li.appendChild(words);
      ul.appendChild(li);
    });
    if (told) {
      if (told.focus) told.focus.focus();
      else if (told.said) { this.chState.hidden = false; this.chState.textContent = told.said; }
    }
    // Your familiar, if it is one of these, takes a new name or sayings with it.
    var fw = familiarWindow(), cur = null;
    try { cur = fw.loveFamiliar ? fw.loveFamiliar.current() : null; } catch (e) { cur = null; }
    if (cur && cur.kept) b.chimeras.forEach(function (c) {
      var name = c.name || C.suggest(c.parts);
      if (c.id === cur.kept && JSON.stringify([name, c.sayings || [], c.parts]) !== JSON.stringify([cur.name, cur.sayings || [], cur.parts])) {
        fw.loveFamiliar.take({ parts: c.parts, name: name, sayings: c.sayings || [], kept: c.id });
      }
    });
  };

  /* SHOWING YOUR CHIMERAS in your profile, off until you switch it on, and
     only on a claimed username, the pets' rule. */
  Radio.prototype.chimeraShow = function (b, focus) {
    var me = this, box = this.chShow;
    box.textContent = '';
    if (!b.claimed || !b.chimeras.length) return;
    var on = !!b.shown;
    var t = el('button', 'cb-btn cb-pets-show', 'Show my chimeras on the CB: ' + (on ? 'on' : 'off'));
    t.type = 'button';
    t.setAttribute('aria-pressed', String(on));
    box.appendChild(t);
    box.appendChild(el('p', 'cb-quiet', on
      ? 'Anybody signed on to the CB who opens your profile, from your handle on the channel or your name on Who\u2019s online, sees your chimeras, with their names.'
      : 'Off: your profile shows none of them. Switch it on to show them there, with their names.'));
    var said = el('p', 'cb-quiet', ''); said.setAttribute('role', 'status');
    box.appendChild(said);
    if (focus) t.focus();
    t.addEventListener('click', function () {
      t.disabled = true;
      me.chimeraSend({ show: !on }, said, { show: true }).then(function () { t.disabled = false; });
    });
  };

  Radio.prototype.setPets = function (open) {
    this.petsPanel.hidden = !open;
    this.petsBtn.setAttribute('aria-expanded', String(!!open));
    // Only the sections that are open are read again (see pfSection).
    if (open) for (var k in this.pfSecs) if (!this.pfSecs[k].body.hidden) this.pfSecs[k].load.call(this);
    this.place();
  };

  /* PROFILE'S SECTIONS ARE FOLDED UP (Ryan's ask, 2026-10-19: the tray was so
     long he scanned and scrolled for the one he wanted). Each section's
     heading is a button that opens it, so the headings are the list of what
     is there; a section is read from the street only when it is opened, and
     again each time it or the tray opens, and never polled. Any number can be
     open at once. Nothing about which are open is kept: a new page starts
     with every section folded. */
  Radio.prototype.pfSection = function (into, key, title, load) {
    var me = this, sec = el('div', 'cb-pfsec');
    var h = el('h3', 'cb-pets__h cb-pfsec__h');
    var b = el('button', 'cb-pfsec__btn');
    b.type = 'button';
    b.setAttribute('aria-expanded', 'false');
    var mark = el('span', 'cb-pfsec__mark');
    mark.setAttribute('aria-hidden', 'true');
    b.appendChild(mark);
    b.appendChild(document.createTextNode(title));
    var body = el('div', 'cb-pfsec__body');
    body.id = 'cb-pf-' + key;
    body.hidden = true;
    b.setAttribute('aria-controls', body.id);
    h.appendChild(b);
    sec.appendChild(h);
    sec.appendChild(body);
    into.appendChild(sec);
    (this.pfSecs = this.pfSecs || {})[key] = { btn: b, body: body, load: load };
    b.addEventListener('click', function () { me.pfOpen(key, body.hidden); });
    return body;
  };

  Radio.prototype.pfOpen = function (key, open) {
    var s = this.pfSecs[key];
    s.body.hidden = !open;
    s.btn.setAttribute('aria-expanded', String(!!open));
    if (open) s.load.call(this);
    this.place();
  };

  // Is that section on the screen, so that reading it again is worth a request?
  Radio.prototype.pfShown = function (key) {
    var s = this.pfSecs && this.pfSecs[key];
    return !!s && !s.body.hidden && !this.petsPanel.hidden;
  };

  Radio.prototype.setAccount = function (open) {
    this.acctPanel.hidden = !open;
    this.acctBtn.setAttribute('aria-expanded', String(!!open));
    if (open) { this.loadAccount(); this.forgetSaid.textContent = ''; }
    else { this.forgetSure.hidden = true; this.forgetBtn.hidden = false; }
    this.place();
  };

  /* ── Your username ─────────────────────────────────────────────────────── */
  function field(label, id, type) {
    var wrap = el('p', 'cb-acct__field');
    var lab = el('label', 'cb-lab', label);
    lab.htmlFor = id;
    var input = el('input', 'cb-say');
    input.id = id; input.type = type || 'password';
    input.autocomplete = type === 'password' || !type ? 'new-password' : 'off';
    wrap.appendChild(lab); wrap.appendChild(input);
    return { wrap: wrap, input: input };
  }

  Radio.prototype.loadAccount = function () {
    var me = this;
    me.acctBox.textContent = '';
    me.acctBox.appendChild(el('p', 'cb-quiet', 'Looking up your username\u2026'));
    call('/cb/account', null, me.state.pass).then(function (r) {
      if (r.status === 200) { me.drawAccount(r.body); return; }
      me.acctBox.textContent = '';
      me.acctBox.appendChild(el('p', 'cb-quiet', r.status === 401
        ? 'Since you signed on, this username has been signed off. Sign on again at the Community Center.'
        : 'Your username could not be looked up just now.'));
    }, function () {
      me.acctBox.textContent = '';
      me.acctBox.appendChild(el('p', 'cb-quiet', 'Your username could not be looked up just now.'));
    });
  };

  Radio.prototype.acctSay = function (t) { this.acctSaid.textContent = t; };

  /* Take a new pass: after claiming, changing the password or recovering, the
     old one no longer works anywhere, this device included. */
  Radio.prototype.takePass = function (pass, claimed) {
    this.state.pass = pass;
    this.state.claimed = !!claimed;
    save(this.state);
  };

  Radio.prototype.drawAccount = function (a) {
    var me = this, box = me.acctBox;
    box.textContent = '';
    me.drawWhere(!!a.claimed);
    /* A radio is built only for a claimed username now: a pass from a shared
       password gets claimFirst instead, which claims and then brings the radio
       (2026-10-21). A moderator moves onto a password of their own there, the
       same claim as anybody's; their roles stay on the moderators' list. */
    var base = !!a.base;
    if (!a.claimed) {
      box.appendChild(el('p', 'cb-quiet', 'Your username is not claimed. Reload the page, and the radio offers to claim it.'));
      return;
    }
    var since = '';
    try { since = new Date(a.since).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) {}
    box.appendChild(el('p', null, base
      ? 'You sign on as ' + a.handle + ' with your own password, since ' + since + '. Your roles still come from the moderators\u2019 list, and only your password signs on as you.'
      : 'Your username is ' + a.handle + ', claimed on ' + since + '. Only your own password signs on as it.'));
    var change = el('button', 'cb-btn', 'Change my password');
    change.type = 'button';
    var del = el('button', 'cb-btn', 'Delete my account');
    del.type = 'button';
    var row = el('p', 'cb-acct__row'); row.appendChild(change); row.appendChild(del);
    box.appendChild(row);
    var form = el('div', 'cb-acct__form'); form.hidden = true;
    box.appendChild(form);
    /* AN EMAIL ADDRESS FOR RECOVERY, optional (Ryan, 2026-10-21): shown here to
       its owner and to nobody else, and used only to send a reset code they ask
       for at the front desk. Setting, changing or taking it off asks for the
       password, so a pass left signed on somewhere cannot point the reset at
       somebody else's address. Offered only while recovery by email is on. */
    if (a.emailOn || a.email) {
      var mail = el('div', 'cb-acct__mail');
      mail.appendChild(el('h3', 'cb-h3', 'Email for password recovery'));
      var mailNow = el('p', null, a.email
        ? 'A reset code you ask for at the front desk goes to ' + a.email + '. Nobody else sees it.'
        : 'None. If you add one, a reset code you ask for at the front desk goes there, and nobody else sees it.');
      mail.appendChild(mailNow);
      var mailRow = el('p', 'cb-acct__row');
      var mailSet = el('button', 'cb-btn', a.email ? 'Change it' : 'Add one');
      mailSet.type = 'button';
      mailRow.appendChild(mailSet);
      if (a.email) {
        var mailOff = el('button', 'cb-btn', 'Take it off');
        mailOff.type = 'button';
        mailRow.appendChild(mailOff);
      }
      mail.appendChild(mailRow);
      var mailForm = el('div', 'cb-acct__form'); mailForm.hidden = true;
      mail.appendChild(mailForm);
      box.appendChild(mail);
      var mailGo = function (taking) {
        mailForm.textContent = ''; mailForm.hidden = false;
        var addr = null;
        if (!taking) {
          addr = field('Your email address', 'cb-acct-email', 'email');
          addr.input.autocomplete = 'email';
          if (a.email) addr.input.value = a.email;
          mailForm.appendChild(addr.wrap);
        } else {
          mailForm.appendChild(el('p', null, 'Without it, your recovery code, or a reset code from a moderator, is the way back in if you forget your password.'));
        }
        var pwNow = field('Your password, to be sure it is you', 'cb-acct-email-pw', 'password');
        pwNow.input.autocomplete = 'current-password';
        mailForm.appendChild(pwNow.wrap);
        var ok = el('button', 'cb-btn', taking ? 'Take it off' : 'Keep this address'); ok.type = 'button';
        mailForm.appendChild(ok);
        (addr ? addr.input : pwNow.input).focus();
        ok.addEventListener('click', function () {
          ok.disabled = true;
          call('/cb/account', { body: { action: 'email', password: pwNow.input.value, email: taking ? '' : addr.input.value } }, me.state.pass).then(function (r) {
            ok.disabled = false;
            if (r.status === 200) { me.acctSay(r.body.email ? 'Kept. A reset code you ask for goes to ' + r.body.email + ' now.' : 'Taken off. No address is kept for you.'); me.loadAccount(); return; }
            me.acctSay((r.body && r.body.error) || 'That did not work just now. Nothing was changed.');
          }, function () { ok.disabled = false; me.acctSay('The desk could not be reached just now. Nothing was changed.'); });
        });
      };
      mailSet.addEventListener('click', function () { mailGo(false); });
      if (mailOff) mailOff.addEventListener('click', function () { mailGo(true); });
    }
    change.addEventListener('click', function () {
      form.textContent = ''; form.hidden = false;
      var old = field('Your password now', 'cb-acct-old', 'password'), pw = field('A new password', 'cb-acct-new'), again = field('The same again', 'cb-acct-new2');
      old.input.autocomplete = 'current-password';
      form.appendChild(old.wrap); form.appendChild(pw.wrap); form.appendChild(again.wrap);
      var go = el('button', 'cb-btn', 'Change it'); go.type = 'button';
      form.appendChild(go);
      old.input.focus();
      go.addEventListener('click', function () {
        if (pw.input.value !== again.input.value) { me.acctSay('The two new passwords are not the same.'); pw.input.focus(); return; }
        go.disabled = true;
        call('/cb/account', { body: { action: 'password', old: old.input.value, password: pw.input.value } }, me.state.pass).then(function (r) {
          go.disabled = false;
          if (r.status === 200 && r.body.pass) { me.takePass(r.body.pass, true); form.hidden = true; me.acctSay('Changed. Every other device signed on as you has been signed off.'); change.focus(); return; }
          me.acctSay((r.body && r.body.error) || 'That did not work just now. Nothing was changed.');
        }, function () { go.disabled = false; me.acctSay('The desk could not be reached just now. Nothing was changed.'); });
      });
    });
    del.addEventListener('click', function () {
      form.textContent = ''; form.hidden = false;
      form.appendChild(el('p', null, base
        ? 'This deletes your own password, your pets and your direct messages, and puts ' + a.handle + ' back on the moderators\u2019 password, which any moderator can sign on with. Your pets stay on the list of everybody adopted, with nothing connecting them to you. It cannot be undone.'
        : 'This deletes your username, its password, your pets and your direct messages, and anybody can take the name afterwards. Your pets stay on the list of everybody adopted, with nothing connecting them to you. It cannot be undone.'));
      var pw = field('Your password, to be sure it is you', 'cb-acct-del', 'password');
      pw.input.autocomplete = 'current-password';
      form.appendChild(pw.wrap);
      var yes = el('button', 'cb-btn', 'Yes, delete my account'); yes.type = 'button';
      var keep = el('button', 'cb-btn', 'Keep it'); keep.type = 'button';
      form.appendChild(yes); form.appendChild(keep);
      keep.focus();
      keep.addEventListener('click', function () { form.hidden = true; del.focus(); });
      yes.addEventListener('click', function () {
        yes.disabled = true;
        call('/cb/account', { body: { action: 'delete', password: pw.input.value } }, me.state.pass).then(function (r) {
          yes.disabled = false;
          if (r.status === 200 && r.body.deleted) { signOff(); return; }
          me.acctSay((r.body && r.body.error) || 'That did not work just now. Nothing was deleted.');
        }, function () { yes.disabled = false; me.acctSay('The desk could not be reached just now. Nothing was deleted.'); });
      });
    });
  };

  Radio.prototype.drawWhere = function (claimed) {
    var w = this.petsWhere;
    w.textContent = '';
    w.appendChild(document.createTextNode('Adopt one at '));
    var ca = el('a', null, 'Rescue A Cat'); ca.href = '/rescue-a-cat.html';
    var da = el('a', null, 'Rescue A Dog'); da.href = '/rescue-a-dog.html';
    w.appendChild(ca); w.appendChild(document.createTextNode(' or ')); w.appendChild(da);
    w.appendChild(document.createTextNode(claimed
      ? '. Your pets are kept under your username, scrambled, so they follow you to any device you sign on with, and only your password reaches them.'
      : '. Your pets are kept under the handle ' + this.state.handle + ', scrambled, so they follow you to any device you sign on with. A handle is not an account: anybody who signs on with it sees them too, until you claim it under Account.'));
  };

  Radio.prototype.loadPets = function () {
    var me = this;
    me.petsState.hidden = false;
    me.petsState.textContent = 'Looking for your pets\u2026';
    withAnimals(function () {
      call('/cb/pets', null, me.state.pass).then(function (r) {
        if (r.status === 200 && r.body.pets) { me.drawPets(r.body.pets); me.drawShow(r.body); return; }
        me.petsState.textContent = r.status === 401
          ? 'Since you signed on, this username has been signed off. Sign on again at the Community Center.'
          : 'Your pets could not be fetched just now.';
      }, function () { me.petsState.textContent = 'Your pets could not be fetched just now.'; });
    });
  };

  /* SHOWING YOUR PETS, off until you switch it on, and only on a claimed
     username, because an unclaimed handle is anybody's who signs on with it. */
  Radio.prototype.drawShow = function (b, focus) {
    var me = this, box = this.showBox;
    box.textContent = '';
    if (!b.claimed) {
      box.appendChild(el('p', 'cb-quiet', 'Claim your username under Account and you can let people on the CB see your pets, by pressing your handle on the channel.'));
      return;
    }
    var on = !!b.shown;
    var t = el('button', 'cb-btn cb-pets-show', 'Show my pets on the CB: ' + (on ? 'on' : 'off'));
    t.type = 'button';
    t.setAttribute('aria-pressed', String(on));
    box.appendChild(t);
    box.appendChild(el('p', 'cb-quiet', on
      ? 'Anybody signed on to the CB can press your handle on the channel and see your pets: what they look like and what they are called. That also lets them find your pets on the list of everybody adopted.'
      : 'Off: pressing your handle on the channel says you have not made your pets public. Switch it on to let people on the CB see them.'));
    var said = el('p', 'cb-quiet', ''); said.setAttribute('role', 'status');
    box.appendChild(said);
    if (focus) t.focus();
    t.addEventListener('click', function () {
      t.disabled = true;
      call('/cb/pets', { body: { show: !on } }, me.state.pass).then(function (r) {
        t.disabled = false;
        if (r.status === 200 && typeof r.body.shown === 'boolean') { me.drawShow({ claimed: true, shown: r.body.shown }, true); return; }
        said.textContent = (r.body && typeof r.body.error === 'string') ? r.body.error : 'That did not work just now. Nothing changed.';
      }, function () { t.disabled = false; said.textContent = 'The street could not be reached just now. Nothing changed.'; });
    });
  };

  Radio.prototype.drawPets = function (list, told) {
    var me = this, ul = this.petsList;
    ul.textContent = '';
    if (!list.length) {
      ul.hidden = true;
      this.petsState.hidden = false;
      this.petsState.textContent = 'No pets yet.';
      return;
    }
    this.petsState.hidden = true;
    ul.hidden = false;
    list.slice().reverse().forEach(function (a) {
      var li = el('li', 'cb-pet');
      li.appendChild(window.loveAnimals.draw(a, 'cb-pet__art'));
      var words = el('div', 'cb-pet__words');
      words.appendChild(el('p', 'cb-pet__name', a.name || 'Not named yet'));
      words.appendChild(el('p', 'cb-pet__about', window.loveAnimals.about(a)));
      var d = '';
      try { d = new Date(a.at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) {}
      words.appendChild(el('p', 'cb-quiet', 'Adopted ' + d + (a.first ? ', and came in as ' + a.first : '')));
      /* RENAMING, Ryan's call, 2026-09-30: once adopted, a pet is called what
         its person calls them, and the forever list shows the new name beside
         the one they came in under. */
      var rn = el('button', 'cb-btn cb-pet__rename', a.name ? 'Rename ' + a.name : 'Name them');
      rn.type = 'button';
      var noun = (a.words && a.words.noun) || (a.kind === 'dog' ? 'dog' : 'cat');
      var petSaid = el('p', 'cb-quiet cb-save__said', ''); petSaid.setAttribute('role', 'status');
      var petRow = el('div', 'cb-acct__row');
      petRow.appendChild(rn);
      petRow.appendChild(saveButton(a.name || 'your ' + noun, function () { return li.querySelector('.cb-pet__art'); },
        'pet-' + (fileName(a.name) || fileName(noun)), null, petSaid));
      words.appendChild(petRow);
      words.appendChild(petSaid);
      var form = el('div', 'cb-acct__form'); form.hidden = true;
      words.appendChild(form);
      rn.addEventListener('click', function () {
        form.textContent = ''; form.hidden = false; rn.hidden = true;
        var f = field('A new name', 'cb-pet-name-' + a.id, 'text');
        f.input.maxLength = 24; f.input.autocomplete = 'off'; f.input.value = a.name || '';
        form.appendChild(f.wrap);
        var go = el('button', 'cb-btn', a.name ? 'Rename' : 'Name them'); go.type = 'button';
        var keep = el('button', 'cb-btn', a.name ? 'Keep ' + a.name : 'Not now'); keep.type = 'button';
        form.appendChild(go); form.appendChild(keep);
        var said = el('p', 'cb-quiet', ''); said.setAttribute('role', 'status');
        form.appendChild(said);
        f.input.focus(); f.input.select();
        keep.addEventListener('click', function () { form.hidden = true; rn.hidden = false; rn.focus(); });
        function send() {
          var name = f.input.value.trim();
          if (!name) { said.textContent = 'A name is at least one character.'; f.input.focus(); return; }
          go.disabled = true;
          call('/cb/pets', { body: { rename: a.id, name: name } }, me.state.pass).then(function (r) {
            go.disabled = false;
            if (r.status === 200 && r.body.pets) {
              me.drawPets(r.body.pets, { id: a.id, said: (a.name ? a.name + ' is ' : 'They are ') + name + ' now, here and on the list of everybody adopted.' });
              try { window.dispatchEvent(new CustomEvent('love-renamed')); } catch (e) {}
              return;
            }
            said.textContent = (r.body && typeof r.body.error === 'string') ? r.body.error : 'That did not work just now. Nothing was renamed.';
          }, function () { go.disabled = false; said.textContent = 'The street could not be reached just now. Nothing was renamed.'; });
        }
        go.addEventListener('click', send);
        f.input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); send(); } });
      });
      // The answer to a rename goes on that pet's own card, where the hand is.
      if (told && told.id === a.id) { words.appendChild(el('p', 'cb-quiet', told.said)); told.button = rn; }
      li.appendChild(words);
      ul.appendChild(li);
    });
    if (told && told.button) told.button.focus();
  };


  /* ── Your battle jacket ────────────────────────────────────────────────── */
  Radio.prototype.loadPatches = function () {
    var me = this;
    me.patchState.hidden = false;
    me.patchState.textContent = 'Looking for your jacket\u2026';
    withPatches(function () {
      call('/cb/patches', null, me.state.pass).then(function (r) {
        if (r.status === 200 && r.body && Array.isArray(r.body.patches)) { me.drawPatches(r.body); return; }
        me.patchState.textContent = r.status === 401
          ? 'Since you signed on, this username has been signed off. Sign on again at the Community Center.'
          : 'Your jacket could not be fetched just now.';
      }, function () { me.patchState.textContent = 'Your jacket could not be fetched just now.'; });
    });
  };

  Radio.prototype.drawPatches = function (b, focus) {
    var me = this, box = this.patchBox, show = this.patchShow;
    show.textContent = '';
    this.patchState.hidden = true;
    if (!window.lovePatches) { withPatches(function () { me.drawPatches(b, focus); }); return; }
    var ids = b.patches || [];
    box.hidden = false;
    jacketInto(box, ids, 'it');
    /* The jacket as a picture, and every patch on it one at a time. */
    var jSaid = el('p', 'cb-quiet cb-save__said', ''); jSaid.setAttribute('role', 'status');
    var jRow = el('div', 'cb-acct__row');
    jRow.appendChild(saveButton('your battle jacket', function () { return box.querySelector('.cb-jacket__art'); },
      'battle-jacket', null, jSaid));
    box.appendChild(jRow);
    box.appendChild(jSaid);
    if (ids.length) {
      var pd = el('details', 'cb-jobs');
      pd.appendChild(el('summary', null, 'Your patches, one at a time'));
      var pl = el('ul', 'cb-saves');
      window.lovePatches.list.forEach(function (p) {
        if (ids.indexOf(p.id) < 0) return;
        var li = el('li', 'cb-saves__one');
        var art = window.lovePatches.draw(p.id, { cls: 'cb-saves__art' });
        if (art) li.appendChild(art);
        li.appendChild(el('span', 'cb-saves__name', p.name));
        var said = el('p', 'cb-quiet cb-save__said', ''); said.setAttribute('role', 'status');
        li.appendChild(saveButton(p.name, art, 'patch-' + p.id, null, said));
        li.appendChild(said);
        pl.appendChild(li);
      });
      pd.appendChild(pl);
      box.appendChild(pd);
    }
    /* Where every patch is, so finding one is a walk and never a test of
       eyesight: the guild's hints, for a jacket. Each says whether it is on
       yours. */
    var det = el('details', 'cb-jobs');
    det.appendChild(el('summary', null, 'Where the patches are'));
    var ul = el('ul', 'cb-jobs__list');
    window.lovePatches.list.forEach(function (p) {
      var li = el('li');
      var a = el('a', null, p.name);
      a.href = '/' + p.page + '#patch-' + p.id;
      li.appendChild(a);
      li.appendChild(el('span', 'cb-jobs__room', ' \u00b7 ' + p.room + '. ' + p.spot + (ids.indexOf(p.id) >= 0 ? ' On your jacket.' : '')));
      ul.appendChild(li);
    });
    det.appendChild(ul);
    box.appendChild(det);
    var claimed = !!b.claimed;
    if (!claimed) {
      show.appendChild(el('p', 'cb-quiet', 'Claim your username under Account and you can let people on the CB see your battle jacket in your profile.'));
    } else {
      var on = !!b.shown;
      var t = el('button', 'cb-btn cb-pets-show', 'Show my battle jacket on the CB: ' + (on ? 'on' : 'off'));
      t.type = 'button';
      t.setAttribute('aria-pressed', String(on));
      show.appendChild(t);
      show.appendChild(el('p', 'cb-quiet', on
        ? 'Anybody signed on to the CB who opens your profile, from your handle on the channel or your name on Who\u2019s online, sees your jacket and what is sewn on it.'
        : 'Off: your profile says you have not made your jacket public. Switch it on to show it there.'));
      var said = el('p', 'cb-quiet', ''); said.setAttribute('role', 'status');
      show.appendChild(said);
      if (focus) t.focus();
      t.addEventListener('click', function () {
        t.disabled = true;
        call('/cb/patches', { body: { show: !on } }, me.state.pass).then(function (r) {
          t.disabled = false;
          if (r.status === 200 && typeof r.body.shown === 'boolean') { me.drawPatches({ patches: ids, claimed: true, shown: r.body.shown }, true); return; }
          said.textContent = (r.body && typeof r.body.error === 'string') ? r.body.error : 'That did not work just now. Nothing changed.';
        }, function () { t.disabled = false; said.textContent = 'The street could not be reached just now. Nothing changed.'; });
      });
    }
    this.patchWhere.textContent = (claimed
      ? 'Your patches are kept under your username, scrambled: which patches, and nothing about when. '
      : 'Your patches are kept under the handle ' + this.state.handle + ', scrambled: which patches, and nothing about when. A handle is not an account: anybody who signs on with it has this jacket too, until you claim it under Account. ') +
      'Nothing counts who else has one. Sticker, on the radio, sends one to the channel, or the whole jacket, and Forget me takes them all off.';
  };

  /* ── Your jobs ─────────────────────────────────────────────────────────── */
  Radio.prototype.loadJobs = function () {
    var me = this;
    me.jobsState.hidden = false;
    me.jobsState.textContent = 'Looking for your jobs\u2026';
    withGuild(function (guild) {
      call('/cb/jobs', null, me.state.pass).then(function (r) {
        if (r.status === 200 && r.body && guild) { me.drawJobs(r.body, guild); return; }
        me.jobsState.textContent = r.status === 401
          ? 'Since you signed on, this username has been signed off. Sign on again at the Community Center.'
          : 'Your jobs could not be fetched just now.';
      }, function () { me.jobsState.textContent = 'Your jobs could not be fetched just now.'; });
    });
  };

  Radio.prototype.drawJobs = function (b, guild, focus) {
    var me = this, box = this.jobsBox, show = this.jobsShow, w = this.jobsWhere;
    box.textContent = ''; show.textContent = ''; w.textContent = '';
    box.hidden = true;
    this.jobsState.hidden = false;
    // Your badges first: from the jobs kept here, your pets, and the animals
    // this browser rescued, which only you are ever shown.
    var rescued = rescuedHere();
    var bs = guild ? badgesFor(guild, b.keeping ? b.jobs : [], { pets: !!b.adopted, rescues: rescued }) : [];
    badgesInto(this.badgeBox, bs, true);
    this.badgeBox.hidden = !bs.length;
    if (bs.some(function (x) { return x.from === 'rescues'; })) {
      this.badgeBox.appendChild(el('p', 'cb-quiet', 'Rescue Ranger is worked out from the animals this browser rescued. Nothing on the street knows who rescued which animal, so only you see it, here and on the Guild\u2019s board.'));
    }
    if (!b.keeping) {
      this.jobsState.textContent = 'Your Profile is not keeping your jobs. The ';
      var g = el('a', null, 'Adventurer\u2019s Guild'); g.href = '/adventurers-guild.html';
      this.jobsState.appendChild(g);
      this.jobsState.appendChild(document.createTextNode('\u2019s board can: Keep my jobs in my Profile is beside the box where codes are handed in, and it starts off.'));
      return;
    }
    if (!b.jobs.length) {
      this.jobsState.textContent = 'Your Profile is keeping your jobs, and has none so far. Codes are handed in at the ';
      var g2 = el('a', null, 'Adventurer\u2019s Guild'); g2.href = '/adventurers-guild.html';
      this.jobsState.appendChild(g2);
      this.jobsState.appendChild(document.createTextNode('.'));
    } else if (guild) {
      this.jobsState.hidden = true;
      box.hidden = false;
      jobsInto(box, guild, b.jobs, 'The jobs you have handed in');
    }
    var claimed = !!b.claimed;
    if (!claimed) {
      show.appendChild(el('p', 'cb-quiet', 'Claim your username under Account and you can let people on the CB see your jobs and their badges in your profile.'));
    } else {
      var on = !!b.shown;
      var t = el('button', 'cb-btn cb-pets-show', 'Show my jobs on the CB: ' + (on ? 'on' : 'off'));
      t.type = 'button';
      t.setAttribute('aria-pressed', String(on));
      show.appendChild(t);
      show.appendChild(el('p', 'cb-quiet', on
        ? 'Anybody signed on to the CB who opens your profile, from your handle on the channel or your name on Who\u2019s online, sees your jobs and the badges they make. Not when you did any of them, which is not kept.'
        : 'Off: your profile says you have not made your jobs public. Switch it on to show them, and their badges, there.'));
      var said = el('p', 'cb-quiet', ''); said.setAttribute('role', 'status');
      show.appendChild(said);
      if (focus) t.focus();
      t.addEventListener('click', function () {
        t.disabled = true;
        call('/cb/jobs', { body: { show: !on } }, me.state.pass).then(function (r) {
          t.disabled = false;
          if (r.status === 200 && typeof r.body.shown === 'boolean') { me.drawJobs({ keeping: true, jobs: b.jobs, claimed: true, shown: r.body.shown, adopted: b.adopted }, guild, true); return; }
          said.textContent = (r.body && typeof r.body.error === 'string') ? r.body.error : 'That did not work just now. Nothing changed.';
        }, function () { t.disabled = false; said.textContent = 'The street could not be reached just now. Nothing changed.'; });
      });
    }
    w.textContent = (claimed
      ? 'Your jobs are kept under your username, scrambled: which jobs, and nothing about when. '
      : 'Your jobs are kept under the handle ' + this.state.handle + ', scrambled: which jobs, and nothing about when. A handle is not an account: anybody who signs on with it sees them too, until you claim it under Account. ') +
      'A badge is worked out from them and kept nowhere. Switching keeping off, on the Guild\u2019s board, deletes them, and so does Forget me.';
  };

  Radio.prototype.forgetMe = function () {
    var me = this;
    me.forgetSaid.textContent = 'Forgetting\u2026';
    call('/cb/pets', { body: { forget: true } }, me.state.pass).then(function (r) {
      me.forgetSure.hidden = true; me.forgetBtn.hidden = false;
      if (r.status === 200 && r.body.forgotten) { me.drawPets([]); me.drawShow({ claimed: /^cb2\./.test(me.state.pass), shown: false }); me.drawAvatars({ avatars: [], wearing: null, claimed: /^cb2\./.test(me.state.pass) }); me.drawJobs({ keeping: false, jobs: [], claimed: /^cb2\./.test(me.state.pass) }, GUILD); me.drawPatches({ patches: [], shown: false, claimed: /^cb2\./.test(me.state.pass) }); me.forgetSaid.textContent = 'Forgotten. The street keeps nothing under this handle now.'; me.forgetBtn.focus(); return; }
      me.forgetSaid.textContent = (r.body && typeof r.body.error === 'string') ? r.body.error : 'That did not work just now. Nothing was forgotten.';
    }, function () {
      me.forgetSure.hidden = true; me.forgetBtn.hidden = false;
      me.forgetSaid.textContent = 'The street could not be reached just now. Nothing was forgotten.';
    });
  };

  Radio.prototype.setTeleport = function (open) {
    this.tpPanel.hidden = !open;
    this.tpBtn.setAttribute('aria-expanded', String(open));
    if (open) {
      this.tpFind.value = '';
      this.loadRooms();
      this.tpRender();
      this.tpFind.focus();
    } else {
      this.tpList.textContent = '';
      this.tpOffer = [];
      this.tpActive = -1;
    }
    this.place();
  };

  Radio.prototype.tpRender = function (failed) {
    var list = this.tpList, none = this.tpNone;
    list.textContent = '';
    list.setAttribute('aria-label', 'Rooms on the street');
    if (personTyped(this.tpFind.value) !== null) { this.tpPeople(); return; }
    if (!rooms || failed || !rooms.length) {
      this.tpOffer = [];
      none.textContent = rooms && !failed ? 'No rooms to go to.' : (failed ? 'The list of rooms cannot be reached just now.' : 'Finding the rooms\u2026');
      none.hidden = false;
      list.hidden = true;
      markIn(list, this.tpFind, -1);
      return;
    }
    var found = findRooms(this.tpFind.value);
    var offer = this.tpOffer = found.map(function (f) { return f.room; });
    for (var i = 0; i < offer.length; i++) {
      var li = el('li', 'cb-opt');
      li.id = 'cb-tp-' + offer[i].tag;
      li.setAttribute('role', 'option');
      var nm = el('span', 'cb-opt__name', offer[i].name);
      if (found[i].why) nm.appendChild(el('span', 'cb-opt__why', found[i].why));
      li.appendChild(nm);
      li.appendChild(el('span', 'cb-opt__tag', isHere(offer[i]) ? 'you are here' : '#' + offer[i].tag));
      li.addEventListener('mousedown', function (e) { e.preventDefault(); });
      (function (room, me) { li.addEventListener('click', function () { me.go(room); }); })(offer[i], this);
      list.appendChild(li);
    }
    none.textContent = 'No room by that name, or about that.';
    none.hidden = offer.length > 0;
    list.hidden = offer.length === 0;
    this.tpActive = offer.length ? 0 : -1;
    markIn(list, this.tpFind, this.tpActive);
  };

  Radio.prototype.tpKey = function (e) {
    if (e.isComposing) return;
    var n = this.tpOffer.length;
    if (e.key === 'Escape') { e.preventDefault(); this.setTeleport(false); this.tpBtn.focus(); return; }
    if (!n) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); this.tpActive = (this.tpActive + 1) % n; markIn(this.tpList, this.tpFind, this.tpActive); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); this.tpActive = (this.tpActive - 1 + n) % n; markIn(this.tpList, this.tpFind, this.tpActive); }
    else if (e.key === 'Enter') { e.preventDefault(); this.go(this.tpOffer[this.tpActive]); }
  };

  /* WHO'S ONLINE, the panel. Asked when it opens and on each listen while it
     is open; the teleporter's @ asks too. Left open, it is open on the next
     page (requests from our community, 2026-10-23): love-cb keeps `online`
     while it is, and the radio opens it again at start-up without asking
     anything, because asking is listen()'s, and a folded radio sends nothing. */
  Radio.prototype.setOnline = function (open, quiet) {
    this.online.hidden = !open;
    this.onlineBtn.setAttribute('aria-expanded', String(open));
    if (open) this.state.online = true; else delete this.state.online;
    if (quiet) { if (open) { this.onlineKey = null; this.onlineShown(); } return; }
    save(this.state);
    if (open) { this.onlineKey = null; this.loadRooms(); this.onlineShown(); this.onlineTick(); }
    this.place();
  };

  Radio.prototype.onlineTick = function (forTp) {
    var me = this;
    if (forTp) this.tpWants = true;
    if (this.onlineBusy) return;
    this.onlineBusy = true;
    call('/cb/online', null, this.state.pass).then(function (r) {
      if (r.status === 401) return me.lost();
      if (r.status === 200 && Array.isArray(r.body.people)) {
        me.people = r.body.people; me.peopleAt = Date.now(); me.peopleFailed = false;
        me.callsNow = Array.isArray(r.body.calls) ? r.body.calls : [];
        me.callsHeard = r.body.callHeard === true;
        // Somebody wears an avatar, and avatar.js is not here yet: fetch it
        // once, and draw the list again when it comes.
        if (!window.loveAvatar && me.people.some(function (p) { return p.avatar; })) {
          withAvatar(function () { me.onlineKey = null; if (!me.online.hidden) me.onlineShown(); });
        }
      }
      else me.peopleFailed = true;
    }, function () { me.peopleFailed = true; })
      .then(function () {
        me.onlineBusy = false;
        if (!me.online.hidden) me.onlineShown();
        if (me.tpWants && !me.tpPanel.hidden && personTyped(me.tpFind.value) !== null) me.tpRender();
        me.tpWants = false;
        if (me.atWants) { me.atWants = false; me.complete(); }
      });
  };

  // A person's rooms that are rooms on the street, in walking order.
  function roomsOf(p) {
    var out = [];
    for (var i = 0; rooms && i < rooms.length; i++) if (p.rooms.indexOf(rooms[i].tag) >= 0) out.push(rooms[i]);
    return out;
  }

  /* CHAT STATUS (Ryan's ask, 2026-10-24): whether somebody wants to be talked
     to, which Be seen here never said. The interaction badges, after the
     colour communication badges Autism Network International started at the
     first Autreat (Jim Sinclair, 1996), in the Cavendish Space Project's
     interaction cards' own words and shapes, which are CC0 and copied word for
     word; lib.mjs holds the ids (CHAT_STATUSES) and
     tools/check-chat-status.py holds the two together. What follows each
     card's prompt in a conversation (then) is ours, from the cards' notes. A
     badge is its shape and its words and never its colour alone, and it
     carries its own ground (--cb-chat-*), so it reads the same in every
     theme. It is a sign and never a lock: nothing refuses a message for it. */
  var CHAT = [
    { id: 'come-say-hi', name: 'come say hi', shape: 'circle', says: 'i want to talk \u2014 you can start.',
      then: 'Saying hello first is welcome.' },
    { id: 'people-i-know', name: 'people i know', shape: 'triangle', says: 'only say hi if we\u2019ve met.',
      then: 'If you have not met, let them say hello first. If they write to you, you are welcome to answer.' },
    { id: 'not-right-now', name: 'not right now', shape: 'square', says: 'please don\u2019t start talking to me.',
      then: 'Hold back from starting anything, and do not take it personally. If they write to you, you can answer.' },
  ];
  function chatOf(id) {
    for (var i = 0; i < CHAT.length; i++) if (CHAT[i].id === id) return CHAT[i];
    return null;
  }
  function chatMark(c) {
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 12 12');
    svg.setAttribute('class', 'cb-chat__mark');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    var sh;
    if (c.shape === 'circle') {
      sh = document.createElementNS(NS, 'circle');
      sh.setAttribute('cx', '6'); sh.setAttribute('cy', '6'); sh.setAttribute('r', '5');
    } else if (c.shape === 'triangle') {
      sh = document.createElementNS(NS, 'polygon');
      sh.setAttribute('points', '6,0.4 11.8,11 0.2,11');
    } else {
      sh = document.createElementNS(NS, 'rect');
      sh.setAttribute('x', '1.4'); sh.setAttribute('y', '1.4'); sh.setAttribute('width', '9.2'); sh.setAttribute('height', '9.2');
    }
    svg.appendChild(sh);
    return svg;
  }
  /* A badge: its shape and its words on its own ground, heard as "chat
     status: come say hi" beside a name, and as its words alone where a
     heading already says what it is (bare). */
  function chatBadge(id, bare) {
    var c = chatOf(id);
    if (!c) return null;
    var b = el('span', 'cb-chat cb-chat--' + c.id);
    b.appendChild(chatMark(c));
    if (!bare) b.appendChild(el('span', 'sr', 'chat status: '));
    b.appendChild(document.createTextNode(c.name));
    return b;
  }

  function personLine(li, p, mine, profile) {
    li.appendChild(profile || el('b', null, p.handle));
    if (p.base) li.appendChild(el('span', 'cb-tag', 'BASE'));
    if (mine) li.appendChild(document.createTextNode(' (you)'));
  }

  /* Redrawn only when what it says changes, and the keyboard is put back on
     the same room's link, so a listen every four seconds does not throw
     somebody off the link they were about to press. */
  Radio.prototype.onlineShown = function () {
    var ul = this.onlineList, none = this.onlineNone, me = this, here = herePath() + '|' + forumHereTag();
    this.onlineMe.textContent = this.state.seen
      ? 'You are on it while Be seen here is on, in a room, with the radio open.'
      : 'You are not on it: switch on Be seen here, in a room, to be.';
    if (!this.people || rooms === null) {
      ul.hidden = true;
      none.hidden = false;
      none.textContent = this.peopleFailed ? 'Who’s online cannot be reached just now. Still trying.' : 'Looking…';
      return;
    }
    var shown = this.people.filter(function (p) { return roomsOf(p).length; });
    var calls = (rooms || []).filter(function (r) { return (me.callsNow || []).indexOf(r.tag) >= 0; });
    var world = (this.callsNow || []).indexOf(WORLD_CALL) >= 0;
    var key = JSON.stringify([shown, calls.map(function (r) { return r.tag; }), world, !!this.callsHeard, here, this.state.handle]);
    none.hidden = shown.length > 0;
    none.textContent = 'Nobody is seen in a room right now.';
    ul.hidden = !shown.length;
    if (key === this.onlineKey) return;
    this.onlineKey = key;
    var focused = this.online.getRootNode().activeElement;
    var again = focused && this.online.contains(focused) && focused.dataset ? focused.dataset.at : null;
    function back(b) { if (again && b.dataset.at === again) setTimeout(function () { b.focus(); }, 0); }
    ul.textContent = '';
    var plates = [];
    shown.forEach(function (p) {
      var li = el('li', 'cb-online-row');
      /* A NAME OPENS THEIR PROFILE, as a handle on the channel does (Ryan,
         2026-10-13), under the list rather than on the channel's readout. */
      var who = el('button', 'cb-handle', p.handle);
      who.type = 'button';
      who.setAttribute('aria-haspopup', 'dialog');
      who.dataset.at = p.handle + '|';
      who.addEventListener('click', function () { me.peek(p.handle, who, p); });
      back(who);
      /* THE AVATAR THEY WEAR, beside a claimed name only (the server sends
         none for anybody else), heard as what they wrote about it or not at
         all. */
      if (p.avatar && window.loveAvatar) li.appendChild(avatarArt(p.avatar.look, p.avatar.about, 'cb-online-face', 'bust', p.handle + '\u2019s avatar'));
      personLine(li, p, p.handle === me.state.handle, who);
      // THEIR CHAT STATUS, beside a claimed name only, as they chose it.
      var chat = p.chat && chatBadge(p.chat);
      if (chat) li.appendChild(chat);
      li.appendChild(document.createTextNode(' in '));
      roomsOf(p).forEach(function (r, i) {
        if (i) li.appendChild(document.createTextNode(', '));
        if (isHere(r)) { li.appendChild(el('span', null, r.name + ' (this room)')); return; }
        var a = el('a', 'cb-online-room', r.name);
        a.href = chatHref(r) || r.path;
        a.dataset.at = p.handle + '|' + r.tag;
        li.appendChild(a);
        back(a);
      });
      /* THE NAMEPLATE they chose on their profile card (2026-10-17), beside a
         claimed name only: a strip of a theme's drawing under the line, on its
         own theme's colours, carrying no word and standing behind none. */
      if (p.plate) {
        var plate = el('div', 'pf-plate');
        plate.setAttribute('aria-hidden', 'true');
        li.appendChild(plate);
        plates.push([plate, p.plate]);
      }
      ul.appendChild(li);
    });
    if (plates.length) withProfile(function () { plates.forEach(function (x) { if (x[0].isConnected) window.loveProfile.drawing(x[0], x[1]); }); });
    /* CALLS GOING NOW: every room whose call has somebody in it, in walking
       order, the room and nothing else. Only once the server says 8x8 is
       telling it, so "nobody" is never a guess. */
    this.callsBox.hidden = !this.callsHeard;
    this.callList.textContent = '';
    this.callList.hidden = !calls.length && !world;
    this.callNone.hidden = calls.length > 0 || world;
    this.callNone.textContent = 'Nobody is in a call right now.';
    // The World call is no room's, so it has no address to go to: it is joined
    // from wherever you are, with Join World call just above.
    if (world) this.callList.appendChild(el('li', 'cb-online-row', 'The World call, which Join World call above takes you into'));
    calls.forEach(function (r) {
      var li = el('li', 'cb-online-row');
      if (isHere(r)) { li.appendChild(el('span', null, r.name + ' (this room)')); }
      else {
        var a = el('a', 'cb-online-room', r.name);
        a.href = chatHref(r) || r.path;
        a.dataset.at = 'call|' + r.tag;
        li.appendChild(a);
        back(a);
      }
      me.callList.appendChild(li);
    });
  };

  /* @ IN THE TELEPORTER: a person rather than a room. Helen Edgar's ask and
     Ryan's, 2026-10-07: type @ and some of a handle, and the list is the
     people on Who's online whose handles have that in them, one line for each
     room they are in; Enter goes there. Handles that start with what you typed
     come first, then the rest, each alphabetical. Yourself is left out. */
  function personTyped(v) {
    var m = /^\s*@(.*)$/.exec(String(v));
    return m ? m[1] : null;
  }
  function nameFold(s) { return tpFold(s).replace(/\s+/g, ' ').trim(); }

  Radio.prototype.tpPeople = function () {
    var list = this.tpList, none = this.tpNone, me = this;
    var typed = nameFold(personTyped(this.tpFind.value) || '');
    list.setAttribute('aria-label', 'People seen in rooms');
    if (!this.peopleAt || Date.now() - this.peopleAt > EVERY) this.onlineTick(true);
    var starts = [], inside = [];
    (this.people || []).forEach(function (p) {
      if (p.handle === me.state.handle) return;
      var f = nameFold(p.handle), at = f.indexOf(typed);
      if (at === 0) starts.push(p); else if (at > 0) inside.push(p);
    });
    var offer = this.tpOffer = [], i = 0;
    starts.concat(inside).forEach(function (p) {
      roomsOf(p).forEach(function (r) {
        var li = el('li', 'cb-opt');
        li.id = 'cb-tp-p-' + (i++);
        li.setAttribute('role', 'option');
        var nm = el('span', 'cb-opt__name');
        personLine(nm, p, false);
        nm.appendChild(el('span', 'cb-opt__why', 'in ' + r.name));
        li.appendChild(nm);
        li.appendChild(el('span', 'cb-opt__tag', isHere(r) ? 'this room' : '#' + r.tag));
        li.addEventListener('mousedown', function (e) { e.preventDefault(); });
        li.addEventListener('click', function () { me.go(r); });
        list.appendChild(li);
        offer.push(r);
      });
    });
    if (!this.people || rooms === null) {
      none.textContent = this.peopleFailed ? 'Who’s online cannot be reached just now.' : 'Looking for who’s online…';
    } else {
      none.textContent = typed ? 'Nobody seen in a room has a handle with that in it.' : 'Nobody else is seen in a room right now.';
    }
    none.hidden = offer.length > 0;
    list.hidden = offer.length === 0;
    this.tpActive = offer.length ? 0 : -1;
    markIn(list, this.tpFind, this.tpActive);
  };

  // Going is ordinary navigation: nothing is sent, and the panel is closed so a
  // page restored from the back-forward cache does not come back with it open.
  Radio.prototype.go = function (room) {
    if (!room) return;
    this.setTeleport(false);
    this.tabTold(goStreet(room.path), null);
  };

  Radio.prototype.close = function () {
    this.pick.hidden = true;
    this.pick.textContent = '';
    this.offer = [];
    this.active = -1;
    this.say.setAttribute('aria-expanded', 'false');
    this.say.removeAttribute('aria-activedescendant');
  };

  Radio.prototype.pickKey = function (e) {
    if (this.pick.hidden || e.isComposing) return;
    var n = this.offer.length;
    if (e.key === 'ArrowDown') { e.preventDefault(); this.mark((this.active + 1) % n); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); this.mark((this.active - 1 + n) % n); }
    else if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); this.choose(this.active); }
    else if (e.key === 'Escape') {
      e.preventDefault();
      var t = this.token();
      this.dismissed = t ? t.start : -1;
      this.close();
    }
  };

  // Put the chosen room's #tag in place of what was typed after the #, or
  // the chosen person's handle in place of what was typed after the @.
  Radio.prototype.choose = function (n) {
    var t = this.token(), pick = this.offer[n];
    if (!t || !pick || (t.kind === 'person') !== (this.offerKind === 'person')) { this.close(); return; }
    var v = this.say.value, after = v.slice(t.end);
    var put = (t.kind === 'person' ? '@' + (pick.role || pick) : '#' + pick.tag) + (after.charAt(0) === ' ' ? '' : ' ');
    var next = v.slice(0, t.start) + put + after;
    if (next.length > this.say.maxLength) { this.tell(t.kind === 'person' ? 'That name would not fit in the message.' : 'That room would not fit in the message.'); this.close(); return; }
    // A role is found in the words by the server, so it is not one of the people picked.
    if (t.kind === 'person' && !pick.role) {
      this.atPicked = this.atPicked || [];
      if (this.atPicked.every(function (x) { return fold(x) !== fold(pick); })) this.atPicked.push(pick);
    }
    this.say.value = next;
    this.grow();
    var c = t.start + put.length;
    this.say.setSelectionRange(c, c);
    this.close();
    this.say.focus();
  };

  // A picture chosen, and redrawn at once, so what is waiting to go already
  // has nothing of the camera's in it.
  Radio.prototype.pickPicture = function (file) {
    var me = this;
    this.picFile.value = '';
    if (!file) return;
    if (!/^image\//.test(file.type)) { this.tell('That is not a picture.'); return; }
    this.tell('');
    picPending(this.picReady, this.picShown, this.picReadyLine, file);
    redraw(file).then(function (blob) {
      me.picture = blob;
      picReady(me.picReady, me.picShown, me.picReadyLine, blob, file);
      me.picAlt.focus({ preventScroll: true });
    }).catch(function () {
      picFailed(me.picReady, me.picShown, me.picReadyLine, !!me.picture);
      me.tell('The radio could not read that picture.');
    });
  };

  Radio.prototype.dropPicture = function () {
    this.picture = null;
    this.picAlt.value = '';
    picGone(this.picReady, this.picShown);
  };

  // The message box grows with what is in it, to about eight lines, and so
  // does the box an edit opens.
  Radio.prototype.grow = function (box) {
    var t = box || this.say;
    t.style.height = 'auto';
    var line = parseFloat(getComputedStyle(t).lineHeight) || 20;
    t.style.height = Math.min(t.scrollHeight + 4, line * 8 + 16) + 'px';
  };

  Radio.prototype.transmit = function () {
    var me = this, text = this.say.value.trim(), picture = this.picture;
    this.close();
    if (!text && !picture) { this.tell('Type something, or add a picture, first.'); return; }
    this.tell(picture ? 'Sending the picture…' : 'Transmitting…');
    var room = this.tunedRoom(), b = { text: text };
    if (room) b.room = room;
    var at = this.mentioned(text);
    if (at.length) b.at = at;
    var re = this.replying;
    if (re) b.re = re.id;
    var first = picture ? sendPicture(picture, room, this.state.pass) : Promise.resolve(null);
    first.then(function (up) {
      if (up && up.status === 401) return { status: 401 };
      if (up && up.status !== 200) return up;
      if (up) { b.img = up.body.id; b.alt = me.picAlt.value.trim(); }
      return call('/cb/transmit', { body: b }, me.state.pass);
    }).then(function (r) {
      if (r.status === 401) return me.lost();
      if (r.status === 200) {
        me.say.value = '';
        me.atPicked = [];
        me.grow();
        if (picture) me.dropPicture();
        if (me.replying === re) me.replyStop();
        me.tell('');
        if (room === me.tunedRoom()) { me.show(r.body.messages || [], true); me.readTick(r.body.messages || []); }
        return;
      }
      if (r.status === 429) { me.tell('Easy on the mic: too many in a minute. Try again shortly.'); return; }
      // The message it answered went first: the bar goes, the words stay.
      if (r.status === 409 && r.body && r.body.gone === 're') {
        if (me.replying === re) me.replyStop();
        if (room === me.tunedRoom() && r.body.messages) me.show(r.body.messages);
      }
      me.tell(why(r, 'That did not go out. Try again.'));
    }).catch(function () { me.tell('No signal. That did not go out.'); });
  };

  /* Yours, as canTakeOff in lib.mjs reads it: your handle, folded, and if the
     message came from a claimed username, a claimed pass. A BASE message is
     only ever the base's. */
  Radio.prototype.mine = function (m) {
    if (m.base || m.feed || fold(m.handle) !== fold(this.state.handle)) return false;
    return !m.claimed || claimedPass(this.state.pass);
  };

  /* Yours to edit, as canEdit in lib.mjs reads it: your handle, folded; a
     claimed username's message only with a claimed pass; a BASE message only
     with the base's. Unlike Take off, the base gets no further than its own. */
  Radio.prototype.mayEdit = function (m) {
    if (m.feed || fold(m.handle) !== fold(this.state.handle)) return false;
    if (m.base) return !!this.state.base;
    return !m.claimed || claimedPass(this.state.pass);
  };

  /* Your newest message on the channel you can edit, for Up in an empty
     message box. */
  Radio.prototype.lastMine = function () {
    var list = this.aired || [];
    for (var i = list.length - 1; i >= 0; i--) if (this.mayEdit(list[i])) return list[i].id;
    return null;
  };

  /* EDIT opens the words in a box where they were (Ryan, 2026-10-18). Enter
     saves and Shift and Enter makes a new line, as in the message box (on a
     phone, Return makes a new line and Save saves), and
     Escape puts the message back as it was. Only the words: a picture or a
     sticker stays as it is. One edit at a time, and the box is not a live
     region, so opening it reads nothing out. */
  Radio.prototype.editStart = function (id) {
    var me = this, li = this.msgLi(id);
    if (!li) return;
    if (this.editing) this.editStop();
    shutMore(li);
    shutPick(li);
    var said = li.querySelector(':scope > .cb-text');
    var box = el('div', 'cb-edit');
    box.setAttribute('aria-live', 'off');
    var lab = el('label', 'cb-lab', 'Edit your message');
    lab.htmlFor = 'cb-edit-say';
    var t = el('textarea', 'cb-say cb-say--msg cb-edit__say');
    t.id = 'cb-edit-say';
    t.maxLength = MESSAGE_MAX;
    t.autocomplete = 'off';
    t.value = said ? said.cbRaw : '';
    t.setAttribute('aria-describedby', 'cb-edit-hint');
    sendBox(t, 'done');
    var hint = el('p', 'cb-hint', enterHint('Save', 'saves') + (onTouch() ? '' : ' Escape leaves it as it was.') + ' It will say edited beside the time.');
    hint.id = 'cb-edit-hint';
    var row = el('div', 'cb-row cb-edit__row');
    var save = el('button', 'cb-btn cb-edit__save', 'Save');
    save.type = 'button';
    var no = el('button', 'cb-btn', 'Cancel');
    no.type = 'button';
    save.addEventListener('click', function () { me.editSave(); });
    no.addEventListener('click', function () { me.editStop(true); me.tell(''); });
    t.addEventListener('input', function () { me.grow(t); });
    t.addEventListener('keydown', function (e) {
      if (e.isComposing) return;
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); me.editStop(true); me.tell(''); }
      else if (sendKey(e)) { e.preventDefault(); me.editSave(); }
    });
    box.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && e.target !== t) { e.preventDefault(); me.editStop(true); me.tell(''); }
    });
    row.appendChild(save);
    row.appendChild(no);
    box.appendChild(lab);
    box.appendChild(t);
    box.appendChild(hint);
    box.appendChild(row);
    if (said) { said.hidden = true; said.after(box); }
    else li.appendChild(box);
    this.editing = { id: id, li: li, box: box, say: t };
    linkBox(t, function (w) { me.tell(w); });
    t.focus();
    t.setSelectionRange(t.value.length, t.value.length);
    this.grow(t);
  };

  /* Closing the box puts the words back where they were. `back` puts the
     keyboard on the message's More, which the edit came from. */
  Radio.prototype.editStop = function (back) {
    var ed = this.editing;
    if (!ed) return;
    this.editing = null;
    ed.box.remove();
    var said = ed.li.querySelector(':scope > .cb-text');
    if (said) said.hidden = false;
    if (!back) return;
    var to = ed.li.isConnected && ed.li.querySelector(':scope > .cb-acts > .cb-more');
    if (to) to.focus(); else if (this.say.offsetParent) this.say.focus();
  };

  Radio.prototype.editSave = function () {
    var me = this, ed = this.editing;
    if (!ed || ed.busy) return;
    var room = this.tunedRoom(), b = { id: ed.id, text: ed.say.value.trim() };
    if (room) b.room = room;
    var was = (this.aired || []).filter(function (m) { return m.id === ed.id; })[0];
    var at = this.mentioned(b.text, was && was.at);
    if (at.length) b.at = at;
    ed.busy = true;
    this.tell('Saving your edit…');
    call('/cb/edit', { body: b }, this.state.pass).then(function (r) {
      ed.busy = false;
      if (r.status === 401) return me.lost();
      var here = room === me.tunedRoom();
      if (r.status === 200) {
        if (me.editing === ed) me.editStop(true);
        if (here) me.show(r.body.messages || []);
        me.tell(r.body.same ? 'Nothing changed: those are the words it already had.' : 'Your message is edited.');
        return;
      }
      // Gone, or not yours after all: the answer carries the channel.
      if (here && r.body && r.body.messages) me.show(r.body.messages);
      if (r.status === 429) { me.tell('Easy on the mic: too many in a minute. Try again shortly.'); return; }
      me.tell(why(r, 'That edit did not go out. Try again.'));
    }).catch(function () { ed.busy = false; me.tell('No signal. That edit did not go out.'); });
  };

  Radio.prototype.moderate = function (what, own) {
    var me = this;
    var room = this.tunedRoom();
    if (room) what.room = room;
    call('/cb/moderate', { body: what }, this.state.pass).then(function (r) {
      if (r.status === 401) return me.lost();
      var here = room === me.tunedRoom();
      if (r.status === 200 && here) {
        me.show(r.body.messages || []);
        me.tell(what.clear ? 'Channel cleared.' : own ? 'Your message is off the air.' : 'Taken off the air.');
        /* The button that had the keyboard went with its message, so the
           keyboard goes to the message box rather than to nowhere. */
        if (!what.clear && me.say.offsetParent) me.say.focus();
        return;
      }
      // Already gone, or not yours after all: the answer carries the channel.
      if (here && r.body && r.body.messages) me.show(r.body.messages);
      me.tell(why(r, 'That did not work.'));
    }).catch(function () { me.tell('No signal.'); });
  };

  /* The answer is on the radio, under the log, at every size: in small it is
     the one line shown besides the newest message, because a jump that did
     nothing and said nothing would look broken (the Playhouse's lesson). */
  Radio.prototype.jump = function (secs, film, room, video, beacon) {
    // A beacon means Catch up, pressed under Watching together; a stamp has none.
    var me = this, say = function (t) { if (beacon) me.tellFilm(t); else me.tell(t); };
    if (!inWindow()) { say(jumpHere(secs, film, room, video, beacon)); return; }
    /* From the radio's own window, in the window it came from, by that page's
       own cb.js (loveCbFilms), which finds the film and its play button
       there; the answer is said here, and that window is brought forward. */
    var w = streetWindow(), there = null;
    try { there = w && w.loveCbFilms ? w.loveCbFilms.jump(secs, film, room, video, beacon) : null; } catch (e) { there = null; }
    if (!there) { say('Films play on the page in the window you came from, and there is none with the radio on it now. Bring the radio back into a page to watch together.'); return; }
    say(there + ' That is in the window you came from.');
    try { w.focus(); } catch (e) { /* the browser decides */ }
  };

  /* What moving the film on THIS page to secs (null for live) does, in words:
     a stamp's press, Catch up, or the radio's own window asking. */
  function jumpHere(secs, film, room, video, beacon) {
    var e = window.loveEmbed, w = e && e.where ? e.where() : null;
    var live = secs == null;
    var at = live ? '' : place(secs), called = film ? '\u201c' + film + '\u201d' : 'the film';
    if (room && hereTag() !== room) {
      var there = byTag[room] ? byTag[room].name : '#' + room;
      return ((live ? called + ' is on live' : at + ' is in ' + called) + ' at ' + there + ', and you are in another room, so nothing moved. The room\u2019s name in that message takes you there.');
    }
    if (live) return liveHere(film, video, beacon);
    if (!w || (film && !sameFilm(film, w.film))) {
      /* Catch up beside a host whose film is another film in a list here: the
         list goes to it at the host's place, playing if yours was and waiting
         if it was not, because a jump moves your place and whether it plays is
         still yours. A list nobody has started here is moved and waits. */
      var lst = beacon && beacon.list, mine = !!(w && lst && w.list === lst);
      if (lst && video && e.toEntry && (mine || !w) && e.toEntry(video, secs, mine && w.playing, lst)) {
        return mine
          ? 'Moved to ' + at + ' in ' + called + ', in the list playing here. It plays or stays paused, as it was.'
          : called + ' is ready at ' + at + ' in the list here. Press play on it and it starts there.';
      }
      var got = film && readyFilm(film, video, secs, beacon);
      if (got) {
        return (called + ' is ready at ' + at + ': ' + pressOf(got) + ' has the keyboard. Press it, or Enter, and it starts there' + playsOn(got) + '.' + readyNote(got));
      }
      return (!w
        ? 'No film has been started on this page, so there is nothing to move. Press play on ' + called + ' first, then ' + at + ' will take it there.'
        : at + ' is in ' + called + ', and the film playing here is \u201c' + w.film + '\u201d, so nothing moved. ' + called + ' has no play button of its own on this page.');
    }
    var r = e.seek(secs);
    if (r.past) return (at + ' is past the end of \u201c' + r.film + '\u201d, which runs ' + place(r.duration) + '. It may have been said about a different film.');
    return ('Moved \u201c' + r.film + '\u201d to ' + at + '. It plays or stays paused, as it was.');
  }

  /* A LIVE SPOT, or Catch up beside a live host: a live video has no place to
     move to, so this gets its own play button ready, or says it is on here
     already. It presses nothing. */
  function liveHere(film, video, beacon) {
    var e = window.loveEmbed, w = e && e.where ? e.where({ live: true }) : null;
    var called = film ? '\u201c' + film + '\u201d' : 'the live video';
    if (w && w.live && (!film || sameFilm(film, w.film))) {
      return (w.playing
        ? called + ' is already playing here. It is live, so there is no place in it to move to.'
        : called + ' is on here, paused. It is live, so there is no place in it to move to; press play on it to go on.');
    }
    var got = readyFilm(film, video, null, beacon);
    return (got
      ? called + ' is ready: ' + pressOf(got) + ' has the keyboard. Press it, or Enter, and it plays live' + playsOn(got) + '.' + readyNote(got)
      : called + ' has no play button of its own on this page, so it could not be got ready. It may be in a playlist here.');
  }

  // A title cut short to fit a message ends in an ellipsis and matches by its start.
  function sameFilm(said, playing) {
    var a = said.toLowerCase().replace(/\s+/g, ' ').trim();
    var b = (playing || '').toLowerCase().replace(/\s+/g, ' ').trim();
    if (a.slice(-1) === '\u2026') return b.indexOf(a.slice(0, -1).trim()) === 0;
    return a === b;
  }

  // This room's tag. It is the room's filename, so without the list it can still be told.
  function hereTag() {
    var here = hereRoom();
    return here ? here.tag : herePath().replace(/^\//, '').replace(/\.html$/, '') || 'street';
  }

  // The room this page is, out of the street's own list, or null.
  function hereRoom() {
    if (inChat()) return chatRoom();
    if (offList()) return quietHere();
    var f = forumHere();
    if (f) return f;
    var p = herePath();
    for (var i = 0; rooms && i < rooms.length; i++) if (rooms[i].path === p) return rooms[i];
    return null;
  }

  /* Writes "@34:12 in “the film” at #the-room" where the caret is, or
     "@live in “the video” at #the-room" for a live video,
     cutting the title short with an ellipsis if the whole message would
     otherwise run past what the box takes. A page that is not on the street's
     list, like the 404, gets no #tag. */
  Radio.prototype.addSpot = function () {
    var w = window.loveEmbed && window.loveEmbed.where && window.loveEmbed.where({ live: true });
    if (!w) { this.spotBtn.hidden = true; this.filmShown(); this.tell('No film has been started on this page.'); return; }
    var v = this.say.value;
    var c = this.say.selectionStart == null ? v.length : this.say.selectionStart;
    var before = v.slice(0, c), after = v.slice(c);
    var here = hereRoom();
    var lead = (before && !/\s$/.test(before)) ? ' ' : '';
    var trail = (!after || !/^\s/.test(after)) ? ' ' : '';
    var head = (w.live ? '@live' : '@' + place(w.time)) + ' in \u201c', tail = '\u201d' + (here && !here.quiet ? ' at #' + here.tag : '');
    var film = w.film.replace(/[\u201c\u201d]/g, '"').replace(/\s+/g, ' ').trim();
    var space = this.say.maxLength - before.length - after.length - lead.length - trail.length - head.length - tail.length;
    if (space < 8) { this.tell('Your message is too full for your spot. Make some room and try again.'); return; }
    if (film.length > space) film = film.slice(0, space - 1).trim() + '\u2026';
    var put = lead + head + film + tail + trail;
    this.say.value = before + put + after;
    this.grow();
    c = before.length + put.length;
    this.say.focus();
    this.say.setSelectionRange(c, c);
    this.tell(w.live
      ? 'Your spot in \u201c' + film + '\u201d is in your message, as @live: a live video has no place in it. Nothing goes out until you transmit.'
      : 'Your spot in \u201c' + film + '\u201d is in your message. Nothing goes out until you transmit.');
  };

  /* WORLD OR THIS ROOM. Ryan, 2026-09-28: the radio can tune to the World
     channel, as it always could, or to the channel of the room it is on, and
     a room's channel keeps the World's rules exactly. One at a time, like a
     radio. The choice is remembered, like Small, so moving between rooms
     tuned to rooms hears each room's own channel in turn. A page that is not a
     room on the street, like the 404, has no channel of its own and hears
     World. Retuning starts the log afresh, and what is already on the other
     channel is not read out as news. */
  Radio.prototype.tunedRoom = function () {
    // On the chat page, the channel picked, World's being no room's.
    if (inChat()) {
      var c = chatRoom().tag;
      return c !== WORLD_CALL && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(c) ? c : null;
    }
    // In a room that keeps to itself the radio opens on its channel, and a
    // press of World or This room there is the visitor's and is kept as usual.
    var band = offList() && !this.bandPressed ? 'room' : this.state.band;
    if (band !== 'room' || worldHere()) return null;
    if (rooms && rooms.length && !hereRoom()) return null;
    var tag = hereTag();
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tag) ? tag : null;
  };

  Radio.prototype.setBand = function (band) {
    // On the chat page World is a channel in the list, picked like any other.
    if (inChat()) { if (band === 'world') chatGo(WORLD_CALL); return; }
    var was = this.tunedRoom();
    this.bandPressed = true;
    this.state.band = band === 'room' ? 'room' : 'world';
    save(this.state);
    this.bandShown();
    this.lastTuned = this.tunedRoom();
    if (this.tunedRoom() === was) return;
    this.retune();
  };

  // A new channel: the log starts afresh, and what is on it already is not news.
  Radio.prototype.retune = function () {
    this.editing = null;
    this.replyStop();
    this.log.textContent = '';
    this.seen = {};
    this.heard = false;
    this.log.hidden = true;
    this.quiet.textContent = 'Tuning in\u2026';
    this.quiet.hidden = false;
    this.tell('');
    this.tune();
  };

  /* THE ROOM CAN CHANGE UNDER THE RADIO. In its own window, the window you
     came from has gone to another room; and in the forums, on the page itself,
     another category is being read (2026-10-21), because the forums move by
     their address's fragment and never load again. Asked at every listen, when
     the radio's own window is focused, when a page in that window says it has
     arrived, and when the forums say they have moved. Tuned to This room, the
     radio retunes to the new room's channel, as walking into it with the radio
     on the page would; Be seen here follows on the next listen, and the server
     replaces the record rather than adding one; hosting a film stops, because
     it was hosted in the room you left. Answers whether it retuned, which has
     listened already. */
  Radio.prototype.whereNow = function () {
    var now = herePath() + (offList() ? '|quiet' : '') + '|' + forumHereTag();
    if (now === this.wasPath) return false;
    var first = this.wasPath === undefined;
    this.wasPath = now;
    // The first time is where the radio started, which a press before it
    // listened may already have tuned.
    if (!first) {
      this.bandPressed = false;
      this.seenFrom = null;
      this.seenAnswer = null;
      if (this.hosting && this.hosting.room !== hereTag()) this.setHosting(false, 'You have gone into another room, so you have stopped hosting.');
    }
    this.bandShown();
    this.callShown();
    var tuned = this.tunedRoom(), moved = !first && tuned !== this.lastTuned;
    this.lastTuned = tuned;
    if (moved) this.retune();
    return moved;
  };

  Radio.prototype.bandShown = function () {
    var room = this.tunedRoom(), here = hereRoom();
    var name = here ? here.name : 'this room';
    // In the World room, World IS this room's channel, so there is one button.
    this.roomBtn.hidden = !!(rooms && rooms.length && !here) || worldHere();
    this.worldBtn.setAttribute('aria-pressed', String(!room));
    this.roomBtn.setAttribute('aria-pressed', String(!!room));
    this.roomBtn.textContent = 'This room';
    this.roomBtn.dataset.label = 'This room: ' + name;
    this.roomBtn.setAttribute('aria-label', 'This room: ' + name);
    this.bandNow.textContent = room ? 'Tuned to ' + name : worldHere() ? 'Tuned to World, which is this room\u2019s own channel' : 'Tuned to World';
    this.log.setAttribute('aria-label', (room ? name + '\u2019s channel' : 'The World channel') + ', the last 48 hours');
    if (inChat()) this.chatShown();
    this.hereShown();
    this.presenceShown();
    this.followShown();
    this.newsShown();
  };

  /* WHERE YOU ARE: the room's name as the street's list writes it. Until the
     list arrives, the page's own title, which is the name the list copies;
     once it has arrived, a page that is not on it says so, rather than being
     given a room's name it does not have. A room that keeps to itself names
     itself (quietHere), to the person standing in it and nobody else. */
  function pageName() {
    var d = streetDoc();
    if (!d) return 'No page: the window you came from has gone';
    return d.title.replace(/\s+\u2014\s+Stimpunks\.World$/, '') || 'This page';
  }

  Radio.prototype.hereShown = function () {
    var here = hereRoom();
    var known = !!(rooms && rooms.length);
    this.hereName.textContent = here ? here.name : inWindow() && !streetDoc() ? pageName() : known ? 'A page that is not a room on the street' : pageName();
    this.hereName.classList.toggle('cb-here-name--off', !here && known);
    var tag = here && !here.quiet && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(here.tag) ? here.tag : WORLD_CALL;
    this.toChatLink.href = '/' + CHAT_PAGE + '.html#' + tag;
    this.toChatLink.hidden = inChat() || offList() || (inWindow() && !streetDoc());
    this.dialShown();
  };

  /* THE GLITTER DIAL ON THE RADIO (a request from our community, 2026-10-24):
     Gentle, Regular and MAX GLITTER, and the low-stimulation modes, as the
     dial at the top of a page has them, under Where you are. The radio holds
     no dial of its own: every press goes to love.js's loveLevel and loveLow,
     which keep love-intensity and love-low exactly as the page's dial does
     (make-low-stimulation.py holds that only setLow writes love-low), and the
     page's own dial follows. From the radio's own window, which has no
     love.js, it is the page the radio came from that turns, and this window
     takes the same setting so the radio's colours follow; with that page
     gone, the button is not offered. The words never change with it, and
     nothing here is sent anywhere. */
  function dialWin() {
    if (window.loveLevel && window.loveLow) return window;
    var w = inWindow() ? streetWindow() : null;
    try { return w && w.loveLevel && w.loveLow ? w : null; } catch (e) { return null; }
  }
  // The radio's own window wears the setting of the page it came from.
  function dialMirror(w) {
    if (!w || w === window) return;
    try {
      var from = w.document.documentElement, to = document.documentElement, low = from.getAttribute('data-low');
      to.setAttribute('data-intensity', from.getAttribute('data-intensity') || 'regular');
      if (low) to.setAttribute('data-low', low); else to.removeAttribute('data-low');
    } catch (e) { /* the page has gone */ }
  }

  Radio.prototype.dialMake = function (w) {
    var me = this, p = this.dialPanel;
    function group(ask, list, names, cls, press) {
      p.appendChild(el('p', 'cb-h3', ask));
      var row = el('div', 'cb-tools cb-dial-row');
      row.setAttribute('role', 'group');
      row.setAttribute('aria-label', ask);
      list.forEach(function (k) {
        var b = el('button', 'cb-btn ' + cls, names[k]);
        b.type = 'button';
        b.dataset.k = k;
        b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', function () { press(k); });
        row.appendChild(b);
      });
      p.appendChild(row);
    }
    group(w.loveLevel.ask, w.loveLevel.levels, w.loveLevel.names, 'cb-dial-level', function (k) {
      me.dialSet(function (x) { x.loveLevel.set(k); });
    });
    group(w.loveLow.ask, w.loveLow.modes, w.loveLow.names, 'cb-dial-low', function (k) {
      me.dialSet(function (x) { x.loveLow.set(x.loveLow.now() === k ? null : k); });
    });
    var off = this.dialOff = el('button', 'cb-btn cb-dial-off', 'Back to the rooms’ own colours');
    off.type = 'button';
    off.addEventListener('click', function () { me.dialSet(function (x) { x.loveLow.set(null); }); });
    p.appendChild(off);
    this.dialNote = el('p', 'cb-quiet cb-dial-note');
    p.appendChild(this.dialNote);
  };

  Radio.prototype.dialSet = function (how) {
    var w = dialWin();
    if (w) { how(w); dialMirror(w); }
    this.dialShown();
  };

  Radio.prototype.dialOpen = function (open) {
    var w = dialWin();
    if (open && !w) open = false;
    if (open && !this.dialPanel.firstChild) this.dialMake(w);
    this.dialPanel.hidden = !open;
    this.dialBtn.setAttribute('aria-expanded', String(open));
    this.dialShown();
  };

  // Which level and mode are on, read afresh, since the page's own dial and
  // the bodymind break turn the same one.
  Radio.prototype.dialShown = function () {
    if (!this.dialBtn) return;
    var w = dialWin();
    this.dialBtn.hidden = !w;
    if (!w && !this.dialPanel.hidden) { this.dialPanel.hidden = true; this.dialBtn.setAttribute('aria-expanded', 'false'); }
    if (!w || this.dialPanel.hidden || !this.dialPanel.firstChild) return;
    var level, low;
    try { level = w.loveLevel.now(); low = w.loveLow.now(); this.dialNote.textContent = w.loveLevel.note(); } catch (e) { return; }
    this.dialPanel.querySelectorAll('.cb-dial-level').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.k === level)); });
    this.dialPanel.querySelectorAll('.cb-dial-low').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.k === low)); });
    this.dialOff.hidden = !low;
  };

  // The room a page is, for being seen in: only once the street's list says so.
  function presentRoom() {
    var here = rooms && hereRoom();
    return here && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(here.tag) ? here.tag : null;
  }

  Radio.prototype.setSeen = function (on) {
    this.state.seen = !!on;
    save(this.state);
    this.seenFrom = null;
    this.seenAnswer = null;
    if (!on) this.leaveSeen();
    this.presenceShown();
    if (on) this.hereTick();
    this.tell(on ? 'You are seen now: on Who\u2019s online, by anybody on the CB, with the room you are in, and here by anybody else seen here.' : 'You are not seen now, here or on Who\u2019s online.');
  };

  /* Asked on each listen, and nowhere else. One request at a time. */
  Radio.prototype.hereTick = function () {
    var me = this, tag = presentRoom();
    if (!this.state.seen || !tag) { this.leaveSeen(); return; }
    if (this.hereBusy) return;
    this.hereBusy = true;
    call('/cb/here', { body: { room: tag, visit: VISIT } }, this.state.pass).then(function (r) {
      if (r.status === 401) return me.lost();
      if (!me.state.seen) return;
      if (r.status === 200) { me.seenAs = tag; me.seenAnswer = r.body; me.seenFrom = tag; }
      else if (r.status === 403) { me.seenAnswer = { refused: true }; me.seenFrom = tag; }
      me.presenceShown();
    }).catch(function () { /* the next listen asks again */ })
      .then(function () { me.hereBusy = false; });
  };

  // Not seen any more: tell the server now, rather than let it wait thirty seconds.
  Radio.prototype.leaveSeen = function () {
    if (!this.seenAs) return;
    this.seenAs = null;
    this.seenAnswer = null;
    this.presenceShown();
    call('/cb/here/leave', { body: { visit: VISIT }, keepalive: true }, this.state.pass).catch(function () {});
  };

  // `chat`: draw each person's chat status, which only the radio's own lines do.
  function whoList(p, people, key, chat) {
    p.textContent = '';
    people.forEach(function (x, i) {
      if (i) p.appendChild(document.createTextNode(', '));
      p.appendChild(el('b', null, x[key]));
      if (x.base) p.appendChild(el('span', 'cb-tag', 'BASE'));
      var b = chat && x.chat && chatBadge(x.chat);
      if (b) p.appendChild(b);
    });
  }

  /* The room's own call panel says who is in the call too, on the page where
     the Join button is (Ryan, 2026-09-29), from the same answer and under the
     same rule: only to somebody seen in the room. The panel's [data-call-who]
     line ships hidden and is the room's to dress; this only writes its words.
     Not a live region, for the radio's reason. */
  Radio.prototype.panelShown = function (tag, a) {
    var lines = Array.prototype.slice.call(document.querySelectorAll('[data-call] [data-call-who]'));
    // And the call window's own line, above 8x8's Join button.
    var inWindow = tag && window.loveCall && window.loveCall.whoLine ? window.loveCall.whoLine(tag) : null;
    if (inWindow) lines.push(inWindow);
    for (var i = 0; i < lines.length; i++) {
      var p = lines[i], mine = p === inWindow || (tag && p.closest('[data-call]').getAttribute('data-call') === tag);
      p.hidden = true;
      if (!mine || (a && a.refused)) continue;
      p.hidden = false;
      if (!this.state.seen) p.textContent = 'Switch on Be seen here on the radio to see who is in the call.';
      else if (this.state.folded) p.textContent = 'Open the radio to see who is in the call: folded away, it asks nothing.';
      else if (!a) p.textContent = 'Looking to see who is in the call\u2026';
      else if (!a.callHeard) p.hidden = true;
      else if (!(a.call || []).length) p.textContent = 'Nobody is in the call now.';
      else {
        p.textContent = 'In the call now: ';
        a.call.forEach(function (x, j) {
          if (j) p.appendChild(document.createTextNode(', '));
          p.appendChild(el('b', null, x.name));
          if (x.base) p.appendChild(document.createTextNode(' (base)'));
        });
      }
    }
  };

  Radio.prototype.presenceShown = function () {
    var tag = presentRoom();
    this.present.hidden = !tag;
    this.panelShown(tag, tag && this.seenFrom === tag ? this.seenAnswer : null);
    var seenA = tag && this.seenFrom === tag ? this.seenAnswer : null;
    this.visitorsShown(this.state.seen && !this.state.folded && seenA && !seenA.refused ? seenA.others : []);
    this.familiarShown();
    // Who is in the call is told only to a radio seen here; it is outside the
    // Seen here subsection, so it is put away here rather than with it.
    this.inCallNow.hidden = true;
    if (!tag) return;
    var on = !!this.state.seen, a = this.seenFrom === tag ? this.seenAnswer : null;
    this.seenBtn.setAttribute('aria-pressed', String(on));
    this.seenBtn.textContent = on ? 'Be seen here: on' : 'Be seen here: off';
    if (!on) {
      this.seenNow.textContent = offList()
        ? 'Switch it on to see who else here has, and who is in this room\u2019s call. This room keeps to itself: being seen here shows you only to people seen here, and never on Who\u2019s online.'
        : 'Switch it on to be on Who\u2019s online with the room you are in, and to see who else here has, and who is in this room\u2019s call.';
      return;
    }
    // It never claims what it has not heard.
    if (!a) { this.seenNow.textContent = 'Looking\u2026'; return; }
    if (a.refused) { this.seenNow.textContent = 'Being seen here is for the people this room is for.'; return; }
    var others = a.others || [];
    if (others.length) {
      this.seenNow.textContent = '';
      this.seenNow.appendChild(document.createTextNode('Also seen here: '));
      var span = el('span'); whoList(span, others, 'handle', true); this.seenNow.appendChild(span);
    } else this.seenNow.textContent = 'Nobody else here is seen.';
    // Only once 8x8 is telling us, so an empty list is never a guess.
    if (a.callHeard) {
      var inc = a.call || [];
      this.inCallNow.hidden = false;
      if (inc.length) {
        this.inCallNow.textContent = '';
        this.inCallNow.appendChild(document.createTextNode('In this room\u2019s call: '));
        var c = el('span'); whoList(c, inc, 'name'); this.inCallNow.appendChild(c);
      } else this.inCallNow.textContent = 'Nobody is in this room\u2019s call.';
    }
  };

  /* FAMILIARS IN THE ROOM (Ryan, 2026-10-19: let other people see what
     chimeras are in the room). A familiar lives in its person's own browser
     (familiar.js) and sends nothing; Bring my familiar sends a copy of yours,
     its parts, its name and its sayings, to /cb/familiar, and the people seen
     in the same room as you get it back on their Be seen here answer, as you
     get theirs. So a familiar is seen only where its person is seen, and only
     by people seen there: the one switch both ways, never on Who's online.
     Claimed only, off until pressed, and the copy follows the familiar: taking
     another changes it, and sending it home takes it in. The radio asks
     /cb/familiar once a page whether yours is out. In the radio's own window
     the familiars are in the page it came from. */
  function familiarWindow() { return (inWindow() && streetWindow()) || window; }
  function myFamiliar() {
    try { var w = familiarWindow(); return w.loveFamiliar ? w.loveFamiliar.current() : null; } catch (e) { return null; }
  }
  function famCopy(f) { return f ? JSON.stringify({ parts: f.parts, name: f.name, sayings: f.sayings || [] }) : ''; }
  Radio.prototype.visitorsShown = function (others) {
    var mine = fold(this.state.handle);
    var list = (others || []).filter(function (o) { return o && o.familiar && fold(o.handle) !== mine; });
    if (!list.length && !this.hadVisitors) return;
    this.hadVisitors = list.length > 0;
    withFamiliar(function (fam) { fam.visitors(list); });
  };
  Radio.prototype.familiarShown = function (pressed) {
    // A moderator's own password counts (a cb2.base pass is a claimed
    // username too, forumPass's rule): the server is what decides.
    var me = this, f = myFamiliar(), claimed = !!this.state.claimed || forumPass(this.state.pass);
    // The copy out in rooms follows the familiar, whatever this page shows:
    // at once when somebody took, changed or sent theirs home, and otherwise
    // only while the radio is open, because folded sends nothing.
    if (this.famOut && !this.famBusy && (pressed || !this.state.folded) && famCopy(f) !== this.famSent) {
      if (f) this.sendFamiliar(f); else this.setFamiliarOut(false, true);
    }
    var here = !!(claimed && presentRoom()), show = !!(f && here);
    this.famBtn.hidden = !show;
    // No familiar following you: while you are seen here, a line saying where
    // one comes from, so the switch can be found. Drawn once, not on every
    // listen, so the keyboard is never thrown off its link.
    this.famNow.hidden = !(show || (here && this.state.seen));
    if (!show) {
      if (!this.famNow.hidden && this.famNowKind !== 'none') {
        this.famNowKind = 'none';
        this.famNow.textContent = 'No familiar is following you. Take a chimera with you from ';
        var room = el('a', null, 'Chimera Obscura'); room.href = '/chimera-obscura.html';
        this.famNow.appendChild(room);
        this.famNow.appendChild(document.createTextNode(', or from your chimeras in Profile, and Bring my familiar comes here, to show it to the people seen with you.'));
      }
      return;
    }
    this.famNowKind = 'switch';
    if (this.famOut === undefined && !this.famAsking) {
      this.famAsking = true;
      call('/cb/familiar', null, this.state.pass).then(function (r) {
        me.famAsking = false;
        if (r.status === 401) return me.lost();
        if (r.status !== 200) return;
        me.famOut = !!r.body.out;
        if (me.famOut) me.famSent = '';
        me.familiarShown();
      }, function () { me.famAsking = false; });
    }
    var on = !!this.famOut;
    this.famBtn.setAttribute('aria-pressed', String(on));
    this.famBtn.textContent = 'Bring my familiar: ' + (on ? 'on' : 'off');
    this.famNow.textContent = on
      ? f.name + ' is with you in every room you are seen in, for the people seen there, with its sayings.'
      : 'Switch it on and the people seen in the same room as you see ' + f.name + ' there too, while you are seen. It is off until you do.';
  };
  Radio.prototype.sendFamiliar = function (f, said) {
    var me = this, copy = famCopy(f);
    this.famBusy = true;
    return call('/cb/familiar', { body: { out: JSON.parse(copy) } }, this.state.pass).then(function (r) {
      me.famBusy = false;
      if (r.status === 401) return me.lost();
      if (r.status === 200) { me.famOut = true; me.famSent = copy; if (said) me.tell(said); }
      else me.tell((r.body && r.body.error) || 'That did not work just now.');
      me.familiarShown();
    }, function () { me.famBusy = false; me.tell('The street could not be reached just now. Nothing changed.'); });
  };
  Radio.prototype.setFamiliarOut = function (on, quiet) {
    var me = this, f = myFamiliar();
    if (on) {
      if (f) this.sendFamiliar(f, f.name + ' comes with you now, into every room you are seen in.');
      return;
    }
    this.famBusy = true;
    call('/cb/familiar', { body: { out: null } }, this.state.pass).then(function (r) {
      me.famBusy = false;
      if (r.status === 401) return me.lost();
      if (r.status === 200) { me.famOut = false; me.famSent = ''; if (!quiet) me.tell('Your familiar stays with you alone now: nobody else sees it.'); }
      me.familiarShown();
    }, function () { me.famBusy = false; });
  };

  Radio.prototype.quietText = function () {
    return this.tunedRoom() ? 'Nobody has said anything in this room in the last 48 hours.' : 'Nobody has said anything in the last 48 hours.';
  };

  /* A ROOM'S CALL. Ryan, 2026-09-28: voice and video through 8x8's Jitsi as a
     Service, one call per room, and only for people signed on to the CB,
     because a JaaS call lets nobody in without a token and only our /cb/call
     signs one. The call is a window of its own at the foot of the page, not
     part of the radio, so folding the radio away leaves it running; leaving
     the page hangs up, and the window says so. The frame is built by
     love-embed.js, loaded here if this page has not already got it. Nothing in
     the window moves at any setting. */
  Radio.prototype.callShown = function () {
    var open = window.loveCall && window.loveCall.openRoom ? window.loveCall.openRoom() : null;
    var away = window.loveCall && window.loveCall.away ? window.loveCall.away() : null;
    var here = hereRoom();
    // A call is this room's if it is open at the foot of this page, or popped
    // out into its own window from this room or any visit to it. In the forums
    // the page can have moved to another category under a call that stays up,
    // which is that category's call and not this one's.
    var on = !!(open && open !== WORLD_CALL && (!here || open === here.tag)) || !!(away && here && away.tag === here.tag);
    var world = open === WORLD_CALL || !!(away && away.tag === WORLD_CALL);
    this.showWinBtn.hidden = !away;
    // In the World room its call is the World call, and Join World call is its button.
    this.callBtn.hidden = !(on || (this.calls && here)) || worldHere();
    this.callBtn.setAttribute('aria-pressed', String(on));
    this.worldCallBtn.hidden = !(world || this.calls);
    this.worldCallBtn.setAttribute('aria-pressed', String(world));
    // A window that has just opened gets its who-is-in-the-call line at once.
    if (this.present) this.presenceShown();
  };

  /* One call at a time: joining the World call leaves this room's, and the
     other way round, because loveCall has one window. */
  Radio.prototype.setCall = function (on, world) {
    var me = this, btn = world ? this.worldCallBtn : this.callBtn;
    if (!on) {
      // In its own window: that window is asked to hang up and close.
      var away = window.loveCall.away(), open = window.loveCall.openRoom();
      if (away && (!open || (world ? open !== WORLD_CALL : open === WORLD_CALL))) {
        window.loveCall.leaveAway();
        this.tell('You have left the call, and its window has closed.');
        return;
      }
      window.loveCall.leave();
      return;
    }
    var here = world ? WORLD : hereRoom();
    if (!here) { this.tell('This page is not a room on the street, so it has no call of its own. Join World call works from here.'); return; }
    /* In the radio's own window the radio is the whole window, so a call goes
       into a window of its own, the call's Pop out, straight away. */
    if (inWindow() && window.loveCall.popOut) {
      var out = window.loveCall.popOut(here);
      this.callShown();
      this.tell(out
        ? 'The call is in a window of its own: join it there. It stays open while you go from room to room, and closing it hangs up.'
        : 'Your browser stopped the call\u2019s window opening. Allow pop-ups for stimpunks.world to join a call from here.');
      return;
    }
    this.tell(world ? 'Opening the World call\u2026' : 'Opening the call\u2026');
    window.loveCall.open(here, {
      // The window the keyboard was in has gone, so it comes back to the
      // button that opened it rather than falling to the top of the page.
      left: function (why) {
        me.callShown();
        if (why === 'switch') return;
        if (why === 'away') {
          me.tell('The call is in a window of its own now. Join it again there; it stays open while you go from room to room in this window, and closing it hangs up.');
          // The keyboard was in the window that has gone.
          if (!me.state.folded && !me.showWinBtn.hidden) me.showWinBtn.focus();
          return;
        }
        me.tell('You have left the call.');
        if (!me.state.folded && !btn.hidden) btn.focus();
      }
    }).then(function (r) {
      if (r.status === 401) return me.lost();
      me.callShown();
      // Said every time, because it is the thing about the World call that
      // nobody would guess: it is not a room's, and it still ends with the page.
      me.tell(world && r.ok ? r.said + ' Going to another room hangs up, because every room is a page of its own.' : r.said);
    });
  };

  /* SCREEN A VIDEO. Ryan, 2026-10-04: a moderator wants to screen a video in a
     room without building it into a rack first. They paste the address of one
     YouTube video and it goes up on this page's first screen, in place of what
     the screen had, the way a card's second press puts a film up (rack.js's
     loveRack.put), and the button under the screen puts back what was there.
     A set you tune takes one too (2026-10-05: the Hermitage's television,
     Looming Rocks' stage, the rave's big screen), and its own controls are the
     way back. See firstScreen.
     It plays at once, because pasting it and pressing is the moderator asking
     for it, and nothing goes to the channel: only the video's id is kept from
     the address, and loveEmbed builds the frame from that, youtube-nocookie
     and nothing else. Host this film, once it plays, is what lets the room
     follow, and on everybody else's page it is never the film that goes up,
     only its play button (plateFor). The base only, because putting something
     on everybody's screen is a moderator's to do; the server marks whose
     beacon is the base's, so the plate cannot be asked for by anybody else. */
  Radio.prototype.setScreenPanel = function (open) {
    var glass = firstScreen();
    if (!glass) open = false;
    this.screenPanel.hidden = !open;
    this.screenBtn.setAttribute('aria-expanded', String(!!open));
    this.filmShown();
    if (open) {
      this.screenLab.textContent = 'A YouTube address, to put up on ' + glass.name;
      this.screenSaid.textContent = '';
      this.screenUrl.focus();
    }
    this.place();
  };

  Radio.prototype.screenVideo = function () {
    var glass = firstScreen(), said = this.screenSaid;
    if (!this.state.base) return;
    if (!glass) { said.textContent = 'This page has no screen to put a video on.'; return; }
    var v = videoOf(this.screenUrl.value);
    if (!v) {
      said.textContent = 'That is not the address of one YouTube video. Paste a youtube.com or youtu.be address with the video in it, not a playlist.';
      this.screenUrl.focus();
      return;
    }
    var line = 'Now showing on ' + glass.name + ': a video ' + this.state.handle + ' put up from the CB' + (v.start ? ', from ' + place(v.start) : '') + '.';
    var up = glass.play(v.id, v.start, line);
    if (!up) return;
    var shell = up.node, now = up.now;
    this.screened = { id: v.id, shell: shell, now: now, line: line, name: glass.name, start: v.start, named: false };
    this.screenUrl.value = '';
    /* Done, so the tray goes, and the answer is on the radio's own line, which
       is shown at every size: going Small to clear the screen hides the tray.
       The keyboard goes where a card's press sends it, the line under the
       screen, which is also where the eye has to go. */
    this.setScreenPanel(false);
    shell.scrollIntoView({ block: 'center' });
    var shrank = clearOf(shell);
    this.tellFilm('It is up on ' + glass.name + ' and playing on your page' + (v.start ? ' from ' + place(v.start) : '') +
      '. Once it plays, Host this film lets everybody in this room follow; their screens get its play button, waiting for their press.' +
      (shrank ? ' The radio went small so you can see it; + puts it back.' : ''));
    (now || shell).focus({ preventScroll: true });
  };

  /* The line under the screen names the moderator's video once its player
     has said what it is called, which it does only after it starts. */
  Radio.prototype.screenNamed = function (w) {
    var sc = this.screened;
    if (!sc) return;
    if (!sc.shell.isConnected) { this.screened = null; return; }
    if (sc.named || !w || w.id !== sc.id || !w.film || !sc.now) return;
    sc.named = true;
    var line = 'Now showing on ' + sc.name + ': \u201c' + w.film + '\u201d' + (w.live ? ', live' : w.duration ? ', ' + place(w.duration) : '') +
      ', put up from the CB by ' + this.state.handle + (sc.start ? ', from ' + place(sc.start) : '') + '.';
    sc.now.textContent = sc.now.textContent.replace(sc.line, line);
    sc.line = line;
  };

  /* HOSTING. Ryan, 2026-09-28: somebody watching a film in a room can host it,
     and every radio on the channel then shows where the host has got to, with
     a way to catch up. It is a beacon and not a remote control: nobody's film
     moves unless they press Catch up themselves. What goes out is the handle,
     this room, the film's title, the place in it and whether it is playing;
     it is sent from hostTick, which only listen() calls, so it goes only when
     the radio is open and the tab is in front, and only when the film plays,
     pauses, jumps or changes, or half a minute has passed. One host per room;
     the server says who has it. */
  Radio.prototype.setHosting = function (on, why2) {
    var e = window.loveEmbed, w = e && e.where ? e.where({ live: true }) : null;
    if (!on) {
      var was = this.hosting;
      this.hosting = null;
      this.hostShown();
      if (was) this.sendBeacon({ room: was.room, off: true }, null, why2 || 'You have stopped hosting.');
      return;
    }
    if (!w) { this.tellFilm('Start a film on this page first, then you can host it.'); return; }
    if (rooms && rooms.length && !hereRoom()) { this.tellFilm('This page is not a room on the street, so it cannot be hosted.'); return; }
    this.hosting = { room: hereTag(), sent: null, busy: false };
    this.hostShown();
    // A live video has no place in it to show, so what is shown is that it is live.
    var what = '\u201c' + w.film + '\u201d' + (w.live ? ', live' : ''), seen = w.live ? 'that you are watching it live' : 'where you are in it';
    if (offList()) this.tellFilm('You are hosting ' + what + ' in this room only. Radios tuned to this room\u2019s channel can see ' + seen + ', and nobody outside this room is told. Putting this tab behind another pauses it; folding the radio away or leaving the page stops it.');
    else this.tellFilm('You are hosting ' + what + '. Everybody on the channel can see ' + seen + ', and in which room. Putting this tab behind another pauses it; folding the radio away or leaving the page stops it.');
    this.hostTick(w);
  };

  Radio.prototype.hostShown = function () {
    this.hostBtn.setAttribute('aria-pressed', String(!!this.hosting));
    if (this.hosting) this.hostBtn.hidden = false;
    this.filmShown();
  };

  /* Watching together has a heading of its own only while there is something
     under it: somebody hosting, a film started on this page, or the base's
     Screen a video. A heading over nothing is a part of the radio that looks
     broken. */
  Radio.prototype.filmShown = function () {
    this.filmSec.hidden = this.hostsBox.hidden && this.spotBtn.hidden && this.hostBtn.hidden && this.screenBtn.hidden && this.screenPanel.hidden;
  };

  Radio.prototype.hostTick = function (w) {
    var h = this.hosting;
    if (!h || h.busy) return;
    if (!w) { this.setHosting(false, 'Your film is off, so you have stopped hosting.'); return; }
    /* A list turning to its next film says nothing true about either for a
       moment (love-embed.js), so nothing goes until the next film has started:
       sent in that moment, the beacon told everybody the album had gone back
       to the start of the song just finished. */
    if (w.turning) return;
    var now = Date.now(), last = h.sent;
    var film = Array.from(w.film);
    film = film.length > FILM_MAX ? film.slice(0, FILM_MAX - 1).join('') + '\u2026' : w.film;
    /* A live video: no place and no length, so the beacon goes when it starts,
       plays or pauses, or changes, and every BEAT besides. */
    if (w.live) {
      if (last && last.live && last.film === w.film && last.playing === w.playing && now - last.when < BEAT) return;
      this.sendBeacon({ room: h.room, film: film, video: w.id || null, live: true, playing: !!w.playing },
                      { film: w.film, live: true, playing: !!w.playing, when: now });
      return;
    }
    var guess = last && !last.live ? last.at + (last.playing ? (now - last.when) / 1000 : 0) : 0;
    if (last && !last.live && last.film === w.film && last.playing === w.playing && last.length === !!w.duration &&
        Math.abs(w.time - guess) < 3 && now - last.when < BEAT) return;
    this.sendBeacon({ room: h.room, film: film, video: w.id || null, list: w.list || null, length: w.duration || null, at: Math.max(0, w.time), playing: !!w.playing },
                    { film: w.film, at: w.time, playing: !!w.playing, length: !!w.duration, when: now });
  };

  Radio.prototype.sendBeacon = function (b, sent, done) {
    var me = this, h = this.hosting;
    if (h && !b.off) h.busy = true;
    call('/cb/beacon', { body: b }, this.state.pass).then(function (r) {
      if (h && !b.off) h.busy = false;
      if (r.status === 401) return me.lost();
      if (r.status === 200) {
        if (sent && h && me.hosting === h) h.sent = sent;
        me.showBeacons(r.body.beacons, r.body.now);
        if (done) me.tellFilm(done);
        return;
      }
      if (b.off) { me.tellFilm(why(r, 'That did not reach the channel. Your beacon goes quiet by itself within a minute or two.')); return; }
      // Somebody else has this room, or the beacon was refused: stop. Anything
      // else, a busy channel or too many in a minute, is tried again next listen.
      if (r.status === 409 || r.status === 400) {
        if (me.hosting === h) { me.hosting = null; me.hostShown(); }
        me.tellFilm(why(r, 'Your beacon was refused, so you are not hosting.'));
      }
    }).catch(function () { if (h && !b.off) h.busy = false; });
  };

  Radio.prototype.showBeacons = function (list, now) {
    this.beacons = Array.isArray(list) ? list : [];
    if (typeof now === 'number') this.skew = now - Date.now();
    this.beaconsHeard = true;
    if (this.arriving) { var a = this.arriving; this.arriving = null; landed(a.secs, a.film); }
    this.followTick();
    this.drawBeacons();
  };

  /* FOLLOW THE HOST. Ryan, 2026-09-28: Jitsi's shared video keeps a call in
     step but gives nobody but the host a volume, and Catch up keeps everybody
     their own player but only moves it when pressed. Follow is both: the film
     on your page keeps pace with the host's, and its volume, captions and
     everything else stay yours. It is off until you press it, it is never
     remembered, and it is offered only in the room the host is in.

     On every beacon the radio hears (each listen, every few seconds): when the
     host starts playing, your film plays; when the host pauses, yours pauses;
     and when you are more than DRIFT seconds from where the host is, you are
     moved there. **Your own pause, or your own play while the host is paused,
     is you going your own way, and it ends following**, which is the whole of
     taking a break. A change that the radio itself asked for is given SETTLE
     to happen before it is judged, so the player catching up is not mistaken
     for you. Nothing is sent: it reads what every radio already hears. */
  Radio.prototype.setFollow = function (on, room, said) {
    if (!on) {
      this.following = null;
      this.drawBeacons();
      this.tellFilm(said || 'You have stopped following.');
      return;
    }
    var b = this.beaconIn(room);
    if (!b) { this.tellFilm('That host has stopped.'); return; }
    if (b.live) { this.tellFilm(b.handle + ' is hosting a live video, so there is nothing to keep in step with. Catch up gets it ready to play.'); return; }
    this.following = { room: room, fresh: true, hostWas: null, sent: 0, waiting: false };
    this.tellFilm('Following ' + b.handle + ': your film keeps pace with theirs, at your own volume. Pause, or press Follow again, to go your own way.');
    this.followTick();
    this.drawBeacons();
  };

  Radio.prototype.beaconIn = function (room) {
    for (var i = 0; i < this.beacons.length; i++) if (this.beacons[i].room === room) return this.beacons[i];
    return null;
  };

  Radio.prototype.followTick = function () {
    var f = this.following;
    if (!f) return;
    var b = this.beaconIn(f.room);
    if (!b || f.room !== hereTag()) { this.setFollow(false, null, 'The host has stopped, so you have stopped following.'); return; }
    // FOLLOW IS NEVER FOR A LIVE VIDEO: there is no place in it to keep in step.
    if (b.live) { this.setFollow(false, null, b.handle + ' is hosting a live video now, so there is nothing to keep in step with, and you have stopped following. Catch up gets it ready to play.'); return; }
    var e = window.loveEmbed, w = e && e.where ? e.where() : null;
    // Your own list turning to its next film: nothing it says is true yet.
    if (w && w.turning) return;
    var now = Date.now(), at = this.placeOf(b);
    if (!w || !sameFilm(b.film, w.film)) {
      /* THE HOST'S FILM CAN BE ANOTHER FILM IN A LIST ON THIS PAGE. Helen Edgar
         hosted a whole album at the Hermitage, 2026-10-20, Ryan followed, and
         his album stopped at the end of every song. Each song in a list is a
         film of its own, and Follow took every new one for a film to get ready
         by itself: for a moderator's hosting that puts the song on the page's
         first screen alone (plateFor), the Hermitage's television, where it
         plays to its end and stops, and the next one the same. The beacon says which list now, and a list keeps pace as a list.
         A film apart at the turn, the one behind gets there by itself (atTurn);
         anywhere else in the list, the list here goes to the host's film and
         place in one message (loveEmbed.toEntry), playing or paused as the
         host is. A list here that nobody has started is moved once and waits
         for its own play button. */
      var mine = !!(w && b.list && w.list === b.list), i = mine && w.ids && b.video ? w.ids.indexOf(b.video) : -1;
      if (i >= 0 && atTurn(w, i, b, at)) return;
      if (b.list && b.video && e.toEntry && (mine || (!w && !f.waiting))) {
        if (now - f.sent < SETTLE) return;
        if (e.toEntry(b.video, at, b.playing, b.list)) {
          f.sent = now;
          if (w) { f.hostWas = b.playing; f.fresh = false; f.waiting = false; return; }
          this.tellFilm('Following ' + b.handle + ': the list here is at \u201c' + b.film + '\u201d, where they are. Press play on it and it keeps pace from there.');
          f.waiting = true;
          f.fresh = true;
          return;
        }
      }
      if (!f.waiting) {
        var ready = readyFilm(b.film, b.video, at, b);
        this.tellFilm(ready
          ? 'Following ' + b.handle + ': \u201c' + b.film + '\u201d is ready, and ' + pressOf(ready) + ' has the keyboard. Press it, or Enter, and it keeps pace from there' + playsOn(ready) + '.' + readyNote(ready)
          : 'Following ' + b.handle + ': press play on \u201c' + b.film + '\u201d and it will keep pace from there. It has no play button of its own on this page, so it may be in a playlist here.');
      }
      f.waiting = true;
      f.fresh = true;
      return;
    }
    if (f.waiting) { f.waiting = false; this.tellFilm('Following ' + b.handle + ' in \u201c' + b.film + '\u201d.'); }
    var settling = now - f.sent < SETTLE;
    var turned = f.fresh || f.hostWas !== b.playing;
    f.hostWas = b.playing;
    f.fresh = false;
    if (turned) {
      // The host has just played or paused, or you have just started
      // following: yours does the same, from the host's place.
      e.seek(at);
      if (b.playing) e.play(); else e.pause();
      f.sent = now;
      return;
    }
    if (settling) return;
    /* ONLY A PAUSE IS YOU GOING YOUR OWN WAY. A film that ended before the
       host's, or a next film in a list that would not start by itself (a
       browser that will not play without a press inside the frame), stopped
       on its own, and Follow was switched on to keep pace: it plays it, or
       waits at the end for the host to finish, and says so once if the
       player will not start. It used to read all of these as your pause. */
    if (b.playing && !w.playing && !w.paused) {
      if (w.ended && b.length && b.length - at <= DRIFT + 1) return;
      e.play();
      f.sent = now;
      if (!f.stalled) f.stalled = now;
      else if (!f.toldStall && now - f.stalled > 3 * SETTLE) {
        f.toldStall = true;
        this.tellFilm('Following ' + b.handle + ': your player will not start \u201c' + w.film + '\u201d by itself. Press play on it and it keeps pace from there.');
      }
      return;
    }
    f.stalled = 0;
    f.toldStall = false;
    if (w.playing !== b.playing) {
      this.setFollow(false, null, w.playing
        ? 'You played on while ' + b.handle + ' is paused, so you have stopped following. Press Follow to pick up again.'
        : 'You paused, so you have stopped following. Press Follow to pick up again.');
      return;
    }
    if (Math.abs(w.time - at) > DRIFT) { e.seek(at); f.sent = now; }
  };

  /* A film apart at the turn of a list: you are finishing the film the host
     has just finished, or the host is finishing the one you have just
     finished, within DRIFT and a second. The one behind gets there by itself,
     so nothing is moved; moving it would cut the end off a song, or play its
     last seconds twice. A host whose beacon has gone on well past the end of
     its film without turning is not waited for. */
  function atTurn(w, i, b, at) {
    var near = DRIFT + 1;
    if (i === w.index + 1) return !!(w.playing && w.duration && w.duration - w.time <= near);
    if (i === w.index - 1) return !!(b.playing && b.length && b.length - at <= near && at - b.length < 20);
    return false;
  }

  // Where a host has got to by now: a playing film has gone on since it was heard.
  Radio.prototype.placeOf = function (b) {
    return b.at + (b.playing ? Math.max(0, (Date.now() + this.skew - b.t) / 1000) : 0);
  };

  /* This room's beacon first, then the rest in the street's walking order, so
     nothing is ranked. A beacon for a tag that is not a room on the street is
     not shown. Each row is updated where it stands when it can be, so the
     keyboard is not thrown off a Catch up button every four seconds. */
  Radio.prototype.drawBeacons = function () {
    var ul = this.beaconList, tag = hereTag(), me = this;
    var order = {};
    for (var i = 0; rooms && i < rooms.length; i++) order[rooms[i].tag] = i;
    var list = this.beacons.filter(function (b) { return b.room === tag || byTag[b.room]; });
    list.sort(function (a, b) {
      if (a.room === tag) return -1;
      if (b.room === tag) return 1;
      return (order[a.room] || 0) - (order[b.room] || 0);
    });
    var keys = list.map(function (b) {
      return [b.room, b.room === tag ? (b.handle === me.state.handle ? 'mine' : 'here') : 'there', b.handle, b.base, b.film, b.live ? 'live' : ''].join('|');
    });
    var kids = ul.children, same = kids.length === keys.length;
    for (i = 0; same && i < kids.length; i++) same = kids[i].dataset.key === keys[i];
    if (!same) {
      ul.textContent = '';
      for (i = 0; i < list.length; i++) ul.appendChild(this.beaconRow(list[i], keys[i]));
    }
    for (i = 0; i < list.length; i++) {
      var b = list[i], li = ul.children[i];
      li.querySelector('.cb-beacon-at').textContent = b.live
        ? 'live' + (b.playing ? '' : ', paused')
        : place(this.placeOf(b)) + (b.playing ? ', playing' : ', paused');
      var fo = li.querySelector('.cb-follow');
      if (fo) fo.setAttribute('aria-pressed', String(!!(this.following && this.following.room === b.room)));
      var a = li.querySelector('a.cb-room');
      if (a) a.href = roomHref(byTag[b.room], '#spot=' + (b.live ? 'live' : Math.floor(this.placeOf(b))) + '&film=' + encodeURIComponent(b.film));
    }
    this.hostsBox.hidden = list.length === 0;
    this.filmShown();
  };

  Radio.prototype.beaconRow = function (b, key) {
    var li = el('li', 'cb-beacon'), kind = key.split('|')[1];
    li.dataset.key = key;
    if (kind === 'mine') {
      li.appendChild(document.createTextNode('You are hosting '));
    } else {
      li.appendChild(el('b', 'cb-handle', b.handle));
      if (b.base) li.appendChild(el('span', 'cb-tag', 'BASE'));
      li.appendChild(document.createTextNode(' is hosting '));
    }
    li.appendChild(document.createTextNode('\u201c' + b.film + '\u201d '));
    if (kind === 'there') {
      li.appendChild(document.createTextNode('at '));
      var a = el('a', 'cb-room');
      var hash = el('span', null, '#');
      hash.setAttribute('aria-hidden', 'true');
      a.appendChild(hash);
      a.appendChild(document.createTextNode(byTag[b.room].name));
      li.appendChild(a);
      li.appendChild(document.createTextNode(': '));
    } else {
      li.appendChild(document.createTextNode('here: '));
    }
    li.appendChild(el('span', 'cb-beacon-at'));
    li.appendChild(document.createTextNode('.'));
    if (kind === 'here') {
      var c = el('button', 'cb-btn cb-catch', 'Catch up');
      c.type = 'button';
      c.dataset.room = b.room;
      c.setAttribute('aria-label', b.live
        ? 'Catch up with ' + b.handle + ': get ' + b.film + ' ready to play live'
        : 'Catch up with ' + b.handle + ' in ' + b.film);
      li.appendChild(c);
      // No Follow beside a live video: there is no place in it to keep in step.
      // And none in the radio's own window, where no film is (see popOut).
      if (b.live || inWindow()) return li;
      var fo = el('button', 'cb-btn cb-catch cb-follow', 'Follow');
      fo.type = 'button';
      fo.dataset.room = b.room;
      fo.setAttribute('aria-label', 'Follow ' + b.handle + ' in ' + b.film + ', at your own volume');
      fo.setAttribute('aria-pressed', 'false');
      li.appendChild(fo);
    }
    return li;
  };

  // Catch up: the same jump a spot makes, to where the host is at the press.
  Radio.prototype.catchUp = function (room) {
    for (var i = 0; i < this.beacons.length; i++) {
      var b = this.beacons[i];
      if (b.room === room) { this.jump(b.live ? null : Math.floor(this.placeOf(b)), b.film, b.room, b.video, b); return; }
    }
    this.tellFilm('That host has stopped.');
  };

  /* THE RADIO'S ANSWER, on the line under what was pressed and one at a
     time: tell() under the readout, tellFilm() under Watching together, for
     the hosts' Catch up and Follow, Host this film and Screen a video, and
     tellNews() under Unreads, for Follow every room. Small and the icon show
     the channel and nothing else, so while the radio is either, or that part
     is shut, they answer under the readout, where the answer can be seen. */
  /* What a link the call kept in a new tab says (callUp), beside where it was
     pressed: in the profile it was in, under Messages, Watching together,
     Unreads or Who's around, or under the channel. */
  Radio.prototype.tabTold = function (how, near) {
    if (!how) return;
    var s = how === 'tab'
      ? 'That opened in a new tab, so your call stays up where it is. Pop out, on the call, takes the call with you from room to room instead.'
      : 'Your browser would not open a new tab, so you are still here and so is your call. Hold Ctrl or Cmd as you press the link, or pop the call out first.';
    var dlg = near && near.closest ? near.closest('dialog') : null;
    if (dlg) {
      var p = dlg.querySelector('.cb-said--tab');
      if (!p) {
        p = el('p', 'cb-said cb-said--tab');
        p.setAttribute('role', 'status');
        (dlg.querySelector('.pf-left') || dlg).appendChild(p);
      }
      p.textContent = s;
      return;
    }
    var sec = near && near.closest ? near.closest('.cb-sec') : null;
    if (sec && sec === this.dmSec && this.dmSaid) this.dmTold(s);
    else if (sec && sec === this.filmSec) this.tellFilm(s);
    else if (sec && sec === this.newSec) this.tellNews(s);
    else if (sec && this.aroundSaid && sec.contains(this.aroundSaid)) this.aroundSaid.textContent = s;
    else this.tell(s);
  };

  Radio.prototype.tell = function (s) {
    this.said.textContent = s;
    if (this.filmSaid) this.filmSaid.textContent = '';
    if (this.newsSaid) this.newsSaid.textContent = '';
  };
  Radio.prototype.tellFilm = function (s) {
    if (this.tiny() || this.state.folded || this.filmSec.hidden) { this.tell(s); return; }
    this.filmSaid.textContent = s;
    this.said.textContent = '';
    if (this.newsSaid) this.newsSaid.textContent = '';
  };
  Radio.prototype.tellNews = function (s) {
    if (this.tiny() || this.state.folded) { this.tell(s); return; }
    this.newsSaid.textContent = s;
    this.said.textContent = '';
    if (this.filmSaid) this.filmSaid.textContent = '';
  };

  /* Off the air for a moment. Said on the readout rather than left looking
     like a quiet channel, because "nobody has said anything" and "we could not
     hear the channel" are different sentences, and only one of them is true. */
  Radio.prototype.signal = function (ok) {
    this.quiet.textContent = ok ? this.quietText() : 'No signal: the channel cannot be reached just now. Still trying.';
    if (!ok) { this.quiet.hidden = false; }
    else if (this.log.children.length) { this.quiet.hidden = true; }
  };

  /* The password changed, so the pass no longer opens the channel. Said once,
     on the radio, and then the radio goes. */
  Radio.prototype.lost = function () {
    forget();
    clearTimeout(this.timer);
    this.hush();
    // One sentence and a button, so not the whole window and not an icon.
    if (this.state.size === 'full' || this.state.size === 'icon') this.setSize('normal', true);
    this.set.hidden = false;
    this.set.classList.remove('cb-set--parts');
    this.set.textContent = '';
    var p = el('p', 'cb-who');
    // A password change, a reset, a deletion, or a moderator's kick, time out or ban.
    p.appendChild(document.createTextNode('You are signed off: this username\u2019s password changed, or a moderator signed it off. '));
    var a = el('a', null, 'Sign on again at the Community Center');
    a.href = '/community-center.html#cb-signon';
    p.appendChild(a);
    p.appendChild(document.createTextNode('.'));
    this.set.appendChild(p);
    var done = el('button', 'cb-btn', 'Close');
    done.type = 'button';
    var host = this.host;
    done.addEventListener('click', function () { host.remove(); });
    this.set.appendChild(done);
    this.foldBtn.remove();
    radio = null;
    counter();
  };

  /* ── Where it sits ────────────────────────────────────────────────────── */

  // Stored as a distance from the bottom-right corner, because that is where
  // it docks and where it goes back to.
  Radio.prototype.place = function () { return this.mover ? this.mover.place() : null; };

  /* call.js holds the Mover the radio moves with and a room's call window, so
     it is loaded before the radio is built. A public room's page may already
     have loaded it. */
  function withCall(then) {
    if (window.loveCall) { then(); return; }
    var s = document.createElement('script');
    s.src = '/call.js';
    s.addEventListener('load', function () { if (window.loveCall) then(); });
    document.head.appendChild(s);
  }

  function tuneIn() {
    var s = load();
    if (!s || radio || stub || claiming) return;
    if (!window.loveCall) { withCall(tuneIn); return; }
    // Never inside a frame: the Hermitage's laptop shows this site inside
    // itself, and a radio inside that screen would be a second radio.
    try { if (window.top !== window.self) return; } catch (e) { return; }
    if (document.body.getAttribute('data-cb') === 'off') return;
    // A Town Hall private room: the radio is the base's there (love.js does not
    // load this file for anybody else, and the server refuses them anyway).
    if (!mayHere(s)) return;
    // A pass from a shared password is good only for claiming the username it
    // is on: no radio for it, only the claim (claimFirst).
    if (/^cb1\./.test(s.pass || '')) { claimFirst(s); return; }
    /* OUT IN A WINDOW OF ITS OWN: this page gets the bar saying so, unless
       nothing answers, which means the window went without saying (a crash,
       or a browser that closed it), and then the radio is back here. A radio
       that has started here and then hears a window open steps aside (see
       popLine). */
    // The chat page has the radio whether or not it is out in its own window.
    if (!inWindow() && !inChat() && popLine) {
      if (s.popped) {
        showStub(s, '');
        askWindow(function (alive) {
          if (alive || !stub) return;
          var now = load();
          if (now) { delete now.popped; save(now); }
          unStub();
        });
        arrive();
        return;
      }
      popLine.postMessage({ ask: true });
    }
    radio = new Radio(s);
    /* The forums open a person's profile the way a handle on the channel does:
       their names are buttons, and this is what those buttons press. */
    window.loveRadioPeek = function (handle, from, mark) { if (radio) radio.peek(handle, from, mark || null); };
    /* The community directory opens your own card's editor the way Profile
       does, so the switch that lists you is a press away from the list. */
    window.loveRadioEditCard = function (from) { if (radio) radio.pfEdit(from); };
    /* A spot in the address is read once the radio exists. On most pages
       call.js has to load first, and arrive() used to run from start() while
       the radio was still null, so a spot's room link did nothing there. */
    arrive();
    // The radio's own window says it is open, so a radio on any other page
    // steps aside for it.
    if (inWindow() && popLine) popLine.postMessage({ window: 'open' });
  }

  /* The roles a pass carries are the server's, read off CB_MODS on every
     request, and every listen says what they are now. They are kept beside the
     pass only so love.js can keep the radio out of a Town Hall room this pass
     cannot use; the lock is on the server whatever is kept here. */
  /* Given a role, or had one taken away, at the desk in the Moderators' room
     (2026-10-21): the pass the server says this username holds now, kept in
     place of the old one, so nobody has to sign off and on, and said. */
  Radio.prototype.takeSwap = function (sw) {
    if (!sw || typeof sw.pass !== 'string' || !/^cb2\.(acct|base)\./.test(sw.pass)) return;
    this.state.pass = sw.pass;
    if (typeof sw.handle === 'string') this.state.handle = sw.handle;
    this.state.base = !!sw.base;
    this.state.roles = Array.isArray(sw.roles) ? sw.roles.slice() : [];
    save(this.state);
    this.tell(sw.base ? 'You are a moderator now. Reload the page to see everything that opens.' : 'You are no longer a moderator. Reload the page to see the CB as it is for you now.');
  };
  Radio.prototype.keepRoles = function (roles) {
    if (!Array.isArray(roles)) return;
    var now = roles.slice().sort().join(',');
    if (now === (this.state.roles || []).slice().sort().join(',')) return;
    this.state.roles = roles.slice();
    save(this.state);
  };

  // May this pass have the radio on a Town Hall page that names a role?
  function mayHere(s, b) {
    b = b || document.body;
    if (b.getAttribute('data-cb') !== 'mods') return true;
    var need = (b.getAttribute('data-cb-role') || 'moderator').split(/\s+/);
    var roles = (s && s.roles) || [];
    var key = !b.hasAttribute('data-cb-strict') && roles.indexOf('administrator') >= 0;
    return !!(s && s.base) && (key || need.some(function (r) { return roles.indexOf(r) >= 0; }));
  }

  function signOff() {
    // Notifications on this device stop with the sign-off: told to the street
    // with the pass, which is about to go, then taken off the device.
    var was = load();
    if (was && was.pass) dropThisDevice(was.pass);
    forget();
    if (radio) { clearTimeout(radio.timer); radio.hush(); radio.host.remove(); radio = null; }
    if (claiming) { claiming.remove(); claiming = null; }
    if (stub) unStub();
    counter();
    // Signed off in its own window: the window has nothing left to hold.
    if (inWindow()) closeWindow();
  }

  /* ── Claiming first ───────────────────────────────────────────────────── */

  /* EVERY USERNAME IS CLAIMED NOW. Ryan, 2026-10-21: "Prompt anyone still
     using the community passwords to claim their username. They must claim a
     username to retain access." A pass from the starter password, or from the
     moderators' shared one, is good for one thing on the server now: claiming
     the username it is on (readPass). So a radio holding one is not built at
     all. This panel stands where it would be, in its clothes, says why, and
     claims; claimed, the radio comes with the new pass. It sends nothing until
     it is pressed, except one look at Account for whether recovery by email is
     switched on. Sign off is here too, for somebody who would rather not. */
  var claiming = null;
  function claimFirst(s) {
    if (claiming) return;
    var base = /^cb1\.base\./.test(s.pass), h = s.handle;
    var host = claiming = el('div', 'cb-host');
    if (window.loveCall && window.loveCall.dress) window.loveCall.dress(host, s.scheme);
    var root = host.attachShadow({ mode: 'open' });
    var sheet = document.createElement('link');
    sheet.rel = 'stylesheet';
    sheet.href = '/cb.css';
    host.style.visibility = 'hidden';
    sheet.addEventListener('load', function () { host.style.visibility = ''; });
    sheet.addEventListener('error', function () { host.style.visibility = ''; });
    root.appendChild(sheet);
    var box = el('section', 'cb-radio cb-radio--claim');
    box.setAttribute('aria-labelledby', 'cb-claim-h');
    box.style.right = '16px';
    box.style.bottom = '16px';
    var bar = el('div', 'cb-bar cb-claim-bar');
    var name = el('p', 'cb-name');
    name.appendChild(el('span', 'cb-brand', 'CB'));
    bar.appendChild(name);
    box.appendChild(bar);
    var set = el('div', 'cb-set');
    var head = el('h2', 'cb-h', 'Claim ' + h + ' to stay on');
    head.id = 'cb-claim-h';
    head.tabIndex = -1;
    set.appendChild(head);
    set.appendChild(el('p', null, base
      ? 'Every username on the CB is claimed now, with a password of its own. You are on as ' + h + ' with the moderators’ password, which every moderator knows, so any of them could be you. Choose a password of your own and only you sign on as ' + h + '. Your roles stay where they are, on the moderators’ list.'
      : 'The starter password has been retired, and every username on the CB is claimed now, with a password of its own. Until you claim ' + h + ', the radio is off. Choose a password and ' + h + ' is yours: your pets, avatars and everything else kept under it stay with it.'));
    var pw = field('A password of your own, eight characters or more', 'cb-claim-pw'), again = field('The same again', 'cb-claim-pw2');
    var email = field('An email address for password recovery, if you want one (optional)', 'cb-claim-email', 'email');
    email.input.autocomplete = 'email';
    email.wrap.hidden = true;
    var about = el('p', 'cb-quiet', 'Used for one thing: sending you a reset code when you ask for one at the front desk. Kept scrambled, shown to nobody but you, and gone when your username goes. The email comes from our team’s mailbox.');
    about.hidden = true;
    set.appendChild(pw.wrap); set.appendChild(again.wrap); set.appendChild(email.wrap); set.appendChild(about);
    var row = el('p', 'cb-acct__row');
    var go = el('button', 'cb-btn cb-acct-claim', 'Claim ' + h);
    go.type = 'button';
    var off = el('button', 'cb-btn', 'Sign off');
    off.type = 'button';
    row.appendChild(go); row.appendChild(off);
    set.appendChild(row);
    var said = el('p', 'cb-said');
    said.setAttribute('role', 'status');
    set.appendChild(said);
    box.appendChild(set);
    root.appendChild(box);
    document.body.appendChild(host);
    var gone = 'This browser cannot claim ' + h + ' any more: somebody else may have claimed it, or the password behind the pass has changed. Sign off, and join under a username of your own with an invite.';
    call('/cb/account', null, s.pass).then(function (r) {
      if (r.status === 401) { said.textContent = gone; go.disabled = true; return; }
      if (r.status === 200 && r.body.emailOn) { email.wrap.hidden = false; about.hidden = false; }
    }, function () { /* the claim press says what went wrong */ });
    off.addEventListener('click', signOff);
    go.addEventListener('click', function () {
      if (pw.input.value !== again.input.value) { said.textContent = 'The two passwords are not the same.'; pw.input.focus(); return; }
      go.disabled = true;
      said.textContent = 'Claiming…';
      call('/cb/account', { body: { action: 'claim', password: pw.input.value, email: email.wrap.hidden ? undefined : email.input.value } }, s.pass).then(function (r) {
        if (r.status === 200 && r.body.pass) {
          var now = load() || s;
          now.pass = r.body.pass; now.handle = r.body.handle; now.base = !!r.body.base; now.roles = r.body.roles || []; now.claimed = true;
          save(now);
          set.textContent = '';
          var done = el('h2', 'cb-h', h + ' is yours');
          done.tabIndex = -1;
          set.appendChild(done);
          set.appendChild(el('p', null, 'It signs on with your own password now. Your recovery code is below. It is the way back in if you forget your password, and it will not be shown again: write it down, or keep it where you keep passwords.'));
          set.appendChild(el('p', 'cb-acct__code', r.body.recovery));
          var kept = el('button', 'cb-btn', 'I have kept it');
          kept.type = 'button';
          set.appendChild(kept);
          done.focus();
          kept.addEventListener('click', function () { host.remove(); claiming = null; tuneIn(); });
          return;
        }
        go.disabled = false;
        if (r.status === 401) { said.textContent = gone; go.disabled = true; return; }
        if (r.status === 429) { said.textContent = 'Too many tries from here in a minute. Wait a moment and try again.'; return; }
        said.textContent = why(r, 'That did not work just now. Nothing was claimed.');
      }, function () { go.disabled = false; said.textContent = 'No signal: the desk could not be reached. Nothing was claimed.'; });
    });
  }

  /* ── The radio's own window, seen from a page ─────────────────────────── */

  var stub = null, windowAnswered = null;

  // Is a window holding the radio? Asked over the line; a moment's silence is no.
  function askWindow(then) {
    var done = false;
    windowAnswered = function () { if (done) return; done = true; windowAnswered = null; then(true); };
    popLine.postMessage({ ask: true });
    setTimeout(function () { if (done) return; done = true; windowAnswered = null; then(false); }, 1500);
  }

  /* The radio on this page goes into a window of its own, or has heard that one
     is open: it stops listening, stops being seen, and becomes the bar. */
  function stepAside(said) {
    if (!radio) return;
    var s = radio.state;
    clearTimeout(radio.timer);
    radio.timer = null;
    radio.hush();
    radio.leaveSeen();
    radio.host.remove();
    radio = null;
    window.loveRadioPeek = null;
    window.loveRadioEditCard = null;
    showStub(s, said);
  }

  /* THE BAR LEFT ON A PAGE while the radio is in its own window: the folded
     radio's bar, in the radio's own clothes, saying where it is, with Show it
     and Bring it back. It sends nothing to anybody: it is not the radio. */
  function showStub(s, said) {
    if (stub) { if (said) stub.tell(said); return; }
    var host = el('div', 'cb-host');
    if (window.loveCall && window.loveCall.dress) window.loveCall.dress(host, s.scheme);
    var root = host.attachShadow({ mode: 'open' });
    var sheet = document.createElement('link');
    sheet.rel = 'stylesheet';
    sheet.href = '/cb.css';
    host.style.visibility = 'hidden';
    sheet.addEventListener('load', function () { host.style.visibility = ''; });
    sheet.addEventListener('error', function () { host.style.visibility = ''; });
    root.appendChild(sheet);
    var box = el('section', 'cb-radio cb-radio--folded cb-radio--away');
    box.setAttribute('aria-label', 'CB radio, in a window of its own');
    var x = typeof s.x === 'number' ? s.x : null, y = typeof s.y === 'number' ? s.y : null;
    box.style.right = Math.max(8, Math.min(x == null ? 16 : x, window.innerWidth - 200)) + 'px';
    box.style.bottom = Math.max(8, Math.min(y == null ? 16 : y, window.innerHeight - 80)) + 'px';
    var bar = el('div', 'cb-bar cb-away-bar');
    var name = el('p', 'cb-name');
    name.appendChild(el('span', 'cb-brand', 'CB'));
    name.appendChild(el('span', 'cb-away-where', 'In a window of its own'));
    bar.appendChild(name);
    var show = el('button', 'cb-btn', 'Show it');
    show.type = 'button';
    var back = el('button', 'cb-btn', 'Bring it back');
    back.type = 'button';
    bar.appendChild(show);
    bar.appendChild(back);
    box.appendChild(bar);
    var line = el('p', 'cb-said cb-away-said');
    line.setAttribute('role', 'status');
    box.appendChild(line);
    root.appendChild(box);
    document.body.appendChild(host);
    function tell(t) { line.textContent = t || ''; line.hidden = !t; }
    tell(said);
    show.addEventListener('click', function () {
      if (!showWindow()) tell('Your browser would not bring it forward from here. It is in a window of its own; Bring it back puts it on this page instead.');
      else tell('');
    });
    back.addEventListener('click', function () {
      tell('Bringing it back\u2026');
      // The window closes itself and says so, and every page gets its radio
      // back; if it does not answer, it has gone, and this page takes it back.
      askWindow(function (alive) {
        if (alive) { popLine.postMessage({ back: true }); return; }
        var now = load();
        if (now) { delete now.popped; save(now); }
        unStub(true);
      });
    });
    stub = { host: host, tell: tell, back: back };
  }

  // The bar goes and the radio comes back to this page.
  function unStub(focus) {
    if (!stub) return;
    var had = focus || (stub.host.shadowRoot && stub.host.shadowRoot.activeElement);
    stub.host.remove();
    stub = null;
    tuneIn();
    if (had && radio) radio.whenShown = function () { radio.foldBtn.focus(); };
  }

  /* Bring the window forward. window.open with no address finds a window by its
     name without loading anything into it; where the browser makes a blank one
     instead, it is closed again at once, and the window is asked to come
     forward itself, which a browser may or may not let it do. call.js's
     showAway does the same for the call's window. */
  function showWindow() {
    var w = null;
    try { w = window.open('', CB_WINDOW_NAME); } catch (e) { w = null; }
    var ours = false;
    try { ours = !!w && w.location.pathname === CB_WINDOW; } catch (e) { ours = false; }
    if (w && !ours) { try { w.close(); } catch (e) { /* gone */ } w = null; }
    if (w) { try { w.focus(); } catch (e) { /* the browser decides */ } return true; }
    if (popLine) popLine.postMessage({ show: true });
    return false;
  }

  /* The radio's own window closes: it says it is no longer out first, so the
     pages that get their radios back read love-cb without `popped`. */
  function closeWindow() {
    letGo();
    window.close();
    // A window somebody opened by its address is not one a page may close, so
    // the radio leaves it instead, and the page says where it went.
    setTimeout(function () {
      if (radio) { clearTimeout(radio.timer); radio.host.remove(); radio = null; }
      var said = document.querySelector('[data-cbwin-said]');
      if (said) said.textContent = 'The radio is back on the page you came from. You can close this window.';
    }, 400);
  }
  var letGone = false;
  function letGo() {
    if (letGone || !inWindow()) return;
    letGone = true;
    var now = radio ? radio.state : load();
    if (radio) { radio.leaveSeen(); radio.hush(); }
    if (now && now.popped) { delete now.popped; if (load()) save(now); }
    if (popLine) popLine.postMessage({ window: 'closed' });
  }

  if (popLine) popLine.onmessage = function (e) {
    var d = e.data || {};
    if (inWindow()) {
      if (d.ask && radio) popLine.postMessage({ window: 'open' });
      if (d.back) closeWindow();
      if (d.show) { try { window.focus(); } catch (x) { /* the browser decides */ } }
      if (d.arrived && radio) radio.whereNow();
      return;
    }
    // The chat page's radio is the page, and never steps aside for the window.
    if (inChat()) return;
    if (d.window === 'open') {
      if (windowAnswered) windowAnswered();
      if (radio) stepAside('');
      else if (!stub && load() && document.body.getAttribute('data-cb') !== 'off' && mayHere(load())) showStub(load(), '');
    }
    if (d.window === 'closed' && stub) unStub();
  };
  // The window says when it goes; a page tells the window it has arrived, so
  // the radio out there knows where you are without waiting for its next listen.
  window.addEventListener('pagehide', function () { if (inWindow()) letGo(); });
  if (popLine && !inWindow()) {
    window.addEventListener('pageshow', function () { popLine.postMessage({ arrived: true }); });
    window.addEventListener('focus', function () { popLine.postMessage({ arrived: true }); });
  }
  // The forums have moved to another category, or out of one (forum.js), on
  // this page: the radio here, or the one in its own window, follows.
  if (!inWindow()) {
    window.addEventListener('love-forum-room', function () {
      if (popLine) popLine.postMessage({ arrived: true });
      if (radio && !radio.state.folded && radio.wasPath !== undefined) radio.whereNow();
    });
  }

  /* ── The counter at the Community Center ──────────────────────────────── */

  function counter() {
    var form = document.getElementById('cb-signon');
    var on = document.getElementById('cb-on');
    if (!form || !on) return;
    var s = load();
    form.hidden = !!s;
    on.hidden = !s;
    var rec = document.getElementById('cb-recover-box');
    if (rec) rec.hidden = !!s;
    if (s) document.getElementById('cb-on-as').textContent = s.handle;
  }

  function wireCounter() {
    var form = document.getElementById('cb-signon');
    if (!form) return;
    var said = document.getElementById('cb-signon-said');
    var btn = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var handle = form.elements.handle.value, password = form.elements.password.value;
      said.textContent = 'Checking…';
      btn.disabled = true;
      call('/cb/signon', { body: { handle: handle, password: password } }).then(function (r) {
        btn.disabled = false;
        /* A MODERATOR'S USERNAME NOT CLAIMED YET (2026-10-21): the moderators'
           password signs nobody on now, and sends its moderator to claim the
           username on the joining page, where it is asked for again. */
        if (r.status === 200 && r.body.claim) {
          form.elements.password.value = '';
          said.textContent = r.body.handle + ' is a moderator\u2019s username, and has not been claimed yet. Claim it on ';
          var j = document.createElement('a');
          j.href = '/join.html#name=' + encodeURIComponent(r.body.handle);
          j.textContent = 'the joining page';
          said.appendChild(j);
          said.appendChild(document.createTextNode(', with the moderators\u2019 password and one of your own.'));
          return;
        }
        if (r.status === 200 && r.body.pass) {
          form.elements.password.value = '';
          said.textContent = '';
          save({ handle: r.body.handle, pass: r.body.pass, base: !!r.body.base, roles: r.body.roles || [], claimed: true, folded: false, aloud: true });
          counter();
          tuneIn();
          var hello = document.getElementById('cb-on-said');
          if (hello) hello.textContent = 'You are on. The radio is in the bottom right corner of the screen.';
          return;
        }
        if (r.status === 429) { said.textContent = 'Too many tries from here in a minute. Wait a moment and try again.'; return; }
        said.textContent = why(r, 'That did not work. Try again.');
      }).catch(function () {
        btn.disabled = false;
        said.textContent = 'No signal: the counter could not be reached.';
      });
    });
    var off = document.getElementById('cb-signoff');
    if (off) off.addEventListener('click', signOff);
    wireRecover();
    counter();
  }

  /* GETTING BACK INTO A CLAIMED USERNAME. The recovery code from claiming, a
     reset code we emailed, or a moderator's reset code, and a new password;
     the answer is a pass and a NEW recovery code, shown here once. */
  function wireRecover() {
    var box = document.getElementById('cb-recover-box');
    var form = document.getElementById('cb-recover');
    if (!box || !form) return;
    wireMailReset();
    var said = document.getElementById('cb-recover-said');
    var btn = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.elements.password.value !== form.elements.again.value) { said.textContent = 'The two passwords are not the same.'; return; }
      said.textContent = 'Checking\u2026';
      btn.disabled = true;
      call('/cb/account/recover', { body: { handle: form.elements.handle.value, code: form.elements.code.value, password: form.elements.password.value } }).then(function (r) {
        btn.disabled = false;
        if (r.status === 200 && r.body.pass) {
          form.elements.password.value = ''; form.elements.again.value = ''; form.elements.code.value = '';
          save({ handle: r.body.handle, pass: r.body.pass, base: !!r.body.base, roles: r.body.roles || [], claimed: true, folded: false, aloud: true });
          said.textContent = '';
          var p1 = document.createElement('p'); p1.textContent = 'You are back in, with your new password. Here is your NEW recovery code. The old one no longer works, and this one will not be shown again:';
          var p2 = document.createElement('p'); p2.className = 'ctr-code'; p2.textContent = r.body.recovery;
          form.replaceWith(p1); p1.after(p2);
          counter();
          tuneIn();
          return;
        }
        if (r.status === 429) { said.textContent = 'Too many tries from here in a minute. Wait a moment and try again.'; return; }
        said.textContent = why(r, 'That did not work. Try again.');
      }).catch(function () { btn.disabled = false; said.textContent = 'No signal: the counter could not be reached.'; });
    });
  }

  /* EMAIL ME A RESET CODE (Ryan, 2026-10-21): the username and the address it
     keeps, and the answer is the same whether or not they match, so the desk
     tells nobody anything about anybody's address. */
  function wireMailReset() {
    var form = document.getElementById('cb-mailreset');
    if (!form) return;
    var said = document.getElementById('cb-mailreset-said');
    var btn = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      said.textContent = 'Asking\u2026';
      btn.disabled = true;
      call('/cb/account/recover', { body: { action: 'email', handle: form.elements.handle.value, email: form.elements.email.value } }).then(function (r) {
        btn.disabled = false;
        if (r.status === 200) {
          var rec = document.getElementById('cb-recover-handle');
          if (rec && !rec.value) rec.value = form.elements.handle.value;
          said.textContent = 'Asked. If that username has that address on it, a reset code is on its way, within ten minutes or so, from our team\u2019s mailbox. It works for an hour, in the form below. Nothing came? The address may not be the one on the username, or none is: your recovery code, or a moderator, is the way back in then.';
          return;
        }
        if (r.status === 429) { said.textContent = 'Too many tries from here in a minute. Wait a moment and try again.'; return; }
        said.textContent = why(r, 'That did not work. Try again.');
      }).catch(function () { btn.disabled = false; said.textContent = 'No signal: the counter could not be reached.'; });
    });
  }

  /* ARRIVING BY A SPOT. The room's name in a spot links here with
     #spot=2052&film=..., and this finds that film's own play button on the
     page, has it start there when pressed, puts the keyboard on it and says
     so on the radio. It presses nothing: the film still waits for its press,
     like everything on this street. A title is matched from its start,
     because a button here names the film and then its channel. A playlist
     cannot start at a place in one film, so only a single video's button is
     used, and when there is none the radio says what to do instead. */
  function norm(t) {
    return String(t || '').toLowerCase().replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/\s+/g, ' ').trim();
  }

  /* GET A FILM READY: find its own play button on this page, open whatever
     rack it is folded into, have it start at secs when pressed, bring it into
     view and put the keyboard on it. It presses nothing. Arriving by a spot,
     a pressed @time, Catch up and Follow all come here (Ryan, 2026-09-29:
     people pressed Follow, missed the sentence under the message box, and then
     hunted a rack of similarly named films for the right one). A video id, when
     a host's beacon carries one, finds the button exactly; otherwise the title
     is matched from its start, because a button here names the film and then
     its channel. Only a single video's button can start at a place, so a film
     that is only in a playlist is found by its list's button, and only when
     the host's beacon says which list (readyFilm opens the list at it). */
  function filmButton(film, video, list) {
    var btns = document.querySelectorAll('button.facade'), i, b, src;
    function single(b) {
      src = b.dataset.embedSrc || '';
      return !/[?&]list=/.test(src) && (b.dataset.embedId || /^https:\/\/www\.youtube-nocookie\.com\/embed\/[A-Za-z0-9_-]{11}(\?|$)/.test(src));
    }
    function idOf(b) {
      if (b.dataset.embedId) return b.dataset.embedId;
      var m = /\/embed\/([A-Za-z0-9_-]{11})/.exec(b.dataset.embedSrc || '');
      return m ? m[1] : null;
    }
    if (video) for (i = 0; i < btns.length; i++) if (single(btns[i]) && idOf(btns[i]) === video) return btns[i];
    var want = norm(film), cut = want.slice(-1) === '\u2026';
    if (cut) want = want.slice(0, -1).trim();
    for (i = 0; want && i < btns.length; i++) {
      b = btns[i];
      if (!single(b)) continue;
      var t = norm(b.dataset.embedTitle);
      if (t.indexOf(want) === 0 && (cut || t.length === want.length || /^[\s,:(\-\u2013\u2014|]/.test(t.charAt(want.length)))) return b;
    }
    // A film in a list has no button of its own: the list's play button is
    // its way in, and readyFilm gets it ready at that film.
    for (i = 0; list && i < btns.length; i++) {
      var m = /[?&]list=([A-Za-z0-9_-]+)/.exec(btns[i].dataset.embedSrc || '');
      if (m && m[1] === list) return btns[i];
    }
    return null;
  }

  /* THE PAGE'S FIRST SCREEN, whichever kind it is, behind one face: a rack's
     screen (rack.js's loveRack) or a set you tune (window.loveSet, which
     hermitage.js, looming.js and rave.js each write in their own words),
     whichever comes first in the page. play() puts a moderator's
     video up playing and gives back its frame and the line naming it, if the
     screen has one; ready() puts up a host's video for a follower, unpressed,
     and gives back the button they will press. back says how to put back
     what the screen had. A set does both in its own way, on its own panel. */
  function firstScreen() {
    if (!window.loveEmbed) return null;
    var r = window.loveRack, f = r && r.first && r.first(), set = window.loveSet, rack = null;
    if (f) rack = {
      name: f.name, glass: f.glass, back: 'the button under the screen puts that back',
      play: function (id, start, said) {
        var p = window.loveEmbed.frame(id, 'A video put up from the CB', start);
        if (!p) return null;
        var shell = document.createElement('div');
        shell.className = 'facade';
        shell.style.padding = '0';
        shell.appendChild(p);
        return { node: shell, now: r.put(f.id, shell, said) };
      },
      ready: function (b) { return rackPlate(f, b); }
    };
    // A rack's screen that comes after the set in the page loses to it.
    if (rack && set && set.glass && (set.glass.compareDocumentPosition(rack.glass) & Node.DOCUMENT_POSITION_FOLLOWING)) return set;
    return rack || set || null;
  }

  /* One YouTube video out of whatever address a moderator pastes: watch?v=,
     youtu.be/, /shorts/, /live/ and /embed/, with or without www., m. or
     music., or the bare eleven-character id, and t= or start= if it has one.
     Only the id and the start are kept. A playlist's address with no video in
     it is refused rather than guessed at, and so is /embed/videoseries, whose
     last word happens to be eleven characters long. */
  function videoOf(text) {
    var s = String(text || '').trim(), u, id = null, m;
    if (/^[A-Za-z0-9_-]{11}$/.test(s)) return { id: s, start: 0 };
    try { u = new URL(/^[a-z][a-z0-9+.-]*:/i.test(s) ? s : 'https://' + s); } catch (e) { return null; }
    if (!/^https?:$/.test(u.protocol) || u.username || u.password) return null;
    var host = u.hostname.toLowerCase().replace(/^(?:www|m|music)\./, ''), path = u.pathname;
    if (host === 'youtu.be') id = path.split('/')[1];
    else if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      if (path === '/watch') id = u.searchParams.get('v');
      else if ((m = /^\/(?:embed|shorts|live|v)\/([^/]+)/.exec(path))) id = m[1];
    }
    if (!id || id === 'videoseries' || !/^[A-Za-z0-9_-]{11}$/.test(id)) return null;
    return { id: id, start: startOf(u.searchParams.get('t') || u.searchParams.get('start')) };
  }
  // "90", "90s", "1m30s", "1h2m3s" -> seconds; anything else -> 0.
  function startOf(t) {
    if (!t) return 0;
    if (/^\d+$/.test(t)) return +t;
    var m = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(t);
    return m && m[0] ? (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0) : 0;
  }

  /* A MODERATOR'S VIDEO HAS NO BUTTON ON ANYBODY ELSE'S PAGE, because it was
     pasted into their radio rather than built into a rack. So for a beacon
     the server marks as the base's, naming a video nothing on this page
     plays, the video's play button goes up on this page's first screen,
     saying how long it runs and who put it there, and readyFilm then finds it
     like any other button. It presses nothing: nothing reaches YouTube until
     the follower presses it. Only the base's, because anybody else's beacon
     names whatever video they say it does, and a stranger's choice does not
     go up on somebody's screen. On a rack's screen it is a plate in the
     rack's place; a set you tune puts it on its own panel instead.
     Returns the button to press, the screen's name and the way back, or null. */
  function plateFor(b) {
    var glass = firstScreen();
    if (!glass || !b || !b.base || !/^[A-Za-z0-9_-]{11}$/.test(b.video || '')) return null;
    var button = glass.ready({ id: b.video, film: b.film, length: b.length, live: !!b.live, by: b.handle });
    return button ? { button: button, name: glass.name, back: glass.back } : null;
  }

  // spec is what firstScreen's ready() is handed: { id, film, length, live, by }.
  function rackPlate(f, spec) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'facade';
    btn.dataset.embedId = spec.id;
    btn.dataset.embedTitle = spec.film;
    btn.appendChild(document.createTextNode('\u201c' + spec.film + '\u201d \u2014 ' +
      (spec.live ? 'live, so it runs until you close it' : spec.length ? 'runs ' + place(spec.length) : 'how long it runs was not said') + ', hosted on the CB by ' + spec.by));
    var go = document.createElement('span');
    go.className = 'facade__play';
    go.textContent = '\u25B6 PRESS PLAY';
    btn.appendChild(go);
    window.loveRack.put(f.id, btn, 'On ' + f.name + ' now: \u201c' + spec.film + '\u201d, which ' + spec.by + ' is hosting from the CB. It waits for your press.');
    return btn;
  }

  /* ON A RACK, ENTER PUTS IT ON THE SCREEN. Ryan, 2026-10-17: Follow said
     press Enter, and Enter played the film in its card, small, under the
     screen, so people pressed the card's screen button as well and had it
     playing twice. A card whose screen this page has gets the keyboard on its
     screen button instead, the one rack.js shows, and the start still goes on
     the card's own play button, which is where rack.js reads it. Anything not
     on a rack, or a card whose screen button is not shown, is as it was. */
  function screenButtonFor(hit) {
    var card = hit.closest('[data-rack-card]');
    var to = card && window.loveRack && card.querySelector('button[data-rack-to]');
    return to && !to.hidden && to.offsetParent ? to : null;
  }

  /* A LIST'S PLAY BUTTON IS GOT READY AT ONE OF ITS FILMS (2026-10-20): the
     host's beacon says which list, and before it did, a moderator's song out
     of an album went up on the page's first screen on its own, as if it had
     been pasted into the radio, and stopped there at its end. The list's own
     button now carries data-embed-entry, the host's film, and the frame its
     press builds opens on that film at that place and plays on through the
     list (love-embed.js's atEntry and withStart). Only one list waits at a
     film at a time, and a list without its film named gets no start, because
     start= would land in whichever film comes first. It is pressed where it
     is, never through a rack's screen button, which knows nothing of entries. */
  function readyFilm(film, video, secs, beacon) {
    var list = beacon && beacon.list, hit = filmButton(film, video, list), put = null;
    if (!hit && beacon && (put = plateFor(beacon))) hit = put.button;
    if (!hit) return null;
    var old = document.querySelectorAll('[data-cb-ready]');
    for (var o = 0; o < old.length; o++) old[o].removeAttribute('data-cb-ready');
    var inList = !put && !!list && /[?&]list=/.test(hit.dataset.embedSrc || '');
    var was = document.querySelectorAll('[data-embed-entry]');
    for (o = 0; o < was.length; o++) was[o].removeAttribute('data-embed-entry');
    if (inList && /^[A-Za-z0-9_-]{11}$/.test(video || '')) hit.dataset.embedEntry = video;
    if (secs != null && (!inList || hit.dataset.embedEntry)) hit.dataset.embedStart = String(Math.max(0, Math.floor(secs)));
    else delete hit.dataset.embedStart;
    for (var d = hit.closest('details'); d; d = d.parentElement && d.parentElement.closest('details')) d.open = true;
    var to = put || inList ? null : screenButtonFor(hit), press = to || hit;
    // Seen as well as focused: the page goes to it (at once, the dial's rule
    // against smooth scrolling), and it wears a ring even after a mouse press,
    // which is the case a browser's own focus ring leaves out.
    press.scrollIntoView({ block: 'center' });
    press.setAttribute('data-cb-ready', '');
    press.addEventListener('blur', function off() { press.removeAttribute('data-cb-ready'); press.removeEventListener('blur', off); });
    try { press.focus({ preventScroll: true, focusVisible: true }); } catch (e) { press.focus(); }
    return { button: press, shrank: clearOf(press), put: put, screen: to ? to.getAttribute('data-rack-name') || 'the screen' : null,
             list: inList ? hit.dataset.embedTitle || 'the list it is in' : null };
  }

  /* What the radio says has the keyboard, and where it plays: the card's
     screen button and the screen, or the film's own play button. */
  function pressOf(got) {
    if (got && got.list) return 'the play button of the list it is in, \u201c' + got.list + '\u201d,';
    return got && got.screen ? 'the button that puts it up on ' + got.screen : 'its play button';
  }
  function playsOn(got) { return got && got.screen ? ', on ' + got.screen : ''; }
  function upFirst(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* A film under the radio has been got ready out of sight, which is the
     fault this exists to fix, so the radio goes Small for now and says so.
     Small still listens; + makes it larger again, and nothing is saved. An
     icon is smaller than Small already and is left as it is. */
  function clearOf(node) {
    var shrank = false;
    if (radio && !radio.tiny() && !radio.state.folded) {
      var a = node.getBoundingClientRect(), r = radio.box.getBoundingClientRect();
      if (a.left < r.right && a.right > r.left && a.top < r.bottom && a.bottom > r.top) { radio.setSize('small', true); shrank = true; }
    }
    // Still under it, on a narrow window: lift the film to just above the radio,
    // once the radio's answer is written, because the answer makes it taller.
    setTimeout(function () {
      if (!radio || radio.state.folded) return;
      radio.place();
      var f = node.getBoundingClientRect(), q = radio.box.getBoundingClientRect(), dy = f.bottom - q.top + 12;
      if (f.left < q.right && f.right > q.left && f.top < q.bottom && f.bottom > q.top && f.top - dy >= 8) window.scrollBy(0, dy);
    }, 0);
    return shrank;
  }
  function readyNote(got) {
    if (!got) return '';
    return (got.put ? ' It went up on ' + got.put.name + ', in place of what was there; ' + got.put.back + '.' : '') +
      (got.shrank ? ' The radio went small so you can see it; + makes it larger again.' : '');
  }

  function arrive() {
    if (location.hash === '#cb=props') { if (radio) radio.toProps(); return; }
    if (location.hash === '#cb=messages') { if (radio) radio.toMessages(); return; }
    var m = location.hash.match(/^#spot=(\d{1,6}|live)(?:&film=([^&]*))?$/);
    if (m && !radio && stub) {
      var s2 = m[1] === 'live' ? null : +m[1], f2 = '';
      try { f2 = decodeURIComponent(m[2] || ''); } catch (e) { return; }
      stub.tell(jumpHere(s2, f2, '', null, null));
      return;
    }
    if (!m || !radio) return;
    var secs = m[1] === 'live' ? null : +m[1], film = '';
    try { film = decodeURIComponent(m[2] || ''); } catch (e) { return; }
    /* Arriving from a host's row in another room: a moderator's pasted video
       has no button here until that host's beacon has been heard, which is
       the radio's first listen, so it waits for that rather than giving up. */
    if (!radio.beaconsHeard && !filmButton(film, null)) { radio.arriving = { secs: secs, film: film }; return; }
    landed(secs, film);
  }

  function landed(secs, film) {
    var b = radio.beaconIn(hereTag()), host = b && film && sameFilm(film, b.film) ? b : null;
    var called = film ? '\u201c' + film + '\u201d' : 'the film';
    var got = readyFilm(film, host && host.video, secs, host);
    if (secs == null) {
      radio.tell(got
        ? 'You came for ' + called + ', live. ' + upFirst(pressOf(got)) + ' has the keyboard: press it, or Enter, and it plays live' + playsOn(got) + '.' + readyNote(got)
        : called + ' has no play button of its own on this page, so it could not be got ready. It may be in a playlist here.');
      return;
    }
    var at = place(secs);
    if (!got) {
      radio.tell(called + ' has no play button of its own on this page, so it could not be set to start at ' + at + '. Press play on it, then press @' + at + ' on the channel.');
      return;
    }
    radio.tell('You came for ' + at + ' in ' + called + '. ' + upFirst(pressOf(got)) + ' has the keyboard: press it, or Enter, and it starts there' + playsOn(got) + '.' + readyNote(got));
  }

  if (!inWindow()) window.loveCbFilms = { jump: jumpHere };

  function start() {
    wireCounter();
    // The radio's own window, opened with nobody signed on in this browser.
    if (inWindow() && !load()) {
      var said = document.querySelector('[data-cbwin-said]');
      if (said) said.textContent = 'This browser is not signed on to the CB, so there is no radio to hold here. Sign on at the Community Center, then pop the radio out again.';
    }
    tuneIn();
    // Following a spot to the room you are already in changes only the hash.
    window.addEventListener('hashchange', arrive);
    // On the chat page the hash is the channel.
    if (inChat()) window.addEventListener('hashchange', function () { chatTake(false); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();

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
     · NO ALERTS. No sound, no notification, no badge, no unread count, nothing
       in the page title, and nothing is saved up for when you come back. The
       one channel it does use is the screen reader's, and only while the radio
       is open, and there is a switch for that on the radio.
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
  var EVERY = 4000;       // ms between listens while open and in front
  var STEP = 24;          // px per arrow press when moving by keyboard
  var EDGE = 8;           // px the radio keeps from the edge of the window

  function load() {
    try { var v = JSON.parse(localStorage.getItem(KEY) || 'null'); return v && v.pass ? v : null; }
    catch (e) { return null; }
  }
  function save(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* private window */ } }
  function forget() { try { localStorage.removeItem(KEY); } catch (e) { /* nothing to forget */ } }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
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
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (b) { return { status: r.status, body: b }; });
    });
  }

  /* A LINK TO ANOTHER ROOM IS CLICKABLE AND A LINK ANYWHERE ELSE IS NOT. Ryan
     asked, 2026-09-25, so that somebody can drop a room on the channel for
     somebody else to join them in. Only this street's own addresses become
     links -- stimpunks.world/..., with or without https:// and www. -- and they
     open as a path on whatever host is serving the page, so they work the same
     on the dev server. Everything else somebody types stays plain words you can
     copy: the channel is a stranger's words reaching the page, and a clickable
     link to anywhere is the one way it could send somebody off the street
     without their noticing where. The path is checked character by character
     rather than escaped, so nothing but a path can reach an href. */
  var STREET = /(?:https?:\/\/)?(?:www\.)?stimpunks\.world(\/[A-Za-z0-9\-._~\/#?=&%+]*)?/gi;
  var TRAIL = /[.,;:!?)\]'"]+$/;

  function streetLinks(parent, text) {
    var at = 0, m;
    STREET.lastIndex = 0;
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
      var prev = m.index ? text.charAt(m.index - 1) : ' ';
      if (!m[1] && /[A-Za-z0-9-]/.test(next)) continue;
      if (/[A-Za-z0-9.\/@_~%-]/.test(prev)) continue;
      if (m.index > at) hashRooms(parent, text.slice(at, m.index));
      var a = el('a', null, said);
      a.href = path;
      parent.appendChild(a);
      at = m.index + said.length;
      STREET.lastIndex = at;
    }
    if (at < text.length) hashRooms(parent, text.slice(at));
    return parent;
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

  function takeRooms(list) {
    var ok = [];
    for (var i = 0; i < (list || []).length; i++) {
      var r = list[i];
      if (r && typeof r.tag === 'string' && typeof r.name === 'string' &&
          typeof r.path === 'string' && ROOMPATH.test(r.path)) {
        ok.push(r);
        byTag[r.tag] = r;
      }
    }
    rooms = ok;
  }

  function hashRooms(parent, text) {
    var at = 0, m;
    TAG.lastIndex = 0;
    while ((m = TAG.exec(text))) {
      var room = byTag[m[1].toLowerCase()];
      var prev = m.index ? text.charAt(m.index - 1) : ' ';
      var next = text.charAt(m.index + m[0].length);
      if (!room || /[A-Za-z0-9_&#\/-]/.test(prev) || /[A-Za-z0-9_]/.test(next)) continue;
      if (m.index > at) parent.appendChild(document.createTextNode(text.slice(at, m.index)));
      var a = el('a', 'cb-room');
      a.href = room.path;
      var hash = el('span', null, '#');
      hash.setAttribute('aria-hidden', 'true');
      a.appendChild(hash);
      a.appendChild(document.createTextNode(room.name));
      parent.appendChild(a);
      at = m.index + m[0].length;
    }
    if (at < text.length) parent.appendChild(document.createTextNode(text.slice(at)));
  }

  /* What the completion list offers for what has been typed after a #: every
     room whose tag, or any word of whose name, starts with it, in walking
     order and no other, and no more than PICK of them. */
  var PICK = 8;
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

  function clock(t) {
    var d = new Date(t);
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  /* ── The radio ─────────────────────────────────────────────────────────── */

  var radio = null;

  function Radio(state) {
    var me = this;
    this.state = state;
    this.seen = {};
    this.timer = null;

    var box = this.box = el('section', 'cb-radio');
    box.setAttribute('aria-label', 'CB radio');

    // The bar along the top is the handle you drag it by, and holds the buttons.
    var bar = this.bar = el('div', 'cb-bar');
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

    var move = this.moveBtn = el('button', 'cb-btn cb-move', 'Move');
    move.type = 'button';
    move.id = 'cb-move';
    var moveHow = el('span', 'sr', 'Arrow keys move the radio. Home puts it back in the corner.');
    moveHow.id = 'cb-move-how';
    move.setAttribute('aria-describedby', 'cb-move-how');
    bar.appendChild(move);
    bar.appendChild(moveHow);

    var size = this.sizeBtn = el('button', 'cb-btn cb-size');
    size.type = 'button';
    bar.appendChild(size);

    var fold = this.foldBtn = el('button', 'cb-btn cb-fold');
    fold.type = 'button';
    fold.setAttribute('aria-controls', 'cb-set');
    bar.appendChild(fold);
    box.appendChild(bar);

    var tpp = this.tpPanel = el('div', 'cb-tp-panel');
    tpp.id = 'cb-tp-panel';
    tpp.hidden = true;
    var tlab = el('label', 'cb-lab', 'Teleport to a room');
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
    var set = this.set = el('div', 'cb-set');
    set.id = 'cb-set';

    var who = el('p', 'cb-who');
    who.appendChild(document.createTextNode('On the channel as '));
    who.appendChild(el('b', null, state.handle));
    if (state.base) who.appendChild(el('span', 'cb-tag', 'BASE'));
    set.appendChild(who);

    var lcd = el('div', 'cb-lcd');
    var log = this.log = el('ol', 'cb-log');
    log.setAttribute('role', 'log');
    log.setAttribute('aria-label', 'The channel, latest ten messages');
    lcd.appendChild(log);
    // Nothing is claimed about the channel until it has been heard.
    this.quiet = el('p', 'cb-quiet', 'Tuning in\u2026');
    lcd.appendChild(this.quiet);
    set.appendChild(lcd);

    var form = this.form = el('form', 'cb-tx');
    var lab = el('label', 'cb-lab', 'Your message');
    lab.htmlFor = 'cb-say';
    var say = this.say = el('input', 'cb-say');
    say.id = 'cb-say';
    say.type = 'text';
    say.maxLength = 280;
    say.autocomplete = 'off';
    say.setAttribute('enterkeyhint', 'send');
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
    var row = el('div', 'cb-row');
    row.appendChild(say);
    row.appendChild(send);
    form.appendChild(lab);
    form.appendChild(pick);
    form.appendChild(row);
    set.appendChild(form);

    this.said = el('p', 'cb-said');
    this.said.setAttribute('role', 'status');
    set.appendChild(this.said);

    var tools = el('div', 'cb-tools');
    var aloud = this.aloudBtn = el('button', 'cb-btn cb-aloud');
    aloud.type = 'button';
    tools.appendChild(aloud);
    if (state.base) {
      var clear = el('button', 'cb-btn cb-clear', 'Clear the channel');
      clear.type = 'button';
      clear.addEventListener('click', function () { me.moderate({ clear: true }); });
      tools.appendChild(clear);
    }
    var off = el('button', 'cb-btn cb-off', 'Sign off');
    off.type = 'button';
    off.addEventListener('click', function () { signOff(); });
    tools.appendChild(off);
    set.appendChild(tools);

    var norms = el('p', 'cb-norms');
    var a = el('a', null, 'House norms at the Community Center');
    a.href = '/community-center.html#cb-norms';
    norms.appendChild(a);
    set.appendChild(norms);

    box.appendChild(set);

    fold.addEventListener('click', function () { me.setFolded(!me.state.folded); });
    size.addEventListener('click', function () { me.setSmall(!me.state.small); });
    tp.addEventListener('click', function () { me.setTeleport(tpp.hidden); });
    find.addEventListener('input', function () { me.tpRender(); });
    find.addEventListener('keydown', function (e) { me.tpKey(e); });
    aloud.addEventListener('click', function () { me.setAloud(!me.aloud()); });
    form.addEventListener('submit', function (e) { e.preventDefault(); me.transmit(); });
    say.addEventListener('input', function () { me.complete(); });
    say.addEventListener('click', function () { me.complete(); });
    say.addEventListener('keyup', function (e) {
      if (/^(ArrowLeft|ArrowRight|Home|End)$/.test(e.key)) me.complete();
    });
    say.addEventListener('keydown', function (e) { me.pickKey(e); });
    say.addEventListener('blur', function () { me.close(); });
    move.addEventListener('keydown', function (e) { me.keyMove(e); });
    this.dragging();

    document.addEventListener('visibilitychange', function () { me.tune(); });
    window.addEventListener('resize', function () { me.place(); });

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
    var root = host.attachShadow({ mode: 'open' });
    var sheet = document.createElement('link');
    sheet.rel = 'stylesheet';
    sheet.href = '/cb.css';
    host.style.visibility = 'hidden';
    function shown() { host.style.visibility = ''; me.place(); }
    sheet.addEventListener('load', shown);
    sheet.addEventListener('error', shown);
    root.appendChild(sheet);
    root.appendChild(box);
    document.body.appendChild(host);
    this.setAloud(this.aloud(), true);
    this.setSmall(!!state.small, true);
    this.setFolded(!!state.folded, true);
    this.place();
  }

  Radio.prototype.aloud = function () { return this.state.aloud !== false; };

  Radio.prototype.setAloud = function (on, quiet) {
    this.state.aloud = on;
    this.log.setAttribute('aria-live', on ? 'polite' : 'off');
    this.aloudBtn.setAttribute('aria-pressed', String(on));
    this.aloudBtn.textContent = on ? 'Read new messages aloud: on' : 'Read new messages aloud: off';
    if (!quiet) save(this.state);
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
     its bottom right corner, so it shrinks towards wherever it was put. */
  Radio.prototype.setSmall = function (small, quiet) {
    this.state.small = small;
    this.box.classList.toggle('cb-radio--small', small);
    this.sizeBtn.setAttribute('aria-pressed', String(small));
    this.sizeBtn.textContent = 'Small';
    this.sizeBtn.setAttribute('aria-label', small ? 'Small: showing only the newest message' : 'Small: show only the newest message');
    if (small) this.close();
    if (!quiet) save(this.state);
    this.place();
    if (!small) this.log.scrollTop = this.log.scrollHeight;
  };

  Radio.prototype.setFolded = function (folded, quiet) {
    this.state.folded = folded;
    this.box.classList.toggle('cb-radio--folded', folded);
    this.set.hidden = folded;
    this.sizeBtn.hidden = folded;
    this.tpBtn.hidden = folded;
    if (folded && !this.tpPanel.hidden) this.setTeleport(false);
    this.foldBtn.setAttribute('aria-expanded', String(!folded));
    this.foldBtn.textContent = folded ? 'Switch on' : 'Fold away';
    if (!quiet) save(this.state);
    this.place();
    this.tune();
  };

  /* Listening happens here and nowhere else, so this is the one function that
     decides whether the radio is making requests. */
  Radio.prototype.tune = function () {
    var on = !this.state.folded && document.visibilityState === 'visible';
    clearTimeout(this.timer);
    this.timer = null;
    if (on) this.listen();
  };

  Radio.prototype.listen = function () {
    var me = this;
    this.loadRooms();
    call('/cb/channel', null, this.state.pass).then(function (r) {
      if (r.status === 401) return me.lost();
      if (r.status === 200) { me.signal(true); me.show(r.body.messages || []); }
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
    var log = this.log;
    var atEnd = log.hidden || log.scrollHeight - log.scrollTop - log.clientHeight < 24;
    for (i = 0; i < messages.length; i++) want[messages[i].id] = true;
    // Gone from the channel: pushed off by an eleventh, taken off by the base,
    // or midnight.
    var lis = this.log.querySelectorAll('li');
    for (i = 0; i < lis.length; i++) {
      if (!want[lis[i].dataset.id]) { delete this.seen[lis[i].dataset.id]; lis[i].remove(); }
    }
    for (i = 0; i < messages.length; i++) {
      var m = messages[i];
      if (this.seen[m.id]) continue;
      this.seen[m.id] = true;
      var li = el('li', 'cb-msg' + (m.base ? ' cb-msg--base' : ''));
      li.dataset.id = m.id;
      var head = el('p', 'cb-head');
      head.appendChild(el('b', 'cb-handle', m.handle));
      if (m.base) head.appendChild(el('span', 'cb-tag', 'BASE'));
      var when = el('time', 'cb-time', clock(m.t));
      when.dateTime = new Date(m.t).toISOString();
      head.appendChild(when);
      li.appendChild(head);
      var said = el('p', 'cb-text');
      said.cbRaw = m.text;
      li.appendChild(streetLinks(said, m.text));
      added++;
      if (this.state.base) {
        var off = el('button', 'cb-btn cb-take', 'Take off the air');
        off.type = 'button';
        off.setAttribute('aria-label', 'Take ' + m.handle + '’s message at ' + clock(m.t) + ' off the air');
        (function (id) { off.addEventListener('click', function () { me.moderate({ remove: id }); }); })(m.id);
        li.appendChild(off);
      }
      this.log.appendChild(li);
    }
    this.quiet.textContent = 'Nobody has said anything today.';
    this.quiet.hidden = messages.length > 0;
    this.log.hidden = messages.length === 0;
    if (mine || (added && atEnd)) this.log.scrollTop = this.log.scrollHeight;
  };

  /* The room list, fetched from this site once, and only while the radio is
     on: by the first listen, or by opening the teleporter, whichever is first. */
  Radio.prototype.loadRooms = function () {
    var me = this;
    if (this.askedRooms) return;
    this.askedRooms = true;
    fetch('/cb-rooms.json', { credentials: 'omit', headers: { 'accept': 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (d) { takeRooms(d.rooms); me.rerender(); me.complete(); }
        if (!me.tpPanel.hidden) me.tpRender();
      })
      .catch(function () {
        // #tags stay words, which is what they are, and the teleporter says so.
        rooms = rooms || [];
        if (!me.tpPanel.hidden) me.tpRender(true);
      });
  };

  /* Once the rooms arrive, the messages already on the screen get their #tags. */
  Radio.prototype.rerender = function () {
    var ps = this.log.querySelectorAll('.cb-text');
    for (var i = 0; i < ps.length; i++) {
      if (typeof ps[i].cbRaw !== 'string') continue;
      ps[i].textContent = '';
      streetLinks(ps[i], ps[i].cbRaw);
    }
  };

  // The # being typed at the caret, if any: where it starts and what follows.
  Radio.prototype.token = function () {
    var v = this.say.value, c = this.say.selectionStart;
    if (c == null || c !== this.say.selectionEnd) return null;
    var m = v.slice(0, c).match(/(^|[\s(\[])#([a-z][a-z0-9-]*)$/i);
    if (!m) return null;
    return { start: c - m[2].length - 1, end: c, q: m[2].toLowerCase() };
  };

  Radio.prototype.complete = function () {
    var t = rooms && this.say.getRootNode().activeElement === this.say && this.token();
    if (!t || t.start === this.dismissed) { if (!t) this.dismissed = -1; this.close(); return; }
    var offer = roomsFor(t.q);
    if (!offer.length) { this.close(); return; }
    var keep = this.active >= 0 && this.offer[this.active] && offer.indexOf(this.offer[this.active]);
    this.offer = offer;
    this.pick.textContent = '';
    for (var i = 0; i < offer.length; i++) {
      var li = el('li', 'cb-opt');
      li.id = 'cb-pick-' + offer[i].tag;
      li.setAttribute('role', 'option');
      li.appendChild(el('span', 'cb-opt__name', offer[i].name));
      li.appendChild(el('span', 'cb-opt__tag', '#' + offer[i].tag));
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

  // Where this page is, as the room list writes it, so the list can say so.
  function herePath() {
    var p = location.pathname.replace(/\/index(?:\.html)?$/, '/');
    return p === '/' ? '/' : p.replace(/\.html$/, '') + '.html';
  }

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
    if (!rooms || failed || !rooms.length) {
      this.tpOffer = [];
      none.textContent = rooms && !failed ? 'No rooms to go to.' : (failed ? 'The list of rooms cannot be reached just now.' : 'Finding the rooms\u2026');
      none.hidden = false;
      list.hidden = true;
      markIn(list, this.tpFind, -1);
      return;
    }
    var q = this.tpFind.value.toLowerCase().trim().replace(/^#/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    var offer = this.tpOffer = roomsFor(q, Infinity), here = herePath();
    for (var i = 0; i < offer.length; i++) {
      var li = el('li', 'cb-opt');
      li.id = 'cb-tp-' + offer[i].tag;
      li.setAttribute('role', 'option');
      li.appendChild(el('span', 'cb-opt__name', offer[i].name));
      li.appendChild(el('span', 'cb-opt__tag', offer[i].path === here ? 'you are here' : '#' + offer[i].tag));
      li.addEventListener('mousedown', function (e) { e.preventDefault(); });
      (function (room, me) { li.addEventListener('click', function () { me.go(room); }); })(offer[i], this);
      list.appendChild(li);
    }
    none.textContent = 'No room by that name.';
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

  // Going is ordinary navigation: nothing is sent, and the panel is closed so a
  // page restored from the back-forward cache does not come back with it open.
  Radio.prototype.go = function (room) {
    if (!room) return;
    this.setTeleport(false);
    location.href = room.path;
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

  // Put the chosen room's #tag in place of what was typed after the #.
  Radio.prototype.choose = function (n) {
    var t = this.token(), room = this.offer[n];
    if (!t || !room) { this.close(); return; }
    var v = this.say.value, after = v.slice(t.end);
    var put = '#' + room.tag + (after.charAt(0) === ' ' ? '' : ' ');
    var next = v.slice(0, t.start) + put + after;
    if (next.length > this.say.maxLength) { this.tell('That room would not fit in the message.'); this.close(); return; }
    this.say.value = next;
    var c = t.start + put.length;
    this.say.setSelectionRange(c, c);
    this.close();
    this.say.focus();
  };

  Radio.prototype.transmit = function () {
    var me = this, text = this.say.value.trim();
    this.close();
    if (!text) { this.tell('Type something first.'); return; }
    this.tell('Transmitting…');
    call('/cb/transmit', { body: { text: text } }, this.state.pass).then(function (r) {
      if (r.status === 401) return me.lost();
      if (r.status === 200) { me.say.value = ''; me.tell(''); me.show(r.body.messages || [], true); return; }
      if (r.status === 429) { me.tell('Easy on the mic: too many in a minute. Try again shortly.'); return; }
      me.tell(why(r, 'That did not go out. Try again.'));
    }).catch(function () { me.tell('No signal. That did not go out.'); });
  };

  Radio.prototype.moderate = function (what) {
    var me = this;
    call('/cb/moderate', { body: what }, this.state.pass).then(function (r) {
      if (r.status === 200) { me.show(r.body.messages || []); me.tell(what.clear ? 'Channel cleared.' : 'Taken off the air.'); }
      else me.tell(why(r, 'That did not work.'));
    }).catch(function () { me.tell('No signal.'); });
  };

  Radio.prototype.tell = function (s) { this.said.textContent = s; };

  /* Off the air for a moment. Said on the readout rather than left looking
     like a quiet channel, because "nobody has said anything" and "we could not
     hear the channel" are different sentences, and only one of them is true. */
  Radio.prototype.signal = function (ok) {
    this.quiet.textContent = ok ? 'Nobody has said anything today.' : 'No signal: the channel cannot be reached just now. Still trying.';
    if (!ok) { this.quiet.hidden = false; }
    else if (this.log.children.length) { this.quiet.hidden = true; }
  };

  /* The password changed, so the pass no longer opens the channel. Said once,
     on the radio, and then the radio goes. */
  Radio.prototype.lost = function () {
    forget();
    clearTimeout(this.timer);
    this.set.hidden = false;
    this.set.textContent = '';
    var p = el('p', 'cb-who');
    p.appendChild(document.createTextNode('The password has changed, so you are off the channel. '));
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
  Radio.prototype.place = function () {
    var s = this.state, b = this.box;
    var maxX = Math.max(EDGE, window.innerWidth - b.offsetWidth - EDGE);
    var maxY = Math.max(EDGE, window.innerHeight - b.offsetHeight - EDGE);
    var x = Math.min(Math.max(EDGE, s.x == null ? 16 : s.x), maxX);
    var y = Math.min(Math.max(EDGE, s.y == null ? 16 : s.y), maxY);
    b.style.right = x + 'px';
    b.style.bottom = y + 'px';
    return { x: x, y: y };
  };

  Radio.prototype.keyMove = function (e) {
    var s = this.state, p = this.place(), k = e.key;
    if (k === 'ArrowLeft') s.x = p.x + STEP;
    else if (k === 'ArrowRight') s.x = p.x - STEP;
    else if (k === 'ArrowUp') s.y = p.y + STEP;
    else if (k === 'ArrowDown') s.y = p.y - STEP;
    else if (k === 'Home') { s.x = null; s.y = null; }
    else return;
    e.preventDefault();
    var q = this.place();
    if (s.x != null) s.x = q.x;
    if (s.y != null) s.y = q.y;
    save(s);
  };

  Radio.prototype.dragging = function () {
    var me = this, bar = this.bar, start = null;
    bar.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || (e.target.closest('button') && e.target !== me.moveBtn)) return;
      var p = me.place();
      start = { px: e.clientX, py: e.clientY, x: p.x, y: p.y, id: e.pointerId };
      bar.setPointerCapture(e.pointerId);
      me.box.classList.add('cb-radio--held');
      e.preventDefault();
    });
    bar.addEventListener('pointermove', function (e) {
      if (!start || e.pointerId !== start.id) return;
      me.state.x = start.x - (e.clientX - start.px);
      me.state.y = start.y - (e.clientY - start.py);
      me.place();
    });
    function drop(e) {
      if (!start || e.pointerId !== start.id) return;
      start = null;
      me.box.classList.remove('cb-radio--held');
      var q = me.place();
      me.state.x = q.x; me.state.y = q.y;
      save(me.state);
    }
    bar.addEventListener('pointerup', drop);
    bar.addEventListener('pointercancel', drop);
  };

  function tuneIn() {
    var s = load();
    if (!s || radio) return;
    // Never inside a frame: the Hermitage's laptop shows this site inside
    // itself, and a radio inside that screen would be a second radio.
    try { if (window.top !== window.self) return; } catch (e) { return; }
    if (document.body.getAttribute('data-cb') === 'off') return;
    radio = new Radio(s);
  }

  function signOff() {
    forget();
    if (radio) { clearTimeout(radio.timer); radio.host.remove(); radio = null; }
    counter();
  }

  /* ── The counter at the Community Center ──────────────────────────────── */

  function counter() {
    var form = document.getElementById('cb-signon');
    var on = document.getElementById('cb-on');
    if (!form || !on) return;
    var s = load();
    form.hidden = !!s;
    on.hidden = !s;
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
        if (r.status === 200) {
          form.elements.password.value = '';
          said.textContent = '';
          save({ handle: r.body.handle, pass: r.body.pass, base: !!r.body.base, folded: false, aloud: true });
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
    counter();
  }

  function start() {
    wireCounter();
    tuneIn();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();

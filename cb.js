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
     · NO ALERTS. No chime, no notification, no badge, no unread count, nothing
       in the page title, and nothing is saved up for when you come back. The
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
     · @34:12 IS A PLACE IN THE FILM, and pressing it moves the film playing
       on YOUR page there, without pressing play. Add my spot writes your own
       place, film and room into the box and sends nothing. A stamp that
       names a film or a room moves nothing anywhere else. See stamps and
       jump.
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
  var BEAT = 30000;       // ms a host's beacon goes unsent at most, while nothing changes
  var FILM_MAX = 120;     // characters of a film's title on a beacon, as the server takes it
  var DRIFT = 3;          // seconds a follower may drift from the host before it is moved
  var SETTLE = 3000;      // ms a follower's player is given to obey before it is judged

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
    stampsIn(text);
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
      if (m.index > at) hashRooms(parent, text.slice(at, m.index), at);
      var a = el('a', null, said);
      a.href = path;
      parent.appendChild(a);
      at = m.index + said.length;
      STREET.lastIndex = at;
    }
    if (at < text.length) hashRooms(parent, text.slice(at), at);
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
      a.href = room.path + (spot ? '#spot=' + spot.secs + '&film=' + encodeURIComponent(spot.film) : '');
      var hash = el('span', null, '#');
      hash.setAttribute('aria-hidden', 'true');
      a.appendChild(hash);
      a.appendChild(document.createTextNode(room.name));
      if (spot) a.appendChild(el('span', 'sr', ', ready at ' + place(spot.secs)));
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
     day: "back at 7:30" stays words. */
  var STAMP = /@(?:(\d{1,2}):([0-5]\d)|(\d{1,3})):([0-5]\d)(?![\d:])/g;

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
      stampAt[m.index] = n ? { film: n[1], room: n[2] ? n[2].toLowerCase() : '' } : { film: '', room: '' };
      if (n && n[2]) tagAt[end + n[0].lastIndexOf('#')] = { secs: secsOf(m), film: n[1] };
    }
  }

  function secsOf(m) {
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
      if (m.index > at) parent.appendChild(document.createTextNode(text.slice(at, m.index)));
      var b = el('button', 'cb-jump', m[0]);
      b.type = 'button';
      b.dataset.at = String(secs);
      if (what.film) b.dataset.film = what.film;
      if (what.room) b.dataset.room = what.room;
      b.setAttribute('aria-label', 'Jump to ' + place(secs) + (what.film ? ' in ' + what.film : ''));
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
    set.appendChild(band);

    var lcd = el('div', 'cb-lcd');
    // Which channel this is, at every size, because small shows only the readout.
    this.bandNow = el('p', 'cb-band-now');
    lcd.appendChild(this.bandNow);
    var log = this.log = el('ol', 'cb-log');
    log.setAttribute('role', 'log');
    lcd.appendChild(log);
    // Nothing is claimed about the channel until it has been heard.
    this.quiet = el('p', 'cb-quiet', 'Tuning in\u2026');
    lcd.appendChild(this.quiet);
    /* HOSTS: every beacon on the street, this room's with a Catch up button and
       the others with a link to their room that carries the host's spot. Not a
       live region: it is redrawn on every listen, and something read out every
       four seconds is the alert this radio refuses. Nothing is counted. */
    var beacons = this.beaconList = el('ul', 'cb-beacons');
    beacons.setAttribute('aria-label', 'Hosts');
    beacons.hidden = true;
    lcd.appendChild(beacons);
    this.beacons = [];
    this.skew = 0;
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
    /* ADD MY SPOT, shown only while a film on this page has been started. It
       reads where your player is and writes "@34:12" into the box, and that
       is all: nothing goes out until you transmit, the same as anything else
       you type. */
    var spot = this.spotBtn = el('button', 'cb-btn cb-spot', 'Add my spot');
    spot.type = 'button';
    spot.hidden = true;
    tools.appendChild(spot);
    /* HOST THIS FILM, shown with Add my spot. See setHosting. Never
       remembered: a new page starts with nobody hosting. */
    var hostBtn = this.hostBtn = el('button', 'cb-btn cb-hosting', 'Host this film');
    hostBtn.type = 'button';
    hostBtn.hidden = true;
    hostBtn.setAttribute('aria-pressed', 'false');
    tools.appendChild(hostBtn);
    this.hosting = null;
    var callBtn = this.callBtn = el('button', 'cb-btn cb-call-btn', 'Join this room\u2019s call');
    callBtn.type = 'button';
    callBtn.hidden = true;
    callBtn.setAttribute('aria-pressed', 'false');
    tools.appendChild(callBtn);
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
    spot.addEventListener('click', function () { me.addSpot(); });
    hostBtn.addEventListener('click', function () { me.setHosting(!me.hosting); });
    callBtn.addEventListener('click', function () { me.setCall(!window.loveCall.isOpen()); });
    bw.addEventListener('click', function () { me.setBand('world'); });
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
      if (b) me.jump(+b.dataset.at, b.dataset.film || '', b.dataset.room || '');
    });
    speak.addEventListener('click', function () { me.setSpeak(!me.state.speak); });
    form.addEventListener('submit', function (e) { e.preventDefault(); me.transmit(); });
    say.addEventListener('input', function () { me.complete(); });
    say.addEventListener('click', function () { me.complete(); });
    say.addEventListener('keyup', function (e) {
      if (/^(ArrowLeft|ArrowRight|Home|End)$/.test(e.key)) me.complete();
    });
    say.addEventListener('keydown', function (e) { me.pickKey(e); });
    say.addEventListener('blur', function () { me.close(); });
    this.mover = new window.loveCall.Mover(box, bar, move, state, 'right', 'cb-radio--held', function () { save(me.state); });

    document.addEventListener('visibilitychange', function () { me.tune(); });
    window.addEventListener('resize', function () { me.place(); });
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
    this.bandShown();
    this.setAloud(this.aloud(), true);
    this.setSpeak(!!this.state.speak, true);
    this.setSmall(!!state.small, true);
    this.setFolded(!!state.folded, true);
    this.place();
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
         The ten already on the channel when you tune in are not read at you.
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

  Radio.prototype.hush = function () {
    this.air = [];
    this.onAir = false;
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

  Radio.prototype.speak = function (li) {
    if (!this.state.speak || this.state.folded) return;
    var words = li.querySelector('.cb-text').cloneNode(true);
    var drawn = words.querySelectorAll('[aria-hidden="true"]');
    for (var i = 0; i < drawn.length; i++) drawn[i].remove();
    (this.air = this.air || []).push(li.querySelector('.cb-handle').textContent + '. ' + words.textContent);
    if (!this.onAir) this.transmitNext();
  };

  // One message off the queue: key up, the words, let go, a breath, the next.
  Radio.prototype.transmitNext = function () {
    var me = this, text = this.air.shift(), voice = localVoice();
    if (!text || !voice || !this.state.speak || this.state.folded) { this.onAir = false; return; }
    this.onAir = true;
    if (!mayPlay()) {
      this.air = [];
      this.onAir = false;
      if (!this.askedToPlay) {
        this.askedToPlay = true;
        this.tell('Your browser will not let the radio speak on this page until you have pressed or typed something on it.');
      }
      return;
    }
    this.squelch(BURST, function () {
      if (!me.onAir) return;
      var u = new SpeechSynthesisUtterance(text), over = false;
      u.voice = voice;
      u.lang = voice.lang;
      function done(e) {
        if (over) return;
        over = true;
        clearTimeout(me.airTimer);
        if (!me.onAir) return;
        if (e && e.error === 'not-allowed') { me.air = []; me.onAir = false; return; }
        me.squelch(TAIL, function () {
          if (!me.onAir) return;
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
     its bottom right corner, so it shrinks towards wherever it was put. */
  Radio.prototype.setSmall = function (small, quiet) {
    this.state.small = small;
    this.box.classList.toggle('cb-radio--small', small);
    this.sizeBtn.setAttribute('aria-pressed', String(small));
    this.sizeBtn.textContent = 'Small';
    this.sizeBtn.setAttribute('aria-label', small ? 'Small: showing only the newest message' : 'Small: show only the newest message');
    if (small) { this.close(); this.tell(''); }
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
    if (folded) this.hush();
    // Folded sends nothing, so a beacon cannot say it has stopped: it goes
    // quiet, and every radio stops showing it within seventy-five seconds.
    if (folded && this.hosting) { this.hosting = null; this.hostShown(); }
    // Folded, the radio hears no beacons, so it cannot follow one either.
    if (folded && this.following) this.following = null;
    if (!quiet) save(this.state);
    this.place();
    this.tune();
  };

  /* Listening happens here and nowhere else, so this is the one function that
     decides whether the radio is making requests. */
  Radio.prototype.tune = function () {
    var on = !this.state.folded && document.visibilityState === 'visible';
    // Whatever was said while it was off is on the screen when it comes back,
    // and is not read out: nothing is saved up for when you come back.
    if (!on) this.heard = false;
    clearTimeout(this.timer);
    this.timer = null;
    if (on) this.listen();
  };

  Radio.prototype.listen = function () {
    var me = this;
    this.loadRooms();
    /* Tuned to a room, the first listen waits for the street's list, so that
       a page that is no room (the 404 answers any address) never sends its
       address to us as if it were one: it hears World instead. */
    if (this.state.band === 'room' && rooms === null) {
      this.roomsReady.then(function () {
        if (radio === me && !me.state.folded && document.visibilityState === 'visible') me.tune();
      });
      return;
    }
    var w = window.loveEmbed && window.loveEmbed.where ? window.loveEmbed.where() : null;
    this.spotBtn.hidden = !w;
    this.hostBtn.hidden = !w && !this.hosting;
    this.hostTick(w);
    var room = this.tunedRoom();
    call('/cb/channel' + (room ? '?room=' + room : ''), null, this.state.pass).then(function (r) {
      if (r.status === 401) return me.lost();
      // Retuned while this was on its way: it is the other channel's answer.
      if (r.status === 200 && (r.body.room || null) !== me.tunedRoom()) return;
      if (r.status === 200) {
        me.signal(true); me.show(r.body.messages || []); me.showBeacons(r.body.beacons, r.body.now);
        me.calls = !!r.body.calls;
        me.callShown();
        me.keepRoles(r.body.roles);
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
    var log = this.log;
    var atEnd = log.hidden || log.scrollHeight - log.scrollTop - log.clientHeight < 24;
    // The first hearing is what was already said; only what comes after is news.
    var news = this.heard;
    this.heard = true;
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
        /* Drawn on the message's own name-and-time line by cb.css, but kept
           AFTER the words in the markup: the log is a live region, and a new
           message is announced in markup order, so "Take off" first would be
           read in front of every message the base hears. */
        var off = el('button', 'cb-btn cb-take', 'Take off');
        off.type = 'button';
        off.setAttribute('aria-label', 'Take ' + m.handle + '’s message at ' + clock(m.t) + ' off the air');
        (function (id) { off.addEventListener('click', function () { me.moderate({ remove: id }); }); })(m.id);
        li.appendChild(off);
      }
      this.log.appendChild(li);
      if (news && !(mine && m.handle === this.state.handle)) this.speak(li);
    }
    this.quiet.textContent = this.quietText();
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
    this.roomsReady = fetch('/cb-rooms.json', { credentials: 'omit', headers: { 'accept': 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (d) { takeRooms(d.rooms); me.rerender(); me.complete(); me.bandShown(); }
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
    var room = this.tunedRoom(), b = { text: text };
    if (room) b.room = room;
    call('/cb/transmit', { body: b }, this.state.pass).then(function (r) {
      if (r.status === 401) return me.lost();
      if (r.status === 200) {
        me.say.value = '';
        me.tell('');
        if (room === me.tunedRoom()) me.show(r.body.messages || [], true);
        return;
      }
      if (r.status === 429) { me.tell('Easy on the mic: too many in a minute. Try again shortly.'); return; }
      me.tell(why(r, 'That did not go out. Try again.'));
    }).catch(function () { me.tell('No signal. That did not go out.'); });
  };

  Radio.prototype.moderate = function (what) {
    var me = this;
    var room = this.tunedRoom();
    if (room) what.room = room;
    call('/cb/moderate', { body: what }, this.state.pass).then(function (r) {
      if (r.status === 200 && room === me.tunedRoom()) { me.show(r.body.messages || []); me.tell(what.clear ? 'Channel cleared.' : 'Taken off the air.'); }
      else me.tell(why(r, 'That did not work.'));
    }).catch(function () { me.tell('No signal.'); });
  };

  /* The answer is on the radio, under the log, at every size: in small it is
     the one line shown besides the newest message, because a jump that did
     nothing and said nothing would look broken (the Playhouse's lesson). */
  Radio.prototype.jump = function (secs, film, room) {
    var e = window.loveEmbed, w = e && e.where ? e.where() : null;
    var at = place(secs), called = film ? '\u201c' + film + '\u201d' : 'the film';
    if (room && hereTag() !== room) {
      var there = byTag[room] ? byTag[room].name : '#' + room;
      this.tell(at + ' is in ' + called + ' at ' + there + ', and you are in another room, so nothing moved. The room\u2019s name in that message takes you there.');
      return;
    }
    if (!w) {
      this.tell('No film has been started on this page, so there is nothing to move. Press play on ' + called + ' first, then ' + at + ' will take it there.');
      return;
    }
    if (film && !sameFilm(film, w.film)) {
      this.tell(at + ' is in ' + called + ', and the film playing here is \u201c' + w.film + '\u201d, so nothing moved. Press play on ' + called + ' first.');
      return;
    }
    var r = e.seek(secs);
    if (r.past) {
      this.tell(at + ' is past the end of \u201c' + r.film + '\u201d, which runs ' + place(r.duration) + '. It may have been said about a different film.');
    } else {
      this.tell('Moved \u201c' + r.film + '\u201d to ' + at + '. It plays or stays paused, as it was.');
    }
  };

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
    var p = herePath();
    for (var i = 0; rooms && i < rooms.length; i++) if (rooms[i].path === p) return rooms[i];
    return null;
  }

  /* Writes "@34:12 in “the film” at #the-room" where the caret is,
     cutting the title short with an ellipsis if the whole message would
     otherwise run past what the box takes. A page that is not on the street's
     list, like the 404, gets no #tag. */
  Radio.prototype.addSpot = function () {
    var w = window.loveEmbed && window.loveEmbed.where && window.loveEmbed.where();
    if (!w) { this.spotBtn.hidden = true; this.tell('No film has been started on this page.'); return; }
    var v = this.say.value;
    var c = this.say.selectionStart == null ? v.length : this.say.selectionStart;
    var before = v.slice(0, c), after = v.slice(c);
    var here = hereRoom();
    var lead = (before && !/\s$/.test(before)) ? ' ' : '';
    var trail = (!after || !/^\s/.test(after)) ? ' ' : '';
    var head = '@' + place(w.time) + ' in \u201c', tail = '\u201d' + (here ? ' at #' + here.tag : '');
    var film = w.film.replace(/[\u201c\u201d]/g, '"').replace(/\s+/g, ' ').trim();
    var space = this.say.maxLength - before.length - after.length - lead.length - trail.length - head.length - tail.length;
    if (space < 8) { this.tell('Your message is too full for your spot. Make some room and try again.'); return; }
    if (film.length > space) film = film.slice(0, space - 1).trim() + '\u2026';
    var put = lead + head + film + tail + trail;
    this.say.value = before + put + after;
    c = before.length + put.length;
    this.say.focus();
    this.say.setSelectionRange(c, c);
    this.tell('Your spot in \u201c' + film + '\u201d is in your message. Nothing goes out until you transmit.');
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
    if (this.state.band !== 'room') return null;
    if (rooms && rooms.length && !hereRoom()) return null;
    var tag = hereTag();
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tag) ? tag : null;
  };

  Radio.prototype.setBand = function (band) {
    var was = this.tunedRoom();
    this.state.band = band === 'room' ? 'room' : 'world';
    save(this.state);
    this.bandShown();
    if (this.tunedRoom() === was) return;
    this.log.textContent = '';
    this.seen = {};
    this.heard = false;
    this.log.hidden = true;
    this.quiet.textContent = 'Tuning in\u2026';
    this.quiet.hidden = false;
    this.tell('');
    this.tune();
  };

  Radio.prototype.bandShown = function () {
    var room = this.tunedRoom(), here = hereRoom();
    var name = here ? here.name : 'this room';
    this.roomBtn.hidden = !!(rooms && rooms.length && !here);
    this.worldBtn.setAttribute('aria-pressed', String(!room));
    this.roomBtn.setAttribute('aria-pressed', String(!!room));
    this.roomBtn.textContent = 'This room';
    this.roomBtn.setAttribute('aria-label', 'This room: ' + name);
    this.bandNow.textContent = room ? 'Tuned to ' + name : 'Tuned to World';
    this.log.setAttribute('aria-label', (room ? name + '\u2019s channel' : 'The World channel') + ', latest ten messages');
  };

  Radio.prototype.quietText = function () {
    return this.tunedRoom() ? 'Nobody has said anything in this room today.' : 'Nobody has said anything today.';
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
    var on = !!(window.loveCall && window.loveCall.isOpen());
    this.callBtn.hidden = !(on || (this.calls && hereRoom()));
    this.callBtn.setAttribute('aria-pressed', String(on));
  };

  Radio.prototype.setCall = function (on) {
    var me = this;
    if (!on) { window.loveCall.leave(); return; }
    var here = hereRoom();
    if (!here) { this.tell('This page is not a room on the street, so it has no call.'); return; }
    this.tell('Opening the call\u2026');
    window.loveCall.open(here, {
      // The window the keyboard was in has gone, so it comes back to the
      // button that opened it rather than falling to the top of the page.
      left: function () {
        me.callShown();
        me.tell('You have left the call.');
        if (!me.state.folded) me.callBtn.focus();
      }
    }).then(function (r) {
      if (r.status === 401) return me.lost();
      me.callShown();
      me.tell(r.said);
    });
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
    var e = window.loveEmbed, w = e && e.where ? e.where() : null;
    if (!on) {
      var was = this.hosting;
      this.hosting = null;
      this.hostShown();
      if (was) this.sendBeacon({ room: was.room, off: true }, null, why2 || 'You have stopped hosting.');
      return;
    }
    if (!w) { this.tell('Start a film on this page first, then you can host it.'); return; }
    if (rooms && rooms.length && !hereRoom()) { this.tell('This page is not a room on the street, so it cannot be hosted.'); return; }
    this.hosting = { room: hereTag(), sent: null, busy: false };
    this.hostShown();
    this.tell('You are hosting \u201c' + w.film + '\u201d. Everybody on the channel can see where you are in it, and in which room. Putting this tab behind another pauses it; folding the radio away or leaving the page stops it.');
    this.hostTick(w);
  };

  Radio.prototype.hostShown = function () {
    this.hostBtn.setAttribute('aria-pressed', String(!!this.hosting));
    if (this.hosting) this.hostBtn.hidden = false;
  };

  Radio.prototype.hostTick = function (w) {
    var h = this.hosting;
    if (!h || h.busy) return;
    if (!w) { this.setHosting(false, 'Your film is off, so you have stopped hosting.'); return; }
    var now = Date.now(), last = h.sent;
    var guess = last ? last.at + (last.playing ? (now - last.when) / 1000 : 0) : 0;
    if (last && last.film === w.film && last.playing === w.playing &&
        Math.abs(w.time - guess) < 3 && now - last.when < BEAT) return;
    var film = Array.from(w.film);
    film = film.length > FILM_MAX ? film.slice(0, FILM_MAX - 1).join('') + '\u2026' : w.film;
    this.sendBeacon({ room: h.room, film: film, at: Math.max(0, w.time), playing: !!w.playing },
                    { film: w.film, at: w.time, playing: !!w.playing, when: now });
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
        if (done) me.tell(done);
        return;
      }
      if (b.off) { me.tell(why(r, 'That did not reach the channel. Your beacon goes quiet by itself within a minute or two.')); return; }
      // Somebody else has this room, or the beacon was refused: stop. Anything
      // else, a busy channel or too many in a minute, is tried again next listen.
      if (r.status === 409 || r.status === 400) {
        if (me.hosting === h) { me.hosting = null; me.hostShown(); }
        me.tell(why(r, 'Your beacon was refused, so you are not hosting.'));
      }
    }).catch(function () { if (h && !b.off) h.busy = false; });
  };

  Radio.prototype.showBeacons = function (list, now) {
    this.beacons = Array.isArray(list) ? list : [];
    if (typeof now === 'number') this.skew = now - Date.now();
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
      this.tell(said || 'You have stopped following.');
      return;
    }
    var b = this.beaconIn(room);
    if (!b) { this.tell('That host has stopped.'); return; }
    this.following = { room: room, fresh: true, hostWas: null, sent: 0, waiting: false };
    this.tell('Following ' + b.handle + ': your film keeps pace with theirs, at your own volume. Pause, or press Follow again, to go your own way.');
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
    var e = window.loveEmbed, w = e && e.where ? e.where() : null;
    if (!w || !sameFilm(b.film, w.film)) {
      if (!f.waiting) this.tell('Following ' + b.handle + ': press play on \u201c' + b.film + '\u201d and it will keep pace from there.');
      f.waiting = true;
      f.fresh = true;
      return;
    }
    if (f.waiting) { f.waiting = false; this.tell('Following ' + b.handle + ' in \u201c' + b.film + '\u201d.'); }
    var now = Date.now(), settling = now - f.sent < SETTLE;
    var at = this.placeOf(b), turned = f.fresh || f.hostWas !== b.playing;
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
    if (w.playing !== b.playing) {
      this.setFollow(false, null, w.playing
        ? 'You played on while ' + b.handle + ' is paused, so you have stopped following. Press Follow to pick up again.'
        : 'You paused, so you have stopped following. Press Follow to pick up again.');
      return;
    }
    if (Math.abs(w.time - at) > DRIFT) { e.seek(at); f.sent = now; }
  };

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
      return [b.room, b.room === tag ? (b.handle === me.state.handle ? 'mine' : 'here') : 'there', b.handle, b.base, b.film].join('|');
    });
    var kids = ul.children, same = kids.length === keys.length;
    for (i = 0; same && i < kids.length; i++) same = kids[i].dataset.key === keys[i];
    if (!same) {
      ul.textContent = '';
      for (i = 0; i < list.length; i++) ul.appendChild(this.beaconRow(list[i], keys[i]));
    }
    for (i = 0; i < list.length; i++) {
      var b = list[i], li = ul.children[i], at = place(this.placeOf(b));
      li.querySelector('.cb-beacon-at').textContent = at + (b.playing ? ', playing' : ', paused');
      var fo = li.querySelector('.cb-follow');
      if (fo) fo.setAttribute('aria-pressed', String(!!(this.following && this.following.room === b.room)));
      var a = li.querySelector('a.cb-room');
      if (a) a.href = byTag[b.room].path + '#spot=' + Math.floor(this.placeOf(b)) + '&film=' + encodeURIComponent(b.film);
    }
    ul.hidden = list.length === 0;
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
      c.setAttribute('aria-label', 'Catch up with ' + b.handle + ' in ' + b.film);
      li.appendChild(c);
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
      if (b.room === room) { this.jump(Math.floor(this.placeOf(b)), b.film, b.room); return; }
    }
    this.tell('That host has stopped.');
  };

  Radio.prototype.tell = function (s) { this.said.textContent = s; };

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
  Radio.prototype.place = function () { return this.mover.place(); };

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
    if (!s || radio) return;
    if (!window.loveCall) { withCall(tuneIn); return; }
    // Never inside a frame: the Hermitage's laptop shows this site inside
    // itself, and a radio inside that screen would be a second radio.
    try { if (window.top !== window.self) return; } catch (e) { return; }
    if (document.body.getAttribute('data-cb') === 'off') return;
    // A Town Hall private room: the radio is the base's there (love.js does not
    // load this file for anybody else, and the server refuses them anyway).
    if (!mayHere(s)) return;
    radio = new Radio(s);
  }

  /* The roles a pass carries are the server's, read off CB_MODS on every
     request, and every listen says what they are now. They are kept beside the
     pass only so love.js can keep the radio out of a Town Hall room this pass
     cannot use; the lock is on the server whatever is kept here. */
  Radio.prototype.keepRoles = function (roles) {
    if (!Array.isArray(roles)) return;
    var now = roles.slice().sort().join(',');
    if (now === (this.state.roles || []).slice().sort().join(',')) return;
    this.state.roles = roles.slice();
    save(this.state);
  };

  // May this pass have the radio on a Town Hall page that names a role?
  function mayHere(s) {
    var b = document.body;
    if (b.getAttribute('data-cb') !== 'mods') return true;
    var need = b.getAttribute('data-cb-role') || 'moderator';
    var roles = (s && s.roles) || [];
    return !!(s && s.base) && (roles.indexOf('administrator') >= 0 || roles.indexOf(need) >= 0);
  }

  function signOff() {
    forget();
    if (radio) { clearTimeout(radio.timer); radio.hush(); radio.host.remove(); radio = null; }
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
          save({ handle: r.body.handle, pass: r.body.pass, base: !!r.body.base, roles: r.body.roles || [], folded: false, aloud: true });
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

  function arrive() {
    var m = location.hash.match(/^#spot=(\d{1,6})(?:&film=([^&]*))?$/);
    if (!m || !radio) return;
    var secs = +m[1], film = '';
    try { film = decodeURIComponent(m[2] || ''); } catch (e) { return; }
    var want = norm(film), cut = want.slice(-1) === '\u2026';
    if (cut) want = want.slice(0, -1).trim();
    var at = place(secs), called = film ? '\u201c' + film + '\u201d' : 'the film';
    var btns = document.querySelectorAll('button.facade'), hit = null;
    for (var i = 0; want && !hit && i < btns.length; i++) {
      var b = btns[i], src = b.dataset.embedSrc || '';
      var single = b.dataset.embedId || /^https:\/\/www\.youtube-nocookie\.com\/embed\/[A-Za-z0-9_-]{11}(\?|$)/.test(src);
      if (!single || /[?&]list=/.test(src)) continue;
      var t = norm(b.dataset.embedTitle);
      if (t.indexOf(want) === 0 && (cut || t.length === want.length || /^[\s,:(\-\u2013\u2014|]/.test(t.charAt(want.length)))) hit = b;
    }
    if (!hit) {
      radio.tell(called + ' has no play button of its own on this page, so it could not be set to start at ' + at + '. Press play on it, then press @' + at + ' on the channel.');
      return;
    }
    hit.dataset.embedStart = String(secs);
    for (var d = hit.closest('details'); d; d = d.parentElement && d.parentElement.closest('details')) d.open = true;
    hit.focus();
    radio.tell('You came for ' + at + ' in ' + called + '. Its play button has the keyboard: press it and it starts there.');
  }

  function start() {
    wireCounter();
    tuneIn();
    arrive();
    // Following a spot to the room you are already in changes only the hash.
    window.addEventListener('hashchange', arrive);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();

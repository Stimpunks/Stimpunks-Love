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
  var SETTLE = 3000;      // ms a follower's player is given to obey before it is judged

  function load() {
    try { var v = JSON.parse(localStorage.getItem(KEY) || 'null'); return v && v.pass ? v : null; }
    catch (e) { return null; }
  }
  function save(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* private window */ } }
  function forget() { try { localStorage.removeItem(KEY); } catch (e) { /* nothing to forget */ } }

  /* Redraw a picture on a canvas: at most 1600 pixels on its long side, the
     right way up, on white, as a JPEG. Nothing the camera wrote into the file
     survives a redraw, which is the point; the server refuses a file that
     still carries it. Smaller and softer again if it is still too big. */
  var PIC_SIDE = 1600, PIC_MAX = 1500000;
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
        return new Promise(function (ok, no) { c.toBlob(function (b) { b ? ok(b) : no(); }, 'image/jpeg', q); });
      }
      return draw(PIC_SIDE, 0.86).then(function (b) {
        return b.size <= PIC_MAX ? b : draw(1100, 0.78).then(function (b2) { if (b2.size > PIC_MAX) throw new Error('big'); return b2; });
      });
    });
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
     Paragraphs and line breaks; > a quote; - or * or 1. a list; ``` a block of
     code; **bold**, *italic* or _italic_, ~~struck~~ and `code` inline.
     NOT links: a [text](address) stays as it was typed, because a link's
     words are the address it goes to (streetLinks), so nobody can dress one
     address up as another.
     TWO THINGS ARE KEPT WHOLE and never parsed for emphasis: an address,
     on the street or off it (underscores in a path are not italics) and a place in a film with what it
     names (@1:25 in “the film” at #the-room), because a title with an asterisk
     in it would otherwise break the button that jumps to it. */
  var MD_ITEM = /^\s*([-*•]|\d{1,3}[.)])\s+(.*)$/;
  var MD_QUOTE = /^\s*>\s?(.*)$/;
  var MD_FENCE = /^\s*```/;
  var MD_EMPH = '\\*\\*(?=\\S)([^*\\n]*?\\S)\\*\\*|~~(?=\\S)([^~\\n]*?\\S)~~|(^|[^\\w*])\\*(?=\\S)([^*\\n]*?\\S)\\*(?![\\w*])|(^|[^\\w])_(?=\\S)([^_\\n]*?\\S)_(?!\\w)';

  function md(box, text) {
    var lines = String(text || '').split('\n'), i = 0, para = null, q, it;
    while (i < lines.length) {
      var line = lines[i];
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
    var out = awayAt(text).map(function (w) { return [w.at, w.end]; });
    var m, re = new RegExp(STREET.source, 'gi'), st = new RegExp(STAMP.source, 'g');
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
      if (s > at) streetLinks(parent, text.slice(at, s));
      var tag = m[1] != null ? 'strong' : m[2] != null ? 's' : 'em';
      var w = el(tag);
      emphasis(w, m[1] != null ? m[1] : m[2] != null ? m[2] : m[4] != null ? m[4] : m[6]);
      parent.appendChild(w);
      at = e;
    }
    if (at < text.length) streetLinks(parent, text.slice(at));
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
     itself says whether this radio is on as one. It only decides the mark on
     your own "On the channel as" line; the mark on a message is the server's. */
  function claimedPass(pass) { return /^cb2\.acct\./.test(pass || ''); }

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
    // Let people find me lived for an afternoon (2026-10-07) and Who's online
    // replaced it; a browser that remembered it forgets it here.
    if ('findable' in state) { delete state.findable; save(state); }

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

    /* THE SIZE, three of them, Ryan's ask, 2026-09-29: Small is the bar and the
       newest message and still listens, Normal is the radio as it was, and
       Large is wide and tall, for long messages and pictures. One button on the
       bar opens them, because the bar is full and a fourth button wraps it. */
    var szp = this.sizePanel = el('div', 'cb-size-panel');
    szp.id = 'cb-size-panel';
    szp.hidden = true;
    szp.setAttribute('role', 'group');
    szp.setAttribute('aria-label', 'Radio size');
    this.sizeChoices = {};
    ['small', 'normal', 'large'].forEach(function (k) {
      var b = el('button', 'cb-btn cb-size-choice', k.charAt(0).toUpperCase() + k.slice(1));
      b.type = 'button';
      b.addEventListener('click', function () { me.setSize(k); me.setSizePanel(false); me.sizeBtn.focus(); });
      me.sizeChoices[k] = b;
      szp.appendChild(b);
    });
    szp.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); me.setSizePanel(false); me.sizeBtn.focus(); }
    });
    box.appendChild(szp);

    // Everything below the bar is the set, and folding it switches it off.
    var set = this.set = el('div', 'cb-set');
    set.id = 'cb-set';

    var who = el('p', 'cb-who');
    who.appendChild(document.createTextNode('On the channel as '));
    who.appendChild(el('b', null, state.handle));
    if (state.base) who.appendChild(el('span', 'cb-tag', 'BASE'));
    this.whoTag = who.appendChild(el('span', 'cb-tag cb-tag--claimed', 'CLAIMED'));
    this.whoTag.hidden = !claimedPass(state.pass);
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
    /* WHO'S ONLINE, beside World and This room. Ryan, 2026-10-07: "Folks are
       wanting to know who's around and are having a hard time connecting right
       now." Everybody seen in a room, with the rooms they are in, for anybody
       signed on. It reverses the rule that a radio not seen is told nothing,
       and the CB's refusal of a list of who is on; both were Ryan's calls, and
       so is this. It is not a channel, so it sits beside the group rather than
       in it. Names in alphabetical order, CLAIMED and BASE as on the channel,
       no number, and not a live region: it is redrawn on each listen while it
       is open, and only then, because listen() is the only thing that asks. */
    var bandRow = el('div', 'cb-band-row');
    bandRow.appendChild(band);
    var ob = this.onlineBtn = el('button', 'cb-btn cb-online-btn', 'Who\u2019s online');
    ob.type = 'button';
    ob.setAttribute('aria-expanded', 'false');
    ob.setAttribute('aria-controls', 'cb-online');
    bandRow.appendChild(ob);
    set.appendChild(bandRow);
    var online = this.online = el('div', 'cb-online');
    online.id = 'cb-online';
    online.hidden = true;
    online.appendChild(el('p', 'cb-online-about', 'Everybody who has switched on Be seen here, and the room they are in. A room\u2019s name takes you there.'));
    this.onlineList = el('ul', 'cb-online-list');
    this.onlineList.setAttribute('aria-label', 'Who\u2019s online');
    online.appendChild(this.onlineList);
    this.onlineNone = el('p', 'cb-seen-now');
    online.appendChild(this.onlineNone);
    this.onlineMe = el('p', 'cb-seen-now');
    online.appendChild(this.onlineMe);
    set.appendChild(online);

    /* BE SEEN HERE, the Slake's switch in every room. Ryan, 2026-09-29. One
       switch both ways: seen, the radio is told who else is seen in this room
       and who is in its call; not seen, it asks and is told nothing. Handles
       only, alphabetical, with no number. Remembered in this browser once
       pressed (Ryan's call the same day), and it sends nothing while folded or
       in a tab behind another, because listen() is the only thing that asks.
       Not a live region: it is redrawn on every listen, and somebody arriving
       is not an alert. */
    var present = this.present = el('div', 'cb-present');
    var seenBtn = this.seenBtn = el('button', 'cb-btn cb-seen', 'Be seen here');
    seenBtn.type = 'button';
    seenBtn.setAttribute('aria-pressed', 'false');
    this.seenNow = el('p', 'cb-seen-now');
    this.inCallNow = el('p', 'cb-seen-now cb-in-call');
    this.inCallNow.hidden = true;
    present.appendChild(seenBtn);
    present.appendChild(this.seenNow);
    present.appendChild(this.inCallNow);
    present.hidden = true;
    set.appendChild(present);

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
    /* SOMEBODY'S PETS, Ryan's brief, 2026-09-30: press a handle on the channel
       to see their pets, if they have made them public. On the readout, under
       the message you pressed from, and nothing is fetched until the press. */
    var peek = this.peekBox = el('div', 'cb-peek');
    peek.id = 'cb-peek';
    peek.hidden = true;
    peek.setAttribute('role', 'group');
    lcd.appendChild(peek);
    peek.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); me.unpeek(); } });
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

    /* THE RADIO'S ANSWER, directly under the readout, where the log, the hosts'
       Catch up and Follow and every @time are: an answer somebody has to scroll
       past the message box to find is one they do not see (Ryan, 2026-09-29,
       after people thought Follow was broken). It used to sit under the box. */
    this.said = el('p', 'cb-said');
    this.said.setAttribute('role', 'status');
    set.appendChild(this.said);

    var form = this.form = el('form', 'cb-tx');
    var lab = el('label', 'cb-lab', 'Your message');
    lab.htmlFor = 'cb-say';
    /* A TEXTAREA, so a message can be a list, a paragraph or a block of code.
       It grows as you type, up to about eight lines, and can be dragged taller.
       Enter sends and Shift and Enter makes a new line, the way chat does. */
    var say = this.say = el('textarea', 'cb-say cb-say--msg');
    say.id = 'cb-say';
    say.rows = 2;
    say.maxLength = MESSAGE_MAX;
    say.setAttribute('aria-describedby', 'cb-say-hint');
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
    stickBtn.setAttribute('aria-label', 'Send a sticker of one of your pets');
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
    var readyLine = this.picReadyLine = el('p', 'cb-pic-line');
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
    // In the form, hidden: a file input outside the document is one some
    // browsers will not open a picker for.
    form.appendChild(picFile);
    var hint = el('p', 'cb-hint', 'Enter sends, Shift and Enter makes a new line. Markdown works: **bold**, *italic*, `code`, > quotes, - lists.');
    hint.id = 'cb-say-hint';
    form.appendChild(lab);
    form.appendChild(pick);
    form.appendChild(say);
    form.appendChild(hint);
    form.appendChild(row);
    form.appendChild(stickBox);
    form.appendChild(ready);
    set.appendChild(form);

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
    /* SCREEN A VIDEO, for the base, on a page with a screen. See screenVideo.
       A tray opened from the row like Profile, because it is a moderator's
       occasional tool and the radio is full enough. */
    var scrBtn = this.screenBtn = el('button', 'cb-btn cb-screen-btn', 'Screen a video');
    scrBtn.type = 'button';
    scrBtn.hidden = true;
    scrBtn.setAttribute('aria-expanded', 'false');
    scrBtn.setAttribute('aria-controls', 'cb-screen');
    tools.appendChild(scrBtn);
    this.screened = null;
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
    /* PROFILE. Ryan, 2026-09-30: one button in the tools row, beside Sign off,
       because the bar is full, and a tray that pops up from the radio with two
       things in it. YOUR USERNAME: claim it with a password of your own, so
       nobody else can sign on as it, and once claimed change the password or
       delete the account; there is no email, so claiming hands you a recovery
       code, once. YOUR PETS: the animals you adopted, which are the one
       thing the street keeps under a person, and Forget Me for them. Every
       destructive press asks once more. The tray is read when it is opened and
       never polled. */
    var petsBtn = this.petsBtn = el('button', 'cb-btn cb-pets-btn', 'Profile');
    petsBtn.type = 'button';
    petsBtn.setAttribute('aria-expanded', 'false');
    petsBtn.setAttribute('aria-controls', 'cb-pets');
    tools.appendChild(petsBtn);
    var off = el('button', 'cb-btn cb-off', 'Sign off');
    off.type = 'button';
    off.addEventListener('click', function () { signOff(); });
    tools.appendChild(off);
    set.appendChild(tools);

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
    set.appendChild(scr);

    var pets = this.petsPanel = el('div', 'cb-pets');
    pets.id = 'cb-pets';
    pets.hidden = true;
    pets.setAttribute('role', 'group');
    pets.setAttribute('aria-label', 'Your profile');

    // Your username.
    pets.appendChild(el('p', 'cb-pets__h', 'Your username'));
    var acct = this.acctBox = el('div', 'cb-acct');
    pets.appendChild(acct);
    this.acctSaid = el('p', 'cb-said cb-acct__said');
    this.acctSaid.setAttribute('role', 'status');
    pets.appendChild(this.acctSaid);

    // Your pets.
    pets.appendChild(el('p', 'cb-pets__h', 'Your pets'));
    this.petsState = el('p', 'cb-quiet', '');
    pets.appendChild(this.petsState);
    this.petsList = el('ul', 'cb-pets__list');
    this.petsList.hidden = true;
    pets.appendChild(this.petsList);
    // Whether people on the CB can see them, by pressing your handle.
    this.showBox = el('div', 'cb-pets__show');
    pets.appendChild(this.showBox);
    var where = this.petsWhere = el('p', 'cb-pets__where');
    pets.appendChild(where);
    var forgetBtn = this.forgetBtn = el('button', 'cb-btn cb-forget', 'Forget me');
    forgetBtn.type = 'button';
    pets.appendChild(forgetBtn);
    var sure = this.forgetSure = el('div', 'cb-forget-sure');
    sure.hidden = true;
    sure.appendChild(el('p', null, 'This deletes everything the street keeps under this handle, which is your pets and whether they are shown. They stay on the list of everybody adopted, with nothing connecting them to you. It cannot be undone.'));
    var yes = el('button', 'cb-btn cb-forget-yes', 'Yes, forget me');
    yes.type = 'button';
    var no = el('button', 'cb-btn', 'Keep my pets');
    no.type = 'button';
    sure.appendChild(yes); sure.appendChild(no);
    pets.appendChild(sure);
    set.appendChild(pets);
    petsBtn.addEventListener('click', function () { me.setPets(pets.hidden); });
    forgetBtn.addEventListener('click', function () { sure.hidden = false; forgetBtn.hidden = true; no.focus(); });
    no.addEventListener('click', function () { sure.hidden = true; forgetBtn.hidden = false; forgetBtn.focus(); });
    yes.addEventListener('click', function () { me.forgetMe(); });
    window.addEventListener('love-pets', function () { if (!pets.hidden) me.loadPets(); });

    var norms = el('p', 'cb-norms');
    var a = el('a', null, 'House norms at the Community Center');
    a.href = '/community-center.html#cb-norms';
    norms.appendChild(a);
    // Every part of the radio, named the way it names itself. guest.js links it too.
    norms.appendChild(document.createTextNode(' · '));
    var guide = el('a', null, 'The CB guide');
    guide.href = '/cb-guide.html';
    norms.appendChild(guide);
    set.appendChild(norms);

    box.appendChild(set);

    fold.addEventListener('click', function () { me.setFolded(!me.state.folded); });
    size.addEventListener('click', function () { me.setSizePanel(me.sizePanel.hidden); });
    tp.addEventListener('click', function () { me.setTeleport(tpp.hidden); });
    find.addEventListener('input', function () { me.tpRender(); });
    find.addEventListener('keydown', function (e) { me.tpKey(e); });
    aloud.addEventListener('click', function () { me.setAloud(!me.aloud()); });
    spot.addEventListener('click', function () { me.addSpot(); });
    hostBtn.addEventListener('click', function () { me.setHosting(!me.hosting); });
    scrBtn.addEventListener('click', function () { me.setScreenPanel(scr.hidden); });
    scr.addEventListener('submit', function (e) { e.preventDefault(); me.screenVideo(); });
    callBtn.addEventListener('click', function () { me.setCall(!window.loveCall.isOpen()); });
    bw.addEventListener('click', function () { me.setBand('world'); });
    seenBtn.addEventListener('click', function () { me.setSeen(!me.state.seen); });
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
      if (b) me.jump(+b.dataset.at, b.dataset.film || '', b.dataset.room || '');
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
      if (e.key === 'Enter' && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) { e.preventDefault(); me.transmit(); }
    });
    say.addEventListener('input', function () { me.grow(); });
    say.addEventListener('blur', function () { me.close(); });
    this.mover = new window.loveCall.Mover(box, bar, move, state, 'right', 'cb-radio--held', function () { save(me.state); }, function () {
      me.tell('Drag the bar to move the radio, or use the arrow keys while Move has the keyboard. Home puts it back in the corner.');
    });

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
    this.setSize(state.size || (state.small ? 'small' : 'normal'), true);
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
    // A pause between the Markdown's paragraphs, lines and list items, which
    // textContent would otherwise run together into one word.
    var parts = words.querySelectorAll('p, li, pre, br');
    for (i = 0; i < parts.length; i++) parts[i].after('. ');
    var pic = li.querySelector('.cb-picture-open');
    var told = pic ? ' ' + pic.getAttribute('aria-label').replace(/^Open the picture larger\. /, 'A picture: ') : '';
    var st = li.querySelector('.cb-sticker figcaption');
    if (st) told += ' A sticker: ' + st.textContent + '.';
    (this.air = this.air || []).push(li.querySelector('.cb-handle').textContent + '. ' + words.textContent + told);
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
  Radio.prototype.setSize = function (size, quiet) {
    if (size !== 'small' && size !== 'large') size = 'normal';
    var small = size === 'small';
    this.state.size = size;
    this.state.small = small;   // kept, so a radio saved before sizes still opens small
    this.box.classList.toggle('cb-radio--small', small);
    this.box.classList.toggle('cb-radio--large', size === 'large');
    this.sizeBtn.textContent = 'Size';
    this.sizeBtn.setAttribute('aria-label', 'Size: ' + size + (small ? ', showing only the newest message' : ''));
    for (var k in this.sizeChoices) this.sizeChoices[k].setAttribute('aria-pressed', String(k === size));
    if (small) { this.close(); this.tell(''); }
    if (!quiet) save(this.state);
    this.place();
    if (!small) this.log.scrollTop = this.log.scrollHeight;
  };

  Radio.prototype.setSizePanel = function (open) {
    this.sizePanel.hidden = !open;
    this.sizeBtn.setAttribute('aria-expanded', String(open));
    this.sizeBtn.setAttribute('aria-controls', 'cb-size-panel');
    if (open && this.sizeChoices[this.state.size || 'normal']) this.sizeChoices[this.state.size || 'normal'].focus();
    this.place();
  };

  Radio.prototype.setFolded = function (folded, quiet) {
    this.state.folded = folded;
    this.box.classList.toggle('cb-radio--folded', folded);
    this.set.hidden = folded;
    this.sizeBtn.hidden = folded;
    if (folded) this.setSizePanel(false);
    this.tpBtn.hidden = folded;
    if (folded && !this.tpPanel.hidden) this.setTeleport(false);
    if (folded && !this.petsPanel.hidden) this.setPets(false);
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
    this.screenBtn.hidden = !(this.state.base && firstScreen());
    if (this.screenBtn.hidden && !this.screenPanel.hidden) this.setScreenPanel(false);
    this.screenNamed(w);
    this.hostTick(w);
    this.hereTick();
    if (!this.online.hidden) this.onlineTick();
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
        lis[i].remove();
      }
    }
    for (i = 0; i < messages.length; i++) {
      var m = messages[i];
      if (this.seen[m.id]) {
        // Already on the log: only its reactions can have changed.
        var was = this.msgLi(m.id);
        if (was) this.drawReactions(was, m);
        continue;
      }
      this.seen[m.id] = true;
      var li = el('li', 'cb-msg' + (m.base ? ' cb-msg--base' : ''));
      li.dataset.id = m.id;
      var head = el('p', 'cb-head');
      var who = el('button', 'cb-handle', m.handle);
      who.type = 'button';
      who.setAttribute('aria-controls', 'cb-peek');
      (function (h, b) { b.addEventListener('click', function () { me.peek(h, b); }); })(m.handle, who);
      head.appendChild(who);
      if (m.base) head.appendChild(el('span', 'cb-tag', 'BASE'));
      else if (m.claimed) head.appendChild(el('span', 'cb-tag cb-tag--claimed', 'CLAIMED'));
      var when = el('time', 'cb-time', clock(m.t));
      when.dateTime = new Date(m.t).toISOString();
      head.appendChild(when);
      li.appendChild(head);
      var said = el('div', 'cb-text');
      said.cbRaw = m.text;
      li.appendChild(md(said, m.text));
      if (m.img) li.appendChild(this.picture_(m));
      if (m.sticker) li.appendChild(sticker(m.sticker));
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
         message is announced in markup order, so "Copy" or "Take off" first
         would be read in front of every message. */
      var acts = el('div', 'cb-acts');
      if (m.text) acts.appendChild(this.copyBtn(m));
      acts.appendChild(this.reactBtn(m, li));
      if (this.state.base) {
        var off = el('button', 'cb-btn cb-take', 'Take off');
        off.type = 'button';
        off.setAttribute('aria-label', 'Take ' + m.handle + '’s message at ' + clock(m.t) + ' off the air');
        (function (id) { off.addEventListener('click', function () { me.moderate({ remove: id }); }); })(m.id);
        acts.appendChild(off);
      }
      if (acts.children.length) li.appendChild(acts);
      this.log.appendChild(li);
      if (news && !(mine && m.handle === this.state.handle)) this.speak(li);
    }
    this.quiet.textContent = this.quietText();
    this.quiet.hidden = messages.length > 0;
    this.log.hidden = messages.length === 0;
    if (mine || (added && atEnd)) this.log.scrollTop = this.log.scrollHeight;
  };

  /* COPY, on every message with words in it: the words as they were typed,
     Markdown and all, onto your own clipboard. The answer is on the button and
     on the radio's own line under the log, so it is seen where the hand is. */
  Radio.prototype.copyBtn = function (m) {
    var me = this, b = el('button', 'cb-btn cb-copy', 'Copy');
    b.type = 'button';
    b.setAttribute('aria-label', 'Copy ' + m.handle + '’s message at ' + clock(m.t));
    b.addEventListener('click', function () {
      var done = function () {
        b.textContent = 'Copied';
        me.tell('Copied ' + m.handle + '’s message.');
        setTimeout(function () { b.textContent = 'Copy'; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(m.text).then(done, function () { me.tell('Your browser would not let the radio copy that.'); });
      } else me.tell('Your browser would not let the radio copy that.');
    });
    return b;
  };

  /* A picture in the log. It has no public address, so it is fetched with the
     pass, once, and shown from memory until its message goes. */
  Radio.prototype.picture_ = function (m) {
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
    fetch('/cb/image?id=' + encodeURIComponent(m.img), {
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
    var d = this.lbox;
    if (!d) {
      d = this.lbox = el('dialog', 'cb-lightbox');
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
      d.appendChild(big);
      d.appendChild(cap);
      d.appendChild(bar);
      this.host.shadowRoot.appendChild(d);
    }
    var said = m.alt || (m.handle + ' sent a picture, with no description.');
    d.setAttribute('aria-label', m.handle + '’s picture');
    this.lboxImg.src = url;
    this.lboxImg.alt = said;
    this.lboxCap.textContent = m.alt ? m.alt : '';
    this.lboxCap.hidden = !m.alt;
    if (m.alt) this.lboxCap.setAttribute('aria-hidden', 'true');
    this.lboxDl.href = url;
    this.lboxDl.download = pictureName(m);
    this.lboxFrom = from;
    this.lboxId = m.img;
    // The dialog gives the keyboard back to whatever had it when it opened,
    // and Safari does not focus a button on a click, so the picture takes it
    // first: closing always comes back to the picture.
    if (from && from.focus) from.focus({ preventScroll: true });
    if (!d.open) d.showModal();
    this.lboxShut.focus();
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

  Radio.prototype.peek = function (handle, from) {
    var me = this, box = this.peekBox;
    this.peekFrom = from;
    box.textContent = '';
    box.hidden = false;
    box.setAttribute('aria-label', handle + '\u2019s pets');
    var h = el('p', 'cb-peek__h', handle + '\u2019s pets');
    h.tabIndex = -1;
    box.appendChild(h);
    var said = el('p', 'cb-quiet', 'Looking\u2026');
    box.appendChild(said);
    var list = el('ul', 'cb-pets__list');
    list.hidden = true;
    box.appendChild(list);
    var close = el('button', 'cb-btn cb-peek__close', 'Close');
    close.type = 'button';
    close.addEventListener('click', function () { me.unpeek(); });
    box.appendChild(close);
    h.focus();
    box.scrollIntoView({ block: 'nearest' });
    withAnimals(function () {
      call('/cb/pets/of', { body: { handle: handle } }, me.state.pass).then(function (r) {
        if (r.status === 401) return me.lost();
        if (r.status !== 200) { said.textContent = 'Their pets could not be fetched just now.'; return; }
        if (!r.body.shown) {
          said.textContent = handle === me.state.handle
            ? 'You have not made your pets public. Profile, on this radio, is where you switch that on.'
            : handle + ' has not made their pets public.';
          return;
        }
        if (!r.body.pets.length) { said.textContent = r.body.handle + ' has no pets yet.'; return; }
        said.hidden = true;
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
      }, function () { said.textContent = 'Their pets could not be fetched just now.'; });
    });
  };

  Radio.prototype.unpeek = function () {
    this.peekBox.hidden = true;
    this.peekBox.textContent = '';
    var from = this.peekFrom;
    this.peekFrom = null;
    if (from && from.isConnected) from.focus();
  };

  /* THE STICKER PICKER: your pets, each a button that sends a sticker of them
     to the channel you are tuned to, straight away. Whatever is in the box
     stays there. */
  Radio.prototype.setStickers = function (open) {
    var me = this, box = this.stickBox;
    box.hidden = !open;
    this.stickBtn.setAttribute('aria-expanded', String(!!open));
    if (!open) { box.textContent = ''; return; }
    box.textContent = '';
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
        box.appendChild(ul);
        var first = ul.querySelector('button');
        if (first) first.focus();
      }, function () { said.textContent = 'Your pets could not be fetched just now.'; });
    });
  };

  Radio.prototype.sendSticker = function (id) {
    var me = this, room = this.tunedRoom(), b = { sticker: id };
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
  Radio.prototype.drawReactions = function (li, m) {
    var me = this, rx = li.querySelector(':scope > .cb-rx');
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
      b.addEventListener('click', function () { me.react(m.id, x.emoji); });
      rx.appendChild(b);
    });
    if (on) { var again = rx.querySelector('[data-emoji="' + on + '"]'); if (again) again.focus(); }
  };

  /* React, on the message's own line: opens the set under the message. */
  Radio.prototype.reactBtn = function (m, li) {
    var me = this;
    var b = el('button', 'cb-btn cb-react', 'React');
    b.type = 'button';
    b.setAttribute('aria-expanded', 'false');
    b.setAttribute('aria-label', 'React to ' + m.handle + '\u2019s message at ' + clock(m.t));
    b.addEventListener('click', function () {
      var open = li.querySelector(':scope > .cb-rx-pick');
      if (open) { open.remove(); b.setAttribute('aria-expanded', 'false'); return; }
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
          me.react(m.id, x[0]);
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
        me.react(m.id, v);
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

  Radio.prototype.setPets = function (open) {
    this.petsPanel.hidden = !open;
    this.petsBtn.setAttribute('aria-expanded', String(!!open));
    if (open) { this.loadAccount(); this.loadPets(); }
    else { this.forgetSure.hidden = true; this.forgetBtn.hidden = false; }
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
        ? 'The password has changed since you signed on. Sign on again at the Community Center.'
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
    if (this.whoTag) this.whoTag.hidden = !claimedPass(pass);
  };

  Radio.prototype.drawAccount = function (a) {
    var me = this, box = me.acctBox, h = me.state.handle;
    box.textContent = '';
    me.drawWhere(!!a.claimed);
    /* A MODERATOR MOVES ONTO A PASSWORD OF THEIR OWN here, the same claim as
       anybody's (Ryan's call, 2026-09-30). Their roles stay on the moderators'
       list; the account only holds the password. */
    var base = !!a.base;
    if (!a.claimed) {
      if (base) {
        box.appendChild(el('p', null, 'You are on with the moderators\u2019 password, which every moderator knows, so any of them can sign on as ' + h + ' today. Move onto a password of your own and only you can: your roles stay where they are, on the moderators\u2019 list, and the moderators\u2019 password stops working for ' + h + '.'));
        box.appendChild(el('p', 'cb-quiet', 'There is no email. You get a recovery code, once, which is the way back in if you forget your password. The moderators\u2019 desk does not reset a moderator\u2019s username, so keep the code; failing that, Ryan or Helen can move you back.'));
      } else {
        box.appendChild(el('p', null, 'Anybody with the community password can sign on as ' + h + ' today. Claim it and it is yours: from then on it signs on with a password of your own, and the community password stops working for it.'));
        box.appendChild(el('p', 'cb-quiet', 'There is no email. When you claim, you get a recovery code, once, which is the way back in if you forget your password; a moderator can also give you a reset code.'));
      }
      var pw = field('A password of your own', 'cb-acct-pw'), again = field('The same again', 'cb-acct-pw2');
      box.appendChild(pw.wrap); box.appendChild(again.wrap);
      var claim = el('button', 'cb-btn cb-acct-claim', base ? 'Move onto my own password' : 'Claim ' + h);
      claim.type = 'button';
      box.appendChild(claim);
      claim.addEventListener('click', function () {
        if (pw.input.value !== again.input.value) { me.acctSay('The two passwords are not the same.'); pw.input.focus(); return; }
        claim.disabled = true;
        me.acctSay('Claiming\u2026');
        call('/cb/account', { body: { action: 'claim', password: pw.input.value } }, me.state.pass).then(function (r) {
          claim.disabled = false;
          if (r.status === 200 && r.body.pass) {
            me.takePass(r.body.pass, true);
            me.showRecovery(r.body.recovery, base
              ? 'Done. You sign on as ' + h + ' with your own password now, still as the base, and the moderators\u2019 password no longer works for ' + h + '.'
              : 'Claimed. ' + h + ' is yours, and signs on with your own password now.');
            return;
          }
          me.acctSay((r.body && r.body.error) || 'That did not work just now. Nothing was claimed.');
        }, function () { claim.disabled = false; me.acctSay('The desk could not be reached just now. Nothing was claimed.'); });
      });
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
        ? 'This deletes your own password and your pets, and puts ' + a.handle + ' back on the moderators\u2019 password, which any moderator can sign on with. Your pets stay on the list of everybody adopted, with nothing connecting them to you. It cannot be undone.'
        : 'This deletes your username, its password and your pets, and anybody can take the name afterwards. Your pets stay on the list of everybody adopted, with nothing connecting them to you. It cannot be undone.'));
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

  /* A recovery code is shown once, and the tray says so rather than letting it
     look like something that can be fetched again. */
  Radio.prototype.showRecovery = function (code, lead) {
    var me = this, box = me.acctBox;
    box.textContent = '';
    me.drawWhere(true);
    box.appendChild(el('p', null, lead));
    box.appendChild(el('p', null, 'Your recovery code is below. It is the way back in if you forget your password, and it will not be shown again: write it down, or keep it where you keep passwords.'));
    var c = el('p', 'cb-acct__code', code);
    box.appendChild(c);
    var done = el('button', 'cb-btn', 'I have kept it'); done.type = 'button';
    box.appendChild(done);
    done.focus();
    done.addEventListener('click', function () { me.loadAccount(); });
    me.acctSay('');
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
      : '. Your pets are kept under the handle ' + this.state.handle + ', scrambled, so they follow you to any device you sign on with. A handle is not an account: anybody who signs on with it sees them too, until you claim it above.'));
  };

  Radio.prototype.loadPets = function () {
    var me = this;
    me.petsState.hidden = false;
    me.petsState.textContent = 'Looking for your pets\u2026';
    withAnimals(function () {
      call('/cb/pets', null, me.state.pass).then(function (r) {
        if (r.status === 200 && r.body.pets) { me.drawPets(r.body.pets); me.drawShow(r.body); return; }
        me.petsState.textContent = r.status === 401
          ? 'The password has changed since you signed on. Sign on again at the Community Center.'
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
      box.appendChild(el('p', 'cb-quiet', 'Claim your username above and you can let people on the CB see your pets, by pressing your handle on the channel.'));
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
      words.appendChild(rn);
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


  Radio.prototype.forgetMe = function () {
    var me = this;
    me.petsState.hidden = false;
    me.petsState.textContent = 'Forgetting\u2026';
    call('/cb/pets', { body: { forget: true } }, me.state.pass).then(function (r) {
      me.forgetSure.hidden = true; me.forgetBtn.hidden = false;
      if (r.status === 200 && r.body.forgotten) { me.drawPets([]); me.drawShow({ claimed: /^cb2\./.test(me.state.pass), shown: false }); me.petsState.textContent = 'Forgotten. The street keeps nothing under this handle now.'; me.forgetBtn.focus(); return; }
      me.petsState.textContent = (r.body && typeof r.body.error === 'string') ? r.body.error : 'That did not work just now. Nothing was forgotten.';
    }, function () {
      me.forgetSure.hidden = true; me.forgetBtn.hidden = false;
      me.petsState.textContent = 'The street could not be reached just now. Nothing was forgotten.';
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
    var found = findRooms(this.tpFind.value), here = herePath();
    var offer = this.tpOffer = found.map(function (f) { return f.room; });
    for (var i = 0; i < offer.length; i++) {
      var li = el('li', 'cb-opt');
      li.id = 'cb-tp-' + offer[i].tag;
      li.setAttribute('role', 'option');
      var nm = el('span', 'cb-opt__name', offer[i].name);
      if (found[i].why) nm.appendChild(el('span', 'cb-opt__why', found[i].why));
      li.appendChild(nm);
      li.appendChild(el('span', 'cb-opt__tag', offer[i].path === here ? 'you are here' : '#' + offer[i].tag));
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
     is open; the teleporter's @ asks too. */
  Radio.prototype.setOnline = function (open) {
    this.online.hidden = !open;
    this.onlineBtn.setAttribute('aria-expanded', String(open));
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
      if (r.status === 200 && Array.isArray(r.body.people)) { me.people = r.body.people; me.peopleAt = Date.now(); me.peopleFailed = false; }
      else me.peopleFailed = true;
    }, function () { me.peopleFailed = true; })
      .then(function () {
        me.onlineBusy = false;
        if (!me.online.hidden) me.onlineShown();
        if (me.tpWants && !me.tpPanel.hidden && personTyped(me.tpFind.value) !== null) me.tpRender();
        me.tpWants = false;
      });
  };

  // A person's rooms that are rooms on the street, in walking order.
  function roomsOf(p) {
    var out = [];
    for (var i = 0; rooms && i < rooms.length; i++) if (p.rooms.indexOf(rooms[i].tag) >= 0) out.push(rooms[i]);
    return out;
  }

  function personLine(li, p, mine) {
    li.appendChild(el('b', null, p.handle));
    if (p.base) li.appendChild(el('span', 'cb-tag', 'BASE'));
    else if (p.claimed) li.appendChild(el('span', 'cb-tag cb-tag--claimed', 'CLAIMED'));
    if (mine) li.appendChild(document.createTextNode(' (you)'));
  }

  /* Redrawn only when what it says changes, and the keyboard is put back on
     the same room's link, so a listen every four seconds does not throw
     somebody off the link they were about to press. */
  Radio.prototype.onlineShown = function () {
    var ul = this.onlineList, none = this.onlineNone, me = this, here = herePath();
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
    var key = JSON.stringify([shown, here, this.state.handle]);
    none.hidden = shown.length > 0;
    none.textContent = 'Nobody is seen in a room right now.';
    ul.hidden = !shown.length;
    if (key === this.onlineKey) return;
    this.onlineKey = key;
    var focused = ul.getRootNode().activeElement, again = focused && ul.contains(focused) && focused.dataset ? focused.dataset.at : null;
    ul.textContent = '';
    shown.forEach(function (p) {
      var li = el('li', 'cb-online-row');
      personLine(li, p, p.handle === me.state.handle);
      li.appendChild(document.createTextNode(' in '));
      roomsOf(p).forEach(function (r, i) {
        if (i) li.appendChild(document.createTextNode(', '));
        if (r.path === here) { li.appendChild(el('span', null, r.name + ' (this room)')); return; }
        var a = el('a', 'cb-online-room', r.name);
        a.href = r.path;
        a.dataset.at = p.handle + '|' + r.tag;
        li.appendChild(a);
        if (a.dataset.at === again) setTimeout(function () { a.focus(); }, 0);
      });
      ul.appendChild(li);
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
    var list = this.tpList, none = this.tpNone, me = this, here = herePath();
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
        li.appendChild(el('span', 'cb-opt__tag', r.path === here ? 'this room' : '#' + r.tag));
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
    this.tell('Getting the picture ready…');
    redraw(file).then(function (blob) {
      me.picture = blob;
      me.picReadyLine.textContent = 'Picture ready to go with your message. The radio has taken off anything the camera wrote into it.';
      me.picReady.hidden = false;
      me.tell('');
      me.picAlt.focus();
    }).catch(function () { me.tell('The radio could not read that picture.'); });
  };

  Radio.prototype.dropPicture = function () {
    this.picture = null;
    this.picAlt.value = '';
    this.picReady.hidden = true;
  };

  // The message box grows with what is in it, to about eight lines.
  Radio.prototype.grow = function () {
    var t = this.say;
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
        me.grow();
        if (picture) me.dropPicture();
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
  Radio.prototype.jump = function (secs, film, room, video, beacon) {
    var e = window.loveEmbed, w = e && e.where ? e.where() : null;
    var at = place(secs), called = film ? '\u201c' + film + '\u201d' : 'the film';
    if (room && hereTag() !== room) {
      var there = byTag[room] ? byTag[room].name : '#' + room;
      this.tell(at + ' is in ' + called + ' at ' + there + ', and you are in another room, so nothing moved. The room\u2019s name in that message takes you there.');
      return;
    }
    if (!w || (film && !sameFilm(film, w.film))) {
      var got = film && readyFilm(film, video, secs, beacon);
      if (got) {
        this.tell(called + ' is ready at ' + at + ': its play button has the keyboard. Press it, or Enter, and it starts there.' + readyNote(got));
        return;
      }
      this.tell(!w
        ? 'No film has been started on this page, so there is nothing to move. Press play on ' + called + ' first, then ' + at + ' will take it there.'
        : at + ' is in ' + called + ', and the film playing here is \u201c' + w.film + '\u201d, so nothing moved. ' + called + ' has no play button of its own on this page.');
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
    this.grow();
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
    this.presenceShown();
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

  function whoList(p, people, key) {
    p.textContent = '';
    people.forEach(function (x, i) {
      if (i) p.appendChild(document.createTextNode(', '));
      p.appendChild(el('b', null, x[key]));
      if (x.base) p.appendChild(el('span', 'cb-tag', 'BASE'));
      else if (x.claimed) p.appendChild(el('span', 'cb-tag cb-tag--claimed', 'CLAIMED'));
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
    if (!tag) return;
    var on = !!this.state.seen, a = this.seenFrom === tag ? this.seenAnswer : null;
    this.seenBtn.setAttribute('aria-pressed', String(on));
    this.inCallNow.hidden = true;
    if (!on) { this.seenNow.textContent = 'Switch it on to be on Who\u2019s online with the room you are in, and to see who else here has, and who is in this room\u2019s call.'; return; }
    // It never claims what it has not heard.
    if (!a) { this.seenNow.textContent = 'Looking\u2026'; return; }
    if (a.refused) { this.seenNow.textContent = 'Being seen here is for the people this room is for.'; return; }
    var others = a.others || [];
    if (others.length) {
      this.seenNow.textContent = '';
      this.seenNow.appendChild(document.createTextNode('Also seen here: '));
      var span = el('span'); whoList(span, others, 'handle'); this.seenNow.appendChild(span);
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
    // A window that has just opened gets its who-is-in-the-call line at once.
    if (this.present) this.presenceShown();
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
    this.tell('It is up on ' + glass.name + ' and playing on your page' + (v.start ? ' from ' + place(v.start) : '') +
      '. Once it plays, Host this film lets everybody in this room follow; their screens get its play button, waiting for their press.' +
      (shrank ? ' The radio went small so you can see it; Size puts it back.' : ''));
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
    var line = 'Now showing on ' + sc.name + ': \u201c' + w.film + '\u201d' + (w.duration ? ', ' + place(w.duration) : '') +
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
    if (last && last.film === w.film && last.playing === w.playing && last.length === !!w.duration &&
        Math.abs(w.time - guess) < 3 && now - last.when < BEAT) return;
    var film = Array.from(w.film);
    film = film.length > FILM_MAX ? film.slice(0, FILM_MAX - 1).join('') + '\u2026' : w.film;
    this.sendBeacon({ room: h.room, film: film, video: w.id || null, length: w.duration || null, at: Math.max(0, w.time), playing: !!w.playing },
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
      if (!f.waiting) {
        var ready = readyFilm(b.film, b.video, this.placeOf(b), b);
        this.tell(ready
          ? 'Following ' + b.handle + ': \u201c' + b.film + '\u201d is ready, and its play button has the keyboard. Press it, or Enter, and it keeps pace from there.' + readyNote(ready)
          : 'Following ' + b.handle + ': press play on \u201c' + b.film + '\u201d and it will keep pace from there. It has no play button of its own on this page, so it may be in a playlist here.');
      }
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
      if (b.room === room) { this.jump(Math.floor(this.placeOf(b)), b.film, b.room, b.video, b); return; }
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
    /* A spot in the address is read once the radio exists. On most pages
       call.js has to load first, and arrive() used to run from start() while
       the radio was still null, so a spot's room link did nothing there. */
    arrive();
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
    var need = (b.getAttribute('data-cb-role') || 'moderator').split(/\s+/);
    var roles = (s && s.roles) || [];
    var key = !b.hasAttribute('data-cb-strict') && roles.indexOf('administrator') >= 0;
    return !!(s && s.base) && (key || need.some(function (r) { return roles.indexOf(r) >= 0; }));
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
    wireRecover();
    counter();
  }

  /* GETTING BACK INTO A CLAIMED USERNAME. The recovery code from claiming, or
     a moderator's reset code, and a new password; the answer is a pass and a
     NEW recovery code, shown here once. */
  function wireRecover() {
    var box = document.getElementById('cb-recover-box');
    var form = document.getElementById('cb-recover');
    if (!box || !form) return;
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
     that is only in a playlist is not found. */
  function filmButton(film, video) {
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
    var button = glass.ready({ id: b.video, film: b.film, length: b.length, by: b.handle });
    return button ? { button: button, name: glass.name, back: glass.back } : null;
  }

  // spec is what firstScreen's ready() is handed: { id, film, length, by }.
  function rackPlate(f, spec) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'facade';
    btn.dataset.embedId = spec.id;
    btn.dataset.embedTitle = spec.film;
    btn.appendChild(document.createTextNode('\u201c' + spec.film + '\u201d \u2014 ' +
      (spec.length ? 'runs ' + place(spec.length) : 'how long it runs was not said') + ', hosted on the CB by ' + spec.by));
    var go = document.createElement('span');
    go.className = 'facade__play';
    go.textContent = '\u25B6 PRESS PLAY';
    btn.appendChild(go);
    window.loveRack.put(f.id, btn, 'On ' + f.name + ' now: \u201c' + spec.film + '\u201d, which ' + spec.by + ' is hosting from the CB. It waits for your press.');
    return btn;
  }

  function readyFilm(film, video, secs, beacon) {
    var hit = filmButton(film, video), put = null;
    if (!hit && beacon && (put = plateFor(beacon))) hit = put.button;
    if (!hit) return null;
    var old = document.querySelectorAll('[data-cb-ready]');
    for (var o = 0; o < old.length; o++) old[o].removeAttribute('data-cb-ready');
    if (secs != null) hit.dataset.embedStart = String(Math.max(0, Math.floor(secs)));
    for (var d = hit.closest('details'); d; d = d.parentElement && d.parentElement.closest('details')) d.open = true;
    // Seen as well as focused: the page goes to it (at once, the dial's rule
    // against smooth scrolling), and it wears a ring even after a mouse press,
    // which is the case a browser's own focus ring leaves out.
    hit.scrollIntoView({ block: 'center' });
    hit.setAttribute('data-cb-ready', '');
    hit.addEventListener('blur', function off() { hit.removeAttribute('data-cb-ready'); hit.removeEventListener('blur', off); });
    try { hit.focus({ preventScroll: true, focusVisible: true }); } catch (e) { hit.focus(); }
    return { button: hit, shrank: clearOf(hit), put: put };
  }

  /* A film under the radio has been got ready out of sight, which is the
     fault this exists to fix, so the radio goes Small for now and says so.
     Small still listens; Size puts it back, and nothing is saved. */
  function clearOf(node) {
    var shrank = false;
    if (radio && radio.state.size !== 'small' && !radio.state.folded) {
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
      (got.shrank ? ' The radio went small so you can see it; Size puts it back.' : '');
  }

  function arrive() {
    var m = location.hash.match(/^#spot=(\d{1,6})(?:&film=([^&]*))?$/);
    if (!m || !radio) return;
    var secs = +m[1], film = '';
    try { film = decodeURIComponent(m[2] || ''); } catch (e) { return; }
    /* Arriving from a host's row in another room: a moderator's pasted video
       has no button here until that host's beacon has been heard, which is
       the radio's first listen, so it waits for that rather than giving up. */
    if (!radio.beaconsHeard && !filmButton(film, null)) { radio.arriving = { secs: secs, film: film }; return; }
    landed(secs, film);
  }

  function landed(secs, film) {
    var b = radio.beaconIn(hereTag()), host = b && film && sameFilm(film, b.film) ? b : null;
    var at = place(secs), called = film ? '\u201c' + film + '\u201d' : 'the film';
    var got = readyFilm(film, host && host.video, secs, host);
    if (!got) {
      radio.tell(called + ' has no play button of its own on this page, so it could not be set to start at ' + at + '. Press play on it, then press @' + at + ' on the channel.');
      return;
    }
    radio.tell('You came for ' + at + ' in ' + called + '. Its play button has the keyboard: press it, or Enter, and it starts there.' + readyNote(got));
  }

  function start() {
    wireCounter();
    tuneIn();
    // Following a spot to the room you are already in changes only the hash.
    window.addEventListener('hashchange', arrive);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();

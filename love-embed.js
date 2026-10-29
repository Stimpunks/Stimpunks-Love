/* =============================================================================
   The press-to-play facade.

   A <button class="facade"> carrying data-embed-id and data-embed-title is a
   plain button until somebody presses it. NOTHING reaches youtube before that
   press — no iframe, no cookie, no request, no pixel. On press the button is
   replaced by a youtube-nocookie iframe with autoplay, because at that point
   autoplay is the thing the visitor just asked for.

   This is the mechanism behind the room rule "nothing plays until you press
   play". Without it that line is an intention; with it, it is a property of
   the page that can be checked in a network panel.
   ============================================================================= */
(function () {
  'use strict';

  /* THE ONLY PLACE ON THIS SITE THAT BUILDS AN EMBED, and it is exposed rather
     than private for exactly that reason. Three things call it now: the
     press-to-play plate, the Hermitage's television, which retunes between
     channels, and Club Chronic's stage, which frames a playlist rather than a
     video. Those are three mechanisms and they must not become three
     CONTRACTS — two copies of these attributes is one copy that gets a
     referrerpolicy fixed and one that does not, silently, in the
     security-relevant half of this file.

     Both forms return null rather than throwing: a caller handing over rubbish
     gets nothing, which is the same quiet refusal the click handler has always
     given, and is why make-chappell.py, make-hermitage.py and make-club.py all
     refuse a bad id at BUILD time instead of relying on this. A quiet refusal
     at runtime is a button somebody presses and presses. */
  /* THE ORIGINS THIS SITE WILL BUILD A FRAME FOR, and the reason there is a
     list at all. Club Chronic needs to embed a PLAYLIST rather than a video,
     which means a caller handing over a whole URL instead of an eleven-
     character id — and a builder that accepts any URL is a hole, because the
     one thing the id check has always really been doing is refusing to point
     this site's frames at somewhere nobody chose. So the URL form is allowed
     and it is checked against this. Adding an origin here is a decision that
     THIS ARRAY IS THE SINGLE SOURCE OF TRUTH FOR WHICH ORIGINS THIS SITE WILL
     FRAME. make-csp.py reads it to build frame-src in _headers, and
     make-sweetgrass.py reads it to refuse a bad URL at build time; neither
     keeps a copy. Adding a service is one edit here and a re-run of
     make-csp.py -- and do not hand-edit the header, because that line is
     generated and a hand edit to it is put back on the next run, silently,
     which is exactly how videopress shipped working locally and refused
     live. */
  var ORIGINS = [
    'https://www.youtube-nocookie.com/',
    'https://open.spotify.com/',
    /* Swaying Sweetgrass's ten seconds of grass: Ryan's own video, already
       published by us on stimpunks.org's Nature entry, framed from where it
       already lives rather than copied onto this site. Third origin, third
       origin, and the one place it is written down -- make-csp.py and
       make-sweetgrass.py both read the array above. */
    'https://videopress.com/',
    /* Club Chronic's Apple Music deck. FOURTH ORIGIN, AND THE FIRST ONE WHERE
       THE SERVICE SAYS BOTH THINGS OUT LOUD: music.apple.com sends
       X-Frame-Options: DENY *and* frame-ancestors 'none', and
       embed.music.apple.com omits frame-ancestors entirely. Same company, two
       hosts, opposite permissions -- which is "playing is not the same
       permission as embedding" stated by the vendor rather than discovered by
       us. The page a person browses is the one that refuses; the embed host is
       the one to frame. */
    'https://embed.music.apple.com/',
    /* Words, Bud, Beats' records, through TIDAL. SIXTH ORIGIN, AND APPLE'S
       SPLIT AGAIN: tidal.com sends frame-ancestors 'self', and embed.tidal.com
       sends nothing that refuses a frame (both measured 2026-10-10). Signed
       out it plays a PREVIEW, and not one length: a minute of a 2:08 song,
       thirty seconds of a 3:17 and of a 3:42, then a Sign up / Log in screen,
       so a Tidal button says preview and never promises a number. It played
       under the street's real policy, which delegates it neither autoplay nor
       encrypted-media, so it needs a second press inside its frame, as Spotify
       and Apple do. Its player also loads Datadog for one session in ten,
       which privacy.html says. Its square layout (?layout=gridify) is the one
       the street uses: the strip layout's times run into each other at the
       width of a record sleeve. */
    'https://embed.tidal.com/',
    /* The Faery Yurt's moon spoon windowledge, Helen Edgar's ask, 2026-10-16:
       Vi Hart's video Moon Spoon, which is hers and on her own Vimeo, played
       through Helen's window. SEVENTH ORIGIN. player.vimeo.com is the embed
       host and vimeo.com is the page a person browses; the frame was pressed
       and played from the dev server on 2026-10-16 before this line went in,
       and dnt=1 on the address asks the player not to track the session. */
    'https://player.vimeo.com/',
    /* The Haunted House's soundtrack, Hallowscenes, which Enigma made with
       Suno and asked to have in the house (relayed by Ryan, 2026-10-28).
       EIGHTH ORIGIN, AND APPLE'S SPLIT A THIRD TIME: suno.com/song/ and
       suno.com/album/ send X-Frame-Options: SAMEORIGIN and frame-ancestors
       'none', and suno.com/embed/ sends neither (all twelve songs measured).
       Signed out, one song's embed played it whole (2:03 of 2:03). Suno's
       album embed is a list whose rows open suno.com in a new tab and play
       nothing, so every song is its own press. Suno's files cannot be streamed
       instead: its CDN answered 403 and the page's audio address is
       /api/forbidden, so a frame is the only way it plays here. Suno shows its
       own play button inside the frame, so a song is two presses. */
    'https://suno.com/embed/',
    /* A room's call, through 8x8's Jitsi as a Service. FIFTH ORIGIN, AND THE
       FIRST ONE HANDED THE CAMERA AND THE MICROPHONE. Ryan, 2026-09-28. It
       is still only framed after a press, and only from the CB, with a token
       the CB signed for one handle and one room; nobody who has not signed on
       can reach it. 8x8 sends no X-Frame-Options and no frame-ancestors
       (measured), and _headers' Permissions-Policy delegates camera,
       microphone and display-capture to this origin and no other, through
       self, because a browser hands a frame only what its page has (without
       self every call ran deaf and blind in Chrome until 2026-10-07). CALL,
       below, is the one allow list with those three in it. */
    'https://8x8.vc/'
  ];

  var CALL = 'https://8x8.vc/';

  /* WHERE EVERYBODY IS UP TO, without YouTube's script. Ryan's ask,
     2026-09-28: at a watch-together everybody runs their own player, pauses
     when they like, and used to paste timestamps into the CB by hand. The CB
     turns "@34:12" into a button now, and this is what the button presses.

     The player inside a youtube-nocookie frame answers postMessage when its
     address carries enablejsapi=1: tell it "listening" and it reports its
     position, state and title back to this page; send it "seekTo" and it
     moves. That is the same protocol YouTube's IFrame Player API speaks, but
     spoken from here, so there is NO www.youtube.com/iframe_api script on the
     page and script-src does not move -- which is the whole reason this was
     possible (Club Chronic's note on setShuffle is the other half of it).
     Measured 2026-09-28 before anything was built: play, seekTo 300 and pause
     all obeyed, and currentTime came back.

     The frame still waits for its press: nothing here builds one. It sends
     nothing new to YouTube either: the page's origin was already in the
     Referer, and the messages stay inside this browser. Nothing is stored,
     and nothing about anybody's position leaves the page unless they type it
     into the CB and transmit it themselves. seek() never presses play: a jump
     moves your place, and whether it plays is still yours. */
  var YT = 'https://www.youtube-nocookie.com';
  var VIDEO = /^[A-Za-z0-9_-]{11}$/;
  var players = [];

  /* A LIST TURNING FROM ONE FILM TO THE NEXT says nothing true for a moment,
     and that moment broke Follow (Helen Edgar hosting an album at the
     Hermitage, 2026-10-20). Measured the same day, on the live site: the
     player names the next film's place in the list at once, then goes on
     giving the last film's title, with its clock back at 0:00, for about half
     a second before the next one's details arrive; and after a cue or a load
     it can send the last film's details beside the new place. So a film in a
     list is believed only once the film the player names is the one at the
     place it says it is at. Until then the player is TURNING: what it says
     about the film is not taken, and where() says so, so a host's radio does
     not tell everybody the album went back to the start, and a follower's
     radio judges nothing. The end of a film with another after it is the
     start of a turn too. A turn is given TURN to finish and then believed
     anyway, because a list whose next film will not load must not leave the
     page silent for good. */
  var TURN = 5000;

  function hear(e) {
    if (e.origin !== YT) return;
    var d;
    try { d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data; } catch (x) { return; }
    if (!d || !d.info) return;
    for (var i = 0; i < players.length; i++) {
      var p = players[i];
      if (!p.el.contentWindow || p.el.contentWindow !== e.source) continue;
      // A list YouTube refused names its video "videoseries", eleven letters
      // like an id (measured): it is no film.
      var info = d.info, vd = info.videoData, id = vd && VIDEO.test(vd.video_id || '') && vd.video_id !== 'videoseries' ? vd.video_id : null;
      if (p.turning && Date.now() - p.turning.at >= TURN) p.turning = null;
      // The list's own ids. An empty list is the player loading one again
      // (measured), not a list with nothing in it.
      if (Array.isArray(info.playlist) && info.playlist.length) p.ids = info.playlist.filter(function (v) { return VIDEO.test(v); });
      if (typeof info.playlistIndex === 'number' && info.playlistIndex >= 0 && info.playlistIndex !== p.index) {
        if (p.index != null) p.turning = { from: p.turning ? p.turning.from : p.index, at: Date.now() };
        p.index = info.playlistIndex;
      }
      if (typeof info.playerState === 'number') {
        p.state = info.playerState;
        // 1 playing, 2 paused, 3 buffering: somebody has started this one.
        if (p.state === 1 || p.state === 2 || p.state === 3) p.started = true;
        if (p.state === 1) p.lastPlayed = Date.now();
        if (p.state === 0 && !p.turning && p.ids && p.index != null && p.index < p.ids.length - 1) p.turning = { from: p.index, at: Date.now() };
      }
      if (p.turning && id && p.index !== p.turning.from && (p.ids ? p.ids[p.index] === id : id !== p.id)) p.turning = null;
      if (p.turning) return;
      if (typeof info.currentTime === 'number') p.time = info.currentTime;
      if (typeof info.duration === 'number' && info.duration > 0) p.duration = info.duration;
      if (vd) {
        if (vd.title) p.film = vd.title;
        // Which video, so the CB can find this film's own play button by id
        // rather than by a title several films on a rack may share.
        if (id) p.id = id;
        p.live = !!vd.isLive;
      }
      return;
    }
  }

  function track(el) {
    var p = { el: el, time: 0, state: -1, started: false, lastPlayed: 0 };
    players.push(p);
    el.addEventListener('load', function () {
      el.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: players.indexOf(p) + 1, channel: 'widget' }), YT);
    });
  }
  window.addEventListener('message', hear);

  /* The film this page's jump means: the one playing now, or else the one
     that played last, and never one nobody has started. A live video is left
     out unless the caller asks for it: a time means nothing in one, so seek,
     play and pause never touch it, and only where({ live: true }) sees it,
     for the CB's Add my spot and Host this film, which say it is live instead
     of giving a place (Ryan, 2026-10-17). */
  function active(live) {
    players = players.filter(function (p) { return p.el.isConnected; });
    var best = null;
    for (var i = 0; i < players.length; i++) {
      var p = players[i];
      if (!p.started || (p.live && !live)) continue;
      var playing = p.state === 1, was = best && best.state === 1;
      if (!best || (playing && !was) || (playing === was && p.lastPlayed >= best.lastPlayed)) best = p;
    }
    return best;
  }

  function name(p) { return p.film || p.el.title || 'the film'; }
  // The player's own word first; a single video's address says it too.
  function idOf(p) {
    if (p.id) return p.id;
    var m = /\/embed\/([A-Za-z0-9_-]{11})(?:\?|$)/.exec(p.el.src || '');
    return m && !/[?&]list=/.test(p.el.src) ? m[1] : null;
  }
  /* The YouTube list a frame plays, out of its own address. A mix (RD…) is
     made afresh for each listener, so it is nobody's list but theirs and is
     not given: the next film in mine is not the next film in yours. */
  function listOf(p) {
    var m = /[?&]list=([A-Za-z0-9_-]+)/.exec(p.el.src || '');
    return m && !/^RD/.test(m[1]) ? m[1] : null;
  }
  function turning(p) { return !!(p.turning && Date.now() - p.turning.at < TURN); }

  /* Besides the film and the place: the list it is one of, its place in the
     list and the list's ids, whether the player is turning to another film
     in it (above), and paused and ended, because only a pause is somebody
     choosing to stop. A film that ended, or a next film that would not start,
     stopped by itself. */
  function where(opts) {
    var p = active(!!(opts && opts.live));
    if (!p) return null;
    // Buffering counts as playing: it is on its way, and a host's beacon
    // flickering to paused on every buffer would be noise on everybody's radio.
    // A live video has no place and no length to give.
    var w = p.live
      ? { time: null, duration: null, film: name(p), id: idOf(p), playing: p.state === 1 || p.state === 3, live: true }
      : { time: p.time, duration: p.duration || null, film: name(p), id: idOf(p), playing: p.state === 1 || p.state === 3, live: false };
    w.list = listOf(p);
    w.index = w.list && p.index != null ? p.index : null;
    w.ids = w.list && p.ids ? p.ids.slice() : null;
    w.turning = turning(p);
    w.paused = p.state === 2;
    w.ended = p.state === 0;
    return w;
  }

  function seek(seconds) {
    var p = active();
    if (!p || !(seconds >= 0)) return null;
    if (p.duration && seconds > p.duration) return { film: name(p), duration: p.duration, past: true };
    p.el.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'seekTo', args: [seconds, true], id: 1, channel: 'widget' }), YT);
    p.time = seconds;
    return { film: name(p), duration: p.duration || null, past: false };
  }

  /* PLAY AND PAUSE, for the CB's Follow the host, which is the one thing that
     may start or stop a film without a press on it, and only because the
     viewer switched Follow on themselves (Ryan's call, 2026-09-28). The same
     messages the IFrame Player API sends, spoken from here. Each returns the
     film it acted on, or null when this page has no started film. */
  function command(func) {
    var p = active();
    if (!p) return null;
    p.el.contentWindow.postMessage(JSON.stringify({ event: 'command', func: func, args: [], id: 1, channel: 'widget' }), YT);
    return { film: name(p) };
  }
  function play() { return command('playVideo'); }
  function pause() { return command('pauseVideo'); }

  /* EVERY FILM PLAYING ON THE PAGE, for the bodymind break (2026-10-24), live
     ones too: playing() says whether any is, and quiet() pauses each one, and
     only when somebody pressed Pause it on the break. Nothing here plays any
     of them again; whoever wants one back presses play on it. */
  function busy() {
    players = players.filter(function (q) { return q.el.isConnected; });
    return players.filter(function (q) { return q.state === 1 || q.state === 3; });
  }
  function playing() { return busy().length > 0; }
  function quiet() {
    busy().forEach(function (q) {
      q.el.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [], id: 1, channel: 'widget' }), YT);
    });
  }

  /* A FILM IN A LIST, for the CB's Follow and Catch up when the host's film
     is another film of a list this page is playing: the list goes to that
     film and that place in it in one message, YouTube's own loadPlaylist,
     which plays, or cuePlaylist, which waits. Measured 2026-10-20 on the live
     site: a cue to the third film at 90 s waited there, paused; a load to the
     sixth at 120 s played from there. So nothing has to seek in a film the
     player has not turned to yet, and Catch up can move a paused list without
     pressing play, which seek()'s rule asks. A list frame nobody has started
     yet (a browser that only cues on the first press) is moved too, and its
     own play button inside it then plays from there. Returns the film's place
     in the list, or null when no list here has that film in it. */
  function toEntry(video, seconds, playing, list) {
    if (!list || !VIDEO.test(video || '')) return null;
    players = players.filter(function (q) { return q.el.isConnected; });
    var p = active();
    if (!p || listOf(p) !== list) p = players.filter(function (q) { return listOf(q) === list && !q.live; })[0] || null;
    var at = p && p.ids ? p.ids.indexOf(video) : -1;
    if (at < 0) return null;
    p.el.contentWindow.postMessage(JSON.stringify({ event: 'command', func: playing ? 'loadPlaylist' : 'cuePlaylist',
      args: [{ list: list, listType: 'playlist', index: at, startSeconds: Math.max(0, Math.floor(seconds) || 0) }], id: 1, channel: 'widget' }), YT);
    p.turning = { from: p.index === at ? -1 : p.index, at: Date.now() };
    return { index: at };
  }

  /* A FRAME APART is one the CB never hears about: no enablejsapi, so the
     player says nothing to this page, and not tracked, so where(), Host this
     film, Follow and the break's Pause it all leave it alone. The bodymind
     break's forest is one, so that a host who takes a break and watches the
     forest does not start telling the room they are watching it. */
  function frameUrl(src, title, apart) {
    if (!src || !ORIGINS.some(function (o) { return src.indexOf(o) === 0; })) return null;
    var yt = src.indexOf(YT + '/') === 0 && !apart;
    if (yt && !/[?&]enablejsapi=/.test(src)) {
      src += (src.indexOf('?') < 0 ? '?' : '&') + 'enablejsapi=1&origin=' + encodeURIComponent(location.origin);
    }
    var el = document.createElement('iframe');
    if (yt) track(el);
    el.src = src;
    el.title = title || 'Embedded player';
    el.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen';
    // A call, and only a call, may ask for the camera, the microphone and a
    // shared screen: the frame says so here, and the page's policy says so
    // for this origin only. Both halves are needed, and neither alone works.
    if (src.indexOf(CALL) === 0) el.allow = 'autoplay; fullscreen; camera; microphone; display-capture; clipboard-write';
    el.setAttribute('allowfullscreen', '');
    el.setAttribute('loading', 'lazy');
    el.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    return el;
  }

  /* A PLACE TO START FROM, carried in by a spot on the CB. cb.js puts
     data-embed-start on the one play button a spot is about, and this is
     where it becomes YouTube's own start= on the frame the press builds, so
     the building stays in this file. A single video, or a list whose address
     names the film it opens on (/embed/<id>?list=, measured 2026-10-20:
     start=60 there opened that film a minute in and played on through the
     list). On /embed/videoseries, start= would land that far into whichever
     film comes first, which is a different film from the one the spot is
     about. "videoseries" is eleven letters, so it is refused by name. A mix
     (list=RD…) is refused too: it is made afresh for whoever presses it, and
     nobody has measured a start in one (the Rebellion Rave Room relies on it). */
  function withStart(src, start) {
    var n = parseInt(start, 10);
    if (!(n > 0) || src.indexOf(YT + '/embed/') !== 0 || /[?&]start=/.test(src)) return src;
    if (/[?&]list=/.test(src) && (/[?&]list=RD/.test(src) || !/\/embed\/(?!videoseries\?)[A-Za-z0-9_-]{11}\?/.test(src))) return src;
    return src + (src.indexOf('?') < 0 ? '?' : '&') + 'start=' + n;
  }

  /* A list got ready at one of its films: the CB's Follow and Catch up put
     data-embed-entry on the list's play button, and the frame the press
     builds opens on that film, because /embed/<id>?list= is the one form that
     moves where a list starts (Club Chronic measured it). Anything else is
     left as it is. */
  function atEntry(src, id) {
    if (!VIDEO.test(id || '') || !src || src.indexOf(YT + '/embed/') !== 0 || !/[?&]list=/.test(src)) return src;
    return src.replace(/^([^?]*\/embed\/)[^/?]+/, '$1' + id);
  }

  function frame(id, title, start, apart) {
    if (!id || !/^[A-Za-z0-9_-]{11}$/.test(id)) return null;
    var el = frameUrl(withStart('https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0', start), title, apart);
    if (!el) return null;
    el.title = title || 'Embedded video';
    return el;
  }

  /* THE ORIGINS THIS SITE WILL PLAY AUDIO FROM, and the same argument as the
     frame list above, one element over. A recording streamed from somebody
     else's server is still not hosted here -- "nothing musical is hosted here"
     stays true -- but it is a request to a third party, so it waits for the
     press like every frame does, and it is checked against this list like
     every frame is. make-csp.py reads THIS array for media-src exactly as it
     reads ORIGINS for frame-src, and make-small-hours.py reads it to refuse a
     track from anywhere else at build time. Adding a source is one edit here
     and a re-run of make-csp.py.

     Josephmooon's own site, where the band keeps both albums. The Small Hours'
     jukebox plays them from there, because Stimpunks helped produce them and
     the band's own shelf is where they belong.

     Wikimedia Commons' MP3 transcodes, and nothing else on that host. A Quiet
     Pint's player piano plays its rolls from there (2026-10-06): recordings of
     old piano rolls, each public domain on its own Commons page, streamed as
     the MP3 Commons makes of every audio file so Safari plays them too. The
     pub has no screen, and an <audio> strip is not one. */
  var AUDIO_ORIGINS = [
    'https://josephmooon.wordpress.com/wp-content/uploads/',
    'https://upload.wikimedia.org/wikipedia/commons/transcoded/'
  ];

  /* ONE RECORDING AT A TIME. A jukebox that let two songs play over each other
     because somebody pressed a second button would be the loud room this
     street keeps refusing, arriving through a click. Any audio this file built
     pauses the others when it starts. */
  function audio(src, title) {
    if (!src || !AUDIO_ORIGINS.some(function (o) { return src.indexOf(o) === 0; })) return null;
    var el = document.createElement('audio');
    el.src = src;
    el.controls = true;
    el.autoplay = true;
    el.preload = 'auto';
    el.setAttribute('aria-label', title || 'Recording');
    el.setAttribute('data-love-audio', '');
    el.addEventListener('play', function () {
      var all = document.querySelectorAll('audio[data-love-audio]');
      Array.prototype.forEach.call(all, function (other) {
        if (other !== el && !other.paused) other.pause();
      });
    });
    return el;
  }

  window.loveEmbed = { frame: frame, frameUrl: frameUrl, audio: audio, where: where, seek: seek, play: play, pause: pause, toEntry: toEntry, withStart: withStart, playing: playing, quiet: quiet };

  function swap(btn) {
    /* Named player, not `frame`: `var frame` here would be hoisted over the
       builder above it and the call on the line before would hit undefined. */
    var isAudio = !!btn.dataset.audioSrc;
    var player = isAudio
      ? audio(btn.dataset.audioSrc, btn.dataset.embedTitle)
      : btn.dataset.embedSrc
        ? frameUrl(withStart(atEntry(btn.dataset.embedSrc, btn.dataset.embedEntry), btn.dataset.embedStart), btn.dataset.embedTitle)
        : frame(btn.dataset.embedId, btn.dataset.embedTitle, btn.dataset.embedStart);
    if (!player) return;

    var shell = document.createElement('div');
    /* An audio player is a strip, not a screen, so its shell says so: the
       class is set HERE because the button's own classes do not survive the
       press (the Sweetgrass lesson), and §4 gives .facade--audio no 16:9. */
    /* A player whose own shape is a square (Tidal's square layout) says so on
       its button as data-embed-shape="square", read here for the same reason:
       in a 16:9 shell it would sit in a box of empty frame. One word, checked,
       so a button cannot hand the shell a class nobody styled. */
    shell.className = isAudio ? 'facade facade--audio'
      : btn.dataset.embedShape === 'square' ? 'facade facade--square' : 'facade';
    shell.style.padding = '0';
    shell.appendChild(player);
    btn.replaceWith(shell);
    player.focus();
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.facade');
    if (btn && btn.tagName === 'BUTTON') swap(btn);
  });
})();

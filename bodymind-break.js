/* =============================================================================
   The bodymind break: a calm screen over the whole page, from the CB.

   Helen Edgar's idea, 2026-10-24: the street is so busy, even at Gentle, that
   somewhere that is literally a blank, cool screen to regulate in would help,
   saying breathe, it will be okay, with the choice of watching a forest. Ryan's
   answer the same day: Cavendish Space has an "I need a bodymind break" button
   on almost every page, so put one in the CB, and have it open a simple,
   calming, biophilic screen with the forest on it. Then Helen: an I need help
   as well as a break, with our crisis lines; and Ryan: the button in the dial's
   How loud do you want it? box too, which Helen said yes to.

   It is furniture, the fractal window's kind: its own shadow root, its own
   stylesheet (bodymind-break.css) and its own colours (§2's --bbr-*), the same
   in every room, because a room's colours are what somebody is getting away
   from. The dial (love.js), the radio (cb.js) and the guest bar (guest.js) each
   have the button, and this file is not so much as downloaded until somebody
   presses it.

   What it promises, each of which is a sentence somebody may be relying on:

     · IT KEEPS NOTHING AND SENDS NOTHING. No storage of any kind, no request
       but its own stylesheet and, for the forest, love-embed.js, both from this
       site. tools/make-bodymind-break.py refuses this file otherwise.
     · NOTHING REACHES YOUTUBE UNTIL A FILM IS PRESSED, and the frame is
       built by love-embed.js, the only thing on this site that builds one. It
       is a frame apart (frame()'s `apart`): the CB never takes it for the film
       on the page, so a host's beacon cannot start announcing the forest.
     · NOTHING ON IT MOVES, AT ANY SETTING. Not at MAX GLITTER either: the
       dial is for the rooms, and this is where somebody goes to get away from
       them. No breathing circle, no drifting leaves; the forest moves only
       once it is pressed.
     · IT ASKS BEFORE IT STOPS ANYTHING. If a film or a recording on the page
       is playing, the break says so and offers to pause it, and pauses
       nothing by itself: somebody may have the Latibulum's ocean waves on
       because they want them. Nothing it paused starts again by itself.
     · THE WAY BACK IS ALWAYS THE SAME: I'm back, or Escape, and the keyboard
       goes back to the button that opened it. Closing it stops the forest.

   The radio says nothing aloud while it is open (Radio.prototype.speak asks
   window.loveBreak.open), and what arrived meanwhile is on the channel to read
   afterwards, not saved up to be spoken.
   ============================================================================= */
(function () {
  'use strict';

  /* What there is to watch, written by tools/make-bodymind-break.py out of
     data/bodymind-break.json: the forest Helen linked, and the jellies she
     asked for beside it (2026-10-24), and then, in her words, done. Never
     hand-edit between the markers. */
  /* break:films:begin */
  var FILMS = [{"id": "RzVvThhjAKw", "title": "Forest 4K • Nature Relaxation Film • Peaceful Relaxing Music", "channel": "Relaxation Film", "length": "3:00:52", "name": "Watch the forest", "what": "a forest, with streams, birdsong and soft piano", "cite": "Forest 4K", "by": "a nature film by Relaxation Film, with music by Richard Nomad"}, {"id": "eQ_foBERmzA", "title": "Live Jelly Cam", "channel": "Monterey Bay Aquarium", "live": true, "name": "Watch the jellies", "what": "jellies drifting in a tank at Monterey Bay Aquarium, live", "cite": "Live Jelly Cam", "by": "from Monterey Bay Aquarium's Open Sea exhibit"}];
  /* break:films:end */

  var api = { open: false, take: take };
  var host = null, root = null, dlg = null, from = null, ready = false, waiting = null;
  var page, heading, slot, pauseRow, pauseSaid, pauseBtn, awayBtn;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  var SVG = 'http://www.w3.org/2000/svg';
  function sv(tag, cls, attrs) {
    var e = document.createElementNS(SVG, tag);
    if (cls) e.setAttribute('class', cls);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  // love-embed.js, from this site, only once the forest is pressed. call.js's way.
  function withEmbed(then) {
    if (window.loveEmbed) { then(); return; }
    var s = document.createElement('script');
    s.src = '/love-embed.js';
    s.addEventListener('load', then);
    s.addEventListener('error', then);
    document.head.appendChild(s);
  }

  /* THE TREELINE: two rows of firs at the foot of the screen, far and near,
     barely darker than the mist they stand in. Drawn from a fixed seed, so it
     is the same treeline every time; it carries no word and is aria-hidden. */
  function treeline() {
    var svg = sv('svg', 'bbr-trees', { viewBox: '0 0 1200 240', preserveAspectRatio: 'xMidYMax slice', 'aria-hidden': 'true', focusable: 'false' });
    var seed = 20261024;
    function rnd() { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }
    function row(base, hMin, hMax, wMin, wMax) {
      var d = 'M-40 240L-40 ' + base, x = -40;
      while (x < 1240) {
        var w = wMin + rnd() * (wMax - wMin), h = hMin + rnd() * (hMax - hMin);
        d += 'L' + (x + w / 2).toFixed(1) + ' ' + (base - h).toFixed(1) + 'L' + (x + w).toFixed(1) + ' ' + base;
        x += w * (0.55 + rnd() * 0.3);
      }
      return d + 'L1240 240Z';
    }
    svg.appendChild(sv('path', 'bbr-far', { d: row(176, 34, 92, 30, 58) }));
    svg.appendChild(sv('path', 'bbr-near', { d: row(218, 58, 128, 42, 82) }));
    return svg;
  }

  /* THE PLATES, or the one film pressed. Each plate says how long it runs
     before the press, the street's rule for every play button; a live camera
     has no length to give, so it says it runs until you close it, the Jungle
     Room's rule, where the jellies live too. */
  function plate() {
    slot.textContent = '';
    if (awayBtn) awayBtn.hidden = true;
    var row = el('div', 'bbr-row');
    FILMS.forEach(function (f) {
      var b = el('button', 'bbr-play');
      b.type = 'button';
      b.appendChild(el('span', 'bbr-play__mark', '▶')).setAttribute('aria-hidden', 'true');
      var words = el('span', 'bbr-play__words');
      words.appendChild(el('span', 'bbr-play__name', f.name));
      words.appendChild(el('span', 'bbr-play__runs', f.live ? 'Live, runs until you close it' : 'Play — ' + f.length));
      b.appendChild(words);
      b.addEventListener('click', function () { film(f, b); });
      row.appendChild(b);
    });
    slot.appendChild(row);
  }
  function film(f, b) {
    b.disabled = true;
    withEmbed(function () {
      var frame = window.loveEmbed && window.loveEmbed.frame(f.id, f.channel + ' — ' + f.title, null, true);
      if (!frame) { b.disabled = false; return; }
      var screen = el('div', 'bbr-screen');
      screen.appendChild(frame);
      slot.textContent = '';
      slot.appendChild(screen);
      awayBtn.hidden = false;
      frame.focus();
    });
  }

  /* WHAT IS PLAYING ON THE PAGE BEHIND IT: a film love-embed.js is keeping
     track of, or any <audio> or <video>. Asked when the break opens, and only
     paused when somebody presses Pause it. */
  function media() { return Array.prototype.slice.call(document.querySelectorAll('audio, video')); }
  function playingHere() {
    var yt = !!(window.loveEmbed && window.loveEmbed.playing && window.loveEmbed.playing());
    return yt || media().some(function (m) { return !m.paused && !m.ended; });
  }
  function pauseHere() {
    if (window.loveEmbed && window.loveEmbed.quiet) window.loveEmbed.quiet();
    media().forEach(function (m) { if (!m.paused) m.pause(); });
    pauseBtn.hidden = true;
    pauseSaid.textContent = 'Paused. It stays paused until you press play on it again.';
  }

  function build() {
    host = el('div', 'bbr-host');
    root = host.attachShadow({ mode: 'open' });
    var sheet = document.createElement('link');
    sheet.rel = 'stylesheet';
    sheet.href = '/bodymind-break.css';
    function loaded() { ready = true; if (waiting) { var w = waiting; waiting = null; show(w); } }
    sheet.addEventListener('load', loaded);
    sheet.addEventListener('error', loaded);
    root.appendChild(sheet);

    dlg = el('dialog', 'bbr');
    dlg.setAttribute('aria-labelledby', 'bbr-h');
    dlg.setAttribute('aria-describedby', 'bbr-lead');
    dlg.appendChild(treeline());

    page = el('div', 'bbr-page');
    var col = el('div', 'bbr-col');
    heading = el('h2', 'bbr-h', 'Take a bodymind break');
    heading.id = 'bbr-h';
    heading.tabIndex = -1;
    var lead = el('div', 'bbr-lead');
    lead.id = 'bbr-lead';
    lead.appendChild(el('p', null, 'Nothing here needs you right now.'));
    lead.appendChild(el('p', null, 'Breathe. It will be okay.'));
    var stay = el('p', 'bbr-stay', 'Stay as long as you like: rest, move, stim, close your eyes, step away. The street will still be here when you come back.');

    /* I NEED HELP, NOT ONLY A BREAK (Helen's ask, the same day): our crisis
       lines, as a button-shaped link, and the Help page, in the words the
       Community Care room and Dead Tired Society already use for them. Nobody
       on the street is on call, so the break points to where somebody is. */
    var help = el('div', 'bbr-help');
    help.appendChild(el('p', null, 'If you need help now, not only a break:'));
    var row = el('div', 'bbr-row');
    var lines = el('a', 'bbr-link-btn', 'Crisis lines and warmlines');
    lines.href = 'https://stimpunks.org/fieldguide/coping/#h-crisis-hotlines';
    var doors = el('a', 'bbr-link-btn', 'Our Help page');
    doors.href = 'https://stimpunks.org/help/';
    row.appendChild(lines);
    row.appendChild(doors);
    help.appendChild(row);

    pauseRow = el('div', 'bbr-pause');
    pauseSaid = el('p', 'bbr-quiet', '');
    pauseSaid.setAttribute('role', 'status');
    pauseBtn = el('button', 'bbr-btn', 'Pause it');
    pauseBtn.type = 'button';
    pauseBtn.addEventListener('click', pauseHere);
    pauseRow.appendChild(pauseSaid);
    pauseRow.appendChild(pauseBtn);

    var wood = el('div', 'bbr-forest');
    wood.appendChild(el('p', 'bbr-quiet', 'If you would like something to look at, there is ' + FILMS.map(function (f) { return f.what; }).join(', or ') + '.'));
    slot = el('div', 'bbr-slot');
    wood.appendChild(slot);
    awayBtn = el('button', 'bbr-btn', 'Back to the quiet screen');
    awayBtn.type = 'button';
    awayBtn.hidden = true;
    awayBtn.addEventListener('click', function () { plate(); heading.focus(); });
    wood.appendChild(awayBtn);
    var credit = el('p', 'bbr-credit');
    FILMS.forEach(function (f, i) {
      credit.appendChild(el('cite', null, f.cite));
      credit.appendChild(document.createTextNode(', ' + f.by + (i < FILMS.length - 1 ? '; ' : '. ')));
    });
    credit.appendChild(document.createTextNode('Nothing reaches YouTube until you press play.'));
    wood.appendChild(credit);

    /* SOMEWHERE QUIET ON THE STREET (Helen's "a link to a relaxing place"):
       three rooms built for resting in, by name and nothing said about them,
       so a room changing its promise cannot make a sentence here false. */
    var quietRooms = el('p', 'bbr-quiet');
    quietRooms.appendChild(document.createTextNode('Or somewhere quiet on the street: '));
    [['/stay-frosty.html', 'Stay Frosty'], ['/healing-checkpoint.html', 'the Healing Checkpoint'], ['/latibulum.html', 'the Latibulum']].forEach(function (r, i, all) {
      var link = el('a', null, r[1]);
      link.href = r[0];
      quietRooms.appendChild(link);
      quietRooms.appendChild(document.createTextNode(i === all.length - 1 ? '.' : i === all.length - 2 ? ' or ' : ', '));
    });

    /* THE LOW-STIMULATION MODES (love.css §3), the dial's, offered here too,
       because this is where somebody overwhelmed already is. love.js's
       loveLow switches them and keeps the choice; this file keeps nothing. Not
       in the radio's own window, which has no love.js and no rooms to recolour. */
    var lowWrap = null;
    var L = window.loveLow;
    if (L && L.modes) {
      lowWrap = el('div', 'bbr-help');
      lowWrap.appendChild(el('p', 'bbr-quiet', 'Or put the whole street in a low-stimulation mode, every room in a few quiet colours and nothing moving:'));
      var lowRow = el('div', 'bbr-row');
      lowRow.setAttribute('role', 'group');
      lowRow.setAttribute('aria-label', 'Low-stimulation modes');
      var lowBtns = L.modes.map(function (low) {
        var b = el('button', 'bbr-btn', L.names[low]);
        b.type = 'button';
        b.addEventListener('click', function () { L.set(L.now() === low ? null : low); });
        lowRow.appendChild(b);
        return { low: low, b: b };
      });
      var lowOff = el('button', 'bbr-btn', 'The rooms’ own colours');
      lowOff.type = 'button';
      lowOff.addEventListener('click', function () { L.set(null); });
      lowRow.appendChild(lowOff);
      lowWrap.appendChild(lowRow);
      var lowShown = function () {
        var now = L.now();
        lowBtns.forEach(function (x) { x.b.setAttribute('aria-pressed', String(x.low === now)); });
        lowOff.hidden = !now;
      };
      lowShown();
      document.addEventListener('love-low', lowShown);
    }

    var more = el('p', 'bbr-quiet');
    more.appendChild(document.createTextNode('More, with ocean waves to breathe along with, on our '));
    var a = el('a', null, 'Bodymind Break');
    a.href = 'https://stimpunks.org/bodymind-break/';
    more.appendChild(a);
    more.appendChild(document.createTextNode(' page.'));

    var back = el('button', 'bbr-btn bbr-back', 'I’m back');
    back.type = 'button';
    back.addEventListener('click', function () { dlg.close(); });

    col.appendChild(heading);
    col.appendChild(lead);
    col.appendChild(stay);
    col.appendChild(help);
    col.appendChild(pauseRow);
    col.appendChild(wood);
    col.appendChild(quietRooms);
    if (lowWrap) col.appendChild(lowWrap);
    col.appendChild(more);
    col.appendChild(back);
    page.appendChild(col);
    dlg.appendChild(page);

    // Escape and I'm back both end here: the forest goes, and the keyboard
    // goes back to whatever opened the break.
    dlg.addEventListener('close', function () {
      api.open = false;
      plate();
      var to = from;
      from = null;
      if (to && to.isConnected && typeof to.focus === 'function') to.focus();
    });
    root.appendChild(dlg);
    document.body.appendChild(host);
  }

  function show(opener) {
    from = opener || document.activeElement;
    plate();
    var on = playingHere();
    pauseRow.hidden = !on;
    pauseBtn.hidden = !on;
    pauseSaid.textContent = on ? 'Something on this page is playing behind this.' : '';
    page.scrollTop = 0;
    dlg.showModal();
    api.open = true;
    heading.focus();
  }

  // Opened from the radio's or the guest bar's button; once the stylesheet is
  // here, so it never opens unstyled over the room.
  function take(opener) {
    if (dlg && dlg.open) return;
    if (!dlg) build();
    if (ready) show(opener);
    else waiting = opener || document.activeElement;
  }

  window.loveBreak = api;
})();

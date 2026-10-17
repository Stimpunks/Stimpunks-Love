/* =============================================================================
   A room's call: the window, and the moving code the radio shares.

   ITS OWN FILE, SO A GUEST CAN HAVE A CALL WITHOUT THE RADIO. Nobody who has
   not signed on to the CB ever downloads cb.js, and Cavendish Coworking's
   public rooms are for people who have not (Ryan, 2026-09-28). So the call
   window lives here: the radio loads this file and opens its room's call with
   it, and a public room's own page loads it and opens a call for a guest.
   The Mover is here too, because the radio and the call move the same way
   and must not become two copies.

   It asks this site's /cb/call for the address to frame: with the CB pass if
   this browser has one (read from love-cb, never written: signing on is the
   radio's job), or with the name a guest typed, which /cb/call only accepts
   for a public room. The frame is built by love-embed.js, the only thing here
   that builds one, loaded if the page has not already got it. Nothing about a
   call is kept, in this browser or anywhere of ours. Nothing moves.

   A CALL CAN GO INTO A WINDOW OF ITS OWN, AND THAT IS HOW ONE FOLLOWS YOU.
   Ryan, 2026-10-13, after the World call: every room is a page, and a page
   that goes takes its call with it. Pop out on a signed-on call's window opens
   call-window.html in a browser window of its own, which asks for the call
   afresh and holds it while you go from room to room in the window you came
   from. The two talk only inside this browser, over a BroadcastChannel: the
   call's window says which call it holds, the radio on any page asks and
   shows its button pressed, and pressing it again asks the window to hang up
   and close. Nothing about it is sent anywhere or kept.
   ============================================================================= */
(function () {
  'use strict';
  if (window.loveCall) return;

  var WINDOW = '/call-window.html';   // the page a popped-out call is held in
  var WINDOW_NAME = 'stimpunks-call'; // one such window at a time, found again by this name
  var STEP = 24;          // px per arrow press when moving by keyboard
  var HOME = 16;          // px from its corner that a radio or a call starts at
  var EDGE = 8;           // px a radio or a call keeps from the edge of the window

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  /* MOVING, for the radio and a room's call alike: drag the bar, or put the
     keyboard on Move and use the arrows, and Home puts it back in its corner.
     One copy, so the two cannot drift apart. The radio is anchored by its
     bottom right corner and the call by its bottom left, so `side` says which;
     pos holds the distance from that corner (x across, y up), null meaning the
     corner itself, and save is called when a move ends. A button on the bar
     other than Move does not start a drag.

     MOVE PRESSED WITHOUT A DRAG SAYS HOW IT WORKS. It used to do nothing at
     all, which reads as broken: the arrow keys were only described to a screen
     reader, and the drag's preventDefault kept a click from even focusing it.
     A tap on Move (or Enter or Space on it) now puts the keyboard on Move, so
     the arrows work at once, and calls `pressed`, which each window answers in
     its own words and its own place. A click after a real drag does not count. */
  function Mover(box, bar, moveBtn, pos, side, held, save, pressed) {
    var me = this;
    this.box = box; this.pos = pos; this.side = side; this.save = save || function () {};
    var how = pressed || function () {};
    moveBtn.addEventListener('keydown', function (e) { me.key(e); });
    // Enter or Space: a click with no pointer behind it. A pointer's is handled in drop.
    moveBtn.addEventListener('click', function (e) { if (e.detail === 0) how(); });
    var start = null;
    bar.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || (e.target.closest('button') && e.target !== moveBtn)) return;
      var p = me.place();
      start = { px: e.clientX, py: e.clientY, x: p.x, y: p.y, id: e.pointerId,
                onMove: e.target === moveBtn, moved: false };
      bar.setPointerCapture(e.pointerId);
      box.classList.add(held);
      e.preventDefault();
    });
    bar.addEventListener('pointermove', function (e) {
      if (!start || e.pointerId !== start.id) return;
      var dx = e.clientX - start.px, dy = e.clientY - start.py;
      if (Math.abs(dx) + Math.abs(dy) > 3) start.moved = true;
      me.pos.x = me.side === 'right' ? start.x - dx : start.x + dx;
      me.pos.y = start.y - dy;
      me.place();
    });
    function drop(e) {
      if (!start || e.pointerId !== start.id) return;
      var tapped = start.onMove && !start.moved;
      start = null;
      box.classList.remove(held);
      var q = me.place();
      me.pos.x = q.x; me.pos.y = q.y;
      me.save();
      if (tapped) { moveBtn.focus(); how(); }
    }
    bar.addEventListener('pointerup', drop);
    bar.addEventListener('pointercancel', drop);
  }

  Mover.prototype.place = function () {
    var s = this.pos, b = this.box;
    // A margin is room kept beside the box for what hangs off its sides: a
    // radio theme's side drawings, which the radio says it has.
    var side = EDGE + (this.margin ? this.margin() : 0);
    var maxX = Math.max(side, window.innerWidth - b.offsetWidth - side);
    var maxY = Math.max(EDGE, window.innerHeight - b.offsetHeight - EDGE);
    var x = Math.min(Math.max(side, s.x == null ? HOME : s.x), maxX);
    var y = Math.min(Math.max(EDGE, s.y == null ? HOME : s.y), maxY);
    b.style[this.side] = x + 'px';
    b.style.bottom = y + 'px';
    return { x: x, y: y };
  };

  Mover.prototype.key = function (e) {
    var s = this.pos, p = this.place(), k = e.key, out = this.side === 'right' ? 1 : -1;
    if (k === 'ArrowLeft') s.x = p.x + STEP * out;
    else if (k === 'ArrowRight') s.x = p.x - STEP * out;
    else if (k === 'ArrowUp') s.y = p.y + STEP;
    else if (k === 'ArrowDown') s.y = p.y - STEP;
    else if (k === 'Home') { s.x = null; s.y = null; }
    else return;
    e.preventDefault();
    var q = this.place();
    if (s.x != null) s.x = q.x;
    if (s.y != null) s.y = q.y;
    this.save();
  };


  function withEmbed(then) {
    if (window.loveEmbed) { then(); return; }
    var s = document.createElement('script');
    s.src = '/love-embed.js';
    s.addEventListener('load', then);
    s.addEventListener('error', then);
    document.head.appendChild(s);
  }

  function cbPass() {
    try { var v = JSON.parse(localStorage.getItem('love-cb') || 'null'); return v && v.pass ? v.pass : null; }
    catch (e) { return null; }
  }

  /* COLOUR SCHEMES (Ryan, 2026-10-17, from a request). The radio, the call
     window and the guest bar wear one, on their shadow root's host as
     data-scheme, which cb.css lays over the radio's seven colours. This is the
     one place that decides which: what somebody chose under Your radio, kept
     in love-cb as scheme, or, for Match my device (auto, and what nobody has
     chosen means), High contrast where the device asks for more contrast,
     Daylight where it is set light, and Amber otherwise, followed as the
     device changes. guest.js keeps a copy of schemeFor('auto') for the guest
     bar, which never loads this file: change both. */
  /* Each is [key, name, group, what it is after, its drawing: 'moves' for one
     that moves at MAX GLITTER or when let, 'still' for one that never does].
     The worlds are Ryan's list of 2026-10-17, for "a really personal and fun
     experience": each says what it is after, so the credit is on the radio's
     own line when it is chosen, and cb-themes.js draws the ones with a
     drawing into the radio's trim. */
  var SCHEMES = [
    ['auto', 'Match my device', 'every'], ['amber', 'Amber', 'every'], ['day', 'Daylight', 'every'],
    ['high', 'High contrast', 'every'],
    ['soldark', 'Solarized dark', 'every', 'Ethan Schoonover\u2019s Solarized palette, with a darker bar so every word clears 4.5 to 1', 'still'],
    ['sollight', 'Solarized light', 'every', 'Ethan Schoonover\u2019s Solarized palette, its accents darkened for words so they clear 4.5 to 1', 'still'],
    ['green', 'Green screen', 'radio'], ['red', 'Red readout', 'radio'], ['teal', 'Teal glow', 'radio'],
    ['biophilic', 'Biophilic', 'world', 'queering.earth\u2019s paper, moss and rust, with ivy and mushrooms growing after Helen Edgar\u2019s garden in the Faery Yurt', 'moves'],
    ['starstuff', 'Star Stuff', 'world', 'starstuff.earth, our sister site, and its night', 'moves'],
    ['lcars', 'LCARS', 'world', 'the computer screens of Star Trek: The Next Generation, designed by Michael Okuda. Star Trek is a trade mark of CBS Studios', 'moves'],
    ['glitter', 'Max Glitter', 'world', 'the street\u2019s own colours, every one at once, with sparkles', 'moves'],
    ['solarpunk', 'Solarpunk', 'world', 'art nouveau\u2019s vines grown round sunflowers and a solar panel', 'moves'],
    ['biomech', 'Biomechanical', 'world', 'H. R. Giger\u2019s biomechanics: bone and tube grown together, drawn here and copied from nothing of his', 'moves'],
    ['greeble', 'Greeble', 'world', 'the greebles, small parts glued onto models, that made the spaceships of Star Wars look built. Star Wars is a trade mark of Lucasfilm', 'moves'],
    ['cyborg', 'Crip Cyborg', 'world', 'disabled people who live with their tech: a CPAP hose, an oxygen line, oxygen on a rack, a PEG tube and its port, and a prosthetic leg', 'moves'],
    ['unicorn', 'Unicorn Poop', 'world', 'as much rainbow as will fit, and gradients for no reason', 'moves'],
    ['wabi', 'Wabi-sabi', 'world', 'what is stained, weathered and mended: a tea ring, a brush stroke, and a crack mended in gold. Nothing in it moves', 'still'],
    /* THE WINAMP SKINS (Ryan, 2026-10-17): after twelve skins in the Winamp
       Skin Museum, each credited to whoever its readme says made it, or saying
       that it names nobody. Every drawing is ours and copies no bitmap of a
       skin's, and nothing from the games and machines the skins were after. */
    ['zelda', 'Zelda Amp', 'skin', 'Zelda Amp III, LuigiHann\u2019s Winamp skin. The Legend of Zelda is a trade mark of Nintendo, and the drawing is ours: hearts, hedges and stone, and nobody from the game', 'moves'],
    ['microchip', 'Microchip', 'skin', 'Microchip 2, Vad3K\u2019s Winamp skin, something between a computer\u2019s circuit board and a calculator\u2019s', 'moves'],
    ['ascii', 'ASCII-Amp', 'skin', 'ASCII-Amp 2.0, Pabo Wakataeo\u2019s Winamp skin made of typed characters', 'moves'],
    ['sml', 'Super Mario Land Amp', 'skin', 'Super Mario Land Amp, ronz\u2019s Winamp skin of 2000. Super Mario Land is a trade mark of Nintendo, and the drawing is ours: bricks, pipes and pyramids, and nobody from the game', 'moves'],
    ['digdug', 'Dig Dug Amp', 'skin', 'Dig Dug Amp, a Winamp skin of 2001 whose readme names its maker only by an email address, so we name the skin. Dig Dug is a trade mark of Bandai Namco Entertainment, and the drawing is ours: the layers of earth and the tunnels, and nobody from the game', 'moves'],
    ['deviant', 'deviantAMP', 'skin', 'deviantAMP, sasso\u2019s first Winamp skin, of 2001, after deviantART\u2019s pages of the time. deviantART is a trade mark of DeviantArt', 'still'],
    ['hp49g', 'HP 49G', 'skin', 'hpcalc_hp49g, Arne Olav Storflor\u2019s Winamp skin of his own HP 49G calculator. HP is a trade mark of HP Inc.', 'moves'],
    ['mario', 'Winamp Mario', 'skin', 'winamp_mario, a Winamp skin with no readme and no maker named in it. Super Mario Bros. is a trade mark of Nintendo, and the drawing is ours: sky, bricks, coins and clouds, and nobody from the game', 'moves'],
    ['cube', 'The Cube', 'skin', 'the Cube v2, Kuki\u2019s Winamp skin of green cubes. Kuki asked that nothing of it be republished, and nothing is: these cubes are drawn for the radio', 'moves'],
    ['pipboy', 'Pip-Boy 3000', 'skin', 'Fallout Pip-Boy 3000 Green, the Winamp skin by shadesmaclean (Neko-Sen\u2019nin) of Spooky Door Productions. Fallout and Pip-Boy are trade marks of Bethesda Softworks, and the drawing is ours', 'moves'],
    ['gameboy', 'Game Boy', 'skin', 'gameboy, a Winamp skin with no readme and no maker named in it, and the handheld\u2019s four greens. Game Boy is a trade mark of Nintendo', 'moves'],
    ['ti82', 'TI-82', 'skin', 'TI-82 v1.1, the Winamp skin by bLy (Erik Waldner) of 2000. TI-82 is a trade mark of Texas Instruments', 'moves']
  ];
  function known(k) { return SCHEMES.some(function (x) { return x[0] === k && k !== 'auto'; }); }
  /* A THEME'S DRAWING MOVES at MAX GLITTER by itself, and at any other setting
     once somebody has pressed Let my theme move, the candles' rule behind the
     door marked E: the dial decides what moves unasked, and a press is an
     ask. It is data-motion on the host, which cb.css reads, and it follows the
     dial as it turns. Nothing on the radio moves when a message lands. */
  function dial() { return document.documentElement.getAttribute('data-intensity') || 'regular'; }
  function letMove() {
    try { var v = JSON.parse(localStorage.getItem('love-cb') || 'null'); return !!(v && v.motion); }
    catch (e) { return false; }
  }
  function media(q) { try { return window.matchMedia(q).matches; } catch (e) { return false; } }
  function schemeFor(choice) {
    if (known(choice)) return choice;
    return media('(prefers-contrast: more)') ? 'high' : media('(prefers-color-scheme: light)') ? 'day' : 'amber';
  }
  function chosen() {
    try { var v = JSON.parse(localStorage.getItem('love-cb') || 'null'); return (v && v.scheme) || 'auto'; }
    catch (e) { return 'auto'; }
  }
  var dressed = [];
  function dress(host, choice) {
    host.cbScheme = choice || 'auto';
    if (dressed.indexOf(host) < 0) dressed.push(host);
    host.setAttribute('data-scheme', schemeFor(host.cbScheme));
    host.setAttribute('data-motion', dial() === 'max' || letMove() ? 'on' : 'off');
  }
  function redress(choice) {
    dressed = dressed.filter(function (h) { return h.isConnected; });
    dressed.forEach(function (h) { dress(h, choice == null ? h.cbScheme : choice); });
  }
  ['(prefers-contrast: more)', '(prefers-color-scheme: light)'].forEach(function (q) {
    try { window.matchMedia(q).addEventListener('change', function () { redress(); }); } catch (e) { /* an old browser keeps the scheme it opened with */ }
  });
  try {
    new MutationObserver(function () { redress(); })
      .observe(document.documentElement, { attributes: true, attributeFilter: ['data-intensity'] });
  } catch (e) { /* the drawing keeps the motion it opened with */ }

  /* how.whole: this is the call's own window, so the call fills it, and
     there is nothing to move or size (the window itself is moved and sized).
     how.pop: Pop out, offered to somebody signed on, which answers false if
     the browser stopped the window opening. */
  function callWindow(here, frame, leaveIt, how) {
    how = how || {};
    var whole = !!how.whole;
    var host = el('div', 'cb-call-host');
    dress(host, chosen());
    var root = host.attachShadow({ mode: 'open' });
    var sheet = document.createElement('link');
    sheet.rel = 'stylesheet';
    sheet.href = '/cb.css';
    root.appendChild(sheet);
    var box = el('section', 'cb-call' + (whole ? ' cb-call--whole' : ''));
    box.setAttribute('aria-label', here.title || 'Call in ' + here.name);
    var bar = el('div', 'cb-call-bar');
    var name = el('p', 'cb-call-name');
    name.appendChild(el('span', 'cb-brand', 'CALL'));
    name.appendChild(document.createTextNode(' ' + here.name));
    bar.appendChild(name);
    /* THREE SIZES, and the frame is only ever resized, never rebuilt, so the
       call carries on through every change. Small is a tile in the corner, so
       a film on the page can be watched beside the people in the call (Ryan,
       2026-09-28); Large is the whole window. Small and Large each toggle back
       to the middle size, the radio's Small button's pattern. Not remembered:
       nothing about a call is kept, in the browser either. */
    // Moves like the radio, with the radio's own Mover. Not remembered either.
    var move = el('button', 'cb-btn cb-move', 'Move');
    move.type = 'button';
    move.setAttribute('aria-describedby', 'cb-call-move-how');
    var moveHow = el('span', 'sr', 'Arrow keys move the call. Home puts it back in the corner.');
    moveHow.id = 'cb-call-move-how';
    var small = el('button', 'cb-btn', 'Small');
    var big = el('button', 'cb-btn', 'Large');
    var leave = el('button', 'cb-btn cb-call-leave', 'Leave the call');
    var mover = null;
    function size(to) {
      box.classList.toggle('cb-call--small', to === 'small');
      box.classList.toggle('cb-call--large', to === 'large');
      small.setAttribute('aria-pressed', String(to === 'small'));
      big.setAttribute('aria-pressed', String(to === 'large'));
      leave.textContent = to === 'small' ? 'Leave' : 'Leave the call';
      // Placed again at once, not only when the ResizeObserver gets round to
      // it: a call moved to a corner and made Large hung off the screen until
      // then, and a hidden tab never gets round to it at all.
      if (mover) mover.place();
    }
    small.type = big.type = leave.type = 'button';
    leave.setAttribute('aria-label', 'Leave the call');
    small.addEventListener('click', function () { size(box.classList.contains('cb-call--small') ? 'regular' : 'small'); });
    big.addEventListener('click', function () { size(box.classList.contains('cb-call--large') ? 'regular' : 'large'); });
    leave.addEventListener('click', function () { leaveIt(); });
    // What Move or Pop out says when pressed; it goes again after a while.
    var moveSaid = el('p', 'cb-call-note cb-call-said');
    moveSaid.setAttribute('role', 'status');
    moveSaid.hidden = true;
    var moveSaidFor = null;
    function note(s) {
      moveSaid.textContent = s;
      moveSaid.hidden = false;
      clearTimeout(moveSaidFor);
      moveSaidFor = setTimeout(function () { moveSaid.hidden = true; }, 8000);
    }
    /* POP OUT moves the call into a window of its own, which stays open while
       you go from room to room in this one. The call here hangs up and the
       new window asks for it afresh, on 8x8's first screen again, because a
       frame cannot be carried from one window to another without starting
       over. Not at Small, where the bar has no room for it. */
    var pop = null;
    if (how.pop) {
      pop = el('button', 'cb-btn cb-call-pop', 'Pop out');
      pop.type = 'button';
      var popHow = el('span', 'sr', 'Moves the call into a window of its own, which stays open while you go from room to room. You join again there.');
      popHow.id = 'cb-call-pop-how';
      pop.setAttribute('aria-describedby', 'cb-call-pop-how');
      pop.addEventListener('click', function () {
        if (!how.pop()) note('Your browser stopped the window opening. Allow pop-ups for stimpunks.world to pop the call out, or stay in it here.');
      });
    }
    if (!whole) { bar.appendChild(move); bar.appendChild(moveHow); }
    if (pop) { bar.appendChild(pop); bar.appendChild(popHow); }
    if (!whole) { bar.appendChild(small); bar.appendChild(big); }
    bar.appendChild(leave);
    size('regular');
    box.appendChild(bar);
    box.appendChild(moveSaid);
    box.appendChild(el('p', 'cb-call-note', whole
      ? 'This window keeps the call while you go from room to room in the one you came from. Closing it hangs up. While you are in the call, stimpunks.world keeps your name in it, until you leave.'
      : 'Leaving this page hangs up. While you are in the call, stimpunks.world keeps your name in it, until you leave.'));
    /* WHO IS IN THE CALL, just above 8x8's own Join button, which is where
       somebody is looking when they decide (Ryan, 2026-09-29). call.js never
       asks for it: cb.js fills it from the answer the radio already gets, under
       the radio's rule, so a guest with no radio never sees it and it stays
       hidden. Not a live region: it is redrawn every few seconds. */
    var who = el('p', 'cb-call-note cb-call-who');
    who.hidden = true;
    box.appendChild(who);
    var screen = el('div', 'cb-call-screen');
    screen.appendChild(frame);
    box.appendChild(screen);
    root.appendChild(box);
    document.body.appendChild(host);
    if (whole) {
      leave.focus();
      return { host: host, room: here.tag, who: who, off: function () {} };
    }
    mover = new Mover(box, bar, move, { x: null, y: null }, 'left', 'cb-call--held', null, function () {
      note('Drag the bar to move the call, or use the arrow keys while Move has the keyboard. Home puts it back in the corner.');
    });
    function put() { mover.place(); }
    window.addEventListener('resize', put);
    // Small and Large change its size, so it is placed again to keep it on the screen.
    var watch = window.ResizeObserver ? new ResizeObserver(put) : null;
    if (watch) watch.observe(box);
    put();
    leave.focus();
    return { host: host, room: here.tag, who: who, off: function () { window.removeEventListener('resize', put); if (watch) watch.disconnect(); } };
  }

  var current = null;

  /* why: nothing when somebody pressed Leave, 'switch' when another call is
     taking this one's place, 'away' when it has popped out into its own
     window. Whatever opened it is told which. */
  function leave(why) {
    if (!current) return;
    var c = current;
    current = null;
    c.off();
    c.host.remove();
    if (isWindow) say();
    if (c.left) c.left(why);
  }

  /* ── The call's own window, and the line to it ─────────────────────────
     isWindow: this page is call-window.html. away: on any other page, the
     call a window of its own holds, as that window last said ({tag, name,
     title}), or null. Only inside this browser, and only while both are open. */
  var line = typeof BroadcastChannel === 'function' ? new BroadcastChannel('love-call') : null;
  var isWindow = false, holding = null, away = null, listeners = [];
  function say() {
    if (!line || !isWindow) return;
    var r = current ? holding : null;
    line.postMessage({ window: r ? { tag: r.tag, name: r.name, title: r.title || '' } : null });
  }
  function heard(r) {
    away = r && typeof r.tag === 'string' ? r : null;
    listeners.forEach(function (fn) { fn(away); });
  }
  if (line) line.onmessage = function (e) {
    var d = e.data || {};
    if (isWindow) {
      if (d.ask) say();
      if (d.leave && current && current.room === d.leave) leave();
      return;
    }
    if ('window' in d) heard(d.window);
  };
  // The window's call goes when the window does.
  window.addEventListener('pagehide', function () { if (isWindow && line) line.postMessage({ window: null }); });

  function popOut(room) {
    var q = 'tag=' + encodeURIComponent(room.tag) + '&name=' + encodeURIComponent(room.name) +
      (room.title ? '&title=' + encodeURIComponent(room.title) : '');
    var w = null;
    try { w = window.open(WINDOW + '#' + q, WINDOW_NAME, 'popup,width=760,height=680'); } catch (e) { w = null; }
    if (!w) return false;
    // Said at once, so the radio shows where the call went; the window says it
    // again once it is up, and says null if it could not open the call.
    heard({ tag: room.tag, name: room.name, title: room.title || '' });
    if (current && current.room === room.tag) leave('away');
    return true;
  }

  /* Bring the window to the front. window.open with no address finds a window
     by its name without loading anything into it; if there is none, the
     browser makes a blank one, which is closed again at once. */
  function showAway() {
    var w = null;
    try { w = window.open('', WINDOW_NAME); } catch (e) { w = null; }
    if (!w) return false;
    var ours = false;
    try { ours = w.location.pathname === WINDOW; } catch (e) { ours = false; }
    if (!ours) { try { w.close(); } catch (e) { /* gone */ } heard(null); return false; }
    try { w.focus(); } catch (e) { /* the browser decides */ }
    return true;
  }

  // Ask the window to hang up and close.
  function leaveAway() {
    if (line && away) line.postMessage({ leave: away.tag });
    heard(null);
  }

  // The radio's way to hear about the window, asked once when it starts.
  function onAway(fn) {
    listeners.push(fn);
    if (line) line.postMessage({ ask: true });
  }

  /* Open a room's call. room is {tag, name}, and a call that is no one room's,
     the World call, brings its own title as well; opts.guest is the name a guest
     typed, for a public room with no CB pass; opts.left runs after the call
     is left, so whatever opened it can take the keyboard back. It answers
     with {ok, said, status}: said is a sentence for the opener to show. */
  function open(room, opts) {
    opts = opts || {};
    if (opts.whole) isWindow = true;
    // One call at a time, here or in a window of its own: joining one in this
    // page hangs up the one in the window, once this one has opened.
    var hungUp = false;
    var pass = cbPass(), headers = { 'accept': 'application/json', 'content-type': 'application/json' };
    if (pass) headers.authorization = 'Bearer ' + pass;
    var b = { room: room.tag };
    if (!pass && opts.guest) b.name = opts.guest;
    return fetch('/cb/call', { method: 'POST', headers: headers, body: JSON.stringify(b), credentials: 'omit', cache: 'no-store' })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (body) { return { status: r.status, body: body }; }); })
      .then(function (r) {
        if (r.status !== 200 || !r.body.src) {
          // The call's own window says it holds nothing, so no radio shows it held.
          if (opts.whole) say();
          var said = r.body && typeof r.body.error === 'string' && r.body.error ? r.body.error
            : r.status === 404 ? 'Calls only answer on stimpunks.world itself.'
            : 'The call could not be opened. Try again in a moment.';
          return { ok: false, status: r.status, said: said };
        }
        return new Promise(function (done) {
          withEmbed(function () {
            var frame = window.loveEmbed && window.loveEmbed.frameUrl(r.body.src, room.title || 'The call in ' + room.name);
            if (!frame) { if (opts.whole) say(); done({ ok: false, said: 'The call could not be opened on this page.' }); return; }
            if (!opts.whole && away) { leaveAway(); hungUp = true; }
            leave('switch');
            current = callWindow(room, frame, leave, {
              whole: !!opts.whole,
              // Signed on only: the window asks with the pass, and a guest has none.
              pop: pass && !opts.whole && line ? function () { return popOut(room); } : null
            });
            current.left = opts.left;
            holding = room;
            say();
            done({ ok: true, said: (hungUp ? 'The call in its own window has been hung up. ' : '') + 'The call is open at the foot of the page. Your browser may ask about your camera and microphone so its first screen can show a preview; both start off, and nothing goes to the call until you join there.' });
          });
        });
      })
      .catch(function () { if (opts.whole) say(); return { ok: false, said: 'No signal. The call could not be opened.' }; });
  }

  // The who-is-in-the-call line of the window open for this room, if one is.
  function whoLine(tag) { return current && current.room === tag ? current.who : null; }

  // Which call is open, by its room's tag, so a button can tell its own call
  // from another: the radio has this room's and the World's.
  function openRoom() { return current ? current.room : null; }

  window.loveCall = { Mover: Mover, open: open, leave: leave, isOpen: function () { return !!current; }, openRoom: openRoom, whoLine: whoLine,
    away: function () { return away; }, onAway: onAway, showAway: showAway, leaveAway: leaveAway,
    schemes: SCHEMES, schemeFor: schemeFor, dress: dress, redress: redress };
})();

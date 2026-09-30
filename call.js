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
   ============================================================================= */
(function () {
  'use strict';
  if (window.loveCall) return;

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
     other than Move does not start a drag. */
  function Mover(box, bar, moveBtn, pos, side, held, save) {
    var me = this;
    this.box = box; this.pos = pos; this.side = side; this.save = save || function () {};
    moveBtn.addEventListener('keydown', function (e) { me.key(e); });
    var start = null;
    bar.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || (e.target.closest('button') && e.target !== moveBtn)) return;
      var p = me.place();
      start = { px: e.clientX, py: e.clientY, x: p.x, y: p.y, id: e.pointerId };
      bar.setPointerCapture(e.pointerId);
      box.classList.add(held);
      e.preventDefault();
    });
    bar.addEventListener('pointermove', function (e) {
      if (!start || e.pointerId !== start.id) return;
      var dx = e.clientX - start.px;
      me.pos.x = me.side === 'right' ? start.x - dx : start.x + dx;
      me.pos.y = start.y - (e.clientY - start.py);
      me.place();
    });
    function drop(e) {
      if (!start || e.pointerId !== start.id) return;
      start = null;
      box.classList.remove(held);
      var q = me.place();
      me.pos.x = q.x; me.pos.y = q.y;
      me.save();
    }
    bar.addEventListener('pointerup', drop);
    bar.addEventListener('pointercancel', drop);
  }

  Mover.prototype.place = function () {
    var s = this.pos, b = this.box;
    var maxX = Math.max(EDGE, window.innerWidth - b.offsetWidth - EDGE);
    var maxY = Math.max(EDGE, window.innerHeight - b.offsetHeight - EDGE);
    var x = Math.min(Math.max(EDGE, s.x == null ? HOME : s.x), maxX);
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

  function callWindow(here, frame, leaveIt) {
    var host = el('div', 'cb-call-host');
    var root = host.attachShadow({ mode: 'open' });
    var sheet = document.createElement('link');
    sheet.rel = 'stylesheet';
    sheet.href = '/cb.css';
    root.appendChild(sheet);
    var box = el('section', 'cb-call');
    box.setAttribute('aria-label', 'Call in ' + here.name);
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
    bar.appendChild(move);
    bar.appendChild(moveHow);
    bar.appendChild(small);
    bar.appendChild(big);
    bar.appendChild(leave);
    size('regular');
    box.appendChild(bar);
    box.appendChild(el('p', 'cb-call-note', 'Leaving this page hangs up. While you are in the call, stimpunks.world keeps your name in it, until you leave.'));
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
    mover = new Mover(box, bar, move, { x: null, y: null }, 'left', 'cb-call--held');
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

  function leave() {
    if (!current) return;
    var c = current;
    current = null;
    c.off();
    c.host.remove();
    if (c.left) c.left();
  }

  /* Open a room's call. room is {tag, name}; opts.guest is the name a guest
     typed, for a public room with no CB pass; opts.left runs after the call
     is left, so whatever opened it can take the keyboard back. It answers
     with {ok, said, status}: said is a sentence for the opener to show. */
  function open(room, opts) {
    opts = opts || {};
    var pass = cbPass(), headers = { 'accept': 'application/json', 'content-type': 'application/json' };
    if (pass) headers.authorization = 'Bearer ' + pass;
    var b = { room: room.tag };
    if (!pass && opts.guest) b.name = opts.guest;
    return fetch('/cb/call', { method: 'POST', headers: headers, body: JSON.stringify(b), credentials: 'omit', cache: 'no-store' })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (body) { return { status: r.status, body: body }; }); })
      .then(function (r) {
        if (r.status !== 200 || !r.body.src) {
          var said = r.body && typeof r.body.error === 'string' && r.body.error ? r.body.error
            : r.status === 404 ? 'Calls only answer on stimpunks.world itself.'
            : 'The call could not be opened. Try again in a moment.';
          return { ok: false, status: r.status, said: said };
        }
        return new Promise(function (done) {
          withEmbed(function () {
            var frame = window.loveEmbed && window.loveEmbed.frameUrl(r.body.src, 'The call in ' + room.name);
            if (!frame) { done({ ok: false, said: 'The call could not be opened on this page.' }); return; }
            leave();
            current = callWindow(room, frame, leave);
            current.left = opts.left;
            done({ ok: true, said: 'The call is open at the foot of the page. Your browser may ask about your camera and microphone so its first screen can show a preview; both start off, and nothing goes to the call until you join there.' });
          });
        });
      })
      .catch(function () { return { ok: false, said: 'No signal. The call could not be opened.' }; });
  }

  // The who-is-in-the-call line of the window open for this room, if one is.
  function whoLine(tag) { return current && current.room === tag ? current.who : null; }

  window.loveCall = { Mover: Mover, open: open, leave: leave, isOpen: function () { return !!current; }, whoLine: whoLine };
})();

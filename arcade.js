/* =============================================================================
   Quill Drift — the one cabinet in the Arcade (room seven).

   THE RULE THIS GAME IS BUILT OUT OF: a porcupine cannot shoot a quill. Not
   throw it, not fire it, not launch it — the quill comes away in whatever
   touched it, and an attacker has to come to the animal. A spiky mascot invites
   exactly the opposite reading, which is why the Quillery gives that correction
   a card of its own, and why this file has no verb for it. CONTACT IS THE ONLY
   MECHANIC. There is nothing to aim, nothing to press but a direction, and
   nothing on the field but Esmx and the quills.

   It also has no clock, no lives, no score, no fail state and no audio, and it
   stores nothing. What it has is a count that only goes up and a mane you can
   empty whenever you like.

   ENHANCEMENT ONLY. The coin, the pad and the knobs ship hidden in arcade.html
   and this reveals them, so a visitor without JavaScript gets a room that
   explains its own game rather than a cabinet of dead buttons. Everything the
   game says, it says in words into #arcade-says as well as in colour on the
   screen — colour is never the only channel here, and a mane nobody can read is
   a mane nobody can tell anybody about.

   NO transform IS USED TO MOVE ANYTHING. Positions are left/top in per cent of
   the field, so tools/check-gentle.py can read every element in this room and
   find no rotation anywhere, at any dial setting. The one transform on the
   sprite is the centring translate and a scaleX(-1) when Esmx turns round, both
   of which that checker reads as layout and neither of which is a wobble.
   ============================================================================= */
(function () {
  'use strict';

  var field = document.getElementById('field');
  if (!field) return;

  var esmx    = document.getElementById('esmx');
  var attract = document.getElementById('attract');
  var coin    = document.getElementById('coin');
  var rest    = document.getElementById('rest');
  var shake   = document.getElementById('shake');
  var says    = document.getElementById('arcade-says');
  var count   = document.getElementById('mane-count');
  var strip   = document.getElementById('mane-strip');
  var list    = document.getElementById('mane-list');
  var take    = document.getElementById('take');
  var takeSay = document.getElementById('take-words');
  var nojs    = document.getElementById('attract-nojs');

  var SLOTS = 12;

  /* Eight colours, each with a NAME, because the name is what goes into the
     live region and into the written mane. They are the spectrum-and-flag mix
     Kaya's notes describe; every one of them clears 4.5:1 on both grounds the
     scanlines make, and they are in tools/check-contrast.py under that name. */
  var QUILLS = [
    { name: 'coral',     hex: '#FF5A4E' },
    { name: 'tangerine', hex: '#FF9B2F' },
    { name: 'gold',      hex: '#FFD93D' },
    { name: 'lime',      hex: '#5CE86B' },
    { name: 'mint',      hex: '#4BF0C6' },
    { name: 'sky',       hex: '#49D8FF' },
    { name: 'violet',    hex: '#B98BFF' },
    { name: 'rose',      hex: '#FF7AC8' }
  ];

  /* A per cent of the field's height is not the same distance as a per cent of
     its width, so everything below measures in width-per-cent and converts on
     the way in and out. Without this Esmx walks visibly faster up the screen
     than across it, which feels like a bug long before anybody can say what it
     is.

     MEASURED OFF THE ELEMENT, not written down as 8/5. The field is squarer on
     a phone -- the attract screen does not fit in a 16:10 letterbox at 375px --
     and a constant here would have meant the game moved wrong on exactly the
     devices where the layout had to change. Re-measured on resize, and on
     rotation, for the same reason. */
  var ASPECT = 8 / 5;
  function measure() {
    var r = field.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) ASPECT = r.width / r.height;
  }
  measure();
  window.addEventListener('resize', measure);

  var SPEEDS = {
    slow:   { drift: 3.6, walk: 17, note: 'Slow' },
    steady: { drift: 6.4, walk: 25, note: 'Steady' },
    quick:  { drift: 10,  walk: 34, note: 'Quick' }
  };

  var mane = [];          /* what has been caught, rump first */
  var drifting = [];      /* the quills on the field right now */
  var held = {};          /* which directions are being asked for */
  var target = null;      /* a touch/drag destination, if there is one */
  var speed = 'steady';
  var running = false, paused = false, last = 0, raf = 0;
  var me = { x: 50, y: 50, face: 1 };

  function say(t) { if (says) says.textContent = t; }
  function rand(a, b) { return a + Math.random() * (b - a); }

  /* ── The mane ───────────────────────────────────────────────────────────── */

  function spike(hex) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 40 100');
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    p.setAttribute('points', '9,97 29,93 22,4');
    p.setAttribute('fill', hex);
    p.setAttribute('stroke', '#0B0413');
    p.setAttribute('stroke-width', '2.4');
    p.setAttribute('stroke-linejoin', 'round');
    svg.appendChild(p);
    return svg;
  }

  function names() {
    var out = [];
    for (var i = 0; i < mane.length; i++) out.push(mane[i].name);
    return out;
  }

  function drawMane() {
    /* The sprite. Slots past what has been caught are hidden rather than
       recoloured, so a bare Esmx is bare and not grey. */
    var slots = esmx ? esmx.querySelectorAll('.q') : [];
    for (var i = 0; i < slots.length; i++) {
      if (i < mane.length) {
        slots[i].setAttribute('fill', mane[i].hex);
        slots[i].removeAttribute('data-off');
      } else {
        slots[i].setAttribute('data-off', '');
      }
    }

    if (count) count.textContent = mane.length + ' OF ' + SLOTS + ' QUILLS';

    if (strip) {
      strip.textContent = '';
      for (var j = 0; j < mane.length; j++) strip.appendChild(spike(mane[j].hex));
    }

    if (list) {
      if (!mane.length) {
        list.innerHTML = '<span class="mane-empty">Esmx starts bare. Every quill you walk into is '
          + 'written down here in words as well as drawn above, because a mane nobody can read is '
          + 'a mane nobody can tell anybody else about.</span>';
      } else {
        list.textContent = 'From the rump forward: ' + names().join(', ') + '.';
      }
    }

    if (take) {
      var full = mane.length >= SLOTS;
      take.hidden = !full;
      if (full && takeSay) {
        takeSay.textContent = 'Your Esmx has a twelve-quill mane — ' + names().join(', ')
          + ', from the rump forward. Nobody else walked into those twelve in that order. '
          + 'Write it down, hand it to somebody who draws, and it is a variant of the mascot \u2014 '
          + 'which is the thing our own licence asks for rather than merely allows.';
      }
    }
  }

  /* ── The field ──────────────────────────────────────────────────────────── */

  function newQuill() {
    var kind = QUILLS[Math.floor(Math.random() * QUILLS.length)];
    var el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    el.setAttribute('class', 'quill');
    el.setAttribute('viewBox', '0 0 40 100');
    el.setAttribute('aria-hidden', 'true');
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    p.setAttribute('points', '9,97 29,93 22,4');
    p.setAttribute('fill', kind.hex);
    p.setAttribute('stroke', '#0B0413');
    p.setAttribute('stroke-width', '1.8');
    p.setAttribute('stroke-linejoin', 'round');
    el.appendChild(p);

    /* In from an edge, across, and out the other side. A quill that drifted off
       is not lost: the next one is along, and there is no counter anywhere that
       noticed. */
    var side = Math.floor(Math.random() * 4), q = { kind: kind, el: el };
    if (side === 0)      { q.x = -8;  q.y = rand(6, 94);  q.vx = rand(.5, 1);   q.vy = rand(-.4, .4); }
    else if (side === 1) { q.x = 108; q.y = rand(6, 94);  q.vx = rand(-1, -.5); q.vy = rand(-.4, .4); }
    else if (side === 2) { q.x = rand(6, 94); q.y = -10;  q.vx = rand(-.4, .4); q.vy = rand(.5, 1); }
    else                 { q.x = rand(6, 94); q.y = 110;  q.vx = rand(-.4, .4); q.vy = rand(-1, -.5); }

    field.appendChild(el);
    drifting.push(q);
    place(el, q.x, q.y);
    return q;
  }

  function place(el, x, y) { el.style.left = x + '%'; el.style.top = y + '%'; }

  function clearField() {
    for (var i = 0; i < drifting.length; i++) {
      if (drifting[i].el.parentNode) drifting[i].el.parentNode.removeChild(drifting[i].el);
    }
    drifting = [];
  }

  /* ── The loop ───────────────────────────────────────────────────────────── */

  function step(now) {
    raf = window.requestAnimationFrame(step);
    if (!running || paused) { last = now; return; }

    /* Clamped, so a tab that was in the background for a minute does not
       teleport everything the moment it comes back. */
    var dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    var s = SPEEDS[speed];

    /* Esmx. Held directions win over a drag target, because a key pressed now
       is a clearer instruction than a finger put down a moment ago. */
    var dx = 0, dy = 0;
    if (held.left) dx -= 1;
    if (held.right) dx += 1;
    if (held.up) dy -= 1;
    if (held.down) dy += 1;

    if (!dx && !dy && target) {
      var tx = target.x - me.x, ty = (target.y - me.y) / ASPECT;
      var d = Math.sqrt(tx * tx + ty * ty);
      if (d < 1.2) target = null;
      else { dx = tx / d; dy = (ty / d); }
    }

    if (dx || dy) {
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      me.x += (dx / len) * s.walk * dt;
      me.y += (dy / len) * s.walk * dt * ASPECT;
      if (dx < -0.01) me.face = -1;
      if (dx > 0.01)  me.face = 1;
    }

    me.x = Math.max(9, Math.min(91, me.x));
    me.y = Math.max(13, Math.min(87, me.y));
    place(esmx, me.x, me.y);
    esmx.setAttribute('data-face', me.face < 0 ? 'left' : 'right');

    /* The quills. */
    for (var i = drifting.length - 1; i >= 0; i--) {
      var q = drifting[i];
      q.x += q.vx * s.drift * dt * 6;
      q.y += q.vy * s.drift * dt * 6 * ASPECT;
      place(q.el, q.x, q.y);

      if (q.x < -16 || q.x > 116 || q.y < -18 || q.y > 118) {
        if (q.el.parentNode) q.el.parentNode.removeChild(q.el);
        drifting.splice(i, 1);
        continue;
      }

      /* Contact, and only contact. Measured in width-per-cent so the reach is
         the same in every direction. */
      if (mane.length < SLOTS) {
        var ax = q.x - me.x, ay = (q.y - me.y) / ASPECT;
        if (Math.sqrt(ax * ax + ay * ay) < 7.0) {
          mane.push(q.kind);
          if (q.el.parentNode) q.el.parentNode.removeChild(q.el);
          drifting.splice(i, 1);
          drawMane();
          if (mane.length >= SLOTS) {
            say('A ' + q.kind.name + ' quill. That is twelve — the mane is full, and it is '
              + 'yours. It is written out beside the cabinet. Shake it out whenever you want '
              + 'another one; nothing is lost either way.');
          } else {
            say('A ' + q.kind.name + ' quill. ' + mane.length + ' of ' + SLOTS + ' in the mane.');
          }
        }
      }
    }

    /* Five, not six. Playtested at six with a wider reach and a full mane took
       about ten seconds, which is less time than it takes to read the label on
       the cabinet; at five and a narrower reach a lap of the field turned up
       one quill and the game went slack. Six at 7.0 fills a mane in something
       under a minute of walking, which is the length this is meant to be. */
    while (drifting.length < 6) newQuill();
  }

  /* ── Starting, resting, shaking out ─────────────────────────────────────── */

  function start() {
    running = true; paused = false;
    field.setAttribute('data-playing', '');
    me.x = 50; me.y = 50; me.face = 1;
    place(esmx, me.x, me.y);
    if (rest) { rest.hidden = false; rest.setAttribute('aria-pressed', 'false'); rest.textContent = 'REST'; }
    if (shake) shake.hidden = false;
    for (var i = 0; i < 6; i++) newQuill();
    say('Esmx is walking. Steer with the arrow keys, WASD or the pad — the field has the keys '
      + 'while it is focused, and Escape gives them back. Walk into a quill and it stays in the '
      + 'mane. Nothing here can take one away.');
    field.focus();
    last = performance.now();
    if (!raf) raf = window.requestAnimationFrame(step);
  }

  function setRest(on) {
    paused = on;
    if (!rest) return;
    rest.setAttribute('aria-pressed', String(on));
    rest.textContent = on ? 'CARRY ON' : 'REST';
    say(on ? 'Resting. Everything on the screen has stopped where it was, and it will still be '
           + 'there. Nothing is counting.'
           : 'Walking again.');
  }

  if (coin) {
    coin.hidden = false;
    coin.addEventListener('click', start);
  }
  if (nojs) nojs.hidden = true;

  if (rest) rest.addEventListener('click', function () { setRest(!paused); });

  if (shake) shake.addEventListener('click', function () {
    var had = mane.length;
    mane = [];
    drawMane();
    say(had ? 'Shaken out. ' + (had === 1 ? 'That one is' : 'Those ' + had + ' are')
              + ' gone and Esmx is bare again \u2014 which costs nothing, because there was '
              + 'never a score.'
            : 'Nothing to shake out yet.');
  });

  /* ── The knobs ──────────────────────────────────────────────────────────── */

  var knobs = document.querySelectorAll('.knob[data-speed]');
  function setSpeed(k, announce) {
    if (!SPEEDS[k]) k = 'steady';
    speed = k;
    for (var i = 0; i < knobs.length; i++) {
      knobs[i].setAttribute('aria-pressed', String(knobs[i].dataset.speed === k));
    }
    if (announce) say('Speed: ' + SPEEDS[k].note + '. This is the game’s own knob and not '
      + 'the room’s dial; all three are here whatever the dial says.');
  }
  for (var ki = 0; ki < knobs.length; ki++) {
    knobs[ki].addEventListener('click', function () { setSpeed(this.dataset.speed, true); });
  }

  /* The dial picks the STARTING position and then stops having an opinion. It
     is read once, here, rather than watched: a visitor who turns the room down
     mid-game asked about the room, not about the game they are holding. */
  setSpeed(document.documentElement.getAttribute('data-intensity') === 'gentle' ? 'slow' : 'steady', false);

  /* ── Steering ───────────────────────────────────────────────────────────── */

  var KEYS = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', a: 'left', s: 'down', d: 'right',
    W: 'up', A: 'left', S: 'down', D: 'right'
  };

  /* Bound to the FIELD and not to the document. Arrow keys that stop the page
     scrolling from anywhere on it would be a trap, and a visitor who tabs away
     has to get their arrow keys back without being told a magic word. */
  field.setAttribute('tabindex', '0');
  field.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { field.blur(); held = {}; say('The field let go of the keys.'); return; }
    var k = KEYS[e.key];
    if (!k) return;
    held[k] = true; target = null;
    e.preventDefault();
  });
  field.addEventListener('keyup', function (e) {
    var k = KEYS[e.key];
    if (k) { held[k] = false; e.preventDefault(); }
  });
  field.addEventListener('blur', function () { held = {}; });

  /* The pad. A press-and-hold walks; a plain click or an Enter takes one clear
     step, which is the only way this is usable by somebody driving it with a
     switch or a screen reader rather than by holding a button down. */
  var pads = document.querySelectorAll('.dpad button[data-go]');
  for (var pi = 0; pi < pads.length; pi++) {
    (function (b) {
      var dir = b.dataset.go, pointer = false;
      b.addEventListener('pointerdown', function () {
        pointer = true; held[dir] = true; target = null; b.setAttribute('data-held', '');
      });
      function release() { held[dir] = false; b.removeAttribute('data-held'); }
      b.addEventListener('pointerup', release);
      b.addEventListener('pointerleave', release);
      b.addEventListener('pointercancel', release);
      b.addEventListener('click', function () {
        if (pointer) { pointer = false; return; }   /* the hold already moved us */
        if (!running) return;
        if (dir === 'left')  { me.x -= 7; me.face = -1; }
        if (dir === 'right') { me.x += 7; me.face = 1; }
        if (dir === 'up')    { me.y -= 7 * ASPECT; }
        if (dir === 'down')  { me.y += 7 * ASPECT; }
      });
    }(pads[pi]));
  }

  /* Drag on the screen: Esmx walks to where the finger is, and keeps walking
     while it moves. Released, they stop where they got to. */
  field.addEventListener('pointerdown', function (e) {
    if (!running || e.target.closest('button')) return;
    field.setPointerCapture(e.pointerId);
    aim(e);
  });
  field.addEventListener('pointermove', function (e) {
    if (!running || !e.buttons) return;
    aim(e);
  });
  field.addEventListener('pointerup', function () { target = null; });
  function aim(e) {
    var r = field.getBoundingClientRect();
    target = { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 };
  }

  drawMane();
})();

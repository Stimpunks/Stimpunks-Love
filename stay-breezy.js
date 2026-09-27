/* =============================================================================
   The fans in Stay Breezy.

   EVERY FAN IS MADE HERE, IN YOUR BROWSER, WITH THE WEB AUDIO API. A fan is a
   rush of noise cut off somewhere (bright, even or dark), sometimes a motor's
   hum under it, sometimes a slow beat from the blades going past, and for the
   oscillating one a turn from one side of the room to the other. The numbers
   for each come off the fan's own tile, written there by make-stay-breezy.py
   out of data/stay-breezy.json. Nothing is recorded, fetched or hosted.

   NOTHING IS FETCHED, SENT, STORED OR LISTENED TO. make-stay-breezy.py refuses
   a request, storage or the microphone anywhere in this file.

   THE LOUDEST THE HALL CAN BE IS MAX_GAIN, AND make-stay-breezy.py REFUSES IT
   ABOVE 0.2, the Repeater's ceiling: a fan is a thing somebody forgets is on.
   The slider scales under that ceiling, and the ceiling is shared -- every fan
   running divides it rather than adding to it -- so switching more fans on
   makes the hall fuller and never louder than the slider says, which is a
   sentence on the page.

   A FAN KEEPS GOING IN ANOTHER TAB, like a fan does. It stops when it is
   switched off, when Switch every fan off is pressed, or when the page goes.

   THE ROOM OF YOUR OWN HAS A DOOR. Switching anything on in there switches the
   hall's fans off, and switching a hall fan on switches your room's off, and
   both say so. That is the only thing one fan does to another.

   THE BLADES ARE CSS, NOT THIS FILE. This only sets is-on and data-speed on a
   tile; love.css §64 turns the blades, and §3's Gentle reset stops them there.
   ============================================================================= */
(function () {
  'use strict';

  var MAX_GAIN = 0.18;
  var AC = window.AudioContext || window.webkitAudioContext;
  var panel = document.getElementById('bz-panel');
  if (!panel || !AC) return;

  var says = document.getElementById('bz-says');
  var volume = document.getElementById('bz-volume');
  var alloff = document.getElementById('bz-alloff');
  var perch = document.getElementById('bz-perch');
  var ctx = null, master = null, buffers = {};
  var running = [];
  var SPEED = { 1: { low: 0.7, level: 0.55, beat: 0.6 },
                2: { low: 1.0, level: 0.8,  beat: 1.0 },
                3: { low: 1.3, level: 1.0,  beat: 1.4 } };

  /* A live region does not announce text it already holds, so a repeat is
     cleared and set again on the next tick: Switch every fan off, pressed
     twice, still says so twice. The Playhouse's speak(), for the same reason. */
  function say(text) {
    if (says.textContent === text) {
      says.textContent = '';
      window.setTimeout(function () { says.textContent = text; }, 60);
    } else {
      says.textContent = text;
    }
  }

  function num(tile, key) { return parseFloat(tile.getAttribute('data-' + key)) || 0; }
  function nameOf(tile) {
    var n = tile.querySelector('.bz-fan__name').textContent;
    if (/^(The|Your) /.test(n)) return n.charAt(0).toLowerCase() + n.slice(1);
    return 'the ' + n.charAt(0).toLowerCase() + n.slice(1);
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function inRoom(tile) { return !!tile.closest('.bz-room'); }

  function noise(colour) {
    if (buffers[colour]) return buffers[colour];
    var len = ctx.sampleRate * 4, buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var d = buf.getChannelData(0), last = 0, b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0;
    for (var i = 0; i < len; i++) {
      var w = Math.random() * 2 - 1;
      if (colour === 'white') {
        d[i] = w * 0.5;
      } else if (colour === 'pink') {
        b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.96900 * b2 + w * 0.1538520; b3 = 0.86650 * b3 + w * 0.3104856;
        b4 = 0.55000 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.0168980;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + w * 0.5362) * 0.11;
      } else {
        last = (last + 0.02 * w) / 1.02;
        d[i] = last * 3.5;
      }
    }
    buffers[colour] = buf;
    return buf;
  }

  function ceilingNow() {
    var total = 0;
    running.forEach(function (r) { total += r.share; });
    return MAX_GAIN * (parseInt(volume.value, 10) / 100) / Math.max(1, total);
  }
  function settle() {
    if (master) master.gain.setTargetAtTime(ceilingNow(), ctx.currentTime, 0.2);
  }

  function build(tile) {
    var s = SPEED[tile.getAttribute('data-speed')] || SPEED[2];
    var t = ctx.currentTime, nodes = [];
    var out = ctx.createGain();
    out.gain.value = 0;

    var src = ctx.createBufferSource();
    src.buffer = noise(tile.getAttribute('data-noise'));
    src.loop = true;
    var low = ctx.createBiquadFilter();
    low.type = 'lowpass';
    low.frequency.value = num(tile, 'low') * s.low;
    var body = ctx.createGain();
    src.connect(low); low.connect(body);
    nodes.push(src);

    var beat = num(tile, 'beat'), depth = num(tile, 'depth');
    if (beat > 0 && depth > 0) {
      body.gain.value = 1 - depth / 2;
      var lfo = ctx.createOscillator(), amt = ctx.createGain();
      lfo.frequency.value = beat * s.beat;
      amt.gain.value = depth / 2;
      lfo.connect(amt); amt.connect(body.gain);
      nodes.push(lfo);
    }

    var tail = body;
    var sweep = num(tile, 'sweep');
    if (sweep > 0 && ctx.createStereoPanner) {
      var pan = ctx.createStereoPanner(), turn = ctx.createOscillator(), wide = ctx.createGain();
      turn.frequency.value = 1 / (2 * sweep);
      wide.gain.value = 0.8;
      turn.connect(wide); wide.connect(pan.pan);
      body.connect(pan); tail = pan;
      nodes.push(turn);
    }
    tail.connect(out);

    var hum = num(tile, 'hum'), humLevel = num(tile, 'hum-level');
    if (hum > 0 && humLevel > 0) {
      var motor = ctx.createOscillator(), over = ctx.createOscillator();
      var g1 = ctx.createGain(), g2 = ctx.createGain();
      motor.frequency.value = hum; over.frequency.value = hum * 2;
      g1.gain.value = humLevel; g2.gain.value = humLevel * 0.3;
      motor.connect(g1); over.connect(g2); g1.connect(out); g2.connect(out);
      nodes.push(motor, over);
    }

    var share = num(tile, 'level') * s.level;
    out.connect(master);
    nodes.forEach(function (n) { n.start(t); });
    out.gain.setTargetAtTime(share, t, 0.25);
    return { tile: tile, nodes: nodes, out: out, share: share };
  }

  function find(tile) {
    for (var i = 0; i < running.length; i++) if (running[i].tile === tile) return i;
    return -1;
  }

  function show(tile, on) {
    var sw = tile.querySelector('.bz-switch');
    var said = tile.querySelector('.bz-said');
    tile.classList.toggle('is-on', on);
    sw.setAttribute('aria-pressed', on ? 'true' : 'false');
    sw.querySelector('.bz-switch__word').textContent = on ? 'Switch off' : 'Switch on';
    said.textContent = on ? 'On, at speed ' + tile.getAttribute('data-speed') + '.' : '';
    said.hidden = !on;
  }

  function stop(tile) {
    var i = find(tile);
    if (i < 0) return false;
    var r = running.splice(i, 1)[0], t = ctx.currentTime;
    r.out.gain.setTargetAtTime(0, t, 0.12);
    window.setTimeout(function () {
      r.nodes.forEach(function (n) { try { n.stop(); } catch (e) {} });
      r.out.disconnect();
    }, 900);
    show(tile, false);
    settle();
    return true;
  }

  function start(tile) {
    if (!ctx) {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    running.push(build(tile));
    show(tile, true);
    settle();
  }

  function others(room) {
    var stopped = false;
    running.slice().forEach(function (r) {
      if (inRoom(r.tile) !== room) stopped = stop(r.tile) || stopped;
    });
    return stopped;
  }

  function toggle(tile) {
    if (find(tile) >= 0) {
      stop(tile);
      say(cap(nameOf(tile)) + ' is off.');
      return;
    }
    var room = inRoom(tile);
    var closed = others(room);
    start(tile);
    var line = cap(nameOf(tile)) + ' is on, at speed ' + tile.getAttribute('data-speed') + '.';
    if (closed) line += room ? ' You close your door, and the hall’s fans are off.'
                             : ' You open your door and go back out, and your room’s fans are off.';
    say(line);
  }

  function setSpeed(tile, n) {
    tile.setAttribute('data-speed', n);
    tile.querySelectorAll('.bz-speed').forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-speed') === String(n) ? 'true' : 'false');
    });
    if (find(tile) >= 0) {
      stop(tile); start(tile);
      say(cap(nameOf(tile)) + ' is at speed ' + n + '.');
    }
  }

  /* PERCHING A FAN copies the floor's own tile for that fan -- its numbers, its
     name, its words and its drawing -- so the table can never describe a fan
     differently from the fan on the floor. One copy of every fan's words in the
     document, the Mopery's rule for its popups. */
  function perchFan(id) {
    var from = document.getElementById('fan-' + id), to = document.getElementById('fan-perch');
    if (!from || !to) return;
    ['noise', 'low', 'hum', 'hum-level', 'beat', 'depth', 'sweep', 'level'].forEach(function (k) {
      to.setAttribute('data-' + k, from.getAttribute('data-' + k));
    });
    to.setAttribute('data-fan', id);
    to.querySelector('.bz-fan__name').textContent = from.querySelector('.bz-fan__name').textContent;
    to.querySelector('.bz-fan__feel span').textContent = from.querySelector('.bz-fan__feel span').textContent;
    to.querySelector('.bz-fan__sound span').textContent = from.querySelector('.bz-fan__sound span').textContent;
    to.querySelector('.bz-fan__art svg').innerHTML = from.querySelector('.bz-fan__art svg').innerHTML;
    to.querySelector('.bz-switch .sr').textContent = ' ' + nameOf(to);
    to.querySelector('.bz-speeds').setAttribute('aria-label', from.querySelector('.bz-fan__name').textContent + ': speed');
    var was = find(to) >= 0;
    if (was) { stop(to); start(to); }
    say(cap(nameOf(to)) + ' is perched on your table' +
        (was ? ', and it is on.' : '.'));
  }

  document.querySelectorAll('.bz-fan').forEach(function (tile) {
    tile.querySelector('.bz-switch').addEventListener('click', function () { toggle(tile); });
    tile.querySelectorAll('.bz-speed').forEach(function (b) {
      b.addEventListener('click', function () { setSpeed(tile, parseInt(b.getAttribute('data-speed'), 10)); });
    });
    tile.querySelector('.bz-fan__controls').hidden = false;
  });

  alloff.addEventListener('click', function () {
    var any = running.length > 0;
    running.slice().forEach(function (r) { stop(r.tile); });
    say(any ? 'Every fan is off.' : 'Every fan is already off.');
  });
  volume.addEventListener('input', function () {
    settle();
    volume.setAttribute('aria-valuetext', volume.value + ' percent of the hall’s ceiling');
  });
  volume.setAttribute('aria-valuetext', volume.value + ' percent of the hall’s ceiling');

  if (perch) {
    perch.addEventListener('change', function () { perchFan(perch.value); });
    perch.closest('.bz-perch').hidden = false;
  }
  panel.hidden = false;
})();

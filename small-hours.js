/* =============================================================================
   The Small Hours' jukebox: play a whole album from the top.

   EVERY TRACK IS ALREADY A PRESS-TO-PLAY BUTTON, and love-embed.js turns each
   into a player streaming from the band's own site. This file adds only the
   album button, which plays an album straight through -- and because one press
   starts several songs, its label says how many and how long BEFORE the press.
   That is the audio room's sequence rule, and make-small-hours.py writes both
   numbers from the data rather than letting anybody type them.

   IT BUILDS NOTHING OF ITS OWN. Each song is an <audio> from loveEmbed.audio,
   which checks the source against AUDIO_ORIGINS and pauses any other recording
   when this one starts, so an album and a single track can never play over
   each other. The button ships hidden and this file unhides it: a page with
   no JavaScript shows no dead control.

   IT SAYS WHAT IS ON. "Now playing" names the song and which of how many it is,
   in text beside the player and once into a live region per song, because the
   only other sign that a song changed is a sound.
   ============================================================================= */
(function () {
  'use strict';

  if (!window.loveEmbed || !window.loveEmbed.audio) return;

  var buttons = document.querySelectorAll('.sh-album__all');
  Array.prototype.forEach.call(buttons, function (btn) {
    var tracks;
    try { tracks = JSON.parse(btn.getAttribute('data-tracks') || '[]'); } catch (e) { return; }
    if (!tracks.length) return;

    var album = btn.closest('.sh-album');
    var title = album.querySelector('.sh-album__h').textContent;
    var now = album.querySelector('.sh-album__now');
    var at = 0;

    function playAt(i) {
      at = i;
      var t = tracks[i];
      var player = window.loveEmbed.audio(t[1], t[0] + ' by Josephmooon');
      if (!player) return;
      now.textContent = '';
      var line = document.createElement('p');
      line.className = 'sh-album__line';
      line.setAttribute('aria-live', 'polite');
      line.textContent = 'Now playing ' + t[0] + ', song ' + (i + 1) + ' of ' + tracks.length +
        ' on ' + title + ', ' + t[2] + '.';
      now.appendChild(line);
      now.appendChild(player);
      now.hidden = false;
      player.addEventListener('ended', function () {
        if (at + 1 < tracks.length) {
          playAt(at + 1);
        } else {
          line.textContent = 'That was the whole of ' + title + '.';
          player.remove();
        }
      });
    }

    btn.addEventListener('click', function () { playAt(0); });
    btn.hidden = false;
  });
})();

/* =============================================================================
   The placemat on every table, and the crayons beside it.

   ONE CANVAS OF WAX UNDER ONE SHEET OF PRINT. Colouring a part in and
   scribbling both put crayon on the same canvas, in the order you did them, so
   a part coloured over a scribble covers it the way crayon does on paper. The
   printed lines are an SVG laid over the top that ignores the pointer, so the
   lines always show and the crayon always goes under them.

   THE LIST IS THE WAY IN FOR ANYBODY NOT USING A POINTER. Every part the
   pointer can colour has a button with its name on it, and the button says
   what colour the part is now. Scribbling is the one thing that needs a hand.

   NOTHING IS KEPT. This file stores nothing, sends nothing and never asks what
   time it is, and make-small-hours.py refuses it if it starts to. "Take it
   home" draws the placemat into a picture and hands it to the browser as a
   download: the visitor's own save, to their own device. A fresh placemat
   throws the old one away and nothing remembers it.
   ============================================================================= */
(function () {
  'use strict';

  var mat = document.querySelector('.sh-mat');
  if (!mat || !window.Path2D) return;
  var wax = mat.querySelector('.sh-mat__wax');
  var ctx = wax.getContext && wax.getContext('2d');
  if (!ctx) return;
  var box = mat.closest('.sh-window');
  var print = mat.querySelector('.sh-mat__print');
  var said = box.querySelector('.sh-mat__said');
  var W = 800, K = wax.width / W;
  var TOOTH = 64;

  var zones = Array.prototype.map.call(print.querySelectorAll('.sh-mat__zone'), function (el) {
    return { id: el.getAttribute('data-zone'), name: el.getAttribute('data-name'),
             path: new Path2D(el.getAttribute('d')), el: el };
  });
  var buttons = {};
  Array.prototype.forEach.call(box.querySelectorAll('.sh-mat__part'), function (b) {
    buttons[b.getAttribute('data-zone')] = b;
  });

  function ink(prop) {
    return getComputedStyle(document.documentElement).getPropertyValue(prop).trim();
  }

  // THE PAPER'S TOOTH. Crayon skips the low spots in paper, so every colour is
  // laid through one fixed mask of tiny gaps. It is one mask for every crayon
  // and it never moves, which is what paper does: go over a patch twice and
  // the same specks stay white.
  var tooth = document.createElement('canvas');
  tooth.width = tooth.height = TOOTH;
  (function () {
    var t = tooth.getContext('2d');
    var img = t.createImageData(TOOTH, TOOTH);
    for (var i = 0; i < TOOTH * TOOTH; i++) {
      img.data[i * 4 + 3] = Math.random() < 0.17 ? 0 : 190 + Math.floor(Math.random() * 66);
    }
    t.putImageData(img, 0, 0);
  })();
  var patterns = {};
  function crayon(colour) {
    if (!patterns[colour]) {
      var c = document.createElement('canvas');
      c.width = c.height = TOOTH;
      var x = c.getContext('2d');
      x.drawImage(tooth, 0, 0);
      x.globalCompositeOperation = 'source-in';
      x.fillStyle = colour;
      x.fillRect(0, 0, TOOTH, TOOTH);
      patterns[colour] = ctx.createPattern(c, 'repeat');
    }
    return patterns[colour];
  }

  function holding() {
    var r = box.querySelector('input[name="sh-crayon"]:checked');
    return { colour: ink(r.value), name: r.getAttribute('data-name') };
  }
  function mode() {
    var r = box.querySelector('input[name="sh-mat-how"]:checked');
    return r ? r.value : 'fill';
  }

  function say(text) {
    said.textContent = '';
    setTimeout(function () { said.textContent = text; }, 30);
  }

  function colourIn(zone) {
    var h = holding();
    ctx.setTransform(K, 0, 0, K, 0, 0);
    ctx.fillStyle = crayon(h.colour);
    ctx.fill(zone.path, 'evenodd');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    var b = buttons[zone.id];
    if (b) b.querySelector('.sh-mat__now').textContent = ', ' + h.name;
    say(zone.name.charAt(0).toUpperCase() + zone.name.slice(1) + ', in ' + h.name + '.');
  }

  function at(e) {
    var r = wax.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * (W * wax.height / wax.width) };
  }

  // COLOURING IN answers a click rather than a press, so a finger that lands
  // on the placemat to scroll the page past it does not colour anything.
  wax.addEventListener('click', function (e) {
    if (mode() !== 'fill') return;
    var p = at(e);
    ctx.setTransform(K, 0, 0, K, 0, 0);
    var hit = null;
    for (var i = zones.length - 1; i >= 0 && !hit; i--) {
      if (ctx.isPointInPath(zones[i].path, p.x * K, p.y * K, 'evenodd')) hit = zones[i];
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (hit) colourIn(hit);
    else say('That is bare paper. Switch to scribbling to draw on it.');
  });

  // SCRIBBLING follows the pointer and lays a line of wax behind it.
  var last = null;
  function stroke(a, b) {
    ctx.setTransform(K, 0, 0, K, 0, 0);
    ctx.strokeStyle = crayon(holding().colour);
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
  wax.addEventListener('pointerdown', function (e) {
    if (mode() !== 'scribble') return;
    e.preventDefault();
    if (wax.setPointerCapture) wax.setPointerCapture(e.pointerId);
    last = at(e);
    stroke(last, { x: last.x + 0.01, y: last.y });
  });
  wax.addEventListener('pointermove', function (e) {
    if (!last) return;
    var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    if (!evs.length) evs = [e];
    evs.forEach(function (ev) {
      var p = at(ev);
      stroke(last, p);
      last = p;
    });
  });
  function lift() { last = null; }
  wax.addEventListener('pointerup', lift);
  wax.addEventListener('pointercancel', lift);

  Array.prototype.forEach.call(box.querySelectorAll('input[name="sh-mat-how"]'), function (r) {
    r.addEventListener('change', function () { mat.setAttribute('data-mode', mode()); });
  });

  // THE LIST. Pressing a name colours that part; pointing at or focusing a name
  // outlines its part on the placemat, so the list and the picture stay joined.
  zones.forEach(function (zone) {
    var b = buttons[zone.id];
    if (!b) return;
    b.addEventListener('click', function () { colourIn(zone); });
    function show() { zone.el.classList.add('is-shown'); }
    function hide() { zone.el.classList.remove('is-shown'); }
    b.addEventListener('focus', show);
    b.addEventListener('blur', hide);
    b.addEventListener('mouseenter', show);
    b.addEventListener('mouseleave', hide);
  });

  box.querySelector('[data-mat="fresh"]').addEventListener('click', function () {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, wax.width, wax.height);
    Object.keys(buttons).forEach(function (k) { buttons[k].querySelector('.sh-mat__now').textContent = ''; });
    say('A fresh placemat. The old one went in the bin, and nothing kept a copy.');
  });

  // TAKE IT HOME. The paper, the wax and the print drawn into one picture, in
  // that order, straight from the same paths the page draws.
  function home() {
    var out = document.createElement('canvas');
    out.width = wax.width;
    out.height = wax.height;
    var o = out.getContext('2d');
    o.fillStyle = ink('--sh-paper');
    o.fillRect(0, 0, out.width, out.height);
    o.drawImage(wax, 0, 0);
    o.setTransform(K, 0, 0, K, 0, 0);
    var teal = ink('--sh-teal');
    o.strokeStyle = teal;
    o.lineCap = 'round';
    o.lineJoin = 'round';
    Array.prototype.forEach.call(print.querySelectorAll('.sh-mat__line'), function (el) {
      o.lineWidth = parseFloat(el.getAttribute('stroke-width')) || 3;
      var dash = el.getAttribute('stroke-dasharray');
      o.setLineDash(dash ? dash.split(/\s+/).map(parseFloat) : []);
      o.stroke(new Path2D(el.getAttribute('d')));
    });
    o.setLineDash([]);
    o.fillStyle = teal;
    o.textAlign = 'center';
    Array.prototype.forEach.call(print.querySelectorAll('.sh-mat__word'), function (el) {
      o.font = el.getAttribute('font-weight') + ' ' + el.getAttribute('font-size') + 'px ' +
        el.getAttribute('font-family');
      if ('letterSpacing' in o) o.letterSpacing = el.getAttribute('letter-spacing') + 'px';
      o.fillText(el.textContent, parseFloat(el.getAttribute('x')), parseFloat(el.getAttribute('y')));
    });
    out.toBlob(function (blob) {
      if (!blob) { say('That did not work in this browser, sorry. The placemat is still here.'); return; }
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'small-hours-placemat.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
      say('Saved as small-hours-placemat.png, wherever your browser puts downloads. It went nowhere else.');
    }, 'image/png');
  }
  box.querySelector('[data-mat="home"]').addEventListener('click', function () {
    var fonts = document.fonts && document.fonts.load
      ? Promise.all([document.fonts.load('36px Righteous'), document.fonts.load('700 15px "Libre Franklin"')])
      : Promise.resolve();
    fonts.then(home, home);
  });

  wax.hidden = false;
  Array.prototype.forEach.call(box.querySelectorAll('.sh-crayons, .sh-mat__how, .sh-mat__acts, .sh-mat__list'),
    function (el) { el.hidden = false; });
})();

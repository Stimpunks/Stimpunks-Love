/* Glow Wild Hollow: the sea that lights where it moves, and the jellyfish that
   lights when it is touched. Helen Edgar's ask, 2026-10-27.

   SEA SPARKLE LIGHTS UP WHEN THE WATER AROUND IT MOVES, so the sea here does
   the same: a pointer or a finger through the water leaves small blue lights
   that come up and go dark again, and Stir the water sends a run of them along
   the wave, for anybody without a pointer.

   NOTHING HERE FLASHES. A light takes RISE to come up and FADE to go, so no
   light can come and go three times in a second, and every light is a small
   spot on a dark panel. At Gentle, and in a low-stimulation mode, nothing comes
   and goes at all: the waves light all at once and stay lit until stirred
   again, and the jellyfish stays lit until pressed again. The words are the
   same at every setting.

   IT KEEPS NOTHING AND SENDS NOTHING. tools/make-glow-wild.py holds that, and
   holds RISE and FADE to their floors. */
(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var RISE = 450;        // ms for a light to come up
  var FADE = 2200;       // ms for it to go dark again
  var HOLD = 700;        // ms the jellyfish stays bright before it fades
  var MAX_SPARKS = 60;   // never more lights on the water than this at once
  var STEP = 16;         // a pointer leaves a light every this many units

  function still() {
    var d = document.documentElement;
    return d.getAttribute('data-intensity') === 'gentle' || d.hasAttribute('data-low');
  }

  function say(el, words) {
    if (!el) return;
    el.textContent = '';
    setTimeout(function () { el.textContent = words; }, 30);
  }

  // How bright a light is, t milliseconds after it was born: up over RISE,
  // held for hold, then down over FADE. 0 means it has gone.
  function brightness(t, hold) {
    if (t < 0) return 0;
    if (t < RISE) return t / RISE;
    if (t < RISE + hold) return 1;
    var f = 1 - (t - RISE - hold) / FADE;
    return f > 0 ? f : 0;
  }

  // ── the sea ────────────────────────────────────────────────────────────────
  var sea = document.querySelector('[data-gwh-sea]');
  if (sea) {
    var svg = sea.querySelector('svg');
    var layer = sea.querySelector('[data-gwh-sparks]');
    var crest = sea.querySelector('[data-gwh-crest]');
    var calm = sea.querySelector('[data-gwh-still]');
    var stir = sea.querySelector('[data-gwh-stir]');
    var said = sea.querySelector('[data-gwh-said]');
    var sparks = [];
    var running = false;
    var last = null;
    var lit = false;

    var spark = function (x, y, born) {
      if (sparks.length >= MAX_SPARKS) {
        var old = sparks.shift();
        old.el.remove();
      }
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', x.toFixed(1));
      c.setAttribute('cy', y.toFixed(1));
      c.setAttribute('r', (7 + Math.random() * 6).toFixed(1));
      c.setAttribute('fill', 'url(#hollow-g-spark)');
      c.setAttribute('opacity', '0');
      layer.appendChild(c);
      sparks.push({ el: c, born: born });
      if (!running) { running = true; requestAnimationFrame(tick); }
    };

    var tick = function () {
      var t = performance.now();
      sparks = sparks.filter(function (s) {
        var b = brightness(t - s.born, 0);
        if (b <= 0 && t - s.born > RISE) { s.el.remove(); return false; }
        s.el.setAttribute('opacity', b.toFixed(3));
        return true;
      });
      if (sparks.length) requestAnimationFrame(tick);
      else running = false;
    };

    var settle = function (on) {
      lit = on;
      calm.setAttribute('opacity', on ? '1' : '0');
    };

    var toWater = function (e) {
      var m = svg.getScreenCTM();
      if (!m) return null;
      var p = svg.createSVGPoint();
      p.x = e.clientX; p.y = e.clientY;
      return p.matrixTransform(m.inverse());
    };

    svg.addEventListener('pointermove', function (e) {
      if (still()) return;
      var p = toWater(e);
      if (!p) return;
      if (last && Math.hypot(p.x - last.x, p.y - last.y) < STEP) return;
      last = p;
      spark(p.x, p.y, performance.now());
    });
    svg.addEventListener('pointerleave', function () { last = null; });
    svg.addEventListener('pointerdown', function (e) {
      if (!still()) return;
      settle(!lit);
    });

    if (stir) {
      stir.hidden = false;
      stir.addEventListener('click', function () {
        if (still()) {
          settle(!lit);
          say(said, lit ? 'The waves light blue all along, and stay lit, still.' : 'The water settles, and goes dark.');
          return;
        }
        settle(false);
        var len = crest.getTotalLength();
        var now = performance.now();
        for (var i = 0; i <= 24; i++) {
          var at = crest.getPointAtLength(len * i / 24);
          spark(at.x, at.y + (Math.random() * 10 - 5), now + i * 40);
        }
        say(said, 'The water lights blue where it moved, and goes dark again.');
      });
    }
  }

  // ── the jellyfish ──────────────────────────────────────────────────────────
  var jelly = document.querySelector('[data-gwh-jelly]');
  if (jelly) {
    var glow = jelly.querySelector('[data-gwh-jelly-glow]');
    var touch = jelly.querySelector('[data-gwh-touch]');
    var jsaid = jelly.querySelector('[data-gwh-jelly-said]');
    var jsvg = jelly.querySelector('svg');
    var born = null;
    var on = false;
    var going = false;

    var glowTick = function () {
      if (born === null) { going = false; return; }
      var b = brightness(performance.now() - born, HOLD);
      glow.setAttribute('opacity', b.toFixed(3));
      if (b > 0 || performance.now() - born < RISE) requestAnimationFrame(glowTick);
      else { born = null; going = false; }
    };

    var light = function () {
      if (still()) {
        on = !on;
        born = null;
        glow.setAttribute('opacity', on ? '1' : '0');
        say(jsaid, on ? 'The jellyfish lights up green, and stays lit.' : 'The jellyfish goes dark again.');
        return;
      }
      on = false;
      var was = born === null ? 0 : brightness(performance.now() - born, HOLD);
      // Start from however bright it already is, so a second press never jumps.
      born = performance.now() - was * RISE;
      if (!going) { going = true; requestAnimationFrame(glowTick); }
      say(jsaid, 'The jellyfish lights up green, the way a crystal jelly does, and goes dark again.');
    };

    jsvg.addEventListener('pointerdown', light);
    if (touch) {
      touch.hidden = false;
      touch.addEventListener('click', light);
    }
  }
})();

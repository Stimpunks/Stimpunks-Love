/* The Faery Yurt's glimmer window, 2026-10-14: Helen's photographs behind the
   shutters. The strip already swipes and scrolls with no script; this adds
   previous and next, and rolls it on by itself at MAX GLITTER only, Plural
   Mural's rule: a picture that changes without being asked is ambient change,
   and the dial says nothing moves unasked below MAX. It never rolls while the
   shutters are shut or the tab is hidden, it speaks only when somebody presses
   something, and it stores nothing. Gentle gets no smooth scroll. */
(function () {
  'use strict';
  var box = document.querySelector('[data-glimmer]');
  if (!box) return;
  var strip = box.querySelector('[data-glimmer-strip]');
  var controls = box.querySelector('[data-glimmer-controls]');
  var prev = box.querySelector('[data-glimmer-prev]');
  var next = box.querySelector('[data-glimmer-next]');
  var pause = box.querySelector('[data-glimmer-pause]');
  var says = box.querySelector('[data-glimmer-says]');
  var check = document.getElementById('glimmer');
  var slides = strip.querySelectorAll('.glimmer__slide');
  if (!slides.length || !check) return;

  var ROLL_MS = 6000;
  var held = false;
  var timer = null;

  function level() { return document.documentElement.getAttribute('data-intensity') || 'regular'; }
  function open() { return check.checked && document.visibilityState === 'visible'; }

  function current() {
    return Math.round(strip.scrollLeft / Math.max(1, strip.clientWidth));
  }

  function go(i, spoken) {
    var n = slides.length;
    i = ((i % n) + n) % n;
    strip.scrollTo({ left: i * strip.clientWidth, behavior: level() === 'gentle' ? 'auto' : 'smooth' });
    if (spoken) {
      var img = slides[i].querySelector('img');
      says.textContent = '';
      setTimeout(function () { says.textContent = img ? img.alt : ''; }, 50);
    }
  }

  function tick() {
    if (level() === 'max' && !held && open()) go(current() + 1, false);
  }

  function tune() {
    var max = level() === 'max';
    pause.hidden = !max;
    pause.textContent = held ? 'Roll on' : 'Pause';
    pause.setAttribute('aria-pressed', held ? 'true' : 'false');
    if (max && !held && open()) {
      if (!timer) timer = setInterval(tick, ROLL_MS);
    } else if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  prev.addEventListener('click', function () { go(current() - 1, true); });
  next.addEventListener('click', function () { go(current() + 1, true); });
  pause.addEventListener('click', function () {
    held = !held;
    tune();
    says.textContent = held ? 'The photographs are held still.' : 'The photographs roll on again.';
  });
  check.addEventListener('change', tune);
  document.addEventListener('visibilitychange', tune);
  new MutationObserver(tune).observe(document.documentElement, { attributes: true, attributeFilter: ['data-intensity'] });

  controls.hidden = false;
  tune();
})();

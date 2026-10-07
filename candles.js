/* The candles behind the door marked E, and the light that gets out round it.

   Ryan, 2026-10-07: "We want flicker. And lots of candles." So every flame on
   these two pages flickers: by itself at MAX, where the dial says ambient
   motion lives, and at every other setting once somebody presses Let the
   candles flicker, which is the Arcade's rule and the fractal window's (a
   control the visitor holds runs at any setting; the dial does not switch it).
   The press is remembered for the page and nowhere else. Nothing is stored and
   nothing is sent.

   A FLICKER, NEVER A FLASH. WCAG counts a flash as a change of a tenth of the
   brightest white or more. A flame here dims by a tenth OF ITSELF at most
   (DIM), which on this room's ground is about half that, and it changes
   smoothly, out of a few slow wobbles of which none is faster than HZ's last,
   two and a half times a second. Every flame has its own wobbles, so no two dim
   together and no large area ever changes at once. tools/make-secret-cabin.py
   reads DIM and HZ out of this file and refuses them past those lines, and
   works out what the dimmest flame does to the brightest ink it is drawn in.
   Club Chronic's rule is about a strobe; this is a candle, held under the line.

   IT MOVES SHAPES WITH SCALE AND NEVER WITH ROTATION OR SKEW, which are what
   check-gentle.py reads, and it drives SVG attributes from one
   requestAnimationFrame loop rather than CSS, because §3 takes CSS animation
   away at Gentle and a press here has to work there too (rave.js's reason). A
   tab behind another gets no frames, so a hidden page flickers at nobody.

   A flame is any <g data-flame data-x data-y> (the foot it dances from); one
   marked data-flame="glow" only dims, because the light coming through the E
   on the door is a light and not a shape. */
(function () {
  'use strict';
  var DIM = 0.1;
  var HZ = [0.6, 1.1, 1.7, 2.5];
  var TAU = Math.PI * 2;

  var flames = Array.prototype.map.call(document.querySelectorAll('[data-flame]'), function (g) {
    return {
      g: g, x: +g.getAttribute('data-x') || 0, y: +g.getAttribute('data-y') || 0,
      shape: g.getAttribute('data-flame') !== 'glow',
      ph: HZ.map(function () { return Math.random() * TAU; }),
      sp: 0.88 + Math.random() * 0.12
    };
  });
  if (!flames.length) return;

  var root = document.documentElement;
  var btn = document.querySelector('[data-candles]');
  var asked = null;   // null follows the dial; true or false is somebody's press
  var raf = 0;

  function wanted() {
    return asked === null ? root.getAttribute('data-intensity') === 'max' : asked;
  }

  function frame(t) {
    var s = t / 1000;
    for (var k = 0; k < flames.length; k++) {
      var f = flames[k], a = 0, b = 0;
      for (var i = 0; i < HZ.length; i++) {
        a += Math.sin(s * HZ[i] * f.sp * TAU + f.ph[i]);
        b += Math.sin(s * HZ[i] * f.sp * TAU + f.ph[i] * 1.7 + 1);
      }
      a /= HZ.length;
      b /= HZ.length;
      f.g.setAttribute('opacity', (1 - DIM * (0.5 + 0.5 * a)).toFixed(3));
      if (f.shape) {
        f.g.setAttribute('transform', 'translate(' + f.x + ' ' + f.y + ') scale(' +
          (1 + 0.04 * b).toFixed(3) + ' ' + (1 - 0.05 * b + 0.03 * a).toFixed(3) +
          ') translate(' + (-f.x) + ' ' + (-f.y) + ')');
      }
    }
    raf = requestAnimationFrame(frame);
  }

  function still() {
    cancelAnimationFrame(raf);
    raf = 0;
    flames.forEach(function (f) {
      f.g.removeAttribute('opacity');
      f.g.removeAttribute('transform');
    });
  }

  function sync() {
    var on = wanted();
    if (on && !raf) raf = requestAnimationFrame(frame);
    if (!on && raf) still();
    if (btn) btn.setAttribute('aria-pressed', String(on));
  }

  if (btn) {
    btn.hidden = false;
    btn.addEventListener('click', function () { asked = !wanted(); sync(); });
  }
  new MutationObserver(sync).observe(root, { attributes: true, attributeFilter: ['data-intensity'] });
  sync();
})();

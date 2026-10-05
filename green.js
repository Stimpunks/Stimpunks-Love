/* =============================================================================
   The Green: walking the trail round the pond, one stop at a time. Ryan's
   brief, 2026-10-05.

   THE TRAIL IS THE LIST ON THE PAGE, written by tools/make-the-green.py: every
   stop from the porch round the pond and back, with what is there and what you
   might notice, so with scripts off the walk is the list, read top to bottom.
   This file adds a way to walk it: a button on to the next stop and one back,
   the stop you are at marked in the list, the ring on the plan moved to it,
   and the stop's words said where the hand is and once into the live region.

   WHERE YOU ARE IS A STOP'S NAME, NEVER A NUMBER OUT OF A TOTAL. Nothing on the
   trail is counted: no steps, no laps, no distance. make-the-green.py refuses
   this file if it says otherwise, stores anything or sends anything.

   NOTHING GLIDES. The ring moves by its own cx and cy, at once, at every
   setting: a walk is not an animation, and the dial exists so nothing moves a
   view unasked.
   ============================================================================= */
(function () {
  'use strict';

  var list = document.querySelector('[data-trail]');
  var ring = document.querySelector('[data-trail-here]');
  var next = document.querySelector('[data-trail-next]');
  var back = document.querySelector('[data-trail-back]');
  var now = document.querySelector('[data-trail-now]');
  var says = document.querySelector('[data-trail-says]');
  if (!list || !next || !back) return;

  var stops = Array.prototype.map.call(list.querySelectorAll('[data-stop]'), function (li) {
    var name = li.querySelector('.grn-stop__name');
    var words = li.querySelector('.grn-stop__words');
    var notice = li.querySelector('.grn-stop__notice');
    return { li: li, x: li.getAttribute('data-x'), y: li.getAttribute('data-y'),
             name: name ? name.textContent : '', words: words ? words.textContent : '',
             notice: notice ? notice.textContent : '' };
  });
  if (!stops.length) return;
  var at = 0;

  function speak(text) {
    if (!says) return;
    says.textContent = '';
    setTimeout(function () { says.textContent = text; }, 40);
  }
  function lower(s) { return s.charAt(0).toLowerCase() + s.slice(1); }

  function show(spoken) {
    var s = stops[at];
    stops.forEach(function (t, i) {
      if (i === at) t.li.setAttribute('aria-current', 'step'); else t.li.removeAttribute('aria-current');
    });
    if (ring) { ring.setAttribute('cx', s.x); ring.setAttribute('cy', s.y); }
    var ahead = stops[(at + 1) % stops.length], behind = stops[(at - 1 + stops.length) % stops.length];
    next.textContent = at === stops.length - 1 ? 'Walk on, back to ' + lower(ahead.name) : 'Walk on to ' + lower(ahead.name);
    back.textContent = 'Walk back to ' + lower(behind.name);
    var line = 'You are at ' + lower(s.name) + '. ' + s.words + ' ' + s.notice;
    if (now) { now.textContent = line; now.hidden = false; }
    if (spoken) speak(line);
  }

  next.hidden = back.hidden = false;
  next.addEventListener('click', function () { at = (at + 1) % stops.length; show(true); });
  back.addEventListener('click', function () { at = (at - 1 + stops.length) % stops.length; show(true); });
  show(false);
}());

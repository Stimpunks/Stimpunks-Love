/* Cavendish Coworking: the same hour on your own clock.

   Every door says when its room is in use in Central time, as our events page
   gives it, and that line stands on its own with no script. This adds one line
   under it: the same hour where you are. It reads the browser's own clock and
   time zone to do that and NOTHING ELSE -- nothing is stored, nothing is sent,
   nothing is listened to, and make-coworking.py refuses this file if that ever
   stops being true. The readouts ship hidden, so a page with no script shows
   no empty line. Daylight saving is handled by asking the browser for Central's
   offset on the actual day, not by assuming one. */
(function () {
  'use strict';
  var slots = document.querySelectorAll('.cw-slot[data-days][data-start]');
  if (!slots.length || !window.Intl || !Intl.DateTimeFormat) return;

  var here;
  try { here = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { return; }
  var DAY = 86400000;

  // The wall-clock parts of an instant in a named zone.
  function parts(ms, tz) {
    var f = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hourCycle: 'h23', weekday: 'short',
      year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric'
    });
    var o = {};
    f.formatToParts(new Date(ms)).forEach(function (p) { o[p.type] = p.value; });
    return o;
  }
  // How far a zone's clock is from UTC at an instant, in ms.
  function offset(ms, tz) {
    var p = parts(ms, tz);
    var asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute);
    return asUTC - Math.floor(ms / 60000) * 60000;
  }
  // The instant a zone's clock reads y-m-d hh:mm.
  function instant(y, m, d, hh, mm, tz) {
    var guess = Date.UTC(y, m, d, hh, mm);
    var t = guess - offset(guess, tz);
    var t2 = guess - offset(t, tz);
    return t2;
  }
  var WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  // The next time `tz`'s clock reaches `day` at hh:mm, from now.
  function next(day, hh, mm, tz) {
    var now = Date.now();
    for (var i = 0; i < 8; i++) {
      var p = parts(now + i * DAY, tz);
      if (WD.indexOf(p.weekday) !== day) continue;
      var t = instant(+p.year, +p.month - 1, +p.day, hh, mm, tz);
      if (t + DAY > now) return t;
    }
    return null;
  }
  function clock(t) {
    return new Date(t).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', timeZone: here });
  }
  function weekday(t) {
    return new Date(t).toLocaleDateString('en-US', { weekday: 'long', timeZone: here }) + 's';
  }
  function list(xs) {
    return xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1];
  }

  Array.prototype.forEach.call(slots, function (li) {
    var tz = li.closest('[data-tz]');
    tz = tz && tz.getAttribute('data-tz');
    var out = li.querySelector('.cw-slot__local');
    if (!tz || !out) return;
    var s = li.getAttribute('data-start').split(':');
    var en = li.getAttribute('data-end');
    en = en && en.split(':');
    var days = [], hours = '';
    li.getAttribute('data-days').split(' ').forEach(function (d) {
      var t = next(+d, +s[0], +s[1], tz);
      if (t === null) return;
      days.push(weekday(t));
      var span = clock(t);
      if (en) span += '–' + clock(t + ((+en[0] - +s[0]) * 60 + (+en[1] - +s[1])) * 60000);
      hours = span;
    });
    if (!days.length) return;
    var same = offset(Date.now(), tz) === offset(Date.now(), here);
    out.textContent = same
      ? 'That is your own time too.'
      : 'Where you are (' + here.replace(/_/g, ' ') + '): ' + list(days) + ', ' + hours + '.';
    out.hidden = false;
  });
})();

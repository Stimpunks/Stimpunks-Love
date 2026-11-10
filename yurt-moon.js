/* The moon over the Faery Yurt, Helen Edgar's asks, 2026-11-09: tonight's
   moon in the lit ring at the top of the crown, and a moon calendar for the
   month, worked out for Birmingham unless you say where you are.

   EVERYTHING IS ARITHMETIC AND NOTHING IS FETCHED. The moon's place in the
   sky comes from the low-precision formulae in the Astronomical Almanac
   (good to about a third of a degree), the sun's from the same book, and
   the rest is spherical trigonometry: so the phase is right, the day a
   quarter falls on is right except within an hour or so of midnight, and
   moonrise and moonset are within a few minutes of an almanac's. The page
   says so. The phase is the same everywhere on Earth; what changes with a
   place is which date it falls on (the time zone), when the moon rises and
   sets (latitude and longitude), and which side of a crescent is lit, which
   is the other way round south of the equator, so the drawings flip there.

   WHERE YOU ARE IS A CHOICE FROM A LIST, OR A LATITUDE, A LONGITUDE AND A
   TIME ZONE YOU TYPE, kept under love-yurt-moon in your own browser so the
   calendar opens on your place next time (Helen's ask: settings for where
   people are), listed on the privacy page, taken out by Back to Birmingham.
   The page never asks the browser where you are, and nothing about a place
   is sent anywhere. The shade on the crown's moon and the calendar are drawn
   with createElementNS and textContent; nothing moves; on the night of a
   full moon <body> carries data-moon="full", which at MAX silvers the lights. */
(function () {
  'use strict';
  var KEY = 'love-yurt-moon';
  var PLACES = [
    ['birmingham', 'Birmingham, UK', 52.4862, -1.8904, 'Europe/London'],
    ['london', 'London', 51.5074, -0.1278, 'Europe/London'],
    ['manchester', 'Manchester', 53.4808, -2.2426, 'Europe/London'],
    ['edinburgh', 'Edinburgh', 55.9533, -3.1883, 'Europe/London'],
    ['cardiff', 'Cardiff', 51.4816, -3.1791, 'Europe/London'],
    ['belfast', 'Belfast', 54.5973, -5.9301, 'Europe/London'],
    ['dublin', 'Dublin', 53.3498, -6.2603, 'Europe/Dublin'],
    ['denver', 'Denver, Colorado', 39.7392, -104.9903, 'America/Denver'],
    ['newyork', 'New York', 40.7128, -74.0060, 'America/New_York'],
    ['chicago', 'Chicago', 41.8781, -87.6298, 'America/Chicago'],
    ['losangeles', 'Los Angeles', 34.0522, -118.2437, 'America/Los_Angeles'],
    ['toronto', 'Toronto', 43.6532, -79.3832, 'America/Toronto'],
    ['berlin', 'Berlin', 52.52, 13.405, 'Europe/Berlin'],
    ['madrid', 'Madrid', 40.4168, -3.7038, 'Europe/Madrid'],
    ['delhi', 'Delhi', 28.6139, 77.209, 'Asia/Kolkata'],
    ['tokyo', 'Tokyo', 35.6762, 139.6503, 'Asia/Tokyo'],
    ['johannesburg', 'Johannesburg', -26.2041, 28.0473, 'Africa/Johannesburg'],
    ['saopaulo', 'São Paulo', -23.5505, -46.6333, 'America/Sao_Paulo'],
    ['sydney', 'Sydney', -33.8688, 151.2093, 'Australia/Sydney'],
    ['auckland', 'Auckland', -36.8485, 174.7633, 'Pacific/Auckland']
  ];
  var RAD = Math.PI / 180, DAY = 86400000;
  var sin = function (d) { return Math.sin(d * RAD); }, cos = function (d) { return Math.cos(d * RAD); };
  function jd(ms) { return ms / DAY + 2440587.5; }
  function norm(a) { a = a % 360; return a < 0 ? a + 360 : a; }

  /* The sun's ecliptic longitude, Astronomical Almanac's low-precision formula. */
  function sunLon(JD) {
    var n = JD - 2451545.0;
    var L = norm(280.460 + 0.9856474 * n), g = norm(357.528 + 0.9856003 * n);
    return norm(L + 1.915 * sin(g) + 0.020 * sin(2 * g));
  }
  /* The moon's geocentric ecliptic longitude and latitude, and its horizontal
     parallax, the Almanac's low-precision formulae (about 0.3° in longitude). */
  function moon(JD) {
    var T = (JD - 2451545.0) / 36525;
    var lon = 218.32 + 481267.881 * T
      + 6.29 * sin(135.0 + 477198.87 * T) - 1.27 * sin(259.3 - 413335.36 * T)
      + 0.66 * sin(235.7 + 890534.22 * T) + 0.21 * sin(269.9 + 954397.74 * T)
      - 0.19 * sin(357.5 + 35999.05 * T) - 0.11 * sin(186.5 + 966404.03 * T);
    var lat = 5.13 * sin(93.3 + 483202.02 * T) + 0.28 * sin(228.2 + 960400.89 * T)
      - 0.28 * sin(318.3 + 6003.15 * T) - 0.17 * sin(217.6 - 407332.21 * T);
    var par = 0.9508 + 0.0518 * cos(135.0 + 477198.87 * T) + 0.0095 * cos(259.3 - 413335.36 * T)
      + 0.0078 * cos(235.7 + 890534.22 * T) + 0.0028 * cos(269.9 + 954397.74 * T);
    return { lon: norm(lon), lat: lat, par: par };
  }
  /* Elongation of the moon from the sun: 0 at new, 180 at full. */
  function elong(ms) { var J = jd(ms); return norm(moon(J).lon - sunLon(J)); }
  /* The moon's altitude for an observer, topocentric, in degrees. */
  function altitude(ms, lat, lon) {
    var J = jd(ms), m = moon(J), e = 23.4393;
    var sl = sin(m.lon), cl = cos(m.lon), sb = sin(m.lat), cb = cos(m.lat);
    var ra = Math.atan2(sl * cos(e) - Math.tan(m.lat * RAD) * sin(e), cl) / RAD;
    var dec = Math.asin(sb * cos(e) + cb * sin(e) * sl) / RAD;
    var gmst = norm(280.46061837 + 360.98564736629 * (J - 2451545.0));
    var ha = norm(gmst + lon - ra);
    var alt = Math.asin(sin(lat) * sin(dec) + cos(lat) * cos(dec) * cos(ha)) / RAD;
    return alt - m.par * cos(alt);                 // topocentric
  }
  var HORIZON = -0.5667;                           // refraction at the horizon

  /* Time zones, through the browser's own tables. */
  var fmtCache = {};
  function fmt(tz) {
    if (!fmtCache[tz]) fmtCache[tz] = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
    return fmtCache[tz];
  }
  function parts(ms, tz) {
    var o = {};
    fmt(tz).formatToParts(new Date(ms)).forEach(function (p) { if (p.type !== 'literal') o[p.type] = parseInt(p.value, 10); });
    if (o.hour === 24) o.hour = 0;
    return { y: o.year, m: o.month, d: o.day, h: o.hour, min: o.minute };
  }
  function offsetMin(ms, tz) {
    var p = parts(ms, tz);
    return Math.round((Date.UTC(p.y, p.m - 1, p.d, p.h, p.min, 0) - Math.floor(ms / 60000) * 60000) / 60000);
  }
  function midnight(y, m, d, tz) {
    var guess = Date.UTC(y, m - 1, d), t = guess - offsetMin(guess, tz) * 60000;
    var again = guess - offsetMin(t, tz) * 60000;
    return again;
  }
  function zoneOk(tz) { try { fmt(tz); return true; } catch (e) { return false; } }
  function clock(ms, tz) { var p = parts(ms, tz); return (p.h < 10 ? '0' : '') + p.h + ':' + (p.min < 10 ? '0' : '') + p.min; }

  /* Moonrise and moonset between two moments, each found by stepping ten
     minutes and then halving the step until it is under a second. */
  function riseSet(from, to, lat, lon) {
    var out = [], step = 600000, t = from, prev = altitude(t, lat, lon) - HORIZON;
    while (t < to) {
      var n = Math.min(t + step, to), cur = altitude(n, lat, lon) - HORIZON;
      if ((prev < 0) !== (cur < 0)) {
        var a = t, b = n, fa = prev;
        for (var i = 0; i < 20; i++) {
          var mid = (a + b) / 2, fm = altitude(mid, lat, lon) - HORIZON;
          if ((fa < 0) === (fm < 0)) { a = mid; fa = fm; } else { b = mid; }
        }
        out.push({ kind: prev < 0 ? 'rise' : 'set', ms: (a + b) / 2 });
      }
      t = n; prev = cur;
    }
    return out;
  }
  /* The quarters between two moments: new (0), first (90), full (180), last
     (270), each the moment the elongation crosses it. */
  var QUARTERS = ['new moon', 'first quarter', 'full moon', 'last quarter'];
  function quarters(from, to) {
    var out = [], step = 3600000, t = from;
    function g(ms, k) { return ((elong(ms) - k * 90 + 540) % 360) - 180; }
    while (t < to) {
      var n = t + step;
      for (var k = 0; k < 4; k++) {
        var p = g(t, k), q = g(n, k);
        if (p < 0 && q >= 0 && q - p < 180) {
          var a = t, b = n;
          for (var i = 0; i < 24; i++) { var m = (a + b) / 2; if (g(m, k) < 0) a = m; else b = m; }
          out.push({ k: k, ms: (a + b) / 2 });
        }
      }
      t = n;
    }
    return out;
  }

  /* The dark part of a moon of radius r at (cx, cy): a path, or '' at full.
     flip is the southern hemisphere, where the lit side is the other way. */
  function shade(phase, cx, cy, r, flip) {
    var lit = 0.5 * (1 - Math.cos(phase * 2 * Math.PI));
    if (lit > 0.995) return '';
    if (lit < 0.005) return 'M' + (cx - r) + ' ' + cy + 'A' + r + ' ' + r + ' 0 1 0 ' + (cx + r) + ' ' + cy + 'A' + r + ' ' + r + ' 0 1 0 ' + (cx - r) + ' ' + cy + 'Z';
    var waxing = phase < 0.5; if (flip) waxing = !waxing;
    var k = Math.cos(phase * 2 * Math.PI) * r, sweep = waxing ? 0 : 1, over = k > 0;
    return 'M' + cx + ' ' + (cy - r) + 'A' + r + ' ' + r + ' 0 0 ' + sweep + ' ' + cx + ' ' + (cy + r) +
      'A' + Math.abs(k).toFixed(3) + ' ' + r + ' 0 0 ' + (over ? 1 - sweep : sweep) + ' ' + cx + ' ' + (cy - r) + 'Z';
  }
  function phaseOf(ms) { return elong(ms) / 360; }
  function phaseName(phase) {
    var lit = 0.5 * (1 - Math.cos(phase * 2 * Math.PI));
    if (lit < 0.012) return 'a new moon, and you cannot see it';
    if (lit > 0.988) return 'a full moon';
    var names = [[0.25, 'a waxing crescent'], [0.27, 'the first quarter, half lit'], [0.5, 'a waxing gibbous moon'],
      [0.75, 'a waning gibbous moon'], [0.77, 'the last quarter, half lit'], [1.01, 'a waning crescent']];
    if (phase > 0.23 && phase < 0.25) return 'the first quarter, half lit';
    if (phase > 0.73 && phase < 0.75) return 'the last quarter, half lit';
    for (var i = 0; i < names.length; i++) if (phase < names[i][0]) return names[i][1];
    return names[names.length - 1][1];
  }

  /* Where you are. */
  function placeByKey(k) { for (var i = 0; i < PLACES.length; i++) if (PLACES[i][0] === k) return PLACES[i]; return null; }
  function load() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!v || typeof v !== 'object') return null;
      if (v.place === 'custom') {
        var lat = +v.lat, lon = +v.lon;
        if (isFinite(lat) && isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180 && typeof v.tz === 'string' && zoneOk(v.tz)) return { key: 'custom', name: 'where you said', lat: lat, lon: lon, tz: v.tz };
        return null;
      }
      var p = placeByKey(v.place);
      return p ? { key: p[0], name: p[1], lat: p[2], lon: p[3], tz: p[4] } : null;
    } catch (e) { return null; }
  }
  function home() { var p = PLACES[0]; return { key: p[0], name: p[1], lat: p[2], lon: p[3], tz: p[4] }; }
  function save(where) {
    try {
      if (!where || where.key === PLACES[0][0]) { localStorage.removeItem(KEY); return; }
      localStorage.setItem(KEY, JSON.stringify(where.key === 'custom' ? { place: 'custom', lat: where.lat, lon: where.lon, tz: where.tz } : { place: where.key }));
    } catch (e) { /* no storage here; the place lasts the visit */ }
  }

  var el = function (tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  var NS = 'http://www.w3.org/2000/svg';
  function moonSvg(phase, flip, size) {
    var s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 24 24'); s.setAttribute('width', size); s.setAttribute('height', size); s.setAttribute('aria-hidden', 'true');
    var disc = document.createElementNS(NS, 'circle');
    disc.setAttribute('cx', 12); disc.setAttribute('cy', 12); disc.setAttribute('r', 10); disc.setAttribute('fill', '#E9C874');
    s.appendChild(disc);
    var d = shade(phase, 12, 12, 10, flip);
    if (d) { var p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('fill', '#3A2A20'); p.setAttribute('opacity', '0.92'); s.appendChild(p); }
    var rim = document.createElementNS(NS, 'circle');
    rim.setAttribute('cx', 12); rim.setAttribute('cy', 12); rim.setAttribute('r', 10); rim.setAttribute('fill', 'none'); rim.setAttribute('stroke', '#A4907B'); rim.setAttribute('stroke-width', '0.8');
    s.appendChild(rim);
    return s;
  }

  /* The crown. */
  var crown = document.querySelector('[data-crown-moon]');
  var line = document.querySelector('[data-yurt-moon]');
  var cal = document.querySelector('[data-yurt-mooncal]');
  function crownDraw(where) {
    if (!crown || !line) return;
    var now = Date.now(), phase = phaseOf(now), lit = 0.5 * (1 - Math.cos(phase * 2 * Math.PI));
    var d = shade(phase, 100, 20, 10, where.lat < 0);
    var sh = crown.querySelector('.crown-moon__shade');
    if (sh) { sh.setAttribute('d', d); sh.setAttribute('opacity', d ? '0.92' : '0'); }
    var full = lit > 0.988;
    if (full) document.body.setAttribute('data-moon', 'full'); else document.body.removeAttribute('data-moon');
    var p = parts(now, where.tz), start = midnight(p.y, p.m, p.d, where.tz), end = midnight(p.y, p.m, p.d + 1, where.tz);
    var ev = riseSet(start, end, where.lat, where.lon);
    var words = ev.map(function (e) { return (e.kind === 'rise' ? 'rises at ' : 'sets at ') + clock(e.ms, where.tz); }).join(' and ');
    line.textContent = 'Over the yurt tonight: ' + phaseName(phase) + '. From ' + where.name + ' it ' + (words || 'neither rises nor sets today') + (full ? '. At MAX the lights go silver for it.' : '.');
    if (cal) { line.appendChild(document.createTextNode(' ')); var go = el('a', 'yurt-moon__go', 'The month\u2019s calendar is below.'); go.href = '#moon-calendar'; line.appendChild(go); }
    line.hidden = false;
  }

  /* The calendar. */
  var where = load() || home();
  crownDraw(where);
  if (!cal) return;
  var sel = cal.querySelector('[data-mooncal-select]'), custom = cal.querySelector('[data-mooncal-custom]');
  var latIn = cal.querySelector('[data-mooncal-lat]'), lonIn = cal.querySelector('[data-mooncal-lon]'), tzSel = cal.querySelector('[data-mooncal-tz]');
  var forget = cal.querySelector('[data-mooncal-forget]'), said = cal.querySelector('[data-mooncal-said]');
  var monthH = cal.querySelector('[data-mooncal-month]'), grid = cal.querySelector('[data-mooncal-grid]'), quartersP = cal.querySelector('[data-mooncal-quarters]');
  var prev = cal.querySelector('[data-mooncal-prev]'), next = cal.querySelector('[data-mooncal-next]');
  if (!sel || !grid || !monthH) return;
  PLACES.forEach(function (p) { var o = el('option', null, p[1]); o.value = p[0]; sel.appendChild(o); });
  var oc = el('option', null, 'Somewhere else (type it in)'); oc.value = 'custom'; sel.appendChild(oc);
  var zones = [];
  try { zones = Intl.supportedValuesOf('timeZone'); } catch (e) { zones = PLACES.map(function (p) { return p[4]; }); }
  if (tzSel) zones.forEach(function (z) { var o = el('option', null, z); o.value = z; tzSel.appendChild(o); });
  var shown = parts(Date.now(), where.tz), view = { y: shown.y, m: shown.m };
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  function draw() {
    var y = view.y, m = view.m, tz = where.tz, flip = where.lat < 0;
    var first = midnight(y, m, 1, tz), after = midnight(y, m + 1, 1, tz);
    var today = parts(Date.now(), tz);
    monthH.textContent = MONTHS[m - 1] + ' ' + y + ', from ' + where.name;
    while (grid.firstChild) grid.removeChild(grid.firstChild);
    var qs = quarters(first, after);
    var byDay = {};
    qs.forEach(function (q) { var p = parts(q.ms, tz); byDay[p.d] = q; });
    var table = el('table', 'yurt-mooncal__table'), cap = el('caption', 'sr', 'The moon through ' + MONTHS[m - 1] + ' ' + y + ' from ' + where.name + ': each day, its phase, and when it rises and sets there.');
    table.appendChild(cap);
    var thead = el('thead'), hr = el('tr');
    DAYS.forEach(function (dn) { var th = el('th', null, dn); th.scope = 'col'; hr.appendChild(th); });
    thead.appendChild(hr); table.appendChild(thead);
    var tbody = el('tbody'), tr = el('tr');
    var firstDow = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;      // Monday first
    for (var i = 0; i < firstDow; i++) tr.appendChild(el('td', 'yurt-mooncal__blank'));
    var days = Math.round((after - first) / DAY);
    for (var d = 1; d <= days; d++) {
      var start = midnight(y, m, d, tz), end = midnight(y, m, d + 1, tz), noon = (start + end) / 2;
      var td = el('td', 'yurt-mooncal__day');
      td.setAttribute('data-dow', DAYS[(firstDow + d - 1) % 7]);
      if (today.y === y && today.m === m && today.d === d) { td.className += ' is-today'; }
      var num = el('span', 'yurt-mooncal__num', String(d)); td.appendChild(num);
      td.appendChild(moonSvg(phaseOf(noon), flip, 34));
      var q = byDay[d];
      if (q) td.appendChild(el('span', 'yurt-mooncal__quarter', QUARTERS[q.k] + ' ' + clock(q.ms, tz)));
      var ev = riseSet(start, end, where.lat, where.lon);
      var times = el('span', 'yurt-mooncal__times');
      if (!ev.length) times.textContent = 'no rise or set';
      else times.textContent = ev.map(function (e) { return (e.kind === 'rise' ? 'rises ' : 'sets ') + clock(e.ms, tz); }).join(', ');
      td.appendChild(times);
      tr.appendChild(td);
      if (tr.children.length === 7) { tbody.appendChild(tr); tr = el('tr'); }
    }
    if (tr.children.length) { while (tr.children.length < 7) tr.appendChild(el('td', 'yurt-mooncal__blank')); tbody.appendChild(tr); }
    table.appendChild(tbody); grid.appendChild(table);
    if (quartersP) {
      quartersP.textContent = qs.length ? 'This month, from ' + where.name + ': ' + qs.map(function (q) { var p = parts(q.ms, tz); return QUARTERS[q.k] + ' on the ' + p.d + ordinal(p.d) + ' at ' + clock(q.ms, tz); }).join('; ') + '.' : '';
    }
  }
  function ordinal(n) { var s = ['th', 'st', 'nd', 'rd'], v = n % 100; return s[(v - 20) % 10] || s[v] || s[0]; }

  function setWhere(w, tell) {
    where = w; save(w); crownDraw(w); draw();
    if (forget) forget.hidden = w.key === PLACES[0][0];
    if (said && tell) said.textContent = tell;
  }
  sel.value = where.key === 'custom' ? 'custom' : where.key;
  if (custom) custom.hidden = where.key !== 'custom';
  if (where.key === 'custom' && latIn && lonIn && tzSel) { latIn.value = where.lat; lonIn.value = where.lon; tzSel.value = where.tz; }
  if (forget) forget.hidden = where.key === PLACES[0][0];
  sel.addEventListener('change', function () {
    if (sel.value === 'custom') {
      if (custom) custom.hidden = false;
      if (tzSel && !tzSel.value) { try { tzSel.value = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { /* leave it */ } }
      if (said) said.textContent = 'Type a latitude and a longitude (north and east are positive) and pick a time zone, and the calendar follows.';
      return;
    }
    if (custom) custom.hidden = true;
    var p = placeByKey(sel.value);
    if (p) setWhere({ key: p[0], name: p[1], lat: p[2], lon: p[3], tz: p[4] }, 'The calendar is from ' + p[1] + ' now, and remembered in this browser.');
  });
  function customChanged() {
    if (!latIn || !lonIn || !tzSel) return;
    var lat = parseFloat(latIn.value), lon = parseFloat(lonIn.value), tz = tzSel.value;
    if (!isFinite(lat) || !isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180 || !tz || !zoneOk(tz)) return;
    setWhere({ key: 'custom', name: 'where you said', lat: lat, lon: lon, tz: tz }, 'The calendar is from where you said now, and remembered in this browser: only the numbers and the zone, nothing else.');
  }
  [latIn, lonIn, tzSel].forEach(function (c) { if (c) c.addEventListener('change', customChanged); });
  if (forget) forget.addEventListener('click', function () {
    sel.value = PLACES[0][0]; if (custom) custom.hidden = true;
    setWhere(home(), 'Back to Birmingham, and nothing remembered.');
  });
  if (prev) prev.addEventListener('click', function () { view.m -= 1; if (view.m < 1) { view.m = 12; view.y -= 1; } draw(); });
  if (next) next.addEventListener('click', function () { view.m += 1; if (view.m > 12) { view.m = 1; view.y += 1; } draw(); });
  cal.querySelectorAll('[data-mooncal-place], [data-mooncal-nav]').forEach(function (n) { n.hidden = false; });
  draw();
})();

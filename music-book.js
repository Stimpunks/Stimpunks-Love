/* Choosing a song in Helen Edgar's Music Book (her ask, 2026-11-24: "the option of
   choosing tracks in each playlist though without it taking up too much room on
   the page"). Every song under a playlist's bar has a button, shipped hidden so a
   page with no script shows no control that does nothing; this unhides them.

   A SONG PLAYS IN ITS PLAYLIST'S OWN BAR AND THE PLAYLIST GOES ON FROM THERE, so
   it is still the whole list, hosted and followed on the radio like any list.
   This file builds nothing: love-embed.js is still the only thing on the street
   that builds a frame. Before the bar has been pressed, the song is put on the
   bar's own button as data-embed-entry and the button pressed, which opens the
   list at that song (/embed/<song>?list=, Club Chronic's measurement). While the
   bar is playing, loveEmbed.toEntry moves the list to the song in one message;
   if the player cannot say yet where its songs are, the bar's own button is put
   back as the page shipped it and pressed at that song.

   It keeps nothing, sends nothing and makes no sound but the song pressed for. */
(function () {
  var books = document.querySelectorAll('[data-mb-list]');
  if (!books.length) return;
  var plates = new WeakMap();
  Array.prototype.forEach.call(books, function (book) {
    var own = book.querySelector('.mus-book__play button.facade');
    if (own) plates.set(book, own.outerHTML);
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-mb-song]'), function (b) { b.hidden = false; });

  document.addEventListener('click', function (e) {
    var song = e.target && e.target.closest ? e.target.closest('[data-mb-song]') : null;
    if (!song || !window.loveEmbed) return;
    var book = song.closest('[data-mb-list]');
    if (!book) return;
    var list = book.getAttribute('data-mb-list'), id = song.getAttribute('data-mb-song');
    var bar = book.querySelector('.mus-book__play');
    var btn = bar && bar.querySelector('button.facade');
    if (!btn && window.loveEmbed.toEntry(id, 0, true, list)) return;
    if (!btn) {
      if (!plates.has(book)) return;
      bar.innerHTML = plates.get(book);
      btn = bar.querySelector('button.facade');
    }
    btn.setAttribute('data-embed-entry', id);
    window.loveEmbed.press(btn);
  });

  /* FIND A SONG (Helen's pick, 2026-11-24). Typing shows only the playlists with
     the words in a song, an artist or the playlist's name, their songs opened and
     the rest of their songs put away; clearing the box puts the book back as it
     was. It reads only the page and keeps and sends nothing. Every song keeps the
     number it has in her book while others are hidden. */
  var find = document.querySelector('[data-mb-find]');
  var box = document.querySelector('[data-mb-find-box]');
  var found = document.querySelector('[data-mb-found]');
  if (find && box && found) {
    var lists = Array.prototype.slice.call(document.querySelectorAll('.mus-book__list'));
    var shelves = Array.prototype.slice.call(document.querySelectorAll('.mus-book__shelf'));
    var wasOpen = new Map();
    lists.forEach(function (l) {
      var d = l.querySelector('details');
      wasOpen.set(l, !!(d && d.open));
      Array.prototype.forEach.call(l.querySelectorAll('.mus-book__songs li'), function (li, i) { li.value = i + 1; });
    });
    var fold = function (s) { return (s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
    var wait = null;
    var run = function () {
      var said = box.value.trim(), q = fold(said), any = false;
      lists.forEach(function (l) {
        var songs = Array.prototype.slice.call(l.querySelectorAll('.mus-book__songs li'));
        var named = q && fold(l.getAttribute('data-mb-name') || (l.querySelector('.mus-book__title') || {}).textContent).indexOf(q) >= 0;
        var hits = 0;
        songs.forEach(function (li) {
          var hit = !q || named || fold(li.textContent).indexOf(q) >= 0;
          li.hidden = !hit;
          if (q && hit) hits++;
        });
        l.hidden = !!q && !hits;
        var d = l.querySelector('details');
        if (d) d.open = q ? hits > 0 : wasOpen.get(l);
        if (q && hits) any = true;
      });
      shelves.forEach(function (sh) {
        var none = !!q && !sh.querySelector('.mus-book__list:not([hidden])');
        sh.hidden = none;
        var about = sh.previousElementSibling, head = about && about.previousElementSibling;
        if (about) about.hidden = none;
        if (head && head.tagName === 'H3') head.hidden = none;
      });
      found.textContent = !q ? '' : any
        ? 'Showing the playlists with “' + said + '” in them. Clear the box to see the whole book again.'
        : 'No playlist in the book has “' + said + '” in it.';
    };
    box.addEventListener('input', function () { clearTimeout(wait); wait = setTimeout(run, 200); });
    find.hidden = false;
  }

  /* NOW PLAYING (Helen's pick, 2026-11-24). A strip at the edge of the window,
     while something in the room has started, naming the song and where it is
     playing, with Pause or Play, Go to it, and Hide this, which puts it away
     until another song starts. It changes only when love-embed.js says a player
     started, paused, ended or turned to another song, and it never moves. */
  var now = document.querySelector('[data-mb-now]');
  if (now) {
    var says = now.querySelector('[data-mb-now-says]');
    var toggle = now.querySelector('[data-mb-now-toggle]');
    var go = now.querySelector('[data-mb-now-go]');
    var hide = now.querySelector('[data-mb-now-hide]');
    var put = false, last = '';
    var frameOf = function (w) {
      var key = w.list || w.id;
      if (!key) return null;
      return Array.prototype.filter.call(document.querySelectorAll('iframe'), function (f) { return f.src.indexOf(key) >= 0; })[0] || null;
    };
    var draw = function () {
      var w = window.loveEmbed.where();
      if (!w) { now.hidden = true; return; }
      if (w.playing && w.id !== last) put = false;
      if (w.playing) last = w.id;
      if (put) { now.hidden = true; return; }
      var f = frameOf(w), where = '';
      if (f) {
        var b = f.closest('[data-mb-list]');
        if (b) where = ', from ' + b.getAttribute('data-mb-name');
        else if (f.closest('.mus-deck')) where = ', on the phonograph';
        else if (f.closest('.mus-rack')) where = ', from the record shelves';
      }
      says.textContent = (w.playing ? 'Now playing: ' : w.ended ? 'Finished: ' : 'Paused: ') + w.film + where;
      toggle.textContent = w.playing ? 'Pause' : 'Play';
      now.hidden = false;
    };
    document.addEventListener('love-embed-state', draw);
    toggle.addEventListener('click', function () {
      var w = window.loveEmbed.where();
      if (!w) return;
      if (w.playing) window.loveEmbed.pause(); else window.loveEmbed.play();
    });
    go.addEventListener('click', function () {
      var w = window.loveEmbed.where(), f = w && frameOf(w);
      if (!f) return;
      var at = f.closest('[data-mb-list], .mus-deck, .mus-rack') || f;
      if (!at.hasAttribute('tabindex')) at.setAttribute('tabindex', '-1');
      at.scrollIntoView({ block: 'start' });
      at.focus({ preventScroll: true });
    });
    hide.addEventListener('click', function () { put = true; now.hidden = true; });
  }
})();

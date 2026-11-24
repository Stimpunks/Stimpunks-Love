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
})();

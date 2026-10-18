/* The Faery Yurt's books: Nature Notes, the field book (Helen's asks,
   2026-10-14), and since 2026-10-18 the songbook under the phonograph, which
   lists every song on her yarn for looking through (the music itself plays in
   the Music Room). With no script a book is open and its pages swipe. This
   shuts each one behind its cover, opens it on the press, adds Turn back, Turn
   the page and Close the book, a sweep across the page on the press (none at
   Gentle), and says what is on a page when somebody turns to it: a
   photograph's description in the field book, the page's own line
   (data-notebook-say) in the songbook. It stores nothing and never opens or
   turns a page by itself. */
(function () {
  'use strict';
  function level() { return document.documentElement.getAttribute('data-intensity') || 'regular'; }

  function bind(book) {
    var shut = book.querySelector('[data-notebook-open]');
    var inside = book.querySelector('[data-notebook-book]');
    var pages = book.querySelector('[data-notebook-pages]');
    var sweep = book.querySelector('[data-notebook-sweep]');
    var says = book.querySelector('[data-notebook-says]');
    var controls = book.querySelector('[data-notebook-controls]');
    if (!pages || !shut || !inside || !controls) return;
    var list = pages.querySelectorAll(':scope > li');
    if (!list.length) return;
    function current() { return Math.round(pages.scrollLeft / Math.max(1, pages.clientWidth)); }
    function say(text) {
      if (!says) return;
      says.textContent = '';
      setTimeout(function () { says.textContent = text; }, 50);
    }
    function describe(i) {
      var page = list[i];
      if (page.hasAttribute('data-notebook-say')) return page.getAttribute('data-notebook-say');
      var img = page.querySelector('img');
      var note = page.querySelector('.yurt-notebook__note:not(.yurt-notebook__note--blank)');
      return (note ? note.textContent + '. ' : '') + (img ? img.alt : '');
    }
    function sweepNow() {
      if (!sweep || level() === 'gentle') return;
      sweep.classList.remove('is-turning'); void sweep.offsetWidth; sweep.classList.add('is-turning');
    }
    function turn(by) {
      var n = list.length, i = ((current() + by) % n + n) % n;
      sweepNow();
      pages.scrollTo({ left: i * pages.clientWidth, behavior: 'auto' });
      say(describe(i));
    }
    function open() {
      shut.hidden = true;
      inside.hidden = false;
      controls.hidden = false;
      pages.scrollLeft = 0;
      if (level() !== 'gentle') {
        inside.classList.remove('is-opening'); void inside.offsetWidth; inside.classList.add('is-opening');
      }
      pages.focus();
      say('The book is open at the first page. ' + describe(0));
    }
    function close() {
      inside.hidden = true;
      controls.hidden = true;
      shut.hidden = false;
      shut.focus();
      say('The book is shut.');
    }
    shut.addEventListener('click', open);
    book.querySelector('[data-notebook-prev]').addEventListener('click', function () { turn(-1); });
    book.querySelector('[data-notebook-next]').addEventListener('click', function () { turn(1); });
    book.querySelector('[data-notebook-close]').addEventListener('click', close);
    inside.hidden = true;
    shut.hidden = false;
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-notebook]'), bind);
})();

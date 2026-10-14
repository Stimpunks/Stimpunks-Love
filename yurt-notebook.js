/* Nature Notes, the Faery Yurt's notebook, 2026-10-14: the pages already swipe
   with no script; this adds Turn back and Turn the page, a sweep across the
   page on the press (none at Gentle), and says the photograph's description
   when somebody presses. It stores nothing and never turns a page by itself. */
(function () {
  'use strict';
  var book = document.querySelector('[data-notebook]');
  if (!book) return;
  var pages = book.querySelector('[data-notebook-pages]');
  var sweep = book.querySelector('[data-notebook-sweep]');
  var says = book.querySelector('[data-notebook-says]');
  var list = pages.querySelectorAll('.yurt-notebook__page');
  if (!list.length) return;
  function level() { return document.documentElement.getAttribute('data-intensity') || 'regular'; }
  function current() { return Math.round(pages.scrollLeft / Math.max(1, pages.clientWidth)); }
  function turn(by) {
    var n = list.length, i = ((current() + by) % n + n) % n;
    if (level() !== 'gentle') { sweep.classList.remove('is-turning'); void sweep.offsetWidth; sweep.classList.add('is-turning'); }
    pages.scrollTo({ left: i * pages.clientWidth, behavior: 'auto' });
    var img = list[i].querySelector('img');
    says.textContent = '';
    setTimeout(function () { says.textContent = img ? img.alt : ''; }, 50);
  }
  book.querySelector('[data-notebook-prev]').addEventListener('click', function () { turn(-1); });
  book.querySelector('[data-notebook-next]').addEventListener('click', function () { turn(1); });
  book.querySelector('[data-notebook-controls]').hidden = false;
})();

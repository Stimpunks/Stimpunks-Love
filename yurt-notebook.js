/* Nature Notes, the Faery Yurt's field book, Helen's asks, 2026-10-14. With no
   script the book is open and its pages swipe. This shuts it behind its cover,
   opens it on the press, adds Turn back, Turn the page and Close the book, a
   sweep across the page on the press (none at Gentle), and says each
   photograph's description when somebody turns to it. It stores nothing and
   never opens or turns a page by itself. */
(function () {
  'use strict';
  var book = document.querySelector('[data-notebook]');
  if (!book) return;
  var shut = book.querySelector('[data-notebook-open]');
  var inside = book.querySelector('[data-notebook-book]');
  var pages = book.querySelector('[data-notebook-pages]');
  var sweep = book.querySelector('[data-notebook-sweep]');
  var says = book.querySelector('[data-notebook-says]');
  var controls = book.querySelector('[data-notebook-controls]');
  var list = pages.querySelectorAll('.yurt-notebook__page');
  if (!list.length || !shut || !inside) return;
  function level() { return document.documentElement.getAttribute('data-intensity') || 'regular'; }
  function current() { return Math.round(pages.scrollLeft / Math.max(1, pages.clientWidth)); }
  function say(text) {
    says.textContent = '';
    setTimeout(function () { says.textContent = text; }, 50);
  }
  function describe(i) {
    var img = list[i].querySelector('img');
    var note = list[i].querySelector('.yurt-notebook__note:not(.yurt-notebook__note--blank)');
    return (note ? note.textContent + '. ' : '') + (img ? img.alt : '');
  }
  function sweepNow() {
    if (level() === 'gentle') return;
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
})();

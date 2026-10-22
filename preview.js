/* preview.js: a record's preview beside its name in a list, when the pointer
   rests on the name or the keyboard lands on it (Norah's ask, 2026-10-21):
   Tasks' list, and the office's grant requests and cases. Two pages took it
   up at once, so it is one file from the start, as comments.js is.

   IT KEEPS WCAG's THREE RULES FOR CONTENT ON HOVER OR FOCUS (1.4.13).
   Escape puts it away without moving the pointer or the keyboard, and it
   stays away until the pointer leaves that name or the keyboard does. The
   pointer can move onto it without it going. And it stays until the pointer
   or the keyboard leaves, Escape, or the list is drawn again.

   NOTHING ON IT CAN BE PRESSED OR REACHED BY THE KEYBOARD, links included,
   because the record's own page is one press away with all of it. So it is
   aria-hidden: a screen reader would otherwise hear a description at every
   row of the list. A touch shows nothing, because a tap opens the record.

   It sets no colour and talks to no server of its own. A page makes one, with
   a prefix for its classes (tk- or of-) and the box it stands in, and each
   list hands every name it watches its own way of reading the record
   (read(id), a promise, which the page keeps a copy of) and of drawing it
   (draw(card, id, got), with got null until it has been read). Nothing is
   kept in the browser. Nothing moves: it appears where it will stay, and goes. */
(function () {
  'use strict';

  var SHOW = 450, HIDE = 250, GAP = 10, EDGE = 8;

  window.lovePreview = function (o) {
    var p = o.p, card = null, at = null, timer = 0, reads = 0;
    // The name Escape put away, until the pointer or the keyboard leaves it; and whether the pointer is over the name or the card.
    var away = null, over = false;

    function later(fn, ms) { clearTimeout(timer); timer = setTimeout(fn, ms); }
    function make() {
      if (card && card.isConnected) return card;
      card = document.createElement('div');
      card.className = p + '-peek';
      card.setAttribute('aria-hidden', 'true');
      card.hidden = true;
      card.addEventListener('pointerenter', function (e) { if (e.pointerType === 'touch') return; over = true; clearTimeout(timer); });
      card.addEventListener('pointerleave', function (e) { if (e.pointerType === 'touch') return; over = false; leave(); });
      o.box.appendChild(card);
      return card;
    }

    /* Beside the name's cell, so the names under it stay in reach, and under
       the name where there is no room beside it; never off the window. */
    function place(a) {
      var c = make(), b = o.box.getBoundingClientRect();
      var cell = a.closest('td, th') || a, r = cell.getBoundingClientRect(), n = a.getBoundingClientRect();
      c.style.left = '0px'; c.style.top = '0px';
      var w = c.offsetWidth, h = c.offsetHeight, x, y;
      var vw = document.documentElement.clientWidth, vh = window.innerHeight;
      if (r.right + GAP + w <= Math.min(b.right, vw) - EDGE) { x = r.right + GAP; y = n.top - 6; }
      else {
        x = Math.max(b.left + EDGE, Math.min(n.left, Math.min(b.right, vw) - w - EDGE));
        y = n.bottom + 6;
        if (y + h > vh - EDGE && n.top - 6 - h >= EDGE) y = n.top - 6 - h;
      }
      if (y + h > vh - EDGE) y = vh - EDGE - h;
      if (y < EDGE) y = EDGE;
      c.style.left = (x - b.left - o.box.clientLeft) + 'px';
      c.style.top = (y - b.top - o.box.clientTop) + 'px';
    }

    /* What markdown.js builds to be pressed or reached, made words: a preview
       is read, and pressed only by its name in the list. */
    function still(c) {
      Array.prototype.slice.call(c.querySelectorAll('a')).forEach(function (a) {
        var s = document.createElement('span');
        s.className = a.className;
        while (a.firstChild) s.appendChild(a.firstChild);
        a.parentNode.replaceChild(s, a);
      });
      Array.prototype.forEach.call(c.querySelectorAll('[tabindex]'), function (x) { x.removeAttribute('tabindex'); });
      Array.prototype.forEach.call(c.querySelectorAll('input, button, select, textarea'), function (x) { x.disabled = true; x.tabIndex = -1; });
    }

    function draw(a, id, got, w) {
      var c = make();
      c.textContent = '';
      w.draw(c, id, got);
      still(c);
      place(a);
    }
    function show(a, id, w) {
      if (!a.isConnected || away === a) return;
      var c = make(), mine = ++reads;
      at = a;
      c.hidden = false;
      draw(a, id, null, w);
      w.read(id).then(function (got) {
        if (mine !== reads || at !== a || c.hidden || !a.isConnected || !got) return;
        draw(a, id, got, w);
      });
    }
    function hide() {
      clearTimeout(timer);
      reads++;
      at = null;
      if (card) card.hidden = true;
    }

    function focused(a) { var r = a.getRootNode ? a.getRootNode() : document; return (r.activeElement || document.activeElement) === a; }
    // The pointer gone from the name and the card: away, unless the keyboard is still on the name it shows.
    function leave() { later(function () { if (at && focused(at)) return; hide(); }, HIDE); }

    /* A name in the list that shows its record's preview: w is { read, draw }. */
    function watch(a, id, w) {
      a.addEventListener('pointerenter', function (e) {
        if (e.pointerType === 'touch') return;
        over = true;
        if (away === a) return;
        if (at === a) { clearTimeout(timer); return; }
        later(function () { show(a, id, w); }, SHOW);
      });
      a.addEventListener('pointerleave', function (e) {
        if (e.pointerType === 'touch') return;
        over = false;
        if (away === a && !focused(a)) away = null;
        leave();
      });
      a.addEventListener('focus', function () {
        if (!a.matches(':focus-visible')) return;
        later(function () { show(a, id, w); }, SHOW);
      });
      a.addEventListener('blur', function () {
        if (away === a && !over) away = null;
        if (!over) later(hide, 0);
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !card || card.hidden) return;
      away = at;
      hide();
    });
    window.addEventListener('hashchange', hide);
    window.addEventListener('resize', hide);

    return { watch: watch, hide: hide };
  };
})();

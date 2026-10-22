/* links.js: the [[ menu (Ryan's ask, 2026-10-21, after Notion's links). In any
   box that takes words, typing [[ and a few letters of a name offers the
   tasks, forum topics, grant requests, cases and contacts the writer can
   open, and picking one puts [[kind:id]] in the words: a link, never a name,
   which every reader sees named only if they could open it (lib.mjs, links).
   Tasks, the office, the forums and the radio each attach it to their boxes.

   THE ARIA COMBOBOX PATTERN, the radio's # list's: arrows move, Enter or Tab
   puts the link in, Escape closes it for that [[ and leaves what was typed
   alone. The box keeps its own @ list if it has one; whichever is open says
   so in aria-controls. A pick says what it put in, into the page's own words
   (o.said), because a token is not what anybody expects to hear read back.

   It sets no colour and talks to no server of its own: the list wears the
   radio's cb-pick and cb-opt, and each page hands it its own way of asking
   (o.ask(q), a promise of [{ kind, id, name, about }], which is a POST, so
   nothing typed is ever in an address). Nothing is kept in the browser. */
(function () {
  'use strict';

  var KIND = { task: 'Task', topic: 'Forum topic', grant: 'Grant request', 'case': 'Case', contact: 'Contact' };
  var WAIT = 160, n = 0;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  /* o: { ask(q), said(text)?, after()?, above (the list over the box, as the radio's # list is) } */
  function attach(text, o) {
    var id = 'love-links-' + (++n);
    var pick = el('ul', 'cb-pick love-linkpick');
    pick.id = id;
    pick.setAttribute('role', 'listbox');
    pick.setAttribute('aria-label', 'Things to link');
    pick.hidden = true;
    text.parentNode.insertBefore(pick, o.above ? text : text.nextSibling);
    if (!text.getAttribute('role')) {
      text.setAttribute('role', 'combobox');
      text.setAttribute('aria-autocomplete', 'list');
      text.setAttribute('aria-expanded', 'false');
    }
    var offer = [], active = -1, dismissed = -1, timer = 0, asked = 0, other = null;

    /* The [[ being typed at the caret: where it starts and the words after it. */
    function token() {
      var c = text.selectionStart;
      if (c == null || c !== text.selectionEnd) return null;
      var m = text.value.slice(0, c).match(/\[\[([^\[\]\n]{0,60})$/);
      return m ? { start: c - m[0].length, end: c, q: m[1] } : null;
    }
    function focused() { var r = text.getRootNode ? text.getRootNode() : document; return (r.activeElement || document.activeElement) === text; }
    function shut() {
      if (pick.hidden) return;
      pick.hidden = true; pick.textContent = ''; offer = []; active = -1;
      text.setAttribute('aria-expanded', 'false');
      text.removeAttribute('aria-activedescendant');
      if (other != null) text.setAttribute('aria-controls', other); else text.removeAttribute('aria-controls');
      other = null;
    }
    function mark(k) {
      active = k;
      for (var i = 0; i < pick.children.length; i++) pick.children[i].setAttribute('aria-selected', String(i === k));
      var li = pick.children[k];
      if (li && offer[k]) { text.setAttribute('aria-activedescendant', li.id); if (li.scrollIntoView) li.scrollIntoView({ block: 'nearest' }); }
      else text.removeAttribute('aria-activedescendant');
    }
    function draw(list, q) {
      if (pick.hidden) { other = text.getAttribute('aria-controls'); }
      pick.textContent = '';
      offer = list;
      if (!list.length) {
        var none = el('li', 'cb-opt', q ? 'Nothing you can open is called that.' : 'Nothing to link yet.');
        none.setAttribute('role', 'option'); none.setAttribute('aria-disabled', 'true'); none.id = id + '-none';
        pick.appendChild(none);
      }
      list.forEach(function (x, i) {
        var li = el('li', 'cb-opt');
        li.id = id + '-' + i;
        li.setAttribute('role', 'option');
        var name = el('span', 'cb-opt__name');
        name.appendChild(el('b', null, (KIND[x.kind] || 'A record') + ': '));
        name.appendChild(document.createTextNode(x.name));
        li.appendChild(name);
        if (x.about) li.appendChild(el('span', 'cb-opt__tag', x.about));
        li.addEventListener('mousedown', function (e) { e.preventDefault(); });
        li.addEventListener('click', function () { choose(i); });
        pick.appendChild(li);
      });
      pick.hidden = false;
      text.setAttribute('aria-controls', id);
      text.setAttribute('aria-expanded', 'true');
      mark(list.length ? 0 : -1);
    }
    function complete() {
      var t = focused() && token();
      if (!t || t.start === dismissed) { if (!t) dismissed = -1; clearTimeout(timer); shut(); return; }
      clearTimeout(timer);
      timer = setTimeout(function () {
        var mine = ++asked;
        Promise.resolve(o.ask(t.q.trim())).then(function (list) {
          var now = focused() && token();
          if (mine !== asked || !now || now.start !== t.start) return;
          draw((list || []).slice(0, 24), t.q.trim());
        }, function () { if (mine === asked) shut(); });
      }, WAIT);
    }
    function choose(k) {
      var t = token(), x = offer[k];
      if (!t || !x) { shut(); return; }
      var put = '[[' + x.kind + ':' + x.id + ']] ', v = text.value;
      text.value = v.slice(0, t.start) + put + v.slice(t.end);
      var c = t.start + put.length;
      text.setSelectionRange(c, c);
      shut();
      text.focus();
      text.dispatchEvent(new Event('input', { bubbles: true }));
      if (o.said) o.said('Linked ' + (KIND[x.kind] || 'a record').toLowerCase() + ' “' + x.name + '”.');
      if (o.after) o.after();
    }
    text.addEventListener('keydown', function (e) {
      if (pick.hidden || e.isComposing) return;
      var len = offer.length;
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); var t = token(); dismissed = t ? t.start : -1; shut(); return; }
      if (!len) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); mark((active + 1) % len); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); mark((active - 1 + len) % len); }
      else if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); e.stopImmediatePropagation(); choose(active); }
    }, true);  // first, so Enter picks a link rather than sending what is half typed
    text.addEventListener('input', complete);
    text.addEventListener('click', complete);
    text.addEventListener('blur', function () { setTimeout(function () { if (!focused()) shut(); }, 150); });
    return { shut: shut };
  }

  /* LINKED FROM: the backlinks the server found this reader could open, each
     what it is and its name, linked, the latest changed first; nothing when
     there are none, and never how many. o: { p (prefix), heading(level, text) } */
  var ON = { task: 'the task', topic: 'the topic', grant: 'the grant request', 'case': 'the case', contact: 'the contact',
    mailing: 'a mailing', template: 'a template', email: 'an email' };
  function backlinks(list, o) {
    if (!list || !list.length) return null;
    var p = o.p, sec = el('section', p + '-linked');
    sec.appendChild(o.heading(3, 'Linked from'));
    var ul = el('ul', p + '-linked__list');
    list.forEach(function (b) {
      if (typeof b.href !== 'string' || !/^\/[a-z-]+\.html#\//.test(b.href)) return;
      var li = el('li', p + '-linked__item');
      var what = b.from === 'comment' ? 'A comment on ' + (ON[b.on] || 'it') : b.from === 'post' ? 'A reply in the topic'
        : b.from === 'topic' ? 'Forum topic' : KIND[b.from] || 'A link';
      li.appendChild(el('span', p + '-linked__what', what + (b.name ? ': ' : '')));
      var a = el('a', null, b.name || 'open it');
      a.href = b.href;
      li.appendChild(a);
      if (b.about) li.appendChild(el('span', p + '-linked__about', ' · ' + b.about));
      ul.appendChild(li);
    });
    sec.appendChild(ul);
    return sec;
  }

  window.loveLinks = { attach: attach, backlinks: backlinks, KIND: KIND };
})();

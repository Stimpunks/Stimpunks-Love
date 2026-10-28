/* links.js: the [[ menu (Ryan's ask, 2026-10-21, after Notion's links), the
   @ list and the drawing of a mention for the pages that had neither (the
   same day: Tasks and the office; the forums' mentions moved here with them,
   and the radio keeps its own, in its own file), and the ! list of the team's
   snippets (2026-10-27). In any
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

  /* THE MENU ON A BOX, for [[ and for @: cfg.token() is what is being typed at
     the caret, cfg.find(q) a promise of what to offer, cfg.row(li, x) draws
     one, cfg.put(x) is what a pick puts in the words and cfg.told(x) what it
     says. */
  function menu(text, cfg, o) {
    var id = 'love-links-' + (++n);
    var pick = el('ul', 'cb-pick love-linkpick');
    pick.id = id;
    pick.setAttribute('role', 'listbox');
    pick.setAttribute('aria-label', cfg.label);
    pick.hidden = true;
    text.parentNode.insertBefore(pick, o.above ? text : text.nextSibling);
    if (!text.getAttribute('role')) {
      text.setAttribute('role', 'combobox');
      text.setAttribute('aria-autocomplete', 'list');
      text.setAttribute('aria-expanded', 'false');
    }
    var offer = [], active = -1, dismissed = -1, timer = 0, asked = 0, other = null;

    function token() {
      var c = text.selectionStart;
      if (c == null || c !== text.selectionEnd) return null;
      return cfg.token(text.value.slice(0, c), c);
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
        var none = el('li', 'cb-opt', cfg.empty(q));
        none.setAttribute('role', 'option'); none.setAttribute('aria-disabled', 'true'); none.id = id + '-none';
        pick.appendChild(none);
      }
      list.forEach(function (x, i) {
        var li = el('li', 'cb-opt');
        li.id = id + '-' + i;
        li.setAttribute('role', 'option');
        cfg.row(li, x);
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
        Promise.resolve(cfg.find(t.q)).then(function (list) {
          var now = focused() && token();
          if (mine !== asked || !now || now.start !== t.start) return;
          if (list === null) { shut(); return; }
          draw((list || []).slice(0, 24), t.q);
        }, function () { if (mine === asked) shut(); });
      }, cfg.wait);
    }
    /* A pick goes in as typing would, so Undo takes it back (format.js's way);
       where the browser will not, the words are set and the box told. */
    function choose(k) {
      var t = token(), x = offer[k];
      if (!t || !x) { shut(); return; }
      var put = cfg.put(x, text.value.slice(0, t.start)), v = text.value, ok = false;
      shut();
      text.focus();
      text.setSelectionRange(t.start, t.end);
      try { ok = document.execCommand('insertText', false, put); } catch (e) { ok = false; }
      if (!ok || text.value === v) {
        text.value = v.slice(0, t.start) + put + v.slice(t.end);
        text.dispatchEvent(new Event('input', { bubbles: true }));
      }
      var c = t.start + put.length;
      text.setSelectionRange(c, c);
      if (o.said) o.said(cfg.told(x));
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
    }, true);  // first, so Enter picks rather than sending what is half typed
    text.addEventListener('input', complete);
    text.addEventListener('click', complete);
    text.addEventListener('blur', function () { setTimeout(function () { if (!focused()) shut(); }, 150); });
    return { shut: shut };
  }

  /* [[ and a few letters: the tasks, topics and records the writer can open.
     o: { ask(q), said(text)?, after()?, above (the list over the box, as the radio's # list is) } */
  function attach(text, o) {
    return menu(text, {
      label: 'Things to link', wait: WAIT,
      token: function (before, c) { var m = before.match(/\[\[([^\[\]\n]{0,60})$/); return m ? { start: c - m[0].length, end: c, q: m[1].trim() } : null; },
      find: function (q) { return o.ask(q); },
      empty: function (q) { return q ? 'Nothing you can open is called that.' : 'Nothing to link yet.'; },
      row: function (li, x) {
        var name = el('span', 'cb-opt__name');
        name.appendChild(el('b', null, (KIND[x.kind] || 'A record') + ': '));
        name.appendChild(document.createTextNode(x.name));
        li.appendChild(name);
        if (x.about) li.appendChild(el('span', 'cb-opt__tag', x.about));
      },
      put: function (x) { return '[[' + x.kind + ':' + x.id + ']] '; },
      told: function (x) { return 'Linked ' + (KIND[x.kind] || 'a record').toLowerCase() + ' “' + x.name + '”.'; },
    }, o);
  }

  /* @ and a few letters: the people the words can mention, the forums' and
     the radio's @ list for Tasks and the office (Ryan's ask, 2026-10-21). A
     handle can have spaces in it, so up to three words follow the @, as the
     forums' list had it. The roles the page says its reader may call
     (@moderator and the rest, Ryan's ask, 2026-10-23) come first, each saying
     what it calls and never who holds it.
     o: { people() (the handles to offer), roles()? (the roles), me (your own, never offered), said(text)?, after()? } */
  function fold(h) { return String(h || '').normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim(); }
  var ROLE_SAYS = { administrator: 'Calls every administrator', board: 'Calls the board', director: 'Calls every director', moderator: 'Calls every moderator' };
  var ROLE_OPT = {};
  Object.keys(ROLE_SAYS).forEach(function (r) { ROLE_OPT[r] = { role: r }; });
  function people(text, o) {
    return menu(text, {
      label: 'People to mention', wait: 0,
      token: function (before, c) {
        var m = before.match(/(^|[^\p{L}\p{N}_@])@([^\s@][^\n@]{0,23})$/u) || before.match(/(^|[^\p{L}\p{N}_@])@()$/u);
        if (!m || (m[2].match(/ /g) || []).length > 3 || / {2}$/.test(m[2])) return null;
        return { start: c - m[2].length - 1, end: c, q: fold(m[2]), done: / $/.test(m[2]) };
      },
      find: function (q) {
        var all = (o.people() || []).filter(function (h) { return h && fold(h) !== fold(o.me) && !ROLE_SAYS[fold(h)]; });
        var roles = ((o.roles && o.roles()) || []).filter(function (r) { return ROLE_SAYS[r]; });
        // A name typed out in full, with a space after it, is finished.
        if (/ $/.test(q) && (all.some(function (h) { return fold(h) === q.trim(); }) || ROLE_SAYS[q.trim()])) return null;
        var qq = q.trim();
        return roles.filter(function (r) { return !qq || r.indexOf(qq) === 0; }).map(function (r) { return ROLE_OPT[r]; })
          .concat(all.filter(function (h) { var f = fold(h); return !qq || f.indexOf(qq) === 0 || f.split(' ').some(function (w) { return w.indexOf(qq) === 0; }); })).slice(0, 8);
      },
      empty: function () { return 'Nobody here is called that.'; },
      row: function (li, h) {
        if (!h.role) { li.appendChild(el('span', 'cb-opt__name', h)); return; }
        li.appendChild(el('span', 'cb-opt__name', '@' + h.role));
        li.appendChild(el('span', 'cb-opt__tag', ROLE_SAYS[h.role]));
      },
      put: function (h) { return '@' + (h.role || h) + ' '; },
      told: function (h) { return h.role ? 'Mentioned @' + h.role + '.' : 'Mentioned ' + h + '.'; },
    }, o);
  }

  /* ! and a few letters: the team's snippets (Ryan's ask, 2026-10-27, after
     Simple Markdown Snippets, which uses ! too), words written once in Tasks
     and put into the box whole: a checklist with a line for every director,
     say. The ! opens it only at the start of a line or after a space, so an
     exclamation mark at the end of a word never does, and a bare ! with
     nothing after it only at the start of a line, so "Great !" stays words;
     ![ is a picture and never a snippet, because [ is not a letter. Words of
     several lines start on a line of their own and end with one. What goes
     in is `put`, which the server filled for this reader ({directors} and
     the rest, and {me}), with {today} filled here, in the reader's own day.
     o: { list() (a promise of [{ id, name, body, put }]), said(text)?, after()? } */
  function today() { return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); }
  function filled(x) { return String(x.put != null ? x.put : x.body || '').replace(/\{today\}/g, today()); }
  function snippets(text, o) {
    return menu(text, {
      label: 'Snippets', wait: 0,
      token: function (before, c) {
        var m = before.match(/(^|\s)!([\p{L}\p{N}][\p{L}\p{N}'’-]{0,39})?$/u);
        if (!m) return null;
        var q = m[2] || '';
        if (!q && m[1] !== '' && m[1] !== '\n') return null;
        return { start: c - q.length - 1, end: c, q: fold(q) };
      },
      find: function (q) {
        return Promise.resolve(o.list()).then(function (all) {
          return (all || []).filter(function (x) {
            var f = fold(x.name);
            return !q || f.indexOf(q) === 0 || f.split(/[\s'’-]+/).some(function (w) { return w.indexOf(q) === 0; });
          }).slice(0, 12);
        });
      },
      empty: function (q) { return q ? 'No snippet is called that.' : 'There are no snippets yet. Make them under Snippets in Tasks.'; },
      row: function (li, x) {
        li.appendChild(el('span', 'cb-opt__name', x.name));
        var first = filled(x).split('\n').filter(function (l) { return l.trim(); })[0] || '';
        var cs = Array.from(first);
        if (first) li.appendChild(el('span', 'cb-opt__tag', cs.length > 60 ? cs.slice(0, 59).join('') + '…' : first));
      },
      put: function (x, before) {
        var body = filled(x);
        if (body.indexOf('\n') < 0) return body + ' ';
        return (before && !/\n$/.test(before) ? '\n' : '') + body + '\n';
      },
      told: function (x) { return 'Put in the snippet “' + x.name + '”.'; },
    }, o);
  }

  /* A MENTION DRAWN AS THE NAME IT IS, which opens that person's profile, as on
     the radio and in the forums: only for the handles given (o.handles: the
     people the words could mention), matched as the server's mentions()
     matches, so an @ followed by nobody stays words. Yours is marked. Not
     inside a link, code or a button. Answers whether you were mentioned.
     A role the words call (o.roles: the ones the server kept with a post, or
     every role a page's writers may call) is words in a mention's ink with
     nothing to press, and marked when the reader holds it (o.mine).
     o: { p (prefix), me, roles?, mine?, said(text)? } */
  function mentions(into, handles, o) {
    var list = [];
    var called = (o.roles || []).filter(function (r) { return ROLE_SAYS[r]; }), mine = o.mine || [];
    (handles || []).forEach(function (h) { if (typeof h === 'string' && h.trim() && !ROLE_SAYS[fold(h)] && list.every(function (x) { return fold(x) !== fold(h); })) list.push(h); });
    list = list.concat(called);
    if (!list.length) return false;
    list.sort(function (a, b) { return b.length - a.length; });
    var escd = list.map(function (h) { return h.normalize('NFKC').trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+'); });
    var re;
    try { re = new RegExp('(^|[^\\p{L}\\p{N}_@])@(' + escd.join('|') + ')(?![\\p{L}\\p{N}_]|:\\d)', 'giu'); } catch (e) { return false; }
    var texts = [], mineToo = false;
    var walk = document.createTreeWalker(into, NodeFilter.SHOW_TEXT, {
      acceptNode: function (t) { return t.parentNode && t.parentNode.closest('a, code, pre, button') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; },
    });
    while (walk.nextNode()) texts.push(walk.currentNode);
    texts.forEach(function (t) {
      var words = t.nodeValue, last = 0, m, frag = null;
      re.lastIndex = 0;
      while ((m = re.exec(words))) {
        frag = frag || document.createDocumentFragment();
        var at = m.index + m[1].length;
        frag.appendChild(document.createTextNode(words.slice(last, at)));
        var named = m[2].replace(/\s+/g, ' ');
        if (called.indexOf(fold(named)) >= 0) {
          var held = mine.indexOf(fold(named)) >= 0;
          if (held) mineToo = true;
          var r = el('span', o.p + '-at ' + o.p + '-at--role' + (held ? ' ' + o.p + '-at--me' : ''), '@' + m[2]);
          if (held) r.appendChild(el('span', 'sr', ', a role you hold'));
          frag.appendChild(r);
          last = at + 1 + m[2].length;
          continue;
        }
        var h = list.filter(function (x) { return fold(x) === fold(named); })[0] || named;
        var isMe = !!o.me && fold(h) === fold(o.me);
        if (isMe) mineToo = true;
        var b = el('button', o.p + '-at' + (isMe ? ' ' + o.p + '-at--me' : ''), '@' + m[2]);
        b.type = 'button';
        b.setAttribute('aria-haspopup', 'dialog');
        b.setAttribute('aria-label', isMe ? '@' + h + ', you. Opens your profile.' : '@' + h + '. Opens their profile.');
        (function (who, btn) {
          btn.addEventListener('click', function () {
            if (window.loveRadioPeek) window.loveRadioPeek(who, btn, null);
            else if (o.said) o.said('Open the radio, in the corner, to see ' + who + '’s profile.');
          });
        })(h, b);
        frag.appendChild(b);
        last = at + 1 + m[2].length;
      }
      if (frag) { frag.appendChild(document.createTextNode(words.slice(last))); t.parentNode.replaceChild(frag, t); }
    });
    return mineToo;
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

  window.loveLinks = { attach: attach, people: people, snippets: snippets, mentions: mentions, backlinks: backlinks, KIND: KIND };
})();

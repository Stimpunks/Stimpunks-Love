/* =============================================================================
   The street's one builder for Markdown the CB has already read. The server
   reads what somebody typed once, into plain nodes (parseBrass in
   netlify/cb/lib.mjs), and this turns those nodes into elements with
   createElement and textContent, so nothing anybody types becomes markup on a
   page. The Brass Tacks Board was the first to need it and kept it in brass.js;
   the suggestion box in The Sandbox was the second, so it moved here, which is
   the street's rule for a pattern taken up twice (rack.js, table.js).

   NEITHER PAGE MAY BUILD WHAT SOMEBODY TYPED ANY OTHER WAY. tools/make-brass.py
   and tools/make-sandbox.py refuse innerHTML, outerHTML, insertAdjacentHTML,
   document.write and their relatives in this file and in theirs.

   window.loveMarkdown.blocks(nodes, into, { top, prefix })
     top     added to a heading's level, because "# heading" in a post is a
             heading under the post's own title, never a page heading
     prefix  the room's class prefix, for the only two things this names: the
             host shown after a link off the street (PREFIX-host) and the
             scrolling box round a table (PREFIX-table). Each room dresses them
             in its own section.
     pic     for a page whose posts hold pictures (the forums, 2026-10-20): a
             function given a picture node the server placed in the words,
             { id, alt }, that answers the element to stand there. Without
             one, a picture is its description, as words.
     box     for a page whose words hold checkboxes (tasks, 2026-10-20; the
             server marks them only where it is asked to): a function given a
             box the server marked, { n, on, raw }, and its checkbox, which it
             makes tickable. Without one, a box is drawn ticked or not, and
             cannot be changed there. Each box is named by its item's words.
     head    for a page whose headings can be linked to (the forums,
             2026-10-24): a function given each heading once its words are in
             it, which may give it an id and a link to itself.

   A SPOILER, ||words|| (2026-11-06, after Discord's), arrives as { t: 'spoil' }
   and is drawn hidden, a bar in the words' own ink, until it is pressed; then
   its words show for good on this page. Its words are hidden from a screen
   reader too (visibility), its button says what it is, and a spoiler on a card
   whose buttons are disabled (preview.js) stays hidden. The radio draws its own
   the same way (spoiler() in cb.js); love.css §4 and cb.css style [data-spoiler].

   OUR OWN EMOJI (2026-11-06, the CB's "Custom emoji"): every :name: with a
   letter in it, outside code and links, is marked as it is drawn, and a page
   signed on to the CB (the forums, Tasks and the office) asks /cb/emoji for
   the list itself, once, and hands it to loveMarkdown.emoji(list), which draws
   each one the street has as its picture, with :name: as its words. This file
   asks nothing of anybody. A name the street does not have stays the words
   that were typed, and a page that never hands it a list (the Brass Tacks
   Board, the suggestion box, the notice) shows the words.

   A LINK TO A TASK, A TOPIC OR A RECORD OF THE OFFICE (2026-10-21, links.js)
   arrives named for its reader by the server: { name, href } is drawn as a
   link, PREFIX-ref, with what it is before its name; { shut } as words saying
   it is one they can't open, and { gone } as words saying it has gone. A name
   is never guessed here: without one there is none.
   ============================================================================= */
(function () {
  'use strict';

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  var KIND = { task: 'Task', topic: 'Forum topic', grant: 'Grant request', 'case': 'Case', contact: 'Contact' };
  var WORDS = { task: 'a task', topic: 'a forum topic', grant: 'a grant request', 'case': 'a case', contact: 'a contact' };
  function ref(n, o) {
    var words = WORDS[n.kind] || 'a link';
    if (n.name && typeof n.href === 'string' && /^\/[a-z-]+\.html#\//.test(n.href)) {
      var a = el('a', o.prefix + '-ref');
      a.href = n.href;
      a.appendChild(el('span', o.prefix + '-ref__kind', (KIND[n.kind] || 'Link') + ': '));
      a.appendChild(document.createTextNode(n.name));
      return a;
    }
    return el('span', o.prefix + '-ref ' + o.prefix + '-ref--shut',
      n.gone ? words + (n.kind === 'topic' ? ' that has gone' : ' since deleted') : n.shut ? words + ' you can’t open' : words);
  }

  function spoiler(n, o) {
    var sp = el('span', o.prefix + '-spoiler'), btn = el('button', null, 'A spoiler: show it'), w = el('span');
    sp.setAttribute('data-spoiler', 'hidden');
    sp.title = 'A spoiler: press to show it';
    btn.type = 'button';
    w.setAttribute('data-spoiler-words', '');
    w.tabIndex = -1;
    inline(n.c || [], w, o);
    sp.addEventListener('click', function () {
      if (sp.getAttribute('data-spoiler') !== 'hidden' || btn.disabled) return;
      sp.setAttribute('data-spoiler', 'shown');
      sp.removeAttribute('title');
      var back = sp.getRootNode().activeElement === btn;
      btn.remove();
      if (back) w.focus();
    });
    sp.appendChild(btn);
    sp.appendChild(w);
    return sp;
  }

  function inline(nodes, into, o) {
    nodes.forEach(function (n) {
      if (n.t === 'text') into.appendChild(document.createTextNode(n.v));
      else if (n.t === 'spoil') into.appendChild(spoiler(n, o));
      else if (n.t === 'br') into.appendChild(el('br'));
      else if (n.t === 'code') into.appendChild(el('code', null, n.v));
      else if (n.t === 'b' || n.t === 'i' || n.t === 's') { var w = el({ b: 'strong', i: 'em', s: 'del' }[n.t]); inline(n.c, w, o); into.appendChild(w); }
      else if (n.t === 'pic') into.appendChild(o.pic ? o.pic(n) : document.createTextNode(n.alt || ''));
      else if (n.t === 'ref') into.appendChild(ref(n, o));
      else if (n.t === 'a') {
        var a = el('a'); a.href = n.href; inline(n.c, a, o);
        try {
          var u = new URL(n.href, location.href);
          if (/^https?:$/.test(u.protocol) && u.host !== location.host) {
            a.rel = 'noopener noreferrer';
            into.appendChild(a);
            into.appendChild(el('span', o.prefix + '-host', ' ↗ ' + u.host));
            return;
          }
        } catch (e) {}
        into.appendChild(a);
      }
    });
  }

  function blocks(nodes, into, o) {
    nodes.forEach(function (b) {
      var e;
      if (b.t === 'p') { e = el('p'); inline(b.c, e, o); }
      else if (b.t === 'h') { e = el('h' + Math.min(6, b.level + o.top)); inline(b.c, e, o); if (o.head) o.head(e); }
      else if (b.t === 'hr') e = el('hr');
      else if (b.t === 'code') { e = el('pre'); e.appendChild(el('code', null, b.v)); e.tabIndex = 0; }
      else if (b.t === 'quote') { e = el('blockquote'); blocks(b.c, e, o); }
      else if (b.t === 'ul' || b.t === 'ol') {
        e = el(b.t);
        if (b.t === 'ol' && b.start !== 1) e.start = b.start;
        b.items.forEach(function (it, k) {
          var li = el('li'); blocks(it, li, o);
          var bx = b.box && b.box[k];
          if (bx) {
            var c = el('input'); c.type = 'checkbox'; c.checked = !!bx.on;
            var first = li.firstElementChild && li.firstElementChild.tagName === 'P' ? li.firstElementChild : null;
            c.setAttribute('aria-label', (first ? first.textContent : '').trim() || 'A box with no words beside it');
            li.className = o.prefix + '-box';
            if (o.box) o.box(bx, c); else c.disabled = true;
            if (first) first.insertBefore(c, first.firstChild); else li.insertBefore(c, li.firstChild);
          }
          e.appendChild(li);
        });
      } else if (b.t === 'table') {
        var wrap = el('div', o.prefix + '-table'); wrap.tabIndex = 0;
        e = el('table');
        var thead = el('thead'), tr = el('tr');
        b.head.forEach(function (c, k) { var th = el('th'); th.scope = 'col'; if (b.align[k]) th.style.textAlign = b.align[k]; inline(c, th, o); tr.appendChild(th); });
        thead.appendChild(tr); e.appendChild(thead);
        var tb = el('tbody');
        b.rows.forEach(function (r) {
          var row = el('tr');
          r.forEach(function (c, k) { var td = el('td'); if (b.align[k]) td.style.textAlign = b.align[k]; inline(c, td, o); row.appendChild(td); });
          tb.appendChild(row);
        });
        e.appendChild(tb);
        wrap.appendChild(e);
        e = wrap;
      }
      if (e) into.appendChild(e);
    });
  }

  var EMOJI = null, ROOTS = [], EMOJI_RE = /:((?=[A-Za-z0-9_]*[A-Za-z])[A-Za-z0-9_]{2,32}):/g;
  function marks(box) {
    if (!box || box.textContent.indexOf(':') < 0) return;
    var walk = document.createTreeWalker(box, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        for (var p = n.parentNode; p && p !== box; p = p.parentNode) if (/^(CODE|PRE|A|BUTTON|KBD)$/.test(p.nodeName)) return NodeFilter.FILTER_REJECT;
        return n.nodeValue.indexOf(':') >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });
    var hits = [], n;
    while ((n = walk.nextNode())) hits.push(n);
    hits.forEach(function (t) {
      var text = t.nodeValue, at = 0, m, frag = null;
      EMOJI_RE.lastIndex = 0;
      while ((m = EMOJI_RE.exec(text))) {
        frag = frag || document.createDocumentFragment();
        if (m.index > at) frag.appendChild(document.createTextNode(text.slice(at, m.index)));
        var sp = el('span', null, m[0]);
        sp.setAttribute('data-md-emoji', m[1]);
        frag.appendChild(sp);
        at = m.index + m[0].length;
      }
      if (!frag) return;
      if (at < text.length) frag.appendChild(document.createTextNode(text.slice(at)));
      t.parentNode.replaceChild(frag, t);
    });
    var root = box.getRootNode();
    if (ROOTS.indexOf(root) < 0) ROOTS.push(root);
    draw(box);
  }
  function draw(root) {
    if (!EMOJI || !root) return;
    root.querySelectorAll('span[data-md-emoji]').forEach(function (sp) {
      var e = EMOJI[sp.getAttribute('data-md-emoji').toLowerCase()];
      if (!e) return;
      var img = el('img');
      img.src = '/cb/emoji?img=' + e.id;
      img.alt = ':' + e.name + ':';
      img.title = ':' + e.name + ':';
      img.decoding = 'async';
      img.style.height = '1.4em';
      img.style.width = 'auto';
      img.style.maxWidth = '3em';
      img.style.verticalAlign = '-0.35em';
      img.style.objectFit = 'contain';
      sp.replaceWith(img);
    });
  }

  window.loveMarkdown = {
    blocks: function (nodes, into, opts) {
      var start = into.childNodes.length;
      blocks(nodes || [], into, { top: (opts && opts.top) || 2, prefix: (opts && opts.prefix) || 'md', pic: (opts && opts.pic) || null, box: (opts && opts.box) || null, head: (opts && opts.head) || null });
      for (var i = start; i < into.childNodes.length; i++) if (into.childNodes[i].nodeType === 1) marks(into.childNodes[i]);
    },
    // Our own emoji, as the page asked /cb/emoji for them ({ id, name } each),
    // drawn wherever words have been drawn and wherever they are drawn after.
    emoji: function (list) {
      if (!Array.isArray(list)) return;
      EMOJI = {};
      list.forEach(function (e) { if (e && e.id && e.name) EMOJI[String(e.name).toLowerCase()] = e; });
      ROOTS.forEach(draw);
    },
  };
}());

/* comments.js: the comments under a task in Tasks and under a record in the
   office (Ryan's asks, 2026-10-21, after EspoCRM's stream posts and Notion's
   comments). The second page to take a pattern up moves it into one file, as
   rack.js and table.js did: the conversation, oldest first, each comment with
   who wrote it and when, its words built by markdown.js, Edit for whoever
   wrote it and Delete for them or an administrator; and the box to write one,
   with a preview. It sets no colour and talks to no server of its own: each
   page hands it a prefix for its own classes (tk- or of-), its way of asking
   its own function, and its own words for what went wrong, so Tasks dress it
   in tasks.css and the office in office.css. Nothing is kept in the browser,
   and every word is built from nodes with textContent, never as HTML. */
(function () {
  'use strict';

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  /* The box to write a comment in: its words, how Markdown works there, a
     preview, and Comment or Save, with Cancel where there is something to go
     back to. Ctrl or Cmd and Enter sends it too.
     o: { p (prefix), id, label, value, goText, max, hint, ask, why, send(text, done), cancel } */
  function box(o) {
    var p = o.p;
    var form = el('form', p + '-cform');
    var lab = el('label', 'cb-lab', o.label); lab.htmlFor = o.id;
    var text = el('textarea', 'cb-say ' + p + '-text ' + p + '-cform__text'); text.id = o.id; text.rows = 3;
    text.maxLength = o.max || 5000; text.value = o.value || '';
    text.setAttribute('aria-describedby', o.id + '-hint');
    var hint = el('p', 'cb-quiet ' + p + '-hint', o.hint); hint.id = o.id + '-hint';
    var preview = el('div', p + '-body ' + p + '-preview'); preview.hidden = true;
    var row = el('div', p + '-row');
    var go = el('button', 'cb-btn ' + p + '-small', o.goText); go.type = 'submit';
    var look = el('button', 'cb-btn ' + p + '-small', 'Preview'); look.type = 'button'; look.setAttribute('aria-pressed', 'false');
    row.appendChild(go); row.appendChild(look);
    if (o.cancel) {
      var no = el('button', 'cb-btn ' + p + '-small', 'Cancel'); no.type = 'button';
      no.addEventListener('click', o.cancel);
      row.appendChild(no);
    }
    var answer = el('p', p + '-answer'); answer.setAttribute('role', 'status');
    [lab, text, hint, preview, row, answer].forEach(function (x) { form.appendChild(x); });
    function unlook() { preview.hidden = true; look.setAttribute('aria-pressed', 'false'); look.textContent = 'Preview'; }
    look.addEventListener('click', function () {
      if (!preview.hidden) { unlook(); return; }
      if (!text.value.trim()) { answer.textContent = 'There is nothing to preview yet.'; return; }
      o.ask({ action: 'preview', comment: true, body: text.value }).then(function (r) {
        if (r.status !== 200) { answer.textContent = o.why(r, 'The preview could not be made just now.'); return; }
        preview.textContent = '';
        window.loveMarkdown.blocks(r.body.blocks, preview, { top: 4, prefix: p });
        preview.hidden = false;
        look.setAttribute('aria-pressed', 'true');
        look.textContent = 'Hide the preview';
      });
    });
    text.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); if (form.requestSubmit) form.requestSubmit(go); else go.click(); }
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (go.disabled) return;
      if (!text.value.trim()) { answer.textContent = 'Write something first.'; text.focus(); return; }
      go.disabled = true;
      answer.textContent = '';
      o.send(text.value, function (ok, words) {
        go.disabled = false;
        answer.textContent = words || '';
        if (ok) { text.value = ''; unlook(); }
      });
    });
    return { form: form, text: text };
  }

  /* Who wrote a comment and when: the line at its head, and a link to it where
     the comment is not on its own page. */
  function byline(o, c, href) {
    var by = el('p', o.p + '-comment__by');
    by.appendChild(el('b', null, c.by));
    by.appendChild(document.createTextNode(' '));
    var words = o.when(c.t) + (c.edited ? ', edited ' + o.when(c.edited) : '');
    if (href) { var a = el('a', o.p + '-when', words); a.href = href; by.appendChild(a); }
    else by.appendChild(el('span', o.p + '-when', words));
    return by;
  }
  function words(o, c) {
    var body = el('div', o.p + '-body ' + o.p + '-comment__body');
    window.loveMarkdown.blocks(c.blocks || [], body, { top: 4, prefix: o.p });
    return body;
  }

  /* The Comments part of a page: its heading, the comments, and the box.
     o: { p, id (the record's id, sent as id), heading(level, text), comments, landOn, admin, max, hint,
          when(t), ask(send), why(r, otherwise), say(text), sure(into, text, yesText, yes, back),
          kept(list) after every change, so a page redrawn keeps them, and posted(comment) }
     Answers { section, landed }: landed is the comment landOn names, when it is there. */
  function section(o) {
    var p = o.p, list = o.comments ? o.comments.slice() : null;
    var talk = el('section', p + '-talk');
    var h = o.heading(3, 'Comments');
    talk.appendChild(h);
    var ol = el('ol', p + '-comments');
    talk.appendChild(ol);
    var write = box({ p: p, id: p + '-say', label: 'Write a comment', goText: 'Comment', max: o.max, hint: o.hint, ask: o.ask, why: o.why,
      send: function (text, done) {
        o.ask({ action: 'comment', id: o.id, body: text }).then(function (r) {
          if (r.status !== 200) { done(false, o.why(r, 'That did not post. Nothing was changed.')); return; }
          list = (list || []).concat([r.body.comment]);
          if (o.kept) o.kept(list);
          fill();
          done(true, 'Posted.');
          o.say('Comment posted.');
          if (o.posted) o.posted(r.body.comment);
        });
      } });
    talk.appendChild(write.form);

    function fill(landOn) {
      ol.textContent = '';
      var found = null;
      if (!list) { ol.appendChild(el('li', 'cb-quiet', 'Looking…')); return null; }
      if (!list.length) { ol.appendChild(el('li', 'cb-quiet', 'No comments yet.')); return null; }
      list.forEach(function (c) {
        var li = item(c);
        if (landOn && c.id === landOn) { li.classList.add(p + '-comment--here'); found = li; }
        ol.appendChild(li);
      });
      return found;
    }
    function item(c) {
      var li = el('li', p + '-comment');
      li.tabIndex = -1;
      li.setAttribute('data-c', c.id);
      li.appendChild(byline(o, c));
      var body = words(o, c);
      li.appendChild(body);
      var tools = el('div', p + '-row ' + p + '-comment__tools');
      if (c.mine) {
        var ed = el('button', 'cb-btn ' + p + '-small', 'Edit'); ed.type = 'button';
        ed.setAttribute('aria-label', 'Edit your comment of ' + o.when(c.t));
        ed.addEventListener('click', function () {
          // The words are changed where they stand, and Cancel puts them back.
          body.hidden = true; tools.hidden = true;
          var b = box({ p: p, id: p + '-edit-' + c.id, label: 'Your comment', value: c.body, goText: 'Save', max: o.max, hint: o.hint, ask: o.ask, why: o.why,
            cancel: function () { b.form.remove(); body.hidden = false; tools.hidden = false; ed.focus(); },
            send: function (text, done) {
              o.ask({ action: 'comment-edit', id: o.id, c: c.id, body: text }).then(function (r) {
                if (r.status !== 200) { done(false, o.why(r, 'That did not save. Nothing was changed.')); return; }
                list = list.map(function (x) { return x.id === c.id ? r.body.comment : x; });
                if (o.kept) o.kept(list);
                var again = item(r.body.comment);
                li.replaceWith(again);
                again.focus();
                o.say('Saved.');
              });
            } });
          li.appendChild(b.form);
          b.text.focus();
        });
        tools.appendChild(ed);
      }
      if (c.mine || o.admin) {
        var del = el('button', 'cb-btn ' + p + '-small', 'Delete'); del.type = 'button';
        del.setAttribute('aria-label', 'Delete ' + (c.mine ? 'your' : c.by + '’s') + ' comment of ' + o.when(c.t));
        del.addEventListener('click', function () {
          o.sure(tools, c.mine ? 'This deletes your comment for everybody. It cannot be put back.'
            : 'This deletes ' + c.by + '’s comment for everybody. It cannot be put back.', 'Delete it', function (done) {
            o.ask({ action: 'comment-remove', id: o.id, c: c.id }).then(function (r) {
              done();
              if (r.status !== 200) { o.say(o.why(r, 'That did not delete. Nothing was changed.')); return; }
              list = list.filter(function (x) { return x.id !== c.id; });
              if (o.kept) o.kept(list);
              fill();
              h.focus();
              o.say('Deleted.');
            });
          }, del);
        });
        tools.appendChild(del);
      }
      if (tools.firstChild) li.appendChild(tools);
      return li;
    }
    var landed = fill(o.landOn);
    return {
      section: talk,
      landed: landed,
      // The comments, once they are read, when the page drew the part before it had them.
      set: function (cs) { if (!list) { list = cs.slice(); if (o.kept) o.kept(list); fill(); } }
    };
  }

  /* A feed card's latest comments, to read where the card stands, each linking
     to itself on its own page. o: { p, when, href(c) }. */
  function latest(o, comments, said) {
    var p = o.p, talk = el('div', p + '-post__talk');
    var few = comments.length;
    talk.appendChild(el('p', p + '-post__said', (said === 1 ? '1 comment' : said + ' comments') + (said > few ? ', the latest ' + few + ':' : ':')));
    var ol = el('ol', p + '-comments');
    comments.forEach(function (c) {
      var li = el('li', p + '-comment');
      li.appendChild(byline(o, c, o.href(c)));
      li.appendChild(words(o, c));
      ol.appendChild(li);
    });
    talk.appendChild(ol);
    return talk;
  }

  window.loveComments = { box: box, section: section, latest: latest };
})();

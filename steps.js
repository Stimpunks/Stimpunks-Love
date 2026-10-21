/* =============================================================================
   One step back, for tasks, the office and the forums. Norah's ask, put by Ryan
   on 2026-10-21: a back button that goes back one step, not all the way to the
   street or the room, and remembers how far down the view you were.

   EACH APP DRAWS ITS VIEWS IN ONE PAGE, by the address after the #, so moving
   between them is the browser's own history: the browser's Back, Alt or Cmd
   and Left, and the link above every view, which says where it goes. This
   file is how all three go back the same way; it holds no look of its own, and
   each app dresses the link in its own sheet. Three copies of this would be
   three ways of being wrong about it, which is why it is one file (rack.js's
   rule, arriving three at once).

   GOING BACK PUTS YOU WHERE YOU WERE, once the view has drawn, because most
   views draw after a fetch: the link you followed has the keyboard again, at
   the height on the screen it had, or failing that the view stands at the
   height it had and its heading has the keyboard. Nothing scrolls smoothly and
   nothing moves unless you went somewhere.

   WHAT IT KEEPS: in the tab's own history, beside each address the history
   already holds, how far down that view was, the address of the view before
   it, and a key; nothing typed, no name and no title, which is what lets the
   office use it (privacy.html#tasks, #office, #forums). The words of the link
   behind, the link you followed and how many older pages were open are kept in
   this page's memory only, and go when it closes. It stores nothing else and
   sends nothing. tools/check-steps.py holds all of this.
   ============================================================================= */
(function () {
  'use strict';

  try { history.scrollRestoration = 'manual'; } catch (e) { /* the browser puts the place back itself */ }

  // What can have the keyboard, to remember which of them you followed.
  var PRESSABLE = 'a[href], button, summary, select, input, textarea, [tabindex]';

  window.loveSteps = function (o) {
    var root = o.root, memo = {}, cur = null, arriving = null, first = true, fresh = false;
    var pressed = null, pressedAt = 0, saving = null, following = null;

    function key() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
    // A view's address without its filters, so going back to a list keeps them.
    function path(h) { return String(h || '#/').split('?')[0] || '#/'; }
    function stepOf(s) {
      var x = s && typeof s === 'object' ? s.loveStep : null;
      return x && typeof x.key === 'string' ? x : null;
    }
    // Exactly these, and never words: a key, how far down, the address behind.
    function clean(st) {
      var out = { key: st.key, y: Math.max(0, Math.round(+st.y || 0)), back: null };
      if (st.back && typeof st.back.key === 'string') out.back = { key: st.back.key, hash: String(st.back.hash || '') };
      return out;
    }
    function write(st, url) {
      var s = history.state && typeof history.state === 'object' ? history.state : {}, n = {};
      Object.keys(s).forEach(function (k) { n[k] = s[k]; });
      n.loveStep = clean(st);
      try {
        if (url == null) history.replaceState(n, '');
        else history.replaceState(n, '', url);
        return true;
      } catch (e) { return false; }
    }
    function save() {
      clearTimeout(saving);
      saving = null;
      if (!cur || !cur.settled) return;
      var st = stepOf(history.state);
      if (!st || st.key !== cur.key) return;
      cur.hash = location.hash;
      st.y = window.scrollY;
      write(st);
    }

    /* The thing in this app that a press or the keyboard was on. */
    function inApp(n) { return n && n.nodeType === 1 && root.contains(n); }
    function mark(e) {
      if (!inApp(e)) return null;
      var t = e.closest(PRESSABLE);
      if (!t) return null;
      var m = { top: t.getBoundingClientRect().top };
      if (t.id) { m.id = t.id; return m; }
      m.tag = t.tagName;
      m.sig = sig(t);
      m.i = alike(m).indexOf(t);
      return m;
    }
    function sig(t) { return (t.getAttribute('href') || '') + '\n' + (t.getAttribute('name') || '') + '\n' + (t.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 200); }
    function alike(m) { return Array.prototype.filter.call(root.querySelectorAll(m.tag), function (x) { return sig(x) === m.sig; }); }
    function find(m) {
      if (!m) return null;
      if (m.id) return root.getElementById(m.id);
      var all = alike(m);
      return all[m.i] || all[0] || null;
    }
    window.addEventListener('click', function (e) {
      var path = e.composedPath ? e.composedPath() : [e.target];
      for (var i = 0; i < path.length; i++) {
        if (inApp(path[i]) && path[i].matches(PRESSABLE)) {
          pressed = path[i];
          pressedAt = Date.now();
          // About to go somewhere: how far down this view was goes into its step now.
          if (pressed.tagName === 'A') save();
          return;
        }
      }
    }, true);
    // Written once the page stops moving, not while it moves: a browser
    // refuses a page that rewrites its history too often.
    window.addEventListener('scroll', function () {
      if (!cur || !cur.settled) return;
      clearTimeout(saving);
      saving = setTimeout(save, 300);
    }, { passive: true });
    window.addEventListener('pagehide', save);

    /* The link above the view: back one step when there is one in this app,
       or else the view's own way up, or nothing. */
    function drawSlot() {
      var s = o.slot;
      if (!s) return;
      s.textContent = '';
      var b = cur && cur.back, a = document.createElement('a');
      if (b) {
        var gone = memo[b.key];
        a.href = b.hash || '#/';
        a.textContent = '← Back to ' + o.place(b.hash, gone && gone.title);
        a.addEventListener('click', function (e) {
          if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          e.preventDefault();
          history.back();
        });
      } else if (cur && cur.up) {
        a.href = cur.up[0];
        a.textContent = cur.up[1];
      } else { s.hidden = true; return; }
      s.appendChild(a);
      s.hidden = false;
    }

    /* Puts the page where it was. A view that goes on drawing after it says
       it has (a fold that fills, a picture) is followed until it settles, or
       until you scroll, press or type, or for four seconds. */
    function to(y) {
      try { window.scrollTo({ top: y, left: window.scrollX, behavior: 'instant' }); }
      catch (e) { window.scrollTo(window.scrollX, y); }
    }
    function stopFollowing() {
      if (!following) return;
      following.ro.disconnect();
      clearTimeout(following.t);
      ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (k) { window.removeEventListener(k, stopFollowing, true); });
      following = null;
    }
    function put(place, h, keyboard) {
      stopFollowing();
      var t = place.focus ? find(place.focus) : null;
      // It was open when you followed the link, so the folds round it are opened again.
      for (var d = t && t.parentElement; d; d = d.parentElement) if (d.tagName === 'DETAILS' && !d.open) d.open = true;
      if (t && !t.getClientRects().length) t = null;
      if (keyboard) {
        var f = t || h;
        if (f) { try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); } }
      }
      // Held by the link you followed, at the height it had, when it is in
      // the view: a list that grew above it still opens on it. Anything
      // outside the view (the bar, a side list that sticks) is held by the
      // page's own height instead.
      var held = t && o.view && o.view.contains(t) && place.focus.top != null;
      function want() {
        if (held && t.isConnected) return window.scrollY + t.getBoundingClientRect().top - place.focus.top;
        return place.y || 0;
      }
      to(want());
      if (Math.abs(window.scrollY - want()) < 2) return;
      if (typeof ResizeObserver !== 'function') return;
      var ro = new ResizeObserver(function () {
        var y = want();
        if (Math.abs(window.scrollY - y) >= 2) to(y);
      });
      ro.observe(document.body);
      following = { ro: ro, t: setTimeout(stopFollowing, 4000) };
      ['wheel', 'touchstart', 'keydown', 'pointerdown'].forEach(function (k) { window.addEventListener(k, stopFollowing, true); });
    }

    var api = {
      /* At the start of every route: says whether this is a step taken
         forward, which starts at its heading, or one gone back to, or the
         same view again, which go back to where they were. */
      arrive: function () {
        stopFollowing();
        clearTimeout(saving);
        saving = null;
        var leaving = cur;
        if (leaving && leaving.settled) {
          var m = memo[leaving.key] || (memo[leaving.key] = {});
          var by = pressed && pressed.isConnected && Date.now() - pressedAt < 3000 ? pressed : (root.activeElement || null);
          m.y = window.scrollY;
          m.focus = mark(by);
          try { m.title = o.title ? o.title() : null; } catch (e) { m.title = null; }
        }
        pressed = null;
        var st = stepOf(history.state), a;
        if (fresh && st) { fresh = false; a = { back: false }; }
        else if (st && memo[st.key] && memo[st.key].y != null) a = { back: true, place: memo[st.key] };
        else if (st) a = { back: true, place: { y: st.y } };
        else {
          st = { key: key(), y: 0, back: leaving ? { key: leaving.key, hash: leaving.hash } : null };
          write(st);
        }
        if (!a) a = { back: false };
        fresh = false;
        cur = { key: st.key, back: st.back, hash: location.hash, settled: false, up: null };
        a.first = first;
        first = false;
        arriving = a;
        drawSlot();
        return a;
      },
      /* Once the view has drawn: done is what the route returned, the
         heading the keyboard goes to, or a promise of it. */
      land: function (done) {
        var a = arriving, here = cur;
        return Promise.resolve(done).then(function (h) {
          if (here !== cur) return;
          here.settled = true;
          drawSlot();
          // On arriving at the page the keyboard stays where the browser put it.
          if (a.back) put(a.place, h, !a.first);
          else if (h && !a.first) h.focus();
        });
      },
      /* A view's own way up, for when it was opened by itself. */
      up: function (href, words) { if (cur) { cur.up = [href, words]; drawSlot(); } },
      /* A view's filters, written into its own address in place. */
      replace: function (url) {
        var st = stepOf(history.state);
        if (st && cur && st.key === cur.key) { st.y = window.scrollY; write(st, url); }
        else { try { history.replaceState(history.state, '', url); } catch (e) { /* the address stays */ } }
        if (cur) cur.hash = location.hash;
      },
      /* Done with this view (saved, deleted, cancelled): back to the view
         before it when that is where it goes, or else this step becomes the
         view it goes to, so Back never lands on a finished form. */
      go: function (hash) {
        var b = cur && cur.back;
        if (b && path(b.hash) === path(hash)) { history.back(); return; }
        if (location.hash === hash) { o.route(); return; }
        fresh = true;
        if (!write({ key: key(), y: 0, back: b || null }, hash)) { fresh = false; location.hash = hash; return; }
        o.route();
      },
      /* A link that finishes the view, as Cancel does. */
      leave: function (a) {
        a.addEventListener('click', function (e) {
          if (e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          e.preventDefault();
          api.go(a.getAttribute('href'));
        });
        return a;
      },
      /* Something about this view to have again on coming back to it, such as
         how many older pages were open: in this page's memory only. */
      keep: function (name, v) {
        if (!cur) return;
        var m = memo[cur.key] || (memo[cur.key] = {});
        (m.kept || (m.kept = {}))[name] = v;
      },
      kept: function (name) {
        var m = cur && memo[cur.key];
        return m && m.kept ? m.kept[name] : undefined;
      },
    };
    return api;
  };
})();

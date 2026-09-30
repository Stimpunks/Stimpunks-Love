/* =============================================================================
   The MUD Room — the Slake, played.

   IT BUILDS NOTHING OUT OF ITS OWN DATA. Everything the game knows is the
   guidebook at the foot of the page, which tools/make-mud.py writes out of
   data/mud.json: every place, thing, person and way on, with the words for each
   tide. This file reads that markup, clones from it, and closes the book. With
   scripts off the book is the game, and with scripts on the game cannot say a
   word the book does not.

   WORDS FIRST. Every move, look and answer is written into #mud-log, a
   role="log" region under the buttons, so a screen reader hears each line as it
   arrives and the answer is where the hand is. The map is aria-hidden: it is a
   picture of the same words.

   NOTHING IS KEPT OR HEARD, AND NOTHING IS SENT UNTIL YOU ARE SEEN. No storage
   of its own and no sound; closing the page puts the tide back out and the finds
   back on the foreshore. The one thing it sends is through the CB, and only
   once somebody signed on has pressed Be seen out here, on this visit, with the
   tab in front: where they are and what they say, to /cb/mud/ and nowhere
   else. It reads the radio's pass out of love-cb and never writes it, which is
   the chalkboard's rule. make-mud.py refuses this file if it ever does more.

   SEEING IS THE SAME SWITCH AS BEING SEEN. Nobody watches the Slake unseen, and
   you meet people only in the place you are in: the map shows you and nobody
   else, and nothing anywhere lists or counts who is out here. Your tide is your
   own; somebody else waiting does not flood your mud.

   NOTHING MOVES BY ITSELF. The tide turns when somebody says wait, and the
   footprint on the map jumps rather than slides, at every setting of the dial.
   ============================================================================= */
(function () {
  'use strict';

  var game = document.getElementById('mud-game');
  var book = document.getElementById('mud-book');
  if (!game || !book) { return; }

  // ── Reading the book ───────────────────────────────────────────────────────
  var places = {}, things = {}, people = {}, lines = {};
  var where = {};       // thing id -> place id, or 'you'
  var onTable = {};     // finds shown to Ada
  var start = null;

  function when(list) {
    var out = {};
    Array.prototype.forEach.call(list, function (el) { out[el.getAttribute('data-when')] = el; });
    return out;
  }
  function words(el) {
    return (el.getAttribute('data-words') || '').toLowerCase().split('|');
  }

  Array.prototype.forEach.call(book.querySelectorAll('.mud-place'), function (el) {
    var id = el.getAttribute('data-place');
    if (!start) { start = id; }
    var p = {
      id: id, el: el,
      name: el.querySelector('.mud-place__name').textContent,
      tidal: el.hasAttribute('data-tidal'), dark: el.hasAttribute('data-dark'),
      reveal: el.hasAttribute('data-reveal'),
      text: when(el.querySelectorAll(':scope > .mud-text')),
      sit: el.querySelector(':scope > .mud-sit'),
      exits: [], people: [], leave: el.querySelector('.mud-leave a')
    };
    Array.prototype.forEach.call(el.querySelectorAll('.mud-way'), function (a) {
      p.exits.push({ dir: a.getAttribute('data-dir'), to: a.getAttribute('data-to'),
                     tide: a.getAttribute('data-tide'), label: strip(a).textContent.trim() });
    });
    Array.prototype.forEach.call(el.querySelectorAll('.mud-thing'), function (t) {
      var tid = t.getAttribute('data-thing');
      things[tid] = {
        id: tid, name: t.querySelector('.mud-thing__name').textContent, words: words(t),
        take: t.hasAttribute('data-take'), wear: t.hasAttribute('data-wear'),
        find: t.hasAttribute('data-find'), seen: t.getAttribute('data-seen'),
        look: when(t.querySelectorAll('.mud-look')), lore: t.querySelector('.mud-lore')
      };
      where[tid] = id;
    });
    Array.prototype.forEach.call(el.querySelectorAll('.mud-person'), function (h) {
      var hid = h.getAttribute('data-person');
      people[hid] = {
        id: hid, place: id, name: h.querySelector('.mud-person__name').textContent,
        words: words(h), here: h.querySelector('.mud-here'),
        says: h.querySelectorAll('.mud-says'), join: h.querySelectorAll('.mud-join'), talked: 0, joined: 0
      };
      p.people.push(hid);
    });
    places[id] = p;
  });
  Array.prototype.forEach.call(game.querySelectorAll('.mud-lines [data-line]'), function (el) {
    lines[el.getAttribute('data-line')] = el.textContent;
  });

  // A copy with the book's own labels ("At low tide.") taken off.
  function strip(el) {
    var c = el.cloneNode(true);
    Array.prototype.forEach.call(c.querySelectorAll('.mud-when'), function (w) {
      var next = w.nextSibling;
      if (next && next.nodeType === 3) { next.nodeValue = next.nodeValue.replace(/^\s+/, ''); }
      w.remove();
    });
    return c;
  }

  // ── State. None of it outlives the page. ──────────────────────────────────
  var svg = document.getElementById('mud-svg');
  var state = { here: start, tide: svg ? svg.getAttribute('data-tide') : 'low', wearing: false };
  var seen = {}, DIRS = {
    n: 'north', s: 'south', e: 'east', w: 'west', u: 'up', d: 'down',
    north: 'north', south: 'south', east: 'east', west: 'west', up: 'up', down: 'down',
    across: 'across', 'in': 'in', out: 'out', ferry: 'across'
  };

  function carrying(tid) { return where[tid] === 'you'; }
  function lit() { return carrying('lantern'); }
  function here() { return places[state.here]; }

  // ── The log ───────────────────────────────────────────────────────────────
  var log = document.getElementById('mud-log');
  function say(content, cls) {
    var p = document.createElement('p');
    p.className = 'mud-log__line' + (cls ? ' ' + cls : '');
    if (typeof content === 'string') { p.textContent = content; }
    else { while (content.firstChild) { p.appendChild(content.firstChild); } }
    log.appendChild(p);
    while (log.children.length > 80) { log.removeChild(log.firstChild); }
    log.scrollTop = log.scrollHeight;
  }
  function echo(cmd) { say('> ' + cmd, 'mud-log__line--you'); }
  function sayEl(el) { say(strip(el)); }

  // ── What a place says right now ───────────────────────────────────────────
  function textFor(p) {
    var t = p.text, out = [];
    if (p.dark) { out.push(lit() ? t.lit : t.dark); }
    else { out.push(t[state.tide] || t.any); }
    if (p.tidal) { out.push(state.wearing ? t.boots : t.bare); }
    return out.filter(Boolean);
  }
  function visibleThings(p) {
    return Object.keys(things).filter(function (tid) {
      var t = things[tid];
      return where[tid] === p.id && (!t.seen || t.seen === state.tide);
    });
  }
  function lookFor(t) {
    var l = t.look;
    if (l.dark && places[state.here].dark) { return lit() ? l.lit : l.dark; }
    return l[state.tide] || l.any || l.dark;
  }
  function open(e) {
    if (e.tide && e.tide !== state.tide) { return false; }
    if (places[e.to].tidal && state.tide !== 'low') { return false; }
    return true;
  }

  function describe() {
    var p = here();
    var head = document.createElement('p');
    var b = document.createElement('b');
    b.textContent = p.name + '. ';
    head.appendChild(b);
    textFor(p).forEach(function (el) {
      var c = strip(el);
      while (c.firstChild) { head.appendChild(c.firstChild); }
      head.appendChild(document.createTextNode(' '));
    });
    p.people.forEach(function (hid) {
      if (people[hid].place === p.id) {
        head.appendChild(document.createTextNode(people[hid].here.textContent + ' '));
      }
    });
    say(head);
    var ways = p.exits.filter(open).map(function (e) { return e.dir; });
    say(ways.length ? 'Ways on from here: ' + ways.join(', ') + '.' : 'There is no way on from here but back.');
  }

  // ── Drawing the panel and the map ─────────────────────────────────────────
  var ui = {
    tide: document.getElementById('mud-tide'), name: document.getElementById('mud-here-name'),
    text: document.getElementById('mud-here-text'), things: document.getElementById('mud-here-things'),
    people: document.getElementById('mud-here-people'), exits: document.getElementById('mud-exits')
  };

  function button(label, cmd, cls) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'mud-btn' + (cls ? ' ' + cls : '');
    b.textContent = label;
    b.setAttribute('data-cmd', cmd);
    return b;
  }
  function row(box, label, buttons) {
    box.textContent = '';
    if (!buttons.length) { box.hidden = true; return; }
    box.hidden = false;
    var l = document.createElement('p');
    l.className = 'mud-lab';
    l.textContent = label;
    var wrap = document.createElement('div');
    wrap.className = 'mud-btns';
    buttons.forEach(function (b) { wrap.appendChild(b); });
    box.appendChild(l);
    box.appendChild(wrap);
  }

  function draw() {
    var p = here();
    ui.tide.textContent = state.tide === 'low' ? 'The tide is out' : 'The tide is in';
    ui.name.textContent = p.name;
    ui.text.textContent = '';
    textFor(p).forEach(function (el) {
      var para = document.createElement('p');
      var c = strip(el);
      while (c.firstChild) { para.appendChild(c.firstChild); }
      ui.text.appendChild(para);
    });

    var tb = [];
    visibleThings(p).forEach(function (tid) {
      var t = things[tid];
      tb.push(button((onTable[tid] ? 'On the table: ' : '') + t.name, 'look at ' + t.words[0]));
      if (t.take) { tb.push(button('Take ' + t.name.replace(/^(a|an|the) /, 'the '), 'take ' + t.words[0], 'mud-btn--small')); }
    });
    row(ui.things, 'Here', tb);

    var pb = [];
    p.people.forEach(function (hid) {
      pb.push(button('Talk to ' + people[hid].name, 'talk to ' + people[hid].words[0]));
      if (hid === 'ines') { pb.push(button('Join in', 'join in', 'mud-btn--small')); }
      if (hid === 'ada') {
        Object.keys(things).forEach(function (tid) {
          if (carrying(tid) && things[tid].find) {
            pb.push(button('Show Ada ' + things[tid].name.replace(/^(a|an) /, 'the '), 'show ' + things[tid].words[0], 'mud-btn--small'));
          }
        });
      }
    });
    if (p.sit) { pb.push(button('Sit down', 'sit', 'mud-btn--small')); }
    if (where.slide === p.id) { pb.push(button('Slide down', 'slide', 'mud-btn--small')); }
    if (where.bell === p.id) { pb.push(button('Ring the bell', 'ring', 'mud-btn--small')); }
    if (carrying('wellies') || where.wellies === p.id) {
      pb.push(button(state.wearing ? 'Take the wellies off' : 'Wear the wellies', state.wearing ? 'take off wellies' : 'wear wellies', 'mud-btn--small'));
    }
    row(ui.people, 'Who is here, and what you can do', pb);

    ui.exits.textContent = '';
    p.exits.forEach(function (e) {
      var ok = open(e);
      var label = e.label + (ok ? '' : ' — closed just now');
      var b = button(label, 'go ' + e.dir, 'mud-btn--way' + (ok ? '' : ' mud-btn--shut'));
      ui.exits.appendChild(b);
    });
    if (p.leave) {
      var a = document.createElement('a');
      a.className = 'mud-btn mud-btn--way mud-btn--leave';
      a.href = p.leave.getAttribute('href');
      a.textContent = p.leave.textContent;
      ui.exits.appendChild(a);
    }
    drawMap();
  }

  function drawMap() {
    if (!svg) { return; }
    svg.setAttribute('data-tide', state.tide);
    var known = {};
    Object.keys(seen).forEach(function (id) {
      known[id] = true;
      places[id].exits.forEach(function (e) { known[e.to] = true; });
    });
    Array.prototype.forEach.call(svg.querySelectorAll('.mud-node'), function (n) {
      var id = n.getAttribute('data-node');
      n.classList.toggle('is-seen', !!seen[id]);
      n.classList.toggle('is-known', !!known[id] && !seen[id]);
      n.classList.toggle('is-here', id === state.here);
    });
    Array.prototype.forEach.call(svg.querySelectorAll('.mud-link'), function (l) {
      var a = l.getAttribute('data-a'), b = l.getAttribute('data-b');
      l.classList.toggle('is-on', !!((seen[a] && known[b]) || (seen[b] && known[a])));
    });
    var node = svg.querySelector('.mud-node[data-node="' + state.here + '"]');
    var me = document.getElementById('mud-me');
    if (node && me) { me.setAttribute('transform', node.getAttribute('transform')); }
  }

  // ── Doing things ──────────────────────────────────────────────────────────
  function arrive(id) {
    state.here = id;
    seen[id] = true;
    if (places[id].reveal) { Object.keys(places).forEach(function (k) { seen[k] = true; }); }
    describe();
    if (seenOn) { setTimeout(tick, 0); }
  }

  function go(dir) {
    var p = here();
    var e = p.exits.filter(function (x) { return x.dir === dir; })[0];
    if (!e) {
      var ways = p.exits.filter(open).map(function (x) { return x.dir; });
      say('There is no way ' + dir + ' from here. The ways on are ' + ways.join(', ') + '.');
      return;
    }
    if (!open(e)) { say(lines[e.tide === 'high' ? 'closed-high' : 'closed-low']); return; }
    // The way's own words, which already say which way: "You go down the ladder
    // into the wheel pit", never "You go down, down the ladder".
    say('You go ' + e.label.replace(/^\w+, /, '').replace(/ \(.*\)$/, '') + '.');
    arrive(e.to);
  }

  function clean(noun) {
    return (noun || '').toLowerCase().replace(/[^a-z' -]/g, '').replace(/^(the|a|an|some|my) /, '').trim();
  }
  function match(list, noun) {
    noun = clean(noun);
    if (!noun) { return null; }
    var best = null;
    list.forEach(function (x) {
      x.words.forEach(function (w) {
        if (w === noun || noun.indexOf(w) >= 0 || w.indexOf(noun) >= 0) { best = best || x; }
      });
    });
    return best;
  }
  function thingsAround() {
    var p = here();
    return visibleThings(p).concat(Object.keys(things).filter(carrying)).map(function (k) { return things[k]; });
  }
  function peopleHere() { return here().people.map(function (k) { return people[k]; }); }

  function examine(noun) {
    var t = match(thingsAround(), noun);
    if (t) {
      var el = lookFor(t);
      if (el) { sayEl(el); }
      if (onTable[t.id] && t.lore) { sayEl(t.lore); }
      return;
    }
    var h = match(peopleHere(), noun);
    if (h) { say(h.here.textContent + ' Say talk to ' + h.words[0] + ' to talk to them.'); return; }
    if (/^(around|here|room|place)?$/.test(clean(noun))) { describe(); return; }
    say(lines.nothing);
  }

  function take(noun) {
    var t = match(visibleThings(here()).map(function (k) { return things[k]; }), noun);
    if (!t) {
      var c = match(Object.keys(things).filter(carrying).map(function (k) { return things[k]; }), noun);
      say(c ? 'You already have ' + c.name.replace(/^(a|an) /, 'the ') + '.' : lines.nothing);
      return;
    }
    if (!t.take) { say('You leave ' + t.name.replace(/^(a|an) /, 'the ') + ' where it is. It belongs here.'); return; }
    where[t.id] = 'you';
    delete onTable[t.id];
    say('You pick up ' + t.name + '.' + (t.id === 'lantern' ? ' Now you can see somewhere dark.' : ''));
  }

  function drop(noun) {
    var t = match(Object.keys(things).filter(carrying).map(function (k) { return things[k]; }), noun);
    if (!t) { say('You are not carrying anything like that.'); return; }
    if (t.id === 'wellies' && state.wearing) { state.wearing = false; }
    where[t.id] = state.here;
    say('You put ' + t.name.replace(/^(a|an) /, 'the ') + ' down here. It will be here if you come back for it.');
  }

  function wear(on) {
    var here_ = where.wellies === state.here;
    if (!carrying('wellies') && !here_) { say('The wellies are back in the MUD Room.'); return; }
    if (on) {
      if (state.wearing) { say('You already have them on.'); return; }
      where.wellies = 'you';
      state.wearing = true;
      say('You pull the yellow wellies on. They fit, whatever your size is.');
    } else {
      if (!state.wearing) { say('You are not wearing them.'); return; }
      state.wearing = false;
      say('You take the wellies off and carry them. Barefoot is fine too.');
    }
  }

  function talk(noun) {
    var list = peopleHere();
    var h = noun ? match(list, noun) : list[0];
    if (!h) { say(list.length ? 'Nobody here by that name. Here: ' + list.map(function (x) { return x.name; }).join(', ') + '.' : 'There is nobody here to talk to. That is fine too.'); return; }
    var el = h.says[h.talked % h.says.length];
    h.talked += 1;
    sayEl(el);
  }

  function show(noun) {
    var t = match(Object.keys(things).filter(carrying).map(function (k) { return things[k]; }), noun);
    if (!t) { say('You are not carrying anything like that.'); return; }
    if (state.here !== people.ada.place) {
      say('There is nobody here to show it to. Ada, at the Mudlarks’ Hut, would be glad to see it.');
      return;
    }
    if (!t.find) { say('Ada looks at it kindly and hands it back. It did not come off the foreshore.'); return; }
    say('You show Ada ' + t.name + '.');
    sayEl(t.lore);
    where[t.id] = state.here;
    onTable[t.id] = true;
    say('It goes on the table with everything else. You can pick it up again whenever you like.');
  }

  function wait() {
    if (here().tidal) { say(lines['wait-not-here']); return; }
    state.tide = state.tide === 'low' ? 'high' : 'low';
    say(lines[state.tide === 'high' ? 'wait-to-high' : 'wait-to-low']);
    describe();
  }

  function inventory() {
    var have = Object.keys(things).filter(function (k) {
      return carrying(k) && !(k === 'wellies' && state.wearing);
    }).map(function (k) { return things[k].name; });
    var parts = [have.length ? 'You are carrying ' + have.join(', ') + '.' : 'You are not carrying anything. Your hands are free.'];
    if (state.wearing) { parts.push('You are wearing the yellow wellies.'); }
    say(parts.join(' '));
  }

  function help() {
    say('The words the Slake knows: north, south, east, west, up, down and across (or n, s, e, w, u, d); look; look at something; take and drop; wear and take off; talk to somebody; show a find to Ada; wait; sit; slide; ring; join in; home; help. Signed on to the CB and seen, say something (or start with a quote mark) and whoever is seen here hears it, and who says who else is here. Every button does the same thing as a word.');
  }

  function run(raw) {
    var cmd = raw.toLowerCase().trim().replace(/\s+/g, ' ');
    if (!cmd) { return; }
    var m;
    if (DIRS[cmd]) { go(DIRS[cmd]); }
    else if ((m = cmd.match(/^(?:go|walk|head|g) (?:to )?(\w+)$/)) && DIRS[m[1]]) { go(DIRS[m[1]]); }
    else if (/^(?:take|get|board|catch) (?:the )?ferry$/.test(cmd)) { go('across'); }
    else if (/^(?:l|look|look around)$/.test(cmd)) { describe(); }
    else if ((m = cmd.match(/^(?:look at|look in|look through|l at|examine|x|read|watch|inspect|check) (.+)$/))) { examine(m[1]); }
    else if ((m = cmd.match(/^(?:take off|remove) (.+)$/))) { wear(false); }
    else if ((m = cmd.match(/^(?:wear|put on) (.+)$/))) { wear(true); }
    else if ((m = cmd.match(/^(?:take|get|pick up|grab|carry) (.+)$/))) { take(m[1]); }
    else if ((m = cmd.match(/^(?:drop|put down|leave) (.+)$/))) { drop(m[1]); }
    else if ((m = cmd.match(/^(?:show|give) (.+?)(?: to \w+)?$/))) { show(m[1]); }
    else if ((m = cmd.match(/^(?:talk|talk to|speak to|ask|greet|hello|hi)(?: (.+))?$/))) { talk(m[1]); }
    else if (/^(?:i|inv|inventory|carrying|what am i carrying)$/.test(cmd)) { inventory(); }
    else if (/^(?:wait|z|rest|wait for the tide)$/.test(cmd)) { wait(); }
    else if (/^(?:home|go home|recall)$/.test(cmd)) { say(lines.home); arrive(start); }
    else if (/^(?:help|\?|commands|h)$/.test(cmd)) { help(); }
    else if (/^(?:who|who is here|look for people)$/.test(cmd)) { who(); }
    else if (/^(?:sit|sit down)$/.test(cmd)) { say(here().sit ? strip(here().sit).textContent.trim() : lines.sit); }
    else if (/^(?:slide|slide down|go down the slide)$/.test(cmd)) {
      say(where.slide === state.here ? lines.slide : 'There is nothing to slide down here. There is on the mudflat.');
    }
    else if (/^(?:ring|ring bell|ring the bell)$/.test(cmd)) {
      if (where.bell !== state.here) { say('There is no bell here. There is one at the ferry steps.'); }
      else { say('You ring the bell.'); sayEl(lookFor(things.bell)); }
    }
    else if (/^(?:join|join in|help ines)$/.test(cmd)) {
      var ines = people.ines;
      if (ines.place !== state.here) { say('There is nothing here to join in with. Ines is building a boat at the boathouse.'); }
      else { sayEl(ines.join[ines.joined % ines.join.length]); ines.joined += 1; }
    }
    else if (/^(?:say|shout|yell|tell) ./.test(cmd)) { speak(raw.trim().replace(/^\S+\s+/, '')); }
    else if (/^["'].+/.test(cmd)) { speak(raw.trim().slice(1).replace(/["']$/, '').trim()); }
    else { say(lines.unknown); }
  }

  function doIt(cmd) {
    echo(cmd);
    run(cmd);
    draw();
  }

  // ── Other people, through the CB ──────────────────────────────────────────
  // Nothing in this part sends anything until somebody signed on has pressed Be
  // seen out here. Everything it prints that somebody else typed goes in with
  // textContent, and a handle is never proof of who somebody is.
  var EVERY = 5000;
  var company = document.getElementById('mud-company');
  var signon = document.getElementById('mud-signon');
  var seenBtn = document.getElementById('mud-seen');
  var cstate = document.getElementById('mud-company-state');
  var me = (function () {
    try { var v = JSON.parse(localStorage.getItem('love-cb') || 'null'); return v && v.pass ? v : null; }
    catch (e) { return null; }
  }());
  var base = !!(me && (me.base || /^cb[12]\.base\./.test(me.pass)));
  var seenOn = false, visit = null, timer = null, others = [], heard = {}, metAt = null;

  function newVisit() {
    var a = new Uint8Array(18);
    crypto.getRandomValues(a);
    return btoa(String.fromCharCode.apply(null, a)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function call(path, send, keep) {
    return fetch(path, {
      method: 'POST', credentials: 'omit', cache: 'no-store', keepalive: !!keep,
      headers: { 'accept': 'application/json', 'content-type': 'application/json', 'authorization': 'Bearer ' + me.pass },
      body: JSON.stringify(send),
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (b) { return { status: r.status, body: b }; });
    });
  }

  /* Our functions refuse with { error: "a sentence" }, shown as it is. Anything
     else that answers is not ours to repeat: the chalkboard's rule. */
  function why(r, otherwise) {
    if (r && r.body && typeof r.body.error === 'string' && r.body.error) { return r.body.error; }
    if (r && (r.status === 404 || r.status === 405)) {
      return 'The CB is not running on this server. It only answers on stimpunks.world itself.';
    }
    return otherwise;
  }

  function live() { return seenOn && document.visibilityState === 'visible'; }
  function schedule() { clearTimeout(timer); timer = live() ? setTimeout(tick, EVERY) : null; }

  function named(o) { return o.handle + (o.base ? ' (the base station)' : ''); }

  function line(m) {
    var p = document.createElement('p');
    var who_ = document.createElement('b');
    who_.textContent = (me && m.handle === me.handle ? 'You' : named(m)) + ': ';
    p.appendChild(who_);
    p.appendChild(document.createTextNode(m.text));
    if (base && !(me && m.handle === me.handle)) {
      var off = document.createElement('button');
      off.type = 'button';
      off.className = 'mud-btn mud-btn--small mud-btn--off';
      off.textContent = 'Take this off the air';
      off.setAttribute('data-remove', m.id);
      off.setAttribute('data-place', state.here);
      p.appendChild(document.createTextNode(' '));
      p.appendChild(off);
    }
    return p;
  }

  function hear(place, b) {
    if (place !== state.here) { return; }
    var names = (b.others || []).map(named);
    var messages = b.messages || [];
    if (metAt !== place) {
      // ARRIVING somewhere: who else is seen here, and what has been said here
      // today, once. After that only what changes.
      metAt = place;
      heard = {};
      if (names.length) { say('Also here: ' + names.join(', ') + '.'); }
      var earlier = messages.filter(function (m) { return !heard[m.id]; });
      if (earlier.length) { say('Said here earlier today:'); }
      earlier.forEach(function (m) { heard[m.id] = true; say(line(m)); });
    } else {
      names.forEach(function (n) { if (others.indexOf(n) < 0) { say(n + ' is here.'); } });
      others.forEach(function (n) { if (names.indexOf(n) < 0) { say(n + ' has gone.'); } });
      messages.forEach(function (m) { if (!heard[m.id]) { heard[m.id] = true; say(line(m)); } });
    }
    others = names;
    cstate.textContent = names.length ? 'Also here: ' + names.join(', ') + '.' : 'Nobody else is seen here just now.';
  }

  function tick() {
    clearTimeout(timer);
    timer = null;
    if (!live()) { return; }
    var place = state.here;
    call('/cb/mud/here', { place: place, visit: visit }).then(function (r) {
      if (!seenOn) { return; }
      if (r.status === 200) { hear(place, r.body); }
      else if (r.status === 401) { stopSeen('The password has changed since you signed on. Sign on again at the Community Center, then come back.'); return; }
      else { cstate.textContent = why(r, 'No answer from the Slake just now. Trying again.'); }
      schedule();
    }, function () {
      if (seenOn) { cstate.textContent = 'No answer from the Slake just now. Trying again.'; schedule(); }
    });
  }

  function leave() { if (visit) { call('/cb/mud/leave', { visit: visit }, true).catch(function () {}); } }

  function startSeen() {
    seenOn = true;
    visit = newVisit();
    others = [];
    metAt = null;
    seenBtn.setAttribute('aria-pressed', 'true');
    seenBtn.textContent = 'Stop being seen';
    // IT NEVER CLAIMS WHAT IT HAS NOT HEARD, which is the radio's rule: until
    // the first answer it is looking, and "nobody else" waits for a reply.
    cstate.textContent = 'Looking round for anybody else\u2026';
    say('You are seen out here now, as ' + me.handle + '. Anybody else who is seen in the same place can see you and hear what you say, and you them.');
    tick();
  }

  function stopSeen(reason) {
    if (seenOn) { leave(); }
    seenOn = false;
    visit = null;
    clearTimeout(timer);
    timer = null;
    others = [];
    metAt = null;
    seenBtn.setAttribute('aria-pressed', 'false');
    seenBtn.textContent = 'Be seen out here';
    cstate.textContent = reason || 'You are not seen, and you cannot see anybody. Nothing is being sent.';
    say(reason || 'You are not seen any more, and nothing is being sent.');
  }

  function speak(text) {
    if (!text) { say('Say what? Put the words after say.'); return; }
    if (!me) { say(lines['say-signon']); return; }
    if (!seenOn) { say(lines['say-unseen']); return; }
    var place = state.here;
    call('/cb/mud/say', { place: place, visit: visit, text: text }).then(function (r) {
      if (r.status === 200 && place === state.here) {
        (r.body.messages || []).forEach(function (m) { if (!heard[m.id]) { heard[m.id] = true; say(line(m)); } });
      } else if (r.status === 401) {
        stopSeen('The password has changed since you signed on. Sign on again at the Community Center, then come back.');
      } else if (r.status !== 200) {
        say(why(r, 'That did not reach anybody. Nothing was said. Try again in a moment.'));
      }
    }, function () { say('The Slake could not be reached just now. Nothing was said.'); });
  }

  function who() {
    if (!me) { say(lines['say-signon']); return; }
    if (!seenOn) { say(lines['say-unseen']); return; }
    say(cstate.textContent);
  }

  if (me && company && seenBtn) {
    company.hidden = false;
    cstate.textContent = 'You are not seen, and you cannot see anybody. Nothing is being sent.';
    seenBtn.addEventListener('click', function () { if (seenOn) { stopSeen(); } else { startSeen(); } });
    // A HIDDEN TAB SENDS NOTHING, the radio's rule, and it stops being seen
    // rather than standing in a place nobody is looking at.
    document.addEventListener('visibilitychange', function () {
      if (!seenOn) { return; }
      if (document.visibilityState === 'visible') { metAt = null; tick(); }
      else { clearTimeout(timer); timer = null; leave(); }
    });
    window.addEventListener('pagehide', function () { if (seenOn) { leave(); } });
    // The base station's one extra: taking something said off the air.
    log.addEventListener('click', function (ev) {
      var off = ev.target.closest('button[data-remove]');
      if (!off || !base) { return; }
      off.disabled = true;
      call('/cb/mud/moderate', { place: off.getAttribute('data-place'), remove: off.getAttribute('data-remove') }).then(function (r) {
        if (r.status === 200) { off.parentNode.remove(); say('Taken off the air.'); }
        else { off.disabled = false; say(why(r, 'That did not work. Try again in a moment.')); }
      }, function () { off.disabled = false; say('The Slake could not be reached just now.'); });
    });
  } else if (signon) {
    signon.hidden = false;
  }

  // ── Wiring ────────────────────────────────────────────────────────────────
  game.addEventListener('click', function (ev) {
    var b = ev.target.closest('button[data-cmd]');
    if (!b) { return; }
    // THE BUTTONS ARE REDRAWN on every press, and a press that threw focus back
    // to the top of the page would lose a keyboard user's place. Focus goes to
    // the same position in the same group, or the last one left in it. The
    // buttons that are always there (Look around, Wait...) are never redrawn,
    // so they keep their focus by themselves.
    var group = b.closest('#mud-exits, #mud-here-things, #mud-here-people');
    var i = group ? Array.prototype.indexOf.call(group.querySelectorAll('button, a.mud-btn'), b) : -1;
    doIt(b.getAttribute('data-cmd'));
    if (group) {
      var btns = group.querySelectorAll('button, a.mud-btn');
      var to = btns[Math.min(Math.max(i, 0), btns.length - 1)];
      (to || document.getElementById('mud-in')).focus();
    }
  });

  var form = document.getElementById('mud-form');
  var input = document.getElementById('mud-in');
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var cmd = input.value;
    input.value = '';
    if (cmd.trim()) { doIt(cmd.trim()); }
  });

  // THE MAP IS FOR POINTERS: pressing a place next to you goes there. Everything
  // it does is also a button in the panel beside it.
  if (svg) {
    svg.addEventListener('click', function (ev) {
      var n = ev.target.closest('.mud-node');
      if (!n) { return; }
      var id = n.getAttribute('data-node');
      if (id === state.here) { doIt('look'); return; }
      var e = here().exits.filter(function (x) { return x.to === id; })[0];
      if (e) { doIt('go ' + e.dir); }
      else { echo('go to ' + places[id].name); say('That is not next to here. Go one place at a time, along the ways on.'); }
    });
  }

  game.hidden = false;
  book.open = false;
  seen[start] = true;
  say('You are in the MUD Room. Everything the Slake says will be written here, newest at the foot.');
  describe();
  draw();
})();

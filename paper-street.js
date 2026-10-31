/* =============================================================================
   Paper Street: the street, walked as paper. Ryan's ask, 2026-10-30: a sandbox
   game on the web, walking down the street and into the rooms, with your
   avatars, chimeras and pets along; built a little at a time, the street first.

   THE DOORS ARE THE FRONT PAGE'S OWN, READ WHEN THE PAGE OPENS. This file asks
   for index.html once, takes its row of doors, the street furniture, the fence
   round the open ground and the two ends of the road, and stands a copy of each
   up as a flat of card. A copy made at build time would be a second street that
   drifts from the first; this is always the street as it is, each door in its
   own §5 clothes, and a new shopfront is on Paper Street the day it opens.
   tools/make-paper-street.py refuses this file if index.html stops having the
   parts it reads.

   A TOY THEATRE, NOT A CAMERA. Every flat faces you, the way the wings of a toy
   theatre do, and stands further back the further down the street it is. You
   walk forward and back and cross the road; you never turn. So nothing here is
   rotated or skewed: each flat is placed with a translate and a scale worked
   out from where you stand, which is all check-gentle.py has to see, and the
   road is drawn on a canvas behind them with the same arithmetic.

   A ROOM YOU CAN WALK INTO IS A SCENE OF ITS OWN, IN A FILE OF ITS OWN (Ryan,
   2026-10-31). A door whose room has a walk-<room>.js goes in here rather than
   to the page: the street's flats are put by, the room's file is loaded, and
   it builds the room in its own world, drawn in its own section's inks, with
   the room's real page on a screen or a wall inside it. That screen is only
   ever made by this file's screen(), so every room's page arrives the same
   honest way: the page itself, at full size when you stand in front of it, its
   links leaving for the whole window. Where you are goes after the # in the
   address, which never reaches a server, so Back takes you out of the room.
   There is no pattern for a room here: this file knows how to stand a thing at
   a place and draw it from where you stand, and nothing about what a room is.

   MOVING IS YOURS, AND NOTHING MOVES BY ITSELF. Steps jump from stop to stop
   with no motion at all, and are where Gentle starts; Glide walks you smoothly
   while a key or a button is held, and is where Regular and MAX start. The
   switch overrides either, for this visit only. Tab moves you down the street:
   the keyboard going to a door stands you in front of it.

   LOOKING AROUND IS ARITHMETIC TOO (Ryan, 2026-10-31). Turning works out where
   everything stands from the way you are facing, and every flat goes on facing
   you, the way a cut-out in a toy theatre is turned to the audience: so a turn
   is still only a translate and a scale on each thing, and nothing is rotated.
   Looking up and down slides the horizon, the way the old games did it, so the
   floor drops away and the roof comes into view. In Steps a turn is a jump of a
   twelfth of the way round with nothing moving between; gliding, it turns while
   you hold a key or drag. Standing at a door or a screen faces you square on to
   it again.

   YOUR COMPANIONS COME ALONG, AND NOBODY IS HANDED A BODY. Your familiar walks
   with you if you have one (read from love-familiar, which familiar.js keeps;
   this file never writes it). Your avatar comes only when you press Bring my
   avatar, which asks /cb/avatars once with the pass the radio keeps, and walks
   in front of you; with no avatar you walk with no body at all.

   IT KEEPS NOTHING AND SENDS NOTHING. Two reads, the front page and, on a
   press, your avatars; no storage, no timer, nothing counted. The make tool
   reads this file for each of those.
   ========================================================================== */
(function () {
  'use strict';

  var stage = document.querySelector('[data-ps-stage]');
  if (!stage) return;
  var flatsEl = stage.querySelector('[data-ps-flats]');
  var folkEl = stage.querySelector('[data-ps-folk]');
  var canvas = stage.querySelector('[data-ps-ground]');
  var here = document.querySelector('[data-ps-here]');
  var said = document.querySelector('[data-ps-said]');
  var controls = document.querySelector('[data-ps-controls]');
  var failed = document.querySelector('[data-ps-failed]');
  if (!flatsEl || !folkEl || !canvas || !here || !controls) return;

  /* The rooms you can walk into, each its own file. Written by
     tools/make-paper-street.py from the walk-*.js files there are; do not
     hand-edit between the markers. */
  // walk:rooms:begin
  var ROOMS = {'arcade.html': 'walk-arcade.js', 'jungle-room.html': 'walk-jungle-room.js', 'latibulum.html': 'walk-latibulum.js', 'pink-pony-club.html': 'walk-pink-pony-club.js', 'the-mopery.html': 'walk-the-mopery.js'};
  // walk:rooms:end
  window.lovePaperRooms = window.lovePaperRooms || {};

  /* ── The street's measurements, in the street's own units ─────────────── */
  var ROAD = 230;        // half the road's width
  var KERB = 34;         // between the road's edge and a flat
  var WALK = 380;        // how far past the kerb you can walk on the pavement
  var GAP = 330;         // between one stop and the next, down the street
  var SPEED = 620;       // gliding forward, units a second
  var SIDEWAYS = 420;    // gliding across
  var NEAR = 0.5;        // a thing nearer than this many focal lengths is folded away
  var FAR = 15;          // and one further than this many

  var street = null;     // the street scene, kept while you are in a room
  var scene = null;      // { stops, decor, bounds, ground, eye, horizon, sides, room }
  var folk = [];         // { el, x, z, h, w }
  var cam = { x: 0, z: 0 };
  var goal = null;       // where a glide is heading
  var held = {};         // keys and buttons held down
  var last = 0, running = false;
  var F = 600, W = 0, H = 0, HORIZON = 0, EYE = 165, BASE = 0;
  var yaw = 0, pitch = 0;   // which way you face (radians, right is more) and how far up you look (pixels)
  var TURN = 1.3, LOOK = 320, STEP_TURN = Math.PI / 6;
  var mode = null, chosen = false;
  var me = null, fam = null;
  var byEl = new WeakMap();  // a placed element, to the stop it belongs to

  function level() { return document.documentElement.getAttribute('data-intensity') || 'regular'; }
  function steps() { return mode === 'steps'; }

  function speak(el, text) {
    if (!el) return;
    el.textContent = '';
    setTimeout(function () { el.textContent = text; }, 40);
  }

  /* ── Reading the street ───────────────────────────────────────────────── */
  function read() {
    return fetch('index.html', { credentials: 'same-origin', cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('no street'); return r.text(); })
      .then(function (src) { return new DOMParser().parseFromString(src, 'text/html'); });
  }

  function nameOf(a) {
    var n = a.querySelector('.door__name, [class$="__what"], [class$="__to"], .lotgate__name');
    return (n ? n.textContent : a.textContent).replace(/\s+/g, ' ').replace(/[→↓]/g, '').trim();
  }

  // Which page a door goes to, as a filename. Netlify rewrites the front page's
  // links into clean addresses as it serves them (/jungle-room, not
  // jungle-room.html), and the dev server does not, so a door is read in
  // either form; compared as written, no door on the live street matched a
  // room, and nothing here said so.
  function pageOf(a) {
    var h = (a.getAttribute('href') || '').split('#')[0].split('?')[0];
    if (/^[a-z]+:/i.test(h)) return '';
    h = h.replace(/^\.?\//, '');
    if (!h) return 'index.html';
    return /\.[a-z0-9]+$/i.test(h) ? h : h + '.html';
  }

  // One flat: a wrapper of ours holding a copy of the street's own element.
  var tagged = 0;
  function flat(node, width, side, kind) {
    var wrap = document.createElement('div');
    wrap.className = 'ps-flat ps-flat--' + kind;
    wrap.style.width = width + 'px';
    var copy = document.importNode(node, true);
    wrap.appendChild(copy);
    flatsEl.appendChild(wrap);
    var links = wrap.querySelectorAll('a[href]');
    var s = { el: wrap, side: side, w: width, h: 0, x: 0, z: 0, y: 0, name: nameOf(copy), pool: null, link: links[0] || null };
    byEl.set(wrap, s);
    // A door whose room you can walk into says so, under its fold, in words.
    Array.prototype.forEach.call(links, function (a) {
      if (!ROOMS[pageOf(a)]) return;
      var tag = document.createElement('span');
      tag.className = 'ps-walkin';
      tag.id = 'ps-walkin-' + (++tagged);
      tag.textContent = 'You can walk in';
      wrap.appendChild(tag);
      a.setAttribute('aria-describedby', tag.id);
    });
    return s;
  }

  function lay(doc) {
    var row = doc.querySelector('ul.doors');
    var doors = row ? row.querySelectorAll(':scope > li > a.door') : [];
    if (!doors.length) throw new Error('no doors');
    var pick = function (sel) { return doc.querySelector(sel); };
    var stops = [];

    // The treeline end, where you start: the way to the campgrounds, then the
    // lift head on the stoop, then the street furniture, as the Map has them.
    var order = [];
    var camp = pick('a.signpost');
    if (camp) order.push([camp, 330, 'left', 'sign']);
    var lift = pick('a.liftdown');
    if (lift) order.push([lift, 300, 'right', 'furniture']);
    ['a.noticeboard', 'a.brasstacks', 'a.postercol'].forEach(function (sel, i) {
      var n = pick(sel);
      if (n) order.push([n, 320, i % 2 ? 'right' : 'left', 'furniture']);
    });
    var side = order.length % 2 ? 'right' : 'left';
    var half = Math.floor((doors.length + 1) / 2);
    var gate = pick('a.gardengate');
    Array.prototype.forEach.call(doors, function (d, i) {
      if (i === half && gate) { order.push([gate, 320, side, 'gate']); side = side === 'left' ? 'right' : 'left'; }
      order.push([d, 270, side, 'door']);
      side = side === 'left' ? 'right' : 'left';
    });
    var ground = pick('div.openground');
    if (ground) order.push([ground, 620, side, 'lots']);

    order.forEach(function (o, i) {
      var s = flat(o[0], o[1], o[2], o[3]);
      s.z = 900 + i * GAP;
      stops.push(s);
    });

    // The far end of the road, standing across it like a toy theatre's
    // backcloth: the way out to The Outskirts.
    var out = pick('a.roadout');
    if (out) {
      var b = flat(out, 360, 'middle', 'backcloth');
      b.z = 900 + order.length * GAP + 500;
      stops.push(b);
    }
    return {
      stops: stops, decor: [], sides: true, eye: 165, horizon: 0.4, room: null,
      bounds: function () {
        var lim = ROAD + KERB + WALK;
        return { x: [-lim, lim], z: [0, stops[stops.length - 1].z - F * 0.6] };
      },
      ground: streetGround
    };
  }

  // Sizes are only known once the copies are in the page and their faces load.
  function measure() {
    if (scene !== street) return;
    street.stops.forEach(function (s) {
      s.el.style.transform = 'none';
      s.h = s.el.offsetHeight || 280;
      var half = s.w / 2;
      s.x = s.side === 'left' ? -(ROAD + KERB + half) : s.side === 'right' ? (ROAD + KERB + half) : 0;
      // The light a front throws onto the road in front of it, in its own colour.
      var c = getComputedStyle(s.el.firstElementChild).backgroundColor;
      s.pool = (c && c !== 'transparent' && !/rgba\([^)]*,\s*0\)$/.test(c)) ? c : null;
    });
  }

  /* ── Where things land on the screen ──────────────────────────────────── */
  function size() {
    var r = stage.getBoundingClientRect();
    W = r.width; H = r.height;
    F = Math.max(320, Math.min(W * 0.9, 900));
    EYE = scene ? scene.eye : 165;
    BASE = H * (scene ? scene.horizon : 0.4);
    lookAt();
    var dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    canvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Looking up slides the horizon down the stage, so the roof comes in from
  // the top; never so far that the floor or the sky leaves the stage entirely.
  function lookAt() {
    var lim = H * 0.36;
    pitch = Math.max(-lim, Math.min(lim, pitch));
    HORIZON = BASE + pitch;
  }

  // Where you see a point from: across (rx) and away (rz), turned to the way
  // you face. Worked out, never applied to anything as a turn.
  function seen(x, z) {
    var dx = x - cam.x, dz = z - cam.z, c = Math.cos(yaw), n = Math.sin(yaw);
    return { rx: dx * c - dz * n, rz: dx * n + dz * c };
  }
  function screenAt(rx, y, rz) {
    if (rz <= 1) return null;
    var s = F / rz;
    return { x: W / 2 + rx * s, y: HORIZON + (EYE - y) * s, s: s, dz: rz };
  }
  function project(x, y, z) {
    var v = seen(x, z);
    return screenAt(v.rx, y, v.rz);
  }

  function place(item) {
    if (!item.el) return;
    // A thing's middle is found from where you face and its width laid out
    // flat across your view, so a flat always faces you.
    var v = item.mine ? { rx: item.x, rz: item.z } : seen(item.x, item.z);
    var p = screenAt(v.rx - item.w / 2, (item.y || 0) + item.h, v.rz);
    var on = p && p.dz > F * (item.near || NEAR) && p.dz < F * FAR;
    if (!on) {
      item.el.classList.add('ps-off');
      item.el.style.transform = 'translate(-100000px, 0)';
      return;
    }
    item.el.classList.remove('ps-off');
    item.el.style.transform = 'translate(' + p.x.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px) scale(' + p.s.toFixed(4) + ')';
    item.el.style.zIndex = String(Math.max(1, Math.round(100000 - p.dz)));
  }

  function ink(name) { return getComputedStyle(stage).getPropertyValue(name).trim() || '#000'; }

  // A patch of floor, from where you stand and the way you face. Turned, part
  // of a patch can be behind you, so it is cut where it passes beside your eye
  // and only the part in front is drawn.
  var CLIP = 8;
  function floor(g, pts, fill, alpha) {
    var cam2 = pts.map(function (q) { return seen(q[0], q[1]); }), kept = [];
    for (var i = 0; i < cam2.length; i++) {
      var a = cam2[i], b = cam2[(i + 1) % cam2.length];
      if (a.rz >= CLIP) kept.push(a);
      if ((a.rz >= CLIP) !== (b.rz >= CLIP)) {
        var t = (CLIP - a.rz) / (b.rz - a.rz);
        kept.push({ rx: a.rx + (b.rx - a.rx) * t, rz: CLIP });
      }
    }
    if (kept.length < 3) return;
    g.globalAlpha = alpha == null ? 1 : alpha;
    g.fillStyle = fill;
    g.beginPath();
    kept.forEach(function (q, j) { var p = screenAt(q.rx, 0, q.rz); if (j) g.lineTo(p.x, p.y); else g.moveTo(p.x, p.y); });
    g.closePath(); g.fill();
    g.globalAlpha = 1;
  }
  function quad(g, x0, x1, z0, z1, fill, alpha) { floor(g, [[x0, z0], [x1, z0], [x1, z1], [x0, z1]], fill, alpha); }
  function oval(g, x, z, rx, rz, fill, alpha) {
    var pts = [];
    for (var i = 0; i < 24; i++) {
      var t = i / 24 * Math.PI * 2;
      pts.push([x + Math.cos(t) * rx, z + Math.sin(t) * rz]);
    }
    floor(g, pts, fill, alpha);
  }

  function streetGround(g, near, far) {
    var edge = ROAD + KERB + 4000;   // the floor runs out to the horizon whichever way you face
    quad(g, -edge, edge, near, far, ink('--ps-pave'));
    quad(g, -ROAD, ROAD, near, far, ink('--ps-road'));
    quad(g, -ROAD - 6, -ROAD, near, far, ink('--ps-kerb'));
    quad(g, ROAD, ROAD + 6, near, far, ink('--ps-kerb'));
    // The centre line, painted on the card in dashes.
    var dash = ink('--ps-line');
    for (var z = Math.ceil(near / 200) * 200; z < far; z += 200) quad(g, -5, 5, z, z + 90, dash);
    // Pools of each front's own light on the road in front of it.
    street.stops.forEach(function (s) {
      if (s.pool && !s.el.classList.contains('ps-off')) oval(g, s.x, s.z - 40, s.w * 0.62, s.w * 0.34, s.pool, 0.22);
    });
  }

  function draw() {
    var g = canvas.getContext('2d');
    g.clearRect(0, 0, W, H);
    scene.ground(g, cam.z - F * FAR, cam.z + F * FAR);
    scene.decor.forEach(place);
    scene.stops.forEach(place);
    placeFolk();
    noteWhere();
  }

  /* ── Where you are, in words ──────────────────────────────────────────── */
  function spotFor(s) {
    if (typeof s.spot === 'function') return s.spot();
    return s.spot || { x: s.x, z: s.z - F };
  }

  var lastNear = null, quiet = null;
  function nearest() {
    var best = null, d = Infinity;
    scene.stops.forEach(function (s) {
      var sp = spotFor(s);
      var k = Math.abs(sp.z - cam.z) + Math.abs(sp.x - cam.x) * 0.5;
      if (k < d) { d = k; best = s; }
    });
    return best;
  }
  function whereWords(s) {
    if (!s) return '';
    if (scene.room) return 'In ' + scene.room.name + ': ' + s.name + '.';
    return 'Standing by: ' + s.name + (s.side === 'middle' ? ', across the end of the road.' : ', on the ' + s.side + '.');
  }
  function noteWhere() {
    var s = nearest();
    if (s === lastNear) return;
    lastNear = s;
    var text = whereWords(s);
    // Said out loud only once you stop, so a glide does not chatter.
    clearTimeout(quiet);
    if (steps()) speak(here, text);
    else quiet = setTimeout(function () { speak(here, text); }, 700);
  }

  /* ── Moving ───────────────────────────────────────────────────────────── */
  function clamp() {
    var b = scene.bounds(cam);
    cam.x = Math.max(b.x[0], Math.min(b.x[1], cam.x));
    cam.z = Math.max(b.z[0], Math.min(b.z[1], cam.z));
  }

  function standAt(s) {
    var spot = spotFor(s);
    if (steps()) { goal = null; cam.x = spot.x; cam.z = spot.z; yaw = 0; pitch = 0; lookAt(); clamp(); draw(); return; }
    goal = { x: spot.x, z: spot.z, yaw: 0, pitch: 0 };
    go();
  }
  function faceAhead() {
    if (steps()) { yaw = 0; pitch = 0; lookAt(); draw(); return; }
    goal = { x: cam.x, z: cam.z, yaw: 0, pitch: 0 };
    go();
  }
  // The shortest way round to an angle.
  function towards(from, to) {
    var d = (to - from) % (Math.PI * 2);
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    return d;
  }

  function go() {
    if (running) return;
    running = true; last = 0;
    requestAnimationFrame(tick);
  }

  function tick(t) {
    var dt = last ? Math.min(0.1, (t - last) / 1000) : 0;
    last = t;
    var fwd = (held.fwd ? 1 : 0) - (held.back ? 1 : 0);
    var across = (held.right ? 1 : 0) - (held.left ? 1 : 0);
    var turn = (held.turnr ? 1 : 0) - (held.turnl ? 1 : 0);
    var up = (held.lookup ? 1 : 0) - (held.lookdown ? 1 : 0);
    if (fwd || across || turn || up) {
      goal = null;
      // Ahead is the way you face; across is square to it.
      var c = Math.cos(yaw), n = Math.sin(yaw);
      cam.x += (fwd * SPEED * n + across * SIDEWAYS * c) * dt;
      cam.z += (fwd * SPEED * c - across * SIDEWAYS * n) * dt;
      yaw += turn * TURN * dt;
      pitch += up * LOOK * dt;
      lookAt();
    } else if (goal) {
      var k = Math.min(1, dt * 7);
      cam.x += (goal.x - cam.x) * k;
      cam.z += (goal.z - cam.z) * k;
      yaw += towards(yaw, goal.yaw) * k;
      pitch += (goal.pitch - pitch) * k;
      lookAt();
      if (Math.abs(goal.x - cam.x) < 1 && Math.abs(goal.z - cam.z) < 1 && Math.abs(towards(yaw, goal.yaw)) < 0.004 && Math.abs(goal.pitch - pitch) < 1) {
        cam.x = goal.x; cam.z = goal.z; yaw = goal.yaw; pitch = goal.pitch; lookAt(); goal = null;
      }
    }
    clamp();
    draw();
    if (fwd || across || turn || up || goal) requestAnimationFrame(tick);
    else running = false;
  }

  // In steps, a press is one stop; the keyboard goes with it, so Enter goes in.
  function step(dir) {
    if (dir === 'turnl' || dir === 'turnr') { yaw += (dir === 'turnr' ? 1 : -1) * STEP_TURN; draw(); return; }
    if (dir === 'lookup' || dir === 'lookdown') { pitch += (dir === 'lookup' ? 1 : -1) * H * 0.12; lookAt(); draw(); return; }
    if (dir === 'ahead') { faceAhead(); return; }
    var list = scene.stops;
    if (!list.length) return;
    var at = nearest() || list[0];
    var i = list.indexOf(at);
    var next = null;
    if (dir === 'fwd' || dir === 'back') {
      next = list[Math.max(0, Math.min(list.length - 1, i + (dir === 'fwd' ? 1 : -1)))];
    } else if (scene.sides) {
      var want = dir === 'left' ? 'left' : 'right';
      for (var j = i; j < list.length && !next; j++) if (list[j].side === want) next = list[j];
      for (var k = i; k >= 0 && !next; k--) if (list[k].side === want) next = list[k];
    }
    if (!next) return;
    standAt(next);
    if (next.link) next.link.focus({ preventScroll: true });
  }

  var KEYS = { ArrowUp: 'fwd', w: 'fwd', W: 'fwd', ArrowDown: 'back', s: 'back', S: 'back',
               ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right',
               q: 'turnl', Q: 'turnl', e: 'turnr', E: 'turnr', r: 'lookup', R: 'lookup', f: 'lookdown', F: 'lookdown',
               x: 'ahead', X: 'ahead' };

  stage.addEventListener('keydown', function (e) {
    var dir = KEYS[e.key];
    if (!dir || e.altKey || e.ctrlKey || e.metaKey) return;
    e.preventDefault();
    if (dir === 'ahead') { if (!e.repeat) faceAhead(); return; }
    if (steps()) { if (!e.repeat) step(dir); return; }
    held[dir] = true; go();
  });
  stage.addEventListener('keyup', function (e) {
    var dir = KEYS[e.key];
    if (dir) held[dir] = false;
  });
  stage.addEventListener('focusout', function (e) {
    if (!stage.contains(e.relatedTarget)) held = {};
  });
  // The keyboard going to anything standing in the scene stands you at it.
  function standAtThing(e) {
    for (var n = e.target; n && n !== flatsEl; n = n.parentNode) {
      var s = byEl.get(n);
      if (s) { if (spotFor(s).z !== cam.z || spotFor(s).x !== cam.x) standAt(s); return; }
    }
  }
  flatsEl.addEventListener('focusin', standAtThing);
  flatsEl.addEventListener('ps-into', standAtThing);

  // The buttons under the stage: a press is a step, and in Glide, holding one walks.
  Array.prototype.forEach.call(controls.querySelectorAll('[data-ps-go]'), function (b) {
    var dir = b.getAttribute('data-ps-go');
    var stop = function () { held[dir] = false; };
    b.addEventListener('pointerdown', function (e) {
      if (steps() || dir === 'ahead') return;
      e.preventDefault();
      held[dir] = true; go();
      try { b.setPointerCapture(e.pointerId); } catch (x) {}
    });
    b.addEventListener('pointerup', stop);
    b.addEventListener('pointercancel', stop);
    b.addEventListener('lostpointercapture', stop);
    b.addEventListener('click', function (e) {
      // A click from a pointer already walked while it was held.
      if (dir === 'ahead') { faceAhead(); return; }
      if (!steps() && e.detail) return;
      if (steps()) step(dir);
      else { held[dir] = true; go(); setTimeout(stop, 260); }
    });
  });

  /* ── Dragging to look ─────────────────────────────────────────────────── */
  // A drag across the street looks round, at every setting, because the view
  // follows your own hand and nothing else. On a touch screen only a sideways
  // drag turns (the stage lets the page scroll up and down under a thumb); a
  // mouse looks up and down as well. A drag that went anywhere is not a press.
  var drag = null, dragged = false;
  stage.addEventListener('pointerdown', function (e) {
    if (e.button || !scene || (e.target.closest && e.target.closest('iframe'))) return;
    drag = { x: e.clientX, y: e.clientY, yaw: yaw, pitch: pitch, id: e.pointerId, touch: e.pointerType === 'touch' };
    dragged = false;
  });
  stage.addEventListener('pointermove', function (e) {
    if (!drag || e.pointerId !== drag.id) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!dragged && Math.abs(dx) < 6 && (drag.touch || Math.abs(dy) < 6)) return;
    if (!dragged) { dragged = true; try { stage.setPointerCapture(drag.id); } catch (x) {} goal = null; }
    yaw = drag.yaw - dx * 0.005;
    if (!drag.touch) { pitch = drag.pitch + dy; lookAt(); }
    draw();
  });
  function dropDrag() { drag = null; }
  stage.addEventListener('pointerup', dropDrag);
  stage.addEventListener('pointercancel', function () { drag = null; dragged = false; });
  stage.addEventListener('click', function (e) {
    if (dragged) { e.preventDefault(); e.stopPropagation(); dragged = false; }
  }, true);

  /* ── Steps or Glide ───────────────────────────────────────────────────── */
  var modeBtn = controls.querySelector('[data-ps-mode]');
  function showMode() {
    if (!modeBtn) return;
    modeBtn.setAttribute('aria-pressed', steps() ? 'true' : 'false');
    modeBtn.textContent = steps() ? 'Moving in steps: switch to gliding' : 'Gliding: switch to steps';
  }
  function setMode(m, byHand) {
    mode = m; if (byHand) chosen = true;
    held = {}; goal = null;
    showMode();
  }
  if (modeBtn) modeBtn.addEventListener('click', function () {
    setMode(steps() ? 'glide' : 'steps', true);
    speak(said, steps() ? 'You move in steps now, one stop at a time.' : 'You glide now, for as long as you hold a key or a button.');
  });
  window.addEventListener('love-intensity', function () { if (!chosen) setMode(level() === 'gentle' ? 'steps' : 'glide'); });

  /* ── Rooms ────────────────────────────────────────────────────────────── */
  var outBtn = controls.querySelector('[data-ps-out]');
  var pageLink = controls.querySelector('[data-ps-page]');

  function script(src, ready) {
    if (ready()) return Promise.resolve();
    return new Promise(function (ok, no) {
      var s = document.createElement('script');
      s.src = src; s.defer = true;
      s.onload = function () { ready() ? ok() : no(); };
      s.onerror = no;
      document.head.appendChild(s);
    });
  }

  // The room's real page, on whatever the room hangs it on. Its links that go
  // to another page leave for the whole window, because a room's way back to
  // the street opening the street inside the room is a hall of mirrors.
  function screen(page, title) {
    var f = document.createElement('iframe');
    f.src = page;
    f.title = title;
    f.addEventListener('load', function () {
      var d = null;
      try { d = f.contentDocument; } catch (x) { return; }
      if (!d) return;
      // The keyboard going into the page is never heard out here, so the page
      // says so, and you are stood in front of the screen it is on.
      d.addEventListener('focusin', function () {
        f.dispatchEvent(new CustomEvent('ps-into', { bubbles: true }));
      });
      d.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('a[href]');
        if (!a) return;
        var to = a.getAttribute('href');
        if (to.charAt(0) !== '#') a.target = '_top';
      }, true);
    });
    return f;
  }

  // What a room's file is handed: how to stand a thing in its scene, and how
  // to see it from where you are. Nothing about what the room is.
  function kit(page, name) {
    return {
      W: W, H: H, F: F, page: page, name: name,
      item: function (node, o) {
        var wrap = document.createElement('div');
        wrap.className = 'ps-thing' + (o.cls ? ' ' + o.cls : '');
        wrap.style.width = o.w + 'px';
        wrap.style.height = o.h + 'px';
        if (node) wrap.appendChild(node);
        flatsEl.appendChild(wrap);
        var it = { el: wrap, x: o.x || 0, y: o.y || 0, z: o.z || 0, w: o.w, h: o.h, near: o.near };
        return it;
      },
      stop: function (o, it) {
        var s = { el: it ? it.el : null, x: it ? it.x : (o.x || 0), z: it ? it.z : (o.z || 0), y: 0, w: it ? it.w : 0,
                  h: it ? it.h : 0, name: o.name, spot: o.spot, link: o.link || null, side: 'middle' };
        if (it) { byEl.set(it.el, s); (it.stops = it.stops || []).push(s); }
        return s;
      },
      // A thing off the room's own page, copied out of the page on its screen
      // once that has loaded, so nothing more is fetched: the wireless itself
      // rather than a drawing of it. It wears the page's own body class, so the
      // room's own rules dress it, and it is pressed as it is on the page;
      // love-embed.js, on this page too, turns a pressed facade into a player
      // here as it does there. A thing whose page has lost it stays empty, and
      // tools/make-paper-street.py refuses a room that lifts what its page
      // does not have.
      lift: function (frame, sel, o) {
        var wrap = document.createElement('div');
        wrap.className = 'ps-thing ps-lifted' + (o.cls ? ' ' + o.cls : '');
        wrap.style.width = o.w + 'px';
        flatsEl.appendChild(wrap);
        var it = { el: wrap, x: o.x || 0, y: o.y || 0, z: o.z || 0, w: o.w, h: o.h || 1, near: o.near };
        var put = function () {
          var d = null;
          try { d = frame.contentDocument; } catch (x) { return; }
          var node = d && d.querySelector(sel);
          if (!node || wrap.firstChild || !wrap.isConnected) return;
          var dress = document.createElement('div');
          dress.className = d.body.className;
          dress.style.minHeight = '0';
          dress.appendChild(document.importNode(node, true));
          wrap.appendChild(dress);
          // Its size is known only now, so the stops standing at it learn it too.
          it.h = wrap.offsetHeight;
          (it.stops || []).forEach(function (st) { st.h = it.h; });
          if (scene && scene.room) draw();
        };
        frame.addEventListener('load', put);
        put();
        return it;
      },
      screen: screen, project: project, quad: quad, oval: oval, ink: ink
    };
  }

  // keep: rebuilt for a new size, so you stay where you are standing and
  // nothing is said.
  function enter(page, push, keep) {
    var mod = ROOMS[page];
    if (!mod) return Promise.resolve(false);
    var name = (street && street.stops.filter(function (s) { return s.link && pageOf(s.link) === page; })[0] || {}).name || page;
    return script(mod, function () { return !!window.lovePaperRooms[page]; }).then(function () {
      var room = window.lovePaperRooms[page];
      if (scene === street) {
        street.cam = { x: cam.x, z: cam.z };
        street.frag = document.createDocumentFragment();
        while (flatsEl.firstChild) street.frag.appendChild(flatsEl.firstChild);
      } else if (scene && scene.room) {
        flatsEl.textContent = '';
        if (scene.cls) stage.classList.remove(scene.cls);
      }
      size();
      var built = room.build(kit(page, name));
      scene = {
        stops: built.stops, decor: built.decor || [], sides: false, room: { page: page, name: name },
        eye: built.eye || 165, horizon: built.horizon || 0.4, cls: built.cls || null,
        bounds: built.bounds, ground: built.ground
      };
      if (scene.cls) stage.classList.add(scene.cls);
      size();
      var start = built.start || { x: 0, z: 0 };
      if (!keep) { cam.x = start.x; cam.z = start.z; yaw = 0; pitch = 0; lookAt(); }
      goal = null; held = {};
      clamp();
      lastNear = keep ? nearest() : null;
      draw();
      if (push) history.pushState({ psIn: page }, '', '#in=' + page.replace(/\.html$/, ''));
      if (outBtn) outBtn.hidden = false;
      if (pageLink) { pageLink.href = page; pageLink.textContent = 'Open ' + name + '’s page'; pageLink.hidden = false; }
      if (keep) return true;
      speak(said, 'You are in ' + name + '. ' + (built.arrive || ''));
      stage.focus({ preventScroll: true });
      return true;
    }, function () {
      speak(said, 'That room could not be walked into just now, so here is its page.');
      location.href = page;
      return false;
    });
  }

  function leave() {
    if (!scene || !scene.room) return;
    var was = scene.room.page;
    flatsEl.textContent = '';
    if (scene.cls) stage.classList.remove(scene.cls);
    scene = street;
    if (street.frag) { flatsEl.appendChild(street.frag); street.frag = null; }
    size();
    var door = street.stops.filter(function (s) { return s.link && pageOf(s.link) === was; })[0];
    if (door) { var sp = spotFor(door); cam.x = sp.x; cam.z = sp.z; }
    else if (street.cam) { cam.x = street.cam.x; cam.z = street.cam.z; }
    goal = null; held = {}; lastNear = null;
    clamp(); draw();
    if (outBtn) outBtn.hidden = true;
    if (pageLink) pageLink.hidden = true;
    speak(said, 'Back out on the street.');
    if (door && door.link) door.link.focus({ preventScroll: true });
  }

  flatsEl.addEventListener('click', function (e) {
    if (scene !== street || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest('a[href]');
    if (!a || !ROOMS[pageOf(a)]) return;
    e.preventDefault();
    enter(pageOf(a), true);
  });
  // Going out is going back, when the street is the step behind; a room opened
  // straight from its address has no street behind it, so it is left in place.
  if (outBtn) outBtn.addEventListener('click', function () {
    if (history.state && history.state.psIn) { history.back(); return; }
    leave();
    history.replaceState({}, '', location.pathname);
  });
  window.addEventListener('popstate', function () {
    var want = roomInAddress();
    if (want && (!scene.room || scene.room.page !== want)) enter(want, false);
    else if (!want && scene && scene.room) leave();
  });
  function roomInAddress() {
    var m = /^#in=([a-z0-9-]+)$/.exec(location.hash);
    var page = m ? m[1] + '.html' : null;
    return page && ROOMS[page] ? page : null;
  }

  /* ── Companions ───────────────────────────────────────────────────────── */
  function figure(node, cls, h, aspect) {
    var el = document.createElement('div');
    el.className = 'ps-figure ' + cls;
    el.appendChild(node);
    folkEl.appendChild(el);
    var f = { el: el, h: h, w: h * aspect, x: 0, z: 0, mine: true };
    el.style.width = f.w + 'px'; el.style.height = f.h + 'px';
    folk.push(f);
    return f;
  }

  // Out on the road you are straight ahead; on the pavement, at a door, you
  // stand to the road side of it.
  // YOUR COMPANIONS ARE PLACED FROM WHERE YOU LOOK, not in the world: they are
  // with you whichever way you face. Each stands far enough off that its feet
  // are on the stage, which matters where the eye is high, as it is in a room
  // whose page fills the screen. Out on the road they are ahead of you; in a
  // room, or on the pavement at a door, they stand to either side, so neither
  // stands between you and the thing you came to.
  function placeFolk() {
    var room = H - 14 - HORIZON;
    var depth = function (want) { return room > 20 ? Math.max(want, F * EYE / room) : F * FAR * 0.9; };
    var aside = scene.room || Math.abs(cam.x) > ROAD;
    var edge = function (f, d, side) { return side * (W / 2 - f.w * (F / d) / 2 - 16) * d / F; };
    if (me) {
      me.z = depth(F * 0.72);
      me.x = aside ? edge(me, me.z, -1) : 0;
    }
    if (fam) {
      fam.z = depth(F * (me ? 0.8 : 0.85));
      fam.x = aside ? edge(fam, fam.z, 1) : F * 0.2;
    }
    folk.forEach(place);
  }

  function readFamiliar() {
    var v = null;
    try { v = JSON.parse(localStorage.getItem('love-familiar') || 'null'); } catch (e) { return null; }
    return v && v.parts ? v : null;
  }

  function bringFamiliar() {
    var v = readFamiliar();
    if (!v) return;
    script('chimera.js', function () { return !!window.loveChimera; }).then(function () {
      var C = window.loveChimera, p = C.clean(v.parts);
      var node = p && C.draw(p, { prefix: 'psf', cls: 'ps-figure__art' });
      if (!node) return;
      fam = figure(node, 'ps-figure--familiar', 92, 400 / 460);
      draw();
      var name = typeof v.name === 'string' && v.name ? v.name : 'Your familiar';
      var line = document.querySelector('[data-ps-familiar]');
      if (line) { line.textContent = name + ' is walking with you.'; line.hidden = false; }
    }, function () {});
  }

  function pass() {
    try { var v = JSON.parse(localStorage.getItem('love-cb') || 'null'); return v && v.pass ? v.pass : null; }
    catch (e) { return null; }
  }

  var bring = controls.querySelector('[data-ps-bring]');
  if (bring && pass()) {
    bring.hidden = false;
    bring.addEventListener('click', function () {
      if (me) {
        me.el.remove(); folk.splice(folk.indexOf(me), 1); me = null;
        bring.textContent = 'Bring my avatar';
        speak(said, 'Your avatar has gone home. You walk with no body now.');
        draw();
        return;
      }
      speak(said, 'Fetching your avatar…');
      fetch('/cb/avatars', { method: 'GET', credentials: 'omit', cache: 'no-store',
        headers: { accept: 'application/json', authorization: 'Bearer ' + pass() } })
        .then(function (r) { return r.json().then(function (b) { return { status: r.status, body: b }; }); })
        .then(function (r) {
          var list = r.body && r.body.avatars;
          if (r.status === 401) { speak(said, 'This username has been signed off. Sign on again and press it again.'); return; }
          if (r.status !== 200 || !list) { speak(said, 'Your avatars could not be fetched just now.'); return; }
          if (!list.length) { speak(said, 'You have no avatar kept yet. The Bodymind Booth is where one is drawn.'); return; }
          var a = list.filter(function (x) { return x.id === r.body.wearing; })[0] || list[0];
          return script('avatar.js', function () { return !!window.loveAvatar; }).then(function () {
            var node = window.loveAvatar.draw(a.look, { cls: 'ps-figure__art' });
            if (!node) { speak(said, 'That avatar could not be drawn.'); return; }
            var vb = (node.getAttribute('viewBox') || '0 0 200 300').split(' ').map(Number);
            me = figure(node, 'ps-figure--you', 158, vb[2] / vb[3]);
            bring.textContent = 'Send my avatar home';
            speak(said, 'You are walking as ' + (a.name || 'your avatar') + (a.id === r.body.wearing ? ', the one you wear on the CB.' : '.'));
            draw();
          });
        })
        .catch(function () { speak(said, 'The street could not be reached just now.'); });
    });
  }

  /* ── Starting ─────────────────────────────────────────────────────────── */
  setMode(level() === 'gentle' ? 'steps' : 'glide');
  read().then(function (doc) {
    street = scene = lay(doc);
    size();
    measure();
    cam.x = 0; cam.z = 0;
    controls.hidden = false;
    stage.classList.add('ps-stage--up');
    draw();
    bringFamiliar();
    // Faces arriving change every flat's height.
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); if (scene === street) draw(); });
    var want = roomInAddress();
    if (want) enter(want, false);
  }).catch(function () {
    if (failed) failed.hidden = false;
  });

  // When the stage itself changes size, not only the window: a stage measured
  // before the page had settled built a room for a stage no wide at all.
  var resizing = null, seenW = 0, seenH = 0;
  function resized() {
    clearTimeout(resizing);
    resizing = setTimeout(function () {
      var r = stage.getBoundingClientRect();
      if (!scene || (Math.round(r.width) === seenW && Math.round(r.height) === seenH)) return;
      seenW = Math.round(r.width); seenH = Math.round(r.height);
      if (scene.room) { enter(scene.room.page, false, true); return; }
      size(); measure(); draw();
    }, 120);
  }
  if (window.ResizeObserver) new ResizeObserver(resized).observe(stage);
  else window.addEventListener('resize', resized);
})();

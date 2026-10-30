/* PROFILES ON THE CB (Ryan, 2026-10-17, after requests for profiles more
   like Discord's). cb.js loads this, with cb-themes.js and avatar.js, the
   first time somebody opens a profile or edits their own, and draws with it:
   the card a profile is, its banner, the decoration round the avatar it wears,
   its name in the face chosen for it, the nameplate under a name on Who's
   online, and the frame round a profile and the effect over it. It fetches nothing, keeps nothing and sends nothing: cb.js asks the
   street and hands this what came back.

   WHAT A PROFILE IS MADE OF IS SOMEBODY'S CHOICES FROM THESE LISTS AND THEIR
   OWN WORDS, AND NOTHING ELSE. A theme is one of the CB's themes (call.js's
   SCHEMES), whose seven colours check-contrast.py already holds; a banner and
   a nameplate are one of cb-themes.js's drawings, each on its own theme's case,
   the way an avatar carries its own ground; a decoration is drawn here in the
   card's own theme's inks, so no decoration brings a colour nobody measured;
   a name face is one of FACES, every one declared in love.css. The server
   holds a profile to the same lists, which tools/make-profile.py writes into
   netlify/cb/lib.mjs out of this file, call.js and cb-themes.js.

   EVERY DRAWING IS ARIA-HIDDEN AND CARRIES NO WORD. Every sentence on a card
   is in Atkinson Hyperlegible; the chosen face sets the name and nothing else.
   A drawing moves only where the radio's drawings do (data-motion on the host:
   MAX GLITTER, or after Let my theme move), with cb.css's own motion classes,
   and nothing flashes. AN EFFECT'S PASS IS THE ONE DRAWING THAT CROSSES WORDS,
   Ryan's call, 2026-10-18, and it is drawn only where drawings move. There is
   no date on a card, and nothing on it counts. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var PARTS = ['case', 'bar', 'steel', 'steel-2', 'lcd', 'amber', 'amber-2'];

  /* THE NAME FACES: [face, scale, tracking, case, weight]. The CB themes'
     own display faces with the settings their themes give them, and a few
     more of the street's. A face love.css does not declare is refused by
     make-profile.py, because a browser answers a face it has not got with
     another one and says nothing. */
  /* profile:faces:begin */
  var FACES = [
    ['Atkinson Hyperlegible', 1, 0, 'none', 700],
    ['Abril Fatface', 1.15, 0, 'none', 400],
    ['Amarante', 1.2, .04, 'none', 400],
    ['Anton', 1.35, .06, 'uppercase', 400],
    ['B612', 1, .1, 'uppercase', 400],
    ['Bagel Fat One', 1.2, .02, 'none', 400],
    ['Bowlby One SC', 1.05, .04, 'uppercase', 400],
    ['Bungee', 1, .08, 'none', 400],
    ['Bungee Shade', 1, .04, 'none', 400],
    ['Caveat', 1.6, 0, 'none', 400],
    ['Chakra Petch', 1.1, .06, 'uppercase', 400],
    ['Cherry Bomb One', 1.15, 0, 'none', 400],
    ['Cinzel', 1.1, .1, 'uppercase', 400],
    ['Courier Prime', 1.1, .04, 'none', 400],
    ['Della Respira', 1.2, .04, 'none', 400],
    ['Doto', 1.3, .06, 'uppercase', 900],
    ['DynaPuff', 1.15, 0, 'none', 400],
    ['Eczar', 1.15, .04, 'none', 400],
    ['Exo 2', 1.1, .14, 'lowercase', 400],
    ['Forum', 1.25, .1, 'uppercase', 400],
    ['Fraunces', 1.3, 0, 'none', 400],
    ['Fredoka', 1.15, 0, 'none', 400],
    ['Gloria Hallelujah', 1.2, 0, 'none', 400],
    ['Gravitas One', .95, .04, 'uppercase', 400],
    ['Inter', 1.05, .12, 'uppercase', 400],
    ['JetBrains Mono', 1.05, .02, 'none', 400],
    ['Jost', 1.15, .16, 'uppercase', 500],
    ['Leckerli One', 1.1, .01, 'none', 400],
    ['Libre Franklin', 1.1, .04, 'none', 400],
    ['Lilita One', 1.25, .04, 'uppercase', 400],
    ['Limelight', 1.1, .04, 'none', 400],
    ['Macondo', 1.35, 0, 'none', 400],
    ['Marcellus SC', 1.1, .08, 'none', 400],
    ['Martian Mono', 1, .06, 'uppercase', 400],
    ['Michroma', .9, .08, 'uppercase', 400],
    ['Monoton', 1, .04, 'none', 400],
    ['Oxanium', 1.2, .1, 'uppercase', 400],
    ['Permanent Marker', 1.15, .02, 'none', 400],
    ['Playfair Display', 1.15, .06, 'uppercase', 400],
    ['Press Start 2P', .8, .04, 'uppercase', 400],
    ['Righteous', 1.15, .06, 'uppercase', 400],
    ['Rubik Dirt', 1.2, .06, 'uppercase', 400],
    ['Rye', 1.1, .04, 'none', 400],
    ['Sansita', 1.2, .02, 'none', 400],
    ['Shrikhand', 1.3, 0, 'none', 400],
    ['Sour Gummy', 1.3, 0, 'none', 400],
    ['Space Mono', 1.05, .08, 'uppercase', 400],
    ['Syncopate', 1, .12, 'uppercase', 400],
    ['Titan One', 1.2, .04, 'uppercase', 400],
    ['Unbounded', 1, .06, 'uppercase', 400],
    ['VT323', 1.5, .08, 'uppercase', 400],
    ['Yanone Kaffeesatz', 1.5, .04, 'uppercase', 400],
    ['Yellowtail', 1.5, 0, 'none', 400]
  ];
  /* profile:faces:end */

  /* THE DECORATIONS: [key, name]. Each has its own drawing in D below, and
     make-profile.py refuses one without, or two with the same name. */
  /* profile:decorations:begin */
  var DECORATIONS = [
    ['wreath', 'Flower wreath'], ['vines', 'Ivy'], ['stars', 'Stars'], ['sparkles', 'Sparkles'],
    ['mushrooms', 'Mushrooms'], ['leaves', 'Autumn leaves'], ['hearts', 'Hearts'], ['gears', 'Gears'],
    ['bubbles', 'Bubbles'], ['snow', 'Snowflakes'], ['flames', 'Flames'], ['moons', 'Moons'],
    ['notes', 'Music notes'], ['paws', 'Paw prints'], ['halo', 'Halo'], ['circuit', 'Circuit'],
    ['butterflies', 'Butterflies'], ['crystals', 'Crystals'], ['lanterns', 'Jack-o’-lanterns'], ['otterring', 'Otters in kelp'],
    ['cloudcars', 'Cloud cars']
  ];
  /* profile:decorations:end */

  /* THE FRAMES AND THE EFFECTS: [key, name] (Ryan, 2026-10-18, after
     Discord's). A frame is a band of the card's theme round all four sides of
     a profile, outside it; an effect paints over the profile, partly still,
     along its edges and in its banner, and partly a pass that crosses the whole
     profile from time to time, words included, Ryan's call. Each has its own
     drawing in F or E below, and make-profile.py refuses one without, or two
     with the same name. */
  /* profile:frames:begin */
  var FRAMES = [
    ['briar', 'Briar'], ['ivy', 'Ivy'], ['brass', 'Brass and rivets'], ['lights', 'Fairy lights'],
    ['stitches', 'Stitched patch'], ['film', 'Film strip'], ['circuit', 'Circuit board'], ['crystals', 'Crystals'],
    ['garland', 'Flower garland'], ['starry', 'Starry night'], ['gate', 'Graveyard gate'], ['fronds', 'Kelp fronds'],
    ['portholes', 'Portholes']
  ];
  /* profile:frames:end */
  /* profile:effects:begin */
  var EFFECTS = [
    ['butterflies', 'Butterflies'], ['fireflies', 'Fireflies'], ['petals', 'Falling petals'], ['leaves', 'Falling leaves'],
    ['snow', 'Snowfall'], ['bubbles', 'Bubbles'], ['sparkles', 'Sparkles'], ['shooting', 'Shooting stars'],
    ['notes', 'Music notes'], ['hearts', 'Hearts'], ['lagoon', 'Black Leather Lagoon'], ['otters', 'Otters in the kelp'],
    ['fairy', 'Flying Fairy'], ['wolf', 'Howling Wolf'], ['starward', 'Starward Dreaming'], ['dolphins', 'Leaping Dolphins'],
    ['autumn', 'Autumn Falls'], ['cloudcity', 'Cloud City'], ['muchness', 'Bring Your Muchness']
  ];
  /* profile:effects:end */
  /* AN EFFECT AFTER SOMEBODY ELSE'S WORK SAYS WHOSE, on the card it is on and
     in the editor, because attribution is the habit this street kept. */
  var EFFECT_CREDITS = {
    otters: 'Effect after the Arcade\u2019s Otterly Adorbs, which is built on Helen Edgar\u2019s Stimpunks Solidarity and Otters and Star Stuff\u2019s zine No. 58, The Stone You Keep. The kelp does the holding, and floating fills nothing: these otters float because they want to.',
    lagoon: 'Effect after the street\u2019s Black Leather Lagoon and The Cramps, the band of Lux Interior and Poison Ivy. Their world, not them: nobody real is drawn, the creature is our own, and the poison ivy round the edge is a nod to her name.',
    cloudcity: 'Effect after Cloud City, the city in the clouds of Bespin in The Empire Strikes Back (1980). Star Wars is a trade mark of Lucasfilm. The city, its cloud cars and the sunset are drawn here, and nobody from the films is.',
    muchness: 'Effect after the street\u2019s MAX GLITTER fanfare. Esmx the Porkypine is Kaya Oldaker\u2019s Rainbow Leaping, exactly as she drew it for the Stimpunks Foundation, and \u201cBring Your Muchness\u201d is Infodumplings\u2019 own.',
    fairy: 'Effect after Helen Edgar\u2019s Faery Yurt: its faeries fly here as they fly there, no two dressed alike, dropping petals under its fairy lights. The big fairy with butterfly wings is drawn here, in roses and moss, after the look of Helen\u2019s own profile.'
  };

  function f(n) { return (Math.round(n * 10) / 10).toString(); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function svgEl(tag, at, o) {
    var e = document.createElementNS(NS, tag), k;
    for (k in at) e.setAttribute(k, at[k]);
    o = o || {};
    e.style.setProperty('fill', o.fill ? 'var(' + o.fill + ')' : 'none');
    if (o.stroke) {
      e.style.setProperty('stroke', 'var(' + o.stroke + ')');
      e.style.setProperty('stroke-width', String(o.sw || 2));
      e.style.setProperty('stroke-linecap', 'round');
      e.style.setProperty('stroke-linejoin', 'round');
    }
    if (o.cls) e.setAttribute('class', o.cls);
    if (o.d != null) e.style.setProperty('--d', o.d.toFixed(2) + 's');
    if (o.t != null) e.style.setProperty('--t', o.t.toFixed(2) + 's');
    if (o.run != null) e.style.setProperty('--run', o.run + 'px');
    return e;
  }

  /* A THEME ON AN ELEMENT: its seven colours laid over the radio's seven
     there, so everything inside follows, the way cb.css lays a scheme over the
     host. Amber's are --cb-amber-<part> in love.css, which name the radio's
     own seven as :root has them, because on the host the bare names are the
     viewer's own theme. */
  function dress(node, theme) {
    PARTS.forEach(function (p) { node.style.setProperty('--cb-' + p, 'var(--cb-' + theme + '-' + p + ')'); });
    node.setAttribute('data-pf-theme', theme);
  }

  function faceOf(name) {
    for (var i = 0; i < FACES.length; i++) if (FACES[i][0] === name) return FACES[i];
    return FACES[0];
  }
  function nameStyle(node, face, size) {
    var x = faceOf(face);
    node.style.fontFamily = "'" + x[0] + "', 'Atkinson Hyperlegible', system-ui, sans-serif";
    node.style.fontSize = (size || 26) * x[1] + 'px';
    node.style.letterSpacing = x[2] + 'em';
    node.style.textTransform = x[3];
    node.style.fontWeight = String(x[4]);
  }

  /* A BANNER OR A NAMEPLATE: one of the radio's drawings, drawn along the box
     at whatever size it has, on its own theme's case. */
  function drawing(box, theme) {
    box.textContent = '';
    if (!theme || !window.loveCbArt || !window.loveCbArt.has(theme)) { box.hidden = true; return false; }
    box.hidden = false;
    dress(box, theme);
    window.loveCbArt.draw(theme, { top: box });
    return true;
  }

  /* ── The decorations, in a 140 box round an avatar 96 across ─────────── */
  var C = 70;
  function polar(r, deg) { var a = deg * Math.PI / 180; return [C + r * Math.sin(a), C - r * Math.cos(a)]; }
  function each(n, from, to, fn) {
    for (var i = 0; i < n; i++) fn(from + (to - from) * (n === 1 ? .5 : i / (n - 1)), i);
  }
  function around(n, fn, start) { for (var i = 0; i < n; i++) fn((start || 0) + 360 * i / n, i); }
  function at(parent, x, y, rot) {
    var g = svgEl('g', { transform: 'translate(' + f(x) + ' ' + f(y) + ')' + (rot ? ' rotate(' + f(rot) + ')' : '') });
    g.style.removeProperty('fill');
    parent.appendChild(g);
    return g;
  }
  function star5(r) {
    var d = '', i;
    for (i = 0; i < 10; i++) {
      var a = Math.PI * i / 5, rr = i % 2 ? r * .45 : r;
      d += (i ? 'L' : 'M') + f(rr * Math.sin(a)) + ' ' + f(-rr * Math.cos(a));
    }
    return d + 'Z';
  }
  function sparkle(r) {
    var q = r * .28;
    return 'M0 ' + f(-r) + 'Q' + f(q) + ' ' + f(-q) + ' ' + f(r) + ' 0Q' + f(q) + ' ' + f(q) + ' 0 ' + f(r) +
      'Q' + f(-q) + ' ' + f(q) + ' ' + f(-r) + ' 0Q' + f(-q) + ' ' + f(-q) + ' 0 ' + f(-r) + 'Z';
  }
  function heart(s) {
    return 'M0 ' + f(.9 * s) + 'C' + f(-1.2 * s) + ' ' + f(.1 * s) + ' ' + f(-.7 * s) + ' ' + f(-.9 * s) + ' 0 ' + f(-.35 * s) +
      'C' + f(.7 * s) + ' ' + f(-.9 * s) + ' ' + f(1.2 * s) + ' ' + f(.1 * s) + ' 0 ' + f(.9 * s) + 'Z';
  }
  function leaf(l, w) { return 'M0 ' + f(-l) + 'Q' + f(w) + ' 0 0 ' + f(l) + 'Q' + f(-w) + ' 0 0 ' + f(-l) + 'Z'; }
  function gear(r, teeth) {
    var d = '', n = teeth * 4, i;
    for (i = 0; i < n; i++) {
      var a = 2 * Math.PI * (i + .5) / n, rr = (i % 4 < 2) ? r : r * .76;
      d += (i ? 'L' : 'M') + f(rr * Math.sin(a)) + ' ' + f(-rr * Math.cos(a));
    }
    return d + 'Z';
  }
  function flame(h, w) {
    return 'M0 ' + f(-h) + 'C' + f(w) + ' ' + f(-h * .4) + ' ' + f(w * .8) + ' 0 0 0C' + f(-w * .8) + ' 0 ' + f(-w) + ' ' + f(-h * .4) + ' 0 ' + f(-h) + 'Z';
  }
  // A slice of a circle centred cx cy, R across, between two heights, traced
  // round its edge: a striped sun is its bars, and needs no clipping.
  function slice(cx, cy, R, y0, y1) {
    var n = Math.max(3, Math.ceil((y1 - y0) / R * 12)), L = [], Rt = [], i, y, dx;
    for (i = 0; i <= n; i++) {
      y = y0 + (y1 - y0) * i / n;
      dx = Math.sqrt(Math.max(0, R * R - (y - cy) * (y - cy)));
      L.push(f(cx - dx) + ' ' + f(y));
      Rt.unshift(f(cx + dx) + ' ' + f(y));
    }
    return 'M' + L.concat(Rt).join('L') + 'Z';
  }
  // A striped sun's bars, [from, to] in radii down from its top.
  var SUN_BARS = [[0, .62], [.7, .98], [1.08, 1.3], [1.42, 1.58], [1.72, 1.84]];
  function crescent(r) { return 'M0 ' + f(-r) + 'A' + f(r) + ' ' + f(r) + ' 0 1 1 0 ' + f(r) + 'A' + f(r * .7) + ' ' + f(r) + ' 0 1 0 0 ' + f(-r) + 'Z'; }

  var D = {};
  D.wreath = function (g) {
    around(16, function (a, i) {
      var p = polar(56, a), q = at(g, p[0], p[1], a + 90);
      q.appendChild(svgEl('path', { d: leaf(9, 4) }, { fill: '--cb-steel-2', cls: 'art-sway', d: i * .3, t: 6 }));
    }, 11);
    around(8, function (a, i) {
      var p = polar(58, a), q = at(g, p[0], p[1]);
      around(5, function (b) { q.appendChild(svgEl('circle', { cx: f(4.5 * Math.sin(b * Math.PI / 180)), cy: f(-4.5 * Math.cos(b * Math.PI / 180)), r: 3.6 }, { fill: '--cb-amber' })); });
      q.appendChild(svgEl('circle', { r: 2.6 }, { fill: '--cb-amber-2', cls: 'art-twinkle', d: i * .5, t: 5 }));
    }, 0);
  };
  D.vines = function (g) {
    var d = '', i;
    for (i = 0; i <= 72; i++) { var a = i * 5, r = 58 + 3.5 * Math.sin(i * .9), p = polar(r, a); d += (i ? 'L' : 'M') + f(p[0]) + ' ' + f(p[1]); }
    g.appendChild(svgEl('path', { d: d, pathLength: 1 }, { stroke: '--cb-steel-2', sw: 2, cls: 'art-grow', t: 6 }));
    around(14, function (a, i) {
      var p = polar(i % 2 ? 63 : 53, a), q = at(g, p[0], p[1], a + (i % 2 ? 40 : -40));
      q.appendChild(svgEl('path', { d: heart(5) }, { fill: '--cb-amber-2', cls: 'art-sway', d: i * .4, t: 7 }));
    }, 8);
  };
  D.stars = function (g) {
    around(9, function (a, i) {
      var p = polar(i % 2 ? 62 : 56, a), q = at(g, p[0], p[1], a);
      q.appendChild(svgEl('path', { d: star5(i % 3 ? 6 : 9) }, { fill: i % 2 ? '--cb-amber-2' : '--cb-amber', cls: 'art-twinkle', d: i * .45, t: 4 }));
    }, 20);
  };
  D.sparkles = function (g) {
    var spots = [[40, 8, 60], [100, 5, 54], [160, 7, 62], [215, 4, 56], [262, 9, 60], [318, 5, 64], [5, 4, 52], [130, 3, 64], [290, 3, 52]];
    spots.forEach(function (s, i) {
      var p = polar(s[2], s[0]), q = at(g, p[0], p[1]);
      q.appendChild(svgEl('path', { d: sparkle(s[1]) }, { fill: i % 2 ? '--cb-steel' : '--cb-amber', cls: 'art-twinkle', d: i * .6, t: 3.5 }));
    });
  };
  D.mushrooms = function (g) {
    each(5, 120, 240, function (a, i) {
      var p = polar(58, a), q = at(g, p[0], p[1], a - 180), h = i % 2 ? 9 : 13, w = i % 2 ? 8 : 11;
      var m = svgEl('g', {}, { cls: 'art-rise', d: i * .3, t: 2 });
      m.style.removeProperty('fill');
      m.appendChild(svgEl('rect', { x: f(-w * .25), y: f(-h * .55), width: f(w * .5), height: f(h * .7), rx: 1.5 }, { fill: '--cb-steel' }));
      m.appendChild(svgEl('path', { d: 'M' + f(-w) + ' ' + f(-h * .5) + 'Q0 ' + f(-h * 1.6) + ' ' + f(w) + ' ' + f(-h * .5) + 'Z' }, { fill: '--cb-amber' }));
      m.appendChild(svgEl('circle', { cx: f(-w * .35), cy: f(-h * .8), r: 1.6 }, { fill: '--cb-steel' }));
      m.appendChild(svgEl('circle', { cx: f(w * .3), cy: f(-h * .95), r: 1.3 }, { fill: '--cb-steel' }));
      q.appendChild(m);
    });
    each(6, 105, 255, function (a, i) {
      var p = polar(52, a), q = at(g, p[0], p[1], a - 180);
      q.appendChild(svgEl('path', { d: 'M-4 0L-2 -7M0 0L0 -9M4 0L2 -7' }, { stroke: '--cb-steel-2', sw: 1.6, cls: 'art-sway', d: i * .5, t: 5 }));
    });
  };
  D.leaves = function (g) {
    around(11, function (a, i) {
      var p = polar(i % 2 ? 62 : 55, a), q = at(g, p[0], p[1], a * 1.7);
      var l = svgEl('g', {}, { cls: 'art-sway', d: i * .35, t: 5 });
      l.style.removeProperty('fill');
      l.appendChild(svgEl('path', { d: leaf(8, 5) }, { fill: i % 3 ? '--cb-amber' : '--cb-amber-2' }));
      l.appendChild(svgEl('path', { d: 'M0 -7L0 8' }, { stroke: '--cb-case', sw: 1 }));
      q.appendChild(l);
    }, 15);
  };
  D.hearts = function (g) {
    around(10, function (a, i) {
      var p = polar(i % 2 ? 61 : 56, a), q = at(g, p[0], p[1], (i % 2 ? 12 : -12));
      q.appendChild(svgEl('path', { d: heart(i % 2 ? 4.5 : 6.5) }, { fill: i % 2 ? '--cb-amber-2' : '--cb-amber', cls: 'art-breathe', d: i * .4, t: 4 }));
    }, 0);
  };
  D.gears = function (g) {
    [[45, 13, 10], [135, 9, 8], [225, 12, 9], [315, 9, 8], [0, 7, 7], [180, 7, 7]].forEach(function (s, i) {
      var p = polar(58, s[0]), q = at(g, p[0], p[1]);
      var w = svgEl('g', {}, { cls: 'art-turn', d: i * .7, t: 9 });
      w.style.removeProperty('fill');
      w.appendChild(svgEl('path', { d: gear(s[1], s[2]) }, { fill: '--cb-steel-2' }));
      w.appendChild(svgEl('circle', { r: f(s[1] * .38) }, { fill: '--cb-amber' }));
      q.appendChild(w);
    });
  };
  D.bubbles = function (g) {
    [[20, 6, 60], [62, 4, 55], [100, 8, 62], [150, 5, 56], [195, 7, 61], [240, 4, 54], [282, 9, 60], [330, 5, 57]].forEach(function (s, i) {
      var p = polar(s[2], s[0]), q = at(g, p[0], p[1]);
      var b = svgEl('g', {}, { cls: 'art-twinkle', d: i * .5, t: 5 });
      b.style.removeProperty('fill');
      b.appendChild(svgEl('circle', { r: s[1] }, { stroke: '--cb-steel', sw: 1.6 }));
      b.appendChild(svgEl('path', { d: 'M' + f(-s[1] * .55) + ' ' + f(-s[1] * .1) + 'A' + f(s[1] * .6) + ' ' + f(s[1] * .6) + ' 0 0 1 ' + f(-s[1] * .1) + ' ' + f(-s[1] * .55) }, { stroke: '--cb-amber', sw: 1.4 }));
      q.appendChild(b);
    });
  };
  D.snow = function (g) {
    around(8, function (a, i) {
      var p = polar(i % 2 ? 62 : 56, a), q = at(g, p[0], p[1], a), r = i % 2 ? 5 : 7, d = '';
      around(6, function (b) {
        var x = r * Math.sin(b * Math.PI / 180), y = -r * Math.cos(b * Math.PI / 180);
        d += 'M0 0L' + f(x) + ' ' + f(y);
        var bx = x * .6, by = y * .6, k = (b + 90) * Math.PI / 180, s = r * .3;
        d += 'M' + f(bx - s * Math.sin(k) * .7) + ' ' + f(by + s * Math.cos(k) * .7) + 'L' + f(bx) + ' ' + f(by) + 'L' + f(bx + s * Math.sin(k) * .7) + ' ' + f(by - s * Math.cos(k) * .7);
      });
      q.appendChild(svgEl('path', { d: d }, { stroke: i % 2 ? '--cb-steel-2' : '--cb-steel', sw: 1.4, cls: 'art-twinkle', d: i * .5, t: 5 }));
    }, 22);
  };
  D.flames = function (g) {
    each(9, 110, 250, function (a, i) {
      var p = polar(57, a), q = at(g, p[0], p[1], a - 180), h = 10 + 5 * Math.abs(Math.sin(i * 1.7)), w = 6;
      var fl = svgEl('g', {}, { cls: 'art-glow', d: i * .45, t: 4 });
      fl.style.removeProperty('fill');
      fl.appendChild(svgEl('path', { d: flame(h, w) }, { fill: '--cb-amber' }));
      fl.appendChild(svgEl('path', { d: flame(h * .55, w * .5) }, { fill: '--cb-amber-2' }));
      q.appendChild(fl);
    });
  };
  D.moons = function (g) {
    each(7, -70, 70, function (a, i) {
      var p = polar(59, a), q = at(g, p[0], p[1]), r = 6;
      if (i === 3) q.appendChild(svgEl('circle', { r: r }, { fill: '--cb-steel', cls: 'art-glow', t: 5 }));
      else q.appendChild(svgEl('path', { d: crescent(r), transform: i < 3 ? 'scale(-1 1)' : '' }, { fill: i < 3 ? '--cb-steel' : '--cb-amber' }));
    });
    each(5, 130, 230, function (a, i) {
      var p = polar(60, a), q = at(g, p[0], p[1]);
      q.appendChild(svgEl('path', { d: sparkle(i % 2 ? 3 : 4.5) }, { fill: '--cb-amber-2', cls: 'art-twinkle', d: i * .6, t: 4 }));
    });
  };
  D.notes = function (g) {
    around(7, function (a, i) {
      var p = polar(i % 2 ? 61 : 56, a), q = at(g, p[0], p[1], (i % 2 ? 10 : -10));
      var n = svgEl('g', {}, { cls: 'art-sway', d: i * .4, t: 5 });
      n.style.removeProperty('fill');
      if (i % 3 === 2) {
        n.appendChild(svgEl('ellipse', { cx: -5, cy: 5, rx: 3.4, ry: 2.6, transform: 'rotate(-20 -5 5)' }, { fill: '--cb-amber' }));
        n.appendChild(svgEl('ellipse', { cx: 5, cy: 3, rx: 3.4, ry: 2.6, transform: 'rotate(-20 5 3)' }, { fill: '--cb-amber' }));
        n.appendChild(svgEl('path', { d: 'M-2 5L-2 -8L8 -10L8 3' }, { stroke: '--cb-amber', sw: 1.8 }));
      } else {
        n.appendChild(svgEl('ellipse', { cx: -2, cy: 5, rx: 3.6, ry: 2.8, transform: 'rotate(-20 -2 5)' }, { fill: i % 2 ? '--cb-amber-2' : '--cb-amber' }));
        n.appendChild(svgEl('path', { d: 'M1.4 4L1.4 -9Q6 -6 6 -2' }, { stroke: i % 2 ? '--cb-amber-2' : '--cb-amber', sw: 1.8 }));
      }
      q.appendChild(n);
    }, 30);
  };
  D.paws = function (g) {
    around(8, function (a, i) {
      var p = polar(i % 2 ? 61 : 56, a), q = at(g, p[0], p[1], a + 90);
      q.appendChild(svgEl('ellipse', { cx: 0, cy: 2, rx: 3.8, ry: 3.2 }, { fill: '--cb-steel-2' }));
      [[-4.4, -2.6], [-1.5, -5], [1.5, -5], [4.4, -2.6]].forEach(function (t) {
        q.appendChild(svgEl('circle', { cx: t[0], cy: t[1], r: 1.5 }, { fill: '--cb-steel-2' }));
      });
    }, 10);
  };
  D.halo = function (g) {
    g.appendChild(svgEl('circle', { cx: C, cy: C, r: 54 }, { stroke: '--cb-amber', sw: 3 }));
    g.appendChild(svgEl('circle', { cx: C, cy: C, r: 61 }, { stroke: '--cb-steel-2', sw: 1.5 }));
    around(24, function (a, i) {
      var p = polar(61, a);
      g.appendChild(svgEl('circle', { cx: f(p[0]), cy: f(p[1]), r: i % 6 ? 1.4 : 2.8 }, { fill: i % 6 ? '--cb-steel-2' : '--cb-amber', cls: i % 6 ? '' : 'art-twinkle', d: i * .2, t: 4 }));
    });
  };
  D.circuit = function (g) {
    around(10, function (a, i) {
      var r0 = 51, r1 = i % 2 ? 60 : 64, p0 = polar(r0, a), p1 = polar(r1, a), p2 = polar(r1, a + (i % 2 ? 9 : -9));
      g.appendChild(svgEl('path', { d: 'M' + f(p0[0]) + ' ' + f(p0[1]) + 'L' + f(p1[0]) + ' ' + f(p1[1]) + 'L' + f(p2[0]) + ' ' + f(p2[1]), pathLength: 1 }, { stroke: '--cb-amber-2', sw: 1.6, cls: 'art-grow', d: i * .2, t: 3 }));
      g.appendChild(svgEl('circle', { cx: f(p2[0]), cy: f(p2[1]), r: 2.4 }, { fill: '--cb-amber', cls: 'art-glow', d: i * .4, t: 4 }));
    }, 0);
    g.appendChild(svgEl('circle', { cx: C, cy: C, r: 51 }, { stroke: '--cb-steel-2', sw: 1.4 }));
  };
  D.butterflies = function (g) {
    [[300, 10], [45, 8], [150, 9], [210, 7]].forEach(function (s, i) {
      var p = polar(60, s[0]), q = at(g, p[0], p[1], i % 2 ? 15 : -15), w = s[1];
      var b = svgEl('g', {}, { cls: 'art-breathe', d: i * .6, t: 3.5 });
      b.style.removeProperty('fill');
      b.appendChild(svgEl('ellipse', { cx: f(-w * .5), cy: f(-w * .3), rx: f(w * .5), ry: f(w * .4) }, { fill: '--cb-amber' }));
      b.appendChild(svgEl('ellipse', { cx: f(w * .5), cy: f(-w * .3), rx: f(w * .5), ry: f(w * .4) }, { fill: '--cb-amber' }));
      b.appendChild(svgEl('ellipse', { cx: f(-w * .38), cy: f(w * .3), rx: f(w * .32), ry: f(w * .28) }, { fill: '--cb-amber-2' }));
      b.appendChild(svgEl('ellipse', { cx: f(w * .38), cy: f(w * .3), rx: f(w * .32), ry: f(w * .28) }, { fill: '--cb-amber-2' }));
      b.appendChild(svgEl('path', { d: 'M0 ' + f(-w * .7) + 'L0 ' + f(w * .6) }, { stroke: '--cb-steel', sw: 1.6 }));
      q.appendChild(b);
    });
  };
  D.crystals = function (g) {
    each(7, 125, 235, function (a, i) {
      var p = polar(56, a), q = at(g, p[0], p[1], a - 180 + (i - 3) * 4), h = 10 + (i % 3) * 4, w = 4 + (i % 2);
      q.appendChild(svgEl('path', { d: 'M0 ' + f(-h) + 'L' + f(w) + ' ' + f(-h * .7) + 'L' + f(w) + ' 2L0 4L' + f(-w) + ' 2L' + f(-w) + ' ' + f(-h * .7) + 'Z' }, { fill: i % 2 ? '--cb-steel-2' : '--cb-amber-2' }));
      q.appendChild(svgEl('path', { d: 'M0 ' + f(-h) + 'L0 4' }, { stroke: '--cb-steel', sw: 1 }));
    });
    each(4, 140, 220, function (a, i) {
      var p = polar(64, a), q = at(g, p[0], p[1]);
      q.appendChild(svgEl('path', { d: sparkle(3) }, { fill: '--cb-amber', cls: 'art-twinkle', d: i * .7, t: 4 }));
    });
  };

  /* JACK-O'-LANTERNS (2026-10-18), to pair with the Black Leather Lagoon: a
     pumpkin vine round the avatar with lanterns on it, their carved faces dark
     holes with a light in them, and two bats over the top. In the card's own
     inks, like every decoration: in the Lagoon's theme the pumpkins are its
     poster red and the light inside them its acid green. */
  function lantern(g, x, y, k, i) {
    var q = at(g, x, y), w = 9 * k, h = 7.6 * k;
    q.appendChild(svgEl('path', { d: 'M' + f(-1 * k) + ' ' + f(-h * .9) + 'Q' + f(-.4 * k) + ' ' + f(-h * 1.3) + ' ' + f(1.6 * k) + ' ' + f(-h * 1.38) }, { stroke: '--cb-steel-2', sw: f(1.8 * k) }));
    [[-w * .5, w * .58], [w * .5, w * .58], [0, w * .62]].forEach(function (b) {
      q.appendChild(svgEl('ellipse', { cx: f(b[0]), cy: 0, rx: f(b[1]), ry: f(h) }, { fill: '--cb-amber-2', stroke: '--cb-case', sw: .9 }));
    });
    var face = svgEl('g', {}, { cls: 'art-glow', d: i * .6, t: 5 });
    face.style.removeProperty('fill');
    [[-1, 1], [1, 1]].forEach(function (e) {
      var ex = e[0] * 3.6 * k, ey = -2.2 * k;
      face.appendChild(svgEl('path', { d: 'M' + f(ex - 1.8 * k) + ' ' + f(ey + 1.3 * k) + 'L' + f(ex) + ' ' + f(ey - 1.6 * k) + 'L' + f(ex + 1.8 * k) + ' ' + f(ey + 1.3 * k) + 'Z' }, { fill: '--cb-amber', stroke: '--cb-case', sw: .7 }));
    });
    face.appendChild(svgEl('path', { d: 'M' + f(-5.4 * k) + ' ' + f(1.4 * k) + 'Q0 ' + f(6.6 * k) + ' ' + f(5.4 * k) + ' ' + f(1.4 * k) + 'L' + f(3.4 * k) + ' ' + f(3 * k) + 'L' + f(2 * k) + ' ' + f(1.8 * k) + 'L' + f(.4 * k) + ' ' + f(3.4 * k) + 'L' + f(-1.2 * k) + ' ' + f(1.9 * k) + 'L' + f(-2.8 * k) + ' ' + f(3.2 * k) + 'Z' }, { fill: '--cb-amber', stroke: '--cb-case', sw: .7 }));
    q.appendChild(face);
  }
  D.lanterns = function (g) {
    var d = '', i;
    for (i = 0; i <= 54; i++) { var a = 90 + i * 3.4, rr = 58 + 2.6 * Math.sin(i * 1.1), p = polar(rr, a); d += (i ? 'L' : 'M') + f(p[0]) + ' ' + f(p[1]); }
    g.appendChild(svgEl('path', { d: d, pathLength: 1 }, { stroke: '--cb-steel-2', sw: 1.8, cls: 'art-grow', t: 5 }));
    [[112, 66], [160, 72], [205, 70], [250, 64]].forEach(function (cl, j) {
      var p = polar(cl[1], cl[0]), q = at(g, p[0], p[1], cl[0] + 90);
      q.appendChild(svgEl('path', { d: 'M0 0c3 -2 6 0 4 3c-2 2 -5 0 -3 -2' }, { stroke: '--cb-steel-2', sw: 1.1, cls: 'art-sway', d: j * .5, t: 6 }));
    });
    [[132, 1.05], [180, 1.3], [228, 1.05]].forEach(function (pl, j) {
      var p = polar(57, pl[0]);
      lantern(g, p[0], p[1], pl[1], j);
    });
    [[148, 59, 70], [212, 59, 290]].forEach(function (lf, j) {
      var p = polar(lf[1], lf[0]);
      at(g, p[0], p[1], lf[2]).appendChild(svgEl('path', { d: leaf(6, 4.4) }, { fill: '--cb-steel-2', cls: 'art-sway', d: j * .7, t: 6 }));
    });
    [[-34, 63, 1], [30, 60, .8]].forEach(function (bt, j) {
      var p = polar(bt[1], bt[0]), q = at(g, p[0], p[1], bt[0] * .4);
      var w = svgEl('g', { transform: 'scale(' + f(bt[2]) + ')' }, { cls: 'art-breathe', d: j * .8, t: 3 });
      w.style.removeProperty('fill');
      w.appendChild(svgEl('path', { d: 'M0 -1C-3 -4 -6 -5 -11 -3C-9 -1 -9 1 -10 3C-7 2 -4 3 0 2C4 3 7 2 10 3C9 1 9 -1 11 -3C6 -5 3 -4 0 -1Z' }, { fill: '--cb-bar', stroke: '--cb-steel-2', sw: .9 }));
      w.appendChild(svgEl('circle', { cx: -1, cy: -.5, r: .7 }, { fill: '--cb-amber' }));
      w.appendChild(svgEl('circle', { cx: 1, cy: -.5, r: .7 }, { fill: '--cb-amber' }));
      q.appendChild(w);
    });
  };

  /* OTTERS IN KELP (2026-10-18), to pair with the otter effect: a strand of
     kelp wound round the avatar, and two little otters floating at its foot,
     each with the kelp across it, because the kelp does the holding. They do
     not hold paws: that story is the internet's (otterly.js says why). In the
     card's own inks, like every decoration. */
  function cardOtter(g, x, y, k, flip) {
    var q = at(g, x, y);
    var w = svgEl('g', { transform: flip ? 'scale(-1 1)' : '' }, { cls: 'art-sway', d: flip ? 1.2 : 0, t: 6 });
    w.style.removeProperty('fill');
    w.appendChild(svgEl('path', { d: 'M' + f(-9 * k) + ' ' + f(.4 * k) + 'Q' + f(-15 * k) + ' 0 ' + f(-14.4 * k) + ' ' + f(-2 * k) + 'Q' + f(-11 * k) + ' ' + f(-2.2 * k) + ' ' + f(-8.4 * k) + ' ' + f(-1.4 * k) + 'Z' }, { fill: '--cb-amber-2', stroke: '--cb-case', sw: .8 }));
    w.appendChild(svgEl('ellipse', { cx: 0, cy: 0, rx: f(9.4 * k), ry: f(3.8 * k) }, { fill: '--cb-amber', stroke: '--cb-case', sw: .9 }));
    w.appendChild(svgEl('ellipse', { cx: f(-7.6 * k), cy: f(-3.8 * k), rx: f(1.2 * k), ry: f(2.3 * k), transform: 'rotate(-18 ' + f(-7.6 * k) + ' ' + f(-3.8 * k) + ')' }, { fill: '--cb-amber-2', stroke: '--cb-case', sw: .7 }));
    w.appendChild(svgEl('circle', { cx: f(10 * k), cy: f(-1.2 * k), r: f(4 * k) }, { fill: '--cb-steel', stroke: '--cb-case', sw: .9 }));
    w.appendChild(svgEl('circle', { cx: f(8.2 * k), cy: f(-4.6 * k), r: f(.9 * k) }, { fill: '--cb-amber', stroke: '--cb-case', sw: .6 }));
    w.appendChild(svgEl('path', { d: 'M' + f(8.8 * k) + ' ' + f(-2.2 * k) + 'q' + f(.7 * k) + ' ' + f(-.9 * k) + ' ' + f(1.4 * k) + ' 0' }, { stroke: '--cb-case', sw: .8 }));
    w.appendChild(svgEl('ellipse', { cx: f(13.2 * k), cy: f(-1 * k), rx: f(.9 * k), ry: f(.7 * k) }, { fill: '--cb-case' }));
    w.appendChild(svgEl('ellipse', { cx: f(4.6 * k), cy: f(-3.6 * k), rx: f(1.3 * k), ry: f(1 * k) }, { fill: '--cb-amber-2', stroke: '--cb-case', sw: .6 }));
    w.appendChild(svgEl('path', { d: 'M' + f(-6 * k) + ' ' + f(3.6 * k) + 'Q0 ' + f(-5 * k) + ' ' + f(6.4 * k) + ' ' + f(3.6 * k) }, { stroke: '--cb-amber-2', sw: 1.4 }));
    q.appendChild(w);
  }
  D.otterring = function (g) {
    var d = '', i;
    for (i = 0; i <= 72; i++) { var a = i * 5, rr = 57 + 2.4 * Math.sin(i * .8), p = polar(rr, a); d += (i ? 'L' : 'M') + f(p[0]) + ' ' + f(p[1]); }
    g.appendChild(svgEl('path', { d: d, pathLength: 1 }, { stroke: '--cb-amber-2', sw: 1.8, cls: 'art-grow', t: 6 }));
    around(10, function (a, j) {
      var p = polar(j % 2 ? 61 : 53, a), q = at(g, p[0], p[1], a + (j % 2 ? 50 : -50));
      q.appendChild(svgEl('path', { d: leaf(5.2, 2.6) }, { fill: '--cb-amber-2', cls: 'art-sway', d: j * .4, t: 6 }));
      if (j % 3 === 0) q.appendChild(svgEl('circle', { cx: 0, cy: 5.4, r: 1.6 }, { fill: '--cb-amber' }));
    }, 0);
    var p1 = polar(58, 152), p2 = polar(58, 208);
    cardOtter(g, p1[0], p1[1], 1.15, true);
    cardOtter(g, p2[0], p2[1], 1.15, false);
    [[-24, 64, 2.4], [-14, 68, 1.6], [20, 66, 2]].forEach(function (b, j) {
      var p = polar(b[1], b[0]);
      g.appendChild(svgEl('circle', { cx: f(p[0]), cy: f(p[1]), r: b[2] }, { stroke: '--cb-steel', sw: .9, cls: 'art-twinkle', d: j * .9, t: 4 }));
    });
  };

  /* CLOUD CARS (2026-10-23), to pair with the Cloud City effect: a bank of
     cloud round the foot of the avatar with a striped sun going down behind
     it, and two cloud cars going round the top, holding station. Nobody from
     the films is drawn. In the card's own inks, like every decoration: in the
     Cloud City theme the sun is its gold and peach and the cars its peach. */
  var CARD_SUN = ['--cb-amber', '--cb-amber', '--cb-amber-2', '--cb-amber-2', '--cb-amber-2'];
  var CARD_PODS = ['--cb-steel-2', '--cb-amber-2'];
  // A cloud car, two pods side by side joined amidships, facing right, about
  // twenty long at k 1: the pod behind in shade, glass forward, engines aft.
  function cardCar(g, x, y, rot, k, i) {
    var hold = svgEl('g', {}, { cls: 'art-hover', d: i * 1.6, t: 7 });
    hold.style.removeProperty('fill');
    at(g, x, y, rot).appendChild(hold);
    var c = group(hold, 'scale(' + k3(k) + ')');
    function pod(py, ink) {
      c.appendChild(svgEl('rect', { x: -9, y: f(py - 2.1), width: 18, height: 4.2, rx: 2.1 }, { fill: ink, stroke: '--cb-case', sw: .8 }));
      c.appendChild(svgEl('ellipse', { cx: 5.6, cy: f(py - .4), rx: 2.6, ry: 1.5 }, { fill: '--cb-steel' }));
      c.appendChild(svgEl('circle', { cx: -9.4, cy: f(py), r: 1.2 }, { fill: '--cb-amber' }));
    }
    pod(-2, CARD_PODS[0]);
    c.appendChild(svgEl('rect', { x: -3.4, y: -1.6, width: 5.4, height: 3.2, rx: .8 }, { fill: '--cb-steel-2' }));
    pod(1.8, CARD_PODS[1]);
  }
  D.cloudcars = function (g) {
    SUN_BARS.forEach(function (b, i) {
      g.appendChild(svgEl('path', { d: slice(70, 118, 14, 104 + b[0] * 14, 104 + b[1] * 14) }, { fill: CARD_SUN[i], cls: i ? '' : 'art-glow', t: 6 }));
    });
    // the cloud round the lower half: clouds of three puffs each, along the
    // ring, in shade underneath and then lit on top
    var puffs = [];
    each(6, 116, 244, function (a, i) {
      var p = polar(i % 2 ? 61 : 58, a), rad = a * Math.PI / 180, tx = Math.cos(rad), ty = Math.sin(rad), big = i % 2 ? 7 : 8.4;
      puffs.push([p[0] - tx * big * .9, p[1] - ty * big * .9 + 1.4, big * .66]);
      puffs.push([p[0] + Math.sin(rad) * 1.4, p[1] - Math.cos(rad) * 1.4, big]);
      puffs.push([p[0] + tx * big * .95, p[1] + ty * big * .95 + 1.2, big * .7]);
    });
    puffs.forEach(function (q) { g.appendChild(svgEl('circle', { cx: f(q[0]), cy: f(q[1] + 2.4), r: f(q[2]) }, { fill: '--cb-steel-2' })); });
    puffs.forEach(function (q, i) {
      g.appendChild(svgEl('circle', { cx: f(q[0] - .5), cy: f(q[1] - .6), r: f(q[2] * .84) }, { fill: '--cb-steel', cls: i % 7 ? '' : 'art-breathe', d: i * .5, t: 8 }));
    });
    var c1 = polar(64, -32), c2 = polar(66, 28);
    cardCar(g, c1[0], c1[1], -32, 1, 0);
    cardCar(g, c2[0], c2[1], 28, .84, 1);
  };

  function decoration(key) {
    if (!D[key]) return null;
    var s = document.createElementNS(NS, 'svg');
    s.setAttribute('viewBox', '0 0 140 140');
    s.setAttribute('aria-hidden', 'true');
    s.setAttribute('focusable', 'false');
    s.setAttribute('class', 'pf-deco');
    var g = svgEl('g', {});
    g.style.removeProperty('fill');
    s.appendChild(g);
    D[key](g);
    return s;
  }
  function decorationName(key) {
    for (var i = 0; i < DECORATIONS.length; i++) if (DECORATIONS[i][0] === key) return DECORATIONS[i][1];
    return '';
  }

  /* ── The frames: a band BAND wide round all four sides ───────────────────

     Each side is drawn as the top is, along x with its outer edge at y 0, and
     turned to face outward, ONCE AND LONGER THAN A PROFILE CAN BE, the radio's
     sides' rule, so nothing is drawn again because the profile grew: a side is
     cut off where the profile ends, and the corner covers the cut. A corner is
     drawn in a square twice the band, its outer corner at 0 0, on a patch of
     the band's own ground where two sides meet. Every drawing is made in a
     band UNIT across and scaled to BAND. */
  var UNIT = 18, BAND = 24, K = BAND * 2, SCALE = BAND / UNIT;
  function rnd(i) { var x = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return x - Math.floor(x); }
  function group(parent, transform) {
    var g = svgEl('g', transform ? { transform: transform } : {});
    g.style.removeProperty('fill');
    parent.appendChild(g);
    return g;
  }
  function plainSvg(w, h, cls) {
    var s = document.createElementNS(NS, 'svg');
    s.setAttribute('width', String(w));
    s.setAttribute('height', String(h));
    s.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
    s.setAttribute('aria-hidden', 'true');
    s.setAttribute('focusable', 'false');
    if (cls) s.setAttribute('class', cls);
    return s;
  }
  function wave(L, y, amp, len, shift) {
    var d = '', x;
    for (x = 0; x <= L; x += 4) d += (x ? 'L' : 'M') + f(x) + ' ' + f(y + amp * Math.sin(x / len + (shift || 0)));
    return d;
  }
  function blossom(g, x, y, r, centreCls, i) {
    var q = at(g, x, y);
    around(5, function (b) { q.appendChild(svgEl('circle', { cx: f(r * 1.15 * Math.sin(b * Math.PI / 180)), cy: f(-r * 1.15 * Math.cos(b * Math.PI / 180)), r: f(r) }, { fill: '--cb-amber' })); });
    q.appendChild(svgEl('circle', { r: f(r * .65) }, { fill: '--cb-amber-2', cls: centreCls || '', d: (i || 0) * .45, t: 4 }));
    return q;
  }

  var F = {};
  F.briar = {
    side: function (g, L) {
      g.appendChild(svgEl('path', { d: wave(L, 9, 4, 22) }, { stroke: '--cb-steel-2', sw: 2.6 }));
      g.appendChild(svgEl('path', { d: wave(L, 9, -4, 22, .8) }, { stroke: '--cb-steel', sw: 1.6 }));
      for (var x = 7, i = 0; x < L; x += 13, i++) {
        var y = 9 + 4 * Math.sin(x / 22), up = i % 2 ? 1 : -1;
        g.appendChild(svgEl('path', { d: 'M' + f(x - 2.2) + ' ' + f(y) + 'L' + f(x + 2.2) + ' ' + f(y) + 'L' + f(x + 3.4) + ' ' + f(y + up * 5.4) + 'Z' }, { fill: '--cb-steel-2' }));
      }
    },
    corner: function (g) {
      g.appendChild(svgEl('path', { d: 'M3 30C1 14 12 3 30 3M8 33C5 18 17 7 33 8M12 21C14 11 26 12 22 19C19 24 12 19 17 14' }, { stroke: '--cb-steel-2', sw: 2.6 }));
      [[5, 18, -1], [18, 5, 1], [10, 27, -1], [27, 10, 1]].forEach(function (s) {
        g.appendChild(svgEl('path', { d: 'M' + s[0] + ' ' + s[1] + 'l' + (s[2] * 5) + ' ' + (-s[2] * 2) + 'l' + (-s[2] * 1) + ' ' + (s[2] * 4) + 'Z' }, { fill: '--cb-steel-2' }));
      });
      at(g, 29, 29).appendChild(svgEl('path', { d: sparkle(4) }, { fill: '--cb-amber', cls: 'art-twinkle', t: 4 }));
    }
  };
  F.ivy = {
    side: function (g, L) {
      g.appendChild(svgEl('path', { d: wave(L, 10, 3, 28) }, { stroke: '--cb-steel-2', sw: 1.8 }));
      for (var x = 8, i = 0; x < L; x += 16, i++) {
        var y = 10 + 3 * Math.sin(x / 28), q = at(g, x, y + (i % 2 ? 2 : -2), i % 2 ? 140 : 40);
        var l = svgEl('g', {}, { cls: 'art-sway', d: i * .4, t: 6 });
        l.style.removeProperty('fill');
        l.appendChild(svgEl('path', { d: leaf(5.2, 3.6) }, { fill: i % 3 ? '--cb-amber-2' : '--cb-steel-2' }));
        l.appendChild(svgEl('path', { d: 'M0 -4L0 4.5' }, { stroke: '--cb-case', sw: .8 }));
        q.appendChild(l);
      }
    },
    corner: function (g) {
      g.appendChild(svgEl('path', { d: 'M2 34C2 16 16 2 34 2M16 16C10 22 6 14 12 10C18 6 22 14 16 16' }, { stroke: '--cb-steel-2', sw: 1.8 }));
      [[8, 20, 20], [20, 8, 70], [24, 24, 45]].forEach(function (s, i) {
        at(g, s[0], s[1], s[2]).appendChild(svgEl('path', { d: leaf(6.4, 4.4) }, { fill: i % 2 ? '--cb-steel-2' : '--cb-amber-2', cls: 'art-sway', d: i * .5, t: 6 }));
      });
    }
  };
  F.brass = {
    side: function (g, L) {
      g.appendChild(svgEl('rect', { x: 0, y: 3, width: L, height: 12 }, { fill: '--cb-bar', stroke: '--cb-steel-2', sw: 1.2 }));
      g.appendChild(svgEl('path', { d: 'M0 1H' + L }, { stroke: '--cb-steel-2', sw: 1.4 }));
      g.appendChild(svgEl('path', { d: 'M0 16.8H' + L }, { stroke: '--cb-amber', sw: 1.2 }));
      for (var x = 12; x < L; x += 24) {
        g.appendChild(svgEl('circle', { cx: x, cy: 9, r: 2.6 }, { fill: '--cb-amber-2' }));
        g.appendChild(svgEl('circle', { cx: x - .8, cy: 8.2, r: .9 }, { fill: '--cb-steel' }));
      }
    },
    corner: function (g) {
      g.appendChild(svgEl('rect', { x: 1, y: 1, width: 24, height: 24, rx: 3 }, { fill: '--cb-bar', stroke: '--cb-steel-2', sw: 1.2 }));
      var w = at(g, 13, 13);
      var turn = svgEl('g', {}, { cls: 'art-turn', t: 9 });
      turn.style.removeProperty('fill');
      turn.appendChild(svgEl('path', { d: gear(11, 8) }, { fill: '--cb-steel-2' }));
      turn.appendChild(svgEl('circle', { r: 4.2 }, { fill: '--cb-amber' }));
      turn.appendChild(svgEl('circle', { r: 1.6 }, { fill: '--cb-bar' }));
      w.appendChild(turn);
    }
  };
  F.lights = {
    side: function (g, L) {
      for (var x = 0, i = 0; x < L; x += 36, i += 2) {
        g.appendChild(svgEl('path', { d: 'M' + x + ' 3Q' + (x + 18) + ' 13 ' + (x + 36) + ' 3' }, { stroke: '--cb-steel-2', sw: 1.2 }));
        [[x + 9, 6.75], [x + 27, 6.75]].forEach(function (b, j) {
          g.appendChild(svgEl('rect', { x: f(b[0] - 1.3), y: f(b[1]), width: 2.6, height: 2.2 }, { fill: '--cb-steel' }));
          g.appendChild(svgEl('ellipse', { cx: f(b[0]), cy: f(b[1] + 5.6), rx: 2.6, ry: 3.4 }, { fill: (i + j) % 2 ? '--cb-amber-2' : '--cb-amber', cls: 'art-twinkle', d: (i + j) * .37 % 4, t: 3.6 }));
        });
      }
    },
    corner: function (g) {
      g.appendChild(svgEl('circle', { cx: 9, cy: 9, r: 4 }, { stroke: '--cb-steel-2', sw: 1.6 }));
      g.appendChild(svgEl('path', { d: 'M12 12Q20 22 30 26' }, { stroke: '--cb-steel-2', sw: 1.2 }));
      g.appendChild(svgEl('ellipse', { cx: 20, cy: 24, rx: 2.8, ry: 3.6 }, { fill: '--cb-amber', cls: 'art-twinkle', d: 1.1, t: 3.6 }));
    }
  };
  F.stitches = {
    side: function (g, L) {
      g.appendChild(svgEl('rect', { x: 0, y: 1, width: L, height: 16 }, { fill: '--cb-bar' }));
      var twill = '';
      for (var x = 0; x < L; x += 3) twill += 'M' + x + ' 1.5L' + (x + 2.5) + ' 5.5';
      g.appendChild(svgEl('path', { d: twill }, { stroke: '--cb-steel-2', sw: 1 }));
      var st = svgEl('path', { d: 'M0 11.5H' + L }, { stroke: '--cb-amber', sw: 1.6 });
      st.style.setProperty('stroke-dasharray', '5 3');
      g.appendChild(st);
    },
    corner: function (g) {
      g.appendChild(svgEl('path', { d: 'M1 26V12Q1 1 12 1H26V18H18V26Z' }, { fill: '--cb-bar' }));
      g.appendChild(svgEl('path', { d: 'M8 8L16 16M16 8L8 16' }, { stroke: '--cb-amber', sw: 1.8 }));
    }
  };
  F.film = {
    side: function (g, L) {
      g.appendChild(svgEl('rect', { x: 0, y: 1, width: L, height: 16 }, { fill: '--cb-bar', stroke: '--cb-steel-2', sw: 1 }));
      for (var x = 3; x < L; x += 10) g.appendChild(svgEl('rect', { x: x, y: 5.5, width: 4.4, height: 7, rx: 1 }, { fill: '--cb-case' }));
    },
    corner: function (g) {
      g.appendChild(svgEl('circle', { cx: 14, cy: 14, r: 12 }, { fill: '--cb-bar', stroke: '--cb-steel-2', sw: 1.4 }));
      var reel = at(g, 14, 14);
      var turn = svgEl('g', {}, { cls: 'art-turn', t: 9 });
      turn.style.removeProperty('fill');
      around(5, function (a) { turn.appendChild(svgEl('circle', { cx: f(6.4 * Math.sin(a * Math.PI / 180)), cy: f(-6.4 * Math.cos(a * Math.PI / 180)), r: 2.6 }, { fill: '--cb-case' })); });
      turn.appendChild(svgEl('circle', { r: 1.8 }, { fill: '--cb-amber' }));
      reel.appendChild(turn);
    }
  };
  F.circuit = {
    side: function (g, L) {
      g.appendChild(svgEl('path', { d: 'M0 5H' + L }, { stroke: '--cb-steel-2', sw: 1.2 }));
      g.appendChild(svgEl('path', { d: 'M0 13H' + L }, { stroke: '--cb-amber-2', sw: 1.2 }));
      for (var x = 6, i = 0; x < L; x += 22, i++) {
        if (i % 2) g.appendChild(svgEl('path', { d: 'M' + x + ' 5L' + (x + 6) + ' 13' }, { stroke: '--cb-steel-2', sw: 1.2 }));
        g.appendChild(svgEl('circle', { cx: x, cy: 5, r: 2 }, { fill: '--cb-amber', cls: i % 3 ? '' : 'art-glow', d: i * .4 % 4, t: 4 }));
        g.appendChild(svgEl('circle', { cx: x + 11, cy: 13, r: 2 }, { fill: '--cb-amber-2' }));
      }
    },
    corner: function (g) {
      g.appendChild(svgEl('path', { d: 'M10 4V1M16 4V1M22 4V1M4 10H1M4 16H1M4 22H1' }, { stroke: '--cb-steel-2', sw: 1.4 }));
      g.appendChild(svgEl('rect', { x: 4, y: 4, width: 22, height: 22, rx: 2 }, { fill: '--cb-bar', stroke: '--cb-steel-2', sw: 1.4 }));
      g.appendChild(svgEl('circle', { cx: 15, cy: 15, r: 3 }, { fill: '--cb-amber', cls: 'art-glow', t: 4 }));
    }
  };
  F.crystals = {
    side: function (g, L) {
      g.appendChild(svgEl('path', { d: 'M0 16.5H' + L }, { stroke: '--cb-steel-2', sw: 1.4 }));
      for (var x = 4, i = 0; x < L; x += 9, i++) {
        var h = 7 + 5 * Math.abs(Math.sin(i * 1.3)), w = 2.6;
        g.appendChild(svgEl('path', { d: 'M' + f(x - w) + ' 16L' + f(x - w) + ' ' + f(16 - h * .6) + 'L' + f(x) + ' ' + f(16 - h) + 'L' + f(x + w) + ' ' + f(16 - h * .6) + 'L' + f(x + w) + ' 16Z' }, { fill: i % 2 ? '--cb-amber-2' : '--cb-steel-2' }));
        g.appendChild(svgEl('path', { d: 'M' + f(x) + ' ' + f(16 - h) + 'L' + f(x) + ' 16' }, { stroke: '--cb-steel', sw: .7 }));
      }
    },
    corner: function (g) {
      [[-65, 18, '--cb-steel-2'], [-45, 22, '--cb-amber-2'], [-25, 18, '--cb-steel-2']].forEach(function (s) {
        var q = at(g, 20, 20, s[0]);
        q.appendChild(svgEl('path', { d: 'M-3.6 0L-3.6 ' + f(-s[1] * .65) + 'L0 ' + f(-s[1]) + 'L3.6 ' + f(-s[1] * .65) + 'L3.6 0Z' }, { fill: s[2] }));
        q.appendChild(svgEl('path', { d: 'M0 ' + f(-s[1]) + 'L0 0' }, { stroke: '--cb-steel', sw: .8 }));
      });
      at(g, 30, 30).appendChild(svgEl('path', { d: sparkle(3.6) }, { fill: '--cb-amber', cls: 'art-twinkle', t: 4 }));
    }
  };
  F.garland = {
    side: function (g, L) {
      g.appendChild(svgEl('path', { d: wave(L, 9, 2.4, 20) }, { stroke: '--cb-steel-2', sw: 1.4 }));
      for (var x = 12, i = 0; x < L; x += 30, i++) {
        blossom(g, x, 9, 2.9, i % 3 ? '' : 'art-twinkle', i);
        [-60, 60].forEach(function (r) { at(g, x + 15, 9, r).appendChild(svgEl('path', { d: leaf(4.6, 2.6) }, { fill: '--cb-steel-2' })); });
      }
    },
    corner: function (g) {
      [[26, 6, 140], [6, 26, 230]].forEach(function (s) { at(g, s[0], s[1], s[2]).appendChild(svgEl('path', { d: leaf(5.4, 3) }, { fill: '--cb-steel-2' })); });
      blossom(g, 14, 14, 4.6, 'art-twinkle', 0);
    }
  };
  F.starry = {
    side: function (g, L) {
      for (var x = 2, i = 0; x < L; x += 6, i++) {
        g.appendChild(svgEl('circle', { cx: f(x + rnd(i) * 3), cy: f(3 + rnd(i + 99) * 12), r: f(.6 + rnd(i + 7) * .8) }, { fill: i % 3 ? '--cb-steel-2' : '--cb-steel' }));
      }
      for (var sx = 17, j = 0; sx < L; sx += 34, j++) {
        at(g, sx, 9).appendChild(svgEl('path', { d: star5(3.6) }, { fill: '--cb-amber', cls: 'art-twinkle', d: j * .55 % 4, t: 4 }));
      }
    },
    corner: function (g) {
      at(g, 14, 14, -30).appendChild(svgEl('path', { d: crescent(8) }, { fill: '--cb-amber-2' }));
      at(g, 28, 8).appendChild(svgEl('path', { d: star5(3) }, { fill: '--cb-amber', cls: 'art-twinkle', t: 4 }));
    }
  };

  /* GRAVEYARD GATE (2026-10-18), to pair with the Black Leather Lagoon:
     wrought-iron railings with spear tips all the way round, a cobweb in every
     corner, and a spider letting itself down on a thread from each, bobbing
     where the radio's drawings move. In the card's own inks. */
  F.gate = {
    side: function (g, L) {
      g.appendChild(svgEl('path', { d: 'M0 7H' + L + 'M0 15H' + L }, { stroke: '--cb-steel-2', sw: 1.6 }));
      for (var x = 4, i = 0; x < L; x += 8, i++) {
        g.appendChild(svgEl('path', { d: 'M' + x + ' 17V4' }, { stroke: '--cb-steel-2', sw: 1.4 }));
        g.appendChild(svgEl('path', { d: 'M' + (x - 2) + ' 4.6L' + x + ' 0.6L' + (x + 2) + ' 4.6L' + x + ' 3.6Z' }, { fill: i % 3 ? '--cb-steel-2' : '--cb-steel' }));
        if (i % 4 === 2) g.appendChild(svgEl('path', { d: 'M' + (x - 4) + ' 11C' + (x - 4) + ' 8.4 ' + (x - 1.4) + ' 8.4 ' + x + ' 11C' + (x + 1.4) + ' 13.6 ' + (x + 4) + ' 13.6 ' + (x + 4) + ' 11' }, { stroke: '--cb-steel-2', sw: .9 }));
      }
    },
    corner: function (g, which) {
      // the web: threads out from the corner, and its spiral across them
      var web = '', k, j;
      for (k = 0; k <= 4; k++) { var a = k * 22.5 * Math.PI / 180; web += 'M1 1L' + f(1 + 34 * Math.cos(a)) + ' ' + f(1 + 34 * Math.sin(a)); }
      for (j = 1; j <= 4; j++) {
        var rr = j * 7.4;
        for (k = 0; k < 4; k++) {
          var a0 = k * 22.5 * Math.PI / 180, a1 = (k + 1) * 22.5 * Math.PI / 180;
          web += (k ? '' : 'M' + f(1 + rr * Math.cos(a0)) + ' ' + f(1 + rr * Math.sin(a0))) + 'Q' + f(1 + rr * .82 * Math.cos((a0 + a1) / 2)) + ' ' + f(1 + rr * .82 * Math.sin((a0 + a1) / 2)) + ' ' + f(1 + rr * Math.cos(a1)) + ' ' + f(1 + rr * Math.sin(a1));
        }
      }
      g.appendChild(svgEl('path', { d: web }, { stroke: '--cb-steel', sw: .55 }));
      // a spider lets itself down from the top corners; at the foot it would hang upside down
      if (which === 'bl' || which === 'br') return;
      var hang = svgEl('g', {}, { cls: 'fx-bob' });
      hang.style.removeProperty('fill');
      hang.style.setProperty('--b', '4s');
      hang.appendChild(svgEl('path', { d: 'M20 16V27' }, { stroke: '--cb-steel', sw: .5 }));
      hang.appendChild(svgEl('path', { d: 'M17 28L13.6 26M17 29.6L13 30M17.4 31L14 33.6M23 28L26.4 26M23 29.6L27 30M22.6 31L26 33.6' }, { stroke: '--cb-steel-2', sw: .8 }));
      hang.appendChild(svgEl('ellipse', { cx: 20, cy: 30.4, rx: 3.4, ry: 4 }, { fill: '--cb-bar', stroke: '--cb-steel-2', sw: .8 }));
      hang.appendChild(svgEl('circle', { cx: 18.8, cy: 28.4, r: .6 }, { fill: '--cb-amber' }));
      hang.appendChild(svgEl('circle', { cx: 21.2, cy: 28.4, r: .6 }, { fill: '--cb-amber' }));
      g.appendChild(hang);
    }
  };

  /* KELP FRONDS (2026-10-18), to pair with the otter effect: a kelp stalk
     running round the profile with its blades and floats, bubbles along the
     outer edge, and a starfish and a scallop in every corner. In the card's
     own inks. */
  F.fronds = {
    side: function (g, L) {
      g.appendChild(svgEl('path', { d: wave(L, 10, 2.4, 18) }, { stroke: '--cb-steel-2', sw: 1.5 }));
      for (var x = 6, i = 0; x < L; x += 11, i++) {
        var y = 10 + 2.4 * Math.sin(x / 18), dir = i % 2 ? 1 : -1;
        var bl = at(g, x, y, dir > 0 ? 35 : 145);
        bl.appendChild(svgEl('path', { d: leaf(5, 2.4) }, { fill: '--cb-amber-2', cls: i % 4 ? '' : 'art-sway', d: i * .3 % 5, t: 6 }));
        if (i % 3 === 0) g.appendChild(svgEl('circle', { cx: f(x + 1.6), cy: f(y + dir * 1.4), r: 1.5 }, { fill: '--cb-amber' }));
        if (i % 5 === 2) g.appendChild(svgEl('circle', { cx: f(x + 3), cy: 2.6, r: 1.3 }, { stroke: '--cb-steel', sw: .6, cls: 'art-twinkle', d: i * .5 % 4, t: 4 }));
      }
    },
    corner: function (g) {
      at(g, 13, 13, 12).appendChild(svgEl('path', { d: star5(8) }, { fill: '--cb-amber', stroke: '--cb-case', sw: .8 }));
      var sh = at(g, 27, 27, -45);
      sh.appendChild(svgEl('path', { d: 'M-6 3Q0 -9 6 3Z' }, { fill: '--cb-amber-2', stroke: '--cb-case', sw: .8 }));
      sh.appendChild(svgEl('path', { d: 'M0 3L0 -3.4M-2.8 3L-1.6 -2.2M2.8 3L1.6 -2.2' }, { stroke: '--cb-case', sw: .6 }));
    }
  };

  /* PORTHOLES (2026-10-23), to pair with the Cloud City effect: the curved
     white wall of a city in the clouds, round windows all the way round with a
     striped sun going down in each over a line of cloud, fluting between them,
     and a sunburst round a bigger window in every corner. Each window's view is
     turned back upright on whichever side it is on, as Shadow of Mordor's
     medallions are on the radio's sides. In the card's own inks. */
  var HOLE_SUN = ['--cb-amber', '--cb-amber', '--cb-amber-2'];
  var UPRIGHT = { bottom: '1 0 0 -1', left: '0 1 1 0', right: '0 -1 1 0', bl: '1 0 0 -1', br: '1 0 0 -1' };
  function porthole(g, x, y, R, i, side) {
    g.appendChild(svgEl('circle', { cx: f(x), cy: f(y), r: f(R) }, { fill: '--cb-case', stroke: '--cb-steel', sw: f(R * .2) }));
    var turn = UPRIGHT[side];
    var view = turn ? group(g, 'translate(' + f(x) + ' ' + f(y) + ') matrix(' + turn.split(' ').join(',') + ',0,0) translate(' + f(-x) + ' ' + f(-y) + ')') : g;
    var sun = svgEl('g', {}, { cls: 'art-glow', d: (i || 0) * .55 % 5, t: 6 });
    sun.style.removeProperty('fill');
    var sr = R * .52, sy = y + R * .14;
    [[0, .62], [.74, 1], [1.12, 1.3]].forEach(function (b, j) {
      sun.appendChild(svgEl('path', { d: slice(x, sy, sr, sy - sr + b[0] * sr, sy - sr + b[1] * sr) }, { fill: HOLE_SUN[j] }));
    });
    view.appendChild(sun);
    var cy = y + R * .5, q = R * .2;
    view.appendChild(svgEl('path', { d: 'M' + f(x - R * .72) + ' ' + f(cy) + 'q' + f(q) + ' ' + f(-q * 1.3) + ' ' + f(q * 2) + ' 0q' + f(q) + ' ' + f(-q * 1.6) + ' ' + f(q * 2) + ' 0q' + f(q) + ' ' + f(-q * 1.3) + ' ' + f(q * 2) + ' 0' }, { stroke: '--cb-steel-2', sw: f(R * .14) }));
  }
  F.portholes = {
    side: function (g, L, side) {
      g.appendChild(svgEl('rect', { x: 0, y: 1, width: L, height: 16, rx: 3 }, { fill: '--cb-bar', stroke: '--cb-steel-2', sw: 1 }));
      for (var x = 16, i = 0; x < L; x += 32, i++) {
        g.appendChild(svgEl('path', { d: 'M' + (x - 16) + ' 4V14M' + (x - 13.4) + ' 5.4V12.6M' + (x + 13.4) + ' 5.4V12.6' }, { stroke: '--cb-steel-2', sw: .8 }));
        porthole(g, x, 9, 5.4, i, side);
      }
    },
    corner: function (g, which) {
      // a sunburst fanning out from the corner round a bigger window
      var rays = '', a, t;
      for (a = 6; a <= 84; a += 13) {
        t = a * Math.PI / 180;
        rays += 'M' + f(3 + 14 * Math.cos(t)) + ' ' + f(3 + 14 * Math.sin(t)) + 'L' + f(3 + 26 * Math.cos(t)) + ' ' + f(3 + 26 * Math.sin(t));
      }
      g.appendChild(svgEl('path', { d: rays }, { stroke: '--cb-amber-2', sw: 1.1 }));
      g.appendChild(svgEl('path', { d: 'M3 30A27 27 0 0 0 30 3' }, { stroke: '--cb-amber', sw: 1.3 }));
      porthole(g, 13, 13, 9, 0, which);
    }
  };

  function stripLength() {
    var s = window.screen || {};
    return Math.max(1400, (s.width || 0) + 200, (s.height || 0) + 200);
  }
  function frame(key) {
    var fr = F[key];
    if (!fr) return null;
    var box = el('div', 'pf-frame');
    box.setAttribute('aria-hidden', 'true');
    var L = stripLength(), up = ' scale(' + f(SCALE) + ')';
    [['top', L, BAND, '1 0 0 1 0 0'], ['bottom', L, BAND, '1 0 0 -1 0 ' + BAND],
      ['left', BAND, L, '0 1 1 0 0 0'], ['right', BAND, L, '0 1 -1 0 ' + BAND + ' 0']].forEach(function (sd) {
      var side = el('div', 'pf-frame__side pf-frame__' + sd[0]);
      var s = plainSvg(sd[1], sd[2]);
      fr.side(group(s, 'matrix(' + sd[3].split(' ').join(',') + ')' + up), L / SCALE, sd[0]);
      side.appendChild(s);
      box.appendChild(side);
    });
    [['tl', '1 0 0 1 0 0'], ['tr', '-1 0 0 1 ' + K + ' 0'], ['bl', '1 0 0 -1 0 ' + K], ['br', '-1 0 0 -1 ' + K + ' ' + K]].forEach(function (cn) {
      var s = plainSvg(K, K, 'pf-frame__corner pf-frame__' + cn[0]);
      var g = group(s, 'matrix(' + cn[1].split(' ').join(',') + ')' + up);
      g.appendChild(svgEl('path', { d: 'M0 0H36V18H18V36H0Z' }, { fill: '--cb-case' }));
      fr.corner(g, cn[0]);
      box.appendChild(s);
    });
    return box;
  }
  function frameName(key) {
    for (var i = 0; i < FRAMES.length; i++) if (FRAMES[i][0] === key) return FRAMES[i][1];
    return '';
  }

  /* ── The effects ───────────────────────────────────────────────────────

     Every effect is in two parts. ITS STILL PART sits along the profile's
     edges and in its banner, where no sentence is, and is there at every
     setting; its drawings twinkle and sway only where the radio's do. ITS PASS
     crosses the whole profile from time to time, a few at once and then
     quiet, over the words as well, Ryan's call: and it is drawn at all only
     where the radio's drawings move (cb.css shows .pf-fx__pass under
     data-motion and nowhere else), so a profile that stands still never has
     anything sitting on a word. A pass fades in and out over about a second
     and nothing in it flashes. Its distances are in the pass's own container
     units, so a profile that grows or shrinks draws nothing again. */
  var M = {};
  M.butterfly = function (g, moving) {
    var w = svgEl('g', {}, { cls: moving ? 'fx-flap' : 'art-breathe', t: 3.5 });
    w.style.removeProperty('fill');
    w.appendChild(svgEl('ellipse', { cx: -4.6, cy: -2.6, rx: 4.8, ry: 3.8 }, { fill: '--cb-amber' }));
    w.appendChild(svgEl('ellipse', { cx: 4.6, cy: -2.6, rx: 4.8, ry: 3.8 }, { fill: '--cb-amber' }));
    w.appendChild(svgEl('ellipse', { cx: -3.6, cy: 3.2, rx: 3.2, ry: 2.8 }, { fill: '--cb-amber-2' }));
    w.appendChild(svgEl('ellipse', { cx: 3.6, cy: 3.2, rx: 3.2, ry: 2.8 }, { fill: '--cb-amber-2' }));
    g.appendChild(w);
    g.appendChild(svgEl('path', { d: 'M0 -6.5L0 6M0 -6.5L-2.4 -9.6M0 -6.5L2.4 -9.6' }, { stroke: '--cb-steel', sw: 1.4 }));
  };
  M.glow = function (g) {
    g.appendChild(svgEl('circle', { r: 7, 'fill-opacity': '.22' }, { fill: '--cb-amber' }));
    g.appendChild(svgEl('circle', { r: 2.6 }, { fill: '--cb-amber-2', cls: 'art-glow', t: 3 }));
  };
  M.petal = function (g) {
    var q = at(g, 0, 0, 35);
    q.appendChild(svgEl('path', { d: leaf(8, 4.6) }, { fill: '--cb-amber-2', cls: 'art-sway', t: 4 }));
    q.appendChild(svgEl('path', { d: leaf(4, 2) }, { fill: '--cb-amber' }));
  };
  M.blossom = function (g) { blossom(g, 0, 0, 3.6, 'art-twinkle', 0); };
  M.leaf = function (g) {
    var l = svgEl('g', {}, { cls: 'art-sway', t: 5 });
    l.style.removeProperty('fill');
    l.appendChild(svgEl('path', { d: leaf(9, 5.6) }, { fill: '--cb-amber' }));
    l.appendChild(svgEl('path', { d: 'M0 -8L0 9' }, { stroke: '--cb-case', sw: 1 }));
    g.appendChild(l);
  };
  M.flake = function (g) {
    var r = 8, d = '';
    around(6, function (b) {
      var x = r * Math.sin(b * Math.PI / 180), y = -r * Math.cos(b * Math.PI / 180);
      d += 'M0 0L' + f(x) + ' ' + f(y);
      var bx = x * .6, by = y * .6, k = (b + 90) * Math.PI / 180, s = r * .3;
      d += 'M' + f(bx - s * Math.sin(k) * .7) + ' ' + f(by + s * Math.cos(k) * .7) + 'L' + f(bx) + ' ' + f(by) + 'L' + f(bx + s * Math.sin(k) * .7) + ' ' + f(by - s * Math.cos(k) * .7);
    });
    g.appendChild(svgEl('path', { d: d }, { stroke: '--cb-steel', sw: 1.4, cls: 'art-twinkle', t: 5 }));
  };
  M.bubble = function (g) {
    g.appendChild(svgEl('circle', { r: 8 }, { stroke: '--cb-steel', sw: 1.4 }));
    g.appendChild(svgEl('path', { d: 'M-4.4 -.8A4.8 4.8 0 0 1 -.8 -4.4' }, { stroke: '--cb-amber', sw: 1.4, cls: 'art-twinkle', t: 5 }));
  };
  M.sparkle = function (g) {
    g.appendChild(svgEl('path', { d: sparkle(9) }, { fill: '--cb-amber', cls: 'art-twinkle', t: 3.5 }));
    at(g, 7, -7).appendChild(svgEl('path', { d: sparkle(3.4) }, { fill: '--cb-steel', cls: 'art-twinkle', d: 1.2, t: 3.5 }));
  };
  M.star = function (g) { g.appendChild(svgEl('path', { d: star5(8) }, { fill: '--cb-amber-2', cls: 'art-twinkle', t: 4 })); };
  M.shooting = function (g) {
    g.appendChild(svgEl('path', { d: 'M-2 -1L-26 -12' }, { stroke: '--cb-amber-2', sw: 1.6 }));
    g.appendChild(svgEl('path', { d: 'M-2 1L-18 -4' }, { stroke: '--cb-steel-2', sw: 1.2 }));
    g.appendChild(svgEl('path', { d: star5(5.4) }, { fill: '--cb-amber' }));
  };
  M.note = function (g) {
    g.appendChild(svgEl('ellipse', { cx: -2.6, cy: 5.6, rx: 4, ry: 3, transform: 'rotate(-20 -2.6 5.6)' }, { fill: '--cb-amber' }));
    g.appendChild(svgEl('path', { d: 'M1.2 4.6L1.2 -9Q6.6 -6 6.6 -1.6' }, { stroke: '--cb-amber', sw: 2 }));
  };
  M.heart = function (g) {
    g.appendChild(svgEl('path', { d: heart(8) }, { fill: '--cb-amber-2', cls: 'art-breathe', t: 4 }));
    g.appendChild(svgEl('path', { d: heart(3.6) }, { fill: '--cb-amber' }));
  };
  function motif(name, size, moving, turn) {
    var s = document.createElementNS(NS, 'svg'), px = f(size * 1.5);
    s.setAttribute('viewBox', '-12 -12 24 24');
    s.setAttribute('width', px);
    s.setAttribute('height', px);
    s.setAttribute('aria-hidden', 'true');
    s.setAttribute('focusable', 'false');
    s.style.overflow = 'visible';
    M[name](group(s, turn ? 'rotate(' + turn + ')' : ''), !!moving);
    return s;
  }

  /* An effect: edge, its still part as [motif, where, along, size, turn],
     where being a corner (tl, tr, bl, br) or a side (top, bottom, left,
     right) and along how far along that side; pass, as { motif, from, n,
     size, t, drift }, from being the side it comes in at (or diag, from the
     top left), n how many cross in one go, t seconds from one go to the next. */
  var E = {};
  E.butterflies = { edge: [['blossom', 'tl', 0, 30], ['butterfly', 'top', .2, 20, -15], ['butterfly', 'left', .55, 18, 20], ['blossom', 'bl', 0, 24], ['butterfly', 'br', 0, 20, -30], ['blossom', 'right', .7, 18]],
    pass: { motif: 'butterfly', from: 'left', n: 4, size: 22, t: 28, drift: 14 } };
  E.fireflies = { edge: [['glow', 'top', .12, 16], ['glow', 'top', .3, 12], ['glow', 'left', .4, 14], ['glow', 'left', .8, 12], ['glow', 'bottom', .25, 14], ['glow', 'bottom', .6, 12], ['glow', 'right', .55, 14]],
    pass: { motif: 'glow', from: 'bottom', n: 9, size: 16, t: 24, drift: 12 } };
  E.petals = { edge: [['blossom', 'tl', 0, 28], ['petal', 'top', .18, 14, 40], ['blossom', 'bl', 0, 24], ['petal', 'left', .5, 14, -20], ['blossom', 'br', 0, 24], ['petal', 'bottom', .45, 12, 70]],
    pass: { motif: 'petal', from: 'top', n: 8, size: 16, t: 26, drift: 14 } };
  E.leaves = { edge: [['leaf', 'tl', 0, 24, -30], ['leaf', 'top', .25, 16, 60], ['leaf', 'left', .6, 16, 10], ['leaf', 'bl', 0, 22, 120], ['leaf', 'br', 0, 22, 200]],
    pass: { motif: 'leaf', from: 'top', n: 7, size: 18, t: 26, drift: 16 } };
  E.snow = { edge: [['flake', 'tl', 0, 22], ['flake', 'top', .2, 12], ['flake', 'top', .33, 10], ['flake', 'left', .5, 12], ['flake', 'bottom', .3, 12], ['flake', 'br', 0, 18]],
    pass: { motif: 'flake', from: 'top', n: 12, size: 13, t: 22, drift: 8 } };
  E.bubbles = { edge: [['bubble', 'bl', 0, 24], ['bubble', 'bottom', .2, 14], ['bubble', 'bottom', .5, 10], ['bubble', 'left', .75, 12], ['bubble', 'br', 0, 20], ['bubble', 'right', .8, 12]],
    pass: { motif: 'bubble', from: 'bottom', n: 8, size: 18, t: 24, drift: 10 } };
  E.sparkles = { edge: [['sparkle', 'tl', 0, 22], ['sparkle', 'top', .15, 12], ['sparkle', 'top', .3, 16], ['sparkle', 'left', .45, 14], ['sparkle', 'bl', 0, 18], ['sparkle', 'bottom', .55, 12], ['sparkle', 'br', 0, 20]],
    pass: { motif: 'sparkle', from: 'diag', n: 6, size: 16, t: 24, drift: 0 } };
  E.shooting = { edge: [['star', 'tl', 0, 20], ['star', 'top', .2, 12], ['star', 'top', .34, 9], ['star', 'left', .35, 10], ['star', 'bottom', .4, 10], ['star', 'br', 0, 14]],
    pass: { motif: 'shooting', from: 'diag', n: 2, size: 26, t: 30, drift: 0 } };
  E.notes = { edge: [['note', 'tl', 0, 22], ['note', 'left', .4, 16, -10], ['note', 'bl', 0, 20, 10], ['note', 'bottom', .5, 14], ['note', 'br', 0, 20, -10]],
    pass: { motif: 'note', from: 'left', n: 5, size: 18, t: 26, drift: 12 } };
  E.hearts = { edge: [['heart', 'tl', 0, 22, -15], ['heart', 'top', .24, 12, 10], ['heart', 'left', .6, 14], ['heart', 'bl', 0, 20, 15], ['heart', 'br', 0, 20, -15], ['heart', 'bottom', .4, 12]],
    pass: { motif: 'heart', from: 'bottom', n: 7, size: 16, t: 26, drift: 12 } };

  /* effect:lagoon:begin */
  /* THE BLACK LEATHER LAGOON, after the street's room and The Cramps (Ryan,
     2026-10-18, from a Discord effect he admired: "Their world, not them").
     NOBODY REAL IS DRAWN: no band member, no photograph, no logo, no album
     art and no lyric; the poison ivy round the edge is a nod to Poison Ivy's
     name, and the creature is a sea serpent of our own, nothing of anybody's
     film monster. It is drawn in the Lagoon's own declared inks, which is the
     one effect not in its card's theme, and make-profile.py holds this block
     to them. AS IN THE ROOM, THE SCREEN IS THE ONLY LIGHT: everything has its
     face turned to it and goes dark behind, and NOTHING FLICKERS, the room's
     rule, so the screen's glow breathes over nine seconds and never jumps.

     It is the street's most detailed effect: a scene over the card's banner
     (sky, the screen with a giant B-movie eye on it, its glow and its legs,
     black water with the screen's reflection rippling in it, reeds, and the
     serpent's coils rising and sinking), poison ivy creeping down both sides,
     leopard print along the foot, a finned hot rod parked in the corner, and
     a pass of bats from the screen's side across the whole profile. The scene
     sits in 380 by 112, the card's banner, and keeps off the avatar's corner. */
  function lag(tag, at, o) { return svgEl(tag, at, o); }
  /* The scene's own gradient and blur, each with an id of its own so that two
     profiles on one page never share one. A stop's ink is named like a fill,
     so make-profile.py reads it with the rest. */
  var lagN = 0;
  function lagDefs(s) { var d = document.createElementNS(NS, 'defs'); s.appendChild(d); return d; }
  function lagStop(grad, offset, opacity, o) {
    var st = document.createElementNS(NS, 'stop');
    st.setAttribute('offset', String(offset));
    st.style.setProperty('stop-color', 'var(' + o.stop + ')');
    st.style.setProperty('stop-opacity', String(opacity));
    grad.appendChild(st);
  }
  M.bat = function (g, moving) {
    var w = svgEl('g', {}, { cls: moving ? 'fx-batflap' : 'art-breathe', t: 3 });
    w.style.removeProperty('fill');
    w.appendChild(lag('path', { d: 'M0 -1C-3 -4 -6 -5 -11 -3C-9 -1 -9 1 -10 3C-8 2 -7 3 -6 5C-5 3 -3 3 -2 4C-1 2 -1 1 0 1Z' }, { fill: '--lag-card', stroke: '--lag-dim', sw: .7 }));
    w.appendChild(lag('path', { d: 'M0 -1C3 -4 6 -5 11 -3C9 -1 9 1 10 3C8 2 7 3 6 5C5 3 3 3 2 4C1 2 1 1 0 1Z' }, { fill: '--lag-card', stroke: '--lag-dim', sw: .7 }));
    g.appendChild(w);
    g.appendChild(lag('path', { d: 'M-1.6 -3L-1.2 -5.2L-.4 -3.6H.4L1.2 -5.2L1.6 -3C1.8 0 1.2 3 0 4C-1.2 3 -1.8 0 -1.6 -3Z' }, { fill: '--lag-card', stroke: '--lag-dim', sw: .6 }));
    g.appendChild(lag('circle', { cx: -.6, cy: -2.4, r: .45 }, { fill: '--lag-poster' }));
    g.appendChild(lag('circle', { cx: .6, cy: -2.4, r: .45 }, { fill: '--lag-poster' }));
  };
  /* A finned hot rod parked at the drive-in, side on and facing the screen,
     with leopard print on the seat. Lit along its front, dark behind. */
  M.hotrod = function (g) {
    var car = svgEl('g', { transform: 'scale(.92)' });
    car.style.removeProperty('fill');
    car.appendChild(lag('path', { d: 'M-12 2.4L-11 -.2Q-10 -1.4 -7 -1.6L-4 -1.8L-2 -4.2Q-1 -5 0 -5L3 -5Q4 -5 4.6 -4L6 -2L8.6 -2.4L11 -6.6L11.8 -6.4L11.8 1.6Q11.6 3 10 3L-11 3.4Q-12.2 3.4 -12 2.4Z' }, { fill: '--lag-card', stroke: '--lag-screen', sw: .55 }));
    car.appendChild(lag('path', { d: 'M-11.2 1.2H11.4' }, { stroke: '--lag-blood', sw: .7 }));
    car.appendChild(lag('path', { d: 'M-1.6 -3.6Q-.8 -4.3 0 -4.3L2.6 -4.3L3.8 -2.4L-2.6 -2.2Z' }, { fill: '--lag-dim' }));
    [[-.6, -3.2], [1, -2.8], [2.6, -3.4], [.2, -2.4]].forEach(function (s) { car.appendChild(lag('circle', { cx: s[0], cy: s[1], r: .32 }, { fill: '--lag-water' })); });
    car.appendChild(lag('path', { d: 'M-4.2 -1.9L-2.4 -4.6' }, { stroke: '--lag-screen', sw: .5 }));
    car.appendChild(lag('path', { d: 'M10.6 -5.6L11.6 -5.8V-3.8L10.8 -3.6Z' }, { fill: '--lag-poster' }));
    car.appendChild(lag('path', { d: 'M11.8 2.2H13.4' }, { stroke: '--lag-dim', sw: .8 }));
    [[-7.4, 3.4, 2.5], [7.2, 3.3, 2.9]].forEach(function (w) {
      car.appendChild(lag('circle', { cx: w[0], cy: w[1], r: w[2] }, { fill: '--lag-water', stroke: '--lag-dim', sw: .5 }));
      car.appendChild(lag('circle', { cx: w[0], cy: w[1], r: w[2] * .42 }, { fill: '--lag-dim' }));
    });
    car.appendChild(lag('path', { d: 'M-12.2 1.6H-13.4' }, { stroke: '--lag-screen', sw: .7 }));
    g.appendChild(car);
  };

  function lagSvg(w, h, cls) {
    var s = plainSvg(w, h, cls);
    s.setAttribute('preserveAspectRatio', 'xMinYMin meet');
    return s;
  }
  /* The scene over the banner. */
  function lagoonScene() {
    var s = lagSvg(380, 112, 'pf-fx__scene');
    s.removeAttribute('width');
    s.removeAttribute('height');
    var n = ++lagN, defs = lagDefs(s);
    var sky = document.createElementNS(NS, 'linearGradient');
    sky.setAttribute('id', 'pf-lag-sky-' + n);
    sky.setAttribute('x1', '0'); sky.setAttribute('x2', '1'); sky.setAttribute('y1', '0'); sky.setAttribute('y2', '0');
    lagStop(sky, 0, 0, { stop: '--lag-water' });
    lagStop(sky, .22, .86, { stop: '--lag-water' });
    lagStop(sky, 1, .86, { stop: '--lag-water' });
    defs.appendChild(sky);
    var blur = document.createElementNS(NS, 'filter');
    blur.setAttribute('id', 'pf-lag-blur-' + n);
    blur.setAttribute('x', '-40%'); blur.setAttribute('y', '-40%'); blur.setAttribute('width', '180%'); blur.setAttribute('height', '180%');
    var gb = document.createElementNS(NS, 'feGaussianBlur');
    gb.setAttribute('stdDeviation', '7');
    blur.appendChild(gb);
    defs.appendChild(blur);
    var g = group(s);
    // the night over the banner's right-hand part, fading in from the left so it
    // is not a box laid on somebody's banner, and leaving the avatar's corner be
    var night = lag('rect', { x: 130, y: 0, width: 250, height: 112 }, {});
    night.style.setProperty('fill', 'url(#pf-lag-sky-' + n + ')');
    g.appendChild(night);
    for (var i = 0; i < 16; i++) {
      var sx = 156 + rnd(i + 40) * 220, sy = 3 + rnd(i + 70) * 46;
      if (sx > 226 && sx < 362 && sy < 62) continue;
      g.appendChild(lag('circle', { cx: f(sx), cy: f(sy), r: f(.5 + rnd(i + 9) * .7) }, { fill: '--lag-dim', cls: i % 3 ? '' : 'art-twinkle', d: i * .5 % 4, t: 5 }));
    }
    // the screen's glow, breathing slowly, never jumping
    var glow = svgEl('g', {}, { cls: 'fx-breathe', t: 9 });
    glow.style.removeProperty('fill');
    glow.style.setProperty('filter', 'url(#pf-lag-blur-' + n + ')');
    glow.appendChild(lag('rect', { x: 226, y: 0, width: 136, height: 64, rx: 8, 'fill-opacity': '.34' }, { fill: '--lag-acid' }));
    glow.appendChild(lag('rect', { x: 240, y: 84, width: 108, height: 14, rx: 7, 'fill-opacity': '.18' }, { fill: '--lag-acid' }));
    g.appendChild(glow);
    // the legs into the water
    g.appendChild(lag('rect', { x: 250, y: 52, width: 4, height: 32, 'fill-opacity': '.62' }, { fill: '--lag-screen' }));
    g.appendChild(lag('rect', { x: 334, y: 52, width: 4, height: 32, 'fill-opacity': '.62' }, { fill: '--lag-screen' }));
    // the screen, and on it a giant eye, bloodshot, looking about
    g.appendChild(lag('rect', { x: 236, y: 8, width: 116, height: 46, rx: 1.5 }, { fill: '--lag-screen', stroke: '--lag-dim', sw: 1 }));
    g.appendChild(lag('path', { d: 'M262 31Q294 9 326 31Q294 53 262 31Z' }, { fill: '--lag-screen', stroke: '--lag-card', sw: 1.4 }));
    g.appendChild(lag('path', { d: 'M264 30Q272 27 276 29M266 34Q273 35 278 33M324 30Q316 27 312 29M322 33Q315 35 310 33' }, { stroke: '--lag-poster', sw: .6 }));
    var look = svgEl('g', {}, { cls: 'fx-look', t: 11 });
    look.style.removeProperty('fill');
    look.appendChild(lag('circle', { cx: 294, cy: 31, r: 9.5 }, { fill: '--lag-acid', stroke: '--lag-card', sw: 1.2 }));
    look.appendChild(lag('path', { d: 'M286.5 31Q294 25 301.5 31M287 33Q294 37 301 33' }, { stroke: '--lag-card', sw: .5 }));
    look.appendChild(lag('circle', { cx: 294, cy: 31, r: 4.4 }, { fill: '--lag-water' }));
    look.appendChild(lag('circle', { cx: 296.4, cy: 28.6, r: 1.5 }, { fill: '--lag-screen' }));
    g.appendChild(look);
    g.appendChild(lag('path', { d: 'M270 22L268 18M280 17L279 13M294 15V11M308 17L309 13M318 22L320 18' }, { stroke: '--lag-card', sw: 1.1 }));
    // reeds at the water's edge, their tips catching the screen
    [[152, 64], [157, 70], [162, 60], [342, 66], [347, 58], [377, 64]].forEach(function (r, j) {
      var reed = svgEl('g', {}, { cls: 'art-sway', d: j * .6, t: 6 });
      reed.style.removeProperty('fill');
      reed.appendChild(lag('path', { d: 'M' + r[0] + ' 84Q' + (r[0] + 1.5) + ' ' + (r[1] + 10) + ' ' + (r[0] + .5) + ' ' + r[1] }, { stroke: '--lag-card', sw: 1.6 }));
      reed.appendChild(lag('rect', { x: f(r[0] - .9), y: r[1] - 6, width: 2.8, height: 7, rx: 1.4 }, { fill: '--lag-blood' }));
      reed.appendChild(lag('path', { d: 'M' + f(r[0] + 1.6) + ' ' + (r[1] - 5) + 'V' + (r[1] + 1) }, { stroke: '--lag-dim', sw: .5 }));
      g.appendChild(reed);
    });
    // THE SERPENT, our own: three coils and a round snout, eyes on stalks,
    // pondweed on its head. Lit on the side towards the screen.
    function coil(x0, x1, h, j) {
      var c = svgEl('g', {}, { cls: 'fx-rise', d: j * 1.3, t: 7 });
      c.style.removeProperty('fill');
      var m = (x0 + x1) / 2, top = 82 - h;
      // a hump of the body, its foot under the water
      c.appendChild(lag('path', { d: 'M' + x0 + ' 94Q' + x0 + ' ' + top + ' ' + m + ' ' + top + 'Q' + x1 + ' ' + top + ' ' + x1 + ' 94Z' }, { fill: '--lag-acid', stroke: '--lag-card', sw: .8 }));
      // dark on the side away from the screen, a rim of its light on the side towards it
      c.appendChild(lag('path', { d: 'M' + (x0 + 2) + ' 90Q' + (x0 + 2.4) + ' ' + (top + 3) + ' ' + (m - 2) + ' ' + (top + 1.6) }, { stroke: '--lag-card', sw: 3.2, cls: '' }));
      c.appendChild(lag('path', { d: 'M' + (m + 2) + ' ' + (top + .8) + 'Q' + (x1 - 1.2) + ' ' + (top + 1.2) + ' ' + (x1 - 1) + ' 88' }, { stroke: '--lag-screen', sw: .8 }));
      // scales, as small arcs along the back
      for (var k = 0; k < 4; k++) {
        var sx = x0 + 4 + (x1 - x0 - 8) * k / 3, sy = top + 4 + Math.abs(k - 1.5) * 1.6;
        c.appendChild(lag('path', { d: 'M' + f(sx - 1.4) + ' ' + f(sy) + 'q1.4 -1.4 2.8 0' }, { stroke: '--lag-card', sw: .6 }));
      }
      g.appendChild(c);
      g.appendChild(lag('ellipse', { cx: f(m), cy: 81, rx: f((x1 - x0) / 2 + 3), ry: 2.2 }, { stroke: '--lag-dim', sw: .7, cls: 'fx-ring', d: j * 1.3, t: 7 }));
    }
    coil(170, 186, 9, 0);
    coil(190, 208, 13, 1);
    var head = svgEl('g', {}, { cls: 'fx-rise', d: 2.6, t: 7 });
    head.style.removeProperty('fill');
    head.appendChild(lag('path', { d: 'M212 92Q210 66 220 52L228 54Q222 70 224 92Z' }, { fill: '--lag-acid', stroke: '--lag-card', sw: .8 }));
    head.appendChild(lag('path', { d: 'M213.5 90Q212.4 70 220.6 56' }, { stroke: '--lag-card', sw: 2.6 }));
    head.appendChild(lag('path', { d: 'M226.4 56Q221.8 70 223.4 88' }, { stroke: '--lag-screen', sw: .8 }));
    head.appendChild(lag('path', { d: 'M215 52Q216 42 226 41Q238 41 243 47Q245 52 240 55Q232 58 222 57Q215 57 215 52Z' }, { fill: '--lag-acid', stroke: '--lag-card', sw: .9 }));
    head.appendChild(lag('path', { d: 'M226 53Q234 55 242 52' }, { stroke: '--lag-card', sw: .9 }));
    head.appendChild(lag('path', { d: 'M232 54.2L233 57.4L234.2 54.4M237.6 53.6L238.4 56.4L239.4 53.4' }, { fill: '--lag-screen', stroke: '--lag-screen', sw: .4 }));
    head.appendChild(lag('circle', { cx: 241, cy: 47.5, r: .8 }, { fill: '--lag-card' }));
    head.appendChild(lag('path', { d: 'M216 52Q217 45 222 44' }, { stroke: '--lag-card', sw: 2.4 }));
    [[224, 41, 221, 33], [230, 41, 231, 32]].forEach(function (st) {
      head.appendChild(lag('path', { d: 'M' + st[0] + ' ' + st[1] + 'Q' + (st[0] - 1) + ' ' + (st[3] + 4) + ' ' + st[2] + ' ' + st[3] }, { stroke: '--lag-acid', sw: 1.6 }));
      head.appendChild(lag('circle', { cx: st[2], cy: st[3], r: 3.2 }, { fill: '--lag-screen', stroke: '--lag-card', sw: .7 }));
      head.appendChild(lag('circle', { cx: st[2] + 1.1, cy: st[3] + .2, r: 1.4 }, { fill: '--lag-water' }));
    });
    var weed = svgEl('g', {}, { cls: 'art-sway', t: 5 });
    weed.style.removeProperty('fill');
    weed.appendChild(lag('path', { d: 'M219 44Q214.6 49 216.4 56M222 42.6Q219.6 48 220.4 53' }, { stroke: '--lag-dim', sw: .8 }));
    [[215.4, 50, -30], [216.6, 55.4, 20], [219.8, 48.6, -20]].forEach(function (w) {
      at(weed, w[0], w[1], w[2]).appendChild(lag('path', { d: leaf(1.8, 1) }, { fill: '--lag-dim' }));
    });
    head.appendChild(weed);
    head.appendChild(lag('path', { d: 'M230 41.6Q239 42 242.6 46.6' }, { stroke: '--lag-screen', sw: .7 }));
    var drip = lag('ellipse', { cx: 236, cy: 58.5, rx: .7, ry: 1.1, 'fill-opacity': '.7' }, { fill: '--lag-screen', cls: 'art-fall', t: 3, run: 20 });
    head.appendChild(drip);
    g.appendChild(head);
    g.appendChild(lag('ellipse', { cx: 218, cy: 81, rx: 10, ry: 2.4 }, { stroke: '--lag-dim', sw: .7, cls: 'fx-ring', d: 2.6, t: 7 }));
    // the black water, in front of everything below the line
    var water = lag('rect', { x: 130, y: 80, width: 250, height: 32 }, {});
    water.style.setProperty('fill', 'url(#pf-lag-sky-' + n + ')');
    g.appendChild(water);
    g.appendChild(lag('rect', { x: 186, y: 80, width: 194, height: 32 }, { fill: '--lag-water' }));
    g.appendChild(lag('path', { d: 'M168 80H380' }, { stroke: '--lag-card', sw: 1 }));
    // a lobby card on a post out in the shallows, its top edge lit by the screen
    g.appendChild(lag('rect', { x: 364, y: 70, width: 3, height: 18, 'fill-opacity': '.7' }, { fill: '--lag-blood' }));
    g.appendChild(lag('rect', { x: 355, y: 54, width: 21, height: 16, rx: .8 }, { fill: '--lag-card' }));
    g.appendChild(lag('rect', { x: 355, y: 54, width: 21, height: 1.6 }, { fill: '--lag-screen' }));
    g.appendChild(lag('rect', { x: 358, y: 58, width: 8, height: 9 }, { fill: '--lag-poster' }));
    g.appendChild(lag('path', { d: 'M368 59.5H373.5M368 62.5H373.5M368 65.5H372' }, { stroke: '--lag-dim', sw: .8 }));
    // the screen in the water, rippling
    [[84, .26, 112], [89, .18, 104], [94, .12, 96], [99, .08, 88], [104, .05, 80]].forEach(function (r, j) {
      var w = r[2];
      g.appendChild(lag('rect', { x: f(294 - w / 2), y: r[0], width: w, height: 2.4, rx: 1.2, 'fill-opacity': String(r[1]) }, { fill: '--lag-screen', cls: 'fx-ripple', d: j * .9, t: 6 }));
    });
    [[166, 96], [184, 104], [204, 92], [214, 108], [356, 94], [366, 104]].forEach(function (r, j) {
      g.appendChild(lag('path', { d: 'M' + r[0] + ' ' + r[1] + 'h7' }, { stroke: '--lag-card', sw: 1, cls: 'fx-ripple', d: j * .7, t: 6 }));
    });
    // two bats near the screen, against its glow
    [[176, 16, 13, -8], [202, 30, 10, 6], [214, 10, 8, -4]].forEach(function (b, j) {
      var q = at(g, b[0], b[1], b[3]);
      var bob = svgEl('g', {}, { cls: 'fx-bob' });
      bob.style.removeProperty('fill');
      bob.style.setProperty('--b', (3 + j * .7) + 's');
      var sc = svgEl('g', { transform: 'scale(' + f(b[2] / 22) + ')' });
      sc.style.removeProperty('fill');
      M.bat(sc, true);
      bob.appendChild(sc);
      q.appendChild(bob);
    });
    return s;
  }
  /* Poison ivy down a side: leaves of three, green and turning red, on a
     red stem, drawn once longer than a profile can be and growing in. */
  function lagoonVine(right) {
    var L = stripLength(), box = el('div', 'pf-fx__vine pf-fx__vine--' + (right ? 'r' : 'l'));
    var s = plainSvg(18, L);
    var g = group(s, right ? 'matrix(-1,0,0,1,18,0)' : '');
    var d = '', y, i;
    for (y = 0; y <= L; y += 6) d += (y ? 'L' : 'M') + f(6 + 2.6 * Math.sin(y / 34 + (right ? 1.4 : 0))) + ' ' + y;
    g.appendChild(lag('path', { d: d, pathLength: 1 }, { stroke: '--lag-blood', sw: 1.4, cls: 'art-grow', t: 14 }));
    for (y = 22, i = 0; y < L; y += 38, i++) {
      var x = 6 + 2.6 * Math.sin(y / 34 + (right ? 1.4 : 0)), red = i % 4 === 3;
      var q = at(g, x, y, i % 2 ? 24 : -24 + 180);
      var three = svgEl('g', {}, { cls: 'art-pop', d: Math.min(13, y / 70), t: 1.4 });
      three.style.removeProperty('fill');
      var sway = svgEl('g', {}, { cls: 'art-sway', d: i * .5 % 5, t: 6 });
      sway.style.removeProperty('fill');
      sway.appendChild(lag('path', { d: 'M0 0L0 -4' }, { stroke: '--lag-blood', sw: .8 }));
      [[0, -4, 0, 4.2, 2.6], [0, -2.2, -62, 3.4, 2.2], [0, -2.2, 62, 3.4, 2.2]].forEach(function (lf) {
        var r = at(sway, lf[0], lf[1], lf[2]);
        r.appendChild(lag('path', { d: 'M0 0Q' + lf[4] + ' ' + f(-lf[3] * .6) + ' 0 ' + f(-lf[3] * 2) + 'Q' + (-lf[4]) + ' ' + f(-lf[3] * .6) + ' 0 0Z' }, { fill: red ? '--lag-poster' : '--lag-acid', stroke: '--lag-card', sw: .4 }));
      });
      three.appendChild(sway);
      q.appendChild(three);
    }
    box.appendChild(s);
    return box;
  }
  /* Leopard print along the foot: khaki in the screen's light, dark rosettes. */
  function lagoonLeopard() {
    var L = stripLength(), box = el('div', 'pf-fx__leopard');
    var s = plainSvg(L, 10);
    s.appendChild(lag('rect', { x: 0, y: 0, width: L, height: 10 }, { fill: '--lag-dim' }));
    // a rosette is a broken ring of dark spots round a darker centre, and
    // there are loose spots between them
    for (var x = 5, i = 0; x < L; x += 11, i++) {
      var cx = x + rnd(i + 11) * 3, cy = 3 + rnd(i + 23) * 4, r = 2 + rnd(i + 5) * .6;
      s.appendChild(lag('ellipse', { cx: f(cx), cy: f(cy), rx: f(r * .8), ry: f(r * .62), 'fill-opacity': '.32' }, { fill: '--lag-card' }));
      var start = rnd(i + 31) * 360, k;
      for (k = 0; k < 4; k++) {
        var a = (start + k * 84 + rnd(i * 4 + k) * 22) * Math.PI / 180;
        s.appendChild(lag('ellipse', { cx: f(cx + r * Math.cos(a)), cy: f(cy + r * .8 * Math.sin(a)), rx: f(.9 + rnd(i + k + 3) * .4), ry: f(.6 + rnd(i + k + 8) * .3),
          transform: 'rotate(' + f(a * 180 / Math.PI + 90) + ' ' + f(cx + r * Math.cos(a)) + ' ' + f(cy + r * .8 * Math.sin(a)) + ')' }, { fill: '--lag-water' }));
      }
      s.appendChild(lag('circle', { cx: f(x + 8 + rnd(i + 51) * 2), cy: f(1.5 + rnd(i + 61) * 7), r: f(.45 + rnd(i + 71) * .35) }, { fill: '--lag-water' }));
    }
    box.appendChild(s);
    return box;
  }
  /* THE BIG MOMENT (Ryan, 2026-10-18: "I want it to also play across the full
     profile when it first loads like on Discord"). When the profile opens, and
     then once a minute while it is open, mist climbs off black water across
     the foot of the profile, the serpent's coils break the surface, its head
     rears up across the whole profile and looks about, its tongue flicks, a
     flurry of bats bursts out past it, and it all sinks back: about nine
     seconds of every sixty. Like the pass it crosses words, so it is drawn at
     all only where the radio's drawings move, and every part of it fades over
     a second or more, so nothing flashes. Every part runs on one sixty-second
     clock from cb.css, started together when the profile is drawn.

     It is drawn in a box of 300 by 360 anchored at the profile's bottom right,
     its water line at 277; the water reaches left past the box to the
     profile's other edge, and everything below the line is clipped, so the
     serpent comes up out of the water at any size. Lit from the upper left,
     where the screen is in the banner: a rim of its light on that side and
     dark on the other. */
  function lagoonMoment() {
    var n = ++lagN, box = el('div', 'pf-fx__moment');
    var s = plainSvg(300, 360, 'pf-fx__beast');
    s.removeAttribute('width');
    s.removeAttribute('height');
    s.setAttribute('preserveAspectRatio', 'xMaxYMax meet');
    var defs = lagDefs(s);
    var clip = document.createElementNS(NS, 'clipPath');
    clip.setAttribute('id', 'pf-lag-under-' + n);
    var cr = document.createElementNS(NS, 'rect');
    cr.setAttribute('x', '-3000'); cr.setAttribute('y', '-2000'); cr.setAttribute('width', '3400'); cr.setAttribute('height', '2277');
    clip.appendChild(cr);
    defs.appendChild(clip);
    var g = group(s);
    // the water, across the whole foot of the profile
    var tide = svgEl('g', {}, { cls: 'fx-mo-tide' });
    tide.style.removeProperty('fill');
    tide.appendChild(lag('rect', { x: -3000, y: 277, width: 3400, height: 400, 'fill-opacity': '.94' }, { fill: '--lag-water' }));
    tide.appendChild(lag('path', { d: 'M-3000 277.6H400' }, { stroke: '--lag-screen', sw: 1.2, cls: '' }));
    for (var i = 0; i < 18; i++) {
      var rx = 300 - i * 52 - rnd(i + 3) * 30, ry = 290 + rnd(i + 13) * 50;
      tide.appendChild(lag('path', { d: 'M' + f(rx) + ' ' + f(ry) + 'h' + f(14 + rnd(i) * 16) }, { stroke: '--lag-card', sw: 1.6, cls: 'fx-ripple', d: i * .4 % 6, t: 6 }));
    }
    g.appendChild(tide);
    var under = group(g);
    under.setAttribute('clip-path', 'url(#pf-lag-under-' + n + ')');
    // a coil of the body: a tube arching up out of the water and back down
    function bigCoil(cx, w, h, T, cls) {
      var c = svgEl('g', {}, { cls: cls });
      c.style.removeProperty('fill');
      var l = cx - w / 2, r = cx + w / 2, up = 277 - h * 1.33, half = T / 2;
      c.appendChild(lag('path', { d: 'M' + f(l - half) + ' 300C' + f(l - half) + ' ' + f(up - T * .66) + ' ' + f(r + half) + ' ' + f(up - T * .66) + ' ' + f(r + half) + ' 300' +
        'L' + f(r - half) + ' 300C' + f(r - half) + ' ' + f(up + T * .66) + ' ' + f(l + half) + ' ' + f(up + T * .66) + ' ' + f(l + half) + ' 300Z' }, { fill: '--lag-acid', stroke: '--lag-card', sw: 1.6 }));
      // dark on the inside and the far side, the screen's light on the near rim
      c.appendChild(lag('path', { d: 'M' + f(r - half + 2) + ' 296C' + f(r - half + 2) + ' ' + f(up + T * .5) + ' ' + f(l + half + 4) + ' ' + f(up + T * .5) + ' ' + f(l + half + 2) + ' 296' }, { stroke: '--lag-card', sw: 5 }));
      var rim = lag('path', { d: 'M' + f(l - half + 2.4) + ' 300C' + f(l - half + 2.4) + ' ' + f(up - T * .66 + 2.4) + ' ' + f(r + half - 2.4) + ' ' + f(up - T * .66 + 2.4) + ' ' + f(r + half - 2.4) + ' 300', pathLength: 1 }, { stroke: '--lag-screen', sw: 1.6 });
      rim.style.setProperty('stroke-dasharray', '.46 1');
      c.appendChild(rim);
      // scales, and a row of round bumps along the back
      for (var k = 0; k < 7; k++) {
        var tt = .14 + k * .12, x = Math.pow(1 - tt, 3) * l + 3 * Math.pow(1 - tt, 2) * tt * l + 3 * (1 - tt) * tt * tt * r + Math.pow(tt, 3) * r;
        var y = Math.pow(1 - tt, 3) * 300 + 3 * Math.pow(1 - tt, 2) * tt * up + 3 * (1 - tt) * tt * tt * up + Math.pow(tt, 3) * 300;
        c.appendChild(lag('path', { d: 'M' + f(x - 3) + ' ' + f(y - 1) + 'q3 3 6 0M' + f(x - 1) + ' ' + f(y + 5) + 'q3 3 6 0' }, { stroke: '--lag-card', sw: 1 }));
        c.appendChild(lag('circle', { cx: f(x), cy: f(y - half - 1), r: 2.6 }, { fill: '--lag-acid', stroke: '--lag-card', sw: 1 }));
      }
      under.appendChild(c);
    }
    bigCoil(64, 58, 46, 22, 'fx-mo-coil');
    bigCoil(140, 50, 38, 20, 'fx-mo-coil2');
    // the neck and the head, rearing up and looking about
    var rear = svgEl('g', {}, { cls: 'fx-mo-rear' });
    rear.style.removeProperty('fill');
    rear.appendChild(lag('path', { d: 'M206 300C226 202 212 130 176 104L202 76C254 110 274 198 250 300Z' }, { fill: '--lag-acid', stroke: '--lag-card', sw: 1.8 }));
    rear.appendChild(lag('path', { d: 'M212 300C232 206 220 136 188 110L194 102C228 130 242 204 226 300Z', 'fill-opacity': '.6' }, { fill: '--lag-dim' }));
    for (var b = 0; b < 9; b++) {
      var by = 290 - b * 21, bx = 216 + Math.sin(b * .5) * 6 - b * 2.2;
      rear.appendChild(lag('path', { d: 'M' + f(bx - 6) + ' ' + f(by) + 'q8 -4 14 1' }, { stroke: '--lag-card', sw: 1.1 }));
    }
    rear.appendChild(lag('path', { d: 'M244 296C266 200 248 118 204 82' }, { stroke: '--lag-card', sw: 6, cls: '' }));
    rear.appendChild(lag('path', { d: 'M208 296C228 204 214 134 180 106' }, { stroke: '--lag-screen', sw: 1.6 }));
    for (var d2 = 0; d2 < 6; d2++) {
      rear.appendChild(lag('circle', { cx: f(252 - d2 * 3 + Math.sin(d2) * 4), cy: f(270 - d2 * 34), r: 3.4 }, { fill: '--lag-acid', stroke: '--lag-card', sw: 1 }));
    }
    var head = svgEl('g', {}, {});
    head.style.removeProperty('fill');
    head.appendChild(lag('path', { d: 'M206 86C200 60 168 46 140 54C114 61 98 76 100 92C102 106 124 114 152 112C180 110 202 104 210 92Z' }, { fill: '--lag-acid', stroke: '--lag-card', sw: 1.8 }));
    head.appendChild(lag('path', { d: 'M210 92C202 104 180 110 156 112C176 104 196 96 204 84Z', 'fill-opacity': '.6' }, { fill: '--lag-card' }));
    head.appendChild(lag('path', { d: 'M104 80C112 64 132 56 152 54' }, { stroke: '--lag-screen', sw: 1.8 }));
    head.appendChild(lag('path', { d: 'M104 94C122 102 146 103 170 98' }, { stroke: '--lag-card', sw: 2 }));
    [[116, 96], [132, 99.5], [150, 100]].forEach(function (fg) {
      head.appendChild(lag('path', { d: 'M' + (fg[0] - 3) + ' ' + fg[1] + 'L' + fg[0] + ' ' + (fg[1] + 9) + 'L' + (fg[0] + 3) + ' ' + fg[1] + 'Z' }, { fill: '--lag-screen', stroke: '--lag-card', sw: .8 }));
    });
    head.appendChild(lag('ellipse', { cx: 108, cy: 78, rx: 2.6, ry: 1.8 }, { fill: '--lag-card' }));
    [[150, 72, 4], [162, 84, 3], [176, 76, 3.6], [188, 90, 2.6]].forEach(function (sp) { head.appendChild(lag('circle', { cx: sp[0], cy: sp[1], r: sp[2] }, { fill: '--lag-card' })); });
    var tongue = svgEl('g', {}, { cls: 'fx-mo-tongue' });
    tongue.style.removeProperty('fill');
    tongue.appendChild(lag('path', { d: 'M104 94L84 98L76 92M84 98L77 103' }, { stroke: '--lag-poster', sw: 2.4 }));
    head.appendChild(tongue);
    // eyes on stalks, looking about
    [[156, 56, 146, 18], [184, 58, 192, 22]].forEach(function (st) {
      head.appendChild(lag('path', { d: 'M' + st[0] + ' ' + st[1] + 'Q' + (st[0] + (st[2] - st[0]) * .2) + ' ' + (st[3] + 18) + ' ' + st[2] + ' ' + (st[3] + 9) }, { stroke: '--lag-acid', sw: 5 }));
      head.appendChild(lag('path', { d: 'M' + (st[0] - 2) + ' ' + (st[1] - 1) + 'Q' + (st[0] + (st[2] - st[0]) * .2 - 2) + ' ' + (st[3] + 18) + ' ' + (st[2] - 2) + ' ' + (st[3] + 10) }, { stroke: '--lag-screen', sw: .9 }));
      head.appendChild(lag('circle', { cx: st[2], cy: st[3], r: 11.5 }, { fill: '--lag-screen', stroke: '--lag-card', sw: 1.6 }));
      head.appendChild(lag('path', { d: 'M' + (st[2] - 8) + ' ' + (st[3] + 5) + 'q4 3 9 2' }, { stroke: '--lag-poster', sw: .8 }));
      var peer = svgEl('g', {}, { cls: 'fx-mo-peer' });
      peer.style.removeProperty('fill');
      peer.appendChild(lag('circle', { cx: st[2] - 1.5, cy: st[3] + 1, r: 5.4 }, { fill: '--lag-water' }));
      peer.appendChild(lag('circle', { cx: st[2] - 3.2, cy: st[3] - 1.2, r: 1.8 }, { fill: '--lag-screen' }));
      head.appendChild(peer);
    });
    // pondweed draped over the head
    var weed = svgEl('g', {}, { cls: 'art-sway', t: 5 });
    weed.style.removeProperty('fill');
    weed.appendChild(lag('path', { d: 'M168 52C160 62 166 78 158 92M176 54C178 66 172 76 176 88M196 64C204 74 200 86 206 96' }, { stroke: '--lag-dim', sw: 1.6 }));
    [[161, 70, -30], [163, 86, 20], [175, 72, 10], [202, 82, -20], [204, 94, 30]].forEach(function (w) {
      at(weed, w[0], w[1], w[2]).appendChild(lag('path', { d: leaf(4, 2.2) }, { fill: '--lag-dim' }));
    });
    head.appendChild(weed);
    [[124, 108, 0], [146, 111, 1.1], [168, 109, 2]].forEach(function (dr) {
      head.appendChild(lag('ellipse', { cx: dr[0], cy: dr[1], rx: 1.6, ry: 2.6, 'fill-opacity': '.75' }, { fill: '--lag-screen', cls: 'art-fall', d: dr[2], t: 2.6, run: 60 }));
    });
    rear.appendChild(head);
    under.appendChild(rear);
    // rings spreading on the water where it broke the surface
    [[64, 40, 'fx-mo-ring'], [140, 34, 'fx-mo-ring'], [228, 30, 'fx-mo-ring2']].forEach(function (rg) {
      g.appendChild(lag('ellipse', { cx: rg[0], cy: 278, rx: rg[1], ry: 6 }, { stroke: '--lag-dim', sw: 1.6, cls: rg[2] }));
    });
    box.appendChild(s);
    // mist off the water, climbing over the profile
    [['pf-fx__mist', '--lag-acid', .22], ['pf-fx__mist pf-fx__mist--far', '--lag-dim', .26]].forEach(function (m, j) {
      var ms = plainSvg(100, 60, m[0]);
      ms.removeAttribute('width');
      ms.removeAttribute('height');
      ms.setAttribute('preserveAspectRatio', 'none');
      for (var k = 0; k < 7; k++) {
        ms.appendChild(lag('ellipse', { cx: f(6 + k * 15 + rnd(k + j * 9) * 6), cy: f(38 + rnd(k + 4 + j) * 14), rx: f(12 + rnd(k + 2) * 8), ry: f(8 + rnd(k + 6) * 6), 'fill-opacity': String(m[2]) }, { fill: m[1] }));
      }
      box.appendChild(ms);
    });
    // a flurry of bats bursting out past it
    for (var k2 = 0; k2 < 9; k2++) {
      var bat = el('span', 'pf-fx__burst');
      bat.style.setProperty('--px', f(-12 - rnd(k2 + 41) * 62));
      bat.style.setProperty('--py', f(-6 - rnd(k2 + 57) * 34 + (k2 % 3 === 0 ? 20 : 0)));
      bat.style.setProperty('--d', f(k2 * .07) + 's');
      var bob = el('span', 'fx-bob');
      bob.style.setProperty('--b', f(2 + rnd(k2) * 1.2) + 's');
      bob.appendChild(motif('bat', 16 + rnd(k2 + 5) * 12, true));
      bat.appendChild(bob);
      box.appendChild(bat);
    }
    return box;
  }
  E.lagoon = {
    scene: function (box) {
      box.appendChild(lagoonScene());
      box.appendChild(lagoonVine(false));
      box.appendChild(lagoonVine(true));
      box.appendChild(lagoonLeopard());
      box.appendChild(lagoonMoment());
    },
    edge: [['hotrod', 'br', 0, 34, 0, [-30, -11]]],
    pass: { motif: 'bat', from: 'right', n: 6, size: 24, t: 24, drift: 14 }
  };
  /* effect:lagoon:end */

  /* effect:otters:begin */
  /* OTTERS IN THE KELP (Ryan, 2026-10-18: "Make the effect large and cute.
     Floating, swimming otters being cute. Kelp forests."), to pair with the
     Kelp Forest theme. Drawn in that theme's own declared --cb-kelp-* inks,
     and make-profile.py holds this block to them.

     IT KEEPS THE ARCADE'S OTTER RULES (otterly.js, Otterly Adorbs): floating
     fills nothing here either, with no meter and nothing earned, so no word
     in this block or its credit says rest is for anything; no otter is better
     than another; and no two otters hold paws, because that story is the
     internet's and the zine does not tell it. What the cabinet does say is
     drawn: the kelp does the holding, so the otter that floats keeps a strand
     of it across its belly. Nobody carries a stone in a pouch either; nobody
     carries a stone at all.

     A scene over the card's banner (the surface with light coming down
     through it, kelp rising to it with its floats, an otter anchored in the
     kelp with a shell on its chest, an otter rolling over, an otter swimming
     back and forth below, urchins and a starfish on the bottom), bubbles
     rising across the profile, and an opening across the whole profile: the
     kelp forest grows up through it, a big otter swims up, rolls once and
     floats on its back, eyes shut, and drifts away. */
  function otterBack(g, x, y, k, o) {
    o = o || {};
    var w = svgEl('g', {}, { cls: o.cls || '', d: o.d, t: o.t });
    w.style.removeProperty('fill');
    g.appendChild(w);
    var n = '--cb-kelp-nose', sw = Math.max(.35, .5 * k);
    function P(x0, y0) { return f(x + x0 * k) + ' ' + f(y + y0 * k); }
    w.appendChild(svgEl('path', { d: 'M' + P(-9.6, .4) + 'Q' + P(-18, -.2) + ' ' + P(-17.4, -2.4) + 'Q' + P(-13.4, -2.6) + ' ' + P(-9, -1.6) + 'Z' }, { fill: '--cb-kelp-fur-2', stroke: n, sw: sw }));
    [[-8.8, -4.4, -24], [-6.8, -4.9, 8]].forEach(function (ft) {
      w.appendChild(svgEl('ellipse', { cx: f(x + ft[0] * k), cy: f(y + ft[1] * k), rx: f(1.5 * k), ry: f(2.8 * k), transform: 'rotate(' + ft[2] + ' ' + P(ft[0], ft[1]).replace(' ', ' ') + ')' }, { fill: '--cb-kelp-fur-2', stroke: n, sw: sw }));
    });
    w.appendChild(svgEl('path', { d: 'M' + P(-10, 0) + 'Q' + P(-10, -4.6) + ' ' + P(-2, -4.6) + 'L' + P(6, -4.2) + 'Q' + P(10, -3.6) + ' ' + P(10, 0) + 'Q' + P(10, 4) + ' ' + P(4, 4.2) + 'L' + P(-6, 4) + 'Q' + P(-10, 3.6) + ' ' + P(-10, 0) + 'Z' }, { fill: '--cb-kelp-fur', stroke: n, sw: sw }));
    w.appendChild(svgEl('ellipse', { cx: f(x + 5 * k), cy: f(y - 1.6 * k), rx: f(4.2 * k), ry: f(2.5 * k), 'fill-opacity': '.5' }, { fill: '--cb-kelp-face' }));
    [[9.4, -5.2, 1.1], [12.8, -5.6, 1]].forEach(function (e) { w.appendChild(svgEl('circle', { cx: f(x + e[0] * k), cy: f(y + e[1] * k), r: f(e[2] * k) }, { fill: '--cb-kelp-fur', stroke: n, sw: sw })); });
    w.appendChild(svgEl('circle', { cx: f(x + 11.6 * k), cy: f(y - 1.2 * k), r: f(4.6 * k) }, { fill: '--cb-kelp-face', stroke: n, sw: sw }));
    w.appendChild(svgEl('ellipse', { cx: f(x + 15 * k), cy: f(y - .4 * k), rx: f(2.2 * k), ry: f(1.6 * k) }, { fill: '--cb-kelp-face', stroke: n, sw: sw * .8 }));
    w.appendChild(svgEl('ellipse', { cx: f(x + 15.8 * k), cy: f(y - 1.3 * k), rx: f(1 * k), ry: f(.72 * k) }, { fill: n }));
    w.appendChild(svgEl('path', { d: 'M' + P(14.4, .3) + 'q' + f(.6 * k) + ' ' + f(.7 * k) + ' ' + f(1.2 * k) + ' 0q' + f(.6 * k) + ' ' + f(.7 * k) + ' ' + f(1.2 * k) + ' 0' }, { stroke: n, sw: sw * .8 }));
    // eyes shut, content
    [10.2, 12.8].forEach(function (ex) { w.appendChild(svgEl('path', { d: 'M' + P(ex, -2.4) + 'q' + f(.8 * k) + ' ' + f(-1 * k) + ' ' + f(1.6 * k) + ' 0' }, { stroke: n, sw: sw * .9 })); });
    w.appendChild(svgEl('ellipse', { cx: f(x + 12.2 * k), cy: f(y - .4 * k), rx: f(.95 * k), ry: f(.55 * k), 'fill-opacity': '.75' }, { fill: '--cb-kelp-shell' }));
    w.appendChild(svgEl('path', { d: 'M' + P(16.2, -.2) + 'l' + f(2.8 * k) + ' ' + f(-.9 * k) + 'M' + P(16.2, .4) + 'l' + f(3 * k) + ' ' + f(.2 * k) + 'M' + P(16, 1) + 'l' + f(2.6 * k) + ' ' + f(1 * k) }, { stroke: n, sw: sw * .6 }));
    if (o.shell) {
      w.appendChild(svgEl('path', { d: 'M' + P(4.4, -4.6) + 'Q' + P(6.3, -8.4) + ' ' + P(8.2, -4.6) + 'Z' }, { fill: '--cb-kelp-shell', stroke: n, sw: sw * .8 }));
      w.appendChild(svgEl('path', { d: 'M' + P(6.3, -4.8) + 'L' + P(6.3, -7.4) + 'M' + P(5.4, -4.8) + 'L' + P(5.4, -6.8) + 'M' + P(7.2, -4.8) + 'L' + P(7.2, -6.8) }, { stroke: n, sw: sw * .5 }));
    }
    [[5.2, -4], [7.6, -3.9]].forEach(function (pw) { w.appendChild(svgEl('ellipse', { cx: f(x + pw[0] * k), cy: f(y + pw[1] * k), rx: f(1.4 * k), ry: f(1.1 * k) }, { fill: '--cb-kelp-fur-2', stroke: n, sw: sw * .8 })); });
    if (o.kelp) {
      w.appendChild(svgEl('path', { d: 'M' + P(-8, 5.6) + 'Q' + P(-1, -6.2) + ' ' + P(8, 5.6) }, { stroke: '--cb-kelp-blade', sw: Math.max(.9, 1.5 * k) }));
      [[-5, 1.2, -50], [4.6, 1.4, 50]].forEach(function (bl) { at(w, x + bl[0] * k, y + bl[1] * k, bl[2]).appendChild(svgEl('path', { d: leaf(2.4 * k, 1.2 * k) }, { fill: '--cb-kelp-blade' })); });
    }
    if (o.water !== false) {
      w.appendChild(svgEl('rect', { x: f(x - 20 * k), y: f(y + .8 * k), width: f(40 * k), height: f(6 * k), 'fill-opacity': '.5' }, { fill: '--cb-kelp-sea' }));
      w.appendChild(svgEl('path', { d: 'M' + P(-20, .8) + 'q' + f(5 * k) + ' ' + f(-1 * k) + ' ' + f(10 * k) + ' 0t' + f(10 * k) + ' 0t' + f(10 * k) + ' 0t' + f(10 * k) + ' 0' }, { stroke: '--cb-kelp-light', sw: sw }));
    }
    return w;
  }
  function otterSwim(g, x, y, k, o) {
    o = o || {};
    var w = svgEl('g', {}, { cls: o.cls || '', d: o.d, t: o.t });
    w.style.removeProperty('fill');
    g.appendChild(w);
    var n = '--cb-kelp-nose', sw = Math.max(.35, .5 * k);
    function P(x0, y0) { return f(x + x0 * k) + ' ' + f(y + y0 * k); }
    w.appendChild(svgEl('path', { d: 'M' + P(-11, -.4) + 'Q' + P(-19, -1.6) + ' ' + P(-20, .6) + 'Q' + P(-16, 1.6) + ' ' + P(-11, 1.2) + 'Z' }, { fill: '--cb-kelp-fur-2', stroke: n, sw: sw }));
    [[-11, 2.4, 20], [-10, -1.8, -20]].forEach(function (ft) {
      at(w, x + ft[0] * k, y + ft[1] * k, ft[2] + 90).appendChild(svgEl('path', { d: leaf(2.6 * k, 1.5 * k) }, { fill: '--cb-kelp-fur-2', stroke: n, sw: sw * .8 }));
    });
    w.appendChild(svgEl('path', { d: 'M' + P(-11, 0) + 'Q' + P(-11, -3.6) + ' ' + P(-3, -3.6) + 'L' + P(8, -3.2) + 'Q' + P(12, -2.6) + ' ' + P(12, .4) + 'Q' + P(12, 3.2) + ' ' + P(7, 3.2) + 'L' + P(-4, 3.4) + 'Q' + P(-11, 3.4) + ' ' + P(-11, 0) + 'Z' }, { fill: '--cb-kelp-fur', stroke: n, sw: sw }));
    w.appendChild(svgEl('ellipse', { cx: f(x + 6.4 * k), cy: f(y + 3.4 * k), rx: f(1.6 * k), ry: f(.9 * k) }, { fill: '--cb-kelp-fur-2', stroke: n, sw: sw * .8 }));
    w.appendChild(svgEl('circle', { cx: f(x + 13.6 * k), cy: f(y - .6 * k), r: f(3.6 * k) }, { fill: '--cb-kelp-face', stroke: n, sw: sw }));
    w.appendChild(svgEl('circle', { cx: f(x + 12 * k), cy: f(y - 3.8 * k), r: f(.9 * k) }, { fill: '--cb-kelp-fur', stroke: n, sw: sw * .8 }));
    w.appendChild(svgEl('circle', { cx: f(x + 14.4 * k), cy: f(y - 1.6 * k), r: f(.75 * k) }, { fill: n }));
    w.appendChild(svgEl('circle', { cx: f(x + 14.7 * k), cy: f(y - 1.9 * k), r: f(.25 * k) }, { fill: '--cb-kelp-bubble' }));
    w.appendChild(svgEl('ellipse', { cx: f(x + 17.2 * k), cy: f(y - .2 * k), rx: f(.9 * k), ry: f(.7 * k) }, { fill: n }));
    w.appendChild(svgEl('path', { d: 'M' + P(16.8, .6) + 'l' + f(2.6 * k) + ' ' + f(.4 * k) + 'M' + P(16.6, 1.2) + 'l' + f(2.2 * k) + ' ' + f(1.2 * k) }, { stroke: n, sw: sw * .6 }));
    return w;
  }
  function kelpStalk(g, x, bottom, top, k, i) {
    var st = svgEl('g', {}, { cls: 'art-sway', d: i * .7 % 5, t: 6 + i % 3 });
    st.style.removeProperty('fill');
    var lean = (rnd(i + 3) - .5) * 10 * k;
    st.appendChild(svgEl('path', { d: 'M' + f(x) + ' ' + f(bottom) + 'Q' + f(x + lean) + ' ' + f((bottom + top) / 2) + ' ' + f(x + lean * .3) + ' ' + f(top) }, { stroke: '--cb-kelp-stipe', sw: Math.max(.9, 1.6 * k) }));
    for (var y = bottom - 6 * k, j = 0; y > top + 4 * k; y -= 7 * k, j++) {
      var tt = (bottom - y) / (bottom - top), bx = x + lean * 2 * tt * (1 - tt) * 1.6 + lean * .3 * tt * tt, dir = (j + i) % 2 ? 1 : -1;
      st.appendChild(svgEl('path', { d: 'M' + f(bx) + ' ' + f(y) + 'q' + f(dir * 6 * k) + ' ' + f(-2.6 * k) + ' ' + f(dir * 9 * k) + ' ' + f(-6.4 * k) + 'q' + f(-dir * 5 * k) + ' ' + f(1.4 * k) + ' ' + f(-dir * 9 * k) + ' ' + f(6.4 * k) + 'Z' }, { fill: '--cb-kelp-blade', stroke: '--cb-kelp-stipe', sw: Math.max(.3, .4 * k) }));
      if (j % 2 === 0) st.appendChild(svgEl('circle', { cx: f(bx + dir * 1.6 * k), cy: f(y - .7 * k), r: f(1.4 * k) }, { fill: '--cb-kelp-float', stroke: '--cb-kelp-stipe', sw: Math.max(.3, .35 * k) }));
    }
    g.appendChild(st);
    return st;
  }
  M.kbubble = function (g) {
    g.appendChild(svgEl('circle', { r: 7 }, { stroke: '--cb-kelp-bubble', sw: 1.3 }));
    g.appendChild(svgEl('path', { d: 'M-3.8 -1A4 4 0 0 1 -1 -3.8' }, { stroke: '--cb-kelp-bubble', sw: 1.3 }));
  };
  M.kstar = function (g) { g.appendChild(svgEl('path', { d: star5(9) }, { fill: '--cb-kelp-shell', stroke: '--cb-kelp-nose', sw: .8 })); };
  M.kshell = function (g) {
    g.appendChild(svgEl('path', { d: 'M-8 4Q0 -12 8 4Z' }, { fill: '--cb-kelp-face', stroke: '--cb-kelp-nose', sw: .8 }));
    g.appendChild(svgEl('path', { d: 'M0 4L0 -4.6M-3.6 4L-2 -3M3.6 4L2 -3' }, { stroke: '--cb-kelp-nose', sw: .6 }));
  };

  var otN = 0;
  function otterScene() {
    var s = plainSvg(380, 112, 'pf-fx__scene');
    s.removeAttribute('width');
    s.removeAttribute('height');
    var n = ++otN, defs = document.createElementNS(NS, 'defs');
    s.appendChild(defs);
    var fade = document.createElementNS(NS, 'linearGradient');
    fade.setAttribute('id', 'pf-ot-fade-' + n);
    fade.setAttribute('x1', '0'); fade.setAttribute('x2', '1'); fade.setAttribute('y1', '0'); fade.setAttribute('y2', '0');
    [[0, 0], [.2, .88], [.88, .88], [1, 0]].forEach(function (st) {
      var e = document.createElementNS(NS, 'stop');
      e.setAttribute('offset', String(st[0]));
      e.style.setProperty('stop-color', 'var(--cb-kelp-sea)');
      e.style.setProperty('stop-opacity', String(st[1]));
      fade.appendChild(e);
    });
    defs.appendChild(fade);
    var g = group(s);
    // below the surface the green water, fading in and out at its ends so it is
    // not a box laid on the banner, and keeping off the avatar
    var sea = svgEl('rect', { x: 130, y: 30, width: 250, height: 82 }, {});
    sea.style.setProperty('fill', 'url(#pf-ot-fade-' + n + ')');
    g.appendChild(sea);
    // light falling through it, breathing slowly
    var shafts = svgEl('g', {}, { cls: 'fx-breathe', t: 10 });
    shafts.style.removeProperty('fill');
    [[196, 10], [260, 14], [330, 9]].forEach(function (sh) {
      shafts.appendChild(svgEl('path', { d: 'M' + sh[0] + ' 30L' + (sh[0] + sh[1]) + ' 30L' + (sh[0] + sh[1] + 26) + ' 112L' + (sh[0] + 22) + ' 112Z', 'fill-opacity': '.12' }, { fill: '--cb-kelp-light' }));
    });
    g.appendChild(shafts);
    // the bottom, with urchins and a starfish
    g.appendChild(svgEl('path', { d: 'M168 112Q240 104 300 108T380 104V112Z', 'fill-opacity': '.8' }, { fill: '--cb-kelp-stipe' }));
    [[352, 105, 3.4], [366, 106.5, 2.6]].forEach(function (u) {
      var spikes = '';
      for (var a = 0; a < 360; a += 30) spikes += 'M' + f(u[0]) + ' ' + f(u[1]) + 'l' + f(Math.cos(a * Math.PI / 180) * u[2] * 1.7) + ' ' + f(Math.sin(a * Math.PI / 180) * u[2] * 1.7);
      g.appendChild(svgEl('path', { d: spikes }, { stroke: '--cb-kelp-urchin', sw: .7 }));
      g.appendChild(svgEl('circle', { cx: u[0], cy: u[1], r: u[2] }, { fill: '--cb-kelp-urchin' }));
    });
    at(g, 312, 106, 12).appendChild(svgEl('path', { d: star5(3.6) }, { fill: '--cb-kelp-shell', stroke: '--cb-kelp-nose', sw: .4 }));
    // the kelp, rising to the surface, and its canopy lying on the water
    [[176, 0], [210, 1], [266, 2], [300, 3], [346, 4]].forEach(function (kx) { kelpStalk(g, kx[0], 112, 31, .62, kx[1]); });
    [[190, 30, -8], [236, 31, 6], [286, 30, -5], [362, 31, 8]].forEach(function (cn) {
      at(g, cn[0], cn[1], 90 + cn[2]).appendChild(svgEl('path', { d: leaf(3, 9) }, { fill: '--cb-kelp-blade', stroke: '--cb-kelp-stipe', sw: .4 }));
    });
    // the swimmer, back and forth below, trailing bubbles
    var swim = svgEl('g', {}, { cls: 'fx-swim', t: 14 });
    swim.style.removeProperty('fill');
    otterSwim(swim, 206, 78, 1.25);
    [[180, 73, 0], [175, 66, 1], [182, 59, 2]].forEach(function (b) {
      swim.appendChild(svgEl('circle', { cx: b[0], cy: b[1], r: 1.2 + b[2] * .3 }, { stroke: '--cb-kelp-bubble', sw: .5, cls: 'art-fall', d: b[2] * .8, t: 3, run: -18 }));
    });
    g.appendChild(swim);
    // floating at the surface: one anchored in the kelp with a shell on its
    // chest, one rolling over now and then
    var bob1 = svgEl('g', {}, { cls: 'fx-bob' });
    bob1.style.removeProperty('fill');
    bob1.style.setProperty('--b', '4.6s');
    otterBack(bob1, 226, 31, 1.45, { kelp: true, shell: true, cls: 'art-sway', t: 7 });
    g.appendChild(bob1);
    var bob2 = svgEl('g', {}, { cls: 'fx-bob' });
    bob2.style.removeProperty('fill');
    bob2.style.setProperty('--b', '5.4s');
    var roll = svgEl('g', {}, { cls: 'fx-roll', t: 13 });
    roll.style.removeProperty('fill');
    otterBack(roll, 326, 31, 1.15, { water: false });
    bob2.appendChild(roll);
    bob2.appendChild(svgEl('rect', { x: 302, y: 32, width: 54, height: 7, 'fill-opacity': '.5' }, { fill: '--cb-kelp-sea' }));
    g.appendChild(bob2);
    return s;
  }

  /* THE OPENING, across the whole profile, on the Lagoon's sixty-second clock:
     the water comes up, the kelp forest grows up through the profile, a big
     otter swims up out of the bottom left, rolls once and floats on its back,
     and then drifts away to the right while the forest goes. */
  function otterMoment() {
    var box = el('div', 'pf-fx__moment');
    var forest = plainSvg(400, 300, 'pf-fx__forest');
    forest.removeAttribute('width');
    forest.removeAttribute('height');
    forest.setAttribute('preserveAspectRatio', 'xMidYMax slice');
    var g = group(forest);
    var tint = svgEl('g', {}, { cls: 'fx-mo-ot-tint' });
    tint.style.removeProperty('fill');
    tint.appendChild(svgEl('rect', { x: -40, y: 0, width: 480, height: 320, 'fill-opacity': '.62' }, { fill: '--cb-kelp-sea' }));
    [[40, 26], [150, 34], [262, 28], [352, 22]].forEach(function (sh) {
      tint.appendChild(svgEl('path', { d: 'M' + sh[0] + ' 0L' + (sh[0] + sh[1]) + ' 0L' + (sh[0] + sh[1] + 60) + ' 300L' + (sh[0] + 46) + ' 300Z', 'fill-opacity': '.12' }, { fill: '--cb-kelp-light' }));
    });
    g.appendChild(tint);
    [[14, 0], [62, 1], [118, 2], [176, 3], [232, 4], [290, 5], [344, 6], [392, 7]].forEach(function (kx, i) {
      var grow = svgEl('g', {}, { cls: i % 2 ? 'fx-mo-ot-kelp2' : 'fx-mo-ot-kelp' });
      grow.style.removeProperty('fill');
      kelpStalk(grow, kx[0], 306, 26 + rnd(i + 9) * 50, 1.5, kx[1]);
      g.appendChild(grow);
    });
    box.appendChild(forest);
    var big = plainSvg(300, 140, 'pf-fx__otter');
    big.removeAttribute('width');
    big.removeAttribute('height');
    var swimIn = svgEl('g', {}, { cls: 'fx-mo-ot-roll' });
    swimIn.style.removeProperty('fill');
    otterBack(swimIn, 128, 74, 6.2, { kelp: true, shell: true });
    big.appendChild(swimIn);
    box.appendChild(big);
    for (var i = 0; i < 14; i++) {
      var b = el('span', 'pf-fx__ot-bubble');
      b.style.left = f(4 + rnd(i + 61) * 92) + '%';
      b.style.setProperty('--d', f(rnd(i + 71) * 2.6) + 's');
      b.appendChild(motif('kbubble', 8 + rnd(i + 81) * 10, true));
      box.appendChild(b);
    }
    return box;
  }
  E.otters = {
    scene: function (box) {
      box.appendChild(otterScene());
      box.appendChild(otterMoment());
    },
    edge: [['kshell', 'bl', 0, 18, -10, [16, -9]], ['kstar', 'br', 0, 16, 14, [-18, -10]]],
    pass: { motif: 'kbubble', from: 'bottom', n: 10, size: 12, t: 24, drift: 8 }
  };
  /* effect:otters:end */

  /* effect:fairy:begin */
  /* FLYING FAIRY (Ryan, 2026-10-19: "a Flying Fairy profile effect that
     includes the fairies from the yurt flying around the page and a big
     animation of a fairy woman with butterfly wings"), to pair with the Fairy
     Lights theme. Drawn in that theme's own declared --cb-fairy-* inks, every
     one named here as a string, singly or in a list, so make-profile.py can
     hold this block to them.

     THE FAERIES ARE THE FAERY YURT'S, Helen Edgar's room: the small woodland
     faeries drawn for it at her ask (yurt-garden.js, Join the faeries), each
     with a flower crown, long hair, a mossy cloak to the ground, a posy held
     in front, gauzy wings, and some with little curled horns, no two dressed
     alike, in the yurt's own colours. Here they fly across the profile,
     darting and hovering, their wings going, dropping petals behind them.

     THE BIG FAIRY is drawn here, after the look of Helen's own profile: red
     hair under a crown of roses and two little curled horns, a cloak of moss,
     a posy of red and pink roses held close, her eyes shut, and butterfly
     wings. Nothing of anybody's art is copied. When the profile opens, and once
     a minute, a dusk comes up over the profile with sparkles along its top,
     she rises into it, opens her wings and lets them beat slowly while petals
     and leaves fall round her and three of the yurt's faeries fly out from
     her, and she fades: about nine seconds of every sixty, on the Lagoon's
     clock, every fade a second or more.

     The still part is a garland of fairy lights over the banner with a faery
     sitting on it and another hovering, and roses, a daisy and sparkles in the
     corners. The pass is petals falling. */
  var FY_WING = ['--cb-fairy-wing-1', '--cb-fairy-wing-2', '--cb-fairy-wing-3', '--cb-fairy-wing-4', '--cb-fairy-wing-5', '--cb-fairy-wing-6', '--cb-fairy-wing-7'];
  var FY_SKIN = ['--cb-fairy-skin-1', '--cb-fairy-skin-2', '--cb-fairy-skin-3', '--cb-fairy-skin-4', '--cb-fairy-skin-5'];
  var FY_HAIR = ['--cb-fairy-hair-1', '--cb-fairy-hair-2', '--cb-fairy-hair-3', '--cb-fairy-hair-4', '--cb-fairy-hair-5', '--cb-fairy-hair-6', '--cb-fairy-hair-7'];
  var FY_MOSS = ['--cb-fairy-moss-1', '--cb-fairy-moss-2', '--cb-fairy-moss-3', '--cb-fairy-moss-4', '--cb-fairy-moss-5', '--cb-fairy-moss-6'];
  var FY_FOLD = ['--cb-fairy-fold-1', '--cb-fairy-fold-2', '--cb-fairy-fold-3', '--cb-fairy-fold-4', '--cb-fairy-fold-5', '--cb-fairy-fold-6'];
  var FY_BLOOM = ['--cb-fairy-bloom-1', '--cb-fairy-bloom-2', '--cb-fairy-bloom-3', '--cb-fairy-bloom-4', '--cb-fairy-bloom-5'];
  var FY_BULB = ['--cb-fairy-amber', '--cb-fairy-amber-2', '--cb-fairy-mint', '--cb-fairy-lilac', '--cb-fairy-sky', '--cb-fairy-peach'];
  var FY_SPARK = ['--cb-fairy-spark-1', '--cb-fairy-spark-2', '--cb-fairy-spark-3', '--cb-fairy-spark-4'];
  var FY_FALL = ['--cb-fairy-bloom-2', '--cb-fairy-rose', '--cb-fairy-bloom-5', '--cb-fairy-ember', '--cb-fairy-bloom-2', '--cb-fairy-lichen'];
  function pickOf(a, x) { return a[Math.floor(x * a.length) % a.length]; }
  var fyN = 0;
  function fyStop(grad, offset, opacity, o) {
    var st = document.createElementNS(NS, 'stop');
    st.setAttribute('offset', String(offset));
    st.style.setProperty('stop-color', 'var(' + o.stop + ')');
    st.style.setProperty('stop-opacity', String(opacity));
    grad.appendChild(st);
  }

  /* ONE OF THE YURT'S FAERIES, as yurt-garden.js draws it, in its own box from
     -20 -24 to 20 24 and px tall, dressed by i, so no two are alike. */
  function faerySvg(i, px, o) {
    o = o || {};
    var s = plainSvg(40, 48, 'pf-fx__faery');
    s.setAttribute('viewBox', '-20 -24 40 48');
    s.setAttribute('width', f(px * .83));
    s.setAttribute('height', f(px));
    s.style.overflow = 'visible';
    var tint = pickOf(FY_WING, rnd(i * 7 + 1)), skin = pickOf(FY_SKIN, rnd(i * 7 + 2)), hair = pickOf(FY_HAIR, rnd(i * 7 + 3));
    var c = Math.floor(rnd(i * 7 + 4) * FY_MOSS.length) % FY_MOSS.length, horns = rnd(i * 7 + 5) < .5;
    var b1 = pickOf(FY_BLOOM, rnd(i * 7 + 6)), b2 = pickOf(FY_BLOOM, rnd(i * 7 + 8)), b3 = pickOf(FY_BLOOM, rnd(i * 7 + 9));
    var n = ++fyN, defs = document.createElementNS(NS, 'defs');
    s.appendChild(defs);
    var glow = document.createElementNS(NS, 'radialGradient');
    glow.setAttribute('id', 'pf-fy-glow-' + n);
    fyStop(glow, 0, .5, { stop: tint });
    fyStop(glow, 1, 0, { stop: tint });
    defs.appendChild(glow);
    var g = group(s);
    var halo = svgEl('circle', { cy: -2, r: 17 }, {});
    halo.style.setProperty('fill', 'url(#pf-fy-glow-' + n + ')');
    g.appendChild(halo);
    // the wings, behind everything, beating where the drawings move
    var wings = svgEl('g', { 'fill-opacity': '.45', 'stroke-opacity': '.55' }, { fill: tint, stroke: '--cb-fairy-bloom-3', sw: .5, cls: o.still ? 'art-breathe' : 'fx-fy-flutter', t: o.still ? 4 : .4 + rnd(i + 2) * .3 });
    ['M-1 -6C-9 -18 -17 -14 -14 -7C-12 -3 -6 -3 -1 -4Z', 'M1 -6C9 -18 17 -14 14 -7C12 -3 6 -3 1 -4Z',
      'M-1 -3C-8 -2 -12 4 -8 6C-5 7 -2 2 -1 -1Z', 'M1 -3C8 -2 12 4 8 6C5 7 2 2 1 -1Z'].forEach(function (d) {
      var w = svgEl('path', { d: d }, {});
      w.style.removeProperty('fill');
      wings.appendChild(w);
    });
    g.appendChild(wings);
    // long hair falling behind the cloak
    g.appendChild(svgEl('path', { d: 'M-3.4 -11C-7.5 -5 -8.5 3 -7 12C-5.8 10 -5 12.6 -3.6 10.5L3.6 10.5C5 12.6 5.8 10 7 12C8.5 3 7.5 -5 3.4 -11Z' }, { fill: hair }));
    // the mossy cloak to the ground, with a ragged hem
    g.appendChild(svgEl('path', { d: 'M-2.6 -6C-5 0 -7 8 -7.5 15L-5.5 13.6L-4 15.6L-2 14L0 16L2 14L4 15.6L5.5 13.6L7.5 15C7 8 5 0 2.6 -6Z' }, { fill: FY_MOSS[c] }));
    g.appendChild(svgEl('path', { d: 'M-2 -5C-3.5 1 -4 8 -3.5 14L-2 14L0 16L1 13C1 7 1 0 2 -5Z', opacity: '.6' }, { fill: FY_FOLD[c] }));
    // the posy held in front
    g.appendChild(svgEl('path', { d: 'M0 0L0 5' }, { stroke: '--cb-fairy-moss-2', sw: .7 }));
    g.appendChild(svgEl('circle', { cx: -1.2, cy: -.4, r: 1.3 }, { fill: b1 }));
    g.appendChild(svgEl('circle', { cx: 1.2, cy: -.6, r: 1.3 }, { fill: b2 }));
    g.appendChild(svgEl('circle', { cx: 0, cy: -1.8, r: 1.2 }, { fill: b3 }));
    // the face and the fringe
    g.appendChild(svgEl('circle', { cy: -10, r: 3.1 }, { fill: skin }));
    g.appendChild(svgEl('path', { d: 'M-3.4 -10.4C-3.2 -14 3.2 -14 3.4 -10.4C2 -12 -1 -12.2 -3.4 -10.4Z' }, { fill: hair }));
    if (horns) g.appendChild(svgEl('path', { d: 'M-2 -12.6C-4 -16 -6.5 -15 -5.2 -13.2M2 -12.6C4 -16 6.5 -15 5.2 -13.2' }, { stroke: '--cb-fairy-horn', sw: .9 }));
    // the flower crown
    [[-2.8, -12.2, .95, b1], [-1, -13.1, 1, b2], [1, -13.1, 1, b3], [2.8, -12.2, .95, b1]].forEach(function (cr) {
      g.appendChild(svgEl('circle', { cx: cr[0], cy: cr[1], r: cr[2] }, { fill: cr[3] }));
    });
    return s;
  }

  /* A petal, a leaf, a rose, a daisy and a sparkle, each in a 24 box. */
  M.fypetal = function (g) {
    var q = at(g, 0, 0, 30);
    q.appendChild(svgEl('path', { d: 'M0 -7C4.6 -5 4.6 3 0 7C-4.6 3 -4.6 -5 0 -7Z' }, { fill: '--cb-fairy-bloom-2' }));
    q.appendChild(svgEl('path', { d: 'M0 -4C1.6 -2 1.6 2 0 4' }, { stroke: '--cb-fairy-rose', sw: .8 }));
  };
  function fyRose(g, x, y, r, red) {
    var q = at(g, x, y);
    q.appendChild(svgEl('circle', { r: f(r) }, { fill: red ? '--cb-fairy-rose' : '--cb-fairy-bloom-2', stroke: '--cb-fairy-line', sw: f(Math.max(.5, r * .1)) }));
    q.appendChild(svgEl('path', { d: 'M' + f(-r * .62) + ' ' + f(r * .1) + 'A' + f(r * .64) + ' ' + f(r * .6) + ' 0 1 1 ' + f(r * .6) + ' ' + f(r * .2) }, { stroke: red ? '--cb-fairy-rose-2' : '--cb-fairy-rose', sw: f(Math.max(.5, r * .12)) }));
    q.appendChild(svgEl('path', { d: 'M' + f(-r * .3) + ' ' + f(-r * .05) + 'A' + f(r * .32) + ' ' + f(r * .3) + ' 0 1 0 ' + f(r * .3) + ' ' + f(-r * .1) }, { stroke: red ? '--cb-fairy-rose-2' : '--cb-fairy-rose', sw: f(Math.max(.5, r * .1)) }));
    q.appendChild(svgEl('path', { d: 'M' + f(-r * .05) + ' ' + f(-r * .78) + 'Q' + f(r * .5) + ' ' + f(-r * .9) + ' ' + f(r * .74) + ' ' + f(-r * .36) }, { stroke: '--cb-fairy-glow', sw: f(Math.max(.4, r * .08)), cls: '' }));
    return q;
  }
  function fyDaisy(g, x, y, r) {
    var q = at(g, x, y);
    around(8, function (a) {
      at(q, 0, 0, a).appendChild(svgEl('ellipse', { cx: 0, cy: f(-r * .62), rx: f(r * .24), ry: f(r * .46) }, { fill: '--cb-fairy-bloom-3', stroke: '--cb-fairy-line', sw: f(Math.max(.3, r * .05)) }));
    });
    q.appendChild(svgEl('circle', { r: f(r * .3) }, { fill: '--cb-fairy-bloom-4' }));
    return q;
  }
  M.fyrose = function (g) {
    [[-6, 4, 160], [5, 6, 30]].forEach(function (lf) { at(g, lf[0], lf[1], lf[2]).appendChild(svgEl('path', { d: leaf(5, 2.8) }, { fill: '--cb-fairy-fold-2', stroke: '--cb-fairy-line', sw: .5 })); });
    fyRose(g, 0, -1, 6.4, true);
  };
  M.fydaisy = function (g) {
    at(g, 4, 5, 40).appendChild(svgEl('path', { d: leaf(4.4, 2.2) }, { fill: '--cb-fairy-fold-1', stroke: '--cb-fairy-line', sw: .5 }));
    fyDaisy(g, -1, -1, 7);
  };
  M.fyspark = function (g) {
    g.appendChild(svgEl('path', { d: sparkle(9) }, { fill: '--cb-fairy-spark-1', cls: 'art-twinkle', t: 3.5 }));
    at(g, 7, -7).appendChild(svgEl('path', { d: sparkle(3.6) }, { fill: '--cb-fairy-spark-3', cls: 'art-twinkle', d: 1.2, t: 3.5 }));
    at(g, -7, 6).appendChild(svgEl('path', { d: sparkle(2.6) }, { fill: '--cb-fairy-spark-2', cls: 'art-twinkle', d: 2, t: 3.5 }));
  };

  /* THE STILL PART OVER THE BANNER: one long garland of fairy lights, the
     Fairy Lights theme's own bulbs, draped deep across the banner's right-hand
     part, keeping off the avatar's corner, with a faery sitting where it hangs
     lowest and another hovering by it. */
  function fairyScene() {
    var s = plainSvg(380, 112, 'pf-fx__scene');
    s.removeAttribute('width');
    s.removeAttribute('height');
    var g = group(s), k = 1.3, x0 = 140, x1 = 380, cx = 260, y0 = 4, cy = 78;
    function on(t) { return [(1 - t) * (1 - t) * x0 + 2 * t * (1 - t) * cx + t * t * x1, (1 - t) * (1 - t) * y0 + 2 * t * (1 - t) * cy + t * t * y0]; }
    g.appendChild(svgEl('path', { d: 'M' + x0 + ' ' + y0 + 'Q' + cx + ' ' + cy + ' ' + x1 + ' ' + y0 }, { stroke: '--cb-fairy-wire', sw: 1.5 }));
    for (var j = 0; j < 12; j++) {
      var t = .05 + j * .082, b = on(t), ink = FY_BULB[j % FY_BULB.length], d = (j * .53) % 4;
      if (Math.abs(t - .5) < .05) continue;
      g.appendChild(svgEl('circle', { cx: f(b[0]), cy: f(b[1] + 7.6 * k), r: f(7.4 * k), 'fill-opacity': '.2' }, { fill: ink, cls: 'art-glow', d: d, t: 4.4 }));
      g.appendChild(svgEl('rect', { x: f(b[0] - 1.3 * k), y: f(b[1]), width: f(2.6 * k), height: f(2.2 * k), rx: .5 }, { fill: '--cb-fairy-socket' }));
      g.appendChild(svgEl('ellipse', { cx: f(b[0]), cy: f(b[1] + 5.6 * k), rx: f(2.6 * k), ry: f(3.4 * k) }, { fill: ink, cls: 'art-twinkle', d: d, t: 3.8 }));
      g.appendChild(svgEl('ellipse', { cx: f(b[0] - .8 * k), cy: f(b[1] + 4.4 * k), rx: f(.7 * k), ry: f(1.1 * k), 'fill-opacity': '.75' }, { fill: '--cb-fairy-steel' }));
    }
    [[176, 44, 3.4, 0], [214, 70, 2.4, 1], [322, 64, 3, 2], [366, 34, 2.2, 3], [290, 92, 2.6, 1]].forEach(function (sp, i) {
      at(g, sp[0], sp[1]).appendChild(svgEl('path', { d: sparkle(sp[2]) }, { fill: FY_SPARK[sp[3]], cls: 'art-twinkle', d: i * .7, t: 4 }));
    });
    // a faery sitting where the garland hangs lowest, its hem on the wire,
    // its wings breathing; another hovering by it, wings going
    var low = on(.5), tall = 40, sit = faerySvg(2, tall, { still: true });
    sit.setAttribute('x', f(low[0] - tall * .83 / 2));
    sit.setAttribute('y', f(low[1] - tall * 40 / 48));
    g.appendChild(sit);
    var hov = svgEl('g', {}, { cls: 'fx-bob' });
    hov.style.removeProperty('fill');
    hov.style.setProperty('--b', '4.2s');
    var fly = faerySvg(5, 30);
    fly.setAttribute('x', '334');
    fly.setAttribute('y', '50');
    hov.appendChild(fly);
    g.appendChild(hov);
    return s;
  }

  /* THE FAERIES FLYING ACROSS THE PROFILE, from either side, darting and
     hovering, each dropping petals behind it. A pass of their own, so like
     every pass they are drawn only where the radio's drawings move. */
  function fairyFlight() {
    var box = el('div', 'pf-fx__pass pf-fx__flit'), sizes = [42, 66, 92, 54, 110], n = sizes.length;
    for (var i = 0; i < n; i++) {
      var one = el('span', 'pf-fx__fly'), ltr = i % 2 === 0;
      one.style.left = ltr ? '-10%' : '104%';
      one.style.top = f(10 + 70 * (i + .5) / n + (rnd(i + 31) - .5) * 10) + '%';
      one.style.setProperty('--px', ltr ? '118' : '-118');
      one.style.setProperty('--py', f((rnd(i + 37) - .5) * 30));
      one.style.setProperty('--wy', rnd(i + 41) < .5 ? '1' : '-1');
      one.style.setProperty('--t', '32s');
      one.style.setProperty('--d', f(i * 32 * .9 / n + rnd(i + 43) * 2) + 's');
      var bob = el('span', 'fx-bob');
      bob.style.setProperty('--b', f(2.4 + rnd(i) * 1.4) + 's');
      bob.appendChild(faerySvg(i + 7, sizes[i]));
      one.appendChild(bob);
      for (var k = 0; k < 3; k++) {
        var drop = el('span', 'pf-fx__fy-drop');
        drop.style.left = f(sizes[i] * .3 + (rnd(i * 3 + k + 50) - .5) * 10) + 'px';
        drop.style.setProperty('--d', f(k * 1.1) + 's');
        drop.appendChild(motif('fypetal', 5 + rnd(i * 3 + k) * 3, true));
        one.appendChild(drop);
      }
      box.appendChild(one);
    }
    return box;
  }

  /* ── THE BIG FAIRY, in a box of 300 by 400 standing on the profile's foot ── */
  function bigWing(g, right) {
    var side = group(g, right ? 'matrix(-1,0,0,1,300,0)' : '');
    var beat = svgEl('g', {}, { cls: 'fx-mo-fy-wing' });
    beat.style.removeProperty('fill');
    side.appendChild(beat);
    // the forewing and the hindwing, violet with a pink heart and a teal edge
    var fore = 'M147 146C122 100 74 30 34 32C8 34 2 78 20 112C36 142 92 160 145 160Z';
    var hind = 'M145 166C104 168 52 190 40 230C30 264 56 292 86 280C114 268 134 216 147 180Z';
    beat.appendChild(svgEl('path', { d: fore, 'fill-opacity': '.82' }, { fill: '--cb-fairy-wing-a', stroke: '--cb-fairy-wing-c', sw: 3.2 }));
    beat.appendChild(svgEl('path', { d: hind, 'fill-opacity': '.82' }, { fill: '--cb-fairy-wing-a', stroke: '--cb-fairy-wing-c', sw: 3.2 }));
    beat.appendChild(svgEl('path', { d: 'M143 150C118 116 82 66 52 62C34 62 30 86 44 110C60 134 100 152 141 156Z', 'fill-opacity': '.72' }, { fill: '--cb-fairy-wing-b' }));
    beat.appendChild(svgEl('path', { d: 'M141 172C110 176 70 196 62 228C56 252 72 266 90 258C112 248 130 212 143 184Z', 'fill-opacity': '.72' }, { fill: '--cb-fairy-wing-b' }));
    // the veins, out from the body
    beat.appendChild(svgEl('path', { d: 'M146 152C112 118 72 62 40 42M146 152C104 126 50 92 18 82M146 154C108 142 60 128 24 116M146 156C120 154 92 152 70 150' +
      'M146 172C114 186 76 206 46 228M146 174C120 204 92 246 60 276M146 176C130 210 116 246 98 268' }, { stroke: '--cb-fairy-vein', sw: 1.3 }));
    // spots along the edge, and an eye on the hindwing
    [[38, 40, 3.2], [24, 58, 2.6], [15, 80, 2.2], [14, 100, 1.8], [48, 284, 2.6], [38, 262, 2.2], [36, 240, 1.8]].forEach(function (sp) {
      beat.appendChild(svgEl('circle', { cx: sp[0], cy: sp[1], r: sp[2] }, { fill: '--cb-fairy-bloom-3' }));
    });
    beat.appendChild(svgEl('circle', { cx: 80, cy: 236, r: 10 }, { fill: '--cb-fairy-vein' }));
    beat.appendChild(svgEl('circle', { cx: 80, cy: 236, r: 7 }, { fill: '--cb-fairy-amber' }));
    beat.appendChild(svgEl('circle', { cx: 80, cy: 236, r: 3.4 }, { fill: '--cb-fairy-vein' }));
    beat.appendChild(svgEl('circle', { cx: 78.6, cy: 234.4, r: 1.3 }, { fill: '--cb-fairy-bloom-3' }));
    beat.appendChild(svgEl('path', { d: fore }, { stroke: '--cb-fairy-line', sw: 1.4 }));
    beat.appendChild(svgEl('path', { d: hind }, { stroke: '--cb-fairy-line', sw: 1.4 }));
  }
  // a path mirrored about the middle of the box, x to 300 - x: absolute M, L,
  // C, Q and Z only, which is all it is given
  function mirror(d) {
    return d.replace(/([MLCQZ])([^MLCQZ]*)/g, function (all, cmd, nums) {
      var v = nums.trim().split(/[\s,]+/).filter(Boolean).map(Number), i;
      if (!v.length) return cmd;
      for (i = 0; i < v.length; i += 2) v[i] = 300 - v[i];
      return cmd + v.join(' ');
    });
  }
  function bigFairy() {
    var s = plainSvg(300, 400, 'pf-fx__fairy');
    s.removeAttribute('width');
    s.removeAttribute('height');
    s.setAttribute('preserveAspectRatio', 'xMidYMax meet');
    var g = group(s);
    bigWing(g, false);
    bigWing(g, true);
    var line = '--cb-fairy-line';
    // her hair at the back, falling past her shoulders
    var back = svgEl('g', {}, { cls: 'fx-fy-hair', t: 6 });
    back.style.removeProperty('fill');
    back.appendChild(svgEl('path', { d: 'M128 70C100 82 96 120 100 160C102 184 92 196 96 218C100 238 86 250 76 272C92 268 102 278 108 292C116 278 114 262 120 248C126 232 122 220 126 212' +
      'L174 212C178 220 174 232 180 248C186 262 184 278 192 292C198 278 208 268 224 272C214 250 200 238 204 218C208 196 198 184 200 160C204 120 200 82 172 70Z' }, { fill: '--cb-fairy-auburn', stroke: line, sw: 1.4 }));
    back.appendChild(svgEl('path', { d: 'M110 118C104 150 112 176 104 200C98 222 104 240 90 264M118 146C114 176 120 200 114 226C110 246 116 262 108 284' }, { stroke: '--cb-fairy-hair-1', sw: 1.6 }));
    back.appendChild(svgEl('path', { d: mirror('M110 118C104 150 112 176 104 200C98 222 104 240 90 264M118 146C114 176 120 200 114 226C110 246 116 262 108 284') }, { stroke: '--cb-fairy-hair-1', sw: 1.6 }));
    back.appendChild(svgEl('path', { d: 'M115 102C108 132 116 160 108 188C104 204 108 220 100 236' }, { stroke: '--cb-fairy-auburn-lit', sw: 1.4 }));
    back.appendChild(svgEl('path', { d: mirror('M115 102C108 132 116 160 108 188C104 204 108 220 100 236') }, { stroke: '--cb-fairy-auburn-lit', sw: 1.4 }));
    g.appendChild(back);
    // the cloak of moss, from the shoulders to the ground, with a ragged hem
    g.appendChild(svgEl('path', { d: 'M128 208C118 248 98 300 62 386L70 381L78 393L88 384L98 395L110 386L122 396L134 387L146 397L158 388L170 396L182 386L194 395L206 385L218 393L230 383L238 388C202 300 182 248 172 208Z' }, { fill: '--cb-fairy-moss-1', stroke: line, sw: 1.4 }));
    g.appendChild(svgEl('path', { d: 'M140 220C130 280 116 340 104 388L116 386C124 336 136 276 146 222Z', opacity: '.55' }, { fill: '--cb-fairy-fold-1' }));
    g.appendChild(svgEl('path', { d: 'M164 222C176 280 190 336 204 386L214 388C200 336 182 276 168 220Z', opacity: '.55' }, { fill: '--cb-fairy-fold-1' }));
    g.appendChild(svgEl('path', { d: 'M150 220C148 280 150 340 152 394L160 390C158 336 156 278 154 220Z', opacity: '.5' }, { fill: '--cb-fairy-moss-2' }));
    for (var i = 0; i < 26; i++) {
      var tt = rnd(i + 200), yy = 230 + tt * 156, half = 22 + tt * 84, xx = 150 + (rnd(i + 220) - .5) * 2 * half * .9;
      g.appendChild(svgEl('circle', { cx: f(xx), cy: f(yy), r: f(1 + rnd(i + 240) * 1.6) }, { fill: i % 3 ? '--cb-fairy-lichen' : '--cb-fairy-fold-2' }));
    }
    // little flowers in the moss, more of them at the hem
    [[96, 360, 5, 0], [124, 376, 4, 1], [178, 372, 4.6, 0], [208, 352, 4, 1], [138, 330, 3.6, 0], [170, 310, 3.4, 1], [228, 382, 3.8, 0], [76, 384, 3.6, 1]].forEach(function (fl) {
      if (fl[3]) fyRose(g, fl[0], fl[1], fl[2], true);
      else fyDaisy(g, fl[0], fl[1], fl[2]);
    });
    // tufts of moss along the hem, and two vines trailing down from the posy
    for (var tf = 0; tf < 22; tf++) {
      if (rnd(tf + 290) < .3) continue;
      var hx = 70 + tf * 7.6 + rnd(tf + 260) * 5, hy = 374 + rnd(tf + 270) * 12;
      g.appendChild(svgEl('circle', { cx: f(hx), cy: f(hy), r: f(2 + rnd(tf + 280) * 2.4) }, { fill: tf % 3 ? '--cb-fairy-fold-2' : '--cb-fairy-moss-2' }));
      if (tf % 4 === 1) g.appendChild(svgEl('circle', { cx: f(hx + 1), cy: f(hy - 1), r: 1 }, { fill: '--cb-fairy-lichen' }));
    }
    [['M144 214C130 250 140 290 124 330C116 350 122 366 112 382', -1], ['M156 214C170 252 160 292 178 330C186 348 180 364 190 380', 1]].forEach(function (vn) {
      g.appendChild(svgEl('path', { d: vn[0] }, { stroke: '--cb-fairy-moss-2', sw: 1.6 }));
    });
    [[134, 246, -40], [137, 286, 210], [126, 322, -50], [118, 356, 200], [166, 248, 40], [163, 290, -30], [175, 324, 220], [184, 356, 30]].forEach(function (lf) {
      at(g, lf[0], lf[1], lf[2]).appendChild(svgEl('path', { d: leaf(5.6, 2.6) }, { fill: '--cb-fairy-fold-1', stroke: line, sw: .6 }));
    });
    // the bodice, the neck and the moss over her shoulders
    g.appendChild(svgEl('path', { d: 'M120 140C124 170 126 194 128 214L172 214C174 194 176 170 180 140C166 148 134 148 120 140Z' }, { fill: '--cb-fairy-moss-1', stroke: line, sw: 1.4 }));
    g.appendChild(svgEl('path', { d: 'M142 114L142 134C136 139 128 139 120 140C134 150 166 150 180 140C172 139 164 139 158 134L158 114Z' }, { fill: '--cb-fairy-fae', stroke: line, sw: 1.2 }));
    g.appendChild(svgEl('path', { d: 'M142 118Q150 126 158 118L158 128Q150 132 142 128Z', opacity: '.6' }, { fill: '--cb-fairy-fae-2' }));
    // a shawl of moss over her shoulders, open at the front, hanging in strands
    var shawl = 'M121 137C104 141 95 160 95 184C95 204 99 222 103 238L107 229L110 242L114 231L118 246L121 233L125 242C128 222 130 202 130 184C128 166 127 150 121 137Z';
    [shawl, mirror(shawl)].forEach(function (d) { g.appendChild(svgEl('path', { d: d }, { fill: '--cb-fairy-moss-2', stroke: line, sw: 1.2 })); });
    [[101, 196, 106, 232], [108, 190, 112, 238], [116, 194, 119, 240], [123, 188, 124, 234]].forEach(function (st) {
      [[st[0], st[1], st[2], st[3]], [300 - st[0], st[1], 300 - st[2], st[3]]].forEach(function (q) {
        g.appendChild(svgEl('path', { d: 'M' + q[0] + ' ' + q[1] + 'Q' + (q[0] + (q[2] - q[0]) * .2 + 1.5) + ' ' + ((q[1] + q[3]) / 2) + ' ' + q[2] + ' ' + q[3] }, { stroke: '--cb-fairy-fold-1', sw: 1.1 }));
      });
    });
    [[106, 150], [112, 170], [104, 184], [194, 150], [188, 170], [196, 184], [134, 160], [166, 166], [150, 150]].forEach(function (lc, j) {
      g.appendChild(svgEl('circle', { cx: lc[0], cy: lc[1], r: j % 2 ? 1.6 : 2.2 }, { fill: j % 2 ? '--cb-fairy-lichen' : '--cb-fairy-fold-1' }));
    });
    // the posy: stems down the front, her hands round them, the roses above
    g.appendChild(svgEl('path', { d: 'M146 196C144 214 142 232 138 250M150 198C150 218 150 236 150 256M154 196C156 214 160 230 164 246' }, { stroke: '--cb-fairy-moss-2', sw: 2 }));
    [[132, 238, 200], [166, 236, -20], [146, 262, 100]].forEach(function (lf) {
      at(g, lf[0], lf[1], lf[2]).appendChild(svgEl('path', { d: leaf(8, 3.6) }, { fill: '--cb-fairy-fold-2', stroke: line, sw: .8 }));
    });
    [[141, 206, -18], [159, 206, 18]].forEach(function (h) {
      at(g, h[0], h[1], h[2]).appendChild(svgEl('ellipse', { rx: 8.5, ry: 6.4 }, { fill: '--cb-fairy-fae', stroke: line, sw: 1.1 }));
    });
    [[124, 186, 210], [176, 182, -30], [132, 172, 240], [170, 168, -60], [150, 166, 270]].forEach(function (lf) {
      at(g, lf[0], lf[1], lf[2]).appendChild(svgEl('path', { d: leaf(9, 4) }, { fill: '--cb-fairy-fold-2', stroke: line, sw: .8 }));
    });
    fyRose(g, 138, 186, 9.5, true);
    fyRose(g, 160, 182, 8.6, false);
    fyRose(g, 150, 196, 8.4, true);
    fyRose(g, 168, 196, 6.4, false);
    fyRose(g, 130, 197, 6.2, false);
    fyDaisy(g, 149, 175, 5.6);
    [[124, 176], [178, 174], [144, 172], [172, 204], [128, 206]].forEach(function (b) {
      g.appendChild(svgEl('circle', { cx: b[0], cy: b[1], r: 1.6 }, { fill: '--cb-fairy-bloom-3', stroke: line, sw: .4 }));
    });
    // her face, tilted a little, her eyes shut
    var head = svgEl('g', { transform: 'rotate(-6 150 96)' });
    head.style.removeProperty('fill');
    head.appendChild(svgEl('path', { d: 'M132.4 96L121 82L133.6 106Z' }, { fill: '--cb-fairy-fae', stroke: line, sw: 1.1 }));
    head.appendChild(svgEl('path', { d: mirror('M132.4 96L121 82L133.6 106Z') }, { fill: '--cb-fairy-fae', stroke: line, sw: 1.1 }));
    head.appendChild(svgEl('ellipse', { cx: 150, cy: 96, rx: 19, ry: 24 }, { fill: '--cb-fairy-fae', stroke: line, sw: 1.3 }));
    head.appendChild(svgEl('path', { d: 'M163 84C170 96 168 112 156 120C164 108 166 96 163 84Z', opacity: '.5' }, { fill: '--cb-fairy-fae-2' }));
    [[139, 106], [161, 106]].forEach(function (b) { head.appendChild(svgEl('ellipse', { cx: b[0], cy: b[1], rx: 5, ry: 3, opacity: '.5' }, { fill: '--cb-fairy-blush' })); });
    head.appendChild(svgEl('path', { d: 'M137 99Q142 103 147 99M153 99Q158 103 163 99' }, { stroke: line, sw: 1.5 }));
    head.appendChild(svgEl('path', { d: 'M138 100.4L136.4 103M141 101.6L140.4 104.4M159 101.6L159.6 104.4M162 100.4L163.6 103' }, { stroke: line, sw: .9 }));
    head.appendChild(svgEl('path', { d: 'M137 91Q142 88 147 90M153 90Q158 88 163 91' }, { stroke: '--cb-fairy-hair-1', sw: 1.1 }));
    head.appendChild(svgEl('path', { d: 'M150 101Q148 107 151 109' }, { stroke: '--cb-fairy-fae-2', sw: 1.1 }));
    head.appendChild(svgEl('path', { d: 'M144 113Q150 117 156 113Q150 115.6 144 113Z' }, { fill: '--cb-fairy-blush', stroke: '--cb-fairy-rose-2', sw: 1 }));
    // the fringe and the locks falling in front of her shoulders
    var front = svgEl('g', {}, { cls: 'fx-fy-hair', d: .8, t: 7 });
    front.style.removeProperty('fill');
    front.appendChild(svgEl('path', { d: 'M130 86C133 66 167 64 171 84C162 75 152 77 145 88C141 81 135 81 130 86Z' }, { fill: '--cb-fairy-auburn', stroke: line, sw: 1.1 }));
    var lock = 'M131 82C121 100 128 118 122 136C116 154 124 170 116 188C112 198 118 206 112 216C124 210 130 198 128 184C126 168 134 152 132 136C130 118 134 102 137 92Z';
    front.appendChild(svgEl('path', { d: lock }, { fill: '--cb-fairy-auburn', stroke: line, sw: 1.1 }));
    front.appendChild(svgEl('path', { d: mirror(lock) }, { fill: '--cb-fairy-auburn', stroke: line, sw: 1.1 }));
    front.appendChild(svgEl('path', { d: 'M129 104C125 120 129 134 124 150C120 164 125 178 120 194M171 104C175 120 171 134 176 150C180 164 175 178 180 194M140 72C150 69 160 70 166 76' }, { stroke: '--cb-fairy-auburn-lit', sw: 1.2 }));
    head.appendChild(front);
    // two little curled horns, and the crown of roses
    var horn = 'M138 72C129 57 112 55 112 67C112 76 122 77 124 70';
    head.appendChild(svgEl('path', { d: horn }, { stroke: line, sw: 6 }));
    head.appendChild(svgEl('path', { d: horn }, { stroke: '--cb-fairy-horn', sw: 4 }));
    head.appendChild(svgEl('path', { d: mirror(horn) }, { stroke: line, sw: 6 }));
    head.appendChild(svgEl('path', { d: mirror(horn) }, { stroke: '--cb-fairy-horn', sw: 4 }));
    [[124, 84, 230], [133, 72, 250], [167, 72, -70], [176, 84, -50], [150, 64, 270]].forEach(function (lf) {
      at(head, lf[0], lf[1], lf[2]).appendChild(svgEl('path', { d: leaf(7, 3) }, { fill: '--cb-fairy-fold-2', stroke: line, sw: .7 }));
    });
    fyRose(head, 128, 80, 6.6, true);
    fyRose(head, 140, 70, 6, false);
    fyRose(head, 152, 66, 7.4, true);
    fyRose(head, 164, 70, 6, false);
    fyRose(head, 173, 80, 6.4, true);
    fyDaisy(head, 134, 75, 4);
    fyDaisy(head, 168, 75, 4);
    g.appendChild(head);
    return s;
  }

  function fairyMoment() {
    var box = el('div', 'pf-fx__moment');
    // the dusk over the whole profile, purple at the top and rose at the foot
    var n = ++fyN, dusk = plainSvg(100, 100, 'pf-fx__fy-dusk');
    dusk.removeAttribute('width');
    dusk.removeAttribute('height');
    dusk.setAttribute('preserveAspectRatio', 'none');
    var defs = document.createElementNS(NS, 'defs'), lg = document.createElementNS(NS, 'linearGradient');
    lg.setAttribute('id', 'pf-fy-dusk-' + n);
    lg.setAttribute('x1', '0'); lg.setAttribute('x2', '0'); lg.setAttribute('y1', '0'); lg.setAttribute('y2', '1');
    fyStop(lg, 0, .78, { stop: '--cb-fairy-dusk' });
    fyStop(lg, .55, .5, { stop: '--cb-fairy-dusk' });
    fyStop(lg, 1, .42, { stop: '--cb-fairy-blush' });
    defs.appendChild(lg);
    dusk.appendChild(defs);
    var wash = svgEl('rect', { x: 0, y: 0, width: 100, height: 100 }, {});
    wash.style.setProperty('fill', 'url(#pf-fy-dusk-' + n + ')');
    dusk.appendChild(wash);
    box.appendChild(dusk);
    // the pink light she comes up in
    var glow = plainSvg(100, 100, 'pf-fx__fy-glow');
    glow.removeAttribute('width');
    glow.removeAttribute('height');
    glow.setAttribute('preserveAspectRatio', 'none');
    glow.appendChild(svgEl('ellipse', { cx: 50, cy: 58, rx: 44, ry: 46, 'fill-opacity': '.5' }, { fill: '--cb-fairy-glow' }));
    glow.appendChild(svgEl('ellipse', { cx: 50, cy: 46, rx: 20, ry: 22, 'fill-opacity': '.6' }, { fill: '--cb-fairy-wing-b' }));
    box.appendChild(glow);
    // sparkles along the top of the profile, like a crown over it
    for (var i = 0; i < 16; i++) {
      var sp = el('span', 'pf-fx__fy-spark');
      sp.style.left = f(2 + i * 6.1 + rnd(i + 90) * 3) + '%';
      sp.style.top = f(1 + Math.abs(Math.sin(i * 1.3)) * 9 + rnd(i + 95) * 4) + '%';
      sp.style.setProperty('--d', f(rnd(i + 99) * 1.4) + 's');
      var px = 10 + rnd(i + 105) * 22, ss = plainSvg(24, 24);
      ss.setAttribute('viewBox', '-12 -12 24 24');
      ss.setAttribute('width', f(px));
      ss.setAttribute('height', f(px));
      ss.style.overflow = 'visible';
      ss.appendChild(svgEl('path', { d: sparkle(11) }, { fill: FY_SPARK[i % FY_SPARK.length] }));
      if (i % 3 === 0) ss.appendChild(svgEl('path', { d: sparkle(4), transform: 'translate(9 9)' }, { fill: FY_SPARK[(i + 2) % FY_SPARK.length] }));
      sp.appendChild(ss);
      box.appendChild(sp);
    }
    // the fairy, standing on the profile's foot
    var stand = el('div', 'pf-fx__fy-stand');
    stand.appendChild(bigFairy());
    box.appendChild(stand);
    // petals and leaves falling round her, over the whole profile
    for (var k = 0; k < 18; k++) {
      var fall = el('span', 'pf-fx__fy-fall');
      fall.style.left = f(3 + rnd(k + 300) * 92) + '%';
      fall.style.top = f(-6 + rnd(k + 310) * 14) + '%';
      fall.style.setProperty('--d', f(rnd(k + 320) * 2.6) + 's');
      fall.style.setProperty('--sx', f((rnd(k + 330) - .5) * 24));
      fall.style.setProperty('--rot', f(90 + rnd(k + 340) * 220) + 'deg');
      var ps = plainSvg(24, 24), big = 9 + rnd(k + 350) * 9, ink = FY_FALL[k % FY_FALL.length];
      ps.setAttribute('viewBox', '-12 -12 24 24');
      ps.setAttribute('width', f(big));
      ps.setAttribute('height', f(big));
      ps.style.overflow = 'visible';
      if (k % 4 === 3) ps.appendChild(svgEl('path', { d: leaf(9, 5) }, { fill: ink, stroke: '--cb-fairy-line', sw: .6 }));
      else ps.appendChild(svgEl('path', { d: 'M0 -8C5 -6 5 3 0 8C-5 3 -5 -6 0 -8Z' }, { fill: ink }));
      fall.appendChild(ps);
      box.appendChild(fall);
    }
    // three of the yurt's faeries flying out from her wings
    [[-40, -22], [36, -30], [-30, 18]].forEach(function (o, j) {
      var out = el('span', 'pf-fx__fy-out');
      out.style.setProperty('--px', f(o[0]));
      out.style.setProperty('--py', f(o[1]));
      out.style.setProperty('--d', f(j * .5) + 's');
      out.appendChild(faerySvg(20 + j, 30 + j * 6));
      box.appendChild(out);
    });
    return box;
  }
  E.fairy = {
    scene: function (box) {
      box.appendChild(fairyScene());
      box.appendChild(fairyFlight());
      box.appendChild(fairyMoment());
    },
    edge: [['fyrose', 'tl', 0, 30, -10, [16, 14]], ['fyspark', 'top', .58, 16], ['fydaisy', 'bl', 0, 24, 0, [16, -14]], ['fyrose', 'br', 0, 26, 20, [-16, -14]], ['fyspark', 'right', .45, 13]],
    pass: { motif: 'fypetal', from: 'top', n: 7, size: 14, t: 28, drift: 14 }
  };
  /* effect:fairy:end */

  /* ── FOR AN EFFECT DRAWN IN A PALETTE OF ITS OWN ─────────────────────────
     Its defs: a gradient, a fade in from the left, a clip and a blur, each with
     an id of its own, so that two profiles on one page never share one. A
     gradient's stop names its ink like a fill, { stop: '--ink' }, so
     make-profile.py reads it with the rest. The fade is an alpha mask, so only
     its stops' opacity counts, and its ink is the card's own case. */
  var fxN = 0;
  function fxSvg(w, h, cls, aspect) {
    var s = plainSvg(w, h, cls);
    s.removeAttribute('width');
    s.removeAttribute('height');
    if (aspect) s.setAttribute('preserveAspectRatio', aspect);
    return s;
  }
  function fxDefs(s) { var d = document.createElementNS(NS, 'defs'); s.appendChild(d); return d; }
  function fxMade(defs, tag, kind) {
    var e = document.createElementNS(NS, tag);
    e.setAttribute('id', 'pf-' + kind + '-' + (++fxN));
    defs.appendChild(e);
    return e;
  }
  function fxUrl(e) { return 'url(#' + e.getAttribute('id') + ')'; }
  // where is [x1, y1, x2, y2] for a line or [cx, cy, r] for a circle, and each
  // stop is [offset, opacity, { stop: '--ink' }]
  function fxGrad(defs, where, stops, user) {
    var g = fxMade(defs, where.length === 3 ? 'radialGradient' : 'linearGradient', 'grad');
    (where.length === 3 ? ['cx', 'cy', 'r'] : ['x1', 'y1', 'x2', 'y2']).forEach(function (nm, i) { g.setAttribute(nm, String(where[i])); });
    if (user) g.setAttribute('gradientUnits', 'userSpaceOnUse');
    stops.forEach(function (st) {
      var e = document.createElementNS(NS, 'stop');
      e.setAttribute('offset', String(st[0]));
      e.style.setProperty('stop-color', 'var(' + st[2].stop + ')');
      e.style.setProperty('stop-opacity', String(st[1]));
      g.appendChild(e);
    });
    return fxUrl(g);
  }
  function paint(e, url) { e.style.setProperty('fill', url); return e; }
  // a scene fading in from the left across the banner, so that it is not a box
  // laid on somebody's banner, and leaving the avatar's corner be
  function fxFade(defs, x0, x1, w, h) {
    var m = fxMade(defs, 'mask', 'fade');
    m.setAttribute('maskUnits', 'userSpaceOnUse');
    m.setAttribute('x', '0'); m.setAttribute('y', '-60'); m.setAttribute('width', String(w)); m.setAttribute('height', String(h + 120));
    m.style.setProperty('mask-type', 'alpha');
    m.appendChild(paint(svgEl('rect', { x: 0, y: -60, width: w, height: h + 120 }, {}),
      fxGrad(defs, [x0, 0, x1, 0], [[0, 0, { stop: '--cb-case' }], [1, 1, { stop: '--cb-case' }]], true)));
    return fxUrl(m);
  }
  function fxClip(defs, x, y, w, h) {
    var c = fxMade(defs, 'clipPath', 'clip');
    c.appendChild(svgEl('rect', { x: f(x), y: f(y), width: f(w), height: f(h) }, {}));
    return fxUrl(c);
  }
  function fxBlur(defs, sd) {
    var b = fxMade(defs, 'filter', 'blur');
    b.setAttribute('x', '-50%'); b.setAttribute('y', '-50%'); b.setAttribute('width', '200%'); b.setAttribute('height', '200%');
    var gb = document.createElementNS(NS, 'feGaussianBlur');
    gb.setAttribute('stdDeviation', String(sd));
    b.appendChild(gb);
    return fxUrl(b);
  }
  function k3(n) { return String(Math.round(n * 1000) / 1000); }
  function scaled(parent, x, y, k) { return group(parent, 'translate(' + f(x) + ' ' + f(y) + ') scale(' + k3(k) + ')'); }
  // A GROUP THAT TURNS ABOUT x y: a box round that point, wider than anything
  // drawn in it, keeps the point the group's middle, so transform-origin:
  // center turns it there. It is drawn into in its parent's own coordinates.
  function pivot(parent, x, y, r, cls, d) {
    var g = svgEl('g', {}, { cls: cls || '', d: d });
    g.style.removeProperty('fill');
    at(parent, x, y).appendChild(g);
    g.appendChild(svgEl('rect', { x: -r, y: -r, width: 2 * r, height: 2 * r }, {}));
    return group(g, 'translate(' + f(-x) + ' ' + f(-y) + ')');
  }
  // a part of an opening, placed on the profile in per cent, on its own clock
  function fxSpan(box, cls, left, top, d) {
    var s = el('span', cls);
    s.style.left = f(left) + '%';
    s.style.top = f(top) + '%';
    if (d != null) s.style.setProperty('--d', f(d) + 's');
    box.appendChild(s);
    return s;
  }
  // a small mark in a span, in a box from -12 -12 to 12 12, px wide
  function tiny(px) {
    var s = plainSvg(24, 24);
    s.setAttribute('viewBox', '-12 -12 24 24');
    s.setAttribute('width', f(px));
    s.setAttribute('height', f(px));
    s.style.overflow = 'visible';
    return s;
  }

  /* effect:wolf:begin */
  /* HOWLING WOLF (Ryan, 2026-10-19: "a wolf raising its head and howling at
     the moon"). Drawn in its own --pfx-wolf-* inks, declared in love.css, and
     make-profile.py holds this block to them: a full moon is a light no card's
     seven inks can be relied on for. The wolf is our own, drawn here after
     nobody's emblem; it sits, raises its head and howls, and it threatens
     nobody: no tooth is bared and nothing is hunted. Nothing makes a sound.

     The still part is a night over the banner's right-hand part: stars, the
     full moon in its halo with thin cloud across its foot, a far ridge of
     pines, and the wolf sitting on a crag with its head raised against the
     moon, lit along its front by it. Where drawings move, it lowers its head
     and raises it again every sixteen seconds and howls, the howl going out
     towards the moon in soft rings, and the cloud drifts. The opening, on the
     Lagoon's sixty-second clock: the night comes up over the profile, the moon
     rises behind the crag, the wolf on it raises its head and howls, two
     wolves on the far ridge answer, and it all fades, about nine seconds of
     every sixty. The pass is cloud drifting across the moonlight. */
  // ITS HEAD, the muzzle along x from the back of its skull at 0 0, the mouth
  // open; and, when howl is given, its howl going out from the muzzle in rings.
  function wolfHead(h, rw, howl, step, d0) {
    h.appendChild(svgEl('path', { d: 'M12 -15L18 -27L21 -13Z' }, { fill: '--pfx-wolf-fur' }));
    h.appendChild(svgEl('path', { d: 'M-4 -1L-11 2L-4 4L-9 9L0 6.4L-2 11L6 7.4Z' }, { fill: '--pfx-wolf-fur' }));
    h.appendChild(svgEl('path', { d: 'M27.4 -.8L40.6 -3L37.6 2.6L23.4 1.4Z' }, { fill: '--pfx-wolf-ridge' }));
    h.appendChild(svgEl('path', { d: 'M4 7C-2 6 -5 1 -5 -5C-5 -12 1 -17 9 -17C14 -17 18 -15 21 -12L40 -6.4C42.4 -5.8 42.6 -3.6 40.6 -3L28 -.6C24 2 16 6 10 7Z' }, { fill: '--pfx-wolf-fur' }));
    h.appendChild(svgEl('path', { d: 'M24 1.2L37.6 2.6C39 2.9 38.8 4.6 37.4 4.8L20 6.4Z' }, { fill: '--pfx-wolf-fur' }));
    h.appendChild(svgEl('path', { d: 'M3 -14L11 -28L14 -15Z' }, { fill: '--pfx-wolf-fur' }));
    h.appendChild(svgEl('path', { d: 'M6.4 -15L10.6 -24L12 -15.4Z', 'fill-opacity': '.8' }, { fill: '--pfx-wolf-fur-2' }));
    h.appendChild(svgEl('ellipse', { cx: 41, cy: -4.8, rx: 1.9, ry: 1.5 }, { fill: '--pfx-wolf-ridge' }));
    h.appendChild(svgEl('path', { d: 'M15 -10.6Q17.2 -12 19.6 -10.8' }, { stroke: '--pfx-wolf-ridge', sw: rw * .9 }));
    // the moon's light along its brow and nose, and the edge of its ear
    h.appendChild(svgEl('path', { d: 'M9 -17C14 -17 18 -15 21 -12L40 -6.4', 'stroke-opacity': '.9' }, { stroke: '--pfx-wolf-rim', sw: rw }));
    h.appendChild(svgEl('path', { d: 'M11 -28L14 -15', 'stroke-opacity': '.8' }, { stroke: '--pfx-wolf-rim', sw: rw * .7 }));
    if (howl) for (var i = 0; i < 3; i++) {
      var x = 48 + i * 6;
      h.appendChild(svgEl('path', { d: 'M' + x + ' -12Q' + (x + 5) + ' -4.6 ' + x + ' 2.8', 'stroke-opacity': '.6' }, { stroke: '--pfx-wolf-halo', sw: rw * 1.3, cls: howl, d: (d0 || 0) + i * step }));
    }
  }
  // A WOLF SITTING, facing right, its rump on the ground at x y, about 120 tall
  // at k 1 with its head raised. Its neck and head turn about its shoulders
  // (o.nod), so that it can lower its head and raise it again.
  function wolfSits(g, x, y, k, o) {
    o = o || {};
    var w = scaled(g, x, y, k), rw = o.rw || Math.max(1, .8 / k);
    w.appendChild(svgEl('path', { d: 'M6 -5C-4 -3 -16 -1 -25 -7C-29 -10 -28 -15 -23 -14C-16 -11 -6 -11 4 -13Z' }, { fill: '--pfx-wolf-fur' }));
    w.appendChild(svgEl('path', { d: 'M42 -30L42 -3Q42 0 45 0L49 0Q51 0 50 -2L48 -30Z' }, { fill: '--pfx-wolf-fur' }));
    w.appendChild(svgEl('ellipse', { cx: 13, cy: -16, rx: 15, ry: 15.5 }, { fill: '--pfx-wolf-fur' }));
    w.appendChild(svgEl('path', { d: 'M2 -9C0 -30 10 -48 24 -58L38 -64C46 -56 48 -42 46 -30L40 -14C30 -6 14 -4 2 -9Z' }, { fill: '--pfx-wolf-fur' }));
    w.appendChild(svgEl('ellipse', { cx: 23, cy: -2.2, rx: 8, ry: 2.6 }, { fill: '--pfx-wolf-fur' }));
    w.appendChild(svgEl('path', { d: 'M35 -30L35 -3Q35 0 38 0L43 0Q45 0 44 -2L42 -30Z' }, { fill: '--pfx-wolf-fur' }));
    w.appendChild(svgEl('path', { d: 'M38 -60C45 -52 47 -40 45 -31L41 -26C41 -38 39 -49 34 -56Z', 'fill-opacity': '.85' }, { fill: '--pfx-wolf-fur-2' }));
    w.appendChild(svgEl('path', { d: 'M5 -26C8 -32 14 -34 20 -32' }, { stroke: '--pfx-wolf-fur-2', sw: rw }));
    // the moon's light down its chest and the fronts of its legs
    w.appendChild(svgEl('path', { d: 'M41 -61C46 -55 48 -42 46 -31', 'stroke-opacity': '.85' }, { stroke: '--pfx-wolf-rim', sw: rw }));
    w.appendChild(svgEl('path', { d: 'M44 -27L44 -3', 'stroke-opacity': '.45' }, { stroke: '--pfx-wolf-rim', sw: rw * .7 }));
    var neck = pivot(w, 31, -60, 96, o.nod, o.d);
    neck.appendChild(svgEl('path', { d: 'M19 -54C21 -68 26 -80 31 -88L48 -82C47 -72 46 -64 42 -58Z' }, { fill: '--pfx-wolf-fur' }));
    neck.appendChild(svgEl('path', { d: 'M46 -80L53 -74L46 -71L52 -65L45 -63L48 -58L41 -59Z' }, { fill: '--pfx-wolf-fur' }));
    neck.appendChild(svgEl('path', { d: 'M47 -80C47.4 -72 47 -66 44 -60', 'stroke-opacity': '.85' }, { stroke: '--pfx-wolf-rim', sw: rw }));
    wolfHead(at(neck, 35, -86, -54), rw, o.howl, o.step || .8, o.d);
  }
  function wolfMoon(g, cx, cy, r, defs) {
    var halo = svgEl('g', {}, { cls: 'fx-breathe', t: 10 });
    halo.style.removeProperty('fill');
    halo.style.setProperty('filter', fxBlur(defs, f(r * .22)));
    halo.appendChild(svgEl('circle', { cx: cx, cy: cy, r: f(r * 1.8), 'fill-opacity': '.12' }, { fill: '--pfx-wolf-halo' }));
    halo.appendChild(svgEl('circle', { cx: cx, cy: cy, r: f(r * 1.35), 'fill-opacity': '.2' }, { fill: '--pfx-wolf-halo' }));
    g.appendChild(halo);
    g.appendChild(svgEl('circle', { cx: cx, cy: cy, r: r }, { fill: '--pfx-wolf-moon' }));
    [[-.32, -.24, .26, .19], [.26, .24, .3, .21], [-.1, .44, .17, .12], [.4, -.36, .14, .11], [-.52, .14, .1, .08]].forEach(function (m) {
      g.appendChild(svgEl('ellipse', { cx: f(cx + m[0] * r), cy: f(cy + m[1] * r), rx: f(m[2] * r), ry: f(m[3] * r), 'fill-opacity': '.7' }, { fill: '--pfx-wolf-mare' }));
    });
  }
  // a pine, its foot at x base, h tall; rim, the moon's light down its right side
  function wolfPine(g, x, base, h, rim) {
    var w = h * .42, P = function (dx, dy) { return f(x + dx) + ' ' + f(base - dy); };
    g.appendChild(svgEl('path', { d: 'M' + P(0, h) + 'L' + P(w * .55, h * .55) + 'L' + P(w * .3, h * .55) + 'L' + P(w, h * .1) + 'L' + P(-w, h * .1) + 'L' + P(-w * .3, h * .55) + 'L' + P(-w * .55, h * .55) + 'Z' }, { fill: '--pfx-wolf-pine' }));
    g.appendChild(svgEl('rect', { x: f(x - h * .04), y: f(base - h * .12), width: f(h * .08), height: f(h * .12) }, { fill: '--pfx-wolf-pine' }));
    if (rim) g.appendChild(svgEl('path', { d: 'M' + P(0, h) + 'L' + P(w * .55, h * .55) + 'M' + P(w * .3, h * .55) + 'L' + P(w, h * .1), 'stroke-opacity': '.6' }, { stroke: '--pfx-wolf-halo', sw: rim }));
  }
  function wolfScene() {
    var s = fxSvg(380, 112, 'pf-fx__scene'), defs = fxDefs(s), g = group(s), i;
    g.setAttribute('mask', fxFade(defs, 132, 196, 380, 112));
    g.appendChild(svgEl('rect', { x: 130, y: 0, width: 250, height: 112 }, { fill: '--pfx-wolf-night' }));
    g.appendChild(paint(svgEl('rect', { x: 130, y: 36, width: 250, height: 76 }, {}),
      fxGrad(defs, [0, 0, 0, 1], [[0, 0, { stop: '--pfx-wolf-dusk' }], [1, .95, { stop: '--pfx-wolf-dusk' }]])));
    for (i = 0; i < 26; i++) {
      var sx = 140 + rnd(i + 200) * 238, sy = 3 + rnd(i + 230) * 62;
      if (Math.hypot(sx - 332, sy - 36) < 40 || (sy > 58 && sx > 250)) continue;
      g.appendChild(svgEl('circle', { cx: f(sx), cy: f(sy), r: f(.45 + rnd(i + 260) * .8) }, { fill: '--pfx-wolf-star', cls: i % 3 ? '' : 'art-twinkle', d: i * .6 % 5, t: 5 }));
    }
    wolfMoon(g, 332, 36, 25, defs);
    var cloud = svgEl('g', {}, { cls: 'fx-drift', t: 38 });
    cloud.style.removeProperty('fill');
    [[310, 53, 28, 2.4], [350, 58, 20, 2], [296, 61, 16, 1.8], [366, 47, 12, 1.4]].forEach(function (c) {
      cloud.appendChild(svgEl('ellipse', { cx: c[0], cy: c[1], rx: c[2], ry: c[3], 'fill-opacity': '.85' }, { fill: '--pfx-wolf-cloud' }));
    });
    g.appendChild(cloud);
    g.appendChild(svgEl('path', { d: 'M130 92C160 84 190 88 214 82C238 76 258 86 280 84C304 82 330 88 352 80C364 76 374 80 380 82V112H130Z' }, { fill: '--pfx-wolf-ridge' }));
    [[164, 88, 9], [174, 87, 12], [184, 87, 8], [226, 81, 10], [238, 80, 13], [250, 82, 9], [362, 79, 11], [372, 80, 8]].forEach(function (p) { wolfPine(g, p[0], p[1], p[2]); });
    // the crag the wolf sits on, its top lit by the moon
    g.appendChild(svgEl('path', { d: 'M256 112C260 100 268 90 279 86L291 81L330 80C340 80 348 84 356 92C366 98 374 104 380 106V112Z' }, { fill: '--pfx-wolf-rock' }));
    g.appendChild(svgEl('path', { d: 'M280 86L291 81.4L330 80.4C340 80.4 348 84 356 92', 'stroke-opacity': '.7' }, { stroke: '--pfx-wolf-rim', sw: .9 }));
    g.appendChild(svgEl('path', { d: 'M300 89L306 98M322 87L317 101M342 92L348 104' }, { stroke: '--pfx-wolf-ridge', sw: .8 }));
    wolfSits(g, 296, 81, .46, { nod: 'fx-wf-nod', howl: 'fx-wf-howl', step: .8 });
    return s;
  }
  function wolfMoment() {
    var box = el('div', 'pf-fx__moment'), i;
    var night = fxSvg(100, 100, 'pf-fx__wf-night', 'none'), nd = fxDefs(night);
    night.appendChild(paint(svgEl('rect', { x: 0, y: 0, width: 100, height: 100 }, {}),
      fxGrad(nd, [0, 0, 0, 1], [[0, .95, { stop: '--pfx-wolf-night' }], [.55, .9, { stop: '--pfx-wolf-night' }], [1, .9, { stop: '--pfx-wolf-dusk' }]])));
    box.appendChild(night);
    for (i = 0; i < 26; i++) {
      var st = fxSpan(box, 'pf-fx__wf-star', 2 + rnd(i + 400) * 94, 2 + rnd(i + 430) * 56, rnd(i + 460) * 1.6);
      var ts = tiny(4 + rnd(i + 490) * 9);
      ts.appendChild(svgEl('path', { d: sparkle(i % 4 ? 5 : 10) }, { fill: '--pfx-wolf-star' }));
      st.appendChild(ts);
    }
    // the far ridge across the foot of the profile, and two wolves on it who answer
    var ridge = fxSvg(400, 90, 'pf-fx__wf-ridge', 'xMidYMax slice'), r = group(ridge);
    r.appendChild(svgEl('path', { d: 'M0 52C40 40 80 46 120 38C160 30 190 44 230 42C270 40 300 50 340 40C366 34 386 38 400 42V90H0Z' }, { fill: '--pfx-wolf-ridge' }));
    [[20, 50, 16], [34, 48, 22], [150, 37, 18], [166, 38, 24], [182, 40, 14], [300, 46, 20], [316, 44, 16], [380, 39, 22]].forEach(function (p) { wolfPine(r, p[0], p[1], p[2], .5); });
    wolfSits(r, 66, 44.4, .15, { nod: 'fx-mo-wf-far', howl: 'fx-mo-wf-farhowl', step: .5, rw: 2.4 });
    wolfSits(r, 94, 42.4, .13, { nod: 'fx-mo-wf-far', howl: 'fx-mo-wf-farhowl', step: .5, d: .6, rw: 2.6 });
    box.appendChild(ridge);
    // the moon, the crag and the wolf, at the profile's bottom right
    var big = fxSvg(300, 340, 'pf-fx__wf-crag', 'xMaxYMax meet'), bd = fxDefs(big), b = group(big);
    var moon = svgEl('g', {}, { cls: 'fx-mo-wf-moon' });
    moon.style.removeProperty('fill');
    wolfMoon(moon, 196, 112, 70, bd);
    b.appendChild(moon);
    b.appendChild(svgEl('path', { d: 'M-40 340C-20 322 20 306 58 302L170 296C204 296 236 308 258 326L272 340Z' }, { fill: '--pfx-wolf-rock' }));
    b.appendChild(svgEl('path', { d: 'M58 302L170 296.6C204 296.6 236 308 258 326', 'stroke-opacity': '.7' }, { stroke: '--pfx-wolf-rim', sw: 2 }));
    b.appendChild(svgEl('path', { d: 'M110 306L124 330M190 302L180 334M232 316L246 338' }, { stroke: '--pfx-wolf-ridge', sw: 2 }));
    wolfSits(b, 104, 300, 1.55, { nod: 'fx-mo-wf-nod', howl: 'fx-mo-wf-howl', step: .55 });
    box.appendChild(big);
    return box;
  }
  M.wstar = function (g) {
    g.appendChild(svgEl('path', { d: sparkle(9) }, { fill: '--pfx-wolf-star', stroke: '--pfx-wolf-night', sw: 1, cls: 'art-twinkle', t: 5 }));
    g.appendChild(svgEl('circle', { cx: 7, cy: -6, r: 1.2 }, { fill: '--pfx-wolf-star' }));
  };
  M.wpine = function (g) { wolfPine(g, 0, 11, 22, 1.2); };
  M.wcloud = function (g) {
    [[0, 0, 11, 3.2], [-4, -2.2, 6, 2.8], [4.4, -1.6, 5, 2.6], [8, 1, 4, 1.8]].forEach(function (c) {
      g.appendChild(svgEl('ellipse', { cx: c[0], cy: c[1], rx: c[2], ry: c[3], 'fill-opacity': '.55' }, { fill: '--pfx-wolf-cloud' }));
    });
    g.appendChild(svgEl('path', { d: 'M-8 -2.6Q-4 -5.2 0 -3.4Q4 -4.6 8 -2.4', 'stroke-opacity': '.5' }, { stroke: '--pfx-wolf-halo', sw: .8 }));
  };
  E.wolf = {
    scene: function (box) {
      box.appendChild(wolfScene());
      box.appendChild(wolfMoment());
    },
    edge: [['wstar', 'tl', 0, 16, 0, [16, 14]], ['wstar', 'top', .58, 11], ['wpine', 'bl', 0, 26, 0, [14, -18]], ['wpine', 'br', 0, 30, 0, [-14, -20]], ['wstar', 'right', .42, 12]],
    pass: { motif: 'wcloud', from: 'left', n: 3, size: 40, t: 34, drift: 10 }
  };
  /* effect:wolf:end */

  /* effect:starward:begin */
  /* STARWARD DREAMING (Ryan, 2026-10-19: "a view looking up at a clear starry
     night through a clearing in a group of trees. Flames and embers from an
     offscreen fire flicker into the air. Invoke the feeling of being grounded
     on earth yet projecting into the cosmos"). Drawn in its own --pfx-star-*
     inks, declared in love.css, and make-profile.py holds this block to them.

     It is seen lying on your back by a fire: the trunks rise from the edges of
     the picture and meet in a ring of dark crowns, and in the clearing between
     them is the sky with the Milky Way across it. The fire is out of the
     picture, at your feet; its light is on the foot of every trunk, most on
     those rising from that side, and its flames lick up over the bottom edge.
     EVERY EMBER RISES OFF IT, COOLS AS IT CLIMBS AND BECOMES A STAR, the ground
     and the sky in one movement, and that is the effect.

     THE FIRE IS HELD UNDER THE FLASH LINE, the cabin's candles' rule: a flame
     changes shape as it sways, its brightness moves by a tenth of itself at
     most, each half of a sway takes the seconds SW_FLICKER gives it, never
     under four tenths, and no two flames sway in step. make-profile.py reads
     SW_FLICKER and the flames' keyframes in cb.css to hold it.

     The still part is that clearing over the banner's right-hand part, the
     flames at its foot, and embers on their way up, the highest already stars.
     Where drawings move, the flames sway and the embers rise and cool into
     stars. The opening, on the Lagoon's sixty-second clock: the night comes up
     over the profile and the trees close round it, the stars come out, flames
     rise along its foot and a shower of embers goes up off them, each one
     becoming a star, a star falls across the clearing, and it all fades, about
     nine seconds of every sixty. The pass is embers rising and cooling. */
  var SW_FLICKER = [.62, .74, .55, .86, .68, .93, .58, .8, .71, .66, .9, .77, .6, .83];
  var SW_STARS = ['--pfx-star-star', '--pfx-star-star-2', '--pfx-star-star-3'];
  // THE CLEARING SEEN FROM BELOW, in a box w by h: dark woods all round a hole
  // of sky at cx cy, rx by ry, crowns of needles round its edge, and trunks
  // rising from the edges [x, y, half width] to meet there, each lit at its
  // foot by the fire, the more the nearer the bottom edge it rises from.
  function swWoods(g, defs, w, h, cx, cy, rx, ry, trunks, k) {
    var hole = 'M' + f(cx - rx) + ' ' + f(cy) + 'A' + f(rx) + ' ' + f(ry) + ' 0 1 0 ' + f(cx + rx) + ' ' + f(cy) + 'A' + f(rx) + ' ' + f(ry) + ' 0 1 0 ' + f(cx - rx) + ' ' + f(cy) + 'Z';
    g.appendChild(svgEl('path', { d: 'M-60 -60H' + (w + 60) + 'V' + (h + 60) + 'H-60Z' + hole, 'fill-rule': 'evenodd' }, { fill: '--pfx-star-tree' }));
    trunks.forEach(function (t) {
      var bx = t[0], by = t[1], dx = bx - cx, dy = by - cy, edge = 1 / Math.hypot(dx / rx, dy / ry) * .92;
      var tx = cx + dx * edge, ty = cy + dy * edge, L = Math.hypot(tx - bx, ty - by), nx = -(ty - by) / L, ny = (tx - bx) / L;
      var w0 = t[2] * k, w1 = w0 * .18, P = function (x, y) { return f(x) + ' ' + f(y); };
      g.appendChild(svgEl('path', { d: 'M' + P(bx + nx * w0, by + ny * w0) + 'L' + P(tx + nx * w1, ty + ny * w1) + 'L' + P(tx - nx * w1, ty - ny * w1) + 'L' + P(bx - nx * w0, by - ny * w0) + 'Z' }, { fill: '--pfx-star-trunk' }));
      var warm = Math.max(.3, Math.min(1, by / h));
      g.appendChild(paint(svgEl('path', { d: 'M' + P(bx + nx * w0 * .1, by + ny * w0 * .1) + 'L' + P(tx, ty) + 'L' + P(bx - nx * w0, by - ny * w0) + 'Z' }, {}),
        fxGrad(defs, [f(bx), f(by), f(tx), f(ty)], [[0, warm, { stop: '--pfx-star-lit-2' }], [.3, warm * .75, { stop: '--pfx-star-lit' }], [.75, 0, { stop: '--pfx-star-lit' }]], true)));
      // a branch or two, dark against the trunk's light
      [.34, .52].forEach(function (u, j) {
        var px = bx + (tx - bx) * u, py = by + (ty - by) * u, side = j ? 1 : -1, len = L * .16;
        g.appendChild(svgEl('path', { d: 'M' + P(px, py) + 'L' + P(px + nx * side * len + (tx - bx) / L * len * .5, py + ny * side * len + (ty - by) / L * len * .5) }, { stroke: '--pfx-star-tree', sw: f(Math.max(.8, w0 * .3)) }));
      });
    });
    // crowns of needles round the clearing's edge, over the tops of the trunks
    for (var j = 0; j < 34; j++) {
      var a = (j + rnd(j + 600) * .5) / 34 * Math.PI * 2, rr = 1.04 + rnd(j + 630) * .14;
      var px = cx + Math.cos(a) * rx * rr, py = cy + Math.sin(a) * ry * rr, size = (5 + rnd(j + 660) * 5) * k, spikes = '';
      g.appendChild(svgEl('circle', { cx: f(px), cy: f(py), r: f(size) }, { fill: '--pfx-star-tree' }));
      for (var m = -2; m <= 2; m++) {
        var b = a + Math.PI + m * .32, l = size * (1.5 + rnd(j * 5 + m + 700) * .6);
        spikes += 'M' + f(px + Math.cos(b) * size * .6) + ' ' + f(py + Math.sin(b) * size * .6) + 'L' + f(px + Math.cos(b) * l) + ' ' + f(py + Math.sin(b) * l);
      }
      g.appendChild(svgEl('path', { d: spikes }, { stroke: '--pfx-star-tree', sw: f(Math.max(.6, k * .9)) }));
    }
  }
  // ONE TONGUE OF FLAME, its foot at x y, h tall, swaying on a time of its own
  function swFlame(g, x, y, h, i) {
    var t = svgEl('g', {}, { cls: 'fx-sw-flame', t: SW_FLICKER[i % SW_FLICKER.length], d: -rnd(i + 720) * 2 });
    t.style.removeProperty('fill');
    var w = h * .34;
    [[1, { fill: '--pfx-star-flame-3' }, '.92'], [.7, { fill: '--pfx-star-flame' }, '.96'], [.4, { fill: '--pfx-star-flame-2' }, '1']].forEach(function (tg) {
      var hh = h * tg[0], ww = w * tg[0];
      t.appendChild(svgEl('path', { d: 'M' + f(x - ww) + ' ' + f(y) + 'C' + f(x - ww) + ' ' + f(y - hh * .5) + ' ' + f(x - ww * .2) + ' ' + f(y - hh * .62) + ' ' + f(x + ww * .12) + ' ' + f(y - hh) +
        'C' + f(x + ww * .5) + ' ' + f(y - hh * .55) + ' ' + f(x + ww) + ' ' + f(y - hh * .45) + ' ' + f(x + ww) + ' ' + f(y) + 'Z', 'fill-opacity': tg[2] }, tg[1]));
    });
    g.appendChild(t);
  }
  // AN EMBER AND THE STAR IT BECOMES, at x y, r across: cool is how far it has
  // gone (0 an ember, 1 a star) in the still picture; with cls, both are there
  // for the cooling to cross between.
  function swEmber(g, x, y, r, cool, emberCls, starCls) {
    var e = svgEl('g', { opacity: emberCls ? '1' : f(1 - cool) }, { cls: emberCls || '' });
    e.style.removeProperty('fill');
    e.appendChild(svgEl('circle', { cx: f(x), cy: f(y), r: f(r * 2.6), 'fill-opacity': '.3' }, { fill: '--pfx-star-glow' }));
    e.appendChild(svgEl('circle', { cx: f(x), cy: f(y), r: f(r) }, { fill: '--pfx-star-ember' }));
    var s = svgEl('g', { opacity: starCls ? '1' : f(cool), transform: 'translate(' + f(x) + ' ' + f(y) + ')' }, { cls: starCls || '' });
    s.style.removeProperty('fill');
    s.appendChild(svgEl('path', { d: sparkle(r * 2.4) }, { fill: '--pfx-star-star-3' }));
    g.appendChild(e);
    g.appendChild(s);
  }
  function swScene() {
    var s = fxSvg(380, 112, 'pf-fx__scene'), defs = fxDefs(s), g = group(s), i;
    g.setAttribute('mask', fxFade(defs, 132, 196, 380, 112));
    var cx = 262, cy = 46, rx = 64, ry = 33;
    g.appendChild(svgEl('rect', { x: 130, y: 0, width: 250, height: 112 }, { fill: '--pfx-star-sky' }));
    // the Milky Way, across the clearing
    var mw = group(g, 'rotate(-24 ' + cx + ' ' + cy + ')');
    mw.style.setProperty('filter', fxBlur(defs, 4));
    mw.appendChild(svgEl('ellipse', { cx: cx, cy: cy, rx: 110, ry: 12, 'fill-opacity': '.65' }, { fill: '--pfx-star-milky' }));
    mw.appendChild(svgEl('ellipse', { cx: cx + 6, cy: cy - 1, rx: 74, ry: 4.4, 'fill-opacity': '.5' }, { fill: '--pfx-star-milky-2' }));
    for (i = 0; i < 46; i++) {
      var a = rnd(i + 740) * Math.PI * 2, rr = Math.sqrt(rnd(i + 770)) * 1.05, big = i % 11 === 0;
      var sx = cx + Math.cos(a) * rx * rr, sy = cy + Math.sin(a) * ry * rr;
      if (big) at(g, sx, sy).appendChild(svgEl('path', { d: sparkle(2.6) }, { fill: SW_STARS[i % 3], cls: 'art-twinkle', d: i * .4 % 4, t: 4.5 }));
      else g.appendChild(svgEl('circle', { cx: f(sx), cy: f(sy), r: f(.35 + rnd(i + 800) * .7) }, { fill: SW_STARS[i % 3], cls: i % 4 ? '' : 'art-twinkle', d: i * .3 % 4, t: 5 }));
    }
    swWoods(g, defs, 380, 112, cx, cy, rx, ry, [[168, 124, 7], [226, 128, 9], [302, 128, 9], [362, 122, 7], [396, 76, 6], [396, 18, 5], [334, -14, 5], [252, -16, 4.5], [186, -12, 5], [146, 46, 5]], 1);
    // the fire's light coming up over the foot of the picture, and its flames
    var glow = svgEl('ellipse', { cx: 270, cy: 116, rx: 70, ry: 20, 'fill-opacity': '.42' }, { fill: '--pfx-star-glow' });
    glow.style.setProperty('filter', fxBlur(defs, 6));
    g.appendChild(glow);
    [[238, 10], [250, 16], [262, 22], [274, 18], [286, 24], [298, 15], [310, 11]].forEach(function (fl, j) { swFlame(g, fl[0], 115, fl[1], j); });
    // embers on their way up, the highest already stars: still, then rising
    var still = group(g);
    still.setAttribute('class', 'fx-still');
    [[256, 92, 0], [280, 84, 0], [246, 72, .25], [292, 64, .55], [262, 54, .85], [284, 38, 1], [240, 44, 1], [270, 24, 1]].forEach(function (e) { swEmber(still, e[0], e[1], .9, e[2]); });
    for (i = 0; i < 10; i++) {
      var rise = svgEl('g', { opacity: '0' }, { cls: 'fx-sw-rise', t: 6 + rnd(i + 820) * 3, d: -rnd(i + 840) * 9 });
      rise.style.removeProperty('fill');
      rise.style.setProperty('--rise', f(-48 - rnd(i + 860) * 44) + 'px');
      rise.style.setProperty('--sx', f((rnd(i + 880) - .5) * 26) + 'px');
      swEmber(rise, 244 + rnd(i + 900) * 56, 104, .85, 0, 'fx-sw-ember', 'fx-sw-star');
      g.appendChild(rise);
    }
    return s;
  }
  function swMoment() {
    var box = el('div', 'pf-fx__moment'), i;
    var sky = fxSvg(100, 100, 'pf-fx__sw-sky', 'none'), sd = fxDefs(sky);
    sky.appendChild(paint(svgEl('rect', { x: 0, y: 0, width: 100, height: 100 }, {}),
      fxGrad(sd, [.5, .42, .75], [[0, .96, { stop: '--pfx-star-sky' }], [1, .97, { stop: '--pfx-star-deep' }]])));
    var mw = group(sky, 'rotate(-32 50 46)');
    mw.style.setProperty('filter', fxBlur(sd, 3));
    mw.appendChild(svgEl('ellipse', { cx: 50, cy: 46, rx: 80, ry: 10, 'fill-opacity': '.6' }, { fill: '--pfx-star-milky' }));
    mw.appendChild(svgEl('ellipse', { cx: 54, cy: 45, rx: 52, ry: 3.6, 'fill-opacity': '.45' }, { fill: '--pfx-star-milky-2' }));
    box.appendChild(sky);
    for (i = 0; i < 44; i++) {
      var st = fxSpan(box, 'pf-fx__sw-star', 14 + rnd(i + 1400) * 72, 8 + rnd(i + 1430) * 66, rnd(i + 1460) * 1.8);
      var ts = tiny(3 + rnd(i + 1490) * (i % 6 ? 7 : 14));
      ts.appendChild(svgEl('path', { d: sparkle(i % 6 ? 5 : 10) }, { fill: SW_STARS[i % 3] }));
      st.appendChild(ts);
    }
    // the trees closing round the clearing
    var woods = fxSvg(400, 300, 'pf-fx__sw-woods', 'xMidYMid slice'), wd = fxDefs(woods), wg = group(woods);
    swWoods(wg, wd, 400, 300, 200, 128, 136, 96, [[30, 336, 13], [130, 348, 17], [262, 348, 17], [372, 336, 13], [446, 210, 12], [446, 60, 10], [340, -36, 10], [210, -40, 9], [80, -34, 10], [-46, 90, 11], [-46, 236, 12]], 1.5);
    box.appendChild(woods);
    // the flames along the foot
    var fire = fxSvg(400, 70, 'pf-fx__sw-fire', 'xMidYMax slice'), fd = fxDefs(fire);
    var rise = svgEl('g', {}, { cls: 'fx-mo-sw-fire' });
    rise.style.removeProperty('fill');
    var glow = svgEl('ellipse', { cx: 200, cy: 80, rx: 230, ry: 40, 'fill-opacity': '.5' }, { fill: '--pfx-star-glow' });
    glow.style.setProperty('filter', fxBlur(fd, 10));
    rise.appendChild(glow);
    for (i = 0; i < 13; i++) swFlame(rise, 10 + i * 30 + rnd(i + 1500) * 14, 76, 16 + rnd(i + 1520) * 26, i + 3);
    fire.appendChild(rise);
    box.appendChild(fire);
    // a shower of embers off them, each one becoming a star where it stops
    var showers = el('div', 'pf-fx__sw-embers');
    for (i = 0; i < 28; i++) {
      var em = fxSpan(showers, 'pf-fx__sw-ember', 4 + rnd(i + 1540) * 92, 94, rnd(i + 1570) * 3.2);
      em.style.setProperty('--rise', f(-40 - rnd(i + 1600) * 48));
      em.style.setProperty('--sx', f((rnd(i + 1630) - .5) * 18));
      var es = tiny(6 + rnd(i + 1660) * 6);
      swEmber(es, 0, 0, 2.6, 0, 'fx-sw-me', 'fx-sw-ms');
      em.appendChild(es);
    }
    box.appendChild(showers);
    // and a star falling across the clearing
    var fall = fxSpan(box, 'pf-fx__sw-fall', 72, 10), fs = tiny(70);
    fs.appendChild(svgEl('path', { d: 'M0 0L22 -13', 'stroke-opacity': '.7' }, { stroke: '--pfx-star-star-2', sw: 1.2 }));
    fs.appendChild(svgEl('path', { d: sparkle(3) }, { fill: '--pfx-star-star' }));
    fall.appendChild(fs);
    return box;
  }
  M.swstar = function (g) {
    g.appendChild(svgEl('path', { d: sparkle(9) }, { fill: '--pfx-star-star', stroke: '--pfx-star-sky', sw: 1, cls: 'art-twinkle', t: 4.5 }));
    g.appendChild(svgEl('circle', { cx: -7, cy: 6, r: 1.3 }, { fill: '--pfx-star-star-2' }));
  };
  M.swember = function (g) {
    g.appendChild(svgEl('circle', { r: 6, 'fill-opacity': '.32' }, { fill: '--pfx-star-glow', cls: 'art-glow', t: 3.6 }));
    g.appendChild(svgEl('circle', { r: 2.2 }, { fill: '--pfx-star-ember', stroke: '--pfx-star-flame-3', sw: .8 }));
    g.appendChild(svgEl('circle', { cx: 5, cy: -6, r: 1 }, { fill: '--pfx-star-ember' }));
  };
  // the pass: an ember rising, cooling into a star on the way
  M.swspark = function (g) { swEmber(g, 0, 0, 2.2, 0, 'fx-sw-pe', 'fx-sw-ps'); };
  E.starward = {
    scene: function (box) {
      box.appendChild(swScene());
      box.appendChild(swMoment());
    },
    edge: [['swstar', 'tl', 0, 15, 0, [16, 14]], ['swstar', 'top', .62, 10], ['swember', 'bl', 0, 14, 0, [18, -16]], ['swember', 'br', 0, 16, 0, [-18, -18]], ['swstar', 'right', .4, 11]],
    pass: { motif: 'swspark', from: 'bottom', n: 8, size: 12, t: 24, drift: 10 }
  };
  /* effect:starward:end */

  /* effect:dolphins:begin */
  /* LEAPING DOLPHINS (Ryan, 2026-10-19: "Dolphins leaping out of the water in
     arcs across an ocean dappled by a setting sun"). Drawn in its own
     --pfx-dolphin-* inks, declared in love.css, and make-profile.py holds this
     block to them: a sunset is a light no card's seven inks can be relied on
     for. The dolphins are drawn here, after no picture of anybody's.

     The still part is the sun going down over the banner's right-hand part,
     its path broken into dapples on the sea, streaks of cloud lit from below,
     two gulls, and two dolphins in the air, one near and one far. Where
     drawings move, each leaps out along its arc and back in every twelve
     seconds, the water breaking where it comes out and where it goes in, and
     the dapples glint slowly. The opening, on the Lagoon's sixty-second clock:
     the sunset comes up over the profile, the sun sits on the sea with its
     light across the water, a pod of dolphins leaps across the profile one
     after another, and it all fades, about nine seconds of every sixty. The
     pass is gulls crossing. Nothing in it flashes: a dapple glints over
     seconds, and a splash comes and goes over more than one. */
  // A DOLPHIN, facing right, its middle at 0 0 and about 60 long, the low sun
  // along its back.
  function dolphin(g, k) {
    var d = group(g), sw = Math.max(.5, .7 / k);
    d.appendChild(svgEl('path', { d: 'M-19 .8C-23 -3 -27 -5 -30.6 -4.6C-28.4 -2 -26.4 -.2 -23 1C-26 2.2 -28 4.4 -29.6 7.2C-26 6.6 -22.6 4.6 -19 2.6Z' }, { fill: '--pfx-dolphin-body', stroke: '--pfx-dolphin-line', sw: sw }));
    d.appendChild(svgEl('path', { d: 'M-2 -7.2C0 -12 2.4 -14.8 6 -15.6C4.2 -12 4.2 -9.4 5.2 -7Z' }, { fill: '--pfx-dolphin-body', stroke: '--pfx-dolphin-line', sw: sw }));
    d.appendChild(svgEl('path', { d: 'M-20 1C-14 -5 -2 -8 8 -7C13 -6.6 16 -5 18 -3.6L23.4 -3C24.8 -2.8 24.8 -1.8 23.4 -1.4L18 -.6C14 2.4 6 4.6 -2 4.4C-10 4.2 -15 3 -20 1Z' }, { fill: '--pfx-dolphin-body', stroke: '--pfx-dolphin-line', sw: sw }));
    d.appendChild(svgEl('path', { d: 'M-13 3.2C-4 4.4 6 4 13 1.4L18 -.6C14 1.6 8 3 0 3.2C-6 3.2 -10 3.2 -13 3.2Z' }, { fill: '--pfx-dolphin-belly' }));
    d.appendChild(svgEl('path', { d: 'M6 2.6C5 6 3 8 0 8.6C1.6 6.4 2.6 4.6 2.8 2.8Z' }, { fill: '--pfx-dolphin-body', stroke: '--pfx-dolphin-line', sw: sw }));
    d.appendChild(svgEl('circle', { cx: 14.6, cy: -3.4, r: .9 }, { fill: '--pfx-dolphin-line' }));
    d.appendChild(svgEl('path', { d: 'M18 -1.6Q20 -1.1 22.6 -1.6' }, { stroke: '--pfx-dolphin-line', sw: sw * .7 }));
    d.appendChild(svgEl('path', { d: 'M-15 -3.6C-7 -7.4 4 -8.2 12 -6.4M-1 -8.2C1 -11.8 3 -13.8 5.4 -14.8' }, { stroke: '--pfx-dolphin-dapple', sw: sw * 1.3 }));
    return d;
  }
  // A SPLASH, its foot on the water at 0 0
  function splash(g, k) {
    var s = group(g, 'scale(' + k3(k) + ')');
    s.appendChild(svgEl('ellipse', { cx: 0, cy: 0, rx: 9, ry: 1.6 }, { stroke: '--pfx-dolphin-spray', sw: 1 }));
    s.appendChild(svgEl('path', { d: 'M-6 0Q-5.4 -4 -3.4 -6.4M-2 0Q-1.4 -6 0 -8.6M2 0Q1.4 -5 3.4 -6.8M6 0Q5.4 -3 4.2 -4.8' }, { stroke: '--pfx-dolphin-spray', sw: 1.1 }));
    [[-5.2, -8.4, .9], [1.2, -11, 1], [5, -7.6, .8], [-1.6, -12.8, .6]].forEach(function (p) { s.appendChild(svgEl('circle', { cx: p[0], cy: p[1], r: p[2] }, { fill: '--pfx-dolphin-spray' })); });
  }
  // A LEAP: the dolphin at the top of its arc at x y, crossing the surface dx
  // either side of that and dy under it. Where drawings move it goes out along
  // the arc and back in on a turn of t seconds from d, clipped away below the
  // surface, so it comes up out of the water and goes back into it.
  function dpLeap(g, defs, x, y, dx, dy, k, t, d) {
    var surf = y + dy, clip = group(g);
    clip.setAttribute('clip-path', fxClip(defs, x - dx * 3, y - 80, dx * 6, dy + 80));
    var X = svgEl('g', {}, { cls: 'fx-dp-x', t: t, d: d });
    X.style.removeProperty('fill');
    X.style.setProperty('--dx', f(dx) + 'px');
    X.style.setProperty('--dy', f(dy) + 'px');
    var Y = svgEl('g', {}, { cls: 'fx-dp-y' }), R = svgEl('g', {}, { cls: 'fx-dp-r' });
    Y.style.removeProperty('fill');
    R.style.removeProperty('fill');
    dolphin(scaled(R, x, y, k), k);
    Y.appendChild(R);
    X.appendChild(Y);
    clip.appendChild(X);
    [[-1, 'fx-dp-in', '.75'], [1, 'fx-dp-out', '0']].forEach(function (sp) {
      var w = svgEl('g', { opacity: sp[2] }, { cls: sp[1], t: t, d: d });
      w.style.removeProperty('fill');
      splash(at(w, x + sp[0] * dx, surf), k * 1.1);
      g.appendChild(w);
    });
  }
  // THE SUN'S PATH ON THE SEA, broken into dapples: rows widening and parting
  // as they come nearer, under the sun at x, from the horizon at y0 to y1.
  function dpDapples(g, x, y0, y1, k) {
    for (var r = 0, y = y0 + 1; y < y1; r++) {
      var spread = (4 + r * 7) * k, n = 2 + r % 3;
      for (var j = 0; j < n; j++) {
        var dx = (rnd(r * 7 + j + 800) - .5) * 2 * spread, w = (3 + rnd(r * 7 + j + 830) * 7) * k * (1 + r * .12), h = (.9 + r * .16) * k;
        g.appendChild(svgEl('rect', { x: f(x + dx - w / 2), y: f(y), width: f(w), height: f(h), rx: f(h / 2) },
          { fill: Math.abs(dx) < spread * .45 ? '--pfx-dolphin-dapple' : '--pfx-dolphin-dapple-2', cls: 'art-twinkle', d: rnd(r + j + 860) * 4, t: 3.6 + rnd(r * 3 + j) * 2 }));
      }
      y += (1.6 + r * .9) * k;
    }
  }
  function gull(g, x, y, s) {
    g.appendChild(svgEl('path', { d: 'M' + f(x - s) + ' ' + f(y) + 'Q' + f(x - s / 2) + ' ' + f(y - s * .7) + ' ' + f(x) + ' ' + f(y) + 'Q' + f(x + s / 2) + ' ' + f(y - s * .7) + ' ' + f(x + s) + ' ' + f(y) }, { stroke: '--pfx-dolphin-gull', sw: 1.1 }));
  }
  function dpScene() {
    var s = fxSvg(380, 112, 'pf-fx__scene'), defs = fxDefs(s), g = group(s);
    g.setAttribute('mask', fxFade(defs, 132, 196, 380, 112));
    g.appendChild(paint(svgEl('rect', { x: 130, y: 0, width: 250, height: 67 }, {}),
      fxGrad(defs, [0, 0, 0, 1], [[0, .96, { stop: '--pfx-dolphin-high' }], [.55, .96, { stop: '--pfx-dolphin-rose' }], [1, .96, { stop: '--pfx-dolphin-glow' }]])));
    // streaks of cloud, lit from beneath
    g.appendChild(svgEl('path', { d: 'M176 20H222M196 26H236M318 14H360M336 21H372M248 36H276', 'stroke-opacity': '.7' }, { stroke: '--pfx-dolphin-dapple-2', sw: 1.8 }));
    g.appendChild(svgEl('path', { d: 'M180 21.4H214M322 15.4H352M252 37.2H270', 'stroke-opacity': '.65' }, { stroke: '--pfx-dolphin-dapple', sw: .8 }));
    // the sun on the sea, in its glow
    var glow = svgEl('g', {}, { cls: 'fx-breathe', t: 11 });
    glow.style.removeProperty('fill');
    glow.style.setProperty('filter', fxBlur(defs, 6));
    glow.appendChild(svgEl('circle', { cx: 300, cy: 66, r: 36, 'fill-opacity': '.34' }, { fill: '--pfx-dolphin-sun-2' }));
    g.appendChild(glow);
    g.appendChild(svgEl('circle', { cx: 300, cy: 66, r: 15 }, { fill: '--pfx-dolphin-sun', stroke: '--pfx-dolphin-sun-2', sw: 1.4 }));
    gull(g, 184, 40, 5);
    gull(g, 198, 33, 4);
    // the sea, and the sun's path broken into dapples on it
    g.appendChild(paint(svgEl('rect', { x: 130, y: 66, width: 250, height: 46 }, {}),
      fxGrad(defs, [0, 0, 0, 1], [[0, .97, { stop: '--pfx-dolphin-sea-2' }], [1, .98, { stop: '--pfx-dolphin-sea' }]])));
    g.appendChild(svgEl('path', { d: 'M130 66.4H380', 'stroke-opacity': '.8' }, { stroke: '--pfx-dolphin-glow', sw: .9 }));
    dpDapples(g, 300, 67, 112, 1);
    g.appendChild(svgEl('path', { d: 'M150 82h18M176 94h24M340 88h20M318 104h26M206 104h18', 'stroke-opacity': '.8' }, { stroke: '--pfx-dolphin-sea-2', sw: 1.2 }));
    dpLeap(g, defs, 352, 60, 18, 10, .4, 12, 3.4);
    dpLeap(g, defs, 226, 54, 44, 30, .72, 12, 0);
    return s;
  }
  function dpMoment() {
    var box = el('div', 'pf-fx__moment'), i;
    var sky = fxSvg(100, 100, 'pf-fx__dp-sky', 'none'), sd = fxDefs(sky);
    sky.appendChild(paint(svgEl('rect', { x: 0, y: 0, width: 100, height: 100 }, {}),
      fxGrad(sd, [0, 0, 0, 1], [[0, .93, { stop: '--pfx-dolphin-high' }], [.55, .9, { stop: '--pfx-dolphin-rose' }], [1, .92, { stop: '--pfx-dolphin-glow' }]])));
    sky.appendChild(svgEl('path', { d: 'M6 30H30M16 37H40M58 20H88M68 27H96M38 52H58', 'stroke-opacity': '.6' }, { stroke: '--pfx-dolphin-dapple-2', sw: 1 }));
    box.appendChild(sky);
    // the sun, sitting on the sea and going down
    var sun = el('div', 'pf-fx__dp-sun'), ss = fxSvg(100, 100), sg = fxDefs(ss);
    var halo = svgEl('circle', { cx: 50, cy: 50, r: 46, 'fill-opacity': '.4' }, { fill: '--pfx-dolphin-sun-2' });
    halo.style.setProperty('filter', fxBlur(sg, 8));
    ss.appendChild(halo);
    ss.appendChild(svgEl('circle', { cx: 50, cy: 50, r: 24 }, { fill: '--pfx-dolphin-sun', stroke: '--pfx-dolphin-sun-2', sw: 2 }));
    sun.appendChild(ss);
    box.appendChild(sun);
    // the sea, the sun's path across it
    var sea = fxSvg(200, 76, 'pf-fx__dp-sea', 'none'), ed = fxDefs(sea);
    sea.appendChild(paint(svgEl('rect', { x: 0, y: 0, width: 200, height: 76 }, {}),
      fxGrad(ed, [0, 0, 0, 1], [[0, .96, { stop: '--pfx-dolphin-sea-2' }], [1, .97, { stop: '--pfx-dolphin-sea' }]])));
    sea.appendChild(svgEl('path', { d: 'M0 .6H200', 'stroke-opacity': '.8' }, { stroke: '--pfx-dolphin-glow', sw: 1 }));
    dpDapples(sea, 100, 0, 76, 1);
    sea.appendChild(svgEl('path', { d: 'M12 20h22M40 44h30M150 30h26M136 60h36M60 66h24', 'stroke-opacity': '.8' }, { stroke: '--pfx-dolphin-sea-2', sw: 1.6 }));
    box.appendChild(sea);
    // the pod, leaping across one after another; below the surface they are clipped away
    var pod = el('div', 'pf-fx__dp-pod');
    [[16, 10, 34, 120], [37, 11, 40, 150], [59, 10, 32, 112], [80, 9, 30, 132]].forEach(function (p, j) {
      var leap = fxSpan(pod, 'pf-fx__dp-leap', p[0], 100 - p[2], j * .8);
      leap.style.setProperty('--dx', String(p[1]));
      leap.style.setProperty('--dy', String(p[2]));
      var X = el('span', 'fx-mo-dp-x'), Y = el('span', 'fx-mo-dp-y'), R = el('span', 'fx-mo-dp-r');
      var ds = plainSvg(64, 32);
      ds.setAttribute('viewBox', '-33 -17 60 28');
      ds.setAttribute('width', String(p[3]));
      ds.setAttribute('height', f(p[3] * 28 / 60));
      ds.style.left = f(-p[3] / 2) + 'px';
      ds.style.top = f(-p[3] * 14 / 60) + 'px';
      dolphin(ds, p[3] / 60);
      R.appendChild(ds);
      Y.appendChild(R);
      X.appendChild(Y);
      leap.appendChild(X);
      [[-1, 'in'], [1, 'out']].forEach(function (sp) {
        var w = fxSpan(pod, 'pf-fx__dp-splash pf-fx__dp-splash--' + sp[1], p[0] + sp[0] * p[1], 100, j * .8), sz = p[3] * .5;
        var sv = plainSvg(24, 16);
        sv.setAttribute('viewBox', '-12 -14 24 16');
        sv.setAttribute('width', f(sz));
        sv.setAttribute('height', f(sz * 16 / 24));
        sv.style.left = f(-sz / 2) + 'px';
        sv.style.top = f(-sz * 14 / 24) + 'px';
        splash(sv, 1);
        w.appendChild(sv);
      });
    });
    box.appendChild(pod);
    return box;
  }
  M.dpgull = function (g, moving) {
    var w = svgEl('g', {}, { cls: moving ? 'fx-batflap' : '' });
    w.style.removeProperty('fill');
    w.appendChild(svgEl('path', { d: 'M-10 -1Q-5 -6.4 0 0Q5 -6.4 10 -1', 'stroke-opacity': '.55' }, { stroke: '--pfx-dolphin-dapple', sw: 3.2 }));
    w.appendChild(svgEl('path', { d: 'M-10 -1Q-5 -6.4 0 0Q5 -6.4 10 -1' }, { stroke: '--pfx-dolphin-gull', sw: 1.6 }));
    g.appendChild(w);
  };
  M.dpwave = function (g) {
    g.appendChild(svgEl('path', { d: 'M-11 5C-8 -2 -2 -6 4 -4.4C8.4 -3.2 9.4 1 6.4 2.2C4 3 2.6 1.2 3.6 -.2' }, { stroke: '--pfx-dolphin-sea-2', sw: 3 }));
    g.appendChild(svgEl('path', { d: 'M-11 5C-8 -2 -2 -6 4 -4.4C8.4 -3.2 9.4 1 6.4 2.2C4 3 2.6 1.2 3.6 -.2' }, { stroke: '--pfx-dolphin-spray', sw: 1.1, cls: 'art-twinkle', t: 4 }));
    [[9, -6, 1], [11.4, -2.4, .8], [6.6, -8.4, .7]].forEach(function (p) { g.appendChild(svgEl('circle', { cx: p[0], cy: p[1], r: p[2] }, { fill: '--pfx-dolphin-spray' })); });
  };
  M.dpdolphin = function (g) {
    dolphin(group(g, 'scale(.38)'), .38);
    splash(at(g, -9, 7), .6);
  };
  E.dolphins = {
    scene: function (box) {
      box.appendChild(dpScene());
      box.appendChild(dpMoment());
    },
    edge: [['dpgull', 'tl', 0, 16, 0, [18, 16]], ['dpgull', 'top', .6, 11], ['dpwave', 'bl', 0, 18, 0, [16, -14]], ['dpdolphin', 'br', 0, 30, -18, [-28, -16]]],
    pass: { motif: 'dpgull', from: 'right', n: 3, size: 16, t: 30, drift: 12 }
  };
  /* effect:dolphins:end */

  /* effect:autumn:begin */
  /* AUTUMN FALLS (Ryan, 2026-10-19: "a large tree in fall foliage with leaves
     dropping and drifting gently into leaf piles with children popping up out
     of them"). Drawn in its own --pfx-autumn-* inks, declared in love.css, and
     make-profile.py holds this block to them: the reds and golds of the leaves
     and the children's skins are colours no card's seven inks can hold.

     THE CHILDREN ARE NOBODY IN PARTICULAR AND NO TWO ALIKE: five skins, four
     hairs, curls, a bob, bunches and short, jumpers in four colours, one in
     glasses, one in ear defenders, and one in a wheelchair beside the piles
     throwing leaves up with both hands. Their faces are two dots and a smile,
     and nobody is described in words: every drawing is aria-hidden, as every
     avatar on the street is.

     The still part is an afternoon over the banner's right-hand part: the tree
     in red, orange and gold, leaves in the air, two piles of leaves on the
     grass with a child popping up out of one and peeping out of the other,
     and the child in the wheelchair between them with leaves going up over
     their hands. Where drawings move, the leaves drop and drift down swinging,
     and the children duck into the piles and pop up again with leaves flying.
     The opening, on the Lagoon's sixty-second clock: the afternoon comes up
     over the profile, the big tree stands at its side, its leaves come down
     all over it and pile up along its foot, the children pop up out of the
     piles one after another with leaves flying, and it all fades, about nine
     seconds of every sixty. The pass is leaves drifting down. */
  var AU_LEAF = ['--pfx-autumn-red', '--pfx-autumn-orange', '--pfx-autumn-gold', '--pfx-autumn-yellow', '--pfx-autumn-rust'];
  var AU_SKIN = ['--pfx-autumn-skin-1', '--pfx-autumn-skin-2', '--pfx-autumn-skin-3', '--pfx-autumn-skin-4', '--pfx-autumn-skin-5'];
  var AU_HAIR = ['--pfx-autumn-hair-1', '--pfx-autumn-hair-2', '--pfx-autumn-hair-3', '--pfx-autumn-hair-4'];
  var AU_JUMPER = ['--pfx-autumn-jumper-1', '--pfx-autumn-jumper-2', '--pfx-autumn-jumper-3', '--pfx-autumn-jumper-4'];
  var AU_MAPLE = 'M0 -10L2 -6L5 -8L4.4 -3.6L9 -4.6L7 -1L9.6 .4L5 2.6L5.6 5L1 3.6L1.2 9H-1.2L-1 3.6L-5.6 5L-5 2.6L-9.6 .4L-7 -1L-9 -4.6L-4.4 -3.6L-5 -8L-2 -6Z';
  // A LEAF, a maple's or a plain one, its middle at x y, s its size
  function auLeaf(g, x, y, s, rot, ink, maple) {
    var q = at(g, x, y, rot);
    q.appendChild(svgEl('path', { d: maple ? AU_MAPLE : leaf(8, 4.6), transform: 'scale(' + k3(s) + ')' }, { fill: ink, stroke: '--pfx-autumn-line', sw: .5 }));
    return q;
  }
  // A PILE OF LEAVES, its foot at cx base, w wide and h high, heaped with leaves
  function auPile(g, cx, base, w, h, seed) {
    var p = group(g), i, n = Math.round(w * h / 20);
    p.appendChild(svgEl('path', { d: 'M' + f(cx - w / 2) + ' ' + f(base) + 'Q' + f(cx - w * .46) + ' ' + f(base - h * .9) + ' ' + f(cx - w * .12) + ' ' + f(base - h) +
      'Q' + f(cx + w * .06) + ' ' + f(base - h * 1.08) + ' ' + f(cx + w * .2) + ' ' + f(base - h * .96) + 'Q' + f(cx + w * .48) + ' ' + f(base - h * .82) + ' ' + f(cx + w / 2) + ' ' + f(base) + 'Z' }, { fill: '--pfx-autumn-brown' }));
    for (i = 0; i < n; i++) {
      var u = rnd(seed + i * 3), v = rnd(seed + i * 3 + 1);
      var x = cx + (u - .5) * w * .9, top = base - h * (1 - Math.pow(2 * (x - cx) / w, 2)) * .92, y = top + v * (base - top) * .85 + 1;
      auLeaf(p, x, y, (.26 + rnd(seed + i * 3 + 2) * .2) * h / 14, rnd(seed + i + 40) * 360, AU_LEAF[i % AU_LEAF.length], i % 3 === 0);
    }
    return p;
  }
  // A CHILD POPPING UP OUT OF A PILE, its middle at x and the pile's top at y,
  // arms up; o says its skin, hair and jumper (as indexes), the hair's style,
  // glasses, ear defenders, and a leaf caught in its hair.
  function auKid(g, x, y, k, o) {
    var c = scaled(g, x, y, k), skin = AU_SKIN[o.skin], hair = AU_HAIR[o.hair], top = AU_JUMPER[o.jumper];
    c.appendChild(svgEl('path', { d: 'M-4.6 -3L-11 -17.6M4.6 -3L11 -17.6' }, { stroke: top, sw: 3.6 }));
    [-1, 1].forEach(function (sd) { c.appendChild(svgEl('circle', { cx: sd * 11.4, cy: -18.6, r: 2.1 }, { fill: skin, stroke: '--pfx-autumn-line', sw: .45 })); });
    c.appendChild(svgEl('path', { d: 'M-6.4 14V-1.6C-6.4 -4.4 -4 -6 0 -6C4 -6 6.4 -4.4 6.4 -1.6V14Z' }, { fill: top, stroke: '--pfx-autumn-line', sw: .5 }));
    if (o.style === 'curls') {
      c.appendChild(svgEl('circle', { cx: 0, cy: -15, r: 7.6 }, { fill: hair }));
      for (var a = 0; a < 360; a += 36) c.appendChild(svgEl('circle', { cx: f(7.4 * Math.cos(a * Math.PI / 180)), cy: f(-15.4 + 7.4 * Math.sin(a * Math.PI / 180)), r: 2.1 }, { fill: hair }));
    } else if (o.style === 'bob') c.appendChild(svgEl('path', { d: 'M-6.8 -9C-7.8 -18 -4 -21.2 0 -21.2C4 -21.2 7.8 -18 6.8 -9Z' }, { fill: hair }));
    else if (o.style === 'bunches') [-1, 1].forEach(function (sd) {
      c.appendChild(svgEl('circle', { cx: sd * 7.6, cy: -15.6, r: 3.3 }, { fill: hair }));
      c.appendChild(svgEl('circle', { cx: sd * 5.7, cy: -15.6, r: 1.1 }, { fill: '--pfx-autumn-jumper-4' }));
    });
    c.appendChild(svgEl('rect', { x: -1.7, y: -9, width: 3.4, height: 3.6 }, { fill: skin }));
    c.appendChild(svgEl('circle', { cx: 0, cy: -13.6, r: 5.6 }, { fill: skin, stroke: '--pfx-autumn-line', sw: .5 }));
    var fringe = {
      curls: 'M-5.8 -14.4C-6.4 -19.8 -2.6 -21 0 -20.8C3 -21 6.4 -19.6 5.8 -14.4C4.4 -16.8 2 -17.4 0 -16.4C-2 -17.4 -4.4 -16.8 -5.8 -14.4Z',
      bob: 'M-5.8 -13.4C-5.6 -18.6 -2.2 -20 0 -20C2.4 -20 5.6 -18.6 5.8 -13.4L4.8 -15.8C2.2 -17.2 -2.2 -17.2 -4.8 -15.8Z',
      bunches: 'M-5.8 -14.2C-6 -19.4 -2.6 -20.4 0 -20.4C2.6 -20.4 6 -19.4 5.8 -14.2C3.6 -16.6 -3.6 -16.6 -5.8 -14.2Z',
      short: 'M-5.8 -14.4C-6 -19.8 -2.4 -20.6 0 -20.6C2.8 -20.6 6.2 -19.4 5.8 -14.4C4.8 -16.2 1 -17.6 -2 -16.8C-3.6 -16.4 -5 -15.8 -5.8 -14.4Z'
    };
    c.appendChild(svgEl('path', { d: fringe[o.style] }, { fill: hair }));
    c.appendChild(svgEl('circle', { cx: -2, cy: -13.2, r: .7 }, { fill: '--pfx-autumn-line' }));
    c.appendChild(svgEl('circle', { cx: 2, cy: -13.2, r: .7 }, { fill: '--pfx-autumn-line' }));
    c.appendChild(svgEl('path', { d: 'M-2.2 -11Q0 -9 2.2 -11' }, { stroke: '--pfx-autumn-line', sw: .6 }));
    if (o.glasses) c.appendChild(svgEl('path', { d: 'M-3.8 -13.2A1.8 1.8 0 1 0 -.2 -13.2A1.8 1.8 0 1 0 -3.8 -13.2ZM.2 -13.2A1.8 1.8 0 1 0 3.8 -13.2A1.8 1.8 0 1 0 .2 -13.2Z' }, { stroke: '--pfx-autumn-line', sw: .5 }));
    if (o.ears) {
      c.appendChild(svgEl('path', { d: 'M-6 -13C-6.6 -22.4 6.6 -22.4 6 -13' }, { stroke: '--pfx-autumn-jumper-2', sw: 1.5 }));
      [-1, 1].forEach(function (sd) { c.appendChild(svgEl('ellipse', { cx: sd * 6.1, cy: -13, rx: 1.8, ry: 2.7 }, { fill: '--pfx-autumn-jumper-2', stroke: '--pfx-autumn-line', sw: .4 })); });
    }
    if (o.leaf) auLeaf(c, 3.4, -19.6, .32, 30, AU_LEAF[2], true);
  }
  // A CHILD IN A WHEELCHAIR, side on, its wheels on the ground at x y, facing
  // right (dir 1) or left (-1), throwing leaves up with both hands; toss says
  // how the leaves over its hands go up where drawings move.
  function auChair(g, x, y, k, dir, o, toss) {
    var c = group(g, 'translate(' + f(x) + ' ' + f(y) + ') scale(' + k3(k * dir) + ' ' + k3(k) + ')');
    var skin = AU_SKIN[o.skin], hair = AU_HAIR[o.hair], top = AU_JUMPER[o.jumper], legs = AU_JUMPER[o.legs];
    c.appendChild(svgEl('path', { d: 'M-7 -14H9L11.6 -6.6M-7 -14L-9.4 -29H-13.4M9 -14L14 -6H18.4' }, { stroke: '--pfx-autumn-chair', sw: 1.7 }));
    c.appendChild(svgEl('path', { d: 'M-4 -16.4H8.4L13 -9' }, { stroke: legs, sw: 4.2 }));
    c.appendChild(svgEl('ellipse', { cx: 15.4, cy: -7.4, rx: 2.8, ry: 1.7 }, { fill: '--pfx-autumn-line' }));
    c.appendChild(svgEl('path', { d: 'M-1.6 -26.4L6.4 -43M-1.6 -26.4L-7.6 -43.4' }, { stroke: top, sw: 3.2 }));
    c.appendChild(svgEl('path', { d: 'M-7 -15C-8 -22 -6 -27.6 -1.6 -28.6C2.6 -29 4.4 -25 4 -15Z' }, { fill: top, stroke: '--pfx-autumn-line', sw: .5 }));
    [[6.8, -44.4], [-8, -44.8]].forEach(function (h) { c.appendChild(svgEl('circle', { cx: h[0], cy: h[1], r: 2 }, { fill: skin, stroke: '--pfx-autumn-line', sw: .45 })); });
    c.appendChild(svgEl('rect', { x: -1.8, y: -31.4, width: 3.4, height: 3.4 }, { fill: skin }));
    c.appendChild(svgEl('circle', { cx: .6, cy: -34.8, r: 5.4 }, { fill: skin, stroke: '--pfx-autumn-line', sw: .5 }));
    c.appendChild(svgEl('path', { d: 'M-4.6 -34C-5.6 -40 -.6 -41.6 2.6 -40.8C5.6 -40 6.6 -37.6 6.2 -36.4C4.4 -38 1 -38.2 -1 -36.8C-2.4 -35.8 -3.6 -34.6 -4.6 -34Z' }, { fill: hair }));
    c.appendChild(svgEl('circle', { cx: 2.6, cy: -35.2, r: .65 }, { fill: '--pfx-autumn-line' }));
    c.appendChild(svgEl('circle', { cx: 5, cy: -35, r: .6 }, { fill: '--pfx-autumn-line' }));
    c.appendChild(svgEl('path', { d: 'M2.4 -32.6Q4 -31 5.6 -32.6' }, { stroke: '--pfx-autumn-line', sw: .55 }));
    // the big wheel beside the child, its hand rim and spokes, and the little one
    var sp = '';
    for (var a = 0; a < 180; a += 30) {
      var ca = Math.cos(a * Math.PI / 180) * 9, sa = Math.sin(a * Math.PI / 180) * 9;
      sp += 'M' + f(-2 - ca) + ' ' + f(-10 - sa) + 'L' + f(-2 + ca) + ' ' + f(-10 + sa);
    }
    c.appendChild(svgEl('path', { d: sp, 'stroke-opacity': '.7' }, { stroke: '--pfx-autumn-chair', sw: .45 }));
    c.appendChild(svgEl('circle', { cx: -2, cy: -10, r: 10 }, { stroke: '--pfx-autumn-line', sw: 1.8 }));
    c.appendChild(svgEl('circle', { cx: -2, cy: -10, r: 8 }, { stroke: '--pfx-autumn-chair', sw: .9 }));
    c.appendChild(svgEl('circle', { cx: -2, cy: -10, r: 1.5 }, { fill: '--pfx-autumn-chair' }));
    c.appendChild(svgEl('circle', { cx: 12, cy: -2.3, r: 2.3 }, { stroke: '--pfx-autumn-line', sw: 1.2 }));
    // leaves over its hands: still, and going up where drawings move
    if (toss) {
      var still = group(c);
      still.setAttribute('class', 'fx-still');
      [[-.6, -50, 40], [-8.4, -51.6, 160], [7.4, -52.6, 280]].forEach(function (l, i) {
        auLeaf(still, l[0], l[1], .36, l[2], AU_LEAF[i + 1], i % 2 === 0);
        var fly = svgEl('g', { opacity: '0' }, { cls: toss.cls, t: toss.t, d: toss.d });
        fly.style.removeProperty('fill');
        fly.style.setProperty('--tx', f((i - 1) * 10) + 'px');
        fly.style.setProperty('--ty', f(-18 - i * 5) + 'px');
        auLeaf(fly, l[0] * .6, -45, .36, l[2], AU_LEAF[i + 2], i % 2 === 1);
        c.appendChild(fly);
      });
    }
    return c;
  }
  // THE TREE: a trunk from its foot at x y, h tall, branching up into a crown
  // of autumn leaves w wide (at h 70); cls sways the crown.
  function auTree(g, x, y, h, w, seed, cls) {
    var kk = h / 70, t = scaled(g, x, y, kk), i;
    t.appendChild(svgEl('path', { d: 'M-7 2C-5 -14 -4 -30 -6 -42C-10 -48 -16 -52 -26 -56L-25 -58.6C-15 -55.6 -9 -52 -4.4 -48C-3.6 -54 -3.6 -60 -6.4 -68L-2.6 -69C.6 -61 1 -54 .8 -47.4C5 -52.4 11 -56.4 19 -58.6L20 -56C12.4 -53 7.4 -48 4 -42C3 -30 4 -14 7 2Z' }, { fill: '--pfx-autumn-bark' }));
    t.appendChild(svgEl('path', { d: 'M4 -42C3 -30 4 -14 7 2M.8 -47.4C5 -52.4 11 -56.4 19 -58.6' }, { stroke: '--pfx-autumn-bark-2', sw: f(Math.max(.8, 1.2 / kk)) }));
    t.appendChild(svgEl('path', { d: 'M-3 -10q1.4 -4 0 -8M1.6 -24q-1 -4 0 -7M-2 -34q1 -3 0 -5', 'stroke-opacity': '.6' }, { stroke: '--pfx-autumn-line', sw: .5 }));
    t.appendChild(svgEl('path', { d: 'M-7 2Q-12 3 -16 4M7 2Q12 3 15 4' }, { stroke: '--pfx-autumn-bark', sw: 1.6 }));
    var crown = svgEl('g', {}, { cls: cls || '' });
    crown.style.removeProperty('fill');
    t.appendChild(crown);
    // the darker leaves at the back, the brighter in front, and loose ones round the edge
    var n = Math.round(w * 1.3), lay, j;
    for (lay = 0; lay < 2; lay++) for (i = 0; i < n; i++) {
      var a = rnd(seed + i * 2 + lay * 500) * Math.PI * 2, rr = Math.sqrt(rnd(seed + i * 2 + 1 + lay * 500)) * (lay ? .9 : 1);
      crown.appendChild(svgEl('circle', { cx: f(Math.cos(a) * rr * w), cy: f(-66 + Math.sin(a) * rr * 24), r: f((6 + rnd(seed + i + 77 + lay * 300) * 6) * w / 34) },
        { fill: lay ? AU_LEAF[i % 4] : (i % 2 ? '--pfx-autumn-rust' : '--pfx-autumn-brown') }));
    }
    for (j = 0; j < w; j++) {
      var b = j / w * Math.PI * 2;
      auLeaf(crown, Math.cos(b) * w * 1.08, -66 + Math.sin(b) * 26, .36 * w / 34, rnd(seed + j + 900) * 360, AU_LEAF[j % AU_LEAF.length], j % 2 === 0);
    }
  }
  // A PILE WITH A CHILD IN IT: the child behind the pile's front and clipped at
  // the ground, popping up out of it where drawings move, leaves flying off it.
  // peek is how far lower the child is, so only its head shows.
  function auPop(g, clip, cx, base, w, h, o, k, d, seed, peek) {
    var top = base - h, inside = group(g), i;
    inside.setAttribute('clip-path', clip);
    var pop = svgEl('g', {}, { cls: 'fx-au-pop', t: 9, d: d });
    pop.style.removeProperty('fill');
    pop.style.setProperty('--sink', f(26 * k - (peek || 0)) + 'px');
    auKid(pop, cx, top + 3 + (peek || 0), k, o);
    inside.appendChild(pop);
    auPile(g, cx, base, w, h, seed);
    var still = group(g);
    still.setAttribute('class', 'fx-still');
    for (i = 0; i < 4; i++) {
      var tx = (i - 1.5) * w * .24, ty = -(h + 8 + rnd(seed + i + 50) * 12);
      auLeaf(still, cx + tx * .7, top + ty * .5, .34, rnd(seed + i) * 360, AU_LEAF[(i + 1) % AU_LEAF.length], i % 2 === 0);
      var fly = svgEl('g', { opacity: '0' }, { cls: 'fx-au-toss', t: 9, d: d });
      fly.style.removeProperty('fill');
      fly.style.setProperty('--tx', f(tx) + 'px');
      fly.style.setProperty('--ty', f(ty) + 'px');
      auLeaf(fly, cx + tx * .1, top + 2, .34, rnd(seed + i + 9) * 360, AU_LEAF[(i + 2) % AU_LEAF.length], i % 2 === 1);
      g.appendChild(fly);
    }
  }
  function auScene() {
    var s = fxSvg(380, 112, 'pf-fx__scene'), defs = fxDefs(s), g = group(s), i;
    g.setAttribute('mask', fxFade(defs, 132, 196, 380, 112));
    g.appendChild(paint(svgEl('rect', { x: 130, y: 0, width: 250, height: 112 }, {}),
      fxGrad(defs, [0, 0, 0, 1], [[0, .95, { stop: '--pfx-autumn-sky' }], [1, .95, { stop: '--pfx-autumn-haze' }]])));
    var sun = svgEl('circle', { cx: 372, cy: 4, r: 34, 'fill-opacity': '.75' }, { fill: '--pfx-autumn-light' });
    sun.style.setProperty('filter', fxBlur(defs, 8));
    g.appendChild(sun);
    // a far hedge of trees turning, and the grass with leaves lying on it
    for (i = 0; i < 14; i++) g.appendChild(svgEl('circle', { cx: f(150 + i * 17 + rnd(i + 900) * 8), cy: f(88 + rnd(i + 910) * 3), r: f(7 + rnd(i + 920) * 5), 'fill-opacity': '.5' }, { fill: i % 2 ? '--pfx-autumn-rust' : '--pfx-autumn-gold' }));
    g.appendChild(svgEl('path', { d: 'M130 95C170 91 220 93 262 91C302 89 342 93 380 91V112H130Z' }, { fill: '--pfx-autumn-grass' }));
    for (i = 0; i < 22; i++) auLeaf(g, 160 + rnd(i + 940) * 216, 98 + rnd(i + 950) * 12, .32, rnd(i + 960) * 360, AU_LEAF[i % AU_LEAF.length], i % 3 === 0);
    auTree(g, 344, 100, 92, 34, 0, 'fx-au-sway');
    auChair(g, 250, 100.5, .78, -1, { skin: 4, hair: 1, jumper: 1, legs: 2 }, { cls: 'fx-au-toss', t: 9, d: 1.6 });
    auPop(g, fxClip(defs, 150, -40, 110, 139), 206, 100, 46, 15, { skin: 1, hair: 2, jumper: 0, style: 'bunches', leaf: true }, .85, 0, 1000);
    auPop(g, fxClip(defs, 262, -40, 60, 140), 292, 101, 38, 12, { skin: 3, hair: 0, jumper: 2, style: 'curls', ears: true }, .72, 3.2, 1060, 7);
    // leaves coming down
    [[230, 30, 0], [258, 46, 1], [282, 20, 2], [304, 62, 3], [320, 76, 4], [366, 64, 0], [244, 66, 2], [222, 52, 3], [354, 84, 1]].forEach(function (l, j) {
      var fall = svgEl('g', {}, { cls: 'fx-au-fall', t: 8 + rnd(j + 980) * 4, d: -rnd(j + 990) * 10 });
      fall.style.removeProperty('fill');
      fall.style.setProperty('--run', f(100 - l[1]) + 'px');
      fall.style.setProperty('--sx', f((rnd(j + 1000) - .5) * 30) + 'px');
      var swing = svgEl('g', {}, { cls: 'fx-au-swing' });
      swing.style.removeProperty('fill');
      swing.style.setProperty('--s', f(2.6 + rnd(j) * 1.2) + 's');
      auLeaf(swing, l[0], l[1], .5, rnd(j + 1010) * 360, AU_LEAF[l[2]], j % 2 === 0);
      fall.appendChild(swing);
      g.appendChild(fall);
    });
    return s;
  }
  function auMoment() {
    var box = el('div', 'pf-fx__moment'), i;
    var wash = fxSvg(100, 100, 'pf-fx__au-wash', 'none'), wd = fxDefs(wash);
    wash.appendChild(paint(svgEl('rect', { x: 0, y: 0, width: 100, height: 100 }, {}),
      fxGrad(wd, [0, 0, 0, 1], [[0, .66, { stop: '--pfx-autumn-sky' }], [1, .6, { stop: '--pfx-autumn-haze' }]])));
    box.appendChild(wash);
    var tree = fxSvg(300, 420, 'pf-fx__au-tree', 'xMaxYMax meet');
    auTree(tree, 210, 420, 330, 46, 300, 'fx-au-sway');
    box.appendChild(tree);
    // leaves coming down all over the profile
    var leaves = el('div', 'pf-fx__au-leaves');
    for (i = 0; i < 30; i++) {
      var lf = fxSpan(leaves, 'pf-fx__au-fall', 4 + rnd(i + 1100) * 90, 4 + rnd(i + 1130) * 30, rnd(i + 1160) * 3.6);
      lf.style.setProperty('--sx', f((rnd(i + 1190) - .5) * 20));
      lf.style.setProperty('--fall', f(54 + rnd(i + 1220) * 26));
      var ts = tiny(12 + rnd(i + 1250) * 14), swing = group(ts);
      swing.setAttribute('class', 'fx-au-swing');
      swing.style.setProperty('--s', f(2.2 + rnd(i + 1280) * 1.4) + 's');
      swing.appendChild(svgEl('path', { d: i % 3 ? leaf(9, 5) : AU_MAPLE }, { fill: AU_LEAF[i % AU_LEAF.length], stroke: '--pfx-autumn-line', sw: .5 }));
      lf.appendChild(ts);
    }
    box.appendChild(leaves);
    // the piles along the foot, growing as the leaves land, and a child in each
    var piles = fxSvg(400, 120, 'pf-fx__au-piles', 'xMinYMax meet'), pd = fxDefs(piles), pg = group(piles);
    auChair(pg, 152, 117, 1.9, 1, { skin: 2, hair: 3, jumper: 1, legs: 0 }, { cls: 'fx-mo-au-toss', d: 1 });
    [[60, 117, 100, 30, { skin: 4, hair: 0, jumper: 0, style: 'curls' }, 2, 0],
     [256, 117, 110, 34, { skin: 0, hair: 3, jumper: 3, style: 'bob', glasses: true, leaf: true }, 2.1, .5],
     [354, 118, 84, 26, { skin: 2, hair: 1, jumper: 2, style: 'short', ears: true }, 1.8, 1]].forEach(function (p, j) {
      var inside = group(pg);
      inside.setAttribute('clip-path', fxClip(pd, p[0] - 80, -100, 160, p[1] + 99));
      var pop = svgEl('g', {}, { cls: 'fx-mo-au-pop', d: p[6] });
      pop.style.removeProperty('fill');
      pop.style.setProperty('--sink', f(28 * p[5]) + 'px');
      auKid(pop, p[0], p[1] - p[3] + 3, p[5], p[4]);
      inside.appendChild(pop);
      var grow = svgEl('g', {}, { cls: 'fx-mo-au-pile' });
      grow.style.removeProperty('fill');
      auPile(grow, p[0], p[1], p[2], p[3], 1300 + j * 97);
      pg.appendChild(grow);
      for (var k = 0; k < 6; k++) {
        var fly = svgEl('g', { opacity: '0' }, { cls: 'fx-mo-au-toss', d: p[6] });
        fly.style.removeProperty('fill');
        fly.style.setProperty('--tx', f((k - 2.5) * p[2] * .14) + 'px');
        fly.style.setProperty('--ty', f(-(p[3] + 20 + rnd(j * 6 + k + 1400) * 30)) + 'px');
        auLeaf(fly, p[0] + (k - 2.5) * 4, p[1] - p[3] + 4, .5 * p[5], rnd(j * 6 + k + 1420) * 360, AU_LEAF[(j + k) % AU_LEAF.length], k % 2 === 0);
        pg.appendChild(fly);
      }
    });
    box.appendChild(piles);
    return box;
  }
  M.aumaple = function (g) {
    var s = svgEl('g', {}, { cls: 'art-sway', t: 5 });
    s.style.removeProperty('fill');
    s.appendChild(svgEl('path', { d: AU_MAPLE }, { fill: '--pfx-autumn-red', stroke: '--pfx-autumn-line', sw: .7 }));
    s.appendChild(svgEl('path', { d: 'M0 3.6V10.6M0 3V-7M0 1L5.6 -3M0 1L-5.6 -3', 'stroke-opacity': '.55' }, { stroke: '--pfx-autumn-line', sw: .6 }));
    g.appendChild(s);
  };
  M.auleaf = function (g) { g.appendChild(svgEl('path', { d: leaf(9, 5) }, { fill: '--pfx-autumn-gold', stroke: '--pfx-autumn-line', sw: .7, cls: 'art-sway', t: 4.4 })); };
  M.auacorn = function (g) {
    g.appendChild(svgEl('path', { d: 'M-4.4 -1.6C-4.4 5 -1 8 0 8.4C1 8 4.4 5 4.4 -1.6Z' }, { fill: '--pfx-autumn-gold', stroke: '--pfx-autumn-line', sw: .7 }));
    g.appendChild(svgEl('path', { d: 'M-5.6 -1.4C-5.6 -6.4 5.6 -6.4 5.6 -1.4Z' }, { fill: '--pfx-autumn-brown', stroke: '--pfx-autumn-line', sw: .7 }));
    g.appendChild(svgEl('path', { d: 'M0 -5L1 -8.4' }, { stroke: '--pfx-autumn-line', sw: 1 }));
  };
  // the pass: leaves drifting down, each a colour of its own in turn
  var auNext = 0;
  M.aufall = function (g) {
    var ink = AU_LEAF[auNext % AU_LEAF.length], maple = auNext % 2 === 0;
    auNext++;
    var s = svgEl('g', {}, { cls: 'fx-au-swing' });
    s.style.removeProperty('fill');
    s.style.setProperty('--s', '3s');
    s.appendChild(svgEl('path', { d: maple ? AU_MAPLE : leaf(9, 5) }, { fill: ink, stroke: '--pfx-autumn-line', sw: .6 }));
    g.appendChild(s);
  };
  E.autumn = {
    scene: function (box) {
      box.appendChild(auScene());
      box.appendChild(auMoment());
    },
    edge: [['aumaple', 'tl', 0, 20, -20, [16, 14]], ['auleaf', 'top', .6, 12, 40], ['auacorn', 'bl', 0, 16, -10, [16, -14]], ['aumaple', 'br', 0, 22, 30, [-18, -16]]],
    pass: { motif: 'aufall', from: 'top', n: 8, size: 15, t: 26, drift: 16 }
  };
  /* effect:autumn:end */

  /* effect:cloudcity:begin */
  /* CLOUD CITY (Ryan, 2026-10-23: "Create a new CB/profile theme called
     Cloud City inspired by Cloud City in Star Wars. Create a profile effect for
     Cloud City as well as the full complement of profile customizations"), after
     the city in the clouds of Bespin in The Empire Strikes Back (1980). Drawn in
     the Cloud City theme's declared --cb-cloud-* inks, and make-profile.py
     holds this block to them: a sunset over a sea of cloud is a light no
     card's seven inks can be relied on for. NOBODY FROM THE FILMS IS DRAWN and
     no emblem of theirs: the city, its cloud cars and the sunset are drawn
     here, and make-profile.py refuses the films' people by name in this block,
     its credit and the theme's line. Nothing makes a sound and nothing flashes.

     The still part is dusk over the banner's right-hand part: the sky going
     from night through rose to gold, a few stars still out, a striped sun going
     down behind a sea of cloud, the city standing out of it on its stalk with
     its windows lit, and two cloud cars holding station beside it. Where
     drawings move, the cloud drifts, the cars hold station, some windows come
     and go and the sun's glow breathes. The opening, on the Lagoon's
     sixty-second clock: the sunset comes up over the profile with a sea of
     cloud along its foot, the city rises out of the cloud at the right, its
     windows lighting from the top down, the sun sinks at the left, and a pair
     of cloud cars flies out from the city towards you, about nine seconds of
     every sixty. The pass is cloud cars crossing the profile. */
  var CC_SUN = ['--cb-cloud-amber', '--cb-cloud-amber', '--cb-cloud-amber-2', '--cb-cloud-amber-2', '--cb-cloud-rose'];
  // a cloud car's two pods, the one behind in shade
  var CC_PODS = ['--cb-cloud-car-2', '--cb-cloud-car'];
  // A STRIPED SUN centred cx cy, R across, its glow behind it.
  function ccSun(g, cx, cy, R, defs, still) {
    var halo = svgEl('g', {}, { cls: still ? '' : 'fx-breathe', t: 9 });
    halo.style.removeProperty('fill');
    if (defs) halo.style.setProperty('filter', fxBlur(defs, f(R * .25)));
    halo.appendChild(svgEl('circle', { cx: f(cx), cy: f(cy), r: f(R * 1.7), 'fill-opacity': '.18' }, { fill: '--cb-cloud-amber-2' }));
    halo.appendChild(svgEl('circle', { cx: f(cx), cy: f(cy), r: f(R * 1.3), 'fill-opacity': '.22' }, { fill: '--cb-cloud-amber' }));
    g.appendChild(halo);
    SUN_BARS.forEach(function (b, i) {
      g.appendChild(svgEl('path', { d: slice(cx, cy, R, cy - R + b[0] * R, cy - R + b[1] * R) }, { fill: CC_SUN[i] }));
    });
  }
  // A SEA OF CLOUD w across from top down to h: puffs in shade underneath,
  // their bodies, and the sun on their tops, the light on some breathing.
  function ccSea(g, w, top, h, k, seed) {
    var puffs = [], x = -10 * k, i = 0;
    while (x < w + 10 * k) {
      var rr = (6 + rnd(seed + i) * 6) * k;
      puffs.push([x, top + rr * (.7 + rnd(seed + i + 50) * .5), rr]);
      x += rr * (1.1 + rnd(seed + i + 90) * .5);
      i++;
    }
    g.appendChild(svgEl('rect', { x: -20, y: f(top + 10 * k), width: f(w + 40), height: f(h - top) }, { fill: '--cb-cloud-shade' }));
    puffs.forEach(function (q) { g.appendChild(svgEl('circle', { cx: f(q[0]), cy: f(q[1] + q[2] * .4), r: f(q[2]) }, { fill: '--cb-cloud-shade' })); });
    puffs.forEach(function (q) { g.appendChild(svgEl('circle', { cx: f(q[0]), cy: f(q[1]), r: f(q[2] * .92) }, { fill: '--cb-cloud-puff' })); });
    puffs.forEach(function (q, j) {
      g.appendChild(svgEl('ellipse', { cx: f(q[0] - q[2] * .1), cy: f(q[1] - q[2] * .44), rx: f(q[2] * .7), ry: f(q[2] * .34) }, { fill: '--cb-cloud-glow', cls: j % 4 ? '' : 'fx-breathe', d: j * .9 % 7, t: 9 }));
    });
  }
  // [across from the middle, how tall, how wide] in sixteenths of the city's
  // half-width: towers crowded on the deck, the highest near its middle.
  var CC_TOWERS = [[-12, 2.6, 2.6], [-9.4, 4.6, 2.4], [-6.8, 7, 2.6], [-4.2, 9.6, 2.4], [-1.6, 12.2, 2.4], [.8, 15, 2],
    [3.2, 11, 2.6], [5.8, 8.4, 2.4], [8.4, 6, 2.6], [11, 3.6, 2.4], [13.2, 2, 2.2]];
  // THE CITY ON ITS STALK, its deck's middle at cx y and R from there to its
  // rim: the underside narrowing into a stalk that goes down to base, the
  // towers with their windows, the deck, the rim catching the sunset under it,
  // and the windows round the rim. o.win is a window's class, and o.step how
  // far apart in time the windows light, from the top down.
  function ccCity(g, cx, y, R, base, o) {
    o = o || {};
    var s = R / 16, lw = Math.max(.4, .18 * s), top = y - 15 * s;
    function lit(wx, wy) {
      return o.step != null ? { fill: '--cb-cloud-window', cls: o.win, d: (wy - top) / (17 * s) * o.step * 20 } :
        { fill: '--cb-cloud-window', cls: rnd(wx * 7 + wy) < .3 ? o.win : '', d: rnd(wx + wy * 3) * 6, t: 8 };
    }
    g.appendChild(svgEl('rect', { x: f(cx - 1.4 * s), y: f(y + 4 * s), width: f(2.8 * s), height: f(Math.max(0, base - y - 4 * s)) }, { fill: '--cb-cloud-stalk' }));
    g.appendChild(svgEl('path', { d: 'M' + f(cx - R) + ' ' + f(y) + 'C' + f(cx - R * .7) + ' ' + f(y + 3 * s) + ' ' + f(cx - 3 * s) + ' ' + f(y + 3.4 * s) + ' ' + f(cx - 1.8 * s) + ' ' + f(y + 7 * s) +
      'L' + f(cx + 1.8 * s) + ' ' + f(y + 7 * s) + 'C' + f(cx + 3 * s) + ' ' + f(y + 3.4 * s) + ' ' + f(cx + R * .7) + ' ' + f(y + 3 * s) + ' ' + f(cx + R) + ' ' + f(y) + 'Z' },
      { fill: '--cb-cloud-tower-2', stroke: '--cb-cloud-line', sw: lw }));
    // the sunset caught under the deck
    g.appendChild(svgEl('path', { d: 'M' + f(cx - R * .9) + ' ' + f(y + 1.2 * s) + 'C' + f(cx - R * .5) + ' ' + f(y + 3 * s) + ' ' + f(cx - 4 * s) + ' ' + f(y + 3.4 * s) + ' ' + f(cx - 2 * s) + ' ' + f(y + 6 * s), 'stroke-opacity': '.7' }, { stroke: '--cb-cloud-amber-2', sw: lw * 1.6 }));
    CC_TOWERS.forEach(function (t) {
      var tx = cx + t[0] * s, tw = t[2] * s, th = t[1] * s, wy;
      g.appendChild(svgEl('rect', { x: f(tx - tw / 2), y: f(y - th), width: f(tw), height: f(th + s), rx: f(Math.min(tw / 2, .8 * s)) }, { fill: '--cb-cloud-tower', stroke: '--cb-cloud-line', sw: lw }));
      g.appendChild(svgEl('rect', { x: f(tx + tw * .1), y: f(y - th + .6 * s), width: f(tw * .34), height: f(th - .6 * s), 'fill-opacity': '.75' }, { fill: '--cb-cloud-tower-2' }));
      for (wy = y - th + 1.4 * s; wy < y - s; wy += 1.8 * s) {
        if (rnd(tx * 3 + wy) < .6) g.appendChild(svgEl('rect', { x: f(tx - tw * .3), y: f(wy), width: f(tw * .34), height: f(.7 * s) }, lit(tx, wy)));
      }
    });
    g.appendChild(svgEl('ellipse', { cx: f(cx), cy: f(y), rx: f(R), ry: f(1.7 * s) }, { fill: '--cb-cloud-tower', stroke: '--cb-cloud-line', sw: lw }));
    g.appendChild(svgEl('path', { d: 'M' + f(cx - R) + ' ' + f(y) + 'A' + f(R) + ' ' + f(1.7 * s) + ' 0 0 0 ' + f(cx + R) + ' ' + f(y) }, { stroke: '--cb-cloud-amber-2', sw: Math.max(.6, .5 * s) }));
    for (var wx = cx - R + 2 * s; wx < cx + R - 1.6 * s; wx += 2.4 * s) {
      g.appendChild(svgEl('circle', { cx: f(wx), cy: f(y + .2 * s), r: f(Math.max(.45, .42 * s)) }, lit(wx, y)));
    }
    // a light on the highest tower
    g.appendChild(svgEl('circle', { cx: f(cx + .8 * s), cy: f(y - 15.9 * s), r: f(Math.max(.5, .55 * s)) }, { fill: '--cb-cloud-amber', cls: 'fx-breathe', t: 5 }));
  }
  // A CLOUD CAR, two pods side by side joined amidships, seen from a little
  // above, facing right, about twenty long at k 1: the pod behind in shade,
  // glass forward and the engines aft.
  function ccCar(g, x, y, k) {
    var c = scaled(g, x, y, k);
    function pod(py, ink) {
      c.appendChild(svgEl('rect', { x: -9, y: f(py - 2.1), width: 18, height: 4.2, rx: 2.1 }, { fill: ink, stroke: '--cb-cloud-line', sw: .5 }));
      c.appendChild(svgEl('ellipse', { cx: 5.6, cy: f(py - .4), rx: 2.6, ry: 1.5 }, { fill: '--cb-cloud-glass' }));
      c.appendChild(svgEl('circle', { cx: -9.4, cy: f(py), r: 1.2 }, { fill: '--cb-cloud-amber' }));
    }
    pod(-2, CC_PODS[0]);
    c.appendChild(svgEl('rect', { x: -3.4, y: -1.6, width: 5.4, height: 3.2, rx: .8 }, { fill: '--cb-cloud-car-2' }));
    pod(1.8, CC_PODS[1]);
    return c;
  }
  function ccScene() {
    var s = fxSvg(380, 112, 'pf-fx__scene'), defs = fxDefs(s), g = group(s), i;
    g.setAttribute('mask', fxFade(defs, 132, 196, 380, 112));
    g.appendChild(paint(svgEl('rect', { x: 130, y: 0, width: 250, height: 112 }, {}),
      fxGrad(defs, [0, 0, 0, 1], [[0, 1, { stop: '--cb-cloud-bar' }], [.3, 1, { stop: '--cb-cloud-sky' }], [.52, 1, { stop: '--cb-cloud-dusk' }],
        [.68, 1, { stop: '--cb-cloud-rose' }], [.82, 1, { stop: '--cb-cloud-amber-2' }], [.94, 1, { stop: '--cb-cloud-amber' }]])));
    for (i = 0; i < 16; i++) {
      var sx = 140 + rnd(i + 600) * 236, sy = 3 + rnd(i + 630) * 26;
      g.appendChild(svgEl('circle', { cx: f(sx), cy: f(sy), r: f(.45 + rnd(i + 660) * .7) }, { fill: '--cb-cloud-steel', cls: i % 3 ? '' : 'art-twinkle', d: i * .6 % 5, t: 5 }));
    }
    ccSun(g, 330, 74, 22, defs);
    // far cloud low on the horizon, in the dusk
    var far = svgEl('g', {}, { cls: 'fx-drift', t: 46 });
    far.style.removeProperty('fill');
    [[180, 82, 30, 3.4], [228, 86, 26, 3], [300, 84, 34, 3.2], [362, 80, 22, 2.6]].forEach(function (c) {
      far.appendChild(svgEl('ellipse', { cx: c[0], cy: c[1], rx: c[2], ry: c[3], 'fill-opacity': '.8' }, { fill: '--cb-cloud-deep' }));
    });
    g.appendChild(far);
    ccCity(g, 236, 46, 36, 104, { win: 'art-twinkle' });
    var sea = svgEl('g', {}, { cls: 'fx-drift', t: 38 });
    sea.style.removeProperty('fill');
    ccSea(group(sea, 'translate(120 0)'), 280, 88, 112, .8, 700);
    g.appendChild(sea);
    // two cloud cars holding station beside the city
    [[312, 30, .62, 0], [350, 46, .46, 1.8]].forEach(function (c) {
      var hold = svgEl('g', {}, { cls: 'fx-cc-hold', d: c[3], t: 7 });
      hold.style.removeProperty('fill');
      ccCar(hold, c[0], c[1], c[2]);
      g.appendChild(hold);
    });
    return s;
  }
  function ccMoment() {
    var box = el('div', 'pf-fx__moment');
    var sky = fxSvg(100, 100, 'pf-fx__cc-sky', 'none'), sd = fxDefs(sky);
    sky.appendChild(paint(svgEl('rect', { x: 0, y: 0, width: 100, height: 100 }, {}),
      fxGrad(sd, [0, 0, 0, 1], [[0, .95, { stop: '--cb-cloud-bar' }], [.28, .92, { stop: '--cb-cloud-sky' }], [.5, .9, { stop: '--cb-cloud-dusk' }],
        [.68, .9, { stop: '--cb-cloud-rose' }], [.84, .9, { stop: '--cb-cloud-amber-2' }], [1, .9, { stop: '--cb-cloud-amber' }]])));
    box.appendChild(sky);
    // the sun going down at the left
    var sun = fxSvg(100, 100, 'pf-fx__cc-sun'), sunDefs = fxDefs(sun);
    ccSun(group(sun), 50, 50, 34, sunDefs, true);
    box.appendChild(sun);
    // the city, rising out of the cloud at the right, its windows lighting
    var big = fxSvg(300, 360, 'pf-fx__cc-city', 'xMaxYMax meet');
    ccCity(group(big), 160, 150, 118, 360, { win: 'fx-mo-cc-win', step: .08 });
    box.appendChild(big);
    // the sea of cloud along the foot, a nearer bank in front of a farther
    var sea = fxSvg(400, 120, 'pf-fx__cc-sea', 'xMidYMax slice');
    ccSea(group(sea), 400, 40, 120, 1.2, 900);
    ccSea(group(sea), 400, 74, 120, 1.6, 960);
    box.appendChild(sea);
    // a pair of cloud cars flying out from the city towards you
    [[0, -46, -12, 46], [.45, -38, 4, 38]].forEach(function (c, j) {
      var sp = fxSpan(box, 'pf-fx__cc-car', 66 + j * 4, 40 + j * 6, c[0]);
      sp.style.setProperty('--px', f(c[1]));
      sp.style.setProperty('--py', f(c[2]));
      var t = tiny(c[3]);
      ccCar(t, 0, 0, 1.1);
      sp.appendChild(t);
    });
    return box;
  }
  M.ccloud = function (g) {
    [[-6, 2, 5.4], [0, -1, 7], [6.4, 1.6, 5], [10, 3.4, 3.4], [-10, 3.6, 3.2]].forEach(function (q) { g.appendChild(svgEl('circle', { cx: q[0], cy: f(q[1] + 2), r: q[2] }, { fill: '--cb-cloud-shade' })); });
    [[-6, 2, 5.4], [0, -1, 7], [6.4, 1.6, 5], [10, 3.4, 3.4], [-10, 3.6, 3.2]].forEach(function (q) { g.appendChild(svgEl('circle', { cx: q[0], cy: q[1], r: f(q[2] * .9) }, { fill: '--cb-cloud-puff' })); });
    g.appendChild(svgEl('ellipse', { cx: -1, cy: -4, rx: 5, ry: 2.4 }, { fill: '--cb-cloud-glow' }));
    g.appendChild(svgEl('ellipse', { cx: 6, cy: -.8, rx: 3, ry: 1.6 }, { fill: '--cb-cloud-glow' }));
  };
  M.ccar = function (g) { ccCar(g, 0, 0, .58); };
  M.csun = function (g) {
    ccSun(g, 0, -1, 8.4, null, true);
    [[-6, 7, 4.4], [0, 8, 5.4], [6.4, 7.4, 4.2]].forEach(function (q) { g.appendChild(svgEl('circle', { cx: q[0], cy: q[1], r: q[2] }, { fill: '--cb-cloud-puff' })); });
    g.appendChild(svgEl('ellipse', { cx: 0, cy: 4.4, rx: 4, ry: 1.6 }, { fill: '--cb-cloud-glow' }));
  };
  E.cloudcity = {
    scene: function (box) {
      box.appendChild(ccScene());
      box.appendChild(ccMoment());
    },
    edge: [['ccloud', 'tl', 0, 22, 0, [16, 14]], ['ccar', 'top', .58, 16], ['ccloud', 'bl', 0, 20, 0, [16, -12]], ['csun', 'br', 0, 22, 0, [-16, -14]], ['ccar', 'right', .42, 13]],
    pass: { motif: 'ccar', from: 'left', n: 3, size: 26, t: 32, drift: 10 }
  };
  /* effect:cloudcity:end */

  /* effect:muchness:begin */
  /* BRING YOUR MUCHNESS (Ryan, 2026-10-29: "Make the Esmx animation available
     as a profile effect"), the street's MAX GLITTER fanfare (muchness.js) on a
     profile. ESMX IS KAYA OLDAKER'S OWN RAINBOW LEAPING, the same file as the
     fanfare's, exactly as she drew it, with her alt text and her name on it;
     nothing of hers is redrawn here. Everything this block draws is in the
     fanfare's own declared --much-* inks, measured in check-contrast.py, and
     make-profile.py holds it to them. Nothing makes a sound and nothing
     flashes: every spark comes up over most of a second and goes over a second
     and a half or more, the fanfare's FADE_FLOOR.

     The still part is glitter: a four-pointed star at each corner and smaller
     ones along the sides, each outlined in the sign's night so it shows on any
     theme. The opening, on the Lagoon's sixty-second clock: a glow comes up
     from the foot of the profile, Esmx rises into it, "Bring Your Muchness"
     comes up on its sign above them in shining gold, sparks rise all round,
     and after about nine seconds of every sixty it all goes back down. The
     picture is loading="lazy", so nobody fetches it until the opening is
     drawn, which is only where drawings move. The pass is glitter rising
     across the profile. */
  var MU_GLINTS = ['--much-gold', '--much-pink', '--much-sky', '--much-mint', '--much-violet', '--much-white'];
  var MU_ALT = 'A drawing of Esmx - a porkypine (part pig, part porcupine) with a pink and green colour scheme ' +
    'for the body and a huge, trailing rainbow mohawk/spikes. The spikes trail off and separate, as if they ' +
    'are made of energy. Esmx is wearing an earring in one ear and is missing a chunk in the other ear. ' +
    'Esmx is running and punching the air with one fist.';
  // A FOUR-POINTED STAR, outlined in the night, in one of the glitter's inks.
  function muStar(g, r, i) {
    var a = r * .25;
    g.appendChild(svgEl('path', { d: 'M0 ' + f(-r) + 'L' + f(a) + ' ' + f(-a) + ' ' + f(r) + ' 0 ' + f(a) + ' ' + f(a) + ' 0 ' + f(r) + ' ' + f(-a) + ' ' + f(a) + ' ' + f(-r) + ' 0 ' + f(-a) + ' ' + f(-a) + 'Z' },
      { fill: MU_GLINTS[i % MU_GLINTS.length], stroke: '--much-night', sw: 1.2 }));
  }
  M.mglint = function (g) { muStar(g, 10, 0); };
  M.mglints = function (g) {
    muStar(group(g, 'translate(-3 2)'), 7.4, 1);
    muStar(group(g, 'translate(6 -6)'), 4.4, 2);
    muStar(group(g, 'translate(5.6 7)'), 3.4, 3);
  };
  M.mglint2 = function (g) { muStar(g, 8, 4); };
  function muMoment() {
    var box = el('div', 'pf-fx__moment');
    box.appendChild(el('div', 'pf-fx__mu-aura'));
    for (var i = 0; i < 18; i++) {
      var sp = fxSpan(box, 'pf-fx__mu-spark', 4 + 92 * rnd(i + 31), 46 + 50 * rnd(i + 57), f(rnd(i + 11) * 3.6));
      var t = tiny(10 + rnd(i + 5) * 14);
      muStar(t, 10, i);
      sp.appendChild(t);
    }
    var sign = el('div', 'pf-fx__mu-sign');
    sign.appendChild(el('span', 'pf-fx__mu-kicker', 'MAX GLITTER'));
    sign.appendChild(el('span', 'pf-fx__mu-words', 'Bring Your Muchness'));
    var col = el('div', 'pf-fx__mu-col');
    col.appendChild(sign);
    var fig = el('div', 'pf-fx__mu-fig');
    var img = el('img', 'pf-fx__mu-esmx');
    img.alt = MU_ALT;
    img.setAttribute('data-credit', 'Esmx the Porkypine, Rainbow Leaping, drawn by Kaya Oldaker for the Stimpunks Foundation (CC BY-SA 4.0)');
    img.loading = 'lazy';
    img.decoding = 'async';
    img.src = '/art/esmx-leaping.webp';
    fig.appendChild(img);
    col.appendChild(fig);
    box.appendChild(col);
    return box;
  }
  E.muchness = {
    scene: function (box) { box.appendChild(muMoment()); },
    edge: [['mglints', 'tl', 0, 22, 0, [14, 14]], ['mglint2', 'top', .4, 12], ['mglint', 'tr', 0, 18, 0, [-14, 14]], ['mglint2', 'left', .55, 11],
      ['mglints', 'bl', 0, 20, 0, [14, -14]], ['mglint2', 'bottom', .62, 12], ['mglints', 'br', 0, 22, 0, [-14, -14]], ['mglint2', 'right', .38, 11]],
    pass: { motif: 'mglint', from: 'bottom', n: 9, size: 14, t: 24, drift: 10 }
  };
  /* effect:muchness:end */

  var EDGE_AT = {
    tl: function () { return [0, 0]; }, tr: function () { return [100, 0]; },
    bl: function () { return [0, 100]; }, br: function () { return [100, 100]; },
    top: function (a) { return [a * 100, 0]; }, bottom: function (a) { return [a * 100, 100]; },
    left: function (a) { return [0, a * 100]; }, right: function (a) { return [100, a * 100]; }
  };
  function passOne(p, i) {
    var one = el('span', 'pf-fx__one');
    var across = 6 + 88 * (i + .5 + (rnd(i + 7) - .5) * .6) / p.n;
    var drift = (rnd(i + 3) - .5) * 2 * (p.drift || 0), start, px, py;
    if (p.from === 'left') { start = [-8, across]; px = 116; py = drift; }
    else if (p.from === 'right') { start = [104, across]; px = -116; py = drift; }
    else if (p.from === 'top') { start = [across, -8]; px = drift; py = 116; }
    else if (p.from === 'bottom') { start = [across, 104]; px = drift; py = -116; }
    else { start = [-8, across * .6 - 10]; px = 116; py = 70; }
    one.style.left = f(start[0]) + '%';
    one.style.top = f(start[1]) + '%';
    one.style.setProperty('--px', f(px));
    one.style.setProperty('--py', f(py));
    one.style.setProperty('--t', p.t + 's');
    one.style.setProperty('--d', f(i * p.t * .5 / p.n) + 's');
    var bob = el('span', 'fx-bob');
    bob.style.setProperty('--b', f(2.6 + rnd(i) * 1.6) + 's');
    bob.appendChild(motif(p.motif, p.size, true));
    one.appendChild(bob);
    return one;
  }
  function effect(key) {
    var e = E[key];
    if (!e) return null;
    var box = el('div', 'pf-fx');
    box.setAttribute('aria-hidden', 'true');
    if (e.scene) e.scene(box);
    e.edge.forEach(function (sp) {
      var s = motif(sp[0], sp[3], false, sp[4]);
      s.setAttribute('class', 'pf-fx__edge');
      var pos = EDGE_AT[sp[1]](sp[2]), off = sp[5] || [0, 0];
      s.style.left = 'calc(' + f(pos[0]) + '% + ' + f(off[0]) + 'px)';
      s.style.top = 'calc(' + f(pos[1]) + '% + ' + f(off[1]) + 'px)';
      box.appendChild(s);
    });
    var pass = el('div', 'pf-fx__pass');
    for (var i = 0; i < e.pass.n; i++) pass.appendChild(passOne(e.pass, i));
    box.appendChild(pass);
    return box;
  }
  function effectName(key) {
    for (var i = 0; i < EFFECTS.length; i++) if (EFFECTS[i][0] === key) return EFFECTS[i][1];
    return '';
  }
  function effectCredit(key) { return Object.prototype.hasOwnProperty.call(EFFECT_CREDITS, key) ? EFFECT_CREDITS[key] : ''; }

  /* A FRAME AND AN EFFECT ROUND A PROFILE, or round the card in the editor:
     stage holds one thing, the profile's sheet or the card, and wears the
     card's theme, so the band and everything drawn on it are in that theme's
     seven inks and no frame or effect brings a colour nobody measured. With no
     theme chosen, it wears the radio's own, as the card does. Drawing again
     replaces what was there. */
  function surround(stage, p) {
    p = p || {};
    stage.classList.add('pf-stage');
    // The same frame and effect in the same theme are left alone, so an effect
    // that is playing is not started again by a change to something else.
    var sig = [p.theme || '', p.frame || '', p.effect || ''].join('|');
    if (stage.pfSig === sig) return;
    stage.pfSig = sig;
    [].slice.call(stage.children).forEach(function (k) {
      if (k.classList.contains('pf-frame') || k.classList.contains('pf-fx')) stage.removeChild(k);
    });
    if (p.theme) dress(stage, p.theme);
    else {
      PARTS.forEach(function (x) { stage.style.removeProperty('--cb-' + x); });
      stage.removeAttribute('data-pf-theme');
    }
    var fr = p.frame && frame(p.frame);
    stage.classList.toggle('pf-stage--framed', !!fr);
    if (fr) stage.insertBefore(fr, stage.firstChild);
    var fx = p.effect && effect(p.effect);
    if (fx) stage.appendChild(fx);
  }

  /* THE CARD. p is the profile as the street holds it, o the rest: handle,
     mark ({ base, claimed }), wearing (the avatar worn, or null), and what
     cb.js lends it: md(box, text) for the bio, links(parent, text) for an
     address, room(tag) for a room's name and path, onAvatar(button) to open
     the avatar larger, and mine when it is your own. Every part left empty is
     left off. */
  function card(p, o) {
    p = p || {};
    var c = el('div', 'pf-card');
    // No theme chosen: the card wears whatever the radio it is seen on wears.
    if (p.theme) dress(c, p.theme);
    var ban = el('div', 'pf-banner');
    ban.setAttribute('aria-hidden', 'true');
    c.appendChild(ban);
    c.pfBanner = ban;
    var top = el('div', 'pf-top');
    var face = el('div', 'pf-face');
    if (o.wearing && window.loveAvatar) {
      var open = el('button', 'pf-avatar');
      open.type = 'button';
      open.setAttribute('aria-label', 'Open the avatar ' + (o.mine ? 'you wear' : o.handle + ' wears') + ' larger' + (o.wearing.about ? '. ' + o.wearing.about : ''));
      var art = window.loveAvatar.draw(o.wearing.look, { ground: true, crop: 'bust', cls: 'pf-avatar__art' });
      if (art) open.appendChild(art);
      if (o.onAvatar) open.addEventListener('click', function () { o.onAvatar(open); });
      face.appendChild(open);
    } else {
      face.appendChild(el('div', 'pf-avatar pf-avatar--none'));
    }
    var deco = p.decoration && decoration(p.decoration);
    if (deco) face.appendChild(deco);
    top.appendChild(face);
    c.appendChild(top);
    var body = el('div', 'pf-body');
    var h = el('h2', 'pf-name', o.handle);
    h.id = o.nameId || 'pf-name';
    h.tabIndex = -1;
    nameStyle(h, p.face);
    body.appendChild(h);
    c.pfName = h;
    var line = el('p', 'pf-line');
    if (o.mark && o.mark.base) line.appendChild(el('span', 'cb-tag', 'BASE'));
    if (p.pronouns) line.appendChild(el('span', 'pf-pronouns', p.pronouns));
    if (line.childNodes.length) body.appendChild(line);
    // The tagline, one line of their own under the name, as the directory shows it.
    if (p.tagline) body.appendChild(el('p', 'pf-tagline', p.tagline));
    if (p.bio && o.md) {
      body.appendChild(el('h3', 'pf-sub', 'About'));
      var bio = el('div', 'pf-panel pf-bio');
      o.md(bio, p.bio);
      body.appendChild(bio);
    }
    var room = p.room && o.room && o.room(p.room);
    if (room) {
      body.appendChild(el('h3', 'pf-sub', 'Favourite room'));
      var rp = el('div', 'pf-panel pf-room');
      var ra = el('a', 'pf-room__name', room.name);
      ra.href = room.path;
      rp.appendChild(ra);
      if (p.why) rp.appendChild(el('p', 'pf-room__why', p.why));
      body.appendChild(rp);
    }
    if (p.links && p.links.length && o.links) {
      body.appendChild(el('h3', 'pf-sub', 'Elsewhere'));
      var ul = el('ul', 'pf-links');
      p.links.forEach(function (l) { var li = el('li'); o.links(li, l); ul.appendChild(li); });
      body.appendChild(ul);
    }
    var credit = p.effect && effectCredit(p.effect);
    if (credit) body.appendChild(el('p', 'pf-credit', credit));
    c.appendChild(body);
    return c;
  }
  /* A LINE IN THE COMMUNITY DIRECTORY (Ryan's ask, 2026-10-23), as
     directory.js lists it and the editor shows it before it is saved: the
     avatar they wear, their name, BASE, pronouns, tagline and nameplate. o is
     { handle, base, tagline, pronouns, avatar }; name is what carries the
     name, a button in the directory and plain words otherwise; tag is the
     element the line is. The nameplate is drawn by the caller once the line is
     in the page, at the width it has: drawing(line.pfPlate, plate). */
  function listing(o, name, tag) {
    var row = el(tag || 'div', 'cb-dir-row');
    var face = el('span', 'cb-dir-face');
    var art = o.avatar && window.loveAvatar && window.loveAvatar.draw(o.avatar.look, { crop: 'bust', ground: true });
    if (art) {
      face.appendChild(art);
      if (o.avatar.about) { face.setAttribute('role', 'img'); face.setAttribute('aria-label', o.handle + '\u2019s avatar: ' + o.avatar.about); }
      else face.setAttribute('aria-hidden', 'true');
    } else {
      face.classList.add('cb-dir-face--none');
      face.setAttribute('aria-hidden', 'true');
    }
    row.appendChild(face);
    var words = el('div', 'cb-dir-words');
    var line = el('p', 'cb-dir-line');
    line.appendChild(name || el('b', 'cb-dir-name', o.handle));
    if (o.base) line.appendChild(el('span', 'cb-tag', 'BASE'));
    if (o.pronouns) line.appendChild(el('span', 'pf-pronouns', o.pronouns));
    words.appendChild(line);
    if (o.tagline) words.appendChild(el('p', 'cb-dir-tagline', o.tagline));
    var plate = el('div', 'pf-plate');
    plate.setAttribute('aria-hidden', 'true');
    plate.hidden = true;
    words.appendChild(plate);
    row.pfPlate = plate;
    row.appendChild(words);
    return row;
  }

  /* The banner is drawn once the card is in the page, at the width it has. */
  function drawCard(c, p) { drawing(c.pfBanner, p && p.banner); c.classList.toggle('pf-card--banner', !c.pfBanner.hidden); }

  window.loveProfile = {
    FACES: FACES, DECORATIONS: DECORATIONS, FRAMES: FRAMES, EFFECTS: EFFECTS, dress: dress, nameStyle: nameStyle, faceOf: faceOf,
    drawing: drawing, decoration: decoration, decorationName: decorationName, frameName: frameName, effectName: effectName, effectCredit: effectCredit,
    card: card, drawCard: drawCard, surround: surround, listing: listing
  };
})();

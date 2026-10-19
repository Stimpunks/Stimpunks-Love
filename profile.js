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
    ['butterflies', 'Butterflies'], ['crystals', 'Crystals'], ['lanterns', 'Jack-o’-lanterns'], ['otterring', 'Otters in kelp']
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
    ['garland', 'Flower garland'], ['starry', 'Starry night'], ['gate', 'Graveyard gate'], ['fronds', 'Kelp fronds']
  ];
  /* profile:frames:end */
  /* profile:effects:begin */
  var EFFECTS = [
    ['butterflies', 'Butterflies'], ['fireflies', 'Fireflies'], ['petals', 'Falling petals'], ['leaves', 'Falling leaves'],
    ['snow', 'Snowfall'], ['bubbles', 'Bubbles'], ['sparkles', 'Sparkles'], ['shooting', 'Shooting stars'],
    ['notes', 'Music notes'], ['hearts', 'Hearts'], ['lagoon', 'Black Leather Lagoon'], ['otters', 'Otters in the kelp'],
    ['fairy', 'Flying Fairy']
  ];
  /* profile:effects:end */
  /* AN EFFECT AFTER SOMEBODY ELSE'S WORK SAYS WHOSE, on the card it is on and
     in the editor, because attribution is the habit this street kept. */
  var EFFECT_CREDITS = {
    otters: 'Effect after the Arcade\u2019s Otterly Adorbs, which is built on Helen Edgar\u2019s Stimpunks Solidarity and Otters and Star Stuff\u2019s zine No. 58, The Stone You Keep. The kelp does the holding, and floating fills nothing: these otters float because they want to.',
    lagoon: 'Effect after the street\u2019s Black Leather Lagoon and The Cramps, the band of Lux Interior and Poison Ivy. Their world, not them: nobody real is drawn, the creature is our own, and the poison ivy round the edge is a nod to her name.',
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
      fr.side(group(s, 'matrix(' + sd[3].split(' ').join(',') + ')' + up), L / SCALE);
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
    else if (o.mark && o.mark.claimed) line.appendChild(el('span', 'cb-tag cb-tag--claimed', 'CLAIMED'));
    if (p.pronouns) line.appendChild(el('span', 'pf-pronouns', p.pronouns));
    if (line.childNodes.length) body.appendChild(line);
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
  /* The banner is drawn once the card is in the page, at the width it has. */
  function drawCard(c, p) { drawing(c.pfBanner, p && p.banner); c.classList.toggle('pf-card--banner', !c.pfBanner.hidden); }

  window.loveProfile = {
    FACES: FACES, DECORATIONS: DECORATIONS, FRAMES: FRAMES, EFFECTS: EFFECTS, dress: dress, nameStyle: nameStyle, faceOf: faceOf,
    drawing: drawing, decoration: decoration, decorationName: decorationName, frameName: frameName, effectName: effectName, effectCredit: effectCredit,
    card: card, drawCard: drawCard, surround: surround
  };
})();

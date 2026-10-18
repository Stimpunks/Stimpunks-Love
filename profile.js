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
    ['butterflies', 'Butterflies'], ['crystals', 'Crystals']
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
    ['garland', 'Flower garland'], ['starry', 'Starry night']
  ];
  /* profile:frames:end */
  /* profile:effects:begin */
  var EFFECTS = [
    ['butterflies', 'Butterflies'], ['fireflies', 'Fireflies'], ['petals', 'Falling petals'], ['leaves', 'Falling leaves'],
    ['snow', 'Snowfall'], ['bubbles', 'Bubbles'], ['sparkles', 'Sparkles'], ['shooting', 'Shooting stars'],
    ['notes', 'Music notes'], ['hearts', 'Hearts'], ['lagoon', 'Black Leather Lagoon']
  ];
  /* profile:effects:end */
  /* AN EFFECT AFTER SOMEBODY ELSE'S WORK SAYS WHOSE, on the card it is on and
     in the editor, because attribution is the habit this street kept. */
  var EFFECT_CREDITS = {
    lagoon: 'Effect after the street\u2019s Black Leather Lagoon and The Cramps, the band of Lux Interior and Poison Ivy. Their world, not them: nobody real is drawn, the creature is our own, and the poison ivy round the edge is a nod to her name.'
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
      fr.corner(g);
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
  E.lagoon = {
    scene: function (box) {
      box.appendChild(lagoonScene());
      box.appendChild(lagoonVine(false));
      box.appendChild(lagoonVine(true));
      box.appendChild(lagoonLeopard());
    },
    edge: [['hotrod', 'br', 0, 34, 0, [-30, -11]]],
    pass: { motif: 'bat', from: 'right', n: 6, size: 24, t: 24, drift: 14 }
  };
  /* effect:lagoon:end */

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

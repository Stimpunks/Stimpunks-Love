/* PROFILES ON THE CB (Ryan, 2026-10-17, after requests for profiles more
   like Discord's). cb.js loads this, with cb-themes.js and avatar.js, the
   first time somebody opens a profile or edits their own, and draws with it:
   the card a profile is, its banner, the decoration round the avatar it wears,
   its name in the face chosen for it, and the nameplate under a name on Who's
   online. It fetches nothing, keeps nothing and sends nothing: cb.js asks the
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
   and nothing flashes. There is no date on a card, and nothing on it counts. */
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
    c.appendChild(body);
    return c;
  }
  /* The banner is drawn once the card is in the page, at the width it has. */
  function drawCard(c, p) { drawing(c.pfBanner, p && p.banner); c.classList.toggle('pf-card--banner', !c.pfBanner.hidden); }

  window.loveProfile = {
    FACES: FACES, DECORATIONS: DECORATIONS, dress: dress, nameStyle: nameStyle, faceOf: faceOf,
    drawing: drawing, decoration: decoration, decorationName: decorationName, card: card, drawCard: drawCard
  };
})();

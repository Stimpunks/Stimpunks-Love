/* Norah's room, The Sandbox: its script, brought onto the street by
   tools/import-room.py from the artifact they sent. Replaced whole when they send a
   new version, so change the artifact and import it again rather than editing here. */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var slots = [30, 100, 170, 240, 310];
  var order = [2, 1, 3, 0, 4];
  var state = { towers: [1, 2, 3], walls: [1, 2], flags: [2], fallen: false, knocks: 0 };
  var pieces = document.getElementById("sb-pieces");
  var label = document.getElementById("sb-castle-label");
  var status = document.getElementById("sb-status");
  var controls = document.getElementById("sb-controls");
  controls.hidden = false;
  var play = document.getElementById("sb-play");
  var hop = document.getElementById("sb-hop");
  var ballpos = document.getElementById("sb-ballpos");
  var heaps = [0, 0, 0, 0, 0], heapX = [-30, 60, 150, 240, 330], digs = 0;
  var pies = [], pieX = [15, 105, 195, 285], pieCount = 0, ballSide = 0;
  var digWords = ["You dug up some sand.", "A little heap. It doesn’t have to be anything.", "More sand, just because.", "Dig, dig. No plan needed."];

  function el(name, attrs) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  function piece() {
    var g = el("g", { "class": "sb-piece" + (state.fallen ? " sb-fallen sb-ember" : "") });
    pieces.appendChild(g);
    return g;
  }
  function tower(x) {
    var g = piece();
    g.appendChild(el("rect", { "class": "sb-f-sand", x: x - 20, y: 106, width: 40, height: 64 }));
    [-20, -4, 12].forEach(function (d) {
      g.appendChild(el("rect", { "class": "sb-f-sand", x: x + d, y: 98, width: 8, height: 10 }));
    });
    g.appendChild(el("rect", { "class": "sb-f-glow", x: x + 10, y: 106, width: 10, height: 64, opacity: "0.35" }));
    g.appendChild(el("rect", { "class": "sb-f-ink", x: x - 4, y: 124, width: 8, height: 12, rx: 4 }));
  }
  function wall(i) {
    var g = piece(), x = slots[i] + 20;
    g.appendChild(el("rect", { "class": "sb-f-deep", x: x, y: 138, width: 30, height: 32 }));
    [0, 12, 23].forEach(function (d) {
      g.appendChild(el("rect", { "class": "sb-f-deep", x: x + d, y: 132, width: 7, height: 8 }));
    });
  }
  function flag(i) {
    var g = piece(), x = slots[i];
    g.appendChild(el("line", { "class": "sb-s-ink", x1: x, y1: 98, x2: x, y2: 66, "stroke-width": "2.5" }));
    g.appendChild(el("path", { "class": "sb-f-glow", d: "M" + (x + 1) + " 66 L" + (x + 24) + " 73 L" + (x + 1) + " 80 Z" }));
  }
  function plural(n, one, many) { return n + " " + (n === 1 ? one : many); }
  function describe() {
    if (!state.towers.length) return "Smooth sand, ready to build on.";
    var s = "A sandcastle with " + plural(state.towers.length, "tower", "towers") + ", " +
      plural(state.walls.length, "wall", "walls") + " and " + plural(state.flags.length, "flag", "flags") + ".";
    return state.fallen ? "A heap of glowing embers that was " + s.charAt(0).toLowerCase() + s.slice(1) : s;
  }
  function drawPlay() {
    while (play.firstChild) play.removeChild(play.firstChild);
    heaps.forEach(function (h, i) {
      if (!h) return;
      var x = heapX[i], w = 16 + h * 8;
      play.appendChild(el("path", { "class": "sb-f-sand", d: "M" + (x - w) + " 214 Q" + x + " " + (214 - h * 14) + " " + (x + w) + " 214 Z" }));
    });
    pies.forEach(function (i) {
      var x = pieX[i];
      play.appendChild(el("path", { "class": "sb-f-sand", d: "M" + (x - 18) + " 214 L" + (x - 13) + " 192 L" + (x + 13) + " 192 L" + (x + 18) + " 214 Z" }));
      play.appendChild(el("rect", { "class": "sb-f-deep", x: x - 13, y: 197, width: 26, height: 3 }));
    });
  }
  function around() {
    var n = heaps.filter(Boolean).length, p = pies.length;
    var s = " A bucket and a spade lie on one side and a beach ball on the other.";
    if (n) s += " In front: " + plural(n, "heap", "heaps") + " of dug sand.";
    if (p) s += " " + (n ? "Also " : "In front: ") + plural(p, "sand pie", "sand pies") + " tipped out of the bucket.";
    return s;
  }
  function labelAll() { label.textContent = describe() + around(); }
  function render() {
    while (pieces.firstChild) pieces.removeChild(pieces.firstChild);
    state.towers.slice().sort().forEach(function (i) { tower(slots[i]); });
    state.walls.forEach(wall);
    state.flags.forEach(flag);
    labelAll();
  }
  function clearRubble() {
    if (state.fallen) { state.towers = []; state.walls = []; state.flags = []; state.fallen = false; }
  }
  var actions = {
    dig: function () {
      var i = digs % 5; digs += 1;
      if (heaps[i] < 4) heaps[i] += 1;
      drawPlay(); labelAll();
      return digWords[(digs - 1) % digWords.length];
    },
    pie: function () {
      var i = pieCount % 4; pieCount += 1;
      if (pies.indexOf(i) < 0) pies.push(i);
      drawPlay(); labelAll();
      return "You tipped out a bucket of sand. A sand pie!";
    },
    ball: function () {
      ballSide = 1 - ballSide;
      ballpos.style.transform = ballSide ? "translateX(47px)" : "";
      hop.classList.remove("sb-hopping");
      void hop.getBoundingClientRect();
      hop.classList.add("sb-hopping");
      return ballSide ? "Boing. The ball bounced over to the far side." : "Boing. The ball bounced back.";
    },
    tower: function () {
      clearRubble();
      var next = order.filter(function (i) { return state.towers.indexOf(i) < 0; })[0];
      if (next === undefined) return "Every spot has a tower. Burn it down and start again.";
      state.towers.push(next); render(); return "Tower added. " + describe();
    },
    wall: function () {
      clearRubble();
      for (var i = 0; i < 4; i++) {
        if (state.towers.indexOf(i) > -1 && state.towers.indexOf(i + 1) > -1 && state.walls.indexOf(i) < 0) {
          state.walls.push(i); render(); return "Wall added. " + describe();
        }
      }
      return "A wall needs two towers side by side with nothing between them. Add a tower first.";
    },
    flag: function () {
      clearRubble();
      var bare = state.towers.filter(function (i) { return state.flags.indexOf(i) < 0; })[0];
      if (bare === undefined) return state.towers.length ? "Every tower already has a flag." : "A flag needs a tower to stand on. Add a tower first.";
      state.flags.push(bare); render(); return "Flag added. " + describe();
    },
    wreck: function () {
      if (!state.towers.length) return "There is nothing standing to burn down yet.";
      if (state.fallen) return "It is already a heap. Smooth the sand, or just start building.";
      state.fallen = true; state.knocks += 1;
      var list = pieces.querySelectorAll(".sb-piece");
      for (var i = 0; i < list.length; i++) { list[i].classList.add("sb-fallen"); list[i].classList.add("sb-ember"); }
      labelAll();
      return "Burned down. Nothing was lost. Times burned down this visit: " + state.knocks + ".";
    },
    smooth: function () {
      state.towers = []; state.walls = []; state.flags = []; state.fallen = false;
      heaps = [0, 0, 0, 0, 0]; pies = []; drawPlay();
      render(); return "The sand is smooth again.";
    }
  };
  controls.addEventListener("click", function (e) {
    var b = e.target.closest("[data-sb-do]");
    if (b) status.textContent = actions[b.getAttribute("data-sb-do")]();
  });
})();

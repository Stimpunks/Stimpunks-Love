/* =============================================================================
   A Quiet Pint, walked into on Cel Street. Ryan's ask, 2026-10-31: down the
   street a room at a time.

   IT IS THE PUB'S OWN PLAN, STOOD UP (§100). The page draws the room as a
   perspective of the plan in data/a-quiet-pint.json, and this scene is built
   from the very same plan, so the two cannot disagree: every table, stool,
   column, mirror, window, beam, fan, the bar's stretches, the stove, the
   piano, the steps and the ramp stand where the plan puts them. The numbers
   below, in PLAN, are the plan's own, in its inches, worked out by the pub's
   own tool's functions (make-a-quiet-pint.py's patches(), arc_point() and
   seat_spots()), and written in between the cel:plan markers by
   tools/make-cel-street.py on every run, because a room's file reads nothing:
   never by hand, so a table moved on the plan is moved here the next run.
   Thirteen of everything are Jim Butcher's numbers, no two alike and none in
   a row.

   THE LIGHT IS THE STREET'S, PASSED ROUND BY THE MIRRORS. Grey daylight comes
   in at the windows at the top of the north wall, at the level of the
   pavement, and lies on the floor under them; the rest reaches the tables by
   the mirrors, in patches where the plan says each mirror sends it, a little
   dim and a little green. Nothing is lit warm: the stove is shut and nobody
   lights a lamp, which is what keeps the browns off The Den.

   NO SCREEN ANYWHERE. The player piano is the only music, and its rolls are
   the page's own, lifted onto its lid, playing as a strip of audio
   on a press through love-embed.js and fetching nothing before it. The fans
   stand still. The board on the bar is the page's, without its ordering
   buttons, which only the page's own script works: ordering stays on the
   page, on the far wall. Jim Butcher's words are lifted, never typed here.
   No wizard, nothing magic, and Mac is not drawn.

   AND THE WAY IN IS THE WAY THE PLAN BUILDS IT: down nine steps from the
   pavement to the door, with the ramp beside them, as wide as they are, in
   two runs with a landing to turn on and handrails both sides. You stand at
   the foot of both; the eye stays at its height, so neither is climbed here.

   It keeps nothing, sends nothing and fetches nothing. Every colour is one
   §100 declares, by name. tools/make-cel-street.py holds each of those.
   ========================================================================== */
(function () {
  'use strict';
  window.loveCelRooms = window.loveCelRooms || {};
  window.loveCelRooms['a-quiet-pint.html'] = {
    name: 'A Quiet Pint',
    build: function (kit) {
      var T = kit.THREE, at = kit.at, box = kit.box, cyl = kit.cyl;
      var M = function (a, b) { return new T.Matrix4().multiplyMatrices(a, b); };

      // The plan's own numbers, in inches (data/a-quiet-pint.json, by way of
      // tools/make-a-quiet-pint.py's own geometry), written by make-cel-street.py.
      // cel:plan:begin
      var PLAN = {"room":{"w":720,"d":480,"ceiling":92,"beam_bottom":82,"below_street":60,"eye":50,"window_sill":62,"window_top":84},"door":{"x0":600,"x1":640,"top":80},"steps":{"width":60,"risers":9,"tread":11},"ramp":{"width":60,"runs":[{"rise":30,"run":360},{"rise":30,"run":360}],"landing":60},"beams":[24,94,167,228,304,366,438],"fans":[{"x":230,"y":59,"span":44,"turn":12},{"x":470,"y":59,"span":38,"turn":47},{"x":350,"y":130,"span":50,"turn":31},{"x":590,"y":130,"span":34,"turn":74},{"x":270,"y":197,"span":40,"turn":58},{"x":520,"y":198,"span":46,"turn":5},{"x":200,"y":266,"span":52,"turn":39},{"x":410,"y":266,"span":36,"turn":66},{"x":660,"y":266,"span":31,"turn":21},{"x":300,"y":335,"span":48,"turn":83},{"x":600,"y":335,"span":42,"turn":52},{"x":250,"y":402,"span":30,"turn":9},{"x":540,"y":402,"span":37,"turn":70}],"windows":[{"x":10,"w":22},{"x":56,"w":31},{"x":118,"w":16},{"x":153,"w":36},{"x":216,"w":19},{"x":270,"w":27},{"x":319,"w":14},{"x":362,"w":38},{"x":438,"w":24},{"x":488,"w":33},{"x":554,"w":18},{"x":652,"w":29},{"x":690,"w":26}],"mirrors":[{"wall":"west","at":70,"z":64,"w":30,"h":26},{"wall":"west","at":150,"z":60,"w":22,"h":34},{"wall":"west","at":236,"z":66,"w":38,"h":20},{"wall":"west","at":330,"z":62,"w":26,"h":31},{"wall":"west","at":410,"z":58,"w":18,"h":18},{"wall":"north","at":180,"z":44,"w":20,"h":28},{"wall":"north","at":342,"z":46,"w":24,"h":22},{"wall":"north","at":436,"z":46,"w":17,"h":26},{"wall":"east","at":60,"z":52,"w":28,"h":36},{"wall":"east","at":132,"z":56,"w":21,"h":25},{"wall":"east","at":318,"z":50,"w":34,"h":23},{"wall":"east","at":392,"z":54,"w":23,"h":38},{"wall":"east","at":452,"z":46,"w":32,"h":24}],"patches":[[1,42,[[233.5,151.8],[250.0,151.8],[242.5,168.2],[226.0,168.2]]],[0,0,[[189.1,212.2],[224.3,212.2],[202.9,259.8],[167.7,259.8]]],[1,33,[[332.6,182.1],[352.4,182.1],[343.4,201.9],[323.6,201.9]]],[1,38,[[246.6,308.1],[266.4,308.1],[257.4,327.9],[237.6,327.9]]],[0,0,[[169.3,379.4],[198.1,379.4],[186.7,404.6],[157.9,404.6]]],[0,0,[[274.0,226.0],[306.0,214.8],[306.0,254.0],[274.0,265.2]]],[0,0,[[352.8,103.3],[391.2,89.9],[391.2,120.7],[352.8,134.1]]],[1,28,[[468.3,145.0],[483.7,139.6],[483.7,155.0],[468.3,160.4]]],[0,0,[[588.3,58.8],[633.1,58.8],[655.7,109.2],[610.9,109.2]]],[1,31,[[556.4,197.4],[569.6,197.4],[575.6,210.6],[562.4,210.6]]],[1,30,[[493.6,318.5],[520.0,318.5],[530.4,341.5],[504.0,341.5]]],[1,32,[[531.3,414.4],[554.4,414.4],[564.7,437.6],[541.6,437.6]]],[1,34,[[339.8,343.8],[372.8,343.8],[380.2,360.2],[347.2,360.2]]]],"bar":{"front":[[118,40],[138,104],[110,170],[130,236],[104,290],[126,364],[110,444]],"depth":26,"heights":[42,42,42,34,42,42],"stools":[[136.0,49.5],[142.2,69.6],[148.8,90.6],[149.5,112.2],[140.1,134.3],[130.4,157.3],[128.6,181.7],[136.4,207.6],[122.5,301.8],[130.5,328.7],[138.8,356.5],[136.7,385.7],[130.6,416.1]]},"stove":{"x0":684,"x1":716,"y0":220,"y1":256,"h":32,"flue":[700,238]},"piano":{"x0":236,"x1":294,"y0":0,"y1":25,"h":50,"bench":[246,25,284,39]},"columns":[{"key":"bremen","x":296,"y":128,"d":14,"bands":[[8,16,"rope"],[38,50,"figures"],[72,78,"rings"]]},{"key":"soup","x":586,"y":120,"d":11,"bands":[[12,20,"beads"],[44,56,"figures"]]},{"key":"turnip","x":400,"y":40,"d":17,"bands":[[6,12,"chevrons"],[30,44,"figures"],[64,70,"leaves"],[80,86,"rings"]]},{"key":"bears","x":628,"y":248,"d":21,"bands":[[18,30,"figures"],[58,64,"scallops"]]},{"key":"pea","x":512,"y":228,"d":19,"bands":[[4,10,"beads"],[14,66,"stack"],[76,82,"rope"]]},{"key":"mice","x":454,"y":258,"d":10,"bands":[[22,34,"figures"],[70,76,"chevrons"]]},{"key":"goats","x":444,"y":430,"d":15,"bands":[[10,18,"scallops"],[36,48,"figures"],[60,66,"rope"]]},{"key":"elves","x":186,"y":462,"d":13,"bands":[[16,28,"figures"],[50,56,"beads"],[74,80,"leaves"]]},{"key":"goose","x":700,"y":52,"d":9,"bands":[[26,40,"figures"]]},{"key":"beanstalk","x":360,"y":96,"d":16,"bands":[[2,88,"vine"]]},{"key":"tower","x":412,"y":270,"d":20,"bands":[[70,84,"window"],[8,70,"braid"]]},{"key":"shoes","x":196,"y":24,"d":12,"bands":[[6,14,"figures"],[46,52,"scallops"],[68,74,"beads"]]},{"key":"fisher","x":306,"y":288,"d":18,"bands":[[12,24,"waves"],[40,52,"figures"],[78,84,"waves"]]}],"tables":[{"n":1,"shape":"round","w":30,"h":42,"top":1.5,"base":"pedestal","seating":"stools","x":238,"y":160,"seats":[[257.2,174.4],[218.8,145.6]]},{"n":2,"shape":"long","w":72,"h":29,"top":1.5,"base":"pedestal","seating":"settle","x":520,"y":33,"d":30,"against":"north","seats":[]},{"n":3,"shape":"round","w":24,"h":31,"top":1.5,"base":"pedestal","seating":"chairs","x":566,"y":204,"seats":[[585.6,211.5],[546.4,196.5]]},{"n":4,"shape":"square","w":36,"h":33,"top":1.5,"base":"pedestal","seating":"chairs","x":338,"y":192,"seats":[[335.2,164.0],[340.8,220.0],[310.0,192],[366.0,192]]},{"n":5,"shape":"round","w":48,"h":30,"top":1.5,"base":"pedestal","seating":"chairs","x":512,"y":330,"seats":[[544.9,332.9],[525.9,359.9],[493.1,357.0],[479.1,327.1],[498.1,300.1],[530.9,303.0]]},{"n":6,"shape":"square","w":30,"h":16,"top":2,"base":"legs","seating":"armchairs","x":691,"y":132,"against":"east","seats":[[688.2,107.0],[693.8,157.0]]},{"n":7,"shape":"square","w":28,"h":24,"top":2,"base":"legs","seating":"settle","x":680,"y":340,"against":"east","seats":[]},{"n":8,"shape":"round","w":36,"h":38,"top":1.5,"base":"pedestal","seating":"stools","x":252,"y":318,"seats":[[276.3,329.8],[229.6,333.1],[250.1,291.1]]},{"n":9,"shape":"long","w":60,"h":34,"top":1.5,"base":"pedestal","seating":"chairs","x":360,"y":352,"d":30,"seats":[[357.2,327.0],[362.8,377.0],[320.0,352],[400.0,352]]},{"n":10,"shape":"square","w":24,"h":18,"top":2,"base":"legs","seating":"armchairs","x":228,"y":436,"seats":[[225.2,414.0],[230.8,458.0]]},{"n":11,"shape":"round","w":42,"h":32,"top":1.5,"base":"pedestal","seating":"chairs","x":548,"y":426,"seats":[[568.5,447.9],[533.5,452.2],[518.6,420.3],[544.3,396.2],[575.2,413.3]]},{"n":12,"shape":"long","w":36,"h":20,"top":2,"base":"legs","seating":"sofa","x":372,"y":444,"d":24,"against":"south","seats":[]},{"n":13,"shape":"round","w":28,"h":28,"top":2,"base":"legs","seating":"chairs","x":476,"y":150,"seats":[[495.7,161.8],[455.9,161.2],[476.4,127.0]]}]};
      // cel:plan:end

      // The plan's x runs east along the street wall and its y south away from
      // it. Cel Street's -Z is ahead as you come in at the door, facing south,
      // so the plan is stood up with east on your left: X = (620 - x), Z = -y.
      var S = 0.0254, OX = 620;
      var X = function (x) { return (OX - x) * S; };
      var Z = function (y) { return -y * S; };
      var I = function (v) { return v * S; };
      var R = PLAN.room, W = R.w, D = R.d, C = R.ceiling;
      var LEFT = Math.PI / 2, RIGHT = -Math.PI / 2;

      // A box by its extent on the plan, in inches.
      function pbox(x0, x1, y0, y1, z0, z1, ink, outline, shadow) {
        box(I(x1 - x0), I(z1 - z0), I(y1 - y0), at((X(x0) + X(x1)) / 2, I(z0 + z1) / 2, (Z(y0) + Z(y1)) / 2), ink, outline, shadow);
      }
      // Something standing on a shape of the plan, from z0 up h inches.
      function plate(pts) {
        var sh = new T.Shape();
        pts.forEach(function (p, i) { if (i) sh.lineTo(X(p[0]), p[1] * S); else sh.moveTo(X(p[0]), p[1] * S); });
        return sh;
      }
      function prism(pts, z0, h, ink, outline) {
        var g = new T.ExtrudeGeometry(plate(pts), { depth: I(h), bevelEnabled: false });
        kit.piece(g, at(0, I(z0), 0, 0, -Math.PI / 2), ink, outline);
      }
      function pcyl(x, y, r, z0, z1, ink, outline, seg) {
        cyl(I(r), I(r), I(z1 - z0), at(X(x), I(z0 + z1) / 2, Z(y)), ink, outline, seg || 14);
      }

      // THE LIGHT. Grey daylight, high in the north over the pavement, in at
      // the windows and down onto the floor under them; the walls and the
      // ceiling stop it everywhere else. A low grey fill is what the mirrors
      // and the pale walls give back.
      kit.scene.background = kit.col('--aqp-street');
      kit.scene.add(new T.HemisphereLight(kit.col('--aqp-light'), kit.col('--aqp-wall'), 6.2));
      var day = new T.DirectionalLight(kit.col('--aqp-light'), 3.0);
      day.position.set(X(360), 12, 9);
      day.target.position.set(X(360), 0, -3);
      day.castShadow = true;
      day.shadow.mapSize.set(2048, 2048);
      day.shadow.camera.left = -14; day.shadow.camera.right = 14;
      day.shadow.camera.top = 14; day.shadow.camera.bottom = -14;
      day.shadow.camera.near = 1; day.shadow.camera.far = 40;
      day.shadow.bias = -0.0008; day.shadow.normalBias = 0.04;
      kit.scene.add(day, day.target);
      // The same grey daylight, thrown back up off the boards where it lands
      // under the windows and off the pale walls, onto the undersides of the
      // beams and the boards of the ceiling: the only light the ceiling gets,
      // and still the street's, so nothing up there is lit warm.
      var bounce = new T.DirectionalLight(kit.col('--aqp-light'), 3.0);
      bounce.position.set(X(360), -10, Z(60));
      bounce.target.position.set(X(360), 6, Z(300));
      kit.scene.add(bounce, bounce.target);

      // THE ROOM: boards running away from the street wall, the walls with a
      // painted line round them at the height of a chair back, the ceiling.
      pbox(-8, W + 8, -8, D + 8, -3, 0, '--aqp-floor', false, false);
      for (var bx = 21; bx < W; bx += 21) pbox(bx - 0.25, bx + 0.25, 0, D, 0, 0.05, '--aqp-seam', false, false);
      pbox(-8, W + 8, -8, D + 8, C, C + 3, '--aqp-ceil', false);
      pbox(-8, 0, 0, D, 0, C, '--aqp-wall2');
      pbox(W, W + 8, 0, D, 0, C, '--aqp-wall2');
      pbox(-8, W + 8, D, D + 8, 0, C, '--aqp-wall');
      pbox(0, 0.5, 0, D, 33.5, 34.5, '--aqp-line', false, false);
      pbox(W - 0.5, W, 0, D, 33.5, 34.5, '--aqp-line', false, false);
      pbox(0, W, D - 0.5, D, 33.5, 34.5, '--aqp-line', false, false);
      PLAN.beams.forEach(function (y) { pbox(0, W, y - 4, y + 4, R.beam_bottom, C, '--aqp-beam', 0.008); });

      // THE STREET WALL, with the door and the windows in it at the top, the
      // pavement in every window, and the front of the building going on up
      // over the areaway outside.
      var dr = PLAN.door, sill = R.window_sill, wtop = R.window_top;
      pbox(-8, dr.x0, -8, 0, 0, sill, '--aqp-wall');
      pbox(dr.x1, W + 8, -8, 0, 0, sill, '--aqp-wall');
      pbox(dr.x0, dr.x1, -8, 0, dr.top, C, '--aqp-wall');
      pbox(-8, W + 8, -8, 0, wtop, 200, '--aqp-wall');
      pbox(0, dr.x0, -0.5, 0, 33.5, 34.5, '--aqp-line', false, false);
      pbox(dr.x1, W, -0.5, 0, 33.5, 34.5, '--aqp-line', false, false);
      var gaps = PLAN.windows.map(function (w) { return [w.x, w.x + w.w]; }).concat([[dr.x0, dr.x1]]);
      gaps.sort(function (a, b) { return a[0] - b[0]; });
      var from = -8;
      gaps.forEach(function (g) {
        if (g[0] > from) pbox(from, g[0], -8, 0, sill, g[0] === dr.x0 ? dr.top : wtop, '--aqp-wall');
        from = g[1];
      });
      pbox(from, W + 8, -8, 0, sill, wtop, '--aqp-wall');
      pbox(dr.x0, dr.x1, -8, 0, dr.top, wtop, '--aqp-wall');
      PLAN.windows.forEach(function (w) {
        var x0 = w.x, x1 = w.x + w.w, mid = (x0 + x1) / 2;
        // Its frame, and the pavement in it seen from in here.
        pbox(x0 - 1.5, x1 + 1.5, -1, 0, sill - 1.5, sill, '--aqp-col', false);
        pbox(x0 - 1.5, x1 + 1.5, -1, 0, wtop, wtop + 1.5, '--aqp-col', false);
        pbox(x0 - 1.5, x0, -1, 0, sill, wtop, '--aqp-col', false);
        pbox(x1, x1 + 1.5, -1, 0, sill, wtop, '--aqp-col', false);
        if (w.w > 20) pbox(mid - 0.8, mid + 0.8, -1, 0, sill, wtop, '--aqp-col', false);
        kit.flat(new T.PlaneGeometry(I(w.w), I(wtop - sill - 3)), at(X(mid), I((sill + 3 + wtop) / 2), Z(-10), Math.PI), '--aqp-street');
        kit.flat(new T.PlaneGeometry(I(w.w), I(3)), at(X(mid), I(sill + 1.5), Z(-9.9), Math.PI), '--aqp-kerb');
        // And the glass, seen from the areaway outside.
        kit.flat(new T.PlaneGeometry(I(w.w), I(wtop - sill)), at(X(mid), I((sill + wtop) / 2), Z(-8.6)), '--aqp-glass');
      });
      // The door, open, laid back against the wall inside, and its frame.
      pbox(dr.x0 - 2.5, dr.x0, -9, 1, 0, dr.top + 2.5, '--aqp-col', false);
      pbox(dr.x1, dr.x1 + 2.5, -9, 1, 0, dr.top + 2.5, '--aqp-col', false);
      pbox(dr.x0, dr.x1, -9, 1, dr.top, dr.top + 2.5, '--aqp-col', false);
      pbox(dr.x1 + 2.5, dr.x1 + 4.5, 1, 1 + (dr.x1 - dr.x0), 0, dr.top, '--aqp-door');
      pbox(dr.x1 + 4.5, dr.x1 + 4.8, 8, dr.x1 - dr.x0 - 6, 50, 72, '--aqp-street', false, false);
      pbox(dr.x1 + 4.5, dr.x1 + 4.8, 8, dr.x1 - dr.x0 - 6, 50, 53, '--aqp-kerb', false, false);

      // THE MIRRORS, each at its own height and its own size, with one streak
      // of the window's light lying in the glass.
      PLAN.mirrors.forEach(function (m) {
        var u0 = m.at - m.w / 2, u1 = m.at + m.w / 2, v0 = m.z - m.h / 2, v1 = m.z + m.h / 2;
        if (m.wall === 'north') {
          pbox(u0 - 2, u1 + 2, 0, 1.2, v0 - 2, v1 + 2, '--aqp-col', 0.006);
          pbox(u0, u1, 1.2, 1.5, v0, v1, '--aqp-glass', false, false);
          kit.flat(new T.PlaneGeometry(I(m.w * 0.16), I(m.h)), at(X(u0 + m.w * 0.4), I(m.z), Z(1.6), Math.PI, 0, -0.35), '--aqp-sheen');
        } else {
          var west = m.wall === 'west', x = west ? 0 : W, s = west ? 1 : -1;
          pbox(Math.min(x, x + s * 1.2), Math.max(x, x + s * 1.2), u0 - 2, u1 + 2, v0 - 2, v1 + 2, '--aqp-col', 0.006);
          pbox(Math.min(x + s * 1.2, x + s * 1.5), Math.max(x + s * 1.2, x + s * 1.5), u0, u1, v0, v1, '--aqp-glass', false, false);
          kit.flat(new T.PlaneGeometry(I(m.w * 0.16), I(m.h)), at(X(x + s * 1.6), I(m.z), Z(u0 + m.w * 0.4), west ? RIGHT : LEFT, 0, 0.35), '--aqp-sheen');
        }
      });
      // And where each one's light lands, on a table or on the boards.
      PLAN.patches.forEach(function (p) {
        var g = new T.ShapeGeometry(plate(p[2]));
        var lit = kit.flat(g, at(0, I(p[1]) + 0.004, 0, 0, -Math.PI / 2), '--aqp-light');
        lit.material.transparent = true;
        lit.material.opacity = p[0] ? 0.5 : 0.38;
        lit.material.depthWrite = false;
      });

      // THE BAR, down the west side in its uneven stretches, one of them low
      // so it can be reached sitting down, the back bar against the wall with
      // its bottles, the rail along its foot and the stools along its front.
      var bar = PLAN.bar, f = bar.front;
      pbox(0, 18, 20, D - 16, 0, 40, '--aqp-beam', 0.008);
      pbox(0, 20, 20, D - 16, 40, 41.5, '--aqp-col2', 0.006);
      // A bottle: its body, its shoulder and its neck, standing at (x, y) on z0.
      function bottle(x, y, z0, h, r, ink) {
        var body = h * 0.62;
        pcyl(x, y, r, z0, z0 + body, ink, 0.005, 10);
        kit.piece(new T.CylinderGeometry(I(r * 0.38), I(r), I(h * 0.16), 10), at(X(x), I(z0 + body + h * 0.08), Z(y)), ink, 0.005);
        pcyl(x, y, r * 0.36, z0 + body + h * 0.16, z0 + h, ink, false, 8);
      }
      var INKS = ['--aqp-glass', '--aqp-sheen', '--aqp-stout', '--aqp-glaze', '--aqp-cider', '--aqp-glass', '--aqp-mat', '--aqp-ale'];
      function hash(a, b) { var n = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return n - Math.floor(n); }
      // On the back bar's top, a crowd of bottles at no even spacing, every
      // one its own height and colour, and between the mirrors above it the
      // shelves, each at its own height, with more.
      for (var bb = 0, by = 26; by < D - 22; bb++) {
        bottle(4 + hash(bb, 1) * 9, by, 41.5, 9 + hash(bb, 2) * 7, 1.2 + hash(bb, 3) * 0.7, INKS[Math.floor(hash(bb, 4) * INKS.length)]);
        by += 4 + hash(bb, 5) * 9;
      }
      var westMirrors = PLAN.mirrors.filter(function (m) { return m.wall === 'west'; })
        .map(function (m) { return [m.at - m.w / 2 - 3, m.at + m.w / 2 + 3]; }).sort(function (a, b) { return a[0] - b[0]; });
      var shelfFrom = 22;
      westMirrors.concat([[D - 18, D]]).forEach(function (gap, gi) {
        var y0 = shelfFrom, y1 = gap[0];
        shelfFrom = gap[1];
        if (y1 - y0 < 14) return;
        [54 + (gi * 7) % 9, 70 + (gi * 5) % 8].forEach(function (z, si) {
          pbox(0, 7, y0, y1, z - 1, z, '--aqp-col2', 0.006);
          pbox(0, 7.5, y0, y0 + 1, z - 4, z, '--aqp-col2', false);
          pbox(0, 7.5, y1 - 1, y1, z - 4, z, '--aqp-col2', false);
          for (var bq = 0, yy = y0 + 2.5; yy < y1 - 2.5; bq++) {
            var k = gi * 31 + si * 13 + bq;
            if (hash(k, 9) < 0.82) bottle(3.5, yy, z, 6 + hash(k, 6) * 6, 1 + hash(k, 7) * 0.6, INKS[Math.floor(hash(k, 8) * INKS.length)]);
            yy += 3 + hash(k, 10) * 3.5;
          }
        });
      });
      for (var i = 0; i < f.length - 1; i++) {
        var a = f[i], b = f[i + 1], h = bar.heights[i], dp = bar.depth;
        var q = [[a[0] - dp, a[1]], [b[0] - dp, b[1]], [b[0], b[1]], [a[0], a[1]]];
        prism(q, 0, h - 1.5, '--aqp-barfront', 0.01);
        prism(q, h - 1.5, 1.5, '--aqp-bartop', 0.006);
        if (h > 36) prism([[a[0] + 3.5, a[1]], [b[0] + 3.5, b[1]], [b[0] + 5, b[1]], [a[0] + 5, a[1]]], 7, 1.5, '--aqp-rim', false);
      }
      bar.stools.forEach(function (s) {
        pcyl(s[0], s[1], 1.1, 0, 28, '--aqp-iron', false, 8);
        pcyl(s[0], s[1], 5, 7.5, 8.3, '--aqp-iron', false, 12);
        pcyl(s[0], s[1], 7, 28, 30, '--aqp-leather', 0.008);
      });

      // THE COLUMNS, each carved with its own tale in bands of its own.
      PLAN.columns.forEach(function (c) {
        var r = c.d / 2;
        pcyl(c.x, c.y, r, 0, C, '--aqp-col', 0.008);
        c.bands.forEach(function (bd) {
          var grow = bd[2] === 'figures' ? 1.2 : 0.7;
          pcyl(c.x, c.y, r + grow, bd[0], bd[1], '--aqp-carve', false);
        });
        pcyl(c.x, c.y, r + 1.6, 0, 4, '--aqp-carve', 0.006);
        pcyl(c.x, c.y, r + 2, C - 4, C, '--aqp-carve', 0.006);
      });

      // THE TABLES, no two alike, and the seats round each.
      function chair(sx, sy, t) {
        var ux = sx - t.x, uy = sy - t.y, L = Math.hypot(ux, uy) || 1;
        ux /= L; uy /= L;
        var turn = Math.atan2(-ux, -uy);
        var m = at(X(sx), 0, Z(sy), turn);
        if (t.seating === 'stools') {
          var z = t.h - 12;
          cyl(I(1), I(1), I(z), M(m, at(0, I(z / 2), 0)), '--aqp-iron', false, 8);
          cyl(I(7), I(7), I(2), M(m, at(0, I(z - 1), 0)), '--aqp-leather', 0.008, 12);
          return;
        }
        var arm = t.seating === 'armchairs';
        var s = arm ? 11 : 7.5, sz = arm ? 15 : 17, bk = arm ? 30 : 33;
        var seat = arm ? '--aqp-leather' : '--aqp-col', back = arm ? '--aqp-leather2' : '--aqp-col2';
        box(I(2 * s), I(arm ? sz : 2), I(2 * s), M(m, at(0, I(arm ? sz / 2 : sz - 1), 0)), seat, 0.008);
        box(I(2 * s), I(bk - sz), I(arm ? 4 : 2), M(m, at(0, I((sz + bk) / 2), I(s))), back, 0.008);
        if (arm) {
          [-1, 1].forEach(function (k) { box(I(3), I(6), I(2 * s), M(m, at(I(k * (s - 1.5)), I(sz + 3), 0)), back, 0.006); });
        } else {
          [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (e) {
            box(I(1.2), I(sz - 2), I(1.2), M(m, at(I(e[0] * s * 0.8), I((sz - 2) / 2), I(e[1] * s * 0.8))), back, false);
          });
        }
      }
      function topBox(t) { var d = t.d || t.w; return [t.x - t.w / 2, t.y - d / 2, t.x + t.w / 2, t.y + d / 2]; }
      function longSeat(t) {
        var b = topBox(t), sofa = t.seating === 'sofa';
        var z = sofa ? 16 : 17, back = sofa ? 32 : 46;
        var fill = sofa ? '--aqp-leather' : '--aqp-col', fill2 = sofa ? '--aqp-leather2' : '--aqp-col2';
        if (t.against === 'north') {
          pbox(b[0] - 6, b[2] + 6, 0, b[1] - 2, 0, z, fill, 0.008);
          pbox(b[0] - 6, b[2] + 6, 0, 3, z, back, fill2, 0.008);
        } else if (t.against === 'south') {
          pbox(b[0] - 6, b[2] + 6, b[3] + 2, D, 0, z, fill, 0.008);
          pbox(b[0] - 6, b[2] + 6, D - 3, D, z, back, fill2, 0.008);
        } else if (t.against === 'east') {
          pbox(b[2] + 2, W, b[1] - 6, b[3] + 6, 0, z, fill, 0.008);
          pbox(W - 3, W, b[1] - 6, b[3] + 6, z, back, fill2, 0.008);
        }
      }
      PLAN.tables.forEach(function (t) {
        var h = t.h, top = t.top, round = t.shape === 'round';
        if (t.base === 'pedestal') {
          var posts = t.shape === 'long' ? [t.x - t.w * 0.3, t.x + t.w * 0.3] : [t.x];
          posts.forEach(function (px) {
            pcyl(px, t.y, Math.max(8, Math.min(t.w, t.d || t.w) * 0.3), 0, 1, '--aqp-col2', 0.006, 16);
            pcyl(px, t.y, 1.6, 1, h - top, '--aqp-col2', false, 8);
          });
        } else {
          var legs;
          if (round) {
            var lr = t.w / 2 - 3;
            legs = [0.8, 2.4, 3.9, 5.5].map(function (an) { return [t.x + lr * Math.cos(an), t.y + lr * Math.sin(an)]; });
          } else {
            var tb = topBox(t);
            legs = [[tb[0] + 2, tb[1] + 2], [tb[2] - 2, tb[1] + 2], [tb[2] - 2, tb[3] - 2], [tb[0] + 2, tb[3] - 2]];
          }
          legs.forEach(function (l) { pbox(l[0] - 0.8, l[0] + 0.8, l[1] - 0.8, l[1] + 0.8, 0, h - top, '--aqp-col2', false); });
        }
        if (round) pcyl(t.x, t.y, t.w / 2, h - top, h, '--aqp-top', 0.01, 28);
        else { var bb = topBox(t); pbox(bb[0], bb[2], bb[1], bb[3], h - top, h, '--aqp-top', 0.01); }
        t.seats.forEach(function (s) { chair(s[0], s[1], t); });
        if (t.seating === 'settle' || t.seating === 'sofa') longSeat(t);
      });

      // THE FANS, up between the beams, each its own span and stopped at its
      // own turn. Nothing turns them.
      PLAN.fans.forEach(function (fn) {
        var z = R.beam_bottom + 5;
        pcyl(fn.x, fn.y, 0.6, z, C, '--aqp-iron', false, 6);
        pcyl(fn.x, fn.y, 3.4, z - 1, z + 1, '--aqp-iron', 0.006, 12);
        for (var k = 0; k < 4; k++) {
          var an = (fn.turn + 90 * k) * Math.PI / 180, rm = (3 + fn.span / 2) / 2;
          box(I(fn.span / 2 - 3), I(0.5), I(5.2), at(X(fn.x + rm * Math.cos(an)), I(z), Z(fn.y + rm * Math.sin(an)), Math.PI - an), '--aqp-fan', 0.005);
        }
      });

      // THE PIANO against the street wall, its roll standing still in its
      // window, and its bench.
      var pn = PLAN.piano;
      pbox(pn.x0, pn.x1, pn.y0 + 1, pn.y1, 0, pn.h, '--aqp-piano', 0.01);
      pbox(pn.x0 - 1, pn.x1 + 1, pn.y0 + 1, pn.y1 + 1, pn.h, pn.h + 1.5, '--aqp-piano2', 0.008);
      pbox(pn.x0 + 3, pn.x1 - 3, pn.y1, pn.y1 + 6, 27, 30, '--aqp-froth', 0.006);
      for (var kk = 1; kk < 14; kk++) {
        var kx = pn.x0 + 3 + kk * (pn.x1 - pn.x0 - 6) / 14;
        pbox(kx - 0.25, kx + 0.25, pn.y1 + 0.5, pn.y1 + 6.05, 28.5, 30.05, '--aqp-line', false, false);
      }
      pbox(pn.x0 + 13, pn.x1 - 13, pn.y1, pn.y1 + 0.4, 35, 46, '--aqp-line', false, false);
      pbox(pn.x0 + 15, pn.x1 - 15, pn.y1 + 0.4, pn.y1 + 0.6, 36, 45, '--aqp-plate', false, false);
      for (var hk = 0; hk < 9; hk++) {
        var hx = pn.x0 + 17 + hk * (pn.x1 - pn.x0 - 34) / 8, hz = 37.5 + (hk * 5 % 7);
        pbox(hx, hx + 1.2, pn.y1 + 0.6, pn.y1 + 0.7, hz, hz + 1.4, '--aqp-line', false, false);
      }
      var bn = pn.bench;
      pbox(bn[0], bn[2], bn[1], bn[3], 0, 19, '--aqp-piano2', 0.008);

      // THE STOVE, shut, giving warmth and no light, and its flue.
      var sv = PLAN.stove;
      pbox(sv.x0, sv.x1, sv.y0, sv.y1, 2, sv.h, '--aqp-iron', 0.01);
      pbox(sv.x0 - 1, sv.x1 + 1, sv.y0 - 1, sv.y1 + 1, sv.h, sv.h + 1.2, '--aqp-iron2', 0.006);
      pbox(sv.x0 - 0.8, sv.x0, sv.y0 + 8, sv.y1 - 8, 7, 25, '--aqp-iron2', 0.006);
      [[sv.x0 + 2, sv.y0 + 2], [sv.x1 - 2, sv.y0 + 2], [sv.x0 + 2, sv.y1 - 2], [sv.x1 - 2, sv.y1 - 2]].forEach(function (l) {
        pbox(l[0] - 1, l[0] + 1, l[1] - 1, l[1] + 1, 0, 2, '--aqp-iron', false);
      });
      pcyl(sv.flue[0], sv.flue[1], 3.5, sv.h + 1.2, C, '--aqp-iron', 0.006, 12);

      // OUTSIDE THE DOOR, the areaway: the landing, the steps up to the
      // pavement, and beside them the ramp, as wide as they are, in two runs
      // with a landing to turn on, and handrails both sides.
      var st = PLAN.steps, rp = PLAN.ramp, up = R.below_street;
      var land = dr.x0 - 40, rw = rp.width, flight = st.risers * st.tread;
      var r1 = rp.runs[0], r2 = rp.runs[1];
      pbox(land, W + 8, -rw, -8, -3, 0, '--aqp-plank', false, false);
      for (var sk = 0; sk < st.risers; sk++) {
        pbox(W - st.width, W, -rw - st.tread * (sk + 1), -rw - st.tread * sk, 0, up * (sk + 1) / st.risers, '--aqp-plank', 0.006);
      }
      function run(xLow, xHigh, zLow, zHigh, y0, y1) {
        var sh = new T.Shape();
        sh.moveTo(X(xLow), I(zLow)); sh.lineTo(X(xHigh), I(zHigh)); sh.lineTo(X(xHigh), 0); sh.lineTo(X(xLow), 0);
        var g = new T.ExtrudeGeometry(sh, { depth: I(y1 - y0), bevelEnabled: false });
        kit.piece(g, at(0, 0, Z(y1)), '--aqp-ramp', 0.008);
        // Handrails both sides, 34 inches over the run.
        [y0 + 1.5, y1 - 1.5].forEach(function (yy) {
          var dx = X(xHigh) - X(xLow), dz = I(zHigh - zLow), len = Math.hypot(dx, dz);
          box(len, I(1.5), I(1.5), at((X(xLow) + X(xHigh)) / 2, I((zLow + zHigh) / 2 + 34), Z(yy), 0, 0, Math.atan2(dz, dx)), '--aqp-rim', 0.004);
          [0, 0.5, 1].forEach(function (u) {
            var px = xLow + u * (xHigh - xLow), pz = zLow + u * (zHigh - zLow);
            pbox(px - 0.75, px + 0.75, yy - 0.75, yy + 0.75, pz, pz + 34, '--aqp-rim', false);
          });
        });
      }
      run(land, land - r1.run, 0, r1.rise, -rw, 0);
      pbox(land - r1.run - rp.landing, land - r1.run, -2 * rw, 0, 0, r1.rise, '--aqp-plank', 0.008);
      run(land - r2.run, land, r1.rise, r1.rise + r2.rise, -2 * rw, -rw);
      pbox(land, W - st.width, -190, -rw, 0, up, '--aqp-plank', 0.008);
      pbox(W - st.width, W + 40, -190, -rw - flight, 0, up, '--aqp-out', 0.008);
      pbox(-40, land - r1.run - rp.landing, -190, -8, 0, up, '--aqp-out', 0.008);
      pbox(land - r1.run - rp.landing, land, -190, -2 * rw, 0, up, '--aqp-out', 0.008);
      pbox(W, W + 40, -rw, -8, 0, up, '--aqp-out', 0.008);
      pbox(-40, W + 40, -420, -190, 0, up, '--aqp-street', false);
      pbox(-40, W + 40, -196, -190, up, up + 6, '--aqp-kerb', 0.008);

      // WHAT A PUB IS LIVED IN BY, none of it on a table and none of it in the
      // way: everything here stands on the bar, on the back bar, against a
      // wall, up between the beams or on a sill.
      // The ceiling's boards, joists running between the beams.
      for (var bi = 0; bi < PLAN.beams.length - 1; bi++) {
        var ya = PLAN.beams[bi] + 4, yb = PLAN.beams[bi + 1] - 4;
        for (var jx = 14 + (bi * 9) % 13; jx < W - 6; jx += 26 + (bi * 7 + jx) % 9) pbox(jx - 1.5, jx + 1.5, ya, yb, C - 3.5, C, '--aqp-beam2', false, false);
      }
      // Panelling below the painted line, on every wall with nothing built
      // against it at that height: boards, their seams, and a rail along the top.
      // fixed: the boards' depth off the wall; rail: the rail's, a little deeper.
      function panel(axis, fixed, rail, a0, a1, z1) {
        for (var u = a0; u < a1 - 0.5; u += 5.5) {
          var u1 = Math.min(a1, u + 5.5);
          if (axis === 'x') pbox(u + 0.15, u1 - 0.15, fixed[0], fixed[1], 0, z1, '--aqp-wood', false, false);
          else pbox(fixed[0], fixed[1], u + 0.15, u1 - 0.15, 0, z1, '--aqp-wood', false, false);
        }
        if (axis === 'x') pbox(a0, a1, rail[0], rail[1], z1, z1 + 1.6, '--aqp-col2', 0.004);
        else pbox(rail[0], rail[1], a0, a1, z1, z1 + 1.6, '--aqp-col2', 0.004);
      }
      panel('x', [D - 0.6, D], [D - 1.2, D], 0, W, 32);
      panel('y', [W - 0.6, W], [W - 1.2, W], 0, D, 32);
      panel('x', [0, 0.6], [0, 1.2], 0, dr.x0 - 3, 32);
      panel('x', [0, 0.6], [0, 1.2], dr.x1 + 3, W, 32);
      // The mat inside the door, for the street's wet feet.
      pbox(604, 636, 3, 28, 0, 0.35, '--aqp-mat', false, false);
      // An umbrella stand by the door, against the wall, with three umbrellas
      // in it, no two alike, and a bowl of water down by the east wall for
      // whoever brought a dog.
      pcyl(588, 7, 4.5, 0, 18, '--aqp-iron2', 0.006, 14);
      [[586.5, 6, 32, '--aqp-leather', 0.12], [590, 8.5, 29, '--aqp-stout', -0.1], [588.5, 5.2, 34, '--aqp-mat', 0.05]].forEach(function (u) {
        cyl(I(0.8), I(1.8), I(u[2] - 12), at(X(u[0]), I(12 + (u[2] - 12) / 2), Z(u[1]), 0, u[4], u[4] * 0.6), u[3], 0.004, 8);
        cyl(I(0.3), I(0.3), I(4), at(X(u[0]), I(u[2] + 1.5), Z(u[1])), '--aqp-iron', false, 6);
      });
      pcyl(711, 296, 4, 0, 2.6, '--aqp-glaze', 0.005, 16);
      pcyl(711, 296, 3.3, 2.1, 2.65, '--aqp-water', false, 16);
      // Coats on a rail of hooks on the east wall above the armchairs, each
      // its own length and colour, hung by its collar: shoulders, a body that
      // falls a little wider to its hem, two sleeves hanging at its sides, a
      // fold or two, the line of its front and its buttons. A scarf between.
      pbox(W - 1.2, W, 80, 122, 70.5, 72.5, '--aqp-col2', 0.004);
      [84, 92, 100, 108, 116].forEach(function (hy) {
        pbox(W - 3.6, W - 1.2, hy - 0.5, hy + 0.5, 70.8, 71.8, '--aqp-iron', false);
        pbox(W - 4.2, W - 3.4, hy - 0.7, hy + 0.7, 70.8, 73, '--aqp-iron', false);
      });
      [[86, 31, '--aqp-leather2', 0], [99, 25, '--aqp-col2', 1], [112, 36, '--aqp-mat', 2]].forEach(function (c) {
        var cy = c[0], L = c[1], top = 70, hem = top - L, ink = c[2];
        pbox(W - 4.8, W - 1.4, cy - 1.8, cy + 1.8, top - 2.2, top + 0.6, ink, 0.005);
        pbox(W - 5.6, W - 1.3, cy - 5.6, cy + 5.6, top - 5, top - 1.8, ink, 0.006);
        pbox(W - 5.3, W - 1.3, cy - 4.8, cy + 4.8, hem + 3, top - 4.6, ink, 0.006);
        pbox(W - 5.6, W - 1.3, cy - 5.4, cy + 5.4, hem, hem + 3.2, ink, 0.006);
        [-1, 1].forEach(function (sd) {
          pbox(W - 6.2, W - 3, cy + sd * 5.0 - 1.1, cy + sd * 5.0 + 1.1, top - 4.4 - L * 0.62, top - 3.2, ink, 0.005);
          pbox(W - 6.3, W - 3.1, cy + sd * 5.0 - 1.2, cy + sd * 5.0 + 1.2, top - 4.4 - L * 0.62 - 1.2, top - 4.4 - L * 0.62, '--aqp-deep', false);
        });
        pbox(W - 5.42, W - 5.32, cy - 0.15, cy + 0.15, hem, top - 2.4, '--aqp-line', false, false);
        [cy - 2.6, cy + 2.8].forEach(function (fy, k) { pbox(W - 5.4, W - 5.33, fy - 0.2, fy + 0.2, hem + 1, top - 7 - k * 3, '--aqp-deep', false, false); });
        if (c[3] !== 1) for (var bt = 0; bt < 3; bt++) pbox(W - 5.6, W - 5.35, cy + 0.6, cy + 1.3, top - 8 - bt * 6, top - 7.3 - bt * 6, '--aqp-rim', false, false);
        else pbox(W - 5.5, W - 5.3, cy - 4.8, cy + 4.8, top - 14, top - 12.6, '--aqp-deep', false, false);
      });
      pbox(W - 3.4, W - 1.4, 104.6, 106.6, 45, 69, '--aqp-sea', 0.004);
      pbox(W - 3.6, W - 1.4, 104.2, 107, 43.5, 45, '--aqp-sea', false);
      // A rack of folded papers on the east wall by the stove.
      pbox(W - 2, W, 166, 196, 40, 58, '--aqp-col2', 0.006);
      [[169, 55, 52], [176, 52, 50], [184, 57, 53], [191, 53, 51]].forEach(function (n) {
        pbox(W - 3.2, W - 2, n[0] - 3, n[0] + 3, 41, n[1], '--aqp-plate', false);
        pbox(W - 3.25, W - 3.2, n[0] - 2.4, n[0] + 2.4, n[2], n[2] + 0.8, '--aqp-line', false, false);
      });
      // Plants on a few of the sills, in pots, reaching for the street's light.
      [1, 5, 9, 12].forEach(function (wi, k) {
        var w = PLAN.windows[wi], mx = w.x + w.w * (0.3 + 0.4 * hash(k, 20));
        pbox(w.x, w.x + w.w, 0, 4, R.window_sill - 1, R.window_sill, '--aqp-col', false);
        pcyl(mx, 2.4, 2.2, R.window_sill, R.window_sill + 4, '--aqp-mush', 0.005, 10);
        for (var lf = 0; lf < 5; lf++) {
          var la = lf * 1.3 + k, lh = 4 + hash(k, lf) * 6;
          kit.piece(new T.SphereGeometry(I(1.6 + hash(lf, k) * 1.2), 6, 4), at(X(mx + Math.cos(la) * 2), I(R.window_sill + 4 + lh), Z(2.4 + Math.sin(la) * 1.2)), lf % 2 ? '--aqp-mat' : '--aqp-glaze', 0.004);
        }
      });
      // ON THE BAR: what has been poured and not yet carried away, standing
      // on its mats along the counter, at no even spacing; a pot of tea, a
      // jug of water, a towel over the low stretch, and something off the
      // stove under its plate. Every pint is the same glass, whichever it is.
      var POURS = ['--aqp-ale', '--aqp-stout', '--aqp-cider', '--aqp-lemon', '--aqp-ale', '--aqp-water'];
      function along(i, u) {
        var a = f[i], b = f[i + 1];
        return [a[0] + (b[0] - a[0]) * u - bar.depth * 0.45, a[1] + (b[1] - a[1]) * u];
      }
      function pint(x, y, z, ink) {
        pbox(x - 2.2, x + 2.2, y - 2.2, y + 2.2, z, z + 0.15, '--aqp-mat', false, false);
        kit.piece(new T.CylinderGeometry(I(1.7), I(1.35), I(5.4), 12), at(X(x), I(z + 0.15 + 2.7), Z(y)), ink, 0.005);
        if (ink !== '--aqp-water' && ink !== '--aqp-lemon') pcyl(x, y, 1.72, z + 5.0, z + 6.0, '--aqp-froth', false, 12);
        else pcyl(x, y, 0.7, z + 3.6, z + 5.0, '--aqp-cube', false, 6);
      }
      [[0, 0.3], [0, 0.8], [1, 0.55], [2, 0.2], [2, 0.65], [4, 0.4], [5, 0.15], [5, 0.7]].forEach(function (pt, k) {
        var q = along(pt[0], pt[1]);
        pint(q[0] + (hash(k, 30) - 0.5) * 6, q[1], bar.heights[pt[0]], POURS[k % POURS.length]);
      });
      var tea = along(1, 0.15), hz = bar.heights[1];
      kit.piece(new T.SphereGeometry(I(3), 12, 8), at(X(tea[0]), I(hz + 2.6), Z(tea[1])), '--aqp-glaze', 0.006);
      cyl(I(0.45), I(0.7), I(3), at(X(tea[0] + 3), I(hz + 3.2), Z(tea[1]), 0, 0, -0.9), '--aqp-glaze', false, 6);
      pcyl(tea[0] - 0.5, tea[1] + 5, 1.4, hz, hz + 2.2, '--aqp-plate', 0.004, 10);
      var jug = along(4, 0.75), jz = bar.heights[4];
      kit.piece(new T.CylinderGeometry(I(1.8), I(2.3), I(7), 12), at(X(jug[0]), I(jz + 3.5), Z(jug[1])), '--aqp-water', 0.006);
      var low = along(3, 0.5), lz = bar.heights[3];
      pbox(low[0] - 3, low[0] + 3, low[1] - 5, low[1] + 5, lz, lz + 0.5, '--aqp-froth', 0.004);
      var dish = along(2, 0.88), dz = bar.heights[2];
      pcyl(dish[0], dish[1], 4.2, dz, dz + 0.5, '--aqp-plate', 0.004, 18);
      kit.piece(new T.SphereGeometry(I(3.6), 14, 6, 0, Math.PI * 2, 0, Math.PI / 2), at(X(dish[0]), I(dz + 0.5), Z(dish[1])), '--aqp-rim', 0.004);

      // ON THE TABLES, what people have left there or are in the middle of:
      // no two tables alike, and one left bare for whoever comes in next.
      // Wherever a pint without alcohol stands beside one with, it is put
      // down first, in the same glass. Nothing on a table is lit.
      function half(x, y, z, ink) {
        pbox(x - 2.2, x + 2.2, y - 2.2, y + 2.2, z, z + 0.15, '--aqp-mat', false, false);
        kit.piece(new T.CylinderGeometry(I(1.55), I(1.35), I(2.6), 12), at(X(x), I(z + 0.15 + 1.3), Z(y)), ink, 0.005);
        kit.piece(new T.CylinderGeometry(I(1.7), I(1.55), I(2.8), 12), at(X(x), I(z + 0.15 + 2.6 + 1.4), Z(y)), '--aqp-rim', 0.004);
      }
      function plateOf(x, y, z, food) {
        pcyl(x, y, 4.2, z, z + 0.45, '--aqp-plate', 0.004, 18);
        food.forEach(function (f, k) {
          var a = k * 2.1 + 0.4, r = k ? 1.8 : 0.4;
          kit.piece(new T.SphereGeometry(I(f[1]), 8, 5, 0, Math.PI * 2, 0, Math.PI / 2), at(X(x + Math.cos(a) * r), I(z + 0.45), Z(y + Math.sin(a) * r)), f[0], false);
        });
      }
      function paper(x, y, z, wide) {
        var a = wide ? 7 : 5, b = wide ? 5 : 7;
        pbox(x - a, x + a, y - b, y + b, z, z + 0.3, '--aqp-plate', 0.003);
        for (var ln = 0; ln < 5; ln++) pbox(x - a + 1, x + a - 1 - (ln % 2) * 2, y - b + 1.4 + ln * 2.4, y - b + 1.9 + ln * 2.4, z + 0.3, z + 0.34, '--aqp-line', false, false);
      }
      function mug(x, y, z) {
        pcyl(x, y, 1.6, z, z + 3.6, '--aqp-glaze', 0.004, 12);
        pbox(x - 0.4, x + 0.4, y + 1.6, y + 2.8, z + 1, z + 3, '--aqp-glaze', false);
        pcyl(x, y, 1.3, z + 3.55, z + 3.65, '--aqp-stout', false, 12);
      }
      function book(x, y, z, ink) {
        pbox(x - 3, x + 3, y - 4.2, y + 4.2, z, z + 1.6, ink, 0.004);
        pbox(x - 2.8, x + 3.05, y - 4, y + 4, z + 0.2, z + 1.4, '--aqp-crumb', false, false);
      }
      function cards(x, y, z) {
        [[0, 0], [1.8, 1], [3.6, 0.4], [-2.4, 3.6]].forEach(function (c) { pbox(x + c[0] - 1.2, x + c[0] + 1.2, y + c[1] - 1.7, y + c[1] + 1.7, z, z + 0.08, '--aqp-plate', 0.002); });
      }
      function jugOf(x, y, z) {
        kit.piece(new T.CylinderGeometry(I(1.8), I(2.3), I(7), 12), at(X(x), I(z + 3.5), Z(y)), '--aqp-water', 0.006);
      }
      function teapot(x, y, z) {
        kit.piece(new T.SphereGeometry(I(2.8), 12, 8), at(X(x), I(z + 2.5), Z(y)), '--aqp-glaze', 0.006);
        cyl(I(0.4), I(0.65), I(2.8), at(X(x + 2.8), I(z + 3), Z(y), 0, 0, -0.9), '--aqp-glaze', false, 6);
      }
      var TABLE_THINGS = {
        1: function (t, z) { pint(t.x - 5, t.y - 3, z, '--aqp-lemon'); pint(t.x + 5, t.y + 3, z, '--aqp-ale'); },
        2: function (t, z) { pint(t.x - 22, t.y, z, '--aqp-water'); half(t.x - 14, t.y + 2, z, '--aqp-stout'); plateOf(t.x + 10, t.y, z, [['--aqp-bread', 2.2], ['--aqp-crumb', 1.0]]); },
        3: function (t, z) { teapot(t.x - 3, t.y, z); mug(t.x + 5, t.y + 3, z); },
        4: function (t, z) { paper(t.x - 6, t.y - 4, z, true); half(t.x + 9, t.y + 7, z, '--aqp-stout'); },
        5: function (t, z) {
          plateOf(t.x - 9, t.y - 6, z, [['--aqp-steak', 2.0], ['--aqp-chip', 1.1], ['--aqp-onion', 0.9]]);
          plateOf(t.x + 10, t.y + 4, z, [['--aqp-mush', 1.6], ['--aqp-bread', 1.8]]);
          pint(t.x + 2, t.y - 11, z, '--aqp-water'); pint(t.x - 3, t.y + 12, z, '--aqp-cider'); jugOf(t.x + 12, t.y - 9, z);
        },
        6: function (t, z) { mug(t.x - 4, t.y - 6, z); book(t.x + 4, t.y + 4, z, '--aqp-leather'); },
        8: function (t, z) { cards(t.x - 4, t.y - 3, z); half(t.x + 7, t.y + 5, z, '--aqp-ale'); },
        9: function (t, z) {
          plateOf(t.x - 16, t.y - 3, z, [['--aqp-chip', 1.2], ['--aqp-steak', 1.9]]);
          plateOf(t.x + 14, t.y + 3, z, [['--aqp-bread', 2.4], ['--aqp-onion', 1.0]]);
          pint(t.x - 4, t.y + 7, z, '--aqp-lemon'); pint(t.x + 2, t.y - 8, z, '--aqp-stout');
        },
        10: function (t, z) { paper(t.x, t.y - 2, z, false); },
        11: function (t, z) { pint(t.x - 8, t.y, z, '--aqp-water'); pint(t.x + 2, t.y - 9, z, '--aqp-water'); pint(t.x + 6, t.y + 8, z, '--aqp-water'); paper(t.x - 4, t.y + 10, z, true); },
        12: function (t, z) { book(t.x - 8, t.y, z, '--aqp-leather2'); mug(t.x + 8, t.y - 2, z); },
        13: function (t, z) { plateOf(t.x - 2, t.y + 2, z, [['--aqp-crumb', 1.4]]); half(t.x + 6, t.y - 5, z, '--aqp-cider'); }
      };
      PLAN.tables.forEach(function (t) { if (TABLE_THINGS[t.n]) TABLE_THINGS[t.n](t, t.h); });

      // By the stove: a kettle on its top, kept warm and never boiling, and a
      // basket of logs against the wall beside it.
      var sv2 = PLAN.stove, kx2 = (sv2.x0 + sv2.x1) / 2 - 7, ky2 = sv2.y0 + 9;
      kit.piece(new T.CylinderGeometry(I(3.2), I(4.2), I(5), 14), at(X(kx2), I(sv2.h + 1.2 + 2.5), Z(ky2)), '--aqp-iron2', 0.006);
      pcyl(kx2, ky2, 0.9, sv2.h + 6.2, sv2.h + 7.2, '--aqp-iron2', false, 8);
      cyl(I(0.5), I(0.9), I(4), at(X(kx2 - 4), I(sv2.h + 5), Z(ky2), 0, 0, 0.9), '--aqp-iron2', false, 6);
      pbox(701, 716, 260, 276, 0, 11, '--aqp-col2', 0.006);
      for (var lg = 0; lg < 6; lg++) {
        cyl(I(1.9 + hash(lg, 40) * 0.8), I(1.9 + hash(lg, 41) * 0.8), I(14), at(X(703.5 + (lg % 3) * 4.4), I(12 + Math.floor(lg / 3) * 3.4), Z(268), 0, Math.PI / 2 + (hash(lg, 42) - 0.5) * 0.2, Math.PI / 2), lg % 2 ? '--aqp-plank' : '--aqp-grain', 0.004, 8);
      }
      // The boards worn paler where everybody walks: in at the door, along the
      // bar, and round to the stove.
      var wornTex = kit.paper(256, 256, function (c, w, h) {
        c.fillStyle = kit.ink('--aqp-col');
        for (var ring = 28; ring > 0; ring--) { c.globalAlpha = 0.085; c.beginPath(); c.ellipse(w / 2, h / 2, (w / 2) * ring / 28, (h / 2) * ring / 28, 0, 0, Math.PI * 2); c.fill(); }
        c.globalAlpha = 1;
      });
      [[620, 40, 34, 80, 0.2], [540, 120, 80, 44, -0.4], [175, 240, 44, 320, 0.05], [600, 210, 70, 50, 0.6], [420, 300, 100, 44, 0.3], [350, 200, 60, 40, 1.1]].forEach(function (wr) {
        var worn = new T.Mesh(new T.PlaneGeometry(I(wr[2]), I(wr[3])), new T.MeshBasicMaterial({ map: wornTex, transparent: true, opacity: 0.7, depthWrite: false }));
        worn.position.set(X(wr[0]), 0.004, Z(wr[1])); worn.rotation.set(-Math.PI / 2, 0, wr[4]);
        worn.matrixAutoUpdate = false; worn.updateMatrix(); worn.matrixWorldNeedsUpdate = true;
        kit.scene.add(worn);
      });
      // Outside, in the areaway under the windows, a trough of plants for the
      // street to look down on, clear of the way to the steps.
      pbox(688, 718, -17, -9, 0, 13, '--aqp-col2', 0.006);
      for (var pl = 0; pl < 9; pl++) {
        kit.piece(new T.SphereGeometry(I(2.6 + hash(pl, 50) * 1.6), 6, 4), at(X(690 + pl * 3.3), I(13 + 1.5 + hash(pl, 51) * 4), Z(-13 + (hash(pl, 52) - 0.5) * 3)), pl % 3 ? '--aqp-mat' : '--aqp-glaze', 0.004);
      }
      // The areaway's walls laid in courses, so they read as stone.
      for (var cz = 8; cz < up; cz += 8) {
        pbox(W - st.width - 0.3, W - st.width, -190, -rw - flight, cz - 0.4, cz, '--aqp-plank', false, false);
        pbox(land - r1.run - rp.landing, land, -2 * rw + 0.3, -2 * rw, cz - 0.4, cz, '--aqp-plank', false, false);
      }

      // THE PUB'S OWN PAGE, on the far wall, where ordering and your table
      // are; and what the page has that can stand in the room.
      var INSIDE = [X(W) - 0.1, X(0) + 0.1, Z(D) - 0.1, 0.05];
      var OUT = [-3, 13, 0.05, 6];
      var pw = 1.7, ph = pw * 800 / 1180;
      var pg = at(X(498), 0, Z(D) + 0.02);
      box(pw + 0.12, ph + 0.12, 0.06, M(pg, at(0, 0.9 + ph / 2, 0.01)), '--aqp-col2');
      var frame = kit.screen(1180, 800, pw, M(pg, at(0, 0.9 + ph / 2, 0.05)), 'A Quiet Pint’s own page, on the far wall', INSIDE);
      var rolls = kit.lift(frame, '.aqp-rolls', { w: 560, h: 480, ww: 0.8, m: at(X((pn.x0 + pn.x1) / 2), I(pn.h + 1.5) + 0.01, Z(14), Math.PI), zone: INSIDE });
      // The piano's other shelf, the page's second list: people playing the
      // standards, on a board on the street wall beside the piano, over a
      // little shelf of its own.
      pbox(305, 345, 0, 5, 24, 25.6, '--aqp-col2', 0.004);
      pbox(303, 347, 0, 0.8, 25.6, 61, '--aqp-col2', 0.004);
      var played = kit.lift(frame, '.aqp-rolls', { n: 1, w: 560, h: 520, ww: 1.0, m: at(X(325), I(26.5), Z(1.0), Math.PI), zone: INSIDE });
      var boards = [[130, 114], [200, 106], [330, 103]].map(function (b, n) {
        return kit.lift(frame, '.aqp-board', { n: n, w: 480, h: 520, ww: 0.85, m: at(X(b[1]), I(42) + 0.01, Z(b[0]), RIGHT), drop: '.aqp-item__go', zone: INSIDE });
      });
      var homage = kit.lift(frame, '.aqp-homage', { w: 560, h: 640, ww: 1.3, m: at(X(640), 0.75, Z(D) + 0.03), zone: INSIDE });
      var rules = kit.lift(frame, '.aqp-rules', { w: 560, ww: 1.2, m: at(X(296), 0.9, Z(D) + 0.03), zone: INSIDE });
      var plan = kit.lift(frame, '.aqp-plan', { w: 560, ww: 1.15, m: at(X(682), 0.3, Z(1.5), Math.PI), zone: INSIDE });
      var sign = kit.lift(frame, '.aqp-head', { w: 560, ww: 1.0, m: at(X(632), 0.82, Z(-rw) - 0.02, Math.PI), zone: OUT });

      var aim = function (fx, fy, tx, ty) { return Math.atan2(-(X(tx) - X(fx)), -(Z(ty) - Z(fy))); };
      var stops = [
        { name: 'just inside the door, the room going away from you under the beams', x: X(620), z: Z(30), yaw: 0 },
        { name: 'outside the door, at the foot of the steps up to the pavement', x: X(598), z: Z(-12), yaw: aim(598, -12, 655, -100), pitch: -0.08, frame: sign.el },
        { name: 'outside the door, at the foot of the ramp beside the steps, as wide as they are', x: X(575), z: Z(-30), yaw: aim(575, -30, 300, -60), pitch: 0.08 },
        { name: 'under the windows, the street’s light coming in at the top of the wall', x: X(450), z: Z(130), yaw: Math.PI, pitch: 0.32 },
        { name: 'among the columns, no two carved with the same tale', x: X(390), z: Z(215), yaw: aim(390, 215, 360, 96), pitch: 0.12 },
        { name: 'at a table in a patch of the light a mirror passes round', x: X(338), z: Z(240), yaw: Math.PI, pitch: -0.4 },
        { name: 'at the piano, with its rolls standing on it', x: X(265), z: Z(95), yaw: Math.PI, pitch: 0.12, frame: rolls.el },
        { name: 'at the piano’s other shelf, people playing the standards', x: X(325), z: Z(64), yaw: Math.PI, pitch: -0.1, frame: played.el },
        { name: 'at the bar, with the pints on the board', x: X(176), z: Z(130), yaw: RIGHT, frame: boards[0].el },
        { name: 'at the bar, with what comes in a glass', x: X(176), z: Z(200), yaw: RIGHT, frame: boards[1].el },
        { name: 'where the bar dips, low enough to be served at sitting down', x: X(176), z: Z(263), yaw: RIGHT, pitch: -0.2 },
        { name: 'at the bar, with what comes off the stove', x: X(176), z: Z(330), yaw: RIGHT, frame: boards[2].el },
        { name: 'by the stove, shut, warm and giving off no light', x: X(650), z: Z(185), yaw: aim(650, 185, 700, 238), pitch: -0.2 },
        { name: 'by the armchairs, under the coats on their hooks', x: X(630), z: Z(96), yaw: aim(630, 96, 720, 100), pitch: 0.16 },
        { name: 'at the far wall, with the room’s own page on it, where you order and find your table', x: X(498), z: Z(382), yaw: 0, page: kit.page, frame: frame },
        { name: 'at the far wall, with Jim Butcher’s words and where this pub parts from them', x: X(640), z: Z(398), yaw: 0, frame: homage.el },
        { name: 'at the house rules', x: X(296), z: Z(408), yaw: 0, frame: rules.el },
        { name: 'at the plan by the door', x: X(680), z: Z(70), yaw: Math.PI, pitch: -0.3, frame: plan.el }
      ];

      return {
        start: { x: X(620), z: Z(30), yaw: 0 },
        bounds: { areas: [
          { x: [X(712), X(172)], z: [Z(470), Z(14)] },
          { x: [X(636), X(604)], z: [Z(24), Z(-22)] },
          { x: [X(715), X(565)], z: [Z(-12), Z(-54)] }
        ] },
        stops: stops
      };
    }
  };
})();

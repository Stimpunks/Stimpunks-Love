/* The member map, for anybody: every place on it, where it is on the map and
   how many of us are there, each country and how many, and how many in all
   (memberMap). GET, no pass needed, nothing sent:
     /cb/member-map        that, as JSON, which member-map.js draws on the Community Center's wall
     /cb/member-map.svg    the map drawn whole, as an image, which stimpunks.org's Individuals page
                           shows in place of its Google My Maps embed
   No pin's id, and never anybody's name, is in either. See ../cb/lib.mjs, the member map, and
   tools/make-member-map.py. */
import { memberMap, json } from '../cb/lib.mjs';
import { WORLD_W, WORLD_H, LAND } from '../cb/world.mjs';

const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* The image's own inks, for stimpunks.org's page rather than any room here: a
   pale sea, pale land, and a dark rust pin with its count in white on it
   (about 10:1). */
const SEA = '#EEF2F2', LAND_INK = '#D3D8C8', COAST = '#A9B39C', PIN = '#7E250A', PIN_RING = '#FFFFFF', COUNT = '#FFFFFF', CREDIT = '#3B4A3F';

/* A pin's size by how many are there, so a number fits on it. */
const radius = (n) => (n < 2 ? 3.6 : n < 10 ? 8 : 9.5);

function svg(m) {
  const credit = 'World: Natural Earth (public domain). Places found with OpenStreetMap: © OpenStreetMap contributors.';
  // The busiest places are drawn first, so a place on its own beside them is never hidden under them.
  const pins = m.places.slice().sort((a, b) => b.n - a.n).map((p) => {
    const r = radius(p.n);
    const label = `${p.place}${p.country ? ', ' + p.country : ''}: ${p.n}`;
    const count = p.n > 1 ? `<text x="${p.x}" y="${p.y}" dy="0.35em" text-anchor="middle" font-size="${p.n < 10 ? 11 : 10}" font-weight="700" fill="${COUNT}">${p.n}</text>` : '';
    return `<g><title>${esc(label)}</title><circle cx="${p.x}" cy="${p.y}" r="${r}" fill="${PIN}" stroke="${PIN_RING}" stroke-width="1"/>${count}</g>`;
  }).join('');
  const h = WORLD_H + 22;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WORLD_W} ${h}" role="img" font-family="system-ui, -apple-system, Segoe UI, sans-serif">`
    + `<title>Where Stimpunks members are: ${m.total} of us in ${m.places.length} places</title>`
    + `<rect width="${WORLD_W}" height="${h}" fill="${SEA}"/>`
    + `<path d="${LAND}" fill="${LAND_INK}" stroke="${COAST}" stroke-width="0.5" stroke-linejoin="round"/>`
    + pins
    + `<text x="${WORLD_W - 8}" y="${h - 8}" text-anchor="end" font-size="11" fill="${CREDIT}">${esc(credit)}</text>`
    + `</svg>`;
}

export default async (req) => {
  const url = new URL(req.url);
  try {
    const m = await memberMap();
    if (url.pathname.endsWith('.svg')) {
      return new Response(svg(m), { status: 200, headers: { 'content-type': 'image/svg+xml; charset=utf-8', 'cache-control': 'public, max-age=300', 'x-robots-tag': 'noindex' } });
    }
    return json(200, m, { 'cache-control': 'public, max-age=60', 'x-robots-tag': 'noindex' });
  } catch (e) {
    return json(503, { error: 'The member map could not be read just now.' }, { 'x-robots-tag': 'noindex' });
  }
};

/* Netlify counts the requests per address and never tells us the address. */
export const config = {
  path: ['/cb/member-map', '/cb/member-map.svg'],
  method: ['GET'],
  rateLimit: { windowLimit: 120, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};

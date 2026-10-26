/* Roles, at the desk in the Moderators' room (Ryan's ask and calls,
   2026-10-21): administrators give somebody roles, change them, or take them
   off the list. CB_MODS in Netlify's settings is only the break-glass list
   now, which the desk shows and cannot change. A base pass holding the
   administrator role, POST:
     { action: 'list' }                      everybody with a role, the break-glass list marked fixed
     { action: 'set', handle, roles }        roles: any of board, director, administrator; none is a moderator
     { action: 'remove', handle }            off the list
   Board is given or taken only by somebody on the board or the break-glass
   list, nobody is left without an administrator, and nothing is logged. See
   ../cb/lib.mjs, roles kept with the CB. */
import { staffReady, readPass, rolesEditor, rolesList, setRoles, json, body, sameSite } from '../cb/lib.mjs';

const QUIET = { 'x-robots-tag': 'noindex', 'cache-control': 'no-store' };

export default async (req) => {
  // Sealed at rest with CB_STAFF_KEY (lib.mjs): without it, shut rather than written in the clear.
  if (!staffReady()) return json(503, { error: 'The roles are shut just now. Nothing was read or changed.' });
  if (!sameSite(req)) return json(403, { error: 'The CB only answers stimpunks.world.' }, QUIET);
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' }, QUIET);
  if (!rolesEditor(who)) return json(403, { error: 'Roles are changed by administrators.' }, QUIET);
  const b = (await body(req)) || {};
  try {
    if (b.action === 'list') {
      const r = await rolesList(who);
      return r.error ? json(503, r, QUIET) : json(200, r, QUIET);
    }
    if (b.action === 'set' || b.action === 'remove') {
      const r = await setRoles(who, typeof b.handle === 'string' ? b.handle : '', b.roles, undefined, undefined, b.action === 'remove');
      return r.error ? json(400, r, QUIET) : json(200, r, QUIET);
    }
    return json(400, { error: 'Do what with it?' }, QUIET);
  } catch (e) {
    return json(503, { error: 'The list of roles is busy just now. Look again in a moment.' }, QUIET);
  }
};

/* Netlify counts the requests per address and never tells us the address. */
export const config = {
  path: '/cb/roles',
  method: 'POST',
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};

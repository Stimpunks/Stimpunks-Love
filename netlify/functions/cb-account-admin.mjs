/* The moderators' desk, in the Moderators' room: look up one username by
   name, give it a reset code, or delete it. Only a base pass. There is
   deliberately no list of every account: a moderator finds the one they were
   asked about by typing its name. The reset code is shown to the moderator
   once, to pass on privately after they have made sure who they are talking
   to, and is kept here only as a hash. */
import { readPass, cleanHandle, readAccount, resetAccount, deleteAccount, shapeAccount, json, body, sameSite } from '../cb/lib.mjs';

export default async (req) => {
  if (!sameSite(req)) return json(403, { error: 'This desk only answers stimpunks.world.' });
  const who = await readPass(req);
  if (!who || who.role !== 'base') return json(403, { error: 'Only a moderator can do that.' });
  const b = (await body(req)) || {};
  const handle = cleanHandle(b.handle);
  if (!handle) return json(400, { error: 'Which username?' });
  try {
    if (b.action === 'find') return json(200, shapeAccount(await readAccount(handle)));
    if (b.action === 'reset') {
      const r = await resetAccount(handle);
      if (r.error) return json(404, { error: r.error });
      return json(200, { code: r.code, until: r.until });
    }
    if (b.action === 'delete') {
      const r = await deleteAccount(handle);
      if (r.error) return json(404, { error: r.error });
      return json(200, { deleted: true });
    }
    return json(400, { error: 'Do what with it?' });
  } catch (e) {
    return json(503, { error: 'The desk is busy. Try again in a moment. Nothing was changed.' });
  }
};

export const config = {
  path: '/cb/account/admin',
  method: 'POST',
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};

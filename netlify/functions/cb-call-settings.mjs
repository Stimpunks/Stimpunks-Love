/* JaaS's settings webhook (SETTINGS_PROVISIONING). 8x8 calls this before every
   meeting on our App ID with {"fqn": "AppID/roomName"}, and the answer decides
   whether that meeting starts with a lobby. Since 2026-11-01 there are no
   guests and it always answers no lobby; once it is taken off in the JaaS
   console under Webhooks, this file and callSettings can go. Nothing about
   the request is kept. If CB_JAAS_HOOK_SECRET is set in Netlify, a request
   has to carry it as its Authorization header, the way the console sends it. */
import { callSettings, json } from '../cb/lib.mjs';

export default async (req) => {
  const secret = process.env.CB_JAAS_HOOK_SECRET;
  if (secret && req.headers.get('authorization') !== secret) return json(401, { error: 'no' });
  return json(200, callSettings());
};

export const config = {
  path: '/cb/call-settings',
  method: 'POST',
  rateLimit: { windowLimit: 120, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};

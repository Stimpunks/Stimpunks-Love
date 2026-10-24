/* Direct messages, for the CB's Messages part. Everything is a POST with a
   pass, and a handle travels in the body, never the address, so it is in no
   request log:
     {}                              your conversations, your switch and your
                                     block list
     { open: true | false }          Let people message me, on or off
     { with }                        the conversation with somebody
     { with, send: words }           send them a message
     { with, send, re: id }          as a reply to a message in it
     { with, send, img, alt }        with a picture /cb/dm/image took, once
                                     the conversation is accepted
     { with, send, sticker | avatar | chimera | patch: id, or jacket: true }
                                     with a sticker of one of your own, once
                                     the conversation is accepted
     { with, react: id, emoji }      react to a message, or take yours back,
                                     once the conversation is accepted
     { with, accept: true }          accept what they asked
     { with, reject: true }          reject it: emptied, and nobody is told
     { with, take: id }              take one of your messages back
     { with, edit: id, text }        edit one of your messages
     { with, block: true }           block them, which empties the conversation
     { unblock: handle }             stop blocking them
     { with, report: id, note }      report a message they sent you to the
                                     moderators' desk
   Only a claimed username can, at both ends. Nothing about who read what is
   kept, and nothing is counted. A message sent tells the other person's
   devices that switched on When somebody messages me (notifyDm), after it is
   in the conversation, so a slow push service never holds the press up. The
   moderators' list of reports is /cb/dm/reports. A conversation answer
   carries the other person's chat status (chatStatusOf, 2026-10-24), so it can
   be checked before anybody writes, '' for none, and none while they are not
   taking messages from you or you have blocked them. It is a sign and never a
   lock: nothing here refuses a message because of it. */
import { readPass, forumReader, listDms, readDmWith, chatStatusOf, petKey, sendDm, acceptDm, rejectDm, takeDm, editDm, reactDm, setDmOpen, blockDm,
  unblockDm, reportDm, notifyDm, cleanHandle, MESSAGE_MAX, REPORT_NOTE_MAX, DM_WITH, json, body, sameSite } from '../cb/lib.mjs';

// Every answer asks search engines not to index or archive it, as
// privacy.html#messages says.
const NOINDEX = { 'x-robots-tag': 'noindex, nofollow, noarchive' };
const ok = (b) => json(200, { ...b, max: MESSAGE_MAX }, NOINDEX);

export default async (req, context) => {
  if (!sameSite(req)) return json(403, { error: 'Messages only answer stimpunks.world.' });
  const who = await readPass(req);
  if (!who) return json(401, { error: 'signed off' });
  if (!forumReader(who)) return json(403, { error: 'Claim your username first, under Account on this radio: messages are for claimed usernames only, because an unclaimed handle is anybody’s who signs on with it.' });
  const b = (await body(req)) || {};
  try {
    if (typeof b.open === 'boolean') {
      await setDmOpen(who, b.open);
      return ok(await listDms(who));
    }
    if (typeof b.unblock === 'string') {
      const r = await unblockDm(who, b.unblock);
      if (r.error) return json(404, { error: 'That name is not on your block list.' });
      return ok(await listDms(who));
    }
    if (b.with === undefined) return ok(await listDms(who));
    const handle = cleanHandle(b.with);
    if (!handle) return json(400, { error: 'Who with?' });
    const talk = async (extra = {}) => {
      const r = await readDmWith(who, handle);
      if (r.error === 'self') return json(400, { error: 'Messages are for somebody else.' });
      const chat = r.error || !r.handle || r.can === 'closed' || r.can === 'blocked' ? '' : await chatStatusOf(petKey(r.handle));
      return ok({ ...r, chat, ...extra });
    };
    if (b.send !== undefined) {
      const kinds = ['sticker', 'avatar', 'chimera', 'patch', 'jacket'];
      const said = b.img != null || b.re != null || kinds.some((k) => b[k] != null)
        ? { text: b.send, img: b.img, alt: b.alt, re: b.re, sticker: b.sticker, avatar: b.avatar, chimera: b.chimera, patch: b.patch, jacket: b.jacket === true ? true : undefined }
        : b.send;
      const r = await sendDm(who, handle, said);
      if (r.error === 'empty') return json(400, { error: 'Write something first.' });
      if (r.error === 'accepted') return json(409, { error: `A picture or a sticker can go once ${handle} has accepted the conversation. A first message is words only.` });
      if (r.error === 'one') return json(400, { error: 'A message is one picture or one sticker, not two.' });
      if (r.error === 'sticker') return json(400, { error: 'That is not one of yours to send as a sticker.' });
      if (r.error === 'picture') return json(400, { error: 'That picture did not come through. Add it again.' });
      if (r.error === 'reply') return json(409, { error: 'The message you were replying to is no longer in this conversation, so yours did not send. Your words are still in the box: send again to send them on their own.', gone: 're' });
      if (r.error === 'long') return json(400, { error: `A message is at most ${MESSAGE_MAX} characters.` });
      if (r.error === 'self') return json(400, { error: 'Messages are for somebody else.' });
      if (r.error === 'closed') return json(403, { error: `${handle} is not taking messages from you just now.` });
      if (r.error === 'blocked') return json(403, { error: `You have blocked ${handle}. Unblock them, under Messages, to write to them.` });
      if (r.error === 'waiting') return json(409, { error: `Your first message is waiting for ${handle} to answer. You can write more once they do.` });
      if (r.error === 'many') return json(409, { error: `You are in ${DM_WITH} conversations already. One goes when nothing has been said in it for two days.` });
      if (r.error) return json(400, { error: 'That did not send.' });
      const told = notifyDm(r.handle, who.handle, r.sent, r.asked).catch(() => []);
      if (context && typeof context.waitUntil === 'function') context.waitUntil(told); else await told;
      return talk({ sent: r.sent.id, asked: r.asked, accepted: r.accepted });
    }
    if (b.accept === true) {
      const r = await acceptDm(who, handle);
      if (r.error) return json(404, { error: 'That is not waiting for you any more.' });
      return talk();
    }
    if (b.reject === true) {
      const r = await rejectDm(who, handle);
      if (r.error) return json(404, { error: 'That is not waiting for you any more.' });
      return ok(await listDms(who));
    }
    if (typeof b.take === 'string') {
      const r = await takeDm(who, handle, b.take);
      if (r.error) return json(404, { error: 'That message is not there any more, or is not yours.' });
      return talk();
    }
    if (typeof b.react === 'string') {
      const r = await reactDm(who, handle, b.react, b.emoji);
      if (r.error === 'emoji') return json(400, { error: 'A reaction is one emoji, and only an emoji.' });
      if (r.error === 'accepted') return json(409, { error: `Reactions are for a conversation ${handle} has accepted.` });
      if (r.error === 'full') return json(409, { error: 'That message has as many different reactions as it can hold. Press one that is already there.' });
      if (r.error) return json(404, { error: 'That message is not there any more.' });
      return talk();
    }
    if (typeof b.edit === 'string') {
      const r = await editDm(who, handle, b.edit, b.text);
      if (r.error === 'empty') return json(400, { error: 'A message needs words, unless it is a picture. Take it back instead, if you want it gone.' });
      if (r.error === 'long') return json(400, { error: `A message is at most ${MESSAGE_MAX} characters.` });
      if (r.error) return json(404, { error: 'That message is not there any more, or is not yours.' });
      return talk();
    }
    if (b.block === true) {
      const r = await blockDm(who, handle);
      if (r.error === 'full') return json(409, { error: 'Your block list is full. Unblock somebody first.' });
      if (r.error) return json(404, { error: `${handle} has not claimed that username, so there is nobody to block.` });
      return ok(await listDms(who));
    }
    if (typeof b.report === 'string') {
      const r = await reportDm(who, handle, b.report, b.note);
      if (r.error === 'long') return json(400, { error: `A note is at most ${REPORT_NOTE_MAX} characters.` });
      if (r.error === 'again') return json(409, { error: 'You have reported that message already. The moderators have it.' });
      if (r.error === 'full') return json(503, { error: 'The moderators’ desk is full just now. Tell a moderator another way, on a call or in their room.' });
      if (r.error) return json(404, { error: 'That message is not there any more.' });
      return talk({ reported: true });
    }
    return await talk();
  } catch (e) {
    return json(503, { error: 'That did not work just now. Nothing changed; try again in a moment.' });
  }
};

/* Netlify counts the tries per address and never tells us the address. An
   open conversation is asked every few seconds while it is on the screen. */
export const config = {
  path: '/cb/dm',
  method: 'POST',
  rateLimit: { windowLimit: 90, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};

/* The CB's notifications (Ryan, 2026-10-18): the one service worker on this
   street. The radio registers it only when somebody presses Notify me on this
   device, and it does two things and nothing else: shows a notification when
   the street sends one, and opens the room it is about when it is pressed.

   IT HAS NO FETCH HANDLER, ON PURPOSE. It never sees a page, a request or a
   cache, so it cannot change what any room serves or keep a copy of one;
   tools/check-push.py refuses a fetch listener, a cache and storage here.

   What a notification says is worked out here from what the street sent:
   who, where, why, and the words if this device asked for them. A room's
   name comes from the street's own list, /cb-rooms.json, the radio's; the
   address it opens is a path on this site and nothing else, a post in the
   forums (Ryan, 2026-10-18: an @mention there tells the devices that asked),
   or the street with #cb=props, where the radio opens Profile at Your props
   (props given to you, the same evening), or with #cb=messages, where it
   opens Messages (a direct message, the same evening), or a task in Tasks,
   or Tasks' Notifications when the task has been deleted (2026-10-21). A
   forum category's room (forum-coping) is in no public list, so the street
   sends its name and its address with it, and the address is a category's in
   the forums and nothing else (2026-10-21). */
'use strict';

var ROOMS = null;
function rooms() {
  if (ROOMS) return Promise.resolve(ROOMS);
  return fetch('/cb-rooms.json', { credentials: 'omit' })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) { ROOMS = (d && d.rooms) || []; return ROOMS; })
    .catch(function () { return []; });
}
function placeOf(list, tag) {
  for (var i = 0; i < list.length; i++) if (list[i].tag === tag) return list[i];
  return null;
}
function safePath(p) {
  if (typeof p !== 'string') return '/';
  if (/^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\.html)?(?:#cb=(?:props|messages))?$/.test(p)) return p;
  if (/^\/tasks\.html#\/(?:t\/k[A-Za-z0-9_-]{12}(?:\/c\/m[A-Za-z0-9_-]{12})?|inbox)$/.test(p)) return p;
  if (/^\/office\.html#\/(?:(?:c|g|k|mailings|templates)\/[cgknt][A-Za-z0-9_-]{12}|m\/[0-9a-f]{8,32})(?:\/c\/m[A-Za-z0-9_-]{12})?$/.test(p)) return p;
  if (/^\/forum\.html#\/c\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p)) return p;
  return /^\/forum\.html#\/t\/t[A-Za-z0-9_-]{12}(?:\/p[A-Za-z0-9_-]{11})?$/.test(p) ? p : '/';
}
// A forum category's room, as the street named it in the notification.
function forumPlace(d, tag) {
  var p = d.place;
  if (!/^forum-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tag) || !p || typeof p.name !== 'string' || typeof p.path !== 'string') return null;
  var path = safePath(p.path);
  return path === '/' ? null : { name: p.name.slice(0, 120), path: path };
}

/* A task's notification, in the words Tasks' own list uses. */
function taskSays(d) {
  var by = d.handle ? String(d.handle).slice(0, 40) : '';
  if (d.did === 'office') {
    // A comment in the office: what it is on, never its name, which is sealed.
    var what = { contact: 'a contact', grant: 'a grant request', 'case': 'a case', mailing: 'a mailing', template: 'a template', email: 'an email' }[d.what] || 'something';
    var at = { contact: 'c', grant: 'g', 'case': 'k', mailing: 'mailings', template: 'templates', email: 'm' }[d.what];
    // An email's comments go by email- and its Gmail id, and its page by the Gmail id alone.
    var rec = typeof d.rec !== 'string' ? '' : d.what === 'email' ? ((/^email-([0-9a-f]{8,32})$/.exec(d.rec) || [])[1] || '')
      : /^[cgknt][A-Za-z0-9_-]{12}$/.test(d.rec) ? d.rec : '';
    var on = rec && typeof d.comment === 'string' && /^m[A-Za-z0-9_-]{12}$/.test(d.comment) ? '/c/' + d.comment : '';
    return { title: by + (d.why === 'mentioned' ? ' mentioned you in a comment on ' : d.why === 'commented' ? ' also commented on ' : ' commented on ') + what + ' in the office',
      body: 'Open it in the office.', url: safePath(rec && at ? '/office.html#/' + at + '/' + rec + on : '/tasks.html#/inbox'), tag: 'cb-office-' + (rec || 'gone') };
  }
  var name = typeof d.name === 'string' && d.name ? '“' + d.name + '”' : '';
  var title = d.did === 'recurred' ? (d.why === 'assigned' ? 'A recurring task came round for you' : 'A recurring task came round')
    : d.why === 'assigned' ? by + ' assigned you a task'
    : d.why === 'added' ? by + ' put you on a task'
    : d.why === 'removed' ? by + ' took you off a task'
    : d.why === 'mentioned' ? by + (d.did === 'commented' ? ' mentioned you in a comment on a task' : ' mentioned you in a task')
    : d.did === 'commented' ? by + (d.why === 'commented' ? ' also commented on a task' : ' commented on a task')
    : d.did === 'made' ? by + ' made a task'
    : d.did === 'deleted' ? by + ' deleted a task'
    : d.did === 'ticked' ? by + ' ticked a box on a task' : by + ' changed a task';
  var body = name ? name + (d.box ? ': “' + d.box + '”' : '') : 'Open Notifications in Tasks to see it.';
  var task = typeof d.task === 'string' && /^k[A-Za-z0-9_-]{12}$/.test(d.task) ? d.task : '';
  // A comment opens on itself.
  var said = task && typeof d.comment === 'string' && /^m[A-Za-z0-9_-]{12}$/.test(d.comment) ? '/c/' + d.comment : '';
  return { title: title, body: body, url: safePath(task ? '/tasks.html#/t/' + task + said : '/tasks.html#/inbox'), tag: 'cb-task-' + (task || 'gone') };
}

function say(d) {
  if (!d || typeof d !== 'object') return Promise.resolve(null);
  if (d.kind === 'forum') {
    var by = String(d.handle || 'Somebody').slice(0, 40);
    var cat = typeof d.cat === 'string' && d.cat ? d.cat.slice(0, 80) : 'the forums';
    var said = typeof d.title === 'string' && d.title ? '“' + d.title + '”' + (d.text ? ': ' + d.text : '') : 'A post in ' + cat + '.';
    return Promise.resolve({ title: by + ' mentioned you in ' + cat, body: said,
      url: safePath('/forum.html#/t/' + String(d.t || '') + (d.p ? '/' + String(d.p) : '')), tag: 'cb-forum-' + String(d.p || d.t || '') });
  }
  if (d.kind === 'props') {
    var from = String(d.handle || 'Somebody').slice(0, 40);
    return Promise.resolve({ title: from + ' gave you props',
      body: typeof d.text === 'string' && d.text ? d.text : 'They wait in Profile on the CB for you to Confirm or Reject.',
      url: '/#cb=props', tag: 'cb-props-' + from });
  }
  if (d.kind === 'dm') {
    var sender = String(d.handle || 'Somebody').slice(0, 40);
    return Promise.resolve({ title: d.asked ? sender + ' asks to message you' : sender + ' sent you a message',
      body: typeof d.text === 'string' && d.text ? d.text : d.asked ? 'It waits under Messages on the CB for you to answer it, accept it or reject it.'
        : d.what === 'picture' ? 'A picture. Open Messages on the CB to see it.'
        : d.what === 'sticker' ? 'A sticker. Open Messages on the CB to see it.' : 'Open Messages on the CB to read it.',
      url: '/#cb=messages', tag: 'cb-dm-' + sender });
  }
  if (d.kind === 'task') return Promise.resolve(taskSays(d));
  if (d.kind === 'test') {
    return Promise.resolve({ title: 'Notifications are on', body: 'This is how a notification from the CB looks on this device.', url: '/', tag: 'cb-test' });
  }
  return rooms().then(function (list) {
    var tag = typeof d.room === 'string' ? d.room : '';
    var place = tag && tag !== 'world' ? placeOf(list, tag) || forumPlace(d, tag) : null;
    var where = place ? place.name : (tag && tag !== 'world' ? '#' + tag : 'World');
    // World's channel is the World room's, so a World notification opens that
    // room when the street's list has it.
    var world = placeOf(list, 'world');
    var url = place ? safePath(place.path) : (tag && tag !== 'world' ? safePath('/' + tag + '.html') : (world ? safePath(world.path) : '/'));
    if (d.kind === 'call') {
      return { title: tag === 'world' ? 'The World call has started' : 'A call has started in ' + where,
        body: 'Open the CB to join it.', url: url, tag: 'cb-call-' + (tag || 'world') };
    }
    if (d.kind !== 'message') return null;
    var who = String(d.handle || 'Somebody').slice(0, 40);
    var title = d.why === 'mention'
      ? who + ' mentioned you ' + (place || tag ? 'in ' + where : 'on World')
      : d.why === 'reply' ? who + ' replied to you ' + (place || tag ? 'in ' + where : 'on World')
        : who + (place || tag ? ' in ' + where : ' on World');
    var body = typeof d.text === 'string' && d.text ? d.text
      : d.what === 'picture' ? 'Sent a picture.' : d.what === 'sticker' ? 'Sent a sticker.' : 'Sent a message.';
    return { title: title, body: body, url: url, tag: d.why === 'mention' || d.why === 'reply' ? 'cb-' + d.why + '-' + String(d.id || '') : 'cb-' + (tag || 'world') };
  });
}

/* The badge is the small picture in Android's status bar, which Android draws
   from its transparency alone: badge-96.png is the heart in white on nothing,
   rendered by tools/make-icons.py, because icon-192's ground is opaque and came
   out as a plain square. */
self.addEventListener('push', function (e) {
  var d = null;
  try { d = e.data ? e.data.json() : null; } catch (err) { d = null; }
  e.waitUntil(say(d).then(function (n) {
    if (!n) return null;
    return self.registration.showNotification(n.title, {
      body: n.body, tag: n.tag, renotify: true, icon: '/icon-192.png', badge: '/badge-96.png', data: { url: n.url },
    });
  }));
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var url = safePath(e.notification.data && e.notification.data.url);
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (wins) {
    for (var i = 0; i < wins.length; i++) {
      var w = wins[i];
      try { var u = new URL(w.url); if (u.pathname + (url.indexOf('#') >= 0 ? u.hash : '') === url && 'focus' in w) return w.focus(); } catch (err) { /* another site's window */ }
    }
    return self.clients.openWindow ? self.clients.openWindow(url) : null;
  }));
});

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
   address it opens is a path on this site and nothing else. */
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
function safePath(p) { return typeof p === 'string' && /^\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\.html)?$/.test(p) ? p : '/'; }

function say(d) {
  if (!d || typeof d !== 'object') return Promise.resolve(null);
  if (d.kind === 'test') {
    return Promise.resolve({ title: 'Notifications are on', body: 'This is how a notification from the CB looks on this device.', url: '/', tag: 'cb-test' });
  }
  return rooms().then(function (list) {
    var tag = typeof d.room === 'string' ? d.room : '';
    var place = tag && tag !== 'world' ? placeOf(list, tag) : null;
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
      : who + (place || tag ? ' in ' + where : ' on World');
    var body = typeof d.text === 'string' && d.text ? d.text
      : d.what === 'picture' ? 'Sent a picture.' : d.what === 'sticker' ? 'Sent a sticker.' : 'Sent a message.';
    return { title: title, body: body, url: url, tag: d.why === 'mention' ? 'cb-mention-' + String(d.id || '') : 'cb-' + (tag || 'world') };
  });
}

self.addEventListener('push', function (e) {
  var d = null;
  try { d = e.data ? e.data.json() : null; } catch (err) { d = null; }
  e.waitUntil(say(d).then(function (n) {
    if (!n) return null;
    return self.registration.showNotification(n.title, {
      body: n.body, tag: n.tag, renotify: true, icon: '/icon-192.png', badge: '/icon-192.png', data: { url: n.url },
    });
  }));
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var url = safePath(e.notification.data && e.notification.data.url);
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (wins) {
    for (var i = 0; i < wins.length; i++) {
      var w = wins[i];
      try { if (new URL(w.url).pathname === url && 'focus' in w) return w.focus(); } catch (err) { /* another site's window */ }
    }
    return self.clients.openWindow ? self.clients.openWindow(url) : null;
  }));
});

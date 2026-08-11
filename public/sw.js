/* Plexus — service worker for Web Push.
 *
 * Runs outside any page, which is the whole point: it keeps receiving notifications after
 * the portal tab is closed. It deliberately does nothing else — no caching, no offline
 * shell — so it cannot interfere with how the app loads.
 */

self.addEventListener('install', () => {
  // Take over straight away instead of waiting for existing tabs to close, otherwise a
  // freshly deployed worker sits idle until the user closes the portal.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    // A payload we cannot parse still deserves to reach the user.
    data = { title: 'Plexus', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'Plexus';
  const options = {
    body: data.body || '',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    // Same tag => a second demande replaces the first popup rather than stacking.
    tag: data.tag || 'plexus-demande-devis',
    renotify: true,
    data: { url: data.url || '/pages/demandes-devis' }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/pages/demandes-devis';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Prefer focusing a tab that is already open — opening a duplicate portal on every
      // notification would be worse than the notification itself.
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(target).catch(() => {});
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(target);
      }
      return undefined;
    })
  );
});

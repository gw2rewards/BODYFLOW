// BodyFlow Service Worker v1.0
// Gère les notifications push même app fermée

const CACHE_NAME = 'bodyflow-v1';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

// Réception d'une notification push (depuis le serveur — futur usage)
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'BodyFlow 💪', {
      body: data.body || 'C\'est l\'heure de ta séance !',
      icon: '/BODYFLOW/icon-192.png',
      badge: '/BODYFLOW/icon-192.png',
      tag: 'bodyflow-workout',
      renotify: true,
      data: { url: '/BODYFLOW/' }
    })
  );
});

// Clic sur une notification → ouvre l'app
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes('/BODYFLOW/') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow('/BODYFLOW/');
    })
  );
});

// Alarmes locales planifiées via postMessage
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SCHEDULE_NOTIFICATION') {
    const { delay, title, body } = e.data;
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        icon: '/BODYFLOW/icon-192.png',
        badge: '/BODYFLOW/icon-192.png',
        tag: 'bodyflow-workout',
        renotify: true,
        data: { url: '/BODYFLOW/' }
      });
    }, delay);
  }
});

/// <reference lib="webworker" />

// Service Worker for Push Notifications
const sw = self as unknown as ServiceWorkerGlobalScope;

sw.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const { title, body, icon, badge, tag, data: notificationData } = data;

  const options: NotificationOptions = {
    body,
    icon: icon || '/favicon.ico',
    badge: badge || '/favicon.ico',
    tag,
    data: notificationData,
    vibrate: [200, 100, 200],
    requireInteraction: false,
  };

  event.waitUntil(
    sw.registration.showNotification(title, options)
  );
});

sw.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/home';

  event.waitUntil(
    sw.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If a window is already open, focus it
        for (const client of clientList) {
          if ('focus' in client) {
            client.focus();
            if ('navigate' in client) {
              (client as WindowClient).navigate(urlToOpen);
            }
            return;
          }
        }
        // Otherwise open a new window
        if (sw.clients.openWindow) {
          return sw.clients.openWindow(urlToOpen);
        }
      })
  );
});

sw.addEventListener('install', () => {
  sw.skipWaiting();
});

sw.addEventListener('activate', (event) => {
  event.waitUntil(sw.clients.claim());
});

export {};

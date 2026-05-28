/**
 * Annapurna Bhandar Service Worker for Web Push Notifications
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = { title: 'অন্নপূর্ণা ভাণ্ডার ডট কম', body: 'নতুন সরকারি আপডেট প্রকাশিত হয়েছে!' };
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'অন্নপূর্ণা ভাণ্ডার ডট কম', body: event.data.text() };
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=192',
    badge: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=96',
    vibrate: [100, 50, 100],
    data: {
      url: data.link || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

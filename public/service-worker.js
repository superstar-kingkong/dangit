console.log('🚀 FRESH SW v3 - ZERO CACHE');

self.addEventListener('install', () => {
  console.log('✅ Fresh SW installing...');
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  console.log('✅ Fresh SW activated!');
  self.clients.claim();
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll().then(clients => {
      return clients.length > 0 ? clients[0].focus() : self.clients.openWindow('/')
    })
  );
});

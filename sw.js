self.addEventListener('install', function (event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function (event) {
  event.waitUntil((async function () {
    const keys = await caches.keys();
    await Promise.all(keys.map(function (key) { return caches.delete(key); }));
    await self.registration.unregister();
    await self.clients.claim();
  })());
});

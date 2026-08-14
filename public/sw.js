self.addEventListener('install', (event) => {
  console.log('Service worker installed.');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activated.');
});

self.addEventListener('fetch', (event) => {
  // A simple pass-through fetch is enough to satisfy the PWA installability requirements
  event.respondWith(fetch(event.request));
});

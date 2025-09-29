const CACHE_NAME = 'tiempo-app-v1.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/estilos.css',
  '/API.js',
  '/manifest.json',
  '/imagenes/icono_tiempo.png',
  '/imagenes/lupa.png',
  '/imagenes/configuracion.png',
  '/imagenes/fondo1_tiempo.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
// Service worker: guarda la app en el teléfono para que abra sin internet (p. ej. en el torneo).
// Estrategia: responde con lo guardado al instante y, si hay red, actualiza en segundo plano.
// Para forzar que todos los teléfonos descarguen una versión nueva, cambia VERSION.
const VERSION = 'wargreymon-v1';
const ARCHIVOS = ['./', './index.html', './manifest.webmanifest',
                  './icono-192.png', './icono-512.png', './icono-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(claves => Promise.all(claves.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.open(VERSION).then(async cache => {
    const guardado = await cache.match(e.request, { ignoreSearch: true });
    const deRed = fetch(e.request).then(r => {
      if (r.ok) cache.put(e.request, r.clone());
      return r;
    }).catch(() => guardado);
    return guardado || deRed;
  }));
});

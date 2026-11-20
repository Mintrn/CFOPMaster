// Service worker de CFOP Master : met en cache les fichiers de l'application pour qu'elle fonctionne hors ligne.
// Stratégie « réseau d'abord, cache en secours » : en ligne, la dernière version est toujours utilisée.
const CACHE = 'cfopmaster-20261120131605';
const FILES = ['./', './index.html', './app.js', './app.css', './manifest.webmanifest', './icon.svg', './icon-256.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});

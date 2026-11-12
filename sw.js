/* OCI CONNECT – Bon d'intervention : service worker (hors ligne + installation) */
const CACHE = 'oci-bi-v3';
const APP_FILES = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
const CDN_FILES = [
  'https://cdn.jsdelivr.net/npm/signature_pad@4.1.7/dist/signature_pad.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(APP_FILES);
    // Bibliothèques signature + PDF : mises en cache pour fonctionner sans réseau
    await Promise.all(CDN_FILES.map(url =>
      fetch(url, { mode: 'cors' }).then(res => res.ok && cache.put(url, res)).catch(() => {})
    ));
  })());
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Page : réseau d'abord (pour recevoir les mises à jour), cache si hors ligne
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(url.origin + url.pathname, copy));
        return res;
      }).catch(() => caches.match(url.origin + url.pathname).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // Fichiers de l'appli et bibliothèques CDN : cache d'abord
  const sameOrigin = url.origin === self.location.origin;
  const isCdn = url.hostname.includes('cdnjs.cloudflare.com') || url.hostname.includes('cdn.jsdelivr.net');
  if (sameOrigin || isCdn) {
    event.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
        return res;
      }))
    );
  }
});

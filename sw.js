// Chain Crew service worker: network first, cache fallback, so the app opens offline once it has loaded once.
const CACHE = 'chaincrew-v1';
self.addEventListener('install', () => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(caches.open(CACHE).then(async cache => {
    try {
      const res = await fetch(req);
      const u = new URL(req.url);
      if (res.ok && (u.origin === location.origin || /fonts\.(googleapis|gstatic)\.com$|^cdnjs\.cloudflare\.com$/.test(u.hostname))) cache.put(req, res.clone());
      return res;
    } catch (err) {
      const hit = await cache.match(req, { ignoreSearch: true });
      if (hit) return hit;
      if (req.mode === 'navigate') {
        const keys = await cache.keys();
        const nav = keys.find(k => new URL(k.url).origin === location.origin && /\.html?$|\/$/.test(new URL(k.url).pathname));
        if (nav) return cache.match(nav);
      }
      throw err;
    }
  }));
});

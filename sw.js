// Service worker: aplikasi tetap bisa dibuka tanpa internet.
// Kalau data/tampilan diperbarui, naikkan angka VERSI supaya HP mengambil file baru.
const VERSI = 'simulasi-motor-v12';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSI).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSI).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Tampilkan yang tersimpan dulu (cepat, bisa offline), sambil memperbarui di belakang layar.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(cached => {
      const net = fetch(e.request).then(res => {
        if (res && res.ok && new URL(e.request.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(VERSI).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => cached || (e.request.mode === 'navigate' ? caches.match('index.html') : undefined));
      return cached || net;
    })
  );
});

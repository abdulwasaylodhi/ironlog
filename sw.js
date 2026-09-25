const CACHE = 'ironlog-v7';
const ASSETS = ['./', 'manifest.json', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => clients.claim())
  );
});

function cacheIfOk(req, res) {
  if (res && res.status === 200 && res.type === 'basic') {
    const clone = res.clone();
    caches.open(CACHE).then(c => c.put(req, clone));
  }
  return res;
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  // page loads: network first so a new deploy reaches people on their next open,
  // falling back to the cached app shell when offline
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(res => cacheIfOk('./', res))
        .catch(() => caches.match('./'))
    );
    return;
  }

  // everything else: serve from cache instantly, refresh the cached copy in the background
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => cacheIfOk(e.request, res));
      if (cached) {
        network.catch(() => {});
        return cached;
      }
      return network.catch(() => caches.match('./'));
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const action = event.action; // "complete", "skip", or "" (plain body tap)
  let msg = null;
  if (action === 'skip') msg = {type:'rest-skip'};
  else if (action === 'complete') msg = {type:'rest-complete-next'};
  const shouldFocus = !action; // only tapping the notification body should bring the app forward —
                                // action-button taps (Skip / Log Set) stay in the background on purpose
  event.waitUntil(
    self.clients.matchAll({type: 'window', includeUncontrolled: true}).then(async clientList => {
      const target = clientList.find(c => 'focus' in c) || null;
      if (target) {
        if (msg) target.postMessage(msg);
        if (shouldFocus) return target.focus();
        return;
      }
      // no page open at all — the only way to process the action is to open one,
      // which unavoidably brings the app forward this one time
      if (self.clients.openWindow) {
        const newClient = await self.clients.openWindow('./');
        if (newClient && msg) {
          setTimeout(() => newClient.postMessage(msg), 1200);
        }
        return newClient;
      }
    })
  );
});

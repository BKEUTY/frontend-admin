const CACHE_NAME = 'bkeuty-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/offline.html',
    '/logo_nontext.svg',
    '/manifest.json'
];

// Install a service worker
self.addEventListener('install', event => {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting();
});

// Cache and return requests
self.addEventListener('fetch', event => {
    // Skip non-HTTP(S) requests (like chrome-extension://)
    if (!(event.request.url.indexOf('http') === 0)) return;

    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match('/offline.html');
            })
        );
    } else {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    if (response) {
                        return response;
                    }
                    return fetch(event.request).catch(err => {
                        // Silent fail for static assets or log if needed
                        console.debug('Fetch failed inside SW:', event.request.url);
                    });
                })
        );
    }
});

// Update a service worker
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

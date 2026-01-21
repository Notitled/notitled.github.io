const CACHE_NAME = 'notitled-v8';
const urlsToCache = [
    '/',
    '/index.html',
    '/assets/css/style.css',
    '/assets/css/modules/variables.css',
    '/assets/css/modules/reset.css',
    '/assets/css/modules/animations.css',
    '/assets/css/modules/components.css',
    '/assets/css/modules/layouts.css',
    '/assets/js/core/app.js',
    '/assets/js/core/config.js',
    '/assets/js/core/router.js',
    '/assets/js/utils/utils.js',
    '/assets/js/utils/templates.js',
    '/assets/js/services/api.js',
    '/assets/js/services/seo.js',
    '/assets/js/features/theme.js',
    '/assets/js/features/tags.js',
    '/assets/js/features/pagination.js',
    '/assets/js/features/toc.js',
    '/assets/js/vendor/marked.min.js',
    '/posts/index.json',
    '/assets/favicon.svg'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                    .then(cache => {
                        cache.put(event.request, responseToCache);
                    });

                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});

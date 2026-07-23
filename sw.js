const CACHE_NAME = 'cv-generator-v1';
const APP_SHELL = [
    './',
    './index.html'
];

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) { return cache.addAll(APP_SHELL); })
            .catch(function () { /* offline ilkin keş uğursuz olsa belə davam et */ })
    );
    self.skipWaiting();
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (names) {
            return Promise.all(
                names.filter(function (n) { return n !== CACHE_NAME; })
                     .map(function (n) { return caches.delete(n); })
            );
        })
    );
    self.clients.claim();
});

// Şəbəkə-əvvəlcə (network-first), uğursuz olsa keşdən qaytar — istifadəçi həmişə ən son versiyanı görür,
// internetsiz olanda isə tətbiq yenə açılır.
self.addEventListener('fetch', function (event) {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        fetch(event.request)
            .then(function (response) {
                const clone = response.clone();
                caches.open(CACHE_NAME).then(function (cache) { cache.put(event.request, clone); }).catch(function () {});
                return response;
            })
            .catch(function () { return caches.match(event.request); })
    );
});

// Basic Service Worker for LeadBroker PWA
const CACHE_NAME = 'leadbroker-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/manifest.json',
    '/globe.svg'
];

self.addEventListener('install', (event: any) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    // Focus or open the app
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            const client = clientList.find(c => c.visibilityState === 'visible') || clientList[0];
            if (client) {
                client.focus();
                if ('navigate' in client) return client.navigate('/notifications');
            }
            return clients.openWindow('/notifications');
        })
    );
});

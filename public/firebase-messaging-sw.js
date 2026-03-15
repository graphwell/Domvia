/*
 * Domvia - Firebase Cloud Messaging Service Worker
 */
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// These will be available from the environment during build or injected
firebase.initializeApp({
    apiKey: "AIzaSyApyC9bT3A1tT9BQBUF5HMM9ibbJapawcg",
    authDomain: "leadbroker-a1fc8.firebaseapp.com",
    projectId: "leadbroker-a1fc8",
    storageBucket: "leadbroker-a1fc8.firebasestorage.app",
    messagingSenderId: "559646894545",
    appId: "1:559646894545:web:4f73e3cc0179e741be58f0"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Background message received:', payload);
    const { title, body } = payload.notification;

    const notificationOptions = {
        body: body,
        icon: '/icon-512x512.png',
        badge: '/favicon.png',
        tag: payload.data?.tag || 'domvia-notif',
        data: {
            url: payload.data?.url || '/notifications'
        }
    };

    self.registration.showNotification(title || "Domvia ✨", notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const urlToOpen = event.notification.data.url || '/notifications';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            const client = clientList.find(c => c.visibilityState === 'visible') || clientList[0];
            if (client) {
                client.focus();
                if ('navigate' in client) return client.navigate(urlToOpen);
            }
            return clients.openWindow(urlToOpen);
        })
    );
});

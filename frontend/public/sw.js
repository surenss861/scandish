// KILL-SW: Development-safe service worker that unregisters itself and does not intercept
// This prevents 503s during Vite dev caused by caching/interception.

self.addEventListener('install', (event) => {
    // Activate immediately
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        try {
            // Clear all caches
            if (self.caches && caches.keys) {
                const keys = await caches.keys();
                await Promise.all(keys.map((k) => caches.delete(k)));
            }
        } catch { }

        try {
            // Unregister this service worker
            await self.registration.unregister();
        } catch { }

        try {
            // Claim and reload clients to ensure no SW control remains
            const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
            for (const client of clientList) {
                client.navigate(client.url);
            }
        } catch { }
    })());
});

// Do not intercept any requests; let the network handle everything
self.addEventListener('fetch', (event) => {
    // No-op
});

console.log('[SW] KILL-SW active: unregistering and bypassing fetch');

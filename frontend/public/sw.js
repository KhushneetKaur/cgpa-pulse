const CACHE_NAME = "cgpa-pulse-v1";
const PRECACHE_ASSETS = ["/", "/index.html", "/manifest.json", "/favicon.png"];

// 1. Install Event: Pre-cache core shell
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

// 2. Activate Event: Clean up old cache versions
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// 3. Fetch Event: Network First + Offline Fallback
self.addEventListener("fetch", (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Ignore non-GET requests and browser extension schemas
  if (request.method !== "GET" || !url.protocol.startsWith("http")) {
    return;
  }

  e.respondWith(
    (async () => {
      try {
        // Try network first
        const networkResponse = await fetch(request);

        // Cache valid HTTP 200 responses dynamically
        if (networkResponse && networkResponse.status === 200) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResponse.clone());
        }

        return networkResponse;
      } catch (error) {
        // Network failed (Offline mode)
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // SPA Route Fallback: Return index.html for navigation requests
        if (request.mode === "navigate") {
          const indexFallback = await caches.match("/index.html");
          if (indexFallback) return indexFallback;
        }

        return new Response("Offline - Resource Unavailable", {
          status: 503,
          statusText: "Service Unavailable",
        });
      }
    })()
  );
});
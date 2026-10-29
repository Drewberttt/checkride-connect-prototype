/* Checkride Connect prototype: basic offline service worker.
   - Precaches the app shell, sample data, icons and self-hosted fonts on install (paths are relative to this file,
     so the app also works when served under a subpath).
   - Versioned cache; old versions are deleted on activate.
   - Network first for same-origin GETs (so edits show up), cache fallback when offline; navigations fall back to index.html.
   - No push, no background sync, no third-party requests. Bump VERSION when the shell changes. */
const VERSION = "cc-proto-v5.2.1";
const CACHE = "checkride-connect-" + VERSION;
const SHELL = [
  "./",
  "index.html",
  "styles.css",
  "app.js",
  "demo-date.js",
  "data.js",
  "sample-fl-examiners.js",
  "site.webmanifest",
  "favicon.ico",
  "icons/favicon.svg",
  "icons/favicon-16.png",
  "icons/favicon-32.png",
  "icons/favicon-48.png",
  "icons/apple-touch-icon.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-192.png",
  "icons/icon-maskable-512.png",
  "brand/runway-icon.svg",
  "fonts/BricolageGrotesque-Variable-latin.woff2",
  "fonts/BricolageGrotesque-Variable-latin-ext.woff2",
  "fonts/Geist-Variable.woff2",
  "fonts/GeistMono-Variable.woff2",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL.map((p) => new Request(new URL(p, self.registration.scope), { cache: "reload" })))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("checkride-connect-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const key = url.href.split("#")[0];
    try {
      const res = await fetch(req);
      // Cache under the URL without its #fragment so "./" and "./#/..." share one entry.
      if (res && res.ok && res.type === "basic") cache.put(key, res.clone());
      return res;
    } catch (e) {
      const hit = await cache.match(key, { ignoreSearch: true });
      if (hit) return hit;
      if (req.mode === "navigate") return (await cache.match(new URL("index.html", self.registration.scope))) || (await cache.match(self.registration.scope));
      return new Response("Offline and not cached (prototype).", { status: 503, headers: { "Content-Type": "text/plain" } });
    }
  })());
});

// Optional OS notification taps (only used if the user granted permission on the Alerts page).
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const hash = (event.notification.data && event.notification.data.hash) || "#/alerts";
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
    const target = new URL("./" + hash, self.registration.scope).href;
    for (const c of list) { if ("focus" in c) { c.navigate ? c.navigate(target) : null; return c.focus(); } }
    return self.clients.openWindow(target);
  }));
});

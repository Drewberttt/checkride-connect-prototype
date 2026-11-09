/* Checkride Connect prototype: basic offline service worker.
   - Precaches the app shell, sample data, icons and self-hosted fonts on install (paths are relative to this file,
     so the app also works when served under a subpath).
   - Versioned cache; old versions are deleted on activate.
   - Network first for same-origin GETs (so edits show up), cache fallback when offline; navigations fall back to index.html.
   - No push, no background sync, no third-party requests. Bump VERSION when the shell changes. */
const VERSION = "cc-proto-v7.15.0"; // QA-085 final-v2 SVG lockups + PWA icons; Brand Designer §8 saved.view/corrupt_cleared. // UNRELEASED saved examiners + saved searches retention. // rc9 D45 info-only certificates/rejoin and auth header. // UNRELEASED local Monday digest preview; parent rc8 QA gate closed. // rc8 candidate RC7-I01/I02/I03 raw text control + visible trimmed imports. // UNRELEASED rc8 dev: signup planning defaults + fictional waitlist clarity. // rc7 candidate: D44 / QA-099; existing QA-100 and scoped QA-095. // UNRELEASED next pass: boolean prep evidence and scoped proto.payments. // rc6 QA-096..098: prep evidence, lower bound and native input feedback. // v4-rc5: QA-089 respondWith guard (Firefox interrupted reloads), QA-090..094, empty prep entries (v7.5.0 = v4-rc4: QA-082 search link note, QA-083 runway manifest + precache, QA-084 dark favicon, QA-089 icon cache-first, D42, CD copy (v7.4.0 = v4 dev: eligibility Rules 5/6 (elig-clock.js), home "Next openings" card fix (v7.3.0 = rc3: QA-075/081 auth validation, QA-076/077/078/079/080 (v7.2.0 = D41 logo/NC/landing; v7.1.0 = v4-rc2)
const CACHE = "checkride-connect-" + VERSION;
const SHELL = [
  "./",
  "index.html",
  "styles.css",
  "app.js",
  "demo-date.js",
  "data.js",
  "sample-fl-examiners.js",
  "sample-tx-examiners.js",
  "sample-ca-examiners.js",
  "sample-az-examiners.js",
  "sample-nc-examiners.js",
  "cost-model.js",
  "elig-clock.js",
  "site.webmanifest",
  "favicon.ico",
  "icons/favicon.svg",
  "icons/favicon-dark.svg",
  "icons/favicon-16.png",
  "icons/favicon-32.png",
  "icons/favicon-48.png",
  "icons/apple-touch-icon.png",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-192.png",
  "icons/icon-maskable-512.png",
  "icons/mark-master-512.png",
  "icons/favicon-dark-16.png",
  "icons/favicon-dark-32.png",
  "icons/favicon-dark-48.png",
  "runway.webmanifest",
  "icons/runway/favicon.ico",
  "icons/runway/favicon.svg",
  "icons/runway/apple-touch-icon.png",
  "icons/runway/favicon-16.png",
  "icons/runway/favicon-32.png",
  "icons/runway/favicon-48.png",
  "icons/runway/icon-192.png",
  "icons/runway/icon-512.png",
  "icons/runway/icon-maskable-192.png",
  "icons/runway/icon-maskable-512.png",
  "brand/checkride-connect-logo-light.svg",
  "brand/checkride-connect-logo-dark.svg",
  "brand/checkride-connect-icon.png",
  "brand/checkride-connect-mark-on-navy.svg",
  "brand/checkride-connect-mark-mono-white.svg",
  "brand/checkride-connect-mark-light.svg",
  "brand/checkride-connect-mark-dark.svg",
  "brand/runway-icon.svg",
  "brand/runway-horizontal-light.svg",
  "brand/runway-horizontal-dark.svg",
  "fonts/Manrope-Variable-latin.woff2",
  "fonts/Manrope-Variable-latin-ext.woff2",
  "fonts/Geist-Variable.woff2",
  "fonts/GeistMono-Variable.woff2",
  "fonts/licenses/OFL-Manrope.txt",
  "fonts/licenses/OFL-Geist-and-GeistMono.txt",
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
  // QA-089: tab and home-screen icons (favicon*, apple-touch-icon, icon-*, the manifests' icons) are answered from the
  // precache first. They only change with a VERSION bump, and answering at once means a page that is torn down mid-load
  // (Firefox test runs that freeze the page clock) no longer leaves a pending network fetch inside respondWith.
  const ICON = /\/(favicon[^/]*|apple-touch-icon\.png|icon-[^/]*\.png)$/.test(url.pathname);
  event.respondWith(answer(req, url, ICON).catch(() => offline(req)));
});

// rc5 (QA-089 re-scoped): Firefox logged "A ServiceWorker intercepted the request and encountered an unexpected error"
// for app.js (and other scripts) during rapid, interrupted reloads. Two guards:
// 1. The network fetch no longer carries the page's abort signal, and its body is read in full before we answer, so
//    an aborted page load can't hand respondWith a half-read stream; a failed read falls back to the cache.
// 2. Every step (caches.open, match, fetch, body read) sits inside one promise with a final .catch, so respondWith
//    always gets a Response (cached copy, index.html for navigations, or a plain 503), never a rejection.
async function answer(req, url, icon) {
  const cache = await caches.open(CACHE);
  const key = url.href.split("#")[0];
  if (icon) { const hit = await cache.match(key, { ignoreSearch: true }); if (hit) return hit; }
  try {
    const res = await fetch(req.mode === "navigate" ? req : new Request(req.url, { credentials: req.credentials, cache: req.cache === "only-if-cached" ? "default" : req.cache, redirect: req.redirect }));
    if (!res || res.type !== "basic" || req.mode === "navigate") {
      // Cache under the URL without its #fragment so "./" and "./#/..." share one entry.
      if (res && res.ok && res.type === "basic") cache.put(key, res.clone()).catch(() => {});
      return res;
    }
    const body = await res.blob(); // whole body in memory (small static files), so the answer can't break mid-stream
    const out = new Response(body, { status: res.status, statusText: res.statusText, headers: res.headers });
    if (res.ok) cache.put(key, out.clone()).catch(() => {});
    return out;
  } catch (e) {
    return offline(req, cache, key);
  }
}
async function offline(req, cache, key) {
  try {
    cache = cache || (await caches.open(CACHE));
    key = key || req.url.split("#")[0];
    const hit = await cache.match(key, { ignoreSearch: true });
    if (hit) return hit;
    if (req.mode === "navigate") { const shell = (await cache.match(new URL("index.html", self.registration.scope))) || (await cache.match(self.registration.scope)); if (shell) return shell; }
  } catch (e) { /* fall through to the plain 503 */ }
  return new Response("Offline and not cached (prototype).", { status: 503, headers: { "Content-Type": "text/plain" } });
}

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

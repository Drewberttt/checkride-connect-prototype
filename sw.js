/* Checkride Connect prototype: basic offline service worker.
   - Precaches the app shell, sample data, icons and self-hosted fonts on install (paths are relative to this file,
     so the app also works when served under a subpath).
   - Versioned cache; old versions are deleted on activate.
   - Navigations, tab/home-screen icons, and shell subresources (scripts, styles, fonts, sample data): cache first, network on miss or shift-reload. Bodies are buffered and aborted requests settle with 204 so a torn-down reload cannot leave respondWith pending (QA-089). Offline navigations fall back to index.html.
   - No push, no background sync, no third-party requests. Bump VERSION when the shell changes. */
const VERSION = "cc-proto-v7.28.0"; // RC21: F06 single readiness model, D53 Checkride-ready Home card, F03 after-checkride outcome.
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
  "wait-time-sample-nc.js",
  "wait-time.js",
  "ics.js",
  "data/wait-time-sample-nc.json",
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
  let url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;
  // QA-089: Always respondWith for navigations, icons, and every other in-scope GET
  // (scripts, styles, fonts, sample data). Firefox drops control if a fetch listener
  // skips a navigation. Shell subresources must be served from the precache on an
  // offline reload — the HTTP cache is not reliable (reload often bypasses it), and
  // skipping intercept left the inline load-error fallback in place of the app.
  // Icons stay on the precache path (they only change with a VERSION bump).
  // Already-aborted requests get a synchronous 204. settle() buffers bodies and
  // races the page abort signal so a torn-down reload cannot leave respondWith
  // pending (Firefox "ServiceWorker intercepted … unexpected error", including on
  // the large app.js body). Never fall through without respondWith for in-scope GETs.
  const ICON = /\/(favicon[^/]*|apple-touch-icon\.png|icon-[^/]*\.png)$/.test(url.pathname);
  if (req.signal && req.signal.aborted) {
    event.respondWith(new Response(null, { status: 204, statusText: "Aborted" }));
    return;
  }
  event.respondWith(settle(event, req, url, ICON));
});

// QA-089 (rc20): Firefox logs "A ServiceWorker intercepted the request and encountered an unexpected error"
// (sometimes with an empty URL) when respondWith is still pending after the page aborts the request —
// the usual pattern in rapid, interrupted reloads. rc5 already (1) dropped the page abort signal from
// subresource fetches, (2) read the body in full, and (3) caught so respondWith would not reject. That
// stopped named-file failures, but a network/blob round-trip still left the promise pending after
// teardown. An early rc20 draft skipped script/style/font intercept so HTTP cache would serve them;
// offline reload then missed those precached files (reload bypasses the HTTP cache) and painted the
// inline load-error fallback instead of the app. Fix:
//   * Always respondWith for every in-scope GET, including shell subresources, so offline reload
//     serves precached scripts/styles/fonts/data (Firefox also drops control if a navigation is skipped).
//   * Already-aborted requests get a synchronous 204.
//   * Cached bodies are buffered so Firefox is not handed a stream it can cancel mid-read.
//   * If the request aborts mid-flight, settle immediately with an empty 204 (no Cache Storage I/O).
//   * Shift/reload (cache: "reload" / "no-store") stays network-first so edits still show up.
// respondWith must never reject, and must never be given undefined.
function settle(event, req, url, icon) {
  const work = answer(event, req, url, icon);
  const signal = req.signal;
  const done = work.catch(() => cancelled(req));
  if (!signal) return done;
  const aborted = new Promise((resolve) => {
    if (signal.aborted) { resolve("aborted"); return; }
    signal.addEventListener("abort", () => resolve("aborted"), { once: true });
  });
  return Promise.race([
    done.then((res) => ({ res })),
    aborted.then(() => ({ aborted: true }))
  ]).then((winner) => {
    if (winner && winner.res) return winner.res;
    // The page is already gone; do not touch Cache Storage or a body stream here.
    return new Response(null, { status: 204, statusText: "Aborted" });
  }).catch(() => new Response(null, { status: 204, statusText: "Aborted" }));
}
async function buffered(res) {
  if (!res) return res;
  const body = await res.blob();
  return new Response(body, { status: res.status, statusText: res.statusText, headers: res.headers });
}
async function answer(event, req, url, icon) {
  const cache = await caches.open(CACHE);
  const key = url.href.split("#")[0];
  const bypass = req.cache === "reload" || req.cache === "no-store";
  if (!bypass) {
    const hit = (await cache.match(key, { ignoreSearch: true }))
      || (req.mode === "navigate" && ((await cache.match(new URL("index.html", self.registration.scope))) || (await cache.match(self.registration.scope))));
    if (hit) return buffered(hit);
  }
  // Cache miss (or shift-reload): go to the network. Honor the page's abort signal so a torn-down
  // reload fails the fetch immediately; cancelled() then settles respondWith with a cache hit or 204.
  try {
    const res = await fetch(req);
    if (!res || res.type !== "basic") return res || (await cancelled(req));
    const body = await res.blob();
    const out = new Response(body, { status: res.status, statusText: res.statusText, headers: res.headers });
    if (res.ok) cache.put(key, out.clone()).catch(() => {});
    return out;
  } catch (e) {
    return cancelled(req);
  }
}
async function cancelled(req) {
  try {
    const hit = await offline(req);
    if (hit && hit.status !== 503) return hit;
  } catch (e) { /* fall through */ }
  return new Response(null, { status: 204, statusText: "Aborted" });
}
async function offline(req, cache, key) {
  try {
    cache = cache || (await caches.open(CACHE));
    key = key || req.url.split("#")[0];
    const hit = await cache.match(key, { ignoreSearch: true });
    if (hit) return buffered(hit);
    if (req.mode === "navigate") {
      const shell = (await cache.match(new URL("index.html", self.registration.scope))) || (await cache.match(self.registration.scope));
      if (shell) return buffered(shell);
    }
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

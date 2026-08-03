const CACHE = "momentree-v1";

// 앱 셸 — 오프라인에서도 뜨게 할 URL 목록
const PRECACHE = ["/", "/admin", "/offline"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      Promise.allSettled(PRECACHE.map((url) => c.add(url)))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // API 요청 — 항상 네트워크, 실패 시 캐시
  if (url.pathname.startsWith("/api/")) {
    e.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // _next/static 에셋 — content hash 있으므로 cache-first
  if (url.pathname.startsWith("/_next/static/")) {
    e.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(request, clone));
            return res;
          })
      )
    );
    return;
  }

  // 이미지 — cache-first
  if (request.destination === "image") {
    e.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(request, clone));
            return res;
          })
      )
    );
    return;
  }

  // HTML 페이지 — network-first, 오프라인 시 캐시 → /offline 폴백
  e.respondWith(
    fetch(request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(request, clone));
        return res;
      })
      .catch(() =>
        caches.match(request).then(
          (cached) => cached || caches.match("/offline")
        )
      )
  );
});

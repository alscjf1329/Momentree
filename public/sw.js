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

  // 오디오/비디오 — Range 요청(206) 스트리밍이라 Cache API로 캐싱 불가능
  // (스펙상 partial response는 cache.put()에서 거부됨) — 그냥 네트워크로 통과
  if (request.destination === "audio" || request.destination === "video" || request.headers.has("range")) {
    e.respondWith(fetch(request));
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

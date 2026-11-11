const CACHE = "momentree-v3"; // 올리면 activate에서 이전 캐시가 지워진다

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

  // 우리 도메인의 http(s) 요청만 다룬다 — 확장 프로그램(chrome-extension:)·외부 도메인은 cache.put 이 예외를 던지고,
  // Next 의 화면 조각(RSC) 요청은 같은 주소라도 헤더에 따라 응답이 달라 캐시에 두면 안 된다.
  if (url.origin !== self.location.origin) return;
  if (request.headers.has("RSC") || url.searchParams.has("_rsc")) return;

  // 캐시 저장 실패(용량·응답 종류)가 요청 처리에 영향을 주지 않게 삼킨다. 정상(200) 응답만 저장.
  const save = (res) => {
    if (res.ok && res.status === 200) {
      const clone = res.clone();
      caches.open(CACHE).then((c) => c.put(request, clone)).catch(() => {});
    }
    return res;
  };

  // API 요청 — 항상 네트워크, 실패 시 캐시
  if (url.pathname.startsWith("/api/")) {
    e.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // _next/static 에셋 — network-first. cache-first였을 때 배포 후에도
  // 예전 캐시("momentree-v1"은 배포마다 안 바뀜)가 새 코드를 계속 가려서
  // 몇 시간 동안 변경사항이 반영 안 되는 문제가 있었음
  if (url.pathname.startsWith("/_next/static/")) {
    e.respondWith(
      fetch(request)
        .then(save)
        .catch(() => caches.match(request))
    );
    return;
  }

  // 이미지 — cache-first
  if (request.destination === "image") {
    e.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then(save)
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
      .then(save)
      .catch(() =>
        caches.match(request).then(
          (cached) => cached || caches.match("/offline")
        )
      )
  );
});

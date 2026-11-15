// 링크 공유 미리보기(OG) 도우미 — 카카오톡 등이 읽는 값

/** 요청 헤더에서 사이트 주소. SITE_URL 이 있으면 그것 (프록시 뒤에서도 정확) */
export function originFrom(h: { get(name: string): string | null }, siteUrl = process.env.SITE_URL): string {
  if (siteUrl) return siteUrl.replace(/\/$/, "");
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  // 프록시가 프로토콜을 안 넘겨도 로컬이 아니면 https (카톡이 http 주소의 이미지를 못 받는 일을 피한다)
  const proto = h.get("x-forwarded-proto") ?? (/^(localhost|127\.|\[::1\])/.test(host) ? "http" : "https");
  return `${proto}://${host}`;
}

/** 미리보기 이미지 주소. 내 서버의 사진은 1200px 로 줄여서(원본이 크면 미리보기가 안 뜰 수 있다), gif·외부 주소는 그대로 */
export function ogImageUrl(origin: string, src: string): string {
  if (/^https?:\/\//.test(src)) return src;
  if (!src.startsWith("/") || /\.gif$/i.test(src)) return origin + src;
  return `${origin}/_next/image?url=${encodeURIComponent(src)}&w=1200&q=75`;
}

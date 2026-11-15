import type { MetadataRoute } from "next";

// 관리자·API·미리보기·업로드 파일은 검색 대상이 아니다. 고객 청첩장 페이지는 페이지 안의 noindex 로 막는다.
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/preview", "/uploads"] }] };
}

"use client";

import { useEffect } from "react";

export default function RegisterSW() {
  useEffect(() => {
    // 개발 모드에서는 등록하지 않음 — _next/static 캐시가 dev 서버의
    // 실시간 코드 변경과 충돌해 hydration mismatch를 유발함
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  return null;
}

"use client";

import { useEffect } from "react";

// 실제 모바일 기기에서 GSAP ScrollTrigger가 터치 스크롤을 제대로 추적하려면
// normalizeScroll이 필요함 — 한 번만 전역 등록
export default function GSAPInit() {
  useEffect(() => {
    const init = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({ ignoreMobileResize: true });
      // 터치 이벤트를 GSAP이 직접 처리 → 실기기에서 scrub 정상 동작
      ScrollTrigger.normalizeScroll(true);
    };
    init();
  }, []);

  return null;
}

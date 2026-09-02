"use client";

import { useEffect } from "react";

// 최신 모바일 브라우저(iOS Safari 등)는 접근성 이유로 뷰포트의
// maximum-scale=1/user-scalable=no를 무시하고 핀치줌·더블탭줌을 허용하는
// 경우가 많아 메타태그만으로는 확대가 실제로 안 막힘 — 멀티터치와
// 짧은 간격 더블탭을 직접 가로채서 확실히 막음
export default function PreventPinchZoom() {
  useEffect(() => {
    const blockMultiTouch = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };
    let lastTouchEnd = 0;
    const blockDoubleTapZoom = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) e.preventDefault();
      lastTouchEnd = now;
    };
    const blockGesture = (e: Event) => e.preventDefault();

    document.addEventListener("touchmove", blockMultiTouch, { passive: false });
    document.addEventListener("touchend", blockDoubleTapZoom, { passive: false });
    document.addEventListener("gesturestart", blockGesture);

    return () => {
      document.removeEventListener("touchmove", blockMultiTouch);
      document.removeEventListener("touchend", blockDoubleTapZoom);
      document.removeEventListener("gesturestart", blockGesture);
    };
  }, []);

  return null;
}

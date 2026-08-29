"use client";

import { useLayoutEffect, useRef, useState } from "react";

// 한 줄짜리 텍스트가 실제로 그려지는 폭을 넘으면(기기별 폰트 부스팅/렌더링 차이 등
// vw·cqw 계산만으로는 못 잡는 오차) 자동 줄바꿈되는 대신 스스로 축소되어 항상
// 한 줄을 유지함 — 사용자가 직접 정한 줄바꿈 위치가 어떤 기기에서도 깨지지 않게 보장하는 안전망.
export default function FitLine({
  children,
  boundRef,
  align = "center",
  className,
  style,
}: {
  children: React.ReactNode;
  boundRef: React.RefObject<HTMLElement | null>;
  align?: "center" | "left";
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = ref.current;
    const bound = boundRef.current;
    if (!el || !bound) return;

    const measure = () => {
      const boundRect = bound.getBoundingClientRect();
      const cs = getComputedStyle(bound);
      const paddingLeft = parseFloat(cs.paddingLeft) || 0;
      const paddingRight = parseFloat(cs.paddingRight) || 0;
      const availableWidth =
        align === "left"
          ? boundRect.right - paddingRight - el.getBoundingClientRect().left
          : boundRect.width - paddingLeft - paddingRight;
      const naturalWidth = el.scrollWidth;
      setScale(
        naturalWidth > 0 && availableWidth > 0 && naturalWidth > availableWidth
          ? availableWidth / naturalWidth
          : 1
      );
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(bound);
    return () => ro.disconnect();
  }, [children, boundRef, align]);

  return (
    <span
      ref={ref}
      className={className}
      style={{
        ...style,
        display: "inline-block",
        whiteSpace: "nowrap",
        transform: `scale(${scale})`,
        transformOrigin: align === "left" ? "left center" : "center",
      }}
    >
      {children}
    </span>
  );
}

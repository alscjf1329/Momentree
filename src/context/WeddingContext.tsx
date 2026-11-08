"use client";

import { createContext, useContext } from "react";
import type { WeddingData } from "@/types";
import { watermarkText } from "@/lib/plan";
import { THEMES, DEFAULT_THEME } from "@/themes";

const WeddingContext = createContext<WeddingData | null>(null);

export function useWedding(): WeddingData {
  const ctx = useContext(WeddingContext);
  if (!ctx) throw new Error("useWedding must be used inside WeddingProvider");
  return ctx;
}

export function WeddingProvider({
  data,
  watermark = false,
  children,
}: {
  data: WeddingData;
  watermark?: boolean; // 무료 플랜 — 모든 템플릿 하단에 작은 문구 (템플릿별 수정 없이 여기 한 곳에서)
  children: React.ReactNode;
}) {
  const theme = THEMES[data.theme] ?? DEFAULT_THEME;
  // CSS 변수를 wrapper div에 설정 → 자식 컴포넌트에서 var(--color-*) 로 참조
  const styleVars = theme.vars as React.CSSProperties;

  return (
    <WeddingContext.Provider value={data}>
      <div style={styleVars}>
        {children}
        {watermark && <p className="py-4 text-center text-[11px] text-neutral-400 bg-white" data-watermark>{watermarkText}</p>}
      </div>
    </WeddingContext.Provider>
  );
}

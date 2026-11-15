"use client";

import { createContext, useContext } from "react";
import type { WeddingData } from "@/types";
import { watermarkText } from "@/lib/plan";
import { EXAMPLE_AI_NOTE } from "@/lib/exampleInfo";
import { THEMES, DEFAULT_THEME, PALETTES } from "@/themes";

const WeddingContext = createContext<WeddingData | null>(null);

export function useWedding(): WeddingData {
  const ctx = useContext(WeddingContext);
  if (!ctx) throw new Error("useWedding must be used inside WeddingProvider");
  return ctx;
}

export function WeddingProvider({
  data,
  watermark = false,
  aiNote = false,
  children,
}: {
  data: WeddingData;
  watermark?: boolean; // 무료 플랜 — 모든 템플릿 하단에 작은 문구 (템플릿별 수정 없이 여기 한 곳에서)
  aiNote?: boolean; // 랜딩 예시 청첩장만 — 맨 아래 작은 "AI 생성 이미지" 문구
  children: React.ReactNode;
}) {
  const theme = THEMES[data.theme] ?? DEFAULT_THEME;
  // CSS 변수를 wrapper div에 설정 → 자식 컴포넌트에서 var(--color-*) 로 참조
  const styleVars = { ...theme.vars, ...PALETTES[data.palette ?? ""]?.vars } as React.CSSProperties;

  return (
    <WeddingContext.Provider value={data}>
      <div style={styleVars}>
        {children}
        {watermark && <p className="py-4 text-center text-[11px] text-neutral-400 bg-[var(--color-cream)]" data-watermark>{watermarkText}</p>}
        {aiNote && <p className="pb-3 text-center text-[10px] text-neutral-300 bg-[var(--color-cream)]" data-ai-note>{EXAMPLE_AI_NOTE}</p>}
      </div>
    </WeddingContext.Provider>
  );
}

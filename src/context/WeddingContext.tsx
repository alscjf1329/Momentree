"use client";

import { createContext, useContext } from "react";
import type { WeddingData } from "@/types";
import { THEMES, DEFAULT_THEME } from "@/themes";

const WeddingContext = createContext<WeddingData | null>(null);

export function useWedding(): WeddingData {
  const ctx = useContext(WeddingContext);
  if (!ctx) throw new Error("useWedding must be used inside WeddingProvider");
  return ctx;
}

export function WeddingProvider({
  data,
  children,
}: {
  data: WeddingData;
  children: React.ReactNode;
}) {
  const theme = THEMES[data.theme] ?? DEFAULT_THEME;
  // CSS 변수를 wrapper div에 설정 → 자식 컴포넌트에서 var(--color-*) 로 참조
  const styleVars = theme.vars as React.CSSProperties;

  return (
    <WeddingContext.Provider value={data}>
      <div style={styleVars}>{children}</div>
    </WeddingContext.Provider>
  );
}

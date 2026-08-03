import type { WeddingData } from "@/types";
import { WEDDING } from "@/content";

// slug → 청첩장 데이터 매핑
// 실제 고객 데이터는 여기에 추가하거나 DB/CMS에서 fetch
export const INVITES: Record<string, WeddingData> = {
  // 기본 샘플
  sample: WEDDING,

  // ── 템플릿 데모 (클라이언트에게 보여주는 디자인 시안) ──────────────────
  "demo-classic":   { ...WEDDING, slug: "demo-classic",   template: "classic",   theme: "classic-cream" },
  "demo-editorial": { ...WEDDING, slug: "demo-editorial", template: "editorial", theme: "classic-cream" },
  "demo-minimal":   { ...WEDDING, slug: "demo-minimal",   template: "minimal",   theme: "classic-cream" },
  "demo-romantic":  { ...WEDDING, slug: "demo-romantic",  template: "romantic",  theme: "classic-cream" },

  // ── 테마 데모 (같은 레이아웃, 다른 컬러) ───────────────────────────────
  "demo-minimal-white":   { ...WEDDING, slug: "demo-minimal-white",   template: "classic", theme: "minimal-white" },
  "demo-dark-romance":    { ...WEDDING, slug: "demo-dark-romance",    template: "classic", theme: "dark-romance" },
  "demo-garden-floral":   { ...WEDDING, slug: "demo-garden-floral",   template: "classic", theme: "garden-floral" },
  "demo-film-vintage":    { ...WEDDING, slug: "demo-film-vintage",    template: "classic", theme: "film-vintage" },
  "demo-modern-bold":     { ...WEDDING, slug: "demo-modern-bold",     template: "classic", theme: "modern-bold" },
  "demo-blush-romantic":  { ...WEDDING, slug: "demo-blush-romantic",  template: "classic", theme: "blush-romantic" },
  "demo-ocean-blue":      { ...WEDDING, slug: "demo-ocean-blue",      template: "classic", theme: "ocean-blue" },
};

export function getInvite(slug: string): WeddingData | null {
  return INVITES[slug] ?? null;
}

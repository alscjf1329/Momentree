import type { WeddingData } from "@/types";
import { WEDDING } from "@/content";

// slug → 청첩장 데이터 매핑
// 실제 고객 데이터는 여기에 추가하거나 DB/CMS에서 fetch
export const INVITES: Record<string, WeddingData> = {
  sample: WEDDING,
  "demo-minimal-white": { ...WEDDING, slug: "demo-minimal-white", theme: "minimal-white" },
  "demo-dark-romance": { ...WEDDING, slug: "demo-dark-romance", theme: "dark-romance" },
  "demo-garden-floral": { ...WEDDING, slug: "demo-garden-floral", theme: "garden-floral" },
  "demo-film-vintage": { ...WEDDING, slug: "demo-film-vintage", theme: "film-vintage" },
  "demo-modern-bold": { ...WEDDING, slug: "demo-modern-bold", theme: "modern-bold" },
  "demo-blush-romantic": { ...WEDDING, slug: "demo-blush-romantic", theme: "blush-romantic" },
  "demo-ocean-blue": { ...WEDDING, slug: "demo-ocean-blue", theme: "ocean-blue" },
};

export function getInvite(slug: string): WeddingData | null {
  return INVITES[slug] ?? null;
}

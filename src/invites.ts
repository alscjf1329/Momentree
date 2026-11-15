import type { WeddingData } from "@/types";
import { EXAMPLE } from "@/example";

// slug → 청첩장 데이터 매핑. 데모는 모두 EXAMPLE에서 템플릿·테마만 바꾼 것이다.
const demo = (slug: string, template: string, theme = "classic-cream"): WeddingData => ({ ...EXAMPLE, slug, template, theme });

export const INVITES: Record<string, WeddingData> = {
  example: EXAMPLE,
  sample: demo("sample", "mono"), // 예전 링크용

  // 템플릿 데모
  "demo-classic": demo("demo-classic", "mono"),
  "demo-editorial": demo("demo-editorial", "editorial"),
  "demo-minimal": demo("demo-minimal", "minimal"),
  "demo-romantic": demo("demo-romantic", "romantic"),
  "demo-twilight": demo("demo-twilight", "twilight"),
  "demo-blossom": demo("demo-blossom", "blossom"),
  "demo-modern": demo("demo-modern", "modern"),
  "demo-luxury": demo("demo-luxury", "luxury"),
  "demo-garden": demo("demo-garden", "garden"),
  "demo-mono": demo("demo-mono", "mono"),

  // 테마 데모 (같은 레이아웃, 다른 컬러)
  "demo-minimal-white": demo("demo-minimal-white", "mono", "minimal-white"),
  "demo-dark-romance": demo("demo-dark-romance", "mono", "dark-romance"),
  "demo-garden-floral": demo("demo-garden-floral", "mono", "garden-floral"),
  "demo-film-vintage": demo("demo-film-vintage", "mono", "film-vintage"),
  "demo-modern-bold": demo("demo-modern-bold", "mono", "modern-bold"),
  "demo-blush-romantic": demo("demo-blush-romantic", "mono", "blush-romantic"),
  "demo-ocean-blue": demo("demo-ocean-blue", "mono", "ocean-blue"),
};

export function getInvite(slug: string): WeddingData | null {
  return INVITES[slug] ?? null;
}

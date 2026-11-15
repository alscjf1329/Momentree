export interface Theme {
  id: string;
  name: string;
  nameKr: string;
  vars: Record<string, string>;
}

export const THEMES: Record<string, Theme> = {
  "classic-cream": {
    id: "classic-cream",
    name: "Classic Cream",
    nameKr: "클래식 크림",
    vars: {
      "--color-primary": "#8b6f5e",
      "--color-primary-light": "#c4a898",
      "--color-primary-dark": "#5c4035",
      "--color-accent": "#d4b896",
      "--color-gold": "#c9a96e",
      "--color-cream": "#ffffff",
      "--color-warm-gray": "#9e8e84",
      "--color-text": "#3d2e28",
      "--color-text-light": "#7a6358",
    },
  },
  "minimal-white": {
    id: "minimal-white",
    name: "Minimal White",
    nameKr: "미니멀 화이트",
    vars: {
      "--color-primary": "#9b8c96",
      "--color-primary-light": "#cfc4cb",
      "--color-primary-dark": "#6b5c66",
      "--color-accent": "#ede6ea",
      "--color-gold": "#c4a882",
      "--color-cream": "#f8f5f7",
      "--color-warm-gray": "#a89ea4",
      "--color-text": "#2c2430",
      "--color-text-light": "#7a6e76",
    },
  },
  "dark-romance": {
    id: "dark-romance",
    name: "Dark Romance",
    nameKr: "다크 로맨스",
    vars: {
      "--color-primary": "#c9a96e",
      "--color-primary-light": "#e0c99a",
      "--color-primary-dark": "#a8873e",
      "--color-accent": "#3a2e1e",
      "--color-gold": "#e8d090",
      "--color-cream": "#1e1810",
      "--color-warm-gray": "#8a7a6a",
      "--color-text": "#f0e8d8",
      "--color-text-light": "#c8b89a",
    },
  },
  "garden-floral": {
    id: "garden-floral",
    name: "Garden Floral",
    nameKr: "가든 플로럴",
    vars: {
      "--color-primary": "#7d9b76",
      "--color-primary-light": "#afc4aa",
      "--color-primary-dark": "#526850",
      "--color-accent": "#dde8da",
      "--color-gold": "#c0a86e",
      "--color-cream": "#f2f5ee",
      "--color-warm-gray": "#8a9884",
      "--color-text": "#2e3b2a",
      "--color-text-light": "#677a60",
    },
  },
  "film-vintage": {
    id: "film-vintage",
    name: "Film Vintage",
    nameKr: "필름 빈티지",
    vars: {
      "--color-primary": "#8b6845",
      "--color-primary-light": "#c4a07a",
      "--color-primary-dark": "#5c4020",
      "--color-accent": "#e8d8bc",
      "--color-gold": "#b89058",
      "--color-cream": "#f5ead8",
      "--color-warm-gray": "#9e8870",
      "--color-text": "#2e2010",
      "--color-text-light": "#7a6040",
    },
  },
  "modern-bold": {
    id: "modern-bold",
    name: "Modern Bold",
    nameKr: "모던 볼드",
    vars: {
      "--color-primary": "#1a1a2e",
      "--color-primary-light": "#4a4a6a",
      "--color-primary-dark": "#0a0a18",
      "--color-accent": "#e4e4f0",
      "--color-gold": "#e8c060",
      "--color-cream": "#f4f4f8",
      "--color-warm-gray": "#7a7a8a",
      "--color-text": "#0e0e18",
      "--color-text-light": "#5a5a70",
    },
  },
  "blush-romantic": {
    id: "blush-romantic",
    name: "Blush Romantic",
    nameKr: "블러시 로맨틱",
    vars: {
      "--color-primary": "#c87a6e",
      "--color-primary-light": "#e4ada5",
      "--color-primary-dark": "#a0524a",
      "--color-accent": "#f2e4e1",
      "--color-gold": "#d4a46e",
      "--color-cream": "#fdf0ed",
      "--color-warm-gray": "#b08a84",
      "--color-text": "#3d2020",
      "--color-text-light": "#8a5a54",
    },
  },
  "ocean-blue": {
    id: "ocean-blue",
    name: "Ocean Blue",
    nameKr: "오션 블루",
    vars: {
      "--color-primary": "#4a7fa0",
      "--color-primary-light": "#7aaec0",
      "--color-primary-dark": "#2a5070",
      "--color-accent": "#d0e8f0",
      "--color-gold": "#b4a06e",
      "--color-cream": "#eef4f8",
      "--color-warm-gray": "#7a90a0",
      "--color-text": "#1a3040",
      "--color-text-light": "#506070",
    },
  },
};

export const DEFAULT_THEME = THEMES["classic-cream"];

// 고객이 고르는 색상(팔레트). ""(고르지 않음)은 템플릿 기본색. 배경·글자 대비를 맞춰 둔 밝은 톤 5종(배경색까지 함께 바뀜).
export const PALETTES: Record<string, { name: string; swatch: [string, string]; vars: Record<string, string> }> = {
  "": { name: "기본", swatch: ["#1c1c1a", "#ece9e3"], vars: {} },
  beige: {
    name: "웜 베이지", swatch: ["#7a5c45", "#f7f1e8"],
    vars: { "--color-primary": "#7a5c45", "--color-primary-light": "#b49a86", "--color-primary-dark": "#4d3727", "--color-accent": "#e6d8c6", "--color-gold": "#c2a06b", "--color-cream": "#f7f1e8", "--color-warm-gray": "#a39385", "--color-text": "#3b2c22", "--section-alt": "#e9dccb", "--color-text-light": "#7d6a5c" },
  },
  rose: {
    name: "더스티 로즈", swatch: ["#a24a62", "#fbeff1"],
    vars: { "--color-primary": "#a24a62", "--color-primary-light": "#d49aaa", "--color-primary-dark": "#6e2a3d", "--color-accent": "#efd3da", "--color-gold": "#c4a079", "--color-cream": "#fbeff1", "--color-warm-gray": "#ad9aa0", "--color-text": "#3a2229", "--section-alt": "#f0d6dc", "--color-text-light": "#85666e" },
  },
  sage: {
    name: "세이지", swatch: ["#5d7352", "#eff3ea"],
    vars: { "--color-primary": "#5d7352", "--color-primary-light": "#a3b596", "--color-primary-dark": "#3a4d31", "--color-accent": "#d6e0cc", "--color-gold": "#b39a5f", "--color-cream": "#eff3ea", "--color-warm-gray": "#98a08c", "--color-text": "#26301f", "--section-alt": "#dce5d3", "--color-text-light": "#667060" },
  },
  blue: {
    name: "스모키 블루", swatch: ["#4a6275", "#edf2f6"],
    vars: { "--color-primary": "#4a6275", "--color-primary-light": "#93a8b8", "--color-primary-dark": "#2b3d4d", "--color-accent": "#d3e0ea", "--color-gold": "#b09f75", "--color-cream": "#edf2f6", "--color-warm-gray": "#8a99a5", "--color-text": "#1d2a35", "--section-alt": "#d8e3ec", "--color-text-light": "#5f7080" },
  },
};

// ── 고객이 직접 고르는 색: 배경·글자·포인트 3가지에서 나머지 변수를 계산한다 ──
export interface CustomColors { bg: string; text: string; point: string }
const HEX = /^#[0-9a-f]{6}$/i;
const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const hex = (c: number[]) => "#" + c.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
const mix = (a: string, b: string, t: number) => { const y = rgb(b); return hex(rgb(a).map((v, i) => v + (y[i] - v) * t)); }; // a 에서 b 쪽으로 t
const lum = (h: string) => { const [r, g, b] = rgb(h).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export const contrast = (a: string, b: string) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

// 읽기 어려운 조합은 자동으로 고친다: 배경은 밝게(공용 부품이 밝은 배경 기준), 글자·포인트는 배경과 대비 4.5 이상
export function customPaletteVars(c: Partial<CustomColors> | undefined): Record<string, string> | null {
  if (!c || !HEX.test(c.bg ?? "") || !HEX.test(c.text ?? "") || !HEX.test(c.point ?? "")) return null;
  let bg = c.bg!.toLowerCase();
  for (let i = 0; i < 30 && lum(bg) < 0.55; i++) bg = mix(bg, "#ffffff", 0.1);
  const text = contrast(c.text!, bg) >= 4.5 ? c.text!.toLowerCase() : "#1c1c1a";
  let point = c.point!.toLowerCase();
  for (let i = 0; i < 30 && contrast(point, bg) < 4.5; i++) point = mix(point, "#000000", 0.1);
  return {
    "--color-primary": point, "--color-primary-dark": mix(point, "#000000", 0.35), "--color-primary-light": mix(point, bg, 0.55),
    "--color-accent": mix(bg, point, 0.18), "--section-alt": mix(bg, point, 0.12), "--color-gold": mix(point, bg, 0.2),
    "--color-cream": bg, "--color-text": text, "--color-text-light": mix(text, bg, 0.35), "--color-warm-gray": mix(text, bg, 0.5),
  };
}

/** 고른 팔레트("custom" 이면 직접 고른 색) → CSS 변수. 없으면 템플릿 기본색 */
export function paletteVars(palette: string | undefined, custom: Partial<CustomColors> | undefined): Record<string, string> {
  return (palette === "custom" ? customPaletteVars(custom) : PALETTES[palette ?? ""]?.vars) ?? {};
}

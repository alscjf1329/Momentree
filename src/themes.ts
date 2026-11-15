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

// 고객이 고르는 색상(팔레트). ""(고르지 않음)은 템플릿 기본색. 글자·배경 대비를 맞춰 둔 밝은 배경 5종.
export const PALETTES: Record<string, { name: string; swatch: [string, string]; vars: Record<string, string> }> = {
  "": { name: "기본", swatch: ["#1c1c1a", "#ece9e3"], vars: {} },
  beige: {
    name: "웜 베이지", swatch: ["#7a5c45", "#efe5da"],
    vars: { "--color-primary": "#7a5c45", "--color-primary-light": "#b49a86", "--color-primary-dark": "#4d3727", "--color-accent": "#efe5da", "--color-gold": "#c2a06b", "--color-cream": "#fffdfa", "--color-warm-gray": "#a39385", "--color-text": "#3b2c22", "--color-text-light": "#7d6a5c" },
  },
  rose: {
    name: "더스티 로즈", swatch: ["#a24a62", "#f6e3e8"],
    vars: { "--color-primary": "#a24a62", "--color-primary-light": "#d49aaa", "--color-primary-dark": "#6e2a3d", "--color-accent": "#f6e3e8", "--color-gold": "#c4a079", "--color-cream": "#fffdfd", "--color-warm-gray": "#ad9aa0", "--color-text": "#3a2229", "--color-text-light": "#85666e" },
  },
  sage: {
    name: "세이지", swatch: ["#5d7352", "#e9eee4"],
    vars: { "--color-primary": "#5d7352", "--color-primary-light": "#a3b596", "--color-primary-dark": "#3a4d31", "--color-accent": "#e9eee4", "--color-gold": "#b39a5f", "--color-cream": "#fcfdfa", "--color-warm-gray": "#98a08c", "--color-text": "#26301f", "--color-text-light": "#667060" },
  },
  blue: {
    name: "스모키 블루", swatch: ["#4a6275", "#e4ebf0"],
    vars: { "--color-primary": "#4a6275", "--color-primary-light": "#93a8b8", "--color-primary-dark": "#2b3d4d", "--color-accent": "#e4ebf0", "--color-gold": "#b09f75", "--color-cream": "#fcfdfe", "--color-warm-gray": "#8a99a5", "--color-text": "#1d2a35", "--color-text-light": "#5f7080" },
  },
};

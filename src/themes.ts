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
      "--color-cream": "#faf6f1",
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

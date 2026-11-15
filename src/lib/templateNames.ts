// 템플릿 id → 화면에 보이는 이름 (고객 목록·템플릿 선택 화면 공용)
export const TEMPLATE_NAMES: Record<string, string> = { mono: "모노" };
// 처음 보여줄 추천 템플릿 (나머지는 "더 보기")
export const RECOMMENDED_TEMPLATES = ["mono"];

// 요약 카드 썸네일 색 (템플릿 대표색)
export const TEMPLATE_TINT: Record<string, { bg: string; fg: string }> = { mono: { bg: "#DADADA", fg: "#111111" } };

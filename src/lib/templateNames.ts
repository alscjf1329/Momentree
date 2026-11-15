// 템플릿 id → 화면에 보이는 이름 (고객 목록·템플릿 선택 화면 공용)
export const TEMPLATE_NAMES: Record<string, string> = {
  mono: "모노", minimal: "미니멀", romantic: "로맨틱", editorial: "에디토리얼", twilight: "트와이라잇",
  blossom: "블로섬", modern: "모던", luxury: "럭셔리", garden: "가든",
};
// 처음 보여줄 추천 템플릿 (나머지는 "더 보기")
export const RECOMMENDED_TEMPLATES = ["mono", "minimal", "romantic"];

// 요약 카드 썸네일 색 (템플릿 대표색)
export const TEMPLATE_TINT: Record<string, { bg: string; fg: string }> = {
  editorial: { bg: "#0d0d0d", fg: "#f2ede8" }, minimal: { bg: "#F4F4F4", fg: "#111111" },
  romantic: { bg: "#F6DDE3", fg: "#3d1f28" }, twilight: { bg: "#0e1230", fg: "#dde2f0" }, blossom: { bg: "#F8E4EC", fg: "#3a2030" },
  modern: { bg: "#E8D8C8", fg: "#2d1e12" }, luxury: { bg: "#0e1628", fg: "#f0ece4" }, garden: { bg: "#DCE6D3", fg: "#2c3226" }, mono: { bg: "#DADADA", fg: "#111111" },
};

// 템플릿 id → 화면에 보이는 이름 (고객 목록·템플릿 선택 화면 공용)
export const TEMPLATE_NAMES: Record<string, string> = {
  classic: "클래식", editorial: "에디토리얼", minimal: "미니멀", romantic: "로맨틱", twilight: "트와이라잇",
  blossom: "블로섬", modern: "모던", luxury: "럭셔리", garden: "가든", mono: "모노",
};
// 처음 보여줄 추천 템플릿 (나머지는 "더 보기")
export const RECOMMENDED_TEMPLATES = ["classic", "minimal", "romantic"];

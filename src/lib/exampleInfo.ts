// 랜딩 예시 고객 — 서버·클라이언트 공용 상수와 링크 규칙 (DB를 import하지 않는다)
export const EXAMPLE_FILE = "example"; // 고객 파일 ID이자 공유 ID
export const EXAMPLE_AI_NOTE = "AI 생성 이미지";

// 예시 고객이 DB에 있으면 같은 고객 데이터를 템플릿만 바꿔 보여 주고, 없으면 정적 demo 슬러그로 대체
export const exampleHref = (template: string, live: boolean): string =>
  live ? `/invite/${template}?id=${EXAMPLE_FILE}` : `/invite/demo-${template}`;

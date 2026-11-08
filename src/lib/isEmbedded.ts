// iframe 안(랜딩 데모·관리자 미리보기)에서 열렸는지 — 이때는 첫 화면을 가리는 팝업을 띄우지 않는다
export const isEmbedded = () => typeof window !== "undefined" && window.self !== window.top;

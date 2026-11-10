// localStorage 키 — 서버에 기록 컬럼이 없어 브라우저 단위로만 기억한다.
// 한계: 다른 기기·브라우저·시크릿 창에서는 기록이 없는 것으로 보인다 (기능에는 영향 없음).
export const tplPickedKey = (file: string) => `momentree_tpl_picked:${file}`;
export const sharedKey = (file: string) => `momentree_shared:${file}`;

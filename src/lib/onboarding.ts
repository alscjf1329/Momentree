import type { WeddingData } from "@/types";

export interface OnboardingStep { id: "info" | "photos" | "template" | "share"; label: string; done: boolean }

// localStorage 키 — 서버에 기록 컬럼이 없어 브라우저 단위로만 기억한다.
// 한계: 다른 기기·브라우저·시크릿 창에서는 '미완료'로 보인다 (체크리스트가 다시 나올 뿐 기능에는 영향 없음).
export const tplPickedKey = (file: string) => `momentree_tpl_picked:${file}`;
export const sharedKey = (file: string) => `momentree_shared:${file}`;

const filled = (s?: string) => !!s?.trim();

// 온보딩 4단계 완료 여부 계산 (순수 함수).
// - info: 신랑·신부 이름 + 예식 일시 + 장소명. 날짜는 새 고객에 기본값이 채워져 있어 사실상 이름·장소가 판정 기준.
// - template: 기본값(classic)이 아니거나, 템플릿 화면에서 직접 고른 기록이 있을 때. classic 을 직접 골라도 기록이 없는 기기에선 알 수 없다.
export function computeOnboarding(
  data: WeddingData,
  flags: { templatePicked: boolean; shared: boolean },
): { steps: OnboardingStep[]; doneCount: number; allDone: boolean } {
  const steps: OnboardingStep[] = [
    { id: "info", label: "이름 · 일시 · 장소 입력", done: filled(data.groom?.name) && filled(data.bride?.name) && filled(data.date?.iso) && filled(data.venue?.name) },
    { id: "photos", label: "대표 사진 · 갤러리 올리기", done: filled(data.introBg) || (data.gallery ?? []).some((g) => filled(g?.src)) },
    { id: "template", label: "템플릿 고르기", done: flags.templatePicked || data.template !== "classic" },
    { id: "share", label: "링크 공유하기", done: flags.shared },
  ];
  const doneCount = steps.filter((s) => s.done).length;
  return { steps, doneCount, allDone: doneCount === steps.length };
}

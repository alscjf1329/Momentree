import { getByPath, type SectionSchema, type TemplateSchema } from "@/lib/schema";

// 고객 정보 설정 위저드(6단계). 스키마의 섹션·항목을 단계에 나눠 담는 순수 함수 모음.
export const STEP_TITLES = ["신랑 · 신부", "예식 일시 · 장소", "인사말", "사진", "축의금 계좌", "추가 안내"] as const;
export const LAST_STEP = STEP_TITLES.length;

const PHOTO = ["introBg", "envelopeClosed", "envelopeOpen", "gallery"];
const ACCOUNT = ["groom.accounts", "bride.accounts"];
const BY_TITLE: Record<string, number> = {
  "신랑 정보": 1, "신부 정보": 1, "날짜 / 시간": 2, "장소": 2, "인사말": 3, "마음 전하실 곳 (계좌번호) 문구": 5,
};
// 항목이 다른 단계로 옮겨질 때 보여 줄 소제목
const RENAME: Record<string, string> = { "신랑 정보": "신랑측 계좌", "신부 정보": "신부측 계좌", "이미지 경로": "사진" };

/** 항목이 속한 단계(1~6). 어디에도 명시되지 않으면 6단계 */
export function stepOf(sectionTitle: string, fieldKey: string): number {
  if (PHOTO.includes(fieldKey)) return 4;
  if (ACCOUNT.includes(fieldKey)) return 5;
  return BY_TITLE[sectionTitle] ?? LAST_STEP;
}

export interface WizardStep { n: number; title: string; sections: SectionSchema[] }

/** 템플릿 스키마 → 항목이 있는 단계만 (n 은 원래 단계 번호 1~6) */
export function buildSteps(schema: TemplateSchema): WizardStep[] {
  return STEP_TITLES.map((title, i) => {
    const n = i + 1;
    const sections: SectionSchema[] = [];
    for (const s of schema.sections) {
      const fields = s.fields.filter((f) => stepOf(s.title, f.key) === n);
      if (fields.length === 0) continue;
      const moved = n !== BY_TITLE[s.title] && (n === 4 || n === 5) && RENAME[s.title];
      sections.push({ title: moved || s.title, fields });
    }
    return { n, title, sections };
  }).filter((st) => st.sections.length > 0);
}

export const isEmpty = (v: unknown) => v == null || (typeof v === "string" && !v.trim()) || (Array.isArray(v) && v.every((x) => !String(x ?? "").trim()));

/** 단계에서 비어 있는 필수 항목 수 */
export function missingRequired(step: WizardStep, data: unknown): number {
  return step.sections.flatMap((s) => s.fields).filter((f) => f.required && isEmpty(getByPath(data, f.key))).length;
}

/** ?step=n(원래 번호) → steps 안의 위치. 없거나 숨겨진 단계면 그 뒤 첫 단계, 그것도 없으면 마지막 */
export function resolveIndex(steps: WizardStep[], n: number | null): number {
  if (!n || !Number.isFinite(n)) return 0;
  const i = steps.findIndex((s) => s.n >= n);
  return i < 0 ? steps.length - 1 : i;
}

/** 예전 view 링크(사진·계좌 하위 화면) → 단계 번호 */
export const stepForView = (view: string | null): number | null => (view === "photos" ? 4 : view === "accounts" ? 5 : null);

/** 이전/다음 위치 (범위 밖으로 나가지 않음) */
export const moveIndex = (i: number, dir: 1 | -1, len: number) => Math.min(Math.max(i + dir, 0), len - 1);

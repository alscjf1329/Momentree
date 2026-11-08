import { SERVICE_NAME } from "@/lib/brand";

// 플랜 구조 (MOM-10): 무료 / 유료(1회 결제, 구독 없음). 결제(PG)는 아직 없어 관리자가 수동으로 전환한다.
export type Plan = "free" | "paid";

// 가격 초안 — 확정 전. 공개 화면에는 숫자를 노출하지 않는다 ([확정 필요: 가격]).
export const PLAN_PRICE = 19900;

// 유료 유지 기간: 예식일 + 3개월. 만료 처리는 아직 구현하지 않음.
// 하객 데이터 보관(retention.ts: 예식일 후 6개월 비공개·12개월 삭제)이 더 길어서 충돌하지 않는다.
export const PAID_KEEP_MONTHS = 3;

// 무료로 쓸 수 있는 템플릿 (바꾸려면 여기만)
export const FREE_TEMPLATES = ["classic", "minimal", "romantic"];

export const PLAN_LIMITS = {
  free: { templates: FREE_TEMPLATES as string[] | null, photos: 5, rsvp: 30, watermark: true, members: false },
  paid: { templates: null, photos: Infinity, rsvp: Infinity, watermark: false, members: true },
} as const;

export const PLAN_LABEL: Record<Plan, string> = { free: "무료", paid: "유료" };

// 알 수 없는 값은 무료로 본다
export const planOf = (customer: { plan?: string | null } | null | undefined): Plan => (customer?.plan === "paid" ? "paid" : "free");
export const canUseTemplate = (plan: Plan, id: string): boolean => PLAN_LIMITS[plan].templates?.includes(id) ?? true;
export const photoLimit = (plan: Plan): number => PLAN_LIMITS[plan].photos;
export const rsvpLimit = (plan: Plan): number => PLAN_LIMITS[plan].rsvp;
export const hasWatermark = (plan: Plan): boolean => PLAN_LIMITS[plan].watermark;
export const canInviteMembers = (plan: Plan): boolean => PLAN_LIMITS[plan].members;

export const watermarkText = `${SERVICE_NAME}으로 만든 청첩장`;

// 서버 강제용 사용자 메시지
export const PLAN_MSG = {
  template: "이 템플릿은 유료 플랜에서 쓸 수 있어요. 업그레이드는 문의해 주세요.",
  photos: (n: number) => `무료 플랜에서는 사진을 ${n}장까지 올릴 수 있어요. 더 올리려면 유료로 업그레이드해 주세요.`,
  rsvp: "응답이 마감되었어요. 신랑·신부에게 문의해 주세요.",
  members: "함께 편집은 유료 플랜에서 쓸 수 있어요. 업그레이드는 문의해 주세요.",
};

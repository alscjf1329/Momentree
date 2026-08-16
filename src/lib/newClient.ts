import type { WeddingData } from "@/types";

export const LAST_FILE_KEY = "momentree_last_file";

export const DEFAULT_WEDDING_DATA: WeddingData = {
  slug: "",
  template: "classic",
  theme: "classic-cream",
  groom: { name: "", nameFull: "", fatherName: "", motherName: "",
    accounts: [{ name: "", bank: "", number: "", holder: "" }] },
  bride: { name: "", nameFull: "", fatherName: "", motherName: "",
    accounts: [{ name: "", bank: "", number: "", holder: "" }] },
  date: { year: 2025, month: 10, day: 18, dayOfWeek: "토요일", time: "오후 2시 30분", iso: "2025-10-18" },
  venue: { name: "", hall: "", address: "", addressShort: "", kakaoMapUrl: "", naverMapUrl: "", lat: 0, lng: 0 },
  mainTitle: "",
  subInfo: [""],
  greeting: ["서로가 마주보며 다져온 사랑을", "이제 함께 걸어갈 큰 사랑으로 키우고자 합니다.", "", "오시는 모든 분들을 환영합니다."],
  rsvpMessage: ["참석에 부담 가지지 말아주시고,", "편하게 알려주세요.", "저희의 정성을 다하는 준비에 도움이 될 것 같아", "참석 여부를 알려주시면 감사하겠습니다."],
  rsvpNotice: "",
  rsvpDeadlineText: "",
  info: [{ title: "", content: "" }],
  flowerNotice: "",
  shuttleTimetable: { from: [""], to: [""] },
  directionsFromSeoul: [{ route: "", steps: [""] }],
  bgm: { title: "", src: "" },
  gallery: [
    { src: "/images/gallery-1.jpg", alt: "" },
    { src: "/images/gallery-2.jpg", alt: "" },
    { src: "/images/gallery-3.jpg", alt: "" },
    { src: "/images/gallery-4.jpg", alt: "" },
    { src: "/images/gallery-5.jpg", alt: "" },
  ],
  introBg: "/images/intro-bg.jpg",
  envelopeClosed: "/images/envelope-closed.jpg",
  envelopeOpen: "/images/envelope-open.jpg",
};

export function generateFilename(): string {
  return `client-${Date.now().toString(36)}`;
}

// 파일명으로 안전한지(경로 순회 문자 없는지) 확인 — 관리자 슬러그와 고객 이메일 파일명 공통 검증
export function isValidClientFilename(name: string): boolean {
  return /^[a-zA-Z0-9.@_+-]+$/.test(name);
}

// 이메일 형식 + 파일명으로 안전한지 동시 검증 (로그인 이메일 → 파일명으로 쓰일 때)
export function isValidLoginEmail(email: string): boolean {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
}

export function namesToSlug(groom: string, bride: string): string {
  const clean = (s: string) => s.trim().replace(/\s/g, "").replace(/[^a-z0-9가-힣]/gi, "");
  const g = clean(groom);
  const b = clean(bride);
  if (!g || !b) return generateFilename();
  const toSlug = (s: string) =>
    /[가-힣]/.test(s) ? (s.codePointAt(0)! - 0xac00).toString(36) : s.toLowerCase().slice(0, 8);
  return `${toSlug(g)}-${toSlug(b)}`;
}

import type { WeddingData } from "@/types";

// 클라이언트 요청으로 텍스트/이미지 변경 시 이 파일만 수정하면 됩니다

export const WEDDING: WeddingData = {
  slug: "sample",
  theme: "classic-cream",
  groom: {
    name: "김민준",
    nameFull: "김 민 준",
    fatherName: "김철수",
    motherName: "이영희",
    phone: "010-1234-5678",
    account: {
      bank: "카카오뱅크",
      number: "3333-01-1234567",
      holder: "김민준",
    },
  },
  bride: {
    name: "이서연",
    nameFull: "이 서 연",
    fatherName: "이대호",
    motherName: "박민정",
    phone: "010-8765-4321",
    account: {
      bank: "신한은행",
      number: "110-123-456789",
      holder: "이서연",
    },
  },
  date: {
    year: 2025,
    month: 10,
    day: 18,
    dayOfWeek: "토요일",
    time: "오후 2시 30분",
    // ISO 형식 (D-Day 계산용)
    iso: "2025-10-18",
  },
  venue: {
    name: "그랜드 웨딩홀",
    hall: "로즈홀 3층",
    address: "서울특별시 강남구 테헤란로 123 그랜드빌딩",
    addressShort: "강남구 테헤란로 123",
    kakaoMapUrl: "https://map.kakao.com/?q=강남구+테헤란로+123",
    naverMapUrl: "https://map.naver.com/v5/search/강남구+테헤란로+123",
    lat: 37.4979,
    lng: 127.0276,
  },
  greeting: [
    "서로가 마주보며 다져온 사랑을",
    "이제 함께 걸어갈 큰 사랑으로 키우고자 합니다.",
    "",
    "오시는 모든 분들을 환영합니다.",
  ],
  // 갤러리 이미지 (public/images/ 에 넣어주세요)
  gallery: [
    { src: "/images/gallery-1.jpg", alt: "두 사람의 첫 번째 사진" },
    { src: "/images/gallery-2.jpg", alt: "두 사람의 두 번째 사진" },
    { src: "/images/gallery-3.jpg", alt: "두 사람의 세 번째 사진" },
    { src: "/images/gallery-4.jpg", alt: "두 사람의 네 번째 사진" },
    { src: "/images/gallery-5.jpg", alt: "두 사람의 다섯 번째 사진" },
  ],
  // 인트로 배경 이미지
  introBg: "/images/intro-bg.jpg",
  // 봉투 이미지 (스크롤 오프닝용)
  envelopeClosed: "/images/envelope-closed.jpg",
  envelopeOpen: "/images/envelope-open.jpg",
};

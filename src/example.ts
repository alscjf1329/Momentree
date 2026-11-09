import type { WeddingData } from "@/types";
import { WEDDING } from "@/content";

// 랜딩 예시용 청첩장 데이터 — 가상의 인물·장소·계좌. 실제 고객 데이터가 아니다.
export const EXAMPLE: WeddingData = {
  ...WEDDING,
  slug: "example",
  template: "classic",
  theme: "classic-cream",
  groom: {
    name: "한도윤", nameFull: "한 도 윤", fatherName: "한상우", motherName: "정미숙", relation: "장남",
    accounts: [{ name: "신랑 한도윤", bank: "예시은행", number: "000-00-000000", holder: "한도윤" }],
  },
  bride: {
    name: "윤하린", nameFull: "윤 하 린", fatherName: "윤재석", motherName: "오지현", relation: "차녀",
    accounts: [{ name: "신부 윤하린", bank: "예시은행", number: "000-00-000001", holder: "윤하린" }],
  },
  date: { year: 2027, month: 5, day: 22, dayOfWeek: "토요일", time: "오후 1시", iso: "2027-05-22" },
  venue: {
    name: "예시 웨딩홀",
    hall: "그레이스홀 2층",
    address: "서울특별시 중구 세종대로 110",
    addressShort: "중구 세종대로 110",
    kakaoMapUrl: "https://map.kakao.com/?q=서울특별시+중구+세종대로+110",
    naverMapUrl: "https://map.naver.com/v5/search/서울특별시+중구+세종대로+110",
    lat: 37.5663,
    lng: 126.9779,
  },
  mainTitle: "We're getting married",
  subInfo: ["한도윤 · 윤하린", "예시 웨딩홀", "2027.05.22"],
  greeting: [
    "서로의 하루에 가장 먼저 안부를 묻던 두 사람이",
    "이제 같은 길을 함께 걸으려 합니다.",
    "",
    "귀한 걸음으로 축복해 주시면 감사하겠습니다.",
  ],
  rsvpDeadlineText: "5월 10일까지 알려주시면 감사하겠습니다",
  info: [
    { title: "주차 안내", content: "건물 지하 주차장을 이용해 주세요.\n3시간 무료 주차가 지원됩니다." },
    { title: "식사 안내", content: "예식 후 2층 연회장에서 식사가 준비되어 있습니다." },
  ],
  shuttleInfo: "",
  directionsFromSeoul: [
    { route: "지하철", steps: ["1·2호선 시청역 3번 출구에서 도보 3분"] },
    { route: "버스", steps: ["시청앞 정류장 하차 후 도보 5분"] },
  ],
  // 대표 사진·배경은 기존 갤러리 사진을 함께 쓴다
  introBg: "/images/gallery-1.jpg",
};

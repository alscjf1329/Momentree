export interface AccountEntry {
  name: string;
  bank: string;
  number: string;
  holder: string;
}

export interface PersonInfo {
  name: string;
  nameFull: string;
  fatherName: string;
  motherName: string;
  accounts: AccountEntry[];
}

export interface WeddingData {
  slug: string;
  template: string;
  theme: string;
  groom: PersonInfo;
  bride: PersonInfo;
  date: {
    year: number;
    month: number;
    day: number;
    dayOfWeek: string;
    time: string;
    iso: string;
  };
  venue: {
    name: string;
    hall: string;
    address: string;
    addressShort: string;
    kakaoMapUrl: string;
    naverMapUrl: string;
    lat: number;
    lng: number;
  };
  // 히어로 메인 타이틀(큰 폰트)과 그 아래 보조 정보(작은 폰트, 이름/장소/날짜 등)
  mainTitle: string;
  subInfo: string[];
  greeting: string[];
  rsvpMessage: string[];
  // 가든 템플릿 첫 진입 참석여부 팝업이 뜨기까지 걸리는 시간(초). 비워두면 히어로
  // 애니메이션 길이에 맞춰 자동 계산됨
  rsvpPopupDelaySec?: string;
  // RSVP 폼 상단 안내 문구
  rsvpNotice: string;
  // RSVP 폼 하단 마감 안내 문구
  rsvpDeadlineText: string;
  info: { title: string; content: string }[];
  // 화환 안내 문구
  flowerNotice: string;
  // 셔틀버스 시간표
  shuttleTimetable: { from: string[]; to: string[] };
  // 서울에서 오시는 길 (경로별 안내)
  directionsFromSeoul: { route: string; steps: string[] }[];
  gallery: { src: string; alt: string }[];
  introBg: string;
  envelopeClosed: string;
  envelopeOpen: string;
  // 배경음악
  bgm: { title: string; src: string };
}

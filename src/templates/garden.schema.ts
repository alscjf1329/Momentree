import type { TemplateSchema } from "@/lib/schema";

// common: true  → "기본 정보" 탭, 9개 템플릿 공유 (excludeTemplates로 특정 템플릿만 제외 가능 —
//                 예: 봉투 이미지는 8개 템플릿엔 공용이지만 garden엔 봉투 UI가 없어서 제외)
// common 없음   → "garden 전용 옵션" 탭, garden에서만 편집 가능
export const gardenSchema: TemplateSchema = {
  name: "garden",
  sections: [
    {
      title: "히어로 문구",
      fields: [
        { key: "mainTitle", type: "textarea", label: "메인 타이틀 (큰 글씨, 줄바꿈 가능)", common: true, placeholder: "We're getting married" },
        { key: "subInfo", type: "array", label: "보조 정보 (작은 글씨, 줄바꿈 = 새 줄)", common: true },
      ],
    },
    {
      title: "신랑 정보",
      fields: [
        { key: "groom.name", type: "text", label: "이름", common: true, required: true, placeholder: "홍길동" },
        { key: "groom.nameFull", type: "text", label: "전체이름", common: true, placeholder: "홍 길 동" },
        { key: "groom.fatherName", type: "text", label: "부친", common: true },
        { key: "groom.motherName", type: "text", label: "모친", common: true },
        {
          key: "groom.accounts",
          type: "array-object",
          label: "계좌 목록",
          common: true,
          itemFields: [
            { key: "name", type: "text", label: "이름", placeholder: "예: 신랑 본인 / 신랑측 아버지" },
            { key: "bank", type: "text", label: "은행" },
            { key: "number", type: "encrypted-text", label: "계좌번호" },
            { key: "holder", type: "encrypted-text", label: "예금주" },
          ],
        },
      ],
    },
    {
      title: "신부 정보",
      fields: [
        { key: "bride.name", type: "text", label: "이름", common: true, required: true, placeholder: "김지수" },
        { key: "bride.nameFull", type: "text", label: "전체이름", common: true, placeholder: "김 지 수" },
        { key: "bride.fatherName", type: "text", label: "부친", common: true },
        { key: "bride.motherName", type: "text", label: "모친", common: true },
        {
          key: "bride.accounts",
          type: "array-object",
          label: "계좌 목록",
          common: true,
          itemFields: [
            { key: "name", type: "text", label: "이름", placeholder: "예: 신부 본인 / 신부측 어머니" },
            { key: "bank", type: "text", label: "은행" },
            { key: "number", type: "encrypted-text", label: "계좌번호" },
            { key: "holder", type: "encrypted-text", label: "예금주" },
          ],
        },
      ],
    },
    {
      title: "날짜 / 시간",
      fields: [{ key: "date", type: "datetime", label: "예식 일시", common: true }],
    },
    {
      title: "장소",
      fields: [
        { key: "venue.name", type: "text", label: "웨딩홀명", common: true },
        { key: "venue.hall", type: "text", label: "홀명", common: true },
        { key: "venue.address", type: "text", label: "주소", common: true },
        {
          key: "venue.kakaoMapUrl",
          type: "text",
          label: "카카오맵 URL",
          common: true,
          helpText: "카카오맵 앱/웹에서 장소 검색 → 공유 → 링크 복사해서 붙여넣으면 지도 미리보기에도 그대로 반영돼요",
        },
        { key: "venue.naverMapUrl", type: "text", label: "네이버맵 URL", common: true },
        { key: "shuttleTimetable.from", type: "array", label: "셔틀 시간표 — 가는 편", common: true },
        { key: "shuttleTimetable.to", type: "array", label: "셔틀 시간표 — 오는 편", common: true },
      ],
    },
    {
      title: "인사말",
      fields: [{ key: "greeting", type: "array", label: "인사말 (빈 줄 = 문단 구분)", common: true }],
    },
    {
      title: "참석여부 팝업 문구",
      fields: [
        { key: "rsvpMessage", type: "array", label: "가든 첫 진입 팝업 문구", common: true },
        {
          key: "rsvpPopupDelaySec",
          type: "text",
          label: "팝업 뜨는 시간 (초)",
          common: true,
          placeholder: "비워두면 자동 계산 (예: 3.5)",
          pattern: "^$|^[0-9]+(\\.[0-9]+)?$",
          errorMessage: "숫자만 입력하세요 (예: 3.5)",
        },
      ],
    },
    {
      title: "RSVP 폼 문구",
      fields: [
        { key: "rsvpNotice", type: "textarea", label: "상단 안내", common: true },
        { key: "rsvpDeadlineText", type: "text", label: "하단 마감 안내", common: true, placeholder: "10월 10일까지 알려주시면 감사하겠습니다" },
      ],
    },
    {
      title: "안내사항 (Information)",
      fields: [
        {
          key: "info",
          type: "array-object",
          label: "안내사항",
          common: true,
          helpText: "Location-Contact 사이, 한 장씩 스와이프로 표시",
          itemFields: [
            { key: "title", type: "text", label: "제목", placeholder: "예: 주차 안내" },
            { key: "content", type: "textarea", label: "내용" },
          ],
        },
      ],
    },
    {
      title: "화환 안내",
      fields: [{ key: "flowerNotice", type: "textarea", label: "화환 안내 문구", common: true }],
    },
    {
      title: "서울에서 오시는 길",
      fields: [
        {
          key: "directionsFromSeoul",
          type: "array-object",
          label: "경로별 안내",
          common: true,
          itemFields: [
            { key: "route", type: "text", label: "경로명", placeholder: "예: 청량리역 경로" },
            { key: "steps", type: "array", label: "단계별 안내 (줄바꿈 = 새 단계)" },
          ],
        },
      ],
    },
    {
      title: "배경음악",
      fields: [
        { key: "bgm.title", type: "text", label: "제목", common: true },
        { key: "bgm.src", type: "file", label: "파일 (mp3)", common: true, placeholder: "/audio/bgm.mp3" },
      ],
    },
    {
      title: "이미지 경로",
      fields: [
        { key: "introBg", type: "image", label: "인트로 배경", common: true },
        { key: "envelopeClosed", type: "image", label: "봉투 (닫힘)", excludeTemplates: ["garden"] },
        { key: "envelopeOpen", type: "image", label: "봉투 (열림)", excludeTemplates: ["garden"] },
        {
          key: "gallery",
          type: "array-object",
          label: "갤러리",
          common: true,
          itemFields: [
            { key: "src", type: "image", label: "경로" },
            { key: "alt", type: "text", label: "설명" },
          ],
        },
      ],
    },
  ],
};

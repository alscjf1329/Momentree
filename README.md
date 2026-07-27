# Momentree — 모바일 청첩장 웹사이트

모바일 우선 설계의 인터랙티브 웨딩 청첩장입니다.  
실제 봉투 사진을 스크롤로 여는 오프닝부터 갤러리·지도·RSVP까지 전 섹션이 애니메이션으로 구성됩니다.

---

## 기술 스택

| 역할 | 라이브러리 |
|---|---|
| 프레임워크 | Next.js 16 (App Router) |
| 스타일 | Tailwind CSS v4 |
| 컴포넌트 애니메이션 | Framer Motion |
| 스크롤 인터랙션 | GSAP + ScrollTrigger |
| 이미지 최적화 | next/image |

---

## 시작하기

```bash
npm install
npm run dev
```

`http://localhost:3000` 에서 확인

---

## 클라이언트 커스터마이징

**코드를 건드리지 않고** 아래 두 파일만 수정하면 됩니다.

### 1. 텍스트 / 날짜 / 계좌번호 → `src/content.ts`

```ts
export const WEDDING = {
  groom: {
    name: "신랑 이름",
    nameFull: "신 랑 이 름",       // 인트로 스페이싱용
    fatherName: "부친 이름",
    motherName: "모친 이름",
    phone: "010-0000-0000",
    account: {
      bank: "은행명",
      number: "계좌번호",
      holder: "예금주",
    },
  },
  bride: { /* 동일 구조 */ },
  date: {
    year: 2025,
    month: 10,
    day: 18,
    dayOfWeek: "토요일",
    time: "오후 2시 30분",
    iso: "2025-10-18",            // D-Day 계산용 (ISO 형식 유지)
  },
  venue: {
    name: "웨딩홀 이름",
    hall: "홀 이름",
    address: "전체 주소",
    kakaoMapUrl: "카카오맵 URL",
    naverMapUrl: "네이버맵 URL",
    lat: 37.0000,                  // 지도 핀 좌표
    lng: 127.0000,
  },
  greeting: [
    "인사말 첫 번째 줄",
    "인사말 두 번째 줄",
  ],
};
```

### 2. 이미지 → `public/images/` 폴더

| 파일명 | 용도 | 권장 비율 |
|---|---|---|
| `envelope-closed.jpg` | 봉투 닫힌 상태 (스크롤 오프닝) | 9:16 세로 |
| `envelope-open.jpg` | 봉투 열린 상태 (스크롤 오프닝) | 9:16 세로 |
| `intro-bg.jpg` | 인트로 섹션 배경 | 9:16 세로 |
| `gallery-1.jpg` ~ `gallery-5.jpg` | 갤러리 슬라이드 | 9:16 세로 |

> 봉투 사진 촬영 팁: 같은 자리·각도에서 닫힌 것과 뚜껑 90° 이상 젖힌 것 2장 촬영

---

## 컬러 테마 변경

`src/app/globals.css` 의 `:root` 변수만 바꾸면 전 섹션 색상이 바뀝니다.

```css
:root {
  --color-primary:       #8b6f5e;   /* 주 포인트 색 */
  --color-primary-light: #c4a898;
  --color-primary-dark:  #5c4035;
  --color-accent:        #d4b896;
  --color-gold:          #c9a96e;   /* 구분선·씰 색 */
  --color-cream:         #faf6f1;   /* 배경 */
  --color-text:          #3d2e28;
  --color-text-light:    #7a6358;
}
```

---

## 섹션 구성

| 순서 | 섹션 | 파일 | 주요 기술 |
|---|---|---|---|
| 1 | 봉투 오프닝 | `components/EnvelopeScrollSection.tsx` | GSAP pin + scrub, 실사진 크로스페이드 |
| 2 | 인트로 | `components/sections/IntroSection.tsx` | Ken Burns 효과, Framer Motion 페이드인 |
| 3 | 인사말 | `components/sections/GreetingSection.tsx` | Framer Motion whileInView 줄별 등장 |
| 4 | 캘린더 | `components/sections/CalendarSection.tsx` | 달력 렌더링, D-Day 카운터 |
| 5 | 갤러리 | `components/sections/GallerySection.tsx` | GSAP pin + scrub 이미지 전환 |
| 6 | 오시는 길 | `components/sections/LocationSection.tsx` | 카카오맵 임베드, 주소 복사 |
| 7 | 연락처 / 계좌 | `components/sections/ContactSection.tsx` | 신랑·신부 탭, 계좌번호 복사 |
| 8 | RSVP | `components/sections/RSVPSection.tsx` | 참석 여부 폼 |

---

## 프로젝트 구조

```
src/
├── content.ts                  ← 모든 텍스트·이미지 경로 (여기만 수정)
├── app/
│   ├── layout.tsx              ← 메타데이터, 구글 폰트
│   ├── page.tsx                ← 섹션 조합
│   └── globals.css             ← CSS 변수 컬러 테마, Tailwind
└── components/
    ├── EnvelopeScrollSection.tsx
    └── sections/
        ├── IntroSection.tsx
        ├── GreetingSection.tsx
        ├── CalendarSection.tsx
        ├── GallerySection.tsx
        ├── LocationSection.tsx
        ├── ContactSection.tsx
        └── RSVPSection.tsx

public/
└── images/                     ← 이미지 파일 여기에
```

---

## 향후 확장 계획

- **멀티테넌트**: `/invite/[slug]` 동적 라우트로 커플마다 개별 청첩장 URL 제공
- **AI 커스터마이징**: 채팅으로 텍스트·컬러 실시간 수정
- **RSVP 연동**: DB 또는 Google Sheets API 연결
- **방명록**: 실시간 메시지 (Firebase / Supabase)

---

## 배포

Vercel 원클릭 배포 권장

```bash
npm run build   # 로컬 빌드 확인
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

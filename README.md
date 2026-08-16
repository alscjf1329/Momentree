# Momentree — 모바일 청첩장 플랫폼

모바일 우선 설계의 인터랙티브 웨딩 청첩장 **멀티테넌트 SaaS**입니다.
관리자가 고객(커플)마다 청첩장을 만들어주거나, 고객이 직접 로그인해 자신의 청첩장과 하객 현황을 관리할 수 있습니다.

---

## 기술 스택

| 역할 | 라이브러리 |
|---|---|
| 프레임워크 | Next.js 16 (App Router, Turbopack) |
| 스타일 | Tailwind CSS v4 |
| 컴포넌트 애니메이션 | Framer Motion |
| 스크롤 인터랙션 | GSAP + ScrollTrigger |
| 이미지 최적화 | next/image |
| 인증 | 이메일 OTP (Nodemailer/Gmail) + HMAC 서명 세션 쿠키 |
| 데이터 저장 | 파일시스템 JSON (`data/`) |

---

## 시작하기

```bash
npm install
cp .env.example .env.local   # 값 채우기 — 아래 "환경 변수" 참고
npm run dev
```

`http://localhost:3000` 에서 확인, 어드민은 `http://localhost:3000/admin`

Docker로 실행할 경우:

```bash
docker compose up --build
```

`docker-compose.yml`이 `.env.local`을 자동으로 읽습니다.

---

## 청첩장 템플릿

9종의 완성된 템플릿을 제공하며, 어드민에서 고객마다 템플릿을 고르고 데이터를 입력하면 바로 청첩장이 생성됩니다.

| id | 이름 | 무드 |
|---|---|---|
| `classic` | 클래식 | 다크 로맨틱, 봉투 오프닝 스크롤 |
| `editorial` | 에디토리얼 | 모던 매거진, 다크 풀블리드 |
| `minimal` | 미니멀 | 클린 화이트 |
| `romantic` | 로맨틱 | 드리미 플로럴 |
| `twilight` | 트와이라잇 | 시네마틱 다크 + 별빛 |
| `blossom` | 블로섬 | 봄 벚꽃 |
| `modern` | 모던 | 인스타 감성 |
| `luxury` | 럭셔리 | 프리미엄 네이비 + 골드 |
| `garden` | 가든 | 풀숲 히어로 + 캘리그래피, 갤러리·메시지월 포함 |

각 템플릿은 `src/templates/<id>/`에 구현되어 있고 `src/templates/registry.ts`에서 매핑됩니다.
청첩장 공유 URL 형식: `/invite/<template-id>?file=<고객파일명>`

---

## 어드민 — 멀티테넌트 구조

`/admin`은 **관리자(admin)**와 **고객(customer)** 두 역할을 지원하는 하나의 화면입니다. 이메일로 로그인하면 역할에 따라 자동으로 화면이 달라집니다.

- **관리자** (`ADMIN_EMAIL`로 로그인): 모든 고객 파일을 자유롭게 조회·수정·삭제, 신규 고객 계정 생성
- **고객** (관리자가 만들어준 이메일 계정으로 로그인): 자신의 청첩장 데이터와 하객 현황만 조회·수정 — 다른 고객 파일에는 접근 불가

고객 계정은 **관리자가 생성**합니다(자가입회 없음). 관리자가 `/admin/templates`에서 새 고객 파일명을 **이메일 주소 형식**으로 입력해 저장하면, 그 이메일로 고객이 바로 로그인할 수 있습니다 (파일명 = 이메일).

### 어드민 메뉴

| 탭 | 경로 | 내용 |
|---|---|---|
| 하객 현황 | `/admin` | RSVP 응답 조회, 인라인 수정/삭제 |
| 고객 설정 (고객: 내 정보 설정) | `/admin/setup` | 스키마 기반 폼으로 청첩장 데이터 입력, 실시간 미리보기 |
| 템플릿 | `/admin/templates` | 템플릿 갤러리에서 선택 → 자동 저장 |

### 인증 방식

이메일 인증 코드(OTP) 방식입니다. 로그인 화면에서 이메일을 입력하면 6자리 코드가 발송되고, 코드를 맞게 입력하면 7일간 유지되는 HMAC 서명 세션 쿠키가 발급됩니다. `ADMIN_EMAIL`과 일치하면 admin 역할, `data/clients/{이메일}.json` 파일이 존재하면 customer 역할로 로그인됩니다. 등록되지 않은 이메일은 로그인할 수 없습니다.

---

## 환경 변수

`.env.local`에 설정하세요 (`.env.example` 참고):

```bash
# 관리자 계정 (이 이메일로 로그인하면 admin 역할)
ADMIN_EMAIL=본인 이메일 주소

# OTP 코드를 발송할 Gmail 계정 (ADMIN_EMAIL과 같아도 됨)
GMAIL_USER=코드를 발송할 Gmail 주소
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx  # Gmail 앱 비밀번호 (아래 참고)

# 세션 서명용 랜덤 문자열
ADMIN_SESSION_SECRET=openssl rand -hex 32 로 생성

# 계좌번호/예금주 암호화 키 (base64, 32바이트)
ENCRYPTION_KEY=openssl rand -base64 32 로 생성
```

`GMAIL_APP_PASSWORD` 발급 방법:
1. Google 계정에서 2단계 인증을 활성화
2. [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) 접속 → 앱 비밀번호 생성
3. 생성된 16자리 값을 그대로 사용 (일반 로그인 비밀번호가 아님)

값이 설정되지 않으면 `/admin`, `/api/clients`, `/api/upload` 접근이 모두 차단됩니다.

### 계좌번호 암호화

신랑·신부 계좌번호/예금주는 저장 시 AES-256-GCM으로 암호화되어 `data/clients/*.json`에 기록됩니다. `ENCRYPTION_KEY`가 없으면 계좌 저장/조회가 실패합니다. 암호화 이전에 저장된 평문 데이터는 그대로 읽히다가 다음 저장 시 자동으로 암호화됩니다.

---

## 데이터 저장 구조

DB 없이 파일시스템 JSON으로 동작합니다.

```
data/
├── clients/{파일명}.json   ← 고객별 청첩장 데이터 (파일명 = 이메일 또는 슬러그)
├── rsvp/{파일명}.json      ← 고객별 하객 RSVP 응답 목록
└── otp/{이메일}.json       ← 발급된 로그인 코드 (검증 후 자동 삭제)
```

---

## 주요 API

| 경로 | 메서드 | 설명 |
|---|---|---|
| `/api/admin/auth/request-code` | POST | 이메일로 OTP 발송 |
| `/api/admin/auth/verify-code` | POST | OTP 검증, 세션 쿠키 발급 |
| `/api/admin/auth/me` | GET | 현재 세션의 role/file 조회 |
| `/api/admin/auth/logout` | POST | 세션 종료 |
| `/api/clients` | GET/POST/DELETE | 청첩장 데이터 조회/저장/삭제 (customer는 자기 파일만) |
| `/api/rsvp` | GET/POST | 하객 RSVP 조회(공개)/제출(공개) |
| `/api/rsvp` | PATCH/DELETE | RSVP 항목 수정/삭제 (본인 또는 관리자만) |
| `/api/upload` | POST | 이미지/오디오 파일 업로드 |

접근 제어는 `src/proxy.ts`(로그인 여부)와 각 라우트 핸들러(`src/lib/session.ts`의 `getSession`으로 소유권 확인) 두 단계로 이뤄집니다.

---

## 청첩장 데이터 스키마

고객 데이터 필드는 템플릿별 스키마(`src/templates/<id>.schema.ts`)로 정의되고, 어드민 폼(`src/components/admin/AdminForm.tsx`)이 이 스키마를 읽어 자동으로 입력 폼과 실시간 미리보기를 생성합니다. 새 필드를 추가하려면 스키마 파일에 필드를 선언하기만 하면 됩니다 — 폼 코드를 직접 수정할 필요가 없습니다.

공통 스키마가 없는 템플릿(`garden` 제외 8종)은 `src/lib/templateSchemas.ts`의 공통 필드 폴백으로 렌더링됩니다.

---

## 컬러 테마 변경

`src/app/globals.css`의 `:root` 변수를 바꾸면 어드민 UI 전체 색상이 바뀝니다.

```css
:root {
  --color-primary-dark:  #5c4035;
  /* ... */
}
```

템플릿 자체의 색상은 각 템플릿 컴포넌트 내부에서 관리됩니다.

---

## 프로젝트 구조

```
src/
├── content.ts                  ← 기본값(WEDDING) — 신규 고객 생성 시 초기값
├── types.ts                    ← WeddingData 타입
├── proxy.ts                    ← 어드민 인증 미들웨어 (Next 16 middleware)
├── lib/
│   ├── adminAuth.ts             ← 세션 토큰 발급/검증 (HMAC, Web Crypto)
│   ├── adminOtp.ts              ← 이메일별 OTP 발급/검증
│   ├── session.ts               ← getSession() — 라우트 핸들러용 세션 헬퍼
│   ├── accountCrypto.ts         ← 계좌번호 AES-256-GCM 암복호화
│   ├── schema.ts / templateSchemas.ts ← 스키마 엔진
│   └── newClient.ts             ← 신규 고객 기본 데이터/파일명 생성
├── templates/
│   ├── registry.ts              ← 템플릿 id → 컴포넌트 매핑
│   └── <id>/                    ← 템플릿별 컴포넌트
├── components/
│   ├── AdminNav.tsx              ← 어드민 상단 네비 (역할별 분기)
│   └── admin/                    ← 스키마 기반 폼/미리보기/필드 컴포넌트
└── app/
    ├── admin/                    ← 하객 현황 / 고객 설정 / 템플릿 선택
    ├── invite/[slug]/            ← 공개 청첩장 페이지 (?file=고객파일명)
    ├── preview/[template]/       ← 어드민 실시간 미리보기용 iframe 대상
    └── api/                      ← 위 API 표 참고

data/                            ← 고객/RSVP/OTP 저장소 (파일시스템 DB)
public/images/                   ← 템플릿 공용 기본 이미지
```

---

## 향후 확장 계획

- **결제 연동**: 고객 플랜/구독 관리
- **방명록 실시간 알림**: 새 RSVP 도착 시 관리자 알림
- **AI 커스터마이징**: 채팅으로 텍스트·컬러 실시간 수정
- **정식 DB 전환**: 파일시스템 → Postgres/SQLite (고객 수 증가 대비)

---

## 배포

```bash
npm run build   # 로컬 빌드 확인
npm run start   # 프로덕션 서버 실행
```

Docker 배포 시 `Dockerfile` / `docker-compose.yml` 참고. `data/` 디렉터리는 볼륨으로 마운트해 영속시켜야 합니다.

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
| 데이터 저장 | SQLite 단일 파일 (`DATA_DIR/momentree.db`, better-sqlite3) + 업로드 파일 |

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

10종의 완성된 템플릿을 제공하며, 어드민에서 고객마다 템플릿을 고르고 데이터를 입력하면 바로 청첩장이 생성됩니다.

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
| `mono` | 모노 | 흑백 모노크롬, 슬라이드 갤러리 |

각 템플릿은 `src/templates/<id>/`에 구현되어 있고 `src/templates/registry.ts`에서 매핑됩니다.
청첩장 공유 URL 형식: `/invite/<template-id>?id=<공유 ID>` (기존 `?file=<고객파일명>` 링크도 계속 동작)

---

## 어드민 — 멀티테넌트 구조

`/admin`은 **관리자(admin)**와 **고객(customer)** 두 역할을 지원하는 하나의 화면입니다. 이메일로 로그인하면 역할에 따라 자동으로 화면이 달라집니다.

- **관리자** (`ADMIN_EMAIL`로 로그인): 모든 고객 파일을 자유롭게 조회·수정·삭제, 신규 고객 계정 생성
- **고객** (관리자가 만들어준 이메일 계정으로 로그인): 자신의 청첩장 데이터와 하객 현황만 조회·수정 — 다른 고객 파일에는 접근 불가

고객 계정은 **자가입회**입니다. 관리자 이메일이 아닌 임의의 이메일로 `/admin/login`에서 인증 코드를 요청하고 처음 로그인에 성공하면, 그 이메일을 파일명으로 하는 기본 데이터 파일이 자동 생성됩니다(파일명 = 이메일). 관리자가 미리 계정을 만들어줄 필요는 없지만, `/admin/templates`에서 이메일 형식 파일명으로 직접 만들어 초기 템플릿/데이터를 세팅해줄 수도 있습니다.

### 어드민 메뉴

| 탭 | 경로 | 내용 |
|---|---|---|
| 하객 현황 | `/admin` | RSVP 응답 조회, 인라인 수정/삭제 |
| 고객 설정 (고객: 내 정보 설정) | `/admin/setup` | 스키마 기반 폼으로 청첩장 데이터 입력, 실시간 미리보기 |
| 템플릿 | `/admin/templates` | 템플릿 갤러리에서 선택 → 자동 저장 |

### 인증 방식

이메일 인증 코드(OTP) 방식입니다. 로그인 화면에서 이메일을 입력하면 6자리 코드가 발송되고, 코드를 맞게 입력하면 7일간 유지되는 HMAC 서명 세션 쿠키가 발급됩니다. `ADMIN_EMAIL`과 일치하면 admin 역할, 그 외 이메일은 모두 customer 역할로 로그인되며 `data/clients/{이메일}.json` 파일이 없으면 최초 로그인 시 기본 데이터로 자동 생성됩니다.

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

### 고객 데이터 암호화

청첩장 데이터 전체(계좌번호·예금주 포함 모든 필드)가 JSON으로 만들어져 AES-256-GCM으로 **통째로 암호화**되어 DB의 `customers.data_enc`에 저장됩니다. 검색·목록에 필요한 값(가입 이메일, 표시 이름 "홍길동 ♥ 김지수", 예식일, 템플릿)만 평문 컬럼으로 따로 둡니다. 표시 이름·예식일은 청첩장에 공개되는 값이고, 이메일은 로그인에 쓰이기 때문입니다. `ENCRYPTION_KEY`가 없거나 바뀌면 고객 데이터를 읽을 수 없으니 **키는 서버 밖에도 안전하게 보관**하세요.

### 업로드된 이미지/오디오는 어디에 저장되나

고객이 업로드한 사진·배경음악은 `public/`이 아니라 `DATA_DIR/uploads/`에 저장되고, `/uploads/[kind]/[filename]` 라우트가 직접 읽어서 서빙합니다. `public/`에 두지 않는 이유: `next build`의 `.next/standalone` 출력은 재배포할 때마다 통째로 재생성되기 때문에, 거기 런타임에 쓴 파일은 다음 빌드에서 사라집니다. `DATA_DIR`은 `data/clients`, `data/rsvp`와 같은 영속 저장소라 재배포에 영향받지 않습니다.

### 데이터 저장 경로 (PM2 등 standalone 배포 시 필수)

기본적으로 `data/`는 `process.cwd()` 기준 상대경로에 저장됩니다. Docker로 실행하면 항상 프로젝트 루트에서 기동되니 문제없지만, PM2로 `.next/standalone/server.js`를 직접 실행하는 배포 환경이면 Next.js standalone 서버가 기동 시 자기 위치(`.next/standalone`)로 내부적으로 `chdir` 해버려서 `process.cwd()`가 기대와 달라집니다 — 이러면 `data/`가 재배포할 때마다 사라지는 `.next/standalone` 안쪽에 저장되어 버립니다. 이럴 땐 `.env.local`에 절대경로로 고정하세요:

```bash
DATA_DIR=/절대/경로/data
```

### 백업 / 복구

`bin/backup.sh`가 `DATA_DIR`(DB + uploads)을 `momentree-YYYYMMDD-HHMMSS.tar.gz`로 묶어 `BACKUP_DIR`에 저장하고 최신 `KEEP`개(기본 14)만 남깁니다. 기본값은 `/data/momentree` → `/data/momentree-backups`. SQLite는 쓰는 도중 파일을 그냥 복사하면 깨질 수 있어서 **온라인 백업**(일관된 스냅샷)으로 DB를 뜹니다 — `sqlite3` CLI가 있으면 그걸, 없으면 실행 중인 컨테이너(`CONTAINER`, 기본 `momentree`)의 better-sqlite3를 씁니다. 로그인 코드(`otp` 테이블)는 5분짜리라 따로 신경 쓸 필요 없습니다.

```bash
# 서버 crontab (매일 04:00)
0 4 * * * /app/Momentree/bin/backup.sh >> /var/log/momentree-backup.log 2>&1

# 복구 — 컨테이너를 멈춘 상태에서 압축 해제 (momentree.db가 DB 파일)
docker compose stop
rm -f /data/momentree/momentree.db-wal /data/momentree/momentree.db-shm   # 이전 DB의 잔여 로그 파일
tar -xzf /data/momentree-backups/momentree-XXXX.tar.gz -C /data/momentree
docker compose start
```

같은 서버 디스크에만 두면 디스크 장애 시 함께 사라지므로, 백업 디렉터리를 외부(S3, 다른 서버 등)로 주기적으로 복사하세요. 백업에는 암호화된 데이터가 들어 있으니 `ENCRYPTION_KEY`도 별도로 보관해야 복구할 수 있습니다.

### 파일(JSON) 저장소에서 DB로 옮기기

DB를 처음 만드는 순간(배포 후 첫 요청) 기존 `data/clients`, `rsvp`, `guestbook`, `admins.json`, `share-index.json`을 **자동으로 가져옵니다**. 계좌 필드만 암호화돼 있던 예전 데이터는 풀어서 통째 암호화 형태로 다시 담고, 이미 나간 공유 ID(`?id=`)는 그대로 유지됩니다. 원본 파일은 건드리지 않고 남겨 두므로 문제가 있으면 DB 파일을 지우고 다시 시작하면 됩니다(가져오기가 다시 실행됨). 배포 직전에 `bin/backup.sh`를 한 번 실행해 두세요. 컨테이너 로그에 `[db] 기존 JSON 가져오기: 고객 N, RSVP N ...` 줄이 한 번 나옵니다. 문제없음을 확인한 뒤 옛 JSON 폴더는 정리해도 됩니다.

### 고객 찾기

어드민의 고객 목록은 "홍길동 ♥ 김지수 · 예식일"로 표시되고, 이메일·이름·파일명·예식일로 검색됩니다 (`GET /api/clients?detail=1&q=키워드`).

### 테스트

`npm test` — 세션 토큰, 암호화, rate limit, DB 스키마·고객 저장/검색, 기존 JSON 가져오기, 관리자·OTP, RSVP·방명록 권한(제출/수정/삭제)을 검증합니다 (Node 내장 test runner, 추가 의존성 없음).

---

## 데이터 저장 구조

SQLite 단일 파일(`DATA_DIR/momentree.db`, WAL)에 저장됩니다. 스키마는 `src/lib/db.ts`의 `MIGRATIONS` 배열에 정의되며 서버가 시작할 때 자동 적용됩니다(변경은 배열 끝에 추가만).

| 테이블 | 내용 |
|---|---|
| `customers` | 고객(청첩장): `file`(세션·링크 키), `email`, `share_id`(공개 링크 ID), `label`, `wedding_date`, `template`, `data_enc`(통째 암호화된 청첩장 데이터) |
| `admins` | 추가 관리자 이메일 (슈퍼 관리자는 `ADMIN_EMAIL` 환경변수) |
| `otp` | 발급된 로그인 코드 (검증 후 삭제, 만료분은 새 발급 때 정리) |
| `rsvp_entries` / `guestbook_entries` | 하객 응답·방명록 (항목별 행, 고유 id로 수정/삭제) |

업로드 파일(이미지·오디오)은 DB가 아니라 `DATA_DIR/uploads/`에 저장됩니다. 인스턴스를 여러 개로 늘리게 되면 Postgres로 옮기세요(쿼리는 표준 SQL 위주).

---

## 주요 API

| 경로 | 메서드 | 설명 |
|---|---|---|
| `/api/admin/auth/request-code` | POST | 이메일로 OTP 발송 |
| `/api/admin/auth/verify-code` | POST | OTP 검증, 세션 쿠키 발급 |
| `/api/admin/auth/me` | GET | 현재 세션의 role/file 조회 |
| `/api/admin/auth/logout` | POST | 세션 종료 |
| `/api/clients` | GET/POST/DELETE | 청첩장 데이터 조회/저장/삭제 (customer는 자기 파일만) |
| `/api/rsvp` | GET/POST | 하객 RSVP 조회/제출 — 비로그인은 공유 ID로만 접근 (파일명=이메일 노출 방지), 전체 목록은 관리자 전용 |
| `/api/share` | GET | 청첩장 공유용 공개 ID 발급/조회 (로그인 필요) |
| `/api/rsvp` | PATCH/DELETE | RSVP 항목 수정/삭제 (본인 또는 관리자만) |
| `/api/upload` | POST | 이미지/오디오 파일 업로드 |

접근 제어는 `src/proxy.ts`(로그인 여부)와 각 라우트 핸들러(`src/lib/session.ts`의 `getSession`으로 소유권 확인) 두 단계로 이뤄집니다.

---

## 청첩장 데이터 스키마

고객 데이터 필드는 템플릿별 스키마(`src/templates/<id>.schema.ts`)로 정의되고, 어드민 폼(`src/components/admin/AdminForm.tsx`)이 이 스키마를 읽어 자동으로 입력 폼과 실시간 미리보기를 생성합니다. 새 필드를 추가하려면 스키마 파일에 필드를 선언하기만 하면 됩니다 — 폼 코드를 직접 수정할 필요가 없습니다.

전용 스키마 파일이 없는 8종(classic·editorial·minimal·romantic·twilight·blossom·modern·luxury)은 `garden.schema.ts`를 폴백으로 쓰되, 각 템플릿이 실제로 렌더링하지 않는 필드(`excludeTemplates`)는 폼에서 숨깁니다.

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

data/                            ← SQLite DB(momentree.db) + 업로드 파일
public/images/                   ← 템플릿 공용 기본 이미지
```

---

## 향후 확장 계획

- **결제 연동**: 고객 플랜/구독 관리
- **방명록 실시간 알림**: 새 RSVP 도착 시 관리자 알림
- **AI 커스터마이징**: 채팅으로 텍스트·컬러 실시간 수정
- **Postgres 전환**: 인스턴스를 여러 개로 늘릴 때 (현재는 SQLite 단일 파일)

---

## 배포

```bash
npm run build   # 로컬 빌드 확인
npm run start   # 프로덕션 서버 실행
```

Docker 배포 시 `Dockerfile` / `docker-compose.yml` 참고. `data/` 디렉터리는 볼륨으로 마운트해 영속시켜야 합니다.

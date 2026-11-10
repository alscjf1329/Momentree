# Momentree 작업 규칙

모바일 청첩장 멀티테넌트 SaaS. Next.js 16 App Router · React 19 · Tailwind 4 · SQLite(better-sqlite3). 구조와 템플릿 목록은 README.md, 브랜드는 docs/brand-guide.md.

## 대화 방식
- 사용자는 한국어로 짧게 말한다. 답도 한국어 존댓말, 결론 먼저.
- 사용자가 평소처럼 말하는 요청도 Jira(프로젝트 MOM)에 티켓으로 올리면서 진행한다.
- 커밋·푸시·머지는 사용자가 명시적으로 요청할 때만 한다. 워크트리 작업이 끝나도 승인 전에는 main에 합치지 않는다.
- 확인하지 못한 것(브라우저 렌더링, 실제 메일·텔레그램 전송, 운영 DB)은 보고에서 숨기지 말고 따로 적는다.

## 개발 명령
- 테스트: `npm test` (Node 내장 러너, `tests/`). 타입: `npx tsc --noEmit`. 둘 다 통과해야 머지한다.
- 개발 서버: `npm run dev` → http://localhost:3000, 어드민 /admin.
- 배포: `bin/deploy.sh` (끝에서 /api/health 확인). 백업: `bin/backup.sh`. 배포 전 `node bin/predeploy-check.mjs [.env]`로 읽기 전용 점검(docs/deploy-checklist.md).
- git push는 키체인 때문에 비대화형에서 실패한다. 이 형태로 푸시한다:
  `git -c credential.helper= -c credential.helper='!gh auth git-credential' push`

## 코드 규칙
- 주석은 한국어, 짧게. 불필요한 추상화·설정·폴더를 만들지 않는다. 기존 헬퍼를 먼저 찾아 재사용한다.
- 색은 globals.css 토큰(`ink #111`, `sub #6B6B6B`, `line #EBEBEB`, `soft #FAFAFA`, `rose #C2255C`, 배경 흰색)을 쓴다. 템플릿 고유색은 템플릿 안에서만.
- 사용자 화면에 내부 용어(슬러그, 데이터 파일, 어드민)를 쓰지 않는다. 존댓말, 짧은 문장.
- 모든 화면은 390px와 280px(갤럭시 폴드 접힘)에서 가로 넘침이 없어야 한다.
- 개인정보(하객 RSVP·방명록, 고객 데이터, 메일 큐)는 `accountCrypto`의 AES-256-GCM으로 암호화해 저장한다. 평문 컬럼을 새로 만들지 않는다.
- 스키마 변경은 `src/lib/db.ts`의 `MIGRATIONS`에 추가(SQL 또는 함수, 멱등). 고객 삭제는 `deleteCustomer` 한 곳만 거친다.
- 공개 법적 문구에는 미정 항목을 `[확정 필요: …]`로 남긴다. 임의로 채우지 않는다.

## 식별자·URL
- 고객 파일 ID는 `c-YYYYMM-xxxxxx`(서버 발급, 불변). 예전 이메일 파일명은 공유 링크 보호를 위해 그대로 둔다.
- 공유 URL: `/invite/<템플릿>?id=<공유ID>`. 템플릿은 경로, 데이터는 id로 정한다.

## 스크럼 (Jira MOM)
- 상태 전환 ID: 할 일 11, 진행 중 21, 검토 중 31, 완료 41.
- 진행 방식은 `.claude/skills/scrum`, 머지·푸시는 `.claude/skills/ship`을 따른다.
- 사용자 결정이 필요한 티켓은 임의로 구현하지 않고 안건으로 제안한 뒤 승인받는다.

## 운영 환경변수 (서버 .env, .env.example 참고)
`ENCRYPTION_KEY`, `SITE_URL`, `NEXT_PUBLIC_KAKAO_CHANNEL_URL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`. `NEXT_PUBLIC_*`는 빌드 시점에 고정된다.

import Link from "next/link";

const TEMPLATES = [
  {
    id: "classic",
    name: "클래식",
    mood: "다크 로맨틱",
    desc: "봉투 오프닝 + 골드 포인트",
    bg: "linear-gradient(150deg,#1a1208 0%,#2d1f0f 60%,#1a1208 100%)",
    accent: "#c9a96e",
    text: "#fff",
  },
  {
    id: "editorial",
    name: "에디토리얼",
    mood: "모던 매거진",
    desc: "풀블리드 타이포 + 필름스트립",
    bg: "linear-gradient(150deg,#0d0d0d 0%,#1a1a1a 100%)",
    accent: "#f2ede8",
    text: "#fff",
  },
  {
    id: "minimal",
    name: "미니멀",
    mood: "클린 모던",
    desc: "화이트 히어로 + 그리드 갤러리",
    bg: "linear-gradient(150deg,#ffffff 0%,#f8f8f8 100%)",
    accent: "#3a3a3a",
    text: "#1a1a1a",
  },
  {
    id: "romantic",
    name: "로맨틱",
    mood: "드리미 플로럴",
    desc: "보태니컬 SVG + 폴라로이드",
    bg: "linear-gradient(150deg,#fdf5f6 0%,#f0dde2 100%)",
    accent: "#b8758a",
    text: "#3d1f28",
  },
];

const STEPS = [
  { n: "01", title: "고객 정보 입력", desc: "신랑·신부 이름, 날짜, 장소 등을 어드민에서 입력합니다." },
  { n: "02", title: "템플릿 선택", desc: "4가지 레이아웃 중 원하는 분위기를 고릅니다." },
  { n: "03", title: "링크 공유", desc: "생성된 URL을 카카오톡, 문자로 바로 공유합니다." },
];

export default function Home() {
  return (
    <div style={{ background: "#faf6f1", minHeight: "100dvh", fontFamily: "var(--font-sans)" }}>

      {/* 헤더 */}
      <header style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
        className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-serif text-lg tracking-widest" style={{ color: "var(--color-primary-dark)" }}>
            Momentree
          </span>
          <div className="flex items-center gap-2">
            {/* 게스트: 템플릿 데모 보기 */}
            <Link href="/invite/demo-classic" target="_blank"
              className="text-xs px-4 py-1.5 rounded-full border transition-colors hover:bg-gray-50 hidden sm:block"
              style={{ borderColor: "rgba(0,0,0,0.12)", color: "#777" }}>
              청첩장 예시 보기
            </Link>
            {/* 구분선 */}
            <span className="text-gray-200 hidden sm:block">|</span>
            {/* 어드민 */}
            <Link href="/admin"
              className="text-xs px-3 py-1.5 rounded-full border transition-colors hover:bg-gray-50"
              style={{ borderColor: "rgba(0,0,0,0.12)", color: "#555" }}>
              어드민
            </Link>
            <Link href="/admin/setup"
              className="text-xs px-4 py-1.5 rounded-full text-white transition-colors hover:opacity-90"
              style={{ background: "var(--color-primary-dark)" }}>
              청첩장 만들기
            </Link>
          </div>
        </div>
      </header>

      {/* 히어로 */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <p className="text-xs tracking-[0.4em] mb-5" style={{ color: "var(--color-warm-gray)" }}>
          WEDDING INVITATION PLATFORM
        </p>
        <h1 className="font-serif mb-6 leading-tight"
          style={{ fontSize: "clamp(2rem,5vw,3.5rem)", color: "var(--color-primary-dark)" }}>
          소중한 날을<br />아름답게 전하세요
        </h1>
        <p className="text-base mb-10 mx-auto max-w-md" style={{ color: "var(--color-text-light)", lineHeight: 1.8 }}>
          고객별 데이터 파일 하나로 청첩장 URL을 즉시 생성합니다.<br />
          4가지 감성 템플릿 중 원하는 스타일을 선택하세요.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/admin/setup"
            className="px-7 py-3 rounded-full text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ background: "var(--color-primary-dark)" }}>
            청첩장 만들기
          </Link>
          <Link href="/admin/templates"
            className="px-7 py-3 rounded-full text-sm font-medium border transition-all hover:bg-white"
            style={{ borderColor: "rgba(0,0,0,0.15)", color: "var(--color-text)" }}>
            템플릿 보기
          </Link>
        </div>
      </section>

      {/* 템플릿 카드 */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {TEMPLATES.map(t => (
            <Link key={t.id} href={`/invite/demo-${t.id}`}
              target="_blank"
              className="group rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
              style={{ background: "#fff" }}>
              {/* 미리보기 썸네일 */}
              <div style={{ height: 200, background: t.bg, position: "relative" }}
                className="flex flex-col items-center justify-center gap-2">
                <div style={{ width: 32, height: 1, background: t.accent, opacity: 0.6 }} />
                <p className="font-serif tracking-widest text-base font-light" style={{ color: t.text, opacity: 0.9 }}>
                  Kim · Lee
                </p>
                <span style={{ color: t.accent, fontSize: 11 }}>♥</span>
                <p style={{ color: t.text, opacity: 0.4, fontSize: 10, letterSpacing: "0.3em" }}>2025.10.18</p>
                <div style={{ width: 32, height: 1, background: t.accent, opacity: 0.6 }} />
                {/* 호버 오버레이 */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "rgba(0,0,0,0.35)" }}>
                  <span className="text-white text-xs tracking-widest border border-white/40 px-4 py-1.5 rounded-full">
                    미리보기
                  </span>
                </div>
              </div>
              {/* 카드 정보 */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-sm" style={{ color: "var(--color-text)" }}>{t.name}</p>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{t.mood}</span>
                </div>
                <p className="text-[11px]" style={{ color: "var(--color-text-light)" }}>{t.desc}</p>
              </div>
            </Link>
          ))}
        </div>
        <p className="text-center text-xs mt-4" style={{ color: "var(--color-warm-gray)" }}>
          ↑ 카드 클릭 시 샘플 데이터로 미리보기
        </p>
      </section>

      {/* 사용법 */}
      <section style={{ background: "var(--color-primary-dark)" }} className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-xs tracking-[0.4em] mb-2" style={{ color: "rgba(255,255,255,0.35)" }}>HOW IT WORKS</p>
          <h2 className="font-serif text-center text-2xl font-light mb-12" style={{ color: "#fff" }}>
            3단계로 완성
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map(s => (
              <div key={s.n} className="text-center">
                <p className="font-serif text-4xl font-light mb-4" style={{ color: "var(--color-gold)", opacity: 0.5 }}>
                  {s.n}
                </p>
                <p className="font-medium mb-2" style={{ color: "#fff" }}>{s.title}</p>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/admin/setup"
              className="inline-block px-8 py-3 rounded-full text-sm font-medium transition-all hover:opacity-80"
              style={{ background: "var(--color-gold)", color: "#1a1208" }}>
              지금 시작하기
            </Link>
          </div>
        </div>
      </section>

      {/* 어드민 바로가기 */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/admin/setup"
            className="flex items-center justify-between p-6 rounded-2xl border transition-all hover:shadow-md hover:border-gray-300 bg-white group"
            style={{ borderColor: "rgba(0,0,0,0.08)" }}>
            <div>
              <p className="font-medium mb-1" style={{ color: "var(--color-text)" }}>고객 정보 설정</p>
              <p className="text-xs" style={{ color: "var(--color-text-light)" }}>신랑·신부 정보, 날짜, 장소 입력</p>
            </div>
            <span className="text-gray-300 group-hover:text-gray-500 transition-colors text-xl">→</span>
          </Link>
          <Link href="/admin"
            className="flex items-center justify-between p-6 rounded-2xl border transition-all hover:shadow-md hover:border-gray-300 bg-white group"
            style={{ borderColor: "rgba(0,0,0,0.08)" }}>
            <div>
              <p className="font-medium mb-1" style={{ color: "var(--color-text)" }}>RSVP 참석 현황</p>
              <p className="text-xs" style={{ color: "var(--color-text-light)" }}>참석 응답 확인 및 인원 집계</p>
            </div>
            <span className="text-gray-300 group-hover:text-gray-500 transition-colors text-xl">→</span>
          </Link>
        </div>
      </section>

      {/* 푸터 */}
      <footer style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }} className="py-8">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <span className="font-serif text-sm tracking-widest" style={{ color: "var(--color-warm-gray)" }}>
            Momentree
          </span>
          <p className="text-xs" style={{ color: "var(--color-warm-gray)" }}>
            Wedding Invitation Platform
          </p>
        </div>
      </footer>
    </div>
  );
}

import Link from "next/link";
import InstallBanner from "@/components/InstallBanner";

const TEMPLATES = [
  { id: "classic",   name: "클래식",     mood: "다크 로맨틱",    desc: "봉투 오프닝 + 골드 포인트",    bg: "linear-gradient(150deg,#1a1208,#2d1f0f)", accent: "#c9a96e", text: "#fff" },
  { id: "editorial", name: "에디토리얼",  mood: "모던 매거진",    desc: "풀블리드 타이포 + 필름스트립",  bg: "linear-gradient(150deg,#0d0d0d,#1a1a1a)",  accent: "#f2ede8", text: "#fff" },
  { id: "minimal",   name: "미니멀",     mood: "클린 모던",      desc: "화이트 히어로 + 그리드 갤러리",  bg: "linear-gradient(150deg,#ffffff,#f4f4f4)",  accent: "#3a3a3a", text: "#1a1a1a" },
  { id: "romantic",  name: "로맨틱",     mood: "드리미 플로럴",   desc: "보태니컬 SVG + 폴라로이드",    bg: "linear-gradient(150deg,#fdf5f6,#f0dde2)",  accent: "#b8758a", text: "#3d1f28" },
  { id: "twilight",  name: "트와이라잇",  mood: "시네마틱 다크",  desc: "별빛 + 블루퍼플 무드",          bg: "linear-gradient(150deg,#080a14,#0e1230)",  accent: "#8b9ec4", text: "#dde2f0" },
  { id: "blossom",   name: "블로섬",     mood: "봄 벚꽃",        desc: "떨어지는 꽃잎 + 플로럴",        bg: "linear-gradient(150deg,#fdf0f4,#f8e4ec)",  accent: "#c4758a", text: "#3a2030" },
  { id: "modern",    name: "모던",       mood: "인스타 감성",     desc: "웜톤 풀블리드 + IG 그리드",     bg: "linear-gradient(150deg,#f5efe7,#e8d8c8)",  accent: "#c47a5a", text: "#2d1e12" },
  { id: "luxury",    name: "럭셔리",     mood: "프리미엄 네이비", desc: "딥 네이비 + 골드 프레임",        bg: "linear-gradient(150deg,#070d1a,#0e1628)",  accent: "#c9a96e", text: "#f0ece4" },
];

const STEPS = [
  { n: "01", title: "고객 정보 입력", desc: "신랑·신부 이름, 날짜, 장소 등을 어드민에서 입력합니다." },
  { n: "02", title: "템플릿 선택",   desc: "4가지 레이아웃 중 원하는 분위기를 고릅니다." },
  { n: "03", title: "링크 공유",     desc: "생성된 URL을 카카오톡, 문자로 바로 공유합니다." },
];

export default function Home() {
  return (
    <div style={{ background: "#faf6f1", minHeight: "100dvh", fontFamily: "var(--font-sans)" }}>

      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <span className="font-serif text-base sm:text-lg tracking-widest"
            style={{ color: "var(--color-primary-dark)" }}>
            Momentree
          </span>
          <div className="flex items-center gap-2">
            <Link href="/invite/demo-classic" target="_blank"
              className="text-xs px-3 py-1.5 rounded-full border transition-colors hover:bg-gray-50 hidden md:block"
              style={{ borderColor: "rgba(0,0,0,0.12)", color: "#777" }}>
              예시 보기
            </Link>
            <Link href="/admin/setup"
              className="text-xs px-4 py-1.5 rounded-full text-white transition-colors hover:opacity-90"
              style={{ background: "var(--color-primary-dark)" }}>
              어드민 →
            </Link>
          </div>
        </div>
      </header>

      {/* 히어로 */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-10 sm:pb-16 text-center">
        <p className="text-[10px] sm:text-xs tracking-[0.4em] mb-4 sm:mb-5"
          style={{ color: "var(--color-warm-gray)" }}>
          WEDDING INVITATION PLATFORM
        </p>
        <h1 className="font-serif mb-5 sm:mb-6 leading-tight"
          style={{ fontSize: "clamp(1.75rem,6vw,3.5rem)", color: "var(--color-primary-dark)" }}>
          소중한 날을<br />아름답게 전하세요
        </h1>
        <p className="text-sm sm:text-base mb-8 sm:mb-10 mx-auto max-w-sm sm:max-w-md"
          style={{ color: "var(--color-text-light)", lineHeight: 1.8 }}>
          고객별 데이터 파일 하나로 청첩장 URL을 즉시 생성합니다.<br className="hidden sm:block" />
          4가지 감성 템플릿 중 원하는 스타일을 선택하세요.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/admin/setup"
            className="px-6 sm:px-7 py-2.5 sm:py-3 rounded-full text-sm font-medium text-white"
            style={{ background: "var(--color-primary-dark)" }}>
            청첩장 만들기
          </Link>
          <Link href="/admin/templates"
            className="px-6 sm:px-7 py-2.5 sm:py-3 rounded-full text-sm font-medium border"
            style={{ borderColor: "rgba(0,0,0,0.15)", color: "var(--color-text)" }}>
            템플릿 보기
          </Link>
        </div>
      </section>

      {/* 템플릿 카드 그리드 */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-14 sm:pb-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {TEMPLATES.map(t => (
            <Link key={t.id} href={`/invite/demo-${t.id}`} target="_blank"
              className="group rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1"
              style={{ background: "#fff" }}>
              {/* 썸네일 */}
              <div className="relative flex flex-col items-center justify-center gap-2"
                style={{ height: "clamp(140px,30vw,200px)", background: t.bg }}>
                <div style={{ width: 28, height: 1, background: t.accent, opacity: 0.6 }} />
                <p className="font-serif tracking-widest font-light"
                  style={{ fontSize: "clamp(12px,3vw,16px)", color: t.text, opacity: 0.9 }}>
                  Kim · Lee
                </p>
                <span style={{ color: t.accent, fontSize: 10 }}>♥</span>
                <p style={{ color: t.text, opacity: 0.4, fontSize: 9, letterSpacing: "0.3em" }}>2025.10.18</p>
                <div style={{ width: 28, height: 1, background: t.accent, opacity: 0.6 }} />
                {/* 호버 오버레이 */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "rgba(0,0,0,0.35)" }}>
                  <span className="text-white text-[10px] tracking-widest border border-white/40 px-3 py-1 rounded-full">
                    미리보기
                  </span>
                </div>
              </div>
              {/* 정보 */}
              <div className="p-3 sm:p-4">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="font-medium text-xs sm:text-sm" style={{ color: "var(--color-text)" }}>{t.name}</p>
                  <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 hidden sm:block">
                    {t.mood}
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px]" style={{ color: "var(--color-text-light)" }}>{t.desc}</p>
              </div>
            </Link>
          ))}
        </div>
        <p className="text-center text-[10px] sm:text-xs mt-3"
          style={{ color: "var(--color-warm-gray)" }}>
          ↑ 카드 클릭 시 샘플 데이터로 미리보기
        </p>
      </section>

      {/* 3단계 */}
      <section className="py-12 sm:py-16" style={{ background: "var(--color-primary-dark)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-center text-[10px] tracking-[0.4em] mb-2"
            style={{ color: "rgba(255,255,255,0.35)" }}>HOW IT WORKS</p>
          <h2 className="font-serif text-center text-xl sm:text-2xl font-light mb-8 sm:mb-12"
            style={{ color: "#fff" }}>
            3단계로 완성
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {STEPS.map(s => (
              <div key={s.n} className="text-center flex sm:flex-col items-center sm:items-center gap-4 sm:gap-0">
                <p className="font-serif text-3xl sm:text-4xl font-light sm:mb-4 shrink-0"
                  style={{ color: "var(--color-gold)", opacity: 0.5, minWidth: 48 }}>
                  {s.n}
                </p>
                <div className="text-left sm:text-center">
                  <p className="font-medium text-sm mb-1" style={{ color: "#fff" }}>{s.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10 sm:mt-12">
            <Link href="/admin/setup"
              className="inline-block px-7 sm:px-8 py-3 rounded-full text-sm font-medium"
              style={{ background: "var(--color-gold)", color: "#1a1208" }}>
              지금 시작하기
            </Link>
          </div>
        </div>
      </section>

      {/* 어드민 바로가기 */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14 text-center">
        <Link href="/admin/setup"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl border bg-white group transition-all hover:shadow-md hover:border-gray-300 text-sm"
          style={{ borderColor: "rgba(0,0,0,0.08)", color: "var(--color-text)" }}>
          어드민 패널 열기
          <span className="text-gray-300 group-hover:text-gray-500 transition-colors">→</span>
        </Link>
      </section>

      {/* 푸터 */}
      <footer className="py-6 sm:py-8" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <span className="font-serif text-sm tracking-widest" style={{ color: "var(--color-warm-gray)" }}>
            Momentree
          </span>
          <p className="text-xs" style={{ color: "var(--color-warm-gray)" }}>
            Wedding Invitation Platform
          </p>
        </div>
      </footer>

      {/* PWA 설치 배너 */}
      <InstallBanner />
    </div>
  );
}

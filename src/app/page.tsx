import Link from "next/link";
import { cookies } from "next/headers";
import InstallBanner from "@/components/InstallBanner";
import DemoPhone from "@/components/DemoPhone";
import SupportLink from "@/components/SupportLink";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/adminAuth";

// 사진 격자 타일 (눌러서 해당 데모를 연다)
const TILES = [
  { id: "classic", label: "Kim · Lee", bg: "#2A1E10", fg: "#E6D2A8" },
  { id: "romantic", label: "Kim ♡ Lee", bg: "#F6DDE3", fg: "#3d1f28" },
  { id: "minimal", label: "KIM & LEE", bg: "#EDEDED", fg: "#111111" },
  { id: "garden", label: "married", bg: "#DCE6D3", fg: "#2c3226" },
  { id: "twilight", label: "Kim ✦ Lee", bg: "#0E1630", fg: "#C9D4F0" },
  { id: "modern", label: "Kim & Lee", bg: "#EADBC8", fg: "#2d1e12" },
  { id: "blossom", label: "Kim ♥ Lee", bg: "#FBE6EC", fg: "#3a2030" },
  { id: "mono", label: "KIM · LEE", bg: "#F4F4F4", fg: "#111111" },
  { id: "luxury", label: "Kim ✦ Lee", bg: "#0e1628", fg: "#f0ece4" },
];

const STEPS = [
  { n: "01", title: "정보 입력", desc: "이름, 날짜, 장소와 사진을 채워요." },
  { n: "02", title: "템플릿 선택", desc: "10가지 중 분위기에 맞게 골라요." },
  { n: "03", title: "링크 공유", desc: "카카오톡·문자로 링크 하나만 보내요." },
];

export default async function Home() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  const session = secret ? await verifySessionToken(token, secret) : null;
  const startHref = session ? (session.role === "admin" ? "/admin" : "/admin/setup") : "/admin/login";

  return (
    <div className="bg-white min-h-dvh text-ink" style={{ fontFamily: "var(--font-sans)" }}>

      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-line">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 h-14 flex items-center justify-between">
          <span className="font-serif font-semibold text-[21px] tracking-tight">momentree</span>
          <Link href={startHref}
            className="h-10 px-[18px] rounded-full border border-[#d4d4d4] inline-flex items-center text-sm font-medium max-w-[180px] truncate">
            {session ? (session.role === "admin" ? "관리자" : "내 청첩장") : "로그인"}
          </Link>
        </div>
      </header>

      {/* 약속 한 줄 */}
      <section className="max-w-md mx-auto px-6 pt-10 pb-8 flex flex-col gap-[18px] text-center sm:pt-16">
        <span className="text-xs font-bold tracking-[0.14em] text-rose">MOBILE WEDDING INVITATION</span>
        <h1 className="font-serif font-semibold text-[clamp(28px,9vw,36px)] leading-[1.3] tracking-tight">두 분의 하루를<br />링크 하나로</h1>
        <p className="text-[15px] leading-[1.7] text-sub">
          사진과 문구만 채우면 청첩장이 완성돼요. 카톡으로 보내고, 참석 응답은 한곳에서 확인하세요.
        </p>
        <div className="flex flex-col gap-3 mt-1">
          <Link href={startHref} className="h-[52px] rounded-full bg-ink text-white text-base font-bold flex items-center justify-center">
            {session ? "내 청첩장 편집하기" : "무료로 시작하기"}
          </Link>
          <a href="#example" className="h-11 flex items-center justify-center text-sm underline underline-offset-4">예시 청첩장 보기</a>
        </div>
      </section>

      {/* 예시 청첩장 — 결과물을 먼저 보여준다 */}
      <section id="example" className="bg-soft border-y border-line py-9 flex flex-col items-center gap-6 scroll-mt-14">
        <div className="px-6 text-center flex flex-col gap-2">
          <h2 className="font-serif font-semibold text-2xl leading-snug tracking-tight">이런 청첩장을<br />하객이 받게 돼요</h2>
          <p className="text-sm text-sub">실제 템플릿을 폰으로 직접 열어보세요</p>
        </div>
        <DemoPhone />
      </section>

      {/* 템플릿 격자 */}
      <section className="max-w-3xl mx-auto">
        <p className="px-6 pt-8 pb-3 text-[13px] font-bold">모든 템플릿 둘러보기</p>
        <div className="grid grid-cols-3 gap-0.5">
          {TILES.map((t) => (
            <Link key={t.id} href={`/invite/demo-${t.id}`} target="_blank" aria-label={`${t.id} 예시 보기`}
              className="aspect-square flex items-center justify-center font-serif text-[13px] tracking-[0.08em]"
              style={{ background: t.bg, color: t.fg }}>
              {t.label}
            </Link>
          ))}
        </div>
      </section>

      {/* 3단계 */}
      <section className="max-w-md mx-auto px-6 py-12 flex flex-col gap-6">
        <h2 className="font-serif font-semibold text-2xl text-center tracking-tight">3단계로 완성</h2>
        <ol className="flex flex-col gap-5">
          {STEPS.map((s) => (
            <li key={s.n} className="flex items-baseline gap-4">
              <span className="font-serif text-2xl text-rose w-9 shrink-0">{s.n}</span>
              <div><p className="font-bold text-[15px]">{s.title}</p><p className="text-sm text-sub mt-0.5">{s.desc}</p></div>
            </li>
          ))}
        </ol>
        <Link href={startHref} className="h-[52px] rounded-full bg-ink text-white text-base font-bold flex items-center justify-center mt-2">
          {session ? "내 청첩장 편집하기" : "무료로 시작하기"}
        </Link>
      </section>

      <footer className="border-t border-line py-7 px-6 text-center text-xs text-sub leading-relaxed">
        <p>링크 하나 · 참석 응답 · 방명록 · 함께 편집</p>
        <p className="mt-1">© momentree</p>
        <p className="mt-2 flex flex-wrap justify-center gap-x-4">
          <Link href="/faq" className="underline underline-offset-4">자주 묻는 질문</Link>
          <SupportLink />
          <Link href="/terms" className="underline underline-offset-4">이용약관</Link>
          <Link href="/privacy" className="underline underline-offset-4">개인정보처리방침</Link>
        </p>
      </footer>

      <InstallBanner />
    </div>
  );
}

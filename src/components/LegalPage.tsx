import type { ReactNode } from "react";
import Link from "next/link";

// 법률 문서(처리방침·약관) 공용 레이아웃 — 서버 컴포넌트.
export function Tbd({ children }: { children: ReactNode }) {
  return <mark className="bg-[#fff3bf] text-ink px-1 font-bold break-words">[확정 필요: {children}]</mark>;
}

export function Sec({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-serif font-semibold text-lg text-ink">{title}</h2>
      <div className="mt-2 flex flex-col gap-2 text-sm leading-relaxed text-ink break-words [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-1">{children}</div>
    </section>
  );
}

export default function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-white text-ink">
      <article className="max-w-xl mx-auto px-6 py-10 overflow-x-hidden">
        <Link href="/" className="text-xs text-sub underline underline-offset-4">← Momentree</Link>
        <h1 className="font-serif font-semibold text-[28px] leading-[1.3] tracking-tight mt-4">{title}</h1>
        <p className="mt-4 border border-line rounded-lg px-3 py-2 text-xs leading-relaxed text-sub">
          초안 안내: 이 문서는 법률 검토 전 초안입니다. 출시 전에 <Tbd>법률 검토 및 표시된 항목 확정</Tbd>이 필요합니다.
        </p>
        <p className="mt-3 text-xs text-sub">시행일: <Tbd>시행일</Tbd></p>
        {children}
        <footer className="mt-12 pt-5 border-t border-line text-xs text-sub flex gap-4">
          <Link href="/terms" className="underline underline-offset-4">이용약관</Link>
          <Link href="/privacy" className="underline underline-offset-4">개인정보처리방침</Link>
        </footer>
      </article>
    </main>
  );
}

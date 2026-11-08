import Link from "next/link";

// 하위 화면 공통 머리글: 뒤로가기 + 제목 (+ 오른쪽 액션)
export default function SubPageHeader({ title, back, children }: { title: string; back: string; children?: React.ReactNode }) {
  return (
    <div className="sticky top-14 z-40 bg-white border-b border-line">
      <div className="max-w-2xl mx-auto px-3 h-14 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 min-w-0">
          <Link href={back} aria-label="뒤로" className="w-11 h-11 flex items-center justify-center text-ink shrink-0">
            <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
          </Link>
          <h1 className="text-[17px] font-bold truncate">{title}</h1>
        </div>
        {children}
      </div>
    </div>
  );
}

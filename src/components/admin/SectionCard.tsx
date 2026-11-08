// 접고 펼 수 있는 입력 섹션. onToggle이 없으면 항상 펼쳐진 고정 카드.
export default function SectionCard({
  title, children, open = true, onToggle, badge,
}: {
  title: string;
  children: React.ReactNode;
  open?: boolean;
  onToggle?: () => void;
  /** 오른쪽 상태 표시 — warn(남은 필수 항목·오류) / ok(완료) */
  badge?: { text: string; tone: "warn" | "ok" };
}) {
  const header = (
    <>
      <h2 className="text-[15px] font-bold text-ink">{title}</h2>
      <span className="flex items-center gap-2 shrink-0">
        {badge && (
          <span className={`h-[26px] px-2.5 rounded-full text-xs font-medium inline-flex items-center ${badge.tone === "warn" ? "bg-[#fff4e5] text-[#8a4b00]" : "bg-[#e8f6ee] text-[#1b6b43]"}`}>
            {badge.text}
          </span>
        )}
        {onToggle && (
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b6b6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${open ? "rotate-180" : ""}`}>
            <path d="M6 9l6 6 6-6" />
          </svg>
        )}
      </span>
    </>
  );
  return (
    <div className="bg-white rounded-[20px] border border-line overflow-hidden">
      {onToggle ? (
        <button type="button" onClick={onToggle} aria-expanded={open}
          className={`w-full min-h-[56px] px-5 bg-soft flex items-center justify-between gap-3 text-left ${open ? "border-b border-line" : ""}`}>
          {header}
        </button>
      ) : (
        <div className="min-h-[56px] px-5 border-b border-line bg-soft flex items-center justify-between gap-3">{header}</div>
      )}
      {open && <div className="p-5 space-y-4">{children}</div>}
    </div>
  );
}

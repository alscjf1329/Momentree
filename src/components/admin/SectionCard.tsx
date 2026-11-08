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
      <h2 className="text-xs font-semibold text-gray-500 tracking-widest uppercase">{title}</h2>
      <span className="flex items-center gap-2 shrink-0">
        {badge && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${badge.tone === "warn" ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"}`}>
            {badge.text}
          </span>
        )}
        {onToggle && <span className={`text-gray-300 text-xs transition-transform ${open ? "rotate-180" : ""}`}>▾</span>}
      </span>
    </>
  );
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {onToggle ? (
        <button type="button" onClick={onToggle} aria-expanded={open}
          className={`w-full px-5 py-3.5 bg-gray-50/60 flex items-center justify-between gap-3 text-left ${open ? "border-b border-gray-50" : ""}`}>
          {header}
        </button>
      ) : (
        <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/60 flex items-center justify-between gap-3">{header}</div>
      )}
      {open && <div className="p-5 space-y-4">{children}</div>}
    </div>
  );
}

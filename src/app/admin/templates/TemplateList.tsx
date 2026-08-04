"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

const TEMPLATES = [
  {
    id: "classic",
    name: "클래식",
    mood: "다크 로맨틱",
    desc: "봉투 오프닝 스크롤 + 골드 포인트",
    bg: "linear-gradient(160deg,#1a1208 0%,#2a1e10 100%)",
  },
  {
    id: "editorial",
    name: "에디토리얼",
    mood: "모던 매거진",
    desc: "다크 풀블리드 타이포그래피 + 필름스트립",
    bg: "linear-gradient(160deg,#0d0d0d 0%,#1a1a1a 100%)",
  },
  {
    id: "minimal",
    name: "미니멀",
    mood: "클린 모던",
    desc: "화이트 히어로 + 2열 그리드 갤러리",
    bg: "linear-gradient(160deg,#ffffff 0%,#f4f4f4 100%)",
  },
  {
    id: "romantic",
    name: "로맨틱",
    mood: "드리미 플로럴",
    desc: "보태니컬 SVG 데코 + 폴라로이드",
    bg: "linear-gradient(160deg,#fdf5f6 0%,#f0dde2 100%)",
  },
];

function TemplatePreview({ id }: { id: string }) {
  if (id === "classic") return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2"
      style={{ background: "linear-gradient(160deg,#1a1208,#2a1e10)" }}>
      <div style={{ width: 32, height: 1, background: "#c9a96e", opacity: 0.5 }} />
      <p className="font-serif text-white tracking-widest font-light" style={{ fontSize: "clamp(11px,2vw,16px)", opacity: 0.85 }}>Kim · Lee</p>
      <span style={{ color: "#c9a96e", fontSize: 10 }}>♥</span>
      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 8, letterSpacing: "0.4em" }}>2025.10.18</p>
      <div style={{ width: 32, height: 1, background: "#c9a96e", opacity: 0.5 }} />
    </div>
  );
  if (id === "editorial") return (
    <div className="w-full h-full flex flex-col justify-center px-5" style={{ background: "#0d0d0d" }}>
      <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.12)", marginBottom: 16 }} />
      <p style={{ fontSize: 7, letterSpacing: "0.5em", color: "rgba(255,255,255,0.2)", marginBottom: 6 }}>INVITATION</p>
      <p className="font-serif text-white font-light tracking-widest" style={{ fontSize: "clamp(16px,3vw,24px)" }}>Kim</p>
      <p style={{ color: "rgba(255,255,255,0.12)", fontSize: 16, margin: "2px 0", letterSpacing: "0.2em" }}>&amp;</p>
      <p className="font-serif text-white font-light tracking-widest" style={{ fontSize: "clamp(16px,3vw,24px)" }}>Lee</p>
      <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.12)", marginTop: 16, marginBottom: 6 }} />
      <p style={{ fontSize: 7, letterSpacing: "0.3em", color: "rgba(255,255,255,0.2)" }}>2025 · 10 · 18</p>
    </div>
  );
  if (id === "minimal") return (
    <div className="w-full h-full flex flex-col pt-5 px-5" style={{ background: "#fff" }}>
      <p style={{ fontSize: 7, letterSpacing: "0.5em", color: "#ddd", marginBottom: 12 }}>WEDDING INVITATION</p>
      <p className="font-serif text-gray-900 font-light tracking-wider" style={{ fontSize: "clamp(14px,2.5vw,20px)" }}>Kim</p>
      <p style={{ color: "#ccc", fontSize: 14, margin: "2px 0" }}>+</p>
      <p className="font-serif text-gray-900 font-light tracking-wider" style={{ fontSize: "clamp(14px,2.5vw,20px)" }}>Lee</p>
      <div className="flex items-center gap-2 mt-3">
        <div style={{ width: 20, height: 1, background: "#ddd" }} />
        <p style={{ fontSize: 7, letterSpacing: "0.3em", color: "#bbb" }}>2025.10.18</p>
      </div>
      <div className="grid grid-cols-2 gap-1 mt-3 flex-1 pb-4">
        {[0,1,2,3].map(i => <div key={i} className="rounded-sm" style={{ background: "#f3f4f6" }} />)}
      </div>
    </div>
  );
  return (
    <div className="w-full h-full flex flex-col items-center justify-center"
      style={{ background: "linear-gradient(160deg,#fdf5f6,#f0dde2)" }}>
      <svg viewBox="0 0 80 35" style={{ width: 64, marginBottom: 10, opacity: 0.4 }} fill="none">
        <path d="M40 30 Q28 22 16 25 Q22 14 38 18" stroke="#b8758a" strokeWidth="0.8"/>
        <path d="M40 30 Q52 22 64 25 Q58 14 42 18" stroke="#b8758a" strokeWidth="0.8"/>
        <path d="M37 18 Q35 8 40 3 Q45 8 43 18" stroke="#b8758a" strokeWidth="0.8"/>
      </svg>
      <p className="font-serif font-light tracking-widest" style={{ fontSize: "clamp(14px,2.5vw,20px)", color: "#3d1f28" }}>Kim</p>
      <span style={{ color: "#c9a96e", fontSize: 10, margin: "3px 0" }}>♥</span>
      <p className="font-serif font-light tracking-widest" style={{ fontSize: "clamp(14px,2.5vw,20px)", color: "#3d1f28" }}>Lee</p>
      <div className="flex gap-1.5 mt-3">
        {[-3, 2, -2].map((rot, i) => (
          <div key={i} className="bg-white shadow-sm p-0.5"
            style={{ transform: `rotate(${rot}deg)`, width: 24, height: 30 }}>
            <div style={{ background: "#f3f4f6", width: "100%", height: 20 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TemplateList() {
  const searchParams = useSearchParams();
  const fileParam = searchParams.get("file") ?? "";
  const [selectedFile, setSelectedFile] = useState(fileParam);
  const [clientList, setClientList] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/clients").then(r => r.json()).then(setClientList).catch(() => {});
  }, []);

  const active = !!selectedFile;

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* 액션바 */}
      <div className="sticky top-14 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between gap-3">
          <h1 className="text-sm font-semibold text-gray-700">템플릿 선택</h1>
          <Link href="/admin/setup"
            className="text-xs px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 bg-white">
            + 새 고객
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex gap-6 items-start">

        {/* ── 사이드바 ── */}
        <aside className="w-56 shrink-0 sticky top-[104px] hidden lg:flex flex-col gap-4">

          {/* 고객 선택 */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-gray-50 bg-gray-50/60">
              <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase">고객 선택</p>
            </div>
            <div className="p-3 space-y-2">
              <input
                className="w-full px-2.5 py-2 text-[11px] font-mono border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-white"
                placeholder="파일명 직접 입력"
                value={selectedFile}
                onChange={e => setSelectedFile(e.target.value.replace(/[^a-z0-9-_]/gi, "").toLowerCase())}
              />
              {clientList.length > 0 && (
                <div className="space-y-0.5 max-h-48 overflow-y-auto">
                  {clientList.map(f => (
                    <button key={f} onClick={() => setSelectedFile(f)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-mono transition-colors ${
                        selectedFile === f ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"
                      }`}>
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 공유 링크 */}
          {active && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-50 bg-gray-50/60">
                <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase">공유 링크</p>
              </div>
              <div className="p-3 space-y-1">
                {TEMPLATES.map(t => (
                  <a key={t.id} href={`/invite/${t.id}?file=${selectedFile}`} target="_blank"
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50 group">
                    <span className="text-[11px] text-gray-500">{t.name}</span>
                    <span className="text-[10px] text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* 설정으로 이동 */}
          {active && (
            <Link href={`/admin/setup?file=${selectedFile}`}
              className="flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-gray-100 text-xs text-gray-600 hover:bg-gray-50 group">
              <span>데이터 편집</span>
              <span className="text-gray-300 group-hover:text-gray-500">→</span>
            </Link>
          )}
        </aside>

        {/* ── 메인 ── */}
        <div className="flex-1 min-w-0">

          {/* 모바일 고객 선택 */}
          <div className="lg:hidden mb-4 bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase mb-3">고객 선택</p>
            <div className="flex gap-2 mb-2">
              <input
                className="flex-1 px-3 py-2 text-xs font-mono border border-gray-200 rounded-lg outline-none focus:border-blue-400"
                placeholder="파일명 입력 (예: kim-minjun)"
                value={selectedFile}
                onChange={e => setSelectedFile(e.target.value.replace(/[^a-z0-9-_]/gi, "").toLowerCase())}
              />
              {active && (
                <Link href={`/admin/setup?file=${selectedFile}`}
                  className="px-3 py-2 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 whitespace-nowrap">
                  편집
                </Link>
              )}
            </div>
            {clientList.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {clientList.map(f => (
                  <button key={f} onClick={() => setSelectedFile(f)}
                    className={`px-2.5 py-1 text-[11px] font-mono rounded-full border transition-colors ${
                      selectedFile === f ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-600"
                    }`}>
                    {f}
                  </button>
                ))}
              </div>
            )}
            {!active && (
              <p className="text-[10px] text-amber-500 mt-2">고객을 선택해야 미리보기 링크가 활성화됩니다</p>
            )}
          </div>

          {/* 템플릿 그리드 */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            {TEMPLATES.map(t => (
              <div key={t.id}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                {/* 프리뷰 */}
                <div className="relative" style={{ height: "clamp(160px,22vw,260px)" }}>
                  <TemplatePreview id={t.id} />
                  {/* 호버 오버레이 */}
                  {active && (
                    <a href={`/invite/${t.id}?file=${selectedFile}`} target="_blank"
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: "rgba(0,0,0,0.45)" }}>
                      <span className="text-white text-xs tracking-widest border border-white/40 px-4 py-1.5 rounded-full">
                        미리보기 ↗
                      </span>
                    </a>
                  )}
                </div>

                {/* 카드 정보 */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-sm text-gray-800">{t.name}</p>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{t.mood}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mb-3 leading-relaxed">{t.desc}</p>
                  <a
                    href={active ? `/invite/${t.id}?file=${selectedFile}` : "#"}
                    target={active ? "_blank" : undefined}
                    onClick={!active ? e => e.preventDefault() : undefined}
                    className={`block w-full py-2 text-center text-xs rounded-xl font-medium transition-colors ${
                      active
                        ? "bg-gray-900 text-white hover:bg-gray-700"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {active ? "이 템플릿으로 보기" : "고객 선택 필요"}
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* 모바일 공유 링크 */}
          {active && (
            <div className="lg:hidden mt-4 bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/60">
                <p className="text-xs font-semibold text-gray-500 tracking-widest uppercase">공유 링크</p>
              </div>
              <div className="p-4 space-y-2">
                {TEMPLATES.map(t => (
                  <div key={t.id} className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">{t.name}</span>
                    <a href={`/invite/${t.id}?file=${selectedFile}`} target="_blank"
                      className="text-blue-500 hover:underline font-mono text-[10px]">
                      /invite/{t.id}?file={selectedFile}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

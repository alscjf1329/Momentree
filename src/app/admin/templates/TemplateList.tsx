"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import type { WeddingData } from "@/types";
import { DEFAULT_WEDDING_DATA, generateFilename, LAST_FILE_KEY } from "@/lib/newClient";

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
  {
    id: "twilight",
    name: "트와이라잇",
    mood: "시네마틱 다크",
    desc: "별빛 + 블루퍼플 무드 + 무디 갤러리",
    bg: "linear-gradient(160deg,#080a14 0%,#0e1230 100%)",
  },
  {
    id: "blossom",
    name: "블로섬",
    mood: "봄 벚꽃",
    desc: "떨어지는 꽃잎 + 플로럴 라인아트",
    bg: "linear-gradient(160deg,#fdf0f4 0%,#f8e4ec 100%)",
  },
  {
    id: "modern",
    name: "모던",
    mood: "인스타 감성",
    desc: "웜톤 풀블리드 + 인스타그램 갤러리 그리드",
    bg: "linear-gradient(160deg,#f5efe7 0%,#e8d8c8 100%)",
  },
  {
    id: "luxury",
    name: "럭셔리",
    mood: "프리미엄 네이비",
    desc: "딥 네이비 + 골드 코너 프레임 + 샴페인",
    bg: "linear-gradient(160deg,#070d1a 0%,#0e1628 100%)",
  },
  {
    id: "garden",
    name: "가든",
    mood: "풀 + 화이트",
    desc: "풀숲 풀블리드 히어로 + 캘리그래피 + 화이트 그리드 갤러리",
    bg: "linear-gradient(160deg,#eaf0e4 0%,#d6e2cc 100%)",
  },
  {
    id: "mono",
    name: "모노",
    mood: "블랙 + 화이트",
    desc: "흑백 그레이스케일 풀블리드 히어로 + 미니멀 타이포그래피",
    bg: "linear-gradient(160deg,#ffffff 0%,#d9d9d9 100%)",
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
  if (id === "romantic") return (
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
  if (id === "twilight") return (
    <div className="w-full h-full flex flex-col justify-center px-5 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg,#080a14,#0e1230)" }}>
      {/* stars */}
      {[{x:15,y:18},{x:42,y:9},{x:68,y:22},{x:85,y:12},{x:30,y:35},{x:78,y:40}].map((s,i) => (
        <div key={i} className="absolute rounded-full bg-white" style={{ left:`${s.x}%`, top:`${s.y}%`, width:i%2===0?2:1, height:i%2===0?2:1, opacity:0.4 }} />
      ))}
      <p style={{ fontSize: 7, letterSpacing: "0.6em", color: "rgba(139,158,196,0.4)", marginBottom: 14 }}>INVITATION</p>
      <p className="font-serif font-light tracking-widest text-white" style={{ fontSize: "clamp(14px,2.5vw,20px)", opacity: 0.9 }}>Kim</p>
      <span style={{ color: "rgba(139,158,196,0.55)", fontSize: 12, margin: "4px 0" }}>✦</span>
      <p className="font-serif font-light tracking-widest text-white" style={{ fontSize: "clamp(14px,2.5vw,20px)", opacity: 0.9 }}>Lee</p>
      <div style={{ width: 28, height: 1, background: "rgba(139,158,196,0.25)", marginTop: 14 }} />
      <p style={{ fontSize: 7, letterSpacing: "0.3em", color: "rgba(200,210,232,0.3)", marginTop: 8 }}>2025.10.18</p>
    </div>
  );
  if (id === "blossom") return (
    <div className="w-full h-full flex flex-col items-center justify-center"
      style={{ background: "linear-gradient(160deg,#fdf0f4,#f8e4ec)" }}>
      <svg viewBox="0 0 80 36" style={{ width: 60, marginBottom: 8, opacity: 0.35 }} fill="none">
        <path d="M40 30 Q26 20 14 24 Q22 11 38 17" stroke="#c4758a" strokeWidth="1"/>
        <path d="M40 30 Q54 20 66 24 Q58 11 42 17" stroke="#c4758a" strokeWidth="1"/>
        <path d="M38 17 Q35 7 40 2 Q45 7 42 17" stroke="#c4758a" strokeWidth="1"/>
      </svg>
      <p className="font-serif font-light tracking-widest" style={{ fontSize: "clamp(14px,2.5vw,20px)", color: "#3a2030" }}>Kim</p>
      <span style={{ color: "#c4758a", fontSize: 12, margin: "4px 0" }}>♡</span>
      <p className="font-serif font-light tracking-widest" style={{ fontSize: "clamp(14px,2.5vw,20px)", color: "#3a2030" }}>Lee</p>
      <p style={{ fontSize: 7, letterSpacing: "0.3em", color: "rgba(58,32,48,0.35)", marginTop: 10 }}>2025.10.18</p>
    </div>
  );
  if (id === "modern") return (
    <div className="w-full h-full flex flex-col" style={{ background: "#f0e8dc" }}>
      {/* top half: warm bg */}
      <div className="flex-1" style={{ background: "linear-gradient(160deg,#ddd0c0,#c8b8a0)" }} />
      {/* bottom: text block */}
      <div className="px-4 py-3" style={{ background: "#f5efe7" }}>
        <p style={{ fontSize: 7, letterSpacing: "0.5em", color: "rgba(45,30,18,0.35)", marginBottom: 5 }}>WEDDING</p>
        <p className="font-serif font-light" style={{ fontSize: "clamp(16px,3vw,22px)", color: "#2d1e12", letterSpacing: "0.08em", lineHeight: 1.2 }}>Kim</p>
        <p style={{ color: "rgba(45,30,18,0.2)", fontSize: 12, letterSpacing: "0.3em", margin: "1px 0" }}>&amp;</p>
        <p className="font-serif font-light" style={{ fontSize: "clamp(16px,3vw,22px)", color: "#2d1e12", letterSpacing: "0.08em", lineHeight: 1.2 }}>Lee</p>
      </div>
    </div>
  );
  if (id === "luxury") return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(160deg,#070d1a,#0e1628)" }}>
      {/* corner lines */}
      {[["top-2 left-2"],["top-2 right-2"],["bottom-2 left-2"],["bottom-2 right-2"]].map(([cls],i) => (
        <div key={i} className={`absolute ${cls}`} style={{ opacity:0.25 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M0 0 L8 0 L8 1 M0 0 L0 8 L1 8" stroke="#c9a96e" strokeWidth="0.8"/>
          </svg>
        </div>
      ))}
      <div style={{ width: 40, height: 1, background: "rgba(201,169,110,0.25)", marginBottom: 12 }} />
      <p className="font-serif font-light tracking-widest text-white" style={{ fontSize: "clamp(13px,2.2vw,18px)", opacity: 0.85 }}>Kim</p>
      <span style={{ color: "rgba(201,169,110,0.5)", fontSize: 10, margin: "5px 0" }}>✦</span>
      <p className="font-serif font-light tracking-widest text-white" style={{ fontSize: "clamp(13px,2.2vw,18px)", opacity: 0.85 }}>Lee</p>
      <div style={{ width: 40, height: 1, background: "rgba(201,169,110,0.25)", marginTop: 12, marginBottom: 8 }} />
      <p style={{ fontSize: 7, letterSpacing: "0.3em", color: "rgba(201,169,110,0.35)" }}>2025.10.18</p>
    </div>
  );
  if (id === "garden") return (
    <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(160deg,#eaf0e4,#d6e2cc)" }}>
      <svg viewBox="0 0 160 40" width="70" style={{ opacity: 0.5, marginBottom: 8 }} fill="none">
        <path d="M80 33 Q54 24 28 28 Q40 14 68 20" stroke="#6e8a5e" strokeWidth="1.2"/>
        <path d="M80 33 Q106 24 132 28 Q120 14 92 20" stroke="#6e8a5e" strokeWidth="1.2"/>
        <path d="M68 20 Q64 8 80 2 Q96 8 92 20" stroke="#6e8a5e" strokeWidth="1.2"/>
      </svg>
      <p style={{ fontFamily: "'Sacramento',cursive", fontSize: 26, color: "#8a7a3a" }}>married</p>
      <p style={{ fontSize: 7, letterSpacing: "0.3em", color: "rgba(44,50,38,0.4)", marginTop: 8 }}>2025.10.18</p>
    </div>
  );
  // mono
  return (
    <div className="w-full h-full flex flex-col items-center justify-center" style={{ background: "#fff" }}>
      <div style={{ width: 28, height: 1, background: "#111", marginBottom: 12 }} />
      <p className="font-serif font-medium tracking-[0.15em] text-black" style={{ fontSize: "clamp(13px,2.2vw,18px)" }}>KIM</p>
      <p style={{ fontSize: 9, letterSpacing: "0.3em", color: "#999", margin: "4px 0" }}>&amp;</p>
      <p className="font-serif font-medium tracking-[0.15em] text-black" style={{ fontSize: "clamp(13px,2.2vw,18px)" }}>LEE</p>
      <div style={{ width: 28, height: 1, background: "#111", marginTop: 12, marginBottom: 8 }} />
      <p style={{ fontSize: 7, letterSpacing: "0.3em", color: "#999" }}>2025.10.18</p>
    </div>
  );
}

export default function TemplateList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fileParam = searchParams.get("file") ?? "";
  const [selectedFile, setSelectedFile] = useState(fileParam);
  const [clientList, setClientList] = useState<string[]>([]);
  const [selecting, setSelecting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [role, setRole] = useState<"admin" | "customer" | null>(null); // null = 아직 확인 전
  const isCustomer = role === "customer";

  useEffect(() => {
    fetch("/api/admin/auth/me").then(r => r.ok ? r.json() : null).then(me => {
      if (me?.role === "customer" && me.file) {
        setRole("customer");
        setSelectedFile(me.file);
      } else {
        setRole("admin");
      }
    }).catch(() => setRole("admin"));
  }, []);

  useEffect(() => {
    if (role !== "admin") return; // role 확인 전이거나 customer면 관리자 전용 목록을 건드리지 않음
    fetch("/api/clients").then(r => r.json()).then(setClientList).catch(() => {});
  }, [role]);

  const active = !!selectedFile;

  // 템플릿 카드를 고르면: 기존 고객이면 template 필드만 바꿔 저장, 신규면 고객을 새로 만들고
  // 저장한 뒤 변수 입력(/admin/setup)으로 이동. 나머지 값은 그대로 유지되므로
  // 나중에 템플릿을 다시 바꿔도 이미 입력한 공통 정보는 사라지지 않는다.
  const selectTemplate = async (templateId: string) => {
    setSelecting(templateId);
    setError("");
    try {
      let filename = selectedFile;
      let data: WeddingData;

      if (filename) {
        const res = await fetch(`/api/clients?file=${filename}`);
        data = res.ok ? await res.json() : { ...DEFAULT_WEDDING_DATA };
      } else {
        filename = generateFilename();
        data = { ...DEFAULT_WEDDING_DATA };
      }

      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, data: { ...data, template: templateId, slug: filename } }),
      });
      if (!res.ok) throw new Error("저장에 실패했습니다");

      localStorage.setItem(LAST_FILE_KEY, filename);
      router.push(`/admin/setup?file=${filename}`);
    } catch {
      setError("템플릿을 저장하지 못했습니다. 다시 시도해주세요.");
      setSelecting(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* 액션바 */}
      <div className="sticky top-14 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-sm font-semibold text-gray-700">템플릿 선택</h1>
            <p className="text-[10px] text-gray-400 hidden sm:block">
              {active
                ? `"${selectedFile}" 고객의 템플릿을 바꿉니다 — 이미 입력한 정보는 유지됩니다`
                : isCustomer
                ? "템플릿을 먼저 고르면 변수 입력 화면으로 이동합니다"
                : "템플릿을 먼저 고르면 변수 입력 화면으로 이동합니다 · 고객은 이메일 로그인만으로도 스스로 계정을 만들 수 있어요 — 여기서는 직접 대신 만들어줄 때만 사용하세요"}
            </p>
          </div>
          {role === "admin" && (
            <button onClick={() => setSelectedFile("")}
              className="text-xs px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 bg-white shrink-0">
              + 새 고객
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex gap-6 items-start">

        {/* ── 사이드바 ── */}
        <aside className="w-56 shrink-0 sticky top-[104px] hidden lg:flex flex-col gap-4">

          {/* 고객 선택 */}
          {role === "admin" && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-gray-50 bg-gray-50/60">
              <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase">고객 선택</p>
            </div>
            <div className="p-3 space-y-2">
              <input
                className="w-full px-2.5 py-2 text-[11px] font-mono border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-white"
                placeholder="파일명 직접 입력"
                value={selectedFile}
                onChange={e => setSelectedFile(e.target.value.replace(/[^a-zA-Z0-9.@_+-]/g, ""))}
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
          )}

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
          {role === "admin" && (
          <div className="lg:hidden mb-4 bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase mb-3">고객 선택</p>
            <div className="flex gap-2 mb-2">
              <input
                className="flex-1 px-3 py-2 text-xs font-mono border border-gray-200 rounded-lg outline-none focus:border-blue-400"
                placeholder="파일명 입력 (예: kim-minjun)"
                value={selectedFile}
                onChange={e => setSelectedFile(e.target.value.replace(/[^a-zA-Z0-9.@_+-]/g, ""))}
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
          )}

          {error && (
            <p className="text-xs text-red-500 mb-3">{error}</p>
          )}

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
                  <button
                    onClick={() => selectTemplate(t.id)}
                    disabled={selecting !== null}
                    className="block w-full py-2 text-center text-xs rounded-xl font-medium transition-colors bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-50"
                  >
                    {selecting === t.id ? "저장 중…" : active ? "이 템플릿 선택" : "이 템플릿으로 시작하기"}
                  </button>
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

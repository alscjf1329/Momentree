"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useInviteQuery } from "@/lib/useShareId";
import { useClientDirectory } from "@/lib/useClientDirectory";
import { tplPickedKey } from "@/lib/onboarding";
import { TEMPLATE_NAMES } from "@/lib/templateNames";
import type { WeddingData } from "@/types";
import { DEFAULT_WEDDING_DATA, LAST_FILE_KEY, upcomingWeddingDate } from "@/lib/newClient";

const TEMPLATE_DEFS = [
  {
    id: "mono",
    mood: "블랙 + 화이트",
    desc: "흑백 그레이스케일 풀블리드 히어로 + 미니멀 타이포그래피",
    bg: "linear-gradient(160deg,#ffffff 0%,#d9d9d9 100%)",
  },
];

const TEMPLATES = TEMPLATE_DEFS.map(t => ({ ...t, name: TEMPLATE_NAMES[t.id] }));

function TemplatePreview({ id }: { id: string }) {
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
  const inviteQuery = useInviteQuery(selectedFile);
  const dir = useClientDirectory();
  const [selecting, setSelecting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [current, setCurrent] = useState(""); // 지금 쓰는 템플릿
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
  }, [role]);

  const active = !!selectedFile;

  useEffect(() => {
    if (!selectedFile) { setCurrent(""); return; }
    fetch(`/api/clients?file=${encodeURIComponent(selectedFile)}`).then(r => r.ok ? r.json() : null).then(d => setCurrent(d?.template ?? "")).catch(() => {});
  }, [selectedFile]);

  const list = TEMPLATES;
  const visible = list;

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
        const res = await fetch(`/api/clients?file=${encodeURIComponent(filename)}`);
        data = res.ok ? await res.json() : { ...DEFAULT_WEDDING_DATA };
      } else {
        filename = ""; // 서버가 발급
        data = { ...DEFAULT_WEDDING_DATA, date: upcomingWeddingDate() };
      }

      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, data: { ...data, template: templateId, slug: filename } }),
      });
      if (!res.ok) throw new Error("저장에 실패했습니다");
      if (!filename) filename = (await res.json()).file as string;

      localStorage.setItem(LAST_FILE_KEY, filename);
      localStorage.setItem(tplPickedKey(filename), "1"); // 온보딩 체크리스트: 템플릿을 직접 골랐음
      router.push(`/admin/setup?file=${encodeURIComponent(filename)}`);
    } catch {
      setError("템플릿을 저장하지 못했습니다. 다시 시도해주세요.");
      setSelecting(null);
    }
  };

  return (
    <div className="bg-white min-h-[calc(100dvh-56px)]">
      {/* 액션바 */}
      <div className="sticky top-14 z-40 bg-white/95 backdrop-blur-sm border-b border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-[17px] font-bold">템플릿</h1>
            <p className="text-xs text-sub hidden sm:block">
              {active
                ? (isCustomer ? "청첩장 템플릿을 바꿉니다 — 이미 입력한 정보는 그대로 유지돼요" : `"${selectedFile}" 고객의 템플릿을 바꿉니다 — 이미 입력한 정보는 유지됩니다`)
                : isCustomer
                ? "템플릿을 먼저 고르면 변수 입력 화면으로 이동합니다"
                : "템플릿을 먼저 고르면 변수 입력 화면으로 이동합니다 · 고객은 이메일 로그인만으로도 스스로 계정을 만들 수 있어요 — 여기서는 직접 대신 만들어줄 때만 사용하세요"}
            </p>
          </div>
          {role === "admin" && (
            <button onClick={() => setSelectedFile("")}
              className="text-xs px-3 py-1.5 border border-[#d4d4d4] text-ink rounded-lg hover:bg-soft bg-white shrink-0">
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
          <div className="bg-white rounded-2xl border border-line overflow-hidden">
            <div className="px-4 py-2.5 border-b border-line bg-soft">
              <p className="text-[10px] font-semibold text-sub tracking-widest uppercase">고객 선택</p>
            </div>
            <div className="p-3 space-y-2">
              <input
                className="w-full px-2.5 py-2 text-[11px] font-mono border border-[#d4d4d4] rounded-lg outline-none focus:border-ink bg-white"
                placeholder="파일명 직접 입력"
                value={selectedFile}
                onChange={e => setSelectedFile(e.target.value.replace(/[^a-zA-Z0-9.@_+-]/g, ""))}
              />
              {dir.total > 0 && (
                <div className="space-y-0.5 max-h-48 overflow-y-auto">
                  <input className="w-full mb-1 px-3 py-1.5 text-[11px] border border-[#d4d4d4] rounded-lg"
                    placeholder="이름·이메일·파일명 검색" value={dir.q} onChange={e => dir.setQ(e.target.value)} />
                  {dir.clients.map(c => (
                    <button key={c.file} onClick={() => setSelectedFile(c.file)} title={c.file}
                      className={`w-full text-left px-3 py-2 rounded-lg text-[11px] transition-colors ${
                        selectedFile === c.file ? "bg-ink text-white" : "text-ink hover:bg-soft"
                      }`}>
                      {dir.display(c)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          )}

          {/* 공유 링크 */}
          {active && (
            <div className="bg-white rounded-2xl border border-line overflow-hidden">
              <div className="px-4 py-2.5 border-b border-line bg-soft">
                <p className="text-[10px] font-semibold text-sub tracking-widest uppercase">공유 링크</p>
              </div>
              <div className="p-3 space-y-1">
                {list.map(t => (
                  <a key={t.id} href={`/invite/${t.id}?${inviteQuery}`} target="_blank"
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-soft group">
                    <span className="text-[11px] text-sub">{t.name}</span>
                    <span className="text-[10px] text-ink opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* 설정으로 이동 */}
          {active && (
            <Link href={`/admin/setup?file=${encodeURIComponent(selectedFile)}`}
              className="flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-line text-xs text-ink hover:bg-soft group">
              <span>데이터 편집</span>
              <span className="text-sub group-hover:text-sub">→</span>
            </Link>
          )}
        </aside>

        {/* ── 메인 ── */}
        <div className="flex-1 min-w-0">

          {/* 모바일 고객 선택 */}
          {role === "admin" && (
          <div className="lg:hidden mb-4 bg-white rounded-2xl border border-line p-4">
            <p className="text-[10px] font-semibold text-sub tracking-widest uppercase mb-3">고객 선택</p>
            <div className="flex gap-2 mb-2">
              <input
                className="flex-1 px-3 py-2 text-xs font-mono border border-[#d4d4d4] rounded-lg outline-none focus:border-ink"
                placeholder="파일명 입력 (예: kim-minjun)"
                value={selectedFile}
                onChange={e => setSelectedFile(e.target.value.replace(/[^a-zA-Z0-9.@_+-]/g, ""))}
              />
              {active && (
                <Link href={`/admin/setup?file=${encodeURIComponent(selectedFile)}`}
                  className="px-3 py-2 text-xs bg-[#f2f2f2] text-ink rounded-lg hover:bg-gray-200 whitespace-nowrap">
                  편집
                </Link>
              )}
            </div>
            {dir.total > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {dir.clients.map(c => (
                  <button key={c.file} onClick={() => setSelectedFile(c.file)} title={c.file}
                    className={`px-2.5 py-1 text-[11px] rounded-full border transition-colors ${
                      selectedFile === c.file ? "bg-ink text-white border-ink" : "border-[#d4d4d4] text-ink"
                    }`}>
                    {dir.display(c)}
                  </button>
                ))}
              </div>
            )}
            {!active && (
              <p className="text-[10px] text-[#8a4b00] mt-2">고객을 선택해야 미리보기 링크가 활성화됩니다</p>
            )}
          </div>
          )}

          {error && (
            <p className="text-xs text-[#b42318] mb-3">{error}</p>
          )}
          {/* 템플릿 그리드 */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {visible.map(t => (
              <div key={t.id}
                className="bg-white rounded-[18px] border border-line overflow-hidden transition-all group">
                {/* 프리뷰 */}
                <div className="relative aspect-[4/5]">
                  <TemplatePreview id={t.id} />
                  {/* 호버 오버레이 */}
                  {active && (
                    <a href={`/invite/${t.id}?${inviteQuery}`} target="_blank"
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: "rgba(0,0,0,0.45)" }}>
                      <span className="text-white text-xs tracking-widest border border-white/40 px-4 py-1.5 rounded-full">
                        미리보기 ↗
                      </span>
                    </a>
                  )}
                </div>

                {/* 카드 정보 */}
                <div className="p-3.5">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-sm text-ink">{t.name}{t.id === current &&<span className="ml-2 text-[9px] px-1.5 py-0.5 rounded-full bg-green-50 text-green-600 align-middle whitespace-nowrap">사용 중</span>}</p>
                    <span className="hidden sm:inline text-[9px] px-2 py-0.5 rounded-full bg-[#f2f2f2] text-sub whitespace-nowrap">{t.mood}</span>
                  </div>
                  <p className="text-[10px] text-sub mb-3 leading-relaxed">{t.desc}</p>
                  <button
                    onClick={() => selectTemplate(t.id)}
                    disabled={selecting !== null || t.id === current}
                    className="block w-full h-11 text-center text-sm rounded-full font-bold transition-colors bg-ink text-white hover:opacity-90 disabled:opacity-40"
                  >
                    {selecting === t.id ? "저장 중…" : t.id === current ? "지금 쓰는 템플릿" : active ? "이 템플릿 선택" : "이 템플릿으로 시작하기"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 모바일 공유 링크 */}
          {active && (
            <div className="lg:hidden mt-4 bg-white rounded-2xl border border-line overflow-hidden">
              <div className="px-5 py-3 border-b border-line bg-soft">
                <p className="text-xs font-semibold text-sub tracking-widest uppercase">공유 링크</p>
              </div>
              <div className="p-4 space-y-2">
                {list.map(t => (
                  <div key={t.id} className="flex items-center justify-between text-xs">
                    <span className="text-sub">{t.name}</span>
                    <a href={`/invite/${t.id}?${inviteQuery}`} target="_blank"
                      className="text-ink underline hover:underline font-mono text-[10px]">
                      /invite/{t.id}?{inviteQuery}
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

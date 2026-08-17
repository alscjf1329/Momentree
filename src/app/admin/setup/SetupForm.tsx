"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { WeddingData } from "@/types";
import { setByPath, validateBySchema } from "@/lib/schema";
import { getSchemaForTemplate } from "@/lib/templateSchemas";
import { DEFAULT_WEDDING_DATA, generateFilename, namesToSlug } from "@/lib/newClient";
import AdminForm from "@/components/admin/AdminForm";
import PreviewPane from "@/components/admin/PreviewPane";
import ShareLinkCard from "@/components/admin/ShareLinkCard";

const DEFAULT_DATA = DEFAULT_WEDDING_DATA;
const TEMPLATES = ["classic", "editorial", "minimal", "romantic", "twilight", "blossom", "modern", "luxury", "garden", "mono"] as const;
const LS_KEY = "momentree_last_file";

export default function SetupForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fileParam = searchParams.get("file") ?? "";

  // 서버/클라이언트 동일한 초기값 — Date.now() 는 useEffect 에서만 호출
  const [filename, setFilename] = useState(fileParam);
  const [data, setData] = useState<WeddingData>(DEFAULT_DATA);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [clientList, setClientList] = useState<string[]>([]);
  const [role, setRole] = useState<"admin" | "customer" | null>(null); // null = 아직 확인 전
  const isCustomer = role === "customer";

  const schema = getSchemaForTemplate(data.template);
  const errors = validateBySchema(schema, data);

  const loadFile = useCallback(async (f: string) => {
    if (!f) return;
    const res = await fetch(`/api/clients?file=${f}`);
    if (res.ok) {
      setData(await res.json());
      setFilename(f);
      localStorage.setItem(LS_KEY, f);
    }
  }, []);

  useEffect(() => {
    fetch("/api/admin/auth/me").then(r => r.ok ? r.json() : null).then(me => {
      if (me?.role === "customer" && me.file) {
        setRole("customer");
        loadFile(me.file);
      } else {
        setRole("admin");
      }
    }).catch(() => setRole("admin"));
  }, [loadFile]);

  useEffect(() => {
    if (role !== "admin") return; // role 확인 전이거나 customer면 관리자 전용 목록을 건드리지 않음
    fetch("/api/clients").then(r => r.json()).then(setClientList).catch(() => {});
  }, [role]);

  useEffect(() => {
    if (role !== "admin") return; // role 확인 전이거나 customer면 URL의 ?file= 무시, 항상 자기 파일 고정
    if (fileParam) {
      loadFile(fileParam);
    } else {
      const last = localStorage.getItem(LS_KEY);
      if (last) loadFile(last);
      else setFilename(generateFilename()); // Date.now() — 클라이언트 전용
    }
  }, [fileParam, loadFile, role]);

  const handleChange = (path: string, value: unknown) => {
    setData(prev => setByPath(prev, path, value));
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename, data: { ...data, slug: filename } }),
    });
    setSaving(false);
    if (res.ok) {
      setSaved(true);
      localStorage.setItem(LS_KEY, filename);
      setClientList(prev => prev.includes(filename) ? prev : [...prev, filename]);
      setTimeout(() => setSaved(false), 2500);
      router.push(`/admin/setup?file=${filename}`);
    }
  };

  const handleNewClient = () => {
    // 새 고객은 템플릿부터 먼저 고르고 오도록 유도 — 변수 입력은 그 다음 단계
    localStorage.removeItem(LS_KEY);
    router.push("/admin/templates");
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* 상단 액션바 */}
      <div className="sticky top-14 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-12 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-sm font-semibold text-gray-700 truncate">{isCustomer ? "내 정보 설정" : "고객 정보 설정"}</h1>
            {filename && role === "admin" && (
              <span className="text-[10px] font-mono bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full truncate max-w-[140px] hidden sm:block">
                {filename}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {role === "admin" && (
              <button onClick={handleNewClient}
                className="text-xs px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 bg-white">
                + 새 고객
              </button>
            )}
            <a href={`/admin/templates?file=${filename}`}
              className="text-xs px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 bg-white hidden sm:block">
              템플릿 →
            </a>
            <button onClick={handleSave} disabled={saving}
              className="text-xs px-4 py-1.5 rounded-lg font-medium text-white disabled:opacity-50 transition-colors"
              style={{ background: saved ? "#16a34a" : "#111" }}>
              {saving ? "저장 중…" : saved ? "✓ 저장됨" : "저장"}
            </button>
          </div>
        </div>
      </div>

      {/* 본문 — 사이드바 + 폼 + 미리보기 */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 flex gap-6 items-start">

        {/* ── 왼쪽 사이드바 ── */}
        <aside className="w-56 shrink-0 sticky top-[104px] hidden lg:flex flex-col gap-4">

          {/* 파일 관리 (customer는 항상 자기 파일 고정이라 편집 불필요) */}
          {role === "admin" && (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-gray-50 bg-gray-50/60">
              <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase">파일 관리</p>
            </div>
            <div className="p-3 space-y-2">
              <input
                className="w-full px-2.5 py-2 text-[11px] font-mono border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-white"
                placeholder="파일명 (영문·숫자·-)"
                value={filename}
                onChange={e => setFilename(e.target.value.replace(/[^a-zA-Z0-9.@_+-]/g, ""))}
              />
              <button
                onClick={() => setFilename(namesToSlug(data.groom.name, data.bride.name))}
                className="w-full text-[11px] py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 border border-gray-100">
                이름으로 자동생성
              </button>
            </div>
          </div>
          )}

          {/* 고객 목록 */}
          {role === "admin" && clientList.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-50 bg-gray-50/60">
                <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase">고객 목록</p>
              </div>
              <div className="p-2 space-y-0.5 max-h-48 overflow-y-auto">
                {clientList.map(f => (
                  <button key={f} onClick={() => loadFile(f)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-[11px] font-mono transition-colors ${
                      filename === f
                        ? "bg-gray-900 text-white"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 내 청첩장 QR / 공유 */}
          {filename && <ShareLinkCard template={data.template} filename={filename} />}

          {/* 공유 링크 */}
          {filename && (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-gray-50 bg-gray-50/60">
                <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase">공유 링크</p>
              </div>
              <div className="p-3 space-y-1">
                {TEMPLATES.map(t => (
                  <a key={t} href={`/invite/${t}?file=${filename}`} target="_blank"
                    className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50 group">
                    <span className="text-[11px] text-gray-500 capitalize">{t}</span>
                    <span className="text-[10px] text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* ── 가운데 폼 ── */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* 모바일 전용: 파일 선택 + 고객 목록 */}
          {role === "admin" && (
          <div className="lg:hidden space-y-3">
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase mb-3">파일 관리</p>
              <div className="flex gap-2 mb-2">
                <input
                  className="flex-1 px-3 py-2.5 text-xs font-mono border border-gray-200 rounded-lg outline-none focus:border-blue-400 bg-white"
                  placeholder="파일명 자동생성됨"
                  value={filename}
                  onChange={e => setFilename(e.target.value.replace(/[^a-zA-Z0-9.@_+-]/g, ""))}
                />
                <button
                  onClick={() => setFilename(namesToSlug(data.groom.name, data.bride.name))}
                  className="px-3 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 whitespace-nowrap">
                  자동생성
                </button>
              </div>
              {clientList.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {clientList.map(f => (
                    <button key={f} onClick={() => loadFile(f)}
                      className={`px-2.5 py-1 text-[11px] font-mono rounded-full border transition-colors ${
                        filename === f ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-600"
                      }`}>
                      {f}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          )}

          <AdminForm schema={schema} data={data} onChange={handleChange} errors={errors} />

          {/* 모바일 전용: QR / 공유 */}
          {filename && (
            <div className="lg:hidden">
              <ShareLinkCard template={data.template} filename={filename} />
            </div>
          )}

          {/* 모바일 전용: 공유 링크 */}
          {filename && (
            <div className="lg:hidden bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/60">
                <h2 className="text-xs font-semibold text-gray-500 tracking-widest uppercase">공유 링크</h2>
              </div>
              <div className="p-4 space-y-2">
                {TEMPLATES.map(t => (
                  <div key={t} className="flex items-center justify-between text-xs">
                    <span className="text-gray-500 capitalize">{t}</span>
                    <a href={`/invite/${t}?file=${filename}`} target="_blank"
                      className="text-blue-500 hover:underline font-mono text-[11px]">
                      /invite/{t}?file={filename}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>{/* /center */}

        {/* ── 오른쪽 실시간 미리보기 ── */}
        <PreviewPane template={data.template} data={data} />

      </div>{/* /layout */}
    </div>
  );
}

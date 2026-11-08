"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import type { WeddingData } from "@/types";
import { getByPath, setByPath, validateBySchema, type FieldSchema } from "@/lib/schema";
import { getSchemaForTemplate } from "@/lib/templateSchemas";
import { DEFAULT_WEDDING_DATA } from "@/lib/newClient";
import { TEMPLATE_NAMES, TEMPLATE_TINT } from "@/lib/templateNames";
import AdminForm from "@/components/admin/AdminForm";
import PreviewPane from "@/components/admin/PreviewPane";
import SubPageHeader from "@/components/admin/SubPageHeader";
import ClientSearch from "@/components/admin/ClientSearch";
import { useClientDirectory } from "@/lib/useClientDirectory";

const DEFAULT_DATA = DEFAULT_WEDDING_DATA;
const LS_KEY = "momentree_last_file";
const VIEW_TITLE = { photos: "사진 · 갤러리", accounts: "축의금 계좌" } as const;

const isEmpty = (v: unknown) => v == null || (typeof v === "string" && !v.trim()) || (Array.isArray(v) && v.every((x) => !String(x ?? "").trim()));

export default function SetupForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fileParam = searchParams.get("file") ?? "";
  const viewParam = searchParams.get("view");
  const view = viewParam === "photos" || viewParam === "accounts" ? viewParam : "main";

  // 서버/클라이언트 동일한 초기값 — Date.now() 는 useEffect 에서만 호출
  const [filename, setFilename] = useState(fileParam);
  const [data, setData] = useState<WeddingData>(DEFAULT_DATA);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const dir = useClientDirectory();
  const [role, setRole] = useState<"admin" | "customer" | null>(null); // null = 아직 확인 전
  const isCustomer = role === "customer";
  const [memberRole, setMemberRole] = useState<string | null>(null);
  const [memberCount, setMemberCount] = useState<number | null>(null);

  const schema = getSchemaForTemplate(data.template);
  const errors = validateBySchema(schema, data);

  // 운영자는 선택한 고객(?file=)을 URL에 유지한다
  const q = (extra = "") => {
    const p = new URLSearchParams(extra);
    if (!isCustomer && filename) p.set("file", filename);
    const s = p.toString();
    return s ? `?${s}` : "";
  };
  const base = `/admin/setup${q()}`;

  // 필수 항목 진행률 (최상위 필수 필드 기준)
  const required: FieldSchema[] = schema.sections.flatMap((s) => s.fields).filter((f) => f.required);
  const doneCount = required.filter((f) => !isEmpty(getByPath(data, f.key))).length;
  const allDone = required.length > 0 && doneCount === required.length;

  const loadFile = useCallback(async (f: string) => {
    if (!f) return;
    const res = await fetch(`/api/clients?file=${encodeURIComponent(f)}`);
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
        setMemberRole(me.memberRole);
        loadFile(me.file);
      } else {
        setRole("admin");
      }
    }).catch(() => setRole("admin"));
  }, [loadFile]);

  useEffect(() => {
    if (role !== "admin") return; // customer는 URL의 ?file= 무시, 항상 자기 파일 고정
    if (fileParam) {
      loadFile(fileParam);
    } else {
      const last = localStorage.getItem(LS_KEY);
      if (last) loadFile(last);
      // 새 고객이면 filename 은 비워 둔다 — 저장할 때 서버가 불변 ID를 발급한다
    }
  }, [fileParam, loadFile, role]);

  // 함께 편집 인원 (소유자·운영자만 볼 수 있음)
  useEffect(() => {
    if (!filename || !(role === "admin" || memberRole === "owner")) return;
    fetch(`/api/members${role === "admin" ? `?file=${encodeURIComponent(filename)}` : ""}`)
      .then(r => r.ok ? r.json() : null).then(m => Array.isArray(m) && setMemberCount(m.length)).catch(() => {});
  }, [filename, role, memberRole]);

  const handleChange = (path: string, value: unknown) => {
    setData(prev => setByPath(prev, path, value));
  };

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: filename || undefined, data: { ...data, slug: filename } }),
    });
    setSaving(false);
    if (res.ok) {
      const file: string = (await res.json()).file ?? filename;
      setFilename(file);
      setSaved(true);
      localStorage.setItem(LS_KEY, file);
      dir.reload();
      setTimeout(() => setSaved(false), 2500);
      // 운영자가 새 파일을 만든 경우에만 URL에 반영
      if (!isCustomer && fileParam !== file) router.replace(`/admin/setup${q(view === "main" ? "" : `view=${view}`)}`);
    }
  };

  const handleNewClient = () => {
    // 새 고객은 템플릿부터 먼저 고르고 오도록 유도 — 변수 입력은 그 다음 단계
    localStorage.removeItem(LS_KEY);
    router.push("/admin/templates");
  };

  const saveButton = (
    <button onClick={handleSave} disabled={saving}
      className="h-10 px-5 rounded-full text-sm font-bold text-white disabled:opacity-50 shrink-0 transition-colors"
      style={{ background: saved ? "#1b6b43" : "var(--color-ink)" }}>
      {saving ? "저장 중…" : saved ? "✓ 저장됨" : "저장"}
    </button>
  );

  const label = [data.groom.name, data.bride.name].map((n) => n?.trim()).filter(Boolean).join(" ♥ ");
  const tint = TEMPLATE_TINT[data.template] ?? TEMPLATE_TINT.classic;
  const dateText = data.date?.iso ? `${data.date.iso.slice(0, 10).replaceAll("-", ".")}` : "";

  return (
    <div className="bg-white min-h-[calc(100dvh-56px)]">
      {view === "main" ? (
        <div className="sticky top-14 z-40 bg-white/95 backdrop-blur-sm border-b border-line">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
            <h1 className="text-[17px] font-bold truncate">{isCustomer ? "청첩장 편집" : "고객 정보 설정"}</h1>
            <div className="flex items-center gap-2 shrink-0">
              {role === "admin" && (
                <button onClick={handleNewClient} className="h-10 px-4 rounded-full border border-[#d4d4d4] text-sm font-medium text-ink hidden sm:block">+ 새 고객</button>
              )}
              <Link href={`/admin/templates${q()}`} className="h-10 px-4 rounded-full border border-[#d4d4d4] text-sm font-medium text-ink hidden sm:inline-flex items-center">템플릿</Link>
              {saveButton}
            </div>
          </div>
        </div>
      ) : (
        <SubPageHeader title={VIEW_TITLE[view]} back={base}>{saveButton}</SubPageHeader>
      )}

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 flex gap-6 items-start">

        {/* 운영자 전용 사이드바: 파일 관리 + 고객 목록 */}
        {role === "admin" && (
          <aside className="w-60 shrink-0 sticky top-[120px] hidden lg:flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-line overflow-hidden">
              <div className="px-4 py-3 border-b border-line bg-soft"><p className="text-xs font-bold text-sub">파일 관리</p></div>
              <div className="p-3">
                <input readOnly value={filename} placeholder="저장하면 고객 ID가 발급돼요" aria-label="고객 파일 ID"
                  className="w-full px-3 h-11 text-[13px] font-mono border border-line rounded-xl bg-soft text-sub" />
              </div>
            </div>
            {dir.total > 0 && (
              <div className="bg-white rounded-2xl border border-line">
                <div className="px-4 py-3 border-b border-line bg-soft rounded-t-2xl"><p className="text-xs font-bold text-sub">고객 검색</p></div>
                <div className="p-3"><ClientSearch dir={dir} current={filename} onSelect={loadFile} /></div>
              </div>
            )}
          </aside>
        )}

        <div className="flex-1 min-w-0 space-y-5 max-w-3xl mx-auto xl:mx-0">

          {/* 운영자 모바일: 파일/고객 선택 */}
          {role === "admin" && (
            <div className="lg:hidden bg-soft rounded-2xl border border-line p-4 space-y-3">
              <input readOnly value={filename} placeholder="저장하면 고객 ID가 발급돼요" aria-label="고객 파일 ID"
                className="w-full px-3 h-11 text-sm font-mono border border-line rounded-xl bg-white text-sub" />
              {dir.total > 0 && <ClientSearch dir={dir} current={filename} onSelect={loadFile} />}
            </div>
          )}

          {/* 요약 카드 + 진행률 (메인 화면) */}
          {view === "main" && (
            <>
              <div className="flex gap-3.5 items-center">
                <div className="w-[72px] h-[92px] rounded-[14px] shrink-0 flex flex-col items-center justify-center gap-0.5 font-serif text-xs text-center px-1"
                  style={{ background: tint.bg, color: tint.fg }}>
                  <span className="truncate max-w-full">{data.groom.name || "신랑"}</span><span style={{ color: "#C2255C" }}>♥</span><span className="truncate max-w-full">{data.bride.name || "신부"}</span>
                </div>
                <div className="min-w-0 flex-1 flex flex-col gap-1.5">
                  <b className="text-lg truncate">{label || "이름을 입력해 주세요"}</b>
                  <span className="text-[13px] text-sub">{[dateText, TEMPLATE_NAMES[data.template] ?? data.template].filter(Boolean).join(" · ")}</span>
                  {(role === "admin" || memberRole === "owner") && filename && (
                    <Link href={`/admin/members${q()}`} className="text-xs underline underline-offset-[3px] text-ink w-fit min-h-[28px] inline-flex items-center">
                      함께 편집 {memberCount ?? 1}명
                    </Link>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-[13px]">
                  <b>{allDone ? "필수 항목을 모두 입력했어요" : "입력 진행률"}</b>
                  <span className="text-sub">필수 {doneCount} / {required.length}</span>
                </div>
                <div className="h-1.5 rounded-full bg-line overflow-hidden" role="progressbar" aria-valuenow={doneCount} aria-valuemax={required.length}>
                  <div className="h-full bg-ink rounded-full transition-all" style={{ width: `${required.length ? (doneCount / required.length) * 100 : 0}%` }} />
                </div>
                {allDone && filename && (
                  <Link href={`/admin/share${q()}`} className="h-11 mt-1 rounded-full border border-[#d4d4d4] text-sm font-medium text-ink flex items-center justify-center">
                    청첩장 공유하기
                  </Link>
                )}
              </div>
            </>
          )}

          <AdminForm schema={schema} data={data} onChange={handleChange} errors={errors} view={view}
            links={{ photos: `/admin/setup${q("view=photos")}`, accounts: `/admin/setup${q("view=accounts")}` }} />

          {view !== "main" && (
            <Link href={base} className="h-[52px] rounded-full bg-ink text-white text-base font-bold flex items-center justify-center">완료</Link>
          )}
        </div>

        <PreviewPane template={data.template} data={data} />
      </div>
    </div>
  );
}

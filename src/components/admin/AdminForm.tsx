"use client";

import { useEffect, useState } from "react";
import { getByPath, type FieldSchema, type TemplateSchema } from "@/lib/schema";
import { renderField } from "./FieldRenderer";
import SectionCard from "./SectionCard";
import Link from "next/link";

export default function AdminForm({
  schema,
  data,
  onChange,
  errors,
  view = "main",
  links,
}: {
  schema: TemplateSchema;
  data: unknown;
  onChange: (path: string, value: unknown) => void;
  errors?: Record<string, string>;
  /** main: 기본 입력 / photos·accounts: 따로 떼어낸 화면 (사진·갤러리, 축의금 계좌) */
  view?: "main" | "photos" | "accounts";
  /** main에서 하위 화면으로 가는 줄의 링크 */
  links?: { photos: string; accounts: string };
}) {
  const [tab, setTab] = useState<"common" | "specific">("common");
  const [narrow, setNarrow] = useState(false); // 좁은 화면: 첫 섹션만 펼치고 나머지는 접어서 시작
  const [toggled, setToggled] = useState<Record<string, boolean>>({}); // 사용자가 직접 연/닫은 섹션
  useEffect(() => { setNarrow(window.matchMedia("(max-width: 767px)").matches); }, []);

  // 사진·계좌는 입력이 길고 성격이 달라 별도 화면으로 뗀다
  const PHOTO = ["introBg", "envelopeClosed", "envelopeOpen", "gallery"];
  const ACCOUNT = ["groom.accounts", "bride.accounts"];
  const belongs = (f: FieldSchema) => (PHOTO.includes(f.key) ? "photos" : ACCOUNT.includes(f.key) ? "accounts" : "main");
  const TITLES: Record<string, string> = { "신랑 정보": "신랑측 계좌", "신부 정보": "신부측 계좌", "이미지 경로": "사진" };
  const pick = (pred: (f: FieldSchema) => boolean) =>
    schema.sections
      .map((s) => ({ ...s, title: view === "main" ? s.title : TITLES[s.title] ?? s.title, fields: s.fields.filter((f) => belongs(f) === view && pred(f)) }))
      .filter((s) => s.fields.length > 0);
  const commonSections = pick((f) => !!f.common);
  const specificSections = pick((f) => !f.common);
  // 템플릿 전용 항목이 없으면 탭 자체를 숨기고 기본 정보만 보여 준다
  const hasSpecific = specificSections.length > 0;
  const active = hasSpecific ? tab : "common";
  const sections = view !== "main" ? pick(() => true) : active === "common" ? commonSections : specificSections;

  const isEmpty = (v: unknown) => v == null || (typeof v === "string" && !v.trim()) || (Array.isArray(v) && v.every((x) => !String(x ?? "").trim()));
  const status = (fields: FieldSchema[]) => {
    // 비어 있는 필수 항목은 '남음'으로, 값은 있는데 형식이 틀린 항목만 '확인 필요'로 센다
    const errorCount = fields.filter((f) => errors?.[f.key] && !isEmpty(getByPath(data, f.key))).length;
    const missing = fields.filter((f) => f.required && isEmpty(getByPath(data, f.key))).length;
    return { errorCount, missing };
  };

  return (
    <div className="space-y-4">
      {view === "main" && hasSpecific && (
      <div className="flex gap-1 bg-[#f2f2f2] p-1 rounded-full w-fit">
        {(["common", "specific"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 h-9 text-sm rounded-full transition-colors ${
              active === t ? "bg-white text-ink font-bold shadow-sm" : "text-sub"
            }`}
          >
            {t === "common" ? "기본 정보" : `${schema.name} 전용 옵션`}
          </button>
        ))}
      </div>
      )}

      {/* 2열은 grid가 아니라 columns — grid는 한 칸을 접어도 옆 칸 높이를 따라가 빈 공간이 남는다 */}
      <div className="md:columns-2 md:gap-4">
        {sections.map((section, i) => {
          const { errorCount, missing } = status(section.fields);
          const hasRequired = section.fields.some((f) => f.required);
          const key = `${active}:${section.title}`;
          const open = toggled[key] ?? (view !== "main" || !narrow || i === 0 || errorCount > 0);
          const badge = errorCount > 0 ? { text: `확인 필요 ${errorCount}`, tone: "warn" as const }
            : missing > 0 ? { text: `필수 ${missing}개 남음`, tone: "warn" as const }
            : hasRequired ? { text: "✓ 완료", tone: "ok" as const } : undefined;
          return (
          <div key={section.title} className="mb-4 break-inside-avoid">
          <SectionCard title={section.title} open={open} badge={badge}
            onToggle={() => setToggled((t) => ({ ...t, [key]: !open }))}>
            {section.fields.map((field) =>
              renderField({ field, data, basePath: "", onChange, errors })
            )}
          </SectionCard>
          </div>
          );
        })}
        {sections.length === 0 && (
          <p className="text-sm text-sub">이 탭에 표시할 항목이 없습니다</p>
        )}
      </div>

      {view === "main" && active === "common" && links && (
        <div className="border-t border-line">
          <LinkRow href={links.photos} label="사진 · 갤러리" hint={`${(getByPath(data, "gallery") as unknown[] | undefined)?.length ?? 0}장`} />
          <LinkRow href={links.accounts} label="축의금 계좌"
            hint={ACCOUNT.some((k) => ((getByPath(data, k) as { number?: string }[] | undefined) ?? []).some((a) => a?.number)) ? "입력됨" : "비어 있음"} />
        </div>
      )}
    </div>
  );
}

function LinkRow({ href, label, hint }: { href: string; label: string; hint: string }) {
  return (
    <Link href={href} className="min-h-[56px] flex items-center justify-between gap-3 border-b border-line text-[15px] font-medium text-ink">
      <span>{label}</span>
      <span className="flex items-center gap-1.5 text-xs font-normal text-sub">
        {hint}
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
      </span>
    </Link>
  );
}

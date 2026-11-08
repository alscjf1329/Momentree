"use client";

import { useEffect, useState } from "react";
import { getByPath, type FieldSchema, type TemplateSchema } from "@/lib/schema";
import { renderField } from "./FieldRenderer";
import SectionCard from "./SectionCard";

export default function AdminForm({
  schema,
  data,
  onChange,
  errors,
}: {
  schema: TemplateSchema;
  data: unknown;
  onChange: (path: string, value: unknown) => void;
  errors?: Record<string, string>;
}) {
  const [tab, setTab] = useState<"common" | "specific">("common");
  const [narrow, setNarrow] = useState(false); // 좁은 화면: 첫 섹션만 펼치고 나머지는 접어서 시작
  const [toggled, setToggled] = useState<Record<string, boolean>>({}); // 사용자가 직접 연/닫은 섹션
  useEffect(() => { setNarrow(window.matchMedia("(max-width: 767px)").matches); }, []);

  const commonSections = schema.sections
    .map((s) => ({ ...s, fields: s.fields.filter((f) => f.common) }))
    .filter((s) => s.fields.length > 0);
  const specificSections = schema.sections
    .map((s) => ({ ...s, fields: s.fields.filter((f) => !f.common) }))
    .filter((s) => s.fields.length > 0);

  const sections = tab === "common" ? commonSections : specificSections;

  const isEmpty = (v: unknown) => v == null || (typeof v === "string" && !v.trim()) || (Array.isArray(v) && v.every((x) => !String(x ?? "").trim()));
  const status = (fields: FieldSchema[]) => {
    // 비어 있는 필수 항목은 '남음'으로, 값은 있는데 형식이 틀린 항목만 '확인 필요'로 센다
    const errorCount = fields.filter((f) => errors?.[f.key] && !isEmpty(getByPath(data, f.key))).length;
    const missing = fields.filter((f) => f.required && isEmpty(getByPath(data, f.key))).length;
    return { errorCount, missing };
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(["common", "specific"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              tab === t ? "bg-white text-gray-800 shadow-sm" : "text-gray-500"
            }`}
          >
            {t === "common" ? "기본 정보" : `${schema.name} 전용 옵션`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section, i) => {
          const { errorCount, missing } = status(section.fields);
          const hasRequired = section.fields.some((f) => f.required);
          const key = `${tab}:${section.title}`;
          const open = toggled[key] ?? (!narrow || i === 0 || errorCount > 0);
          const badge = errorCount > 0 ? { text: `확인 필요 ${errorCount}`, tone: "warn" as const }
            : missing > 0 ? { text: `필수 ${missing}개 남음`, tone: "warn" as const }
            : hasRequired ? { text: "✓ 완료", tone: "ok" as const } : undefined;
          return (
          <SectionCard key={section.title} title={section.title} open={open} badge={badge}
            onToggle={() => setToggled((t) => ({ ...t, [key]: !open }))}>
            {section.fields.map((field) =>
              renderField({ field, data, basePath: "", onChange, errors })
            )}
          </SectionCard>
          );
        })}
        {sections.length === 0 && (
          <p className="text-xs text-gray-400 col-span-full">이 탭에 표시할 필드가 없습니다</p>
        )}
      </div>
    </div>
  );
}

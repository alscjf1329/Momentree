"use client";

import { useState } from "react";
import type { TemplateSchema } from "@/lib/schema";
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

  const commonSections = schema.sections
    .map((s) => ({ ...s, fields: s.fields.filter((f) => f.common) }))
    .filter((s) => s.fields.length > 0);
  const specificSections = schema.sections
    .map((s) => ({ ...s, fields: s.fields.filter((f) => !f.common) }))
    .filter((s) => s.fields.length > 0);

  const sections = tab === "common" ? commonSections : specificSections;

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
        {sections.map((section) => (
          <SectionCard key={section.title} title={section.title}>
            {section.fields.map((field) =>
              renderField({ field, data, basePath: "", onChange, errors })
            )}
          </SectionCard>
        ))}
        {sections.length === 0 && (
          <p className="text-xs text-gray-400 col-span-full">이 탭에 표시할 필드가 없습니다</p>
        )}
      </div>
    </div>
  );
}

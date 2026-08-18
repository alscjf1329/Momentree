"use client";

import { useRef, useState } from "react";
import { Label } from "./fieldStyles";
import type { RenderFieldArgs } from "./types";

interface ArrayObjectFieldProps extends RenderFieldArgs {
  path: string;
  value: unknown;
  renderItemField: (args: RenderFieldArgs) => React.ReactNode;
}

function blankItem(itemFields: RenderFieldArgs["field"]["itemFields"]): Record<string, unknown> {
  const item: Record<string, unknown> = {};
  for (const f of itemFields ?? []) {
    item[f.key] = f.type === "array" || f.type === "array-object" ? [] : "";
  }
  return item;
}

export default function ArrayObjectField({
  field,
  path,
  value,
  onChange,
  data,
  errors,
  renderItemField,
}: ArrayObjectFieldProps) {
  const items = Array.isArray(value) ? value : [];
  const bulkInputRef = useRef<HTMLInputElement>(null);
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);

  const addItem = () => onChange(path, [...items, blankItem(field.itemFields)]);
  const removeItem = (i: number) => onChange(path, items.filter((_, idx) => idx !== i));

  const handleBulkUpload = async (files: FileList) => {
    const list = Array.from(files);
    if (list.length === 0) return;
    setBulkProgress({ done: 0, total: list.length });
    const uploaded: Record<string, unknown>[] = [];
    for (const file of list) {
      const form = new FormData();
      form.append("file", file);
      form.append("kind", "image");
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const json = await res.json();
      if (res.ok) uploaded.push({ src: json.path, alt: "" });
      setBulkProgress((p) => (p ? { ...p, done: p.done + 1 } : p));
    }
    onChange(path, [...items, ...uploaded]);
    setBulkProgress(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <Label>{field.label}</Label>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {field.bulkImageUpload && (
            <button
              type="button"
              onClick={() => bulkInputRef.current?.click()}
              disabled={!!bulkProgress}
              className="text-[11px] text-blue-500 hover:underline disabled:opacity-40"
            >
              {bulkProgress ? `업로드 중 ${bulkProgress.done}/${bulkProgress.total}` : "여러 장 한번에 추가"}
            </button>
          )}
          <button type="button" onClick={addItem} className="text-[11px] text-blue-500 hover:underline">
            + 항목 추가
          </button>
        </div>
      </div>
      {field.bulkImageUpload && (
        <input
          ref={bulkInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleBulkUpload(e.target.files);
            e.target.value = "";
          }}
        />
      )}
      {field.helpText && <p className="text-[10px] text-gray-400 mb-1">{field.helpText}</p>}
      <div className="space-y-2">
        {items.map((_, i) => (
          <div key={i} className="border border-gray-100 rounded-lg p-2.5 space-y-2 bg-gray-50/60">
            <div className="flex items-center justify-end">
              <button type="button" onClick={() => removeItem(i)} className="text-[11px] text-red-400 hover:underline">
                삭제
              </button>
            </div>
            <div className="space-y-2">
              {(field.itemFields ?? []).map((sub) =>
                renderItemField({ field: sub, data, basePath: `${path}.${i}`, onChange, errors })
              )}
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-[11px] text-gray-300">항목이 없습니다</p>}
      </div>
    </div>
  );
}

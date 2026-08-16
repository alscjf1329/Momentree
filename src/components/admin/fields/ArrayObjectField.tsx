"use client";

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

  const addItem = () => onChange(path, [...items, blankItem(field.itemFields)]);
  const removeItem = (i: number) => onChange(path, items.filter((_, idx) => idx !== i));

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <Label>{field.label}</Label>
        <button type="button" onClick={addItem} className="text-[11px] text-blue-500 hover:underline shrink-0 ml-2">
          + 항목 추가
        </button>
      </div>
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

"use client";

import { PALETTES } from "@/themes";
import type { FieldComponentProps } from "./types";

// 색상 견본 고르기: 큰 원 두 개(진한 색 + 배경색)와 이름
export default function PaletteField({ field, path, value, onChange }: FieldComponentProps) {
  const cur = value === "custom" ? "custom" : typeof value === "string" && value in PALETTES ? value : ""; // custom 이면 견본은 선택 안 됨
  return (
    <div>
      <p className="text-sm font-medium text-ink mb-2">{field.label}</p>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={field.label}>
        {Object.entries(PALETTES).map(([id, p]) => (
          <button key={id} type="button" role="radio" aria-checked={cur === id} onClick={() => onChange(path, id)}
            className={`min-h-[44px] pl-2 pr-3 rounded-full border flex items-center gap-2 text-[13px] ${cur === id ? "border-ink font-bold text-ink" : "border-line text-sub"}`}>
            <span className="flex -space-x-1.5 shrink-0">
              <span className="w-5 h-5 rounded-full border border-line" style={{ background: p.swatch[0] }} />
              <span className="w-5 h-5 rounded-full border border-line" style={{ background: p.swatch[1] }} />
            </span>
            {p.name}
          </button>
        ))}
      </div>
      {field.helpText && <p className="text-xs text-sub mt-2">{field.helpText}</p>}
    </div>
  );
}

"use client";

import { PALETTES, type CustomColors } from "@/themes";
import type { FieldComponentProps } from "./types";

const ROWS: { key: keyof CustomColors; label: string }[] = [
  { key: "bg", label: "배경색" }, { key: "text", label: "글자색" }, { key: "point", label: "포인트색" },
];

// 배경·글자·포인트 색을 직접 고른다. 하나라도 바꾸면 추천 색상 대신 이 색을 쓴다(palette = "custom").
// 처음엔 지금 고른 추천 색상의 색으로 시작한다.
export default function PaletteCustomField({ field, path, value, onChange, palette }: FieldComponentProps & { palette?: string }) {
  const base = PALETTES[palette && palette !== "custom" ? palette : ""]?.vars ?? {};
  const cur: CustomColors = {
    bg: base["--color-cream"] ?? "#ffffff", text: base["--color-text"] ?? "#1c1c1a", point: base["--color-primary"] ?? "#1c1c1a",
    ...(palette === "custom" ? (value as Partial<CustomColors> | undefined) : undefined),
  };
  const set = (key: keyof CustomColors, v: string) => {
    onChange(path, { ...cur, [key]: v });
    onChange("palette", "custom");
  };
  return (
    <div>
      <p className="text-sm font-medium text-ink mb-2">{field.label}</p>
      <div className="grid grid-cols-3 gap-2">
        {ROWS.map((r) => (
          <label key={r.key} className="flex flex-col items-center gap-1.5 text-[13px] text-sub min-w-0">
            <input type="color" value={cur[r.key]} onChange={(e) => set(r.key, e.target.value)} aria-label={r.label}
              className="w-full h-11 rounded-xl border border-line bg-white p-1 cursor-pointer" />
            <span className="truncate max-w-full">{r.label}</span>
          </label>
        ))}
      </div>
      {field.helpText && <p className="text-xs text-sub mt-2">{field.helpText}</p>}
    </div>
  );
}

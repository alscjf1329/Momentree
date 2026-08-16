"use client";

import { INPUT, Label } from "./fieldStyles";
import type { FieldComponentProps } from "./types";

export default function TextField({ field, path, value, onChange, error }: FieldComponentProps) {
  // venue.lat/lng처럼 원래 값이 number면 숫자 입력으로, 그 외엔 텍스트로 렌더링
  const isNumeric = typeof value === "number";
  return (
    <div>
      <Label>{field.label}</Label>
      <input
        className={INPUT}
        type={isNumeric ? "number" : "text"}
        step={isNumeric ? "0.0001" : undefined}
        value={typeof value === "string" || typeof value === "number" ? value : ""}
        placeholder={field.placeholder}
        onChange={(e) => onChange(path, isNumeric ? +e.target.value : e.target.value)}
      />
      {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
    </div>
  );
}

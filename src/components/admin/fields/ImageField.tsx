"use client";

import { INPUT, Label } from "./fieldStyles";
import FileDropZone from "./FileDropZone";
import type { FieldComponentProps } from "./types";

export default function ImageField({ field, path, value, onChange, error }: FieldComponentProps) {
  const current = typeof value === "string" ? value : "";
  return (
    <div>
      <Label>{field.label}</Label>
      <FileDropZone value={current} onChange={(p) => onChange(path, p)} kind="image" accept="image/*" />
      <input
        className={INPUT + " mt-2 text-xs"}
        value={current}
        placeholder={field.placeholder ?? "/images/example.jpg"}
        onChange={(e) => onChange(path, e.target.value)}
      />
      {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
    </div>
  );
}

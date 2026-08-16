"use client";

import { INPUT, Label } from "./fieldStyles";
import FileDropZone from "./FileDropZone";
import type { FieldComponentProps } from "./types";

export default function FileField({ field, path, value, onChange, error }: FieldComponentProps) {
  const current = typeof value === "string" ? value : "";
  return (
    <div>
      <Label>{field.label}</Label>
      <FileDropZone value={current} onChange={(p) => onChange(path, p)} kind="audio" accept="audio/*" />
      <input
        className={INPUT + " mt-2 text-xs"}
        value={current}
        placeholder={field.placeholder ?? "/audio/example.mp3"}
        onChange={(e) => onChange(path, e.target.value)}
      />
      {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
    </div>
  );
}

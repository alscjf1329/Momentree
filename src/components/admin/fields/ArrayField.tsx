"use client";

import { INPUT, Label } from "./fieldStyles";
import type { FieldComponentProps } from "./types";

export default function ArrayField({ field, path, value, onChange, error }: FieldComponentProps) {
  const arr = Array.isArray(value) ? (value as string[]) : [];
  return (
    <div>
      <Label>{field.label}</Label>
      {field.helpText && <p className="text-[10px] text-gray-400 -mt-0.5 mb-1">{field.helpText}</p>}
      <textarea
        className={INPUT + " resize-none"}
        rows={4}
        value={arr.join("\n")}
        placeholder={field.placeholder}
        onChange={(e) => onChange(path, e.target.value.split("\n"))}
      />
      {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
    </div>
  );
}

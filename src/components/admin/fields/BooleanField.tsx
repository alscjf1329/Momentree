"use client";

import type { FieldComponentProps } from "./types";

export default function BooleanField({ field, path, value, onChange }: FieldComponentProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-700 select-none">
      <input
        type="checkbox"
        checked={!!value}
        onChange={(e) => onChange(path, e.target.checked)}
        className="w-4 h-4 rounded border-gray-300"
      />
      {field.label}
    </label>
  );
}

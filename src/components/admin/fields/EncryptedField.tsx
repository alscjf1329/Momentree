"use client";

import { INPUT, Label } from "./fieldStyles";
import type { FieldComponentProps } from "./types";

// 표시/입력은 TextField와 동일 — 실제 암호화는 저장 시 서버(API Route)에서 스키마를 보고 처리됨.
// 자물쇠 표시만 붙여서 "저장 시 암호화되는 필드"임을 어드민에게 알려준다.
export default function EncryptedField({ field, path, value, onChange, error }: FieldComponentProps) {
  return (
    <div>
      <Label>
        <span className="inline-flex items-center gap-1">
          {field.label}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-gray-400">
            <rect x="4" y="11" width="16" height="9" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
      </Label>
      <input
        className={INPUT}
        value={typeof value === "string" ? value : ""}
        placeholder={field.placeholder}
        onChange={(e) => onChange(path, e.target.value)}
      />
      {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
    </div>
  );
}

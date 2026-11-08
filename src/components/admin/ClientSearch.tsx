"use client";

import { useState } from "react";
import type { useClientDirectory } from "@/lib/useClientDirectory";

// 운영자용 고객 검색창: 이메일·고객ID·파일명·이름으로 찾아 고르면 onSelect(file)
export default function ClientSearch({ dir, current, onSelect }: {
  dir: ReturnType<typeof useClientDirectory>;
  current: string;
  onSelect: (file: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const list = dir.clients.slice(0, 8);

  return (
    <div className="relative">
      <input type="search" value={dir.q} placeholder="이메일 · 고객ID · 파일명 · 이름으로 검색"
        aria-label="고객 검색" autoComplete="off"
        onChange={(e) => { dir.setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="w-full h-11 border border-[#d4d4d4] focus:border-ink outline-none rounded-xl px-3 text-base bg-white" />
      {current && !open && <p className="mt-2 text-xs text-sub truncate">선택됨 · <span className="font-mono text-ink">{current}</span></p>}
      {open && (
        <ul className="absolute z-30 left-0 right-0 mt-1 max-h-72 overflow-y-auto bg-white border border-line rounded-xl shadow-lg p-1">
          {list.length === 0 ? (
            <li className="px-3 py-3 text-[13px] text-sub">검색 결과가 없어요</li>
          ) : list.map((c) => (
            <li key={c.file}>
              <button type="button" onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onSelect(c.file); dir.setQ(""); setOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-[13px] hover:bg-soft ${current === c.file ? "bg-soft font-medium" : ""}`}>
                <span className="block truncate text-ink">{c.label || c.file}</span>
                <span className="block truncate text-xs text-sub font-mono">{c.owner || c.file} · {c.shareId}</span>
              </button>
            </li>
          ))}
          {dir.clients.length > list.length && <li className="px-3 py-2 text-xs text-sub">{dir.clients.length - list.length}건 더 있어요 — 더 입력해 좁혀 보세요</li>}
        </ul>
      )}
    </div>
  );
}

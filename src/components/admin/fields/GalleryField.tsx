"use client";

import { useRef, useState } from "react";
import { Label } from "./fieldStyles";
import { uploadFile } from "@/lib/uploadClient";
import type { FieldComponentProps } from "./types";

interface GalleryItem {
  src: string;
  alt: string;
}

// bulkImageUpload array-object 전용(현재는 갤러리) — 3열 격자, 여러 장 업로드, ◀ ▶ 로 순서 변경
export default function GalleryField({ field, path, value, onChange }: FieldComponentProps) {
  const items = (Array.isArray(value) ? value : []) as GalleryItem[];
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
  const [failed, setFailed] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) return;
    setFailed(0);
    setUploading({ done: 0, total: list.length });
    const uploaded: GalleryItem[] = [];
    let bad = 0;
    for (const file of list) {
      try {
        uploaded.push({ src: await uploadFile(file, "image"), alt: "" });
      } catch {
        bad++;
      }
      setUploading((p) => (p ? { ...p, done: p.done + 1 } : p));
    }
    onChange(path, [...items, ...uploaded]);
    setUploading(null);
    setFailed(bad);
  };

  const removeAt = (i: number) => onChange(path, items.filter((_, k) => k !== i));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(path, next);
  };

  const round = "absolute w-7 h-7 rounded-full bg-white/90 text-ink flex items-center justify-center shadow-sm";

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files); }}
    >
      <div className="flex items-baseline justify-between mb-2">
        <Label>{field.label}</Label>
        <span className="text-xs text-sub">{items.length}장 · ◀ ▶ 로 순서 바꾸기</span>
      </div>
      {field.helpText && <p className="text-xs text-sub mb-2">{field.helpText}</p>}

      <div className={`grid grid-cols-3 gap-2 rounded-xl ${dragOver ? "outline outline-2 outline-ink outline-offset-4" : ""}`}>
        {items.map((it, i) => (
          <div key={it.src} className="aspect-square rounded-xl overflow-hidden relative bg-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={it.src} alt={it.alt || `갤러리 사진 ${i + 1}`} className="w-full h-full object-cover" />
            <span className="absolute left-1.5 top-1.5 w-[22px] h-[22px] rounded-full bg-ink/80 text-white text-[11px] font-bold flex items-center justify-center">{i + 1}</span>
            <button type="button" onClick={() => removeAt(i)} aria-label={`${i + 1}번 사진 삭제`} className={`${round} right-1 top-1`}>
              <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
            {i > 0 && (
              <button type="button" onClick={() => move(i, -1)} aria-label="앞으로" className={`${round} left-1 bottom-1`}>
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6" /></svg>
              </button>
            )}
            {i < items.length - 1 && (
              <button type="button" onClick={() => move(i, 1)} aria-label="뒤로" className={`${round} right-1 bottom-1`}>
                <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
              </button>
            )}
          </div>
        ))}

        {uploading && (
          <div className="aspect-square rounded-xl bg-[#f2f2f2] flex flex-col items-center justify-center gap-1 text-xs font-bold text-ink" role="status">
            <span className="w-6 h-6 rounded-full border-[3px] border-[#d4d4d4] border-t-ink animate-spin" aria-hidden="true" />
            {uploading.done}/{uploading.total}
          </div>
        )}

        <button type="button" onClick={() => inputRef.current?.click()}
          className="aspect-square rounded-xl border-[1.5px] border-dashed border-[#b5b5b5] bg-white flex flex-col items-center justify-center gap-1 text-ink">
          <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          <span className="text-xs font-bold">추가</span>
        </button>
      </div>

      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
        onChange={(e) => { if (e.target.files) uploadFiles(e.target.files); e.target.value = ""; }} />

      {failed > 0 && (
        <p role="alert" className="mt-2 text-sm text-[#b42318] bg-[#fff1f0] border border-[#f3c4bf] rounded-xl px-3 py-2">
          {failed}장을 올리지 못했어요. 다시 시도해 주세요.
        </p>
      )}
      <button type="button" onClick={() => inputRef.current?.click()}
        className="mt-3 w-full h-12 rounded-full border border-[#d4d4d4] text-sm font-medium text-ink flex items-center justify-center gap-2">
        사진 여러 장 한 번에 올리기
      </button>
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { Label } from "./fieldStyles";
import type { FieldComponentProps } from "./types";

interface GalleryItem {
  src: string;
  alt: string;
}

// bulkImageUpload array-object 전용(현재는 갤러리) — 여러 장 드래그 업로드 + 드래그 순서 변경
export default function GalleryField({ field, path, value, onChange }: FieldComponentProps) {
  const items = (Array.isArray(value) ? value : []) as GalleryItem[];
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const uploadFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) return;
    setUploading({ done: 0, total: list.length });
    const uploaded: GalleryItem[] = [];
    for (const file of list) {
      const form = new FormData();
      form.append("file", file);
      form.append("kind", "image");
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const json = await res.json();
      if (res.ok) uploaded.push({ src: json.path, alt: "" });
      setUploading((p) => (p ? { ...p, done: p.done + 1 } : p));
    }
    onChange(path, [...items, ...uploaded]);
    setUploading(null);
  };

  const removeItem = (src: string) => onChange(path, items.filter((it) => it.src !== src));
  const updateAlt = (src: string, alt: string) =>
    onChange(path, items.map((it) => (it.src === src ? { ...it, alt } : it)));

  const handleReorder = (newSrcOrder: string[]) => {
    const bySrc = new Map(items.map((it) => [it.src, it]));
    onChange(path, newSrcOrder.map((s) => bySrc.get(s)!));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <Label>{field.label}</Label>
        <span className="text-[11px] text-gray-400">{items.length}장</span>
      </div>
      {field.helpText && <p className="text-[10px] text-gray-400 mb-1">{field.helpText}</p>}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`rounded-lg border-2 border-dashed p-4 text-center cursor-pointer transition-colors mb-2 ${
          dragOver ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300"
        }`}
      >
        <p className="text-[11px] text-gray-500">
          {uploading ? `업로드 중 ${uploading.done}/${uploading.total}` : "클릭하거나 여러 장을 한번에 드래그해서 추가"}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) uploadFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {items.length === 0 ? (
        <p className="text-[11px] text-gray-300">사진이 없습니다</p>
      ) : (
        <>
          <p className="text-[10px] text-gray-400 mb-1">⠿ 을 드래그해서 순서를 바꿀 수 있어요</p>
          <Reorder.Group axis="y" values={items.map((it) => it.src)} onReorder={handleReorder} className="space-y-1.5">
            {items.map((it) => (
              <GalleryRow key={it.src} item={it} onAltChange={(alt) => updateAlt(it.src, alt)} onRemove={() => removeItem(it.src)} />
            ))}
          </Reorder.Group>
        </>
      )}
    </div>
  );
}

function GalleryRow({
  item,
  onAltChange,
  onRemove,
}: {
  item: GalleryItem;
  onAltChange: (alt: string) => void;
  onRemove: () => void;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={item.src}
      dragListener={false}
      dragControls={controls}
      className="flex items-center gap-2 border border-gray-100 rounded-lg p-2 bg-white shadow-sm"
    >
      <button
        type="button"
        onPointerDown={(e) => controls.start(e)}
        className="shrink-0 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 px-1 touch-none select-none"
        aria-label="순서 변경"
      >
        ⠿
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={item.src} alt="" className="w-14 h-14 shrink-0 object-cover rounded bg-gray-100" />
      <input
        value={item.alt}
        onChange={(e) => onAltChange(e.target.value)}
        placeholder="설명 (선택)"
        className="flex-1 min-w-0 text-xs px-2 py-1.5 border border-gray-200 rounded outline-none focus:border-blue-400"
      />
      <button type="button" onClick={onRemove} className="shrink-0 text-[11px] text-red-400 hover:underline px-1">
        삭제
      </button>
    </Reorder.Item>
  );
}

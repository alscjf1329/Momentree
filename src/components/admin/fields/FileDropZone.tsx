"use client";

import { useRef, useState } from "react";

export default function FileDropZone({
  value,
  onChange,
  kind,
  accept,
}: {
  value: string;
  onChange: (path: string) => void;
  kind: "image" | "audio";
  accept: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("kind", kind);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "업로드에 실패했습니다");
      onChange(json.path);
    } catch (e) {
      setError(e instanceof Error ? e.message : "업로드에 실패했습니다");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) upload(file);
  };

  const filename = value.split("/").pop();

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`rounded-lg border-2 border-dashed p-3 text-center cursor-pointer transition-colors ${
          dragging ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300"
        }`}
      >
        {kind === "image" && value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="w-full aspect-video object-cover rounded mb-2 bg-gray-100" />
        )}
        <p className="text-[11px] text-gray-500 truncate">
          {uploading
            ? "업로드 중…"
            : value
            ? kind === "image"
              ? "클릭하거나 드래그해서 교체"
              : `📎 ${filename}`
            : "클릭하거나 파일을 드래그해서 업로드"}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
            e.target.value = "";
          }}
        />
      </div>
      {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
    </div>
  );
}

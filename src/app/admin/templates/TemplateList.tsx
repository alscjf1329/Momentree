"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

const TEMPLATES = [
  {
    id: "classic",
    name: "클래식",
    desc: "봉투 오프닝 스크롤 + GSAP 스택 갤러리",
    mood: "다크 로맨틱",
  },
  {
    id: "editorial",
    name: "에디토리얼",
    desc: "다크 풀블리드 타이포그래피 + 필름스트립 갤러리",
    mood: "모던 매거진",
  },
  {
    id: "minimal",
    name: "미니멀",
    desc: "화이트 텍스트 히어로 + 2열 그리드 갤러리",
    mood: "클린 모던",
  },
  {
    id: "romantic",
    name: "로맨틱",
    desc: "보태니컬 SVG 데코 + 폴라로이드 갤러리",
    mood: "드리미 플로럴",
  },
];

function TemplatePreview({ id }: { id: string }) {
  if (id === "classic") {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3"
        style={{ background: "linear-gradient(160deg,#1a1208 0%,#2a1e10 100%)" }}>
        <div className="w-10 h-px" style={{ background: "#c9a96e", opacity: 0.5 }} />
        <p className="font-serif text-white text-lg tracking-widest font-light" style={{ opacity: 0.8 }}>Kim · Lee</p>
        <span style={{ color: "#c9a96e", fontSize: 12 }}>♥</span>
        <p className="text-[8px] tracking-[0.4em]" style={{ color: "rgba(255,255,255,0.3)" }}>2025.10.18</p>
        <div className="w-10 h-px" style={{ background: "#c9a96e", opacity: 0.5 }} />
      </div>
    );
  }
  if (id === "editorial") {
    return (
      <div className="w-full h-full flex flex-col justify-center px-5" style={{ background: "#0d0d0d" }}>
        <div className="w-full h-px mb-5" style={{ background: "rgba(255,255,255,0.15)" }} />
        <p className="text-[7px] tracking-[0.5em] mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>INVITATION</p>
        <p className="font-serif text-white text-2xl font-light tracking-widest">Kim</p>
        <p className="text-xl my-1 tracking-widest" style={{ color: "rgba(255,255,255,0.15)" }}>&amp;</p>
        <p className="font-serif text-white text-2xl font-light tracking-widest">Lee</p>
        <div className="w-full h-px mt-5 mb-2" style={{ background: "rgba(255,255,255,0.15)" }} />
        <p className="text-[7px] tracking-[0.3em]" style={{ color: "rgba(255,255,255,0.25)" }}>2025 · 10 · 18</p>
      </div>
    );
  }
  if (id === "minimal") {
    return (
      <div className="w-full h-full flex flex-col pt-6 px-5" style={{ background: "#fff" }}>
        <p className="text-[7px] tracking-[0.5em] mb-5" style={{ color: "#ddd" }}>WEDDING INVITATION</p>
        <p className="font-serif text-gray-900 text-xl font-light tracking-wider">Kim</p>
        <p className="text-base my-1" style={{ color: "#ccc" }}>+</p>
        <p className="font-serif text-gray-900 text-xl font-light tracking-wider">Lee</p>
        <div className="flex items-center gap-2 mt-4">
          <div className="h-px" style={{ width: 24, background: "#ddd" }} />
          <p className="text-[7px] tracking-wider text-gray-400">2025.10.18</p>
        </div>
        <div className="grid grid-cols-2 gap-1 mt-4 flex-1 pb-4">
          {[0,1,2,3].map(i => (
            <div key={i} className="rounded-sm" style={{ background: "#f3f4f6" }} />
          ))}
        </div>
      </div>
    );
  }
  // romantic
  return (
    <div className="w-full h-full flex flex-col items-center justify-center"
      style={{ background: "linear-gradient(160deg,#fdf5f6 0%,#f8eaec 100%)" }}>
      <svg viewBox="0 0 80 35" style={{ width: 80, marginBottom: 12, opacity: 0.45 }} fill="none">
        <path d="M40 30 Q28 22 16 25 Q22 14 38 18" stroke="#b8758a" strokeWidth="0.8" />
        <path d="M40 30 Q52 22 64 25 Q58 14 42 18" stroke="#b8758a" strokeWidth="0.8" />
        <path d="M37 18 Q35 8 40 3 Q45 8 43 18" stroke="#b8758a" strokeWidth="0.8" />
      </svg>
      <p className="font-serif text-xl tracking-widest font-light" style={{ color: "#3d1f28" }}>Kim</p>
      <span className="my-1 text-sm" style={{ color: "#c9a96e" }}>♥</span>
      <p className="font-serif text-xl tracking-widest font-light" style={{ color: "#3d1f28" }}>Lee</p>
      <div className="flex gap-2 mt-4">
        {[-4, 2, -2].map((rot, i) => (
          <div key={i} className="bg-white shadow-sm p-1"
            style={{ transform: `rotate(${rot}deg)`, width: 28, height: 34 }}>
            <div style={{ background: "#f3f4f6", width: "100%", height: 22 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TemplateList() {
  const searchParams = useSearchParams();
  const fileParam = searchParams.get("file") ?? "";
  const [selectedFile, setSelectedFile] = useState(fileParam);

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 pt-6 pb-2 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-800">템플릿 선택</h1>
        <Link href="/admin/setup" className="px-3 py-1.5 text-xs border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 bg-white">
          + 새 고객
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-4">
      <div className="max-w-xl">
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
          <p className="text-xs text-gray-500 mb-2">고객 파일명</p>
          <div className="flex gap-2">
            <input
              className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400"
              placeholder="파일명 입력 (예: kim-minjun)"
              value={selectedFile}
              onChange={e => setSelectedFile(e.target.value)}
            />
            <Link href={`/admin/setup?file=${selectedFile}`}
              className="px-3 py-2 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 whitespace-nowrap">
              데이터 편집
            </Link>
          </div>
          {!selectedFile && (
            <p className="text-[10px] text-amber-500 mt-1">파일명을 입력해야 미리보기 링크가 활성화됩니다</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {TEMPLATES.map((t) => {
            const href = selectedFile ? `/invite/${t.id}?file=${selectedFile}` : "#";
            return (
              <div key={t.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div style={{ height: 200 }}>
                  <TemplatePreview id={t.id} />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-semibold text-sm text-gray-800">{t.name}</p>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{t.mood}</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mb-3 leading-relaxed">{t.desc}</p>
                  <a
                    href={href}
                    target={selectedFile ? "_blank" : undefined}
                    onClick={!selectedFile ? (e) => e.preventDefault() : undefined}
                    className={`block w-full py-2 text-center text-xs rounded-lg font-medium transition-colors ${
                      selectedFile
                        ? "bg-gray-900 text-white hover:bg-gray-700"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    미리보기
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {selectedFile && (
          <div className="mt-6 bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-xs font-semibold text-gray-500 mb-3">전체 공유 링크</p>
            <div className="space-y-2">
              {TEMPLATES.map(t => (
                <div key={t.id} className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{t.name}</span>
                  <a href={`/invite/${t.id}?file=${selectedFile}`} target="_blank"
                    className="text-[10px] text-blue-500 hover:underline font-mono">
                    /invite/{t.id}?file={selectedFile}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>{/* /max-xl */}
      </div>
    </div>
  );
}
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
    bg: "#1a1208",
    accent: "#c9a96e",
    preview: (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3"
        style={{ background: "linear-gradient(160deg, #1a1208 0%, #2a1e10 100%)" }}>
        <div className="w-12 h-px opacity-40" style={{ background: "#c9a96e" }} />
        <p className="font-serif text-white/80 text-lg tracking-widest font-light">Kim · Lee</p>
        <div className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center">
          <span className="text-[8px]" style={{ color: "#c9a96e" }}>♥</span>
        </div>
        <p className="text-white/30 text-[8px] tracking-[0.4em]">2025.10.18</p>
        <div className="w-12 h-px opacity-40" style={{ background: "#c9a96e" }} />
      </div>
    ),
  },
  {
    id: "editorial",
    name: "에디토리얼",
    desc: "다크 풀블리드 타이포그래피 + 필름스트립 갤러리",
    mood: "모던 매거진",
    bg: "#0d0d0d",
    accent: "#c8a96e",
    preview: (
      <div className="w-full h-full flex flex-col justify-center px-5"
        style={{ background: "#0d0d0d" }}>
        <div className="w-full h-px opacity-20 mb-4" style={{ background: "#fff" }} />
        <p className="text-white/20 text-[7px] tracking-[0.5em] mb-2">INVITATION</p>
        <p className="font-serif text-white text-2xl font-light tracking-widest leading-tight">Kim</p>
        <p className="text-white/15 text-lg my-1 tracking-widest">&</p>
        <p className="font-serif text-white text-2xl font-light tracking-widest leading-tight">Lee</p>
        <div className="w-full h-px opacity-20 mt-4 mb-2" style={{ background: "#fff" }} />
        <p className="text-white/25 text-[7px] tracking-[0.3em]">2025 · 10 · 18</p>
      </div>
    ),
  },
  {
    id: "minimal",
    name: "미니멀",
    desc: "화이트 텍스트 히어로 + 2열 그리드 갤러리",
    mood: "클린 모던",
    bg: "#ffffff",
    accent: "#b8954a",
    preview: (
      <div className="w-full h-full flex flex-col pt-6 px-5"
        style={{ background: "#ffffff" }}>
        <p className="text-gray-200 text-[7px] tracking-[0.5em] mb-4">WEDDING INVITATION</p>
        <p className="font-serif text-gray-900 text-xl font-light tracking-wider leading-snug">Kim</p>
        <p className="text-gray-200 text-base my-1">+</p>
        <p className="font-serif text-gray-900 text-xl font-light tracking-wider">Lee</p>
        <div className="flex items-center gap-2 mt-4">
          <div className="w-6 h-px bg-gray-200" />
          <p className="text-gray-400 text-[7px] tracking-wider">2025.10.18</p>
        </div>
        {/* 미니 그리드 */}
        <div className="grid grid-cols-2 gap-0.5 mt-4 flex-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-sm" />
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "romantic",
    name: "로맨틱",
    desc: "보태니컬 SVG 데코 + 폴라로이드 갤러리",
    mood: "드리미 플로럴",
    bg: "#fdf5f6",
    accent: "#b8758a",
    preview: (
      <div className="w-full h-full flex flex-col items-center justify-center"
        style={{ background: "linear-gradient(160deg, #fdf5f6 0%, #f8eaec 100%)" }}>
        {/* 보태니컬 미니 */}
        <svg viewBox="0 0 80 35" className="w-20 mb-3 opacity-40" fill="none">
          <path d="M40 30 Q28 22 16 25 Q22 14 38 18" stroke="#b8758a" strokeWidth="0.8"/>
          <path d="M40 30 Q52 22 64 25 Q58 14 42 18" stroke="#b8758a" strokeWidth="0.8"/>
          <path d="M37 18 Q35 8 40 3 Q45 8 43 18" stroke="#b8758a" strokeWidth="0.8"/>
        </svg>
        <p className="font-serif text-[#3d1f28] text-xl tracking-widest font-light">Kim</p>
        <p className="my-1 text-sm" style={{ color: "#c9a96e" }}>♥</p>
        <p className="font-serif text-[#3d1f28] text-xl tracking-widest font-light">Lee</p>
        {/* 미니 폴라로이드 */}
        <div className="flex gap-2 mt-4">
          {[-4, 2, -2].map((rot, i) => (
            <div key={i} className="bg-white p-1 shadow-sm"
              style={{ transform: `rotate(${rot}deg)`, width: 28, height: 34 }}>
              <div className="w-full bg-gray-100" style={{ height: 22 }} />
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export default function TemplateList() {
  const searchParams = useSearchParams();
  const fileParam = searchParams.get("file") ?? "";
  const [selectedFile, setSelectedFile] = useState(fileParam);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <a href="/admin" className="text-gray-400 text-sm hover:text-gray-600">← 어드민</a>
          <span className="text-gray-200">|</span>
          <h1 className="text-sm font-semibold text-gray-800">템플릿 선택</h1>
        </div>
        <Link href="/admin/setup" className="px-3 py-1.5 text-xs border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50">
          + 새 고객
        </Link>
      </div>

      <div className="max-w-xl mx-auto px-6 py-8">
        {/* 파일 입력 */}
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

        {/* 템플릿 카드 */}
        <div className="grid grid-cols-2 gap-4">
          {TEMPLATES.map((t) => {
            const href = selectedFile ? `/invite/${t.id}?file=${selectedFile}` : "#";
            return (
              <div key={t.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* 프리뷰 */}
                <div className="relative" style={{ height: 200 }}>
                  {t.preview}
                </div>

                {/* 정보 */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-semibold text-sm text-gray-800">{t.name}</p>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                      {t.mood}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 mb-3 leading-relaxed">{t.desc}</p>

                  <a
                    href={href}
                    target={selectedFile ? "_blank" : undefined}
                    onClick={!selectedFile ? e => e.preventDefault() : undefined}
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

        {/* 공유 링크 */}
        {selectedFile && (
          <div className="mt-6 bg-white rounded-xl border border-gray-100 p-5">
            <p className="text-xs font-semibold text-gray-500 mb-3">전체 공유 링크</p>
            <div className="space-y-2">
              {TEMPLATES.map(t => (
                <div key={t.id} className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{t.name}</span>
                  <a
                    href={`/invite/${t.id}?file=${selectedFile}`}
                    target="_blank"
                    className="text-[10px] text-blue-500 hover:underline font-mono"
                  >
                    /invite/{t.id}?file={selectedFile}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
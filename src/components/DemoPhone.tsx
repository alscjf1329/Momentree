"use client";

import { useState } from "react";
import Link from "next/link";
import { TEMPLATE_NAMES, TEMPLATE_TINT } from "@/lib/templateNames";

// 랜딩의 예시 청첩장: 실제 데모 페이지(/invite/demo-*)를 폰 틀 안에서 보여준다.
// 칩을 누르면 템플릿이 바뀌고, iframe은 화면에 가까워질 때만 불러온다(loading="lazy").
const ITEMS = Object.entries(TEMPLATE_NAMES)
  .filter(([id]) => id !== "garden")
  .map(([id, name]) => ({ id, name, ...TEMPLATE_TINT[id] }));
// 가든은 대표 사진이 있어야 첫 화면이 완성돼서(샘플에는 사진 없음) 사진 없이도 예쁜 템플릿만 보여준다

const W = 252; // 폰 화면 폭 — 청첩장은 390px 기준으로 그린 뒤 축소해서 보여준다
const SCALE = W / 390;

export default function DemoPhone() {
  const [id, setId] = useState(ITEMS[0].id);

  return (
    <div className="flex flex-col items-center gap-6 w-full min-w-0">
      <div className="flex gap-3 overflow-x-auto w-full px-6 pb-1 no-scrollbar" role="tablist" aria-label="예시 템플릿">
        {ITEMS.map((t) => {
          const on = t.id === id;
          return (
            <button key={t.id} role="tab" aria-selected={on} onClick={() => setId(t.id)}
              className="flex flex-col items-center gap-1.5 shrink-0 min-w-[64px]">
              <span className="w-[68px] h-[68px] rounded-full p-[3px] block transition-opacity"
                style={{ background: on ? "linear-gradient(135deg,#F6A5BE,var(--color-rose))" : "#d4d4d4", opacity: on ? 1 : 0.7 }}>
                <span className="w-full h-full rounded-full border-[3px] border-white flex items-center justify-center font-serif text-[11px]"
                  style={{ background: t.bg, color: t.fg }}>{t.name.slice(0, 3)}</span>
              </span>
              <span className={`text-xs ${on ? "font-bold text-ink" : "text-sub"}`}>{t.name}</span>
            </button>
          );
        })}
      </div>

      <div className="relative rounded-[38px] border-[8px] border-ink bg-white overflow-hidden shadow-[0_18px_40px_rgba(0,0,0,0.16)]"
        style={{ width: W + 16, height: 516 + 16 }}>
        <div style={{ width: W, height: 516, overflow: "hidden", position: "relative" }}>
          <iframe key={id} src={`/invite/demo-${id}`} title={`${id} 예시 청첩장`} loading="lazy" tabIndex={-1}
            style={{ width: 390, height: 516 / SCALE, border: 0, transform: `scale(${SCALE})`, transformOrigin: "top left" }} />
        </div>
      </div>

      <div className="w-full max-w-sm px-6 flex flex-col items-center gap-2">
        <Link href={`/invite/demo-${id}`} target="_blank"
          className="w-full h-[52px] rounded-full bg-ink text-white text-base font-bold flex items-center justify-center">
          이 청첩장 열어보기
        </Link>
        <span className="text-xs text-sub">가입 없이 바로 볼 수 있어요</span>
      </div>
    </div>
  );
}

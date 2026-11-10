"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useWedding } from "@/context/WeddingContext";

// 안내사항 — 한 장씩 스와이프. 색은 템플릿 CSS 변수를 따른다.
export default function InfoSection() {
  const w = useWedding();
  const mainRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  // 제목·내용이 모두 빈 항목(기본 데이터의 빈 칸)은 그리지 않는다
  const items = (w.info ?? []).filter((it) => it.title?.trim() || it.content?.trim());

  const handleScroll = () => {
    const el = mainRef.current;
    if (!el) return;
    const center = el.scrollLeft + el.clientWidth / 2;
    let closest = 0;
    let min = Infinity;
    Array.from(el.children).forEach((child, i) => {
      const c = (child as HTMLElement).offsetLeft + (child as HTMLElement).offsetWidth / 2;
      const d = Math.abs(c - center);
      if (d < min) { min = d; closest = i; }
    });
    setActive(closest);
  };

  const goTo = (i: number) => {
    const el = mainRef.current;
    const target = el?.children[i] as HTMLElement | undefined;
    if (!el || !target) return;
    el.scrollTo({ left: target.offsetLeft - (el.clientWidth - target.offsetWidth) / 2, behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <section className="py-14 bg-[var(--color-cream)] overflow-hidden">
      <motion.div className="px-6 mb-6 text-center"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.6 }}>
        <h2 className="font-serif text-xl text-[var(--color-text)]">안내사항</h2>
      </motion.div>

      <div ref={mainRef} onScroll={handleScroll}
        className="no-scrollbar flex gap-3 overflow-x-auto px-6 items-stretch"
        style={{ scrollSnapType: "x mandatory" }}>
        {items.map((item, i) => (
          <div key={i}
            className="flex-none rounded-lg p-7 border border-[var(--color-accent)]"
            // 흰 카드는 어두운 템플릿(밝은 글자색)에서 글자가 안 보여서, 바탕색에 글자색을 살짝 섞어 밝은·어두운 템플릿 모두에서 대비를 유지한다
            style={{ width: "88%", scrollSnapAlign: "center", background: "color-mix(in srgb, var(--color-cream), var(--color-text) 6%)" }}>
            <p className="font-serif text-lg text-[var(--color-text)] tracking-wide break-words">{item.title}</p>
            <div className="w-6 h-px my-4" style={{ background: "var(--color-primary-light)" }} />
            <p className="text-sm text-[var(--color-text-light)] leading-loose whitespace-pre-wrap break-words">
              {item.content}
            </p>
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-5">
          {items.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} aria-label={`${i + 1}번째 안내사항 보기`}
              className="rounded-full transition-all"
              style={{
                width: active === i ? 16 : 6,
                height: 6,
                background: active === i ? "var(--color-primary)" : "var(--color-accent)",
              }} />
          ))}
        </div>
      )}
    </section>
  );
}

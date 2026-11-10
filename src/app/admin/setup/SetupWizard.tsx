"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { renderField } from "@/components/admin/FieldRenderer";
import type { TemplateSchema } from "@/lib/schema";
import { buildSteps, missingRequired, moveIndex, resolveIndex, stepForView } from "@/lib/setupSteps";

// 고객 전용 단계별 입력. 상태·저장은 SetupForm 것을 그대로 받아 쓴다.
// 단계는 URL(?step=1..6, 완료는 done)이 정한다 — 체크리스트·옛 링크도 같은 방식으로 연결된다.
export default function SetupWizard({ schema, data, errors, onChange, onSave, saving, saveError, summary, plan, stepHref, shareHref, templatesHref, fileKey }: {
  schema: TemplateSchema;
  data: unknown;
  errors: Record<string, string>;
  onChange: (path: string, value: unknown) => void;
  onSave: () => Promise<string | null>; // 저장된 파일 ID, 실패하면 null
  saving: boolean;
  saveError: string;
  summary: React.ReactNode; // 이름·날짜 요약 + 함께 편집 링크
  plan: React.ReactNode; // 플랜 현황 (항상 켜 둬야 미리보기 워터마크가 맞는다)
  stepHref: (step: string | number, file?: string) => string; // 운영자는 ?file= 이 붙는다
  shareHref: string;
  templatesHref: string;
  fileKey: string; // 운영자가 다른 고객을 고르면(?file= 변경) 방문 기록을 비운다
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const steps = useMemo(() => buildSteps(schema), [schema]);
  const stepParam = sp.get("step");
  const done = stepParam === "done";
  const idx = resolveIndex(steps, Number(stepParam) || stepForView(sp.get("view")));
  const cur = steps[idx];

  // 한 번이라도 가 본 단계까지만 점으로 이동할 수 있다
  const [reached, setReached] = useState(0);
  useEffect(() => { setReached(0); }, [fileKey]); // 먼저 비우고 아래에서 현재 단계까지 채운다
  useEffect(() => { setReached((r) => Math.max(r, done ? steps.length - 1 : idx)); }, [idx, done, steps.length]);

  const go = (to: string | number, file?: string) => {
    router.replace(stepHref(to, file), { scroll: false });
    window.scrollTo({ top: 0 });
  };
  // 다음/완료: 먼저 저장하고, 실패하면 그 자리에 남는다
  const next = async () => {
    const file = await onSave();
    if (file === null) return;
    go(idx >= steps.length - 1 ? "done" : steps[moveIndex(idx, 1, steps.length)].n, file);
  };
  const prev = () => go(done ? steps[steps.length - 1].n : steps[moveIndex(idx, -1, steps.length)].n);

  const lefts = steps.map((s) => missingRequired(s, data));
  const remaining = steps.filter((_, i) => lefts[i] > 0);
  const btn = "h-12 rounded-full text-base font-bold flex items-center justify-center disabled:opacity-50";

  return (
    <div className="pb-20 space-y-5">
      {(done || idx === 0) && summary}
      {(done || cur.n === 4) ? plan : <div className="hidden">{plan}</div>}

      {done ? (
        <div className="max-w-xl space-y-4">
          {remaining.length === 0 ? (
            <>
              <h2 className="text-xl font-bold">준비를 마쳤어요</h2>
              <p className="text-sm text-sub leading-relaxed">입력한 내용이 저장됐어요. 이제 청첩장을 공유해 보세요.</p>
              <Link href={shareHref} className={`${btn} bg-ink text-white`}>청첩장 공유하기</Link>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold">아직 입력하지 않은 필수 항목이 있어요</h2>
              <ul className="rounded-2xl border border-line overflow-hidden">
                {remaining.map((s) => (
                  <li key={s.n} className="border-b border-line last:border-b-0">
                    <Link href={stepHref(s.n)} className="min-h-[52px] px-4 flex items-center justify-between gap-3 text-[15px]">
                      <span className="min-w-0 truncate font-medium">{s.title}</span>
                      <span className="shrink-0 text-xs text-[#8a4b00]">필수 {lefts[steps.indexOf(s)]}개 남음 ›</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
          <Link href={templatesHref} className="h-11 rounded-full border border-[#d4d4d4] text-sm font-medium text-ink flex items-center justify-center">템플릿 바꾸기</Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-[13px] font-bold">{idx + 1} / {steps.length}</span>
              {lefts[idx] > 0 && <span className="h-[26px] px-2.5 rounded-full text-xs font-medium inline-flex items-center bg-[#fff4e5] text-[#8a4b00]">필수 {lefts[idx]}개 남음</span>}
            </div>
            <div className="h-1.5 rounded-full bg-line overflow-hidden" role="progressbar" aria-valuemin={1} aria-valuenow={idx + 1} aria-valuemax={steps.length}>
              <div className="h-full bg-ink rounded-full transition-all" style={{ width: `${((idx + 1) / steps.length) * 100}%` }} />
            </div>
            <ol className="flex justify-between">
              {steps.map((s, i) => {
                const warn = i <= reached && lefts[i] > 0 && i !== idx;
                return (
                  <li key={s.n} className="min-w-0">
                    <button type="button" disabled={i > reached} onClick={() => go(s.n)}
                      aria-current={i === idx ? "step" : undefined}
                      aria-label={`${i + 1}단계 ${s.title}${lefts[i] > 0 ? `, 필수 ${lefts[i]}개 남음` : ""}`}
                      className="w-10 h-11 flex items-center justify-center disabled:opacity-40">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${i === idx ? "bg-ink text-white border-ink" : warn ? "bg-[#fff4e5] text-[#8a4b00] border-[#8a4b00]" : i < idx ? "bg-white text-ink border-ink" : "bg-white text-sub border-line"}`}>
                        {i < idx && !warn ? "✓" : i + 1}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <h2 className="text-xl font-bold">{cur.title}</h2>
          </div>

          <div className="max-w-xl space-y-8">
            {cur.sections.map((section) => (
              <section key={section.title} className="space-y-4">
                {cur.sections.length > 1 && <h3 className="text-[15px] font-bold text-ink">{section.title}</h3>}
                {section.fields.map((field) => renderField({ field, data, basePath: "", onChange, errors }))}
              </section>
            ))}
          </div>
        </>
      )}

      {saveError && <p role="alert" className="max-w-xl text-sm text-[#b42318] leading-relaxed">{saveError}</p>}

      {/* 모바일은 아래 탭 위에, 넓은 화면은 맨 아래에 붙는다 */}
      <div className="fixed inset-x-0 bottom-16 sm:bottom-0 z-40 bg-white border-t border-line" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center">
          <div className="max-w-3xl mx-auto xl:mx-0 w-full">
            <div className="max-w-xl flex gap-3">
              <button type="button" onClick={prev} disabled={saving || (!done && idx === 0)} className={`${btn} flex-1 min-w-0 border border-[#d4d4d4] text-ink`}>이전</button>
              {done ? (
                <Link href={shareHref} className={`${btn} flex-[2] min-w-0 bg-ink text-white`}>공유하기</Link>
              ) : (
                <button type="button" onClick={next} disabled={saving} className={`${btn} flex-[2] min-w-0 bg-ink text-white`}>
                  {saving ? "저장 중…" : idx === steps.length - 1 ? "완료" : "다음"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

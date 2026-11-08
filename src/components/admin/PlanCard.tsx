"use client";

import { useCallback, useEffect, useState } from "react";
import SupportLink from "@/components/SupportLink";
import { PLAN_LABEL, type Plan } from "@/lib/plan";

interface Usage { plan: Plan; expired: boolean; until: number | null; photos: number; photoLimit: number | null; rsvp: number; rsvpLimit: number | null }

// 현재 플랜과 사용량. 결제는 아직 없어서 업그레이드는 문의로 안내하고, 관리자는 수동 전환 버튼을 쓴다.
export default function PlanCard({ file, admin, onPlan }: { file: string; admin: boolean; onPlan?: (p: Plan) => void }) {
  const [u, setU] = useState<Usage | null>(null);
  const load = useCallback(async () => {
    const r = await fetch(`/api/plan?file=${encodeURIComponent(file)}`);
    const j: Usage | null = r.ok ? await r.json() : null;
    setU(j);
    if (j) onPlan?.(j.plan);
  }, [file, onPlan]);
  useEffect(() => { if (file) load(); }, [file, load]);
  if (!u) return null;

  const toggle = async () => {
    const plan: Plan = u.plan === "paid" ? "free" : "paid";
    if (!confirm(`이 고객을 ${PLAN_LABEL[plan]} 플랜으로 바꿀까요?`)) return;
    await fetch("/api/plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ file, plan }) });
    load();
  };
  const of = (n: number, max: number | null) => (max === null ? `${n}` : `${n}/${max}`);

  return (
    <div className="rounded-2xl border border-line bg-soft p-4 flex flex-col gap-2 text-[13px]">
      <p className="flex items-center justify-between gap-3">
        <b>현재 플랜: {PLAN_LABEL[u.plan]}</b>
        {admin && <button onClick={toggle} className="h-11 underline underline-offset-[3px] shrink-0">{u.plan === "paid" ? "무료로 전환" : "유료로 전환"}</button>}
      </p>
      {u.expired && <p className="text-sub leading-relaxed">유료 유지 기간이 끝나 무료로 전환되었어요. 청첩장은 그대로 볼 수 있어요.</p>}
      {u.plan === "paid" && u.until !== null && <p className="text-sub">유료 이용 기간: {new Date(u.until).toISOString().slice(0, 10)}까지</p>}
      <p className="text-sub">사진 {of(u.photos, u.photoLimit)}장 · 하객 응답 {of(u.rsvp, u.rsvpLimit)}건</p>
      {u.plan === "free" && !admin && (
        <p className="text-sub leading-relaxed">모든 템플릿·사진/응답 무제한·함께 편집·워터마크 없음은 유료(1회 결제)에서 쓸 수 있어요. 업그레이드가 필요하면 <SupportLink />해 주세요.</p>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";

interface Member { email: string; role: string }
const ROLE_LABEL: Record<string, string> = { owner: "소유자", editor: "편집자", viewer: "보기" };

// 함께 편집하는 사람 관리 (소유자·관리자). file은 관리자가 다른 고객을 볼 때만 필요.
export default function MembersCard({ file, admin }: { file: string; admin: boolean }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const qs = admin ? `?file=${encodeURIComponent(file)}` : "";

  const load = useCallback(async () => {
    const r = await fetch(`/api/members${qs}`);
    setMembers(r.ok ? await r.json() : []);
  }, [qs]);
  useEffect(() => { if (file) load(); }, [file, load]);

  const invite = async (to: string) => {
    setError(""); setNotice("");
    const r = await fetch("/api/members", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: to, file: admin ? file : undefined }),
    });
    const j = await r.json();
    if (!r.ok) return setError(j.error ?? "추가하지 못했습니다");
    setEmail(""); load();
    // 메일은 큐에 접수만 된 상태(곧 발송, 실패 시 자동 재시도). 안 오는 경우를 대비해 링크도 복사해 둔다.
    await navigator.clipboard?.writeText(j.loginUrl).catch(() => {});
    setNotice(`${to} 님께 초대 메일을 보내는 중이에요. 오래 안 오면 복사된 초대 링크를 직접 전달해 주세요`);
  };
  const remove = async (m: Member) => {
    if (!confirm(`${m.email} 님을 제외할까요?`)) return;
    await fetch(`/api/members?email=${encodeURIComponent(m.email)}${admin ? `&file=${encodeURIComponent(file)}` : ""}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm leading-relaxed text-sub">같이 준비하는 분을 초대하면 이 청첩장을 함께 수정할 수 있어요.</p>

      <ul>
        {members.map((m, i) => (
          <li key={m.email} className={`flex items-center gap-3 min-h-[68px] ${i > 0 ? "border-t border-line" : ""}`}>
            <span className={`w-11 h-11 rounded-full flex items-center justify-center text-[15px] font-bold shrink-0 ${m.role === "owner" ? "bg-rose-soft text-rose" : "bg-[#f2f2f2]"}`}>
              {m.email[0].toUpperCase()}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold truncate">{m.email}</p>
              {m.role !== "owner" && (
                <p className="flex gap-1.5">
                  <button onClick={() => invite(m.email)} className="h-11 text-[13px] underline underline-offset-[3px]">초대 재발송</button>
                  <button onClick={() => remove(m)} className="h-11 text-[13px] text-[#b42318]">제외</button>
                </p>
              )}
            </div>
            <span className="h-[26px] px-2.5 rounded-full bg-[#f2f2f2] text-[#444] text-xs font-medium inline-flex items-center">{ROLE_LABEL[m.role] ?? m.role}</span>
          </li>
        ))}
      </ul>

      <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); invite(email); }}>
        <label className="flex flex-col gap-2 text-[13px] text-sub">초대할 이메일
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="friend@example.com"
            className="w-full h-[52px] box-border border border-[#d4d4d4] focus:border-ink outline-none rounded-[14px] px-4 text-base text-ink bg-white" />
        </label>
        <button type="submit" disabled={!email} className="h-[52px] rounded-full bg-ink text-white text-base font-bold disabled:opacity-40">초대 메일 보내기</button>
        {error && <p role="alert" className="text-sm text-[#b42318]">{error}</p>}
      </form>

      <div className="bg-soft border border-line rounded-[18px] px-[18px] py-4 flex flex-col gap-2.5">
        <b className="text-[13px]">권한 안내</b>
        <div className="grid grid-cols-[1fr_auto_auto] gap-x-[18px] gap-y-2 text-[13px] items-center">
          <span /><b className="text-xs text-sub">소유자</b><b className="text-xs text-sub">편집자</b>
          <span>내용 수정 · 저장</span><span>✓</span><span>✓</span>
          <span>하객 응답 관리</span><span>✓</span><span>✓</span>
          <span>멤버 초대 · 제외</span><span>✓</span><span className="text-sub">—</span>
        </div>
      </div>

      {notice && (
        <p role="status" className="bg-[#e8f6ee] text-[#1b6b43] rounded-[14px] px-4 py-3.5 text-[13px] font-medium">{notice}</p>
      )}
    </div>
  );
}

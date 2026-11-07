"use client";

import { useCallback, useEffect, useState } from "react";

interface Member { email: string; role: string }
const ROLE_LABEL: Record<string, string> = { owner: "소유자", editor: "편집자", viewer: "보기" };

// 함께 편집하는 사람 관리 (소유자·관리자). file은 관리자가 다른 고객을 볼 때만 필요.
export default function MembersCard({ file, admin }: { file: string; admin: boolean }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const qs = admin ? `?file=${encodeURIComponent(file)}` : "";

  const load = useCallback(async () => {
    const r = await fetch(`/api/members${qs}`);
    setMembers(r.ok ? await r.json() : []);
  }, [qs]);
  useEffect(() => { if (file) load(); }, [file, load]);

  const add = async () => {
    setError("");
    const r = await fetch("/api/members", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, file: admin ? file : undefined }),
    });
    if (r.ok) { setEmail(""); load(); } else setError((await r.json()).error ?? "추가하지 못했습니다");
  };
  const remove = async (m: Member) => {
    if (!confirm(`${m.email} 님을 제외할까요?`)) return;
    await fetch(`/api/members?email=${encodeURIComponent(m.email)}${admin ? `&file=${encodeURIComponent(file)}` : ""}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-50 bg-gray-50/60">
        <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase">함께 편집</p>
      </div>
      <div className="p-3 space-y-2">
        {members.map(m => (
          <div key={m.email} className="flex items-center justify-between gap-2 text-[11px]">
            <span className="truncate text-gray-600" title={m.email}>{m.email}</span>
            <span className="shrink-0 text-gray-400">
              {ROLE_LABEL[m.role] ?? m.role}
              {m.role !== "owner" && <button onClick={() => remove(m)} className="ml-2 text-red-400 hover:underline">제외</button>}
            </span>
          </div>
        ))}
        <div className="flex gap-1.5 pt-1">
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="초대할 이메일"
            className="flex-1 min-w-0 px-2.5 py-1.5 text-[11px] border border-gray-200 rounded-lg" />
          <button onClick={add} className="text-[11px] px-3 bg-gray-900 text-white rounded-lg">추가</button>
        </div>
        {error && <p className="text-[11px] text-red-500">{error}</p>}
        <p className="text-[10px] text-gray-400">추가한 분은 이 이메일로 로그인하면 같은 청첩장을 수정할 수 있어요.</p>
      </div>
    </div>
  );
}

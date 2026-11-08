"use client";

import { useCallback, useEffect, useState } from "react";
import type { RsvpEntry } from "@/app/api/rsvp/route";
import type { GuestbookEntry } from "@/app/api/guestbook/route";

interface Me {
  role: "admin" | "customer";
  file: string | null;
}

type Tab = "rsvp" | "guestbook";

const MESSAGES_PER_PAGE = 5;

export default function AdminPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [slugs, setSlugs] = useState<string[]>([]);
  const [file, setFile] = useState("");
  const [tab, setTab] = useState<Tab>("rsvp");
  const [sideFilter, setSideFilter] = useState<"all" | "groom" | "bride">("all");

  const [rsvps, setRsvps] = useState<RsvpEntry[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<Partial<RsvpEntry>>({});

  const [messages, setMessages] = useState<GuestbookEntry[]>([]);
  const [messagePage, setMessagePage] = useState(1);

  const loadRsvps = useCallback(async (f: string) => {
    if (!f) { setRsvps([]); return; }
    const res = await fetch(`/api/rsvp?file=${f}`);
    setRsvps(res.ok ? await res.json() : []);
  }, []);

  const loadMessages = useCallback(async (f: string) => {
    if (!f) { setMessages([]); return; }
    const res = await fetch(`/api/guestbook?file=${f}`);
    setMessages(res.ok ? await res.json() : []);
  }, []);

  useEffect(() => {
    fetch("/api/admin/auth/me").then(r => r.ok ? r.json() : null).then((data: Me | null) => {
      setMe(data);
      if (data?.role === "customer" && data.file) {
        setFile(data.file);
        loadRsvps(data.file);
        loadMessages(data.file);
      } else if (data?.role === "admin") {
        fetch("/api/rsvp").then(r => r.json()).then(setSlugs).catch(() => {});
      }
    }).catch(() => {});
  }, [loadRsvps, loadMessages]);

  const selectFile = (f: string) => {
    setFile(f);
    setEditIndex(null);
    setMessagePage(1);
    loadRsvps(f);
    loadMessages(f);
  };

  const sortedMessages = [...messages]
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  const messageTotalPages = Math.max(1, Math.ceil(sortedMessages.length / MESSAGES_PER_PAGE));
  const currentMessagePage = Math.min(messagePage, messageTotalPages);
  const pageMessages = sortedMessages.slice(
    (currentMessagePage - 1) * MESSAGES_PER_PAGE,
    currentMessagePage * MESSAGES_PER_PAGE
  );

  const attending = rsvps.filter(r => r.attendance === "attending");
  const totalGuests = attending.reduce((sum, r) => sum + parseInt(r.guests || "1"), 0);

  const startEdit = (i: number) => {
    setEditIndex(i);
    setDraft(rsvps[i]);
  };

  const cancelEdit = () => {
    setEditIndex(null);
    setDraft({});
  };

  const saveEdit = async (i: number) => {
    await fetch("/api/rsvp", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: file, ...draft, id: rsvps[i].id }),
    });
    setEditIndex(null);
    await loadRsvps(file);
  };

  const removeRsvp = async (i: number) => {
    if (!confirm("이 응답을 삭제할까요?")) return;
    await fetch(`/api/rsvp?file=${file}&id=${rsvps[i].id}`, { method: "DELETE" });
    await loadRsvps(file);
  };

  const removeMessage = async (id: number) => {
    if (!confirm("이 메시지를 삭제할까요?")) return;
    await fetch(`/api/guestbook?file=${file}&id=${id}`, { method: "DELETE" });
    await loadMessages(file);
  };

  const isCustomer = me?.role === "customer";
  const isAdmin = me?.role === "admin";

  const shown = rsvps.map((r, i) => ({ r, i })).filter(({ r }) => sideFilter === "all" || r.side === sideFilter);
  const fmt = (d: string) => new Date(d).toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  const field = "w-full h-11 border border-[#d4d4d4] focus:border-ink outline-none rounded-xl px-3 text-base bg-white";
  const chip = (on: boolean) => `h-9 px-4 rounded-full text-[13px] border transition-colors ${on ? "bg-ink text-white border-ink font-medium" : "bg-soft border-line text-ink"}`;

  return (
    <div className="max-w-2xl mx-auto px-5 py-6 sm:py-8 flex flex-col gap-5">
      <div>
        <h1 className="text-[22px] font-bold text-ink">하객 현황</h1>
        <p className="text-[13px] text-sub mt-1">
          {isCustomer ? "참석 여부와 축하 메시지를 확인하고 관리해요" : "고객을 선택하면 해당 청첩장의 참석 여부와 축하 메시지를 확인합니다"}
        </p>
      </div>

      {/* 고객 선택 (운영자 전용) */}
      {isAdmin && (
        <div className="bg-soft rounded-2xl border border-line p-4">
          <p className="text-xs font-bold text-sub mb-3">고객 선택</p>
          {slugs.length === 0 ? (
            <p className="text-[13px] text-sub">아직 RSVP 응답이 없습니다</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {slugs.map(s => (
                <button key={s} onClick={() => selectFile(s)} className={`${chip(file === s)} font-mono`}>{s}</button>
              ))}
            </div>
          )}
        </div>
      )}

      {file ? (
        <>
          {/* 요약 */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "총 응답", value: rsvps.length, cls: "bg-soft text-ink" },
              { label: "참석", value: attending.length, cls: "bg-soft text-[#1b6b43]" },
              { label: "예상 인원", value: totalGuests, cls: "bg-soft text-ink" },
              { label: "메시지", value: messages.length, cls: "bg-rose-soft text-rose" },
            ].map(({ label, value, cls }) => (
              <div key={label} className={`${cls} rounded-2xl py-3.5 px-1 text-center flex flex-col gap-1`}>
                <b className="text-[22px]">{value}</b>
                <span className="text-xs text-sub">{label}</span>
              </div>
            ))}
          </div>

          {/* 탭 */}
          <div className="flex bg-[#f2f2f2] rounded-full p-1 h-11" role="tablist">
            {([{ key: "rsvp", label: "참석 여부" }, { key: "guestbook", label: "축하 메시지" }] as { key: Tab; label: string }[]).map(({ key, label }) => (
              <button key={key} role="tab" aria-selected={tab === key} onClick={() => setTab(key)}
                className={`flex-1 rounded-full text-sm transition-colors ${tab === key ? "bg-white text-ink font-bold shadow-sm" : "text-sub"}`}>
                {label}
              </button>
            ))}
          </div>

          {tab === "rsvp" && (
            rsvps.length === 0 ? (
              <div className="rounded-2xl border border-line p-10 text-center">
                <p className="text-[15px] font-bold text-ink">아직 응답이 없어요</p>
                <p className="text-[13px] text-sub mt-1.5">청첩장 링크를 하객께 보내면 참석 응답이 여기에 모여요</p>
                {isCustomer && (
                  <a href="/admin/share" className="mt-5 h-11 px-5 rounded-full bg-ink text-white text-sm font-bold inline-flex items-center">공유 링크·QR 보기</a>
                )}
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <button className={chip(sideFilter === "all")} onClick={() => setSideFilter("all")}>전체</button>
                  <button className={chip(sideFilter === "groom")} onClick={() => setSideFilter("groom")}>신랑측</button>
                  <button className={chip(sideFilter === "bride")} onClick={() => setSideFilter("bride")}>신부측</button>
                </div>

                <ul>
                  {shown.map(({ r, i }) => (
                    <li key={r.id ?? i} className="border-t border-line first:border-t-0 py-3">
                      {editIndex === i ? (
                        <div className="space-y-2">
                          <input value={draft.name ?? ""} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} placeholder="이름" className={field} />
                          <div className="flex gap-2">
                            <select value={draft.side ?? ""} onChange={e => setDraft(d => ({ ...d, side: e.target.value as RsvpEntry["side"] }))} className={`${field} flex-1`}>
                              <option value="">신랑측/신부측</option><option value="groom">신랑측</option><option value="bride">신부측</option>
                            </select>
                            <select value={draft.attendance ?? "attending"} onChange={e => setDraft(d => ({ ...d, attendance: e.target.value as RsvpEntry["attendance"] }))} className={`${field} flex-1`}>
                              <option value="attending">참석</option><option value="not_attending">불참</option>
                            </select>
                            <input value={draft.guests ?? ""} onChange={e => setDraft(d => ({ ...d, guests: e.target.value }))} placeholder="인원" className={`${field} w-20`} />
                          </div>
                          <input value={draft.companionName ?? ""} onChange={e => setDraft(d => ({ ...d, companionName: e.target.value }))} placeholder="동반인" className={field} />
                          <textarea value={draft.message ?? ""} onChange={e => setDraft(d => ({ ...d, message: e.target.value }))} placeholder="메시지" rows={2}
                            className="w-full border border-[#d4d4d4] focus:border-ink outline-none rounded-xl px-3 py-2.5 text-base bg-white" />
                          <div className="flex gap-2 justify-end">
                            <button onClick={cancelEdit} className="h-11 px-5 rounded-full border border-[#d4d4d4] text-sm">취소</button>
                            <button onClick={() => saveEdit(i)} className="h-11 px-5 rounded-full bg-ink text-white text-sm font-bold">저장</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3.5">
                          <span className="w-11 h-11 rounded-full bg-soft border border-line flex items-center justify-center text-[15px] font-bold shrink-0">{r.name?.[0] ?? "?"}</span>
                          <div className="flex-1 min-w-0">
                            <b className="text-[15px] block truncate">{r.name}</b>
                            <span className="text-[13px] text-sub block truncate">
                              {[r.side ? (r.side === "groom" ? "신랑측" : "신부측") : "", r.attendance === "attending" ? `${r.guests}명` : "", r.companionName ? `동반 ${r.companionName}` : ""].filter(Boolean).join(" · ") || fmt(r.submittedAt)}
                            </span>
                            {r.message && <span className="text-[13px] text-ink block mt-1 break-words">{r.message}</span>}
                            <span className="flex gap-1 -ml-1">
                              <button onClick={() => startEdit(i)} className="h-9 px-1.5 text-[13px] text-sub">수정</button>
                              <button onClick={() => removeRsvp(i)} className="h-9 px-1.5 text-[13px] text-[#b42318]">삭제</button>
                              <span className="h-9 px-1.5 text-xs text-sub inline-flex items-center">{fmt(r.submittedAt)}</span>
                            </span>
                          </div>
                          <span className={`h-[26px] px-2.5 rounded-full text-xs font-medium inline-flex items-center shrink-0 ${r.attendance === "attending" ? "bg-[#e8f6ee] text-[#1b6b43]" : "bg-[#f2f2f2] text-[#555]"}`}>
                            {r.attendance === "attending" ? "참석" : "불참"}
                          </span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
                <div className="rounded-2xl bg-soft border border-line px-4 py-3 text-[13px] text-sub flex justify-between">
                  <span>불참 {rsvps.length - attending.length}명</span>
                  <span>참석 총 인원 {totalGuests}명</span>
                </div>
              </>
            )
          )}

          {tab === "guestbook" && (
            messages.length === 0 ? (
              <div className="rounded-2xl border border-line p-10 text-center">
                <p className="text-[15px] font-bold text-ink">아직 축하 메시지가 없어요</p>
                <p className="text-[13px] text-sub mt-1.5">하객이 남긴 방명록 메시지가 여기에 표시돼요</p>
              </div>
            ) : (
              <>
                <ul>
                  {pageMessages.map((m) => (
                    <li key={m.id} className="border-t border-line first:border-t-0 py-3.5 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between gap-3">
                        <b className="text-[15px]">{m.name}</b>
                        <span className="text-xs text-sub">{fmt(m.submittedAt)}</span>
                      </div>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap text-ink">{m.message}</p>
                      <button onClick={() => removeMessage(m.id)} className="self-end h-9 px-1.5 text-[13px] text-[#b42318]">삭제</button>
                    </li>
                  ))}
                </ul>
                {messageTotalPages > 1 && (
                  <div className="flex items-center justify-center gap-4">
                    <button onClick={() => setMessagePage(p => Math.max(1, p - 1))} disabled={currentMessagePage === 1} className="h-11 px-3 text-sm text-ink disabled:opacity-30">이전</button>
                    <span className="text-[13px] text-sub">{currentMessagePage} / {messageTotalPages}</span>
                    <button onClick={() => setMessagePage(p => Math.min(messageTotalPages, p + 1))} disabled={currentMessagePage === messageTotalPages} className="h-11 px-3 text-sm text-ink disabled:opacity-30">다음</button>
                  </div>
                )}
              </>
            )
          )}
        </>
      ) : (
        isAdmin && (
          <div className="rounded-2xl border border-line p-12 text-center text-sm text-sub">위에서 고객을 선택하세요</div>
        )
      )}
    </div>
  );
}

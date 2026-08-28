"use client";

import { useCallback, useEffect, useState } from "react";
import type { RsvpEntry } from "@/app/api/rsvp/route";
import type { GuestbookEntry } from "@/app/api/guestbook/route";

interface Me {
  role: "admin" | "customer";
  file: string | null;
}

type Tab = "rsvp" | "guestbook";

export default function AdminPage() {
  const [me, setMe] = useState<Me | null>(null);
  const [slugs, setSlugs] = useState<string[]>([]);
  const [file, setFile] = useState("");
  const [tab, setTab] = useState<Tab>("rsvp");

  const [rsvps, setRsvps] = useState<RsvpEntry[]>([]);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<Partial<RsvpEntry>>({});

  const [messages, setMessages] = useState<GuestbookEntry[]>([]);

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
    loadRsvps(f);
    loadMessages(f);
  };

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
      body: JSON.stringify({ slug: file, index: i, ...draft }),
    });
    setEditIndex(null);
    await loadRsvps(file);
  };

  const removeRsvp = async (i: number) => {
    if (!confirm("이 응답을 삭제할까요?")) return;
    await fetch(`/api/rsvp?file=${file}&index=${i}`, { method: "DELETE" });
    await loadRsvps(file);
  };

  const removeMessage = async (i: number) => {
    if (!confirm("이 메시지를 삭제할까요?")) return;
    await fetch(`/api/guestbook?file=${file}&index=${i}`, { method: "DELETE" });
    await loadMessages(file);
  };

  const isCustomer = me?.role === "customer";
  const isAdmin = me?.role === "admin";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-5">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-800">하객 현황</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          {isCustomer ? "내 청첩장의 참석 여부와 축하 메시지를 확인하고 관리할 수 있습니다" : "고객을 선택하면 해당 청첩장의 참석 여부와 축하 메시지를 확인합니다"}
        </p>
      </div>

      {/* 클라이언트 셀렉터 (admin 전용) */}
      {isAdmin && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
          <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase mb-3">고객 선택</p>
          {slugs.length === 0 ? (
            <p className="text-xs text-gray-400">아직 RSVP 응답이 없습니다</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {slugs.map(s => (
                <button key={s} onClick={() => selectFile(s)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-full border transition-colors ${
                    file === s
                      ? "bg-gray-900 text-white border-gray-900"
                      : "border-gray-200 text-gray-600 hover:border-gray-400"
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 선택된 고객의 데이터 */}
      {file ? (
        <>
          {/* 요약 */}
          <div className="grid grid-cols-4 gap-3 sm:gap-4 mb-6">
            {[
              { label: "총 응답", value: rsvps.length, color: "text-gray-800" },
              { label: "참석", value: attending.length, color: "text-green-600" },
              { label: "예상 인원", value: totalGuests, color: "text-blue-600" },
              { label: "축하 메시지", value: messages.length, color: "text-pink-500" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white rounded-xl p-4 sm:p-5 shadow-sm text-center border border-gray-100">
                <p className={`text-2xl sm:text-3xl font-bold ${color}`}>{value}</p>
                <p className="text-[10px] sm:text-xs text-gray-400 mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* 탭 */}
          <div className="inline-flex bg-gray-100 rounded-xl p-1 mb-4">
            {([
              { key: "rsvp", label: `참석 여부 (${rsvps.length})` },
              { key: "guestbook", label: `축하 메시지 (${messages.length})` },
            ] as { key: Tab; label: string }[]).map(({ key, label }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  tab === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}>
                {label}
              </button>
            ))}
          </div>

          {tab === "rsvp" && (
            rsvps.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center text-gray-400 border border-gray-100">
                <p className="text-sm">아직 응답이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                {rsvps.map((r, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    {editIndex === i ? (
                      <div className="space-y-2">
                        <input value={draft.name ?? ""} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
                          placeholder="이름" className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs" />
                        <div className="flex gap-2">
                          <select value={draft.side ?? ""}
                            onChange={e => setDraft(d => ({ ...d, side: e.target.value as RsvpEntry["side"] }))}
                            className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs">
                            <option value="">신랑측/신부측</option>
                            <option value="groom">신랑측</option>
                            <option value="bride">신부측</option>
                          </select>
                          <select value={draft.attendance ?? "attending"}
                            onChange={e => setDraft(d => ({ ...d, attendance: e.target.value as RsvpEntry["attendance"] }))}
                            className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs">
                            <option value="attending">참석</option>
                            <option value="not_attending">불참</option>
                          </select>
                          <input value={draft.guests ?? ""} onChange={e => setDraft(d => ({ ...d, guests: e.target.value }))}
                            placeholder="인원" className="w-20 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs" />
                        </div>
                        <input value={draft.companionName ?? ""} onChange={e => setDraft(d => ({ ...d, companionName: e.target.value }))}
                          placeholder="동반인" className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs" />
                        <textarea value={draft.message ?? ""} onChange={e => setDraft(d => ({ ...d, message: e.target.value }))}
                          placeholder="메시지" rows={2} className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs" />
                        <div className="flex gap-2 justify-end">
                          <button onClick={cancelEdit} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500">취소</button>
                          <button onClick={() => saveEdit(i)} className="text-xs px-3 py-1.5 rounded-lg bg-gray-900 text-white">저장</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-800">
                            {r.name}
                            {r.side && (
                              <span className="ml-1.5 text-[10px] font-normal text-gray-400">
                                ({r.side === "groom" ? "신랑측" : "신부측"})
                              </span>
                            )}
                          </span>
                          {r.attendance === "attending"
                            ? <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">✓ 참석 {r.guests}명</span>
                            : <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">불참</span>
                          }
                        </div>
                        {r.companionName && <p className="text-xs text-gray-500 mb-1">동반인: {r.companionName}</p>}
                        {r.message && <p className="text-xs text-gray-500 mb-2">{r.message}</p>}
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] text-gray-400">
                            {new Date(r.submittedAt).toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                          </p>
                          <div className="flex gap-2">
                            <button onClick={() => startEdit(i)} className="text-[11px] text-gray-500 hover:text-gray-800">수정</button>
                            <button onClick={() => removeRsvp(i)} className="text-[11px] text-red-400 hover:text-red-600">삭제</button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 text-xs text-gray-400 flex justify-between">
                  <span>불참: {rsvps.length - attending.length}명</span>
                  <span>참석 총 인원: {totalGuests}명</span>
                </div>
              </div>
            )
          )}

          {tab === "guestbook" && (
            messages.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center text-gray-400 border border-gray-100">
                <p className="text-sm">아직 축하 메시지가 없습니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((m, i) => (
                  <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-medium text-gray-800">{m.name}</span>
                      <p className="text-[10px] text-gray-400">
                        {new Date(m.submittedAt).toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap mb-2">{m.message}</p>
                    <div className="flex justify-end">
                      <button onClick={() => removeMessage(i)} className="text-[11px] text-red-400 hover:text-red-600">삭제</button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      ) : (
        isAdmin && (
          <div className="bg-white rounded-xl p-12 text-center text-gray-400 border border-gray-100">
            <p className="text-sm">위에서 고객을 선택하세요</p>
          </div>
        )
      )}
    </div>
  );
}

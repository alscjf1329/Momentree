"use client";
import { useState } from "react";

// 문의 폼 — 서버가 세션으로 보낸 사람을 확인해 텔레그램으로만 전달한다. website는 봇 차단용 허니팟(사람에겐 숨김).
export default function ContactForm() {
  const [state, setState] = useState<string>("idle"); // idle | sending | done | 오류 메시지
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("sending");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(Object.fromEntries(f)),
    }).catch(() => null);
    if (res?.ok) return setState("done");
    setState((await res?.json().catch(() => null))?.error ?? "접수하지 못했어요. 잠시 후 다시 시도해 주세요");
  }
  if (state === "done") return <p className="mt-3 font-bold">문의가 접수됐어요. 가입하신 이메일로 답변드릴게요.</p>;
  return (
    <form onSubmit={submit} className="mt-3 space-y-2">
      <textarea name="message" required maxLength={1000} rows={6} placeholder="문의 내용 (최대 1000자)" className="w-full border border-line rounded px-3 py-2 bg-white" />
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <button disabled={state === "sending"} className="bg-rose text-white font-bold rounded px-4 h-11 disabled:opacity-50">보내기</button>
      {state !== "idle" && state !== "sending" && <p role="alert" className="text-rose break-words">{state}</p>}
      <p className="text-xs text-sub break-words">문의 내용은 저장하지 않고 담당자에게만 전달돼요.</p>
    </form>
  );
}

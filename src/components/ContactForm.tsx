"use client";
import { useState } from "react";

// 메일로 문의 폼 — 서버가 텔레그램으로만 전달한다. website는 봇 차단용 허니팟(사람에겐 숨김).
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
    setState((await res?.json().catch(() => null))?.error ?? "접수에 실패했습니다. 잠시 후 다시 시도해주세요");
  }
  if (state === "done") return <p className="mt-3 font-bold">문의가 접수되었습니다. 입력하신 이메일로 답변드릴게요.</p>;
  const field = "w-full border border-line rounded px-3 py-2 bg-white";
  return (
    <form onSubmit={submit} className="mt-3 space-y-2">
      <input name="name" maxLength={50} placeholder="이름 (선택)" className={field} />
      <input name="email" type="email" required maxLength={254} placeholder="회신 받을 이메일" className={field} />
      <textarea name="message" required maxLength={1000} rows={4} placeholder="문의 내용 (최대 1000자)" className={field} />
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <button disabled={state === "sending"} className="bg-rose text-white font-bold rounded px-4 py-2 disabled:opacity-50">보내기</button>
      {state !== "idle" && state !== "sending" && <p role="alert" className="text-rose">{state}</p>}
      <p className="text-xs text-sub">문의 내용은 서버에 저장하지 않고 운영자에게 알림으로만 전달됩니다.</p>
    </form>
  );
}

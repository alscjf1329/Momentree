"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [invited, setInvited] = useState(false);

  // 초대 메일의 링크(?email=)로 들어오면 이메일을 채워 둔다
  useEffect(() => {
    const e = new URLSearchParams(location.search).get("email");
    if (e) { setEmail(e.trim()); setInvited(true); }
    // 이미 로그인한 상태에서 초대 링크를 눌렀다면 (같은 이메일이면) 바로 편집 화면으로
    fetch("/api/admin/auth/me").then(r => r.ok ? r.json() : null).then(me => {
      if (me && (!e || me.email?.toLowerCase() === e.trim().toLowerCase())) router.replace(me.role === "customer" ? "/admin/setup" : "/admin");
    }).catch(() => {});
  }, [router]);

  const requestCode = async () => {
    if (!email) {
      setError("이메일을 입력하세요");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/auth/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "요청에 실패했습니다");
      setStep("verify");
    } catch (e) {
      setError(e instanceof Error ? e.message : "요청에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "인증에 실패했습니다");
      // 고객은 바로 청첩장 편집 화면으로, 관리자는 대시보드로
      router.push(data.role === "customer" ? "/admin/setup" : "/admin");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "인증에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const input = "w-full h-[52px] box-border border border-[#d4d4d4] focus:border-ink outline-none rounded-[14px] px-4 text-base text-ink bg-white";
  const primary = "w-full h-[52px] rounded-full bg-ink text-white text-base font-bold disabled:opacity-40";

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <div className="h-14 px-3 flex items-center">
        <button onClick={() => (step === "verify" ? setStep("request") : router.push("/"))} aria-label="뒤로"
          className="w-11 h-11 flex items-center justify-center text-ink">
          <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
      </div>

      <div className="flex-1 w-full max-w-sm mx-auto px-6 pt-3 flex flex-col gap-6">
        <div className="flex flex-col gap-2.5">
          <h1 className="font-serif font-semibold text-[30px] leading-[1.3] tracking-tight text-ink">
            {step === "verify" ? "코드를 입력하세요" : invited ? "함께 편집해요" : "이메일로 시작해요"}
          </h1>
          <p className="text-[15px] leading-relaxed text-sub">
            {step === "verify"
              ? `${email}로 보낸 6자리 코드를 입력해 주세요. 5분 안에 입력해야 해요.`
              : invited
              ? "초대받은 이메일로 인증 코드를 받아 로그인하면 바로 편집 화면이 열려요."
              : "인증 코드를 보내드려요. 처음이면 계정이 자동으로 만들어져요."}
          </p>
        </div>

        {step === "request" ? (
          <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); requestCode(); }}>
            <label className="flex flex-col gap-2 text-[13px] text-sub">이메일
              <input value={email} onChange={(e) => setEmail(e.target.value.trim())} placeholder="name@example.com"
                type="email" autoComplete="email" autoFocus={!invited} className={input} />
            </label>
            <button type="submit" disabled={loading} className={primary}>{loading ? "발송 중…" : "인증 코드 받기"}</button>
          </form>
        ) : (
          <form className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); if (code.length === 6) verifyCode(); }}>
            {/* iOS/Android가 문자·메일의 코드를 자동 제안하도록 one-time-code */}
            <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric" autoComplete="one-time-code" placeholder="000000" aria-label="인증 코드 6자리" autoFocus
              className={`${input} text-center text-[28px] font-bold tracking-[0.4em] h-16`} />
            <button type="submit" disabled={loading || code.length !== 6} className={primary}>{loading ? "확인 중…" : "확인"}</button>
            <button type="button" onClick={requestCode} disabled={loading} className="h-11 text-sm text-sub underline underline-offset-4">코드 다시 받기</button>
          </form>
        )}

        {error && <p role="alert" className="text-sm text-[#b42318]">{error}</p>}
      </div>

      <p className="py-6 px-6 text-center text-xs leading-relaxed text-sub">
        계속하면 <a href="/terms" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">이용약관</a>·
        <a href="/privacy" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">개인정보처리방침</a>에 동의하게 돼요.
        <br />로그인하면 이 기기에서 7일간 유지돼요
      </p>
    </div>
  );
}

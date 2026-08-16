"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      router.push("/admin");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "인증에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100dvh" }} className="flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-gray-800 mb-1">로그인</h1>
        <p className="text-xs text-gray-400 mb-6">
          등록된 이메일로 인증 코드를 보내드립니다
        </p>

        {step === "request" ? (
          <>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              placeholder="이메일 주소"
              type="email"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && requestCode()}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm mb-3"
            />
            <button
              onClick={requestCode}
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50"
              style={{ background: "var(--color-primary-dark, #1f2937)" }}
            >
              {loading ? "발송 중..." : "인증 코드 받기"}
            </button>
          </>
        ) : (
          <>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6자리 코드"
              inputMode="numeric"
              autoFocus
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm mb-3 text-center tracking-[0.3em] font-mono"
            />
            <button
              onClick={verifyCode}
              disabled={loading || code.length !== 6}
              className="w-full py-2.5 rounded-lg text-sm font-medium text-white disabled:opacity-50"
              style={{ background: "var(--color-primary-dark, #1f2937)" }}
            >
              {loading ? "확인 중..." : "확인"}
            </button>
            <button
              onClick={requestCode}
              disabled={loading}
              className="w-full mt-2 py-2 text-xs text-gray-400 hover:text-gray-600"
            >
              코드 다시 받기
            </button>
          </>
        )}

        {error && <p className="text-xs text-red-500 mt-3">{error}</p>}
      </div>
    </div>
  );
}

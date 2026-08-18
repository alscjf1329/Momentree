"use client";

import { useEffect, useState } from "react";

interface Me {
  role: "admin" | "customer";
  superAdmin: boolean;
}

export default function AdminsManager() {
  const [me, setMe] = useState<Me | null>(null);
  const [superAdminEmail, setSuperAdminEmail] = useState("");
  const [admins, setAdmins] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await fetch("/api/admin/admins");
    if (!res.ok) return;
    const data = await res.json();
    setSuperAdminEmail(data.superAdmin ?? "");
    setAdmins(data.admins ?? []);
  };

  useEffect(() => {
    fetch("/api/admin/auth/me").then(r => r.ok ? r.json() : null).then((data: Me | null) => {
      setMe(data);
      if (data?.superAdmin) load();
    }).catch(() => {});
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "추가에 실패했습니다");
        return;
      }
      setEmail("");
      await load();
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (target: string) => {
    if (!confirm(`${target} 관리자 권한을 삭제할까요?`)) return;
    await fetch(`/api/admin/admins?email=${encodeURIComponent(target)}`, { method: "DELETE" });
    await load();
  };

  if (!me) return null;

  if (!me.superAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 text-center text-sm text-gray-400">
        최상위 운영자만 접근할 수 있습니다
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="mb-5">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-800">관리자 관리</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          추가된 이메일은 최상위 운영자와 동일하게 모든 고객을 관리할 수 있습니다
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-4">
        <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase mb-2">최상위 운영자</p>
        <p className="text-sm text-gray-700 font-mono">{superAdminEmail}</p>
      </div>

      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="추가할 관리자 이메일"
          required
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
        />
        <button
          type="submit"
          disabled={!email || loading}
          className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm disabled:opacity-40"
        >
          추가
        </button>
      </form>
      {error && <p className="text-xs text-red-500 mb-4">{error}</p>}

      <div className="space-y-2">
        {admins.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">추가된 관리자가 없습니다</p>
        ) : (
          admins.map(a => (
            <div key={a} className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3">
              <span className="text-sm text-gray-700 font-mono">{a}</span>
              <button
                onClick={() => handleRemove(a)}
                className="text-xs text-red-400 hover:text-red-600"
              >
                삭제
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

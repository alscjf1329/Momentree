"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import SupportLink from "@/components/SupportLink";
import { SUPPORT } from "@/lib/support";
import { Suspense, useEffect, useState } from "react";

const ICONS: Record<string, React.ReactNode> = {
  "/admin": <><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8" /></>,
  "/admin/setup": <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" /></>,
  "/admin/templates": <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  "/admin/admins": <><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z" /></>,
};

interface Me {
  role: "admin" | "customer";
  file: string | null;
  email: string | null;
  superAdmin: boolean;
  label: string | null;
  memberRole: string | null;
  files: { file: string; role: string; label: string }[];
}

function Icon({ d }: { d: string }) {
  return (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {ICONS[d]}
    </svg>
  );
}

function NavInner() {
  const path = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const file = searchParams.get("file") ?? "";
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    fetch("/api/admin/auth/me").then(r => r.ok ? r.json() : null).then(setMe).catch(() => {});
  }, []);

  const isCustomer = me?.role === "customer";
  const nav = [
    { href: "/admin", label: "하객" },
    { href: "/admin/setup", label: isCustomer ? "편집" : "고객 설정" },
    { href: "/admin/templates", label: "템플릿" },
    ...(me?.superAdmin ? [{ href: "/admin/admins", label: "관리자" }] : []),
  ];

  const logout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const switchTo = async (f: string) => {
    const r = await fetch("/api/admin/auth/switch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ file: f }) });
    if (r.ok) location.href = "/admin/setup";
  };

  const active = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));
  // 운영자는 선택한 고객(?file=)을 유지한 채 이동 (고객은 항상 자기 청첩장에 고정)
  const href = (base: string) => (!isCustomer && file ? `${base}?file=${file}` : base);
  const initial = (me?.email ?? "?")[0].toUpperCase();
  const shareHref = isCustomer ? "/admin/share" : file ? `/admin/share?file=${file}` : null;
  const multi = isCustomer && (me?.files.length ?? 0) > 1;

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-line">
        <div className="px-4 sm:px-6 h-14 flex items-center gap-3 max-w-6xl mx-auto">
          <Link href="/" className="font-serif font-semibold text-[21px] tracking-tight text-ink shrink-0">momentree</Link>

          {/* 넓은 화면: 위쪽 탭 */}
          <nav className="hidden sm:flex items-center gap-1 flex-1 ml-4">
            {nav.map(({ href: base, label }) => (
              <Link key={base} href={href(base)}
                className={`px-4 h-9 inline-flex items-center rounded-full text-sm transition-colors ${active(base) ? "bg-ink text-white font-medium" : "text-sub hover:bg-soft"}`}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex-1 sm:hidden" />

          {!isCustomer && file && (
            <span className="text-[11px] font-mono px-2.5 py-1 bg-soft rounded-full text-sub max-w-[120px] truncate hidden sm:block">{file}</span>
          )}

          {shareHref && (
            <Link href={shareHref} aria-label="청첩장 공유"
              className="w-10 h-10 rounded-full border border-[#d4d4d4] inline-flex items-center justify-center text-ink hover:bg-soft shrink-0">
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v7a1 1 0 001 1h14a1 1 0 001-1v-7" /><path d="M16 6l-4-4-4 4" /><path d="M12 2v13" /></svg>
            </Link>
          )}

          {/* 계정 메뉴 */}
          <details className="relative shrink-0 group">
            <summary aria-label="내 계정" className="list-none cursor-pointer [&::-webkit-details-marker]:hidden w-10 h-10 rounded-full p-[2px]"
              style={{ background: "linear-gradient(135deg,#F6A5BE,#C2255C)" }}>
              <span className="w-full h-full rounded-full border-2 border-white bg-rose-soft text-rose text-sm font-bold flex items-center justify-center">{initial}</span>
            </summary>
            <div className="absolute right-0 top-12 w-64 bg-white border border-line rounded-2xl shadow-lg p-2 text-sm">
              <div className="px-3 py-2">
                <p className="font-medium text-ink truncate">{me?.email ?? ""}</p>
                {isCustomer && <p className="text-xs text-sub truncate">{me?.memberRole === "editor" ? `${me.label || "청첩장"} · 함께 편집 중` : "내 청첩장"}</p>}
              </div>
              {multi && (
                <div className="border-t border-line py-1">
                  <p className="px-3 py-1 text-xs text-sub">청첩장 전환</p>
                  {me!.files.map(f => (
                    <button key={f.file} onClick={() => switchTo(f.file)}
                      className={`w-full text-left px-3 h-11 rounded-xl hover:bg-soft truncate ${f.file === me!.file ? "font-bold text-ink" : "text-ink"}`}>
                      {f.label || f.file} <span className="text-xs text-sub">· {f.role === "owner" ? "내 청첩장" : "함께 편집"}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="border-t border-line pt-1">
                <Link href="/" className="flex items-center px-3 h-11 rounded-xl hover:bg-soft text-ink">홈으로</Link>
                <Link href="/faq" className="flex items-center px-3 h-11 rounded-xl hover:bg-soft text-ink">자주 묻는 질문</Link>
                {SUPPORT.kind === "kakao" && <SupportLink className="flex items-center px-3 h-11 rounded-xl hover:bg-soft text-ink" />}
                <button onClick={logout} className="w-full text-left px-3 h-11 rounded-xl hover:bg-soft text-ink">로그아웃</button>
              </div>
            </div>
          </details>
        </div>
      </header>

      {/* 좁은 화면: 아래 탭 (엄지가 닿는 곳) */}
      <nav aria-label="주 메뉴" className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-line flex"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        {nav.map(({ href: base, label }) => (
          <Link key={base} href={href(base)} aria-current={active(base) ? "page" : undefined}
            className={`flex-1 h-16 flex flex-col items-center justify-center gap-0.5 text-xs ${active(base) ? "text-ink font-bold" : "text-sub"}`}>
            <Icon d={base} />
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}

export default function AdminNav() {
  const path = usePathname();
  if (path === "/admin/login") return null;
  return (
    <Suspense fallback={<header className="sticky top-0 z-50 bg-white border-b border-line h-14" />}>
      <NavInner />
    </Suspense>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

const NAV = [
  { href: "/admin", label: "하객 현황" },
  { href: "/admin/setup", label: "고객 설정" },
  { href: "/admin/templates", label: "템플릿" },
];

function NavInner() {
  const path = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const file = searchParams.get("file") ?? "";

  const logout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const active = (href: string) =>
    href === "/admin" ? path === "/admin" : path.startsWith(href);

  // 파일 컨텍스트 유지하며 링크 생성
  const href = (base: string) => file ? `${base}?file=${file}` : base;

  return (
    <div className="px-4 sm:px-6 h-14 flex items-center gap-2 max-w-6xl mx-auto">
      {/* 로고 */}
      <Link href="/"
        className="font-serif text-sm tracking-widest shrink-0 hidden sm:block"
        style={{ color: "var(--color-primary-dark)" }}>
        Momentree
      </Link>
      <span className="text-gray-200 hidden sm:block text-xs">|</span>

      {/* 탭 */}
      <nav className="flex items-center gap-0.5 flex-1 overflow-x-auto"
        style={{ scrollbarWidth: "none" }}>
        {NAV.map(({ href: base, label }) => (
          <Link key={base} href={href(base)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0"
            style={active(base)
              ? { background: "var(--color-primary-dark)", color: "#fff" }
              : { color: "#666" }}>
            {label}
          </Link>
        ))}
      </nav>

      {/* 현재 선택된 파일 */}
      {file && (
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] text-gray-400 hidden sm:block">파일</span>
          <span className="text-[11px] font-mono px-2.5 py-1 bg-gray-100 rounded-lg text-gray-600 max-w-[120px] truncate">
            {file}
          </span>
        </div>
      )}

      {/* 홈 */}
      <Link href="/"
        className="text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 shrink-0 hidden sm:block">
        ← 홈
      </Link>

      {/* 로그아웃 */}
      <button onClick={logout}
        className="text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-400 hover:bg-gray-50 shrink-0">
        로그아웃
      </button>
    </div>
  );
}

export default function AdminNav() {
  const path = usePathname();
  if (path === "/admin/login") return null;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100"
      style={{ boxShadow: "0 1px 0 rgba(0,0,0,0.04)" }}>
      <Suspense fallback={
        <div className="px-4 sm:px-6 h-14 flex items-center gap-2 max-w-6xl mx-auto">
          <nav className="flex items-center gap-0.5 flex-1">
            {NAV.map(({ href, label }) => (
              <Link key={href} href={href}
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-gray-400 whitespace-nowrap">
                {label}
              </Link>
            ))}
          </nav>
        </div>
      }>
        <NavInner />
      </Suspense>
    </header>
  );
}

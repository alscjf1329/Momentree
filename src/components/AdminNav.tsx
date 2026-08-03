"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "RSVP 현황" },
  { href: "/admin/setup", label: "고객 설정" },
  { href: "/admin/templates", label: "템플릿" },
];

export default function AdminNav() {
  const path = usePathname();
  const active = (href: string) =>
    href === "/admin" ? path === "/admin" : path.startsWith(href);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100"
      style={{ boxShadow: "0 1px 0 rgba(0,0,0,0.04)" }}>
      <div className="px-4 sm:px-6 h-14 flex items-center gap-3 max-w-5xl mx-auto">
        {/* 로고 — 데스크탑만 */}
        <Link href="/"
          className="font-serif text-base tracking-widest shrink-0 hidden sm:block"
          style={{ color: "var(--color-primary-dark)" }}>
          Momentree
        </Link>
        <span className="text-gray-200 hidden sm:block">|</span>

        {/* 탭 — 모바일에서 스크롤 가능 */}
        <nav className="flex items-center gap-1 overflow-x-auto flex-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {NAV.map(({ href, label }) => (
            <Link key={href} href={href}
              className="px-4 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap shrink-0"
              style={active(href)
                ? { background: "var(--color-primary-dark)", color: "#fff" }
                : { color: "#666" }}>
              {label}
            </Link>
          ))}
        </nav>

        {/* 사이트로 */}
        <Link href="/"
          className="text-xs px-3 py-1.5 border border-gray-200 rounded-full text-gray-500 hover:bg-gray-50 shrink-0">
          ← 홈
        </Link>
      </div>
    </header>
  );
}

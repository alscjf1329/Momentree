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
    <header
      className="sticky top-0 z-50 bg-white border-b border-gray-100"
      style={{ boxShadow: "0 1px 0 rgba(0,0,0,0.04)" }}
    >
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
        {/* 로고 */}
        <Link
          href="/"
          className="font-serif text-base tracking-widest shrink-0"
          style={{ color: "var(--color-primary-dark)" }}
        >
          Momentree
        </Link>

        {/* 탭 네비 */}
        <nav className="flex items-center gap-1">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-4 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={
                active(href)
                  ? { background: "var(--color-primary-dark)", color: "#fff" }
                  : { color: "#666" }
              }
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* 사이트 미리보기 */}
        <Link
          href="/"
          className="text-xs px-3 py-1.5 border border-gray-200 rounded-full text-gray-500 hover:bg-gray-50 shrink-0 hidden sm:block"
        >
          ← 사이트
        </Link>
      </div>
    </header>
  );
}

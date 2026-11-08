"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MembersCard from "@/components/admin/MembersCard";
import SubPageHeader from "@/components/admin/SubPageHeader";

// 함께 편집 — 소유자·관리자만 (편집자는 목록을 보지 못하고 편집 화면으로 돌려보낸다)
export default function MembersView() {
  const fileParam = useSearchParams().get("file") ?? "";
  const [state, setState] = useState<{ file: string; admin: boolean } | "denied" | null>(null);

  useEffect(() => {
    fetch("/api/admin/auth/me").then(r => r.ok ? r.json() : null).then(me => {
      if (!me) return setState("denied");
      if (me.role === "admin") return setState({ file: fileParam, admin: true });
      setState(me.memberRole === "owner" && me.file ? { file: me.file, admin: false } : "denied");
    }).catch(() => setState("denied"));
  }, [fileParam]);

  return (
    <div className="bg-white min-h-[calc(100dvh-56px)]">
      <SubPageHeader title="함께 편집" back={fileParam ? `/admin/setup?file=${fileParam}` : "/admin/setup"} />
      <div className="max-w-2xl mx-auto px-5 pt-6 pb-10">
        {state === null ? <p className="text-sm text-sub">불러오는 중…</p>
          : state === "denied" ? <p className="text-sm text-sub">소유자만 멤버를 관리할 수 있어요.</p>
          : state.file ? <MembersCard file={state.file} admin={state.admin} />
          : <p className="text-sm text-sub">고객을 먼저 선택해 주세요.</p>}
      </div>
    </div>
  );
}

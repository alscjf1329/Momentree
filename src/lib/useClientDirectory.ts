"use client";

import { useCallback, useEffect, useState } from "react";
import { TEMPLATE_NAMES } from "@/lib/templateNames";

export interface ClientSummary {
  file: string;
  shareId: string;
  label: string; // "홍길동 ♥ 김지수" — 오래된 파일은 다시 저장되기 전까지 빈 값
  owner: string;
  weddingDate: string;
  template: string;
  updatedAt: string;
}

// 어드민 고객 목록: 파일명 대신 표시 이름으로 보여주고, 이름·이메일·고객ID·파일명·예식일로 검색한다.
export function useClientDirectory() {
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [q, setQ] = useState("");

  const reload = useCallback(() => {
    fetch("/api/clients?detail=1")
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setClients(d))
      .catch(() => {});
  }, []);
  useEffect(reload, [reload]);

  const keyword = q.trim().toLowerCase();
  const filtered = clients
    .filter((c) => !keyword || [c.label, c.owner, c.file, c.shareId, c.weddingDate, TEMPLATE_NAMES[c.template] ?? ""].some((v) => v.toLowerCase().includes(keyword)))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)); // 최근 수정 순

  // 목록 한 줄: "홍길동 ♥ 김지수 · 2026-10-18 · 클래식" (메타 없는 파일은 파일명)
  const display = (c: ClientSummary) =>
    c.label ? `${c.label}${c.weddingDate ? ` · ${c.weddingDate.slice(0, 10)}` : ""} · ${TEMPLATE_NAMES[c.template] ?? c.template}` : c.file;

  return { clients: filtered, total: clients.length, q, setQ, reload, display };
}

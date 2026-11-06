"use client";

import { useEffect, useState } from "react";

// 공유 링크 쿼리: 공개 ID가 오면 id=, 로딩 중에는 file= (어드민 화면에서만 잠깐 보임)
export function useInviteQuery(file: string): string {
  const [id, setId] = useState("");
  useEffect(() => {
    setId("");
    if (!file) return;
    fetch(`/api/share?file=${encodeURIComponent(file)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.id && setId(d.id))
      .catch(() => {});
  }, [file]);
  return id ? `id=${id}` : `file=${file}`;
}

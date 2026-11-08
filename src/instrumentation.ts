// 서버 기동 시 한 번 호출 — 하객 데이터 보관 정책 워커 시작 (Node 런타임에서만)
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") (await import("@/lib/retention")).startRetentionWorker();
}

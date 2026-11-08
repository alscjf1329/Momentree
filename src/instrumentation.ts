// 서버 기동 시 한 번 호출 — 하객 데이터 보관 정책 워커 시작 (Node 런타임에서만)
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") (await import("@/lib/retention")).startRetentionWorker();
}

// 서버 오류(500) 발생 시 운영자에게 텔레그램 알림. 같은 메시지는 10분에 1번(notifyOnce).
// 프로덕션에선 err.message가 가려질 수 있어 digest도 함께 보낸다.
export async function onRequestError(err: unknown, request: { path: string }) {
  const e = err as { message?: string; digest?: string };
  const { notifyOnce } = await import("@/lib/notify");
  await notifyOnce(`[오류] ${request.path} / ${String(e?.message ?? err).slice(0, 200)}${e?.digest ? ` (${e.digest})` : ""}`);
}

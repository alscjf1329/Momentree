import type { NextRequest } from "next/server";

const hits = new Map<string, number[]>();

// ponytail: 프로세스 메모리 기반 — 인스턴스 1개 전제(SQLite 단일 파일 DB와 동일), 재시작 시 초기화. 다중 인스턴스가 되면 Redis 등으로 교체.
// key별로 windowMs 안에 max회를 넘기면 true(차단). 호출 자체가 1회 시도로 집계된다.
export function isRateLimited(key: string, max: number, windowMs: number, now = Date.now()): boolean {
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 10_000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= windowMs)) hits.delete(k);
  }
  return false;
}

// ponytail: 프록시(nginx 등) 뒤에서만 신뢰 가능한 x-forwarded-for 첫 값. 프록시 없이 직접 노출되면 위조 가능.
export function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
}

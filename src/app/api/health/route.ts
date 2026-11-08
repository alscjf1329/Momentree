import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { DATA_DIR } from "@/lib/paths";

export const dynamic = "force-dynamic";

// 헬스체크: DB 응답 + 메일 큐 failed 건수. 내부 정보(경로·에러 원문)는 노출하지 않는다.
export async function GET() {
  try {
    getDb().prepare("SELECT 1").get();
    let failedMail = 0;
    try { failedMail = fs.readdirSync(path.join(DATA_DIR, "mail-queue", "failed")).length; } catch {}
    return NextResponse.json({ ok: true, failedMail });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getSession } from "@/lib/session";
import { isValidClientFilename } from "@/lib/newClient";
import { getOrCreateShareId } from "@/lib/shareId";
import { DATA_DIR } from "@/lib/paths";

// GET /api/share?file=x → 공유 링크용 공개 ID (customer는 자기 파일, admin은 지정한 파일)
export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const file = session.role === "customer" ? session.file : req.nextUrl.searchParams.get("file");
  if (!file || !isValidClientFilename(file)) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }
  const exists = await fs.access(path.join(DATA_DIR, "clients", `${file}.json`)).then(() => true, () => false);
  if (!exists) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json({ id: await getOrCreateShareId(file) });
}
